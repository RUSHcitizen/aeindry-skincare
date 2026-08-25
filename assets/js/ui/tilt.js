/**
 * 3D tilt for product cards + a pointer-tracked light that follows the cursor
 * across the card face. Pointer devices only.
 */

import { $$, isTouch, prefersReducedMotion, lerp } from '../lib/dom.js';

export function initTilt(root = document) {
  if (isTouch() || prefersReducedMotion()) return;

  $$('[data-tilt]', root).forEach((card) => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = '1';

    const max = parseFloat(card.dataset.tilt) || 7;
    let rx = 0, ry = 0, trx = 0, try_ = 0, raf = null;

    const animate = () => {
      rx = lerp(rx, trx, 0.14);
      ry = lerp(ry, try_, 0.14);
      card.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
      if (Math.abs(rx - trx) > 0.02 || Math.abs(ry - try_) > 0.02) raf = requestAnimationFrame(animate);
      else raf = null;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(animate); };

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      trx = (0.5 - py) * max * 2;
      try_ = (px - 0.5) * max * 2;
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      kick();
    });

    card.addEventListener('pointerleave', () => { trx = 0; try_ = 0; kick(); });
  });
}
