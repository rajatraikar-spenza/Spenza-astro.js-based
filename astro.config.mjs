// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import { SITE_URL } from './scripts/lib/config.mjs';
import { partialRewrites } from './scripts/lib/partial-rewrites-plugin.mjs';
import { wpRefresh } from './scripts/lib/wp-refresh-integration.mjs';
import { hostFiles } from './scripts/lib/host-files-integration.mjs';

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
      filter: page =>
        // Date archives are internally linked but absent from WordPress'
        // sitemaps, so listing them would newly invite crawling of pages meant
        // to stay out of the index.
        !/\/\d{4}\/\d{2}\/\d{2}\//.test(page) &&
        // /preview/ holds the hand-built rebuild experiment, not the site. It
        // was being submitted to Google as though it were a real page.
        !/\/preview\//.test(page),
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

  vite: {
    plugins: [partialRewrites()],
    build: {
      // Faster and tighter than esbuild's CSS minifier.
      cssMinify: 'lightningcss',
    },
  },
});
