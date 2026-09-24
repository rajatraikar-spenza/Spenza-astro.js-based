# M27 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### stable-identity.png

DROP identity cards; existing record table preserves their meanings. Illustrate enduring identity and detachable resources.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/subscriber-management/identity-and-resource-assignments.png`. Original PNG and WebP deleted.

1600×900 PNG: 819,515 bytes. WebP: 92,340 bytes.

### operation-confirmation.png

DROP operation-state cards; transcribe into a table and illustrate acknowledgement, outcome evidence and reconciliation.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/subscriber-management/operation-outcome-reconciliation.png`. Original PNG and WebP deleted.

1600×900 PNG: 773,712 bytes. WebP: 99,908 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged.  All 1 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M27`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
