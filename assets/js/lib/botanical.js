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

import {
  seeded, n, rad, pt, add, scale, dir, perp, norm,
  blade, midrib, stem, alongStem, stemAngle
} from './geom.js';

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
 *   mode    — 'line' (stroke only), 'solid' (filled), 'duo' (filled + veins),
 *             'wash' (watercolour: pigment pooling under a loose ink edge)
 *   stroke  — line weight in viewBox units
 *   className, style, rotate, flip
 * @returns {string} SVG markup
 */
/* ------------------------------------------------------- watercolour edge */

/* Filter ids have to be unique per document, and these SVGs are inlined many
   times over. Seed plus a counter keeps them stable within a render and
   distinct between instances. */
let washSeq = 0;

/**
 * A turbulence displacement that ruffles a fill's edge the way pigment creeps
 * along paper fibres, plus a soft blur so the colour pools instead of sitting
 * flat. `grain` is the fibre scale, `bleed` how far the pigment wanders.
 */
function washFilter(id, { grain = 0.028, bleed = 9, blur = 1.6, octaves = 3 } = {}) {
  return `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${grain}" numOctaves="${octaves}" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="${bleed}" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation="${blur}"/>
  </filter>`;
}

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
  let defs = '';
  if (o.mode === 'wash') {
    /* Painted the way the logo is, in the order a brush would do it:
         1. a loose underwash in the second pigment, wandering past the edge
         2. the body colour, pulled in and ruffled by its own turbulence
         3. a rim — the same outline as a wide soft stroke, which is what
            gives real watercolour its darker edge where pigment strands
         4. the ink drawing over the top, once the colour has settled.
       --bot-alt supplies the second pigment; without one both passes take
       currentColor and the form simply reads as a single-colour wash. */
    const id = `w${(washSeq++).toString(36)}${String(o.seed ?? kind).replace(/[^a-z0-9]/gi, '').slice(0, 8)}`;
    defs = `<defs>${washFilter(id, o.wash)}` +
      `${washFilter(id + 'b', { grain: 0.05, bleed: 16, blur: 4.2, octaves: 2 })}` +
      `${washFilter(id + 'r', { grain: 0.09, bleed: 5, blur: 2.2, octaves: 2 })}</defs>`;
    const shapes = fills.map((d) => `<path d="${d}"/>`).join('');
    body =
      `<g filter="url(#${id}b)" fill="var(--bot-alt, currentColor)" fill-opacity="${o.washBleed ?? 0.34}" stroke="none">${shapes}</g>` +
      `<g filter="url(#${id})" fill="currentColor" fill-opacity="${o.washFill ?? 0.4}" stroke="none">${shapes}</g>` +
      `<g filter="url(#${id}r)" fill="none" stroke="currentColor" stroke-opacity="${o.washRim ?? 0.34}" ` +
      `stroke-width="${(o.stroke || 1.6) * 3.4}" stroke-linejoin="round">${shapes}</g>` +
      `<g fill="none" stroke="currentColor" stroke-opacity="${o.washInk ?? 0.66}" stroke-width="${o.stroke}" ` +
      `stroke-linecap="round" stroke-linejoin="round">` +
      `${[...lines, ...fills].map((d) => `<path d="${d}"/>`).join('')}</g>` +
      `<g fill="currentColor" stroke="none">${accents.join('')}</g>`;
  } else if (o.mode === 'solid') {
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
    ${defs}${transform ? `<g transform="${transform}">${body}</g>` : body}
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
