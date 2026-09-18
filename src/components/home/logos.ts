/**
 * Customer logos, the set the old home page showed under "Trusted by Industry
 * Leaders". Used twice: the moving strip under the hero and the static row at
 * the foot of Customer Proof.
 *
 * They are uploads on the media host, not files this repo owns, so each goes
 * through `toMediaOrigin` like any other `/wp-content/uploads/` path. Every one
 * has a WebP twin where the mirror files them.
 *
 * `height` is per logo because the source images carry very different amounts
 * of empty space around the mark; it is what makes them read as one size.
 */
import { toMediaOrigin, WEBP_PATH } from '../../../scripts/lib/config.mjs';

interface Logo {
  name: string;
  /** Path under /wp-content/uploads/. */
  file: string;
  width: number;
  height: number;
  /** Rendered height, px. */
  size: number;
}

export const LOGOS: Logo[] = [
  { name: 'Butlr', file: '2026/04/butrle.png', width: 424, height: 256, size: 38 },
  { name: 'Angel Watch', file: '2026/04/Angel-Watch.png', width: 1200, height: 628, size: 38 },
  { name: 'WeLink', file: '2026/05/Lockup-Gradient-Black-180-x-60_ceezwf-1.png', width: 220, height: 60, size: 24 },
  { name: 'RSVP Wireless', file: '2026/05/image-2.png', width: 220, height: 57, size: 26 },
  { name: 'New Day Logistics', file: '2026/05/c131edf59974a4f1493d0c6acc4069103822aa3f.png', width: 360, height: 174, size: 52 },
  { name: 'RocketPhone', file: '2026/06/image-scaled.png', width: 2560, height: 701, size: 42 },
  { name: 'Eazybe', file: '2026/06/image-1-1.png', width: 740, height: 340, size: 46 },
];

/**
 * One logo as a `<picture>`, pointed at the media host when there is one.
 * `scale` shrinks the whole set evenly, for a row that has less room.
 */
export function logoHtml(logo: Logo, { hidden = false, scale = 1 } = {}): string {
  const png = `/wp-content/uploads/${logo.file}`;
  const webp = `${WEBP_PATH}webp-images/uploads/${logo.file}.webp`;
  const h = Math.round(logo.size * scale);
  const w = Math.round((logo.width / logo.height) * h);
  // A logo repeated to make the marquee seamless is decoration: hide it from
  // assistive tech, and leave its alt empty so it is not announced twice.
  const alt = hidden ? '' : logo.name;
  return toMediaOrigin(
    `<picture${hidden ? ' aria-hidden="true"' : ''}>` +
      `<source srcset="${webp}" type="image/webp">` +
      `<img src="${png}" alt="${alt}" width="${w}" height="${h}" loading="lazy" decoding="async">` +
    '</picture>'
  );
}
