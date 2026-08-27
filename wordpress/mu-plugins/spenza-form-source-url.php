<?php
/**
 * Plugin Name: Spenza — real source page on a lead entry
 * Description: Files a Gravity Forms entry against the page the visitor was actually on, rather than the URL the static site replayed the submission to. Read-only apart from that one column; adds nothing to the admin or the front end.
 * Version:     1.0.0
 *
 * WHY THIS EXISTS
 * Leads are captured by the static site and replayed here so Gravity Forms
 * sends its notifications. Gravity Forms files an entry against the URL the
 * POST arrived at — and that URL is the replay's, not the visitor's.
 *
 * For most forms that is merely the wrong host: the mirrored `action` is the
 * page the form was captured on, so a lead from a blog post lands on the same
 * path under preprod. For the "Get Started" popup it is worse than that. Its
 * `action` is `/`, on every one of the ~270 pages it appears on, so every
 * popup lead in the system is filed against the preprod homepage.
 *
 * That is the field the notification email needs. HubSpot has always had it —
 * the site sends it as `context.pageUri`, which is why HubSpot's alert could
 * say "submitted a form on the page MVNO Launch Cost Calculator" and Gravity
 * Forms' could not. `hubspot-forms.js` now sends the same value here, and this
 * is what reads it back, so `{embed_url}` in a notification and the Source URL
 * column in the entry list both name the page the visitor really saw.
 *
 * WHY A MU-PLUGIN
 * Drop-in file under wp-content/mu-plugins/ — loads automatically, needs no
 * activation, survives theme updates, and is removed by deleting the file.
 *
 * SAFETY
 * One column on one row, written once per submission. Nothing is sent, no
 * notification is triggered, and no form or setting is edited, so removing the
 * file restores the previous behaviour exactly — past entries keep whatever
 * this wrote, which is the more accurate of the two values anyway.
 *
 * The URL arrives in a public POST, so it is treated as hostile: parsed,
 * required to be http(s), and required to be on a spenza.com host before it is
 * stored. `update_entry_property` writes a single column and fires no entry
 * hooks, so it cannot loop back into this file.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The page the visitor was on, as sent by the site's own form script.
 *
 * @return string Empty unless a usable spenza.com URL was posted.
 */
function spenza_source_url_from_request() {
	$url = isset( $_POST['spenza_source_url'] ) ? wp_unslash( $_POST['spenza_source_url'] ) : '';

	if ( ! is_string( $url ) || '' === $url ) {
		return '';
	}

	$url   = esc_url_raw( trim( $url ) );
	$parts = $url ? wp_parse_url( $url ) : false;

	if ( ! $parts || empty( $parts['host'] ) || empty( $parts['scheme'] ) ) {
		return '';
	}

	if ( ! in_array( strtolower( $parts['scheme'] ), array( 'http', 'https' ), true ) ) {
		return '';
	}

	$host = strtolower( $parts['host'] );

	if ( 'spenza.com' !== $host && '.spenza.com' !== substr( $host, -11 ) ) {
		return '';
	}

	// Gravity Forms stores this column at 200 characters.
	return substr( $url, 0, 200 );
}

/**
 * Put it on the entry.
 *
 * `gform_entry_post_save` rather than an earlier hook because the entry needs
 * an id before a column of it can be updated. The returned array is what the
 * notifications then read, so the email and the stored row agree.
 */
function spenza_source_url_apply( $entry, $form ) {
	$url = spenza_source_url_from_request();

	if ( '' === $url || empty( $entry['id'] ) || ! class_exists( 'GFAPI' ) ) {
		return $entry;
	}

	if ( isset( $entry['source_url'] ) && $entry['source_url'] === $url ) {
		return $entry;
	}

	$entry['source_url'] = $url;
	GFAPI::update_entry_property( (int) $entry['id'], 'source_url', $url );

	return $entry;
}
add_filter( 'gform_entry_post_save', 'spenza_source_url_apply', 10, 2 );
