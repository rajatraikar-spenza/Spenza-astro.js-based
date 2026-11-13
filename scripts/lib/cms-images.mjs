// Makes images uploaded in the admin web-ready: WebP, at most 1600px wide and
// 200 KB, with every reference in the posts and Settings files updated.
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

    const { buf, over } = await encode(file, { maxBytes, maxWidth });
    const rel = path.relative(mediaDir, file).split(path.sep).join('/');
    let out = file.replace(/\.[^.]+$/, '.webp');
    for (let i = 1; out !== file && fs.existsSync(out); i += 1) out = file.replace(/\.[^.]+$/, `-${i}.webp`);
    fs.writeFileSync(out, buf);
    if (out !== file) fs.rmSync(file);
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
