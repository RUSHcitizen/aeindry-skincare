/** Shop — live filtering, sorting and search across the whole range. */

import { $, $$, esc, debounce } from '../lib/dom.js';
import { PRODUCTS, CATEGORIES, priceOf, inCategory, filedIn, childCategories,
         topCategories } from '../data/products.js';
import { productGrid } from '../ui/pcard.js';
import { pageField, initBotField } from '../ui/bot-field.js';
import { initTilt } from '../ui/tilt.js';
import { initReveal } from '../core/reveal.js';
import { syncHash } from '../core/router.js';
import { SCENT_PROFILES } from '../data/content.js';

/* No "best rated" here. There are no reviews yet, and a sort that ranks by a
   number nobody left is a lie the interface tells on the shop's behalf. */
const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'name', label: 'A–Z' }
];

/* Every buyable thing: a product with variants is counted once per variant,
   because that is how many distinct items are actually on the shelf. */
const variantCount = () =>
  PRODUCTS.reduce((n, p) => n + Math.max(1, p.variants?.length || 0), 0);

const SCENTS = Object.entries(SCENT_PROFILES).map(([id, p]) => ({ id, label: p.label.split(' & ')[0], color: p.color }));

/* A line under each aisle sign, so a fifty-item shop reads as six shelves
   rather than one endless scroll. */
const AISLE = {
  face: 'Cleansers, serums, oils and masks — the whole routine, in order.',
  body: 'Butters, creams, balms, the body buff and the deodorant — everything below the neck.',
  hair: 'Bars instead of bottles, masks, oils, and the beard shelf.',
  soap: 'Cold process bars, soaks, steamers and the dish that makes them last.',
  // kept alongside `soap` so the sub-shelf reads as part of Body, not a detour
  home: 'Candles poured by hand, reeds, and something for the car.',
  kits: 'Bought together and priced together.'
};

/* How many of an aisle to show before offering the rest. Six is two rows on a
   desktop grid and three on a tablet — enough to see what a shelf is, short of
   the point where the next aisle sign is too far down to bother reaching. */
const PREVIEW = 6;

/**
 * The shelves inside a shelf, as something to press.
 *
 * A count rather than a preview of the products: the tile's job is to say the
 * shelf exists and how big it is, and a row of product cards under a heading
 * that is itself inside a heading reads as a mistake. `list` is the already
 * filtered set, so the number is the number you will actually be shown.
 */
function subShelves(kids, list) {
  return `
  <nav class="subshelves" aria-label="Shelves in this section">
    ${kids.map((k) => {
      const n = list.filter((p) => inCategory(p, k.id)).length;
      return `
      <a class="subshelf" href="#/shop?category=${esc(k.id)}" data-reveal="up">
        <span class="subshelf__name">${esc(k.label)}</span>
        <span class="subshelf__count">${n} ${n === 1 ? 'product' : 'products'}</span>
        <span class="subshelf__go" aria-hidden="true">&#8594;</span>
      </a>`;
    }).join('')}
  </nav>`;
}

/**
 * Unfiltered, the grid is grouped into its categories with a sign above each
 * and the long aisles trimmed to a preview. Filtered, it is one flat grid —
 * a heading over a group of one is noise, and nothing is held back from
 * someone who has already said what they are looking for.
 */
function render(list, state) {
  if (state.category !== 'all' || state.scent || state.search || state.sort !== 'featured') {
    /* Inside a shelf that has shelves of its own, those come first and the
       shelf's own products follow. Face opens on Lips and the ten face
       products, not on fifteen things in a heap.

       Only when nothing else is narrowing the view. Someone who has typed a
       search or picked a scent has said what they are after, and hiding five
       matching lip products behind a tile they have to notice and press would
       be answering a different question. */
    const kids = state.category !== 'all' && !state.scent && !state.search
      ? childCategories(state.category) : [];
    if (kids.length) {
      const own = list.filter((p) => filedIn(p, state.category));
      return subShelves(kids, list) + (own.length ? productGrid(own) : '');
    }
    return productGrid(list);
  }
  /* An aisle and, indented under it, its sub-shelves. Products filed directly
     on the parent come first; Lips gets its own sign inside Face rather than a
     shelf of its own beside it. `filedIn` rather than `p.category ===` so a
     product shelved in two places — the Face Scrub, which the owner named
     under both Bath and Face — appears under both. */
  const shelf = (c, cls, id) => {
    const own = list.filter((p) => filedIn(p, c.id));
    const kids = childCategories(c.id)
      .map((k) => shelf(k, 'aisle aisle--sub', `aisle-${k.id}`))
      .filter(Boolean);
    if (!own.length && !kids.length) return '';
    const shown = own.slice(0, PREVIEW);
    const rest = own.length - shown.length;
    const total = list.filter((p) => inCategory(p, c.id)).length;
    return `
    <section class="${cls}" aria-labelledby="${esc(id)}">
      <header class="aisle__head" data-reveal="up">
        <h2 class="aisle__name" id="${esc(id)}">${esc(c.label)}</h2>
        <p class="aisle__note">${esc(AISLE[c.id] || '')}</p>
        <span class="aisle__count">${total}</span>
      </header>
      ${shown.length ? productGrid(shown) : ''}
      ${rest > 0 ? `
        <div class="aisle__more" data-reveal="up">
          <button class="btn btn--ghost btn--sm" type="button" data-cat-jump="${esc(c.id)}">
            <span class="btn__label">See all ${own.length} in ${esc(c.label)}</span>
          </button>
          <span class="aisle__rest">${rest} more</span>
        </div>` : ''}
      ${kids.join('')}
    </section>`;
  };
  return topCategories().map((c) => shelf(c, 'aisle', `aisle-${c.id}`)).join('');
}

export default function shop({ query }) {
  const state = {
    category: query.category && CATEGORIES.some((c) => c.id === query.category) ? query.category : 'all',
    scent: query.scent || null,
    sort: query.sort || 'featured',
    search: query.q || ''
  };

  /* A parent shelf counts everything beneath it, so "Body & Hands 19" is the
     number you actually get when you press it. */
  const countFor = (catId) => PRODUCTS.filter((p) => inCategory(p, catId)).length;

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
          ${PRODUCTS.length} products, ${variantCount()} ways to have them, all made in
          small batches by hand. Jump to a shelf, filter by what you need, or
          go by how you would like it to smell.
        </p>
        <p class="page-head__aside" data-reveal="up" style="--reveal-delay:280ms">
          Rather be handed an answer? <a href="#/sets">See the sets</a> &mdash;
          three or four things chosen together for one problem.
        </p>
      </div>
    </header>

    <section class="section section--flush-top">
      <div class="wrap">
        <div class="filters" data-reveal="up">
          <span class="filters__wash" aria-hidden="true"></span>
          <div class="filters__row">
            <div class="filters__group" role="group" aria-label="Filter by category">
              ${CATEGORIES.map((c) => `
                <button class="chip ${c.parent ? 'chip--sub' : ''}" type="button"
                        data-cat="${esc(c.id)}" aria-pressed="${c.id === state.category}">
                  ${c.parent ? '<span class="chip__in" aria-hidden="true">↳</span>' : ''}${esc(c.label)}<span class="chip__count">${countFor(c.id)}</span>
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

        <div data-grid-host>${render(apply(PRODUCTS, state), state)}</div>
      </div>
    </section>

    <section class="section section--tight band--olive help-band">
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
          host.innerHTML = render(list, state);
          host.style.transition = 'opacity 420ms var(--ease-out-expo), transform 420ms var(--ease-out-expo)';
          host.style.opacity = '1';
          host.style.transform = 'none';
          initReveal(host);
          initTilt(host);
        }, 160);

        countLabel.textContent = list.length === PRODUCTS.length
          ? `Showing all ${list.length} products`
          : `${list.length} of ${PRODUCTS.length} products`;
        countLabel.hidden = list.length === PRODUCTS.length && state.category === 'all';

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

      /* Delegated: these live inside the host, which paint() replaces. */
      host.addEventListener('click', (e) => {
        const jump = e.target.closest('[data-cat-jump]');
        if (!jump) return;
        state.category = jump.dataset.catJump;
        paint();
        root.querySelector('.filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      $$('[data-scent]', root).forEach((btn) => btn.addEventListener('click', () => {
        // Second click on an active scent clears it.
        state.scent = state.scent === btn.dataset.scent ? null : btn.dataset.scent;
        paint();
      }));

      /* ---- the shop answers before you commit ----------------------------
         Resting on a scent lights the products that carry it and lets the rest
         recede, and the filter bar blooms in that scent's own colour under the
         chip. Nothing is filtered and nothing is navigated: it is a preview of
         what pressing would do, which is the part that makes it worth
         discovering rather than merely pretty.

         Preview only, and only for a pointer. On a touch screen there is no
         hover to preview with — a tap is the commitment — and on a keyboard
         focus does the same job, so it is wired to both enter and focus. */
      const filters = $('.filters', root);
      const scentChips = $$('[data-scent]', root);
      let scentTimer = null;

      const previewScent = (btn) => {
        clearTimeout(scentTimer);
        const id = btn.dataset.scent;
        if (filters) {
          const f = filters.getBoundingClientRect();
          const b = btn.getBoundingClientRect();
          filters.style.setProperty('--scent', btn.style.getPropertyValue('--sc'));
          filters.style.setProperty('--scent-x',
            `${(((b.left + b.width / 2) - f.left) / f.width * 100).toFixed(1)}%`);
          filters.classList.add('is-scenting');
        }
        scentChips.forEach((c) => c.classList.toggle('is-hushed', c !== btn));
        $$('.spec', root).forEach((card) =>
          card.classList.toggle('is-hushed',
            !(card.dataset.scents || '').split(' ').includes(id)));
      };

      const clearScent = () => {
        /* A short grace period, so travelling from one chip to the next does
           not flash the whole grid back to full and out again. */
        clearTimeout(scentTimer);
        scentTimer = setTimeout(() => {
          filters?.classList.remove('is-scenting');
          scentChips.forEach((c) => c.classList.remove('is-hushed'));
          $$('.spec', root).forEach((c) => c.classList.remove('is-hushed'));
        }, 90);
      };

      scentChips.forEach((btn) => {
        btn.addEventListener('pointerenter', (e) => {
          if (e.pointerType !== 'touch') previewScent(btn);
        });
        btn.addEventListener('pointerleave', clearScent);
        btn.addEventListener('focus', () => previewScent(btn));
        btn.addEventListener('blur', clearScent);
      });

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

  if (state.category !== 'all') out = out.filter((p) => inCategory(p, state.category));
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
    case 'name':       out.sort((a, b) => a.name.localeCompare(b.name)); break;
    /* "Featured" is the order the catalogue is written in, which is a person's
       decision about what should lead. Filtering must not reshuffle it. */
    default:           out.sort((a, b) => list.indexOf(a) - list.indexOf(b));
  }
  return out;
}
