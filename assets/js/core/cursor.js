/**
 * Magnetic custom cursor.
 *
 * A dot that tracks the pointer exactly and a ring that trails behind it.
 * Elements can declare intent with data-cursor="hover" | "label:VIEW" | "hide",
 * and data-magnetic pulls the element itself towards the pointer.
 */

import { $, $$, lerp, isTouch, prefersReducedMotion } from '../lib/dom.js';

let cursor, dot, ring, label;
let mx = -100, my = -100;       // true pointer
let rx = -100, ry = -100;       // trailing ring
let active = false;

export function initCursor() {
  if (isTouch() || prefersReducedMotion()) return;

  cursor = $('.cursor');
  if (!cursor) return;
  dot = $('.cursor__dot', cursor);
  ring = $('.cursor__ring', cursor);
  label = $('.cursor__label', cursor);
  active = true;

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.classList.remove('is-hidden');
  }, { passive: true });

  window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));

  // Delegated so it keeps working across route swaps.
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest?.('[data-cursor], a, button, .chip, input, textarea, select');
    if (!t) return setCursorState(null);
    const spec = t.dataset?.cursor;
    if (spec === 'hide') return setCursorState('hide');
    if (spec?.startsWith('label:')) return setCursorState('label', spec.slice(6));
    setCursorState('hover');
  });
  document.addEventListener('pointerout', (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest?.('[data-cursor], a, button, .chip, input, textarea, select')) {
      setCursorState(null);
    }
  });

  requestAnimationFrame(tick);
}

function setCursorState(state, text = '') {
  if (!cursor) return;
  cursor.classList.toggle('is-hover', state === 'hover');
  cursor.classList.toggle('is-label', state === 'label');
  cursor.classList.toggle('is-hidden', state === 'hide');
  if (state === 'label' && label) label.textContent = text;
}

function tick() {
  if (!active) return;
  rx = lerp(rx, mx, 0.18);
  ry = lerp(ry, my, 0.18);
  dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
  requestAnimationFrame(tick);
}

/**
 * Magnetic pull — the element drifts towards the pointer while it is near.
 * data-magnetic="0.35" sets the strength.
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
