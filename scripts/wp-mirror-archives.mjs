// Mirror the WordPress archive pages (category, author, date) that the mirrored
// pages link to. Same pipeline as wp-extract-content, but for nested routes.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { extractInlineScripts, writeScriptBundle } from './lib/inline-scripts.mjs';

import { rewriteWpUrls, wpMediaRe, WP_ORIGIN, WP_HOST } from './lib/config.mjs';

const ORIGIN = WP_ORIGIN;
const PROJECT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(PROJECT, '.wp-cache');
const OUT_ROOT = path.join(PROJECT, 'public', 'wp-assets');

/** The seven blog categories. Their slugs are fixed by WordPress. */
const CATEGORY_ARCHIVES = [
  '/category/telecom/', '/category/mvno/', '/category/esim/',
  '/category/spenza-product/', '/category/tem/', '/category/iot/',
  '/category/byod/',
];

/**
 * Date and author archives are derived from the posts themselves rather than
 * listed by hand: every post's `post-info` widget links its own date archive and
 * its author archive, so a hand-maintained list goes stale the moment a post is
 * published and leaves those links dead.
 */
async function discoverArchives() {
  const wp = async p => {
    const r = await fetch(ORIGIN + p, {
      headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0 Chrome/131' },
    });
    if (!r.ok) throw new Error(`${p}: HTTP ${r.status}`);
    return r.json();
  };

  const posts = [];
  for (let page = 1; ; page++) {
    const batch = await wp(`/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=date,status`);
    posts.push(...batch);
    if (batch.length < 100) break;
  }

  const dates = new Set();
  for (const p of posts) {
    if (p.status && p.status !== 'publish') continue;
    const [y, m, d] = p.date.slice(0, 10).split('-');
    dates.add(`/${y}/${m}/${d}/`);
  }

  // The users endpoint needs a REST nonce that a cookie jar alone cannot supply,
  // so take the authors from the author links the mirrored posts already carry.
  const authors = new Set();
  const postDir = path.join(PROJECT, 'src', 'partials', 'posts');
  for (const file of await fs.readdir(postDir).catch(() => [])) {
    if (!file.endsWith('.html')) continue;
    const html = await fs.readFile(path.join(postDir, file), 'utf8');
    for (const m of html.matchAll(/href="(\/author\/[^"/]+\/)"/g)) authors.add(m[1]);
  }

  return [...CATEGORY_ARCHIVES, ...[...authors].sort(), ...[...dates].sort()];
}

const EXCLUDE = [
  'admin-bar', 'dashicons', 'wordfence', 'gravatar-enhanced', 'zip-ai',
  'noticons', 'adminbar', 'litespeed', 'coming-soon', 'jetpack',
  'wp-includes/css/admin-bar', 'notes/admin-bar', 'customize-',
];
const isExcluded = u => EXCLUDE.some(x => u.includes(x));

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

const ARCHIVES = await discoverArchives();
process.stdout.write(`archives to mirror: ${ARCHIVES.length}\n\n`);

function extractDivBlock(html, startRe) {
  const m = startRe.exec(html);
  if (!m) return null;
  const tagRe = /<div\b|<\/div>/gi;
  tagRe.lastIndex = m.index;
  let depth = 0, t;
  while ((t = tagRe.exec(html))) {
    if (t[0].toLowerCase() === '</div>') {
      depth--;
      if (depth === 0) return html.slice(m.index, t.index + 6);
    } else depth++;
  }
  return null;
}

function stripDeadScripts(html) {
  return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, (tag, body) =>
    /\bgform\b|\bgformInitSpinner\b|ak_js_/.test(body) ? '' : tag
  );
}

const rewriteUrls = rewriteWpUrls;

function localPathFor(url) {
  const u = new URL(url);
  let p = u.pathname.replace(/^\/+/, '');
  if (u.hostname !== WP_HOST) p = path.posix.join('_cdn', u.hostname, p);
  return p;
}

const dataDir = path.join(PROJECT, 'src', 'data');
const readJson = async f => JSON.parse(await fs.readFile(path.join(dataDir, f), 'utf8'));
const styles = await readJson('wp-styles.json');
const inlineStyles = await readJson('wp-inline-styles.json');
const pagesJson = await readJson('wp-pages.json');
const scriptsJson = await readJson('wp-scripts.json');

const partialDir = path.join(PROJECT, 'src', 'partials', 'archives');
const scriptDir = path.join(PROJECT, 'public', 'scripts', 'page');
await fs.mkdir(partialDir, { recursive: true });
await fs.mkdir(path.join(OUT_ROOT, 'inline'), { recursive: true });

const mediaRefs = new Set();
const generated = [];

for (const route of ARCHIVES) {
  const key = 'archive' + route.replace(/\/$/, '').replace(/\//g, '-');   // archive-category-telecom
  let html;
  try {
    const res = await fetch(ORIGIN + route, {
      headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0 Chrome/131' },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    html = await res.text();
  } catch (e) {
    process.stdout.write(`!! ${route} -> ${e.message}\n`);
    continue;
  }

  // --- stylesheets ---
  // Whole document, in document order: Gravity Forms enqueues its stylesheets
  // from the shortcode, so they land in the body — a head-only scan drops them
  // and the subscribe form loses `hidden_label`, exposing its "Email(Required)".
  const hrefs = [...html.matchAll(/<link[^>]+rel=['"]stylesheet['"][^>]*>/g)]
    .map(t => (t[0].match(/href=['"]([^'"]+)['"]/) || [])[1])
    .filter(Boolean).map(h => h.replace(/&#0?38;/g, '&'))
    .map(h => (h.startsWith('//') ? 'https:' + h : h))
    .filter(h => /^https?:/.test(h) && !isExcluded(h));

  const localHrefs = [];
  for (const href of hrefs) {
    const clean = href.split('#')[0];
    const rel = localPathFor(clean);
    const dest = path.join(OUT_ROOT, rel);
    localHrefs.push('/wp-assets/' + rel.split(path.sep).join('/'));
    if (existsSync(dest)) continue;
    try {
      const r = await fetch(clean, {
        headers: { Cookie: clean.startsWith(ORIGIN) ? cookieHeader : '', 'User-Agent': 'Mozilla/5.0 Chrome/131' },
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const body = /\.css($|\?)/.test(clean)
        ? rewriteUrls(await r.text())
        : Buffer.from(await r.arrayBuffer());
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, body);
    } catch { /* a missing optional stylesheet should not abort the archive */ }
  }

  // --- inline css ---
  const chunks = [];
  // Whole document: WPCode/Elementor emit <style> in the body too.
  for (const m of html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
    const id = (m[1].match(/id=['"]([^'"]*)['"]/) || [])[1] || '';
    if (['admin-bar-inline-css', 'wp-emoji-styles-inline-css'].includes(id)) continue;
    if (m[2].trim()) chunks.push(`/* ${id || 'inline'} */\n${m[2].trim()}`);
  }
  const css = rewriteUrls(chunks.join('\n\n'));
  const hash = crypto.createHash('sha1').update(css).digest('hex').slice(0, 10);
  const inlineFile = path.join(OUT_ROOT, 'inline', `inline-${hash}.css`);
  if (!existsSync(inlineFile)) await fs.writeFile(inlineFile, css, 'utf8');

  // --- content ---
  const content =
    extractDivBlock(html, /<div[^>]+data-elementor-type="archive"[^>]*>/) ||
    extractDivBlock(html, /<div[^>]+id="content"[^>]+class="site-content"[^>]*>/);
  if (!content) { process.stdout.write(`!! no content block for ${route}\n`); continue; }

  for (const m of content.matchAll(wpMediaRe())) {
    mediaRefs.add(m[1].replace(/&#0?38;/g, '&').split('?')[0]);
  }

  await fs.writeFile(
    path.join(partialDir, key + '.html'),
    stripDeadScripts(rewriteUrls(content)), 'utf8'
  );

  const bodyClass = ((html.match(/<body[^>]*\bclass="([^"]*)"/) || [])[1] || '')
    .split(/\s+/)
    .filter(c => c && !['logged-in', 'admin-bar', 'no-customize-support', 'customize-support'].includes(c))
    .join(' ');

  // --- footer scripts ---
  // The archives carry the same WPCode/eael snippets the pages do — one of them
  // relabels the subscribe button — and they live outside the content block.
  const { scripts: pageScripts, jsonLd } = extractInlineScripts(html);
  const scriptPath = await writeScriptBundle(scriptDir, key, pageScripts, 'npm run wp:archives');

  styles[key] = localHrefs;
  inlineStyles[key] = `/wp-assets/inline/inline-${hash}.css`;
  scriptsJson[key] = { script: scriptPath, jsonLd };
  pagesJson[key] = {
    // Keep the route: the key alone cannot be de-slugged reliably
    // (archive-category-spenza-product is /category/spenza-product/).
    route,
    title: ((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').trim(),
    description: ((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').trim(),
    bodyClass,
  };

  // --- astro page at the matching nested route ---
  const segments = route.replace(/^\/|\/$/g, '').split('/');
  const pageFile = path.join(PROJECT, 'src', 'pages', ...segments) + '.astro';
  const up = '../'.repeat(segments.length);
  await fs.mkdir(path.dirname(pageFile), { recursive: true });
  await fs.writeFile(pageFile, `---
import WpLayout from '${up}layouts/WpLayout.astro';
import content from '${up}partials/archives/${key}.html?raw';
---

<WpLayout slug="${key}">
  <Fragment set:html={content} />
</WpLayout>
`, 'utf8');

  generated.push(route);
  process.stdout.write(`${route.padEnd(30)} css:${localHrefs.length} inline:${(css.length / 1024).toFixed(0)}KB js:${pageScripts.length}\n`);
}

// --- download any media the archives introduced ---
const missing = [...mediaRefs].filter(rel => !existsSync(path.join(PROJECT, 'public', rel)));
process.stdout.write(`\narchive media: ${mediaRefs.size}, missing: ${missing.length}\n`);
let ok = 0;
for (let i = 0; i < missing.length; i += 12) {
  await Promise.all(missing.slice(i, i + 12).map(async rel => {
    try {
      const r = await fetch(ORIGIN + encodeURI(rel), {
        headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0 Chrome/131' },
      });
      if (!r.ok) return;
      const dest = path.join(PROJECT, 'public', rel);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, Buffer.from(await r.arrayBuffer()));
      ok++;
    } catch { /* skip */ }
  }));
}
process.stdout.write(`downloaded: ${ok}\n`);

await fs.writeFile(path.join(dataDir, 'wp-styles.json'), JSON.stringify(styles, null, 2), 'utf8');
await fs.writeFile(path.join(dataDir, 'wp-inline-styles.json'), JSON.stringify(inlineStyles, null, 2), 'utf8');
await fs.writeFile(path.join(dataDir, 'wp-pages.json'), JSON.stringify(pagesJson, null, 2), 'utf8');
await fs.writeFile(path.join(dataDir, 'wp-scripts.json'), JSON.stringify(scriptsJson, null, 2), 'utf8');
process.stdout.write(`\ngenerated ${generated.length} archive routes\n`);
