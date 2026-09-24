# M03 body-image rework

24 September 2026. Four-stop orange palette: #C63600, #FF4500, #FF6F39, #FF8E64. No brown endpoint. Scope: generated body images only.

## Inventory and decisions

### billing-functions.png

DROP the three standalone function cards. Their information becomes an HTML table. Add an invoice anatomy illustration: two inputs converge on one bill, while payment remains a separate linked record.

Verification at 1024px: Usage and tariff inputs converge clearly; invoice and payment are separate. Four Inter Bold labels remain readable after optimization.

Replacement: `/blog-media/mvno-billing/invoice-record-anatomy.png`. Original PNG and WebP deleted.

1600×900 PNG: 864,479 bytes. WebP: 130,544 bytes.

### rocketphone-billing-scope.png

DROP the three capability cards. The existing vendor table and published-case paragraphs already preserve their scope. Illustrate the article's generic payer, delegated administrator and user relationships instead, with no RocketPhone scale or architecture claim.

Verification at 1024px: The wallet identifies the payer; separate connections reach administrator and users. Three Inter Bold labels remain readable.

Replacement: `/blog-media/mvno-billing/payer-administrator-users.png`. Original PNG and WebP deleted.

1600×900 PNG: 891,272 bytes. WebP: 92,874 bytes.

## Preservation and gate

Both old card illustrations were deleted. Charging, billing and payment definitions were transcribed into a fourth HTML table; RocketPhone scope remains in the existing vendor table and case paragraphs. New invoice anatomy and account-role illustrations supplement those facts without claiming customer metrics. All original paragraphs, headings, lists and tables remain unchanged; only figures and the replacement table changed. All 1 published body figures retain their exact markup and srcset. Every protected hero/other local asset retains its original SHA-256. Information gain stays 7. `npm run merge:qa -- M03`: PASS.

Full-frame grain can exceed the old PNG size heuristic; 256-colour quantization is applied and WebP is served through the existing picture element. Both formats were inspected for crop, legibility and banding.

Labels were set separately in Figma (file QYBV0dwgiLrqR4PP6RpgP6, frames 58:2 and 58:7), using Inter Bold at 42px. Browser verification: both WebPs resolve at 1600x900; the 390px viewport has no document overflow and all four tables scroll internally. Existing prose and original tables were compared verbatim.
