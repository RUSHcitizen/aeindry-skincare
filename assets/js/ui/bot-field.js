/**
 * Botanical fields — the artwork living behind each section.
 *
 * A field is a set of positioned botanical layers. Each layer carries two
 * independent motions: scroll parallax and a cursor lean, both folded into a
 * single JS-written transform on the outer element, and an ambient sway that
 * stays in CSS on the inner element. Keeping them on separate nodes means
 * neither can clobber the other.
 */

import { botanical } from '../lib/botanical.js';
import { clamp, lerp, prefersReducedMotion, isTouch } from '../lib/dom.js';
import { scrollBus } from '../core/scroll.js';

/**
 * Markup for one botanical layer.
 *
 * @param {object} L
 *   kind, seed, mode      — passed to botanical()
 *   x, y                  — CSS position, any unit ('-8%', 'auto')
 *   w                     — width, usually a vw value so it scales with the page
 *   rot, flip             — orientation
 *   op                    — opacity; these sit behind text, so keep it low
 *   tone                  — a --bot-* token
 *   alt                   — second pigment, used by mode:'wash' for the bleed
 *   blur                  — px, for layers meant to sit far back
 *   par                   — parallax factor; negative moves against the scroll
 *   cur                   — cursor lean in px at full deflection
 *   sway, swayDeg, delay  — ambient motion
 *   mobile                — 'hide' drops it on small screens
 */
export function botLayer(L = {}) {
  const {
    kind = 'sprig', seed = 'a', mode = 'line', stroke = 1.5,
    x = 'auto', y = 'auto', right = 'auto', bottom = 'auto',
    w = '28vw', rot = 0, flip = false,
    op = 0.14, tone = 'var(--bot-ink)', alt = '', blur = 0,
    par = 0.12, cur = 0, sway = 22, swayDeg = 1.6, delay = 0,
    breathe = false, origin = '50% 90%', mobile = ''
  } = L;

  const style = [
    `left:${x}`, `top:${y}`, `right:${right}`, `bottom:${bottom}`,
    `width:${w}`, `color:${tone}`, `opacity:${op}`,
    alt ? `--bot-alt:${alt}` : '',
    blur ? `filter:blur(${blur}px)` : ''
  ].filter(Boolean).join(';');

  const swayStyle = [
    `--sway:${sway}s`, `--sway-delay:${delay}s`,
    `--sway-deg:${swayDeg}deg`, `--origin:${origin}`
  ].join(';');

  return `<div class="bot-layer" style="${style}"
    data-par="${par}" data-cur="${cur}" ${mobile ? `data-mobile="${mobile}"` : ''}>
    <span class="bot-sway ${breathe ? 'bot-sway--breathe' : ''}" style="${swayStyle}">
      ${botanical(kind, { seed, mode, stroke, rotate: rot, flip, wash: L.wash,
        washFill: L.washFill, washBleed: L.washBleed, washInk: L.washInk })}
    </span>
  </div>`;
}

/** A whole field. `bleed` lets a layer spill past the section edge. */
export function botField(layers = [], { bleed = false, className = '' } = {}) {
  return `<div class="bot-field ${bleed ? 'bot-field--bleed' : ''} ${className}" aria-hidden="true">
    ${layers.map(botLayer).join('')}
  </div>`;
}

/** A short fall of petals. Used sparingly — two sections at most. */
export function petalDrift(count = 7, seed = 'p') {
  let out = '';
  for (let i = 0; i < count; i++) {
    // Deterministic spread so the fall never clumps on one side.
    const l = ((i * 37 + 11) % 100);
    const s = 16 + ((i * 13) % 22);
    const d = 22 + ((i * 7) % 16);
    const delay = (i * 3.3) % 18;
    const drift = ((i % 2 ? 1 : -1) * (30 + (i * 17) % 70));
    const spin = 140 + ((i * 53) % 260);
    const o = 0.28 + ((i * 11) % 22) / 100;
    out += `<i style="--l:${l}%;--s:${s}px;--d:${d}s;--delay:${delay}s;--drift:${drift}px;--spin:${spin}deg;--o:${o}">
      ${botanical('petals', { seed: `${seed}${i}`, mode: 'solid', count: 1 })}
    </i>`;
  }
  return `<div class="petal-drift" aria-hidden="true">${out}</div>`;
}

/** The organic sweep used where one band pours into the next. */
export function edge(position = 'bottom', to = 'var(--bg)') {
  return `<div class="edge edge--${position}" style="--edge-to:${to}" aria-hidden="true">
    <svg viewBox="0 0 1440 110" preserveAspectRatio="none">
      <path d="M0 110 L0 46 C 180 4 320 92 520 62 C 700 34 820 96 1010 74 C 1190 54 1320 12 1440 40 L1440 110 Z"
            fill="currentColor"/>
    </svg>
  </div>`;
}

/** A small botanical mark centred on a hairline between two sections. */
export function join(kind = 'sprig', seed = 'j') {
  return `<div class="join" aria-hidden="true">
    <span class="join__mark">${botanical(kind, { seed, mode: 'line', stroke: 2.2 })}</span>
  </div>`;
}

/**
 * The standard botanical dressing for a page head. Same grammar on every
 * inner page — a branch entering high right, a frond low left — so the site
 * reads as one environment rather than a set of separately decorated pages.
 */
export function pageField(seed, { tone = 'var(--bot-ink)' } = {}) {
  return botField([
    { kind: 'branch', seed: `${seed}-a`, mode: 'line', stroke: 1.3, right: '-8%', y: '-14%', w: '42vw',
      rot: 10, op: 0.16, tone, par: 0.16, cur: 20, sway: 28, swayDeg: 1.1 },
    { kind: 'fern', seed: `${seed}-b`, mode: 'line', stroke: 1.2, x: '-9%', bottom: '-24%', w: '26vw',
      rot: -16, op: 0.14, tone: 'var(--bot-sage)', par: -0.1, cur: 14, sway: 32, mobile: 'hide' },
    { kind: 'bloom', seed: `${seed}-c`, mode: 'line', stroke: 1, x: '58%', y: '4%', w: '24vw',
      op: 0.08, tone: 'var(--bot-rose)', blur: 1.2, par: 0.06, cur: 8, breathe: true, mobile: 'hide' }
  ]);
}

/* --------------------------------------------------------- floral canvas */

/* The composition is written out by hand rather than scattered randomly: an
   even spread is what makes floral backgrounds read as wallpaper. These
   cluster along the edges and thin out through the middle third, which is
   where body copy sits. Coordinates are percentages of a field one and a half
   viewports tall — the layer pans slowly through it as the page scrolls, so
   the canvas is never the same twice and never tiles. */
const CANVAS_FORMS = [
  // top edge — heaviest, this is what sits behind the cover
  { k: 'branch',   x: -8,  y: -4,  w: 46, rot: 8,    o: 0.9,  t: 'magenta', m: 'line' },
  { k: 'bloom',    x: 62,  y: -6,  w: 30, rot: -12,  o: 0.62, t: 'rose',    m: 'duo' },
  { k: 'fern',     x: 78,  y: 4,   w: 26, rot: 24,   o: 0.8,  t: 'leaf',    m: 'line' },
  { k: 'seedstem', x: 34,  y: -8,  w: 14, rot: -6,   o: 0.7,  t: 'cobalt',  m: 'line' },
  // upper flanks
  { k: 'spray',    x: -12, y: 16,  w: 34, rot: -4,   o: 0.75, t: 'chartreuse', m: 'line' },
  { k: 'petals',   x: 86,  y: 22,  w: 20, rot: 16,   o: 0.66, t: 'coral',   m: 'line' },
  // middle — deliberately sparse and pushed to the margins
  { k: 'arc',      x: -16, y: 38,  w: 52, rot: 0,    o: 0.42, t: 'teal',    m: 'line' },
  { k: 'sprig',    x: 90,  y: 44,  w: 16, rot: -20,  o: 0.5,  t: 'violet',  m: 'line' },
  { k: 'bloom',    x: -6,  y: 50,  w: 22, rot: 6,    o: 0.4,  t: 'marigold', m: 'line' },
  // lower flanks
  { k: 'fern',     x: -10, y: 62,  w: 28, rot: -22,  o: 0.78, t: 'leaf',    m: 'line' },
  { k: 'branch',   x: 66,  y: 66,  w: 44, rot: 190,  o: 0.8,  t: 'magenta', m: 'line' },
  { k: 'petals',   x: 22,  y: 72,  w: 22, rot: -10,  o: 0.6,  t: 'vermilion', m: 'line' },
  // bottom edge
  { k: 'spray',    x: 54,  y: 86,  w: 36, rot: 6,    o: 0.72, t: 'leaf',    m: 'duo' },
  { k: 'seedstem', x: 8,   y: 88,  w: 15, rot: 12,   o: 0.68, t: 'coral',   m: 'line' },
  { k: 'bloom',    x: 80,  y: 92,  w: 26, rot: -8,   o: 0.55, t: 'violet',  m: 'duo' },
  { k: 'sprig',    x: 40,  y: 96,  w: 18, rot: 22,   o: 0.6,  t: 'cobalt',  m: 'line' }
];

/**
 * The dim floral ground the whole site sits on.
 *
 * Rendered as two flat images rather than thirty-two live SVG nodes. A
 * viewport-sized blend layer has to re-composite on every scrolled frame, and
 * doing that over a tree of individually stroked shapes cost about a third of
 * the frame budget; as one cached texture per layer the compositor has a single
 * bitmap to blend. The pigments are baked in because a data URI has no access
 * to the custom properties — safe to do, since the pigment scale is fixed and
 * only the semantic tokens above it flip between themes.
 */
function canvasImage(tone, seed) {
  const cs = getComputedStyle(document.documentElement);
  const pigment = (name) => cs.getPropertyValue(`--${name}-${tone}`).trim() || '#888';

  // 1440 x 1800: a reference viewport plus the quarter-again of height the
  // layer pans through. Sliced rather than stretched, so nothing is squashed.
  const W = 1440, H = 1800;
  const forms = CANVAS_FORMS.map((f, i) => {
    const w = (f.w / 100) * W;
    const art = botanical(f.k, { seed: `${seed}-${i}`, mode: f.m, stroke: 1.3, rotate: f.rot })
      .replace(/currentColor/g, pigment(f.t))
      .replace(/^[\s\S]*?<svg[^>]*>/, '')
      .replace(/<\/svg>\s*$/, '');
    return `<svg x="${((f.x / 100) * W).toFixed(1)}" y="${((f.y / 100) * H).toFixed(1)}" ` +
      `width="${w.toFixed(1)}" height="${w.toFixed(1)}" viewBox="0 0 400 400" ` +
      `fill="none" opacity="${f.o}" overflow="visible">${art}</svg>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ` +
    `preserveAspectRatio="xMidYMid slice">${forms}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * Mount the canvas.
 *
 * One layer, appended last so it paints over the opaque section grounds and
 * under every content wrap. The wash pigments are mid-tone, which is what lets
 * a single set of colours read against both the paper and the plum bands.
 */
export function installFloralCanvas(seed = 'canvas') {
  const layer = document.createElement('div');
  layer.className = 'floral-canvas';
  layer.setAttribute('aria-hidden', 'true');
  const pan = document.createElement('div');
  pan.className = 'floral-canvas__pan';
  pan.style.backgroundImage = canvasImage('wash', seed);
  layer.appendChild(pan);
  document.body.appendChild(layer);
  const pans = [pan];

  if (prefersReducedMotion()) return () => {};

  /* The layer is half a viewport taller than the screen and travels that whole
     extra height over the length of the document, so the florals drift rather
     than sit pinned behind the content. */
  let raf = null, want = 0, have = 0;
  const draw = () => {
    have = lerp(have, want, 0.09);
    const t = `translate3d(0, ${(-have * 25).toFixed(2)}vh, 0)`;
    for (const pan of pans) pan.style.transform = t;
    raf = Math.abs(want - have) > 0.0005 ? requestAnimationFrame(draw) : null;
  };
  const off = scrollBus.on('scroll', ({ y }) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    want = clamp(max > 0 ? y / max : 0, 0, 1);
    if (!raf) raf = requestAnimationFrame(draw);
  });
  return () => { off(); if (raf) cancelAnimationFrame(raf); };
}

/* ------------------------------------------------------------------ runtime */

/**
 * Wire every layer in a subtree to the scroll loop and the pointer.
 * Returns a cleanup function.
 */
export function initBotField(root = document) {
  if (prefersReducedMotion()) return () => {};

  const layers = Array.from(root.querySelectorAll('.bot-layer'))
    .map((node) => ({
      node,
      par: parseFloat(node.dataset.par) || 0,
      cur: parseFloat(node.dataset.cur) || 0,
      rect: null,
      px: 0, py: 0, tx: 0, ty: 0
    }))
    .filter((l) => l.par || l.cur);

  if (!layers.length) return () => {};

  const measure = () => {
    for (const l of layers) {
      const r = l.node.getBoundingClientRect();
      l.rect = { top: r.top + window.scrollY, height: r.height || 1 };
    }
  };
  measure();

  const onResize = () => measure();
  window.addEventListener('resize', onResize, { passive: true });

  // Pointer lean is shared across the page, normalised to -1..1.
  let mx = 0, my = 0, cmx = 0, cmy = 0;
  const touch = isTouch();
  const onPointer = (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!touch) window.addEventListener('pointermove', onPointer, { passive: true });

  let scrollY = window.scrollY;
  const offScroll = scrollBus.on('scroll', ({ y }) => { scrollY = y; });

  let raf = null;
  const frame = () => {
    cmx = lerp(cmx, mx, 0.05);
    cmy = lerp(cmy, my, 0.05);
    const vh = window.innerHeight;

    for (const l of layers) {
      if (!l.rect) continue;
      // Skip anything well outside the viewport — a long page has many layers.
      const rel = l.rect.top - scrollY;
      if (rel > vh * 1.6 || rel + l.rect.height < -vh * 0.6) continue;

      const t = (scrollY + vh - l.rect.top) / (vh + l.rect.height);
      l.ty = (t - 0.5) * l.par * 260;
      l.tx = cmx * l.cur;
      const cy = cmy * l.cur * 0.4;

      l.px = lerp(l.px, l.tx, 0.12);
      l.py = lerp(l.py, l.ty + cy, 0.14);
      l.node.style.setProperty('--px', `${l.px.toFixed(2)}px`);
      l.node.style.setProperty('--py', `${l.py.toFixed(2)}px`);
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    if (!touch) window.removeEventListener('pointermove', onPointer);
    offScroll();
  };
}

/** Paper fibre texture, generated once and reused as a CSS variable. */
export function installPaper() {
  /* The layer multiplies, so raw turbulence — which sits around mid grey —
     would take the whole page down a value. The transfer squeezes the noise
     into the top of the range (0.95–1.0) and pins alpha opaque, leaving about
     thirteen levels of grain — fibre you can see up close, and no measurable
     loss of brightness at a glance. */
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
    <filter id="p">
      <feTurbulence type="fractalNoise" baseFrequency="0.62 0.9" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="0.05" intercept="0.95"/>
        <feFuncG type="linear" slope="0.05" intercept="0.95"/>
        <feFuncB type="linear" slope="0.05" intercept="0.95"/>
        <feFuncA type="linear" slope="0" intercept="1"/>
      </feComponentTransfer>
    </filter>
    <rect width="240" height="240" filter="url(#p)"/>
  </svg>`;
  document.documentElement.style.setProperty(
    '--paper-url', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
}
