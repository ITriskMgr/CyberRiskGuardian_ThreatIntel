/* Organization — workspaces, organization profile, crown jewels, risk appetite, context documents.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, $, n0, kpi, banner, card, field, select, chip, download, toast, uid, today, go, copyText, debounce, pill, modal, table } from '../util.js';
import { S, touch, newWorkspace, medibecWorkspace, create, remove, select as selectWs, migrate, docText, setDocText, delDoc, refreshList, saveNow, SCHEMA, emit } from '../state.js';
import { extractText, hints } from '../extract.js';
import * as X from '../extractor.js';
import * as aiui from '../aiui.js';
import * as AI from '../ai.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';
import * as IU from './importui.js';
import * as RESET from '../reset.js';

let tab = 'profile';
export const DOC_CATS = ['Business case', 'Organization profile', 'Asset inventory / CMDB extract', 'Network or architecture notes', 'Policy or standard',
  'Audit or assessment report', 'Incident history', 'Supplier list', 'Vulnerability scan export', 'Financial data', 'Other'];

let auto = null, autoCrown = false, autoImport = false, scrollImport = false;   // extraction to open right after a workspace is created
export function render(sec, arg) {
  if (arg === 'new') tab = 'workspaces';
  else if (['profile', 'crown', 'docs', 'workspaces', 'class', 'evidence'].includes(arg)) tab = arg;
  else if (arg === 'import') tab = 'workspaces';
  const ws = S.ws;
  sec.replaceChildren(
    el('h1', null, 'Organization'),
    el('p', 'lede', 'Configure the organization being assessed — a real company or a classroom business case. Everything entered or uploaded here stays in this browser on this computer; nothing is transmitted.'),
  );
  if (ws.kind === 'example') sec.append(banner('warn', 'Teaching example', 'This workspace holds the fictional MediBec case. Create a new workspace to assess another organization or a different business case.'));
  if (ws.kind === 'classroom') sec.append(banner('good', ws.classroom?.educational ? 'Educational case used for training purposes' : 'Classroom case', 'Data in this workspace describes a business case for teaching. Deliverables are labelled fictional.'));

  const tabs = [['profile', 'Profile & appetite'], ['crown', 'Crown jewels'], ['docs', `Context documents (${ws.docs.length})`], ['evidence', 'Evidence'], ['workspaces', 'Workspaces']];
  if (ws.kind === 'classroom') tabs.splice(1, 0, ['class', 'Classroom']);
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of tabs) st.append(el('button', { role: 'tab', 'aria-selected': String(tab === k), onclick: () => { if (!leaveProfile()) return; tab = k; go('org/' + k); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ profile, crown, docs, workspaces, class: classroom, evidence: IU.evidence }[tab] || profile)(body, arg, sec);
}

/* ---------------- profile (1.5.2: edit a draft, Save / Cancel, extraction with provenance) ---------------- */
let D = null;              // the draft being edited: { wsId, name, org, assessment: {PERIOD, APPETITE, FACTOR, CURRENCY}, budget, appetite_rationale }
let dirty = false;
const clone = x => JSON.parse(JSON.stringify(x));
function newDraft(ws) {
  return { wsId: ws.id, name: ws.name, org: clone(ws.org), appetite_rationale: ws.appetite_rationale || '',
    assessment: { PERIOD: ws.assessment.PERIOD, APPETITE: ws.assessment.APPETITE, FACTOR: ws.assessment.FACTOR, CURRENCY: ws.assessment.CURRENCY },
    budget: clone(ws.budget || {}) };
}
/** Leaving the profile with unsaved changes asks first (also used by the router). */
export function leaveProfile() {
  if (!dirty) return true;
  if (!window.confirm(tr('The profile has unsaved changes. Leave without saving?'))) return false;
  dirty = false; D = null; return true;
}
export const isDirty = () => dirty;
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

function saveDraft() {
  const ws = S.ws; if (!D || D.wsId !== ws.id) return;
  ws.name = D.name; ws.org = D.org; ws.appetite_rationale = D.appetite_rationale;
  Object.assign(ws.assessment, D.assessment);
  Object.assign(ws.budget, D.budget);
  dirty = false; users.audit('profile saved', ws.name, ws);
  touch('redraw'); emit('change'); toast(tr('Profile saved'));
}

function bindInput(obj, key, attrs = {}, after) {
  const tag = attrs.rows ? 'textarea' : 'input';
  const n = el(tag, Object.assign({ value: obj[key] ?? '' }, attrs));
  if (tag === 'textarea') n.value = obj[key] ?? '';
  n.addEventListener('input', () => { obj[key] = attrs.type === 'number' ? (n.value === '' ? '' : Number(n.value)) : n.value; (attrs.onDirty || touch)(); after?.(); });
  return n;
}
function provChip(k) {
  const p = D?.org?.prov?.[k];
  if (!p) return null;
  return el('span', { class: 'pill tag-' + p.tag + ' ' + (X.TAG_KIND[p.tag] || ''), title: `${X.TAG_HELP[p.tag] || ''}${p.source ? ' — ' + p.source : ''}${p.edited ? ' (edited)' : ''} · ${p.method || ''} ${p.date || ''}` }, p.tag + (p.edited ? '*' : ''));
}

function profile(body, arg, sec) {
  const ws = S.ws;
  if (!D || D.wsId !== ws.id || !dirty) { D = newDraft(ws); dirty = false; }
  const o = D.org, a = D.assessment, b = D.budget;
  const bar = el('div', 'savebar');
  const markDirty = () => { if (!dirty) { dirty = true; drawBar(); } };
  const drawBar = () => bar.replaceChildren(
    el('span', { class: 'small ' + (dirty ? '' : 'muted'), style: { flex: 1 } }, dirty ? tr('Unsaved changes') : tr('All changes saved')),
    el('button', { class: 'btn', disabled: !dirty, onclick: saveDraft }, 'Save'),
    el('button', { class: 'btn ghost', disabled: !dirty, onclick: () => { D = null; dirty = false; render(sec); toast(tr('Changes discarded')); } }, 'Cancel'),
    el('button', { class: 'btn ghost', onclick: () => extractProfile(sec) }, 'Extract from documents…'));
  drawBar();
  const B = (obj, key, attrs = {}) => bindInput(obj, key, Object.assign({ onDirty: markDirty }, attrs));
  const F = (label, input, hint, k) => { const f = field(label, input, hint); const c = k && provChip(k); if (c) f.querySelector('label').append(' ', c); return f; };
  body.append(bar);
  if (o.prov && Object.keys(o.prov).length) body.append(el('div', 'legend', { style: { margin: '0 0 10px' } }, el('span', null, 'Provenance:'),
    ...X.TAGS.map(t => el('span', { title: X.TAG_HELP[t] }, el('span', { class: 'pill tag-' + t + ' ' + X.TAG_KIND[t] }, t), ' ' + X.TAG_HELP[t])), el('span', null, '* edited after extraction')));
  body.append(card(el('h2', null, 'Identification'), el('div', 'grid g3',
    F('<b>Workspace name</b>', B(D, 'name')),
    F('<b>Organization name</b>', B(o, 'name'), null, 'name'),
    F('<b>Sector / industry</b>', B(o, 'sector', { list: 'sector-list' }), null, 'sector'),
    F('Size', B(o, 'size', { placeholder: 'e.g. 450 employees, 10 sites' }), null, 'size'),
    F('Region / jurisdiction', B(o, 'region'), null, 'region'),
    F('Assessment period', B(a, 'PERIOD')),
  ), el('datalist', { id: 'sector-list' }, ...['Healthcare', 'Financial services', 'Insurance', 'Higher education', 'Manufacturing', 'Retail / e-commerce',
    'Public sector', 'Energy / utilities', 'Technology / SaaS', 'Professional services', 'Transportation and logistics', 'Non-profit'].map(x => el('option', { value: x })))));

  body.append(card(el('h2', null, 'Context'), el('div', 'grid g2',
    el('div', { style: { gridColumn: '1 / -1' } }, F('<b>Context</b>', B(o, 'context', { rows: 3, placeholder: 'What the organization is, where it operates, what is changing — the background of the assessment' }), null, 'context')),
    F('<b>Mission</b>', B(o, 'mission', { rows: 3 }), null, 'mission'),
    F('Products and services', B(o, 'services', { rows: 3 }), null, 'services'),
    F('Critical business processes', B(o, 'processes', { rows: 3 }), null, 'processes'),
    F('Critical systems and applications', B(o, 'systems', { rows: 3 }), null, 'systems'),
    F('Cloud environments', B(o, 'cloud', { rows: 2 }), null, 'cloud'),
    F('Key suppliers and partners', B(o, 'suppliers', { rows: 2 }), null, 'suppliers'),
    F('Sensitive information', B(o, 'sensitive', { rows: 2 }), null, 'sensitive'),
    F('Availability and continuity requirements', B(o, 'availability', { rows: 2 }), null, 'availability'),
    F('Existing controls and maturity', B(o, 'maturity', { rows: 3 }), null, 'maturity'),
    F('Incident history', B(o, 'incidents', { rows: 3 }), null, 'incidents'),
  )));

  const regs = el('div', 'chips');
  const drawRegs = () => regs.replaceChildren(...o.regulations.map((r, i) => chip(r, { onRemove: () => { o.regulations.splice(i, 1); markDirty(); drawRegs(); } })));
  drawRegs();
  const regIn = el('input', { placeholder: 'Add a law, regulation or standard and press Enter', list: 'reg-list' });
  regIn.addEventListener('keydown', e => { if (e.key === 'Enter' && regIn.value.trim()) { o.regulations.push(regIn.value.trim()); regIn.value = ''; markDirty(); drawRegs(); } });
  const rh = el('h2', null, 'Legal and regulatory obligations'); const rc = provChip('regulations'); if (rc) rh.append(' ', rc);
  body.append(card(rh, regs, el('div', { style: { marginTop: '8px' } }, regIn),
    el('datalist', { id: 'reg-list' }, ...['Quebec Law 25', 'PIPEDA', 'PHIPA (Ontario)', 'GDPR', 'HIPAA', 'PCI DSS', 'SOX', 'NIS2', 'DORA', 'OSFI B-13', 'ISO/IEC 27001', 'NIST CSF 2.0', 'SOC 2'].map(x => el('option', { value: x })))));

  // appetite + budget
  const appIn = B(a, 'APPETITE', { type: 'number', step: 0.05, min: 0.1, max: 0.9 });
  const factorIn = B(a, 'FACTOR', { type: 'number', step: 100, min: 1 });
  body.append(card(el('h2', null, 'Risk appetite and budget'), el('div', 'grid g4',
    F('<b>Risk appetite</b> (0.1–0.9)', appIn, '0.1–0.2 very risk-averse · 0.3 low · 0.5 neutral · 0.7 high · 0.8–0.9 very high', 'appetite'),
    F('Multiplication factor', factorIn, 'Constant across scenarios (default 1,000)'),
    F('Currency', B(a, 'CURRENCY'), null, 'currency'),
    F('<b>Total IT budget</b> (incl. salaries)', B(b, 'it_budget', { type: 'number', step: 100000 }), null, 'it_budget'),
    F('Cybersecurity budget (current spend)', B(b, 'spend', { type: 'number', step: 10000 }), 'Everything spent on cybersecurity this year: staff, tools, services, projects', 'spend'),
    F('Baseline (run) security cost', B(b, 'baseline', { type: 'number', step: 10000 }), 'The part of that spend needed just to keep existing security running: salaries of the current security staff, licence renewals, existing managed services, maintenance. It covers no new treatment.', 'baseline'),
  ), F('Appetite rationale', B(D, 'appetite_rationale', { rows: 2, placeholder: 'Why this value — industry, sensitivity, regulation, impact on individuals, financial capacity…' }), null, 'appetite_rationale'),
  appetiteHelper(a, appIn, markDirty)));
  if (auto === 'profile') { auto = null; const c = autoCrown; autoCrown = false; setTimeout(() => extractProfile(sec, { chain: c }), 50); }
}

/* ---------------- extraction dialogs ---------------- */
async function chooseMethod(title, intro, task) {
  const st = await aiui.status(S.ws, task);
  return new Promise(resolve => {
    const web = el('input', { type: 'checkbox', checked: st.web, disabled: !st.web, style: { width: 'auto' } });
    const m = modal(title,
      el('p', 'note', intro),
      st.ok ? null : banner('warn', 'AI not available', st.why + ' ' + tr('The rules-only method works offline.')),
      el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)' } }, web,
        st.web ? tr('Search the web for missing information (Claude provider) — tagged EXTERNAL with the page cited') : tr('Web search needs the Claude provider; with a local model missing items stay ASSUMPTION or UNKNOWN')),
      el('div', 'btnrow', { style: { marginTop: '12px' } },
        el('button', { class: 'btn', disabled: !st.ok, onclick: () => { resolve({ method: 'ai', web: web.checked && st.web }); m.close(); } }, 'Use AI (preview before sending)'),
        el('button', { class: 'btn ghost', onclick: () => { resolve({ method: 'rules' }); m.close(); } }, 'Rules only (no AI, offline)'),
        el('button', { class: 'btn ghost', onclick: () => { m.close(); resolve(null); } }, 'Cancel')));
    m.back.onclose = () => resolve(null);
  });
}

export async function extractProfile(sec, { chain = false } = {}) {
  const ws = S.ws;
  if (!ws.docs.length) { toast(tr('Add context documents first (Context documents tab).'), 'bad'); return; }
  const ch = await chooseMethod(tr('Extract the profile from the documents'), tr('Proposes every field of Profile & appetite from the context documents, each tagged FACT, INFERENCE, ASSUMPTION, EXTERNAL or UNKNOWN with its source. You accept or edit each value; nothing is saved until you click Save.'), 'extract_profile');
  if (!ch) return chain && extractCrown(sec);
  let res;
  try {
    if (ch.method === 'rules') res = await X.byRules(ws);
    else {
      const cp = await X.corpus(ws);
      const out = await aiui.request('extract_profile', { text: cp.text, web: ch.web, fictional: ws.kind !== 'organization' }, { title: tr('Profile extraction — what will be sent') });
      if (!out) return chain && extractCrown(sec);
      res = X.parseProfile(out.text); res.method = 'ai'; res.model = out.model; res.sources = out.sources; res.entryId = out.entryId;
    }
  } catch (e) { toast(tr('Extraction failed: ') + (e.message || e), 'bad'); return; }
  reviewProfile(sec, res, chain);
}

function reviewProfile(sec, res, chain) {
  const ws = S.ws;
  if (!D || D.wsId !== ws.id) D = newDraft(ws);
  const rows = X.FIELDS.map(([k, l]) => {
    const p = res.fields[k], cur = X.getField(D, k);
    return { k, l, p, cur, take: p.tag !== 'UNKNOWN' && (X.isEmpty(cur) || (['appetite', 'currency'].includes(k) && !D.org.prov?.[k] && !D.appetite_rationale)), val: Array.isArray(p.value) ? p.value.join('; ') : p.value };
  });
  const fmt = v => Array.isArray(v) ? v.join('; ') : (v ?? '');
  const t = table([
    { key: 'take', label: '', sortable: false, cls: 'cb', render: r => { const c = el('input', { type: 'checkbox', checked: r.take, disabled: r.p.tag === 'UNKNOWN' && !r.val }); c.addEventListener('change', () => { r.take = c.checked; }); return c; } },
    { key: 'l', label: 'Field', render: r => el('b', null, tr(r.l)) },
    { key: 'cur', label: 'Current value', render: r => el('div', { class: 'small', 'data-noi18n': '' }, String(fmt(r.cur)).slice(0, 160) || '—') },
    { key: 'val', label: 'Proposed value (editable)', sortable: false, render: r => { const i = el(String(r.val).length > 60 ? 'textarea' : 'input', { value: r.val, rows: 2 }); if (i.tagName === 'TEXTAREA') i.value = r.val; i.addEventListener('input', () => { r.val = i.value; r.edited = true; if (i.value.trim()) { r.take = true; } }); return i; } },
    { key: 'tag', label: 'Tag', render: r => el('span', { class: 'pill tag-' + r.p.tag + ' ' + X.TAG_KIND[r.p.tag], title: X.TAG_HELP[r.p.tag] }, r.p.tag) },
    { key: 'src', label: 'Source', render: r => el('div', { class: 'small', 'data-noi18n': '' }, /^https?:/.test(r.p.source) ? el('a', { href: r.p.source, target: '_blank', rel: 'noopener noreferrer' }, r.p.source.slice(0, 80)) : r.p.source || '—', r.p.notes.length ? el('div', 'muted', r.p.notes.join('; ')) : null) },
  ], rows, { class: 'compact' });
  const counts = Object.fromEntries(X.TAGS.map(tg => [tg, rows.filter(r => r.p.tag === tg).length]));
  const m = modal(tr('Review the extracted profile'),
    el('p', 'note', tr(res.method === 'ai' ? 'Proposed by AI' : 'Proposed by rules (no AI)') + (res.model ? ' · ' + res.model : '') + ' — ' + tr('Analytical estimate — validation required.') + ' ' + tr('Ticked values go into the form; you then Save or Cancel.')),
    el('div', 'chips', ...X.TAGS.map(tg => el('span', { class: 'pill tag-' + tg + ' ' + X.TAG_KIND[tg], title: X.TAG_HELP[tg] }, `${tg} ${counts[tg]}`))),
    el('div', 'tablewrap', { style: { marginTop: '10px', maxHeight: '55vh', overflow: 'auto' } }, t),
    res.gaps?.length ? el('details', null, el('summary', null, tr('Information still to collect') + ` (${res.gaps.length})`), el('ul', { class: 'small', 'data-noi18n': '' }, ...res.gaps.map(g => el('li', null, g)))) : null,
    res.sources?.length ? el('details', null, el('summary', null, tr('Web pages consulted') + ` (${res.sources.length})`), el('ul', 'small', ...res.sources.map(s => el('li', null, el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.title || s.url))))) : null,
    el('div', 'btnrow', { style: { marginTop: '12px' } },
      el('button', { class: 'btn', onclick: () => {
        let n = 0; D.org.prov ||= {};
        for (const r of rows) if (r.take) {
          const nv = X.normalize(r.k, { value: X.FIELDS.find(f => f[0] === r.k)[2] === 'list' ? r.val.split(/\s*;\s*/) : r.val, tag: r.p.tag, source: r.p.source, confidence: r.p.confidence });
          X.setField(D, r.k, nv.value);
          D.org.prov[r.k] = { tag: nv.tag, source: r.p.source, confidence: r.p.confidence, method: res.method === 'ai' ? 'AI' + (res.model ? ' ' + res.model : '') : 'rules', date: today(), edited: !!r.edited };
          n++;
        }
        for (const r of rows) if (!r.take && r.p.tag === 'UNKNOWN' && X.isEmpty(r.cur)) D.org.prov[r.k] = { tag: 'UNKNOWN', source: 'Not found in the documents', method: res.method, date: today() };
        if (res.entryId) AI.decide(res.entryId, n ? 'accepted' : 'rejected', `${n} field(s) taken into the profile form`);
        dirty = true; m.close(); tab = 'profile'; render(sec);
        toast(n + ' ' + tr('field(s) filled — review and Save'));
        if (chain) setTimeout(() => extractCrown(sec), 300);
      } }, 'Put ticked values in the form'),
      el('button', { class: 'btn ghost', onclick: () => { m.close(); if (res.entryId) AI.decide(res.entryId, 'rejected', 'review cancelled'); if (chain) extractCrown(sec); } }, 'Cancel')));
}

function toImport() { if (autoImport) { autoImport = false; scrollImport = true; tab = 'workspaces'; go('org/workspaces'); } }
export async function extractCrown(sec) {
  const ws = S.ws;
  if (!ws.docs.length) { toast(tr('Add context documents first (Context documents tab).'), 'bad'); return; }
  const ch = await chooseMethod(tr('Extract crown jewels from the documents'), tr('Proposes the assets, services, data and processes whose loss would most harm the mission, with their C/I/A importance, dependencies and suppliers. You choose which to add.'), 'extract_crown');
  if (!ch) return toImport();
  let list, meta = {};
  try {
    if (ch.method === 'rules') list = await X.crownByRules(ws);
    else {
      const cp = await X.corpus(ws);
      const out = await aiui.request('extract_crown', { text: cp.text, profile: X.brief(ws) }, { title: tr('Crown-jewel extraction — what will be sent') });
      if (!out) return toImport();
      list = X.parseCrown(out.text); meta = { model: out.model, entryId: out.entryId };
    }
  } catch (e) { toast(tr('Extraction failed: ') + (e.message || e), 'bad'); return; }
  const A = ws.assessment;
  const exists = n => (A.CROWN || []).some(r => (r[1] || '').toLowerCase() === n.toLowerCase());
  const rows = list.map(r => Object.assign(r, { take: !exists(r.name) }));
  const m = modal(tr('Review the proposed crown jewels'),
    el('p', 'note', tr(ch.method === 'ai' ? 'Proposed by AI' : 'Proposed by rules (no AI)') + (meta.model ? ' · ' + meta.model : '') + ' — ' + tr('Analytical estimate — validation required.')),
    rows.length ? el('div', 'tablewrap', { style: { maxHeight: '55vh', overflow: 'auto' } }, table([
      { key: 'take', label: '', sortable: false, cls: 'cb', render: r => { const c = el('input', { type: 'checkbox', checked: r.take }); c.addEventListener('change', () => { r.take = c.checked; }); return c; } },
      { key: 'name', label: 'Asset / service', render: r => el('div', { 'data-noi18n': '' }, el('b', null, r.name), exists(r.name) ? el('div', 'small muted', tr('already in the list')) : null) },
      { key: 'role', label: 'Role in the mission', render: r => el('div', { class: 'small', 'data-noi18n': '' }, r.role || '—') },
      { key: 'cia', label: 'C · I · A', render: r => [r.c, r.i, r.a].map(x => x || '—').join(' · ') },
      { key: 'dep', label: 'Dependencies · suppliers', render: r => el('div', { class: 'small', 'data-noi18n': '' }, [r.dependencies, r.suppliers].filter(Boolean).join(' · ') || '—') },
      { key: 'tag', label: 'Tag', render: r => el('span', { class: 'pill tag-' + r.tag + ' ' + X.TAG_KIND[r.tag], title: (X.TAG_HELP[r.tag] || '') + (r.source ? ' — ' + r.source : '') }, r.tag) },
    ], rows, { class: 'compact' })) : el('div', 'empty-state', el('b', null, 'Nothing found'), 'No crown-jewel candidate in the documents.'),
    el('div', 'btnrow', { style: { marginTop: '12px' } },
      el('button', { class: 'btn', disabled: !rows.length, onclick: () => {
        let n = 0; ws.crownProv ||= {};
        for (const r of rows) if (r.take && !exists(r.name)) {
          A.CROWN.push(['CJ' + (A.CROWN.length + 1), r.name, r.role, r.owner, r.c, r.i, r.a, r.dependencies, r.suppliers]);
          ws.crownProv[r.name] = { tag: r.tag, source: r.source, method: ch.method === 'ai' ? 'AI' : 'rules', date: today() }; n++;
        }
        if (meta.entryId) AI.decide(meta.entryId, n ? 'accepted' : 'rejected', `${n} crown jewel(s) added`);
        touch(); m.close(); toast(n + ' ' + tr('crown jewel(s) added')); if (autoImport) { autoImport = false; scrollImport = true; tab = 'workspaces'; go('org/workspaces'); } else { tab = 'crown'; go('org/crown'); }
      } }, 'Add ticked crown jewels'),
      el('button', { class: 'btn ghost', onclick: () => { m.close(); if (meta.entryId) AI.decide(meta.entryId, 'rejected', 'cancelled'); if (autoImport) { autoImport = false; scrollImport = true; tab = 'workspaces'; go('org/workspaces'); } } }, 'Cancel')));
}

function appetiteHelper(a, appIn, markDirty = touch) {
  const F = [
    ['Regulated personal, health or financial information', -0.1], ['Potential harm to the safety or wellbeing of individuals', -0.1],
    ['High dependence on technology for core operations', -0.05], ['Low tolerance for operational disruption', -0.05],
    ['Limited financial capacity to absorb losses', -0.05], ['Strong reputational exposure (public brand, trust-based)', -0.05],
    ['Innovation or growth strategy that accepts more risk', +0.1], ['Mature, tested resilience (backups, IR, BCP)', +0.05],
  ];
  const d = el('details', 'card'); d.style.marginTop = '12px';
  d.append(el('summary', null, 'Appetite estimator (when management has not approved a value)'));
  const boxes = F.map(([t, w]) => { const c = el('input', { type: 'checkbox' }); return [c, t, w]; });
  const out = el('div', 'note');
  const calc = () => {
    const v = Math.max(0.1, Math.min(0.9, 0.5 + boxes.reduce((s, [c, , w]) => s + (c.checked ? w : 0), 0)));
    out.replaceChildren(el('b', null, 'Suggested appetite ' + v.toFixed(2) + ' '), el('span', 'label-est', 'Analytical estimate — validation required.'),
      ' ', el('button', { class: 'btn sm ghost', onclick: () => { a.APPETITE = Number(v.toFixed(2)); appIn.value = a.APPETITE; markDirty(); toast('Appetite set to ' + a.APPETITE); } }, 'Use this value'));
  };
  for (const [c] of boxes) c.addEventListener('change', calc);
  d.append(el('div', 'grid g2', ...boxes.map(([c, t, w]) => el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)', fontSize: '13px' } }, c, t, el('span', 'muted', ` (${w > 0 ? '+' : ''}${w})`)))), out);
  calc();
  return d;
}

/* ---------------- crown jewels ---------------- */
const CJ_COLS = ['ID', 'Asset / service', 'Role in the mission', 'Owner', 'Confidentiality', 'Integrity', 'Availability', 'Dependencies', 'Suppliers'];
function crown(body, arg, sec) {
  const a = S.ws.assessment, prov = S.ws.crownProv || {};
  const LV = ['', 'Low', 'Medium', 'High', 'Very high'];
  const t = el('table', 'grid compact');
  const draw = () => {
    t.replaceChildren(el('thead', null, el('tr', null, ...CJ_COLS.map(c => el('th', null, c)), el('th', null, 'Provenance'), el('th'))));
    const tb = el('tbody');
    a.CROWN.forEach((r, i) => {
      const tr = el('tr');
      CJ_COLS.forEach((c, j) => {
        let inp;
        if (j >= 4 && j <= 6) inp = select(LV, r[j] || '');
        else inp = el(j === 2 || j >= 7 ? 'textarea' : 'input', { value: r[j] || '' });
        if (inp.tagName === 'TEXTAREA') inp.value = r[j] || '';
        inp.addEventListener(inp.tagName === 'SELECT' ? 'change' : 'input', () => { r[j] = inp.value; touch(); });
        tr.append(el('td', null, inp));
      });
      const pv = prov[r[1]];
      tr.append(el('td', null, pv ? el('span', { class: 'pill tag-' + pv.tag + ' ' + (X.TAG_KIND[pv.tag] || ''), title: (X.TAG_HELP[pv.tag] || '') + (pv.source ? ' — ' + pv.source : '') + ' · ' + (pv.method || '') }, pv.tag) : el('span', 'small muted', 'analyst')));
      tr.append(el('td', null, el('button', { class: 'btn sm ghost danger', onclick: () => { a.CROWN.splice(i, 1); touch(); draw(); } }, 'Remove')));
      tb.append(tr);
    });
    t.append(tb);
  };
  draw();
  body.append(card(el('h2', null, 'Crown-jewel assets and services'),
    el('p', 'note', 'The assets, services and processes whose loss would most harm the mission, and what they depend on. Scenarios reference these in their affected-asset field.'),
    el('div', 'tablewrap', t),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: () => { a.CROWN.push(['CJ' + (a.CROWN.length + 1), '', '', '', '', '', '', '', '']); touch(); draw(); } }, 'Add crown jewel'),
      el('button', { class: 'btn ghost', onclick: () => extractCrown(sec) }, 'Extract from documents…'),
      el('button', { class: 'btn ghost', onclick: () => go('assets') }, 'Information assets…'))));
  if (auto === 'crown') { auto = null; setTimeout(() => extractCrown(sec), 50); }
}

/* ---------------- classroom ---------------- */
function classroom(body, arg, sec) {
  const c = S.ws.classroom || (S.ws.classroom = {});
  const edu = el('input', { type: 'checkbox', checked: !!c.educational, style: { width: 'auto' } });
  edu.addEventListener('change', () => { c.educational = edu.checked; touch(); render(sec); });
  body.append(card(el('h2', null, 'Classroom setting'),
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--ink)', marginBottom: '12px' } }, edu,
      el('span', null, el('b', null, 'Educational case used for training purposes'), el('div', 'small muted', 'The organization is fictional or adapted for teaching: every deliverable is labelled accordingly, AI extraction uses web search only for sector benchmarks, and the case may be shared with students.'))),
    el('div', 'grid g3',
    field('<b>Course</b>', bindInput(c, 'course', { placeholder: 'e.g. BTM 387 Digital Business Development' })),
    field('<b>Business case title</b>', bindInput(c, 'case_title')),
    field('Team', bindInput(c, 'team')),
    field('Team members', bindInput(c, 'members', { rows: 2 })),
    field('Instructor', bindInput(c, 'instructor')),
    field('Due date', bindInput(c, 'due', { type: 'date' })),
  ), field('Assignment notes', bindInput(c, 'notes', { rows: 4 })),
  el('p', 'note', 'Upload the business case under Context documents. The scenario register, calculator and Excel export work exactly as for a real organization; deliverables carry the case title and team.')));
}

/* ---------------- documents ---------------- */
function docs(body) {
  const ws = S.ws;
  const fileIn = el('input', { type: 'file', multiple: true, accept: '.docx,.xlsx,.xlsm,.pptx,.pdf,.txt,.md,.csv,.tsv,.json,.html,.htm', style: { display: 'none' } });
  const drop = el('div', 'drop', el('b', null, 'Drop documents here'), el('div', 'small', 'or '),
    el('button', { class: 'btn sm', onclick: () => fileIn.click() }, 'Choose files…'),
    el('div', 'small', { style: { marginTop: '8px' } }, 'Business case, organization profile, asset inventory, audit report, incident history, scanner export… Word, Excel, PowerPoint, PDF, text, Markdown, CSV, JSON.'));
  const status = el('div');
  const handle = async files => {
    const prog = el('div'); status.replaceChildren(prog);
    const res = await addDocs(ws, files, prog);
    if (!res.some(r => r.state !== 'good')) status.replaceChildren();
    draw();
  };
  fileIn.addEventListener('change', () => handle([...fileIn.files]));
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); handle([...e.dataTransfer.files]); });

  const noteBtn = el('button', { class: 'btn ghost sm', onclick: async () => {
    const id = uid('doc'); await setDocText(id, '');
    ws.docs.push({ id, name: 'Analyst note ' + (ws.docs.length + 1), size: 0, type: 'note', added: today(), category: 'Other', chars: 0, words: 0, quality: 'empty', excerpt: '' });
    touch(); draw(); openDoc(ws.docs[ws.docs.length - 1]);
  } }, 'Add a typed note');

  const list = el('div'), viewer = el('div'), hintBox = el('div');
  const draw = () => {
    list.replaceChildren();
    if (!ws.docs.length) list.append(el('div', 'empty-state', el('b', null, 'No context documents yet'), 'Upload the business case or company data to give the assessment its evidence base.'));
    for (const d of ws.docs) {
      const cat = select(DOC_CATS, d.category); cat.addEventListener('change', () => { d.category = cat.value; touch(); });
      list.append(el('div', 'docrow',
        el('div', null, el('b', null, d.name), ' ', pill(d.quality === 'good' ? 'text extracted' : d.quality === 'poor' ? 'poor extraction' : d.type === 'note' ? 'note' : 'no text', d.quality === 'good' ? 'good' : 'warn'),
          el('div', 'small muted', `${d.type.toUpperCase()} · ${n0(d.words)} words · added ${d.added}`),
          el('div', { style: { maxWidth: '320px', marginTop: '6px' } }, cat)),
        el('div', 'btnrow', el('button', { class: 'btn sm ghost', onclick: () => openDoc(d) }, 'View / edit text'),
          el('button', { class: 'btn sm ghost danger', onclick: async () => { if (!confirmDel(d.name)) return; await delDoc(d.id); ws.docs.splice(ws.docs.indexOf(d), 1); touch(); viewer.replaceChildren(); draw(); } }, 'Remove'))));
    }
    drawHints();
  };
  const openDoc = async d => {
    const txt = await docText(d.id);
    const ta = el('textarea', { rows: 16, style: { minHeight: '320px' } }); ta.value = txt;
    const name = el('input', { value: d.name });
    viewer.replaceChildren(card(el('h2', null, 'Document text'), field('Name', name), field('Extracted text — correct or annotate it; this is what the context pack carries', ta),
      el('div', 'btnrow', { style: { marginTop: '10px' } },
        el('button', { class: 'btn', onclick: async () => { d.name = name.value; await setDocText(d.id, ta.value); d.chars = ta.value.length; d.words = (ta.value.match(/\S+/g) || []).length; d.excerpt = ta.value.slice(0, 400); d.quality = ta.value.trim() ? 'good' : 'empty'; touch(); draw(); toast('Saved'); } }, 'Save text'),
        el('button', { class: 'btn ghost', onclick: () => viewer.replaceChildren() }, 'Close'))));
    viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const drawHints = async () => {
    let all = '';
    for (const d of ws.docs) all += '\n' + await docText(d.id);
    const h = hints(all);
    hintBox.replaceChildren();
    if (!ws.docs.length) return;
    const row = (label, items, onAdd, addLabel) => items.length ? el('div', { style: { margin: '8px 0' } }, el('div', 'small muted', label),
      el('div', 'chips', ...items.map(x => chip(x))), onAdd ? el('button', { class: 'btn sm ghost', style: { marginTop: '6px' }, onclick: onAdd }, addLabel) : null) : null;
    const o = ws.org;
    hintBox.append(card(el('h2', null, 'Context hints from the documents'),
      el('p', 'note', 'A keyword scan of the extracted text — not an interpretation. Review each item before adding it; documented facts and assumptions stay distinct.'),
      row('Sector signals', h.sectors, !o.sector && h.sectors[0] ? () => { o.sector = h.sectors[0]; touch(); toast('Sector set'); } : null, 'Set sector to ' + (h.sectors[0] || '')),
      row('Laws, regulations and standards mentioned', h.regulations, () => { for (const r of h.regulations) if (!o.regulations.includes(r)) o.regulations.push(r); touch(); toast('Added to obligations'); }, 'Add to obligations'),
      row('Technologies mentioned', h.technologies, () => { o.systems = [o.systems, 'Mentioned in documents: ' + h.technologies.join(', ')].filter(Boolean).join('\n'); touch(); toast('Appended to systems'); }, 'Append to critical systems'),
      row('Candidate crown jewels', h.crown, () => { const a = S.ws.assessment; for (const c of h.crown) if (!a.CROWN.some(r => (r[1] || '').toLowerCase() === c.toLowerCase())) a.CROWN.push(['CJ' + (a.CROWN.length + 1), c, 'Mentioned in context documents — validate', '', '', '', '', '', '']); touch(); toast('Added to crown jewels'); }, 'Add as crown-jewel candidates'),
      row('CVE identifiers found', h.cves, () => { let n = 0; for (const c of h.cves) if (!ws.vulns.some(v => v.id === c)) { ws.vulns.push({ id: c, kind: 'CVE', title: '', product: '', asset: '', exposed: false, source: 'Context document', added: today(), notes: 'Found in an uploaded document — confirm exposure' }); n++; } touch(); toast(n + ' added to the vulnerability register'); }, 'Add to vulnerability register (unconfirmed)'),
      row('Monetary amounts (for budget fields)', h.money),
    ));
  };
  draw();
  body.append(card(drop, fileIn, status, el('div', 'btnrow', { style: { marginTop: '10px' } }, noteBtn,
    el('button', { class: 'btn ghost sm', onclick: () => go('export') }, 'Export context pack for the Claude agent'))),
    el('div', 'cols2', card(el('h2', null, 'Documents'), list), el('div', null, hintBox)), viewer);
}
/** Read several files locally and add them to a workspace, with a per-file progress list. */
export async function addDocs(ws, files, box) {
  const rows = files.map(f => ({ f, li: el('li', null, f.name + ' — waiting'), state: 'waiting' }));
  if (box) box.replaceChildren(el('div', 'small', el('b', null, `Reading ${files.length} document${files.length > 1 ? 's' : ''} on this computer`), el('ul', null, ...rows.map(r => r.li))));
  for (const r of rows) {
    r.li.textContent = r.f.name + ' — reading…';
    try {
      const x = await extractText(r.f);
      const id = uid('doc');
      await setDocText(id, x.text);
      ws.docs.push({ id, name: r.f.name, size: r.f.size, type: x.method, added: today(), category: guessCat(r.f.name, x.text),
        chars: x.chars, words: x.words, quality: x.quality, excerpt: x.text.slice(0, 400) });
      r.state = x.quality;
      r.li.replaceChildren(r.f.name + ' — ', pill(x.quality === 'good' ? `${n0(x.words)} words` : x.quality === 'poor' ? 'little text found — paste key passages as a note' : 'no text found (scanned?)', x.quality === 'good' ? 'good' : 'warn'));
    } catch (e) { r.state = 'error'; r.li.replaceChildren(r.f.name + ' — ', pill('could not read: ' + (e.message || e), 'bad')); }
  }
  touch();
  return rows;
}

function guessCat(name, text) {
  const s = (name + ' ' + text.slice(0, 3000)).toLowerCase();
  if (/business case|étude de cas|case study/.test(s)) return 'Business case';
  if (/inventory|cmdb|asset list/.test(s)) return 'Asset inventory / CMDB extract';
  if (/audit|assessment report|findings/.test(s)) return 'Audit or assessment report';
  if (/incident/.test(s)) return 'Incident history';
  if (/cve-\d{4}/.test(s) && /cvss|severity|plugin/.test(s)) return 'Vulnerability scan export';
  if (/policy|standard|procedure/.test(s)) return 'Policy or standard';
  if (/supplier|vendor/.test(s)) return 'Supplier list';
  return 'Other';
}
const confirmDel = name => window.confirm('Remove "' + name + '" from this workspace? This cannot be undone.');

/* ---------------- workspaces ---------------- */
function workspaces(body, arg, sec) {
  const name = el('input', { placeholder: 'e.g. Acme Manufacturing 2026, or Team 4 — Northwind case' });
  const kind = select([['organization', 'Real organization'], ['classroom', 'Classroom business case']], 'organization');
  const from = select([['blank', 'Blank assessment'], ['medibec', 'Copy of the MediBec example'], ['current', 'Copy of the current workspace'], ['import', 'Import a JSON file…']], 'blank');
  const edu = el('input', { type: 'checkbox', style: { width: 'auto' } });
  edu.addEventListener('change', () => { if (edu.checked) kind.value = 'classroom'; });
  kind.addEventListener('change', () => { if (kind.value !== 'classroom') edu.checked = false; });
  const exP = el('input', { type: 'checkbox', checked: true, style: { width: 'auto' } });
  const exC = el('input', { type: 'checkbox', checked: true, style: { width: 'auto' } });
  const exM = el('input', { type: 'checkbox', checked: true, style: { width: 'auto' } });
  const opt = (c, t, h) => el('label', { style: { display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--ink)', margin: '6px 0' } }, c, el('span', null, t, h ? el('div', 'small muted', h) : null));
  const fileIn = el('input', { type: 'file', accept: '.json', style: { display: 'none' } });
  const msg = el('div');
  // documents to import with the new workspace (Word, PDF and the other supported types)
  const pending = [];
  const docIn = el('input', { type: 'file', multiple: true, accept: '.docx,.pdf,.xlsx,.xlsm,.pptx,.txt,.md,.csv,.json,.html,.htm', style: { display: 'none' } });
  const docList = el('div', 'chips', { style: { marginTop: '8px' } });
  const drawPending = () => docList.replaceChildren(...pending.map((f, i) => chip(f.name + ' · ' + Math.max(1, Math.round(f.size / 1024)) + ' KB', { onRemove: () => { pending.splice(i, 1); drawPending(); } })),
    pending.length ? null : el('span', 'small muted', 'No document selected — you can also add them later under Context documents.'));
  const addPending = files => { for (const f of files) if (!pending.some(p => p.name === f.name && p.size === f.size)) pending.push(f); drawPending(); };
  docIn.addEventListener('change', () => { addPending([...docIn.files]); docIn.value = ''; });
  const docDrop = el('div', 'drop', el('b', null, 'Business case and company documents'), el('div', 'small', 'Drop several Word or PDF files here (Excel, PowerPoint and text also accepted), or '),
    el('button', { class: 'btn sm', onclick: () => docIn.click() }, 'Choose files…'), docIn, docList);
  docDrop.addEventListener('dragover', e => { e.preventDefault(); docDrop.classList.add('over'); });
  docDrop.addEventListener('dragleave', () => docDrop.classList.remove('over'));
  docDrop.addEventListener('drop', e => { e.preventDefault(); docDrop.classList.remove('over'); addPending([...e.dataTransfer.files]); });
  drawPending();
  const doCreate = async (data) => {
    const fromFile = !!data && from.value !== 'medibec' && from.value !== 'current';
    const nm = name.value.trim() || (kind.value === 'classroom' ? 'Classroom case' : 'New organization');
    let ws;
    if (from.value === 'medibec') { ws = medibecWorkspace(); ws.id = uid('ws'); ws.name = nm; ws.kind = kind.value; }
    else if (from.value === 'current') {
      ws = JSON.parse(JSON.stringify(S.ws)); ws.id = uid('ws'); ws.name = nm; ws.kind = kind.value; ws.snapshot = null;
      for (const d of ws.docs) { const nid = uid('doc'); await setDocText(nid, await docText(d.id)); d.id = nid; }
    }
    else if (data) {
      if (data.schema === SCHEMA) {
        const texts = data.docTexts || {}; delete data.docTexts;
        ws = migrate(data); ws.id = uid('ws'); ws.snapshot = null; if (name.value.trim()) ws.name = nm;
        for (const d of ws.docs) { const nid = uid('doc'); await setDocText(nid, texts[d.id] || ''); d.id = nid; }
      }
      else if (Array.isArray(data.SCEN)) { ws = newWorkspace({ name: nm, kind: kind.value, assessment: Object.assign({ INITIATIVES: [], KRIS: [], EVIDENCE: [], CANDIDATES: [], CROWN: [] }, data) }); if (data.ORGANIZATION) ws.org.name = data.ORGANIZATION; }
      else throw new Error('Not a CyberRiskGuardian workspace or assessment file (no SCEN array).');
    } else ws = newWorkspace({ name: nm, kind: kind.value });
    if (edu.checked) ws.kind = 'classroom';
    if (ws.kind === 'classroom' && !ws.classroom) ws.classroom = { course: '', case_title: '', team: '', members: '', instructor: '', due: '', notes: '' };
    if (edu.checked) { ws.classroom.educational = true; ws.educational = true; }
    if (S.list.some(w => w.name === ws.name)) ws.name += ' (imported ' + today() + ')';
    migrate(ws);
    await create(ws);
    /* 1.5.6 — a teaching case that came out of a file is a case being handed out, so the state in the
       file is the starting point students go back to. A teaching case built here is not: the person is
       still assembling it, and a baseline taken now would be half a case. They set it themselves on
       Reset data → “Set the current state as the starting point”. */
    if (fromFile && RESET.isTeaching(ws)) { try { await RESET.ensureBaseline(ws); } catch { /* a baseline is a convenience */ } }
    if (pending.length) {
      const res = await addDocs(S.ws, pending.splice(0), msg);
      const bad = res.filter(r => r.state !== 'good').length;
      toast(`Workspace created with ${res.length - bad} document(s) read` + (bad ? `, ${bad} need attention` : ''), bad ? 'bad' : 'good');
      tab = 'docs';
      autoImport = exM.checked;
      if (exP.checked) { tab = 'profile'; auto = 'profile'; autoCrown = exC.checked; }
      else if (exC.checked) { tab = 'crown'; auto = 'crown'; }
      else if (exM.checked) { tab = 'workspaces'; autoImport = false; scrollImport = true; }
    } else { tab = 'profile'; toast('Workspace created'); }
    users.audit('workspace created', ws.name, S.ws);
    D = null; dirty = false;
    go('org/' + tab); window.dispatchEvent(new HashChangeEvent('hashchange'));
  };
  fileIn.addEventListener('change', async () => {
    try { await doCreate(JSON.parse(await fileIn.files[0].text())); }
    catch (e) { msg.replaceChildren(banner('bad', 'Import failed', String(e.message || e))); }
  });
  body.append(card(el('h2', null, arg === 'new' ? 'Create a workspace' : 'New workspace'),
    el('p', 'note', 'Each workspace holds one organization or business case: its profile, documents, scenarios, threats, vulnerabilities, snapshot, KRI history and decisions.'),
    el('div', 'grid g3', field('<b>Name</b>', name), field('Type', kind), field('Start from', from)),
    opt(edu, el('b', null, 'Educational case used for training purposes'), 'Sets the classroom type; deliverables are labelled fictional.'),
    el('div', { style: { marginTop: '12px' } }, docDrop),
    el('div', { style: { marginTop: '8px' } },
      opt(exP, el('b', null, 'Extract the profile & appetite from these documents after creation'), 'AI (with a preview of what is sent) or rules only; you review every value before saving.'),
      opt(exC, el('b', null, 'Then extract the crown jewels'), 'Proposes crown jewels from the same documents; you choose which to add.'),
      opt(exM, el('b', null, 'Then import more from the documents'), 'Information assets, BIA, third parties, existing controls, compliance, incidents, weaknesses, candidate scenarios, risks, budget, KRIs, roles, classroom — you choose the targets and review each proposal.')),
    el('div', 'btnrow', { style: { marginTop: '12px' } }, el('button', { class: 'btn', onclick: () => from.value === 'import' ? fileIn.click() : doCreate().catch(e => msg.replaceChildren(banner('bad', 'Could not create', String(e.message || e)))) }, 'Create workspace'), fileIn), msg));

  const t = el('table');
  t.append(el('thead', null, el('tr', null, ...['Workspace', 'Type', 'Organization', 'Scenarios', 'Modified', ''].map(h => el('th', null, h)))));
  const tb = el('tbody');
  for (const w of S.list) {
    const cur = w.id === S.ws.id;
    tb.append(el('tr', cur ? 'sel' : null, el('td', null, el('b', null, w.name)), el('td', null, w.kind), el('td', null, w.org?.name || ''),
      el('td', 'num', n0(w.assessment?.SCEN?.length || 0)), el('td', 'mono small', (w.modified || '').slice(0, 16).replace('T', ' ')),
      el('td', null, el('div', 'btnrow',
        cur ? pill('open', 'good') : el('button', { class: 'btn sm ghost', onclick: async () => { await selectWs(w.id); go('org'); } }, 'Open'),
        el('button', { class: 'btn sm ghost', onclick: () => exportWorkspace(w) }, 'Export'),
        el('button', { class: 'btn sm ghost danger', onclick: async () => { if (!window.confirm('Delete workspace "' + w.name + '" and all its documents, snapshot and history? Export it first if you may need it.')) return; await remove(w.id); toast('Deleted'); } }, 'Delete')))));
  }
  t.append(tb);
  // 1.5.4 — import more of the assessment from this workspace's documents
  IU.importCard(body, sec, { setTab: t => { tab = t; }, extractProfile, extractCrown });
  if (arg === 'import' || scrollImport) { scrollImport = false; setTimeout(() => document.getElementById('import-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }
  body.append(card(el('h2', null, 'All workspaces on this computer'), el('div', 'tablewrap', t),
    el('p', 'note', 'Workspaces live in this browser\'s local storage for this app. Export a workspace to back it up, move it to another computer or hand in a classroom case. Exports include document text.')));
}
async function exportWorkspace(w) {
  if (w.id === S.ws.id) await saveNow();
  const full = JSON.parse(JSON.stringify(w.id === S.ws.id ? S.ws : w));
  full.docTexts = {};
  for (const d of full.docs || []) full.docTexts[d.id] = await docText(d.id);
  download((w.name || 'workspace').replace(/[^\w.-]+/g, '_') + '.crg-workspace.json', JSON.stringify(full, null, 1), 'application/json');
}
export { exportWorkspace };
