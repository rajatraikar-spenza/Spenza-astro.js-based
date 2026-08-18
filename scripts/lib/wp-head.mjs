// Yoast's `<head>` block, repointed at this site.
//
// Two things need this and they arrive by different routes: post heads come
// from WPGraphQL's `seo.fullHead` at build time, and page heads are extracted
// from the mirrored HTML by `wp:seo`. Both are Yoast output naming
// preprod.spenza.com, and both have to name the public site instead — so the
// rewrite lives here rather than in either caller.
//
// Links stay absolute on purpose. `canonical`, `og:url` and every `@id` in the
// schema graph are only meaningful as absolute URLs; making them root-relative
// the way body links are would quietly break canonicalisation across the site.
import { WP_HOST, SITE_URL, MEDIA_ORIGIN, WEBP_PATH } from './config.mjs';
import { decodeEntities } from './html-entities.mjs';

const H = WP_HOST.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const MEDIA_RE = new RegExp(`https?://${H}/wp-content/uploads/`, 'g');
const WEBP_RE = new RegExp(`https?://${H}/wp-content/webp-express/`, 'g');
const LINK_RE = new RegExp(`https?://${H}/?`, 'g');

/**
 * The same three with JSON-escaped slashes (`https:\/\/host\/`).
 *
 * Yoast carries its schema graph as embedded JSON-LD, in which every `/` is
 * escaped. Rewriting only the plain form leaves the visible meta tags correct
 * while every `@id` in the graph still names WordPress — exactly the kind of
 * half-migration that passes a glance and fails a Rich Results test.
 */
const ESC = s => s.replace(/\//g, '\\/');
const MEDIA_RE_ESC = new RegExp(`https?:\\\\/\\\\/${H}\\\\/wp-content\\\\/uploads\\\\/`, 'g');
const WEBP_RE_ESC = new RegExp(`https?:\\\\/\\\\/${H}\\\\/wp-content\\\\/webp-express\\\\/`, 'g');
const LINK_RE_ESC = new RegExp(`https?:\\\\/\\\\/${H}(?:\\\\/)?`, 'g');

/** Repoint one Yoast head block at `SITE_URL`, and its media at the media host. */
export function rewriteHead(head) {
  if (!head) return head;
  const media = MEDIA_ORIGIN ? `${MEDIA_ORIGIN}/wp-content/uploads/` : `${SITE_URL}/wp-content/uploads/`;
  const webp = MEDIA_ORIGIN ? `${MEDIA_ORIGIN}${WEBP_PATH}` : `${SITE_URL}${WEBP_PATH}`;
  return head
    .replace(MEDIA_RE, media)
    .replace(WEBP_RE, webp)
    .replace(LINK_RE, `${SITE_URL}/`)
    .replace(MEDIA_RE_ESC, () => ESC(media))
    .replace(WEBP_RE_ESC, () => ESC(webp))
    .replace(LINK_RE_ESC, () => ESC(`${SITE_URL}/`));
}

/**
 * Yoast's own delimiters. It brackets everything it emits with these comments,
 * which is what makes the block liftable without parsing the whole document —
 * and what keeps the theme's own tags out of the extraction.
 */
const YOAST_BLOCK =
  /<!--\s*This site is optimized with the Yoast SEO plugin[\s\S]*?<!--\s*\/\s*Yoast SEO plugin\.\s*-->/i;

/**
 * Yoast's notes to whoever is logged in.
 *
 * The capture is made as an administrator, because preprod serves a "Coming
 * Soon" page to anyone else — so Yoast includes comments it would never send to
 * a visitor, such as "this page does not show a meta description because it
 * does not have one". Eleven pages carry one. They are only HTML comments, but
 * they are internal notes about an editorial gap and they have no business
 * being served to the public.
 */
const ADMIN_NOTICE = /\s*<!--\s*Admin only notice:[\s\S]*?-->/gi;

/** Lift Yoast's block out of a full mirrored document. Null when absent. */
export function extractHead(html) {
  const m = YOAST_BLOCK.exec(html || '');
  return m ? m[0].replace(ADMIN_NOTICE, '') : null;
}

/**
 * Strip the tags a layout emits itself, so the two cannot both appear.
 *
 * A duplicate `<title>` or a second canonical is worse than a missing one:
 * search engines pick one and it is not defined which. The layout keeps
 * responsibility for the document title; everything else comes from Yoast.
 */
export function withoutTitle(head) {
  return (head || '').replace(/<title>[\s\S]*?<\/title>\s*/i, '');
}

/**
 * Yoast's `<title>`, so the layout can emit it in its usual place.
 *
 * Decoded on the way out: the layout interpolates this into `<title>{...}</title>`
 * and Astro escapes expressions, so returning the raw `Analytics &amp; Expense`
 * produced `&amp;amp;` and a reader saw the entity.
 */
export function titleFrom(head) {
  const m = /<title>([\s\S]*?)<\/title>/i.exec(head || '');
  return m ? decodeEntities(m[1].trim()) : null;
}
