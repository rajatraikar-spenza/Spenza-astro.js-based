# M16 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### us-mvno-product-and-operating-choices.png

DROP the six-card grid. The existing operating-model table preserves the scope choices; a table footnote retains the three product use cases and their independence. Two independent selector dials illustrate that independence.

Verification at 1024px: Two selectors have distinct icon sets and no cross-pairing. Labels are readable.

Replacement: `/blog-media/mvno-us-launch/independent-product-scope-choices.png`. Original PNG and WebP deleted.

1600×900 PNG: 864,400 bytes. WebP: 112,670 bytes.

### us-mvno-contribution-and-cash-timing.png

REBUILD: the original subtraction and payment-timing relationship is useful beyond a list. Show revenue after cost deductions separately from a supplier/customer payment gap.

Verification at 1024px: Six labels distinguish revenue, variable costs, contribution and payment timing; no dates, prices or proportional measurements.

1600×900 PNG: 781,762 bytes. WebP: 137,220 bytes.

### mvno-us-launch-10-step-path.png

REBUILD the true ten-stop sequence. Retain all ten workstreams and the existing caption that workstreams overlap; replace card backgrounds with dimensional objects on a continuous path.

Verification at 1024px: Ten objects counted; arrows run left-to-right on top and right-to-left below. All ten numbered labels survive at 1024px.

1600×900 PNG: 921,584 bytes. WebP: 136,778 bytes.

## Preservation and gate

The product/scope card grid was deleted; its use cases were preserved as a footnote in the existing model table, whose original headers and rows remain unchanged. The other two images retain their contribution/timing and ten-step relationships. Original prose, legal content, author and evidence hold remain unchanged. All 0 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M16`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
