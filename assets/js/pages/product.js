/** Product detail — variants, ingredient links, accordions, related rail. */

import { $, $$, esc, prefersReducedMotion } from '../lib/dom.js';
import { getProduct, PRODUCTS, formatPrice, priceOf, photoOf, galleryOf,
         photoWidthsOf, photoShape } from '../data/products.js';
import { INGREDIENT_MAP, BRAND } from '../data/content.js';
import { productArt, photoTag, botanical as icon } from '../lib/art.js';
import { asset } from '../lib/asset.js';
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

  /* Every image this product has, heroes first. A rail of one is worse than
     none, so it only appears when there are at least two. */
  const gallery = galleryOf(p);
  const shots = (p.variants || []).filter((v) => v.photo);

  /* Open on a scent that has artwork of its own where one exists. The list
     order is the owner's, and it can start with scents whose labels have not
     been photographed yet — landing on a generated jar with real labels sitting
     in the rail below it undersells the product. */
  const initialVariant =
    (query.variant && p.variants?.find((v) => v.id === query.variant)?.id) ||
    shots[0]?.id || p.variants?.[0]?.id || null;

  /* Where a product has a group shot, that is what the page opens on: it is the
     picture of the product — the whole range in one frame — and it belongs to
     every scent rather than to one. A scent is still chosen underneath it,
     because the basket needs one. A link that names a variant is honoured
     instead: someone arriving at ?variant=zen-zest asked to see Zen Zest. */
  const initialShown = (!query.variant && p.heroPhotos?.length) ? p.heroPhotos[0] : null;
  const labelFor = (photo) => gallery.find((g) => g.photo === photo)?.label || p.name;
  const stagePhoto = (photo) => photoTag(photo, {
    widths: photoWidthsOf(p), sizes: '(max-width: 760px) 80vw, 460px',
    loading: 'eager', alt: labelFor(photo)
  });

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
              <div class="pdp__art" data-art-host>${initialShown
                ? stagePhoto(initialShown)
                : productArt(p, { variantId: initialVariant, sizes: '(max-width: 760px) 80vw, 460px' })}</div>
              <span class="pdp__plinth" aria-hidden="true"></span>
            </div>

            ${gallery.length > 1 ? `
            <!-- Heroes first — a group shot belongs to the product, not to one
                 scent, so it stays in the rail whichever scent is chosen and
                 selecting it leaves that choice alone. A variant's own
                 thumbnail does select it: on this range a variant *is* a
                 different label, so browsing images without selecting would let
                 someone study one scent and add another to the basket. -->
            <div class="pdp__thumbs" role="group" aria-label="${esc(p.name)} images" data-thumbs>
              ${gallery.map((g, i) => {
                const on = initialShown ? g.photo === initialShown
                                        : g.variantId === initialVariant;
                const box = photoShape(g.photo, 480);
                return `
                <button class="pdp__thumb ${on ? 'is-on' : ''}${g.variantId ? '' : ' pdp__thumb--hero'}"
                        type="button" data-thumb="${esc(g.variantId || '')}"
                        data-photo="${esc(g.photo)}"
                        aria-pressed="${on}"
                        title="${esc(g.label)}">
                  <!-- Through asset(): the bundled page has no assets
                       directory beside it, and a hand-built path leaves a rail
                       of thirteen blank boxes that only shows up once it is
                       published. -->
                  <img src="${esc(asset(`assets/img/products/${g.photo}-480.webp`))}"
                       alt="${esc(g.label)}" width="${box.width}" height="${box.height}"
                       loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async">
                  <span class="visually-hidden">${esc(g.label)}</span>
                </button>`; }).join('')}
            </div>` : ''}
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
                <!-- "options", not "scents": several products vary by size or
                     by packaging, and the shaving soap varies by both. -->
                <span class="pdp__meta-dot" aria-hidden="true"></span>
                <span class="body-sm">${p.variants.length} options</span>` : ''}
            </div>

            <p class="pdp__price" data-price data-reveal="up">
              ${formatPrice(priceOf(p, initialVariant))} <small>· ${esc(p.weight)}</small>
            </p>

            <p class="body-lg pdp__desc" data-reveal="up">${esc(p.description)}</p>

            ${p.variants?.length ? `
            <fieldset class="variants" data-reveal="up">
              <legend class="field__label">Choose your ${p.category === 'aroma' ? 'blend' : 'option'} — ${p.variants.length} available</legend>
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

      /* A hero image being shown instead of the selected scent's own. Cleared
         the moment a scent is chosen, from the rail or the option list. */
      let shownPhoto = initialShown;

      function repaint() {
        const v = p.variants?.find((x) => x.id === variantId) || null;
        const unit = priceOf(p, variantId);

        if (shownPhoto) {
          artHost.innerHTML = stagePhoto(shownPhoto);
        } else {
          // Re-render the artwork so the accent tracks the chosen scent.
          artHost.innerHTML = productArt(p, {
            variantId, sizes: '(max-width: 760px) 80vw, 460px'
          });
        }
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
        /* The rail and the option list are two ways into the same choice, so
           both reflect it however it was made. */
        let marked = null;
        $$('[data-thumb]', root).forEach((b) => {
          const on = shownPhoto
            ? b.dataset.photo === shownPhoto
            : Boolean(b.dataset.thumb) && b.dataset.thumb === variantId;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', String(on));
          if (on) marked = b;
        });
        /* The rail scrolls rather than wraps, so on a range this long the marked
           thumbnail can sit off the end of it — choose Zen Zest from the option
           list and the rail goes on showing Twilight Orchard with nothing
           highlighted. Bring it into view, but only ever by scrolling the rail:
           `scrollIntoView` would walk every scrollable ancestor and drag the
           whole page down to the media column on a phone. And only when it is
           actually out of view, so choosing the scent beside the current one
           does not slide the row under the pointer. */
        const rail = $('[data-thumbs]', root);
        if (marked && rail) {
          const m = marked.getBoundingClientRect();
          const r = rail.getBoundingClientRect();
          if (m.left < r.left || m.right > r.right) {
            rail.scrollTo({
              left: rail.scrollLeft + (m.left - r.left) - (r.width - m.width) / 2,
              behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });
          }
        }

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
        btn.addEventListener('click', () => {
          shownPhoto = null;
          variantId = btn.dataset.variantId;
          repaint();
        });
      });

      $$('[data-thumb]', root).forEach((btn) => {
        btn.addEventListener('click', () => {
          if (btn.dataset.thumb) {
            /* A variant's own image: choosing the picture chooses the scent. */
            shownPhoto = null;
            variantId = btn.dataset.thumb;
          } else {
            /* A hero: show it, leave the scent alone. */
            shownPhoto = btn.dataset.photo;
          }
          repaint();
        });
      });

      /* Left and right walk the rail, which is what a keyboard expects of a
         row of pictures and what a mouse-only gallery quietly denies. */
      $('[data-thumbs]', root)?.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        const list = $$('[data-thumb]', root);
        const i = list.findIndex((b) => b.dataset.thumb === variantId);
        const next = list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length];
        if (!next) return;
        e.preventDefault();
        if (next.dataset.thumb) { shownPhoto = null; variantId = next.dataset.thumb; }
        else { shownPhoto = next.dataset.photo; }
        repaint();
        next.focus();
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
