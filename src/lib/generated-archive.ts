/**
 * Archive pages for things WordPress never captured: a category, tag or author
 * created in the admin. The mirrored category archive supplies the chrome
 * (header, newsletter form, footer, card styles); only its heading, intro and
 * the form's return address are rewritten, so a new archive looks like the
 * existing ones and is filled from the `posts` collection like them.
 */
import { replaceWidgetInner } from '../../scripts/lib/widget-html.mjs';

/** Elementor ids of the category archive's pill, H1 and intro widgets. */
const PILL = '1b9f4ad';
const HEADING = '9acdba0';
const INTRO = '5b99b4b';
const P = 'elementor-heading-title elementor-size-default';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

interface Opts {
  /** Path of the new page, e.g. `/tag/mvno/`. */
  path: string;
  pill: string;
  pillHref: string;
  /** Plain text; the last word gets the orange highlight, as on the category pages. */
  heading: string;
  intro: string;
}

export function generatedArchiveShell(shell: string, o: Opts): string {
  const words = o.heading.trim().split(/\s+/);
  const last = words.pop() ?? '';
  const h1 = `${esc(words.join(' '))}${words.length ? ' ' : ''}<span class="hero-highlight">${esc(last)}</span>`;
  let out = shell;
  out = replaceWidgetInner(out, PILL, `<p class="${P}"><a href="${esc(o.pillHref)}" rel="tag">${esc(o.pill)}</a></p>`);
  out = replaceWidgetInner(out, HEADING, `<h1 class="${P}">${h1}</h1>`);
  out = replaceWidgetInner(out, INTRO, `<p class="${P}">${esc(o.intro)}</p>`);
  // The newsletter form posts back to the page it is on.
  out = out.split('/category/telecom/#gf_19').join(`${o.path}#gf_19`);
  // The category nav highlights Telecom on the telecom page only.
  out = out.replace(/\saria-current="page"/g, '').replace(/\selementor-item-active\b/g, '');
  return out;
}

export const paginate = <T>(list: T[], perPage = 10) => {
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  return Array.from({ length: pages }, (_, i) => ({ page: i + 1, totalPages: pages, items: list.slice(i * perPage, (i + 1) * perPage) }));
};
