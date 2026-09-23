/**
 * Hero atmosphere: a slow field of blurred colour blooms with botanical seeds
 * drifting over it, both reacting to the pointer. Canvas rather than DOM so a
 * few hundred moving things stay cheap.
 */

import { prefersReducedMotion, clamp } from '../lib/dom.js';

const BLOOM_COLORS = ['#B96A3F', '#416F4D', '#C69B45', '#9B8FC7', '#5B8C64'];

export function initHeroCanvas(canvas) {
  if (!canvas) return () => {};

  const ctx = canvas.getContext('2d', { alpha: true });
  const reduced = prefersReducedMotion();
  let w = 0, h = 0, dpr = 1;
  let raf = null;
  let time = 0;
  let pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  const blooms = [];
  const seeds = [];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    blooms.length = 0;
    const count = w < 700 ? 4 : 6;
    for (let i = 0; i < count; i++) {
      blooms.push({
        x: Math.random(), y: Math.random(),
        r: 0.22 + Math.random() * 0.3,
        color: BLOOM_COLORS[i % BLOOM_COLORS.length],
        alpha: 0.1 + Math.random() * 0.11,
        sx: (Math.random() - 0.5) * 0.00012,
        sy: (Math.random() - 0.5) * 0.00009,
        phase: Math.random() * Math.PI * 2,
        drift: 0.02 + Math.random() * 0.05
      });
    }

    seeds.length = 0;
    const seedCount = w < 700 ? 16 : 34;
    for (let i = 0; i < seedCount; i++) {
      seeds.push(makeSeed(true));
    }
  }

  function makeSeed(initial = false) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 30,
      size: 3 + Math.random() * 7,
      vy: -(0.08 + Math.random() * 0.22),
      vx: (Math.random() - 0.5) * 0.18,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.008,
      sway: 0.4 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.16 + Math.random() * 0.3,
      kind: Math.random() > 0.45 ? 'leaf' : 'seed'
    };
  }

  function drawBlooms() {
    ctx.globalCompositeOperation = 'source-over';
    for (const b of blooms) {
      // Blooms wander on their own and lean gently towards the pointer.
      const px = (pointer.x - 0.5) * b.drift;
      const py = (pointer.y - 0.5) * b.drift;
      const cx = (b.x + Math.sin(time * 0.00016 + b.phase) * 0.05 + px) * w;
      const cy = (b.y + Math.cos(time * 0.00013 + b.phase) * 0.05 + py) * h;
      const rad = b.r * Math.max(w, h) * (1 + Math.sin(time * 0.0002 + b.phase) * 0.08);

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, hexA(b.color, b.alpha));
      g.addColorStop(0.55, hexA(b.color, b.alpha * 0.4));
      g.addColorStop(1, hexA(b.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced) { b.x += b.sx; b.y += b.sy; }
      if (b.x < -0.4) b.x = 1.4; if (b.x > 1.4) b.x = -0.4;
      if (b.y < -0.4) b.y = 1.4; if (b.y > 1.4) b.y = -0.4;
    }
  }

  function drawSeeds() {
    for (const s of seeds) {
      const sway = Math.sin(time * 0.0009 + s.phase) * s.sway;
      const x = s.x + sway;
      ctx.save();
      ctx.translate(x, s.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = '#3E5B44';

      if (s.kind === 'leaf') {
        ctx.beginPath();
        ctx.moveTo(0, -s.size);
        ctx.quadraticCurveTo(s.size * 0.72, 0, 0, s.size);
        ctx.quadraticCurveTo(-s.size * 0.72, 0, 0, -s.size);
        ctx.fill();
        ctx.globalAlpha = s.alpha * 0.55;
        ctx.strokeStyle = '#F6F1E7';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -s.size * 0.8);
        ctx.lineTo(0, s.size * 0.8);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, s.size * 0.42, s.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (!reduced) {
        s.y += s.vy;
        s.x += s.vx + (pointer.x - 0.5) * 0.14;
        s.rot += s.vr;
      }
      if (s.y < -40 || s.x < -60 || s.x > w + 60) Object.assign(s, makeSeed(false));
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    time = now;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    ctx.clearRect(0, 0, w, h);
    drawBlooms();
    drawSeeds();
    raf = requestAnimationFrame(frame);
  }

  const onPointer = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.tx = clamp((e.clientX - r.left) / r.width, 0, 1);
    pointer.ty = clamp((e.clientY - r.top) / r.height, 0, 1);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });

  if (reduced) {
    // One static composition rather than an animation loop.
    ctx.clearRect(0, 0, w, h);
    drawBlooms();
    drawSeeds();
  } else {
    raf = requestAnimationFrame(frame);
  }

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointer);
  };
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
