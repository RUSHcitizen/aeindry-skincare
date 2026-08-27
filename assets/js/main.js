/**
 * Entry point — boots the shared systems, registers routes, runs the app.
 */

import { $, $$, on } from './lib/dom.js';
import { initTheme, initCommerce, canTakePayment, toggleWish, bus } from './core/store.js';
import { initScroll } from './core/scroll.js';
import { initMagnetic } from './core/cursor.js';
import { runPreloader } from './core/preloader.js';
import { defineRoute, defineNotFound, initRouter } from './core/router.js';
import { initNav } from './ui/nav.js';
import { initCart, initCheckout } from './ui/cart.js';
import { initQuickview } from './ui/quickview.js';
import { initAccordion } from './ui/accordion.js';
import { installBackdrop } from './ui/backdrop.js';
import { toast } from './ui/toast.js';

import home from './pages/home.js';
import shop from './pages/shop.js';
import product from './pages/product.js';
import about from './pages/about.js';
import ingredients from './pages/ingredients.js';
import ritual from './pages/ritual.js';
import journal from './pages/journal.js';
import contact from './pages/contact.js';
import checkout from './pages/checkout.js';
import invoice from './pages/invoice.js';
import notFound from './pages/not-found.js';

/* ---------- Paper grain, generated once and reused site-wide ---------- */
/* ---------- Routes ---------- */
function registerRoutes() {
  defineRoute('/', home);
  defineRoute('/shop', shop);
  defineRoute('/product/:id', product);
  defineRoute('/about', about);
  defineRoute('/ingredients', ingredients);
  defineRoute('/ritual', ritual);
  defineRoute('/journal', journal);
  defineRoute('/contact', contact);
  defineRoute('/checkout', checkout);
  defineRoute('/invoice/:id', invoice);
  defineNotFound(notFound);
}

/* ---------- Site-wide delegated behaviour ---------- */
function initGlobalHandlers() {
  // Wishlist hearts, wherever they render.
  on(document, 'click', (e) => {
    const btn = e.target.closest?.('[data-wish]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.dataset.wish;
    const on_ = toggleWish(id);
    btn.classList.toggle('is-on', on_);
    btn.setAttribute('aria-pressed', String(on_));
    toast(on_ ? 'Saved to your list' : 'Removed from your list', { icon: 'heart', duration: 1800 });
  });

  // Keep every heart on the page in sync when one changes.
  bus.on('wish:change', (ids) => {
    const set = new Set(ids);
    $$('[data-wish]').forEach((b) => {
      const on_ = set.has(b.dataset.wish);
      b.classList.toggle('is-on', on_);
      b.setAttribute('aria-pressed', String(on_));
    });
  });

  // Newsletter forms (header CTA + footer).
  on(document, 'submit', (e) => {
    const form = e.target.closest?.('[data-newsletter]');
    if (!form) return;
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const value = input?.value.trim() || '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      input?.focus();
      form.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
        { duration: 300, easing: 'ease-in-out' }
      );
      toast('That does not look like an email address.', { icon: 'alert' });
      return;
    }
    input.value = '';
    input.blur();
    toast('You are on the list — demo site, nothing was stored.', { icon: 'check', duration: 3400 });
  });

  // Current year in the footer.
  $$('[data-year]').forEach((n) => { n.textContent = String(new Date().getFullYear()); });

  // Move focus to the new page after a route change, for keyboard and SR users.
  window.addEventListener('route:change', () => {
    const app = $('#app');
    app?.focus({ preventScroll: true });
  });
}

/* ---------- Boot ---------- */
async function boot() {
  // The cart has to exist before anything can be added to it, and when a
  // live store is configured that means a round trip. Everything else boots
  // alongside rather than behind it.
  const commerceReady = initCommerce().then(() => {
    // Say which one this is, in the one place that claims it site-wide.
    const note = document.querySelector('[data-store-note]');
    if (note && canTakePayment()) {
      note.textContent = 'Secure checkout. Handmade to order in Washington.';
    }
  });
  installBackdrop();      // once, outside the router's subtree
  initTheme();
  initScroll();
  initMagnetic(document);
  initNav();
  initCart();
  initCheckout();
  initQuickview();
  initAccordion(document);
  initGlobalHandlers();

  registerRoutes();
  await initRouter();
  runPreloader();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
