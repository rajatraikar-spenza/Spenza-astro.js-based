<?php
/**
 * Plugin Name: Spenza — lead submission endpoint
 * Description: Accepts a lead from the static site over admin-ajax and hands it to Gravity Forms, so entries and notifications survive the Coming Soon page. Submits to an allowlisted form id and nothing else.
 * Version:     1.0.0
 *
 * WHY THIS EXISTS
 * The static site captures a lead and replays it to WordPress so Gravity Forms
 * sends the admin alert and the client reply. That replay is an ordinary POST
 * to a front-end page URL, and it works right up until the host puts the site
 * behind Hostinger's "Coming Soon" page.
 *
 * Then it fails in the worst available way. The placeholder answers 200, PHP
 * never reaches Gravity Forms, no entry is written and no mail is sent — and
 * because the replay is a `no-cors` request whose response is opaque by
 * design, the browser cannot tell 200-from-the-placeholder from
 * 200-from-a-real-submission. Nothing errors. The visitor still sees the
 * thank-you. HubSpot still gets the contact, so no dashboard looks wrong.
 * Every lead that arrives during that window silently tells nobody.
 *
 * `admin-ajax.php` is not behind that gate — the Coming Soon page hooks
 * front-end template rendering, and admin-ajax answers anonymous callers with
 * 200 regardless. Measured, not assumed: with the placeholder up, a GET of
 * `/ai-phone-number/` returns the Coming Soon HTML while
 * `admin-ajax.php?action=heartbeat` returns JSON.
 *
 * The REST API is the other candidate and is the wrong one: this install gates
 * `/wp-json/` to logged-in callers at `rest_authentication_errors`, which runs
 * before any route's permission callback, so a public route there would be
 * refused before it existed.
 *
 * WHAT ELSE IT BUYS
 * A readable answer. The old replay could only report that it *sent*; this
 * returns JSON with CORS headers, so `hubspot-forms.js` finally knows whether
 * the entry was written and can say so in the console instead of guessing.
 *
 * SAFETY
 * Public by necessity — the visitor is anonymous. So the surface is kept
 * narrow rather than trusted:
 *
 *   - Only the form ids in SPENZA_LEAD_FORMS are accepted. Without that this
 *     would submit to any form in the install, including ones with different
 *     notifications and recipients.
 *   - Only `input_*` and the two `spenza_*` fields are read. Nothing else in
 *     the POST reaches Gravity Forms.
 *   - CORS is echoed only for an allowlisted origin, so a page on someone
 *     else's domain cannot read the response.
 *   - A per-IP throttle blunts a flood without needing a secret the browser
 *     would have to carry (and therefore leak).
 *   - `GFAPI::submit_form()` runs the form's own validation, honeypot and
 *     Akismet handling. This does not bypass any of it — it is the same entry
 *     point a normal submission uses.
 *
 * It is deliberately no more permissive than the public form it replaces: the
 * same form, the same fields, the same validation, reachable by the same
 * anonymous visitor.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Forms this endpoint may submit to.
 *
 * 22 is /ai-phone-number/, the only form the site currently routes here. The
 * six mirrored Gravity Forms lose their notifications to the same Coming Soon
 * window and could be pointed at this too — that is a change in
 * `hubspot-forms.js`, not here — so they are listed rather than left out.
 */
const SPENZA_LEAD_FORMS = array( 5, 15, 16, 19, 20, 21, 22 );

/** Origins allowed to read the response. */
const SPENZA_LEAD_ORIGINS = array(
	'https://www.spenza.com',
	'https://spenza.com',
	'https://preview.spenza.com',
);

/** Submissions allowed from one IP per minute. */
const SPENZA_LEAD_RATE = 8;

/**
 * Echo CORS for an allowlisted origin.
 *
 * `Vary: Origin` because the answer differs per caller and a shared cache in
 * front of this would otherwise hand one origin's headers to another.
 */
function spenza_lead_cors() {
	$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? trim( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '';

	header( 'Vary: Origin' );

	if ( $origin && in_array( $origin, SPENZA_LEAD_ORIGINS, true ) ) {
		header( 'Access-Control-Allow-Origin: ' . $origin );
	}
}

/**
 * Whether this IP has submitted too often.
 *
 * A transient rather than a table: it expires on its own, costs one option
 * read, and the failure mode if object caching drops it is that someone gets
 * one extra attempt.
 */
function spenza_lead_throttled() {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? wp_unslash( $_SERVER['REMOTE_ADDR'] ) : '';

	if ( ! $ip ) {
		return false;
	}

	$key   = 'spenza_lead_' . md5( $ip );
	$count = (int) get_transient( $key );

	if ( $count >= SPENZA_LEAD_RATE ) {
		return true;
	}

	set_transient( $key, $count + 1, MINUTE_IN_SECONDS );

	return false;
}

/**
 * Take the lead and give it to Gravity Forms.
 *
 * `GFAPI::submit_form()` is the full pipeline — validation, entry, then every
 * active notification on the form. That is the whole point: the notifications
 * are what the static site cannot send for itself.
 *
 * `spenza_source_url` is not read here. It stays in `$_POST`, where
 * `spenza-form-source-url.php` picks it up on `gform_entry_post_save` exactly
 * as it does for a normal replay, so the entry is still filed against the page
 * the visitor actually saw.
 */
function spenza_lead_submit() {
	spenza_lead_cors();

	if ( spenza_lead_throttled() ) {
		wp_send_json( array( 'ok' => false, 'error' => 'rate_limited' ), 429 );
	}

	$form_id = isset( $_POST['gform_submit'] ) ? (int) wp_unslash( $_POST['gform_submit'] ) : 0;

	if ( ! in_array( $form_id, SPENZA_LEAD_FORMS, true ) ) {
		wp_send_json( array( 'ok' => false, 'error' => 'unknown_form' ), 400 );
	}

	if ( ! class_exists( 'GFAPI' ) ) {
		wp_send_json( array( 'ok' => false, 'error' => 'gravity_forms_inactive' ), 500 );
	}

	// Only the form's own fields. Anything else in the POST is not this form's.
	//
	// Two spellings, because the browser and GFAPI disagree. A rendered
	// Gravity Form names a multi-input field's parts with a dot —
	// `input_1.3` is the first name half of field 1, `input_7.6` the country
	// half of an address — and that is what `FormData` sends. `GFAPI::
	// submit_form()` wants the same key with an underscore.
	//
	// This matters for exactly one form and it is easy to miss: form 5, the
	// gated mobility-policy download, carries `input_1.3`, `input_7.4`,
	// `input_7.6` and `input_8.6`. Drop those and it loses first name, surname
	// and country — three of its required fields — so every submission fails
	// validation and no entry or email is produced. The other six forms use
	// plain `input_<id>` throughout and would never have shown the bug.
	$input = array();

	foreach ( $_POST as $key => $value ) {
		if ( ! is_string( $key ) || ! preg_match( '/^input_[0-9]+([._][0-9]+)?$/', $key ) ) {
			continue;
		}
		if ( is_string( $value ) ) {
			$input[ str_replace( '.', '_', $key ) ] = wp_unslash( $value );
		}
	}

	if ( ! $input ) {
		wp_send_json( array( 'ok' => false, 'error' => 'no_fields' ), 400 );
	}

	$result = GFAPI::submit_form( $form_id, $input );

	if ( is_wp_error( $result ) ) {
		wp_send_json(
			array( 'ok' => false, 'error' => $result->get_error_code() ),
			500
		);
	}

	if ( empty( $result['is_valid'] ) ) {
		// Which field Gravity Forms objected to. The site shows its own
		// message; this is for whoever reads the console when a form that
		// looks fine keeps failing.
		wp_send_json(
			array(
				'ok'         => false,
				'error'      => 'validation_failed',
				'validation' => isset( $result['validation_messages'] ) ? $result['validation_messages'] : array(),
			),
			422
		);
	}

	wp_send_json(
		array(
			'ok'       => true,
			'entry_id' => isset( $result['entry_id'] ) ? (int) $result['entry_id'] : 0,
		)
	);
}

add_action( 'wp_ajax_nopriv_spenza_lead', 'spenza_lead_submit' );
add_action( 'wp_ajax_spenza_lead', 'spenza_lead_submit' );
