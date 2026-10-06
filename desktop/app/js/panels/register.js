/* Scenario register — every scenario with its threats, vulnerabilities and computed KRIs.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, n2, kpi, banner, card, pill, pillFor, chip, table, download, toast, go, select } from '../util.js';
import { S, touch, compute, setIncluded, exportAssessment, normalizeScenario, blankScenario, nextScenarioId, emit } from '../state.js';
import { techName, cwe } from '../ontology.js';

let filter = { q: '', status: 'all' };

export function threatChips(s, max = 4) {
  const box = el('div', 'chips');
  for (const t of (s.attack || []).slice(0, max)) box.append(chip(t, { kind: 't', href: '#/threats/' + t, title: techName(t) }));
  if ((s.attack || []).length > max) box.append(el('span', 'small muted', '+' + (s.attack.length - max)));
  return box;
}
export function vulnChips(s, max = 4) {
  const box = el('div', 'chips');
  const items = [...(s.cves || []), ...(s.cwe || [])];
  for (const v of items.slice(0, max)) box.append(chip(v, { kind: v.startsWith('CWE') ? 'c' : 'v', href: '#/vulns/' + v, title: v.startsWith('CWE') ? cwe(v)?.name : v }));
  if (items.length > max) box.append(el('span', 'small muted', '+' + (items.length - max)));
  return box;
}

export function render(sec) {
  const ws = S.ws, a = ws.assessment;
  const R = compute();
  sec.replaceChildren(el('h1', null, 'Scenario register'),
    el('p', 'lede', 'All scenarios of this workspace, computed by the verified engine. Click a scenario to view or edit it; threat and vulnerability chips open their screens.'));

  const fileIn = el('input', { type: 'file', accept: '.json', style: { display: 'none' } });
  fileIn.addEventListener('change', async () => {
    try {
      const d = JSON.parse(await fileIn.files[0].text());
      const scen = Array.isArray(d.SCEN) ? d.SCEN : d.assessment?.SCEN;
      if (!scen) throw new Error('no SCEN array — this is not a CyberRiskGuardian assessment file');
      const mode = a.SCEN.length ? window.prompt(`Load ${scen.length} scenarios.\nType R to REPLACE the ${a.SCEN.length} current scenarios, or A to APPEND them (IDs that clash are renumbered).`, 'A') : 'R';
      if (!mode) return;
      if (/^r/i.test(mode)) {
        const src = d.assessment || d;
        for (const k of ['SCEN', 'INITIATIVES', 'KRIS', 'EVIDENCE', 'CANDIDATES', 'CROWN']) if (Array.isArray(src[k])) a[k] = src[k];
        for (const k of ['APPETITE', 'FACTOR', 'CURRENCY', 'PERIOD', 'SOURCE', 'CASE_APPETITE', 'SENS_IDS']) if (src[k] !== undefined) a[k] = src[k];
        ws.excluded = [];
      } else {
        for (const s of scen) { if (a.SCEN.some(x => x.id === s.id)) s.id = nextScenarioId(); a.SCEN.push(s); }
      }
      a.SCEN.forEach(normalizeScenario); touch('redraw'); toast(scen.length + ' scenarios loaded');
    } catch (e) { sec.prepend(banner('bad', 'Could not load', String(e.message || e))); }
  });

  sec.append(card(el('div', 'btnrow',
    el('button', { class: 'btn', onclick: () => { const s = blankScenario(nextScenarioId()); a.SCEN.push(s); touch(); go('scenario/' + s.id); } }, 'New scenario'),
    el('button', { class: 'btn ghost', onclick: () => go('batch') }, 'Batch create…'),
    el('button', { class: 'btn ghost', onclick: () => fileIn.click() }, 'Load assessment JSON…'), fileIn,
    el('button', { class: 'btn ghost', onclick: () => download((ws.org.name || ws.name).replace(/[^\w.-]+/g, '_') + '-assessment.json', JSON.stringify(exportAssessment(), null, 1), 'application/json') }, 'Export JSON (crg_calc.py)'),
    el('button', { class: 'btn ghost', onclick: () => go('export') }, 'Export to Excel…'),
  ), el('div', 'note', `${a.SCEN.length} scenarios · appetite ${R.appetite} · factor ${n0(R.factor)} · ${R.inc.length} included in totals (choose in the Risk calculator).`)));

  if (R.errors.length) sec.append(banner('bad', `${R.errors.length} scenario(s) cannot be calculated`,
    el('div', null, ...R.errors.map(e => el('div', null, el('a', { href: '#/scenario/' + e.id }, e.id), ' — ' + e.error)))));

  const k = el('div', 'grid g4');
  k.append(kpi('Scenarios included', n0(R.inc.length), `${a.SCEN.length - R.inc.length} excluded`),
    kpi('Total estimated', n0(R.totals.est), 'included scenarios'),
    kpi('Total residual', n0(R.totals.res), R.totals.est ? `reduction ${Math.round(100 - R.totals.res / R.totals.est * 100)}%` : ''),
    kpi('Above tolerance', n0(R.counts.above), `${R.counts.at} at · ${R.counts.below} below`, R.counts.above ? 'bad' : 'good'));
  sec.append(k);

  if (!a.SCEN.length) {
    sec.append(card(el('div', 'empty-state', el('b', null, 'No scenarios yet'), 'Create one, build a batch from threats and assets, or load an assessment JSON.')));
    return;
  }

  const q = el('input', { placeholder: 'Search scenarios, threats, CWE, CVE, owner…', value: filter.q });
  const stSel = select([['all', 'All statuses'], ['Above', 'Above tolerance'], ['Approximately', 'Approximately at'], ['Below', 'Below tolerance'], ['excluded', 'Excluded']], filter.status);
  const box = el('div', 'card', { style: { marginTop: '16px' } });
  const rows = () => R.rows.filter(r => {
    if (filter.status === 'excluded' ? r.inc : filter.status !== 'all' && !r.cls.startsWith(filter.status)) return false;
    if (!filter.q) return true;
    const s = r.s, hay = [s.id, s.name, s.statement, s.threat_source, s.owner, ...(s.attack || []), ...(s.cwe || []), ...(s.cves || []), ...(s.attack || []).map(techName)].join(' ').toLowerCase();
    return hay.includes(filter.q.toLowerCase());
  });
  const cols = [
    { key: 'inc', label: '', sortable: false, cls: 'cb', render: r => { const c = el('input', { type: 'checkbox', checked: r.inc, title: 'Include in totals' }); c.addEventListener('change', () => { setIncluded(r.id, c.checked); render(sec); }); return c; } },
    { key: 'id', label: 'ID', cls: 'mono', sort: r => Number(r.id.replace(/\D/g, '')) || r.id },
    { key: 'name', label: 'Scenario', render: r => el('div', null, el('a', { href: '#/scenario/' + r.id }, r.name || '(untitled)'), r.s.owner ? el('div', 'small muted', r.s.owner) : null) },
    { key: 'threats', label: 'Threats', sortable: false, render: r => threatChips(r.s, 3) },
    { key: 'vulns', label: 'Vulnerabilities', sortable: false, render: r => vulnChips(r.s, 3) },
    { key: 'cvss', label: 'CVSS', num: true, render: r => n1(r.cvss) },
    { key: 'est', label: 'Estimated', num: true, render: r => n0(r.est) },
    { key: 'res', label: 'Residual', num: true, render: r => n0(r.res) },
    { key: 'ratio', label: 'Res/Tol', num: true, render: r => n2(r.ratio) },
    { key: 'cls', label: 'Status', render: r => pill(r.cls, pillFor(r.cls)) },
  ];
  const t = table(cols, rows(), { onRow: r => go('scenario/' + r.id), rowClass: r => r.inc ? '' : 'off', sortKey: 'id', sortDir: 1 });
  const upd = () => t.redraw(rows());
  q.addEventListener('input', () => { filter.q = q.value; upd(); });
  stSel.addEventListener('change', () => { filter.status = stSel.value; upd(); });
  box.append(el('div', 'row', el('div', { style: { flex: '1 1 320px' } }, q), el('div', { style: { width: '220px' } }, stSel)), el('div', 'tablewrap', { style: { marginTop: '12px' } }, t));
  sec.append(box);
}
const n1 = x => Number(x).toFixed(1);
