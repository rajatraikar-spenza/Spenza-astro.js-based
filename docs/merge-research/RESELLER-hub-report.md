# Reseller & Embedded Connectivity: completed preview run

25 September 2026. Only M11, M15, M20, M26 and M41 were merged. All five are registered as **preview** on `blog-automation`. No push, WordPress edit, redirect, slug or category change. No other hub started. Author-only bylines; **information gain remains 7 on every cluster**.

## Result

| Cluster | Destination | Posts consolidated | Before body words | After body words | After with TL;DR | Gate | Reused / generated images | Resolved author | Flipped? | Cluster commit |
|---|---|---:|---:|---:|---:|---|---|---|---|---|
| M11 | /telecom/white-label-telecom-reseller-guide/ | 4 to 1 | 6,830 | 2,154 | 2,289 | PASS | 1 / 2 | SivaSai / sivasai | No | e74d85c |
| M15 | /mvno/resell-data-plans-shopify/ | 2 to 1 | 4,919 | 2,217 | 2,350 | PASS | 1 / 1 | SivaSai / sivasai | No | fd61cbc |
| M20 | /telecom/telecom-msp-white-label-solutions-2025/ | 2 to 1 | 4,668 | 2,176 | 2,304 | PASS | 1 / 1 | Spenza / isimplexity | No; destination wins tie | 8164487 |
| M26 | /telecom/mobile-esim-plans/ | 2 to 1 | 2,543 | 2,173 | 2,306 | PASS | 1 / 1 | Vinaychandra Bharadwaj / vinay | No | 81534fb |
| M41 | /esim/esim-vs-physical-sim-airport-decision/ | 2 to 1 | 3,700 | 2,152 | 2,298 | PASS | 1 / 1 | SivaSai / sivasai | No | b8ae4ef |

Before counts sum the live destination and donor article bodies, including their in-body navigation, excluding the page shell, related cards and separate ACF TL;DR. After body counts use the rendered reading-text parser, excluding CSS. The separate TL;DR-inclusive column is the editorial length check. Twelve source posts (five destinations plus seven donors) become five previews; all live posts remain in place.

Five published heroes are reused by their existing media URL and live srcset. Six new body illustrations have optimized PNG/WebP twins and were visually inspected. No published media was copied into the repository; no new hero was needed. M11 has two body illustrations; the four spokes each have one. Image counts follow editorial usefulness, not a quota. The obsolete gate's three-figure floor was replaced by figure-image/alt validation to implement this instruction; every other gate condition remains in place.

M11 links to all four top spokes. Each spoke links to the pillar in its introduction. M26 follows the plan's actual connectivity-loyalty intent while retaining the `mobile-esim-plans` URL. M41 keeps traveller intent and uses the brief's small optional business CTA rather than forcing three sales interruptions.

## Six phases and review artifacts

For each ID:

- `ID-source-audit.json`: complete live destination/donor body blocks, headings, links, images, source schema and ACF records.
- `ID-research-and-outline.md`: Merge Map, observed search research, citation continuity, gap table, information gain, semantic map, fan-out questions, metadata and outline.
- `ID-image-inventory.json` and `ID-image-prompts.md`: every source candidate, keep/reject reasons, image briefs and exact prompts.
- `ID-final-metadata.json` and `ID-final-outline.json`: final measured Output A and implemented Output C, including alternatives, snippet text, image purposes and section/link allocations. These supersede draft metadata counts.
- Preview HTML and `index.ts`: Output D, merged TL;DR, resolved author and retained destination/category.
- `ID-link-plan.md`: Output E, internal/external links, inbound plan and proposed future donor mapping. `RESELLER-inbound-links.json` lists 250 matching donor anchors in the current built snapshot, including archive and related-card links. No inbound links changed.
- `ID-phase-6-report.md`: Output F schema delta only and full Output G scorecard.
- `ID-content-qa.json`, `ID-link-check.json`, `ID-browser-qa.json`: measured content, live link responses and interactive preview checks.

Search was available. Search volumes, controlled Google positions, complete PAA, featured-snippet ownership and AI Overview citations were not measured; no values or citations were invented. URL-level AI signals in the merge plan informed preservation of useful donor definitions/checklists, not claims that a particular passage was cited.

## Evidence handoff

[RESELLER-evidence-requests.md](RESELLER-evidence-requests.md) is the single team list. Twelve source requests are consolidated into six asks:

| Owner group | Request | Clusters |
|---|---|---|
| Finance, partnerships, channel account owner and channel operations | Scoped commercial pack: rate/commitment/cost/settlement terms; MSP invoice reconciliation; loyalty funding and expiry; travel refund economics | All five |
| Product delivery, commerce/travel integration engineering and support operations | Redacted order-to-usable-service walkthrough, failures/refunds and owners; Shopify duplicate/renewal handling | M11, M15, M41 |
| Platform engineering and support operations | MSP tenant isolation, delegated roles, incident ownership and offboarding proof | M20 |
| IMZ account owner and customer marketing | Approved scope, cohort, dated milestones and publication permission | M15 |
| Loyalty analytics and account owner | Cohort, exposure, claim/use records, dates and comparison method or limitations | M26 |
| Product engineering and privacy owner | Loyalty redemption walkthrough and event/data-purpose map | M26 |

The approved RocketPhone, Daito, Butlr and Angel Watch cases were checked before raising these requests. No separate reviewer is requested or asserted. Requests remain in research, never in reader-facing article prose. Removing a request from prose does not increase information gain.

## Verification

- Each cluster: `npm run merge:qa -- ID` PASS; `npx astro check` **0 errors, 0 warnings**, 72 existing hints; committed before moving to the next cluster.
- Hub: `npm run merge:qa -- --hub "Reseller & Embedded Connectivity"` **5/5 PASS**.
- All registered previews: `npm run merge:qa` **36/36 PASS**.
- `MEDIA_ORIGIN=https://media.spenza.com NOINDEX=1 npm run build`: **success, 944 pages**, Astro **0 errors, 0 warnings**, 72 existing hints. Existing route-conflict warning for the telecom expense pricing route; expected NOINDEX warning for preview build.
- `npm run wp:verify-dist -- https://media.spenza.com`: **0 missing assets, 0 stranded local media**.
- Browser: all five previews have five populated TL;DR cards/icons, six click/keyboard-expandable FAQs, loaded body WebPs, working TOC anchors, responsive tables and no horizontal page overflow at 390px. Author/update/breadcrumb/related elements render. Preview pages are noindex/nofollow with no canonical, no extra schema graph and no unresolved slots.
- Every article source/internal URL returned HTTP 200. Every H2 answer is 40–60 words; FAQ answers are 40–70; final recommended/alternate titles and descriptions meet measured character limits. Zero em/en dashes and no reader-facing evidence/review blocks.
- CSS optimisation ran after markup work; unrelated baseline regenerated mirror bundles were excluded.
- Built-site audits used the existing preview server at `http://127.0.0.1:4333`. Asset audit: **0 broken references across 487 indexed pages**. Link audit: **633 unique links checked, one pre-existing malformed link** described below. The scripts exit zero even when reporting broken links; the result is not labelled clean.
- `git diff --check` passes.

### Pre-existing link audit exception

`src/partials/posts/msp-reselling-connectivity-with-hardware.html:731` contains `/mvno/resell-data-plans-shopify/]`, which resolves as `/mvno/resell-data-plans-shopify/]/` and returns 404. The identical malformed href exists in pre-run commit `45d9232`. `docs/site-issues.md` was checked before recording this finding. The source post is outside these five clusters and was not changed. This does not affect the five new previews, whose links all returned HTTP 200.

All publishing actions remain deferred: apply approved redirects, update the inventoried inbound links, remove retired URLs from sitemaps, request indexing/IndexNow and measure destination performance after publication. None was performed in this run.
