<?php
/**
 * Plugin Name: Spenza — ACF post blocks for GraphQL
 * Description: Exposes the four ACF fields the Elementor single-post template renders, so the Astro front end can read them. Read-only; adds nothing to the admin or the front end.
 * Version:     1.0.0
 *
 * WHY THIS EXISTS
 * The single-post template (id 20168) renders three blocks from ACF rather than
 * from the post body: a TL;DR line, a two-column card set, and a one-column
 * "how Spenza helps" card. WPGraphQL cannot see them, so a headless render of
 * the blog would drop them from all 256 posts.
 *
 * WHY A MU-PLUGIN
 * Drop-in file under wp-content/mu-plugins/ — loads automatically, needs no
 * activation, survives theme updates, and is removed by deleting the file.
 * Compared with the alternatives it adds no third-party code (unlike installing
 * WPGraphQL for ACF, which has to bridge WPGraphQL 2.19 and ACF 6.1.1) and does
 * not touch the theme (unlike editing functions.php).
 *
 * SAFETY
 * Every entry point is guarded. If WPGraphQL is absent the hook never fires; if
 * ACF is absent it falls back to raw post meta; any unexpected value shape
 * returns an empty result rather than raising. Nothing here runs on a normal
 * page load — only on a /graphql request that asks for these fields.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'graphql_register_types', function () {

	// Bail unless the registration API is really present.
	if ( ! function_exists( 'register_graphql_object_type' ) || ! function_exists( 'register_graphql_field' ) ) {
		return;
	}

	register_graphql_object_type( 'SpenzaPostCard', [
		'description' => __( 'One icon/title/text row from an ACF repeater', 'spenza' ),
		'fields'      => [
			'icon'  => [ 'type' => 'String', 'description' => __( 'Font Awesome descriptor, as stored by ACF (JSON string)', 'spenza' ) ],
			'title' => [ 'type' => 'String' ],
			'text'  => [ 'type' => 'String' ],
		],
	] );

	register_graphql_object_type( 'SpenzaPostExtras', [
		'description' => __( 'Per-post blocks the Elementor single-post template renders from ACF', 'spenza' ),
		'fields'      => [
			'tldrHeading'     => [ 'type' => 'String' ],
			'tldrDescription' => [ 'type' => 'String' ],
			'twoCol'          => [ 'type' => [ 'list_of' => 'SpenzaPostCard' ] ],
			'oneCol'          => [ 'type' => [ 'list_of' => 'SpenzaPostCard' ] ],
		],
	] );

	register_graphql_field( 'Post', 'postExtras', [
		'type'        => 'SpenzaPostExtras',
		'description' => __( 'ACF blocks for the Astro front end', 'spenza' ),
		'resolve'     => function ( $post ) {

			$id = isset( $post->databaseId ) ? (int) $post->databaseId : 0;
			if ( ! $id ) {
				return null;
			}

			// ACF when available, plain post meta otherwise. Never assume either.
			$read = function ( $field ) use ( $id ) {
				if ( function_exists( 'get_field' ) ) {
					return get_field( $field, $id );
				}
				return get_post_meta( $id, $field, true );
			};

			$text = function ( $field ) use ( $read ) {
				$value = $read( $field );
				return is_string( $value ) ? $value : '';
			};

			$rows = function ( $field ) use ( $read ) {
				$value = $read( $field );
				if ( ! is_array( $value ) ) {
					return [];
				}
				$out = [];
				foreach ( $value as $row ) {
					if ( ! is_array( $row ) ) {
						continue;
					}
					$out[] = [
						'icon'  => isset( $row['icon'] ) && is_string( $row['icon'] ) ? $row['icon'] : '',
						'title' => isset( $row['title'] ) && is_string( $row['title'] ) ? $row['title'] : '',
						'text'  => isset( $row['text'] ) && is_string( $row['text'] ) ? $row['text'] : '',
					];
				}
				return $out;
			};

			return [
				'tldrHeading'     => $text( 'tldr_heading' ),
				'tldrDescription' => $text( 'tldr_description' ),
				'twoCol'          => $rows( '2_col' ),
				'oneCol'          => $rows( '1_col' ),
			];
		},
	] );
} );
