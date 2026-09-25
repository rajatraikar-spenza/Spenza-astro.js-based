# M26 Phase 6: preview and handoff

Preview: http://localhost:4321/preview/merged/mobile-esim-plans/

Registered status: preview. Author: Vinaychandra Bharadwaj / vinay; no flip. Author-only byline; no reviewer claim.

## Measured QA

Before: 2543 combined live body words (2 posts). After: 2306 words including the merged TL;DR (2173 body words). 0 em dashes, 0 en dashes, 8 internal destinations, 4 external sources, 3 tables, 1 body figures. Exact H2/FAQ answer lengths and metadata lengths: M26-content-qa.json. Link responses: M26-link-check.json.

Editorial scorecard: intent 9; structure 9; technical scope 8; evidence attribution 8; information gain **7, held**; clarity 9; linking 9; image usefulness 8. These are editorial judgments, not automated or comparative supplier scores. The missing first-hand evidence remains in the research artifact and consolidated hub request document.

Gate and Astro results are recorded after the final validation below. Browser validation is in M26-browser-qa.json: five TL;DR cards with icons, loaded images, responsive tables, click/keyboard FAQ expansion, noindex/nofollow, no canonical or extra schema graph, no unresolved slots.

## Output E: images

All 3 source candidates inspected; keep/reject reasons and live srcsets in M26-image-inventory.json. 1 published assets reused by URL, 1 new body assets with PNG/WebP twins. New artwork was inspected after optimisation; labels remain readable and correctly spelled. No local copy of published media. Prompts: M26-image-prompts.md.

## Output F: schema delta only

At eventual publication, update the existing Yoast Article headline to “Connectivity Loyalty Programs: eSIM Rewards That Can Be Measured”, description to the final SEO description, wordCount to 2306, dateModified to the actual publication date, and keywords to the approved article topics. Retain Article/WebPage/BreadcrumbList/Organization/Person identities and datePublished. No reviewer property. No replacement graph. FAQPage is optional only if it mirrors the six visible questions and existing output does not already supply it; rich-result eligibility is not promised. Preview intentionally emits no schema graph.

## Output G: proposed consolidation and inbound links

- /telecom/esim-data-plans/ -> /telecom/mobile-esim-plans/

These are proposed future mappings only. No redirects or WordPress changes made. Search inbound references to each donor before publication, then point them directly to the destination. Current article links avoid every donor in the full merge plan. Preserve existing destination/category and retained heading anchors documented in the Merge Map.

Final validation: `npm run merge:qa -- M26` PASS; `npx astro check`: 0 errors, 0 warnings, 72 existing hints. Browser PASS. All final article links returned HTTP 200; the Revolut reference uses its official durable PDF because the HTML endpoint blocked the direct checker. CSS optimiser completed and unrelated mirror bundle churn was excluded. Information gain remains 7; no loyalty uplift is asserted.
