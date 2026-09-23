/**
 * First-load curtain. Shows the brand mark drawing itself while fonts and
 * the first route settle, then lifts. Capped so it can never strand a reader.
 */

import { $, wait, prefersReducedMotion } from '../lib/dom.js';

const MIN_MS = 700;      // long enough for the mark to draw
const MAX_MS = 2600;     // hard ceiling regardless of what is still loading

export async function runPreloader() {
  const node = $('.preloader');
  if (!node) return;

  const fill = $('.preloader__fill', node);
  const pct = $('.preloader__pct', node);

  if (prefersReducedMotion()) {
    finish(node);
    return;
  }

  const started = performance.now();
  let progress = 0;

  const paint = (p) => {
    progress = Math.max(progress, p);
    if (fill) fill.style.transform = `scaleX(${progress})`;
    if (pct) pct.textContent = `${Math.round(progress * 100)}%`;
  };
  paint(0.06);

  // Creep forward so the bar always feels alive, even on a warm cache.
  const creep = setInterval(() => {
    paint(Math.min(0.92, progress + (0.92 - progress) * 0.14));
  }, 110);

  const ready = Promise.all([
    document.fonts?.ready?.catch(() => {}) ?? Promise.resolve(),
    new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })))
  ]);

  await Promise.race([ready, wait(MAX_MS)]);
  clearInterval(creep);
  paint(1);

  const elapsed = performance.now() - started;
  if (elapsed < MIN_MS) await wait(MIN_MS - elapsed);
  await wait(220);
  finish(node);
}

function finish(node) {
  node.classList.add('is-done');
  document.body.classList.add('is-ready');
  setTimeout(() => node.remove(), 800);
}
