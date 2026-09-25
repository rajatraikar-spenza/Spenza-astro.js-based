# M05 Phase 6: preview and handoff

Preview: http://localhost:4321/preview/merged/skype-alternatives/

Registered status: preview. Author: SivaSai / sivasai; flipped from Spenza. Author-only byline; no reviewer claim.

## Measured QA

Before: 7878 combined live body words (3 posts). After: 2385 words including the merged TL;DR (2241 body words). 0 em dashes, 0 en dashes, 8 internal destinations, 7 external sources, 3 tables, 2 body figures. Exact H2/FAQ answer lengths and metadata lengths: M05-content-qa.json. Link responses: M05-link-check.json.

Gate and Astro results are recorded after the final validation below. Browser validation is in M05-browser-qa.json: five TL;DR cards with icons, loaded images, responsive tables, click/keyboard FAQ expansion, noindex/nofollow, no canonical or extra schema graph, no unresolved slots.

## Image handoff

All 14 source candidates inspected; keep/reject reasons and live srcsets in M05-image-inventory.json. 1 published assets reused by URL, 2 new body assets with PNG/WebP twins. New artwork was inspected after optimisation; labels remain readable and correctly spelled. No local copy of published media. Prompts: M05-image-prompts.md.

## Output F: schema delta only

At eventual publication, update the existing Yoast Article headline to “Skype Alternatives for Business: Calls, Numbers and Continuity”, description to the final SEO description, wordCount to 2385, dateModified to the actual publication date, and keywords to the approved article topics. Retain Article/WebPage/BreadcrumbList/Organization/Person identities and datePublished. No reviewer property. No replacement graph. FAQPage is optional only if it mirrors the six visible questions and existing output does not already supply it; rich-result eligibility is not promised. Preview intentionally emits no schema graph.

## Output E: proposed consolidation and inbound links

- /telecom/skype-shutdown-explained/ -> /telecom/skype-alternatives/
- /telecom/skype-retirement-2025-migration-strategy/ -> /telecom/skype-alternatives/

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
| External links | 9 | 7 verified primary sources |
| Conversion | 8 | Contextual actions match enterprise buyer task |
| Length | 9 | 2385 including TL;DR |
| Merge completeness | 8 | Source-specific retained themes mapped and unsupported claims dropped |

Scores are editorial judgments. Information gain 7 is explicitly accepted for preview; it is not a completed evidence claim. Final metadata: M05-final-metadata.json. Implemented outline: M05-final-outline.json. Link plan: M05-link-plan.md. Human inputs: AIVOICE-evidence-requests.md.

Post-publication actions, deferred: implement the approved redirect/inbound plan, remove retired sources from sitemap, request indexing in GSC and Bing IndexNow, then track at 14, 28 and 56 days. No publishing action performed.

## Final validation

`npm run merge:qa -- M05`: PASS. `npx astro check`: 0 errors, 0 warnings, 72 existing hints. Browser checks pass for five TL;DR cards/icons, six expandable FAQs with keyboard control, loaded WebP images, mobile table scrolling, breadcrumb, author, related posts and noindex/nofollow. All 15 article links returned HTTP 200, including the retained pillar `/telecom/why-ai-agents-need-real-phone-numbers/`. CSS optimizer run; unrelated baseline generated-bundle churn excluded from the commit. Both new illustrations visually inspected after optimization: clear service relationship and network detour, no text or unsupported measured result.

Additional schema delta: update the existing Article author reference to the resolved SivaSai identity because donors outvoted destination author Spenza. Reuse the existing Person identity; do not append a second graph. Change the existing image/thumbnail reference to the reused donor hero recorded in the manifest, since the original hero made an overbroad retirement claim.
