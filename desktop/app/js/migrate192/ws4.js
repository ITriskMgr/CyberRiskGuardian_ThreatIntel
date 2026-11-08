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

/** The literal the rules extraction (and the AI path, for omitted fields) wrote as a value (#18 / NV-013): String({}). */
const BAD = /^\s*\[object Object\]\s*$/;
const isBad = v => typeof v === 'string' && BAD.test(v);
/** Decided condition: a value is repaired when its provenance says method 'rules' or carries no source (the AI path's
    omitted fields had an empty source); a value with another provenance is left and listed for review. */
const repairable = prov => !prov || prov.method === 'rules' || !String(prov.source || '').trim();
const CROWN_COLS = [2, 7, 8];     // role, dependencies, suppliers — the columns the extraction fills from a proposal's text
/** Clear "[object Object]" (or a list holding it) in the profile and the crown-jewel columns 2, 7 and 8; returns
    { fixed, left } for the journal. Idempotent; no number changes. */
export function repairObjectObject(w) {
  const fixed = [], left = [];
  const org = w.org && typeof w.org === 'object' ? w.org : null;
  if (org) {
    const P = org.prov && typeof org.prov === 'object' ? org.prov : {};
    for (const [k, v] of Object.entries(org)) {
      if (k === 'prov') continue;
      const bad = isBad(v) || (Array.isArray(v) && v.some(isBad));
      if (!bad) continue;
      if (!repairable(P[k])) { left.push('org.' + k); continue; }
      org[k] = Array.isArray(v) ? v.filter(x => !isBad(x)) : '';
      fixed.push('org.' + k);
      if (org.prov) org.prov[k] = { ...(P[k] || {}), tag: 'UNKNOWN', source: 'Cleared: the extraction wrote "[object Object]" here (#18)', repaired: true };
    }
  }
  if (isBad(w.appetite_rationale)) { w.appetite_rationale = ''; fixed.push('appetite_rationale'); }
  const A = w.assessment && typeof w.assessment === 'object' ? w.assessment : null;
  if (A && Array.isArray(A.CROWN)) {
    const CP = w.crownProv && typeof w.crownProv === 'object' ? w.crownProv : {};
    A.CROWN.forEach((row, i) => {
      if (!Array.isArray(row)) return;
      for (const j of CROWN_COLS) {
        if (!isBad(row[j])) continue;
        const prov = CP[row[1]];
        if (!repairable(prov)) { left.push(`CROWN[${i}][${j}]`); continue; }
        row[j] = ''; fixed.push(`CROWN[${i}][${j}]`);
        if (prov) CP[row[1]] = { ...prov, tag: 'UNKNOWN', repaired: true };
      }
    });
  }
  return { fixed, left };
}

export default [
  // #18 / NV-013 — repair on load (decided): "[object Object]" written by the rules extraction into Size, Region, Context
  // (and Name), or a list holding it (regulations), is cleared and re-tagged UNKNOWN when its provenance is method 'rules'
  // or has no source — in the profile and in crown-jewel columns 2, 7, 8; journalled. Idempotent; no number changes.
  { title: 'Clear "[object Object]" written by the rules extraction (#18)',
    up(w, note) {
      const { fixed, left } = repairObjectObject(w);
      if (fixed.length) note(`#18: cleared "[object Object]" in ${fixed.length} field(s), re-tagged UNKNOWN: ${fixed.join(', ')} — re-run the extraction or fill them by hand (a value typed by hand over one of these is not kept: the profile has no history)`);
      if (left.length) note(`#18: "[object Object]" left for review in ${left.length} field(s) whose provenance is neither rules nor without a source: ${left.join(', ')}`);
      if (!fixed.length && !left.length) note('#18: no "[object Object]" value found in the profile or the crown jewels; nothing to clear');
    } },
];
