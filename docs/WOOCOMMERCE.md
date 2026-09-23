# Pointing this site at your WooCommerce

Written for aeindryskincare.com, which already runs WooCommerce. The front end
was built against Woo's Store API from the start, so most of this is matching
things up rather than writing code.

Work through it in order. Steps 1–4 get the shop reading real stock and real
totals. Step 5 is the one that is not finished yet — read it before you start,
because it decides whether you can take money on day one.


## How the two sides find each other

The front end never sends a price. It sends a product **slug** and a quantity,
and reads every total back from Woo. That is deliberate: a price computed in the
browser is a price the customer can edit.

The bridge is the slug. `assets/js/commerce/index.js` loads your catalogue once
at startup and indexes it by Woo's own `slug` field, then resolves front-end
product ids against it. So a product here called `body-buff` must be a product
in Woo whose slug is exactly `body-buff`. Nothing else has to match — not the
name, not the price, not the description. Woo's copy wins on everything it
owns.

If a slug is missing, that product throws `"<id>" is not in the store
catalogue.` when someone adds it to the basket. Everything else keeps working.


## 1. Decide where the site is served from

This decision is worth making first, because it decides whether you fight CORS.

**Same origin (recommended).** Serve the site from the same hostname as
WordPress — `aeindryskincare.com` — with WordPress still answering
`/wp-json/...`. The browser sees one origin, no CORS preflight happens, and
cookies and nonces behave. This is the least that can go wrong.

**Different origin.** Site on `www.` or a Pages subdomain, WordPress on the
apex. Now every Store API call is cross-origin and Woo must be told to allow
it. See step 4.


## 2. Match the slugs

Every product below needs a Woo product with that exact slug. In WP admin the
slug is the "Permalink" under the product title.

50 are simple products. 20 are **variable** products — they need an attribute
with the values listed further down, marked "Used for variations", and a
variation generated for each.

A ⚠ on the price means this file guessed it; Woo's price wins regardless, so
set the real one there.

| # | Woo slug (must match exactly) | Product name | Type | Woo category | Price |
|---|---|---|---|---|---|
| 1 | `handmade-soap` | Handmade Soap | simple | Bath | $9 |
| 2 | `pine-tar-soap` | Pine Tar Soap | simple | Bath | $12 |
| 3 | `body-buff` | Body Buff | variable (9) | Bath | $14 |
| 4 | `foot-scrub` | Foot Scrub | simple | Bath | $12 ⚠ |
| 5 | `bamboo-soap-dish` | Bamboo Soap Dish | variable (2) | Bath | $5 |
| 6 | `body-cream` | Body Cream | variable (6) | Body | $20 |
| 7 | `foot-cream` | Foot Cream | simple | Body | $20 |
| 8 | `body-butter` | Body Butter | simple | Body | $18 ⚠ |
| 9 | `body-oil` | Body Oil | variable (2) | Body | $20 |
| 10 | `botanical-hand-butter` | Botanical Hand Butter | variable (5) | Body | $15 |
| 11 | `hand-butter` | Hand Butter | variable (8) | Body | $14 |
| 12 | `deodorant-creme` | Natural Deodorant Creme | variable (3) | Body | $12 |
| 13 | `lotion-bar` | Lotion Bar | simple | Body | $5 |
| 14 | `body-balm` | Body Balm | variable (3) | Body | $15 |
| 15 | `face-cream` | Face Cream | simple | Face | $20 |
| 16 | `face-serum` | Face Serum | simple | Face | $15 |
| 17 | `copper-face-serum` | Copper Serum | simple | Face | $20 |
| 18 | `under-eye-serum` | Time Lock Under Eye Serum | simple | Face | $20 |
| 19 | `face-oil` | Face Oil | variable (4) | Face | $34 ⚠ |
| 20 | `face-toner` | Face Toner | variable (2) | Face | $14 |
| 21 | `face-cleanser` | Face Soap & Cleanser | variable (5) | Face | $14 |
| 22 | `jelly-face-mask` | Jelly Face Mask | variable (5) | Face | $14 |
| 23 | `clay-face-mask` | Clay Face Mask | simple | Face | $14 ⚠ |
| 24 | `face-scrub` | Face Scrub | variable (3) | Face + Bath | $10 |
| 25 | `lip-balm` | Lip Balm | simple | Lips | $3.5 |
| 26 | `lip-scrub` | Lip Scrub | simple | Lips | $5 |
| 27 | `lip-oil` | Lip Oil | simple | Lips | $14 |
| 28 | `lip-gloss` | Lip Gloss | simple | Lips | $10 |
| 29 | `lip-rouge-cream` | Lip Rouge Cream | simple | Lips | $12 ⚠ |
| 30 | `shampoo-bar` | Shampoo Bar | variable (5) | Hair | $14 |
| 31 | `conditioner-bar` | Conditioner Bar | variable (3) | Hair | $10 |
| 32 | `hair-leave-in` | Hair Leave-in Conditioner & Serum | variable (2) | Hair | $17 |
| 33 | `leave-in-keratin` | Leave-in Conditioner — Keratin Strength | simple | Hair | $17 |
| 34 | `elixir-hair-oil` | Elixir Hair Oil | simple | Hair | $20 |
| 35 | `hair-butter` | Hair Butter & Intensive Treatment Mask | simple | Hair | $24 ⚠ |
| 36 | `copper-hair-serum` | Rice Renew Copper Hair Serum | simple | Hair | $24 |
| 37 | `nocturn-balm` | Nocturn Hair & Face Balm | simple | Hair | $35 |
| 38 | `acv-hair-rinse` | Apple Cider Vinegar Herbal Hair Rinse | simple | Hair | $16 ⚠ |
| 39 | `kids-soap` | Kids Soap | simple | Kids | $8 ⚠ |
| 40 | `kids-body-cream` | Kids Body Cream | simple | Kids | $16 ⚠ |
| 41 | `kids-salve` | Kids Salve | simple | Kids | $12 ⚠ |
| 42 | `kids-massage-oil` | Kids Massage Oil | simple | Kids | $14 ⚠ |
| 43 | `kids-body-butter` | Kids Body Butter | simple | Kids | $16 ⚠ |
| 44 | `mens-soap` | Men's Soap | simple | Men | $9 ⚠ |
| 45 | `beard-oil` | Beard Oil | simple | Men | $10 |
| 46 | `beard-balm` | Beard Balm | simple | Men | $14 |
| 47 | `shaving-soap` | Old Fashioned Shaving Soap | variable (4) | Men | $14 |
| 48 | `face-beard-scrub` | Face & Beard Scrub | simple | Men | $12 ⚠ |
| 49 | `shower-steamers` | Shower Steamers | variable (6) | Aromatherapy | $15 |
| 50 | `milk-bath` | Milk Bath | simple | Aromatherapy | $10 |
| 51 | `coconut-milk-bath-salt` | Coconut Milk Bath Salt | simple | Aromatherapy | $10 |
| 52 | `bath-bomb` | Bath Bomb | simple | Aromatherapy | $6 ⚠ |
| 53 | `foot-bomb` | Foot Bombs | simple | Aromatherapy | $6 ⚠ |
| 54 | `foot-soak` | Mineral Detox Foot Soak | simple | Aromatherapy | $10 |
| 55 | `essential-oil-roll-on` | Essential Oil Roll-On | simple | Aromatherapy | $5 |
| 56 | `room-spray` | Room Spray | simple | Aromatherapy | $10 |
| 57 | `beeswax-candle` | Beeswax Candle | variable (2) | Aromatherapy | $6 |
| 58 | `room-diffuser` | Room Diffuser | variable (5) | Aromatherapy | $20 |
| 59 | `car-diffuser` | Car Diffuser | simple | Aromatherapy | $8 |
| 60 | `solid-perfume` | Solid Perfume | simple | Aromatherapy | $15 |
| 61 | `pet-soap` | Pet Soap | simple | Pets | $9 ⚠ |
| 62 | `pet-lotion-bar` | Pet Lotion Bar | simple | Pets | $6 ⚠ |
| 63 | `pet-acv-rinse` | Apple Cider Vinegar Herbal Rinse | simple | Pets | $16 ⚠ |
| 64 | `mini-hand-butter-pack` | Pack of 5 Mini Hand Butters | simple | Sets & Packs | $30 |
| 65 | `mini-body-oil-pack` | Set of 6 Mini Body Oils | simple | Sets & Packs | $35 |
| 66 | `mini-beeswax-pack` | Pack of 4 Small Beeswax Candles | simple | Sets & Packs | $20 |
| 67 | `lotion-bar-pack` | Set of 6 Lotion Bars | simple | Sets & Packs | $20 |
| 68 | `lip-balm-pack` | Pack of 5 Lip Balms | simple | Sets & Packs | $14 |
| 69 | `roll-on-pack` | Pack of 5 Essential Oil Roll-Ons | simple | Sets & Packs | $20 |
| 70 | `jelly-mask-mini-pack` | Set of 3 Mini Jelly Masks | simple | Sets & Packs | $20 |


## 3. Variable products, value by value

Variations are matched on the attribute value's **name**, case-insensitive,
falling back to its slug. Position is deliberately not used — Woo is free to
reorder variations, and a positional match would quietly sell the wrong scent.

One attribute per product, and it must be the first attribute on the product.

**`body-buff`** — Body Buff  (attribute values, matched on name, case-insensitive)

- Twilight Orchard
- Coffee Cinnamon
- Lavender Citrus
- Orange Bergamot
- Sweet Sunrise
- Zen Zest
- Orchard Breeze
- Smoky Citrus
- Sunlit Cider

**`bamboo-soap-dish`** — Bamboo Soap Dish  (attribute values, matched on name, case-insensitive)

- Small — for a soap bar
- Large — for a shampoo bar  — $8

**`body-cream`** — Body Cream  (attribute values, matched on name, case-insensitive)

- Atharv  — $30
- Aloe Oats Honey
- Lemon Turmeric
- Aranya  — $30
- Matcha
- Pomegranate Berry Velvet  — $30

**`body-oil`** — Body Oil  (attribute values, matched on name, case-insensitive)

- 4 fl oz
- 8 fl oz  — $41

**`botanical-hand-butter`** — Botanical Hand Butter  (attribute values, matched on name, case-insensitive)

- Citrus Mint
- Lavender Lemon
- Orange Blossom
- Bud of Rose
- Vanilla

**`hand-butter`** — Hand Butter  (attribute values, matched on name, case-insensitive)

- Bud of Rose
- Mango Blossom
- Yuzu Forest
- Orange Blossom
- Amber Orange
- Citrus Hearth
- Lavender Lemon
- Highland Mist

**`deodorant-creme`** — Natural Deodorant Creme  (attribute values, matched on name, case-insensitive)

- Lavender Meadows
- Plush Pear
- Smoky Citrus

**`body-balm`** — Body Balm  (attribute values, matched on name, case-insensitive)

- Green Alchemist
- Barrier Repair  — $20
- Brow Renew

**`face-oil`** — Face Oil  (attribute values, matched on name, case-insensitive)

- Be Free
- Berry Bakuchiol
- Armor
- Rose

**`face-toner`** — Face Toner  (attribute values, matched on name, case-insensitive)

- Rose Rosemary
- Sweet Grass Neroli

**`face-cleanser`** — Face Soap & Cleanser  (attribute values, matched on name, case-insensitive)

- Solid — Oats & Honey  — $10
- Solid — Mango Lavender Meadow  — $10
- Powder to Foam
- Oil to Milk
- Clay Cleanser

**`jelly-face-mask`** — Jelly Face Mask  (attribute values, matched on name, case-insensitive)

- Berry Bloom Radiance
- Aloe Honey Oats
- Green Alchemy Renewal
- Rice Berry Protein
- Root and Bloom

**`face-scrub`** — Face Scrub  (attribute values, matched on name, case-insensitive)

- Bud of Rose
- Black Rose
- Lavender Cloud

**`shampoo-bar`** — Shampoo Bar  (attribute values, matched on name, case-insensitive)

- Rose Billbury
- Hem Charcoal
- Neem Ale
- Rice Lavender
- Aloe Honey

**`conditioner-bar`** — Conditioner Bar  (attribute values, matched on name, case-insensitive)

- Hemp Pan Rosemary
- Repair and Growth
- Revitalize and Transform

**`hair-leave-in`** — Hair Leave-in Conditioner & Serum  (attribute values, matched on name, case-insensitive)

- Lavender Meadow
- Verdant Bloom

**`shaving-soap`** — Old Fashioned Shaving Soap  (attribute values, matched on name, case-insensitive)

- Cabane — with tin  — $17
- Cabane — refill
- Sangria — with tin  — $17
- Sangria — refill

**`shower-steamers`** — Shower Steamers  (attribute values, matched on name, case-insensitive)

- Lavender — large
- Lavender — small  — $5
- Eucalyptus Peppermint — large
- Eucalyptus Peppermint — small  — $5
- Lemongrass Orange — large
- Lemongrass Orange — small  — $5

**`beeswax-candle`** — Beeswax Candle  (attribute values, matched on name, case-insensitive)

- Small
- Large  — $10

**`room-diffuser`** — Room Diffuser  (attribute values, matched on name, case-insensitive)

- Calming Mind
- Bright and Deep
- Almond Blossom
- Island Comfort
- Peachy Summer


## 4. Let the front end talk to the store

Set the store URL by adding one line to `index.html`, inside `<head>`:

```html
<meta name="aeindry-store" content="https://aeindryskincare.com">
```

Origin only — no trailing slash, no `/wp-json`. Empty or absent means the demo
catalogue, which cannot take money and says so.

**If the site is on a different origin from WordPress**, Woo also has to allow
it. The Store API does not send CORS headers for a cross-origin caller by
default, and three of them matter:

- `Access-Control-Allow-Origin` — your site's exact origin, not `*`, because
  the requests carry credentials.
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Headers` must include `Cart-Token`, `Nonce` and
  `Content-Type`.
- `Access-Control-Expose-Headers` must include `Cart-Token` and `Nonce`.

That last one is the one people miss. The client reads those two headers off
every response: `Cart-Token` identifies the server-side basket and `Nonce` is
Woo's CSRF token for writes. If they are sent but not *exposed*, JavaScript
cannot see them, every basket silently becomes a new empty one, and every write
is rejected. It looks like a broken cart, not like a CORS problem.


## 5. Payment — not finished, read this

The checkout posts the order to Woo's `/checkout` route with
`payment_method: 'stripe'` and an empty `payment_data`. Against the demo server
that is fine. Against real Woo it is not: Woo's Stripe gateway expects
`payment_data` carrying a payment-method token, and without it the order is
created without a card being charged.

The card form also will not appear. It is gated on a `/payment-config` route
that only the demo server answers; real Woo returns 404, the client reads that
as "no card collection", and no Stripe Element mounts.

So after steps 1–4 you get: real catalogue, real stock, real server-computed
totals, real shipping rates, real orders landing in Woo — and **no money
taken**. That is a usable state for checking everything else over, but it is not
a shop.

Two ways to finish it, and they are genuinely different:

**A. Hand checkout to Woo.** At the payment step, redirect to Woo's own
`/checkout` page with the cart already populated. Woo's Stripe gateway, Woo's
3-D Secure, Woo's receipts — all of it maintained by someone else. The customer
leaves this site's design for the last screen. Least code, least risk, and the
tax and fraud handling is not yours.

**B. Keep checkout here.** Mount Stripe's Payment Element on this site, create
the payment method, and pass it to Woo in `payment_data` in the shape its Stripe
plugin expects. The whole purchase stays in this design. More work, and the
exact shape depends on which Stripe plugin is installed — WooCommerce Stripe
Gateway and Stripe for WooCommerce want different fields.

Tell me which plugin you have and which route you want, and I will build it.


## 6. Check it before customers do

With the store URL set, open the site and confirm, in order:

1. The shop lists products and the prices are Woo's, not this file's.
2. Adding to the basket succeeds — no `"…" is not in the store catalogue.`
3. The basket survives a page reload. If it empties, `Cart-Token` is not
   reaching the browser — go back to step 4.
4. A shipping address produces rates that come from Woo.
5. An order placed in test mode appears in WooCommerce → Orders.

The demo server in `server/` is not part of any of this. It exists so the front
end could be developed against a real API shape, it keeps carts and orders in
memory, and it should not be deployed.
