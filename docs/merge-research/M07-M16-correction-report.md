# M07 and M16 correction report

September 23, 2026. Scope: these two existing previews only. No new cluster, WordPress write, redirect, unpublication, slug/category change or push.

## Images

Reused media now references its published CDN URL with the live responsive markup. Six local copied/re-encoded or superseded derivative files were removed; they were untracked, so git has no tracked deletion for them. Only genuinely new artwork remains local. The existing featured template is reused, not regenerated.

- [Complete inventory](M07-M16-image-inventory.md): all 37 featured/body candidates from nine live source pages, each inspected and given a keep/reject reason, plus five previously generated local candidates.
- [Raw live capture](M07-M16-image-reaudit.json): source URLs, successful fetches, exact image attributes and markup; related-post thumbnails listed separately and excluded from the article inventory.
- [Four ChatGPT prompts](M07-M16-image-prompts.md): two missing body slots for each article. Fixed preamble, explicit composition, exact labels for the second typography stage, placement, filenames and alt text.
- Both previews currently contain one featured image, one body image and two visible pending-artwork placeholders. Planned total is four images each. No image was generated during these corrections. The image requirement remains incomplete until artwork is supplied and verified.

## Information gain

**7/10, hold for both articles.** I cannot raise this honestly with the available evidence. [The evidence checklist](M07-M16-evidence-hold.md) maps every current marker and the earlier research variants to precise records, approvals and owners. It separates user-supplied operational evidence from the still-unmeasured SERP/AI comparison work. E-E-A-T remains at 7 until the named technical/specialist reviews and customer approvals are completed. These are review artifacts, not publication-ready outputs.

## Why the shared layout changed

`ArticleLayout.astro` owns the displayed reading time, so I added an optional `readingWordCount` prop that the preview supplies after counting body and ACF text with parse5. Existing live callers omit it and retain the previous calculation; the correction also adds an optional preview-only featured markup override to preserve the captured CDN srcset without changing the normal live-image renderer.

## Why the articles had only one body image

I removed obsolete, repetitive or unsupported images but failed to replace the resulting gaps, and treated the editorial document's lower image count as sufficient without reconciling the image skill. That was an incomplete image pass; the new inventory and four explicit slots make the outstanding work visible rather than declaring the images complete.

## Commits

| Commit | Logical change |
| :--- | :--- |
| `1c7cb10` | M07 rewrite, FAQ treatment and published image reference |
| `2c9cfea` | M16 rewrite, FAQ treatment and optimized genuinely new process figure |
| `06a32a3` | Preview manifest/registration and published featured media |
| `35ba94a` | parse5 reading-text helper, preview counts and optional layout overrides |
| `048e5af` | Four visible pending-image slots |

The research artifacts, current inventories, prompts, evidence hold, schema deltas and QA records are committed as a separate research change after verification. `parse5` and its lockfile were already committed in `6bd754c`; there was no uncommitted dependency change to manufacture. Nothing was pushed.

## Verification

- [Current text counts](M07-M16-correction-counts.json): M07 2,649 and M16 2,675 words, including ACF TL;DR and all collapsed FAQ answers. Both have zero em dashes, en dashes and checked banned phrases. Editorial placeholders and review notes are excluded.
- [Current browser results](M07-M16-correction-browser-qa.json): both built previews return 200; all four actual article images load. Reused image `src`, `srcset` and `sizes` exactly match the fresh live captures. Two pending slots per preview; mobile slot styling visually inspected.
- Six FAQs per article: click, Enter, Space, close-other behavior and JavaScript-disabled expansion pass. Plus/minus styling is retained. Mobile width is 390px with no document overflow; tables scroll within their containers. No browser JavaScript errors.
- Both previews remain `noindex, nofollow`, with zero JSON-LD and no canonical. Output F remains a delta against the existing Yoast graph; its image instructions now retain the original ImageObject and published hero.
- Required CSS optimization completed. It regenerated unrelated global bundles and removed five mapping entries, so only those optimizer-created changes were restored to their clean baseline. The new preview styles are inline and were confirmed in the built render.
- `MEDIA_ORIGIN=https://media.spenza.com NOINDEX=1 npm run build` passed with 910 pages. Asset audit: zero broken references across 487 pages. Distribution verification: zero missing and zero stranded media.
- Final `npx astro check`: **0 errors, 0 warnings, 72 hints across 329 files**.
- Link audit: one pre-existing malformed link, `/mvno/resell-data-plans-shopify/]/`, on `/mvno/msp-reselling-connectivity-with-hardware/`. It is outside these previews and was not changed. This audit is not reported as a clean pass.

The September 22 Phase 6 reports remain historical records and carry a supersession notice. Their earlier local-copy, completed-image and upload assertions do not describe the corrected state.
