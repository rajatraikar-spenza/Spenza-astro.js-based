# M07: Phase 1 audit and Merge Map

Audit date: September 22, 2026. Branch: `blog-automation`. Selected because the user explicitly requested M07. Status remains `pending`. No article has been drafted or replaced in this phase.

The destination and all three donors were fetched from the public live site. Article text was extracted from the complete `elementor-widget-theme-post-content` element using an HTML parser, excluding scripts and styles. Counts include headings, table cells, any in-body contents list, and in-body CTAs; they exclude the separate ACF TL;DR, page chrome, related posts and author widgets. These are reproducible body counts, not Yoast's stored counts or the previous preview's count.

| Source | Live H1 | Body words | Historical GSC clicks, 16 months | Historical Google AI impressions | Historical Bing citations |
| :--- | :--- | ---: | :--- | :--- | :--- |
| [Destination](https://spenza.com/mvno/white-label-mvno-launch-guide-2025/) | White Label MVNO Launch Guide 2026: Build Your Mobile Brand | 2,470 | Not supplied | Not supplied | Not supplied |
| [Box donor](https://spenza.com/mvno/mvno-in-a-box-for-brands/) | MVNO in a Box: Launch Your Own Mobile Brand Fast | 2,198 | 45 | 168 | 6 |
| [Non-telco donor](https://spenza.com/mvno/how-to-launch-mvno-non-telco-brand-2025/) | How to Start a MVNO as a Non-Telco Brand in 2026 | 1,762 | 19 | 115 | Data unavailable |
| [Practical donor](https://spenza.com/mvno/white-label-mvno/) | White Label MVNO: A Practical Launch Guide | 1,600 | 22 | 103 | 320 |

Combined live body count: **8,030 words**. Traffic and citation values come from `merge-plan.json`, sourced from the September 8, 2026 workbook. They are not fresh measurements, and unavailable values are not zero. Citation-bearing passages themselves were not identified by an analytics export. Priority is therefore at URL level, especially the practical donor, not a claim that a specific paragraph earned a citation.

The existing preview is the before version. The user's measured baseline is 2,746 words, 22 em dashes, 23 en dashes and one banned word. It has not been used as the outline or drafting source.

## Destination Merge Map

All rows below refer to [the destination](https://spenza.com/mvno/white-label-mvno-launch-guide-2025/). “Keep” means preserve the useful substance in fresh prose, not paste the old passage. Section numbers refer to Output C.

| Section or asset | Decision | Reason and destination |
| :--- | :--- | :--- |
| What is a White Label MVNO? | Rewrite into section 1; keep H2 wording | Strong direct query match. Explain radio network, managed platform and brand separately. Remove the seven-day promise and mismatched market citation. |
| Why White Label MVNOs Are Exploding in 2026 | Drop | Trend pitch does not help an OEM, MSP or platform decide scope. Unsupported eSIM adoption and market claims are unnecessary. |
| White Label vs. Private Label MVNO: What's the Difference? | Rewrite into section 1 H3 and section 3 | Keep the control question. These marketing labels alone do not establish billing ownership, infrastructure ownership or launch time. |
| Who Should Launch a White Label MVNO? | Keep and rewrite into section 2; keep H2 wording | Preserve device bundles, managed service providers and embedded services. Deprioritize celebrity brands and hobby founders. |
| Cost Breakdown: What Does It Actually Cost to Launch? | Rewrite into section 4; keep H2 wording | Preserve wholesale commitments, provisioning and support as cost drivers. Replace unverified setup prices, monthly fees and margin bands with a quote worksheet. |
| How to Launch a White Label MVNO in 7 Days (Spenza Model) | Merge sequence into section 5 | Platform configuration is not the whole launch. Retain setup, plans, SIM provisioning and testing without elapsed-day promises. |
| Step-by-Step: How to Launch a White Label MVNO | Keep and rewrite into section 5; keep H2 wording | Consolidate overlapping four-, five-, seven- and ten-step sequences into one set of launch gates. |
| Choosing Your MVNE Platform: An Honest Comparison | Rewrite into section 6 | Replace unsourced provider timelines and editorial insults with sourced capabilities, use-case fit and questions to verify. |
| US Regulatory Essentials for White Label MVNOs | Rewrite into sections 3 and 5 | Assign responsibility by service and operating role. Do not suggest every business has identical filings or that outsourcing removes obligations. Remove the unverified February advisory. |
| Common White Label MVNO Pitfalls to Avoid | Merge into sections 4, 5 and 6 | Keep support, commitments and exit risks next to the decisions they affect. |
| Partnering with Spenza to Launch Your Brand, `#Spenza` | Rewrite into section 7; preserve ID | Replace feature promotion with scoped implementation evidence. |
| Case Study: IMZ Branded MVNO Launch, `#IMZ` | Keep qualitative scope in section 7 H3; preserve ID | Shopify storefront, prepaid billing and reseller operations are useful. Confirm deployment scope before treating repeated blog descriptions as an approved case record. |
| Results | Drop numeric claims pending evidence | Do not carry forward 25 resellers, 30% fewer finance tasks or 20% fewer tickets without the underlying approved record. No standalone results H3. |
| Conclusion: Ready to Launch Your White Label MVNO?, `#Conclusion` | Rewrite conclusion; preserve ID | Decision and next step, without guarantees or “any brand” claims. |
| FAQs, `#FAQs` | Rewrite FAQ; preserve ID | Preserve remaining buyer questions; remove repeated H2 definitions and unsourced costs. |
| ACF: Market Opportunity | Rewrite in merged TL;DR | Keep the definition; remove market size and universal eligibility. |
| ACF: White Label vs Private Label MVNOs | Rewrite in merged TL;DR | Replace a rigid label hierarchy with a contract-based ownership decision. |
| ACF: What it costs | Rewrite in merged TL;DR | State quote inputs, not unsupported setup prices or margins. |
| ACF: MVNO Launch Reality | Rewrite in merged TL;DR | Require readiness gates instead of promising a seven-day launch. |
| ACF: Spenza: The MVNE Advantage | Rewrite closing TL;DR card | Scope the platform contribution and the buyer's remaining decisions. |

## Box donor Merge Map

All rows refer to [MVNO in a Box](https://spenza.com/mvno/mvno-in-a-box-for-brands/), with 168 historical Google AI impressions and six Bing citations.

| Section or asset | Decision | Reason and destination |
| :--- | :--- | :--- |
| MVNO in a Box: Transforming How Businesses Launch Mobile Services | Drop opening; merge premise into intro | Generic promotion repeats the definition. |
| What You'll Learn | Drop | The article's direct opening and sidebar contents supply orientation. |
| What is MVNO in a Box? | Rewrite into section 1 | Preserve the pre-integrated package concept and explain it as a delivery model. |
| Core Components of MVNO in a Box | Keep and rewrite into sections 1 and 3 | Network access, provisioning, billing, customer interfaces, integration and support scope are useful citation candidates. |
| Why Brands Are Choosing MVNO in a Box | Merge into section 2 | Retain fit and distribution context, not a second benefit list. |
| Accelerated Time to Market | Rewrite into section 5 | This donor itself varies between 30 to 60 days and one to four weeks. Do not select the more attractive number. |
| Dramatic Cost Savings | Rewrite into section 4 | Preserve fixed versus variable cost structure; remove categorical savings. |
| Flexibility and Scalability | Rewrite into sections 5 and 6 | Verify network access, devices, integrations and contract limits instead of assuming automatic expansion. |
| Customer-Centric Focus | Merge into sections 2 and 3 | Branding and product design stay useful; outsourcing does not erase support ownership. |
| Who is MVNO in a Box for? | Merge into section 2 | Preserve OEM, enterprise and software embedding examples. |
| MVNO in a Box vs. Traditional MVNO: Which One is Right for You? | Rewrite into section 3 table | Preserve the ownership comparison. Remove unsupported prices, deadlines and hardware-only scaling assumptions. |
| Traditional MVNO Setup | Merge into section 3 | Owning more core functions can be justified; an MVNO does not necessarily build radio towers. |
| MVNO in a Box | Merge into section 3 | Contracted service scope matters more than the package name. |
| Spenza: Your Complete MVNO in a Box Solution | Rewrite into sections 6 and 7 | Preserve the documented integration and operations story; do not repeat unverified certification, integration-count or compliance claims. |
| Market Outlook & Emerging Trends | Drop | Broad growth forecasts and Web3 speculation do not advance this buyer task. |
| Rapid Market Growth | Drop | No need for market-size or adoption forecasts in the new structure. |
| Conclusion: Launch Your Own Mobile Brand with MVNO in a Box | Merge into conclusion | One final decision and CTA. |
| FAQs | Merge into section 8 | Keep package and integration questions; avoid repeating the definition and launch pitch. |
| ACF: What is MVNO in a Box? | Rewrite merged TL;DR | Useful scope summary, qualified by contract. |
| ACF: Why Brands Are Choosing MVNO in a Box | Merge merged TL;DR fit card | Remove speed and lower-risk promises. |
| ACF: Traditional MVNO vs MVNO in a Box | Merge merged TL;DR ownership card | No automatic model-to-cost or model-to-deadline mapping. |
| ACF: How to Choose the Right MVNO in a Box Provider | Merge merged TL;DR readiness card | Preserve customization and pricing transparency checks. |
| ACF: Spenza's MVNO in a Box Solution | Merge closing TL;DR card | Replace superlatives with scoped platform contribution. |

## Non-telco donor Merge Map

All rows refer to [the non-telco launch donor](https://spenza.com/mvno/how-to-launch-mvno-non-telco-brand-2025/), with 115 historical Google AI impressions.

| Section or asset | Decision | Reason and destination |
| :--- | :--- | :--- |
| Table of Contents | Drop | Avoid a second contents list alongside the template's sidebar. |
| Introduction | Rewrite into intro | Preserve the existing-product and customer-channel context. Drop rhetorical opening and unsupported niche share. |
| What Would You Get by the End of the Article? | Drop | Repetitive orientation and old-year references. |
| You Don't Need to Be a Telco to Launch a Mobile Service | Rewrite into sections 1 and 3 | Outsourcing core functions is useful; “the MVNE does the rest” is incomplete. |
| The Four-Step Guide to Launching Your Brand's MVNO | Merge into section 5 | One launch sequence. |
| Step 1: Use Your Brand to Build a Mobile Product | Keep and rewrite into section 2 | Product distribution and device bundling are the donor's useful angle. |
| Step 2: Define Your Mobile Value Proposition | Keep and rewrite into sections 2 and 4 | Explain a concrete customer problem and economics. Remove “most successful” plan-count assertions. |
| Step 3: Choose the Right Technology Partner (Your MVNE) | Merge into sections 3 and 6 | Preserve integration scope; remove unqualified “all handled” claims. |
| Step 4: Go-to-Market Using Your Existing Channels | Keep and rewrite into sections 2 and 5 | App, store and customer-channel distribution matter. Remove the “no support team” implication. |
| Few Examples of Non-Telco Brand MVNOs | Rewrite into section 2 | Relabel brand-type scenarios as illustrative opportunities, not proven customer outcomes. |
| Spenza: Your Turnkey Platform for a Non-Telco MVNO | Merge into section 7 | Avoid another feature list. |
| Features and Benefits | Merge into sections 3 and 7 | Use documented scope; remove unsupported country count. |
| Speed to Market | Merge into section 5 | No generic week-based launch promise. |
| MVNO Private Label Options | Merge into section 1 H3 | Resolve inconsistent label usage rather than repeat it. |
| Case Study: How a Smartwatch Brand Became a Successful MVNO | Drop anonymous results; preserve device-bundle idea in section 2 | No named customer or source establishes the claimed revenue, satisfaction or loyalty change. Do not relabel the anonymous story as Angel Watch. |
| Conclusion: Your Brand's Future in Mobile Starts Today | Merge conclusion | Remove urgency pitch and stale year references. |
| FAQs | Merge into section 8 | Keep remaining practical questions without duplicating H2s. |
| ACF TL;DR | No source cards to merge | File has heading, empty description, empty `twoCol` and `oneCol` arrays. |

## Practical donor Merge Map

All rows refer to [the practical white-label donor](https://spenza.com/mvno/white-label-mvno/), with 103 historical Google AI impressions and 320 Bing citations. Preserve useful definition, step and challenge coverage, while correcting claims.

| Section or asset | Decision | Reason and destination |
| :--- | :--- | :--- |
| Opening definition before H2 | Merge into TL;DR and intro | Strong direct-answer structure, repeated within the source. |
| What Is a White Label MVNO? | Keep substance; rewrite into section 1 | Preserve brand, customer experience and platform separation. Remove the implication that licensing and regulatory requirements can be skipped. |
| Why This Matters Now | Drop | Generic trends and malformed copy add little. |
| How to Launch Your White Label MVNO in 5 Steps | Keep and rewrite into section 5 | Preserve niche, partner, configuration, pricing and pilot sequence. |
| Top Challenges When Launching a White Label MVNO (and How to Beat Them) | Keep questions; rewrite into sections 3, 5 and 6 | Preserve regulation, reliability, margins and support. Replace automatic network switching and universal support assumptions. |
| Benefits of a White Label MVNO Platform | Merge useful scope into sections 1 and 3 | Remove seven repetitive benefits and scale guarantees. |
| Why Choose a White Label MVNO Over Building Your Own Infrastructure (Quick Overview)? | Rewrite into section 3 table | Preserve outsourcing comparison. Correct the false choice between white label and owning towers. |
| Who Can Spenza Help Launch a White Label MVNO? | Keep and rewrite into section 2 | OEMs and MSPs align with priority readers. Internal enterprise use is not automatically a resale business. |
| Conclusion: Start Your White Label MVNO Journey Today | Merge conclusion | State remaining work as well as platform scope. |
| FAQs | Rewrite into section 8 | Preserve porting, international availability, IoT billing and data-access questions. Remove guaranteed uninterrupted migration, automatic switching, blanket encryption/compliance and margin claims. |
| ACF TL;DR | No source cards to merge | File has heading, empty description, empty `twoCol` and `oneCol` arrays. |

## Image inventory and decisions

All four featured images and all 14 body images were downloaded and visually inspected. Related-post images were excluded. No images were generated. Filenames below identify existing assets; full URLs are on their source pages. Existing native aspect ratios are retained when cropping would cut labels.

| Source | Existing asset | Decision | Reason |
| :--- | :--- | :--- | :--- |
| Destination | White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand.png | Reuse fixed template; revise title only after outline approval | 1280 by 720. Preserve frame and art panel. Shorten title to WHITE LABEL MVNO / LAUNCH GUIDE. No whole-hero generation. |
| Destination | White-Label-MVNO-2026-1024x576.png | Drop | Decorative title card repeats the hero. |
| Destination | White-label-industrial-use-cases-1024x683.png | Reuse in section 2 | Four scenes connect software, retail, wearables and office sensors. Caption as illustrative use cases, not customer evidence. Preserve 1024 by 683. |
| Destination | 7-Day-Launch-MVNO-Timeline-1024x409.png | Do not reuse as-is; preserve its sequence in the HTML launch checklist | Useful order, but title promises seven days and day labels contain prohibited range dashes. No approved cohort and prerequisites support that promise. The new structure does not need another raster timeline. |
| Destination | Spenza-Image-1024x683.png | Drop | Broad network cloud obscures responsibility boundaries and groups SIM technology with device types. HTML comparison is more precise. |
| Box | MVNO-in-a-Box-The-Fast-Track-to-Launching-Your-Own-Mobile-Brand.png, featured | Drop from merged article | Destination template is already suitable. |
| Box | MVNO-in-a-Box.png | Drop | Decorative box, added turquoise accent, little explanatory content. |
| Box | What-is-MVNO-in-a-Box.png | Drop | Purple palette and duplicate concept art. |
| Box | Why-Brands-Are-Choosing-MVNO-in-a-Box.png | Drop | Phone stock image does not teach the operating model. |
| Box | image-17.png | Preserve concepts in prose; drop raster | Useful BYON, billing and commerce layers, but dense labels and legacy terminology work better as accessible text. |
| Box | ChatGPT-Image-Oct-24-2025-01_33_34-PM-1024x683.png | Drop | Market projection is outside the structure; graph adds purple and a year-range dash. |
| Non-telco | Blog-Thumbnails-1.png, featured | Drop | Old-year title and unrelated brand-logo collage. |
| Non-telco | image-28-1024x683.png | Drop | Blue palette; weaker than the existing four-scene grid. |
| Non-telco | image-30-683x1024.png | Drop; retain useful sequence in section 5 | Off-palette four-step vertical graphic duplicates the numbered list. |
| Non-telco | image-31-683x1024.png | Drop | Before/after implies unsupported engagement and retention outcomes. |
| Practical | Blog-Thumbnails-7.png, featured | Drop | Destination hero is the better template base. |
| Practical | AD_4nXdDz03b...png, white-label title image | Drop | Decorative embossed title adds no information. |
| Practical | AD_4nXfG4OpGD...png, five-step diagram | Drop; preserve step content | Off-palette, dense square diagram duplicates accessible launch steps. |

The plan uses two images, within the editorial standard's two-to-three image requirement: the existing hero template and use-case grid. There is no uncovered explanatory image slot requiring generation.

## Current internal links captured from live bodies

These are inventory, not the proposed article links. Fragment-only contents links are noted separately. All root-relative paths below are on the live site.

| Source | Existing internal destinations |
| :--- | :--- |
| Destination | `/mvno/mvno-billing-platforms/`; `/mvne/`; `/mvno/mvno-types/`; `/mvno/mno-mvno-mvne-mvna-roles/`; `/mvno/launch-mvno-us-guide/`; `/contact/`; `/contact-the-telecom-expense-management-experts/` |
| Box | `/mvno/mvno/`; `/mvno/mvne-explained/`; `/mvno/mno-vs-mvnos/`; `/esim/esim/`; `/mvno/iot-mvnos-vs-traditional/`; `/mvno-calculator/` |
| Non-telco | `/blog/mvno-launching-myths-vs-reality/`; `/mvno/mvne-mvna-mno-to-launch-mvno/`; `/blog/how-to-choose-the-right-mvne-provider-for-your-business/`; `/blog/mvno-trends-2025/`; `/contact/`. Eight fragment-only TOC links. |
| Practical | `/contact/`; `/contact-the-telecom-expense-management-experts/` |

Rebuild contextual links from retained routes in Phase 5. Avoid legacy `/blog/` paths and indirect contact URLs. No body link should point at any of M07's three donors, or a donor scheduled for another merge.

## Dates, IDs and evidence constraints

The live destination's Article node says `datePublished: 2026-04-24T06:48:54+00:00` and `dateModified: 2026-07-17T04:48:40+00:00`. The visible publish date is April 24, 2026. Preserve that publication timestamp. The old preview manifest's August 6 date does not match the destination and must be corrected in Phase 6.

Destination IDs present in raw live HTML: `Spenza`, `IMZ`, `Conclusion`, `FAQs`. Preserve all four. Most destination H2s have no explicit ID in the fetched HTML; retain useful wording and inspect rendered TOC behavior in Phase 6.

The live destination's stored Yoast `wordCount` is 2,228. The extractor counts 2,470 body words. Do not treat stored schema as a fresh count. Output F will specify only the merge delta, and the preview will carry no JSON-LD.

Evidence to carry forward into research:

- [EVIDENCE NEEDED: approved launch scope, prerequisite completion dates and subscriber cohort behind any seven-day branded launch claim, from the implementation lead]. Default: omit the generic deadline.
- [EVIDENCE NEEDED: approved IMZ implementation record and permission to use any quantitative results, from the account owner]. Default: preserve only the sourced qualitative storefront and operations description, with no numeric results.
- [EVIDENCE NEEDED: approved anonymous smartwatch identity and measured outcomes, from the case-study owner]. Default: drop the anonymous case, not rename it.
- [EVIDENCE NEEDED: current quote assumptions and line definitions, from finance or commercial operations]. Default: publish a blank-input cost model and clearly stated algebra, not a numeric benchmark.
- [EVIDENCE NEEDED: named author, accurate role and biography, plus named technical reviewer, from the editorial owner]. Existing live destination attribution is “Spenza”; the old preview uses “SivaSai”. Neither establishes review of this rewrite.

The market attribution, pricing, launch, security and regulatory assertions above are audit findings about source content, not endorsed facts for the new article.
