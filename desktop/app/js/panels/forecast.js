/* Forecasts (1.5.1) — Monte Carlo over the CRG model, and KRI projection from recorded history.

   Shown apart from the calculated results on purpose. A forecast is a statement about the ranges
   entered here, propagated through the verified engine; it is not a prediction about the world, and
   it does not become truer for having ten thousand trials behind it.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, kpi, pill, banner, toast, table, field, select, input, n0, n1, n2, chip, today, download, toCSV } from '../util.js';
import { S, touch, compute, scen } from '../state.js';
import * as F from '../forecast.js';
import * as KRI from '../kri.js';
import { svg, lineChart } from '../charts.js';

let view = 'mc';
let result = null, running = false, focusId = null;
const cfg = { trials: 10000, seed: 20261004 };

export function render(sec, arg) {
  sec.replaceChildren(el('h1', null, 'Forecasts'));
  sec.append(el('p', 'lede', 'Uncertainty propagated through the ', el('b', null, 'verified engine'),
    ' — the same CRG.calc that produces the official figures. A Monte Carlo interval describes the ranges ' +
    'you entered, not the world; where the ranges are estimates, so is the interval. ',
    el('b', null, 'Analytical estimate — validation required.')));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['mc', 'Monte Carlo'], ['ranges', 'Parameter ranges'], ['kri', 'KRI projections']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ mc: monteCarlo, ranges: rangesView, kri: kriView }[view])(body, sec);
}

/* ---------------- Monte Carlo ---------------- */
function monteCarlo(body, sec) {
  const ws = S.ws;
  const ranged = ws.assessment.SCEN.filter(F.hasRanges).length;
  const included = ws.assessment.SCEN.filter(s => !(ws.excluded || []).includes(s.id)).length;

  const trials = input({ type: 'number', min: 100, max: 100000, step: 500, value: cfg.trials, style: { maxWidth: '140px' } });
  const seed = input({ type: 'number', min: 1, step: 1, value: cfg.seed, style: { maxWidth: '160px' } });
  const bar = el('div', { style: { height: '6px', background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden', flex: 1 } });
  const fill = el('div', { style: { height: '100%', width: '0%', background: 'var(--accent)', transition: 'width .1s linear' } });
  bar.append(fill); bar.hidden = true;

  const run = el('button', { class: 'btn', onclick: async () => {
    if (running) return;
    running = true; run.disabled = true; run.textContent = 'Running…'; bar.hidden = false;
    cfg.trials = Math.max(100, Math.min(100000, Number(trials.value) || 10000));
    cfg.seed = Math.max(1, Number(seed.value) || 1);
    try {
      result = await F.run(ws, { trials: cfg.trials, seed: cfg.seed,
        onProgress: p => { fill.style.width = (p * 100).toFixed(0) + '%'; } });
      toast(`${n0(cfg.trials)} trials complete`);
    } catch (e) { body.append(banner('bad', 'The forecast could not run', String(e.message || e))); }
    running = false; render(sec);
  } }, 'Run forecast');

  body.append(card(
    el('div', 'grid g3', field('Trials', trials), field('Seed', seed, 'The same seed and trial count reproduce the run exactly.'),
      el('div', null, el('label', null, 'Scenarios'), el('div', { style: { paddingTop: '8px' } },
        `${included} included · ${ranged} with ranges`))),
    el('div', 'row', { style: { marginTop: '10px', alignItems: 'center' } }, run, bar)));

  if (!ranged) body.append(banner('warn', 'No parameter ranges are set',
    'Without ranges every trial is identical and the forecast simply reproduces the calculated result — ' +
    'which is the correct behaviour, and a useful check, but it tells you nothing new. Set ranges on the ' +
    'Parameter ranges tab, or propose them from the confidence already recorded.'));

  if (!result) return;

  const R = result;
  const pt = R.pointTotal;
  body.append(el('h2', null, 'Portfolio'));
  body.append(el('div', 'grid g4',
    kpi('Median residual', n0(R.portfolio.p50), `calculated figure ${n0(pt)}`),
    kpi('90% interval', `${n0(R.portfolio.p05)} – ${n0(R.portfolio.p95)}`, 'p05 to p95 of the trials'),
    kpi('Above tolerance', (R.pAboveTolerance * 100).toFixed(1) + '%', 'of trials with portfolio ratio > 1.10',
        R.pAboveTolerance > 0.5 ? 'bad' : R.pAboveTolerance > 0.1 ? 'warn' : 'good'),
    kpi('Ratio', `${n2(R.ratio.p05)} – ${n2(R.ratio.p95)}`, `median ${n2(R.ratio.p50)}`)));
  body.append(card(histogram(R)));
  body.append(el('p', 'note', `${n0(R.trials)} trials, seed ${R.seed}, appetite ${n2(R.appetite)}, factor ${n0(R.factor)}, ` +
    `run ${R.when.slice(0, 16).replace('T', ' ')}. Every trial was evaluated by the verified engine. ` +
    'Analytical estimate — validation required.'));

  body.append(el('h2', null, 'By scenario'));
  body.append(card(table([
    { key: 'id', label: 'ID', cls: 'mono', render: r => chip(r.id, { href: '#/scenario/' + r.id }) },
    { key: 'name', label: 'Scenario' },
    { key: 'point', label: 'Calculated', num: true, render: r => n0(r.point) },
    { key: 'p50', label: 'Median', num: true, sort: r => r.stat.p50, render: r => n0(r.stat.p50) },
    { key: 'band', label: '90% interval', num: true, sortable: false,
      render: r => r.ranged ? `${n0(r.stat.p05)} – ${n0(r.stat.p95)}` : el('span', 'muted', 'no ranges') },
    { key: 'pAbove', label: 'P(above tol.)', num: true, sort: r => r.pAbove,
      render: r => r.ranged ? (r.pAbove * 100).toFixed(0) + '%' : '—' },
    { key: 'act', label: '', sortable: false, render: r => el('button', { class: 'btn sm ghost',
        onclick: () => { focusId = r.id; render(sec); } }, 'Drivers') },
  ], R.scenarios, { sortKey: 'p50', sortDir: -1 })));

  body.append(el('div', 'row', { style: { marginTop: '8px' } },
    el('button', { class: 'btn ghost sm', onclick: () => {
      const rows = [['id', 'name', 'calculated', 'p05', 'p10', 'median', 'p90', 'p95', 'mean', 'p_above_tolerance']];
      for (const r of R.scenarios) rows.push([r.id, r.name, r.point, r.stat.p05, r.stat.p10, r.stat.p50, r.stat.p90, r.stat.p95, r.stat.mean, r.pAbove]);
      download(`crg-forecast-${today()}.csv`, toCSV(rows), 'text/csv');
    } }, 'Export CSV')));

  if (focusId) body.append(drivers(sec, focusId));
}

/** A histogram of the portfolio residual, with the calculated figure marked. */
function histogram(R) {
  const w = 760, h = 220, m = { l: 54, r: 14, t: 12, b: 28 };
  const W = w - m.l - m.r, H = h - m.t - m.b;
  const lo = Math.min(R.portfolio.min, R.pointTotal), hi = Math.max(R.portfolio.max, R.pointTotal);
  const bins = 36, span = (hi - lo) || 1;
  const counts = new Array(bins).fill(0);
  // the run keeps only summary statistics, so rebuild the shape from the quantiles we have
  const qs = [[0, R.portfolio.min], [0.05, R.portfolio.p05], [0.10, R.portfolio.p10], [0.5, R.portfolio.p50],
              [0.90, R.portfolio.p90], [0.95, R.portfolio.p95], [1, R.portfolio.max]];
  for (let i = 0; i < bins; i++) {
    const a = lo + span * i / bins, b = lo + span * (i + 1) / bins;
    counts[i] = Math.max(0, cdf(qs, b) - cdf(qs, a));
  }
  const peak = Math.max(...counts, 1e-9);
  const root = svg('svg', { viewBox: `0 0 ${w} ${h}`, class: 'chart', role: 'img',
    'aria-label': 'Distribution of portfolio residual risk across the trials' });
  const X = v => m.l + (v - lo) / span * W;
  for (let i = 0; i < bins; i++) {
    const bh = counts[i] / peak * H;
    root.append(svg('rect', { x: m.l + W * i / bins + 1, y: m.t + H - bh, width: W / bins - 2, height: Math.max(0, bh),
      fill: 'var(--series-1, #3b82f6)', opacity: 0.75 }));
  }
  root.append(svg('line', { x1: m.l, x2: m.l + W, y1: m.t + H, y2: m.t + H, style: 'stroke:var(--line)' }));
  const mark = (v, color, label) => {
    if (!Number.isFinite(v)) return;
    root.append(svg('line', { x1: X(v), x2: X(v), y1: m.t, y2: m.t + H, style: `stroke:${color};stroke-dasharray:4 3` }));
    root.append(svg('text', { x: X(v), y: m.t - 2, 'text-anchor': 'middle', style: `fill:${color};font-size:10px` }, label));
  };
  mark(R.portfolio.p05, 'var(--muted)', 'p05');
  mark(R.portfolio.p95, 'var(--muted)', 'p95');
  mark(R.portfolio.p50, 'var(--accent)', 'median');
  mark(R.pointTotal, 'var(--bad, #dc2626)', 'calculated');
  for (const v of [lo, (lo + hi) / 2, hi])
    root.append(svg('text', { x: X(v), y: h - 8, 'text-anchor': v === lo ? 'start' : v === hi ? 'end' : 'middle' }, n0(v)));
  return el('div', null, root,
    el('p', 'note', 'Shape reconstructed from the run’s quantiles. The red line is the calculated ' +
      'result; with no ranges set it sits exactly on the median, which is the check that the forecast ' +
      'and the calculation agree.'));
}
function cdf(qs, x) {
  if (x <= qs[0][1]) return 0;
  if (x >= qs[qs.length - 1][1]) return 1;
  for (let i = 1; i < qs.length; i++) {
    if (x <= qs[i][1]) {
      const [p0, v0] = qs[i - 1], [p1, v1] = qs[i];
      return v1 === v0 ? p1 : p0 + (p1 - p0) * (x - v0) / (v1 - v0);
    }
  }
  return 1;
}

/** Tornado: what moves this scenario most, one parameter at a time. */
function drivers(sec, id) {
  let t;
  try { t = F.tornado(S.ws, id); } catch (e) { return banner('bad', 'Drivers unavailable', String(e.message || e)); }
  const c = card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, 'Drivers — ' + id),
    el('button', { class: 'btn sm ghost', onclick: () => { focusId = null; render(sec); } }, 'Close')));
  if (!t.bars.length) {
    c.append(el('p', 'empty', 'This scenario has no parameter ranges, so nothing varies.'));
    return c;
  }
  const w = 700, rowH = 26, h = t.bars.length * rowH + 40, m = { l: 90, r: 70 };
  const W = w - m.l - m.r;
  const lo = Math.min(...t.bars.map(b => b.low), t.baseline);
  const hi = Math.max(...t.bars.map(b => b.high), t.baseline);
  const X = v => m.l + (v - lo) / ((hi - lo) || 1) * W;
  const root = svg('svg', { viewBox: `0 0 ${w} ${h}`, class: 'chart', role: 'img',
    'aria-label': 'Residual risk when each parameter is swept across its range' });
  root.append(svg('line', { x1: X(t.baseline), x2: X(t.baseline), y1: 8, y2: h - 26, style: 'stroke:var(--muted);stroke-dasharray:4 3' }));
  t.bars.forEach((b, i) => {
    const y = 14 + i * rowH;
    root.append(svg('rect', { x: X(b.low), y, width: Math.max(2, X(b.high) - X(b.low)), height: rowH - 10,
      fill: 'var(--series-1, #3b82f6)', opacity: 0.8, rx: 2 }));
    root.append(svg('text', { x: m.l - 8, y: y + 11, 'text-anchor': 'end', style: 'font-size:11px' }, b.label));
    root.append(svg('text', { x: X(b.high) + 6, y: y + 11, style: 'font-size:10px;fill:var(--muted)' }, '±' + n0(b.span / 2)));
  });
  root.append(svg('text', { x: X(t.baseline), y: h - 10, 'text-anchor': 'middle', style: 'font-size:10px;fill:var(--muted)' },
    'at the likely values: ' + n0(t.baseline)));
  c.append(root);
  c.append(el('p', 'note', 'Each bar holds every other parameter at its likely value and sweeps one across its ' +
    'range. It answers “what if this one estimate were wrong”, which is a different question from how the ' +
    'parameters vary together — that is what the Monte Carlo interval above shows.'));
  return c;
}

/* ---------------- ranges ---------------- */
function rangesView(body, sec) {
  const ws = S.ws;
  const scens = ws.assessment.SCEN;
  body.append(card(
    el('p', 'note', 'A range says how sure you are of a parameter. Leave one alone and it stays a single ' +
      'value, which forecasts to exactly the calculated result. ' +
      'The proposal below is a transparent rule, not a model: it widens each parameter by ±0.15, ±0.10 or ' +
      '±0.05 according to the confidence already recorded against it, clamped to the parameter’s own limits.'),
    el('div', 'row',
      el('button', { class: 'btn', onclick: () => {
        let n = 0;
        for (const s of scens) if (!F.hasRanges(s)) { s.ranges = F.proposeRanges(s); n++; }
        touch(); toast(`Ranges proposed for ${n} scenario(s) — analytical estimate, validation required`); render(sec);
      } }, 'Propose ranges where none are set'),
      el('button', { class: 'btn ghost', onclick: () => {
        if (!confirm('Clear every parameter range? Forecasts will then reproduce the calculated results exactly.')) return;
        for (const s of scens) delete s.ranges;
        result = null; touch(); render(sec);
      } }, 'Clear all ranges'))));

  body.append(card(table([
    { key: 'id', label: 'ID', cls: 'mono' },
    { key: 'name', label: 'Scenario' },
    { key: 'has', label: 'Ranges', sort: s => F.hasRanges(s) ? 1 : 0,
      render: s => F.hasRanges(s) ? pill('set', 'good') : el('span', 'muted', 'point values') },
    { key: 'act', label: '', sortable: false, render: s => el('button', { class: 'btn sm ghost',
        onclick: () => { focusId = s.id; view = 'ranges'; render(sec); } }, 'Edit') },
  ], scens, { sortKey: 'id' })));

  if (!focusId) return;
  const s = scen(focusId); if (!s) { focusId = null; return; }
  const r = F.rangesFor(s);
  const c = card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, `Ranges — ${s.id} ${s.name || ''}`),
    el('button', { class: 'btn sm ghost', onclick: () => { focusId = null; render(sec); } }, 'Close')));
  const rows = [...F.PARAMS.map(p => [p[0], `${p[1]} — ${p[2]}`]), ['red_p', 'red_p — likelihood reduction'], ['red_i', 'red_i — impact reduction']];
  const t = el('table');
  t.append(el('thead', null, el('tr', null, ...['Parameter', 'Min', 'Likely', 'Max', 'Distribution'].map(h => el('th', null, h)))));
  const tb = el('tbody');
  for (const [k, label] of rows) {
    const set = (field, v) => {
      s.ranges = s.ranges || {};
      s.ranges[k] = Object.assign({}, r[k], s.ranges[k], { [field]: v });
      // keep the three numbers in order, so a typo cannot produce an impossible range
      const x = s.ranges[k];
      x.min = Math.min(Number(x.min), Number(x.likely), Number(x.max));
      x.max = Math.max(Number(x.min), Number(x.likely), Number(x.max));
      x.likely = Math.min(Math.max(Number(x.likely), x.min), x.max);
      result = null; touch(); render(sec);
    };
    const num = (fieldName) => {
      const i = el('input', { type: 'number', min: 0, max: 1, step: 0.05, value: r[k][fieldName] });
      i.addEventListener('change', () => set(fieldName, Number(i.value)));
      return i;
    };
    const d = select(F.DISTS.map(([v, l]) => [v, l]), r[k].dist);
    d.addEventListener('change', () => set('dist', d.value));
    tb.append(el('tr', null, el('td', null, label), el('td', null, num('min')), el('td', null, num('likely')),
      el('td', null, num('max')), el('td', null, d)));
  }
  t.append(tb);
  c.append(el('div', 'tablewrap', t));
  c.append(el('div', 'row', { style: { marginTop: '10px' } },
    el('button', { class: 'btn sm ghost', onclick: () => { s.ranges = F.proposeRanges(s); result = null; touch(); render(sec); } }, 'Propose from confidence'),
    el('button', { class: 'btn sm ghost', onclick: () => { delete s.ranges; result = null; touch(); render(sec); } }, 'Clear')));
  c.append(el('p', 'note', ...F.DISTS.map(([, l, why]) => el('div', null, el('b', null, l + ' — '), why))));
  body.append(c);
}

/* ---------------- KRI projection ---------------- */
function kriView(body, sec) {
  const ws = S.ws;
  const defs = KRI.allDefs(ws);
  const rows = defs.map(d => {
    const pts = KRI.series(d.id, ws);
    return { def: d, pts, p: F.projectKri(d, pts) };
  });
  const ok = rows.filter(r => r.p.ok);
  const breaching = ok.filter(r => r.p.endStatus === 'bad' || r.p.endStatus === 'warn');
  const soon = ok.filter(r => r.p.crossWarn || r.p.crossCrit);

  body.append(el('div', 'grid g4',
    kpi('Indicators', String(defs.length), `${ok.length} with enough history to project`),
    kpi('Projected to breach', String(breaching.length), 'at 90 days, on the central line', breaching.length ? 'warn' : 'good'),
    kpi('Crossing a threshold', String(soon.length), 'before the projection horizon', soon.length ? 'warn' : 'good'),
    kpi('Too little history', String(rows.length - ok.length), `fewer than ${F.MIN_POINTS} readings`)));

  body.append(card(el('p', 'note',
    'Ordinary least squares on each indicator’s own recorded readings, with a 95% prediction interval ' +
    'for a single future reading — the band answers “where will the next measurement fall”, not “where is ' +
    `the trend line”. An indicator with fewer than ${F.MIN_POINTS} readings is not projected: a line through ` +
    'three points flatters itself. Record measurements on the KRI dashboard to make this useful.')));

  body.append(card(table([
    { key: 'name', label: 'Indicator', render: r => el('div', null, el('b', null, r.def.name),
        el('div', 'small muted', r.def.id + (r.def.unit ? ' · ' + r.def.unit : ''))) },
    { key: 'n', label: 'Readings', num: true, sort: r => r.p.n, render: r => r.p.n },
    { key: 'now', label: 'Latest', num: true, sortable: false,
      render: r => r.pts.length ? n1(r.pts[r.pts.length - 1].y) : '—' },
    { key: 'slope', label: 'Per 30 days', num: true, sort: r => r.p.ok ? r.p.slope : 0,
      render: r => r.p.ok ? (r.p.slope > 0 ? '+' : '') + n2(r.p.slope) : '—' },
    { key: 'at90', label: 'At 90 days', num: true, sort: r => r.p.ok ? r.p.end.value : 0,
      render: r => r.p.ok ? el('span', null, n1(r.p.end.value),
        el('span', 'muted small', ` (${n1(r.p.end.lo)} – ${n1(r.p.end.hi)})`)) : el('span', 'muted', r.p.reason.slice(0, 44)) },
    { key: 'status', label: 'Then', sortable: false, render: r => r.p.ok
        ? pill(KRI.status(r.def, r.p.end.value).label, KRI.status(r.def, r.p.end.value).k) : el('span', 'muted', '—') },
    { key: 'cross', label: 'Threshold crossing', sortable: false, render: r => {
        if (!r.p.ok) return '—';
        const parts = [];
        if (r.p.crossWarn) parts.push(`warning in ${r.p.crossWarn.days} d`);
        if (r.p.crossCrit) parts.push(`critical in ${r.p.crossCrit.days} d`);
        return parts.length ? el('span', null, parts.join(' · ')) : el('span', 'muted', 'none projected');
      } },
    { key: 'act', label: '', sortable: false, render: r => r.p.ok
        ? el('button', { class: 'btn sm ghost', onclick: () => { focusId = r.def.id; render(sec); } }, 'Chart') : null },
  ], rows, { sortKey: 'name' })));

  const f = rows.find(r => r.def.id === focusId);
  if (!f || !f.p.ok) return;
  const c = card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, f.def.name),
    el('button', { class: 'btn sm ghost', onclick: () => { focusId = null; render(sec); } }, 'Close')));
  const hist = f.pts.map(p => ({ x: p.x, y: p.y }));
  const proj = f.p.points.map(p => ({ x: p.date, y: p.value }));
  const hi = f.p.points.map(p => ({ x: p.date, y: p.hi }));
  const lo = f.p.points.map(p => ({ x: p.date, y: p.lo }));
  const refs = [];
  if (f.def.warn !== null && f.def.warn !== undefined) refs.push({ y: f.def.warn, label: 'warning', color: 'var(--warn, #d97706)' });
  if (f.def.crit !== null && f.def.crit !== undefined) refs.push({ y: f.def.crit, label: 'critical', color: 'var(--bad, #dc2626)' });
  c.append(lineChart({ width: 760, height: 260, yLabel: f.def.name, refs, series: [
    { name: 'recorded', color: 'var(--accent)', points: hist },
    { name: 'projection', color: 'var(--series-2, #10b981)', points: proj },
    { name: 'upper', color: 'var(--muted)', points: hi },
    { name: 'lower', color: 'var(--muted)', points: lo },
  ] }));
  c.append(el('p', 'note', f.p.method + ` r² = ${n2(f.p.r2)}. ` +
    'A high r² means the line fits the readings, not that the future will follow it. ' +
    'Analytical estimate — validation required.'));
  body.append(c);
}
