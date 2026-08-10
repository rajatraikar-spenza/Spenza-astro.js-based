// Crawl every mirrored page and verify each internal link resolves.
// Run against the dev server (default) or a preview build via BASE=...
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:4322';
const PROJECT = path.resolve(import.meta.dirname, '..');
const pages = JSON.parse(await fs.readFile(path.join(PROJECT, 'src/data/wp-pages.json'), 'utf8'));

const status = new Map();
async function check(url) {
  if (status.has(url)) return status.get(url);
  let code = 0;
  try {
    code = (await fetch(BASE + url, { redirect: 'follow' })).status;
  } catch { code = -1; }
  status.set(url, code);
  return code;
}

/** Internal page links only — assets are covered by wp-audit-assets. */
function collectLinks(html) {
  const out = new Set();
  for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    let href = m[1].trim();
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    href = href.split('#')[0].split('?')[0];
    if (!href) continue;
    if (/\.(png|jpe?g|gif|svg|webp|pdf|css|js|ico|woff2?|mp4)$/i.test(href)) continue;
    out.add(href);
  }
  return [...out];
}

const broken = new Map();   // link -> Set(pages)
let totalLinks = 0;

for (const slug of Object.keys(pages)) {
  const pageUrl = slug === 'index' ? '/' : `/${slug}`;
  const html = await (await fetch(BASE + pageUrl)).text();
  const links = collectLinks(html);
  totalLinks += links.length;

  const CONC = 20;
  for (let i = 0; i < links.length; i += CONC) {
    const batch = links.slice(i, i + CONC);
    const codes = await Promise.all(batch.map(check));
    batch.forEach((l, j) => {
      if (codes[j] === 200) return;
      if (!broken.has(l)) broken.set(l, new Set());
      broken.get(l).add(slug);
    });
  }
  process.stdout.write(`${slug.padEnd(52)} links:${String(links.length).padStart(4)}\n`);
}

process.stdout.write(`\nchecked ${status.size} unique links (${totalLinks} total)\n`);
process.stdout.write(`broken: ${broken.size}\n\n`);

for (const [link, onPages] of [...broken].sort()) {
  const list = [...onPages];
  const shown = list.slice(0, 4).join(', ') + (list.length > 4 ? ` +${list.length - 4} more` : '');
  process.stdout.write(`  ${String(status.get(link)).padEnd(4)} ${link.padEnd(60)} on: ${shown}\n`);
}
