/**
 * Where the storefront gets its commerce from.
 *
 * The site ships with two drivers behind one contract:
 *
 *   'local'  every price and total computed in the browser from
 *            data/products.js, persisted to localStorage. This is a catalogue
 *            demo. It cannot take money and must never be told it can.
 *
 *   'woo'    a WordPress + WooCommerce install answering on its Store API.
 *            The server owns the catalogue, the cart, the shipping rates, the
 *            tax and the order. The browser owns none of it.
 *
 * The split matters for one reason above all: a price computed in the browser
 * is a price the customer can edit. The local driver is honest about being a
 * demo; the Woo driver never sends a price at all, only product ids and
 * quantities, and reads every total back from the server.
 *
 * Point `storeUrl` at the WordPress origin and the site switches drivers on its
 * own. Nothing else in the front end changes.
 */

/* Read from a <meta name="aeindry-store" content="https://..."> if the host
   page sets one, so the same bundle can be deployed against staging and
   production without a rebuild. */
function metaStore() {
  if (typeof document === 'undefined') return '';
  const el = document.querySelector('meta[name="aeindry-store"]');
  return (el?.getAttribute('content') || '').trim().replace(/\/+$/, '');
}

/**
 * A `?store=` override, and only ever on a local origin.
 *
 * Being able to repoint the storefront from the address bar is how the tests
 * and a developer work against a store running on another port. On a public
 * origin the same feature is a phishing kit: a link with `?store=` pointed at
 * somebody else's server would render the real site, with the real branding,
 * around their prices and their checkout form. So it is refused anywhere that
 * is not loopback, where an attacker sending you the link has already lost.
 */
function overrideStore() {
  if (typeof location === 'undefined') return '';
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (!local) return '';
  try {
    const v = new URLSearchParams(location.search).get('store');
    return v ? v.trim().replace(/\/+$/, '') : '';
  } catch { return ''; }
}

export const COMMERCE = {
  /** WordPress origin, e.g. 'https://shop.aeindryskincare.com'. Empty = demo. */
  storeUrl: overrideStore() || metaStore(),

  /** Store API version path. Woo has kept v1 stable since 2021. */
  apiBase: '/wp-json/wc/store/v1',

  /** Presentation only — the server's own currency fields win when present. */
  currency: { code: 'USD', symbol: '$', minorUnit: 2 },

  /** Ship-from, used by the demo rate engine and shown on the contact page. */
  origin: { postcode: '98074', state: 'WA', country: 'US' },

  /** The demo's flat-rate threshold. Woo owns this in production. */
  freeShippingAt: 60,

  /** How long to wait on the store before falling back to the demo. */
  timeoutMs: 12000
};

export const isLive = () => Boolean(COMMERCE.storeUrl);

/** Absolute URL for a Store API route. */
export const apiUrl = (path) =>
  `${COMMERCE.storeUrl}${COMMERCE.apiBase}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Money in minor units, formatted.
 *
 * The Store API returns integer strings plus a `currency_minor_unit`, never a
 * float — deliberately, because binary floating point cannot hold 0.10 and a
 * cart that adds a few of those drifts. Everything here stays in cents until
 * the moment it is printed.
 */
export function formatMoney(minor, currency = COMMERCE.currency) {
  const unit = currency.minorUnit ?? 2;
  const value = Number(minor || 0) / 10 ** unit;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code || 'USD',
      minimumFractionDigits: unit,
      maximumFractionDigits: unit
    }).format(value);
  } catch {
    return `${currency.symbol || '$'}${value.toFixed(unit)}`;
  }
}

/** Dollars (as the local catalogue stores them) to minor units. */
export const toMinor = (amount, unit = COMMERCE.currency.minorUnit) =>
  Math.round(Number(amount || 0) * 10 ** unit);
