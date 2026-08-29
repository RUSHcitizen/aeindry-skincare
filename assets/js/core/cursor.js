/**
 * Magnetic hover.
 *
 * The custom cursor follower was removed at the client's request — the native
 * cursor is left alone. What remains is the magnetic pull: an element drifts a
 * few pixels toward the pointer while it is near, which is the part that reads
 * as craft rather than novelty.
 */

import { $$, lerp, isTouch, prefersReducedMotion } from '../lib/dom.js';

/** No-op: kept so callers do not need to change. */
export function initCursor() {}

/**
 * data-magnetic="0.35" sets the strength; data-magnetic-inner marks a child
 * that should lag behind the parent for a little parallax.
 */
export function initMagnetic(root = document) {
  if (isTouch() || prefersReducedMotion()) return;

  $$('[data-magnetic]', root).forEach((node) => {
    if (node.dataset.magneticBound) return;
    node.dataset.magneticBound = '1';

    const strength = parseFloat(node.dataset.magnetic) || 0.32;
    const inner = node.querySelector('[data-magnetic-inner]');
    let raf = null;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const animate = () => {
      cx = lerp(cx, tx, 0.16);
      cy = lerp(cy, ty, 0.16);
      node.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (inner) inner.style.transform = `translate3d(${(cx * 0.35).toFixed(2)}px, ${(cy * 0.35).toFixed(2)}px, 0)`;
      if (Math.abs(cx - tx) > 0.05 || Math.abs(cy - ty) > 0.05) raf = requestAnimationFrame(animate);
      else raf = null;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(animate); };

    node.addEventListener('pointermove', (e) => {
      const r = node.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
      kick();
    });
    node.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  });
}
