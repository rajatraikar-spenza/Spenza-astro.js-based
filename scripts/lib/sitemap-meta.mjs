/**
 * `changefreq`, `priority` and `lastmod` for every sitemap entry.
 *
 * Modelled on gigs.com/sitemap.xml: one flat `<urlset>`, every URL carrying all
 * three fields, priority tiered by what kind of page it is.
 *
 *   tier                              priority  changefreq
 *   home                              1.0       daily
 *   main pages (product, company)     0.9       weekly
 *   blog index                        0.9       daily
 *   blog posts and case studies       0.8       weekly
 *   category archives                 0.8       weekly
 *   blog pagination, author pages     0.8       weekly / monthly
 *   legal, sitemap page               0.8       yearly / monthly
 *
 * Nothing falls below 0.8: the floor is deliberate, set on request.
 *
 * `lastmod` is the date the content last changed, never the build date: every
 * build rewrites every file, so a build timestamp would tell Google that all
 * 300 URLs changed on each deploy and teach it to ignore the field.
 *   - posts: Yoast's `article:modified_time`, read from the built page.
 *   - pages: the last commit touching the page's source (CI checks out with
 *     full history for this). Omitted when git cannot answer, rather than
 *     guessed.
 *   - listings (blog, categories, authors): the newest post they list.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import wpPosts from '../../src/data/wp-posts.json' with { type: 'json' };

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DIST = fileURLToPath(new URL('../../dist/', import.meta.url));

/**
 * Posts live at `/<category>/<slug>/`. That index also lists page routes (the
 * hubs, /mvne/) and lags posts published since, so the category segment is the
 * test, not membership. Mirrors CATEGORY_SLUGS in src/data/blog-categories.ts.
 */
const POST_CATEGORIES = new Set(['telecom', 'mvno', 'esim', 'spenza-product', 'tem', 'iot', 'byod']);
const isPost = parts => parts.length === 2 && POST_CATEGORIES.has(parts[0]);

/** Post routes known to the index, for the newest-post lookup listings use. */
const POST_ROUTES = Object.values(wpPosts)
  .map(p => p.route)
  .filter(r => isPost(r.split('/').filter(Boolean)));
const LEGAL = new Set([
  '/privacy-policy/',
  '/terms-of-service/',
  '/sub-processors/',
  '/network-operator-terms-of-service/',
]);

const newest = dates => dates.filter(Boolean).sort().at(-1);

/** Yoast's modified time from a built post, or undefined. */
function postModified(path) {
  try {
    const html = fs.readFileSync(`${DIST}${path.slice(1)}index.html`, 'utf8');
    return html.match(/article:modified_time"\s+content="([^"]+)"/)?.[1];
  } catch {
    return undefined;
  }
}

/** ISO date of the last commit touching any of `files`, or undefined. */
function gitModified(files) {
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', ...files],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return out || undefined;
  } catch {
    return undefined;
  }
}

/** Source files that render a top-level page at `/<slug>/`. */
function sourcesFor(slug) {
  return [`src/pages/${slug}.astro`, `src/partials/${slug}.html`].filter(f =>
    fs.existsSync(`${ROOT}${f}`),
  );
}

export function sitemapMeta() {
  /** path -> modified, for the newest-post lookups listings need. */
  const postDates = new Map();
  const dateOf = path => {
    if (!postDates.has(path)) postDates.set(path, postModified(path));
    return postDates.get(path);
  };
  let latestPost;
  const latest = () =>
    (latestPost ??= newest(POST_ROUTES.map(dateOf)));

  return function serialize(item) {
    const path = new URL(item.url).pathname;
    const parts = path.split('/').filter(Boolean);

    let changefreq;
    let priority;
    let lastmod;

    if (path === '/') {
      changefreq = 'daily';
      priority = 1.0;
      lastmod = gitModified(['src/pages/index.astro', 'src/components']);
    } else if (isPost(parts)) {
      changefreq = 'weekly';
      priority = 0.8;
      lastmod = dateOf(path);
    } else if (path === '/blog/') {
      changefreq = 'daily';
      priority = 0.9;
      lastmod = latest();
    } else if (parts[0] === 'blog' && parts[1] === 'page') {
      changefreq = 'weekly';
      priority = 0.8;
      lastmod = latest();
    } else if (parts[0] === 'category') {
      changefreq = 'weekly';
      priority = 0.8;
      lastmod = latest();
    } else if (parts[0] === 'author') {
      changefreq = 'monthly';
      priority = 0.8;
      lastmod = latest();
    } else if (LEGAL.has(path)) {
      changefreq = 'yearly';
      priority = 0.8;
      lastmod = gitModified(sourcesFor(parts[0]));
    } else if (path === '/sitemap/') {
      changefreq = 'monthly';
      priority = 0.8;
    } else {
      changefreq = 'weekly';
      priority = 0.9;
      lastmod = gitModified(sourcesFor(parts[0]));
    }

    return {
      ...item,
      changefreq,
      priority,
      ...(lastmod && { lastmod: new Date(lastmod).toISOString() }),
    };
  };
}
