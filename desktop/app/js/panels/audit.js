/* Audit management — module (Beta 1.6.x), aligned with CRGO 0.10 (crgo-audit).

   Audit management is the only owner of audit records: other modules (quality review, cybersecurity
   management, ISMS, compliance, ontology link) read ws.audit and link to its records.

   Tabs (ids fixed by js/menu.js)
     dashboard    plan progress, issued findings (never preliminary observations), overdue actions,
                  workpapers awaiting review, assurance coverage, audit events — denominators labelled.
     charter      charter and methodology: working copy, approval by a named person and body, frozen
                  versions with a SHA-256 hash (audit_ui/ams).
     universe     auditable entities with inherent risk, last audit and links (audit_plan.js).
     plan         risk-weighted, versioned plan; deferred or cancelled entries with reason and
                  authoriser; approval freezes the version (audit_plan.js).
     engagements  engagement type and state machine with recorded transitions, team and conflicts
                  (audit_work.js).
     programmes   procedure library (versioned), NIST SP 800-53A objectives and CRGO's two
                  ILLUSTRATIVE work programmes (AUD-PAM-001, AUD-VULN-001).
     workpapers   workpapers with independent sign-off and lock, reproducible sampling (audit_work.js).
     findings     observations (preliminary) → findings (criterion, condition, cause, effect,
                  significance) → recommendations (audit_findings.js).
     followup     management responses, corrective actions (shared register), independent follow-up,
                  closure and reopening (audit_findings.js).
     reports      frozen report snapshots with hash, addenda, Markdown export (audit_findings.js).
     quality      quality reviews and conflict-of-interest declarations (audit_findings.js).
     assurance    SOC reports and the shared evidence register.
     trace        universe → plan entry → engagement → procedure → workpaper → observation → finding →
                  recommendation → response → follow-up → closure (audit_findings.js).
   Licensed standards (IIA, ISACA ITAF, AICPA, COSO, ISO 19011/27007/27008) appear only by identifier.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, kpi, n0, go, today, toast, field, download } from '../util.js';
import { S, touch } from '../state.js';
import * as G from '../grcui.js';
import * as SH from '../shared.js';
import * as M from '../ams.js';
import { tr } from '../i18n.js';
import { indep, ask, lab, short, dn, who, approveGuard, logData, listCard } from './audit_ui.js';
import { universeTab, planTab } from './audit_plan.js';
import { engagementsTab, workpapersTab } from './audit_work.js';
import { findingsTab, followupTab, reportsTab, qualityTab, traceTab } from './audit_findings.js';

/* Kept for the screens that read audit records (qc.js, csm.js, isms.js, ontology_link.js, dss.js). */
export { SIGNIFICANCE, F_STATUS, closeOk } from '../ams.js';

let A53 = null;
/** A CRGO label in the interface language (CRGO gives English and French). */
export const L = x => (x || {})[document.documentElement.lang === 'fr' ? 'fr' : 'en'] || (x || {}).en || '';
export async function assurance() {
  A53 ||= await fetch(new URL('../../data/crgo-assurance.json', import.meta.url)).then(r => { if (!r.ok) throw new Error('data/crgo-assurance.json is missing'); return r.json(); });
  return A53;
}

export const TABS = [['dashboard', 'Dashboard'], ['charter', 'Charter & methodology'], ['universe', 'Audit universe'], ['plan', 'Audit plan'], ['engagements', 'Engagements'],
  ['programmes', 'Procedures · SP 800-53A'], ['workpapers', 'Workpapers & sampling'], ['findings', 'Observations & findings'], ['followup', 'Responses & follow-up'],
  ['reports', 'Reports'], ['quality', 'Quality & independence'], ['assurance', 'SOC reports & evidence'], ['trace', 'Traceability']];

export const HELP = {
  '': { d: 'Risk-based audit planning, engagements, workpapers, findings, reports and independent follow-up — the only owner of audit records.', g: 'audit',
    h: ['Audit management plans and performs audit and assurance engagements and follows their findings to a verified closure. Other modules link to its records; none of them changes an audit conclusion.',
      'A compliance status, a risk score or a policy acknowledgement is never an audit conclusion.'] },
  dashboard: { d: 'Plan progress, issued findings, overdue actions, workpapers awaiting review and assurance coverage, with their denominators.', g: 'audit-dashboard',
    h: ['Counts of findings include issued findings only: preliminary observations and findings not yet issued are shown apart.', 'Every figure says what it is counted against.'] },
  charter: { d: 'The audit charter and methodology: a working copy, then approved versions frozen with a hash.', g: 'audit-charter',
    h: ['The charter sets the audit function\'s purpose, authority, independence and reporting line; the methodology sets how engagements are planned, performed and rated, and the weights of the risk-based plan.',
      'Approving freezes a version (SHA-256). A later change is a new version; the previous one is kept as superseded.'] },
  universe: { d: 'The auditable entities — processes, systems, suppliers, units — with inherent risk, last audit and links to assets, processes and scenarios.', g: 'audit-universe',
    h: ['Each entity stands for one canonical record (e.g. asset:A-001): the application refuses a second entity for the same record.', 'Critical and high assets not yet in the universe can be added in one step.'] },
  plan: { d: 'The risk-weighted audit plan: entries scored from the universe, approved and frozen as a version.', g: 'audit-plan',
    h: ['Each entry is scored from inherent risk, time since the last audit and the residual risk of its scenarios (read from the engine, never changed). The weights and the source risk version are recorded.',
      'A deferred or cancelled entry needs a reason and the person who authorised it; a mandatory entry is never dropped for a low score. Approval freezes the version; an amendment creates a new one.'] },
  engagements: { d: 'Audit and assurance engagements: type, scope, objectives, criteria, team and a recorded state machine.', g: 'audit-engagements',
    h: ['Planning → fieldwork → reporting → follow-up → closed. Fieldwork needs a scope, a lead, objectives and criteria, and a team without unresolved conflicts of interest; reporting needs every workpaper signed off; closing needs an issued report and closed findings.'] },
  programmes: { d: 'The procedure library, SP 800-53A assessment objectives and CRGO\'s illustrative work programmes.', g: 'audit-programmes',
    h: ['A library procedure is versioned: changing a version a workpaper already used creates a new version, so earlier work keeps the exact procedure it followed.', 'CRGO\'s work programmes are illustrative, not a validated audit methodology.'] },
  workpapers: { d: 'Workpapers with preparer, independent reviewer and locked sign-off; reproducible samples.', g: 'audit-workpapers',
    h: ['The person who prepared a workpaper cannot be its sole reviewer. Sign-off locks it with a hash; reopening it is recorded with the reason.',
      'A sample keeps its population snapshot, method, size, seed and selected items: re-running it gives the same selection.'] },
  findings: { d: 'Preliminary observations, validated findings (criterion, condition, cause, effect, significance) and recommendations.', g: 'audit-findings',
    h: ['An observation is preliminary: it is not a finding and is not counted as one. Validated against criteria and evidence, it becomes a finding.', 'A finding issues only with criterion, condition, effect and evidence (or a stated evidence limitation); its conclusion then cannot be edited.'] },
  followup: { d: 'Management responses, corrective actions, independent follow-up verification, closure and reopening.', g: 'audit-followup',
    h: ['Management owns the remediation; audit owns the closure decision. A verification is done by someone other than the action owner; a failed verification reopens the action and the finding.',
      'Corrective actions live in the shared register: one action can answer an audit finding and a compliance nonconformity while each keeps its own conclusion.'] },
  reports: { d: 'Audit reports: draft, supervisory review, approval, then an immutable issued snapshot with addenda.', g: 'audit-reports',
    h: ['Issuing freezes a snapshot of the engagement, its issued findings, recommendations and responses, with a SHA-256 hash. Corrections after issue are addenda, chained by hash.'] },
  quality: { d: 'Quality and independence: supervisory and quality reviews, conflict-of-interest declarations and safeguards.', g: 'audit-quality',
    h: ['A person with a declared conflict on an engagement cannot be assigned until a safeguard is recorded and authorised by someone else. A reviewer never reviews their own work.'] },
  assurance: { d: 'SOC and other assurance reports received from service organizations, and the shared evidence register.', g: 'audit-assurance',
    h: ['Evidence is kept once, in the shared register, and linked to engagements, workpapers and findings. Hashing a file records its SHA-256 and provenance; the file itself stays where it is kept.'] },
  trace: { d: 'Traceability from the audit universe to closure, with the breaks in each chain.', g: 'audit-trace',
    h: ['Universe → plan entry → engagement → procedure → workpaper → observation → finding → recommendation → response → follow-up → closure.'] },
};

let view = 'dashboard';
export async function render(sec, arg) {
  const [v] = String(arg || '').split('/');
  if (TABS.some(t => t[0] === v)) view = v; else if (!arg) view = view || 'dashboard';
  const ws = S.ws; M.ensure(ws);
  sec.replaceChildren(el('h1', null, 'Audit management'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  const m = M.metrics(ws);
  for (const [k, t] of TABS) {
    const label = k === 'findings' ? tr('Observations & findings') + ` (${ws.audit.findings.filter(f => f.status !== 'closed').length})` : tr(t);
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; go('audit/' + k); } }, label));
  }
  const body = el('div'); sec.append(st, body);
  const redraw = () => render(sec, view);
  const F = { dashboard, charter, universe: universeTab, plan: planTab, engagements: engagementsTab, programmes, workpapers: workpapersTab, findings: findingsTab,
    followup: followupTab, reports: reportsTab, quality: qualityTab, assurance: assuranceTab, trace: traceTab };
  await F[view](body, redraw, ws, m);
}

/* ---------------- dashboard ---------------- */
function dashboard(body, redraw, ws, m) {
  const A = ws.audit;
  body.append(el('div', 'grid g4',
    kpi('Plan progress', m.plan ? `${n0(m.planDone)} / ${n0(m.planTotal)}` : '—', m.plan ? tr('engagements completed / approved entries in {0} v{1}').replace('{0}', m.plan.id).replace('{1}', m.plan.version) : tr('no approved plan')),
    kpi('Issued findings open', n0(m.openIssued), tr('{0} high or critical · of {1} issued').replace('{0}', n0(m.highOpen)).replace('{1}', n0(m.issued)), m.highOpen ? 'bad' : m.openIssued ? 'warn' : 'good'),
    kpi('Overdue actions', n0(m.overdue), tr('of {0} corrective actions from findings').replace('{0}', n0(m.actions)), m.overdue ? 'bad' : ''),
    kpi('Assurance coverage', m.universe ? `${n0(m.covered)} / ${n0(m.universe)}` : '—', 'entities audited within their cycle / active entities', m.universe && m.covered < m.universe ? 'warn' : '')));
  body.append(el('div', 'grid g4',
    kpi('Workpapers awaiting review', n0(m.awaitingReview), tr('of {0} workpapers').replace('{0}', n0(m.wpTotal)), m.awaitingReview ? 'warn' : ''),
    kpi('Actions awaiting verification', n0(m.awaitingVerification), 'done by their owner, not yet verified independently', m.awaitingVerification ? 'warn' : ''),
    kpi('Not counted as findings', n0(m.preliminary + m.validatedNotIssued), tr('{0} preliminary observations · {1} findings not issued').replace('{0}', n0(m.preliminary)).replace('{1}', n0(m.validatedNotIssued))),
    kpi('Open conflicts of interest', n0(m.openCoi), 'declared without an authorised safeguard', m.openCoi ? 'bad' : 'good')));
  body.append(el('p', 'note', 'Denominators: plan progress counts the approved entries of the plan in force; coverage counts active universe entities; findings counts include issued findings only. A compliance status or a risk score is never counted as assurance.'));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Engagements by state'),
    table([{ key: 's', label: 'State', render: r => lab(M.E_STATES, r[0]) }, { key: 'n', label: 'Engagements', num: true, render: r => n0(r[1]) }], Object.entries(m.byState), { class: 'compact' })));
  const high = A.findings.filter(f => f.validation === 'issued' && f.status !== 'closed' && ['high', 'critical'].includes(f.significance));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'High-risk unresolved findings'),
    high.length ? table([{ key: 'id', label: 'Finding', cls: 'mono' }, { key: 'title', label: 'Title', render: r => dn(r.title) }, { key: 'significance', label: 'Significance', render: r => pill(lab(M.SIGNIFICANCE, r.significance), 'bad') },
      { key: 'owner', label: 'Action owner', render: r => dn(r.owner) }, { key: 'due', label: 'Due', render: r => r.due ? (r.due < today() ? pill(r.due, 'bad') : r.due) : '—' }, { key: 'status', label: 'Status', render: r => lab(M.F_STATUS, r.status) }], high, { class: 'compact' })
      : el('div', 'empty-state', tr('None.'))));
  const ev = A.events.slice(-15).reverse();
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Recent audit events'),
    ev.length ? table([{ key: 't', label: 'When', render: r => r.t.slice(0, 16).replace('T', ' ') }, { key: 'by', label: 'By', render: r => dn(r.by) }, { key: 'action', label: 'Event', render: r => dn(r.action) },
      { key: 'id', label: 'Record concerned', render: r => dn(r.id) }, { key: 'detail', label: 'Detail', render: r => dn(r.detail) }], ev, { class: 'compact' }) : el('div', 'empty-state', tr('Nothing recorded yet.')),
    el('p', 'note', 'Audit events are appended, never edited: who did what, when, on which record.')));
}

/* ---------------- charter and methodology ---------------- */
function charter(body, redraw, ws) {
  const A = ws.audit, c = A.charter;
  const cur = M.currentDirective(ws, 'charter'), curM = M.currentDirective(ws, 'methodology');
  body.append(indep());
  const CF = [{ key: 'purpose', label: 'Purpose of the audit function', type: 'area' }, { key: 'authority', label: 'Authority (access to records, people and property)', type: 'area' },
    { key: 'responsibilities', label: 'Responsibilities and scope of work', type: 'area' }, { key: 'independence', label: 'Independence and objectivity', type: 'area' },
    { key: 'reportsTo', label: 'Reports functionally to', type: 'text' }, { key: 'standards', label: 'Standards followed (identifiers only, e.g. IIA GIAS 2024)', type: 'text' }];
  const approve = kind => {
    const g = approveGuard(); if (g) { toast(g, 'bad'); return; }
    ask(kind === 'charter' ? 'Approve the charter' : 'Approve the methodology',
      [{ key: 'preparedBy', label: 'Prepared by', type: 'text' }, { key: 'approvedBy', label: 'Approved by (person)', type: 'text' },
        { key: 'approvingBody', label: 'Approving body (e.g. audit committee)', type: 'text' }, { key: 'date', label: 'Approved on', type: 'date' }],
      { preparedBy: kind === 'charter' ? (cur?.preparedBy || who()) : (curM?.preparedBy || who()), approvedBy: '', approvingBody: 'Audit committee', date: today() },
      v => { const r = M.approveDirective(ws, kind, v); if (r.error) return r.error; logData('audit ' + kind + ' approved', r.directive.id, r.directive.hash.slice(0, 16)); toast(tr('{0} approved and frozen').replace('{0}', r.directive.id)); return null; }, redraw,
      'Approval freezes this version with a SHA-256 hash. The approver must be someone other than the person who prepared it.');
  };
  const differs = M.draftDiffers(ws, 'charter');
  body.append(card(
    el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, 'Audit charter'),
      cur ? pill(tr('Approved version {0}').replace('{0}', cur.version), 'good') : pill('Not approved', 'warn'), differs && cur ? pill('Working copy changed since approval', 'warn') : null),
    el('dl', 'small', ...CF.flatMap(f => [el('dt', null, el('b', null, tr(f.label))), el('dd', { 'data-noi18n': '' }, c[f.key] || '—')])),
    cur ? el('p', 'small muted', tr('Approved by {0} ({1}) on {2} · hash {3}').replace('{0}', cur.approvedBy).replace('{1}', cur.approvingBody).replace('{2}', cur.approvedOn).replace('{3}', short(cur.hash))) : null,
    el('div', 'btnrow',
      el('button', { class: 'btn ghost', onclick: () => G.edit('Audit charter — working copy', CF, c, { onSave: () => { touch(); redraw(); } }) }, 'Edit the working copy'),
      el('button', { class: 'btn', disabled: !differs, onclick: () => approve('charter') }, 'Approve this version'))));
  const MF = [{ key: 'methodology', label: 'Methodology (planning, sampling, rating of findings, reporting)', type: 'area', rows: 8 },
    { key: 'wi', label: 'Plan weight — inherent risk', type: 'number' }, { key: 'wt', label: 'Plan weight — time since last audit', type: 'number' },
    { key: 'wsn', label: 'Plan weight — scenario residual risk', type: 'number' }, { key: 'cycleMonths', label: 'Audit cycle (months) for an entity', type: 'number' }];
  const mrec = { methodology: A.methodology, wi: A.weights.inherent, wt: A.weights.time, wsn: A.weights.scenario, cycleMonths: A.cycleMonths };
  const mdiff = M.draftDiffers(ws, 'methodology');
  body.append(card(
    el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, 'Audit methodology'),
      curM ? pill(tr('Approved version {0}').replace('{0}', curM.version), 'good') : pill('Not approved', 'warn'), mdiff && curM ? pill('Working copy changed since approval', 'warn') : null),
    el('pre', { class: 'small', 'data-noi18n': '', style: { whiteSpace: 'pre-wrap' } }, A.methodology || '—'),
    el('p', 'small', tr('Plan weights: inherent risk {0} · time since last audit {1} · scenario residual risk {2} · cycle {3} months').replace('{0}', A.weights.inherent).replace('{1}', A.weights.time).replace('{2}', A.weights.scenario).replace('{3}', A.cycleMonths)),
    curM ? el('p', 'small muted', tr('Approved by {0} ({1}) on {2} · hash {3}').replace('{0}', curM.approvedBy).replace('{1}', curM.approvingBody).replace('{2}', curM.approvedOn).replace('{3}', short(curM.hash))) : null,
    el('div', 'btnrow',
      el('button', { class: 'btn ghost', onclick: () => G.edit('Audit methodology — working copy', MF, mrec, { validate: r => [r.wi, r.wt, r.wsn].some(x => x == null || x < 0) ? 'Weights are numbers of zero or more.' : (r.wi + r.wt + r.wsn) <= 0 ? 'At least one weight must be above zero.' : null,
        onSave: r => { A.methodology = r.methodology; A.weights = { inherent: r.wi, time: r.wt, scenario: r.wsn }; A.cycleMonths = Number(r.cycleMonths) || 36; touch(); redraw(); } }) }, 'Edit the working copy'),
      el('button', { class: 'btn', disabled: !mdiff, onclick: () => approve('methodology') }, 'Approve this version'))));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Approved versions'),
    A.directives.length ? table([{ key: 'id', label: 'Version', cls: 'mono' }, { key: 'kind', label: 'Directive', render: r => tr(r.kind === 'charter' ? 'Audit charter' : 'Audit methodology') },
      { key: 'state', label: 'State', render: r => pill(tr(r.state === 'approved' ? 'In force' : 'Superseded'), r.state === 'approved' ? 'good' : '') },
      { key: 'approvedBy', label: 'Approved by', render: r => dn(`${r.approvedBy} · ${r.approvingBody}`) }, { key: 'approvedOn', label: 'Approved on' },
      { key: 'hash', label: 'SHA-256', render: r => el('span', 'mono small', short(r.hash)) }, { key: 'ok', label: 'Integrity', render: r => M.directiveIntact(r) ? pill('intact', 'good') : pill('altered', 'bad') },
      { key: 'x', label: '', sortable: false, render: r => el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => download(`${r.id}.json`, JSON.stringify(r, null, 2), 'application/json') }, 'Export') }],
    A.directives.slice().reverse(), { class: 'compact' }) : el('div', 'empty-state', tr('Nothing recorded yet.'))));
}

/* ---------------- procedure library, programmes and SP 800-53A ---------------- */
async function programmes(body, redraw, ws) {
  const A = ws.audit;
  const fields = () => [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'objective', label: 'Objective', type: 'area' }, { key: 'steps', label: 'Steps', type: 'area' },
    { key: 'criteria', label: 'Criteria (identifiers: policy:POL-001, SP 800-53A objectives, provisions)', type: 'list' }, { key: 'controls', label: 'Controls concerned (identifiers)', type: 'list' },
    { key: 'method', label: 'Method', type: 'select', options: M.METHODS }, { key: 'expectedEvidence', label: 'Evidence expected', type: 'area' },
    { key: 'expected', label: 'Expected result', type: 'area' }, { key: 'exception', label: 'Exception logic', type: 'area' }, { key: 'sampling', label: 'Sampling guidance', type: 'area' }];
  body.append(listCard({ title: 'Procedure library', rows: A.procedures, redraw, fields,
    note: 'Versioned procedures. Changing a version that a workpaper already used creates a new version: the workpaper keeps the exact version it followed.',
    blank: () => ({ id: M.nextId(A.procedures, 'PRC'), method: 'inspect', criteria: [], controls: [], version: 1, history: [], source: 'own' }),
    check: r => !String(r.title || '').trim() ? 'A procedure needs a title.' : null,
    onSave: (r, isNew) => { if (isNew) A.procedures.push(r); M.saveProcedure(ws, r); M.event(ws, isNew ? 'procedure added' : 'procedure saved', 'procedure', r.id, 'v' + r.version, who()); return null; },
    columns: [{ key: 'id', label: 'Procedure', cls: 'mono' }, { key: 'title', label: 'Title', render: r => dn(r.title) }, { key: 'method', label: 'Method', render: r => lab(M.METHODS, r.method) },
      { key: 'version', label: 'Version', render: r => pill('v' + (r.version || 1), '') }, { key: 'used', label: 'Used by workpapers', render: r => n0(A.workpapers.filter(w => w.proc?.id === r.id).length) },
      { key: 'source', label: 'Source', render: r => dn(r.source || 'own') }] }));
  let X;
  try { X = await assurance(); } catch (e) { body.append(banner('bad', 'The assurance data could not be read', String(e.message || e))); return; }
  body.append(el('p', 'note', 'NIST SP 800-53A Rev. 5 assessment objectives and methods, taken from CRGO (which binds each objective to its SP 800-53 Rev. 5.2.0 control). IIA, ISACA ITAF, AICPA, COSO and ISO audit standards are referred to by identifier only; their text is not reproduced.'));
  const ids = Object.keys(X.controls).sort();
  const q = el('input', { type: 'search', placeholder: tr('Search a control, e.g. AC-02 or RA-05'), list: 'a53-ids' });
  const dl = el('datalist', { id: 'a53-ids' }, ...ids.map(i => el('option', { value: i })));
  const out = el('div');
  const show = () => {
    const k = q.value.trim().toUpperCase().replace(/^([A-Z]{2})-(\d)\b/, '$1-0$2');
    const c = X.controls[k];
    if (!c) { out.replaceChildren(el('div', 'small muted', ids.length ? tr('{0} controls with assessment objectives.').replace('{0}', n0(ids.length)) : '')); return; }
    out.replaceChildren(card(el('h3', { style: { marginTop: 0 } }, k),
      el('ol', 'small', ...c.objectives.map(([n, t]) => el('li', { 'data-noi18n': '' }, el('b', 'mono', n), ' ', t))),
      ...Object.entries(c.methods).map(([m, t]) => el('p', 'small', el('b', null, tr(m === 'examine' ? 'Examine' : m === 'interview' ? 'Interview' : 'Test') + ': '), el('span', { 'data-noi18n': '' }, t))),
      el('div', 'btnrow', el('button', { class: 'btn sm ghost', onclick: () => {
        const p = { id: M.nextId(A.procedures, 'PRC'), title: `${k} — ${tr('assessment')}`, objective: c.objectives.map(o => o[0]).join(', '), steps: Object.entries(c.methods).map(([m, t]) => `${m}: ${t}`).join('\n'),
          criteria: c.objectives.map(o => o[0]), controls: [k], method: 'examine', expectedEvidence: '', expected: '', exception: '', sampling: '', version: 1, history: [], source: 'SP 800-53A ' + k };
        A.procedures.push(p); M.saveProcedure(ws, p); M.event(ws, 'procedure added', 'procedure', p.id, p.source, who()); touch(); toast(tr('Procedure {0} added to the library').replace('{0}', p.id)); redraw();
      } }, 'Add to the procedure library'))));
  };
  q.addEventListener('input', show);
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'SP 800-53A assessment objectives'), field(tr('Control'), q), dl, out));
  show();
  for (const p of X.programmes) body.append(card(
    el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 }, 'data-noi18n': '' }, L(p.label)), pill('illustrative — not a validated methodology', 'warn')),
    el('p', 'small', { 'data-noi18n': '' }, L(p.objective)),
    table([{ key: 'id', label: 'Procedure', cls: 'mono' }, { key: 'l', label: 'Title', render: r => el('span', { 'data-noi18n': '' }, L(r.label)) }, { key: 'method', label: 'Method' },
      { key: 'objectives', label: 'SP 800-53A objectives', render: r => el('span', 'mono small', r.objectives.join(', ')) }, { key: 'sampling', label: 'Sampling', render: r => el('span', { class: 'small', 'data-noi18n': '' }, r.sampling) }], p.procedures, { class: 'compact' }),
    el('div', 'btnrow', el('button', { class: 'btn ghost', onclick: () => {
      const e = { id: G.nextId(A.engagements, 'ENG'), title: L(p.label) || p.id, kind: 'internal-audit', line: 'internal-audit', nature: 'assurance', focus: '', programme: p.id, status: 'planned', start: today(),
        criteria: [...new Set(p.procedures.flatMap(x => x.objectives))], objectives: [L(p.objective)].filter(Boolean), procedures: [], scope: '', team: [], transitions: [], methodology: M.currentDirective(ws, 'methodology')?.id || '' };
      A.engagements.push(e); M.event(ws, 'engagement created', 'engagement', e.id, p.id, who()); touch(); toast(tr('Engagement {0} created').replace('{0}', e.id)); go('audit/engagements');
    } }, 'Plan an engagement with this programme'),
    el('button', { class: 'btn ghost', onclick: () => {
      let n = 0;
      for (const x of p.procedures) {
        const src = `${p.id}-${x.id}`;
        if (A.procedures.some(y => y.source === src)) continue;
        const r = { id: M.nextId(A.procedures, 'PRC'), title: L(x.label), objective: L(p.objective), steps: x.step, criteria: x.objectives, controls: p.families || [], method: x.method, expectedEvidence: '',
          expected: x.expected, exception: x.exception, sampling: x.sampling, version: 1, history: [], source: src };
        A.procedures.push(r); M.saveProcedure(ws, r); n++;
      }
      touch(); toast(tr('{0} procedures added to the library').replace('{0}', n)); redraw();
    } }, 'Copy into the procedure library'))));
}

/* ---------------- SOC reports and shared evidence ---------------- */
function assuranceTab(body, redraw, ws) {
  const Au = ws.audit;
  body.append(G.register({ title: 'SOC reports', rows: Au.soc, prefix: 'SOC', redraw,
    note: 'Assurance reports received from service organizations. Exceptions in a report and the complementary user entity controls (CUECs) it expects of you are both inputs to the scenarios that depend on that supplier. AICPA Trust Services Criteria are cited by category only.',
    fields: [{ key: 'provider', label: 'Service organization', type: 'text' }, { key: 'type', label: 'Report', type: 'select', options: [['soc1-t2', 'SOC 1 Type 2'], ['soc2-t1', 'SOC 2 Type 1'], ['soc2-t2', 'SOC 2 Type 2'], ['soc3', 'SOC 3'], ['other', 'Other assurance report']] },
      { key: 'period', label: 'Period covered', type: 'text' }, { key: 'received', label: 'Received', type: 'date' },
      { key: 'opinion', label: 'Opinion', type: 'select', options: [['unqualified', 'Unqualified'], ['qualified', 'Qualified'], ['adverse', 'Adverse'], ['disclaimer', 'Disclaimer']] },
      { key: 'categories', label: 'Trust Services Criteria categories', type: 'multi', options: [['security', 'Security'], ['availability', 'Availability'], ['processing-integrity', 'Processing integrity'], ['confidentiality', 'Confidentiality'], ['privacy', 'Privacy']] },
      { key: 'exceptions', label: 'Exceptions noted (one per line)', type: 'list' }, { key: 'cuecs', label: 'Complementary user entity controls expected of us (one per line)', type: 'list' },
      { key: 'cuecStatus', label: 'How we meet the CUECs', type: 'area' }, { key: 'scenarios', label: 'Scenarios that depend on this provider', type: 'multi', options: ws.assessment.SCEN.map(s => [s.id, s.id]) }],
    blank: () => ({ type: 'soc2-t2', opinion: 'unqualified', categories: ['security'], exceptions: [], cuecs: [], scenarios: [] }),
    columns: ['id', 'provider', 'type', 'period', 'opinion', { key: 'x', label: 'Exceptions', render: r => (r.exceptions || []).length ? pill(String(r.exceptions.length), 'bad') : '0' },
      { key: 'c', label: 'CUECs', render: r => String((r.cuecs || []).length) }] }));
  const asOf = today();
  const linksField = { key: 'links', label: 'Linked to (kind:id, one per line — e.g. engagement:ENG-001, finding:FND-001)', type: 'list',
    encode: v => (v || []).map(l => `${l.kind}:${l.id}`), decode: v => v.map(s => { const i = s.indexOf(':'); return i > 0 ? { kind: s.slice(0, i).trim(), id: s.slice(i + 1).trim() } : { kind: 'other', id: s.trim() }; }) };
  const fileIn = el('input', { type: 'file', style: { display: 'none' } });
  fileIn.addEventListener('change', async () => {
    const f = fileIn.files[0]; if (!f) return;
    const buf = await f.arrayBuffer();
    const h = M.sha256(buf);
    const dup = SH.evidence(ws).find(e => (e.sha256 || '').toLowerCase() === h);
    if (dup) { toast(tr('Already registered as {0}').replace('{0}', dup.id), 'warn'); fileIn.value = ''; return; }
    const e = { id: G.nextId(SH.evidence(ws), 'EV'), title: f.name, shows: '', location: f.name, sha256: h, size: f.size, mediaType: f.type || '', collected: today(), collectedBy: who(),
      provenance: `Hashed locally on ${new Date().toISOString().slice(0, 16).replace('T', ' ')}; the file was not copied into the workspace`, sufficiency: '', links: [] };
    SH.evidence(ws).push(e); M.event(ws, 'evidence hashed', 'evidence', e.id, h.slice(0, 16), who()); logData('evidence hashed', e.id, h.slice(0, 16)); touch(); fileIn.value = '';
    toast(tr('Evidence {0} registered with its SHA-256').replace('{0}', e.id)); redraw();
  });
  body.append(G.register({ title: 'Evidence register (shared)', rows: SH.evidence(ws), prefix: 'EV', redraw,
    note: 'The shared evidence register, used by every module. Expired evidence, or evidence judged insufficient, is an evidence gap. Hashing a file computes its SHA-256 on this computer and records its provenance; the file itself is not copied.',
    fields: [{ key: 'title', label: 'What it is', type: 'text', wide: true }, { key: 'shows', label: 'What it shows', type: 'area' },
      { key: 'periodFrom', label: 'Period from', type: 'date' }, { key: 'periodTo', label: 'Period to', type: 'date' },
      { key: 'validUntil', label: 'Valid until', type: 'date' }, { key: 'custodian', label: 'Kept by', type: 'text' },
      { key: 'location', label: 'Where it is kept (path or link)', type: 'text', wide: true }, { key: 'sha256', label: 'SHA-256 of the file (optional)', type: 'text', wide: true },
      { key: 'collectedBy', label: 'Collected by', type: 'text' }, { key: 'provenance', label: 'Provenance and chain of custody', type: 'area' },
      { key: 'sufficiency', label: 'Sufficiency', type: 'select', options: SH.SUFFICIENCY }, { key: 'judgedBy', label: 'Judged by', type: 'text' }, linksField],
    blank: () => ({ links: [], sufficiency: '', collected: today(), collectedBy: who() }),
    columns: ['id', 'title', { key: 'st', label: 'Status', render: r => { const s = SH.evidenceStatus(r, asOf); return pill(tr({ current: 'Current', expired: 'Expired', 'judged-insufficient': 'Judged insufficient', none: 'None' }[s]), SH.EVIDENCE_KIND[s]); } },
      { key: 'sha256', label: 'SHA-256', render: r => el('span', 'mono small', short(r.sha256)) }, 'validUntil', 'custodian',
      { key: 'links', label: 'Linked to', render: r => dn((r.links || []).map(l => `${l.kind}:${l.id}`).join(', ')) }] }));
  body.append(el('div', 'btnrow', fileIn, el('button', { class: 'btn ghost', onclick: () => fileIn.click() }, 'Hash a local file and register it')));
}
