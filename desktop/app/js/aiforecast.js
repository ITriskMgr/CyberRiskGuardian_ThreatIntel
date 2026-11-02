/* aiforecast.js — AI forecasting (1.9.0): exploitation forecast, mitigation optimizer, residual-risk path.

   Three features, one discipline (DECISIONS-1.9.0):
   - **The engine computes every number.** The 30-day exploitation forecast is a published, transparent
     rule over EPSS history, KEV, feed reports and exposure; the optimizer is deterministic and every
     residual goes through CRG.calc; the residual path runs the same CRG.calc month by month, with the
     Monte Carlo of forecast.js for its bands. AI comes afterwards and only proposes.
   - **Everything here is "Analytical estimate — validation required"**, shown apart from the calculated
     results, and nothing is applied by itself: the forecast raises a review item; AI cost and effect
     proposals become values only when the analyst accepts each one.
   - **EPSS is evidence, never a likelihood of the scenario.** The exploitation forecast is a statement
     about exploitation activity in the wild over the next 30 days. It is never written to Pb(A) or
     Pb(ψ,A); parameters move only through the Threat Evidence Ladder, behind the exposure gate.
   - AI with organizational content goes to the local model by default (routing rows exploit_forecast
     and mitigation_optimizer, both 'local'); the browser never calls a model (ai.js → helper).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, compute, initiatives, initPlan, included } from './state.js';
import * as AI from './ai.js';
import * as F from './forecast.js';
import * as helper from './helper.js';
import * as SV from './ssvc.js';
import { today, uid } from './util.js';

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export const MARK = AI.MARK;

/* ======================= 1. Exploitation forecast (30 days) ======================= */

/** The rule, in one place, so the screen can print it and the author can change it. */
export const RULE = {
  horizon: 30,            // days — the horizon EPSS itself is defined on
  trendCap: 0.25,         // the EPSS trend may move the latest score by at most ±0.25 over 30 days
  kevFloor: 0.90,         // KEV: exploitation already observed; continued activity within 30 days is likely
  pocUplift: 0.15,        // a public proof of concept reported in the feeds: 1 − (1 − p)(1 − 0.15)
  chatterPerItem: 0.03,   // each other feed report naming the CVE, up to chatterMax
  chatterMax: 0.12,
  bands: [[0.5, 'high'], [0.1, 'moderate'], [0, 'low']],
  reviewRising: 0.05,     // a review item when exposed and the EPSS trend rises by ≥ 0.05 per 30 days…
  reviewBands: ['high'],  // …or the forecast is high, or the CVE is in KEV
};
export const bandOf = p => (p == null ? 'unknown' : RULE.bands.find(([t]) => p >= t)[1]);

/** EPSS history of the register's CVEs from the dated snapshots in the feeds folder (helper, local). */
export async function epssHistory(ws = S.ws) {
  const cves = (ws.vulns || []).filter(v => /^CVE-/i.test(v.id)).map(v => v.id);
  if (!cves.length) return { files: [], series: {} };
  try { return await helper.post('/api/epss/series', { cves }); }
  catch (e) { return { files: [], series: {}, error: String(e.message || e) }; }
}

/** Least-squares slope of EPSS per 30 days, from points with a score. */
export function trend(points) {
  const pts = (points || []).filter(p => Number.isFinite(p.epss) && p.date).map(p => ({ x: +new Date(p.date) / 864e5, y: p.epss }));
  const uniq = [...new Map(pts.map(p => [p.x, p])).values()].sort((a, b) => a.x - b.x);
  if (uniq.length < 2) return { n: uniq.length, slope30: null, first: uniq[0]?.y ?? null, last: uniq[uniq.length - 1]?.y ?? null, days: 0 };
  const n = uniq.length, mx = uniq.reduce((s, p) => s + p.x, 0) / n, my = uniq.reduce((s, p) => s + p.y, 0) / n;
  const sxx = uniq.reduce((s, p) => s + (p.x - mx) ** 2, 0), sxy = uniq.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  return { n, slope30: sxx ? (sxy / sxx) * 30 : 0, first: uniq[0].y, last: uniq[n - 1].y, days: Math.round(uniq[n - 1].x - uniq[0].x) };
}

/**
 * The 30-day forecast for one registered CVE. Every step is named in `reasons`, so the number can be
 * re-derived by hand. Returns forecast null (band "unknown") when there is no evidence at all.
 */
export function forecastCve(v, { series = [], snap = S.snap, items = [] } = {}) {
  const id = String(v.id).toUpperCase(), reasons = [];
  const pts = series.slice();
  const cur = snap?.epss?.scores?.[id];
  const snapDate = snap?.epss?.score_date || snap?.retrieved;
  if (cur && snapDate && !pts.some(p => p.date === snapDate)) pts.push({ date: snapDate, epss: cur[0], pct: cur[1], kev: !!snap?.kev?.cves?.[id] });
  pts.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const kev = !!snap?.kev?.cves?.[id] || pts.some(p => p.kev);
  const tr = trend(pts);
  const feed = SV.feedSignals(id, items);
  let base = tr.last;
  if (base == null) {
    const pruned = Number(snap?.thresholds?.epss_pruned_below) || 0;
    if (snap && pruned) { base = 0; reasons.push(`Not in the snapshot's EPSS table: below its pruning threshold (EPSS < ${pruned}) — taken as 0`); }
    else if (snap) reasons.push('No EPSS score in the snapshot');
    else reasons.push('No threat-context snapshot loaded');
  } else reasons.push(`Latest EPSS ${base.toFixed(4)}${pts.length > 1 ? ` (${tr.n} dated snapshot(s) over ${tr.days} days)` : ' (one snapshot: no trend)'}`);
  let p = base;
  if (p != null && tr.slope30 != null) {
    const step = clamp(tr.slope30, -RULE.trendCap, RULE.trendCap);
    p = clamp(p + step, 0, 1);
    reasons.push(`EPSS trend ${tr.slope30 >= 0 ? '+' : ''}${tr.slope30.toFixed(4)} per 30 days${Math.abs(tr.slope30) > RULE.trendCap ? ` (capped at ±${RULE.trendCap})` : ''}`);
  }
  if (feed.poc) { p = 1 - (1 - (p ?? 0)) * (1 - RULE.pocUplift); reasons.push(`${feed.poc} feed report(s) of public exploit code (PoC) (+${RULE.pocUplift} combined)`); }
  const chatter = Math.min(RULE.chatterMax, RULE.chatterPerItem * Math.max(0, feed.items - feed.poc));
  if (chatter > 0) { p = 1 - (1 - (p ?? 0)) * (1 - chatter); reasons.push(`${feed.items - feed.poc} other feed report(s) naming it (+${chatter.toFixed(2)} combined)`); }
  if (kev) { p = Math.max(p ?? 0, RULE.kevFloor); reasons.push(`In CISA KEV: exploitation already observed (floor ${RULE.kevFloor})`); }
  const forecast = p == null ? null : +p.toFixed(4);
  const band = bandOf(forecast);
  const rising = tr.slope30 != null && tr.slope30 >= RULE.reviewRising;
  const review = !!v.exposed && (kev || rising || RULE.reviewBands.includes(band));
  if (!v.exposed) reasons.push('Exposure not confirmed: watch only, no review item (exposure gate)');
  return { id, exposed: !!v.exposed, product: v.product || '', kev, epss: base, trend: tr, series: pts, poc: feed.poc, items: feed.items,
           pocTitles: feed.pocTitles, forecast, band, rising, review, reasons };
}

export function forecastAll(ws = S.ws, { history = { series: {} }, snap = S.snap, items = [] } = {}) {
  return (ws.vulns || []).filter(v => /^CVE-/i.test(v.id)).map(v => forecastCve(v, { series: history.series?.[String(v.id).toUpperCase()] || [], snap, items }));
}

/** Raise (or refresh) the one open review item for this CVE. Never touches a parameter or an SSVC decision. */
export function raiseReview(ws, row, { source = 'rule', note = '', ai = null } = {}) {
  const R = SV.ensure(ws).review;
  let it = R.find(x => x.cve === row.id && x.status === 'open');
  const rec = { cve: row.id, date: today(), forecast: ai ? ai.likelihood : row.forecast, band: ai ? (ai.band || bandOf(ai.likelihood)) : row.band,
                reasons: ai ? [ai.rationale || ''].filter(Boolean) : row.reasons.slice(), source, note, label: MARK };
  if (it) Object.assign(it, rec); else { it = { id: uid('rev'), status: 'open', ...rec }; R.push(it); }
  return it;
}
export function closeReview(ws, id, { status = 'done', by = '', note = '' } = {}) {
  const it = SV.ensure(ws).review.find(x => x.id === id);
  if (!it) throw new Error('Unknown review item ' + id);
  Object.assign(it, { status, by, closed: today(), note: note || it.note });
  return it;
}

AI.TASKS.exploit_forecast = {
  label: 'Exploitation forecast',
  build(ws, { rows = [] } = {}) {
    const lines = rows.slice(0, 80).map(r => JSON.stringify({ id: r.id, product: r.product, exposed: r.exposed, kev: r.kev,
      epss: r.series.filter(p => p.epss != null).slice(-12).map(p => [p.date, p.epss]), feed_reports: r.items, poc_reports: r.poc, poc_headlines: r.pocTitles,
      rule_forecast: r.forecast }));
    const body = [`TASK: exploit_forecast
For each CVE below, propose the likelihood (0 to 1) of exploitation activity in the wild within the next 30 days.
You are given, per CVE: whether the organization confirmed it operates the affected technology (exposed), CISA KEV status,
the EPSS history from dated snapshots (EPSS is itself a 30-day probability of exploitation activity), the number of feed reports
naming it and of reports of public exploit code (PoC), and the value the application's published rule gives (rule_forecast).
Explain where and why you depart from the rule. Do not propose a scenario likelihood, Pb(A), Pb(psi,A) or any risk figure:
this forecast is evidence about the threat environment and is never converted into a parameter.
Every value you give is an "${MARK}" Confidence: High, Medium or Low.

CVES (one JSON object per line):`, ...lines, '',
      `Return JSON only:
{"cves":[{"id":"","likelihood":0.0,"band":"low|moderate|high","rationale":"","confidence":""}]}
`];
    return { system: 'You are a senior threat-intelligence analyst. You reason from the evidence given, say when it is thin, and never present an estimate as a fact. You return JSON only.', prompt: body.join('\n'), max_tokens: 3000, json: true };
  },
};

/** Normalize an AI answer: ids from the request only, likelihoods clamped to [0, 1]. */
export function parseForecastAnswer(text, rows) {
  const j = AI.parseJson(text);
  const ids = new Set(rows.map(r => r.id));
  return (j.cves || []).filter(x => ids.has(String(x.id || '').toUpperCase())).map(x => {
    const l = Number(x.likelihood);
    return { id: String(x.id).toUpperCase(), likelihood: Number.isFinite(l) ? +clamp(l, 0, 1).toFixed(4) : null,
             band: ['low', 'moderate', 'high'].includes(x.band) ? x.band : bandOf(Number.isFinite(l) ? clamp(l, 0, 1) : null),
             rationale: String(x.rationale || '').slice(0, 600), confidence: ['High', 'Medium', 'Low'].includes(x.confidence) ? x.confidence : 'Low' };
  });
}

/* ======================= 2. Mitigation optimizer ======================= */

const monthOf = (s, dflt = null) => { const m = /(-?\d+(?:\.\d+)?)/.exec(String(s ?? '')); return m ? Number(m[1]) : dflt; };
export const DEFAULT_MONTHS = 6;     // months to benefit when an initiative states no end — an assumption, shown

/**
 * The funding units: the initiatives of the portfolio (Recommendations → Initiative portfolio), each
 * counted once however many scenarios it serves, plus a package per scenario that has only a manual
 * Year-1 cost. A scenario's treatment (its red_p / red_i) counts only when every unit it needs is funded.
 */
export function units(ws = S.ws) {
  const R = compute(ws);
  const inc = new Map(R.inc.map(r => [r.id, r]));
  const U = [];
  for (const i of initiatives(ws)) {
    const scs = (i.scenarios || []).filter(id => inc.has(id));
    if (!scs.length) continue;
    const start = monthOf(i.start, 0), end = monthOf(i.end, null);
    const plan = initPlan(i, ws);
    U.push({ id: i.id, name: i.name || i.id, initial: Number(i.initial) || 0, recurring: Number(i.recurring) || 0, y1: i.y1,
             scenarios: scs, startMonth: start, months: end != null && end >= start ? end - start : DEFAULT_MONTHS, monthsAssumed: end == null || end < start,
             startYear: Number(plan.start) || ws.budgetYear, plan: plan.amounts3, manual: false });
  }
  for (const r of R.inc) {
    if (U.some(u => u.scenarios.includes(r.id))) continue;
    const c = Number(r.s.cost_y1_manual) || 0;
    if (c > 0) U.push({ id: 'PKG-' + r.id, name: 'Treatment package of ' + r.id, initial: c, recurring: 0, y1: c, scenarios: [r.id], startMonth: 0,
                        months: DEFAULT_MONTHS, monthsAssumed: true, startYear: ws.budgetYear, plan: [c, 0, 0], manual: true });
  }
  return { R, units: U };
}

const TARGETS = { within: { label: 'at or below tolerance (ratio ≤ 1.10)', ok: x => x <= CRG.BAND_HIGH }, below: { label: 'below tolerance (ratio < 0.90)', ok: x => x < CRG.BAND_LOW } };
export const TARGET_IDS = Object.keys(TARGETS);

/** Evaluate one funded set of units: which scenarios are treated, how many meet the target, at what cost. */
export function evaluatePortfolio(R, U, fundedIds, target = 'within') {
  const ok = TARGETS[target].ok, funded = new Set(fundedIds);
  const rows = R.inc.map(r => {
    const req = U.filter(u => u.scenarios.includes(r.id)).map(u => u.id);
    const treated = req.length > 0 && req.every(id => funded.has(id));
    const ratio = treated ? r.ratio : r.est / r.tol;
    return { id: r.id, name: r.name, req, treated, before: r.est / r.tol, after: ratio, res: treated ? r.res : r.est, est: r.est, tol: r.tol, meets: ok(ratio) };
  });
  const cost = U.filter(u => funded.has(u.id)).reduce((s, u) => s + u.y1, 0);
  return { rows, cost, count: rows.filter(x => x.meets).length, countBefore: rows.filter(x => ok(x.before)).length,
           strictBelow: rows.filter(x => x.after < CRG.BAND_LOW).length, residual: rows.reduce((s, x) => s + x.res, 0),
           removed: rows.reduce((s, x) => s + (x.est - x.res), 0), above: rows.filter(x => x.after > CRG.BAND_HIGH).length };
}

/**
 * The portfolio that brings the most scenarios to the target within the budget (Year-1 cost:
 * initial + first-year recurring, as on the funding frontier). Ties: more risk removed, then lower cost.
 * Exact (every combination of the scenarios that can be brought to target) when there are at most 20 of
 * them and 31 units; otherwise a greedy search, said so in `method`.
 */
export function optimize(ws = S.ws, { budget = 0, target = 'within' } = {}) {
  const { R, units: U } = units(ws);
  const ok = TARGETS[target].ok;
  const bit = new Map(U.map((u, i) => [u.id, i]));
  const reqMask = r => U.reduce((m, u, i) => (u.scenarios.includes(r.id) ? m | (1 << i) : m), 0);
  const scen = R.inc.map(r => ({ r, mask: reqMask(r), gain: r.est - r.res }));
  const G = scen.filter(x => x.mask && !ok(x.r.est / x.r.tol) && ok(x.r.ratio));
  const costOf = mask => { let c = 0; for (let i = 0; i < U.length; i++) if (mask & (1 << i)) c += U[i].y1; return c; };
  const removedOf = mask => scen.reduce((s, x) => s + (x.mask && (x.mask & mask) === x.mask ? x.gain : 0), 0);
  const countOf = mask => G.reduce((n, x) => n + ((x.mask & mask) === x.mask ? 1 : 0), 0);
  let best = { mask: 0, count: 0, removed: 0, cost: 0 }, method;
  const better = (c) => c.count > best.count || (c.count === best.count && (c.removed > best.removed + 1e-9 || (Math.abs(c.removed - best.removed) <= 1e-9 && c.cost < best.cost)));
  if (U.length <= 31 && G.length <= 20) {
    method = `exact — all ${2 ** G.length} combinations of the ${G.length} scenario(s) that can be brought to target`;
    for (let sub = 1; sub < (1 << G.length); sub++) {
      let mask = 0;
      for (let j = 0; j < G.length; j++) if (sub & (1 << j)) mask |= G[j].mask;
      const cost = costOf(mask);
      if (cost > budget + 1e-6) continue;
      const c = { mask, count: countOf(mask), removed: removedOf(mask), cost };
      if (better(c)) best = c;
    }
  } else {
    method = `greedy — ${G.length} scenario(s) and ${U.length} unit(s) are too many for an exhaustive search; the result may not be the best possible`;
    let mask = 0;
    for (;;) {
      const cand = G.filter(x => (x.mask & mask) !== x.mask).map(x => ({ x, add: costOf(x.mask & ~mask) })).filter(c => costOf(mask) + c.add <= budget + 1e-6)
        .sort((a, b) => a.add - b.add || b.x.gain - a.x.gain);
      if (!cand.length) break;
      mask |= cand[0].x.mask;
    }
    best = { mask, count: countOf(mask), removed: removedOf(mask), cost: costOf(mask) };
  }
  // fill what budget is left with the treatments that remove the most risk per dollar (all scenarios)
  let mask = best.mask;
  for (;;) {
    const left = budget - costOf(mask);
    const cand = scen.filter(x => x.mask && (x.mask & mask) !== x.mask).map(x => ({ x, add: costOf(x.mask & ~mask) }))
      .filter(c => c.add <= left + 1e-6 && c.x.gain > 0).sort((a, b) => b.x.gain / Math.max(1, b.add) - a.x.gain / Math.max(1, a.add));
    if (!cand.length) break;
    mask |= cand[0].x.mask;
  }
  const ids = U.filter((u, i) => mask & (1 << i)).map(u => u.id);
  const ev = evaluatePortfolio(R, U, ids, target);
  return { method, budget, target, targetLabel: TARGETS[target].label, units: U, funded: ids, ...ev, gainable: G.map(x => x.r.id),
           frontier: frontierWithin(R, U, budget, target), when: new Date().toISOString() };
}

/** The existing funding frontier (scenarios in cost-effectiveness order, cost shares) cut at the same budget. */
export function frontierWithin(R, U, budget, target = 'within') {
  const cand = R.inc.filter(r => r.cost > 0).map(r => ({ r, ce: (r.est - r.res) / r.cost })).sort((a, b) => b.ce - a.ce);
  const chosen = []; let c = 0;
  for (const { r } of cand) { if (c + r.cost > budget + 1e-6) break; c += r.cost; chosen.push(r.id); }
  const ids = [...new Set(U.filter(u => u.scenarios.some(id => chosen.includes(id))).map(u => u.id))];
  const ev = evaluatePortfolio(R, U, ids, target);
  return { scenarios: chosen, shareCost: c, units: ids, ...ev };
}

/** The appetite-consistent envelope, as option C of the Budget screen: target × IT budget − baseline. */
export function defaultBudget(ws = S.ws) {
  const it = Number(ws.budget?.it_budget) || 0, base = Number(ws.budget?.baseline) || 0;
  return Math.max(0, Math.round(CRG.budgetTarget(Number(ws.assessment.APPETITE)) * it - base));
}

/** A copy of the workspace with proposals applied — for "if accepted" figures the engine computes. Never saved. */
export function withProposals(ws, { costs = [], effects = [] } = {}) {
  const w = Object.assign({}, ws, { assessment: JSON.parse(JSON.stringify(ws.assessment)) });
  const A = w.assessment;
  for (const c of costs) {
    const row = A.INITIATIVES.find(a => a[0] === c.unit);
    if (!row) continue;
    if (Number.isFinite(c.initial)) row[6] = c.initial;
    if (Number.isFinite(c.recurring)) row[7] = c.recurring;
  }
  for (const e of effects) {
    const s = A.SCEN.find(x => x.id === e.scenario);
    if (!s) continue;
    if (Number.isFinite(e.red_p)) s.red_p = e.red_p;
    if (Number.isFinite(e.red_i)) s.red_i = e.red_i;
  }
  return w;
}

AI.TASKS.mitigation_optimizer = {
  label: 'Mitigation optimizer — proposals',
  build(ws, { result = null } = {}) {
    if (!result) throw new Error('Run the optimizer first; AI refines its result.');
    const R = compute(ws);
    const U = result.units;
    const inUse = new Set(result.funded);
    const scs = R.inc.filter(r => U.some(u => u.scenarios.includes(r.id)));
    const head = `TASK: mitigation_optimizer
The application's deterministic optimizer chose the initiatives marked FUNDED to bring the most scenarios
TARGET within a Year-1 budget of BUDGET. Its figures come from the verified engine and are not yours to
recompute. Your task is narrower: review the inputs it relied on and propose corrections where you have a reason:
(a) an initiative cost (initial, recurring per year) that looks out of line for what it describes and this organization;
(b) a per-scenario reduction (red_p = probability reduction, red_i = impact reduction, each 0 to 1) that looks
optimistic or pessimistic for the initiatives treating it. Leave out anything you would not change.
Each proposal is an "${MARK}" Give a short rationale and a confidence (High, Medium, Low).`;
    const tail = `Return JSON only:
{"costs":[{"unit":"","initial":0,"recurring":0,"rationale":"","confidence":""}],
 "effects":[{"scenario":"","red_p":0.0,"red_i":0.0,"rationale":"","confidence":""}], "notes":""}
INITIATIVES are listed as: id | name | initial | recurring/yr | months to benefit | scenarios | FUNDED?
SCENARIOS are listed as: id | name | red_p | red_i | ratio before treatment | ratio after
Use only identifiers that appear above.
`;
    const body = [head.replace('TARGET', result.targetLabel).replace('BUDGET', String(Math.round(result.budget))), '', AI.orgContext(ws), '', 'INITIATIVES:',
      ...U.map(u => `${u.id} | ${u.name} | ${u.initial} | ${u.recurring} | ${u.months}${u.monthsAssumed ? ' (assumed)' : ''} | ${u.scenarios.join(',')} | ${inUse.has(u.id) ? 'FUNDED' : 'not funded'}`), '',
      'SCENARIOS:', ...scs.map(r => `${r.id} | ${r.name} | ${r.s.red_p} | ${r.s.red_i} | ${(r.est / r.tol).toFixed(2)} | ${r.ratio.toFixed(2)}`), '', tail];
    return { system: 'You are a senior cybersecurity risk analyst. You review inputs, never recompute the engine\'s figures, and propose; the analyst decides. You return JSON only.', prompt: body.join('\n'), max_tokens: 3000, json: true };
  },
};

/** Normalize an optimizer answer: known ids only, costs ≥ 0, reductions within [0, 1]. */
export function parseOptimizerAnswer(text, result, ws = S.ws) {
  const j = AI.parseJson(text);
  const U = new Map(result.units.map(u => [u.id, u]));
  const conf = c => (['High', 'Medium', 'Low'].includes(c) ? c : 'Low');
  const num = (x, lo, hi) => { const n = Number(x); return Number.isFinite(n) ? clamp(n, lo, hi) : null; };
  const costs = (j.costs || []).filter(c => U.has(c.unit) && !U.get(c.unit).manual).map(c => ({ unit: c.unit, initial: num(c.initial, 0, 1e12), recurring: num(c.recurring, 0, 1e12),
    was: { initial: U.get(c.unit).initial, recurring: U.get(c.unit).recurring }, rationale: String(c.rationale || '').slice(0, 500), confidence: conf(c.confidence) }))
    .filter(c => c.initial != null || c.recurring != null);
  const effects = (j.effects || []).filter(e => ws.assessment.SCEN.some(s => s.id === e.scenario)).map(e => {
    const s = ws.assessment.SCEN.find(x => x.id === e.scenario);
    return { scenario: e.scenario, red_p: num(e.red_p, 0, 1), red_i: num(e.red_i, 0, 1), was: { red_p: s.red_p, red_i: s.red_i }, rationale: String(e.rationale || '').slice(0, 500), confidence: conf(e.confidence) };
  }).filter(e => e.red_p != null || e.red_i != null);
  return { costs, effects, notes: String(j.notes || '').slice(0, 800) };
}

/* ======================= 3. Residual-risk path per funding option ======================= */

/** The funding options of the Budget screen, plus the optimizer's portfolio when there is one. */
export function fundingOptions(ws = S.ws, opt = null) {
  const { R, units: U } = units(ws);
  const ids = pred => [...new Set(U.filter(u => u.scenarios.some(id => pred(R.inc.find(r => r.id === id)))).map(u => u.id))];
  const env = defaultBudget(ws);
  const out = [
    { key: 'A', label: 'A · Status quo (baseline only)', funded: [] },
    { key: 'B', label: 'B · Bring above-tolerance scenarios down', funded: ids(r => r && r.est / r.tol > CRG.BAND_HIGH && r.cost > 0) },
    { key: 'C', label: 'C · Best value within the appetite-consistent budget', funded: frontierWithin(R, U, env).units },
    { key: 'D', label: 'D · Full treatment portfolio', funded: U.map(u => u.id) },
  ];
  if (opt) out.push({ key: 'O', label: 'O · Optimizer portfolio', funded: opt.funded.slice() });
  return { R, U, options: out };
}

/** How far a unit has phased in at month t: linear from its start to start + months to benefit. */
export function progress(u, t, { delay = 1, baseYear } = {}) {
  const start = Math.max(0, (Number(u.startYear) - Number(baseYear || u.startYear)) * 12) + (u.startMonth || 0);
  const dur = Math.max(0, u.months * delay);
  if (t < start) return 0;
  return dur ? clamp((t - start) / dur, 0, 1) : 1;
}

/**
 * The residual-risk path of every option, month by month over `years` (1–3). A scenario's treatment
 * phases in as the mean progress of the units it needs (it counts only when all of them are funded);
 * the phase-in scales the probability reduction, and CRG.calc computes each residual. Bands: a seeded
 * Monte Carlo over the parameter ranges (forecast.js) and over delivery delays (×0.8 to ×1.5 of each
 * unit's months to benefit). Expected risk avoided per $1,000: the area between status quo and the
 * option, in risk-units × years, over the option's spend in the same years (budget years allocation).
 */
export async function residualPath(ws = S.ws, { years = 3, trials = 200, seed = 20261102, opt = null, onProgress = null } = {}) {
  const { R, U, options } = fundingOptions(ws, opt);
  const A = ws.assessment, app = A.APPETITE, fac = A.FACTOR;
  const months = Math.round(clamp(years, 1, 3) * 12);
  const baseYear = Number(ws.budgetYear) || new Date().getFullYear();
  const prep = R.inc.map(r => ({ r, s: r.s, cvss: r.cvss, req: U.filter(u => u.scenarios.includes(r.id)), ranges: F.rangesFor(r.s) }));
  const calc = (p, params, rp, ri, f) => CRG.calc({ id: p.s.id, params, red_p: rp * f, red_i: ri, cvss_score: p.cvss }, app, fac).res;
  const pointParams = p => Object.fromEntries(F.PARAMS.map(([k]) => { const x = p.s.params[k]; return [k, Number(x && typeof x === 'object' ? x.v : x)]; }));
  const spend = funded => U.filter(u => funded.has(u.id)).reduce((s, u) => s + u.plan.slice(0, Math.ceil(months / 12)).reduce((a, b) => a + (Number(b) || 0), 0), 0);
  const grid = Array.from({ length: months + 1 }, (_, t) => t);
  const qGrid = grid.filter(t => t % 3 === 0 || t === months);
  const path = (funded, { params = null, rp = null, ri = null, delay = null } = {}, ts = grid) => ts.map(t => prep.reduce((sum, p, i) => {
    const treated = p.req.length && p.req.every(u => funded.has(u.id));
    const f = treated ? p.req.reduce((a, u) => a + progress(u, t, { delay: delay ? delay[u.id] : 1, baseYear }), 0) / p.req.length : 0;
    return sum + calc(p, params ? params[i] : pointParams(p), rp ? rp[i] : Number(p.s.red_p) || 0, ri ? ri[i] : Number(p.s.red_i) || 0, f);
  }, 0));
  const area = (base, xs) => xs.reduce((s, x, i) => (i ? s + ((base[i] - x) + (base[i - 1] - xs[i - 1])) / 2 : s), 0);   // trapezoid, in risk × months
  const result = [];
  const central = options.map(o => ({ o, funded: new Set(o.funded) }));
  const statusQuo = path(new Set());
  for (const { o, funded } of central) {
    const c = path(funded);
    const cost = spend(funded);
    const avoided = area(statusQuo, c) / 12;
    result.push({ key: o.key, label: o.label, funded: o.funded, cost, central: c, avoided, perK: cost > 0 ? avoided / cost * 1000 : null,
                  benefitMonth: o.funded.length ? Math.max(...U.filter(u => funded.has(u.id)).map(u => progressEnd(u, baseYear))) : 0 });
  }
  // Monte Carlo bands (quarterly points)
  const rand = F.rng(seed);
  const qs = central.map(() => qGrid.map(() => []));
  const perKs = central.map(() => []);
  for (let k = 0; k < trials; k++) {
    const params = prep.map(p => { const o = {}; for (const [key] of F.PARAMS) o[key] = F.draw(rand(), p.ranges[key]); if (!(o.Th > 0)) o.Th = 0.05; return o; });
    const rp = prep.map(p => clamp(F.draw(rand(), p.ranges.red_p), 0, 1)), ri = prep.map(p => clamp(F.draw(rand(), p.ranges.red_i), 0, 1));
    const delay = Object.fromEntries(U.map(u => [u.id, F.draw(rand(), { min: 0.8, likely: 1, max: 1.5, dist: 'triangular' })]));
    const sq = path(new Set(), { params, rp, ri, delay }, qGrid);
    central.forEach(({ funded }, j) => {
      const xs = j === 0 ? sq : path(funded, { params, rp, ri, delay }, qGrid);
      xs.forEach((x, i) => qs[j][i].push(x));
      const cost = result[j].cost;
      if (cost > 0) perKs[j].push(area(sq, xs) * 3 / 12 / cost * 1000);   // quarterly trapezoid ≈ the monthly one
    });
    if (onProgress && k % 20 === 19) { onProgress((k + 1) / trials); await new Promise(r => setTimeout(r, 0)); }
  }
  result.forEach((r, j) => {
    r.band = qGrid.map((t, i) => { const s = F.summarize(qs[j][i]); return { t, p10: s.p10, p50: s.p50, p90: s.p90 }; });
    r.perKBand = perKs[j].length ? F.summarize(perKs[j]) : null;
  });
  return { years: months / 12, months, trials, seed, baseYear, options: result, statusQuo, when: new Date().toISOString(),
           assumedMonths: U.filter(u => u.monthsAssumed).map(u => u.id) };
}
const progressEnd = (u, baseYear) => Math.max(0, (Number(u.startYear) - Number(baseYear)) * 12) + (u.startMonth || 0) + u.months;
