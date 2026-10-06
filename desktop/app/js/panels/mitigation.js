/* Risk mitigation (1.4.0) — mitigation measures selected from ISO/IEC 27002, NIST SP 800-53 r5, NIST CSF,
   CIS Controls, ATT&CK mitigations and the analyst's own list; proposals by transparent rules or by Claude;
   cost and expected reduction of likelihood and impact per scenario; combined reduction 1 − ∏(1 − r);
   before/after through the verified engine; shared measures counted once; conversion to initiatives.
   Estimates are analytical — validation required. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as users from '../users.js';
import { el, n0, n2, kpi, card, pill, pillFor, field, select, chip, toast, table, banner, download, copyText, money, go, debounce } from '../util.js';
import { S, touch, compute, scen } from '../state.js';
import * as K from '../catalog.js';
import * as REC from '../recommend.js';

let view = 'plan', editId = null, statuses = null;
const cflt = { q: '', fw: 'all', fn: 'all', tag: 'all', enh: false };
const picked = new Set();          // catalogue keys ticked
let propSel = null;                // scenarios selected for proposals / Claude
const mSel = new Set();            // measures ticked for a draft recommendation (1.5.1)

const statusSets = [['active', 'All except rejected', null], ['committed', 'Approved, in progress, implemented', ['approved', 'in-progress', 'implemented']], ['implemented', 'Implemented only', ['implemented']]];
let statusKey = 'active';
const ctlChip = key => { const c = K.control(key); return chip(c ? `${c.fwName} ${c.id}` : key, { kind: 'c', title: c ? c.title : key }); };

export function render(sec, arg) {
  const ws = S.ws; ws.measures ||= [];
  if (arg && ws.measures.some(m => m.id === arg)) { view = 'plan'; editId = arg; }
  statuses = statusSets.find(x => x[0] === statusKey)[2];
  sec.replaceChildren(el('h1', null, 'Risk mitigation'),
    el('p', 'lede', 'Choose mitigation measures from recognized control frameworks, estimate their cost and their effect on likelihood and impact for each scenario, and see the residual risk they buy. A measure that serves several scenarios is one investment, counted once. Figures are analytical estimates — validation required.'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['plan', `Mitigation plan (${ws.measures.length})`], ['catalogue', 'Control catalogue'], ['propose', 'Proposals'], ['claude', 'Ask Claude'], ['about', 'Method & sources']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ plan, catalogue, propose, claude, about }[view])(body, sec);
}

/* ---------------- plan ---------------- */
function plan(body, sec) {
  const ws = S.ws, R = compute();
  const imp = K.impact(ws, statuses), cost = K.costs(ws, statuses);
  const inc = imp.filter(r => !r.error && R.rows.find(x => x.id === r.s.id)?.inc);
  const covered = inc.filter(r => r.c.measures.length);
  const sum = (xs, f) => xs.reduce((t, x) => t + f(x), 0);
  const resNow = sum(inc, r => r.cur.res), resAfter = sum(inc, r => (r.after || r.cur).res);
  const aboveNow = inc.filter(r => r.cur.ratio > CRG.BAND_HIGH).length, aboveAfter = inc.filter(r => (r.after || r.cur).ratio > CRG.BAND_HIGH).length;
  const ss = select(statusSets.map(x => [x[0], x[1]]), statusKey); ss.addEventListener('change', () => { statusKey = ss.value; render(sec); });
  body.append(el('div', 'filterbar', { style: { marginBottom: '12px' } }, el('div', null, field('Measures counted', ss)),
    el('div', 'small muted', { style: { flex: 1 } }, 'Residual “with measures” uses the combined reductions of the counted measures. “Current” is the scenario as saved (its red_p / red_i), which changes only when you apply the measures.')));
  body.append(el('div', 'grid g5',
    kpi('Measures counted', n0(ws.measures.filter(m => K.active(m, statuses)).length), `${ws.measures.length} in the plan`),
    kpi('Year-1 cost', money(cost.y1), `${money(cost.initial)} one-time + ${money(cost.recurring)}/yr`),
    kpi('Scenarios covered', `${covered.length} / ${inc.length}`, 'included scenarios with ≥ 1 measure'),
    kpi('Residual risk', `${n0(resNow)} → ${n0(resAfter)}`, 'included: current → with measures', resAfter < resNow ? 'good' : ''),
    kpi('Above tolerance', `${aboveNow} → ${aboveAfter}`, 'current → with measures', aboveAfter ? 'warn' : 'good')));

  // measures table
  const rows = ws.measures;
  const cols = [
    { key: 'sel', label: '', sortable: false, cls: 'cb', render: m => {
        const b = el('input', { type: 'checkbox', checked: mSel.has(m.id), 'aria-label': 'Select ' + m.id });
        // Only the action bar depends on the selection: redrawing the whole table here would lose the
        // scroll position and any half-typed edit.
        b.addEventListener('change', () => { b.checked ? mSel.add(m.id) : mSel.delete(m.id); updateRecBar(); });
        return b; } },
    { key: 'id', label: 'ID', cls: 'mono' },
    { key: 'name', label: 'Measure', render: m => el('div', null, el('b', null, m.name || '(unnamed)'), el('div', 'small muted', [m.fn, m.owner, m.source === 'claude' ? 'proposed by Claude' : m.source === 'suggest' ? 'rule-based proposal' : m.source === 'catalogue' ? 'from catalogue' : ''].filter(Boolean).join(' · '))) },
    { key: 'ctl', label: 'Controls', sortable: false, render: m => el('div', 'chips', ...(m.ctl || []).slice(0, 4).map(ctlChip), (m.ctl || []).length > 4 ? el('span', 'small muted', '+' + (m.ctl.length - 4)) : null) },
    { key: 'scen', label: 'Scenarios', sortable: false, render: m => el('div', 'chips', ...(m.scen || []).slice(0, 8).map(id => chip(id, { href: '#/scenario/' + id, title: scen(id)?.name || id })), (m.scen || []).length > 8 ? el('span', { class: 'more', title: m.scen.slice(8).join(', ') }, `+${m.scen.length - 8}`) : null) },
    { key: 'rp', label: 'rp · ri', num: true, render: m => `${n2(m.rp)} · ${n2(m.ri)}`, sort: m => m.rp + m.ri },
    { key: 'y1', label: 'Year-1', num: true, render: m => money((+m.initial || 0) + (+m.recurring || 0)), sort: m => (+m.initial || 0) + (+m.recurring || 0) },
    { key: 'status', label: 'Status', render: m => { const s = select(K.STATUS, m.status); s.addEventListener('change', () => {
      if (s.value === 'approved' && users.active()) { try { users.requireApprove('treat'); } catch (e) { toast(e.message, 'bad'); s.value = m.status; return; } users.audit('measure approved', m.id, S.ws); }
      m.status = s.value; touch(); render(sec); }); return s; } },
    { key: 'act', label: '', sortable: false, render: m => el('div', 'btnrow',
      el('button', { class: 'btn sm ghost', onclick: () => { editId = editId === m.id ? null : m.id; render(sec); } }, editId === m.id ? 'Close' : 'Edit'),
      el('button', { class: 'btn sm ghost', title: 'Create or update the initiative that funds this measure (Budget, Recommendations, Excel)', onclick: () => { const id = K.toInitiative(m); touch(); toast(`Initiative ${id} ${m.initId ? 'updated' : 'created'}`); render(sec); } }, m.initId ? '↻ ' + m.initId : '→ Initiative')) },
  ];
  const pickedIds = () => [...mSel].filter(id => ws.measures.some(m => m.id === id));
  const drafts = REC.list(ws).filter(r => r.status === 'draft');
  const recHint = el('span', 'small muted', { style: { flex: 1 } });
  const recBtn = el('button', { class: 'btn sm', onclick: () => {
      const picked = pickedIds(); if (!picked.length) return;
      const r = REC.fromMeasures(picked, ws);
      REC.list(ws).push(r); mSel.clear(); touch();
      toast(`${r.code} created as a draft`); go('recs/' + r.id);
    } }, '→ New draft recommendation');
  const recSel = drafts.length
    ? select([['', 'add to an existing draft…'], ...drafts.map(r => [r.id, `${r.code} ${r.title || '(untitled)'}`])], '')
    : null;
  if (recSel) recSel.addEventListener('change', () => {
    const picked = pickedIds();
    if (!recSel.value || !picked.length) return;
    const r = REC.byId(recSel.value, ws);
    REC.fromMeasures(picked, ws, r); mSel.clear(); touch();
    toast(`${picked.length} measure(s) added to ${r.code}`); go('recs/' + r.id);
  });
  function updateRecBar() {
    const n = pickedIds().length;
    recHint.textContent = n
      ? `${n} measure${n === 1 ? '' : 's'} selected — selecting measures for implementation is what creates a recommendation.`
      : 'Tick the measures you intend to implement, then create a draft recommendation for the decision-makers.';
    recBtn.disabled = !n;
    if (recSel) recSel.disabled = !n;
  }
  const recBar = el('div', 'row', { style: { marginTop: '10px', alignItems: 'center' } }, recHint, recBtn, recSel);
  updateRecBar();

  body.append(card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, 'Measures'),
      el('button', { class: 'btn sm', onclick: () => { const m = K.blankMeasure(); ws.measures.push(m); editId = m.id; touch(); render(sec); } }, 'New measure'),
      el('button', { class: 'btn sm ghost', onclick: () => { view = 'catalogue'; render(sec); } }, 'From catalogue…'),
      el('button', { class: 'btn sm ghost', onclick: () => { view = 'propose'; render(sec); } }, 'Proposals…')),
    recBar,
    rows.length ? el('div', 'tablewrap', { style: { marginTop: '10px' } }, table(cols, rows, { class: 'compact', rowClass: m => m.status === 'rejected' ? 'off' : '' }))
      : el('div', 'empty-state', el('b', null, 'No measure yet'), 'Start from the control catalogue, the rule-based proposals or Claude — or create one by hand.')));
  const m = ws.measures.find(x => x.id === editId);
  if (m) body.append(editor(m, sec));

  // scenario impact
  const tcols = [
    { key: 'id', label: 'Scenario', render: r => el('div', null, el('a', { href: '#/scenario/' + r.s.id, class: 'mono' }, r.s.id), ' ', r.s.name || ''), sort: r => r.s.id },
    { key: 'cur', label: 'Current red_p · red_i', num: true, render: r => r.error ? '—' : `${n2(r.s.red_p)} · ${n2(r.s.red_i)}` },
    { key: 'curr', label: 'Current ratio', num: true, render: r => r.error ? r.error : el('span', null, n2(r.cur.ratio), ' ', pill(r.curCls.split(' ')[0], pillFor(r.curCls))), sort: r => r.cur?.ratio ?? 0 },
    { key: 'ms', label: 'Measures', sortable: false, render: r => el('div', 'chips', ...(r.c?.measures || []).map(m => chip(m.id, { title: m.name }))) },
    { key: 'comb', label: 'Combined red_p · red_i', num: true, render: r => !r.c?.measures.length ? '—' : el('span', { title: '1 − ∏(1 − r) per dimension' }, `${n2(r.c.red_p)} · ${n2(r.c.red_i)}`) },
    { key: 'after', label: 'Ratio with measures', num: true, render: r => !r.after ? '—' : el('span', null, n2(r.after.ratio), ' ', pill(r.cls.split(' ')[0], pillFor(r.cls))), sort: r => (r.after || r.cur)?.ratio ?? 0 },
    { key: 'res', label: 'Residual current → with', num: true, render: r => r.error ? '—' : r.after ? `${n0(r.cur.res)} → ${n0(r.after.res)}` : n0(r.cur.res), sort: r => r.cur?.res ?? 0 },
    { key: 'cost', label: 'Measure cost share', num: true, render: r => money(cost.per[r.s.id] || 0), sort: r => cost.per[r.s.id] || 0 },
    { key: 'ap', label: '', sortable: false, render: r => el('div', 'btnrow',
      r.c?.measures.length ? el('button', { class: 'btn sm ghost', title: 'Write the combined reductions into the scenario (logged, reversible)', onclick: () => { K.applyToScenarios([r.s.id], ws, statuses); touch(); toast(r.s.id + ': reductions applied'); render(sec); } }, 'Apply') : null,
      r.s.redPrev ? el('button', { class: 'btn sm ghost', onclick: () => { K.revertScenario(r.s.id); touch(); render(sec); } }, 'Revert') : null) },
  ];
  const warnZero = imp.filter(r => r.c?.measures.length && (r.c.red_p === 0 || r.c.red_i === 0));
  body.append(card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, 'Effect on each scenario'),
      el('button', { class: 'btn sm', onclick: () => { const ids = imp.filter(r => r.c?.measures.length).map(r => r.s.id); const d = K.applyToScenarios(ids, ws, statuses); touch(); toast(d.length + ' scenario(s) updated'); render(sec); } }, 'Apply to all covered scenarios')),
    warnZero.length ? banner('warn', 'Measures with no effect under the workbook convention', `${warnZero.map(r => r.s.id).join(', ')}: the combined likelihood or impact reduction is 0. The CyberRiskGuardian engine computes mitigated = estimated × red_p × red_i (Excel guide v1.0c §11.5), so a package that reduces only one dimension mitigates nothing. Add a measure that reduces the other dimension, or set a non-zero effect.`) : null,
    el('div', 'tablewrap', { style: { marginTop: '10px' } }, table(tcols, imp.filter(r => r.c?.measures.length || r.s.redPrev), { class: 'compact', sortKey: 'curr', sortDir: -1 })),
    el('p', 'note', 'Only scenarios with at least one measure are listed. Apply writes red_p and red_i into the scenario, records a revision with the ratio before and after, and keeps the previous values so Revert restores them. Costs: each measure\'s Year-1 cost split equally across its scenarios, so a shared measure is never counted twice.')));
}

function editor(m, sec) {
  const ws = S.ws;
  const save = debounce(() => touch(), 300);
  const inp = (k, attrs = {}) => { const i = el('input', Object.assign({ value: m[k] ?? '' }, attrs)); i.addEventListener('change', () => { m[k] = attrs.type === 'number' ? Number(i.value) : i.value; save(); if (attrs.redraw) render(sec); }); return i; };
  const ta = k => { const t = el('textarea', null, m[k] || ''); t.addEventListener('change', () => { m[k] = t.value; save(); }); return t; };
  const sel = (k, opts) => { const s = select(opts, m[k]); s.addEventListener('change', () => { m[k] = s.value; save(); }); return s; };
  // scenarios
  const scBox = el('div', 'chips');
  for (const s of ws.assessment.SCEN) {
    const c = el('label', { class: 'chip', style: { cursor: 'pointer' } }, el('input', { type: 'checkbox', checked: m.scen.includes(s.id), style: { width: 'auto', margin: 0 },
      onchange: e => { if (e.target.checked) m.scen.push(s.id); else { m.scen = m.scen.filter(x => x !== s.id); delete m.eff[s.id]; } touch(); render(sec); } }), ' ', s.id);
    c.title = s.name; scBox.append(c);
  }
  // per-scenario effect
  const effRows = m.scen.filter(id => scen(id)).map(id => ({ id }));
  const effT = table([
    { key: 'id', label: 'Scenario', render: r => el('span', null, el('b', 'mono', r.id), ' ', scen(r.id)?.name || '') },
    { key: 'rp', label: 'Likelihood reduction rp', render: r => { const i = el('input', { type: 'number', min: 0, max: 1, step: 0.05, value: K.effect(m, r.id).rp, style: { width: '90px' } }); i.addEventListener('change', () => { (m.eff[r.id] ||= {}).rp = Math.max(0, Math.min(1, +i.value)); touch(); render(sec); }); return i; } },
    { key: 'ri', label: 'Impact reduction ri', render: r => { const i = el('input', { type: 'number', min: 0, max: 1, step: 0.05, value: K.effect(m, r.id).ri, style: { width: '90px' } }); i.addEventListener('change', () => { (m.eff[r.id] ||= {}).ri = Math.max(0, Math.min(1, +i.value)); touch(); render(sec); }); return i; } },
    { key: 'why', label: 'Rationale', render: r => { const i = el('input', { value: m.eff[r.id]?.rationale || '', placeholder: 'why this effect for this scenario' }); i.addEventListener('change', () => { (m.eff[r.id] ||= {}).rationale = i.value; save(); }); return i; } },
    { key: 'd', label: '', sortable: false, render: r => m.eff[r.id] && (m.eff[r.id].rp !== undefined || m.eff[r.id].ri !== undefined) ? el('button', { class: 'btn sm ghost', title: 'Use the measure default', onclick: () => { delete m.eff[r.id].rp; delete m.eff[r.id].ri; touch(); render(sec); } }, 'default') : el('span', 'small muted', 'default') },
  ], effRows, { class: 'compact' });
  // controls
  const ctlBox = el('div', 'chips');
  const drawCtl = () => ctlBox.replaceChildren(...(m.ctl || []).map((k, i) => { const c = K.control(k); return chip(c ? `${c.fwName} ${c.id}` : k, { kind: 'c', title: c?.title, onRemove: () => { m.ctl.splice(i, 1); touch(); drawCtl(); } }); }), (m.ctl || []).length ? null : el('span', 'small muted', 'No control linked'));
  drawCtl();
  const cq = el('input', { placeholder: 'Find a control — e.g. 8.5, AC-02, PR.AA, backup, CIS 11' });
  const cres = el('div', 'results'); cres.hidden = true;
  const box = el('div', 'picker', cq, cres);
  cq.addEventListener('input', () => {
    const hits = cq.value.trim() ? K.search({ q: cq.value, enh: true }, 25) : [];
    cres.replaceChildren(...hits.map(c => { const d = el('div', null, el('span', 'id', c.fwName + ' ' + c.id), c.title); d.addEventListener('mousedown', e => { e.preventDefault(); if (!m.ctl.includes(c.key)) { m.ctl.push(c.key); for (const t of c.tags.slice(0, 1)) if (!m.tags.includes(t)) m.tags.push(t); touch(); } cq.value = ''; cres.hidden = true; drawCtl(); }); return d; }));
    cres.hidden = !hits.length;
  });
  cq.addEventListener('blur', () => setTimeout(() => { cres.hidden = true; }, 150));
  return card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, `Edit ${m.id}`),
      el('button', { class: 'btn sm ghost danger', onclick: () => { if (!confirm(`Delete measure ${m.id}?`)) return; ws.measures = ws.measures.filter(x => x !== m); editId = null; touch(); render(sec); } }, 'Delete measure')),
    el('div', 'grid g3', { style: { marginTop: '10px' } },
      el('div', { style: { gridColumn: '1 / -1' } }, field('<b>Name</b>', inp('name'))),
      field('Function', sel('fn', K.FN)), field('Owner', inp('owner')), field('Status', sel('status', K.STATUS)),
      field('One-time cost (Year 1)', inp('initial', { type: 'number', min: 0, step: 1000 })), field('Recurring cost per year', inp('recurring', { type: 'number', min: 0, step: 1000 })),
      field('Months to benefit', inp('months', { type: 'number', min: 0, step: 1 })),
      field('<b>Default likelihood reduction rp</b> (0–1)', inp('rp', { type: 'number', min: 0, max: 1, step: 0.05, redraw: true })),
      field('<b>Default impact reduction ri</b> (0–1)', inp('ri', { type: 'number', min: 0, max: 1, step: 0.05, redraw: true })),
      field('Confidence', sel('conf', K.CONF)), field('Effort', sel('effort', ['Low', 'Medium', 'High'])),
      field('<b>What it changes</b>', sel('effect', [['', '— not stated —'], ...REC.EFFECTS.map(([k, l]) => [k, l])]),
        m.effect ? REC.EFFECT[m.effect].question : 'A measure is selected because it changes a specific part of the causal chain.'),
      field('Action verb', sel('verb', [['', '— not stated —'], ...REC.VERBS]), 'Strengthen, extend, automate… rather than a default “implement”.'),
      field('What the scenario revealed', sel('gap', [['', '— not stated —'], ...REC.GAPS.map(([k, l]) => [k, l])]),
        m.gap ? REC.GAPS.find(g => g[0] === m.gap)[2] : 'A gap, a weakness or a maturity problem — they call for different wording.'),
      field('Dependencies', inp('deps')), field('KRI / success measure', inp('kri'))),
    el('div', 'grid g2', { style: { marginTop: '10px' } }, field('Description', ta('desc')), field('Evidence and rationale', ta('evidence'))),
    el('h4', null, 'Scenarios addressed'), scBox,
    effRows.length ? el('div', 'tablewrap', { style: { marginTop: '8px' } }, effT) : null,
    el('h4', null, 'Catalogue controls implemented'), ctlBox, el('div', { style: { marginTop: '8px' } }, box),
    m.ctlText ? el('p', 'note', 'As proposed: ' + m.ctlText) : null);
}

/* ---------------- catalogue ---------------- */
function catalogue(body, sec) {
  const fwSel = select([['all', 'All frameworks'], ...K.frameworkList().map(f => [f.id, `${f.name} (${K.fwCount(f.id)})`])], cflt.fw);
  const fnSel = select([['all', 'All functions'], ...K.FN.map(f => [f, f])], cflt.fn);
  const tagSel = select([['all', 'All capabilities'], ...Object.entries(K.TAGS).map(([k, t]) => [k, t.label])], cflt.tag);
  const q = el('input', { placeholder: 'Search identifier or title — e.g. 8.13, AC-02, backup, phishing', value: cflt.q });
  const enh = el('label', { class: 'small', style: { display: 'flex', gap: '6px', alignItems: 'center' } }, el('input', { type: 'checkbox', checked: cflt.enh, style: { width: 'auto' } }), 'SP 800-53 enhancements');
  const count = el('div', 'selcount'), wrap = el('div', 'tablewrap');
  const fw = K.frameworkList().find(f => f.id === cflt.fw);
  const info = el('div');
  const draw = () => {
    const rows = K.search(cflt, 400);
    const cols = [
      { key: 'sel', label: '', sortable: false, cls: 'cb', render: c => { const b = el('input', { type: 'checkbox', checked: picked.has(c.key) }); b.addEventListener('change', () => { b.checked ? picked.add(c.key) : picked.delete(c.key); upd(); }); return b; } },
      { key: 'fwName', label: 'Framework' }, { key: 'id', label: 'ID', cls: 'mono' },
      { key: 'title', label: 'Control', render: c => el('div', null, c.title, c.note ? el('div', 'small', { style: { color: 'var(--warn)' } }, '⚑ ' + c.note) : null, el('div', 'small muted', c.grp)) },
      { key: 'fn', label: 'Function' },
      { key: 'tags', label: 'Capabilities', sortable: false, render: c => el('div', 'chips', ...c.tags.map(t => chip(K.TAGS[t]?.label || t))) },
      { key: 'used', label: 'In plan', sortable: false, render: c => { const ms = S.ws.measures.filter(m => (m.ctl || []).includes(c.key)); return ms.length ? el('div', 'chips', ...ms.map(m => chip(m.id, { title: m.name }))) : ''; } },
    ];
    wrap.replaceChildren(table(cols, rows, { class: 'compact' }));
    count.textContent = `${rows.length}${rows.length >= 400 ? '+ (refine the search)' : ''} controls shown · ${picked.size} ticked`;
  };
  const upd = () => { count.textContent = count.textContent.replace(/\d+ ticked/, picked.size + ' ticked'); };
  q.addEventListener('input', debounce(() => { cflt.q = q.value; draw(); }, 200));
  for (const [c, k] of [[fwSel, 'fw'], [fnSel, 'fn'], [tagSel, 'tag']]) c.addEventListener('change', () => { cflt[k] = c.value; render(sec); });
  enh.querySelector('input').addEventListener('change', e => { cflt.enh = e.target.checked; draw(); });
  if (fw) info.append(el('p', 'note', `${fw.name} — ${fw.origin}. ${fw.note}`));
  const target = select([['new', 'a new measure'], ...S.ws.measures.map(m => [m.id, `${m.id} ${m.name}`])], 'new');
  body.append(card(el('div', 'filterbar', el('div', 'grow', q), el('div', null, fwSel), el('div', null, fnSel), el('div', null, tagSel), enh), info,
    el('div', 'btnrow', { style: { margin: '10px 0' } },
      el('span', 'small', 'Add ticked controls to'), el('div', null, target),
      el('button', { class: 'btn sm', onclick: () => {
        if (!picked.size) { toast('Tick at least one control', 'bad'); return; }
        const keys = [...picked];
        let m = S.ws.measures.find(x => x.id === target.value);
        if (!m) {
          const c0 = K.control(keys[0]); const tag = c0.tags[0]; const T = K.TEMPLATES[tag] || {}, G = K.TAGS[tag] || {}, f = K.sizeFactor();
          m = K.blankMeasure({ name: keys.length === 1 ? c0.title : (T.name || c0.title), fn: c0.fn, owner: T.owner || '', initial: Math.round((T.initial || 0) * f / 1000) * 1000,
            recurring: Math.round((T.recurring || 0) * f / 1000) * 1000, months: T.months || 3, rp: G.rp ?? 0.2, ri: G.ri ?? 0.2, source: 'catalogue',
            rationale: 'Cost and effect pre-filled from the capability template — analytical estimate, validation required.' });
          S.ws.measures.push(m);
        }
        for (const k of keys) if (!m.ctl.includes(k)) m.ctl.push(k);
        m.tags = [...new Set([...(m.tags || []), ...keys.flatMap(k => K.control(k)?.tags.slice(0, 1) || [])])];
        picked.clear(); editId = m.id; view = 'plan'; touch(); toast(`${keys.length} control(s) added to ${m.id}`); render(sec);
      } }, 'Add'),
      el('button', { class: 'btn sm ghost', onclick: () => { picked.clear(); draw(); } }, 'Clear ticks'), count),
    wrap));
  if (K.FLAGS.length) body.append(el('details', 'card', el('summary', null, `Review flags in your control list (${K.FLAGS.length})`),
    el('p', 'note', 'Rows of Controls_list.xlsx that were corrected or kept with a note when the catalogue was built. Nothing was dropped.'),
    table([{ key: 'source', label: 'Sheet label' }, { key: 'id', label: 'As supplied', cls: 'mono' }, { key: 'title', label: 'Title' }, { key: 'note', label: 'Action' }], K.FLAGS, { class: 'compact' })));
  draw();
}

/* ---------------- proposals ---------------- */
function scenarioPicker(sec, R) {
  if (!propSel) propSel = new Set(R.inc.filter(r => r.est / r.tol > CRG.BAND_HIGH).map(r => r.id));
  const box = el('div', 'chips');
  for (const r of R.rows) {
    const c = el('label', { class: 'chip', style: { cursor: 'pointer' }, title: `${r.name} — untreated ${n2(r.est / r.tol)}` },
      el('input', { type: 'checkbox', checked: propSel.has(r.id), style: { width: 'auto', margin: 0 }, onchange: e => { e.target.checked ? propSel.add(r.id) : propSel.delete(r.id); render(sec); } }), ' ', r.id,
      r.est / r.tol > CRG.BAND_HIGH ? el('span', { style: { color: 'var(--bad)' } }, ' ▲') : null);
    box.append(c);
  }
  return el('div', null, box, el('div', 'btnrow', { style: { marginTop: '6px' } },
    el('button', { class: 'btn sm ghost', onclick: () => { propSel = new Set(R.inc.filter(r => r.est / r.tol > CRG.BAND_HIGH).map(r => r.id)); render(sec); } }, 'Untreated above tolerance'),
    el('button', { class: 'btn sm ghost', onclick: () => { propSel = new Set(R.inc.map(r => r.id)); render(sec); } }, 'All included'),
    el('button', { class: 'btn sm ghost', onclick: () => { propSel = new Set(); render(sec); } }, 'None'),
    el('span', 'small muted', `${propSel.size} scenario(s) selected · ▲ untreated above tolerance`)));
}
function propose(body, sec) {
  const R = compute();
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Scenarios'), scenarioPicker(sec, R)));
  const P = K.propose([...propSel]);
  if (!P.length) { body.append(card(el('div', 'empty-state', el('b', null, 'No proposal'), 'Select scenarios — proposals come from their ATT&CK techniques, keywords and damage profile.'))); return; }
  const keep = new Set(P.filter(p => !p.exists).map(p => p.tag));
  const list = el('div', 'grid g2');
  for (const p of P) {
    const cb = el('input', { type: 'checkbox', checked: keep.has(p.tag), disabled: !!p.exists, style: { width: 'auto' } });
    cb.addEventListener('change', () => cb.checked ? keep.add(p.tag) : keep.delete(p.tag));
    list.append(el('div', 'opt', el('div', 'row', { style: { alignItems: 'center' } }, cb, el('h4', { style: { flex: 1, margin: 0 } }, p.name)),
      el('div', 'small muted', `${p.fn} · ${p.owner} · ${money(p.initial)} + ${money(p.recurring)}/yr · ${p.months} months · rp ${p.rp}, ri ${p.ri}`),
      p.exists ? el('div', 'small', { style: { color: 'var(--good)' } }, `Already covered by ${p.exists} — extend its scenarios there.`) : null,
      el('div', 'chips', { style: { margin: '6px 0' } }, ...p.scen.map(id => chip(id, { title: p.reasons[id].join('\n') }))),
      el('div', 'chips', ...p.ctl.map(ctlChip)),
      el('details', null, el('summary', { class: 'small' }, 'Why'), el('ul', 'small', ...Object.entries(p.reasons).map(([id, rs]) => el('li', null, el('b', null, id + ': '), rs.join('; ')))))));
  }
  body.append(card(el('h2', { style: { marginTop: 0 } }, `Proposed measures (${P.length})`),
    el('p', 'note', 'Each capability is proposed once for all the selected scenarios that need it (shared control). Costs are indicative CAD figures scaled to the organization\'s size; reductions are the capability defaults. All are analytical estimates — validation required. Refine them in the plan, or ask Claude for a tailored package.'),
    list, el('div', 'btnrow', { style: { marginTop: '12px' } }, el('button', { class: 'btn', onclick: () => {
      let n = 0;
      for (const p of P) if (keep.has(p.tag) && !p.exists) {
        S.ws.measures.push(K.blankMeasure({ name: p.name, fn: p.fn, owner: p.owner, initial: p.initial, recurring: p.recurring, months: p.months, rp: p.rp, ri: p.ri, tags: [p.tag], ctl: p.ctl, scen: p.scen.slice(),
          source: 'suggest', rationale: 'Rule-based proposal — ' + Object.entries(p.reasons).map(([id, r]) => id + ': ' + r[0]).join('; ') }));
        n++;
      }
      touch(); toast(n + ' measure(s) added to the plan'); view = 'plan'; render(sec);
    } }, 'Add ticked proposals to the plan'))));
}

/* ---------------- Claude ---------------- */
function claude(body, sec) {
  const R = compute();
  body.append(card(el('h2', { style: { marginTop: 0 } }, '1 · Scenarios to send'), scenarioPicker(sec, R)));
  const prompt = K.claudePrompt([...propSel]);
  const ta = el('textarea', { class: 'mono', style: { minHeight: '220px' }, readonly: true }, prompt);
  const conf = S.ws.kind === 'organization';
  body.append(card(el('h2', { style: { marginTop: 0 } }, '2 · Request for Claude'),
    conf ? banner('warn', 'Confidential organization data', 'This request contains your organization profile and scenarios. Send it only to a Claude workspace your organization has authorized, or publish an anonymized copy from Publish & share first.') : null,
    el('p', 'note', 'Copy the request into Claude (claude.ai, the desktop app or the CyberRiskGuardian plugin). Claude answers with a JSON block of measures, costs and per-scenario reductions, which you paste back below.'),
    ta, el('div', 'btnrow', { style: { marginTop: '8px' } },
      el('button', { class: 'btn', onclick: e => copyText(prompt, e.target) }, 'Copy request'),
      el('button', { class: 'btn ghost', onclick: () => download('crg-mitigation-request.md', prompt, 'text/markdown') }, 'Download .md'))));
  const ans = el('textarea', { class: 'mono', style: { minHeight: '160px' }, placeholder: 'Paste Claude\'s whole answer here (the ```json block is found automatically)…' });
  const out = el('div');
  const fileIn = el('input', { type: 'file', accept: '.json,.md,.txt', style: { display: 'none' } });
  fileIn.addEventListener('change', async () => { ans.value = await fileIn.files[0].text(); });
  body.append(card(el('h2', { style: { marginTop: 0 } }, '3 · Import the answer'), ans,
    el('div', 'btnrow', { style: { marginTop: '8px' } },
      el('button', { class: 'btn', onclick: () => {
        try {
          const { measures, warnings } = K.parseClaude(ans.value);
          out.replaceChildren(card(el('h4', null, `${measures.length} measure(s) read`),
            warnings.length ? banner('warn', 'Notes', el('ul', null, ...warnings.map(w => el('li', null, w)))) : null,
            table([{ key: 'id', label: 'ID' }, { key: 'name', label: 'Measure' }, { key: 'scen', label: 'Scenarios', render: m => m.scen.join(', ') },
              { key: 'rp', label: 'avg rp · ri', render: m => `${n2(m.rp)} · ${n2(m.ri)}` }, { key: 'c', label: 'Year-1', num: true, render: m => money(m.initial + m.recurring) }], measures, { class: 'compact' }),
            el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn', onclick: () => { S.ws.measures.push(...measures); touch(); toast(measures.length + ' measure(s) added — status Proposed'); view = 'plan'; render(sec); } }, 'Add to the plan as Proposed'))));
        } catch (e) { out.replaceChildren(banner('bad', 'Could not read the answer', e.message)); }
      } }, 'Read answer'),
      el('button', { class: 'btn ghost', onclick: () => fileIn.click() }, 'Load file…'), fileIn), out));
}

/* ---------------- about ---------------- */
function about(body) {
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'How the effect of measures is computed'),
    el('ol', null,
      el('li', null, 'Each measure has a default likelihood reduction rp and impact reduction ri (0–1), which you can override per scenario.'),
      el('li', null, 'Per scenario, the measures counted are combined separately for likelihood and impact: ', el('b', 'mono', 'red_p = 1 − ∏(1 − rp)'), ' and ', el('b', 'mono', 'red_i = 1 − ∏(1 − ri)'), '. Overlapping measures therefore never exceed 100% and have diminishing returns.'),
      el('li', null, 'The verified engine (crg.js, unchanged) then computes mitigated = estimated × red_p × red_i and residual = estimated − mitigated, as in the CyberRiskGuardian workbook (Excel guide v1.0c §11.5). Under this convention a package must reduce both dimensions to mitigate anything.'),
      el('li', null, 'Costs: a measure is one investment. Its Year-1 cost (one-time + recurring) is split equally across the scenarios it addresses; → Initiative creates the initiative that Budget, Recommendations and the Excel export use.'),
      el('li', null, 'Apply writes the combined values into the scenario with a revision entry (ratio before and after). Revert restores the previous values.'))),
    card(el('h2', { style: { marginTop: 0 } }, 'Catalogue sources'),
      table([{ key: 'name', label: 'Framework' }, { key: 'count', label: 'Controls', num: true, render: f => n0(K.fwCount(f.id)) }, { key: 'origin', label: 'Origin' }, { key: 'note', label: 'Note' }], K.frameworkList(), { class: 'compact' }),
      el('p', 'note', 'Capabilities (tags) are assigned by a transparent keyword table (tools/build_controls.py) and link each control to the CRG measures, to ATT&CK mitigations and to default effect ranges. They are aids to search, not mappings endorsed by the standards bodies.')));
}
