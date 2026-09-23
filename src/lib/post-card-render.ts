/**
 * The post card's markup, from plain data.
 *
 * Split out of `post-card.ts` so the browser can build the same card: the
 * search page renders its results client-side, and a card that only *looked*
 * like the blog's would drift from it the first time either changed. This
 * module imports nothing that exists only at build time — `post-card.ts` turns
 * a collection entry into `CardData` and calls `renderCard`, and so does the
 * search page's script, from the index at `/search-index.json`.
 *
 * Why the markup looks the way it does (two Elementor templates, ids copied
 * from the mirrored partials) is explained at the top of `post-card.ts`.
 */

/** Everything a card shows, already formatted. */
export interface CardData {
  href: string;
  title: string;
  /** Category slug, for the `category-<slug>` class. */
  category: string;
  categoryLabel: string;
  dateIso: string;
  dateLabel: string;
  /** Plain text, already shortened. */
  excerpt: string;
  image?: { url: string; alt?: string; width?: number; height?: number } | null;
  author?: { name: string; avatar?: string } | null;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Which loop-item template a grid renders through. */
export type CardTemplate = 'category' | 'blog';

/**
 * Element ids per template.
 *
 * `authorBox` is 20001-only and `categoryHeading` is 20003-only — the two
 * templates genuinely differ in which widgets they carry, not just in ids.
 */
const IDS = {
  category: {
    templateId: '20001',
    parent: '1f161c0',
    link: '54d9cb2',
    imageCon: '4128bba',
    textCon: 'fbf0e7c',
    image: '5cda6c2',
    categoryHeading: '',
    postInfo: '5c4f8eb',
    title: '538fef7',
    excerpt: '191b994',
    iconBox: '03bf2f7',
    authorBox: 'f9730ff',
  },
  blog: {
    templateId: '20003',
    parent: '49f35d6',
    link: '34461b5',
    imageCon: 'ed3837a',
    textCon: '06dc3c1',
    image: 'd994717',
    categoryHeading: '867df23',
    postInfo: '0e3bdfa',
    title: '95e15a5',
    excerpt: 'b199265',
    iconBox: '338e1fe',
    authorBox: '',
  },
} as const satisfies Record<CardTemplate, Record<string, string>>;

/** The "Read More" arrow, identical in both templates. */
const ARROW_SVG =
  '<svg class="ekit-svg-icon icon-arrow-right-circle" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M25.948 6.052c-2.871-2.871-6.688-4.452-10.748-4.452s-7.877 1.581-10.748 4.452-4.452 6.688-4.452 10.748 ' +
  '1.581 7.877 4.452 10.748 6.688 4.452 10.748 4.452 7.877-1.581 10.748-4.452 4.452-6.688 4.452-10.748-1.581-7.877-4.452-10.748z' +
  'M15.2 30.4c-7.499 0-13.6-6.101-13.6-13.6s6.101-13.6 13.6-13.6c7.499 0 13.6 6.101 13.6 13.6s-6.101 13.6-13.6 13.6z' +
  'M24.566 16.234l-6.4-6.4c-0.312-0.312-0.819-0.312-1.131 0s-0.312 0.819 0 1.131l5.034 5.034h-16.469c-0.442 0-0.8 0.358-0.8 0.8' +
  's0.358 0.8 0.8 0.8h16.469l-5.034 5.034c-0.312 0.312-0.312 0.819 0 1.131 0.156 0.156 0.361 0.234 0.566 0.234' +
  's0.409-0.078 0.566-0.234l6.4-6.4c0.313-0.312 0.313-0.819 0-1.131z"></path></svg>';

/** An Elementor widget wrapper, which is identical apart from its type classes. */
const widget = (id: string, typeClasses: string, widgetType: string, inner: string) =>
  `<div class="elementor-element elementor-element-${id} ${typeClasses}" data-id="${id}" ` +
  `data-element_type="widget" data-e-type="widget" data-widget_type="${widgetType}">` +
  `<div class="elementor-widget-container">${inner}</div></div>`;

/** An Elementor flex container. */
const container = (id: string, inner: string) =>
  `<div class="elementor-element elementor-element-${id} e-con-full e-flex e-con e-child" data-id="${id}" ` +
  `data-element_type="container" data-e-type="container">${inner}</div>`;

export function renderCard(d: CardData, template: CardTemplate = 'category'): string {
  const t = IDS[template];
  const href = d.href;
  const img = d.image;

  // `loading="lazy"` on every card: none of them is the LCP element, and the
  // grids run to ten cards.
  const image = img
    ? `<img src="${esc(img.url)}" alt="${esc(img.alt || d.title)}"` +
      (img.width ? ` width="${img.width}"` : '') +
      (img.height ? ` height="${img.height}"` : '') +
      ` class="attachment-full size-full" loading="lazy" decoding="async" />`
    : '';

  // Only the blog template labels the card with its category.
  const categoryHeading = t.categoryHeading
    ? widget(
        t.categoryHeading,
        'elementor-widget elementor-widget-heading',
        'heading.default',
        `<h3 class="elementor-heading-title elementor-size-default"><span>${esc(d.categoryLabel)}</span></h3>`
      )
    : '';

  // A single date item with a calendar icon — both templates show exactly this,
  // and neither shows the category term here.
  const postInfo = widget(
    t.postInfo,
    'elementor-widget elementor-widget-post-info',
    'post-info.default',
    '<ul class="elementor-inline-items elementor-icon-list-items elementor-post-info">' +
      '<li class="elementor-icon-list-item elementor-repeater-item-1a89d90 elementor-inline-item" itemprop="datePublished">' +
      '<span class="elementor-icon-list-icon"><i aria-hidden="true" class="fas fa-calendar"></i></span>' +
      '<span class="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-date">' +
      `<time datetime="${esc(d.dateIso)}">${esc(d.dateLabel)}</time>` +
      '</span></li></ul>'
  );

  const title = widget(
    t.title,
    'elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading',
    'theme-post-title.default',
    `<h3 class="elementor-heading-title elementor-size-default">${esc(d.title)}</h3>`
  );

  const excerpt = widget(
    t.excerpt,
    'elementor-widget elementor-widget-theme-post-excerpt',
    'theme-post-excerpt.default',
    esc(d.excerpt)
  );

  // 20001 carries an extra width class on the icon box; 20003 does not.
  const iconBox = widget(
    t.iconBox,
    'elementor-position-inline-end elementor-mobile-position-inline-end ' +
      (template === 'category' ? 'elementor-widget__width-initial ' : '') +
      'elementor-view-default elementor-widget elementor-widget-icon-box',
    'icon-box.default',
    '<div class="elementor-icon-box-wrapper">' +
      `<div class="elementor-icon-box-icon"><span class="elementor-icon">${ARROW_SVG}</span></div>` +
      '<div class="elementor-icon-box-content">' +
      '<h3 class="elementor-icon-box-title"><span>Read More</span></h3>' +
      '</div></div>'
  );

  // The author box exists only on the category template.
  const author = d.author;
  const authorBox = t.authorBox
    ? widget(
        t.authorBox,
        'elementor-author-box--image-valign-middle elementor-author-box--avatar-yes ' +
          'elementor-author-box--name-yes elementor-author-box--link-no ' +
          'elementor-widget elementor-widget-author-box',
        'author-box.default',
        '<div class="elementor-author-box">' +
          (author?.avatar
            ? `<div class="elementor-author-box__avatar"><img src="${esc(author.avatar)}" ` +
              `alt="Picture of ${esc(author.name)}" loading="lazy"></div>`
            : '') +
          '<div class="elementor-author-box__text"><div>' +
          `<h4 class="elementor-author-box__name">${esc(author?.name ?? 'Spenza')}</h4>` +
          '</div></div></div>'
      )
    : '';

  const imageWidget = widget(
    t.image,
    'elementor-widget elementor-widget-theme-post-featured-image elementor-widget-image',
    'theme-post-featured-image.default',
    image
  );

  return (
    `<div data-elementor-type="loop-item" data-elementor-id="${t.templateId}" ` +
    `class="elementor elementor-${t.templateId} e-loop-item post type-post status-publish format-standard ` +
    `${img ? 'has-post-thumbnail ' : ''}hentry category-${esc(d.category)} ` +
    `ast-grid-common-col ast-full-width ast-article-post" data-elementor-post-type="elementor_library">` +
      `<div class="elementor-element elementor-element-${t.parent} e-con-full e-flex e-con e-parent" ` +
      `data-id="${t.parent}" data-element_type="container" data-e-type="container">` +
        `<a class="elementor-element elementor-element-${t.link} e-flex e-con-boxed e-con e-child" ` +
        `data-id="${t.link}" data-element_type="container" data-e-type="container" href="${href}">` +
          '<div class="e-con-inner">' +
            container(t.imageCon, imageWidget) +
            container(t.textCon, categoryHeading + postInfo + title + excerpt + iconBox + authorBox) +
          '</div>' +
        '</a>' +
      '</div>' +
    '</div>'
  );
}
