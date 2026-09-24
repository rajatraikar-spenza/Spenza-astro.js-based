---
name: blog-images
description: Produce and optimise images for a Spenza blog post so they match the site's brand and quality bar. Use when a post needs new or replacement images, when a merged article must replace its donors' visuals, when writing image-generation prompts for ChatGPT or Midjourney, or when resizing, cropping, compressing or converting blog images to WebP.
---

# Blog images

[`docs/blog-images.md`](../../../docs/blog-images.md) is the reference: brand
tokens, dimensions, the featured-image template, the five composition types,
alt-text rules and the failure catalogue. Read it before writing a prompt. This
file is the procedure.

**Two rules override everything below:**

1. **Reuse beats generate.** Check what already exists before writing a prompt.
   Generation is the fallback for slots nothing covers.
2. **Featured images are a fixed template, not a fresh image.** Build from an
   existing hero and swap the art panel. See §5 of the reference.

## Step 1 — Inventory what already exists

Before anything else, pull every body image and featured image from the
destination post and its donors. The command is in §2 of the reference. A
merged article inherits everything its donors had, and some of it is good.

**Look at every candidate.** Filenames lie — `White-label-industrial-use-cases`
turned out to be an excellent four-up brand grid, and `image-1024x683` turned
out to be a stock photo of a man beside a clip-art rocket.

Keep an image if it teaches something the merged article still says, is
on-brand, has text that is accurate for the *merged* scope, and is 16:9 or
crops to it cleanly. Reject it otherwise, and say why in your summary so the
decision is visible rather than silent.

In the white-label cluster this covered two of four slots plus the featured
image, halving the generation work. Expect that to be typical.

## Step 2 — Decide what is still missing

Not what it currently has. A merged article does **not** inherit its donors'
pictures — the US MVNO cluster's five posts carried thirteen images between
them and the merged article needed four.

An image earns its place by carrying information the prose cannot carry as
quickly: a comparison, a sequence, a hierarchy, a shape. **If you cannot say in
one sentence what a reader learns from it, leave it out.** A photograph of a
person holding a phone teaches nothing.

Aim for **three to five** images in a long-form article: one featured, and three
or four in the body at natural section breaks.

## Step 3 — Mark the slots

Put a visible placeholder where each image will go, so the user can review
placement before anything is generated:

```html
<div class="img-slot">
  <span class="tag">New image 1</span>
  <h4>Short title of what it shows</h4>
  <p>One line on what it replaces or why it is here.</p>
</div>
```

Style it as a dashed orange box. Remove the placeholder CSS once the real
figures land — it has no other user.

## Step 4 — Write the prompts

Only for the slots step 1 left empty. Match the style of whatever you are
reusing, so the article reads as one piece rather than a scrapbook.

**Style preamble + composition brief.** The preamble is fixed and lives in
`docs/blog-images.md` §7 — copy it verbatim, do not paraphrase it. The brief
states, in this order:

1. The **shape** — the information is the shape.
2. What sits at each position, **with the exact label text in quotes**.
3. How colour encodes meaning.
4. What must not appear.

Pick the composition type from §8: **A** comparison, **B** process/timeline,
**C** hierarchy/ladder, **D** evidence strip, **E** concept hero.

Give the prompts to the user to run. Do not claim to have generated an image.

## Step 5 — For a featured image, use the template

Never generate a hero whole. The frame — Spenza logo top-left, all-caps serif
title, orange "LEARN MORE" pill, and the `spenza.com` badge at a pixel-identical
x=501–777, y=648–691 — is the same on every post, and a hero that departs from
it stands out in the related-posts grid.

Take an existing hero as the base, generate **only the right-hand art panel**
(square-ish, ~1100×900, no text, no logo, no border), set the title in the
template, export 1280×720. Full geometry in §5 of the reference.

**The title is the part that fails.** Set it at **weight 700 or heavier**, with
a **cap height of at least 40px** on the 1280 canvas, filling **440 to 600px**
of the left column. A high-contrast serif at regular weight and 20px cap height
turns to hairlines and greys out at thumbnail size, which is where a featured
image is actually seen. Use Playfair Display, Prata, Bodoni Moda or Libre
Baskerville at 700+, never condensed.

Before accepting a hero, scale it to 320px wide and look at it. If strokes
disappear, raise the weight or shorten the title. **Never shrink the type to
fit the words.**

Name it after the post title in Title-Case-Hyphenated.

## Step 6 — Optimise what comes back

Use **sharp**, which is already in `node_modules`. Do not use `sips` — it writes
24-bit PNG and produced 6.2MB where sharp produced 2.0MB for the same five
images.

```bash
node --input-type=module -e "
import sharp from 'sharp';
const jobs = [
  ['output-name', '/path/to/source.png', 1600, 900],
];
for (const [name, src, w, h] of jobs) {
  const base = sharp(src).resize(w, h, { fit: 'cover', position: 'centre', kernel: 'lanczos3' });
  await base.clone().png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 })
    .toFile(\`public/blog-media/<cluster>/\${name}.png\`);
  await base.clone().webp({ quality: 90, effort: 6 })
    .toFile(\`public/blog-media/<cluster>/\${name}.webp\`);
}
"
```

`fit: 'cover'` crops centred to the exact target aspect before scaling, so
nothing stretches. Generated images are rarely exactly 16:9 — 1672×941 and
1731×909 both arrived for the last cluster.

**Sizes:** 1600×900 for body images, 1280×720 for featured. Both 16:9; the site
has 854 images at 1024×576 and 872 at 768×432, and an off-ratio image
letterboxes against its neighbours.

**Expect** roughly 300–400KB PNG and 50–120KB WebP per body image. If the PNG is
over ~600KB the quantisation did not apply.

## Step 7 — Check the output

**Look at every image after optimisation.** Palette quantisation can band
gradients, and a centred crop can cut a label.

- [ ] Every word in the image is spelled correctly — read each one
- [ ] No banding in flat fills or soft panels
- [ ] Nothing important lost to the crop
- [ ] Text still legible when the image is 1024px wide
- [ ] Orange `#FF4500` is the only brand accent; state colours stay muted

A misspelling in an image undermines every claim in the article. Regenerate
rather than ship one.

## Step 8 — Place them

Emit a `<picture>` so browsers take the WebP and the PNG stays as fallback:

```html
<figure class="wp-block-image aligncenter size-large"><picture>
<source srcset="/blog-media/<cluster>/<name>.webp" type="image/webp">
<img src="/blog-media/<cluster>/<name>.png" alt="..." width="1600" height="900"
     loading="lazy" decoding="async">
</picture></figure>
```

**Alt text states the takeaway, not the appearance.** Not "a chart with orange
bars" but "An MVNE launch takes 7 to 90 days and $10K to $400K in year one,
against 12 to 18 months and $5M+ to build." Under 125 characters. Never start
with "Image of".

Name files in kebab-case, descriptively, with no generator artefacts.
`mvno-model-ladder.png`, never `ChatGPT-Image-Sep-3-2026-04_29_14-PM.png`. The
blog is full of the latter; do not add to it.

## Step 9 — Verify in the browser

Force the lazy images to load, then confirm the `<picture>` resolved to WebP:

```javascript
document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager');
[...document.querySelectorAll('img[src*="/blog-media/"]')]
  .map(i => ({ f: i.currentSrc.split('/').pop(), nat: i.naturalWidth + 'x' + i.naturalHeight }));
```

Every entry should end `.webp` at full resolution. A `0x0` means the file is
missing or the path is wrong.

## Staging vs published

`public/blog-media/<cluster>/` is **staging**. It is not one of the
`MEDIA_TREES` the build drops when `MEDIA_ORIGIN` is set, so previews keep their
images in a real build.

On publish the files move to the WordPress media library, the `src` attributes
become `/wp-content/uploads/...` like every other post, and then:

```bash
npm run wp:blog-media-sync
aws s3 sync … --size-only
npm run build
npm run wp:verify-dist
```

New posts publish new images, they are not in the bucket, and **the build will
not warn you**. `wp:verify-dist` is the only check that catches a reference
which resolves locally today and 404s once media stops being deployed. Delete
the staging copies once the images are in WordPress.

## Never

- Generate an image before checking whether one already exists.
- Generate a featured image from scratch instead of using the template.
- Ship an image with a misspelled label.
- Use stock photography of people, or clip-art.
- Use a palette other than the brand tokens in `docs/blog-images.md` §2.
- Bake more than ~40 words into an image — past that it should be an HTML table,
  which is already styled, searchable and responsive.
- Reuse the same image across several posts inside body copy.
