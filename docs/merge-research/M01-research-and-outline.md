# M01 research and outline, phases 1 to 4

Prepared 24 September 2026 before drafting. User authorizes the unattended hub loop; information gain 7 is acceptable for preview. Destination and both donors fetched live, complete body/links/schema captured in M01-source-audit.json. All ACF TL;DR blocks are captured under `tldr`; they are not counted as body text. Original publication date is retained. Author Spenza / isimplexity, unanimous 3 of 3; no reviewer credit.

## Phase 1: Merge Map

|Source|Section|Decision|Reason|
|---|---|---|---|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|What Will You Get by the End of This Article?|Drop|Remove meta introduction and duplicate TOC.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|What Is Remote SIM Provisioning (RSP)?|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Core Components of RSP Architecture|Rewrite into architecture|Separate SGP.22 consumer LPA/SM-DP+, SGP.32 IoT IPA/eIM/SM-DP+, legacy SGP.02 SM-DP/SM-SR.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|eUICC – The Embedded Universal Integrated Circuit Card|Rewrite into architecture|Separate SGP.22 consumer LPA/SM-DP+, SGP.32 IoT IPA/eIM/SM-DP+, legacy SGP.02 SM-DP/SM-SR.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Subscription Manager – Data Preparation (SM-DP+)|Rewrite into architecture|Separate SGP.22 consumer LPA/SM-DP+, SGP.32 IoT IPA/eIM/SM-DP+, legacy SGP.02 SM-DP/SM-SR.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Subscription Manager – Secure Routing (SM-SR)|Rewrite into architecture|Separate SGP.22 consumer LPA/SM-DP+, SGP.32 IoT IPA/eIM/SM-DP+, legacy SGP.02 SM-DP/SM-SR.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|SIM IoT Remote Manager (eIM)|Rewrite into architecture|Separate SGP.22 consumer LPA/SM-DP+, SGP.32 IoT IPA/eIM/SM-DP+, legacy SGP.02 SM-DP/SM-SR.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Local Profile Assistant (LPA)|Rewrite into architecture|Separate SGP.22 consumer LPA/SM-DP+, SGP.32 IoT IPA/eIM/SM-DP+, legacy SGP.02 SM-DP/SM-SR.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|How Remote SIM Provisioning Works|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Evolution from M2M to SGP.32: The IoT Standard|Rewrite into architecture|Separate SGP.22 consumer LPA/SM-DP+, SGP.32 IoT IPA/eIM/SM-DP+, legacy SGP.02 SM-DP/SM-SR.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Legacy M2M Standard – SGP.02|Rewrite into architecture|Separate SGP.22 consumer LPA/SM-DP+, SGP.32 IoT IPA/eIM/SM-DP+, legacy SGP.02 SM-DP/SM-SR.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Current IoT Standard – SGP.31/32|Rewrite into architecture|Separate SGP.22 consumer LPA/SM-DP+, SGP.32 IoT IPA/eIM/SM-DP+, legacy SGP.02 SM-DP/SM-SR.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|SGP.02 vs SGP.32 Comparison:|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Security and Compliance Considerations|Rewrite into risks|Retain authenticated provisioning and compatibility concerns; distinguish technical security from legal permission.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Security Architecture|Rewrite into risks|Retain authenticated provisioning and compatibility concerns; distinguish technical security from legal permission.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Data Privacy and Regulatory Compliance|Rewrite into risks|Retain authenticated provisioning and compatibility concerns; distinguish technical security from legal permission.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Real-World Applications in 2026|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|IoT Device Deployment at Scale|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Automotive and Connected Vehicles|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Fleet Management and Logistics|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Global Roaming and Multi-Carrier Flexibility|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Consumer Devices and Wearables|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|How Spenza Simplifies RSP Implementation|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Unified IoT Connectivity Management|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Bring Your Own Network Plus Marketplace Model|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Branded eSIM Marketplace Distribution|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Procure-to-Pay Automation|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Deployment Checklist for Enterprise Teams|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|Conclusion|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-sim-provisioning-rsp-guide-2026/|FAQs|Rewrite FAQ|Six distinct practical questions, answers scoped to supported implementation.|
|/esim/what-is-remote-esim-provisioning/|Problem with Physical SIM Card|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/what-is-remote-esim-provisioning/|What Is Remote eSIM Provisioning?|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-esim-provisioning/|How Does Remote eSIM Provisioning Work?|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-esim-provisioning/|Remote eSIM Provisioning vs Physical SIM Cards|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/what-is-remote-esim-provisioning/|Benefits of Remote eSIM Provisioning for IoT, Enterprises & Global Deployments|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/what-is-remote-esim-provisioning/|Zero Touch Creates Faster Rollouts|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-esim-provisioning/|Digital Control Replaces SIM Handling|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-esim-provisioning/|Local Profiles for Global Markets|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/what-is-remote-esim-provisioning/|Reduced Field Costs|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/what-is-remote-esim-provisioning/|Spenza’s Role in Stronger Provisioning|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-esim-provisioning/|Why Remote eSIM Provisioning Is Important for Large-Scale IoT Deployments|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/what-is-remote-esim-provisioning/|What Is eSIM Orchestration? (And How It Complements Remote Provisioning)|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/what-is-remote-esim-provisioning/|Remote eSIM Provisioning Use Cases|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-esim-provisioning/|Fleet Tracking|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-esim-provisioning/|Smart Manufacturing|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-esim-provisioning/|Retail and Payments|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-esim-provisioning/|Agriculture and Remote Assets|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-esim-provisioning/|Logistics and Cold Chain|Merge into deployment and case|Keep device-specific operating constraints and published Angel Watch onboarding example; no invented RSP trace or guarantee.|
|/esim/what-is-remote-esim-provisioning/|Remote eSIM Provisioning Challenges No One Talks About|Rewrite into risks|Retain authenticated provisioning and compatibility concerns; distinguish technical security from legal permission.|
|/esim/what-is-remote-esim-provisioning/|How Spenza Simplifies Remote eSIM Provisioning With Multi-Carrier Global Coverage|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/what-is-remote-esim-provisioning/|The Future of Remote eSIM Provisioning: iSIM, 5G, and AI-Driven Connectivity|Merge into implementation|Keep operational responsibilities; remove broad predictions, instant results and compliance guarantees.|
|/esim/what-is-remote-esim-provisioning/|Why Remote eSIM Provisioning Now Sits at the Center of Global Connectivity|Merge into implementation|Keep operational responsibilities; remove broad predictions, instant results and compliance guarantees.|
|/esim/what-is-remote-esim-provisioning/|FAQ s|Rewrite FAQ|Six distinct practical questions, answers scoped to supported implementation.|
|/esim/iot-management-remote-esim-provisioning/|Table of Contents|Drop|Remove meta introduction and duplicate TOC.|
|/esim/iot-management-remote-esim-provisioning/|Introduction|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/iot-management-remote-esim-provisioning/|Understanding Remote eSIM Provisioning|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/iot-management-remote-esim-provisioning/|Physical SIM vs Remote eSIM: Why This Tech Is Different|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/iot-management-remote-esim-provisioning/|Core Benefits: Why It’s a Big Deal for Global IoT|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/iot-management-remote-esim-provisioning/|No More Physical Limits|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/iot-management-remote-esim-provisioning/|Real Global Scaling|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/iot-management-remote-esim-provisioning/|Total Flexibility and Control|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/iot-management-remote-esim-provisioning/|Simpler Operations|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/iot-management-remote-esim-provisioning/|How Remote eSIM Drives Real Business Outcomes|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/iot-management-remote-esim-provisioning/|Faster Time-to-Market|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/iot-management-remote-esim-provisioning/|Lower Costs, Higher Efficiency|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/iot-management-remote-esim-provisioning/|Longer Device Lifecycles|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/iot-management-remote-esim-provisioning/|Reduced Operational Complexity|Keep concept, rewrite|Preserve useful definition, lifecycle or deployment mechanism in the new seven-section structure; remove repetition.|
|/esim/iot-management-remote-esim-provisioning/|Better Regulatory Compliance|Rewrite into risks|Retain authenticated provisioning and compatibility concerns; distinguish technical security from legal permission.|
|/esim/iot-management-remote-esim-provisioning/|Why Choose Spenza|Merge into implementation|Keep operational responsibilities; remove broad predictions, instant results and compliance guarantees.|
|/esim/iot-management-remote-esim-provisioning/|Case Study: Angel Watch Enhances Global Reach with Spenza|Merge into effort and acceptance|Preserve reduced SIM handling and centralized profile management, with device, contract and connectivity prerequisites.|
|/esim/iot-management-remote-esim-provisioning/|Conclusion: The Future is Remotely Managed|Merge into implementation|Keep operational responsibilities; remove broad predictions, instant results and compliance guarantees.|
|/esim/iot-management-remote-esim-provisioning/|FAQs|Rewrite FAQ|Six distinct practical questions, answers scoped to supported implementation.|

Citation continuity: the remote-eSIM donor carries 1,850 Google AI impressions and 274 Bing citations in the plan. Its definition of downloading operator profiles, SIM-logistics comparison, bootstrap-connectivity explanation and distinction between provisioning and orchestration are retained in meaning specifically for that reason. The global-IoT donor's one Google AI impression makes its centralized-management and Angel Watch example worth checking and preserving. Passage-level citation attribution is not measured; these are editorial preservation choices, not claims to know the exact cited sentences. Destination definition, component, workflow, security and deployment-checklist heading wording/anchors are retained where accurate. Numeric live TOC anchors 1 to 10 and FAQs are mapped into corresponding retained sections or aliases.

Remove unsupported market figures, instantaneous activation/switching, uninterrupted coverage, automatic cheapest-network selection, no vendor lock-in, automatic legal compliance, and firmware-OTA conflation. Correct SM-SR/SM-DP+ mixing, consumer LPA/IoT IPA mixing, and the claim every eUICC is soldered. One hardware design still needs supported bands, firmware, profiles and market permissions.

TL;DR synthesis: download and manage operator profiles; choose architecture by device; prove bootstrap and recovery; distinguish profile/network/application state; connect delivery to commercial operations. Do not preserve broad promises from the old cards.

## Phase 2: search and AI answers

Search queries: remote SIM provisioning RSP consumer IoT architecture guide; remote SIM provisioning profile download recovery bootstrap connectivity; remote SIM provisioning eIM IPA SM-DP+ SGP.32; remote SIM provisioning enterprise device compatibility recovery checklist; remote SIM provisioning RSP guide Thales IDEMIA Giesecke Kigen. Web search available. The samples below are observed search results, not controlled Google rankings. Search volumes, exact top-ten rank, featured snippet, People Also Ask, Google AI Overview presence/citations, ChatGPT Search, Perplexity and Gemini answer captures: **not measured**.

|Observed source|Type/depth observed|Best contribution|Gap/limit|
|---|---|---|---|
|https://kigen.com/products/remote-sim-provisioning/|Vendor solution, search extract|Three provisioning families|Product positioning rather than buyer acceptance record|
|https://kigen.com/glossary/rsp-remote-sim-provisioning/|Long glossary extract|Family definitions|Generic flow can obscure device differences|
|https://kigen.com/resources/blog/esim-profile-management-step-by-step-with-kigen-pulse/|Opened detailed walkthrough|EID, queued operations, enable separate from download|Vendor-specific UI; no Spenza delivery proof|
|https://www.simplexwireless.com/2026/05/26/remote-sim-provisioning-explained-what-actually-happens-when-you-switch-carriers-over-the-air/|Opened technical explainer|Carrier-switch mechanism|Not an independent comparative benchmark|
|https://www.idemia.com/esim-management-solution-consumer-devices|Search extract only, open failed|Consumer solution positioning|Depth not fully measured|
|https://incbyte.com/telecom-solutions/remote-sim-provisioning-rsp/|Search extract; live challenge|Solution scope|Full depth not measured|
|https://trustedconnectivity.valid.com/knowledge-hub/|Indexed resource collection|Consumer/IoT topics separated|Not a single buyer workflow|
|https://www.transatel.com/faq_advanced/remote-sim-provisioning-for-iot/|Search excerpt|IoT migration question|Avoid reducing SGP.32 to a renamed consumer specification|
|https://pages.gi-de.com/hubfs/4016233/MS/Event-Electronica-2024/GD-Solution-Brief-Remote-SIM-Provisioning.pdf?hsLang=de|Search PDF excerpt|RSP solution context|Full depth not measured|
|https://www.gsma.com/solutions-and-impact/technologies/internet-of-things/technologies/iot-rsp-enabling-the-growth-of-massive-iot/|Indexed primary overview; direct access 403|Constrained-device purpose|Not a project acceptance plan|

Intent: technical explanation plus enterprise deployment decision. To compete: distinguish architectures correctly; specify observable acceptance/failure checks; connect a real approved customer operating model to device rollout. No #1 or citation guarantee. AI answer analysis is an editorial risk analysis, not a measured AI answer: likely conflations include eSIM form factor versus eUICC capability, profile installation versus service, and SGP.22 versus SGP.32.

Primary standards: GSMA SGP.22 v3.1 PDF directly opened; GSMA SGP.32 v1.2 architecture and IPA feature sections verified via indexed specification text (direct PDF/landing intermittently 403). GSMA specification register currently lists v1.3, dated 22 May 2026, alongside active v1.2; do not call v1.2 the latest. Use family-level guidance and require exact version compatibility. Apple setup documentation opened, 17 September 2026, supports carrier/device-specific activation and internet prerequisites. Link specifications directly even where the research client's direct fetch is blocked.

## Phase 3: gaps, information gain and semantic map

|Question|First three sampled results|Spenza sources|Gap and response|
|---|---|---|---|
|Which architecture?|Covered broadly|Incorrectly mixed|Separate component responsibility matrix and visual|
|What proves activation?|Walkthrough has operation states|Instant activation claims|Profile, network and application evidence separated|
|How does bootstrap work?|Partial|Useful FAQ|Retain prerequisites, test lost reachability|
|What costs remain?|Product positioning|Blanket savings|Quote-input worksheet without fictional rates|
|What is first-hand?|Competitor product walkthrough|Angel Watch anecdote|Use approved live case, carefully distinguish commercial results from protocol proof|
|What fails?|Some UI recovery detail|Weak-signal/compatibility list|Proposed timeout, reachability and recovery acceptance tests|

Information gain candidates: architecture ownership matrix; service-acceptance ladder; quote-input and failure-test worksheet; approved Angel Watch regional-plan/Shopify case boundary. These are editorial tools, not measured unique content across every result. **Information gain: 7/10, held.**

[EVIDENCE NEEDED: exact supported eUICC/module/firmware, IPA or LPA and server-version compatibility matrix, from product engineering.]
[EVIDENCE NEEDED: redacted provisioning trace including bootstrap, download, enable, network registration, application check and one failed-operation recovery, from delivery engineering.]
[EVIDENCE NEEDED: approved device cohort, dated deployment milestones and redacted operations screenshot for the Angel Watch example, from the account owner and customer marketing.]

Published evidence checked before these requests: Angel Watch live case confirms tailored regional low-data plans, Shopify onboarding and usage analytics, with no cohort or RSP timing trace. Butlr live case concerns multi-country sensor connectivity and regional market-entry timing, not a measured SGP.32 download. Neither proves the customer's deployed specification version.

Semantic map: RSP -> securely manages operator profiles on eUICC; consumer -> LPA/SM-DP+; IoT -> IPA/eIM/SM-DP+; legacy M2M -> SM-DP/SM-SR. Related: EID, ICCID, bootstrap connectivity, profile state, network registration, APN, application endpoint, firmware, profile policy, roaming permissions, operator contract, access control, retry, reconciliation, support owner, commercial subscription.

Fan-out/long-tail mapping: what RSP means(definition); eUICC versus soldered chip(definition); SGP.22 versus SGP.32(architecture); SM-DP+ versus SM-SR(architecture); IPA versus LPA(architecture); bootstrap profile(workflow); download versus enable(workflow); activation acceptance(workflow); fleet rollout costs(effort); failure recovery(risks); sleeping device(FAQ); multiple profiles(FAQ); QR requirement(FAQ); eSIM versus orchestration(case); choosing a vendor(checklist). Twelve long-tail targets are the first twelve of this list, grouped into shared sections rather than keyword copies.

## Phase 4 / Output A

Recommended meta title: Remote SIM Provisioning: Architecture and Rollout Guide
Alternate 1: Remote SIM Provisioning Explained: Consumer and IoT
Alternate 2: Remote SIM Provisioning: Bootstrap, Profiles and Risk
H1/OG title: Remote SIM Provisioning: Architecture and Rollout Guide
Description: Understand remote SIM provisioning, compare consumer and IoT architectures, and plan bootstrap connectivity, profile recovery and fleet acceptance checks.
Excerpt/OG description: Separate profile installation from usable service, then choose the right architecture and prove the recovery path before scaling.
URL and category unchanged. Tags: Remote SIM Provisioning, eUICC, SGP.22, SGP.32, IoT deployment. Primary keyword: remote SIM provisioning. Secondary: remote eSIM provisioning, RSP architecture, bootstrap profile, eSIM profile management. Intent informational/commercial investigation; mid-funnel. Reader: connected-device CTO, Head of IoT, enterprise mobility owner. Target total 2,400 to 2,800 words including TL;DR.
Snippet target: What is remote SIM provisioning? Paragraph: Remote SIM provisioning securely downloads and manages mobile operator profiles on a compatible eUICC. It lets teams change a device's connectivity subscription without replacing its SIM hardware, provided the device, provisioning platform, operator profile and connectivity path support the requested operation.

## Output C

Intro 110 words, pillar link. Eight H2s including FAQ:
1. What Is Remote SIM Provisioning (RSP)? 170 words. Definition and scope, takeaway, commercial CTA.
2. Core Components of RSP Architecture. 330 words. H3 consumer LPA/SM-DP+, IoT IPA/eIM, legacy M2M. Three-family table + new architecture visual. Direct GSMA22/32 links and standards spoke.
3. How Remote SIM Provisioning Works. 340 words. Six-step sequence, bootstrap image, new acceptance visual, definition callout. Apple reference.
4. What changes in deployment cost and effort? 260 words. Quote-input table; physical handling versus integration; enterprise spoke.
5. Security and Compliance Considerations. 260 words. Identity, permissions, failure recovery and bounded legal scope; warning.
6. How Spenza Simplifies RSP Implementation. 230 words. Approved Angel Watch commercial workflow, field note and CTA. Distinguish orchestration from provisioning and use case from protocol proof.
7. Deployment Checklist for Enterprise Teams. 300 words. Acceptance table, selection criteria, buyer checklist and conclusion 90 words. Compatibility and SGP32 related spokes.
8. FAQs. Six answers 40 to 70 words each: QR codes, sleeping devices, physical eUICC, multiple enabled profiles, changing provider, provisioning versus firmware updates.
Five callouts, three HTML tables, six FAQs, four total images. Six to ten contextual internal links; four to eight primary sources. Author-only byline; no reviewer schema assertion. No approval pause by explicit user instruction.

## Image plan and prompts

All 13 candidates visually inspected; decisions in M01-image-inventory.json. Keep hero1 and bootstrap2 at the live media.spenza.com URL with original srcset. Reject mixed-architecture illustration3 and unsupported instant/no-gap diagrams. Two missing slots are architecture and acceptance. No new hero.

Reuse the previously generated blank three-card frame as a design template, then set all new labels as editable Inter in Figma (type A, mandatory second stage). This produces two genuinely new finished illustrations, not a local copy of a published image. Frame generation preamble: Create a clean, modern B2B SaaS infographic for a telecommunications platform brand. Flat vector illustration style. Palette: warm cream background #FDF5F2, white cards with soft shadows, deep ink #1A1A2E for headings, grey #4E545D for body text, and a single accent of vivid orange #FF4500 used sparingly for emphasis. Geometric sans-serif typography (Montserrat or Inter). Generous whitespace, strong alignment to an invisible grid, everything level and symmetrical. No photorealism, no 3D renders, no drop-shadowed bevels, no gradient meshes, no stock-photo people, no clip-art, no emoji. 1600×900 pixels, 16:9. Any text must be large, minimal and correctly spelled.
Composition: three equal white panels on cream, thin orange top rules, empty title/footer and label areas. No baked-in text, numbers, logos or claims. Architecture labels: Three provisioning architectures; SGP.22 / Consumer / LPA + SM-DP+; SGP.32 / IoT / IPA + eIM + SM-DP+; SGP.02 / Legacy M2M / SM-DP + SM-SR. Footer: Shared purpose does not mean interchangeable components. Acceptance labels: Three checks before accepting service; Profile / Installed and enabled as intended; Network / Registered with the approved service; Application / Data reaches the intended endpoint. Footer: A successful download proves only one part of readiness.
Figma file QYBV0dwgiLrqR4PP6RpgP6, frames28:2 and28:14. New files rsp-architectures and rsp-acceptance, PNG/WebP, 1600x900; takeaways in alt text. Exported labels visually inspected, no invented metric.

Character count (55): Remote SIM Provisioning: Architecture and Rollout Guide

Character count (51): Remote SIM Provisioning Explained: Consumer and IoT

Character count (53): Remote SIM Provisioning: Bootstrap, Profiles and Risk

Character count (154): Understand remote SIM provisioning, compare consumer and IoT architectures, and plan bootstrap connectivity, profile recovery and fleet acceptance checks.

Verification update: both GSMA PDFs downloaded successfully with Node fetch. Read SGP.32 v1.2 pages13 to17 and SGP.22 v3.1 pages27 to30 directly, confirming architecture and interface separation. Browser/curl restrictions did not prevent primary specification review.
