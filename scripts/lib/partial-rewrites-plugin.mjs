// Vite plugin: rewrites applied to every mirrored partial as it is imported.
//
// Every mirrored partial is pulled in as an `?raw` HTML import, so this is the
// one boundary that catches pages, posts, archives and the shared chrome at
// once — rather than repeating the work in each route that renders them.
//
// Two rewrites, both build-time only; the partials on disk stay as generated.
import fs from 'node:fs/promises';
import { MEDIA_ORIGIN } from './config.mjs';
import { normalizeLinks } from './normalize-links.mjs';

/** Blog/case-study media, when it is served from the media host. */
const UPLOADS = /(["'(\s])\/wp-content\/uploads\//g;



export function partialRewrites() {
  return {
    name: 'spenza:partial-rewrites',
    enforce: 'pre',

    /**
     * Loads the partial itself rather than transforming Vite's output.
     *
     * By the time a `?raw` import reaches `transform` it is a JS module holding
     * one string literal, with every `"` escaped to `\"` — so patterns written
     * against real HTML silently never match. Reading the file here means the
     * rewrites run on actual markup.
     */
    async load(id) {
      if (!id.endsWith('.html?raw')) return null;
      if (!id.includes('/partials/') && !id.includes('\\partials\\')) return null;

      const html = await fs.readFile(id.slice(0, -'?raw'.length), 'utf8');
      let out = normalizeLinks(html);
      if (MEDIA_ORIGIN) {
        out = out.replace(UPLOADS, `$1${MEDIA_ORIGIN}/wp-content/uploads/`);
      }
      return `export default ${JSON.stringify(out)}`;
    },
  };
}
