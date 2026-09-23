# M07: preview and QA handoff

> Historical September 22 report. The September 23 [image inventory](M07-M16-image-inventory.md), [four outstanding prompts](M07-M16-image-prompts.md), [evidence hold](M07-M16-evidence-hold.md) and correction verification supersede its image-count, local-copy, upload and completion statements. Both articles remain held at information gain 7.

Prepared September 22, 2026, after the user's Phase 4 outline approval. **Preview ready for review; editorial QA is not an unconditional pass.** Technical review, approval of the IMZ scope and the research comparison limits below remain open. M07 is `preview`. Stop here; M16 and every other cluster remain outside this run.

[Open the M07 preview](http://localhost:4321/preview/merged/white-label-mvno-launch-guide-2025/).

## Deliverables and measured result

| Output | Location |
| :--- | :--- |
| A: final metadata | Below; implemented in `src/data/merge-previews/index.ts` |
| B: Merge Map and research | [Full source audit](./M07-phase-1-audit.md), [research and approved outline](./M07-research-and-outline.md) |
| C: approved outline | [Phase 4 outline](./M07-research-and-outline.md#output-c-complete-outline) |
| D: complete fresh article | [Preview HTML](../../src/data/merge-previews/white-label-mvno-launch-guide-2025.html); separate TL;DR in the manifest |
| E: links and redirect handoff | Below; [complete donor inbound inventory](./M07-donor-inbound-links.json) |
| F: schema delta | [Proposed schema delta](./M07-schema-delta.json), not injected or applied |
| G: QA | Below; [measured results](./M07-qa-measurements.json) |

The HTML was replaced with a fresh draft from the approved structure. The retained URL remains `/mvno/white-label-mvno-launch-guide-2025/`, category `mvno`.

| Measurement | Before | After |
| :--- | ---: | ---: |
| Previous preview body, excluding CSS | 2,746 | 2,486 |
| Separately rendered TL;DR, including titles | 315 | 163 |
| Total reading words, same counter | 3,061 | **2,649** |
| Em dashes across body and TL;DR | 23 | **0** |
| En dashes across body and TL;DR | 25 | **0** |
| Meta description characters | 175 | **150** |

The same HTML parser and whitespace counting method was applied to the original HEAD preview and final draft. It counts headings, table cells, source lines beneath tables, captions, callouts and CTAs. It excludes CSS, scripts, editorial review notes, the author bio and final source index. The final text is 412 words shorter including TL;DR, a 13.5% reduction. The user's original 22 em dashes and 23 en dashes referred to the body; the higher before totals above include the old TL;DR. The user's one banned-word finding was not reproduced by the explicit phrase list used in the current measurement; it is not silently claimed as a verified baseline. The final draft has zero matches for that list, zero exclamation marks and no rhetorical-question opener or banned “whether you're ... or ...” construction.

Additional final measurements:

- Eight contextual internal destinations: seven site pages and the owned documentation subdomain. Eleven internal link occurrences including three CTA placements, nine unique destinations when the calculator CTA is included. Zero body links to donors.
- Six distinct external primary sources. Competitor descriptions are confined to comparisons and have no scores.
- Eight H2 openings, 46 to 49 words each; each names the entity and stands alone.
- TL;DR description: 82 words. Four two-column cards and one closing card.
- Intro: 111 words, with a 47-word opening. Conclusion: 83 words.
- Six FAQ answers: 53, 50, 52, 53, 54 and 50 words; the complete exact answers and counts are in the measurement file. All are within 40 to 70 words.
- Three HTML tables and six callouts. Callout prose is 14 to 24 words, and every box remains below 60 words including its label.
- Average prose sentence length: 13 words, measured across paragraphs and list items, excluding table-source lines and callout/CTA boxes. Five visible Spenza mentions in reading text. SivaSai's author description uses the exact text supplied by the user. Read time: 14 minutes under the existing 200-words-per-minute convention.

## What was preserved and removed

| Source | Retained contribution and final location |
| :--- | :--- |
| Destination | Definition, existing fit/cost/launch H2 wording, customer ownership, IMZ qualitative scope, FAQs; preserved `Spenza`, `IMZ`, `Conclusion` and `FAQs` anchor IDs |
| MVNO in a Box for brands | Network/platform/customer-interface components, BSS/OSS scope, integration, support and existing carrier-agreement questions; sections 1, 3, 5 and FAQs |
| Non-telco brand launch | Device bundles, a defined customer need, branded distribution through existing channels; sections 2 and 5 |
| Practical white-label guide | Pilot sequence, support ownership, cost categories, device compatibility and migration/exit questions; sections 3 to 6 and FAQs |

All Keep items in the Merge Map have a corresponding final treatment. Repeated definitions and overlapping launch sequences were consolidated. Unsupported market figures, launch prices, margin bands, retention claims, universal timelines, competitor judgments and numeric IMZ outcomes were removed. Retail remains an illustrative channel; the guide prioritizes OEMs, MSPs and software platforms.

The three information-gain candidates became: a documented asynchronous-provisioning acceptance test, a quote worksheet linked to billable states and pilot charges, and a scoped comparison of Butlr's regional sensor rollout with IMZ's commerce workflow. These are useful contributions, but **their exclusivity against an actual Google top ten has not been measured**. No production test or proprietary quote is claimed.

## Output A: final metadata

| Field | Final value |
| :--- | :--- |
| Recommended meta title | White Label MVNO: Scope, Costs and Launch Requirements (54 characters) |
| Alternate 1 | White Label MVNO Guide for OEMs, MSPs and Platforms (51 characters) |
| Alternate 2 | White Label MVNO Launch: Ownership, Costs and Risks (51 characters) |
| H1 | White Label MVNO Launch Guide: Scope, Costs and Ownership |
| Slug | `white-label-mvno-launch-guide-2025`, unchanged |
| Category | `mvno`, unchanged |
| Proposed tags | White Label MVNO; MVNE; Embedded Connectivity; Telecom Billing |
| Meta description | Learn what a white label MVNO includes, who owns billing and support, how to evaluate costs, and what to test before launching branded mobile service. (150 characters) |
| Primary keyword | white label MVNO |
| Secondary keywords | MVNO in a Box; white label mobile service; private label MVNO; MVNE platform; branded connectivity; MVNO launch costs |
| Long-tail set | The 12 mapped variants in the approved research document; served by the eight sections and six FAQs |
| Intent and funnel | Commercial investigation, middle funnel; definition to operating-model and provider evaluation |
| Target readers | Product/technical leaders at connected-device OEMs and software platforms; MSP owners and operations leaders |
| Word count | 2,649 including all TL;DR reading text |
| Author | SivaSai, Founder’s Office; user-supplied background also matches the existing author record |
| Technical reviewer | Pending, no review completion claimed |
| Publication timestamp | `2026-04-24T06:48:54+00:00`, preserved from live Yoast Article |
| Draft modification timestamp | `2026-09-22T11:25:11.336Z`; visible update September 2026. Actual publication must use the actual approved merge date |
| OG title | White Label MVNO: Plan Your Branded Mobile Launch |
| OG description | Decide what your team will own, compare provider responsibilities, build a launch budget, and test the service before selling it. |
| Excerpt | A practical guide for OEMs, MSPs and software platforms evaluating branded mobile service, including ownership, cost inputs, provider selection and launch tests. |

Featured-snippet target: “What is a white label MVNO?”, definition paragraph. Final exact text is the article's 47-word intro opening, replacing the planning-only snippet:

> A white label mobile virtual network operator (MVNO) offers branded mobile service through a partner's network access and telecom platform. The arrangement can include provisioning, billing and customer interfaces. Your agreement determines which functions the provider operates and which decisions, costs and obligations remain with your team.

This is a target passage, not an observed snippet win.

### Final image decisions

Inventory preceded selection. The [18-asset inventory](./M07-phase-1-audit.md#image-inventory-and-decisions) records a decision for every destination and donor visual. None needed a new generated image.

| Slot | Final asset and treatment | Dimensions / WebP size | Alt text |
| :--- | :--- | :--- | :--- |
| Featured | `public/blog-media/white-label-mvno/White-Label-MVNO-Launch-Guide.webp`, with PNG companion. Reused destination's fixed frame and right art panel; changed title only. No whole-image generation | 1280 × 720; 53,154 bytes | White label MVNO launch guide for branded mobile services |
| Section 2 | `public/blog-media/white-label-mvno/white-label-use-cases.webp`, with PNG companion. Reused `White-label-industrial-use-cases-1024x683.png`; native aspect retained | 1024 × 683; 65,862 bytes | Branded connectivity can support banking apps, retail offers, wearables and office sensors |
| Old timeline | `7-Day-Launch-MVNO-Timeline` excluded. Its useful sequence is the accessible numbered launch checklist. Unverified timing and prohibited range dashes make the existing raster unsuitable | No new file | Not applicable |
| Other 15 inventoried assets | Omitted for the individual duplication, claim, readability or palette reasons in Phase 1 | No generated replacement | Not applicable |

The hero uses the fixed template, with the existing logo, artwork and control geometry preserved. It serves WebP directly; the body image uses `<picture>` with WebP and PNG fallback. Both loaded in desktop/mobile browser checks. Caption identifies the four use-case scenes as illustrative. There are no unresolved image slots and no image-generation prompts to hand back.

## Output E: link plan

### Internal links used

| Retained destination | Exact ordinary-body anchor | Purpose |
| :--- | :--- | :--- |
| `/mvno/mvno/` | MVNO business model | Hub link in the first 150 words |
| `/mvno/mvno-types/` | MVNO operating models | Model distinctions |
| `/mvno/mvno-mvno-launch-cost/` | MVNO launch cost inputs | Budget depth without repeating unverified price bands |
| `/esim/esim/` | eSIM provisioning basics | Device/provisioning context |
| `/mvne/` | MVNE platform capabilities | Commercial scope in provider comparison |
| `/mvno/resell-data-plans-shopify/` | Shopify reseller workflow | IMZ qualitative implementation scope |
| `/spenza-product/butlr-iot-spenza-casestudy/` | Butlr's regional rollout | Approved, scoped 2025 result |
| `https://docs.spenza.com/introduction` | Partner API contract | Transaction completion and retry behavior |

CTA placements are separate: “Discuss your MVNO operating model” after the responsibility comparison, “Estimate your launch costs” after the evidence section at `/mvno-calculator/`, and “discuss your operating model” at `/mvne/` in the conclusion. Ordinary body URLs are not repeated. All required cluster internal destinations are present and none is a queued donor.

### Inbound Link Plan: five proposed edits, not applied

Each bracketed phrase below is the exact anchor to link to `/mvno/white-label-mvno-launch-guide-2025/`. These pages exist in the route index. This is a handoff, not authorization to edit their content.

| Existing page | Exact sentence to add or use as replacement |
| :--- | :--- |
| `/mvno/mvno/` | Use the [white label MVNO launch guide] to compare customer ownership, provider responsibilities and the checks required before selling branded service. |
| `/mvno/mvno-types/` | A [white label MVNO operating model] still needs a written allocation of subscriber contracts, billing, support and customer-data rights. |
| `/mvno/mvno-mvno-launch-cost/` | The [white label MVNO cost worksheet] helps connect minimum commitments and billable line states to the evidence collected during a pilot. |
| `/mvno/resell-data-plans-shopify/` | Before adding mobile plans to your storefront, use the [branded mobile launch checklist] to assign support, provisioning and billing responsibilities. |
| `/spenza-product/butlr-iot-spenza-casestudy/` | For a broader branded offer, the [white label MVNO launch requirements] explain why a regional sensor rollout and a new retail mobile service have different acceptance criteria. |

On the MVNO hub, replace/consolidate its three existing donor links instead of appending a fourth repetitive recommendation.

### External primary sources used

All six resolved in the research fetches and support the stated scope. This is claim verification, not independent vendor performance testing.

| Source | Claim or comparison supported |
| :--- | :--- |
| [iBASIS responsibility models](https://ibasis.com/solutions/mvno-as-a-service/) | Billing, support and infrastructure responsibilities vary with operating model |
| [USAC filing and exemptions](https://www.usac.org/service-providers/contributing-to-the-usf/who-must-contribute/) | US provider and exempt marketing-agent distinctions; no automatic exemption inferred |
| [GSMA eSIM specifications](https://www.gsma.com/solutions-and-impact/technologies/esim/esim-specification/) | Consumer and IoT provisioning paths, SGP.22 and SGP.32 |
| [Gigs MVNO scope](https://gigs.com/use-cases/mvno-in-a-box) | Embedded checkout, payments and carrier-of-record options in the comparison |
| [Transatel white-label scope](https://www.transatel.com/news-and-insights/blog/what-are-mvno-white-label-solutions/) | Branded-service and operating-platform scope in the comparison |
| [FCC consumer portal](https://consumercomplaints.fcc.gov/hc/en-us) | Basic eligible number portability within the same geographic area |

The FCC's separate porting guide returned 403 during research. The linked, accessible consumer portal supplies the limited claim used here. No failed URL was silently marked verified.

### Redirect Map: proposed only

| Source | Destination | Proposed behavior |
| :--- | :--- | :--- |
| `/mvno/mvno-in-a-box-for-brands/` | `/mvno/white-label-mvno-launch-guide-2025/` | 301, one hop after publication/unpublication |
| `/mvno/how-to-launch-mvno-non-telco-brand-2025/` | `/mvno/white-label-mvno-launch-guide-2025/` | 301, one hop after publication/unpublication |
| `/mvno/white-label-mvno/` | `/mvno/white-label-mvno-launch-guide-2025/` | 301, one hop after publication/unpublication |

No redirects were added or activated. No donor was unpublished. The preview's donor metrics are historical, not a guarantee that traffic or citations transfer.

### Sitewide links pointing at donors

A crawl of the 910 built HTML routes, excluding previews, found **26 link occurrences across 22 routes**, including **10 article-body occurrences across eight routes**. The [JSON inventory](./M07-donor-inbound-links.json) records every source path, target, anchor and whether the link is in article content or a listing/page wrapper. It is a local built-site measurement, not a fresh live crawl of all 910 routes.

| Article with donor links | Existing donor anchor(s) | Handoff |
| :--- | :--- | :--- |
| `/esim/iot-sim-management-guide/` | white label MVNO | Retarget to retained M07 URL |
| `/mvno/become-your-own-mvno-ai-ucaas/` | MVNO-in-a-box | Retarget; contextual wording may stay |
| `/mvno/isp-to-mvno-convergence/` | full-brand MVNO | Retarget and review model wording |
| `/mvno/mno-mvno-mvne-mvna-roles/` | branded reseller / white-label MVNO route | Retarget, shorten anchor if editing prose |
| `/mvno/monetize-baby-monitor-connectivity/` | MVNO-in-a-box | Retarget; retain device-bundle context |
| `/mvno/mvno/` | Three links, one to each donor | Consolidate using the inbound plan above |
| `/mvno/mvno-revenue-models/` | MVNO in a Box | Retarget |
| `/mvno/top-mvno-marketing-strategies/` | non-telecom brand | Retarget with context retained |

The other 16 occurrences are listings or page-wrapper links. Rebuild affected author, date and category listings after any separately authorized publication change; do not add manual prose replacements to generated card lists.

## Output F: schema delta

The [machine-readable delta](./M07-schema-delta.json) targets the existing Yoast graph. It is an instruction envelope, not a standalone JSON-LD document for a script tag.

- Existing Article `wordCount`: 2,228 on the live source. Proposed corrected reading count: 2,649, including ACF TL;DR. Recalculate after any review edits and ensure the existing Yoast output counts the visible ACF text.
- Update existing `headline`, `keywords`, WebPage/meta description and `dateModified` at publication. Preserve `datePublished` exactly.
- The visible six-answer FAQ permits a conditional FAQPage addition through the same graph. The delta contains the exact current questions and answers. It is not a promise of Google FAQ rich results.
- Current schema author is Spenza. The approved visible credit is SivaSai: use the existing author assignment and matching Yoast Person reference. Do not invent a Person ID or reviewer approval.
- Reconcile the existing ImageObject/thumbnail with the final production URL of the derived hero, and let Yoast refresh the existing WebPage and final breadcrumb labels from the new title. Keep their IDs.
- `articleSection: ["MVNO"]` and URL category stay. No second Article or BreadcrumbList is authored. The preview has zero JSON-LD and no destination canonical.

## Output G: QA scorecard

Scores describe the actual state, not expected future approval. The two checks below 8 cannot be truthfully cleared with the available human evidence and research coverage. They remain editorial holds rather than fabricated passes.

| Check | Score / 10 | Evidence and limit |
| :--- | ---: | :--- |
| Intent match | 8 | Buyer guide matches the observed explainer/commercial sample. Localized Google/Bing ranks are not measured |
| Answer-first | 9 | Direct TL;DR; eight standalone H2 openings of 46 to 49 words; 47-word intro verdict |
| Information gain | **7, hold** | Three concrete contributions implemented, but two sampled results could not be fully inspected and actual Google top-ten exclusivity is not measured |
| E-E-A-T | **7, hold** | Named author and supplied background, dated primary sources and approved Butlr field note. Technical reviewer and IMZ account-owner approval still missing |
| Coverage | 8 | All 15 editorial fan-out questions answered. Six nonduplicative FAQs. Complete PAA coverage cannot be claimed because PAA was not measured |
| Accuracy | 9 | No invented prices, margins, deadlines or tests. Butlr result is sourced and scoped. Pending IMZ approval is visible; regulatory applicability remains service-specific |
| Readability | 9 | Short paragraphs, zero em/en dashes, zero checked banned phrases; three real tables and six short callouts. Grade 8 to 10 was an editorial target, not a validated reading-grade measurement |
| Internal links | 9 | Eight contextual destinations, descriptive unique anchors, required hub/commercial/spoke coverage, zero donor links |
| External links | 9 | Six resolved primary sources; vendor descriptions dated September 2026 and limited to source claims |
| Conversion | 9 | Three helpful CTA placements tied to operating scope and the buyer's own cost assumptions |
| Length | 10 | 2,649 words including full TL;DR, below the 3,000-word cap |
| Merge completeness | 9 | All Keep items represented; strong headings/IDs retained; unsupported numerical embellishments removed |

Search volume, keyword difficulty, Google/Bing positions, featured snippet, PAA, AI Overview, AI Mode and named AI-engine answers/citations remain **not measured**, as documented in Phase 2. Search itself was available and used. The scorecard does not misrepresent the search tool's results as a measured Google top ten.

### Render and build verification

- Desktop 1440 pixels and mobile 390 pixels: hero and body image loaded; mobile document width equals viewport width.
- Three table regions have 357-pixel mobile viewports and 610-pixel scrollable contents. No page-wide overflow.
- Four TL;DR cards plus closing card and icons render. Breadcrumb, SivaSai author box and three related posts are present. No remaining SLOT markers or browser JavaScript errors.
- Sidebar contains all eight merged H2 sections. Existing shared-template behavior also lists TL;DR, related articles, subscription and the hidden “Homepage Popup” heading. That extra popup entry is a template limitation, not an M07 section, and was not fixed as part of the merge.
- Robots: `noindex, nofollow`. Zero JSON-LD. Preview excluded from sitemap.
- Preview word-count/read-time handling now counts actual reading text and ACF TL;DR rather than CSS/review chrome. The small optional ArticleLayout count prop leaves production article counting unchanged.
- Mobile review banner now measures its own height and hides secondary metrics at narrow widths, so it does not obscure the article header.
- `npm run wp:optimize-css` completed. Inspection found unrelated global regeneration removed five component-page bundle mappings and existing shell selectors. Those generated changes were reverted. M07's single scoped inline style is extracted by ArticleLayout and is present in the built page; no stale M07 external bundle remains.
- `npm run build`: passed. The ordinary local build omitted the media-host setting and had 10,325 missing legacy media references. Rebuilding with the documented `MEDIA_ORIGIN=https://media.spenza.com NOINDEX=1` resolved this configuration-dependent failure.
- Media-host build: `npm run wp:audit` found **0 broken references across 487 pages**. `npm run wp:verify-dist -- https://media.spenza.com` found **0 missing and 0 stranded assets**.
- `npm run wp:audit-links` checked 633 unique links and found **one existing malformed URL**: `/mvno/resell-data-plans-shopify/]/` on `/mvno/msp-reselling-connectivity-with-hardware/`. M07 uses the correct retained URL. This is outside this cluster; no other article was edited. The site issue log was checked and had no entry for this exact malformed link.
- Final `npx astro check`: **0 errors, 0 warnings, 72 hints across 329 files**. The temporary built-site server on port 4322 was stopped after audits; the existing dev preview remains on port 4321.

### Human inputs still needed

Every placeholder currently visible in the draft:

1. `[EVIDENCE NEEDED: technical reviewer name, role and completed review, from the editorial owner]`
2. `[EVIDENCE NEEDED: approved IMZ deployment scope, from the account owner]`

No `[VERIFY]` tokens remain. SivaSai and Founder’s Office are confirmed by the user. At the user’s explicit request, the author description is reproduced verbatim: “Founder’s Office | Engineer → Marketer | Scaled Organic to 500K+ Impressions | SEO & AI Search | Email Campaigns & Funnels | AI-driven B2B SaaS Growth”.

Earlier research requests were resolved by limiting scope, not by inventing evidence: the universal seven-day deadline and timeline raster were removed; the cost table uses quote inputs without prices; API behavior supports a proposed acceptance test rather than a claimed production run. If a measured case is later wanted, obtain the previously requested prerequisites/cohort from implementation, a redacted quote and billable-line definitions from finance, and successful/failed transaction plus invoice records from engineering.

The reviewer should check responsibility boundaries, quote formulas, device/provisioning scope, retry behavior, porting/exit qualifications and Butlr/IMZ attribution. Market-specific legal and tax obligations must be reviewed for an actual launch offer. Resolve top-ten comparison coverage before claiming the standard's exclusivity criterion. No new screenshots are needed for this draft; a future measured test would require sanitized supporting records.

### Post-publication handoff, not executed

Only after separate authorization: publish approved body and ACF TL;DR on the existing destination, preserve original publication date, update existing Yoast fields/media/author, unpublish donors, apply the three direct 301s, update donor inbound links, rebuild listings and sitemap, verify no chains and correct schema, request indexing in GSC, and submit the retained URL through Bing IndexNow. Then review destination performance at 14, 28 and 56 days in available GSC and Bing AI reports. None of these publication actions happened in this run.

**Phase 6 stop.** WordPress, redirects and the destination route are unchanged. M16 has not been rewritten or advanced.

## Requested FAQ update, September 22, 2026

During the approved M16 rewrite, the user requested the same expandable FAQ UI for M07. All six original M07 question/answer pairs are preserved inside native `details`/`summary` disclosures. The gray cards, 20-pixel corners and padding, and plus/minus appearance match the inspected live blog. First answer open initially; opening another closes the previous one. Mouse, Enter, Space, mobile interaction and JavaScript-disabled expansion passed for both articles. The H3 questions and full answer text remain in the HTML.

M07 still measures **2,649 reading words including TL;DR, zero em dashes, zero en dashes and no banned phrases**. Its exact author description and existing schema delta remain valid. No new schema or live WordPress changes were made. See [combined browser checks](M16-M07-browser-qa.json), [internal link checks](M16-M07-link-checks.json) and [M16's final verification report](M16-phase-6-report.md). The previously recorded editorial holds remain.
