/* SOAR — playbooks, approval gates and decisions, recorded actions, dry-run simulations, lessons learned.
   Screens of js/panels/soar.js (same panel). LOCAL ONLY: nothing is executed on a real system.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, today, toast, field, select, uid } from '../util.js';
import { touch } from '../state.js';
import * as G from '../grcui.js';
import * as LOG from '../logs.js';
import * as SH from '../shared.js';
import * as M from '../soar.js';
import { tr } from '../i18n.js';
import { ui, byName, independenceNote, caseOpts, incOpts } from './soar.js';
import { linksField } from './shared.js';

/** The approval check of an execution, as a pill: an audit signal, never an authorisation. */
export function reasonPill(reason, gated = true) {
  if (!gated) return pill('not gated', '');
  if (!reason) return pill('valid approval recorded', 'good');
  return el('span', { 'data-reason': reason }, pill(tr(M.REASON_LABEL[reason] || reason), 'bad'), ' ', el('span', 'small muted', 'audit signal'));
}
const rcPill = k => pill(tr(M.label(M.RISK_CLASS, k)), k === 'destructive' ? 'bad' : k === 'containment' ? 'warn' : '');

/* ---------------- playbooks ---------------- */
const PB_FIELDS = ws => [{ key: 'name', label: 'Name', type: 'text', wide: true }, { key: 'purpose', label: 'Purpose', type: 'area' }, { key: 'owner', label: 'Owner', type: 'text' },
  { key: 'category', label: 'Incident category handled', type: 'select', options: [['', '—'], ...M.CATEGORY] },
  { key: 'tkind', label: 'Trigger', type: 'select', options: M.TRIGGER }, { key: 'tcond', label: 'Trigger conditions', type: 'text', wide: true },
  { key: 'scenarios', label: 'Risk scenarios it addresses (intent; it does not reduce risk by itself)', type: 'multi', options: ws.assessment.SCEN.map(s => [s.id, s.id]) }];
function editPlaybook(ws, R, pb, redraw) {
  const isNew = !pb;
  pb ||= { id: M.nextId(R.playbooks, 'PB'), name: '', purpose: '', owner: byName(), trigger: { kind: 'alert', conditions: '' }, scenarios: [], versions: [], current: null };
  const proxy = { ...pb, tkind: pb.trigger?.kind || 'manual', tcond: pb.trigger?.conditions || '' };
  G.edit(isNew ? 'New playbook' : 'Playbook', PB_FIELDS(ws), proxy, {
    validate: p => !String(p.name || '').trim() ? 'A playbook needs a name.' : null,
    onSave: p => {
      const { tkind, tcond, ...rest } = p;
      Object.assign(pb, rest, { trigger: { kind: tkind, conditions: tcond } });
      if (isNew) { R.playbooks.push(pb); M.newDraft(pb, null); ui.selPb = pb.id; }
      touch(); redraw();
    },
    onDelete: isNew ? null : () => { R.playbooks.splice(R.playbooks.indexOf(pb), 1); touch(); redraw(); } });
}
export function playbooks(body, redraw, ws, R) {
  body.append(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, `${tr('Playbooks')} (${R.playbooks.length})`),
    el('button', { class: 'btn sm', onclick: () => editPlaybook(ws, R, null, redraw) }, 'Add')),
    R.playbooks.length ? table([{ key: 'id', label: 'ID', cls: 'mono' }, { key: 'name', label: 'Name', render: p => el('span', { 'data-noi18n': '' }, p.name) },
      { key: 'trigger', label: 'Trigger', render: p => tr(M.label(M.TRIGGER, p.trigger?.kind)) }, { key: 'current', label: 'Version in force', render: p => p.current != null ? 'v' + p.current : pill('none published', 'warn') },
      { key: 'draft', label: 'Draft', render: p => M.draftVersion(p) ? 'v' + M.draftVersion(p).version : '—' },
      { key: 'sim', label: 'Simulation', render: p => p.current == null ? '—' : M.simulationPassed(ws, p) ? pill('passed', 'good') : pill('not tested', 'warn') },
      { key: '_', label: '', sortable: false, render: p => el('div', 'btnrow', el('button', { class: 'btn sm', onclick: () => { ui.selPb = p.id; redraw(); } }, 'Steps and versions'),
        el('button', { class: 'btn sm ghost', onclick: () => editPlaybook(ws, R, p, redraw) }, 'Open')) }], R.playbooks, { class: 'compact' }) : el('div', 'empty-state', 'Nothing recorded yet.')));
  const pb = R.playbooks.find(p => p.id === ui.selPb);
  if (pb) body.append(pbDetail(ws, R, pb, redraw));
}
function pbDetail(ws, R, pb, redraw) {
  pb.versions ||= [];
  const d = card(el('h2', { style: { marginTop: 0 } }, el('span', { 'data-noi18n': '' }, `${pb.id} · ${pb.name}`)));
  const gateOpts = [['', '—'], ...R.gates.map(g => [g.id, `${g.id} · ${g.name || ''}`])];
  const draft = M.draftVersion(pb);
  const msg = el('div');
  if (draft) {
    const set = (s, k, v) => { s[k] = v; touch(); };
    const rows = draft.steps.map((s, i) => {
      const inp = (k, ph) => { const n = el('input', { type: 'text', value: s[k] || '', 'data-noi18n': '', placeholder: ph ? tr(ph) : '', 'data-k': k }); n.addEventListener('change', () => set(s, k, n.value.trim())); return n; };
      const rc = select(M.RISK_CLASS.map(([v, t]) => [v, tr(t)]), s.riskClass || 'read-only', { 'data-k': 'riskClass' }); rc.addEventListener('change', () => { set(s, 'riskClass', rc.value); redraw(); });
      const gt = select(gateOpts, s.gate || '', { 'data-k': 'gate' }); gt.addEventListener('change', () => set(s, 'gate', gt.value));
      const rq = el('input', { type: 'checkbox', checked: !!s.requiresGate, style: { width: 'auto' }, 'data-k': 'requiresGate', 'aria-label': 'Requires approval gate' }); rq.addEventListener('change', () => set(s, 'requiresGate', rq.checked));
      const mv = (j) => { const a = draft.steps; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; touch(); redraw(); };
      return el('tr', { 'data-step': s.id }, el('td', 'mono', String(i + 1)), el('td', null, inp('name', 'Step')), el('td', null, inp('action', 'e.g. disable account')), el('td', null, rc),
        el('td', null, gt), el('td', null, rq, M.ALWAYS_GATED.includes(s.riskClass) && !s.requiresGate && !s.gate ? pill('gate required', 'bad') : null), el('td', null, inp('evidence', 'Expected evidence')),
        el('td', null, el('div', 'btnrow', el('button', { class: 'btn sm ghost', 'aria-label': 'Move up', onclick: () => mv(i - 1) }, '↑'), el('button', { class: 'btn sm ghost', 'aria-label': 'Move down', onclick: () => mv(i + 1) }, '↓'),
          el('button', { class: 'btn sm ghost danger', onclick: () => { draft.steps.splice(i, 1); touch(); redraw(); } }, 'Remove'))));
    });
    const by = el('input', { type: 'text', value: byName(), 'data-noi18n': '', 'aria-label': 'Published by' });
    d.append(el('h3', null, tr('Draft version v{0} — step editor').replace('{0}', draft.version)),
      el('table', 'compact steps', el('thead', null, el('tr', null, ...['#', 'Step', 'Action', 'Risk class', 'Approval gate', 'Requires gate', 'Expected evidence', ''].map(h => el('th', null, h)))), el('tbody', null, ...rows)),
      el('div', 'btnrow', el('button', { class: 'btn ghost', onclick: () => { const n = draft.steps.reduce((m, s) => Math.max(m, Number(String(s.id).split('-').pop()) || 0), 0) + 1; draft.steps.push({ id: 'ST-' + n, name: '', action: '', riskClass: 'read-only', gate: '', requiresGate: false, evidence: '' }); touch(); redraw(); } }, 'Add a step')),
      el('div', 'grid g2', field(tr('Published by (person)'), by)),
      el('div', 'btnrow', el('button', { class: 'btn', 'data-act': 'publish', onclick: async () => {
        const r = await M.publish(ws, pb, draft, { by: by.value.trim() });
        if (r.error) { const errs = M.publishErrors(ws, pb, draft); msg.replaceChildren(banner('bad', 'Cannot publish', errs.length ? el('ul', null, ...errs.map(e => el('li', null, tr(e)))) : tr(r.error))); return; }
        LOG.data('playbook version published', `${pb.id} v${draft.version}`, `sha256 ${draft.sha256} by ${by.value.trim()}`, ws.name);
        touch(); toast(tr('v{0} published and frozen').replace('{0}', draft.version)); redraw();
      } }, 'Publish and freeze this version')), msg);
    const errs = M.publishErrors(ws, pb, draft);
    if (errs.length) d.append(el('ul', 'small', ...errs.map(e => el('li', null, tr(e)))));
  } else d.append(el('div', 'btnrow', el('button', { class: 'btn', onclick: () => { M.newDraft(pb); touch(); redraw(); } }, 'New draft version from the version in force')));
  const pubs = pb.versions.filter(v => v.state !== 'draft');
  d.append(el('h3', null, 'Published versions'), pubs.length ? table([{ key: 'version', label: 'Version', render: v => 'v' + v.version + (v.version === pb.current ? ' ✓' : '') },
    { key: 'state', label: 'State', render: v => tr(M.label(M.VERSION_STATE, v.state)) }, { key: 'published', label: 'Published' }, { key: 'publishedBy', label: 'By', render: v => el('span', { 'data-noi18n': '' }, v.publishedBy || '') },
    { key: 'steps', label: 'Steps', render: v => el('span', { 'data-noi18n': '' }, (v.steps || []).map(s => `${s.action} [${s.riskClass}]`).join(' → ')) },
    { key: 'sha256', label: 'SHA-256', render: v => el('span', 'mono small', { title: v.sha256 || '' }, (v.sha256 || '').slice(0, 16) + '…') },
    { key: 'sim', label: 'Simulation', render: v => R.simulations.some(s => s.playbook === pb.id && s.version === v.version && s.result === 'passed') ? pill('passed', 'good') : pill('not tested', 'warn') },
    { key: '_', label: '', sortable: false, render: v => el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: async e => { const okv = await M.verifyVersion(pb, v); e.target.replaceWith(pill(okv ? 'hash verified' : 'hash mismatch — content changed', okv ? 'good' : 'bad')); } }, 'Verify hash') }],
  pubs, { class: 'compact' }) : el('div', 'empty-state', 'No version published yet.'));
  return d;
}

/* ---------------- approval gates and decisions ---------------- */
export function approvals(body, redraw, ws, R) {
  body.append(banner('warn', 'Only a recorded human approval authorises a response action', 'Containment and destructive actions always need an approval (default-deny). No self-approval: the approver is never the requester. A pre-authorisation is bounded by a scope and an expiry, and can be revoked.'));
  const ind = independenceNote(); if (ind) body.append(ind);
  body.append(G.register({ title: 'Approval gates', rows: R.gates, prefix: 'GATE', redraw,
    fields: [{ key: 'name', label: 'Name', type: 'text', wide: true }, { key: 'riskClasses', label: 'Risk classes that need approval', type: 'multi', options: M.RISK_CLASS },
      { key: 'criticalAssets', label: 'Applies whenever the target is a crown-jewel asset', type: 'check' },
      { key: 'authorities', label: 'Who may approve (names or roles, one per line)', type: 'list' }, { key: 'scope', label: 'Scope', type: 'area' },
      { key: 'validFrom', label: 'Valid from', type: 'date' }, { key: 'validUntil', label: 'Valid until', type: 'date' }],
    blank: () => ({ riskClasses: ['containment', 'destructive'], criticalAssets: true, authorities: [] }),
    validate: g => !String(g.name || '').trim() ? 'A gate needs a name.' : !(g.authorities || []).length ? 'Name who may approve.' : g.validFrom && g.validUntil && g.validUntil < g.validFrom ? 'The end date is before the start date.' : null,
    columns: ['id', 'name', { key: 'riskClasses', label: 'Risk classes', render: g => el('span', null, ...(g.riskClasses || []).map(rcPill)) }, { key: 'criticalAssets', label: 'Crown jewels', render: g => g.criticalAssets ? '✓' : '' },
      { key: 'authorities', label: 'Authority', render: g => el('span', { 'data-noi18n': '' }, (g.authorities || []).join(', ')) }, 'validUntil'] }));
  const now = M.T(M.nowLocal());
  const stPill = a => { const s = M.approvalStatus(a, now); return pill(tr({ requested: 'Requested', granted: 'Granted', denied: 'Denied', expired: 'Expired', revoked: 'Revoked' }[s]), s === 'granted' ? 'good' : s === 'requested' ? 'warn' : 'bad'); };
  body.append(G.register({ title: 'Approval decisions', rows: R.approvals, prefix: 'APR', redraw,
    note: 'One decision per request: for a specific action or execution, or a bounded pre-authorisation of risk classes. Revoking keeps the record and its history.',
    fields: [{ key: 'kind', label: 'Kind', type: 'select', options: M.APPROVAL_KIND }, { key: 'gate', label: 'Approval gate', type: 'select', options: [['', '—'], ...R.gates.map(g => [g.id, `${g.id} · ${g.name || ''}`])] },
      { key: 'requestedBy', label: 'Requested by', type: 'text' }, { key: 'requested', label: 'Requested on', type: 'date' },
      { key: 'outcome', label: 'Decision', type: 'select', options: M.OUTCOME }, { key: 'approver', label: 'Approver (not the requester)', type: 'text' }, { key: 'decidedOn', label: 'Decided on', type: 'text', placeholder: 'YYYY-MM-DD or YYYY-MM-DDTHH:MM' },
      { key: 'case', label: 'Case', type: 'select', options: caseOpts(R) }, { key: 'execution', label: 'Execution approved (specific)', type: 'select', options: [['', '—'], ...R.executions.map(x => [x.id, `${x.id} · ${x.action}`])] },
      { key: 'action', label: 'Action approved', type: 'text' }, { key: 'riskClasses', label: 'Risk classes pre-authorised', type: 'multi', options: M.RISK_CLASS },
      { key: 'targets', label: 'Targets in scope (one per line)', type: 'list' }, { key: 'scope', label: 'Scope (written)', type: 'text', wide: true },
      { key: 'validFrom', label: 'Valid from', type: 'text', placeholder: 'YYYY-MM-DD or YYYY-MM-DDTHH:MM' }, { key: 'validUntil', label: 'Valid until (expiry)', type: 'text', placeholder: 'YYYY-MM-DD or YYYY-MM-DDTHH:MM' },
      { key: 'revokedOn', label: 'Revoked on', type: 'text', placeholder: 'YYYY-MM-DD or YYYY-MM-DDTHH:MM' }, { key: 'revokedBy', label: 'Revoked by', type: 'text' }, { key: 'rationale', label: 'Rationale', type: 'area' }],
    blank: () => ({ kind: 'specific', outcome: 'requested', requestedBy: byName(), requested: today(), riskClasses: [], targets: [] }),
    validate: M.approvalError,
    actions: a => a.outcome === 'approved' && !a.revokedOn ? [el('button', { class: 'btn sm ghost danger', onclick: () => {
      const p = { revokedBy: byName(), revokedOn: M.nowLocal(), revocationReason: '' };
      G.edit('Revoke the approval', [{ key: 'revokedBy', label: 'Revoked by', type: 'text' }, { key: 'revokedOn', label: 'Revoked on', type: 'text' }, { key: 'revocationReason', label: 'Why', type: 'area' }], p, {
        validate: x => !String(x.revokedBy || '').trim() ? 'A revocation needs the name of the person who revoked the approval.' : !x.revokedOn ? 'Record when it was revoked.' : null,
        onSave: x => { Object.assign(a, x); LOG.data('approval revoked', a.id, `by ${x.revokedBy} on ${x.revokedOn}`, ws.name); touch(); redraw(); } });
    } }, 'Revoke')] : [],
    columns: ['id', 'kind', { key: 'st', label: 'Status', render: stPill }, { key: 'requestedBy', label: 'Requested by', render: a => el('span', { 'data-noi18n': '' }, a.requestedBy || '') },
      { key: 'approver', label: 'Approver', render: a => el('span', { 'data-noi18n': '' }, a.approver || '—') },
      { key: 'what', label: 'For', render: a => el('span', { 'data-noi18n': '' }, a.execution || a.action || (a.riskClasses || []).join(', ') || '—') },
      { key: 'validUntil', label: 'Valid until', render: a => a.validUntil || (a.kind === 'pre-authorisation' ? pill('no expiry', 'bad') : '—') }] }));
}

/* ---------------- recorded actions ---------------- */
export function actions(body, redraw, ws, R) {
  body.append(banner('warn', 'Manual recorded actions only — audit signal, never authorisation', 'Record what a person did on a real system, outside this application: who, what, when, the attempt identifier and the evidence. Each gated action is checked against the approval it relied on; a missing or invalid approval is an audit signal.'));
  const pbOpts = [['', '—'], ...R.playbooks.map(p => [p.id, `${p.id} · ${p.name}`])];
  body.append(G.register({ title: 'Action executions', rows: R.executions, prefix: 'EXE', redraw,
    fields: [{ key: 'case', label: 'Case', type: 'select', options: caseOpts(R) }, { key: 'playbook', label: 'Playbook', type: 'select', options: pbOpts },
      { key: 'version', label: 'Playbook version', type: 'number' }, { key: 'step', label: 'Step (identifier)', type: 'text' },
      { key: 'action', label: 'Action carried out', type: 'text', wide: true }, { key: 'riskClass', label: 'Risk class', type: 'select', options: M.RISK_CLASS },
      { key: 'target', label: 'Target (host, account, service)', type: 'text' }, { key: 'criticalAsset', label: 'Target is a crown-jewel asset', type: 'check' },
      { key: 'performedBy', label: 'Carried out by', type: 'text' }, { key: 'attempt', label: 'Attempt identifier', type: 'text' },
      { key: 'started', label: 'Started', type: 'text', placeholder: 'YYYY-MM-DDTHH:MM' }, { key: 'ended', label: 'Ended', type: 'text', placeholder: 'YYYY-MM-DDTHH:MM' },
      { key: 'status', label: 'Result', type: 'select', options: M.EXEC_STATUS },
      { key: 'approval', label: 'Approval relied on', type: 'select', options: [['', '—'], ...R.approvals.map(a => [a.id, `${a.id} · ${a.approver || ''} · ${a.action || a.execution || (a.riskClasses || []).join(', ')}`])] },
      { key: 'evidence', label: 'Response evidence (pointers or EV identifiers, one per line)', type: 'list' }, { key: 'notes', label: 'What happened', type: 'area' }],
    blank: () => ({ case: ui.selCase || '', riskClass: 'read-only', performedBy: byName(), started: M.nowLocal(), status: 'succeeded', attempt: uid('att'), evidence: [] }),
    validate: x => M.executionError(ws, x),
    columns: ['id', 'case', { key: 'action', label: 'Action', render: x => el('span', { 'data-noi18n': '' }, x.action) }, { key: 'riskClass', label: 'Risk class', render: x => rcPill(x.riskClass) },
      { key: 'performedBy', label: 'By', render: x => el('span', { 'data-noi18n': '' }, x.performedBy) }, 'started', 'status', { key: 'attempt', label: 'Attempt', render: x => el('span', 'mono small', x.attempt || '') },
      { key: 'ap', label: 'Approval check', render: x => reasonPill(M.approvalReason(ws, x), M.isGated(ws, x, M.T(x.started))) },
      { key: 'ev', label: 'Evidence', render: x => (x.evidence || []).length ? String(x.evidence.length) : pill('none', 'warn') }] }));
}

/* ---------------- dry-run simulations ---------------- */
export function simulations(body, redraw, ws, R) {
  body.append(banner('good', 'Dry run — nothing is executed', 'The simulation walks the playbook version step by step on paper: which steps need an approval, whether one is in force, which steps lack expected evidence. No system is touched.'));
  const pbs = R.playbooks.filter(p => (p.versions || []).length);
  const pbSel = select([['', '—'], ...pbs.map(p => [p.id, `${p.id} · ${p.name}`])], ui.simPb || '', { 'aria-label': 'Playbook' });
  const pb = pbs.find(p => p.id === pbSel.value);
  const verSel = select((pb?.versions || []).map(v => [String(v.version), `v${v.version} · ${tr(M.label(M.VERSION_STATE, v.state))}`]), String(pb?.current ?? pb?.versions?.[0]?.version ?? ''), { 'aria-label': 'Version' });
  pbSel.addEventListener('change', () => { ui.simPb = pbSel.value; ui.run = null; redraw(); });
  const caseSel = select(caseOpts(R), ui.selCase || '', { 'aria-label': 'Case' });
  const scSel = select([['', '—'], ...ws.assessment.SCEN.map(s => [s.id, `${s.id} · ${s.name}`])], '', { 'aria-label': 'Scenario' });
  const at = el('input', { type: 'text', value: M.nowLocal(), 'aria-label': 'As of', 'data-noi18n': '' });
  const by = el('input', { type: 'text', value: byName(), 'aria-label': 'Run by', 'data-noi18n': '' });
  const notes = el('input', { type: 'text', 'data-noi18n': '', 'aria-label': 'Notes' });
  const msg = el('div');
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Run a dry run'),
    el('div', 'grid g3', field(tr('Playbook'), pbSel), field(tr('Version'), verSel), field(tr('Against case'), caseSel), field(tr('or scenario'), scSel), field(tr('As of'), at), field(tr('Run by (person)'), by)),
    el('div', 'btnrow', el('button', { class: 'btn', 'data-act': 'dryrun', onclick: () => {
      if (!pb) { msg.replaceChildren(banner('bad', tr('Choose a playbook.'))); return; }
      const run = M.dryRun(ws, pb, Number(verSel.value), { caseId: caseSel.value, scenario: scSel.value, at: at.value });
      if (run.error) { msg.replaceChildren(banner('bad', tr(run.error))); return; }
      ui.run = run; redraw();
    } }, 'Walk the steps (dry run)')), msg));
  const run = ui.run;
  if (run && run.playbook === pb?.id) {
    body.append(card(el('h2', { style: { marginTop: 0 } }, tr('Dry run of {0} v{1}').replace('{0}', run.playbook).replace('{1}', run.version), ' ', pill(tr(run.result === 'passed' ? 'Passed' : 'Failed'), run.result === 'passed' ? 'good' : 'bad')),
      table([{ key: 'n', label: '#' }, { key: 'action', label: 'Action', render: s => el('span', { 'data-noi18n': '' }, s.action || '—') }, { key: 'riskClass', label: 'Risk class', render: s => rcPill(s.riskClass) },
        { key: 'gated', label: 'Needs approval', render: s => s.gated ? (s.approval ? pill(tr('yes — {0} in force').replace('{0}', s.approval), 'good') : pill('yes — none in force', 'warn')) : 'no' },
        { key: 'flags', label: 'Flags', render: s => el('div', 'small', ...s.flags.map(f => el('div', null, tr(f)))) },
        { key: 'issues', label: 'Issues', render: s => s.issues.length ? el('div', null, ...s.issues.map(f => pill(tr(f), 'bad'))) : pill('ok', 'good') }], run.steps, { class: 'compact' }),
      el('div', 'grid g2', field(tr('Notes'), notes)),
      el('div', 'btnrow', el('button', { class: 'btn', 'data-act': 'record-sim', onclick: () => {
        const r = M.recordSimulation(ws, run, { by: by.value.trim(), date: String(at.value || today()).slice(0, 10), notes: notes.value.trim() });
        if (r.error) { msg.replaceChildren(banner('bad', tr(r.error))); return; }
        LOG.data('playbook simulation recorded', `${run.playbook} v${run.version}`, `${run.result} by ${by.value.trim()}`, ws.name);
        ui.run = null; touch(); toast(tr('Simulation {0} recorded').replace('{0}', r.simulation.id)); redraw();
      } }, 'Record the result'))));
  }
  body.append(card(el('h2', { style: { marginTop: 0 } }, `${tr('Simulations')} (${R.simulations.length})`),
    R.simulations.length ? table([{ key: 'id', label: 'ID' }, { key: 'playbook', label: 'Playbook' }, { key: 'version', label: 'Version', render: s => 'v' + s.version }, { key: 'date', label: 'Date' },
      { key: 'by', label: 'By', render: s => el('span', { 'data-noi18n': '' }, s.by) }, { key: 'ctx', label: 'Against', render: s => s.case || s.scenario || '—' },
      { key: 'result', label: 'Result', render: s => pill(tr(s.result === 'passed' ? 'Passed' : 'Failed'), s.result === 'passed' ? 'good' : 'bad') },
      { key: 'n', label: 'Steps needing approval', render: s => String((s.steps || []).filter(x => x.needsApproval).length) },
      { key: 'del', label: '', sortable: false, render: s => el('button', { class: 'btn sm ghost danger', onclick: () => { if (window.confirm(tr('Delete this record?'))) { R.simulations.splice(R.simulations.indexOf(s), 1); touch(); redraw(); } } }, 'Delete') }],
    R.simulations, { class: 'compact' }) : el('div', 'empty-state', 'Nothing recorded yet.')));
}

/* ---------------- lessons learned ---------------- */
export function lessons(body, redraw, ws, R) {
  body.append(G.register({ title: 'Lessons learned', rows: R.lessons, prefix: 'LL', redraw,
    note: 'A lesson that calls for a change becomes a corrective action in the shared register, routed to its owner and closed only after independent verification.',
    fields: [{ key: 'case', label: 'Case', type: 'select', options: caseOpts(R) }, { key: 'incident', label: 'Incident', type: 'select', options: incOpts(ws) },
      { key: 'date', label: 'Date', type: 'date' }, { key: 'by', label: 'Recorded by', type: 'text' }, { key: 'lesson', label: 'Lesson', type: 'area' },
      { key: 'scenarios', label: 'Risk scenarios concerned', type: 'multi', options: ws.assessment.SCEN.map(s => [s.id, s.id]) },
      linksField('links', 'Policy clauses, controls, determinations or audit references (kind:id, one per line)')],
    blank: () => ({ case: ui.selCase || '', date: today(), by: byName(), scenarios: [], links: [], actions: [] }),
    validate: l => !String(l.lesson || '').trim() ? 'Write the lesson.' : !l.case && !l.incident ? 'Choose the case or the incident.' : null,
    actions: l => [el('button', { class: 'btn sm', onclick: () => {
      const p = { title: String(l.lesson || '').slice(0, 80), owner: '', due: '' };
      G.edit('Create a corrective action', [{ key: 'title', label: 'Action', type: 'text', wide: true }, { key: 'owner', label: 'Owner', type: 'text' }, { key: 'due', label: 'Due', type: 'date' }], p, {
        validate: x => !String(x.title || '').trim() ? 'Name the action.' : !String(x.owner || '').trim() ? 'Name the owner.' : null,
        onSave: x => { const a = M.lessonAction(ws, l, x); LOG.data('corrective action from lesson', a.id, `${l.id}`, ws.name); touch(); toast(tr('Corrective action {0} created').replace('{0}', a.id)); redraw(); } });
    } }, 'Create corrective action')],
    columns: ['id', { key: 'case', label: 'Case', render: l => l.case || '—' }, { key: 'incident', label: 'Incident', render: l => l.incident || '—' }, 'date',
      { key: 'lesson', label: 'Lesson', render: l => el('span', { 'data-noi18n': '' }, String(l.lesson || '').slice(0, 120)) },
      { key: 'actions', label: 'Corrective actions', render: l => (l.actions || []).length ? el('span', null, ...(l.actions || []).map(id => { const a = SH.actions(ws).find(x => x.id === id); return pill(`${id}${a ? ' · ' + tr(SH.ACTION_STATES.find(s => s[0] === a.state)?.[1] || a.state) : ''}`, a?.state === 'verified' ? 'good' : 'warn'); })) : '—' }] }));
}
