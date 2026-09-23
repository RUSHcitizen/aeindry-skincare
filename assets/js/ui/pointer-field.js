/**
 * Where the pointer is, as two numbers a stylesheet can use.
 *
 * `--px` and `--py` run -1 to 1 across the tracked box, eased rather than set
 * outright so the thing that follows them arrives instead of teleporting. The
 * element keeps them at 0 when nobody is pointing at it.
 *
 * The whole point is that JavaScript writes two custom properties and stops
 * there. What moves, how far, and in which direction is CSS's business, which
 * means a layer can be re-tuned or dropped in a stylesheet and the loop above
 * it never changes. It also means one rAF for a composition rather than one per
 * moving part.
 *
 * They are written as bare numbers, so CSS must give them a unit:
 *
 *   translate: calc(var(--px, 0) * 14px) calc(var(--py, 0) * 10px);
 *
 * Prefer `translate`, `rotate` and `scale` over `transform` in what consumes
 * them. Those are independent properties, so they compose with whatever
 * transform the element already carries — and on this site the interesting
 * elements usually carry one.
 *
 * Pointer devices only. On a touch screen there is no hover to speak of and
 * the effect would either never fire or fire once and stick; the ambient motion
 * these compositions already have is what stands in for it there.
 */

import { $, clamp, lerp, isTouch, prefersReducedMotion } from '../lib/dom.js';

/**
 * @param {Element} host   where the properties are written
 * @param {object} [opts]
 *   scope   the box the pointer is measured against (default: the host)
 *   ease    0-1, how hard the value chases the pointer (default 0.12)
 *   listen  where the pointer is listened for (default: the scope)
 * @returns {() => void} teardown
 */
export function pointerField(host, opts = {}) {
  if (!host || isTouch() || prefersReducedMotion()) return () => {};

  const scope = opts.scope || host;
  const listen = opts.listen || scope;
  const ease = opts.ease ?? 0.12;

  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null, dead = false;

  const step = () => {
    raf = null;
    if (dead) return;
    cx = lerp(cx, tx, ease);
    cy = lerp(cy, ty, ease);
    host.style.setProperty('--px', cx.toFixed(4));
    host.style.setProperty('--py', cy.toFixed(4));
    /* Settle exactly rather than asymptotically: without this the loop runs
       forever a thousandth of a pixel from home, which is a rAF a frame for
       nothing on a page that is no longer being pointed at. */
    if (Math.abs(cx - tx) > 0.0015 || Math.abs(cy - ty) > 0.0015) kick();
    else { cx = tx; cy = ty; }
  };
  const kick = () => { if (!raf && !dead) raf = requestAnimationFrame(step); };

  const move = (e) => {
    const r = scope.getBoundingClientRect();
    if (!r.width || !r.height) return;
    tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
    ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
    kick();
  };
  const home = () => { tx = 0; ty = 0; kick(); };

  listen.addEventListener('pointermove', move, { passive: true });
  listen.addEventListener('pointerleave', home);
  /* A pointer that leaves through a gap, or a window that loses focus
     mid-gesture, would otherwise leave the composition held off-centre. */
  window.addEventListener('blur', home);

  return () => {
    dead = true;
    if (raf) cancelAnimationFrame(raf);
    listen.removeEventListener('pointermove', move);
    listen.removeEventListener('pointerleave', home);
    window.removeEventListener('blur', home);
    host.style.removeProperty('--px');
    host.style.removeProperty('--py');
  };
}

/** Convenience: track the first match of `sel` inside `root`. */
export const pointerFieldIn = (root, sel, opts) => {
  const el = $(sel, root);
  return el ? pointerField(el, opts) : () => {};
};
