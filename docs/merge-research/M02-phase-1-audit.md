# M02 Phase 1: live audit and Merge Map

Audited 23 September 2026 on `blog-automation`. Scope: M02 only, `/mvno/mvno/` plus two donors. No article, manifest, redirect, WordPress or other-cluster edits. M07 and M16 remain untouched and held.

## Baseline and citation exposure

| Source | Body words | ACF TL;DR words | Google AI impressions | Bing citations | Metric provenance |
| :-- | --: | --: | --: | --: | :-- |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | 3,595 | 155 | 5,436 | 22,500 | User-supplied destination metrics; brief also records 22,500 Bing citations |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | 2,759 | 133 | 2,788 | 2,556 | merge-plan.json donor metrics |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | 2,223 | 123 | 449 | 267 | merge-plan.json donor metrics |

Body total: 8,577 words. Separate ACF cards: 411 words, including card titles but excluding the common TL;DR heading. Method: fresh HTTP 200 source pages, exact post-content widget parsed with parse5, excluding CSS/script text and site chrome. Raw section text, headings, links, tables, exact live picture markup, ACF blocks and schema are saved in [M02-source-audit.json](./M02-source-audit.json).

The metrics are supplied historical URL-level signals, not measurements made today. They do not identify exact cited passages. The passage register below is a preservation priority based on source exposure and answer format, not a claim that a particular sentence has been cited. Preservation also does not guarantee future citation retention.

Destination publish date from live Yoast Article: `2026-06-11T10:40:10+00:00`; keep it. Current modification: `2026-07-13T08:36:34+00:00`. Set the new modification date only when the rewrite is actually prepared/published.

## Merge Map

Keep means retain the useful answer, ordering and precise distinctions with a light editorial rewrite. It never means preserve an inaccurate statistic. Each current H2/H3 is mapped below; assets and all 15 ACF cards follow separately.

| Source URL | Section | Decision | Reason |
| :-- | :-- | :-- | :-- |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | Opening / article framing | Rewrite | Keep the short definition; remove generic intro, forecasts and repeated sales framing. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | MVNO Fundamentals: Definitions and Core Concepts | Keep | Definition and retail-versus-radio distinction; qualify operational scope by contract. Citation-priority P1/P2. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | The MVNO Ecosystem: MNO vs MVNE vs MVNA | Keep | Four-role answer is citation-priority P3; correct the implication that all four must be separate companies. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | MVNO Types: Full, Light, and Branded Reseller Compared | Keep | Retain heading, comparison dimensions and three familiar models (P4); remove unsupported dollar/time bands and blanket support assignments. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | How Do MVNOs Make Money? | Keep | Keep wholesale/retail mechanism and question (P5); replace the 30 to 50 percent target and unsupported CAC claim with an input-based cost model. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | How to Launch an MVNO in 2026 | Keep | Retain seven-stage sequence (P6), exact heading and live anchor; qualify compliance by service/jurisdiction, remove universal launch duration. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | White-Label and Branded MVNOs: Mobile as a Brand Extension | Merge into Types | Keep white-label brand/operations split, not celebrity claims or a second model taxonomy. Preserve old anchor on H3. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | MVNO Marketing, Go-to-Market, and Differentiation | Merge into Vertical fit | Keep distribution, switching friction and retention tests; remove equal-wholesale-rate and five-dollar comparison claims. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | MVNO Billing, BSS, and Platform Operations | Merge into Launch | Keep rating, charging, invoices, changes and dunning (P7); link the billing destination, not its donor. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | Vertical MVNOs: Industry Use Cases That Work | Keep | Keep product-led connectivity examples and current heading; add an explicit fit test and scoped RocketPhone field note. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | IoT MVNOs: Connectivity for Devices, Not People | Merge into Vertical fit | Keep device lifecycle, usage profile and geographic planning; drop unsourced forecast and universal low-ARPU claims. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | eSIM and 5G: The Technology Shift Powering Modern MVNOs | Merge into Launch | Keep device/plan compatibility caveat, avoid universal instant activation or 5G slicing access. Retain old anchor on H3. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | Global Expansion, Regulation, and Compliance | Merge into Launch | Keep named accountable owner and country/service scoping; remove satellite speculation. Retain old anchor at the risk subsection. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | MVNO Trends, Market Outlook, and Real-World Examples | Merge into Fundamentals | Keep current, officially verified carrier examples; drop forecast/roundup/event lists. Preserve old anchor at examples. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | Conclusion: Your Partner in Connectivity | Rewrite | 80 to 120 word decision and next step; retain old fragment in conclusion wrapper. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | Take the Next Step | Merge into Conclusion | Use the scoped MVNE CTA; remove duplicate sales prose. |
| [/mvno/mvno/](https://spenza.com/mvno/mvno/) | FAQs | Rewrite | Keep #FAQs and donor questions that add information. Native expandable FAQs with plus/minus; no duplicate H2 questions, unsupported prices or timelines. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | Opening / article framing | Rewrite | Keep the short definition; remove generic intro, forecasts and repeated sales framing. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | What Is a Mobile Virtual Network Operator (MVNO) | Keep | Preserve wholesale agreement > plans > signup > SIM activation > host network workflow (P8). Merge definition into pillar, correct identical coverage and discount promise. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | Types of Virtual Network Operator (MVNO) Models | Merge into Types | Retain control-versus-responsibility distinctions; explain inconsistent labels, remove five unsupported cost bands. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | MVNO Market in 2026: The Numbers That Matter | Drop | Forecast compilation does not help the definition/buyer decision; mixed scopes and dates, unsupported cost reductions. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | What MVNO Uses Verizon? Virtual Mobile Networks on Verizon’s Network | Keep | Preserve named host-network examples and the Verizon question (P9); verify official operator pages, remove rankings and prices. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | US Mobile MVNO: The Most Flexible Carrier in 2026 | Merge into Fundamentals | Retain multi-network choice as a distinct commercial example (P9); remove plan prices, data allowances, free transfer counts and superlatives. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | Best MVNO Carriers of 2026: Complete Comparison | Drop | Duplicates the Verizon table verbatim and is consumer-shopping scope. Keep examples in one compact, non-ranked table. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | Advantages and Disadvantages of MVNOs | Keep | Preserve coverage/priority/roaming/support trade-offs (P10); remove universal discount, no-contract and priority assertions. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | How to Choose the Right MVNO for You | Merge into FAQs | Keep coverage, compatibility and plan-policy checks; remove recommended prices and unsupported plan recommendations. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | MVNOs for Business: IoT Deployments, Enterprise Mobility, and New Revenue Streams | Merge into Vertical fit | Preserve OEM/MSP/embedded-product use cases, without market-growth or universal-plan claims. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | IoT and MVNO: A Perfect Match | Merge into Vertical fit | Keep low-data/pooled-device use case as conditional; no need to own a full core to manage an IoT fleet. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | Launch Your MVNO in Days with Spenza | Rewrite | Replace days/authorized-reseller/operator-count claims with current named product modules and supported scope only. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | Everything You Need to Become an MVNO — In One Platform | Merge into Launch | Keep provisioning, lifecycle and billing functions; no universal instant integration or no-engineering promise. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | Key MVNO Technology Trends Shaping 2026 and Beyond | Merge into Launch | Keep eSIM compatibility and carrier-enabled features; drop forecast, automation savings and universal satellite access. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | Conclusion: The Future of Virtual Mobile Networks Is Here | Drop | Redundant summary, superlatives and consumer switching pitch. |
| [/mvno/what-are-mvnos/](https://spenza.com/mvno/what-are-mvnos/) | FAQs | Merge into FAQs | Retain number-portability, coverage and host-network questions (P10); rewrite scoped answers. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | Opening / article framing | Rewrite | Keep the short definition; remove generic intro, forecasts and repeated sales framing. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | What Is Mobile Virtual Network Operator (MVNO)? | Merge into Fundamentals | Keep own-brand/wholesale concept (P11); define radio access precisely rather than no infrastructure at all. Drop $127B forecast. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO vs MNO: Understanding the Difference | Keep | Retain ownership versus operating responsibility (P11); do not imply every MVNO requires both intermediary companies. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO Business Model Economics | Merge into Economics | Keep retail-minus-wholesale logic; remove unsourced wholesale/retail rates and margin bands. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO Types: The Ladder of Investment | Merge into Types | Keep increasing operational control; remove universal timelines/margins and the Google Fi/full-core assertion. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | Is MVNO Right for Your Business? 5 Critical Questions | Keep | Preserve product relevance, audience, differentiation, funding and operating-capacity questions (P12); remove universal runway requirement. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO Pros | Merge into Vertical fit | Keep established distribution and product dependence; drop 50K user gate and 10x claim. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO Cons | Merge into Vertical fit | Recast absolutes as risks; white-label and new-audience models are not inherently failures. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO Market Niches: Where Virtual Network Operators Win | Merge into Vertical fit | Keep fleet, app and device examples (P12); remove cost/LTV numbers and guaranteed slicing/performance. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO Unit Economics: Costs, Margins, and Break-Even | Keep | Retain fixed, variable, acquisition and retention categories (P13); replace benchmark arithmetic with unpriced inputs. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO Cost Structure (Light/Enhanced Service Provider Model) | Merge into Economics | Keep fee categories; remove assumed per-line costs and zero acquisition cost. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO Break-Even Analysis | Merge into Economics | Keep break-even reasoning, not instant profitability, sample conversion rates or universal subscriber threshold. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | The MVNO Churn Challenge | Merge into Economics | Retain retention effect on payback; drop unverified churn ranges and incorrect simple annualization. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO Launch Roadmap: 3-Phase Implementation | Merge into Launch | Combine planning > integration > pilot with destination seven steps, without a universal calendar. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | Phase 1: MVNO Planning (Months 1-3) | Merge into Launch | Retain scope, vendor, economics and device checks; remove month range. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | Phase 2: MVNO Platform Build (Months 4-6) | Merge into Launch | Retain activation/billing integration and support preparation; remove month range. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | Phase 3: MVNO Beta & Launch (Months 6-9) | Keep | Retain pilot-before-scaling and activation/churn/support measurements (P14); remove invented cohort sizes and acceptance benchmarks. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO Risks and Mitigation Strategies | Keep | Retain operational, wholesale, differentiation and compliance risks (P14); give each an owner/test. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | 1. MVNO Operational Complexity | Merge into Launch | Keep incident ownership and support design, without mandatory 24/7 claim for every offering. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | 2. MVNE and Wholesale Agreement Risks | Merge into Launch | Keep fees, minimums, concentration, exit and SLA scrutiny; no automatic multi-carrier portability. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | 3. MVNO Market Differentiation Failure | Merge into Vertical fit | Keep customer problem and differentiation test; avoid blanket price-led failure claim. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | 4. Telecommunications Regulatory Compliance | Merge into Launch | Require service/jurisdiction review and responsibility matrix; an MVNE does not remove legal duties. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | MVNO and eSIM Technology: The Future of Virtual Networks | Merge into Launch | Keep supported remote profile delivery; remove universal zero-touch, cost and network-slicing guarantees. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | How Spenza Accelerates Your MVNO Launch | Rewrite | Retain relevant platform support; remove universal compression of launch time. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | Spenza: The “Stripe + Shopify for Connectivity” | Rewrite | Use current TelecomHub, ControlHub, UXHub names; do not carry forward Unify/Monetize/Grow packaging. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | Why Organizations Choose Spenza | Drop | Unapproved anonymous 1M-subscription/25-provider/7-person claims and blanket built-in compliance promises. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | When Does MVNO Make Strategic Sense? | Merge into Vertical fit | Retain choose-if/defer-if trade-offs from P12; no subscriber-count or runway gates. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | Launch MVNO If: | Merge into Vertical fit | Keep product dependence, operating capability and audience access; no 50K threshold. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | Avoid MVNO If: | Merge into Vertical fit | Keep funding and support constraints as questions, not universal exclusions. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | Conclusion: The MVNO Strategic Decision | Drop | Duplicate conclusion with invented cost, LTV and churn outcomes. |
| [/telecom/what-is-mvno/](https://spenza.com/telecom/what-is-mvno/) | FAQs | Merge into FAQs | Retain operator obligations and service scope questions; no duplicate definitions or launch guarantees. |

## Passages prioritized specifically because their URLs carry citations

The source audit preserves each complete original passage. The locators below identify the exact passage and the concept that must survive Phase 5. Do not discard these during shortening. None is represented as a passage-level analytics result.

| ID | Source and locator | Content to retain | Necessary correction / location |
| :-- | :-- | :-- | :-- |
| P1 | Destination, first paragraph, starting “A Mobile Virtual Network Operator (MVNO) is a company” | Own brand, wholesale voice/data/SMS, pricing and support | Specify host radio access network, not absence of all infrastructure; intro and definition |
| P2 | Destination, Fundamentals, paragraph starting “An MVNO looks like a carrier” | Customer-facing provider versus wholesale buyer; SIM/plan/support relationship | Operations can be performed by partners; Fundamentals |
| P3 | Destination, Ecosystem, “Four roles make the market work” | MNO, MVNO, MVNE and MVNA distinctions | Optional/combined enabler and aggregator roles; Ecosystem |
| P4 | Destination, Types comparison table | Branded reseller/light/full distinctions by control | Replace price/time cells with responsibility and contract checks; Types |
| P5 | Destination, How Do MVNOs Make Money?, first two paragraphs | Wholesale/retail spread, non-network costs, acquisition and retention | Drop 30 to 50 percent and $60 assertions; Economics |
| P6 | Destination, launch ordered list | Model/segment, partner, plans, systems, obligations, pilot, scale | Add evidence gates; no unapproved schedule; Launch |
| P7 | Destination, Billing paragraph starting “Your BSS” | Rating, charging, invoices, plan changes and dunning | Explain a lifecycle-to-bill test, without promising retention improvement; Launch H3 |
| P8 | `/mvno/what-are-mvnos/`, definition third paragraph starting “Here is how the process works in practice” | Wholesale agreement, plan design, signup, SIM/eSIM activation, network service; optional MVNE | Fold into one short workflow under Fundamentals |
| P9 | `/mvno/what-are-mvnos/`, Verizon table and US Mobile opening paragraph | Recognizable carrier/network examples and selectable networks | Official sources only; no prices, best-provider rankings or automatic-switching implication |
| P10 | `/mvno/what-are-mvnos/`, pros/cons table and selection checks | Coverage, priority, roaming, compatibility and support are separate checks | Replace same-coverage and universal-discount claims; Fundamentals and FAQs |
| P11 | `/telecom/what-is-mvno/`, definition and MNO comparison paragraph | Separate network ownership, brand and operating work | Preserve core/RAN distinction, avoid compulsory intermediary chain; Ecosystem |
| P12 | `/telecom/what-is-mvno/`, five fit questions and niche examples | Existing audience, product dependence, differentiated service, funding and operations | No mandatory user count, runway or guaranteed vertical success; Vertical fit |
| P13 | `/telecom/what-is-mvno/`, fixed/variable/acquisition lists and break-even section | Cost categories and contribution before fixed cost | Unpriced formula, stated boundary and sensitivity; Economics |
| P14 | `/telecom/what-is-mvno/`, beta list and four risk subsections | Test before scale, activation/billing/support evidence, responsible owners | No fabricated cohort or target metrics; Launch |

## TL;DR merge map

All source cards were read from `src/data/wp-acf-blocks.json`, not inferred from article bodies. Output stays in ACF templateBlocks, not duplicated in the article HTML.

| Source | Card | Decision / destination theme |
| :-- | :-- | :-- |
| /mvno/mvno/ | What Is an MVNO? | Keep definition, correct infrastructure scope |
| /mvno/mvno/ | MVNO Types | Keep model/control distinction |
| /mvno/mvno/ | MVNO Business Model | Keep revenue-minus-cost mechanism |
| /mvno/mvno/ | Key Benefits for Brands | Rewrite potential benefit as product-fit decision |
| /mvno/mvno/ | Spenza MVNO-in-a-Box Platform | Rewrite current platform scope, remove days/compliance guarantee |
| /mvno/what-are-mvnos/ | Define MVNO | Merge definition |
| /mvno/what-are-mvnos/ | Top MVNO Carriers on Verizon | Merge officially verified carrier examples into body; no consumer pricing card |
| /mvno/what-are-mvnos/ | MVNO Types and Business Models | Merge model/control theme |
| /mvno/what-are-mvnos/ | MVNO Market Trends 2026 | Drop unneeded market forecast |
| /mvno/what-are-mvnos/ | Launch Your Own MVNO with Spenza | Rewrite capabilities, no seven-day promise |
| /telecom/what-is-mvno/ | What Is an MVNO? | Merge definition |
| /telecom/what-is-mvno/ | MVNO vs MNO | Merge radio/core/control distinction |
| /telecom/what-is-mvno/ | MVNOs Win by Specialization, Not Price | Keep product fit, remove always-win/always-fail claim |
| /telecom/what-is-mvno/ | Best-Fit MVNO Models and Niches | Rewrite model selection without a default model recommendation |
| /telecom/what-is-mvno/ | Spenza Accelerates MVNO Launch | Rewrite current module names and responsibility boundaries |

Planned merged four-card themes: definition and host network; model and responsibilities; economics and commitments; launch evidence. Closing card: choose the operating model around the product, then review scope with Spenza. Opening description answers the query directly.

## Existing link and fragment protection

The live body has 83 links on the destination, 14 on the first donor and 25 on the second donor, including external/CTA links. Exact anchors and targets are in the audit JSON. Replace list-heavy navigation with six retained spokes plus the commercial page, calculator and RocketPhone case source. Do not link any donor from the entire merge queue.

This is the hub pillar: no self-link in the introduction. Link its top spokes, beginning with the role-map destination within the first 150 words. The brief's `/mvno/mvno/` self-link is intentionally not emitted.

Raw HTML sets only `#FAQs`, but the live browser adds positional Elementor IDs. These are real public fragments and must not be renumbered. [M02-live-heading-anchors.json](./M02-live-heading-anchors.json) records the live IDs after the TOC script ran. Keep `elementor-toc__heading-anchor-1` through `-14` at their retained headings or equivalent subsections, and keep `#FAQs`. Explicit IDs/alias spans will prevent changed section order from changing old destinations. No current fragment on “Take the Next Step”.

## Image audit

All 19 featured/body candidates, keep/reject reasons and exact responsive markup are recorded separately in [M02-image-inventory.md](./M02-image-inventory.md) and [M02-image-inventory.json](./M02-image-inventory.json). Inspection downloads are temporary files outside the repository. Reused images must reference existing CDN URLs, preserving live srcset and sizes. Four images planned: one existing featured, two existing body figures and one new explanatory role diagram.

## Claim and evidence risks

Do not retain unsourced forecasts, consumer plan prices, universal 30 to 50 percent margins/savings, zero CAC, subscriber thresholds, promised launch times, automatic global compliance, or unnamed customer outcomes. Existing publication is not evidence of accuracy. Keep carrier examples only after checking current official descriptions. Use the published, approved RocketPhone enterprise MVNO case as the first-hand angle. Butlr is an IoT regional-rollout example and is not used as MVNO-launch proof.

The approved RocketPhone case supplies launch scope, implementation approach, capabilities and qualitative outcomes. Four inputs remain open: subscriber/device cohort size, dated start/end milestones, a redacted operations screenshot, and technical reviewer name/role. These do not block Phase 1 or the outline. Before future evidence requests, first search the live site for an approved relevant case, including RocketPhone, Daito, Butlr and Angel Watch.
