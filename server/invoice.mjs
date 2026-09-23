/**
 * Invoices.
 *
 * An invoice is not a prettier receipt: it is the document a buyer files for
 * expenses and a seller keeps for the books, so it has to carry things the
 * confirmation screen does not — a stable number, the seller's legal identity,
 * the date the money moved, and what was actually charged for postage and tax
 * as separate lines.
 *
 * Two rules shape everything here.
 *
 * It is built from the ORDER, never from the cart. The cart is the customer's
 * working copy and it is emptied the moment the order is placed; an invoice
 * regenerated from it a week later would be blank or, worse, quietly different.
 *
 * Nothing is recomputed. The order stored what was charged; the invoice repeats
 * it. If a price or a tax rate changes next month, last month's invoice must
 * still say what the customer paid, and an invoice that recalculates is an
 * invoice that eventually disagrees with the bank.
 */

import { isLocal } from './fulfilment.mjs';

/** Who is issuing. Legal identity, not marketing — override from the env. */
export const SELLER = {
  name: process.env.AEINDRY_LEGAL_NAME || 'Aeindry Skincare',
  line1: process.env.AEINDRY_ADDR_1 || '',
  city: process.env.AEINDRY_CITY || 'Sammamish',
  state: process.env.AEINDRY_STATE || 'WA',
  zip: process.env.AEINDRY_ZIP || '98074',
  country: 'US',
  email: process.env.AEINDRY_EMAIL || 'contactus@aeindryskincare.com',
  // Left blank rather than invented: a made-up registration number on a real
  // invoice is a document that lies about a real company.
  taxId: process.env.AEINDRY_TAX_ID || '',
  phone: process.env.AEINDRY_PHONE || ''
};

const MINOR = 2;
const money = (minor) => (Number(minor || 0) / 100);

/**
 * A serial the buyer can quote down a phone.
 * Year-scoped so numbering restarts cleanly and never collides with an order id.
 */
export function invoiceNumber(order) {
  const year = new Date(order.placed_at).getUTCFullYear();
  return `AE-${year}-${String(order.id).padStart(5, '0')}`;
}

/**
 * The invoice for an order, as data. Rendering is somebody else's problem —
 * the same structure serves the printable page, an email, and an accountant's
 * CSV without any of them re-deriving a total.
 */
export function buildInvoice(order) {
  if (!order) return null;

  const lines = order.items.map((it) => {
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const lineTotal = Number(it.totals?.line_subtotal ?? it.line_subtotal ?? 0);
    return {
      name: it.name,
      variant: it.variation?.[0]?.value || it.variant || '',
      sku: it.sku || it.id || '',
      qty,
      // Unit price is derived from the line, not from the catalogue: the
      // catalogue moves, the line is what was charged.
      unit: money(qty ? lineTotal / qty : lineTotal),
      total: money(lineTotal)
    };
  });

  const t = order.totals || {};
  const local = isLocal(order.shipping_method);
  const paid = order.status === 'processing' || order.status === 'completed';

  return {
    number: invoiceNumber(order),
    orderId: order.id,
    orderKey: order.key,
    issued: order.placed_at,
    // An unpaid invoice is due; a paid one is a receipt and has no due date.
    due: paid ? null : new Date(Date.parse(order.placed_at) + 7 * 864e5).toISOString(),
    currency: t.currency_code || 'USD',
    minorUnit: Number(t.currency_minor_unit ?? MINOR),

    seller: SELLER,
    buyer: {
      name: [order.billing_address?.first_name, order.billing_address?.last_name]
        .filter(Boolean).join(' '),
      email: order.billing_address?.email || order.shipping_address?.email || '',
      phone: order.billing_address?.phone || '',
      address: order.billing_address || {}
    },
    shipTo: local ? null : order.shipping_address,

    fulfilment: {
      method: order.shipping_method,
      kind: local ? (order.shipping_method === 'local_pickup' ? 'pickup' : 'delivery') : 'post',
      label: order.shipping_label || order.shipping_method,
      pickup: order.pickup || null
    },

    lines,
    subtotal: money(t.total_items),
    shipping: money(t.total_shipping),
    tax: money(t.total_tax),
    taxNote: Number(t.total_tax || 0) > 0
      ? 'Washington state and local sales tax, estimated at the destination rate.'
      : '',
    total: money(t.total_price),

    payment: {
      status: paid ? 'paid' : 'pending',
      method: order.payment_method || '',
      // Never the card number, never the intent secret — only a reference a
      // support conversation can actually use.
      reference: order.payment_reference || ''
    },
    note: order.customer_note || ''
  };
}
