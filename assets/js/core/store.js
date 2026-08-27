/**
 * Cart + wishlist state, as the interface sees it.
 *
 * The cart itself moved to `commerce/`, which owns whether it lives in
 * localStorage or in a WooCommerce install. This module stays because the whole
 * interface is written against its shape, and because that shape is in dollars
 * while the commerce layer — like every payment system — counts in cents. This
 * is the one place the two meet, and it is deliberately the only place: a
 * conversion scattered through twenty components is a rounding bug waiting for
 * a busy Saturday.
 */

import { store, emitter } from '../lib/dom.js';
import { getProduct } from '../data/products.js';
import * as commerce from '../commerce/index.js';

const WISH_KEY = 'aeindry.wishlist.v1';
const THEME_KEY = 'aeindry.theme';

export const bus = emitter();

let wishlist = new Set(store.get(WISH_KEY, []));

/** Cents to dollars, at the boundary and nowhere else. */
const dollars = (minor, unit = 2) => Number(minor || 0) / 10 ** unit;

// Re-broadcast on this module's bus so nothing else has to know about the move.
commerce.bus.on('cart:change', () => bus.emit('cart:change', getCart()));
commerce.bus.on('cart:add', (detail) => bus.emit('cart:add', detail));
commerce.bus.on('commerce:degraded', (detail) => bus.emit('commerce:degraded', detail));

export const initCommerce = () => commerce.initCommerce();

export function getCart() {
  const unit = commerce.cartTotals().currency?.minorUnit ?? 2;
  return commerce.cartLines().map((l) => ({
    key: l.key,
    productId: l.productId,
    variantId: l.variantId,
    qty: l.qty,
    product: l.product || getProduct(l.productId),
    variant: l.variant,
    unit: dollars(l.unit, unit),
    total: dollars(l.total, unit)
  }));
}

export const cartCount = () => commerce.cartCount();

export function cartTotals() {
  const t = commerce.cartTotals();
  const u = t.currency?.minorUnit ?? 2;
  return {
    subtotal: dollars(t.subtotal, u),
    shipping: dollars(t.shipping, u),
    tax: dollars(t.tax, u),
    total: dollars(t.total, u),
    freeShippingAt: dollars(t.freeShippingAt, u),
    towardFree: dollars(t.towardFree, u),
    qualifies: t.qualifies,
    /* True only when a real store is answering. The checkout reads this before
       it is willing to say the word "order". */
    live: commerce.canTakePayment()
  };
}

/** Shipping options for the current address, once one has been given. */
export const shippingRates = () => {
  const u = commerce.cartTotals().currency?.minorUnit ?? 2;
  return commerce.shippingRates().map((r) => ({ ...r, price: dollars(r.price, u) }));
};
export const selectedRate = () => commerce.selectedRate();
export const setCustomer = (address) => commerce.setCustomer(address);
export const selectShippingRate = (id) => commerce.selectShippingRate(id);
export const placeOrder = (payload) => commerce.placeOrder(payload);
export const canTakePayment = () => commerce.canTakePayment();
export const fetchInvoice = (orderId, orderKey) => commerce.fetchInvoice(orderId, orderKey);

export function addToCart(productId, variantId = null, qty = 1) {
  const product = getProduct(productId);
  if (!product) return null;
  if (!variantId && product.variants?.length) variantId = product.variants[0].id;
  // Fire and forget: the local driver settles synchronously and a live store
  // announces itself on the bus. Failures surface as a toast, not a throw.
  commerce.addToCart(productId, variantId, qty)
    .catch((err) => bus.emit('cart:error', { message: err?.message || 'Could not add that.' }));
  return { product, variantId };
}

export function setQty(productId, variantId, qty) {
  commerce.setQty(commerce.lineKey(productId, variantId), qty)
    .catch((err) => bus.emit('cart:error', { message: err?.message || 'Could not update that.' }));
}

export function removeFromCart(productId, variantId) {
  commerce.removeLine(commerce.lineKey(productId, variantId))
    .catch((err) => bus.emit('cart:error', { message: err?.message || 'Could not remove that.' }));
}

export function clearCart() {
  commerce.clearCart()
    .catch((err) => bus.emit('cart:error', { message: err?.message || 'Could not empty the basket.' }));
}

/* ---------- Wishlist ---------- */
export const isWished = (id) => wishlist.has(id);
export const wishCount = () => wishlist.size;

export function toggleWish(id) {
  if (wishlist.has(id)) wishlist.delete(id);
  else wishlist.add(id);
  store.set(WISH_KEY, [...wishlist]);
  bus.emit('wish:change', [...wishlist]);
  return wishlist.has(id);
}

/* ---------- Theme ---------- */
export function getTheme() {
  return store.get(THEME_KEY, 'system');
}

export function setTheme(mode) {
  if (mode === 'system') {
    document.documentElement.removeAttribute('data-theme');
    store.remove(THEME_KEY);
  } else {
    document.documentElement.setAttribute('data-theme', mode);
    store.set(THEME_KEY, mode);
  }
  bus.emit('theme:change', mode);
}

export function initTheme() {
  const saved = getTheme();
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.setAttribute('data-theme', saved);
  }
}

/** Cycle light → dark → system. */
export function cycleTheme() {
  const order = ['light', 'dark', 'system'];
  const current = getTheme();
  const next = order[(order.indexOf(current) + 1) % order.length];
  setTheme(next);
  return next;
}
