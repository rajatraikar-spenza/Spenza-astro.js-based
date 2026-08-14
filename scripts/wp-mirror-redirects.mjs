// Mirror WordPress' 301s.
//
// Post slugs and page paths have been renamed over the years, and WordPress
// still redirects every old URL to its current one. The blog content is full of
// those old links — a post written in 2024 links to /blog/<old-slug>/ — so
// without the redirects the mirror serves 404s where the live site serves the
// article.
//
// Rather than curate a list, ask the live site: crawl the mirror's own internal
// links, and for each one that 404s here, record what WordPress does with it.
import fs from 'node:fs/promises';
import path from 'node:path';
import { ORIGIN, PROJECT, readData, writeData } from './lib/wp-mirror.mjs';

const BASE = process.env.BASE || 'http://localhost:4322';

const pages = await readData('wp-pages.json');
const posts = await readData('wp-posts.json');

/**
 * Routes the mirror already serves in its own right — a redirect must never
 * shadow one, or two routes would generate the same path and the build fails.
 *
 * `/blog/<slug>/` belongs here too: `src/pages/blog/[slug].astro` already
 * redirects those, so recording them again would collide with it.
 */
const owned = new Set([
  '/',
  ...Object.values(posts).map(p => p.route),
  ...Object.keys(posts).map(slug => `/blog/${slug}/`),
  ...Object.values(pages).map(p => p.route).filter(Boolean),
  ...Object.keys(pages)
    .filter(k => k !== 'index' && k !== '__post__' && !pages[k].route)
    .map(k => `/${k}/`),
]);

function routeFor(key) {
  if (key === '__post__') return null;
  if (key === 'index') return '/';
  return pages[key]?.route ?? `/${key}`;
}

// ---- collect every internal link the mirror renders ---------------------
const links = new Set();
for (const key of Object.keys(pages)) {
  const route = routeFor(key);
  if (!route) continue;
  let html;
  try { html = await (await fetch(BASE + route)).text(); } catch { continue; }
  for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    let href = m[1].trim();
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    href = href.split('#')[0].split('?')[0];
    if (!href || /\.(png|jpe?g|gif|svg|webp|pdf|css|js|ico|woff2?|mp4)$/i.test(href)) continue;
    links.add(href);
  }
}
process.stdout.write(`internal links found: ${links.size}\n`);

// ---- keep the ones no real route of ours covers -------------------------
//
// Deliberately not "does the preview return 200": once these redirects are
// built, they answer 200 themselves, and the check would find nothing and empty
// the map. Testing against the real route list instead keeps the run idempotent.
const dead = [...links].filter(link => !owned.has(link)).sort();
process.stdout.write(`links no page of ours serves: ${dead.length}\n`);

// ---- ask WordPress what each one should do -----------------------------
const redirects = {};
const unresolved = [];

/**
 * Follow the chain to its end. Renamed twice means WordPress serves two hops
 * (/blog/mvno-launch-cost/ -> /mvno/mvno-launch-cost/ -> /mvno/mvno-mvno-launch-cost/),
 * and only the final URL is one this site serves.
 */
async function resolve(link) {
  const seen = new Set([link]);
  let url = link;
  for (let hop = 0; hop < 6; hop++) {
    const res = await fetch(ORIGIN + url, {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/131' },
      redirect: 'manual',
    });
    if (res.status !== 301 && res.status !== 302) return { status: res.status, target: url };
    const loc = res.headers.get('location');
    if (!loc) return { status: res.status, target: url };
    url = loc.replace(/^https?:\/\/[^/]+/, '') || '/';
    if (seen.has(url)) return { status: 508, target: url };   // loop
    seen.add(url);
    if (owned.has(url)) return { status: 301, target: url };
  }
  return { status: 310, target: url };
}

const CONC = 10;
for (let i = 0; i < dead.length; i += CONC) {
  await Promise.all(dead.slice(i, i + CONC).map(async link => {
    try {
      const { status, target } = await resolve(link);
      if (target !== link && owned.has(target)) redirects[link] = target;
      else if (status === 200) unresolved.push(`${link} (live page, not mirrored)`);
      else if (target !== link) unresolved.push(`${link} -> ${target} (target not mirrored)`);
      else unresolved.push(`${link} (live: HTTP ${status})`);
    } catch (e) {
      unresolved.push(`${link} (${e.message})`);
    }
  }));
}

await writeData('wp-redirects.json', Object.fromEntries(Object.entries(redirects).sort()));

process.stdout.write(`\nredirects mirrored: ${Object.keys(redirects).length}\n`);
process.stdout.write(`still unresolved:   ${unresolved.length}\n`);
if (unresolved.length) {
  process.stdout.write(unresolved.sort().map(u => `  ${u}`).join('\n') + '\n');
}
