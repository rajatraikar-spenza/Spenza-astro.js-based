// Astro integration: a dev-server endpoint that re-runs the WordPress loader.
//
// The Content Layer only loads once, when the dev server starts. A post
// published in WordPress after that is invisible until the server restarts,
// which is the opposite of what a headless CMS should feel like.
//
// Astro hands integrations a `refreshContent` function for exactly this, but
// ships no way to call it from outside the process. This mounts one: POST to
// /_wp-refresh and the `wp-posts` loader runs again, in place, against the
// running server. The loader is already incremental, so an unchanged site costs
// three requests and the pages update without a rebuild.
//
// Dev only — `astro:server:setup` never fires during a build.
import { WP_ORIGIN } from './config.mjs';

/** The loader's `name`, as declared in src/loaders/wp-posts.mjs. */
const LOADER = 'wp-posts';

export const REFRESH_PATH = '/_wp-refresh';

/** @returns {import('astro').AstroIntegration} */
export function wpRefresh() {
  return {
    name: 'spenza:wp-refresh',
    hooks: {
      'astro:server:setup': ({ server, logger, refreshContent }) => {
        if (!refreshContent) {
          logger.warn(`this Astro version exposes no refreshContent — ${REFRESH_PATH} disabled`);
          return;
        }

        server.middlewares.use(REFRESH_PATH, (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('POST only');
            return;
          }

          const started = Date.now();
          logger.info(`refreshing posts from ${WP_ORIGIN}…`);

          refreshContent({ loaders: [LOADER] })
            .then(() => {
              const secs = ((Date.now() - started) / 1000).toFixed(1);
              logger.info(`posts refreshed in ${secs}s`);
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ ok: true, seconds: Number(secs) }));
            })
            .catch(err => {
              // A failed refresh must not take the dev server down: the usual
              // cause is a network blip, and the next poll should just retry.
              logger.error(`refresh failed: ${err.message}`);
              res.statusCode = 500;
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: err.message }));
            });
        });

        logger.info(`POST ${REFRESH_PATH} to pull new posts without restarting`);
      },
    },
  };
}
