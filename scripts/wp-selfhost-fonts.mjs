// Mirror the Google Fonts the mirrored markup still pulls from Google.
//
// Three distinct `fonts.googleapis.com/css2` requests survive the mirror: one
// as a `<link>` in page markup, two as `@import` inside inline CSS that now
// ends up in the purged bundles. Each costs a DNS lookup, a TLS handshake and a
// render-blocking response to a third party before the font itself is fetched —
// and the fonts then come from a *second* host, fonts.gstatic.com.
//
// This downloads the CSS Google would serve, downloads every woff2 it names,
// and writes a local stylesheet per original URL. The URL -> local map goes to
// src/data/wp-google-fonts.json, which the partial rewrite plugin and the CSS
// optimiser both read, so nothing has to hand-edit a generated partial.
//
// Re-run when the mirror picks up a new font request:  npm run wp:fonts
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PROJECT } from './lib/config.mjs';

const PUB = path.join(PROJECT, 'public');
const DATA = path.join(PROJECT, 'src', 'data');
const OUT_DIR = path.join(PUB, 'wp-assets', '_fonts');

/**
 * A current Chrome UA, because Google serves a different stylesheet per client.
 * With Node's default agent it returns ttf; with this it returns woff2, which is
 * roughly half the size and what every browser this site targets supports.
 */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * Where to look for Google Fonts references.
 *
 * `dist` is included deliberately, and it makes this a two-pass job: post
 * bodies come from WordPress at build time and exist nowhere on disk until a
 * build has run, so a font requested only by a post is invisible to a scan of
 * the repo. One such request — Lexend Deca and Manrope — was found only this
 * way. Build, run this, build again; the second build picks up the new map.
 */
const SOURCES = [
  path.join(PROJECT, 'src', 'partials'),
  path.join(PUB, 'wp-assets', 'inline'),
  path.join(PROJECT, 'dist'),
];

const GF_RE = /https:\/\/fonts\.googleapis\.com\/css2\?[^"')\s]+/g;

async function walk(dir, out = []) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (/\.(html|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

// ---- find every distinct request -------------------------------------------
const found = new Map(); // normalised url -> count
for (const dir of SOURCES) {
  for (const file of await walk(dir)) {
    const text = await fs.readFile(file, 'utf8');
    for (const raw of text.match(GF_RE) ?? []) {
      // Markup carries `&#038;` where CSS carries a bare `&`; both name the
      // same stylesheet, so normalise before deduping or the same font is
      // downloaded twice under two keys.
      const url = raw.replace(/&#0?38;/g, '&').replace(/&amp;/g, '&');
      found.set(url, (found.get(url) ?? 0) + 1);
    }
  }
}

if (!found.size) {
  process.stdout.write('no Google Fonts references found — nothing to do\n');
  process.exit(0);
}

process.stdout.write(`${found.size} distinct Google Fonts requests\n\n`);

await fs.mkdir(OUT_DIR, { recursive: true });

const map = {};
let fontsFetched = 0, fontBytes = 0;

for (const [url, uses] of found) {
  process.stdout.write(`${url.slice(0, 96)}${url.length > 96 ? '…' : ''}\n`);

  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    process.stdout.write(`  SKIPPED — Google answered ${res.status}\n\n`);
    continue;
  }
  let css = await res.text();

  // Download each face and point the rule at the local copy.
  const files = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)]
    .map(m => m[1]))];

  for (const remote of files) {
    // Keep Google's own filename: it already encodes family, weight and subset.
    const name = path.basename(new URL(remote).pathname);
    const dest = path.join(OUT_DIR, name);
    if (!existsSync(dest)) {
      const bin = await fetch(remote, { headers: { 'User-Agent': UA } });
      if (!bin.ok) {
        process.stdout.write(`  WARN — ${name} answered ${bin.status}, leaving it remote\n`);
        continue;
      }
      const buf = Buffer.from(await bin.arrayBuffer());
      await fs.writeFile(dest, buf);
      fontsFetched++;
      fontBytes += buf.length;
    }
    css = css.split(remote).join(`/wp-assets/_fonts/${name}`);
  }

  // Content-addressed like the CSS bundles, so a changed request is a new file
  // and the old one can be cached forever.
  const hash = crypto.createHash('sha1').update(css).digest('hex').slice(0, 10);
  const local = `/wp-assets/_fonts/gf-${hash}.css`;
  await fs.writeFile(path.join(OUT_DIR, `gf-${hash}.css`), css, 'utf8');

  map[url] = local;
  process.stdout.write(`  -> ${local}  (${files.length} faces, ${uses} reference${uses > 1 ? 's' : ''})\n\n`);
}

await fs.writeFile(
  path.join(DATA, 'wp-google-fonts.json'),
  JSON.stringify(map, null, 2) + '\n',
  'utf8'
);

process.stdout.write(
  `mapped ${Object.keys(map).length} stylesheets, ` +
  `downloaded ${fontsFetched} font files (${(fontBytes / 1024).toFixed(0)}KB)\n` +
  `wrote src/data/wp-google-fonts.json\n`
);
