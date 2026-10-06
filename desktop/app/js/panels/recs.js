/* Recommendations — treatment options per scenario (mitigate, transfer, avoid, accept), candidate measures
   from the initiatives, ATT&CK mitigations and the CRG catalogue, shared controls, a phased roadmap,
   the initiative portfolio editor and the management decision register.
   Every suggestion is decision support; the decision remains with management.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as users from '../users.js';
import { el, n0, n2, kpi, card, pill, pillFor, field, select, chip, toast, table, today, banner, val } from '../util.js';
import { S, touch, compute, initiatives, initObj, initArr, INIT_COLS, scen } from '../state.js';
import { tech, mitigation, measuresForTechniques, MEASURES } from '../ontology.js';
import * as REC from '../recommend.js';
import * as K from '../catalog.js';
import { money, n1, input, go } from '../util.js';

let view = 'scenarios', focus = null, recId = null;
const OPTIONS = ['Mitigate', 'Transfer', 'Avoid', 'Accept'];

/** Rule-based suggestion — transparent, reproducible, and labelled as decision support. */
export function suggest(r) {
  const s = r.s, pre = r.est / r.tol, post = r.ratio, Dm = Number(val(s.params.Dm)), Mu = Number(val(s.params.Mu));
  const out = { primary: 'Accept', also: [], why: [] };
  if (pre <= CRG.BAND_LOW) { out.primary = 'Accept'; out.why.push(`Untreated risk is already below tolerance (ratio ${n2(pre)}): accept and monitor with a KRI; reconsider spending planned treatment elsewhere.`); }
  else if (pre <= CRG.BAND_HIGH) { out.primary = 'Accept'; out.also.push('Mitigate'); out.why.push(`Untreated risk is approximately at tolerance (${n2(pre)}): accept with monitoring, or apply low-cost measures; the decision is sensitive to assumptions.`); }
  else if (post <= CRG.BAND_HIGH) { out.primary = 'Mitigate'; out.why.push(`Untreated risk is above tolerance (${n2(pre)}) and the treatment package brings it to ${n2(post)} — ${CRG.classify(post).toLowerCase()}.`); }
  else {
    out.primary = 'Mitigate'; out.why.push(`Even after the treatment package the ratio stays at ${n2(post)}: strengthen the package (higher probability or impact reduction) or combine options.`);
    if (Dm >= 0.8) { out.also.push('Transfer'); out.why.push(`Maximum damage δm = ${n2(Dm)}: transfer the financial tail (cyber insurance, contractual allocation) alongside mitigation — transfer does not reduce operational or privacy harm.`); }
    if (Mu < 0.5) { out.also.push('Avoid'); out.why.push(`The affected asset has modest criticality (μ(E) = ${n2(Mu)}): consider avoiding the risk by retiring, isolating or not deploying the exposed service.`); }
  }
  if (out.primary !== 'Accept' && !out.also.includes('Accept') && post < CRG.BAND_LOW) out.why.push('After treatment the residual risk can be formally accepted by the risk owner.');
  return out;
}

export function horizonBucket(i) {
  const m = /month\s*(\d+)/i.exec(i?.start || '');
  const n = m ? Number(m[1]) : /immediate/i.test(i?.priority || '') ? 0 : /near/i.test(i?.priority || '') ? 3 : /medium|mid/i.test(i?.priority || '') ? 6 : /long|strategic/i.test(i?.priority || '') ? 12 : null;
  if (n === null) return '6–12 months';
  return n < 3 ? '0–90 days' : n < 6 ? '3–6 months' : n < 12 ? '6–12 months' : '12–24 months';
}

export function render(sec, arg) {
  if (arg && REC.byId(arg)) { recId = arg; view = 'register'; }
  else if (arg && scen(arg)) { focus = arg; view = 'scenarios'; }
  sec.replaceChildren(el('h1', null, 'Recommendations'),
    el('p', 'lede', 'Options the organization can consider for each scenario — mitigate, transfer, avoid or accept — with the measures that address it, the controls shared across scenarios and a phased roadmap. Suggestions follow transparent rules on the tolerance ratios; they are decision support, and the decision belongs to management.'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['need', 'Treatment need'], ['register', 'Recommendations'], ['scenarios', 'By scenario'], ['shared', 'Shared controls'], ['roadmap', 'Roadmap'], ['portfolio', 'Initiative portfolio'], ['decisions', 'Decision register']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ need: needView, register, scenarios, shared, roadmap, portfolio, decisions }[view])(body, sec);
}

function scenarios(body, sec) {
  const R = compute();
  const rows = R.inc.slice().sort((a, b) => b.ratio - a.ratio);
  const counts = {}; for (const r of rows) { const p = suggest(r).primary; counts[p] = (counts[p] || 0) + 1; }
  const decided = rows.filter(r => S.ws.decisions[r.id]?.option).length;
  body.append(el('div', 'grid g5', ...OPTIONS.map(o => kpi('Suggested: ' + o, n0(counts[o] || 0), 'scenarios')), kpi('Decisions recorded', `${decided} / ${rows.length}`, 'in the decision register', decided === rows.length ? 'good' : 'warn')));
  if (!rows.length) { body.append(card(el('div', 'empty-state', el('b', null, 'No included scenarios'), 'Include scenarios in the Risk calculator.'))); return; }
  const inits = Object.fromEntries(initiatives().map(i => [i.id, i]));
  for (const r of rows) {
    const s = r.s, sg = suggest(r), dec = S.ws.decisions[r.id] || {};
    const d = el('details', 'card'); if (focus === r.id || (!focus && rows.indexOf(r) < 2)) d.open = true;
    d.append(el('summary', null, el('span', 'mono', r.id), ' ', s.name || '', ' ', pill(r.cls, pillFor(r.cls)), ' ', el('span', 'small muted', `untreated ${n2(r.est / r.tol)} → treated ${n2(r.ratio)} · suggested: ${sg.primary}${sg.also.length ? ' + ' + sg.also.join(', ') : ''}`), dec.option ? el('span', null, ' ', pill('Decided: ' + dec.option, 'good')) : ''));
    const optCards = el('div', 'grid g4', ...OPTIONS.map(o => el('div', 'opt' + (o === sg.primary ? ' rec' : ''),
      el('h4', null, o, o === sg.primary ? ' — suggested' : sg.also.includes(o) ? ' — also consider' : ''),
      el('div', 'small muted', { Mitigate: 'Reduce probability or impact with controls; residual shown is with the treatment package.', Transfer: 'Shift the financial consequence — insurance, contract, outsourcing with liability. Harm to people and operations remains.',
        Avoid: 'Stop, retire or redesign the activity or service that creates the exposure.', Accept: 'Retain the risk knowingly, within tolerance, with an accountable owner and a KRI.' }[o]))));
    const linked = (s.inits || []).map(id => inits[id]).filter(Boolean);
    const mits = [...new Set((s.attack || []).flatMap(id => tech(id)?.mitigations || []))].map(mitigation).filter(Boolean);
    const meas = measuresForTechniques(s.attack || []);
    const decSel = select([['', '— not decided —'], ...OPTIONS.map(o => [o, o])], dec.option || '');
    const own = el('input', { value: dec.owner ?? s.owner ?? '', placeholder: 'Accountable owner' });
    const hor = el('input', { value: dec.horizon ?? s.horizon ?? '', placeholder: 'e.g. 0-6 months' });
    const note = el('textarea', { rows: 2, placeholder: 'Rationale, conditions, approval reference' }); note.value = dec.note || '';
    const save = () => { S.ws.decisions[r.id] = { option: decSel.value, owner: own.value, horizon: hor.value, note: note.value, date: today(), ratio: r.ratio, cls: r.cls }; touch(); };
    for (const x of [decSel, own, hor, note]) x.addEventListener('change', () => { save(); toast('Decision recorded for ' + r.id); });
    d.append(el('ul', 'small', ...sg.why.map(w => el('li', null, w))), optCards,
      el('div', 'cols2', { style: { marginTop: '14px' } },
        el('div', null,
          el('h2', null, `Initiatives linked (${linked.length})`),
          linked.length ? table([
            { key: 'id', label: 'ID', cls: 'mono' }, { key: 'name', label: 'Initiative' }, { key: 'owner', label: 'Owner' },
            { key: 'y1', label: 'Y1 total', num: true, render: i => money(i.y1) }, { key: 'n', label: 'Shared by', num: true, render: i => i.scenarios.length + ' scen.' },
          ], linked, { class: 'compact' }) : el('p', 'note', 'No initiative linked — add or link one in the Initiative portfolio tab or the scenario editor.'),
          el('div', 'small muted', { style: { marginTop: '8px' } }, `Allocated Year-1 cost: ${money(r.cost)} · cost-effectiveness ${r.ce != null ? n2(r.ce) + ' risk units per $1k' : '—'} · treatment: ${s.treatment || '—'}`)),
        el('div', null,
          el('h2', null, `ATT&CK mitigations for the linked techniques (${mits.length})`),
          mits.length ? el('div', 'chips', ...mits.map(m => chip(m.id + ' ' + m.name, { title: m.desc, href: m.url }))) : el('p', 'note', 'Link ATT&CK techniques to the scenario to see the relevant mitigations.'),
          meas.length ? el('div', { style: { marginTop: '10px' } }, el('div', 'small muted', 'CRG measures implementing them:'), el('div', 'chips', ...meas.map(m => chip(m.name + ' · ' + m.fn)))) : null,
          sg.also.includes('Transfer') ? el('div', 'chips', { style: { marginTop: '6px' } }, chip('Cyber insurance (risk transfer) · Transfer')) : null)),
      el('h2', null, 'Management decision'),
      el('div', 'grid g4', field('<b>Option chosen</b>', decSel), field('Owner', own), field('Horizon', hor), field('Rationale', note)),
      el('p', 'note', `Suggestion basis: appetite ${R.appetite}, tolerance band ${CRG.BAND_LOW}–${CRG.BAND_HIGH}. Quantitative results are relative indicators, not loss predictions.`));
    body.append(d);
  }
}

function shared(body) {
  const R = compute();
  const inc = new Set(R.inc.map(r => r.id)), rowBy = Object.fromEntries(R.rows.map(r => [r.id, r]));
  const its = initiatives().map(i => {
    const sc = i.scenarios.filter(x => inc.has(x));
    const gain = sc.reduce((s, id) => s + (rowBy[id]?.mit || 0) / Math.max(1, (rowBy[id]?.s.inits || []).length || 1), 0);
    return Object.assign({}, i, { sc, gain, ce: i.y1 ? gain / i.y1 * 1000 : null });
  }).filter(i => i.sc.length);
  body.append(card(el('h2', null, 'Initiatives shared across scenarios'), its.length ? table([
    { key: 'id', label: 'ID', cls: 'mono' }, { key: 'name', label: 'Initiative', render: i => el('div', null, el('b', null, i.name), el('div', 'small muted', i.type || '')) },
    { key: 'n', label: 'Scenarios', num: true, render: i => n0(i.sc.length), sort: i => i.sc.length },
    { key: 'y1', label: 'Year-1 cost', num: true, render: i => money(i.y1) },
    { key: 'gain', label: 'Attributed reduction', num: true, render: i => n0(i.gain) },
    { key: 'ce', label: 'CE / $1k', num: true, render: i => i.ce != null ? n2(i.ce) : '—', sort: i => i.ce ?? -1 },
    { key: 'sc', label: 'Addresses', sortable: false, render: i => el('div', 'chips', ...i.sc.map(id => chip(id, { href: '#/scenario/' + id, title: rowBy[id]?.name }))) },
  ], its, { sortKey: 'n', sortDir: -1, class: 'compact' }) : el('p', 'note', 'No initiatives linked to included scenarios.'),
  el('p', 'note', 'Attributed reduction splits each scenario\'s mitigated risk equally across the initiatives in its package — an approximation for ranking, so a shared control is never credited twice.')));

  const mitMap = {};
  for (const r of R.inc) for (const m of new Set((r.s.attack || []).flatMap(id => tech(id)?.mitigations || []))) { const x = (mitMap[m] ||= { sc: [], res: 0 }); x.sc.push(r.id); x.res += r.res; }
  const mrows = Object.entries(mitMap).map(([id, v]) => Object.assign({ id, m: mitigation(id) }, v)).filter(x => x.m);
  body.append(card(el('h2', null, 'ATT&CK mitigations ranked by residual risk covered'), mrows.length ? table([
    { key: 'id', label: 'Mitigation', render: x => el('a', { href: x.m.url, target: '_blank', rel: 'noopener' }, x.id + ' ' + x.m.name) },
    { key: 'n', label: 'Scenarios', num: true, render: x => n0(x.sc.length), sort: x => x.sc.length },
    { key: 'res', label: 'Residual risk in those scenarios', num: true, render: x => n0(x.res) },
    { key: 'meas', label: 'CRG measures', sortable: false, render: x => el('div', 'chips', ...MEASURES.filter(m => m.mits.includes(x.id)).map(m => chip(m.name))) },
  ], mrows, { sortKey: 'res', sortDir: -1, class: 'compact' }) : el('p', 'note', 'Link ATT&CK techniques to scenarios to rank mitigations.')));
}

function roadmap(body) {
  const R = compute();
  const inc = new Set(R.inc.map(r => r.id));
  const lanes = { '0–90 days': [], '3–6 months': [], '6–12 months': [], '12–24 months': [] };
  for (const i of initiatives()) { if (!i.scenarios.some(x => inc.has(x))) continue; lanes[horizonBucket(i)].push(i); }
  body.append(card(el('h2', null, 'Phased roadmap of initiatives addressing included scenarios'),
    el('div', 'timeline', ...Object.entries(lanes).map(([k, items]) => el('div', 'lane', el('h4', null, `${k} · ${money(items.reduce((s, i) => s + i.y1, 0))}`),
      ...items.map(i => el('div', 'item', el('b', null, i.id + ' ' + i.name), el('div', 'small muted', `${i.owner || '—'} · ${money(i.y1)} Y1 · ${i.scenarios.filter(x => inc.has(x)).join(', ')}`))),
      items.length ? null : el('div', 'small muted', 'Nothing scheduled')))),
    el('p', 'note', 'Placement uses each initiative\'s start month, or its priority (Immediate → 0–90 days, Near-term → 3–6 months, Medium → 6–12 months, Long-term → 12–24 months).')));
}

function portfolio(body, sec) {
  const a = S.ws.assessment;
  const t = el('table', 'grid compact');
  const head = ['ID', 'Initiative', 'Description', 'Owner', 'Priority', 'Type', 'Initial', 'Recurring / yr', 'Start', 'End', 'Success indicator', 'Scenarios', ''];
  t.append(el('thead', null, el('tr', null, ...head.map(h => el('th', null, h)))));
  const tb = el('tbody');
  a.INITIATIVES.forEach((arr, idx) => {
    const o = initObj(arr);
    const set = (k, v) => { o[k] = v; a.INITIATIVES[idx] = initArr(o); touch(); };
    const inp = (k, w, num) => { const n = el(k === 'desc' || k === 'success' ? 'textarea' : 'input', { value: o[k] ?? '', type: num ? 'number' : null, style: { width: w } }); if (n.tagName === 'TEXTAREA') n.value = o[k] ?? ''; n.addEventListener('input', () => set(k, num ? Number(n.value) : n.value)); return n; };
    const pr = select(['', 'Immediate', 'Near-term', 'Medium-term', 'Long-term'], o.priority || ''); pr.addEventListener('change', () => set('priority', pr.value));
    const scs = el('input', { value: (o.scenarios || []).join(', '), style: { width: '140px' }, title: 'Scenario IDs, comma-separated' });
    scs.addEventListener('change', () => {
      const ids = scs.value.split(/[,\s]+/).map(x => x.trim().toUpperCase()).filter(x => scen(x));
      set('scenarios', ids);
      for (const s of a.SCEN) { const has = ids.includes(s.id), cur = new Set(s.inits || []); if (has) cur.add(o.id); else cur.delete(o.id); s.inits = [...cur]; }
      touch(); scs.value = ids.join(', ');
    });
    tb.append(el('tr', null, el('td', null, inp('id', '56px')), el('td', null, inp('name', '190px')), el('td', null, inp('desc', '220px')), el('td', null, inp('owner', '120px')), el('td', null, pr), el('td', null, inp('type', '110px')),
      el('td', null, inp('initial', '96px', true)), el('td', null, inp('recurring', '96px', true)), el('td', null, inp('start', '76px')), el('td', null, inp('end', '76px')), el('td', null, inp('success', '180px')), el('td', null, scs),
      el('td', null, el('button', { class: 'btn sm ghost danger', onclick: () => { if (!window.confirm('Remove initiative ' + o.id + '?')) return; a.INITIATIVES.splice(idx, 1); for (const s of a.SCEN) s.inits = (s.inits || []).filter(x => x !== o.id); touch(); render(sec); } }, '×'))));
  });
  t.append(tb);
  const total = initiatives().reduce((s, i) => ({ ini: s.ini + (Number(i.initial) || 0), rec: s.rec + (Number(i.recurring) || 0) }), { ini: 0, rec: 0 });
  body.append(card(el('h2', null, `Initiative portfolio (${a.INITIATIVES.length}) — initial ${money(total.ini)} · recurring ${money(total.rec)}/yr`), el('div', 'tablewrap', t),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', onclick: () => { const n = 'I' + String(a.INITIATIVES.length + 1).padStart(2, '0'); a.INITIATIVES.push(initArr({ id: n, name: '', desc: '', scenarios: [], owner: '', priority: 'Near-term', initial: 0, recurring: 0, start: 'Month 0', end: 'Month 6', success: '', dependencies: '', type: 'Prevention' })); touch(); render(sec); } }, 'Add initiative'),
      el('span', 'small muted', 'Add from the catalogue:'),
      (() => { const s = select([['', 'CRG measure…'], ...MEASURES.map(m => [m.key, m.name])], ''); s.addEventListener('change', () => { const m = MEASURES.find(x => x.key === s.value); if (!m) return; const n = 'I' + String(a.INITIATIVES.length + 1).padStart(2, '0'); a.INITIATIVES.push(initArr({ id: n, name: m.name, desc: 'ATT&CK mitigations: ' + (m.mits.join(', ') || '—'), scenarios: [], owner: '', priority: 'Near-term', initial: 0, recurring: 0, start: 'Month 0', end: 'Month 6', success: '', dependencies: '', type: m.fn })); touch(); render(sec); }); return s; })()),
    el('p', 'note', 'Costs are indicative estimates, not quotations or approved budgets. Each initiative\'s Year-1 cost (initial + recurring) is split equally across the scenarios it addresses.')));
}

function decisions(body) {
  const R = compute();
  const rows = R.rows.map(r => Object.assign({ d: S.ws.decisions[r.id] || {}, sg: suggest(r) }, r));
  body.append(card(el('h2', null, 'Decision register'), table([
    { key: 'id', label: 'ID', cls: 'mono' }, { key: 'name', label: 'Scenario', render: r => el('a', { href: '#/recs/' + r.id }, (r.name || '').slice(0, 60)) },
    { key: 'cls', label: 'Status', render: r => pill(r.cls, pillFor(r.cls)) },
    { key: 'sg', label: 'Suggested', render: r => r.sg.primary + (r.sg.also.length ? ' + ' + r.sg.also.join(', ') : ''), sort: r => r.sg.primary },
    { key: 'opt', label: 'Decision', render: r => r.d.option ? pill(r.d.option, r.d.option === r.sg.primary ? 'good' : 'warn') : el('span', 'muted', 'pending'), sort: r => r.d.option || '' },
    { key: 'own', label: 'Owner', render: r => r.d.owner || '' }, { key: 'hor', label: 'Horizon', render: r => r.d.horizon || '' },
    { key: 'date', label: 'Recorded', cls: 'mono', render: r => r.d.date || '' }, { key: 'note', label: 'Rationale', render: r => r.d.note || '' },
  ], rows, { class: 'compact' }), el('p', 'note', 'A decision that departs from the suggestion is legitimate — record why. Excluded scenarios are listed too so that exclusions are themselves a documented decision.')));
}


/* ======================= 1.5.1 — treatment need and recommendations ======================= */

/** §2: decide whether the risk requires treatment at all, before any control is offered. */
function needView(body, sec) {
  const ws = S.ws, R = compute();
  const rows = R.rows.filter(r => r.inc).map(r => Object.assign({ need: REC.need(r.ratio) }, r));
  const act = rows.filter(r => r.need.act);
  body.append(el('p', 'lede', 'A scenario does not earn a project by existing. The residual-to-tolerance ratio decides ' +
    'whether treatment is warranted; only then is a treatment objective written, and only then are controls considered. ' +
    'This is the step that stops mitigation becoming a checklist.'));
  body.append(el('div', 'grid g4',
    kpi('Needing treatment', String(act.length), `of ${rows.length} included scenarios`, act.length ? 'warn' : 'good'),
    kpi('At the boundary', String(rows.filter(r => r.need.key === 'at').length), 'monitor closely'),
    kpi('Within tolerance', String(rows.filter(r => r.need.key === 'below').length), 'no treatment required'),
    kpi('With an objective', String(rows.filter(r => (scen(r.id)?.treatment_objective || '').trim()).length),
        'objectives written in risk terms')));

  body.append(card(table([
    { key: 'id', label: 'ID', cls: 'mono', render: r => chip(r.id, { href: '#/scenario/' + r.id }) },
    { key: 'name', label: 'Scenario' },
    { key: 'ratio', label: 'Res/Tol', num: true, render: r => n2(r.ratio) },
    { key: 'verdict', label: 'Verdict', sort: r => r.need.key, render: r => pill(r.need.label, r.need.kind) },
    { key: 'why', label: 'What that means', sortable: false, render: r => el('span', 'small', r.need.text) },
  ], rows, { sortKey: 'ratio', sortDir: -1 })));

  if (!act.length) {
    body.append(banner('good', 'No included scenario is above tolerance',
      'Treatment is not indicated by the ratios. Monitor with KRIs and revisit when the assessment changes.'));
    return;
  }

  body.append(el('h2', null, 'Treatment objectives'));
  body.append(card(el('p', 'note', 'An objective is written in risk terms, not as a control name. ' +
    '“Implement MFA” is a weak objective; “reduce the probability that compromised credentials yield ' +
    'unauthorized access to a level consistent with the authentication risk tolerance” is one that a ' +
    'control can then be evaluated against.'),
    ...act.map(r => {
      const s = scen(r.id);
      const ta = el('textarea', { rows: 2, value: s.treatment_objective || '',
        placeholder: 'Reduce the probability that … to a level consistent with …' });
      ta.addEventListener('change', () => { s.treatment_objective = ta.value; touch(); });
      return el('div', { style: { padding: '10px 0', borderTop: '1px solid var(--line)' } },
        el('div', 'row', el('b', { style: { flex: 1 } }, `${r.id} — ${r.name}`),
          pill(r.need.label, r.need.kind), el('span', 'muted small', 'ratio ' + n2(r.ratio))),
        ta);
    })));
}

/* ---------------- the recommendation register ---------------- */

function register(body, sec) {
  const ws = S.ws;
  const recs = REC.list(ws);
  if (recId) { const r = REC.byId(recId, ws); if (r) return detail(body, sec, r); recId = null; }

  body.append(el('p', 'lede', 'A mitigation is a control that modifies risk. A recommendation is a management ' +
    'proposition that combines one or more mitigations, states the expected reduction, the cost, the owner and ' +
    'what remains afterwards. Drafts are for discussion; approval freezes the figures and opens tracking.'));

  if (!recs.length) {
    body.append(card(el('p', 'empty', 'No recommendation yet.'),
      el('p', 'note', 'Go to Risk mitigation, tick the measures you intend to implement, and create a draft. ' +
        'The draft collects their scenarios, costs, horizon and framework mapping for you.'),
      el('div', 'row', el('button', { class: 'btn', onclick: () => go('mitigation') }, 'Open Risk mitigation'),
        el('button', { class: 'btn ghost', onclick: () => {
          const r = REC.blank({ code: REC.nextCode(ws) }); recs.push(r); recId = r.id; touch(); render(sec);
        } }, 'Start an empty draft'))));
    return;
  }

  const live = recs.filter(r => !['rejected', 'deferred'].includes(r.status));
  const formal = recs.filter(REC.isFormal);
  const totalCost = formal.reduce((t, r) => t + REC.cost(r, ws).y1, 0);
  const reduction = formal.reduce((t, r) => t + (r.approved?.reduction || 0), 0);
  body.append(el('div', 'grid g4',
    kpi('Recommendations', String(recs.length), `${recs.filter(r => r.status === 'draft').length} draft · ${formal.length} formal`),
    kpi('Approved Year-1 cost', money(totalCost), 'one-time plus recurring'),
    kpi('Expected reduction', n0(reduction), 'at approval, from the verified engine'),
    kpi('In implementation', String(recs.filter(r => r.status === 'in-implementation').length),
        recs.filter(r => r.status === 'completed').length + ' completed')));

  body.append(card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, 'Register'),
      el('button', { class: 'btn sm ghost', onclick: () => {
        const r = REC.blank({ code: REC.nextCode(ws) }); recs.push(r); recId = r.id; touch(); render(sec);
      } }, 'New draft')),
    table([
      { key: 'code', label: 'ID', cls: 'mono', render: r => el('a', { href: '#/recs/' + r.id }, r.code) },
      { key: 'title', label: 'Recommendation', render: r => el('div', null,
          el('b', null, [r.verb, r.title].filter(Boolean).join(' ') || '(untitled)'),
          el('div', 'small muted', `${r.scenarios.length} scenario(s) · ${r.measures.length} measure(s)` +
            (r.version ? ` · v${r.version}` : ''))) },
      { key: 'status', label: 'Status', render: r => pill(REC.STATUS_LABEL[r.status], statusKind(r.status)) },
      { key: 'cost', label: 'Year-1', num: true, render: r => money(REC.cost(r, ws).y1), sort: r => REC.cost(r, ws).y1 },
      { key: 'red', label: 'Reduction', num: true, sort: r => liveReduction(r, ws),
        render: r => n0(liveReduction(r, ws)) },
      { key: 'owner', label: 'Owner', render: r => r.owner || '—' },
    ], recs, { sortKey: 'code', onRow: r => { recId = r.id; render(sec); } })));

  const groups = REC.consolidate(ws);
  body.append(el('h2', null, 'Consolidation'));
  const cc = card(el('p', 'note', 'Second optimization stage: management should receive a small number of coherent ' +
    'initiatives, not a list of controls. These drafts overlap enough to be worth merging — the grouping is a ' +
    'suggestion with its reason, and nothing is merged for you.'));
  if (!groups.length) cc.append(el('p', 'empty', 'No two drafts overlap enough to suggest merging them.'));
  for (const g of groups) {
    cc.append(el('div', { style: { padding: '10px 0', borderTop: '1px solid var(--line)' } },
      el('div', 'chips', ...g.members.map(m => chip(`${m.code} ${m.title || '(untitled)'}`, { href: '#/recs/' + m.id }))),
      el('ul', 'small', ...g.reasons.map(x => el('li', null, x)))));
  }
  body.append(cc);
}

const statusKind = k => k === 'approved' || k === 'completed' ? 'good'
  : k === 'in-implementation' ? 'good' : k === 'rejected' ? 'bad'
  : k === 'deferred' ? 'warn' : '';

function liveReduction(r, ws) { try { return REC.effect(r, ws).totals.reduction; } catch { return 0; } }

/* ---------------- one recommendation ---------------- */

function detail(body, sec, r) {
  const ws = S.ws;
  const redraw = () => { touch(); render(sec); };
  const edit = (k, attrs = {}) => {
    const i = el(attrs.rows ? 'textarea' : 'input', Object.assign({ value: r[k] ?? '' }, attrs));
    i.addEventListener('change', () => { r[k] = i.value; r.modified = today(); touch(); if (attrs.redraw) render(sec); });
    return i;
  };
  const pick = (k, opts) => { const s = select(opts, r[k]); s.addEventListener('change', () => { r[k] = s.value; touch(); render(sec); }); return s; };
  const frozen = REC.isFormal(r);

  body.append(el('div', 'row', { style: { alignItems: 'center' } },
    el('button', { class: 'btn ghost sm', onclick: () => { recId = null; render(sec); } }, '← Register'),
    el('h2', { style: { flex: 1, margin: 0 } }, `${r.code} ${r.title || '(untitled)'}`),
    pill(REC.STATUS_LABEL[r.status], statusKind(r.status)),
    r.version ? pill('v' + r.version) : null));

  const e = REC.effect(r, ws);
  const c = REC.cost(r, ws);
  body.append(el('div', 'grid g4',
    kpi('Expected reduction', n0(e.totals.reduction), 'residual risk, verified engine', e.totals.reduction > 0 ? 'good' : ''),
    kpi('Ratio', `${n2(e.totals.curRatio)} → ${n2(e.totals.aftRatio)}`, 'portfolio of its scenarios',
        e.totals.aftRatio <= 1.1 ? 'good' : 'warn'),
    kpi('Year-1 cost', money(c.y1), `${money(c.initial)} one-time + ${money(c.recurring)}/yr`),
    kpi('Brought within tolerance', String(e.totals.brought), `of ${e.rows.filter(x => x.curNeed?.act).length} above tolerance`)));

  if (frozen && r.approved) body.append(banner('good', `Formal recommendation, approved ${r.approved.at}${r.approved.by ? ' by ' + r.approved.by : ''}`,
    `Frozen at approval: reduction ${n0(r.approved.reduction)}, ratio ${n2(r.approved.curRatio)} → ${n2(r.approved.aftRatio)}, ` +
    `Year-1 cost ${money(r.approved.cost.y1)}. Those figures do not move when the workspace changes; the panel above is live. ` +
    'Editing a formal recommendation creates a new version.'));

  /* --- the twelve questions of §20 --- */
  const c1 = card(el('h2', null, 'What is being recommended'));
  c1.append(el('div', 'grid g3',
    field('Action', pick('verb', REC.VERBS), 'Precise verbs beat a default “implement”.'),
    field('What the scenario revealed', pick('gap', REC.GAPS.map(([k, l]) => [k, l]))),
    field('Horizon', edit('horizon'))));
  c1.append(field('<b>Title</b>', edit('title')));
  c1.append(field('<b>Treatment objective</b> — in risk terms, not a control name', edit('objective', { rows: 2 })));
  c1.append(field('<b>Risk rationale</b> — why it is necessary', edit('rationale', { rows: 3 })));
  c1.append(field('Causal weaknesses it treats', edit('weaknesses', { rows: 2 })));
  body.append(c1);

  /* --- what it changes --- */
  const c2 = card(el('h2', null, 'What it changes'));
  const eff = el('div', 'chips');
  for (const [k, label, q] of REC.EFFECTS) {
    const on = r.effects.includes(k);
    eff.append(el('label', { class: 'chip' + (on ? ' on' : ''), title: q, style: { cursor: 'pointer' } },
      el('input', { type: 'checkbox', checked: on, style: { width: 'auto', margin: 0 },
        onchange: ev => { if (ev.target.checked) r.effects.push(k); else r.effects = r.effects.filter(x => x !== k); touch(); render(sec); } }),
      ' ' + label));
  }
  c2.append(eff);
  if (r.effects.length) c2.append(el('ul', 'small muted', ...r.effects.map(k => el('li', null, REC.EFFECT[k].label + ' — ' + REC.EFFECT[k].question))));
  body.append(c2);

  /* --- measures and scenarios --- */
  const c3 = card(el('h2', null, 'Measures'));
  const ms = (ws.measures || []).filter(m => r.measures.includes(m.id));
  c3.append(table([
    { key: 'id', label: 'ID', cls: 'mono' },
    { key: 'name', label: 'Measure' },
    { key: 'effect', label: 'Changes', render: m => m.effect ? REC.EFFECT[m.effect].label : el('span', 'muted', 'not stated') },
    { key: 'rp', label: 'rp · ri', num: true, render: m => `${n2(m.rp)} · ${n2(m.ri)}` },
    { key: 'y1', label: 'Year-1', num: true, render: m => money((+m.initial || 0) + (+m.recurring || 0)) },
    { key: 'x', label: '', sortable: false, render: m => el('button', { class: 'btn sm ghost', onclick: () => {
        r.measures = r.measures.filter(x => x !== m.id); touch(); render(sec); } }, 'Remove') },
  ], ms, { sortKey: 'id' }));
  if (!ms.length) c3.append(el('p', 'empty', 'No measure yet. Tick measures in Risk mitigation and add them here.'));
  body.append(c3);

  const c4 = card(el('h2', null, 'Scenarios addressed'));
  c4.append(table([
    { key: 'id', label: 'ID', cls: 'mono', render: x => chip(x.id, { href: '#/scenario/' + x.id }) },
    { key: 'name', label: 'Scenario' },
    { key: 'cur', label: 'Res/Tol now', num: true, render: x => x.error ? '—' : n2(x.cur.ratio) },
    { key: 'aft', label: 'After', num: true, render: x => x.error ? '—' : n2(x.aft.ratio) },
    { key: 'cls', label: 'Then', render: x => x.error ? el('span', 'muted', x.error) : pill(x.aftNeed.label, x.aftNeed.kind) },
    { key: 'd', label: 'Reduction', num: true, render: x => x.error ? '—' : n0(x.delta) },
  ], e.rows, { sortKey: 'd', sortDir: -1 }));
  body.append(c4);

  /* --- ownership, cost, success --- */
  const c5 = card(el('h2', null, 'Decision information'));
  c5.append(el('div', 'grid g3',
    field('Owner', edit('owner')), field('Accountable', edit('accountable')),
    field('Difficulty', pick('difficulty', ['Low', 'Medium', 'High'])),
    field('Urgency', pick('urgency', ['Low', 'Medium', 'High'])),
    field('Dependencies', edit('dependencies')),
    field('Compensating measures until it lands', edit('compensating'))));
  c5.append(field('<b>How success will be measured</b> — name the KRIs', edit('success', { rows: 2 })));
  const fw = (r.frameworks || []).filter(Boolean);
  c5.append(el('h4', null, 'Framework mapping'));
  c5.append(el('p', 'note', 'Mapped after selection, for traceability and assurance. The mapping does not decide the treatment.'));
  c5.append(fw.length ? el('div', 'chips', ...fw.slice(0, 40).map(k => {
      const ctl = K.control(k);
      return chip(k, { title: ctl ? ctl.title : 'not in the loaded catalogues' });
    })) : el('p', 'empty', 'No control mapped — the measures carry no catalogue reference.'));
  body.append(c5);

  /* --- discussion --- */
  const c6 = card(el('h2', null, 'Decision-maker discussion'));
  const who = input({ placeholder: 'Who', style: { maxWidth: '180px' } });
  const note = el('textarea', { rows: 2, placeholder: 'Comment for the discussion record' });
  c6.append(el('div', 'row', who, el('button', { class: 'btn sm', onclick: () => {
    REC.comment(r, { by: who.value, note: note.value }); note.value = ''; touch(); render(sec); } }, 'Add comment')));
  c6.append(note);
  if (r.discussion.length) c6.append(el('ul', 'small', ...r.discussion.map(d =>
    el('li', null, el('b', null, (d.by || 'anonymous') + ' '), el('span', 'muted', new Date(d.at).toLocaleString() + ' — '), d.note))));
  else c6.append(el('p', 'empty', 'No comment recorded.'));
  body.append(c6);

  /* --- lifecycle --- */
  const c7 = card(el('h2', null, 'Status'));
  const missing = REC.incomplete(r, ws);
  if (missing.length && !frozen) c7.append(banner('warn', 'Not ready for approval',
    'Still needed: ' + missing.join('; ') + '.'));
  const by = input({ placeholder: 'Your name', style: { maxWidth: '180px' }, value: users.name() });
  const rn = el('input', { placeholder: 'Note for the record', style: { flex: 1 } });
  const bar = el('div', 'row', { style: { marginTop: '8px' } }, by, rn);
  for (const to of REC.allowed(r.status)) {
    bar.append(el('button', { class: 'btn sm ' + (to === 'approved' ? '' : 'ghost'), onclick: () => {
      try { REC.transition(r, to, { by: by.value, note: rn.value, ws }); redraw(); toast(`${r.code} → ${REC.STATUS_LABEL[to]}`); }
      catch (err) { body.append(banner('bad', 'That change was refused', String(err.message || err))); }
    } }, '→ ' + REC.STATUS_LABEL[to]));
  }
  if (frozen) bar.append(el('button', { class: 'btn sm ghost', onclick: () => {
    REC.amend(r, { by: by.value, note: rn.value || 'edited' }); redraw(); toast(`${r.code} amended as v${r.version}`); } }, 'Record an amendment'));
  c7.append(bar);

  if (r.status === 'in-implementation' || r.status === 'completed') {
    const pc = el('input', { type: 'number', min: 0, max: 100, step: 5, value: r.tracking.percent });
    pc.addEventListener('change', () => { r.tracking.percent = Math.max(0, Math.min(100, Number(pc.value) || 0)); touch(); });
    const due = el('input', { type: 'date', value: r.tracking.due || '' });
    due.addEventListener('change', () => { r.tracking.due = due.value; touch(); });
    const rv = el('input', { type: 'date', value: r.tracking.review || '' });
    rv.addEventListener('change', () => { r.tracking.review = rv.value; touch(); });
    c7.append(el('h4', null, 'Tracking'), el('div', 'grid g3',
      field('Progress %', pc), field('Due', due), field('Next review', rv)));
  }

  c7.append(el('h4', null, 'History'));
  c7.append(r.history.length ? table([
    { key: 'at', label: 'When', render: h => new Date(h.at).toLocaleString() },
    { key: 'action', label: 'Action' },
    { key: 'from', label: 'From', render: h => REC.STATUS_LABEL[h.from] || h.from || '—' },
    { key: 'to', label: 'To', render: h => REC.STATUS_LABEL[h.to] || h.to || '—' },
    { key: 'by', label: 'By', render: h => h.by || '—' },
    { key: 'note', label: 'Note' },
  ], r.history, { sortKey: 'at', sortDir: -1 }) : el('p', 'empty', 'Nothing recorded yet.'));
  body.append(c7);

  body.append(el('div', 'row', { style: { marginTop: '12px' } },
    el('button', { class: 'btn ghost danger', onclick: () => {
      if (!confirm(`Delete ${r.code}? Its history goes with it.`)) return;
      ws.recommendations = REC.list(ws).filter(x => x !== r); recId = null; touch(); render(sec);
    } }, 'Delete')));
}
