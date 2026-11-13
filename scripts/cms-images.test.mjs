// Image optimisation for admin uploads.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { optimizeImages, MAX_BYTES } from './lib/cms-images.mjs';

const photo = (w, h) => sharp({ create: { width: w, height: h, channels: 3, noise: { type: 'gaussian', mean: 120, sigma: 14 } } });

test('a large PNG becomes a small WebP and every reference follows it', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cmsimg-'));
  const media = path.join(dir, 'public', 'cms-media', 'my-post');
  const posts = path.join(dir, 'posts');
  fs.mkdirSync(media, { recursive: true });
  fs.mkdirSync(posts);
  await photo(3200, 1800).png().toFile(path.join(media, 'Hero Shot.png'));
  await photo(900, 500).webp({ quality: 40 }).toFile(path.join(media, 'fine.webp'));
  const fineBefore = fs.statSync(path.join(media, 'fine.webp')).size;
  fs.writeFileSync(path.join(posts, 'a.mdx'), 'hero:\n  image: /cms-media/my-post/Hero Shot.png\nbody: ![x](/cms-media/my-post/fine.webp)\n');

  const changes = await optimizeImages({ mediaDir: path.join(dir, 'public', 'cms-media'), refDirs: [posts] });

  assert.equal(changes.length, 1, 'only the oversized PNG is touched');
  const out = path.join(media, 'Hero Shot.webp');
  assert.ok(fs.existsSync(out) && !fs.existsSync(path.join(media, 'Hero Shot.png')));
  assert.ok(fs.statSync(out).size <= MAX_BYTES, `size ${fs.statSync(out).size}`);
  assert.ok((await sharp(out).metadata()).width <= 1600);
  assert.equal(fs.statSync(path.join(media, 'fine.webp')).size, fineBefore, 'a good image is left alone');
  const text = fs.readFileSync(path.join(posts, 'a.mdx'), 'utf8');
  assert.match(text, /image: \/cms-media\/my-post\/Hero Shot\.webp/);
  assert.match(text, /\/cms-media\/my-post\/fine\.webp/);

  // Idempotent.
  assert.equal((await optimizeImages({ mediaDir: path.join(dir, 'public', 'cms-media'), refDirs: [posts] })).length, 0);
  fs.rmSync(dir, { recursive: true });
});
