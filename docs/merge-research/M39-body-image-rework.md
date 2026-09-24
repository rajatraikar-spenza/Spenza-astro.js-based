# M39 body-image rework

25 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### evidence-levels.png

DROP two evidence cards and transcribe their contents into an HTML table. The replacement shows inspection between documentation and collected fleet evidence.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-cmp-comparison/documentation-to-fleet-evidence.png`. Original PNG and WebP deleted.

1600×900 PNG: 756,806 bytes. WebP: 141,624 bytes.

### api-acceptance.png

DROP four API checklist cards and transcribe their contents into the same table. The replacement separates acknowledgment, observed state and reconciliation paths with a retry loop.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-cmp-comparison/request-state-and-reconciliation.png`. Original PNG and WebP deleted.

1600×900 PNG: 956,127 bytes. WebP: 121,832 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged.  All 1 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M39`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
