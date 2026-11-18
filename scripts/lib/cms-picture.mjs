// WebP plus a same-format fallback for the images editors upload (public/cms-media).
//
// scripts/lib/cms-images.mjs leaves two files side by side: hero.webp (what posts reference) and
// hero.png or hero.jpg (the upload's own format, shrunk). This finds the pair so the page can ship
// <picture><source type="image/webp"><img src="fallback"></picture>. A <source> that 404s breaks
// the image, so a pair is only returned when the fallback exists on disk.
import fs from 'node:fs';
import path from 'node:path';
import { PROJECT } from './config.mjs';

const FALLBACK_EXT = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];

/** @returns {{webp: string, fallback: string} | null}  url paths as the page refers to them */
export function cmsPair(url, publicDir = path.join(PROJECT, 'public')) {
  const u = String(url ?? '').split('?')[0];
  if (!u.startsWith('/cms-media/')) return null;
  const has = p => fs.existsSync(path.join(publicDir, p));
  if (/\.webp$/i.test(u)) {
    if (!has(u)) return null;
    const base = u.replace(/\.webp$/i, '');
    const ext = FALLBACK_EXT.find(e => has(base + e));
    return ext ? { webp: u, fallback: base + ext } : null;
  }
  if (/\.(png|jpe?g)$/i.test(u) && has(u)) {
    const webp = u.replace(/\.[^./]+$/, '.webp');
    return has(webp) ? { webp, fallback: u } : null;
  }
  return null;
}
