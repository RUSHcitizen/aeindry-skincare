/** About — the founder story, scrubbed by scroll, plus the "never" list. */

import { $, $$, esc } from '../lib/dom.js';
import { BRAND, TIMELINE, NEVER_LIST, PILLARS } from '../data/content.js';
import { botanical as icon, brandMark } from '../lib/art.js';
import { botanical } from '../lib/botanical.js';
import { pageField, initBotField } from '../ui/bot-field.js';
import { trackProgress } from '../core/scroll.js';

export default function about() {
  return {
    title: 'About us',
    html: `
    <header class="page-head page-head--tall">
      ${pageField('about')}
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Home</a><span aria-hidden="true">·</span><span aria-current="page">About</span>
        </nav>
        <p class="eyebrow" data-reveal="fade">Woman owned · ${esc(BRAND.region)}</p>
        <h1 class="display-lg" data-split="lines">
          A skincare company that began as a mother trying to stop her son scratching.
        </h1>
      </div>
    </header>

    <section class="section section--flush-top">
      <div class="wrap">
        <div class="about__intro">
          <div class="about__lede stack-m">
            <p class="body-lg" data-reveal="up">
              Aeindry Skincare is a small, woman-owned 100% natural handmade skincare company
              founded and operating in the Pacific Northwest. It was founded in
              ${BRAND.founded} — but the work started eight years before that.
            </p>
            <p class="body-lg" data-reveal="up" style="--reveal-delay:100ms">
              ${esc(BRAND.founder)} is a mom, a certified formulator and a biotechnologist.
              When her son developed allergies and eczema in ${BRAND.journeyStarted}, she did what
              a scientist does with a problem that will not resolve: she went back to the
              literature, and then to the ingredients themselves.
            </p>
          </div>
          <figure class="about__portrait" data-reveal="clip">
            <div class="portrait">
              <div class="portrait__inner">
                ${brandMark('portrait__mark')}
                <p class="portrait__quote">“Would you put it on a child with eczema?”</p>
                <p class="portrait__attrib">The test every formula still has to pass</p>
              </div>
            </div>
            <figcaption class="body-xs">${esc(BRAND.founder)} · Founder &amp; formulator</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- ============ TIMELINE ============ -->
    <section class="section timeline-sec band--forest" id="story">
      <div class="wrap">
        <header class="sec-head sec-head--center">
          <p class="eyebrow eyebrow--bare" data-reveal="fade">The long version</p>
          <h2 class="h2" data-split="lines">Fourteen years, one problem</h2>
        </header>

        <div class="timeline" data-timeline>
          <div class="timeline__spine" aria-hidden="true">
            <span class="timeline__spine-fill" data-spine></span>
          </div>
          <ol class="timeline__list" role="list">
            ${TIMELINE.map((t, i) => `
              <li class="tnode" data-reveal="${i % 2 ? 'left' : 'right'}" style="--tc:${esc(t.accent)}">
                <span class="tnode__dot" aria-hidden="true"></span>
                <div class="tnode__card">
                  <span class="tnode__year">${esc(t.year)}</span>
                  <h3 class="tnode__title">${esc(t.title)}</h3>
                  <p class="tnode__body">${esc(t.body)}</p>
                </div>
              </li>`).join('')}
          </ol>
        </div>
      </div>
    </section>

    <!-- ============ PILLARS ============ -->
    <section class="section">
      <div class="wrap">
        <header class="sec-head">
          <div>
            <p class="eyebrow" data-reveal="fade">The standard</p>
            <h2 class="h2" data-split="lines">What "all natural" means here</h2>
          </div>
          <p class="sec-head__aside body-sm" data-reveal="up">
            The phrase is unregulated and worth almost nothing on a label,
            so here is exactly what we mean by it.
          </p>
        </header>
        <div class="pillars" data-stagger style="--stagger-step:100ms">
          ${PILLARS.map((p, i) => `
            <article class="pillar" data-reveal="up">
              <span class="pillar__num">${String(i + 1).padStart(2, '0')}</span>
              <span class="pillar__icon">${botanical(p.icon)}</span>
              <h3 class="pillar__title">${esc(p.title)}</h3>
              <p class="pillar__body">${esc(p.body)}</p>
            </article>`).join('')}
        </div>
      </div>
    </section>

    <!-- ============ NEVER LIST ============ -->
    <section class="section never">
      <div class="wrap">
        <header class="sec-head">
          <div>
            <p class="eyebrow" data-reveal="fade">The counter-list</p>
            <h2 class="h2" data-split="lines">And what will never be in it</h2>
          </div>
        </header>
        <ul class="never__list" role="list" data-stagger style="--stagger-step:55ms">
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
    </section>

    <!-- ============ MARKETS ============ -->
    <section class="section markets band--forest">
      <div class="wrap wrap--narrow text-center stack-m">
        <p class="eyebrow eyebrow--bare mx-auto" data-reveal="fade">Come and smell them</p>
        <h2 class="h2" data-split="lines">We would rather you tried before you bought.</h2>
        <p class="lede mx-auto text-center" data-reveal="up">
          You will find us at markets around the Seattle area through the season — including the
          Redmond Saturday Market and local handmade markets in Bothell. Current dates go up on
          Instagram first.
        </p>
        <div class="cluster" style="justify-content:center" data-reveal="up">
          <a class="btn btn--light" href="${esc(BRAND.instagram)}" target="_blank" rel="noopener" data-magnetic="0.18">
            <span class="btn__label">Follow ${esc(BRAND.instagramHandle)}</span>
          </a>
          <a class="btn btn--ghost" href="#/contact"><span class="btn__label">Get in touch</span></a>
        </div>
      </div>
    </section>`,

    mount(root) {
      const cleanups = [initBotField(root)];
      const spine = $('[data-spine]', root);
      const timeline = $('[data-timeline]', root);

      // The spine fills as the reader moves through the story.
      if (spine && timeline) {
        cleanups.push(trackProgress(timeline, (p) => {
          spine.style.transform = `scaleY(${p})`;
        }, { start: 0.82, end: 0.42 }));
      }

      // Each node lights its dot when it reaches the middle of the viewport.
      const nodes = $$('.tnode', root);
      if (nodes.length) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => e.target.classList.toggle('is-lit', e.isIntersecting));
        }, { rootMargin: '-42% 0px -42% 0px' });
        nodes.forEach((n) => io.observe(n));
        cleanups.push(() => io.disconnect());
      }

      return () => cleanups.forEach((fn) => fn?.());
    }
  };
}
