<?php
/**
 * Plugin Name: Spenza — ChatGPT Ads conversions (server side)
 * Description: Sends a lead_created event to OpenAI's Conversions API for every lead the static site hands to the lead endpoint, sharing its event id with the browser pixel so the two are counted once. Does nothing until SPENZA_OAI_CAPI_KEY is defined in wp-config.php.
 * Version:     1.0.0
 *
 * WHY THIS EXISTS
 * The site's pixel (`Analytics.astro`) reports a lead from the visitor's
 * browser, and a browser can refuse to: ad blockers, a tab closed before the
 * pixel flushed, a privacy setting. The Conversions API is the copy that
 * cannot be blocked, and it has to come from a server — the API key must never
 * reach the browser. The static site has no server; this WordPress install is
 * the one server every lead already passes through, by way of
 * `spenza-lead-endpoint.php`.
 *
 * HOW THE TWO COPIES BECOME ONE
 * `hubspot-forms.js` makes one event id per lead, gives it to the pixel as
 * `event_id`, and posts it here as `spenza_oai_event_id`. OpenAI deduplicates
 * on pixel id + event name + id and keeps whichever arrived first.
 *
 * WHAT MAKES IT AN AD CONVERSION
 * `spenza_oai_oppref` — the ad-click id the pixel stored in `__oppref` when the
 * visitor landed from a ChatGPT ad — and `spenza_oai_obref`, the pixel's
 * browser id. Every lead is sent, with or without them, as OpenAI recommends;
 * OpenAI decides which ones an ad earned. IP, user agent and the SHA-256 of the
 * lead's email are added for matching. The raw email never leaves this server.
 *
 * WHEN IT RUNS
 * Only on `gform_after_submission` inside the `spenza_lead` admin-ajax request
 * — i.e. Gravity Forms has validated the lead and written the entry — and only
 * when the site sent an event id, which it does for sales leads alone (not a
 * newsletter signup or a PDF download). An entry Akismet marks as spam is
 * skipped.
 *
 * CONFIGURATION (wp-config.php, above "That's all, stop editing!")
 *
 *   define( 'SPENZA_OAI_CAPI_KEY', '<Conversions API key from Ads Manager>' );
 *
 * Optional:
 *
 *   define( 'SPENZA_OAI_CAPI_VALIDATE_ONLY', true ); // OpenAI checks, stores nothing
 *   define( 'SPENZA_OAI_PIXEL_ID', '...' );          // defaults to the live pixel
 *
 * Without the key this file does nothing at all. Failures go to the PHP error
 * log as `[spenza-oai]` lines; the lead itself is never affected.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'SPENZA_OAI_PIXEL_ID' ) ) {
	define( 'SPENZA_OAI_PIXEL_ID', 'U7MFXrymQuC42hGkZ8iLv7' );
}

/**
 * A posted `spenza_oai_*` value, or '' unless it matches `$pattern`.
 *
 * Everything here arrives in a public POST, so each value is held to the shape
 * it is supposed to have before it is forwarded anywhere.
 */
function spenza_oai_posted( $name, $pattern ) {
	$value = isset( $_POST[ $name ] ) ? wp_unslash( $_POST[ $name ] ) : '';

	return is_string( $value ) && preg_match( $pattern, $value ) ? $value : '';
}

/** The page the lead came from, if it is a spenza.com page. */
function spenza_oai_source_url() {
	$url   = isset( $_POST['spenza_source_url'] ) ? esc_url_raw( trim( wp_unslash( $_POST['spenza_source_url'] ) ) ) : '';
	$parts = $url ? wp_parse_url( $url ) : false;
	$host  = $parts && ! empty( $parts['host'] ) ? strtolower( $parts['host'] ) : '';

	if ( 'spenza.com' === $host || '.spenza.com' === substr( $host, -11 ) ) {
		return $url;
	}

	return 'https://spenza.com/';
}

/** SHA-256 of the lead's email, normalised as OpenAI asks: trimmed, lowercased. */
function spenza_oai_email_hashes( $entry, $form ) {
	$hashes = array();

	foreach ( (array) rgar( $form, 'fields' ) as $field ) {
		if ( 'email' !== $field->type ) {
			continue;
		}

		$email = strtolower( trim( (string) rgar( $entry, (string) $field->id ) ) );

		if ( $email && is_email( $email ) ) {
			$hashes[] = hash( 'sha256', $email );
		}
	}

	return array_slice( array_values( array_unique( $hashes ) ), 0, 3 );
}

function spenza_oai_send_lead( $entry, $form ) {
	if ( ! defined( 'SPENZA_OAI_CAPI_KEY' ) || ! SPENZA_OAI_CAPI_KEY ) {
		return;
	}

	// Only the static site's leads, never a form submitted on WordPress itself.
	if ( ! wp_doing_ajax() || ! isset( $_REQUEST['action'] ) || 'spenza_lead' !== $_REQUEST['action'] ) {
		return;
	}

	if ( 'spam' === rgar( $entry, 'status' ) ) {
		return;
	}

	$event_id = spenza_oai_posted( 'spenza_oai_event_id', '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/' );

	if ( ! $event_id ) {
		return; // Not a sales lead, or a page built before this existed.
	}

	$user = array();

	$obref = spenza_oai_posted( 'spenza_oai_obref', '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/' );
	if ( $obref ) {
		$user['obref'] = $obref;
	}

	$emails = spenza_oai_email_hashes( $entry, $form );
	if ( $emails ) {
		$user['emails_sha256'] = $emails;
	}

	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? filter_var( wp_unslash( $_SERVER['REMOTE_ADDR'] ), FILTER_VALIDATE_IP ) : false;
	if ( $ip ) {
		$user['ip_address'] = $ip;
	}

	$agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? trim( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';
	if ( '' !== $agent ) {
		$user['user_agent'] = substr( $agent, 0, 512 );
	}

	$event = array(
		'id'            => $event_id,
		'type'          => 'lead_created',
		'timestamp_ms'  => (int) round( microtime( true ) * 1000 ),
		'source_url'    => spenza_oai_source_url(),
		'action_source' => 'web',
		'data'          => array( 'type' => 'customer_action' ),
	);

	// Opaque and passed through unmodified; only its shape is checked.
	$oppref = spenza_oai_posted( 'spenza_oai_oppref', '/^[\x21-\x7e]{1,512}$/' );
	if ( $oppref ) {
		$event['oppref'] = $oppref;
	}

	if ( $user ) {
		$event['user'] = $user;
	}

	$response = wp_remote_post(
		'https://bzr.openai.com/v1/events?pid=' . rawurlencode( SPENZA_OAI_PIXEL_ID ),
		array(
			'timeout' => 5,
			'headers' => array(
				'Authorization' => 'Bearer ' . SPENZA_OAI_CAPI_KEY,
				'Content-Type'  => 'application/json',
			),
			'body'    => wp_json_encode(
				array(
					'validate_only'      => defined( 'SPENZA_OAI_CAPI_VALIDATE_ONLY' ) && SPENZA_OAI_CAPI_VALIDATE_ONLY,
					'integration_source' => 'spenza-wordpress',
					'events'             => array( $event ),
				)
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		error_log( '[spenza-oai] lead_created ' . $event_id . ' not sent: ' . $response->get_error_message() );
		return;
	}

	$code = (int) wp_remote_retrieve_response_code( $response );

	if ( $code < 200 || $code >= 300 ) {
		error_log( '[spenza-oai] lead_created ' . $event_id . ' rejected (' . $code . '): ' . substr( wp_remote_retrieve_body( $response ), 0, 500 ) );
	}
}

add_action( 'gform_after_submission', 'spenza_oai_send_lead', 10, 2 );
