/* soar.js — the SOAR model (Beta 1.6.x), aligned with CRGO 0.10 crgo-soar and contract secops/v1.

   LOCAL ONLY. Nothing here connects to a product or executes anything on a real system: response
   actions are recorded by the people who carried them out, and playbooks are walked in dry runs.

   Rules carried by these records:
     • An alert is never an incident. A case becomes an incident only through an incident confirmation
       by a named person on a date; the incident is kept in the incident register (ws.csm.incidents).
     • Nothing authorises a response action except a recorded human approval. The check of an
       execution against the approvals is an AUDIT SIGNAL (same rule as CRGO approval_reason / SHACL
       ActionApproval / CQ-SOAR-02); the application never authorises an action.
     • Containment and destructive actions are gated by default (default-deny), whatever the gates say.
     • No self-approval: the approver of a decision is never its requester.
     • A published playbook version is frozen with a SHA-256; executions cite the exact version.
     • A regulator notice is also a regulatory submission (Compliance management → submissions).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S } from './state.js';
import { today } from './util.js';
import * as SH from './shared.js';

export const FORMAT = 'crg-soar-import/1';

/* ---------------- value sets (CRGO keys) ---------------- */
/** Case status machine. CRGO case status: open→new, eradicated→recovering, recovered→resolved. */
export const CASE_STATUS = [['open', 'Open (not yet triaged)'], ['investigating', 'Investigating'], ['contained', 'Contained'], ['eradicated', 'Eradicated'], ['recovered', 'Recovered'], ['closed', 'Closed']];
export const CASE_CRGO = { open: 'new', investigating: 'investigating', contained: 'contained', eradicated: 'recovering', recovered: 'resolved', closed: 'closed' };
export const SEVERITY = [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['critical', 'Critical']];
export const CATEGORY = [['malware', 'Malware'], ['unauthorised-access', 'Unauthorised access'], ['data-exposure', 'Data exposure'], ['denial-of-service', 'Denial of service'],
  ['social-engineering', 'Social engineering'], ['insider-misuse', 'Insider misuse'], ['loss-theft', 'Loss or theft'], ['misconfiguration', 'Misconfiguration exposure']];
export const RISK_CLASS = [['read-only', 'Read-only'], ['administrative', 'Administrative'], ['containment', 'Containment'], ['destructive', 'Destructive']];
/** Classes gated whatever the gates say (default-deny, CRGO secops/v1). */
export const ALWAYS_GATED = ['containment', 'destructive'];
export const TRIGGER = [['alert', 'Alert'], ['event', 'Event'], ['scheduled', 'Schedule'], ['manual', 'Manual request']];
export const EXEC_STATUS = [['succeeded', 'Succeeded'], ['partial', 'Partially succeeded'], ['failed', 'Failed'], ['cancelled', 'Cancelled'], ['compensated', 'Compensated (reversed)']];
export const EXEC_CRGO = { succeeded: 'succeeded', partial: 'failed', failed: 'failed', cancelled: 'cancelled', compensated: 'compensated' };
export const APPROVAL_KIND = [['specific', 'Specific action'], ['pre-authorisation', 'Pre-authorisation']];
export const OUTCOME = [['requested', 'Requested — no decision yet'], ['approved', 'Approved'], ['rejected', 'Rejected']];
/** The reasons an execution lacks a valid approval (secops/v1 executionsWithoutValidApproval.reason). */
export const REASONS = ['absent', 'expired', 'revoked', 'not-yet-valid', 'wrong-authority', 'not-corresponding', 'not-granted'];
export const REASON_LABEL = { absent: 'No approval recorded', expired: 'Approval expired', revoked: 'Approval revoked', 'not-yet-valid': 'Approval not yet valid',
  'wrong-authority': 'Approved by someone without the authority', 'not-corresponding': 'Approval does not correspond to this action', 'not-granted': 'Approval not granted' };
export const AUDIENCE = [['internal', 'Internal escalation'], ['governing-body', 'Governing body'], ['affected-persons', 'Affected persons'], ['customers-partners', 'Customers and partners'], ['regulator', 'Regulator'], ['law-enforcement', 'Law enforcement']];
export const METRIC = [['time-to-detect', 'Time to detect'], ['time-to-acknowledge', 'Time to acknowledge'], ['time-to-contain', 'Time to contain'], ['time-to-recover', 'Time to recover'], ['dwell-time', 'Dwell time']];
export const DIMENSION = [['operational', 'Operational'], ['financial', 'Financial'], ['regulatory', 'Regulatory'], ['reputational', 'Reputational'], ['privacy', 'Privacy'], ['safety', 'Safety']];
export const RECOVERY = [['restored', 'Restored'], ['partial', 'Partly restored'], ['not-restored', 'Not restored']];
export const SIM_RESULT = [['passed', 'Passed'], ['failed', 'Failed']];
export const VERSION_STATE = [['draft', 'Draft'], ['published', 'Published'], ['retired', 'Retired']];

const LISTS = ['cases', 'playbooks', 'gates', 'approvals', 'executions', 'simulations', 'lessons', 'impacts', 'communications', 'recoveries', 'measurements', 'artefacts', 'imports'];
/** The SOAR record, with the sub-registers this module adds filled lazily. */
export function reg(ws = S.ws) {
  const R = (ws.soar ||= {});
  for (const k of LISTS) if (!Array.isArray(R[k])) R[k] = [];
  return R;
}
export const nextId = (rows, prefix) => prefix + '-' + String(rows.reduce((m, r) => Math.max(m, Number(String(r.id || '').split('-').pop()) || 0), 0) + 1).padStart(3, '0');
const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase() && String(a || '').trim() !== '';
export const label = (set, k) => (set.find(x => x[0] === k) || [k, k || '—'])[1];
export const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

/* ---------------- time ---------------- */
/** A date or datetime as a comparable string; a bare date at the start of the day, or at its end for an end bound. Zones are ignored. */
export function T(v, end = false) {
  if (!v) return null;
  const s = String(v).trim().replace(' ', 'T').replace(/(Z|[+-]\d\d:?\d\d)$/, '');
  if (/^\d{4}-\d\d-\d\d$/.test(s)) return s + (end ? 'T23:59:59' : 'T00:00:00');
  return (s + ':00:00').slice(0, 19);
}
export const hoursBetween = (a, b) => { const x = T(a), y = T(b); if (!x || !y) return null; return Math.round((Date.parse(y) - Date.parse(x)) / 36e5 * 10) / 10; };

/* ---------------- cases ---------------- */
/** Accept the SIEM escalation shape {id, title, source:{kind:'alert', id}, opened, status:'open', severity, alerts, timeline} and fill the rest. */
export function normCase(c) {
  c.status ||= 'open'; c.alerts ||= []; c.timeline ||= []; c.artefactIds ||= [];
  c.timeline = c.timeline.map(e => typeof e === 'string' ? { at: '', by: '', text: e } : e);
  c.statusDates ||= {};
  return c;
}
export const nextStatus = s => { const i = CASE_STATUS.findIndex(x => x[0] === s); return i >= 0 && i < CASE_STATUS.length - 1 ? CASE_STATUS[i + 1][0] : null; };
/** Move a case along open→investigating→contained→eradicated→recovered→closed (closing is also allowed from any stage, with a rationale). */
export function advance(c, to, { by = '', at = nowLocal(), rationale = '' } = {}) {
  normCase(c);
  if (c.status === 'closed') return 'The case is closed.';
  if (to !== nextStatus(c.status) && to !== 'closed') return `A case moves one stage at a time: from ${c.status} the next stage is ${nextStatus(c.status)}.`;
  if (to === 'closed' && !String(rationale || c.closure || '').trim()) return 'Closing a case needs a closure rationale.';
  if (!String(by).trim()) return 'Name the person who records the change.';
  const from = c.status;
  c.status = to; c.statusDates[to] = at;
  if (to === 'closed') c.closure = rationale || c.closure;
  c.timeline.push({ at, by, text: `Status ${from} → ${to}${to === 'closed' ? ': ' + (rationale || c.closure) : ''}`, kind: 'status' });
  return null;
}

/* ---------------- incident confirmation ---------------- */
/**
 * Confirm a case as an incident: a named person and a date are required. Creates the incident in the
 * incident register (ws.csm.incidents) or links an existing one, with its confirmed date. The facts
 * (confirmed date, personal information involved, reportability) are what Compliance reads to compute
 * notification deadlines. Returns { error } or { incident }.
 */
export function confirmIncident(ws, c, { by, date, personalInfo = false, incident = '', title = '', category = '', newId = '' } = {}) {
  normCase(c);
  if (!String(by || '').trim()) return { error: 'An incident is confirmed by a named person.' };
  if (!/^\d{4}-\d\d-\d\d/.test(String(date || ''))) return { error: 'An incident confirmation needs the date it was confirmed.' };
  ws.csm ||= { bodies: [], roles: [], delegations: [], decisions: [], incidents: [] };
  const R = ws.csm.incidents;
  let inc = incident ? R.find(x => x.id === incident) : null;
  if (incident && !inc) return { error: 'The incident to link was not found in the incident register.' };
  const d = String(date).slice(0, 10);
  if (!inc) {
    inc = { id: newId && !R.some(x => x.id === newId) ? newId : nextId(R, 'INC'), title: title || c.title || c.id, status: 'confirmed', type: category || c.category || '', detected: String(c.opened || d).slice(0, 10),
      severity: c.severity || '', assets: (c.assets || []).join ? (c.assets || []).join(', ') : String(c.assets || ''), scenarios: [], timeline: [], source: 'soar', case: c.id,
      loi25: personalInfo ? 'undetermined' : 'not-assessed', gdpr: personalInfo ? 'undetermined' : 'not-assessed' };
    R.push(inc);
  }
  inc.confirmed = d; inc.confirmedBy = by; inc.status = ['contained', 'closed'].includes(inc.status) ? inc.status : 'confirmed';
  inc.personalInfo = !!(personalInfo || inc.personalInfo);
  if (inc.personalInfo && (!inc.loi25 || inc.loi25 === 'not-assessed')) inc.loi25 = 'undetermined';
  inc.case ||= c.id; inc.category ||= category || c.category || '';
  inc.timeline ||= []; inc.timeline.push(`${d} — confirmed as an incident by ${by} (case ${c.id})`);
  c.incident = inc.id;
  c.timeline.push({ at: d, by, text: `Confirmed as incident ${inc.id}`, kind: 'confirmation' });
  return { incident: inc };
}

/* ---------------- playbooks ---------------- */
export const currentVersion = pb => (pb.versions || []).find(v => v.version === pb.current) || null;
export const draftVersion = pb => (pb.versions || []).find(v => v.state === 'draft') || null;
/** The content a version's hash covers, in a fixed order. */
export function canonical(pb, v) {
  const step = s => ({ id: s.id, name: s.name || '', action: s.action || '', riskClass: s.riskClass || '', gate: s.gate || '', requiresGate: !!s.requiresGate, evidence: s.evidence || '' });
  return JSON.stringify({ playbook: pb.id, version: v.version, trigger: { kind: pb.trigger?.kind || '', conditions: pb.trigger?.conditions || '' }, steps: (v.steps || []).map(step) });
}
export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
/** What stops a version from being published (validation before publish). */
export function publishErrors(ws, pb, v) {
  const out = [], gates = reg(ws).gates;
  if (!v) return ['There is no draft version to publish.'];
  if (v.state !== 'draft') out.push('Only a draft version can be published.');
  if (!(v.steps || []).length) out.push('A playbook version needs at least one step.');
  (v.steps || []).forEach((s, i) => {
    const n = `Step ${i + 1}`;
    if (!String(s.action || '').trim()) out.push(`${n}: name the action.`);
    if (!RISK_CLASS.some(r => r[0] === s.riskClass)) out.push(`${n}: choose the risk class.`);
    if (s.gate && !gates.some(g => g.id === s.gate)) out.push(`${n}: approval gate ${s.gate} does not exist.`);
    if (ALWAYS_GATED.includes(s.riskClass) && !s.requiresGate && !s.gate) out.push(`${n}: a ${s.riskClass} action must require an approval gate.`);
  });
  return out;
}
/** Freeze a draft: state published, hash, who and when. The previous published version is retired. */
export async function publish(ws, pb, v, { by, date = today() } = {}) {
  if (!String(by || '').trim()) return { error: 'Name the person who publishes the version.' };
  const errs = publishErrors(ws, pb, v);
  if (errs.length) return { error: errs.join(' ') };
  for (const o of pb.versions) if (o.state === 'published') o.state = 'retired';
  v.state = 'published'; v.published = date; v.publishedBy = by;
  v.sha256 = await sha256(canonical(pb, v));
  pb.current = v.version;
  return { version: v };
}
/** A new draft from a version (published versions are never edited). */
export function newDraft(pb, from = currentVersion(pb)) {
  pb.versions ||= [];
  if (draftVersion(pb)) return draftVersion(pb);
  const n = pb.versions.reduce((m, v) => Math.max(m, v.version || 0), 0) + 1;
  const v = { version: n, state: 'draft', steps: (from?.steps || []).map(s => ({ ...s })), created: today() };
  pb.versions.push(v); return v;
}
/** Is the stored hash of a published version still the hash of its content? */
export async function verifyVersion(pb, v) { return !!v.sha256 && v.sha256 === await sha256(canonical(pb, v)); }
export const simulationPassed = (ws, pb) => pb.current != null && reg(ws).simulations.some(s => s.playbook === pb.id && s.version === pb.current && s.result === 'passed');

/* ---------------- gates and approvals ---------------- */
const inForce = (g, t) => (!g.validFrom || !t || T(g.validFrom) <= t) && (!g.validUntil || !t || T(g.validUntil, true) >= t);
const stepOf = (ws, x) => { const pb = reg(ws).playbooks.find(p => p.id === x.playbook); const v = pb?.versions?.find(v => v.version === Number(x.version)); return v?.steps?.find(s => s.id === x.step) || null; };
/** The gates that apply to an execution (or to a step in a dry run): by risk class, critical asset, or named on the step. */
export function gatesFor(ws, { riskClass, criticalAsset = false, gate = '', step = null }, t = null) {
  const ids = new Set([gate, step?.gate].filter(Boolean));
  return reg(ws).gates.filter(g => inForce(g, t) && (ids.has(g.id) || (g.riskClasses || []).includes(riskClass) || (g.criticalAssets && criticalAsset)));
}
/** Does this action need an approval? Containment and destructive always do (default-deny). */
export function isGated(ws, x, t = null) {
  const step = x.step && typeof x.step === 'object' ? x.step : stepOf(ws, x);
  return ALWAYS_GATED.includes(x.riskClass) || !!step?.requiresGate || gatesFor(ws, { ...x, step }, t).length > 0;
}
/** requested / granted / denied / expired / revoked, at a time (CRGO approval status). */
export function approvalStatus(a, at = T(today(), true)) {
  if (a.outcome === 'rejected') return 'denied';
  if (a.outcome !== 'approved') return 'requested';
  if (a.revokedOn && T(a.revokedOn) <= at) return 'revoked';
  if (a.validUntil && T(a.validUntil, true) < at) return 'expired';
  return 'granted';
}
/** Errors that stop an approval decision from being recorded (no self-approval, bounded pre-authorisation). */
export function approvalError(a) {
  if (!String(a.requestedBy || '').trim()) return 'Name the person who requests the approval.';
  if (a.outcome !== 'requested') {
    if (!String(a.approver || '').trim()) return 'A decision needs the name of the approver.';
    if (same(a.approver, a.requestedBy)) return 'No self-approval: the approver cannot be the person who requested the approval.';
    if (!a.decidedOn) return 'A decision needs the date it was made.';
  }
  if (a.outcome === 'approved') {
    if (!a.validFrom) return 'An approval needs the start of its validity.';
    if (a.validUntil && T(a.validUntil, true) < T(a.validFrom)) return 'The approval ends before it starts.';
    if (a.kind === 'pre-authorisation') {
      if (!a.validUntil) return 'A pre-authorisation must have an expiry.';
      if (!(a.riskClasses || []).length) return 'A pre-authorisation must name the risk classes it covers.';
      if (!(a.targets || []).length && !String(a.scope || '').trim() && !a.case) return 'A pre-authorisation must be bounded by a scope: targets, a case or a written scope.';
    } else if (!a.execution && !String(a.action || '').trim()) return 'A specific approval names the execution or the action it approves.';
  }
  if (a.revokedOn && !String(a.revokedBy || '').trim()) return 'A revocation needs the name of the person who revoked the approval.';
  return null;
}
const corresponds = (a, x) => {
  if (a.case && x.case && a.case !== x.case) return false;
  if (a.execution) return a.execution === x.id;
  if (a.kind === 'pre-authorisation') {
    if (!(a.riskClasses || []).includes(x.riskClass)) return false;
    if ((a.targets || []).length && !(a.targets || []).some(t => same(t, x.target))) return false;
    if (a.action && !same(a.action, x.action)) return false;
    return true;
  }
  return !!a.action && same(a.action, x.action) && (!(a.targets || []).length || (a.targets || []).some(t => same(t, x.target)));
};
/**
 * Why an execution lacks a valid approval, or null when the approval it relied on is valid.
 * Same rule as CRGO approval_reason: absent, not-granted, not-corresponding, wrong-authority,
 * not-yet-valid, revoked, expired; the most telling reason is returned. An AUDIT SIGNAL only.
 */
export function approvalReason(ws, x) {
  if (!isGated(ws, x, T(x.started))) return null;
  const R = reg(ws), t = T(x.started);
  const ids = Array.isArray(x.approval) ? x.approval : x.approval ? [x.approval] : [];
  const aps = ids.map(id => R.approvals.find(a => a.id === id)).filter(Boolean);
  if (!aps.length) return 'absent';
  const step = stepOf(ws, x);
  const auth = new Set(gatesFor(ws, { ...x, step }, t).flatMap(g => (g.authorities || []).map(s => s.trim().toLowerCase())));
  const reasons = [];
  for (const a of aps) {
    if (a.outcome !== 'approved') { reasons.push('not-granted'); continue; }
    if (!corresponds(a, x)) { reasons.push('not-corresponding'); continue; }
    if (same(a.approver, a.requestedBy) || (auth.size && !auth.has(String(a.approver || '').trim().toLowerCase()))) { reasons.push('wrong-authority'); continue; }
    if (!t || !a.decidedOn || !a.validFrom || T(a.decidedOn) > t || T(a.validFrom) > t) { reasons.push('not-yet-valid'); continue; }
    if (a.revokedOn && T(a.revokedOn) <= t) { reasons.push('revoked'); continue; }
    if (a.validUntil && T(a.validUntil, true) < t) { reasons.push('expired'); continue; }
    return null;
  }
  const order = ['expired', 'revoked', 'not-yet-valid', 'wrong-authority', 'not-corresponding', 'not-granted'];
  return reasons.sort((p, q) => order.indexOf(p) - order.indexOf(q))[0];
}
/** Every gated execution without a valid approval (secops/v1 executionsWithoutValidApproval). */
export const unapproved = (ws = S.ws) => reg(ws).executions.map(x => ({ x, reason: approvalReason(ws, x) })).filter(r => r.reason);
export const executionError = (ws, x) => {
  if (!String(x.action || '').trim()) return 'Name the action carried out.';
  if (!RISK_CLASS.some(r => r[0] === x.riskClass)) return 'Choose the risk class of the action.';
  if (!String(x.performedBy || '').trim()) return 'Name the person who carried out the action.';
  if (!x.started) return 'Record when the action started.';
  if (!String(x.attempt || '').trim()) return 'An execution needs an attempt identifier.';
  if (reg(ws).executions.some(o => o !== x && o.id !== x.id && o.attempt === x.attempt)) return 'This attempt identifier is already used.';
  if (x.ended && T(x.ended) < T(x.started)) return 'The action ends before it starts.';
  return null;
};

/* ---------------- dry-run simulation ---------------- */
/**
 * Walk a playbook version without executing anything: for each step, whether it needs an approval,
 * whether a valid approval or pre-authorisation would be in force for the case at the date, and whether
 * expected evidence is defined. Result "failed" when a step cannot be performed as written (no action,
 * no risk class, a gated step without an approval path, no expected evidence, unknown gate).
 */
export function dryRun(ws, pb, version, { caseId = '', scenario = '', at = nowLocal() } = {}) {
  const R = reg(ws), v = (pb.versions || []).find(x => x.version === Number(version));
  if (!v) return { error: 'Choose a playbook version.' };
  const t = T(at), c = R.cases.find(x => x.id === caseId) || null;
  const steps = (v.steps || []).map((s, i) => {
    const issues = [], flags = [];
    if (!String(s.action || '').trim()) issues.push('no action');
    if (!RISK_CLASS.some(r => r[0] === s.riskClass)) issues.push('no risk class');
    if (s.gate && !R.gates.some(g => g.id === s.gate)) issues.push(`unknown gate ${s.gate}`);
    const x = { riskClass: s.riskClass, action: s.action, target: c?.target || '', case: caseId, criticalAsset: !!s.criticalAsset, step: s };
    const gated = isGated(ws, x, t);
    let approval = '';
    if (gated) {
      flags.push('needs approval');
      const gs = gatesFor(ws, x, t);
      const auth = gs.flatMap(g => g.authorities || []);
      if (!gs.length) flags.push('no gate in force names an authority: any approver other than the requester');
      const valid = R.approvals.find(a => a.outcome === 'approved' && approvalStatus(a, t) === 'granted' && a.validFrom && T(a.validFrom) <= t && corresponds(a, { ...x, id: '' })
        && !same(a.approver, a.requestedBy) && (!auth.length || auth.some(n => same(n, a.approver))));
      approval = valid ? valid.id : '';
      if (!valid) flags.push('no valid approval or pre-authorisation in force — a person must approve before this step');
    }
    if (!String(s.evidence || '').trim()) issues.push('missing expected evidence');
    return { n: i + 1, id: s.id, name: s.name || '', action: s.action || '', riskClass: s.riskClass || '', gated, approval, flags, issues };
  });
  return { playbook: pb.id, version: v.version, case: caseId, scenario, at, steps, result: steps.some(s => s.issues.length) ? 'failed' : 'passed', executed: false };
}
/** Record a dry run as a simulation (a person, a date, the result). */
export function recordSimulation(ws, run, { by, date = today(), notes = '' } = {}) {
  if (!String(by || '').trim()) return { error: 'Name the person who ran the simulation.' };
  const R = reg(ws);
  const sim = { id: nextId(R.simulations, 'SIM'), playbook: run.playbook, version: run.version, case: run.case || '', scenario: run.scenario || '', date, by, mode: 'dry-run', result: run.result,
    steps: run.steps.map(s => ({ step: s.id, action: s.action, riskClass: s.riskClass, needsApproval: s.gated, approval: s.approval, flags: s.flags, issues: s.issues })), notes };
  R.simulations.push(sim);
  return { simulation: sim };
}

/* ---------------- communications → submissions ---------------- */
/** A regulator notice is also a regulatory submission: create the ws.cms.submissions record once. Returns the number created. */
export function syncSubmissions(ws = S.ws) {
  ws.cms ||= {}; ws.cms.submissions ||= [];
  const subs = ws.cms.submissions; let n = 0;
  for (const m of reg(ws).communications) {
    if (m.audience !== 'regulator') continue;
    let s = m.submission ? subs.find(x => x.id === m.submission) : null;
    if (!s) {
      s = { id: nextId(subs, 'SUB'), authority: m.authority || '', subject: m.subject || `Incident notice ${m.incident || ''}`.trim(), due: m.due || '', submitted: String(m.sentAt || '').slice(0, 10), receipt: m.receipt || '', source: { kind: 'incident', id: m.incident || '' } };
      subs.push(s); m.submission = s.id; n++;
    } else { // keep the facts the notice carries in step; Compliance owns the rest of the record
      s.submitted ||= String(m.sentAt || '').slice(0, 10); s.receipt ||= m.receipt || ''; s.authority ||= m.authority || '';
    }
  }
  return n;
}
export const communicationError = m => !m.incident ? 'Choose the incident the communication is about.' : !m.audience ? 'Choose the audience.'
  : m.audience === 'regulator' && !String(m.authority || '').trim() ? 'A notice to a regulator names the authority.' : null;

/* ---------------- measurements ---------------- */
/** Proposed response measurements for an incident, from the dates recorded on it and its case (hours). */
export function proposeMeasures(ws, inc) {
  const c = reg(ws).cases.find(x => x.id === inc.case || x.incident === inc.id);
  const det = inc.detected, start = inc.activityStart || c?.activityStart, sd = c?.statusDates || {};
  const out = [];
  const add = (metric, from, to, method) => { const h = hoursBetween(from, to); if (h != null && h >= 0) out.push({ metric, hours: h, method }); };
  add('time-to-detect', start, det, 'from the start of malicious activity to detection (incident detected date)');
  add('time-to-acknowledge', c?.opened, sd.investigating, 'from the case opening to the start of the investigation');
  add('time-to-contain', det, sd.contained, 'from detection to the case status "contained"');
  add('time-to-recover', det, sd.recovered, 'from detection to the case status "recovered"');
  add('dwell-time', start, sd.contained, 'from the start of malicious activity to containment');
  return out;
}

/* ---------------- lessons → shared corrective actions ---------------- */
export function lessonAction(ws, l, { title, owner = '', due = '' } = {}) {
  const A = SH.actions(ws);
  const src = l.incident ? { kind: 'incident', id: l.incident } : { kind: 'case', id: l.case };
  const a = { id: nextId(A, 'ACT'), title: title || l.lesson || 'Lesson learned', description: l.lesson || '', source: src, owner, due, state: 'open', opened: today(),
    links: [l.case ? { kind: 'case', id: l.case } : null, l.incident ? { kind: 'incident', id: l.incident } : null].filter(Boolean), lesson: l.id };
  A.push(a); (l.actions ||= []).push(a.id);
  return a;
}

/* ---------------- import crg-soar-import/1 ---------------- */
const isDate = v => /^\d{4}-\d\d-\d\d$/.test(String(v || ''));
const isDT = v => /^\d{4}-\d\d-\d\d([T ]\d\d:\d\d(:\d\d)?(\.\d+)?(Z|[+-]\d\d:?\d\d)?)?$/.test(String(v || ''));
const inSet = (set, v) => set.some(x => x[0] === v);
const VALID = {
  playbooks: p => !p.id ? 'id required' : !p.name ? 'name required' : !Array.isArray(p.versions) || !p.versions.length ? 'versions[] required'
    : p.trigger && !inSet(TRIGGER, p.trigger.kind) ? 'trigger.kind not allowed'
    : p.versions.map(v => !Number.isInteger(v.version) || v.version < 1 ? 'version must be an integer ≥ 1' : !inSet(VERSION_STATE, v.state) ? 'version state not allowed'
      : (v.steps || []).map(s => !s.id ? 'step id required' : !s.action ? 'step action required' : !inSet(RISK_CLASS, s.riskClass) ? `step ${s.id}: riskClass not allowed` : null).find(Boolean)
      || (v.state === 'published' && (!isDate(v.published) || !v.publishedBy) ? 'a published version needs published (date) and publishedBy' : null)).find(Boolean)
    || (p.versions.filter(v => v.state === 'published').length > 1 ? 'at most one published version' : null) || (p.versions.filter(v => v.state === 'draft').length > 1 ? 'at most one draft version' : null),
  cases: c => !c.id ? 'id required' : !c.title ? 'title required' : !isDT(c.opened) ? 'opened (date) required' : !inSet(CASE_STATUS, c.status || 'open') ? 'status not allowed'
    : c.severity && !inSet(SEVERITY, c.severity) ? 'severity not allowed' : c.category && !inSet(CATEGORY, c.category) ? 'category not allowed'
    : c.source && !['alert', 'manual', 'report', 'hunt'].includes(c.source.kind) ? 'source.kind not allowed' : null,
  gates: g => !g.id ? 'id required' : !g.name ? 'name required' : !(g.riskClasses || []).every(r => inSet(RISK_CLASS, r)) ? 'riskClasses not allowed' : !Array.isArray(g.authorities) || !g.authorities.length ? 'authorities[] required' : null,
  approvals: a => !a.id ? 'id required' : !inSet(APPROVAL_KIND, a.kind || 'specific') ? 'kind not allowed' : !inSet(OUTCOME, a.outcome) ? 'outcome not allowed'
    : !(a.riskClasses || []).every(r => inSet(RISK_CLASS, r)) ? 'riskClasses not allowed' : [a.decidedOn, a.validFrom, a.validUntil, a.revokedOn].some(v => v && !isDT(v)) ? 'dates must be YYYY-MM-DD or YYYY-MM-DDTHH:MM' : approvalError({ kind: 'specific', ...a }),
  executions: x => !x.id ? 'id required' : !isDT(x.started) ? 'started required (YYYY-MM-DDTHH:MM)' : !inSet(EXEC_STATUS, x.status) ? 'status not allowed' : null,
  simulations: s => !s.id ? 'id required' : !s.playbook || !Number.isInteger(s.version) ? 'playbook and version (integer) required' : !inSet(SIM_RESULT, s.result) ? 'result must be passed or failed' : !isDate(s.date) ? 'date required' : !s.by ? 'by required' : null,
  lessons: l => !l.id ? 'id required' : !l.lesson ? 'lesson required' : !l.case && !l.incident ? 'case or incident required' : null,
  impacts: m => !m.id ? 'id required' : !m.incident ? 'incident required' : !inSet(DIMENSION, m.dimension) ? 'dimension not allowed' : null,
  communications: m => !m.id ? 'id required' : !inSet(AUDIENCE, m.audience) ? 'audience not allowed' : communicationError(m),
  recoveries: m => !m.id ? 'id required' : !m.incident ? 'incident required' : !isDate(m.date) ? 'date required' : !m.verifiedBy ? 'verifiedBy required' : !inSet(RECOVERY, m.result) ? 'result not allowed' : null,
  measurements: m => !m.id ? 'id required' : !m.incident ? 'incident required' : !inSet(METRIC, m.metric) ? 'metric not allowed' : typeof m.hours !== 'number' || m.hours < 0 ? 'hours must be a number ≥ 0' : null,
  artefacts: m => !m.id ? 'id required' : !m.pointer ? 'pointer required' : m.sha256 && !/^[0-9a-f]{64}$/i.test(m.sha256) ? 'sha256 must be 64 hexadecimal characters' : null,
};
export const IMPORT_KEYS = Object.keys(VALID);
/**
 * Import a crg-soar-import/1 document. Records are validated one by one: invalid ones are skipped and
 * reported. A record whose id already exists replaces it. Published versions get their SHA-256
 * recomputed (a supplied hash that does not match is reported). Confirmations go through
 * confirmIncident (a person, a date). Regulator notices create submissions.
 */
export async function importDoc(ws, doc) {
  if (!doc || typeof doc !== 'object' || doc.format !== FORMAT) return { error: `Not a ${FORMAT} document (the "format" field must be "${FORMAT}").` };
  const R = reg(ws), rep = { added: {}, replaced: {}, skipped: [], warnings: [] };
  for (const k of IMPORT_KEYS) {
    const rows = doc[k]; if (rows == null) continue;
    if (!Array.isArray(rows)) { rep.skipped.push({ list: k, id: '', why: 'must be an array' }); continue; }
    for (const raw of rows) {
      const r = JSON.parse(JSON.stringify(raw || {}));
      if (k === 'cases') normCase(r);
      if (k === 'approvals') r.kind ||= 'specific';
      const why = VALID[k](r);
      if (why) { rep.skipped.push({ list: k, id: r.id || '', why }); continue; }
      if (k === 'playbooks') {
        for (const v of r.versions) {
          v.steps ||= [];
          if (v.state !== 'draft') {
            const h = await sha256(canonical(r, v));
            if (v.sha256 && v.sha256 !== h) rep.warnings.push(`${r.id} v${v.version}: the supplied sha256 does not match the content; recomputed`);
            v.sha256 = h;
          }
        }
        const pub = r.versions.find(v => v.state === 'published');
        r.current = pub ? pub.version : (Number.isInteger(r.current) ? r.current : null);
        r.trigger ||= { kind: 'manual', conditions: '' };
      }
      const i = R[k].findIndex(x => x.id === r.id);
      if (i >= 0) { R[k][i] = r; rep.replaced[k] = (rep.replaced[k] || 0) + 1; } else { R[k].push(r); rep.added[k] = (rep.added[k] || 0) + 1; }
    }
  }
  for (const cf of Array.isArray(doc.confirmations) ? doc.confirmations : []) {
    const c = R.cases.find(x => x.id === cf.case);
    if (!c) { rep.skipped.push({ list: 'confirmations', id: cf.case || '', why: 'case not found' }); continue; }
    const exists = cf.incident && (ws.csm?.incidents || []).some(x => x.id === cf.incident);
    const out = confirmIncident(ws, c, { by: cf.by, date: cf.date, personalInfo: !!cf.personalInfo, incident: exists ? cf.incident : '', newId: exists ? '' : (cf.incident || ''), title: cf.title || '', category: cf.category || '' });
    if (out.error) rep.skipped.push({ list: 'confirmations', id: cf.case, why: out.error });
    else rep.added.confirmations = (rep.added.confirmations || 0) + 1;
  }
  rep.submissions = syncSubmissions(ws);
  for (const s of R.executions) if (!R.cases.some(c => c.id === s.case) && s.case) rep.warnings.push(`execution ${s.id}: case ${s.case} not found`);
  return rep;
}
