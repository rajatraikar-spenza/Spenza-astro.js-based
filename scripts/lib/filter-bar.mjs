// The blog's filter bar: category chips and the article search, on one row.
//
// WordPress drew it with two Elementor widgets (a nav menu and a search box)
// inside a flex container, and neither knew about the other: at some widths the
// search box fell under the chips, at others the chips ran out of room. This
// replaces that container, wherever a mirrored partial has one, with a bar of
// our own whose rules are simple and the same at every width:
//
//   * the search box is always there, on the same row as everything else;
//   * the chips sit beside it while they fit, and when they do not they fold
//     into a dropdown button (public/scripts/filter-bar.js decides, by
//     measuring), exactly as they already did on a phone.
//
// What the bar does is unchanged: each chip is a plain link to its category
// archive, and the search is a GET form to /search/?s=, which the results page
// reads. The category list is read from the partial being rewritten, so the
// chips cannot drift from what that page offered.
//
// Applied in `partial-rewrites-plugin.mjs`; the partials on disk stay as generated.

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Byte range of the element opening at `start`, by div depth. */
function rangeFrom(html, start) {
  const re = /<div\b|<\/div>/gi;
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    if (m[0].toLowerCase() === '</div>') { if (--depth === 0) return { start, end: m.index + 6 }; }
    else depth++;
  }
  return null;
}

/** The smallest flex container holding both the category menu and the search form. */
function findBar(html) {
  let best = null;
  const open = /<div class="elementor-element elementor-element-\w+[^"]*\be-con\b[^"]*"/g;
  let m;
  while ((m = open.exec(html))) {
    const r = rangeFrom(html, m.index);
    if (!r) continue;
    const chunk = html.slice(r.start, r.end);
    if (!chunk.includes('elementor-widget-nav-menu') || !chunk.includes('e-search-form')) continue;
    if (!best || r.end - r.start < best.end - best.start) best = r;
  }
  return best;
}

/** `[{ href, label, active }]` from the bar's first category list. */
function chipsOf(chunk) {
  const ul = /<ul[^>]*class="elementor-nav-menu"[^>]*>([\s\S]*?)<\/ul>/.exec(chunk);
  if (!ul) return [];
  const chips = [];
  for (const li of ul[1].matchAll(/<li\b[^>]*>\s*<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const href = /href="([^"]*)"/.exec(li[1])?.[1];
    if (!href) continue;
    chips.push({
      href,
      label: li[2].replace(/<[^>]+>/g, '').trim(),
      active: /aria-current="page"|elementor-item-active/.test(li[1]),
    });
  }
  return chips;
}

const SEARCH_ICON =
  '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16.5 16.5 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const CARET =
  '<svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true" focusable="false"><path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function filterBarHtml(chips) {
  const current = chips.find(c => c.active) ?? chips[0];
  const links = chips.map(c =>
    `<li><a class="fb-chip${c.active ? ' is-active' : ''}" href="${esc(c.href)}"${c.active ? ' aria-current="page"' : ''}>${esc(c.label)}</a></li>`
  ).join('');
  return `<div class="fb" data-filter-bar>
<div class="fb-cats">
<button class="fb-toggle" type="button" aria-expanded="false" aria-controls="fb-list" aria-haspopup="true"><span class="fb-current">${esc(current?.label ?? 'All')}</span>${CARET}</button>
<ul class="fb-list" id="fb-list" aria-label="Categories">${links}</ul>
</div>
<form class="fb-search" action="/search/" method="get" role="search">
<label class="fb-label" for="fb-q">Search articles</label>
<input id="fb-q" class="fb-input" type="search" name="s" placeholder="Search articles" autocomplete="off" enterkeyhint="search">
<button class="fb-go" type="submit" aria-label="Search">${SEARCH_ICON}</button>
</form>
<script src="/scripts/filter-bar.js" defer></script>
</div>`;
}

/** Replace the mirrored filter container; returns `html` untouched if there is none. */
export function replaceFilterBar(html) {
  const r = findBar(html);
  if (!r) return html;
  const chips = chipsOf(html.slice(r.start, r.end));
  if (!chips.length) return html;
  return html.slice(0, r.start) + filterBarHtml(chips) + html.slice(r.end);
}

/** Mark the chip linking to `href` as the current one (and no other). */
export function setActiveChip(html, href) {
  let out = html.replace(/(<a class="fb-chip)( is-active)?("(?: href="[^"]*"))( aria-current="page")?/g, '$1$3');
  out = out.replace(new RegExp(`(<a class="fb-chip)(" href="${href.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}")`), '$1 is-active$2 aria-current="page"');
  const label = new RegExp(`<a class="fb-chip is-active" href="${href.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"[^>]*>([^<]*)</a>`).exec(out)?.[1];
  if (label) out = out.replace(/(<span class="fb-current">)[^<]*(<\/span>)/, `$1${label}$2`);
  return out;
}
