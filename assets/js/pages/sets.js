/**
 * Sets — several products bought together for one reason.
 *
 * The ritual builder already answers "what should I use?" at length, with a
 * questionnaire and an explanation per step. This is the short version: pick
 * the sentence that sounds like you, see three things, buy them in one press.
 *
 * Nothing here is a second catalogue. A set is a list of ids and a saving; the
 * name, price, photo and variant of every line are read from the products at
 * render time, so a set can never quietly drift from what is actually sold, and
 * `tools/check-catalogue.mjs` fails the build if one names something that has
 * left the range.
 */

import { $, $$, esc } from '../lib/dom.js';
import { SETS, setPricing, getProduct, priceOf, formatPrice } from '../data/products.js';
import { CONCERNS } from '../data/content.js';
import { productArt } from '../lib/art.js';
import { pageField, initBotField } from '../ui/bot-field.js';
import { addToCart } from '../core/store.js';
import { toast } from '../ui/toast.js';

const concernLabel = (id) => CONCERNS.find((c) => c.id === id)?.label || '';

function setCard(set) {
  const { full, price, saving } = setPricing(set);
  const lines = set.lines.map((l) => {
    const p = getProduct(l.productId);
    const v = l.variantId && p?.variants?.find((x) => x.id === l.variantId);
    return { p, v, unit: priceOf(p, l.variantId) };
  }).filter((l) => l.p);

  return `
  <article class="set" data-set="${esc(set.id)}" data-reveal="up">
    <div class="set__head">
      <p class="set__for">${esc(concernLabel(set.concern) || 'For everyone')}</p>
      <h2 class="set__name">${esc(set.name)}</h2>
      <p class="set__tagline">${esc(set.tagline)}</p>
      <p class="set__blurb">${esc(set.blurb)}</p>
    </div>

    <ul class="set__items">
      ${lines.map(({ p, v, unit }) => `
        <li class="set__item">
          <a class="set__media" href="#/product/${esc(p.id)}" aria-label="${esc(p.name)}">
            ${productArt(p, { variantId: v?.id, className: 'set__art' })}
          </a>
          <div>
            <p class="set__item-name"><a href="#/product/${esc(p.id)}">${esc(p.name)}</a></p>
            ${v ? `<p class="set__item-variant">${esc(v.label)}</p>` : ''}
          </div>
          <p class="set__item-price">${formatPrice(unit)}</p>
        </li>`).join('')}
    </ul>

    <div class="set__foot">
      <p class="set__price">
        <span class="set__price-now">${formatPrice(price)}</span>
        <span class="set__price-was">${formatPrice(full)}</span>
        <span class="set__save">Save ${formatPrice(saving)}</span>
      </p>
      <button class="btn btn--primary" type="button" data-add-set="${esc(set.id)}">
        <span class="btn__label">Add all ${lines.length} to basket</span>
      </button>
    </div>
  </article>`;
}

export default function sets() {
  return {
    title: 'Sets',
    html: `
    <header class="page-head">
      ${pageField('sets')}
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Home</a><span aria-hidden="true">·</span>
          <a href="#/shop">Shop</a><span aria-hidden="true">·</span>
          <span aria-current="page">Sets</span>
        </nav>
        <h1 class="display-lg" data-split="lines">Put together</h1>
        <p class="lede" data-reveal="up" style="--reveal-delay:180ms">
          Four small collections, each built around one thing people actually
          write to us about. Cheaper together than apart, and you can still buy
          any of it on its own.
        </p>
      </div>
    </header>

    <section class="section section--flush-top">
      <div class="wrap">
        <div class="sets">${SETS.map(setCard).join('')}</div>

        <div class="sets__more" data-reveal="up">
          <p>Not sure which one? The ritual builder asks four questions and
            explains what it picks and why.</p>
          <a class="btn btn--ghost" href="#/ritual"><span class="btn__label">Build a ritual</span></a>
        </div>
      </div>
    </section>`,

    mount(root) {
      initBotField(root);

      root.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-add-set]');
        if (!btn) return;
        const set = SETS.find((s) => s.id === btn.dataset.addSet);
        if (!set) return;

        btn.disabled = true;
        const label = $('.btn__label', btn);
        const was = label.textContent;
        label.textContent = 'Adding…';
        try {
          /* One at a time, in order. The commerce layer reconciles each write
             against the server, and firing them together lets the responses
             land out of order and the last one overwrite the basket. */
          for (const line of set.lines) {
            await addToCart(line.productId, line.variantId || null, 1);
          }
          toast(`${set.name} added — ${set.lines.length} items`);
        } catch (err) {
          toast(err?.message || 'We could not add that set just now.');
        } finally {
          btn.disabled = false;
          label.textContent = was;
        }
      });
    }
  };
}
