/** Snap carousel with drag-to-scroll, dots and keyboard support. */

import { $$, clamp } from '../lib/dom.js';

export function initCarousel(root) {
  if (!root) return () => {};
  const track = root.querySelector('[data-carousel-track]');
  const dotsHost = root.querySelector('[data-carousel-dots]');
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  if (!track) return () => {};

  const slides = Array.from(track.children);
  let index = 0;

  if (dotsHost) {
    dotsHost.innerHTML = slides.map((_, i) =>
      `<button class="cdot ${i === 0 ? 'is-on' : ''}" type="button" data-go="${i}" aria-label="Go to slide ${i + 1}"></button>`
    ).join('');
    dotsHost.querySelectorAll('[data-go]').forEach((b) =>
      b.addEventListener('click', () => goTo(parseInt(b.dataset.go, 10))));
  }

  function goTo(i) {
    index = clamp(i, 0, slides.length - 1);
    const slide = slides[index];
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    paint();
  }

  function paint() {
    dotsHost?.querySelectorAll('.cdot').forEach((d, i) => d.classList.toggle('is-on', i === index));
    prev?.toggleAttribute('disabled', index === 0);
    next?.toggleAttribute('disabled', index === slides.length - 1);
  }

  prev?.addEventListener('click', () => goTo(index - 1));
  next?.addEventListener('click', () => goTo(index + 1));

  // Keep the index honest when the reader scrolls or swipes the track directly.
  let scrollTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestDist = Infinity;
      slides.forEach((s, i) => {
        const c = s.offsetLeft - track.offsetLeft + s.offsetWidth / 2;
        const d = Math.abs(c - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      index = best;
      paint();
    }, 90);
  }, { passive: true });

  // Pointer drag on desktop.
  let down = false, startX = 0, startScroll = 0, moved = false;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    down = true; moved = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
    track.classList.add('is-dragging');
  });
  track.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startScroll - dx;
  });
  const release = () => { down = false; track.classList.remove('is-dragging'); };
  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);
  track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
  });

  paint();
  return () => clearTimeout(scrollTimer);
}
