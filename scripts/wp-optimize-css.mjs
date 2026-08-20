// Collapse each page's stylesheet set into one purged, minified bundle.
//
// Every mirrored page links the exact stylesheet set WordPress served: ~61
// files averaging 2.6MB, render-blocking, before a single image. Most of it is
// never used on the page that loads it — the three flaticon icon sets alone are
// 607KB of `.fi-*::before` rules on all 487 pages, for a site that uses a few
// dozen icons.
//
// Output is two tiers, because the two inputs have very different shapes:
//
//   shared  The linked stylesheet list. Only 43 distinct lists exist across 487
//           pages — 238 posts share one — so these bundle into 43 files that
//           stay cached as a reader moves between pages.
//   page    The per-page inline <style> bundle (Astra's dynamic CSS and the
//           Elementor per-post block, averaging 146KB). This is what makes every
//           page unique; bundling it with the shared tier would have produced
//           478 near-identical 500KB files and ~240MB on disk.
//
// The cascade survives the split because the inline bundle is already emitted
// last by WpLayout, so shared-then-page reproduces the original order exactly.
// Within each tier, files are concatenated in the page's own order.
//
// Fail-safe: a page whose markup cannot be located keeps its original
// stylesheet list. Under-optimising is recoverable; a page missing CSS is not.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { PurgeCSS } from 'purgecss';
import postcss from 'postcss';
import { transform } from 'lightningcss';
import { PROJECT, canonicalMediaPath } from './lib/config.mjs';

const PUB = path.join(PROJECT, 'public');
const DATA = path.join(PROJECT, 'src', 'data');
const PARTIALS = path.join(PROJECT, 'src', 'partials');
const OUT_DIR = path.join(PUB, 'wp-assets', '_opt');

const readJson = async f => JSON.parse(await fs.readFile(path.join(DATA, f), 'utf8'));
const readIf = async p => (existsSync(p) ? fs.readFile(p, 'utf8') : null);

/** LIMIT=n processes only the first n groups — for calibrating a change. */
const limit = Number(process.env.LIMIT) || Infinity;

/**
 * Remove declarations a browser already discards, so PostCSS can parse the file.
 *
 * Both patterns exist in the live CSS and neither currently has any effect —
 * dropping them here reproduces browser error recovery rather than changing how
 * the page renders.
 *
 *  1. `text-align:{{VALUE}}` — Elementor failed to substitute its own template
 *     placeholder when generating the per-post CSS.
 *  2. `;- box-shadow: none` — a stray hyphen in the site's custom CSS makes the
 *     following declaration an unknown property, which browsers drop. Matched
 *     narrowly on hyphen-then-whitespace so vendor prefixes and custom
 *     properties (`-webkit-`, `--foo`) are untouched.
 */
function sanitizeCss(css) {
  return css
    .replace(/[a-zA-Z-]+\s*:\s*[^;{}]*\{\{[^{}]*\}\}[^;{}]*;?/g, '')
    .replace(/;\s*-\s+[a-zA-Z-]+\s*:[^;{}]*;/g, ';');
}

let invalidRuleDrops = 0;

/**
 * Drop rules whose selector list puts a pseudo-element somewhere other than the
 * end — `#foo::placeholder .bar label`, from the site's Gravity Forms styling.
 * lightningcss rejects these outright, which would cost the page its bundle.
 *
 * A selector list containing an invalid selector invalidates the whole rule, so
 * browsers already ignore these and removing the rule matches that. Removing
 * only the offending selector would not: it would let the rule's *other*
 * selectors start applying, which is a behaviour change rather than a fix.
 *
 * Uses PostCSS rather than scanning braces directly — CSS comments routinely
 * contain braces, and a hand-rolled scanner mis-slices real stylesheets.
 */
function dropInvalidPseudoRules(css) {
  const bad = /::[a-zA-Z-]+[^,]*[\s.#\[>+~][^,]*/;
  let dropped = 0;
  const root = postcss.parse(css);
  root.walkRules(rule => {
    if (rule.selectors?.some(s => bad.test(s))) { rule.remove(); dropped++; }
  });
  invalidRuleDrops += dropped;
  return root.toString();
}

/**
 * Drop repeat `@font-face` blocks that are byte-identical to one already kept.
 *
 * Concatenating a page's stylesheets stacks the same Google Fonts declarations
 * over and over — Inter alone is declared 980 times across the mirrored CSS,
 * once per unicode-range per file that requests it. Identical faces are
 * position-independent and the later ones are pure duplication, so keeping the
 * first is lossless.
 *
 * Note this dedupes rather than purges: 378 elements set `font-family` from an
 * inline style attribute, which no CSS-side usage analysis can see, so removing
 * a face because no *rule* references it would drop fonts that are really used.
 */
let fontDisplayFixes = 0;

/**
 * Families where `font-display:block` is the right answer.
 *
 * For an icon font, `block` is correct: the fallback for a missing glyph is a
 * wrong character or a tofu box, so showing nothing briefly is better. For text
 * it is a straight LCP regression — up to three seconds of invisible copy when
 * the fallback would have been perfectly readable.
 *
 * As it stands this changes nothing, and that is the useful result: all 669
 * `block` declarations belong to Font Awesome or Gravity Forms icons, so the
 * site has no invisible-text problem to fix. It stays as a guard, because the
 * next theme update that ships a text face with `block` should not quietly cost
 * three seconds of blank headings.
 */
const ICON_FAMILIES = /font-family:\s*["']?(?:.*?(?:font\s*awesome|eicons|uicons|flaticon|slick|gform-icons|elementskit|wpforms|icomoon|dashicons|themify).*?)["']?\s*[;}]/i;

/** Give text faces `swap`, leave icon faces alone. */
function fixFontDisplay(css) {
  return css.replace(/@font-face\s*\{[^{}]*\}/g, block => {
    if (!/font-display:\s*block/i.test(block)) return block;
    if (ICON_FAMILIES.test(block)) return block;
    fontDisplayFixes++;
    return block.replace(/font-display:\s*block/gi, 'font-display:swap');
  });
}

function dedupeFontFaces(css) {
  const seen = new Set();
  let dropped = 0;
  const out = css.replace(/@font-face\s*\{[^{}]*\}/g, m => {
    const key = m.replace(/\s+/g, '');
    if (seen.has(key)) { dropped++; return ''; }
    seen.add(key);
    return m;
  });
  return { css: out, kept: seen.size, dropped };
}

let urlRebases = 0, urlCanonical = 0, urlUndoubled = 0;

/**
 * Collapse `/p//p/rest` back to `/p/rest`.
 *
 * The asset mirror rewrote a handful of already-rewritten urls a second time,
 * leaving the resolved prefix stuck to the front of the finished path — all 24
 * of them in astra-child's `blocks.css`, which is where General Sans, the
 * site's own display face, is declared. The doubled form 404s.
 *
 * Deliberately narrow: it fires only when the tail is itself an absolute path
 * that begins with the head, which is the signature of the doubling. A plain
 * `/wp-assets//foo.css` typo wants the slashes collapsed, not the head thrown
 * away, so it is left alone rather than guessed at.
 */
function undouble(p) {
  const i = p.indexOf('//', 1);
  if (i === -1) return p;
  const head = p.slice(0, i);
  const tail = p.slice(i + 1);
  if (!tail.startsWith(`${head}/`)) return p;
  urlUndoubled++;
  return tail;
}

/**
 * Values already resolvable as written: a scheme (`data:`, `https:`), a
 * protocol-relative `//host`, a root-absolute path, or a same-document
 * fragment — `url(#orbit1)` referencing an inline SVG filter.
 */
const ALREADY_RESOLVED = /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/\/|\/|#)/;

/**
 * One `url()` token: double-quoted, single-quoted, or bare. The bare form
 * cannot legally contain a quote, a paren or whitespace, so stopping at any of
 * them is what CSS itself does.
 */
const URL_TOKEN = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^'")\s]*))\s*\)/g;

/**
 * Make every `url()` resolvable from the bundle's own location.
 *
 * Bundles are written to `/wp-assets/_opt/`, so a relative reference that was
 * correct in its source file resolves against the wrong directory once
 * concatenated. Font Awesome's `url(../webfonts/fa-solid-900.woff2)` became
 * `/wp-assets/webfonts/…`, which does not exist — so the icon fonts 404'd on
 * every page built from one of those 14 stylesheet lists, and nothing caught it
 * because `wp:audit` reads markup and never parses CSS. Rebasing against the
 * source file's own directory restores the path the browser was meant to fetch.
 *
 * Media paths are canonicalised here but deliberately not pointed at the media
 * host. Bundles are committed and content-addressed, so baking an origin into
 * them would make a generated artefact environment-specific — a build with no
 * media host configured would then serve URLs for a host it knows nothing
 * about. The origin is applied to the built CSS instead, at `astro:build:done`,
 * alongside the identical pass over the site's scripts.
 *
 * Anything this cannot improve is returned as the exact text that was matched,
 * so a token whose boundaries were mis-parsed — an oddly-quoted data URI, say —
 * is passed through byte-for-byte rather than corrupted.
 */
function rewriteUrls(css, href) {
  const dir = path.posix.dirname(href);
  return css.replace(URL_TOKEN, (whole, dq, sq, bare) => {
    const raw = dq ?? sq ?? bare ?? '';
    if (!raw) return whole;

    let value = raw;
    if (!ALREADY_RESOLVED.test(value)) {
      // Split the query/fragment off first: `../fonts/eicons.eot#iefix` has to
      // keep its fragment, and a `..` inside a query string is not a path step.
      const [, p, tail = ''] = /^([^?#]*)([?#][\s\S]*)?$/.exec(value);
      value = path.posix.resolve(dir, p) + tail;
      urlRebases++;
    } else if (value.startsWith('/')) {
      value = undouble(value);
    }

    const canonical = canonicalMediaPath(value);
    if (canonical !== value) { urlCanonical++; value = canonical; }

    if (value === raw) return whole;
    const q = dq !== undefined ? '"' : sq !== undefined ? "'" : '';
    return `url(${q}${value}${q})`;
  });
}

let googleImportsInlined = 0;

/**
 * Replace `@import` of a Google Fonts stylesheet with the mirrored CSS itself.
 *
 * Two of these live in the site's inline CSS and so end up here. Rewriting the
 * URL to the local copy would already remove the third-party hop, but an
 * `@import` is still a serial, render-blocking request discovered only after
 * the bundle parses. Pasting the rules in costs nothing — they are `@font-face`
 * blocks, position-independent, and `dedupeFontFaces` collapses the repeats
 * that concatenation would otherwise stack up.
 *
 * The mirrored CSS references its woff2 by absolute path, so the url rebasing
 * above leaves it alone.
 */
function inlineGoogleFonts(css) {
  return css.replace(
    /@import\s+(?:url\(\s*)?["']?(https:\/\/fonts\.googleapis\.com\/css2\?[^"')\s]+)["']?\s*\)?[^;]*;/g,
    (whole, raw) => {
      const key = raw.replace(/&#0?38;/g, '&').replace(/&amp;/g, '&');
      const local = GOOGLE_FONT_CSS.get(key);
      if (!local) return whole;
      googleImportsInlined++;
      return local;
    }
  );
}

/**
 * Pull `@import` rules out so they can be re-emitted at the top of the bundle.
 *
 * Concatenation would otherwise leave them mid-file, where CSS requires imports
 * to precede all other rules — every one of the seven would be silently ignored
 * and the fonts they pull would stop loading.
 */
function hoistImports(css, into) {
  return css.replace(
    /@import\s+(?:url\([^)]*\)|(['"])(?:\\.|(?!\1).)*\1)[^;]*;/g,
    m => { into.add(m.trim()); return ''; }
  );
}

/**
 * Classes that only ever appear at runtime, so no markup scan can find them.
 * Sourced from the classList calls in wp-shim.js and public/scripts/page/*.js,
 * plus Swiper's own state classes — swiper.min.js ships on every page.
 */
const SAFELIST = {
  standard: [
    'active', 'e-active', 'is-active', 'is-open', 'is-pinned', 'is-pinned-bottom',
    'collapsed', 'expanded', 'hidden', 'submenu-is-open', 'sci-panel-on',
    'sci-tab-on', 'simcalc-best', 'animated', 'elementor-invisible',
    'wp-btn-restored', 'wp-marquee', 'wp-sticky-header', 'wp-header-scrolled',
    // Spectra's FAQ accordion: the shim sets this to open a panel, and it is
    // what the block's CSS keys the plus/minus icon swap off.
    'uagb-faq-item-active',
    // Animation names referenced from Elementor data-settings, applied with
    // `classList.add('animated', name)`.
    'fadeIn', 'slideInUp', 'zoomIn',
  ],
  greedy: [
    /^swiper-/,        // Swiper mutates slide/pagination state classes.
    /^elementor-tab/,  // Tab widgets toggle active state per pane.
    /^e-con/,          // Container state classes set by the shim.
  ],
  deep: [/^html/, /^body/],
};

// ---- inputs -------------------------------------------------------------
/**
 * The mirrored Google Fonts stylesheets, keyed by the Google URL they replace.
 * Written by `npm run wp:fonts`; empty until that has been run.
 */
const GOOGLE_FONT_CSS = new Map();
{
  const map = JSON.parse(await fs.readFile(path.join(DATA, 'wp-google-fonts.json'), 'utf8'));
  for (const [url, local] of Object.entries(map)) {
    const body = await readIf(path.join(PUB, local));
    if (body) GOOGLE_FONT_CSS.set(url, body);
  }
}

const styles = await readJson('wp-styles.json');
const inlineStyles = await readJson('wp-inline-styles.json');
const pages = await readJson('wp-pages.json');
const scripts = await readJson('wp-scripts.json');

const header = (await readIf(path.join(PARTIALS, 'chrome', 'header.html'))) ?? '';
const footer = (await readIf(path.join(PARTIALS, 'chrome', 'footer.html'))) ?? '';
const demoPopup = (await readIf(path.join(PARTIALS, 'chrome', 'demo-popup.html'))) ?? '';
const shim = (await readIf(path.join(PUB, 'scripts', 'wp-shim.js'))) ?? '';

/** Where a page key's markup lives. Keys are set by the mirroring scripts. */
async function markupFor(key) {
  if (key === '__post__') {
    // Synthetic key for the blog route's shared style set — it has no markup of
    // its own, so every post's markup counts as in scope.
    const dir = path.join(PARTIALS, 'posts');
    if (!existsSync(dir)) return null;
    const files = await fs.readdir(dir);
    const all = await Promise.all(
      files.filter(f => f.endsWith('.html')).map(f => fs.readFile(path.join(dir, f), 'utf8'))
    );
    return all.join('\n');
  }
  const candidates = key.startsWith('post-')
    ? [path.join(PARTIALS, 'posts', key.slice(5) + '.html')]
    : key.startsWith('archive-')
      ? [path.join(PARTIALS, 'archives', key + '.html')]
      : [path.join(PARTIALS, key + '.html')];
  for (const c of candidates) {
    const s = await readIf(c);
    if (s !== null) return s;
  }
  return null;
}

// ---- collect per-page markup, and group by stylesheet list ---------------
const groups = new Map();
const entries = new Map();
const skipped = [];

for (const key of Object.keys(styles)) {
  const list = styles[key] || [];
  if (!list.length) { skipped.push(key); continue; }

  const markup = await markupFor(key);
  if (markup === null) { skipped.push(key); continue; }

  // Body classes live on <body>, not in the partial, and Astra/Elementor key
  // real styling off them. <html> too, so `html { }` rules are not purged.
  // WpLayout renders the lead-capture modal for any page with a
  // `.get-started` button, so its markup is part of what the page contains even
  // though no partial holds it. Purging without it strips the modal's styling
  // from every page but the one that used to carry the markup inline — which is
  // the bug this file would otherwise reintroduce.
  const popup = markup.includes('get-started') ? demoPopup : '';

  const content =
    `<html><body class="${pages[key]?.bodyClass ?? ''}">${markup}${header}${footer}${popup}</body></html>`;

  let js = shim;
  const sp = scripts[key]?.script;
  if (sp) { const s = await readIf(path.join(PUB, sp)); if (s) js += '\n' + s; }

  entries.set(key, { list, inline: inlineStyles[key] ?? null, content, js });

  const sig = JSON.stringify(list);
  if (!groups.has(sig)) groups.set(sig, { list, keys: [], content: [], js: [] });
  const g = groups.get(sig);
  g.keys.push(key);
  g.content.push(content);
  g.js.push(js);
}

process.stdout.write(
  `${Object.keys(styles).length} page keys -> ${groups.size} shared bundles ` +
  `+ ${[...entries.values()].filter(e => e.inline).length} per-page bundles ` +
  `(${skipped.length} skipped, keeping original list)\n\n`
);

// ---- purge + minify each group -----------------------------------------
await fs.mkdir(OUT_DIR, { recursive: true });

const bundles = {};
const failures = [];
let rawTotal = 0, outTotal = 0, faceDrops = 0;

/**
 * Purge `hrefs` against `content`/`js`, minify, and write it content-addressed.
 * Returns the public href, or null if the CSS could not be processed.
 */
async function buildBundle(hrefs, content, js, label) {
  const parts = [];
  const imports = new Set();
  for (const href of hrefs) {
    const css = await readIf(path.join(PUB, href));
    if (css === null) continue;
    // Rebase before hoisting, so a relative `@import url(…)` is absolute by the
    // time it is lifted out of the file that gave it its meaning.
    const resolved = inlineGoogleFonts(rewriteUrls(sanitizeCss(css), href));
    parts.push(`/* ${href} */\n${hoistImports(resolved, imports)}`);
  }
  if (!parts.length) return null;
  const raw = [...imports, ...parts].join('\n');

  let min;
  try {
    const [purged] = await new PurgeCSS().purge({
      content: [{ raw: content, extension: 'html' }, { raw: js, extension: 'js' }],
      css: [{ raw }],
      safelist: SAFELIST,
      keyframes: true,
      // Elementor sets custom properties from inline style attributes, so
      // pruning unused variables risks more than it saves.
      variables: false,
      fontFace: false,
    });

    const once = dedupeFontFaces(fixFontDisplay(dropInvalidPseudoRules(purged.css)));
    faceDrops += once.dropped;

    min = transform({
      filename: 'bundle.css',
      code: Buffer.from(once.css),
      minify: true,
      // Matches the browsers the mirrored Elementor CSS already targets.
      targets: { chrome: 100 << 16, firefox: 100 << 16, safari: (15 << 16) | (4 << 8) },
    }).code;
  } catch (e) {
    failures.push(`${label}: ${e.message}`);
    return null;
  }

  const hash = crypto.createHash('sha1').update(min).digest('hex').slice(0, 12);
  const file = `bundle-${hash}.css`;
  const dest = path.join(OUT_DIR, file);
  if (!existsSync(dest)) await fs.writeFile(dest, min);

  rawTotal += raw.length;
  outTotal += min.length;
  return { href: `/wp-assets/_opt/${file}`, raw: raw.length, out: min.length };
}

// ---- tier 1: the shared stylesheet lists ---------------------------------
const sharedFor = new Map();
let n = 0;
for (const [sig, g] of groups) {
  if (n >= limit) break;
  n++;
  const built = await buildBundle(
    g.list, g.content.join('\n'), g.js.join('\n'), `shared/${g.keys[0]}`
  );
  if (!built) continue;
  sharedFor.set(sig, built.href);
  process.stdout.write(
    `shared ${String(n).padStart(2)}/${groups.size} ${String(g.keys.length).padStart(3)} pages  ` +
    `${(built.raw / 1024).toFixed(0).padStart(5)}KB -> ${(built.out / 1024).toFixed(0).padStart(4)}KB  ` +
    `(-${(100 - (built.out / built.raw) * 100).toFixed(1)}%)  ${g.keys[0]}\n`
  );
}

// ---- tier 2: each page's own inline bundle -------------------------------
let m = 0, inlineRaw = 0, inlineOut = 0;
for (const [key, e] of entries) {
  const sig = JSON.stringify(e.list);
  const shared = sharedFor.get(sig);
  // Without its shared tier the page must keep the original list, or it would
  // ship only the inline half of its CSS.
  if (!shared) continue;

  let pageHref = null;
  if (e.inline) {
    const built = await buildBundle([e.inline], e.content, e.js, `page/${key}`);
    if (built) { pageHref = built.href; inlineRaw += built.raw; inlineOut += built.out; }
    else continue; // fall back to the original list rather than drop inline CSS
  }
  bundles[key] = pageHref ? [shared, pageHref] : [shared];
  if (++m % 50 === 0) process.stdout.write(`  page bundles ${m}/${entries.size}\r`);
}
process.stdout.write(`  page bundles ${m}/${entries.size}\n`);

await fs.writeFile(
  path.join(DATA, 'wp-css-bundles.json'),
  JSON.stringify(bundles, null, 2),
  'utf8'
);

const files = new Set(Object.values(bundles).flat());

/**
 * Drop bundles no page references any more.
 *
 * Output is content-addressed, so every run that changes the CSS writes new
 * files and leaves the previous generation behind. Left alone they accumulate
 * and ship — the run that fixed the relative-`url()` bug would otherwise have
 * deployed 21 superseded bundles still carrying it, which is exactly the sort
 * of stale artefact a content-addressed scheme is supposed to make impossible.
 */
const orphans = (await fs.readdir(OUT_DIR))
  .filter(f => !files.has(`/wp-assets/_opt/${f}`));
await Promise.all(orphans.map(f => fs.rm(path.join(OUT_DIR, f))));
if (orphans.length) process.stdout.write(`pruned ${orphans.length} superseded bundles\n`);

const onDisk = (await fs.readdir(OUT_DIR))
  .reduce(async (a, f) => (await a) + (await fs.stat(path.join(OUT_DIR, f))).size, Promise.resolve(0));

// What a reader actually downloads: the shared bundle once, then one small
// per-page bundle per navigation.
const sharedSizes = [...sharedFor.values()];
process.stdout.write(
  `\noptimised ${Object.keys(bundles).length} page keys into ${files.size} files ` +
  `(${sharedSizes.length} shared + ${m} per-page), ${((await onDisk) / 1048576).toFixed(1)}MB on disk\n` +
  `CSS processed ${(rawTotal / 1048576).toFixed(0)}MB -> ${(outTotal / 1048576).toFixed(1)}MB ` +
  `(-${(100 - (outTotal / rawTotal) * 100).toFixed(1)}%), ${faceDrops} duplicate @font-face dropped\n` +
  `invalid rules dropped: ${invalidRuleDrops}
` +
  `google-fonts @imports inlined: ${googleImportsInlined}
` +
  `font-display block -> swap on text faces: ${fontDisplayFixes}
` +
  `url() rebased to absolute: ${urlRebases}, undoubled: ${urlUndoubled}, ` +
  `canonicalised: ${urlCanonical}\n` +
  `per-page inline tier: ${(inlineRaw / m / 1024).toFixed(0)}KB -> ${(inlineOut / m / 1024).toFixed(0)}KB average\n`
);
if (skipped.length) {
  process.stdout.write(`\nkept original stylesheet list for ${skipped.length} keys: ${skipped.slice(0, 8).join(', ')}${skipped.length > 8 ? ' …' : ''}\n`);
}
if (failures.length) {
  process.stdout.write(`\nFAILED (${failures.length}), these keep their original list:\n  ${failures.slice(0, 10).join('\n  ')}\n`);
}
