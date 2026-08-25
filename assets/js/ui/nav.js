/**
 * Sticky nav: condenses on scroll, hides when scrolling down and returns on
 * the way back up, drives the scroll-progress bar and owns the mobile menu.
 */

import { $, $$, lockScroll, unlockScroll, trapFocus } from '../lib/dom.js';
import { scrollBus } from '../core/scroll.js';
import { parseHash } from '../core/router.js';
import { cycleTheme, getTheme } from '../core/store.js';
import { toast } from './toast.js';

let nav, menu, burger, progress, releaseTrap;
let menuOpen = false;
let lastY = 0;
let navHidden = false;

export function initNav() {
  nav = $('.nav');
  menu = $('.menu');
  burger = $('.burger');
  progress = $('.scroll-progress');

  burger?.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));

  // Any menu link closes the overlay; the router handles the navigation.
  $$('.menu__link', menu).forEach((a) => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  scrollBus.on('scroll', onScroll);
  window.addEventListener('route:change', syncActive);
  syncActive();

  // Theme toggle
  const themeBtn = $('.theme-btn');
  themeBtn?.addEventListener('click', () => {
    const mode = cycleTheme();
    paintThemeIcon(mode);
    toast(`Theme: ${mode === 'system' ? 'following your system' : mode}`, { icon: 'info', duration: 1800 });
  });
  paintThemeIcon(getTheme());
}

function onScroll({ y, progress: p }) {
  if (progress) progress.style.transform = `scaleX(${p})`;
  if (!nav) return;

  nav.classList.toggle('is-stuck', y > 24);

  // Only hide once past the hero, and never while the menu is open.
  const goingDown = y > lastY + 2;
  const goingUp = y < lastY - 2;
  if (!menuOpen && y > 420) {
    if (goingDown) nav.classList.add('is-hidden');
    else if (goingUp) nav.classList.remove('is-hidden');
  } else {
    nav.classList.remove('is-hidden');
  }
  lastY = y;

  // Sticky sub-bars (shop filters, ritual tabs) dock to the nav. When the nav
  // retracts they must close the gap rather than float below empty space.
  const hidden = nav.classList.contains('is-hidden');
  if (hidden !== navHidden) {
    navHidden = hidden;
    document.documentElement.style.setProperty('--nav-offset', hidden ? '0px' : 'var(--nav-h)');
  }
}

function openMenu() {
  menuOpen = true;
  menu.classList.add('is-open');
  menu.setAttribute('aria-hidden', 'false');
  burger.setAttribute('aria-expanded', 'true');
  nav.classList.remove('is-hidden');
  lockScroll();
  releaseTrap = trapFocus(menu);
}

function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
  burger.setAttribute('aria-expanded', 'false');
  unlockScroll();
  releaseTrap?.();
}

function syncActive() {
  const { path } = parseHash();
  const root = '/' + (path.split('/')[1] || '');
  $$('.nav__link, .menu__link').forEach((a) => {
    const href = a.getAttribute('href')?.replace('#', '') || '';
    const hrefRoot = '/' + (href.split('/')[1] || '');
    const active = hrefRoot === root && href !== '';
    a.classList.toggle('is-active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

const THEME_ICONS = {
  light: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>',
  dark:  '<path d="M20 14.4A8.5 8.5 0 0 1 9.6 4 8.5 8.5 0 1 0 20 14.4Z"/>',
  system:'<rect x="3" y="4.5" width="18" height="13" rx="2"/><path d="M8.5 21h7M12 17.5V21"/>'
};

function paintThemeIcon(mode) {
  const btn = $('.theme-btn');
  if (!btn) return;
  const svg = btn.querySelector('svg');
  if (svg) svg.innerHTML = THEME_ICONS[mode] || THEME_ICONS.system;
  btn.setAttribute('aria-label', `Colour theme: ${mode}. Activate to change.`);
  btn.querySelector('.tip__bubble')?.remove();
}
