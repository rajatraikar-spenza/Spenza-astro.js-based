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

/**
 * Canonical origin of the public site — drives canonicals and the sitemap.
 *
 * `www`, and not the apex. The certificate CloudFront serves covers
 * `www.spenza.com`; `https://spenza.com` fails its TLS handshake outright, so
 * the apex is not a URL anything can be canonicalised to. Pointing canonicals
 * at a host that cannot be fetched is worse than pointing them at the wrong
 * page — there is nothing there for a crawler to land on.
 */
const PROD_SITE_URL = 'https://www.spenza.com';

export const SITE_URL = (process.env.SITE_URL || PROD_SITE_URL).replace(/\/+$/, '');

/**
 * Keep this build out of search results.
 *
 * Opt *out* rather than opt in, deliberately. The two ways to get this wrong are
 * not equally bad: a staging site that slips into the index is embarrassing and
 * fixable, while a production site that ships `Disallow: /` deletes the site
 * from Google and gives no signal that it happened. Defaulting to indexable
 * means the dangerous mistake requires someone to type something.
 *
 * Set `NOINDEX=1` on every preview and staging environment. The build warns when
 * `SITE_URL` has been moved off the default and this is still unset, which is
 * exactly the shape of a preview deploy that forgot.
 */
export const NOINDEX = /^(1|true|yes|on)$/i.test(process.env.NOINDEX || '');

/**
 * True when this build carries production's canonical origin.
 *
 * Compared by value rather than by "was the variable set at all", because
 * naming production explicitly is exactly what a CI environment does — and
 * under the old test that made every real deploy look like a preview that
 * forgot `NOINDEX`, which is the one warning that must stay meaningful.
 */
export const IS_DEFAULT_SITE = SITE_URL === PROD_SITE_URL;

/**
 * Microsoft Clarity project id — the only environment-specific part of the
 * tag. The host in the snippet is the vendor's and is not ours to vary.
 *
 * Env-driven for the same reason `SITE_URL` is: this build is deployed to more
 * than one place, and staging sessions landing in the same Clarity project as
 * real ones would make every heatmap and funnel a little bit wrong with no
 * way to tell afterwards which was which. Set it empty on a build that should
 * not be recorded and no tag is emitted at all.
 *
 * Defaulted rather than required, so a developer who has never heard of
 * Clarity still builds the site the deploy builds.
 */
export const CLARITY_PROJECT_ID = (process.env.CLARITY_PROJECT_ID ?? 'y7rcw4tkeq').trim();

if (CLARITY_PROJECT_ID && !/^[a-z0-9]+$/i.test(CLARITY_PROJECT_ID)) {
  throw new Error(
    `CLARITY_PROJECT_ID must be alphanumeric, got ${JSON.stringify(CLARITY_PROJECT_ID)}. ` +
    `It is interpolated into an inline <script>; anything else is either a typo ` +
    `or an injection, and both are better caught here than shipped to every page.`
  );
}

/**
 * Let the host serve WordPress' 301s, and stop emitting the HTML stand-ins.
 *
 * A static build cannot send a redirect status, so `[...wpRedirect].astro`
 * fakes one per old URL with a meta refresh. The build now also writes a
 * `_redirects` file, and whether a host consults that before or after finding a
 * real file at the same path is not something to guess at — so this makes it a
 * decision instead. Set it once `_redirects` is confirmed working on the target
 * host, and the 101 stand-in pages stop being built.
 */
export const HOST_REDIRECTS = /^(1|true|yes|on)$/i.test(process.env.HOST_REDIRECTS || '');

if (MEDIA_ORIGIN && new URL(MEDIA_ORIGIN).hostname === WP_HOST) {
  throw new Error(
    `MEDIA_ORIGIN must not point at ${WP_HOST}: that host serves "Disallow: /", ` +
    `so blog images would be uncrawlable. Use a dedicated media hostname.`
  );
}

/**
 * Where the WebP Express variants live, here and on the media host.
 *
 * The asset mirror files everything outside `uploads` under `/wp-assets/`, so
 * the variants land here rather than beside the originals. Exported because
 * three call sites need to agree on it, and they are in three different layers.
 */
export const WEBP_PATH = '/wp-assets/wp-content/webp-express/';

/**
 * Local media prefixes, as they appear in mirrored markup and CSS.
 *
 * Two, not one. `/wp-content/uploads/` is the original media; the WebP variants
 * under `WEBP_PATH` are what every mirrored `<picture>` actually serves to a
 * modern browser. Rewriting only the first moves 1.8GB of `<img>` fallbacks to
 * the media host and leaves the 184MB browsers really download on the origin —
 * a half-migration that looks right in the markup and is wrong on the wire.
 *
 * The leading group is the delimiter before the path: an attribute quote, a CSS
 * `url(`, whitespace, or the comma between `srcset` candidates.
 */
const LOCAL_UPLOADS = /(["'(\s,])\/wp-content\/uploads\//g;
const LOCAL_WEBP = /(["'(\s,])\/wp-assets\/wp-content\/webp-express\//g;

/**
 * Point locally-rooted media in an HTML string at `MEDIA_ORIGIN`.
 *
 * Inert when no media host is configured, which is the state until one exists —
 * so call sites do not need to guard on it. Safe to hold the patterns at module
 * scope: `String.replace` resets `lastIndex` on a global regex, unlike `exec`.
 */
export function toMediaOrigin(html) {
  if (!MEDIA_ORIGIN) return html;
  return html
    .replace(LOCAL_UPLOADS, `$1${MEDIA_ORIGIN}/wp-content/uploads/`)
    .replace(LOCAL_WEBP, `$1${MEDIA_ORIGIN}${WEBP_PATH}`);
}

/**
 * Settle on one spelling for a media path, without deciding where it is served.
 *
 * The asset mirror filed a handful of uploads under
 * `/wp-assets/wp-content/uploads/` via a rule meant for plugin assets. Both
 * spellings name the same bytes, and leaving two alive means a media split has
 * to sync the file twice or 404 from whichever tree it forgot.
 *
 * Host-neutral on purpose. This is what the CSS optimiser uses, and its output
 * is committed and content-addressed — baking a media host into it would make a
 * generated artefact environment-specific, so that a build without the host set
 * would serve URLs for a host it does not know about. The media origin is
 * applied to CSS at build time instead, next to the same pass over JS.
 */
export function canonicalMediaPath(p) {
  return p.replace(/^\/wp-assets(\/wp-content\/uploads\/)/, '$1');
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
