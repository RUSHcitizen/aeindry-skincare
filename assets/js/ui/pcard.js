/**
 * The product card, as an apothecary specimen rather than an ecommerce tile.
 *
 * A vessel stands on a hairline shelf with a botanical behind it; the label
 * plate sits below the line, the way a specimen card sits under a jar. Shared
 * by the shop grid, search results and the related rails.
 */

import { esc } from '../lib/dom.js';
import { formatPrice, priceOf, photoOf } from '../data/products.js';
import { productArt } from '../lib/art.js';
import { botanical } from '../lib/botanical.js';
import { isWished } from '../core/store.js';

const HEART = '<path d="M12 20s-7-4.4-7-9.5A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5C19 15.6 12 20 12 20Z"/>';

/* Rotating forms and placements stop a grid of these reading as wallpaper. */
const LEAVES = ['sprig', 'fern', 'seedstem', 'branch'];
const SPOTS = [
  'left:1%;top:5%;width:34%;transform:rotate(-11deg)',
  'right:0%;top:9%;width:29%;transform:rotate(15deg) scaleX(-1)',
  'left:-2%;top:20%;width:27%;transform:rotate(-21deg)',
  'right:2%;top:3%;width:33%;transform:rotate(8deg)',
  'left:5%;top:13%;width:25%;transform:rotate(-5deg)',
  'right:-2%;top:17%;width:31%;transform:rotate(20deg) scaleX(-1)'
];

export function productCard(product, { reveal = 'up', index = 0 } = {}) {
  /* A photograph and a generated vessel want opposite stages. The vessel is a
     tall object that needs floor under it and air around it; the photograph is
     already a composed square and wants the frame to get out of its way. */
  const photo = !!photoOf(product);
  const price = priceOf(product);
  const cheapest = Math.min(price, ...(product.variants || []).map((v) => v.price ?? price));
  const more = (product.variants || []).some((v) => (v.price ?? price) !== cheapest);
  const swatches = (product.variants || []).slice(0, 4)
    .map((v) => `<span class="spec__swatch" style="background:${esc(v.swatch)}" title="${esc(v.label)}"></span>`).join('');

  return `
  <article class="spec" data-reveal="${esc(reveal)}"
           style="--tint:${esc(product.art.tint[1])};--tint2:${esc(product.art.tint[0])};--accent-art:${esc(product.art.accent)}">
    <div class="spec__stage${photo ? ' spec__stage--photo' : ''}">
      <span class="spec__halo" aria-hidden="true"></span>
      <span class="spec__leaf" aria-hidden="true" style="${SPOTS[index % SPOTS.length]}">
        ${botanical(LEAVES[index % LEAVES.length], { seed: product.id, mode: 'line', stroke: 2.2 })}
      </span>
      ${productArt(product, { className: 'spec__art' })}
      <span class="spec__shadow" aria-hidden="true"></span>

      ${product.badges?.length ? `<div class="spec__flags">${product.badges.map((b) =>
        `<span class="spec__flag">${esc(b)}</span>`).join('')}</div>` : ''}

      <button class="spec__wish ${isWished(product.id) ? 'is-on' : ''}" type="button"
              data-wish="${esc(product.id)}" aria-pressed="${isWished(product.id)}"
              aria-label="Save ${esc(product.name)}">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${HEART}</svg>
      </button>
    </div>

    <div class="spec__plate">
      <p class="spec__cat">${esc(product.categoryLabel)}</p>
      <h3 class="spec__name"><a href="#/product/${esc(product.id)}">${esc(product.name)}</a></h3>
      <p class="spec__note">${esc(product.tagline)}</p>
      <div class="spec__foot">
        <span class="spec__price">${formatPrice(cheapest)}${more ? '<small>+</small>' : ''}</span>
        ${swatches ? `<span class="spec__swatches" aria-label="${(product.variants || []).length} options">${swatches}</span>` : ''}
      </div>
      <div class="spec__actions">
        <button class="btn btn--ghost btn--sm" type="button" data-quickview="${esc(product.id)}">Quick view</button>
        <button class="btn btn--primary btn--sm" type="button" data-add-to-cart="${esc(product.id)}">Add</button>
      </div>
    </div>
  </article>`;
}

export function productGrid(products, opts = {}) {
  if (!products.length) {
    return `<div class="empty-state" data-reveal="fade">
      <span class="empty-state__mark" aria-hidden="true">${botanical('petals', { seed: 'empty', mode: 'line', stroke: 1.6 })}</span>
      <p class="h3">Nothing matches that combination.</p>
      <p class="body-sm">Try clearing a filter &mdash; or let the ritual builder choose for you.</p>
      <a class="btn btn--ghost btn--sm" href="#/ritual">Build a ritual</a>
    </div>`;
  }
  return `<div class="spec-grid" data-stagger style="--stagger-step:70ms">
    ${products.map((p, i) => productCard(p, { ...opts, index: i, reveal: i % 2 ? 'up' : 'scale' })).join('')}
  </div>`;
}
