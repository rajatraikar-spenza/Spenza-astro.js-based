// Environment-driven origins for the mirroring pipeline and the build.
//
// These were hardcoded to preprod across seven scripts, which made "point at a
// different WordPress" a find-and-replace rather than a config change. The
// defaults reproduce the old behaviour exactly, so nothing moves until an env
// var says so.
//
// Deliberately side-effect free apart from loading .env — `wp-mirror.mjs` opens
// a cookie jar at import time, and the Astro config must be able to read these
// without that.
import path from 'node:path';

export const PROJECT = path.resolve(import.meta.dirname, '..', '..');

try {
  process.loadEnvFile(path.join(PROJECT, '.env'));
} catch {
  // No .env — defaults below apply.
}

/** The WordPress instance content is mirrored/queried from. */
export const WP_ORIGIN = (process.env.WP_ORIGIN || 'https://preprod.spenza.com').replace(/\/+$/, '');

/** Hostname only — the asset mirror files anything else under `_cdn/<host>/`. */
export const WP_HOST = new URL(WP_ORIGIN).hostname;

/**
 * Where blog/case-study media is served from in the built site.
 *
 * Empty means "serve from this repo", which is the state until
 * media.spenza.com exists. It must never be set to the preprod host: that
 * host is `Disallow: /`, so Google could not crawl the images.
 */
export const MEDIA_ORIGIN = (process.env.MEDIA_ORIGIN || '').replace(/\/+$/, '');

/** Canonical origin of the public site — drives canonicals and the sitemap. */
export const SITE_URL = (process.env.SITE_URL || 'https://spenza.com').replace(/\/+$/, '');

if (MEDIA_ORIGIN && new URL(MEDIA_ORIGIN).hostname === WP_HOST) {
  throw new Error(
    `MEDIA_ORIGIN must not point at ${WP_HOST}: that host serves "Disallow: /", ` +
    `so blog images would be uncrawlable. Use a dedicated media hostname.`
  );
}

/** WP_HOST escaped for embedding in a RegExp. */
const H = WP_HOST.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Point every absolute WordPress URL at its mirrored equivalent.
 *
 * This lived in six near-identical copies across the mirroring scripts, three of
 * them missing the wp-includes and cache-buster rules. They are unified here
 * because the host is now configurable, and a copy that still hardcodes preprod
 * would silently emit broken output the moment WP_ORIGIN changes.
 *
 * The extra rules are inert on the inputs the shorter copies handled — CSS and
 * inline scripts carry no wp-includes references — so unifying widens coverage
 * without changing existing results.
 */
export function rewriteWpUrls(s) {
  return s
    // Media stays under /wp-content/uploads (mirrored into public/).
    .replace(new RegExp(`https?://${H}/wp-content/uploads/`, 'g'), '/wp-content/uploads/')
    .replace(new RegExp(`//${H}/wp-content/uploads/`, 'g'), '/wp-content/uploads/')
    // Plugin/theme assets live under /wp-assets.
    .replace(new RegExp(`https?://${H}/wp-content/`, 'g'), '/wp-assets/wp-content/')
    .replace(new RegExp(`//${H}/wp-content/`, 'g'), '/wp-assets/wp-content/')
    .replace(new RegExp(`https?://${H}/wp-includes/`, 'g'), '/wp-assets/wp-includes/')
    // Everything else is an internal page link.
    .replace(new RegExp(`https?://${H}/?`, 'g'), '/')
    // Drop cache-busting query strings on local assets.
    .replace(/(\/wp-assets\/[^"'\s)]+?)\?ver=[^"'\s)]*/g, '$1');
}

/** Fresh matcher for absolute upload URLs; group 1 is the local path. */
export const wpMediaRe = () =>
  new RegExp(`https?://${H}(/wp-content/uploads/[^"'\\s,)\\\\<>]+)`, 'g');
