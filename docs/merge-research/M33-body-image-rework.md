# M33 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### three-decisions.png

DROP decision cards; transcribe their definitions into the consolidated table and illustrate independent inputs.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/esim-vs-physical-sim/independent-sim-decisions.png`. Original PNG and WebP deleted.

1600×900 PNG: 695,097 bytes. WebP: 93,496 bytes.

### deployment-choice.png

DROP deployment cards; existing deployment-condition and business-task tables preserve the comparison. Illustrate physical and remote intervention paths.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/esim-vs-physical-sim/physical-and-remote-service-paths.png`. Original PNG and WebP deleted.

1600×900 PNG: 795,975 bytes. WebP: 131,450 bytes.

### lifecycle-cost.png

DROP cost cards; transcribe the three lifecycle scopes into the consolidated table and illustrate costs accumulating across the journey.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/esim-vs-physical-sim/whole-lifecycle-costs.png`. Original PNG and WebP deleted.

1600×900 PNG: 754,944 bytes. WebP: 131,378 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged. Generated lettering and label placeholders were removed before Figma typography. All 0 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M33`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
