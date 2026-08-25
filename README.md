# Aeindry Skincare

A storefront for **Aeindry Skincare** — *"All Natural Handmade Skincare where Purity is Essence"* —
a small, woman-owned company making 100% natural handmade skincare in the Pacific Northwest.

Built as a dependency-free static site: no framework, no build step, no runtime packages.
Open `index.html` through any static server and it runs.

---

## Running it

ES modules need a real origin, so `file://` will not work. Any static server does:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
# or
npx serve .
```

Deploying is a straight file copy — GitHub Pages, Netlify, S3, or a folder on any host.
There is nothing to compile and nothing to install.

---

## Two things to confirm before this goes live

**1. Product photography.** The real photography on aeindryskincare.com could not be
retrieved — this build environment's network policy blocks the domain, so no image
could be downloaded. Rather than ship grey boxes, every product is drawn from scratch
as a **generated SVG illustration**: a shared lighting and shadow scene plus a
per-form-factor vessel (bar, tin, jar, tube, roller, spray bottle, bath bomb, puck,
pot, net), tinted from each product's own palette and re-tinted when a scent variant
is selected.

Every call site goes through one function, so swapping in real photography is a
single-file change:

```js
// assets/js/lib/art.js
export function productArt(product, opts = {}) { … }   // ← replace with <img> markup
```

**2. Prices.** Prices are not published on the current site and could not be read, so
`price` and the `variants` line-ups in `assets/js/data/products.js` are realistic
placeholders. Everything else on a product — names, categories, claims, ingredient
stories, the CBD shipping restriction — comes from aeindryskincare.com.

The checkout button and the contact form are deliberately inert, and both say so in
the UI. There is no payment processor and no mail server behind them.

---

## What is in it

**Twelve products**, every one from the live catalogue, with 42 scent/format variants:
Specialty Soap · Shave Soap · Herbal Salve (incl. the Washington-only CBD Muscle Rub) ·
Face Cream · Powder to Foam Cleanser · Face Wipe & Washing Net · Lip Balm ·
Deodorant Cream · Solid Perfume · Essential Oil Roller · Essential Oil Bath Bomb ·
Room & Linen Spray.

**Seven routes**, hash-based so it works from any static path:

| Route | What it does |
| --- | --- |
| `#/` | Hero, promise marquee, bestsellers, founder story, pillars, ritual teaser, ingredient spotlight, full-range rail, quotes, journal, newsletter |
| `#/shop` | Live filtering by category and scent family, full-text search, four sort orders, shareable URL state |
| `#/product/:id` | Variant switching that re-tints the artwork and price, ingredient cross-links, accordions, related products |
| `#/about` | Founder story on a scroll-scrubbed timeline, the four pillars, the "never" list |
| `#/ingredients` | 22-entry library, filterable by family, with a detail pane linking back to every formula the ingredient appears in |
| `#/ritual` | **Ritual builder** — pick a concern, get an ordered routine with reasons and one-click add-all. **Scent quiz** — three weighted questions onto six scent families |
| `#/journal`, `#/contact` | Journal + FAQ accordion; validated contact form |

**Interaction.** Cinematic six-panel curtain between routes · eased smooth scrolling
that keeps `position: sticky` intact · magnetic cursor with contextual labels ·
3D-tilt product cards with a pointer-tracked light · animated hero canvas of drifting
botanicals reacting to the pointer · fly-to-cart arc animation · persistent cart and
wishlist · quick-view modal · scroll-scrubbed timeline · line/word/char text reveals ·
light/dark/system theming.

---

## Layout

```
index.html                 app shell: nav, menu, cart drawer, modal, footer
assets/
  css/
    tokens.css             palette, fluid type scale, spacing, easing, light+dark
    base.css               reset, typography, layout primitives
    animations.css         reveal system, keyframes, route curtain, reduced-motion
    components.css         buttons, nav, cards, drawer, forms, accordion, marquee
    pages.css              per-page layout + all responsive breakpoints
    fonts.css              self-hosted Fraunces + Inter (vendored, no CDN)
  fonts/                   woff2 subsets (latin, latin-ext)
  js/
    main.js                boot + route registration
    core/                  router · scroll · reveal · cursor · preloader · store
    ui/                    nav · cart · quickview · tilt · carousel · accordion ·
                           hero-canvas · pcard · toast
    lib/                   dom helpers · SVG art engine
    data/                  products.js · content.js
    pages/                 one module per route
```

**Design tokens** drive everything — colour, type scale, spacing, easing, radii. Dark
mode is defined three ways (bare `:root`, `prefers-color-scheme` guarded against an
explicit light choice, and `[data-theme="dark"]`) so the toggle wins in both
directions and the system default still works. `.band--forest` flips the same tokens
locally, so any component nests correctly inside a dark section without special cases.

**Motion** is opt-in via `data-reveal`, staggered with `data-stagger`, and split into
lines/words/chars with `data-split`. Everything collapses under
`prefers-reduced-motion: reduce`, including the route curtain and the hero canvas,
which falls back to a single static composition.

---

## Verified

Checked in headless Chromium at 1440px and 390px, in light and dark:

- 34 interaction assertions — filtering, search, sort, cart add/qty/persistence,
  quick view, variant pricing, accordions, ritual builder, scent quiz, theme cycling,
  routing, 404, ingredient explorer
- No console or page errors on any route
- One `<h1>` per route; no unlabelled buttons, no `role="img"` SVG without a label
- All 13 in-app links resolve to a real route
- `prefers-reduced-motion` leaves no element stuck at `opacity: 0`

---

## Content sources

Brand facts — founder, dates, location, contact details, product claims and the
Washington-only CBD restriction — are from
[aeindryskincare.com](https://aeindryskincare.com) and the company's
[Instagram](https://www.instagram.com/aeindryskincare/) and
[Facebook](https://www.facebook.com/aeindryskincare/) pages.

Longer-form editorial (the journal entries, the "never" list rationales, the
ingredient write-ups and the customer quotes) is written for this build and should be
reviewed before publication.

Contact: contactus@aeindryskincare.com · +1 312-909-7034 · Sammamish, Washington
