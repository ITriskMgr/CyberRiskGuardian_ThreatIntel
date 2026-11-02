/* avl.js — 1.8.2: opt-in re-vector of the MediBec teaching case, S2 and S8, from AV:N to AV:L.

   Background. Release 1.8.0 adopted AV:L for the malicious e-mailed document of MediBec S2 and S8 (the file is
   delivered by e-mail but opened locally — FIRST CVSS v4.0 user guide), which moved the reference totals to
   84,305 / 41,023. A migration never changes a real organization's numbers, so the 2 → 3 step left stored
   workspaces as they were and QC-26 pointed at Reset data → Start over, which also discards a student's work.

   This module offers the change instead, and only where it is safe:
     • teaching cases only — workspaces of kind `example` or `classroom` (reset.js TEACHING_KINDS);
     • only the two MediBec scenarios, recognised by their identifier AND the exact earlier vector;
     • opt-in — a person accepts or declines on the Process page; nothing happens on its own;
     • journalled — the decision is written to ws.migrationLog (kind "re-vector"), each scenario keeps a
       revision entry, and the engine recomputes everything from the new vectors; no number is typed in.
   A decline is journalled too, so the offer is not repeated; QC-26 keeps reporting the case until it is taken.
   No new workspace field: the journal is the existing migrationLog. © 2026 Marc-André Léger */
'use strict';
import { S, touch } from './state.js';
import { VERSION } from './version.js';
import { today } from './util.js';
import { TEACHING_KINDS } from './reset.js';
import * as users from './users.js';

/** The earlier (AV:N) vector → the current (AV:L) vector, per scenario of the bundled case. */
export const VECTORS = {
  S2: { from: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H', to: 'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H' },
  S8: { from: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:L/SC:H/SI:L/SA:L', to: 'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:L/SC:H/SI:L/SA:L' },
};
export const KIND = 're-vector';
const NOTE_EN = 'AV:L: the document is delivered by e-mail but opened locally (FIRST CVSS v4.0 user guide).';

/** Is this a teaching case? (real organizations are never offered the change) */
export const teaching = ws => !!ws && TEACHING_KINDS.includes(ws.kind);

/** The scenarios of a teaching case still on the earlier vectors: [{ id, from, to, scenario }]. */
export function detect(ws = S.ws) {
  if (!teaching(ws)) return [];
  const out = [];
  for (const sc of ws.assessment?.SCEN || []) {
    const v = VECTORS[sc.id];
    if (v && sc.cvss === v.from) out.push({ id: sc.id, from: v.from, to: v.to, scenario: sc });
  }
  return out;
}

/** The last journalled decision on this case ("accepted" | "declined" | null). */
export function decision(ws = S.ws) {
  const e = [...(ws?.migrationLog || [])].reverse().find(x => x && x.kind === KIND);
  return e ? e.decision : null;
}

/** Offer the change on screen? Teaching case, still on AV:N, and no decision journalled yet. */
export const pending = (ws = S.ws) => detect(ws).length > 0 && decision(ws) === null;

function journal(ws, decision, ids, who) {
  (ws.migrationLog ||= []).push({ date: today(), kind: KIND, by: VERSION, decision, scenarios: ids, who: who || '',
    notes: decision === 'accepted'
      ? [`S2/S8 vectors AV:N → AV:L accepted; cvss_note updated; stored score overrides removed; the engine recomputes every index (reference totals 84,305 / 41,023 when the case is otherwise unchanged)`]
      : ['AV:L vectors declined; the case keeps AV:N (84,491 / 41,104 when otherwise unchanged); Reset data → Start over takes the current case'] });
}

/**
 * Apply the change to a teaching case: vectors, cvss_note, no stored score override, a revision entry per
 * scenario, a journal entry. Returns the identifiers changed. Nothing happens for a real organization.
 */
export function accept(ws = S.ws) {
  const found = detect(ws);
  if (!found.length) return [];
  const who = users.name();
  for (const f of found) {
    const sc = f.scenario;
    sc.cvss = f.to;
    delete sc.cvss_score;                 // a stored score of the AV:N vector would now disagree with its vector
    sc.cvss_note = /opened locally/i.test(sc.cvss_note || '') ? sc.cvss_note : `${sc.cvss_note ? sc.cvss_note.trim() + ' ' : ''}${NOTE_EN}`;
    (sc.revisions ||= []).push({ date: today(), what: `CVSS vector ${f.from} → ${f.to} (AV:N → AV:L, current MediBec case); accepted${who ? ' by ' + who : ''}` });
  }
  journal(ws, 'accepted', found.map(f => f.id), who);
  touch('avl');
  return found.map(f => f.id);
}

/** Record that the person keeps the earlier vectors; the offer is not shown again (QC-26 still reports it). */
export function decline(ws = S.ws) {
  const found = detect(ws);
  if (!found.length) return;
  journal(ws, 'declined', found.map(f => f.id), users.name());
  touch('avl');
}
