/**
 * Two guided tools in one route:
 *   · Ritual builder — pick a concern, get an ordered routine with reasons.
 *   · Scent finder   — three questions, weighted onto six scent families.
 */

import { $, $$, esc } from '../lib/dom.js';
import { CONCERNS, ROUTINES, SCENT_QUIZ, SCENT_PROFILES, SCENT_MATCHES } from '../data/content.js';
import { getProduct, formatPrice, priceOf } from '../data/products.js';
import { productArt, botanical } from '../lib/art.js';
import { addToCart } from '../core/store.js';
import { toast } from '../ui/toast.js';
import { initReveal } from '../core/reveal.js';
import { scrollTo } from '../core/scroll.js';

export default function ritual({ query }) {
  const startTab = query.tab === 'scent' ? 'scent' : 'ritual';
  const startConcern = query.concern && ROUTINES[query.concern] ? query.concern : null;

  return {
    title: 'Build your ritual',
    html: `
    <header class="page-head">
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Home</a><span aria-hidden="true">·</span><span aria-current="page">Build your ritual</span>
        </nav>
        <h1 class="display-lg" data-split="lines">Let us do the choosing.</h1>
        <p class="lede" data-reveal="up" style="--reveal-delay:180ms">
          Two short tools. One asks what your skin is doing and builds a routine around it;
          the other works out what you would actually like to smell like.
        </p>
      </div>
    </header>

    <div class="tabs" role="tablist" aria-label="Guided tools">
      <div class="wrap">
        <div class="tabs__list">
          <button class="tab" role="tab" id="tab-ritual" aria-controls="panel-ritual"
                  aria-selected="${startTab === 'ritual'}" data-tab="ritual">
            <span class="tab__icon">${botanical('drop')}</span>Build a ritual
          </button>
          <button class="tab" role="tab" id="tab-scent" aria-controls="panel-scent"
                  aria-selected="${startTab === 'scent'}" data-tab="scent">
            <span class="tab__icon">${botanical('sprig')}</span>Find your scent
          </button>
          <span class="tabs__ink" aria-hidden="true"></span>
        </div>
      </div>
    </div>

    <!-- ============ RITUAL BUILDER ============ -->
    <section class="section section--flush-top" id="panel-ritual" role="tabpanel"
             aria-labelledby="tab-ritual" ${startTab === 'ritual' ? '' : 'hidden'}>
      <div class="wrap">
        <div class="builder" data-builder>
          <div class="builder__step" data-step="pick">
            <p class="eyebrow" data-reveal="fade">Step one of one</p>
            <h2 class="h3" data-reveal="up">What is bothering you most?</h2>
            <div class="concern-grid concern-grid--lg" data-stagger style="--stagger-step:50ms">
              ${CONCERNS.map((c) => `
                <button class="concern" type="button" data-concern="${esc(c.id)}" data-reveal="scale" data-magnetic="0.12">
                  <span class="concern__icon">${botanical(c.icon)}</span>
                  <span class="concern__label">${esc(c.label)}</span>
                  <span class="concern__body">${esc(c.body)}</span>
                  <span class="concern__go" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </span>
                </button>`).join('')}
            </div>
          </div>

          <div class="builder__result" data-result hidden></div>
        </div>
      </div>
    </section>

    <!-- ============ SCENT QUIZ ============ -->
    <section class="section section--flush-top" id="panel-scent" role="tabpanel"
             aria-labelledby="tab-scent" ${startTab === 'scent' ? '' : 'hidden'}>
      <div class="wrap">
        <div class="quiz" data-quiz>
          <div class="quiz__progress" aria-hidden="true"><span data-quiz-bar></span></div>
          <div class="quiz__stage" data-quiz-stage></div>
        </div>
      </div>
    </section>`,

    mount(root) {
      /* ---------------- tabs ---------------- */
      const tabs = $$('[data-tab]', root);
      const panels = { ritual: $('#panel-ritual', root), scent: $('#panel-scent', root) };
      const ink = $('.tabs__ink', root);

      function moveInk(btn) {
        if (!ink || !btn) return;
        ink.style.width = `${btn.offsetWidth}px`;
        ink.style.transform = `translateX(${btn.offsetLeft}px)`;
      }

      function selectTab(id, { push = true } = {}) {
        tabs.forEach((t) => {
          const on = t.dataset.tab === id;
          t.setAttribute('aria-selected', String(on));
          if (on) moveInk(t);
        });
        Object.entries(panels).forEach(([k, p]) => { if (p) p.hidden = k !== id; });
        if (push) history.replaceState(null, '', `#/ritual${id === 'scent' ? '?tab=scent' : ''}`);
      }

      tabs.forEach((t) => t.addEventListener('click', () => selectTab(t.dataset.tab)));
      requestAnimationFrame(() => moveInk(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
      window.addEventListener('resize', () => moveInk(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));

      /* ---------------- ritual builder ---------------- */
      const resultHost = $('[data-result]', root);
      const pickStep = $('[data-step="pick"]', root);

      function buildRoutine(concernId) {
        const routine = ROUTINES[concernId];
        const concern = CONCERNS.find((c) => c.id === concernId);
        if (!routine) return;

        const steps = routine.steps.map((s) => {
          const p = getProduct(s.productId);
          const v = p?.variants?.find((x) => x.id === s.variantId) || null;
          return { ...s, p, v, unit: priceOf(p, s.variantId) };
        }).filter((s) => s.p);

        const total = steps.reduce((n, s) => n + s.unit, 0);

        resultHost.hidden = false;
        resultHost.innerHTML = `
          <div class="routine">
            <header class="routine__head">
              <div>
                <p class="eyebrow">${esc(concern?.label || '')}</p>
                <h2 class="h2" data-reveal="up">${esc(routine.title)}</h2>
                <p class="lede" data-reveal="up" style="--reveal-delay:80ms">${esc(routine.intro)}</p>
              </div>
              <button class="btn-text" type="button" data-restart>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12a7 7 0 1 1-2-4.9M19 4v4h-4"/></svg>
                Start over
              </button>
            </header>

            <ol class="routine__steps" role="list" data-stagger style="--stagger-step:110ms">
              ${steps.map((s, i) => `
                <li class="ritual-step" data-reveal="up"
                    style="--card-tint:${esc(s.p.art.tint[1])};--card-accent:${esc(s.v?.swatch || s.p.art.accent)}">
                  <span class="ritual-step__num">${String(i + 1).padStart(2, '0')}</span>
                  <span class="ritual-step__media">${productArt(s.p, { variantId: s.variantId })}</span>
                  <div class="ritual-step__body">
                    <p class="ritual-step__kicker">${esc(s.step)}</p>
                    <h3 class="ritual-step__name">
                      <a href="#/product/${esc(s.p.id)}${s.variantId ? `?variant=${esc(s.variantId)}` : ''}">${esc(s.p.name)}</a>
                    </h3>
                    ${s.v ? `<p class="ritual-step__variant"><span class="dot" style="background:${esc(s.v.swatch)}"></span>${esc(s.v.label)}</p>` : ''}
                    <p class="ritual-step__why">${esc(s.why)}</p>
                  </div>
                  <div class="ritual-step__buy">
                    <span class="ritual-step__price">${formatPrice(s.unit)}</span>
                    <button class="btn btn--ghost btn--sm" type="button"
                            data-add-to-cart="${esc(s.p.id)}" data-variant="${esc(s.variantId || '')}">
                      <span class="btn__label">Add</span>
                    </button>
                  </div>
                </li>`).join('')}
            </ol>

            <div class="routine__foot" data-reveal="up">
              <div>
                <p class="routine__total-label">The full routine</p>
                <p class="routine__total">${formatPrice(total)}<small> · ${steps.length} products</small></p>
              </div>
              <button class="btn btn--primary btn--lg" type="button" data-add-all data-magnetic="0.16">
                <span class="btn__label">Add all ${steps.length} to basket</span>
              </button>
            </div>
          </div>`;

        pickStep.classList.add('is-collapsed');
        initReveal(resultHost);

        $('[data-restart]', resultHost)?.addEventListener('click', () => {
          resultHost.hidden = true;
          resultHost.innerHTML = '';
          pickStep.classList.remove('is-collapsed');
          $$('[data-concern]', root).forEach((b) => b.classList.remove('is-on'));
          scrollTo(pickStep, { offset: -190 });
        });

        $('[data-add-all]', resultHost)?.addEventListener('click', () => {
          steps.forEach((s) => addToCart(s.p.id, s.variantId, 1));
          toast(`${steps.length} products added — ${formatPrice(total)}`);
        });

        setTimeout(() => scrollTo(resultHost, { offset: -190 }), 120);
      }

      $$('[data-concern]', root).forEach((btn) => {
        btn.addEventListener('click', () => {
          $$('[data-concern]', root).forEach((b) => b.classList.remove('is-on'));
          btn.classList.add('is-on');
          buildRoutine(btn.dataset.concern);
        });
      });

      if (startConcern) {
        const btn = $(`[data-concern="${startConcern}"]`, root);
        btn?.classList.add('is-on');
        buildRoutine(startConcern);
      }

      /* ---------------- scent quiz ---------------- */
      const stage = $('[data-quiz-stage]', root);
      const bar = $('[data-quiz-bar]', root);
      let step = 0;
      const answers = [];

      function paintQuiz() {
        const pct = (step / SCENT_QUIZ.length) * 100;
        if (bar) bar.style.width = `${pct}%`;

        if (step < SCENT_QUIZ.length) {
          const q = SCENT_QUIZ[step];
          stage.innerHTML = `
            <div class="quiz__card" data-quiz-card>
              <p class="eyebrow">Question ${step + 1} of ${SCENT_QUIZ.length}</p>
              <h2 class="h2 quiz__question">${esc(q.question)}</h2>
              <div class="quiz__options" data-stagger style="--stagger-step:70ms">
                ${q.options.map((o, i) => `
                  <button class="quiz__option" type="button" data-opt="${i}" data-reveal="up" data-magnetic="0.1">
                    <span class="quiz__option-label">${esc(o.label)}</span>
                    <span class="quiz__option-sub">${esc(o.sub)}</span>
                  </button>`).join('')}
              </div>
              ${step > 0 ? `<button class="btn-text btn--back" type="button" data-quiz-back>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
                Back</button>` : ''}
            </div>`;

          $$('[data-opt]', stage).forEach((b) => {
            b.addEventListener('click', () => {
              answers[step] = q.options[parseInt(b.dataset.opt, 10)];
              b.classList.add('is-picked');
              setTimeout(() => { step++; paintQuiz(); }, 260);
            });
          });
          $('[data-quiz-back]', stage)?.addEventListener('click', () => { step--; paintQuiz(); });

        } else {
          // Tally the weights and take the winner.
          const scores = {};
          answers.forEach((a) => {
            for (const [k, v] of Object.entries(a.weights)) scores[k] = (scores[k] || 0) + v;
          });
          const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
          const winner = ranked[0]?.[0] || 'herbal';
          const profile = SCENT_PROFILES[winner];
          const picks = (SCENT_MATCHES[winner] || []).map(([pid, vid]) => {
            const p = getProduct(pid);
            const v = p?.variants?.find((x) => x.id === vid) || null;
            return p ? { p, v, vid, unit: priceOf(p, vid) } : null;
          }).filter(Boolean);

          stage.innerHTML = `
            <div class="quiz-result" style="--sc:${esc(profile.color)}">
              <span class="quiz-result__orb" aria-hidden="true"></span>
              <p class="eyebrow">Your scent profile</p>
              <h2 class="display-lg" data-reveal="up">${esc(profile.label)}</h2>
              <p class="lede mx-auto text-center" data-reveal="up" style="--reveal-delay:100ms">${esc(profile.body)}</p>

              <div class="quiz-result__bars" data-reveal="fade">
                ${ranked.slice(0, 4).map(([k, v]) => {
                  const max = ranked[0][1] || 1;
                  return `<div class="sbar">
                    <span class="sbar__label">${esc(SCENT_PROFILES[k]?.label.split(' & ')[0] || k)}</span>
                    <span class="sbar__track"><span class="sbar__fill" style="width:${Math.round((v / max) * 100)}%;background:${esc(SCENT_PROFILES[k]?.color || '#888')}"></span></span>
                  </div>`;
                }).join('')}
              </div>

              <h3 class="h4 quiz-result__sub" data-reveal="up">Start with these</h3>
              <div class="quiz-result__picks" data-stagger style="--stagger-step:80ms">
                ${picks.map((it) => `
                  <article class="spick" data-reveal="up" style="--card-tint:${esc(it.p.art.tint[1])}">
                    <span class="spick__media">${productArt(it.p, { variantId: it.vid })}</span>
                    <h4 class="spick__name"><a href="#/product/${esc(it.p.id)}?variant=${esc(it.vid)}">${esc(it.p.name)}</a></h4>
                    ${it.v ? `<p class="spick__variant">${esc(it.v.label)}</p>` : ''}
                    <p class="spick__price">${formatPrice(it.unit)}</p>
                    <button class="btn btn--ghost btn--sm btn--block" type="button"
                            data-add-to-cart="${esc(it.p.id)}" data-variant="${esc(it.vid)}">
                      <span class="btn__label">Add</span>
                    </button>
                  </article>`).join('')}
              </div>

              <div class="cluster quiz-result__actions" style="justify-content:center" data-reveal="up">
                <button class="btn btn--primary" type="button" data-add-picks data-magnetic="0.16">
                  <span class="btn__label">Add all ${picks.length} · ${formatPrice(picks.reduce((n, i) => n + i.unit, 0))}</span>
                </button>
                <button class="btn btn--ghost" type="button" data-quiz-restart><span class="btn__label">Take it again</span></button>
              </div>
            </div>`;

          if (bar) bar.style.width = '100%';
          initReveal(stage);

          $('[data-quiz-restart]', stage)?.addEventListener('click', () => {
            step = 0; answers.length = 0; paintQuiz();
          });
          $('[data-add-picks]', stage)?.addEventListener('click', () => {
            picks.forEach((it) => addToCart(it.p.id, it.vid, 1));
            toast(`${picks.length} ${profile.label.split(' & ')[0].toLowerCase()} products added`);
          });
        }

        initReveal(stage);
        const card = $('[data-quiz-card], .quiz-result', stage);
        card?.animate(
          [{ opacity: 0, transform: 'translateY(24px) scale(.98)' }, { opacity: 1, transform: 'none' }],
          { duration: 560, easing: 'cubic-bezier(0.16,1,0.3,1)' }
        );
      }

      paintQuiz();
      if (startTab === 'scent') selectTab('scent', { push: false });

      // A link to #/ritual?tab=scent from *within* /ritual is a query-only
      // change, so the router does not re-render — apply it here instead.
      const onQuery = (e) => {
        const q = e.detail?.query || {};
        if (q.tab === 'scent' || q.tab === 'ritual') selectTab(q.tab, { push: false });
        else if (q.concern) selectTab('ritual', { push: false });
        if (q.concern && ROUTINES[q.concern]) {
          $$('[data-concern]', root).forEach((b) => b.classList.toggle('is-on', b.dataset.concern === q.concern));
          buildRoutine(q.concern);
        }
      };
      window.addEventListener('route:query', onQuery);
      return () => window.removeEventListener('route:query', onQuery);
    }
  };
}
