# M36 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### sku-boundaries.png

DROP three text cards. The existing design table preserves the constraints; independent gates illustrate why remote profiles do not remove every SKU limit.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/oem-esim/product-constraint-gates.png`. Original PNG and WebP deleted.

1600×900 PNG: 727,433 bytes. WebP: 115,354 bytes.

### provisioning-owners.png

DROP three owner cards. The existing responsibility table preserves the handoffs; the new illustration follows a tagged order across those owners.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/oem-esim/provisioning-responsibility-handoffs.png`. Original PNG and WebP deleted.

1600×900 PNG: 803,776 bytes. WebP: 119,128 bytes.

### commercial-states.png

DROP three commercial-state cards and transcribe their definitions into an HTML table. The new illustration shows the checks separating the states.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/oem-esim/hardware-to-paying-service.png`. Original PNG and WebP deleted.

1600×900 PNG: 890,292 bytes. WebP: 97,914 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged.  All 0 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M36`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
