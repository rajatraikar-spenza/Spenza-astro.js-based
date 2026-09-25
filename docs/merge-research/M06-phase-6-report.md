# M06 Phase 6: preview and handoff

Preview: http://localhost:4321/preview/merged/what-is-telecom-expense-management-tem/

Registered status: preview. Author: Vinaychandra Bharadwaj / vinay; no flip. Author-only byline; no reviewer claim.

## Measured QA

Before: 11213 combined live body words (4 posts). After: 2389 words including the merged TL;DR (2252 body words). 0 em dashes, 0 en dashes, 8 internal destinations, 4 external sources, 3 tables, 2 body figures. Exact H2/FAQ answer lengths and metadata lengths: M06-content-qa.json. Link responses: M06-link-check.json.

Gate and Astro results are recorded after the final validation below. Browser validation is in M06-browser-qa.json: five TL;DR cards with icons, loaded images, responsive tables, click/keyboard FAQ expansion, noindex/nofollow, no canonical or extra schema graph, no unresolved slots.

## Image handoff

All 22 source candidates inspected; keep/reject reasons and live srcsets in M06-image-inventory.json. 1 published assets reused by URL, 2 new body assets with PNG/WebP twins. New artwork was inspected after optimisation; labels remain readable and correctly spelled. No local copy of published media. Prompts: M06-image-prompts.md.

## Output F: schema delta only

At eventual publication, update the existing Yoast Article headline to “What Is Telecom Expense Management? A Buyer's Guide”, description to the final SEO description, wordCount to 2389, dateModified to the actual publication date, and keywords to the approved article topics. Retain Article/WebPage/BreadcrumbList/Organization/Person identities and datePublished. No reviewer property. No replacement graph. FAQPage is optional only if it mirrors the six visible questions and existing output does not already supply it; rich-result eligibility is not promised. Preview intentionally emits no schema graph.

## Output E: proposed consolidation and inbound links

- /tem/tem/ -> /tem/what-is-telecom-expense-management-tem/
- /telecom/telecom-expense-management/ -> /tem/what-is-telecom-expense-management-tem/
- /tem/benefits-telecom-expense-management-tem/ -> /tem/what-is-telecom-expense-management-tem/

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
| External links | 9 | 4 verified primary sources |
| Conversion | 8 | Contextual actions match enterprise buyer task |
| Length | 9 | 2389 including TL;DR |
| Merge completeness | 8 | Source-specific retained themes mapped and unsupported claims dropped |

Scores are editorial judgments. Information gain 7 is explicitly accepted for preview; it is not a completed evidence claim. Final metadata: M06-final-metadata.json. Implemented outline: M06-final-outline.json. Link plan: M06-link-plan.md. Human inputs: TEM-evidence-requests.md.

Post-publication actions, deferred: implement the approved redirect/inbound plan, remove retired sources from sitemap, request indexing in GSC and Bing IndexNow, then track at 14, 28 and 56 days. No publishing action performed.

## Final validation

25 September 2026: `npm run merge:qa -- M06` PASS; `npx astro check` 0 errors, 0 warnings, 72 existing hints. Browser PASS at desktop and 390px: five TL;DR cards/icons, six click/keyboard FAQs, all WebP images loaded, tables scroll without document overflow. Two optimized illustrations visually inspected at 800px; concepts remain distinct, no tiny text, full colour field and paper depth. Published hero left unchanged. CSS optimization completed; its unrelated baseline generated bundle churn was discarded.

Direct link probe: all article URLs returned 200 except TM Forum (403 to automated fetch). The same TM Forum page was opened and read through web access on the same date; its Revenue Assurance Maturity Model supports the cited process-improvement distinction. No broken-page claim or invented HTTP success.
