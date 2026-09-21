# Site issues log

Defects found on the live blog while working through the consolidation
programme. Each entry records what was measured, how, and whether it is being
fixed here or needs a decision.

Measured against the build of **21 September 2026** (264 posts). Re-run the
commands to refresh a count.

---

## 1. 89 posts render an empty TL;DR band

**Severity: high — visible on a third of the blog.**

The Elementor single-post template renders a "TL;DR / At-a-Glance Summary"
heading above the article, filled from ACF fields. On 89 of 259 posts the
heading is present and there are no cards behind it, so the page shows a
section title with nothing under it and two empty `elementor-shortcode`
wrappers.

```bash
python3 -c "
import json; d=json.load(open('src/data/wp-acf-blocks.json'))
e=[k for k,v in d.items() if (v.get('tldrHeading') or '').strip() and not (v.get('twoCol') or v.get('oneCol'))]
print(len(e), 'of', len(d)); print(e[:10])"
```

Examples: `how-to-top-up-your-spenza-account`, `tem`,
`future-of-iot-connectivity-2025`, `sell-devices-esims-shopify-spenza`,
`embedded-connectivity-reshaping-tech-2025`.

**Unresolved:** it is not yet established whether the fields are genuinely
empty in WordPress or whether the `wp-acf-blocks.json` snapshot missed them.
One look at a sample post in wp-admin settles it. If they are empty in
WordPress this is an editorial backlog; if the snapshot is at fault it is a
capture bug. **Do not** assume the second — the snapshot has a heading for
these posts, which suggests it read the record successfully.

Related but distinct: `CLAUDE.md` records that three widgets (`summary`,
`keyPoints`, `spenzaBlock`) render empty because WPGraphQL does not expose the
field they read. That is a different mechanism and does not explain this.

---

## 2. 290 internal links point at posts the merge plan removes

**Severity: high — becomes a real defect the moment merges ship.**

Across 104 posts, 290 in-body links point at one of the 88 donor URLs. Every
one becomes a 301 hop the day its donor is unpublished. The workbook's INTERNAL
LINKS tab already calls for this ("Replace donor links with the final winner"),
but the scale was not quantified.

Worst offenders — each link below is a future hop:

| Links | Donor | Destination |
| ----: | :---- | :---------- |
| 16 | `/telecom/integrated-connectivity-management/` | `/telecom/what-is-connectivity-management-platform-cmp/` |
| 10 | `/telecom/iot-connectivity-management-simplified/` | `/telecom/what-is-connectivity-management-platform-cmp/` |
| 9 | `/mvno/mvne-mvna-mno-to-launch-mvno/` | `/mvno/mno-mvno-mvne-mvna-roles/` |
| 9 | `/esim/what-is-remote-esim-provisioning/` | `/esim/what-is-remote-sim-provisioning-rsp-guide-2026/` |
| 9 | `/esim/iot-esim-connectivity/` | `/esim/iot-esim-introduction/` |

Post bodies come from WordPress, so these are fixed in WordPress, not here.
**Fix them in the same pass as each merge**, not afterwards — the article you
are already editing is usually one of the linkers.

---

## 3. The CloudFront redirect table will breach its 10KB cap

**Severity: high — blocks the bulk of the merge programme.**

A CloudFront Function is capped at 10,240 bytes of *source*, table and logic
together. `scripts/aws-build-cf-function.mjs` already fails the build when it
breaches, with instructions.

Measured today: 33 captured non-blog rules plus 7 repo-owned, roughly **2,627
bytes** of embedded table. The 88 merge redirects add roughly **5,456 bytes**,
taking the table alone to about **8.1KB** before the function's own logic.

The fix is documented in the script: move the non-blog rules into the
key-value store as well and gate them on a prefix list, or drop the gate and
look every path up. **Do this before landing merge redirects in bulk**, not
when the build starts failing.

---

## 4. 144 body images have no alt text

**Severity: medium — accessibility and image search.**

144 of 1,742 in-body images across 264 posts have an absent or empty `alt`
attribute (8%). Rules for writing them are in
[`blog-images.md`](./blog-images.md) §8: state the takeaway, not the
appearance, under 125 characters.

```bash
python3 -c "
import re,glob
m=t=0
for p in glob.glob('dist/*/*/index.html'):
    if '/category/' in p or '/author/' in p: continue
    h=open(p,encoding='utf8').read(); i=h.find('elementor-widget-theme-post-content')
    if i<0: continue
    for im in re.findall(r'<img[^>]*>', h[i:i+250000]):
        if 'logo' in im.lower(): continue
        t+=1
        a=re.search(r'\balt=\"([^\"]*)\"', im)
        if not a or not a.group(1).strip(): m+=1
print(m,'of',t)"
```

---

## 5. 1.3MB of duplicated inline CSS inside post bodies

**Severity: medium — page weight, paid on every article view.**

Post bodies carry **1,313KB** of inline `<style>` in total, and **119 posts**
repeat the same `.responsive-table` rule block more than once — once per table.
`/mvno/launch-mvno-us-guide/` ships it **ten times**; `/iot/iot-devices-buyers-guide/`
carries 14KB of it.

This is authoring habit in WordPress, not a pipeline bug: each table is pasted
with its own copy of the styling. The merged articles in
`src/data/merge-previews/` hoist a single `<style>` block instead, which is the
pattern to carry back into WordPress as posts get rewritten.

A build-time fix would belong in `scripts/lib/html-perf.mjs`, which both the
mirrored and headless paths call — **not** in `partial-rewrites-plugin.mjs`,
which post bodies never pass through.

---

## 6. 21 posts have a slug year that disagrees with the title year

**Severity: cosmetic. Do not "fix" it.**

21 posts carry one year in the permalink and a different one in the title, e.g.
`/mvno/white-label-mvno-launch-guide-2025/` titled "White Label MVNO Launch
Guide **2026**". The posts were published in one year and their titles
refreshed for the next, which is correct SEO practice.

**Renaming the slug to match would be a mistake.** The slug is the canonical
URL and the target of inbound links; changing it orphans every backlink for a
cosmetic gain. The workbook agrees — its "Recommended title" for these posts is
byte-identical to the current title and it names the existing `-2025` URL as
the merge destination.

Recorded here so the mismatch is not rediscovered and "corrected" later.

---

## 7. Category archives cannot express the planned category moves

**Severity: architectural — blocks 110 planned reassignments.**

The workbook reassigns 110 posts to new primary categories while **pinning
every permalink**. This repo cannot express that: `data.category` is
simultaneously the URL folder and what drives archive grouping
(`src/pages/category/[...category].astro`), the breadcrumb and the post meta
(`ArticleLayout.astro:94,261`). A post pinned at `/telecom/foo/` but reassigned
to IoT keeps appearing under Telecom.

Needs a second field — a hub or primary category — decoupled from the route.
The schema already carries `categories[]` beside the singular `category`.

Two new categories are also proposed (`/category/ai-voice/`,
`/category/reseller-connectivity/`), and each needs a label in
`blog-categories.ts` **and** an archive partial, or the route throws by design.

Full detail in [`blog-merges.md`](./blog-merges.md) §6.

---

## 8. Body imagery is off-brand and carries no information

**Severity: medium — quality, and it compounds with every merge.**

The five posts in the US MVNO cluster carried 13 body images between them:
unbranded stock photography, three near-identical mind-map "visual selection"
exports, and screenshots at inconsistent widths. The destination opened with a
man in a suit beside a clip-art rocket, on a blue background the brand does not
use, at 3:2 against the site's 16:9.

Filenames are part of it — the blog is full of
`ChatGPT-Image-Sep-3-2026-04_29_14-PM.png`.

Standards and the failure catalogue are in [`blog-images.md`](./blog-images.md).
Fixed per-cluster as merges land; there is no bulk fix.

---

## Fixed during this work

- **`AGENTS.md` told agents not to edit `src/partials/**` or
  `src/data/wp-*.json`** because they are generated. They became source when the
  mirror became a one-time import, and `CLAUDE.md` says so. An agent following
  the old file would have refused correct edits or gone looking for
  `wp:content`/`wp:resync` — the two scripts that must never run. Rewritten.

- **Word counts included inline CSS.** Measuring prose by stripping tags counted
  the styling inside post bodies, which issue 5 shows is substantial. The US
  MVNO destination read as 4,039 words and is 3,444. The preview harness now
  strips style blocks and bare rule blocks before counting.
