/**
 * robots.txt, which the site has never had.
 *
 * Two things were missing without it: nothing pointed crawlers at the sitemap
 * the build already emits, and nothing stopped a preview deployment — served
 * from a public URL with production canonicals — from being indexed alongside
 * the real site.
 *
 * An endpoint rather than `public/robots.txt` because the answer depends on
 * which environment is being built, and a committed static file cannot.
 */
import type { APIRoute } from 'astro';
import { SITE_URL, NOINDEX } from '../../scripts/lib/config.mjs';

/**
 * Nothing here is disallowed, and that is the considered answer rather than the
 * lazy one.
 *
 * WordPress serves a robots.txt on the same domain that blocks `/wp-admin/` and
 * `/cgi-bin/` and points at `sitemap_index.xml`. None of that transfers: this
 * build has no admin, no CGI, and its sitemap is `sitemap-index.xml`. The two
 * paths it would be tempting to block are both traps — `/blog/<slug>/` and the
 * mirrored 301s carry `noindex, follow` and bounce to the canonical URL, and a
 * crawler told to stay out of them never learns that, so the old URLs keep
 * their equity instead of passing it on. `/_astro/` and `/wp-assets/` are the
 * CSS and JS the page needs to render, and blocking those is how a site starts
 * being judged on its unstyled markup.
 *
 * `llms.txt` is advertised here because there is nowhere else to advertise it.
 * It is not a robots directive and no crawler is required to read the line, but
 * it costs nothing and is where an assistant looking for one would check.
 */
const INDEXABLE = `User-agent: *
Allow: /

# A machine-readable index of this site: /llms.txt

Sitemap: ${SITE_URL}/sitemap-index.xml
`;

/**
 * Belt and braces with the `X-Robots-Tag` header the build writes for the same
 * environments: robots.txt stops the crawl, the header stops indexing of
 * anything already discovered by a link from elsewhere.
 */
const BLOCKED = `# Non-production build — see NOINDEX in scripts/lib/config.mjs
User-agent: *
Disallow: /
`;

export const GET: APIRoute = () =>
  new Response(NOINDEX ? BLOCKED : INDEXABLE, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
