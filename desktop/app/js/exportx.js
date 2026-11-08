/* exportx.js — the risk assessment as an Excel workbook with live formulas.
   Core sheets (README, Analyse, Parameters, Inputs, Portfolio, Sensitivity, Case_View, Scenarios, Candidates,
   KRIs, Evidence) follow build_workbook.py cell for cell, so a workbook from the app and one from the plugin
   read the same way. Added sheets: Organization, Threats, Vulnerabilities, Recommendations, KRI_History,
   Budget, Threat_Context; 1.4.0: Risk_Register, Measures (combined reductions 1 − ∏(1 − r) as live formulas),
   Compliance_SoA, Assets. Every formula carries its cached value computed by the verified engine.
   Language (NV-083): titles, headers, notes and verdict texts follow the interface language (tr); sheet names stay in
   English because formulas refer to them, and user-entered data is never translated. The vector wins (X-1): the CVSS-B
   column is the engine's score; a stored score that disagrees is listed in CVSS_Basis and flagged in Analyse.
   Residual carries the MAX(0, …) guard and Validity checks "CVSS required", as the reference workbook does (NV-066).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { GENERATOR } from './version.js';
import { Workbook, col, ref } from './xlsx.js';
import { S, compute, initiatives, included, PARAMS, commitments } from './state.js';
import { techName, tech, cwe, mitigation } from './ontology.js';
import { allDefs, autoValues, status } from './kri.js';
import { suggest, horizonBucket } from './panels/recs.js';
import { classify as ladder } from '../threat.js';
import { val } from './util.js';
import { combined, effect, control, validCoef } from './catalog.js';
import { crgOf, level, score } from './registry.js';
import { soaRows } from './panels/compliance.js';
import { criticality, dynamic, scenariosOf } from './assets.js';
import * as EQ from './equiv.js';
import { tr } from './i18n.js';

const F = (f, v) => ({ f, v });
const BLUE = { color: '0000FF' }, GRN = { color: '008000' }, B = { bold: true }, HDR = { bold: true, color: 'FFFFFF', fill: '1F3864', wrap: true, valign: 'center' }, TTL = { bold: true, size: 14, border: false };
const L = c => col(c - 1);   // 1-based column letter, as in build_workbook.py

function header(sh, r, cols, widths) { cols.forEach((c, j) => sh.set(r - 1, j, tr(c), HDR)); if (widths) sh.widthsFrom(widths); }
/** A classification formula and its cached verdict in the interface language (the two must agree for a recalculation check). */
const CLS_F = (cell, BLO, BHI) => `IF(${cell}<${BLO},"${tr('Below tolerance')}",IF(${cell}<=${BHI},"${tr('Approximately at tolerance')}","${tr('Above tolerance')}"))`;
function put(sh, r, c, v, style = {}, fmt) { sh.set(r - 1, c - 1, v, Object.assign({}, style, fmt ? { fmt } : {})); }

export const OPTIONAL_SHEETS = ['Sensitivity', 'Case_View', 'Scenarios', 'Candidates', 'KRIs', 'CVSS_Basis', 'Evidence', 'Organization', 'Threats', 'Vulnerabilities', 'Recommendations', 'KRI_History', 'Budget', 'Threat_Context',
  'Risk_Register', 'Measures', 'Compliance_SoA', 'Assets'];
export const SCOPES = {
  included: ['Scenarios included in the Risk calculator', r => r.inc],
  all: ['All scenarios', () => true],
  above: ['Only scenarios above tolerance', r => r.cls.startsWith('Above')],
  aboveat: ['Scenarios above or approximately at tolerance', r => !r.cls.startsWith('Below')],
  picked: ['Scenarios picked for this export', null],
};
/** Rows that an export with these options would contain. */
export function exportRows({ scope = 'included', picked = [] } = {}) {
  const R = compute(S.ws);
  return scope === 'picked' ? R.rows.filter(r => picked.includes(r.id)) : R.rows.filter(SCOPES[scope]?.[1] || SCOPES.included[1]);
}

/** Build the workbook from scratch from the current workspace.
 *  opts: scope ('included' | 'all' | 'above' | 'aboveat' | 'picked'), picked (ids), sheets (optional sheet names to keep),
 *  years (budget years to include), kriHistory (bool). `includedOnly` is accepted for 1.1 compatibility. */
export async function buildWorkbook(opts = {}) {
  const { includedOnly, scope = includedOnly === false ? 'all' : 'included', picked = [], sheets = OPTIONAL_SHEETS, years = null, kriHistory = true } = opts;
  const ws = S.ws, A = ws.assessment;
  const R = compute(ws);
  const rowsAll = R.rows;
  const rows = exportRows({ scope, picked });
  const SCEN = rows.map(r => r.s);
  const N = SCEN.length;
  const APPETITE = Number(A.APPETITE), FACTOR = Number(A.FACTOR), CASE_APPETITE = Number(A.CASE_APPETITE ?? APPETITE);
  const sid = new Set(SCEN.map(s => s.id));
  // Initiatives restricted to exported scenarios; scenarios with only a manual cost get a single-scenario line.
  const INITS = initiatives(ws).map(i => Object.assign({}, i, { scenarios: i.scenarios.filter(x => sid.has(x)) })).filter(i => i.scenarios.length);
  for (const s of SCEN) if (Number(s.cost_y1_manual) > 0 && !INITS.some(i => i.scenarios.includes(s.id)))
    INITS.push({ id: 'M-' + s.id, name: tr('Manual Year-1 cost for {0}').replace('{0}', s.id), owner: s.owner || '', priority: '', type: tr('Manual estimate'), initial: Number(s.cost_y1_manual), recurring: 0, start: '', end: '', success: '', scenarios: [s.id], y1: Number(s.cost_y1_manual) });
  const title = `${ws.org.name || ws.name} — ${tr('CyberRiskGuardian Workbook')}`;
  const wb = new Workbook({ title });
  const LASTF = L(10 + N);

  /* README */
  const rd = wb.sheet('README');
  rd.set(0, 0, title, TTL);
  const lines = [
    tr('Assessment period: {0}. Currency: {1}. Cost basis: Year-1 = initial implementation + first-year recurring.').replace('{0}', A.PERIOD || tr('next 12 months')).replace('{1}', A.CURRENCY || 'CAD'),
    tr('Source: {0}. Formulas: CyberRiskGuardian Excel Guide v1.0c (s.11), used without modification.').replace('{0}', A.SOURCE || tr('organizational evidence supplied')),
    tr('Analytical estimate — validation required: all parameter values, CVSS vectors, costs and reductions are analytical estimates. Scores are relative decision-support indicators, not loss predictions.'),
    tr('Exported from {0} on {1} — workspace "{2}" ({3}). Scope: {4} — {5} of {6} scenarios. Generated from scratch from the current workspace.').replace('{0}', GENERATOR).replace('{1}', new Date().toISOString().slice(0, 10)).replace('{2}', ws.name).replace('{3}', ws.kind)
      .replace('{4}', scope === 'picked' ? tr('{0} scenarios picked for this export').replace('{0}', N) : tr(SCOPES[scope][0]).toLowerCase()).replace('{5}', N).replace('{6}', rowsAll.length),
    ws.kind !== 'organization' ? tr('This workspace is a teaching case: the organization and its data are fictional.') : '',
    '',
    tr('Colour legend:  blue text = input you may edit  |  black = formula  |  green = link to another sheet  |  yellow fill = key assumption.'),
    '',
    tr('Sheets:'),
    '  Parameters  - ' + tr('risk appetite, multiplication factor, tolerance band (edit here).'),
    '  Inputs      - ' + tr('{0} scenarios: quantitative parameters, CVSS v4.0 vector/score, reductions, confidence, ATT&CK / CWE / CVE links.').replace('{0}', N),
    '  Analyse     - ' + tr('estimated, tolerated, mitigated, residual risk, ratio, classification, cost-effectiveness (live formulas).'),
    '  Portfolio   - ' + tr('{0} initiatives, costs and scenario mapping; shared costs split equally across scenarios addressed (no double-counting).').replace('{0}', INITS.length),
    '  Sensitivity - ' + tr('lower / central / higher cases for key scenarios (all parameters shifted by +/- delta; the central case is never shifted).'),
    '  Case_View   - ' + tr('case-native escalation view: T x E x I x (1 - C), with the 0.25 / 0.40 escalation thresholds.'),
    '  Candidates, Scenarios, KRIs, CVSS_Basis, Evidence - ' + tr('supporting registers.'),
    '  Organization, Threats (MITRE ATT&CK), Vulnerabilities (CVE / CWE / KEV / EPSS), Recommendations, KRI_History, Budget, Threat_Context - ' + tr('added by the desktop app.'),
    '',
    tr('Formulas (Excel Guide v1.0c, s.11):'),
    '  Estimated = Pb(A) x Pb(psi,A) x CVSS x ((de + dm)/2) x mu(E) / theta x Factor',
    '  Tolerated = Pb(A) x Pb(psi,A) x CVSS x Appetite x mu(E) / theta x Factor',
    '  Mitigated = Estimated x ProbabilityReduction x ImpactReduction ;  Residual = MAX(0, Estimated - Mitigated)',
    '  Ratio = Residual / Tolerated ;  Cost-effectiveness = (Estimated - Residual) / Cost x 1000',
    tr('  CVSS: v4.0 Base score only (CVSS-B). The vector is authoritative: its score is used and a stored score that disagrees is flagged (CVSS_Basis). Tolerated risk 0 gives no ratio ("Not applicable").'),
    '',
    tr('How to use: change blue cells on Parameters / Inputs / Portfolio, then recalculate (Formulas > Calculate Now if manual).'),
    tr('Third-party content: MITRE ATT&CK, CAPEC and CWE (c) The MITRE Corporation; CISA KEV (public domain); FIRST EPSS - see NOTICE.md.'),
  ];
  lines.forEach((t, i) => rd.set(i + 2, 0, t, { border: false }));
  rd.width(0, 150);

  /* Parameters */
  const wp = wb.sheet('Parameters');
  wp.set(0, 0, tr('Global parameters'), TTL);
  const prow = [['Risk appetite (analytical estimate)', APPETITE, ws.appetite_rationale || tr('Analytical estimate — validation required.')],
    ['Multiplication factor', FACTOR, 'Constant across all scenarios (Excel Guide worked example).'],
    ["Tolerance band - lower bound of 'approximately at'", CRG.BAND_LOW, 'Ratio < this = below tolerance'],
    ["Tolerance band - upper bound of 'approximately at'", CRG.BAND_HIGH, 'Ratio > this = above tolerance'],
    ['Case appetite (for comparison)', CASE_APPETITE, 'Business case or management statement'],
    ['Sensitivity delta', 0.10, 'Shift applied in Sensitivity sheet'],
    ['Case escalation - executive review threshold', 0.25, 'Case view'], ['Case escalation - Board acceptance threshold', 0.40, 'Case view']];
  header(wp, 3, ['Parameter', 'Value', 'Source / note'], [52, 12, 90]);
  prow.forEach(([a, b, c], i) => { put(wp, 4 + i, 1, tr(a)); put(wp, 4 + i, 2, b, i === 0 ? Object.assign({ fill: 'FFFF00' }, BLUE) : BLUE); put(wp, 4 + i, 3, tr(c), { wrap: true }); });
  const [APP, FAC, BLO, BHI, CAPP, DELTA, TEXEC, TBOARD] = [4, 5, 6, 7, 8, 9, 10, 11].map(r => 'Parameters!$B$' + r);

  /* Inputs */
  const wi = wb.sheet('Inputs');
  wi.set(0, 0, tr('Scenario inputs (0-1 scale unless stated) — Analytical estimate — validation required'), TTL);
  header(wi, 3, ['ID', 'Scenario', 'Pb(A)', 'Pb(psi,A)', 'de', 'dm', 'theta', 'mu(E)', 'CVSS v4.0 vector', 'CVSS-B', 'Prob. reduction', 'Impact reduction',
    'Conf Pb(A)', 'Conf Pb(psi,A)', 'Conf de', 'Conf dm', 'Conf theta', 'Conf mu', 'ATT&CK techniques', 'CWE', 'CVE'], [6, 60, 8, 9, 7, 7, 7, 7, 62, 8, 10, 10, 8, 9, 8, 8, 8, 8, 40, 22, 22]);
  const IR0 = 4;
  rows.forEach((r, i) => {
    const s = r.s, row = IR0 + i;
    put(wi, row, 1, s.id); put(wi, row, 2, s.name || '', { wrap: true });
    PARAMS.forEach((k, j) => put(wi, row, 3 + j, Number(val(s.params[k])), BLUE, '0.00'));
    put(wi, row, 9, s.cvss || '', BLUE); put(wi, row, 10, r.cvss, BLUE, '0.0');   // the engine's score: the vector's when a vector is present (X-1)
    put(wi, row, 11, Number(s.red_p), BLUE, '0.00'); put(wi, row, 12, Number(s.red_i), BLUE, '0.00');
    PARAMS.forEach((k, j) => put(wi, row, 13 + j, s.params[k]?.conf || '', BLUE));
    put(wi, row, 19, (s.attack || []).join('; ')); put(wi, row, 20, (s.cwe || []).join('; ')); put(wi, row, 21, (s.cves || []).join('; '));
  });
  wi.freeze = [3, 2];

  /* Portfolio */
  const wpo = wb.sheet('Portfolio');
  wpo.set(0, 0, tr('Recommended treatment portfolio (indicative {0} estimates - not quotations or approved budgets)').replace('{0}', A.CURRENCY || 'CAD'), TTL);
  header(wpo, 3, ['ID', 'Initiative', 'Owner', 'Priority', 'Type', 'Initial cost', 'Recurring / yr', 'Year-1 cost', '# scenarios', 'Y1 per scenario', ...SCEN.map(s => s.id), 'Start', 'End', 'Success indicator'],
    [6, 44, 26, 11, 16, 12, 12, 12, 9, 12, ...SCEN.map(() => 5), 9, 9, 50]);
  const P0 = 4;
  INITS.forEach((it, k) => {
    const r = P0 + k, y1 = (Number(it.initial) || 0) + (Number(it.recurring) || 0), n = it.scenarios.length;
    put(wpo, r, 1, it.id); put(wpo, r, 2, it.name || '', { wrap: true }); put(wpo, r, 3, it.owner || '', { wrap: true }); put(wpo, r, 4, it.priority || ''); put(wpo, r, 5, it.type || '', { wrap: true });
    put(wpo, r, 6, Number(it.initial) || 0, BLUE, '$#,##0'); put(wpo, r, 7, Number(it.recurring) || 0, BLUE, '$#,##0');
    put(wpo, r, 8, F(`F${r}+G${r}`, y1), {}, '$#,##0');
    put(wpo, r, 9, F(`SUM(K${r}:${LASTF}${r})`, n), {}, '0');
    put(wpo, r, 10, F(`IF(I${r}=0,0,H${r}/I${r})`, n ? y1 / n : 0), {}, '$#,##0');
    SCEN.forEach((s, j) => put(wpo, r, 11 + j, it.scenarios.includes(s.id) ? 1 : 0, BLUE, '0'));
    put(wpo, r, 11 + N, it.start || ''); put(wpo, r, 12 + N, it.end || ''); put(wpo, r, 13 + N, it.success || '', { wrap: true });
  });
  const PN = P0 + INITS.length - 1, PTOT = PN + 1;
  const sumY = k => INITS.reduce((s, it) => s + (k === 'y1' ? (Number(it.initial) || 0) + (Number(it.recurring) || 0) : Number(it[k]) || 0), 0);
  put(wpo, PTOT, 2, tr('TOTAL (each initiative counted once)'), B);
  if (INITS.length) {
    put(wpo, PTOT, 6, F(`SUM(F${P0}:F${PN})`, sumY('initial')), B, '$#,##0'); put(wpo, PTOT, 7, F(`SUM(G${P0}:G${PN})`, sumY('recurring')), B, '$#,##0'); put(wpo, PTOT, 8, F(`SUM(H${P0}:H${PN})`, sumY('y1')), B, '$#,##0');
  } else for (const c of [6, 7, 8]) put(wpo, PTOT, c, 0, B, '$#,##0');
  const alloc = {};
  SCEN.forEach((s, j) => {
    const v = INITS.reduce((t, it) => t + (it.scenarios.includes(s.id) ? ((Number(it.initial) || 0) + (Number(it.recurring) || 0)) / it.scenarios.length : 0), 0);
    alloc[s.id] = v;
    const c = 11 + j;
    put(wpo, PTOT, c, INITS.length ? F(`SUMPRODUCT(${L(c)}${P0}:${L(c)}${PN},$J$${P0}:$J$${PN})`, v) : 0, B, '$#,##0');
  });
  put(wpo, PTOT + 1, 2, tr('Check: sum of scenario allocations - portfolio Year-1 total (should be 0)'));
  const allocSum = Object.values(alloc).reduce((a, b) => a + b, 0);
  put(wpo, PTOT + 1, 8, N ? F(`SUM(K${PTOT}:${LASTF}${PTOT})-H${PTOT}`, Math.round((allocSum - sumY('y1')) * 1e6) / 1e6) : 0, {}, '$#,##0;($#,##0);-');
  wpo.set(PTOT + 2, 1, tr("Allocation assumption: each initiative's Year-1 cost is split equally across the scenarios it addresses, so shared controls are never charged in full to several scenarios."), { border: false });

  /* Analyse (inserted as 2nd sheet) */
  const wa = wb.sheet('Analyse');
  wb.sheets.splice(wb.sheets.indexOf(wa), 1); wb.sheets.splice(1, 0, wa);
  wa.set(0, 0, tr('Analyse - CyberRiskGuardian risk indices (Excel Guide v1.0c formulas)'), TTL);
  wa.set(1, 0, tr('Green = linked from Inputs / Portfolio / Parameters; black = formula.'), { border: false });
  header(wa, 4, ['ID', 'Scenario', 'Pb(A)', 'Pb(psi,A)', 'CVSS-B', 'de', 'dm', 'mu(E)', 'theta', 'Appetite', 'Factor', 'Estimated risk', 'Tolerated risk', 'Pre-treatment ratio',
    'Allocated Y1 cost', 'Prob. reduction', 'Impact reduction', 'Mitigated', 'Residual', 'Risk-to-tolerance ratio', 'Classification', 'Cost-effectiveness (risk units removed per $1,000)', 'Validity (P,Q in 0-1; CVSS present)', 'CVSS basis'],
    [6, 52, 7, 8, 7, 6, 6, 7, 7, 8, 8, 11, 11, 10, 12, 9, 9, 11, 11, 10, 24, 12, 10, 40]);
  const A0 = 5;
  const tot = { est: 0, tol: 0, mit: 0, res: 0, cost: 0 };
  rows.forEach((x, idx) => {
    const s = x.s, r = A0 + idx, ir = IR0 + idx, p = k => Number(val(s.params[k]));
    put(wa, r, 1, F(`Inputs!A${ir}`, s.id), GRN); put(wa, r, 2, F(`Inputs!B${ir}`, s.name || ''), Object.assign({ wrap: true }, GRN));
    put(wa, r, 3, F(`Inputs!C${ir}`, p('PbA')), GRN, '0.00'); put(wa, r, 4, F(`Inputs!D${ir}`, p('Pbx')), GRN, '0.00');
    put(wa, r, 5, F(`Inputs!J${ir}`, x.cvss), GRN, '0.0'); put(wa, r, 6, F(`Inputs!E${ir}`, p('De')), GRN, '0.00');
    put(wa, r, 7, F(`Inputs!F${ir}`, p('Dm')), GRN, '0.00'); put(wa, r, 8, F(`Inputs!H${ir}`, p('Mu')), GRN, '0.00');
    put(wa, r, 9, F(`Inputs!G${ir}`, p('Th')), GRN, '0.00'); put(wa, r, 10, F(APP, APPETITE), GRN, '0.00'); put(wa, r, 11, F(FAC, FACTOR), GRN, '#,##0');
    const est = x.est, tol = x.tol, mit = x.mit, res = x.res, cost = alloc[s.id] || 0;
    put(wa, r, 12, F(`C${r}*D${r}*E${r}*((F${r}+G${r})/2)*H${r}/I${r}*K${r}`, est), {}, '#,##0');
    put(wa, r, 13, F(`C${r}*D${r}*E${r}*J${r}*H${r}/I${r}*K${r}`, tol), {}, '#,##0');
    put(wa, r, 14, F(`IF(M${r}=0,"n/a",L${r}/M${r})`, tol ? est / tol : 'n/a'), {}, '0.00');
    put(wa, r, 15, F(`Portfolio!${L(11 + idx)}${PTOT}`, cost), GRN, '$#,##0');
    put(wa, r, 16, F(`Inputs!K${ir}`, Number(s.red_p)), GRN, '0.00'); put(wa, r, 17, F(`Inputs!L${ir}`, Number(s.red_i)), GRN, '0.00');
    put(wa, r, 18, F(`L${r}*P${r}*Q${r}`, mit), {}, '#,##0'); put(wa, r, 19, F(`MAX(0,L${r}-R${r})`, res), {}, '#,##0');   // guard: never negative
    // tolerated risk 0 (a probability, mu(E) or CVSS at 0): no ratio, "Not applicable" — never "Above tolerance"
    put(wa, r, 20, F(`IF(M${r}=0,"n/a",S${r}/M${r})`, tol ? x.ratio : 'n/a'), {}, '0.00');
    put(wa, r, 21, F(`IF(M${r}=0,"${tr(CRG.NOT_APPLICABLE)}",${CLS_F('T' + r, BLO, BHI)})`, tr(x.cls)));
    put(wa, r, 22, F(`IF(O${r}=0,0,(L${r}-S${r})/O${r}*1000)`, cost ? (est - res) / cost * 1000 : 0), {}, '0.00');
    put(wa, r, 23, F(`IF(ISBLANK(Inputs!J${ir}),"${tr('CVSS required')}",IF(AND(P${r}>=0,P${r}<=1,Q${r}>=0,Q${r}<=1),"OK","CHECK"))`, 'OK'));
    // 1.8.0 — "limited applicability" and equivalency shown beside the score; X-1 — a stored score that disagrees with its vector is flagged
    const cc = CRG.cvssCheck(s);
    put(wa, r, 24, tr(EQ.exportLabel(s)) + (cc.agree === false ? ' — ' + tr('stored score {0} disagrees with the vector ({1}); the vector\'s score is used').replace('{0}', cc.stored).replace('{1}', cc.computed) : ''), { wrap: true });
    tot.est += est; tot.tol += tol; tot.mit += mit; tot.res += res; tot.cost += cost;
  });
  const AN = A0 + N - 1, t = AN + 1;
  put(wa, t, 2, tr('Portfolio totals'), B);
  if (N) {
    put(wa, t, 12, F(`SUM(L${A0}:L${AN})`, tot.est), B, '#,##0'); put(wa, t, 13, F(`SUM(M${A0}:M${AN})`, tot.tol), B, '#,##0');
    put(wa, t, 18, F(`SUM(R${A0}:R${AN})`, tot.mit), B, '#,##0'); put(wa, t, 19, F(`SUM(S${A0}:S${AN})`, tot.res), B, '#,##0');
    put(wa, t, 15, F(`SUM(O${A0}:O${AN})`, tot.cost), B, '$#,##0'); put(wa, t, 20, F(`IF(M${t}=0,"n/a",S${t}/M${t})`, tot.tol ? tot.res / tot.tol : 'n/a'), B, '0.00');
    put(wa, t, 22, F(`IF(O${t}=0,0,(L${t}-S${t})/O${t}*1000)`, tot.cost ? (tot.est - tot.res) / tot.cost * 1000 : 0), B, '0.00');
    const red = wb.styles.dxf('F4CCCC'), amb = wb.styles.dxf('FFF2CC'), gr = wb.styles.dxf('D9EAD3');
    wa.condFormat(`T${A0}:T${AN}`, [{ op: 'greaterThan', formulas: [BHI], dxf: red }, { op: 'between', formulas: [BLO, BHI], dxf: amb }, { op: 'lessThan', formulas: [BLO], dxf: gr }]);
  }
  wa.freeze = [4, 2];
  wa.set(t + 1, 1, tr('Interpretation: Residual/Tolerated simplifies to ((de+dm)/2) x (1 - P x Q) / Appetite - CVSS, probabilities, resilience and criticality scale magnitude (ranking) but cancel out of the tolerance test. Below tolerance (< 0.90) needs P x Q > 1 - 0.90 x Appetite / average damage; ratio <= 1.00 needs P x Q >= 1 - Appetite / average damage.'), { border: false });

  /* Sensitivity */
  const wsn = wb.sheet('Sensitivity');
  wsn.set(0, 0, tr('Sensitivity - lower / central / higher cases'), TTL);
  wsn.set(1, 0, tr('Lower case: Pb(A), Pb(psi,A), de, dm -delta; theta +delta; reductions +delta. Higher case: the reverse. The central case is the Inputs row, never shifted or clamped; a shifted value is clamped to [0.05, 0.99] in the direction of the shift only.'), { border: false });
  header(wsn, 4, ['ID', 'Case', 'Shift', 'Pb(A)', 'Pb(psi,A)', 'de', 'dm', 'theta', 'mu', 'CVSS', 'P red', 'I red', 'Estimated', 'Tolerated', 'Residual', 'Ratio', 'Classification'], [6, 10, 7, 7, 8, 7, 7, 7, 7, 7, 7, 7, 11, 11, 11, 8, 26]);
  const sensIds = (A.SENS_IDS || []).filter(x => sid.has(x));
  const SENS = sensIds.length ? sensIds : rows.slice().sort((a, b) => b.est - a.est).slice(0, 5).map(x => x.id);
  let r = 5;
  const clampv = v => Math.max(0.05, Math.min(0.99, v));
  for (const id of SENS) {
    const idx = SCEN.findIndex(s => s.id === id), ir = IR0 + idx, s = SCEN[idx], xr = rows[idx];
    for (const [lab, sign] of [['Lower', -1], ['Central', 0], ['Higher', 1]]) {
      const d = sign * 0.1, sh = CRG.shift(s, d), c = CRG.calc(sh, APPETITE, FACTOR);
      // NV-045: the central row links to Inputs (never shifted, never clamped); a shifted value is clamped in the direction
      // of the shift only — an upward shift can never fall below the input, a downward one never rise above it
      const up = (cell, delta) => sign === 0 ? cell : sign > 0 ? `MAX(${cell},MIN(0.99,${cell}+${delta}))` : `MIN(${cell},MAX(0.05,${cell}+${delta}))`;
      const down = (cell, delta) => sign === 0 ? cell : sign > 0 ? `MIN(${cell},MAX(0.05,${cell}-${delta}))` : `MAX(${cell},MIN(0.99,${cell}-${delta}))`;
      const sty = sign === 0 ? GRN : {};
      put(wsn, r, 1, id); put(wsn, r, 2, tr(lab)); put(wsn, r, 3, F(`${sign}*${DELTA}`, d), {}, '0.00');
      put(wsn, r, 4, F(up(`Inputs!C${ir}`, `C${r}`), sh.params.PbA.v), sty, '0.00'); put(wsn, r, 5, F(up(`Inputs!D${ir}`, `C${r}`), sh.params.Pbx.v), sty, '0.00');
      put(wsn, r, 6, F(up(`Inputs!E${ir}`, `C${r}`), sh.params.De.v), sty, '0.00');
      put(wsn, r, 7, F(sign === 0 ? `Inputs!F${ir}` : `MAX(F${r},${up(`Inputs!F${ir}`, `C${r}`)})`, sh.params.Dm.v), sty, '0.00');   // dm >= de kept
      put(wsn, r, 8, F(down(`Inputs!G${ir}`, `C${r}`), sh.params.Th.v), sty, '0.00'); put(wsn, r, 9, F(`Inputs!H${ir}`, Number(val(s.params.Mu))), GRN, '0.00');
      put(wsn, r, 10, F(`Inputs!J${ir}`, xr.cvss), GRN, '0.0');
      put(wsn, r, 11, F(down(`Inputs!K${ir}`, `C${r}`), sh.red_p), sty, '0.00'); put(wsn, r, 12, F(down(`Inputs!L${ir}`, `C${r}`), sh.red_i), sty, '0.00');
      put(wsn, r, 13, F(`D${r}*E${r}*J${r}*((F${r}+G${r})/2)*I${r}/H${r}*${FAC}`, c.est), {}, '#,##0');
      put(wsn, r, 14, F(`D${r}*E${r}*J${r}*${APP}*I${r}/H${r}*${FAC}`, c.tol), {}, '#,##0');
      put(wsn, r, 15, F(`MAX(0,M${r}-M${r}*K${r}*L${r})`, c.res), {}, '#,##0'); put(wsn, r, 16, F(`IF(N${r}=0,"n/a",O${r}/N${r})`, c.tol ? c.ratio : 'n/a'), {}, '0.00');
      put(wsn, r, 17, F(`IF(N${r}=0,"${tr(CRG.NOT_APPLICABLE)}",${CLS_F('P' + r, BLO, BHI)})`, tr(CRG.classify(c.ratio))));
      r++;
    }
  }
  r++;
  put(wsn, r, 1, tr('Appetite sensitivity (central parameters): ratio at alternative appetite values'), B);
  header(wsn, r + 1, ['ID', 'Appetite 0.20', 'Appetite 0.30', 'Appetite 0.40']);
  rows.forEach((x, i) => {
    const rr = r + 2 + i, ar = A0 + i;
    put(wsn, rr, 1, x.id);
    [0.2, 0.3, 0.4].forEach((a, j) => put(wsn, rr, 2 + j, F(`IF(Analyse!M${ar}=0,"n/a",Analyse!S${ar}/(Analyse!M${ar}/Analyse!J${ar}*${a}))`, x.tol ? x.res / (x.tol / APPETITE * a) : 'n/a'), {}, '0.00'));
  });

  /* Case view */
  const wc = wb.sheet('Case_View');
  wc.set(0, 0, tr('Case-native escalation view - secondary cross-check'), TTL);
  wc.set(1, 0, tr('Normalized residual = T x E x I x (1 - C), with T = Pb(A), E = Pb(psi,A), I = (de+dm)/2, C (control maturity) proxied by theta. Post-treatment = current x (1 - P x Q). Analyst mapping - validate.'), { border: false });
  header(wc, 4, ['ID', 'T', 'E', 'I', 'C (theta)', 'Current residual', 'Level', 'Post-treatment residual', 'Level', 'Acceptance authority (post)'], [6, 7, 7, 7, 9, 12, 11, 14, 11, 28]);
  const lvl = v => tr(v <= 0.07 ? 'Low' : v <= 0.15 ? 'Moderate' : v <= 0.25 ? 'High' : 'Critical');
  const lv = c => `IF(${c}<=0.07,"${tr('Low')}",IF(${c}<=0.15,"${tr('Moderate')}",IF(${c}<=0.25,"${tr('High')}","${tr('Critical')}")))`;
  const AUTH = ['Board / ownership group', 'Executive leadership', 'CIO / Cybersecurity lead'].map(x => tr(x));
  rows.forEach((x, i) => {
    const s = x.s, rr = 5 + i, ir = IR0 + i, p = k => Number(val(s.params[k]));
    const I = (p('De') + p('Dm')) / 2, cur = x.norm_cur, post = x.norm_post;
    put(wc, rr, 1, s.id); put(wc, rr, 2, F(`Inputs!C${ir}`, p('PbA')), GRN, '0.00'); put(wc, rr, 3, F(`Inputs!D${ir}`, p('Pbx')), GRN, '0.00');
    put(wc, rr, 4, F(`(Inputs!E${ir}+Inputs!F${ir})/2`, I), {}, '0.00'); put(wc, rr, 5, F(`Inputs!G${ir}`, p('Th')), GRN, '0.00');
    put(wc, rr, 6, F(`B${rr}*C${rr}*D${rr}*(1-E${rr})`, cur), {}, '0.000'); put(wc, rr, 7, F(lv(`F${rr}`), lvl(cur)));
    put(wc, rr, 8, F(`F${rr}*(1-Inputs!K${ir}*Inputs!L${ir})`, post), {}, '0.000'); put(wc, rr, 9, F(lv(`H${rr}`), lvl(post)));
    put(wc, rr, 10, F(`IF(H${rr}>${TBOARD},"${AUTH[0]}",IF(H${rr}>${TEXEC},"${AUTH[1]}","${AUTH[2]}"))`, post > 0.40 ? AUTH[0] : post > 0.25 ? AUTH[1] : AUTH[2]));
  });

  /* registers */
  const register = (name, cols, widths, data) => { const w = wb.sheet(name); header(w, 1, cols, widths); data.forEach((row, i) => row.forEach((v, j) => put(w, i + 2, j + 1, v ?? '', { wrap: true }))); w.freeze = [1, 0]; return w; };
  register('Scenarios', ['ID', 'Library ref', 'Scenario', 'Statement', 'Threat source', 'Vulnerabilities / conditions', 'Existing controls (evidence)', 'Treatment package', 'Initiatives', 'Risk owner', 'Horizon', 'CVSS rationale', 'ATT&CK techniques', 'CWE', 'CVE'],
    [6, 14, 34, 70, 24, 50, 40, 50, 20, 22, 12, 60, 50, 30, 30],
    SCEN.map(s => [s.id, s.ref || '', s.name || '', s.statement || '', s.threat_source || '', (s.vulns || []).join('; '), (s.controls || []).join('; '), s.treatment || '', (s.inits || []).join(', '), s.owner || '', s.horizon || '', s.cvss_note || '',
      (s.attack || []).map(id => id + ' ' + techName(id)).join('; '), (s.cwe || []).map(c => c + ' ' + (cwe(c)?.name || '')).join('; '), (s.cves || []).join('; ')]));
  register('Candidates', ['ID', 'Candidate scenario', 'Threat source', 'Vulnerability / condition', 'Primary asset', 'Undesired outcome', 'Library ref', 'Decision', 'Screening rationale'], [6, 44, 22, 38, 14, 28, 14, 18, 50], A.CANDIDATES || []);
  const defs = allDefs(ws), cur = autoValues(ws);
  const lastRec = (ws.kriHistory || []).slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  register('KRIs', ['ID', 'KRI', 'Scenarios', 'Measurement', 'Data source', 'Owner', 'Frequency', 'Target', 'Warning', 'Critical', 'Current value', 'Status'], [8, 44, 12, 34, 24, 20, 11, 12, 12, 14, 12, 12],
    [...(A.KRIS || []).map(k => { const d = defs.find(x => x.id === k[0]); const v = lastRec?.values?.[k[0]]; return [...k.slice(0, 10), v ?? '', d ? tr(status(d, v).label) : '']; }),
      ...defs.filter(d => !d.manual).map(d => [d.id, tr(d.name), d.risk, tr(d.method), tr('CyberRiskGuardian (computed)'), tr('Risk analyst'), tr('Each recording'), d.target ?? '', d.warn ?? '', d.crit ?? '', Number.isFinite(cur[d.id]) ? +cur[d.id].toFixed(4) : '', tr(status(d, cur[d.id]).label)])]);
  // 1.8.0 — the CVSS basis of every scenario, with the justification of each metric when scored by equivalency;
  // X-1 — the score the engine used, its source, the stored score and the check (a disagreeing stored score is flagged)
  register('CVSS_Basis', ['ID', 'Scenario', 'CVSS-B (used)', 'Score source', 'Vector', 'Stored score', 'Check', 'Basis', 'Weakness type', 'Justification per metric'], [6, 40, 8, 18, 60, 8, 34, 44, 22, 90],
    rows.map(x => { const cc = CRG.cvssCheck(x.s); return [x.s.id, x.s.name || '', x.cvss, tr(x.cvss_source === 'vector' ? 'vector' : 'stored score (no vector)'), x.s.cvss || '', cc.stored ?? '',
      cc.agree === false ? tr('stored score disagrees with the vector — the vector\'s score is used') : cc.agree === true ? 'OK' : '', tr(EQ.exportLabel(x.s)), EQ.isEquiv(x.s) ? tr(EQ.typeLabel(x.s.cvss_equiv?.type)) : '', EQ.justificationText(x.s, EQ.metricsOf(x.s.cvss))]; }));
  register('Evidence', ['ID', 'Source', 'Basis', 'Content used', 'Strength', 'Classification', 'Date', 'Custodian'], [6, 60, 30, 100, 12, 28, 12, 20], [...(A.EVIDENCE || []), ...(ws.docs || []).map((d, i) => ['D' + (i + 1), d.name, d.category, tr('Context document uploaded {0}; {1} words extracted ({2})').replace('{0}', d.added).replace('{1}', d.words).replace('{2}', d.type)])]);

  /* Organization */
  const wo = wb.sheet('Organization');
  wo.set(0, 0, tr('Organizational context'), TTL);
  const o = ws.org;
  const orows = [['Organization', o.name], ['Workspace', ws.name + ' (' + tr(ws.kind) + ')'], ['Sector', o.sector], ['Size', o.size], ['Region / jurisdiction', o.region], ['Mission', o.mission], ['Products and services', o.services],
    ['Critical business processes', o.processes], ['Critical systems', o.systems], ['Cloud environments', o.cloud], ['Suppliers and partners', o.suppliers], ['Legal and regulatory obligations', (o.regulations || []).join('; ')],
    ['Sensitive information', o.sensitive], ['Availability requirements', o.availability], ['Controls and maturity', o.maturity], ['Incident history', o.incidents], ['Risk appetite', APPETITE], ['Appetite rationale', ws.appetite_rationale],
    ...(ws.classroom ? [['Course', ws.classroom.course], ['Business case', ws.classroom.case_title], ['Team', ws.classroom.team], ['Members', ws.classroom.members], ['Instructor', ws.classroom.instructor]] : [])];
  header(wo, 3, ['Item', 'Value'], [32, 120]);
  orows.forEach(([k, v], i) => { put(wo, 4 + i, 1, tr(k), B); put(wo, 4 + i, 2, v ?? '', { wrap: true }); });
  const cr = 6 + orows.length;
  put(wo, cr, 1, tr('Crown-jewel assets and services'), B);
  ['ID', 'Asset / service', 'Role in the mission', 'Owner', 'Confidentiality', 'Integrity', 'Availability', 'Dependencies', 'Suppliers'].forEach((h, j) => wo.set(cr, j, tr(h), HDR));
  (A.CROWN || []).forEach((row, i) => row.forEach((v, j) => wo.set(cr + 1 + i, j, v ?? '', { wrap: true })));

  /* Threats */
  const wt = wb.sheet('Threats');
  wt.set(0, 0, tr('Threats - MITRE ATT&CK mapping ({0})').replace('{0}', self.CRG_KB?.meta?.attack?.version || ''), TTL);
  header(wt, 3, ['Scenario', 'Technique', 'Name', 'Tactics', 'ATT&CK mitigations', 'CWE via CAPEC', 'Intrusion sets using it', 'URL'], [8, 12, 44, 30, 60, 30, 10, 50]);
  let tr2 = 4;
  for (const s of SCEN) for (const id of s.attack || []) {
    const tt = tech(id); if (!tt) continue;
    [s.id, id, tt.fullName, tt.tactics.join(', '), tt.mitigations.map(m => m + ' ' + (mitigation(m)?.name || '')).join('; '), tt.cwe.slice(0, 8).join(', '), tt.groups, tt.url].forEach((v, j) => put(wt, tr2, j + 1, v, { wrap: true }));
    tr2++;
  }
  wt.freeze = [3, 0];

  /* Vulnerabilities */
  const wv = wb.sheet('Vulnerabilities');
  wv.set(0, 0, tr('Vulnerability register - exposure gate (C4); KEV / EPSS from the threat-context snapshot {0}').replace('{0}', S.snap?.retrieved || tr('(none loaded)')), TTL);
  header(wv, 3, ['CVE', 'Product', 'Asset', 'Exposure confirmed', 'CVSS', 'CWE', 'KEV added', 'KEV ransomware', 'EPSS', 'EPSS percentile', 'Ladder rung', 'Ladder label', 'Applies (C4)', 'Scenarios', 'Source', 'Notes'],
    [16, 30, 30, 10, 7, 18, 11, 11, 8, 9, 7, 34, 9, 18, 26, 40]);
  (ws.vulns || []).forEach((v, i) => {
    const k = S.snap?.kev?.cves?.[v.id], e = S.snap?.epss?.scores?.[v.id], lr = S.snap ? ladder(v.id, S.snap, !!v.exposed) : null;
    [v.id, v.product || v.title || '', v.asset || '', tr(v.exposed ? 'yes' : 'no'), v.cvss ?? '', (v.cwe || []).join('; '), k?.added || '', k?.ransomware || '', e ? e[0] : '', e ? e[1] : '', lr?.rung ?? '', tr(lr?.label || ''), lr ? tr(lr.applies ? 'yes' : 'watch list') : '',
      SCEN.filter(s => (s.cves || []).includes(v.id)).map(s => s.id).join(', '), v.source || '', v.notes || ''].forEach((x, j) => put(wv, 4 + i, j + 1, x, { wrap: true }, j === 8 || j === 9 ? '0.000' : undefined));
  });
  wv.freeze = [3, 1];

  /* Recommendations */
  const wr = wb.sheet('Recommendations');
  wr.set(0, 0, tr('Recommendations - treatment options (decision support; the decision belongs to management)'), TTL);
  header(wr, 3, ['ID', 'Scenario', 'Untreated ratio', 'Treated ratio', 'Classification', 'Suggested option', 'Also consider', 'Basis', 'Initiatives', 'Allocated Y1 cost', 'Roadmap phase', 'Decision', 'Owner', 'Horizon', 'Rationale', 'Recorded'],
    [6, 44, 9, 9, 22, 12, 14, 70, 20, 12, 14, 12, 20, 12, 40, 11]);
  const initById = Object.fromEntries(INITS.map(i => [i.id, i]));
  rows.forEach((x, i) => {
    const sg = suggest(x), d = ws.decisions[x.id] || {};
    const first = (x.s.inits || []).map(id => initById[id]).filter(Boolean).map(horizonBucket).sort()[0] || '';
    [x.id, x.name, x.tol ? +(x.est / x.tol).toFixed(4) : 'n/a', x.tol ? +x.ratio.toFixed(4) : 'n/a', tr(x.cls), tr(sg.primary), sg.also.map(a => tr(a)).join(', '), sg.why.map(w => tr(w)).join(' '), (x.s.inits || []).join(', '), alloc[x.id] || 0, tr(first), tr(d.option || 'pending'), d.owner || '', d.horizon || '', d.note || '', d.date || '']
      .forEach((v, j) => put(wr, 4 + i, j + 1, v, { wrap: true }, j === 2 || j === 3 ? '0.00' : j === 9 ? '$#,##0' : undefined));
  });
  wr.freeze = [3, 2];

  /* KRI history */
  const wk = wb.sheet('KRI_History');
  wk.set(0, 0, tr('KRI history - recorded measurements'), TTL);
  const ids = defs.map(d => d.id);
  header(wk, 3, ['Date', ...ids, 'Note'], [11, ...ids.map(() => 10), 50]);
  (ws.kriHistory || []).slice().sort((a, b) => a.date.localeCompare(b.date)).forEach((h, i) => { put(wk, 4 + i, 1, h.date); ids.forEach((id, j) => put(wk, 4 + i, 2 + j, h.values[id] ?? '', {}, '0.00')); put(wk, 4 + i, 2 + ids.length, h.note || '', { wrap: true }); });
  defs.forEach((d, j) => wk.set(1, 1 + j, d.manual ? d.name : tr(d.name), { wrap: true, italic: true, border: false }));   // a person's own KRI name is never translated
  wk.freeze = [3, 1];

  /* Budget */
  const wbu = wb.sheet('Budget');
  wbu.set(0, 0, tr('Cybersecurity budget - appetite-consistent point target (12% / 7.8% / 4% of total IT budget incl. salaries at appetite 0.30 / 0.50 / 0.70)'), TTL);
  const bd = ws.budget || {};
  header(wbu, 3, ['Item', 'Value', 'Note'], [46, 16, 80]);
  const it = Number(bd.it_budget) || 0, spend = Number(bd.spend) || 0, base = Number(bd.baseline) || 0, tg = CRG.budgetTarget(APPETITE), ia = it ? CRG.impliedAppetite(spend / it) : null;
  // Conventions (NV-094, the reference engine's): gap = spend - target (negative = below the target); below the 4% point
  // target the implied appetite is "above 0.70, outside the guideline"; the position names the point targets.
  const BELOW4 = tr('Below the 4% point target (funding implies an appetite above 0.70, outside the guideline)');
  put(wbu, 4, 1, tr('Total IT budget (incl. salaries), {0}').replace('{0}', ws.budgetYear)); put(wbu, 4, 2, it, BLUE, '$#,##0');
  put(wbu, 5, 1, tr('Risk appetite')); put(wbu, 5, 2, F(APP, APPETITE), GRN, '0.00');
  put(wbu, 6, 1, tr('Planned cybersecurity spend ({0})').replace('{0}', ws.budgetYear)); put(wbu, 6, 2, spend, BLUE, '$#,##0');
  put(wbu, 7, 1, tr('Baseline (run) security cost')); put(wbu, 7, 2, base, BLUE, '$#,##0');
  put(wbu, 8, 1, tr('Appetite-consistent target (% of IT)')); put(wbu, 8, 2, F('IF(B5<=0.3,0.12,IF(B5<=0.5,0.12+(B5-0.3)/(0.5-0.3)*(0.078-0.12),IF(B5<=0.7,0.078+(B5-0.5)/(0.7-0.5)*(0.04-0.078),0.04)))', tg), {}, '0.00%');
  put(wbu, 8, 3, tr('Linear interpolation between the point targets 0.30 -> 12%, 0.50 -> 7.8%, 0.70 -> 4%, held at the end value outside.'));
  put(wbu, 9, 1, tr('Appetite-consistent target ($)')); put(wbu, 9, 2, F('B8*B4', tg * it), {}, '$#,##0');
  put(wbu, 10, 1, tr('Current spend (% of IT)')); put(wbu, 10, 2, F('IF(B4=0,0,B6/B4)', it ? spend / it : 0), {}, '0.00%');
  put(wbu, 11, 1, tr('Gap to target ($, spend - target; negative = below the target)')); put(wbu, 11, 2, F('B6-B9', spend - tg * it), {}, '$#,##0;($#,##0)');
  put(wbu, 11, 3, F(`IF(B11<0,"${tr('Below the appetite-consistent target')}","${tr('At or above the appetite-consistent target')}")`, tr(CRG.targetStatus(it ? spend / it : 0, APPETITE).status)));
  put(wbu, 12, 1, tr('Implied appetite of current spend')); put(wbu, 12, 2, F(`IF(B10>=0.12,0.3,IF(B10>=0.078,0.3+(0.12-B10)/(0.12-0.078)*(0.5-0.3),IF(B10>=0.04,0.5+(0.078-B10)/(0.078-0.04)*(0.7-0.5),"${tr('above 0.70 (outside the guideline)')}")))`, ia === null ? tr('above 0.70 (outside the guideline)') : ia), {}, '0.00');
  put(wbu, 12, 3, F(`IF(B10<0.04,"${BELOW4}",IF(B10>0.12,"${tr("Above the 12% point target (more than a risk-averse organization's best-practice target)")}","${tr('Between the 4% and 12% point targets')}"))`, tr(CRG.bandStatus(it ? spend / it : 0))));
  put(wbu, 13, 1, tr('Treatment envelope at the 4% / 7.8% / 12% point targets (after baseline)'));
  put(wbu, 13, 2, F('MAX(0,0.04*B4-B7)', Math.max(0, 0.04 * it - base)), {}, '$#,##0'); put(wbu, 13, 3, F('MAX(0,0.078*B4-B7)', Math.max(0, 0.078 * it - base)), {}, '$#,##0'); put(wbu, 13, 4, F('MAX(0,0.12*B4-B7)', Math.max(0, 0.12 * it - base)), {}, '$#,##0');
  put(wbu, 14, 1, tr('Portfolio Year-1 cost (all initiatives)')); put(wbu, 14, 2, F(`Portfolio!H${PTOT}`, sumY('y1')), GRN, '$#,##0');
  put(wbu, 15, 1, tr('Total cyber spend if portfolio funded (% of IT)')); put(wbu, 15, 2, F('IF(B4=0,0,(B7+B14)/B4)', it ? (base + sumY('y1')) / it : 0), {}, '0.00%');

  // budget by year and multi-year initiative allocation (live formulas)
  const { rows: plans } = commitments(ws);
  const yrs = ws.budgetYears.filter(y => !years || years.includes(y.year));
  let r0 = 18;
  put(wbu, r0, 1, tr('Allocation of initiatives over the years (3 years max)'), B);
  header(wbu, r0 + 1, ['Initiative', 'Start year', 'Years', 'Split', 'Year 1', 'Year 2', 'Year 3', 'Total']);
  const a0 = r0 + 2;
  plans.forEach(({ o, p }, i) => {
    const rr = a0 + i;
    put(wbu, rr, 1, `${o.id} ${o.name || ''}`, { wrap: true }); put(wbu, rr, 2, Number(p.start), BLUE, '0'); put(wbu, rr, 3, p.years, BLUE, '0');
    put(wbu, rr, 4, tr({ auto: 'Initial in Y1, recurring each year', pct: '% of 3-year total', amount: 'Amounts per year' }[p.mode]));
    p.amounts3.forEach((v, j) => put(wbu, rr, 5 + j, Math.round(v * 100) / 100, BLUE, '$#,##0'));
    put(wbu, rr, 8, F(`SUM(E${rr}:G${rr})`, p.amounts3.reduce((s2, x) => s2 + Math.round(x * 100) / 100, 0)), {}, '$#,##0');
  });
  const aN = a0 + Math.max(plans.length, 1) - 1;
  const y0 = aN + 3;
  put(wbu, y0 - 1, 1, tr('Budget by year'), B);
  header(wbu, y0, ['Year', 'Total IT budget', 'Planned cyber spend', 'Actual cyber spend', 'Baseline', 'Committed initiatives', 'Baseline + committed', '% of IT', 'Appetite target %', 'Against the appetite-consistent target', 'Note']);
  const V = { enter: tr('enter the IT budget'), above12: tr('above the 12% point target'), at: tr('at the appetite-consistent target'), above: tr('above the appetite-consistent target'), below4: tr('below the 4% point target (implied appetite above 0.70)'), below: tr('below the appetite-consistent target') };
  const per = commitments(ws).per;
  yrs.forEach((y, i) => {
    const rr = y0 + 1 + i, it2 = Number(y.it_budget) || 0, base2 = Number(y.baseline) || 0, com = per[y.year] || 0, tot2 = base2 + com, p2 = it2 ? tot2 / it2 : 0;
    put(wbu, rr, 1, y.year, BLUE, '0'); put(wbu, rr, 2, it2, BLUE, '$#,##0'); put(wbu, rr, 3, Number(y.spend) || 0, BLUE, '$#,##0');
    put(wbu, rr, 4, y.actual == null || y.actual === '' ? '' : Number(y.actual), BLUE, '$#,##0'); put(wbu, rr, 5, base2, BLUE, '$#,##0');
    const rng = c => `$${c}$${a0}:$${c}$${aN}`;
    put(wbu, rr, 6, plans.length ? F(`SUMIF(${rng('B')},A${rr},${rng('E')})+SUMIF(${rng('B')},A${rr}-1,${rng('F')})+SUMIF(${rng('B')},A${rr}-2,${rng('G')})`, com) : 0, {}, '$#,##0');
    put(wbu, rr, 7, F(`E${rr}+F${rr}`, tot2), {}, '$#,##0');
    put(wbu, rr, 8, F(`IF(B${rr}=0,0,G${rr}/B${rr})`, p2), {}, '0.00%');
    put(wbu, rr, 9, F('$B$8', tg), GRN, '0.00%');
    const verdict = !it2 ? V.enter : p2 > 0.12 ? V.above12 : Math.abs(p2 - tg) <= 0.005 ? V.at : p2 > tg ? V.above : p2 < 0.04 ? V.below4 : V.below;
    put(wbu, rr, 10, F(`IF(B${rr}=0,"${V.enter}",IF(H${rr}>0.12,"${V.above12}",IF(ABS(H${rr}-I${rr})<=0.005,"${V.at}",IF(H${rr}>I${rr},"${V.above}",IF(H${rr}<0.04,"${V.below4}","${V.below}")))))`, verdict));
    put(wbu, rr, 11, y.note || '', { wrap: true });
  });
  wbu.widthsFrom([46, 16, 30, 16, 16, 18, 18, 10, 12, 26, 40]);
  wbu.set(1, 0, tr('Single-year calculator rows 4-15 use budget year {0}.').replace('{0}', ws.budgetYear), { border: false, italic: true });

  /* Threat context */
  const wtc = wb.sheet('Threat_Context');
  wtc.set(0, 0, tr('Threat-context snapshot and revision log'), TTL);
  header(wtc, 3, ['Item', 'Value'], [34, 90]);
  const sn = S.snap;
  const trows = sn ? [['Snapshot', ws.snapshot?.name || ''], ['Schema', sn.schema], ['Retrieved', sn.retrieved], ['Expires', sn.expires], ['Regions', (sn.regions || []).join(', ')],
    ['KEV entries', sn.kev?.count ?? ''], ['EPSS scores', sn.epss?.count ?? ''], ...(sn.sources || []).map(s => ['Source', [s.name, s.version, s.score_date, s.entries != null ? s.entries + ' entries' : null].filter(Boolean).join(' · ')])]
    : [['Snapshot', tr('None loaded in this workspace')]];
  trows.forEach(([k, v], i) => { put(wtc, 4 + i, 1, tr(k), B); put(wtc, 4 + i, 2, v, { wrap: true }); });
  const lr0 = 6 + trows.length;
  put(wtc, lr0, 1, tr('Revision log'), B);
  ['Date', 'Scenario', 'Parameter', 'From', 'To', 'Ratio from', 'Ratio to', 'Classification from', 'Classification to', 'Cause', 'Snapshot'].forEach((h, j) => wtc.set(lr0, j, tr(h), HDR));
  (ws.revisionLog || []).forEach((x, i) => [x.date, x.scenario, x.parameter, x.from, x.to, x.ratioFrom, x.ratioTo, x.clsFrom, x.clsTo, x.cause, x.snapshot].forEach((v, j) => wtc.set(lr0 + 1 + i, j, v, { wrap: true })));

  /* Risk register (1.4.0) */
  const wrr = wb.sheet('Risk_Register');
  wrr.set(0, 0, tr('Risk register - ratings 1-5 (probability x impact); CRG figures = sum of the linked scenarios (verified engine)'), TTL);
  header(wrr, 3, ['ID', 'Risk', 'Category', 'Owner', 'Status', 'Treatment', 'Inherent L', 'Inherent I', 'Current L', 'Current I', 'Current score', 'Current level', 'Target L', 'Target I', 'Target score',
    'Scenarios', 'CRG estimated', 'CRG tolerated', 'CRG residual', 'CRG ratio', 'Threats (ATT&CK)', 'Threat description', 'Vulnerabilities', 'Assets', 'Measures', 'Review', 'Accepted by', 'Accepted until'],
    [8, 40, 12, 18, 12, 11, 6, 6, 6, 6, 7, 10, 6, 6, 7, 16, 10, 10, 10, 8, 40, 30, 30, 26, 18, 11, 18, 11]);
  (ws.risks || []).forEach((r, i) => {
    const rr = 4 + i, c = crgOf(r, R);
    const vals = [r.id, r.title, tr(r.category), r.owner, tr(r.status), tr(r.treatment), r.inherent?.l, r.inherent?.i, r.current?.l, r.current?.i, null, tr(level(score(r.current))[0]), r.target?.l, r.target?.i, null,
      (r.scenarios || []).join(', '), c ? Math.round(c.est) : '', c ? Math.round(c.tol) : '', c ? Math.round(c.res) : '', null,
      (r.threats || []).map(t => t + ' ' + techName(t)).join('; '), r.threatText || '', (r.vulns || []).join(', '), (r.assets || []).map(id => (ws.assets || []).find(a => a.id === id)?.name || id).join('; '), (r.measures || []).join(', '), r.review || '', r.acceptance?.by || '', r.acceptance?.until || ''];
    vals.forEach((v, j) => { if (v !== null) put(wrr, rr, j + 1, v ?? '', { wrap: true }); });
    put(wrr, rr, 11, F(`I${rr}*J${rr}`, score(r.current)));
    put(wrr, rr, 15, F(`M${rr}*N${rr}`, score(r.target)));
    put(wrr, rr, 20, c ? F(`IF(R${rr}>0,S${rr}/R${rr},"")`, Math.round(c.tol) ? Math.round(c.res) / Math.round(c.tol) : '') : '', {}, '0.00');
  });
  wrr.freeze = [3, 2];

  /* Measures (1.4.0) — combined reductions as live formulas */
  const wme = wb.sheet('Measures');
  wme.set(0, 0, tr('Mitigation measures - per scenario: red_p = 1 - PRODUCT(1 - rp), red_i = 1 - PRODUCT(1 - ri); mitigated = estimated x red_p x red_i (engine convention)'), TTL);
  const MS = (ws.measures || []).filter(m => m.status !== 'rejected');
  header(wme, 3, ['ID', 'Measure', 'Function', 'Owner', 'Status', 'One-time', 'Recurring', 'Year-1', 'Months', 'Default rp', 'Default ri', 'Confidence', 'Controls', 'Scenarios', 'Source', 'Initiative'],
    [8, 46, 12, 20, 12, 11, 11, 11, 7, 8, 8, 10, 46, 20, 10, 10]);
  MS.forEach((m, i) => { const rr = 4 + i;
    [m.id, m.name, tr(m.fn), m.owner, tr(m.status), Number(m.initial) || 0, Number(m.recurring) || 0, null, m.months, m.rp, m.ri, tr(m.conf), (m.ctl || []).map(k => { const c = control(k); return c ? c.fwName + ' ' + c.id : k; }).join('; '), (m.scen || []).join(', '), m.source, m.initId || '']
      .forEach((v, j) => { if (v !== null) put(wme, rr, j + 1, v ?? '', (j === 5 || j === 6 || j === 9 || j === 10) ? BLUE : { wrap: true }, j === 5 || j === 6 ? '$#,##0' : j === 9 || j === 10 ? '0.00' : undefined); });
    put(wme, rr, 8, F(`F${rr}+G${rr}`, (Number(m.initial) || 0) + (Number(m.recurring) || 0)), {}, '$#,##0'); });
  const totR = 4 + MS.length;
  put(wme, totR, 2, tr('Total (each measure counted once)'), B);
  if (MS.length) { put(wme, totR, 6, F(`SUM(F4:F${totR - 1})`, MS.reduce((t, m) => t + (Number(m.initial) || 0), 0)), B, '$#,##0'); put(wme, totR, 7, F(`SUM(G4:G${totR - 1})`, MS.reduce((t, m) => t + (Number(m.recurring) || 0), 0)), B, '$#,##0'); put(wme, totR, 8, F(`SUM(H4:H${totR - 1})`, MS.reduce((t, m) => t + (Number(m.initial) || 0) + (Number(m.recurring) || 0), 0)), B, '$#,##0'); }
  // effects table
  const e0 = totR + 3;
  put(wme, e0 - 1, 1, tr('Effect of each measure on each scenario'), B);
  ['Scenario', 'Measure', 'rp', 'ri', 'Rationale', 'Check'].forEach((h, j) => wme.set(e0 - 1, j, tr(h), HDR));
  const effRows = {}; let er = e0;
  for (const m of MS) for (const id of m.scen || []) { if (!SCEN.some(x => x.id === id)) continue; const e = effect(m, id);
    put(wme, er + 1, 1, id); put(wme, er + 1, 2, m.id); put(wme, er + 1, 3, e.rp, BLUE, '0.00'); put(wme, er + 1, 4, e.ri, BLUE, '0.00'); put(wme, er + 1, 5, m.eff?.[id]?.rationale || '', { wrap: true });
    // NV-066: a coefficient outside 0-1 is flagged, never clamped (the product rule leaves it out)
    put(wme, er + 1, 6, F(`IF(AND(C${er + 1}>=0,C${er + 1}<=1,D${er + 1}>=0,D${er + 1}<=1),"OK","${tr('CHECK: coefficient outside 0-1')}")`, validCoef(e.rp) && validCoef(e.ri) ? 'OK' : tr('CHECK: coefficient outside 0-1')));
    (effRows[id] ||= []).push(er + 1); er++; }
  // combined per scenario
  const c0 = er + 4;
  put(wme, c0 - 1, 1, tr('Combined reduction per scenario (compare with red_p / red_i in Inputs once applied)'), B);
  ['Scenario', 'Measures', 'red_p (combined)', 'red_i (combined)', 'red_p applied', 'red_i applied', 'Mitigated share red_p x red_i', 'Year-1 cost share'].forEach((h, j) => wme.set(c0 - 1, j, tr(h), HDR));
  let cr2 = c0;
  for (const s of SCEN) { const rs = effRows[s.id]; if (!rs) continue; const cb = combined(s.id, ws); const rr = cr2 + 1;
    put(wme, rr, 1, s.id); put(wme, rr, 2, cb.measures.map(m => m.id).join(', '));
    put(wme, rr, 3, F('1-' + rs.map(x => `(1-C${x})`).join('*'), cb.red_p), {}, '0.0000');
    put(wme, rr, 4, F('1-' + rs.map(x => `(1-D${x})`).join('*'), cb.red_i), {}, '0.0000');
    put(wme, rr, 5, s.red_p, {}, '0.0000'); put(wme, rr, 6, s.red_i, {}, '0.0000');
    put(wme, rr, 7, F(`C${rr}*D${rr}`, cb.red_p * cb.red_i), {}, '0.0000');
    const share = MS.filter(m => (m.scen || []).includes(s.id)).reduce((t, m) => t + ((Number(m.initial) || 0) + (Number(m.recurring) || 0)) / (m.scen || []).filter(x => ws.assessment.SCEN.some(y => y.id === x)).length, 0);
    put(wme, rr, 8, share, {}, '$#,##0'); cr2++; }
  wme.freeze = [3, 2];

  /* Compliance SoA (1.4.0) */
  const wso = wb.sheet('Compliance_SoA');
  wso.set(0, 0, tr('Statement of applicability and regulatory checklists - decision support, not legal advice'), TTL);
  const soa = soaRows(ws);
  header(wso, 3, ['Framework', 'Control', 'Title', 'Group', 'Applicable', 'Status', 'Maturity', 'Target', 'Gap', 'Owner', 'Evidence', 'Measures', 'Updated'], [14, 12, 50, 26, 9, 14, 8, 8, 6, 18, 40, 16, 11]);
  soa.forEach((x, i) => { const rr = 4 + i;
    [x.fw, x.id, x.title, x.grp, x.applicable, x.status, x.maturity, x.target, null, x.owner, x.evidence, x.measures, x.updated].forEach((v, j) => { if (v !== null) put(wso, rr, j + 1, v, { wrap: true }); });
    const gap = x.maturity !== '' && x.target !== '' ? Number(x.target) - Number(x.maturity) : '';
    put(wso, rr, 9, x.maturity !== '' && x.target !== '' ? F(`MAX(0,H${rr}-G${rr})`, Math.max(0, gap)) : ''); });
  wso.freeze = [3, 2];

  /* Assets (1.4.0) */
  const was = wb.sheet('Assets');
  was.set(0, 0, tr('Information assets - criticality (0-100) and dynamic risk (criticality x exposure), computed in the app'), TTL);
  header(was, 3, ['ID', 'Asset', 'Type', 'Owner', 'Classification', 'Sensitivity', 'C', 'I', 'A', 'Criticality', 'Tier', 'Exposure', 'Dynamic risk', 'Exposure factors', 'Hostname', 'IP', 'OS', 'Vendor', 'Product', 'Version',
    'Lifecycle', 'End of support', 'EDR', 'Disk encryption', 'Last patch', 'Baseline', 'Baseline status', 'MTD h', 'RTO h', 'RPO h', 'CVEs', 'Depends on', 'Scenarios', 'Discovery source'],
    [8, 30, 12, 18, 12, 14, 4, 4, 4, 9, 9, 9, 9, 40, 22, 13, 20, 14, 18, 10, 11, 11, 6, 8, 11, 26, 11, 7, 7, 7, 24, 20, 14, 16]);
  (ws.assets || []).forEach((a, i) => { const rr = 4 + i, c = criticality(a, ws), d = dynamic(a, ws, R);
    [a.id, a.name, tr(a.type), a.owner, a.classification, (a.sensitivity || []).join(' '), a.cia?.c, a.cia?.i, a.cia?.a, c.score, tr(c.tier), d.exposure, null, d.factors.map(f => tr(f[0])).join('; '), a.hostname, a.ip, a.os, a.vendor, a.product, a.version,
      a.lifecycle?.stage, a.lifecycle?.eos || a.lifecycle?.eol || '', a.endpoint?.edr === true ? tr('yes') : a.endpoint?.edr === false ? tr('no') : '', a.endpoint?.disk_enc === true ? tr('yes') : a.endpoint?.disk_enc === false ? tr('no') : '', a.endpoint?.last_patch || '',
      a.baseline?.name || '', a.baseline?.status || '', a.bia?.mtd ?? '', a.bia?.rto ?? '', a.bia?.rpo ?? '', (a.vulns || []).join(', '), (a.deps || []).join(', '), scenariosOf(a.id, ws).map(x => x.id).join(', '), a.discovery?.source || '']
      .forEach((v, j) => { if (v !== null) put(was, rr, j + 1, v ?? '', { wrap: true }); });
    put(was, rr, 13, F(`ROUND(J${rr}*L${rr},0)`, Math.round(c.score * d.exposure))); });
  was.freeze = [3, 2];

  // keep only the requested optional sheets (no core sheet refers to an optional one)
  const keep = new Set(sheets);
  if (!kriHistory) keep.delete('KRI_History');
  wb.sheets = wb.sheets.filter(sh => !OPTIONAL_SHEETS.includes(sh.name) || keep.has(sh.name));
  return { wb, title, n: N, rows };
}
