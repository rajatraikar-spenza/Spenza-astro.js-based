import test from 'node:test';
import assert from 'node:assert/strict';
import { fixGraph, listingSchema } from './lib/seo-pass.mjs';
import { authorNode } from './lib/cms-post.mjs';

const SITE = 'https://spenza.com';
const graph = () => ({
  '@graph': [
    { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'Spenza', url: `${SITE}/` },
    { '@type': 'Person', '@id': `${SITE}/#/schema/person/abc`, name: 'Spenza', url: `${SITE}/author/isimplexity/` },
    { '@type': 'Person', '@id': `${SITE}/author/sivasai/#person`, name: 'SivaSai', description: 'SEO &amp; AI Search' },
    { '@type': 'Article', author: { '@id': `${SITE}/#/schema/person/abc` } },
    { '@type': 'WebPage', breadcrumb: { '@id': `${SITE}/#breadcrumb` } },
    { '@type': 'BreadcrumbList', '@id': `${SITE}/#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home' }] },
  ],
});

test('the company is an Organization, never a Person', () => {
  const d = graph();
  assert.ok(fixGraph(d, { pagePath: '/', siteUrl: SITE }));
  const g = d['@graph'];
  assert.equal(g.filter(n => n['@type'] === 'Person').length, 1);
  assert.deepEqual(g.find(n => n['@type'] === 'Article').author, { '@id': `${SITE}/#organization` });
});

test('Organization gets sameAs and a description; a person keeps decoded text', () => {
  const d = graph();
  fixGraph(d, { pagePath: '/x/y/', siteUrl: SITE });
  const org = d['@graph'].find(n => n['@type'] === 'Organization');
  assert.ok(org.sameAs.some(u => u.includes('linkedin.com')) && org.description);
  assert.equal(d['@graph'].find(n => n.name === 'SivaSai').description, 'SEO & AI Search');
});

test('the home breadcrumb is dropped, other pages keep theirs', () => {
  const home = graph(); fixGraph(home, { pagePath: '/', siteUrl: SITE });
  assert.ok(!home['@graph'].some(n => n['@type'] === 'BreadcrumbList'));
  assert.ok(!home['@graph'].find(n => n['@type'] === 'WebPage').breadcrumb);
  const inner = graph(); fixGraph(inner, { pagePath: '/a/b/', siteUrl: SITE });
  assert.ok(inner['@graph'].some(n => n['@type'] === 'BreadcrumbList'));
});

test('a Person pointing sameAs at the site itself loses it; the author reference is replaced whole', () => {
  const d = { '@graph': [
    { '@type': 'Person', '@id': `${SITE}/#/schema/person/z`, name: 'SivaSai', sameAs: [`${SITE}/`] },
    { '@type': 'Person', '@id': `${SITE}/#/schema/person/c`, name: 'Spenza', url: `${SITE}/author/isimplexity/` },
    { '@type': 'Article', author: { name: 'Spenza', '@id': `${SITE}/#/schema/person/c` } },
  ] };
  fixGraph(d, { pagePath: '/a/b/', siteUrl: SITE });
  assert.equal(d['@graph'].find(n => n.name === 'SivaSai').sameAs, undefined);
  assert.deepEqual(d['@graph'].find(n => n['@type'] === 'Article').author, { '@id': `${SITE}/#organization` });
});

test('a clean graph is left alone', () => {
  const d = { '@graph': [{ '@type': 'Organization', '@id': `${SITE}/#organization`, sameAs: ['x'], description: 'd' }] };
  assert.equal(fixGraph(d, { pagePath: '/a/', siteUrl: SITE }), false);
});

test('post authors: people get their own Person, the company stays the Organization', () => {
  const company = authorNode(SITE, { slug: 'isimplexity', name: 'Spenza' });
  assert.deepEqual(company.ref, { '@id': `${SITE}/#organization` });
  assert.equal(company.nodes.length, 0);
  const person = authorNode(SITE, { slug: 'vinay', name: 'Vinaychandra Bharadwaj', linkedin: 'https://www.linkedin.com/in/x/' });
  assert.equal(person.ref['@id'], `${SITE}/author/vinay/#person`);
  assert.equal(person.nodes[0]['@type'], 'Person');
  assert.notEqual(person.ref['@id'], `${SITE}/#organization`);
  assert.deepEqual(person.nodes[0].sameAs, ['https://www.linkedin.com/in/x/']);
});

test('one author, one @id: Yoast hashes are merged into /author/<slug>/#person', () => {
  const d = { '@graph': [
    { '@type': 'Person', '@id': `${SITE}/#/schema/person/aaa`, name: 'Vinay', url: `${SITE}/author/vinay/`, description: 'bio' },
    { '@type': 'Person', '@id': `${SITE}/author/vinay/#person`, name: 'Vinay', url: `${SITE}/author/vinay/` },
    { '@type': 'Article', author: { '@id': `${SITE}/#/schema/person/aaa` } },
  ] };
  fixGraph(d, { pagePath: '/a/b/', siteUrl: SITE });
  const people = d['@graph'].filter(n => n['@type'] === 'Person');
  assert.equal(people.length, 1);
  assert.equal(people[0]['@id'], `${SITE}/author/vinay/#person`);
  assert.equal(people[0].description, 'bio');
  assert.deepEqual(d['@graph'].find(n => n['@type'] === 'Article').author, { '@id': `${SITE}/author/vinay/#person` });
});

test('listing pages get a CollectionPage and breadcrumb; authors a ProfilePage; others nothing', () => {
  const page = '<head><title>Blog - Page 2 - Spenza</title><meta name="description" content="Articles. Page 2 of 14."></head>';
  const blog = JSON.parse(listingSchema('/blog/page/2/', page, SITE).replace(/^<script[^>]*>|<\/script>$/g, ''));
  assert.ok(blog['@graph'].some(n => n['@type'] === 'CollectionPage' && n.name === 'Blog - Page 2'));
  assert.equal(blog['@graph'].find(n => n['@type'] === 'BreadcrumbList').itemListElement.length, 3);
  const person = listingSchema('/author/vinay/', page, SITE);
  assert.ok(person.includes('ProfilePage') && person.includes('/author/vinay/#person'));
  assert.equal(listingSchema('/esim/multi-carrier-sim-card/', page, SITE), null);
  assert.equal(listingSchema('/blog/', page.replace('<head>', '<head><script type="application/ld+json">{}</script>'), SITE), null);
});
