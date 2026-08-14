/**
 * Render the three per-post blocks the Elementor single-post template shows.
 *
 * Those blocks come from ACF fields on the post, not the post body:
 *
 *   tldr_heading / tldr_description   the summary line
 *   2_col                             repeater -> [two_col_cards]
 *   1_col                             repeater -> [one_col_cards]
 *
 * WordPress renders them through shortcodes today. Rendering from the
 * structured data instead means we emit the markup rather than trusting an HTML
 * blob — and the class names below are copied from the mirrored output, so the
 * existing purged CSS styles them with no new stylesheet.
 */

export interface AcfCard {
  /** Font Awesome descriptor, stored by ACF as a JSON string. */
  icon?: string;
  title?: string;
  text?: string;
}

export interface AcfBlocks {
  tldrHeading?: string;
  tldrDescription?: string;
  twoCol?: AcfCard[];
  oneCol?: AcfCard[];
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Turn ACF's icon descriptor into Font Awesome classes.
 *
 * Stored as a JSON *string* like
 *   {"family":"classic","style":"brands","id":"ubuntu","unicode":"f7df"}
 * which the mirrored markup renders as `fa-classic fa-brands fa-ubuntu`.
 * Malformed or missing values yield no icon rather than a broken glyph.
 */
export function iconClass(icon?: string): string {
  if (!icon) return '';
  try {
    const { family, style, id } = JSON.parse(icon) as Record<string, string>;
    if (!id) return '';
    return ['fa-' + (family || 'classic').trim(), 'fa-' + (style || 'solid').trim(), 'fa-' + id.trim()]
      .join(' ');
  } catch {
    return '';
  }
}

function cards(items: AcfCard[] | undefined, kind: 'two' | 'one'): string {
  // WordPress keeps the shortcode widget and renders an empty wrapper when the
  // repeater has no rows, so match that rather than emptying the widget.
  if (!items?.length) return '<div class="elementor-shortcode"></div>';
  const base = `${kind}-col-card`;
  const body = items.map(c => {
    const cls = iconClass(c.icon);
    return (
      `<div class="${base}">` +
      (cls ? `<div class="${base}-icon"><i class="${esc(cls)}" aria-hidden="true"></i></div>` : '') +
      (c.title ? `<h3 class="${base}-title">${esc(c.title)}</h3>` : '') +
      (c.text ? `<div class="${base}-text">${esc(c.text)}</div>` : '') +
      `</div>`
    );
  }).join('');
  return `<div class="elementor-shortcode"><div class="${base}s">${body}</div></div>`;
}

/**
 * The TL;DR caption.
 *
 * Comes from ACF, so it is neither fixed nor always present: 223 posts use
 * "TL;DR / At-a-Glance Summary", a handful title their own, and 23 have none —
 * on those WordPress drops the widget, which `ArticleLayout` reproduces by
 * removing it when this returns empty.
 */
export function renderTldrHeading(b: AcfBlocks): string {
  if (!b.tldrHeading) return '';
  return `<h2 class="elementor-heading-title elementor-size-default">${esc(b.tldrHeading)}</h2>`;
}

/** The summary paragraph, matching the heading widget's markup. */
export function renderSummary(b: AcfBlocks): string {
  if (!b.tldrDescription) return '';
  return `<p class="elementor-heading-title elementor-size-default">${esc(b.tldrDescription)}</p>`;
}

export const renderKeyPoints = (b: AcfBlocks): string => cards(b.twoCol, 'two');
export const renderSpenzaBlock = (b: AcfBlocks): string => cards(b.oneCol, 'one');
