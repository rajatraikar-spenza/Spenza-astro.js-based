# M07 and M16 generated body images

September 23, 2026. The user explicitly authorized generation after the inventory and prompts were delivered. This supersedes the earlier pending-artwork state. Scope remains M07 and M16 only.

## Delivery

Both articles now contain **four actual images: one existing featured image and three body figures**. The four orange placeholders and their CSS are removed. Reused images retain their live CDN URLs and responsive markup; only genuinely new assets are local.

| Article | New image | Files under `public/blog-media/` |
| :--- | :--- | :--- |
| M07 | Contractual responsibility roles | `white-label-mvno/white-label-mvno-responsibility-roles.png` and `.webp` |
| M07 | Request-to-bill acceptance checks | `white-label-mvno/white-label-mvno-request-to-bill.png` and `.webp` |
| M16 | Product choice versus operating scope | `mvno-us-launch/us-mvno-product-and-operating-choices.png` and `.webp` |
| M16 | Contribution versus cash timing | `mvno-us-launch/us-mvno-contribution-and-cash-timing.png` and `.webp` |

## Production method

The [completed source inventory](M07-M16-image-inventory.md) preceded generation. The [prompt set](M07-M16-image-prompts.md) defines the four uncovered slots. The built-in image_gen tool generated text-free frames; no API/CLI fallback was used. Every final label was set separately in editable Inter text in [Figma](https://www.figma.com/design/QYBV0dwgiLrqR4PP6RpgP6), following the mandatory second stage for diagrams.

The typography pass corrected clipped two-line labels before final export. The cash-timing frame received one targeted imagegen edit to reduce the calendar/receipt icons and leave room for labels. The role-map note background was flattened in Figma. Final text is 27px or larger at full size and below 40 words per image. The cash formula uses a graphic minus sign followed by “Variable costs,” avoiding a redundant “Less.” The request-to-bill diagram uses “Proposed acceptance checks” as its heading. No invented data, customer results, price, date or screenshot appears.

Figma frame IDs: responsibility `3:2`, acceptance `3:4`, choices `3:6`, cash `3:8`. All exports are 1600×900 in PNG and WebP, optimized with sharp. [Asset measurements](M07-M16-generated-image-assets.json) record each size. WebP files range from 47,042 to 61,972 bytes. All four optimized images were visually inspected, including an 800px-wide rendering of each; labels are complete and correctly spelled.

Captions clarify that roles can overlap, product choices do not map one-to-one to operating scope, acceptance checks are proposed, and contribution differs from cash requirements. HTML retains meaningful alt text, explicit dimensions, lazy loading and PNG fallbacks. No featured image was generated.

## Verification and editorial status

- [Text measurements](M07-M16-generated-image-counts.json): M07 **2,685** words, M16 **2,711**, including TL;DR and the new captions. Both remain below 3,000 with zero em/en dashes or checked banned phrases; three body figures, zero placeholders and six FAQs each.
- Schema-delta wordCount values reflect the added captions. No second schema graph was authored or injected.
- Information gain remains **7/10, hold** for both. These explanatory diagrams do not satisfy the missing firsthand evidence. The [evidence checklist](M07-M16-evidence-hold.md) remains open.
- No WordPress/media-library write, S3 upload, redirect, slug/category change, publication or push. New files are staged locally for preview; production publication remains a separate authorized action.
- [Browser QA](M07-M16-generated-image-browser-qa.json): both previews return 200; four actual article images each, zero pending slots, all local figures resolve to WebP at 1600×900. Live responsive media attributes still match their captures. Desktop and 390px mobile layouts have no document overflow; FAQ mouse, keyboard and JavaScript-disabled behavior passes, with no page errors.
- Required CSS optimization ran. Its unrelated global bundle changes were restored; the initial overlapping build was discarded and rebuilt after restoration. The final build contains 910 pages. Asset audit: **zero broken references across 487 pages**. Distribution verification: **zero missing and zero stranded assets**, including all eight new PNG/WebP files.
- Final `npx astro check`: **0 errors, 0 warnings, 72 hints across 329 files**. No content-pipeline code was changed during this image delivery.
