# Taking money

The storefront in this repository is a front end. It can run in two modes, and
the difference is not cosmetic:

| | `local` | `woo` |
|---|---|---|
| Prices | computed in the browser | computed on the server |
| Cart | localStorage | WooCommerce, keyed by cart token |
| Shipping | flat rate | live USPS quote |
| Tax | none | WooCommerce tax engine |
| Orders | none | real orders, real emails |
| **Can take payment** | **no** | **yes** |

`local` is what you get out of the box. It is a catalogue demo and it says so:
`placeOrder()` refuses rather than printing a receipt, because a demo that fakes
an order confirmation is how a customer ends up believing they have bought
something.

## Why WooCommerce and not a page builder

Elementor is a page builder. Adopting it means rebuilding this design inside its
editor — the botanical engine, the floral backdrop, the scroll choreography, the
generated product art. All of that is code, and a builder has nowhere to put it.

WooCommerce's **Store API** (`/wp-json/wc/store/v1/`) is the opposite trade. It
is a public, token-addressed JSON API designed for exactly this: someone else's
front end. WordPress becomes an engine — payments, USPS rates, tax, inventory,
order emails, refunds, and an admin the shop owner can actually work in — and
not a single pixel of this site changes.

The one thing to understand before you start: **the Store API is public and
needs no secret key in the browser.** If a setup guide ever tells you to put a
WooCommerce consumer secret in front-end JavaScript, it is describing the
*other* API (`/wp-json/wc/v3/`), which is for servers. Anyone who views source
can read that key and place orders as you.

## Setting it up

1. **WordPress + WooCommerce.** Any host. Woo's setup wizard asks for the
   business address — use the real ship-from, because USPS zones are computed
   from it.

2. **Payments.** WooPayments or the official Stripe gateway. Both keep card
   entry inside the processor, so no card number ever reaches your server or
   this site. Turn on Apple Pay / Google Pay while you are there; on a phone it
   roughly halves checkout abandonment.

3. **USPS rates.** The official *WooCommerce Shipping* plugin quotes USPS live
   and prints labels. Give every product a **weight and dimensions** in
   WooCommerce — without those the plugin cannot quote, and this is the single
   most common reason "shipping isn't showing up".

4. **Tax.** Woo's automated tax, or a service. Washington is destination-sourced,
   so the rate depends on the customer's address, not yours.

5. **Point the site at it.** One line in `index.html`:

   ```html
   <meta name="aeindry-store" content="https://shop.aeindryskincare.com">
   ```

   That is the whole switch. `assets/js/commerce/config.js` sees it, the Woo
   driver takes over, and every price on the site starts coming from WordPress.

6. **Let the browser talk to it.** The site and the store are different origins,
   so WordPress must return CORS headers for the storefront's origin, including
   `Access-Control-Expose-Headers: Cart-Token, Nonce` — miss those two and the
   cart silently empties between requests, because the browser will not let the
   page read the token back.

## Matching the catalogue

The front end addresses products by slug (`face-cream`, `lip-balm`). The Woo
driver resolves those to WooCommerce's numeric ids once at load, from the
store's own `slug` field — so **give each Woo product the same slug as its entry
in `assets/js/data/products.js`** and nothing else needs to change.

Variants match on the attribute *value*, not on position, because Woo is free to
reorder them and a positional match would quietly sell the wrong size.

## Running it locally

`server/store.mjs` implements the same Store API against this repository's own
catalogue:

```
node server/store.mjs --port 8787
# then open the site with:  ?store=http://127.0.0.1:8787
```

It exists because a front end written against an API that has never been run is
a front end full of guesses. It is real about the things that matter — integer
cents end to end, server-side pricing, parcel packing, stock decremented on
order — and honest about the one it cannot be: without `STRIPE_SECRET_KEY` it
reports `payment_status: 'test'` and takes no money.

The `?store=` override only works on a loopback origin. On a public one the same
feature would be a phishing kit: a link could render the real site, with the
real branding, around somebody else's prices and checkout form.

## Shipping maths

`server/usps.mjs` is the part a carrier API cannot do for you: deciding what
parcels the basket actually becomes. A quote is only as good as the parcel you
describe, and quoting one big box for an order that really ships as two small
ones under-charges every multi-item order you take.

- `packBasket()` fills the smallest box that holds the order and opens another
  when it will not — weight and volume, with a 38% allowance for the air real
  packing leaves. Not a 3D bin packer; that would be precise about the wrong
  thing.
- `zoneFor()` approximates the USPS zone from ZIP-to-ZIP distance.
- Rates come from a published table (`RATES_REVISED` says which set) unless
  `USPS_CLIENT_ID` / `USPS_CLIENT_SECRET` are set, in which case it prices
  against the live USPS API instead.

Table quotes are flagged `estimated` all the way through to the checkout, so
nothing ever presents a guess as a price. **Rates change every January.**

In production none of this is in the path — Woo's shipping plugin quotes USPS
and the Store API hands the answer to the front end. It is here so the demo
quotes something honest, and because the packing logic is worth keeping.

## Before you switch it on

- [ ] Real weights and dimensions on every product in WooCommerce
- [ ] A test order placed with a real card and refunded
- [ ] Order confirmation email checked on a phone
- [ ] Tax verified against one in-state and one out-of-state address
- [ ] Return and shipping policy pages written — Stripe asks for these
- [ ] `?store=` confirmed inert on the production hostname
