// Mirror every blog post and case study from WordPress.
//
// Posts are not Astra articles — each one renders through an Elementor
// `single-post` template carrying the breadcrumb, hero, table of contents,
// author box, share buttons and the related-posts loop grid. Rebuilding that
// from the markdown body loses all of it, so the post body is mirrored exactly
// like the archives are.
//
// The post list comes from the REST API so the mirror cannot silently drift out
// of sync with what WordPress actually publishes.
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ORIGIN, PROJECT, cookieHeader, fetchDoc, extractDivBlock, stripDeadScripts,
  rewriteUrls, mirrorStylesheets, writeInlineCss, bodyClassOf, titleOf,
  descriptionOf, collectMedia, downloadMedia, readData, writeData,
} from './lib/wp-mirror.mjs';
import { extractInlineScripts, writeScriptBundle } from './lib/inline-scripts.mjs';

const OUT_ROOT = path.join(PROJECT, 'public', 'wp-assets');
const partialDir = path.join(PROJECT, 'src', 'partials', 'posts');
const scriptDir = path.join(PROJECT, 'public', 'scripts', 'page');

/** Only refetch posts whose partial is missing (ONLY_MISSING=1 for a quick pass). */
const onlyMissing = process.env.ONLY_MISSING === '1';
/** LIMIT=n mirrors just the first n posts — for validating a pipeline change. */
const limit = Number(process.env.LIMIT) || Infinity;

// ---- post list ----------------------------------------------------------
async function listPosts() {
  const out = [];
  for (let page = 1; ; page++) {
    const url = `${ORIGIN}/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=id,slug,link,date,status`;
    const res = await fetch(url, { headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0 Chrome/131' } });
    if (!res.ok) throw new Error(`post list page ${page}: HTTP ${res.status}`);
    const batch = await res.json();
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out
    .filter(p => p.status === 'publish')
    .map(p => {
      const route = new URL(p.link).pathname.replace(/\/*$/, '/');
      const [category] = route.replace(/^\//, '').split('/');
      return { id: p.id, slug: p.slug, date: p.date, route, category };
    });
}

const posts = (await listPosts()).slice(0, limit);
process.stdout.write(`WordPress reports ${posts.length} published posts\n\n`);

await fs.mkdir(partialDir, { recursive: true });

const styles = await readData('wp-styles.json');
const inlineStyles = await readData('wp-inline-styles.json');
const pagesJson = await readData('wp-pages.json');
const scriptsJson = await readData('wp-scripts.json');

const mediaRefs = new Set();
const postIndex = {};
const failed = [];

// Serial per post, because each one mirrors its own stylesheet set and the
// downloads dominate — parallel fetches here just race on the same shared files.
let n = 0;
for (const post of posts) {
  const key = `post-${post.slug}`;
  n++;

  if (onlyMissing && await fs.stat(path.join(partialDir, `${post.slug}.html`)).catch(() => null)) {
    postIndex[post.slug] = { route: post.route, category: post.category, key };
    continue;
  }

  let html;
  try {
    html = await fetchDoc(ORIGIN + post.route);
  } catch (e) {
    process.stdout.write(`!! ${post.route} -> ${e.message}\n`);
    failed.push(post.route);
    continue;
  }

  const content = extractDivBlock(html, /<div[^>]+data-elementor-type="single-post"[^>]*>/);
  if (!content) {
    process.stdout.write(`!! no single-post block for ${post.route}\n`);
    failed.push(post.route);
    continue;
  }

  // extractDivBlock counts raw tags, which closes early if an Elementor HTML
  // widget ships unbalanced markup — and a truncated post looks fine until you
  // notice the related-posts grid is gone. Refuse to write a partial that did
  // not come back balanced rather than mirror half a page.
  const opens = (content.match(/<div\b/gi) || []).length;
  const closes = (content.match(/<\/div>/gi) || []).length;
  if (opens !== closes) {
    process.stdout.write(`!! unbalanced block for ${post.route} (${opens} open / ${closes} close)\n`);
    failed.push(post.route);
    continue;
  }

  collectMedia(content, mediaRefs);

  await fs.writeFile(
    path.join(partialDir, `${post.slug}.html`),
    stripDeadScripts(rewriteUrls(content)), 'utf8'
  );

  const localHrefs = await mirrorStylesheets(html, OUT_ROOT);
  const inline = await writeInlineCss(html, OUT_ROOT);
  const { scripts, jsonLd } = extractInlineScripts(html);
  const scriptPath = await writeScriptBundle(scriptDir, key, scripts, 'npm run wp:posts');

  styles[key] = localHrefs;
  inlineStyles[key] = inline.href;
  scriptsJson[key] = { script: scriptPath, jsonLd };
  pagesJson[key] = {
    route: post.route,
    title: titleOf(html),
    description: descriptionOf(html),
    bodyClass: bodyClassOf(html),
  };
  postIndex[post.slug] = { route: post.route, category: post.category, key };

  process.stdout.write(
    `${String(n).padStart(3)}/${posts.length} ${post.route.padEnd(58)} ` +
    `css:${localHrefs.length} inline:${(inline.bytes / 1024).toFixed(0)}KB js:${scripts.length}\n`
  );
}

// ---- media --------------------------------------------------------------
process.stdout.write(`\npost media referenced: ${mediaRefs.size}\n`);
const media = await downloadMedia(mediaRefs);
process.stdout.write(`missing: ${media.missing}, downloaded: ${media.downloaded}\n`);

await writeData('wp-styles.json', styles);
await writeData('wp-inline-styles.json', inlineStyles);
await writeData('wp-pages.json', pagesJson);
await writeData('wp-scripts.json', scriptsJson);

// wp-posts.json is the route index: [category]/[slug].astro builds one page per
// entry, so writing a partial index silently deletes blog routes. The other
// files above are merged into what was already on disk and survive a partial
// run; this one is rebuilt from scratch, so only a full pass may write it.
//
// Rebuild after a limited run with: ONLY_MISSING=1 npm run wp:posts
if (Number.isFinite(limit)) {
  process.stdout.write(
    `\nLIMIT was set — leaving wp-posts.json untouched (it would have dropped to ` +
    `${Object.keys(postIndex).length} of the existing entries).\n`
  );
} else {
  await writeData('wp-posts.json', postIndex);
}

process.stdout.write(`\nmirrored ${Object.keys(postIndex).length} posts\n`);
if (failed.length) process.stdout.write(`FAILED (${failed.length}):\n  ${failed.join('\n  ')}\n`);
