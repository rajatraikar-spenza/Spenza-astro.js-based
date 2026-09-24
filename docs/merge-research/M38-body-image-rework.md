# M38 body-image rework

25 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### service-acceptance.png

DROP four acceptance cards; their checks move to an HTML table. The replacement traces a message from an installed meter to a maintenance response.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/smart-city-connectivity/municipal-service-response-loop.png`. Original PNG and WebP deleted.

1600×900 PNG: 805,967 bytes. WebP: 134,602 bytes.

### control-boundaries.png

DROP two responsibility cards; their contents move to the same HTML table. A streetlight cutaway shows distinct subscription, firmware and application control paths.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/smart-city-connectivity/municipal-control-cutaway.png`. Original PNG and WebP deleted.

1600×900 PNG: 784,094 bytes. WebP: 170,264 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged.  All 1 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M38`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
