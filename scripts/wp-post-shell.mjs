// Derive a reusable article shell from one mirrored post.
//
// Elementor renders every post through a single `single-post` template, so all
// 256 mirrored partials share the same 45 widgets with the same element ids —
// verified by diffing two posts widget-for-widget: identical ids, identical
// order, and only the widgets holding post data differ.
//
// That makes the chrome extractable once. This writes the template out with the
// data-bearing widgets emptied and marked, so ArticleLayout can fill them for
// any post — including posts published after the mirror was taken, which is the
// entire point of going headless.
//
// Regenerate with `npm run wp:post-shell` after re-mirroring, in case the
// marketing team edits the Elementor template.
import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECT } from './lib/config.mjs';
import { widgetHtml, replaceWidgetInner } from './lib/widget-html.mjs';

const SAMPLE = process.env.SAMPLE || 'oss-full-form';
const src = path.join(PROJECT, 'src', 'partials', 'posts', `${SAMPLE}.html`);
const out = path.join(PROJECT, 'src', 'partials', 'post-shell.html');

/**
 * Widgets that carry post data, by their stable template element id.
 *
 * `unsourced: true` marks widgets whose content is per-post but is NOT
 * available from WPGraphQL — a shortcode in the Elementor template renders them
 * from a field the public API does not expose (see README). They still get a
 * slot, so the moment that field is exposed the layout can fill it.
 *
 * They are emptied rather than left as the sample's content: every post showing
 * the sample post's "OSS Means Operations Support System" card would be a
 * visible, plausible-looking lie, where an empty slot is an obvious gap.
 */
const SLOTS = [
  { id: '9b6a563', name: 'breadcrumbs' },
  { id: 'b9fc872', name: 'title' },
  { id: 'ec16560', name: 'excerpt' },
  { id: '6ea76c5', name: 'featuredImage' },
  { id: '16a8023', name: 'content' },
  { id: 'd322867', name: 'relatedPosts' },
  // The TL;DR heading is per-post too, not the fixed caption it looks like:
  // most posts say "TL;DR / At-a-Glance Summary" but some carry their own
  // wording, and posts with no TL;DR at all omit the widget entirely.
  { id: 'b8f4b5b', name: 'tldrHeading', unsourced: true },
  { id: 'c26dd48', name: 'summary', unsourced: true },
  { id: '51219dc', name: 'keyPoints', unsourced: true },
  { id: '48c4aea', name: 'spenzaBlock', unsourced: true },
];

let html = await fs.readFile(src, 'utf8');

const report = [];
for (const slot of SLOTS) {
  const before = widgetHtml(html, slot.id);
  if (!before) {
    report.push(`  !! ${slot.name} (${slot.id}) NOT FOUND in ${SAMPLE}`);
    continue;
  }
  html = replaceWidgetInner(html, slot.id, `<!--SLOT:${slot.name}-->`);
  report.push(
    `  ${slot.unsourced ? '??' : 'ok'} ${slot.name} (${slot.id}) ` +
    `${(before.length / 1024).toFixed(1)}KB -> slot` +
    (slot.unsourced ? '  (no WPGraphQL source yet — renders empty)' : '')
  );
}

// The sample's own identity must not leak onto every post.
html = html
  .replace(/\bpost-\d+\b/g, '')
  .replace(/\bpostid-\d+\b/g, '')
  .replace(/\btag-[a-z0-9-]+/g, '')
  .replace(/class="\s+/g, 'class="')
  .replace(/\s{2,}/g, ' ');

await fs.writeFile(out, html, 'utf8');

process.stdout.write(
  `article shell from "${SAMPLE}"\n${report.join('\n')}\n\n` +
  `wrote src/partials/post-shell.html (${(html.length / 1024).toFixed(0)}KB)\n`
);

const missing = SLOTS.filter(s => !html.includes(`<!--SLOT:${s.name}-->`));
if (missing.length) {
  throw new Error(`slots not emitted: ${missing.map(s => s.name).join(', ')}`);
}
