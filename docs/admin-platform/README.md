# spenza.com/admin: blog platform for the marketing team

One section, **Blog**. Marketing writes posts by hand or has the AI write them, edits either the same
way, and moves them **Draft → In review → Ready → Publish**. Login is GitHub: if you are on the repo you
are in, with no password. The page is reachable by URL only (not linked, not in the sitemap, `llms.txt`,
`robots.txt` or the HTML sitemap page; served `noindex`).

## How it fits together

```
marketing  ──►  spenza.com/admin  (Decap CMS, static files in public/admin)
                  │ sign in with GitHub ─► OAuth proxy (AWS Lambda, admin-api/oauth)
                  │                         checks push access to the repo BEFORE issuing a token
                  │
   manual post ───┤   writes src/content/cms-blog/<slug>.mdx (+ images in public/cms-media/)
                  │   on branch cms/blog/<slug> → a pull request  = the editorial workflow
                  │        Draft  = label decap-cms/draft
                  │        In review = decap-cms/pending_review      "Publish" = merge the PR
                  │        Ready  = decap-cms/pending_publish             │
                  │                                                       ▼
   AI post ───────┘   /admin/ai form ─► GitHub Action ai-blog.yml    push to main
                      (scripts/ai-blog) opens the SAME kind of PR        │
                                                                         ▼
                                              publish.yml builds + deploys (S3/CloudFront)
```

* **One collection, two sources.** `src/loaders/cms-posts.mjs` feeds admin posts into the same `posts`
  collection as the WordPress posts. Blog index, category/author archives, related cards, search and
  sitemap see them with no changes, and they render through `ArticleLayout` with the same markup as live
  posts (`scripts/lib/cms-post.mjs`, a port of the `spenza-blog` skill's builder: TL;DR cards, themed
  tables, FAQ accordion + FAQPage schema, the Contact Us Today button).
* **The 256 existing posts stay in WordPress.** This platform creates and edits new posts only.
* **An invalid post never breaks the deploy.** The build skips it with an error; the
  `cms-validate` workflow reports the same problems on the pull request first.
* A post dated in the future is held back until that day.

## Features

| | |
|---|---|
| Write | Title, slug, category (= URL), author, description, publish date, focus keyword, tags, hero + body image with alt text, TL;DR block (summary + 5 cards), FAQ list, markdown body (headings, tables, links) with a live preview |
| Generate with AI | Form at `/admin/ai`: title, description, author, category, keyword, must-cover points, links, images on/off. Shows recent runs |
| Edit AI posts | The AI result is an ordinary Draft: change text, cards, FAQ, swap images, then the normal workflow |
| Stages | Draft / In review / Ready (Decap's Workflow tab), Publish merges |
| Safety rails | Validation on every PR; AI score and council verdict recorded on the post; ≥91/100 and no blockers or the PR says so in bold |

## How the AI works (`scripts/ai-blog`)

`/admin/ai` → `workflow_dispatch` (with the editor's own token, so only repo writers can run it) →
`ai-blog.yml` → `node scripts/ai-blog/run.mjs`:

1. **Brain** (private; see below). Ranks the company knowledge notes against the brief. Material marked
   proposed, historical or meeting-reported is never shown to the writer; the rest is labelled with its status
   (unmarked = draft, unverified); anything with contact details, credentials or "confidential" is dropped.
2. **Research** (Claude `claude-opus-5-5`, web search + web fetch limited to spenza.com/docs.spenza.com):
   dated, sourced facts; verified Spenza product statements; verified internal links; the gap to beat.
3. **Draft** to a strict JSON schema in the Spenza layout. Facts come only from the research notes.
4. **Gate, up to 3 rounds:** structure rules → every link fetched (dead ones removed) → fact-check against
   the notes → **council**: five advisors (Contrarian, First Principles, Expansionist, Outsider, Executor)
   review independently, read each other anonymously, and a chairman scores with the 100-point rubric and
   reports where they agree, where they clash, the blind spots peer review caught, and the one fix to make
   first (all shown in the PR). **Pass = 91+ and zero P0.** Not passing after 3 rounds still produces a Draft.
4b. **Style pass** (stop-slop + humanizer rules). A lint quotes every em dash, throat-clearing phrase,
   "not X, it's Y" contrast, filler adverb and jargon term; a five-dimension score (directness, rhythm, trust,
   authenticity, density) must reach 40/50. Anything below is line-edited, and the edit is **rejected** unless
   every link, number, heading, table, card and FAQ survives, then fact-checked again and reverted if it
   introduced anything unsupported.
5. **Images** (OpenAI image API; `OPENAI_API_KEY`): the house style guide's own prompt blocks; the body
   image is generated *with the reference illustration attached*; a vision check (Claude) enforces the
   style checklist (palette, no infographic look, labels spelled exactly, nothing cropped) and regenerates
   up to 3 times; the hero panel is composed into the live cover template (logo, pills, Rhodium Libre
   title are never drawn by the model); WebP ≤200 KB.
6. **Files + proof.** Writes the entry, runs it through the site's own renderer, and the Action opens the PR.

Credits: the council follows the LLM Council method (github.com/aiwithremy/claude-skills-llm-council, no
license, so independently implemented); the writing rules adapt MIT-licensed stop-slop (Hardik Pandya) and
humanizer (blader), with their licenses in `scripts/ai-blog/assets/writing-rules/`.

The existing `spenza-blog` skill (Chrome + Codex desktop app + WordPress) is unchanged. It remains the way
to drive ChatGPT's own desktop app for images; the platform uses the API so it can run unattended.

## The brain is private, because this repository is public

The company library (Google Drive: Company Wiki, Product, Marketing) is internal, and every document in it is
still marked DRAFT with no named approver. So:

* **Nothing from it is committed here.** `docs/spenza-brain/` tracks only its README; a nested `.gitignore`
  hides local notes and `scripts/check-brain-private.mjs` fails any PR that tracks more (it runs in
  `cms-validate`).
* In CI the notes come from a **private repository** (`BRAIN_REPO` variable + `BRAIN_REPO_TOKEN` secret, checked
  out for the run only) or a **private endpoint** (`SPENZA_BRAIN_URL`/`TOKEN`). Export only 00 Company Wiki,
  01 Product and 04 Marketing; never Sales, Customers, Engineering or Operations. See `docs/spenza-brain/README.md`.
* The brain guides terminology and positioning. A product claim needs a `documented`/`approved` excerpt or a
  public Spenza page. Customers are never named.
* Draft pull requests, Action logs and the council report in a public repository are **public before the post
  is**. Either accept that, or move the repository to a private one.

## Go-live checklist (nothing below has been done)

1. **GitHub OAuth App + proxy:** `scripts/admin-oauth-deploy.sh` (creates the Lambda + URL), create the
   OAuth App with callback `<url>/callback`, re-run with the client id/secret, then set `base_url` in
   `public/admin/config.yml`.
2. **Repo secrets:** `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`; for the brain, variable `BRAIN_REPO` + secret
   `BRAIN_REPO_TOKEN` (or `SPENZA_BRAIN_URL`/`SPENZA_BRAIN_TOKEN`).
3. **Repo settings:** Actions → "Allow GitHub Actions to create and approve pull requests".
4. **Access:** marketing people need **write** access to the repo (that is the login rule). Because that
   also lets them push to `main`, turn on branch protection for `main`: require pull requests and
   "Require review from Code Owners". `.github/CODEOWNERS` leaves the content paths ownerless, so a content-
   only PR (what Publish merges) needs no developer, and code changes still do.
5. **Move the repo to `iSimplexityOrg`** (steps below), so access follows the team and not one person.
   Create the GitHub OAuth App under the organisation, not a personal account.
6. Merge, wait for the deploy, sign in at `https://spenza.com/admin/`.

## Moving the repo to iSimplexityOrg

The code in this branch already points at `iSimplexityOrg/Spenza-astro.js-based` (admin config, AI form,
OAuth proxy). Do the transfer **before** merging this PR.

1. **Transfer.** Settings → General → Danger Zone → Transfer ownership → `iSimplexityOrg` (same name unless you
   want to rename). You need admin on the repo and permission to create repositories in the org. Open PRs, issues,
   stars and the old URL (which redirects) come along. Then locally:
   `git remote set-url origin https://github.com/iSimplexityOrg/Spenza-astro.js-based.git`
2. **Check what survived.** Settings → Secrets and variables → Actions: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   and the variables `SITE_URL`, `WP_FORMS_ORIGIN` must still be there (re-add any that are missing; a missing AWS
   key stops every deploy). Then run **Actions → Publish → Run workflow** once and watch it go green.
3. **Fix the WordPress deploy hook.** `wordpress/mu-plugins/spenza-deploy-hook.php` hard-codes
   `SPENZA_DEPLOY_REPO` and uses a token tied to the personal account. Create a new fine-grained token with the
   **iSimplexityOrg** resource owner, access to this repo only, **Contents: read and write** (needed for
   repository_dispatch), update the constant to `iSimplexityOrg/Spenza-astro.js-based` in the installed plugin
   and the token in `wp-config.php`. Until then WordPress publishes no longer trigger a deploy; the 30-minute
   schedule still catches them. (The org may require approval for fine-grained tokens: Org settings → Personal
   access tokens.)
4. **Org access.** Add the marketing team as org members, put them in a team (e.g. `marketing`) with **Write** on
   this repo, and switch `.github/CODEOWNERS` from `@rajatraikar-spenza` to an engineering team.
5. **Protect main.** Settings → Rules: require a pull request and "Require review from Code Owners". The
   content paths have no owner, so Publish from the admin still merges without a developer.
6. **Org Actions policy.** Org settings → Actions: allow Actions for this repo, and under Workflow permissions
   tick "Allow GitHub Actions to create and approve pull requests" (the AI workflow opens its Draft PR that way).
7. **OAuth App.** Create it under the org (Org settings → Developer settings → OAuth Apps) so it is not tied to a
   person; then run `scripts/admin-oauth-deploy.sh`.
8. Anything else holding the old name: bookmarks, the Slack GitHub app, any other repo that calls this one.

## Not verified yet, and why

* **Real GitHub login and the Draft/Review/Ready board:** needs the OAuth App from step 1. Verified instead:
  the config loads in Decap, the editor and Workflow tab render, the OAuth proxy logic (7 tests), and the
  form's dispatch payload against the workflow's inputs.
* **A real AI run:** needs the API keys. Verified instead with a scripted model: the gates, revision loop,
  link stripping, image retry and that the output builds (11 tests).
* **Image quality from the live model:** the first real runs should be read by a person; tune
  `scripts/ai-blog/assets/image-style-guide.md` and `images.mjs` from what comes back.

## Decisions worth knowing

* **Login scope.** GitHub's OAuth for Decap needs the `repo` scope, which is broad for whoever signs in.
  The proxy only releases it to repo collaborators, and tokens live only in the editor's browser.
* **Why `.mdx`.** `publish.yml` ignores `**/*.md` pushes (so docs don't deploy). `.mdx` entries do deploy.
* **Authors** are limited to the three with `/author/<slug>/` pages (`src/data/cms-authors.json`); add the
  page and the entry to offer more.
* **Model.** `claude-opus-5-5` by default; override with `AI_BLOG_MODEL`.

## Local development

`npm run test:admin` (37 tests), `npm run cms:validate`, `astro dev` then
`http://localhost:4321/admin/index.html` (the dev server needs the `index.html`). To exercise the editor
without GitHub, point Decap at its in-memory `test-repo` backend with a temporary config.
