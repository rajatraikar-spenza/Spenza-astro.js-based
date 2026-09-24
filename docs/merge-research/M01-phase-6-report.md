# M01 preview verification

Preview: http://localhost:4321/preview/merged/what-is-remote-sim-provisioning-rsp-guide-2026/

Three posts consolidated. Before: 7,029 body words plus 281 ACF words = 7,310. After: 2,280 body plus 142 TL;DR = 2,422. Author Spenza / isimplexity, no flip. Author-only byline; no separate reviewer by user decision. Original publication date retained. Information gain remains 7.

## Output E: link handoff

Seven contextual internal destinations and five primary external sources listed in M01-content-qa.json. All internal destinations resolve; Angel Watch now links directly to its live /telecom/ canonical rather than the old /blog/ redirect. Direct GSMA SGP.22 and SGP.32 PDFs return200 with Node fetch. GSMA's specification register and legacy M2M overview are indexed primary sources but return403 to this research client; recorded as access restrictions, not silently presented as successful fetches. Apple setup documentation returns200.

Proposed redirects, not executed: each of /esim/what-is-remote-esim-provisioning/ and /esim/iot-management-remote-esim-provisioning/ -> /esim/what-is-remote-sim-provisioning-rsp-guide-2026/, 301, single hop.

Proposed inbound sentences, not applied:

|Existing page|Exact sentence to add; linked phrase in brackets|
|---|---|
|/esim/esim/|Use the [remote SIM provisioning guide] to separate profile installation from working service.|
|/esim/sgp-22-vs-sgp-32-esim-standards-guide/|The [remote provisioning workflow] explains how architecture choices change deployment acceptance checks.|
|/esim/esim-for-enterprises-business-enabler-2025/|Define bootstrap and recovery requirements with the [remote SIM provisioning checklist] before expanding the fleet.|
|/esim/esim-orchestration-global-iot/|Map policy decisions to the [remote provisioning lifecycle] and confirm the resulting service state.|

Each bracketed phrase targets M01's unchanged destination. Existing source references were found in sitemap; archives2025-05-25/2025-11-14; posts what-is-iccid-number, m2m-vs-iot-key-differences-explained, esim-only-mvnos-2025, esim, esim-myths-debunked, safe-kids-phone-watch-plans-2025, mvno-esim-implementation and both donor partials. Index/ACF/style data also retain historical donor entries. Publication handoff must replace actual links, not erase source records indiscriminately.

## Output F: schema delta only

At publication, update existing Article headline to the new H1, wordCount to2422, dateModified to the approved publication-update timestamp, keywords to Remote SIM Provisioning/eUICC/SGP.22/SGP.32/IoT deployment. Preserve @id, datePublished, author identity and the existing BreadcrumbList. The preview manifest supplies the updated content metadata. No second Article graph is authored. No reviewer field is asserted. Optional FAQPage must reproduce the six visible questions and answers; no FAQ rich-result promise. No VideoObject because no prominent video is introduced.

## Output G: scorecard

|Dimension|Score|Basis|
|---|---:|---|
|Intent|9|Architecture choice and deployment task|
|Answer-first structure|9|Eight openings,46 to51 words|
|Information gain|7, held|Useful acceptance tools; measured implementation evidence still missing|
|E-E-A-T|8|Approved published customer example, bounded claims, primary standards|
|Coverage|8|Fifteen fan-out questions mapped; PAA not measured|
|Accuracy|9|Consumer/IoT/M2M separated; installed versus usable service distinguished|
|Readability|9|Three tables, five brief callouts, six expandable FAQs|
|Internal linking|9|Required links, hub, commercial page and relevant spokes; no donors|
|External sourcing|8|Direct standards; GSMA client-access restrictions disclosed|
|Conversion|8|Useful CTA after definition, case and conclusion|
|Length|9|2,422 words including TL;DR|
|Merge completeness|8|Useful logistics and orchestration concepts retained; unsupported guarantees removed|

Open requests are recorded in the research artifact and consolidated hub evidence document: engineering compatibility matrix; delivery provisioning/recovery trace; Angel Watch account-owner cohort, dates and redacted operations screenshot. No reviewer request. Article contains no unresolved evidence marker or editorial review section.

## Images and measured checks

All13 candidates inspected. Two reused assets (hero and bootstrap figure) use exact existing CDN URLs/srcsets. Two newly composed illustrations use the existing generated blank frame with editable Figma labels, exported as PNG/WebP. Only those four new local files are staged. All optimized images inspected; new browser image selections are WebP1600x900.

Editorial gate PASS. Astro check:0 errors,0 warnings,72 existing hints. Five TL;DR cards with icons, breadcrumb, related grid and TOC present. No unfilled slots. Robots noindex,nofollow. Eight H2 openings46 to51 words, six FAQ answers50 to55, five callouts22 to39. Native FAQ click/Enter/Space toggle and no-JavaScript behavior verified. At390px document width390; tables scroll inside357px containers. Mobile FAQ screenshot inspected. CSS optimizer completed; unrelated existing bundle churn excluded.

Publication, redirects, donor removal, media upload and inbound edits remain unexecuted. Preview status is not publication approval.
