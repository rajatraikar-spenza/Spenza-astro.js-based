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

## 2. Reuse before you generate

**Generating a new image is the second option. The first is finding one that
already exists.** The blog has 265 featured images and roughly 1,700 body
images, and a merged article inherits everything its donors had.

This matters most during consolidation. Four posts merging into one bring four
sets of images with them, and some of them are good — the white-label cluster
already contained an on-brand seven-day launch timeline and a four-up brand
use-case grid that fit the merged article's slots exactly. Regenerating those
would have been slower, worse, and would have thrown away work the design team
already paid for.

### How to check

Pull every body image from the destination and its donors before writing a
single prompt:

```bash
python3 - <<'EOF'
import re, subprocess
POSTS = ['destination-slug', 'donor-1-slug', 'donor-2-slug']
NOISE = ('BGT.png', 'ChatGPT-Image-Sep-3-2026', 'How-to-Reduce-MVNO-Churn-8-Retention')  # related-post thumbnails
seen = set()
for slug in POSTS:
    h = subprocess.run(['curl','-sL','--max-time','25',f'https://spenza.com/mvno/{slug}/'],
                       capture_output=True, text=True).stdout
    i = h.find('elementor-widget-theme-post-content')
    og = re.search(r'<meta property="og:image" content="([^"]+)"', h)
    print(f'\n### {slug}\n  og: {og.group(1).split("/")[-1] if og else None}')
    for u in re.findall(r'<img[^>]+src="(https://media[^"]+)"', h[i:i+250000] if i>0 else ''):
        if any(n in u for n in NOISE) or 'logo' in u.lower(): continue
        base = re.sub(r'-\d+x\d+(?=\.\w+$)', '', u)
        if base in seen: continue
        seen.add(base); print('   ', u.split('/')[-1][:70])
EOF
```

Strip the `-WIDTHxHEIGHT` suffix to fetch the original upload — WordPress serves
resized derivatives in the markup, and the original is usually larger and
cleaner. `White-Label-MVNO-2026-1024x576.png` in the page is
`White-Label-MVNO-2026.png` at 1920×1080 in the library.

**Then look at every candidate.** File names lie; a promising name is often a
stock photograph.

### What qualifies for reuse

Keep it if all of these hold:

- It teaches something the merged article still says.
- It is on-brand — orange accent, no off-palette blues or greens.
- Its text is accurate for the merged article. A diagram labelled for the donor's
  narrower scope is a liability in a broader one.
- It is 16:9, **or** its own aspect is deliberate and cropping would damage it.
  The 16:9 house ratio in §4 governs images you *generate*. A reused asset keeps
  its native aspect when a crop would cut content — the seven-day launch timeline
  is a 2.5:1 banner and the brand use-case grid is 3:2, and forcing either into
  16:9 would remove labels. Reuse the derivative the live page already serves.
- It is not one of the failures in §9.

Reject it otherwise, and say why in your summary so the decision is visible.

### What still needs generating

Whatever is left. In practice a merged article needs one or two genuinely new
images, not four — the donors usually supply the rest. Generate only for slots
no existing asset covers, and match the reused assets' style so the article
reads as one piece rather than a scrapbook.

---

## 3. Brand tokens

**From `Spenza Brand Guidelines.pdf` (Pedram Fayazian, 2022).** These are the
official values. Anything sampled from CSS is an approximation of them.

| Token | Hex | Role |
| :---- | :-- | :--- |
| **Spenza Orange** | `#FF4500` | The brand. Primary fills, colour fields, the one thing a reader should remember. |
| Orange deep | `#C63600` | Darkest stop. Shadow side of an orange form, start of a gradient. |
| Orange light | `#FF6F39` | Gradient light stop, hover, highlight |
| Orange pale | `#FF8E64` | Gradient lightest stop, tints, soft glows |
| Ink | `#282829` | Text on orange, dark panels, headings inside images |
| Off-white | `#FAFAFA` | Text on orange, card fills on a colour field |
| Slate | `#7B8898` | Secondary text, supporting labels |
| Grey | `#96989A` | Tertiary text, de-emphasised elements |
| Light grey | `#D7D7D7` | Dividers, hairlines, inactive states |

**The orange is a ramp, not a swatch.** `#C63600 → #FF4500 → #FF6F39 → #FF8E64`
is a four-stop gradient. Using only the flat `#FF4500` throws away three
quarters of the palette, and that is most of why the early diagrams looked thin.

**`#9B2A00` is excluded.** It is in the brand guidelines, but it reads as brown
rather than orange at illustration scale and drags the whole frame dark.
`#C63600` is the darkest stop we use. Do not reintroduce it.

### Text colour is decided by the background, not by taste

**On orange or any dark field, text is white `#FAFAFA`. On a light field, text
is ink `#282829`.** No exceptions, no mid-greys for body text inside an image.

Measured contrast, so this is checkable rather than a matter of opinion:

| Background | `#FAFAFA` white | `#282829` ink | Use |
| :--------- | --------------: | ------------: | :-- |
| `#C63600` orange deep | **5.12** | 2.76 | white |
| `#FF4500` Spenza orange | 3.30 | 4.28 | **see below** |
| `#FF6F39` orange light | 2.65 | **5.32** | ink |
| `#FF8E64` orange pale | 2.16 | **6.53** | ink |
| `#282829` ink | **14.11** | 1.00 | white |
| `#FAFAFA` off-white | 1.00 | **14.11** | ink |

**The primary orange is the awkward one.** `#FF4500` clears neither colour at
the 4.5 threshold for normal text. Image text is large by our own spec, so the
applicable threshold is 3:1 and both technically pass, but white sits at 3.30
and that is too close to the line to rely on.

So: **do not set text directly on `#FF4500`.** Put it on an off-white card, or
deepen the patch behind it to `#C63600` and set it in white. Either is one
extra shape and removes the problem.

**Secondary labels** may use slate `#7B8898`, but only on a light field, and
never for the one sentence the image exists to communicate.

**Cool neutrals, not warm.** `#7B8898` and `#96989A` are blue-grey. They sit
against orange without muddying it. Do not substitute a warm grey.

**Typefaces.** The brand uses **Vice City Sans** (display) and **Mercury SSm**
(body serif). Both are licensed and not available to a generator, so substitute:
a geometric sans at heavy weight for display, and use **Rhodium Libre** where a
serif is called for, since it is already the hero face (§5).


## 4. Specifications

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

## 5. The featured-image template

**Featured images are not generated from scratch. They are a fixed template
with one variable panel.** Every recent post uses it, and a hero that departs
from it is immediately obvious in the related-posts grid where three sit side
by side.

Measured across four 2026 posts, the frame is pixel-identical:

| Element | Position (on a 1280×720 canvas) |
| :------ | :------------------------------ |
| Canvas | 1280 × 720, pure white background |
| Spenza logo | top-left, around x=75 y=80, roughly 155×50 |
| Title | left column from x=72, baseline starts around y=225 |
| "LEARN MORE" pill | x=72, y=432, roughly 210×42 |
| `spenza.com` badge | **x=501–777, y=648–691. Identical on every post.** |
| Art panel | right-aligned to x≈1207, between 446 and 578 wide, 348 to 515 tall, vertically centred in the upper portion |

### The title is where this goes wrong

**Title:** all caps, high-contrast serif, near-black, left-aligned, maximum
three lines. It is the post title, shortened if needed, because it is read at
thumbnail size.

A high-contrast serif set light and small is the single most common failure
here. The thin strokes of a Didone are hairlines by design; at 28px they thin
to almost nothing and the word breaks up. Measured against the live heroes,
generated ones have come in at roughly half the size they should be and a
fraction of the weight.

**The face is [Rhodium Libre](https://fonts.google.com/specimen/Rhodium+Libre).**
Not a substitute, not "a high-contrast serif" — that one.

| Property | Required |
| :------- | :------- |
| Face | Rhodium Libre |
| Weight | 400. **It is the only weight the family has.** |
| Cap height | **40px minimum** on a 1280 canvas |
| Line height | 48 to 60px per line at 1280 |
| Block width | **fills 440 to 600px** of the left column |
| Left edge | x = 72 |
| Lines | 3 maximum |
| Case | All caps |
| Colour | Near-black on the white frame |

### Why the earlier "weight 700 or heavier" rule is gone

That rule was a proxy for the thing that actually matters, and it was the wrong
proxy. The original failure was not light weight as such: it was a
*high-contrast* serif set small, where the thin strokes of a Didone are
hairlines by design and thin to nothing at thumbnail size.

Rhodium Libre is low-contrast and sturdy. Its single 400 weight reads heavier
than a Didone's 700, because its thin strokes are not thin. So the requirement
is not a number on a weight axis:

> **The strokes must survive at 320px wide.** That is the test. Nothing else.

Rhodium Libre has not shipped on this site before, so the first hero built with
it must be checked at 320px rather than assumed. If it greys out, raise the cap
height, not the weight, because there is no heavier weight to go to.

If the title will not fit three lines at 40px cap height, **shorten the title**.
Do not shrink the type to fit the words, and do not switch to a different face
to buy room.

### Getting the font

It is not installed on this machine and not currently used by the site. Fetch
the TTF once and keep it with the tooling rather than re-downloading per image:

```
curl -s -o /tmp/RhodiumLibre.ttf \
  "https://fonts.gstatic.com/s/rhodiumlibre/v21/1q2AY5adA0tn_ukeHcQHqpx6pEQ.ttf"
```

No web-font delivery is involved. A hero is a PNG, so the type is rasterised
into the image and nothing is loaded by the browser. `npm run wp:fonts` is not
needed for this.

**"LEARN MORE" pill:** solid brand orange, white letterspaced caps, fully
rounded ends.

**`spenza.com` badge:** a white pill with a thin black outline and a magnifier
glyph, centred at the bottom. It never moves.

**The art panel is the only thing that changes.** Its style varies by subject
and that is fine — a dark render with orange glow, a flat vector scene, a
product illustration have all shipped. What does not vary is the frame.

### So how do you make one?

1. Take an existing hero as the base file. Do not regenerate the frame.
2. Generate **only the art panel** — a square-ish image at roughly 1100×900,
   which you scale into the panel. Prompt it as a standalone illustration, with
   no text, no logo and no border.
3. Set the title in the template, in the serif at the existing size.
4. Export at 1280×720.

A prompt for the art panel alone, appended to the preamble in §7:

> A standalone square illustration, no text and no border, to sit on a white
> page beside a headline. {SUBJECT}. Dark charcoal background with warm orange
> `#FF4500` glow and thin line-art detail, or flat vector on cream — pick one
> and commit to it. Centred composition with breathing room at the edges.

**Filename** is the post title in Title-Case-Hyphenated, matching the recent
convention: `White-Label-MVNO-Launch-Guide-2026-Build-Your-Mobile-Brand.png`.

---

## 6. The two-stage workflow

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

## 7. Prompt construction

Every prompt is **style preamble + composition brief**. The preamble never
changes; only the brief does.

### Style preamble — paste this first, every time

> Create a rich editorial illustration for a B2B telecom brand. **Fill the frame
> with a warm colour field** — a soft gradient built from Spenza orange
> `#C63600`, `#FF4500`, `#FF6F39`, `#FF8E64` — never a plain white
> background. Add a fine grain or paper texture across the whole image and a
> soft radial glow behind the focal subject so it sits forward. Shapes are
> confident and slightly hand-drawn rather than mechanically precise, with
> layered depth: a shadow side, a lit side, and a subtle highlight. Icons and
> objects are simple and bold, in off-white `#FAFAFA` and ink `#282829`, with
> blue-grey `#7B8898` for secondary detail. Generous negative space around a
> single clear focal point. No stock-photo people, no clip-art, no flat
> outlined rectangles, no drop-shadowed bevels, no 3D renders. 1600×900 pixels,
> 16:9. Any text is large, minimal and correctly spelled.

**The previous preamble asked for "flat vector, no gradients" and that is what
produced the boring images.** Flat plus outline plus white background is a
wireframe, not an illustration. The brand owns a five-stop gradient ramp and a
texture-friendly palette; use them.


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

## 8. The five image types

Every body image is one of these. Each entry gives the **shape** and the
**treatment**. The shape carries the information; the treatment is what stops it
looking like a wireframe.

### The rule that governs all five

> **An outlined rectangle with words in it is a table, not an illustration.**

If your image is boxes plus text, delete it and write an HTML table instead —
the site already styles those, and they are searchable, responsive and
accessible. An illustration earns its place by doing something a table cannot:
showing flow, proportion, spatial relationship, or a thing in context.

**Every body image must have all four of these:**

1. **A colour field.** The frame is filled with a warm orange gradient, never
   plain white. White is for the hero template only.
2. **An icon or object per concept.** A named thing the eye can grab. Not a
   label floating in a box.
3. **Visible relationship.** Arrows, overlap, nesting, scale, a connecting path.
   The reader should see how the parts relate before reading a word.
4. **Depth.** Grain, a soft glow behind the focal subject, a shadow side. Flat
   is what made the last batch lifeless.

### A. Comparison — two or three options against each other

*Build vs buy, model vs model, before vs after.*

**Shape:** Two panels meeting at a centre divider, with a small circular "VS"
badge where they meet. Each panel carries one large figure, one supporting
figure, and a row of three icons.

**Treatment:** The losing side sits on a desaturated slate field (`#7B8898` at
low saturation); the winning side on the orange gradient. The asymmetry does
the arguing before any text is read. Grain across both.

### B. Process or timeline — an ordered sequence

*Launch steps, migration phases, an activation flow.*

**Shape:** A path, not a row of boxes. Numbered circular nodes on a curved or
stepped line that visibly travels left to right, each node carrying an icon
inside it and a two-or-three-word label beneath.

**Treatment:** The connecting line is an orange gradient that **brightens along
its length**, `#C63600` at the start through to `#FF8E64` at the end, so
progress is visible as light. Completed nodes filled, later nodes outlined.
Soft glow under the final node.

### C. Hierarchy or ladder — levels of something

*Model tiers, maturity levels, control-versus-cost tradeoffs.*

**Shape:** Ascending blocks, each one physically larger as well as higher, so
the increase is felt as mass rather than only read as a label. Two long arrows
beneath naming the two axes.

**Treatment:** Each step takes the next stop up the orange ramp. Lowest step
`#FF8E64`, highest `#C63600`, so the ramp itself encodes the progression.

### D. Evidence strip — customer proof

*Case-study rows, outcomes, three-up results.*

**Shape:** Three cards on a shared colour field, each with a line-art icon, a
short headline and one metric. The metric is the largest element on the card.

**Treatment:** Off-white `#FAFAFA` cards floating on the orange field with soft
shadow, not outlined boxes on white. A thin orange rule above each headline.

**Never invent a metric.** Only outcomes already in the article text.

### E. Concept hero — the featured image

See §5. Different rules: white frame, fixed template, Rhodium Libre title. The
colour-field rule above does **not** apply to heroes.

### What to reach for when none of these fit

A cutaway, a map, a stack diagram, a before-and-after of one object, a thing
shown in its real context. If the honest answer is "this is just a list", the
article wants a list, and the right move is to ship no image at all rather than
a decorated one.


## 9. What the site already got wrong

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

## 10. Alt text

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

## 11. Getting the file onto the site

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

## 12. Checklist before shipping an image

- [ ] You checked the destination and donors for a reusable image first (§2).
- [ ] A featured image was built from the template, not generated whole (§5).
- [ ] 1600×900 for body, 1280×720 for featured. 16:9 either way.
- [ ] **The frame is a colour field, not white.** (Body images only; heroes are white.)
- [ ] **Every concept has an icon or object**, not a label in a box.
- [ ] **The relationship is visible** before any text is read: flow, scale, nesting.
- [ ] **It has depth**: grain, a glow behind the subject, a shadow side.
- [ ] **It is not boxes-plus-text.** If it is, delete it and write an HTML table.
- [ ] Orange is used as the four-stop ramp, not one flat swatch.
- [ ] **Text is white `#FAFAFA` on orange or dark, ink `#282829` on light.**
- [ ] **No text sits directly on `#FF4500`** — card it or deepen to `#C63600`.
- [ ] `#9B2A00` does not appear anywhere. It is excluded for being too dark.
- [ ] Geometric sans throughout; no serifs, no rounded faces.
- [ ] Every word in the image is spelled correctly — read it twice.
- [ ] Nothing smaller than 24px at full width.
- [ ] Fewer than ~40 words; if more, it should be an HTML table.
- [ ] Shapes aligned, evenly spaced, identical sizes where they should match.
- [ ] It teaches something the paragraph next to it does not.
- [ ] Alt text written, under 125 characters, describes the takeaway.
- [ ] Filename is kebab-case and descriptive.
- [ ] Synced to S3 and `wp:verify-dist` passes.
