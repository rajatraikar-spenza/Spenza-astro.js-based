// Capture the stylesheet set, inline CSS, footer scripts and body classes that
// WordPress uses for a single blog post, and register them under the "__post__"
// key so the blog route can reuse them.
//
// The capture rules are the shared ones in lib/wp-mirror.mjs and
// lib/inline-scripts.mjs. They used to be copied here, and the copy scanned only
// <head> — which silently dropped every stylesheet Gravity Forms enqueues from
// its shortcode, since those land in the body. The subscribe form at the foot of
// every post lost the whole `gravity-theme` sheet: its "Email (Required)" label
// stopped being visually hidden and the input no longer sat flush against the
// Subscribe button.
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  PROJECT, mirrorStylesheets, writeInlineCss, bodyClassOf, extractDivBlock,
} from './lib/wp-mirror.mjs';
import { extractInlineScripts, writeScriptBundle } from './lib/inline-scripts.mjs';

const CACHE = path.join(PROJECT, '.wp-cache');
const OUT_ROOT = path.join(PROJECT, 'public', 'wp-assets');
const SCRIPT_DIR = path.join(PROJECT, 'public', 'scripts', 'page');
const SHELL = path.join(PROJECT, 'src', 'partials', 'post-shell.html');
const SAMPLE = process.env.SAMPLE || path.join(CACHE, 'pages-post-sample.html');

const html = await fs.readFile(SAMPLE, 'utf8');

const localHrefs = await mirrorStylesheets(html, OUT_ROOT);
process.stdout.write(`post stylesheets: ${localHrefs.length}\n`);

const { href: inlineHref, bytes } = await writeInlineCss(html, OUT_ROOT);
process.stdout.write(`inline css: ${(bytes / 1024).toFixed(0)}KB -> ${inlineHref}\n`);

// ---- Footer scripts -----------------------------------------------------
/**
 * The behaviour WordPress attaches to every post: the mobile submenus, the
 * newsletter popup, the icon-box card effects, and the WPCode snippet that
 * relabels the subscribe button. `ArticleLayout` renders no page bundle without
 * this, so headless posts were the only pages on the site running none of it.
 *
 * Two exclusions keep the bundle to what belongs to *every* post:
 *
 *   - anything inside the post-content widget, which is the sample post's own
 *     body. Those scripts arrive with each post's `content` from WPGraphQL and
 *     already run; hoisting the sample's copy would put one post's widgets on
 *     all 256.
 *   - anything the shell already carries inline (the popup bootstrap sits in
 *     the Elementor template), which would otherwise run twice.
 */
const contentWidget = extractDivBlock(html, /<div[^>]*elementor-widget-theme-post-content[^>]*>/);
const withoutContent = contentWidget ? html.replace(contentWidget, '') : html;

// Compared with whitespace collapsed: the shell is emitted as a single line, so
// its copy of a snippet never matches the sample's byte for byte.
const squash = s => s.replace(/\s+/g, ' ').trim();
const shellCode = squash(await fs.readFile(SHELL, 'utf8'));

const { scripts } = extractInlineScripts(withoutContent);
const templateScripts = scripts.filter(code => !shellCode.includes(squash(code)));

const scriptHref = await writeScriptBundle(
  SCRIPT_DIR, '__post__', templateScripts, 'npm run wp:post-template'
);
process.stdout.write(
  `post scripts: ${templateScripts.length} kept ` +
  `(${scripts.length - templateScripts.length} already inline in the shell)\n`
);

// Strip the sample post's own identity so it does not leak onto every post.
const bodyClass = bodyClassOf(html)
  .split(/\s+/)
  .filter(c => !/^(postid-|post-\d|category-|tag-)/.test(c))
  .join(' ');

// ---- Register under __post__ -------------------------------------------
const dataDir = path.join(PROJECT, 'src', 'data');
const readJson = async f => JSON.parse(await fs.readFile(path.join(dataDir, f), 'utf8'));

const styles = await readJson('wp-styles.json');
const inline = await readJson('wp-inline-styles.json');
const pagesJson = await readJson('wp-pages.json');
const scriptsJson = await readJson('wp-scripts.json');

styles.__post__ = localHrefs;
inline.__post__ = inlineHref;
pagesJson.__post__ = { title: '', description: '', bodyClass };
// No jsonLd: the sample's Article schema describes that one post, and
// `ArticleLayout` already emits each post's own graph from Yoast's fullHead.
scriptsJson.__post__ = { script: scriptHref, jsonLd: [] };

await fs.writeFile(path.join(dataDir, 'wp-styles.json'), JSON.stringify(styles, null, 2), 'utf8');
await fs.writeFile(path.join(dataDir, 'wp-inline-styles.json'), JSON.stringify(inline, null, 2), 'utf8');
await fs.writeFile(path.join(dataDir, 'wp-pages.json'), JSON.stringify(pagesJson, null, 2), 'utf8');
await fs.writeFile(path.join(dataDir, 'wp-scripts.json'), JSON.stringify(scriptsJson, null, 2), 'utf8');

process.stdout.write(`registered __post__\nbodyClass: ${bodyClass}\n`);
