# M44 body-image rework

25 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### meeting-brief.png

DROP four meeting-brief cards and preserve their contents in a fourth HTML table. The new illustration shows project inputs converging into a brief and reaching an accountable next test.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-mvno-events/decision-brief-to-owned-test.png`. Original PNG and WebP deleted.

1600×900 PNG: 762,859 bytes. WebP: 116,846 bytes.

### attendance-budget.png

DROP two budget cards. The existing budget table already covers pass, travel, accommodation, local logistics and staff preparation, attendance and follow-up. The new illustration groups spending and capacity within one commitment.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-mvno-events/full-attendance-commitment.png`. Original PNG and WebP deleted.

1600×900 PNG: 680,361 bytes. WebP: 103,544 bytes.

### follow-through.png

DROP four follow-through cards and preserve their contents in the same fourth HTML table. The new illustration shows verification, testing, an unresolved-question loop and a decision fork.

Verification at 1024px: Inspected at 1024px: labels readable, orange field, visible object relationships and depth.

Replacement: `/blog-media/iot-mvno-events/event-notes-to-tested-decision.png`. Original PNG and WebP deleted.

1600×900 PNG: 710,597 bytes. WebP: 93,048 bytes.

## Preservation and gate

Only replacement tables and figure metadata change. Original prose, existing tables and published images are unchanged.  All 0 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M44`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
