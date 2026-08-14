// The site's own behaviour (tab panels, the case-study cards, the step ticker,
// popups, mobile submenus) lives in inline <script> blocks that WordPress
// injects in the footer — outside the Elementor content block, so the content
// extractor never saw them. Pull them into a per-page JS bundle.
//
// The extraction policy is shared with wp-mirror-archives via scripts/lib.
import fs from 'node:fs/promises';
import path from 'node:path';
import { extractInlineScripts, writeScriptBundle } from './lib/inline-scripts.mjs';

const PROJECT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(PROJECT, '.wp-cache');
const PAGES_DIR = path.join(CACHE, 'pages');
const OUT_DIR = path.join(PROJECT, 'public', 'scripts', 'page');

await fs.mkdir(OUT_DIR, { recursive: true });

const files = (await fs.readdir(PAGES_DIR)).filter(f => f.endsWith('.html'));
const manifest = {};

for (const file of files) {
  const slug = file.replace(/\.html$/, '');
  const html = await fs.readFile(path.join(PAGES_DIR, file), 'utf8');

  const { scripts, jsonLd } = extractInlineScripts(html);
  const script = await writeScriptBundle(OUT_DIR, slug, scripts, 'npm run wp:scripts');

  manifest[slug] = { script, jsonLd };
  process.stdout.write(`${slug.padEnd(52)} scripts:${String(scripts.length).padStart(2)}  ld+json:${jsonLd.length}\n`);
}

// Merge rather than overwrite: wp-mirror-posts and wp-mirror-archives add their
// own keys (post-*, archive-*), and re-running this script must not drop them.
const scriptsFile = path.join(PROJECT, 'src', 'data', 'wp-scripts.json');
let existingScripts = {};
try {
  existingScripts = JSON.parse(await fs.readFile(scriptsFile, 'utf8'));
} catch { /* first run */ }

await fs.writeFile(scriptsFile, JSON.stringify({ ...existingScripts, ...manifest }, null, 2), 'utf8');
process.stdout.write('\nwrote src/data/wp-scripts.json\n');
