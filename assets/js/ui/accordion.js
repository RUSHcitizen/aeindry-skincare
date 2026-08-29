/** Accordion built on grid-template-rows so it animates to auto height. */

import { $$ } from '../lib/dom.js';

export function initAccordion(root = document) {
  $$('.acc', root).forEach((acc) => {
    if (acc.dataset.accBound) return;
    acc.dataset.accBound = '1';
    const single = acc.dataset.accSingle === 'true';

    $$('.acc__btn', acc).forEach((btn) => {
      const panel = btn.nextElementSibling;
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        if (single && !open) {
          $$('.acc__btn', acc).forEach((other) => {
            other.setAttribute('aria-expanded', 'false');
            other.nextElementSibling?.classList.remove('is-open');
          });
        }
        btn.setAttribute('aria-expanded', String(!open));
        panel?.classList.toggle('is-open', !open);
      });
    });
  });
}
