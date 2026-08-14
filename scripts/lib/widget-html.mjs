// Locate and replace Elementor widgets inside a mirrored post partial.
//
// Elementor's single-post template gives every widget a stable element id — the
// id belongs to the template, not the post, so all 256 mirrored posts carry the
// same 45 ids in the same order. That is what makes one shell reusable for
// every post: only the handful of widgets holding post data need replacing.

/** Byte range of the widget with `id`, matched by div depth. */
export function widgetRange(html, id) {
  const start = html.indexOf(`<div class="elementor-element elementor-element-${id}`);
  if (start < 0) return null;

  const re = /<div\b|<\/div>/gi;
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    if (m[0].toLowerCase() === '</div>') {
      if (--depth === 0) return { start, end: m.index + 6 };
    } else depth++;
  }
  return null;
}

/** The widget's full markup, or null when the id is absent. */
export function widgetHtml(html, id) {
  const r = widgetRange(html, id);
  return r ? html.slice(r.start, r.end) : null;
}

/**
 * Drop the widget entirely, wrapper included.
 *
 * Needed where WordPress omits a widget rather than rendering it empty: the
 * Elementor template hides the TL;DR heading and summary when their fields are
 * blank, and those widgets carry their own margins, so keeping an empty wrapper
 * would leave a gap the real page does not have.
 */
export function removeWidget(html, id) {
  const r = widgetRange(html, id);
  return r ? html.slice(0, r.start) + html.slice(r.end) : html;
}

/**
 * Replace the contents of the widget's `.elementor-widget-container` with
 * `inner`, keeping the widget's own wrapper — the wrapper carries the classes
 * and data attributes the mirrored CSS and Elementor's runtime key off.
 */
export function replaceWidgetInner(html, id, inner) {
  const r = widgetRange(html, id);
  if (!r) return html;

  const widget = html.slice(r.start, r.end);
  const openIdx = widget.indexOf('<div class="elementor-widget-container">');
  if (openIdx < 0) return html;

  const contentStart = openIdx + '<div class="elementor-widget-container">'.length;

  // Find this container's matching close, so nested divs are handled.
  const re = /<div\b|<\/div>/gi;
  re.lastIndex = contentStart;
  let depth = 1, m, contentEnd = -1;
  while ((m = re.exec(widget))) {
    if (m[0].toLowerCase() === '</div>') {
      if (--depth === 0) { contentEnd = m.index; break; }
    } else depth++;
  }
  if (contentEnd < 0) return html;

  const rebuilt = widget.slice(0, contentStart) + inner + widget.slice(contentEnd);
  return html.slice(0, r.start) + rebuilt + html.slice(r.end);
}
