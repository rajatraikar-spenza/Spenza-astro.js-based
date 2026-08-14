// The site serves WebP Express variants via <picture><source>. Those live
// outside wp-content/uploads, so the media pass missed them and every <picture>
// fell through to a 404 instead of the mirrored PNG.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { WP_ORIGIN, WP_HOST } from './lib/config.mjs';

const ORIGIN = WP_ORIGIN;
const PROJECT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(PROJECT, '.wp-cache');

const cookieHeader = await (async () => {
  const raw = await fs.readFile(path.join(CACHE, 'cookies.txt'), 'utf8');
  const seen = new Set();
  return raw.split('\n')
    .map(l => l.replace(/\r$/, '').replace(/^#HttpOnly_/, ''))
    .filter(l => l && !l.startsWith('#')).map(l => l.split('\t'))
    .filter(p => p.length >= 7).map(p => [p[5].trim(), p[6].trim()])
    .filter(([k, v]) => k && v && !seen.has(k) && seen.add(k))
    .map(([k, v]) => `${k}=${v}`).join('; ');
})();

// Collect every webp-express reference from the rewritten partials.
const dir = path.join(PROJECT, 'src', 'partials');
/** Every partial, including chrome/ and archives/. */
async function collectHtml(root) {
  const out = [];
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...await collectHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = await collectHtml(dir);

const refs = new Set();
for (const file of files) {
  const html = await fs.readFile(file, 'utf8');
  for (const m of html.matchAll(/\/wp-assets(\/wp-content\/webp-express\/[^\s"'),]+)/g)) {
    refs.add(m[1].split('?')[0]);
  }
}

const missing = [...refs].filter(r => !existsSync(path.join(PROJECT, 'public', 'wp-assets', r.replace(/^\//, ''))));
process.stdout.write(`webp refs: ${refs.size}, missing: ${missing.length}\n`);

let ok = 0;
const failed = [];
const CONCURRENCY = 12;
for (let i = 0; i < missing.length; i += CONCURRENCY) {
  await Promise.all(missing.slice(i, i + CONCURRENCY).map(async rel => {
    const dest = path.join(PROJECT, 'public', 'wp-assets', rel.replace(/^\//, ''));
    try {
      const res = await fetch(ORIGIN + encodeURI(rel), {
        headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0 Chrome/131', Accept: 'image/webp,*/*' },
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
      ok++;
    } catch (e) {
      failed.push(`${rel} -> ${e.message}`);
    }
  }));
  process.stdout.write(`  ${Math.min(i + CONCURRENCY, missing.length)}/${missing.length}\r`);
}

process.stdout.write(`\ndownloaded: ${ok}, failed: ${failed.length}\n`);
if (failed.length) process.stdout.write(failed.slice(0, 20).join('\n') + '\n');
