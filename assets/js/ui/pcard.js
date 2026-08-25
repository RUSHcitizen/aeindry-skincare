/** The product card, shared by the home grid, shop, search and related rails. */

import { esc } from '../lib/dom.js';
import { formatPrice, priceOf } from '../data/products.js';
import { productArt } from '../lib/art.js';
import { isWished } from '../core/store.js';

const HEART = '<path d="M12 20s-7-4.4-7-9.5A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5C19 15.6 12 20 12 20Z"/>';

export function productCard(product, { reveal = 'up', eager = false } = {}) {
  const [t1, t2] = product.art.tint;
  const price = priceOf(product);
  const cheapest = Math.min(price, ...(product.variants || []).map((v) => v.price ?? price));
  const swatches = (product.variants || []).slice(0, 4)
    .map((v) => `<span class="pcard__swatch" style="background:${esc(v.swatch)}" title="${esc(v.label)}"></span>`).join('');

  return `
  <article class="pcard" data-tilt="6" data-reveal="${esc(reveal)}"
           style="--card-tint:${esc(t2)};--card-tint-2:${esc(t1)};--card-accent:${esc(product.art.accent)}">
    <div class="pcard__media">
      <span class="pcard__halo" aria-hidden="true"></span>
      ${productArt(product, { className: 'pcard__art' })}
      ${product.badges?.length ? `<div class="pcard__flags">${product.badges.map((b) =>
        `<span class="pill ${b === 'Bestseller' ? 'pill--clay' : ''}"><span class="pill__dot"></span>${esc(b)}</span>`).join('')}</div>` : ''}
      <button class="pcard__wish ${isWished(product.id) ? 'is-on' : ''}" type="button"
              data-wish="${esc(product.id)}" aria-pressed="${isWished(product.id)}"
              aria-label="Save ${esc(product.name)}">
        <svg viewBox="0 0 24 24" aria-hidden="true">${HEART}</svg>
      </button>
      <div class="pcard__quick">
        <button class="btn btn--light btn--sm" type="button" data-quickview="${esc(product.id)}">Quick view</button>
        <button class="btn btn--primary btn--sm" type="button" data-add-to-cart="${esc(product.id)}">Add</button>
      </div>
    </div>
    <div class="pcard__body">
      <p class="pcard__cat">${esc(product.categoryLabel)}</p>
      <h3 class="pcard__name"><a href="#/product/${esc(product.id)}">${esc(product.name)}</a></h3>
      <p class="pcard__blurb">${esc(product.tagline)}</p>
      <div class="pcard__foot">
        <p class="pcard__price">${formatPrice(cheapest)}${cheapest !== price || product.variants?.some((v) => (v.price ?? price) !== cheapest) ? ' <small>+</small>' : ''}</p>
        <div class="pcard__scents" aria-label="${(product.variants || []).length} options">${swatches}</div>
      </div>
    </div>
  </article>`;
}

export function productGrid(products, opts = {}) {
  if (!products.length) {
    return `<div class="empty-state" data-reveal="fade">
      <p class="h3">Nothing matches that combination.</p>
      <p class="body-sm">Try clearing a filter — or let the ritual builder choose for you.</p>
      <a class="btn btn--ghost btn--sm" href="#/ritual">Build a ritual</a>
    </div>`;
  }
  return `<div class="pgrid" data-stagger style="--stagger-step:60ms">
    ${products.map((p, i) => productCard(p, { ...opts, reveal: i % 2 ? 'up' : 'tilt' })).join('')}
  </div>`;
}
