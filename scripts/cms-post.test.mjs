// Renderer and validation rules for admin-written posts.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEntry, validateEntry, renderContent, loadEntry, templateBlocks, databaseIdFor } from './lib/cms-post.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(HERE, 'fixtures', 'cms-blog', 'fixture-post.mdx');
const PUBLIC = path.join(HERE, 'fixtures', 'public');
const load = () => parseEntry(fs.readFileSync(FIXTURE, 'utf8'), 'fixture-post.mdx');
const exists = () => true;

test('the fixture is valid', () => {
  const { meta, body } = load();
  const r = validateEntry(meta, body, { fileExists: exists, filenameSlug: 'fixture-post' });
  assert.deepEqual(r.errors, []);
});

test('parseEntry reports a missing or malformed front matter readably', () => {
  assert.throws(() => parseEntry('no front matter', 'a.mdx'), /a\.mdx: no front matter/);
  assert.throws(() => parseEntry('---\ntitle: [unclosed\n---\nbody', 'b.mdx'), /b\.mdx: front matter is not valid YAML/);
});

test('validateEntry catches the mistakes an editor can make', () => {
  const { meta, body } = load();
  const cases = [
    [{ ...meta, slug: 'Bad Slug' }, /slug must be lowercase/],
    [{ ...meta, category: 'news' }, /category must be one of/],
    [{ ...meta, author: 'nobody' }, /author must be one of/],
    [{ ...meta, hero: { image: '/cms-media/x.webp', alt: '' } }, /hero\.alt is required/],
    [{ ...meta, hero: {} }, /hero\.image is required/],
    [{ ...meta, tldr: { ...meta.tldr, cards: meta.tldr.cards.slice(0, 3) } }, /exactly 5 cards/],
    [{ ...meta, faq: [{ question: 'q', answer: '' }] }, /FAQ 1 needs/],
    [{ ...meta, publishedDate: 'not a date' }, /publishedDate is not a valid date/],
  ];
  for (const [m, re] of cases) {
    const { errors } = validateEntry(m, body, { fileExists: exists });
    assert.ok(errors.some(e => re.test(e)), `expected ${re}, got ${JSON.stringify(errors)}`);
  }
  assert.ok(validateEntry(meta, '# H1\n\ntext', { fileExists: exists }).errors.some(e => /H1/.test(e)));
  assert.ok(validateEntry(meta, body, { fileExists: exists, filenameSlug: 'other' }).errors.some(e => /does not match the file name/.test(e)));
  assert.ok(validateEntry(meta, body, { fileExists: () => false }).errors.some(e => /hero image not found/.test(e)));
});

test('a manual post may omit TL;DR and FAQ (warnings, not errors); a partial TL;DR is an error', () => {
  const { meta, body } = load();
  const bare = { ...meta, tldr: undefined, faq: undefined };
  const r = validateEntry(bare, body, { fileExists: exists });
  assert.deepEqual(r.errors, []);
  assert.equal(r.warnings.length >= 2, true);
  assert.ok(validateEntry({ ...meta, tldr: { summary: 'only a summary' } }, body, { fileExists: exists }).errors.some(e => /exactly 5 cards/.test(e)));
});

test('description length is advice, never a blocker', () => {
  const { meta, body } = load();
  const short = { ...meta, description: 'Too short to be a snippet.' };
  assert.equal(validateEntry(short, body, { fileExists: exists }).errors.length, 0);
  assert.ok(validateEntry(short, body, { fileExists: exists }).warnings.some(e => /description is/.test(e)));
});

test('renderContent builds the Spenza markup: ids, wrapped tables, figure after section 2, FAQ, schema, button last', async () => {
  const { meta, body } = load();
  const html = await renderContent(meta, body, { siteUrl: 'https://spenza.com', bodyImageDims: { width: 1600, height: 900 } });
  assert.match(html, /<div class="spenza-draft-content">/);
  assert.equal((html.match(/<h2 id="section-\d">/g) ?? []).length, 6);
  assert.equal((html.match(/class="table-wrap"/g) ?? []).length, 2);
  assert.match(html, /<caption class="table-caption">Why bundles lose money<\/caption>/);
  assert.match(html, /<th scope="col">Tier<\/th>/);
  // figure sits between section 2 and section 3
  const fig = html.indexOf('<figure>');
  assert.ok(fig > html.indexOf('id="section-2"') && fig < html.indexOf('id="section-3"'));
  assert.match(html, /width="1600"/);
  assert.equal((html.match(/class="[^"]*uagb-faq-item"/g) ?? []).length, 5);
  assert.match(html, /<strong>data<\/strong>/); // inline markdown in an FAQ answer
  assert.match(html, /"@type":"FAQPage","@id":"https:\/\/spenza\.com\/iot\/fixture-post\/#faq"/);
  assert.ok(html.indexOf('Contact Us Today') > html.indexOf('uagb-faq__outer-wrap'));
  assert.equal((html.match(/Contact Us Today/g) ?? []).length, 1);
});

test('an explicit <!--IMAGE:body--> marker wins over afterSection', async () => {
  const { meta, body } = load();
  const marked = body.replace('## Reviewing monthly', '<!--IMAGE:body-->\n\n## Reviewing monthly');
  const html = await renderContent(meta, marked, { siteUrl: 'https://spenza.com' });
  assert.equal((html.match(/<figure>/g) ?? []).length, 1);
  assert.ok(html.indexOf('<figure>') < html.indexOf('id="section-4"') && html.indexOf('<figure>') > html.indexOf('id="section-3"'));
});

test('with no body image the figure is simply absent', async () => {
  const { meta, body } = load();
  const html = await renderContent({ ...meta, bodyImage: undefined }, body, { siteUrl: 'https://spenza.com' });
  assert.ok(!html.includes('<figure>'));
});

test('templateBlocks maps 4 + 1 cards and ignores an incomplete set', () => {
  const { meta } = load();
  const b = templateBlocks(meta);
  assert.equal(b.twoCol.length, 4);
  assert.equal(b.oneCol.length, 1);
  assert.match(b.twoCol[0].icon, /fa-chart-line/);
  assert.deepEqual(templateBlocks({ tldr: { cards: [] } }).twoCol, []);
});

test('loadEntry returns the collection record, holds a future-dated post, and rejects an invalid one', async () => {
  const ok = await loadEntry(FIXTURE, { siteUrl: 'https://spenza.com', publicDir: PUBLIC, now: new Date('2026-06-01') });
  assert.deepEqual(ok.errors, []);
  const d = ok.data;
  assert.equal(d.slug, 'fixture-post');
  assert.equal(d.databaseId, databaseIdFor('fixture-post'));
  assert.ok(d.databaseId >= 9_000_000);
  assert.deepEqual([d.featuredImage.width, d.featuredImage.height], [1280, 720]);
  assert.match(d.seo.fullHead, /<link rel="canonical" href="https:\/\/spenza\.com\/iot\/fixture-post\/" \/>/);
  assert.match(d.seo.fullHead, /yoast-schema-graph/);
  assert.equal(d.author.name, 'Spenza');

  const held = await loadEntry(FIXTURE, { siteUrl: 'https://spenza.com', publicDir: PUBLIC, now: new Date('2025-01-01') });
  assert.ok(held.scheduled);
  assert.equal(held.data, undefined);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cms-'));
  const broken = path.join(tmp, 'broken.mdx');
  fs.writeFileSync(broken, fs.readFileSync(FIXTURE, 'utf8').replace('category: iot', 'category: bogus').replace('slug: fixture-post', 'slug: broken'));
  const bad = await loadEntry(broken, { siteUrl: 'https://spenza.com', publicDir: PUBLIC });
  assert.ok(bad.errors.some(e => /category must be one of/.test(e)));
});
