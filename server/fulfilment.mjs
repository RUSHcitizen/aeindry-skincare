/**
 * Fulfilment options that are not the post office.
 *
 * A maker who sells to their own town loses money posting a $12 soap eight
 * miles. This offers collection and a local drop-off when the buyer is close
 * enough for either to make sense, alongside the USPS quotes.
 *
 * ── On the addresses ──────────────────────────────────────────────────────
 * Every location here is CONFIGURATION, not content. The site knows the
 * business is in Sammamish, Washington because that is published; it does not
 * know the street, and a street invented for a real shop is a customer sent to
 * a stranger's door. So the default below carries the town and ZIP only, and
 * says the exact address follows by email. Fill `PICKUP_POINTS` in (or set
 * AEINDRY_PICKUP to a JSON array) and it becomes a real address on the page.
 *
 * Set AEINDRY_PICKUP to `[]` to switch collection off entirely.
 */

import { milesBetween } from './usps.mjs';

/** Where orders can be collected. Distances are computed from `zip`. */
export const PICKUP_POINTS = readPickupConfig() ?? [
  {
    id: 'studio',
    name: 'The studio',
    // Deliberately not a street address — see the note above.
    line1: '',
    city: 'Sammamish',
    state: 'WA',
    zip: '98074',
    hours: 'By arrangement — we will email you a time within one working day.',
    note: 'The exact address comes with your confirmation email.'
  }
];

function readPickupConfig() {
  const raw = process.env.AEINDRY_PICKUP;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    console.warn('AEINDRY_PICKUP is not valid JSON — falling back to the default point.');
    return null;
  }
}

/* How near counts as near. Collection is offered further out than delivery,
   because the buyer chooses to travel and we do not. */
export const PICKUP_RADIUS_MILES = Number(process.env.AEINDRY_PICKUP_RADIUS || 25);
export const DELIVERY_RADIUS_MILES = Number(process.env.AEINDRY_DELIVERY_RADIUS || 12);
export const DELIVERY_FEE = Number(process.env.AEINDRY_DELIVERY_FEE ?? 6);
/** Local delivery is free once the basket is worth the trip. */
export const DELIVERY_FREE_OVER = Number(process.env.AEINDRY_DELIVERY_FREE_OVER ?? 60);

/**
 * Pickup points within range of a ZIP, nearest first.
 * Returns [] when nothing is close, which is the common case.
 */
export function nearbyPickups(toZip, radius = PICKUP_RADIUS_MILES) {
  if (!toZip) return [];
  return PICKUP_POINTS
    .map((p) => ({ ...p, miles: Math.round(milesBetween(p.zip, toZip)) }))
    .filter((p) => p.miles <= radius)
    .sort((a, b) => a.miles - b.miles);
}

/**
 * The non-postal rates for a basket going to `address`.
 *
 * Shaped exactly like the USPS quotes so the checkout does not care which is
 * which: one list of options, one selected id, one price.
 */
export function localRates(address, subtotal = 0) {
  const zip = address?.postcode;
  const state = (address?.state || '').toUpperCase();
  if (!zip || (address?.country && address.country !== 'US')) return [];

  const points = nearbyPickups(zip);
  if (!points.length) return [];
  const nearest = points[0];
  const rates = [];

  rates.push({
    service: 'local_pickup',
    name: `Collect in ${nearest.city}`,
    price: 0,
    days: nearest.hours,
    kind: 'pickup',
    pickup: nearest,
    miles: nearest.miles
  });

  // Delivery only inside the tighter radius, and only in-state — driving a
  // parcel across a state line is a different business.
  if (nearest.miles <= DELIVERY_RADIUS_MILES && state === nearest.state) {
    const free = subtotal >= DELIVERY_FREE_OVER;
    rates.push({
      service: 'local_delivery',
      name: 'Local delivery, by hand',
      price: free ? 0 : DELIVERY_FEE,
      days: free
        ? `Free over $${DELIVERY_FREE_OVER} — usually within two days`
        : 'Usually within two days',
      kind: 'delivery',
      miles: nearest.miles
    });
  }

  return rates;
}

/** True when this order never goes near a mailbox. */
export const isLocal = (service) => service === 'local_pickup' || service === 'local_delivery';
