/**
 * The "Related Articles" grid, rebuilt as Elementor's own loop-item markup.
 *
 * The single-post template renders this section with a loop-grid widget bound to
 * loop template 20154. Every card is therefore a full Elementor document — its
 * own containers, widget wrappers and element ids — and the mirrored CSS styles
 * it entirely through those ids (`.elementor-20154 .elementor-element-4425a9e`
 * and friends, all of which survive the CSS purge into the `__post__` bundle).
 *
 * That is why this file reproduces the template rather than emitting simpler
 * cards: markup with different class names gets no styling at all from the
 * bundle the page already loads, which is what made the headless grid look
 * nothing like preprod.
 *
 * Element ids belong to the loop template, not to any post, so they are
 * hard-coded here exactly as `wp:post-shell` treats the ids in the page shell.
 */
import { existsSync } from 'node:fs';
import { hasMedia } from './media-manifest.ts';
import path from 'node:path';
import { MEDIA_ORIGIN } from '../../scripts/lib/config.mjs';
import { categoryLabel } from '../data/blog-categories.ts';

/**
 * Project root, for the build-time existence checks below.
 *
 * Deliberately not `PROJECT` from `scripts/lib/config.mjs`: that constant is
 * derived from `import.meta.dirname`, and Vite bundles the module into the
 * output tree, so inside `astro build` it resolves to `<root>/dist` and every
 * check silently answers false. `cwd` is where Astro's own root defaults to and
 * where the npm scripts run from.
 */
const ROOT = process.cwd();

export interface LoopPost {
  databaseId: number;
  slug: string;
  title: string;
  category: string;
  categories: string[];
  tags: string[];
  excerpt: string;
  publishedDate: Date;
  featuredImage?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
    id?: number;
    srcSet?: string;
  };
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * WordPress stores post dates without a timezone, so they parse as local time
 * and the local getters read back the same calendar day WordPress shows. Using
 * the UTC getters here would shift a date across midnight for anyone building
 * east of GMT.
 */
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Elementor's date widget: "August 10, 2026", linking the day archive.
 *
 * The link is dropped when that archive is not a route in this build. Day
 * archives are still mirrored pages, one hand-written file per captured date,
 * so a post published since the last `wp:archives` run has no page for its day
 * — and this card appears on all 256 posts, which turns one missing archive
 * into a site-wide 404. Elementor omits the anchor when the date is unlinked,
 * so the markup stays one of its own variants rather than a bespoke shape.
 */
function dateParts(d: Date) {
  const [y, m, day] = [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())];
  return {
    text: `${MONTHS[d.getMonth()]} ${d.getDate()}, ${y}`,
    href: `/${y}/${m}/${day}/`,
    linked: existsSync(path.join(ROOT, 'src', 'pages', String(y), m, `${day}.astro`)),
  };
}

/**
 * Elementor's excerpt widget is configured to 20 words on this template, and
 * adds no ellipsis. Measured across the mirrored captures: every one of the 120
 * loop excerpts is exactly 20 words.
 *
 * Tags are stripped rather than escaped — the excerpt arrives as HTML, so its
 * entities are already encoded and re-escaping would double them.
 */
function excerptText(html: string): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').slice(0, 20).join(' ');
}

/**
 * Whether a site-absolute media URL has a file behind it.
 *
 * WordPress names every intermediate size it generated, but the mirror only
 * holds what `wp:webp` and the media pass actually fetched — a post published
 * since the last run has its full-size image and none of the resized variants.
 * Emitting those unchecked puts 404s in `srcset`, which the asset audit catches
 * and a reader sees as a missing thumbnail at the wrong viewport width.
 */
function onDisk(url: string): boolean {
  const local = MEDIA_ORIGIN && url.startsWith(MEDIA_ORIGIN)
    ? url.slice(MEDIA_ORIGIN.length)
    : url;
  return local.startsWith('/') && hasMedia(local);
}

/** The candidate list, minus anything the mirror does not have. */
function localSrcSet(srcSet: string): string[] {
  return srcSet
    .split(',')
    .map(c => c.trim())
    .filter(c => c && onDisk(c.split(/\s+/)[0]));
}

/**
 * WebP Express serves a `.webp` twin of every upload from its own directory,
 * which the mirror files under `/wp-assets/`. Offered only when it is on disk:
 * a `<picture>` whose `<source>` 404s shows a broken image rather than falling
 * back to the `<img>`, so guessing here would be worse than shipping the PNG.
 */
function webpFor(url: string): string | null {
  const local = MEDIA_ORIGIN && url.startsWith(MEDIA_ORIGIN)
    ? url.slice(MEDIA_ORIGIN.length)
    : url;
  const m = local.match(/^\/wp-content\/uploads\/(.+)$/);
  if (!m) return null;

  const variant = `/wp-assets/wp-content/webp-express/webp-images/uploads/${m[1]}.webp`;
  // Existence comes from the manifest, not the filesystem: the media is served
  // from S3 and no longer committed. What is *emitted* has to follow the media
  // host, or the `<source>` points at an origin that no longer carries media.
  if (!hasMedia(variant)) return null;
  return MEDIA_ORIGIN ? `${MEDIA_ORIGIN}${variant}` : variant;
}

/** The same mapping applied across a candidate list. */
function webpSrcSet(candidates: string[]): string | null {
  const out: string[] = [];
  for (const candidate of candidates) {
    const [url, ...rest] = candidate.split(/\s+/);
    const webp = webpFor(url);
    if (!webp) return null; // A partial candidate list would mis-serve sizes.
    out.push([webp, ...rest].join(' '));
  }
  return out.length ? out.join(', ') : null;
}

/** `theme-post-featured-image`, matching WordPress' own attachment markup. */
function featuredImage(post: LoopPost): string {
  const img = post.featuredImage;
  if (!img) return '';

  const alt = esc(img.alt || post.title);
  const width = img.width;
  const height = img.height;

  // WordPress' default `sizes`: full-width below the image's own width, then
  // capped at it. Computed rather than fetched — the GraphQL field is scoped to
  // a registered size and returns the medium variant's value.
  const sizes = width ? `(max-width: ${width}px) 100vw, ${width}px` : '';

  // WordPress itself omits `srcset` when only one candidate survives, and a
  // lone candidate would describe the `src` the browser already has.
  const candidates = img.srcSet ? localSrcSet(img.srcSet) : [];
  const srcSet = candidates.length > 1 ? candidates.join(', ') : '';
  const webp = srcSet ? webpSrcSet(candidates) : webpFor(img.url);

  const attrs = [
    width ? `width="${width}"` : '',
    height ? `height="${height}"` : '',
    `src="${esc(img.url)}"`,
    `class="attachment-full size-full${img.id ? ` wp-image-${img.id}` : ''}${webp ? ' webpexpress-processed' : ''}"`,
    `alt="${alt}"`,
    srcSet ? `srcset="${esc(srcSet)}"` : '',
    srcSet && sizes ? `sizes="${sizes}"` : '',
  ].filter(Boolean).join(' ');

  const tag = `<img ${attrs} />`;
  if (!webp) return tag;

  return `<picture><source srcset="${esc(webp)}"${sizes ? ` sizes="${sizes}"` : ''} type="image/webp">${tag}</picture>`;
}

/** The arrow glyph Elementor renders inside the card's "Read More" button. */
const ARROW_ICON =
  '<svg class="ekit-svg-icon icon-arrow-right-circle" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M25.948 6.052c-2.871-2.871-6.688-4.452-10.748-4.452s-7.877 1.581-10.748 4.452-4.452 6.688-4.452 10.748 ' +
  '1.581 7.877 4.452 10.748 6.688 4.452 10.748 4.452 7.877-1.581 10.748-4.452 4.452-6.688 4.452-10.748-1.581-7.877-4.452-10.748z' +
  'M15.2 30.4c-7.499 0-13.6-6.101-13.6-13.6s6.101-13.6 13.6-13.6c7.499 0 13.6 6.101 13.6 13.6s-6.101 13.6-13.6 13.6z' +
  'M24.566 16.234l-6.4-6.4c-0.312-0.312-0.819-0.312-1.131 0s-0.312 0.819 0 1.131l5.034 5.034h-16.469c-0.442 0-0.8 0.358-0.8 0.8' +
  's0.358 0.8 0.8 0.8h16.469l-5.034 5.034c-0.312 0.312-0.312 0.819 0 1.131 0.156 0.156 0.361 0.234 0.566 0.234s0.409-0.078 0.566-0.234' +
  'l6.4-6.4c0.313-0.312 0.313-0.819 0-1.131z"></path></svg>';

/** One card: an `e-loop-item` document rendered from loop template 20154. */
export function renderLoopItem(post: LoopPost): string {
  const href = `/${post.category}/${post.slug}/`;
  const label = categoryLabel(post.category) ?? post.category;
  const date = dateParts(post.publishedDate);

  // WordPress' own post_class() output, in its order.
  const postClasses = [
    `e-loop-item-${post.databaseId}`,
    `post-${post.databaseId}`,
    'post', 'type-post', 'status-publish', 'format-standard',
    post.featuredImage ? 'has-post-thumbnail' : '',
    'hentry',
    ...post.categories.map(c => `category-${c}`),
    ...post.tags.map(t => `tag-${t}`),
    'ast-article-single',
  ].filter(Boolean).join(' ');

  return `<div data-elementor-type="loop-item" data-elementor-id="20154" class="elementor elementor-20154 e-loop-item ${postClasses}" data-elementor-post-type="elementor_library" data-custom-edit-handle="1">
<div class="elementor-element elementor-element-54504e6 e-flex e-con-boxed e-con e-parent" data-id="54504e6" data-element_type="container" data-e-type="container">
<div class="e-con-inner">
<div class="elementor-element elementor-element-4425a9e e-con-full e-flex e-con e-child" data-id="4425a9e" data-element_type="container" data-e-type="container">
<div class="elementor-element elementor-element-0617666 elementor-widget elementor-widget-theme-post-featured-image elementor-widget-image" data-id="0617666" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-featured-image.default">
<div class="elementor-widget-container">${featuredImage(post)}</div>
</div>
<div class="elementor-element elementor-element-e0c4b25 elementor-widget elementor-widget-post-info" data-id="e0c4b25" data-element_type="widget" data-e-type="widget" data-widget_type="post-info.default">
<div class="elementor-widget-container">
<ul class="elementor-inline-items elementor-icon-list-items elementor-post-info">
<li class="elementor-icon-list-item elementor-repeater-item-99896a0 elementor-inline-item" itemprop="about">
<span class="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-terms">
<span class="elementor-post-info__terms-list">
<a href="/category/${esc(post.category)}/" class="elementor-post-info__terms-list-item">${esc(label)}</a>				</span>
</span>
</li>
</ul>
</div>
</div>
<div class="elementor-element elementor-element-07e1b17 elementor-widget elementor-widget-post-info" data-id="07e1b17" data-element_type="widget" data-e-type="widget" data-widget_type="post-info.default">
<div class="elementor-widget-container">
<ul class="elementor-inline-items elementor-icon-list-items elementor-post-info">
<li class="elementor-icon-list-item elementor-repeater-item-99896a0 elementor-inline-item" itemprop="datePublished">
${date.linked ? `<a href="${date.href}">` : ''}
<span class="elementor-icon-list-icon">
<i aria-hidden="true" class="fas fa-calendar"></i>							</span>
<span class="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-date">
<time>${date.text}</time>					</span>
${date.linked ? '</a>' : ''}
</li>
</ul>
</div>
</div>
<div class="elementor-element elementor-element-bf1b97a elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading" data-id="bf1b97a" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-title.default">
<div class="elementor-widget-container">
<h3 class="elementor-heading-title elementor-size-default">${esc(post.title)}</h3>				</div>
</div>
<div class="elementor-element elementor-element-08101b9 elementor-widget elementor-widget-theme-post-excerpt" data-id="08101b9" data-element_type="widget" data-e-type="widget" data-widget_type="theme-post-excerpt.default">
<div class="elementor-widget-container">
${excerptText(post.excerpt)}				</div>
</div>
<div class="elementor-element elementor-element-cd7884c elementor-align-left elementor-widget elementor-widget-button" data-id="cd7884c" data-element_type="widget" data-e-type="widget" data-widget_type="button.default">
<div class="elementor-widget-container">
<div class="elementor-button-wrapper">
<a class="elementor-button elementor-button-link elementor-size-sm" href="${href}">
<span class="elementor-button-content-wrapper">
<span class="elementor-button-icon">
${ARROW_ICON}			</span>
<span class="elementor-button-text">Read More</span>
</span>
</a>
</div>
</div>
</div>
</div>
</div>
</div>
</div>`;
}

/** The grid wrapper the loop-grid widget puts its items in. */
export function renderLoopGrid(posts: LoopPost[]): string {
  if (!posts.length) return '';
  return `<div class="elementor-loop-container elementor-grid">${posts.map(renderLoopItem).join('')}</div>`;
}
