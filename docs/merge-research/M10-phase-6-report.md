# M10 Phase 6: preview and handoff

Preview: http://localhost:4321/preview/merged/business-mobile-cost-quality/

Registered status: preview. Author: SivaSai / sivasai; flipped from Spenza. Author-only byline; no reviewer claim.

## Measured QA

Before: 8501 combined live body words (4 posts). After: 2430 words including the merged TL;DR (2286 body words). 0 em dashes, 0 en dashes, 9 internal destinations, 4 external sources, 3 tables, 2 body figures. Exact H2/FAQ answer lengths and metadata lengths: M10-content-qa.json. Link responses: M10-link-check.json.

Gate and Astro results are recorded after the final validation below. Browser validation is in M10-browser-qa.json: five TL;DR cards with icons, loaded images, responsive tables, click/keyboard FAQ expansion, noindex/nofollow, no canonical or extra schema graph, no unresolved slots.

## Image handoff

All 12 source candidates inspected; keep/reject reasons and live srcsets in M10-image-inventory.json. 1 published assets reused by URL, 2 new body assets with PNG/WebP twins. New artwork was inspected after optimisation; labels remain readable and correctly spelled. No local copy of published media. Prompts: M10-image-prompts.md.

## Output F: schema delta only

At eventual publication, update the existing Yoast Article headline to “Business Mobile Cost Optimization Without Losing Quality”, description to the final SEO description, wordCount to 2430, dateModified to the actual publication date, and keywords to the approved article topics. Retain Article/WebPage/BreadcrumbList/Organization/Person identities and datePublished. No reviewer property. No replacement graph. FAQPage is optional only if it mirrors the six visible questions and existing output does not already supply it; rich-result eligibility is not promised. Preview intentionally emits no schema graph.

## Output E: proposed consolidation and inbound links

- /tem/wireless-expense-management-challenges/ -> /tem/business-mobile-cost-quality/
- /telecom/wireless-telecom-expense-management/ -> /tem/business-mobile-cost-quality/
- /tem/traditional-connectivity-plans/ -> /tem/business-mobile-cost-quality/

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
| Internal links | 9 | 9 destinations; no full-plan donor links |
| External links | 9 | 4 verified primary sources |
| Conversion | 8 | Contextual actions match enterprise buyer task |
| Length | 9 | 2430 including TL;DR |
| Merge completeness | 8 | Source-specific retained themes mapped and unsupported claims dropped |

Scores are editorial judgments. Information gain 7 is explicitly accepted for preview; it is not a completed evidence claim. Final metadata: M10-final-metadata.json. Implemented outline: M10-final-outline.json. Link plan: M10-link-plan.md. Human inputs: TEM-evidence-requests.md.

Post-publication actions, deferred: implement the approved redirect/inbound plan, remove retired sources from sitemap, request indexing in GSC and Bing IndexNow, then track at 14, 28 and 56 days. No publishing action performed.

## Final validation

`npm run merge:qa -- M10` PASS. `npx astro check`: 0 errors, 0 warnings, 72 existing hints. Browser PASS for five cards/icons, FAQ click/keyboard, mobile table scrolling, WebP loading, noindex and no preview schema/canonical. Both optimized new illustrations inspected at 800px. Published hero unchanged; no copied media assets. CSS optimization completed; unrelated baseline generated bundle churn discarded. All direct URL checks 200 except FCC BDC 403 to automated fetch; official content independently opened through web access and claim verified.

Additional Output F delta: replace the stale destination author reference with the existing SivaSai/sivasai identity when publishing, matching the visible majority byline. No new Person graph or reviewer assertion.
