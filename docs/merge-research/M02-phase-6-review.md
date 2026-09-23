# M02 Phase 6 review

23 September 2026. **Preview complete; publication held for human evidence and technical review.** Only M02 was drafted. M07 and M16 remain held and unchanged; M03 and the rest of the queue were not started.

Preview: <http://localhost:4321/preview/merged/mvno/>. Destination remains `/mvno/mvno/`, category `mvno`. The queue status is `preview`, not `approved`. No WordPress write, redirect, donor removal, category move or push was performed.

## Outputs A through D

- **A, metadata:** [approved metadata and alternatives](./M02-research-and-outline.md#output-a-proposed-metadata), now implemented in the preview manifest. Recommended title and H1: **What Is an MVNO? Business Models and How to Launch**, 50 characters. Alternatives remain 51 and 52 characters. Description: **Learn what an MVNO is, how its business models work, which costs and duties remain yours, and what to verify before launching a branded mobile service.**, 151 characters.
- Tags for eventual publication: MVNO, MVNE, Mobile Connectivity, Telecom Billing, Embedded Connectivity. Primary query: `what is an MVNO`; informational intent, awareness to consideration. Priority reader: device OEM, MSP and software-platform decision makers.
- OG title matches the recommended title. OG description: **Understand MVNO roles, compare operating models, assess costs and use a published enterprise launch to plan your next step.** Excerpt and exact snippet target are preserved in the approved metadata packet and manifest.
- Original publication date remains `2026-06-11T10:40:10+00:00`. The preview displays September 2026 as its last update and a 14-minute reading estimate. The author is SivaSai, matching M02's precomputed author. The user-supplied biography is reproduced exactly. No reviewer has been inferred from the author.
- **B, research:** [Merge Map and priority passages](./M02-phase-1-audit.md), [source capture including all three ACF summaries](./M02-source-audit.json), [SERP, gap, semantic and question research](./M02-research-and-outline.md), [RocketPhone evidence](./M02-rocketphone-evidence.json).
- **C, outline:** [approved outline](./M02-research-and-outline.md#output-c-proposed-outline). Approval received before drafting. Final length is below the target budget without removing required sections.
- **D, article:** [preview HTML](../../src/data/merge-previews/mvno.html). The TL;DR is stored only in the preview manifest's ACF-shaped fields, not repeated inside the article body.

### Measured size and structure

| Measure | Before | Draft |
| :-- | --: | --: |
| Destination body | 3,595 | 2,528 |
| All three source bodies | 8,577 | 2,528 |
| All three source TL;DR blocks | 411 | 158 |
| Combined body plus TL;DR | 8,988 | **2,686** |
| Em dashes / en dashes | Not a Phase 6 baseline claim | **0 / 0** |
| Banned phrases | Not a Phase 6 baseline claim | **0** |
| Body H2s, including FAQ | Original Merge Map | **7** |
| Tables / callouts / FAQ questions | Original Merge Map | **4 / 6 / 6** |
| Unique internal / external URLs | Original source capture | **9 / 6** |
| Images, hero plus body | Full inventory | **4** |

The word count uses `mergeReadingWords` and includes heading, table, caption, callout and CTA text plus every TL;DR card. It excludes the editorial evidence panel, CSS/scripts and the source index. The source index and evidence requests are still visible. The new generic editorial gate reports 2,658 because its HTML-only count includes review notes but omits ACF; it is not the final reading count. See [content measurements](./M02-content-qa.json).

H2 opening paragraphs: 46, 47, 49, 50, 49, 50 and 47 words. FAQ answers: 49, 50, 52, 49, 52 and 52 words. Intro: 112 words; conclusion: 88. TL;DR description: 73 words. All six callouts are below 60 words. Four prose mentions of Spenza.

### Citation-priority preservation

The destination's 22,500 Bing citations and 5,436 Google AI impressions, and the donors' figures, are historical URL-level inputs. No passage-level attribution was available. These passages were deliberately retained in meaning and rewritten carefully because they came from citation-bearing URLs; this is not a claim that a particular paragraph was observed in an AI answer.

| Priority | Preserved passage or decision | Draft location |
| :-- | :-- | :-- |
| P1 | Own-brand wholesale definition, with host radio distinguished from core infrastructure | Intro and Fundamentals |
| P2 | Customer-facing provider versus wholesale buyer; plan, SIM and service responsibilities | `#elementor-toc__heading-anchor-1` |
| P3 | MNO, MVNO, MVNE and MVNA role distinctions; optional or combined enabling roles | `#elementor-toc__heading-anchor-2` |
| P4 | Reseller, light and full models compared by retained control | `#elementor-toc__heading-anchor-3` |
| P5 | Wholesale/retail economics plus operating cost and retention | `#elementor-toc__heading-anchor-4` |
| P6 | Seven launch stages from model choice to accepted pilot and scale | `#elementor-toc__heading-anchor-5` |
| P7 | Rating, charging, invoices, plan changes and overdue-payment work | `#elementor-toc__heading-anchor-8` |
| P8 | Donor's agreement, plan, signup, activation and host-network mechanism | `#m02-how-mvnos-work` |
| P9 | Donor's recognizable carrier examples, refreshed against official operator sources | `#elementor-toc__heading-anchor-13` |
| P10 | Host coverage versus priority, roaming, devices and support | Fundamentals and FAQ |
| P11 | Donor's infrastructure ownership versus operating responsibility distinction | Fundamentals, Ecosystem and Types |
| P12 | Donor's product fit, audience, differentiation, funding and operations | `#elementor-toc__heading-anchor-9` and `-7` |
| P13 | Donor's fixed, variable, acquisition and retention economics | Economics worksheet and minimum/cash section |
| P14 | Donor's pilot-before-growth principle and named risk owners | Launch checklist and responsibility table |

Retained all 14 numbered destination fragments plus `#FAQs`; TL;DR fragment `-0` also remains. Browser verification found each exactly once. Six strong original body H2s remain, with sections reordered to place the enterprise case before the launch checklist. White-label, marketing/product fit, billing, device/IoT, eSIM/5G, compliance and examples now sit inside the relevant sections rather than expanding the pillar into a directory.

Dropped duplicate definitions and introductions, unsourced market/margin/acquisition benchmarks, universal launch intervals, blanket feature/compliance promises and long link collections. Corrected the implication that every MVNO has no infrastructure, that each role requires a separate company, or that sharing a network proves identical plan entitlements. No unsupported values were replaced with invented estimates.

### Information gain actually implemented

The ten researched pages were a search-result sample, not a controlled top-ten ranking. No equivalent RocketPhone-specific treatment was found in that sample. General responsibility and economics advice already exists elsewhere and is not treated as proprietary evidence.

1. **Requirement and rejected alternatives:** the case's native-cellular requirement, three rejected workarounds and the resulting need to control the voice path. The article derives a concrete partner-evaluation question from that published design rationale.
2. **Delivered versus future scope:** the actual mobile/operations capabilities, implementation work and branded launch are separated from proposed markets, self-service commerce and downstream API access. The case's publication date is not used as a launch milestone.
3. **Application integration versus channel operations:** cellular-to-SIP routing into RocketPhone's existing workflow is distinguished from delivered partner/enterprise administration. The proposed pilot asks for evidence of both, without claiming those checks were reported customer tests.
4. **Responsibility-to-proof worksheet:** task, performing party and acceptance evidence, labelled as editorial buyer guidance. It is useful application of the source material, not a measured customer outcome.

The first three provide a case-backed reason to score information gain **8**, rather than relabelling a generic comparison table as new evidence. Missing scale, dates and screenshots remain missing. E-E-A-T stays **7** until a named technical reviewer has reviewed the content; the preview is held rather than passed off as publication-ready.

## Images

[All 21 candidate decisions](./M02-image-inventory.md), [captured URLs and responsive attributes](./M02-image-inventory.json), [generation provenance](./M02-generated-image.json).

| Slot | Decision and reference | Purpose / alt text |
| :-- | :-- | :-- |
| Featured | Reuse `What-Is-an-MVNO-Types-Benefits-and-Key-Insights.png` at its existing media URL and exact live picture/srcset | Title-specific fixed-template hero; alt: What is an MVNO? Types, benefits and the mobile service model |
| Ecosystem | New `mvno-network-and-operating-roles.png` and `.webp` only | Optional enabler/aggregator relationships; alt: An MVNO serves customers through host network access, with optional MVNE systems and MVNA aggregation |
| Vertical fit | Reuse `ChatGPT-Image-Jun-11-2026-02_56_12-PM.png` from media, native 4:3 and exact live srcset | Illustrative use cases; alt: Vertical MVNO uses include watches, finance, gaming, monitors, fleets and smart cities |
| Launch | Reuse `ChatGPT-Image-Jun-11-2026-02_54_24-PM.png` from media and exact live srcset | Seven unpriced launch stages; alt: An MVNO launch progresses from model and partner selection through plans, systems, pilot and scale |

No local copies of existing media. The new diagram was generated only after inventory and outline approval; labels were set in Figma. PNG 58,540 bytes, WebP 36,818 bytes, both 1600 by 900. The hero and new diagram serve verified WebP; retained body figures preserve the live PNG responsive markup. No slot remains open for generation. The operations screenshot request is not satisfied by an illustrative diagram.

## Output E: link and redirect plans

### Internal links used

Nine unique targets; 11 occurrences because the commercial CTA appears three times. Six top spokes, one commercial target, one calculator and one case. No self-link and no donor from any cluster.

| Target | Anchor | Placement |
| :-- | :-- | :-- |
| `/mvno/mno-mvno-mvne-mvna-roles/` | MNO, MVNO and enabler roles | Intro |
| `/mvno/mvno-types/` | MVNO operating models | Types |
| `/mvno/mvno-mvno-launch-cost/` | MVNO launch cost inputs | Economics |
| `/mvno/mvno-billing-platforms/` | MVNO billing platform requirements | Launch |
| `/mvno/mvne-provider-selection/` | MVNE provider selection | Buyer checklist |
| `/mvno/launch-mvno-us-guide/` | US MVNO launch planning | US obligation context |
| `/mvne/` | review your operating model | Three contextual CTAs |
| `/mvno-calculator/` | estimate your launch costs | Economics |
| `/spenza-product/rocketphone-case-study/` | RocketPhone enterprise MVNO case | Evidence |

### Proposed inbound links, not applied

All six existing source routes are present in the built site. These are exact sentences to consider during their own authorized cluster work; no other article was changed.

| Existing source | Sentence with exact proposed anchor |
| :-- | :-- |
| `/mvno/mvno-billing-platforms/` | Before choosing billing software, map the responsibilities your business retains using the [MVNO operating model guide](/mvno/mvno/). |
| `/mvno/mno-mvno-mvne-mvna-roles/` | Use the [MVNO definition and launch guide](/mvno/mvno/) to connect these roles to model choice, economics and pilot readiness. |
| `/mvno/mvne-provider-selection/` | Start the provider discussion with the [MVNO responsibilities and launch checklist](/mvno/mvno/) so your requirements name the work each party must perform. |
| `/mvno/launch-mvno-7-days/` | Use the [MVNO launch readiness guide](/mvno/mvno/) to distinguish platform setup from a tested commercial service. |
| `/mvno/mvne-explained/` | The [MVNO business model guide](/mvno/mvno/) explains how enabler services fit reseller, light and full operating models. |
| `/mvno/subscriber-management-system-guide/` | Place subscriber operations in context with the [MVNO service and responsibility guide](/mvno/mvno/) before assigning lifecycle tasks to a platform. |

### External evidence

Six primary URLs, read in Phase 2 and linked adjacent to supported claims:

| URL | Claim boundary |
| :-- | :-- |
| <https://crtc.gc.ca/eng/comm/telecom/respmobvir.htm> | Host radio versus retained infrastructure; Canadian obligations not generalized |
| <https://www.visible.com/about-us/> | Visible's Verizon relationship |
| <https://www.mintmobile.com/network-management-policy/> | T-Mobile host and plan-specific network management |
| <https://www.usmobile.com/blog/best-cell-phone-plans-att-vs-verizon-vs-t-mobile-vs-us-mobile/> | Named host mappings only, no borrowed plan ranking or price |
| <https://www.usmobile.com/networks> | Network choice/transfer, not inferred automatic failover |
| <https://www.usac.org/service-providers/contributing-to-the-usf/who-must-contribute/> | Service-dependent filing/contribution scope and exceptions |

### Redirect map, not executed

| Source | Destination | Intended status |
| :-- | :-- | :-- |
| `/mvno/what-are-mvnos/` | `/mvno/mvno/` | 301, one hop |
| `/telecom/what-is-mvno/` | `/mvno/mvno/` | 301, one hop |

The read-only built-site scan found **17 donor-link occurrences on 13 routes**, including archive cards and redirect stubs. [Exact paths, targets and anchors](./M02-donor-inbound-links.json). Contextual links occur on the current destination, `/byod/mvno-locked-phone-challenge-guide/` and `/mvno/launch-mvno-us-guide/`. The latter is M16 and stays untouched. BYOD is outside this cluster and stays untouched.

The source aliases `/blog/what-are-mvnos/`, `/blog/what-is-mvno/` and `/blog/what-are-mvnos-and-the-best-options-for-you/` currently point at donor destinations. At a separately authorized publication, inspect their redirect ownership and retarget existing aliases directly to the survivor to avoid chains. Archive/date/category/author/sitemap cards must be regenerated after donor retirement. No redirect file was edited.

## Output F: Yoast delta only

No schema was added to the preview. It emits zero JSON-LD, no canonical URL and `noindex, nofollow`.

| Existing graph field | Publish-time change |
| :-- | :-- |
| `Article.wordCount` | Recompute against the final visible article and ACF summary; this preview measures 2,686 reading words |
| `Article.dateModified`, `WebPage.dateModified` | Actual approved publication/merge timestamp, not automatically the preview drafting timestamp |
| `Article.datePublished` | Preserve `2026-06-11T10:40:10+00:00` |
| `Article.headline` and corresponding visible page title | What Is an MVNO? Business Models and How to Launch |
| `Article.keywords` | Approved tags and targeting in Output A, reconciled with actual publication fields |
| Meta / graph `description` | The 151-character approved description above |
| `Article.author` / Person | SivaSai, as precomputed for M02; retain the user's exact biography and add no invented reviewer |
| Existing breadcrumb terminal label | Follow the updated title; keep the existing breadcrumb graph and URL hierarchy |
| `articleSection`, canonical and graph IDs | Keep MVNO/category and existing destination identity |
| Featured image | Retain the existing title-specific media asset; no second ImageObject graph authored |

If the six visible FAQ questions are retained at publication, add their exact question and answer text through the existing Yoast/ACF graph integration. Do not emit a second script or a second Article/BreadcrumbList. Native collapsed answers are available to readers through the visible controls. This is machine-readable content, not a promise of FAQ rich results. No reviewer schema credit until the user supplies the name and role and review is completed.

## Output G: scorecard and publication hold

Scores are editorial judgments, not measured rankings or a claim of a completed technical review.

| Check | Score | Evidence / limit |
| :-- | --: | :-- |
| Intent match | 8 | Definition first, familiar examples, mechanism, models, costs and enterprise decision support; controlled rankings not measured |
| Answer-first | 9 | TL;DR plus seven standalone H2 openings within 40 to 60 words |
| Information gain | 8 | Three distinct implemented RocketPhone treatments plus labelled buyer worksheet; sample-wide novelty only |
| E-E-A-T | **7, HOLD** | Approved case, author, dates and sources; named technical review and four brief inputs remain open |
| Coverage | 8 | All 15 editorial fan-out questions and 12 mapped long tails addressed; actual PAA panel not measured |
| Accuracy | 8 | Primary sources, no fabricated scale/duration/financial result, documented boundaries; SME review pending |
| Readability | 9 | Four tables, six callouts, short paragraphs, zero banned matches or prohibited dashes |
| Internal links | 9 | Nine unique targets, six spokes, no donor URLs, CTA-only repetition |
| External links | 9 | Six primary sources read and tied to explicit claim boundaries |
| Conversion | 8 | Three relevant operating-model CTAs and one cost-tool link |
| Length | 9 | 2,686 words including TL;DR |
| Merge completeness | 9 | P1 through P14 preserved; every KEEP item mapped and retained fragments verified |

**The below-8 score cannot be resolved by further unsupported writing.** The technical reviewer is the user's decision. No name or review has been invented to raise the score. This is a reviewable held preview, not a publication-ready article.

### Human inputs still needed

1. `[EVIDENCE NEEDED: RocketPhone subscriber or device cohort size, measurement date and launch versus current scope, from the Spenza delivery owner with customer approval.]`
2. `[EVIDENCE NEEDED: dated RocketPhone start and end milestones, their definitions and excluded prerequisites, from the project owner.]`
3. `[EVIDENCE NEEDED: one redacted operations screenshot, capture date and permission to publish, from the delivery or product owner.]`
4. `[EVIDENCE NEEDED: technical reviewer's name and role, from the user.]`

There are zero `[VERIFY]` markers. The reviewer should confirm the general radio/core distinctions, optional enabling roles, RocketPhone SIP description, cost boundaries and service-specific obligations. The case already supplies qualitative launch scope; none of the four open requests should be reinterpreted as a claim that there is no approved MVNO case.

### Verification

[Browser results](./M02-browser-qa.json), [content results](./M02-content-qa.json).

- `MEDIA_ORIGIN=https://media.spenza.com NOINDEX=1 npm run build`: pass, 911 pages. No production publish.
- `npm run wp:optimize-css`: completed. Its unrelated shared-bundle churn was restored from the clean baseline; the new M02 styles are scoped and inline. No live style bundle changes retained.
- `npm run wp:verify-dist -- https://media.spenza.com`: zero missing references and zero stranded local media.
- `BASE=http://localhost:4333 npm run wp:audit`: zero broken asset references across 487 indexed pages.
- `BASE=http://localhost:4333 npm run wp:audit-links`: 633 unique links, 18,856 occurrences; one existing unrelated malformed `/mvno/resell-data-plans-shopify/]/` link on `/mvno/msp-reselling-connectivity-with-hardware/`. Not changed. M02's own nine planned internal targets resolve directly with HTTP 200.
- `VERBOSE=1 npm run merge:qa -- M02`: all 13 mechanical checks pass. Corrected its FAQ rule to count questions within FAQ sections; three normal H3 questions are not additional FAQs. No other cluster was run through this gate.
- Browser checks on the production build at port 4333: four images load, five TL;DR cards and icon glyphs render, breadcrumb/byline/author bio/related area present, zero leftover SLOT markers, noindex/nofollow, zero JSON-LD and no canonical. Native FAQ click, Enter, Space and no-JavaScript checks pass. One answer opens at a time.
- At 390px width, page width is 390px. All four tables scroll within their own 357px containers. Desktop and mobile FAQ screenshots inspected. The existing scroll-triggered newsletter popup was suppressed only in the browser test session using its `popupSubmitted` session flag; no site behavior was changed.
- All 16 checked fragments (`-0` through `-14`, plus `FAQs`) exist once. A script confined to M02's preview assigns separate shell IDs before the shared TOC runs; the live ArticleLayout and other previews remain unchanged by this fix.
- Final `npx astro check`: **0 errors, 0 warnings**, 72 existing hints across 330 files.

### Future publication actions, none executed

After technical approval and separate publication authorization: apply the approved body and ACF summary to the existing destination, preserve its publish date, set the actual modification date and update Yoast's existing graph. Upload only genuinely new artwork and replace staging references once media delivery is verified. Retire the two donors, apply direct 301s, retarget old aliases, replace contextual donor links and regenerate archives/sitemaps. Check the live schema, request indexing, submit through the site's IndexNow path, and compare destination performance after 14, 28 and 56 days. No outcome is guaranteed.

## Commit record

- `6530d55`: Phase 1 to 4 research and approved outline preparation.
- `4f7c596`: new role diagram, optimized assets and image provenance.
- Concurrent commit `a9ebf8b` included the already-written M02 article, manifest, queue status, preview fragment guard and browser/inbound records, alongside the new editorial gate. Separate article/registration commits therefore had no remaining diff. Its commit-message claim of nine M02 FAQs is a counting error: there are six FAQs and three other H3 questions. Existing history was not amended.
- `f6c4ff4`: correct the gate's FAQ section counting; M02 passes.
- This report and final measured content record are committed separately at the Phase 6 stop. No push.

**STOP: M02 only. Do not begin M03 or any other cluster without the user's instruction.**
