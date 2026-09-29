/**
 * The site's type is four tokens (src/styles/fonts.css): --font-sans (Geist),
 * --font-display (Bricolage Grotesque), --font-mono (Geist Mono) and
 * --font-serif (Instrument Serif). Every family the WordPress mirror carried
 * was rewritten to one of them at its source; this module is that rewrite, so
 * markup that still arrives from WordPress — post bodies, with their inline
 * styles and <style> blocks — gets the same treatment on its way through
 * html-perf.
 *
 * A declaration is rewritten by its *first* family, the one the author meant;
 * the fallbacks after it go with it. Icon fonts, `inherit`, `var(…)` and any
 * family not listed are left alone, so a value that is already a token does
 * not classify and a second pass changes nothing.
 */

const ROLES = {
  sans: ['roboto', 'inter', 'manrope', 'lexend deca', 'general sans', 'proxima-nova',
    'dm sans', 'plus jakarta sans', 'noto sans sinhala', 'arial', 'helvetica',
    'helvetica neue', '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'system-ui',
    'sans-serif', 'open sans', 'montserrat', 'archivo', 'instrument sans', 'geist'],
  display: ['roboto slab', 'fraunces', 'playfair display', 'outfit', 'bricolage grotesque'],
  mono: ['space mono', 'courier new', 'courier 10 pitch', 'courier', 'monospace', 'jetbrains mono',
    'ui-monospace', 'sfmono-regular', 'menlo', 'consolas', 'monaco', 'geist mono'],
  serif: ['instrument serif'],
};

const TOKEN = {};
for (const [role, names] of Object.entries(ROLES)) for (const n of names) TOKEN[n] = `--font-${role}`;

/** The token a family stack belongs to, or null. */
export function fontToken(stack) {
  const first = stack.split(',')[0].replace(/&quot;|&#0?39;|["']/g, '').trim().toLowerCase();
  return TOKEN[first] ?? null;
}

// Stands in for `&quot;` while scanning, so its `;` is not read as the end of
// a declaration.
const Q = '\u0001';

// Properties that hold a font stack without "font" in the name.
const STACK_VARS = new Set(['--sci-display', '--sci-body', '--spz-mono', '--ni-mono', '--sans', '--display', '--serif', '--mono']);
const NOT_A_STACK = /size|weight|style|height|spacing|transform|decoration|stretch|variant|feature|smoothing/;

// In markup a `"` closes the attribute; in a stylesheet it quotes a family.
const DECL_MARKUP = /(^|[\s{;"'`(])(font-family|--[\w-]+)(\s*:\s*)([^;{}"<>`]*?)(\s*(?:!\s*important)?\s*)(?=[;}"<`]|$)/gm;
const DECL_CSS = /(^|[\s{;(])(font-family|--[\w-]+)(\s*:\s*)([^;{}<>]*?)(\s*(?:!\s*important)?\s*)(?=[;}]|$)/gm;

function rewrite(text, css) {
  const faces = [...text.matchAll(/@font-face\s*\{[^}]*\}/g)].map(m => [m.index, m.index + m[0].length]);
  const inFace = i => faces.some(([a, b]) => i >= a && i < b);
  return text.replace(css ? DECL_CSS : DECL_MARKUP, (all, lead, name, colon, value, tail, offset) => {
    if (inFace(offset)) return all;
    const custom = name.startsWith('--');
    if (custom && ((!/font/.test(name) && !STACK_VARS.has(name)) || NOT_A_STACK.test(name.replace(/font-family$/, '')))) return all;
    const token = fontToken(value.replaceAll(Q, '"'));
    if (!token) return all;
    // A property named like the token keeps its literal stack: pointing it at
    // itself would be a cycle, which makes it invalid.
    if (custom && name === token) return all;
    // An unbalanced trailing quote belongs to an enclosing JS string.
    const orphan = ["'", '"', Q].filter(q => value.split(q).length % 2 === 0 && value.trimEnd().endsWith(q)).join('');
    return `${lead}${name}${colon}var(${token})${orphan}${tail}`;
  });
}

/** Rewrite the font families in a stylesheet. */
export function rewriteFontsInCss(css) {
  return rewrite(css, true);
}

/** Rewrite the font families in markup: its <style> blocks and style="" attributes. */
export function rewriteFontsInMarkup(html) {
  return html.replaceAll('&quot;', Q)
    .split(/(<style\b[^>]*>[\s\S]*?<\/style>)/i)
    .map(part => rewrite(part, /^<style\b/i.test(part)))
    .join('')
    .replaceAll(Q, '&quot;');
}

/**
 * Whether every family a Google Fonts URL requests has been replaced by a
 * token — in which case nothing on the page asks for its faces any more, and
 * the stylesheet is dead weight.
 */
export function googleFontsUrlIsReplaced(url) {
  const families = [...url.replace(/&#0?38;|&amp;/g, '&').matchAll(/family=([^&:"')\s]+)/g)]
    .map(m => decodeURIComponent(m[1].replace(/\+/g, ' ')));
  return families.length > 0 && families.every(f => fontToken(f) !== null);
}
