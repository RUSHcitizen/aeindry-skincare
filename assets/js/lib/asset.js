/**
 * Resolve an asset path to something the page can actually load.
 *
 * Served from a directory — the dev server, a static host, the repo — a path
 * is already the answer, and this returns it unchanged. The single-file
 * artifact has no directory to fetch from: the build inlines every image as a
 * data URI and leaves the map on `globalThis.__AEINDRY_ASSETS__`, and anything
 * in it wins.
 *
 * The indirection exists because product photographs are addressed by name at
 * runtime — `assets/img/products/${photo}-900.webp` — so the path never appears
 * whole in the bundled source for the build to find and rewrite. Every other
 * image is a literal in the markup and gets rewritten in place; those go
 * through here too, so there is one rule rather than two.
 */
export const asset = (path) => globalThis.__AEINDRY_ASSETS__?.[path] || path;
