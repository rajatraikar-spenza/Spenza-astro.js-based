/**
 * Fill /sitemap/ from the finished /sitemap.xml.
 *
 * The HTML sitemap used to be a WordPress partial: a list of posts frozen on
 * the day the mirror ran, which kept naming posts that had since been merged
 * and redirected, and never named the ones published afterwards. A hand-kept
 * list drifts, so this one is not kept by hand. `src/pages/sitemap.astro`
 * renders the page's frame — heading, search box, the places the list goes —
 * and this hook, running at `astro:build:done` after `sitemapAlias()` has
 * written `dist/sitemap.xml`, reads that file and writes the list into the
 * built page. Every URL the XML lists is on the page; nothing it does not
 * list is.
 *
 * What the page calls each link comes from the built page itself (a post's
 * heading, a page's title), except for the top-level pages, which have short
 * names in `src/data/sitemap-groups.mjs` because their titles are written for
 * search results. Paginated archive pages (`/blog/page/2/`) are counted, not
 * listed: thirty links to the same index are not a map.
 *
 * Must be registered after `sitemapAlias()`, for the reason that one gives.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PAGE_GROUPS, BLOG_GROUPS, ARCHIVE_TITLES, AUTHOR_LABEL } from '../../src/data/sitemap-groups.mjs';

const TOKENS = ['%%SM_TOTAL%%', '%%SM_UPDATED%%', '%%SM_CHIPS%%', '%%SM_GROUPS%%'];
const SELF = '/sitemap/';

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘' };
const decode = s =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tidy = s => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/** `/a/b/` → `a/b/index.html` under the output directory. */
const fileFor = p => path.join(...p.split('/').filter(Boolean), 'index.html');

/** The entries of a urlset, as `{ path, lastmod }`. */
function entries(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => {
    const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '';
    return {
      path: new URL(loc).pathname,
      lastmod: m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
    };
  });
}

/** A built page's own name for itself: its heading for a post, else its title. */
async function readTitle(out, p, prefer) {
  let html;
  try {
    html = await fs.readFile(path.join(out, fileFor(p)), 'utf8');
  } catch {
    return undefined;
  }
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const clean = t => (t ? tidy(t).replace(/\s*[|\-–]\s*Spenza$/i, '').trim() : undefined);
  return (prefer === 'h1' ? clean(h1) || clean(title) : clean(title) || clean(h1)) || undefined;
}

const fmtDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

/** Run `fn` over `items` a few at a time, keeping order. */
async function mapLimit(items, limit, fn) {
  const res = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        res[i] = await fn(items[i], i);
      }
    }),
  );
  return res;
}

/** `meta` shows under the label for a page (its path); for a post it is a tooltip (its date). */
const link = (href, label, meta, kind) =>
  `<li data-q="${esc(`${label} ${href}`.toLowerCase())}"><a href="${esc(href)}"${kind === 'path' || !meta ? '' : ` title="${esc(meta)}"`}>` +
  `<span class="sm-t">${esc(label)}</span>` +
  (kind === 'path' && meta ? `<span class="sm-m">${esc(meta)}</span>` : '') +
  `</a></li>`;

function section(g) {
  return (
    `<section class="sm-group" id="${esc(g.id)}" data-sm-group>` +
    `<header class="sm-group__head"><div><h2>${esc(g.title)}</h2>` +
    (g.blurb ? `<p>${esc(g.blurb)}</p>` : '') +
    `</div><span class="sm-count" data-sm-count data-total="${g.items.length}">${g.items.length}</span></header>` +
    `<ul class="sm-list${g.items.length > 12 ? ' sm-list--cols' : ''}">${g.items.join('')}</ul></section>`
  );
}

export function sitemapPage() {
  return {
    name: 'spenza:sitemap-page',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        // Not `dir.pathname`: the project path contains a space (see sitemapAlias).
        const out = fileURLToPath(dir);

        let xml, page;
        try {
          xml = await fs.readFile(path.join(out, 'sitemap.xml'), 'utf8');
          page = await fs.readFile(path.join(out, 'sitemap', 'index.html'), 'utf8');
        } catch (err) {
          if (err.code !== 'ENOENT') throw err;
          logger.warn(`sitemap.xml or sitemap/index.html is missing, so /sitemap/ was not filled (${err.path}).`);
          return;
        }
        const missing = TOKENS.filter(t => !page.includes(t));
        if (missing.length) {
          logger.warn(`sitemap/index.html lacks ${missing.join(', ')}; the page frame and this hook have drifted apart.`);
          return;
        }

        const all = entries(xml).filter(e => e.path !== SELF);
        const byPath = new Map(all.map(e => [e.path, e]));
        const placed = new Set();

        // Top-level pages, by the groups that name them.
        const groups = new Map();
        const add = (id, title, blurb, items) => groups.set(id, { id, title, blurb, items });

        const pageGroup = async cfg => {
          const items = [];
          for (const [p, label] of cfg.pages) {
            if (!byPath.has(p)) continue; // named here, not in the XML: not listed
            placed.add(p);
            items.push(link(p, label, p === '/' ? '/' : p, 'path'));
          }
          return { cfg, items };
        };
        const pageGroups = await Promise.all(PAGE_GROUPS.map(pageGroup));

        // Posts: two segments, first one a blog category.
        const seg = p => p.split('/').filter(Boolean);
        const isArchive = p => /^\/(blog|category)\//.test(p);
        const isAuthor = p => /^\/author\/[^/]+\/$/.test(p);
        const posts = all.filter(e => {
          const s = seg(e.path);
          return s.length === 2 && !['category', 'author', 'blog'].includes(s[0]) && !placed.has(e.path);
        });
        const titled = await mapLimit(posts, 16, async e => ({
          ...e,
          title: (await readTitle(out, e.path, 'h1')) ?? seg(e.path)[1].replace(/-/g, ' '),
        }));
        const known = new Set(BLOG_GROUPS.map(b => b.slug));
        const blogCfg = [
          ...BLOG_GROUPS,
          ...[...new Set(titled.map(e => seg(e.path)[0]))]
            .filter(s => !known.has(s))
            .map(s => ({ slug: s, title: AUTHOR_LABEL(s), blurb: '' })),
        ];
        const blog = blogCfg
          .map(b => ({
            cfg: b,
            items: titled
              .filter(e => seg(e.path)[0] === b.slug)
              .sort((a, c) => a.title.localeCompare(c.title, 'en', { sensitivity: 'base' }))
              .map(e => (placed.add(e.path), link(e.path, e.title, fmtDate(e.lastmod) && `Updated ${fmtDate(e.lastmod)}`))),
          }))
          .filter(b => b.items.length);

        // Archives and authors. Pagination is counted, never listed.
        const paginated = all.filter(e => isArchive(e.path) && /\/page\/\d+\/$/.test(e.path));
        paginated.forEach(e => placed.add(e.path));
        const archives = all
          .filter(e => isArchive(e.path) && !placed.has(e.path))
          .map(e => (placed.add(e.path), link(e.path, ARCHIVE_TITLES[e.path] ?? AUTHOR_LABEL(seg(e.path).at(-1)), e.path, 'path')));
        const authors = await Promise.all(
          all
            .filter(e => isAuthor(e.path) && !placed.has(e.path))
            .map(async e => {
              placed.add(e.path);
              const name = (await readTitle(out, e.path, 'title')) ?? AUTHOR_LABEL(seg(e.path)[1]);
              return link(e.path, name.replace(/\s*Archives?$/i, ''), e.path, 'path');
            }),
        );

        // Whatever the XML lists that nothing above claimed.
        const rest = await Promise.all(
          all
            .filter(e => !placed.has(e.path))
            .map(async e => link(e.path, (await readTitle(out, e.path, 'title')) ?? e.path, e.path, 'path')),
        );

        const byId = Object.fromEntries(pageGroups.map(g => [g.cfg.id, g]));
        const pg = id => byId[id].items.length && add(id, byId[id].cfg.title, byId[id].cfg.blurb, byId[id].items);
        ['platform', 'plans', 'tools'].forEach(pg);
        blog.forEach(b => add(`blog-${b.cfg.slug}`, b.cfg.title, b.cfg.blurb, b.items));
        if (archives.length || authors.length) {
          add('blog-directory', 'Blog directory', `Every article list and author page. ${paginated.length} further pages of these lists are in the XML sitemap and not repeated here.`, [...archives, ...authors]);
        }
        ['company', 'legal'].forEach(pg);
        if (rest.length) add('more', 'More pages', '', rest);

        const list = [...groups.values()];
        // What is listed, which is what the search counts; paginated pages are in the XML but not here.
        const total = list.reduce((n, g) => n + g.items.length, 0);
        const newest = all.map(e => e.lastmod).filter(Boolean).sort().at(-1);

        const chips =
          `<nav class="sm-chips" aria-label="Jump to a section">` +
          list.map(g => `<a href="#${esc(g.id)}" data-sm-chip="${esc(g.id)}">${esc(g.title)}<span>${g.items.length}</span></a>`).join('') +
          `</nav>`;
        const groupsHtml = `<div class="sm-groups">${list.map(section).join('')}</div>`;

        // `replace` with a function: the body holds `$&`-looking text in titles.
        const filled = page
          .replace('%%SM_TOTAL%%', () => String(total))
          .replace('%%SM_UPDATED%%', () => fmtDate(newest))
          .replace('%%SM_CHIPS%%', () => chips)
          .replace('%%SM_GROUPS%%', () => groupsHtml);
        await fs.writeFile(path.join(out, 'sitemap', 'index.html'), filled);

        logger.info(`sitemap/: ${total} URLs from sitemap.xml in ${list.length} sections (${paginated.length} paginated archive pages counted)`);
        if (total + paginated.length !== all.length) {
          logger.warn(`sitemap/: listed ${total} + ${paginated.length} paginated, but sitemap.xml has ${all.length} URLs besides itself`);
        }
      },
    },
  };
}
