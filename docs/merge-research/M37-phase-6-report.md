# M37 Phase 6: preview and handoff

Preview: http://localhost:4321/preview/merged/byod-in-2025-benefits-risks-and-best-practices/

Registered status: preview. Author: Spenza / isimplexity; no flip. Author-only byline; no reviewer claim.

## Measured QA

Before: 5801 combined live body words (3 posts). After: 2444 words including the merged TL;DR (2302 body words). 0 em dashes, 0 en dashes, 8 internal destinations, 5 external sources, 3 tables, 2 body figures. Exact H2/FAQ answer lengths and metadata lengths: M37-content-qa.json. Link responses: M37-link-check.json.

Gate and Astro results are recorded after the final validation below. Browser validation is in M37-browser-qa.json: five TL;DR cards with icons, loaded images, responsive tables, click/keyboard FAQ expansion, noindex/nofollow, no canonical or extra schema graph, no unresolved slots.

## Image handoff

All 13 source candidates inspected; keep/reject reasons and live srcsets in M37-image-inventory.json. 1 published assets reused by URL, 2 new body assets with PNG/WebP twins. New artwork was inspected after optimisation; labels remain readable and correctly spelled. No local copy of published media. Prompts: M37-image-prompts.md.

## Output F: schema delta only

At eventual publication, update the existing Yoast Article headline to “BYOD Benefits, Risks and Best Practices for Enterprise Teams”, description to the final SEO description, wordCount to 2444, dateModified to the actual publication date, and keywords to the approved article topics. Retain Article/WebPage/BreadcrumbList/Organization/Person identities and datePublished. No reviewer property. No replacement graph. FAQPage is optional only if it mirrors the six visible questions and existing output does not already supply it; rich-result eligibility is not promised. Preview intentionally emits no schema graph.

The selected featured asset differs from the former destination hero: update the existing Yoast image/thumbnail references and their ImageObject metadata to match the final manifest at publication, without adding a duplicate graph.

## Output E: proposed consolidation and inbound links

- /byod/byod/ -> /byod/byod-in-2025-benefits-risks-and-best-practices/
- /byod/byod-planning/ -> /byod/byod-in-2025-benefits-risks-and-best-practices/

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
| Internal links | 9 | 8 destinations; no full-plan donor links |
| External links | 9 | 5 verified primary sources |
| Conversion | 8 | Contextual actions match enterprise buyer task |
| Length | 9 | 2444 including TL;DR |
| Merge completeness | 8 | Source-specific retained themes mapped and unsupported claims dropped |

Scores are editorial judgments. Information gain 7 is explicitly accepted for preview; it is not a completed evidence claim. Final metadata: M37-final-metadata.json. Implemented outline: M37-final-outline.json. Link plan: M37-link-plan.md. Human inputs: BYOD-evidence-requests.md.

Post-publication actions, deferred: implement the approved redirect/inbound plan, remove retired sources from sitemap, request indexing in GSC and Bing IndexNow, then track at 14, 28 and 56 days. No publishing action performed.

Final validation: merge:qa M37 PASS; Astro 0 errors, 0 warnings, 72 existing hints. Browser PASS; all article links HTTP 200. Both body WebPs inspected at 1024px after optimization: labels legible, no cropped content, correct text/background treatment. CSS optimizer completed; unrelated baseline bundle churn excluded. Published hero remains a media URL. No changes to live article layout.
