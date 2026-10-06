/* KRI dashboard — computed and operational key risk indicators, threshold status, recorded history,
   trend analysis and charts. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, n2, kpi, card, pill, field, select, toast, table, today, banner, download, toCSV, parseCSV } from '../util.js';
import { S, touch, compute } from '../state.js';
import { allDefs, autoValues, status, series, trend } from '../kri.js';
import { lineChart, sparkline, gauge } from '../charts.js';

let selected = 'CRG-01', compare = false;
const flt = { q: '', status: 'all', kind: 'all', owner: 'all' };
const fmtV = (d, v) => v === null || v === undefined || !Number.isFinite(v) ? '—' : (d.unit === '%' ? v.toFixed(d.fmt ?? 1) + '%' : d.fmt === 0 ? n0(v) : n2(v));
const arrow = t => t.dir === 'flat' ? '→' : t.dir === 'up' ? '↑' : '↓';

export function render(sec) {
  const ws = S.ws;
  ws.kriHistory ||= [];
  const defs = allDefs(), cur = autoValues(), R = compute();
  const lastRec = ws.kriHistory.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const curVal = d => d.manual ? (lastRec?.values?.[d.id] ?? null) : cur[d.id];
  // 1.4.0 — by default the dashboard shows the top 5 indicators (critical, then warning, then how far past
  // the threshold), recomputed at every visit. Ticking or unticking switches to a custom selection, kept with
  // the workspace; "Top 5" goes back to the automatic one. A 1.2 workspace whose selection was simply "all"
  // (the 1.2 default) is treated as automatic.
  if (!ws.kriSelMode) ws.kriSelMode = (!Array.isArray(ws.kriSel) || defs.every(d => ws.kriSel.includes(d.id))) ? 'top5' : 'custom';
  const top = topN(defs, curVal, 5);
  if (ws.kriSelMode === 'top5') ws.kriSel = top;
  const sel = new Set(ws.kriSel.filter(id => defs.some(d => d.id === id)));
  const setSel = ids => { ws.kriSel = [...ids]; ws.kriSelMode = 'custom'; touch(); render(sec); };
  const setTop = () => { ws.kriSelMode = 'top5'; touch(); render(sec); };
  sec.replaceChildren(el('h1', null, 'KRI dashboard'),
    el('p', 'lede', 'Key risk indicators for this workspace. Computed KRIs come from the assessment itself; operational KRIs (MFA coverage, patch SLAs, restore tests…) are measured by the organization and entered here. Record a measurement regularly to build the history from which trends are read.'));

  const sts = defs.map(d => status(d, curVal(d)).k);
  sec.append(el('div', 'grid g5',
    kpi('KRIs tracked', n0(defs.length), `${defs.filter(d => !d.manual).length} computed · ${defs.filter(d => d.manual).length} operational`),
    kpi('Critical', n0(sts.filter(x => x === 'bad').length), 'beyond critical threshold', sts.includes('bad') ? 'bad' : 'good'),
    kpi('Warning', n0(sts.filter(x => x === 'warn').length), 'beyond warning threshold', sts.includes('warn') ? 'warn' : ''),
    kpi('Measurements recorded', n0(ws.kriHistory.length), lastRec ? 'last ' + lastRec.date : 'none yet'),
    kpi('Scenarios above tolerance', n0(R.counts.above), `of ${R.inc.length} included`, R.counts.above ? 'bad' : 'good')));

  // record
  const date = el('input', { type: 'date', value: today() });
  const note = el('input', { placeholder: 'Note — e.g. after Q3 patch campaign, snapshot refreshed' });
  const manIns = {};
  const manual = defs.filter(d => d.manual);
  const recSet = ws.kriSelMode === 'top5' ? new Set(defs.map(d => d.id)) : sel; // automatic mode records every indicator
  const manGrid = el('div', 'grid g4');
  for (const d of manual.filter(d => recSet.has(d.id))) {
    const i = el('input', { type: 'number', step: 'any', placeholder: d.raw?.target ? 'target ' + d.raw.target : '' });
    manIns[d.id] = i; manGrid.append(field(`<b>${d.id}</b> ${d.name}` + (d.unit ? ` (${d.unit})` : ''), i));
  }
  sec.append(card(el('h2', null, 'Record a measurement'),
    el('div', 'grid g3', field('<b>Date</b>', date), el('div', { class: 'spanall', style: { gridColumn: 'span 2' } }, field('Note', note))),
    manual.length ? el('details', { style: { marginTop: '12px' } }, el('summary', { style: { cursor: 'pointer', fontWeight: 600 } }, `Enter operational KRI values (${manual.filter(d => recSet.has(d.id)).length}) — leave empty what was not measured`), el('div', { style: { marginTop: '10px' } }, manGrid)) : el('p', 'note', 'No operational KRIs defined yet — add them below.'),
    el('div', 'btnrow', { style: { marginTop: '12px' } }, el('button', { class: 'btn', onclick: () => {
      const values = {};
      for (const [k, v] of Object.entries(autoValues())) if (Number.isFinite(v) && recSet.has(k)) values[k] = +v.toFixed(4);
      for (const [k, i] of Object.entries(manIns)) if (i.value !== '') values[k] = Number(i.value);
      const ex = ws.kriHistory.find(h => h.date === date.value);
      if (ex) { Object.assign(ex.values, values); ex.note = note.value || ex.note; } else ws.kriHistory.push({ date: date.value, values, note: note.value, appetite: ws.assessment.APPETITE, scenarios: R.inc.length });
      touch(); toast('Measurement recorded for ' + date.value); render(sec);
    } }, 'Record computed + entered values'),
    el('span', 'small muted', ws.kriSelMode === 'top5' ? 'Records every indicator (automatic top-5 view): computed ones as they stand now, operational ones as entered. Recording on an existing date updates it.' : `Records the ${sel.size} selected indicator(s): computed ones as they stand now, operational ones as entered. Recording on an existing date updates it.`))));

  // filters + selection
  const rowsAll = defs.map(d => { const pts = series(d.id); return { d, v: curVal(d), st: status(d, curVal(d)), pts, tr: trend(d, pts) }; });
  const owners = [...new Set(defs.map(d => d.manual ? d.owner : 'computed').filter(Boolean))].sort();
  const match = r => {
    if (flt.status !== 'all' && r.st.k !== flt.status) return false;
    if (flt.kind !== 'all' && (flt.kind === 'computed') === !!r.d.manual) return false;
    if (flt.owner !== 'all' && (r.d.manual ? r.d.owner : 'computed') !== flt.owner) return false;
    if (flt.q && !([r.d.id, r.d.name, r.d.method, r.d.risk, r.d.source, r.d.owner].join(' ').toLowerCase().includes(flt.q.toLowerCase()))) return false;
    return true;
  };

  // gauges for the selected indicators
  const gBox = el('div', 'gauges');
  for (const r of rowsAll.filter(r => sel.has(r.d.id))) {
    const f = v => r.d.unit === '%' ? Math.round(v) + '%' : r.d.fmt === 0 ? n0(v) : n2(v);
    const g = gauge({ value: r.v, target: r.d.target, warn: r.d.warn, crit: r.d.crit, dir: r.d.dir, unit: r.d.unit, fmt: f });
    gBox.append(el('div', { class: 'gcard ' + (r.st.k === 'bad' ? 'bad' : r.st.k === 'warn' ? 'warn' : ''), title: 'Click for the trend', onclick: () => { selected = r.d.id; drawDetail(); detail.scrollIntoView({ behavior: 'smooth' }); } },
      el('div', 'gname', el('b', null, r.d.id), r.d.name),
      g || el('div', 'gtile', 'no thresholds — tracked value'),
      el('div', 'gval', fmtV(r.d, r.v)),
      el('div', 'gsub', pill(r.st.label, r.st.k === 'bad' ? 'bad' : r.st.k === 'warn' ? 'warn' : r.st.k === 'good' ? 'good' : ''), ' ', r.tr.n >= 2 ? `${arrow(r.tr)} ${r.tr.label}` : '')));
  }
  sec.append(card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, ws.kriSelMode === 'top5' ? `Gauges — top ${sel.size} indicators` : `Gauges — ${sel.size} selected indicator(s)`),
      ws.kriSelMode === 'top5' ? pill('automatic: worst first', 'good') : el('button', { class: 'btn sm ghost', onclick: setTop, title: 'Show the five indicators most in need of attention' }, 'Reset to top 5'),
      el('button', { class: 'btn sm ghost', onclick: () => { compare = !compare; render(sec); } }, compare ? 'Hide comparison' : 'Compare selected trends')),
    el('div', 'legend', { style: { margin: '8px 0 12px' } }, el('span', null, el('i', { style: { background: 'var(--good)' } }), 'on target'), el('span', null, el('i', { style: { background: 'var(--warn)' } }), 'warning'), el('span', null, el('i', { style: { background: 'var(--bad)' } }), 'critical'), el('span', null, '▮ target · needle = current value')),
    sel.size ? gBox : el('p', 'note', 'No indicator selected — tick indicators in the table below.')));
  if (compare) {
    const mBox = el('div', 'multiples');
    for (const r of rowsAll.filter(r => sel.has(r.d.id))) {
      const refs = [];
      if (Number.isFinite(r.d.warn)) refs.push({ y: r.d.warn, label: 'warning', color: 'var(--warn)' });
      if (Number.isFinite(r.d.crit)) refs.push({ y: r.d.crit, label: 'critical', color: 'var(--bad)' });
      mBox.append(el('div', 'opt', el('h4', null, r.d.id + ' ' + r.d.name), r.pts.length ? lineChart({ series: [{ name: r.d.name, color: 'var(--series-1)', points: r.pts }], refs, width: 420, height: 170, yFmt: v => r.d.unit === '%' ? v.toFixed(0) + '%' : (Math.abs(v) >= 100 ? n0(v) : n2(v)) }) : el('div', 'small muted', 'no history yet')));
    }
    sec.append(card(el('h2', null, 'Trends of the selected indicators'), el('p', 'note', 'One chart per indicator, each on its own scale — indicators with different units are never forced onto one axis.'), mBox));
  }

  // table
  const q = el('input', { placeholder: 'Search indicators — ID, name, method, owner…', value: flt.q });
  const stSel = select([['all', 'All statuses'], ['bad', 'Critical'], ['warn', 'Warning'], ['good', 'On target'], ['info', 'Tracked, no threshold'], ['none', 'No data']], flt.status);
  const kindSel = select([['all', 'Computed and operational'], ['computed', 'Computed'], ['operational', 'Operational']], flt.kind);
  const ownSel = select([['all', 'All owners'], ...owners.map(o => [o, o])], flt.owner);
  const count = el('div', 'selcount');
  const shown = () => rowsAll.filter(match);
  const tick = el('input', { type: 'checkbox', title: 'Select all shown' });
  const cols = [
    { key: 'sel', label: '', labelNode: tick, sortable: false, cls: 'cb', render: r => { const c = el('input', { type: 'checkbox', checked: sel.has(r.d.id), title: 'Show as gauge and record' }); c.addEventListener('change', () => { c.checked ? sel.add(r.d.id) : sel.delete(r.d.id); setSel(sel); }); return c; } },
    { key: 'id', label: 'KRI', render: r => el('div', null, el('b', null, r.d.id + ' '), r.d.name, el('div', 'small muted', r.d.method || r.d.risk || '')), sort: r => r.d.id },
    { key: 'v', label: 'Current', num: true, render: r => fmtV(r.d, r.v), sort: r => r.v ?? -1 },
    { key: 'th', label: 'Target · warning · critical', render: r => r.d.raw ? [r.d.raw.target, r.d.raw.warning, r.d.raw.critical].map(x => x || '—').join(' · ')
      : r.d.target === null && r.d.warn === null ? 'tracked, no threshold'
      : (() => { const dn = r.d.dir === 'down', inc = r.d.unit === 'count'; const g = dn ? '≤' : '≥', b = dn ? (inc ? '≥' : '>') : (inc ? '≤' : '<');
          return `${g}${r.d.target ?? '—'} · ${b}${r.d.warn ?? '—'} · ${b}${r.d.crit ?? '—'}`; })() },
    { key: 'st', label: 'Status', render: r => pill(r.st.label, r.st.k === 'bad' ? 'bad' : r.st.k === 'warn' ? 'warn' : r.st.k === 'good' ? 'good' : ''), sort: r => ({ bad: 0, warn: 1, good: 2, info: 3, none: 4 }[r.st.k]) },
    { key: 'sp', label: 'History', sortable: false, render: r => sparkline(r.pts.map(p => p.y), r.tr.good === false ? 'var(--bad)' : 'var(--series-1)') },
    { key: 'tr', label: 'Trend', render: r => el('span', { class: r.tr.good === null || r.tr.good === undefined ? 'flat' : r.tr.good ? 'up-good' : 'up-bad', style: { fontWeight: 600 } }, r.tr.n >= 2 ? `${arrow(r.tr)} ${r.tr.label}` : r.tr.label), sort: r => r.tr.good === false ? 0 : r.tr.good ? 2 : 1 },
    { key: 'own', label: 'Owner · frequency', render: r => r.d.manual ? [r.d.owner, r.d.freq].filter(Boolean).join(' · ') : 'computed' },
  ];
  const t = table(cols, shown(), { onRow: r => { selected = r.d.id; drawDetail(); detail.scrollIntoView({ behavior: 'smooth' }); }, sortKey: 'st', sortDir: 1, class: 'compact', rowClass: r => sel.has(r.d.id) ? '' : 'off' });
  const upd = () => {
    const rs = shown(); t.redraw(rs);
    tick.checked = rs.length > 0 && rs.every(r => sel.has(r.d.id)); tick.indeterminate = !tick.checked && rs.some(r => sel.has(r.d.id));
    count.textContent = `${rs.length} of ${rowsAll.length} indicators shown · ${sel.size} selected`;
  };
  tick.addEventListener('change', () => { for (const r of shown()) tick.checked ? sel.add(r.d.id) : sel.delete(r.d.id); setSel(sel); });
  q.addEventListener('input', () => { flt.q = q.value; upd(); });
  for (const [ctl, k] of [[stSel, 'status'], [kindSel, 'kind'], [ownSel, 'owner']]) ctl.addEventListener('change', () => { flt[k] = ctl.value; upd(); });
  upd();
  sec.append(card(el('h2', null, 'Indicators'),
    el('div', 'filterbar', el('div', 'grow', q), el('div', null, stSel), el('div', null, kindSel), el('div', null, ownSel)),
    el('div', 'btnrow', { style: { margin: '10px 0' } },
      el('button', { class: 'btn sm ghost', onclick: () => { for (const r of shown()) sel.add(r.d.id); setSel(sel); } }, 'Select shown'),
      el('button', { class: 'btn sm ghost', onclick: () => { for (const r of shown()) sel.delete(r.d.id); setSel(sel); } }, 'Deselect shown'),
      el('button', { class: 'btn sm ghost', onclick: setTop }, 'Top 5'),
      el('button', { class: 'btn sm ghost', onclick: () => setSel(defs.map(d => d.id)) }, 'Select all'),
      el('button', { class: 'btn sm ghost', onclick: () => setSel(rowsAll.filter(r => r.st.k === 'bad' || r.st.k === 'warn').map(r => r.d.id)) }, 'Only warning or critical'),
      count),
    el('div', 'tablewrap', t),
    el('p', 'note', 'By default the five indicators most in need of attention are shown: critical first, then warning, each ranked by how far past its threshold; then on-target indicators closest to their warning threshold. Ticking or unticking switches to your own selection, saved with the workspace. Ticked indicators are shown as gauges and recorded with Record. Click a row for its history and trend. Trend = least-squares slope across all recorded points, judged against the KRI\'s direction.')));

  // detail
  const detail = el('div');
  const drawDetail = () => {
    const d = defs.find(x => x.id === selected) || defs[0]; if (!d) return;
    const pts = series(d.id), tr = trend(d, pts);
    const pick = select(defs.map(x => [x.id, x.id + ' — ' + x.name]), d.id);
    pick.addEventListener('change', () => { selected = pick.value; drawDetail(); });
    const refs = [];
    if (d.target !== null && d.target !== undefined) refs.push({ y: d.target, label: 'target ' + d.target, color: 'var(--good)' });
    if (d.warn !== null && d.warn !== undefined && d.warn !== d.target) refs.push({ y: d.warn, label: 'warning ' + d.warn, color: 'var(--warn)' });
    if (d.crit !== null && d.crit !== undefined) refs.push({ y: d.crit, label: 'critical ' + d.crit, color: 'var(--bad)' });
    detail.replaceChildren(card(el('div', 'row', el('div', { style: { flex: '1 1 400px' } }, field('<b>Trend for</b>', pick))),
      pts.length ? lineChart({ series: [{ name: d.name, color: 'var(--series-1)', points: pts }], refs, yLabel: d.name, yFmt: v => d.unit === '%' ? v.toFixed(0) + '%' : (Math.abs(v) >= 100 ? n0(v) : n2(v)) })
        : el('div', 'empty-state', el('b', null, 'No history for this KRI yet'), 'Record a measurement above; each recording adds a point.'),
      pts.length >= 2 ? el('div', 'grid g5', { style: { marginTop: '12px' } },
        kpi('First → last', `${fmtV(d, tr.first)} → ${fmtV(d, tr.last)}`, `${pts[0].x} → ${pts[pts.length - 1].x}`),
        kpi('Since previous', (tr.delta >= 0 ? '+' : '') + fmtV(d, tr.delta).replace('%', d.unit === '%' ? ' pts' : '')),
        kpi('Slope / 30 days', (tr.slope >= 0 ? '+' : '') + (Math.abs(tr.slope) >= 100 ? n0(tr.slope) : n2(tr.slope))),
        kpi('Direction', tr.label, d.dir === 'down' ? 'lower is better' : 'higher is better', tr.good === false ? 'bad' : tr.good ? 'good' : ''),
        kpi('Critical breaches', n0(tr.breaches), `in ${pts.length} measurements`, tr.breaches ? 'warn' : '')) : null,
      pts.length ? el('div', 'tablewrap', { style: { marginTop: '12px' } }, table([
        { key: 'x', label: 'Date', cls: 'mono' }, { key: 'y', label: 'Value', num: true, render: p => fmtV(d, p.y) },
        { key: 's', label: 'Status', render: p => { const s = status(d, p.y); return pill(s.label, s.k === 'bad' ? 'bad' : s.k === 'warn' ? 'warn' : s.k === 'good' ? 'good' : ''); } },
        { key: 'note', label: 'Note', render: p => p.note || '' },
        { key: 'del', label: '', sortable: false, render: p => el('button', { class: 'btn sm ghost danger', onclick: () => { const h = S.ws.kriHistory.find(x => x.date === p.x); if (h) { delete h.values[d.id]; if (!Object.keys(h.values).length) S.ws.kriHistory.splice(S.ws.kriHistory.indexOf(h), 1); touch(); render(sec); } } }, '×') },
      ], pts.slice().reverse(), { class: 'compact' })) : null));
  };
  sec.append(el('h2', null, 'Trend'), detail);
  drawDetail();

  // definitions + history import/export
  sec.append(defsEditor(sec), historyIO(sec, defs));
}

/** Rank indicators by need for attention: critical, warning, on target (closest to warning), tracked, no data;
 *  within a band, by relative distance past (or to) the threshold. */
export function topN(defs, curVal, n = 5) {
  const band = { bad: 0, warn: 1, good: 2, info: 3, none: 4 };
  const rel = (d, v, th) => { if (!Number.isFinite(th) || !Number.isFinite(v)) return 0; const sc = Math.max(Math.abs(th), 1e-9); return (d.dir === 'down' ? v - th : th - v) / sc; };
  return defs.map((d, i) => { const v = curVal(d), st = status(d, v).k;
    const dist = st === 'bad' ? rel(d, v, d.crit) : st === 'warn' ? rel(d, v, d.warn) : st === 'good' ? rel(d, v, d.warn ?? d.target) : 0;
    return { id: d.id, b: band[st], dist, i }; })
    .sort((a, b) => a.b - b.b || b.dist - a.dist || a.i - b.i).slice(0, n).map(x => x.id);
}

function defsEditor(sec) {
  const K = S.ws.assessment.KRIS;
  const cols = ['ID', 'KRI', 'Scenarios', 'Measurement', 'Data source', 'Owner', 'Frequency', 'Target', 'Warning', 'Critical'];
  const t = el('table', 'grid compact');
  t.append(el('thead', null, el('tr', null, ...cols.map(c => el('th', null, c)), el('th'))));
  const tb = el('tbody');
  K.forEach((k, i) => {
    tb.append(el('tr', null, ...cols.map((c, j) => { const n = el('input', { value: k[j] ?? '', style: { width: j === 1 || j === 3 ? '200px' : j === 0 ? '70px' : '96px' } }); n.addEventListener('change', () => { k[j] = n.value; touch(); }); return el('td', null, n); }),
      el('td', null, el('button', { class: 'btn sm ghost danger', onclick: () => { K.splice(i, 1); touch(); render(sec); } }, '×'))));
  });
  t.append(tb);
  const d = el('details', 'card');
  d.append(el('summary', null, `Operational KRI definitions (${K.length})`),
    el('p', 'note', 'Thresholds accept forms like "100%", "< 95%", "> 8%", "≤ 30 days". A "<" warning means higher is better; ">" means lower is better.'),
    el('div', 'tablewrap', t),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: () => { K.push(['KRI-' + String(K.length + 1).padStart(2, '0'), '', '', '', '', '', 'Monthly', '', '', '']); touch(); render(sec); } }, 'Add KRI'),
      el('span', 'small muted', 'Suggested:'),
      ...[['% privileged accounts protected by phishing-resistant MFA', '100%', '< 95%', '< 85%'], ['% critical vulnerabilities remediated within SLA', '≥ 95%', '< 90%', '< 75%'], ['Backup restoration test success rate', '100%', '< 95%', '< 80%'],
        ['EDR coverage of critical assets', '100%', '< 98%', '< 90%'], ['% critical suppliers assessed', '100%', '< 80%', '< 60%'], ['Phishing simulation failure rate', '< 5%', '> 8%', '> 15%'], ['Mean time to contain (hours)', '< 4', '> 8', '> 24']]
        .map(([n, tg, w, c]) => el('button', { class: 'btn sm ghost', onclick: () => { K.push(['KRI-' + String(K.length + 1).padStart(2, '0'), n, '', '', '', '', 'Monthly', tg, w, c]); touch(); render(sec); } }, n.length > 34 ? n.slice(0, 32) + '…' : n))));
  return d;
}

function historyIO(sec, defs) {
  const ws = S.ws;
  const fileIn = el('input', { type: 'file', accept: '.csv', style: { display: 'none' } });
  fileIn.addEventListener('change', async () => {
    const rows = parseCSV(await fileIn.files[0].text());
    const h = rows[0].map(x => x.trim()); let n = 0;
    for (const r of rows.slice(1)) {
      const date = (r[h.indexOf('date')] || '').trim(); if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      let rec = ws.kriHistory.find(x => x.date === date); if (!rec) { rec = { date, values: {}, note: '' }; ws.kriHistory.push(rec); }
      h.forEach((k, j) => { if (k !== 'date' && k !== 'note' && r[j] !== '' && Number.isFinite(Number(r[j]))) { rec.values[k] = Number(r[j]); n++; } });
      if (h.includes('note') && r[h.indexOf('note')]) rec.note = r[h.indexOf('note')];
    }
    touch(); toast(n + ' values imported'); render(sec);
  });
  const d = el('details', 'card');
  d.append(el('summary', null, 'History — import, export, clear'),
    el('p', 'note', 'CSV with a "date" column (YYYY-MM-DD), one column per KRI ID and an optional "note" column. Use it to backfill measurements from earlier reports or to move history between workspaces.'),
    el('div', 'btnrow',
      el('button', { class: 'btn ghost', onclick: () => { const ids = defs.map(x => x.id); download('kri-history.csv', toCSV([['date', ...ids, 'note'], ...ws.kriHistory.slice().sort((a, b) => a.date.localeCompare(b.date)).map(h => [h.date, ...ids.map(i => h.values[i] ?? ''), h.note || ''])])); } }, 'Export CSV'),
      el('button', { class: 'btn ghost', onclick: () => fileIn.click() }, 'Import CSV…'), fileIn,
      el('button', { class: 'btn ghost danger', onclick: () => { if (!window.confirm('Delete all recorded KRI history for this workspace?')) return; ws.kriHistory = []; touch(); render(sec); } }, 'Clear history')));
  return d;
}
