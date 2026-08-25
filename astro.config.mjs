// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import { SITE_URL } from './scripts/lib/config.mjs';
import fs from 'node:fs';
import path from 'node:path';

import wpPosts from './src/data/wp-posts.json' with { type: 'json' };
import wpRedirects from './src/data/wp-redirects.json' with { type: 'json' };
import { partialRewrites } from './scripts/lib/partial-rewrites-plugin.mjs';
import { wpRefresh } from './scripts/lib/wp-refresh-integration.mjs';
import { hostFiles } from './scripts/lib/host-files-integration.mjs';

/**
 * Every path this site answers with a redirect rather than a page.
 *
 * Two sources, because there are two redirect routes and they are generated
 * from different indexes: `blog/[slug].astro` keeps a legacy `/blog/<slug>/`
 * alive for every post, and `[...wpRedirect].astro` replays the 301s WordPress
 * itself serves for renamed slugs. Derived from the same data those routes use,
 * so a post added to the index cannot reappear in the sitemap as an alias.
 *
 * `HOST_REDIRECTS` decides whether the second set is emitted as HTML at all,
 * and this deliberately does not consult it: a path that is a redirect is not a
 * sitemap entry either way, and reading the flag here would make the sitemap
 * depend on an environment variable that has nothing to do with it.
 */
const REDIRECTING = new Set([
  ...Object.keys(wpPosts).map(slug => `/blog/${slug}/`),
  ...Object.keys(wpRedirects).map(from => (from.endsWith('/') ? from : `${from}/`)),
  ...handWrittenRedirects(),
]);

/**
 * The redirects that are their own page file rather than an entry in an index.
 *
 * `finance-and-hr.astro` and `bookings-checkout-discovery-call-book.astro` are
 * five lines each that render `<Redirect>`, and both were in the sitemap. Found
 * by reading the page files rather than by listing the two, so the next one
 * somebody writes is excluded on the build that introduces it — an enumerated
 * list is a thing to forget, and the symptom of forgetting is invisible until
 * Search Console reports it weeks later.
 *
 * Dynamic routes are skipped: a bracketed filename produces many paths, not
 * one, and the two that redirect are already covered above by the indexes they
 * are generated from.
 */
function handWrittenRedirects() {
  const dir = new URL('./src/pages/', import.meta.url);
  return fs
    .readdirSync(dir)
    .filter(name => name.endsWith('.astro') && !name.includes('['))
    .filter(name => fs.readFileSync(new URL(name, dir), 'utf8').includes('/Redirect.astro'))
    .map(name => `/${path.basename(name, '.astro')}/`);
}

// https://astro.build/config
export default defineConfig({
  /**
   * Canonical origin. WpLayout previously fell back to whatever origin served
   * the build, which silently emits wrong canonicals anywhere but production.
   */
  site: SITE_URL,

  /**
   * WordPress serves every URL with a trailing slash. Matching it means the
   * 283 existing URLs resolve directly instead of taking a redirect hop each.
   */
  trailingSlash: 'always',

  integrations: [
    mdx(),

    /**
     * Lets `wp:watch` pull newly published posts into a *running* dev server,
     * rather than only into a production build. Dev-only; no build impact.
     */
    wpRefresh(),

    /**
     * `_redirects`, `_headers`, and the prune of stylesheets nothing links to.
     * Runs at `astro:build:done`, so it sees the finished output.
     */
    hostFiles(),

    sitemap({
      /** Mirror what Yoast currently emits, and nothing that is not the site. */
      filter: page => {
        const path = new URL(page).pathname;
        return (
          // Date archives are internally linked but absent from WordPress'
          // sitemaps, so listing them would newly invite crawling of pages meant
          // to stay out of the index.
          !/\/\d{4}\/\d{2}\/\d{2}\//.test(page) &&
          // /preview/ holds the hand-built rebuild experiment, not the site. It
          // was being submitted to Google as though it were a real page.
          !/\/preview\//.test(page) &&
          // Nothing that only redirects. Half of what this sitemap listed was
          // the legacy /blog/<slug>/ aliases and WordPress' own 301s — pages
          // that carry `noindex, follow` and bounce to the canonical URL, which
          // is already in here. Submitting them asks Google to spend its crawl
          // on 346 URLs it will file under "Page with redirect", and buries the
          // real ones: they outnumbered the posts they point at.
          !REDIRECTING.has(path)
        );
      },
    }),
  ],

  /**
   * Warm the next navigation on hover. Deliberately not `viewport`: blog index
   * and related-post grids put dozens of links on screen at once, and
   * prefetching all of them would cost more than it saves.
   */
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  /**
   * Upgrade that hover prefetch to a speculation-rules prerender where the
   * browser supports it, so the next page is already rendered when it is
   * clicked. Degrades to the plain prefetch above everywhere else.
   */
  experimental: { clientPrerender: true },

  build: {
    /**
     * `wp-polish.css` is the only stylesheet Astro itself emits, and at 3KB
     * compressed it costs more as a request than as bytes: a fourth
     * render-blocking round trip on a page that already waits for three. The
     * default only inlines below 4KB uncompressed, which it misses.
     */
    inlineStylesheets: 'always',
  },

  vite: {
    plugins: [partialRewrites()],
    build: {
      // Faster and tighter than esbuild's CSS minifier.
      cssMinify: 'lightningcss',
    },
  },
});
