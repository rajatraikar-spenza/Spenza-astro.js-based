/**
 * "Latest Telecom Industry Insights" — the post carousel on the home page.
 *
 * It was mirrored HTML: twelve slides frozen at whatever was newest when the
 * mirror last ran, on a section whose entire job is to show what is newest. A
 * post published afterwards never appeared there, however many builds ran.
 *
 * This rebuilds the slides from the collection, the same way the category
 * archives already rebuild their grids. The markup reproduces Elementor's loop
 * template 17185 exactly — a third card shape, distinct from the two archive
 * templates `post-card.ts` handles, with no author box or excerpt but a
 * category heading and a Read More button.
 *
 * Element ids belong to the template rather than to any post, which is what
 * lets one set of ids serve every slide. The mirrored CSS styles the whole
 * section through them, so markup with different ids would get no styling at
 * all.
 */
import { featuredImage, ARROW_ICON, type LoopPost } from './loop-item.ts';
import { categoryLabel } from '../data/blog-categories.ts';
import { decodeEntities } from '../../scripts/lib/html-entities.mjs';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Element ids from loop template 17185, in the order the slide nests them. */
const T = {
  templateId: '17185',
  outer: 'ee238a9',
  inner: '6fb8b55',
  image: '741840a',
  categories: '3f9f074',
  title: '792bc5b',
  meta: '9d242e2',
  button: '1c5b407',
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const pad = (n: number) => String(n).padStart(2, '0');

/** One Elementor widget wrapper, with its container div. */
function widget(id: string, classes: string, type: string, inner: string): string {
  return (
    `<div class="elementor-element elementor-element-${id} ${classes}" data-id="${id}" ` +
    `data-element_type="widget" data-e-type="widget" data-widget_type="${type}">` +
    `<div class="elementor-widget-container">${inner}</div></div>`
  );
}

function slide(post: LoopPost, dayArchives: ReadonlySet<string>): string {
  const href = `/${post.category}/${post.slug}/`;
  const label = categoryLabel(post.category) ?? post.category;
  const d = post.publishedDate;
  const dayHref = `/${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}/`;
  const dateText = `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

  const image = widget(
    T.image,
    'blog-img elementor-widget elementor-widget-theme-post-featured-image elementor-widget-image',
    'theme-post-featured-image.default',
    featuredImage(post)
  );

  const categories = widget(
    T.categories,
    'elementor-widget__width-inherit categories elementor-widget elementor-widget-heading',
    'heading.default',
    `<p class="elementor-heading-title elementor-size-default">` +
      `<a href="/category/${esc(post.category)}/" rel="tag">${esc(label)}</a></p>`
  );

  // The title arrives as HTML from WordPress, so it is decoded before being
  // escaped again — otherwise an ampersand renders as the entity itself.
  const title = widget(
    T.title,
    'blog-heading elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading',
    'theme-post-title.default',
    `<h3 class="elementor-heading-title elementor-size-default">` +
      `<a href="${href}">${esc(decodeEntities(post.title))}</a></h3>`
  );

  /**
   * The date links its day archive only when this build contains one.
   *
   * Day archives are mirrored pages, one per captured date, so a post published
   * since the last `wp:archives` run has none. This carousel is on the home
   * page, which makes a missing archive a 404 in the site's most visible
   * section. Elementor drops the anchor when the date is unlinked, so the
   * markup stays one of its own variants.
   */
  const dateInner =
    `<span class="elementor-icon-list-icon">` +
      `<i aria-hidden="true" class="fas fa-calendar"></i></span>` +
    `<span class="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-date">` +
      `<time>${dateText}</time></span>`;

  const meta = widget(
    T.meta,
    'elementor-widget__width-inherit blog-meta elementor-widget elementor-widget-post-info',
    'post-info.default',
    `<ul class="elementor-inline-items elementor-icon-list-items elementor-post-info">` +
      `<li class="elementor-icon-list-item elementor-repeater-item-cbff068 elementor-inline-item" itemprop="datePublished">` +
        (dayArchives.has(dayHref) ? `<a href="${dayHref}">${dateInner}</a>` : dateInner) +
      `</li></ul>`
  );

  const button = widget(
    T.button,
    'arrow-btn elementor-widget elementor-widget-button',
    'button.default',
    `<div class="elementor-button-wrapper">` +
      `<a class="elementor-button elementor-button-link elementor-size-sm" href="${href}">` +
        `<span class="elementor-button-content-wrapper">` +
          `<span class="elementor-button-icon">${ARROW_ICON}</span>` +
          `<span class="elementor-button-text">Read More</span>` +
        `</span></a></div>`
  );

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

  return (
    `<div data-elementor-type="loop-item" data-elementor-id="${T.templateId}" ` +
    `class="elementor elementor-${T.templateId} swiper-slide e-loop-item ${postClasses}" ` +
    `data-elementor-post-type="elementor_library" role="group" ` +
    `aria-roledescription="slide" data-custom-edit-handle="1">` +
      `<div class="elementor-element elementor-element-${T.outer} e-flex e-con-boxed e-con e-parent" ` +
      `data-id="${T.outer}" data-element_type="container" data-e-type="container">` +
        `<div class="e-con-inner">` +
          `<div class="elementor-element elementor-element-${T.inner} e-con-full blog-loop e-flex e-con e-child" ` +
          `data-id="${T.inner}" data-element_type="container" data-e-type="container">` +
            image + categories + title + meta + button +
          `</div></div></div></div>`
  );
}

/**
 * The full contents of the loop-carousel widget: the Swiper track and the two
 * navigation buttons, which live inside the widget rather than beside it.
 */
export function renderHomeCarousel(
  posts: LoopPost[],
  dayArchives: ReadonlySet<string> = new Set()
): string {
  return (
    `<div class="swiper elementor-loop-container elementor-grid" dir="ltr">` +
      `<div class="swiper-wrapper" aria-live="polite">` +
        posts.map(p => slide(p, dayArchives)).join('') +
      `</div></div>` +
    `<div class="elementor-swiper-button elementor-swiper-button-prev" role="button" tabindex="0" aria-label="Previous">` +
      `<i aria-hidden="true" class="eicon-chevron-left"></i></div>` +
    `<div class="elementor-swiper-button elementor-swiper-button-next" role="button" tabindex="0" aria-label="Next">` +
      `<i aria-hidden="true" class="eicon-chevron-right"></i></div>`
  );
}

/** The widget the home page carries this carousel in. */
export const HOME_CAROUSEL_ID = 'b0b2c58';
