# M40 Phase 6: preview and handoff

Preview: http://localhost:4321/preview/merged/connectivity-as-a-benefit/

Registered status: preview. Author: Spenza / isimplexity; flipped from SivaSai. Author-only byline; no reviewer claim.

## Measured QA

Before: 4955 combined live body words (3 posts). After: 2374 words including the merged TL;DR (2247 body words). 0 em dashes, 0 en dashes, 7 internal destinations, 4 external sources, 3 tables, 2 body figures. Exact H2/FAQ answer lengths and metadata lengths: M40-content-qa.json. Link responses: M40-link-check.json.

Gate and Astro results are recorded after the final validation below. Browser validation is in M40-browser-qa.json: five TL;DR cards with icons, loaded images, responsive tables, click/keyboard FAQ expansion, noindex/nofollow, no canonical or extra schema graph, no unresolved slots.

## Image handoff

All 9 source candidates inspected; keep/reject reasons and live srcsets in M40-image-inventory.json. 1 published assets reused by URL, 2 new body assets with PNG/WebP twins. New artwork was inspected after optimisation; labels remain readable and correctly spelled. No local copy of published media. Prompts: M40-image-prompts.md.

## Output F: schema delta only

At eventual publication, update the existing Yoast Article headline to “Connectivity as a Benefit: Policy, Costs and Rollout”, description to the final SEO description, wordCount to 2374, dateModified to the actual publication date, and keywords to the approved article topics. Retain Article/WebPage/BreadcrumbList/Organization/Person identities and datePublished. The destination author changes from SivaSai to the resolved Spenza/isimplexity account: update the existing Article author reference and associated author metadata to match that byline through Yoast. Preserve graph identities only where the represented entity is unchanged; do not invent a person or reviewer. No reviewer property. No replacement graph. FAQPage is optional only if it mirrors the six visible questions and existing output does not already supply it; rich-result eligibility is not promised. Preview intentionally emits no schema graph.

The selected featured asset differs from the former destination hero: update the existing Yoast image/thumbnail references and their ImageObject metadata to match the final manifest at publication, without adding a duplicate graph.

## Output E: proposed consolidation and inbound links

- /tem/hidden-mobile-service-costs/ -> /telecom/connectivity-as-a-benefit/
- /telecom/employee-mobile-service/ -> /telecom/connectivity-as-a-benefit/

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
| Length | 9 | 2374 including TL;DR |
| Merge completeness | 8 | Source-specific retained themes mapped and unsupported claims dropped |

Scores are editorial judgments. Information gain 7 is explicitly accepted for preview; it is not a completed evidence claim. Final metadata: M40-final-metadata.json. Implemented outline: M40-final-outline.json. Link plan: M40-link-plan.md. Human inputs: BYOD-evidence-requests.md.

Post-publication actions, deferred: implement the approved redirect/inbound plan, remove retired sources from sitemap, request indexing in GSC and Bing IndexNow, then track at 14, 28 and 56 days. No publishing action performed.

Final verification: merge:qa M40 PASS; Astro 0 errors and 0 warnings (72 existing hints); browser PASS including mobile tables and FAQ keyboard/click. Both optimized WebP figures inspected at 1024px, all labels legible and correctly spelled. Initial NCCoE automated fetch returned 403 despite web access; replaced with the same NIST SP 1800-22 publication on CSRC, which returned 200. All final article links returned 200. SEO description shortened to 151 characters. CSS optimizer completed; unrelated baseline bundle churn excluded.
