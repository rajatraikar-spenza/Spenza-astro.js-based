// Astro Content Layer loader: posts written in the admin at /admin (or generated
// by the AI pipeline), read from `src/content/cms-blog/*.mdx`.
//
// These join the WordPress posts in the single `posts` collection (see
// `src/content.config.ts`), so the blog index, category and author archives,
// related-post cards, search index and sitemap all pick them up with no change
// of their own, and they render through ArticleLayout like any other post.
//
// An entry that fails validation is skipped with an error rather than failing
// the build: one bad post in a pull request must not stop the whole site from
// deploying. The `cms-validate` workflow reports the same problems on the PR,
// so an editor sees them before publishing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from '../../scripts/lib/config.mjs';
import { listEntries, loadEntry } from '../../scripts/lib/cms-post.mjs';
import WP_AUTHORS from '../data/wp-authors.json' with { type: 'json' };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** WordPress ids are small; admin posts use ids from 9,000,000 (see databaseIdFor). */
const isCmsRecord = entry => (entry?.data?.databaseId ?? 0) >= 9_000_000;

export const cmsDirs = () => ({
  postsDir: process.env.CMS_POSTS_DIR ? path.resolve(process.env.CMS_POSTS_DIR) : path.join(ROOT, 'src', 'content', 'cms-blog'),
  publicDir: process.env.CMS_PUBLIC_DIR ? path.resolve(process.env.CMS_PUBLIC_DIR) : path.join(ROOT, 'public'),
});

const authorsMeta = Object.fromEntries(
  Object.entries(WP_AUTHORS).map(([slug, a]) => [slug, { bio: a.description || undefined, avatar: a.avatar || undefined }])
);

export function cmsPosts() {
  return {
    name: 'cms-posts',

    async load({ store, logger, parseData, generateDigest }) {
      const { postsDir, publicDir } = cmsDirs();
      const files = listEntries(postsDir);
      const keep = new Set();
      let published = 0;

      for (const file of files) {
        let result;
        try {
          result = await loadEntry(file, { siteUrl: SITE_URL, publicDir, authorsMeta });
        } catch (err) {
          result = { file, slug: path.basename(file), errors: [err.message], warnings: [] };
        }
        const rel = path.relative(ROOT, file);

        if (result.errors.length) {
          for (const e of result.errors) {
            logger.error(`${rel}: ${e}`);
            if (process.env.GITHUB_ACTIONS) console.log(`::error file=${rel}::${e}`);
          }
          logger.warn(`${rel} is NOT published: fix the errors above.`);
          continue;
        }
        if (result.scheduled) {
          logger.info(`${rel} is scheduled for ${result.scheduled.toISOString()}; held back until then`);
          continue;
        }
        for (const w of result.warnings) logger.warn(`${rel}: ${w}`);

        const { slug, data } = result;
        const existing = store.get(slug);
        if (existing && !isCmsRecord(existing)) {
          const msg = `${rel}: slug "${slug}" is already a WordPress post; this entry is NOT published. Pick another slug.`;
          logger.error(msg);
          if (process.env.GITHUB_ACTIONS) console.log(`::error file=${rel}::${msg}`);
          continue;
        }
        const parsed = await parseData({ id: slug, data });
        store.set({
          id: slug,
          data: parsed,
          rendered: { html: data.content },
          digest: generateDigest(JSON.stringify(data)),
        });
        keep.add(slug);
        published += 1;
      }

      // An entry deleted from the repo must leave the site on the next build.
      for (const id of [...store.keys()]) {
        if (isCmsRecord(store.get(id)) && !keep.has(id)) store.delete(id);
      }
      if (files.length) logger.info(`${published}/${files.length} admin posts published`);
    },
  };
}
