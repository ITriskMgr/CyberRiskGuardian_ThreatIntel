/* Compliance management (1.4.0) — statements of applicability for ISO/IEC 27002 (2013 and 2022), NIST
   SP 800-53 r5, NIST CSF (1.1 and 2.0) and CIS Controls (v7.1 and v8.1); implementation status, maturity
   0–5 against a target, owner, evidence, due date; gaps linked to measures and scenarios; regulatory checklists
   (Quebec Law 25, PIPEDA); reports in Markdown and CSV, and an Excel sheet in Export.
   Decision support, not legal advice. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { GENERATOR } from '../version.js';
import { el, n0, n1, kpi, card, pill, chip, select, toast, table, banner, download, toCSV, field, today, debounce } from '../util.js';
import { S, touch, compute, scen } from '../state.js';
import * as K from '../catalog.js';

export const CHECKLISTS = {
  law25: { name: 'Quebec Law 25 — private sector (Act respecting the protection of personal information in the private sector)', short: 'Law 25', items: [
    ['L25-01', 'Person in charge of the protection of personal information designated (by default the CEO); title and contact published', 'Governance', ['ISO22:5.2', 'ISO22:5.34']],
    ['L25-02', 'Governance policies and practices for personal information established, approved and published in clear terms', 'Governance', ['ISO22:5.1', 'ISO22:5.34']],
    ['L25-03', 'Register of confidentiality incidents maintained', 'Incidents', ['ISO22:5.24', 'ISO22:5.27']],
    ['L25-04', 'Incidents assessed for risk of serious injury; Commission d\'accès à l\'information and affected persons notified promptly', 'Incidents', ['ISO22:5.26', 'ISO22:5.5']],
    ['L25-05', 'Privacy impact assessment for every information-system or electronic-service project involving personal information', 'Assessment', ['ISO22:5.8', 'ISO22:5.34']],
    ['L25-06', 'Assessment and written agreement before communicating personal information outside Quebec', 'Transfers', ['ISO22:5.14', 'ISO22:5.20']],
    ['L25-07', 'Highest level of confidentiality by default for technological products and services offered to the public', 'Privacy by default', ['ISO22:8.26', 'ISO22:5.34']],
    ['L25-08', 'Valid consent (manifest, free, enlightened, specific); express consent for sensitive information', 'Consent', ['ISO22:5.34']],
    ['L25-09', 'Transparency at collection: purposes, means, rights, third parties, possible communication outside Quebec', 'Transparency', ['ISO22:5.34']],
    ['L25-10', 'Identification, location or profiling functions disabled by default and disclosed', 'Privacy by default', ['ISO22:8.9', 'ISO22:5.34']],
    ['L25-11', 'Decisions based exclusively on automated processing disclosed; explanation on request', 'Transparency', ['ISO22:5.34']],
    ['L25-12', 'Retention schedule; destruction or anonymization once the purposes are achieved', 'Retention', ['ISO22:5.33', 'ISO22:8.10']],
    ['L25-13', 'Portability: computerized personal information provided in a structured, commonly used format on request', 'Rights', ['ISO22:5.34']],
    ['L25-14', 'Requests for access and rectification answered within the legal time limit; de-indexation requests handled', 'Rights', ['ISO22:5.34']],
    ['L25-15', 'Security measures proportionate to the sensitivity, purpose, quantity, distribution and medium of the information', 'Security', ['ISO22:5.12', 'ISO22:8.24', 'ISO22:8.12']],
    ['L25-16', 'Service providers: written contract specifying the protection measures and the use of the information', 'Third parties', ['ISO22:5.19', 'ISO22:5.20']],
  ] },
  pipeda: { name: 'PIPEDA — fair information principles and breach requirements (federal)', short: 'PIPEDA', items: [
    ['P-01', 'Accountability — a designated individual is accountable for compliance', 'Principles', ['ISO22:5.2']],
    ['P-02', 'Identifying purposes — purposes identified at or before collection', 'Principles', ['ISO22:5.34']],
    ['P-03', 'Consent — knowledge and consent of the individual', 'Principles', ['ISO22:5.34']],
    ['P-04', 'Limiting collection — only what is necessary for the identified purposes', 'Principles', ['ISO22:5.34']],
    ['P-05', 'Limiting use, disclosure and retention', 'Principles', ['ISO22:5.33', 'ISO22:8.10']],
    ['P-06', 'Accuracy — information as accurate, complete and up to date as necessary', 'Principles', ['ISO22:5.34']],
    ['P-07', 'Safeguards — security safeguards appropriate to the sensitivity of the information', 'Principles', ['ISO22:8.24', 'ISO22:5.15', 'ISO22:8.12']],
    ['P-08', 'Openness — policies and practices readily available', 'Principles', ['ISO22:5.1']],
    ['P-09', 'Individual access — access to and amendment of one\'s information', 'Principles', ['ISO22:5.34']],
    ['P-10', 'Challenging compliance — complaint procedure', 'Principles', ['ISO22:5.34']],
    ['P-11', 'Breaches of security safeguards with a real risk of significant harm reported to the OPC and notified to individuals', 'Breaches', ['ISO22:5.26']],
    ['P-12', 'Records of every breach of security safeguards kept for 24 months', 'Breaches', ['ISO22:5.24', 'ISO22:5.28']],
  ] },
};
const STATUS = [['', 'Not assessed'], ['not-started', 'Not implemented'], ['partial', 'Partially implemented'], ['implemented', 'Implemented'], ['na', 'Not applicable']];
const CSTATUS = [['', 'Not assessed'], ['compliant', 'Compliant'], ['partial', 'Partially compliant'], ['non-compliant', 'Non-compliant'], ['na', 'Not applicable']];
const MAT = [0, 1, 2, 3, 4, 5].map(n => [n, `${n} — ${['None', 'Initial', 'Repeatable', 'Defined', 'Managed', 'Optimized'][n]}`]);
const FWS = () => K.frameworkList().filter(f => !['ATTACK-M', 'CRG'].includes(f.id));

let fwSel = null, page = 0;
const flt = { q: '', grp: 'all', status: 'all', gaps: false };

export function soaRow(ws, key) { return (ws.compliance.soa[key] ||= {}); }
export const measuresFor = (ws, key) => (ws.measures || []).filter(m => m.status !== 'rejected' && (m.ctl || []).includes(key));
export function fwStats(ws, fw) {
  const ctl = K.controls().filter(c => c.fw === fw && !c.enh);
  const rows = ctl.map(c => ({ c, r: ws.compliance.soa[c.key] || {} }));
  const app = rows.filter(x => x.r.status !== 'na' && x.r.applicable !== 'no');
  const assessed = app.filter(x => x.r.status);
  const impl = app.filter(x => x.r.status === 'implemented').length, part = app.filter(x => x.r.status === 'partial').length;
  const mats = assessed.filter(x => Number.isFinite(+x.r.maturity) && x.r.maturity !== undefined && x.r.maturity !== '');
  return { total: ctl.length, applicable: app.length, assessed: assessed.length, implemented: impl, partial: part,
    pct: app.length ? (impl + part / 2) / app.length : 0, maturity: mats.length ? mats.reduce((t, x) => t + +x.r.maturity, 0) / mats.length : null,
    target: mats.length ? mats.reduce((t, x) => t + (+(x.r.target ?? 3)), 0) / mats.length : null,
    gaps: app.filter(x => x.r.status && x.r.status !== 'implemented').length };
}

export function render(sec) {
  const ws = S.ws, C = ws.compliance;
  if (!C.frameworks.length) C.frameworks = ['ISO22', 'CSF2'];
  if (!fwSel || !(C.frameworks.includes(fwSel) || CHECKLISTS[fwSel])) fwSel = C.frameworks[0];
  const regs = (ws.org.regulations || []).join(' ').toLowerCase();
  sec.replaceChildren(el('h1', null, 'Compliance'), el('p', 'lede', 'Statements of applicability for the control frameworks the organization follows, with implementation status, maturity against target, owners and evidence; gaps are linked to the mitigation measures and scenarios that close them. Regulatory checklists cover Quebec Law 25 and PIPEDA. Decision support — not legal advice.'));
  // framework chooser
  const chooser = el('div', 'chips');
  for (const f of FWS()) chooser.append(el('label', { class: 'chip', style: { cursor: 'pointer' } }, el('input', { type: 'checkbox', checked: C.frameworks.includes(f.id), style: { width: 'auto', margin: 0 },
    onchange: e => { C.frameworks = e.target.checked ? [...C.frameworks, f.id] : C.frameworks.filter(x => x !== f.id); touch(); render(sec); } }), ' ', f.short));
  sec.append(card(el('h2', { style: { marginTop: 0 } }, 'Frameworks followed'), chooser,
    /law 25|loi 25|private sector/i.test(regs) || /pipeda/i.test(regs) ? el('p', 'note', 'Regulatory checklists applicable from the organization profile: ' + [/law 25|loi 25|private sector/i.test(regs) ? 'Law 25' : null, /pipeda/i.test(regs) ? 'PIPEDA' : null].filter(Boolean).join(', ') + '.') : null));
  // overview
  const ov = C.frameworks.map(id => ({ id, f: K.frameworkList().find(x => x.id === id), s: fwStats(ws, id) })).filter(x => x.f);
  const clist = Object.entries(CHECKLISTS).map(([id, c]) => { const st = C.checklists[id] || {}; const it = c.items.filter(i => st[i[0]]?.status !== 'na'); const ok = it.filter(i => st[i[0]]?.status === 'compliant').length, pt = it.filter(i => st[i[0]]?.status === 'partial').length; return { id, c, pct: it.length ? (ok + pt / 2) / it.length : 0, assessed: c.items.filter(i => st[i[0]]?.status).length }; });
  sec.append(el('div', 'grid g4', ...ov.map(x => el('div', { class: 'kpi' + (fwSel === x.id ? ' sel' : ''), style: { cursor: 'pointer', outline: fwSel === x.id ? '2px solid var(--accent)' : '' }, onclick: () => { fwSel = x.id; page = 0; render(sec); } },
      el('div', 'k', x.f.short), el('div', 'v', Math.round(x.s.pct * 100) + '%'), el('div', 's', `${x.s.assessed}/${x.s.applicable} assessed · maturity ${x.s.maturity === null ? '—' : n1(x.s.maturity)}${x.s.target ? ' / ' + n1(x.s.target) : ''} · ${x.s.gaps} gaps`))),
    ...clist.map(x => el('div', { class: 'kpi', style: { cursor: 'pointer', outline: fwSel === x.id ? '2px solid var(--accent)' : '' }, onclick: () => { fwSel = x.id; render(sec); } },
      el('div', 'k', x.c.short + ' checklist'), el('div', 'v', Math.round(x.pct * 100) + '%'), el('div', 's', `${x.assessed}/${x.c.items.length} assessed`)))));
  const body = el('div'); sec.append(body);
  if (CHECKLISTS[fwSel]) checklist(body, sec, fwSel); else if (fwSel) soa(body, sec, fwSel);
  sec.append(reports(ws));
}

function soa(body, sec, fw) {
  const ws = S.ws, f = K.frameworkList().find(x => x.id === fw);
  const R = compute();
  const resOf = id => R.rows.find(r => r.id === id)?.res || 0;
  const all = K.controls().filter(c => c.fw === fw && (!c.enh || flt.q));
  const groups = [...new Set(all.map(c => c.grp))];
  const q = el('input', { placeholder: 'Search identifier or title', value: flt.q });
  const g = select([['all', 'All groups'], ...groups.map(x => [x, x.length > 60 ? x.slice(0, 58) + '…' : x])], flt.grp);
  const st = select([['all', 'All statuses'], ...STATUS.map(([k, l]) => [k || 'none', l])], flt.status);
  const gp = el('label', { class: 'small', style: { display: 'flex', gap: '6px', alignItems: 'center' } }, el('input', { type: 'checkbox', checked: flt.gaps, style: { width: 'auto' } }), 'Gaps only');
  const shown = all.filter(c => { const r = ws.compliance.soa[c.key] || {};
    return (flt.grp === 'all' || c.grp === flt.grp) && (flt.status === 'all' || (r.status || 'none') === flt.status) && (!flt.gaps || (r.status && !['implemented', 'na'].includes(r.status) && r.applicable !== 'no'))
      && (!flt.q || (c.id + ' ' + c.title).toLowerCase().includes(flt.q.toLowerCase())); });
  const PER = 60, pages = Math.max(1, Math.ceil(shown.length / PER)); page = Math.min(page, pages - 1);
  const rows = shown.slice(page * PER, page * PER + PER);
  const ed = (c, k, opts, num) => { const r = soaRow(ws, c.key); const s = select(opts, r[k] ?? (k === 'target' ? 3 : '')); s.addEventListener('change', () => { r[k] = num ? +s.value : s.value; r.updated = today(); touch(); }); return s; };
  const tx = (c, k, ph) => { const r = soaRow(ws, c.key); const i = el('input', { value: r[k] || '', placeholder: ph }); i.addEventListener('change', () => { r[k] = i.value; r.updated = today(); touch(); }); return i; };
  const t = table([
    { key: 'id', label: 'Control', render: c => el('div', null, el('b', 'mono', c.id), ' ', c.title, el('div', 'small muted', c.grp), c.note ? el('div', 'small', { style: { color: 'var(--warn)' } }, '⚑ ' + c.note) : null) },
    { key: 'app', label: 'Applicable', render: c => ed(c, 'applicable', [['', '—'], ['yes', 'Yes'], ['no', 'No']]) },
    { key: 'status', label: 'Status', render: c => ed(c, 'status', STATUS) },
    { key: 'mat', label: 'Maturity · target', render: c => el('div', 'row mini', { style: { flexWrap: 'nowrap', gap: '4px' } }, ed(c, 'maturity', [['', '—'], ...MAT.map(([n]) => [n, String(n)])], true), ed(c, 'target', MAT.map(([n]) => [n, String(n)]), true)) },
    { key: 'owner', label: 'Owner', render: c => tx(c, 'owner', 'owner') },
    { key: 'ev', label: 'Evidence · justification', render: c => tx(c, 'evidence', 'policy, report, link…') },
    { key: 'm', label: 'Measures · scenarios', render: c => { const ms = measuresFor(ws, c.key); const sc = [...new Set(ms.flatMap(m => m.scen))]; return ms.length ? el('div', 'chips', ...ms.map(m => chip(m.id, { title: m.name + ' — ' + m.status, href: '#/mitigation/' + m.id })), ...sc.slice(0, 6).map(id => chip(id, { href: '#/scenario/' + id })), sc.length > 6 ? el('span', { class: 'more', title: sc.slice(6).join(', ') }, `+${sc.length - 6} scenarios`) : null) : el('span', 'small muted', '—'); } },
  ], rows, { class: 'compact' });
  q.addEventListener('input', debounce(() => { flt.q = q.value; page = 0; render(sec); }, 350));
  for (const [c, k] of [[g, 'grp'], [st, 'status']]) c.addEventListener('change', () => { flt[k] = c.value; page = 0; render(sec); });
  gp.querySelector('input').addEventListener('change', e => { flt.gaps = e.target.checked; page = 0; render(sec); });
  // suggestions from measures
  const fromMeasures = all.filter(c => measuresFor(ws, c.key).some(m => m.status === 'implemented') && (ws.compliance.soa[c.key]?.status || '') !== 'implemented');
  // gaps ranked
  const gaps = all.filter(c => { const r = ws.compliance.soa[c.key]; return r?.status && !['implemented', 'na'].includes(r.status) && r.applicable !== 'no'; })
    .map(c => { const ms = measuresFor(ws, c.key); const sc = [...new Set(ms.flatMap(m => m.scen))]; return { c, ms, sc, res: sc.reduce((t, id) => t + resOf(id), 0) }; }).sort((a, b) => b.res - a.res || a.c.id.localeCompare(b.c.id));
  body.append(card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, `Statement of applicability — ${f.name}`),
      fromMeasures.length ? el('button', { class: 'btn sm ghost', title: 'Controls implemented by measures with status Implemented', onclick: () => { for (const c of fromMeasures) { const r = soaRow(ws, c.key); r.status = 'implemented'; r.evidence ||= 'Implemented by ' + measuresFor(ws, c.key).filter(m => m.status === 'implemented').map(m => m.id).join(', '); r.updated = today(); } touch(); toast(fromMeasures.length + ' control(s) marked implemented'); render(sec); } }, `Mark ${fromMeasures.length} control(s) implemented by measures`) : null,
      el('button', { class: 'btn sm ghost', onclick: () => { for (const c of shown) { const r = soaRow(ws, c.key); if (!r.applicable) r.applicable = 'yes'; } touch(); render(sec); } }, 'Applicable: yes for all shown')),
    el('p', 'note', `${f.origin}. ${f.note}`),
    el('div', 'filterbar', el('div', 'grow', q), el('div', null, g), el('div', null, st), gp, el('div', 'selcount', `${shown.length} controls`)),
    el('div', 'tablewrap', { style: { marginTop: '10px' } }, t),
    pages > 1 ? el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn sm ghost', disabled: page === 0, onclick: () => { page--; render(sec); } }, '← Previous'), el('span', 'small muted', `Page ${page + 1} of ${pages}`), el('button', { class: 'btn sm ghost', disabled: page >= pages - 1, onclick: () => { page++; render(sec); } }, 'Next →')) : null));
  body.append(card(el('h2', { style: { marginTop: 0 } }, `Gaps (${gaps.length})`),
    gaps.length ? el('div', 'tablewrap', table([
      { key: 'id', label: 'Control', render: x => el('span', null, el('b', 'mono', x.c.id), ' ', x.c.title) },
      { key: 'st', label: 'Status', render: x => (STATUS.find(s => s[0] === ws.compliance.soa[x.c.key].status) || [])[1] },
      { key: 'ms', label: 'Measures', render: x => x.ms.length ? x.ms.map(m => m.id + ' (' + m.status + ')').join(', ') : el('span', { style: { color: 'var(--warn)' } }, 'none planned') },
      { key: 'res', label: 'Residual of linked scenarios', num: true, render: x => x.res ? n0(x.res) : '—', sort: x => x.res },
      { key: 'a', label: '', sortable: false, render: x => x.ms.length ? '' : el('button', { class: 'btn sm ghost', onclick: () => { const tag = x.c.tags[0], T = K.TEMPLATES[tag] || {}, Gt = K.TAGS[tag] || {}; const m = K.blankMeasure({ name: x.c.title, fn: x.c.fn, ctl: [x.c.key], tags: [tag], owner: ws.compliance.soa[x.c.key].owner || T.owner || '', rp: Gt.rp ?? 0.2, ri: Gt.ri ?? 0.2, source: 'catalogue', rationale: `Closes compliance gap ${x.c.fwName} ${x.c.id}` }); ws.measures.push(m); touch(); toast(m.id + ' created — link scenarios in Risk mitigation'); render(sec); } }, 'Create measure') },
    ], gaps, { class: 'compact', sortKey: 'res', sortDir: -1 })) : el('p', 'note', 'No gap recorded: a gap is an applicable control assessed as not or partially implemented.'),
    el('p', 'note', 'Gaps are ranked by the residual risk of the scenarios their planned measures address, so the gaps that matter most for the assessed risks come first.')));
}

function checklist(body, sec, id) {
  const ws = S.ws, c = CHECKLISTS[id], st = (ws.compliance.checklists[id] ||= {});
  const ed = (it, k, opts) => { const r = (st[it[0]] ||= {}); const s = select(opts, r[k] || ''); s.addEventListener('change', () => { r[k] = s.value; r.updated = today(); touch(); }); return s; };
  const tx = (it, k, ph, type = 'text') => { const r = (st[it[0]] ||= {}); const i = el('input', { value: r[k] || '', placeholder: ph, type }); i.addEventListener('change', () => { r[k] = i.value; r.updated = today(); touch(); }); return i; };
  body.append(card(el('h2', { style: { marginTop: 0 } }, c.name),
    banner('warn', 'Not legal advice', 'Obligations are summarized for risk-management purposes. Confirm them with the organization\'s legal counsel or privacy officer and the current texts.'),
    el('div', 'tablewrap', table([
      { key: 0, label: 'ID', cls: 'mono', render: it => it[0] }, { key: 1, label: 'Obligation', render: it => el('div', null, it[1], el('div', 'small muted', it[2])) },
      { key: 's', label: 'Status', render: it => ed(it, 'status', CSTATUS) }, { key: 'o', label: 'Owner', render: it => tx(it, 'owner', 'owner') },
      { key: 'e', label: 'Evidence', render: it => tx(it, 'evidence', 'document, register, link') }, { key: 'd', label: 'Due', render: it => tx(it, 'due', '', 'date') },
      { key: 'c', label: 'Related controls', sortable: false, render: it => el('div', 'chips', ...it[3].map(k => { const ct = K.control(k); const r = ws.compliance.soa[k]; return chip(ct ? `${ct.fwName} ${ct.id}` : k, { kind: r?.status === 'implemented' ? '' : 'c', title: (ct?.title || '') + (r?.status ? ' — ' + r.status : '') }); })) },
    ], c.items, { class: 'compact' }))));
}

export function soaReport(ws = S.ws) {
  const L = [`# Compliance report — ${ws.org.name || ws.name}`, '', `Generated ${today()} by ${GENERATOR}. Decision support, not legal advice.`, ''];
  for (const id of ws.compliance.frameworks) {
    const f = K.frameworkList().find(x => x.id === id); if (!f) continue; const s = fwStats(ws, id);
    L.push(`## ${f.name}`, '', `${s.assessed} of ${s.applicable} applicable controls assessed · ${s.implemented} implemented, ${s.partial} partial · implementation ${Math.round(s.pct * 100)}% · average maturity ${s.maturity === null ? '—' : s.maturity.toFixed(1)} (target ${s.target === null ? '—' : s.target.toFixed(1)}) · ${s.gaps} gaps`, '',
      '| Control | Title | Applicable | Status | Maturity | Target | Owner | Evidence | Measures |', '|---|---|---|---|---|---|---|---|---|');
    for (const c of K.controls().filter(x => x.fw === id)) { const r = ws.compliance.soa[c.key]; if (!r || !(r.status || r.applicable)) continue;
      L.push(`| ${c.id} | ${c.title} | ${r.applicable || ''} | ${(STATUS.find(x => x[0] === r.status) || [, ''])[1]} | ${r.maturity ?? ''} | ${r.target ?? ''} | ${r.owner || ''} | ${(r.evidence || '').replace(/\|/g, '/')} | ${measuresFor(ws, c.key).map(m => m.id).join(', ')} |`); }
    L.push('');
  }
  for (const [id, c] of Object.entries(CHECKLISTS)) {
    const st = ws.compliance.checklists[id]; if (!st || !Object.values(st).some(x => x.status)) continue;
    L.push(`## ${c.name}`, '', '| ID | Obligation | Status | Owner | Evidence | Due |', '|---|---|---|---|---|---|');
    for (const it of c.items) { const r = st[it[0]] || {}; L.push(`| ${it[0]} | ${it[1]} | ${(CSTATUS.find(x => x[0] === (r.status || '')) || [, ''])[1]} | ${r.owner || ''} | ${r.evidence || ''} | ${r.due || ''} |`); }
    L.push('');
  }
  return L.join('\n');
}
export function soaRows(ws = S.ws) {
  const out = [];
  for (const id of ws.compliance.frameworks) for (const c of K.controls().filter(x => x.fw === id)) {
    const r = ws.compliance.soa[c.key]; if (!r || !(r.status || r.applicable || r.owner)) continue;
    out.push({ fw: c.fwName, id: c.id, title: c.title, grp: c.grp, applicable: r.applicable || '', status: r.status || '', maturity: r.maturity ?? '', target: r.target ?? '', owner: r.owner || '', evidence: r.evidence || '', measures: measuresFor(ws, c.key).map(m => m.id).join(' '), updated: r.updated || '' });
  }
  for (const [id, c] of Object.entries(CHECKLISTS)) for (const it of c.items) { const r = ws.compliance.checklists[id]?.[it[0]]; if (!r?.status) continue;
    out.push({ fw: c.short, id: it[0], title: it[1], grp: it[2], applicable: r.status === 'na' ? 'no' : 'yes', status: r.status, maturity: '', target: '', owner: r.owner || '', evidence: r.evidence || '', measures: '', updated: r.updated || '' }); }
  return out;
}
function reports(ws) {
  return card(el('h2', { style: { marginTop: 0 } }, 'Reports'), el('div', 'btnrow',
    el('button', { class: 'btn', onclick: () => download(`compliance-report-${today()}.md`, soaReport(ws), 'text/markdown') }, 'Compliance report (.md)'),
    el('button', { class: 'btn ghost', onclick: () => { const r = soaRows(ws); download(`statement-of-applicability-${today()}.csv`, toCSV([Object.keys(r[0] || { fw: 1 }), ...r.map(x => Object.values(x))]), 'text/csv'); } }, 'Statement of applicability (.csv)'),
    el('a', { class: 'btn ghost', href: '#/export' }, 'Excel (Compliance_SoA sheet)…')),
    el('p', 'note', 'Asset-related compliance (inventory, ownership, classification, encryption, EDR, baselines, end of support) is reported in Information assets → Compliance reporting.'));
}
