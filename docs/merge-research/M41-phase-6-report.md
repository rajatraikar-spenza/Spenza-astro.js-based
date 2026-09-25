# M41 Phase 6: preview and handoff

Preview: http://localhost:4321/preview/merged/esim-vs-physical-sim-airport-decision/

Registered status: preview. Author: SivaSai / sivasai; no flip. Author-only byline; no reviewer claim.

## Measured QA

Before: 3700 combined live body words (2 posts). After: 2298 words including the merged TL;DR (2152 body words). 0 em dashes, 0 en dashes, 6 internal destinations, 5 external sources, 3 tables, 1 body figures. Exact H2/FAQ answer lengths and metadata lengths: M41-content-qa.json. Link responses: M41-link-check.json.

Gate and Astro results are recorded after the final validation below. Browser validation is in M41-browser-qa.json: five TL;DR cards with icons, loaded images, responsive tables, click/keyboard FAQ expansion, noindex/nofollow, no canonical or extra schema graph, no unresolved slots.

## Image handoff

All 6 source candidates inspected; keep/reject reasons and live srcsets in M41-image-inventory.json. 1 published assets reused by URL, 1 new body assets with PNG/WebP twins. New artwork was inspected after optimisation; labels remain readable and correctly spelled. No local copy of published media. Prompts: M41-image-prompts.md.

## Output F: schema delta only

At eventual publication, update the existing Yoast Article headline to “Travel eSIM vs Physical SIM: Make the Airport Decision Before You Fly”, description to the final SEO description, wordCount to 2298, dateModified to the actual publication date, and keywords to the approved article topics. Retain Article/WebPage/BreadcrumbList/Organization/Person identities and datePublished. No reviewer property. No replacement graph. FAQPage is optional only if it mirrors the six visible questions and existing output does not already supply it; rich-result eligibility is not promised. Preview intentionally emits no schema graph.

## Output E: proposed consolidation and inbound links

- /esim/esim-for-travellers/ -> /esim/esim-vs-physical-sim-airport-decision/

These are proposed future mappings only. No redirects or WordPress changes made. The observed built-site inbound references are inventoried in RESELLER-inbound-links.json; refresh that inventory before publication, then point those links directly to the destination. Current article links avoid every donor in the full merge plan. Preserve existing destination/category and retained heading anchors documented in the Merge Map.

## Output G: QA scorecard

| Check | Score | Evidence or limitation |
|---|---:|---|
| Intent match | 9 | Traveller comparison and setup task; small optional business CTA |
| Answer-first | 9 | Opening answer, TL;DR and all seven H2 answer blocks |
| Information gain | 7 | Held; original walkthrough and approved economics remain missing |
| E-E-A-T | 8 | Resolved author, dated primary sources, bounded case; author-only decision |
| Coverage | 8 | Planned fan-out questions covered; PAA and full top-ten measurement unavailable |
| Accuracy | 9 | Removed unsupported prices, speed and device universals |
| Readability | 9 | Three tables, four callouts, six expandable FAQs; zero banned dashes |
| Internal links | 9 | Six destinations, pillar in introduction, no plan donors |
| External links | 9 | Five primary URLs, all HTTP 200 |
| Conversion | 8 | Brief's consumer-intent exception: one small optional business CTA |
| Length | 9 | 2,298 including TL;DR |
| Merge completeness | 8 | Preserves useful checklist and setup intent; removes unsupported claims |

Final validation: merge:qa M41 PASS; Astro 0 errors, 0 warnings, 72 existing hints. Browser PASS after final edits. PNG/WebP visually inspected after optimisation, labels intact. CSS optimisation completed; unrelated baseline bundle churn excluded. Full hub link inventory and consolidated requests follow in the final handoff.

Final handoff: [Output A](M41-final-metadata.json), [final implemented Output C](M41-final-outline.json), [Output E](M41-link-plan.md), [consolidated human inputs](RESELLER-evidence-requests.md). These final metadata values supersede draft wording/counts in phase 4. Scores are editorial judgments; information gain remains 7 and is accepted for preview under the current user instruction.

Post-publication actions, deferred: execute the approved redirect and inbound-link plan, remove retired source URLs from the sitemap, request destination indexing in GSC, submit to Bing through IndexNow, then measure at 14, 28 and 56 days. Current run performs none of these publishing actions.
