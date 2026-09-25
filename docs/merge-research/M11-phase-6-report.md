# M11 Phase 6: preview and handoff

Preview: http://localhost:4321/preview/merged/white-label-telecom-reseller-guide/

Registered status: preview. Author: SivaSai / sivasai; no flip. Author-only byline; no reviewer claim.

## Measured QA

Before: 6830 combined live body words (4 posts). After: 2289 words including the merged TL;DR (2154 body words). 0 em dashes, 0 en dashes, 9 internal destinations, 4 external sources, 3 tables, 2 body figures. Exact H2/FAQ answer lengths and metadata lengths: M11-content-qa.json. Link responses: M11-link-check.json.

Gate and Astro results are recorded after the final validation below. Browser validation is in M11-browser-qa.json: five TL;DR cards with icons, loaded images, responsive tables, click/keyboard FAQ expansion, noindex/nofollow, no canonical or extra schema graph, no unresolved slots.

## Image handoff

All 16 source candidates inspected; keep/reject reasons and live srcsets in M11-image-inventory.json. 1 published assets reused by URL, 2 new body assets with PNG/WebP twins. New artwork was inspected after optimisation; labels remain readable and correctly spelled. No local copy of published media. Prompts: M11-image-prompts.md.

## Output F: schema delta only

At eventual publication, update the existing Yoast Article headline to “White-Label Telecom Reseller: Models, Margins and Launch”, description to the final SEO description, wordCount to 2289, dateModified to the actual publication date, and keywords to the approved article topics. Retain Article/WebPage/BreadcrumbList/Organization/Person identities and datePublished. No reviewer property. No replacement graph. FAQPage is optional only if it mirrors the six visible questions and existing output does not already supply it; rich-result eligibility is not promised. Preview intentionally emits no schema graph.

## Output E: proposed consolidation and inbound links

- /telecom/white-label-telecom-reseller/ -> /telecom/white-label-telecom-reseller-guide/
- /telecom/white-label-telecom-benefits/ -> /telecom/white-label-telecom-reseller-guide/
- /telecom/white-label-voip-change/ -> /telecom/white-label-telecom-reseller-guide/

These are proposed future mappings only. No redirects or WordPress changes made. The observed built-site inbound references are inventoried in RESELLER-inbound-links.json; refresh that inventory before publication, then point those links directly to the destination. Current article links avoid every donor in the full merge plan. Preserve existing destination/category and retained heading anchors documented in the Merge Map.

Final validation: `npm run merge:qa -- M11` PASS; complete preview gate 32/32 PASS after replacing the obsolete figure quota with image/alt validation. `npx astro check`: 0 errors, 0 warnings, 72 existing hints. All article links returned HTTP 200. CSS optimiser completed; unrelated regenerated mirror bundles were excluded. No article layout or live-post changes.

## Output G: QA scorecard

| Check | Score | Evidence or limitation |
|---|---:|---|
| Intent match | 9 | Matches the defined buyer task and observed search sample |
| Answer-first | 9 | TL;DR and every H2 provide self-contained answers |
| Information gain | 7 | Held; practical synthesis, missing approved first-hand records |
| E-E-A-T | 8 | Resolved author, update date, bounded field note and primary sources; no reviewer by decision |
| Coverage | 8 | Mapped fan-out questions covered; PAA/full top-ten coverage not measured |
| Accuracy | 9 | Unsupported figures and guarantees removed; examples labelled |
| Readability | 9 | Short paragraphs, tables, callouts and six expandable FAQs |
| Internal links | 9 | 9 destinations; no links to any donor in the full plan |
| External links | 9 | 4 primary sources, verified HTTP 200 |
| Conversion | 8 | Contextual CTAs appropriate to the article's task |
| Length | 9 | 2289 words including TL;DR |
| Merge completeness | 8 | Useful retained source themes mapped; unsupported claims removed |

Final handoff: [Output A](M11-final-metadata.json), [final implemented Output C](M11-final-outline.json), [Output E](M11-link-plan.md), [consolidated human inputs](RESELLER-evidence-requests.md). These final metadata values supersede draft wording/counts in phase 4. Scores are editorial judgments; information gain remains 7 and is accepted for preview under the current user instruction.

Post-publication actions, deferred: execute the approved redirect and inbound-link plan, remove retired source URLs from the sitemap, request destination indexing in GSC, submit to Bing through IndexNow, then measure at 14, 28 and 56 days. Current run performs none of these publishing actions.
