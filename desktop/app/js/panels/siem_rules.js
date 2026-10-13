/* SIEM — detection rules, tests and strategies; coverage matrix and detection gaps (Beta 1.6.x).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, kpi, n0, today, toast } from '../util.js';
import { touch } from '../state.js';
import * as G from '../grcui.js';
import * as M from '../siem.js';
import * as SH from '../shared.js';
import * as LOG from '../logs.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';
import { asOfBar, healthPill, statusPill, coveragePill, data, lsField } from './siem.js';

const scenOpts = ws => (ws.assessment?.SCEN || []).map(s => [s.id, `${s.id} · ${s.name || ''}`]);
const scenName = (ws, id) => { const s = (ws.assessment?.SCEN || []).find(x => x.id === id); return s ? `${s.id} · ${s.name || ''}` : id || '—'; };
const singleUser = () => !users.active();

/* ---------------- rules ---------------- */
const RULE_FIELDS = (ws, R) => [{ key: 'title', label: 'Title', type: 'text', wide: true },
  { key: 'version', label: 'Version', type: 'text' }, { key: 'language', label: 'Rule language', type: 'select', options: M.LANGS },
  { key: 'ruleId', label: 'Rule identifier (Sigma id or SIEM id)', type: 'text' }, { key: 'status', label: 'Lifecycle status', type: 'select', options: M.RULE_STATUS },
  { key: 'level', label: 'Level', type: 'select', options: [['', '—'], ...M.LEVELS] }, { key: 'owner', label: 'Owner (detection engineer)', type: 'text' },
  { key: 'approvedBy', label: 'Deployment approved by (not the owner)', type: 'text' }, { key: 'approvedOn', label: 'Approved on', type: 'date' },
  { key: 'description', label: 'Description', type: 'area' },
  { key: 'techniques', label: 'ATT&CK techniques (e.g. T1078, one per line)', type: 'list' },
  { key: 'scenarios', label: 'Risk scenarios covered', type: 'multi', options: scenOpts(ws) },
  { key: 'requiredSources', label: 'Required telemetry sources', type: 'multi', options: R.sources.map(s => [s.id, `${s.id} · ${s.name}`]) },
  { key: 'strategy', label: 'Detection strategy', type: 'select', options: [['', '—'], ...R.strategies.map(s => [s.id, `${s.id} · ${s.name}${s.reference ? ' (' + s.reference + ')' : ''}`])] },
  lsField(), { key: 'detection', label: 'Detection logic (kept as text)', type: 'area', rows: 8 }];

export function openRule(rule, c, isNew = false) {
  const ws = c.ws, R = M.reg(ws);
  const work = JSON.parse(JSON.stringify(rule));
  G.edit('Detection rule', RULE_FIELDS(ws, R), work, {
    note: singleUser() ? 'Independence cannot be verified in single-user mode: the approver\'s name is only checked against the owner\'s.' : null,
    validate: n => {
      if (!String(n.title || '').trim()) return 'A rule needs a title.';
      const bad = (n.techniques || []).filter(t => !/^T\d{4}(\.\d{3})?$/i.test(t));
      if (bad.length) return 'Techniques are ATT&CK identifiers such as T1078 or T1078.004.';
      if (!isNew && R.rules.some(r => r !== rule && r.id === n.id)) return 'Another rule has this identifier.';
      return M.transitionError(isNew ? { status: 'draft' } : rule, n, ws) || (isNew && n.status === 'production' ? 'A draft rule cannot be deployed: move it to testing and test it first.' : null);
    },
    onSave: n => {
      n.techniques = (n.techniques || []).map(t => t.toUpperCase());
      const to = n.status; n.status = rule.status || 'draft';
      const versionChanged = !isNew && String(n.version) !== String(rule.version);
      if (versionChanged) (n.versions ||= []).push({ version: rule.version, status: rule.status, detection: rule.detection, title: rule.title, until: today() });
      Object.assign(rule, n, { updated: today() });
      if (isNew) { rule.created ||= today(); R.rules.push(rule); LOG.data('detection rule created', rule.id, rule.title, ws.name); }
      if (to !== rule.status) {
        M.setStatus(rule, to, users.name() || '', today(), ws);
        if (to === 'production') { rule.approvedOn ||= today(); LOG.data('detection rule approved for production', rule.id, `v${rule.version} · ${rule.approvedBy}`, ws.name); }
      }
      if (rule.requiredAuto) rule.requiredAuto = false;
      touch(); c.redraw();
    },
    onDelete: isNew ? null : () => { R.rules.splice(R.rules.indexOf(rule), 1); LOG.data('detection rule deleted', rule.id, rule.title, ws.name); touch(); c.redraw(); },
  });
}

export function rulesTab(body, c) {
  const ws = c.ws, R = M.reg(ws);
  body.append(asOfBar(c, 'Status, telemetry health and tests are read at this date.'));
  body.append(banner('warn', 'Rule lifecycle', 'Draft → testing → production → disabled or retired. A rule reaches production only from testing, after an effective detection test of its version, with the name of an approver who is not its owner. Imported states are taken as the SIEM reports them.'));
  if (singleUser()) body.append(banner('warn', 'Single-user mode', 'Independence cannot be verified in single-user mode: approver and owner are compared by name only.'));
  // Sigma import
  const file = el('input', { type: 'file', id: 'siem-sigma-file', multiple: true, accept: '.yml,.yaml,.txt' });
  const paste = el('textarea', { rows: 5, id: 'siem-sigma-text', 'data-noi18n': '', placeholder: tr('Paste one or more Sigma rules (YAML, separated by ---)') });
  const run = async (text, name) => { const rec = await M.importText(text, { fileName: name, kind: 'sigma', ws, by: users.name() || '' }); toast(tr('{0} rule(s) added, {1} updated, {2} duplicate(s)').replace('{0}', rec.counts.rules || 0).replace('{1}', rec.counts.updated || 0).replace('{2}', rec.counts.duplicates || 0), rec.errors.length ? 'warn' : 'good'); };
  file.addEventListener('change', async () => { for (const f of file.files) await run(await f.text(), f.name); c.redraw(); });
  body.append(card(el('h2', null, 'Import Sigma rules'),
    el('p', 'note', 'Kept: title, id, status, level, description, log source (product, service, category), attack.t1078-style tags as techniques, author, references, false positives, and the detection block as text. A Sigma status (experimental, test, stable) never puts a rule in production: imported rules start in draft or testing.'),
    el('div', 'grid g2', el('div', null, el('label', { for: 'siem-sigma-file' }, tr('Sigma files (.yml)')), file), paste),
    el('div', 'btnrow', el('button', { class: 'btn', id: 'siem-sigma-import', onclick: async () => { if (paste.value.trim()) { await run(paste.value, 'pasted Sigma'); c.redraw(); } } }, 'Import pasted Sigma'))));
  // rule register
  const rows = R.rules.slice();
  const cols = [{ key: 'id', label: 'Id', render: r => data(r.id, 'mono') }, { key: 'title', label: 'Title', render: r => data(r.title) }, { key: 'version', label: 'Version', render: r => data('v' + (r.version || '1'), 'mono') },
    { key: 'status', label: 'Status at as-of date', render: r => statusPill(M.statusAt(r, c.asOf)), sort: r => M.statusAt(r, c.asOf) },
    { key: 'level', label: 'Level', render: r => r.level ? tr(M.LEVELS.find(l => l[0] === r.level)?.[1] || r.level) : '—' },
    { key: 'techniques', label: 'Techniques', render: r => data((r.techniques || []).join(', ') || '—', 'mono') },
    { key: 'scenarios', label: 'Scenarios', render: r => data((r.scenarios || []).join(', ') || '—') },
    { key: 'tel', label: 'Required telemetry', sortable: false, render: r => { const t = M.requiredHealth(r, ws, c.asOf); return t.length ? el('div', 'chips', ...t.map(x => el('span', null, el('span', { 'data-noi18n': '', title: x.src?.name || x.id }, x.id + ' '), x.src ? null : el('span', 'small muted', tr('not registered') + ' '), healthPill(x))), r.requiredAuto ? el('span', 'small muted', tr('proposed from the log source')) : null) : pill(tr('none declared'), 'warn'); } },
    { key: 'test', label: 'Latest test', render: r => { const t = M.latestTest(r, ws, c.asOf); return t ? el('span', null, pill(tr(t.result === 'effective' ? 'Effective' : 'Ineffective'), t.result === 'effective' ? 'good' : 'bad'), data(` ${t.date} · ${t.tester || '—'}`)) : pill(tr('not tested'), 'warn'); } },
    { key: '_', label: '', sortable: false, render: r => el('button', { class: 'btn sm ghost', onclick: () => openRule(r, c) }, 'Open') }];
  body.append(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, `${tr('Detection rules')} (${rows.length})`),
    el('button', { class: 'btn sm', id: 'siem-rule-add', onclick: () => openRule({ id: G.nextId(R.rules, 'DR'), version: '1', language: 'sigma', status: 'draft', techniques: [], scenarios: [], requiredSources: [], history: [], logsource: { product: '', service: '', category: '' }, owner: users.name() || '', created: today() }, c, true) }, 'Add')),
    rows.length ? el('div', 'tablewrap', table(cols, rows, { class: 'compact' })) : el('div', 'empty-state', tr('No rule yet: import Sigma rules or add one.'))));
  // detection tests
  body.append(G.register({ title: 'Detection tests', rows: R.tests, prefix: 'DT', redraw: c.redraw, csv: true,
    note: 'Coverage counts as validated only with an effective detection test of the rule (of its current version), dated on or before the as-of date. A test of a rule is not the effectiveness of the whole control.',
    fields: [{ key: 'ruleId', label: 'Rule tested', type: 'select', options: [['', '—'], ...R.rules.map(r => [r.id, `${r.id} v${r.version || 1} · ${r.title}`])] },
      { key: 'ruleVersion', label: 'Rule version tested', type: 'text' }, { key: 'date', label: 'Date', type: 'date' }, { key: 'tester', label: 'Tester', type: 'text' },
      { key: 'result', label: 'Result', type: 'select', options: [['', '—'], ...M.TEST_RESULTS] }, { key: 'method', label: 'Method', type: 'select', options: M.TEST_METHODS },
      { key: 'fixture', label: 'Fixture or test case', type: 'text' }, { key: 'evidence', label: 'Evidence (shared register id)', type: 'select', options: [['', '—'], ...SH.evidence(ws).map(e => [e.id, `${e.id} · ${e.title || ''}`])] },
      { key: 'notes', label: 'Notes', type: 'area' }],
    blank: () => ({ date: today(), tester: users.name() || '', result: '', method: 'replay' }),
    validate: r => { if (!r.ruleId) return 'Choose the rule tested.'; if (!r.date) return 'A test needs its date.'; if (!String(r.tester || '').trim()) return 'A test needs the name of the tester.'; if (!r.result) return 'Record the result: effective or ineffective.';
      const rule = R.rules.find(x => x.id === r.ruleId); if (rule && !r.ruleVersion) r.ruleVersion = String(rule.version || ''); return null; },
    columns: ['id', { key: 'ruleId', label: 'Rule', render: r => data(`${r.ruleId} v${r.ruleVersion || '?'}`, 'mono') }, { key: 'date', label: 'Date', render: r => data(r.date, 'mono') }, { key: 'tester', label: 'Tester', render: r => data(r.tester) },
      { key: 'result', label: 'Result', render: r => pill(tr(r.result === 'effective' ? 'Effective' : 'Ineffective'), r.result === 'effective' ? 'good' : 'bad') }, 'method'] }));
  // detection strategies
  body.append(G.register({ title: 'Detection strategies', rows: R.strategies, prefix: 'DS', redraw: c.redraw, csv: true,
    note: 'How the organization adapts an ATT&CK detection strategy (e.g. DET0560): the analytics (e.g. AN0001) and data components (e.g. DC0002) it relies on.',
    fields: [{ key: 'name', label: 'Name', type: 'text', wide: true }, { key: 'reference', label: 'ATT&CK detection strategy adapted (e.g. DET0560)', type: 'text' },
      { key: 'analytics', label: 'Analytics (e.g. AN0001)', type: 'list' }, { key: 'dataComponents', label: 'Data components (e.g. DC0002)', type: 'list' }, { key: 'techniques', label: 'Techniques (e.g. T1078)', type: 'list' }],
    validate: r => (r.reference && !/^DET\d{4}$/i.test(r.reference)) ? 'The reference is an ATT&CK detection strategy such as DET0560.' : (r.analytics || []).some(a => !/^AN\d{4}$/i.test(a)) ? 'Analytics are ATT&CK identifiers such as AN0001.' : (r.dataComponents || []).some(a => !/^DC\d{4}$/i.test(a)) ? 'Data components are ATT&CK identifiers such as DC0002.' : null,
    columns: ['id', { key: 'name', label: 'Name', render: r => data(r.name) }, { key: 'reference', label: 'Reference', render: r => data(r.reference || '—', 'mono') },
      { key: 'rules', label: 'Rules', render: r => data(R.rules.filter(x => x.strategy === r.id).map(x => x.id).join(', ') || '—') }] }));
}

/* ---------------- coverage & gaps ---------------- */
export function coverageTab(body, c) {
  const ws = c.ws, R = M.reg(ws);
  body.append(asOfBar(c, 'Only tests, health observations and status changes on or before this date count.'));
  const rows = M.coverageMatrix(ws, c.asOf), cnt = M.coverageCounts(rows);
  body.append(el('div', 'grid g4', ...M.COVERAGE.map(([k, t]) => kpi(t, n0(cnt[k]), '', k === 'validated' ? (cnt[k] ? 'good' : '') : cnt[k] ? (k === 'untested' ? 'warn' : 'bad') : ''))));
  body.append(banner('warn', 'Validated means tested', 'A pair is validated only when a rule in production was found effective by a detection test on or before the as-of date, and its required telemetry is not silent or degraded. A rule whose required telemetry is silent does not detect.'));
  const cols = [
    { key: 'scenario', label: 'Scenario', render: r => data(r.scenario ? scenName(ws, r.scenario) : '—') },
    { key: 'technique', label: 'Technique', render: r => data(r.technique || '—', 'mono') },
    { key: 'rules', label: 'Rules', sortable: false, render: r => r.rules.length ? el('div', null, ...r.rules.map(x => el('div', 'small', data(`${x.rule.id} v${x.rule.version || 1} `), statusPill(M.statusAt(x.rule, c.asOf)), ' ', coveragePill(x.status)))) : el('span', 'muted', '—') },
    { key: 'test', label: 'Latest test', sortable: false, render: r => { const ts = r.rules.map(x => x.test).filter(Boolean).sort((a, b) => (a.date < b.date ? 1 : -1)); const t = ts[0];
      return t ? el('span', null, pill(tr(t.result === 'effective' ? 'Effective' : 'Ineffective'), t.result === 'effective' ? 'good' : 'bad'), data(` ${t.date} · ${t.tester || '—'}`)) : pill(tr('not tested'), 'warn'); } },
    { key: 'tel', label: 'Telemetry', sortable: false, render: r => { const t = r.rules.flatMap(x => x.telemetry || []); const seen = new Set(); return t.length ? el('div', 'chips', ...t.filter(x => !seen.has(x.id) && seen.add(x.id)).map(x => el('span', null, data(x.id + ' '), healthPill(x)))) : '—'; } },
    { key: 'status', label: 'Coverage', render: r => el('div', null, coveragePill(r.status), r.status !== 'validated' ? el('div', 'small muted', ...(r.rules.length ? [...new Set(r.rules.flatMap(x => x.why))] : ['no rule']).map(w => el('div', null, w))) : null), sort: r => ['missing', 'degraded', 'untested', 'validated'].indexOf(r.status) },
    { key: 'gap', label: 'Gap', sortable: false, render: r => r.gap ? data(r.gap.id, 'mono') : r.status === 'validated' ? '' : el('button', { class: 'btn sm ghost', onclick: () => {
      const g = { id: G.nextId(R.gaps, 'GAP'), title: `${r.status === 'missing' ? 'No detection' : 'Degraded or untested detection'}: ${r.technique || ''} ${r.scenario ? '· ' + r.scenario : ''}`.trim(), scenario: r.scenario, technique: r.technique,
        source: r.rules.flatMap(x => (x.telemetry || []).filter(t => t.state === 'silent' || t.state === 'degraded').map(t => t.id))[0] || '', description: r.rules.flatMap(x => x.why).join('; '), owner: '', status: 'open', raised: today(), actions: [] };
      R.gaps.push(g); LOG.data('detection gap recorded', g.id, g.title, ws.name); touch(); toast(tr('Gap {0} recorded').replace('{0}', g.id)); c.redraw(); } }, 'Record gap') }];
  body.append(card(el('h2', null, 'Coverage matrix'), el('p', 'note', 'Pairs come from the ATT&CK techniques of the risk scenarios, the scenarios and techniques of the rules, and recorded coverage assertions.'),
    rows.length ? el('div', 'tablewrap', table(cols, rows, { class: 'compact', rowClass: r => 'cov-' + r.status })) : el('div', 'empty-state', tr('No scenario technique and no rule yet.'))));
  // gaps register
  const acts = SH.actions(ws);
  body.append(G.register({ title: 'Detection gaps', rows: R.gaps, prefix: 'GAP', redraw: c.redraw, csv: true,
    note: 'A detection gap is a control gap: link it to a corrective action in the shared register, where its closure is verified by someone other than its owner.',
    fields: [{ key: 'title', label: 'Gap', type: 'text', wide: true }, { key: 'scenario', label: 'Scenario', type: 'select', options: [['', '—'], ...scenOpts(ws)] },
      { key: 'technique', label: 'Technique (e.g. T1078)', type: 'text' }, { key: 'source', label: 'Missing or silent telemetry', type: 'select', options: [['', '—'], ...R.sources.map(s => [s.id, `${s.id} · ${s.name}`])] },
      { key: 'description', label: 'Description', type: 'area' }, { key: 'owner', label: 'Owner', type: 'text' }, { key: 'status', label: 'Status', type: 'select', options: M.GAP_STATES },
      { key: 'raised', label: 'Raised on', type: 'date' }, { key: 'actions', label: 'Corrective actions (shared register ids)', type: 'list' }],
    blank: () => ({ status: 'open', raised: today(), actions: [] }),
    validate: r => !String(r.title || '').trim() ? 'A gap needs a title.' : (r.technique && !/^T\d{4}(\.\d{3})?$/i.test(r.technique)) ? 'Techniques are ATT&CK identifiers such as T1078 or T1078.004.' : null,
    columns: ['id', { key: 'title', label: 'Gap', render: r => data(r.title) }, { key: 'scenario', label: 'Scenario', render: r => data(r.scenario || '—') }, { key: 'technique', label: 'Technique', render: r => data(r.technique || '—', 'mono') },
      { key: 'status', label: 'Status', render: r => pill(tr(M.GAP_STATES.find(s => s[0] === r.status)?.[1] || r.status), r.status === 'open' ? 'warn' : r.status === 'closed' ? 'good' : '') },
      { key: 'actions', label: 'Corrective actions', render: r => (r.actions || []).length ? el('div', null, ...(r.actions || []).map(id => { const a = acts.find(x => x.id === id); return el('div', 'small', data(id + ' '), a ? pill(tr(SH.ACTION_STATES.find(s => s[0] === a.state)?.[1] || a.state), a.state === 'verified' ? 'good' : SH.actionOverdue(a) ? 'bad' : '') : pill(tr('not found'), 'bad')); })) : '—' }],
    actions: r => [el('button', { class: 'btn sm ghost', onclick: () => {
      const a = { id: G.nextId(acts, 'ACT'), title: `Close detection gap ${r.id}: ${r.title}`, description: r.description || '', source: { kind: 'gap', id: r.id }, owner: r.owner || '', state: 'open', opened: today(),
        links: [r.scenario ? { kind: 'scenario', id: r.scenario } : null, { kind: 'gap', id: r.id }].filter(Boolean) };
      acts.push(a); (r.actions ||= []).push(a.id); LOG.data('corrective action raised from a detection gap', a.id, r.id, ws.name); touch(); toast(tr('Corrective action {0} created in the shared register').replace('{0}', a.id)); c.redraw();
    } }, 'Corrective action')] }));
}
