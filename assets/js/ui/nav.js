/**
 * Sticky nav: condenses on scroll, hides when scrolling down and returns on
 * the way back up, drives the scroll-progress bar and owns the mobile menu.
 */

import { $, $$, lockScroll, unlockScroll, trapFocus } from '../lib/dom.js';
import { scrollBus } from '../core/scroll.js';
import { parseHash } from '../core/router.js';
import { PRODUCTS, topCategories, childCategories, inCategory } from '../data/products.js';

let nav, menu, burger, progress, releaseTrap;
let menuOpen = false;
let lastY = 0;
let navHidden = false;
let folder, folderLink, folderPanel, shutTimer, folderDismissed = false;

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

  initShopFolder();

  scrollBus.on('scroll', onScroll);
  window.addEventListener('route:change', syncActive);
  window.addEventListener('route:change', shutFolder);
  syncActive();
}

function onScroll({ y, progress: p }) {
  if (progress) progress.style.transform = `scaleX(${p})`;
  if (!nav) return;

  nav.classList.toggle('is-stuck', y > 24);

  // Only hide once past the hero, and never while the menu is open.
  const goingDown = y > lastY + 2;
  const goingUp = y < lastY - 2;
  if (!menuOpen && y > 420) {
    if (goingDown) { nav.classList.add('is-hidden'); shutFolder(); }
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

/* ── the Shop folder ──────────────────────────────────────────────────────
   Hovering Shop shows the shelves. Built from CATEGORIES so it cannot drift
   from the tree, and counted with `inCategory` so a parent's number includes
   everything under it — "Face 15" is what pressing Face actually gives you.

   Shop itself stays a link. A menu that swallows the click on its own trigger
   is the standard way to make a nav infuriating: someone who wants the whole
   shop should get the whole shop. ──────────────────────────────────────── */

const countIn = (id) => PRODUCTS.filter((p) => inCategory(p, id)).length;

function shelfRows() {
  return topCategories().flatMap((c) => [
    { id: c.id, label: c.label, sub: false },
    ...childCategories(c.id).map((k) => ({ id: k.id, label: k.label, sub: true }))
  ]);
}

function rowHtml({ id, label, sub }) {
  return `<a class="nav__shelf${sub ? ' nav__shelf--sub' : ''}" href="#/shop?category=${id}">
    ${sub ? '<span class="nav__shelf-in" aria-hidden="true">\u21b3</span>' : ''}
    <span class="nav__shelf-name">${label}</span>
    <span class="nav__shelf-count">${countIn(id)}</span>
  </a>`;
}

function initShopFolder() {
  folder = $('[data-shop-menu]');
  folderLink = folder && $('.nav__link', folder);
  folderPanel = folder && $('.nav__panel', folder);

  const rows = shelfRows();

  if (folderPanel) {
    folderPanel.innerHTML = `
      <a class="nav__shelf nav__shelf--all" href="#/shop">
        <span class="nav__shelf-name">Everything</span>
        <span class="nav__shelf-count">${PRODUCTS.length}</span>
      </a>
      <div class="nav__shelves">${rows.map(rowHtml).join('')}</div>`;

    folder.addEventListener('pointerenter', (e) => {
      // Touch fires pointerenter on tap; there the tap should just follow the
      // link, and the phone has the menu overlay for the shelves anyway.
      if (e.pointerType === 'touch') return;
      folderDismissed = false;
      openFolder();
    });
    folder.addEventListener('pointerleave', () => scheduleShut());
    /* Focus opens it, so a keyboard reaches the shelves the same way a pointer
       does — and focusout closes it, but only once focus has actually left the
       folder, not while it is moving between rows inside it. */
    /* Not `openFolder` directly: Escape closes the panel and hands focus back
       to the trigger, and that focus would re-open what was just dismissed —
       so Escape leaves it dismissed until focus actually goes somewhere else
       or a pointer arrives. */
    folder.addEventListener('focusin', () => { if (!folderDismissed) openFolder(); });
    folder.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!folder.contains(document.activeElement)) { folderDismissed = false; shutFolder(); }
      }, 0);
    });
    folder.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && folderPanel.hidden === false) {
        folderDismissed = true;
        shutFolder();
        folderLink?.focus();
      }
      if (e.key === 'ArrowDown' && document.activeElement === folderLink) {
        e.preventDefault();
        folderDismissed = false;
        openFolder();
        $('.nav__shelf', folderPanel)?.focus();
      }
    });
    // A shelf chosen from the panel closes it; the router does the rest.
    $$('.nav__shelf', folderPanel).forEach((a) => a.addEventListener('click', shutFolder));
  }

  const sub = $('[data-shop-sub]');
  if (sub) {
    sub.innerHTML = rows.map(({ id, label, sub: isSub }) =>
      `<li><a class="menu__sublink${isSub ? ' menu__sublink--sub' : ''}" href="#/shop?category=${id}">
        ${label}<span class="menu__subcount">${countIn(id)}</span>
      </a></li>`).join('');
    $$('.menu__sublink', sub).forEach((a) => a.addEventListener('click', closeMenu));
  }
}

function openFolder() {
  clearTimeout(shutTimer);
  if (!folderPanel || nav?.classList.contains('is-hidden')) return;
  folderPanel.hidden = false;
  folder.classList.add('is-open');
  folderLink?.setAttribute('aria-expanded', 'true');
}

/* A small grace period: the pointer travelling diagonally from "Shop" to a row
   below it leaves the trigger before it reaches the panel, and closing on that
   frame makes the menu feel like it is running away. */
function scheduleShut() {
  clearTimeout(shutTimer);
  shutTimer = setTimeout(shutFolder, 140);
}

function shutFolder() {
  clearTimeout(shutTimer);
  if (!folderPanel) return;
  folderPanel.hidden = true;
  folder.classList.remove('is-open');
  folderLink?.setAttribute('aria-expanded', 'false');
}

