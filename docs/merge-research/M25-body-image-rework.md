# M25 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### allowance-boundaries.png

DROP the two allowance text boxes; the existing plan-structure table preserves the distinction. Illustrate separate versus shared containment.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-cost/separate-and-pooled-allowances.png`. Original PNG and WebP deleted.

1600×900 PNG: 810,775 bytes. WebP: 108,426 bytes.

### invoice-record.png

DROP the four invoice text boxes; transcribe into a table and illustrate the audit thread and exception loop.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-cost/invoice-audit-thread.png`. Original PNG and WebP deleted.

1600×900 PNG: 842,822 bytes. WebP: 97,508 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged.  All 1 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M25`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
