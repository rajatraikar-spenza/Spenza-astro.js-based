/**
 * Serve the sitemap index at `/sitemap.xml` as well as `/sitemap-index.xml`.
 *
 * `@astrojs/sitemap` names its index `sitemap-index.xml` and exposes no option
 * to change it, so the one filename every crawler probes without being told —
 * Search Console's "add a sitemap" field defaults to it, and most third-party
 * SEO tools try it before reading robots.txt — was a 404 on this site.
 *
 * A copy rather than a redirect. A static host cannot answer 301 on its own,
 * and the redirect machinery this build does have (`_redirects`, the CloudFront
 * router function) would put a hop in front of a file that is 189 bytes. Two
 * identical sitemap indexes cost nothing: they name the same children, and
 * robots.txt advertises one of them.
 *
 * Must be registered *after* `sitemap()` in the integrations array. Astro runs
 * `astro:build:done` hooks in integration order, so registered before it this
 * copies a file that does not exist yet — which is why it warns rather than
 * throws if the source is missing, so the failure names its own cause.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE = 'sitemap-index.xml';
const ALIAS = 'sitemap.xml';

export function sitemapAlias() {
  return {
    name: 'spenza:sitemap-alias',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        // Not `dir.pathname`: this project's own path contains a space, which
        // a URL keeps percent-encoded and `fs` then cannot find.
        const out = fileURLToPath(dir);
        try {
          await fs.copyFile(path.join(out, SOURCE), path.join(out, ALIAS));
          logger.info(`${ALIAS}: written from ${SOURCE}`);
        } catch (err) {
          if (err.code !== 'ENOENT') throw err;
          logger.warn(
            `${SOURCE} does not exist, so ${ALIAS} was not written. This ` +
            `integration must be registered after sitemap() — build:done hooks ` +
            `run in integration order.`
          );
        }
      },
    },
  };
}
