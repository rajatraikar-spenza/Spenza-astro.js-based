# M02 image inventory and plan

Step 1 completed before ideation. Fresh live destination and two donor pages supplied 19 candidates: 3 featured and 16 body assets. Every accessible image was visually inspected. One apex reference returned 404; its existing CDN counterpart was inspected instead. RocketPhone supplied two additional case-study diagrams for evaluation after the approved case was identified.

All reused assets stay at their existing `media.spenza.com` URLs. Exact live `srcset`, `sizes` and `<picture>` markup are stored in [M02-image-inventory.json](./M02-image-inventory.json). Do not make local copies or invent responsive derivatives. The two retained body figures currently use PNG srcsets rather than picture/WebP; preserve what the live page serves. The hero already has a WebP picture source. New images will have local optimized PNG/WebP pairs only while in preview.

| ID | Source | Candidate | Decision | Reason |
| --: | :-- | :-- | :-- | :-- |
| 1 | `/mvno/mvno/` | [What-Is-an-MVNO-Types-Benefits-and-Key-Insights.png](https://media.spenza.com/wp-content/uploads/2026/02/What-Is-an-MVNO-Types-Benefits-and-Key-Insights.png) | KEEP | Destination fixed-template hero is title-specific and still fits the definition/types scope; retain CDN picture and srcset. |
| 2 | `/mvno/mvno/` | [mvno-hub-hero.png](https://media.spenza.com/wp-content/uploads/2026/06/mvno-hub-hero.png) | REJECT | Small embedded explanatory text and a Spenza logo inserted into a generic network path. Does not clearly distinguish optional enablement from the radio/core path; new role diagram is more precise. |
| 3 | `/mvno/mvno/` | [ChatGPT-Image-Jun-11-2026-02_50_26-PM.png](https://media.spenza.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-11-2026-02_50_26-PM.png) | REJECT | Five compulsory-looking serial layers imply every launch uses separate MVNA and MVNE entities; also contains banned promotional wording. Replace with distinct roles and optional relationships. |
| 4 | `/mvno/mvno/` | [ChatGPT-Image-Jun-11-2026-02_50_34-PM.png](https://media.spenza.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-11-2026-02_50_34-PM.png) | REJECT | Perspective staircase and absolute maximum-control wording oversimplify contract-dependent ownership. The comparison belongs in a real HTML table. |
| 5 | `/mvno/mvno/` | [ChatGPT-Image-Jun-11-2026-02_53_02-PM.png](https://media.spenza.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-11-2026-02_53_02-PM.png) | REJECT | Money-flow arrow runs from wholesale cost toward retail, confusing collection versus payment; a generic margin block omits cost boundaries. Use an explicit HTML economics table. |
| 6 | `/mvno/mvno/` | [ChatGPT-Image-Jun-11-2026-02_54_24-PM.png](https://media.spenza.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-11-2026-02_54_24-PM.png) | KEEP | Seven readable, unpriced launch stages match the preserved destination sequence. Caption must state that compliance starts during planning and continues; no fixed duration or seven-day promise. |
| 7 | `/mvno/mvno/` | [ChatGPT-Image-Jun-11-2026-02_56_12-PM.png](https://media.spenza.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-11-2026-02_56_12-PM.png) | KEEP | Six use cases visibly distinguish applications from operating models. Native 1448 by 1086 aspect preserves all six cells; do not crop. Caption distinguishes illustrative niches from customer proof. |
| 8 | `/mvno/mvno/` | [ChatGPT-Image-Jun-11-2026-02_58_11-PM.png](https://media.spenza.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-11-2026-02_58_11-PM.png) | REJECT | Connected-in-minutes wording is unqualified; QR/eSIM and a Wi-Fi-like 5G icon do not explain device and operator conditions. |
| 9 | `/mvno/mvno/` | [Screenshot-2025-07-22-180309-1024x590.png](https://spenza.com/wp-content/uploads/2025/07/Screenshot-2025-07-22-180309-1024x590.png) | REJECT | Live apex image reference returns 404. CDN counterpart resolves and was inspected, but the dense legacy product matrix is not an operations screenshot and uses older packaging. |
| 10 | `/mvno/what-are-mvnos/` | [Define-MVNO-What-Is-a-Mobile-Virtual-Network-Operator.png](https://media.spenza.com/wp-content/uploads/2026/03/Define-MVNO-What-Is-a-Mobile-Virtual-Network-Operator.png) | REJECT | Valid donor definition hero but redundant with retained destination hero; blue/green accents also conflict with the selected orange/ink visual set. |
| 11 | `/mvno/what-are-mvnos/` | [ChatGPT-Image-Jun-10-2026-12_42_51-PM-1024x768.png](https://media.spenza.com/wp-content/uploads/2026/03/ChatGPT-Image-Jun-10-2026-12_42_51-PM-1024x768.png) | REJECT | Second title card duplicates featured image and teaches no additional mechanism; no body slot earned. |
| 12 | `/mvno/what-are-mvnos/` | [Spenza-MVNO-1024x780.png](https://media.spenza.com/wp-content/uploads/2026/03/Spenza-MVNO-1024x780.png) | REJECT | Dense radial capability list repeats prose and blanket real-time/global claims; not a screenshot or current three-module architecture. |
| 13 | `/mvno/what-are-mvnos/` | [MVNO-Tech-Trends-1024x780.png](https://media.spenza.com/wp-content/uploads/2026/03/MVNO-Tech-Trends-1024x780.png) | REJECT | Tiny text and broad eSIM/AI/cloud/5G/satellite promises; not precise enough for the scoped pillar. |
| 14 | `/telecom/what-is-mvno/` | [Understanding-MVNO-Mobile-Virtual-Network-Operator-In-2026.png](https://media.spenza.com/wp-content/uploads/2025/12/Understanding-MVNO-Mobile-Virtual-Network-Operator-In-2026.png) | REJECT | Fixed template but phone stock photo is generic; destination hero is more informative. |
| 15 | `/telecom/what-is-mvno/` | [MVNO-Mobile-Virtual-Network-Operator-1024x616.png](https://media.spenza.com/wp-content/uploads/2025/12/MVNO-Mobile-Virtual-Network-Operator-1024x616.png) | REJECT | SIM stock photo with acronym text adds no information beyond the definition. |
| 16 | `/telecom/what-is-mvno/` | [image-8-1024x538.png](https://media.spenza.com/wp-content/uploads/2025/12/image-8-1024x538.png) | REJECT | 2024 third-party price benchmark has narrow conditions, tiny footnotes and off-brand accents; not valid as a general current MVNO price comparison. |
| 17 | `/telecom/what-is-mvno/` | [image-9.png](https://media.spenza.com/wp-content/uploads/2025/12/image-9.png) | REJECT | Conflates MVNE/MVNA, uses a VPN icon and implies outsourced compliance. Replaced by precise role diagram. |
| 18 | `/telecom/what-is-mvno/` | [image-10.png](https://media.spenza.com/wp-content/uploads/2025/12/image-10.png) | REJECT | Generic people/phone illustration does not teach the product-fit decision. |
| 19 | `/telecom/what-is-mvno/` | [image-11.png](https://media.spenza.com/wp-content/uploads/2025/12/image-11.png) | REJECT | Risk wheel names four headings without explaining a relationship, mitigation or owner; the proposed responsibility/test table is more useful. |
| 20 | `/spenza-product/rocketphone-case-study/` | [rocketcell-call-flow.png](https://media.spenza.com/wp-content/uploads/2026/07/rocketcell-call-flow.png) | REJECT for reuse in M02 | Keep on its case page and cite it. Dense case-specific diagram with blue accents and narrow implementation details; not a general MVNO role graphic or an operations screenshot. Avoid duplicating a figure across retained posts. |
| 21 | `/spenza-product/rocketphone-case-study/` | [spenza-multitier-architecture.png](https://media.spenza.com/wp-content/uploads/2026/07/spenza-multitier-architecture.png) | REJECT for reuse in M02 | Keep on its case page and cite it. Dense case-specific diagram with blue accents and narrow implementation details; not a general MVNO role graphic or an operations screenshot. Avoid duplicating a figure across retained posts. |

## Four planned image slots

| Slot | Purpose and location | Asset | Alt text |
| :-- | :-- | :-- | :-- |
| Featured | Define MVNO at a glance, before TL;DR | Existing candidate 1, 1280 by 720, fixed template | What is an MVNO? A mobile brand uses a host network to serve its customers. |
| Body 1 | Distinguish commercial roles from network traffic, after Ecosystem answer | New `mvno-network-and-operating-roles.png` and `.webp`, 1600 by 900 | An MVNO serves customers over an MNO network, with optional MVNE systems and MVNA wholesale aggregation. |
| Body 2 | Show product niches are a different axis from infrastructure depth, in Vertical fit | Existing candidate 7, native 1448 by 1086; preserve live display dimensions and srcset | Connected watches, apps, fleets and sensors can use the same MVNO operating models. |
| Body 3 | Give a visual overview before the practical launch checks | Existing candidate 6, native 1672 by 941; preserve live display dimensions and srcset | Seven MVNO launch stages connect product strategy, wholesale access, billing, compliance, testing and growth. |

Three reused assets, one new slot. No new featured image is needed. No image has been generated. New slot is part of the Phase 4 proposal and will only be produced after outline approval.

## New body diagram prompt

Use the fixed preamble verbatim:

> Create a clean, modern B2B SaaS infographic for a telecommunications platform
> brand. Flat vector illustration style. Palette: warm cream background
> `#FDF5F2`, white cards with soft shadows, deep ink `#1A1A2E` for headings, grey
> `#4E545D` for body text, and a single accent of vivid orange `#FF4500` used
> sparingly for emphasis. Geometric sans-serif typography (Montserrat or Inter).
> Generous whitespace, strong alignment to an invisible grid, everything level
> and symmetrical. No photorealism, no 3D renders, no drop-shadowed bevels, no
> gradient meshes, no stock-photo people, no clip-art, no emoji. 1600×900
> pixels, 16:9. Any text must be large, minimal and correctly spelled.

Composition brief:

> A flat relationship map with three large, evenly spaced cards on the top row and two smaller support cards beneath. The top row, left to right: “Customer”, “MVNO”, “MNO”. Below the MVNO place “MVNE”; below the gap between MVNO and MNO place “MVNA”. A solid line between Customer and MVNO is labelled “Service relationship”. A separate solid line between MVNO and MNO is labelled “Network access”. Dashed lines connect MVNE to MVNO and MVNA to the network-access line. Under the support cards set “Optional systems” and “Optional aggregation”. Orange identifies the MVNO and its service relationship; ink identifies the MNO, grey identifies optional support. These are commercial and operating relationships, not the packet route. Do not draw a mandatory five-stage chain, ranked ladder, tower ownership inside the MVNO, cost figures, timeline, coverage claim, customer logo or brand logo. Generate the shapes and icons with blank text zones; set all exact labels in a design tool after generation.

Caption: “A role map, not a traffic diagram. One supplier can combine enablement and aggregation; the contract defines who performs each task.”

Stage 2 typesetting is required for the labels. Review at mobile width and use the paragraph/table to carry detail. The four-role definitions and optional/combined relationships must be technically reviewed before final export.

## Phase 5 completion, 23 September 2026

All four approved slots are filled. The three KEEP decisions above now reference the captured CDN URLs and responsive attributes in the M02 preview. No reused media was downloaded into the repository. Only the new network/operating-role diagram has a local PNG/WebP pair.

The built-in image generator produced an unlabelled frame using the fixed preamble and the approved composition above. Stage 1 explicitly excluded all letters, numbers, logos and icons, leaving five empty cards and their solid/dashed relationships. The exact additional composition instruction was:

> Generate ONLY the unlabelled composition frame; ALL TEXT will be set later in Figma, so do not render any text, letters, numerals or logo. Make a clean sparse role map, not a packet-flow or five-step chain. Top row at y=220 to460: three equal white rounded cards at x=90..410, x=640..960, x=1190..1510. Leave their middle zones entirely empty for the future labels Customer, MVNO, MNO. A solid orange horizontal connector from first card to second, and solid ink horizontal connector from second to third, y=340. Ample blank space above connectors for future labels. Below center card, smaller white card x=640..960 y=610..790. Below the gap between center and right top cards, another smaller white card x=1060..1380 y=610..790. Grey dashed connectors lead from first lower card up to middle top card and second lower card up to network-access connector. Keep the lower cards' interiors empty for future optional MVNE and MVNA labels. No arrows suggesting mandatory sequence. No icons are necessary. Uniform cream background, orange accent only on center top card thin border and customer relationship connector. Broad blank top margin for a title. Precise spacious flat diagram.

Stage 2 set every label as editable Inter type in [Figma, M02 page](https://www.figma.com/design/QYBV0dwgiLrqR4PP6RpgP6?node-id=8-5). Other pages and existing figures in that file were not modified. The image import required a palette PNG: the original exceeded the connector's 50,000-character code limit and WebP import was unsupported. The background was reduced to 1200 by 675 before import; the final canvas and editable type were exported at 1600 by 900. This is a sparse shape layer, not an upscaled text image.

Final label sizes: 48px title/top roles, 32px MVNE card, 28px MVNA card and relationship labels. Minimum is above the 24px floor. Optimized PNG is 58,540 bytes; WebP is 36,818 bytes. Both are sRGB, 1600 by 900. Inspected the Figma export at 1024px and optimized WebP at full width: spelling, line relationships, crop and contrast pass. No new hero was generated. The two retained body figures keep their native PNG responsive markup; only the hero and new diagram have verified WebP variants.

[Asset provenance and hashes](./M02-generated-image.json). No slots remain unfilled and no further prompts require execution. The requested customer operations screenshot remains evidence pending; the illustrative role diagram does not stand in for it.
