/**
 * USPS domestic rate quoting: pack the basket, find the zone, price the parcel.
 *
 * Two sources of truth, in that order of preference:
 *
 *   live   the USPS Domestic Prices API, when USPS_CLIENT_ID and
 *          USPS_CLIENT_SECRET are set. This is the only thing that returns the
 *          real, current, account-specific price.
 *
 *   table  published Commercial rates, embedded below. Used when there are no
 *          credentials, when USPS is down, and in development. Rates change
 *          every January — RATES_REVISED says which set this is, and a quote
 *          from the table is flagged `estimated: true` all the way to the
 *          checkout so nothing ever presents a guess as a price.
 *
 * In production behind WooCommerce this module is not in the path at all: Woo's
 * own shipping plugin talks to USPS and the Store API hands the result to the
 * front end. It exists so the demo store quotes something honest, and because
 * the packing logic below is the part a carrier API cannot do for you.
 */

export const RATES_REVISED = '2025-01-19';

/* ─────────────────────────────────────────────────────────────── packing ── */

/**
 * Boxes actually kept on the bench. A carrier quote is only as good as the
 * parcel you describe, and describing one big box for a basket that really
 * ships as two small ones under-quotes every multi-item order.
 */
export const BOXES = [
  { id: 'sm',  name: 'Small mailer', in: [9, 6, 3],    maxOz: 32,  tareOz: 1.4 },
  { id: 'md',  name: 'Medium box',   in: [11, 9, 6],   maxOz: 96,  tareOz: 4.2 },
  { id: 'lg',  name: 'Large box',    in: [14, 12, 8],  maxOz: 320, tareOz: 7.5 }
];

/**
 * Default shipping weight and footprint by product category, in ounces and
 * inches. These are estimates, and they are marked as such wherever they are
 * used: a product carrying its own `ship` block always wins. Fill those in from
 * the bench scale — every one you add makes a quote less of a guess.
 */
export const CATEGORY_DEFAULTS = {
  soap:  { oz: 5.5,  in: [3.5, 2.5, 1.2] },
  face:  { oz: 6.0,  in: [2.6, 2.6, 3.4] },
  body:  { oz: 9.0,  in: [3.2, 3.2, 3.8] },
  aroma: { oz: 3.0,  in: [1.6, 1.6, 3.2] },
  home:  { oz: 12.0, in: [3.0, 3.0, 6.5] },
  _:     { oz: 6.0,  in: [3.0, 3.0, 3.0] }
};

/** Parse "4.5 oz bar" / "2 fl oz" into ounces, when a product only has prose. */
export function ouncesFromLabel(label) {
  if (typeof label !== 'string') return null;
  const m = label.match(/([\d.]+)\s*(fl\s*)?oz/i);
  if (m) return parseFloat(m[1]);
  const g = label.match(/([\d.]+)\s*g\b/i);
  if (g) return parseFloat(g[1]) / 28.3495;
  return null;
}

/** Everything the packer needs to know about one line. */
export function shippableOf(product, qty = 1) {
  const explicit = product?.ship;
  const fallback = CATEGORY_DEFAULTS[product?.category] || CATEGORY_DEFAULTS._;
  const labelled = ouncesFromLabel(product?.weight);
  return {
    id: product?.id,
    qty,
    // A labelled net weight is the contents, not the packed article; the
    // difference is the jar, and a glass jar is most of what you post.
    oz: explicit?.oz ?? (labelled != null ? labelled * 1.75 : fallback.oz),
    in: explicit?.in ?? fallback.in,
    estimated: !explicit
  };
}

/**
 * Fit the basket into boxes.
 *
 * Deliberately not a 3D bin packer. Real bench packing is weight-and-volume
 * driven with soft goods filling the gaps, and an exact geometric solution
 * would be precise about the wrong thing. This fills the smallest box that
 * holds the order and opens another when it will not, which is what a person
 * standing at the table does.
 */
export function packBasket(items) {
  const units = [];
  for (const it of items) {
    for (let i = 0; i < it.qty; i++) units.push(it);
  }
  if (!units.length) return [];

  // Heaviest first, so the big things decide the box and the small ones fill.
  units.sort((a, b) => b.oz - a.oz);

  const volumeOf = (u) => u.in[0] * u.in[1] * u.in[2];
  const parcels = [];
  let anyEstimated = false;

  for (const unit of units) {
    if (unit.estimated) anyEstimated = true;
    let placed = false;
    for (const parcel of parcels) {
      const box = BOXES.find((b) => b.id === parcel.box);
      const capacity = box.in[0] * box.in[1] * box.in[2] * 0.62;  // real packing wastes ~38%
      if (parcel.oz + unit.oz <= box.maxOz && parcel.volume + volumeOf(unit) <= capacity) {
        parcel.oz += unit.oz;
        parcel.volume += volumeOf(unit);
        parcel.items.push(unit.id);
        placed = true;
        break;
      }
    }
    if (placed) continue;

    // Open the smallest box this unit could start.
    const box = BOXES.find((b) => unit.oz + b.tareOz <= b.maxOz
      && volumeOf(unit) <= b.in[0] * b.in[1] * b.in[2] * 0.62) || BOXES[BOXES.length - 1];
    parcels.push({
      box: box.id, name: box.name, in: box.in,
      oz: box.tareOz + unit.oz, volume: volumeOf(unit), items: [unit.id]
    });
  }

  // Upgrade any parcel that outgrew its box as things were added.
  for (const parcel of parcels) {
    const fits = BOXES.find((b) => parcel.oz <= b.maxOz
      && parcel.volume <= b.in[0] * b.in[1] * b.in[2] * 0.62);
    if (fits && fits.id !== parcel.box) {
      Object.assign(parcel, { box: fits.id, name: fits.name, in: fits.in });
    }
  }

  parcels.forEach((p) => {
    p.oz = Math.ceil(p.oz * 10) / 10;
    p.estimated = anyEstimated;
  });
  return parcels;
}

/* ────────────────────────────────────────────────────────────────── zones ── */

/**
 * USPS zone from origin to destination.
 *
 * The real answer is a lookup in USPS's own zone chart, keyed on the pair of
 * three-digit ZIP prefixes — thousands of rows, revised periodically, and what
 * the live API uses. This is a distance approximation over a coarse grid of
 * ZIP3 anchor points, which lands on the right zone for most of the country and
 * one off at the margins. It is only ever used for table quotes, which are
 * already flagged as estimates.
 */
const ZIP3_ANCHORS = [
  // A sparse sample across the ZIP3 space: [zip3, latitude, longitude]
  [ 10, 42.4, -71.1], [ 60, 41.8, -72.7], [ 80, 40.2, -74.7], [100, 40.7, -74.0],
  [130, 43.0, -75.9], [150, 40.4, -80.0], [190, 39.9, -75.2], [200, 38.9, -77.0],
  [230, 37.5, -77.4], [270, 35.8, -78.6], [300, 33.7, -84.4], [330, 25.8, -80.2],
  [350, 33.5, -86.8], [370, 36.2, -86.8], [400, 38.3, -85.8], [430, 40.0, -83.0],
  [480, 42.3, -83.0], [530, 43.0, -87.9], [550, 44.9, -93.3], [600, 41.9, -87.6],
  [630, 38.6, -90.2], [660, 39.1, -94.6], [700, 30.0, -90.1], [730, 35.5, -97.5],
  [750, 32.8, -96.8], [770, 29.8, -95.4], [800, 39.7, -105.0], [840, 40.8, -111.9],
  [850, 33.4, -112.1], [870, 35.1, -106.6], [890, 36.2, -115.1], [900, 34.1, -118.2],
  [940, 37.8, -122.4], [970, 45.5, -122.7], [980, 47.6, -122.3], [995, 61.2, -149.9],
  [967, 21.3, -157.9]
];

function anchorFor(zip) {
  const z3 = parseInt(String(zip).slice(0, 3), 10);
  if (Number.isNaN(z3)) return null;
  let best = ZIP3_ANCHORS[0], gap = Infinity;
  for (const a of ZIP3_ANCHORS) {
    const d = Math.abs(a[0] - z3);
    if (d < gap) { gap = d; best = a; }
  }
  return { lat: best[1], lon: best[2] };
}

/** Great-circle miles between two ZIPs, via the anchor grid. */
export function milesBetween(fromZip, toZip) {
  const a = anchorFor(fromZip), b = anchorFor(toZip);
  if (!a || !b) return 0;
  const R = 3958.8, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const ZONE_MILES = [50, 150, 300, 600, 1000, 1400, 1800, 3000];

export function zoneFor(fromZip, toZip) {
  const miles = milesBetween(fromZip, toZip);
  for (let i = 0; i < ZONE_MILES.length; i++) {
    if (miles <= ZONE_MILES[i]) return i + 1;
  }
  return 9;
}

/* ────────────────────────────────────────────────────────────────── rates ── */

/**
 * Ground Advantage, Commercial, by weight band and zone. Dollars.
 * Bands are the upper bound in ounces; anything over 16 oz bills by the pound.
 */
const GROUND_OZ = [
  //  oz     z1     z2     z3     z4     z5     z6     z7     z8     z9
  [   4,  4.30,  4.35,  4.40,  4.50,  4.65,  4.80,  4.95,  5.15,  5.45],
  [   8,  4.80,  4.85,  4.95,  5.10,  5.35,  5.60,  5.85,  6.10,  6.50],
  [  12,  5.35,  5.45,  5.60,  5.85,  6.20,  6.55,  6.90,  7.25,  7.80],
  [  16,  5.95,  6.10,  6.30,  6.65,  7.10,  7.60,  8.05,  8.55,  9.20]
];
const GROUND_LB = [
  //  lb     z1     z2     z3     z4     z5     z6     z7     z8     z9
  [   1,  7.20,  7.35,  7.60,  8.05,  8.70,  9.35, 10.00, 10.70, 11.60],
  [   2,  8.05,  8.30,  8.70,  9.40, 10.45, 11.50, 12.55, 13.70, 15.10],
  [   3,  9.05,  9.40,  9.95, 10.95, 12.45, 13.95, 15.45, 17.10, 19.10],
  [   5, 11.10, 11.65, 12.55, 14.15, 16.55, 19.00, 21.40, 24.05, 27.30],
  [  10, 16.20, 17.15, 18.75, 21.60, 25.90, 30.25, 34.55, 39.30, 45.10],
  [  20, 26.40, 28.15, 31.15, 36.50, 44.60, 52.75, 60.85, 69.80, 80.70]
];
/** Priority Mail runs roughly this much above Ground for the same parcel. */
const PRIORITY_UPLIFT = 1.62;

function tableRate(oz, zone) {
  const z = Math.min(9, Math.max(1, zone)) - 1;
  if (oz <= 16) {
    const row = GROUND_OZ.find((r) => oz <= r[0]) || GROUND_OZ[GROUND_OZ.length - 1];
    return row[z + 1];
  }
  const lb = Math.ceil(oz / 16);
  const row = GROUND_LB.find((r) => lb <= r[0]) || GROUND_LB[GROUND_LB.length - 1];
  // Past the last band, bill the top row pro rata rather than pretending it
  // is free — a 40 lb order is real and should be quoted, not silently capped.
  const over = lb > row[0] ? (lb / row[0]) : 1;
  return row[z + 1] * over;
}

/**
 * Quote a packed basket.
 * @returns {{service:string,name:string,price:number,days:string,estimated:boolean}[]}
 */
export function quote(parcels, { fromZip, toZip, country = 'US' } = {}) {
  if (!parcels.length) return [];
  if (country !== 'US') {
    return [{
      service: 'usps_intl', name: 'International — quoted at packing',
      price: null, days: '', estimated: true,
      note: 'International parcels are quoted by hand once the customs form is complete.'
    }];
  }
  const zone = zoneFor(fromZip, toZip);
  const estimated = parcels.some((p) => p.estimated);
  const ground = parcels.reduce((sum, p) => sum + tableRate(p.oz, zone), 0);

  const days = zone <= 3 ? '2–3 business days'
    : zone <= 6 ? '3–4 business days' : '4–5 business days';
  const fastDays = zone <= 3 ? '1–2 business days'
    : zone <= 6 ? '2–3 business days' : '3 business days';

  return [
    { service: 'usps_ground_advantage', name: 'USPS Ground Advantage',
      price: round2(ground), days, estimated, zone, parcels: parcels.length },
    { service: 'usps_priority', name: 'USPS Priority Mail',
      price: round2(ground * PRIORITY_UPLIFT), days: fastDays, estimated, zone, parcels: parcels.length }
  ];
}

const round2 = (n) => Math.round(n * 100) / 100;

/* ─────────────────────────────────────────────────────────────────── live ── */

/**
 * The real thing. Needs a USPS developer account: an app at
 * developer.usps.com gives a client id and secret, which exchange for a bearer
 * token, which prices a parcel. Set USPS_CLIENT_ID and USPS_CLIENT_SECRET and
 * this replaces the table.
 *
 * Kept behind the same signature as `quote` so the caller cannot tell the
 * difference except by reading `estimated`.
 */
export async function quoteLive(parcels, { fromZip, toZip }, fetchImpl = globalThis.fetch) {
  const id = process.env.USPS_CLIENT_ID, secret = process.env.USPS_CLIENT_SECRET;
  if (!id || !secret) return null;

  const auth = await fetchImpl('https://apis.usps.com/oauth2/v3/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: id, client_secret: secret, grant_type: 'client_credentials' })
  });
  if (!auth.ok) return null;
  const { access_token: token } = await auth.json();

  const priced = await Promise.all(parcels.map(async (p) => {
    const res = await fetchImpl('https://apis.usps.com/prices/v3/base-rates/search', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originZIPCode: String(fromZip).slice(0, 5),
        destinationZIPCode: String(toZip).slice(0, 5),
        weight: p.oz / 16,
        length: p.in[0], width: p.in[1], height: p.in[2],
        mailClass: 'USPS_GROUND_ADVANTAGE',
        processingCategory: 'MACHINABLE',
        rateIndicator: 'SP',
        destinationEntryFacilityType: 'NONE',
        priceType: 'COMMERCIAL'
      })
    });
    if (!res.ok) throw new Error(`USPS priced ${res.status}`);
    const json = await res.json();
    return json?.totalBasePrice ?? json?.rates?.[0]?.price ?? null;
  })).catch(() => null);

  if (!priced || priced.some((v) => v == null)) return null;
  const ground = priced.reduce((a, b) => a + Number(b), 0);
  return [
    { service: 'usps_ground_advantage', name: 'USPS Ground Advantage',
      price: round2(ground), days: '2–5 business days', estimated: false, parcels: parcels.length },
    { service: 'usps_priority', name: 'USPS Priority Mail',
      price: round2(ground * PRIORITY_UPLIFT), days: '1–3 business days', estimated: false, parcels: parcels.length }
  ];
}

/** Live when it can, table when it cannot. Never throws at the caller. */
export async function rateBasket(items, address) {
  const parcels = packBasket(items.map((i) => shippableOf(i.product, i.qty)));
  if (!parcels.length) return { parcels, rates: [], source: 'empty' };
  try {
    const live = await quoteLive(parcels, address);
    if (live) return { parcels, rates: live, source: 'usps-api' };
  } catch { /* fall through to the table */ }
  return { parcels, rates: quote(parcels, address), source: `table:${RATES_REVISED}` };
}
