# M14 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### distribution-models.png

DROP model cards duplicated by the existing distribution table. Draw the fork between remote profile fulfilment and physical delivery.

Verification at 1024px: Digital stream and delivery road branch from one checkout and reach distinct device endpoints; three labels are clear.

Replacement: `/blog-media/esim-only-mvno/digital-physical-fulfilment.png`. Original PNG and WebP deleted.

1600×900 PNG: 801,640 bytes. WebP: 139,530 bytes.

### activation-checkpoints.png

DROP checkpoint cards into an HTML table. Show device examination, profile installation and usable network service as distinct connected stages.

Verification at 1024px: Three phone states and arrows are readable; Figma labels preserve Eligible, Installed and Working.

Replacement: `/blog-media/esim-only-mvno/eligibility-to-working-service.png`. Original PNG and WebP deleted.

1600×900 PNG: 854,639 bytes. WebP: 111,806 bytes.

### unit-economics.png

DROP the revenue/cost cards; the existing operating-definitions table and contribution paragraph preserve the information. Show cost branches draining collected revenue before the contribution remainder.

Verification at 1024px: Deductions and remainder are visible; no values, percentages or scale claims. Caption explicitly prevents a net-profit or measured-share reading.

Replacement: `/blog-media/esim-only-mvno/revenue-cost-deductions.png`. Original PNG and WebP deleted.

1600×900 PNG: 739,501 bytes. WebP: 123,792 bytes.

## Preservation and gate

All three text-card images were removed. Existing distribution and economics tables retain those definitions; the three activation checkpoints became a fourth HTML table. New illustrations show fulfilment branches, activation progression and qualitative cost deductions. Original prose and tables are unchanged. All 0 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M14`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.
