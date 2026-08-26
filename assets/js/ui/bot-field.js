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
