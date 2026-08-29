/**
 * Card collection, via Stripe's Payment Element.
 *
 * The split of responsibility is the whole point:
 *
 *   the server  creates a PaymentIntent for its own computed total and hands
 *               back a client secret. It never sees a card.
 *   this file   mounts Stripe's iframe, which collects the card inside
 *               Stripe's own origin, and confirms that intent. It never sees a
 *               card either — the fields are not ours and not readable from
 *               this document.
 *
 * Without both keys nothing here runs and `canCollectCard()` is false, which
 * the checkout renders as an honest refusal rather than a Pay button that
 * takes an order and no money.
 */

import { COMMERCE, apiUrl } from './config.js';

const SDK = 'https://js.stripe.com/v3/';

let config = null;   // what the server said about payment
let stripe = null;   // the Stripe instance, once the SDK is in
let elements = null; // the current Elements group
let mounted = null;  // the mounted Payment Element

/** Ask the server once what it can actually do. */
export async function loadPaymentConfig() {
  if (config) return config;
  if (!COMMERCE.storeUrl) {
    config = { provider: 'none', mode: 'none', publishable_key: '', can_collect_card: false };
    return config;
  }
  try {
    const res = await fetch(apiUrl('/payment-config'), { credentials: 'include' });
    config = res.ok ? await res.json()
                    : { provider: 'none', mode: 'none', publishable_key: '', can_collect_card: false };
  } catch {
    /* A store that does not answer this route at all is an older deployment,
       not a broken one — treat it as test mode rather than blocking checkout. */
    config = { provider: 'none', mode: 'test', publishable_key: '', can_collect_card: false };
  }
  return config;
}

export const canCollectCard = () => Boolean(config?.can_collect_card);
export const paymentProvider = () => config?.provider || 'none';
/** 'card' | 'test' | 'misconfigured' | 'none' — see paymentConfig() on the server. */
export const paymentMode = () => config?.mode || 'none';

/**
 * Pull in Stripe's SDK.
 *
 * Loaded on demand rather than in the page head: it is a third-party script on
 * every route if you put it in the document, and it is only ever needed by one
 * step of one page. Resolves false rather than throwing when it cannot load —
 * blocked by a content policy, offline, an ad blocker — so the caller can say
 * so instead of showing a broken step.
 */
function loadSdk() {
  if (window.Stripe) return Promise.resolve(true);
  const existing = document.querySelector(`script[src="${SDK}"]`);
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener('load', () => resolve(Boolean(window.Stripe)), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
    });
  }
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = SDK;
    s.async = true;
    s.onload = () => resolve(Boolean(window.Stripe));
    s.onerror = () => resolve(false);
    document.head.append(s);
  });
}

/**
 * Mount the card fields into `el`, styled to the page.
 *
 * Uses Elements in "deferred intent" mode: the amount is declared up front so
 * Stripe can decide which payment methods to offer, but no intent exists yet.
 * The intent is created by the server at the moment the customer presses Pay,
 * for the total the server itself computes — so a total that changes between
 * mounting and paying cannot be exploited, and a customer who never presses
 * Pay leaves no abandoned intent behind.
 */
export async function mountCard(el, { amountMinor, currency = 'usd' }) {
  await loadPaymentConfig();
  if (!canCollectCard()) return { ok: false, reason: 'not-configured' };
  if (!(await loadSdk())) return { ok: false, reason: 'sdk-blocked' };

  stripe = stripe || window.Stripe(config.publishable_key);

  const dark = matchMedia('(prefers-color-scheme: dark)').matches
    && document.documentElement.dataset.theme !== 'light'
    || document.documentElement.dataset.theme === 'dark';
  const css = getComputedStyle(document.documentElement);
  const token = (name, fallback) => (css.getPropertyValue(name) || '').trim() || fallback;

  elements = stripe.elements({
    mode: 'payment',
    amount: Math.max(50, Math.round(amountMinor)),   // Stripe's floor is 50c
    currency,
    appearance: {
      theme: dark ? 'night' : 'flat',
      variables: {
        colorPrimary: token('--gilt-text', '#8A6111'),
        colorBackground: token('--paper-0', '#FCFBF8'),
        colorText: token('--text', '#2B2822'),
        fontFamily: token('--font-sans', 'system-ui, sans-serif'),
        borderRadius: '4px',
        spacingUnit: '4px'
      }
    }
  });
  mounted = elements.create('payment', { layout: 'tabs' });
  mounted.mount(el);
  return { ok: true };
}

export function unmountCard() {
  try { mounted?.unmount(); } catch { /* already gone with the page */ }
  mounted = null;
  elements = null;
}

/** Re-declare the amount when shipping changes the total under the Element. */
export function updateAmount(amountMinor) {
  if (!elements) return;
  elements.update({ amount: Math.max(50, Math.round(amountMinor)) });
}

/**
 * Validate the card fields before an order is created.
 *
 * Order of operations matters here. `elements.submit()` runs Stripe's own
 * validation, and it has to happen *before* the server places the order:
 * placing first would leave an order behind every time someone mistypes a card
 * number, and those orders look exactly like real unpaid ones.
 */
export async function validateCard() {
  if (!elements) return { ok: false, message: 'The card form is not ready yet.' };
  const { error } = await elements.submit();
  return error ? { ok: false, message: error.message || 'Please check the card details.' }
               : { ok: true };
}

/**
 * Confirm the intent the server created.
 *
 * `redirect: 'if_required'` keeps a plain card payment on the page while still
 * allowing the methods that genuinely have to leave it — a bank's 3-D Secure
 * page, or a wallet — to do so and come back to `returnUrl`.
 */
export async function confirmPayment(clientSecret, returnUrl) {
  if (!stripe || !elements) return { ok: false, message: 'The card form is not ready yet.' };
  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: { return_url: returnUrl },
    redirect: 'if_required'
  });
  if (error) {
    return { ok: false, message: error.message || 'The card was declined. Nothing was charged.' };
  }
  const status = paymentIntent?.status;
  if (status === 'succeeded' || status === 'processing') {
    return { ok: true, status, reference: paymentIntent.id };
  }
  return { ok: false, message: `The payment did not complete (${status || 'unknown'}). Nothing was charged.` };
}
