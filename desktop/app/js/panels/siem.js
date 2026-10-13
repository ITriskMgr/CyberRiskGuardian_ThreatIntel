/* SIEM — security monitoring, local only (Beta 1.6.x).

   Overview          health of telemetry, rule lifecycle, coverage, alert queue and indicators at an as-of date.
   Telemetry sources sources and their health (healthy, degraded, silent), OCSF 1.9.0 event class, ATT&CK
                     data components; event records are pointers to the SIEM, never payloads.
   Detection rules   rules (Sigma import), versions, lifecycle, required telemetry, detection tests, strategies.
   Coverage & gaps   scenario / technique → rules → latest test; validated only by an effective test on or
                     before the as-of date; detection gaps linked to shared corrective actions.
   Alerts & triage   alerts weighted by crown jewels; escalation creates a SOAR case. An alert is never an incident.
   Indicators & TLP  threat indicators with source confidence (0–100, never a probability) and TLP 2.0.
   Import            one place for every file: envelope crg-siem-import/1, Sigma, STIX 2.1, CSV.
   No connector, no network call: the external SIEM stays the system of record for events.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, kpi, n0, today, toast, modal, field, select } from '../util.js';
import { S, touch } from '../state.js';
import * as G from '../grcui.js';
import * as M from '../siem.js';
import * as LOG from '../logs.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';
import { rulesTab, coverageTab } from './siem_rules.js';
import { alertsTab, intelTab, tlpPill } from './siem_alerts.js';

export const HELP = {
  '': { d: 'Security monitoring from local files: telemetry health, detection rules, coverage of the risk scenarios, alerts and threat indicators.', g: 'siem',
    h: ['Nothing here connects to a live product: telemetry lists, rules, alerts and indicators are imported from files exported by your SIEM, and the SIEM stays the system of record for events.', 'An alert is never an incident, and coverage counts as validated only with an effective detection test. Nothing here changes a risk score.'] },
  dashboard: { d: 'Telemetry health, rule lifecycle, coverage, the alert queue and indicators at an as-of date.', g: 'siem-dashboard',
    h: ['Change the as-of date to see the state recorded on that day: later tests, health observations and status changes are ignored.'] },
  sources: { d: 'Telemetry sources, their health (healthy, degraded, silent) and the event records that point to the SIEM.', g: 'siem-sources',
    h: ['A source is silent when its latest health observation says so, or when its last event is older than three expected cadences. A rule whose required telemetry is silent does not detect.', 'Event records are pointers (reference, time, hash, link) — the event itself stays in the SIEM.'] },
  rules: { d: 'Detection rules with version, lifecycle status, ATT&CK techniques, scenarios, required telemetry and detection tests.', g: 'siem-rules',
    h: ['Import Sigma rules (YAML): title, id, status, level, description, log source, attack.t1078-style tags and the detection block are kept. A Sigma status never puts a rule in production.', 'A rule goes to production only from testing, after an effective detection test of its version, with the name of an approver who is not its owner.'] },
  coverage: { d: 'Which scenarios and ATT&CK techniques are detected, by which rules, validated by which test — and the detection gaps.', g: 'siem-coverage',
    h: ['Validated only with an effective detection test of the rule on or before the as-of date. Silent or degraded required telemetry makes the coverage degraded; a rule in draft, disabled or retired gives none.', 'Record a gap for what is missing or degraded, and link it to a corrective action in the shared register.'] },
  alerts: { d: 'Alerts imported from the SIEM or from STIX sightings, triaged with crown jewels first.', g: 'siem-alerts',
    h: ['An alert is never an incident: escalation opens a SOAR case, and only an incident confirmation by a named person makes an incident.', 'Alerts touching a crown jewel come first, then severity weighted by the criticality of the asset.'] },
  intel: { d: 'Threat indicators with their source, validity, source confidence and TLP marking, beside the threat-feed watch list.', g: 'siem-intel',
    h: ['Source confidence (0–100) is what the producer states: it is not a probability and never feeds Pb(A) or Pb(ψ,A). An indicator match is not an attribution.', 'Exports ask what to do with TLP:RED and TLP:AMBER+STRICT items: leave them out, or keep them marked.'] },
  import: { d: 'Import telemetry source lists, Sigma rules, alerts and indicators from local files; every import is recorded with its SHA-256.', g: 'siem-import',
    h: ['Accepted: the crg-siem-import/1 envelope (JSON), Sigma (YAML), STIX 2.1 bundles, alert lists (JSON or CSV), telemetry sources and indicators (CSV). The format is described in docs/SIEM-SOAR-IMPORT-FORMAT.md.', 'Imports add records and never overwrite an original alert; a duplicate is counted and skipped.'] },
};

const TABS = [['dashboard', 'Overview'], ['sources', 'Telemetry sources'], ['rules', 'Detection rules'], ['coverage', 'Coverage & gaps'], ['alerts', 'Alerts & triage'], ['intel', 'Indicators & TLP'], ['import', 'Import']];
let view = 'dashboard';
const ctx = { asOf: today() };
export const setAsOf = d => { ctx.asOf = d || today(); };

export function render(sec, arg) {
  const [v] = String(arg || '').split('/');
  if (TABS.some(t => t[0] === v)) view = v;
  const ws = S.ws; M.reg(ws);
  sec.replaceChildren(el('h1', null, 'SIEM'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of TABS)
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; history.replaceState(null, '', '#/siem/' + k); render(sec, k); } }, t));
  const body = el('div', { id: 'siem-body' });
  sec.append(st, body);
  const redraw = () => render(sec, view);
  const c = { ...ctx, redraw, ws, setAsOf: d => { setAsOf(d); redraw(); } };
  ({ dashboard, sources, rules: rulesTab, coverage: coverageTab, alerts: alertsTab, intel: intelTab, import: importTab }[view])(body, c);
}

/** The as-of date control shared by the tabs that depend on it. */
export function asOfBar(c, note = 'States recorded after this date are ignored.') {
  const d = el('input', { type: 'date', value: c.asOf, id: 'siem-asof', style: { width: 'auto' } });
  d.addEventListener('change', () => c.setAsOf(d.value));
  return el('div', 'row', { style: { alignItems: 'center', gap: '8px', margin: '6px 0 12px' } }, el('label', { for: 'siem-asof' }, el('b', null, 'As of')), d,
    c.asOf !== today() ? el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => c.setAsOf(today()) }, 'Today') : null, el('span', 'small muted', note));
}
export const noIncident = () => banner('warn', 'An alert is never an incident', 'Alerts and indicator matches are signals to triage. Escalation opens a SOAR case; only an incident confirmation, by a named person on a date, makes an incident. Nothing here attributes an attack to an actor or changes a risk score.');
export const healthPill = h => pill(tr(M.HEALTH.find(x => x[0] === h.state)?.[1] || h.state) + (h.stale ? ' · ' + tr('stale') : ''), M.HEALTH_KIND[h.state]);
export const statusPill = s => pill(tr(M.RULE_STATUS.find(x => x[0] === s)?.[1] || s), M.RULE_KIND[s]);
export const coveragePill = s => pill(tr(M.COVERAGE.find(x => x[0] === s)?.[1] || s), M.COVERAGE_KIND[s]);
export const data = (t, cls) => el('span', { 'data-noi18n': '', class: cls || null }, t ?? '—');

/* ---------------- overview ---------------- */
function dashboard(body, c) {
  const ws = c.ws, R = M.reg(ws), s = M.summary(ws, c.asOf);
  body.append(asOfBar(c), noIncident());
  const covTotal = Object.values(s.coverage).reduce((a, b) => a + b, 0);
  body.append(el('div', 'grid g4',
    kpi('Telemetry sources', n0(R.sources.length), tr('{0} healthy · {1} silent · {2} degraded').replace('{0}', n0(s.health.healthy)).replace('{1}', n0(s.health.silent)).replace('{2}', n0(s.health.degraded)), s.health.silent ? 'bad' : s.health.degraded ? 'warn' : ''),
    kpi('Rules in production', n0(s.rules.production || 0), tr('{0} testing · {1} draft').replace('{0}', n0(s.rules.testing || 0)).replace('{1}', n0(s.rules.draft || 0))),
    kpi('Validated coverage', `${n0(s.coverage.validated)} / ${n0(covTotal)}`, tr('{0} untested · {1} degraded · {2} missing').replace('{0}', n0(s.coverage.untested)).replace('{1}', n0(s.coverage.degraded)).replace('{2}', n0(s.coverage.missing)), s.coverage.missing + s.coverage.degraded ? 'warn' : covTotal ? 'good' : ''),
    kpi('Alerts to triage', n0(s.alerts.open), tr('{0} on a crown jewel · {1} escalated').replace('{0}', n0(s.alerts.crownOpen)).replace('{1}', n0(s.alerts.escalated)), s.alerts.crownOpen ? 'bad' : s.alerts.open ? 'warn' : ''),
    kpi('Threat indicators', n0(s.indicators.total), tr('{0} stale · {1} TLP:RED or AMBER+STRICT').replace('{0}', n0(s.indicators.stale)).replace('{1}', n0(s.indicators.restricted))),
    kpi('Open detection gaps', n0(s.gaps), '', s.gaps ? 'warn' : ''),
    kpi('Oldest untriaged alert', s.alerts.oldestOpen || '—', ''),
    kpi('Imports', n0(R.imports.length), R.imports.length ? tr('last {0}').replace('{0}', R.imports[R.imports.length - 1].date.slice(0, 10)) : '')));
  if (!R.sources.length && !R.rules.length && !R.alerts.length && !R.indicators.length)
    body.append(card(el('div', 'empty-state', el('b', null, 'Nothing imported yet'), 'Import a telemetry source list, Sigma rules, alerts or a STIX bundle exported from your tools.',
      el('div', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: () => { history.replaceState(null, '', '#/siem/import'); view = 'import'; c.redraw(); } }, 'Import')))));
  // silent telemetry and the rules it blinds
  const silent = R.sources.map(x => ({ x, h: M.healthAt(x, c.asOf) })).filter(o => o.h.state === 'silent');
  if (silent.length) body.append(card(el('h2', null, 'Silent telemetry'), el('p', 'note', 'A rule whose required telemetry is silent does not detect.'),
    table([{ key: 'id', label: 'Source', render: o => data(`${o.x.id} · ${o.x.name}`) }, { key: 'h', label: 'Health', render: o => healthPill(o.h) },
      { key: 'last', label: 'Last event', render: o => data(o.x.lastSeen || '—', 'mono') },
      { key: 'rules', label: 'Rules blinded', render: o => data(R.rules.filter(r => (r.requiredSources || []).includes(o.x.id)).map(r => r.id).join(', ') || '—') }], silent, { class: 'compact' })));
  const q = M.triageQueue(ws).filter(x => M.openAlert(x.a)).slice(0, 6);
  if (q.length) body.append(card(el('h2', null, 'Top of the triage queue'),
    table([{ key: 'crown', label: 'Crown jewel', render: x => x.crown ? pill(tr('Crown jewel'), 'bad') : '' }, { key: 'score', label: 'Priority', num: true, render: x => n0(x.score) },
      { key: 'id', label: 'Alert', render: x => data(`${x.a.id} · ${x.a.title}`) }, { key: 'sev', label: 'Severity', render: x => tr(M.SEVERITY.find(s => s[0] === x.a.severity)?.[1] || x.a.severity) },
      { key: 'asset', label: 'Asset', render: x => data(x.a.asset || '—') }, { key: 'tlp', label: 'TLP', render: x => tlpPill(x.a.tlp) }], q, { class: 'compact' })));
}

/* ---------------- telemetry sources ---------------- */
const lsField = (key = 'logsource') => ({ key, label: 'Log source, Sigma style (product/service/category)', type: 'text', placeholder: 'e.g. windows/security/', wide: true,
  encode: v => v ? `${v.product || ''}/${v.service || ''}/${v.category || ''}` : '', decode: s => { const [product = '', service = '', category = ''] = String(s || '').split('/').map(x => x.trim()); return { product, service, category }; } });
export { lsField };

function sources(body, c) {
  const ws = c.ws, R = M.reg(ws);
  body.append(asOfBar(c));
  const hs = R.sources.map(s => M.healthAt(s, c.asOf));
  body.append(el('div', 'grid g4', ...M.HEALTH.map(([k, t]) => kpi(t, n0(hs.filter(h => h.state === k).length), '', k === 'silent' && hs.some(h => h.state === k) ? 'bad' : k === 'degraded' && hs.some(h => h.state === k) ? 'warn' : ''))));
  const assets = (ws.assets || []).map(a => [a.id, `${a.id} · ${a.name || ''}`]);
  body.append(G.register({ title: 'Telemetry sources', rows: R.sources, prefix: 'TS', redraw: c.redraw, csv: true,
    note: 'A source is silent when its latest health observation says so, or when its last event is older than three expected cadences (stale collection).',
    fields: [{ key: 'name', label: 'Name', type: 'text', wide: true }, { key: 'system', label: 'Source system (product exporting it)', type: 'text' },
      { key: 'asset', label: 'Source asset', type: 'select', options: [['', '—'], ...assets] }, { key: 'sourceType', label: 'Source type', type: 'text', placeholder: 'e.g. identity provider sign-in log' },
      { key: 'ocsfClass', label: 'OCSF 1.9.0 event class (normalised to)', type: 'select', options: M.OCSF_OPTIONS, encode: v => v ? String(v) : '', decode: v => M.normOcsf(v) },
      { key: 'dataComponents', label: 'ATT&CK data components (e.g. DC0002)', type: 'list' }, lsField(),
      { key: 'parser', label: 'Parser', type: 'text' }, { key: 'parserVersion', label: 'Parser version', type: 'text' },
      { key: 'cadenceHours', label: 'Expected cadence (hours between events)', type: 'number' }, { key: 'lastSeen', label: 'Last event seen (date or date-time)', type: 'text', placeholder: '2026-10-12T08:00:00Z' },
      { key: 'health', label: 'Health (latest observation)', type: 'select', options: M.HEALTH }, { key: 'healthDate', label: 'Observed on', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'area' }],
    blank: () => ({ health: 'unknown', healthHistory: [], dataComponents: [], logsource: { product: '', service: '', category: '' }, created: today() }),
    validate: r => !String(r.name || '').trim() ? 'A source needs a name.' : r.dataComponents?.some(d => !/^DC\d{4}$/i.test(d)) ? 'Data components are ATT&CK identifiers such as DC0002.' : null,
    columns: ['id', { key: 'name', label: 'Name', render: r => data(r.name) }, { key: 'system', label: 'System', render: r => data(r.system || '—') },
      { key: 'asset', label: 'Asset', render: r => el('span', null, data(r.asset || '—'), r.asset && M.isCrownJewel(r.asset, ws) ? pill(tr('Crown jewel'), 'bad') : null) },
      { key: 'ocsf', label: 'OCSF class', render: r => data(r.ocsfClass ? M.ocsfLabel(r.ocsfClass) : '—') },
      { key: 'h', label: 'Health at as-of date', render: r => healthPill(M.healthAt(r, c.asOf)), sort: r => M.healthAt(r, c.asOf).state },
      { key: 'lastSeen', label: 'Last event', render: r => data(r.lastSeen || '—', 'mono') },
      { key: 'rules', label: 'Rules depending on it', num: true, render: r => n0(R.rules.filter(x => (x.requiredSources || []).includes(r.id)).length) }],
    actions: r => [el('button', { class: 'btn sm ghost', onclick: () => healthDialog(r, c) }, 'Record health')] }));
  // event records — pointers, never payloads
  body.append(G.register({ title: 'Event records (pointers)', rows: R.events, prefix: 'EV', redraw: c.redraw, csv: true,
    note: 'Each record points to an event kept in the SIEM (reference, times, hash, link). The event itself is never copied here.',
    fields: [{ key: 'sourceId', label: 'Telemetry source', type: 'select', options: [['', '—'], ...R.sources.map(s => [s.id, `${s.id} · ${s.name}`])] },
      { key: 'externalRef', label: 'Reference in the SIEM', type: 'text' }, { key: 'observed', label: 'Event time', type: 'text' }, { key: 'recorded', label: 'Recorded at', type: 'text' },
      { key: 'ocsfClass', label: 'OCSF 1.9.0 event class (normalised to)', type: 'select', options: M.OCSF_OPTIONS, encode: v => v ? String(v) : '', decode: v => M.normOcsf(v) },
      { key: 'parser', label: 'Parser and version', type: 'text' }, { key: 'hash', label: 'Hash of the raw event', type: 'text', wide: true }, { key: 'link', label: 'Link to the event in the SIEM', type: 'text', wide: true }],
    validate: r => !String(r.externalRef || '').trim() ? 'An event record needs the reference of the event in the SIEM.' : /[?&](token|key|secret|password|apikey|api_key|sig)=/i.test(r.link || '') ? 'The link carries a credential: remove it (a link must never leak a secret).' : null,
    columns: ['id', { key: 'sourceId', label: 'Source', render: r => data(r.sourceId || '—') }, { key: 'externalRef', label: 'Reference', render: r => data(r.externalRef, 'mono') },
      { key: 'observed', label: 'Event time', render: r => data(r.observed || '—', 'mono') }, { key: 'ocsf', label: 'OCSF class', render: r => data(r.ocsfClass ? M.ocsfLabel(r.ocsfClass) : '—') }] }));
}

function healthDialog(src, c) {
  const d = el('input', { type: 'date', value: today() }), s = select(M.HEALTH.map(([k, t]) => [k, tr(t)]), src.health || 'healthy'), n = el('input', { type: 'text', 'data-noi18n': '' });
  const m = modal(tr('Record health'), el('p', 'note', 'A dated telemetry health observation. The latest observation on or before a date gives the state at that date.'),
    el('div', 'grid g3', field(tr('Observed on'), d), field(tr('Health'), s), field(tr('Note'), n)),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: () => {
      (src.healthHistory ||= []).push({ date: d.value || today(), state: s.value, note: n.value, by: users.name() || '' });
      const last = src.healthHistory.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).pop(); src.health = last.state; src.healthDate = last.date;
      LOG.data('telemetry health recorded', src.id, `${s.value} on ${d.value}`, c.ws.name); touch(); m.close(); toast(tr('Health recorded')); c.redraw();
    } }, 'Save'), el('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancel')));
}

/* ---------------- import ---------------- */
let lastResult = null;
function importTab(body, c) {
  const ws = c.ws, R = M.reg(ws);
  const kind = select(M.KINDS.map(([k, t]) => [k, tr(t)]), 'auto', { id: 'siem-imp-kind' });
  const tlp = select(M.TLP.map(([k, t]) => [k, t]), 'AMBER', { id: 'siem-imp-tlp' });
  const file = el('input', { type: 'file', id: 'siem-imp-file', multiple: true, accept: '.json,.csv,.yml,.yaml,.txt,application/json,text/csv' });
  const paste = el('textarea', { rows: 6, id: 'siem-imp-text', 'data-noi18n': '', placeholder: tr('Or paste the content of a file here') });
  const run = async (text, name) => {
    try {
      const rec = await M.importText(text, { fileName: name, kind: kind.value, defaultTlp: tlp.value, ws, by: users.name() || '' });
      lastResult = rec; toast(tr('Import recorded: {0}').replace('{0}', rec.id), rec.errors.length ? 'warn' : 'good');
    } catch (e) { lastResult = { errors: [String(e.message || e)], file: name, counts: {} }; toast(tr('Import failed'), 'bad'); }
  };
  file.addEventListener('change', async () => { for (const f of file.files) await run(await f.text(), f.name); c.redraw(); });
  body.append(card(el('h2', null, 'Import a file'),
    el('p', 'note', 'Telemetry source lists, Sigma rules, alerts and indicators exported from your tools. Files are read on this computer; nothing is sent anywhere. Each import is recorded with the file name, what it added and the SHA-256 of its content.'),
    el('div', 'grid g2', field(tr('Kind of file'), kind), field(tr('TLP for records that carry no marking'), tlp, tr('TLP:AMBER unless the producer marked the content otherwise.'))),
    field(tr('File'), file), field(tr('Paste'), paste),
    el('div', 'btnrow', el('button', { class: 'btn', id: 'siem-imp-paste', onclick: async () => { if (!paste.value.trim()) return; await run(paste.value, 'pasted text'); c.redraw(); } }, 'Import pasted text')),
    el('p', 'small muted', 'Format: see docs/SIEM-SOAR-IMPORT-FORMAT.md (envelope crg-siem-import/1).')));
  if (lastResult) {
    const cs = Object.entries(lastResult.counts || {}).map(([k, v]) => `${k} ${v}`).join(' · ') || tr('nothing added');
    body.append(banner(lastResult.errors?.length ? 'warn' : 'good', tr('Last import: {0}').replace('{0}', lastResult.file), el('div', null, data(cs),
      ...(lastResult.errors || []).map(e => el('div', 'small', data(e))))));
  }
  body.append(card(el('h2', null, `${tr('Import history')} (${R.imports.length})`),
    R.imports.length ? table([{ key: 'id', label: 'Id', render: r => data(r.id, 'mono') }, { key: 'date', label: 'Date', render: r => data(r.date.replace('T', ' '), 'mono') },
      { key: 'file', label: 'File', render: r => data(r.file) }, { key: 'kind', label: 'Kind', render: r => tr(M.KINDS.find(k => k[0] === r.kind)?.[1] || r.kind) },
      { key: 'counts', label: 'Added', render: r => data(Object.entries(r.counts || {}).map(([k, v]) => `${k} ${v}`).join(' · ') || '—') },
      { key: 'sha256', label: 'SHA-256', render: r => el('span', { class: 'mono small', title: r.sha256, 'data-noi18n': '' }, r.sha256.slice(0, 16) + '…') },
      { key: 'by', label: 'By', render: r => data(r.by || '—') }, { key: 'errors', label: 'Messages', render: r => data((r.errors || []).length ? r.errors.join(' · ') : '—') }],
    R.imports.slice().reverse(), { class: 'compact' }) : el('div', 'empty-state', tr('Nothing imported yet.'))));
}
