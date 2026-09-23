/**
 * Scroll-reveal orchestration.
 *
 * Every [data-reveal] element is observed once; entering the viewport adds
 * .is-in, which the CSS in animations.css turns into the actual transition.
 * Children of [data-stagger] get an incremental --i so a group cascades.
 */

import { $$, prefersReducedMotion, splitText } from '../lib/dom.js';

let observer = null;
const seen = new WeakSet();

/**
 * Hand the element back to the normal paint path once its motion is over.
 *
 * The reveal ends on `filter: blur(0)` and keeps `will-change: opacity,
 * transform`, and both of those persist for the life of the page. Either one is
 * enough to hold the element on its own composited layer, and text on a
 * composited layer is rendered with greyscale antialiasing instead of subpixel
 * — which on a large, thin display face reads as permanently, unfixably soft.
 * The blur really is zero; the type is still blurry. Clearing both once the
 * transition finishes puts the glyphs back on the subpixel path.
 */
function settle(el) {
  if (el.dataset.revealSettled) return;
  el.dataset.revealSettled = '1';
  el.classList.add('is-settled');
}

function watchSettle(el) {
  const done = (e) => {
    // Children of a split heading transition too; only the element's own
    // filter finishing means the reveal is over.
    if (e.target !== el || e.propertyName !== 'filter') return;
    el.removeEventListener('transitionend', done);
    settle(el);
  };
  el.addEventListener('transitionend', done);
  // A transition that never runs (display:none at the time, a zero duration,
  // a browser that skipped it) would otherwise leave the element promoted for
  // good, so settle on a timer as well.
  setTimeout(() => settle(el), 2600);
}

function ensureObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      watchSettle(entry.target);
      observer.unobserve(entry.target);
    }
  }, {
    // Fire slightly before the element is fully on screen so the motion
    // resolves as the reader arrives rather than after.
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.05
  });
  return observer;
}

/** Scan a subtree and wire up everything that opts into motion. */
export function initReveal(root = document) {
  const reduced = prefersReducedMotion();

  // Stagger indices
  $$('[data-stagger]', root).forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
    });
  });

  // Text splitting — must happen before the element is observed
  $$('[data-split]', root).forEach((node) => {
    if (reduced) return;
    const mode = node.dataset.split || 'words';
    const step = parseFloat(node.dataset.splitStep) || (mode === 'chars' ? 26 : 46);
    splitText(node, mode, step);
    if (!node.hasAttribute('data-reveal')) node.setAttribute('data-reveal', 'fade');
  });

  const targets = $$('[data-reveal]', root).filter((n) => !seen.has(n));
  if (reduced) {
    targets.forEach((n) => { n.classList.add('is-in'); settle(n); seen.add(n); });
    return;
  }

  const io = ensureObserver();
  targets.forEach((n) => {
    seen.add(n);
    // Anything already on screen at load reveals immediately, so the first
    // paint is never a page of invisible content.
    const rect = n.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
      n.classList.add('is-in');
      watchSettle(n);
    } else {
      io.observe(n);
    }
  });
}

/** Reveal everything in a subtree right now (used when a route swaps in). */
export function revealAll(root = document) {
  $$('[data-reveal]', root).forEach((n) => { n.classList.add('is-in'); settle(n); });
}
