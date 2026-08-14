// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import { SITE_URL } from './scripts/lib/config.mjs';
import { partialRewrites } from './scripts/lib/partial-rewrites-plugin.mjs';

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
    sitemap({
      /**
       * Mirror what Yoast currently emits. The date archives are internally
       * linked but absent from WordPress' sitemaps, so listing them here would
       * newly invite crawling of pages that are meant to stay out of the index.
       */
      filter: page => !/\/\d{4}\/\d{2}\/\d{2}\//.test(page),
    }),
  ],

  /**
   * Warm the next navigation on hover. Deliberately not `viewport`: blog index
   * and related-post grids put dozens of links on screen at once, and
   * prefetching all of them would cost more than it saves.
   */
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  vite: {
    plugins: [partialRewrites()],
    build: {
      // Faster and tighter than esbuild's CSS minifier.
      cssMinify: 'lightningcss',
    },
  },
});
