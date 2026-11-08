/* receffect.js — the expected effect of a recommendation, through the verified engine (1.9.2, decided item 23).

   A leaf module (it imports nothing of the application) so that the data migration can use the same arithmetic
   as the Recommendations screen when it repairs recommendations frozen at "reduction 0" (js/migrate192/ws1.js).

   The rule (decision R-2 of 8 November 2026): the reduction a recommendation delivers is the residual risk WITHOUT
   this recommendation's own measures minus the residual risk WITH them, whatever their status. "Current" applies
   every other measure already in force; "after" adds this recommendation's measures. A measure the organization has
   already implemented is still this recommendation's measure: it is counted once, on the "after" side, so approving
   a recommendation whose measure is in force no longer freezes a reduction of 0 (the earlier rule put such a
   measure on both sides and it cancelled out). The combination rule is the approved one — red_p = 1 − ∏(1 − rp),
   red_i = 1 − ∏(1 − ri) — and CRG.calc does the arithmetic. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

/** The reduction a measure claims on one scenario (the same reading as catalog.js effect()). */
export const measureEffect = (m, id) => ({ rp: Number(m.eff?.[id]?.rp ?? m.rp) || 0, ri: Number(m.eff?.[id]?.ri ?? m.ri) || 0 });

/** The statuses that count as "in force" for the measures that are not this recommendation's own. */
export const IN_FORCE = ['approved', 'in-progress', 'implemented'];

/** A reduction coefficient is valid within 0–1 (the same test as catalog.js validCoef; NV-066). */
export const validCoef = x => Number.isFinite(x) && x >= 0 && x <= 1;

/** Combined reductions on scenario `id` of the measures that pass `pred`. A coefficient outside 0–1 is never clamped
 *  (NV-066: the book says flag it): it is left out of the product and listed in `invalid` [{ m, id, lever, value }]. */
export function combined(ws, id, pred) {
  let qp = 1, qi = 1; const invalid = [];
  for (const m of ws.measures || []) {
    if (!pred(m) || !(m.scen || []).includes(id)) continue;
    const e = measureEffect(m, id);
    if (validCoef(e.rp)) qp *= 1 - e.rp; else invalid.push({ m: m.id, id, lever: 'rp', value: e.rp });
    if (validCoef(e.ri)) qi *= 1 - e.ri; else invalid.push({ m: m.id, id, lever: 'ri', value: e.ri });
  }
  return { red_p: 1 - qp, red_i: 1 - qi, invalid };
}

/** The treatment-need verdict keys on a ratio (the same bands as recommend.js need()). */
const act = ratio => Number.isFinite(ratio) && ratio > 1.10;

/**
 * Current and post-treatment figures for the scenarios a recommendation covers.
 * rows: { id, name, cur, aft, delta } per scenario (or { id, name, error }); totals: curRes, aftRes, tol, reduction,
 * curRatio, aftRatio, brought (scenarios brought from "treatment needed" to not needed).
 */
export function effect(rec, ws, { inForce = IN_FORCE, CRG = globalThis.CRG } = {}) {
  const A = ws.assessment, app = A.APPETITE, fac = A.FACTOR;
  const mine = new Set(rec.measures || []);
  const rows = [];
  for (const id of rec.scenarios || []) {
    const s = A.SCEN.find(x => x.id === id);
    if (!s) continue;
    // without this recommendation's own measures (whatever their status) · with them
    const base = combined(ws, id, m => !mine.has(m.id) && inForce.includes(m.status));
    const with_ = combined(ws, id, m => (!mine.has(m.id) && inForce.includes(m.status)) || mine.has(m.id));
    try {
      const cur = CRG.calc(Object.assign({}, s, { red_p: +base.red_p.toFixed(6), red_i: +base.red_i.toFixed(6) }), app, fac);
      const aft = CRG.calc(Object.assign({}, s, { red_p: +with_.red_p.toFixed(6), red_i: +with_.red_i.toFixed(6) }), app, fac);
      rows.push({ id, name: s.name || id, cur, aft, curAct: act(cur.ratio), aftAct: act(aft.ratio), delta: cur.res - aft.res, invalid: with_.invalid });
    } catch (e) { rows.push({ id, name: s.name || id, error: String(e.message || e), invalid: with_.invalid }); }
  }
  const ok = rows.filter(r => !r.error);
  const sum = (k, w) => ok.reduce((t, r) => t + (r[w][k] || 0), 0);
  const totals = { curRes: sum('res', 'cur'), aftRes: sum('res', 'aft'), tol: sum('tol', 'cur') };
  // NV-066 — out-of-range coefficients of the measures involved, flagged for the screen (never clamped, never applied)
  totals.invalid = rows.flatMap(r => r.invalid || []);
  totals.reduction = totals.curRes - totals.aftRes;
  totals.curRatio = totals.tol ? totals.curRes / totals.tol : NaN;
  totals.aftRatio = totals.tol ? totals.aftRes / totals.tol : NaN;
  totals.brought = ok.filter(r => r.curAct && !r.aftAct).length;
  return { rows, totals };
}

/** Is this recommendation formally approved (its frozen figures matter)? */
export const isFormal = r => ['approved', 'in-implementation', 'completed'].includes(r?.status);

/**
 * Decided item 23 — the one written exception to "a migration never changes a real organization's numbers": a
 * recommendation approved under the earlier rule and frozen at reduction 0 while its measures do reduce the risk is
 * recomputed. The frozen figures are kept beside the new ones (approved.recomputed.previous), labelled, and the
 * recommendation's history says so. Returns the recommendations repaired. Idempotent (a repaired record is skipped).
 */
export function repairFrozenZeros(ws, { today = new Date().toISOString().slice(0, 10), CRG = globalThis.CRG } = {}) {
  const done = [];
  if (!CRG) return done;
  for (const rec of ws.recommendations || []) {
    if (!isFormal(rec) || !rec.approved || rec.approved.recomputed) continue;
    if (Math.abs(Number(rec.approved.reduction) || 0) >= 0.5) continue;
    let e;
    try { e = effect(rec, ws, { CRG }); } catch { continue; }
    if (!(e.totals.reduction >= 0.5)) continue;
    const prev = { reduction: rec.approved.reduction, aftRes: rec.approved.aftRes, aftRatio: rec.approved.aftRatio, brought: rec.approved.brought, curRes: rec.approved.curRes, curRatio: rec.approved.curRatio };
    rec.approved.recomputed = { at: today, previous: prev, by: 'Desktop 1.9.2, data version 6', label: 'recomputed in 1.9.2 from current measures',
      rule: 'reduction = residual without this recommendation’s own measures − residual with them, whatever their status (decided item 23, R-2)' };
    Object.assign(rec.approved, { curRes: e.totals.curRes, aftRes: e.totals.aftRes, curRatio: e.totals.curRatio, aftRatio: e.totals.aftRatio,
      reduction: e.totals.reduction, brought: e.totals.brought });
    (rec.history ||= []).unshift({ at: new Date().toISOString(), action: 'recomputed', from: 'reduction ' + Math.round(prev.reduction || 0), to: 'reduction ' + Math.round(e.totals.reduction),
      by: 'Desktop 1.9.2 (data version 6)', note: 'Frozen figures recomputed under the decided rule (item 23): the earlier rule counted this recommendation’s already-implemented measures in the baseline, freezing a reduction of 0. The earlier figures are kept beside the new ones.' });
    done.push(rec.code || rec.id);
  }
  return done;
}
