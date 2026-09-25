# M13 Phase 6: preview and handoff

Preview: http://localhost:4321/preview/merged/telecom-compliance-audits/

Registered status: preview. Author: SivaSai / sivasai; no flip. Author-only byline; no reviewer claim.

## Measured QA

Before: 4918 combined live body words (2 posts). After: 2411 words including the merged TL;DR (2265 body words). 0 em dashes, 0 en dashes, 9 internal destinations, 4 external sources, 3 tables, 2 body figures. Exact H2/FAQ answer lengths and metadata lengths: M13-content-qa.json. Link responses: M13-link-check.json.

Gate and Astro results are recorded after the final validation below. Browser validation is in M13-browser-qa.json: five TL;DR cards with icons, loaded images, responsive tables, click/keyboard FAQ expansion, noindex/nofollow, no canonical or extra schema graph, no unresolved slots.

## Image handoff

All 6 source candidates inspected; keep/reject reasons and live srcsets in M13-image-inventory.json. 1 published assets reused by URL, 2 new body assets with PNG/WebP twins. New artwork was inspected after optimisation; labels remain readable and correctly spelled. No local copy of published media. Prompts: M13-image-prompts.md.

## Output F: schema delta only

At eventual publication, update the existing Yoast Article headline to “Telecom Expense Audit: Workflow and Downloadable Checklist”, description to the final SEO description, wordCount to 2411, dateModified to the actual publication date, and keywords to the approved article topics. Retain Article/WebPage/BreadcrumbList/Organization/Person identities and datePublished. No reviewer property. No replacement graph. FAQPage is optional only if it mirrors the six visible questions and existing output does not already supply it; rich-result eligibility is not promised. Preview intentionally emits no schema graph.

## Output E: proposed consolidation and inbound links

- /tem/telecom-expense-audit-checklist/ -> /tem/telecom-compliance-audits/

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
| Length | 9 | 2411 including TL;DR |
| Merge completeness | 8 | Source-specific retained themes mapped and unsupported claims dropped |

Scores are editorial judgments. Information gain 7 is explicitly accepted for preview; it is not a completed evidence claim. Final metadata: M13-final-metadata.json. Implemented outline: M13-final-outline.json. Link plan: M13-link-plan.md. Human inputs: TEM-evidence-requests.md.

Post-publication actions, deferred: implement the approved redirect/inbound plan, remove retired sources from sitemap, request indexing in GSC and Bing IndexNow, then track at 14, 28 and 56 days. No publishing action performed.

## Final validation

`npm run merge:qa -- M13` PASS. `npx astro check`: 0 errors, 0 warnings, 72 existing hints. Browser PASS for cards/icons, FAQ interaction, responsive tables, loaded WebP and preview indexing/schema safeguards. All direct article links returned 200; new downloads verified against local preview origin, since they are not published. HTML checkbox click/keyboard and both file downloads tested. PDF rendered as two A4 pages and both visually inspected with no clipping; all fourteen IDs present. CSV and PDF share the article checks. Print source and canonical check data retained with research for maintenance.

Two optimized body illustrations inspected at 800px. Published donor checklist hero referenced with its existing srcset, no local copy. Additional Output F delta: update the existing image/thumbnail references to the chosen published checklist hero at eventual publication; no second ImageObject graph or reviewer assertion.

CSS optimization completed; unrelated baseline generated bundle churn discarded.
