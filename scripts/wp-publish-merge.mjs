/**
 * Build the WordPress REST payload for a merged cluster.
 *
 *   npm run merge:publish -- prep  <slug>
 *   npm run merge:publish -- build <slug> <resolved.json>
 *
 * A merged post is published by editing the destination post in WordPress at
 * its existing URL. `prep` reports what has to be uploaded first; `build`
 * emits the payload to POST at /wp-json/wp/v2/posts/<id>.
 *
 * Four things the repo body does not carry, and that every publish must add.
 * They are applied here rather than left as manual steps because each one was
 * missed at least once while publishing the MVNO hub by hand, and each failed
 * silently - the post looked right in the preview and wrong on the live site:
 *
 *   1. Image URLs. The body points at /blog-media/<slug>/..., a repo path. The
 *      loader rewrites exactly `https://<WP_HOST>/wp-content/uploads/` to
 *      MEDIA_ORIGIN, so only that absolute form survives to the live site. A
 *      root-relative path passes through untouched and 404s.
 *
 *   2. The shared FAQ/figure/heading treatment. `src/styles/merge-preview.css`
 *      is scoped to `#merge-preview-content` and imported only by the preview
 *      route, so publishing the body alone leaves the old per-cluster FAQ
 *      styling (white cards, right-side orange +) and weight-400 headings live
 *      while every other blog shows the grey Spectra treatment. That stylesheet
 *      stays the single source of truth: it is rescoped here and inlined, so
 *      the preview and the published post cannot drift.
 *
 *   3. The closing "Contact Us Today" call to action, which the other 204
 *      posts carry and the merged bodies do not.
 *
 *   4. The structured-data delta (FAQPage, plus HowTo where the body is
 *      genuinely stepped).
 *
 * `resolved.json` is written after the media upload step:
 *   { postId, authorId, featuredId, media: { "<wpFilename>": {id,url} }, resources: { "<repoPath>": "<url>" } }
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { loadMergePreviews } from './lib/merge-manifest.mjs';
import { buildMergeSchema, assertSchemaSound } from './lib/merge-schema.mjs';
import { WP_ORIGIN, SITE_URL } from './lib/config.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const SHARED_CSS = join(REPO, 'src/styles/merge-preview.css');

/** The wrapper id the inlined stylesheet is rescoped to on a published post. */
const ROOT_ID = 'spenza-merged-article';

/**
 * Same Spectra classes as the 204 older posts, because the purged CSS bundle
 * these posts already load styles the button by those class names - measured
 * identical on a merged page (#FF4500, 10px/40px, 5px radius, 208x38), so no
 * new CSS is needed.
 *
 * The legacy href `/contact-the-telecom-expense-management-experts/` is itself
 * a 301 to `/contact-us/`. Pointing straight at the destination keeps the same
 * landing page, drops a hop, and avoids adding new redirect-chain sources
 * before the donor cutover.
 */
const CTA_HREF = '/contact-us/';
const CTA =
  '<div class="wp-block-uagb-buttons uagb-buttons__outer-wrap uagb-btn__default-btn ' +
  'uagb-btn-tablet__default-btn uagb-btn-mobile__default-btn uagb-block-68257511">' +
  '<div class="uagb-buttons__wrap uagb-buttons-layout-wrap ">' +
  '<div class="wp-block-uagb-buttons-child uagb-buttons__outer-wrap uagb-block-74a16303 wp-block-button">' +
  '<div class="uagb-button__wrapper">' +
  `<a class="uagb-buttons-repeater wp-block-button__link" href="${CTA_HREF}" rel="noopener" ` +
  'target="_blank" role="button"><div class="uagb-button__link">Contact Us Today</div></a>' +
  '</div></div></div></div>';

const UPLOADS = `${WP_ORIGIN.replace(/\/+$/, '')}/wp-content/uploads/`;

/** Local images the body references, with the alt text authored beside them. */
function localImages(body, slug, preview) {
  const found = new Map();
  for (const m of body.matchAll(/\/blog-media\/[^"'\s)]+\.(png|webp|jpg|jpeg)/gi)) {
    found.set(m[0], { rel: m[0], file: m[0].split('/').pop(), alt: '' });
  }
  for (const fig of body.matchAll(/<figure[\s\S]*?<\/figure>/g)) {
    const alt = (fig[0].match(/alt="([^"]*)"/) || [])[1] || '';
    for (const m of fig[0].matchAll(/\/blog-media\/[^"'\s)]+\.(png|webp|jpg|jpeg)/gi)) {
      const rec = found.get(m[0]);
      if (rec && !rec.alt) rec.alt = alt;
    }
  }
  const imgs = [...found.values()];

  // A locally generated hero is not referenced by the body, only by the record.
  if (preview.featuredImage?.startsWith('/blog-media/')) {
    const add = (rel) => {
      if (imgs.some((i) => i.rel === rel)) return;
      if (!existsSync(join(REPO, 'public' + rel))) return;
      imgs.push({ rel, file: rel.split('/').pop(), alt: preview.featuredImageAlt || preview.title });
    };
    add(preview.featuredImage);
    add(preview.featuredImage.replace(/\.png$/i, '.webp'));
  }
  return imgs;
}

/**
 * WebP quality for body illustrations.
 *
 * The bodies ship `<picture>` with a WebP source, so WebP is what browsers
 * actually fetch and the PNG is a fallback almost nobody sees. The generated
 * WebP files sit around q90 and 200-280KB each; at q82 they are roughly half
 * that with no visible change - checked on a text-heavy crop at 2x, where the
 * letterforms and the orange gradient are indistinguishable, and mean absolute
 * error moves only 2.60 -> 2.82 on a 0-255 scale.
 *
 * The PNGs are left exactly as generated. Measured on the same images, a
 * lossless re-encode saves nothing and palette quantisation costs text quality
 * for 5-16%, which is a bad trade on a file that is rarely requested.
 */
const WEBP_QUALITY = 82;

/**
 * Write an upload-ready copy of each image, re-encoding WebP and passing PNG
 * through untouched. Done here rather than by hand so every future cluster is
 * optimised without anyone remembering to do it.
 */
async function optimiseForUpload(uploads) {
  const dir = join(REPO, '.merge-publish', 'optimised');
  mkdirSync(dir, { recursive: true });
  const out = [];
  for (const u of uploads) {
    const dest = join(dir, u.wpFilename);
    const before = existsSync(u.absPath) ? statSync(u.absPath).size : 0;
    if (/\.webp$/i.test(u.wpFilename) && before) {
      await sharp(u.absPath).webp({ quality: WEBP_QUALITY, effort: 6 }).toFile(dest);
    } else if (before) {
      copyFileSync(u.absPath, dest);
    }
    const after = existsSync(dest) ? statSync(dest).size : 0;
    out.push({ ...u, absPath: dest, sourcePath: u.absPath, bytesBefore: before, bytes: after });
  }
  return out;
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildPayload(slug, resolved) {
  const previews = loadMergePreviews();
  const preview = previews[slug];
  if (!preview) throw new Error(`no manifest record for cluster ${slug}`);

  let html = preview.content.trim();
  const rewrites = {};

  // 1. repo image paths -> WordPress upload URLs
  const imgs = localImages(html, slug, preview);
  for (const img of imgs) {
    // Keyed by the WordPress filename: uploads are batched across clusters and
    // two clusters can ship the same local basename.
    const key = `${slug}-${img.file.toLowerCase()}`;
    const hit = resolved.media?.[key];
    if (!hit) throw new Error(`no uploaded attachment for ${key}`);
    const re = new RegExp(img.rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    rewrites[img.file] = (html.match(re) || []).length;
    html = html.replace(re, hit.url);
    if (/\.png$/i.test(img.file)) {
      const needle = `<img src="${hit.url}"`;
      html = html.replace(needle, `${needle} class="wp-image-${hit.id}"`);
    }
  }

  // 1b. downloadable resources. `public/blog-resources/*` lives on the feature
  // branch, but CI builds and deploys `main`, so a root-relative link to one
  // 404s in production and wp:verify-dist fails the build on it. The post body
  // is WordPress', so its downloads belong in WordPress media too.
  for (const [rel, url] of Object.entries(resolved.resources || {})) {
    const re = new RegExp(rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    rewrites[rel] = (html.match(re) || []).length;
    html = html.replace(re, url);
  }

  const strayMedia = (html.match(/\/blog-media\//g) || []).length;
  const strayRes = (html.match(/\/blog-resources\//g) || []).length;
  if (strayMedia) throw new Error(`${strayMedia} unrewritten /blog-media/ references remain`);
  if (strayRes) throw new Error(`${strayRes} unrewritten /blog-resources/ references remain`);

  // 2. shared treatment, rescoped onto the published wrapper. Tag-agnostic:
  // most clusters wrap in <div class="mNN-article">, M27 uses <article>.
  const shared = readFileSync(SHARED_CSS, 'utf8').replace(/#merge-preview-content\b/g, `#${ROOT_ID}`);
  if (shared.includes('#merge-preview-content')) throw new Error('stylesheet rescope missed a selector');
  if (!/font-weight:\s*700/.test(shared)) {
    throw new Error('merge-preview.css no longer bolds headings - refusing to publish light headings');
  }

  const wrapper = html.match(/<(div|article|section) class="(m\d+-article)"/);
  if (!wrapper) throw new Error('could not find the per-cluster article wrapper');
  html = html.replace(wrapper[0], `<${wrapper[1]} id="${ROOT_ID}" class="${wrapper[2]}"`);

  const minified = minifyCss(shared);
  const lastStyle = html.lastIndexOf('</style>');
  if (lastStyle === -1) throw new Error('no <style> block to extend');
  html =
    html.slice(0, lastStyle + 8) +
    `\n<style id="spenza-merged-shared">${minified}</style>` +
    html.slice(lastStyle + 8);

  // 4. structured-data delta
  const schema = buildMergeSchema({
    siteUrl: SITE_URL,
    slug,
    category: preview.category,
    title: preview.title,
    description: preview.seoDescription,
    html,
  });
  if (!schema.json) throw new Error(`${slug}: no schema produced - expected at least a FAQPage`);
  const schemaProblems = assertSchemaSound(schema.json, slug);
  if (schemaProblems.length) throw new Error(`schema gate failed:\n  ${schemaProblems.join('\n  ')}`);
  const ld = `\n<script type="application/ld+json">${schema.json.replace(/</g, '\\u003c')}</script>`;

  const body = `${html.trim()}\n${CTA}${ld}`;

  // The three things that were each missed once by hand. Fail loudly rather
  // than publish a post that looks fine in review and wrong on the site.
  if (!/font-weight:700/.test(body)) throw new Error(`${slug}: bold heading rule missing from body`);
  if (!body.includes('Contact Us Today')) throw new Error(`${slug}: Contact Us Today button missing`);
  if (!body.includes(`href="${CTA_HREF}"`)) throw new Error(`${slug}: CTA points somewhere unexpected`);
  if ((body.match(/Contact Us Today/g) || []).length !== 1) throw new Error(`${slug}: CTA is duplicated`);
  if (!body.includes('application/ld+json')) throw new Error(`${slug}: JSON-LD missing`);

  const tb = preview.templateBlocks || {};
  return {
    payload: {
      slug,
      postId: resolved.postId,
      fields: {
        title: preview.title,
        content: `<!-- wp:html -->\n${body}\n<!-- /wp:html -->`,
        excerpt: preview.excerpt,
        featured_media: resolved.featuredId,
        author: resolved.authorId,
        meta: {
          _yoast_wpseo_title: preview.seoTitle,
          _yoast_wpseo_metadesc: preview.seoDescription,
        },
        acf: {
          tldr_heading: tb.tldrHeading,
          tldr_description: tb.tldrDescription,
          '2_col': (tb.twoCol || []).map((c) => ({ icon: c.icon, title: c.title, text: c.text })),
          '1_col': (tb.oneCol || []).map((c) => ({ icon: c.icon, title: c.title, text: c.text })),
        },
      },
    },
    report: {
      slug,
      postId: resolved.postId,
      imageRewrites: rewrites,
      wrapper: `${wrapper[2]} #${ROOT_ID}`,
      sharedCssBytes: minified.length,
      cta: true,
      schema: schema.summary,
      body: {
        h2: (body.match(/<h2\b/g) || []).length,
        tables: (body.match(/<table\b/g) || []).length,
        figures: (body.match(/<figure\b/g) || []).length,
        faq: (body.match(/<details\b/g) || []).length,
        firstFaqOpen: /<details name="[^"]+" open>/.test(body),
        wpUploads: (body.match(new RegExp(UPLOADS.replace(/[.]/g, '\\.'), 'g')) || []).length,
      },
      acfCards: `${(tb.twoCol || []).length}+${(tb.oneCol || []).length}`,
    },
  };
}

// ---- CLI ------------------------------------------------------------------
const [, , cmd, slug, resolvedPath] = process.argv;

if (!cmd || !slug) {
  process.stderr.write('usage: wp-publish-merge.mjs <prep|build> <slug> [resolved.json]\n');
  process.exit(2);
}

if (cmd === 'prep') {
  const preview = loadMergePreviews()[slug];
  if (!preview) throw new Error(`no manifest record for cluster ${slug}`);
  const imgs = localImages(preview.content, slug, preview);
  const raw = imgs.map((i) => ({
    absPath: join(REPO, 'public' + i.rel),
    wpFilename: `${slug}-${i.file.toLowerCase()}`,
    alt: i.alt,
    missing: !existsSync(join(REPO, 'public' + i.rel)),
  }));
  const uploads = await optimiseForUpload(raw);
  const before = uploads.reduce((n, u) => n + u.bytesBefore, 0);
  const after = uploads.reduce((n, u) => n + u.bytes, 0);
  process.stdout.write(
    JSON.stringify(
      {
        slug,
        title: preview.title,
        category: preview.category,
        author: { name: preview.authorName, slug: preview.authorSlug },
        donors: preview.donors.map((d) => d.path),
        featured: { local: preview.featuredImage.startsWith('/blog-media/'), value: preview.featuredImage },
        optimisation: {
          webpQuality: WEBP_QUALITY,
          bytesBefore: before,
          bytesAfter: after,
          saved: before - after,
          savedPct: before ? Math.round(((before - after) / before) * 100) : 0,
        },
        uploads,
      },
      null,
      1
    ) + '\n'
  );
} else if (cmd === 'build') {
  if (!resolvedPath) throw new Error('build needs a resolved.json path');
  const resolvedData = JSON.parse(readFileSync(resolve(resolvedPath), 'utf8'));
  const { payload, report } = buildPayload(slug, resolvedData);
  const out = join(REPO, '.merge-publish', `payload-${slug}.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(payload));
  process.stdout.write(JSON.stringify({ ...report, out, bytes: statSync(out).size }, null, 1) + '\n');
} else {
  process.stderr.write(`unknown command: ${cmd}\n`);
  process.exit(2);
}
