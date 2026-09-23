#!/usr/bin/env node
/**
 * Catalogue integrity.
 *
 * The catalogue is referenced by id from six other places — routines, scent
 * matches, sets, the home shelf, the ingredient encyclopedia — and a stale id
 * does not throw. It renders an empty card, a routine step with no product, a
 * quiz that recommends nothing. All of that looks like a styling bug and gets
 * filed as one.
 *
 * So: fail the build instead. Every reference is resolved here, and every
 * photograph a product claims is checked to actually exist on disk.
 *
 *   node tools/check-catalogue.mjs
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { PRODUCTS, SETS, CATEGORIES, CATALOGUE_ORDER, getProduct, setPricing,
        photoWidthsOf, PHOTO_SHAPES, photoShape, shelvesOf } =
  await import(join(root, 'assets/js/data/products.js'));
const { ROUTINES, SCENT_MATCHES, INGREDIENTS, INGREDIENT_FAMILIES,
        SCENT_PROFILES, SCENT_QUIZ, CONCERNS } =
  await import(join(root, 'assets/js/data/content.js'));

const problems = [];
const note = [];
const fail = (where, what) => problems.push(`${where}: ${what}`);

/* ── every referenced product exists ─────────────────────────────────────── */
const known = new Set(PRODUCTS.map((p) => p.id));
const checkRef = (where, productId, variantId) => {
  const p = getProduct(productId);
  if (!p) return fail(where, `unknown product "${productId}"`);
  if (variantId) {
    if (!p.variants?.some((v) => v.id === variantId)) {
      fail(where, `"${productId}" has no variant "${variantId}"`);
    }
  } else if (p.variants?.length) {
    // Not an error — the first variant is chosen — but worth knowing about.
    note.push(`${where}: "${productId}" referenced without a variant`);
  }
};

for (const [key, r] of Object.entries(ROUTINES)) {
  if (!r.steps?.length) fail(`ROUTINES.${key}`, 'no steps');
  r.steps?.forEach((s, i) => checkRef(`ROUTINES.${key}[${i}]`, s.productId, s.variantId));
}
for (const [family, picks] of Object.entries(SCENT_MATCHES)) {
  picks.forEach(([pid, vid], i) => checkRef(`SCENT_MATCHES.${family}[${i}]`, pid, vid));
}
for (const set of SETS) {
  if (!set.lines?.length) fail(`SETS.${set.id}`, 'no lines');
  set.lines?.forEach((l, i) => checkRef(`SETS.${set.id}[${i}]`, l.productId, l.variantId));
  const { full, price } = setPricing(set);
  if (price <= 0) fail(`SETS.${set.id}`, `saving ${set.saving} wipes out a full price of ${full}`);
  if (set.saving >= full * 0.5) fail(`SETS.${set.id}`, `saving ${set.saving} is over half of ${full}`);
}
for (const ing of INGREDIENTS) {
  (ing.foundIn || []).forEach((pid) => {
    if (!known.has(pid)) fail(`INGREDIENTS.${ing.id}.foundIn`, `unknown product "${pid}"`);
  });
}

/* ── every keyIngredient has an encyclopedia entry ───────────────────────── */
/* A product naming an ingredient the library has never heard of does not throw:
   the detail panel just renders one fewer link, and the entry is quietly
   missing from the explorer. Nine of these had accumulated before anyone
   noticed. */
const ingredientIds = new Set(INGREDIENTS.map((i) => i.id));
for (const p of PRODUCTS) {
  (p.keyIngredients || []).forEach((k) => {
    if (!ingredientIds.has(k)) {
      fail(`PRODUCTS.${p.id}.keyIngredients`, `no encyclopedia entry for "${k}"`);
    }
  });
}
const familyIds = new Set(INGREDIENT_FAMILIES.map((f) => f.id));
for (const i of INGREDIENTS) {
  if (!familyIds.has(i.family)) {
    fail(`INGREDIENTS.${i.id}`, `family "${i.family}" is not in INGREDIENT_FAMILIES`);
  }
}

/* ── categories nest at most one level, and every parent exists ──────────── */
const catIds = new Set(CATEGORIES.map((c) => c.id));
for (const c of CATEGORIES) {
  if (!c.parent) continue;
  if (!catIds.has(c.parent)) fail(`CATEGORIES.${c.id}`, `unknown parent "${c.parent}"`);
  const gp = CATEGORIES.find((x) => x.id === c.parent);
  if (gp?.parent) fail(`CATEGORIES.${c.id}`, 'nests more than one level deep');
}
for (const p of PRODUCTS) {
  if (!catIds.has(p.category)) fail(`PRODUCTS.${p.id}`, `unknown category "${p.category}"`);
}

/* ── scent families and concerns line up in both directions ──────────────── */
const stocked = new Set(PRODUCTS.flatMap((p) => p.scentFamily || []));
const profiled = new Set(Object.keys(SCENT_PROFILES));
for (const f of stocked) {
  if (!profiled.has(f)) fail('SCENT_PROFILES', `no profile for family "${f}"`);
}
for (const f of profiled) {
  // A filter chip or a quiz result that lands on an empty shelf.
  if (!stocked.has(f)) fail('SCENT_PROFILES', `family "${f}" has no products in it`);
  if (!SCENT_MATCHES[f]?.length) fail('SCENT_MATCHES', `family "${f}" has no matches`);
}
for (const q of SCENT_QUIZ) {
  for (const o of q.options) {
    for (const k of Object.keys(o.weights)) {
      if (!profiled.has(k)) fail(`SCENT_QUIZ.${q.id}`, `weights an unknown family "${k}"`);
    }
  }
}
const concerns = new Set(CONCERNS.map((c) => c.id));
for (const p of PRODUCTS) {
  (p.concerns || []).forEach((c) => {
    if (!concerns.has(c)) fail(`PRODUCTS.${p.id}.concerns`, `unknown concern "${c}"`);
  });
}
for (const s of SETS) {
  if (s.concern && !concerns.has(s.concern)) fail(`SETS.${s.id}`, `unknown concern "${s.concern}"`);
}
for (const c of concerns) {
  if (!ROUTINES[c]) fail('ROUTINES', `no routine for concern "${c}"`);
}

/* ── every claimed photograph is on disk ─────────────────────────────────── */
const dir = join(root, 'assets/img/products');
const files = existsSync(dir) ? new Set(readdirSync(dir)) : new Set();

/* The width and height of a WebP, read off its header.
 *
 * The catalogue declares the shape of every photograph that is not square so
 * the markup can reserve the right box. A declaration nobody checks drifts the
 * first time a file is re-cut, and the failure it causes — a page that settles
 * downwards as the image lands — is the kind nobody files a bug about. So it is
 * checked against the file. */
const webpSize = (file) => {
  const b = readFileSync(join(dir, file));
  if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF') return null;
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { w: (b.readUIntLE(24, 3) + 1), h: (b.readUIntLE(27, 3) + 1) };
  if (chunk === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const n = b.readUInt32LE(21);
    return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 };
  }
  return null;
};

const wantPhoto = (where, name, widths) => {
  if (!name) return;
  for (const w of widths) {
    const file = `${name}-${w}.webp`;
    if (!files.has(file)) { fail(where, `missing image ${file}`); continue; }
    const real = webpSize(file);
    if (!real) continue;
    const want = photoShape(name, w);
    /* One pixel of slack each way: a downscale rounds, and a 1236-tall source
       asked for 480 wide lands on 659 or 660 depending on which way. */
    if (Math.abs(real.w - want.width) > 1 || Math.abs(real.h - want.height) > 1) {
      fail(where, `${file} is ${real.w}x${real.h}, but the catalogue says `
        + `${want.width}x${want.height}`
        + (PHOTO_SHAPES[name] ? '' : ' (nothing declared, so square is assumed)'));
    }
  }
};
for (const p of PRODUCTS) {
  wantPhoto(`PRODUCTS.${p.id}.photo`, p.photo, photoWidthsOf(p));
  (p.heroPhotos || []).forEach((h, i) =>
    wantPhoto(`PRODUCTS.${p.id}.heroPhotos[${i}]`, h, photoWidthsOf(p)));
  (p.variants || []).forEach((v) =>
    wantPhoto(`PRODUCTS.${p.id}.${v.id}.photo`, v.photo, photoWidthsOf(p, v.id)));
  if (!p.photo) note.push(`PRODUCTS.${p.id}: no photograph — falls back to generated art`);
  if (typeof p.price !== 'number' || p.price <= 0) fail(`PRODUCTS.${p.id}`, 'price is not a positive number');
}

/* ── prices that are still placeholders ──────────────────────────────────── */
const pending = PRODUCTS.filter((p) => p.pricePending);
if (pending.length) {
  note.push('');
  note.push(`${pending.length} product(s) still carry a placeholder price — set these before selling:`);
  for (const p of pending) note.push(`  ${p.id.padEnd(28)} $${p.price}   ${p.name}`);
}

/* ── sizes nobody has given ──────────────────────────────────────────────── */
const sized = PRODUCTS.filter((p) => p.sizePending);
if (sized.length) {
  note.push('');
  note.push(`${sized.length} product(s) carry a guessed size — a guess the shop quotes `
    + 'postage from, so replace these:');
  for (const p of sized) note.push(`  ${p.id.padEnd(28)} ${String(p.weight).padEnd(16)} ${p.name}`);
}

/* ── the shop's running order ────────────────────────────────────────────────
   ORDER is the owner's, given rather than derived, and it lives apart from the
   entries it orders. That is what makes it worth checking: the two can drift
   without anything looking wrong, and the symptom — a product quietly at the
   bottom of the shop — is not one anybody reports. */
{
  const ids = new Set(PRODUCTS.map((p) => p.id));
  const seen = new Set();
  for (const id of CATALOGUE_ORDER) {
    if (!ids.has(id)) fail('ORDER', `names a product that does not exist: "${id}"`);
    if (seen.has(id)) fail('ORDER', `names "${id}" twice`);
    seen.add(id);
  }
  for (const p of PRODUCTS) {
    if (!seen.has(p.id)) {
      fail(`PRODUCTS.${p.id}`, 'is not in ORDER, so it falls to the bottom of the shop');
    }
  }
}

/* ── every shelf a product names must exist, and must be a real shelf ────── */
{
  const known = new Map(CATEGORIES.map((c) => [c.id, c]));
  for (const p of PRODUCTS) {
    for (const id of shelvesOf(p)) {
      if (!known.has(id)) fail(`PRODUCTS.${p.id}`, `unknown category "${id}"`);
      else if (id === 'all') fail(`PRODUCTS.${p.id}`, '"all" is not a shelf to file on');
    }
    if (new Set(shelvesOf(p)).size !== shelvesOf(p).length) {
      fail(`PRODUCTS.${p.id}`, 'names the same shelf twice');
    }
    const home = known.get(p.category);
    if (home && p.categoryLabel !== home.label) {
      fail(`PRODUCTS.${p.id}`,
        `categoryLabel is "${p.categoryLabel}" but category "${p.category}" is "${home.label}"`);
    }
  }
  /* A shelf with nothing on it is a sign pointing at an empty aisle. */
  for (const c of CATEGORIES) {
    if (c.id === 'all') continue;
    const under = [c.id, ...CATEGORIES.filter((x) => x.parent === c.id).map((x) => x.id)];
    if (!PRODUCTS.some((p) => shelvesOf(p).some((s) => under.includes(s)))) {
      fail('CATEGORIES', `"${c.id}" has no products on it`);
    }
    if (c.parent && known.get(c.parent)?.parent) {
      fail('CATEGORIES', `"${c.id}" is nested two levels deep; the shop renders one`);
    }
  }
}

/* ── report ──────────────────────────────────────────────────────────────── */
console.log(`catalogue: ${PRODUCTS.length} products, ${SETS.length} sets, ` +
  `${Object.keys(ROUTINES).length} routines, ${profiled.size} scent families`);
if (note.length) console.log('\n' + note.join('\n'));
if (problems.length) {
  console.error(`\nFATAL — ${problems.length} broken reference(s):`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log('\nall references resolve, all photographs present.');
