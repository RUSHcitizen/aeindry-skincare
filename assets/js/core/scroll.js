/**
 * Smooth scrolling + a single shared scroll loop.
 *
 * Rather than transforming a wrapper (which breaks position:sticky and
 * fixed descendants), this eases the *real* scroll position: wheel events are
 * intercepted, a target is accumulated, and rAF interpolates towards it with
 * window.scrollTo. Sticky, fixed and anchor behaviour all keep working, and
 * touch devices are left entirely on native scrolling.
 */

import { clamp, lerp, prefersReducedMotion, isTouch, emitter } from '../lib/dom.js';

export const scrollBus = emitter();

let target = 0;
let current = 0;
let enabled = false;
let rafId = null;
let programmatic = false;
let lastDir = 1;
let velocity = 0;

const EASE = 0.105;          // how hard the view chases the target
const WHEEL_MULT = 1;

const maxScroll = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

export const getScroll = () => ({
  y: current,
  max: maxScroll(),
  progress: maxScroll() > 0 ? clamp(current / maxScroll(), 0, 1) : 0,
  direction: lastDir,
  velocity
});

function loop() {
  const prev = current;
  current = lerp(current, target, EASE);
  velocity = current - prev;

  if (Math.abs(target - current) < 0.15) {
    current = target;
    velocity = 0;
  }

  if (Math.abs(current - window.scrollY) > 0.05) {
    programmatic = true;
    window.scrollTo(0, current);
    programmatic = false;
  }

  scrollBus.emit('scroll', getScroll());
  rafId = requestAnimationFrame(loop);
}

/** Native scroll (keyboard, scrollbar drag, touch) re-syncs the target. */
function onNativeScroll() {
  if (programmatic) return;
  const y = window.scrollY;
  lastDir = y > current ? 1 : y < current ? -1 : lastDir;
  target = y;
  current = y;
  if (!enabled) scrollBus.emit('scroll', getScroll());
}

function onWheel(e) {
  if (!enabled) return;
  // Let the browser handle scrolling inside drawers, modals and code blocks.
  if (e.target.closest?.('[data-native-scroll]')) return;
  if (e.ctrlKey) return; // pinch zoom
  e.preventDefault();
  target = clamp(target + e.deltaY * WHEEL_MULT, 0, maxScroll());
  lastDir = e.deltaY > 0 ? 1 : -1;
}

/** Smoothly scroll to a position or element. */
export function scrollTo(to, { offset = 0, immediate = false } = {}) {
  let y = 0;
  if (typeof to === 'number') y = to;
  else if (to) {
    const node = typeof to === 'string' ? document.querySelector(to) : to;
    if (!node) return;
    y = window.scrollY + node.getBoundingClientRect().top;
  }
  y = clamp(y + offset, 0, maxScroll());
  target = y;
  if (immediate || !enabled) {
    current = y;
    window.scrollTo(0, y);
    scrollBus.emit('scroll', getScroll());
  }
}

/** Jump to the top without animating — used between route changes. */
export function resetScroll() {
  target = 0;
  current = 0;
  window.scrollTo(0, 0);
  scrollBus.emit('scroll', getScroll());
}

export function initScroll() {
  current = target = window.scrollY;

  // Touch devices and reduced-motion users keep pure native scrolling;
  // the shared scroll loop still runs so parallax and progress work.
  enabled = !isTouch() && !prefersReducedMotion();
  if (enabled) {
    document.documentElement.classList.add('has-smooth-scroll');
    window.addEventListener('wheel', onWheel, { passive: false });
  }

  window.addEventListener('scroll', onNativeScroll, { passive: true });
  window.addEventListener('resize', () => { target = clamp(target, 0, maxScroll()); }, { passive: true });

  // Pause the loop when the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
    else if (!rafId) { current = target = window.scrollY; rafId = requestAnimationFrame(loop); }
  });

  rafId = requestAnimationFrame(loop);
}

/** Register a parallax layer: data-parallax="0.2" moves at 20% of scroll. */
export function initParallax(root = document) {
  const layers = Array.from(root.querySelectorAll('[data-parallax]'));
  if (!layers.length || prefersReducedMotion()) return () => {};

  const items = layers.map((node) => ({
    node,
    speed: parseFloat(node.dataset.parallax) || 0.15,
    axis: node.dataset.parallaxAxis || 'y',
    rect: null
  }));

  const measure = () => items.forEach((it) => {
    const r = it.node.getBoundingClientRect();
    it.rect = { top: r.top + window.scrollY, height: r.height };
  });
  measure();
  window.addEventListener('resize', measure, { passive: true });

  return scrollBus.on('scroll', ({ y }) => {
    const vh = window.innerHeight;
    for (const it of items) {
      if (!it.rect) continue;
      // 0 when the element enters the viewport, 1 when it leaves.
      const t = (y + vh - it.rect.top) / (vh + it.rect.height);
      if (t < -0.25 || t > 1.25) continue;
      const shift = (t - 0.5) * it.speed * 220;
      it.node.style.transform = it.axis === 'x'
        ? `translate3d(${shift.toFixed(2)}px, 0, 0)`
        : `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    }
  });
}

/**
 * Progress of an element through the viewport, 0→1, fed to a callback.
 * Used for the story timeline and section-pinned effects.
 */
export function trackProgress(node, fn, { start = 0.9, end = 0.1 } = {}) {
  let rect = null;
  const measure = () => {
    const r = node.getBoundingClientRect();
    rect = { top: r.top + window.scrollY, height: r.height };
  };
  measure();
  window.addEventListener('resize', measure, { passive: true });

  return scrollBus.on('scroll', ({ y }) => {
    if (!rect) return;
    const vh = window.innerHeight;
    const from = rect.top - vh * start;
    const to = rect.top + rect.height - vh * end;
    const p = clamp((y - from) / Math.max(1, to - from), 0, 1);
    fn(p);
  });
}
