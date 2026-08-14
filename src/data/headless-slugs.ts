/**
 * Which posts are served from WordPress (the `posts` collection) rather than
 * from a mirrored Elementor capture.
 *
 * Now that every post is headless, routes are generated from the collection
 * itself, so a post published in WordPress gets a page on the next build with
 * no mirror run. `MIRROR_ONLY` is the escape hatch: put a slug there and it
 * falls back to its mirrored partial, which is how a single bad post gets
 * rolled back without reverting the whole switch.
 *
 * Lives in its own module because Astro extracts `getStaticPaths` into a
 * separate chunk at build time, where component-scope constants are not in
 * scope. Imports are.
 */

/** Set false to put every post back on the mirror. */
export const HEADLESS_ALL = true;

/**
 * Slugs kept on the mirrored partial even while HEADLESS_ALL is on.
 *
 * Only works for posts that still have a partial on disk — a post published
 * after the last mirror run has none, so it is always headless.
 */
export const MIRROR_ONLY = new Set<string>([]);

export function isHeadless(slug: string): boolean {
  return HEADLESS_ALL && !MIRROR_ONLY.has(slug);
}
