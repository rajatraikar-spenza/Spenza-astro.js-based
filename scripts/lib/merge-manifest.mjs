/**
 * Load `src/data/merge-previews/index.ts` from a plain Node script.
 *
 * The manifest imports each merged body as `./<slug>.html?raw`, which Vite
 * resolves and Node cannot. esbuild (already a dependency) bundles it with the
 * `?raw` suffix dropped and `.html` loaded as text, so `MERGE_PREVIEWS` comes
 * back complete, bodies included.
 *
 * Reading the manifest beats re-deriving it: these records drive live
 * WordPress publishes, and a regex-sliced field would ship a wrong author or
 * meta description without erroring. An earlier hand-rolled parser silently
 * returned `undefined` for four of the twelve MVNO clusters.
 *
 * The shimmed source is fed through esbuild's `stdin` with `resolveDir` set to
 * the manifest's own directory, so the relative `./<slug>.html` imports still
 * resolve and nothing is written into the repo tree.
 */
import { buildSync } from 'esbuild';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const MERGE_PREVIEWS_DIR = join(HERE, '../../src/data/merge-previews');
const ENTRY = join(MERGE_PREVIEWS_DIR, 'index.ts');

let cached = null;

/** @returns {Record<string, any>} every merged cluster, keyed by destination slug. */
export function loadMergePreviews() {
  if (cached) return cached;

  const shimmed = readFileSync(ENTRY, 'utf8').replace(/\.html\?raw'/g, ".html'");
  const out = buildSync({
    stdin: { contents: shimmed, resolveDir: MERGE_PREVIEWS_DIR, sourcefile: 'index.ts', loader: 'ts' },
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    loader: { '.html': 'text' },
    logLevel: 'silent',
  });

  const mod = { exports: {} };
  const req = (id) => {
    throw new Error(`merge manifest pulled in an unexpected dependency: ${id}`);
  };
  new Function('module', 'exports', 'require', out.outputFiles[0].text)(mod, mod.exports, req);

  cached = mod.exports.MERGE_PREVIEWS || mod.exports.default;
  if (!cached || typeof cached !== 'object') {
    throw new Error('merge manifest did not export MERGE_PREVIEWS');
  }
  return cached;
}

/** The clusters belonging to one hub, in merge-plan order. */
export function clustersForHub(hub) {
  const planPath = join(MERGE_PREVIEWS_DIR, 'merge-plan.json');
  const plan = JSON.parse(readFileSync(planPath, 'utf8'));
  const all = Array.isArray(plan.clusters) ? plan.clusters : Object.values(plan.clusters || plan);
  const previews = loadMergePreviews();

  return all
    .filter((c) => !hub || c.hub === hub)
    .map((c) => {
      const raw = (c.destination && (c.destination.slug || c.destination)) || c.slug;
      const slug = String(raw).replace(/\/+$/, '').split('/').pop();
      const donors = c.donors || [];
      const num = (k) => donors.reduce((n, d) => n + (Number(d[k]) || 0), 0);
      return {
        id: c.id,
        slug,
        hub: c.hub,
        preview: previews[slug] || null,
        donors: donors.map((d) => d.path),
        // Publish order: least exposed first, so a mistake is found on the
        // cheapest page rather than the one carrying the traffic.
        exposure: num('gscClicks16m') * 10 + num('googleAiImpressions') + num('bingCitations') / 10,
      };
    })
    .sort((a, b) => a.exposure - b.exposure);
}

export { pathToFileURL };
