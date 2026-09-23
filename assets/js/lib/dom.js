/** Tiny DOM helpers — kept deliberately small, no framework. */

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** Escape untrusted text destined for innerHTML. */
export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const on = (target, type, fn, opts) => {
  target.addEventListener(type, fn, opts);
  return () => target.removeEventListener(type, fn, opts);
};

export const raf = (fn) => requestAnimationFrame(fn);
export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const mapRange = (v, a1, b1, a2, b2) => a2 + ((v - a1) / (b1 - a1)) * (b2 - a2);

export function throttle(fn, ms = 100) {
  let last = 0, timer;
  return (...args) => {
    const now = Date.now();
    const gap = now - last;
    if (gap >= ms) { last = now; fn(...args); }
    else {
      clearTimeout(timer);
      timer = setTimeout(() => { last = Date.now(); fn(...args); }, ms - gap);
    }
  };
}

export function debounce(fn, ms = 160) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () =>
  window.matchMedia('(hover: none), (pointer: coarse)').matches;

/** Focus trap for drawers and modals. */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapFocus(container) {
  const handler = (e) => {
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, container).filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
}

/** Body scroll lock that preserves scroll position and avoids layout shift. */
let lockCount = 0;
let savedY = 0;
export function lockScroll() {
  if (lockCount++ > 0) return;
  savedY = window.scrollY;
  const barW = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.paddingRight = barW > 0 ? `${barW}px` : '';
  document.body.classList.add('is-locked');
}
export function unlockScroll() {
  if (--lockCount > 0) return;
  lockCount = 0;
  document.body.classList.remove('is-locked');
  document.body.style.paddingRight = '';
}

/** localStorage that never throws (private mode, blocked site data). */
export const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
};

/** Minimal pub/sub. */
export function emitter() {
  const map = new Map();
  return {
    on(type, fn) {
      if (!map.has(type)) map.set(type, new Set());
      map.get(type).add(fn);
      return () => map.get(type)?.delete(fn);
    },
    emit(type, payload) {
      map.get(type)?.forEach((fn) => fn(payload));
    }
  };
}

/**
 * Split an element's text into per-line, per-word or per-char spans so the
 * motion system can stagger them. Returns the element for chaining.
 */
export function splitText(node, mode = 'words', stepMs = 40) {
  if (node.dataset.split) return node;
  const text = node.textContent.trim();
  node.dataset.split = mode;

  if (mode === 'chars') {
    node.innerHTML = text.split('').map((ch, i) =>
      ch === ' ' ? ' ' : `<span class="split-char" style="--char-delay:${i * stepMs}ms">${esc(ch)}</span>`
    ).join('');
  } else if (mode === 'words') {
    node.innerHTML = text.split(/\s+/).map((w, i) =>
      `<span class="split-word" style="--word-delay:${i * stepMs}ms">${esc(w)}</span>`
    ).join(' ');
  } else if (mode === 'lines') {
    // Wrap words, measure where the browser broke them, then group into lines.
    node.innerHTML = text.split(/\s+/)
      .map((w) => `<span class="msr">${esc(w)}</span>`).join(' ');
    const words = $$('.msr', node);
    const lines = [];
    let currentTop = null;
    words.forEach((w) => {
      const top = Math.round(w.offsetTop);
      if (currentTop === null || Math.abs(top - currentTop) > 4) { lines.push([]); currentTop = top; }
      lines[lines.length - 1].push(w.textContent);
    });
    node.innerHTML = lines.map((words, i) =>
      `<span class="split-line"><span class="split-line__inner" style="--line-delay:${i * (stepMs * 2.4)}ms">${esc(words.join(' '))}</span></span>`
    ).join('');
  }
  return node;
}

/** Number that counts up when revealed. */
export function countUp(node, to, { duration = 1600, prefix = '', suffix = '', group = true } = {}) {
  const fmt = (v) => (group ? v.toLocaleString('en-US') : String(v));
  if (prefersReducedMotion()) { node.textContent = `${prefix}${to}${suffix}`; return; }
  const start = performance.now();
  const from = 0;
  const tick = (now) => {
    const t = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    const value = Math.round(from + (to - from) * eased);
    node.textContent = `${prefix}${fmt(value)}${suffix}`;
    if (t < 1) raf(tick);
  };
  raf(tick);
}
