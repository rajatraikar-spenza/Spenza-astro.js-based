# spenza.com/admin: blog platform for the marketing team

One section, **Blog**. Marketing writes posts by hand and moves them **Draft → In review → Ready →
Publish**. Login is GitHub: if you are on the repo you are in, with no password. The page is reachable
by URL only (not linked, not in the sitemap, `llms.txt`, `robots.txt` or the HTML sitemap page; served
`noindex`). There is no AI generation: everything is written manually.

## How it fits together

```
marketing  ──►  spenza.com/admin  (Decap CMS, static files in public/admin)
                  │ sign in with GitHub ─► OAuth proxy (AWS Lambda, admin-api/oauth)
                  │                         checks push access to the repo BEFORE issuing a token
                  │
                  │   writes src/content/cms-blog/<slug>.mdx (+ images in public/cms-media/)
                  │   on branch cms/blog/<slug> → a pull request  = the editorial workflow
                  │        Draft  = label decap-cms/draft
                  │        In review = decap-cms/pending_review      "Publish" = merge the PR
                  │        Ready  = decap-cms/pending_publish             │
                  │                                                       ▼
                  │                                                  push to main
                  │                                                       ▼
                                              publish.yml builds + deploys (S3/CloudFront)
```

* **One collection, two sources.** `src/loaders/cms-posts.mjs` feeds admin posts into the same `posts`
  collection as the WordPress posts. Blog index, category/author archives, related cards, search and
  sitemap see them with no changes, and they render through `ArticleLayout` with the same markup as live
  posts (`scripts/lib/cms-post.mjs`: TL;DR cards, themed tables, FAQ accordion + FAQPage schema, the
  Contact Us Today button).
* **The 256 existing posts are still in WordPress** until they are migrated; this platform creates and
  edits admin posts only.
* **An invalid post never breaks the deploy.** The build skips it with an error; the
  `cms-validate` workflow reports the same problems on the pull request first.
* A post dated in the future is held back until that day.

## Features

| | |
|---|---|
| Write | Title, slug, category (= URL), author, description, publish date, focus keyword, tags, hero + body image with alt text, TL;DR block (summary + 5 cards), FAQ list, markdown body (headings, tables, links) with a live preview |
| Stages | Draft / In review / Ready (Decap's Workflow tab); Publish merges |
| Safety rails | Validation on every PR (`scripts/cms-validate.mjs`) |

## Go-live checklist (nothing below has been done)

1. **GitHub OAuth App + proxy:** `scripts/admin-oauth-deploy.sh` (creates the Lambda + URL), create the
   OAuth App with callback `<url>/callback`, re-run with the client id/secret, then set `base_url` in
   `public/admin/config.yml`.
2. **Access:** marketing people need **write** access to the repo (that is the login rule). Because that
   also lets them push to `main`, turn on branch protection for `main`: require pull requests and
   "Require review from Code Owners". `.github/CODEOWNERS` leaves the content paths ownerless, so a content-
   only PR (what Publish merges) needs no developer, and code changes still do.
3. Merge, wait for the deploy, sign in at `https://spenza.com/admin/`.

## Not verified yet, and why

* **Real GitHub login and the Draft/Review/Ready board:** needs the OAuth App from step 1. Verified instead:
  the config loads in Decap, the editor and Workflow tab render, and the OAuth proxy logic (7 tests).

## Decisions worth knowing

* **Login scope.** GitHub's OAuth for Decap needs the `repo` scope, which is broad for whoever signs in.
  The proxy only releases it to repo collaborators, and tokens live only in the editor's browser.
* **Why `.mdx`.** `publish.yml` ignores `**/*.md` pushes (so docs don't deploy). `.mdx` entries do deploy.
* **Authors** are limited to the three with `/author/<slug>/` pages (`src/data/cms-authors.json`); add the
  page and the entry to offer more.
* **The AI generator was removed** (it is in git history, commit `1eb16e9` and earlier on this branch) in
  favour of an all-manual flow.

## Local development

`npm run test:admin`, `npm run cms:validate`, `astro dev` then
`http://localhost:4321/admin/index.html` (the dev server needs the `index.html`). To exercise the editor
without GitHub, point Decap at its in-memory `test-repo` backend with a temporary config.
