// Makes images uploaded in the admin web-ready: WebP, at most 1600px wide and
// 200 KB, with every reference in the posts and Settings files updated.
//
// The upload's own format is kept as a FALLBACK next to the WebP (hero.png beside
// hero.webp), shrunk to the same width and a sane weight. Posts reference the
// WebP; the page serves it in a <picture> with the fallback as the <img>, so a
// browser or crawler that cannot read WebP still gets an image. See
// scripts/lib/cms-picture.mjs.
//
// Decap saves an upload exactly as the editor gave it (a 4 MB PNG stays a 4 MB
// PNG), and every reader would then download it. This runs on the editor's pull
// request (.github/workflows/cms-images.yml), so the optimised file is what
// merges. It is idempotent: an image that is already fine is left alone.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export const MAX_BYTES = 200_000;
export const MAX_WIDTH = 1600;
/** The fallback is never shown to a WebP-capable browser, so it only has to be reasonable. */
export const MAX_FALLBACK_BYTES = 600_000;
const MIN_WIDTH = 800;
const CONVERT = /\.(png|jpe?g|webp)$/i;
const TEXT = /\.(mdx?|json)$/i;

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

/** Encode to WebP under `maxBytes`: lower the quality first, then the width. */
export async function encode(input, { maxBytes = MAX_BYTES, maxWidth = MAX_WIDTH } = {}) {
  const meta = await sharp(input).metadata();
  let width = Math.min(meta.width ?? maxWidth, maxWidth);
  let buf;
  for (;;) {
    for (const q of [84, 76, 68, 60, 52]) {
      buf = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: q, effort: 5 }).toBuffer();
      if (buf.length <= maxBytes) return { buf, width, quality: q };
    }
    if (width <= MIN_WIDTH) return { buf, width, quality: 52, over: true };
    width = Math.max(MIN_WIDTH, Math.round(width * 0.85));
  }
}

/** Re-encode the original in its own format: same width cap, bounded weight. */
export async function encodeFallback(input, ext, { maxBytes = MAX_FALLBACK_BYTES, maxWidth = MAX_WIDTH } = {}) {
  const meta = await sharp(input).metadata();
  let width = Math.min(meta.width ?? maxWidth, maxWidth);
  const png = /^\.png$/i.test(ext);
  for (;;) {
    const img = sharp(input).rotate().resize({ width, withoutEnlargement: true });
    const buf = await (png ? img.png({ compressionLevel: 9, effort: 7 }) : img.jpeg({ quality: 82, mozjpeg: true })).toBuffer();
    if (buf.length <= maxBytes || width <= MIN_WIDTH) return buf;
    width = Math.max(MIN_WIDTH, Math.round(width * 0.85));
  }
}

/**
 * @param {{mediaDir: string, publicPrefix?: string, refDirs: string[]}} o
 *   mediaDir: the folder uploads land in (public/cms-media); publicPrefix: how
 *   pages refer to it; refDirs: folders of files that mention image paths.
 */
export async function optimizeImages({ mediaDir, publicPrefix = '/cms-media', refDirs = [], maxBytes = MAX_BYTES, maxWidth = MAX_WIDTH }) {
  const changes = [];
  for (const file of [...walk(mediaDir)]) {
    if (!CONVERT.test(file)) continue;
    const size = fs.statSync(file).size;
    const isWebp = /\.webp$/i.test(file);
    const meta = await sharp(file).metadata();
    if (isWebp && size <= maxBytes && (meta.width ?? 0) <= maxWidth) continue;
    // A PNG/JPEG that already sits beside its WebP and is within the fallback limits is a
    // fallback this script wrote earlier: leave it, or every run would convert it again.
    if (!isWebp && size <= MAX_FALLBACK_BYTES && (meta.width ?? 0) <= maxWidth
        && fs.existsSync(file.replace(/\.[^.]+$/, '.webp'))) continue;

    const { buf, over } = await encode(file, { maxBytes, maxWidth });
    const rel = path.relative(mediaDir, file).split(path.sep).join('/');
    let out = file.replace(/\.[^.]+$/, '.webp');
    for (let i = 1; out !== file && fs.existsSync(out); i += 1) out = file.replace(/\.[^.]+$/, `-${i}.webp`);
    fs.writeFileSync(out, buf);
    if (out !== file) {
      // Keep the upload's own format as the fallback, beside the WebP and under its name.
      const ext = path.extname(file);
      const fallback = out.replace(/\.webp$/i, ext.toLowerCase());
      if (/^\.(png|jpe?g)$/i.test(ext)) fs.writeFileSync(fallback, await encodeFallback(file, ext));
      if (fallback !== file) fs.rmSync(file);
    }
    const to = path.relative(mediaDir, out).split(path.sep).join('/');
    changes.push({ from: `${publicPrefix}/${rel}`, to: `${publicPrefix}/${to}`, before: size, after: buf.length, stillLarge: Boolean(over) });
  }

  const renames = changes.filter(c => c.from !== c.to);
  if (renames.length) {
    for (const dir of refDirs) {
      for (const f of walk(dir)) {
        if (!TEXT.test(f)) continue;
        let text = fs.readFileSync(f, 'utf8');
        const before = text;
        for (const c of renames) text = text.split(c.from).join(c.to);
        if (text !== before) fs.writeFileSync(f, text);
      }
    }
  }
  return changes;
}
