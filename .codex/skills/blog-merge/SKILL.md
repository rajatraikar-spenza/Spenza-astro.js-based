---
name: blog-merge
description: Merge a cluster of competing Spenza blog posts into one article and render it as a reviewable preview. Use when consolidating posts from the content audit's merge plan, when asked to combine or dedupe blog articles, or when a cluster from CANNIBALIZATION / MERGE PLAN needs building. Covers the editorial merge, the TL;DR block, images, and the redirect steps.
---

# Merging a blog cluster

Read [`docs/blog-merges.md`](../../../docs/blog-merges.md) before your first
merge. It holds the programme, the hub map and the architecture. This file is
the procedure.

## Before you start

- Work on the `blog-automation` branch.
- **The work queue is `src/data/merge-previews/merge-plan.json`.** All 44
  clusters, ordered by priority, each with its destination, donors, per-donor
  metrics, content-to-preserve, content-to-remove, and a `status` field. You do
  not need the spreadsheet.
- Take the **highest-priority cluster whose `status` is `pending`**, unless the
  user names one.
- Confirm it is not in that file's `doNotMerge` list — six groups look
  mergeable and are not.
- The destination is the workbook's "Selected winner". Do not substitute your
  own judgement for it — it was chosen on clicks, AI impressions and citations.
- The destination **keeps its slug**. Donors redirect to it. Never move a post.

## Step 1 — Gather

Collect for the destination and every donor:

```bash
# headings, images and word count for each post in the cluster
python3 - <<'PY'
import re
for p in ['/mvno/DESTINATION/', '/mvno/DONOR-1/']:
    h = open('dist'+p+'index.html', encoding='utf8').read()
    i = h.find('elementor-widget-theme-post-content')
    j = h.find('<div class="elementor-widget-container">', i) + 39
    body = h[j:j+200000]
    print(p, len(re.sub(r'<[^>]+>',' ',body).split()), 'words')
    for lv, t in re.findall(r'<h([23])[^>]*>(.*?)</h\1>', body, re.S)[:25]:
        print('  h'+lv, re.sub(r'<[^>]+>','',t).strip()[:90])
PY
```

If `dist/` is stale, run `npm run build` first.

Also pull each post's TL;DR — it is **not** in the body:

```bash
python3 -c "
import json; d=json.load(open('src/data/wp-acf-blocks.json'))
for k in ['DESTINATION','DONOR-1','DONOR-2']:
    print(k, json.dumps(d.get(k), indent=1)[:2000])"
```

And read the cluster's entry in `merge-plan.json`. It carries each donor's
**contentToPreserve** and **contentToRemove** verbatim from the workbook, the
cluster's `preserve` note and `keyword`, and — on most clusters — a `brief` for
the destination: `recommendedTitle`, `requiredSections`, `evidenceToAdd`,
`internalLinks`, `primaryCta`, `secondaryCta`, `schema` and
`editorialInstruction`.

**Use `brief.requiredSections` as the merged article's section checklist**, and
`brief.primaryCta` / `brief.secondaryCta` as its calls to action — they are
chosen per hub and per buyer, not generic. `editorialInstruction` is usually
"preserve useful existing sections; these are final coverage requirements, not
an instruction to duplicate sections already present", which is exactly the
instruction not to append.

## Step 2 — Write the merged body

Author `src/data/merge-previews/<destination-slug>.html` as **Gutenberg-shaped
HTML**: `wp-block-paragraph`, `wp-block-heading`, `wp-block-list`. Match the
destination's existing markup conventions — open one in `dist/` and copy the
shape.

The quality bar, in order of how often it is missed:

1. **Fold in, do not append.** If a donor section restates something the
   destination covers, merge them into one better section. A merged article that
   reads as five articles stapled together is worse than any one of them.
2. **The result should be shorter than the sum.** The US MVNO cluster went from
   13,063 words across five posts to 4,565 in one. If yours is longer than the
   sum of its parts, you appended.
3. **Keep what only the donor had.** That is the entire justification for
   preserving the donors' ranking signal.
4. **Remove what the workbook flags** — usually duplicate step lists, "why now"
   hype, and unqualified guarantees.
5. **Preserve every citation and figure verbatim.** Never paraphrase a statistic
   and never invent one. If two donors disagree on a number, keep the
   destination's and flag the conflict in your summary.
6. **De-duplicate the CSS.** Donor articles each ship their own copy of the same
   `.responsive-table` block. Hoist one `<style>` to the top of the merged body.
7. **Fix internal links.** Donors are linked from other posts, and the
   destination often links to a donor — check whether any link target is itself
   being merged away in another cluster.

## Step 3 — Merge the TL;DR

The block above the article comes from ACF fields, not the body. Build a merged
`templateBlocks` in the manifest: `tldrHeading`, `tldrDescription`, four
`twoCol` cards and one `oneCol` closing card — the shape the template expects.

Each card should take a theme the donors repeated between them, not one donor's
card copied over. Reuse icon ids that already appear in the cluster's own cards;
`faGlyphStyles` inlines each codepoint per post, so any valid FA 6.5 name works,
but there is no reason to reach outside a proven set.

**On publish this goes into the ACF fields in WordPress, not the post body**, or
it renders twice.

## Step 4 — Images

Follow the [`blog-images`](../blog-images/SKILL.md) skill. In short: decide what
the surviving article needs — it does not inherit its donors' pictures — mark
the slots, and generate against `docs/blog-images.md`.

## Step 5 — Register the preview

Add one entry to `src/data/merge-previews/index.ts`: slug, category, cluster
name, titles, SEO, featured image, dates, author, `destinationWords`, the donor
list with clicks and what each contributes, `content`, and `templateBlocks`.
The route `src/pages/preview/merged/[slug].astro` picks it up automatically.

## Step 6 — Verify

```bash
npx astro check                      # must be 0 errors
astro dev --background
curl -s http://localhost:4321/preview/merged/<slug>/ | head -c 400
```

Then open `/preview/merged/<slug>/` and check:

- [ ] TL;DR band renders with all five cards and their icons
- [ ] No `<!--SLOT:` markers left in the output
- [ ] Breadcrumb, author box and related-posts grid all present
- [ ] Every table renders and scrolls on narrow widths
- [ ] Images load, and the `<picture>` serves WebP
- [ ] `<meta name="robots" content="noindex, nofollow">` is present
- [ ] The sidebar TOC lists the merged sections

## Step 7 — Report, do not execute

Stop here. Tell the user what merged, the before/after word counts, what you
dropped and why, and anything you could not resolve.

**Do not** perform the merge itself. That is three separate acts and none of
them belong to this skill:

1. Publish the merged body and TL;DR on the destination **in WordPress**.
2. Unpublish the donors **in WordPress**.
3. Add each `donor → destination` pair to `src/data/site-redirects.mjs` — never
   to `wp-redirects.json`, which `wp:redirects` overwrites.

## Never

- Run `npm run wp:content` or `npm run wp:resync`. They overwrite
  `src/partials/**` from WordPress and would discard everything since the
  import.
- Add redirects for a cluster the user has not approved.
- Change a post's category or slug as a side effect of a merge. Category moves
  are a separate change with a known architectural blocker — see
  `docs/blog-merges.md` §6.
- Invent metrics, customer names or outcomes that are not already in the source
  articles.
