/**
 * Checkout.
 *
 * Four steps on one page — basket, address, delivery, payment — because a small
 * order does not deserve four page loads, and because every step after the
 * first is where carts get abandoned.
 *
 * Everything numeric on this page comes back from the server. The address form
 * posts to the store, the store answers with shipping options and a tax figure,
 * and the total is whatever it says. Nothing here adds anything up. That is not
 * caution about arithmetic; it is that a total computed in the browser is a
 * total the customer can change before paying it.
 *
 * When no store is connected the page still renders, still quotes nothing, and
 * says plainly that it cannot take money. A checkout that prints a confirmation
 * it cannot honour is worse than one that is honestly switched off.
 */

import { $, $$, esc } from '../lib/dom.js';
import { formatPrice } from '../data/products.js';
import {
  getCart, cartTotals, cartCount, setQty, removeFromCart,
  shippingRates, selectedRate, setCustomer, selectShippingRate,
  placeOrder, canTakePayment, bus
} from '../core/store.js';
import { toMinor } from '../commerce/config.js';
import { loadPaymentConfig, canCollectCard, paymentMode, mountCard, unmountCard,
         updateAmount, validateCard, confirmPayment } from '../commerce/stripe.js';
import { pageField, initBotField } from '../ui/bot-field.js';
import { toast } from '../ui/toast.js';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH',
  'OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];

const field = (name, label, opts = {}) => `
  <div class="field ${opts.wide ? 'field--wide' : ''}">
    <label for="co-${name}">${esc(label)}${opts.optional ? ' <span class="field__opt">optional</span>' : ''}</label>
    ${opts.options
      ? `<select id="co-${name}" name="${name}" ${opts.optional ? '' : 'required'}>
           <option value="">Choose…</option>
           ${opts.options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}
         </select>`
      : `<input id="co-${name}" name="${name}" type="${opts.type || 'text'}"
           ${opts.optional ? '' : 'required'} autocomplete="${opts.autocomplete || 'on'}"
           inputmode="${opts.inputmode || 'text'}" placeholder="${esc(opts.placeholder || '')}">`}
    <p class="field__error" data-error-for="${name}" hidden></p>
  </div>`;

export default function checkout() {
  return {
    title: 'Checkout',
    html: `
    <header class="page-head page-head--tight">
      ${pageField('checkout')}
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Home</a><span aria-hidden="true">·</span>
          <a href="#/shop">Shop</a><span aria-hidden="true">·</span>
          <span aria-current="page">Checkout</span>
        </nav>
        <h1 class="display-md" data-split="lines">Checkout</h1>
      </div>
    </header>

    <section class="section section--flush-top">
      <div class="wrap">
        <div class="checkout" data-checkout>
          <div class="checkout__main">

            <div class="co-notice" data-co-notice hidden></div>

            <section class="co-step" aria-labelledby="co-basket-h">
              <h2 class="co-step__title" id="co-basket-h"><span class="co-step__n">1</span> Your basket</h2>
              <div data-co-lines></div>
            </section>

            <form class="co-step" data-co-form novalidate aria-labelledby="co-addr-h">
              <h2 class="co-step__title" id="co-addr-h"><span class="co-step__n">2</span> Where it is going</h2>
              <div class="co-grid">
                ${field('email', 'Email', { type: 'email', autocomplete: 'email', inputmode: 'email', wide: true, placeholder: 'For your receipt and tracking' })}
                ${field('first_name', 'First name', { autocomplete: 'given-name' })}
                ${field('last_name', 'Last name', { autocomplete: 'family-name' })}
                ${field('address_1', 'Address', { autocomplete: 'address-line1', wide: true })}
                ${field('address_2', 'Apartment, suite', { autocomplete: 'address-line2', wide: true, optional: true })}
                ${field('city', 'Town or city', { autocomplete: 'address-level2' })}
                ${field('state', 'State', { autocomplete: 'address-level1', options: US_STATES })}
                ${field('postcode', 'ZIP code', { autocomplete: 'postal-code', inputmode: 'numeric' })}
                ${field('phone', 'Phone', { type: 'tel', autocomplete: 'tel', inputmode: 'tel', optional: true })}
              </div>
              <button class="btn btn--ghost" type="submit" data-co-quote>
                <span class="btn__label">Get delivery options</span>
              </button>
            </form>

            <section class="co-step" data-co-ship-step hidden aria-labelledby="co-ship-h">
              <h2 class="co-step__title" id="co-ship-h"><span class="co-step__n">3</span> Delivery</h2>
              <div data-co-rates></div>
            </section>

            <section class="co-step" data-co-pay-step hidden aria-labelledby="co-pay-h">
              <h2 class="co-step__title" id="co-pay-h"><span class="co-step__n">4</span> Payment</h2>
              <div data-co-payment></div>
            </section>
          </div>

          <aside class="checkout__summary" data-co-summary aria-label="Order summary"></aside>
        </div>
      </div>
    </section>`,

    mount(root) {
      initBotField(root);

      const notice = $('[data-co-notice]', root);
      const linesEl = $('[data-co-lines]', root);
      const form = $('[data-co-form]', root);
      const shipStep = $('[data-co-ship-step]', root);
      const ratesEl = $('[data-co-rates]', root);
      const payStep = $('[data-co-pay-step]', root);
      const payEl = $('[data-co-payment]', root);
      const summary = $('[data-co-summary]', root);

      /* ── the honest banner ─────────────────────────────────────────────── */
      if (!canTakePayment()) {
        notice.hidden = false;
        notice.className = 'co-notice co-notice--warn';
        notice.innerHTML = `
          <strong>This is a catalogue preview.</strong>
          No store is connected, so nothing here can take a payment and no order
          will reach anyone. Delivery is shown at a flat rate rather than quoted
          from USPS. Connecting a WooCommerce store switches all of that on —
          see <code>docs/COMMERCE.md</code>.`;
      }

      /* ── basket ────────────────────────────────────────────────────────── */
      function drawLines() {
        const lines = getCart();
        if (!lines.length) {
          linesEl.innerHTML = `<p class="co-empty">Your basket is empty.
            <a href="#/shop">Find something</a>.</p>`;
          return;
        }
        linesEl.innerHTML = `<ul class="co-lines">${lines.map((l) => `
          <li class="co-line">
            <div class="co-line__body">
              <p class="co-line__name">${esc(l.product?.name || l.productId)}</p>
              ${l.variant ? `<p class="co-line__variant">${esc(l.variant.label || l.variant.id)}</p>` : ''}
              <p class="co-line__unit">${formatPrice(l.unit)} each</p>
            </div>
            <div class="co-line__qty">
              <button type="button" class="qty__btn" data-co-dec="${esc(l.productId)}" data-variant="${esc(l.variantId || '')}" aria-label="One fewer ${esc(l.product?.name || '')}">&minus;</button>
              <span class="qty__n">${l.qty}</span>
              <button type="button" class="qty__btn" data-co-inc="${esc(l.productId)}" data-variant="${esc(l.variantId || '')}" aria-label="One more ${esc(l.product?.name || '')}">+</button>
            </div>
            <p class="co-line__total">${formatPrice(l.total)}</p>
            <button type="button" class="co-line__rm" data-co-rm="${esc(l.productId)}" data-variant="${esc(l.variantId || '')}" aria-label="Remove ${esc(l.product?.name || '')}">Remove</button>
          </li>`).join('')}</ul>`;
      }

      linesEl.addEventListener('click', (e) => {
        const inc = e.target.closest('[data-co-inc]');
        const dec = e.target.closest('[data-co-dec]');
        const rm = e.target.closest('[data-co-rm]');
        const btn = inc || dec || rm;
        if (!btn) return;
        const id = btn.dataset.coInc || btn.dataset.coDec || btn.dataset.coRm;
        const variant = btn.dataset.variant || null;
        const line = getCart().find((l) => l.productId === id && (l.variantId || '') === (variant || ''));
        if (!line) return;
        if (rm) removeFromCart(id, variant);
        else setQty(id, variant, line.qty + (inc ? 1 : -1));
      });

      /* ── summary ───────────────────────────────────────────────────────── */
      function drawSummary() {
        const t = cartTotals();
        const rate = shippingRates().find((r) => r.id === selectedRate());
        const row = (label, value, cls = '') =>
          `<div class="co-sum__row ${cls}"><span>${label}</span><span>${value}</span></div>`;
        summary.innerHTML = `
          <h2 class="co-sum__title">Summary</h2>
          ${row('Items', `${cartCount()}`)}
          ${row('Subtotal', formatPrice(t.subtotal))}
          ${row('Delivery', rate ? formatPrice(t.shipping)
            : t.live ? '<em>enter an address</em>' : formatPrice(t.shipping))}
          ${t.tax ? row('Estimated tax', formatPrice(t.tax)) : ''}
          ${row('Total', formatPrice(t.total), 'co-sum__row--total')}
          ${rate?.estimated ? `<p class="co-sum__note">Delivery is an estimate from a
            published rate table, not a live quote. The exact charge is confirmed
            when your label is printed.</p>` : ''}`;
      }

      /* ── address → rates ───────────────────────────────────────────────── */
      function readAddress() {
        const data = Object.fromEntries(new FormData(form).entries());
        return { ...data, country: 'US' };
      }

      function showErrors(missing) {
        $$('[data-error-for]', form).forEach((p) => { p.hidden = true; p.textContent = ''; });
        for (const [name, message] of Object.entries(missing)) {
          const p = $(`[data-error-for="${name}"]`, form);
          if (p) { p.textContent = message; p.hidden = false; }
        }
      }

      function validate(addr) {
        const missing = {};
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr.email || '')) missing.email = 'We need a working email for your receipt.';
        if (!addr.first_name) missing.first_name = 'Required.';
        if (!addr.last_name) missing.last_name = 'Required.';
        if (!addr.address_1) missing.address_1 = 'Required.';
        if (!addr.city) missing.city = 'Required.';
        if (!addr.state) missing.state = 'Choose a state.';
        if (!/^\d{5}(-\d{4})?$/.test(addr.postcode || '')) missing.postcode = 'Five digits, e.g. 98074.';
        return missing;
      }

      let quoting = false;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (quoting) return;
        const addr = readAddress();
        const missing = validate(addr);
        showErrors(missing);
        if (Object.keys(missing).length) {
          $(`[name="${Object.keys(missing)[0]}"]`, form)?.focus();
          return;
        }
        if (!getCart().length) { toast('Your basket is empty.'); return; }

        quoting = true;
        const btn = $('[data-co-quote]', form);
        const label = $('.btn__label', btn);
        const was = label.textContent;
        label.textContent = 'Checking rates…';
        btn.disabled = true;
        try {
          await setCustomer(addr);
          drawRates();
          shipStep.hidden = false;
          shipStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
          toast(err?.message || 'We could not get delivery options just now.');
        } finally {
          quoting = false;
          btn.disabled = false;
          label.textContent = was;
        }
      });

      function drawRates() {
        const rates = shippingRates();
        if (!rates.length) {
          ratesEl.innerHTML = `<p class="co-empty">No delivery options came back for that
            address. Check the ZIP code, or <a href="#/contact">get in touch</a>.</p>`;
          payStep.hidden = true;
          return;
        }
        const chosen = selectedRate();
        /* Collection and hand delivery come back first from the server and are
           badged here, because "free, and it is four miles away" is a different
           offer from a postage price and should not look like one. */
        const nearby = rates.find((r) => r.pickup);
        ratesEl.innerHTML = `
          ${nearby ? `<p class="co-near">
            ${nearby.miles < 1
              ? `You are in ${esc(nearby.pickup.city)}`
              : `You are about ${esc(String(nearby.miles))} ${nearby.miles === 1 ? 'mile' : 'miles'} from ${esc(nearby.pickup.city)}`
            }, so you can collect instead of paying postage.
          </p>` : ''}
          <ul class="co-rates">${rates.map((r) => `
            <li>
              <label class="co-rate ${r.id === chosen ? 'is-on' : ''} ${r.kind !== 'post' ? 'co-rate--local' : ''}">
                <input type="radio" name="rate" value="${esc(r.id)}" ${r.id === chosen ? 'checked' : ''}>
                <span class="co-rate__name">${esc(r.name)}${
                  r.kind !== 'post' ? '<span class="co-rate__tag">nearby</span>' : ''}</span>
                <span class="co-rate__days">${esc(r.delivery || '')}</span>
                <span class="co-rate__price">${r.price === 0 ? 'Free' : formatPrice(r.price)}</span>
              </label>
              ${r.pickup && r.id === chosen ? `<div class="co-pickup">
                <p class="co-pickup__name">${esc(r.pickup.name || 'Collection point')}</p>
                ${r.pickup.line1 ? `<p>${esc(r.pickup.line1)}</p>` : ''}
                <p>${esc([r.pickup.city, r.pickup.state, r.pickup.zip].filter(Boolean).join(', '))}</p>
                ${r.pickup.note ? `<p class="co-pickup__note">${esc(r.pickup.note)}</p>` : ''}
              </div>` : ''}
            </li>`).join('')}</ul>`;
        drawPayment();
        payStep.hidden = false;
      }

      ratesEl.addEventListener('change', async (e) => {
        const input = e.target.closest('input[name="rate"]');
        if (!input) return;
        try {
          await selectShippingRate(input.value);
          drawRates();
        } catch (err) {
          toast(err?.message || 'That option is no longer available.');
        }
      });

      /* ── payment ───────────────────────────────────────────────────────── */
      let cardMounted = false;
      async function drawPayment() {
        /* Once the card form is up, a shipping change must not tear it down:
           re-mounting throws away everything typed into Stripe's iframe. Only
           the amount and the button label move. */
        if (cardMounted) {
          updateAmount(toMinor(cartTotals().total));
          const lbl = $('[data-co-pay] .btn__label', payEl);
          if (lbl) lbl.textContent = `Pay ${formatPrice(cartTotals().total)}`;
          return;
        }
        if (!canTakePayment()) {
          payEl.innerHTML = `
            <p class="co-empty">
              No payment processor is connected, so this preview stops here.
              With a WooCommerce store behind it, this step is card, Apple Pay
              and Google Pay — entered inside the processor's own frame, so card
              numbers never reach this site.
            </p>`;
          return;
        }

        await loadPaymentConfig();

        /* Half-configured — a secret key with no publishable one. The server
           could create an intent the browser has no way to confirm, so a Pay
           button here would record a paid order against money that never
           moved. Refuse rather than offer it. */
        if (paymentMode() === 'misconfigured') {
          payEl.innerHTML = `
            <p class="co-notice co-notice--warn">
              <strong>Card payments are not switched on yet.</strong>
              The basket and the shipping quote are real, but this shop cannot
              take money until its payment keys are set. Nothing was charged.
            </p>`;
          return;
        }

        /* Test mode — the store is real, the money is not. Orders still place,
           which is how this is exercised end to end; the confirmation says
           plainly that nothing was charged. */
        if (!canCollectCard()) {
          payEl.innerHTML = `
            <p class="co-notice">
              <strong>Test mode.</strong> This store is running without payment
              keys, so the order will be recorded and no money will move.
            </p>
            <button class="btn btn--primary btn--lg" type="button" data-co-pay>
              <span class="btn__label">Pay ${formatPrice(cartTotals().total)}</span>
            </button>`;
          $('[data-co-pay]', payEl).addEventListener('click', pay);
          return;
        }

        payEl.innerHTML = `
          <p class="co-pay__lede">Card details are handled by our payment
            processor and never touch this site.</p>
          <div class="co-pay__mount" data-stripe-mount></div>
          <button class="btn btn--primary btn--lg" type="button" data-co-pay disabled>
            <span class="btn__label">Pay ${formatPrice(cartTotals().total)}</span>
          </button>
          <p class="co-pay__fine">By paying you agree to our returns policy.</p>`;

        const btn = $('[data-co-pay]', payEl);
        const mount = await mountCard($('[data-stripe-mount]', payEl), {
          amountMinor: toMinor(cartTotals().total),
          currency: (cartTotals().currency || 'usd').toLowerCase()
        });
        if (!mount.ok) {
          payEl.innerHTML = `
            <p class="co-notice co-notice--warn">
              <strong>The card form could not load.</strong>
              ${mount.reason === 'sdk-blocked'
                ? 'Something on this connection is blocking our payment provider — an extension, or a network policy. Try another browser.'
                : 'Card payments are not configured on this shop.'}
              Nothing was charged.
            </p>`;
          return;
        }
        cardMounted = true;
        btn.disabled = false;
        btn.addEventListener('click', pay);
      }

      let paying = false;
      async function pay() {
        if (paying) return;
        paying = true;
        const btn = $('[data-co-pay]', payEl);
        const label = $('.btn__label', btn);
        const was = label.textContent;
        btn.disabled = true;
        label.textContent = 'Taking payment…';
        try {
          /* Validate the card before the order exists. Placing first would
             strand an order behind every mistyped card number, and those are
             indistinguishable from real unpaid ones. Skipped in test mode,
             where there is no card form to validate. */
          if (cardMounted) {
            const valid = await validateCard();
            if (!valid.ok) throw new Error(valid.message);
          }

          const addr = readAddress();
          const order = await placeOrder({
            billing_address: addr,
            shipping_address: addr,
            customer_note: '',
            payment_method: 'stripe',
            payment_data: []
          });

          /* The server created the intent for its own total and handed back the
             secret to confirm it. Until this succeeds no money has moved,
             whatever the order record says. */
          const secret = (order?.payment_result?.payment_details || [])
            .find((d) => d.key === 'client_secret')?.value;
          if (secret) {
            label.textContent = 'Confirming…';
            const paid = await confirmPayment(secret, location.href);
            if (!paid.ok) {
              /* The order stands, unpaid, with its invoice link — which is what
                 a customer needs to finish or query it. */
              showConfirmation({ ...order, payment_failed: paid.message });
              return;
            }
          }
          unmountCard();
          showConfirmation(order);
        } catch (err) {
          toast(err?.message || 'The payment did not go through. Nothing was charged.');
          btn.disabled = false;
          label.textContent = was;
        } finally {
          paying = false;
        }
      }

      function showConfirmation(order) {
        const status = order?.payment_result?.payment_status;
        const failed = order?.payment_failed;
        const wrap = $('.checkout', root);
        wrap.innerHTML = `
          <div class="co-done">
            <h2 class="display-md">${failed ? 'Almost.' : 'Thank you.'}</h2>
            ${failed ? `<p class="co-notice co-notice--warn">
              <strong>The payment did not go through.</strong> ${esc(failed)}
              Your order is saved and nothing was charged — open the invoice
              below to try again, or write to us and we will sort it out.
            </p>` : ''}
            <p class="co-done__lede">
              Order <strong>#${esc(String(order?.order_id ?? ''))}</strong> is with us.
              ${order?.email_sent
                ? `A confirmation is on its way to
                   <strong>${esc(order?.billing_address?.email || 'your inbox')}</strong>.`
                : 'Keep the invoice link below — it is your copy of this order.'}
            </p>
            ${order?.email_sent === false && status !== 'test' ? `
              <!-- Said out loud rather than swallowed. A customer who is told
                   to watch their inbox and never gets anything writes in; one
                   who is told up front to keep the link does not. -->
              <p class="co-notice">
                <strong>No confirmation email was sent.</strong>
                Save the invoice link below, or write to us and we will resend it.
              </p>` : ''}
            ${status === 'test' ? `<p class="co-notice co-notice--warn">
              <strong>Test mode.</strong> No money moved and no order was really placed.
            </p>` : ''}
            ${order?.invoice_number ? `<p class="co-done__inv">
              Invoice <strong>${esc(order.invoice_number)}</strong>
            </p>` : ''}
            <div class="cluster" style="justify-content:center">
              ${order?.order_id && order?.order_key ? `<a class="btn btn--primary"
                href="#/invoice/${esc(String(order.order_id))}?key=${esc(order.order_key)}">
                <span class="btn__label">View invoice</span></a>` : ''}
              <a class="btn btn--ghost" href="#/shop"><span class="btn__label">Keep looking</span></a>
            </div>
          </div>`;
      }

      /* ── wiring ────────────────────────────────────────────────────────── */
      const redraw = () => { drawLines(); drawSummary(); if (!payStep.hidden) drawPayment(); };
      const off = bus.on('cart:change', redraw);
      const offErr = bus.on('cart:error', (d) => toast(d.message));
      redraw();

      return () => { off(); offErr(); unmountCard(); };
    }
  };
}
