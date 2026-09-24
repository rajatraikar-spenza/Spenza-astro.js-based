# M29 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### control-boundaries.png

DROP comparison boxes; the existing layer-responsibility table preserves all CMP and device-management scope. Illustrate distinct subsystem controls.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/cmp-guide/subscription-and-firmware-controls.png`. Original PNG and WebP deleted.

1600×900 PNG: 752,615 bytes. WebP: 113,086 bytes.

### request-verification.png

DROP verification boxes; transcribe to a table and illustrate final-state evidence followed by service validation.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/cmp-guide/provider-state-and-service-validation.png`. Original PNG and WebP deleted.

1600×900 PNG: 891,632 bytes. WebP: 91,588 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged.  All 1 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M29`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
