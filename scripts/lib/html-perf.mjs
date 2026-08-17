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

/** All of the above, in the order the rest of the pipeline expects. */
export function applyHtmlPerf(html) {
  return selfHostFonts(lazyIframes(deferVideos(html)));
}
