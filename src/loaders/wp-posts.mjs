// Astro Content Layer loader: blog posts and case studies, from WordPress.
//
// Replaces the mirroring pipeline for post *content*. Where `wp:posts` scrapes
// the rendered Elementor page and commits ~130KB of markup per post, this pulls
// the post as data — the body is clean Gutenberg HTML — and lets Astro supply
// the surrounding template. Nothing enters the repo.
//
// Incremental by design, in two passes:
//
//   1. index   slug + `modified` for every published post. Three requests, ~6s.
//   2. content full records for the posts whose `modified` changed, 10 at a time.
//
// A rebuild where nothing was published therefore costs three requests, which is
// what makes a publish-webhook rebuild cheap enough to run on every save.
import { wpQuery, wpPaginate } from '../../scripts/lib/wp-graphql.mjs';
import { WP_HOST, SITE_URL, MEDIA_ORIGIN, WEBP_PATH } from '../../scripts/lib/config.mjs';
import { normalizeLinks } from '../../scripts/lib/normalize-links.mjs';

/**
 * Stopgap source for the ACF blocks WPGraphQL does not expose yet, written by
 * `npm run wp:acf-snapshot`. Delete the import, the file and the script once
 * wordpress/mu-plugins/spenza-graphql-acf.php is installed.
 */
import ACF_SNAPSHOT from '../data/wp-acf-blocks.json' with { type: 'json' };

/** Posts fetched per content request. 10 returns ~560KB in ~4.5s. */
const BATCH = 10;

/**
 * Bumped when the shape of a stored record changes. It is part of every digest,
 * so raising it re-fetches everything — the alternative is a store full of
 * records that predate a field and a build that fails far from the cause.
 */
const SCHEMA_VERSION = 9;

const H = WP_HOST.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const MEDIA_RE = new RegExp(`https?://${H}/wp-content/uploads/`, 'g');
/**
 * The WebP Express variants, matched ahead of the generic wp-content rule.
 *
 * These are media — they are the files a modern browser actually downloads for
 * every image in a post — but they live outside `uploads`, so the generic rule
 * below would file them under /wp-assets/ and strand them on the origin while
 * the originals moved to the media host.
 */
const WEBP_RE = new RegExp(`https?://${H}/wp-content/webp-express/`, 'g');
const WEBP_RE_ESC = new RegExp(`https?:\\\\/\\\\/${H}\\\\/wp-content\\\\/webp-express\\\\/`, 'g');
/**
 * Everything else under wp-content that is *not* an upload — plugin and theme
 * assets. The mirror files these under /wp-assets/, so a post body referencing
 * them needs the same mapping or the links 404.
 */
const WP_CONTENT_RE = new RegExp(`https?://${H}/wp-content/`, 'g');
const WP_CONTENT_RE_ESC = new RegExp(`https?:\\\\/\\\\/${H}\\\\/wp-content\\\\/`, 'g');
// Trailing slash optional: the content also carries bare `https://host` at the
// end of an href, which a slash-requiring pattern silently leaves behind.
// Anchored right after `//`, so sibling hosts like api.preprod.* stay untouched.
const LINK_RE = new RegExp(`https?://${H}/?`, 'g');

/**
 * The same two patterns with JSON-escaped slashes (`https:\/\/host\/`).
 *
 * Yoast's `fullHead` carries its schema graph as an embedded JSON-LD string, in
 * which every `/` is escaped. Rewriting only the plain form leaves visible meta
 * tags correct while every `@id` in the graph still names the WordPress host —
 * which is exactly the kind of half-migration that passes a glance and fails a
 * Rich Results test.
 */
const ESC = s => s.replace(/\//g, '\\/');
const MEDIA_RE_ESC = new RegExp(`https?:\\\\/\\\\/${H}\\\\/wp-content\\\\/uploads\\\\/`, 'g');
const LINK_RE_ESC = new RegExp(`https?:\\\\/\\\\/${H}(?:\\\\/)?`, 'g');

const MEDIA_TARGET = MEDIA_ORIGIN
  ? `${MEDIA_ORIGIN}/wp-content/uploads/`
  : '/wp-content/uploads/';

/**
 * Without a media host this is exactly what the generic wp-content rule would
 * have produced, so adding the rule above changes nothing until one is set.
 */
const WEBP_TARGET = MEDIA_ORIGIN ? `${MEDIA_ORIGIN}${WEBP_PATH}` : WEBP_PATH;

/**
 * Point WordPress' absolute URLs at the public site, for post *body* HTML.
 *
 * Media goes to the media host when one is configured; every other WordPress
 * link becomes root-relative so it resolves against whatever origin serves the
 * build, matching how the mirrored partials already link internally.
 */
function rewrite(html) {
  if (!html) return html;
  // Order matters: uploads, then the WebP variants, then the rest of
  // wp-content, then everything else. Each rule is a prefix of the next.
  const out = html
    .replace(MEDIA_RE, MEDIA_TARGET)
    .replace(WEBP_RE, WEBP_TARGET)
    .replace(WP_CONTENT_RE, '/wp-assets/wp-content/')
    .replace(LINK_RE, '/')
    .replace(MEDIA_RE_ESC, () => ESC(MEDIA_TARGET))
    .replace(WEBP_RE_ESC, () => ESC(WEBP_TARGET))
    .replace(WP_CONTENT_RE_ESC, () => ESC('/wp-assets/wp-content/'))
    .replace(LINK_RE_ESC, () => ESC('/'));
  return normalizeLinks(out);
}

/**
 * Same, but for Yoast's `fullHead`, where links must stay absolute.
 *
 * `canonical`, `og:url` and the `@id` values throughout the schema graph are
 * only meaningful as absolute URLs — making them root-relative like body links
 * would quietly break canonicalisation across all 256 posts.
 */
function rewriteHead(head) {
  if (!head) return head;
  const media = MEDIA_ORIGIN ? MEDIA_TARGET : `${SITE_URL}/wp-content/uploads/`;
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
 * Fields for the three Elementor-template blocks, once WordPress exposes them.
 *
 * The single-post template (id 20168) renders a summary line, a "key points"
 * card block and a "How Spenza helps" block from a shortcode reading a custom
 * field. That field is not registered with WPGraphQL, so the API cannot return
 * it and every post renders those three slots empty — the one remaining parity
 * gap against the mirror.
 *
 * To close it, set this to the field selection, e.g. for ACF via the
 * WPGraphQL for ACF plugin:
 *
 *   `postExtras{summary keyPoints spenzaBlock}`
 *
 * or, for meta registered with `show_in_graphql`, the camelCase field names
 * directly. Then map them in `toEntry` below — nothing else needs to change,
 * because the schema and the layout slots already exist.
 */
const TEMPLATE_BLOCK_FIELDS = '';

const POST_FIELDS = `
  databaseId slug title date modified
  excerpt content
  author{node{name slug description avatar{url}}}
  categories{nodes{name slug}}
  tags{nodes{name slug}}
  featuredImage{node{databaseId sourceUrl altText srcSet mediaDetails{width height}}}
  seo{title metaDesc canonical opengraphImage{sourceUrl} fullHead}
  ${TEMPLATE_BLOCK_FIELDS}
`.replace(/\s+/g, ' ').trim();

/**
 * Shape one WPGraphQL node into the stored record.
 *
 * `category` is singular and load-bearing: it drives the `/{category}/{slug}/`
 * route, so a post carrying more than one category has to resolve to exactly
 * the one WordPress uses in its permalink.
 */
function toEntry(node, routeFor) {
  const cats = node.categories?.nodes ?? [];
  const tags = (node.tags?.nodes ?? []).map(t => t.slug);
  const category = routeFor(node.slug) ?? cats[0]?.slug;

  return {
    /**
     * WordPress' own post id. Only used for markup fidelity: the Elementor loop
     * item carries `e-loop-item-<id> post-<id>` classes, and the related-posts
     * grid has to reproduce them to match the mirrored page byte for byte.
     */
    databaseId: node.databaseId,
    slug: node.slug,
    title: node.title,
    category,
    categories: cats.map(c => c.slug),
    tags,
    // Case studies and product docs share the /spenza-product/ prefix but want
    // different layouts. One tag decides, applied by marketing at publish time.
    isCaseStudy: tags.includes('case-study'),
    excerpt: rewrite(node.excerpt ?? ''),
    publishedDate: node.date,
    updatedDate: node.modified,
    author: node.author?.node
      ? {
          name: node.author.node.name,
          slug: node.author.node.slug,
          bio: node.author.node.description || undefined,
          avatar: node.author.node.avatar?.url || undefined,
        }
      : undefined,
    featuredImage: node.featuredImage?.node
      ? {
          url: rewrite(node.featuredImage.node.sourceUrl),
          alt: node.featuredImage.node.altText || '',
          width: node.featuredImage.node.mediaDetails?.width,
          height: node.featuredImage.node.mediaDetails?.height,
          /** Attachment id, for the `wp-image-<id>` class WordPress emits. */
          id: node.featuredImage.node.databaseId,
          /**
           * WordPress' own candidate list. Asking for it by name is what keeps
           * the related-posts thumbnails responsive: rebuilding the candidates
           * from `width` alone would guess at which intermediate sizes exist.
           */
          srcSet: node.featuredImage.node.srcSet
            ? rewrite(node.featuredImage.node.srcSet)
            : undefined,
        }
      : undefined,
    seo: {
      title: node.seo?.title || node.title,
      description: node.seo?.metaDesc || '',
      ogImage: node.seo?.opengraphImage?.sourceUrl
        ? rewrite(node.seo.opengraphImage.sourceUrl)
        : undefined,
      // The complete Yoast head, including the Article/BreadcrumbList/Person
      // schema graph. Injected verbatim rather than rebuilt, which is what
      // keeps the earned FAQ rich results intact.
      fullHead: rewriteHead(node.seo?.fullHead ?? ''),
    },
    content: rewrite(node.content ?? ''),

    /**
     * GraphQL first, snapshot second.
     *
     * `postExtras` appears once the mu-plugin is installed; until then the
     * snapshot in wp-acf-blocks.json fills in. Ordering it this way means
     * installing the plugin silently takes over and the snapshot can be deleted
     * without touching this file.
     */
    templateBlocks: blocksFor(node),
  };
}

/** Merge the GraphQL field, when present, over the snapshot. */
function blocksFor(node) {
  const snap = ACF_SNAPSHOT[node.slug] ?? {};
  const live = node.postExtras ?? {};
  const cards = rowsIn => (Array.isArray(rowsIn) ? rowsIn : []).map(r => ({
    icon: r?.icon ?? '',
    title: r?.title ?? '',
    text: r?.text ?? '',
  }));

  return {
    tldrHeading: live.tldrHeading ?? snap.tldrHeading ?? '',
    tldrDescription: live.tldrDescription ?? snap.tldrDescription ?? '',
    twoCol: cards(live.twoCol ?? snap.twoCol),
    oneCol: cards(live.oneCol ?? snap.oneCol),
  };
}

export function wpPosts() {
  return {
    name: 'wp-posts',

    async load({ store, logger, parseData, generateDigest, meta }) {
      const started = Date.now();

      // ---- pass 1: what exists, when it changed, and where it lives --------
      // `uri` comes along here because WordPress' permalink is what decides the
      // route, and a post in two categories still has only one. Reading it is
      // cheap and removes the guesswork.
      const index = await wpPaginate(
        cursor => `{posts(first:100${cursor ? `,after:"${cursor}"` : ''},` +
          `where:{status:PUBLISH}){pageInfo{hasNextPage endCursor} nodes{slug modified uri}}}`,
        d => d.posts,
        { pageSize: 100 }
      );

      if (!index.length) {
        throw new Error('WordPress returned zero published posts — refusing to empty the collection');
      }

      const uriBySlug = new Map(index.map(p => [p.slug, p.uri]));
      const routeFor = slug => {
        const uri = uriBySlug.get(slug);
        return uri ? uri.replace(/^\/+/, '').split('/')[0] : undefined;
      };

      const live = new Set(index.map(p => p.slug));
      /**
       * Digest covers every input that shapes the stored record, not just the
       * post's own `modified` timestamp.
       *
       * The ACF snapshot is a separate input: re-running `wp:acf-snapshot`
       * changes it without touching any post's `modified`, so keying on the
       * timestamp alone meant a refreshed snapshot was silently ignored and the
       * build reused records built from the old one.
       *
       * `MEDIA_ORIGIN` and `SITE_URL` are inputs for the same reason — `rewrite`
       * bakes the media host into every image URL and `rewriteHead` bakes the
       * site origin into every canonical and schema `@id`. Without them here,
       * turning on a media host reused records whose images still pointed at
       * the origin, and the failure was invisible: the build succeeded, the
       * pages rendered, and 264 thumbnails on the blog index quietly 404'd.
       */
      const digestOf = p => generateDigest(
        `${SCHEMA_VERSION}:${p.slug}:${p.modified}:${MEDIA_ORIGIN}:${SITE_URL}:` +
        JSON.stringify(ACF_SNAPSHOT[p.slug] ?? null)
      );

      // ---- decide what actually needs fetching -----------------------------
      const stale = index.filter(p => store.get(p.slug)?.digest !== digestOf(p));

      // Posts deleted or unpublished in WordPress must leave the collection.
      let removed = 0;
      for (const id of [...store.keys()]) {
        if (!live.has(id)) { store.delete(id); removed++; }
      }

      logger.info(
        `${index.length} published posts; ${stale.length} to fetch, ` +
        `${index.length - stale.length} unchanged${removed ? `, ${removed} removed` : ''}`
      );

      // ---- pass 2: full records for the stale ones -------------------------
      let done = 0;
      for (let i = 0; i < stale.length; i += BATCH) {
        const batch = stale.slice(i, i + BATCH);
        const names = batch.map(p => JSON.stringify(p.slug)).join(',');
        const batchData = await wpQuery(
          `{posts(first:${BATCH},where:{nameIn:[${names}],status:PUBLISH}){nodes{${POST_FIELDS}}}}`
        );

        const nodes = batchData.posts?.nodes ?? [];
        // A short batch means WordPress did not return something we asked for.
        // Better to stop than to publish a build quietly missing posts.
        if (nodes.length !== batch.length) {
          const got = new Set(nodes.map(n => n.slug));
          const missing = batch.map(p => p.slug).filter(s => !got.has(s));
          throw new Error(
            `Expected ${batch.length} posts, got ${nodes.length}. Missing: ${missing.join(', ')}`
          );
        }

        for (const node of nodes) {
          const entry = toEntry(node, routeFor);
          if (!entry.category) {
            throw new Error(`Post "${entry.slug}" has no category — it has no /{category}/{slug}/ route`);
          }
          const parsed = await parseData({ id: entry.slug, data: entry });
          store.set({
            id: entry.slug,
            data: parsed,
            // Lets routes use render(entry); the body is already HTML, so it
            // needs no markdown pass.
            rendered: { html: entry.content },
            digest: digestOf({ slug: entry.slug, modified: node.modified }),
          });
        }

        done += nodes.length;
        logger.info(`  fetched ${done}/${stale.length}`);
      }

      await meta.set('lastSync', new Date().toISOString());
      logger.info(
        `${[...store.keys()].length} posts in the collection ` +
        `(${((Date.now() - started) / 1000).toFixed(1)}s)`
      );
    },
  };
}
