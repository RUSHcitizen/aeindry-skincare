#!/usr/bin/env node
/**
 * A WooCommerce Store API, implemented against this repository's own catalogue.
 *
 *   node server/store.mjs --port 8787
 *
 * Why this exists. The front end talks to `/wp-json/wc/store/v1/*` because that
 * is what WooCommerce speaks, and the intended production setup is a WordPress
 * install answering those routes. But a front end written against an API that
 * has never been run is a front end full of guesses. This server implements the
 * same routes, with the same field names, the same integer-minor-unit money and
 * the same Cart-Token/Nonce handshake, so the whole flow — add, quote shipping,
 * pay, place an order — is exercised for real before WordPress exists.
 *
 * It is also useful past that point: it is what the interaction tests run
 * against, and it is a working reference for the field shapes when something
 * disagrees with the real Woo.
 *
 * What is genuinely real here:
 *   - the money is integer cents end to end, never a float
 *   - prices come from the server; the client posts ids and quantities only
 *   - shipping is quoted from the packed parcels by server/usps.mjs
 *   - inventory is decremented on order, and refused when short
 *
 * What is not, and is marked so at every exit:
 *   - payment. `payment_result.payment_status` is 'test' unless STRIPE_SECRET_KEY
 *     is set, in which case a real PaymentIntent is created and returned.
 */

import { createServer } from 'node:http';
import { randomUUID, createHmac } from 'node:crypto';
import { PRODUCTS, getProduct, priceOf } from '../assets/js/data/products.js';
import { rateBasket, RATES_REVISED } from './usps.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const PORT = Number(flag('port', 8787));
const ORIGIN_ZIP = flag('origin', '98074');
const SECRET = process.env.STORE_SECRET || 'dev-only-not-a-secret';

const cents = (dollars) => Math.round(Number(dollars || 0) * 100);
const MINOR = 2;

/* ─────────────────────────────────────────────────────────────── storage ── */
/* In memory on purpose. A real deployment is WooCommerce with MySQL behind it;
   giving this one a database would invite someone to run it in production. */
const carts = new Map();     // token -> cart
const orders = new Map();    // id -> order
const stock = new Map(PRODUCTS.map((p) => [p.id, 250]));
let orderSeq = 1000;

function newCart() {
  return {
    token: randomUUID(),
    items: [],                 // { key, productId, variantId, qty }
    customer: null,
    rates: [],
    selectedRate: null,
    shipping: 0,
    createdAt: Date.now()
  };
}

/** Signed so a token cannot be forged into someone else's basket. */
function sign(token) {
  return `${token}.${createHmac('sha256', SECRET).update(token).digest('base64url').slice(0, 24)}`;
}
function verify(signed) {
  if (typeof signed !== 'string' || !signed.includes('.')) return null;
  const [token, mac] = signed.split('.');
  return sign(token) === signed ? token : null;
}

const lineKey = (productId, variantId) => `${productId}::${variantId || ''}`;

/* ────────────────────────────────────────────────────────────── the money ── */
/**
 * Totals, computed here and nowhere else.
 *
 * Every number the customer will ever see is derived on this side of the wire
 * from ids and quantities. The request body carries no prices, so there is no
 * price for a client to tamper with — the whole point of a server-side cart.
 */
function totals(cart) {
  let totalItems = 0;
  for (const it of cart.items) {
    const p = getProduct(it.productId);
    if (!p) continue;
    totalItems += cents(priceOf(p, it.variantId)) * it.qty;
  }
  const shipping = cart.selectedRate ? cart.shipping : 0;
  // Washington sources destination-based sales tax; a real store uses a tax
  // service for this. One flat rate is stated as an estimate, not asserted.
  const taxable = totalItems + shipping;
  const tax = cart.customer?.country === 'US' && cart.customer?.state === 'WA'
    ? Math.round(taxable * 0.101) : 0;
  return {
    total_items: String(totalItems),
    total_items_tax: '0',
    total_shipping: String(shipping),
    total_shipping_tax: '0',
    total_discount: '0',
    total_tax: String(tax),
    total_price: String(totalItems + shipping + tax),
    currency_code: 'USD',
    currency_symbol: '$',
    currency_minor_unit: MINOR,
    currency_decimal_separator: '.',
    currency_thousand_separator: ','
  };
}

function itemJson(it) {
  const p = getProduct(it.productId);
  const variant = p?.variants?.find((v) => v.id === it.variantId) || null;
  const unit = cents(priceOf(p, it.variantId));
  return {
    key: it.key,
    id: p?.id,
    slug: p?.id,
    name: p?.name || it.productId,
    quantity: it.qty,
    quantity_limits: { minimum: 1, maximum: Math.min(99, stock.get(it.productId) ?? 0), multiple_of: 1 },
    short_description: p?.blurb || '',
    images: [],
    variation: variant ? [{ attribute: 'Variant', value: variant.label || variant.id }] : [],
    prices: {
      price: String(unit), regular_price: String(unit), sale_price: String(unit),
      currency_code: 'USD', currency_symbol: '$', currency_minor_unit: MINOR
    },
    totals: {
      line_subtotal: String(unit * it.qty), line_subtotal_tax: '0',
      line_total: String(unit * it.qty), line_total_tax: '0',
      currency_code: 'USD', currency_minor_unit: MINOR
    }
  };
}

function cartJson(cart) {
  const needsShipping = cart.items.length > 0;
  return {
    items: cart.items.map(itemJson),
    items_count: cart.items.reduce((n, i) => n + i.qty, 0),
    needs_shipping: needsShipping,
    totals: totals(cart),
    shipping_address: cart.customer || {},
    billing_address: cart.customer || {},
    shipping_rates: needsShipping && cart.rates.length ? [{
      package_id: 0,
      name: 'Shipment 1',
      destination: { postcode: cart.customer?.postcode || '' },
      items: cart.items.map((i) => ({ key: i.key, name: getProduct(i.productId)?.name, quantity: i.qty })),
      shipping_rates: cart.rates.map((r) => ({
        rate_id: r.service,
        name: r.name,
        description: r.days,
        delivery_time: r.days,
        price: String(cents(r.price)),
        taxes: '0',
        currency_code: 'USD',
        currency_minor_unit: MINOR,
        selected: cart.selectedRate === r.service,
        meta_data: [
          { key: 'parcels', value: String(r.parcels ?? 1) },
          { key: 'estimated', value: r.estimated ? 'yes' : 'no' },
          { key: 'rate_source', value: r.source || `table:${RATES_REVISED}` }
        ]
      }))
    }] : [],
    errors: []
  };
}

/* ──────────────────────────────────────────────────────────────── routing ── */

function productJson(p) {
  const price = cents(p.price);
  return {
    id: p.id, slug: p.id, name: p.name, type: p.variants?.length ? 'variable' : 'simple',
    description: p.description, short_description: p.blurb,
    prices: {
      price: String(price), regular_price: String(price), sale_price: String(price),
      currency_code: 'USD', currency_symbol: '$', currency_minor_unit: MINOR
    },
    is_in_stock: (stock.get(p.id) ?? 0) > 0,
    is_purchasable: true,
    categories: [{ id: p.category, name: p.categoryLabel, slug: p.category }],
    images: [],
    attributes: p.variants?.length ? [{
      id: 1, name: 'Variant', taxonomy: 'pa_variant', has_variations: true,
      terms: p.variants.map((v) => ({ id: v.id, name: v.label || v.id, slug: v.id }))
    }] : []
  };
}

async function handle(method, path, body, cart) {
  if (method === 'GET' && path === '/products') {
    return { status: 200, json: PRODUCTS.map(productJson) };
  }
  if (method === 'GET' && path.startsWith('/products/')) {
    const p = getProduct(decodeURIComponent(path.slice('/products/'.length)));
    return p ? { status: 200, json: productJson(p) }
             : { status: 404, json: { code: 'woocommerce_rest_product_invalid_id', message: 'No such product.' } };
  }
  if (method === 'GET' && path === '/cart') {
    return { status: 200, json: cartJson(cart) };
  }

  if (method === 'POST' && path === '/cart/add-item') {
    const p = getProduct(body.id);
    if (!p) return bad('woocommerce_rest_cart_invalid_product', 'That product is no longer available.');
    const variantId = body.variation?.[0]
      ? (p.variants?.find((v) => (v.label || v.id) === body.variation[0].value)?.id ?? null)
      : (p.variants?.[0]?.id ?? null);
    const qty = Math.max(1, Math.min(99, parseInt(body.quantity, 10) || 1));
    const key = lineKey(p.id, variantId);
    const have = stock.get(p.id) ?? 0;
    const existing = cart.items.find((i) => i.key === key);
    const wanted = (existing?.qty || 0) + qty;
    if (wanted > have) {
      return bad('woocommerce_rest_cart_product_no_stock',
        `Sorry, we only have ${have} of ${p.name} left.`);
    }
    if (existing) existing.qty = wanted;
    else cart.items.push({ key, productId: p.id, variantId, qty });
    await requote(cart);
    return { status: 201, json: cartJson(cart) };
  }

  if (method === 'POST' && path === '/cart/update-item') {
    const it = cart.items.find((i) => i.key === body.key);
    if (!it) return bad('woocommerce_rest_cart_invalid_key', 'That item is no longer in your basket.');
    const qty = Math.max(0, Math.min(99, parseInt(body.quantity, 10) || 0));
    if (qty === 0) cart.items = cart.items.filter((i) => i.key !== body.key);
    else it.qty = qty;
    await requote(cart);
    return { status: 200, json: cartJson(cart) };
  }

  if (method === 'POST' && path === '/cart/remove-item') {
    cart.items = cart.items.filter((i) => i.key !== body.key);
    await requote(cart);
    return { status: 200, json: cartJson(cart) };
  }

  if (method === 'POST' && path === '/cart/update-customer') {
    const a = body.shipping_address || body.billing_address || {};
    cart.customer = {
      first_name: a.first_name || '', last_name: a.last_name || '',
      address_1: a.address_1 || '', address_2: a.address_2 || '',
      city: a.city || '', state: a.state || '', postcode: a.postcode || '',
      country: a.country || 'US', email: a.email || '', phone: a.phone || ''
    };
    await requote(cart);
    return { status: 200, json: cartJson(cart) };
  }

  if (method === 'POST' && path === '/cart/select-shipping-rate') {
    const rate = cart.rates.find((r) => r.service === body.rate_id);
    if (!rate) return bad('woocommerce_rest_cart_invalid_rate', 'That shipping option is no longer offered.');
    cart.selectedRate = rate.service;
    cart.shipping = cents(rate.price);
    return { status: 200, json: cartJson(cart) };
  }

  if (method === 'POST' && path === '/checkout') {
    return checkout(cart, body);
  }

  return { status: 404, json: { code: 'rest_no_route', message: 'No route for that path.' } };
}

const bad = (code, message, status = 400) => ({ status, json: { code, message } });

/** Re-quote shipping whenever the basket or the address changes. */
async function requote(cart) {
  cart.rates = [];
  cart.selectedRate = null;
  cart.shipping = 0;
  if (!cart.items.length || !cart.customer?.postcode) return;
  const { rates, source } = await rateBasket(
    cart.items.map((i) => ({ product: getProduct(i.productId), qty: i.qty })),
    { fromZip: ORIGIN_ZIP, toZip: cart.customer.postcode, country: cart.customer.country }
  );
  cart.rates = rates.filter((r) => r.price != null).map((r) => ({ ...r, source }));
  // Preselect the cheapest, the way Woo does, so a total is never blank.
  if (cart.rates.length) {
    const cheapest = cart.rates.reduce((a, b) => (a.price <= b.price ? a : b));
    cart.selectedRate = cheapest.service;
    cart.shipping = cents(cheapest.price);
  }
}

/* ─────────────────────────────────────────────────────────────── checkout ── */

async function checkout(cart, body) {
  if (!cart.items.length) return bad('woocommerce_rest_cart_empty', 'Your basket is empty.');
  const a = body.shipping_address || body.billing_address;
  if (!a?.email || !a?.address_1 || !a?.postcode) {
    return bad('woocommerce_rest_missing_address', 'We need a delivery address and an email address.');
  }
  if (!cart.selectedRate) {
    return bad('woocommerce_rest_no_shipping', 'Choose a delivery option before paying.');
  }
  // Re-check stock at the last moment: the basket may have sat for an hour.
  for (const it of cart.items) {
    if ((stock.get(it.productId) ?? 0) < it.qty) {
      return bad('woocommerce_rest_cart_product_no_stock',
        `${getProduct(it.productId)?.name} sold out while you were checking out.`);
    }
  }

  const t = totals(cart);
  const payment = await takePayment(Number(t.total_price), body.payment_method);
  if (!payment.ok) return bad('woocommerce_rest_payment_error', payment.message, 402);

  for (const it of cart.items) stock.set(it.productId, (stock.get(it.productId) ?? 0) - it.qty);

  const id = ++orderSeq;
  const order = {
    id, key: `wc_order_${randomUUID().slice(0, 12)}`,
    status: payment.status === 'success' ? 'processing' : 'pending',
    items: cart.items.map(itemJson),
    totals: t,
    shipping_address: a,
    billing_address: body.billing_address || a,
    shipping_method: cart.selectedRate,
    customer_note: body.customer_note || '',
    placed_at: new Date().toISOString()
  };
  orders.set(id, order);

  cart.items = [];
  cart.rates = []; cart.selectedRate = null; cart.shipping = 0;

  return {
    status: 200,
    json: {
      order_id: id,
      status: order.status,
      order_key: order.key,
      customer_note: order.customer_note,
      billing_address: order.billing_address,
      shipping_address: order.shipping_address,
      totals: t,
      payment_result: {
        payment_status: payment.status,
        payment_details: payment.details,
        redirect_url: ''
      }
    }
  };
}

/**
 * Payment.
 *
 * With STRIPE_SECRET_KEY set this creates a real PaymentIntent for the server's
 * own total and returns its client secret for the browser to confirm — card
 * details never touch this server or the site. Without a key it returns
 * 'test', and the front end is required to say so rather than print a receipt.
 */
async function takePayment(amountMinor, method = 'test') {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return { ok: true, status: 'test', message: '',
      details: [{ key: 'note', value: 'No payment was taken — test mode.' }] };
  }
  try {
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount: String(amountMinor),
        currency: 'usd',
        'automatic_payment_methods[enabled]': 'true',
        description: 'Aeindry Skincare order'
      })
    });
    const intent = await res.json();
    if (!res.ok) return { ok: false, message: intent?.error?.message || 'The card was declined.' };
    return {
      ok: true, status: 'pending',
      details: [{ key: 'client_secret', value: intent.client_secret },
                { key: 'payment_method', value: method }]
    };
  } catch {
    return { ok: false, message: 'We could not reach the payment processor. Nothing was charged.' };
  }
}

/* ───────────────────────────────────────────────────────────────── server ── */

const API = '/wp-json/wc/store/v1';

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const send = (status, json, extra = {}) => {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Headers': 'Content-Type, Nonce, Cart-Token',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Expose-Headers': 'Nonce, Cart-Token',
      'Access-Control-Allow-Credentials': 'true',
      ...extra
    });
    res.end(JSON.stringify(json));
  };

  if (req.method === 'OPTIONS') return send(204, {});
  if (!url.pathname.startsWith(API)) {
    return send(404, { code: 'rest_no_route', message: 'Not a Store API route.' });
  }

  // Resume the caller's cart, or start one.
  const token = verify(req.headers['cart-token']);
  let cart = token && carts.get(token);
  if (!cart) {
    cart = newCart();
    carts.set(cart.token, cart);
  }

  let body = {};
  if (req.method === 'POST') {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8');
    if (raw) {
      try { body = JSON.parse(raw); }
      catch { return send(400, { code: 'rest_invalid_json', message: 'That request was not valid JSON.' }); }
    }
  }

  try {
    const out = await handle(req.method, url.pathname.slice(API.length) || '/', body, cart);
    send(out.status, out.json, {
      'Cart-Token': sign(cart.token),
      Nonce: createHmac('sha256', SECRET).update(`${cart.token}:${Date.now() / 6e4 | 0}`).digest('base64url').slice(0, 16)
    });
  } catch (err) {
    send(500, { code: 'internal', message: err?.message || 'Something went wrong.' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  const live = process.env.STRIPE_SECRET_KEY ? 'live Stripe' : 'test payments';
  const usps = process.env.USPS_CLIENT_ID ? 'live USPS' : `table rates (${RATES_REVISED})`;
  console.log(`Store API on http://127.0.0.1:${PORT}${API}`);
  console.log(`  catalogue ${PRODUCTS.length} products · ships from ${ORIGIN_ZIP} · ${usps} · ${live}`);
});
