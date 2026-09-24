# M32 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### fleet-lifecycle.png

DROP lifecycle boxes; transcribe four stages into a table and show the same device across its lifecycle.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-mvno/factory-to-retirement.png`. Original PNG and WebP deleted.

1600×900 PNG: 825,007 bytes. WebP: 135,728 bytes.

### contribution-costs.png

DROP cost boxes; existing pricing-input table preserves every cost category. Illustrate deductions and residual contribution.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-mvno/revenue-and-service-deductions.png`. Original PNG and WebP deleted.

1600×900 PNG: 935,320 bytes. WebP: 109,472 bytes.

### offer-acceptance.png

DROP acceptance boxes; transcribe four stages into the same table and show correlated evidence across the workflow.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-mvno/cohort-acceptance-thread.png`. Original PNG and WebP deleted.

1600×900 PNG: 830,844 bytes. WebP: 117,522 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged.  All 0 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M32`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
