# Enterprise Mobility & BYOD: completed preview run

25 September 2026. Built in the requested order: M37 pillar, M31, M40, M43. All four registered as preview on blog-automation. Each passed its gate and Astro check before its own commit. Author-only bylines; **information gain remains 7 on every cluster**. No push, WordPress edit, redirect, slug or category change. No other hub started.

## Result

| Cluster | Destination | Posts consolidated | Before body words | After body words | After with TL;DR | Gate | Reused / generated images | Resolved author | Flipped? | Cluster commit |
|---|---|---:|---:|---:|---:|---|---|---|---|---|
| M37 | /byod/byod-in-2025-benefits-risks-and-best-practices/ | 3 to 1 | 5,801 | 2,302 | 2,444 | PASS | 1 / 2 | Spenza / isimplexity | No | 279fa16 |
| M31 | /telecom/mobile-plan-management-simplified/ | 2 to 1 | 2,487 | 2,223 | 2,361 | PASS | 1 / 3 | Vinaychandra Bharadwaj / vinay | No | cd9b8fa |
| M40 | /telecom/connectivity-as-a-benefit/ | 3 to 1 | 4,955 | 2,247 | 2,374 | PASS | 1 / 2 | Spenza / isimplexity | Yes, from SivaSai | a70389a |
| M43 | /esim/dual-sim-esim/ | 2 to 1 | 2,951 | 2,400 | 2,534 | PASS | 1 / 2 | Spenza / isimplexity | No | 5419dac |

Before counts sum live destination and donor bodies, excluding the page shell and separate ACF TL;DR. After body counts use the reading-text parser and exclude CSS; the separate TL;DR-inclusive count governs the 2,000 to 3,000 word limit. Ten source posts (four destinations and six donors) become four previews. Live posts remain unchanged.

Four published heroes are referenced at their existing media URLs with live srcsets. Nine new body illustrations have optimized PNG/WebP twins, inspected at 1024px after conversion. M37 has two, M31 three, M40 two and M43 two body figures, for three or four total images per article. Every source candidate has a recorded keep/reject reason. No published media was copied locally and no new hero was needed.

## Editorial decisions

- M37 links down to its top spokes, including the other three clusters and the existing iPad plan guide. Each new spoke links to M37 within its introduction. Device ownership, funding, app controls and service operations remain distinct.
- M31 retains the donor's useful expense/inventory/contract functions and enterprise operating requirements. Its three figures show record joins, change-confirmation stages and pooled/per-line visibility. Unsupported customer savings and office Wi-Fi administration are removed.
- M40 retains funding patterns, policy design and reimbursement administration costs. Universal tax treatment, state-law compliance, fixed savings, breach figures and zero-overhead claims are removed from both prose and TL;DR. Tax and employment questions remain explicit specialist requests in research. **The byline flips from SivaSai to Spenza by a 2-of-3 majority.**
- M43 retains compatibility and dual-profile setup, current across Apple, Pixel and Samsung documentation. It drops iPhone-13-only coverage, physical-SIM-death predictions, unsourced savings/uptime and automatic app/privacy separation. Stored profiles, enabled lines, data routing and subscription cancellation are separate checks. The duplicate source heading ID is retained once, not repeated.
- RocketPhone is cited only for its published enterprise MVNO delivery scope. It is not represented as proof of a BYOD privacy result, employee benefit tax treatment, device compatibility or employee savings.

## Six-phase artifacts

For each cluster, source-audit.json contains live content, headings, links, images, schema and ACF. Research-and-outline.md contains the Merge Map, observed search sample, gaps, information-gain limits, semantic map, fan-out, long tails and pre-writing metadata/outline. Image-inventory.json and image-prompts.md record decisions and exact prompts. Final-metadata.json and final-outline.json reconcile Output A and implemented Output C. Preview HTML and manifest provide Output D. Link-plan.md provides Output E with exact proposed inbound sentences and future redirect mappings. Phase-6-report.md provides the schema delta (Output F) and full scorecard (Output G). Content, link and browser QA files record measured results.

Search was available. Controlled Google top-ten ranks, volume, KD, complete PAA, snippet ownership and AI Overview citations were not measured. No invented values or AI citations. Search discovery samples are labeled accordingly. Invalid donor Bing fields containing redirect prose were treated as unavailable, not numeric citation evidence. Citation-continuity decisions and retained source passages are recorded per cluster.

## Evidence handoff

[BYOD-evidence-requests.md](BYOD-evidence-requests.md) consolidates all thirteen research markers into six asks, grouped by the team supplying them:

| Owner | Ask | Clusters |
|---|---|---|
| Enterprise IT and HR/privacy | Approved mobility/benefit policy, alternatives, funding, number ownership, management visibility and exit scope | M37, M40, M43 |
| Enterprise IT, mobility operations and finance | Redacted enrollment/exit and line-to-contract-to-invoice trace, including a delayed/failed change and final billed result | M37, M31, M40 |
| Platform engineering, mobility and carrier operations | Provider actions/feed freshness/permissions and device-region-OS-carrier acceptance tests | M31, M43 |
| Procurement and finance | Comparable cohort cost/usage baseline including service, devices, tools, roaming, support, claims and transition work | All four |
| Qualified tax specialist | Service-specific tax review of the actual arrangement | M40 |
| Employment counsel and HR | Location-specific reimbursement and employment-policy review | M40 |

No requests appear in reader-facing HTML. No separate reviewer is requested or asserted. Information gain remains held until evidence is supplied and assessed.

## Verification

Per-cluster gate: 4/4 PASS. Per-cluster Astro: 0 errors and 0 warnings, 72 existing hints. Browser checks passed for all four: five TL;DR cards/icons, six click/keyboard-expandable FAQs, loaded body WebPs, TOC anchors, author/update/breadcrumb/related elements, responsive tables and no horizontal page overflow at 390px. Previews are noindex/nofollow, with no canonical, extra schema graph or unresolved slots.

Final metadata titles/alternates and descriptions meet character limits. Every H2 answer is 40 to 60 words and every FAQ answer is 40 to 70. All final article links returned 200. Zero em/en dashes, evidence markers or editorial review blocks in article HTML. CSS optimization completed after each markup change; unrelated baseline bundle churn excluded. The gate implementation was not changed in this hub.

Final hub gate: `npm run merge:qa -- --hub "Enterprise Mobility & BYOD"` **4/4 PASS**. Full preview gate: `npm run merge:qa` **40/40 PASS**.

`MEDIA_ORIGIN=https://media.spenza.com NOINDEX=1 npm run build` succeeded: **948 pages**, Astro **0 errors, 0 warnings**, 72 existing hints. Build warnings are the existing telecom expense pricing route conflict and the expected NOINDEX notice. `npm run wp:verify-dist -- https://media.spenza.com`: **0 missing assets, 0 stranded local media**.

Built-site audits ran against the existing preview server at http://127.0.0.1:4333. Asset audit: **0 broken references across 487 indexed pages**. Link audit: **633 unique links checked, one pre-existing malformed href**: `/mvno/resell-data-plans-shopify/]/` in `src/partials/posts/msp-reselling-connectivity-with-hardware.html:731`. This same exception was recorded in the preceding Reseller hub and exists before this run. It is outside this hub and was left unchanged. All four new previews' article links returned 200. Audit scripts exit zero even when reporting broken links; the full-site link audit is therefore not labeled clean.

BYOD-inbound-links.json records **1,143 donor anchors in the current 948-page built snapshot** (body, navigation, archives and related cards, excluding previews): M37 1,115 anchors across 549 pages; M31 8 across 8; M40 14 across 12; M43 6 across 6. This is a publication handoff, not a live-site link rewrite. Refresh before publication.

Output F also records the changed featured-image references for M37/M40 and the changed author reference for M40. Update those within the existing Yoast graph at publication; no second Article/BreadcrumbList graph or reviewer assertion was authored.

`git diff --check` passes. All publishing actions remain deferred: apply approved donor redirects, update inventoried inbound links, remove retired sources from sitemap, request indexing/IndexNow and review performance after publication. None was performed.
