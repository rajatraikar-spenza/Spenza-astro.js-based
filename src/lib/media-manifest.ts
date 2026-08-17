/**
 * Does the mirror hold this media file?
 *
 * Answers from `wp-media-manifest.json` rather than the filesystem. The media
 * itself is served from S3 and is no longer committed — 2.2GB of images were
 * being carried in git so the build could ask whether a filename existed, which
 * is a question a list of filenames answers just as well.
 *
 * Regenerate the manifest with `npm run wp:media-manifest` after anything that
 * adds media, `wp:blog-media-sync` in particular. A file that is in the bucket
 * but not the manifest is simply not offered as a `srcset` candidate — the
 * conservative direction, and the same one the old `existsSync` check took.
 */
import manifest from '../data/wp-media-manifest.json';

const FILES: ReadonlySet<string> = new Set(manifest as string[]);

/** `path` is site-absolute, e.g. `/wp-content/uploads/2026/04/a-300x200.png`. */
export function hasMedia(path: string): boolean {
  return FILES.has(path);
}

/** How many files the manifest knows about — used by the build's sanity check. */
export const mediaCount = FILES.size;
