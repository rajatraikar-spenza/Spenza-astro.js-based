// Shared policy for pulling the site's own inline <script> blocks out of a
// mirrored WordPress document. Used by both wp-extract-scripts (pages) and
// wp-mirror-archives (category/author/date archives) so the two cannot drift.
import fs from 'node:fs/promises';
import path from 'node:path';
import { rewriteWpUrls } from './config.mjs';

/**
 * Third-party tags, analytics and WordPress/plugin internals. These either
 * depend on a runtime we do not ship (jQuery, gform, Elementor) or should not
 * be carried into a static rebuild at all.
 */
const DENY = [
  /\bgform\b/, /ak_js_/, /wpcode_admin_bar/, /customize-support/,
  /dataLayer|gtag\(/, /\bvector\b.*snippet/i, /initApollo/, /_linkedin_partner_id|lintrk/,
  /wp-emoji|_wpemojiSettings/, /trident\|msie/i, /elementorWebCliConfig|elementorDevToolsConfig/,
  /wpApiSettings|wp\.i18n|wp\.apiFetch|wp\.data|wp\.date|moment\.updateLocale/,
  /elementorCommonConfig|elementorAppConfig|elementorFrontendConfig|ElementorProFrontendConfig/,
  /elementorAdminBarConfig|astraAddon|var astra =|zip_ai_react|leadin_wordpress/,
  /gravatarEnhancedHovercards|gform_theme_config|wpNotesArgs|EAELImageMaskingConfig/,
  /var localize =/, /hbspt|hs-script/, /clarity|hotjar|fbq\(/,
  // Spectra emits one bootstrap per page for the blocks in that page's body,
  // calling into a frontend runtime that is not mirrored. It is a guaranteed
  // ReferenceError, and thrown from a `load` listener, where the per-snippet
  // try/catch below cannot reach it.
  /\bUAGB\w*\.init\b/,
];

/**
 * WordPress names enqueued *data* blocks `<handle>-js-extra|-before|-after`
 * (localisation tables, plugin config). Site behaviour added with
 * `wp_add_inline_script` keeps the bare `<handle>-js` id — `eael-inline-js`
 * carries the icon-box card effects and the subscribe button's label — so the
 * id alone cannot be used to reject a block.
 */
const isWpDataBlock = id => /-js-(extra|before|after|translations)$/.test(id);

/**
 * WebP Express variants named by a script, back to the original upload.
 *
 * The WPCode snippet that swaps the author avatar for a branded image names it
 * by its WebP Express path, and names it *root-relative* — so `rewriteWpUrls`,
 * which only rewrites absolute WordPress URLs, left it untouched. Nothing else
 * did either: that tree is mirrored by `wp:webp`, which fetches only the
 * variants referenced from markup, and this one is referenced from a script. So
 * the avatar 404'd on all 257 pages that carry the snippet — the gravatar in
 * the HTML painted, then this replaced it with a dead URL and the alt text
 * ("Picture of Spenza") was all that was left.
 *
 * Mapped to the original upload rather than to the mirrored spelling of the
 * variant, because the original is the path that works everywhere: it is in
 * `public/`, it is in the media manifest so the bucket has it, and it is one of
 * the two prefixes `toMediaOrigin` repoints when a media host is configured.
 * The variant is none of those three.
 *
 * The lookbehind keeps this off `/wp-assets/wp-content/webp-express/`, which is
 * where mirrored variants really live and where the file does exist.
 */
const webpVariantToOriginal = s =>
  s.replace(
    /(?<!\/wp-assets)\/wp-content\/webp-express\/webp-images(\/uploads\/[^"'\s)]+?)\.webp/g,
    '/wp-content$1'
  );

const rewriteUrls = s => webpVariantToOriginal(rewriteWpUrls(s));

/**
 * Deliberate changes to how the site's own scripts behave.
 *
 * Same reasoning as the mega-menu edits in `partial-rewrites-plugin.mjs`:
 * WordPress is where the snippet came from, this repo is what gets deployed,
 * and an edit made here survives the next mirror run where an edit to the
 * generated bundle would not.
 *
 * Each rule is anchored to a distinctive fragment of the snippet it edits, so a
 * snippet that has been rewritten upstream stops matching — and shows up as the
 * behaviour coming back — rather than being edited into something wrong.
 */

/**
 * The MVNO launch-cost calculator recalculated on every keystroke.
 *
 * It wires all eight inputs to a debounced `calculate()`, so the projections,
 * the table and the break-even month all moved while you were still typing a
 * figure — and the "Calculate Now" button had nothing left to do. The button
 * already calls `calculate()` directly and the page still runs it once on load,
 * so dropping the input listeners is the whole change: the form fills in, and
 * the results update when the reader says so.
 *
 * `[^{}]*` on both sides keeps the match inside the one callback, which has no
 * nested braces of its own.
 */
const CALCULATOR_LIVE_INPUTS =
  /liveInputs\.forEach\(\s*input\s*=>\s*\{[^{}]*input\.addEventListener\(\s*(["'])input\1\s*,\s*debouncedCalculate\s*\)\s*;[^{}]*\}\s*\)\s*;/;

const CALCULATOR_ON_DEMAND =
  '/* Live recalculation removed by scripts/lib/inline-scripts.mjs: the\n' +
  '   projections update when "Calculate Now" is clicked, not on every\n' +
  '   keystroke. The button below already calls calculate() directly. */';

const applySiteEdits = s => s.replace(CALCULATOR_LIVE_INPUTS, CALCULATOR_ON_DEMAND);

/** Split a mirrored document's body into custom scripts and JSON-LD blocks. */
export function extractInlineScripts(html) {
  const body = html.slice(html.indexOf('<body'));
  const scripts = [];
  const jsonLd = [];

  for (const m of body.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    const code = m[2].trim();
    if (!code) continue;                              // external script, no body
    if (/\bsrc\s*=/.test(attrs)) continue;

    const type = (attrs.match(/type=['"]([^'"]*)['"]/) || [])[1] || '';

    if (type === 'application/ld+json') {
      jsonLd.push(rewriteUrls(code));
      continue;
    }
    const id = (attrs.match(/id=['"]([^'"]*)['"]/) || [])[1] || '';
    if (isWpDataBlock(id)) continue;
    if (type && !/^(text\/javascript|application\/javascript|module)$/.test(type)) continue;
    if (DENY.some(re => re.test(code))) continue;

    scripts.push(applySiteEdits(rewriteUrls(code)));
  }

  return { scripts, jsonLd };
}

/**
 * Write the per-page bundle, returning the public path (or null when the page
 * carried no scripts). `regenCmd` names the script that rebuilds it.
 */
export async function writeScriptBundle(outDir, slug, scripts, regenCmd) {
  if (!scripts.length) return null;

  const banner =
    `/* Custom site scripts extracted from the WordPress page "${slug}".\n` +
    `   Regenerate with: ${regenCmd} */\n\n`;
  // Several snippets are "run everywhere" WPCode blocks that target elements
  // from older designs and throw when those are absent — on the live site
  // too. Isolate each one so a missing target cannot break the others.
  const bundle = banner + scripts
    .map((s, i) => `/* --- snippet ${i + 1} --- */\ntry {\n(function(){\n${s}\n})();\n} catch (e) {\n  console.debug('[wp-page-script] snippet ${i + 1} skipped:', e && e.message);\n}`)
    .join('\n\n');

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, `${slug}.js`), bundle, 'utf8');
  return `/scripts/page/${slug}.js`;
}
