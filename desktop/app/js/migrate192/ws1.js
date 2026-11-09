/* migrate192/ws1.js — data version 6 (Desktop 1.9.2): the sub-steps owned by workstream ws1.

   Only workstream ws1 edits this file. migrate192.js concatenates ws1 … ws5, in that order, into STEP6; the
   step 5 → 6 of migrate.js runs it, and KNOWN_FIELDS, the workspace factory (state.newWorkspace), the shape repair
   (state.migrate) and the reset groups (reset.GROUPS) read it. Do not edit DATA_VERSION, KNOWN_FIELDS or MIGRATIONS.

   Entry format (the same as STEP4 in migrate.js):
     field   the top-level workspace field (optional: an entry may be a load-time repair only)
     blank   () => its empty value: what a new workspace gets and what an older one is given (required with field)
     group   the reset group it belongs to (reset.js: ORGANIZATION, DOCUMENTS, CONTEXT, ASSESSMENT, KRI_DEFS, AUDIT)
     title   one line for the migration journal
     up      optional (w, note) => void, for a sub-step that does more than add the blank field (it replaces the
             default "add the blank field"); it must be idempotent, leave numbers untouched (one written exception:
             item 23), and journal what it did with note('…')
   Sub-steps run in the order listed, on the copy the migration works on.

   Imports: never import migrate.js, migrate192.js, state.js or reset.js here (directly or through another module):
   migrate.js imports this list while it is itself being evaluated, so the cycle would meet an uninitialised binding.
   Import leaf modules only (e.g. util.js, markers.js, a module of your own that imports none of those four).

   ws1 — method, process and recommendations (1.9.2):
     1. reductionReview (NV-001, decision D2): scenarios still carrying the untouched 0.5 / 0.5 default reductions are
        listed for a one-time review; a scenario that lacked the field is given the 0.5 the earlier release showed, so
        no organization's numbers move. New scenarios start at 0 (state.js blankScenario).
     2. Consultant candidates stored as objects (decided item 7 / C3) become the array rows the screening reads, their
        parameters and chain kept as the candidate's draft (screening record), so nothing proposed is lost.
     3. Recommendations frozen at "reduction 0" under the earlier effect rule are recomputed (decided item 23 — the one
        written exception to "a migration never changes a real organization's numbers"): the frozen figures are kept
        beside the new ones, labelled, and the recommendation's history says so. receffect.js holds the rule.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { today } from '../util.js';
import * as RE from '../receffect.js';

const PARAMS = ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu'];
const MARK = 'Analytical estimate — validation required';

/** 1 — the D2 review item: which scenarios still sit on the untouched default reductions. */
function reductionReviewUp(w, note) {
  const a = w.assessment || {};
  const given = [], listed = [];
  for (const s of a.SCEN || []) {
    if (!s || typeof s !== 'object') continue;
    if (s.red_p === undefined || s.red_p === null) { s.red_p = 0.5; given.push(s.id); }
    if (s.red_i === undefined || s.red_i === null) { s.red_i = 0.5; given.push(s.id); }
    if (Number(s.red_p) === 0.5 && Number(s.red_i) === 0.5 && !s.red_source && !(s.revisions || []).some(r => /red_[pi]/.test(String(r?.what || '')))) listed.push(s.id);
  }
  const ids = [...new Set(listed)];
  if (!w.reductionReview || typeof w.reductionReview !== 'object') w.reductionReview = { date: today(), scenarios: ids, reviewed: null, by: '', note: '' };
  if (given.length) note(`${new Set(given).size} scenario(s) had no reduction recorded: given the 0.5 that was applied until now (${[...new Set(given)].join(', ')}) — numbers unchanged`);
  if (ids.length) note(`${ids.length} scenario(s) still on the untouched default reductions 0.5 / 0.5 listed for review (D2): ${ids.join(', ')} — nothing changed`);
  else note('no scenario on the untouched default reductions 0.5 / 0.5 (D2): review item empty');
}

/** 2 — consultant candidates stored as objects → array rows + draft (decided item 7 / C3). */
function candidatesUp(w, note) {
  const a = w.assessment || {};
  if (!Array.isArray(a.CANDIDATES)) return;
  const objs = a.CANDIDATES.filter(c => c && typeof c === 'object' && !Array.isArray(c));
  if (!objs.length) return;
  w.screening ||= { cands: {}, families: [], watch: [], plan: [], updated: null };
  w.screening.cands ||= {};
  const rows = a.CANDIDATES.filter(Array.isArray);
  let n = 0;
  for (const r of rows) { const m = /^C(\d+)$/.exec(String(r[0] || '')); if (m) n = Math.max(n, Number(m[1])); }
  const converted = [];
  for (const c of objs) {
    const id = 'C' + String(++n).padStart(2, '0');
    const chain = [c.threat_source, c.vulnerability, c.asset, c.consequence].filter(Boolean).join(' → ');
    rows.push([id, c.name || '(unnamed)', c.threat_source || '', c.vulnerability || '', c.asset || '', c.consequence || c.statement || '', 'consultant' + (c.id ? ' ' + c.id : ''), c.status || 'Candidate',
      (c.note || MARK + '.') + (c.model ? ' Proposed by the Virtual consultant (' + c.model + (c.generated ? ', ' + c.generated : '') + ').' : '')]);
    const params = {};
    for (const k of PARAMS) { const p = c.params?.[k]; const v = Number(p && typeof p === 'object' ? p.v : p); if (Number.isFinite(v)) params[k] = { v, rat: p?.why ? 'AI: ' + p.why : '', ev: '', conf: ['High', 'Medium', 'Low'].includes(p?.conf) ? p.conf : '' }; }
    const r = (w.screening.cands[id] ||= {});
    r.scores ||= Array.from({ length: 12 }, () => null); r.flags ||= []; r.strategy ||= ['TD']; r.rat ??= ''; r.conf ??= ''; r.disp ??= ''; r.target ??= ''; r.basis ??= '';
    r.draft = { statement: c.statement || '', threat_source: c.threat_source || '', vulns: String(c.vulnerability || '').split(/;\s*/).filter(Boolean), assets: c.asset || '', processes: c.process || '',
      consequence: c.consequence || '', initiating_event: c.initiating_event || '', existing_controls: c.existing_controls || '', assumptions: c.assumptions || '',
      params, attack: Array.isArray(c.attack) ? c.attack.filter(t => /^T\d{4}/.test(String(t))) : [], cwe: [], cves: [], cvss: '', cvss_score: null, cvss_note: '', red_p: 0, red_i: 0,
      owner: '', horizon: '', pattern: 'consultant', origin: 'ai', model: c.model || '', chain };
    converted.push(id);
  }
  a.CANDIDATES = rows;
  note(`${converted.length} consultant candidate(s) stored as objects converted to screening rows with their draft kept (${converted.join(', ')}) — decided item 7`);
}

/** 3 — decided item 23: recommendations frozen at reduction 0 recomputed, the earlier figures kept beside. */
function frozenZerosUp(w, note) {
  const done = RE.repairFrozenZeros(w, { today: today() });
  if (done.length) note(`${done.length} approved recommendation(s) frozen at "reduction 0" recomputed under the decided rule (item 23); earlier figures kept beside the new ones: ${done.join(', ')}`);
  // 1.9.2 review (M1): a zero the earlier rule did not cause (own measures not in force) is kept and listed, never recomputed
  if (done.left?.length) note(`${done.left.length} approved recommendation(s) frozen at "reduction 0" left as approved and listed for review (their measures were not in force when approved; today's measures would give more): ${done.left.join(', ')}`);
}

export default [
  { field: 'reductionReview', blank: () => null, group: 'ASSESSMENT',
    title: 'review item for scenarios still on the untouched default reductions 0.5 / 0.5 (NV-001, D2) — nothing changed automatically',
    up: reductionReviewUp },
  { title: 'consultant candidates stored as objects become screening rows with their draft (decided item 7 / C3)', up: candidatesUp },
  { title: 'approved recommendations frozen at reduction 0 recomputed under the decided rule (item 23; the earlier figures kept beside, labelled)', up: frozenZerosUp },
];
