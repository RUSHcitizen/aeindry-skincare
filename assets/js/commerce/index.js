/**
 * The commerce façade.
 *
 * One contract, two implementations. The UI never learns which one it is
 * talking to, so the cart drawer, the product page and the checkout are written
 * once and work whether the site is a catalogue demo or a live storefront.
 *
 * The contract is deliberately asymmetric about money: reads are synchronous
 * (`list`, `totals`) because the UI paints on every keystroke and cannot await,
 * writes are asynchronous (`add`, `setQty`) because a real store has to answer.
 * Writes update a local snapshot immediately so the drawer feels instant, then
 * reconcile against whatever the server actually says — and the server's number
 * always wins. Optimism is a rendering technique, not an accounting one.
 *
 * Slugs are the bridge between the two worlds. The front end addresses products
 * by the same human slugs the catalogue has always used ('face-cream'); the Woo
 * driver resolves those to WooCommerce numeric ids once, at load, from the
 * store's own `slug` field. Nothing in the pages needs to know Woo's ids exist.
 */

import { emitter, store as localStore } from '../lib/dom.js';
import { getProduct, priceOf, PRODUCTS } from '../data/products.js';
import { COMMERCE, isLive, toMinor, formatMoney } from './config.js';
import * as api from './store-api.js';

export const bus = emitter();
export { formatMoney };

const CART_KEY = 'aeindry.cart.v1';
const MINOR = COMMERCE.currency.minorUnit;

/** The snapshot every synchronous read serves from. */
let snapshot = emptySnapshot();
let driver = null;
let readyPromise = null;

function emptySnapshot() {
  return {
    lines: [],
    count: 0,
    totals: {
      subtotal: 0, shipping: 0, tax: 0, discount: 0, total: 0,
      currency: COMMERCE.currency, needsShipping: false,
      freeShippingAt: toMinor(COMMERCE.freeShippingAt),
      towardFree: toMinor(COMMERCE.freeShippingAt), qualifies: false
    },
    shippingRates: [],
    selectedRate: null,
    errors: []
  };
}

function publish(next) {
  snapshot = next;
  bus.emit('cart:change', snapshot);
}

/* ══════════════════════════════════════════════════════════ local driver ══ */
/**
 * The catalogue demo. Everything is computed here from data/products.js.
 *
 * This driver is for showing the site, not for selling. It says so out loud:
 * `canTakePayment` is false, and `placeOrder` refuses rather than pretending.
 * A demo that fakes an order confirmation is how a real customer ends up
 * believing they have bought something.
 */
const localDriver = {
  name: 'local',
  canTakePayment: false,

  async ready() {
    this._raw = normalise(localStore.get(CART_KEY, []));
    this._recompute();
  },

  _persist() {
    localStore.set(CART_KEY, this._raw);
    this._recompute();
  },

  _recompute() {
    const lines = this._raw.map((l) => {
      const product = getProduct(l.productId);
      const variant = product?.variants?.find((v) => v.id === l.variantId) || null;
      const unit = toMinor(priceOf(product, l.variantId));
      return {
        key: keyOf(l.productId, l.variantId),
        productId: l.productId,
        variantId: l.variantId,
        qty: l.qty,
        name: product?.name || l.productId,
        variantName: variant?.name || '',
        unit,
        total: unit * l.qty,
        image: null,
        product,
        variant
      };
    });
    const subtotal = lines.reduce((n, l) => n + l.total, 0);
    const freeAt = toMinor(COMMERCE.freeShippingAt);
    const shipping = subtotal === 0 || subtotal >= freeAt ? 0 : toMinor(6.5);
    publish({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      totals: {
        subtotal, shipping, tax: 0, discount: 0, total: subtotal + shipping,
        currency: COMMERCE.currency, needsShipping: lines.length > 0,
        freeShippingAt: freeAt,
        towardFree: Math.max(0, freeAt - subtotal),
        qualifies: subtotal >= freeAt
      },
      shippingRates: [],
      selectedRate: null,
      errors: []
    });
  },

  async add(productId, variantId, qty) {
    const product = getProduct(productId);
    if (!product) throw new Error(`No such product: ${productId}`);
    if (!variantId && product.variants?.length) variantId = product.variants[0].id;
    const key = keyOf(productId, variantId);
    const line = this._raw.find((l) => keyOf(l.productId, l.variantId) === key);
    if (line) line.qty = Math.min(99, line.qty + qty);
    else this._raw.push({ productId, variantId, qty });
    this._persist();
  },

  async setQty(key, qty) {
    const line = this._raw.find((l) => keyOf(l.productId, l.variantId) === key);
    if (!line) return;
    if (qty <= 0) return this.remove(key);
    line.qty = Math.min(99, qty);
    this._persist();
  },

  async remove(key) {
    this._raw = this._raw.filter((l) => keyOf(l.productId, l.variantId) !== key);
    this._persist();
  },

  async clear() {
    this._raw = [];
    this._persist();
  },

  async setCustomer() { /* no server to tell */ },
  async selectRate() { /* no rates to select */ },

  async placeOrder() {
    throw new Error(
      'This is a catalogue preview and cannot take payment. ' +
      'Connect a WooCommerce store to accept orders — see docs/COMMERCE.md.'
    );
  }
};

/* ════════════════════════════════════════════════════════════ woo driver ══ */
/**
 * WooCommerce over its Store API. The server owns every number here.
 *
 * Note what is never sent: a price. The browser posts product ids and
 * quantities and reads totals back. A checkout that accepts a price from the
 * client is a checkout that can be bought from at any price the client likes,
 * and no amount of front-end validation fixes that.
 */
const wooDriver = {
  name: 'woo',
  canTakePayment: true,
  _bySlug: new Map(),

  async ready() {
    // The catalogue, indexed by slug, so front-end product ids keep working.
    const products = await api.get('/products?per_page=100');
    for (const p of products || []) this._bySlug.set(p.slug, p);
    this._apply(await api.get('/cart'));
  },

  /** Woo's numeric ids for a front-end slug and variant. */
  _resolve(productId, variantId) {
    const p = this._bySlug.get(productId);
    if (!p) throw new Error(`"${productId}" is not in the store catalogue.`);
    if (!variantId || p.type !== 'variable') return { id: p.id, variation: [] };
    // Variants are matched on the attribute value, not on position: Woo is free
    // to reorder them and a positional match would quietly buy the wrong size.
    const local = getProduct(productId)?.variants?.find((v) => v.id === variantId);
    const wanted = (local?.name || variantId).toLowerCase();
    const attr = p.attributes?.[0];
    const term = attr?.terms?.find((t) => t.name.toLowerCase() === wanted)
      || attr?.terms?.find((t) => t.slug === variantId);
    return {
      id: p.id,
      variation: term && attr ? [{ attribute: attr.name, value: term.name }] : []
    };
  },

  _apply(cart) {
    const cur = {
      code: cart?.totals?.currency_code || COMMERCE.currency.code,
      symbol: cart?.totals?.currency_symbol || COMMERCE.currency.symbol,
      minorUnit: cart?.totals?.currency_minor_unit ?? MINOR
    };
    const int = (v) => parseInt(v ?? '0', 10) || 0;

    const lines = (cart?.items || []).map((it) => ({
      key: it.key,
      productId: it.slug || String(it.id),
      variantId: it.variation?.[0]?.value || null,
      qty: it.quantity,
      name: it.name,
      variantName: (it.variation || []).map((v) => v.value).join(' · '),
      unit: int(it.prices?.price),
      total: int(it.totals?.line_total) + int(it.totals?.line_total_tax),
      image: it.images?.[0]?.thumbnail || it.images?.[0]?.src || null,
      // The local record is still handy for artwork and copy the store lacks.
      product: getProduct(it.slug) || null,
      variant: null
    }));

    // Woo groups rates per shipment package; a basket from one warehouse has
    // exactly one, and flattening keeps the UI from having to care.
    const pkg = cart?.shipping_rates?.[0];
    const rates = (pkg?.shipping_rates || []).map((r) => ({
      id: r.rate_id,
      name: r.name,
      price: int(r.price) + int(r.taxes),
      delivery: r.delivery_time || r.description || '',
      selected: Boolean(r.selected)
    }));

    const subtotal = int(cart?.totals?.total_items);
    const freeAt = toMinor(COMMERCE.freeShippingAt, cur.minorUnit);
    publish({
      lines,
      count: cart?.items_count ?? lines.reduce((n, l) => n + l.qty, 0),
      totals: {
        subtotal,
        shipping: int(cart?.totals?.total_shipping),
        tax: int(cart?.totals?.total_tax),
        discount: int(cart?.totals?.total_discount),
        total: int(cart?.totals?.total_price),
        currency: cur,
        needsShipping: Boolean(cart?.needs_shipping),
        freeShippingAt: freeAt,
        towardFree: Math.max(0, freeAt - subtotal),
        qualifies: subtotal >= freeAt
      },
      shippingRates: rates,
      selectedRate: rates.find((r) => r.selected)?.id || null,
      errors: (cart?.errors || []).map((e) => e.message).filter(Boolean)
    });
  },

  async add(productId, variantId, qty) {
    const { id, variation } = this._resolve(productId, variantId);
    this._apply(await api.post('/cart/add-item', { id, quantity: qty, variation }));
  },

  async setQty(key, qty) {
    if (qty <= 0) return this.remove(key);
    this._apply(await api.post('/cart/update-item', { key, quantity: qty }));
  },

  async remove(key) {
    this._apply(await api.post('/cart/remove-item', { key }));
  },

  async clear() {
    for (const line of [...snapshot.lines]) {
      await api.post('/cart/remove-item', { key: line.key });
    }
    this._apply(await api.get('/cart'));
  },

  /** Address in, shipping rates and tax out. This is where USPS quotes land. */
  async setCustomer(address) {
    this._apply(await api.post('/cart/update-customer', {
      billing_address: address.billing || address,
      shipping_address: address.shipping || address
    }));
  },

  async selectRate(rateId) {
    this._apply(await api.post('/cart/select-shipping-rate', {
      package_id: 0, rate_id: rateId
    }));
  },

  async placeOrder(payload) {
    const order = await api.post('/checkout', payload);
    this._apply(await api.get('/cart'));
    return order;
  }
};

/* ═════════════════════════════════════════════════════════════ the façade ══ */

const keyOf = (productId, variantId) => `${productId}::${variantId || ''}`;

function normalise(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l) => l && typeof l.productId === 'string' && getProduct(l.productId))
    .map((l) => ({
      productId: l.productId,
      variantId: typeof l.variantId === 'string' ? l.variantId : null,
      qty: Math.max(1, Math.min(99, parseInt(l.qty, 10) || 1))
    }));
}

/**
 * Choose a driver and load it.
 *
 * A configured store that cannot be reached falls back to the demo rather than
 * leaving the shop dead — but it says so on the bus, so the checkout can refuse
 * to pretend it is open for business.
 */
export function initCommerce() {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    if (isLive()) {
      try {
        driver = wooDriver;
        await driver.ready();
        bus.emit('commerce:ready', { driver: 'woo', live: true });
        return;
      } catch (err) {
        driver = null;
        bus.emit('commerce:degraded', {
          reason: err?.message || 'The store could not be reached.'
        });
      }
    }
    driver = localDriver;
    await driver.ready();
    bus.emit('commerce:ready', { driver: 'local', live: false });
  })();
  return readyPromise;
}

const use = () => driver || localDriver;

/* Reads — synchronous, from the snapshot. */
export const cartLines = () => snapshot.lines;
export const cartCount = () => snapshot.count;
export const cartTotals = () => snapshot.totals;
export const shippingRates = () => snapshot.shippingRates;
export const selectedRate = () => snapshot.selectedRate;
export const cartErrors = () => snapshot.errors;
export const canTakePayment = () => use().canTakePayment;
export const driverName = () => use().name;

/* Writes — asynchronous, server-authoritative where there is a server. */
export async function addToCart(productId, variantId = null, qty = 1) {
  await initCommerce();
  await use().add(productId, variantId, qty);
  bus.emit('cart:add', { productId, variantId, qty });
  return { productId, variantId };
}

/**
 * Line keys differ by driver: the local one composes `slug::variant`, Woo hands
 * out its own opaque key. Callers hold whichever they were given, and the UI
 * often only knows the product and variant it rendered — so resolve either
 * against the current lines rather than making every caller care.
 */
function resolveKey(key) {
  if (snapshot.lines.some((l) => l.key === key)) return key;
  const match = snapshot.lines.find((l) => keyOf(l.productId, l.variantId) === key);
  return match ? match.key : key;
}

export async function setQty(key, qty) {
  await initCommerce();
  return use().setQty(resolveKey(key), qty);
}

export async function removeLine(key) {
  await initCommerce();
  return use().remove(resolveKey(key));
}

export async function clearCart() {
  await initCommerce();
  return use().clear();
}

export async function setCustomer(address) {
  await initCommerce();
  return use().setCustomer(address);
}

export async function selectShippingRate(rateId) {
  await initCommerce();
  return use().selectRate(rateId);
}

export async function placeOrder(payload) {
  await initCommerce();
  return use().placeOrder(payload);
}

/** The catalogue, from the store when there is one and from disk when not. */
export function catalogue() {
  return PRODUCTS;
}

export const lineKey = keyOf;
