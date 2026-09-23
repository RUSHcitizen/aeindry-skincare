#!/usr/bin/env node
/**
 * Lift a small, JPEG-compressed image off its white background and resample it
 * up cleanly. Written for the Aeindry wreath, which arrived as a 204x192 JPEG
 * on solid white; it applies just as well to product photography shot on a
 * white sweep.
 *
 * The problem with the naive approach — threshold the white, scale up — is
 * that JPEG ringing around every stroke survives as isolated half-transparent
 * pixels, and those read as grain the moment the image is enlarged. The
 * supplied wreath had 1104 of them, 2.8% of the image.
 *
 *   1. bilateral denoise     smooth the 8x8 ringing, leave the strokes alone
 *   2. soft key off white    a ramp, not a threshold — watercolour really fades
 *   3. flood from the border travel through near-white to find the ground by
 *                            where it is, not by how light it is, so pale
 *                            pigment enclosed by the artwork is never eaten
 *   4. despeckle             drop faint pixels with no solid pigment near them
 *   5. un-blend the edges    recover true colour from the white it was mixed
 *                            into, or edges go milky on a coloured ground
 *   6. Catmull-Rom upscale   on premultiplied RGBA, or edges grow halos
 *   7. light unsharp         restore the definition resampling costs
 *
 * Rendering runs inside headless Chromium purely for its image decoders and
 * canvas. The site itself stays dependency-free; this is a build-time tool, so
 * Playwright only has to be resolvable when you run it:
 *
 *   npm i -D playwright   (or point NODE_PATH at an existing install)
 *
 * Usage:
 *   node tools/remaster-art.mjs <input> <output.png> [scale] [--webp out.webp]
 *
 * Example — how assets/img/logo-wreath.webp was produced:
 *   node tools/remaster-art.mjs assets/img/logo-wreath-source.jpg \
 *        assets/img/logo-wreath.png 4 --webp assets/img/logo-wreath.webp
 *
 * CHROMIUM_PATH overrides the browser binary when Playwright's own download is
 * not present.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const [input, output, scaleArg, ...rest] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node tools/remaster-art.mjs <input> <output.png> [scale] [--webp <out.webp>]');
  process.exit(1);
}
const SCALE = Number(scaleArg) || 4;
const webpAt = rest.indexOf('--webp');
const webpOut = webpAt >= 0 ? rest[webpAt + 1] : null;

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const mime = MIME[extname(input).toLowerCase()];
if (!mime) { console.error(`unsupported input type: ${extname(input)}`); process.exit(1); }
const dataUrl = `data:${mime};base64,${readFileSync(resolve(input)).toString('base64')}`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined
});
const page = await browser.newPage();

const result = await page.evaluate(async ([dataUrl, SCALE, wantWebp]) => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;

  const c0 = document.createElement('canvas');
  c0.width = W; c0.height = H;
  const g0 = c0.getContext('2d', { willReadFrequently: true });
  g0.drawImage(img, 0, 0);
  const src = g0.getImageData(0, 0, W, H).data;

  const idx = (x, y) => (y * W + x) * 4;
  const clampi = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;

  /* ---- 1. bilateral denoise -------------------------------------------- */
  const den = new Float32Array(W * H * 3);
  const SIGMA_R = 26;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = idx(x, y);
      let wsum = 0, ar = 0, ag = 0, ab = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = clampi(x + dx, 0, W - 1), ny = clampi(y + dy, 0, H - 1);
          const j = idx(nx, ny);
          const diff = Math.abs(src[j] - src[i]) + Math.abs(src[j + 1] - src[i + 1])
                     + Math.abs(src[j + 2] - src[i + 2]);
          const w = Math.exp(-(dx * dx + dy * dy) / 4) * Math.exp(-(diff * diff) / (2 * SIGMA_R * SIGMA_R));
          wsum += w; ar += src[j] * w; ag += src[j + 1] * w; ab += src[j + 2] * w;
        }
      }
      const k = (y * W + x) * 3;
      den[k] = ar / wsum; den[k + 1] = ag / wsum; den[k + 2] = ab / wsum;
    }
  }

  /* ---- 2. soft key ------------------------------------------------------ */
  const LO = 14, HI = 46;
  const alpha = new Float32Array(W * H);
  const dist = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    dist[i] = 255 - Math.min(den[i * 3], den[i * 3 + 1], den[i * 3 + 2]);
    alpha[i] = clampi((dist[i] - LO) / (HI - LO), 0, 1);
  }

  /* ---- 3. flood the ground away from the border ------------------------- */
  const GROUND = 30;
  const isGround = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const i = stack.pop();
    if (isGround[i] || dist[i] > GROUND) continue;
    isGround[i] = 1;
    const x = i % W, y = (i / W) | 0;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - W);
    if (y < H - 1) stack.push(i + W);
  }
  let flooded = 0;
  for (let i = 0; i < W * H; i++) if (isGround[i] && alpha[i] > 0) { alpha[i] = 0; flooded++; }

  /* ---- 4. despeckle ----------------------------------------------------- */
  /* Ground enclosed by the artwork is only reachable through gaps, so faint
     pixels with no real pigment within a few px go too. */
  const near = (x, y, r) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      if (alpha[ny * W + nx] > 0.6) return true;
    }
    return false;
  };
  const cleaned = Float32Array.from(alpha);
  let despeckled = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (alpha[i] > 0 && alpha[i] < 0.34 && !near(x, y, 3)) { cleaned[i] = 0; despeckled++; }
  }

  /* ---- 5. un-blend the partial edges ------------------------------------ */
  const rgba = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const a = cleaned[i];
    if (a <= 0) continue;
    for (let ch = 0; ch < 3; ch++) {
      const obs = den[i * 3 + ch];
      rgba[i * 4 + ch] = clampi(a < 0.98 ? (obs - 255 * (1 - a)) / a : obs, 0, 255);
    }
    rgba[i * 4 + 3] = Math.round(a * 255);
  }

  /* ---- 6. Catmull-Rom upscale on premultiplied RGBA ---------------------- */
  const OW = W * SCALE, OH = H * SCALE;
  const pre = new Float32Array(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const a = rgba[i * 4 + 3] / 255;
    pre[i * 4] = rgba[i * 4] * a;
    pre[i * 4 + 1] = rgba[i * 4 + 1] * a;
    pre[i * 4 + 2] = rgba[i * 4 + 2] * a;
    pre[i * 4 + 3] = rgba[i * 4 + 3];
  }
  const cr = (t) => {
    const x = Math.abs(t);
    if (x < 1) return 1.5 * x * x * x - 2.5 * x * x + 1;
    if (x < 2) return -0.5 * x * x * x + 2.5 * x * x - 4 * x + 2;
    return 0;
  };
  const big = new Float32Array(OW * OH * 4);
  for (let oy = 0; oy < OH; oy++) {
    const sy = (oy + 0.5) / SCALE - 0.5, y0 = Math.floor(sy);
    for (let ox = 0; ox < OW; ox++) {
      const sx = (ox + 0.5) / SCALE - 0.5, x0 = Math.floor(sx);
      let wsum = 0; const acc = [0, 0, 0, 0];
      for (let m = -1; m <= 2; m++) {
        const wy = cr(sy - (y0 + m)); if (!wy) continue;
        const yy = clampi(y0 + m, 0, H - 1);
        for (let n = -1; n <= 2; n++) {
          const wx = cr(sx - (x0 + n)); if (!wx) continue;
          const xx = clampi(x0 + n, 0, W - 1);
          const w = wx * wy, j = (yy * W + xx) * 4;
          acc[0] += pre[j] * w; acc[1] += pre[j + 1] * w;
          acc[2] += pre[j + 2] * w; acc[3] += pre[j + 3] * w;
          wsum += w;
        }
      }
      const o = (oy * OW + ox) * 4;
      for (let ch = 0; ch < 4; ch++) big[o + ch] = acc[ch] / wsum;
    }
  }

  /* ---- 7. unsharp, then un-premultiply ---------------------------------- */
  const out = new Uint8ClampedArray(OW * OH * 4);
  const P = (x, y, ch) => big[(clampi(y, 0, OH - 1) * OW + clampi(x, 0, OW - 1)) * 4 + ch];
  const AMT = 0.42;
  for (let y = 0; y < OH; y++) {
    for (let x = 0; x < OW; x++) {
      const o = (y * OW + x) * 4;
      const a = big[o + 3];
      for (let ch = 0; ch < 3; ch++) {
        const blur = (P(x - 1, y, ch) + P(x + 1, y, ch) + P(x, y - 1, ch) + P(x, y + 1, ch)) / 4;
        const sharp = big[o + ch] + (big[o + ch] - blur) * AMT;
        out[o + ch] = a > 1 ? clampi(sharp / (a / 255), 0, 255) : 0;
      }
      out[o + 3] = clampi(a, 0, 255);
    }
  }

  const c1 = document.createElement('canvas');
  c1.width = OW; c1.height = OH;
  c1.getContext('2d').putImageData(new ImageData(out, OW, OH), 0, 0);

  let opaque = 0;
  for (let i = 3; i < out.length; i += 4) if (out[i] > 0) opaque++;

  return {
    png: c1.toDataURL('image/png'),
    webp: wantWebp ? c1.toDataURL('image/webp', 0.92) : null,
    w: OW, h: OH, from: `${W}x${H}`, flooded, despeckled,
    coverage: +(opaque / (OW * OH) * 100).toFixed(1)
  };
}, [dataUrl, SCALE, !!webpOut]);

const png = Buffer.from(result.png.split(',')[1], 'base64');
writeFileSync(resolve(output), png);
console.log(`${result.from} -> ${result.w}x${result.h}`);
console.log(`  flooded ${result.flooded} ground px, despeckled ${result.despeckled}`);
console.log(`  ${result.coverage}% of the output carries pigment`);
console.log(`  ${output}  ${(png.length / 1024).toFixed(0)} KB`);
if (webpOut) {
  const webp = Buffer.from(result.webp.split(',')[1], 'base64');
  writeFileSync(resolve(webpOut), webp);
  console.log(`  ${webpOut}  ${(webp.length / 1024).toFixed(0)} KB`);
}
await browser.close();
