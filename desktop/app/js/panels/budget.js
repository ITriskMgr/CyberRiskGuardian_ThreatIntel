/* Budget — appetite-consistent cybersecurity budget, the risk-averse → risk-seeking band chart with the
   arbitrage options, and the funding frontier across scenarios. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, n2, kpi, banner, card, pill, pillFor, field, toast, table, select, money } from '../util.js';
import * as SG from '../safeguards.js';
import { S, touch, compute, initiatives, initPlan, commitments, selectBudgetYear, addBudgetYear, ensureBudgetYears, thisYear } from '../state.js';
import { bandChart, frontierChart, yearsChart } from '../charts.js';


const shortMoney = x => x >= 1e6 ? '$' + (x / 1e6).toFixed(x >= 1e7 ? 0 : 1) + 'M' : x >= 1e3 ? '$' + Math.round(x / 1e3) + 'k' : '$' + Math.round(x);

/** Arbitrage: fund included scenarios in descending cost-effectiveness order. */
export function arbitrage(R) {
  const cand = R.inc.filter(r => r.cost > 0).map(r => ({ r, ce: (r.est - r.res) / r.cost * 1000 })).sort((a, b) => b.ce - a.ce);
  const unfunded = R.inc.filter(r => !(r.cost > 0));
  let cost = 0, res = R.totals.est, above = R.inc.filter(r => r.est / r.tol > CRG.BAND_HIGH).length;
  const steps = [{ cost: 0, res, above }];
  for (const { r, ce } of cand) {
    cost += r.cost; res -= r.mit;
    if (r.est / r.tol > CRG.BAND_HIGH && r.ratio <= CRG.BAND_HIGH) above--;
    steps.push({ id: r.id, name: r.name, step: r.cost, cost, res, gain: r.mit, ce, above: r.ratio > CRG.BAND_HIGH, row: r, aboveCount: above });
  }
  return { steps, unfunded };
}

export function render(sec) {
  const ws = S.ws, a = ws.assessment;
  ensureBudgetYears(ws);
  const b = ws.budget;
  sec.replaceChildren(el('h1', null, 'Cybersecurity budget'),
    el('p', 'lede', 'Budgets by year, initiatives allocated over up to three years, and the guideline band — 4% risk seeking · 7.8% neutral · 12% risk averse of the total IT budget, salaries included. The calibrator, band chart and frontier below work on the selected year.'));
  const num = (obj, k, step, after) => { const i = el('input', { type: 'number', step, value: obj[k] ?? '' }); i.addEventListener('change', () => { obj[k] = i.value === '' ? null : Number(i.value); touch(); after ? after() : draw(); }); return i; };
  const out = el('div');
  const yearSel = select(ws.budgetYears.map(y => [y.year, String(y.year)]), ws.budgetYear);
  yearSel.addEventListener('change', () => selectBudgetYear(yearSel.value));
  sec.append(card(el('div', 'grid g5',
    field('<b>Budget year</b>', yearSel),
    field('<b>Total IT budget</b> (incl. salaries)', num(b, 'it_budget', 100000)),
    field('<b>Appetite</b>', num(a, 'APPETITE', 0.05)),
    field('Planned cyber spend', num(b, 'spend', 10000)),
    field('Baseline (run) security cost', num(b, 'baseline', 10000),
      // 1.5.5 — the inventory of existing safeguards knows what the run cost actually is. Offered,
      // never applied: the baseline includes staff and overheads the inventory does not carry.
      el('span', null, 'Existing staff and tools; option costs are added to it. ',
        SG.runCost() ? el('span', null, 'The inventory of existing safeguards adds up to ',
          el('b', null, money(SG.runCost())), ' a year. ',
          el('button', { class: 'btn xs ghost', onclick: () => {
            const before = Number(b.baseline) || 0;
            if (before && !confirm(`Replace the baseline of ${money(before)} with ${money(SG.runCost())} from the inventory?`)) return;
            b.baseline = SG.runCost(); touch(); toast('Baseline taken from the inventory — add staff and overheads it does not carry');
            render(sec);
          } }, 'Use it')) : el('span', null, 'Record what is in force under Existing safeguards and this can be taken from the inventory.'))))), out);
  const draw = () => { out.replaceChildren(); years(out, sec); body(out); };
  draw();
}

/* ---------------- years and multi-year allocation ---------------- */
function years(out, sec) {
  const ws = S.ws, a = ws.assessment;
  const { per, rows } = commitments(ws);
  const target = CRG.budgetTarget(Number(a.APPETITE)), B = CRG.BUDGET_BAND;
  const t = el('table', 'grid compact');
  t.append(el('thead', null, el('tr', null, ...['Year', 'Total IT budget', 'Planned cyber spend', 'Actual cyber spend', 'Baseline', 'Committed initiatives', 'Baseline + committed', '% of IT', 'Against the guideline', 'Note', ''].map(h => el('th', null, h)))));
  const tb = el('tbody');
  for (const y of ws.budgetYears) {
    const inp = (k, w) => { const i = el('input', { type: k === 'note' ? 'text' : 'number', value: y[k] ?? '', style: { width: w } }); i.addEventListener('change', () => { y[k] = k === 'note' ? i.value : i.value === '' ? null : Number(i.value); touch(); render(sec); }); return i; };
    const com = per[y.year] || 0, tot = (Number(y.baseline) || 0) + com, p = y.it_budget > 0 ? tot / y.it_budget : null;
    const verdict = p === null ? pill('enter the IT budget', '') : p > B.max ? pill('above the 12% ceiling', 'warn') : Math.abs(p - target) <= 0.005 ? pill('at the appetite target', 'good')
      : p > target ? pill('above the appetite target', 'warn') : p < B.min ? pill('below the 4% floor', 'bad') : pill('below the appetite target', 'warn');
    tb.append(el('tr', y.year === ws.budgetYear ? 'sel' : null,
      el('td', null, el('button', { class: 'btn sm ' + (y.year === ws.budgetYear ? '' : 'ghost'), onclick: () => selectBudgetYear(y.year) }, String(y.year))),
      el('td', null, inp('it_budget', '130px')), el('td', null, inp('spend', '110px')), el('td', null, inp('actual', '110px')), el('td', null, inp('baseline', '110px')),
      el('td', 'num', money(com)), el('td', 'num', money(tot)), el('td', 'num', p === null ? '—' : (p * 100).toFixed(2) + '%'), el('td', null, verdict),
      el('td', null, inp('note', '150px')),
      el('td', null, ws.budgetYears.length > 1 ? el('button', { class: 'btn sm ghost danger', onclick: () => { if (!window.confirm('Remove budget year ' + y.year + '?')) return; ws.budgetYears.splice(ws.budgetYears.indexOf(y), 1); ensureBudgetYears(ws); touch(); render(sec); } }, '×') : null)));
  }
  t.append(tb);
  const last = ws.budgetYears[ws.budgetYears.length - 1].year, first = ws.budgetYears[0].year;
  const chartYears = ws.budgetYears.map(y => ({ year: y.year, it: Number(y.it_budget) || 0, baseline: Number(y.baseline) || 0, committed: per[y.year] || 0, planned: Number(y.spend) || 0, actual: Number(y.actual) || 0, selected: y.year === ws.budgetYear }));
  const outside = Object.keys(per).map(Number).filter(y => !ws.budgetYears.some(b => b.year === y) && per[y] > 0);
  out.append(el('h2', null, 'Budget by year'), card(el('div', 'tablewrap', t),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn sm', onclick: () => { addBudgetYear(last + 1); touch(); render(sec); } }, `Add ${last + 1}`),
      el('button', { class: 'btn sm ghost', onclick: () => { addBudgetYear(first - 1); touch(); render(sec); } }, `Add ${first - 1}`),
      outside.length ? el('span', 'small', pill(`Initiatives commit spend in ${outside.join(', ')} — add ${outside.length > 1 ? 'those years' : 'that year'}`, 'warn')) : null),
    el('p', 'note', 'New years copy the IT budget, planned spend and baseline of the previous year as a starting point. Committed initiatives come from the allocation below. Planned spend and actual spend are tracked separately so the gap can be explained.'),
    yearsChart({ years: chartYears, band: B, target, money: shortMoney }),
    el('div', 'legend', el('span', null, el('i', { style: { background: 'var(--muted)', opacity: .45 } }), 'baseline'), el('span', null, el('i', { style: { background: 'var(--series-1)' } }), 'committed initiatives'),
      el('span', null, el('i', { style: { background: 'var(--series-2)' } }), 'planned cyber spend (bar)'), el('span', null, el('i', { style: { background: 'var(--ink)' } }), 'actual (◆)'), el('span', null, 'all as % of that year\'s IT budget'))));

  // allocation
  const at = el('table', 'grid compact');
  const yrs = [...new Set([...ws.budgetYears.map(y => y.year), ...Object.keys(per).map(Number)])].sort();
  at.append(el('thead', null, el('tr', null, ...['Initiative', 'Initial', 'Recurring / yr', 'Start year', 'Years', 'Split', 'Year 1', 'Year 2', 'Year 3', '3-year total'].map(h => el('th', null, h)))));
  const ab = el('tbody');
  for (const { o, p } of rows) {
    const save = patch => { ws.initPlan[o.id] = Object.assign({ start: p.start, mode: p.mode, years: p.years, pct: p.pct, amounts: p.amounts }, ws.initPlan[o.id] || {}, patch); touch(); render(sec); };
    const startSel = select(Array.from({ length: 7 }, (_, i) => thisYear() - 2 + i).map(y => [y, String(y)]), p.start); startSel.addEventListener('change', () => save({ start: Number(startSel.value) }));
    const nSel = select([[1, '1'], [2, '2'], [3, '3']], p.years); nSel.addEventListener('change', () => save({ years: Number(nSel.value) }));
    const mSel = select([['auto', 'Initial in Y1, recurring each year'], ['pct', '% of 3-year total'], ['amount', 'Amounts per year']], p.mode); mSel.addEventListener('change', () => save({ mode: mSel.value, amounts: p.amounts3.map(Math.round) }));
    const cell = i => {
      if (i >= p.years) return el('td', 'muted', '—');
      if (p.mode === 'auto') return el('td', 'num', money(p.amounts3[i]));
      const key = p.mode === 'pct' ? 'pct' : 'amounts';
      const inp = el('input', { type: 'number', step: p.mode === 'pct' ? 5 : 1000, value: p[key][i] ?? 0, style: { width: p.mode === 'pct' ? '70px' : '110px' } });
      inp.addEventListener('change', () => { const arr = p[key].slice(); arr[i] = Number(inp.value) || 0; save({ [key]: arr }); });
      return el('td', null, inp, p.mode === 'pct' ? el('div', 'small muted', money(p.amounts3[i])) : null);
    };
    const pctSum = p.mode === 'pct' ? p.pct.slice(0, p.years).reduce((s, x) => s + (Number(x) || 0), 0) : 100;
    ab.append(el('tr', null, el('td', null, el('b', null, o.id + ' '), (o.name || '').slice(0, 50), pctSum !== 100 ? el('div', null, pill(`split totals ${pctSum}%`, 'warn')) : null),
      el('td', 'num', money(o.initial || 0)), el('td', 'num', money(o.recurring || 0)), el('td', null, startSel), el('td', null, nSel), el('td', null, mSel),
      cell(0), cell(1), cell(2), el('td', 'num', el('b', null, money(p.amounts3.reduce((s, x) => s + x, 0))))));
  }
  ab.append(el('tr', null, el('td', { colspan: 6 }, el('b', null, 'Committed per year')), el('td', { colspan: 4 }, el('div', 'chips', ...yrs.map(y => el('span', 'chip', `${y}: ${money(per[y] || 0)}`))))));
  at.append(ab);
  out.append(el('h2', null, 'Initiatives allocated over the years (3 years max)'),
    rows.length ? card(el('div', 'tablewrap', at), el('p', 'note', 'By default an initiative spends its initial cost plus one year of recurring cost in its start year, then its recurring cost each following year. Switch to a percentage split or explicit amounts for phased projects. Initiatives themselves are edited under Recommendations → Initiative portfolio.'))
      : card(el('div', 'empty-state', el('b', null, 'No initiatives yet'), 'Add them under Recommendations → Initiative portfolio.')));
  out.append(el('h2', null, `Calibration for ${ws.budgetYear}`));
}

function body(out) {
  const ws = S.ws, a = ws.assessment, b = ws.budget;
  const it = Number(b.it_budget), app = Number(a.APPETITE), spend = Number(b.spend), base = Number(b.baseline) || 0;
  if (!(it > 0)) { out.append(banner('warn', 'IT budget required', 'Enter the total IT budget, salaries included (Organization → Risk appetite and budget, or above).')); return; }
  const target = CRG.budgetTarget(app), pct = spend / it, implied = CRG.impliedAppetite(pct), status = CRG.bandStatus(pct), B = CRG.BUDGET_BAND;
  const k = el('div', 'grid g5');
  k.append(kpi('Appetite-consistent target', (target * 100).toFixed(1) + '%', money(Math.round(target * it))),
    kpi('Current spend', (pct * 100).toFixed(2) + '%', money(spend)),
    kpi('Gap to target', money(Math.round(target * it - spend)), spend >= target * it ? 'at or above target' : 'shortfall'),
    kpi('Band status', pill(status, status === 'Within band' ? 'good' : 'warn'), `guideline ${B.min * 100}%–${B.max * 100}%`),
    kpi('Implied appetite', implied == null ? 'below floor' : implied.toFixed(2), implied == null ? 'spend under the 4% floor' : 'what this spend level implies'));
  out.append(k);
  if (implied != null && Math.abs(implied - app) >= 0.1) out.append(banner('warn', 'Spend and appetite disagree', `The stated appetite is ${app.toFixed(2)} but the spend implies ${implied.toFixed(2)}. Escalate the inconsistency rather than silently reconciling it.`));
  if (implied == null) out.append(banner('warn', 'Spend below the guideline floor', `At ${(pct * 100).toFixed(2)}% of IT the organization is more risk-seeking than the band describes. That is a management decision to make explicitly, not a default.`));

  // options
  const R = compute();
  const { steps, unfunded } = arbitrage(R);
  const aboveRows = R.inc.filter(r => r.est / r.tol > CRG.BAND_HIGH && r.cost > 0);
  const opt = (key, label, cost, res, above, color, desc) => { const y = (base + cost) / it, ia = CRG.impliedAppetite(y); return { key, label, cost, total: base + cost, y, ia, res, above, color, desc }; };
  const all = R.inc.filter(r => r.cost > 0);
  const resAfter = rows => R.totals.est - rows.reduce((s, r) => s + r.mit, 0);
  const aboveAfter = rows => R.inc.filter(r => (rows.includes(r) ? r.ratio : r.est / r.tol) > CRG.BAND_HIGH).length;
  const within = env => { const rows = []; let c = 0; for (const s of steps.slice(1)) { if (c + s.step > env) break; c += s.step; rows.push(s.row); } return rows; };
  const envAt = t => Math.max(0, t * it - base);
  const tRows = within(envAt(target));
  const options = [
    opt('A', 'A · Status quo (baseline only)', 0, R.totals.est, aboveAfter([]), 'var(--muted)', 'No new treatment. Every scenario stays at its estimated risk.'),
    opt('B', 'B · Bring above-tolerance scenarios down', aboveRows.reduce((s, r) => s + r.cost, 0), resAfter(aboveRows), aboveAfter(aboveRows), 'var(--series-3)', 'Fund the treatment of every scenario whose untreated risk exceeds tolerance.'),
    opt('C', 'C · Best value within the appetite-consistent budget', tRows.reduce((s, r) => s + r.cost, 0), resAfter(tRows), aboveAfter(tRows), 'var(--series-1)', `Fund scenarios in cost-effectiveness order until the ${(target * 100).toFixed(1)}% target is reached.`),
    opt('D', 'D · Full treatment portfolio', all.reduce((s, r) => s + r.cost, 0), resAfter(all), aboveAfter(all), 'var(--series-4)', 'Fund every included scenario\'s treatment package.'),
  ];
  const pts = [
    { x: app, y: target, color: 'var(--ink)', shape: 'diamond', label: 'Stated appetite ' + app.toFixed(2), dy: -10, tip: `<b>Stated appetite ${app.toFixed(2)}</b>Target ${(target * 100).toFixed(1)}% of IT = ${money(target * it)}` },
    { x: implied, y: pct, color: 'var(--series-2)', label: 'Current spend', tip: `<b>Current spend</b>${money(spend)} = ${(pct * 100).toFixed(2)}% of IT<br>Implied appetite ${implied == null ? 'beyond risk-seeking (below floor)' : implied.toFixed(2)}` },
    ...options.map(o => ({ x: o.ia, y: o.y, color: o.color, label: o.key, tip: `<b>${o.label}</b>Total cyber ${money(o.total)} = ${(o.y * 100).toFixed(2)}% of IT<br>Implied appetite ${o.ia == null ? (o.y > B.max ? 'above ceiling' : 'below floor') : o.ia.toFixed(2)}<br>Residual ${n0(o.res)} · ${o.above} above tolerance` })),
  ];
  out.append(el('h2', null, 'Where funding choices sit — risk averse to risk seeking'),
    card(bandChart({ target: CRG.budgetTarget, anchors: CRG.ANCHORS, band: B, points: pts }),
      el('div', 'legend', el('span', null, el('i', { style: { background: 'var(--ink)' } }), 'guideline curve and stated appetite (◆)'), el('span', null, el('i', { style: { background: 'var(--series-2)' } }), 'current spend'),
        ...options.map(o => el('span', null, el('i', { style: { background: o.color } }), o.label))),
      el('p', 'note', 'Each option is positioned at the appetite its total cybersecurity spend (baseline + Year-1 treatment cost) implies on the guideline. A spend outside the 4–12% band implies no appetite on the guideline, so it sits in the grey margin zones. Year-1 cost = initial + first-year recurring, so it approximates an annual spend level.')));
  out.append(card(el('h2', null, 'Arbitrage options'), table([
    { key: 'label', label: 'Option', render: o => el('div', null, el('b', null, o.label), el('div', 'small muted', o.desc)) },
    { key: 'cost', label: 'New Y1 cost', num: true, render: o => money(o.cost) },
    { key: 'y', label: '% of IT (total)', num: true, render: o => (o.y * 100).toFixed(2) + '%' },
    { key: 'ia', label: 'Implied appetite', num: true, render: o => o.ia == null ? (o.y > B.max ? '> ceiling' : '< floor') : o.ia.toFixed(2) },
    { key: 'res', label: 'Residual risk', num: true, render: o => n0(o.res) },
    { key: 'red', label: 'Reduction', num: true, render: o => R.totals.est ? Math.round(100 - o.res / R.totals.est * 100) + '%' : '—' },
    { key: 'above', label: 'Above tolerance', num: true, render: o => n0(o.above) },
  ], options, { sortKey: null }), el('p', 'note', 'Residual here is measured against untreated estimated risk for the included scenarios (choose them in the Risk calculator). These are decision-support comparisons; the choice — accept, transfer, avoid or mitigate — belongs to management.')));

  // frontier
  const envs = [
    { x: envAt(B.min), label: `4% risk seeking: ${shortMoney(envAt(B.min))}`, color: 'var(--series-2)' },
    { x: envAt(B.median), label: `7.8% neutral: ${shortMoney(envAt(B.median))}`, color: 'var(--muted)' },
    { x: envAt(B.max), label: `12% risk averse: ${shortMoney(envAt(B.max))}`, color: 'var(--series-1)' },
  ];
  const fundedBy = c => c <= envs[0].x ? 'risk-seeking' : c <= envs[1].x ? 'neutral' : c <= envs[2].x ? 'risk-averse' : 'beyond 12%';
  out.append(el('h2', null, 'Funding frontier — scenario by scenario'));
  if (steps.length < 2) { out.append(card(el('div', 'empty-state', el('b', null, 'No treatment costs yet'), 'Link initiatives to scenarios (Recommendations) or enter a manual Year-1 cost in the scenario editor.'))); return; }
  out.append(card(frontierChart({ steps, envelopes: envs, money: shortMoney }),
    el('div', 'legend', el('span', null, el('i', { style: { background: 'var(--series-1)' } }), 'residual after funding — scenario now at or below tolerance'), el('span', null, el('i', { style: { background: 'var(--bad)' } }), 'still above tolerance after its treatment'), el('span', null, 'Dashed lines: treatment envelope left after the baseline at each guideline level.')),
    el('div', 'tablewrap', { style: { marginTop: '12px' } }, table([
      { key: 'i', label: '#', num: true, render: (s, i) => String(i + 1) },
      { key: 'id', label: 'Scenario', render: s => el('a', { href: '#/scenario/' + s.id }, s.id + ' ' + (s.name || '').slice(0, 60)) },
      { key: 'step', label: 'Y1 cost', num: true, render: s => money(s.step) },
      { key: 'gain', label: 'Risk reduced', num: true, render: s => n0(s.gain) },
      { key: 'ce', label: 'CE / $1k', num: true, render: s => n2(s.ce) },
      { key: 'cost', label: 'Cumulative', num: true, render: s => money(s.cost) },
      { key: 'st', label: 'Status after', render: s => pill(s.row.cls, pillFor(s.row.cls)) },
      { key: 'band', label: 'Funded within', render: s => pill(fundedBy(s.cost), s.cost <= envs[0].x ? 'good' : s.cost <= envs[2].x ? 'warn' : 'bad') },
    ], steps.slice(1), { sortKey: null, class: 'compact' })),
    unfunded.length ? el('p', 'note', `${unfunded.length} included scenario(s) have no treatment cost and are not on the frontier: ${unfunded.map(r => r.id).join(', ')}.`) : null,
    el('p', 'note', 'Shared initiatives are split equally across the scenarios they address (as in the Excel Portfolio sheet), so no investment is counted twice. Funding a scenario in this view means funding its share; the real purchase decision is per initiative — see Recommendations.')));
}
