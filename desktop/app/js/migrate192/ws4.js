/* migrate192/ws4.js — data version 6 (Desktop 1.9.2): the sub-steps owned by workstream ws4.

   Only workstream ws4 edits this file. migrate192.js concatenates ws1 … ws5, in that order, into STEP6; the
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

/** The literal the 1.9.1 rules extraction wrote into profile fields (#18 / NV-013): String({}) of an empty proposal. */
const BAD = /^\s*\[object Object\]\s*$/;
const isBad = v => typeof v === 'string' && BAD.test(v);
/** Clear "[object Object]" wherever it was written as a value; returns what was repaired, for the journal. */
export function repairObjectObject(w) {
  const fixed = [];
  const org = w.org && typeof w.org === 'object' ? w.org : null;
  if (org) {
    for (const [k, v] of Object.entries(org)) {
      if (isBad(v)) { org[k] = ''; fixed.push('org.' + k); if (org.prov && org.prov[k]) org.prov[k] = { ...org.prov[k], tag: 'UNKNOWN', source: 'Cleared: the 1.9.1 rules extraction wrote "[object Object]" here (#18)', repaired: true }; }
      else if (Array.isArray(v) && v.some(isBad)) { org[k] = v.filter(x => !isBad(x)); fixed.push('org.' + k); }
    }
  }
  if (isBad(w.appetite_rationale)) { w.appetite_rationale = ''; fixed.push('appetite_rationale'); }
  if (isBad(w.name)) { w.name = 'Workspace'; fixed.push('name'); }
  const A = w.assessment && typeof w.assessment === 'object' ? w.assessment : null;
  if (A && Array.isArray(A.CROWN)) {
    A.CROWN.forEach((row, i) => {
      if (Array.isArray(row)) row.forEach((c, j) => { if (isBad(c)) { row[j] = ''; fixed.push(`CROWN[${i}][${j}]`); } });
      else if (row && typeof row === 'object') for (const k of Object.keys(row)) if (isBad(row[k])) { row[k] = ''; fixed.push(`CROWN[${i}].${k}`); }
    });
  }
  if (w.budget && typeof w.budget === 'object') for (const k of Object.keys(w.budget)) if (isBad(w.budget[k])) { w.budget[k] = ''; fixed.push('budget.' + k); }
  return fixed;
}

export default [
  // #18 / NV-013 — repair on load: "[object Object]" written by the 1.9.1 rules-only extraction into Size, Region, Context
  // (and Name) is cleared and the field's provenance set to UNKNOWN. Idempotent; no number changes; journalled.
  { title: 'Clear "[object Object]" written by the rules extraction (#18)',
    up(w, note) {
      const fixed = repairObjectObject(w);
      if (fixed.length) note(`#18: cleared "[object Object]" in ${fixed.length} field(s): ${fixed.join(', ')} — re-run the extraction or fill them by hand`);
      else note('#18: no "[object Object]" value found in the profile, the crown jewels or the budget; nothing to clear');
    } },
];
