/* Information assets (1.4.0) — inventory linked to scenarios and risks: continuous discovery imports
   (Nmap, CSV, AWS / Azure JSON, discovery drop folder) with diff, software and data inventory,
   classification and criticality scoring, business impact analysis, data-sensitivity tagging, dynamic risk
   scoring, vulnerability and configuration correlation, vulnerability mapping, configuration baselines,
   endpoint security status, service dependency mapping, relational visualization, blast-radius analysis,
   lifecycle management and traceability, timestamped audit trail and compliance reporting.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, kpi, card, pill, chip, select, toast, table, banner, download, toCSV, field, today, debounce, go } from '../util.js';
import { S, touch, compute, scen } from '../state.js';
import { HS, probe, apiJson } from '../helper.js';
import * as X from '../assets.js';
import { sparkline } from '../charts.js';

let view = 'inventory', editId = null, graphSel = null, dropPoll = null, pending = null;
const flt = { q: '', type: 'all', tier: 'all', cls: 'all', stage: 'all' };
const tierPill = t => pill(t, X.tierKind(t));
const label = (list, k) => (list.find(x => x[0] === k) || [, k])[1];

export function render(sec, arg) {
  const ws = S.ws; ws.assets ||= []; ws.assetLog ||= [];
  if (arg && ws.assets.some(a => a.id === arg)) { editId = arg; view = 'inventory'; }
  else if (arg) view = arg;
  sec.replaceChildren(el('h1', null, 'Information assets'), el('p', 'lede', 'The organization\'s information assets — systems, applications, data, services, cloud tenants, devices and suppliers — classified, scored and linked to the scenarios and risks they carry. Discovery imports keep the inventory current; every change is time-stamped in the audit trail.'));
  const R = compute();
  const scored = ws.assets.map(a => ({ a, c: X.criticality(a, ws), d: X.dynamic(a, ws, R) }));
  const crit = scored.filter(x => x.c.tier === 'Critical').length;
  const ep = ws.assets.filter(a => ['hardware', 'server'].includes(a.type));
  sec.append(el('div', 'grid g5',
    kpi('Assets', n0(ws.assets.length), `${new Set(ws.assets.map(a => a.type)).size} types · ${ws.assets.filter(a => a.discovery).length} discovered`),
    kpi('Critical', n0(crit), 'criticality ≥ 70', crit ? 'warn' : ''),
    kpi('Highest dynamic risk', scored.length ? n0(Math.max(...scored.map(x => x.d.score))) : '—', 'criticality × exposure (0–100)'),
    kpi('EDR coverage', ep.length ? Math.round(100 * ep.filter(a => a.endpoint?.edr === true).length / ep.length) + '%' : '—', `${ep.length} endpoints and servers`, ep.some(a => a.endpoint?.edr === false) ? 'warn' : ''),
    kpi('Linked to scenarios', n0(ws.assets.filter(a => X.scenariosOf(a.id, ws).length).length), `of ${ws.assets.length}`)));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['inventory', 'Inventory'], ['discovery', 'Discovery & import'], ['software', 'Software & data'], ['bia', 'Business impact'], ['vulns', 'Vulnerabilities & configuration'],
    ['graph', 'Dependencies & blast radius'], ['audit', `Audit trail (${ws.assetLog.length})`], ['compliance', 'Compliance reporting']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; history.replaceState(null, '', '#/assets'); render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ inventory, discovery, software, bia, vulns, graph, audit, compliance }[view])(body, sec, scored, R);
}

/* ---------------- inventory ---------------- */
function inventory(body, sec, scored, R) {
  const ws = S.ws;
  const q = el('input', { placeholder: 'Search name, host, IP, owner, vendor, product, tag…', value: flt.q });
  const ty = select([['all', 'All types'], ...X.TYPES], flt.type), ti = select([['all', 'All tiers'], ...['Critical', 'High', 'Medium', 'Low'].map(t => [t, t])], flt.tier);
  const cl = select([['all', 'All classifications'], ...X.CLASS.map(c => [c, c])], flt.cls), sg = select([['all', 'All lifecycle stages'], ...X.STAGES], flt.stage);
  const shown = () => scored.filter(x => (flt.type === 'all' || x.a.type === flt.type) && (flt.tier === 'all' || x.c.tier === flt.tier) && (flt.cls === 'all' || x.a.classification === flt.cls) && (flt.stage === 'all' || x.a.lifecycle?.stage === flt.stage)
    && (!flt.q || [x.a.id, x.a.name, x.a.hostname, x.a.ip, x.a.owner, x.a.vendor, x.a.product, (x.a.tags || []).join(' ')].join(' ').toLowerCase().includes(flt.q.toLowerCase())));
  const hist = ws.assetScoreHist || [];
  const cols = [
    { key: 'id', label: 'ID', cls: 'mono', render: x => x.a.id, sort: x => x.a.id },
    { key: 'name', label: 'Asset', render: x => el('div', null, el('b', null, x.a.name || '(unnamed)'), el('div', 'small muted', [label(X.TYPES, x.a.type), x.a.hostname || x.a.ip, x.a.owner].filter(Boolean).join(' · ')),
      (x.a.sensitivity || []).length ? el('div', 'chips', ...x.a.sensitivity.map(s => chip(s, { kind: 'k' }))) : null), sort: x => x.a.name },
    { key: 'cls', label: 'Class', render: x => x.a.classification || '—', sort: x => X.CLASS.indexOf(x.a.classification) },
    { key: 'crit', label: 'Criticality', num: true, render: x => el('span', { title: x.c.parts.map(p => `${p[0]}: ${Math.round(p[1])}`).join('\n') }, n0(x.c.score), ' ', tierPill(x.c.tier)), sort: x => x.c.score },
    { key: 'dyn', label: 'Dynamic risk', num: true, render: x => { const pts = hist.map(h => h.scores?.[x.a.id]).filter(v => Number.isFinite(v)); return el('span', { title: x.d.factors.map(f => `${f[0]} (+${f[1].toFixed(2)})`).join('\n') || 'no exposure factor' }, pts.length > 1 ? sparkline([...pts, x.d.score]) : null, ' ', el('b', null, n0(x.d.score))); }, sort: x => x.d.score },
    { key: 'v', label: 'CVEs', num: true, render: x => (x.a.vulns || []).length ? el('span', { style: { color: (x.a.vulns || []).some(v => S.snap?.kev?.cves?.[v]) ? 'var(--bad)' : '' } }, n0(x.a.vulns.length)) : '—', sort: x => (x.a.vulns || []).length },
    { key: 'ep', label: 'Endpoint', render: x => ['hardware', 'server'].includes(x.a.type) ? el('span', null, x.a.endpoint?.edr === true ? pill('EDR', 'good') : x.a.endpoint?.edr === false ? pill('no EDR', 'bad') : pill('EDR ?', ''), ' ', x.a.baseline?.status === 'drift' ? pill('drift', 'warn') : x.a.baseline?.status === 'compliant' ? pill('baseline', 'good') : '') : '' },
    { key: 'life', label: 'Lifecycle', render: x => { const e = x.a.lifecycle?.eos || x.a.lifecycle?.eol; return el('span', null, label(X.STAGES, x.a.lifecycle?.stage), e ? el('div', 'small', { style: { color: e < today() ? 'var(--bad)' : 'var(--muted)' } }, 'EoS ' + e) : null); } },
    { key: 'links', label: 'Scenarios · risks', render: x => el('div', 'chips', ...X.scenariosOf(x.a.id, ws).map(s => chip(s.id, { href: '#/scenario/' + s.id, title: s.name })), ...X.risksOf(x.a.id, ws).map(r => chip(r.id, { href: '#/riskreg/' + r.id, title: r.title }))) },
  ];
  const t = table(cols, shown(), { class: 'compact', sortKey: 'dyn', sortDir: -1, onRow: x => { editId = x.a.id; render(sec); setTimeout(() => document.getElementById('asset-edit')?.scrollIntoView({ behavior: 'smooth' }), 0); } });
  const count = el('div', 'selcount');
  const upd = () => { const r = shown(); t.redraw(r); count.textContent = `${r.length} of ${scored.length} assets`; };
  q.addEventListener('input', debounce(() => { flt.q = q.value; upd(); }, 200));
  for (const [c, k] of [[ty, 'type'], [ti, 'tier'], [cl, 'cls'], [sg, 'stage']]) c.addEventListener('change', () => { flt[k] = c.value; upd(); });
  upd();
  const fromProfile = () => {
    const ws = S.ws; let n = 0;
    const names = [...(ws.assessment.CROWN || []).map(c => Array.isArray(c) ? c[1] || c[0] : c.name || c.asset || ''), ...String(ws.org.systems || '').split(/[;,\n]/)].map(s => String(s).trim().replace(/^and\s+/i, '').replace(/\.$/, '')).filter(s => s.length >= 3 && s.length < 80);
    for (const nm of [...new Set(names)]) if (!ws.assets.some(a => a.name.toLowerCase() === nm.toLowerCase())) { const a = X.blankAsset({ name: nm, type: /e-?mail|ehr|system|billing|portal|scheduling|pharmacy|laborator|radiolog/i.test(nm) ? 'application' : /equipment|device/i.test(nm) ? 'iot' : 'application', classification: /patient|health|ehr|medical|personal/i.test(nm) ? 'Restricted' : 'Confidential', sensitivity: /patient|health|ehr|medical/i.test(nm) ? ['PHI', 'PII'] : [] }); ws.assets.push(a); X.log(ws, a.id, 'create', '', '', a.name, 'organization profile'); n++; }
    touch(); toast(n + ' asset(s) created from the profile and crown jewels — review their classification'); render(sec);
  };
  body.append(card(el('div', 'btnrow',
      el('button', { class: 'btn', onclick: () => { const a = X.blankAsset(); ws.assets.push(a); X.log(ws, a.id, 'create', '', '', '(new)'); editId = a.id; touch(); render(sec); } }, 'New asset'),
      el('button', { class: 'btn ghost', onclick: fromProfile }, 'Create from profile & crown jewels'),
      el('button', { class: 'btn ghost', onclick: () => { view = 'discovery'; render(sec); } }, 'Import discovery…'),
      el('button', { class: 'btn ghost', disabled: !scored.length, title: 'Store today\'s dynamic scores to follow their trend', onclick: () => { ws.assetScoreHist ||= []; const h = ws.assetScoreHist.find(x => x.date === today()) || (ws.assetScoreHist.push({ date: today(), scores: {} }), ws.assetScoreHist[ws.assetScoreHist.length - 1]); for (const x of scored) h.scores[x.a.id] = x.d.score; touch(); toast('Scores recorded for ' + today()); render(sec); } }, 'Record scores'),
      el('button', { class: 'btn ghost', disabled: !scored.length, onclick: () => download(`assets-${today()}.csv`, toCSV([['id', 'name', 'type', 'owner', 'classification', 'sensitivity', 'criticality', 'tier', 'dynamic', 'hostname', 'ip', 'os', 'vendor', 'product', 'version', 'stage', 'eos', 'edr', 'baseline', 'cves', 'deps', 'scenarios'],
        ...scored.map(x => [x.a.id, x.a.name, x.a.type, x.a.owner, x.a.classification, (x.a.sensitivity || []).join(' '), x.c.score, x.c.tier, x.d.score, x.a.hostname, x.a.ip, x.a.os, x.a.vendor, x.a.product, x.a.version, x.a.lifecycle?.stage, x.a.lifecycle?.eos, x.a.endpoint?.edr, x.a.baseline?.status, (x.a.vulns || []).join(' '), (x.a.deps || []).join(' '), X.scenariosOf(x.a.id).map(s => s.id).join(' ')])]), 'text/csv') }, 'Export CSV')),
    el('div', 'filterbar', { style: { marginTop: '12px' } }, el('div', 'grow', q), el('div', null, ty), el('div', null, ti), el('div', null, cl), el('div', null, sg), count),
    scored.length ? el('div', 'tablewrap', { style: { marginTop: '10px' } }, t) : el('div', 'empty-state', el('b', null, 'No asset yet'), 'Create assets by hand, from the organization profile, or import a discovery scan or inventory export.'),
    el('p', 'note', 'Criticality (0–100) = CIA 40 + business impact 30 + classification 15 + sensitive data 10 + dependents 5. Dynamic risk = criticality × exposure, where exposure rises with linked CVEs (KEV, EPSS, confirmed exposure), missing EDR or encryption, patch age, baseline drift, end of support, internet exposure and linked scenarios above tolerance. Hover a score for its components.')));
  const a = ws.assets.find(x => x.id === editId);
  if (a) body.append(editor(a, sec, R));
}

function editor(a, sec, R) {
  const ws = S.ws;
  const set = (path, v, redraw) => { if (X.setField(ws, a, path, v)) { touch(); if (redraw) render(sec); } };
  const get = path => path.split('.').reduce((o, k) => o?.[k], a);
  const inp = (path, attrs = {}) => { const i = el('input', Object.assign({ value: get(path) ?? '' }, attrs)); i.addEventListener('change', () => set(path, attrs.type === 'number' ? (i.value === '' ? '' : +i.value) : i.value, attrs.redraw)); return i; };
  const sel = (path, opts, redraw = true) => { const s = select(opts, get(path) ?? ''); s.addEventListener('change', () => set(path, /^(cia|bia)\./.test(path) && !/processes/.test(path) ? +s.value : s.value === 'true' ? true : s.value === 'false' ? false : s.value === 'null' ? null : s.value, redraw)); return s; };
  const tri = path => sel(path, [['null', 'Unknown'], ['true', 'Yes'], ['false', 'No']]);
  const five = path => sel(path, [0, 1, 2, 3, 4, 5].map(n => [n, String(n)]));
  const c = X.criticality(a, ws), d = X.dynamic(a, ws, R);
  // sensitivity chips
  const sens = el('div', 'chips');
  for (const [k, l] of X.SENS) sens.append(el('label', { class: 'chip', style: { cursor: 'pointer' }, title: l }, el('input', { type: 'checkbox', checked: (a.sensitivity || []).includes(k), style: { width: 'auto', margin: 0 },
    onchange: e => set('sensitivity', e.target.checked ? [...(a.sensitivity || []), k] : (a.sensitivity || []).filter(x => x !== k), true) }), ' ', k));
  // deps
  const depBox = el('div', 'chips');
  for (const o of ws.assets.filter(o => o.id !== a.id)) depBox.append(el('label', { class: 'chip', style: { cursor: 'pointer' }, title: label(X.TYPES, o.type) }, el('input', { type: 'checkbox', checked: (a.deps || []).includes(o.id), style: { width: 'auto', margin: 0 },
    onchange: e => set('deps', e.target.checked ? [...(a.deps || []), o.id] : a.deps.filter(x => x !== o.id), true) }), ' ', o.id + ' ' + o.name.slice(0, 28)));
  // scenarios
  const scBox = el('div', 'chips');
  for (const s of ws.assessment.SCEN) scBox.append(el('label', { class: 'chip', style: { cursor: 'pointer' }, title: s.name }, el('input', { type: 'checkbox', checked: (s.assetIds || []).includes(a.id), style: { width: 'auto', margin: 0 },
    onchange: e => { s.assetIds ||= []; if (e.target.checked) s.assetIds.push(a.id); else s.assetIds = s.assetIds.filter(x => x !== a.id); X.log(ws, a.id, 'link', 'scenario', e.target.checked ? '' : s.id, e.target.checked ? s.id : ''); touch(); render(sec); } }), ' ', s.id));
  // vulns
  const vBox = el('div', 'chips', ...(a.vulns || []).map(v => chip(v, { kind: S.snap?.kev?.cves?.[v] ? 'k' : 'v', href: '#/vulns/' + v, onRemove: () => set('vulns', a.vulns.filter(x => x !== v), true) })));
  const vsug = X.vulnSuggestions(a, ws);
  const vAdd = select([['', 'Link a CVE of the register…'], ...ws.vulns.filter(v => !(a.vulns || []).includes(v.id)).map(v => [v.id, `${v.id} ${v.product || v.asset || ''}`])], '');
  vAdd.addEventListener('change', () => { if (vAdd.value) set('vulns', [...(a.vulns || []), vAdd.value], true); });
  // software
  const swT = el('div');
  const drawSw = () => swT.replaceChildren(table([{ key: 'name', label: 'Software' }, { key: 'version', label: 'Version' }, { key: 'vendor', label: 'Vendor' }, { key: 'port', label: 'Port' },
    { key: 'x', label: '', sortable: false, render: s => el('button', { class: 'btn sm ghost danger', onclick: () => set('software', a.software.filter(x => x !== s), true) }, '×') }], a.software || [], { class: 'compact' }));
  drawSw();
  const swN = el('input', { placeholder: 'name' }), swV = el('input', { placeholder: 'version' }), swVe = el('input', { placeholder: 'vendor' });
  const myLog = ws.assetLog.filter(l => l.asset === a.id).slice(-30).reverse();
  const br = X.blastRadius(a.id, ws);
  return card({ id: 'asset-edit' }, el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, `${a.id} — ${a.name || 'new asset'}`), tierPill(c.tier), pill('dynamic ' + d.score, d.score >= 50 ? 'bad' : d.score >= 30 ? 'warn' : ''),
      el('button', { class: 'btn sm ghost', onclick: () => { graphSel = a.id; view = 'graph'; render(sec); } }, 'Blast radius'),
      el('button', { class: 'btn sm ghost danger', onclick: () => { if (!confirm(`Delete ${a.id}? Its audit trail is kept.`)) return; ws.assets = ws.assets.filter(x => x !== a); for (const o of ws.assets) o.deps = (o.deps || []).filter(x => x !== a.id); for (const s of ws.assessment.SCEN) s.assetIds = (s.assetIds || []).filter(x => x !== a.id); X.log(ws, a.id, 'delete', '', a.name, ''); editId = null; touch(); render(sec); } }, 'Delete'),
      el('button', { class: 'btn sm ghost', onclick: () => { editId = null; render(sec); } }, 'Close')),
    el('h4', null, 'General'),
    el('div', 'grid g4', el('div', { style: { gridColumn: 'span 2' } }, field('<b>Name</b>', inp('name'))), field('Type', sel('type', X.TYPES)), field('Environment', sel('env', ['production', 'test', 'development', 'disaster recovery'].map(x => [x, x]))),
      field('Owner (accountable)', inp('owner')), field('Custodian (operates)', inp('custodian')), field('Location', inp('location')), field('Tags (comma)', (() => { const i = el('input', { value: (a.tags || []).join(', '), placeholder: 'internet-facing, dmz, clinic-3' }); i.addEventListener('change', () => set('tags', i.value.split(',').map(x => x.trim()).filter(Boolean), true)); return i; })()),
      field('Hostname', inp('hostname')), field('IP address', inp('ip')), field('OS / platform', inp('os')), field('Vendor', inp('vendor')), field('Product', inp('product')), field('Version', inp('version')), el('div', { style: { gridColumn: 'span 2' } }, field('CPE', inp('cpe', { placeholder: 'cpe:2.3:a:vendor:product:version' })))),
    el('h4', null, 'Classification, criticality and data sensitivity'),
    el('div', 'grid g4', field('Classification', sel('classification', X.CLASS.map(x => [x, x]))), field('Confidentiality (1–5)', five('cia.c')), field('Integrity (1–5)', five('cia.i')), field('Availability (1–5)', five('cia.a'))),
    el('div', { style: { marginTop: '8px' } }, el('label', null, 'Sensitive data held or processed'), sens),
    el('div', 'note', `Criticality ${c.score} (${c.tier}) = ` + c.parts.map(p => `${p[0]} ${Math.round(p[1])}`).join(' + ')),
    el('h4', null, 'Business impact analysis'),
    el('div', 'grid g4', field('Maximum tolerable downtime (hours)', inp('bia.mtd', { type: 'number', min: 0, redraw: true })), field('RTO (hours)', inp('bia.rto', { type: 'number', min: 0 })), field('RPO (hours)', inp('bia.rpo', { type: 'number', min: 0 })), field('Revenue at risk per hour', inp('bia.revhr', { type: 'number', min: 0 })),
      field('Financial impact (0–5)', five('bia.fin')), field('Operational (0–5)', five('bia.ops')), field('Legal / regulatory (0–5)', five('bia.legal')), field('Reputational (0–5)', five('bia.rep')), field('Safety / wellbeing (0–5)', five('bia.safety')),
      el('div', { style: { gridColumn: 'span 3' } }, field('Business processes supported', inp('bia.processes')))),
    el('h4', null, 'Lifecycle'),
    el('div', 'grid g5', field('Stage', sel('lifecycle.stage', X.STAGES)), field('Acquired', inp('lifecycle.acquired', { type: 'date' })), field('End of support', inp('lifecycle.eos', { type: 'date', redraw: true })), field('End of life', inp('lifecycle.eol', { type: 'date' })), field('Planned retirement', inp('lifecycle.retire', { type: 'date' }))),
    ['hardware', 'server', 'network', 'cloud', 'iot'].includes(a.type) ? el('div', null, el('h4', null, 'Endpoint security and configuration baseline'),
      el('div', 'grid g4', field('EDR / anti-malware', tri('endpoint.edr')), field('Disk encryption', tri('endpoint.disk_enc')), field('Last patched', inp('endpoint.last_patch', { type: 'date', redraw: true })), field('Last seen', inp('endpoint.last_seen', { type: 'date' })),
        field('Baseline', sel('baseline.name', [['', '—'], ...X.BASELINES.map(b => [b, b])])), field('Baseline status', sel('baseline.status', [['unknown', 'Unknown'], ['compliant', 'Compliant'], ['drift', 'Drift'], ['n/a', 'Not applicable']])), field('Last check', inp('baseline.checked', { type: 'date' })), field('Deviations', inp('baseline.deviations')))) : null,
    el('h4', null, 'Software installed / components'), swT,
    el('div', 'row', { style: { marginTop: '6px', flexWrap: 'nowrap' } }, swN, swV, swVe, el('button', { class: 'btn sm', onclick: () => { if (!swN.value.trim()) return; set('software', [...(a.software || []), { name: swN.value.trim(), version: swV.value.trim(), vendor: swVe.value.trim() }], true); } }, 'Add')),
    el('h4', null, 'Vulnerabilities'), vBox, el('div', { style: { marginTop: '6px', maxWidth: '520px' } }, vAdd),
    vsug.length ? el('div', 'note', 'Suggested from the register (product, asset or software match): ', ...vsug.map(v => el('button', { class: 'btn sm ghost', title: 'matched on ' + v.why, onclick: () => set('vulns', [...(a.vulns || []), v.id], true) }, `+ ${v.id}${v.kev ? ' (KEV)' : ''}`))) : null,
    el('h4', null, 'Depends on (upstream)'), ws.assets.length > 1 ? depBox : el('div', 'small muted', 'Add other assets to map dependencies.'),
    br.assets.length ? el('div', 'note', `Blast radius: ${br.assets.length} asset(s) depend on it, ${br.services.length} business service(s), ${br.scen.length} scenario(s).`) : null,
    el('h4', null, 'Scenarios carried by this asset'), scBox,
    el('details', { style: { marginTop: '10px' } }, el('summary', null, `Audit trail of this asset (${ws.assetLog.filter(l => l.asset === a.id).length})`),
      table([{ key: 'ts', label: 'Time', cls: 'mono' }, { key: 'action', label: 'Action' }, { key: 'field', label: 'Field' }, { key: 'old', label: 'Before' }, { key: 'new', label: 'After' }, { key: 'src', label: 'Source' }], myLog, { class: 'compact' })));
}

/* ---------------- discovery ---------------- */
function discovery(body, sec) {
  const ws = S.ws;
  const fileIn = el('input', { type: 'file', multiple: true, accept: '.xml,.csv,.json,.txt' });
  const out = el('div');
  const show = (src, kind, items) => { pending = { src, kind, d: X.diff(items, src, ws), pick: { add: new Set(items.map(i => i.key)), change: null, missing: new Set() } }; pending.pick.change = new Set(pending.d.change.map(x => x.a.id)); drawPending(out, sec); };
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Import a discovery scan or inventory export'),
    el('p', 'note', 'Nmap XML (nmap -sV -O -oX scan.xml …), CSV exports from a CMDB, EDR console (Defender, CrowdStrike, SentinelOne…), MDM or spreadsheet (columns such as name, hostname, IP, OS, owner, vendor, model, last seen, sensor status are recognized), AWS describe-instances JSON or Azure az resource list JSON. Each import is compared with the inventory before anything changes.'),
    el('div', 'row', field('File(s)', fileIn), el('button', { class: 'btn', onclick: async () => {
      for (const f of fileIn.files) { try { const { kind, items } = X.parseDiscovery(f.name, await f.text()); show(f.name.replace(/\.[^.]+$/, ''), kind, items); } catch (e) { toast(f.name + ': ' + e.message, 'bad'); } }
    } }, 'Compare with inventory')), out));
  // drop folder (continuous)
  const dropBox = el('div', 'small muted', 'Checking the helper…');
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Continuous discovery — drop folder'), dropBox));
  (async () => {
    await probe();
    if (!HS.helper) { dropBox.replaceChildren(el('p', 'note', 'Start the app with its launcher to use the discovery drop folder: scanners, EDR exports or scheduled scripts write files into feeds-folder/discovery, and the app compares each new file with the inventory while this screen is open.')); return; }
    const draw = async () => {
      if (!dropBox.isConnected) { clearInterval(dropPoll); return; }
      const r = await apiJson('/api/discovery').catch(() => ({ files: [], folder: '' }));
      ws.discoverySeen ||= {};
      const fresh = r.files.filter(f => ws.discoverySeen[f.name] !== f.modified);
      dropBox.replaceChildren(el('div', 'mono small', r.folder), el('p', 'note', 'Checked every minute while this screen is open. Schedule your scanner (cron, Task Scheduler, EDR scheduled export) to write here for continuous discovery.'),
        r.files.length ? table([{ key: 'name', label: 'File' }, { key: 'modified', label: 'Modified', cls: 'mono' }, { key: 'bytes', label: 'Size', num: true, render: f => n0(f.bytes) },
          { key: 's', label: '', render: f => ws.discoverySeen[f.name] === f.modified ? pill('imported', 'good') : pill('new', 'warn') },
          { key: 'a', label: '', sortable: false, render: f => el('button', { class: 'btn sm', onclick: async () => {
            const txt = await (await fetch('/api/discovery/' + encodeURIComponent(f.name), { headers: { 'X-CRG': '1' }, cache: 'no-store' })).text();
            try { const { kind, items } = X.parseDiscovery(f.name, txt); show(f.name.replace(/\.[^.]+$/, ''), kind, items); pending.file = f; } catch (e) { toast(e.message, 'bad'); }
          } }, 'Compare') }], r.files, { class: 'compact' }) : el('div', 'small muted', 'No file yet.'),
        fresh.length ? banner('warn', `${fresh.length} new or changed discovery file(s)`, 'Compare them with the inventory.') : null);
    };
    await draw(); clearInterval(dropPoll); dropPoll = setInterval(draw, 60000);
  })();
}
function drawPending(out, sec) {
  const ws = S.ws, p = pending, d = p.d;
  const tick = (set, key) => { const b = el('input', { type: 'checkbox', checked: set.has(key) }); b.addEventListener('change', () => b.checked ? set.add(key) : set.delete(key)); return b; };
  out.replaceChildren(card(el('h4', null, `${p.kind} “${p.src}”: ${d.add.length} new · ${d.change.length} changed · ${d.same.length} unchanged · ${d.missing.length} not seen`),
    d.add.length ? el('div', null, el('b', null, 'New assets'), table([{ key: 't', label: '', sortable: false, cls: 'cb', render: it => tick(p.pick.add, it.key) }, { key: 'name', label: 'Name' }, { key: 'ip', label: 'IP' }, { key: 'os', label: 'OS' }, { key: 'type', label: 'Type' }, { key: 'sw', label: 'Software', render: it => (it.software || []).length || '' }], d.add, { class: 'compact' })) : null,
    d.change.length ? el('div', { style: { marginTop: '10px' } }, el('b', null, 'Changed'), table([{ key: 't', label: '', sortable: false, cls: 'cb', render: x => tick(p.pick.change, x.a.id) }, { key: 'a', label: 'Asset', render: x => x.a.id + ' ' + x.a.name }, { key: 'ch', label: 'Changes', render: x => x.ch.map(c => `${c[0]}: ${c[1] ?? '—'} → ${c[2]}`).join(' · ') }], d.change, { class: 'compact' })) : null,
    d.missing.length ? el('div', { style: { marginTop: '10px' } }, el('b', null, 'Previously discovered by this source, not seen now'), table([{ key: 't', label: '', sortable: false, cls: 'cb', render: a => tick(p.pick.missing, a.id) }, { key: 'id', label: 'Asset', render: a => a.id + ' ' + a.name }, { key: 'l', label: 'Last seen', render: a => a.discovery?.last || '' }], d.missing, { class: 'compact' }), el('div', 'small muted', 'Ticked ones are flagged “missing” in their audit trail; nothing is deleted.')) : null,
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: () => {
      const n = X.applyDiff(d, p.src, ws, p.pick);
      if (p.file) { ws.discoverySeen ||= {}; ws.discoverySeen[p.file.name] = p.file.modified; }
      pending = null; touch(); toast(n + ' change(s) applied and logged'); view = 'inventory'; render(sec);
    } }, 'Apply ticked changes'), el('button', { class: 'btn ghost', onclick: () => { pending = null; out.replaceChildren(); } }, 'Cancel'))));
}

/* ---------------- software & data ---------------- */
function software(body, sec) {
  const ws = S.ws;
  const by = {};
  for (const a of ws.assets) {
    for (const s of a.software || []) { const k = (s.name + '|' + (s.version || '')).toLowerCase(); (by[k] ||= { name: s.name, version: s.version || '', vendor: s.vendor || '', assets: [] }).assets.push(a); }
    if (a.type === 'application' && a.product) { const k = (a.product + '|' + (a.version || '')).toLowerCase(); (by[k] ||= { name: a.product, version: a.version || '', vendor: a.vendor || '', assets: [] }).assets.push(a); }
  }
  const sw = Object.values(by);
  const cves = s => ws.vulns.filter(v => (v.product || '').toLowerCase().includes(s.name.toLowerCase()) || (v.title || '').toLowerCase().includes(s.name.toLowerCase()));
  body.append(card(el('h2', { style: { marginTop: 0 } }, `Software inventory (${sw.length})`),
    sw.length ? el('div', 'tablewrap', table([{ key: 'name', label: 'Software' }, { key: 'version', label: 'Version' }, { key: 'vendor', label: 'Vendor' },
      { key: 'n', label: 'Installations', num: true, render: s => n0(s.assets.length), sort: s => s.assets.length },
      { key: 'a', label: 'On', render: s => el('div', 'chips', ...s.assets.slice(0, 8).map(a => chip(a.id, { title: a.name, href: '#/assets/' + a.id }))) },
      { key: 'v', label: 'Register CVEs mentioning it', render: s => el('div', 'chips', ...cves(s).map(v => chip(v.id, { kind: S.snap?.kev?.cves?.[v.id] ? 'k' : 'v', href: '#/vulns/' + v.id }))) }], sw, { class: 'compact', sortKey: 'n', sortDir: -1 }))
      : el('p', 'note', 'No software recorded yet: import an Nmap -sV scan or an inventory export, or add software in an asset.')));
  const data = ws.assets.filter(a => a.type === 'data' || (a.sensitivity || []).length);
  body.append(card(el('h2', { style: { marginTop: 0 } }, `Data inventory and sensitivity (${data.length})`),
    data.length ? table([{ key: 'id', label: 'ID', cls: 'mono' }, { key: 'name', label: 'Data / holder' }, { key: 'type', label: 'Type', render: a => label(X.TYPES, a.type) }, { key: 'classification', label: 'Classification' },
      { key: 's', label: 'Sensitivity', render: a => el('div', 'chips', ...(a.sensitivity || []).map(s => chip(s, { kind: 'k' }))) }, { key: 'o', label: 'Owner', render: a => a.owner || el('span', { style: { color: 'var(--warn)' } }, 'no owner') },
      { key: 'enc', label: 'Encryption', render: a => a.endpoint?.disk_enc === true ? 'yes' : a.endpoint?.disk_enc === false ? el('span', { style: { color: 'var(--bad)' } }, 'no') : '—' }], data, { class: 'compact', onRow: a => { editId = a.id; view = 'inventory'; render(sec); } })
      : el('p', 'note', 'Create assets of type “Data / information” for the main information sets (patient records, payroll, images…), or tag systems with the sensitive data they hold.')));
}

/* ---------------- BIA ---------------- */
function bia(body, sec) {
  const ws = S.ws;
  const rows = ws.assets.filter(a => a.type === 'service' || a.bia?.rto || X.biaImpact(a) || X.criticality(a).tier === 'Critical');
  const ed = (a, k, num = true) => { const i = el('input', { type: num ? 'number' : 'text', min: 0, value: a.bia?.[k] ?? '', style: { width: num ? '80px' : '200px' } }); i.addEventListener('change', () => { if (X.setField(ws, a, 'bia.' + k, num ? (i.value === '' ? '' : +i.value) : i.value)) touch(); }); return i; };
  const fv = (a, k) => { const s = select([0, 1, 2, 3, 4, 5].map(n => [n, String(n)]), a.bia?.[k] ?? 0); s.addEventListener('change', () => { if (X.setField(ws, a, 'bia.' + k, +s.value)) { touch(); } }); return s; };
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Business impact analysis'),
    el('p', 'note', 'Business services and critical assets. Impact categories 0–5 feed the criticality score; MTD, RTO and RPO feed the blast-radius analysis and the continuity checks. Add a “Business service / process” asset for each service and link the systems it depends on.'),
    rows.length ? el('div', 'tablewrap', table([{ key: 'id', label: 'Asset', render: a => el('span', null, el('b', 'mono', a.id), ' ', a.name) },
      { key: 'mtd', label: 'MTD h', render: a => ed(a, 'mtd') }, { key: 'rto', label: 'RTO h', render: a => ed(a, 'rto') }, { key: 'rpo', label: 'RPO h', render: a => ed(a, 'rpo') },
      ...['fin', 'ops', 'legal', 'rep', 'safety'].map(k => ({ key: k, label: { fin: 'Financial', ops: 'Operational', legal: 'Legal', rep: 'Reputation', safety: 'Safety' }[k], render: a => fv(a, k) })),
      { key: 'p', label: 'Processes', render: a => ed(a, 'processes', false) },
      { key: 'c', label: 'Criticality', num: true, render: a => { const c = X.criticality(a); return el('span', null, n0(c.score), ' ', tierPill(c.tier)); }, sort: a => X.criticality(a).score },
      { key: 'u', label: 'Needs (upstream)', render: a => el('div', 'chips', ...X.upstream(a.id).map(id => chip(id, { title: ws.assets.find(x => x.id === id)?.name }))) }], rows, { class: 'compact' }))
      : el('p', 'note', 'No business service or critical asset yet.'),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn ghost', onclick: () => { const a = X.blankAsset({ type: 'service', name: 'New business service', classification: 'Confidential' }); ws.assets.push(a); X.log(ws, a.id, 'create', '', '', a.name); editId = a.id; view = 'inventory'; touch(); render(sec); } }, 'Add a business service'))));
}

/* ---------------- vulnerabilities & configuration ---------------- */
function vulns(body, sec, scored) {
  const ws = S.ws;
  const withV = ws.assets.filter(a => (a.vulns || []).length);
  const cves = [...new Set(withV.flatMap(a => a.vulns))];
  const sugg = ws.assets.map(a => ({ a, s: X.vulnSuggestions(a, ws) })).filter(x => x.s.length);
  body.append(card(el('h2', { style: { marginTop: 0 } }, `Correlation suggestions (${sugg.reduce((t, x) => t + x.s.length, 0)})`),
    sugg.length ? table([{ key: 'a', label: 'Asset', render: x => x.a.id + ' ' + x.a.name }, { key: 's', label: 'Register CVEs that match', render: x => el('div', 'chips', ...x.s.map(v => el('button', { class: 'btn sm ghost', title: 'matched on ' + v.why, onclick: () => { X.setField(ws, x.a, 'vulns', [...(x.a.vulns || []), v.id]); touch(); render(sec); } }, `+ ${v.id}${v.kev ? ' KEV' : ''}${v.exposed ? ' exposed' : ''}`))) },
      { key: 'all', label: '', sortable: false, render: x => el('button', { class: 'btn sm', onclick: () => { X.setField(ws, x.a, 'vulns', [...(x.a.vulns || []), ...x.s.map(v => v.id)]); touch(); render(sec); } }, 'Link all') }], sugg, { class: 'compact' })
      : el('p', 'note', 'No suggestion: CVEs of the register are matched to assets on their asset or product field and on the asset\'s name, host name, product and software. Fill the product of each CVE in Vulnerabilities, and the vendor/product/software of each asset.')));
  // matrix
  if (withV.length) {
    const t = el('table', 'compact'); const hr = el('tr', null, el('th', null, 'Asset'), ...cves.map(c => el('th', { style: { writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '11px' } }, c)));
    t.append(el('thead', null, hr), el('tbody', null, ...withV.map(a => el('tr', null, el('td', null, a.id + ' ' + a.name.slice(0, 26)), ...cves.map(c => { const has = a.vulns.includes(c); const kev = S.snap?.kev?.cves?.[c]; const ex = ws.vulns.find(v => v.id === c)?.exposed;
      return el('td', { title: has ? `${c}${kev ? ' · KEV' : ''}${ex ? ' · exposure confirmed' : ''}` : '', style: { textAlign: 'center', background: has ? (kev ? 'var(--bad-bg)' : 'var(--warn-bg)') : '' } }, has ? (ex ? '●' : '○') : ''); })))));
    body.append(card(el('h2', { style: { marginTop: 0 } }, 'Vulnerability map — assets × CVEs'), el('div', 'tablewrap', t), el('div', 'legend', el('span', null, el('i', { style: { background: 'var(--bad-bg)' } }), 'KEV-listed'), el('span', null, el('i', { style: { background: 'var(--warn-bg)' } }), 'other CVE'), el('span', null, '● exposure confirmed · ○ not confirmed'))));
  }
  // endpoint & configuration
  const ep = scored.filter(x => ['hardware', 'server', 'network', 'cloud', 'iot'].includes(x.a.type));
  const pct = (xs, f) => xs.length ? Math.round(100 * xs.filter(f).length / xs.length) + '%' : '—';
  const epOnly = ep.filter(x => ['hardware', 'server'].includes(x.a.type));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Endpoint security status and configuration baselines'),
    el('div', 'grid g5', kpi('EDR', pct(epOnly, x => x.a.endpoint?.edr === true), `${epOnly.filter(x => x.a.endpoint?.edr === false).length} without`), kpi('Disk encryption', pct(epOnly, x => x.a.endpoint?.disk_enc === true)),
      kpi('Patched ≤ 60 days', pct(epOnly, x => x.a.endpoint?.last_patch && (Date.now() - new Date(x.a.endpoint.last_patch)) / 864e5 <= 60)),
      kpi('Baseline compliant', pct(ep, x => x.a.baseline?.status === 'compliant'), `${ep.filter(x => x.a.baseline?.status === 'drift').length} in drift`),
      kpi('Past end of support', n0(ep.filter(x => (x.a.lifecycle?.eos || x.a.lifecycle?.eol || '9999') < today()).length), '', ep.some(x => (x.a.lifecycle?.eos || '9999') < today()) ? 'bad' : '')),
    ep.length ? el('div', 'tablewrap', { style: { marginTop: '10px' } }, table([{ key: 'a', label: 'Asset', render: x => x.a.id + ' ' + x.a.name }, { key: 'os', label: 'OS', render: x => x.a.os || '' },
      { key: 'edr', label: 'EDR', render: x => x.a.endpoint?.edr === true ? pill('yes', 'good') : x.a.endpoint?.edr === false ? pill('no', 'bad') : '?' },
      { key: 'enc', label: 'Encryption', render: x => x.a.endpoint?.disk_enc === true ? 'yes' : x.a.endpoint?.disk_enc === false ? 'no' : '?' },
      { key: 'p', label: 'Last patch', render: x => x.a.endpoint?.last_patch || '—' }, { key: 'b', label: 'Baseline', render: x => [x.a.baseline?.name, x.a.baseline?.status].filter(Boolean).join(' · ') || '—' },
      { key: 'd', label: 'Dynamic risk', num: true, render: x => n0(x.d.score), sort: x => x.d.score }], ep, { class: 'compact', sortKey: 'd', sortDir: -1, onRow: x => { editId = x.a.id; view = 'inventory'; render(sec); } })) : el('p', 'note', 'No endpoint, server, network or cloud asset yet.')));
}

/* ---------------- graph & blast radius ---------------- */
function graph(body, sec) {
  const ws = S.ws;
  if (!ws.assets.length) { body.append(card(el('div', 'empty-state', el('b', null, 'No asset to draw'), 'Add assets and their dependencies first.'))); return; }
  const opts = graph._o ||= { scen: true, risks: false };
  const nodes = ws.assets.map(a => ({ id: a.id, kind: 'asset', a, label: a.name || a.id }));
  if (opts.scen) for (const s of ws.assessment.SCEN.filter(s => (s.assetIds || []).length)) nodes.push({ id: s.id, kind: 'scen', label: s.id });
  if (opts.risks) for (const r of (ws.risks || []).filter(r => (r.assets || []).length)) nodes.push({ id: r.id, kind: 'risk', label: r.id });
  const has = new Set(nodes.map(n => n.id));
  const edges = [];
  for (const a of ws.assets) for (const d of a.deps || []) if (has.has(d)) edges.push([a.id, d, 'dep']);
  if (opts.scen) for (const s of ws.assessment.SCEN) for (const id of s.assetIds || []) if (has.has(id) && has.has(s.id)) edges.push([s.id, id, 'scen']);
  if (opts.risks) for (const r of ws.risks || []) for (const id of r.assets || []) if (has.has(id) && has.has(r.id)) edges.push([r.id, id, 'risk']);
  layout(nodes, edges);
  const br = graphSel && ws.assets.find(a => a.id === graphSel) ? X.blastRadius(graphSel, ws) : null;
  const hit = new Set(br ? [graphSel, ...br.assets.map(x => x.a.id), ...br.scen, ...br.risks] : []);
  const W = 900, H = 560;
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', '100%'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Asset dependency graph');
  const mk = (t, at, txt) => { const e = document.createElementNS(ns, t); for (const [k, v] of Object.entries(at)) e.setAttribute(k, v); if (txt) e.textContent = txt; return e; };
  const defs = mk('defs', {}); const mkr = mk('marker', { id: 'arr', viewBox: '0 0 10 10', refX: 18, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }); mkr.append(mk('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--muted)' })); defs.append(mkr); svg.append(defs);
  const P = Object.fromEntries(nodes.map(n => [n.id, n]));
  for (const [a, b, k] of edges) { const A = P[a], B = P[b]; const on = br && hit.has(a) && hit.has(b);
    svg.append(mk('line', { x1: A.x * W, y1: A.y * H, x2: B.x * W, y2: B.y * H, stroke: on ? 'var(--bad)' : k === 'dep' ? 'var(--muted)' : 'var(--line)', 'stroke-width': on ? 2.2 : 1.2, 'stroke-dasharray': k === 'dep' ? '' : '4 3', 'marker-end': k === 'dep' ? 'url(#arr)' : '', opacity: br && !on ? 0.35 : 1 })); }
  const colorFor = n => n.kind === 'scen' ? 'var(--ai)' : n.kind === 'risk' ? 'var(--warn)' : ({ service: 'var(--series-2)', data: 'var(--series-3)', cloud: 'var(--series-4)', application: 'var(--series-1)' }[n.a.type] || 'var(--accent)');
  for (const n of nodes) {
    const g = mk('g', { transform: `translate(${n.x * W},${n.y * H})`, style: 'cursor:pointer', opacity: br && !hit.has(n.id) ? 0.35 : 1 });
    const r = n.kind === 'asset' ? 7 + X.criticality(n.a).score / 12 : 8;
    g.append(n.kind === 'asset' ? mk('circle', { r, fill: colorFor(n), stroke: n.id === graphSel ? 'var(--bad)' : 'var(--surface)', 'stroke-width': n.id === graphSel ? 4 : 2 })
      : mk('rect', { x: -r, y: -r, width: 2 * r, height: 2 * r, rx: n.kind === 'risk' ? 2 : 4, fill: colorFor(n), transform: n.kind === 'risk' ? 'rotate(45)' : '' }));
    const right = n.x > 0.72;
    g.append(mk('text', { x: right ? -(r + 4) : r + 4, y: 4, 'font-size': 11, fill: 'var(--ink)', 'text-anchor': right ? 'end' : 'start' }, n.label.length > 26 ? n.label.slice(0, 24) + '…' : n.label));
    const tt = mk('title', {}, n.kind === 'asset' ? `${n.id} ${n.a.name} — ${label(X.TYPES, n.a.type)}, criticality ${X.criticality(n.a).score}` : n.id); g.append(tt);
    g.addEventListener('click', () => { if (n.kind === 'asset') { graphSel = graphSel === n.id ? null : n.id; render(sec); } else go((n.kind === 'scen' ? 'scenario/' : 'riskreg/') + n.id); });
    svg.append(g);
  }
  const cbx = (k, l) => el('label', { class: 'small', style: { display: 'flex', gap: '6px', alignItems: 'center' } }, el('input', { type: 'checkbox', checked: opts[k], style: { width: 'auto' }, onchange: e => { opts[k] = e.target.checked; render(sec); } }), l);
  const pick = select([['', 'Select an asset for its blast radius…'], ...ws.assets.map(a => [a.id, `${a.id} ${a.name}`])], graphSel || ''); pick.addEventListener('change', () => { graphSel = pick.value || null; render(sec); });
  body.append(card(el('div', 'filterbar', el('div', 'grow', pick), cbx('scen', 'Scenarios'), cbx('risks', 'Risks')), el('div', { style: { marginTop: '10px', border: '1px solid var(--line)', borderRadius: '10px', background: 'var(--surface-2)' } }, svg),
    el('div', 'legend', el('span', null, el('i', { style: { background: 'var(--accent)' } }), 'system'), el('span', null, el('i', { style: { background: 'var(--series-1)' } }), 'application'), el('span', null, el('i', { style: { background: 'var(--series-2)' } }), 'business service'),
      el('span', null, el('i', { style: { background: 'var(--series-3)' } }), 'data'), el('span', null, el('i', { style: { background: 'var(--series-4)' } }), 'cloud'), el('span', null, el('i', { style: { background: 'var(--ai)' } }), 'scenario'), el('span', null, el('i', { style: { background: 'var(--warn)' } }), 'risk'),
      el('span', null, '→ depends on · node size = criticality · click an asset for its blast radius'))));
  if (br) {
    const a = ws.assets.find(x => x.id === graphSel);
    body.append(card(el('h2', { style: { marginTop: 0 } }, `Blast radius of ${a.id} ${a.name}`),
      el('div', 'grid g5', kpi('Assets affected', n0(br.assets.length), 'depend on it, directly or not'), kpi('Business services', n0(br.services.length), br.services.map(x => x.a.name).join(', ').slice(0, 60)),
        kpi('Scenarios', n0(br.scen.length), 'carried by the affected assets'), kpi('Risks', n0(br.risks.length)), kpi('Shortest MTD', br.minMtd === null ? '—' : br.minMtd + ' h', 'among affected assets', br.minMtd !== null && br.minMtd < 8 ? 'bad' : '')),
      br.assets.length ? el('div', 'tablewrap', { style: { marginTop: '10px' } }, table([{ key: 'h', label: 'Hops', num: true, render: x => x.h }, { key: 'a', label: 'Asset', render: x => x.a.id + ' ' + x.a.name }, { key: 't', label: 'Type', render: x => label(X.TYPES, x.a.type) },
        { key: 'c', label: 'Criticality', num: true, render: x => n0(X.criticality(x.a).score), sort: x => X.criticality(x.a).score }, { key: 'm', label: 'MTD h', num: true, render: x => x.a.bia?.mtd || '—' }], br.assets, { class: 'compact', sortKey: 'h', sortDir: 1 })) : el('p', 'note', 'Nothing depends on this asset (or the dependencies are not mapped yet).'),
      el('p', 'note', 'Upstream (what it needs): ' + (X.upstream(a.id).map(id => id + ' ' + (ws.assets.find(x => x.id === id)?.name || '')).join(', ') || 'none mapped'))));
  }
}
/** Small force-directed layout, deterministic (seeded by order), positions in 0–1. */
function layout(nodes, edges) {
  const n = nodes.length, idx = Object.fromEntries(nodes.map((x, i) => [x.id, i]));
  nodes.forEach((x, i) => { const t = i / Math.max(1, n) * Math.PI * 2; x.x = 0.5 + 0.35 * Math.cos(t); x.y = 0.5 + 0.35 * Math.sin(t); });
  const k = Math.sqrt(1 / Math.max(1, n)) * 0.9;
  for (let it = 0; it < 220; it++) {
    const t = 0.08 * (1 - it / 220) + 0.004;
    const dx = new Float64Array(n), dy = new Float64Array(n);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { let ex = nodes[i].x - nodes[j].x, ey = nodes[i].y - nodes[j].y; const d = Math.max(0.01, Math.hypot(ex, ey)); const f = k * k / d; ex /= d; ey /= d; dx[i] += ex * f; dy[i] += ey * f; dx[j] -= ex * f; dy[j] -= ey * f; }
    for (const [a, b] of edges) { const i = idx[a], j = idx[b]; let ex = nodes[i].x - nodes[j].x, ey = nodes[i].y - nodes[j].y; const d = Math.max(0.01, Math.hypot(ex, ey)); const f = d * d / k; ex /= d; ey /= d; dx[i] -= ex * f; dy[i] -= ey * f; dx[j] += ex * f; dy[j] += ey * f; }
    for (let i = 0; i < n; i++) { const d = Math.max(1e-9, Math.hypot(dx[i], dy[i])); nodes[i].x += dx[i] / d * Math.min(d, t); nodes[i].y += dy[i] / d * Math.min(d, t); nodes[i].x = Math.min(0.95, Math.max(0.05, nodes[i].x)); nodes[i].y = Math.min(0.94, Math.max(0.06, nodes[i].y)); }
  }
}

/* ---------------- audit ---------------- */
function audit(body) {
  const ws = S.ws;
  const q = el('input', { placeholder: 'Filter by asset, action, field or source' });
  const rows = ws.assetLog.slice().reverse();
  const t = table([{ key: 'ts', label: 'Time', cls: 'mono' }, { key: 'asset', label: 'Asset', cls: 'mono' }, { key: 'action', label: 'Action' }, { key: 'field', label: 'Field' },
    { key: 'old', label: 'Before', render: l => (l.old || '').slice(0, 80) }, { key: 'new', label: 'After', render: l => (l.new || '').slice(0, 80) }, { key: 'src', label: 'Source' }], rows.slice(0, 500), { class: 'compact' });
  q.addEventListener('input', debounce(() => { const s = q.value.toLowerCase(); t.redraw(rows.filter(l => !s || Object.values(l).join(' ').toLowerCase().includes(s)).slice(0, 500)); }, 200));
  body.append(card(el('div', 'filterbar', el('div', 'grow', q), el('button', { class: 'btn ghost', onclick: () => download(`asset-audit-trail-${today()}.csv`, toCSV([['timestamp', 'asset', 'action', 'field', 'before', 'after', 'source'], ...ws.assetLog.map(l => [l.ts, l.asset, l.action, l.field, l.old, l.new, l.src])]), 'text/csv') }, 'Export CSV')),
    el('div', 'tablewrap', { style: { marginTop: '10px' } }, t),
    el('p', 'note', 'Every creation, change, link, import and deletion of an asset is recorded with its local time stamp, the field, the values before and after, and the source (manual or the discovery file). The trail is append-only from the app and travels with the workspace export.')));
}

/* ---------------- compliance reporting ---------------- */
function compliance(body, sec) {
  const ws = S.ws, rep = X.complianceReport(ws);
  const md = () => ['# Asset compliance report — ' + (ws.org.name || ws.name), '', `Generated ${today()} · ${ws.assets.length} assets`, '', '| Check | Controls | Applicable | Pass | % | Failing assets |', '|---|---|---|---|---|---|',
    ...rep.map(c => `| ${c.id} ${c.name} | ${c.ctl} | ${c.applicable} | ${c.pass} | ${c.pct === null ? '—' : Math.round(c.pct * 100) + '%'} | ${c.fail.map(a => a.id).join(', ')} |`)].join('\n');
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Asset compliance checks'),
    el('div', 'tablewrap', table([{ key: 'id', label: 'Check', render: c => el('span', null, el('b', 'mono', c.id), ' ', c.name) }, { key: 'ctl', label: 'Controls' }, { key: 'applicable', label: 'Applicable', num: true },
      { key: 'pct', label: 'Pass', num: true, render: c => c.pct === null ? '—' : el('span', null, `${c.pass} · `, pill(Math.round(c.pct * 100) + '%', c.pct >= 0.95 ? 'good' : c.pct >= 0.8 ? 'warn' : 'bad')), sort: c => c.pct ?? 2 },
      { key: 'fail', label: 'Failing assets', render: c => el('div', 'chips', ...c.fail.slice(0, 12).map(a => chip(a.id, { title: a.name, href: '#/assets/' + a.id })), c.fail.length > 12 ? el('span', 'small muted', '+' + (c.fail.length - 12)) : null) }], rep, { class: 'compact' })),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: () => download(`asset-compliance-${today()}.md`, md(), 'text/markdown') }, 'Report (.md)'),
      el('button', { class: 'btn ghost', onclick: () => download(`asset-compliance-${today()}.csv`, toCSV([['check', 'name', 'controls', 'applicable', 'pass', 'pct', 'failing'], ...rep.map(c => [c.id, c.name, c.ctl, c.applicable, c.pass, c.pct === null ? '' : (c.pct * 100).toFixed(1), c.fail.map(a => a.id).join(' ')])]), 'text/csv') }, 'CSV'),
      el('a', { class: 'btn ghost', href: '#/compliance' }, 'Framework compliance…'))));
}
