/**
 * Hash router with a cinematic curtain transition.
 *
 * Hash routing (rather than the History API) means the site works from a
 * file:// path and from any static host with no server rewrites.
 * Each route is a function returning an HTML string plus an optional
 * `mount(root)` for behaviour that needs real nodes.
 */

import { $, wait, prefersReducedMotion } from '../lib/dom.js';
import { resetScroll, initParallax, scrollBus } from './scroll.js';
import { initReveal } from './reveal.js';
import { initMagnetic } from './cursor.js';

const routes = new Map();
let notFound = null;
let currentCleanup = [];
let currentPath = null;
let navigating = false;

export function defineRoute(pattern, handler) {
  routes.set(pattern, handler);
}
export function defineNotFound(handler) {
  notFound = handler;
}

/** Parse "#/product/salve?variant=x" into { path, params, query }. */
export function parseHash(hash = location.hash) {
  const raw = (hash || '#/').replace(/^#/, '') || '/';
  const [pathPart, queryPart] = raw.split('?');
  const path = pathPart.replace(/\/+$/, '') || '/';
  const query = Object.fromEntries(new URLSearchParams(queryPart || ''));
  return { path, query };
}

function match(path) {
  if (routes.has(path)) return { handler: routes.get(path), params: {} };
  for (const [pattern, handler] of routes) {
    if (!pattern.includes(':')) continue;
    const pSeg = pattern.split('/').filter(Boolean);
    const aSeg = path.split('/').filter(Boolean);
    if (pSeg.length !== aSeg.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < pSeg.length; i++) {
      if (pSeg[i].startsWith(':')) params[pSeg[i].slice(1)] = decodeURIComponent(aSeg[i]);
      else if (pSeg[i] !== aSeg[i]) { ok = false; break; }
    }
    if (ok) return { handler, params };
  }
  return null;
}

/** Run the six-panel curtain. Resolves once the screen is fully covered. */
async function cover(curtain) {
  if (prefersReducedMotion() || !curtain) return;
  curtain.classList.remove('is-revealing');
  curtain.classList.add('is-covering');
  await wait(620 + 5 * 46);
}
async function reveal(curtain) {
  if (prefersReducedMotion() || !curtain) return;
  curtain.classList.remove('is-covering');
  curtain.classList.add('is-revealing');
  await wait(620 + 5 * 46);
  curtain.classList.remove('is-revealing');
}

export async function render({ animate = true } = {}) {
  if (navigating) return;
  const { path, query } = parseHash();
  if (path === currentPath && !query.force) {
    // Same route, different query (e.g. shop filters) — let the page handle it.
    window.dispatchEvent(new CustomEvent('route:query', { detail: { path, query } }));
    return;
  }

  navigating = true;
  const app = $('#app');
  const curtain = $('.curtain');
  const found = match(path);
  const handler = found?.handler || notFound;
  const params = found?.params || {};

  if (animate && currentPath !== null) await cover(curtain);

  // Tear down whatever the previous route registered.
  currentCleanup.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
  currentCleanup = [];

  const result = await handler({ params, query, path });
  const html = typeof result === 'string' ? result : result.html;
  const mount = typeof result === 'object' ? result.mount : null;
  const title = typeof result === 'object' ? result.title : null;

  app.innerHTML = html;
  document.title = title ? `${title} · Aeindry Skincare` : 'Aeindry Skincare — All Natural Handmade Skincare';

  resetScroll();
  currentPath = path;

  // Wire the fresh subtree into the shared systems.
  initReveal(app);
  initMagnetic(app);
  const stopParallax = initParallax(app);
  if (stopParallax) currentCleanup.push(stopParallax);

  if (mount) {
    const cleanup = mount(app, { params, query });
    if (typeof cleanup === 'function') currentCleanup.push(cleanup);
  }

  window.dispatchEvent(new CustomEvent('route:change', { detail: { path, query, params } }));

  if (animate && curtain) {
    app.classList.remove('route-enter');
    void app.offsetWidth;            // restart the enter animation
    app.classList.add('route-enter');
    await reveal(curtain);
  }

  navigating = false;
  scrollBus.emit('scroll', { y: 0, max: 0, progress: 0, direction: 1, velocity: 0 });
}

/** Programmatic navigation. */
export function go(to, { replace = false } = {}) {
  const target = to.startsWith('#') ? to : `#${to}`;
  if (location.hash === target) return render({ animate: true });
  if (replace) location.replace(target);
  else location.hash = target;
}

export function initRouter() {
  window.addEventListener('hashchange', () => render({ animate: true }));

  // Intercept in-app links so every navigation runs the transition.
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#/"]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute('href');
    if (href === location.hash) { e.preventDefault(); return; }
  });

  if (!location.hash) location.replace('#/');
  return render({ animate: false });
}

export const currentRoute = () => currentPath;
