// 1.9.2 — NV-083 / NV-066 / NV-045 / NV-094 / NV-004 / NV-P12 (ws2): the Excel export follows the interface language
// (sheet names stay English because formulas refer to them; user data is never translated); Residual carries MAX(0, …),
// Validity checks "CVSS required", the ratio cells guard a zero tolerated risk, a disagreeing stored CVSS score is listed
// in CVSS_Basis and flagged in Analyse; the Sensitivity central rows link to Inputs (never shifted or clamped) and the
// shifted rows clamp in the direction of the shift only; the Budget sheet follows the reference conventions. Every
// workbook recalculates in LibreOffice with 0 formula cells differing from the app's cached values and totals unchanged.
// Edition switch (D3): the source is the community edition (CIS titles with the notice); the package script's commercial
// build carries CIS identifiers only, and the catalogue applies the flag at run time.
import { open, ok, done, APP, TESTS, tmp as tmpf, goto } from './lib.mjs';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const { browser, page, errors } = await open('#/process');
page.on('dialog', d => d.accept());

async function exportWb(lang, tag) {
  const bytes = await page.evaluate(async ({ lang }) => {
    const i18n = await import('/js/i18n.js'); await i18n.setLang(lang, { save: false });
    const st = await import('/js/state.js'); const X = await import('/js/exportx.js');
    const { wb } = await X.buildWorkbook({ scope: 'all' });
    const b = await wb.bytes();
    const tot = st.compute(st.S.ws).totals;
    return { bytes: Array.from(b), est: Math.round(tot.est), res: Math.round(tot.res), sheets: wb.sheets.map(s => s.name) };
  }, { lang });
  const f = tmpf(`t61-${tag}.xlsx`); fs.writeFileSync(f, Buffer.from(bytes.bytes));
  const rep = JSON.parse(execFileSync('python3', ['-I', path.join(TESTS, 'xlsx_recalc.py'), f, tmpf(`t61-${tag}-work`)], { maxBuffer: 64 * 1024 * 1024 }).toString());
  return { rep, est: bytes.est, res: bytes.res, sheets: bytes.sheets };
}
const cell = (rep, sheet, ref) => rep.sheets[sheet]?.[ref] || [null, null];
const findRow = (rep, sheet, col, pred) => Object.keys(rep.sheets[sheet] || {}).filter(k => k.startsWith(col) && pred(rep.sheets[sheet][k][1] ?? rep.sheets[sheet][k][0])).map(k => Number(k.slice(col.length)));

// MediBec with one disagreeing stored score (S1), English
const prep = await page.evaluate(async () => {
  const st = await import('/js/state.js');
  let ex; for (let i = 0; i < 40 && !(ex = st.S.list.find(w => w.kind === 'example' && /MediBec/.test(w.name))); i++) { await new Promise(r => setTimeout(r, 250)); await st.refreshList?.(); }
  await st.select(ex.id);
  const s1 = st.S.ws.assessment.SCEN[0]; s1.cvss_score = 9.9; st.touch();
  return { id: s1.id, vec: CVSS4.score(s1.cvss) };
});
const EN = await exportWb('en', 'en');
ok(EN.est === 84305 && EN.res === 41023, 'MediBec totals 84,305 / 41,023 with the stored score present (the vector wins) ' + EN.est + ' ' + EN.res);
ok(EN.rep.lo, 'LibreOffice available for the recalculation');
ok(EN.rep.formulas > 400 && EN.rep.nocache === 0 && EN.rep.differ === 0, `EN workbook: ${EN.rep.formulas} formula cells, ${EN.rep.nocache} without cache, ${EN.rep.differ} differ after recalculation ` + EN.rep.diffs.slice(0, 5).join(' ; '));
ok(EN.sheets.join() === 'README,Analyse,Parameters,Inputs,Portfolio,Sensitivity,Case_View,Scenarios,Candidates,KRIs,CVSS_Basis,Evidence,Organization,Threats,Vulnerabilities,Recommendations,KRI_History,Budget,Threat_Context,Risk_Register,Measures,Compliance_SoA,Assets', 'sheet names unchanged (formulas refer to them) ' + EN.sheets.join());
// NV-066 — MAX(0, …) and Validity with "CVSS required"
ok(String(cell(EN.rep, 'Analyse', 'S5')[0]).startsWith('=MAX(0,L5-R5)'), 'Analyse Residual = MAX(0, Estimated − Mitigated): ' + cell(EN.rep, 'Analyse', 'S5')[0]);
ok(/^=IF\(ISBLANK\(Inputs!J4\),"CVSS required",IF\(AND\(P5>=0/.test(String(cell(EN.rep, 'Analyse', 'W5')[0])) && cell(EN.rep, 'Analyse', 'W5')[1] === 'OK', 'Validity column checks "CVSS required" then P, Q in 0–1: ' + cell(EN.rep, 'Analyse', 'W5')[0]);
ok(cell(EN.rep, 'Analyse', 'W4')[0] === 'Validity (P,Q in 0-1; CVSS present)', 'Validity header as in the reference workbook');
ok(/^=IF\(M5=0,"n\/a",S5\/M5\)/.test(String(cell(EN.rep, 'Analyse', 'T5')[0])) && /Not applicable \(tolerated risk 0\)/.test(String(cell(EN.rep, 'Analyse', 'U5')[0])), 'ratio and classification cells guard a zero tolerated risk');
ok(/^=MAX\(0,M5-M5\*K5\*L5\)/.test(String(cell(EN.rep, 'Sensitivity', 'O5')[0])), 'Sensitivity Residual = MAX(0, …): ' + cell(EN.rep, 'Sensitivity', 'O5')[0]);
// NV-004 — the stored score in the exports
ok(cell(EN.rep, 'Inputs', 'J4')[1] === prep.vec, `Inputs CVSS-B column holds the vector's score ${prep.vec} (stored 9.9 ignored)`);
ok(/stored score 9.9 disagrees with the vector/.test(String(cell(EN.rep, 'Analyse', 'X5')[0])), 'Analyse CVSS basis flags the disagreement: ' + String(cell(EN.rep, 'Analyse', 'X5')[0]).slice(0, 90));
const cb = EN.rep.sheets.CVSS_Basis;
ok(cb.A1[0] === 'ID' && cb.C1[0] === 'CVSS-B (used)' && cb.D1[0] === 'Score source' && cb.F1[0] === 'Stored score' && cb.G1[0] === 'Check', 'CVSS_Basis columns: used score, source, stored score, check');
ok(cb.C2[0] === prep.vec && cb.D2[0] === 'vector' && cb.F2[0] === 9.9 && /disagrees with the vector/.test(cb.G2[0]), 'CVSS_Basis row S1: vector ' + prep.vec + ', stored 9.9, flagged');
ok(!cb.G3 || cb.G3[0] === '' || cb.G3[0] === 'OK', 'CVSS_Basis row S2: no disagreement (' + (cb.G3 ? cb.G3[0] : 'blank') + ')');
// NV-045 — Sensitivity rows
const central = findRow(EN.rep, 'Sensitivity', 'B', v => v === 'Central');
ok(central.length >= 3, 'Sensitivity has Central rows: ' + central.length);
const c0 = central[0];
ok(cell(EN.rep, 'Sensitivity', 'D' + c0)[0] === `=Inputs!C${findRow(EN.rep, 'Inputs', 'A', v => v === cell(EN.rep, 'Sensitivity', 'A' + c0)[0])[0]}`, 'Central row Pb(A) links to Inputs, never shifted or clamped: ' + cell(EN.rep, 'Sensitivity', 'D' + c0)[0]);
ok(/^=MAX\(Inputs!C\d+,MIN\(0\.99,Inputs!C\d+\+C\d+\)\)$/.test(String(cell(EN.rep, 'Sensitivity', 'D' + (c0 + 1))[0])), 'Higher row Pb(A): clamp in the direction of the shift only (MAX(input, MIN(0.99, input + delta))): ' + cell(EN.rep, 'Sensitivity', 'D' + (c0 + 1))[0]);
ok(/^=MIN\(Inputs!C\d+,MAX\(0\.05,Inputs!C\d+\+C\d+\)\)$/.test(String(cell(EN.rep, 'Sensitivity', 'D' + (c0 - 1))[0])), 'Lower row Pb(A): MIN(input, MAX(0.05, input + delta)): ' + cell(EN.rep, 'Sensitivity', 'D' + (c0 - 1))[0]);
ok(/^=MIN\(Inputs!K\d+,MAX\(0\.05,Inputs!K\d+-C\d+\)\)$/.test(String(cell(EN.rep, 'Sensitivity', 'K' + (c0 + 1))[0])), 'Higher row red_p lowered with a floor-only clamp: ' + cell(EN.rep, 'Sensitivity', 'K' + (c0 + 1))[0]);
// NV-094 — Budget sheet conventions
const bud = EN.rep.sheets.Budget;
ok(bud.A11[0] === 'Gap to target ($, spend - target; negative = below the target)' && bud.B11[0] === '=B6-B9', 'Budget gap = spend − target: ' + bud.B11[0]);
ok(/Below the appetite-consistent target|At or above the appetite-consistent target/.test(String(bud.C11[0])) && /point target/.test(String(bud.C12[0])), 'Budget status and position wording follow the reference engine');
ok(/above 0\.70 \(outside the guideline\)/.test(String(bud.B12[0])) && !/below floor/.test(String(bud.B12[0])), 'implied appetite below 4%: "above 0.70 (outside the guideline)", not "below floor"');
const yr = Object.values(bud).some(v => v[0] === 'Against the appetite-consistent target');
ok(yr, 'Budget by year: "Against the appetite-consistent target" header, no "ceiling" / "floor" wording' + (Object.values(bud).some(v => /ceiling|floor/.test(String(v[0]))) ? ' (retired wording still present)' : ''));
ok(!Object.values(bud).some(v => /ceiling|floor/.test(String(v[0]))), 'no retired ceiling/floor wording in the Budget sheet');

// NV-083 — French: the same workbook in French recalculates to the same totals; headers, titles and verdicts in French; data untouched
const FR = await exportWb('fr', 'fr');
ok(FR.est === 84305 && FR.res === 41023 && FR.rep.differ === 0 && FR.rep.nocache === 0, `FR workbook: totals ${FR.est} / ${FR.res}, ${FR.rep.differ} formula cells differ after recalculation ` + FR.rep.diffs.slice(0, 5).join(' ; '));
ok(FR.sheets.join() === EN.sheets.join(), 'FR: sheet names unchanged (formulas refer to them)');
ok(cell(FR.rep, 'Analyse', 'L4')[0] === 'Risque estimé' && cell(FR.rep, 'Analyse', 'T4')[0] !== 'Risk-to-tolerance ratio' && /^Ratio /.test(cell(FR.rep, 'Analyse', 'T4')[0]) && cell(FR.rep, 'Analyse', 'W4')[0] === 'Validité (P, Q dans 0-1 ; CVSS présent)', 'FR Analyse headers translated (ratio label from the catalogue, FR-1 is ws5\'s): ' + [cell(FR.rep, 'Analyse', 'L4')[0], cell(FR.rep, 'Analyse', 'T4')[0]].join(' | '));
const frV = String(cell(FR.rep, 'Analyse', 'U5')[1]), frF = String(cell(FR.rep, 'Analyse', 'U5')[0]);
ok(!/tolerance$/.test(frV) && frF.includes('"' + frV + '"'), 'FR verdict cached value is French and appears as a literal of its own formula: ' + frV);
ok(cell(FR.rep, 'Parameters', 'A1')[0] === 'Paramètres globaux' && cell(FR.rep, 'Budget', 'A11')[0] === 'Écart par rapport à la cible ($, dépense – cible ; négatif = sous la cible)', 'FR titles and budget labels translated');
ok(cell(FR.rep, 'Inputs', 'B4')[0] === cell(EN.rep, 'Inputs', 'B4')[0] && cell(FR.rep, 'Inputs', 'I4')[0] === cell(EN.rep, 'Inputs', 'I4')[0], 'FR: scenario names and vectors (case data) are not translated');
ok(/Période d’évaluation/.test(String(cell(FR.rep, 'README', 'A3')[0])) && /Feuilles :/.test(JSON.stringify(FR.rep.sheets.README)), 'FR README translated');
await page.evaluate(async () => { const i18n = await import('/js/i18n.js'); await i18n.setLang('en', { save: false }); const st = await import('/js/state.js'); delete st.S.ws.assessment.SCEN[0].cvss_score; st.touch(); });

// NV-P12 / D3 — edition switch
const ed = await page.evaluate(async () => {
  const E = await import('/js/edition.js'); const K = await import('/js/catalog.js');
  const cis = K.controls().filter(c => c.fw === 'CIS81');
  const fw = K.FRAMEWORKS.find(f => f.id === 'CIS81');
  return { edition: E.EDITION, titles: E.CIS_TITLES, label: E.EDITION_LABEL, n: cis.length, first: cis[0], note: fw.note, hasTitle: cis.some(c => /Inventory and Control of Enterprise Assets/.test(c.title)) };
});
ok(ed.edition === 'community' && ed.titles === true && ed.label === 'Community edition', 'source tree = community edition');
ok(ed.n === 171 && ed.hasTitle && /CC BY-NC-ND 4\.0/.test(ed.note) && /non-commercial use/.test(ed.note), 'community: CIS titles shown with the CIS notice (171 rows)');
await goto(page, '#/about/versions', 800);
const ab = await page.evaluate(() => [...document.querySelectorAll('main > section')].find(x => !x.hidden).textContent);
ok(/Community edition/.test(ab), 'About → Versions names the edition');
// the package script: commercial build strips the CIS titles and labels (dry run on a copy; nothing in the source tree changes)
const out = execFileSync('python3', ['-I', path.join(APP, 'tools', 'package_desktop.py'), '--edition', 'commercial', '--dry-run'], { cwd: APP }).toString();
const copy = (out.match(/copy at (\S+)/) || [])[1];
ok(/commercial edition.*CIS rows reduced to identifiers: 171/.test(out) && copy && fs.existsSync(copy), 'package_desktop.py --edition commercial: 171 CIS rows reduced to identifiers ' + out.split('\n')[0]);
const ctl = fs.readFileSync(path.join(copy, 'js', 'data', 'controls.js'), 'utf8'), edj = fs.readFileSync(path.join(copy, 'js', 'edition.js'), 'utf8');
ok(!/Inventory and Control of Enterprise Assets|Keep a detailed enterprise asset inventory/.test(ctl) && /identifiers only \(commercial edition/.test(ctl), 'commercial copy: no CIS title or CRGO safeguard label in controls.js');
ok(/export const EDITION = 'commercial';/.test(edj), 'commercial copy: edition.js set to commercial');
ok(/Inventory and Control of Enterprise Assets/.test(fs.readFileSync(path.join(APP, 'js', 'data', 'controls.js'), 'utf8')) && /export const EDITION = 'community';/.test(fs.readFileSync(path.join(APP, 'js', 'edition.js'), 'utf8')), 'source tree untouched by the package script');
fs.rmSync(path.dirname(copy), { recursive: true, force: true });
// the run-time switch alone: with the commercial flag the catalogue row keeps the identifier only, whatever the file holds
const sw = await page.evaluate(async () => {
  const E = await import('/js/edition.js');
  return { c1: E.cisRow('CIS 1', 'Inventory and Control of Enterprise Assets', 'CIS Controls v8.1', false), s11: E.cisRow('1.1', 'Keep a detailed enterprise asset inventory', 'CIS 1 Inventory and Control of Enterprise Assets', false),
    keep: E.cisRow('1.1', 'Keep a detailed enterprise asset inventory', 'CIS 1 Inventory and Control of Enterprise Assets', true) };
});
ok(sw.c1.join('|') === 'CIS 1|CIS Controls v8.1' && sw.s11.join('|') === 'CIS v8.1 safeguard 1.1|CIS 1' && /Keep a detailed/.test(sw.keep[0]), 'run-time switch (cisRow): identifiers only under the commercial flag, titles kept otherwise ' + JSON.stringify(sw));
ok(!errors.filter(e => !/blob:/.test(e)).length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t61 Excel export and edition');
