/* cms.js — the compliance management model (Beta 1.6.x), aligned with CRGO 0.10 `crgo-compliance` and the
   read contract compliance/v1.

   Records (all inside ws.cms, filled lazily):
     sources          laws, regulations, contracts, standards — each with its versions / editions
     obligations      atomic obligations: source + version + provision cited, a paraphrase (never licensed
                      text), owner, applicability with rationale and reviewer
     interpretations  how the organisation reads an obligation: legal-review state, privilege flag
     authorities      regulatory authorities (only they grant exemptions and receive submissions)
     exemptions       regulatory exemptions granted by an authority, on a legal basis, for a scope and period
     programmes, objectives, adoptions   the compliance programme, its objectives, framework adoptions
     campaigns        assessment campaigns over a set of obligations; they produce the determinations kept
                      in ws.grc.determinations (one register for every compliance determination)
     deadlines        calendar dates or event-triggered (counted from an incident confirmation)
     submissions      regulatory submissions with their approval and receipt
     changes          regulatory change log and impact
   Shared registers (js/shared.js) hold evidence, corrective actions, exceptions and mappings.

   Rules: a mapping, an acknowledgement or an attestation is never compliance — only the latest dated
   determination states a compliance state, and its evidence status says whether the evidence relied on
   was current. An internal exception never waives a law; only an authority grants an exemption.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S } from './state.js';
import { today } from './util.js';
import * as SH from './shared.js';

/* ---------------- value sets (CRGO terms) ---------------- */
export const SOURCE_TYPES = [['law', 'Law'], ['regulation', 'Regulation'], ['guidance', 'Regulatory guidance'], ['contract', 'Contract or agreement'], ['standard', 'Standard or framework'], ['policy', 'Internal directive'], ['other', 'Other']];
export const SOURCE_STATUS = [['in-force', 'In force'], ['adopted', 'Adopted, not yet in force'], ['draft', 'Draft or bill'], ['repealed', 'Repealed or withdrawn']];
/** Applicability of an obligation to the organisation: five states; unknown never becomes "not applicable". */
export const APPLICABILITY = [['not-assessed', 'Not assessed'], ['applicable', 'Applicable'], ['potentially-applicable', 'Potentially applicable — qualified review required'],
  ['undetermined', 'Unknown — evidence gap'], ['not-applicable', 'Not applicable']];
export const LEGAL_REVIEW = [['not-reviewed', 'Not legally reviewed'], ['in-review', 'Legal review in progress'], ['reviewed', 'Legally reviewed']];
export const SUB_STATES = [['preparation', 'In preparation'], ['submitted', 'Submitted'], ['acknowledged', 'Acknowledged by the authority'], ['rejected', 'Rejected by the authority']];
export const TRIGGERS = [['calendar', 'Calendar date'], ['event', 'Event-triggered (incident confirmation)']];
export const UNITS = [['hours', 'Hours'], ['days', 'Calendar days'], ['business-days', 'Business days']];
export const RECURRENCE = [['', 'Once'], ['annual', 'Every year'], ['quarterly', 'Every quarter'], ['monthly', 'Every month']];
export const ROOT_CAUSES = [['', '—'], ['people', 'People'], ['process', 'Process'], ['technology', 'Technology'], ['governance', 'Governance'], ['third-party', 'Third party'], ['control-design', 'Control design'], ['resourcing', 'Resourcing']];
export const CHANGE_KINDS = [['new', 'New provision'], ['amended', 'Amended provision'], ['repealed', 'Repealed provision']];
export const CHANGE_STATES = [['detected', 'Detected'], ['verified', 'Verified'], ['scoped', 'Scoped'], ['impact-reviewed', 'Impact reviewed'], ['tasks-assigned', 'Tasks assigned'], ['implemented', 'Implemented'], ['closed', 'Closed']];
export const CAMPAIGN_STATES = [['planned', 'Planned'], ['in-progress', 'Evidence collection'], ['review', 'Assessor review'], ['approved', 'Approved — frozen'], ['archived', 'Archived']];
export const EXEMPTION_STATES = [['requested', 'Requested from the authority'], ['granted', 'Granted by the authority'], ['denied', 'Denied'], ['expired', 'Expired'], ['revoked', 'Revoked']];
export const PROG_STATES = [['draft', 'Draft'], ['active', 'Active'], ['retired', 'Retired']];
export const OBJ_STATES = [['planned', 'Planned'], ['on-track', 'On track'], ['at-risk', 'At risk'], ['met', 'Met'], ['missed', 'Missed']];
export const EVIDENCE_TEXT = { current: 'Current', expired: 'Expired', 'judged-insufficient': 'Judged insufficient', none: 'None' };
export const STATE_TEXT = { satisfied: 'Satisfied', 'partially-satisfied': 'Partially satisfied', unsatisfied: 'Unsatisfied', 'not-assessed': 'Not assessed', undetermined: 'Undetermined — evidence gap' };

/* ---------------- accessors ---------------- */
const KEYS = ['sources', 'obligations', 'interpretations', 'programmes', 'adoptions', 'campaigns', 'deadlines', 'submissions', 'changes', 'exemptions', 'authorities', 'objectives', 'holidays'];
export function cms(ws = S.ws) {
  const c = (ws.cms ||= {});
  for (const k of KEYS) if (!Array.isArray(c[k])) c[k] = [];
  ws.grc ||= {}; ws.grc.determinations ||= [];
  return c;
}
export const determinations = (ws = S.ws) => { cms(ws); return ws.grc.determinations; };
export const obligation = (id, ws = S.ws) => cms(ws).obligations.find(o => o.id === id);
export const source = (id, ws = S.ws) => cms(ws).sources.find(s => s.id === id);
export const authority = (id, ws = S.ws) => cms(ws).authorities.find(a => a.id === id);
/** An obligation is superseded when a later record names it in `supersedes` (old versions stay queryable). */
export const supersededBy = (o, ws = S.ws) => cms(ws).obligations.find(x => x.supersedes === o.id);
export const liveObligations = (ws = S.ws) => cms(ws).obligations.filter(o => o.status !== 'retired' && !supersededBy(o, ws));
export const obLabel = o => o ? `${o.id} ${o.title || ''}`.trim() : '';
export const nowDate = () => new Date();
const isoDate = d => d.toISOString().slice(0, 10);

/* ---------------- determinations and evidence ---------------- */
/** Determinations of an obligation: those naming it, or naming its provision when it cites one. */
export function determinationsOf(o, ws = S.ws, asOf = today()) {
  return determinations(ws).filter(d => (d.obligation === o.id || (!d.obligation && o.provision && d.provision === o.provision)) && (!d.date || d.date <= asOf));
}
/** The latest dated determination on or before asOf (the contract's compliance state). */
export function latestDetermination(o, ws = S.ws, asOf = today()) {
  return determinationsOf(o, ws, asOf).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.id).localeCompare(String(a.id)))[0] || null;
}
/** Evidence-register records a determination relies on (IDs listed in its evidence that the register holds). */
export const registeredEvidence = (d, ws = S.ws) => (d?.evidence || []).map(id => SH.evidence(ws).find(e => e.id === String(id).trim())).filter(Boolean);
/** current / expired / judged-insufficient / none for a list of evidence records (current wins). */
export function bestStatus(list, asOf = today()) {
  const st = list.map(e => SH.evidenceStatus(e, asOf));
  for (const s of ['current', 'expired', 'judged-insufficient']) if (st.includes(s)) return s;
  return 'none';
}
/** Evidence status of an obligation (compliance/v1 evidenceStatus): the evidence its latest determination relied on;
    without a determination, the evidence linked to the obligation in the shared register. */
export function evidenceStatusOf(o, ws = S.ws, asOf = today()) {
  const d = latestDetermination(o, ws, asOf);
  if (d) return bestStatus(registeredEvidence(d, ws), asOf);
  return SH.bestEvidence('obligation', o.id, ws, asOf);
}
/** A determination is current when it states something (not "not assessed") and is younger than the review cycle. */
export function reviewOverdue(o, ws = S.ws, asOf = today()) {
  const d = latestDetermination(o, ws, asOf);
  if (!d || !d.date) return true;
  const months = Number(o.reviewMonths) > 0 ? Number(o.reviewMonths) : 12;
  const lim = new Date(d.date + 'T00:00:00Z'); lim.setUTCMonth(lim.getUTCMonth() + months);
  return isoDate(lim) < asOf;
}
export const hasCurrentDetermination = (o, ws = S.ws, asOf = today()) => { const d = latestDetermination(o, ws, asOf); return !!d && d.state !== 'not-assessed' && !reviewOverdue(o, ws, asOf); };

/** Why a determination cannot be saved, or null. Used by the determinations register and the campaigns. */
export function determinationError(d, ws = S.ws, asOf = today()) {
  const o = d.obligation ? obligation(d.obligation, ws) : null;
  if (!d.provision && !d.obligation) return 'Choose the provision or the obligation.';
  if (o && o.applicability === 'not-applicable') return 'This obligation was found not applicable: a compliance determination for it is refused. Change its applicability first, with a rationale.';
  const camp = d.campaign ? cms(ws).campaigns.find(c => c.id === d.campaign) : null;
  if (cms(ws).campaigns.some(c => c.frozen?.ids?.includes(d.id))) return 'This determination belongs to an approved campaign: it is frozen. Record a new determination in another campaign.';
  if (camp && camp.frozen) return 'This campaign is approved and frozen: it cannot receive new determinations.';
  const reg = registeredEvidence(d, ws);
  const atDate = d.date || asOf;
  if (d.state === 'satisfied') {
    if (!(d.evidence || []).length) return 'A provision is satisfied only with evidence: list it, or record the gap and another state.';
    const listed = (d.evidence || []).map(x => String(x).trim()), inReg = listed.filter(id => SH.evidence(ws).some(e => e.id === id));
    if (inReg.length && inReg.length === listed.length && bestStatus(reg, atDate) !== 'current') return 'The only evidence listed is expired or judged insufficient: that is an evidence gap, not support for "satisfied".';
    if (camp && !reg.length) return 'In a campaign, "satisfied" needs evidence from the shared evidence register (its EV- identifiers).';
  }
  if (camp && !reg.length && !String(d.evidenceGap || '').trim()) return 'A campaign determination needs evidence from the shared evidence register or an explicit evidence gap.';
  if (['partially-satisfied', 'unsatisfied', 'undetermined'].includes(d.state) && !String(d.evidenceGap || '').trim()) return 'State the evidence gap.';
  if (o && o.owner && d.assessor && o.owner.trim().toLowerCase() === d.assessor.trim().toLowerCase() && d.state !== 'not-assessed')
    return 'The owner of an obligation cannot assess it: the assessor must be someone else.';
  return null;
}

/* ---------------- exceptions and exemptions ---------------- */
export function exemptionActive(x, asOf = today()) {
  return x.state === 'granted' && (!x.validFrom || x.validFrom <= asOf) && (!x.validUntil || x.validUntil >= asOf);
}
export function exemptionError(x, ws = S.ws) {
  if (!x.obligation && !String(x.provision || '').trim()) return 'Name the obligation or provision the exemption relieves.';
  if (x.state === 'granted') {
    if (!x.authority) return 'Only a regulatory authority grants an exemption: choose the authority that granted it (register it under Regulatory authorities).';
    const a = authority(x.authority, ws);
    if (!a) return 'The authority named is not in the register of regulatory authorities.';
    if (!String(x.legalBasis || '').trim()) return 'A granted exemption needs the legal basis on which the authority granted it.';
    if (!x.validFrom) return 'A granted exemption needs the date from which it applies.';
    if (!String(x.reference || '').trim()) return 'A granted exemption needs the authority\'s decision reference.';
  }
  return null;
}
/** Is an obligation (by id) or a provision text relieved by an active exemption? */
export function exempted(ref, ws = S.ws, asOf = today()) {
  const o = obligation(ref, ws);
  const keys = new Set([ref, o?.provision].filter(Boolean).map(s => String(s).trim().toLowerCase()));
  return cms(ws).exemptions.some(x => exemptionActive(x, asOf) && [x.obligation, x.provision].filter(Boolean).some(k => keys.has(String(k).trim().toLowerCase())));
}
/** Accepted exceptions concerning a legal provision, with the provisions no exemption relieves (contract: provisionsWithoutExemption). */
export function exceptionExposure(ws = S.ws, asOf = today()) {
  return SH.lawExceptions(ws).map(x => {
    const concerned = [...(x.concerns || []).filter(l => l.kind === 'obligation').map(l => l.id), ...(String(x.legalObligation || '').trim() ? [String(x.legalObligation).trim()] : [])];
    return { exception: x, concerned, without: concerned.filter(c => !exempted(c, ws, asOf)), active: !SH.exceptionExpired(x, asOf) };
  });
}
export const exposureFor = (o, ws = S.ws, asOf = today()) => exceptionExposure(ws, asOf).filter(e => e.without.some(c => c === o.id || (o.provision && c.toLowerCase() === String(o.provision).toLowerCase())));

/* ---------------- deadlines ---------------- */
const pad = n => String(n).padStart(2, '0');
/** A local date-time written YYYY-MM-DDTHH:MM. */
export const localIso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const parseLocal = s => { if (!s) return null; const t = String(s).length <= 10 ? s + 'T00:00' : s; const d = new Date(t); return isNaN(d) ? null : d; };
function addOffset(start, amount, unit, holidays) {
  const d = new Date(start.getTime());
  if (unit === 'hours') { d.setTime(d.getTime() + amount * 3600e3); return d; }
  if (unit === 'days') { d.setDate(d.getDate() + amount); return d; }
  let n = 0;                                                     // business days: skip weekends and listed holidays
  while (n < amount) { d.setDate(d.getDate() + 1); const ds = localIso(d).slice(0, 10); if (d.getDay() !== 0 && d.getDay() !== 6 && !holidays.includes(ds)) n++; }
  return d;
}
const unitText = { hours: 'hours', days: 'calendar days', 'business-days': 'business days' };
/**
 * Every deadline occurrence: a calendar deadline gives one; an event-triggered deadline gives one per confirmed
 * incident it applies to (an alert or an unconfirmed event never triggers one). Each carries its due time and the
 * explanation of the calculation, whether it is answered (a submission sent for it, or an answer recorded) and its state.
 */
export function deadlineInstances(ws = S.ws, now = nowDate()) {
  const C = cms(ws), out = [], hol = (C.holidays || []).map(String);
  const incidents = (ws.csm?.incidents || []).filter(i => i.confirmed);
  for (const d of C.deadlines) {
    const base = { deadline: d, obligation: d.obligation || '', title: d.title || '' };
    if (d.trigger === 'event') {
      const list = d.incident ? incidents.filter(i => i.id === d.incident) : incidents.filter(i => !d.personalInfoOnly || i.personalInfo);
      for (const inc of list) {
        const start = parseLocal(inc.confirmed), amount = Number(d.offset) || 0, unit = d.unit || 'hours';
        const due = addOffset(start, amount, unit, hol);
        const id = d.incident ? d.id : `${d.id}@${inc.id}`;
        out.push({ ...base, id, trigger: 'event', incident: inc.id, due: localIso(due), dueDate: due,
          explanation: `${amount} ${unitText[unit]} after the confirmation of incident ${inc.id} on ${inc.confirmed}${String(inc.confirmed).length <= 10 ? ' (no time recorded: counted from the start of that day)' : ''}${unit === 'business-days' ? ', skipping weekends and listed holidays' : ''}${d.timeZone ? ` · time zone ${d.timeZone}` : ''}${d.citation ? ` · ${d.citation}` : ''}` });
      }
      if (!list.length) out.push({ ...base, id: d.id, trigger: 'event', incident: '', due: '', dueDate: null, explanation: 'Waiting for its trigger: no confirmed incident it applies to.', pending: true });
    } else {
      const due = parseLocal(d.due);
      out.push({ ...base, id: d.id, trigger: 'calendar', due: due ? localIso(due) : '', dueDate: due,
        explanation: `${d.due ? 'Fixed date' : 'No date recorded'}${d.recurrence ? ` · ${RECURRENCE.find(r => r[0] === d.recurrence)?.[1].toLowerCase()}` : ''}${d.timeZone ? ` · time zone ${d.timeZone}` : ''}${d.citation ? ` · ${d.citation}` : ''}` });
    }
  }
  for (const x of out) {
    const subs = C.submissions.filter(s => s.answers === x.id && ['submitted', 'acknowledged'].includes(s.state) && s.submittedOn);
    const manual = x.id === x.deadline.id && x.deadline.answeredOn ? x.deadline.answeredOn : (x.deadline.answeredInstances || {})[x.id];
    x.submission = subs[0] || null;
    x.answeredOn = subs[0]?.submittedOn || manual || '';
    x.answered = !!x.answeredOn;
    x.late = x.answered && x.dueDate ? parseLocal(x.answeredOn) > x.dueDate : false;
    x.overdue = !x.answered && !!x.dueDate && x.dueDate < now;
    x.soon = !x.answered && !!x.dueDate && x.dueDate >= now && x.dueDate - now <= 30 * 864e5;
  }
  return out.sort((a, b) => String(a.due || '9').localeCompare(String(b.due || '9')));
}
export const nextDeadline = (o, ws = S.ws, now = nowDate()) => deadlineInstances(ws, now).filter(x => x.obligation === o.id && !x.answered && x.dueDate)[0] || null;

/* ---------------- submissions ---------------- */
export function submissionError(s) {
  if (!s.authority) return 'Name the authority the submission goes to.';
  if (['submitted', 'acknowledged', 'rejected'].includes(s.state)) {
    if (!String(s.approvedBy || '').trim()) return 'Nothing is sent to an authority without a recorded human approval: enter who approved the submission.';
    if (s.preparedBy && s.approvedBy.trim().toLowerCase() === s.preparedBy.trim().toLowerCase()) return 'The person who prepared a submission cannot approve it.';
    if (!s.submittedOn) return 'A sent submission needs the date it was submitted.';
  }
  if (s.state === 'acknowledged' && (!String(s.receiptRef || '').trim() || !s.receiptOn)) return 'An acknowledged submission needs the receipt reference and the date the authority acknowledged it.';
  return null;
}
/** A submission is overdue when it is not sent and the deadline it answers (or its own due date) has passed. */
export function submissionOverdue(s, ws = S.ws, now = nowDate()) {
  if (['submitted', 'acknowledged'].includes(s.state)) return false;
  const inst = s.answers ? deadlineInstances(ws, now).find(x => x.id === s.answers) : null;
  const due = inst?.dueDate || parseLocal(s.due);
  return !!due && due < now;
}

/* ---------------- posture, dashboard ---------------- */
/** One row per live obligation: what the compliance report states, and nothing more. */
export function posture(ws = S.ws, now = nowDate()) {
  const asOf = isoDate(now);
  return liveObligations(ws).map(o => {
    const d = latestDetermination(o, ws, asOf);
    const ev = evidenceStatusOf(o, ws, asOf);
    const exp = exposureFor(o, ws, asOf);
    const nd = nextDeadline(o, ws, now);
    return { o, applicability: o.applicability || 'not-assessed', det: d, state: o.applicability === 'not-applicable' ? 'not-applicable' : d ? d.state : 'not-assessed',
      evidence: ev, exceptions: exp.length, next: nd, reviewOverdue: !!d && reviewOverdue(o, ws, asOf),
      gap: d && d.state === 'satisfied' && ev !== 'current' };
  });
}
export function dashboard(ws = S.ws, now = nowDate()) {
  const asOf = isoDate(now), C = cms(ws), live = liveObligations(ws);
  const appl = live.filter(o => o.applicability === 'applicable');
  const P = posture(ws, now).filter(r => r.applicability === 'applicable');
  const inst = deadlineInstances(ws, now);
  const exposure = exceptionExposure(ws, asOf).filter(e => e.without.length);
  const by = s => P.filter(r => r.state === s).length;
  return {
    obligations: live.length, applicable: appl.length,
    applicabilityNotAssessed: live.filter(o => !o.applicability || o.applicability === 'not-assessed').length,
    applicabilityPending: live.filter(o => ['potentially-applicable', 'undetermined'].includes(o.applicability)).length,
    notApplicable: live.filter(o => o.applicability === 'not-applicable').length,
    currentDetermination: appl.filter(o => hasCurrentDetermination(o, ws, asOf)).length,
    currentEvidence: P.filter(r => r.evidence === 'current').length,
    satisfied: by('satisfied'), partial: by('partially-satisfied'), unsatisfied: by('unsatisfied'), undetermined: by('undetermined'), notAssessed: by('not-assessed'),
    assessed: P.filter(r => ['satisfied', 'partially-satisfied', 'unsatisfied', 'undetermined'].includes(r.state)).length,
    satisfiedOnWeakEvidence: P.filter(r => r.gap).length,
    due30: inst.filter(x => x.soon), overdueDeadlines: inst.filter(x => x.overdue),
    submissionsOverdue: C.submissions.filter(s => submissionOverdue(s, ws, now)),
    exposure, interpretationsPending: C.interpretations.filter(i => i.legalReview !== 'reviewed').length,
    changesOpen: C.changes.filter(c => c.status !== 'closed').length,
    campaignsOpen: C.campaigns.filter(c => ['planned', 'in-progress', 'review'].includes(c.status)).length,
    partialOnly: appl.filter(o => { const m = mappingsTo(o, ws); return m.length && m.every(x => !['exact', 'full'].includes(x.type)); }).length,
  };
}
/** Qualified mappings whose target is this obligation (or its provision). Never compliance. */
export const mappingsTo = (o, ws = S.ws) => SH.mappings(ws).filter(m => m.to && ((m.to.kind === 'obligation' && m.to.id === o.id) || (o.provision && m.to.id === o.provision)) && m.review !== 'rejected');

/* ---------------- campaigns ---------------- */
export function campaignError(c) {
  if (!String(c.name || '').trim()) return 'Give the campaign a name.';
  if (!(c.obligations || []).length) return 'A campaign assesses a stated set of obligations: choose at least one.';
  if (c.periodFrom && c.periodTo && c.periodTo < c.periodFrom) return 'The assessed period ends before it starts.';
  if (c.status === 'approved' && !c.frozen) return 'Use "Approve and freeze" to approve a campaign: approval needs a reviewer other than the assessor.';
  return null;
}
/** Approve a campaign: the reviewer is not the assessor; its determinations are frozen (snapshot kept). */
export function approveCampaign(c, reviewer, ws = S.ws) {
  if (!String(reviewer || '').trim()) throw new Error('Enter the name of the reviewer who approves the campaign.');
  if (c.assessor && reviewer.trim().toLowerCase() === c.assessor.trim().toLowerCase()) throw new Error('The assessor cannot approve their own campaign: the reviewer must be someone else.');
  const ds = determinations(ws).filter(d => d.campaign === c.id);
  if (!ds.length) throw new Error('The campaign has produced no determination yet.');
  c.status = 'approved'; c.reviewer = reviewer.trim();
  c.frozen = { on: today(), by: reviewer.trim(), ids: ds.map(d => d.id), snapshot: JSON.parse(JSON.stringify(ds)) };
  return c;
}

/* ---------------- interpretations ---------------- */
export function interpretationError(i) {
  if (!i.obligation) return 'Choose the obligation interpreted.';
  if (i.legalReview === 'reviewed' && (!String(i.reviewedBy || '').trim() || !i.reviewedOn)) return 'A legally reviewed interpretation needs the counsel who reviewed it and the date.';
  return null;
}

/* ---------------- obligations ---------------- */
export function obligationError(o) {
  if (!String(o.title || '').trim()) return 'Give the obligation a short title.';
  if (!o.source && !String(o.provision || '').trim()) return 'Link the obligation to its source and the provision it comes from.';
  if (o.applicability === 'not-applicable' && (!String(o.applicabilityRationale || '').trim() || !String(o.applicabilityReviewer || '').trim()))
    return '"Not applicable" needs a rationale and the name of the person who reviewed it.';
  return null;
}
/** A new version of an obligation after an amendment: a new record; the old one is left as it was. */
export function newObligationVersion(o, sourceVersion, ws = S.ws) {
  const C = cms(ws);
  const n = C.obligations.reduce((m, r) => Math.max(m, Number(String(r.id || '').split('-').pop()) || 0), 0) + 1;
  const x = { ...JSON.parse(JSON.stringify(o)), id: 'OBL-' + String(n).padStart(3, '0'), sourceVersion: sourceVersion || '', supersedes: o.id, concept: o.concept || o.id, created: today() };
  C.obligations.push(x);
  return x;
}
