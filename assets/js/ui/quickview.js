/**
 * Quick-view modal — the product essentials without leaving the grid.
 * Opens from any [data-quickview="<id>"] click, anywhere on the site.
 */

import { $, esc, lockScroll, unlockScroll, trapFocus } from '../lib/dom.js';
import { getProduct, formatPrice, priceOf } from '../data/products.js';
import { productArt } from '../lib/art.js';

let scrim, modal, releaseTrap, lastFocused;
let state = { productId: null, variantId: null };

export function initQuickview() {
  scrim = $('.modal-scrim');
  modal = $('.modal');
  if (!scrim) return;

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest?.('[data-quickview]');
    if (trigger) {
      e.preventDefault();
      open(trigger.dataset.quickview);
      return;
    }
    if (e.target === scrim) close();
    if (e.target.closest?.('.modal__close')) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && scrim.classList.contains('is-open')) close();
  });
}

function open(productId) {
  const product = getProduct(productId);
  if (!product) return;
  lastFocused = document.activeElement;
  state = { productId, variantId: product.variants?.[0]?.id || null };
  paint();
  scrim.classList.add('is-open');
  scrim.setAttribute('aria-hidden', 'false');
  lockScroll();
  releaseTrap = trapFocus(modal);
  setTimeout(() => $('.modal__close', modal)?.focus(), 80);
}

function close() {
  scrim.classList.remove('is-open');
  scrim.setAttribute('aria-hidden', 'true');
  unlockScroll();
  releaseTrap?.();
  lastFocused?.focus?.();
}

function paint() {
  const product = getProduct(state.productId);
  if (!product) return;
  const [t1, t2] = product.art.tint;
  const variant = product.variants?.find((v) => v.id === state.variantId) || null;
  const price = priceOf(product, state.variantId);

  modal.style.setProperty('--card-tint', t2);
  modal.style.setProperty('--card-tint-2', t1);

  modal.innerHTML = `
    <button class="icon-btn modal__close" type="button" aria-label="Close quick view">
      <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <div class="modal__media">${productArt(product, { variantId: state.variantId })}</div>
    <div class="modal__body" data-native-scroll>
      <p class="eyebrow">${esc(product.categoryLabel)}</p>
      <h2 class="h3">${esc(product.name)}</h2>
      <p class="body-sm">${esc(product.blurb)}</p>
      <p class="pdp__price">${formatPrice(price)} <small>· ${esc(product.weight)}</small></p>

      ${product.variants?.length ? `
      <fieldset class="variants">
        <legend class="field__label">${product.variants.length} options</legend>
        <div class="variants__list">
          ${product.variants.map((v) => `
            <button type="button" class="variant ${v.id === state.variantId ? 'is-on' : ''}"
                    data-qv-variant="${esc(v.id)}" aria-pressed="${v.id === state.variantId}">
              <span class="variant__dot" style="background:${esc(v.swatch)}"></span>
              <span class="variant__text">
                <span class="variant__label">${esc(v.label)}</span>
                <span class="variant__note">${esc(v.note)}</span>
              </span>
              ${typeof v.price === 'number' && v.price !== product.price ? `<span class="variant__price">${formatPrice(v.price)}</span>` : ''}
            </button>`).join('')}
        </div>
      </fieldset>` : ''}

      ${variant?.restricted ? `<p class="notice"><strong>Note.</strong> This variant ships within ${esc(variant.restricted)} only.</p>` : ''}

      <ul class="ticks" role="list">
        ${product.benefits.slice(0, 3).map((b) => `<li>${esc(b)}</li>`).join('')}
      </ul>

      <div class="cluster" style="--gap:.6rem;margin-top:auto;padding-top:var(--space-s)">
        <button class="btn btn--primary" type="button"
                data-add-to-cart="${esc(product.id)}" data-variant="${esc(state.variantId || '')}">
          <span class="btn__label">Add to basket · ${formatPrice(price)}</span>
        </button>
        <a class="btn btn--ghost" href="#/product/${esc(product.id)}" data-qv-close>Full details</a>
      </div>
    </div>`;

  modal.querySelectorAll('[data-qv-variant]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.variantId = btn.dataset.qvVariant;
      paint();
    });
  });
  modal.querySelector('[data-qv-close]')?.addEventListener('click', close);
}
