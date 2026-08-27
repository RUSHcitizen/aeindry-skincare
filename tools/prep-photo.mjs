#!/usr/bin/env node
/**
 * Turn a camera photo into the set of web assets the site actually serves.
 *
 *   node tools/prep-photo.mjs <input> <out-dir> <basename> [--widths 1600,900,480]
 *                                                          [--quality 0.82]
 *                                                          [--fit contain|cover --ratio 4:5]
 *
 * Companion to remaster-art.mjs, which exists for a different job: that one
 * knocks a subject off a white ground and scales it *up*. This one only ever
 * scales down, and downscaling is where most naive pipelines fall over.
 *
 * Two things it does that a plain canvas drawImage does not:
 *
 *   Area averaging. Going from 4000px to 900px, every output pixel covers
 *   about twenty input pixels. Bilinear sampling reads four of them and throws
 *   the rest away, which is aliasing — the moiré you see on fabric weave and
 *   the crawling edges on a label's type. Averaging the whole footprint is
 *   both correct and, at these ratios, cheaper than a windowed filter.
 *
 *   Linear light. sRGB is a perceptual curve, so averaging its values directly
 *   darkens every edge it touches; a white-on-dark label loses weight and a
 *   backlit rim goes muddy. Values are linearised before the average and
 *   re-encoded after.
 *
 * Orientation is left to the decoder: Chromium honours the EXIF tag when it
 * draws an <img>, so a portrait phone photo arrives upright without the tag
 * ever being read here.
 *
 * Requires Playwright resolvable from the working directory.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { resolve, extname, join } from 'node:path';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const positional = args.filter((a, i) =>
  !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));

const [input, outDir, basename] = positional;
if (!input || !outDir || !basename) {
  console.error('usage: prep-photo.mjs <input> <out-dir> <basename> ' +
    '[--widths 1600,900,480] [--quality 0.82] [--fit cover --ratio 4:5]');
  process.exit(2);
}

const widths = String(flag('widths', '1600,900,480')).split(',').map(Number).sort((a, b) => b - a);
const quality = Number(flag('quality', 0.82));
const fit = flag('fit', 'contain');
const ratio = flag('ratio', '');

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
               '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' };
const ext = extname(input).toLowerCase();
if (!MIME[ext]) {
  console.error(`unsupported input '${ext}'. This box has no HEIC decoder — ` +
    'export as JPEG or PNG first.');
  process.exit(2);
}

mkdirSync(outDir, { recursive: true });
const dataUrl = `data:${MIME[ext]};base64,${readFileSync(input).toString('base64')}`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
});
const page = await browser.newPage();

const results = await page.evaluate(async ({ dataUrl, widths, quality, fit, ratio }) => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();

  /* Chromium applies the EXIF rotation while decoding, so these are the
     dimensions as a human would see the photo, not as the sensor wrote it. */
  const SW = img.naturalWidth, SH = img.naturalHeight;

  // Read once at full size; every output is derived from this one buffer.
  const src = document.createElement('canvas');
  src.width = SW; src.height = SH;
  src.getContext('2d').drawImage(img, 0, 0);
  const S = src.getContext('2d').getImageData(0, 0, SW, SH).data;

  /* sRGB transfer, both directions. A 256-entry table because every pixel of a
     twelve-megapixel photo goes through the forward one. */
  const toLinear = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const c = i / 255;
    toLinear[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  const fromLinear = (v) => {
    const c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(c * 255)));
  };

  /* The crop window, in source pixels. `contain` keeps the whole frame;
     `cover` takes the largest centred rectangle of the requested ratio. */
  let cx = 0, cy = 0, cw = SW, ch = SH;
  if (fit === 'cover' && ratio) {
    const [rw, rh] = ratio.split(':').map(Number);
    if (rw > 0 && rh > 0) {
      const want = rw / rh;
      if (SW / SH > want) { cw = Math.round(SH * want); cx = Math.round((SW - cw) / 2); }
      else { ch = Math.round(SW / want); cy = Math.round((SH - ch) / 2); }
    }
  }

  const out = [];
  for (const W of widths) {
    if (W > cw) continue;                       // never invent detail
    const H = Math.max(1, Math.round((ch / cw) * W));
    const px = new Float32Array(W * H * 4);

    /* Area average in linear light. Each output pixel takes the mean of every
       source pixel whose centre falls inside its footprint. */
    const sx = cw / W, sy = ch / H;
    for (let y = 0; y < H; y++) {
      const y0 = cy + Math.floor(y * sy), y1 = Math.min(cy + ch, cy + Math.ceil((y + 1) * sy));
      for (let x = 0; x < W; x++) {
        const x0 = cx + Math.floor(x * sx), x1 = Math.min(cx + cw, cx + Math.ceil((x + 1) * sx));
        let r = 0, g = 0, b = 0, a = 0, n = 0;
        for (let yy = y0; yy < y1; yy++) {
          let i = (yy * SW + x0) * 4;
          for (let xx = x0; xx < x1; xx++, i += 4) {
            r += toLinear[S[i]]; g += toLinear[S[i + 1]]; b += toLinear[S[i + 2]];
            a += S[i + 3]; n++;
          }
        }
        const o = (y * W + x) * 4;
        px[o] = r / n; px[o + 1] = g / n; px[o + 2] = b / n; px[o + 3] = a / n;
      }
    }

    /* A light unsharp, in linear light too, to put back the acutance the
       average costs. Scaled to the reduction: a big downscale needs more. */
    const amount = Math.min(0.5, 0.18 + (cw / W) * 0.06);
    const at = (x, y, c) => px[((y < 0 ? 0 : y >= H ? H - 1 : y) * W +
                                (x < 0 ? 0 : x >= W ? W - 1 : x)) * 4 + c];
    const dst = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4;
        for (let c = 0; c < 3; c++) {
          const blur = (at(x - 1, y, c) + at(x + 1, y, c) + at(x, y - 1, c) + at(x, y + 1, c)) / 4;
          dst[o + c] = fromLinear(Math.max(0, px[o + c] + (px[o + c] - blur) * amount));
        }
        dst[o + 3] = Math.round(px[o + 3]);
      }
    }

    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    c.getContext('2d').putImageData(new ImageData(dst, W, H), 0, 0);
    out.push({ w: W, h: H, webp: c.toDataURL('image/webp', quality) });
  }
  return { source: `${SW}x${SH}`, crop: `${cw}x${ch}`, out };
}, { dataUrl, widths, quality, fit, ratio });

console.log(`${input}  source ${results.source}` +
  (results.crop !== results.source ? `  cropped to ${results.crop}` : ''));
if (!results.out.length) {
  console.error(`  nothing written — every requested width exceeds the source (${results.crop}).`);
  await browser.close();
  process.exit(1);
}
for (const r of results.out) {
  const file = join(outDir, `${basename}-${r.w}.webp`);
  writeFileSync(file, Buffer.from(r.webp.split(',')[1], 'base64'));
  console.log(`  ${r.w}x${r.h}  ${(statSync(file).size / 1024).toFixed(0)} KB  ${resolve(file)}`);
}
await browser.close();
