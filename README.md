# Aeindry Skincare

A storefront for **Aeindry Skincare** — *"All Natural Handmade Skincare where Purity is Essence"* —
a small, woman-owned company making 100% natural handmade skincare in the Pacific Northwest.

Designed as a modern botanical apothecary around the Aeindry wreath: warm paper
grounds, editorial serif typography, and generated botanical artwork painted in
the same watercolour hand as the mark. Built dependency-free — no framework, no
build step, no runtime packages. Open `index.html` through any static server and
it runs.

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

**3. Customer reviews.** `TESTIMONIALS` in `assets/js/data/content.js` is
deliberately **empty**, and the "In their words" section renders an explicit
placeholder saying so. Nothing has been invented to fill it. Adding real entries
— `{ quote, name, meta, product }` — is the only step needed to switch the
section on.

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
    botanical.css          the botanical layer: fields, sway, petals, paper, edges
    cards.css              the specimen card
    home.css               the nine home compositions
    fonts.css              self-hosted Bodoni Moda + Jost (vendored, no CDN)
  fonts/                   woff2 subsets (latin, latin-ext)
  js/
    main.js                boot + route registration
    core/                  router · scroll · reveal · magnetic · preloader · store
    ui/                    nav · cart · quickview · bot-field · carousel ·
                           accordion · pcard · toast
    lib/                   dom helpers · product art engine · botanical engine
    data/                  products.js · content.js
    pages/                 one module per route
```

**Design tokens** drive everything — colour, type scale, spacing, easing, radii.
The palette is sampled from the logo rather than invented: ten pigments read off
the wreath itself (rose, magenta, violet, cobalt, teal, leaf, chartreuse,
marigold, coral, vermilion), each in a wash and an ink weight, over a warm paper
ramp and a plum text ramp. Magenta ink is the accent on paper; a lighter rose
(`--rose-lit`) takes over on the plum grounds, where the wash weight only reaches
3.7:1 as small text. Type is Bodoni Moda (display, italic used one word at a
time) over Jost (wide-tracked uppercase labels and body).

The twelve products each take one pigment family, so the range reads as a
spectrum the way the wreath does — vessels stay honest materials (cream ceramic,
kraft, amber glass) and the cap and label carry the colour.

Dark mode is defined three ways (bare `:root`, `prefers-color-scheme` guarded
against an explicit light choice, and `[data-theme="dark"]`) so the toggle wins
in both directions and the system default still works. `.band--olive` and its
siblings flip the same tokens locally, so any component nests correctly inside a
dark section without special cases. Sections never name a raw colour: a wave
edge or gradient refers to the ground it pours into through a `--band-*` alias
that resolves per theme.

**The logo** ships as `assets/img/logo-wreath.webp` (816×768, 223 KB), produced
from the supplied 204×192 JPEG by `tools/remaster-art.mjs`. A naive knockout
left 1104 isolated half-transparent pixels — 2.8% of the image — and those are
what read as grain the moment the mark is enlarged. The tool denoises the JPEG
ringing before keying, finds the ground by flooding in from the border rather
than by thresholding lightness, un-blends the partial edges so they do not go
milky on a coloured ground, and resamples up with Catmull-Rom on premultiplied
RGBA. `logo-wreath.png` is the lossless master; the site serves the WebP, which
is visually identical at a quarter the weight. Re-run the tool for any artwork
that arrives on a white background, product photography included.

The source is still a 204×192 thumbnail, so the remaster is an honest upscale
rather than new detail. A larger original — SVG, or PNG ≥1000px with
transparency — would let the wreath run bigger still, and a simplified
small-size mark would let the nav and favicon carry the logo instead of type.

**Botanical artwork** is generated, not drawn by hand: stems are cubic curves,
leaves and petals share one axis/width construction, and a seeded PRNG gives
each plant its own asymmetry while staying identical between loads
(`lib/botanical.js` — eight forms, four render modes). Sections carry *fields*
of oversized, cropped, tinted artwork. Scroll parallax and a cursor lean are
folded into one JS transform on the outer node while the ambient sway stays in
CSS on an inner node, so neither can overwrite the other.

The fourth mode, `wash`, is what ties the artwork to the logo. It paints in the
order a brush would: a loose underwash in a second pigment that wanders past the
edge, the body colour ruffled by its own turbulence, a rim — the same outline as
a wide soft stroke, which is what gives real watercolour its darker edge — and
the ink drawing last. One layer per section is painted this way and the rest stay
as line work, which keeps the filter cost down and the page mostly quiet.

**The floral canvas** is the dim floral ground the whole site sits on: one
fixed layer, drawn once as a single SVG data URI and panned a quarter of a
viewport across the length of the document, so it drifts rather than sitting
pinned. Sections paint their own opaque grounds, so it cannot live behind them —
it is stacked over them and under every `.wrap` instead. The obvious way to do
that is a blend mode, and two viewport-sized blend layers measured at about 40%
of the scroll frame budget; plain alpha turned out to do the same job for a
tenth of that, because the wash pigments are mid-tone and so the identical
colours darken the paper and lighten the plum bands. The composition is written
out by hand rather than scattered — an even spread is what makes a floral
background read as wallpaper — clustering along the edges and thinning through
the middle third where the body copy sits.

**Motion** is opt-in via `data-reveal`, staggered with `data-stagger`, and split into
lines/words/chars with `data-split`. On top of that the cover's wreath blooms
open from its centre through an animating mask and then turns and recedes as the
cover leaves; the headline resolves out of a blur (`data-reveal="ink"`); the
encyclopedia's specimen plates ink themselves in, each path given its own dash
length from `getTotalLength()` because one guessed constant finishes early on
short paths and never finishes on long ones; the primary button fills with a
watercolour sweep; and the cover's rule opens outward from the sprig set into it.

Everything collapses under `prefers-reduced-motion: reduce`. One blanket rule
drops every animation to 0.01ms, so the reduced-motion blocks only need to undo
static from-states that would otherwise stick — plus the wreath's scroll-linked
turn, which is a live transform rather than an animation and so has to be
overridden in `home.css`, after the rule it is countermanding.

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
- A WCAG AA contrast pass over every text node on all eight routes in both
  themes, measured against the painted backdrop

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
