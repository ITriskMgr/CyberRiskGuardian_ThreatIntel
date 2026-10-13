/* Compliance — requirements, AI-assisted assessment and reporting (1.5.7).

   Requirements   the organization's own compliance requirements beside the framework catalogues:
                  laws, regulations, contracts, standards and internal policies, each with an owner,
                  a status, evidence and the controls and policies that meet it. They can be typed,
                  imported from a CSV, taken from the ontology's Quebec Law 25 and health-information
                  act obligations, or derived from published security policies.
   AI-assisted    a proposal of status and evidence for each requirement or checklist item, by rules
   assessment     (from the statement of applicability, the safeguards and the policies — offline) or
                  by AI (preview and creativity as everywhere) — reviewed side by side, accepted item
                  by item. Nothing is written before "Apply the ticked proposals".
   Reporting      one view across frameworks, checklists, requirements and policies, with snapshots
                  over time, and the full report as Markdown or a printable page.
   Decision support, not legal advice. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { GENERATOR, SERIES } from '../version.js';
import { el, card, pill, chip, toast, banner, table, kpi, n0, go, field, select, download, today, toCSV, modal } from '../util.js';
import { S, touch } from '../state.js';
import * as K from '../catalog.js';
import * as AI from '../ai.js';
import * as aiui from '../aiui.js';
import * as X from '../extractor.js';
import * as C from '../crgo.js';
import * as P from '../isp.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';
import { CHECKLISTS, CSTATUS, fwStats, soaReport } from './compliance.js';
import { postureMarkdown, postureTable } from './cms.js';
import * as CMSM from '../cms.js';

const SOURCES = [['law', 'Law'], ['regulation', 'Regulation'], ['contract', 'Contract or agreement'], ['standard', 'Standard or certification'], ['policy', 'Internal policy'], ['other', 'Other']];
const stLabel = s => (CSTATUS.find(x => x[0] === (s || '')) || [, 'Not assessed'])[1];
const stKind = s => ({ compliant: 'good', partial: 'warn', 'non-compliant': 'bad' })[s] || '';
const byName = () => users.name() || '';

export function reqs(ws = S.ws) { ws.compliance.requirements ||= []; return ws.compliance.requirements; }
const nextReq = ws => { let n = 0; for (const r of reqs(ws)) { const m = /^REQ-(\d+)$/.exec(r.id); if (m) n = Math.max(n, +m[1]); } return 'REQ-' + String(n + 1).padStart(3, '0'); };
export function addReq(o, ws = S.ws) {
  const r = Object.assign({ id: nextReq(ws), set: 'Internal requirements', ref: '', text: '', category: '', source: 'other', owner: '', due: '', status: '', evidence: '', refs: [], policies: [], applicable: 'yes', assessed: null, created: today() }, o);
  reqs(ws).push(r); return r;
}
const pct = list => { const a = list.filter(r => r.applicable !== 'no' && r.status !== 'na'); if (!a.length) return null; return a.reduce((t, r) => t + (r.status === 'compliant' ? 1 : r.status === 'partial' ? 0.5 : 0), 0) / a.length; };

export async function renderTab(sec, tab, tabsEl) {
  sec.replaceChildren(el('h1', null, 'Compliance management'), tabsEl);
  const body = el('div'); sec.append(body);
  if (tab === 'requirements') return requirements(body, sec);
  if (tab === 'applicability' || tab === 'determinations') {          // 1.5.8 — legal applicability, compliance determinations
    const LG = await import('./compliance_legal.js');
    return LG[tab](body, () => renderTab(sec, tab, sec.querySelector('.subtabs')));
  }
  if (tab === 'ai') return assess(body, sec);
  return report(body, sec);
}

/* ---------------- requirements ---------------- */
let setFlt = '';
function requirements(body, sec) {
  const ws = S.ws, R = reqs(ws);
  const sets = [...new Set(R.map(r => r.set))];
  const redraw = () => renderTab(sec, 'requirements', sec.querySelector('.subtabs'));
  body.append(el('div', 'grid g4', kpi('Requirements', n0(R.length), `${sets.length} set(s)`),
    ...sets.slice(0, 3).map(s => { const l = R.filter(r => r.set === s); const p = pct(l); return kpi(s, p === null ? '—' : Math.round(p * 100) + '%', `${l.filter(r => r.status).length}/${l.length} assessed`, p === null ? '' : p >= 0.8 ? 'good' : p >= 0.5 ? 'warn' : 'bad'); })));
  // add
  const f = { set: setFlt || 'Internal requirements', ref: '', text: '', category: '', source: 'contract', owner: '', due: '', refs: '' };
  const t = (k, attrs = {}) => { const x = el(attrs.rows ? 'textarea' : 'input', { value: f[k], ...attrs }); x.addEventListener('input', () => { f[k] = x.value; }); return x; };
  const src = select(SOURCES, f.source); src.addEventListener('change', () => { f.source = src.value; });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Add a requirement'),
    el('div', 'grid g4', field('Set', t('set', { list: 'req-sets' })), field('Reference', t('ref', { placeholder: 'e.g. Contract §7.2' })), field('Source', src), field('Owner', t('owner'))),
    el('datalist', { id: 'req-sets' }, ...sets.map(s => el('option', { value: s }))),
    field('<b>Requirement</b>', t('text', { rows: 2, placeholder: 'What must be true, in one or two sentences' })),
    el('div', 'grid g3', field('Category', t('category')), field('Controls that meet it', t('refs', { placeholder: 'ISO22:8.13, CSF2:PR.DS-11', class: 'mono' })), field('Due', t('due', { type: 'date' }))),
    el('div', 'btnrow', el('button', { class: 'btn', onclick: () => {
      if (!f.text.trim()) { toast(tr('Write the requirement'), 'bad'); return; }
      const r = addReq({ ...f, refs: f.refs.split(/\s*,\s*/).filter(Boolean) }, ws); users.audit('compliance requirement added', r.id, ws); touch('compliance'); setFlt = r.set; redraw();
    } }, 'Add'))));
  // import
  const csv = el('textarea', { rows: 3, placeholder: 'set;reference;requirement;category;controls (comma-separated)' });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Import requirements'),
    el('div', 'grid g3',
      el('div', null, el('h4', null, 'From the ontology'), el('p', 'small muted', 'Quebec Law 25 (P-39.1) and the Quebec health-information act (R-22.1) obligations that the CyberRiskGuardian Ontology links to risk scenarios.'),
        el('button', { class: 'btn sm', onclick: async e => { e.target.disabled = true; try { const n = await fromOntology(ws); toast(`${n} ${tr('requirement(s) added')}`); redraw(); } catch (err) { toast(String(err.message || err), 'bad'); e.target.disabled = false; } } }, 'Add the Law 25 and R-22.1 obligations')),
      el('div', null, el('h4', null, 'From the security policies'), el('p', 'small muted', 'Each statement of a published policy becomes an internal requirement, with its controls.'),
        el('button', { class: 'btn sm', onclick: () => { const n = fromPolicies(ws); toast(`${n} ${tr('requirement(s) added')}`); redraw(); } }, 'Add the published policy statements')),
      el('div', null, el('h4', null, 'From a list'), el('p', 'small muted', 'One requirement per line, fields separated by semicolons.'), csv,
        el('button', { class: 'btn sm', style: { marginTop: '6px' }, onclick: () => {
          let n = 0; for (const line of csv.value.split('\n')) { const [set, ref, text, category, refs] = line.split(';').map(x => (x || '').trim()); if (!text) continue; addReq({ set: set || 'Imported requirements', ref, text, category, source: 'other', refs: (refs || '').split(',').map(x => x.trim()).filter(Boolean) }, ws); n++; }
          touch('compliance'); toast(`${n} ${tr('requirement(s) added')}`); redraw();
        } }, 'Add the lines')))));
  // table
  const fs = select([['', 'All sets'], ...sets.map(s => [s, s])], setFlt); fs.addEventListener('change', () => { setFlt = fs.value; redraw(); });
  const rows = R.filter(r => !setFlt || r.set === setFlt);
  const pol = P.isp(ws).policies;
  const polFor = r => pol.filter(p => p.status === 'published' && p.statements.some(s => (s.refs || []).some(x => (r.refs || []).includes(x)))).map(p => p.id);
  body.append(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, `Requirements (${rows.length})`), fs),
    rows.length ? el('div', 'tablewrap', table([
      { key: 'id', label: 'ID', cls: 'mono' },
      { key: 'text', label: 'Requirement', render: r => el('div', { 'data-noi18n': '' }, el('b', null, r.ref || r.set), ' ', r.text, el('div', 'small muted', [r.set, r.category, SOURCES.find(s => s[0] === r.source)?.[1]].filter(Boolean).join(' · '))) },
      { key: 'app', label: 'Applies', render: r => { const s = select([['yes', 'Yes'], ['no', 'No']], r.applicable); s.addEventListener('change', () => { r.applicable = s.value; touch('compliance'); }); return s; } },
      { key: 'status', label: 'Status', render: r => { const s = select(CSTATUS, r.status || ''); s.addEventListener('change', () => { r.status = s.value; r.assessed = { method: 'analyst', by: byName(), date: today() }; touch('compliance'); }); return el('div', null, s, r.assessed ? el('div', 'small muted', `${r.assessed.method} · ${r.assessed.date}`) : null); } },
      { key: 'owner', label: 'Owner', render: r => { const i = el('input', { value: r.owner || '' }); i.addEventListener('change', () => { r.owner = i.value; touch('compliance'); }); return i; } },
      { key: 'evidence', label: 'Evidence', render: r => { const i = el('input', { value: r.evidence || '', placeholder: 'document, register, link' }); i.addEventListener('change', () => { r.evidence = i.value; touch('compliance'); }); return i; } },
      { key: 'links', label: 'Controls · policies', sortable: false, render: r => el('div', 'chips', ...(r.refs || []).slice(0, 4).map(k => { const ct = K.control(k); const st = ws.compliance.soa[k]?.status; return chip(ct ? `${ct.fwName} ${ct.id}` : k, { kind: st === 'implemented' ? '' : 'c', title: (ct?.title || '') + (st ? ' — ' + st : '') }); }),
        ...polFor(r).map(id => chip(id, { href: '#/isp/policy/' + id }))) },
      { key: 'due', label: 'Due', cls: 'mono' },
      { key: 'x', label: '', sortable: false, render: r => el('button', { class: 'btn sm ghost danger', onclick: () => { R.splice(R.indexOf(r), 1); touch('compliance'); redraw(); } }, 'Remove') },
    ], rows, { class: 'compact' })) : el('div', 'empty-state', el('b', null, 'No requirement yet'), 'Add one, or import them above.')));
}

async function fromOntology(ws) {
  const snap = await C.snapshot();
  const seen = new Map();
  for (const s of snap.scenarios) for (const o of s.obligations || []) if (!seen.has(o.id)) seen.set(o.id, o);
  const have = new Set(reqs(ws).map(r => r.ref));
  let n = 0;
  for (const o of [...seen.values()].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))) {
    if (have.has(o.id)) continue;
    const law = /^P-39\.1/.test(o.id) ? 'Quebec Law 25 — private sector act (P-39.1)' : /^R-22\.1/.test(o.id) ? 'Quebec health-information act (R-22.1)' : 'Other obligations';
    addReq({ set: law, ref: o.id, text: o.title, category: 'Obligation', source: 'law', origin: 'ontology ' + snap.version }, ws); n++;
  }
  touch('compliance'); users.audit('compliance requirements from the ontology', String(n), ws);
  return n;
}
function fromPolicies(ws) {
  const have = new Set(reqs(ws).map(r => r.ref)); let n = 0;
  for (const p of P.isp(ws).policies.filter(x => x.status === 'published')) for (const s of p.statements) {
    if (have.has(s.id)) continue;
    addReq({ set: 'Security policies (ISP)', ref: s.id, text: s.text, category: p.domain || p.title, source: 'policy', refs: [...(s.refs || [])], policies: [p.id], owner: p.owner || '' }, ws); n++;
  }
  touch('compliance'); return n;
}

/* ---------------- AI-assisted assessment ---------------- */
const A = { scope: 'reqs', set: '', checklist: 'law25', method: 'rules', docs: false, only: 'unassessed' };
function items(ws) {
  if (A.scope === 'reqs') return reqs(ws).filter(r => (!A.set || r.set === A.set) && r.applicable !== 'no' && (A.only === 'all' || !r.status)).map(r => ({ kind: 'req', id: r.id, text: (r.ref ? r.ref + ' — ' : '') + r.text, refs: r.refs || [], cur: r }));
  const c = CHECKLISTS[A.checklist]; const st = (ws.compliance.checklists[A.checklist] ||= {});
  return c.items.filter(it => A.only === 'all' || !st[it[0]]?.status).map(it => ({ kind: 'chk', id: it[0], text: it[1], refs: it[3] || [], cur: (st[it[0]] ||= {}) }));
}
/** Offline proposal from what the workspace already records about the related controls. */
function byRules(ws, list) {
  const sg = ws.safeguards || [], pol = P.isp(ws).policies.filter(p => p.status === 'published'), ms = (ws.measures || []).filter(m => m.status === 'implemented');
  return list.map(it => {
    if (!it.refs.length) return { id: it.id, status: '', evidence: '', gap: 'No related control recorded — assess by hand.', confidence: 'Low', tag: 'UNKNOWN', source: 'rules' };
    const sts = it.refs.map(k => ws.compliance.soa[k]?.status).filter(Boolean);
    const sgs = sg.filter(s => (s.ctl || []).some(k => it.refs.includes(k)) && s.state === 'in-place');
    const pols = pol.filter(p => p.statements.some(s => (s.refs || []).some(k => it.refs.includes(k))));
    const mm = ms.filter(m => (m.ctl || []).some(k => it.refs.includes(k)));
    const good = sts.filter(s => s === 'implemented').length + sgs.length + mm.length, part = sts.filter(s => s === 'partial').length, bad = sts.filter(s => s === 'not-started').length;
    const status = !sts.length && !sgs.length && !mm.length && !pols.length ? '' : bad && !good ? 'non-compliant' : good && !bad && !part ? (pols.length ? 'compliant' : 'partial') : 'partial';
    const evidence = [sgs.length ? 'Safeguards: ' + sgs.map(s => s.name).join(', ') : '', mm.length ? 'Measures: ' + mm.map(m => m.id).join(', ') : '', pols.length ? 'Policies: ' + pols.map(p => p.id).join(', ') : '', sts.length ? `Statement of applicability: ${sts.join(', ')}` : ''].filter(Boolean).join(' · ');
    return { id: it.id, status, evidence, gap: status === 'compliant' ? '' : !pols.length ? 'No published policy covers the related controls.' : 'Related controls not fully implemented.', confidence: 'Medium', tag: status ? 'INFERENCE' : 'UNKNOWN', source: 'rules' };
  });
}
AI.TASKS.compliance_assess = {
  label: 'Compliance assessment',
  build(ws, { list = [], docs = '' } = {}) {
    const sg = (ws.safeguards || []).slice(0, 60).map(s => `- ${s.name} | ${s.state} | ${(s.ctl || []).join(',')}`);
    const pol = P.isp(ws).policies.filter(p => p.status !== 'retired').slice(0, 30).map(p => `- ${p.id} ${p.title} | ${p.status} v${p.version} | ${[...new Set(p.statements.flatMap(s => s.refs || []))].join(',')}`);
    const ms = (ws.measures || []).filter(m => m.status !== 'rejected').slice(0, 50).map(m => `- ${m.id} ${m.name} | ${m.status} | ${(m.ctl || []).join(',')}`);
    const soa = Object.entries(ws.compliance.soa || {}).filter(([, r]) => r.status).slice(0, 120).map(([k, r]) => `${k}=${r.status}`).join('; ');
    const body = ['TASK: compliance_assess', AI.orgContext(ws), '',
      'Assess the organization\'s compliance with each item below, using ONLY the evidence given (safeguards, policies, measures, statement of applicability' + (docs ? ', document excerpts' : '') + ').',
      'Status, exactly one of: compliant, partial, non-compliant, na, unknown. Use unknown when the evidence does not allow a conclusion — never guess compliance.',
      'For each item give the evidence you relied on (names of safeguards, policies, measures or documents), the gap that remains, a confidence (High, Medium, Low) and a provenance tag: FACT (stated in the evidence), INFERENCE (derived), ASSUMPTION (plausible but unverified), UNKNOWN.', '',
      'ITEMS (id | requirement | related controls):', ...list.map(it => `${it.id} | ${it.text} | ${it.refs.join(',')}`), '',
      'SAFEGUARDS IN FORCE (name | state | controls):', ...(sg.length ? sg : ['(none recorded)']), '',
      'SECURITY POLICIES (id title | status | controls):', ...(pol.length ? pol : ['(none recorded)']), '',
      'MITIGATION MEASURES (id name | status | controls):', ...(ms.length ? ms : ['(none recorded)']), '',
      'STATEMENT OF APPLICABILITY: ' + (soa || '(nothing assessed)'),
      docs ? '\nDOCUMENT EXCERPTS:\n' + docs : '', '',
      'Return JSON only: {"items":[{"id":"","status":"","evidence":"","gap":"","confidence":"","tag":"","source":""}]}'];
    return { system: 'You are a senior compliance and information security auditor. You conclude only from the evidence given, never invent evidence, and say "unknown" when the evidence is insufficient. You return JSON only. This is decision support, not legal advice.', prompt: body.join('\n'), max_tokens: 6000, json: true };
  },
};

function assess(body, sec) {
  const ws = S.ws;
  const redraw = () => renderTab(sec, 'ai', sec.querySelector('.subtabs'));
  const sets = [...new Set(reqs(ws).map(r => r.set))];
  const scope = select([['reqs', 'My requirements'], ['chk', 'A regulatory checklist']], A.scope); scope.addEventListener('change', () => { A.scope = scope.value; redraw(); });
  const set = select([['', 'All sets'], ...sets.map(s => [s, s])], A.set); set.addEventListener('change', () => { A.set = set.value; redraw(); });
  const chk = select(Object.entries(CHECKLISTS).map(([k, c]) => [k, c.short]), A.checklist); chk.addEventListener('change', () => { A.checklist = chk.value; redraw(); });
  const only = select([['unassessed', 'Not assessed yet'], ['all', 'All, including assessed']], A.only); only.addEventListener('change', () => { A.only = only.value; redraw(); });
  const meth = select([['rules', 'Rules — from the controls, safeguards and policies already recorded (offline)'], ['ai', 'AI — preview before sending']], A.method); meth.addEventListener('change', () => { A.method = meth.value; redraw(); });
  const docs = el('input', { type: 'checkbox', checked: A.docs, style: { width: 'auto' } }); docs.addEventListener('change', () => { A.docs = docs.checked; });
  const list = items(ws).slice(0, 40);
  const out = el('div');
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'What to assess'),
    el('p', 'note', 'Proposes a status, the evidence and the remaining gap for each item. Rules read what the workspace already records — the statement of applicability, the safeguards in force, implemented measures and published policies. AI reads the same evidence (and, if you tick it, excerpts of the documents) and must answer “unknown” when the evidence is insufficient. You accept each proposal.'),
    el('div', 'grid g4', field('Scope', scope), A.scope === 'reqs' ? field('Set', set) : field('Checklist', chk), field('Items', only), field('Method', meth)),
    A.method === 'ai' ? el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center' } }, docs, el('span', null, 'Include excerpts of the context documents')) : null,
    el('p', 'small muted', tr(items(ws).length > 40 ? '{0} item(s) in scope (the first 40).' : '{0} item(s) in scope.').replace('{0}', list.length)),
    el('div', 'btnrow', el('button', { class: 'btn', disabled: !list.length, onclick: async () => {
      let props, meta = {};
      if (A.method === 'rules') props = byRules(ws, list);
      else {
        const st = await aiui.status(ws, 'compliance_assess'); if (!st.ok) { toast(st.why, 'bad'); return; }
        const text = A.docs ? (await X.corpus(ws, 60000)).text : '';
        const r = await aiui.request('compliance_assess', { list, docs: text }, { title: tr('Compliance assessment — what will be sent') });
        if (!r) return;
        try { props = (AI.parseJson(r.text).items || []); } catch (e) { toast(String(e.message || e), 'bad'); AI.decide(r.entryId, 'rejected', 'unparseable'); return; }
        meta = { entryId: r.entryId, model: r.model };
      }
      review(out, ws, list, props, meta, redraw);
    } }, 'Propose'))), out);
  const log = (ws.compliance.assessLog || []).slice(0, 10);
  if (log.length) body.append(card(el('h2', { style: { marginTop: 0 } }, 'Assessments applied'), table([{ key: 'date', label: 'Date', cls: 'mono' }, { key: 'scope', label: 'Scope' }, { key: 'method', label: 'Method' }, { key: 'n', label: 'Applied', cls: 'num' }, { key: 'by', label: 'By' }], log, { class: 'compact' })));
}

function review(box, ws, list, props, meta, redraw) {
  const norm = s => { s = String(s || '').toLowerCase(); return s.startsWith('non') ? 'non-compliant' : s.startsWith('part') ? 'partial' : s.startsWith('compl') ? 'compliant' : s === 'na' || s.startsWith('not app') ? 'na' : ''; };
  const rows = list.map(it => { const p = props.find(x => String(x.id) === it.id) || {}; const st = norm(p.status); return { it, p, st, ev: String(p.evidence || '').slice(0, 400), take: !!st && !it.cur.status }; });
  box.replaceChildren(card(el('h2', { style: { marginTop: 0 } }, 'Review the proposals'),
    el('p', 'note', (A.method === 'ai' ? tr('Proposed by AI') + (meta.model ? ' · ' + meta.model : '') : tr('Proposed by rules (no AI)')) + ' — ' + AI.MARK + ' ' + tr('Items already assessed are left unticked.')),
    el('div', 'tablewrap', { style: { maxHeight: '60vh', overflow: 'auto' } }, table([
      { key: 'take', label: '', sortable: false, cls: 'cb', render: r => { const c = el('input', { type: 'checkbox', checked: r.take, disabled: !r.st }); c.addEventListener('change', () => { r.take = c.checked; }); return c; } },
      { key: 'id', label: 'Item', render: r => el('div', { 'data-noi18n': '' }, el('b', 'mono', r.it.id), ' ', r.it.text.slice(0, 160)) },
      { key: 'cur', label: 'Now', render: r => pill(stLabel(r.it.cur.status), stKind(r.it.cur.status)) },
      { key: 'st', label: 'Proposed', render: r => r.st ? pill(stLabel(r.st), stKind(r.st)) : pill('unknown', '') },
      { key: 'ev', label: 'Evidence (editable) · gap', render: r => { const i = el('textarea', { rows: 2, 'data-noi18n': '' }); i.value = r.ev; i.addEventListener('input', () => { r.ev = i.value; r.take = !!r.st; }); return el('div', null, i, r.p.gap ? el('div', { class: 'small muted', 'data-noi18n': '' }, 'Gap: ' + r.p.gap) : null); } },
      { key: 'conf', label: 'Confidence · tag', render: r => el('span', 'small', `${r.p.confidence || '—'} · ${r.p.tag || '—'}`) },
    ], rows, { class: 'compact' })),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: () => {
      let n = 0;
      for (const r of rows.filter(x => x.take && x.st)) {
        r.it.cur.status = r.st; r.it.cur.evidence = r.ev || r.it.cur.evidence; r.it.cur.updated = today();
        r.it.cur.assessed = { method: A.method === 'ai' ? 'AI accepted' : 'rules accepted', by: byName(), date: today(), confidence: r.p.confidence || '', tag: r.p.tag || '' };
        n++;
      }
      (ws.compliance.assessLog ||= []).unshift({ date: today(), scope: A.scope === 'reqs' ? (A.set || 'all requirements') : CHECKLISTS[A.checklist].short, method: A.method, n, by: byName() });
      if (meta.entryId) AI.decide(meta.entryId, n ? 'accepted' : 'rejected', `${n} status(es) applied`);
      users.audit('compliance assessment applied', `${n} (${A.method})`, ws); touch('compliance'); toast(`${n} ${tr('status(es) applied')}`); redraw();
    } }, 'Apply the ticked proposals'), el('button', { class: 'btn ghost', onclick: () => { if (meta.entryId) AI.decide(meta.entryId, 'rejected', 'cancelled'); box.replaceChildren(); } }, 'Discard'))));
}

/* ---------------- reporting ---------------- */
export function overview(ws = S.ws) {
  const fw = (ws.compliance.frameworks || []).map(id => ({ id, f: K.frameworkList().find(x => x.id === id), s: fwStats(ws, id) })).filter(x => x.f);
  const chk = Object.entries(CHECKLISTS).map(([id, c]) => { const st = ws.compliance.checklists[id] || {}; const it = c.items.filter(i => st[i[0]]?.status && st[i[0]]?.status !== 'na');
    return { id, name: c.short, assessed: c.items.filter(i => st[i[0]]?.status).length, of: c.items.length, pct: it.length ? it.reduce((t, i) => t + (st[i[0]].status === 'compliant' ? 1 : st[i[0]].status === 'partial' ? 0.5 : 0), 0) / it.length : null }; });
  const sets = [...new Set(reqs(ws).map(r => r.set))].map(s => { const l = reqs(ws).filter(r => r.set === s); return { name: s, of: l.length, assessed: l.filter(r => r.status).length, pct: pct(l) }; });
  const I = P.isp(ws);
  return { fw, chk, sets, isp: { policies: I.policies.filter(p => p.status !== 'retired').length, published: I.policies.filter(p => p.status === 'published').length, overdue: I.policies.filter(P.overdue).length,
    open: I.issues.filter(x => ['open', 'progress'].includes(x.status)).length, critical: I.issues.filter(x => ['open', 'progress'].includes(x.status) && ['high', 'critical'].includes(x.severity)).length, exceptions: (ws.shared?.exceptions || []).filter(x => x.status === 'accepted').length } };
}
export function fullReport(ws = S.ws, legal = '') {
  const o = overview(ws);
  const L = [soaReport(ws), '', ...(legal ? [legal, ''] : []), postureMarkdown(ws), '', '## Compliance requirements', ''];
  for (const s of o.sets) {
    L.push(`### ${s.name}`, '', `${s.assessed} of ${s.of} assessed · compliance ${s.pct === null ? '—' : Math.round(s.pct * 100) + '%'}`, '', '| ID | Reference | Requirement | Status | Owner | Evidence | How assessed |', '|---|---|---|---|---|---|---|');
    for (const r of reqs(ws).filter(x => x.set === s.name)) L.push(`| ${r.id} | ${r.ref || ''} | ${String(r.text).replace(/\|/g, '/')} | ${stLabel(r.status)} | ${r.owner || ''} | ${String(r.evidence || '').replace(/\|/g, '/')} | ${r.assessed ? r.assessed.method + ' ' + r.assessed.date : ''} |`);
    L.push('');
  }
  const I = P.isp(ws);
  L.push('## Security policies', '', `${o.isp.published} published of ${o.isp.policies} · ${o.isp.overdue} review(s) overdue`, '', '| ID | Policy | Version | Status | Owner | Next review |', '|---|---|---|---|---|---|',
    ...I.policies.map(p => `| ${p.id} | ${p.title} | ${p.version} | ${p.status} | ${p.owner || ''} | ${p.nextReview || ''} |`), '',
    '## Non-compliance with the security policies', '', `${o.isp.open} open (${o.isp.critical} high or critical) · ${o.isp.exceptions} accepted exception(s)`, '', '| ID | Kind | Policy | Departure | Severity | Status | Owner | Due / expiry |', '|---|---|---|---|---|---|---|---|',
    ...I.issues.map(x => `| ${x.id} | ${x.type} | ${x.policy || ''} | ${String(x.title).replace(/\|/g, '/')} | ${x.severity} | ${x.status} | ${x.owner || ''} | ${x.type === 'exception' ? x.expiry : x.due} |`), '',
    '---', `Prepared with ${GENERATOR}, beta version ${SERIES}. Decision support, not legal advice: statuses proposed by rules or AI were accepted by the analyst named in “How assessed”.`,
    ...((ws.crgo?.graph?.release?.tag || ws.grc?.applicability?.release) ? [`Ontology: CyberRiskGuardian Ontology (CRGO) v${ws.crgo?.graph?.release?.tag || ws.grc.applicability.release}${ws.crgo?.graph?.release?.ontology ? ' (ontology release ' + ws.crgo.graph.release.ontology + ')' : ''}, CC BY-NC 4.0.`] : []));
  return L.join('\n');
}
function report(body, sec) {
  const ws = S.ws, o = overview(ws);
  const redraw = () => renderTab(sec, 'report', sec.querySelector('.subtabs'));
  const pc = p => p === null ? '—' : Math.round(p * 100) + '%';
  body.append(el('div', 'grid g4',
    ...o.fw.map(x => kpi(x.f.short, pc(x.s.pct), `${x.s.assessed}/${x.s.applicable} assessed · ${x.s.gaps} gaps`, x.s.pct >= 0.8 ? 'good' : x.s.pct >= 0.5 ? 'warn' : 'bad')),
    ...o.chk.map(x => kpi(x.name + ' checklist', pc(x.pct), `${x.assessed}/${x.of} assessed`, x.pct === null ? '' : x.pct >= 0.8 ? 'good' : x.pct >= 0.5 ? 'warn' : 'bad')),
    ...o.sets.map(x => kpi(x.name, pc(x.pct), `${x.assessed}/${x.of} assessed`, x.pct === null ? '' : x.pct >= 0.8 ? 'good' : x.pct >= 0.5 ? 'warn' : 'bad')),
    kpi('Security policies', `${o.isp.published}/${o.isp.policies}`, `published · ${o.isp.overdue} review(s) overdue`, o.isp.overdue ? 'warn' : 'good'),
    kpi('Policy non-compliance', n0(o.isp.open), `${o.isp.critical} high or critical · ${o.isp.exceptions} exceptions`, o.isp.critical ? 'bad' : o.isp.open ? 'warn' : 'good')));
  const post = CMSM.posture(ws);
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Compliance posture'),
    el('p', 'note', 'Each obligation with its applicability, its latest dated determination, the status of the evidence it relied on, the exceptions concerning it that no authority exempted, and its next deadline. A mapping, an acknowledgement or an attestation is never compliance.'),
    post.length ? postureTable(post) : el('div', 'empty-state', 'No obligation recorded yet: add them in Sources & obligations.')));
  const hist = ws.compliance.history || [];
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Over time'),
    hist.length ? table([{ key: 'date', label: 'Date', cls: 'mono' }, ...Object.keys(hist[hist.length - 1].values).map(k => ({ key: k, label: k, cls: 'num', render: h => h.values[k] === undefined ? '—' : h.values[k] + '%' }))], hist.slice().reverse(), { class: 'compact' }) : el('p', 'small muted', 'No snapshot yet.'),
    el('div', 'btnrow', el('button', { class: 'btn ghost', onclick: () => {
      const v = {}; for (const x of o.fw) v[x.f.short] = Math.round(x.s.pct * 100); for (const x of o.chk) if (x.pct !== null) v[x.name] = Math.round(x.pct * 100); for (const x of o.sets) if (x.pct !== null) v[x.name] = Math.round(x.pct * 100);
      (ws.compliance.history ||= []).push({ date: today(), values: v }); touch('compliance'); toast(tr('Snapshot recorded')); redraw();
    } }, 'Record a snapshot')), el('p', 'note', 'A snapshot keeps today’s percentages so the next review can show the trend.')));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Reports'), el('div', 'btnrow',
    el('button', { class: 'btn', onclick: async () => download(`compliance-report-full-${today()}.md`, fullReport(ws, await (await import('./compliance_legal.js')).reportSections(ws)), 'text/markdown') }, 'Full compliance report (.md)'),
    el('button', { class: 'btn ghost', onclick: async () => printReport(fullReport(ws, await (await import('./compliance_legal.js')).reportSections(ws))) }, 'Printable report'),
    el('button', { class: 'btn ghost', disabled: !reqs(ws).length, onclick: () => download(`compliance-requirements-${today()}.csv`, toCSV([['id', 'set', 'ref', 'requirement', 'category', 'source', 'applicable', 'status', 'owner', 'evidence', 'controls', 'due', 'assessed'],
      ...reqs(ws).map(r => [r.id, r.set, r.ref, r.text, r.category, r.source, r.applicable, r.status, r.owner, r.evidence, (r.refs || []).join(' '), r.due, r.assessed ? r.assessed.method + ' ' + r.assessed.date : ''])]), 'text/csv') }, 'Requirements (.csv)'),
    el('button', { class: 'btn ghost', onclick: () => go('compliance/assessment') }, 'Statement of applicability…')),
    el('p', 'note', 'The full report gathers the statements of applicability, the legal applicability and compliance determinations, the compliance posture and regulatory deadlines, the regulatory checklists, your requirements, the security policies and their non-compliance. Decision support, not legal advice.')));
}
async function printReport(md) {
  const { render } = await import('../../help/md.js');
  const w = window.open('', '_blank', 'width=980,height=900');
  if (!w) { toast(tr('Allow pop-ups to print the report, or download the Markdown.'), 'bad'); return; }
  w.document.write('<!doctype html><meta charset="utf-8"><title>Compliance report</title><link rel="stylesheet" href="' + new URL('../../help/page.css', import.meta.url) + '"><main class="doc"></main>');
  w.document.close();
  render(md, w.document.querySelector('main'));
  setTimeout(() => { try { w.print(); } catch { /* the person prints */ } }, 400);
}
