// 1.8.0 — MediBec S2 and S8 at AV:L (decision 1): the self-check requires 84,305 / 41,023, the browser engine,
// the desktop engine/crg_calc.py and the reference crg_calc agree, and no verdict changes.
import { open, ok, done, APP, tmp as tmpf } from './lib.mjs';
import { execFileSync } from 'child_process';
import fs from 'fs';
const { browser, page, errors } = await open('#/process');
ok(/engine verified · 84,305 \/ 41,023/.test(await page.textContent('#engine-state')), 'footer: engine verified · 84,305 / 41,023');
const r = await page.evaluate(async () => {
  const s = self.CRG_SAMPLE.SCEN, m = self.CRG_MEDIBEC.SCEN;
  const f = (L, id) => L.find(x => x.id === id);
  const run = CRG.run(self.CRG_SAMPLE), run2 = CRG.run(self.CRG_MEDIBEC);
  const QC = await import('/js/panels/qc.js'); const st = await import('/js/state.js');
  const ex = st.S.list.find(w => w.kind === 'example') || (await (async () => { await new Promise(r => setTimeout(r, 1000)); await st.refreshList(); return st.S.list.find(w => w.kind === 'example'); })()); await st.select(ex.id);
  const B = await import('/js/panels/batch.js');
  return { v2: f(s, 'S2').cvss, v8: f(s, 'S8').cvss, m2: f(m, 'S2').cvss, m8: f(m, 'S8').cvss, n2: f(m, 'S2').cvss_note, n8: f(m, 'S8').cvss_note,
    c2: CVSS4.score(f(s, 'S2').cvss), c8: CVSS4.score(f(s, 'S8').cvss), est: run.totals.est, res: run.totals.res, est2: run2.totals.est, res2: run2.totals.res,
    cls: run.results.map(x => x.cls.slice(0, 2)).join(''), qc12: QC.checks(st.S.ws).find(x => x.id === 'QC-12'),
    ransom: B.PATTERNS.find(p => p.key === 'ransom').cvss, json: JSON.stringify(st.exportAssessment(st.S.ws)) };
});
ok(/\/AV:L\//.test(r.v2) && /\/AV:L\//.test(r.v8) && /\/AV:L\//.test(r.m2) && /\/AV:L\//.test(r.m8), 'S2 and S8 are AV:L in sample.js and medibec.js');
ok(r.c2 === 9.3 && r.c8 === 9.2, 'S2 = 9.3, S8 = 9.2 ' + r.c2 + ' ' + r.c8);
ok(/opened locally/.test(r.n2) && /opened locally/.test(r.n8), 'cvss_note explains AV:L');
ok(Math.round(r.est) === 84305 && Math.round(r.res) === 41023 && Math.round(r.est2) === 84305 && Math.round(r.res2) === 41023, 'totals 84,305 / 41,023 on both data files');
ok(r.cls === 'ApAbBeApAbApAbApAbAbApApBeBeBeAbApAbAbAbBeBeAbApBeApAbAbApAp', 'no verdict changed');
ok(r.qc12.state === 'pass' && /84,305 \/ 41,023/.test(r.qc12.title), 'QC-12 names and passes 84,305 / 41,023');
ok(/\/AV:L\/.*UI:P/.test(r.ransom), 'the ransomware batch pattern (macro document) is AV:L');
// the desktop engine/crg_calc.py on the exported assessment, and the reference crg_calc on medibec30_avl.json
const tmp = tmpf('medibec-export.json'); fs.writeFileSync(tmp, r.json);
const py = execFileSync('python3', ['-I', APP + '/engine/crg_calc.py', tmp]).toString();
ok(/Total estimated 84,305\s+residual 41,023/.test(py), 'desktop engine/crg_calc.py: 84,305 / 41,023');
// optional: the base edition's reference calculator and its MediBec input (CRG_REF_CALC, CRG_REF_INPUT)
const ref = process.env.CRG_REF_CALC || '', refIn = process.env.CRG_REF_INPUT || '';
if (ref && refIn && fs.existsSync(ref) && fs.existsSync(refIn)) {
  const out = execFileSync('python3', ['-I', ref, refIn]).toString();
  ok(/Total estimated 84,305\s+residual 41,023/.test(out), 'reference crg_calc on medibec30_avl.json: 84,305 / 41,023');
}
// the python engine validates like the browser
let msg = '';
fs.writeFileSync(tmpf('bad.json'), JSON.stringify({ APPETITE: 0.3, FACTOR: 1000, SCEN: [{ id: 'X1', params: { PbA: { v: 0.5 }, Pbx: { v: 0.5 }, De: { v: 0.6 }, Dm: { v: 0.4 }, Th: { v: 0.5 }, Mu: { v: 0.5 } }, cvss: '', red_p: 0.5, red_i: 0.5 }] }));
try { execFileSync('python3', ['-I', APP + '/engine/crg_calc.py', tmpf('bad.json')], { stdio: 'pipe' }); } catch (e) { msg = String(e.stderr); }
ok(/δm must be at least δe/.test(msg) && /CVSS required/.test(msg), 'engine/crg_calc.py rejects δm < δe and a blank CVSS');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t24 AV:L self-check');
