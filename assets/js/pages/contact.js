/** Contact — a real form (client-validated), the details, and where to find us. */

import { $, $$, esc } from '../lib/dom.js';
import { BRAND } from '../data/content.js';
import { botanical as icon } from '../lib/art.js';
import { pageField, initBotField } from '../ui/bot-field.js';
import { toast } from '../ui/toast.js';

const TOPICS = [
  'A question about a product',
  'Help choosing something',
  'An order that has gone wrong',
  'Wholesale or stockist enquiry',
  'Market and event dates',
  'Something else'
];

export default function contact() {
  return {
    title: 'Contact us',
    html: `
    <header class="page-head">
      ${pageField('contact')}
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="#/">Home</a><span aria-hidden="true">·</span><span aria-current="page">Contact</span>
        </nav>
        <h1 class="display-lg" data-split="lines">Say hello</h1>
        <p class="lede" data-reveal="up" style="--reveal-delay:180ms">
          Small company, real person reading it. Questions about ingredients, help picking
          something for difficult skin, or an order that has gone sideways — all welcome.
        </p>
      </div>
    </header>

    <section class="section section--flush-top">
      <div class="wrap">
        <div class="contact">
          <form class="contact__form" data-contact novalidate data-reveal="up">
            <div class="field">
              <label class="field__label" for="c-name">Your name</label>
              <input class="input" id="c-name" name="name" type="text" required autocomplete="name" placeholder="Jane Doe">
              <p class="field__error" data-error-for="c-name" hidden></p>
            </div>
            <div class="field">
              <label class="field__label" for="c-email">Email</label>
              <input class="input" id="c-email" name="email" type="email" required autocomplete="email" placeholder="you@example.com">
              <p class="field__error" data-error-for="c-email" hidden></p>
            </div>
            <div class="field">
              <label class="field__label" for="c-topic">What is this about?</label>
              <select class="select" id="c-topic" name="topic">
                ${TOPICS.map((t) => `<option>${esc(t)}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="c-message">Message</label>
              <textarea class="textarea" id="c-message" name="message" required
                        placeholder="If it is about a skin concern, tell us what you have already tried — it genuinely helps."></textarea>
              <p class="field__error" data-error-for="c-message" hidden></p>
            </div>
            <button class="btn btn--primary btn--lg" type="submit" data-magnetic="0.14">
              <span class="btn__label">Send message</span>
              <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
            <p class="body-xs">
              This demonstration site has no mail server behind it. To reach the real shop,
              email <a class="link-underline" href="mailto:${esc(BRAND.email)}">${esc(BRAND.email)}</a>.
            </p>
          </form>

          <aside class="contact__aside" data-stagger style="--stagger-step:90ms">
            <div class="ccard" data-reveal="up">
              <span class="ccard__icon">${icon('drop')}</span>
              <h2 class="ccard__title">Email</h2>
              <a class="ccard__value link-underline" href="mailto:${esc(BRAND.email)}">${esc(BRAND.email)}</a>
              <p class="ccard__note">Usually answered within a day or two.</p>
            </div>
            <div class="ccard" data-reveal="up">
              <span class="ccard__icon">${icon('circle')}</span>
              <h2 class="ccard__title">Phone</h2>
              <a class="ccard__value link-underline" href="tel:${esc(BRAND.phoneHref)}">${esc(BRAND.phone)}</a>
              <p class="ccard__note">Weekdays, Pacific time.</p>
            </div>
            <div class="ccard" data-reveal="up">
              <span class="ccard__icon">${icon('leaf')}</span>
              <h2 class="ccard__title">Where we are</h2>
              <p class="ccard__value">${esc(BRAND.city)}</p>
              <p class="ccard__note">Everything is made here, in small batches, by hand.</p>
            </div>
            <div class="ccard ccard--social" data-reveal="up">
              <span class="ccard__icon">${icon('sprig')}</span>
              <h2 class="ccard__title">Find us in person</h2>
              <p class="ccard__note">Market dates go up on Instagram first.</p>
              <div class="cluster" style="--gap:.5rem">
                <a class="btn btn--ghost btn--sm" href="${esc(BRAND.instagram)}" target="_blank" rel="noopener">
                  <span class="btn__label">Instagram</span>
                </a>
                <a class="btn btn--ghost btn--sm" href="${esc(BRAND.facebook)}" target="_blank" rel="noopener">
                  <span class="btn__label">Facebook</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>`,

    mount(root) {
      const stopField = initBotField(root);
      const form = $('[data-contact]', root);

      const setError = (id, message) => {
        const field = $(`#${id}`, root);
        const slot = $(`[data-error-for="${id}"]`, root);
        if (!slot) return;
        slot.hidden = !message;
        slot.textContent = message || '';
        field?.setAttribute('aria-invalid', message ? 'true' : 'false');
        field?.classList.toggle('is-invalid', Boolean(message));
      };

      const validate = () => {
        let ok = true;
        const name = $('#c-name', root).value.trim();
        const email = $('#c-email', root).value.trim();
        const message = $('#c-message', root).value.trim();

        setError('c-name', name ? '' : 'Please tell us what to call you.');
        if (!name) ok = false;

        if (!email) { setError('c-email', 'We need an address to reply to.'); ok = false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError('c-email', 'That does not look like an email address.'); ok = false; }
        else setError('c-email', '');

        if (message.length < 10) { setError('c-message', 'A little more detail will get you a better answer.'); ok = false; }
        else setError('c-message', '');

        return ok;
      };

      $$('.input, .textarea', root).forEach((f) =>
        f.addEventListener('blur', () => { if (f.value.trim()) validate(); }));

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate()) {
          const firstBad = $('.is-invalid', root);
          firstBad?.focus();
          form.animate(
            [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
            { duration: 320, easing: 'ease-in-out' }
          );
          return;
        }
        const btn = $('button[type="submit"]', form);
        btn.disabled = true;
        $('.btn__label', btn).textContent = 'Sending…';
        setTimeout(() => {
          form.innerHTML = `
            <div class="form-done">
              <span class="form-done__tick" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </span>
              <h2 class="h3">Thank you — that would have sent.</h2>
              <p class="body-sm">This is a demonstration storefront, so nothing was actually posted.
              To reach the real shop, email
              <a class="link-underline" href="mailto:${esc(BRAND.email)}">${esc(BRAND.email)}</a>.</p>
            </div>`;
          toast('Message composed (demo — nothing was sent)', { icon: 'info', duration: 3600 });
        }, 900);
      });
    }
  };
}
