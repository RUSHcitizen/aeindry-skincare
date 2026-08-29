/**
 * Cart drawer: renders the live cart, handles quantity/remove, and plays the
 * fly-to-cart animation when something is added from anywhere on the site.
 */

import { $, $$, esc, lockScroll, unlockScroll, trapFocus, prefersReducedMotion } from '../lib/dom.js';
import { bus, getCart, cartCount, cartTotals, setQty, removeFromCart, clearCart, addToCart } from '../core/store.js';
import { formatPrice, getProduct } from '../data/products.js';
import { productArt } from '../lib/art.js';
import { toast } from './toast.js';

let drawer, scrim, body, foot, countBadge, releaseTrap;
let lastFocused = null;

export function initCart() {
  drawer = $('.drawer');
  scrim = $('.drawer-scrim');
  body = $('.drawer__body');
  foot = $('.drawer__foot');
  countBadge = $('.cart-btn__count');

  $('.cart-btn')?.addEventListener('click', openCart);
  $('.drawer__close')?.addEventListener('click', closeCart);
  scrim?.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('is-open')) closeCart();
  });

  // Delegated add-to-cart from anywhere (cards, product page, quiz, ritual).
  document.addEventListener('click', (e) => {
    const btn = e.target.closest?.('[data-add-to-cart]');
    if (!btn) return;
    e.preventDefault();
    const productId = btn.dataset.addToCart;
    const variantId = btn.dataset.variant || null;
    const qty = parseInt(btn.dataset.qty || '1', 10);
    const added = addToCart(productId, variantId, qty);
    if (!added) return;
    flyToCart(btn, added.product, added.variantId);
    const label = added.product.name;
    toast(`${label} added to your basket`);
    if (btn.dataset.openCart === 'true') setTimeout(openCart, 620);
  });

  bus.on('cart:change', renderCart);
  renderCart();
}

export function openCart() {
  if (!drawer) return;
  lastFocused = document.activeElement;
  drawer.classList.add('is-open');
  scrim.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  lockScroll();
  releaseTrap = trapFocus(drawer);
  setTimeout(() => $('.drawer__close', drawer)?.focus(), 60);
}

export function closeCart() {
  if (!drawer) return;
  drawer.classList.remove('is-open');
  scrim.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  unlockScroll();
  releaseTrap?.();
  lastFocused?.focus?.();
}

function renderCart() {
  const lines = getCart();
  const n = cartCount();

  if (countBadge) {
    countBadge.textContent = n > 99 ? '99+' : String(n);
    countBadge.classList.toggle('is-visible', n > 0);
    if (n > 0) {
      countBadge.classList.remove('is-bump');
      void countBadge.offsetWidth;
      countBadge.classList.add('is-bump');
    }
  }

  if (!body) return;

  if (!lines.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 8h14l-1.2 12.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8Z"/>
          <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
          <path d="M12 12c-1.6 1.4-2.4 2.8-2.4 4.2a2.4 2.4 0 0 0 4.8 0c0-1.4-.8-2.8-2.4-4.2Z"/>
        </svg>
        <div class="stack-s">
          <p class="h4">Your basket is empty</p>
          <p class="body-sm">Not sure where to start? The ritual builder asks four questions and puts a routine together for you.</p>
        </div>
        <div class="cluster" style="justify-content:center">
          <a class="btn btn--primary btn--sm" href="#/shop" data-close-cart>Browse everything</a>
          <a class="btn btn--ghost btn--sm" href="#/ritual" data-close-cart>Build a ritual</a>
        </div>
      </div>`;
    body.querySelectorAll('[data-close-cart]').forEach((a) => a.addEventListener('click', closeCart));
    foot.hidden = true;
    return;
  }

  foot.hidden = false;
  body.innerHTML = lines.map((line) => {
    const { product, variant, qty, unit } = line;
    const tint = product.art.tint[1];
    return `
    <article class="citem" data-line="${esc(product.id)}" data-variant="${esc(variant?.id || '')}">
      <div class="citem__media" style="--card-tint:${tint}">${productArt(product, { variantId: variant?.id })}</div>
      <div>
        <h3 class="citem__name"><a href="#/product/${esc(product.id)}" data-close-cart>${esc(product.name)}</a></h3>
        ${variant ? `<p class="citem__meta">${esc(variant.label)}</p>` : ''}
        ${variant?.restricted ? `<p class="citem__meta" style="color:var(--accent)">Ships to ${esc(variant.restricted)} only</p>` : ''}
        <div class="citem__ctrl">
          <button type="button" data-qty="-1" aria-label="Decrease quantity of ${esc(product.name)}">−</button>
          <span class="citem__qty" aria-live="polite">${qty}</span>
          <button type="button" data-qty="1" aria-label="Increase quantity of ${esc(product.name)}">+</button>
        </div>
        <button class="citem__remove" type="button" data-remove>Remove</button>
      </div>
      <div class="citem__price">${formatPrice(unit * qty)}</div>
    </article>`;
  }).join('');

  body.querySelectorAll('[data-close-cart]').forEach((a) => a.addEventListener('click', closeCart));

  body.querySelectorAll('.citem').forEach((node) => {
    const productId = node.dataset.line;
    const variantId = node.dataset.variant || null;
    node.querySelectorAll('[data-qty]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const line = getCart().find((l) => l.productId === productId && (l.variantId || '') === (variantId || ''));
        if (!line) return;
        setQty(productId, variantId, line.qty + parseInt(btn.dataset.qty, 10));
      });
    });
    node.querySelector('[data-remove]')?.addEventListener('click', () => {
      node.classList.add('is-removing');
      setTimeout(() => removeFromCart(productId, variantId), 340);
    });
  });

  renderTotals();
}

function renderTotals() {
  const t = cartTotals();
  const rows = $('.drawer__totals', foot);
  if (!rows) return;
  rows.innerHTML = `
    <div class="drawer__row"><span>Subtotal</span><span>${formatPrice(t.subtotal)}</span></div>
    <div class="drawer__row"><span>Shipping</span><span>${t.shipping === 0 ? 'Free' : formatPrice(t.shipping)}</span></div>
    ${!t.qualifies ? `
      <div class="ship-meter" role="status">
        <div class="ship-meter__bar"><span style="width:${Math.round((t.subtotal / t.freeShippingAt) * 100)}%"></span></div>
        <p class="body-xs">${formatPrice(t.towardFree)} more for free shipping</p>
      </div>` : `<p class="body-xs" style="color:var(--leaf)">You have earned free shipping.</p>`}
    <div class="drawer__row drawer__row--total"><span>Total</span><span>${formatPrice(t.total)}</span></div>`;
}

/**
 * Fly-to-cart: clone the product art, animate it along an arc into the cart
 * button, then bump the badge. Purely decorative — skipped for reduced motion.
 */
function flyToCart(sourceBtn, product, variantId) {
  if (prefersReducedMotion()) return;

  const card = sourceBtn.closest('.spec, .shelf-item, .modal, .pdp, .ritual-step, .quiz-result, .spotlight-sec');
  const art = card?.querySelector('svg.product-art') || sourceBtn.querySelector('svg.product-art');
  const cartBtn = $('.cart-btn');
  if (!art || !cartBtn) return;

  const from = art.getBoundingClientRect();
  const to = cartBtn.getBoundingClientRect();
  if (!from.width || !to.width) return;

  const ghost = document.createElement('div');
  ghost.className = 'fly-ghost';
  ghost.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;`;
  ghost.innerHTML = productArt(product, { variantId });
  ghost.firstElementChild.style.width = '100%';
  document.body.append(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  ghost.animate(
    [
      { transform: 'translate3d(0,0,0) scale(1) rotate(0deg)', opacity: 1, offset: 0 },
      { transform: `translate3d(${dx * 0.45}px, ${dy * 0.45 - 90}px, 0) scale(0.62) rotate(-14deg)`, opacity: 0.95, offset: 0.55 },
      { transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.1) rotate(6deg)`, opacity: 0, offset: 1 }
    ],
    { duration: 850, easing: 'cubic-bezier(0.5, 0, 0.35, 1)', fill: 'forwards' }
  ).onfinish = () => ghost.remove();
}

export function initCheckout() {
  $('.drawer__checkout')?.addEventListener('click', () => {
    const t = cartTotals();
    if (t.subtotal === 0) return;
    // The checkout page states its own limits — whether it can take money is
    // its business, not the drawer's, and saying it in two places means one of
    // them is eventually wrong.
    location.hash = '#/checkout';
    closeCart();
  });
  $('.drawer__clear')?.addEventListener('click', () => {
    clearCart();
    toast('Basket cleared', { icon: 'info' });
  });
}
