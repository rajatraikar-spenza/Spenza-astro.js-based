# Spenza blog images: one style, strict rules for Codex

This file replaces the earlier diagram prompts. Every body image and every hero for every Spenza blog follows
the style below. Attach `style-reference-billing-flow.png` (this folder) to EVERY Codex prompt as the visual
reference and say: "Match the reference image's style exactly."

## What changed and why
The first batch (boxes, arrows, numbered steps, "infographic" cards on white) is retired. Body images are now
painted editorial illustrations, in the manner of the HyperVerge blog and our own billing-flow image: one big
concept told with a few chunky objects on a textured orange scene. No infographics, ever.

**Keep-or-redo rule for every old image on the site:** an image stays ONLY if it already follows this style
(body: coloured background, meaningful objects and connections, grain, glow and depth; hero: the white-frame
line-art style below). Everything else is redesigned, in every blog, category by category. See the inventory
at the end of this file.

## Reuse rule (added 30 Oct 2026)
Images already in this orange style may be reused in other blogs when they genuinely fit the content (same
concept, same labels still true). Before writing a prompt for any new body image, check `IMAGE-LIBRARY.md` in
this folder: if an existing image fits, reuse it (no regeneration); only generate what is missing. Never reuse an
image whose labels or story do not match the article it goes into.

## Colour ramp (applies to every image)
- Orange ramp, light to dark: #FF8E64, #FF6F39, #FF4500 (brand), #C63600 (deepest).
- Use #C63600 for the darkest orange (edges, distant silhouettes). **Never brown: #9B2A00 and anything
  browner or darker than #C63600 is excluded.**
- Neutrals: cream/paper #F3EDE4, charcoal #2B2B2B, grey #6B7280. One small gold accent (#F2B233) at most.

## Fonts
- Text inside BODY images: Bricolage Grotesque only (bold). Never Inter, Arial or a serif.
- HERO titles: Rhodium Libre, set by Claude in the template. Hero illustration panels contain no text.

## STRICT RULES (never break)
1. NO infographics: no flowcharts, no boxes-and-arrows, no numbered step badges, no tables, no matrices, no
   icon-in-a-rounded-square grids, no UI screenshots, no charts. A concept is shown as a SCENE with objects.
2. BODY images: coloured background, full bleed. The whole canvas is orange from the ramp (#FF4500 deepening to
   #C63600 at the edges) with a soft lighter radial glow (#FF8E64) near the upper right, a fine paper-grain
   texture, and visible depth (foreground objects, mid-ground ribbons, background silhouettes). Never a white or
   grey background, never brown (#9B2A00 is excluded), never a second dominant colour.
3. Background layer: a low-contrast silhouette landscape in the darker ramp oranges (#C63600 and #FF6F39): rolling
   hills, a few trees, a distant cell tower and/or small city skyline, thin clouds in #FF8E64. No brown.
4. Objects: 3 to 5 chunky, softly rounded, semi-flat objects with a slight hand-painted, paper-cut texture and a
   soft contact shadow. Surfaces cream/paper (#F3EDE4), bodies charcoal (#2B2B2B), UI lines grey (#6B7280), one
   small warm-gold accent (#F2B233) at most, tiny orange highlights. Slight tilt and depth, never rigid grids.
5. Flow and relationships are shown with broad cream ribbon arrows (soft swooshes, #F3EDE4 at about 85 percent
   opacity), never thin lines with arrowheads.
6. No people, no faces, no hands, no photos, no logos, no carrier or brand marks, no watermark.
7. TEXT: zero to three labels per image, each at most two short words, set in bold charcoal (#1F1F1F)
   Bricolage Grotesque, placed in clear space BELOW or BESIDE an object, never overlapping an
   object or ribbon. Spell every label EXACTLY as written in the prompt. If a prompt lists no labels, draw no
   text at all (not even fake text; use plain grey bars for text lines on paper).
8. Objects must be MEANINGFUL: every object stands for a named part of the topic and every ribbon connects two
   objects that really relate. No decorative filler objects.
8b. Composition: one clear focal object, a clear left-to-right or near-to-far reading order, generous empty
   orange around the edges (at least 6 percent margin), nothing cropped at the edges.
9. Sizes: body images 1600 x 900 PNG (16:9). Hero illustrations 1600 x 1200 PNG (4:3), see the HERO rules.
10. Reuse the visual vocabulary across blogs so the set feels like one family: the same phone, tower, invoice
    paper, coin, server cabinet, signpost, key and contract objects, drawn the same way each time.

## Paste this FIRST for Codex, every time
> Create one illustration in the exact style of the attached reference image: a painterly editorial scene on a
> full-bleed textured orange background (#FF4500 with a soft lighter glow upper right and fine paper grain), a
> faint darker-orange silhouette landscape behind (hills, trees, a cell tower, a skyline, thin clouds), and 3 to
> 5 chunky, softly rounded, paper-cut objects in cream (#F3EDE4), charcoal (#2B2B2B) and grey (#6B7280) with at
> most one small gold (#F2B233) accent, each with a soft contact shadow. Show relationships with broad cream
> swoosh ribbon arrows. It must NOT be an infographic: no flowchart, no boxes, no numbered badges, no tables, no
> icon grids, no thin arrows. No people, no photos, no logos, no watermark. Use only the labels listed below, at
> most two short words each, bold charcoal Bricolage Grotesque, in clear space below or beside objects and never
> overlapping anything, spelled exactly as given. If no labels are listed, include no text at all. Leave a
> margin of empty orange around the edges. Output a PNG at the size given.

## HERO rules (different from body images)
Heroes are NOT the textured orange scene. A hero is a fixed white frame (1280 x 720): Spenza logo top left,
the title in **Rhodium Libre** (uppercase, charcoal; heroes only), the orange "Learn more" pill and the "spenza.com" pill, all
set by Claude in the template. Codex draws ONLY the illustration panel for the right-hand side:
- a rounded-rectangle panel filled with a warm near-white (#FFF4EC), 1600 x 1200 PNG, even inner margin;
- **sparse orange line art** on it: 3 to 6 objects drawn as clean outlines in #FF4500 (stroke about 6 px at this
  size, rounded caps), with at most one small solid fill in #FF8E64 or #FF4500 as an accent, and tiny charcoal
  details if essential. Generous empty space. No grain, no glow, no background landscape, no shadows;
- the same meaningful-object rule as body images and the same object vocabulary (tower, phone, invoice, server,
  key, storefront, SIM), so hero and body feel like one family;
- no text, no logo, no people, no photos, no brown (#9B2A00 is excluded).

### Paste this for HERO illustrations (instead of the body block)
> Create one illustration panel: a rounded rectangle filled with warm near-white (#FFF4EC) containing sparse
> orange line art in #FF4500 (clean outlines about 6 px, rounded caps) of the objects described below, with at
> most one small solid accent fill in #FF8E64. Lots of empty space around and between the objects, even inner
> margin. Flat: no grain, no glow, no gradients, no shadows, no background scenery, no brown. No text of any
> kind, no logos, no people, no photos. Output a PNG at 1600 x 1200.

## QA checklist before anything is uploaded (Claude runs this)
- Body: orange-ramp full bleed with grain, glow and depth? No white or boxed background, no brown, no infographic elements? Hero: warm near-white panel, sparse orange line art, no grain or glow?
- Every label spelled exactly and not overlapping any object?
- Same object vocabulary and finish as the reference and as the other images in the post?
- Nothing cropped, margins present, correct pixel size, no people or logos.
