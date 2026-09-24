# M34 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### identity-routing.png

DROP comparison boxes; the existing mechanism and country-record tables preserve identity and routing details. Illustrate identity staying local while traffic may cross a boundary.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/global-iot/identity-versus-data-route.png`. Original PNG and WebP deleted.

1600×900 PNG: 622,421 bytes. WebP: 74,670 bytes.

### country-record.png

DROP record boxes; the existing dated-record table preserves every field. Illustrate records tied to deployments and change-triggered review.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/global-iot/deployment-record-review.png`. Original PNG and WebP deleted.

1600×900 PNG: 887,581 bytes. WebP: 92,840 bytes.

### recovery-evidence.png

DROP recovery boxes; transcribe the four checks into a table and illustrate the alternate path, common dependency and message inspection.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/global-iot/alternate-path-and-application-proof.png`. Original PNG and WebP deleted.

1600×900 PNG: 947,430 bytes. WebP: 170,964 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged. The routing draft's generated promotional text was removed before typography. All 0 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M34`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
