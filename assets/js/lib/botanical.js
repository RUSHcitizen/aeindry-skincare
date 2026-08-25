/**
 * Botanical illustration engine.
 *
 * Every flower, branch, frond and petal on the site is generated here rather
 * than hand-authored as path data: stems are cubic curves, leaves and petals
 * are built from a shared axis/width construction, and a seeded PRNG gives each
 * composition its own natural asymmetry while staying identical between loads.
 *
 * Output is SVG rather than canvas on purpose — these sit in the DOM as
 * oversized, cropped, parallaxed background layers, and need to stay crisp at
 * any scale while taking their colour and blur from CSS.
 */

/* ---------------------------------------------------------------- utilities */

function seeded(seed) {
  let h = 2166136261;
  const str = String(seed);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v) => Math.round(v * 100) / 100;
const rad = (deg) => (deg * Math.PI) / 180;
const pt = (x, y) => ({ x, y });
const add = (a, b) => pt(a.x + b.x, a.y + b.y);
const scale = (v, k) => pt(v.x * k, v.y * k);
const dir = (deg, len) => pt(Math.cos(rad(deg)) * len, Math.sin(rad(deg)) * len);
const perp = (v) => pt(-v.y, v.x);
const norm = (v) => {
  const m = Math.hypot(v.x, v.y) || 1;
  return pt(v.x / m, v.y / m);
};

/* ------------------------------------------------------------------- shapes */

/**
 * A leaf or petal built along an axis.
 * `bulge` moves the widest point along the axis (0.5 = a lens, 0.35 = a leaf
 * that is fattest near the base), `tip` rounds or sharpens the end.
 */
function blade(base, tip_, width, { bulge = 0.42, tip = 0, curl = 0 } = {}) {
  const axis = pt(tip_.x - base.x, tip_.y - base.y);
  const p = perp(norm(axis));
  const curled = add(tip_, scale(p, curl));

  const c1 = add(add(base, scale(axis, bulge * 0.55)), scale(p, width));
  const c2 = add(add(base, scale(axis, 1 - (1 - bulge) * 0.35)), scale(p, width * (0.62 + tip)));
  const c3 = add(add(base, scale(axis, 1 - (1 - bulge) * 0.35)), scale(p, -width * (0.62 + tip)));
  const c4 = add(add(base, scale(axis, bulge * 0.55)), scale(p, -width));

  return `M${n(base.x)} ${n(base.y)}`
    + `C${n(c1.x)} ${n(c1.y)} ${n(c2.x)} ${n(c2.y)} ${n(curled.x)} ${n(curled.y)}`
    + `C${n(c3.x)} ${n(c3.y)} ${n(c4.x)} ${n(c4.y)} ${n(base.x)} ${n(base.y)}Z`;
}

/** Central vein, drawn slightly short of the tip so it reads as a drawing. */
function midrib(base, tip_, curl = 0) {
  const axis = pt(tip_.x - base.x, tip_.y - base.y);
  const p = perp(norm(axis));
  const mid = add(add(base, scale(axis, 0.5)), scale(p, curl * 0.5));
  const end = add(base, scale(axis, 0.9));
  return `M${n(base.x)} ${n(base.y)}Q${n(mid.x)} ${n(mid.y)} ${n(end.x)} ${n(end.y)}`;
}

/** A stem as a single cubic, bowed by `bow` perpendicular to its run. */
function stem(from, to, bow = 0.18) {
  const axis = pt(to.x - from.x, to.y - from.y);
  const p = perp(norm(axis));
  const len = Math.hypot(axis.x, axis.y);
  const c1 = add(add(from, scale(axis, 0.3)), scale(p, len * bow));
  const c2 = add(add(from, scale(axis, 0.72)), scale(p, len * bow * 0.72));
  return `M${n(from.x)} ${n(from.y)}C${n(c1.x)} ${n(c1.y)} ${n(c2.x)} ${n(c2.y)} ${n(to.x)} ${n(to.y)}`;
}

/** Point along that same cubic, so leaves attach exactly on the stem. */
function alongStem(from, to, bow, t) {
  const axis = pt(to.x - from.x, to.y - from.y);
  const p = perp(norm(axis));
  const len = Math.hypot(axis.x, axis.y);
  const c1 = add(add(from, scale(axis, 0.3)), scale(p, len * bow));
  const c2 = add(add(from, scale(axis, 0.72)), scale(p, len * bow * 0.72));
  const u = 1 - t;
  return pt(
    u * u * u * from.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * to.x,
    u * u * u * from.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * to.y
  );
}

/** Tangent angle at t, so a leaf sits at a believable angle to the stem. */
function stemAngle(from, to, bow, t) {
  const a = alongStem(from, to, bow, Math.max(0, t - 0.02));
  const b = alongStem(from, to, bow, Math.min(1, t + 0.02));
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

/* ------------------------------------------------------------ compositions */
/* Each returns { fills:[], lines:[], accents:[] } in a 0..400 square. */

function makeSprig(rand, o) {
  const fills = [], lines = [];
  const from = pt(200, 392);
  const to = pt(200 + (rand() - 0.5) * 90, 30 + rand() * 40);
  const bow = (rand() - 0.5) * 0.34;
  lines.push(stem(from, to, bow));

  const pairs = 5 + Math.floor(rand() * 3);
  for (let i = 0; i < pairs; i++) {
    const t = 0.12 + (i / pairs) * 0.82;
    const at = alongStem(from, to, bow, t);
    const sa = stemAngle(from, to, bow, t);
    const len = (74 - i * 6) * (0.8 + rand() * 0.4) * (o.leaf || 1);
    for (const side of [-1, 1]) {
      const spread = (52 + rand() * 22) * side;
      const tip_ = add(at, dir(sa + spread, len));
      const curl = (rand() - 0.5) * len * 0.16;
      fills.push(blade(at, tip_, len * 0.3, { bulge: 0.38, curl }));
      lines.push(midrib(at, tip_, curl));
    }
  }
  return { fills, lines, accents: [] };
}

function makeFern(rand, o) {
  const fills = [], lines = [];
  const from = pt(200, 394);
  const to = pt(200 + (rand() - 0.5) * 120, 22);
  const bow = 0.16 + rand() * 0.24;
  lines.push(stem(from, to, bow));

  const count = 15 + Math.floor(rand() * 6);
  for (let i = 0; i < count; i++) {
    const t = 0.05 + (i / count) * 0.92;
    const at = alongStem(from, to, bow, t);
    const sa = stemAngle(from, to, bow, t);
    // Leaflets shrink toward the tip, which is what makes a frond read as one.
    const taper = Math.sin((1 - t) * Math.PI * 0.62) * 1.1;
    const len = 62 * taper * (0.85 + rand() * 0.3) * (o.leaf || 1);
    for (const side of [-1, 1]) {
      const tip_ = add(at, dir(sa + (62 + rand() * 14) * side, len));
      fills.push(blade(at, tip_, len * 0.24, { bulge: 0.34, curl: len * 0.1 * side }));
    }
  }
  return { fills, lines, accents: [] };
}

function makeBloom(rand, o) {
  const fills = [], lines = [], accents = [];
  const cx = 200, cy = 200;
  // Filled petals merge into a silhouette when they overlap, and stacked
  // outlines tangle — so a solid bloom gets one clean ring, a drawn one gets
  // two rings pulled far enough apart to stay readable.
  const rings = o.rings || (o.mode === 'solid' ? 1 : 2);
  const petals = o.petals || (6 + Math.floor(rand() * 3));

  for (let r = rings - 1; r >= 0; r--) {
    const ringR = (150 - r * 62) * (o.bloom || 1);
    const offset = r * (180 / petals) + rand() * 12;
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * 360 + offset;
      const inner = add(pt(cx, cy), dir(a, 18 + r * 6));
      const outer = add(pt(cx, cy), dir(a + (rand() - 0.5) * 6, ringR * (0.9 + rand() * 0.18)));
      const w = ringR * (0.26 + rand() * 0.05);
      fills.push(blade(inner, outer, w, { bulge: 0.54, tip: 0.22, curl: (rand() - 0.5) * 8 }));
      if (r === rings - 1) lines.push(midrib(inner, outer, 0));
    }
  }

  // Centre: a disc plus a ring of stamen dots.
  accents.push(`<circle cx="${cx}" cy="${cy}" r="${n(26 * (o.bloom || 1))}"/>`);
  const dots = 10 + Math.floor(rand() * 6);
  for (let i = 0; i < dots; i++) {
    const a = (i / dots) * 360 + rand() * 20;
    const p = add(pt(cx, cy), dir(a, 34 * (o.bloom || 1) + rand() * 10));
    accents.push(`<circle cx="${n(p.x)}" cy="${n(p.y)}" r="${n(3 + rand() * 2.6)}"/>`);
  }
  return { fills, lines, accents };
}

function makeBranch(rand, o) {
  const fills = [], lines = [], accents = [];
  const rise = rand();
  const from = pt(-14 - rand() * 18, 250 + rise * 150);
  const to = pt(380 + rand() * 40, 30 + rand() * 170);
  const bow = (rand() < 0.35 ? 1 : -1) * (0.08 + rand() * 0.28);
  lines.push(stem(from, to, bow));

  const nodes = 4 + Math.floor(rand() * 4);
  const flowerAt = Math.floor(rand() * 3);
  const flowerEvery = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < nodes; i++) {
    // Start past the frame edge so no bloom is drawn half-clipped.
    const t = 0.18 + (i / nodes) * (0.72 + rand() * 0.1);
    const at = alongStem(from, to, bow, t);
    const sa = stemAngle(from, to, bow, t);
    const side = i % 2 === 0 ? -1 : 1;

    if (i % flowerEvery === flowerAt % flowerEvery) {
      // A bloom on a short spur.
      const spur = add(at, dir(sa + 62 * side, 46 + rand() * 26));
      lines.push(stem(at, spur, 0.12 * side));
      const petals = 5 + Math.floor(rand() * 3);
      const size = Math.max(26, (34 + rand() * 18)) * (o.bloom || 1);
      for (let p = 0; p < petals; p++) {
        const a = (p / petals) * 360 + rand() * 20;
        const tip_ = add(spur, dir(a, size * (0.85 + rand() * 0.3)));
        fills.push(blade(spur, tip_, size * 0.36, { bulge: 0.58, tip: 0.22 }));
      }
      accents.push(`<circle cx="${n(spur.x)}" cy="${n(spur.y)}" r="${n(size * 0.2)}"/>`);
    } else {
      const len = (76 + rand() * 34) * (o.leaf || 1);
      const tip_ = add(at, dir(sa + (46 + rand() * 20) * side, len));
      const curl = (rand() - 0.5) * len * 0.2;
      fills.push(blade(at, tip_, len * 0.32, { bulge: 0.4, curl }));
      lines.push(midrib(at, tip_, curl));
    }
  }
  return { fills, lines, accents };
}

function makeSpray(rand, o) {
  const fills = [], lines = [];
  const origin = pt(200, 380);
  const blades = 7 + Math.floor(rand() * 4);
  for (let i = 0; i < blades; i++) {
    const a = -168 + (i / (blades - 1)) * 156 + (rand() - 0.5) * 10;
    const len = (158 + rand() * 96) * (o.leaf || 1);
    const tip_ = add(origin, dir(a, len));
    const curl = (rand() - 0.5) * len * 0.2;
    fills.push(blade(origin, tip_, len * 0.2, { bulge: 0.5, tip: 0.14, curl }));
    lines.push(midrib(origin, tip_, curl));
  }
  return { fills, lines, accents: [] };
}

function makeSeedStem(rand, o) {
  const fills = [], lines = [], accents = [];
  const from = pt(200, 396);
  const to = pt(200 + (rand() - 0.5) * 70, 70);
  const bow = (rand() - 0.5) * 0.3;
  lines.push(stem(from, to, bow));

  const seeds = 16 + Math.floor(rand() * 10);
  for (let i = 0; i < seeds; i++) {
    const t = 0.45 + (i / seeds) * 0.58;
    if (t > 1) continue;
    const at = alongStem(from, to, bow, Math.min(1, t));
    const sa = stemAngle(from, to, bow, Math.min(1, t));
    const side = i % 2 === 0 ? -1 : 1;
    const len = (26 + rand() * 16) * (o.leaf || 1);
    const tip_ = add(at, dir(sa + (66 + rand() * 22) * side, len));
    fills.push(blade(at, tip_, len * 0.42, { bulge: 0.5, tip: 0.2 }));
  }
  // A few loose seeds drifting off the head.
  for (let i = 0; i < 5; i++) {
    const p = pt(200 + (rand() - 0.5) * 220, 40 + rand() * 150);
    accents.push(`<circle cx="${n(p.x)}" cy="${n(p.y)}" r="${n(2.4 + rand() * 3)}"/>`);
  }
  return { fills, lines, accents };
}

function makePetals(rand, o) {
  const fills = [], lines = [];
  const count = o.count || 7;
  const placed = [];
  let guard = 0;

  while (placed.length < count && guard++ < 300) {
    const len = (66 + rand() * 46) * (o.leaf || 1);
    const c = pt(50 + rand() * 300, 50 + rand() * 300);
    // Petals that overlap read as one merged blob once filled — keep them apart.
    const clear = placed.every((q) => Math.hypot(q.c.x - c.x, q.c.y - c.y) > (q.len + len) * 0.46);
    if (!clear) continue;
    placed.push({ c, len, a: rand() * 360 });
  }

  for (const { c, len, a } of placed) {
    const tip_ = add(c, dir(a, len));
    const curl = (rand() - 0.5) * len * 0.1;
    fills.push(blade(c, tip_, len * 0.34, { bulge: 0.5, tip: 0.18, curl }));
    lines.push(midrib(c, tip_, curl));
  }
  return { fills, lines, accents: [] };
}

function makeArc(rand, o) {
  const fills = [], lines = [];
  const cx = 200, cy = 400, r = 300;
  const count = 16 + Math.floor(rand() * 6);
  for (let i = 0; i < count; i++) {
    const a = -172 + (i / (count - 1)) * 164;
    const at = add(pt(cx, cy), dir(a, r));
    const len = (54 + rand() * 30) * (o.leaf || 1);
    const tip_ = add(at, dir(a + (rand() - 0.5) * 34, len));
    fills.push(blade(at, tip_, len * 0.3, { bulge: 0.4, curl: (rand() - 0.5) * 10 }));
  }
  if (o.mode !== 'solid') lines.push(`M${n(cx - r)} ${n(cy)}A${n(r)} ${n(r)} 0 0 1 ${n(cx + r)} ${n(cy)}`);
  return { fills, lines, accents: [] };
}

const KINDS = {
  sprig: makeSprig,
  fern: makeFern,
  bloom: makeBloom,
  branch: makeBranch,
  spray: makeSpray,
  seedstem: makeSeedStem,
  petals: makePetals,
  arc: makeArc
};

export const BOTANICAL_KINDS = Object.keys(KINDS);

/**
 * Render a botanical composition.
 *
 * @param {string} kind   one of BOTANICAL_KINDS
 * @param {object} opts
 *   seed    — any string; the same seed always draws the same plant
 *   mode    — 'line' (stroke only), 'solid' (filled), 'duo' (filled + veins)
 *   stroke  — line weight in viewBox units
 *   className, style, rotate, flip
 * @returns {string} SVG markup
 */
export function botanical(kind, opts = {}) {
  const o = { mode: 'line', stroke: 1.6, ...opts };
  // generators branch on o.mode — structure differs between drawn and filled
  const rand = seeded(o.seed ?? kind);
  const make = KINDS[kind] || makeSprig;
  const { fills, lines, accents } = make(rand, o);

  const transform = [
    o.flip ? 'translate(400 0) scale(-1 1)' : '',
    o.rotate ? `rotate(${o.rotate} 200 200)` : ''
  ].filter(Boolean).join(' ');

  let body = '';
  if (o.mode === 'solid') {
    body =
      `<g fill="currentColor" stroke="none">${fills.map((d) => `<path d="${d}"/>`).join('')}` +
      `${accents.join('')}</g>` +
      `<g fill="none" stroke="currentColor" stroke-width="${o.stroke}" stroke-linecap="round">` +
      `${lines.map((d) => `<path d="${d}"/>`).join('')}</g>`;
  } else if (o.mode === 'duo') {
    body =
      `<g fill="currentColor" fill-opacity="0.5" stroke="none">${fills.map((d) => `<path d="${d}"/>`).join('')}</g>` +
      `<g fill="none" stroke="currentColor" stroke-width="${o.stroke}" stroke-linecap="round" stroke-linejoin="round">` +
      `${[...lines, ...fills].map((d) => `<path d="${d}"/>`).join('')}</g>` +
      `<g fill="currentColor" stroke="none">${accents.join('')}</g>`;
  } else {
    body =
      `<g fill="none" stroke="currentColor" stroke-width="${o.stroke}" stroke-linecap="round" stroke-linejoin="round">` +
      `${[...fills, ...lines].map((d) => `<path d="${d}"/>`).join('')}</g>` +
      `<g fill="currentColor" stroke="none">${accents.join('')}</g>`;
  }

  return `<svg class="${o.className || 'botanical'}" viewBox="0 0 400 400" fill="none" aria-hidden="true"
    preserveAspectRatio="${o.fit || 'xMidYMid meet'}"${o.style ? ` style="${o.style}"` : ''}>
    ${transform ? `<g transform="${transform}">${body}</g>` : body}
  </svg>`;
}

/**
 * A decorative layer: a positioned, tinted, parallaxed botanical.
 * `place` is a CSS inset shorthand; everything else is presentation.
 */
export function botanicalLayer(kind, {
  seed, mode = 'line', stroke = 1.6, rotate = 0, flip = false,
  place = 'auto auto auto auto', size = '40vw', tone = 'var(--bot-ink)',
  opacity = 0.14, blur = 0, parallax = 0.1, drift = 0, z = 0, className = ''
} = {}) {
  const style = [
    `inset:${place}`,
    `width:${size}`,
    `color:${tone}`,
    `opacity:${opacity}`,
    blur ? `filter:blur(${blur}px)` : '',
    `z-index:${z}`
  ].filter(Boolean).join(';');

  return `<div class="bot-layer ${className}" style="${style}"
    ${parallax ? `data-parallax="${parallax}"` : ''}
    ${drift ? `data-drift="${drift}"` : ''} aria-hidden="true">
    ${botanical(kind, { seed, mode, stroke, rotate, flip })}
  </div>`;
}
