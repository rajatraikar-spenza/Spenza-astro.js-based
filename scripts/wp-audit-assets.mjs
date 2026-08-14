// Fetch every mirrored page from the dev server and verify that each local
// asset it references actually resolves.
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:4322';
const pages = JSON.parse(await fs.readFile(path.join(path.resolve(import.meta.dirname,'..'),'src/data/wp-pages.json'), 'utf8'));
const slugs = Object.keys(pages);

const checked = new Map();   // url -> status
async function check(url) {
  if (checked.has(url)) return checked.get(url);
  let status = 0;
  try {
    const res = await fetch(BASE + url, { method: 'GET' });
    status = res.status;
  } catch { status = -1; }
  checked.set(url, status);
  return status;
}

/** Pull every same-origin asset reference out of a rendered page. */
function collectAssets(html) {
  const out = new Set();
  const push = u => {
    if (!u) return;
    u = u.trim().split('?')[0];
    if (u.startsWith('/') && !u.startsWith('//')) out.add(u);
  };

  for (const m of html.matchAll(/<(?:img|script|source|iframe)\b[^>]*\bsrc="([^"]+)"/g)) push(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*\bhref="([^"]+)"/g)) push(m[1]);
  for (const m of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const part of m[1].split(',')) push(part.trim().split(/\s+/)[0]);
  }
  for (const m of html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) push(m[1]);
  return [...out];
}

/**
 * wp-pages.json is keyed by data key, not by route: "index" is "/", archive
 * entries encode a nested path, and "__post__" is a shared style bundle rather
 * than a page of its own.
 */
function routeFor(key) {
  if (key === '__post__') return null;
  if (key === 'index') return '/';
  // Archive entries record their own route; the key is not reversible.
  // The fallback carries a trailing slash because that is the form the site
  // serves (`trailingSlash: 'always'`) — without it the audit requests a URL
  // that 404s and reports zero assets for a page that is actually fine.
  return pages[key]?.route ?? `/${key}/`;
}

const report = [];
for (const slug of slugs) {
  const url = routeFor(slug);
  if (!url) continue;
  const res = await fetch(BASE + url);
  const html = await res.text();
  const assets = collectAssets(html);

  const bad = [];
  const CONC = 24;
  for (let i = 0; i < assets.length; i += CONC) {
    const batch = assets.slice(i, i + CONC);
    const statuses = await Promise.all(batch.map(check));
    batch.forEach((a, j) => { if (statuses[j] !== 200) bad.push(`${statuses[j]} ${a}`); });
  }

  report.push({ slug, pageStatus: res.status, assets: assets.length, bad });
  process.stdout.write(
    `${String(res.status).padEnd(4)}${slug.padEnd(52)} assets:${String(assets.length).padStart(4)}  broken:${bad.length}\n`
  );
}

const totalBad = report.reduce((n, r) => n + r.bad.length, 0);
process.stdout.write(`\n=== ${totalBad} broken references across ${slugs.length} pages ===\n`);

const seen = new Set();
for (const r of report) {
  for (const b of r.bad) {
    if (seen.has(b)) continue;
    seen.add(b);
    process.stdout.write(`  ${b}   (first seen: ${r.slug})\n`);
  }
}
process.stdout.write(`unique broken: ${seen.size}\n`);
