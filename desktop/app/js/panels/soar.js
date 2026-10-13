/* SOAR — security orchestration and response, LOCAL ONLY (Beta 1.6.x).

   Overview      cases, incidents, approval audit signals, playbook readiness; import of a
                 crg-soar-import/1 file (docs/SIEM-SOAR-IMPORT-FORMAT.md).
   Cases         investigations from SIEM escalation or opened by hand: timeline, assignee, status
                 machine open→investigating→contained→eradicated→recovered→closed, forensic artefacts.
                 "Confirm as incident" needs a named person and a date; an alert never becomes an
                 incident by itself.
   Incidents     the incident register (the same records as Cybersecurity management → Incidents), with
                 impacts, communications (a regulator notice is also a regulatory submission), recovery
                 verifications and response measurements.
   Playbooks, Approval gates, Actions, Simulations, Lessons learned: js/panels/soar_ops.js.
   Nothing here connects to a product or executes anything on a real system.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, kpi, n0, today, toast, field, select } from '../util.js';
import { S, touch } from '../state.js';
import * as G from '../grcui.js';
import * as users from '../users.js';
import * as LOG from '../logs.js';
import * as M from '../soar.js';
import { tr } from '../i18n.js';
import { INC_STATUS, REPORT, incidentFields, incidentBlank, incidentValidate } from './csm.js';
import { playbooks, approvals, actions, simulations, lessons, reasonPill } from './soar_ops.js';

export const HELP = {
  '': { d: 'Cases, incidents, versioned playbooks, approval gates, manually recorded actions and dry-run simulations. Nothing is executed on a real system.', g: 'soar',
    h: ['SOAR here is local: responders record what they did, when, with which attempt identifier and evidence, and each action is checked against the recorded approvals. Approval gaps are audit signals; the application never authorises an action.',
      'An alert is never an incident: a case becomes an incident only when a named person confirms it on a date.'] },
  dashboard: { d: 'Open cases, confirmed incidents, executions without a valid approval and playbook readiness; import of a SOAR file.', g: 'soar-dashboard',
    h: ['The import reads a local crg-soar-import/1 JSON file (playbooks, cases, gates, approvals, executions, simulations). Invalid records are skipped and listed; the import is recorded in the data log.'] },
  cases: { d: 'Investigations: timeline, assignee, status, forensic artefacts and incident confirmation.', g: 'soar-cases',
    h: ['A case moves open → investigating → contained → eradicated → recovered → closed, one stage at a time; closing needs a rationale.', '"Confirm as incident" needs the name of the person who confirms and the date. It creates or links the incident in the incident register; Compliance computes notification deadlines from the confirmed date.'] },
  incidents: { d: 'The incident register, with impacts, communications, recovery verifications and response measurements.', g: 'soar-incidents',
    h: ['These are the same incident records as Cybersecurity management → Incidents. A notice to a regulator is also recorded as a regulatory submission in Compliance management.'] },
  playbooks: { d: 'Versioned playbooks: steps, actions, risk classes, gates and expected evidence. Publishing freezes a version with SHA-256.', g: 'soar-playbooks',
    h: ['Edit the draft version; publish it to freeze it. Published versions are never edited: start a new draft. A containment or destructive step must require an approval gate.'] },
  approvals: { d: 'Approval gates and approval decisions: authority, scope, validity, expiry and revocation.', g: 'soar-approvals',
    h: ['A gate says which risk classes need approval and who may approve. An approval decision is made by someone other than the requester, for a scope and a validity period, and can be revoked. A pre-authorisation is always bounded by a scope and an expiry.'] },
  actions: { d: 'Manually recorded response actions: who did what, when, attempt identifier, evidence, and the approval relied on.', g: 'soar-actions',
    h: ['Each execution is checked against the approvals: absent, expired, revoked, not yet valid, wrong authority, not corresponding or not granted. This is an audit signal, never an authorisation by the application.'] },
  simulations: { d: 'Dry runs of a playbook version against a case or a scenario: nothing is executed.', g: 'soar-simulations',
    h: ['The dry run walks the steps, flags those needing approval and those without expected evidence, and records the result passed or failed with a date. A playbook counts as tested when a passed simulation exists for its current version.'] },
  lessons: { d: 'Lessons learned from cases and incidents, turned into shared corrective actions.', g: 'soar-lessons',
    h: ['A corrective action created here is kept in the shared register (Shared registers → Corrective actions) and closed only after independent verification.'] },
};

const TABS = [['dashboard', 'Overview'], ['cases', 'Cases'], ['incidents', 'Incidents'], ['playbooks', 'Playbooks'], ['approvals', 'Approval gates'], ['actions', 'Actions'], ['simulations', 'Simulations'], ['lessons', 'Lessons learned']];
let view = 'dashboard';
export const ui = { selCase: '', lastImport: null };

export function render(sec, arg) {
  const [v, x] = String(arg || '').split('/');
  if (TABS.some(t => t[0] === v)) view = v;
  if (view === 'cases' && x) ui.selCase = x;
  const ws = S.ws, R = M.reg(ws);
  R.cases.forEach(M.normCase);
  sec.replaceChildren(el('h1', null, 'SOAR'));
  sec.append(banner('warn', 'Local only — nothing is executed', 'Responders record the actions they carried out; playbooks are walked in dry runs. No connector, no automation on a real system. Approval checks are audit signals.'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of TABS) st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), 'data-tab': k, onclick: () => { view = k; history.replaceState(null, '', '#/soar/' + k); render(sec); } }, t));
  const body = el('div');
  sec.append(st, body);
  const redraw = () => render(sec);
  ({ dashboard, cases, incidents, playbooks, approvals, actions, simulations, lessons }[view] || dashboard)(body, redraw, ws, R);
}

export const byName = () => users.name() || '';
export const independenceNote = () => users.active() ? null : banner('warn', 'Independence cannot be verified in single-user mode', 'Requester and approver are compared by name only. Switch on multi-user mode for signed-in identities.');
export const caseOpts = R => [['', '—'], ...R.cases.map(c => [c.id, `${c.id} · ${c.title || ''}`])];
export const incOpts = ws => [['', '—'], ...(ws.csm?.incidents || []).map(i => [i.id, `${i.id} · ${i.title || ''}`])];
const statusPill = s => pill(tr(M.label(M.CASE_STATUS, s)), s === 'closed' ? 'good' : s === 'open' ? 'bad' : 'warn');
const sevPill = s => s ? pill(tr(M.label(M.SEVERITY, s)), s === 'critical' || s === 'high' ? 'bad' : s === 'medium' ? 'warn' : '') : '—';

/* ---------------- overview + import ---------------- */
function dashboard(body, redraw, ws, R) {
  const open = R.cases.filter(c => c.status !== 'closed');
  const inc = ws.csm?.incidents || [];
  const gaps = M.unapproved(ws);
  const pbs = R.playbooks.filter(p => p.current != null);
  const tested = pbs.filter(p => M.simulationPassed(ws, p));
  body.append(el('div', 'grid g4',
    kpi('Open cases', n0(open.length), tr('{0} not yet confirmed as incidents').replace('{0}', n0(open.filter(c => !c.incident).length)), open.length ? 'warn' : ''),
    kpi('Confirmed incidents', n0(inc.filter(i => i.confirmed).length), tr('{0} in the register').replace('{0}', n0(inc.length))),
    kpi('Approval audit signals', n0(gaps.length), 'gated executions without a valid approval', gaps.length ? 'bad' : 'good'),
    kpi('Playbooks tested', `${n0(tested.length)} / ${n0(pbs.length)}`, 'passed simulation of the current version', tested.length < pbs.length ? 'warn' : '')));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Executions without a valid approval'),
    el('p', 'note', 'Audit signals, not authorisations: the application never authorises a response action. Only a recorded human approval does.'),
    gaps.length ? table([{ key: 'id', label: 'Execution', render: r => r.x.id }, { key: 'c', label: 'Case', render: r => r.x.case || '—' },
      { key: 'a', label: 'Action', render: r => el('span', { 'data-noi18n': '' }, r.x.action || '') }, { key: 'k', label: 'Risk class', render: r => tr(M.label(M.RISK_CLASS, r.x.riskClass)) },
      { key: 'r', label: 'Reason', render: r => reasonPill(r.reason) }], gaps, { class: 'compact' }) : el('div', 'empty-state', 'No gated execution without a valid approval.')));
  const untested = pbs.filter(p => !M.simulationPassed(ws, p));
  if (untested.length) body.append(banner('warn', 'Playbooks without a passed simulation of their current version', untested.map(p => `${p.id} ${p.name} v${p.current}`).join(' · ')));
  // import
  const file = el('input', { type: 'file', accept: '.json,application/json', 'aria-label': 'SOAR import file' });
  const out = el('div');
  const showRep = rep => {
    if (!rep) return;
    if (rep.error) { out.replaceChildren(banner('bad', 'Import refused', tr(rep.error))); return; }
    const add = Object.entries(rep.added).map(([k, n]) => `${k}: ${n}`).join(', ') || '—';
    const rep2 = Object.entries(rep.replaced).map(([k, n]) => `${k}: ${n}`).join(', ') || '—';
    out.replaceChildren(banner(rep.skipped.length ? 'warn' : 'good', tr('Imported from {0}').replace('{0}', rep.file || ''),
      el('div', null, el('div', null, tr('Added: {0}').replace('{0}', add)), el('div', null, tr('Replaced: {0}').replace('{0}', rep2)),
        el('div', null, tr('Regulatory submissions created: {0}').replace('{0}', String(rep.submissions || 0))))),
      rep.skipped.length ? table([{ key: 'list', label: 'List' }, { key: 'id', label: 'ID' }, { key: 'why', label: 'Why it was skipped', render: r => el('span', { 'data-noi18n': '' }, r.why) }], rep.skipped, { class: 'compact' }) : null,
      rep.warnings.length ? el('ul', { 'data-noi18n': '' }, ...rep.warnings.map(w => el('li', null, w))) : null);
  };
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Import a SOAR file'),
    el('p', 'note', 'A local JSON file in the crg-soar-import/1 format (playbooks, cases, gates, approvals, executions, simulations), described in docs/SIEM-SOAR-IMPORT-FORMAT.md. Records are validated one by one; a record whose identifier already exists replaces it. Nothing is fetched from a network.'),
    el('div', 'btnrow', file, el('button', { class: 'btn', onclick: async () => {
      const f = file.files[0]; if (!f) { toast(tr('Choose a file first.'), 'warn'); return; }
      const text = await f.text(); let doc;
      try { doc = JSON.parse(text); } catch { ui.lastImport = { error: 'The file is not valid JSON.' }; showRep(ui.lastImport); return; }
      const rep = await M.importDoc(ws, doc); rep.file = f.name; ui.lastImport = rep;
      if (!rep.error) {
        const sum = `added ${JSON.stringify(rep.added)}; replaced ${JSON.stringify(rep.replaced)}; skipped ${rep.skipped.length}; submissions ${rep.submissions}`;
        R.imports.push({ date: new Date().toISOString(), file: f.name, sha256: await M.sha256(text), format: M.FORMAT, added: rep.added, replaced: rep.replaced, skipped: rep.skipped.length });
        LOG.data('SOAR import', f.name, sum, ws.name);
        touch();
      }
      redraw();
    } }, 'Import')), out));
  showRep(ui.lastImport);
  if (R.imports.length) body.append(card(el('h2', { style: { marginTop: 0 } }, 'Import log'),
    table([{ key: 'date', label: 'Date', render: r => r.date.slice(0, 16).replace('T', ' ') }, { key: 'file', label: 'File', render: r => el('span', { 'data-noi18n': '' }, r.file) },
      { key: 'sha256', label: 'SHA-256', render: r => el('span', 'mono small', r.sha256.slice(0, 16) + '…') }, { key: 'skipped', label: 'Skipped', num: true }], R.imports.slice().reverse(), { class: 'compact' })));
}

/* ---------------- cases ---------------- */
const CASE_FIELDS = (ws, R) => [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'opened', label: 'Opened', type: 'text', placeholder: 'YYYY-MM-DDTHH:MM' },
  { key: 'severity', label: 'Severity', type: 'select', options: [['', '—'], ...M.SEVERITY] }, { key: 'category', label: 'Incident category (if it is one)', type: 'select', options: [['', '—'], ...M.CATEGORY] },
  { key: 'assignee', label: 'Assignee', type: 'text' }, { key: 'alerts', label: 'Alerts investigated (identifiers)', type: 'list' },
  { key: 'source', label: 'Source (kind:id — alert:ALR-001, manual, report)', type: 'text', encode: v => v ? `${v.kind}${v.id ? ':' + v.id : ''}` : '', decode: s => { const i = s.indexOf(':'); return s.trim() ? (i > 0 ? { kind: s.slice(0, i).trim(), id: s.slice(i + 1).trim() } : { kind: s.trim(), id: '' }) : { kind: 'manual', id: '' }; } },
  { key: 'assets', label: 'Assets concerned', type: 'list' }, { key: 'target', label: 'Main target (host, account)', type: 'text' },
  { key: 'activityStart', label: 'Start of malicious activity (if known)', type: 'text', placeholder: 'YYYY-MM-DDTHH:MM' }, { key: 'notes', label: 'Analyst notes', type: 'area' }];
function cases(body, redraw, ws, R) {
  body.append(banner('warn', 'An alert is never an incident', 'A case investigates alerts. It becomes an incident only when a named person confirms it on a date.'));
  body.append(G.register({ title: 'Cases', rows: R.cases, prefix: 'CASE', redraw, fields: CASE_FIELDS(ws, R),
    blank: () => ({ opened: M.nowLocal(), status: 'open', severity: 'medium', alerts: [], timeline: [], source: { kind: 'manual', id: '' }, assignee: byName(), statusDates: {} }),
    validate: c => !String(c.title || '').trim() ? 'A case needs a title.' : !c.opened ? 'Record when the case was opened.' : null,
    actions: c => [el('button', { class: 'btn sm', onclick: () => { ui.selCase = c.id; history.replaceState(null, '', '#/soar/cases/' + c.id); redraw(); } }, 'Work on it')],
    columns: [{ key: 'id', label: 'ID', cls: 'mono' }, 'title', { key: 'status', label: 'Status', render: c => statusPill(c.status) }, { key: 'severity', label: 'Severity', render: c => sevPill(c.severity) },
      'assignee', { key: 'source', label: 'Source', render: c => c.source ? `${tr(c.source.kind)}${c.source.id ? ' ' + c.source.id : ''}` : '—' },
      { key: 'incident', label: 'Incident', render: c => c.incident ? pill(c.incident, 'bad') : '—' }] }));
  const c = R.cases.find(x => x.id === ui.selCase);
  if (c) body.append(caseDetail(c, redraw, ws, R));
  body.append(G.register({ title: 'Forensic artefacts', rows: R.artefacts, prefix: 'FA', redraw,
    note: 'Pointers and hashes only: the image or export stays where it is kept, under recorded custody.',
    fields: [{ key: 'case', label: 'Case', type: 'select', options: caseOpts(R) }, { key: 'incident', label: 'Incident', type: 'select', options: incOpts(ws) },
      { key: 'kind', label: 'Kind', type: 'select', options: [['disk-image', 'Disk image'], ['memory-image', 'Memory image'], ['log-export', 'Log export'], ['email', 'Email message'], ['network-capture', 'Network capture'], ['file-sample', 'File sample'], ['other', 'Other']] },
      { key: 'pointer', label: 'Where it is kept (path or reference)', type: 'text', wide: true }, { key: 'sha256', label: 'SHA-256', type: 'text', wide: true },
      { key: 'acquired', label: 'Acquired', type: 'text', placeholder: 'YYYY-MM-DDTHH:MM' }, { key: 'acquiredBy', label: 'Acquired by', type: 'text' },
      { key: 'custody', label: 'Custody (date — from → to, one per line)', type: 'list' }],
    blank: () => ({ case: ui.selCase || '', kind: 'log-export', acquired: M.nowLocal(), acquiredBy: byName(), custody: [] }),
    validate: a => !String(a.pointer || '').trim() ? 'Record where the artefact is kept.' : a.sha256 && !/^[0-9a-f]{64}$/i.test(a.sha256.trim()) ? 'The SHA-256 is 64 hexadecimal characters.' : !String(a.acquiredBy || '').trim() ? 'Name the person who acquired the artefact.' : null,
    columns: ['id', 'case', 'kind', { key: 'pointer', label: 'Pointer', render: a => el('span', { 'data-noi18n': '' }, a.pointer) }, { key: 'sha256', label: 'SHA-256', render: a => a.sha256 ? el('span', 'mono small', a.sha256.slice(0, 12) + '…') : pill('no hash', 'warn') }, 'acquiredBy'] }));
}

function caseDetail(c, redraw, ws, R) {
  const who = el('input', { type: 'text', value: byName(), 'data-noi18n': '', 'aria-label': 'Recorded by' });
  const msg = el('div');
  const fail = e => { msg.replaceChildren(banner('bad', tr(e))); };
  const nx = M.nextStatus(c.status);
  const rationale = el('input', { type: 'text', 'data-noi18n': '', placeholder: tr('Closure rationale'), value: c.closure || '' });
  const note = el('input', { type: 'text', 'data-noi18n': '', placeholder: tr('What happened, what was found') });
  const step = to => { const e = M.advance(c, to, { by: who.value.trim(), rationale: rationale.value.trim() }); if (e) return fail(e); LOG.data('case status', c.id, `${to} by ${who.value.trim()}`, ws.name); touch(); redraw(); };
  const d = card(el('h2', { style: { marginTop: 0 } }, el('span', { 'data-noi18n': '' }, `${c.id} · ${c.title || ''}`), ' ', statusPill(c.status)),
    el('div', 'small muted', tr('Opened {0}').replace('{0}', String(c.opened || '').replace('T', ' ')), ' · ', tr('Assignee: {0}').replace('{0}', c.assignee || '—'),
      ' · ', tr('Alerts: {0}').replace('{0}', (c.alerts || []).join(', ') || '—')),
    el('div', 'grid g2', field(tr('Recorded by (person)'), who), field(tr('Closure rationale (to close)'), rationale)),
    el('div', 'btnrow', nx && c.status !== 'closed' ? el('button', { class: 'btn', 'data-act': 'advance', onclick: () => step(nx) }, tr('Move to {0}').replace('{0}', tr(M.label(M.CASE_STATUS, nx)))) : null,
      c.status !== 'closed' && nx !== 'closed' ? el('button', { class: 'btn ghost', 'data-act': 'close', onclick: () => step('closed') }, 'Close the case') : null),
    el('div', 'btnrow', note, el('button', { class: 'btn ghost', onclick: () => { if (!note.value.trim()) return; if (!who.value.trim()) return fail('Name the person who records the change.'); c.timeline.push({ at: M.nowLocal(), by: who.value.trim(), text: note.value.trim() }); touch(); redraw(); } }, 'Add to the timeline')),
    msg);
  // incident confirmation
  if (c.incident) {
    const inc = (ws.csm?.incidents || []).find(i => i.id === c.incident);
    d.append(banner('bad', tr('Incident {0}').replace('{0}', c.incident), inc ? tr('Confirmed on {0} by {1}. Notification deadlines are computed in Compliance management from this date.').replace('{0}', inc.confirmed || '—').replace('{1}', inc.confirmedBy || '—') : ''));
  } else {
    const by = el('input', { type: 'text', 'data-noi18n': '', 'aria-label': 'Confirmed by', value: '' });
    const date = el('input', { type: 'date', 'aria-label': 'Confirmed on', value: today() });
    const pi = el('input', { type: 'checkbox', style: { width: 'auto' } });
    const link = select(incOpts(ws).map(([v, t]) => [v, v ? t : tr('Create a new incident')]), '');
    const cat = select([['', '—'], ...M.CATEGORY.map(([v, t]) => [v, tr(t)])], c.category || '');
    d.append(el('h3', null, 'Confirm as incident'),
      el('p', 'note', 'An incident confirmation is made by a named person on a date. The incident is created in (or linked to) the incident register; its confirmed date, personal information and reportability are what Compliance uses for deadlines.'),
      el('div', 'grid g2', field(tr('Confirmed by (person)'), by), field(tr('Confirmed on'), date), field(tr('Category'), cat), field(tr('Existing incident to link'), link),
        field(tr('Personal information involved'), pi)),
      el('div', 'btnrow', el('button', { class: 'btn danger', 'data-act': 'confirm', onclick: () => {
        const r = M.confirmIncident(ws, c, { by: by.value.trim(), date: date.value, personalInfo: pi.checked, incident: link.value, category: cat.value });
        if (r.error) return fail(r.error);
        LOG.data('incident confirmed', r.incident.id, `case ${c.id} by ${by.value.trim()} on ${date.value}`, ws.name);
        touch(); toast(tr('Incident {0} confirmed').replace('{0}', r.incident.id)); redraw();
      } }, 'Confirm as incident')));
  }
  d.append(el('h3', null, 'Timeline'), c.timeline.length ? table([{ key: 'at', label: 'When', render: e => String(e.at || '').replace('T', ' ') }, { key: 'by', label: 'Who', render: e => el('span', { 'data-noi18n': '' }, e.by || '') },
    { key: 'text', label: 'What', render: e => el('span', { 'data-noi18n': '' }, e.text || '') }], c.timeline, { class: 'compact' }) : el('div', 'empty-state', 'Nothing recorded yet.'));
  const xs = R.executions.filter(x => x.case === c.id);
  if (xs.length) d.append(el('h3', null, 'Actions recorded on this case'), table([{ key: 'id', label: 'ID' }, { key: 'action', label: 'Action', render: x => el('span', { 'data-noi18n': '' }, x.action) },
    { key: 'performedBy', label: 'By', render: x => el('span', { 'data-noi18n': '' }, x.performedBy) }, { key: 'started', label: 'Started' }, { key: 'ap', label: 'Approval check', render: x => reasonPill(M.approvalReason(ws, x), M.isGated(ws, x)) }], xs, { class: 'compact' }));
  return d;
}

/* ---------------- incidents ---------------- */
function incidents(body, redraw, ws, R) {
  ws.csm ||= { bodies: [], roles: [], delegations: [], decisions: [], incidents: [] };
  const C = ws.csm;
  const sync = () => { const n = M.syncSubmissions(ws); if (n) { LOG.data('regulatory submission created', 'SOAR communication', `${n}`, ws.name); toast(tr('{0} regulatory submission(s) created in Compliance management').replace('{0}', n)); } touch(); redraw(); };
  body.append(banner('warn', 'The incident register is shared', 'These are the incident records of Cybersecurity management → Incidents. Confirmation needs a person and a date; Compliance computes notification deadlines from the confirmed date. Breach reportability is an assessment for qualified people, not legal advice.'));
  body.append(G.register({ title: 'Incident register', rows: C.incidents, prefix: 'INC', redraw,
    fields: [...incidentFields(ws), { key: 'case', label: 'SOAR case', type: 'select', options: caseOpts(R) }, { key: 'category', label: 'Incident category', type: 'select', options: [['', '—'], ...M.CATEGORY] }],
    blank: incidentBlank, validate: incidentValidate,
    columns: ['id', 'title', { key: 'status', label: 'Status', render: r => pill(tr(INC_STATUS.find(x => x[0] === r.status)?.[1] || r.status), r.status === 'confirmed' ? 'bad' : r.status === 'closed' ? 'good' : 'warn') },
      { key: 'confirmed', label: 'Confirmed on', render: r => r.confirmed || '—' }, { key: 'confirmedBy', label: 'Confirmed by', render: r => el('span', { 'data-noi18n': '' }, r.confirmedBy || '—') },
      { key: 'severity', label: 'Severity', render: r => sevPill(r.severity) }, { key: 'personalInfo', label: 'Personal information', render: r => r.personalInfo ? pill('yes', 'warn') : '' },
      { key: 'loi25', label: 'Loi 25', render: r => tr(REPORT.find(x => x[0] === r.loi25)?.[1] || '—') }, { key: 'case', label: 'Case', render: r => r.case || '—' }] }));
  const io = incOpts(ws);
  body.append(G.register({ title: 'Incident impacts', rows: R.impacts, prefix: 'IMP', redraw,
    fields: [{ key: 'incident', label: 'Incident', type: 'select', options: io }, { key: 'dimension', label: 'Impact dimension', type: 'select', options: M.DIMENSION },
      { key: 'description', label: 'Description (e.g. hours of service lost, records exposed)', type: 'area' }, { key: 'estimated', label: 'Estimated (not observed)', type: 'check' }],
    blank: () => ({ dimension: 'operational', estimated: true }), validate: m => !m.incident ? 'Choose the incident.' : null,
    columns: ['id', 'incident', 'dimension', { key: 'description', label: 'Description', render: m => el('span', { 'data-noi18n': '' }, m.description || '') }, { key: 'estimated', label: 'Estimate', render: m => m.estimated ? pill('estimate', 'warn') : pill('observed', 'good') }] }));
  body.append(G.register({ title: 'Communications', rows: R.communications, prefix: 'COM', redraw: sync,
    note: 'A notice to a regulator is also a regulatory submission: saving it creates the submission in Compliance management (once).',
    fields: [{ key: 'incident', label: 'Incident', type: 'select', options: io }, { key: 'audience', label: 'Audience', type: 'select', options: M.AUDIENCE },
      { key: 'authority', label: 'Authority (for a regulator)', type: 'text' }, { key: 'subject', label: 'Subject', type: 'text', wide: true },
      { key: 'sentAt', label: 'Sent', type: 'text', placeholder: 'YYYY-MM-DDTHH:MM' }, { key: 'sentBy', label: 'Sent by', type: 'text' },
      { key: 'due', label: 'Due (for a regulator)', type: 'date' }, { key: 'receipt', label: 'Receipt or reference', type: 'text' }, { key: 'summary', label: 'Summary', type: 'area' }],
    blank: () => ({ audience: 'internal', sentAt: M.nowLocal(), sentBy: byName() }), validate: M.communicationError,
    columns: ['id', 'incident', 'audience', { key: 'authority', label: 'Authority', render: m => el('span', { 'data-noi18n': '' }, m.authority || '—') }, 'sentAt',
      { key: 'submission', label: 'Submission', render: m => m.submission ? pill(m.submission, 'good') : '—' }] }));
  body.append(G.register({ title: 'Recovery verifications', rows: R.recoveries, prefix: 'REC', redraw,
    fields: [{ key: 'incident', label: 'Incident', type: 'select', options: io }, { key: 'asset', label: 'Asset or business process checked', type: 'text', wide: true },
      { key: 'date', label: 'Date', type: 'date' }, { key: 'verifiedBy', label: 'Verified by', type: 'text' }, { key: 'result', label: 'Result', type: 'select', options: M.RECOVERY },
      { key: 'evidence', label: 'Evidence (references)', type: 'list' }],
    blank: () => ({ date: today(), verifiedBy: byName(), result: 'restored', evidence: [] }),
    validate: m => !m.incident ? 'Choose the incident.' : !String(m.asset || '').trim() ? 'Name the asset or process checked.' : !String(m.verifiedBy || '').trim() ? 'Name the person who verified the recovery.' : null,
    columns: ['id', 'incident', 'asset', 'date', 'verifiedBy', 'result'] }));
  const pick = select(io, '');
  body.append(G.register({ title: 'Response measurements', rows: R.measurements, prefix: 'MSR', redraw,
    note: 'Hours, with the method used. "Propose" computes them from the dates recorded on the incident and its case; check them before keeping them.',
    fields: [{ key: 'incident', label: 'Incident', type: 'select', options: io }, { key: 'metric', label: 'Metric', type: 'select', options: M.METRIC },
      { key: 'hours', label: 'Value (hours)', type: 'number' }, { key: 'method', label: 'Method (start and end events)', type: 'area' }],
    blank: () => ({ metric: 'time-to-contain' }), validate: m => !m.incident ? 'Choose the incident.' : (m.hours == null || m.hours < 0) ? 'The value is a number of hours, zero or more.' : null,
    columns: ['id', 'incident', 'metric', { key: 'hours', label: 'Hours', num: true, render: m => String(m.hours ?? '—') }, { key: 'method', label: 'Method', render: m => el('span', { 'data-noi18n': '' }, m.method || '') }] }),
    el('div', 'btnrow', pick, el('button', { class: 'btn ghost', onclick: () => {
      const inc = C.incidents.find(i => i.id === pick.value); if (!inc) return toast(tr('Choose the incident.'), 'warn');
      const ps = M.proposeMeasures(ws, inc);
      for (const p of ps) R.measurements.push({ id: M.nextId(R.measurements, 'MSR'), incident: inc.id, ...p, proposed: true });
      touch(); toast(tr('{0} measurement(s) proposed').replace('{0}', ps.length)); redraw();
    } }, 'Propose from the recorded dates')));
}
