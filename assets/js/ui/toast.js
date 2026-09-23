/** Transient confirmations, bottom-centre. */

import { $, el } from '../lib/dom.js';

const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  heart: '<path d="M12 20s-7-4.5-7-9.5A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5C19 15.5 12 20 12 20Z"/>',
  info:  '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  alert: '<path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>'
};

export function toast(message, { icon = 'check', duration = 2800 } = {}) {
  const host = $('.toasts');
  if (!host) return;

  const node = el('div', { class: 'toast', role: 'status' });
  node.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[icon] || ICONS.check}</svg><span></span>`;
  node.querySelector('span').textContent = message;
  host.append(node);

  // Never stack more than three.
  while (host.children.length > 3) host.firstElementChild.remove();

  const close = () => {
    node.classList.add('is-out');
    node.addEventListener('animationend', () => node.remove(), { once: true });
  };
  const timer = setTimeout(close, duration);
  node.addEventListener('click', () => { clearTimeout(timer); close(); });
}
