#!/usr/bin/env node
/**
 * Encode the three hub product videos into the renditions the hub pages serve.
 *
 *   npm run hub:videos -- "<folder holding the masters>"
 *
 * Each master becomes four files in public/videos/hubs/, and their names,
 * sizes and codec strings are written to src/data/hub-videos.json, which is
 * what `HubVideo.astro` reads. Re-run it whenever marketing delivers a new cut:
 * every name carries a digest of its bytes, so a new cut is a new URL and the
 * year-long cache on /videos/* can never serve a returning visitor the old one.
 *
 * The renditions, in the order the browser considers them — it takes the first
 * whose `media` matches and whose codec it can decode:
 *
 *   720p AV1     phones (max-width: 767px)
 *   720p HEVC    phones without AV1 — every iPhone before the 15 Pro
 *   720p H.264   phones with neither
 *   1080p AV1    everything wider
 *   1080p HEVC   Safari on Macs without AV1 (Intel, M1, M2)
 *   1080p H.264  everything else
 *
 * HEVC is there for Apple. Safari decodes AV1 only on hardware that has an AV1
 * decoder, so without it most iPhones would fall through to H.264 at twice the
 * size; every iPhone since the 7 decodes HEVC in hardware. Chrome and Edge pick
 * it too wherever the device has an HEVC decoder.
 *
 * The 1080p H.264 file is the master itself, remuxed and never re-encoded, so
 * the fallback every browser can play is bit-for-bit what was delivered. The
 * masters are lean already (1.0–1.4 Mbps at 1080p), and re-encoding H.264 into
 * H.264 would lose quality to save very little.
 *
 * AV1 is where the saving is: about a third of the master's size for the same
 * picture. CRF 32 was picked by measurement on the UX Hub master, the busiest
 * of the three: VMAF 96.6 mean, and the frames scoring lowest are near-white
 * transition frames where VMAF overreacts, not visible damage. A crop of the
 * dashboard's smallest text was indistinguishable from the master at CRF 34,
 * so 32 leaves headroom. The script re-measures every AV1 rendition against
 * its master and refuses to write the manifest if any mean drops below 95.
 *
 * Keyframes every 2s rather than the masters' 5s, so scrubbing lands quickly
 * when the file is fetched by byte range. `+faststart` keeps the index at the
 * front so playback starts on the first range response.
 *
 * Needs ffmpeg built with libsvtav1, libx264 and libvmaf (`brew install ffmpeg`).
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PROJECT } from './lib/config.mjs';

const run = promisify(execFile);

/** Hub key → master file name, as delivered. */
const MASTERS = {
  uxhub: 'Spenza_UX_Hub_Product_Video_Script__clone.mp4',
  telecomhub: 'Telecom_Hub.mp4',
  controlhub: 'Control_Hub.mp4',
};

const AV1_CRF = 32;
const HEVC_CRF = 24;
const H264_CRF = 21;
const MIN_VMAF = 95;
const MOBILE = '(max-width: 767px)';

const OUT_DIR = path.join(PROJECT, 'public', 'videos', 'hubs');
const MANIFEST = path.join(PROJECT, 'src', 'data', 'hub-videos.json');

const RENDITIONS = [
  {
    id: '720.av1',
    media: MOBILE,
    args: ['-vf', 'scale=-2:720:flags=lanczos', ...av1()],
  },
  {
    id: '720.hevc',
    media: MOBILE,
    args: ['-vf', 'scale=-2:720:flags=lanczos', ...hevc()],
  },
  {
    id: '720.h264',
    media: MOBILE,
    args: ['-vf', 'scale=-2:720:flags=lanczos', ...h264()],
  },
  { id: '1080.av1', args: av1() },
  { id: '1080.hevc', args: hevc() },
  // The master, untouched: copy both streams, drop container metadata.
  { id: '1080.h264', args: ['-c', 'copy', '-map_metadata', '-1'] },
];

function av1() {
  return [
    '-c:v', 'libsvtav1', '-preset', '5', '-crf', String(AV1_CRF),
    '-g', '60', '-pix_fmt', 'yuv420p10le', '-svtav1-params', 'tune=0',
    '-c:a', 'aac', '-b:a', '128k', '-map_metadata', '-1',
  ];
}

// `hvc1`, not ffmpeg's default `hev1`: Safari plays only the former in MP4.
// 8-bit Main, the profile every hardware HEVC decoder supports.
function hevc() {
  return [
    '-c:v', 'libx265', '-preset', 'slow', '-crf', String(HEVC_CRF),
    '-pix_fmt', 'yuv420p', '-tag:v', 'hvc1',
    '-x265-params', 'keyint=60:min-keyint=60:log-level=error',
    '-c:a', 'aac', '-b:a', '128k', '-map_metadata', '-1',
  ];
}

function h264() {
  return [
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(H264_CRF),
    '-profile:v', 'high', '-g', '60', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k', '-map_metadata', '-1',
  ];
}

async function probe(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-show_entries',
    'stream=codec_type,codec_name,profile,level,width,height,pix_fmt:format=duration',
    '-of', 'json', file,
  ]);
  return JSON.parse(stdout);
}

/** RFC 6381 codec string, from what ffprobe reports about the file. */
function codecs(info) {
  const v = info.streams.find(s => s.codec_type === 'video');
  const hasAudio = info.streams.some(s => s.codec_type === 'audio');
  let video;
  if (v.codec_name === 'h264') {
    const profile = { High: 0x64, Main: 0x4d, Baseline: 0x42, 'Constrained Baseline': 0x42 }[v.profile];
    if (!profile) throw new Error(`unexpected H.264 profile ${v.profile}`);
    const hex = n => n.toString(16).padStart(2, '0');
    video = `avc1.${hex(profile)}00${hex(v.level)}`;
  } else if (v.codec_name === 'hevc') {
    if (v.profile !== 'Main') throw new Error(`unexpected HEVC profile ${v.profile}`);
    // ffprobe reports general_level_idc, which is already level × 30.
    video = `hvc1.1.6.L${v.level}.B0`;
  } else if (v.codec_name === 'av1') {
    const depth = v.pix_fmt.includes('10') ? '10' : '08';
    video = `av01.0.${String(v.level).padStart(2, '0')}M.${depth}`;
  } else {
    throw new Error(`unexpected codec ${v.codec_name}`);
  }
  return hasAudio ? `${video}, mp4a.40.2` : video;
}

async function vmaf(distorted, reference) {
  const { stderr } = await run('ffmpeg', [
    '-hide_banner', '-i', distorted, '-i', reference, '-lavfi',
    `[0:v]setpts=PTS-STARTPTS[d];[1:v]setpts=PTS-STARTPTS,scale=-2:${(await probe(distorted)).streams.find(s => s.codec_type === 'video').height}:flags=bicubic[r];` +
      `[d][r]libvmaf=n_threads=${os.availableParallelism()}:n_subsample=2`,
    '-f', 'null', '-',
  ], { maxBuffer: 64 * 1024 * 1024 });
  const m = stderr.match(/VMAF score: ([\d.]+)/);
  if (!m) throw new Error(`no VMAF score for ${distorted}`);
  return Number(m[1]);
}

async function digest(file) {
  return createHash('sha256').update(await fs.readFile(file)).digest('hex').slice(0, 10);
}

async function main() {
  const srcDir = process.argv[2];
  if (!srcDir) {
    console.error('usage: npm run hub:videos -- "<folder holding the masters>"');
    process.exit(1);
  }
  await fs.mkdir(OUT_DIR, { recursive: true });
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'hub-videos-'));
  const manifest = {};
  const failures = [];

  for (const [hub, name] of Object.entries(MASTERS)) {
    const master = path.join(srcDir, name);
    const info = await probe(master);
    const v = info.streams.find(s => s.codec_type === 'video');
    const entry = {
      width: v.width,
      height: v.height,
      duration: Math.round(Number(info.format.duration) * 10) / 10,
      sources: [],
    };

    for (const r of RENDITIONS) {
      const out = path.join(tmp, `${hub}.${r.id}.mp4`);
      process.stdout.write(`${hub} ${r.id} … `);
      await run('ffmpeg', ['-v', 'error', '-y', '-i', master, ...r.args, '-movflags', '+faststart', out], {
        maxBuffer: 64 * 1024 * 1024,
      });
      const outInfo = await probe(out);
      let score = null;
      if (r.id !== '1080.h264') {
        score = await vmaf(out, master);
        if (score < MIN_VMAF) failures.push(`${hub} ${r.id}: VMAF ${score}`);
      }
      const file = `${hub}.${r.id}.${await digest(out)}.mp4`;
      await fs.copyFile(out, path.join(OUT_DIR, file));
      const { size } = await fs.stat(out);
      entry.sources.push({
        src: `/videos/hubs/${file}`,
        type: `video/mp4; codecs="${codecs(outInfo)}"`,
        ...(r.media ? { media: r.media } : {}),
        bytes: size,
        ...(score !== null ? { vmaf: Math.round(score * 100) / 100 } : {}),
      });
      console.log(`${(size / 1048576).toFixed(2)}MB${score !== null ? `, VMAF ${score.toFixed(2)}` : ''}`);
    }
    manifest[hub] = entry;
  }

  await fs.rm(tmp, { recursive: true, force: true });
  if (failures.length) {
    console.error(`\nBelow VMAF ${MIN_VMAF}, manifest not written:\n  ${failures.join('\n  ')}`);
    process.exit(1);
  }

  // Remove renditions the new manifest no longer names, so old cuts do not
  // pile up in the repo.
  const keep = new Set(Object.values(manifest).flatMap(e => e.sources.map(s => path.basename(s.src))));
  for (const f of await fs.readdir(OUT_DIR)) {
    if (!keep.has(f)) await fs.rm(path.join(OUT_DIR, f));
  }
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\nwrote ${path.relative(PROJECT, MANIFEST)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
