// Compare each built post against the mirrored capture it replaced.
//
// The mirror is the baseline the headless render has to match, and having a
// capture for 256 posts makes parity measurable instead of eyeballed. This
// reports the outliers so review targets the posts that actually differ.
//
// The baseline is now the partial on disk rather than a second rendering of it:
// once every post is served headlessly there is no mirrored page left in dist/
// to compare against. Chrome is excluded on both sides, so the comparison is
// still article-to-article.
//
// Run after a build. Reads dist/ and src/partials/ directly — no server needed.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { PROJECT } from './lib/config.mjs';

const DIST = path.join(PROJECT, 'dist');
const posts = JSON.parse(
  await fs.readFile(path.join(PROJECT, 'src', 'data', 'wp-posts.json'), 'utf8')
);

/** Strip everything that is chrome, so the comparison is about the article. */
function articleOf(html) {
  const main = html.slice(html.indexOf('<main'), html.lastIndexOf('</main>'));
  return main || html;
}

const visibleText = html =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const headings = html =>
  [...html.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map(m => m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

const images = html => [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)].map(m => m[1]);

const internalLinks = html =>
  [...new Set(
    [...html.matchAll(/href="(\/[^"#?]*)"/g)]
      .map(m => m[1])
      .filter(h => !h.startsWith('/wp-assets/') && !h.startsWith('/wp-content/'))
  )];

const rows = [];
let missing = 0;

for (const [slug, entry] of Object.entries(posts)) {
  const mirroredPath = path.join(PROJECT, 'src', 'partials', 'posts', `${slug}.html`);
  const builtPath = path.join(DIST, entry.route.replace(/^\/|\/$/g, ''), 'index.html');
  if (!existsSync(mirroredPath) || !existsSync(builtPath)) { missing++; continue; }

  // The partial is the article block itself, so it needs no <main> extraction.
  // baseline: the mirrored partial
  const a = await fs.readFile(mirroredPath, 'utf8');
  const b = articleOf(await fs.readFile(builtPath, 'utf8'));

  const ta = visibleText(a), tb = visibleText(b);
  const ha = headings(a), hb = headings(b);
  const ia = images(a), ib = images(b);
  const la = internalLinks(a), lb = internalLinks(b);

  // Headings are the strongest signal that body content survived intact.
  const missingHeadings = ha.filter(h => !hb.includes(h));

  rows.push({
    slug,
    textRatio: ta.length ? tb.length / ta.length : 0,
    headings: [ha.length, hb.length],
    missingHeadings,
    images: [ia.length, ib.length],
    links: [la.length, lb.length],
  });
}

rows.sort((a, b) => a.textRatio - b.textRatio);

const bad = rows.filter(r => r.textRatio < 0.85 || r.missingHeadings.length);
const median = rows.length ? rows[Math.floor(rows.length / 2)].textRatio : 0;

process.stdout.write(
  `compared ${rows.length} posts` + (missing ? ` (${missing} skipped, no pair built)` : '') + `\n\n` +
  `median text ratio built/mirrored: ${(median * 100).toFixed(1)}%\n` +
  `posts below 85% text or missing a heading: ${bad.length}\n\n`
);

for (const r of rows.slice(0, 12)) {
  process.stdout.write(
    `${(r.textRatio * 100).toFixed(0).padStart(4)}%  ` +
    `h:${r.headings[0]}->${r.headings[1]}  ` +
    `img:${r.images[0]}->${r.images[1]}  ` +
    `links:${r.links[0]}->${r.links[1]}  ${r.slug}\n`
  );
  if (r.missingHeadings.length) {
    process.stdout.write(`        missing headings: ${r.missingHeadings.slice(0, 3).join(' | ')}\n`);
  }
}

const avg = f => rows.reduce((s, r) => s + f(r), 0) / rows.length;
process.stdout.write(
  `\naverages — headings ${avg(r => r.headings[0]).toFixed(1)} -> ${avg(r => r.headings[1]).toFixed(1)}, ` +
  `images ${avg(r => r.images[0]).toFixed(1)} -> ${avg(r => r.images[1]).toFixed(1)}, ` +
  `internal links ${avg(r => r.links[0]).toFixed(1)} -> ${avg(r => r.links[1]).toFixed(1)}\n`
);
