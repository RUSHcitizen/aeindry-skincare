/**
 * Home — nine rooms of a botanical apothecary.
 *
 * Every section is a different composition on purpose: full-bleed cover,
 * typographic statement, apothecary shelf, scroll-driven botanical
 * encyclopedia, editorial story, centred product spotlight, reviews,
 * education, closing invitation. The botanical artwork behind them is one
 * continuous environment — branches leave one section and arrive in the next.
 */

import { $, $$, esc, countUp, clamp, prefersReducedMotion } from '../lib/dom.js';
import { PRODUCTS, getProduct, formatPrice, priceOf } from '../data/products.js';
import {
  BRAND, PROMISES, PILLARS, TESTIMONIALS, JOURNAL, STATS, INGREDIENTS, TIMELINE, CONCERNS
} from '../data/content.js';
import { productArt } from '../lib/art.js';
import { botanical } from '../lib/botanical.js';
import { botField, petalDrift, edge, join, initBotField } from '../ui/bot-field.js';
import { initTilt } from '../ui/tilt.js';
import { trackProgress } from '../core/scroll.js';

/* The shelf, the spotlight and the encyclopedia all pull from real data. */
/* The photographed eight lead, because a real jar on a white sweep beats a
   generated one every time. The second shelf carries the newer arrivals. */
const SHELF = ['botanical-hand-butter', 'pine-tar-soap', 'face-oil', 'deodorant-creme'];
const SHELF_TWO = ['hair-butter', 'shower-steamers', 'beeswax-candle', 'room-diffuser'];
const SPOTLIGHT = 'botanical-hand-butter';
const ENCYCLOPEDIA = ['shea-butter', 'calendula', 'cocoa-butter', 'kaolin-clay', 'rosehip-oil', 'beeswax'];
/* Forms that stay legible at glyph size — the sparser ones turn to specks. */
const START_LEAVES = ['sprig', 'fern', 'bloom', 'seedstem', 'sprig', 'branch', 'bloom', 'fern'];

export default function home() {
  const spotlight = getProduct(SPOTLIGHT);
  const shelf = SHELF.map(getProduct);
  const shelfTwo = SHELF_TWO.map(getProduct);
  const entries = ENCYCLOPEDIA.map((id) => INGREDIENTS.find((i) => i.id === id)).filter(Boolean);

  return {
    title: 'All Natural Handmade Skincare',
    html: `
    <!-- ═══════════ I. THE COVER ═══════════ -->
    <section class="cover">
      ${botField([
        { kind: 'branch', seed: 'cover-a', mode: 'line', stroke: 1.4, right: '-6%', y: '-4%', w: '46vw',
          rot: 8, op: 0.22, tone: 'var(--bot-ink)', par: 0.16, cur: 22, sway: 26, swayDeg: 1.1 },
        { kind: 'fern', seed: 'cover-b', mode: 'line', stroke: 1.3, x: '-10%', y: '18%', w: '30vw',
          rot: -14, op: 0.18, tone: 'var(--bot-sage)', par: -0.1, cur: 14, sway: 30, swayDeg: 1.4, mobile: 'hide' },
        /* Kept clear of the centre: the wreath owns that space, and a bloom
           behind it reads as a smudge rather than as background. */
        { kind: 'bloom', seed: 'cover-c', mode: 'line', stroke: 1.1, right: '-14%', bottom: '4%', w: '34vw',
          op: 0.1, tone: 'var(--bot-rose)', blur: 1.4, par: 0.05, cur: 8, breathe: true, sway: 34, mobile: 'hide' },
        { kind: 'spray', seed: 'cover-d', mode: 'wash', stroke: 1.1, x: '-14%', bottom: '-22%', w: '36vw',
          op: 0.3, tone: 'var(--leaf-wash)', alt: 'var(--chartreuse-wash)',
          par: 0.22, cur: 18, sway: 24, swayDeg: 1.2 },
        { kind: 'sprig', seed: 'cover-e', mode: 'line', stroke: 1.4, right: '4%', bottom: '-6%', w: '20vw',
          rot: 20, op: 0.2, tone: 'var(--bot-taupe)', par: 0.3, cur: 26, sway: 20, mobile: 'hide' }
      ])}
      ${petalDrift(7, 'cover')}

      <div class="wrap cover__inner">
        <!-- The mark and the line it carries are one lockup, not two stacked
             blocks: the headline rises into the wreath's lower arc so the pair
             reads as a single object. The wreath already says "purity is
             essence" in small caps; the headline is that line said out loud. -->
        <div class="cover__lockup">
          <figure class="cover__logo" data-reveal="scale" data-keep-transform>
            <span class="cover__halo" aria-hidden="true"></span>
            <!-- Two sizes, because sharpness here tracks resolution and nothing
                 else: measured at the size this actually renders on a 2x
                 display, edge energy goes 6.3 at 900px to 8.0 at 1600px, while
                 changing the encoder quality from 0.72 to 0.92 moves it by
                 less than 2%. An ordinary display still downloads the small one. -->
            <img src="assets/img/logo-wreath-900.webp"
                 srcset="assets/img/logo-wreath-900.webp 900w, assets/img/logo-wreath-1600.webp 1600w"
                 sizes="(max-width: 760px) 58vw, 430px"
                 width="900" height="935" decoding="async" fetchpriority="high"
                 alt="Aeindry Skincare — Purity is Essence">
          </figure>

          <h1 class="cover__title display-lg" data-reveal="ink" data-split="words" data-split-step="120">
            Purity is <em>Essence</em>
          </h1>
        </div>

        <div class="cover__rule" data-reveal="fade" style="--reveal-delay:480ms">
          <span></span>${botanical('sprig', { seed: 'rule', mode: 'line', stroke: 2.4 })}<span></span>
        </div>

        <div class="cover__foot">
          <p class="cover__blurb" data-reveal="up" style="--reveal-delay:540ms">
            Handmade in ${esc(BRAND.city)} by a small, woman-owned company &mdash;
            plant oils, botanical extracts and rich butters, and genuinely nothing else.
          </p>
          <div class="cover__actions">
            <a class="btn btn--primary btn--lg" href="#/shop" data-magnetic="0.18"
               data-reveal="up" style="--reveal-delay:620ms">
              <span class="btn__label">Explore skincare</span>
              <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
            <a class="btn btn--ghost btn--lg" href="#/ritual" data-reveal="up" style="--reveal-delay:680ms">
              <span class="btn__label">Build a ritual</span>
            </a>
          </div>
        </div>
      </div>

      <a class="cover__cue" href="#promise" aria-label="Scroll to content">
        <span class="cover__cue-line" aria-hidden="true"></span>
      </a>
    </section>

    <!-- ═══════════ II. THE PROMISE ═══════════ -->
    <section class="promise-band band--olive" id="promise">
      ${edge('top', 'var(--band-paper)')}
      ${botField([
        { kind: 'arc', seed: 'pr-a', mode: 'line', stroke: 1.2, x: '-4%', bottom: '-40%', w: '58vw',
          op: 0.14, tone: 'var(--bot-sage)', par: 0.14, cur: 12 },
        { kind: 'seedstem', seed: 'pr-b', mode: 'wash', stroke: 1.3, right: '6%', y: '-16%', w: '16vw',
          rot: 12, op: 0.4, tone: 'var(--chartreuse-wash)', alt: 'var(--leaf-wash)',
          par: -0.12, cur: 16, mobile: 'hide' }
      ])}
      <div class="marquee" aria-hidden="true">
        <div class="marquee__track" style="--speed:74s">
          ${[...PROMISES, ...PROMISES].map((p) =>
            `<span class="marquee__item">${esc(p)}<span class="sep">${botanical('sprig', { seed: p, mode: 'line', stroke: 3 })}</span></span>`).join('')}
        </div>
      </div>
      <p class="visually-hidden">${PROMISES.join('. ')}.</p>
    </section>

    <!-- ═══════════ III. CRAFTED WITH INTENTION ═══════════ -->
    <section class="section intention">
      ${botField([
        { kind: 'fern', seed: 'int-a', mode: 'wash', stroke: 1.1, right: '-12%', y: '-8%', w: '44vw',
          rot: 16, op: 0.34, tone: 'var(--teal-wash)', alt: 'var(--leaf-wash)',
          par: 0.18, cur: 20, sway: 28, swayDeg: 1.3 },
        { kind: 'petals', seed: 'int-b', mode: 'line', stroke: 1.2, x: '4%', bottom: '4%', w: '26vw',
          op: 0.16, tone: 'var(--bot-taupe)', par: -0.14, cur: 24, mobile: 'hide' }
      ])}
      <div class="wrap">
        <div class="intention__grid">
          <div class="intention__lead">
            <p class="label" data-reveal="fade">Crafted with intention</p>
            <h2 class="intention__title display-lg" data-split="lines">
              Every formula begins as a <em>question</em>, not a product.
            </h2>
          </div>
          <div class="intention__body">
            <p class="body-lg" data-reveal="up">
              ${esc(BRAND.founder)} is a mom, a certified formulator and a biotechnologist.
              The work started in ${BRAND.journeyStarted}, when her son developed allergies
              and eczema and she began reading ingredient labels the way she used to read papers.
            </p>
            <div class="intention__pillars" data-stagger style="--stagger-step:120ms">
              ${PILLARS.map((p, i) => `
                <article class="pillar-line" data-reveal="up">
                  <span class="pillar-line__num">${String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 class="pillar-line__title">${esc(p.title)}</h3>
                    <p class="pillar-line__body">${esc(p.body)}</p>
                  </div>
                </article>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ IV. THE APOTHECARY SHELF ═══════════ -->
    <section class="section shelf-sec band--linen">
      ${botField([
        { kind: 'branch', seed: 'sh-a', mode: 'line', stroke: 1.3, x: '-14%', y: '2%', w: '48vw',
          rot: -6, flip: true, op: 0.16, tone: 'var(--bot-ink)', par: 0.12, cur: 16 },
        { kind: 'bloom', seed: 'sh-b', mode: 'wash', stroke: 1, right: '-8%', bottom: '-10%', w: '34vw',
          op: 0.34, tone: 'var(--rose-wash)', alt: 'var(--violet-wash)',
          par: 0.2, cur: 12, breathe: true, mobile: 'hide' }
      ])}
      <div class="wrap">
        <header class="sec-open">
          <p class="label" data-reveal="fade">The shelf</p>
          <h2 class="h2" data-split="lines">What people reach for first</h2>
          <p class="sec-open__note body-sm" data-reveal="up">
            Small batches, poured and cut by hand. Every bar cures six full weeks before it leaves the bench.
          </p>
        </header>
      </div>

      ${[shelf, shelfTwo].map((row, ri) => `
        <div class="shelf" data-reveal="fade">
          <div class="wrap wrap--wide">
            <div class="shelf__row" data-stagger style="--stagger-step:90ms">
              ${row.map((p, i) => shelfItem(p, ri * 4 + i)).join('')}
            </div>
          </div>
        </div>`).join('')}

      <div class="wrap">
        <div class="sec-foot" data-reveal="up">
          <a class="btn btn--ghost" href="#/shop" data-magnetic="0.16">
            <span class="btn__label">The whole apothecary &mdash; ${PRODUCTS.length} formulas</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ═══════════ IV·b. WHERE TO START ═══════════ -->
    <section class="section start band--linen">
      ${botField([
        { kind: 'seedstem', seed: 'sb-a', mode: 'line', stroke: 1.3, x: '3%', y: '-6%', w: '13vw',
          rot: -8, op: 0.18, tone: 'var(--bot-taupe)', par: 0.14, cur: 16, mobile: 'hide' },
        { kind: 'petals', seed: 'sb-b', mode: 'wash', stroke: 1.2, right: '4%', bottom: '2%', w: '20vw',
          op: 0.38, tone: 'var(--coral-wash)', alt: 'var(--marigold-wash)',
          par: -0.12, cur: 22, mobile: 'hide' }
      ])}
      <div class="wrap">
        <header class="sec-open sec-open--center">
          <p class="label" data-reveal="fade">Where to start</p>
          <h2 class="h2" data-split="lines">Tell us what your skin is <em>doing</em></h2>
          <p class="sec-open__note body-sm" data-reveal="up">
            Pick the thing that bothers you most and we will put a routine together &mdash;
            which product, in what order, and honestly why.
          </p>
        </header>

        <ul class="start__grid" role="list" data-stagger style="--stagger-step:55ms">
          ${CONCERNS.map((c, i) => `
            <li data-reveal="up">
              <a class="start__tile" href="#/ritual?concern=${esc(c.id)}" data-magnetic="0.1">
                <span class="start__leaf" aria-hidden="true">
                  ${botanical(START_LEAVES[i % START_LEAVES.length], { seed: c.id, mode: 'line', stroke: 2.4 })}
                </span>
                <span class="start__label">${esc(c.label)}</span>
                <span class="start__body">${esc(c.body)}</span>
              </a>
            </li>`).join('')}
        </ul>

        <div class="sec-foot" data-reveal="up">
          <a class="btn-text" href="#/ritual?tab=scent">
            Or find your scent instead
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>
    </section>

    <!-- ═══════════ V. DISCOVER THE BOTANICALS ═══════════ -->
    <section class="botanicals band--olive" id="botanicals">
      ${edge('top', 'var(--band-linen)')}
      ${botField([
        { kind: 'spray', seed: 'bo-a', mode: 'wash', stroke: 1, x: '-16%', bottom: '-18%', w: '52vw',
          op: 0.28, tone: 'var(--leaf-wash)', alt: 'var(--chartreuse-wash)', par: 0.1, cur: 10 }
      ])}
      <div class="wrap">
        <header class="sec-open sec-open--center">
          <p class="label" data-reveal="fade">Discover the botanicals</p>
          <h2 class="h2" data-split="lines">An <em>encyclopedia</em> of what goes in</h2>
        </header>

        <div class="enc" data-enc>
          <div class="enc__stage">
            <div class="enc__art" data-enc-art>
              ${entries.map((ing, i) => `
                <figure class="enc__plate ${i === 0 ? 'is-on' : ''}" data-plate="${i}">
                  <span class="enc__halo" style="--ing:${esc(ing.color)}" aria-hidden="true"></span>
                  ${botanical(encKind(ing.id), { seed: ing.id, mode: 'line', stroke: 1.5 })}
                  <figcaption class="enc__latin">${esc(ing.latin)}</figcaption>
                </figure>`).join('')}
            </div>
            <p class="enc__count" data-enc-count aria-hidden="true">
              <span>01</span> &frasl; ${String(entries.length).padStart(2, '0')}
            </p>
          </div>

          <ol class="enc__list" role="list">
            ${entries.map((ing, i) => {
              const uses = ing.foundIn.map(getProduct).filter(Boolean).slice(0, 3);
              return `
              <li class="enc__entry" data-entry="${i}">
                <span class="enc__swatch" style="background:${esc(ing.color)}" aria-hidden="true"></span>
                <p class="enc__role">${esc(ing.role)}</p>
                <h3 class="enc__name">${esc(ing.name)}</h3>
                <p class="enc__origin">${esc(ing.latin)} &middot; ${esc(ing.origin)}</p>
                <p class="enc__body">${esc(ing.body)}</p>
                ${uses.length ? `
                  <p class="enc__uses-label">Found in</p>
                  <ul class="enc__uses" role="list">
                    ${uses.map((p) => `<li><a href="#/product/${esc(p.id)}">${esc(p.name)}</a></li>`).join('')}
                  </ul>` : ''}
              </li>`;
            }).join('')}
          </ol>
        </div>

        <div class="sec-foot" data-reveal="up">
          <a class="btn-text" href="#/ingredients">
            All ${INGREDIENTS.length} ingredients
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>
      ${edge('bottom', 'var(--band-paper)')}
    </section>

    <!-- ═══════════ VI. THE STORY ═══════════ -->
    <section class="section story">
      ${botField([
        { kind: 'branch', seed: 'st-a', mode: 'line', stroke: 1.3, right: '-10%', y: '-6%', w: '42vw',
          rot: -10, op: 0.18, tone: 'var(--bot-ink)', par: -0.14, cur: 18, sway: 26 },
        { kind: 'sprig', seed: 'st-b', mode: 'duo', stroke: 1.1, x: '2%', y: '30%', w: '18vw',
          rot: -18, op: 0.15, tone: 'var(--bot-sage)', par: 0.24, cur: 20, mobile: 'hide' },
        { kind: 'petals', seed: 'st-c', mode: 'wash', stroke: 1.2, right: '6%', bottom: '2%', w: '20vw',
          op: 0.26, tone: 'var(--magenta-wash)', alt: 'var(--rose-wash)',
          par: 0.18, cur: 26, mobile: 'hide' }
      ])}
      <div class="wrap wrap--narrow">
        <p class="label text-center mx-auto" data-reveal="fade">The story</p>
        <blockquote class="story__quote" data-split="lines" data-split-step="100">
          It started with a child who could not stop scratching.
        </blockquote>

        <div class="story__cols">
          <p class="body-lg" data-reveal="up">
            In ${BRAND.journeyStarted} our son developed allergies and eczema, and the natural
            skincare journey began. ${esc(BRAND.founder.split(' ')[0])} researched natural body
            care ingredients from around the world &mdash; shea from West Africa, kokum from the
            Western Ghats, cold-pressed oils and the herbal infusions her grandmother would have
            recognised.
          </p>
          <p class="body-lg" data-reveal="up" style="--reveal-delay:120ms">
            The focus turned to natural soap, then to salves, creams and balms. In
            ${BRAND.founded} what began at a kitchen counter became a company: small,
            woman-owned, 100% natural, and made entirely by hand in the Pacific Northwest.
          </p>
        </div>

        <div class="story__stats" data-stagger style="--stagger-step:110ms">
          ${STATS.map((s) => `
            <div class="stat-mini" data-reveal="up">
              <span class="stat-mini__value" data-count="${s.value}" data-suffix="${esc(s.suffix)}"
                    data-group="${s.group === false ? 'false' : 'true'}">0${esc(s.suffix)}</span>
              <span class="stat-mini__label">${esc(s.label)}</span>
            </div>`).join('')}
        </div>

        <div class="sec-foot" data-reveal="up">
          <a class="btn btn--ghost" href="#/about" data-magnetic="0.16">
            <span class="btn__label">Read the full story</span>
          </a>
        </div>
      </div>
    </section>

    ${join('branch', 'j1')}

    <!-- ═══════════ VII. THE SPOTLIGHT ═══════════ -->
    <section class="spotlight-sec" style="--sp-tint:${esc(spotlight.art.tint[1])};--sp-accent:${esc(spotlight.art.accent)}">
      ${botField([
        { kind: 'bloom', seed: 'sp-a', mode: 'wash', stroke: 1, x: '50%', y: '-6%', w: '30vw',
          op: 0.4, tone: 'var(--rose-wash)', alt: 'var(--violet-wash)',
          par: 0.1, cur: 14, breathe: true, sway: 30 },
        { kind: 'arc', seed: 'sp-b', mode: 'line', stroke: 1.2, x: '-10%', y: '30%', w: '60vw',
          op: 0.12, tone: 'var(--bot-sage)', par: -0.08, cur: 10 },
        { kind: 'fern', seed: 'sp-c', mode: 'line', stroke: 1.2, x: '-8%', bottom: '-6%', w: '26vw',
          rot: -20, op: 0.16, tone: 'var(--bot-sage)', par: 0.2, cur: 18, mobile: 'hide' },
        { kind: 'fern', seed: 'sp-d', mode: 'line', stroke: 1.2, right: '-8%', bottom: '-6%', w: '26vw',
          rot: 20, flip: true, op: 0.16, tone: 'var(--bot-sage)', par: 0.2, cur: 18, mobile: 'hide' }
      ], { bleed: false })}
      ${petalDrift(5, 'spot')}

      <div class="wrap wrap--narrow spotlight__inner">
        <div class="spotlight__crown" data-reveal="fade" aria-hidden="true">
          ${botanical('arc', { seed: 'crown', mode: 'line', stroke: 1.6 })}
        </div>

        <p class="label text-center mx-auto" data-reveal="fade">The spotlight</p>
        <hr class="spotlight__rule" data-reveal="fade">

        <figure class="spotlight__stage" data-reveal="scale">
          <span class="spotlight__glow" aria-hidden="true"></span>
          ${productArt(spotlight, { className: 'spotlight__art' })}
        </figure>

        <hr class="spotlight__rule" data-reveal="fade">

        <div class="spotlight__info">
          <h2 class="spotlight__name display-lg" data-split="lines">${esc(spotlight.name)}</h2>
          <p class="spotlight__tag" data-reveal="up">${esc(spotlight.tagline)}</p>
          <p class="body-lg spotlight__desc" data-reveal="up">${esc(spotlight.description)}</p>

          <ul class="spotlight__marks" role="list" data-stagger style="--stagger-step:80ms">
            ${spotlight.benefits.slice(0, 3).map((b) => `<li data-reveal="up">${esc(b)}</li>`).join('')}
          </ul>

          <div class="spotlight__buy" data-reveal="up">
            <span class="spotlight__price">${formatPrice(priceOf(spotlight))}</span>
            <a class="btn btn--primary" href="#/product/${esc(spotlight.id)}" data-magnetic="0.16">
              <span class="btn__label">View product</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ VIII. IN THEIR WORDS ═══════════ -->
    <section class="section words band--linen">
      ${botField([
        { kind: 'sprig', seed: 'w-a', mode: 'wash', stroke: 1.3, x: '6%', y: '10%', w: '16vw',
          rot: -12, op: 0.38, tone: 'var(--cobalt-wash)', alt: 'var(--teal-wash)',
          par: 0.16, cur: 18, mobile: 'hide' },
        { kind: 'sprig', seed: 'w-b', mode: 'line', stroke: 1.3, right: '6%', bottom: '10%', w: '16vw',
          rot: 168, op: 0.18, tone: 'var(--bot-sage)', par: -0.16, cur: 18, mobile: 'hide' }
      ])}
      <div class="wrap wrap--narrow">
        <header class="sec-open sec-open--center">
          <p class="label" data-reveal="fade">In their words</p>
          <h2 class="h2" data-split="lines">From the markets and the mailbox</h2>
        </header>
        ${TESTIMONIALS.length ? `
          <div class="words__grid" data-stagger style="--stagger-step:100ms">
            ${TESTIMONIALS.map((t) => `
              <figure class="word-card" data-reveal="up">
                <blockquote>${esc(t.quote)}</blockquote>
                <figcaption>
                  <span class="word-card__name">${esc(t.name)}</span>
                  <span class="word-card__meta">${esc(t.meta)} &middot; ${esc(t.product)}</span>
                </figcaption>
              </figure>`).join('')}
          </div>`
        : `
          <div class="words__empty" data-reveal="up">
            <span class="words__empty-mark" aria-hidden="true">
              ${botanical('bloom', { seed: 'empty', mode: 'line', stroke: 1.4 })}
            </span>
            <p class="body-lg">
              Real customer reviews belong here. This section is built and waiting &mdash;
              it switches on the moment genuine reviews are added, and nothing has been
              invented to fill it in the meantime.
            </p>
            <p class="body-xs">Reviews live in <code>assets/js/data/content.js</code> &rarr; <code>TESTIMONIALS</code>.</p>
          </div>`}
      </div>
    </section>

    <!-- ═══════════ IX. THE JOURNAL ═══════════ -->
    <section class="section reading">
      ${botField([
        { kind: 'seedstem', seed: 'rd-a', mode: 'wash', stroke: 1.3, right: '3%', y: '-4%', w: '14vw',
          rot: 10, op: 0.4, tone: 'var(--coral-wash)', alt: 'var(--marigold-wash)',
          par: 0.18, cur: 20, mobile: 'hide' }
      ])}
      <div class="wrap">
        <header class="sec-open">
          <p class="label" data-reveal="fade">From the workbench</p>
          <h2 class="h2" data-split="lines">Why we do it this way</h2>
          <p class="sec-open__note body-sm" data-reveal="up">
            The reasoning behind the formulas &mdash; written for people who read labels.
          </p>
        </header>

        <div class="reading__list" data-stagger style="--stagger-step:80ms">
          ${JOURNAL.slice(0, 4).map((j, i) => `
            <a class="read-row" href="#/journal" data-reveal="up" style="--jc:${esc(j.color)}">
              <span class="read-row__idx">${String(i + 1).padStart(2, '0')}</span>
              <span class="read-row__leaf" aria-hidden="true">${botanical('sprig', { seed: j.id, mode: 'line', stroke: 2.6 })}</span>
              <span class="read-row__body">
                <span class="read-row__tag">${esc(j.tag)}</span>
                <span class="read-row__title">${esc(j.title)}</span>
                <span class="read-row__excerpt">${esc(j.excerpt)}</span>
              </span>
              <span class="read-row__meta">${esc(j.read)}</span>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <!-- ═══════════ X. THE INVITATION ═══════════ -->
    <section class="invite band--olive">
      ${edge('top', 'var(--band-paper)')}
      ${botField([
        { kind: 'branch', seed: 'iv-a', mode: 'line', stroke: 1.2, x: '-12%', y: '4%', w: '46vw',
          rot: 6, op: 0.16, tone: 'var(--bot-sage)', par: 0.14, cur: 16 },
        { kind: 'branch', seed: 'iv-b', mode: 'line', stroke: 1.2, right: '-12%', bottom: '2%', w: '46vw',
          rot: 186, op: 0.16, tone: 'var(--bot-sage)', par: -0.14, cur: 16 },
        { kind: 'bloom', seed: 'iv-c', mode: 'wash', stroke: 1, x: '44%', y: '18%', w: '26vw',
          op: 0.3, tone: 'var(--marigold-wash)', alt: 'var(--coral-wash)',
          par: 0.06, cur: 8, breathe: true }
      ])}
      <div class="wrap wrap--narrow invite__inner">
        <span class="invite__mark" data-reveal="scale" aria-hidden="true">
          ${botanical('bloom', { seed: 'invite', mode: 'line', stroke: 1.3 })}
        </span>
        <h2 class="display-lg" data-split="lines">Come and <em>smell</em> them.</h2>
        <p class="lede mx-auto text-center" data-reveal="up">
          We sell at markets around the Seattle area through the season. Dates go up on
          Instagram first, along with new batches and the occasional note on what we are
          reformulating.
        </p>
        <form class="subscribe mx-auto" data-newsletter data-reveal="up" style="--reveal-delay:120ms">
          <label class="visually-hidden" for="nl-home">Email address</label>
          <input id="nl-home" type="email" name="email" placeholder="you@example.com" required autocomplete="email">
          <button class="btn btn--accent btn--sm" type="submit"><span class="btn__label">Keep me posted</span></button>
        </form>
        <p class="body-xs text-center" data-reveal="fade">
          <a class="link-underline" href="${esc(BRAND.instagram)}" target="_blank" rel="noopener">${esc(BRAND.instagramHandle)}</a>
          &middot;
          <a class="link-underline" href="mailto:${esc(BRAND.email)}">${esc(BRAND.email)}</a>
        </p>
      </div>
    </section>`,

    mount(root) {
      const cleanups = [];

      cleanups.push(initBotField(root));
      initTilt(root);

      /* ---- counters ---- */
      const statsBlock = $('.story__stats', root);
      if (statsBlock) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            $$('[data-count]', statsBlock).forEach((n) =>
              countUp(n, parseInt(n.dataset.count, 10), {
                suffix: n.dataset.suffix || '',
                group: n.dataset.group !== 'false'
              }));
            io.disconnect();
          });
        }, { threshold: 0.4 });
        io.observe(statsBlock);
        cleanups.push(() => io.disconnect());
      }

      /* ---- botanical encyclopedia: the plate follows the reader ---- */
      const enc = $('[data-enc]', root);
      if (enc) {
        const plates = $$('.enc__plate', enc);
        const entriesEls = $$('.enc__entry', enc);
        const counter = $('[data-enc-count] span', enc);
        let active = -1;

        /* Each plate draws itself on the way in, the way a specimen sheet gets
           inked. Path lengths differ wildly between forms, so every path gets
           its own dash length rather than one guessed constant — and the
           delay is spread down the drawing so the stem leads the leaves. */
        const drawable = new Map();
        if (!prefersReducedMotion()) {
          plates.forEach((plate) => {
            const paths = $$('svg path', plate).filter((n) => n.getAttribute('stroke') !== null
              || getComputedStyle(n).stroke !== 'none');
            paths.forEach((path, pi) => {
              let len = 0;
              try { len = path.getTotalLength(); } catch { /* non-renderable path */ }
              if (!len || len > 6000) return;
              path.style.setProperty('--len', len.toFixed(1));
              path.style.setProperty('--draw-delay', `${Math.min(pi * 26, 620)}ms`);
              path.classList.add('is-drawable');
            });
            drawable.set(plate, paths.length);
          });
        }

        const setActive = (i) => {
          if (i === active) return;
          active = i;
          plates.forEach((p, pi) => {
            const on = pi === i;
            // Restart the draw by taking the class off and forcing a reflow.
            if (on && drawable.has(p)) { p.classList.remove('is-drawn'); void p.offsetWidth; }
            p.classList.toggle('is-on', on);
            if (on) p.classList.add('is-drawn');
          });
          entriesEls.forEach((e, ei) => e.classList.toggle('is-on', ei === i));
          if (counter) counter.textContent = String(i + 1).padStart(2, '0');
        };

        const io = new IntersectionObserver((obs) => {
          // Whichever entry is nearest the middle of the viewport wins.
          let best = null;
          for (const o of obs) if (o.isIntersecting) best = o;
          if (best) setActive(entriesEls.indexOf(best.target));
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

        entriesEls.forEach((e) => io.observe(e));
        cleanups.push(() => io.disconnect());
        setActive(0);
      }

      /* ---- the cover's caption rule draws itself as the hero leaves ---- */
      const cover = $('.cover', root);
      if (cover) {
        cleanups.push(trackProgress(cover, (p) => {
          cover.style.setProperty('--leave', clamp(p, 0, 1).toFixed(3));
        }, { start: 1, end: 0 }));
      }

      return () => cleanups.forEach((fn) => fn?.());
    }
  };
}

/** Pick the botanical form that best suits each ingredient's plant. */
function encKind(id) {
  return {
    'shea-butter': 'branch',
    'calendula': 'bloom',
    'cocoa-butter': 'sprig',
    'kaolin-clay': 'petals',
    'rosehip-oil': 'bloom',
    'beeswax': 'seedstem',
    'olive-oil': 'sprig',
    'jojoba-oil': 'fern'
  }[id] || 'sprig';
}

/* Rotating through forms and placements keeps the shelf from reading as a
   repeating pattern — the brief is explicit that it must not become wallpaper. */
const SHELF_LEAVES = ['sprig', 'fern', 'seedstem', 'sprig', 'branch', 'fern'];

function leafPlacement(i) {
  const spots = [
    'left:2%;top:4%;width:36%;transform:rotate(-10deg)',
    'right:0%;top:10%;left:auto;width:30%;transform:rotate(16deg) scaleX(-1)',
    'left:-2%;top:22%;width:28%;transform:rotate(-22deg)',
    'right:2%;top:2%;left:auto;width:34%;transform:rotate(9deg)',
    'left:6%;top:14%;width:26%;transform:rotate(-4deg)',
    'right:-2%;top:18%;left:auto;width:32%;transform:rotate(22deg) scaleX(-1)',
    'left:0%;top:8%;width:32%;transform:rotate(-16deg)',
    'right:4%;top:12%;left:auto;width:28%;transform:rotate(6deg)'
  ];
  return spots[i % spots.length];
}

/** One vessel on the apothecary shelf. */
function shelfItem(p, i = 0) {
  const cheapest = Math.min(priceOf(p), ...(p.variants || []).map((v) => v.price ?? p.price));
  return `
  <article class="shelf-item" data-reveal="up"
           style="--tint:${esc(p.art.tint[1])};--tint2:${esc(p.art.tint[0])};--accent-art:${esc(p.art.accent)}">
    <div class="shelf-item__stage">
      <span class="shelf-item__halo" aria-hidden="true"></span>
      <span class="shelf-item__leaf" aria-hidden="true" style="${leafPlacement(i)}">
        ${botanical(SHELF_LEAVES[i % SHELF_LEAVES.length], { seed: p.id, mode: 'line', stroke: 2.2 })}
      </span>
      ${productArt(p, { className: 'shelf-item__art' })}
      <span class="shelf-item__shadow" aria-hidden="true"></span>
    </div>
    <div class="shelf-item__label">
      <h3 class="shelf-item__name"><a href="#/product/${esc(p.id)}">${esc(p.name)}</a></h3>
      <p class="shelf-item__note">${esc(p.tagline)}</p>
      <p class="shelf-item__price">${formatPrice(cheapest)}</p>
      <span class="shelf-item__cta" aria-hidden="true">View product</span>
    </div>
  </article>`;
}
