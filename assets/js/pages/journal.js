/** Journal — the reasoning behind the formulas, plus the FAQ. */

import { $$, esc } from '../lib/dom.js';
import { pageField, initBotField } from '../ui/bot-field.js';
import { JOURNAL, FAQS, BRAND } from '../data/content.js';
import { initAccordion } from '../ui/accordion.js';

export default function journal() {
  const [lead, ...rest] = JOURNAL;

  return {
    title: 'Journal',
    html: `
    <header class="page-head">
      ${pageField('journal')}
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Home</a><span aria-hidden="true">·</span><span aria-current="page">Journal</span>
        </nav>
        <h1 class="display-lg" data-split="lines">Notes from the workbench</h1>
        <p class="lede" data-reveal="up" style="--reveal-delay:180ms">
          Why a bar cures for six weeks, why baking soda burns, and why the cleanest way to keep
          a preservative off a label is to build a formula that never needed one.
        </p>
      </div>
    </header>

    <section class="section section--flush-top">
      <div class="wrap">
        <article class="jlead" data-reveal="clip" style="--jc:${esc(lead.color)}">
          <div class="jlead__media" aria-hidden="true">
            <span class="jlead__orb"></span>
            <span class="jlead__orb jlead__orb--2"></span>
          </div>
          <div class="jlead__body">
            <span class="jcard__tag">${esc(lead.tag)}</span>
            <h2 class="h2">${esc(lead.title)}</h2>
            <p class="body-lg">${esc(lead.excerpt)}</p>
            <p class="jcard__meta">${esc(lead.date)} · ${esc(lead.read)} read</p>
            <button class="btn-text" type="button" data-soon>
              Read the piece
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>
        </article>

        <div class="jgrid jgrid--5" data-stagger style="--stagger-step:70ms">
          ${rest.map((j) => `
            <button class="jcard" type="button" data-soon data-reveal="up" style="--jc:${esc(j.color)}">
              <span class="jcard__tag">${esc(j.tag)}</span>
              <h3 class="jcard__title">${esc(j.title)}</h3>
              <p class="jcard__excerpt">${esc(j.excerpt)}</p>
              <span class="jcard__meta">${esc(j.date)} · ${esc(j.read)}</span>
            </button>`).join('')}
        </div>
      </div>
    </section>

    <section class="section faq band--forest">
      <div class="wrap wrap--narrow">
        <header class="sec-head sec-head--center">
          <p class="eyebrow eyebrow--bare" data-reveal="fade">Asked often</p>
          <h2 class="h2" data-split="lines">The questions we get at every market</h2>
        </header>

        <div class="acc" data-acc-single="true" data-reveal="up">
          ${FAQS.map((f, i) => `
            <div class="acc__item">
              <button class="acc__btn" type="button" aria-expanded="${i === 0}">
                ${esc(f.q)}<span class="acc__icon" aria-hidden="true"></span>
              </button>
              <div class="acc__panel ${i === 0 ? 'is-open' : ''}"><div><div class="acc__inner">
                <p>${esc(f.a)}</p>
              </div></div></div>
            </div>`).join('')}
        </div>

        <p class="text-center body-sm faq__foot" data-reveal="up">
          Something not covered? Email
          <a class="link-underline" href="mailto:${esc(BRAND.email)}">${esc(BRAND.email)}</a> —
          a real person reads it.
        </p>
      </div>
    </section>`,

    mount(root) {
      const stopField = initBotField(root);
      initAccordion(root);
      // The journal pieces are written but not yet published as full articles.
      $$('[data-soon]', root).forEach((b) => b.addEventListener('click', (e) => {
        e.preventDefault();
        import('../ui/toast.js').then(({ toast }) =>
          toast('This piece is still being written — it will land here first.', { icon: 'info', duration: 3200 }));
      }));
    }
  };
}
