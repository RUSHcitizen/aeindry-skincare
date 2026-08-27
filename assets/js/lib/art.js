import { photoOf, photoWidthsOf } from '../data/products.js';
import { asset } from './asset.js';
/**
 * Parametric product illustration engine.
 *
 * The real product photography on aeindryskincare.com could not be reached
 * from this environment, so every vessel here is drawn from scratch as SVG:
 * a shared lighting/shadow scene plus a per-form path set, tinted by each
 * product's own palette. Swap `productArt()` for <img> tags when the real
 * photography is available — the call sites all go through this one function.
 */

let uid = 0;
const nextId = () => `a${(++uid).toString(36)}`;

/* Deterministic PRNG so a given product always draws the same swirl. */
function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---- small colour helpers (hex only, which is all the palette uses) ---- */
const hex2rgb = (h) => {
  const s = h.replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgb2hex = (r, g, b) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const shade = (hex, amt) => {
  const [r, g, b] = hex2rgb(hex);
  return amt >= 0
    ? rgb2hex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt)
    : rgb2hex(r * (1 + amt), g * (1 + amt), b * (1 + amt));
};

/**
 * Build the <defs> every form shares: body gradient, rim light, top light,
 * a soft contact shadow and a subtle surface grain.
 */
function scene(ids, art) {
  const { body, cap, accent } = art;
  return `
  <defs>
    <linearGradient id="${ids.body}" x1="0" y1="0" x2="1" y2="0.35">
      <stop offset="0%"   stop-color="${shade(body, -0.28)}"/>
      <stop offset="18%"  stop-color="${shade(body, 0.02)}"/>
      <stop offset="46%"  stop-color="${shade(body, 0.2)}"/>
      <stop offset="72%"  stop-color="${shade(body, -0.06)}"/>
      <stop offset="100%" stop-color="${shade(body, -0.34)}"/>
    </linearGradient>
    <linearGradient id="${ids.cap}" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0%"   stop-color="${shade(cap, -0.3)}"/>
      <stop offset="22%"  stop-color="${shade(cap, 0.12)}"/>
      <stop offset="55%"  stop-color="${shade(cap, 0.24)}"/>
      <stop offset="100%" stop-color="${shade(cap, -0.36)}"/>
    </linearGradient>
    <linearGradient id="${ids.top}" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%"   stop-color="${shade(body, 0.32)}"/>
      <stop offset="100%" stop-color="${shade(body, -0.08)}"/>
    </linearGradient>
    <linearGradient id="${ids.capTop}" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%"   stop-color="${shade(cap, 0.34)}"/>
      <stop offset="100%" stop-color="${shade(cap, -0.1)}"/>
    </linearGradient>
    <linearGradient id="${ids.glass}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="14%"  stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="30%"  stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="76%"  stop-color="#ffffff" stop-opacity="0.02"/>
      <stop offset="90%"  stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04"/>
    </linearGradient>
    <linearGradient id="${ids.accent}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${shade(accent, 0.24)}"/>
      <stop offset="100%" stop-color="${shade(accent, -0.24)}"/>
    </linearGradient>
    <radialGradient id="${ids.shadow}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%"   stop-color="#26301f" stop-opacity="0.42"/>
      <stop offset="55%"  stop-color="#26301f" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#26301f" stop-opacity="0"/>
    </radialGradient>
    <filter id="${ids.soft}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.2"/>
    </filter>
    <filter id="${ids.grain}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.055"/></feComponentTransfer>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>
  </defs>`;
}

const groundShadow = (ids, cx = 100, cy = 216, rx = 62, ry = 13) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${ids.shadow})"/>`;

/* Embossed brand monogram used on stamped surfaces. */
const monogram = (x, y, size, color, opacity = 0.34) => `
  <g transform="translate(${x} ${y}) scale(${size / 100})" opacity="${opacity}" fill="none"
     stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-30 26 L0 -28 L30 26"/>
    <path d="M-15 6 L15 6"/>
  </g>`;

/* A marbled swirl band, seeded per product — used on soap and bath bombs. */
function swirl(rand, accent, box, count = 5) {
  const { x, y, w, h } = box;
  let out = '';
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1 || 1);
    const yy = y + h * (0.12 + 0.76 * t);
    const amp = h * (0.05 + rand() * 0.09);
    const drift = (rand() - 0.5) * h * 0.1;
    const sw = h * (0.035 + rand() * 0.05);
    const op = 0.2 + rand() * 0.42;
    const col = i % 2 === 0 ? shade(accent, 0.14) : shade(accent, -0.26);
    out += `<path d="M${x} ${yy + drift}
      C ${x + w * 0.26} ${yy - amp + drift}, ${x + w * 0.42} ${yy + amp + drift}, ${x + w * 0.6} ${yy + drift * 0.4}
      S ${x + w * 0.86} ${yy - amp * 0.8}, ${x + w} ${yy + drift * 0.2}"
      fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
  }
  return out;
}

/* Botanical speckles — dried petals, herbs, oat. */
function speckles(rand, color, box, count = 22) {
  const { x, y, w, h } = box;
  let out = '';
  for (let i = 0; i < count; i++) {
    const cx = x + rand() * w;
    const cy = y + rand() * h;
    const r = 0.7 + rand() * 1.5;
    out += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(r * 1.5).toFixed(1)}" ry="${r.toFixed(1)}"
      transform="rotate(${(rand() * 180).toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})"
      fill="${color}" opacity="${(0.2 + rand() * 0.45).toFixed(2)}"/>`;
  }
  return out;
}

/* ============================================================
   Forms — each returns the artwork sitting on a 200×240 stage
   ============================================================ */
const FORMS = {
  /* Cold-process soap bar, isometric, with a stamped top face. */
  bar(ids, art, rand) {
    const { body, cap, accent } = art;
    // Isometric cage: front face + top face + right face share their edges.
    const F = { x1: 34, y1: 116, x2: 150, y2: 178 };   // front face
    const dx = 20, dy = -19;                            // depth vector
    return `
    ${groundShadow(ids, 96, 190, 72, 12)}
    <g>
      <!-- right face -->
      <path d="M${F.x2} ${F.y1} L${F.x2 + dx} ${F.y1 + dy} L${F.x2 + dx} ${F.y2 + dy} L${F.x2} ${F.y2} Z"
            fill="${shade(body, -0.3)}"/>
      <!-- front face -->
      <path d="M${F.x1} ${F.y1} L${F.x2} ${F.y1} L${F.x2} ${F.y2} L${F.x1} ${F.y2} Z" fill="url(#${ids.body})"/>
      <clipPath id="${ids.clip}"><path d="M${F.x1} ${F.y1} L${F.x2} ${F.y1} L${F.x2} ${F.y2} L${F.x1} ${F.y2} Z"/></clipPath>
      <g clip-path="url(#${ids.clip})">
        ${swirl(rand, accent, { x: F.x1 - 4, y: F.y1 - 2, w: F.x2 - F.x1 + 8, h: F.y2 - F.y1 + 4 }, 6)}
        ${speckles(rand, shade(cap, -0.2), { x: F.x1 + 4, y: F.y1 + 4, w: F.x2 - F.x1 - 8, h: F.y2 - F.y1 - 8 }, 14)}
      </g>
      <!-- top face -->
      <path d="M${F.x1} ${F.y1} L${F.x1 + dx} ${F.y1 + dy} L${F.x2 + dx} ${F.y1 + dy} L${F.x2} ${F.y1} Z"
            fill="url(#${ids.top})"/>
      <!-- stamp on the top face, sheared into the same projection -->
      <g transform="translate(${(F.x1 + F.x2) / 2 + dx / 2} ${F.y1 + dy / 2}) matrix(1,0,-0.72,0.66,0,0)">
        ${monogram(0, 0, 40, shade(body, -0.4), 0.4)}
      </g>
      <!-- edge definition -->
      <path d="M${F.x1} ${F.y1} L${F.x2} ${F.y1}" stroke="${shade(body, 0.46)}" stroke-width="1.6" opacity="0.7"/>
      <path d="M${F.x2} ${F.y1} L${F.x2 + dx} ${F.y1 + dy}" stroke="${shade(body, 0.2)}" stroke-width="1.2" opacity="0.5"/>
      <path d="M${F.x1 + 5} ${F.y1 + 5} L${F.x1 + 5} ${F.y2 - 4}" stroke="${shade(body, 0.5)}" stroke-width="3" opacity="0.3" stroke-linecap="round"/>
      <!-- kraft belly band across the front and around the right face -->
      <path d="M${F.x1} 144 L${F.x2} 144 L${F.x2} 164 L${F.x1} 164 Z" fill="${shade(cap, 0.4)}"/>
      <path d="M${F.x2} 144 L${F.x2 + dx} ${144 + dy} L${F.x2 + dx} ${164 + dy} L${F.x2} 164 Z" fill="${shade(cap, 0.16)}"/>
      <text x="${(F.x1 + F.x2) / 2}" y="157" text-anchor="middle" font-family="Georgia, serif" font-size="12"
            fill="${shade(cap, -0.6)}" opacity="0.8" letter-spacing="3.2">AEINDRY</text>
      <path d="M${F.x1} 144 L${F.x2} 144" stroke="${accent}" stroke-width="1.4" opacity="0.85"/>
      <path d="M${F.x1} 164 L${F.x2} 164" stroke="${shade(cap, -0.16)}" stroke-width="0.7" opacity="0.45"/>
    </g>`;
  },

  /* Shave soap puck seated in a shallow tin, brush alongside. */
  puck(ids, art, rand) {
    const { body, cap, accent } = art;
    return `
    ${groundShadow(ids, 96, 196, 62, 11)}
    <g>
      <!-- brush behind, standing -->
      <g transform="translate(163 122) rotate(11)">
        <path d="M-21 -18 Q-23 -46 0 -52 Q23 -46 21 -18 Z" fill="${shade(body, 0.36)}"/>
        <path d="M-21 -18 Q0 -10 21 -18" fill="${shade(body, 0.18)}"/>
        <path d="M-12 -26 Q-11 -42 -2 -47" stroke="#fff" stroke-width="3.4" fill="none" opacity="0.42" stroke-linecap="round"/>
        <path d="M8 -26 Q9 -40 3 -46" stroke="${shade(body, -0.2)}" stroke-width="2.4" fill="none" opacity="0.3" stroke-linecap="round"/>
        <path d="M-22 -18 L22 -18 L19 -4 L-19 -4 Z" fill="${shade(cap, 0.26)}"/>
        <path d="M-22 -18 L22 -18" stroke="${shade(cap, 0.5)}" stroke-width="1.6" opacity="0.6"/>
        <path d="M-19 -4 L19 -4 L13 42 Q0 50 -13 42 Z" fill="url(#${ids.cap})"/>
        <path d="M-12 2 L-8 38" stroke="${shade(cap, 0.46)}" stroke-width="3.4" opacity="0.42" stroke-linecap="round"/>
      </g>
      <!-- tin wall -->
      <path d="M40 146 Q40 188 96 188 Q152 188 152 146 L152 128 L40 128 Z" fill="url(#${ids.cap})"/>
      <ellipse cx="96" cy="128" rx="56" ry="17" fill="${shade(cap, 0.18)}"/>
      <!-- soap surface, slightly domed -->
      <ellipse cx="96" cy="126" rx="49" ry="14.2" fill="url(#${ids.top})"/>
      <clipPath id="${ids.clip}"><ellipse cx="96" cy="126" rx="49" ry="14.2"/></clipPath>
      <g clip-path="url(#${ids.clip})">
        ${swirl(rand, accent, { x: 46, y: 112, w: 100, h: 28 }, 4)}
      </g>
      <ellipse cx="96" cy="126" rx="49" ry="14.2" fill="none" stroke="${shade(body, -0.24)}" stroke-width="1" opacity="0.45"/>
      ${monogram(96, 126, 22, shade(body, -0.42), 0.3)}
      <!-- swirl worked into the puck by a brush -->
      <path d="M62 128 Q96 116 130 128" stroke="#fff" stroke-width="2.6" fill="none" opacity="0.3" stroke-linecap="round"/>
      <!-- tin speculars + engraved name -->
      <path d="M52 138 Q46 168 64 182" stroke="${shade(cap, 0.5)}" stroke-width="4" fill="none" opacity="0.36" stroke-linecap="round"/>
      <path d="M140 138 Q146 166 130 182" stroke="${shade(cap, -0.42)}" stroke-width="6" fill="none" opacity="0.28" stroke-linecap="round"/>
      <text x="96" y="168" text-anchor="middle" font-family="Georgia, serif" font-size="11"
            fill="${shade(cap, -0.5)}" opacity="0.55" letter-spacing="3">AEINDRY</text>
    </g>`;
  },

  /* Screw-top salve / deodorant tin, three-quarter. */
  tin(ids, art, rand, scale = 1) {
    const { body, cap, accent } = art;
    const s = scale;
    return `
    ${groundShadow(ids, 100, 198, 58 * s, 11 * s)}
    <g transform="translate(100 150) scale(${s}) translate(-100 -150)">
      <!-- body -->
      <path d="M46 138 L46 172 Q46 190 100 190 Q154 190 154 172 L154 138 Z" fill="url(#${ids.body})"/>
      <ellipse cx="100" cy="138" rx="54" ry="16" fill="${shade(body, 0.1)}"/>
      <!-- lid -->
      <path d="M44 118 L44 140 Q44 154 100 154 Q156 154 156 140 L156 118 Z" fill="url(#${ids.cap})"/>
      <ellipse cx="100" cy="118" rx="56" ry="17" fill="url(#${ids.capTop})"/>
      <ellipse cx="100" cy="118" rx="46" ry="13.6" fill="none" stroke="${shade(cap, -0.24)}" stroke-width="1.1" opacity="0.55"/>
      <ellipse cx="100" cy="118" rx="38" ry="11.2" fill="${shade(cap, 0.08)}" opacity="0.6"/>
      ${monogram(100, 118, 26, shade(cap, -0.5), 0.42)}
      <!-- knurled lid edge -->
      ${Array.from({ length: 26 }, (_, i) => {
        const a = (i / 26) * Math.PI * 2;
        const x = 100 + Math.cos(a) * 56;
        const y = 118 + Math.sin(a) * 17;
        return Math.sin(a) > -0.25
          ? `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="1.4" height="${(20 + Math.sin(a) * 4).toFixed(1)}" fill="${shade(cap, -0.3)}" opacity="0.32"/>`
          : '';
      }).join('')}
      <!-- label band -->
      <path d="M46 148 L46 174 Q46 182 60 185 L140 185 Q154 182 154 174 L154 148 Z" fill="${shade(body, 0.42)}" opacity="0.95"/>
      <text x="100" y="163" text-anchor="middle" font-family="Georgia, serif" font-size="12"
            fill="${shade(body, -0.55)}" opacity="0.78" letter-spacing="2.4">AEINDRY</text>
      <rect x="72" y="169" width="56" height="1.3" rx="0.6" fill="${shade(accent, -0.1)}" opacity="0.8"/>
      <text x="100" y="180" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="6"
            fill="${shade(body, -0.42)}" opacity="0.6" letter-spacing="1.6">ALL NATURAL</text>
      <!-- speculars -->
      <path d="M56 146 Q50 172 66 184" stroke="${shade(body, 0.5)}" stroke-width="3.4" fill="none" opacity="0.34" stroke-linecap="round"/>
      <path d="M146 146 Q152 170 138 184" stroke="${shade(body, -0.42)}" stroke-width="5" fill="none" opacity="0.26" stroke-linecap="round"/>
    </g>`;
  },

  'tin-small'(ids, art, rand) {
    return FORMS.tin(ids, art, rand, 0.78);
  },

  /* Wide glass cream jar with a deep wooden lid. */
  jar(ids, art, rand) {
    const { body, cap, accent } = art;
    return `
    ${groundShadow(ids, 100, 200, 58, 11)}
    <g>
      <!-- glass base -->
      <path d="M50 130 L50 176 Q50 192 100 192 Q150 192 150 176 L150 130 Z"
            fill="${shade(body, 0.3)}" opacity="0.55"/>
      <path d="M50 130 L50 176 Q50 192 100 192 Q150 192 150 176 L150 130 Z"
            fill="url(#${ids.glass})"/>
      <!-- cream inside, meniscus -->
      <path d="M56 142 L56 174 Q56 186 100 186 Q144 186 144 174 L144 142 Z" fill="url(#${ids.body})" opacity="0.96"/>
      <ellipse cx="100" cy="142" rx="44" ry="11" fill="${shade(body, 0.36)}"/>
      <ellipse cx="100" cy="142" rx="30" ry="7" fill="${shade(accent, 0.42)}" opacity="0.4"/>
      <!-- wooden lid -->
      <path d="M44 100 L44 128 Q44 140 100 140 Q156 140 156 128 L156 100 Z" fill="url(#${ids.cap})"/>
      <ellipse cx="100" cy="100" rx="56" ry="17" fill="url(#${ids.capTop})"/>
      <ellipse cx="100" cy="100" rx="45" ry="13.4" fill="none" stroke="${shade(cap, -0.2)}" stroke-width="1" opacity="0.42"/>
      <ellipse cx="100" cy="100" rx="33" ry="9.8" fill="none" stroke="${shade(cap, -0.16)}" stroke-width="0.8" opacity="0.32"/>
      ${monogram(100, 100, 24, shade(cap, 0.5), 0.5)}
      <!-- glass rim + neck -->
      <ellipse cx="100" cy="130" rx="50" ry="14" fill="${shade(body, 0.5)}" opacity="0.4"/>
      <path d="M50 130 Q50 122 58 120" stroke="#fff" stroke-width="2.4" fill="none" opacity="0.4"/>
      <!-- highlight column -->
      <path d="M62 138 Q57 166 70 184" stroke="#fff" stroke-width="5" fill="none" opacity="0.4" stroke-linecap="round" filter="url(#${ids.soft})"/>
      <path d="M138 140 Q144 166 132 184" stroke="${shade(body, -0.5)}" stroke-width="5" fill="none" opacity="0.16" stroke-linecap="round"/>
      <!-- label -->
      <rect x="70" y="152" width="60" height="26" rx="3" fill="${shade(body, 0.5)}" opacity="0.9"/>
      <text x="100" y="164" text-anchor="middle" font-family="Georgia, serif" font-size="10.5"
            fill="${shade(cap, -0.2)}" opacity="0.85" letter-spacing="2">AEINDRY</text>
      <rect x="82" y="168" width="36" height="1.1" rx="0.5" fill="${accent}" opacity="0.85"/>
      <text x="100" y="176" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="5.4"
            fill="${shade(cap, -0.1)}" opacity="0.65" letter-spacing="1.3">FACE CREAM</text>
    </g>`;
  },

  /* Squat powder pot with the powder visible at the rim. */
  pot(ids, art, rand) {
    const { body, cap, accent } = art;
    return `
    ${groundShadow(ids, 100, 198, 54, 10)}
    <g>
      <path d="M54 128 L54 174 Q54 190 100 190 Q146 190 146 174 L146 128 Z" fill="url(#${ids.body})"/>
      <ellipse cx="100" cy="128" rx="46" ry="13.5" fill="${shade(body, 0.28)}"/>
      <!-- powder surface, softly mounded -->
      <ellipse cx="100" cy="127" rx="40" ry="11.4" fill="${shade(cap, 0.5)}"/>
      <clipPath id="${ids.clip}"><ellipse cx="100" cy="127" rx="40" ry="11.4"/></clipPath>
      <g clip-path="url(#${ids.clip})">
        ${speckles(rand, shade(accent, -0.3), { x: 60, y: 116, w: 80, h: 22 }, 30)}
        <ellipse cx="92" cy="123" rx="18" ry="5" fill="#fff" opacity="0.35"/>
      </g>
      <!-- lid resting behind -->
      <g transform="translate(152 150) rotate(-14)">
        <ellipse cx="0" cy="0" rx="26" ry="30" fill="url(#${ids.cap})"/>
        <ellipse cx="0" cy="-2" rx="20" ry="24" fill="none" stroke="${shade(cap, -0.24)}" stroke-width="1" opacity="0.5"/>
        ${monogram(0, -1, 22, shade(cap, 0.46), 0.5)}
      </g>
      <!-- scoop -->
      <g transform="translate(48 168) rotate(24)" opacity="0.96">
        <rect x="-2" y="-26" width="4" height="26" rx="2" fill="${shade(cap, 0.2)}"/>
        <ellipse cx="0" cy="3" rx="9" ry="6" fill="${shade(cap, 0.34)}"/>
        <ellipse cx="0" cy="2" rx="6.5" ry="4" fill="${shade(cap, -0.1)}" opacity="0.5"/>
      </g>
      <!-- label -->
      <rect x="62" y="142" width="76" height="32" rx="3" fill="${shade(body, -0.05)}" opacity="0.62"/>
      <text x="100" y="156" text-anchor="middle" font-family="Georgia, serif" font-size="10.5"
            fill="${shade(body, -0.62)}" opacity="0.82" letter-spacing="2.2">AEINDRY</text>
      <rect x="84" y="160" width="32" height="1.1" rx="0.5" fill="${accent}" opacity="0.9"/>
      <text x="100" y="169" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="4.6"
            fill="${shade(body, -0.5)}" opacity="0.6" letter-spacing="0.9">POWDER TO FOAM</text>
      <path d="M62 138 Q57 168 70 186" stroke="${shade(body, 0.48)}" stroke-width="3.6" fill="none" opacity="0.3" stroke-linecap="round"/>
    </g>`;
  },

  /* Twist-up lip balm tube, cap set beside it. */
  tube(ids, art, rand) {
    const { body, cap, accent } = art;
    return `
    ${groundShadow(ids, 96, 204, 46, 9)}
    <g>
      <!-- tube body -->
      <path d="M76 96 L76 190 Q76 198 84 198 L112 198 Q120 198 120 190 L120 96 Z" fill="url(#${ids.body})"/>
      <ellipse cx="98" cy="96" rx="22" ry="6" fill="${shade(body, 0.24)}"/>
      <!-- exposed balm -->
      <path d="M84 96 L84 80 Q84 74 98 74 Q112 74 112 80 L112 96 Z" fill="${shade(accent, 0.44)}"/>
      <ellipse cx="98" cy="78" rx="14" ry="4.6" fill="${shade(accent, 0.6)}"/>
      <ellipse cx="94" cy="77" rx="6" ry="2" fill="#fff" opacity="0.45"/>
      <!-- twist base -->
      <path d="M76 176 L120 176 L120 190 Q120 198 112 198 L84 198 Q76 198 76 190 Z" fill="${shade(cap, -0.06)}"/>
      ${Array.from({ length: 9 }, (_, i) =>
        `<rect x="${78 + i * 5}" y="177" width="1.4" height="20" fill="${shade(cap, -0.34)}" opacity="0.32"/>`).join('')}
      <!-- label wrap: monogram up top, wordmark running down the tube -->
      <rect x="76" y="110" width="44" height="60" fill="${shade(body, 0.52)}" opacity="0.96"/>
      <rect x="76" y="110" width="44" height="2" fill="${accent}" opacity="0.9"/>
      <rect x="76" y="168" width="44" height="2" fill="${accent}" opacity="0.55"/>
      <g transform="translate(98 140) rotate(-90)">
        <text x="0" y="3.6" text-anchor="middle" font-family="Georgia, serif" font-size="10"
              fill="${shade(body, -0.55)}" letter-spacing="3.6">AEINDRY</text>
      </g>
      <!-- specular -->
      <path d="M82 104 L82 194" stroke="#fff" stroke-width="3.4" opacity="0.28" stroke-linecap="round"/>
      <path d="M115 104 L115 194" stroke="${shade(body, -0.5)}" stroke-width="4" opacity="0.2" stroke-linecap="round"/>
      <!-- cap lying beside -->
      <g transform="translate(150 172) rotate(78)">
        <path d="M-13 -26 L13 -26 L13 26 Q13 30 9 30 L-9 30 Q-13 30 -13 26 Z" fill="url(#${ids.cap})"/>
        <ellipse cx="0" cy="-26" rx="13" ry="3.6" fill="${shade(cap, 0.34)}"/>
        <path d="M-9 -20 L-9 26" stroke="${shade(cap, 0.44)}" stroke-width="2.6" opacity="0.4" stroke-linecap="round"/>
      </g>
    </g>`;
  },

  /* Folded gauze wipe with the foaming net beside it. */
  net(ids, art, rand) {
    const { body, cap, accent } = art;
    const mesh = [];
    for (let i = -3; i <= 3; i++) {
      mesh.push(`<path d="M${i * 9} -26 Q${i * 11} 0 ${i * 9} 26" stroke="${shade(accent, -0.2)}" stroke-width="1" fill="none" opacity="0.5"/>`);
      mesh.push(`<path d="M-28 ${i * 8} Q0 ${i * 9.5} 28 ${i * 8}" stroke="${shade(accent, -0.2)}" stroke-width="1" fill="none" opacity="0.5"/>`);
    }
    return `
    ${groundShadow(ids, 100, 200, 64, 11)}
    <g>
      <!-- folded gauze wipe -->
      <g transform="translate(74 158) rotate(-8)">
        <path d="M-47 -31 L47 -31 L47 31 L-47 31 Z" fill="${shade(body, -0.16)}" opacity="0.45"/>
        <path d="M-46 -30 L46 -30 L46 30 L-46 30 Z" fill="url(#${ids.body})"/>
        <path d="M-46 -30 L46 -30 L46 -18 L-46 -18 Z" fill="${shade(body, 0.26)}" opacity="0.85"/>
        <path d="M-46 30 L46 30" stroke="${shade(body, -0.4)}" stroke-width="1.4" opacity="0.5"/>
        <path d="M-46 4 L46 4" stroke="${shade(body, -0.2)}" stroke-width="1.2" opacity="0.4"/>
        <path d="M-46 16 L46 16" stroke="${shade(body, -0.2)}" stroke-width="1.2" opacity="0.28"/>
        ${Array.from({ length: 10 }, (_, i) =>
          `<path d="M${-44 + i * 10} -30 L${-44 + i * 10} 30" stroke="${shade(body, -0.34)}" stroke-width="0.7" opacity="0.4"/>`).join('')}
        ${Array.from({ length: 7 }, (_, i) =>
          `<path d="M-46 ${-26 + i * 9} L46 ${-26 + i * 9}" stroke="${shade(body, -0.34)}" stroke-width="0.7" opacity="0.32"/>`).join('')}
        <rect x="18" y="-24" width="22" height="12" rx="2" fill="${shade(cap, 0.3)}" opacity="0.9"/>
        ${monogram(29, -18, 11, shade(cap, -0.4), 0.6)}
      </g>
      <!-- foaming net, gathered at a drawstring -->
      <g transform="translate(138 118)">
        <ellipse cx="2" cy="3" rx="30" ry="28" fill="${shade(accent, -0.5)}" opacity="0.18"/>
        <ellipse cx="0" cy="0" rx="30" ry="28" fill="${shade(accent, 0.24)}" opacity="0.85"/>
        <clipPath id="${ids.clip}"><ellipse cx="0" cy="0" rx="30" ry="28"/></clipPath>
        <g clip-path="url(#${ids.clip})">${mesh.join('')}</g>
        <ellipse cx="0" cy="0" rx="30" ry="28" fill="none" stroke="${shade(accent, -0.42)}" stroke-width="1.6" opacity="0.85"/>
        <ellipse cx="-9" cy="-10" rx="10" ry="7" fill="#fff" opacity="0.3"/>
        <!-- gathered neck + cord loop -->
        <path d="M-11 -26 Q0 -34 11 -26 Q6 -19 0 -19 Q-6 -19 -11 -26 Z" fill="${shade(cap, 0.1)}"/>
        <path d="M-7 -30 Q0 -46 7 -30" stroke="${shade(cap, -0.16)}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <rect x="-5" y="-32" width="10" height="6" rx="3" fill="${shade(cap, -0.24)}"/>
      </g>
      <!-- suds hint -->
      <g opacity="0.5">
        <circle cx="112" cy="96" r="5" fill="#fff" opacity="0.6"/>
        <circle cx="122" cy="86" r="3.4" fill="#fff" opacity="0.5"/>
        <circle cx="104" cy="86" r="2.6" fill="#fff" opacity="0.45"/>
      </g>
    </g>`;
  },

  /* Amber glass roller bottle. */
  roller(ids, art, rand) {
    const { body, cap, accent } = art;
    return `
    ${groundShadow(ids, 100, 200, 40, 8)}
    <g>
      <!-- bottle -->
      <path d="M80 92 L80 182 Q80 194 100 194 Q120 194 120 182 L120 92 Z" fill="url(#${ids.body})"/>
      <path d="M80 92 L80 182 Q80 194 100 194 Q120 194 120 182 L120 92 Z" fill="url(#${ids.glass})"/>
      <!-- oil fill line -->
      <path d="M83 118 L83 181 Q83 191 100 191 Q117 191 117 181 L117 118 Z" fill="${shade(accent, -0.1)}" opacity="0.5"/>
      <ellipse cx="100" cy="118" rx="17" ry="4" fill="${shade(accent, 0.34)}" opacity="0.7"/>
      <!-- neck + shoulder -->
      <path d="M86 92 L86 78 L114 78 L114 92 Z" fill="${shade(body, -0.14)}"/>
      <ellipse cx="100" cy="92" rx="20" ry="5.4" fill="${shade(body, 0.16)}" opacity="0.8"/>
      <!-- cap -->
      <path d="M84 78 L84 56 Q84 50 90 50 L110 50 Q116 50 116 56 L116 78 Z" fill="url(#${ids.cap})"/>
      <ellipse cx="100" cy="54" rx="16" ry="4.6" fill="url(#${ids.capTop})"/>
      ${Array.from({ length: 11 }, (_, i) =>
        `<rect x="${85 + i * 2.9}" y="58" width="1.1" height="20" fill="${shade(cap, -0.34)}" opacity="0.34"/>`).join('')}
      <!-- label -->
      <rect x="80" y="130" width="40" height="42" fill="${shade(body, 0.56)}" opacity="0.94"/>
      <rect x="80" y="130" width="40" height="1.8" fill="${accent}" opacity="0.9"/>
      ${monogram(100, 142, 14, shade(body, -0.5), 0.7)}
      <text x="100" y="158" text-anchor="middle" font-family="Georgia, serif" font-size="7.6"
            fill="${shade(body, -0.55)}" letter-spacing="1.6">AEINDRY</text>
      <text x="100" y="167" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="4.4"
            fill="${shade(body, -0.42)}" opacity="0.66" letter-spacing="1">10 ML ROLLER</text>
      <!-- glass speculars -->
      <path d="M85 100 L85 188" stroke="#fff" stroke-width="3" opacity="0.34" stroke-linecap="round"/>
      <path d="M115 100 L115 188" stroke="#fff" stroke-width="1.6" opacity="0.2" stroke-linecap="round"/>
    </g>`;
  },

  /* Bath bomb — a pressed sphere with a botanical swirl and loose salt. */
  sphere(ids, art, rand) {
    const { body, cap, accent } = art;
    return `
    ${groundShadow(ids, 100, 194, 54, 10)}
    <g>
      <circle cx="100" cy="132" r="56" fill="url(#${ids.body})"/>
      <clipPath id="${ids.clip}"><circle cx="100" cy="132" r="56"/></clipPath>
      <g clip-path="url(#${ids.clip})">
        <!-- swirled hemispheres -->
        <path d="M44 132 Q72 96 100 132 T156 132 L156 188 L44 188 Z" fill="${shade(accent, -0.06)}" opacity="0.55"/>
        <path d="M44 152 Q76 122 100 152 T156 148 L156 188 L44 188 Z" fill="${shade(cap, -0.04)}" opacity="0.42"/>
        ${swirl(rand, accent, { x: 40, y: 88, w: 120, h: 92 }, 5)}
        ${speckles(rand, shade(cap, -0.3), { x: 50, y: 86, w: 100, h: 92 }, 26)}
        <!-- pressed seam -->
        <ellipse cx="100" cy="132" rx="56" ry="7" fill="none" stroke="${shade(body, -0.3)}" stroke-width="1.6" opacity="0.35"/>
      </g>
      <circle cx="100" cy="132" r="56" fill="none" stroke="${shade(body, -0.24)}" stroke-width="1" opacity="0.4"/>
      <!-- key light -->
      <ellipse cx="78" cy="108" rx="24" ry="17" fill="#fff" opacity="0.3" filter="url(#${ids.soft})" transform="rotate(-28 78 108)"/>
      <circle cx="72" cy="104" r="5" fill="#fff" opacity="0.5"/>
      ${monogram(100, 132, 30, shade(body, -0.4), 0.22)}
      <!-- loose salt at the base -->
      ${Array.from({ length: 16 }, () => {
        const x = 46 + rand() * 108;
        const y = 184 + rand() * 12;
        const r = 1 + rand() * 2.4;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${shade(cap, 0.4)}" opacity="${(0.35 + rand() * 0.45).toFixed(2)}"/>`;
      }).join('')}
    </g>`;
  },

  /* Amber spray bottle with a fine-mist head. */
  spray(ids, art, rand) {
    const { body, cap, accent } = art;
    return `
    ${groundShadow(ids, 100, 202, 46, 9)}
    <g>
      <!-- bottle -->
      <path d="M72 104 L72 182 Q72 196 100 196 Q128 196 128 182 L128 104 Z" fill="url(#${ids.body})"/>
      <path d="M72 104 L72 182 Q72 196 100 196 Q128 196 128 182 L128 104 Z" fill="url(#${ids.glass})"/>
      <!-- liquid -->
      <path d="M75 126 L75 181 Q75 193 100 193 Q125 193 125 181 L125 126 Z" fill="${shade(accent, -0.05)}" opacity="0.42"/>
      <ellipse cx="100" cy="126" rx="25" ry="5.4" fill="${shade(accent, 0.4)}" opacity="0.6"/>
      <!-- shoulder + neck -->
      <path d="M78 104 Q78 92 88 88 L112 88 Q122 92 122 104 Z" fill="${shade(body, -0.1)}"/>
      <rect x="88" y="76" width="24" height="14" fill="${shade(body, -0.18)}"/>
      <!-- mist head -->
      <path d="M84 76 L84 62 Q84 56 92 56 L108 56 Q116 56 116 62 L116 76 Z" fill="url(#${ids.cap})"/>
      <path d="M88 56 L88 48 Q88 44 96 44 L104 44 Q112 44 112 48 L112 56 Z" fill="${shade(cap, 0.14)}"/>
      <path d="M112 46 L128 46 L128 51 L112 51 Z" fill="${shade(cap, -0.08)}"/>
      <circle cx="129" cy="48.5" r="2.4" fill="${shade(cap, -0.3)}"/>
      <!-- mist -->
      <g opacity="0.55">
        ${Array.from({ length: 13 }, () => {
          const t = rand();
          const x = 134 + t * 46;
          const y = 48 - 16 * t + (rand() - 0.5) * 26 * t;
          const r = 0.9 + rand() * 2.4;
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${shade(accent, 0.3)}" opacity="${(0.6 - t * 0.42).toFixed(2)}"/>`;
        }).join('')}
      </g>
      <!-- label -->
      <rect x="72" y="136" width="56" height="42" fill="${shade(body, 0.56)}" opacity="0.95"/>
      <rect x="72" y="136" width="56" height="2" fill="${accent}" opacity="0.9"/>
      ${monogram(100, 149, 15, shade(body, -0.5), 0.7)}
      <text x="100" y="165" text-anchor="middle" font-family="Georgia, serif" font-size="9"
            fill="${shade(body, -0.56)}" letter-spacing="2">AEINDRY</text>
      <text x="100" y="174" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="4.6"
            fill="${shade(body, -0.42)}" opacity="0.66" letter-spacing="1.1">ROOM &amp; LINEN</text>
      <path d="M78 112 L78 190" stroke="#fff" stroke-width="3.4" opacity="0.32" stroke-linecap="round"/>
      <path d="M123 112 L123 190" stroke="#fff" stroke-width="1.6" opacity="0.18" stroke-linecap="round"/>
    </g>`;
  }
};

/**
 * Render a product illustration.
 * @param {object} product  a PRODUCTS entry
 * @param {object} [opts]   { variantId, className, animate }
 * @returns {string} SVG markup
 */
export function productArt(product, opts = {}) {
  /* A real photograph beats a generated vessel every time, so it wins whenever
     one exists. The SVG stays as the fallback rather than being deleted: the
     range is photographed in batches, and a product added next month should
     look like a product on the day it is added, not like a gap. */
  const photo = photoOf(product, opts.variantId);
  if (photo) {
    const cls = ['product-photo', opts.className].filter(Boolean).join(' ');
    /* Not every source is big enough for the same tiers. A `w` descriptor the
       file does not match makes the browser pick the wrong one, so the widths
       are read off the catalogue rather than assumed. */
    const widths = photoWidthsOf(product, opts.variantId);
    const largest = widths[widths.length - 1];
    const at = (w) => asset(`assets/img/products/${photo}-${w}.webp`);
    return `<img class="${cls}" src="${at(largest)}"
      srcset="${widths.map((w) => `${at(w)} ${w}w`).join(', ')}"
      sizes="(max-width: 760px) 46vw, 320px"
      width="${largest}" height="${largest}" loading="lazy" decoding="async"
      alt="${escapeAttr(product.name)}">`;
  }

  const art = { ...product.art };
  // A chosen variant re-tints the accent so the artwork tracks the scent.
  if (opts.variantId) {
    const v = product.variants?.find((x) => x.id === opts.variantId);
    if (v?.swatch) art.accent = v.swatch;
  }
  const ids = {
    body: nextId(), cap: nextId(), top: nextId(), capTop: nextId(),
    glass: nextId(), accent: nextId(), shadow: nextId(),
    soft: nextId(), grain: nextId(), clip: nextId()
  };
  const rand = seeded(product.id + (opts.variantId || ''));
  const form = FORMS[art.form] || FORMS.tin;
  const cls = ['product-art', opts.className].filter(Boolean).join(' ');

  return `<svg class="${cls}" viewBox="0 0 200 240" role="img"
     aria-label="${escapeAttr(product.name)} — illustration"
     xmlns="http://www.w3.org/2000/svg">
    ${scene(ids, art)}
    ${form(ids, art, rand)}
  </svg>`;
}

/** Tint pair for a product's card/media background. */
export const artTint = (product) => product.art.tint;
export const artAccent = (product, variantId) => {
  const v = variantId && product.variants?.find((x) => x.id === variantId);
  return v?.swatch || product.art.accent;
};

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ============================================================
   Decorative botanicals — used as page ornament, not product art
   ============================================================ */
export const BOTANICALS = {
  leaf: `<path d="M12 2C7 6 3 11 3 16c0 4 3 6 6 6 6 0 9-7 9-13 0-3-2-6-6-7Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M11 22C11 16 12 9 16 4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`,
  sprig: `<path d="M12 22V4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M12 8c-3-2-5-1-6-3 2-1 5-1 6 1M12 13c3-2 5-1 6-3-2-1-5-1-6 1M12 18c-3-2-5-1-6-3 2-1 5-1 6 1" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`,
  drop: `<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
  flask: `<path d="M9 3h6M10 3v6l-5 9a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-9V3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M7 15h10" stroke="currentColor" stroke-width="1.2"/>`,
  shield: `<path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  hand: `<path d="M9 11V5a1.5 1.5 0 0 1 3 0v6m0-1V4a1.5 1.5 0 0 1 3 0v7m0-2a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 15a1.6 1.6 0 0 1 2.5-2L9 15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>`,
  sun: `<circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,
  moon: `<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
  star: `<path d="m12 3 2.6 6 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.2 1.4-6.3L3 9.6 9.4 9 12 3Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
  bolt: `<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
  circle: `<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" stroke-width="1.3"/>`
};

export const botanical = (name, cls = '') =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none">${BOTANICALS[name] || BOTANICALS.leaf}</svg>`;

/** The brand monogram, as a standalone mark. */
export const brandMark = (cls = '') => `
<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true" fill="none">
  <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="1.3" opacity="0.32"/>
  <path d="M13 32 24 11l11 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18.4 26.4h11.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M24 36c-3.6-2.4-5-5-5-8 0 0 2.6 1.4 5 4.6 2.4-3.2 5-4.6 5-4.6 0 3-1.4 5.6-5 8Z"
        fill="currentColor" opacity="0.5"/>
</svg>`;
