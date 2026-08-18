<?php
/**
 * Plugin Name: Spenza — publish hook for the Astro site
 * Description: Tells GitHub Actions to rebuild the Astro site when a post or case study is published, edited, unpublished or trashed. Read-only; adds nothing to the admin or the front end.
 * Version:     1.0.0
 *
 * WHY THIS EXISTS
 * The Astro site is static files in S3, so nothing an editor does here reaches a
 * reader until a build runs. A scheduled job already runs every 30 minutes; this
 * removes the wait by telling GitHub the moment something changes. The schedule
 * stays as a backstop — if this hook fails, is throttled, or the site is down,
 * the change is still picked up within half an hour.
 *
 * WHY A MU-PLUGIN
 * Drop-in file under wp-content/mu-plugins/ — loads automatically, needs no
 * activation, survives theme updates, and is removed by deleting the file.
 *
 * SAFETY
 * The token is read from a constant in wp-config.php and never stored here or in
 * the database. Every entry point is guarded: no token, no request. Failures are
 * logged and swallowed, because a deploy webhook must never be able to stop an
 * editor saving a post. Requests are throttled so a burst of edits costs one
 * build rather than ten.
 *
 * SETUP
 * Add to wp-config.php, above "That's all, stop editing":
 *
 *     define( 'SPENZA_DEPLOY_TOKEN', 'ghp_xxxxxxxxxxxxxxxxxxxx' );
 *
 * The token is a GitHub personal access token that can dispatch to the site
 * repository. Classic: `repo` scope. Fine-grained: Contents read/write on
 * rajatraikar-spenza/Spenza-astro.js-based.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Where to send it. Override in wp-config.php if the repository ever moves. */
if ( ! defined( 'SPENZA_DEPLOY_REPO' ) ) {
	define( 'SPENZA_DEPLOY_REPO', 'rajatraikar-spenza/Spenza-astro.js-based' );
}

/**
 * Post types the Astro site renders headlessly.
 *
 * Only `post` — blogs and case studies are both regular posts, and they are the
 * only content the front end reads from WordPress at build time. Pages are
 * mirrored HTML that a rebuild would not change, so dispatching for them would
 * spend a build to produce a byte-identical site.
 */
function spenza_deploy_watched_types() {
	return (array) apply_filters( 'spenza_deploy_watched_types', array( 'post' ) );
}

/**
 * Ask GitHub to run the Publish workflow.
 *
 * Throttled: saving in Gutenberg fires several transitions in a row, and a
 * publish-then-immediately-fix-a-typo is normal editing behaviour. One build
 * covers all of it. Anything suppressed here is still caught by the schedule.
 */
function spenza_deploy_dispatch( $reason ) {
	if ( ! defined( 'SPENZA_DEPLOY_TOKEN' ) || ! SPENZA_DEPLOY_TOKEN ) {
		return; // Not configured. Silence is correct: the schedule still runs.
	}

	if ( get_transient( 'spenza_deploy_recent' ) ) {
		return;
	}
	set_transient( 'spenza_deploy_recent', 1, 90 );

	$response = wp_remote_post(
		'https://api.github.com/repos/' . SPENZA_DEPLOY_REPO . '/dispatches',
		array(
			// Short, and failure is non-fatal — an editor must never wait on
			// GitHub, and must never see a save fail because of it.
			'timeout'  => 5,
			'blocking' => true,
			'headers'  => array(
				'Accept'               => 'application/vnd.github+json',
				'Authorization'        => 'Bearer ' . SPENZA_DEPLOY_TOKEN,
				'X-GitHub-Api-Version' => '2022-11-28',
				'Content-Type'         => 'application/json',
				'User-Agent'           => 'spenza-deploy-hook',
			),
			'body'     => wp_json_encode(
				array(
					'event_type'     => 'wordpress-content',
					'client_payload' => array( 'reason' => $reason ),
				)
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		error_log( '[spenza-deploy] dispatch failed: ' . $response->get_error_message() );
		return;
	}

	$code = wp_remote_retrieve_response_code( $response );
	if ( 204 !== $code ) {
		// 401 means the token is wrong or expired; 404 usually means the token
		// cannot see the repository, which looks the same from outside.
		error_log( '[spenza-deploy] dispatch returned HTTP ' . $code . ': ' . wp_remote_retrieve_body( $response ) );
	}
}

/**
 * Every change that alters what the site should show.
 *
 * `transition_post_status` covers all of them in one hook: publish, update of an
 * already-published post, unpublish, trash and restore. Firing only when one
 * side of the transition is `publish` keeps draft-to-draft editing — the bulk of
 * what an author does — from triggering builds nobody will see.
 */
add_action(
	'transition_post_status',
	function ( $new_status, $old_status, $post ) {
		if ( ! $post instanceof WP_Post ) {
			return;
		}
		if ( ! in_array( $post->post_type, spenza_deploy_watched_types(), true ) ) {
			return;
		}
		if ( wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) ) {
			return;
		}
		if ( 'publish' !== $new_status && 'publish' !== $old_status ) {
			return;
		}

		spenza_deploy_dispatch( sprintf( '%s %s: %s -> %s', $post->post_type, $post->post_name, $old_status, $new_status ) );
	},
	10,
	3
);

/**
 * A permanently deleted post leaves a route behind until the next build.
 *
 * `transition_post_status` does not fire on delete, only on the trash step
 * before it — and a post can be deleted straight from the trash days later.
 */
add_action(
	'before_delete_post',
	function ( $post_id, $post = null ) {
		$post = $post instanceof WP_Post ? $post : get_post( $post_id );
		if ( ! $post || ! in_array( $post->post_type, spenza_deploy_watched_types(), true ) ) {
			return;
		}
		spenza_deploy_dispatch( 'deleted ' . $post->post_type . ': ' . $post->post_name );
	},
	10,
	2
);
