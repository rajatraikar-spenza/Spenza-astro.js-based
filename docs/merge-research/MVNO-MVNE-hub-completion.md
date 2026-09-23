# MVNO & MVNE hub completion report

23 September 2026. All ten requested clusters are registered as `preview`, with research, outline, article, image inventory and QA records. Separate cluster commits are listed below; M12 and M18 each have an additional image correction commit. No push, WordPress mutation, redirect change, slug/category change or other hub work.

Before means combined destination and donor body plus ACF summary text. After includes the merged body and all TL;DR text; excludes styles, scripts, source indexes and editorial evidence panels. Counts use `mergeReadingWords`. This differs from the mechanical gate's HTML-only word check, which includes review notes and omits ACF. M02 is remeasured at 2,682: the earlier process-update value 2,681 was an arithmetic error.

Images count hero plus body. “New” means newly generated/composed final artwork, including editable Figma labels on generated frames and fixed-template hero composition. It does not mean every image required a separate generation call. No complete featured image was generated. Reused assets keep their existing CDN URLs and live srcsets; no reused CDN image is copied into local blog-media.

|Cluster|Destination (preview link)|Posts|Before words|After words|Gate|Reused / new images|Resolved author|Flipped?|Commits|
|---|---|---:|---:|---:|---|---|---|---|---|
|M02|[/mvno/mvno/](http://localhost:4321/preview/merged/mvno/)|3→1|8,988|2,682|PASS|3 / 1|SivaSai / sivasai|No|c065bfa|
|M03|[/mvno/mvno-billing-platforms/](http://localhost:4321/preview/merged/mvno-billing-platforms/)|2→1|4,525|2,349|PASS|2 / 2|Spenza / isimplexity|No|74aa514|
|M08|[/mvno/mno-mvno-mvne-mvna-roles/](http://localhost:4321/preview/merged/mno-mvno-mvne-mvna-roles/)|5→1|10,495|2,582|PASS|2 / 2|SivaSai / sivasai|No|120df87|
|M12|[/mvno/mvne-provider-selection/](http://localhost:4321/preview/merged/mvne-provider-selection/)|2→1|4,561|2,408|PASS|0 / 4|SivaSai / sivasai|No|db98d5a; a49e637|
|M18|[/mvno/launch-mvno-7-days/](http://localhost:4321/preview/merged/launch-mvno-7-days/)|3→1|6,013|2,486|PASS|3 / 1|Spenza / isimplexity|Yes, from SivaSai|3f4014b; e05ccb8|
|M19|[/mvno/mvno-trends/](http://localhost:4321/preview/merged/mvno-trends/)|2→1|4,188|2,518|PASS|0 / 4|SivaSai / sivasai|No|8eec976|
|M21|[/mvno/mvne-explained/](http://localhost:4321/preview/merged/mvne-explained/)|3→1|5,493|2,441|PASS|0 / 4|SivaSai / sivasai|No|16ec174|
|M22|[/telecom/what-is-telecom-as-a-service-taas/](http://localhost:4321/preview/merged/what-is-telecom-as-a-service-taas/)|3→1|5,814|2,527|PASS|3 / 1|SivaSai / sivasai|No|9998987|
|M23|[/mvno/top-mvno-marketing-strategies/](http://localhost:4321/preview/merged/top-mvno-marketing-strategies/)|2→1|4,841|2,621|PASS|2 / 2|SivaSai / sivasai|No|e01f11d|
|M27|[/mvno/subscriber-management-system-guide/](http://localhost:4321/preview/merged/subscriber-management-system-guide/)|2→1|4,426|2,556|PASS|2 / 2|Spenza / isimplexity|No|6c1b414|

Only M18 carries `author.flippedFrom` in this hub: SivaSai to Spenza, by a 2-of-3 majority. The other five precomputed flips belong to M05, M09, M10, M29 and M40 in other hubs; they were not worked on. M07's byline correction to Spenza/isimplexity was committed separately as 27c249a; its 2–2 tie is won by the destination. M07 and M16 remain held at information gain 7 and were not rewritten or rescored.

## Citation continuity and limits

M02 deliberately preserves the meaning of the own-brand wholesale definition, customer-facing versus host-network responsibilities, operator role distinctions, reseller/light/full models, wholesale-to-retail economics, seven launch stages, billing operations, agreement-to-activation mechanism, recognizable carrier examples and host-coverage caveats. The detailed passage map and preserved fragments are in [M02 Phase 6 review](./M02-phase-6-review.md#citation-priority-preservation). Historical 22,500 Bing citations and 5,436 Google AI impressions on the destination, plus citation-bearing donors, motivated this care; passage-level AI citation attribution was not measured.

Live source bodies and ACF summaries were captured per cluster before drafting. Search was available and sampled pages were examined. Controlled search ranks, volumes, PAA panels, AI Overview presence/citations and named AI-answer products were **not measured**. No invented measurements fill those gaps. RocketPhone, Daito, Butlr and Angel Watch are used only within their published scope; IoT cases do not prove an enterprise MVNO launch or marketing economics.

M02 information gain remains 8 with E-E-A-T 7 pending evidence/review. The nine new drafts hold information gain and E-E-A-T at 7 for preview. Mechanical PASS is not publication clearance.

## Verification

- `npm run merge:qa -- --hub "MVNO & MVNE"`: **12/12 PASS**, including held M07/M16. Every requested cluster passed individually before its commit and before moving on.
- `npx astro check` for each cluster: **0 errors, 0 warnings**, 72 existing hints. The final build repeats the same result.
- `MEDIA_ORIGIN=https://media.spenza.com NOINDEX=1 npm run build`: **PASS, 920 pages**. No deployment.
- `npm run wp:verify-dist -- https://media.spenza.com`: **0 missing assets, 0 stranded local media**; 1,800 files, 150.0 MB, 595 distinct asset references.
- `BASE=http://localhost:4333 npm run wp:audit`: **0 broken asset references across 487 indexed pages**.
- `BASE=http://localhost:4333 npm run wp:audit-links`: 633 unique links / 18,856 occurrences; **one pre-existing unrelated malformed link** `/mvno/resell-data-plans-shopify/]/` on `/mvno/msp-reselling-connectivity-with-hardware/`. It was already recorded in M02's prior Phase 6 report and remains unchanged. Each new preview has its own source/link checks.
- `npm run wp:optimize-css`: completed after markup changes. Its unrelated baseline shared-bundle churn was excluded; preview styles remain scoped inline.
- Final built-preview browser checks: **10/10 PASS**, including loaded body/hero images and 390px page width; [machine-readable results](./MVNO-MVNE-built-browser-qa.json). Per-cluster browser records additionally verify FAQ mouse/Enter/Space/no-JavaScript behavior.

The site-wide link audit is therefore not claimed clean. The malformed link is outside the requested destination/donor work; no unrelated post edit was made.

All ten previews have one hero and three body figures. Native FAQs expand through the plus control and work with keyboard and JavaScript disabled. Each preview was checked at 390px; tables scroll within their containers. TL;DR cards/icons, bylines, breadcrumbs, TOC and related content render. Preview pages are noindex/nofollow. Schema output is a delta for the existing Yoast Article/BreadcrumbList, not a second authored graph.

Final visual review rejected the legacy M12 multicolour diagrams/hero and M18 blue timeline. Their inventories and reports record the correction. M12 now has four new compositions; M18 has three reused assets and one new composition. Authentic archived product screenshots retain their original interface colors and are explicitly dated 2024; they are not presented as current UI or customer-result evidence.

## Open evidence by supplier

The table below reproduces every active article marker for the ten clusters. Similar requests can be satisfied by one properly scoped, approved record set. Published case capabilities already supplied are not requested again. M02's research-outline wording variants refer to the same four requests below.

### RocketPhone delivery/project owner, with customer approval

|Cluster|Exact open marker|
|---|---|
|M02|`[EVIDENCE NEEDED: RocketPhone subscriber or device cohort size, measurement date and launch versus current scope, from the Spenza delivery owner with customer approval.]`|
|M02|`[EVIDENCE NEEDED: dated RocketPhone start and end milestones, their definitions and excluded prerequisites, from the project owner.]`|
|M03|`[EVIDENCE NEEDED: RocketPhone subscriber or device cohort and dated launch milestones, from the RocketPhone delivery owner]`|
|M08|`[EVIDENCE NEEDED: RocketPhone cohort size and dated start/end milestones, from the RocketPhone delivery owner]`|
|M12|`[EVIDENCE NEEDED: RocketPhone subscriber cohort and dated start/end milestones, from RocketPhone delivery owner]`|
|M19|`[EVIDENCE NEEDED: RocketPhone subscriber cohort and dated start/end milestones, from RocketPhone delivery owner]`|
|M21|`[EVIDENCE NEEDED: RocketPhone subscriber/device cohort and dated implementation start/end milestones, from the RocketPhone delivery owner.]`|
|M23|`[EVIDENCE NEEDED: RocketPhone deployment cohort and dated start/end milestones, from the RocketPhone delivery owner.]`|

### Spenza product and delivery

|Cluster|Exact open marker|
|---|---|
|M02|`[EVIDENCE NEEDED: one redacted operations screenshot, capture date and permission to publish, from the delivery or product owner.]`|
|M03|`[EVIDENCE NEEDED: approved operations screenshot showing billing or reseller administration, from Spenza product/delivery]`|
|M08|`[EVIDENCE NEEDED: a redacted operations screenshot with permission to publish, from Spenza product/delivery]`|
|M12|`[EVIDENCE NEEDED: redacted operations screenshot with publication permission, from Spenza product/delivery]`|
|M18|`[EVIDENCE NEEDED: current redacted account, catalog, checkout and provisioning screenshots and exact interface labels, from Spenza product/delivery]`|
|M19|`[EVIDENCE NEEDED: redacted operations screenshot with publication permission, from Spenza product/delivery]`|
|M21|`[EVIDENCE NEEDED: approved redacted operations screenshot with scope and capture date, from Spenza product and delivery.]`|
|M22|`[EVIDENCE NEEDED: approved redacted operations screenshot with capture date and scope, from Spenza product and delivery.]`|
|M23|`[EVIDENCE NEEDED: approved redacted onboarding or cohort-operations screenshot with capture date and scope, from Spenza product and delivery.]`|
|M27|`[EVIDENCE NEEDED: redacted operations screenshot with date and scope, from Spenza product and delivery]`|

### Commissioning editor / user and technical reviewer

|Cluster|Exact open marker|
|---|---|
|M02|`[EVIDENCE NEEDED: technical reviewer's name and role, from the user.]`|
|M03|`[EVIDENCE NEEDED: technical reviewer name and role, from the user]`|
|M08|`[EVIDENCE NEEDED: technical reviewer name and role, from the user]`|
|M12|`[EVIDENCE NEEDED: technical reviewer name and role, from the user]`|
|M18|`[EVIDENCE NEEDED: technical reviewer name and role, from the user]`|
|M19|`[EVIDENCE NEEDED: technical reviewer name and role, from the user]`|
|M21|`[EVIDENCE NEEDED: technical reviewer name and role, from the commissioning editor.]`|
|M22|`[EVIDENCE NEEDED: technical reviewer name and role, from the commissioning editor.]`|
|M23|`[EVIDENCE NEEDED: technical reviewer name and role, from the commissioning editor.]`|
|M27|`[EVIDENCE NEEDED: technical reviewer name and role, from the commissioning editor]`|

### Spenza engineering, billing, delivery and support

|Cluster|Exact open marker|
|---|---|
|M03|`[EVIDENCE NEEDED: redacted usage-event to invoice trace including adjustments and approved timing conditions, from Spenza billing engineering]`|
|M08|`[EVIDENCE NEEDED: approved redacted responsibility map and one activation incident handoff showing the performing and escalation teams, from Spenza delivery and support]`|
|M12|`[EVIDENCE NEEDED: approved completed provider acceptance worksheet and redacted request/event/billing trace, from Spenza engineering and delivery]`|
|M21|`[EVIDENCE NEEDED: completed responsibility map and redacted failed-activation handoff trace, from Spenza engineering and delivery.]`|
|M27|`[EVIDENCE NEEDED: redacted provisioning/event/billing trace and observed operations metric baseline, from Spenza engineering and delivery]`|

### Spenza delivery and customer owner

|Cluster|Exact open marker|
|---|---|
|M18|`[EVIDENCE NEEDED: approved timed launch record identifying scope, subscriber/device cohort and dated start/end milestones, from Spenza delivery and the customer owner]`|
|M22|`[EVIDENCE NEEDED: approved before/after operating baseline, deployment scope, device/subscriber cohort and dated start/end milestones for a comparable TaaS workflow, from Spenza delivery and the customer owner.]`|

### Spenza growth/finance and customer owner

|Cluster|Exact open marker|
|---|---|
|M19|`[EVIDENCE NEEDED: approved cohort-level acquisition, active-use, retention and contribution data for a relevant MVNO offer, from Spenza finance/growth and the customer owner]`|
|M23|`[EVIDENCE NEEDED: approved acquisition-channel costs, customer and subscription cohort definitions, activation completion, equal-age retention and contribution records with campaign dates, from Spenza growth/finance and the customer owner.]`|

### Daito delivery lead and approved customer owner

|Cluster|Exact open marker|
|---|---|
|M27|`[EVIDENCE NEEDED: Daito deployment cohort size and dated start/end milestones, from the Daito delivery lead and approved customer owner]`|

### Existing M07 and M16 holds, carried forward without revisiting

|Supplier|Cluster|Existing open need|
|---|---|---|
|Editorial owner / technical reviewer|M07, M16|Named reviewer, role and completed dated technical review|
|IMZ account owner|M07, M16|Approved actual deployment scope and publishable case wording, without assuming a US deployment or launch duration|
|Finance|M07|Approved redacted quote, billable-line definitions and minimum-commitment terms for a worked calculation|
|Engineering and finance|M07|Sanitized successful and failed provisioning records, final device/service state and matching invoice evidence|
|Engineering and finance|M16|Redacted cancellation record, matching usage/invoice and approved explanation|
|Delivery owner with customer approval|M16|Dated launch timeline, prerequisites, service scope and subscriber cohort|
|Telecom legal/tax specialist|M16|Dated service/entity-specific legal and tax review, named specialist and corrections|

Exact current markers and research wording variants remain in [the unchanged M07/M16 evidence hold](./M07-M16-evidence-hold.md). The former author request is resolved; optional proof for a removed seven-day assertion is not a current claim. Those two articles remain held at 7.

## Publication handoff, unexecuted

Close the evidence and technical-review holds before publication. Each cluster records its proposed donor redirect and inbound-link replacement list, but none was applied. Preserve destination URL, publication date and schema identity. Publish approved body/ACF and genuinely new media only after separate publication authorization; refresh the existing schema properties, retire donors and apply approved redirects together. Verify the live result and compare actual GSC/Bing performance at 14/28/56 days. No performance outcome is promised.
