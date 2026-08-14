// Extract Elementor header/footer/content from the mirrored pages, download any
// missing media, and rewrite every preprod URL to a local one.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parse, serializeOuter } from 'parse5';

import { rewriteWpUrls, wpMediaRe, WP_ORIGIN, WP_HOST } from './lib/config.mjs';

const ORIGIN = WP_ORIGIN;
const PROJECT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(PROJECT, '.wp-cache');
const PAGES_DIR = path.join(CACHE, 'pages');

const cookieHeader = await (async () => {
  const raw = await fs.readFile(path.join(CACHE, 'cookies.txt'), 'utf8');
  const seen = new Set();
  return raw.split('\n')
    .map(l => l.replace(/\r$/, '').replace(/^#HttpOnly_/, ''))
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('\t')).filter(p => p.length >= 7)
    .map(p => [p[5].trim(), p[6].trim()])
    .filter(([k, v]) => k && v && !seen.has(k) && seen.add(k))
    .map(([k, v]) => `${k}=${v}`).join('; ');
})();

/**
 * Find the first element satisfying `pred` in a parse5 tree.
 *
 * Counting raw `<div>`/`</div>` pairs is not safe here: the Elementor HTML
 * widgets contain unbalanced markup, which made the counter close early and
 * silently truncate the page. Parse the document properly instead.
 */
function findElement(node, pred) {
  const children = node.childNodes || [];
  for (const child of children) {
    if (child.tagName && pred(child)) return child;
    const found = findElement(child, pred);
    if (found) return found;
  }
  return null;
}

const attr = (node, name) =>
  (node.attrs || []).find(a => a.name === name)?.value ?? '';

/** Serialize the first element matching `pred`, including its own tag. */
function extractElement(html, pred, doc) {
  const tree = doc ?? parse(html);
  const el = findElement(tree, pred);
  return el ? serializeOuter(el) : null;
}

const byElementorType = type => node => attr(node, 'data-elementor-type') === type;
const bySiteContent = node =>
  attr(node, 'id') === 'content' && attr(node, 'class').split(/\s+/).includes('site-content');

/**
 * Remove inline scripts that depend on a WordPress runtime we no longer ship
 * (Gravity Forms' `gform`/jQuery bootstrap, Akismet's timestamp field). They
 * only throw ReferenceErrors in a static build; the form markup itself stays.
 */
function stripDeadScripts(html) {
  return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, (tag, body) =>
    /\bgform\b|\bgformInitSpinner\b|ak_js_/.test(body) ? '' : tag
  );
}

/**
 * Swap the raster site logo for the vector one in public/. The WordPress logo
 * ships as a 268x136 WebP, which is soft on high-DPI screens; the SVG is
 * 1264x428, so the intrinsic size is corrected to keep the aspect ratio.
 */
function useVectorLogo(html) {
  return html.replace(
    /<img([^>]*\bclass="[^"]*wp-image-17810[^"]*"[^>]*)>/g,
    (tag, attrs) => {
      const cleaned = attrs
        .replace(/\s(?:src|srcset|sizes|width|height)="[^"]*"/g, '')
        .trim();
      return `<img src="/spenza-logo-vector.svg" width="1264" height="428" ${cleaned}>`;
    }
  );
}

/** Rewrite every absolute WordPress reference to its local equivalent. */
const rewriteUrls = rewriteWpUrls;

// ---- Collect media references and download whatever is missing ------------
const files = (await fs.readdir(PAGES_DIR)).filter(f => f.endsWith('.html'));
const rawPages = new Map();
for (const f of files) {
  rawPages.set(f.replace(/\.html$/, ''), await fs.readFile(path.join(PAGES_DIR, f), 'utf8'));
}

const mediaRefs = new Set();
for (const html of rawPages.values()) {
  for (const m of html.matchAll(wpMediaRe())) {
    mediaRefs.add(m[1].replace(/&#0?38;/g, '&').split('?')[0]);
  }
}

const missing = [...mediaRefs].filter(p => !existsSync(path.join(PROJECT, 'public', p)));
process.stdout.write(`media referenced: ${mediaRefs.size}, missing: ${missing.length}\n`);

let ok = 0;
const mediaFailures = [];
const CONCURRENCY = 12;
for (let i = 0; i < missing.length; i += CONCURRENCY) {
  await Promise.all(missing.slice(i, i + CONCURRENCY).map(async rel => {
    const dest = path.join(PROJECT, 'public', rel);
    try {
      const res = await fetch(ORIGIN + encodeURI(rel), {
        headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0 Chrome/131' },
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
      ok++;
    } catch (e) {
      mediaFailures.push(`${rel} -> ${e.message}`);
    }
  }));
  process.stdout.write(`  media ${Math.min(i + CONCURRENCY, missing.length)}/${missing.length}\r`);
}
process.stdout.write(`\nmedia downloaded: ${ok}, failed: ${mediaFailures.length}\n`);

// ---- Extract header/footer once, and page content for each slug ----------
const home = rawPages.get('index');
const homeDoc = parse(home);
const header = extractElement(home, byElementorType('header'), homeDoc);
const footer = extractElement(home, byElementorType('footer'), homeDoc);
if (!header || !footer) throw new Error('header/footer extraction failed');

await fs.mkdir(path.join(PROJECT, 'src', 'partials', 'chrome'), { recursive: true });
await fs.writeFile(path.join(PROJECT, 'src/partials/chrome/header.html'), useVectorLogo(stripDeadScripts(rewriteUrls(header))), 'utf8');
await fs.writeFile(path.join(PROJECT, 'src/partials/chrome/footer.html'), stripDeadScripts(rewriteUrls(footer)), 'utf8');
process.stdout.write(`header: ${header.length} bytes, footer: ${footer.length} bytes\n`);

const pageIds = {};
for (const [slug, html] of rawPages) {
  // Elementor pages, then Elementor archive templates, then plain Astra pages.
  const doc = parse(html);
  const content =
    extractElement(html, byElementorType('wp-page'), doc) ||
    extractElement(html, byElementorType('archive'), doc) ||
    extractElement(html, bySiteContent, doc);
  if (!content) { process.stdout.write(`!! no content block for ${slug}\n`); continue; }
  const id = (content.match(/data-elementor-id="(\d+)"/) || [])[1];
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';

  // Astra and Elementor both key styling off body classes, so carry them over —
  // minus the ones that only exist because we scraped while logged in.
  const bodyClass = ((html.match(/<body[^>]*\bclass="([^"]*)"/) || [])[1] || '')
    .split(/\s+/)
    .filter(c => c && !['logged-in', 'admin-bar', 'no-customize-support', 'customize-support'].includes(c))
    .join(' ');

  pageIds[slug] = { id, title: title.trim(), description: desc.trim(), bodyClass };
  await fs.writeFile(path.join(PROJECT, "src", "partials", slug + ".html"), stripDeadScripts(rewriteUrls(content)), "utf8");
}

// Merge rather than overwrite: wp-mirror-archives and wp-post-template add
// their own keys (archive-*, __post__) to this file, and re-running this script
// must not drop them.
const pagesFile = path.join(PROJECT, 'src', 'data', 'wp-pages.json');
let existingPages = {};
try {
  existingPages = JSON.parse(await fs.readFile(pagesFile, 'utf8'));
} catch { /* first run */ }

await fs.writeFile(pagesFile, JSON.stringify({ ...existingPages, ...pageIds }, null, 2), 'utf8');
process.stdout.write(`\ncontent extracted for ${Object.keys(pageIds).length} pages\n`);
if (mediaFailures.length) {
  process.stdout.write('media failures:\n' + mediaFailures.slice(0, 25).join('\n') + '\n');
}
