# Working in this repository

Read this before your first edit. It is short on purpose; the two documents in
`docs/` carry the depth, and `CLAUDE.md` is the exhaustive reference for the
build, deployment, forms and analytics.

- **[`docs/blog-merges.md`](docs/blog-merges.md)** — the blog consolidation
  programme. Read it before touching a blog post, a redirect or a category.
- **[`docs/blog-editorial-standard.md`](docs/blog-editorial-standard.md)** — the
  quality bar every blog article must clear: role, goal, Spenza's ICPs and proof
  points, the article blueprint, and the writing, keyword and linking rules.
- **[`docs/blog-images.md`](docs/blog-images.md)** — how to produce images for a
  post so they match the site. Read it before generating any image.
- **[`docs/site-issues.md`](docs/site-issues.md)** — defects found on the live
  blog, with the commands that measured them. Check it before reporting a new one.
- **`CLAUDE.md`** — everything else: the WordPress mirror, the headless loader,
  lead-capture forms, analytics, deployment, publishing.

Current work happens on the **`blog-automation`** branch.

## Skills

Two procedures live in `.codex/skills/`. Load the matching one before starting
that kind of work; each is the step-by-step, and the `docs/` file beside it is
the reference it draws on.

| Skill | Use it when |
| :---- | :---------- |
| [`blog-merge`](.codex/skills/blog-merge/SKILL.md) | Consolidating competing blog posts into one article and previewing the result |
| [`blog-images`](.codex/skills/blog-images/SKILL.md) | Producing, optimising or replacing images for a blog post |

---

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, `astro dev logs`.

Astro documentation: https://docs.astro.build — in particular
[routing](https://docs.astro.build/en/guides/routing/),
[components](https://docs.astro.build/en/basics/astro-components/),
[content collections](https://docs.astro.build/en/guides/content-collections/)
and [styling](https://docs.astro.build/en/guides/styling/).

---

## Who owns what

**WordPress owns blog posts and case studies. Nothing else.** It is a headless
CMS for those two content types and no more.

Everything else — the marketing pages, the header and footer, the calculators,
the styling, every piece of UI — is owned by this codebase. Change it here,
directly, in the file that renders it. Do not change it in WordPress, and do not
route an edit through a build-time rewrite so that it "survives the next mirror
run": there is no next mirror run.

### `src/partials/**` and `src/data/wp-*.json` are source now

They began life as generated files, which is why they read like machine output.
**Edit them directly, like any other file in the repo.** (This rule used to say
the opposite. It was wrong.)

Re-run `npm run wp:optimize-css` after any markup or CSS change, or pages keep
stale style bundles.

### Two scripts are dangerous

`wp:content` and `wp:resync` overwrite `src/partials/**` from WordPress and would
silently discard everything since the import. **Do not run them.** The `wp:*`
scripts still in use are the headless-blog and deployment paths: `wp:posts`,
`wp:media-sync-s3`, `wp:media-manifest`, `wp:verify-dist`, `wp:audit*`.

---

## How the site is built

A faithful mirror of `preprod.spenza.com`, which is why the markup looks the way
it does.

- Mirrored pages use `WpLayout.astro`, which loads the exact stylesheet set the
  WordPress page loaded, **in order** — Elementor's cascade depends on it.
- Blog posts are headless: content comes from WPGraphQL through
  `src/loaders/wp-posts.mjs`, and `ArticleLayout.astro` fills the real Elementor
  single-post template (`src/partials/post-shell.html`) through `<!--SLOT:name-->`
  markers.
- Posts live at `/<category>/<slug>/`, where the category segment is the first
  segment of the WordPress permalink, not the taxonomy term. **Do not move them.**
- Inline `<style>` blocks must be extracted from the **whole document**, not just
  `<head>` — WPCode snippets put real layout CSS in the body.
- Per-page behaviour lives in `public/scripts/page/<slug>.js`. Elementor's jQuery
  runtime is replaced by `public/scripts/wp-shim.js`.
- Origins are env-driven via `scripts/lib/config.mjs` (`WP_ORIGIN`,
  `MEDIA_ORIGIN`, `SITE_URL`). **Never hardcode a host in a script** —
  `rewriteWpUrls` / `wpMediaRe` are the shared helpers.

### The GraphQL loader

- **GET, never POST.** A WAF returns 403 for POST to `/graphql`. Queries go in
  the URL, so keep them small and paginate.
- Bump `SCHEMA_VERSION` in the loader whenever the record shape changes, or
  stores built before a field will silently lack it.
- `MEDIA_ORIGIN` and `SITE_URL` are part of the loader's cache digest. Anything
  else baked into a stored record must be added there too.

---

## Redirects

- `src/data/site-redirects.mjs` — **this repo's own decisions. Put new redirects
  here.**
- `src/data/wp-redirects.json` — a *capture*. `npm run wp:redirects` rewrites it,
  so anything hand-added is lost.

`scripts/aws-build-cf-function.mjs` merges both into the CloudFront redirect
table. It skips a redirect whose source is still a real page, fails the build on
redirect chains, and is capped at 10KB of function source.

---

## Before you finish

After any change to the content pipeline:

```
npm run build && npm run wp:audit && npm run wp:audit-links
npm run wp:verify-dist
```

The audits crawl a preview server and check what pages link to. Only
`wp:verify-dist` catches a reference that resolves locally today and 404s once
media stops being deployed.

`npm run build` runs `astro check` first — keep it at zero errors.

---

## Things that will bite you

- **`.wp-cache/` holds a live WordPress session cookie.** Gitignored — never
  commit it. Run `npm run wp:check-session` before any `wp:*` mirroring run; a
  stale cookie does not fail loudly, it mirrors login pages instead.
- **`LIMIT=n npm run wp:posts` deliberately skips writing `wp-posts.json`.** That
  file is the route index and is rebuilt from scratch, so a partial run would
  delete blog routes. Restore with `ONLY_MISSING=1 npm run wp:posts`.
- **New posts publish new images.** They are not in the S3 bucket and the build
  will not warn you. Run `npm run wp:blog-media-sync`, then
  `aws s3 sync … --size-only`, then build.
- **`MEDIA_ORIGIN` must never point at the WordPress host.** Preprod serves
  `Disallow: /`, so blog images hosted there would be uncrawlable.
- **The apex is canonical; `www` is a redirect and must stay one.** Never delete
  the `www` DNS record.
- **`NOINDEX=1` on every preview deploy.** It is opt-*out* on purpose.
- **Analytics are ungated and unannounced by decision, not by accident.** See
  `CLAUDE.md` before changing anything in `Analytics.astro`.
- **Never add a form field that HubSpot's collected-form allowlist does not
  contain.** The API answers `200 OK` and silently drops it. Run
  `npm run hs:check`.
