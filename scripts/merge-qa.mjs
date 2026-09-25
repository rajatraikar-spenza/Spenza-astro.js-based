/**
 * Gate a merge preview against docs/blog-editorial-standard.md.
 *
 * The programme runs unattended: an agent merges a whole hub in one pass and
 * reports at the end. Without a human reading each outline, a structural
 * mistake would otherwise repeat across every cluster in the hub before anyone
 * saw it. This is the gate that replaces that reader.
 *
 * Every check here is mechanical and quoted from the standard. It deliberately
 * does NOT judge whether the writing is any good — that stays human. What it
 * guarantees is that nothing ships that is provably outside the rules.
 *
 *   npm run merge:qa            all clusters with a preview
 *   npm run merge:qa -- M02     one cluster
 *   npm run merge:qa -- --hub "MVNO & MVNE"
 *
 * Exits non-zero on the first FAIL, so an agent loop cannot walk past it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PREVIEWS = path.join(ROOT, 'src/data/merge-previews');
const plan = JSON.parse(fs.readFileSync(path.join(PREVIEWS, 'merge-plan.json'), 'utf8'));
const manifest = fs.readFileSync(path.join(PREVIEWS, 'index.ts'), 'utf8');

const BANNED = [
  "in today's fast-paced world", 'landscape', 'delve', 'unlock', 'leverage',
  'seamless', 'robust', 'game-changer', 'revolutionize', 'cutting-edge',
  'navigate the complexities', "it's important to note", 'in conclusion',
];

/** Every donor in the whole plan: linking to any of them creates a 301 hop. */
const ALL_DONORS = new Set(plan.clusters.flatMap(c => c.donors.map(d => d.path)));

const strip = html => html
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ');
const text = html => strip(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function checks(cluster, html) {
  const body = strip(html);
  const words = text(html).split(' ').filter(Boolean).length;
  const h2s = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)];
  const internal = new Set([...body.matchAll(/href="(\/[^"#?]*\/)"/g)].map(m => m[1]));
  const external = new Set([...body.matchAll(/href="(https?:\/\/[^"]+)"/g)]
    .map(m => m[1]).filter(u => !/(^https?:\/\/(www\.)?spenza\.com|media\.spenza\.com)/.test(u)));
  const donorLinks = [...internal].filter(u => ALL_DONORS.has(u));

  // Answer-first: the sentence after each H2 must name its subject, not point back.
  const pronounOpeners = [];
  const sections = body.split(/<h2[^>]*>[\s\S]*?<\/h2>/);
  // Question-shaped H3s elsewhere are normal article headings, not FAQs.
  // Count questions only in sections explicitly headed FAQ(s).
  const faqQuestions = h2s.flatMap((heading, index) => {
    if (!/\bFAQs?\b|frequently asked questions/i.test(text(heading[1]))) return [];
    return [...(sections[index + 1] || '').matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)]
      .map(match => text(match[1])).filter(question => question.endsWith('?'));
  });
  h2s.forEach((m, i) => {
    const after = (sections[i + 1] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const first = after.split(/(?<=[.!?])\s/)[0] || '';
    if (/^(It|This|That|These|Those|They|There)\b/.test(first)) {
      pronounOpeners.push(m[1].replace(/<[^>]+>/g, '').trim().slice(0, 40));
    }
  });

  const banned = BANNED.filter(w => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(text(html)));
  const author = cluster.author || {};
  const slugBlock = manifest.split(`"slug": "${cluster.destination.split('/').filter(Boolean).pop()}"`)[1] || '';
  const declaredAuthor = (slugBlock.match(/"authorSlug":\s*"([^"]+)"/) || [])[1];

  return [
    ['words 2,000-3,000', words >= 2000 && words <= 3000, words],
    ['no em dashes', !/—|&#8212;|&mdash;/.test(body), (body.match(/—|&#8212;|&mdash;/g) || []).length],
    ['no en dashes', !/–|&#8211;|&ndash;/.test(body), (body.match(/–|&#8211;|&ndash;/g) || []).length],
    ['H2 count 5-8', h2s.length >= 5 && h2s.length <= 8, h2s.length],
    ['tables 2-4', (body.match(/<table/g) || []).length >= 2 && (body.match(/<table/g) || []).length <= 4, (body.match(/<table/g) || []).length],
    ['internal links 6-10', internal.size >= 6 && internal.size <= 10, internal.size],
    ['external links 4-8', external.size >= 4 && external.size <= 8, external.size],
    ['FAQ questions 6-8', faqQuestions.length >= 6 && faqQuestions.length <= 8, faqQuestions.length],
    // Image count is an editorial decision (25 September 2026 instruction).
    // Validate the figures present without encouraging padding to a quota.
    ['figures have images and alt text', [...body.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].every(([figure]) => /<img\b[^>]*\bsrc="[^"]+"/.test(figure) && /<img\b[^>]*\balt="[^"]+"/.test(figure)), (body.match(/<figure\b/g) || []).length],
    ['no banned words', banned.length === 0, banned.join(', ') || 'none'],
    ['no links to any donor', donorLinks.length === 0, donorLinks.join(', ') || 'none'],
    ['every H2 answer-first', pronounOpeners.length === 0, pronounOpeners.join('; ') || 'ok'],
    ['author matches plan', !author.slug || declaredAuthor === author.slug, `${declaredAuthor} vs ${author.slug}`],
  ];
}

const args = process.argv.slice(2);
const hubIdx = args.indexOf('--hub');
const hub = hubIdx >= 0 ? args[hubIdx + 1] : null;
const ids = args.filter(a => /^M\d\d$/.test(a));

let targets = plan.clusters.filter(c => ['preview', 'approved', 'done'].includes(c.status));
if (ids.length) targets = plan.clusters.filter(c => ids.includes(c.id));
if (hub) targets = targets.filter(c => c.hub === hub);

if (!targets.length) { console.log('No clusters to check.'); process.exit(0); }

let failed = 0;
for (const c of targets) {
  const slug = c.destination.split('/').filter(Boolean).pop();
  const file = path.join(PREVIEWS, `${slug}.html`);
  if (!fs.existsSync(file)) {
    console.log(`\n${c.id}  ${slug}\n  FAIL  no preview file at src/data/merge-previews/${slug}.html`);
    failed++; continue;
  }
  const rows = checks(c, fs.readFileSync(file, 'utf8'));
  const bad = rows.filter(([, ok]) => !ok);
  console.log(`\n${c.id}  ${slug}  ${bad.length ? `FAIL (${bad.length})` : 'PASS'}`);
  for (const [name, ok, val] of rows) {
    if (!ok || process.env.VERBOSE) console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name.padEnd(24)} ${val}`);
  }
  if (bad.length) failed++;
}

console.log(`\n${targets.length - failed}/${targets.length} clusters pass the editorial gate.`);
if (failed) {
  console.log('Fix every FAIL above before continuing. Do not proceed to the next cluster.');
  process.exit(1);
}
