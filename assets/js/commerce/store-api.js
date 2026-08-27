/**
 * A thin, careful client for the WooCommerce Store API.
 *
 * Three things about that API drive the shape of this file.
 *
 * The cart is server-side and identified by a token. Woo returns a
 * `Cart-Token` header on the first request and expects it back on every
 * subsequent one; lose it and the customer's basket silently becomes someone
 * else's empty one. It is a JWT identifying a cart, not a session or a login,
 * so localStorage is the right place for it and there is nothing sensitive in
 * it to protect.
 *
 * Writes need a nonce. Woo returns `Nonce` on responses and rejects POSTs that
 * do not echo it back, which is its CSRF defence. Nonces roll, so the value is
 * refreshed from every response rather than fetched once.
 *
 * Errors are structured. A failed add-to-cart returns 400 with a `code` and a
 * `message` written for a shopper ("Sorry, this product cannot be purchased"),
 * so the message is worth surfacing verbatim rather than replacing with
 * something generic.
 */

import { COMMERCE, apiUrl } from './config.js';

const TOKEN_KEY = 'aeindry.cart-token.v1';

let nonce = '';
let cartToken = read(TOKEN_KEY);

function read(key) {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}
function write(key, value) {
  try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch { /* private mode */ }
}

/** Thrown for anything the store refused; `code` is Woo's own error code. */
export class StoreError extends Error {
  constructor(message, { code = 'unknown', status = 0, data = null } = {}) {
    super(message);
    this.name = 'StoreError';
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

/** Forget the cart entirely — used when the server says the token is dead. */
export function resetCart() {
  cartToken = '';
  write(TOKEN_KEY, '');
}

export const hasCart = () => Boolean(cartToken);

/**
 * One Store API call.
 *
 * @param {string} path   route below /wc/store/v1
 * @param {object} [opts] { method, body, signal }
 */
export async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (cartToken) headers['Cart-Token'] = cartToken;
  if (nonce && method !== 'GET') headers.Nonce = nonce;

  // The caller's signal wins, but never wait forever on a store that is down.
  const timer = new AbortController();
  const t = setTimeout(() => timer.abort(), COMMERCE.timeoutMs);
  if (signal) signal.addEventListener('abort', () => timer.abort(), { once: true });

  let res;
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers,
      signal: timer.signal,
      // The Store API is public and token-addressed; sending cookies would
      // make every request preflight-sensitive for no benefit.
      credentials: 'omit',
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (err) {
    clearTimeout(t);
    throw new StoreError(
      err.name === 'AbortError' ? 'The store took too long to answer.' : 'Could not reach the store.',
      { code: 'network' }
    );
  }
  clearTimeout(t);

  // Refresh both on every response — the nonce rolls, and the token is only
  // issued once, on whichever request happens to create the cart.
  const freshNonce = res.headers.get('Nonce');
  if (freshNonce) nonce = freshNonce;
  const freshToken = res.headers.get('Cart-Token');
  if (freshToken && freshToken !== cartToken) {
    cartToken = freshToken;
    write(TOKEN_KEY, cartToken);
  }

  const text = await res.text();
  let payload = null;
  if (text) {
    try { payload = JSON.parse(text); } catch { /* non-JSON error page */ }
  }

  if (!res.ok) {
    const code = payload?.code || `http_${res.status}`;
    // A cart token that no longer resolves is not an error the shopper can
    // act on; drop it so the next call starts a fresh basket.
    if (res.status === 404 && String(code).includes('cart')) resetCart();
    throw new StoreError(
      payload?.message || `The store returned ${res.status}.`,
      { code, status: res.status, data: payload?.data || null }
    );
  }
  return payload;
}

export const get = (path, opts) => request(path, { ...opts, method: 'GET' });
export const post = (path, body, opts) => request(path, { ...opts, method: 'POST', body });

/**
 * Is there a WooCommerce on the other end, and is it healthy?
 * Used once at boot to decide whether to run live or fall back to the demo.
 */
export async function probe() {
  try {
    await get('/cart');
    return true;
  } catch (err) {
    if (err.code === 'network') return false;
    // A 4xx still proves something is answering the Store API.
    return err.status > 0 && err.status < 500;
  }
}
