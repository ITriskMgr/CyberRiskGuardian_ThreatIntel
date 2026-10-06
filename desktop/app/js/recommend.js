/* recommend.js — the treatment-to-recommendation lifecycle (1.5.1).

   Built on "Selecting Risk Mitigations and Building Management Recommendations" (Marc-André Léger).
   The decision chain the module enforces:

     risk scenario → treatment need → treatment objective → candidate mitigations
       → expected reduction → residual risk → draft recommendation → approved recommendation → tracking

   Three ideas from that guidance are structural here rather than advisory:

   1. Treatment need is judged before any control is offered (§2). A scenario below tolerance does not
      automatically generate a project.
   2. A mitigation is selected because it changes a specific scenario, and must say which part of the
      causal chain it changes — the nine effect categories of §5 and §20.
   3. There are two optimization stages (§18): the measure portfolio per scenario, then consolidation
      of overlapping measures into a smaller number of enterprise initiatives. Management receives the
      second, not a list of controls.

   Every figure comes from the verified engine (CRG.calc). This module arranges and records; it never
   calculates risk itself.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, scen, compute } from './state.js';
import * as K from './catalog.js';
import { today, uid } from './util.js';
import * as users from './users.js';

/* ---------------- vocabulary ---------------- */

/** §5 and §20: what a mitigation changes, with the question that decides it. */
export const EFFECTS = [
  ['prevent',   'Prevent',           'Does it prevent the adverse event from occurring?'],
  ['likelihood','Reduce likelihood', 'Does it make successful exploitation less probable?'],
  ['detect',    'Detect',            'Does it increase the probability or speed of detection?'],
  ['contain',   'Contain',           'Does it prevent the event from spreading?'],
  ['respond',   'Respond',           'Does it improve intervention once the event occurs?'],
  ['recover',   'Recover',           'Does it shorten disruption or restore capability?'],
  ['impact',    'Reduce impact',     'Does it reduce financial, operational, legal or reputational consequences?'],
  ['transfer',  'Transfer',          'Does it shift part of the financial or contractual consequence?'],
  ['avoid',     'Avoid',             'Does it eliminate the activity producing the exposure?'],
];
export const EFFECT = Object.fromEntries(EFFECTS.map(([k, label, q]) => [k, { key: k, label, question: q }]));

/** §6: precise action verbs. "Implement" is last on purpose — it is the lazy default. */
export const VERBS = ['Strengthen', 'Extend', 'Automate', 'Integrate', 'Monitor', 'Test', 'Enforce',
                      'Govern', 'Replace', 'Establish', 'Implement'];

/** §6: what the scenario actually revealed. */
export const GAPS = [
  ['gap',      'Control gap',        'The control is absent.'],
  ['weakness', 'Control weakness',   'The control exists but can be bypassed or is incomplete.'],
  ['maturity', 'Maturity problem',   'The control exists but is not governed, measured or tied to risk.'],
];

/** The lifecycle. A draft is for discussion; approval freezes a version and opens tracking. */
export const STATUS = [
  ['draft',          'Draft',             'Being prepared; edit freely. For decision-maker discussion.'],
  ['in-review',      'In review',         'Circulated to decision-makers; comments are recorded.'],
  ['approved',       'Approved',          'Formal recommendation. The figures at approval are frozen.'],
  ['in-implementation', 'In implementation', 'Approved and under way; progress is tracked.'],
  ['completed',      'Completed',         'Delivered; the effect should now be visible in the KRIs.'],
  ['deferred',       'Deferred',          'Not now. The rationale is kept.'],
  ['rejected',       'Rejected',          'Not accepted. The rationale is kept.'],
];
export const STATUS_LABEL = Object.fromEntries(STATUS.map(([k, l]) => [k, l]));

const NEXT = {
  draft: ['in-review', 'approved', 'deferred', 'rejected'],
  'in-review': ['draft', 'approved', 'deferred', 'rejected'],
  approved: ['in-implementation', 'draft', 'deferred'],
  'in-implementation': ['completed', 'approved', 'deferred'],
  completed: [],
  deferred: ['draft', 'in-review'],
  rejected: ['draft'],
};
export const allowed = from => NEXT[from] || [];
export const isFormal = r => ['approved', 'in-implementation', 'completed'].includes(r.status);

/* ---------------- treatment need (§2) ---------------- */

/** The verdict that must be reached before a control is offered. */
export function need(ratio) {
  if (!Number.isFinite(ratio)) return { key: 'unknown', label: 'Not calculable', kind: '', act: false,
    text: 'The scenario does not calculate; fix its parameters before considering treatment.' };
  if (ratio < 0.90) return { key: 'below', label: 'Within tolerance', kind: 'good', act: false,
    text: 'Residual risk is below tolerance. Treatment is not required; monitor with a KRI and consider whether planned spending is better placed elsewhere.' };
  if (ratio <= 1.10) return { key: 'at', label: 'At the tolerance boundary', kind: 'warn', act: false,
    text: 'Residual risk is approximately at tolerance. Monitor closely; low-cost measures may be justified, and the decision is sensitive to the assumptions.' };
  if (ratio <= 2.0) return { key: 'above', label: 'Above tolerance', kind: 'bad', act: true,
    text: 'Residual risk exceeds tolerance. Further treatment should be evaluated.' };
  return { key: 'priority', label: 'Substantially above tolerance', kind: 'bad', act: true,
    text: 'Residual risk is well beyond tolerance. This is a candidate for priority management action.' };
}

/* ---------------- the record ---------------- */

export function nextCode(ws = S.ws) {
  const n = (ws.recommendations || []).reduce((m, r) => {
    const x = /^REC-(\d+)$/.exec(r.code || ''); return x ? Math.max(m, Number(x[1])) : m;
  }, 0);
  return 'REC-' + String(n + 1).padStart(2, '0');
}

export function blank(o = {}) {
  return Object.assign({
    id: uid('rec'), code: '', title: '', verb: 'Strengthen', gap: 'gap',
    status: 'draft', version: 0,
    scenarios: [], measures: [],
    objective: '',                 // §3, in risk terms
    rationale: '', weaknesses: '', // §20: why, which causal weaknesses
    effects: [],                   // §5: the effect categories this recommendation delivers
    difficulty: 'Medium', urgency: 'Medium', horizon: '',
    owner: '', accountable: '',
    success: '',                   // §20: how success is measured — KRI ids or text
    frameworks: [],                // §17: mapped AFTER selection
    dependencies: '', compensating: '',
    discussion: [],                // decision-maker comments while in draft or review
    history: [],
    approved: null,                // frozen figures at approval
    tracking: { percent: 0, started: '', due: '', review: '', note: '' },
    created: today(), modified: today(),
  }, o);
}

export const list = (ws = S.ws) => ws.recommendations || (ws.recommendations = []);
export const byId = (id, ws = S.ws) => list(ws).find(r => r.id === id) || null;
export const forMeasure = (mid, ws = S.ws) => list(ws).filter(r => (r.measures || []).includes(mid));

/* ---------------- building a draft from selected measures ---------------- */

/**
 * Turn a selection of measures into a draft. Scenarios, costs and horizon come from the measures;
 * the effect categories and the action verb come from what the measures declare. Nothing is invented:
 * fields the measures cannot supply are left empty for the analyst.
 */
export function fromMeasures(ids, ws = S.ws, into = null) {
  const ms = (ws.measures || []).filter(m => ids.includes(m.id));
  if (!ms.length) throw new Error('No measure was selected.');
  const rec = into || blank({ code: nextCode(ws) });
  const add = (arr, xs) => { for (const x of xs) if (x && !arr.includes(x)) arr.push(x); };
  add(rec.measures, ms.map(m => m.id));
  add(rec.scenarios, ms.flatMap(m => m.scen || []).filter(id => scen(id, ws) || S.ws?.assessment.SCEN.some(s => s.id === id)));
  add(rec.effects, ms.map(m => m.effect).filter(Boolean));
  add(rec.frameworks, ms.flatMap(m => m.ctl || []));
  if (!rec.title) rec.title = ms.length === 1 ? ms[0].name : '';
  if (!rec.owner) rec.owner = ms.find(m => m.owner)?.owner || '';
  const months = Math.max(...ms.map(m => Number(m.months) || 0), 0);
  rec.horizon = months <= 3 ? '0–90 days' : months <= 6 ? '3–6 months' : months <= 12 ? '6–12 months' : '12–24 months';
  rec.modified = today();
  return rec;
}

/** One-time and recurring cost of the measures a recommendation carries, counted once each. */
export function cost(rec, ws = S.ws) {
  const seen = new Set();
  let initial = 0, recurring = 0;
  for (const m of ws.measures || []) {
    if (!rec.measures.includes(m.id) || seen.has(m.id)) continue;
    seen.add(m.id);
    initial += Number(m.initial) || 0;
    recurring += Number(m.recurring) || 0;
  }
  return { initial, recurring, y1: initial + recurring };
}

/* ---------------- expected effect, through the verified engine ---------------- */

/**
 * Current and post-treatment figures for the scenarios a recommendation covers.
 *
 * "Current" applies every measure already in force. "After" additionally applies this recommendation's
 * own measures that are not yet in force. A measure of this recommendation that is already implemented
 * therefore appears in both and contributes nothing to the delta — control existence does not earn
 * treatment credit twice. The combination rule is the approved one —
 * red_p = 1 − ∏(1 − rp), red_i = 1 − ∏(1 − ri) — and CRG.calc does the arithmetic.
 */
export function effect(rec, ws = S.ws, { inForce = ['approved', 'in-progress', 'implemented'] } = {}) {
  const A = ws.assessment, app = A.APPETITE, fac = A.FACTOR;
  const mine = new Set(rec.measures || []);
  const rows = [];
  for (const id of rec.scenarios || []) {
    const s = A.SCEN.find(x => x.id === id);
    if (!s) continue;
    const q = (pred) => {
      let qp = 1, qi = 1;
      for (const m of ws.measures || []) {
        if (!pred(m) || !(m.scen || []).includes(id)) continue;
        const e = K.effect(m, id);
        qp *= 1 - Math.max(0, Math.min(1, e.rp));
        qi *= 1 - Math.max(0, Math.min(1, e.ri));
      }
      return { red_p: 1 - qp, red_i: 1 - qi };
    };
    // "Current" is everything already in force, this recommendation's own measures included when they
    // are in force: a recommendation must not claim credit for a control the organization already has.
    const base = q(m => inForce.includes(m.status));
    const with_ = q(m => inForce.includes(m.status) || mine.has(m.id));
    try {
      const cur = CRG.calc(Object.assign({}, s, { red_p: +base.red_p.toFixed(6), red_i: +base.red_i.toFixed(6) }), app, fac);
      const aft = CRG.calc(Object.assign({}, s, { red_p: +with_.red_p.toFixed(6), red_i: +with_.red_i.toFixed(6) }), app, fac);
      rows.push({ id, name: s.name || id, cur, aft,
                  curNeed: need(cur.ratio), aftNeed: need(aft.ratio),
                  delta: cur.res - aft.res });
    } catch (e) { rows.push({ id, name: s.name || id, error: String(e.message || e) }); }
  }
  const ok = rows.filter(r => !r.error);
  const sum = (k, w) => ok.reduce((t, r) => t + (r[w][k] || 0), 0);
  const totals = { curRes: sum('res', 'cur'), aftRes: sum('res', 'aft'), tol: sum('tol', 'cur') };
  totals.reduction = totals.curRes - totals.aftRes;
  totals.curRatio = totals.tol ? totals.curRes / totals.tol : NaN;
  totals.aftRatio = totals.tol ? totals.aftRes / totals.tol : NaN;
  totals.brought = ok.filter(r => r.curNeed.act && !r.aftNeed.act).length;
  return { rows, totals };
}

/** §9: expected reduction per dollar of year-one cost. Null when nothing is spent. */
export function efficiency(rec, ws = S.ws) {
  const c = cost(rec, ws).y1;
  if (!c) return null;
  return effect(rec, ws).totals.reduction / c * 1000;
}

/* ---------------- cross-scenario leverage (§12) ---------------- */

/** Control leverage: Σ(residual risk of the scenario × the reduction this recommendation delivers). */
export function leverage(rec, ws = S.ws) {
  const e = effect(rec, ws);
  return e.rows.filter(r => !r.error).reduce((t, r) => t + (r.cur.res * (r.cur.res ? (r.cur.res - r.aft.res) / r.cur.res : 0)), 0);
}

/* ---------------- consolidation (§18) ---------------- */

/**
 * Stage two: group drafts that share measures, control themes or scenarios into fewer enterprise
 * initiatives. Returns proposed groupings with the reason, for the analyst to accept or ignore —
 * it does not merge anything.
 */
export function consolidate(ws = S.ws, { statuses = ['draft', 'in-review'] } = {}) {
  const recs = list(ws).filter(r => statuses.includes(r.status));
  const tagsOf = r => {
    const t = new Set();
    for (const m of ws.measures || []) if (r.measures.includes(m.id)) for (const x of m.tags || []) t.add(x);
    return t;
  };
  const info = recs.map(r => ({ r, tags: tagsOf(r), scen: new Set(r.scenarios) }));
  const groups = [];
  const used = new Set();
  for (let i = 0; i < info.length; i++) {
    if (used.has(info[i].r.id)) continue;
    const g = { members: [info[i].r], reasons: [] };
    for (let j = i + 1; j < info.length; j++) {
      if (used.has(info[j].r.id)) continue;
      const shTags = [...info[i].tags].filter(t => info[j].tags.has(t));
      const shScen = [...info[i].scen].filter(s => info[j].scen.has(s));
      if (shTags.length >= 2 || shScen.length >= 2) {
        g.members.push(info[j].r); used.add(info[j].r.id);
        if (shTags.length >= 2) g.reasons.push(`${info[j].r.code}: shares the control themes ${shTags.slice(0, 4).join(', ')}`);
        if (shScen.length >= 2) g.reasons.push(`${info[j].r.code}: addresses ${shScen.length} of the same scenarios`);
      }
    }
    if (g.members.length > 1) { used.add(info[i].r.id); groups.push(g); }
  }
  return groups;
}

/* ---------------- lifecycle ---------------- */

export class TransitionError extends Error {}

/**
 * Move a recommendation through the lifecycle.
 *
 * Approval is the moment that matters: the figures as they stand are frozen onto the record with the
 * date and approver, and the version number increments. A later edit of an approved recommendation
 * produces a new version; the frozen figures of the earlier one stay readable in the history.
 */
export function transition(rec, to, { by = '', note = '', ws = S.ws } = {}) {
  const from = rec.status;
  if (from === to) return rec;
  if (!allowed(from).includes(to))
    throw new TransitionError(`A recommendation cannot go from ${STATUS_LABEL[from] || from} to ${STATUS_LABEL[to] || to}.`);
  if (to === 'approved') {
    if (users.active()) { users.requireApprove('recommend'); by = by || users.name(); }   // 1.5.2 — RACI: only A approves
    const missing = incomplete(rec, ws);
    if (missing.length) throw new TransitionError('Before approval, complete: ' + missing.join('; ') + '.');
    const e = effect(rec, ws);
    rec.version += 1;
    rec.approved = { at: today(), by, version: rec.version,
      curRes: e.totals.curRes, aftRes: e.totals.aftRes, tol: e.totals.tol,
      curRatio: e.totals.curRatio, aftRatio: e.totals.aftRatio,
      reduction: e.totals.reduction, brought: e.totals.brought,
      cost: cost(rec, ws), scenarios: rec.scenarios.slice(), measures: rec.measures.slice() };
  }
  if (to === 'in-implementation' && !rec.tracking.started) rec.tracking.started = today();
  if (to === 'completed') { rec.tracking.percent = 100; rec.tracking.completed = today(); }
  rec.status = to;
  rec.modified = today();
  rec.history.unshift({ at: new Date().toISOString(), action: 'status', from, to, by: by || users.name(), note });
  if (users.active()) users.audit('recommendation ' + to, rec.code || rec.id, ws);
  return rec;
}

/** What is still missing before this can become a formal recommendation (§20). */
export function incomplete(rec, ws = S.ws) {
  const out = [];
  if (!rec.title.trim()) out.push('a title');
  if (!rec.scenarios.length) out.push('at least one scenario it addresses');
  if (!rec.measures.length) out.push('at least one measure');
  if (!rec.objective.trim()) out.push('a treatment objective in risk terms');
  if (!rec.rationale.trim()) out.push('the risk rationale');
  if (!rec.effects.length) out.push('what it changes — at least one mitigation effect');
  if (!rec.owner.trim()) out.push('an owner');
  if (!rec.success.trim()) out.push('how success will be measured');
  if (!cost(rec, ws).y1) out.push('a cost on at least one of its measures');
  return out;
}

/** Record an edit of an approved recommendation as a new version. */
export function amend(rec, { by = '', note = '' } = {}) {
  if (!isFormal(rec)) return rec;
  rec.version += 1;
  rec.modified = today();
  rec.history.unshift({ at: new Date().toISOString(), action: 'amended', from: 'v' + (rec.version - 1), to: 'v' + rec.version, by, note });
  return rec;
}

export function comment(rec, { by = '', note = '' }) {
  if (!note.trim()) return rec;
  rec.discussion.unshift({ at: new Date().toISOString(), by, note: note.trim() });
  rec.modified = today();
  return rec;
}

/* ---------------- prioritization (§19) ---------------- */

/**
 * Decision support, not a ranking to be obeyed. Each component is reported separately so a reader can
 * see why a recommendation sits where it does, and disagree with the weighting.
 */
export function priority(rec, ws = S.ws) {
  const e = effect(rec, ws);
  const c = cost(rec, ws).y1;
  const gap = Math.max(0, (e.totals.curRatio || 0) - 1);
  const urg = { Low: 0.3, Medium: 0.6, High: 1 }[rec.urgency] ?? 0.6;
  const feas = { Low: 1, Medium: 0.6, High: 0.3 }[rec.difficulty] ?? 0.6;   // difficulty inverted
  const cover = (rec.scenarios || []).length;
  return {
    reduction: e.totals.reduction,
    toleranceGap: gap,
    coverage: cover,
    brought: e.totals.brought,
    urgency: urg,
    feasibility: feas,
    costY1: c,
    efficiency: c ? e.totals.reduction / c * 1000 : null,
  };
}
