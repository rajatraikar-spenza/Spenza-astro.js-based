# Blog consolidation programme

What we are doing to the blog, why, and how to execute a single merge without
breaking the site.

---

## 1. The goal

The blog has **264 published posts**. A content audit (decision workbook dated
8 September 2026, plus the rendered summary at
`https://spenzasitearchitecture.vercel.app/`) found that a large share of them
compete with each other for the same queries, and proposes reducing them to
**175 retained posts** organised under **seven topic hubs**.

The reduction comes from **88 donor posts merged into 44 destinations**, plus one
published deletion and five unpublished junk records.

This is not a cleanup for its own sake. Five posts each half-answering "how do I
launch an MVNO in the US" split the ranking signal five ways and give a reader
five partial answers. One post that answers it properly ranks better and
converts better.

### The seven hubs

| Hub | Pillar | Commercial page | Posts now → retained |
| :-- | :----- | :-------------- | :------------------- |
| H1 MVNO & MVNE | `/mvno/mvno/` | `/mvne/` | 64 → 40 |
| H2 IoT Connectivity & CMP | `/telecom/iot-connectivity-types-guide-2025/` | `/iot-solutions/` | 80 → 53 |
| H3 eSIM & Provisioning | `/esim/esim/` | `/connected-devices/` | 28 → 15 |
| H4 Telecom Spend & Revenue Assurance | `/tem/what-is-telecom-expense-management-tem/` | `/connectivity-revenue-optimization/` | 21 → 13 |
| H5 AI Voice & Phone Numbers | `/telecom/why-ai-agents-need-real-phone-numbers/` | `/ai-phone-number/` | 13 → 11 |
| H6 Enterprise Mobility & BYOD | `/byod/byod-in-2025-benefits-risks-and-best-practices/` | `/contact-us/` | 20 → 14 |
| H7 Reseller & Embedded Connectivity | `/telecom/white-label-telecom-reseller-guide/` | `/mvne/` | 38 → 29 |

Work happens on the **`blog-automation`** branch.

---

## 2. What a blog post actually is here

Read this before touching anything. Posts are **not** files in this repo.

- Post content comes from WordPress over WPGraphQL, through the Content Layer
  loader at `src/loaders/wp-posts.mjs`. Query it with `getCollection('posts')`;
  the schema is in `src/content.config.ts`.
- The URL is `/<category>/<slug>/`, and `category` is **the first segment of the
  WordPress permalink**, not the taxonomy term (`wp-posts.mjs:325-328`). Routes
  are generated in `src/pages/[category]/[slug].astro`.
- The page is rendered by `src/layouts/ArticleLayout.astro`, which fills
  `src/partials/post-shell.html` — the real Elementor single-post template with
  its data-bearing widgets replaced by `<!--SLOT:name-->` markers. That is what
  gives visual parity; hand-authored markup would not match the mirrored CSS.
- **The TL;DR block at the top of every post is not in the body.** It comes from
  ACF fields (`tldr_heading`, `2_col`, `1_col`) rendered above the article,
  supplied by `src/data/wp-acf-blocks.json` and rendered by
  `src/lib/acf-blocks.ts`. Merging an article means merging its TL;DR too, and
  entering the result into the ACF fields in WordPress — not into the body, or it
  renders twice.
- Body content is **Gutenberg block HTML** (`wp-block-paragraph`,
  `wp-block-heading`, `wp-block-list`). Author merged bodies in that shape.
- Post bodies never pass through `partial-rewrites-plugin.mjs`. Anything that
  rewrites post markup belongs in `scripts/lib/html-perf.mjs`.

Consequence: **you cannot merge two posts by editing this repo.** The content
lives in WordPress. This repo owns the *routing*, the *redirects* and the
*preview*.

---

## 3. Previewing a merge before committing to it

A row in a spreadsheet is not something a marketing team can sign off. Render
the proposal as the real page instead.

```
/preview/merged/<slug>/
```

- Route: `src/pages/preview/merged/[slug].astro`
- Manifest: `src/data/merge-previews/index.ts`
- Merged body: `src/data/merge-previews/<slug>.html`

It renders through the real `ArticleLayout`, so the preview has the same chrome,
CSS bundle, breadcrumbs, TL;DR band, sidebar TOC and related-posts grid as a
live post. `ArticleLayout` reads `post.data` and never calls `post.render()`, so
a plain object with the collection's shape is enough — nothing is written to
WordPress and nothing enters the `posts` collection.

Safe by construction: `/preview/` is already excluded from the sitemap
(`astro.config.mjs`), and the manifest's authored `seo.fullHead` carries
`noindex, nofollow` rather than inheriting the destination's Yoast canonical.

**To add a cluster:** write `src/data/merge-previews/<slug>.html`, add one entry
to the manifest (donors, word counts, cluster name, merged `templateBlocks`), and
the route picks it up. No other change.

A worked example is `launch-mvno-us-guide` — five posts, 13,063 words in, 4,665
words out.

---

## 4. Editorial rules for a merge

The workbook gives per-donor "content to preserve" and "content to remove"
columns. Follow them, and follow these:

- **Fold in, do not append.** If a donor's section restates something the
  destination already covers, merge the two into one better section. A merged
  article that is the concatenation of its donors is a worse article than any of
  them.
- **Keep what only the donor had.** That is the entire justification for the
  merge preserving the donors' ranking signal. In the US MVNO cluster this was
  market dynamics, the niche opportunity table, the launch checklist, unit
  economics and one customer story.
- **Remove what the workbook flags.** Usually duplicate step lists, "why now"
  hype, and unqualified guarantees.
- **Expect the merged article to be shorter than the sum.** Five posts at 13,063
  words became one at 4,665. If yours is longer than the sum of its parts, you
  appended.
- **Preserve citations and figures verbatim** from the originals. Do not
  paraphrase a statistic, and do not invent one.
- **Fix internal links.** Donors are frequently linked from other posts, and the
  destination often links to a donor. The US MVNO destination linked to
  `/telecom/what-is-mvno/`, itself a donor in another cluster.
- **Merge the TL;DR.** See §2.
- **Images: see [`blog-images.md`](./blog-images.md).** A merged article does not
  inherit its donors' pictures. Decide what the surviving article needs and make
  those, to the spec in that document.

---

## 5. Executing the merge for real

Three separate acts, in this order:

1. **WordPress** — publish the approved merged body on the destination post, and
   enter the merged TL;DR into its ACF fields.
2. **WordPress** — unpublish the donor posts. Their routes disappear from the
   collection on the next build.
3. **This repo** — add each `donor → destination` pair to
   `src/data/site-redirects.mjs`.

### Why `site-redirects.mjs` and not `wp-redirects.json`

`wp-redirects.json` is a *capture*. `npm run wp:redirects` rewrites it from
WordPress' own 301 table, so anything hand-added there is lost on the next run.
`site-redirects.mjs` holds this repo's own editorial decisions and survives.
One entry there reaches the CloudFront redirect table, the sitemap exclusion and
the HTML stand-ins.

### The guardrails already in place

`scripts/aws-build-cf-function.mjs` was written with these 44 merges in mind:

- **A redirect whose source is still a real page is skipped** (line 127). So
  adding redirects before unpublishing the donors breaks nothing — they simply
  do not activate yet.
- **Redirect chains fail the build** (the `chains` check). Donor A → B where B is
  later merged into C is caught rather than shipped.
- **The function is capped at 10KB** and the table was already 6.9KB before these
  merges. Adding 88 rules will likely breach it; the build fails with
  instructions (move the non-blog rules into the key-value store behind a prefix
  gate). Budget for this before doing the bulk of the 44.

### Verification

```
npm run build && npm run wp:audit && npm run wp:audit-links
npm run wp:verify-dist
```

The audits crawl a preview server and check what pages link to. Only
`wp:verify-dist` catches a reference that resolves locally today and 404s once
media stops being deployed.

---

## 6. Categories: a known architectural gap

The workbook also proposes **110 category reassignments**, and every one of them
says *"pin the permalink"* — the URL must not change.

This repo cannot express that today. `data.category` is simultaneously the URL
folder **and** what drives the category archive grouping
(`src/pages/category/[...category].astro`), the breadcrumb and the post meta
(`ArticleLayout.astro:94,261`). A post pinned at `/telecom/foo/` but reassigned
to IoT will keep appearing under Telecom.

Implementing category moves needs a second field — a hub or primary-category —
decoupled from the route. The schema already carries `categories[]` alongside the
singular `category`, which is the natural place to start.

Two new categories are also proposed (`/category/ai-voice/`,
`/category/reseller-connectivity/`). Each needs a label in
`src/data/blog-categories.ts` **and** an archive partial at
`src/partials/archives/archive-category-<slug>.html`, or the archive route
throws by design.

Do not start this work as a side effect of a merge. It is its own change.

---

## 7. Source data

The workbook's 40 tabs. The ones that matter for this programme:

| Tab | What it holds |
| :-- | :------------ |
| MERGE PLAN | 88 donor → destination pairs, with content-to-preserve and content-to-remove |
| CANNIBALIZATION | 44 consolidation groups plus six explicit *do-not-merge* groups |
| HUB MAP | The seven hubs, pillars and commercial pages |
| HUB AND SPOKE | Retained-content map, 189 rows |
| UPDATE BRIEFS | Per-post editorial briefs (note: its columns are shifted by one, a merged-cell artefact) |
| CATEGORY MOVES | 110 reassignments, all permalink-pinned |
| DELETE CANDIDATES | One published, five unpublished |
| TOP 20 CHANGES | The execution order if only twenty things get done |
| NEW BLOGS | 14 proposed new articles, N01–N14 |
| INTERNAL LINKS | 193 specific link actions |

Six clusters are marked **do not merge**. Check CANNIBALIZATION before assuming
two similar posts should be combined.
