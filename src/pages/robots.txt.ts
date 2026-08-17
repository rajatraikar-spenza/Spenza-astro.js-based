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

const INDEXABLE = `User-agent: *
Allow: /

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
