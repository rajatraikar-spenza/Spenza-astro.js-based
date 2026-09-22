---
name: blog-merge
description: Merge a cluster of competing Spenza blog posts into one article that ranks and gets cited, then render it as a reviewable preview. Use when consolidating posts from the content audit's merge plan, when asked to combine, dedupe or rewrite blog articles, or when a cluster from merge-plan.json needs building. Covers the six-phase research and writing process, the TL;DR block, images, and the redirect steps.
---

# Merging a blog cluster

Three files govern this work. Read them in order:

1. **[`docs/blog-editorial-standard.md`](../../../docs/blog-editorial-standard.md)**
   — the role, the goal, Spenza's context and ICPs, the article blueprint, and
   every writing, keyword and linking rule. **This is the quality bar. Do not
   start writing without it.**
2. **[`docs/blog-merges.md`](../../../docs/blog-merges.md)** — the programme,
   the hub map, and how a blog post works in this codebase.
3. **`src/data/merge-previews/merge-plan.json`** — the work queue: all 44
   clusters with donors, metrics, content-to-preserve, content-to-remove, the
   destination's editorial brief, and a `status`.

This file is the procedure.

---

## Before you start

- Work on the `blog-automation` branch.
- Take the **highest-priority cluster whose `status` is `pending`**, unless the
  user names one. Clusters carry an `id` (`M01` to `M44`); use it when talking
  to the user.
- Check the file's `doNotMerge` list first. Six groups look mergeable and are
  not: Google Fi, OSS/BSS, MVNO models, phone numbers and reputation, eSIM
  standards, and IoT selection vs cost vs migration.
- **One cluster per run.** Stop at Phase 4 for approval, then stop again when
  the preview is up. Never start a second cluster unprompted.

---

## Phase 1 — Audit the existing content

Fetch the destination and every donor. Work from the live site, not `dist/`,
unless the user says otherwise.

```bash
python3 - <<'PY'
import re, subprocess
POSTS = ['destination-slug', 'donor-1-slug']   # same folder assumed; adjust
FOLDER = 'mvno'
for slug in POSTS:
    h = subprocess.run(['curl','-sL','--max-time','25',
                        f'https://spenza.com/{FOLDER}/{slug}/'],
                       capture_output=True, text=True).stdout
    i = h.find('elementor-widget-theme-post-content')
    body = h[i:i+250000] if i > 0 else ''
    print(f'\n### {slug}  ~{len(re.sub(r"<[^>]+>"," ",body).split())} words')
    for lv, t in re.findall(r'<h([23])[^>]*>(.*?)</h\1>', body, re.S)[:25]:
        print('  h'+lv, re.sub(r'<[^>]+>','',t).strip()[:90])
PY
```

For each URL capture: H1, H2s, word count, unique facts and examples, current
internal links, outdated or unsupported claims, and the passages most likely to
earn AI citations (definitions, tables, step lists).

Also pull the TL;DR blocks, which are **not** in the body:

```bash
python3 -c "
import json; d=json.load(open('src/data/wp-acf-blocks.json'))
for k in ['destination-slug','donor-1-slug']: print(k, json.dumps(d.get(k), indent=1)[:2000])"
```

**Output: Merge Map** — one row per source section:

| Source URL | Section or asset | Decision (Keep / Rewrite / Merge into X / Drop) | Reason |

Prioritise Keep for passages on URLs with **Google AI impressions or Bing
citations** — those are already being cited, and the citations transfer with the
content.

## Phase 2 — SERP and AI answer research

Search the primary keyword and 3 to 5 long-tail variants. Record for the top 10
organic results: URL, content type, angle, depth, what it does best, what it
misses. Record SERP features: featured snippet and its format, every People Also
Ask question, AI Overview (present, sources cited, where it is thin or wrong).
Where possible, check how ChatGPT Search, Perplexity and Gemini answer the main
question and which sources they cite.

Decide the dominant intent and the format Google already rewards. Match that
format, then beat it.

**If you cannot search the web, say so plainly and continue.** Mark the SERP
table "not measured" rather than inventing it. See §11 of the standard.

**Output:** SERP table, intent verdict, and "What it takes to be #1" in three
bullets.

## Phase 3 — Gap, information gain and semantic map

- **Gap table:** | Subtopic or question | Covered by top 3? | Covered by Spenza
  sources? | Gap | How we win |
- **Information gain:** 3 to 5 elements this page will have that no top-10
  result has. Tie each to available evidence. Where evidence is missing, insert
  `[EVIDENCE NEEDED: what, from whom]` rather than inventing it.
- **Semantic map:** core entity, related entities (standards, technologies,
  organizations, roles, metrics), attributes and relationships.
- **Fan-out questions:** 10 to 15 sub-questions an AI system would generate from
  the primary query. The article must answer each in a sentence that stands
  alone.
- **Long-tail set:** 8 to 12 question and modifier variants, each mapped to an
  H2, H3 or FAQ.

## Phase 4 — Metadata, outline, and STOP

Produce **Output A** (metadata) and **Output C** (outline) per §10 of the
standard, then **stop and wait for approval.** Do not write the article yet.

Give the user: the cluster id and why you picked it, the Merge Map, the SERP
verdict, the information-gain list, the outline, and anything you could not
resolve.

## Phase 5 — Write

Follow the blueprint in §4 of the standard and every rule in §5 to §9.

The ones most often missed:

- **2,000 to 3,000 words.** Shorter than the sum of the sources is the point.
- **No em dashes or en dashes.** Commas, colons, periods, and "to" for ranges.
- **Every H2 opens with a 40 to 60 word answer that names the entity**, so it
  can be lifted into an AI answer without the sentence before it.
- **At least one SPENZA FIELD NOTE**, and something in the article an LLM could
  not write without talking to Spenza.
- **Never link a donor URL** — it is about to redirect.
- **Keep the destination's strong H2 wording and anchor IDs** where they still
  fit, so existing jump links and citations survive.
- Approved customers only: Butlr, RocketPhone, Angel Watch, Daito, IMZ. Never
  invent a metric for any of them.

### Where the file goes

Author the merged body at
`src/data/merge-previews/<destination-slug>.html` as **Gutenberg-shaped HTML**
(`wp-block-paragraph`, `wp-block-heading`, `wp-block-list`), because that is
what the preview harness renders and what WordPress will receive. Hoist a single
`<style>` block rather than repeating table CSS per table.

Merge the **TL;DR** into the manifest's `templateBlocks`: `tldrHeading`,
`tldrDescription`, four `twoCol` cards and one `oneCol` closing card. Each card
takes a theme the donors repeated, not one donor's card copied over. On publish
it goes into the ACF fields in WordPress, **not** the post body, or it renders
twice.

### Images

Follow the [`blog-images`](../blog-images/SKILL.md) skill. Its first rule
applies here: **inventory the destination's and donors' existing images before
writing a single prompt.** A merged article does not inherit its donors'
pictures, but it often does not need new ones either.

## Phase 6 — Register, verify, and STOP again

Add one entry to `src/data/merge-previews/index.ts` (slug, category, cluster,
titles, SEO, featured image, dates, author, `destinationWords`, donors with
clicks and contribution, `content`, `templateBlocks`). Set the cluster's
`status` to `preview` in `merge-plan.json`.

```bash
npx astro check                      # must be 0 errors
curl -s http://localhost:4321/preview/merged/<slug>/ | head -c 400
```

Then check the page:

- [ ] TL;DR band renders with all five cards and their icons
- [ ] No `<!--SLOT:` markers left in the output
- [ ] Breadcrumb, author box and related-posts grid present
- [ ] Tables render and scroll at narrow widths
- [ ] Images load; `<picture>` serves WebP
- [ ] `<meta name="robots" content="noindex, nofollow">` present
- [ ] Sidebar TOC lists the merged sections

**Schema is a delta, not a document.** Yoast already emits Article, WebPage,
BreadcrumbList, Organization and Person on every post. Do not author a second
graph. Output F states only what the merge makes stale (`wordCount`,
`dateModified`, `headline`, `keywords`), plus `FAQPage` if the FAQ is visible.
See §12 of the standard.

Run the **QA scorecard** (§10 of the standard). Fix anything below 8 before
reporting. Report word count, em/en dash count, internal link count and external
source count as measured numbers, not claims.

### Report

Give the user: the preview URL, before/after word counts, what you folded in and
what you dropped, the reuse-versus-generate decision for every image, prompts
for any slot still needing one, Outputs A, E, F and G, every `[EVIDENCE NEEDED]`
and `[VERIFY]`, and anything unresolved.

**Then stop.** On approval, set `status` to `approved` and ask whether to
continue.

---

## Do not execute the merge

The merge itself is three acts and none belong to this skill:

1. Publish the merged body and TL;DR on the destination **in WordPress**.
2. Unpublish the donors **in WordPress**.
3. Add each `donor → destination` pair to `src/data/site-redirects.mjs` — never
   to `wp-redirects.json`, which `wp:redirects` overwrites.

Hand those back with the Redirect Map and the Inbound Link Plan.

## Never

- Run `npm run wp:content` or `npm run wp:resync`. They overwrite
  `src/partials/**` from WordPress and would discard everything since the
  import.
- Merge a cluster in the `doNotMerge` list.
- Do two clusters in one run.
- Change a post's slug or category as a side effect of a merge. Category moves
  are a separate change with a known blocker — `docs/blog-merges.md` §6.
- Invent a statistic, customer, quote, price, benchmark or certification. Use
  `[EVIDENCE NEEDED: …]`.
- Promise a ranking, a citation, or a guaranteed saving.
- Score Spenza 10/10 against a competitor.
