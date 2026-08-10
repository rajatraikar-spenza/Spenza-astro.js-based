// Capture the stylesheet set, inline CSS and body classes that WordPress uses
// for a single blog post, and register them under the "__post__" key so the
// blog route can reuse them.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const ORIGIN = 'https://preprod.spenza.com';
const PROJECT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(PROJECT, '.wp-cache');
const OUT_ROOT = path.join(PROJECT, 'public', 'wp-assets');
const SAMPLE = process.env.SAMPLE || path.join(CACHE, 'pages-post-sample.html');

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

function localPathFor(url) {
  const u = new URL(url);
  let p = u.pathname.replace(/^\/+/, '');
  if (u.hostname !== 'preprod.spenza.com') p = path.posix.join('_cdn', u.hostname, p);
  return p;
}

function rewriteCssUrls(css) {
  return css
    .replace(/https?:\/\/preprod\.spenza\.com\/wp-content\/uploads\//g, '/wp-content/uploads/')
    .replace(/https?:\/\/preprod\.spenza\.com\/wp-content\//g, '/wp-assets/wp-content/')
    .replace(/https?:\/\/preprod\.spenza\.com\/?/g, '/');
}

const html = await fs.readFile(SAMPLE, 'utf8');
const head = html.slice(0, html.indexOf('</head>'));

// ---- Stylesheets --------------------------------------------------------
const hrefs = [...head.matchAll(/<link[^>]+rel=['"]stylesheet['"][^>]*>/g)]
  .map(t => (t[0].match(/href=['"]([^'"]+)['"]/) || [])[1])
  .filter(Boolean)
  .map(h => h.replace(/&#0?38;/g, '&'))
  .map(h => (h.startsWith('//') ? 'https:' + h : h))
  .filter(h => /^https?:/.test(h) && !isExcluded(h));

const localHrefs = [];
let fetchedCount = 0;
for (const href of hrefs) {
  const clean = href.split('#')[0];
  const rel = localPathFor(clean);
  const dest = path.join(OUT_ROOT, rel);
  const publicUrl = '/wp-assets/' + rel.split(path.sep).join('/');
  localHrefs.push(publicUrl);

  if (existsSync(dest)) continue;
  try {
    const res = await fetch(clean, {
      headers: { Cookie: clean.startsWith(ORIGIN) ? cookieHeader : '', 'User-Agent': 'Mozilla/5.0 Chrome/131' },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const body = /\.css($|\?)/.test(clean)
      ? rewriteCssUrls(await res.text())
      : Buffer.from(await res.arrayBuffer());
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, body);
    fetchedCount++;
  } catch (e) {
    process.stdout.write(`  ! ${clean} -> ${e.message}\n`);
  }
}
process.stdout.write(`post stylesheets: ${localHrefs.length} (newly fetched: ${fetchedCount})\n`);

// ---- Inline head CSS ----------------------------------------------------
const SKIP_IDS = ['admin-bar-inline-css', 'wp-emoji-styles-inline-css'];
const chunks = [];
// Whole document: WPCode/Elementor emit <style> in the body too.
for (const m of html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
  const id = (m[1].match(/id=['"]([^'"]*)['"]/) || [])[1] || '';
  if (SKIP_IDS.includes(id)) continue;
  const css = m[2].trim();
  if (css) chunks.push(`/* ${id || 'inline'} */\n${css}`);
}
const inlineCss = rewriteCssUrls(chunks.join('\n\n'));
const hash = crypto.createHash('sha1').update(inlineCss).digest('hex').slice(0, 10);
await fs.mkdir(path.join(OUT_ROOT, 'inline'), { recursive: true });
await fs.writeFile(path.join(OUT_ROOT, 'inline', `inline-${hash}.css`), inlineCss, 'utf8');
process.stdout.write(`inline css: ${(inlineCss.length / 1024).toFixed(0)}KB -> inline-${hash}.css\n`);

// ---- Body classes -------------------------------------------------------
const bodyClass = ((html.match(/<body[^>]*\bclass="([^"]*)"/) || [])[1] || '')
  .split(/\s+/)
  .filter(c => c && !['logged-in', 'admin-bar', 'no-customize-support', 'customize-support'].includes(c))
  // Strip the sample post's own identity so it does not leak onto every post.
  .filter(c => !/^(postid-|post-\d|category-|tag-)/.test(c))
  .join(' ');

// ---- Register under __post__ -------------------------------------------
const dataDir = path.join(PROJECT, 'src', 'data');
const readJson = async f => JSON.parse(await fs.readFile(path.join(dataDir, f), 'utf8'));

const styles = await readJson('wp-styles.json');
const inline = await readJson('wp-inline-styles.json');
const pagesJson = await readJson('wp-pages.json');

styles.__post__ = localHrefs;
inline.__post__ = `/wp-assets/inline/inline-${hash}.css`;
pagesJson.__post__ = { title: '', description: '', bodyClass };

await fs.writeFile(path.join(dataDir, 'wp-styles.json'), JSON.stringify(styles, null, 2), 'utf8');
await fs.writeFile(path.join(dataDir, 'wp-inline-styles.json'), JSON.stringify(inline, null, 2), 'utf8');
await fs.writeFile(path.join(dataDir, 'wp-pages.json'), JSON.stringify(pagesJson, null, 2), 'utf8');

process.stdout.write(`registered __post__\nbodyClass: ${bodyClass}\n`);
