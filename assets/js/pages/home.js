/** Home — the full brand argument in one scroll. */

import { $, $$, esc, countUp } from '../lib/dom.js';
import { PRODUCTS, getProduct, formatPrice, priceOf } from '../data/products.js';
import { BRAND, PROMISES, PILLARS, TESTIMONIALS, JOURNAL, STATS, CONCERNS, INGREDIENTS } from '../data/content.js';
import { productArt, botanical, brandMark } from '../lib/art.js';
import { productCard } from '../ui/pcard.js';
import { initHeroCanvas } from '../ui/hero-canvas.js';
import { initCarousel } from '../ui/carousel.js';
import { initTilt } from '../ui/tilt.js';
import { trackProgress } from '../core/scroll.js';

const HERO_PRODUCTS = ['salve', 'specialty-soap', 'face-cream'];
const FEATURED = ['salve', 'specialty-soap', 'face-cream', 'lip-balm'];

export default function home() {
  const bestsellers = FEATURED.map(getProduct);
  const hero = HERO_PRODUCTS.map(getProduct);

  return {
    title: 'All Natural Handmade Skincare',
    html: `
    <!-- ============ HERO ============ -->
    <section class="hero">
      <canvas class="hero__canvas" aria-hidden="true"></canvas>
      <div class="hero__glow" aria-hidden="true"></div>

      <div class="wrap wrap--wide hero__inner">
        <div class="hero__copy">
          <p class="eyebrow hero__eyebrow">Handmade in the Pacific Northwest · Est. ${BRAND.founded}</p>

          <h1 class="hero__title display-xl" data-split="lines" data-split-step="70">
            Purity is the whole formula.
          </h1>

          <p class="hero__lede lede" data-reveal="up" style="--reveal-delay:520ms">
            A small, woman-owned company making 100% natural skincare by hand — plant oils,
            botanical extracts and rich butters, and genuinely nothing else. It started in 2012,
            with a child who could not stop scratching.
          </p>

          <div class="hero__actions cluster" data-reveal="up" style="--reveal-delay:660ms">
            <a class="btn btn--primary btn--lg" href="#/shop" data-magnetic="0.2">
              <span class="btn__label">Shop the range</span>
              <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
            <a class="btn btn--ghost btn--lg" href="#/ritual" data-magnetic="0.2">
              <span class="btn__label">Build your ritual</span>
            </a>
          </div>

          <dl class="hero__proof" data-reveal="fade" style="--reveal-delay:820ms">
            <div><dt>${PRODUCTS.length}</dt><dd>formulas</dd></div>
            <div><dt>0</dt><dd>preservatives</dd></div>
            <div><dt>6<span>wks</span></dt><dd>soap cure</dd></div>
          </dl>
        </div>

        <div class="hero__stage" data-reveal="scale" style="--reveal-delay:340ms">
          ${hero.map((p, i) => `
            <figure class="hero__item hero__item--${i + 1}" data-parallax="${0.1 + i * 0.09}"
                    style="--tint:${p.art.tint[1]};--accent:${p.art.accent}">
              <a href="#/product/${esc(p.id)}" data-cursor="label:VIEW" aria-label="${esc(p.name)}">
                ${productArt(p)}
              </a>
              <figcaption>${esc(p.name)}</figcaption>
            </figure>`).join('')}
          <div class="hero__ring" aria-hidden="true">
            <svg viewBox="0 0 200 200"><defs><path id="heroArc" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/></defs>
              <text><textPath href="#heroArc" startOffset="0">${esc(BRAND.tagline.toUpperCase())} · ${esc(BRAND.tagline.toUpperCase())} · </textPath></text>
            </svg>
          </div>
        </div>
      </div>

      <a class="hero__cue" href="#promise" aria-label="Scroll to content">
        <span class="hero__cue-line" aria-hidden="true"></span>
        <span class="hero__cue-text">Scroll</span>
      </a>
    </section>

    <!-- ============ PROMISE MARQUEE ============ -->
    <section class="promise band--forest" id="promise">
      <div class="marquee" aria-hidden="true">
        <div class="marquee__track" style="--speed:52s">
          ${[...PROMISES, ...PROMISES].map((p) =>
            `<span class="marquee__item">${esc(p)}<span class="sep">✦</span></span>`).join('')}
        </div>
      </div>
      <p class="visually-hidden">${PROMISES.join('. ')}.</p>
    </section>

    <!-- ============ BESTSELLERS ============ -->
    <section class="section" id="bestsellers">
      <div class="wrap">
        <header class="sec-head">
          <div>
            <p class="eyebrow" data-reveal="fade">The regulars</p>
            <h2 class="h2" data-split="lines">What people come back for</h2>
          </div>
          <p class="sec-head__aside body-sm" data-reveal="up">
            Four formulas that get reordered more than anything else we make — and the
            reason most people find us in the first place.
          </p>
        </header>

        <div class="pgrid pgrid--4" data-stagger style="--stagger-step:80px">
          ${bestsellers.map((p, i) => productCard(p, { reveal: i % 2 ? 'up' : 'tilt' })).join('')}
        </div>

        <div class="sec-foot" data-reveal="up">
          <a class="btn-text" href="#/shop">
            See all ${PRODUCTS.length} products
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>
    </section>

    <!-- ============ ORIGIN STORY ============ -->
    <section class="section origin band--forest" id="origin">
      <div class="origin__botanicals" aria-hidden="true" data-parallax="0.2">
        ${botanical('sprig', 'origin__sprig origin__sprig--1')}
        ${botanical('leaf', 'origin__sprig origin__sprig--2')}
      </div>
      <div class="wrap">
        <div class="origin__grid">
          <div class="origin__copy stack-m">
            <p class="eyebrow" data-reveal="fade">Why any of this exists</p>
            <h2 class="h2" data-split="lines">
              In 2012 our son developed eczema. Nothing on the shelf was honest enough to help.
            </h2>
            <p class="body-lg" data-reveal="up">
              The prescriptions worked, then stopped working, and the steroids kept getting
              stronger. So ${BRAND.founder.split(' ')[0]} — a mom, a certified formulator and a
              biotechnologist — started reading ingredient labels the way she used to read papers,
              and researching natural body care ingredients from around the world.
            </p>
            <p class="body-lg" data-reveal="up" style="--reveal-delay:120ms">
              The first lotion that held was the proof. The steroid prescriptions got smaller,
              then rarer. Then commercial soap kept undoing the progress, so the soap had to be
              made too. Everything on this site grew out of that one problem.
            </p>
            <div class="cluster" data-reveal="up" style="--reveal-delay:200ms">
              <a class="btn btn--light" href="#/about" data-magnetic="0.18">
                <span class="btn__label">Read the full story</span>
              </a>
            </div>
          </div>

          <div class="origin__stats" data-stagger style="--stagger-step:110ms">
            ${STATS.map((s) => `
              <div class="stat" data-reveal="up">
                <span class="stat__value" data-count="${s.value}" data-suffix="${esc(s.suffix)}" data-group="${s.group === false ? 'false' : 'true'}">0${esc(s.suffix)}</span>
                <span class="stat__label">${esc(s.label)}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- ============ PILLARS ============ -->
    <section class="section" id="pillars">
      <div class="wrap">
        <header class="sec-head sec-head--center">
          <p class="eyebrow eyebrow--bare" data-reveal="fade">How we work</p>
          <h2 class="h2 text-balance" data-split="lines">Four rules we have never broken</h2>
        </header>

        <div class="pillars" data-stagger style="--stagger-step:100ms">
          ${PILLARS.map((p, i) => `
            <article class="pillar" data-reveal="up">
              <span class="pillar__num">${String(i + 1).padStart(2, '0')}</span>
              <span class="pillar__icon">${botanical(p.icon)}</span>
              <h3 class="pillar__title">${esc(p.title)}</h3>
              <p class="pillar__body">${esc(p.body)}</p>
            </article>`).join('')}
        </div>
      </div>
    </section>

    <!-- ============ RITUAL TEASER ============ -->
    <section class="section ritual-teaser" id="ritual-teaser">
      <div class="wrap">
        <div class="ritual-teaser__inner">
          <div class="ritual-teaser__copy stack-m">
            <p class="eyebrow" data-reveal="fade">Not sure where to start?</p>
            <h2 class="h2" data-split="lines">Tell us what your skin is doing.</h2>
            <p class="body-lg" data-reveal="up">
              Pick the thing that bothers you most and we will put a routine together —
              which product, in what order, and honestly why. It takes about fifteen seconds.
            </p>
          </div>

          <div class="concern-grid" data-stagger style="--stagger-step:55ms">
            ${CONCERNS.map((c) => `
              <a class="concern" href="#/ritual?concern=${esc(c.id)}" data-reveal="scale" data-magnetic="0.14">
                <span class="concern__icon">${botanical(c.icon)}</span>
                <span class="concern__label">${esc(c.label)}</span>
                <span class="concern__body">${esc(c.body)}</span>
                <span class="concern__go" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
              </a>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- ============ INGREDIENT SPOTLIGHT ============ -->
    <section class="section spotlight" id="spotlight">
      <div class="wrap">
        <header class="sec-head">
          <div>
            <p class="eyebrow" data-reveal="fade">What goes in</p>
            <h2 class="h2" data-split="lines">Ingredients you could name from memory</h2>
          </div>
          <p class="sec-head__aside body-sm" data-reveal="up">
            Hover any of these to see what it does and where it turns up.
            The full library runs to ${INGREDIENTS.length} entries.
          </p>
        </header>

        <div class="spotlight__grid">
          <ul class="ing-chips" role="list" data-stagger style="--stagger-step:40ms">
            ${INGREDIENTS.slice(0, 12).map((ing) => `
              <li data-reveal="scale">
                <button class="ing-chip" type="button" data-ing="${esc(ing.id)}"
                        style="--ing:${esc(ing.color)}">
                  <span class="ing-chip__dot"></span>${esc(ing.name)}
                </button>
              </li>`).join('')}
          </ul>

          <aside class="ing-panel" data-reveal="left" aria-live="polite">
            <div class="ing-panel__inner"></div>
          </aside>
        </div>

        <div class="sec-foot" data-reveal="up">
          <a class="btn-text" href="#/ingredients">
            Explore the full ingredient library
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>
    </section>

    <!-- ============ FULL RANGE RAIL ============ -->
    <section class="section section--tight range" id="range">
      <div class="wrap">
        <header class="sec-head">
          <div>
            <p class="eyebrow" data-reveal="fade">Everything we make</p>
            <h2 class="h2" data-split="lines">Twelve formulas, no filler</h2>
          </div>
        </header>
      </div>
      <div class="rail" data-native-scroll>
        <div class="rail__track">
          ${PRODUCTS.map((p) => `
            <a class="rail__item" href="#/product/${esc(p.id)}" data-cursor="label:VIEW"
               style="--tint:${p.art.tint[1]};--tint2:${p.art.tint[0]}">
              <span class="rail__media">${productArt(p)}</span>
              <span class="rail__name">${esc(p.name)}</span>
              <span class="rail__price">${formatPrice(priceOf(p))}</span>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <!-- ============ TESTIMONIALS ============ -->
    <section class="section quotes band--forest" id="quotes">
      <div class="wrap">
        <header class="sec-head sec-head--center">
          <p class="eyebrow eyebrow--bare" data-reveal="fade">From the markets and the mailbox</p>
          <h2 class="h2" data-split="lines">What people tell us</h2>
        </header>
      </div>

      <div class="carousel" data-carousel tabindex="0" role="region" aria-label="Customer quotes">
        <div class="carousel__track no-scrollbar" data-carousel-track data-native-scroll>
          ${TESTIMONIALS.map((t) => `
            <figure class="quote">
              <span class="quote__mark" aria-hidden="true">”</span>
              <blockquote>${esc(t.quote)}</blockquote>
              <figcaption>
                <span class="quote__name">${esc(t.name)}</span>
                <span class="quote__meta">${esc(t.meta)} · ${esc(t.product)}</span>
              </figcaption>
            </figure>`).join('')}
        </div>
        <div class="carousel__controls wrap">
          <div class="carousel__dots" data-carousel-dots></div>
          <div class="carousel__arrows">
            <button class="icon-btn" type="button" data-carousel-prev aria-label="Previous quote">
              <svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
            </button>
            <button class="icon-btn" type="button" data-carousel-next aria-label="Next quote">
              <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ JOURNAL ============ -->
    <section class="section" id="journal-preview">
      <div class="wrap">
        <header class="sec-head">
          <div>
            <p class="eyebrow" data-reveal="fade">The journal</p>
            <h2 class="h2" data-split="lines">Why we do it this way</h2>
          </div>
          <p class="sec-head__aside body-sm" data-reveal="up">
            The reasoning behind the formulas — written for people who read labels.
          </p>
        </header>

        <div class="jgrid" data-stagger style="--stagger-step:80ms">
          ${JOURNAL.slice(0, 3).map((j) => `
            <a class="jcard" href="#/journal" data-reveal="up" style="--jc:${esc(j.color)}">
              <span class="jcard__tag">${esc(j.tag)}</span>
              <h3 class="jcard__title">${esc(j.title)}</h3>
              <p class="jcard__excerpt">${esc(j.excerpt)}</p>
              <span class="jcard__meta">${esc(j.date)} · ${esc(j.read)}</span>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <!-- ============ CTA ============ -->
    <section class="cta">
      <div class="wrap wrap--narrow">
        <div class="cta__inner">
          <span class="cta__mark" data-reveal="scale">${brandMark()}</span>
          <h2 class="display-lg text-balance" data-split="lines">${esc(BRAND.shortTag)}</h2>
          <p class="lede mx-auto text-center" data-reveal="up">
            New batches, market dates and the occasional note on what we are reformulating.
            No more than once a month.
          </p>
          <form class="subscribe mx-auto" data-newsletter data-reveal="up" style="--reveal-delay:120ms">
            <label class="visually-hidden" for="nl-home">Email address</label>
            <input id="nl-home" type="email" name="email" placeholder="you@example.com" required autocomplete="email">
            <button class="btn btn--accent btn--sm" type="submit"><span class="btn__label">Keep me posted</span></button>
          </form>
          <p class="body-xs text-center" data-reveal="fade">
            Or find us in person at markets around Seattle —
            <a class="link-underline" href="${esc(BRAND.instagram)}" target="_blank" rel="noopener">${esc(BRAND.instagramHandle)}</a>
            has the current schedule.
          </p>
        </div>
      </div>
    </section>`,

    mount(root) {
      const cleanups = [];

      // Hero atmosphere
      cleanups.push(initHeroCanvas($('.hero__canvas', root)));

      // Tilt on the bestseller cards
      initTilt(root);

      // Quote carousel
      cleanups.push(initCarousel($('[data-carousel]', root)));

      // Stats count up once the block is in view
      const statsBlock = $('.origin__stats', root);
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

      // Ingredient spotlight panel
      const panel = $('.ing-panel__inner', root);
      const chips = $$('.ing-chip', root);
      const paintIng = (id) => {
        const ing = INGREDIENTS.find((i) => i.id === id);
        if (!ing || !panel) return;
        chips.forEach((c) => c.classList.toggle('is-on', c.dataset.ing === id));
        const uses = ing.foundIn.map(getProduct).filter(Boolean);
        panel.innerHTML = `
          <span class="ing-panel__swatch" style="background:${esc(ing.color)}"></span>
          <p class="eyebrow eyebrow--bare">${esc(ing.role)}</p>
          <h3 class="h4">${esc(ing.name)}</h3>
          <p class="ing-panel__latin">${esc(ing.latin)} · ${esc(ing.origin)}</p>
          <p class="body-sm">${esc(ing.body)}</p>
          ${uses.length ? `
            <p class="ing-panel__uses-label">Found in</p>
            <ul class="ing-panel__uses" role="list">
              ${uses.slice(0, 5).map((p) => `<li><a href="#/product/${esc(p.id)}">${esc(p.name)}</a></li>`).join('')}
            </ul>` : ''}`;
        panel.animate(
          [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
          { duration: 420, easing: 'cubic-bezier(0.16,1,0.3,1)' }
        );
      };
      chips.forEach((c) => {
        c.addEventListener('pointerenter', () => paintIng(c.dataset.ing));
        c.addEventListener('focus', () => paintIng(c.dataset.ing));
        c.addEventListener('click', () => paintIng(c.dataset.ing));
      });
      paintIng(INGREDIENTS[0].id);

      // Hero rotating caption ring
      const ring = $('.hero__ring svg', root);
      if (ring) {
        cleanups.push(trackProgress($('.hero', root), (p) => {
          ring.style.transform = `rotate(${p * 90}deg)`;
        }));
      }

      return () => cleanups.forEach((fn) => fn?.());
    }
  };
}
