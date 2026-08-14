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

/**
 * Root-relative hrefs. Requires a non-slash first character so protocol-relative
 * `//host/...` is excluded.
 */
const INTERNAL_HREF = /href="(\/(?:[^"/][^"]*)?)"/g;

export function normalizeLinks(html) {
  if (!html) return html;
  return html.replace(INTERNAL_HREF, (whole, href) => {
    const [, pathname, rest = ''] = href.match(/^([^?#]*)([?#].*)?$/) ?? [];
    if (!pathname || pathname.endsWith('/')) return whole;

    // A dot in the final segment means a file, not a page.
    const last = pathname.slice(pathname.lastIndexOf('/') + 1);
    if (last.includes('.')) return whole;

    // Query strings and fragments keep their position: /a?b=1 -> /a/?b=1
    return `href="${pathname}/${rest}"`;
  });
}
