// Loading-behaviour rewrites applied to every piece of mirrored HTML.
//
// There are two sources of page markup and they arrive by completely different
// routes: `src/partials/**` is imported through the Vite plugin, while post
// bodies come from WPGraphQL at build time and are rendered by ArticleLayout.
// Anything that lives in only one of those covers roughly half the site, and it
// is not the obvious half — the 30MB product videos and every YouTube embed are
// in posts, so a fix applied only to partials misses precisely the heaviest
// pages. Hence one module, imported by both.
import googleFonts from '../../src/data/wp-google-fonts.json' with { type: 'json' };
import mediaManifest from '../../src/data/wp-media-manifest.json' with { type: 'json' };
import { WEBP_PATH } from './config.mjs';

/**
 * Defer third-party embeds until they are scrolled to.
 *
 * Seventeen real iframes ship across the site — YouTube players and Storylane
 * demos — and only three carried `loading="lazy"`. A YouTube embed pulls
 * roughly a megabyte of JavaScript before anyone presses play.
 *
 * Elementor's own `about:blank` placeholders are left alone: there are 727 of
 * them, they hold no src to fetch, and its runtime swaps in the real URL on
 * click. Marking those lazy would be noise at best.
 */
export function lazyIframes(html) {
  return html.replace(/<iframe\b[^>]*>/g, tag => {
    if (/\bloading=/.test(tag) || /src=["']about:blank["']/.test(tag)) return tag;
    return tag.replace(/^<iframe\b/, '<iframe loading="lazy"');
  });
}

/**
 * Stop videos downloading during page load.
 *
 * Two of these are 30MB, and the background video Elementor marks `autoplay` is
 * 2.1MB on five landing pages. `preload="none"` covers the ones a reader has to
 * press play on; `autoplay` cannot simply be dropped or the background videos
 * never start, so it becomes `data-wp-autoplay` and `wp-shim.js` begins playback
 * when the element scrolls into view.
 */
export function deferVideos(html) {
  return html.replace(/<video\b[^>]*>/g, tag => {
    let out = tag;
    if (!/\bpreload=/.test(out)) out = out.replace(/^<video\b/, '<video preload="none"');
    out = out.replace(/\sautoplay(=(["'])[^"']*\2)?/, ' data-wp-autoplay');
    return out;
  });
}

/**
 * Serve Google's fonts from this origin instead of Google's.
 *
 * Each of these is a render-blocking request to a third party, which then names
 * fonts on a *second* host — two DNS lookups and two TLS handshakes before a
 * glyph is drawn. `npm run wp:fonts` mirrors the stylesheets and the woff2 they
 * reference; this points the markup at the local copies.
 *
 * Markup HTML-escapes the query separator (`&#038;`) where the CSS form does
 * not, so both spellings normalise to the same key. A URL the mirror has not
 * seen is left untouched rather than guessed at — it still works, just remotely.
 */
export function selfHostFonts(html) {
  const out = html.replace(/https:\/\/fonts\.googleapis\.com\/css2\?[^"')\s]+/g, raw => {
    const key = raw.replace(/&#0?38;/g, '&').replace(/&amp;/g, '&');
    return googleFonts[key] ?? raw;
  });

  // Post bodies carry their own preconnects to Google's two font hosts. Once
  // every stylesheet in the document is served locally those warm a connection
  // the page never opens. Checked per document rather than globally: a post
  // referencing a font the mirror has not seen still loads it from Google, and
  // there the preconnect is doing its job.
  if (/fonts\.googleapis\.com\/css2/.test(out)) return out;
  return out.replace(
    /<link\b[^>]*\bhref=["']https:\/\/fonts\.(?:googleapis|gstatic)\.com\/?["'][^>]*>\s*/g,
    ''
  );
}

/**
 * Offer the WebP twin of every image in the body copy.
 *
 * The cards and the hero go through `loop-item.ts`, which has done this for a
 * while; the images *inside* a post never did, because they arrive as rendered
 * WordPress HTML rather than as data. On one article that is 915KB of PNG
 * Lighthouse would rather have as WebP — and the post pages are the ones with
 * the images, so this is where the weight actually is.
 *
 * The rules are the ones `webpFor()` follows. Only offer a `<source>` the
 * manifest can prove exists, because a `<source>` that 404s shows a broken
 * image rather than falling through to the `<img>`; and rewrite a `srcset`
 * only when every candidate has a twin, since a partial list mis-serves sizes.
 * Images already inside a `<picture>` are left alone.
 */
const MEDIA_FILES = new Set(mediaManifest);

/** `/wp-content/uploads/x.png` -> its WebP Express twin, if the mirror has it. */
function webpTwin(url) {
  const m = url.split('?')[0].match(/^\/wp-content\/uploads\/(.+\.(?:png|jpe?g|gif))$/i);
  if (!m) return null;
  const variant = `${WEBP_PATH}webp-images/uploads/${m[1]}.webp`;
  return MEDIA_FILES.has(variant) ? variant : null;
}

/** The same across a `srcset`, all-or-nothing. */
function webpSrcSet(srcset) {
  const out = [];
  for (const candidate of srcset.split(',')) {
    const [url, ...rest] = candidate.trim().split(/\s+/);
    if (!url) continue;
    const twin = webpTwin(url);
    if (!twin) return null;
    out.push([twin, ...rest].join(' '));
  }
  return out.length ? out.join(', ') : null;
}

export function offerWebp(html) {
  if (!html.includes('/wp-content/uploads/')) return html;

  // `<picture>` blocks are skipped whole, so an existing <source> is never
  // duplicated and the `<img>` inside one is never wrapped a second time.
  const parts = html.split(/(<picture[\s\S]*?<\/picture>)/g);

  return parts.map((part, i) => {
    if (i % 2) return part;
    return part.replace(/<img\b[^>]*>/g, tag => {
      const src = /\ssrc=["']([^"']+)["']/.exec(tag)?.[1];
      if (!src) return tag;
      const srcset = /\ssrcset=["']([^"']+)["']/.exec(tag)?.[1];
      const webp = srcset ? webpSrcSet(srcset) : (webpTwin(src) ?? null);
      if (!webp) return tag;
      const sizes = /\ssizes=["']([^"']+)["']/.exec(tag)?.[1];
      return `<picture><source srcset="${webp}"${sizes ? ` sizes="${sizes}"` : ''} ` +
        `type="image/webp">${tag}</picture>`;
    });
  }).join('');
}

/**
 * Give the chrome's controls an accessible name.
 *
 * Four links on every page of the site had none at all: the logo in the header
 * and the one in the footer (both wrapping an `<img alt="">`), the menu button
 * on mobile, and the mail icon in the footer row. A link with no name is
 * announced as its URL — "hash elementor dash action percent three A…" for the
 * menu button — and a crawler reads the same nothing, which is why it lands in
 * the SEO report as well as the accessibility one.
 *
 * Fixed here rather than in the partials because `chrome/header.html` and
 * `chrome/footer.html` are regenerated by the mirror, and because this pass is
 * the one boundary both the mirrored pages and the headless posts cross.
 *
 * Every rule below is anchored to something specific — the logo's own filename,
 * Elementor's off-canvas action, a social widget's brand class — so nothing in
 * a post body can match by accident.
 */
const LOGO_SRC = /(<img\b[^>]*\bsrc=["'][^"']*(?:spenza-logo-vector\.svg|Spenza-logo-Hor\.png[^"']*)["'][^>]*\balt=)["']["']/g;

/** Elementor's off-canvas trigger, which carries its action in the href. */
const OFF_CANVAS = /(<a\b[^>]*\bhref=["']#elementor-action[^"']*off_canvas(?:%3A|:)(open|close)[^"']*["'])/g;

/** Brand class -> name, for the footer's social row. */
const SOCIAL = [
  [/elementor-social-icon-linkedin\b/, 'LinkedIn'],
  [/elementor-social-icon-x-twitter\b/, 'X'],
  [/elementor-social-icon-twitter\b/, 'X'],
  [/elementor-social-icon-reddit\b/, 'Reddit'],
  [/elementor-social-icon-facebook\b/, 'Facebook'],
  [/elementor-social-icon-youtube\b/, 'YouTube'],
  [/elementor-social-icon-instagram\b/, 'Instagram'],
];

export function labelBareControls(html) {
  let out = html
    .replace(LOGO_SRC, '$1"Spenza"')
    .replace(OFF_CANVAS, (tag, open, action) =>
      /\baria-label=/.test(tag) ? tag : `${tag} aria-label="${action === 'close' ? 'Close' : 'Open'} menu"`);

  out = out.replace(/<a\b[^>]*\belementor-social-icon\b[^>]*>/g, tag => {
    if (/\baria-label=/.test(tag)) return tag;
    const brand = SOCIAL.find(([re]) => re.test(tag))?.[1]
      ?? (/href=["']mailto:/.test(tag) ? 'Email' : null);
    return brand ? tag.replace(/>$/, ` aria-label="${brand}">`) : tag;
  });

  return out;
}

/** All of the above, in the order the rest of the pipeline expects. */
export function applyHtmlPerf(html) {
  return offerWebp(labelBareControls(selfHostFonts(lazyIframes(deferVideos(html)))));
}
