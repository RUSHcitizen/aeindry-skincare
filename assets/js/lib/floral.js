/**
 * Soft floral engine — the blooms that make up the site's backdrop.
 *
 * A separate engine from `botanical.js`, and deliberately so. The botanicals
 * are drawings: stroked line and watercolour wash, sitting behind individual
 * sections as ornament you are meant to notice. These are the opposite —
 * filled, modelled, near-colourless forms that build one quiet ground for the
 * whole site, closer to a still life than an illustration.
 *
 * Everything here is constructed from the shared primitives in `geom.js`:
 * a petal is a `blade`, a branch is a bowed cubic, and the seeded PRNG means a
 * given arrangement is identical on every load. Shading comes from a small set
 * of object-bounding-box gradients defined once per composition — each petal is
 * modelled along its own box, which is what keeps a fan of them from reading as
 * one flat silhouette. No noise, no turbulence, no displacement: the ground has
 * to stay clean at any zoom.
 */

import {
  seeded, n, pt, add, dir,
  blade, midrib, stem, alongStem, stemAngle
} from './geom.js';

/* Every form draws inside a 0..200 box. Stemmed forms grow upward from the
   bottom edge; face-on forms are centred. */
const BOX = 200;

/**
 * The gradients and one soft shadow, defined once per composition.
 * Ids are prefixed so several compositions can share a document.
 */
export function floralDefs(P, id = 'f') {
  return `<defs>` +
    // Petal, lit from the upper left — the light in the reference is soft and
    // high, so the fall-off is long and the terminator never gets hard.
    `<linearGradient id="${id}p" x1="0.15" y1="0" x2="0.8" y2="1">` +
      `<stop offset="0" stop-color="${P.petalLit}"/>` +
      `<stop offset="0.55" stop-color="${P.petal}"/>` +
      `<stop offset="1" stop-color="${P.petalShade}"/>` +
    `</linearGradient>` +
    // The same petal turned away: starts where the lit one ends.
    `<linearGradient id="${id}q" x1="0.2" y1="0" x2="0.85" y2="1">` +
      `<stop offset="0" stop-color="${P.petal}"/>` +
      `<stop offset="0.6" stop-color="${P.petalShade}"/>` +
      `<stop offset="1" stop-color="${P.petalDeep}"/>` +
    `</linearGradient>` +
    `<linearGradient id="${id}l" x1="0.1" y1="0" x2="0.9" y2="1">` +
      `<stop offset="0" stop-color="${P.leaf}"/>` +
      `<stop offset="1" stop-color="${P.leafShade}"/>` +
    `</linearGradient>` +
    `<radialGradient id="${id}h" cx="0.42" cy="0.38" r="0.7">` +
      `<stop offset="0" stop-color="${P.heartLit}"/>` +
      `<stop offset="1" stop-color="${P.heart}"/>` +
    `</radialGradient>` +
  `</defs>`;
}

/* --------------------------------------------------------------- utilities */

const path = (d, attrs) => `<path d="${d}" ${attrs}/>`;

/**
 * A petal or leaf: a filled blade with a hairline holding its edge.
 *
 * Fill and stroke on the one element, not a fill path with a stroke path drawn
 * over it. The result is identical — a centred stroke paints over the fill's
 * own edge either way — and it halves the path data, which matters when the
 * whole arrangement has to travel as a single data URI.
 */
function shape(d, fill, line, lineOp = 0.5, lineW = 0.9) {
  return path(d, `fill="${fill}" stroke="${line}" stroke-width="${lineW}" stroke-opacity="${lineOp}"`);
}

/** A handful of stamens: short hairs from the centre, each tipped with a dot. */
function stamens(rand, P, centre, count, reach, id) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * 360 + rand() * 26;
    const len = reach * (0.6 + rand() * 0.5);
    const tip = add(centre, dir(a, len));
    const ctrl = add(centre, dir(a - 14, len * 0.6));
    out += `<path d="M${n(centre.x)} ${n(centre.y)}Q${n(ctrl.x)} ${n(ctrl.y)} ${n(tip.x)} ${n(tip.y)}" ` +
      `fill="none" stroke="${P.heart}" stroke-width="1" stroke-opacity="0.55"/>`;
    out += `<circle cx="${n(tip.x)}" cy="${n(tip.y)}" r="${n(1.1 + rand() * 0.9)}" fill="${P.heart}" fill-opacity="0.8"/>`;
  }
  out += `<circle cx="${n(centre.x)}" cy="${n(centre.y)}" r="${n(reach * 0.34)}" fill="url(#${id}h)"/>`;
  return out;
}

/* ------------------------------------------------------------------- forms */

/**
 * A cupped bloom seen from the side — the tulip-and-lisianthus shape that
 * carries most of the weight in an arrangement like this.
 *
 * The petals are drawn outermost first so the near ones overlap the far ones,
 * and the two rows take different gradients: without that the fan flattens into
 * a single silhouette the moment it is scaled down.
 */
function makeCup(rand, P, id) {
  const base = pt(BOX / 2 + (rand() - 0.5) * 26, BOX);
  const neck = pt(BOX / 2 + (rand() - 0.5) * 30, 104 - rand() * 14);
  const bow = (rand() - 0.5) * 0.34;
  let out = path(stem(base, neck, bow),
    `fill="none" stroke="${P.stem}" stroke-width="2.6" stroke-linecap="round" stroke-opacity="0.9"`);

  // Two sepals clasping the base of the cup.
  for (const side of [-1, 1]) {
    const tip = add(neck, dir(90 + side * 46, 24 + rand() * 12));
    out += shape(blade(neck, tip, 3.6, { bulge: 0.34, tip: 0.1 }), `url(#${id}l)`, P.leafLine, 0.22);
  }

  const count = 5 + Math.floor(rand() * 3);
  // A narrow fan. Opened much past this the petals stop overlapping and the
  // flower reads as a flat star rather than something with a throat.
  const spread = 66 + rand() * 26;
  const lean = (rand() - 0.5) * 22;
  // Farthest from the centre of the fan gets drawn first.
  const order = [...Array(count).keys()]
    .sort((a, b) => Math.abs(b - (count - 1) / 2) - Math.abs(a - (count - 1) / 2));

  for (const i of order) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const centrality = 1 - Math.abs(t - 0.5) * 2;          // 0 at the edges, 1 mid
    const angle = -90 + lean + (t - 0.5) * spread;
    // Outer petals stand tallest and flare away at the tip; the inner ones are
    // shorter and stay upright, which is what closes the throat.
    const len = 66 + (1 - centrality) * 18 + rand() * 12;
    const tip = add(neck, dir(angle, len));
    const curl = (t - 0.5) * 34 * (1 - centrality * 0.5);
    // A cup, not a star: the petals close over the centre, so the outer ones
    // are narrower and the middle ones broad.
    const d = blade(neck, tip, 16 + centrality * 11, { bulge: 0.58, tip: 0.46, curl });
    out += shape(d, centrality > 0.45 ? `url(#${id}p)` : `url(#${id}q)`, P.petalLine, 0.42);
  }
  return out;
}

/**
 * An open flower seen face on. Six broad petals and a pale gold heart —
 * the magnolia-ish note that stops an arrangement being all closed cups.
 */
function makeOpen(rand, P, id) {
  const c = pt(BOX / 2 + (rand() - 0.5) * 18, BOX / 2 + (rand() - 0.5) * 18);
  const count = 5 + Math.floor(rand() * 3);
  const turn = rand() * 360;
  const squash = 0.7 + rand() * 0.3;                       // a little foreshortening
  let out = '';
  for (let i = 0; i < count; i++) {
    const a = turn + (i / count) * 360;
    const len = (58 + rand() * 16) * (i % 2 ? squash : 1);
    const tip = add(c, dir(a, len));
    out += shape(blade(c, tip, 21 + rand() * 7, { bulge: 0.5, tip: 0.46, curl: (rand() - 0.5) * 14 }),
      i % 2 ? `url(#${id}q)` : `url(#${id}p)`, P.petalLine, 0.4);
  }
  return out + stamens(rand, P, c, 7, 15, id);
}

/** A small five-petal star, the kind that comes in twos and threes. */
function makeBlossom(rand, P, id) {
  const c = pt(BOX / 2, BOX / 2);
  const r = 34 + rand() * 10;
  let out = '';
  for (let i = 0; i < 5; i++) {
    const a = rand() * 30 + (i / 5) * 360;
    const tip = add(c, dir(a, r));
    out += shape(blade(c, tip, 15, { bulge: 0.52, tip: 0.6 }), `url(#${id}p)`, P.petalLine, 0.36);
  }
  return out + `<circle cx="${n(c.x)}" cy="${n(c.y)}" r="${n(r * 0.17)}" fill="url(#${id}h)"/>`;
}

/**
 * Gypsophila — the cloud of tiny buds on hair-thin branching stems.
 *
 * Recursive: each branch splits into two or three shorter ones at a narrowing
 * angle, and whatever is left at the last level gets a bud. It is the one form
 * here that carries texture rather than shape, and it is what keeps the
 * arrangement from looking like a small number of large objects.
 */
function makeGyp(rand, P) {
  const root = pt(BOX / 2, BOX);
  let out = '';

  const branch = (from, angle, len, depth) => {
    const to = add(from, dir(angle, len));
    const bow = (rand() - 0.5) * 0.3;
    out = path(stem(from, to, bow),
      `fill="none" stroke="${P.stem}" stroke-width="${n(0.5 + depth * 0.45)}" ` +
      `stroke-linecap="round" stroke-opacity="0.75"`) + out;
    if (depth <= 0) {
      const r = 2.4 + rand() * 2.2;
      out += `<circle cx="${n(to.x)}" cy="${n(to.y)}" r="${n(r)}" fill="${P.seed}"/>` +
        `<circle cx="${n(to.x - r * 0.3)}" cy="${n(to.y - r * 0.3)}" r="${n(r * 0.45)}" ` +
        `fill="${P.petalLit}" fill-opacity="0.75"/>`;
      return;
    }
    const forks = 2 + (rand() < 0.4 ? 1 : 0);
    for (let i = 0; i < forks; i++) {
      const spread = 46 - depth * 6;
      const a = angle + (forks === 1 ? 0 : (i / (forks - 1) - 0.5) * spread) + (rand() - 0.5) * 16;
      branch(alongStem(from, to, bow, 0.72 + rand() * 0.28), a, len * (0.52 + rand() * 0.2), depth - 1);
    }
  };

  branch(root, -90 + (rand() - 0.5) * 20, 62 + rand() * 16, 3);
  return out;
}

/**
 * A eucalyptus sprig — an arcing stem hung with round-ish paired leaves.
 * These are the only real colour in the backdrop, and even then barely: a
 * grey-green that sits a few points off the ground it lies on.
 */
function makeEuc(rand, P, id) {
  const from = pt(14 + rand() * 20, BOX - 10);
  const to = pt(BOX - 30 + rand() * 24, 18 + rand() * 34);
  const bow = 0.14 + rand() * 0.24;
  let out = path(stem(from, to, bow),
    `fill="none" stroke="${P.stem}" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.85"`);

  const pairs = 4 + Math.floor(rand() * 3);
  for (let i = 0; i < pairs; i++) {
    const t = 0.12 + (i / pairs) * 0.82;
    const at = alongStem(from, to, bow, t);
    const ang = stemAngle(from, to, bow, t);
    // Not quite opposite, and not the same size: real pairs are offset and one
    // of the two is usually the smaller. Equal discs either side of the stem
    // is what makes drawn eucalyptus look stamped rather than grown.
    const short = rand() < 0.5 ? -1 : 1;
    for (const side of [-1, 1]) {
      const off = side * (62 + rand() * 32);
      const len = (25 + rand() * 13 + (1 - t) * 9) * (side === short ? 0.74 : 1);
      const tip = add(at, dir(ang + off, len));
      const d = blade(at, tip, len * (0.33 + rand() * 0.1), { bulge: 0.46, tip: 0.5 });
      out += shape(d, `url(#${id}l)`, P.leafLine, 0.32);
      out += path(midrib(at, tip), `fill="none" stroke="${P.leafLine}" stroke-width="0.7" stroke-opacity="0.4"`);
    }
  }
  return out;
}

/** A bud: three petals wrapped tight, still holding their sepals. */
function makeBud(rand, P, id) {
  const base = pt(BOX / 2, BOX);
  const neck = pt(BOX / 2 + (rand() - 0.5) * 24, 96 - rand() * 16);
  const bow = (rand() - 0.5) * 0.3;
  let out = path(stem(base, neck, bow),
    `fill="none" stroke="${P.stem}" stroke-width="2.4" stroke-linecap="round" stroke-opacity="0.9"`);

  for (const side of [-1, 1]) {
    const tip = add(neck, dir(90 + side * 40, 20 + rand() * 10));
    out += shape(blade(neck, tip, 3.2, { bulge: 0.34, tip: 0.1 }), `url(#${id}l)`, P.leafLine, 0.22);
  }
  const lean = (rand() - 0.5) * 18;
  for (const [angle, width, fill] of [
    [-90 + lean - 15, 13, `url(#${id}q)`],
    [-90 + lean + 15, 13, `url(#${id}q)`],
    [-90 + lean, 16, `url(#${id}p)`]
  ]) {
    const tip = add(neck, dir(angle, 54 + rand() * 14));
    out += shape(blade(neck, tip, width, { bulge: 0.62, tip: 0.4 }), fill, P.petalLine, 0.4);
  }
  return out;
}

const KINDS = {
  cup: makeCup,
  open: makeOpen,
  blossom: makeBlossom,
  gyp: makeGyp,
  euc: makeEuc,
  bud: makeBud
};

export const FLORAL_KINDS = Object.keys(KINDS);

/**
 * One form's markup, in a 0..200 box, ready to drop inside an `<svg>` or `<g>`.
 * The caller owns positioning and the `<defs>` — see `floralDefs`.
 */
export function floralForm(kind, { seed = 'a', palette, defsId = 'f', rotate = 0, flip = false } = {}) {
  const make = KINDS[kind] || makeCup;
  const body = make(seeded(`${kind}:${seed}`), palette, defsId);
  const t = [
    rotate ? `rotate(${n(rotate)} ${BOX / 2} ${BOX / 2})` : '',
    flip ? `translate(${BOX} 0) scale(-1 1)` : ''
  ].filter(Boolean).join(' ');
  return t ? `<g transform="${t}">${body}</g>` : body;
}

export const FLORAL_BOX = BOX;
