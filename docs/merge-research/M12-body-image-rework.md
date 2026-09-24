# M12 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### selection-domains.png

DROP the domain cards into HTML. Illustrate the existing mandatory-fit rule with a score scale that cannot open a locked requirement gate.

Verification at 1024px: Scale and blocked device are distinct; two labels remain readable at 1024px.

Replacement: `/blog-media/mvne-provider-selection/mandatory-fit-barrier.png`. Original PNG and WebP deleted.

1600×900 PNG: 752,632 bytes. WebP: 117,452 bytes.

### service-scope.png

DROP service-category cards into HTML. Replace with a linked-record anatomy showing separate network, billing and support domains joined to the same subscription.

Verification at 1024px: Repeated notched tags and braided links show record continuity. Three domain labels are clear.

Replacement: `/blog-media/mvne-provider-selection/linked-service-records.png`. Original PNG and WebP deleted.

1600×900 PNG: 821,738 bytes. WebP: 125,648 bytes.

### acceptance-evidence.png

DROP the acceptance checklist cards into HTML. Illustrate the article's object-level authorization test with one permitted account and a blocked cross-account path.

Verification at 1024px: Allowed and denied paths remain distinct without red or green coding; no real customer data or security guarantee.

Replacement: `/blog-media/mvne-provider-selection/account-authorization-boundary.png`. Original PNG and WebP deleted.

1600×900 PNG: 653,149 bytes. WebP: 85,386 bytes.

## Preservation and gate

All three card images were removed and their wording consolidated into a fourth HTML table. Replacement illustrations explain mandatory fit, linked service records and account-level authorization. All original prose and existing tables remain unchanged. All 0 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M12`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
