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
import { readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { PRODUCTS, SETS, getProduct, setPricing, photoWidthsOf } =
  await import(join(root, 'assets/js/data/products.js'));
const { ROUTINES, SCENT_MATCHES, INGREDIENTS, SCENT_PROFILES, SCENT_QUIZ, CONCERNS } =
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
const wantPhoto = (where, name, widths) => {
  if (!name) return;
  for (const w of widths) {
    if (!files.has(`${name}-${w}.webp`)) fail(where, `missing image ${name}-${w}.webp`);
  }
};
for (const p of PRODUCTS) {
  wantPhoto(`PRODUCTS.${p.id}.photo`, p.photo, photoWidthsOf(p));
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
