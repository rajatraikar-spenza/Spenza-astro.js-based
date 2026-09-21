# Spenza blog image system

How to produce images for a Spenza blog post so they look like they belong to
the site rather than to whichever tool generated them.

Use this whenever a post needs a new image: a merged article that has to replace
its donors' visuals, a rewritten post, or a new article from the content plan.

---

## 1. Why this document exists

The content audit found the blog's images were its weakest visual layer, and the
merge programme makes that worse before it makes it better. A single cluster —
the five US MVNO launch posts — carried **thirteen body images between them**:
unbranded stock photography, three near-identical "visual selection" diagrams
produced by a mind-map tool, and screenshots at three different widths. Merging
five posts into one does not mean picking the best four of thirteen. It means
deciding what four pictures the surviving article actually needs, and making
those four match.

An image earns its place by carrying information the prose cannot carry as
quickly: a comparison, a sequence, a hierarchy, a shape. A photograph of a
person holding a phone carries nothing. If you cannot say in one sentence what a
reader learns from an image, the post is better without it.

---

## 2. Brand tokens

These are read from the live site, not invented. Use them exactly.

| Token | Value | Use |
| :---- | :---- | :-- |
| Primary orange | `#FF4500` | Accent, highlights, the "good" side of a comparison, active nodes |
| Deep orange | `#E03D00` | Hover/darker accent, gradient end |
| Light orange | `#FF6E24` | Gradient mid, secondary accent |
| Ink | `#1A1A2E` | Headings inside images, dark panels |
| Heading grey | `#3A3A3A` | Secondary headings |
| Body grey | `#4E545D` | Body text inside images |
| Warm cream | `#FDF5F2` | Image background (preferred over pure white) |
| Card white | `#FFFFFF` | Cards sitting on cream |
| Divider | `#D9D9D9` | Hairlines, table rules |

**Rule: one accent.** Orange is the only accent colour. If a diagram needs a
second signal — "slow" versus "fast", "risk" versus "mitigation" — use a muted
red-grey and a muted green that read as *states*, not as brand colours, and keep
them desaturated so orange stays the loudest thing in the frame. The article
tables already do this (`#B42318` risk, `#1A7F37` mitigation); match them.

**Typography.** The blog sets everything in **Proxima Nova** — H1 at 700 weight,
H2 at 32px, body at 15px `#4E545D`. Generative tools do not have Proxima Nova.
Substitute **Montserrat**, **Inter** or **Poppins**, which sit in the same
geometric-sans family and will not look foreign next to the real type. Never use
a serif, a condensed face, or a rounded/"friendly" face.

**The TL;DR band** at the top of every post is a peach-to-orange gradient with
white cards on top. That is the site's most recognisable visual signature —
echo it in hero images, do not fight it.

---

## 3. Specifications

| Property | Value |
| :------- | :---- |
| Body image | **1600 × 900** (16:9). WordPress renders it down to 1024×576, 768×432, 300×169. |
| Featured / OG image | **1280 × 720** (16:9). This is what the existing `Blog-Thumbnails.png` is. |
| Format | PNG for diagrams and anything with text. JPEG only for photography, which you should rarely be using. |
| Colour space | sRGB |
| Text size floor | Nothing smaller than **24px at 1600px wide**. The image is displayed at 1024px and read on phones at ~360px. |
| Max words in an image | About **40**. Past that it is a table, and the article should use a real HTML table — they are already styled, searchable and responsive. |

**16:9 is the house aspect ratio.** 854 images on the site are 1024×576 and 872
are 768×432 — both 16:9. A 3:2 or 4:3 image will letterbox oddly against its
neighbours. Do not deviate.

---

## 4. The two-stage workflow

Generative image tools reliably garble dense text. Chasing a clean ten-label
diagram through regeneration is slower than the alternative and usually ends
with a typo shipping.

**Stage 1 — generate the frame.** Use ChatGPT / DALL·E, Midjourney or similar to
produce the *composition*: the layout, the shapes, the icons, the colour
blocking. Ask for placeholder or minimal text.

**Stage 2 — set the type.** Drop the frame into Figma or Canva and set every
label in Montserrat/Inter at the real sizes. Export at 1600×900.

For image types **A, B and C** below (comparison, process, hierarchy) stage 2 is
mandatory — they are label-dense. For type **D** and **E** (evidence cards,
concept hero) a single generation pass is often enough.

If you have no design tool available, prefer an image with **three words in it**
over an image with thirty. A clean shape with the explanation in the caption
beats a cluttered one with the explanation baked in at the wrong kerning.

---

## 5. Prompt construction

Every prompt is **style preamble + composition brief**. The preamble never
changes; only the brief does.

### Style preamble — paste this first, every time

> Create a clean, modern B2B SaaS infographic for a telecommunications platform
> brand. Flat vector illustration style. Palette: warm cream background
> `#FDF5F2`, white cards with soft shadows, deep ink `#1A1A2E` for headings, grey
> `#4E545D` for body text, and a single accent of vivid orange `#FF4500` used
> sparingly for emphasis. Geometric sans-serif typography (Montserrat or Inter).
> Generous whitespace, strong alignment to an invisible grid, everything level
> and symmetrical. No photorealism, no 3D renders, no drop-shadowed bevels, no
> gradient meshes, no stock-photo people, no clip-art, no emoji. 1600×900
> pixels, 16:9. Any text must be large, minimal and correctly spelled.

### Composition brief — the part you write

State, in this order:

1. **The shape** — "a horizontal ascending staircase of six steps", "two panels
   side by side divided by a vertical rule", "a snaking timeline of ten circular
   nodes across two rows".
2. **What sits at each position**, with the exact label text in quotes.
3. **How colour encodes meaning** — "steps 1–3 tinted orange, 4–6 tinted ink".
4. **What must not appear** — the specific failure you are guarding against.

Vague briefs produce decorative images. The shape is the information.

---

## 6. The five image types

Nearly every blog image on this site should be one of these. If your idea is not
on the list, it is probably decoration.

### A. Comparison — two or three options against each other

Use for: build vs. buy, model vs. model, before vs. after, us vs. them.

> **Shape:** Two panels side by side, equal width, separated by a thin vertical
> divider. Left panel tinted muted grey-red and titled "{LOSING OPTION}". Right
> panel tinted warm orange `#FF4500` at low opacity and titled "{WINNING
> OPTION}". Inside each panel: one large headline figure, one supporting figure,
> and a row of three small line-art icons. No table gridlines — this is panels,
> not a spreadsheet.

Guard against: making it look like an HTML table. If it needs more than four
rows of comparison, use the article's real `.responsive-table` instead.

### B. Process or timeline — an ordered sequence

Use for: launch steps, migration phases, an activation flow.

> **Shape:** A horizontal timeline of {N} numbered circular nodes connected by a
> thin line with small directional arrows, snaking onto a second row if {N} > 6.
> Each node carries its number large inside the circle and a two-or-three-word
> label beneath it. First half of the nodes in deep ink `#1A1A2E`, second half in
> orange `#FF4500`, showing progression. Even spacing, nodes all identical size.

Guard against: uneven node spacing and nodes of drifting size — the most common
way a generated timeline looks amateur.

### C. Hierarchy or ladder — levels of something

Use for: model tiers, maturity levels, control-versus-cost tradeoffs.

> **Shape:** An ascending staircase of {N} steps rising left to right, each step
> a flat rectangular block. Label each step with its name. Beneath the whole
> staircase, two long horizontal arrows pointing right, labelled "{AXIS ONE}" and
> "{AXIS TWO}". Lower steps orange, upper steps deep ink, with a clean gradation
> between.

Guard against: perspective. Keep it flat and face-on — an isometric staircase
reads as a stock illustration.

### D. Evidence strip — customer proof

Use for: case-study rows, logos-with-outcomes, three-up results.

> **Shape:** Three equal white cards side by side on a cream background, each
> with a simple line-art icon at top, a bold short headline beneath it, and one
> metric line. A thin orange rule above each headline. Cards identical height,
> evenly gapped, generous internal padding.

Guard against: inventing customer logos or metrics. Only use outcomes that
already appear in the article text.

### E. Concept hero — the featured image

Use for: the post's featured/OG image at 1280×720.

> **Shape:** Left two-thirds carries the post title in large deep-ink geometric
> sans, with a short orange sub-line beneath. Right third carries a flat vector
> composition of {2–3 CONCRETE OBJECTS}. Cream background, wide margins, nothing
> touching the edges. Composition balanced, title left-aligned and vertically
> centred.

Guard against: putting the full headline in. Shorten it — a featured image is
read at thumbnail size in the related-posts grid.

---

## 7. What the site already got wrong

Learn from these; they are all present in the current blog.

- **Interchangeable stock photography.** Hands on laptops, generic city skylines,
  people in headsets. Carries no information and dates instantly.
- **Mind-map "visual selection" exports.** Three of the five US MVNO launch posts
  shipped one. Off-brand colours, tiny text, arbitrary branching.
- **The same image in several posts.** Fine for a related-posts thumbnail,
  actively confusing inside body copy.
- **Screenshots at inconsistent widths** pasted straight from a dashboard, with
  browser chrome and personal data still visible.
- **Text baked in at 12px.** Unreadable at 1024px wide, invisible on a phone.
- **AI images with garbled labels.** "Comptiance", "MVNQ". Ship one and it
  undermines every claim in the article.

---

## 8. Alt text

Every image needs alt text, and the merge programme is a chance to fix a lot of
missing ones at once.

- Describe **what the image tells the reader**, not what it depicts. Not "a chart
  with orange bars" but "MVNE launches cost $10K–$400K in year one against $5M+
  for a traditional build".
- Under ~125 characters.
- Do not start with "Image of" or "Graphic showing".
- Do not keyword-stuff. Yoast will not reward it and screen-reader users are the
  actual audience.
- A purely decorative image should have `alt=""` — but per §1, it should
  probably not be in the article at all.

---

## 9. Getting the file onto the site

Images belong to WordPress, because WordPress owns blog post content. The static
site reads them from `media.spenza.com`.

**While a merge is still a preview**, images live in this repo at
`public/blog-media/<cluster>/` and are referenced with root-relative paths. That
directory is not one of the `MEDIA_TREES` the build drops when `MEDIA_ORIGIN` is
set, so previews keep their images in a real build. It is staging, not a
destination — on publish the files move to the WordPress media library and the
article's `src` attributes become `/wp-content/uploads/...` like every other
post. Delete the staging copies once that is done.

1. **Name the file** descriptively and in kebab-case, with no date prefix and no
   generator artefacts. `mvno-model-ladder-2026.png`, never
   `ChatGPT-Image-Sep-3-2026-04_29_14-PM.png`. The blog is full of the latter;
   do not add to it.
2. **Upload to the WordPress media library** and place it in the post.
3. **Sync it to the bucket** — new posts publish new images, they are not in S3,
   and *the build will not warn you*:
   ```
   npm run wp:blog-media-sync
   aws s3 sync … --size-only
   npm run build
   ```
   `wp:blog-media-sync` also fetches each new image's WebP twin and rewrites the
   manifest from the bucket.
4. **Verify** with `npm run wp:verify-dist`. It is the only check that catches a
   reference which resolves locally today and 404s once media stops being
   deployed.

A merged article's images are not done until step 4 passes.

---

## 10. Checklist before shipping an image

- [ ] 1600×900 for body, 1280×720 for featured. 16:9 either way.
- [ ] Orange `#FF4500` is the only accent; state colours are muted.
- [ ] Geometric sans throughout; no serifs, no rounded faces.
- [ ] Every word in the image is spelled correctly — read it twice.
- [ ] Nothing smaller than 24px at full width.
- [ ] Fewer than ~40 words; if more, it should be an HTML table.
- [ ] Shapes aligned, evenly spaced, identical sizes where they should match.
- [ ] It teaches something the paragraph next to it does not.
- [ ] Alt text written, under 125 characters, describes the takeaway.
- [ ] Filename is kebab-case and descriptive.
- [ ] Synced to S3 and `wp:verify-dist` passes.
