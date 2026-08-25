/** Cart + wishlist state. Persisted to localStorage, broadcast via emitter. */

import { store, emitter } from '../lib/dom.js';
import { getProduct, priceOf } from '../data/products.js';

const CART_KEY = 'aeindry.cart.v1';
const WISH_KEY = 'aeindry.wishlist.v1';
const THEME_KEY = 'aeindry.theme';

export const bus = emitter();

/** @type {{productId:string, variantId:string, qty:number}[]} */
let cart = normaliseCart(store.get(CART_KEY, []));
let wishlist = new Set(store.get(WISH_KEY, []));

function normaliseCart(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l) => l && typeof l.productId === 'string' && getProduct(l.productId))
    .map((l) => ({
      productId: l.productId,
      variantId: typeof l.variantId === 'string' ? l.variantId : null,
      qty: Math.max(1, Math.min(99, parseInt(l.qty, 10) || 1))
    }));
}

const keyOf = (productId, variantId) => `${productId}::${variantId || ''}`;

function persist() {
  store.set(CART_KEY, cart);
  bus.emit('cart:change', getCart());
}

export function getCart() {
  return cart.map((line) => {
    const product = getProduct(line.productId);
    const variant = product.variants?.find((v) => v.id === line.variantId) || null;
    const unit = priceOf(product, line.variantId);
    return { ...line, product, variant, unit, total: unit * line.qty };
  });
}

export const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);

export function cartTotals() {
  const lines = getCart();
  const subtotal = lines.reduce((n, l) => n + l.total, 0);
  const FREE_SHIPPING_AT = 60;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_AT ? 0 : 6.5;
  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    freeShippingAt: FREE_SHIPPING_AT,
    towardFree: Math.max(0, FREE_SHIPPING_AT - subtotal),
    qualifies: subtotal >= FREE_SHIPPING_AT
  };
}

export function addToCart(productId, variantId = null, qty = 1) {
  const product = getProduct(productId);
  if (!product) return null;
  // Default to the first variant so a line always resolves to a real price.
  if (!variantId && product.variants?.length) variantId = product.variants[0].id;

  const key = keyOf(productId, variantId);
  const existing = cart.find((l) => keyOf(l.productId, l.variantId) === key);
  if (existing) existing.qty = Math.min(99, existing.qty + qty);
  else cart.push({ productId, variantId, qty });

  persist();
  bus.emit('cart:add', { productId, variantId, qty });
  return { product, variantId };
}

export function setQty(productId, variantId, qty) {
  const key = keyOf(productId, variantId);
  const line = cart.find((l) => keyOf(l.productId, l.variantId) === key);
  if (!line) return;
  if (qty <= 0) return removeFromCart(productId, variantId);
  line.qty = Math.min(99, qty);
  persist();
}

export function removeFromCart(productId, variantId) {
  const key = keyOf(productId, variantId);
  cart = cart.filter((l) => keyOf(l.productId, l.variantId) !== key);
  persist();
}

export function clearCart() {
  cart = [];
  persist();
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
