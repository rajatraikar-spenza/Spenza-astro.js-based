/**
 * Serve the real URL list at `/sitemap.xml`.
 *
 * Two problems, one fix. `@astrojs/sitemap` names its index `sitemap-index.xml`
 * and exposes no option to change it, so the one filename every crawler probes
 * without being told — Search Console's "add a sitemap" field defaults to it —
 * was a 404 here. And that index is a `<sitemapindex>` with a single child, so
 * even reached under its own name it shows one link rather than the 354 URLs
 * one hop behind it. Opening it tells a person nothing.
 *
 * So this copies the child `<urlset>` up to `/sitemap.xml` whenever there is
 * exactly one — which is the shape of this site and will stay that way until it
 * passes the integration's 45,000-entry limit. Past that the index is doing
 * real work and gets copied instead, because a `/sitemap.xml` naming only the
 * first shard would silently hide every URL in the others.
 *
 * A copy rather than a redirect: a static host cannot answer 301 on its own,
 * and putting the `_redirects` machinery in front of a 28KB file buys nothing.
 * The originals stay where Astro wrote them, so anything already pointing at
 * `sitemap-index.xml` keeps working.
 *
 * Must be registered *after* `sitemap()` in the integrations array. Astro runs
 * `astro:build:done` hooks in integration order, so registered before it this
 * reads a file that does not exist yet — which is why a missing source warns
 * rather than throws, so the failure names its own cause.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const INDEX = 'sitemap-index.xml';
const ALIAS = 'sitemap.xml';

/** The `<loc>`s of a sitemap index, as bare filenames. */
function children(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].split('/').pop());
}

export function sitemapAlias() {
  return {
    name: 'spenza:sitemap-alias',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        // Not `dir.pathname`: this project's own path contains a space, which
        // a URL keeps percent-encoded and `fs` then cannot find.
        const out = fileURLToPath(dir);

        let index;
        try {
          index = await fs.readFile(path.join(out, INDEX), 'utf8');
        } catch (err) {
          if (err.code !== 'ENOENT') throw err;
          logger.warn(
            `${INDEX} does not exist, so ${ALIAS} was not written. This ` +
            `integration must be registered after sitemap() — build:done hooks ` +
            `run in integration order.`
          );
          return;
        }

        const shards = children(index);
        const source = shards.length === 1 ? shards[0] : INDEX;
        await fs.copyFile(path.join(out, source), path.join(out, ALIAS));

        const urls = source === INDEX
          ? `${shards.length} sitemaps`
          : `${(await fs.readFile(path.join(out, source), 'utf8')).match(/<loc>/g)?.length ?? 0} URLs`;
        logger.info(`${ALIAS}: written from ${source} (${urls})`);
      },
    },
  };
}
