# M43 Phase 6: preview and handoff

Preview: http://localhost:4321/preview/merged/dual-sim-esim/

Registered status: preview. Author: Spenza / isimplexity; no flip. Author-only byline; no reviewer claim.

## Measured QA

Before: 2951 combined live body words (2 posts). After: 2534 words including the merged TL;DR (2400 body words). 0 em dashes, 0 en dashes, 7 internal destinations, 6 external sources, 3 tables, 2 body figures. Exact H2/FAQ answer lengths and metadata lengths: M43-content-qa.json. Link responses: M43-link-check.json.

Gate and Astro results are recorded after the final validation below. Browser validation is in M43-browser-qa.json: five TL;DR cards with icons, loaded images, responsive tables, click/keyboard FAQ expansion, noindex/nofollow, no canonical or extra schema graph, no unresolved slots.

## Image handoff

All 9 source candidates inspected; keep/reject reasons and live srcsets in M43-image-inventory.json. 1 published assets reused by URL, 2 new body assets with PNG/WebP twins. New artwork was inspected after optimisation; labels remain readable and correctly spelled. No local copy of published media. Prompts: M43-image-prompts.md.

## Output F: schema delta only

At eventual publication, update the existing Yoast Article headline to “Dual SIM eSIM for Business: Setup, Billing and Limits”, description to the final SEO description, wordCount to 2534, dateModified to the actual publication date, and keywords to the approved article topics. Retain Article/WebPage/BreadcrumbList/Organization/Person identities and datePublished. No reviewer property. No replacement graph. FAQPage is optional only if it mirrors the six visible questions and existing output does not already supply it; rich-result eligibility is not promised. Preview intentionally emits no schema graph.

## Output E: proposed consolidation and inbound links

- /telecom/dual-esim-support-iphone-13/ -> /esim/dual-sim-esim/

These are proposed future mappings only. No redirects or WordPress changes made. Search inbound references to each donor before publication, then point them directly to the destination. Current article links avoid every donor in the full merge plan. Preserve existing destination/category and retained heading anchors documented in the Merge Map.

## Output G: QA scorecard

| Check | Score | Basis |
|---|---:|---|
| Intent match | 9 | Defined enterprise buyer task and observed search sample |
| Answer-first | 9 | Standalone TL;DR and H2 answers |
| Information gain | 7 | Held; missing approved first-hand records |
| E-E-A-T | 8 | Resolved author, date, scoped published case and primary sources; no reviewer by decision |
| Coverage | 8 | Fan-out and long-tail map covered; complete PAA/top-ten measurement unavailable |
| Accuracy | 9 | Unsupported figures and guarantees removed |
| Readability | 9 | Short paragraphs, tables, callouts, expandable FAQs, zero banned dashes |
| Internal links | 9 | 7 destinations; no full-plan donor links |
| External links | 9 | 6 verified primary sources |
| Conversion | 8 | Contextual actions match enterprise buyer task |
| Length | 9 | 2534 including TL;DR |
| Merge completeness | 8 | Source-specific retained themes mapped and unsupported claims dropped |

Scores are editorial judgments. Information gain 7 is explicitly accepted for preview; it is not a completed evidence claim. Final metadata: M43-final-metadata.json. Implemented outline: M43-final-outline.json. Link plan: M43-link-plan.md. Human inputs: BYOD-evidence-requests.md.

Post-publication actions, deferred: implement the approved redirect/inbound plan, remove retired sources from sitemap, request indexing in GSC and Bing IndexNow, then track at 14, 28 and 56 days. No publishing action performed.

Final verification: merge:qa M43 PASS; Astro 0 errors and 0 warnings (72 existing hints); browser PASS including native FAQ click/keyboard, responsive tables and mobile width. All final article links returned 200. Both optimized WebP figures inspected at 1024px: exact labels remain readable on light plaques, full colour fields and distinct visual relationships. CSS optimizer completed; unrelated baseline bundle churn excluded.
