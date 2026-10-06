/* variety.js — choosing a varied set of scenario candidates (1.5.5).

   The problem this solves. Batch scenarios builds every combination of a threat pattern, an asset and
   a threat source, ranks each one by pattern likelihood × asset criticality × source fit, and takes
   the top N. Ranking alone produces a list with no variety: the pattern prior is the same for every
   asset, crown jewels all weigh exactly 1.0, so the strongest pattern ties with itself across the
   whole inventory and fills the list — "phishing × asset 1, phishing × asset 2, phishing × asset 3…".
   Twenty candidates that are one threat wearing twenty hats are not twenty candidates.

   What it does instead. It still prefers the combinations that rank highest, but it spreads them: each
   time it picks one, that pattern and that asset become less attractive for the next pick, so the set
   walks across the grid rather than down one column. A small seeded jitter breaks the remaining ties,
   which is what makes a second run look different from the first.

   Why seeded and not simply random. A figure in a report has to be re-derivable. The seed is shown
   beside the result and kept with the workspace, so the same seed reproduces the same candidates
   exactly, and Reshuffle is an explicit act with a visible new seed — the same discipline Forecasts
   uses for its Monte Carlo runs.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

/** mulberry32 — the same small generator the forecaster uses, kept here so this module needs nothing. */
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const newSeed = () => (Math.floor(Math.random() * 1e9) >>> 0) || 1;

/** A number in [0,1) from a seed and a key — stable, and independent of any order of evaluation. */
export function hash01(seed, key) {
  let h = (seed >>> 0) ^ 0x9e3779b9;
  const str = String(key);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  // one more round of mixing, so neighbouring keys ("x|1", "x|2") do not land next to each other
  h ^= h >>> 16; h = Math.imul(h, 0x7feb352d) >>> 0;
  h ^= h >>> 15; h = Math.imul(h, 0x846ca68b) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** How much a repeated pattern or asset is held back. 0 = rank only (the 1.5.4 behaviour). */
export const PENALTY = { pattern: 1.0, asset: 0.7, source: 0.35 };
/** How much seeded noise breaks ties, as a fraction of the score. Enough to vary, too little to
    promote a weak combination over a clearly stronger one. */
export const JITTER = 0.18;

/**
 * Pick `n` items spread across their dimensions.
 *
 * @param items  [{ key, rank, dims: {pattern, asset, source} }]  rank > 0, higher is better
 * @param n      how many to pick
 * @param seed   integer; the same seed gives the same answer
 * @param opts   { penalty, jitter } to override the constants above
 * @returns      the chosen items, in the order they were picked
 *
 * The score of a candidate is its rank divided by (1 + penalty × times that value has been used
 * already) for each dimension, times a seeded factor. Division, not subtraction, so a pattern that is
 * twice as likely still wins its second slot against a weak pattern's first — variety is a preference,
 * not a quota.
 */
export function spread(items, n, seed = 1, opts = {}) {
  const pen = { ...PENALTY, ...(opts.penalty || {}) };
  const jit = opts.jitter === undefined ? JITTER : opts.jitter;
  // The jitter of an item is derived from its own key and the seed, not from a sequence of draws, so
  // the answer depends on the seed alone and not on the order the candidates happen to arrive in.
  // (A run of rand() calls would reshuffle everything when a pattern is ticked in a different order.)
  const noise = new Map(items.map((it, i) => [it, 1 + (hash01(seed, it.key ?? i) - 0.5) * 2 * jit]));
  const used = { pattern: new Map(), asset: new Map(), source: new Map() };
  const left = new Set(items);
  const out = [];
  const take = Math.max(0, Math.min(n, items.length));
  while (out.length < take) {
    let best = null, bestScore = -1;
    for (const it of left) {
      let s = it.rank * noise.get(it);
      for (const d of ['pattern', 'asset', 'source']) {
        const v = it.dims?.[d];
        if (v === undefined || v === null) continue;
        s /= 1 + pen[d] * (used[d].get(v) || 0);
      }
      if (s > bestScore) { bestScore = s; best = it; }
    }
    if (!best) break;
    left.delete(best);
    out.push(best);
    for (const d of ['pattern', 'asset', 'source']) {
      const v = best.dims?.[d];
      if (v !== undefined && v !== null) used[d].set(v, (used[d].get(v) || 0) + 1);
    }
  }
  return out;
}

/** How varied a chosen set is, for the line shown under the button: distinct values per dimension. */
export function coverage(chosen) {
  const d = { pattern: new Set(), asset: new Set(), source: new Set() };
  for (const it of chosen) for (const k of ['pattern', 'asset', 'source']) {
    const v = it.dims?.[k]; if (v !== undefined && v !== null) d[k].add(v);
  }
  return { patterns: d.pattern.size, assets: d.asset.size, sources: d.source.size,
           /** The largest share one pattern takes. 1.0 means every candidate is the same pattern. */
           topPatternShare: share(chosen, 'pattern') };
}
function share(chosen, dim) {
  if (!chosen.length) return 0;
  const c = new Map();
  for (const it of chosen) { const v = it.dims?.[dim]; if (v != null) c.set(v, (c.get(v) || 0) + 1); }
  return Math.max(0, ...c.values()) / chosen.length;
}
