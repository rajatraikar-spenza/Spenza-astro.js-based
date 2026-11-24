// Build-time SEO fixes that apply to every page, run on the finished `dist`.
//
// They live here rather than in 258 mirrored partials and 133 posts because the problems are
// shared: the same Yoast graph, the same popup markup, the same old URLs in post bodies.
//
//   schema    The Yoast graph WordPress wrote still describes the company as a Person
//             ("Spenza", /author/isimplexity/), the Organization has no `sameAs`, a Person's
//             description arrives double-escaped, and the home breadcrumb is one item with no URL.
//   links     A link to a URL that 301s costs the reader a hop and the target some equity. Where
//             the redirect's destination is a real page in this build, point the link there.
//   popup     Gravity Forms' form title is an <h2> that lands on every page carrying the demo
//             popup, polluting the heading outline of 144 pages. It is a label, not a heading.
//   guard     Fail the build if a link to a preprod host is ever published again.
import fs from 'node:fs/promises';
import path from 'node:path';
import wpRedirects from '../../src/data/wp-redirects.json' with { type: 'json' };
import { SITE_REDIRECTS, SITE_GONE } from '../../src/data/site-redirects.mjs';
import authors from '../../src/content/cms-meta/authors.json' with { type: 'json' };
import { SITE_URL } from './config.mjs';

const SOCIAL = [
  'https://www.linkedin.com/company/spenza/',
  'https://www.youtube.com/@spenzainc',
  'https://x.com/Spenzahq',
];
const ORG_DESCRIPTION =
  'Spenza is a connectivity-as-a-service platform for MVNOs, IoT companies and enterprises: ' +
  'launch and run mobile services, manage eSIM and IoT connectivity, and control telecom spend.';

async function walk(dir, out = []) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const isStandIn = html => /http-equiv=["']refresh["']/i.test(html);
const decode = s => s.replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"');

/** Fix one JSON-LD graph in place. Returns true if anything changed. */
export function fixGraph(data, { pagePath, siteUrl }) {
  const graph = Array.isArray(data['@graph']) ? data['@graph'] : null;
  if (!graph) return false;
  let changed = false;
  const orgId = `${siteUrl}/#organization`;
  const typeOf = n => [].concat(n?.['@type'] ?? []);

  // 1. Organization: say who it is and where else it lives.
  for (const n of graph) {
    if (typeOf(n).includes('Organization') && n['@id'] === orgId) {
      if (!n.sameAs?.length) { n.sameAs = SOCIAL; changed = true; }
      if (!n.description) { n.description = ORG_DESCRIPTION; changed = true; }
    }
  }

  // 2. The company is not a Person. Drop that node and point its references at the Organization.
  const companyPersons = new Set(
    graph.filter(n => typeOf(n).includes('Person') && (n.name === 'Spenza' || /\/author\/isimplexity\/?$/.test(n.url ?? ''))).map(n => n['@id'])
  );
  if (companyPersons.size) {
    for (let i = graph.length - 1; i >= 0; i--) if (companyPersons.has(graph[i]['@id'])) graph.splice(i, 1);
    const repoint = v => {
      if (Array.isArray(v)) return v.map(repoint);
      if (v && typeof v === 'object') {
        if (companyPersons.has(v['@id'])) return { '@id': orgId };
        for (const k of Object.keys(v)) v[k] = repoint(v[k]);
      }
      return v;
    };
    for (const n of graph) for (const k of Object.keys(n)) n[k] = repoint(n[k]);
    changed = true;
  }

  // 2b. One @id per author. Yoast hashed one per post; the admin's posts use /author/<slug>/#person.
  // The same human under two ids is two entities to a search engine. Merge them under the stable one.
  const idMap = new Map();
  for (const n of graph) {
    const m = typeOf(n).includes('Person') ? String(n.url ?? '').match(/\/author\/([^/]+)\/?$/) : null;
    if (m && n['@id'] !== `${siteUrl}/author/${m[1]}/#person`) idMap.set(n['@id'], `${siteUrl}/author/${m[1]}/#person`);
  }
  if (idMap.size) {
    const rewrite = v => {
      if (Array.isArray(v)) v.forEach(rewrite);
      else if (v && typeof v === 'object') {
        if (idMap.has(v['@id'])) v['@id'] = idMap.get(v['@id']);
        Object.values(v).forEach(rewrite);
      }
    };
    graph.forEach(rewrite);
    const seen = new Map();
    for (let i = 0; i < graph.length; i++) {
      const n = graph[i];
      if (!typeOf(n).includes('Person')) continue;
      if (seen.has(n['@id'])) { Object.assign(graph[seen.get(n['@id'])], { ...n, ...graph[seen.get(n['@id'])] }); graph.splice(i--, 1); }
      else seen.set(n['@id'], i);
    }
    changed = true;
  }

  // 3. A Person's `sameAs` must be somewhere else; Yoast filled one with the site's own address.
  for (const n of graph) {
    if (typeOf(n).includes('Person') && Array.isArray(n.sameAs)) {
      const kept = n.sameAs.filter(u => String(u).replace(/\/$/, '') !== siteUrl);
      if (kept.length !== n.sameAs.length) {
        if (kept.length) n.sameAs = kept; else delete n.sameAs;
        changed = true;
      }
    }
  }

  // 3b. Entities left encoded inside a JSON string.
  for (const n of graph) {
    if (typeOf(n).includes('Person') && typeof n.description === 'string' && /&(amp|quot|#0?39);/.test(n.description)) {
      n.description = decode(n.description);
      changed = true;
    }
  }

  // 4. A one-item breadcrumb with no URL says nothing. The home page has no trail.
  if (pagePath === '/') {
    const i = graph.findIndex(n => typeOf(n).includes('BreadcrumbList'));
    if (i >= 0) {
      const id = graph[i]['@id'];
      graph.splice(i, 1);
      for (const n of graph) if (n.breadcrumb?.['@id'] === id) { delete n.breadcrumb; }
      changed = true;
    }
  }
  return changed;
}

const escapeLd = o => JSON.stringify(o).replace(/<\//g, '<\\/');
const textOf = (html, re) => (html.match(re)?.[1] ?? '').replace(/&amp;/g, '&').replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').trim();

/**
 * Listing and author pages carried no structured data at all. They get a CollectionPage (or a
 * ProfilePage for a person) and a breadcrumb, built from what the page already says about itself.
 * Returns the <script> tag, or null for any other page or one that already has JSON-LD.
 */
export function listingSchema(pagePath, html, siteUrl) {
  if (/application\/ld\+json/.test(html)) return null;
  const m = pagePath.match(/^\/(blog|category|tag|author)\/(?:([^/]+)\/)?/) ;
  if (!m && pagePath !== '/blog/') return null;
  const name = textOf(html, /<title>([^<]*)/).replace(/\s*[-|–—]\s*Spenza\s*$/, '') || 'Spenza';
  const description = textOf(html, /name="description" content="([^"]*)/);
  const url = siteUrl + pagePath;
  const org = `${siteUrl}/#organization`;
  const trail = [{ name: 'Home', item: `${siteUrl}/` }];
  if (pagePath !== '/blog/') trail.push({ name: 'Blog', item: `${siteUrl}/blog/` });
  trail.push({ name });
  const breadcrumb = {
    '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, ...(t.item ? { item: t.item } : {}) })),
  };
  const author = m?.[1] === 'author' ? authors.authors?.find(a => a.slug === m[2]) : null;
  const graph = [];
  if (author && author.slug !== 'isimplexity') {
    const pid = `${siteUrl}/author/${author.slug}/#person`;
    graph.push({ '@type': 'ProfilePage', '@id': `${url}#profilepage`, url, name, ...(description ? { description } : {}), mainEntity: { '@id': pid }, breadcrumb: { '@id': breadcrumb['@id'] }, inLanguage: 'en-US' });
    graph.push({ '@type': 'Person', '@id': pid, name: author.name, url, worksFor: { '@id': org },
      ...(author.role ? { jobTitle: author.role } : {}), ...(author.linkedin ? { sameAs: [author.linkedin] } : {}) });
    graph.push({ '@type': 'Organization', '@id': org, name: 'Spenza', url: `${siteUrl}/` });
  } else {
    graph.push({ '@type': 'CollectionPage', '@id': `${url}#webpage`, url, name, ...(description ? { description } : {}), isPartOf: { '@type': 'WebSite', name: 'Spenza', url: `${siteUrl}/` }, breadcrumb: { '@id': breadcrumb['@id'] }, inLanguage: 'en-US' });
  }
  graph.push(breadcrumb);
  return `<script type="application/ld+json">${escapeLd({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

/** `/a/b/` for `dist/a/b/index.html`. */
const pagePathOf = (out, file) => {
  const rel = path.relative(out, file).split(path.sep).join('/');
  return '/' + rel.replace(/(^|\/)index\.html$/, '$1');
};

export async function seoPass(out, logger) {
  const siteUrl = SITE_URL.replace(/\/$/, '');
  const files = await walk(out);

  // Real pages: everything that is not a meta-refresh stand-in.
  const real = new Set();
  const stand = new Set();
  const bySlug = new Map();
  const heads = new Map();
  for (const f of files) {
    const buf = await fs.readFile(f, 'utf8');
    heads.set(f, buf);
    const p = pagePathOf(out, f);
    if (isStandIn(buf)) { stand.add(p); continue; }
    real.add(p);
    const m = p.match(/^\/([^/]+)\/([^/]+)\/$/);
    if (m && !['blog', 'category', 'tag', 'author', 'page'].includes(m[1])) {
      if (!bySlug.has(m[2])) bySlug.set(m[2], []);
      bySlug.get(m[2]).push(p);
    }
  }

  // Redirect table: sources the site redirects, resolved to a final real page.
  const table = { ...wpRedirects, ...SITE_REDIRECTS };
  const gone = new Set(SITE_GONE);
  const norm = p => (p.endsWith('/') ? p : p + '/');
  const resolve = from => {
    let cur = norm(from);
    for (let i = 0; i < 6; i++) {
      if (gone.has(cur)) return null;
      const next = table[cur] ?? table[cur.replace(/\/$/, '')];
      if (!next) break;
      cur = norm(String(next).replace(/^https?:\/\/[^/]+/, ''));
    }
    return real.has(cur) && cur !== '/' && cur !== norm(from) ? cur : null;
  };
  const target = p => {
    const hit = resolve(p);
    if (hit) return hit;
    const m = p.match(/^\/blog\/([^/]+)\/$/);
    if (m && bySlug.get(m[1])?.length === 1) return bySlug.get(m[1])[0];
    return null;
  };

  let graphs = 0, links = 0, linkPages = 0, popups = 0, listings = 0, tagsNoindexed = 0;
  const preprod = [];
  const hrefRe = /(<a\b[^>]*?\shref=")((?:https:\/\/(?:www\.)?spenza\.com)?\/[^"#?]*)([?#][^"]*)?(")/g;
  const ldRe = /(<script type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g;

  for (const [file, html0] of heads) {
    const pagePath = pagePathOf(out, file);
    if (stand.has(pagePath)) continue;
    let html = html0;

    html = html.replace(ldRe, (all, open, body, close) => {
      let data;
      try { data = JSON.parse(body); } catch { return all; }
      if (!fixGraph(data, { pagePath, siteUrl })) return all;
      graphs++;
      return open + JSON.stringify(data).replace(/<\//g, '<\\/') + close;
    });

    let n = 0;
    html = html.replace(hrefRe, (all, pre, href, rest = '', post) => {
      const p = href.replace(/^https:\/\/(?:www\.)?spenza\.com/, '');
      const to = target(p);
      if (!to || to === pagePath) return all;
      n++;
      return pre + (href.startsWith('http') ? siteUrl : '') + to + (rest ?? '') + post;
    });
    if (n) { links += n; linkPages++; }

    const ld = listingSchema(pagePath, html, siteUrl);
    if (ld && html.includes('</head>')) { html = html.replace('</head>', ld + '</head>'); listings++; }
    // Tag archives stay reachable but are thin lists of posts already indexed under their category.
    if (pagePath.startsWith('/tag/') && !/name="robots"/i.test(html) && html.includes('</head>')) {
      html = html.replace('</head>', '<meta name="robots" content="noindex, follow"></head>');
      tagsNoindexed++;
    }

    html = html.replace(/<h2 class="gform_title">([^<]*)<\/h2>/g, (_, t) => { popups++; return `<div class="gform_title">${t}</div>`; });

    for (const m of html.matchAll(/(?:href|src|action)="((?:https?:)?\/\/[^"]*preprod[^"]*\.spenza\.com[^"]*)"/g)) preprod.push(`${pagePath} -> ${m[1]}`);

    if (html !== html0) await fs.writeFile(file, html, 'utf8');
  }

  logger.info(`seo: ${graphs} JSON-LD graphs fixed, ${links} redirected links repointed on ${linkPages} pages, ${popups} popup titles demoted, ${listings} listing pages given schema, ${tagsNoindexed} tag pages noindexed`);
  if (preprod.length) {
    throw new Error(`seo: ${preprod.length} link(s) to a preprod host would be published:\n  ` + preprod.slice(0, 20).join('\n  '));
  }
}
