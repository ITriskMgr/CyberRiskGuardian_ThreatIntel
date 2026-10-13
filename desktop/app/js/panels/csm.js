/* Cybersecurity management — module (1.5.8).

   Control testing  control assessments by assessor line (management self-assessment, second line,
                    internal audit, external assurer) and aspect (design, implementation, operation);
                    operating-effectiveness tests with period, population, sample and deviations. A
                    self-assessment that an independent result contradicts is shown as a conflict,
                    never resolved silently (CRGO CQ-GRCA-08).
   Governance       governing bodies and committees, Three Lines roles held by named people over dated
                    periods, delegations of authority.
   Decisions        decision records: approved, rejected, deferred or escalated, with rationale. The
                    application may draft one; only a named person with valid delegated authority on the
                    decision date can record it as approved (CRGO CQ-06). "Management decision required."
   Incidents        security events, alerts, confirmed incidents, breach-reportability assessments (Loi 25
                    s. 3.5, GDPR Art. 33), timelines and lessons. An incident informs a scenario's
                    likelihood; it does not prove it. An alert is not a finding.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, kpi, n0, go, today, toast } from '../util.js';
import { S, touch, compute } from '../state.js';
import * as D from '../dss.js';
import * as G from '../grcui.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';

let view = 'tests';

/** Every control target a test or a finding can point at: the scenarios' existing controls and the safeguards inventory. */
export function targets(ws = S.ws) {
  const out = [];
  for (const s of ws.assessment.SCEN) (s.controls || []).forEach((c, i) => out.push([JSON.stringify({ kind: 'scenario-control', sid: s.id, index: i + 1, text: c }), `${s.id} · ${c}`]));
  for (const g of ws.safeguards || []) out.push([JSON.stringify({ kind: 'safeguard', id: g.id }), `${tr('Safeguard')} · ${g.name || g.id}`]);
  return out;
}
export const targetLabel = (ws, t) => !t ? '—' : t.kind === 'scenario-control' ? `${t.sid} · ${t.text}` : t.kind === 'safeguard' ? `${tr('Safeguard')} · ${(ws.safeguards || []).find(g => g.id === t.id)?.name || t.id}` : t.text || '—';
/** A target field: stored as an object, edited as the JSON value of a select. */
export const targetField = (ws, label = 'Control tested') => ({ key: 'target', label, type: 'select', options: [['', '—'], ...targets(ws)], wide: true,
  encode: v => v ? JSON.stringify(v) : '', decode: s => s ? JSON.parse(s) : null });

export async function render(sec, arg) {
  const [v] = String(arg || '').split('/');
  if (['tests', 'governance', 'decisions', 'incidents'].includes(v)) view = v;
  const ws = S.ws, C = ws.csm, g = ws.grc;
  sec.replaceChildren(el('h1', null, 'Cybersecurity management'),
    el('p', 'lede', 'How the organization knows its controls work, who governs cybersecurity and decides on risk, and what happened: control testing by line of defence, governing bodies, delegations and decision records, and the incident register.'));
  const conflicts = conflictsOf(ws);
  const openInc = C.incidents.filter(x => !['closed', 'recorded'].includes(x.status));
  sec.append(el('div', 'grid g4',
    kpi('Control tests', n0(g.controlTests.length), tr('{0} by an independent line').replace('{0}', n0(g.controlTests.filter(t => t.line !== 'self-assessment').length))),
    kpi('Conflicts', n0(conflicts.length), 'self-assessment contradicted by an independent result', conflicts.length ? 'bad' : 'good'),
    kpi('Decision records', n0(C.decisions.length), tr('{0} drafts waiting for a decision').replace('{0}', n0(C.decisions.filter(d => d.outcome === 'draft').length)), C.decisions.some(d => d.outcome === 'draft') ? 'warn' : ''),
    kpi('Incidents', n0(C.incidents.length), tr('{0} open · {1} confirmed').replace('{0}', n0(openInc.length)).replace('{1}', n0(C.incidents.filter(x => x.status === 'confirmed' || x.confirmed).length)), openInc.length ? 'warn' : '')));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['tests', 'Control testing'], ['governance', 'Governance'], ['decisions', 'Decisions'], ['incidents', 'Incidents']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; go('csm/' + k); } }, t));
  const body = el('div'); sec.append(st, body);
  const redraw = () => render(sec, view);
  ({ tests, governance, decisions, incidents }[view])(body, redraw);
}

/** Every control whose self-assessment an independent line contradicts. */
export function conflictsOf(ws = S.ws) {
  const seen = new Map();
  for (const t of ws.grc.controlTests) if (t.target) seen.set(JSON.stringify(t.target), t.target);
  return [...seen.values()].map(t => ({ target: t, ...D.controlEvidence(ws, t) })).filter(x => x.conflict);
}

/* ---------------- control testing ---------------- */
const TEST_FIELDS = ws => [targetField(ws), { key: 'label', label: 'What was tested', type: 'text', wide: true },
  { key: 'date', label: 'Date', type: 'date' }, { key: 'line', label: 'Assessor line', type: 'select', options: D.LINES },
  { key: 'aspect', label: 'Aspect tested', type: 'select', options: D.ASPECTS }, { key: 'result', label: 'Result', type: 'select', options: D.RESULTS },
  { key: 'assessor', label: 'Assessor', type: 'text' }, { key: 'evidence', label: 'Evidence (references)', type: 'list' },
  { key: 'period', label: 'Period covered (operating effectiveness)', type: 'text', placeholder: 'e.g. 2026-01-01 to 2026-06-30' },
  { key: 'population', label: 'Population', type: 'number' }, { key: 'sample', label: 'Sample size', type: 'number' }, { key: 'deviations', label: 'Deviations found', type: 'number' },
  { key: 'notes', label: 'Notes', type: 'area' }];
function tests(body, redraw) {
  const ws = S.ws, rows = ws.grc.controlTests;
  body.append(banner('warn', 'Independent results come first', 'Management self-assessments are lower-grade evidence. When an independent line (second line, internal audit, external assurer) reports a worse result, both are shown and the control is flagged as a conflict — the analyst resolves it, the application never does. Open findings lower confidence in a control.'));
  body.append(G.register({ title: 'Control tests', rows, prefix: 'CT', fields: TEST_FIELDS(ws), redraw,
    blank: () => ({ date: today(), line: 'self-assessment', aspect: 'operation', result: 'effective', assessor: users.name() || '', evidence: [] }),
    validate: r => { if (!r.target) return 'Choose the control tested.'; if (r.aspect === 'operation' && r.line !== 'self-assessment' && r.sample && r.population && r.sample > r.population) return 'The sample cannot be larger than the population.'; return null; },
    columns: [{ key: 'id', label: 'ID', cls: 'mono' }, { key: 'target', label: 'Control tested', render: r => el('span', { 'data-noi18n': '' }, targetLabel(ws, r.target)) }, 'date', 'line', 'aspect',
      { key: 'result', label: 'Result', render: r => pill(tr(D.RESULTS.find(x => x[0] === r.result)?.[1] || r.result), r.result === 'effective' ? 'good' : r.result === 'ineffective' ? 'bad' : 'warn') },
      { key: 'oe', label: 'Sample', render: r => r.sample ? `${r.deviations ?? 0}/${r.sample}${r.population ? ' · ' + r.population : ''}` : '' }] }));
  // the evidence per control: latest result per line, conflict, open findings
  const ctrl = new Map();
  for (const t of rows) if (t.target) ctrl.set(JSON.stringify(t.target), t.target);
  for (const f of ws.audit.findings) if (f.target) ctrl.set(JSON.stringify(f.target), f.target);
  const sum = [...ctrl.values()].map(t => ({ t, ...D.controlEvidence(ws, t) }));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Control evidence by line of defence'),
    el('p', 'note', 'The latest result of each line for every control tested, with the open audit findings on it. This is what the scenarios show as their control evidence, and what is sent to the ontology as the organisation\'s control assessments.'),
    sum.length ? table([{ key: 't', label: 'Control', render: r => el('span', { 'data-noi18n': '' }, targetLabel(ws, r.t)) },
      ...D.LINES.map(([k, l]) => ({ key: k, label: l, render: r => { const x = r.latest.find(y => y.line === k); return x ? el('span', null, pill(tr(D.RESULTS.find(y => y[0] === x.result)?.[1] || x.result), x.result === 'effective' ? 'good' : x.result === 'ineffective' ? 'bad' : 'warn'), el('div', 'small muted', x.date)) : '—'; } })),
      { key: 'f', label: 'Open findings', render: r => r.openFindings.length ? pill(String(r.openFindings.length), 'bad') : '0' },
      { key: 'c', label: 'Conflict', render: r => r.conflict ? pill('conflict — resolve', 'bad') : '' },
      { key: 'k', label: 'Confidence in the control', render: r => tr(r.confidence) }], sum, { class: 'compact' }) : el('div', 'empty-state', 'No control tested yet.')));
}

/* ---------------- governance ---------------- */
function governance(body, redraw) {
  const ws = S.ws, C = ws.csm;
  const bodies = [['', '—'], ...C.bodies.map(b => [b.id, b.name || b.id])];
  body.append(G.register({ title: 'Governing bodies and committees', rows: C.bodies, prefix: 'GB', redraw,
    fields: [{ key: 'name', label: 'Name', type: 'text', wide: true }, { key: 'kind', label: 'Kind', type: 'select', options: [['board', 'Board of directors'], ['committee', 'Committee of the board'], ['management', 'Management committee'], ['other', 'Other']] },
      { key: 'parent', label: 'Reports to', type: 'select', options: bodies }, { key: 'mandate', label: 'Mandate (cybersecurity responsibilities)', type: 'area' },
      { key: 'members', label: 'Members', type: 'list' }, { key: 'meets', label: 'Meets', type: 'text', placeholder: 'e.g. quarterly' }],
    columns: ['id', 'name', 'kind', { key: 'parent', label: 'Reports to', render: r => C.bodies.find(b => b.id === r.parent)?.name || '—' }, 'meets'] }));
  body.append(G.register({ title: 'Roles (Three Lines)', rows: C.roles, prefix: 'RL', redraw,
    note: 'Who holds which role, in which line, over which dated period. Decision rights and delegations refer to these people.',
    fields: [{ key: 'person', label: 'Person', type: 'text' }, { key: 'role', label: 'Role', type: 'text', placeholder: 'e.g. CISO, risk owner, internal audit director' },
      { key: 'line', label: 'Line', type: 'select', options: [['governing-body', 'Governing body'], ['first', 'First line (management)'], ['second', 'Second line (risk, compliance, security oversight)'], ['third', 'Third line (internal audit)'], ['external', 'External assurance']] },
      { key: 'body', label: 'Body', type: 'select', options: bodies }, { key: 'from', label: 'From', type: 'date' }, { key: 'to', label: 'To', type: 'date' }],
    validate: r => r.from && r.to && r.to < r.from ? 'The end date is before the start date.' : null,
    columns: ['id', 'person', 'role', 'line', 'from', 'to'] }));
  body.append(G.register({ title: 'Delegations of authority', rows: C.delegations, prefix: 'DA', redraw,
    note: 'A risk acceptance needs a named decision maker with delegated authority valid on the decision date.',
    fields: [{ key: 'from', label: 'Delegated by', type: 'text' }, { key: 'to', label: 'Delegated to', type: 'text' },
      { key: 'scope', label: 'What may be decided', type: 'multi', options: [['risk-acceptance', 'Risk acceptance'], ['treatment', 'Risk treatment'], ['funding', 'Funding'], ['policy-exception', 'Policy exception']] },
      { key: 'limit', label: 'Limit (e.g. residual-to-tolerance ratio, amount)', type: 'text' }, { key: 'validFrom', label: 'Valid from', type: 'date' }, { key: 'validTo', label: 'Valid to', type: 'date' },
      { key: 'reference', label: 'Reference (resolution, minutes)', type: 'text' }],
    validate: r => !r.to ? 'Name the person who receives the authority.' : r.validFrom && r.validTo && r.validTo < r.validFrom ? 'The end date is before the start date.' : null,
    columns: ['id', 'from', 'to', 'scope', 'validFrom', 'validTo'] }));
}

/* ---------------- decisions ---------------- */
export const OUTCOMES = [['draft', 'Draft — management decision required'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['deferred', 'Deferred'], ['escalated', 'Escalated']];
/** Valid on the date, for the decision type, in the name of the decider (CQ-06). */
export function delegationOk(ws, d) {
  if (d.outcome === 'draft') return null;
  if (!d.decidedBy) return 'A decision needs a named decision maker.';
  if (d.type === 'risk-acceptance' || d.type === 'policy-exception' || d.type === 'funding') {
    const del = ws.csm.delegations.find(x => x.id === d.delegation);
    if (!del) return 'Choose the delegation of authority under which this decision is made.';
    if (String(del.to).trim().toLowerCase() !== String(d.decidedBy).trim().toLowerCase()) return 'The decision maker is not the person the delegation names.';
    if (!(del.scope || []).includes(d.type)) return 'This delegation does not cover this kind of decision.';
    if ((del.validFrom && d.date < del.validFrom) || (del.validTo && d.date > del.validTo)) return 'The delegation is not valid on the decision date.';
  }
  if (d.draftedBy === 'application' && d.outcome !== 'draft' && !d.confirmedBy) return 'A record the application drafted can only be decided by a person: enter who confirms it.';
  return null;
}
function decisions(body, redraw) {
  const ws = S.ws, C = ws.csm;
  const res = compute(ws);
  body.append(banner('warn', 'Management decision required', 'The application drafts decision records; it never approves one. Accepting a risk, approving funding or a policy exception is recorded by the person who decides, under a delegation of authority valid on that date.'));
  body.append(el('div', 'btnrow', el('button', { class: 'btn ghost', onclick: () => {
    let n = 0;
    for (const r of res.inc.filter(r => r.ratio > 1.1)) {
      if (C.decisions.some(d => d.subject === r.id && d.outcome === 'draft')) continue;
      C.decisions.push({ id: G.nextId(C.decisions, 'DR'), subject: r.id, type: 'risk-acceptance', outcome: 'draft', date: today(), decidedBy: '', delegation: '', draftedBy: 'application',
        rationale: tr('Scenario {0}: residual risk is {1} times the tolerated risk. Options: treat further, transfer, avoid, or accept with a named decision maker under delegated authority. Management decision required.').replace('{0}', r.id).replace('{1}', r.ratio.toFixed(2)) });
      n++;
    }
    touch(); toast(tr('{0} draft decision record(s)').replace('{0}', n)); redraw();
  } }, 'Draft decision records for scenarios above tolerance')));
  body.append(G.register({ title: 'Decision records', rows: C.decisions, prefix: 'DR', redraw,
    fields: [{ key: 'subject', label: 'Subject', type: 'select', options: [['', '—'], ...ws.assessment.SCEN.map(s => [s.id, `${s.id} ${s.name}`]), ['other', 'Other']] },
      { key: 'type', label: 'Decision', type: 'select', options: [['risk-acceptance', 'Risk acceptance'], ['treatment', 'Risk treatment'], ['funding', 'Funding'], ['policy-exception', 'Policy exception'], ['other', 'Other']] },
      { key: 'outcome', label: 'Outcome', type: 'select', options: OUTCOMES }, { key: 'date', label: 'Decision date', type: 'date' },
      { key: 'decidedBy', label: 'Decided by (person)', type: 'text' }, { key: 'delegation', label: 'Delegation of authority', type: 'select', options: [['', '—'], ...C.delegations.map(d => [d.id, `${d.id} · ${d.to}`])] },
      { key: 'confirmedBy', label: 'Confirmed by (for a record the application drafted)', type: 'text' },
      { key: 'rationale', label: 'Rationale', type: 'area', wide: true }, { key: 'conditions', label: 'Conditions and review date', type: 'text', wide: true }],
    validate: r => delegationOk(ws, r),
    columns: ['id', { key: 'subject', label: 'Subject', render: r => r.subject || '—' }, 'type',
      { key: 'outcome', label: 'Outcome', render: r => pill(tr(OUTCOMES.find(o => o[0] === r.outcome)?.[1] || r.outcome), r.outcome === 'draft' ? 'warn' : r.outcome === 'approved' ? 'good' : '') }, 'decidedBy', 'date'] }));
}

/* ---------------- incidents ---------------- */
export const INC_STATUS = [['event', 'Security event'], ['alert', 'Alert (not yet an incident)'], ['recorded', 'Recorded (from documents, to confirm)'], ['confirmed', 'Confirmed incident'], ['contained', 'Contained'], ['closed', 'Closed']];
export const REPORT = [['not-assessed', 'Not assessed'], ['report', 'Risk of serious injury — report'], ['no-report', 'No risk of serious injury — record only'], ['undetermined', 'Undetermined — evidence gap'], ['not-applicable', 'No personal information involved']];
/** The incident register's fields, blank record and validation — shared with SOAR → Incidents (same register). */
export const incidentFields = ws => [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'status', label: 'Status', type: 'select', options: INC_STATUS },
      { key: 'type', label: 'Type', type: 'text', placeholder: 'e.g. phishing, ransomware, lost device' }, { key: 'detected', label: 'Detected', type: 'date' }, { key: 'confirmed', label: 'Confirmed on', type: 'date' }, { key: 'confirmedBy', label: 'Confirmed by (person)', type: 'text' },
      { key: 'severity', label: 'Severity', type: 'select', options: [['', '—'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['critical', 'Critical']] },
      { key: 'assets', label: 'Assets affected', type: 'text', wide: true }, { key: 'scenarios', label: 'Scenarios it informs', type: 'multi', options: ws.assessment.SCEN.map(s => [s.id, s.id]) },
      { key: 'personalInfo', label: 'Personal information involved', type: 'check' },
      { key: 'loi25', label: 'Loi 25 s. 3.5 — breach reportability', type: 'select', options: REPORT }, { key: 'gdpr', label: 'GDPR Art. 33 — breach reportability', type: 'select', options: REPORT },
      { key: 'reportRationale', label: 'Reportability rationale (who assessed, when)', type: 'area' },
      { key: 'timeline', label: 'Timeline (date — what happened, one per line)', type: 'list', rows: 5 }, { key: 'impact', label: 'Impact', type: 'area' }, { key: 'cause', label: 'Cause', type: 'area' },
      { key: 'lessons', label: 'Lessons learned', type: 'area' }];
export const incidentBlank = () => ({ status: 'event', detected: today(), scenarios: [], timeline: [], loi25: 'not-assessed', gdpr: 'not-assessed', source: 'register' });
export const incidentValidate = r => r.status === 'confirmed' && !r.confirmed ? 'A confirmed incident needs the date it was confirmed.' : r.status === 'confirmed' && !String(r.confirmedBy || '').trim() ? 'A confirmed incident needs the name of the person who confirmed it.' : r.personalInfo && r.status === 'confirmed' && r.loi25 === 'not-assessed' ? 'Personal information was involved: assess breach reportability (Loi 25 s. 3.5) or record that the assessment is pending as undetermined.' : null;
function incidents(body, redraw) {
  const ws = S.ws, C = ws.csm;
  body.append(banner('warn', 'An incident informs a likelihood; it does not prove it', 'Link confirmed incidents to the scenarios they concern and cite them in the rationale of Pb(A) and Pb(ψ,A). An alert is not a finding, and a recorded incident from the documents is not confirmed until someone confirms it. Breach-reportability is an assessment for qualified people (Loi 25 s. 3.5, GDPR Art. 33), not legal advice.'));
  body.append(G.register({ title: 'Incident register', rows: C.incidents, prefix: 'INC', redraw,
    fields: incidentFields(ws),
    blank: incidentBlank,
    validate: incidentValidate,
    columns: ['id', 'title', { key: 'status', label: 'Status', render: r => pill(tr(INC_STATUS.find(x => x[0] === r.status)?.[1] || r.status), r.status === 'confirmed' ? 'bad' : r.status === 'closed' ? 'good' : 'warn') },
      'detected', 'severity', { key: 'scenarios', label: 'Scenarios', render: r => (r.scenarios || []).join(', ') || '—' }, 'loi25',
      { key: 'source', label: 'Source', render: r => r.source === 'imported' ? pill('from documents', 'warn') : '' }] }));
}
