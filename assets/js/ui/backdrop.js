/**
 * The floral ground the whole site sits on.
 *
 * Composed as a frame rather than a field: blooms gather at the corners and
 * thin along the edges, and the middle is left clear because that is where
 * every line of body copy on the site lands. It is one flat image, not a tree
 * of live SVG nodes — a viewport-sized layer has to re-composite on every
 * scrolled frame, and doing that over a few hundred stroked shapes costs about
 * a third of the frame budget; as a single cached bitmap the compositor has one
 * texture to blend.
 *
 * The pigments are baked in at build time, which a data URI forces (it cannot
 * see custom properties) and which is safe here for the same reason it is safe
 * for the botanicals: the flowers are near-white and the leaves are a
 * grey-green, so the identical artwork reads as tone-on-tone on the ivory
 * ground and as pale blooms in the dark. Only the layer's opacity changes
 * between themes, and that lives in CSS.
 */

import { floralForm, floralDefs, FLORAL_BOX } from '../lib/floral.js';
import { seeded, n } from '../lib/geom.js';
import { clamp, lerp, prefersReducedMotion } from '../lib/dom.js';
import { scrollBus } from '../core/scroll.js';

/* A wide field, sliced rather than stretched. The proportions are close enough
   to a laptop viewport that the frame still reads as a frame once cropped. */
const FIELD_W = 1600;
const FIELD_H = 1000;

/**
 * Where the arrangement gathers.
 *
 *   x, y     centre of the cluster, as a fraction of the field
 *   rx, ry   how far its forms scatter from that centre
 *   n        how many
 *   rot      base rotation — stemmed forms grow up out of their own box, so
 *            this is what makes them hang from the top edge or lean in from
 *            the side — plus `spin` degrees of jitter either way
 *   w        form width as a fraction of the field, [min, max]
 *   kinds    drawn from in order, cycling
 *
 * The four corners carry the weight; the edge clusters are there to stop the
 * corners reading as four separate bouquets.
 */
const CLUSTERS = [
  // The four corners carry the arrangement. Their centres sit well inside the
  // field: pinned to the very edge, half of every form falls off the canvas and
  // the frame thins to a fringe.
  { x: 0.09, y: 0.10, rx: 0.17, ry: 0.23, n: 11, rot: 143, spin: 44, w: [0.13, 0.26],
    kinds: ['euc', 'cup', 'gyp', 'open', 'euc', 'blossom', 'bud', 'cup', 'gyp', 'euc', 'open'] },
  { x: 0.91, y: 0.08, rx: 0.16, ry: 0.22, n: 11, rot: 212, spin: 42, w: [0.12, 0.25],
    kinds: ['euc', 'open', 'gyp', 'cup', 'blossom', 'euc', 'bud', 'gyp', 'cup', 'euc', 'blossom'] },
  { x: 0.10, y: 0.91, rx: 0.18, ry: 0.21, n: 11, rot: 29, spin: 44, w: [0.13, 0.27],
    kinds: ['euc', 'open', 'cup', 'gyp', 'euc', 'blossom', 'cup', 'bud', 'gyp', 'euc', 'open'] },
  { x: 0.90, y: 0.93, rx: 0.17, ry: 0.20, n: 10, rot: -30, spin: 42, w: [0.12, 0.25],
    kinds: ['euc', 'cup', 'gyp', 'open', 'blossom', 'euc', 'bud', 'cup', 'gyp', 'euc'] },

  // Edges — smaller and sparser, and their only job is to carry the eye from
  // one corner to the next so the four do not read as four separate bouquets.
  { x: 0.38, y: 0.04, rx: 0.14, ry: 0.09, n: 5, rot: 176, spin: 34, w: [0.09, 0.17],
    kinds: ['gyp', 'blossom', 'cup', 'euc', 'gyp'] },
  { x: 0.66, y: 0.03, rx: 0.12, ry: 0.08, n: 4, rot: 188, spin: 32, w: [0.08, 0.15],
    kinds: ['blossom', 'gyp', 'open', 'euc'] },
  { x: 0.58, y: 0.96, rx: 0.16, ry: 0.09, n: 5, rot: 5, spin: 34, w: [0.09, 0.18],
    kinds: ['gyp', 'cup', 'blossom', 'euc', 'gyp'] },
  { x: 0.30, y: 0.97, rx: 0.13, ry: 0.08, n: 4, rot: -7, spin: 30, w: [0.08, 0.15],
    kinds: ['blossom', 'gyp', 'bud', 'euc'] },
  { x: 0.03, y: 0.47, rx: 0.07, ry: 0.15, n: 4, rot: 72, spin: 30, w: [0.09, 0.17],
    kinds: ['euc', 'gyp', 'blossom', 'euc'] },
  { x: 0.97, y: 0.53, rx: 0.07, ry: 0.15, n: 4, rot: -74, spin: 30, w: [0.09, 0.17],
    kinds: ['euc', 'blossom', 'gyp', 'euc'] },

  // A thin scatter between the frame and the clear middle. Without it the
  // density falls off a cliff, and a hard boundary in the artwork is worse
  // than the artwork itself: the eye finds the edge and then looks for the
  // shape it belongs to. These are small enough never to sit under a line of
  // type, and they turn the cliff into a slope.
  { x: 0.25, y: 0.31, rx: 0.10, ry: 0.11, n: 3, rot: 150, spin: 90, w: [0.045, 0.085],
    kinds: ['blossom', 'gyp', 'blossom'] },
  { x: 0.75, y: 0.27, rx: 0.10, ry: 0.11, n: 3, rot: 200, spin: 90, w: [0.045, 0.085],
    kinds: ['gyp', 'blossom', 'blossom'] },
  { x: 0.22, y: 0.71, rx: 0.10, ry: 0.11, n: 3, rot: 20, spin: 90, w: [0.045, 0.085],
    kinds: ['blossom', 'blossom', 'gyp'] },
  { x: 0.79, y: 0.74, rx: 0.10, ry: 0.11, n: 3, rot: -20, spin: 90, w: [0.045, 0.09],
    kinds: ['gyp', 'blossom', 'blossom'] }
];

/* Stacking, back to front — the greenery lies under the flowers the way it does
   when an arrangement is laid out by hand. */
const DEPTH = { euc: 0, gyp: 1, bud: 2, blossom: 3, cup: 4, open: 5 };

/** The floral pigments, read once off the document. */
function palette() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  return {
    petalLit:   v('--fl-petal-lit', '#FDFCFA'),
    petal:      v('--fl-petal', '#F5F3EE'),
    petalShade: v('--fl-petal-shade', '#DEDACF'),
    petalDeep:  v('--fl-petal-deep', '#C9C4B6'),
    petalLine:  v('--fl-petal-line', '#B5AF9F'),
    leaf:       v('--fl-leaf', '#C6C8BC'),
    leafShade:  v('--fl-leaf-shade', '#A3A697'),
    leafLine:   v('--fl-leaf-line', '#8B8E7C'),
    stem:       v('--fl-stem', '#9A9384'),
    seed:       v('--fl-seed', '#D2CCBF'),
    heart:      v('--fl-heart', '#D8C08A'),
    heartLit:   v('--fl-heart-lit', '#F0E4C4')
  };
}

/**
 * Build the arrangement as one SVG data URI.
 * Exported so the composition can be rendered and inspected on its own.
 */
export function backdropImage(seed = 'bloom', { width = FIELD_W, height = FIELD_H } = {}) {
  const rand = seeded(seed);
  const P = palette();
  const placed = [];

  for (const c of CLUSTERS) {
    for (let i = 0; i < c.n; i++) {
      const kind = c.kinds[i % c.kinds.length];
      // Scatter on a disc rather than a rectangle, so a cluster reads as a
      // gathering and not as a grid cell.
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand());
      const w = (c.w[0] + rand() * (c.w[1] - c.w[0])) * width;
      placed.push({
        kind,
        seed: `${seed}-${c.x}-${i}`,
        w,
        x: (c.x + Math.cos(a) * r * c.rx) * width - w / 2,
        y: (c.y + Math.sin(a) * r * c.ry) * height - w / 2,
        rot: c.rot + (rand() - 0.5) * c.spin * 2,
        flip: rand() < 0.5
      });
    }
  }

  placed.sort((a, b) => (DEPTH[a.kind] ?? 3) - (DEPTH[b.kind] ?? 3));

  const forms = placed.map((f) =>
    `<svg x="${n(f.x)}" y="${n(f.y)}" width="${n(f.w)}" height="${n(f.w)}" ` +
    `viewBox="0 0 ${FLORAL_BOX} ${FLORAL_BOX}" overflow="visible">` +
    `${floralForm(f.kind, { seed: f.seed, palette: P, rotate: f.rot, flip: f.flip })}</svg>`
  ).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
    `preserveAspectRatio="xMidYMid slice">${floralDefs(P)}${forms}</svg>`;
  return `url("${dataUri(svg)}")`;
}

/**
 * Pack the arrangement into a data URI.
 *
 * `encodeURIComponent` is the obvious call and the wrong one: it percent-encodes
 * every quote, angle bracket and space, which on a document that is mostly
 * markup and path data costs about a third again in size. A data URI only needs
 * `%` and `#` escaped, and swapping double quotes for single ones — safe, since
 * no attribute value here contains an apostrophe — leaves the rest as literal
 * text. Trimming coordinates to one decimal is the other half of the saving: on
 * a form drawn in a 200-unit box, the digits past it are a twentieth of a pixel.
 */
function dataUri(svg) {
  const compact = svg.replace(/(\d\.\d)\d+/g, '$1');
  return 'data:image/svg+xml,' + compact
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/"/g, "'");
}

/**
 * Mount the backdrop.
 *
 * Appended last so it paints over the opaque section grounds and under every
 * content wrap. It is a frame, and a frame that races the content is just
 * wallpaper, so all it does across the whole document is settle a few percent
 * of a viewport downward — enough to feel like you are rising past it.
 *
 * The motion is a translate and not a scale on purpose. Scaling this layer
 * measured three frames a second slower: the artwork is a bitmap the size of
 * the screen, and a new scale means re-rasterising it every frame, where a
 * translate is a compositor move the page never pays for. The art is drawn a
 * little larger than its box (see .backdrop__art) so the travel never pulls an
 * edge into view.
 */
export function installBackdrop(seed = 'bloom') {
  const layer = document.createElement('div');
  layer.className = 'backdrop';
  layer.setAttribute('aria-hidden', 'true');
  const art = document.createElement('div');
  art.className = 'backdrop__art';
  art.style.backgroundImage = backdropImage(seed);
  layer.appendChild(art);
  document.body.appendChild(layer);

  if (prefersReducedMotion()) return () => {};

  let raf = null, want = 0, have = 0;
  const draw = () => {
    have = lerp(have, want, 0.08);
    art.style.transform = `translate3d(0, ${(have * 2.6).toFixed(3)}vh, 0)`;
    raf = Math.abs(want - have) > 0.0004 ? requestAnimationFrame(draw) : null;
  };
  const off = scrollBus.on('scroll', ({ y }) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    want = clamp(max > 0 ? y / max : 0, 0, 1);
    if (!raf) raf = requestAnimationFrame(draw);
  });
  return () => { off(); if (raf) cancelAnimationFrame(raf); };
}
