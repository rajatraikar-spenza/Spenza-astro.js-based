# M18 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### launch-workstreams.png

DROP the three summary cards. The immediately preceding HTML work-package table already lists all seven workstreams and exit artifacts. Add a release-review fork to make the go/no-go decision and return to testing visible.

Verification at 1024px: Four labels are readable; distinct paths show acceptance, revision and retesting. No dates, customer outcomes or automatic launch claim.

Replacement: `/blog-media/launch-mvno-setup/release-review-branches.png`. Original PNG and WebP deleted.

1600×900 PNG: 805,129 bytes. WebP: 121,094 bytes.

## Preservation and gate

Only the generated figure and its caption/alt changed. The existing seven-work-package table already preserves every workstream in the dropped summary cards, so no duplicate table was added. All article prose remains byte-identical. All 2 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M18`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
