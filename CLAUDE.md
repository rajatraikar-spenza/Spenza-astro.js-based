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
- **Every post is headless now.** `HEADLESS_ALL = true` in
  `src/data/headless-slugs.ts` and `/<category>/<slug>/` renders through
  `ArticleLayout`. The rollback is per-post: add a slug to `MIRROR_ONLY` and it
  falls back to its mirrored partial, provided that partial still exists.
- Post bodies never pass through `partial-rewrites-plugin.mjs` — they come from
  the loader, not from `src/partials/`. Anything that rewrites markup must go in
  `scripts/lib/html-perf.mjs`, which both paths call. Putting it in only one
  covers about half the site, and not the half you would guess: the 30MB product
  videos and every YouTube embed are in posts.
- `MEDIA_ORIGIN` is part of the loader's cache digest, along with `SITE_URL`.
  Anything else baked into a stored record must be added there too, or a changed
  environment silently reuses records rewritten for the old one.
- After any change to the pipeline, run:
  `npm run build && npm run wp:audit && npm run wp:audit-links`
  then `npm run wp:verify-dist` — the audits crawl a preview server and check
  what pages link to; only `wp:verify-dist` catches a reference that resolves
  locally today and 404s once media stops being deployed.
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

## Deployment

The build is environment-driven. Nothing about it is host-specific except the
two files it writes into `dist/`.

| Variable | Effect |
| :------- | :----- |
| `SITE_URL` | Canonicals, Open Graph, sitemap. Defaults to production. |
| `WP_ORIGIN` | Where post content is fetched from. Defaults to preprod. |
| `MEDIA_ORIGIN` | Serves media, and drops 2.2GB from `dist`. |
| `NOINDEX=1` | `Disallow: /` plus `X-Robots-Tag`. Set on every preview. |
| `HOST_REDIRECTS=1` | Stop emitting the 86 HTML redirect stand-ins. |

- `NOINDEX` is opt-*out* on purpose. A staging site that slips into the index is
  fixable; a production site that ships `Disallow: /` deletes itself from Google
  and gives no signal. The build warns when `SITE_URL` is overridden and
  `NOINDEX` is not set, which is the shape of a preview deploy that forgot.
- `astro:build:done` writes `_redirects` and `_headers` (Cloudflare Pages and
  Netlify share the format; Vercel wants the same rules in `vercel.json`),
  prunes stylesheets nothing links to, and drops the media trees when
  `MEDIA_ORIGIN` is set. See `scripts/lib/host-files-integration.mjs`.
- Media lives in S3 behind `media.spenza.com`. `scripts/aws-media-host.sh`
  builds and verifies that stack; run it with no arguments for the steps.
- **New posts publish new images.** They are not in the bucket and the build
  will not warn you. Run `npm run wp:blog-media-sync`, then `aws s3 sync … 
  --size-only`, then build. Wire the first two into the deploy job.
- `npm run wp:fonts` mirrors any Google Fonts the markup still requests. It
  scans `dist` as well as the repo, because a font requested only by a post body
  does not exist on disk until a build has run — so it is build, scan, build.

## Publishing

`.github/workflows/publish.yml` rebuilds from WordPress and deploys, every 30
minutes and on demand. A poll rather than a webhook because it needs nothing
installed on preprod; swapping `schedule` for `repository_dispatch` later
changes no other step.

- **Only blog posts are headless.** The 38 mirrored marketing pages, the
  header/footer and the archives are captured HTML that needs `npm run wp:resync`
  with a logged-in session, which cannot run unattended. An editor changing the
  homepage in Elementor will not see it appear.
- The content store is `node_modules/.astro/data-store.json`, not `.astro/` —
  that holds generated types only. Caching the wrong path looks like it works
  and silently refetches all 259 posts every run.
- `wp:media-sync-s3` diffs against the bucket, not `public/` — a CI runner has
  no media, so the local diff would re-download 2.2GB every run. It also fetches
  each new image's WebP twin and rewrites the manifest from the bucket.
- The deploy short-circuits on a content hash stored at `s3://spenza-site/
  .deploy-hash`. Builds are byte-reproducible, so an unchanged site costs no S3
  writes and no invalidation — `aws s3 sync` alone would report everything as
  changed, because it compares mtime and every build rewrites every file.
- Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, scoped to
  `.github/ci-iam-policy.json`. Environment is set through repo *variables*
  (`SITE_URL`, `NOINDEX`, …) so staging and production differ by configuration
  rather than by a code change.
