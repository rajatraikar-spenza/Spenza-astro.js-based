# M04 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### pilot-evidence.png

DROP the three text cards; their lab, field and operating-control information is transcribed into a table. New cutaway shows sensor links converging on a gateway and depending on a separate upstream connection.

Verification at 1024px: The three labels are spelled correctly and legible; sensor links, gateway and upstream path remain distinct. Rejected the first brown building/ground treatment and corrected it to cool neutrals and bright orange.

Replacement: `/blog-media/iot-connectivity-types/local-link-backhaul-cutaway.png`. Original PNG and WebP deleted.

1600×900 PNG: 699,536 bytes. WebP: 103,940 bytes.

## Preservation and gate

The three acceptance cards became one HTML table. A new local-link/backhaul cutaway sits beside the existing backhaul definition. Original prose and all three existing tables remain unchanged. All 2 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M04`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.

Browser check: new WebP resolves at 1600x900, all three body images load, four tables scroll internally, and the 390px viewport has no page overflow.
