## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## WordPress mirror

This project is a faithful mirror of `preprod.spenza.com`, not a reinterpretation.
See README.md for the full architecture. Key rules when working on it:

- Mirrored pages use `WpLayout.astro`, which loads the exact stylesheet set the
  WordPress page loaded, **in order** — Elementor's cascade depends on it.
- That stylesheet set is served as two purged bundles built by
  `npm run wp:optimize-css` (shared tier + per-page inline tier, in that order).
  Re-run it after anything that changes markup or CSS, or pages keep stale
  bundles. `WpLayout` falls back to the raw ordered list for any page the
  optimiser skipped.
- Origins are env-driven via `scripts/lib/config.mjs` (`WP_ORIGIN`,
  `MEDIA_ORIGIN`, `SITE_URL`) — see `.env.example`. Never hardcode a host in a
  script; `rewriteWpUrls`/`wpMediaRe` are the shared helpers.
- `MEDIA_ORIGIN` must never point at the WordPress host: preprod serves
  `Disallow: /`, so blog images hosted there would be uncrawlable.
- Never hand-edit `src/partials/**` or `src/data/wp-*.json`. They are generated;
  change the script in `scripts/` and re-run it.
- Inline `<style>` blocks must be extracted from the **whole document**, not just
  `<head>` — WPCode snippets put real layout CSS in the body.
- The site's own behaviour lives in footer inline scripts, extracted per page to
  `public/scripts/page/<slug>.js`. Elementor's jQuery runtime is replaced by
  `public/scripts/wp-shim.js`.
- Blog posts live at `/<category>/<slug>/`, matching WordPress. Do not move them.

## Headless blog (in progress)

Post *content* now comes from WordPress via WPGraphQL, not the mirror:

- `src/loaders/wp-posts.mjs` is an Astro Content Layer loader; query it with
  `getCollection('posts')`. Schema in `src/content.config.ts`.
- **GET, never POST.** A WAF returns 403 for POST to `/graphql`. Queries go in
  the URL, so keep them small and paginate — never interpolate a large value.
- Incremental: an index pass reads `slug`+`modified`, and only changed posts are
  refetched. Bump `SCHEMA_VERSION` in the loader whenever the record shape
  changes, or stores built before a field will silently lack it.
- WordPress URLs are rewritten in `content` (root-relative) and in Yoast's
  `fullHead` (absolute — canonicals and schema `@id`s must stay absolute).
  Both plain `https://host/` and JSON-escaped `https:\/\/host\/` forms occur;
  fix both or the schema graph keeps naming WordPress.
- `ArticleLayout.astro` renders a post by filling `partials/post-shell.html` —
  the Elementor single-post template with its data-bearing widgets replaced by
  `<!--SLOT:name-->` markers. Regenerate with `npm run wp:post-shell` if the
  marketing team edits that Elementor template. Filling the real template is
  what gives visual parity: hand-authored markup would not match the mirrored
  CSS, which keys off Elementor's wrappers and element ids.
- Element ids in that template are stable across all 256 posts (they belong to
  the template, not the post), which is why one shell serves every post.
- **Known gap:** three widgets (`summary`, `keyPoints`, `spenzaBlock`) are
  rendered by a shortcode reading a field WPGraphQL does not expose, so they
  render empty. Slots exist and will fill once that field is registered.
- Headless posts render at `/preview/post/<slug>/` for parity comparison. The
  live `/<category>/<slug>/` routes still serve the mirrored partials — they are
  the rollback. Compare with `npm run wp:diff-headless` after a build.
- After any change to the pipeline, run:
  `npm run build && npm run wp:audit && npm run wp:audit-links`
- `.wp-cache/` holds a live WordPress session cookie. It is gitignored — never
  commit it. WordPress expires it after 48h unless the login used "Remember Me"
  (then 14 days). A stale cookie does not fail loudly — the scripts mirror login
  pages instead — so run `npm run wp:check-session` before any `wp:*` mirroring
  run. Only the mirror needs it; the headless loader is anonymous.
  Rebuild the jar from DevTools values with `npm run wp:make-cookie`.
  Do not test a session against `/wp-json/wp/v2/users/me`: cookie auth needs an
  `X-WP-Nonce` there, so it answers 401 even for a valid session.
- `LIMIT=n npm run wp:posts` deliberately skips writing `wp-posts.json` — that
  file is the route index and is rebuilt from scratch, so a partial run would
  delete blog routes. After one, restore with `ONLY_MISSING=1 npm run wp:posts`,
  which reindexes from the partials on disk without refetching.
