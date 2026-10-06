/* Risk calculator — portfolio table (include/exclude each scenario) and the full single-scenario calculation.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, n2, kpi, banner, card, pill, pillFor, field, toast, go, val, select, money } from '../util.js';
import { techName } from '../ontology.js';
import { S, touch, compute, setIncluded, scen, blankScenario, nextScenarioId, PARAMS } from '../state.js';

let whatIf = { appetite: null, factor: null };
let loaded = null;   // scenario id loaded in the single calculator
const flt = { q: '', status: 'all', source: 'all', owner: 'all' };

export function render(sec, arg) {
  const a = S.ws.assessment;
  if (arg && scen(arg)) loaded = arg;
  sec.replaceChildren(el('h1', null, 'Risk calculator'),
    el('p', 'lede', 'The risk of every scenario, side by side. Tick the scenarios to include in the portfolio totals — the selection is saved with the workspace and used by the dashboard, recommendations, budget and Excel export. Below, one scenario is shown with every step of the calculation.'));

  const appIn = el('input', { type: 'number', step: 0.05, min: 0.1, max: 0.9, value: whatIf.appetite ?? a.APPETITE });
  const facIn = el('input', { type: 'number', step: 100, min: 1, value: whatIf.factor ?? a.FACTOR });
  const portBox = el('div');
  const upd = () => { whatIf.appetite = Number(appIn.value) !== Number(a.APPETITE) ? Number(appIn.value) : null; whatIf.factor = Number(facIn.value) !== Number(a.FACTOR) ? Number(facIn.value) : null; portfolio(portBox, sec); };
  appIn.addEventListener('input', upd); facIn.addEventListener('input', upd);
  sec.append(card(el('div', 'row',
    el('div', { style: { width: '150px' } }, field('<b>Appetite</b>', appIn)),
    el('div', { style: { width: '150px' } }, field('Factor', facIn)),
    el('button', { class: 'btn ghost', onclick: () => { a.APPETITE = Number(appIn.value); a.FACTOR = Number(facIn.value); whatIf = { appetite: null, factor: null }; touch(); toast('Saved as the workspace appetite and factor'); portfolio(portBox, sec); } }, 'Save as workspace values'),
    el('button', { class: 'btn ghost', onclick: () => { whatIf = { appetite: null, factor: null }; appIn.value = a.APPETITE; facIn.value = a.FACTOR; portfolio(portBox, sec); } }, 'Reset'),
  ), el('div', 'note', 'Changing appetite or factor here is a what-if: totals update instantly but nothing is saved until you choose to.')), portBox);
  portfolio(portBox, sec);

  const single = el('div', { id: 'single-calc' });
  sec.append(el('h2', null, 'Single-scenario calculation'), single);
  singleCalc(single);
}

function portfolio(box, sec) {
  const ws = S.ws;
  const R = compute(ws, { appetite: whatIf.appetite ?? undefined, factor: whatIf.factor ?? undefined });
  box.replaceChildren();
  if (whatIf.appetite !== null || whatIf.factor !== null) box.append(banner('warn', 'What-if values in use', `Appetite ${R.appetite}, factor ${n0(R.factor)} — not saved.`));
  const k = el('div', 'grid g5');
  k.append(kpi('Included', `${R.inc.length} / ${R.rows.length}`, 'scenarios in totals'), kpi('Estimated', n0(R.totals.est)), kpi('Tolerated', n0(R.totals.tol)),
    kpi('Residual', n0(R.totals.res), R.totals.est ? `−${Math.round(100 - R.totals.res / R.totals.est * 100)}% after treatment` : ''),
    kpi('Portfolio Res/Tol', R.totals.tol ? n2(R.totals.res / R.totals.tol) : '—', R.totals.tol ? CRG.classify(R.totals.res / R.totals.tol) : '', R.totals.tol ? pillFor(CRG.classify(R.totals.res / R.totals.tol)) : ''));
  box.append(k);
  if (R.errors.length) box.append(banner('bad', 'Not calculable', R.errors.map(e => e.id + ': ' + e.error).join(' · ')));

  // filters (search, status, source, technique, owner) — they choose what is SHOWN; the checkboxes choose what is INCLUDED
  const srcOf = r => (r.s.threat_source || '—').split(/[.(;,]/)[0].trim() || '—';
  const sources = [...new Set(R.rows.map(srcOf))].sort();
  const owners = [...new Set(R.rows.map(r => (r.s.owner || '—').trim()))].sort();
  const q = el('input', { placeholder: 'Search scenarios — ID, name, threat, CWE, CVE, owner…', value: flt.q });
  const stSel = select([['all', 'All statuses'], ['Above', 'Above tolerance'], ['Approximately', 'Approximately at'], ['Below', 'Below tolerance'], ['inc', 'Included'], ['exc', 'Excluded']], flt.status);
  const srcSel = select([['all', 'All threat sources'], ...sources.map(x => [x, x.length > 40 ? x.slice(0, 38) + '…' : x])], flt.source);
  const ownSel = select([['all', 'All owners'], ...owners.map(x => [x, x.length > 40 ? x.slice(0, 38) + '…' : x])], flt.owner);
  const match = r => {
    if (flt.status === 'inc' ? !r.inc : flt.status === 'exc' ? r.inc : flt.status !== 'all' && !r.cls.startsWith(flt.status)) return false;
    if (flt.source !== 'all' && srcOf(r) !== flt.source) return false;
    if (flt.owner !== 'all' && (r.s.owner || '—').trim() !== flt.owner) return false;
    if (!flt.q) return true;
    const hay = [r.id, r.name, r.s.statement, r.s.threat_source, r.s.owner, r.s.assets, ...(r.s.attack || []), ...(r.s.attack || []).map(techName), ...(r.s.cwe || []), ...(r.s.cves || [])].join(' ').toLowerCase();
    return flt.q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
  };
  const holder = el('div', 'tablewrap'), count = el('span', 'selcount');
  const allBox = el('input', { type: 'checkbox', title: 'Include / exclude all shown' });
  const drawTable = () => {
    const rows = R.rows.filter(match);
    allBox.checked = rows.length > 0 && rows.every(r => r.inc); allBox.indeterminate = !allBox.checked && rows.some(r => r.inc);
    count.textContent = `${rows.length} of ${R.rows.length} shown · ${R.inc.length} included`;
    const t = el('table', 'compact');
    t.append(el('thead', null, el('tr', null, el('th', 'cb', allBox), ...['ID', 'Scenario'].map(h => el('th', null, h)),
      ...['Pb(A)', 'Pb(ψ,A)', 'CVSS', 'Estimated', 'Tolerated', 'Mitigated', 'Residual', 'Res/Tol'].map(h => el('th', 'num', h)), el('th', null, 'Status'), el('th', 'num', 'Y1 cost'))));
    const tb = el('tbody');
    for (const r of rows) {
      const c = el('input', { type: 'checkbox', checked: r.inc });
      c.addEventListener('change', () => { setIncluded(r.id, c.checked); portfolio(box, sec); });
      const tr = el('tr', (r.inc ? '' : 'off ') + (loaded === r.id ? 'sel ' : '') + 'click',
        el('td', 'cb', c), el('td', 'mono', r.id), el('td', null, el('a', { href: '#/scenario/' + r.id }, (r.name || '').slice(0, 70)), el('div', 'small muted', srcOf(r))),
        el('td', 'num', n2(val(r.s.params.PbA))), el('td', 'num', n2(val(r.s.params.Pbx))), el('td', 'num', r.cvss.toFixed(1)),
        el('td', 'num', n0(r.est)), el('td', 'num', n0(r.tol)), el('td', 'num', n0(r.mit)), el('td', 'num', n0(r.res)), el('td', 'num', n2(r.ratio)),
        el('td', null, pill(r.cls, pillFor(r.cls))), el('td', 'num', r.cost ? money(r.cost) : '—'));
      tr.addEventListener('click', e => { if (e.target.closest('input,a')) return; loaded = r.id; singleCalc(document.getElementById('single-calc')); drawTable(); document.getElementById('single-calc').scrollIntoView({ behavior: 'smooth' }); });
      tb.append(tr);
    }
    if (!rows.length) tb.append(el('tr', null, el('td', { colspan: 13, class: 'muted', style: { textAlign: 'center', padding: '18px' } }, 'No scenario matches the search and filters.')));
    tb.append(el('tr', null, el('td'), el('td'), el('td', null, el('b', null, `Total — ${R.inc.length} included`)), el('td'), el('td'), el('td'),
      el('td', 'num', el('b', null, n0(R.totals.est))), el('td', 'num', el('b', null, n0(R.totals.tol))), el('td', 'num', el('b', null, n0(R.totals.mit))),
      el('td', 'num', el('b', null, n0(R.totals.res))), el('td', 'num', el('b', null, R.totals.tol ? n2(R.totals.res / R.totals.tol) : '—')), el('td'), el('td', 'num', el('b', null, money(R.totals.cost)))));
    if (R.inc.length !== R.rows.length) tb.append(el('tr', null, el('td'), el('td'), el('td', 'muted', 'All scenarios, for comparison'), el('td'), el('td'), el('td'),
      el('td', 'num muted', n0(R.all.est)), el('td'), el('td'), el('td', 'num muted', n0(R.all.res)), el('td'), el('td'), el('td')));
    t.append(tb); holder.replaceChildren(t);
  };
  const shownIds = () => R.rows.filter(match).map(r => r.id);
  const setInc = (ids, on) => { const ex = new Set(ws.excluded || []); for (const id of ids) on ? ex.delete(id) : ex.add(id); ws.excluded = [...ex]; touch(); portfolio(box, sec); };
  allBox.addEventListener('change', () => setInc(shownIds(), allBox.checked));
  q.addEventListener('input', () => { flt.q = q.value; drawTable(); });
  for (const [ctl, k] of [[stSel, 'status'], [srcSel, 'source'], [ownSel, 'owner']]) ctl.addEventListener('change', () => { flt[k] = ctl.value; drawTable(); });
  drawTable();
  box.append(card(
    el('div', 'filterbar', el('div', 'grow', q), el('div', null, stSel), el('div', null, srcSel), el('div', null, ownSel)),
    el('div', 'btnrow', { style: { margin: '10px 0' } },
      el('button', { class: 'btn sm', onclick: () => setInc(shownIds(), true) }, 'Include shown'),
      el('button', { class: 'btn sm ghost', onclick: () => setInc(shownIds(), false) }, 'Exclude shown'),
      el('button', { class: 'btn sm ghost', onclick: () => { ws.excluded = R.rows.filter(r => !shownIds().includes(r.id)).map(r => r.id); touch(); portfolio(box, sec); } }, 'Include only shown'),
      el('button', { class: 'btn sm ghost', onclick: () => { ws.excluded = []; touch(); portfolio(box, sec); } }, 'Include all'),
      el('button', { class: 'btn sm ghost', onclick: () => { ws.excluded = R.rows.filter(r => !r.cls.startsWith('Above')).map(r => r.id); touch(); portfolio(box, sec); } }, 'Only above tolerance'),
      el('button', { class: 'btn sm ghost', onclick: () => { const top = R.rows.slice().sort((x, y) => y.est - x.est).slice(0, 10).map(r => r.id); ws.excluded = R.rows.filter(r => !top.includes(r.id)).map(r => r.id); touch(); portfolio(box, sec); } }, 'Top 10 by estimated risk'),
      count),
    holder, el('div', 'note', 'Search and filters choose which scenarios are shown; the checkboxes choose which are included in the totals. Risk units are relative decision-support indicators, not dollars. Click a row to show its full calculation below.')));
}


function singleCalc(box) {
  const a = S.ws.assessment;
  const s = scen(loaded);
  const p = s ? Object.fromEntries(PARAMS.map(k => [k, val(s.params[k])])) : { PbA: 0.7, Pbx: 0.6, De: 0.6, Dm: 0.8, Th: 0.5, Mu: 0.65 };
  const num = (id, v, step = 0.05, min = 0, max = 1) => el('input', { type: 'number', id, step, min, max, value: v });
  const cvssVal = s ? (s.cvss_score ?? s.cvss) : 9.4;
  const ins = {
    PbA: num('p-PbA', p.PbA), Pbx: num('p-Pbx', p.Pbx), De: num('p-De', p.De), Dm: num('p-Dm', p.Dm), Th: num('p-Th', p.Th, 0.05, 0.05), Mu: num('p-Mu', p.Mu),
    app: num('p-app', a.APPETITE, 0.05, 0.1, 0.9), factor: num('p-factor', a.FACTOR, 100, 1, 1e9), redp: num('p-redp', s ? s.red_p : 0.65), redi: num('p-redi', s ? s.red_i : 0.7),
    cost: num('p-cost', s ? Math.round((loadedCost(s.id)) || 0) : 62000, 1000, 0, 1e12), cvss: el('input', { type: 'text', id: 'p-cvss', class: 'mono', value: cvssVal }),
  };
  const out = el('div', { id: 'risk-out' });
  box.replaceChildren(card(
    s ? el('div', 'note', { style: { marginTop: 0, marginBottom: '10px' } }, 'Loaded from ', el('a', { href: '#/scenario/' + s.id }, s.id + ' — ' + s.name), '. Changes here are a sandbox until you save them back.')
      : el('div', 'note', { style: { marginTop: 0, marginBottom: '10px' } }, 'Ad-hoc calculation. Click a row above to load a scenario.'),
    el('div', 'grid g3',
      field('<b>Pb(A)</b> threat present', ins.PbA), field('<b>Pb(ψ,A)</b> exploitation', ins.Pbx), field('<b>δe</b> expected damage', ins.De),
      field('<b>δm</b> maximum damage', ins.Dm), field('<b>θ</b> resilience <span class="mono">(0,1]</span>', ins.Th), field('<b>μ(E)</b> criticality', ins.Mu)),
    el('div', 'grid g3', { style: { marginTop: '14px' } },
      field('Appetite', ins.app), field('Factor', ins.factor), field('Probability reduction', ins.redp), field('Impact reduction', ins.redi),
      field('Mitigation cost (for cost-effectiveness)', ins.cost), field('CVSS v4.0 Base score or vector', ins.cvss)),
    el('div', 'btnrow', { style: { marginTop: '14px' } },
      el('button', { class: 'btn', id: 'risk-run', onclick: () => run(ins, out) }, 'Calculate'),
      s ? el('button', { class: 'btn ghost', onclick: () => { saveBack(s, ins); toast('Saved to ' + s.id); } }, 'Save values to ' + s.id) : null,
      el('button', { class: 'btn ghost', onclick: () => { const n = blankScenario(nextScenarioId()); n.name = s ? s.name + ' (variant)' : 'Calculator scenario'; saveBack(n, ins); a.SCEN.push(n); touch(); toast('Created ' + n.id); go('scenario/' + n.id); } }, 'Save as new scenario'))), out);
  run(ins, out);
}
function loadedCost(id) { try { return compute().rows.find(r => r.id === id)?.cost || 0; } catch { return 0; } }
function saveBack(s, ins) {
  for (const k of PARAMS) { s.params[k] = Object.assign({}, typeof s.params[k] === 'object' ? s.params[k] : {}, { v: Number(ins[k].value) }); }
  s.red_p = Number(ins.redp.value); s.red_i = Number(ins.redi.value);
  const cv = ins.cvss.value.trim();
  if (/^CVSS:4\.0\//i.test(cv)) { s.cvss = cv; delete s.cvss_score; } else s.cvss_score = Number(cv);
  touch();
}

function run(ins, out) {
  out.replaceChildren();
  const g = k => Number(ins[k].value);
  const cv = ins.cvss.value.trim();
  const s = { id: 'calculator', params: { PbA: g('PbA'), Pbx: g('Pbx'), De: g('De'), Dm: g('Dm'), Th: g('Th'), Mu: g('Mu') }, red_p: g('redp'), red_i: g('redi') };
  if (/^CVSS:4\.0\//i.test(cv)) s.cvss = cv; else s.cvss_score = Number(cv);
  let r, sens;
  try { r = CRG.calc(s, g('app'), g('factor')); sens = CRG.sensitivity(s, 0.10, g('app'), g('factor')); }
  catch (e) { out.append(banner('bad', 'Cannot calculate', String(e.message || e))); return; }
  const cls = CRG.classify(r.ratio);
  const k = el('div', 'grid g4');
  const rk = el('div', 'kpi'); rk.append(el('div', 'k', 'Residual / tolerated'));
  const rv = el('div', 'v'); rv.append(n2(r.ratio) + ' ', pill(cls, pillFor(cls))); rk.append(rv);
  k.append(kpi('CVSS Base', n2(r.cvss)), kpi('Estimated', n0(r.est)), kpi('Tolerated', n0(r.tol)), kpi('Mitigated', n0(r.mit)), kpi('Residual', n0(r.res)), rk);
  out.append(k);
  const cost = g('cost');
  const c = el('div', 'card'); c.style.marginTop = '16px';
  c.append(el('h2', null, 'Calculation'));
  const pre = el('div', 'mono'); pre.style.whiteSpace = 'pre-wrap'; pre.style.fontSize = '12.5px';
  pre.textContent =
`Estimated = ${g('PbA')} × ${g('Pbx')} × ${n2(r.cvss)} × ((${g('De')} + ${g('Dm')})/2) × ${g('Mu')} ÷ ${g('Th')} × ${n0(g('factor'))}
          = ${n2(r.est)}
Tolerated = ${g('PbA')} × ${g('Pbx')} × ${n2(r.cvss)} × ${g('app')} × ${g('Mu')} ÷ ${g('Th')} × ${n0(g('factor'))}
          = ${n2(r.tol)}
Mitigated = ${n2(r.est)} × ${g('redp')} × ${g('redi')} = ${n2(r.mit)}
Residual  = ${n2(r.est)} − ${n2(r.mit)} = ${n2(r.res)}
Ratio     = ${n2(r.res)} ÷ ${n2(r.tol)} = ${n2(r.ratio)}` +
    (cost > 0 ? `\nCost-effectiveness = ((${n2(r.est)} − ${n2(r.res)}) ÷ ${n0(cost)}) × 1000 = ${n2((r.est - r.res) / cost * 1000)} risk-score units per $1,000` : '');
  c.append(pre);
  if (r.mit > r.est) c.append(banner('bad', 'Mitigation exceeds estimated risk', 'The reduction estimates are wrong. Revise them rather than reporting a negative or absolute-valued residual.'));
  c.append(el('div', 'note', 'Risk units are not dollars. They are relative decision-support indicators.'));
  out.append(c);
  const sc = el('div', 'card');
  sc.append(el('h2', null, 'Sensitivity, ±0.10'));
  const st = el('table');
  st.innerHTML = '<thead><tr><th>Case</th><th class="num">Estimated</th><th class="num">Residual</th><th class="num">Ratio</th><th>Classification</th></tr></thead>';
  const stb = el('tbody');
  for (const key of ['lower', 'central', 'higher']) {
    const v = sens[key];
    stb.append(el('tr', null, el('td', null, key), el('td', 'num', n0(v.estimated)), el('td', 'num', n0(v.residual)), el('td', 'num', n2(v.ratio)), el('td', null, pill(v.classification, pillFor(v.classification)))));
  }
  st.append(stb); sc.append(st);
  sc.append(sens.robust ? el('div', 'note', 'The classification holds in the lower and higher cases: the recommendation is robust.')
    : banner('warn', 'Recommendation flips', 'The classification changes between the lower and higher cases. Flag this scenario as sensitive to its assumptions.'));
  out.append(sc);
}
