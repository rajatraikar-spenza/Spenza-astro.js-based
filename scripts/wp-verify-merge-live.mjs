/**
 * Verify published merged clusters on the live site.
 *
 *   npm run merge:verify                 every cluster already published
 *   npm run merge:verify -- <slug> ...   only these
 *
 * The build-time gates in wp-publish-merge.mjs prove the payload was right.
 * This proves the page is right, which is not the same thing: WordPress
 * filters the body, the loader rewrites it, and Astro renders it through the
 * Elementor shell. Each of those has broken something at least once.
 *
 * Checks, in the order they have actually failed:
 *
 *   prose        every sentence of the approved preview still present
 *   headings     the bold rule shipped (the stylesheet is preview-scoped)
 *   FAQ          six cards, grey Spectra treatment, first one open
 *   CTA          exactly one, at the end of the body, pointing at /contact-us/
 *   schema       our FAQPage parses AND Yoast's graph is still intact
 *   assets       every media URL on the page resolves
 *
 * Exits non-zero on any failure so it can gate a deploy.
 */
import { loadMergePreviews } from './lib/merge-manifest.mjs';
import { SITE_URL } from './lib/config.mjs';

const SITE = SITE_URL.replace(/\/+$/, '');

const normalise = (h) =>
  h
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    // WordPress runs wptexturize on the_content, so a straight apostrophe in
    // the repo body comes back curly. Site-wide behaviour, not content loss.
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

async function checkOne(slug, preview) {
  const url = `${SITE}/${preview.category}/${slug}/`;
  const res = await fetch(`${url}?cb=${Date.now()}`);
  const html = await res.text();
  const count = (re) => (html.match(re) || []).length;
  const fail = [];

  if (res.status !== 200) fail.push(`HTTP ${res.status}`);

  // prose parity
  const start = html.indexOf('spenza-merged-article');
  const body = start > -1 ? html.slice(html.lastIndexOf('<', start)) : '';
  if (start === -1) fail.push('article wrapper missing');
  const src = normalise(preview.content);
  const live = normalise(body);
  const sentences = src.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter((s) => s.length > 40);
  const missing = sentences.filter((s) => !live.includes(s));
  if (missing.length) fail.push(`${missing.length} sentences missing (e.g. "${missing[0].slice(0, 60)}...")`);

  // headings
  if (!/#spenza-merged-article h2,#spenza-merged-article h3/.test(html)) fail.push('bold heading rule missing');

  // FAQ
  const faqCards = count(/<details name="m\d+-faq"/g);
  if (faqCards !== 6) fail.push(`FAQ cards = ${faqCards}, expected 6`);
  if (!/#spenza-merged-article \[class\$="-faq"\]>details\{[^}]*#f6f6f6/.test(html)) {
    fail.push('grey FAQ treatment missing');
  }
  if (!/<details name="m\d+-faq" open>/.test(html)) fail.push('first FAQ panel not open');

  // CTA
  const ctas = count(/Contact Us Today/g);
  if (ctas !== 1) fail.push(`CTA count = ${ctas}, expected 1`);
  const iCta = html.indexOf('Contact Us Today');
  if (iCta > -1) {
    if (start > -1 && iCta < start) fail.push('CTA sits before the article body');
    const lastPara = html.slice(start, iCta).lastIndexOf('</p>');
    if (lastPara === -1) fail.push('CTA is not after the closing paragraph');
    if (!/href="\/contact-us\/"/.test(html.slice(Math.max(0, iCta - 400), iCta + 100))) {
      fail.push('CTA does not point at /contact-us/');
    }
  }

  // schema: ours parses, and Yoast's is still there. Yoast's tag carries a
  // class, so the matcher must not assume the tag ends after `type`.
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  let ours = null;
  let yoast = null;
  for (const b of blocks) {
    try {
      const g = JSON.parse(b[1]);
      const types = (g['@graph'] || [g]).map((n) => n['@type']);
      if (types.includes('FAQPage')) ours = types.join('+');
      if (types.includes('Article')) yoast = types.length;
    } catch (e) {
      fail.push(`JSON-LD does not parse (${e.message})`);
    }
  }
  if (!ours) fail.push('our FAQPage graph missing');
  if (!yoast) fail.push("Yoast's Article graph missing - the delta may have displaced it");

  // stray repo paths
  const stray = count(/\/blog-(media|resources)\//g);
  if (stray) fail.push(`${stray} stray repo paths`);

  // assets
  const assets = [...new Set([...html.matchAll(/https:\/\/media\.spenza\.com\/[^"'\s)]+/g)].map((m) => m[0]))];
  const broken = [];
  await Promise.all(
    assets.map(async (a) => {
      try {
        const r = await fetch(a, { method: 'HEAD' });
        if (r.status !== 200) broken.push(`${r.status} ${a.split('/').pop()}`);
      } catch {
        broken.push(`ERR ${a.split('/').pop()}`);
      }
    })
  );
  if (broken.length) fail.push(`${broken.length} broken assets (e.g. ${broken[0]})`);

  return { slug, url, fail, stats: { sentences: sentences.length, faqCards, ctas, schema: ours, assets: assets.length } };
}

const previews = loadMergePreviews();
const asked = process.argv.slice(2).filter((a) => !a.startsWith('-'));

// Default to whatever is actually published: a cluster is live once its
// destination URL carries the published wrapper.
let slugs = asked.length ? asked : Object.keys(previews);

const rows = [];
for (const slug of slugs) {
  const preview = previews[slug];
  if (!preview) {
    rows.push({ slug, fail: ['no manifest record'], stats: {} });
    continue;
  }
  const r = await checkOne(slug, preview);
  // Not yet published is not a failure when scanning everything.
  if (!asked.length && r.fail.includes('article wrapper missing')) continue;
  rows.push(r);
}

let failures = 0;
for (const r of rows) {
  const ok = r.fail.length === 0;
  if (!ok) failures++;
  process.stdout.write(
    `${ok ? 'PASS' : 'FAIL'}  ${r.slug.padEnd(36)} ` +
      `sent=${String(r.stats.sentences ?? '-').padEnd(4)} faq=${r.stats.faqCards ?? '-'} ` +
      `cta=${r.stats.ctas ?? '-'} schema=${r.stats.schema ?? '-'} assets=${r.stats.assets ?? '-'}\n`
  );
  for (const f of r.fail) process.stdout.write(`        - ${f}\n`);
}

process.stdout.write(`\n${rows.length} checked, ${failures} failing\n`);
process.exit(failures ? 1 : 0);
