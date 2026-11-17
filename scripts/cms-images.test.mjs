// Image optimisation for admin uploads.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { optimizeImages, MAX_BYTES, MAX_FALLBACK_BYTES } from './lib/cms-images.mjs';
import { cmsPair } from './lib/cms-picture.mjs';

const photo = (w, h) => sharp({ create: { width: w, height: h, channels: 3, noise: { type: 'gaussian', mean: 120, sigma: 14 } } });

test('a large PNG becomes a small WebP, keeps a PNG fallback, and every reference follows the WebP', async () => {
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
  assert.ok(fs.existsSync(out));
  const fallback = path.join(media, 'Hero Shot.png');
  assert.ok(fs.existsSync(fallback), 'the original format is kept as the fallback');
  const fm = await sharp(fallback).metadata();
  assert.equal(fm.format, 'png');
  assert.ok(fm.width <= 1600, 'fallback is capped at 1600px');
  assert.ok(fs.statSync(fallback).size <= MAX_FALLBACK_BYTES, `fallback size ${fs.statSync(fallback).size}`);
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

test('a JPEG upload keeps a JPEG fallback; the pair is found from either name', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cmsimg-'));
  const media = path.join(dir, 'public', 'cms-media', 'p');
  fs.mkdirSync(media, { recursive: true });
  await photo(2400, 1200).jpeg({ quality: 95 }).toFile(path.join(media, 'cover.jpg'));
  await optimizeImages({ mediaDir: path.join(dir, 'public', 'cms-media'), refDirs: [] });
  const pub = path.join(dir, 'public');
  assert.equal((await sharp(path.join(media, 'cover.jpg')).metadata()).format, 'jpeg');
  assert.deepEqual(cmsPair('/cms-media/p/cover.webp', pub), { webp: '/cms-media/p/cover.webp', fallback: '/cms-media/p/cover.jpg' });
  assert.deepEqual(cmsPair('/cms-media/p/cover.jpg', pub), { webp: '/cms-media/p/cover.webp', fallback: '/cms-media/p/cover.jpg' });
  assert.equal(cmsPair('/cms-media/p/missing.webp', pub), null);
  assert.equal(cmsPair('/wp-content/uploads/x.png', pub), null);
  fs.rmSync(path.join(media, 'cover.jpg'));
  assert.equal(cmsPair('/cms-media/p/cover.webp', pub), null, 'no fallback on disk, no <picture>: a <source> that 404s would break the image');
  fs.rmSync(dir, { recursive: true });
});
