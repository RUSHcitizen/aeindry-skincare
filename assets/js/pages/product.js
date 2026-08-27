/** Product detail — variants, ingredient links, accordions, related rail. */

import { $, $$, esc } from '../lib/dom.js';
import { getProduct, PRODUCTS, formatPrice, priceOf } from '../data/products.js';
import { INGREDIENT_MAP, BRAND } from '../data/content.js';
import { productArt, botanical as icon } from '../lib/art.js';
import { botanical } from '../lib/botanical.js';
import { botField, pageField, initBotField } from '../ui/bot-field.js';
import { productCard } from '../ui/pcard.js';
import { initAccordion } from '../ui/accordion.js';
import { initTilt } from '../ui/tilt.js';
import { toggleWish, isWished } from '../core/store.js';
import { toast } from '../ui/toast.js';
import notFound from './not-found.js';


export default function product({ params, query }) {
  const p = getProduct(params.id);
  if (!p) return notFound();

  const initialVariant =
    (query.variant && p.variants?.find((v) => v.id === query.variant)?.id) ||
    p.variants?.[0]?.id || null;

  const related = PRODUCTS
    .filter((x) => x.id !== p.id)
    .map((x) => ({
      x,
      score: (x.category === p.category ? 2 : 0) +
             x.concerns.filter((c) => p.concerns.includes(c)).length +
             x.keyIngredients.filter((k) => p.keyIngredients.includes(k)).length * 0.5
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((r) => r.x);

  const keyIngs = p.keyIngredients.map((id) => INGREDIENT_MAP.get(id)).filter(Boolean);
  const [t1, t2] = p.art.tint;

  return {
    title: p.name,
    html: `
    <article class="pdp" style="--card-tint:${esc(t2)};--card-tint-2:${esc(t1)};--card-accent:${esc(p.art.accent)}">
      ${pageField(p.id)}
      <div class="wrap wrap--wide">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Home</a><span aria-hidden="true">·</span>
          <a href="#/shop?category=${esc(p.category)}">${esc(p.categoryLabel)}</a><span aria-hidden="true">·</span>
          <span aria-current="page">${esc(p.name)}</span>
        </nav>

        <div class="pdp__grid">
          <!-- media column -->
          <div class="pdp__media">
            <div class="pdp__stage" data-reveal="scale">
              <span class="pdp__crown" aria-hidden="true">${botanical('arc', { seed: `${p.id}-crown`, mode: 'line', stroke: 1.5 })}</span>
              <span class="pdp__halo" aria-hidden="true"></span>
              <div class="pdp__art" data-art-host>${productArt(p, { variantId: initialVariant })}</div>
              <span class="pdp__plinth" aria-hidden="true"></span>
            </div>
            <ul class="pdp__marks" role="list" data-stagger style="--stagger-step:70ms">
              <li data-reveal="up">${icon('leaf')}<span>100% natural</span></li>
              <li data-reveal="up">${icon('flask')}<span>Small batch</span></li>
              <li data-reveal="up">${icon('shield')}<span>No harsh chemicals</span></li>
              <li data-reveal="up">${icon('hand')}<span>Made in Washington</span></li>
            </ul>
          </div>

          <!-- buy column -->
          <div class="pdp__info">
            <p class="eyebrow" data-reveal="fade">${esc(p.categoryLabel)}</p>
            <h1 class="pdp__title" data-split="lines">${esc(p.name)}</h1>
            <p class="pdp__tagline body-lg" data-reveal="up">${esc(p.tagline)}</p>

            <!-- Where a star rating would go on most shops. There are no
                 reviews yet, and a row of five filled stars nobody left is the
                 easiest lie an interface can tell — so this says what is
                 actually known about the product instead. -->
            <div class="pdp__meta cluster" data-reveal="fade">
              <span class="pdp__brand">${esc(p.brand)}</span>
              <span class="pdp__meta-dot" aria-hidden="true"></span>
              <span class="body-sm">${esc(p.weight)}</span>
              ${p.variants?.length ? `
                <span class="pdp__meta-dot" aria-hidden="true"></span>
                <span class="body-sm">${p.variants.length} scents</span>` : ''}
            </div>

            <p class="pdp__price" data-price data-reveal="up">
              ${formatPrice(priceOf(p, initialVariant))} <small>· ${esc(p.weight)}</small>
            </p>

            <p class="body-lg pdp__desc" data-reveal="up">${esc(p.description)}</p>

            ${p.variants?.length ? `
            <fieldset class="variants" data-reveal="up">
              <legend class="field__label">Choose your ${p.category === 'aroma' || p.category === 'home' ? 'blend' : 'option'} — ${p.variants.length} available</legend>
              <div class="variants__list" data-variants>
                ${p.variants.map((v) => `
                  <button type="button" class="variant ${v.id === initialVariant ? 'is-on' : ''}"
                          data-variant-id="${esc(v.id)}" aria-pressed="${v.id === initialVariant}">
                    <span class="variant__dot" style="background:${esc(v.swatch)}"></span>
                    <span class="variant__text">
                      <span class="variant__label">${esc(v.label)}</span>
                      <span class="variant__note">${esc(v.note)}</span>
                    </span>
                    ${typeof v.price === 'number' && v.price !== p.price
                      ? `<span class="variant__price">${formatPrice(v.price)}</span>` : ''}
                  </button>`).join('')}
              </div>
            </fieldset>` : ''}

            <div class="pdp__notice" data-notice hidden></div>

            <div class="pdp__buy" data-reveal="up">
              <div class="qty" role="group" aria-label="Quantity">
                <button type="button" data-q="-1" aria-label="Decrease quantity">−</button>
                <span class="qty__value" data-qty aria-live="polite">1</span>
                <button type="button" data-q="1" aria-label="Increase quantity">+</button>
              </div>
              <button class="btn btn--primary btn--lg btn--block" type="button"
                      data-add-to-cart="${esc(p.id)}" data-variant="${esc(initialVariant || '')}"
                      data-qty="1" data-open-cart="true" data-magnetic="0.14">
                <span class="btn__label" data-add-label>Add to basket</span>
              </button>
              <button class="icon-btn pdp__wish ${isWished(p.id) ? 'is-on' : ''}" type="button"
                      data-wish-toggle aria-pressed="${isWished(p.id)}" aria-label="Save ${esc(p.name)}">
                <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-9.5A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5C19 15.6 12 20 12 20Z"/></svg>
              </button>
            </div>

            <ul class="ticks ticks--split" role="list" data-reveal="up">
              ${p.benefits.map((b) => `<li>${esc(b)}</li>`).join('')}
            </ul>

            <div class="acc" data-acc-single="false" data-reveal="up">
              <div class="acc__item">
                <button class="acc__btn" type="button" aria-expanded="true">
                  Full ingredients<span class="acc__icon" aria-hidden="true"></span>
                </button>
                <div class="acc__panel is-open"><div><div class="acc__inner">
                  <p>${esc(p.ingredients)}</p>
                  ${keyIngs.length ? `
                  <ul class="ing-links" role="list">
                    ${keyIngs.map((i) => `
                      <li><a href="#/ingredients?focus=${esc(i.id)}" class="ing-link" style="--ing:${esc(i.color)}">
                        <span class="ing-link__dot"></span>${esc(i.name)}
                      </a></li>`).join('')}
                  </ul>` : ''}
                </div></div></div>
              </div>
              <div class="acc__item">
                <button class="acc__btn" type="button" aria-expanded="false">
                  How to use<span class="acc__icon" aria-hidden="true"></span>
                </button>
                <div class="acc__panel"><div><div class="acc__inner"><p>${esc(p.howToUse)}</p></div></div></div>
              </div>
              <div class="acc__item">
                <button class="acc__btn" type="button" aria-expanded="false">
                  Shipping &amp; care<span class="acc__icon" aria-hidden="true"></span>
                </button>
                <div class="acc__panel"><div><div class="acc__inner">
                  <p>Made to order in small batches and posted from Sammamish, Washington within
                  two to three working days. Free shipping over $60.</p>
                  <p>Keep out of direct sun and off a steamy shower shelf. Anhydrous formulas keep
                  12–18 months; soap only improves with age.</p>
                  ${p.note ? `<p><strong>${esc(p.note)}</strong></p>` : ''}
                  <p>Anything wrong with an order — email
                  <a class="link-underline" href="mailto:${esc(BRAND.email)}">${esc(BRAND.email)}</a>.</p>
                </div></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>

    <section class="section related">
      <div class="wrap">
        <header class="sec-head">
          <div>
            <p class="eyebrow" data-reveal="fade">Works well with</p>
            <h2 class="h3" data-reveal="up">Build it into a routine</h2>
          </div>
        </header>
        <div class="spec-grid" data-stagger style="--stagger-step:70ms">
          ${related.map((r, i) => productCard(r, { index: i })).join('')}
        </div>
      </div>
    </section>`,

    mount(root) {
      let variantId = initialVariant;
      let qty = 1;

      const artHost = $('[data-art-host]', root);
      const priceEl = $('[data-price]', root);
      const addBtn = $('[data-add-to-cart]', root);
      const addLabel = $('[data-add-label]', root);
      const qtyEl = $('[data-qty]', root);
      const notice = $('[data-notice]', root);
      const pdp = $('.pdp', root);

      function repaint() {
        const v = p.variants?.find((x) => x.id === variantId) || null;
        const unit = priceOf(p, variantId);

        // Re-render the artwork so the accent tracks the chosen scent.
        artHost.innerHTML = productArt(p, { variantId });
        artHost.animate(
          [{ opacity: 0, transform: 'scale(.94) rotate(-3deg)' }, { opacity: 1, transform: 'none' }],
          { duration: 520, easing: 'cubic-bezier(0.16,1,0.3,1)' }
        );
        if (v?.swatch) pdp.style.setProperty('--card-accent', v.swatch);

        priceEl.innerHTML = `${formatPrice(unit)} <small>· ${esc(p.weight)}</small>`;
        addLabel.textContent = `Add to basket · ${formatPrice(unit * qty)}`;
        addBtn.dataset.variant = variantId || '';
        addBtn.dataset.qty = String(qty);
        qtyEl.textContent = String(qty);

        $$('[data-variant-id]', root).forEach((b) => {
          const on = b.dataset.variantId === variantId;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', String(on));
        });

        /* No variant in the range is restricted today. The branch stays because
           a restricted one is a data change, not a code change. */
        if (v?.restricted) {
          notice.hidden = false;
          notice.innerHTML = `<strong>Ships to ${esc(v.restricted)} only.</strong>
            ${esc(v.restrictedWhy || 'This variant is not available outside that area.')}`;
        } else {
          notice.hidden = true;
        }
      }

      $$('[data-variant-id]', root).forEach((btn) => {
        btn.addEventListener('click', () => { variantId = btn.dataset.variantId; repaint(); });
      });

      $$('[data-q]', root).forEach((btn) => {
        btn.addEventListener('click', () => {
          qty = Math.max(1, Math.min(20, qty + parseInt(btn.dataset.q, 10)));
          repaint();
        });
      });

      $('[data-wish-toggle]', root)?.addEventListener('click', (e) => {
        const on = toggleWish(p.id);
        e.currentTarget.classList.toggle('is-on', on);
        e.currentTarget.setAttribute('aria-pressed', String(on));
        toast(on ? `${p.name} saved` : `${p.name} removed from saved`, { icon: 'heart' });
      });

      initAccordion(root);
      initTilt(root);
      const stopField = initBotField(root);
      repaint();
      return () => stopField?.();
    }
  };
}
