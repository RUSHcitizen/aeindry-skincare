/** Ingredient library — filterable grid with a detail pane. */

import { pageField, initBotField } from '../ui/bot-field.js';
import { $, $$, esc, debounce } from '../lib/dom.js';
import { INGREDIENTS, INGREDIENT_FAMILIES, NEVER_LIST } from '../data/content.js';
import { getProduct } from '../data/products.js';
import { productArt } from '../lib/art.js';

export default function ingredients({ query }) {
  const focusId = query.focus && INGREDIENTS.some((i) => i.id === query.focus) ? query.focus : INGREDIENTS[0].id;

  return {
    title: 'Ingredients',
    html: `
    <header class="page-head">
      ${pageField('ingredients')}
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Home</a><span aria-hidden="true">·</span><span aria-current="page">Ingredients</span>
        </nav>
        <h1 class="display-lg" data-split="lines">Every ingredient, and why it is there</h1>
        <p class="lede" data-reveal="up" style="--reveal-delay:200ms">
          ${INGREDIENTS.length} entries. Butters, cold-pressed oils, herbs steeped for six weeks,
          clays and minerals — with what each one actually does and which formulas it turns up in.
        </p>
      </div>
    </header>

    <section class="section section--flush-top">
      <div class="wrap">
        <div class="filters filters--slim" data-reveal="up">
          <div class="filters__row">
            <div class="filters__group" role="group" aria-label="Filter by family">
              ${INGREDIENT_FAMILIES.map((f) => `
                <button class="chip" type="button" data-fam="${esc(f.id)}" aria-pressed="${f.id === 'all'}">
                  ${esc(f.label)}
                  <span class="chip__count">${f.id === 'all' ? INGREDIENTS.length : INGREDIENTS.filter((i) => i.family === f.id).length}</span>
                </button>`).join('')}
            </div>
            <div class="searchbox searchbox--slim">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
              </svg>
              <label class="visually-hidden" for="ing-search">Search ingredients</label>
              <input id="ing-search" class="searchbox__input" type="search" placeholder="Search…" autocomplete="off">
            </div>
          </div>
        </div>

        <div class="ing-layout">
          <ul class="ing-grid" role="list" data-ing-grid data-stagger style="--stagger-step:35ms"></ul>
          <aside class="ing-detail" data-ing-detail aria-live="polite"></aside>
        </div>
      </div>
    </section>

    <section class="section never band--olive">
      <div class="wrap">
        <header class="sec-head">
          <div>
            <p class="eyebrow eyebrow--bare" data-reveal="fade">Just as important</p>
            <h2 class="h2" data-split="lines">The list we keep out</h2>
          </div>
          <p class="sec-head__aside body-sm" data-reveal="up">
            An ingredient list is defined as much by its absences. These are ours, with reasons.
          </p>
        </header>
        <ul class="never__list" role="list" data-stagger style="--stagger-step:50ms">
          ${NEVER_LIST.map((n) => `
            <li class="never__item" data-reveal="up">
              <span class="never__x" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </span>
              <div>
                <h3 class="never__name">${esc(n.name)}</h3>
                <p class="never__why">${esc(n.why)}</p>
              </div>
            </li>`).join('')}
        </ul>
      </div>
    </section>`,

    mount(root) {
      const stopField = initBotField(root);
      const grid = $('[data-ing-grid]', root);
      const detail = $('[data-ing-detail]', root);
      const search = $('#ing-search', root);
      let family = 'all';
      let term = '';
      let selected = focusId;

      function list() {
        return INGREDIENTS.filter((i) => {
          if (family !== 'all' && i.family !== family) return false;
          if (!term) return true;
          const q = term.toLowerCase();
          return `${i.name} ${i.latin} ${i.origin} ${i.role} ${i.body}`.toLowerCase().includes(q);
        });
      }

      function paintGrid() {
        const items = list();
        grid.innerHTML = items.length
          ? items.map((i) => `
              <li>
                <button class="ing-card ${i.id === selected ? 'is-on' : ''}" type="button"
                        data-pick="${esc(i.id)}" style="--ing:${esc(i.color)}">
                  <span class="ing-card__swatch" aria-hidden="true"></span>
                  <span class="ing-card__name">${esc(i.name)}</span>
                  <span class="ing-card__role">${esc(i.role)}</span>
                </button>
              </li>`).join('')
          : `<li class="ing-grid__empty"><p class="body-sm">Nothing matches “${esc(term)}”.</p></li>`;

        $$('[data-pick]', grid).forEach((b, idx) => {
          b.style.setProperty('--i', idx);
          b.addEventListener('click', () => { selected = b.dataset.pick; paintGrid(); paintDetail(); });
        });
      }

      function paintDetail() {
        const ing = INGREDIENTS.find((i) => i.id === selected);
        if (!ing) { detail.innerHTML = ''; return; }
        const uses = ing.foundIn.map(getProduct).filter(Boolean);

        detail.innerHTML = `
          <div class="ing-detail__inner" style="--ing:${esc(ing.color)}">
            <span class="ing-detail__swatch" aria-hidden="true"></span>
            <p class="eyebrow eyebrow--bare">${esc(ing.role)}</p>
            <h2 class="h3">${esc(ing.name)}</h2>
            <p class="ing-detail__latin">${esc(ing.latin)}</p>
            <p class="ing-detail__origin">${esc(ing.origin)}</p>
            <p class="body-sm">${esc(ing.body)}</p>
            ${uses.length ? `
              <h3 class="ing-detail__sub">In ${uses.length} formula${uses.length > 1 ? 's' : ''}</h3>
              <ul class="ing-detail__uses" role="list">
                ${uses.map((p) => `
                  <li>
                    <a href="#/product/${esc(p.id)}" style="--tint:${esc(p.art.tint[1])}">
                      <span class="ing-detail__thumb">${productArt(p)}</span>
                      <span>${esc(p.name)}</span>
                    </a>
                  </li>`).join('')}
              </ul>` : ''}
          </div>`;

        detail.firstElementChild.animate(
          [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
          { duration: 480, easing: 'cubic-bezier(0.16,1,0.3,1)' }
        );
      }

      $$('[data-fam]', root).forEach((btn) => {
        btn.addEventListener('click', () => {
          family = btn.dataset.fam;
          $$('[data-fam]', root).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
          paintGrid();
        });
      });

      search.addEventListener('input', debounce((e) => { term = e.target.value.trim(); paintGrid(); }, 200));

      const onQuery = (e) => {
        const id = e.detail?.query?.focus;
        if (id && INGREDIENTS.some((i) => i.id === id)) {
          selected = id;
          paintGrid();
          paintDetail();
        }
      };
      window.addEventListener('route:query', onQuery);

      paintGrid();
      paintDetail();
      return () => { window.removeEventListener('route:query', onQuery); stopField?.(); };
    }
  };
}
