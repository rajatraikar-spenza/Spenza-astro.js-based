#!/usr/bin/env node
// Import the live WordPress posts into the admin: one src/content/cms-blog/<slug>.mdx each.
//
//   node scripts/cms-import-wp.mjs [--out src/content/cms-blog] [--only slug,slug] [--dry]
//
// It runs the site's own WordPress loader against an empty in-memory store, so each record is exactly
// what the build would render today (links and media rewritten, Yoast head, TL;DR blocks included).
// The record is then written as front matter + the verbatim HTML body (`source: wordpress`, see
// importedRecord in scripts/lib/cms-post.mjs). Re-running is safe: files are rewritten from WordPress,
// so run it only before the cut-over, never after someone has edited an imported post in the admin.
//
// GET requests to the WordPress GraphQL endpoint only; nothing is written to WordPress.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { wpPosts } from '../src/loaders/wp-posts.mjs';
import { decodeEntities } from './lib/cms-post.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = n => args.includes(n);
const opt = n => (args.indexOf(n) >= 0 ? args[args.indexOf(n) + 1] : undefined);
const out = path.resolve(opt('--out') ?? path.join(ROOT, 'src', 'content', 'cms-blog'));
const only = opt('--only') ? new Set(opt('--only').split(',')) : null;

const store = new Map();
const metaStore = new Map();
const ctx = {
  store: {
    get: id => store.get(id),
    set: rec => { store.set(rec.id, rec); return true; },
    delete: id => store.delete(id),
    keys: () => [...store.keys()],
    entries: () => [...store.entries()],
    values: () => [...store.values()],
    clear: () => store.clear(),
    has: id => store.has(id),
  },
  meta: { get: k => metaStore.get(k), set: (k, v) => metaStore.set(k, v), has: k => metaStore.has(k), delete: k => metaStore.delete(k) },
  logger: { info: m => console.log(m), warn: m => console.warn('WARN', m), error: m => console.error('ERROR', m), debug() {} },
  parseData: async ({ data }) => data,
  generateDigest: v => createHash('sha1').update(typeof v === 'string' ? v : JSON.stringify(v)).digest('hex'),
};

await wpPosts().load(ctx);
const records = [...store.values()].map(r => r.data).filter(d => !only || only.has(d.slug));
console.log(`${records.length} posts fetched`);

const q = v => JSON.stringify(v);
const plain = s => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const lines = [];
const problems = [];

function entryText(d) {
  const description = decodeEntities(plain(d.excerpt));
  const fm = ['---',
    `source: "wordpress"`,
    `wpId: ${d.databaseId}`,
    `title: ${q(d.title)}`,
    `slug: ${q(d.slug)}`,
    `category: ${q(d.category)}`,
    `categories: ${q(d.categories ?? [d.category])}`,
    `author: ${q(d.author?.slug ?? '')}`,
    `description: ${q(description)}`,
    `publishedDate: ${q(new Date(d.publishedDate).toISOString())}`,
    `updatedDate: ${q(new Date(d.updatedDate).toISOString())}`,
    `tags: ${q(d.tags ?? [])}`,
    `isCaseStudy: ${Boolean(d.isCaseStudy)}`,
  ];
  if (d.featuredImage) {
    const f = d.featuredImage;
    fm.push('hero:', `  image: ${q(f.url)}`, `  alt: ${q(f.alt ?? '')}`);
    if (f.width) fm.push(`  width: ${f.width}`);
    if (f.height) fm.push(`  height: ${f.height}`);
    if (f.id) fm.push(`  id: ${f.id}`);
    if (f.srcSet) fm.push(`  srcSet: ${q(f.srcSet)}`);
  }
  fm.push(`excerpt: ${q(d.excerpt ?? '')}`);
  fm.push(`seoTitle: ${q(d.seo?.title ?? d.title)}`);
  if (d.seo?.description) fm.push(`seoDescription: ${q(d.seo.description)}`);
  if (d.seo?.ogImage) fm.push(`ogImage: ${q(d.seo.ogImage)}`);
  fm.push(`seoHead: ${q(d.seo?.fullHead ?? '')}`);
  fm.push(`tldrBlocks: ${q(d.templateBlocks ?? {})}`);
  fm.push(`wpAuthor: ${q({ bio: d.author?.bio, avatar: d.author?.avatar })}`);
  const lead = (d.content ?? '').match(/^\s*/)[0];
  if (lead) fm.push(`bodyLead: ${q(lead)}`);
  fm.push('---', '');
  return fm.join('\n') + (d.content ?? '').replace(/^\s+/, '');
}

if (!flag('--dry')) fs.mkdirSync(out, { recursive: true });
for (const d of records.sort((a, b) => a.slug.localeCompare(b.slug))) {
  if (!d.author?.slug) problems.push(`${d.slug}: no author`);
  if (!d.category) problems.push(`${d.slug}: no category`);
  const text = entryText(d);
  if (!flag('--dry')) fs.writeFileSync(path.join(out, `${d.slug}.mdx`), text);
  lines.push(`${d.slug}\t${d.category}\t${d.author?.slug}\t${(d.content ?? '').length}`);
}
console.log(lines.length, 'entries', flag('--dry') ? '(dry run, nothing written)' : `written to ${out}`);
if (problems.length) { console.log('PROBLEMS:\n' + problems.join('\n')); process.exitCode = 1; }
const authors = new Set(records.map(r => r.author?.slug));
console.log('authors in the import:', [...authors].join(', '));
console.log('case studies:', records.filter(r => r.isCaseStudy).length);
