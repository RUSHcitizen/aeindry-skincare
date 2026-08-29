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

## Taking a card

Two keys, and the site behaves differently for each combination — deliberately,
because the dangerous state is the half-configured one.

| `STRIPE_SECRET_KEY` | `STRIPE_PUBLISHABLE_KEY` | What the checkout does |
|---|---|---|
| unset | — | Test mode. Places an order, takes nothing, and says "no money moved and no order was really placed." |
| set | unset | **Refuses.** No Pay button: "Card payments are not switched on yet." |
| set | set | Mounts Stripe's Payment Element and confirms the intent. |

The middle row is the one that matters. With a secret key and no publishable
key the server can create a PaymentIntent that the browser has no way to
confirm — the order is recorded, the money never moves, and the customer is
thanked. The server refuses to create the intent at all in that state, and the
checkout refuses to show a Pay button.

The publishable key is public by design: it identifies the account and can only
create payment methods. It is served to the browser from
`GET /wp-json/wc/store/v1/payment-config`. The secret key never leaves the
server process.

**The order of operations is load-bearing.** The card is validated first
(`elements.submit()`), *then* the order is placed, *then* the intent is
confirmed. Placing the order first would strand one behind every mistyped card
number, and a stranded order is indistinguishable from a real unpaid one. If
confirmation fails after the order exists, the order stands as unpaid and the
confirmation page says so and offers the invoice — it does not say thank you.

Card fields are rendered inside Stripe's own iframe on Stripe's origin. They are
not readable from this document, which is what keeps the site out of PCI scope.

```sh
STRIPE_SECRET_KEY=sk_live_…  STRIPE_PUBLISHABLE_KEY=pk_live_…  node server/store.mjs
```

Test with Stripe's test keys and card `4242 4242 4242 4242` first. `4000 0025
0000 3155` forces a 3-D Secure challenge; `4000 0000 0000 9995` forces a
decline — both are worth walking through, because both are paths a real
customer will hit.

---

## The confirmation email

Set one of these and the customer gets an order confirmation with their invoice
link:

| Variable | What it does |
|---|---|
| `RESEND_API_KEY` | Sends through [Resend](https://resend.com)'s HTTP API. No dependency, no SMTP, works from a container with only outbound 443. |
| `AEINDRY_MAIL_WEBHOOK` | POSTs the message as JSON to a URL of your choosing — Zapier, Make, a Lambda, your own relay. |
| `AEINDRY_MAIL_FROM` | The From header. Defaults to the seller identity in `invoice.mjs`. |
| `AEINDRY_SITE_URL` | Public origin, so the invoice link in the email is absolute. Without it the email has no link. |

SMTP is deliberately not supported: doing it properly means a dependency and a
long-lived connection, and every host worth using offers an HTTP API.

With none set, **no email is sent** — and the confirmation page says so, rather
than telling the customer to watch an inbox that will stay empty:

> **No confirmation email was sent.** Save the invoice link below, or write to
> us and we will resend it.

`sendOrderEmail` never throws. A mail provider being down must not fail an order
that has already been paid for; the failure is recorded on the order
(`email_sent`, `email_reason`) and the page renders from that. The email is
built from the invoice, not the cart, so the figures a customer is sent are the
figures the server charged.

Whichever provider you pick, you have to prove you own the domain to it —
SPF and DKIM records on `aeindryskincare.com`. Without that the mail will send
and land in spam, which is worse than not sending it.

---

## Before you switch it on

- [ ] Real weights and dimensions on every product in WooCommerce
- [ ] A test order placed with a real card and refunded
- [ ] Order confirmation email checked on a phone
- [ ] Tax verified against one in-state and one out-of-state address
- [ ] Return and shipping policy pages written — Stripe asks for these
- [ ] `?store=` confirmed inert on the production hostname
- [ ] Both Stripe keys set — check the boot banner says `live Stripe`
- [ ] A mail provider set — the banner says `email via …`, not `no email configured`
- [ ] SPF and DKIM published for the sending domain, and a test mail landing in an inbox rather than spam
- [ ] A declined card (`4000 0000 0000 9995`) walked through end to end
- [ ] The seven products still on placeholder prices given real ones (`node tools/check-catalogue.mjs`)

---

## Collection and local delivery

Someone eight miles away should not pay to have a $12 soap posted to them. When
the buyer's ZIP is near a pickup point, the checkout offers collection (free)
and, inside a tighter radius, delivery by hand — listed above the USPS quotes
and badged, because "free, and it's four miles away" is a different offer from
a postage price.

Distance comes from the same ZIP-anchor grid the shipping zones use, so it
needs no geocoding service and no API key.

**The addresses are configuration, not content.** The site knows the business is
in Sammamish because that is published; it does not know the street, and a
street invented for a real shop sends customers to a stranger's door. So the
default point carries the town and ZIP only and says the exact address follows
by email. Fill it in properly with:

```bash
export AEINDRY_PICKUP='[{"id":"studio","name":"The studio","line1":"123 Example Way",
  "city":"Sammamish","state":"WA","zip":"98074",
  "hours":"Thu–Sat, 10–4","note":"Ring the side door."}]'
```

| Variable | Default | What it does |
|---|---|---|
| `AEINDRY_PICKUP` | one point, town only | JSON array of collection points. `[]` switches collection off |
| `AEINDRY_PICKUP_RADIUS` | `25` | Miles within which collection is offered |
| `AEINDRY_DELIVERY_RADIUS` | `12` | Miles within which hand delivery is offered |
| `AEINDRY_DELIVERY_FEE` | `6` | Flat local delivery fee |
| `AEINDRY_DELIVERY_FREE_OVER` | `60` | Basket value above which delivery is free |

Local delivery is additionally restricted to the same state as the pickup
point: driving a parcel across a state line is a different business.

## Invoices

Every order gets one, at `GET /order/:id/invoice?key=<order_key>`, rendered by
the site at `#/invoice/:id?key=…`.

Two things shape it. It is built from the **order**, never the cart — the cart
is emptied the moment the order is placed, so an invoice regenerated from it
later would be blank. And nothing is **recomputed**: the order stored what was
charged and the invoice repeats it, because last month's invoice must still say
what the customer paid even after a price or a tax rate changes.

The order key is required. Order ids are sequential, so without it anyone could
walk the range and collect other people's names and addresses; the server
returns 403 on a mismatch.

"Save as PDF" is the browser's own print dialogue rather than a bundled PDF
library — it costs nothing, honours the reader's paper size, and produces a file
their operating system already understands. The print stylesheet drops the nav,
the footer and the floral backdrop, and keeps line items from splitting across a
page break.

Identify the seller properly before you invoice anyone:

| Variable | Default | What it does |
|---|---|---|
| `AEINDRY_LEGAL_NAME` | `Aeindry Skincare` | Name on the invoice |
| `AEINDRY_ADDR_1` | *(blank)* | Street line |
| `AEINDRY_CITY` / `AEINDRY_STATE` / `AEINDRY_ZIP` | Sammamish / WA / 98074 | Registered address |
| `AEINDRY_EMAIL` | `contactus@aeindryskincare.com` | Billing contact |
| `AEINDRY_TAX_ID` | *(blank)* | Printed only if set — a made-up registration number on a real invoice is a document that lies about a real company |
