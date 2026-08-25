/** Shop — live filtering, sorting and search across the whole range. */

import { $, $$, esc, debounce } from '../lib/dom.js';
import { PRODUCTS, CATEGORIES, priceOf } from '../data/products.js';
import { productGrid } from '../ui/pcard.js';
import { pageField, initBotField } from '../ui/bot-field.js';
import { initTilt } from '../ui/tilt.js';
import { initReveal } from '../core/reveal.js';
import { syncHash } from '../core/router.js';
import { SCENT_PROFILES } from '../data/content.js';

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Best rated' },
  { id: 'name', label: 'A–Z' }
];

const SCENTS = Object.entries(SCENT_PROFILES).map(([id, p]) => ({ id, label: p.label.split(' & ')[0], color: p.color }));

export default function shop({ query }) {
  const state = {
    category: query.category && CATEGORIES.some((c) => c.id === query.category) ? query.category : 'all',
    scent: query.scent || null,
    sort: query.sort || 'featured',
    search: query.q || ''
  };

  const countFor = (catId) =>
    catId === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === catId).length;

  return {
    title: 'Shop',
    html: `
    <header class="page-head">
      ${pageField('shop')}
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Home</a><span aria-hidden="true">·</span><span aria-current="page">Shop</span>
        </nav>
        <h1 class="display-lg" data-split="lines">The whole range</h1>
        <p class="lede" data-reveal="up" style="--reveal-delay:200ms">
          Twelve formulas, each made in small batches by hand. Filter by what you need,
          or by how you would like it to smell.
        </p>
      </div>
    </header>

    <section class="section section--flush-top">
      <div class="wrap">
        <div class="filters" data-reveal="up">
          <div class="filters__row">
            <div class="filters__group" role="group" aria-label="Filter by category">
              ${CATEGORIES.map((c) => `
                <button class="chip" type="button" data-cat="${esc(c.id)}"
                        aria-pressed="${c.id === state.category}">
                  ${esc(c.label)}<span class="chip__count">${countFor(c.id)}</span>
                </button>`).join('')}
            </div>

            <div class="filters__tools">
              <div class="searchbox">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
                </svg>
                <label class="visually-hidden" for="shop-search">Search products</label>
                <input id="shop-search" class="searchbox__input" type="search" placeholder="Search ingredients, scents, products…"
                       value="${esc(state.search)}" autocomplete="off">
                <button class="searchbox__clear" type="button" aria-label="Clear search" hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <label class="visually-hidden" for="shop-sort">Sort by</label>
              <select id="shop-sort" class="select select--sort">
                ${SORTS.map((s) => `<option value="${esc(s.id)}" ${s.id === state.sort ? 'selected' : ''}>${esc(s.label)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="filters__row filters__row--scents">
            <span class="filters__label">Scent</span>
            <div class="filters__group" role="group" aria-label="Filter by scent family">
              ${SCENTS.map((s) => `
                <button class="chip chip--scent" type="button" data-scent="${esc(s.id)}"
                        aria-pressed="${s.id === state.scent}" style="--sc:${esc(s.color)}">
                  <span class="chip__dot"></span>${esc(s.label)}
                </button>`).join('')}
            </div>
            <button class="btn-text filters__reset" type="button" data-reset hidden>Clear all</button>
          </div>
        </div>

        <p class="results-count body-sm" aria-live="polite" data-count-label></p>

        <div data-grid-host>${productGrid(apply(PRODUCTS, state))}</div>
      </div>
    </section>

    <section class="section section--tight band--forest help-band">
      <div class="wrap wrap--narrow text-center stack-m">
        <p class="eyebrow eyebrow--bare mx-auto" data-reveal="fade">Still deciding?</p>
        <h2 class="h3" data-reveal="up">Four questions and we will build the routine for you.</h2>
        <div class="cluster" style="justify-content:center" data-reveal="up">
          <a class="btn btn--light" href="#/ritual" data-magnetic="0.18"><span class="btn__label">Build a ritual</span></a>
          <a class="btn btn--ghost" href="#/ritual?tab=scent"><span class="btn__label">Find your scent</span></a>
        </div>
      </div>
    </section>`,

    mount(root) {
      const host = $('[data-grid-host]', root);
      const countLabel = $('[data-count-label]', root);
      const searchInput = $('#shop-search', root);
      const clearBtn = $('.searchbox__clear', root);
      const resetBtn = $('[data-reset]', root);

      function syncUrl() {
        const params = new URLSearchParams();
        if (state.category !== 'all') params.set('category', state.category);
        if (state.scent) params.set('scent', state.scent);
        if (state.sort !== 'featured') params.set('sort', state.sort);
        if (state.search) params.set('q', state.search);
        const qs = params.toString();
        // Keeps the filter state shareable without a history entry per keystroke,
        // and without re-triggering the router.
        syncHash(`#/shop${qs ? `?${qs}` : ''}`);
      }

      function paint() {
        const list = apply(PRODUCTS, state);
        host.style.opacity = '0';
        host.style.transform = 'translateY(10px)';
        setTimeout(() => {
          host.innerHTML = productGrid(list);
          host.style.transition = 'opacity 420ms var(--ease-out-expo), transform 420ms var(--ease-out-expo)';
          host.style.opacity = '1';
          host.style.transform = 'none';
          initReveal(host);
          initTilt(host);
        }, 160);

        countLabel.textContent = list.length === PRODUCTS.length
          ? `Showing all ${list.length} products`
          : `${list.length} of ${PRODUCTS.length} products`;

        const dirty = state.category !== 'all' || state.scent || state.search || state.sort !== 'featured';
        resetBtn.hidden = !dirty;
        clearBtn.hidden = !state.search;

        $$('[data-cat]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === state.category)));
        $$('[data-scent]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scent === state.scent)));
        syncUrl();
      }

      $$('[data-cat]', root).forEach((btn) => btn.addEventListener('click', () => {
        state.category = btn.dataset.cat;
        paint();
      }));

      $$('[data-scent]', root).forEach((btn) => btn.addEventListener('click', () => {
        // Second click on an active scent clears it.
        state.scent = state.scent === btn.dataset.scent ? null : btn.dataset.scent;
        paint();
      }));

      $('#shop-sort', root).addEventListener('change', (e) => {
        state.sort = e.target.value;
        paint();
      });

      searchInput.addEventListener('input', debounce((e) => {
        state.search = e.target.value.trim();
        paint();
      }, 220));

      clearBtn.addEventListener('click', () => {
        state.search = '';
        searchInput.value = '';
        paint();
        searchInput.focus();
      });

      resetBtn.addEventListener('click', () => {
        Object.assign(state, { category: 'all', scent: null, sort: 'featured', search: '' });
        searchInput.value = '';
        paint();
      });

      // Links like #/shop?category=face clicked from within /shop are a
      // query-only change; the router does not re-render, so re-apply here.
      const onQuery = (e) => {
        const q = e.detail?.query || {};
        state.category = q.category && CATEGORIES.some((c) => c.id === q.category) ? q.category : 'all';
        state.scent = q.scent || null;
        state.sort = q.sort || 'featured';
        state.search = q.q || '';
        searchInput.value = state.search;
        $('#shop-sort', root).value = state.sort;
        paint();
      };
      window.addEventListener('route:query', onQuery);

      initTilt(root);
      const stopField = initBotField(root);
      paint();
      return () => { window.removeEventListener('route:query', onQuery); stopField?.(); };
    }
  };
}

/** Filter + sort pipeline. */
function apply(list, state) {
  let out = list.slice();

  if (state.category !== 'all') out = out.filter((p) => p.category === state.category);
  if (state.scent) out = out.filter((p) => p.scentFamily?.includes(state.scent));

  if (state.search) {
    const q = state.search.toLowerCase();
    out = out.filter((p) =>
      [p.name, p.tagline, p.blurb, p.description, p.ingredients, p.categoryLabel,
       ...(p.variants || []).map((v) => `${v.label} ${v.note}`),
       ...(p.benefits || [])]
        .join(' ').toLowerCase().includes(q));
  }

  const price = (p) => Math.min(priceOf(p), ...(p.variants || []).map((v) => v.price ?? p.price));
  switch (state.sort) {
    case 'price-asc':  out.sort((a, b) => price(a) - price(b)); break;
    case 'price-desc': out.sort((a, b) => price(b) - price(a)); break;
    case 'rating':     out.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews); break;
    case 'name':       out.sort((a, b) => a.name.localeCompare(b.name)); break;
    default:           out.sort((a, b) => (b.badges?.length || 0) - (a.badges?.length || 0) || b.reviews - a.reviews);
  }
  return out;
}
