/**
 * Transactional email — the order confirmation.
 *
 * One rule shapes this whole file: the checkout may only tell a customer their
 * confirmation is on its way if it actually is. So `sendOrderEmail` does not
 * return void and it does not throw on a misconfigured provider — it returns
 * `{ sent, reason }`, that result is stored on the order, and the confirmation
 * page renders from it. A shop that says "check your inbox" when no mail was
 * sent generates a support email per order and teaches customers not to
 * believe the next thing it says.
 *
 * Provider is chosen by which key is set, in this order:
 *
 *   RESEND_API_KEY      Resend's HTTP API. No dependency, no SMTP, and the
 *                       one most likely to work from a container that only
 *                       has outbound 443.
 *   AEINDRY_MAIL_WEBHOOK  POST the JSON payload somewhere of your choosing —
 *                       Zapier, Make, a Lambda, your own relay. The escape
 *                       hatch for anyone already sending mail some other way.
 *
 * With neither set nothing is sent, `sent` is false, and the reason says so.
 *
 * SMTP is deliberately not here: doing it properly means a dependency and a
 * long-lived connection, and every host worth using offers an HTTP API.
 */

import { SELLER } from './invoice.mjs';

const FROM = process.env.AEINDRY_MAIL_FROM || `${SELLER.name} <${SELLER.email}>`;
const SITE = (process.env.AEINDRY_SITE_URL || '').replace(/\/+$/, '');

/** Which provider is configured, if any. Also drives the boot banner. */
export function mailProvider() {
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.AEINDRY_MAIL_WEBHOOK) return 'webhook';
  return null;
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * The confirmation, built from the invoice rather than from the cart.
 *
 * Same discipline as the invoice page: the numbers a customer is emailed are
 * the numbers the server charged, read back off the order. Nothing here
 * recomputes a total.
 */
export function orderEmail(order, invoice) {
  const link = SITE && order.order_key
    ? `${SITE}/#/invoice/${order.order_id}?key=${encodeURIComponent(order.order_key)}`
    : '';

  const lines = (invoice.lines || []).map((l) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e8e4da">
        ${esc(l.name)}${l.variant ? `<br><span style="color:#6a6350;font-size:13px">${esc(l.variant)}</span>` : ''}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e4da;text-align:right;white-space:nowrap">
        ${l.qty} × ${money(l.unit)}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e4da;text-align:right;white-space:nowrap">
        ${money(l.total)}
      </td>
    </tr>`).join('');

  const row = (label, value, strong = false) => `
    <tr>
      <td colspan="2" style="padding:6px 0;${strong ? 'font-weight:600' : 'color:#6a6350'}">${esc(label)}</td>
      <td style="padding:6px 0;text-align:right;${strong ? 'font-weight:600' : ''}">${esc(value)}</td>
    </tr>`;

  /* The invoice carries an address object and a pickup point, not strings —
     flattened here rather than in the template so the text and HTML bodies
     cannot drift apart. */
  const addr = (a) => [
    [a?.first_name, a?.last_name].filter(Boolean).join(' '),
    a?.address_1, a?.address_2,
    [a?.city, a?.state, a?.postcode].filter(Boolean).join(' ')
  ].filter(Boolean).join('\n');

  const pickup = invoice.fulfilment?.pickup;
  const collectAt = pickup ? [pickup.name, pickup.town, pickup.zip].filter(Boolean).join(', ') : '';
  const shipTo = invoice.shipTo ? addr(invoice.shipTo) : '';
  const isCollect = invoice.fulfilment?.kind !== 'post';

  const where = collectAt
    ? `<p style="margin:0 0 4px"><strong>Collect from</strong></p>
       <p style="margin:0;color:#4a4636">${esc(collectAt)}</p>`
    : shipTo
      ? `<p style="margin:0 0 4px"><strong>Shipping to</strong></p>
         <p style="margin:0;color:#4a4636;white-space:pre-line">${esc(shipTo)}</p>`
      : '';

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f3f1ec;
  font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2b2822">
  <div style="max-width:560px;margin:0 auto;background:#fcfbf8;padding:32px;border:1px solid #e8e4da">
    <p style="margin:0 0 4px;letter-spacing:.14em;text-transform:uppercase;
       font-size:11px;color:#8a6111">${esc(SELLER.name)}</p>
    <h1 style="margin:0 0 20px;font:400 26px/1.2 Georgia,serif">Thank you.</h1>
    <p style="margin:0 0 20px">
      We have your order <strong>#${esc(order.order_id)}</strong>. It is made to order
      by hand, so give us a few days before it ships.
    </p>

    <table style="width:100%;border-collapse:collapse;margin:0 0 20px">
      ${lines}
      ${row('Subtotal', money(invoice.subtotal))}
      ${row(isCollect ? invoice.fulfilment?.label || 'Collection' : 'Shipping',
            invoice.shipping ? money(invoice.shipping) : 'Free')}
      ${invoice.tax ? row('Tax', money(invoice.tax)) : ''}
      ${row('Total', money(invoice.total), true)}
    </table>

    ${where}

    ${link ? `<p style="margin:24px 0 0">
      <a href="${esc(link)}" style="display:inline-block;padding:12px 20px;background:#2b2822;
         color:#fcfbf8;text-decoration:none;font-size:14px">View your invoice</a>
    </p>` : ''}

    <p style="margin:24px 0 0;font-size:13px;color:#6a6350">
      Invoice ${esc(invoice.number)} · Reply to this email and a real person will read it.
    </p>
  </div>
</body></html>`;

  const text = [
    `Thank you.`,
    ``,
    `We have your order #${order.order_id}. It is made to order by hand, so give`,
    `us a few days before it ships.`,
    ``,
    ...(invoice.lines || []).map((l) =>
      `  ${l.qty} × ${l.name}${l.variant ? ` (${l.variant})` : ''}  ${money(l.total)}`),
    ``,
    `  Subtotal  ${money(invoice.subtotal)}`,
    `  ${isCollect ? 'Collection' : 'Shipping'}  ${invoice.shipping ? money(invoice.shipping) : 'Free'}`,
    ...(invoice.tax ? [`  Tax       ${money(invoice.tax)}`] : []),
    `  Total     ${money(invoice.total)}`,
    ``,
    collectAt ? `Collect from: ${collectAt}` : (shipTo ? `Shipping to:\n${shipTo}` : ''),
    ``,
    link ? `Your invoice: ${link}` : '',
    ``,
    `Invoice ${invoice.number} · Reply to this email and a real person will read it.`
  ].filter((l) => l !== null).join('\n');

  return { subject: `Your Aeindry order #${order.order_id}`, html, text };
}

/**
 * Send it, and say honestly whether it went.
 *
 * Never throws: a mail provider being down must not fail an order that has
 * already been paid for. The order records the failure and the confirmation
 * page tells the customer to expect no email, which is recoverable. Losing
 * the order is not.
 */
export async function sendOrderEmail(order, invoice) {
  const to = order?.billing_address?.email || '';
  if (!to) return { sent: false, reason: 'no email address on the order' };

  const provider = mailProvider();
  if (!provider) return { sent: false, reason: 'no mail provider configured' };

  const msg = orderEmail(order, invoice);
  try {
    if (provider === 'resend') {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from: FROM, to: [to], subject: msg.subject, html: msg.html, text: msg.text })
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        return { sent: false, reason: `resend ${res.status}: ${body.slice(0, 160)}` };
      }
      return { sent: true, reason: '' };
    }

    const res = await fetch(process.env.AEINDRY_MAIL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, ...msg, order_id: order.order_id, invoice: invoice.number })
    });
    if (!res.ok) return { sent: false, reason: `webhook ${res.status}` };
    return { sent: true, reason: '' };
  } catch (err) {
    return { sent: false, reason: `could not reach the mail provider: ${String(err?.message || err).slice(0, 120)}` };
  }
}
