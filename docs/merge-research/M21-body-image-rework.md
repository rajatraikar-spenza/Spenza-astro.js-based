# M21 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### service-boundary.png

DROP buying-decision cards; transcribe into table and show separable service contributions.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/mvne-explained/separable-service-contributions.png`. Original PNG and WebP deleted.

1600×900 PNG: 657,872 bytes. WebP: 79,190 bytes.

### activation-handoff.png

DROP incident cards; transcribe into table and show record continuity and recovery loop.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/mvne-explained/incident-context-loop.png`. Original PNG and WebP deleted.

1600×900 PNG: 893,257 bytes. WebP: 129,642 bytes.

### rocketphone-enablement.png

DROP capability cards; transcribe into table and show nested account administration.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/mvne-explained/reseller-account-hierarchy.png`. Original PNG and WebP deleted.

1600×900 PNG: 863,673 bytes. WebP: 94,084 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged. The service-boundary first draft was rejected for a brown foreground; the accepted art uses a bright orange field. All 0 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M21`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
