# eSIM & Provisioning hub completion

24 September 2026. Seven clusters completed through all six phases in priority order on blog-automation. Each has a separate commit, status preview, a passing editorial gate and an Astro check with zero errors. No push, WordPress write, redirect, slug/category change or other hub work.

Hero title corrections were committed first as e092369. The three existing title layers use Playfair Display Black 900, 44 to 48px measured capital height, three lines maximum, x = 72 and 440 to 600px measured block width. Art and frame pixels outside the title region are unchanged. All three 320px previews were visually inspected and PNG/WebP twins updated. Details: [hero correction report](MVNO-hero-title-correction.md).

Counts below include body and TL;DR. Before is the sum of destination and donors, including their ACF blocks; after is the merged preview including its replacement TL;DR. Images count the hero once and each body figure once, not PNG/WebP variants. Every article has four total images. “New” means a new finished composition using an existing generated blank frame with editable Figma labels, not a fresh image-generation render. Reused images retain live media.spenza.com URLs and source srcsets, with no duplicate local copies.

|Cluster|Destination|Posts merged|Before words|After words|Gate|Images reused / new|Byline / slug|Flipped|Commit|
|---|---|---:|---:|---:|---|---:|---|---|---|
|M01|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|3 → 1|7,310|2,422|PASS|2 / 2|Spenza / isimplexity|No|dda3a09|
|M14|/esim/esim-only-mvnos-2025/|3 → 1|6,752|2,451|PASS|1 / 3|Spenza / isimplexity|No|56ccbb9|
|M28|/esim/esim-for-enterprises-business-enabler-2025/|4 → 1|6,785|2,417|PASS|3 / 1|Spenza / isimplexity|No|a28a74b|
|M30|/esim/iot-esim-introduction/|3 → 1|5,797|2,568|PASS|2 / 2|Vinaychandra Bharadwaj / vinay|No|0d2f526|
|M33|/esim/esim-vs-traditional-sims/|2 → 1|3,805|2,551|PASS|1 / 3|SivaSai / sivasai|No|91a7771|
|M36|/esim/esim-for-smart-devices-2025/|3 → 1|6,853|2,586|PASS|1 / 3|Spenza / isimplexity|No|1b057f4|
|M42|/esim/esim-orchestration-global-iot/|3 → 1|7,958|2,508|PASS|3 / 1|Spenza / isimplexity|No|0398c15|

Total: 21 source posts become 7 previews; 45,260 source words become 17,503 words. Images: 13 reused and 15 new finished compositions. No resolved author flipped in this hub. M30's three-way tie retains the destination author, Vinaychandra Bharadwaj.

## Evidence and research limits

All seven information-gain scores remain 7, held. The 21 original research markers are consolidated by supplier and deliverable in [ESIM-evidence-requests.md](ESIM-evidence-requests.md). No technical reviewer is requested or asserted. Articles have no evidence markers or editorial-only review blocks. M01's machine-readable QA snapshot now explicitly records the same 7 hold already present in its research/scorecard; this is synchronization, not rescoring.

- Product/delivery engineering, IT operations and manufacturing engineering: versioned compatibility matrices and redacted provisioning/recovery traces, with enterprise offboarding, physical-to-eSIM migration, factory handoff and offline campaign variants as applicable.
- Account owners and customer marketing: approved cohorts, dated milestones and redacted operations screenshots for RocketPhone, Angel Watch and Butlr. Angel Watch attach-rate numerator, denominator and period are optional evidence only if that claim is desired; the unsupported 80% graphic was excluded.
- Growth, operations and finance: matched activation/retention/refund/contribution cohorts; enterprise usage/invoice allocation; lifecycle and physical-versus-eSIM costs; campaign recovery/interruption and final-subscription reconciliation records.

Published cases are used within their scope. No published regional rollout is presented as proof of an unreported SGP.32 implementation. Consumer SGP.22 and IoT SGP.32 architectures are distinguished and linked to direct GSMA specifications.

Web search was available and primary sources were reviewed. Controlled SERP rankings, volumes, PAA, featured snippets, AI Overview citations and named AI answers were not measured. Research tables mark those limitations instead of inventing results. Some Kigen/GSMA pages block direct clients; recorded browser/search primary-source content and reachable GSMA PDFs supplied the relevant source text. Cluster link-check artifacts retain the actual access results.

## Final validation

- `npm run merge:qa -- --hub "eSIM & Provisioning"`: 7/7 PASS.
- `MEDIA_ORIGIN=https://media.spenza.com NOINDEX=1 npm run build`: PASS, 927 pages. Included Astro check: 0 errors, 0 warnings, 72 existing hints.
- `npm run wp:verify-dist -- https://media.spenza.com`, immediately after that build: 1,837 files, 927 HTML pages, 625 distinct local asset references, 21,583 media-host references; zero missing assets and zero stranded local media paths. An earlier check encountered regenerated output and was not accepted; the final serial build-and-verify result is the recorded result.
- Rendered previews: five TL;DR cards, all images load, native FAQ click/keyboard/no-JavaScript behavior passes, 390px viewport has no page overflow and tables scroll internally.
- All seven articles have unique legacy/current article anchor IDs. `ESIM-anchor-qa.json` records the cross-article check.
- Zero evidence markers or editorial-only review elements in these seven article HTML files. Schema deltas assert no reviewer.
- New optimized diagrams and corrected hero thumbnails visually inspected. No unused new image variants are introduced.
- Cluster artifacts preserve individual gate, link, image and browser results. All information-gain holds remain 7.

Each cluster's source audit, image inventory, Merge Map, gap analysis, semantic/fan-out map, metadata/outline and phase 6 report are in this directory. Redirect and inbound-link changes remain documented proposals, not executed actions. Output F contains only updates to the existing schema, not a duplicate Article/BreadcrumbList graph.
