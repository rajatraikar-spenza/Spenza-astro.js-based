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
| Write | Title, slug, category (= URL), author, description, publish date, focus keyword, tags, SEO title, hero + body image with alt text, TL;DR block (summary + 5 cards), FAQ list, rich-text or markdown body, side-by-side preview |
| Body blocks | The **+** menu in the body adds an **Image** (alt text and caption), a **Video** (YouTube, Vimeo or Loom), a **Button** and a **Callout** (note, tip, warning). Tables, links, headings and lists are in the toolbar |
| Settings | **Authors** (name, role, bio, photo, LinkedIn), **Categories** (name, URL, intro) and **Tags** are edited under Settings and chosen from lists on a post. A new author, category or tag gets its own page |
| Images | Uploads are converted to WebP, at most 1600px wide and 200 KB, by a workflow on the editor's pull request |
| Stages | Draft / In review / Ready (Decap's Workflow tab); Publish merges |
| Safety rails | Validation on every PR (`scripts/cms-validate.mjs`): required fields, alt text, links, unknown tags/authors, a category that would shadow an existing page |

### Body blocks, in the file

Each block is one line of text, so a post stays readable in a pull request. The editor writes them; the
renderer (`scripts/lib/cms-post.mjs`) turns them into HTML.

```
[[image src="/cms-media/my-post/diagram.webp" alt="What it shows" caption="Optional"]]
[[embed url="https://www.youtube.com/watch?v=VIDEOID" title="Optional"]]
[[button text="Book a demo" url="https://spenza.com/contact-us/"]]
[[callout type="tip" title="Optional" text="One or two sentences. **Bold** and links work."]]
```

Only https YouTube, Vimeo and Loom links are accepted as videos (they load from the privacy-friendly
player domains, lazily). A button link must start with `https://`, `/` or `#`; an external one opens in a
new tab. A broken block is reported on the pull request, not published.

### Authors, categories and tags

* Stored in `src/content/cms-meta/*.json` and published like a post (they are a pull request too).
* **Categories** become the first part of every post URL (`/<category>/<post>/`) and an archive at
  `/category/<category>/`. A URL name that is already a page (`careers`, `faq`, ...) is rejected.
* **Tags** get an archive at `/tag/<tag>/` once a published post uses them.
* **Authors** get `/author/<name>/` once they have a post. The original three (isimplexity, sivasai, vinay)
  keep their WordPress-era pages.
* New archive pages reuse the category archive's look. The category filter row at the top still lists
  the original seven categories only.

### Images

`.github/workflows/cms-images.yml` runs on pull requests from the admin's `cms/...` branches that touch
`public/cms-media/`. It converts PNG/JPEG (and oversized WebP) to WebP, resizes to 1600px, steps quality
down until the file is under 200 KB, updates every reference, and commits to the same branch. The editor
sees the new file after reloading the post. Run it by hand with `npm run cms:images`.

## Go-live: creating the GitHub OAuth App

Nothing here has been done yet. It takes about 15 minutes and needs an AWS login that can create Lambda
functions and IAM roles (the CI deploy user cannot) and a GitHub account that owns the repo.

1. **Deploy the sign-in proxy (phase 1).** On your computer, with AWS credentials for account
   795394911966 and the `aws`, `zip`, `node` and `openssl` commands available:
   `scripts/admin-oauth-deploy.sh`. It creates a small Lambda and a public URL, and prints the URL,
   like `https://abc123.lambda-url.us-east-1.on.aws`. Copy it.
2. **Create the OAuth App on GitHub.** GitHub, top right, your photo > **Settings** > **Developer settings**
   > **OAuth Apps** > **New OAuth App** (for an organisation instead: the organisation's Settings >
   Developer settings). Fill in:
   * Application name: `Spenza Admin`
   * Homepage URL: `https://spenza.com`
   * Authorization callback URL: the URL from step 1 followed by `/callback`,
     e.g. `https://abc123.lambda-url.us-east-1.on.aws/callback`
   * Leave "Enable Device Flow" off. Click **Register application**.
3. **Create the secret.** On the app's page click **Generate a new client secret**. Copy the Client ID and
   the secret now (the secret is shown once). Do not paste them anywhere public or into the repo.
4. **Give them to the proxy (phase 2).** Run
   `GITHUB_CLIENT_ID=<id> GITHUB_CLIENT_SECRET=<secret> scripts/admin-oauth-deploy.sh`.
   They are stored only as the Lambda's settings.
5. **Point the admin at it.** In `public/admin/config.yml` replace `https://REPLACE-WITH-OAUTH-PROXY-URL`
   with the step 1 URL (no trailing slash). Commit it to the PR branch.
6. **Add the marketing team to the repo.** GitHub repo > **Settings** > **Collaborators** > **Add people**,
   role **Write**. Each person needs a GitHub account and must accept the invite. The proxy refuses anyone
   without write access, so this is the whole access list. (Moving the repo into the organisation later
   makes this a team instead of a list of people.)
7. **Protect `main`.** Repo > Settings > Branches > Add rule for `main`: require a pull request and
   **Require review from Code Owners**. Content-only pull requests then need no developer, but code
   changes still need you. Without this, anyone with write access could push straight to `main`.
8. **Merge and deploy.** Merge the pull request (your approval) and wait for the site deploy.
9. **Try it.** Open `https://spenza.com/admin/`, click **Login with GitHub**, approve the app. Create a
   test post, move it Draft > In review > Ready, check the pull request on GitHub, then close it
   without publishing.

If sign-in fails: a popup that closes with "not authorised" means the account lacks write access (step 6);
"redirect_uri mismatch" means the callback URL in step 2 differs from the proxy URL; the Lambda's logs in
CloudWatch (`/aws/lambda/spenza-admin-oauth`) say which.

## Not verified yet, and why

* **Real GitHub login and the Draft/Review/Ready board:** needs the OAuth App above. Verified instead:
  the config loads in Decap, the editor, relation pickers, the + menu blocks and Workflow tab render
  against Decap's in-memory test backend, and the OAuth proxy logic (7 tests).
* **The image workflow on GitHub:** the converter is tested; the workflow itself first runs on a real
  editor pull request.

## Decisions worth knowing

* **Login scope.** GitHub's OAuth for Decap needs the `repo` scope, which is broad for whoever signs in.
  The proxy only releases it to repo collaborators, and tokens live only in the editor's browser.
* **Why `.mdx`.** `publish.yml` ignores `**/*.md` pushes (so docs don't deploy). `.mdx` entries do deploy.
* **The AI generator was removed** (it is in git history, commit `1eb16e9` and earlier on this branch) in
  favour of an all-manual flow.

## Local development

`npm run test:admin`, `npm run cms:validate`, `astro dev` then
`http://localhost:4321/admin/index.html` (the dev server needs the `index.html`). To exercise the editor
without GitHub, point Decap at its in-memory `test-repo` backend with a temporary config.
