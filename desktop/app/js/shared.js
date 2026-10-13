/* shared.js — the registers every management module uses: evidence, corrective actions, exceptions and
   qualified mappings. One record each, referenced from wherever it is used ({kind, id} links), so the
   same evidence, action or exception is never typed twice in two modules.

   Rules carried by these records (CRGO 0.10):
     • A mapping, a policy statement, an acknowledgement or an attestation is never compliance.
     • An exception is a time-limited departure from an internal requirement; it never waives a law.
       Only an authority grants a regulatory exemption (Compliance management → exemptions).
     • Evidence has a validity: expired evidence, or evidence judged insufficient, is an evidence gap.
     • A corrective action is closed only when someone other than its owner verified it.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S } from './state.js';
import { today } from './util.js';

export const KINDS = [['policy', 'Policy'], ['statement', 'Policy statement'], ['control', 'Control or safeguard'], ['obligation', 'Obligation'],
  ['finding', 'Audit finding'], ['observation', 'Audit observation'], ['issue', 'Policy non-compliance'], ['incident', 'Incident'], ['case', 'SOAR case'],
  ['rule', 'Detection rule'], ['playbook', 'Playbook'], ['scenario', 'Risk scenario'], ['determination', 'Compliance determination'], ['campaign', 'Compliance campaign'],
  ['engagement', 'Audit engagement'], ['submission', 'Regulatory submission'], ['gap', 'Detection gap'], ['alert', 'SIEM alert'], ['indicator', 'Threat indicator'], ['lesson', 'Lesson learned'], ['other', 'Other']];
export const kindLabel = k => (KINDS.find(x => x[0] === k) || [k, k])[1];

/* ---------------- accessors ---------------- */
export const reg = (ws = S.ws) => (ws.shared ||= { evidence: [], actions: [], exceptions: [], mappings: [] });
export const evidence = (ws = S.ws) => reg(ws).evidence;
export const actions = (ws = S.ws) => reg(ws).actions;
export const exceptions = (ws = S.ws) => reg(ws).exceptions;
export const mappings = (ws = S.ws) => reg(ws).mappings;

/** Records linked to {kind, id}, in a given register. */
export const linkedTo = (rows, kind, id) => rows.filter(r => (r.links || r.concerns || []).some(l => l.kind === kind && l.id === id) || (r.source?.kind === kind && r.source?.id === id));

/* ---------------- evidence ---------------- */
export const SUFFICIENCY = [['', 'Not judged'], ['sufficient', 'Sufficient'], ['insufficient', 'Judged insufficient']];
/** current / expired / judged-insufficient / none — the same four values as CRGO compliance/v1. */
export function evidenceStatus(e, asOf = today()) {
  if (!e) return 'none';
  if (e.sufficiency === 'insufficient') return 'judged-insufficient';
  if (e.validUntil && e.validUntil < asOf) return 'expired';
  return 'current';
}
/** The status of the best evidence linked to a record (current wins over expired, expired over insufficient). */
export function bestEvidence(kind, id, ws = S.ws, asOf = today()) {
  const st = linkedTo(evidence(ws), kind, id).map(e => evidenceStatus(e, asOf));
  for (const s of ['current', 'expired', 'judged-insufficient']) if (st.includes(s)) return s;
  return 'none';
}
export const EVIDENCE_KIND = { current: 'good', expired: 'bad', 'judged-insufficient': 'bad', none: 'warn' };

/* ---------------- corrective actions ---------------- */
export const ACTION_STATES = [['open', 'Open'], ['progress', 'In progress'], ['done', 'Done — awaiting verification'], ['verified', 'Verified and closed'], ['cancelled', 'Cancelled']];
export const actionOverdue = (a, asOf = today()) => a.due && a.due < asOf && !['verified', 'cancelled'].includes(a.state);
/** Closing needs a verifier who is not the owner. Returns an error message or null. */
export function closeActionError(a) {
  if (a.state !== 'verified') return null;
  if (!a.verifiedBy) return 'A verified action needs the name of the person who verified it.';
  if (a.owner && a.verifiedBy.trim().toLowerCase() === a.owner.trim().toLowerCase()) return 'The owner of an action cannot verify it: verification must be independent.';
  return null;
}

/* ---------------- exceptions ---------------- */
export const EXC_STATES = [['requested', 'Requested'], ['accepted', 'Accepted'], ['refused', 'Refused'], ['closed', 'Closed']];
export const exceptionExpired = (x, asOf = today()) => x.status === 'accepted' && x.expiry && x.expiry < asOf;
/** Accepted exceptions that touch a legal obligation: a compliance exposure, never a waiver. */
export const lawExceptions = (ws = S.ws) => exceptions(ws).filter(x => x.status === 'accepted' && (String(x.legalObligation || '').trim() || (x.concerns || []).some(l => l.kind === 'obligation')));
export function exceptionError(r) {
  if (r.status === 'accepted' && String(r.legalObligation || '').trim()) return 'An exception can never waive a law: a departure from a legal obligation is a non-compliance, not an exception.';
  if (r.status === 'accepted' && !r.approvedBy) return 'An accepted exception needs the name of the person who approved it.';
  if (r.status === 'accepted' && !r.expiry) return 'An accepted exception needs an expiry date.';
  return null;
}

/* ---------------- qualified mappings ---------------- */
/** Mapping types (CRGO 0.10 mapping assertions). None of them is evidence of compliance. */
export const MAP_TYPES = [['exact', 'Exact'], ['full', 'Full coverage'], ['partial', 'Partial coverage'], ['broader', 'Broader'], ['narrower', 'Narrower'], ['related', 'Related'], ['conflicting', 'Conflicting']];
export const REVIEW_STATES = [['proposed', 'Proposed'], ['reviewed', 'Reviewed'], ['rejected', 'Rejected']];
export const CONFIDENCE = [['high', 'High'], ['medium', 'Medium'], ['low', 'Low']];
