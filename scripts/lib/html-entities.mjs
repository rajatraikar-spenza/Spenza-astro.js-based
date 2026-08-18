// Turn the entities WordPress writes back into characters.
//
// Everything WordPress hands us — excerpt, author bio, Yoast's <title> — is
// HTML, so `AT&T` arrives as `AT&#038;T` and `Analytics & Expense` as
// `Analytics &amp; Expense`. Anywhere that value is then escaped for output, or
// interpolated into an Astro expression (which escapes automatically), it gets
// a second pass and the reader sees the entity itself: "AT&#038;T".
//
// Decoding first means exactly one level of encoding survives, which is the
// level HTML wants. Shared because three call sites had the same bug.

/**
 * Ampersand is handled last, deliberately.
 *
 * Doing it first would turn `&amp;#038;` into `&#038;` and the numeric rules
 * would then decode a second level that was never in the source.
 */
export function decodeEntities(text) {
  return String(text ?? '')
    .replace(/&#0?38;/g, '&')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#822[01];/g, '"')
    .replace(/&#8230;/g, '…')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8594;/g, '→')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}
