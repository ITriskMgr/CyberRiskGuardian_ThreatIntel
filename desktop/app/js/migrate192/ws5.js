/* migrate192/ws5.js — data version 6 (Desktop 1.9.2): the sub-steps owned by workstream ws5.

   Only workstream ws5 edits this file. migrate192.js concatenates ws1 … ws5, in that order, into STEP6; the
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
import { inferCase, CASE_LABEL } from '../teaching.js';

/* ---------- items 4–6 (NV-036): the identity of a stored teaching case ----------
   A teaching workspace saved before 1.9.2 may carry no ws.teaching.case (every example before 1.9.0 was MediBec, and
   a copy made from the Workspaces tab did not always record its case). Restore and import recognise a teaching case
   by that record, so it is inferred here from the name — the id is never changed: the store, the blobs (snap:, base:,
   premig:) and the "current" record are keyed by it, and a changed key would be the duplicate the item removes. */
function teachingIdentity(w, note) {
  if (w.kind !== 'example') return;
  const have = w.teaching?.case, inf = inferCase(w);
  if (have || !inf) return;
  w.teaching = Object.assign({}, w.teaching || {}, { case: inf });
  note(`teaching case recorded: ${CASE_LABEL[inf] || inf} (restore and import now recognise this copy; its id is unchanged)`);
}

/* ---------- item 19 (NV-038): one-time review of the assets "Create from profile" made ----------
   Until 1.9.1 the button split the systems text on every ";" and "," (inside parentheses too), kept fragments, typed
   everything "application" and set C/I/A to 3/3/3. Those assets are not changed — a migration never rewrites a real
   organization's records — but the ones that look like it are listed once, for the analyst to review on Information
   assets (merge, retype, rescore or delete). The list is kept in ws.assetReview until it is marked reviewed. */
export function blankAssetReview() { return { pending: [], created: null, reviewed: null }; }
const FRAGMENT = /^(and|et|or|ou|etc\.?|other|autres?|systems?|systèmes?)\b/i;
export function suspectAssets(w) {
  const log = Array.isArray(w.assetLog) ? w.assetLog : [];
  const fromProfile = new Set(log.filter(l => l && l.action === 'create' && /organization profile/i.test(String(l.src || ''))).map(l => l.asset));
  const out = [];
  for (const a of (Array.isArray(w.assets) ? w.assets : [])) {
    if (!a || !a.id) continue;
    const why = [];
    const nm = String(a.name || '');
    const unbalanced = (nm.match(/\(/g) || []).length !== (nm.match(/\)/g) || []).length;
    if (unbalanced) why.push('unbalanced parenthesis (a fragment of a longer phrase)');
    if (FRAGMENT.test(nm) || nm.length < 4) why.push('looks like a fragment');
    if (fromProfile.has(a.id) && a.cia && a.cia.c === 3 && a.cia.i === 3 && a.cia.a === 3) why.push('C/I/A left at the 3/3/3 default');
    if (fromProfile.has(a.id) && a.type === 'application' && /equipment|device|appareil|équipement|network|réseau|wi-?fi|server|serveur/i.test(nm)) why.push('typed "application" by default');
    if (why.length && (fromProfile.has(a.id) || unbalanced)) out.push({ id: a.id, name: nm, why });
  }
  // the same name twice (case-insensitive) — duplicates the old splitter produced
  const seen = new Map();
  for (const a of (Array.isArray(w.assets) ? w.assets : [])) {
    const k = String(a?.name || '').trim().toLowerCase(); if (!k) continue;
    if (seen.has(k)) { if (!out.some(x => x.id === a.id)) out.push({ id: a.id, name: a.name, why: [`same name as ${seen.get(k)}`] }); }
    else seen.set(k, a.id);
  }
  return out;
}
function assetReview(w, note) {
  if (!w.assetReview || typeof w.assetReview !== 'object') w.assetReview = blankAssetReview();
  if (w.assetReview.reviewed || w.assetReview.created) return;          // the review was made once, or already listed
  const items = suspectAssets(w);
  if (!items.length) { w.assetReview.created = new Date().toISOString().slice(0, 10); return; }
  w.assetReview.pending = items; w.assetReview.created = new Date().toISOString().slice(0, 10);
  note(`${items.length} asset(s) created from the profile before 1.9.2 listed for review on Information assets (nothing changed)`);
}

export default [
  { title: 'Teaching case recorded on bundled examples (restore and import recognise them)', up: teachingIdentity },
  { field: 'assetReview', blank: blankAssetReview, group: 'CONTEXT', title: 'One-time review of assets created from the profile', up: assetReview },
];
