/* teaching.js — identity of the bundled teaching cases (1.9.2, items 4–6, NV-036). A leaf module: it imports nothing,
   so the migration list (migrate192/ws5.js), backup.js and the Workspaces tab can all use it.

   Until 1.9.1 every copy of a bundled case got a random id (uid('ws')), so a restore or an import could not tell that
   "MediBec — teaching case (fictional)" was already here and added it again. From 1.9.2:
     • a teaching workspace created from the Workspaces tab gets a fixed id, FIXED_ID(case), when that id is free;
     • every stored teaching workspace carries ws.teaching.case (the migration infers it from the name for old ones);
     • restore and import recognise a teaching case by that identity, whatever its id, and ask Replace / Keep both / Skip.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

export const CASES = ['medibec', 'medibec-fr', 'canaretail', 'canaretail-fr'];
export const FIXED_ID = c => 'ws-example-' + c;
export const isFixedId = id => CASES.some(c => FIXED_ID(c) === id);

/** The bundled case a workspace holds, from its record or, failing that, from its name: null for a real organization.
 *  1.9.2 review (H1): only a workspace of kind "example" is a bundled copy. A classroom (or any other) workspace built from
 *  a case carries ws.teaching.case too — a student's work, which the reset to the starting point needs (state.caseOf) —
 *  but it is never "the same teaching case" as the bundled example: restore and import must not skip or overwrite it. */
export function inferCase(w) {
  if (!w || typeof w !== 'object') return null;
  if (w.kind !== 'example') return null;
  const rec = w.teaching?.case;
  if (CASES.includes(rec)) return rec;
  const name = `${w.name || ''} ${w.org?.name || ''}`;
  const fr = /cas (d[’']enseignement|pédagogique)|fictif|\(fr\)|français|french/i.test(name) || /\bfr\b/i.test(w.teaching?.lang || '');
  if (/medibec/i.test(name)) return fr ? 'medibec-fr' : 'medibec';
  if (/canaretail/i.test(name)) return fr ? 'canaretail-fr' : 'canaretail';
  return null;
}
/** Two workspaces hold the same bundled teaching case (same id, or same case when both are teaching examples — a
 *  classroom workspace derived from a case never matches by case, only by id). */
export function sameCase(a, b) {
  if (!a || !b) return false;
  if (a.id === b.id) return true;
  const ca = inferCase(a), cb = inferCase(b);
  return !!ca && ca === cb;
}
export const CASE_LABEL = { medibec: 'MediBec (English)', 'medibec-fr': 'MediBec (French)', canaretail: 'CanaRetail (English)', 'canaretail-fr': 'CanaRetail (French)' };
