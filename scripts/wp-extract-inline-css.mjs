// Pull the inline <style> blocks out of each mirrored page head. Astra's dynamic
// theme CSS and the site's wp-custom-css only exist inline, so they'd be lost.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { rewriteWpUrls } from './lib/config.mjs';

const PROJECT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(PROJECT, '.wp-cache');
const OUT = path.join(PROJECT, 'public', 'wp-assets', 'inline');

const SKIP_IDS = ['admin-bar-inline-css', 'wp-emoji-styles-inline-css'];

const rewriteUrls = rewriteWpUrls;

await fs.mkdir(OUT, { recursive: true });
const files = (await fs.readdir(path.join(CACHE, 'pages'))).filter(f => f.endsWith('.html'));

const byHash = new Map();   // hash -> filename
const perPage = {};

for (const f of files) {
  const slug = f.replace(/\.html$/, '');
  const html = await fs.readFile(path.join(CACHE, 'pages', f), 'utf8');

  // Scan the whole document, not just <head>: WPCode snippets and Elementor
  // HTML widgets emit <style> blocks in the body, and those carry real layout
  // rules (for example the .client-card expanding case-study row).
  const chunks = [];
  for (const m of html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
    const id = (m[1].match(/id=['"]([^'"]*)['"]/) || [])[1] || '';
    if (SKIP_IDS.includes(id)) continue;
    const css = m[2].trim();
    if (!css) continue;
    chunks.push(`/* ${id || 'inline'} */\n${css}`);
  }
  const css = rewriteUrls(chunks.join('\n\n'));
  const hash = crypto.createHash('sha1').update(css).digest('hex').slice(0, 10);

  if (!byHash.has(hash)) {
    byHash.set(hash, `inline-${hash}.css`);
    await fs.writeFile(path.join(OUT, `inline-${hash}.css`), css, 'utf8');
  }
  perPage[slug] = '/wp-assets/inline/' + byHash.get(hash);
  process.stdout.write(`${slug.padEnd(52)} ${(css.length / 1024).toFixed(0)}KB  ${hash}\n`);
}

// Merge rather than overwrite: wp-mirror-posts and wp-mirror-archives add their
// own keys (post-*, archive-*, __post__), and re-running this script must not
// drop them.
const inlineFile = path.join(PROJECT, 'src', 'data', 'wp-inline-styles.json');
let existingInline = {};
try {
  existingInline = JSON.parse(await fs.readFile(inlineFile, 'utf8'));
} catch { /* first run */ }

await fs.writeFile(inlineFile, JSON.stringify({ ...existingInline, ...perPage }, null, 2), 'utf8');
process.stdout.write(`\nunique inline bundles: ${byHash.size}\n`);
