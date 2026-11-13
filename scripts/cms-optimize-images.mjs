#!/usr/bin/env node
// Optimise images uploaded through the admin. See scripts/lib/cms-images.mjs.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimizeImages } from './lib/cms-images.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = process.env.CMS_PUBLIC_DIR ? path.resolve(process.env.CMS_PUBLIC_DIR) : path.join(ROOT, 'public');
const changes = await optimizeImages({
  mediaDir: path.join(publicDir, 'cms-media'),
  refDirs: [path.join(ROOT, 'src', 'content', 'cms-blog'), path.join(ROOT, 'src', 'content', 'cms-meta')],
});
for (const c of changes) {
  const kb = n => `${Math.round(n / 1024)} KB`;
  console.log(`${c.from} -> ${c.to}  ${kb(c.before)} -> ${kb(c.after)}${c.stillLarge ? '  (still over 200 KB: use a simpler image)' : ''}`);
}
console.log(changes.length ? `${changes.length} image(s) optimised.` : 'No images needed optimising.');
