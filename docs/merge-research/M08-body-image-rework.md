# M08 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### enablement-and-aggregation.png

DROP the static two-column comparison; the existing role table already preserves both definitions. Replace with meshing functional objects to show that one supplier can combine both roles.

Verification at 1024px: Equal gears give neither role a false preference; two Figma-set acronyms are readable, objects show operations and wholesale access.

Replacement: `/blog-media/operator-roles/combined-supplier-functions.png`. Original PNG and WebP deleted.

1600×900 PNG: 853,900 bytes. WebP: 128,806 bytes.

### rocketphone-role-evidence.png

DROP the three independent capability cards into an HTML table. Illustrate the voice-to-application relationship described in the case without inventing a customer topology or scale.

Verification at 1024px: The voice path is visible before reading; all three labels are readable. No customer metrics or architectural implementation claim.

Replacement: `/blog-media/operator-roles/cellular-voice-application-path.png`. Original PNG and WebP deleted.

1600×900 PNG: 851,905 bytes. WebP: 106,070 bytes.

## Preservation and gate

The old comparison and capability cards were dropped. The existing role table retains the MVNE/MVNA definitions; a fourth table preserves the RocketPhone capabilities. Replacement illustrations show combined supplier functions and a conceptual cellular voice/application path. Existing prose and tables are unchanged. All 1 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M08`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
