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
import { S, touch, isReadOnly } from './state.js';
import { tr } from './i18n.js';
import { VERSION } from './version.js';
import { today } from './util.js';
import { TEACHING_KINDS } from './reset.js';
import * as users from './users.js';
import { AVL_VECTORS } from './migrate.js';

/** The earlier (AV:N) vector → the current (AV:L) vector, per scenario of the bundled case (one copy: migrate.js). */
export const VECTORS = AVL_VECTORS;
export const KIND = 're-vector';
const NOTE_EN = 'AV:L: the document is delivered by e-mail but opened locally (FIRST CVSS v4.0 user guide).';
/** 1.9.0 — the note in English and in the language of the screen, so an existing note in either is recognised. */
const NOTES = () => [NOTE_EN, tr(NOTE_EN), 'AV:L: the malicious document is delivered by e-mail but opened locally.', tr('AV:L: the malicious document is delivered by e-mail but opened locally.')];

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

/** The last journalled decision on this case ("accepted" | "declined" | null) — 1.9.0: of THIS workspace only.
    A decision is journalled with the workspace's identifier, so a classroom copy or an imported file (which get
    a new identifier) does not inherit the decline of the case it was copied from and is offered the vectors. */
export function lastEntry(ws = S.ws) {
  return [...(ws?.migrationLog || [])].reverse().find(x => x && x.kind === KIND && x.ws === ws.id) || null;
}
export function decision(ws = S.ws) {
  const e = lastEntry(ws);
  return e ? e.decision : null;
}

/** Offer the change on screen? Teaching case, still on AV:N, no decision journalled yet, and writable (1.9.0: a
    workspace written by a newer release opens read-only; accepting there could not be saved). */
export const pending = (ws = S.ws) => detect(ws).length > 0 && decision(ws) === null && !isReadOnly(ws);
/** 1.9.0 — declined earlier and still on AV:N: the Process page offers to reconsider (journalled as a new entry). */
export const reconsider = (ws = S.ws) => detect(ws).length > 0 && decision(ws) === 'declined' && !isReadOnly(ws);

function journal(ws, decision, ids, who) {
  (ws.migrationLog ||= []).push({ date: today(), kind: KIND, by: VERSION, ws: ws.id, decision, scenarios: ids, who: who || '',
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
  if (!found.length || isReadOnly(ws)) return [];
  const who = users.name();
  for (const f of found) {
    const sc = f.scenario;
    sc.cvss = f.to;
    // A stored score equal to the AV:N vector's own score is stale and goes. Any other score is the student's own
    // override (1.9.0): it is kept, and the revision records it so nothing disappears without a trace.
    const own = sc.cvss_score !== undefined && sc.cvss_score !== null && sc.cvss_score !== '' && Number(sc.cvss_score) !== stale(f.from) ? sc.cvss_score : null;
    if (own === null) delete sc.cvss_score;
    const note = sc.cvss_note || '';
    sc.cvss_note = NOTES().some(n => note.includes(n)) ? note : `${note ? note.trim() + ' ' : ''}${tr(NOTE_EN)}`;
    const what = tr('CVSS vector {0} → {1} (AV:N → AV:L, current MediBec case); accepted{2}').replace('{0}', f.from).replace('{1}', f.to)
      .replace('{2}', who ? tr(' by {0}').replace('{0}', who) : '')
      + (own !== null ? ' ' + tr('(your typed score {0} is kept; check it against the new vector)').replace('{0}', own) : '');
    (sc.revisions ||= []).push({ date: today(), what, ...(own !== null ? { cvss_score: own } : {}) });
  }
  journal(ws, 'accepted', found.map(f => f.id), who);
  touch('avl');
  return found.map(f => f.id);
}

/** The score of a vector (CVSS4 engine), or NaN when the engine is not loaded. */
function stale(vector) {
  try { return typeof CVSS4 === 'undefined' ? NaN : Number(CVSS4.score(vector)); } catch { return NaN; }  /* global CVSS4 */
}

/** Record that the person keeps the earlier vectors; the offer is not shown again (QC-26 still reports it, and the
    Process page keeps a small "Reconsider" action — 1.9.0). */
export function decline(ws = S.ws) {
  const found = detect(ws);
  if (!found.length || isReadOnly(ws)) return;
  journal(ws, 'declined', found.map(f => f.id), users.name());
  touch('avl');
}
