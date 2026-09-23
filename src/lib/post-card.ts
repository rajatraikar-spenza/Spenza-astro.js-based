/**
 * A post card for the archive and blog-index grids.
 *
 * Rebuilt from the collection rather than string-patched out of a mirrored
 * card: those carry post-specific identity classes, WebP Express srcsets and
 * 7KB of nesting per card, and editing that by substitution is far more fragile
 * than emitting it.
 *
 * TWO TEMPLATES, NOT ONE
 * WordPress renders these grids through two different Elementor loop-item
 * templates, and they do not share element ids:
 *
 *   20001  the category archives at /category/<slug>/
 *   20003  the blog index at /blog/
 *
 * That matters because the mirrored CSS is scoped per template — every rule
 * reads `.elementor-20003 .elementor-element.elementor-element-06dc3c1{...}`.
 * Emitting 20001's ids on the blog index therefore matched no rule at all, so
 * the card fell back to unstyled block flow: image stacked above full-width
 * text instead of the intended side-by-side layout.
 *
 * Both templates put the image and the text in *sibling* containers inside
 * `.e-con-inner` — 4128bba/fbf0e7c for 20001, ed3837a/06dc3c1 for 20003. The
 * widths that place them side by side are set on those two containers, so
 * collapsing them into one container loses the layout even when the ids are
 * otherwise right.
 *
 * Ids below are copied from the mirrored partials, which is the only source of
 * truth for them: src/partials/archives/archive-category-*.html for 20001 and
 * src/partials/blog.html for 20003.
 */
import type { CollectionEntry } from 'astro:content';
import { categoryLabel } from '../data/blog-categories.ts';

export { decodeEntities } from '../../scripts/lib/html-entities.mjs';
import { decodeEntities } from '../../scripts/lib/html-entities.mjs';

import { renderCard, type CardData, type CardTemplate } from './post-card-render.ts';

export type { CardTemplate } from './post-card-render.ts';

/** Excerpts arrive as HTML from WordPress; cards want a short plain string. */
function plain(html: string, max = 160): string {
  const text = decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max)).trimEnd() + '…';
}

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric',
});

/** A collection entry as the card, and the search index, need it. */
export function cardData(post: CollectionEntry<'posts'>): CardData {
  const d = post.data;
  return {
    href: `/${d.category}/${d.slug}/`,
    title: d.title,
    category: d.category,
    categoryLabel: categoryLabel(d.category),
    dateIso: d.publishedDate.toISOString(),
    dateLabel: DATE_FMT.format(d.publishedDate),
    excerpt: plain(d.excerpt),
    // Only what the card prints: the record also carries a `srcSet` the card
    // does not use, which would triple the search index's image weight.
    image: d.featuredImage
      ? { url: d.featuredImage.url, alt: d.featuredImage.alt, width: d.featuredImage.width, height: d.featuredImage.height }
      : null,
    author: d.author ? { name: d.author.name, avatar: d.author.avatar || undefined } : null,
  };
}

export function postCard(post: CollectionEntry<'posts'>, template: CardTemplate = 'category'): string {
  return renderCard(cardData(post), template);
}

/** The grid Elementor's loop-grid widget renders its items into. */
export function postGrid(
  posts: CollectionEntry<'posts'>[],
  template: CardTemplate = 'category'
): string {
  if (!posts.length) return '<p class="elementor-widget-container">No posts found.</p>';
  return (
    '<div class="elementor-loop-container elementor-grid">' +
    posts.map(p => postCard(p, template)).join('') +
    '</div>'
  );
}

/**
 * How many page links WordPress keeps around the ends and around the current
 * page. These are `paginate_links`' defaults, which is what Elementor asks for:
 * the mirrored `/blog/` listed `Previous 1 2 3 … 26 Next`, and reproducing the
 * window means reproducing the two numbers behind it.
 */
const END_SIZE = 1;
const MID_SIZE = 2;

/**
 * Numbered pagination in Elementor's markup.
 *
 * Page 1 is the bare path so `/blog/` and `/category/x/` stay canonical; later
 * pages append `page/N/`, matching what WordPress served. The hrefs are the one
 * deliberate difference from the mirror, which paginates with Elementor's
 * `?e-page-<widget>=N` query parameter — that needs its AJAX runtime, and a
 * static build has real URLs to link instead.
 *
 * Everything else follows `paginate_links` exactly, including the parts that
 * look like oversights: the window collapses to `…` rather than printing every
 * page (26 numbers wrapped to five rows on a phone), each number carries a
 * screen-reader-only "Page", and an unavailable Previous/Next stays in the flow
 * as an inert `<span>` instead of disappearing — which is what keeps the row
 * from reflowing as you move through it.
 */
export function pagination(base: string, page: number, totalPages: number): string {
  if (totalPages <= 1) return '';
  const href = (n: number) => (n === 1 ? base : `${base}page/${n}/`);
  const label = (n: number) => `<span class="elementor-screen-only">Page</span>${n}`;
  const parts: string[] = [];

  parts.push(
    page > 1
      ? `<a class="page-numbers prev" href="${href(page - 1)}">Previous</a>`
      : '<span class="page-numbers prev">Previous</span>'
  );

  /**
   * True once a number has been printed, so the next gap prints one `…` and
   * not one per page skipped. WordPress tracks it with exactly this flag.
   */
  let dots = false;

  for (let n = 1; n <= totalPages; n++) {
    if (n === page) {
      parts.push(`<span aria-current="page" class="page-numbers current">${label(n)}</span>`);
      dots = true;
      continue;
    }
    const inWindow =
      n <= END_SIZE ||
      (n >= page - MID_SIZE && n <= page + MID_SIZE) ||
      n > totalPages - END_SIZE;

    if (inWindow) {
      parts.push(`<a class="page-numbers" href="${href(n)}">${label(n)}</a>`);
      dots = true;
    } else if (dots) {
      parts.push('<span class="page-numbers dots">&hellip;</span>');
      dots = false;
    }
  }

  parts.push(
    page < totalPages
      ? `<a class="page-numbers next" href="${href(page + 1)}">Next</a>`
      : '<span class="page-numbers next">Next</span>'
  );

  return `<nav class="elementor-pagination" aria-label="Pagination">${parts.join('')}</nav>`;
}
