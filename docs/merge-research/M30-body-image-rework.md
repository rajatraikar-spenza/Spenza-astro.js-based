# M30 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### iot-components.png

DROP role cards; existing component table preserves the exact responsibilities. Illustrate profile delivery separately from management.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-esim-introduction/profile-delivery-and-management.png`. Original PNG and WebP deleted.

1600×900 PNG: 772,151 bytes. WebP: 110,912 bytes.

### deployment-checks.png

DROP deployment cards; transcribe to a table and illustrate preparation, provisioning and an explicit recovery exercise.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-esim-introduction/deployment-and-recovery-loop.png`. Original PNG and WebP deleted.

1600×900 PNG: 909,251 bytes. WebP: 127,378 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged.  All 1 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M30`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
