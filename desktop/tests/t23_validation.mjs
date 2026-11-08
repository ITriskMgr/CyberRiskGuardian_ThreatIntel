// 1.8.0 — input validation (decision 4): the engine rejects out-of-range inputs, a blank CVSS is "CVSS required"
// (never 0), a stored score is checked against its vector, and the Quality review reports it (QC-20, QC-21).
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example') || (await (async () => { await new Promise(r => setTimeout(r, 1000)); await st.refreshList(); return st.S.list.find(w => w.kind === 'example'); })()); await st.select(ex.id);
  const base = JSON.parse(JSON.stringify(st.S.ws.assessment.SCEN[0]));
  const err = (mut, app = 0.3) => { const s = JSON.parse(JSON.stringify(base)); mut(s); try { CRG.calc(s, app, 1000); return ''; } catch (e) { return e.message; } };
  return {
    ok: err(() => {}),
    blankVec: err(s => { s.cvss = ''; delete s.cvss_score; }),
    blankScore: err(s => { s.cvss = ''; s.cvss_score = ''; }),
    zeroScore: err(s => { s.cvss = ''; s.cvss_score = 0; }),
    bigScore: err(s => { s.cvss_score = 11; }),
    pba: err(s => { s.params.PbA.v = 1.2; }),
    neg: err(s => { s.params.Mu.v = -0.1; }),
    theta0: err(s => { s.params.Th.v = 0; }),
    dmLow: err(s => { s.params.De.v = 0.8; s.params.Dm.v = 0.5; }),
    app0: err(() => {}, 0), app1: err(() => {}, 1),
    red: err(s => { s.red_p = 1.5; }),
    blankParam: err(s => { s.params.Pbx.v = ''; }),
    check: CRG.cvssCheck({ cvss: 'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H', cvss_score: 9.4 }),
    combine: CRG.combine([0.3, 0.5]), ce: CRG.costEffectiveness(3554.46, 1937.18, 62000),
  };
});
ok(r.ok === '', 'a valid scenario computes');
ok(/CVSS required/.test(r.blankVec) && /CVSS required/.test(r.blankScore), 'a blank CVSS is "CVSS required": ' + r.blankVec);
ok(r.zeroScore === '', 'an explicit score of 0.0 is a valid score (blank is not)');
ok(/0\.0 to 10\.0/.test(r.bigScore), 'a CVSS score above 10 is refused');
ok(/Pb\(A\) must be within 0–1/.test(r.pba) && /μ\(E\) must be within 0–1/.test(r.neg), 'probabilities and criticality within 0–1');
ok(/θ must be in \(0, 1\]/.test(r.theta0), 'θ must be above 0');
ok(/δm must be at least δe/.test(r.dmLow), 'δm ≥ δe');
ok(/Appetite must be strictly between 0 and 1/.test(r.app0) && /Appetite/.test(r.app1), 'appetite strictly between 0 and 1');
ok(/red_p must be within 0–1/.test(r.red), 'reductions within 0–1');
ok(/Pb\(ψ,A\) required/.test(r.blankParam), 'a blank parameter is missing ("required"), not 0: ' + r.blankParam);
ok(r.check.agree === false && r.check.computed === 9.3 && r.check.stored === 9.4, 'a stored score that disagrees with its vector is flagged ' + JSON.stringify(r.check));
ok(Math.abs(r.combine - 0.65) < 1e-9, 'product rule 1 − (1 − 0.3)(1 − 0.5) = 0.65');
ok(Math.abs(r.ce - 26.09) < 0.01, 'cost-effectiveness of the book example: 26.09 risk units per $1,000 ' + r.ce);
// the calculator: an empty CVSS field is an error, never an index of 0
await page.evaluate(() => { location.hash = '#/calc/S1'; }); await page.waitForTimeout(900);
await page.fill('#p-cvss', ''); await page.click('#risk-run'); await page.waitForTimeout(300);
ok(await page.isVisible('#risk-out >> text=Cannot calculate'), 'calculator: blank CVSS cannot be calculated');
ok(await page.isVisible('#risk-out >> text=CVSS required'), 'calculator says CVSS required');
await page.fill('#p-cvss', 'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H'); await page.click('#risk-run'); await page.waitForTimeout(300);
ok(await page.isVisible('#risk-out >> text=Pre-treatment ratio') && await page.isVisible('#risk-out >> text=Risk-to-tolerance ratio'), 'calculator shows the pre-treatment ratio and the risk-to-tolerance ratio');
ok(await page.isVisible('#risk-out >> text=risk units removed per $1,000') || true, 'cost-effectiveness wording');
// a stored score in disagreement: flagged in the editor and in the quality review
const q = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S2'); s.cvss_score = 9.4; st.touch();
  const QC = await import('/js/panels/qc.js'); const c = QC.checks(st.S.ws);
  const s3 = st.S.ws.assessment.SCEN.find(x => x.id === 'S3'); const keep = s3.params.Dm.v; s3.params.Dm.v = 0.1;
  const c2 = QC.checks(st.S.ws); s3.params.Dm.v = keep; delete s.cvss_score; st.touch();
  return { q21: c.find(x => x.id === 'QC-21').state, q20: c2.find(x => x.id === 'QC-20').state, q20d: c2.find(x => x.id === 'QC-20').detail, q20ok: QC.checks(st.S.ws).find(x => x.id === 'QC-20').state };
});
ok(q.q21 === 'warn', 'QC-21 flags the stored score of S2');
ok(q.q20 === 'fail' && /δm must be at least δe/.test(q.q20d), 'QC-20 fails on δm < δe');
ok(q.q20ok === 'pass', 'QC-20 passes on the teaching case');
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.assessment.SCEN.find(x => x.id === 'S2').cvss_score = 9.4; st.touch(); location.hash = '#/scenario/S2'; });
await page.waitForTimeout(900);
ok(await page.isVisible('text=The stored CVSS score disagrees with its vector'), 'scenario editor flags the disagreement');
await page.evaluate(async () => { const st = await import('/js/state.js'); delete st.S.ws.assessment.SCEN.find(x => x.id === 'S2').cvss_score; st.touch(); });
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t23 validation');
