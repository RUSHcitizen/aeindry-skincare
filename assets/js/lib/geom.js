/**
 * Vector primitives shared by the illustration engines.
 *
 * Both the botanical engine (stroked and washed sprigs living behind sections)
 * and the floral backdrop (soft filled blooms behind the whole site) build
 * their shapes out of the same handful of constructions: an axis-and-width
 * blade, a bowed cubic stem, and points sampled along it. They were written
 * once for the botanicals; keeping one copy means a leaf is a leaf everywhere.
 */

/** Deterministic PRNG — the same seed draws the same plant on every load. */
export function seeded(seed) {
  let h = 2166136261;
  const str = String(seed);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
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

export const n = (v) => Math.round(v * 100) / 100;
export const rad = (deg) => (deg * Math.PI) / 180;
export const pt = (x, y) => ({ x, y });
export const add = (a, b) => pt(a.x + b.x, a.y + b.y);
export const scale = (v, k) => pt(v.x * k, v.y * k);
export const dir = (deg, len) => pt(Math.cos(rad(deg)) * len, Math.sin(rad(deg)) * len);
export const perp = (v) => pt(-v.y, v.x);
export const norm = (v) => {
  const m = Math.hypot(v.x, v.y) || 1;
  return pt(v.x / m, v.y / m);
};

/**
 * A leaf or petal built along an axis.
 * `bulge` moves the widest point along the axis (0.5 = a lens, 0.35 = a leaf
 * that is fattest near the base), `tip` rounds or sharpens the end.
 */
export function blade(base, tip_, width, { bulge = 0.42, tip = 0, curl = 0 } = {}) {
  const axis = pt(tip_.x - base.x, tip_.y - base.y);
  const p = perp(norm(axis));
  const curled = add(tip_, scale(p, curl));

  const c1 = add(add(base, scale(axis, bulge * 0.55)), scale(p, width));
  const c2 = add(add(base, scale(axis, 1 - (1 - bulge) * 0.35)), scale(p, width * (0.62 + tip)));
  const c3 = add(add(base, scale(axis, 1 - (1 - bulge) * 0.35)), scale(p, -width * (0.62 + tip)));
  const c4 = add(add(base, scale(axis, bulge * 0.55)), scale(p, -width));

  return `M${n(base.x)} ${n(base.y)}`
    + `C${n(c1.x)} ${n(c1.y)} ${n(c2.x)} ${n(c2.y)} ${n(curled.x)} ${n(curled.y)}`
    + `C${n(c3.x)} ${n(c3.y)} ${n(c4.x)} ${n(c4.y)} ${n(base.x)} ${n(base.y)}Z`;
}

/** Central vein, drawn slightly short of the tip so it reads as a drawing. */
export function midrib(base, tip_, curl = 0) {
  const axis = pt(tip_.x - base.x, tip_.y - base.y);
  const p = perp(norm(axis));
  const mid = add(add(base, scale(axis, 0.5)), scale(p, curl * 0.5));
  const end = add(base, scale(axis, 0.9));
  return `M${n(base.x)} ${n(base.y)}Q${n(mid.x)} ${n(mid.y)} ${n(end.x)} ${n(end.y)}`;
}

/** A stem as a single cubic, bowed by `bow` perpendicular to its run. */
export function stem(from, to, bow = 0.18) {
  const { c1, c2 } = stemControls(from, to, bow);
  return `M${n(from.x)} ${n(from.y)}C${n(c1.x)} ${n(c1.y)} ${n(c2.x)} ${n(c2.y)} ${n(to.x)} ${n(to.y)}`;
}

function stemControls(from, to, bow) {
  const axis = pt(to.x - from.x, to.y - from.y);
  const p = perp(norm(axis));
  const len = Math.hypot(axis.x, axis.y);
  return {
    c1: add(add(from, scale(axis, 0.3)), scale(p, len * bow)),
    c2: add(add(from, scale(axis, 0.72)), scale(p, len * bow * 0.72))
  };
}

/** Point along that same cubic, so leaves attach exactly on the stem. */
export function alongStem(from, to, bow, t) {
  const { c1, c2 } = stemControls(from, to, bow);
  const u = 1 - t;
  return pt(
    u * u * u * from.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * to.x,
    u * u * u * from.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * to.y
  );
}

/** Tangent angle at t, so a leaf sits at a believable angle to the stem. */
export function stemAngle(from, to, bow, t) {
  const a = alongStem(from, to, bow, Math.max(0, t - 0.02));
  const b = alongStem(from, to, bow, Math.min(1, t + 0.02));
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}
