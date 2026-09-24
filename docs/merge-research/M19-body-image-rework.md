# M19 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### funding-models.png

DROP. Existing funding-model HTML table preserves the three card descriptions; replace the cards with visible alternative funding paths.

Verification at 1024px: Inspected at 1024px: readable labels, distinct objects, visible relationships and orange depth.

Replacement: `/blog-media/mvno-trends/funding-flows.png`. Original PNG and WebP deleted.

1600×900 PNG: 833,167 bytes. WebP: 105,296 bytes.

### trend-evidence.png

DROP. Transcribe the three evidence layers into the consolidated table; replace cards with source-to-hypothesis-to-test objects.

Verification at 1024px: Inspected at 1024px: readable labels, distinct objects, visible relationships and orange depth.

Replacement: `/blog-media/mvno-trends/observation-to-pilot.png`. Original PNG and WebP deleted.

1600×900 PNG: 782,637 bytes. WebP: 117,240 bytes.

### rocketphone-product-scope.png

DROP. Transcribe the three published capability descriptions into the consolidated table; replace cards with a conceptual calling path and separate administrative control.

Verification at 1024px: Inspected at 1024px: readable labels, distinct objects, visible relationships and orange depth.

Replacement: `/blog-media/mvno-trends/enterprise-call-and-control.png`. Original PNG and WebP deleted.

1600×900 PNG: 666,240 bytes. WebP: 65,714 bytes.

## Preservation and gate

Dropped all three text-card images. The existing funding table preserves their funding content; the fourth table preserves the evidence and published-capability cards. Only new table and figure metadata change; article prose remains unchanged. All 0 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M19`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
