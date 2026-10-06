/* forecast.js — Monte Carlo risk forecasts and KRI projection (1.5.1).

   No AI and no new risk formula. Every trial goes through the verified engine (CRG.calc); this module
   only decides what to feed it and how to summarize what comes back.

   What a forecast is, and is not. A Monte Carlo interval here is a statement about the ranges the
   analyst entered, propagated through the CRG model. It is not a statement about the world, and it
   does not become more true by having ten thousand trials behind it. Where the ranges are guesses,
   the interval is a picture of those guesses. The screens say so, and forecasts are shown apart from
   the calculated results so one is never mistaken for the other.

   Reproducibility: every run is seeded, so the same workspace, seed and trial count give the same
   numbers and a figure can be cited and re-derived.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S } from './state.js';
import { status as kriStatus } from './kri.js';

export const PARAMS = [
  ['PbA', 'Pb(A)', 'threat present'],
  ['Pbx', 'Pb(ψ,A)', 'exploitation'],
  ['De', 'δe', 'expected damage'],
  ['Dm', 'δm', 'maximum damage'],
  ['Th', 'θ', 'resilience'],
  ['Mu', 'μ(E)', 'criticality'],
];
export const DISTS = [
  ['triangular', 'Triangular', 'Most weight on the likely value, falling linearly to the bounds. The default: it needs only the three numbers an analyst can actually state.'],
  ['uniform', 'Uniform', 'Every value between the bounds equally likely. Honest when you know the range but have no view inside it.'],
  ['pert', 'PERT', 'A smoother triangular, with four times the weight on the likely value. Narrower tails.'],
];

/* ---------------- seeded random ---------------- */
/** mulberry32: small, fast and reproducible. Statistical quality is ample for this purpose. */
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/** One draw from a three-point distribution. */
export function draw(u, { min, likely, max, dist }) {
  if (!(max > min)) return likely;
  if (dist === 'uniform') return min + u * (max - min);
  if (dist === 'pert') {
    // Beta(α, β) on [min, max] with λ = 4, approximated by averaging four uniforms shaped to the mode.
    const a = 1 + 4 * (likely - min) / (max - min);
    const b = 1 + 4 * (max - likely) / (max - min);
    return min + betaInv(u, a, b) * (max - min);
  }
  const c = (likely - min) / (max - min);
  return u < c ? min + Math.sqrt(u * (max - min) * (likely - min))
               : max - Math.sqrt((1 - u) * (max - min) * (max - likely));
}

/** Inverse beta by bisection — slower than a closed form, but exact enough and dependency-free. */
function betaInv(u, a, b) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    (betaCdf(m, a, b) < u) ? (lo = m) : (hi = m);
  }
  return (lo + hi) / 2;
}
function betaCdf(x, a, b) {
  // regularized incomplete beta by its continued fraction
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;
  let f = 1, c = 1, d = 0;
  for (let i = 0; i <= 200; i++) {
    const m = Math.floor(i / 2);
    const num = i === 0 ? 1
      : i % 2 === 0 ? (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m))
                    : -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + num * d; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d;
    c = 1 + num / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    const cd = c * d; f *= cd;
    if (Math.abs(1 - cd) < 1e-10) break;
  }
  const r = front * (f - 1);
  return a + 1 > (a + b + 2) * x ? r : 1 - betaCdf(1 - x, b, a);
}
function lgamma(z) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091,
             -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = z, y = z, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += g[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/* ---------------- ranges ---------------- */

const val = x => (x && typeof x === 'object' ? x.v : x);

/** The default range is the point value itself, so an untouched workspace forecasts to its own numbers. */
export function blankRange(v) { return { min: v, likely: v, max: v, dist: 'triangular' }; }

/** Ranges for one scenario: what the analyst set, falling back to the point values. */
export function rangesFor(s) {
  const out = {};
  for (const [k] of PARAMS) {
    const v = Number(val(s.params[k]));
    const r = s.ranges?.[k];
    out[k] = r ? { min: Number(r.min ?? v), likely: Number(r.likely ?? v), max: Number(r.max ?? v), dist: r.dist || 'triangular' }
               : blankRange(v);
  }
  for (const k of ['red_p', 'red_i']) {
    const v = Number(s[k]) || 0;
    const r = s.ranges?.[k];
    out[k] = r ? { min: Number(r.min ?? v), likely: Number(r.likely ?? v), max: Number(r.max ?? v), dist: r.dist || 'triangular' }
               : blankRange(v);
  }
  return out;
}

export const hasRanges = s => !!s.ranges && Object.values(s.ranges).some(r => r && r.max > r.min);

/**
 * Propose ranges from the confidence already recorded against each parameter.
 * A transparent rule, not a model: Low confidence widens by ±0.15, Medium by ±0.10, High by ±0.05,
 * clamped to the parameter's own limits. An analytical estimate that needs validation like any other.
 */
export const WIDTH = { Low: 0.15, Medium: 0.10, High: 0.05 };
export function proposeRanges(s) {
  const out = {};
  for (const [k] of PARAMS) {
    const p = s.params[k];
    const v = Number(val(p));
    const w = WIDTH[p?.conf] ?? WIDTH.Medium;
    const lo = k === 'Th' ? 0.05 : 0;                      // θ must stay in (0, 1]
    out[k] = { min: +clamp(v - w, lo, 1).toFixed(3), likely: v, max: +clamp(v + w, lo, 1).toFixed(3), dist: 'triangular' };
  }
  for (const k of ['red_p', 'red_i']) {
    const v = Number(s[k]) || 0;
    const w = WIDTH.Medium;
    out[k] = { min: +clamp(v - w, 0, 1).toFixed(3), likely: v, max: +clamp(v + w, 0, 1).toFixed(3), dist: 'triangular' };
  }
  return out;
}

/* ---------------- statistics ---------------- */

const quantile = (sorted, q) => {
  if (!sorted.length) return NaN;
  const i = (sorted.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
};
export function summarize(values) {
  const v = values.slice().sort((a, b) => a - b);
  const mean = v.reduce((a, b) => a + b, 0) / (v.length || 1);
  return { n: v.length, mean, min: v[0], max: v[v.length - 1],
           p05: quantile(v, 0.05), p10: quantile(v, 0.10), p50: quantile(v, 0.50),
           p90: quantile(v, 0.90), p95: quantile(v, 0.95) };
}

/* ---------------- the run ---------------- */

/**
 * Monte Carlo over the included scenarios.
 *
 * The CVSS score is resolved once per scenario and passed as a number: re-parsing the vector on every
 * trial is some forty times slower and changes nothing, since CVSS is not among the sampled parameters.
 * Work is done in chunks so the interface can paint a progress bar without a worker.
 */
export async function run(ws = S.ws, { trials = 10000, seed = 20261004, ids = null, onProgress = null, chunk = 500 } = {}) {
  const A = ws.assessment, app = A.APPETITE, fac = A.FACTOR;
  const excluded = new Set(ws.excluded || []);
  const scen = A.SCEN.filter(s => (ids ? ids.includes(s.id) : !excluded.has(s.id)));
  if (!scen.length) throw new Error('No scenario is included in the forecast.');

  const prep = scen.map(s => {
    const cvss = CRG.calc(s, app, fac).cvss;                 // resolve once, then reuse
    return { s, cvss, r: rangesFor(s),
             base: { id: s.id, params: {}, red_p: 0, red_i: 0, cvss_score: cvss } };
  });

  const perScen = prep.map(() => []);
  const portfolio = [], portfolioRatio = [];
  let above = 0;
  const rand = rng(seed);

  for (let t = 0; t < trials; t++) {
    let totRes = 0, totTol = 0;
    for (let i = 0; i < prep.length; i++) {
      const { r, base } = prep[i];
      for (const [k] of PARAMS) base.params[k] = draw(rand(), r[k]);
      if (!(base.params.Th > 0)) base.params.Th = 0.05;
      base.red_p = clamp(draw(rand(), r.red_p), 0, 1);
      base.red_i = clamp(draw(rand(), r.red_i), 0, 1);
      const out = CRG.calc(base, app, fac);
      perScen[i].push(out.res);
      totRes += out.res; totTol += out.tol;
    }
    portfolio.push(totRes);
    const ratio = totTol ? totRes / totTol : NaN;
    portfolioRatio.push(ratio);
    if (ratio > 1.10) above++;
    if (onProgress && (t % chunk === chunk - 1)) {
      onProgress((t + 1) / trials);
      await new Promise(r => setTimeout(r, 0));             // let the page paint
    }
  }

  const rows = prep.map(({ s }, i) => {
    const stat = summarize(perScen[i]);
    const point = CRG.calc(s, app, fac);
    const overTol = perScen[i].filter(v => v / point.tol > 1.10).length / trials;
    return { id: s.id, name: s.name || s.id, point: point.res, tol: point.tol,
             pointRatio: point.ratio, stat, pAbove: overTol,
             ranged: hasRanges(s) };
  });

  return {
    trials, seed, appetite: app, factor: fac, when: new Date().toISOString(),
    scenarios: rows,
    portfolio: summarize(portfolio),
    ratio: summarize(portfolioRatio),
    pAboveTolerance: above / trials,
    pointTotal: rows.reduce((t, r) => t + r.point, 0),
    anyRanges: rows.some(r => r.ranged),
  };
}

/* ---------------- tornado ---------------- */

/**
 * One-at-a-time sensitivity: hold every parameter at its likely value and sweep one across its range.
 * The span of residual risk that produces is what the chart orders by. Deliberately not derived from
 * the Monte Carlo sample — a driver chart should answer "what if this one were wrong", which is a
 * different question from "how do they vary together".
 */
export function tornado(ws = S.ws, id) {
  const A = ws.assessment;
  const s = A.SCEN.find(x => x.id === id);
  if (!s) throw new Error('Scenario ' + id + ' not found.');
  const cvss = CRG.calc(s, A.APPETITE, A.FACTOR).cvss;
  const r = rangesFor(s);
  const mk = over => {
    const b = { id: s.id, params: {}, red_p: r.red_p.likely, red_i: r.red_i.likely, cvss_score: cvss };
    for (const [k] of PARAMS) b.params[k] = r[k].likely;
    Object.assign(b, over.at ? {} : {});
    return b;
  };
  const baseline = CRG.calc(mk({}), A.APPETITE, A.FACTOR).res;
  const keys = [...PARAMS.map(p => p[0]), 'red_p', 'red_i'];
  const bars = [];
  for (const k of keys) {
    if (!(r[k].max > r[k].min)) continue;
    const at = v => {
      const b = mk({});
      if (k === 'red_p' || k === 'red_i') b[k] = v; else b.params[k] = (k === 'Th' ? Math.max(0.05, v) : v);
      return CRG.calc(b, A.APPETITE, A.FACTOR).res;
    };
    const lo = at(r[k].min), hi = at(r[k].max);
    bars.push({ key: k, label: (PARAMS.find(p => p[0] === k) || [k, k])[1],
                low: Math.min(lo, hi), high: Math.max(lo, hi), span: Math.abs(hi - lo),
                range: r[k] });
  }
  bars.sort((a, b) => b.span - a.span);
  return { baseline, bars };
}

/* ---------------- KRI projection ---------------- */

/**
 * Project one indicator forward by ordinary least squares on its own history.
 *
 * Returns a prediction interval, not a confidence interval: the question is where the next *reading*
 * will fall, not where the trend line sits. With fewer than four readings it refuses rather than
 * drawing a flattering line through three dots.
 */
export const MIN_POINTS = 4;
export function projectKri(def, pts, { horizonDays = 90, today = new Date() } = {}) {
  if (!pts || pts.length < MIN_POINTS)
    return { ok: false, n: pts?.length || 0,
             reason: `Only ${pts?.length || 0} reading${pts?.length === 1 ? '' : 's'}. At least ${MIN_POINTS} are needed before a projection means anything.` };

  const t0 = +new Date(pts[0].x);
  const xs = pts.map(p => (+new Date(p.x) - t0) / 864e5);
  const ys = pts.map(p => p.y);
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  if (!sxx) return { ok: false, n, reason: 'Every reading is on the same date; there is no trend to project.' };
  const slope = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / sxx;
  const intercept = my - slope * mx;
  const resid = ys.map((y, i) => y - (intercept + slope * xs[i]));
  const sse = resid.reduce((s, e) => s + e * e, 0);
  const se = n > 2 ? Math.sqrt(sse / (n - 2)) : 0;
  const r2 = (() => { const sst = ys.reduce((s, y) => s + (y - my) ** 2, 0); return sst ? 1 - sse / sst : 0; })();

  const xNow = (+new Date(today.toISOString().slice(0, 10)) - t0) / 864e5;
  const t = tCrit(n - 2);
  const at = d => {
    const x = xNow + d;
    const fit = intercept + slope * x;
    const pi = se ? t * se * Math.sqrt(1 + 1 / n + (x - mx) ** 2 / sxx) : 0;
    return { day: d, date: new Date(t0 + x * 864e5).toISOString().slice(0, 10),
             value: fit, lo: fit - pi, hi: fit + pi };
  };
  const points = [0, 30, 60, 90, 180].filter(d => d <= horizonDays || d === horizonDays).map(at);
  const end = at(horizonDays);

  // when the projection crosses a threshold, and whether the interval reaches it sooner
  const cross = th => {
    if (th === null || th === undefined || !slope) return null;
    const x = (th - intercept) / slope;
    const d = x - xNow;
    if (!(d > 0) || d > horizonDays * 3) return null;
    return { days: Math.round(d), date: new Date(t0 + x * 864e5).toISOString().slice(0, 10) };
  };
  const breach = v => kriStatus(def, v).k;
  return {
    ok: true, n, slope: slope * 30, se, r2, intercept,
    points, end,
    endStatus: breach(end.value),
    worstStatus: breach(def.dir === 'down' ? end.hi : end.lo),
    crossWarn: cross(def.warn), crossCrit: cross(def.crit),
    method: `Ordinary least squares on ${n} readings; the band is a 95% prediction interval for a single future reading (t≈${t.toFixed(2)}, residual s = ${se.toFixed(3)}).`,
  };
}

/** Two-sided 95% t for small samples; 1.96 once the sample is large enough not to matter. */
function tCrit(df) {
  const T = { 1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306,
              9: 2.262, 10: 2.228, 12: 2.179, 15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042 };
  if (df <= 0) return 12.706;
  if (T[df]) return T[df];
  const ks = Object.keys(T).map(Number).filter(k => k <= df);
  return df >= 30 ? 1.96 : T[Math.max(...ks)];
}
