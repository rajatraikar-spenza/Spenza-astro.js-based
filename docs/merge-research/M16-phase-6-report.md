# M16 Phase 6: reviewable preview and QA

> Historical September 22 report. The September 23 [image inventory](M07-M16-image-inventory.md), [four outstanding prompts](M07-M16-image-prompts.md), [evidence hold](M07-M16-evidence-hold.md) and correction verification supersede its image-count, local-copy, upload and completion statements. Both articles remain held at information gain 7.

Prepared September 22, 2026 after explicit approval of the Phase 4 outline. The user additionally requested the existing blog's expandable FAQ appearance and the same treatment for M07.

- M16: http://localhost:4321/preview/merged/launch-mvno-us-guide/
- M07 FAQ update: http://localhost:4321/preview/merged/white-label-mvno-launch-guide-2025/

M16 is registered as `preview`. M07 remains `preview`. No WordPress content, redirects, slugs, categories or publication state were changed. Stop here for review; no next cluster was started.

## Deliverables

| Output | Location |
| :--- | :--- |
| A: metadata | Approved [metadata and outline](M16-research-and-outline.md); final manifest `src/data/merge-previews/index.ts` |
| B: source and research | [Section Merge Map](M16-phase-1-audit.md), [source capture](M16-source-audit.json), [research](M16-research-and-outline.md) |
| C: approved outline | [Outline and word budgets](M16-research-and-outline.md) |
| D: article | `src/data/merge-previews/launch-mvno-us-guide.html` |
| E: link plan | Below and [complete donor inbound inventory](M16-donor-inbound-links.json) |
| F: schema delta | [Publish-time delta](M16-schema-delta.json); not inserted into preview |
| G: measured QA | This report, [counts](M16-qa-measurements.json), [browser checks for both previews](M16-M07-browser-qa.json), [internal link checks](M16-M07-link-checks.json) |

## Measured before and after

| Measure | Previous M16 preview | Rewritten M16 |
| :--- | ---: | ---: |
| Body words | 4,565 | 2,515 |
| Separate ACF TL;DR words | 283 | 160 |
| Total reading words | 4,848 | **2,675** |
| Em dashes, body plus TL;DR | 25 | **0** |
| En dashes, body plus TL;DR | 0 | **0** |
| Banned phrase matches | 1 (`unlock`) | **0** |

The same parse5 text-node/whitespace method was applied to original HEAD and final content. It includes headings, tables, callouts, captions, CTAs and all FAQ answers, even when collapsed. It excludes styles, scripts, editorial review notes, the author bio and source index. The user's 23 em dashes described the old body; the old TL;DR adds two. No typography was hidden from the count by collapsing answers.

Final reading text is 2,173 words shorter than the previous preview including its TL;DR. The five live source bodies contained 11,876 words. The destination's live body alone was 3,441 words, which the preview banner records separately.

Other measured checks:

- Eight H2s, each followed by a standalone 48 to 51 word answer.
- Six FAQ answers, 49 to 51 words each.
- Four HTML tables with scroll containers, source/method notes and scoped column headers.
- Six callouts, all under 60 words, including the published-customer field note.
- Introduction 115 words; conclusion 82 words.
- Average prose sentence length about 13.2 words; five Spenza mentions in reading text.
- Eight unique contextual internal links, four distinct primary external sources, zero links to M16 donors.
- Recommended meta title 52 characters; description 147 characters.
- Both previews retain SivaSai's exact supplied bio. The existing reading-time convention produces 14 minutes for each preview.
- M07 reading text remains **2,649 words**, with zero em/en dashes and no banned phrase matches. Its existing FAQ wording was preserved.

## What was merged and removed

The replacement was authored from the approved outline and live-source map, not patched from the prior draft. It preserves the useful MVNO definition and differentiation discussion from the most-cited donor, network and platform setup, billing hierarchies, reseller commissions, operating risks, unit economics and pilot preparation.

The destination's cost-question heading and ten-step playbook heading remain. Its `FAQs` anchor survives. Separate duplicate step lists became one checklist. The new sections give each workstream an owner and acceptance evidence.

Removed: calendar urgency, market forecasts, unsupported dollar bands and launch promises, generic activation/support/churn targets, inconsistent carrier/network counts, and the taxonomy that treated IoT and embedded distribution as network-ownership levels. The old wireless/VoIP safe-harbor error is not repeated. Regulatory material now distinguishes service scope, provider responsibility and effective rules. It remains subject to specialist review, not presented as a completed legal determination.

Angel Watch's published service-design scope is retained without invented time, savings or performance. IMZ appears only as a bounded commerce/reseller example, with account-owner approval explicitly pending. The proposed API cancellation/billing exercise is labeled a test framework, not a measured customer result.

## FAQ appearance and behavior, M16 and M07

The live blog's measured FAQ treatment uses `#f6f6f6` cards, 20-pixel corners, 20-pixel question padding and plus/minus icons. Both preview articles now match those visual properties.

Each question remains an H3 inside a native `summary`; its answer is in a `details` disclosure. The first answer opens initially, matching the inspected live block. Clicking another question opens it and closes the previous answer. Clicking again closes it. Enter and Space perform the same action. The plus changes to a minus through CSS. A visible keyboard-focus outline is provided. Native disclosures also work without JavaScript, and links inside answers remain normal links.

This is article markup with scoped CSS in each existing single style block. It does not change the shared FAQ script or production posts. All answers remain in the rendered HTML and are available to readers by expanding the question. No FAQ schema is emitted by either preview.

Browser checks passed on both previews at 1440-pixel desktop and 390-pixel mobile widths, including click, close-other behavior, Enter, Space, mobile taps and JavaScript-disabled expansion. Screenshots were visually inspected. Gray cards, question wrapping and answer spacing match the requested treatment. The review banner can overlay a cropped screenshot's top edge because it is fixed; it does not cover the normal article header.

## Images: reuse and optimization

The [24-item inventory](M16-image-inventory.json) gives a decision for every asset. No new image generation was needed after approval.

| Accepted asset | Treatment | Verified output |
| :--- | :--- | :--- |
| Live destination `Blog-Thumbnails.png` | Reuse the fixed featured template whole; do not invent a new frame | `launch-mvno-us-guide-featured-template.png` and `.webp`, 1280 by 720; WebP 35,694 bytes |
| Existing `mvno-us-launch-10-step-path.png` | Reuse and optimize, retaining native dimensions; caption clarifies parallel workstreams and pilot-before-public-launch | PNG and WebP, 1600 by 900; WebP 97,562 bytes |

Both optimized images were inspected. Text is intact. Browser `currentSrc` resolves to WebP for both; the body figure uses `picture` with PNG fallback, while the featured slot directly uses WebP. Its matching PNG is staged for handoff. No image contains a new price, performance claim or fabricated screenshot.

Rejected prior-preview assets remain unused: the whole-generated hero breaks the fixed template; the cost/timeline and customer strips contain unsupported numbers; the model ladder mixes use cases with ownership. The other live assets were removed from the proposed article for the relevance, accuracy and legibility reasons in the inventory. No prompts remain outstanding. The caption explains that regulatory scoping begins with service definition, despite the reused sequence image's numbered arrangement.

## Output A: final metadata

- Recommended title: **How to Launch an MVNO in the US: Costs and Checklist** (52 characters).
- Alternate: **How to Launch an MVNO in the US: A Practical Playbook** (53).
- Alternate: **US MVNO Launch Guide: Requirements, Costs and Steps** (51).
- H1: **How to Launch an MVNO in the US: Requirements, Costs and Operating Plan**.
- Description: **Learn how to launch an MVNO in the US: choose an operating model, scope regulatory duties, build a cost plan, and test readiness before going live.** (147).
- Route: `/mvno/launch-mvno-us-guide/`; category `mvno`, unchanged.
- Tags for publish-time handoff: MVNO, MVNE, US MVNO launch, Telecom billing.
- Original publication remains `2026-04-22T11:11:00+00:00`. The manifest records the actual draft modification time.
- Target: OEM, MSP and software-platform teams evaluating a US launch; informational/commercial investigation.
- OG title matches the recommended title. OG description, excerpt, keyword map and exact snippet target remain as approved in Output A. Final count is 2,675 instead of the outline's 2,820-word budget.
- Author: SivaSai. Exact description: Founder’s Office | Engineer → Marketer | Scaled Organic to 500K+ Impressions | SEO & AI Search | Email Campaigns & Funnels | AI-driven B2B SaaS Growth.

## Output E: links and redirect handoff

### Contextual internal links used

| URL | Anchor | Placement |
| :--- | :--- | :--- |
| `/mvno/mvno/` | MVNO business model | Introduction, within first 150 words |
| `/mvno/mvno-types/` | MVNO operating models | Model choice |
| `/mvno/white-label-mvno-launch-guide-2025/` | white-label MVNO responsibilities | Model choice |
| `/mvne/` | MVNE platform capabilities | Model choice |
| `/mvno/mvno-mvno-launch-cost/` | MVNO launch cost inputs | Economics |
| `/mvno/mvno-billing-platforms/` | MVNO billing systems | Technology step |
| `/esim/esim/` | embedded SIM (eSIM) provisioning basics | Technology step |
| `/telecom/angel-watch-iot-business-casestudy/` | Angel Watch's service design | Customer evidence |

The three primary CTA placements repeat `/mvne/` with contextual wording. The evidence CTA also links `/mvno-calculator/`. These are excluded from the contextual-link uniqueness count. All eleven unique internal targets used across M16 and M07 returned 200 in the final targeted check. No donor link is used in M16 prose.

### Primary external sources used

| Source | Supported use |
| :--- | :--- |
| [Final 2026 FCC Form 499-A instructions](https://www.usac.org/wp-content/uploads/service-providers/documents/forms/2026/2026-FCC-Form-499A-Form-Instructions.pdf) | Filing scope and revenue treatment; final PDF fetched and inspected |
| [47 CFR 9.10](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-9/subpart-C/section-9.10) | Wireless emergency-calling scope; current retrieved text inspected |
| [Broadband-label final rule](https://www.federalregister.gov/documents/2026/08/13/2026-16503/empowering-broadband-consumers-through-transparency) | Effective-date exception; published final notice inspected |
| [Partner API introduction](https://docs.spenza.com/introduction) | Documented status, subscription cancellation, invoices and usage; proposed acceptance exercise |

Verizon, GSMA and a second USAC page were omitted from the final reference set after retrieval failures. The article does not claim to have verified their inaccessible material. Four primary sources satisfy the standard's minimum; no extra citation was added merely to increase the count.

### Inbound Link Plan, proposed only

All anchors below point directly to `/mvno/launch-mvno-us-guide/`. These sentences are a publication handoff, not edits performed in this run.

| Existing page | Exact sentence to add or use as replacement | Anchor |
| :--- | :--- | :--- |
| `/mvno/mvno/` | Use the US MVNO launch checklist to connect your operating model with contracts, costs and pilot evidence. | US MVNO launch checklist |
| `/mvno/mvno-types/` | After choosing your operating scope, review the US MVNO launch requirements for the service you intend to sell. | US MVNO launch requirements |
| `/mvno/mvno-mvno-launch-cost/` | Place these quoted costs into a US MVNO operating plan with named owners and acceptance gates. | US MVNO operating plan |
| `/mvno/mvno-billing-platforms/` | Include billing and cancellation reconciliation in your MVNO pilot test plan before public launch. | MVNO pilot test plan |
| `/mvno/white-label-mvno-launch-guide-2025/` | For a US launch, use the US MVNO readiness checklist to connect provider responsibilities with service-specific review and testing. | US MVNO readiness checklist |
| `/telecom/angel-watch-iot-business-casestudy/` | Apply this product-first approach through a US MVNO launch plan that names the devices, markets and operating responsibilities. | US MVNO launch plan |

### Existing links to donors

The built-site crawl found **33 occurrences across 25 routes**, including **11 article-body occurrences across seven routes**. The complete inventory records source route, donor, anchor and context. This is a local crawl of 910 built HTML routes excluding previews, not a claim of a fresh live crawl of every URL.

| Article route | Donor-link occurrences | Publish-time treatment |
| :--- | ---: | :--- |
| `/mvno/2025-mvno-guide-telecom-regulatory-success/` | 1 | Replace setup-guide link with destination, retaining regulatory context |
| `/mvno/esim-5g-mvno-2025/` | 1 | Resolve through its own merge; avoid retaining an urgency anchor |
| `/mvno/mrbeast-celebrity-mvnos/` | 1 | Replace linked image destination after relevance review |
| `/mvno/mvno/` | 4 | Consolidate duplicate launch links into the proposed hub sentence |
| `/mvno/mvno-alternatives/` | 2 | Consolidate overlapping setup and launch references |
| `/mvno/questions-to-ask-mvne-2025/` | 1 | Use a direct readiness-plan link |
| `/mvno/telematics-to-mvno-connectivity-strategy/` | 1 | Preserve product-specific context with a direct destination link |

The remaining 22 occurrences are listing/chrome links. Rebuild affected listings after publication rather than inserting duplicate manual body links.

### Redirect Map, not applied

| Source | Destination | Status | Hops |
| :--- | :--- | ---: | ---: |
| `/mvno/how-to-set-up-mvno/` | `/mvno/launch-mvno-us-guide/` | 301 | 1 |
| `/mvno/launch-us-mvno-now/` | `/mvno/launch-mvno-us-guide/` | 301 | 1 |
| `/mvno/us-mvno-introduction/` | `/mvno/launch-mvno-us-guide/` | 301 | 1 |
| `/mvno/top-10-tips-launching-mvno-us-2025/` | `/mvno/launch-mvno-us-guide/` | 301 | 1 |

The destination is retained, not another cluster's donor. All donors remain live. Recheck the combined redirect table for chains and capacity at execution time; no redirect was added here.

## Output F: schema delta

[M16-schema-delta.json](M16-schema-delta.json) identifies changes to the existing Yoast graph. No second Article, BreadcrumbList or Person is authored.

- Existing Article: update headline, keywords and wordCount to 2,675; use the approved merge publication timestamp for dateModified.
- Preserve original datePublished, existing SivaSai Person reference and `articleSection: ["MVNO"]`.
- Update the existing WebPage description and title labels through Yoast.
- Reconcile the existing ImageObject, thumbnail and Article image with the accepted template asset's final production media URL.
- Add FAQPage through the existing graph integration only if the final six answers are still rendered and accessible by expanding the questions. Text must match exactly; there is no FAQ rich-result promise.
- Both previews emit zero JSON-LD and no destination canonical.

## Output G: QA scorecard

Scores reflect observed work, not an assumed future review. Two checks remain below 8 because the necessary research or human evidence cannot be manufactured. They are explicit publishing holds.

| Check | Score / 10 | Evidence and limit |
| :--- | ---: | :--- |
| Intent match | 8 | Practical guide matches the observed relevant sample; actual ranking order not measured |
| Answer-first | 9 | TL;DR answers directly; all eight H2 openings measured at 48 to 51 words |
| Information gain | **7, hold** | Customer scope, API acceptance exercise and responsibility worksheet included; actual top-ten exclusivity not measured |
| E-E-A-T | **7, hold** | Named author, exact bio, dated primary sources and customer field note; technical/legal review and IMZ approval pending |
| Coverage | 8 | All 15 editorial fan-out questions addressed; PAA not measured and not claimed |
| Accuracy | 9 | No invented amounts, customer results or universal launch guarantees; proposed test and evidence gaps labeled |
| Readability | 9 | Zero banned phrases or em/en dashes; short prose; expandable accessible FAQs |
| Internal links | 9 | Eight contextual destinations, verified; no M16 donors |
| External links | 8 | Four primary sources supporting scoped claims; inaccessible optional references omitted |
| Conversion | 9 | Operating-model, post-evidence and final CTAs fit the intended B2B reader |
| Length | 9 | 2,675 reading words including ACF and collapsed answers |
| Merge completeness | 8 | Keep items from the section map appear as definitions, responsibilities, economics, steps, risks and bounded customer scope |

### Human inputs needed before publishing

Every evidence placeholder currently shown in the preview:

1. `[EVIDENCE NEEDED: technical reviewer name, role and completed review, from the editorial owner]`.
2. `[EVIDENCE NEEDED: service-specific legal and tax review, from the telecom legal/tax specialist]`.
3. `[EVIDENCE NEEDED: approved IMZ scope and wording, from the account owner]`.
4. `[EVIDENCE NEEDED: redacted cancellation record, matching invoice and approved explanation, from engineering and finance]`.
5. `[EVIDENCE NEEDED: approved launch timeline, service scope and subscriber cohort, from the delivery owner]`.

No `[VERIFY]` placeholders remain. The last two items are needed before adding a real worked deployment/test example, not evidence that the proposed worksheet has already been run. Do not generate a fictional operations screenshot. Obtain actual top-ten/PAA/AI-answer measurements before claiming competitor exclusivity or complete measured SERP coverage. SivaSai's supplied bio does not designate a technical reviewer.

### Verification and known limits

- `npm run wp:optimize-css` completed. As during M07, it regenerated unrelated global bundles and removed component-page mappings. Those optimizer-only changes were restored; both articles keep one scoped inline style block, extracted by ArticleLayout and verified in the final build.
- `MEDIA_ORIGIN=https://media.spenza.com NOINDEX=1 npm run build` passed, producing 910 routes. The default build's missing legacy media were an environment mismatch; the correct media-host build resolves that failure without changing source content.
- Final `npx astro check`: **0 errors, 0 warnings, 72 hints across 329 files**, exit code 0.
- Final built-site asset audit: **0 broken references across 487 pages**.
- `npm run wp:verify-dist -- https://media.spenza.com`: **0 missing, 0 stranded assets**.
- Final built-site internal-link audit: 633 unique links, with **one pre-existing malformed URL**, `/mvno/resell-data-plans-shopify/]/`, on `/mvno/msp-reselling-connectivity-with-hardware/`. This same issue is recorded in M07's report. Neither preview links to it; no unrelated WordPress article was edited.
- Both previews return 200, render four TL;DR cards plus the closing card and icons, show the correct breadcrumb and SivaSai author box, and include three related articles.
- Both have `noindex, nofollow`, zero JSON-LD, no destination canonical, no leftover SLOT markers and no browser JavaScript errors.
- Mobile document width equals the 390-pixel viewport. Table regions scroll their 610-pixel contents within 357-pixel viewports.
- Both FAQ sets passed click, Enter, Space, one-open-at-a-time, mobile and JavaScript-disabled tests. Questions remain H3 headings and all answers remain in the rendered HTML.
- Every preview image loaded at full native dimensions through WebP. The article's process image has a PNG fallback.

Both previews are review drafts, not publishing approval. Existing shared TOC behavior also lists template headings such as subscription and the hidden popup; all article H2s are present. This same limitation was recorded during M07 and is outside the FAQ change.

### Post-publish handoff, not executed

After separate publication authorization: publish the approved body and ACF summary on the existing destination; retain its original publication date; update existing Yoast fields and media; unpublish the four donors; apply direct 301s; update the inventoried internal links and listings; rebuild the sitemap; verify assets, schema and redirect chains; request indexing in GSC and submit the destination through Bing IndexNow. Track available search and AI reports at 14, 28 and 56 days. None of those actions happened here.

The temporary built-preview server on port 4333 was stopped after verification. The existing development server and both review URLs remain available on port 4321.
