# Merged-preview FAQ and image alignment correction

28 September 2026. Applies to all 44 previews. No article wording, evidence score, author, image bytes, image URL or srcset changed.

The live reference was https://spenza.com/telecom/skype-alternatives/, inspected in a browser. Its Spectra FAQ uses grey #f6f6f6 cards, 20px corners and padding, a left-side black plus/minus, and a first-expanded, mutually exclusive accordion. Most merged articles instead had white bordered cards and a right-side orange icon. M07 and M16 already had native grouped panels but needed the shared typography and layout treatment.

The fix adds `src/styles/merge-preview.css`, scoped to the merged-preview body in `src/pages/preview/merged/[slug].astro`. A stable root ID makes the shared treatment win over legacy per-cluster open-state rules. Question typography matches the measured live label: Roboto, 20px, weight 500. Existing native details controls remain, with consistent group names and first-open markup. Native keyboard and disclosure semantics remain available without added JavaScript. ArticleLayout and the published-post rendering were not changed.

Gutenberg gave narrow figures intrinsic widths, while per-cluster `margin: 28px 0` kept those containers at the left. Centering only the img inside the figure could not fix that. The shared stylesheet now centers the figure, picture/link wrapper and img, preserves natural aspect ratios, and centers captions. M02's 666px illustrations moved from x=80.5 to x=221.09375 inside a 947.1875px article column at 1440px viewport width.

## Verification

- All 44 built previews checked at 1440px and 390px widths: PASS.
- All 264 FAQ questions exercised at both widths; click, Enter, Space and one-open-panel behavior passed.
- All 116 body images loaded; maximum image-center offset from the article column: 0px at both widths. No distorted aspect ratios or page-wide overflow detected.
- Desktop/mobile FAQ screenshots for M02, M05 and M07 were inspected against the live reference; narrow M02 image renderings were also inspected.
- Exact text-node and image URL/srcset comparison against the pre-change files: unchanged on all 44 articles.
- `npm run merge:qa`: 44/44 PASS.
- `npm run build`: PASS, 955 generated pages. Astro: 0 errors, 0 warnings, 72 existing hints.
- CSS optimizer executed; unrelated baseline generated-bundle churn excluded.
- Distribution verification: 0 missing assets, 0 stranded local media.
- Asset audit: 0 broken references across 487 indexed pages.
- Link audit: 635 unique links, the same pre-existing malformed `/mvno/resell-data-plans-shopify/]/` link in `src/partials/posts/msp-reselling-connectivity-with-hardware.html`. No new link defect attributed to this change; that unrelated content was not edited.

Measured per-cluster results: [PROGRAMME-ui-verification.json](PROGRAMME-ui-verification.json). The shared preview stylesheet and wrapper form part of the UI handoff for eventual publication; copying article HTML alone does not include that stylesheet. WordPress and redirects remain untouched. Nothing was pushed.
