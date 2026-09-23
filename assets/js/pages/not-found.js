import { brandMark } from '../lib/art.js';

export default function notFound() {
  return {
    title: 'Not found',
    html: `
    <section class="section notfound">
      <div class="wrap wrap--narrow text-center stack-m">
        <span class="notfound__mark" data-reveal="scale">${brandMark()}</span>
        <p class="eyebrow eyebrow--bare mx-auto" data-reveal="fade">404</p>
        <h1 class="display-lg" data-split="lines">That page has cured away.</h1>
        <p class="lede mx-auto text-center" data-reveal="up">
          The link is broken or the page has moved. The whole range is two clicks from here.
        </p>
        <div class="cluster" style="justify-content:center" data-reveal="up">
          <a class="btn btn--primary" href="#/shop" data-magnetic="0.18"><span class="btn__label">Shop everything</span></a>
          <a class="btn btn--ghost" href="#/"><span class="btn__label">Back home</span></a>
        </div>
      </div>
    </section>`
  };
}
