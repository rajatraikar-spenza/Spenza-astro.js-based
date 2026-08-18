// Give internal links the trailing slash the site actually serves.
//
// WordPress serves every URL with a trailing slash and the build is configured
// to match (`trailingSlash: 'always'`), but the content links plenty of paths
// without one. Each is a needless redirect hop in production and a hard 404
// under a strict static host.
//
// Shared because two very different inputs need it: the mirrored partials, via
// the Vite plugin that loads them, and post bodies coming from WPGraphQL, via
// the content loader. Keeping one copy is deliberate — when this lived only in
// the plugin, moving posts to the headless path silently lost the
// normalisation and broke thirteen links.

import { SITE_URL } from './config.mjs';

/**
 * Hostnames that are this site, whatever origin is currently serving it.
 *
 * WordPress content hardcodes hundreds of absolute `https://spenza.com/...`
 * links — internal navigation written as though it were an external site. The
 * mirror only rewrites the host it fetched from, so those passed through
 * untouched and every one of them left the Astro build: a reader on staging
 * clicking "IoT Solutions" landed on production WordPress.
 *
 * The production host is included regardless of `SITE_URL`, because those links
 * are internal on a staging build too — that is precisely where jumping to
 * production is wrong.
 *
 * Subdomains are deliberately absent. `docs.`, `api.` and `telematics.` are
 * different services, and rewriting them to a path here would 404.
 */
const SELF_HOSTS = new Set(
  [new URL(SITE_URL).hostname, 'spenza.com', 'www.spenza.com']
    .map(h => h.replace(/^www\./, ''))
);

/** An absolute href, so its host can be tested against the set above. */
const ABSOLUTE_HREF = /href="(https?:\/\/[^"]+)"/g;

/**
 * Turn absolute links to this site into paths.
 *
 * Root-relative is what the rest of the mirrored markup uses, and it is what
 * lets Astro's prefetch treat them as internal — an absolute self-link is a
 * full page load even when it resolves to the same server.
 */
function selfLinksToPaths(html) {
  return html.replace(ABSOLUTE_HREF, (whole, href) => {
    let url;
    try { url = new URL(href); } catch { return whole; }
    if (!SELF_HOSTS.has(url.hostname.replace(/^www\./, ''))) return whole;
    return `href="${url.pathname}${url.search}${url.hash}"`;
  });
}

/**
 * Root-relative hrefs. Requires a non-slash first character so protocol-relative
 * `//host/...` is excluded.
 */
const INTERNAL_HREF = /href="(\/(?:[^"/][^"]*)?)"/g;

export function normalizeLinks(html) {
  if (!html) return html;
  // Absolute self-links first, so the trailing-slash pass below sees them as
  // the internal paths they are.
  return selfLinksToPaths(html).replace(INTERNAL_HREF, (whole, href) => {
    const [, pathname, rest = ''] = href.match(/^([^?#]*)([?#].*)?$/) ?? [];
    if (!pathname || pathname.endsWith('/')) return whole;

    // A dot in the final segment means a file, not a page.
    const last = pathname.slice(pathname.lastIndexOf('/') + 1);
    if (last.includes('.')) return whole;

    // Query strings and fragments keep their position: /a?b=1 -> /a/?b=1
    return `href="${pathname}/${rest}"`;
  });
}
