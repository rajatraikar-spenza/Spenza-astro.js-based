// Hero and body images in the Spenza house style.
//
// Consistency is the point, so it is enforced three ways rather than hoped for:
//  1. Every prompt starts from the style guide's own "paste first" / "HERO" blocks
//     (the same wording the team has used by hand), and the body image is generated
//     WITH the reference illustration attached, so the model matches a picture, not
//     just words.
//  2. A vision pass (Claude) checks each result against the guide's QA checklist
//     (palette, no infographic look, labels spelled exactly, nothing cropped) and the
//     image is regenerated with the objections appended, up to three tries.
//  3. The hero is never drawn by the model: only the line-art panel is. The logo,
//     pills and Rhodium Libre title come from the live cover template, so a title can
//     never be misspelled and every hero shares one frame.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HERE, 'assets');
export const REFERENCE = path.join(ASSETS, 'style-reference.jpg');

const BODY_BLOCK = `Create one illustration in the exact style of the attached reference image: a painterly editorial scene on a full-bleed textured orange background (#FF4500 with a soft lighter glow upper right and fine paper grain), a faint darker-orange silhouette landscape behind (hills, trees, a cell tower, a skyline, thin clouds), and 3 to 5 chunky, softly rounded, paper-cut objects in cream (#F3EDE4), charcoal (#2B2B2B) and grey (#6B7280) with at most one small gold (#F2B233) accent, each with a soft contact shadow. Show relationships with broad cream swoosh ribbon arrows. It must NOT be an infographic: no flowchart, no boxes, no numbered badges, no tables, no icon grids, no thin arrows. No people, no photos, no logos, no watermark. Use only the labels listed below, at most two short words each, bold charcoal Bricolage Grotesque, in clear space below or beside objects and never overlapping anything, spelled exactly as given. If no labels are listed, include no text at all. Leave a margin of empty orange around the edges.`;

const HERO_BLOCK = `Create one illustration panel: a rounded rectangle filled with warm near-white (#FFF4EC) containing sparse orange line art in #FF4500 (clean outlines about 6 px, rounded caps) of the objects described below, with at most one small solid accent fill in #FF8E64. Lots of empty space around and between the objects, even inner margin. Flat: no grain, no glow, no gradients, no shadows, no background scenery, no brown. No text of any kind, no logos, no people, no photos.`;

export const bodyPrompt = ({ scene, labels, objections = [] }) => [
  BODY_BLOCK,
  `Scene: ${scene}`,
  labels.length ? `Labels, exactly as written: ${labels.map(l => `"${l}"`).join(', ')}.` : 'Labels: none. Draw no text at all.',
  'Compose within the central 16:9 band of a 3:2 canvas: keep every object and label away from the top and bottom 12 percent.',
  ...(objections.length ? [`The previous attempt was rejected for: ${objections.join('; ')}. Fix exactly these.`] : []),
].join('\n\n');

export const heroPrompt = ({ objects, objections = [] }) => [
  HERO_BLOCK,
  `Objects, drawn left to right with generous spacing: ${objects.join('; ')}.`,
  'Keep all artwork inside the central 4:3 area of a 3:2 canvas, with an even margin.',
  ...(objections.length ? [`The previous attempt was rejected for: ${objections.join('; ')}. Fix exactly these.`] : []),
].join('\n\n');

// ---- generation -------------------------------------------------------------

/** OpenAI image generation. `reference` switches to the edits endpoint so the picture is matched, not just described. */
export function openaiImageGen({ apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1', fetchImpl = fetch } = {}) {
  return async function gen({ prompt, reference }) {
    let res;
    if (reference) {
      const form = new FormData();
      form.append('model', model);
      form.append('prompt', prompt);
      form.append('size', '1536x1024');
      form.append('quality', 'high');
      form.append('image', new Blob([fs.readFileSync(reference)], { type: 'image/jpeg' }), path.basename(reference));
      res = await fetchImpl('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { authorization: `Bearer ${apiKey}` }, body: form });
    } else {
      res = await fetchImpl('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, prompt, size: '1536x1024', quality: 'high', n: 1 }),
      });
    }
    if (!res.ok) throw new Error(`OpenAI images ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error('OpenAI images: no image in the response');
    return Buffer.from(b64, 'base64');
  };
}

// ---- QA ----------------------------------------------------------------------

export const QA_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['pass', 'issues'],
  properties: { pass: { type: 'boolean' }, issues: { type: 'array', items: { type: 'string' } } },
};

export async function qaImage({ llm, png, kind, labels = [] }) {
  const small = await sharp(png).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  const rules = kind === 'hero'
    ? 'A HERO panel: warm near-white rounded panel (#FFF4EC), sparse orange (#FF4500) outline line art with at most one small solid accent, flat (no grain, glow, gradient, shadow, scenery), NO text at all, no people, no logos, no brown, even margin, nothing cropped.'
    : `A BODY image: full-bleed textured orange ramp (#FF4500 to #C63600, soft glow upper right, paper grain), a faint darker-orange silhouette landscape, 3 to 5 chunky paper-cut cream/charcoal/grey objects joined by broad cream ribbons, NOT an infographic (no boxes, flowcharts, numbered badges, tables, icon grids, thin arrows), no brown, no people, no logos, nothing cropped at the edges. Labels allowed: ${labels.length ? labels.map(l => `"${l}"`).join(', ') : 'NONE (no text at all)'}; each must be spelled exactly and not overlap anything.`;
  return llm.ask({
    label: `image-qa:${kind}`, schema: QA_SCHEMA, effort: 'medium',
    images: [{ mediaType: 'image/jpeg', base64: small.toString('base64') }],
    system: 'You are a strict art director checking a generated blog illustration against a house style. List only real violations; do not nitpick taste.',
    user: `Style rules for this image:\n${rules}\n\nCheck every rule, especially the spelling of any visible text and whether anything is cropped by the edges. pass is true only if there are no violations.`,
  });
}

// ---- finishing ---------------------------------------------------------------

/** Crop the centre 4:3 out of a 3:2 hero panel, then to the template's expected margin. */
export async function heroPanel(png) {
  const m = await sharp(png).metadata();
  const w = Math.round(m.height * 4 / 3);
  return sharp(png).extract({ left: Math.round((m.width - w) / 2), top: 0, width: Math.min(w, m.width), height: m.height }).resize(1600, 1200, { fit: 'cover' }).png().toBuffer();
}

export const bodyCrop = png => sharp(png).resize(1600, 900, { fit: 'cover', position: 'centre' }).png().toBuffer();

export async function toWebp(png, { maxBytes = 200_000 } = {}) {
  for (let q = 82; q >= 50; q -= 8) {
    const buf = await sharp(png).webp({ quality: q, effort: 6 }).toBuffer();
    if (buf.length <= maxBytes || q <= 50) return buf;
  }
}

function chromePath() {
  const candidates = [process.env.CHROME_PATH, 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  for (const c of candidates) {
    if (c.includes('/') && fs.existsSync(c)) return c;
    if (!c.includes('/')) { try { execFileSync('which', [c], { stdio: 'ignore' }); return c; } catch { /* next */ } }
  }
  throw new Error('No Chrome found to render the hero. Install Chrome or set CHROME_PATH.');
}

/**
 * Hero = the live cover template (logo, pills, Rhodium Libre title) with the panel dropped in.
 * Same geometry as the spenza-blog skill's compose_hero.py, so heroes match the existing ones.
 */
export async function composeHero({ panelPng, titleLines, chrome = chromePath() }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hero-'));
  const crop = await sharp(panelPng).metadata().then(m => sharp(panelPng).extract({
    left: Math.round(m.width * 0.025), top: Math.round(m.height * 0.033),
    width: Math.round(m.width * 0.95), height: Math.round(m.height * 0.934),
  }).png().toBuffer());
  const panel = path.join(dir, 'panel.png');
  fs.writeFileSync(panel, crop);
  fs.copyFileSync(path.join(ASSETS, 'template.png'), path.join(dir, 'template.png'));
  fs.copyFileSync(path.join(ASSETS, 'hero2.html'), path.join(dir, 'hero2.html'));

  const [top, fs_] = titleLines.length >= 4 ? [232, 31] : [250, 33];
  const q = new URLSearchParams({ t: titleLines.join('|'), img: pathToFileURL(panel).href, x: '665', y: '150', w: '570', top: String(top), fs: String(fs_), r: '22' });
  const out = path.join(dir, 'hero.png');
  execFileSync(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    '--force-device-scale-factor=1', '--window-size=1280,720', '--virtual-time-budget=8000', `--screenshot=${out}`,
    `${pathToFileURL(path.join(dir, 'hero2.html')).href}?${q}`], { stdio: 'ignore', timeout: 60000 });
  return sharp(out).extract({ left: 0, top: 0, width: 1280, height: 720 }).png().toBuffer();
}

// ---- the stage ----------------------------------------------------------------

/**
 * @returns {{hero: Buffer, body: Buffer, notes: string[]}|null}  webp buffers; null when skipped
 */
export async function makeImages({ llm, plan, gen, compose = composeHero, maxTries = 3, log = () => {} }) {
  const notes = [];
  async function attempt(kind, build, finish) {
    let objections = [];
    for (let i = 1; i <= maxTries; i++) {
      log(`images: ${kind} attempt ${i}`);
      const raw = await gen({ prompt: build(objections), reference: kind === 'body' ? REFERENCE : undefined });
      const png = await finish(raw);
      const qa = await qaImage({ llm, png, kind, labels: kind === 'body' ? plan.bodyLabels : [] });
      if (qa.pass) return png;
      objections = qa.issues;
      notes.push(`${kind} attempt ${i} rejected: ${qa.issues.join('; ')}`);
    }
    throw new Error(`The ${kind} image failed the style check ${maxTries} times: ${objections.join('; ')}`);
  }
  const panel = await attempt('hero', o => heroPrompt({ objects: plan.heroObjects, objections: o }), heroPanel);
  const body = await attempt('body', o => bodyPrompt({ scene: plan.bodyScene, labels: plan.bodyLabels, objections: o }), bodyCrop);
  const hero = await compose({ panelPng: panel, titleLines: plan.heroTitleLines });
  return { hero: await toWebp(hero), body: await toWebp(body), notes };
}
