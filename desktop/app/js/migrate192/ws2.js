/* migrate192/ws2.js — data version 6 (Desktop 1.9.2): the sub-steps owned by workstream ws2.

   Only workstream ws2 edits this file. migrate192.js concatenates ws1 … ws5, in that order, into STEP6; the
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
   Import leaf modules only (e.g. util.js, markers.js, a module of your own that imports none of those four). © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

/* One typing rule for every engine (X-2 / NV-095): a numeric string ("0.7") is no longer read as a number, so a scenario
   value stored as text — an old import or a hand-edited JSON — is converted to the number it already spells. The figure is
   the same; only its type changes, and the journal says which fields. Nothing else is touched (a boolean or a word stays
   as it is and the engine reports it). Idempotent. */
const NUMERIC = /^\s*[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?\s*$/i;
export function retypeNumbers(w) {
  const fixed = [];
  const fix = (obj, key, where) => {
    const v = obj[key];
    if (typeof v === 'string' && NUMERIC.test(v)) { obj[key] = Number(v); fixed.push(where); }
  };
  for (const s of w.assessment?.SCEN || []) {
    for (const k of ['red_p', 'red_i', 'cvss_score']) fix(s, k, `${s.id}.${k}`);
    for (const [k, p] of Object.entries(s.params || {})) {
      if (p && typeof p === 'object') fix(p, 'v', `${s.id}.${k}`);
      else fix(s.params, k, `${s.id}.${k}`);
    }
  }
  return fixed;
}

export default [
  { group: 'ASSESSMENT', title: 'Scenario values stored as text are retyped as numbers (same figures; one typing rule for every engine)',
    up(w, note) { const fixed = retypeNumbers(w); if (fixed.length) note(`${fixed.length} numeric text value(s) retyped as numbers: ${fixed.slice(0, 12).join(', ')}${fixed.length > 12 ? ', …' : ''}`); } },
];
