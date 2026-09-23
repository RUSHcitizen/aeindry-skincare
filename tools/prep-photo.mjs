#!/usr/bin/env node
/**
 * Turn a camera photo into the set of web assets the site actually serves.
 *
 *   node tools/prep-photo.mjs <input> <out-dir> <basename> [--widths 1600,900,480]
 *                                                          [--quality 0.82]
 *                                                          [--crop x,y,w,h]
 *                                                          [--fit contain|cover|pad|trim --ratio 4:5]
 *                                                          [--pad-color '#FFFFFF']
 *                                                          [--lossless] [--alpha-floor 6]
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
    '[--widths 1600,900,480] [--quality 0.82] [--crop x,y,w,h] ' +
    '[--fit cover|pad|trim --ratio 4:5] [--pad-color \'#FFFFFF\'] [--lossless] [--alpha-floor 6]');
  process.exit(2);
}

const widths = String(flag('widths', '1600,900,480')).split(',').map(Number).sort((a, b) => b - a);
const quality = Number(flag('quality', 0.82));
const fit = flag('fit', 'contain');
const ratio = flag('ratio', '');
const cropArg = flag('crop', '');
const padColor = flag('pad-color', '#FFFFFF');
const alphaFloor = Number(flag('alpha-floor', 6));
const lossless = args.includes('--lossless');

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

const results = await page.evaluate(async ({ dataUrl, widths, quality, fit, ratio,
                                             cropArg, padColor, alphaFloor, lossless }) => {
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
     `cover` takes the largest centred rectangle of the requested ratio; `pad`
     keeps the whole frame and adds ground around it to reach the ratio. */
  let cx = 0, cy = 0, cw = SW, ch = SH;

  /* An explicit rectangle runs before everything else, so a listing screenshot
     with three panels in it can be reduced to the one panel that is a
     photograph. Values are pixels, or percentages of the source when suffixed
     with %. */
  if (cropArg) {
    const parts = cropArg.split(',').map((v) => v.trim());
    if (parts.length !== 4) {
      console.error(`--crop wants four values (x,y,w,h); got "${cropArg}"`);
      process.exit(2);
    }
    const [rx, ry, rw, rh] = parts.map((v, i) => {
      const span = i % 2 === 0 ? SW : SH;
      return Math.round(v.endsWith('%') ? (parseFloat(v) / 100) * span : parseFloat(v));
    });
    cx = Math.max(0, Math.min(SW - 1, rx));
    cy = Math.max(0, Math.min(SH - 1, ry));
    cw = Math.max(1, Math.min(SW - cx, rw));
    ch = Math.max(1, Math.min(SH - cy, rh));
    if (cw !== rw || ch !== rh) {
      console.error(`  note: --crop clipped to the source (${cw}x${ch} from ${rw}x${rh})`);
    }
  }
  if (fit === 'trim') {
    /* Everything outside the ink is empty pixels that still cost bytes and,
       worse, shrink the subject inside its own box. */
    let x0 = SW, x1 = 0, y0 = SH, y1 = 0;
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
      if (S[(y * SW + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    if (x1 >= x0) {
      const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.015);
      cx = Math.max(0, x0 - pad); cy = Math.max(0, y0 - pad);
      cw = Math.min(SW - cx, x1 - x0 + 1 + pad * 2);
      ch = Math.min(SH - cy, y1 - y0 + 1 + pad * 2);
    }
  }
  if (fit === 'cover' && ratio) {
    const [rw, rh] = ratio.split(':').map(Number);
    if (rw > 0 && rh > 0) {
      const want = rw / rh;
      const w0 = cw, h0 = ch, x0 = cx, y0 = cy;
      if (w0 / h0 > want) { cw = Math.round(h0 * want); cx = x0 + Math.round((w0 - cw) / 2); }
      else { ch = Math.round(w0 / want); cy = y0 + Math.round((h0 - ch) / 2); }
    }
  }

  /* `pad` is `contain` that keeps its promise. Padding a shot taken on a white
     sweep out to a square adds white beside white — the seam is invisible and
     the subject keeps its proportions, where `cover` would have cut the ends
     off a wide arrangement. Padding a shot on any other ground would band
     visibly, which is why the colour is a required decision, not a default
     applied blindly. */
  let padTo = null;
  /* `trim` with a ratio squares the trimmed subject up rather than leaving it
     at whatever aspect its own ink happened to have. A mark needs both: trim
     to find the artwork, then pad so the icon is square and the artwork is
     centred in it. */
  if (fit === 'trim' && ratio) {
    const [rw, rh] = ratio.split(':').map(Number);
    if (rw > 0 && rh > 0) {
      const want = rw / rh;
      padTo = cw / ch > want
        ? { w: cw, h: Math.round(cw / want) }
        : { w: Math.round(ch * want), h: ch };
    }
  }
  if (fit === 'pad' && ratio) {
    const [rw, rh] = ratio.split(':').map(Number);
    if (rw > 0 && rh > 0) {
      const want = rw / rh;
      padTo = cw / ch > want
        ? { w: cw, h: Math.round(cw / want) }
        : { w: Math.round(ch * want), h: ch };
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
        /* Premultiplied. Averaging colour without weighting by alpha lets a
           fully transparent pixel's colour vote as loudly as an opaque one,
           which is what puts a pale halo around a knocked-out subject. */
        let r = 0, g = 0, b = 0, a = 0, n = 0;
        for (let yy = y0; yy < y1; yy++) {
          let i = (yy * SW + x0) * 4;
          for (let xx = x0; xx < x1; xx++, i += 4) {
            const w = S[i + 3] / 255;
            r += toLinear[S[i]] * w; g += toLinear[S[i + 1]] * w; b += toLinear[S[i + 2]] * w;
            a += S[i + 3]; n++;
          }
        }
        const o = (y * W + x) * 4;
        const am = (a / n) / 255;
        // Back to straight alpha, so the encoder and the compositor agree.
        px[o] = am > 0 ? (r / n) / am : 0;
        px[o + 1] = am > 0 ? (g / n) / am : 0;
        px[o + 2] = am > 0 ? (b / n) / am : 0;
        px[o + 3] = a / n;
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

    /* Snap the transparent ground to exactly clear.
       A lossy encoder treats alpha as just another channel to approximate, so
       a knocked-out subject comes back with a percent of the frame sitting at
       alpha 1-8 — invisible on a matching ground, a faint rectangle the size of
       the image on any other. Flattening it first both removes the haze and
       gives the encoder a large uniform region to compress. */
    let snapped = 0;
    for (let i = 0; i < W * H; i++) {
      if (dst[i * 4 + 3] > 0 && dst[i * 4 + 3] <= alphaFloor) {
        dst[i * 4] = dst[i * 4 + 1] = dst[i * 4 + 2] = dst[i * 4 + 3] = 0;
        snapped++;
      }
    }

    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    c.getContext('2d').putImageData(new ImageData(dst, W, H), 0, 0);

    /* Pad last, at output scale, on a canvas filled with the ground colour.
       Doing it here rather than on the source means the padding is exact — no
       resampling runs over the seam to soften it into a visible edge. */
    let outW = W, outH = H, canvas = c;
    if (padTo) {
      outW = W;
      outH = Math.max(1, Math.round((padTo.h / padTo.w) * W));
      const pc = document.createElement('canvas');
      pc.width = outW; pc.height = outH;
      const ctx = pc.getContext('2d');
      /* "transparent" pads with nothing, which is what a mark with its own
         alpha wants — a favicon squared up on a colour would carry that
         colour into every tab that is not the same shade. */
      if (padColor !== 'transparent' && padColor !== 'none') {
        ctx.fillStyle = padColor;
        ctx.fillRect(0, 0, outW, outH);
      }
      ctx.drawImage(c, Math.round((outW - W) / 2), Math.round((outH - H) / 2));
      canvas = pc;
    }

    // Lossless keeps alpha exact; worth it for a mark, wasteful for a photo.
    const url = lossless ? canvas.toDataURL('image/png')
                         : canvas.toDataURL('image/webp', quality);
    out.push({ w: outW, h: outH, url, ext: lossless ? '.png' : '.webp', snapped });
  }
  return { source: `${SW}x${SH}`, crop: `${cw}x${ch}`, out };
}, { dataUrl, widths, quality, fit, ratio, cropArg, padColor, alphaFloor, lossless });

console.log(`${input}  source ${results.source}` +
  (results.crop !== results.source ? `  cropped to ${results.crop}` : ''));
if (!results.out.length) {
  console.error(`  nothing written — every requested width exceeds the source (${results.crop}).`);
  await browser.close();
  process.exit(1);
}
for (const r of results.out) {
  const file = join(outDir, `${basename}-${r.w}${r.ext}`);
  writeFileSync(file, Buffer.from(r.url.split(',')[1], 'base64'));
  console.log(`  ${r.w}x${r.h}  ${(statSync(file).size / 1024).toFixed(0)} KB` +
    (r.snapped ? `  (${r.snapped} near-clear px snapped)` : '') + `  ${resolve(file)}`);
}
await browser.close();
