/* dashpack.js — the workspace as a pack for a Claude Dashboard (a dashboard artifact on claude.ai).

   A Claude Dashboard is a page of charts, numbers and tables where every number shows the dataset it
   comes from. This module writes what one needs, from the verified engine and the workspace, into a
   ZIP the person hands to Claude ("build my CyberRiskGuardian dashboard from this pack"):
     crg-dashboard-pack.json   the manifest: dashboard title, and one entry per dataset — id, title,
                               description, file, updated {at, by} — in the dashboard's own terms;
     datasets/*.csv            the data: key risk indicators now and over time, scenarios against
                               tolerance, policies of ISP management and their acknowledgement coverage;
     index.html                a ready page written to the dashboard contract (marks data-source /
                               data-field / data-where, figures filled in dash.onData, charts with d3);
     README.md                 what the pack holds and how to use it.
   Nothing is sent anywhere by the application. The numbers are relative decision-support indicators;
   the pack says so, and it carries no document text, no names of people unless the person ticks it.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, compute } from './state.js';
import { allDefs, autoValues, status } from './kri.js';
import * as P from './isp.js';
import { zip } from './xlsx.js';
import { toCSV } from './util.js';
import { GENERATOR } from './version.js';

export const PACK_SCHEMA = 'crg-dashboard-pack/1';
const r4 = v => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? '' : Math.round(Number(v) * 100) / 100);

/** The datasets: {id: {title, description, columns, rows}}. */
export function datasets(ws = S.ws, { people = false } = {}) {
  const R = compute(ws), cur = autoValues(ws), defs = allDefs(ws);
  const hist = (ws.kriHistory || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const last = hist.at(-1);
  const val = d => d.manual ? (last?.values?.[d.id] ?? null) : cur[d.id];
  const kri = defs.map(d => { const v = val(d); return { id: d.id, name: d.name, kind: d.manual ? 'operational' : 'computed', unit: d.unit || '', direction: d.dir === 'down' ? 'lower is better' : 'higher is better',
    value: r4(v), target: r4(d.target), warning: r4(d.warn), critical: r4(d.crit), status: status(d, v).label, risk: d.risk || '', owner: d.manual && people ? (d.owner || '') : '', method: d.method || '' }; });
  const history = hist.flatMap(h => Object.entries(h.values || {}).filter(([, v]) => Number.isFinite(v)).map(([k, v]) => {
    const d = defs.find(x => x.id === k); return { date: h.date, kri: k, name: d?.name || k, value: r4(v), status: d ? status(d, v).label : '' }; }));
  const scen = R.rows.map(r => ({ id: r.id, name: r.name, included: r.inc ? 'yes' : 'no', estimated: r4(r.est), tolerated: r4(r.tol), residual: r4(r.res), ratio: r4(r.ratio), position: r.cls, treatment_cost_y1: r4(r.cost) }));
  const I = P.isp(ws);
  const pol = I.policies.map(p => { const f = P.inForce(p), c = P.coverage(p.id, ws);
    return { id: p.id, reference: p.reference || '', title: p.title, type: p.type, status: p.status, working_version: p.version, in_force_version: f?.version || '', statements: p.statements.length,
      assigned: c.assigned, acknowledged: c.acknowledged, coverage_pct: c.pct === null ? '' : r4(100 * c.pct), next_review: P.reviewDate(p) || '', review_overdue: P.overdue(p) ? 'yes' : 'no',
      drafted_by_writer: p.writer?.code ? 'yes' : 'no', language: p.writer?.lang || '' }; });
  const COLS = { kri_current: ['id', 'name', 'kind', 'unit', 'direction', 'value', 'target', 'warning', 'critical', 'status', 'risk', 'owner', 'method'],
    kri_history: ['date', 'kri', 'name', 'value', 'status'], scenarios: ['id', 'name', 'included', 'estimated', 'tolerated', 'residual', 'ratio', 'position', 'treatment_cost_y1'],
    policies: ['id', 'reference', 'title', 'type', 'status', 'working_version', 'in_force_version', 'statements', 'assigned', 'acknowledged', 'coverage_pct', 'next_review', 'review_overdue', 'drafted_by_writer', 'language'] };
  const out = {
    kri_current: { title: 'Key risk indicators now', description: 'Every key risk indicator of the workspace with its current value, target, warning and critical thresholds and status. Computed indicators come from the verified engine; operational ones from the last recorded measurement.', rows: kri },
    kri_history: { title: 'KRI measurements over time', description: 'One row per indicator and recorded measurement date (long format).', rows: history },
    scenarios: { title: 'Scenarios against tolerance', description: `Estimated, tolerated and residual risk of each scenario in CRG risk units (factor ${R.factor}, appetite ${R.appetite}), with the residual-to-tolerance ratio. Relative decision-support indicators, not predictions of loss.`, rows: scen },
    policies: { title: 'Security policies and coverage', description: 'Policies of ISP management with their state, the version in force, and acknowledgement coverage of that exact version. An acknowledgement is not compliance.', rows: pol },
  };
  for (const [id, d] of Object.entries(out)) d.columns = COLS[id];
  return out;
}

export function manifest(ws, ds, by = '') {
  const at = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  return { schema: PACK_SCHEMA, generator: GENERATOR, created: at, workspace: ws.name, organization: ws.org?.name || '', kind: ws.kind,
    dashboard: { title: `${ws.org?.name || ws.name} — cyber risk dashboard` },
    note: 'Relative decision-support indicators from CyberRiskGuardian (Analytical estimate — validation required where not measured). Upload each CSV as an attached file of the dashboard; anyone who can open the dashboard can read them.',
    datasets: Object.entries(ds).map(([id, d]) => ({ id, title: d.title, description: d.description, file: `datasets/${id}.csv`, format: 'csv', columns: d.columns, rows: d.rows.length, updated: { at, by: by || 'CyberRiskGuardian' } })) };
}

/** The ZIP: {name, blob}. */
export async function pack(ws = S.ws, { by = '', people = false } = {}) {
  const ds = datasets(ws, { people });
  const files = { 'crg-dashboard-pack.json': JSON.stringify(manifest(ws, ds, by), null, 1), 'index.html': PAGE, 'README.md': README };
  for (const [id, d] of Object.entries(ds)) files[`datasets/${id}.csv`] = toCSV([d.columns, ...d.rows.map(r => d.columns.map(c => r[c]))]);
  const name = `${(ws.org?.name || ws.name || 'workspace').replace(/[^\w.-]+/g, '_')}_crg-dashboard-pack.zip`;
  return { name, blob: new Blob([await zip(files)], { type: 'application/zip' }), datasets: Object.keys(ds).length };
}

const README = `# CyberRiskGuardian — dashboard pack

This pack turns a CyberRiskGuardian workspace into a **Claude Dashboard** (a dashboard artifact on claude.ai),
where every number shows the dataset it comes from.

**Use it.** In Claude, attach this ZIP and ask: *"Build my CyberRiskGuardian dashboard from this pack."*
With the CyberRiskGuardian plugin installed, the \`crg-dashboard\` skill does it the same way every time:
it creates the dashboard, attaches each CSV of \`datasets/\` as a file, records each dataset with the
title, description and date of \`crg-dashboard-pack.json\`, and installs \`index.html\` as the page.
To refresh it later, export a new pack and ask Claude to *"refresh my CyberRiskGuardian dashboard"*.

| File | What it holds |
|---|---|
| \`datasets/kri_current.csv\` | Every key risk indicator: value now, target, warning and critical thresholds, status |
| \`datasets/kri_history.csv\` | Recorded KRI measurements over time (one row per indicator and date) |
| \`datasets/scenarios.csv\` | Estimated, tolerated and residual risk per scenario, residual-to-tolerance ratio |
| \`datasets/policies.csv\` | Policies of ISP management, version in force, acknowledgement coverage |

**Read it right.** Risk figures are relative decision-support indicators in CRG risk units, not predictions
of loss. A policy acknowledgement is not compliance. Values not measured by the organization are
analytical estimates that need validation. Anyone who can open the dashboard can read the attached files:
share it only with people allowed to see this assessment.

© 2026 Marc-André Léger · CC BY-NC 4.0
`;

/* The page, written to the Claude Dashboard contract: no number in the markup, every figure filled from a
   dataset in dash.onData, marks on the smallest element, tables marked once with a row key. */
const PAGE = `<style>
.crg-dash{font-family:var(--font-anthropic-sans);color:var(--color-fg)}
.crg-dash h2{font-size:15px;margin:22px 0 8px}
.crg-dash .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
.crg-dash .tile{background:var(--color-panel);border:1px solid var(--color-border-line);border-radius:10px;padding:12px 14px}
.crg-dash .tile .k{font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:var(--color-fg-muted)}
.crg-dash .tile .v{font-family:var(--font-anthropic-serif);font-size:30px;margin-top:4px}
.crg-dash .tile .s{font-size:12px;color:var(--color-fg-muted)}
.crg-dash table{width:100%;border-collapse:collapse;font-size:12.5px}
.crg-dash th,.crg-dash td{text-align:left;padding:5px 6px;border-bottom:1px solid var(--color-border-line);vertical-align:top}
.crg-dash td.n{text-align:right;font-variant-numeric:tabular-nums}
.crg-dash .st-critical{color:var(--color-bad);font-weight:600}.crg-dash .st-warning{color:var(--color-warn);font-weight:600}.crg-dash .st-on{color:var(--color-ok)}
.crg-dash .note{font-size:12px;color:var(--color-fg-muted);margin-top:6px}
.crg-dash .chart{width:100%;position:relative}
.crg-dash .tip{position:absolute;pointer-events:none;background:var(--color-panel);border:1px solid var(--color-border-line);border-radius:6px;padding:4px 8px;font-size:12px;display:none;white-space:nowrap}
.crg-dash select{font:inherit;padding:3px 6px}
</style>
<div class="crg-dash">
  <div class="tiles">
    <div class="tile"><div class="k">Residual ÷ tolerated (portfolio)</div><div class="v" data-source="kri_current" data-field="value" data-where="id=CRG-01">—</div><div class="s">target ≤ 0.90 · above 1.10 is beyond tolerance</div></div>
    <div class="tile"><div class="k">Scenarios above tolerance</div><div class="v" data-source="kri_current" data-field="value" data-where="id=CRG-02">—</div><div class="s">included scenarios with ratio &gt; 1.10</div></div>
    <div class="tile"><div class="k">Total residual risk</div><div class="v" data-source="kri_current" data-field="value" data-where="id=CRG-03">—</div><div class="s">CRG risk units (relative)</div></div>
    <div class="tile"><div class="k">KRIs critical</div><div class="v" data-source="kri_status" data-field="n" data-where="status=critical">—</div><div class="s">beyond the critical threshold</div></div>
    <div class="tile"><div class="k">KRIs at warning</div><div class="v" data-source="kri_status" data-field="n" data-where="status=warning">—</div><div class="s">beyond the warning threshold</div></div>
    <div class="tile"><div class="k">Acknowledgement coverage</div><div class="v" data-source="ack_coverage" data-field="pct">—</div><div class="s">assigned people, version in force — not compliance</div></div>
  </div>

  <h2 id="crg-trend">KRI over time</h2>
  <div><select id="crg-kri-pick" aria-label="Indicator"></select></div>
  <div class="chart" id="crg-trend-chart" data-source="kri_history kri_current"></div>

  <h2 id="crg-scen">Scenarios against tolerance (highest ratio first)</h2>
  <div class="chart" id="crg-scen-chart" data-source="scenarios"></div>
  <div class="note">Bars: residual ÷ tolerated. The line at 1.0 is the tolerated level; 0.90–1.10 is approximately at tolerance. Relative indicators, not predictions of loss.</div>

  <h2 id="crg-kri">Key risk indicators</h2>
  <table id="crg-kri-table" data-source="kri_current" data-row-key="id"><thead><tr>
    <th data-field="id">KRI</th><th data-field="name">Indicator</th><th data-field="value">Value</th><th data-field="target">Target</th><th data-field="warning">Warning</th><th data-field="critical">Critical</th><th data-field="status">Status</th>
  </tr></thead><tbody></tbody></table>

  <h2 id="crg-pol">Security policies</h2>
  <table id="crg-pol-table" data-source="policies" data-row-key="id"><thead><tr>
    <th data-field="id">Policy</th><th data-field="title">Title</th><th data-field="status">State</th><th data-field="in_force_version">In force</th><th data-field="coverage_pct">Acknowledged %</th><th data-field="next_review">Next review</th>
  </tr></thead><tbody></tbody></table>
  <div class="note">An acknowledgement says a person read the exact version in force; it is never evidence of compliance.</div>
</div>
<script>
dash.calc('kri_status', { inputs: ['kri_current'], title: 'KRIs by status', description: 'Number of indicators in each status.',
  fn: (kri_current) => ['critical', 'warning', 'on target', 'tracked', 'no data'].map(s => ({ status: s, n: kri_current.filter(r => r.status === s).length })) });
dash.calc('ack_coverage', { inputs: ['policies'], title: 'Acknowledgement coverage', description: 'Acknowledged ÷ assigned people over the policies in force that have assignments.',
  fn: (policies) => { const a = policies.reduce((t, r) => t + Number(r.assigned || 0), 0), k = policies.reduce((t, r) => t + Number(r.acknowledged || 0), 0); return [{ pct: a ? Math.round(1000 * k / a) / 10 + '%' : '—', assigned: a, acknowledged: k }]; } });
(function () {
  const root = document.querySelector('.crg-dash');
  const fmt = v => (v === '' || v === null || v === undefined ? '—' : String(v));   // values as the dataset holds them (already rounded)
  const fill = (sel, text) => root.querySelectorAll(sel).forEach(e => { e.textContent = text; });
  const tipOf = box => { let t = box.querySelector('.tip'); if (!t) { t = document.createElement('div'); t.className = 'tip'; box.appendChild(t); } return t; };
  const showTip = (box, ev, text) => { const t = tipOf(box), r = box.getBoundingClientRect(); t.textContent = text; t.style.display = 'block';
    const x = Math.min(ev.clientX - r.left + 10, r.width - t.offsetWidth - 4), y = ev.clientY - r.top - 30; t.style.left = Math.max(0, x) + 'px'; t.style.top = Math.max(0, y) + 'px'; };
  const hideTip = box => { const t = box.querySelector('.tip'); if (t) t.style.display = 'none'; };
  const pick = document.getElementById('crg-kri-pick');
  let chosen = 'CRG-01';
  pick.addEventListener('change', () => { chosen = pick.value; draw(); });
  function draw() {
    const K = dash.data('kri_current'), H = dash.data('kri_history'), Sc = dash.data('scenarios'), Po = dash.data('policies'), St = dash.data('kri_status'), Ac = dash.data('ack_coverage');
    // tiles
    for (const id of ['CRG-01', 'CRG-02', 'CRG-03']) { const r = K.status === 'ok' ? K.data.find(x => x.id === id) : null; fill('[data-where="id=' + id + '"]', r ? fmt(r.value) : '—'); }
    for (const s of ['critical', 'warning']) { const r = St.status === 'ok' ? St.data.find(x => x.status === s) : null; fill('[data-source="kri_status"][data-where="status=' + s + '"]', r ? String(r.n) : '—'); }
    fill('[data-source="ack_coverage"]', Ac.status === 'ok' && Ac.data[0] ? Ac.data[0].pct : '—');
    // KRI table
    const kb = document.querySelector('#crg-kri-table tbody'); kb.replaceChildren();
    if (K.status === 'ok') for (const r of K.data) { const tr = document.createElement('tr');
      for (const c of ['id', 'name', 'value', 'target', 'warning', 'critical', 'status']) { const td = document.createElement('td'); td.textContent = ['value', 'target', 'warning', 'critical'].includes(c) ? fmt(r[c]) : (r[c] || '—');
        if (['value', 'target', 'warning', 'critical'].includes(c)) td.className = 'n'; if (c === 'status') td.className = r.status === 'critical' ? 'st-critical' : r.status === 'warning' ? 'st-warning' : r.status === 'on target' ? 'st-on' : ''; tr.appendChild(td); }
      kb.appendChild(tr); }
    // policies table
    const pb = document.querySelector('#crg-pol-table tbody'); pb.replaceChildren();
    if (Po.status === 'ok') for (const r of Po.data) { const tr = document.createElement('tr');
      for (const c of ['id', 'title', 'status', 'in_force_version', 'coverage_pct', 'next_review']) { const td = document.createElement('td'); td.textContent = c === 'coverage_pct' ? fmt(r[c]) : (r[c] || '—'); if (c === 'coverage_pct') td.className = 'n'; tr.appendChild(td); }
      pb.appendChild(tr); }
    // picker
    if (K.status === 'ok' && pick.options.length !== K.data.length) { pick.replaceChildren(...K.data.map(r => { const o = document.createElement('option'); o.value = r.id; o.textContent = r.id + ' — ' + r.name; return o; })); pick.value = chosen; }
    // trend
    const tb = document.getElementById('crg-trend-chart'); tb.querySelectorAll('svg').forEach(s => s.remove());
    const W = Math.max(280, tb.clientWidth || 600), Hh = 220, m = { l: 48, r: 12, t: 10, b: 28 };
    if (H.status === 'ok' && K.status === 'ok') {
      const pts = H.data.filter(r => r.kri === chosen).map(r => ({ d: new Date(String(r.date).slice(0, 10)), v: Number(r.value), raw: r })).filter(p => Number.isFinite(p.v)).sort((a, b) => a.d - b.d);
      const def = K.data.find(r => r.id === chosen) || {};
      const svg = d3.select(tb).append('svg').attr('width', '100%').attr('viewBox', '0 0 ' + W + ' ' + Hh);
      if (!pts.length) { svg.append('text').attr('x', 10).attr('y', 24).attr('fill', 'var(--color-fg-muted)').text('No measurement recorded for this indicator yet.'); }
      else {
        const th = ['target', 'warning', 'critical'].map(k => Number(def[k])).filter(Number.isFinite);
        const ys = pts.map(p => p.v).concat(th);
        const x = d3.scaleTime().domain(pts.length > 1 ? d3.extent(pts, p => p.d) : [new Date(+pts[0].d - 864e5), new Date(+pts[0].d + 864e5)]).range([m.l, W - m.r]);
        const y = d3.scaleLinear().domain([Math.min(0, d3.min(ys)), d3.max(ys) * 1.1 || 1]).nice().range([Hh - m.b, m.t]);
        svg.append('g').attr('transform', 'translate(0,' + (Hh - m.b) + ')').call(d3.axisBottom(x).ticks(Math.max(2, Math.floor(W / 110))));
        svg.append('g').attr('transform', 'translate(' + m.l + ',0)').call(d3.axisLeft(y).ticks(5));
        [['warning', 'var(--color-warn)'], ['critical', 'var(--color-bad)']].forEach(([k, c]) => { const v = Number(def[k]); if (Number.isFinite(v)) svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(v)).attr('y2', y(v)).attr('stroke', c).attr('stroke-dasharray', '4 3'); });
        svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', dash.colors[0]).attr('stroke-width', 2).attr('d', d3.line().x(p => x(p.d)).y(p => y(p.v)));
        svg.selectAll('circle').data(pts).join('circle').attr('cx', p => x(p.d)).attr('cy', p => y(p.v)).attr('r', 4).attr('fill', dash.colors[0])
          .on('mousemove', (ev, p) => showTip(tb, ev, p.raw.date + ' · ' + fmt(p.v) + ' · ' + (p.raw.status || ''))).on('mouseleave', () => hideTip(tb));
      }
    }
    // scenarios
    const sb = document.getElementById('crg-scen-chart'); sb.querySelectorAll('svg').forEach(s => s.remove());
    if (Sc.status === 'ok') {
      const rows = Sc.data.filter(r => r.included === 'yes' && Number.isFinite(Number(r.ratio))).sort((a, b) => Number(b.ratio) - Number(a.ratio)).slice(0, 15);
      const SW = Math.max(280, sb.clientWidth || 600), bh = 20, SH = rows.length * (bh + 6) + 30, ml = Math.min(260, SW * 0.42);
      const svg = d3.select(sb).append('svg').attr('width', '100%').attr('viewBox', '0 0 ' + SW + ' ' + SH);
      const x = d3.scaleLinear().domain([0, Math.max(1.2, d3.max(rows, r => Number(r.ratio)) || 1)]).nice().range([ml, SW - 12]);
      svg.append('g').attr('transform', 'translate(0,' + (SH - 24) + ')').call(d3.axisBottom(x).ticks(5));
      const g = svg.selectAll('g.bar').data(rows).join('g').attr('class', 'bar').attr('transform', (r, i) => 'translate(0,' + (i * (bh + 6) + 4) + ')');
      g.append('text').attr('x', ml - 6).attr('y', bh / 2 + 4).attr('text-anchor', 'end').attr('font-size', 11).attr('fill', 'var(--color-fg)').text(r => (r.id + ' ' + r.name).slice(0, Math.floor(ml / 6.2)));
      g.append('rect').attr('x', ml).attr('height', bh).attr('width', r => Math.max(1, x(Number(r.ratio)) - ml))
        .attr('fill', r => Number(r.ratio) > 1.1 ? 'var(--color-bad)' : Number(r.ratio) >= 0.9 ? 'var(--color-warn)' : 'var(--color-ok)')
        .on('mousemove', (ev, r) => showTip(sb, ev, r.id + ' · ratio ' + fmt(r.ratio) + ' · residual ' + fmt(r.residual) + ' / tolerated ' + fmt(r.tolerated))).on('mouseleave', () => hideTip(sb));
      svg.append('line').attr('x1', x(1)).attr('x2', x(1)).attr('y1', 0).attr('y2', SH - 24).attr('stroke', 'var(--color-fg-muted)').attr('stroke-dasharray', '3 3');
    }
  }
  dash.onData(draw);
})();
</script>
`;
export const PAGE_HTML = PAGE;
