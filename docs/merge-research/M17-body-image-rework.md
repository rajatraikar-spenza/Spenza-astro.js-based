# M17 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### energy-record.png

DROP the four reporting-category cards into HTML. Replace with a circular device reporting cycle that visibly returns through sleep and includes retries.

Verification at 1024px: Four stages and clockwise direction checked; labels clear. No durations, energy proportions or radio ranking.

Replacement: `/blog-media/cellular-iot-radio/reporting-energy-cycle.png`. Original PNG and WebP deleted.

1600×900 PNG: 758,859 bytes. WebP: 123,810 bytes.

### mobility-record.png

DROP the two record lists into HTML. Show the moving device in overlapping radio areas while separate magnifiers inspect radio and application evidence.

Verification at 1024px: Two evidence domains remain visible and labelled. Conceptual cells and path, not coverage measurements or a promise about a radio standard.

Replacement: `/blog-media/cellular-iot-radio/mobility-observation-path.png`. Original PNG and WebP deleted.

1600×900 PNG: 675,682 bytes. WebP: 126,262 bytes.

## Preservation and gate

Both text-card figures were deleted and their record categories transcribed into a fourth HTML table. Replacement illustrations show a reporting cycle and separate radio/application observations during a proposed mobility test. Existing technical prose and source links remain unchanged. All 1 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M17`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
