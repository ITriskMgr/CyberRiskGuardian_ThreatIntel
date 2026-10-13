/* Audit management — audit universe and risk-weighted, versioned audit plan.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, n0, go, today, toast, download, toCSV, select, field } from '../util.js';
import { S, touch, compute } from '../state.js';
import * as M from '../ams.js';
import { criticality } from '../assets.js';
import { tr } from '../i18n.js';
import { indep, ask, lab, short, dn, who, approveGuard, logData, listCard } from './audit_ui.js';

/* ---------------- universe ---------------- */
export function universeTab(body, redraw, ws) {
  const A = ws.audit, R = compute(ws);
  const fields = () => [{ key: 'name', label: 'Auditable entity', type: 'text', wide: true }, { key: 'kind', label: 'Kind', type: 'select', options: M.UNIVERSE_KINDS },
    { key: 'ref', label: 'Canonical record (kind:id, e.g. asset:A-001)', type: 'text' }, { key: 'owner', label: 'Owner', type: 'text' },
    { key: 'inherentRisk', label: 'Inherent risk (1 low – 5 very high)', type: 'select', encode: v => String(v ?? 3), decode: v => Number(v), options: [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']] },
    { key: 'inherentBasis', label: 'Basis of the inherent risk rating', type: 'text', wide: true },
    { key: 'lastAudited', label: 'Last audited', type: 'date' }, { key: 'cycleMonths', label: 'Audit cycle (months; empty = methodology)', type: 'number' },
    { key: 'mandatory', label: 'Mandatory (law, regulation or governing body)', type: 'check' }, { key: 'mandatoryBasis', label: 'Basis of the mandatory requirement', type: 'text' },
    { key: 'assets', label: 'Information assets', type: 'multi', options: (ws.assets || []).map(a => [a.id, `${a.id} ${a.name || ''}`]) },
    { key: 'processes', label: 'Business processes (one per line)', type: 'list' },
    { key: 'scenarios', label: 'Risk scenarios (their residual risk informs the plan, read only)', type: 'multi', options: ws.assessment.SCEN.map(s => [s.id, `${s.id} ${s.name || ''}`]) },
    { key: 'status', label: 'Status', type: 'select', options: [['active', 'Active'], ['retired', 'Retired']] }, { key: 'notes', label: 'Notes', type: 'area' }];
  const check = (r, isNew) => {
    if (!String(r.name || '').trim()) return 'Name the auditable entity.';
    if (r.ref) { const dup = A.universe.find(u => u.id !== r.id && u.ref && u.ref === r.ref); if (dup) return tr('{0} already stands for {1}: one auditable entity per canonical record.').replace('{0}', dup.id).replace('{1}', r.ref); }
    if (r.mandatory && !String(r.mandatoryBasis || '').trim()) return 'A mandatory entity needs the basis of the requirement (law, regulation, governing body decision).';
    return null;
  };
  body.append(el('div', 'btnrow',
    el('button', { class: 'btn ghost', onclick: () => { const n = M.suggestFromAssets(ws, criticality); touch(); toast(n.length ? tr('{0} entities added from the asset inventory').replace('{0}', n.length) : tr('Every critical or high asset is already in the universe')); redraw(); } }, 'Add critical and high assets not yet in the universe')));
  body.append(listCard({ title: 'Audit universe', rows: A.universe, redraw, fields, check,
    note: 'Auditable entities and what they stand for. The score shown is computed now with the methodology\'s weights; plan entries keep the score they had when the plan was scored.',
    blank: () => ({ id: M.nextId(A.universe, 'AUE'), kind: 'process', inherentRisk: 3, mandatory: false, assets: [], processes: [], scenarios: [], status: 'active', added: today() }),
    onSave: (r, isNew) => { if (isNew) A.universe.push(r); M.event(ws, isNew ? 'universe entity added' : 'universe entity saved', 'universe', r.id, r.name, who()); return null; },
    columns: [{ key: 'id', label: 'Entity', cls: 'mono' }, { key: 'name', label: 'Name', render: r => dn(r.name) }, { key: 'kind', label: 'Kind', render: r => lab(M.UNIVERSE_KINDS, r.kind) },
      { key: 'ref', label: 'Canonical record', render: r => el('span', 'mono small', r.ref || '—') }, { key: 'inherentRisk', label: 'Inherent', num: true },
      { key: 'lastAudited', label: 'Last audited', render: r => r.lastAudited || pill('never', 'warn') },
      { key: 'score', label: 'Score now', num: true, sort: r => M.scoreEntity(ws, r, A.weights, today(), R).score, render: r => { const s = M.scoreEntity(ws, r, A.weights, today(), R); return el('span', { title: s.rationale, 'data-noi18n': '' }, String(s.score)); } },
      { key: 'mandatory', label: 'Mandatory', render: r => r.mandatory ? pill('mandatory', 'bad') : '' },
      { key: 'links', label: 'Links', render: r => `${(r.assets || []).length} · ${(r.processes || []).length} · ${(r.scenarios || []).length}` },
      { key: 'status', label: 'Status', render: r => lab([['active', 'Active'], ['retired', 'Retired']], r.status) }] }));
  body.append(el('p', 'note', 'Links: assets · processes · scenarios. Scenario residual risk is read from the calculation engine; the audit plan never changes a scenario or a risk score.'));
}

/* ---------------- plan ---------------- */
let planSel = '';
export function planTab(body, redraw, ws) {
  const A = ws.audit;
  body.append(indep());
  const live = A.plans.filter(p => p.state !== 'superseded');
  let p = A.plans.find(x => x.id === planSel) || live.slice(-1)[0] || A.plans.slice(-1)[0] || null;
  const sel = select([['', tr('— choose a plan version —')], ...A.plans.map(x => [x.id, `${x.id} · ${x.period} · v${x.version} · ${lab(M.PLAN_STATES, x.state)}`])], p?.id || '');
  sel.addEventListener('change', () => { planSel = sel.value; redraw(); });
  body.append(el('div', 'row', { style: { alignItems: 'end', gap: '10px', flexWrap: 'wrap' } }, field(tr('Plan version'), sel),
    el('button', { class: 'btn', onclick: () => ask('New audit plan', [{ key: 'period', label: 'Period (year or range)', type: 'text' }, { key: 'by', label: 'Prepared by', type: 'text' }],
      { period: String(new Date().getFullYear() + 1), by: who() }, v => { if (!String(v.period || '').trim()) return 'State the period of the plan.'; if (!A.universe.length) return 'Record the audit universe first: the plan is drawn from it.'; const n = M.newPlan(ws, v); planSel = n.id; return null; }, redraw) }, 'New plan')));
  if (!p) { body.append(el('div', 'empty-state', tr('No audit plan yet. Record the audit universe, approve the methodology, then create a plan.'))); return; }
  const frozen = M.planFrozen(p);
  const intact = M.planIntact(p);
  body.append(card(
    el('div', 'row', { style: { alignItems: 'center', flexWrap: 'wrap', gap: '6px' } }, el('h2', { style: { margin: 0, flex: 1 } }, el('span', { 'data-noi18n': '' }, `${p.id} · ${p.period} · v${p.version}`)),
      pill(lab(M.PLAN_STATES, p.state), p.state === 'approved' ? 'good' : p.state === 'superseded' ? '' : 'warn'),
      p.hash ? pill(intact ? tr('hash intact') : tr('hash does not match'), intact ? 'good' : 'bad') : null),
    el('p', 'small', tr('Weights: inherent risk {0} · time since last audit {1} · scenario residual risk {2}').replace('{0}', p.weights.inherent).replace('{1}', p.weights.time).replace('{2}', p.weights.scenario),
      ' · ', tr('methodology {0}').replace('{0}', p.methodology || tr('not approved')), ' · ', tr('source risk version {0}, scored on {1}').replace('{0}', p.riskVersion || '—').replace('{1}', p.scoredOn || '—')),
    p.supersedes ? el('p', 'small muted', tr('Amendment of {0}.').replace('{0}', p.supersedes)) : null,
    p.state === 'approved' || p.state === 'superseded' ? el('p', 'small muted', tr('Approved by {0} ({1}) on {2} · hash {3}').replace('{0}', p.approvedBy).replace('{1}', p.approvingBody).replace('{2}', p.approvedOn).replace('{3}', short(p.hash))) : null,
    !p.methodology && !frozen ? banner('warn', 'No approved methodology', 'The plan can be drafted, but its scoring weights are not yet backed by an approved methodology version (Charter & methodology).') : null,
    el('div', 'btnrow', ...planButtons(ws, p, redraw))));
  const cut = M.capacityCut(p);
  if (cut.length) body.append(banner('warn', tr('Over capacity by {0} entries').replace('{0}', cut.length), tr('Within {0} hours, these lower-scoring entries would not fit: {1}. Mandatory entries always stay in the plan. Deferring an entry needs a reason and an authoriser.').replace('{0}', p.capacityHours).replace('{1}', cut.map(e => e.id).join(', '))));
  const entries = M.ordered(p);
  body.append(card(el('h2', { style: { marginTop: 0 } }, tr('Entries ({0})').replace('{0}', entries.length)),
    entries.length ? table([{ key: 'id', label: 'Entry', cls: 'mono' }, { key: 'title', label: 'Auditable entity', render: r => dn(`${r.universe} ${r.title}`) },
      { key: 'mandatory', label: 'Mandatory', render: r => r.mandatory ? pill('mandatory', 'bad') : '' },
      { key: 'score', label: 'Score', num: true, render: r => el('details', null, el('summary', null, String(r.score)), el('div', 'small', { 'data-noi18n': '' },
        ...Object.entries(r.factors || {}).map(([k, f]) => el('div', null, `${k}: ${f.value} — ${f.source}`)), el('div', 'muted', r.rationale || ''))) },
      { key: 'hours', label: 'Hours', num: true, render: r => r.hours ?? '—' }, { key: 'scheduled', label: 'Scheduled', render: r => dn(r.scheduled) },
      { key: 'state', label: 'State', render: r => { const s = M.entryState(ws, r); return pill(lab(M.PE_STATES, s), s === 'approved' || s === 'completed' ? 'good' : s === 'proposed' ? '' : 'warn'); } },
      { key: 'reason', label: 'Reason · authorised by', render: r => r.reason ? dn(`${r.reason} · ${r.authorisedBy}${r.override ? ' · ' + r.override : ''}`) : '' },
      { key: 'engagement', label: 'Engagement', render: r => r.engagement ? el('a', { href: '#/audit/engagements' }, r.engagement) : '' },
      { key: 'x', label: '', sortable: false, render: r => el('div', 'btnrow', ...entryButtons(ws, p, r, redraw)) }], entries, { class: 'compact' })
      : el('div', 'empty-state', tr('No entries: add the universe items.'))));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Change log'),
    table([{ key: 'date', label: 'Date' }, { key: 'by', label: 'By', render: r => dn(r.by) }, { key: 'what', label: 'Change made', render: r => dn(r.what) }], p.changeLog.slice().reverse(), { class: 'compact' })));
}

function planButtons(ws, p, redraw) {
  const A = ws.audit, out = [];
  if (!M.planFrozen(p)) {
    out.push(el('button', { class: 'btn ghost', onclick: () => { const n = M.addCandidates(ws, p); touch(); toast(tr('{0} entries added').replace('{0}', n.length)); redraw(); } }, 'Add universe items'),
      el('button', { class: 'btn ghost', onclick: () => { M.rescore(ws, p); p.changeLog.push({ date: today(), by: who(), what: `Rescored (${p.riskVersion})` }); touch(); redraw(); } }, 'Rescore'),
      el('button', { class: 'btn ghost', onclick: () => ask('Capacity', [{ key: 'capacityHours', label: 'Audit hours available for the period', type: 'number' }], { capacityHours: p.capacityHours }, v => { p.capacityHours = v.capacityHours; return null; }, redraw) }, 'Set capacity'),
      p.state === 'draft' ? el('button', { class: 'btn ghost', onclick: () => { p.state = 'review'; p.changeLog.push({ date: today(), by: who(), what: 'Submitted for review' }); M.event(ws, 'plan submitted for review', 'plan', p.id, '', who()); touch(); redraw(); } }, 'Submit for review') : null,
      el('button', { class: 'btn', onclick: () => {
        const g = approveGuard(); if (g) { toast(g, 'bad'); return; }
        ask('Approve the audit plan', [{ key: 'approvedBy', label: 'Approved by (person)', type: 'text' }, { key: 'approvingBody', label: 'Approving body (e.g. audit committee)', type: 'text' }, { key: 'date', label: 'Approved on', type: 'date' }],
          { approvedBy: '', approvingBody: 'Audit committee', date: today() }, v => { const bad = M.approvePlan(ws, p, v); if (!bad) logData('audit plan approved', `${p.id} v${p.version}`, p.hash.slice(0, 16)); return bad; }, redraw,
          'Approval freezes this plan version (SHA-256). Proposed entries become approved. A later change is an amendment: a new version.');
      } }, 'Approve and freeze'));
  }
  if (p.state === 'approved') out.push(el('button', { class: 'btn ghost', onclick: () => ask('Amend the plan', [{ key: 'by', label: 'Prepared by', type: 'text' }, { key: 'why', label: 'Why the plan changes', type: 'area' }], { by: who(), why: '' },
    v => { if (!String(v.why || '').trim()) return 'State why the plan changes.'; const r = M.amendPlan(ws, p, v.by, v.why); if (r.error) return r.error; planSel = r.plan.id; return null; }, redraw) }, 'Amend (new version)'));
  out.push(el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => download(`${p.id}-v${p.version}.csv`, toCSV([['entry', 'universe', 'title', 'mandatory', 'score', 'hours', 'scheduled', 'state', 'reason', 'authorisedBy', 'rationale'],
    ...M.ordered(p).map(e => [e.id, e.universe, e.title, e.mandatory ? 'yes' : '', e.score, e.hours ?? '', e.scheduled, M.entryState(ws, e), e.reason, e.authorisedBy, e.rationale])]), 'text/csv') }, 'Export .csv'));
  return out;
}

function entryButtons(ws, p, e, redraw) {
  const A = ws.audit, out = [];
  const frozen = M.planFrozen(p);
  if (!frozen) {
    out.push(el('button', { class: 'btn sm ghost', onclick: () => ask(tr('Plan entry {0}').replace('{0}', e.id), [{ key: 'hours', label: 'Estimated effort (hours)', type: 'number' }, { key: 'scheduled', label: 'Scheduled (e.g. 2027-Q2)', type: 'text' },
      { key: 'mandatory', label: 'Mandatory', type: 'check' }, { key: 'mandatoryBasis', label: 'Basis of the mandatory requirement', type: 'text' }], { ...e },
      v => { if (v.mandatory && !String(v.mandatoryBasis || '').trim()) return 'A mandatory entry needs the basis of the requirement.'; Object.assign(e, { hours: v.hours, scheduled: v.scheduled, mandatory: !!v.mandatory, mandatoryBasis: v.mandatoryBasis }); p.changeLog.push({ date: today(), by: who(), what: `${e.id} edited` }); return null; }, redraw) }, 'Edit'));
    for (const to of ['deferred', 'cancelled']) if (e.state !== to) out.push(el('button', { class: 'btn sm ghost', onclick: () => ask(to === 'deferred' ? 'Defer the entry' : 'Cancel the entry',
      [{ key: 'reason', label: 'Reason', type: 'area' }, { key: 'authorisedBy', label: 'Authorised by (person)', type: 'text' }, ...(e.mandatory ? [{ key: 'override', label: 'Why the mandatory requirement is met otherwise or no longer applies', type: 'area' }] : [])],
      { reason: '', authorisedBy: '', override: '' }, v => M.setEntryState(ws, p, e, to, { ...v, by: who() }), redraw) }, to === 'deferred' ? 'Defer' : 'Cancel'));
    if (e.state !== 'proposed') out.push(el('button', { class: 'btn sm ghost', onclick: () => { M.setEntryState(ws, p, e, 'proposed', { by: who() }); touch(); redraw(); } }, 'Restore to proposed'));
  } else if (p.state === 'approved' && e.state === 'approved' && !e.engagement) {
    out.push(el('button', { class: 'btn sm', onclick: () => {
      const u = A.universe.find(x => x.id === e.universe) || {};
      const eng = { id: M.nextId(A.engagements, 'ENG'), title: e.title, nature: 'assurance', focus: '', kind: 'internal-audit', line: 'internal-audit', universe: e.universe, planEntry: `${p.id}/${e.id}`, plan: p.id,
        status: 'planned', scope: '', objectives: [], criteria: [], procedures: [], team: [], transitions: [], start: '', methodology: M.currentDirective(ws, 'methodology')?.id || p.methodology || '', scenarios: u.scenarios || [] };
      A.engagements.push(eng); e.engagement = eng.id;   // execution link, outside the approved hash
      M.event(ws, 'engagement created from plan', 'engagement', eng.id, `${p.id}/${e.id}`, who()); touch(); toast(tr('Engagement {0} created').replace('{0}', eng.id)); go('audit/engagements');
    } }, 'Create the engagement'));
  }
  return out;
}
