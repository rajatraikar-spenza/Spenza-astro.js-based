# M23 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### acquisition-activation.png

DROP summary cards; existing metrics HTML table already defines acquisition, activation and retention. New image shows the recovery branch.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/mvno-marketing/activation-and-recovery-path.png`. Original PNG and WebP deleted.

1600×900 PNG: 837,374 bytes. WebP: 81,096 bytes.

### cohort-decisions.png

DROP decision cards; existing metrics table already defines acquisition cost, contribution and cohort retention. New image shows alignment at a common cohort age.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/mvno-marketing/equal-age-cohort-comparison.png`. Original PNG and WebP deleted.

1600×900 PNG: 840,955 bytes. WebP: 103,236 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged. No duplicate table: the existing metrics table preserves all six card concepts. All 1 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M23`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
