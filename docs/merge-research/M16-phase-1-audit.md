# M16 Phase 1: live audit and Merge Map

Date: September 22, 2026. Selected because the user explicitly requested M16. Phase 4 approval is still required before writing. Destination: `/mvno/launch-mvno-us-guide/`. Status remains `pending`.

## Method and baseline

Fetched the destination and all four donors live, all HTTP 200. Parsed the exact Elementor post-content container with parse5; counted visible body text without script/style content. Read the full extracted bodies. Pulled the separate TL;DR objects from `src/data/wp-acf-blocks.json`. Source headings, IDs, links, image URLs, Yoast Article fields and raw ACF objects are retained in [M16-source-audit.json](M16-source-audit.json).

The five live bodies total **11,876 words**. The old local M16 preview independently measures **4,565 body words, 23 em dashes and 0 en dashes**. It remains the unchanged before version. The new body will be authored from this map and the approved outline, not patched from the previous prose.

| Source | Body words | Queue clicks, 16 months | Queue Google AI impressions | Queue Bing citations |
| :--- | ---: | ---: | ---: | ---: |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | 3,441 | not supplied | not supplied | not supplied |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | 2,493 | 31 | 114 | 50 |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | 2,640 | 33 | 28 | not available |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | 1,472 | 18 | 452 | 7 |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | 1,830 | 4 | 48 | 36 |

Queue metrics are historical inputs, not newly measured traffic or rankings. Donors total 86 recorded clicks, 642 AI impressions and 93 known Bing citations; one Bing value is unavailable. URL-level metrics do not identify the cited passage or guarantee citation transfer. Preserve useful definitions, comparisons and steps from these donors first.

## Section Merge Map

S1 scope; S2 operating model; S3 US requirements; S4 costs; S5 ten-step playbook; S6 pilot tests; S7 first-hand evidence; S8 FAQs. “Keep” preserves the information or useful heading, not verbatim prose. Source titles below retain their original wording except dash normalization.

### /mvno/launch-mvno-us-guide/

| Source URL | Section or asset | Decision | Reason |
| :--- | :--- | :--- | :--- |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | H1 and introductory prose | Rewrite intro | One current, answer-first introduction for OEMs, MSPs and software platforms. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h2 Why 2026 Is the Inflection Point for US MVNOs | Drop | Replace calendar urgency and forecasts with an actual service-scope decision in S1. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h2 The 6 MVNO Business Models: Which One Fits You? | Rewrite into S2 | Separate operating responsibility from IoT and embedded distribution; preserve the model-choice question. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h2 How Much Does It Cost to Launch an MVNO in the US? | Keep heading; rewrite S4 | Preserve this useful search question; replace unsourced price bands with quote inputs. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Cost Breakdown by Category | Merge into S4 | Keep setup, recurring, usage and working-capital categories; remove invented amounts. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h2 The 10-Step Playbook to Launch an MVNO in the US | Keep heading; rewrite S5 | Preserve the ten-step structure with owners and acceptance evidence. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Step 1: Define Your Ideal Customer Profile and Value Proposition | Keep in S5.1 | Define audience, device fleet and actual problem before ordering connectivity. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Step 2: Pick Your MVNO Model | Keep in S5.2 | Choose responsibility allocation, linked to S2. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Step 3: Select Your Host Network (MNO) | Keep in S5.3 | Document wholesale rights, minimums, device eligibility and escalation. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Step 4: Choose Your MVNE Partner | Keep in S5.4 | Define platform scope and exit responsibilities; do not assume compliance transfers. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Step 5: Handle FCC and State Regulatory Compliance | Rewrite S3 and S5.5 | Start legal classification at scoping; make requirements conditional on service and provider role. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Step 6: Build or License Your Technology Stack | Keep in S5.6 | Preserve provisioning, billing and customer-system integration. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Step 7: Design Plans, Pricing, and Commercial Logic | Keep in S5.7 | Replace sample pricing with rate-card and cash-flow evidence. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Step 8: Set Up Customer Support, Distribution, and Activation | Keep in S5.8 | Assign activation, support and channel ownership. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Step 9: Launch, Stress Test, and Go Live | Rewrite S5.9 and S6 | Pilot before public availability; replace arbitrary cohort sizes and thresholds. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Step 10: Scale With Data, Automation, and Vertical Depth | Keep in S5.10 | Scale only after operating evidence and finance reconciliation. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h2 Realistic US MVNO Launch Timeline | Rewrite S5 and FAQ1 | Schedule against dependencies; no universal six-week or seven-day promise. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h2 Key Technology Decisions for 2026 and Beyond | Merge into S5.3 and S5.6 | Choose capabilities for the scoped product rather than a trend catalogue. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 1. eSIM: Default, Not Optional | Rewrite S5.6 and FAQ5 | eSIM depends on device, profile, platform and contracted network support. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 2. 5G Standalone and Network Slicing | Merge into S5.3 | Ask whether required 5G capabilities are included; no assumption about slicing availability. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 3. Satellite and Non-Terrestrial Networks | Drop | Satellite discussion does not earn space in the scoped launch guide. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 4. AI-Native Operations | Drop | Unsupported automation percentages and trend claims do not establish readiness. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h2 Common Risks and How to Avoid Them When Launching an MVNO | Merge into S4 and S6 | Preserve cash, support and integration risks as explicit tests. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h2 Case Studies: US MVNO Launches That Worked | Rewrite S7 | Use documented customer scope; no extrapolated launch results. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 Angel Watch: Scaling Smart Wearables with eSIM | Keep evidence; rewrite S7 | Angel Watch published account supports regional plans, device bundles and analytics; no launch-speed claim. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h3 IMZ: Nationwide Wireless Without Owning a Core | Rewrite S7, conditional | IMZ supports a commerce/reseller use case; omit timeline and performance figures pending approval. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h2 How Spenza Helps You Launch an MVNO in the US | Rewrite S7 | Tie Spenza functions to documented operations rather than network-count or speed claims. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h2 Your Next Step | Merge into conclusion | One scoped next step, not another sales section. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | h2 FAQs | Rewrite S8; keep id FAQs | Six nonduplicate fan-out questions; remove unsupported global and profitability claims. |

### /mvno/how-to-set-up-mvno/

| Source URL | Section or asset | Decision | Reason |
| :--- | :--- | :--- | :--- |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | H1 and introductory prose | Rewrite intro | One current, answer-first introduction for OEMs, MSPs and software platforms. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h2 Table of Contents | Drop | Preview already supplies a sidebar TOC. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h2 Introduction: The MVNO Opportunity in 2025 | Merge into intro and S1 | Preserve customer opportunity; remove dated urgency. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h2 What Exactly is a Mobile Network Operator (MVNO)? And Why is Now the Time? | Keep definition; rewrite intro | Highest-value definition; correct expansion to Mobile Virtual Network Operator. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h2 Understanding the Evolving MVNO Landscape in 2025 | Merge into S1 and S2 | Keep positioning and control choices; remove forecast narrative. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h3 Key Market Trends Driving MVNO Growth: | Drop | Market growth projections do not help scope this launch. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h3 The Old Way: Challenges of Traditional, Independent MVNO Setup | Merge into S4 and S5 | Preserve integration effort, contracts and staffing dependencies. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h2 Your Step-by-Step Blueprint: How to Launch Your MVNO in 2025 | Merge into S5 | One ten-step checklist replaces duplicate six-step list. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h3 Step 1: Define Your Vision  to  Crafting Your Business Plan & Identifying Your Niche | Keep in S1 and S5.1 | Audience, distribution and a differentiated business plan. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h3 Step 2: Navigating the Regulatory and Legal Landscape | Rewrite S3 | Regulatory scope and responsible legal entity must be established. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h3 Step 3: The Smart Move  to  Partnering with a Mobile Virtual Network Enabler (MVNE) like Spenza | Merge into S2 and S5.4 | Choose support responsibilities, not a universal MVNE recommendation. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h3 Traditional MVNO Setup vs. The Spenza (MVNE) Advantage | Rewrite S2 and S4 | Compare operating scope; remove unverified cost and timing advantages. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h4 Step 4: Sourcing Your Network & Crafting Custom Plans with an MVNE Platform | Keep in S5.3 and S5.7 | Network access, existing agreements and custom plans need commercial confirmation. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h3 Step 5: Mastering Billing & Customer Management  to  The Spenza Way | Keep in S5.6 and S6 | Billing, parent/child accounts and reseller commissions become test requirements where applicable. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h3 Step 6: Preparing for Takeoff  to  Marketing & Launching Your MVNO | Keep in S5.8 and S5.9 | Channel preparation and a controlled pilot. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h2 Why Spenza is Your Ideal MVNE Partner to Launch Your MVNO in 2025 | Rewrite S7 | Keep supported operational functions; drop universal network and automation promises. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h2 Proven Success Stories | Merge into S7 | Angel Watch and IMZ qualitative scope, without undocumented performance. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h2 Conclusion: Your MVNO Future Starts Now | Merge into conclusion | Remove repeated pitch. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | h2 FAQs | Merge into S8 | Preserve buyer questions without repeating the main sections. |

### /mvno/launch-us-mvno-now/

| Source URL | Section or asset | Decision | Reason |
| :--- | :--- | :--- | :--- |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | H1 and introductory prose | Rewrite intro | One current, answer-first introduction for OEMs, MSPs and software platforms. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h2 2026: Why Now Is the Right Time to Launch and Expand Your MVNO in the U.S. | Drop | Calendar urgency is not a launch requirement. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h3 Why Launch an MVNO in the U.S. in 2026? | Merge into S1 | Keep audience fit; remove time-to-act framing. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h2 What Will You Gain from This Article? | Drop | Intro already states the decision and audience. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h2 US MVNO Market Overview 2025 | Drop | Mixed global/US forecasts and older market figures are unnecessary. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h2 The Perfect MVNO Storm | Drop | Hype duplicates the introduction. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h3 The Technological Tipping Point | Merge into S5.3 and S5.6 | Retain device and network capability questions, not technological inevitability. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h3 The Modern MVNO Consumer’s Demand for More | Keep in S1 and S5.8 | Customer experience and support expectations shape the service. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h3 Emerging MVNO Business Models and Niche Opportunities In 2026 | Rewrite S1 and S2 | Product niches are separate from operating models. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h2 How to Seize This MVNO Moment Without the Complexity? | Merge into S2 and S5.4 | Document what the partner handles and what remains with the buyer. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h2 Spenza: Your Catalyst to Launch an MVNO in 2026 | Rewrite S7 | Retain named product functions only where supported. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h3 Proven Success: The IMZ Case Study | Rewrite S7, conditional | Retain commerce/reseller lesson; drop 30% finance, 25-reseller and 20% ticket claims without records. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h2 MVNO Launch Checklist  to  2026 Edition | Merge into S5 | Preserve checklist intent and remove duplicate ordering. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h2 Conclusion: The Time to Act Is Now  to  Launch and Grow Your MVNO in the U.S. Today | Drop | Replace urgency with the final readiness decision. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | h2 FAQs | Merge into S8 | Keep conditional launch-duration reasoning and relevant buyer questions. |

### /mvno/us-mvno-introduction/

| Source URL | Section or asset | Decision | Reason |
| :--- | :--- | :--- | :--- |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | H1 and introductory prose | Rewrite intro | One current, answer-first introduction for OEMs, MSPs and software platforms. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | h2 What Is an MVNO in the US? | Keep; rewrite intro and S1 | Prioritize this definition from the donor with 452 recorded AI impressions. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | h2 Overview of the MVNO Market and Its Dynamics | Keep concept; rewrite S1 | Wholesale dependence and distribution matter; remove unsourced market size. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | h3 How Do MVNOs Compete With Major US Carriers? | Keep in S1 | Preserve segment fit and customer experience as alternatives to price competition. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | h2 Challenges in the MVNO Space | Keep in S3, S4 and S6 | Carrier dependence, brand, economics and compliance become checkable risks. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | h2 Successes in the MVNO Space | Merge into S1 | Keep the positioning lesson without expanding consumer case histories. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | h4 Consumer Cellular MVNO: Targeting Older Demographics | Merge into S1 | Retain audience-specific distribution lesson; avoid implying this is an OEM launch benchmark. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | h4 Mint Mobile MVNO: Affordable Plans with Celebrity Endorsements | Merge into S1 | Keep brand/distribution lesson; omit ownership and endorsement claims that need a separate update. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | h2 The Role of Partnerships in MVNO Success | Keep in S2 and S5.3 | Contracts and operational partners shape service control. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | h2 Conclusion | Merge into conclusion and S8 | Retain service-differentiation conclusion and inline FAQ intent; drop unapproved executive quote. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | Inline FAQ block (not heading-tagged) | Merge into S1, S2 and S8 | Preserve definition, benefits, challenges and partnership questions; remove global figures presented as US market size. |

### /mvno/top-10-tips-launching-mvno-us-2025/

| Source URL | Section or asset | Decision | Reason |
| :--- | :--- | :--- | :--- |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | H1 and introductory prose | Rewrite intro | One current, answer-first introduction for OEMs, MSPs and software platforms. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h2 MVNO Launch Requirements in the US (2026) | Rewrite S3 and S5 | Requirements become conditional, evidenced workstreams. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h2 Introduction: Why your MVNO idea is viable in 2025 | Drop | Dated viability claims repeat the market pitch. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h3 What You Will Learn ? | Drop | Redundant contents promise. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h2 Our Top 10 Tips for a Successful 2026 MVNO Launch | Merge into S5 | One retained ten-step checklist, not tips plus a second process. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h3 Tip 1 ,  Niche down to stand out | Keep in S1 and S5.1 | Define a specific existing audience. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h4 Examples of viable niches | Rewrite S1 | Prioritize OEMs, MSPs and software platforms rather than hobbyist launches. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h4 Mini Case Study: Speciality Connectivity for IoT | Rewrite S7, optional | Do not repeat incorrect Butlr product description; Angel Watch is the stronger primary example here. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h3 Tip 2 ,  Choose the right path: MVNE over Full MVNO (for most) | Rewrite S2 | MVNE support and full-MVNO operating scope are not mutually exclusive. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h3 Tip 3 ,  Embrace eSIM from day one | Rewrite S5.6 and FAQ5 | Validate device eligibility; no instant or universally digital claim. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h3 Tip 4 ,  Master your unit economics | Keep in S4 | Retain contribution economics, acquisition cost and retention sensitivity without made-up targets. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h3 Tip 5 ,  Don’t get derailed by the regulatory maze | Rewrite S3 | No blanket compliance shield or uniform filing requirement. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h3 Tip 6 ,  Build a brand, not just a business | Keep in S1 and S5.8 | Distribution and service promise must be specific. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h3 Tip 7 ,  Don’t put all your eggs in one network basket | Rewrite S5.3 and FAQ6 | Multiple contracted options do not imply automatic switching or seamless continuity. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h4 Mini Case Study: The Power of Multi-Carrier Support | Keep evidence; rewrite S7 | Angel Watch regional requirements support scoped network choice; no unverified performance. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h3 Tip 8 ,  Obsess over the customer experience (CX) | Keep in S5.8 and S6 | Support and exception handling; drop arbitrary response-time and success-rate targets. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h3 Tip 9 ,  Engineer your first 1,000 customers | Rewrite S5.9 | Select a representative pilot; 1,000 customers is not a universal readiness gate. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h3 Tip 10 ,  Choose a partner, not just a platform | Keep in S5.4 and S6 | Assign escalation, evidence and operating responsibilities. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h2 The Spenza Advantage: Your All-in-One MVNO Launchpad | Rewrite S7 | Use supported platform capabilities and explicit boundaries. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h2 Conclusion: Your MVNO Launch is Closer Than You Think | Merge into conclusion | No guaranteed proximity to launch. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | h2 FAQs | Merge into S8 | Replace seven-day proof claim and duplicate questions. |

## ACF TL;DR Merge Map

The complete raw blocks are in the audit JSON. No TL;DR was inferred from body content. All populated copy will be rewritten and stored only in `templateBlocks`, never duplicated in the article body.

| Source URL | Section or asset | Decision | Reason |
| :--- | :--- | :--- | :--- |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | TL;DR heading | Keep role | Render the single shared summary heading. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | twoCol 1: Fast, Low-Cost Entry via MVNEs | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | twoCol 2: Choose the Right MVNO Model | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | twoCol 3: eSIM and 5G Are Essential | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | twoCol 4: Compliance Is Mandatory but Manageable | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/launch-mvno-us-guide/](https://spenza.com/mvno/launch-mvno-us-guide/) | oneCol 1: Winning Strategy Focus and Distribution | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | TL;DR heading | Keep role | Render the single shared summary heading. |
| [/mvno/how-to-set-up-mvno/](https://spenza.com/mvno/how-to-set-up-mvno/) | Empty description and card arrays | No content to carry | Do not invent missing ACF summaries. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | TL;DR heading | Keep role | Render the single shared summary heading. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | TL;DR description | Rewrite | A 60 to 100 word launch verdict, with service scope and readiness instead of speed promises. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | twoCol 1: 5G and eSIM Are Lowering Launch Barriers | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | twoCol 2: Niche Markets Create New MVNO Opportunities | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | twoCol 3: The MVNx Experience Matters Beyond Pricing | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | twoCol 4: Choose the Right MVNO Launch Strategy | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/launch-us-mvno-now/](https://spenza.com/mvno/launch-us-mvno-now/) | oneCol 1: Spenza Simplifies U.S. MVNO Launches | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | TL;DR heading | Keep role | Render the single shared summary heading. |
| [/mvno/us-mvno-introduction/](https://spenza.com/mvno/us-mvno-introduction/) | Empty description and card arrays | No content to carry | Do not invent missing ACF summaries. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | TL;DR heading | Keep role | Render the single shared summary heading. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | TL;DR description | Rewrite | A 60 to 100 word launch verdict, with service scope and readiness instead of speed promises. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | twoCol 1: Choose a Specific Niche Before Launching an MVNO | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | twoCol 2: Start With an MVNE Platform Instead of Building Everything Yourself | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | twoCol 3: Make eSIM-First Digital Activation a Priority | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | twoCol 4: Plan Economics, Compliance, and Customer Experience Early | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |
| [/mvno/top-10-tips-launching-mvno-us-2025/](https://spenza.com/mvno/top-10-tips-launching-mvno-us-2025/) | oneCol 1: How Spenza Helps Businesses Launch MVNOs Faster | Merge into new summary cards | Preserve decision intent; qualify capabilities, remove unsupported cost, speed, universal compliance and eSIM claims. |

New four-card themes: define service scope; assign operating responsibilities; validate quoted economics; prove the pilot. Closing card: launch when named owners have accepted the evidence.

## Accuracy decisions

- Remove market forecasts, unsupported setup budgets and universal launch times. Their presence on another vendor page does not validate them, especially when that vendor cites Spenza back.
- Correct the destination's wireless/VoIP safe-harbor confusion. The [2026 FCC Form 499-A instructions](https://www.usac.org/wp-content/uploads/service-providers/documents/forms/2026/2026-FCC-Form-499A-Form-Instructions.pdf), printed page 41, distinguish 37.1% for cellular/broadband PCS telecommunications revenues from 64.9% for VoIP telecommunications revenues. These are revenue-allocation safe harbors, not a universal tax rate. The article need not reproduce either percentage.
- Separate registration, reporting, contributions and exemptions. Never call Form 499 an all-purpose MVNO license. Do not assign every filing to every data-only seller or marketing agent.
- Replace the destination's universal multi-line telephone system framing with service-specific wireless 911 review. [47 CFR 9.10(a)](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-9/subpart-C/section-9.10) expressly describes the relevant service scope, including covered wholesale resellers.
- Treat approved broadband-label changes and effective provisions separately. The [August 13, 2026 final rule](https://www.federalregister.gov/documents/2026/08/13/2026-16503/empowering-broadband-consumers-through-transparency) sets a September 14 effective date but delays amendatory instruction 3 indefinitely. Do not present every adopted change as operative.
- Do not repeat inconsistent carrier/network/country counts. Confirm rights for the actual devices, geography and service in the contract.
- Remove 98% activation, support-response, automation, churn and pilot-size targets unless backed by an approved measured cohort.
- Angel Watch: retain published product and operating scope only. IMZ: no under-30-day, savings, reseller-count or ticket-reduction result without an approved record. No unapproved executive quotation.

## Image inventory and decisions

Inspected all 19 live images and all five existing preview assets. The [image inventory](M16-image-inventory.json) records each source, dimensions, decision and reason. Image IDs below match that inventory. No generation was performed during Phases 1 to 4.

| Source URL / existing asset | Section or asset | Decision | Reason |
| :--- | :--- | :--- | :--- |
| /mvno/launch-mvno-us-guide/ | 0: [Blog-Thumbnails.png](https://media.spenza.com/wp-content/uploads/2026/04/Blog-Thumbnails.png) | Reuse | Destination fixed-template featured image: correct 1280 by 720 layout; US launch subject fits. Reuse as a 2026-reviewed guide, optimize to WebP; do not generate a whole replacement hero. |
| /mvno/launch-mvno-us-guide/ | 1: [image-1024x683.png](https://media.spenza.com/wp-content/uploads/2025/06/image-1024x683.png) | Drop | Blue rocket illustration is decorative and outside the chosen orange system. |
| /mvno/launch-mvno-us-guide/ | 2: [Spenzas-MVNO-Launch-Solution-2026-1024x766.png](https://media.spenza.com/wp-content/uploads/2026/04/Spenzas-MVNO-Launch-Solution-2026-1024x766.png) | Drop | Six-function wheel includes unqualified compliance coverage and does not explain readiness. |
| /mvno/how-to-set-up-mvno/ | 3: [Blog-Thumbnails-10.png](https://media.spenza.com/wp-content/uploads/2025/05/Blog-Thumbnails-10.png) | Drop | Donor fixed-template hero has the old 2025 title; destination hero is more relevant. |
| /mvno/how-to-set-up-mvno/ | 4: [image-7-1024x683.png](https://media.spenza.com/wp-content/uploads/2025/05/image-7-1024x683.png) | Drop | Old-year purple launch illustration does not fit the new structure. |
| /mvno/how-to-set-up-mvno/ | 5: [image-8-1024x314.png](https://media.spenza.com/wp-content/uploads/2025/05/image-8-1024x314.png) | Drop | Tiny isometric lettering is decorative and difficult to read. |
| /mvno/how-to-set-up-mvno/ | 6: [How-to-Launch-Your-MVNO-in-2025-visual-selection-1024x511.png](https://media.spenza.com/wp-content/uploads/2025/05/How-to-Launch-Your-MVNO-in-2025-visual-selection-1024x511.png) | Drop | Small rainbow step diagram is superseded by the clearer existing preview process image. |
| /mvno/launch-us-mvno-now/ | 7: [Launch-and-Grow-an-MVNO-in-the-US-2025.png](https://media.spenza.com/wp-content/uploads/2025/06/Launch-and-Grow-an-MVNO-in-the-US-2025.png) | Drop | Old-year donor hero duplicates the destination role. |
| /mvno/launch-us-mvno-now/ | 8: [USA-MVNO-1024x683.png](https://media.spenza.com/wp-content/uploads/2025/06/USA-MVNO-1024x683.png) | Drop | Blue/purple phone illustration adds no operational information. |
| /mvno/launch-us-mvno-now/ | 9: [AD_4nXfBv69Cy4V2vY30wHIANxkA_XvqTbU-En3orrrR32yPWraUOw2quT6LgHHNBFc9C1IWNFG4WaGhoPPqnZSyqxVpVAHNoe2foXF98H4lzkGA4rRBzFLUrGQiS5GOepCaTEZdhiT3gg.png](https://media.spenza.com/wp-content/uploads/2025/06/AD_4nXfBv69Cy4V2vY30wHIANxkA_XvqTbU-En3orrrR32yPWraUOw2quT6LgHHNBFc9C1IWNFG4WaGhoPPqnZSyqxVpVAHNoe2foXF98H4lzkGA4rRBzFLUrGQiS5GOepCaTEZdhiT3gg.png) | Drop | Market forecast chart is not needed and its figures are not carried forward. |
| /mvno/launch-us-mvno-now/ | 10: [MVNO-US-1024x683.png](https://media.spenza.com/wp-content/uploads/2025/06/MVNO-US-1024x683.png) | Drop | Technology-trend artwork repeats the rejected urgency framing. |
| /mvno/launch-us-mvno-now/ | 11: [US-MVNO-1024x683.png](https://media.spenza.com/wp-content/uploads/2025/06/US-MVNO-1024x683.png) | Drop | Consumer collage does not fit the prioritized B2B decision. |
| /mvno/launch-us-mvno-now/ | 12: [Spenza_-Your-Catalyst-to-Launch-an-MVNO-in-2025-visual-selection-1024x829.png](https://media.spenza.com/wp-content/uploads/2025/06/Spenza_-Your-Catalyst-to-Launch-an-MVNO-in-2025-visual-selection-1024x829.png) | Drop | Small multicolor product wheel repeats generic partner claims. |
| /mvno/us-mvno-introduction/ | 13: [35.png](https://media.spenza.com/wp-content/uploads/2024/12/35.png) | Drop | Donor hero topic and tiny labels do not fit this launch checklist. |
| /mvno/top-10-tips-launching-mvno-us-2025/ | 14: [Top-10-Tips-for-Launching-an-MVNO-in-the-US.png](https://media.spenza.com/wp-content/uploads/2025/08/Top-10-Tips-for-Launching-an-MVNO-in-the-US.png) | Drop | Tips thumbnail duplicates the better-matched destination featured image. |
| /mvno/top-10-tips-launching-mvno-us-2025/ | 15: [ChatGPT-Image-Aug-7-2025-11_20_14-AM-1024x683.png](https://media.spenza.com/wp-content/uploads/2025/08/ChatGPT-Image-Aug-7-2025-11_20_14-AM-1024x683.png) | Drop | Dated 2025 route illustration is decorative. |
| /mvno/top-10-tips-launching-mvno-us-2025/ | 16: [launch-an-MVNO-in-the-US-2025_-10-steps-visual-selection-1024x509.png](https://media.spenza.com/wp-content/uploads/2025/08/launch-an-MVNO-in-the-US-2025_-10-steps-visual-selection-1024x509.png) | Drop | Small blue ten-tip diagram is superseded by the larger process image. |
| /mvno/top-10-tips-launching-mvno-us-2025/ | 17: [image-7-1024x768.png](https://media.spenza.com/wp-content/uploads/2025/08/image-7-1024x768.png) | Drop | SIM-size graphic does not explain eSIM compatibility or the launch decision. |
| /mvno/top-10-tips-launching-mvno-us-2025/ | 18: [The-Spenza-Advantage_-Your-All-in-One-Launchpad-visual-selection-1024x827.png](https://media.spenza.com/wp-content/uploads/2025/08/The-Spenza-Advantage_-Your-All-in-One-Launchpad-visual-selection-1024x827.png) | Drop | Feature wheel implies broad compliance support without defined responsibilities. |
| existing preview | 19: `launch-mvno-us-guide-featured.png` (deleted with its WebP on 2026-09-23) | Reject | Previous preview featured image was generated whole and violates the fixed template. |
| existing preview | 20: `mvno-cost-timeline-build-vs-mvne.png` (deleted with its WebP on 2026-09-23) | Reject | Previous cost/timeline graphic contains unsupported price and launch-duration bands. |
| existing preview | 21: `mvno-customer-evidence-strip.png` (deleted with its WebP on 2026-09-23) | Reject | Previous customer strip turns unapproved launch times and geographic counts into evidence. |
| existing preview | 22: `mvno-model-ladder.png` (deleted with its WebP on 2026-09-23) | Reject | Previous ladder incorrectly mixes IoT and embedded use cases with operating depth. |
| existing preview | 23: [mvno-us-launch-10-step-path.png](../../public/blog-media/mvno-us-launch/mvno-us-launch-10-step-path.png) | Reuse with caption | 1600 by 900 process diagram matches the retained ten steps. Caption must clarify parallel workstreams: compliance starts at scoping, and public launch follows the pilot. All labels and evidence stay in accessible HTML too. |

Two relevant assets already cover the planned image roles. No new generation is necessary for this outline. The user has authorized missing visuals if the approved structure reveals a real gap; follow the blog-images skill and docs, with the imagegen skill for any raster generation. Never regenerate the featured template.

## Links, anchors, dates and scope

- Complete existing internal/external link lists are captured per source in the audit JSON. Retain contextually useful targets, not obsolete or duplicate anchors.
- Keep destination heading wording for the cost question and ten-step playbook. Keep its existing `FAQs` anchor ID. Other destination headings have no explicit IDs in the captured live body.
- Original destination publication: `2026-04-22T11:11:00+00:00`. Preserve it. The future rewrite gets its actual modification date.
- The required cost URL `/mvno/mvno-mvno-launch-cost/` resolves directly with HTTP 200. The older `/mvno/mvno-launch-cost/` redirects there; use the required final URL.
- Do not link any donor. M16 does not intersect a do-not-merge group. Detailed models and related billing/eSIM articles remain separate.
- This research makes no WordPress, redirect, category, slug or preview registration changes. The stale brief instruction for an Article plus BreadcrumbList graph is superseded by editorial standard section 12: Output F will be a delta only.
