/**
 * Invoice — the document, on screen and on paper.
 *
 * Deliberately the plainest page on the site. Everywhere else the botanicals
 * and the floral ground are the point; here they are noise on something a
 * customer will file with a receipt or hand to an accountant. So: no artwork,
 * no reveal animations, black on white when printed.
 *
 * The route carries the order key as well as the id (`#/invoice/1042?key=…`)
 * because ids are sequential and the key is the only thing stopping someone
 * reading the range and collecting other people's names and addresses. The
 * server checks it; this page just carries it.
 *
 * "Save as PDF" is the browser's own print dialogue rather than a bundled PDF
 * library. It costs nothing, it honours the user's paper size, and it produces
 * a file their operating system already knows how to handle.
 */

import { $, esc } from '../lib/dom.js';
import { fetchInvoice, canTakePayment } from '../core/store.js';

const money = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(n) || 0);

const day = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(+d) ? '' : d.toLocaleDateString('en-US',
    { year: 'numeric', month: 'long', day: 'numeric' });
};

const addressLines = (a = {}) => [
  [a.first_name, a.last_name].filter(Boolean).join(' '),
  a.address_1, a.address_2,
  [a.city, a.state, a.postcode].filter(Boolean).join(', '),
  a.country && a.country !== 'US' ? a.country : ''
].filter(Boolean);

const block = (title, lines) => `
  <div class="inv-party">
    <h2 class="inv-party__title">${esc(title)}</h2>
    ${lines.map((l) => `<p>${esc(l)}</p>`).join('')}
  </div>`;

function invoice({ params = {}, query } = {}) {
  const orderId = params.id;
  // The router has already split the hash into path and query; re-parsing
  // `location.hash` here would work today and break the moment a route is
  // reached any other way.
  const key = (query?.get ? query.get('key') : query?.key) || '';

  return {
    title: `Invoice ${orderId ? `#${orderId}` : ''}`,
    html: `
    <section class="section section--flush-top invoice-page">
      <div class="wrap wrap--narrow">
        <div class="inv-actions no-print">
          <a class="btn btn--ghost btn--sm" href="#/"><span class="btn__label">Back to the shop</span></a>
          <button class="btn btn--primary btn--sm" type="button" data-inv-print>
            <span class="btn__label">Print or save as PDF</span>
          </button>
        </div>
        <article class="invoice" data-invoice aria-busy="true">
          <p class="inv-loading">Fetching your invoice…</p>
        </article>
      </div>
    </section>`,

    async mount(root) {
      const host = $('[data-invoice]', root);
      $('[data-inv-print]', root)?.addEventListener('click', () => window.print());

      const fail = (message) => {
        host.setAttribute('aria-busy', 'false');
        host.innerHTML = `<div class="inv-empty">
          <h1 class="display-sm">No invoice to show</h1>
          <p>${esc(message)}</p>
        </div>`;
      };

      if (!canTakePayment()) {
        return fail('This is a catalogue preview — no orders have been placed, so there '
          + 'is nothing to invoice. Connect a store and a real order gets a real invoice.');
      }
      if (!orderId || !key) {
        return fail('That link is missing its order key. Use the link in your '
          + 'confirmation email, which carries it.');
      }

      let data;
      try {
        data = await fetchInvoice(orderId, key);
      } catch (err) {
        return fail(err?.message || 'We could not load that invoice.');
      }
      if (!data) return fail('We could not find that order.');

      const cur = data.currency || 'USD';
      const paid = data.payment?.status === 'paid';
      const f = data.fulfilment || {};

      host.setAttribute('aria-busy', 'false');
      host.innerHTML = `
        <header class="inv-head">
          <div>
            <p class="inv-brand">${esc(data.seller?.name || 'Aeindry Skincare')}</p>
            <p class="inv-brand__tag">Purity is Essence</p>
          </div>
          <div class="inv-meta">
            <h1 class="inv-title">Invoice</h1>
            <p><strong>${esc(data.number)}</strong></p>
            <p>Issued ${esc(day(data.issued))}</p>
            ${data.due ? `<p>Due ${esc(day(data.due))}</p>` : ''}
            <p class="inv-status ${paid ? 'is-paid' : 'is-due'}">${paid ? 'Paid' : 'Payment pending'}</p>
          </div>
        </header>

        <div class="inv-parties">
          ${block('From', [
            data.seller?.name,
            data.seller?.line1,
            [data.seller?.city, data.seller?.state, data.seller?.zip].filter(Boolean).join(', '),
            data.seller?.email,
            data.seller?.taxId ? `Tax ID ${data.seller.taxId}` : ''
          ].filter(Boolean))}
          ${/* addressLines already leads with the name — passing buyer.name as
                well printed it twice. */ ''}
          ${block('Billed to', [
            ...addressLines(data.buyer?.address), data.buyer?.email
          ].filter(Boolean))}
          ${data.shipTo
            ? block('Shipped to', addressLines(data.shipTo))
            : block('Collection', [
                f.pickup?.name || 'Collect in person',
                f.pickup?.line1 || '',
                [f.pickup?.city, f.pickup?.state, f.pickup?.zip].filter(Boolean).join(', '),
                f.pickup?.note || ''
              ].filter(Boolean))}
        </div>

        <table class="inv-table">
          <caption class="visually-hidden">Items on invoice ${esc(data.number)}</caption>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col" class="num">Qty</th>
              <th scope="col" class="num">Unit</th>
              <th scope="col" class="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(data.lines || []).map((l) => `
              <tr>
                <td>${esc(l.name)}${l.variant ? `<span class="inv-variant">${esc(l.variant)}</span>` : ''}</td>
                <td class="num">${esc(String(l.qty))}</td>
                <td class="num">${esc(money(l.unit, cur))}</td>
                <td class="num">${esc(money(l.total, cur))}</td>
              </tr>`).join('')}
          </tbody>
          <tfoot>
            <tr><th scope="row" colspan="3">Subtotal</th><td class="num">${esc(money(data.subtotal, cur))}</td></tr>
            <tr><th scope="row" colspan="3">${esc(f.label || 'Delivery')}</th><td class="num">${esc(money(data.shipping, cur))}</td></tr>
            ${data.tax ? `<tr><th scope="row" colspan="3">Sales tax</th><td class="num">${esc(money(data.tax, cur))}</td></tr>` : ''}
            <tr class="inv-total"><th scope="row" colspan="3">Total</th><td class="num">${esc(money(data.total, cur))}</td></tr>
          </tfoot>
        </table>

        ${data.taxNote ? `<p class="inv-note">${esc(data.taxNote)}</p>` : ''}
        ${data.note ? `<p class="inv-note"><strong>Your note:</strong> ${esc(data.note)}</p>` : ''}
        <p class="inv-note">Order #${esc(String(data.orderId))}. Questions about this
          invoice: <a href="mailto:${esc(data.seller?.email || '')}">${esc(data.seller?.email || '')}</a>.</p>
        <p class="inv-thanks">Thank you — made by hand, and posted by one.</p>`;
    }
  };
}

/* This route is its query: the order key selects which document is shown, so a
   change to it has to re-render rather than be handed to the page as a filter
   change. See the guard in core/router.js. */
invoice.rerenderOnQuery = true;

export default invoice;
