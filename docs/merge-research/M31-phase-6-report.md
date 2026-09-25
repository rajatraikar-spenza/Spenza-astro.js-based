# M31 Phase 6: preview and handoff

Preview: http://localhost:4321/preview/merged/mobile-plan-management-simplified/

Registered status: preview. Author: Vinaychandra Bharadwaj / vinay; no flip. Author-only byline; no reviewer claim.

## Measured QA

Before: 2487 combined live body words (2 posts). After: 2361 words including the merged TL;DR (2223 body words). 0 em dashes, 0 en dashes, 7 internal destinations, 4 external sources, 3 tables, 3 body figures. Exact H2/FAQ answer lengths and metadata lengths: M31-content-qa.json. Link responses: M31-link-check.json.

Gate and Astro results are recorded after the final validation below. Browser validation is in M31-browser-qa.json: five TL;DR cards with icons, loaded images, responsive tables, click/keyboard FAQ expansion, noindex/nofollow, no canonical or extra schema graph, no unresolved slots.

## Image handoff

All 3 source candidates inspected; keep/reject reasons and live srcsets in M31-image-inventory.json. 1 published assets reused by URL, 3 new body assets with PNG/WebP twins. New artwork was inspected after optimisation; labels remain readable and correctly spelled. No local copy of published media. Prompts: M31-image-prompts.md.

## Output F: schema delta only

At eventual publication, update the existing Yoast Article headline to “Mobile Plan Management: An Enterprise Operations Guide”, description to the final SEO description, wordCount to 2361, dateModified to the actual publication date, and keywords to the approved article topics. Retain Article/WebPage/BreadcrumbList/Organization/Person identities and datePublished. No reviewer property. No replacement graph. FAQPage is optional only if it mirrors the six visible questions and existing output does not already supply it; rich-result eligibility is not promised. Preview intentionally emits no schema graph.

## Output E: proposed consolidation and inbound links

- /tem/wireless-connectivity-management-enterprises/ -> /telecom/mobile-plan-management-simplified/

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
| External links | 9 | 4 verified primary sources |
| Conversion | 8 | Contextual actions match enterprise buyer task |
| Length | 9 | 2361 including TL;DR |
| Merge completeness | 8 | Source-specific retained themes mapped and unsupported claims dropped |

Scores are editorial judgments. Information gain 7 is explicitly accepted for preview; it is not a completed evidence claim. Final metadata: M31-final-metadata.json. Implemented outline: M31-final-outline.json. Link plan: M31-link-plan.md. Human inputs: BYOD-evidence-requests.md.

Post-publication actions, deferred: implement the approved redirect/inbound plan, remove retired sources from sitemap, request indexing in GSC and Bing IndexNow, then track at 14, 28 and 56 days. No publishing action performed.

Final verification: merge:qa M31 PASS; Astro check 0 errors and 0 warnings (72 existing hints); all article links returned 200; browser checks passed, including FAQ click/keyboard, TL;DR, responsive tables and noindex. All three optimized WebP figures inspected at 1024px: readable text on light plaques, distinct objects and relationships, full orange fields. CSS optimizer completed; unrelated baseline bundle churn excluded.
