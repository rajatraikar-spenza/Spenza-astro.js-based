// Verify a built `dist` is internally complete.
//
// The two existing audits crawl a preview server and check what pages link to.
// Neither can see the failure this catches: a reference that resolves locally
// today and 404s once the media trees stop being deployed. That gap let 264
// blog thumbnails break silently, because the loader's cache digest did not
// include MEDIA_ORIGIN and reused records rewritten for a different origin.
//
// Checks two things against the finished output:
//
//   MISSING   a same-origin asset — from an href, src, srcset or CSS url() —
//             with no file behind it. Always a bug.
//   STRANDED  a local media path when a media host is configured, meaning some
//             rewrite missed it. Only meaningful with MEDIA_ORIGIN set; without
//             one, local media paths are exactly right.
//
//   npm run wp:verify-dist                        # after a plain build
//   npm run wp:verify-dist https://media.spenza.com   # after a media-host build
import fs from 'node:fs';
import path from 'node:path';

const MEDIA = process.argv[2] || '';
const ROOT = 'dist';

function walk(d, out = []) {
  if (!fs.existsSync(d)) return out;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const html = files.filter(f => f.endsWith('.html'));
const css = files.filter(f => f.endsWith('.css'));
const js = files.filter(f => f.endsWith('.js'));

/** Same-origin asset references, by where they came from. */
const refs = new Map(); // url -> Set(source files)
const add = (url, src) => {
  if (!url || !url.startsWith('/') || url.startsWith('//')) return;
  const clean = url.split(/[?#]/)[0];
  if (!/\.[a-z0-9]{2,5}$/i.test(clean)) return; // pages, not assets
  if (!refs.has(clean)) refs.set(clean, new Set());
  refs.get(clean).add(src);
};

for (const f of html) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/\b(?:src|href|data-src)=["']([^"']+)["']/g)) add(m[1], f);
  for (const m of t.matchAll(/\bsrcset=["']([^"']+)["']/g))
    for (const c of m[1].split(',')) add(c.trim().split(/\s+/)[0], f);
  for (const m of t.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/g)) add(m[2], f);
}
for (const f of [...css, ...js]) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/g)) add(m[2], f);
}

const missing = [];
for (const [url, srcs] of refs) {
  const abs = path.join(ROOT, decodeURIComponent(url));
  if (!fs.existsSync(abs)) missing.push({ url, src: [...srcs][0], n: srcs.size });
}

// Only meaningful when a media host is configured: then a local media path is a
// reference the rewrite missed. Without one, local media paths are correct.
const STRANDED = /^\/(wp-content\/uploads|wp-assets\/wp-content\/(webp-express|uploads))\//;
const stranded = MEDIA ? [...refs.keys()].filter(u => STRANDED.test(u)) : [];

let mediaRefs = 0;
if (MEDIA) {
  for (const f of [...html, ...css, ...js]) {
    mediaRefs += (fs.readFileSync(f, 'utf8').split(MEDIA).length - 1);
  }
}

const bytes = files.reduce((s, f) => s + fs.statSync(f).size, 0);
console.log(`dist                 ${files.length.toLocaleString()} files, ${(bytes / 1048576).toFixed(1)} MB`);
console.log(`  html/css/js        ${html.length} / ${css.length} / ${js.length}`);
console.log(`distinct asset refs  ${refs.size.toLocaleString()}`);
if (MEDIA) console.log(`refs to media host   ${mediaRefs.toLocaleString()}`);
console.log(`stranded local media ${stranded.length}`);
stranded.slice(0, 10).forEach(u => console.log(`   ${u}`));
console.log(`MISSING              ${missing.length}`);
missing.slice(0, 15).forEach(m => console.log(`   ${m.url}  (${m.n} sources, e.g. ${m.src})`));

process.exit(missing.length || stranded.length ? 1 : 0);
