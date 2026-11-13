// 1.8.0 — scenario screening (book ch05): twelve criteria, totals /60, escalation flags, families, four
// weighting schemes, judgment flags, coverage matrix, watch list, final portfolio; Process steps 5 to 7.
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example') || (await (async () => { await new Promise(r => setTimeout(r, 1000)); await st.refreshList(); return st.S.list.find(w => w.kind === 'example'); })()); await st.select(ex.id);
  const SC = await import('/js/screening.js'); const P = await import('/js/process.js');
  const ws = st.S.ws, A = SC.analysis(ws), C = ws.screening.cands;
  const u = id => A.units.find(x => x.id === id);
  return { n: A.list.length, c01: SC.total(C.C01), c02: SC.total(C.C02), c31: SC.total(C.C31), c29: SC.total(C.C29), sel: A.selected.map(x => x.id),
    judg: A.units.filter(x => x.byJudgment).map(x => x.id), review: A.units.filter(x => x.review).map(x => x.id), gaps: A.gaps,
    p02rank: u('P02').rank.equal, p01: u('P01').score.equal, crit: SC.CRITERIA.length, flags: SC.FLAGS.length, schemes: SC.SCHEMES.map(s => s[1]),
    guidance: A.guidance.kind, strat: A.strategies.length, s6: P.STEP.screen.status(ws), s7: P.STEP.select.status(ws), s5: P.STEP.generate.status(ws),
    g15: SC.countGuidance(15).kind, g22: SC.countGuidance(22).kind, g30: SC.countGuidance(30).kind, jm: A.judgmentMissing.length, fu: A.flaggedUnreviewed.length };
});
ok(r.crit === 12 && r.flags === 12, 'twelve criteria and twelve escalation flags');
ok(JSON.stringify(r.schemes) === '["Equal","Impact-led","Evidence-led","Decision-led"]', 'four weighting schemes');
ok(r.n === 45, 'MediBec ships 45 candidates');
ok(r.c01 === 52 && r.c31 === 48 && r.c29 === 44, 'totals /60 as in the book: C01 52, C31 48, C29 44');
ok(r.c02 === 56 && r.p02rank === 1, 'C02 56, ransomware family first');
ok(r.p01 === 52, 'a family takes its best member: P01 = C01 = 52 (C20 also 52, not added)');
ok(r.sel.length === 10, 'ten families selected');
ok(JSON.stringify(r.judg.sort()) === '["P05","P10"]', 'P05 and P10 are selected by judgment ' + r.judg);
ok(r.review.includes('C31'), 'C31 needs explicit review ' + r.review);
ok(r.gaps.includes('Fraud / BEC'), 'coverage: fraud / BEC is the gap ' + r.gaps);
ok(r.guidance === 'good' && r.strat === 5, '45 candidates and five strategies');
ok(r.g15 === 'bad' && r.g22 === 'warn' && r.g30 === 'good', 'candidate guidance: <20 too few, 20–24 lab version, 25–40 recommended');
ok(r.s5 === 'done' && r.s6 === 'done' && r.s7 === 'done' && r.jm === 0 && r.fu === 0, 'Process steps 5, 6 and 7 done on the teaching case');
// the screens
for (const t of ['candidates', 'screen', 'select', 'create', 'families', 'weights', 'coverage', 'watch', 'final']) {
  await page.evaluate(h => { location.hash = '#/screening/' + h; }, t); await page.waitForTimeout(500);
  const bad = await page.evaluate(() => [...document.querySelectorAll('#panel-screening .banner')].some(b => /raised an error/.test(b.textContent)));
  ok(!bad, 'screening tab renders: ' + t);
}
await page.evaluate(() => { location.hash = '#/screening/select'; }); await page.waitForTimeout(500);
ok(await page.isVisible('#panel-screening >> text=Selected by judgment') && await page.isVisible('#panel-screening >> text=Explicit review'), 'weighting tab shows the two flags');
// a new flagged candidate left out without review fails the quality review
await page.evaluate(() => { location.hash = '#/screening/candidates'; }); await page.waitForTimeout(400);
await page.click('#scr-add'); await page.waitForSelector('#scr-editor');
for (const [k, v] of [['BC', 3], ['AC', 3], ['TR', 1], ['EX', 2], ['IM', 4], ['RL', 2], ['OR', 2], ['DC', 2], ['EV', 1], ['RV', 2], ['CU', 3], ['DU', 2]]) await page.selectOption('#scr-' + k, String(v));
await page.click('#scr-editor label:has-text("Human safety") input');
await page.selectOption('#scr-disp', 'Defer');
const q = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const QC = await import('/js/panels/qc.js');
  const id = st.S.ws.assessment.CANDIDATES.at(-1)[0]; const rec = st.S.ws.screening.cands[id];
  const before = QC.checks(st.S.ws).find(x => x.id === 'QC-24').state;
  rec.exclReview = 'Reviewed with the CMO on 2026-10-20: treated by P05. Management decision required.';
  const after = QC.checks(st.S.ws).find(x => x.id === 'QC-24').state;
  return { id, total: SC.total(rec), flags: rec.flags, before, after, n: st.S.ws.assessment.CANDIDATES.length };
});
ok(q.total === 27 && q.flags.includes('S') && q.n === 46, 'the new candidate is scored (27 / 60) and flagged');
ok(q.before === 'fail' && q.after === 'pass', 'QC-24 fails until the flagged exclusion is reviewed ' + q.before + ' ' + q.after);
// batch rows become candidates
const b = await page.evaluate(async () => {
  const st = await import('/js/state.js'); st.S.ws.batchDraft = [{ pick: true, name: 'Test batch row', threat_source: 'Cybercriminal', vulns: 'weak MFA', assets: 'EHR', statement: 'A causal chain', pattern: 'phish' }]; st.touch();
  location.hash = '#/batch'; return st.S.ws.assessment.CANDIDATES.length; });
await page.waitForTimeout(800);
await page.click('#batch-to-screening'); await page.waitForTimeout(800);
const b2 = await page.evaluate(async () => { const st = await import('/js/state.js'); const c = st.S.ws.assessment.CANDIDATES.at(-1); return { n: st.S.ws.assessment.CANDIDATES.length, name: c[1], strat: st.S.ws.screening.cands[c[0]].strategy, hash: location.hash }; });
ok(b2.n === b + 1 && b2.name === 'Test batch row' && b2.strat.includes('BU') && /screening/.test(b2.hash), 'Batch → Add the ticked rows as screening candidates ' + JSON.stringify(b2));
// a family promoted to the register
await page.evaluate(async () => { const st = await import('/js/state.js'); const f = st.S.ws.screening.families.find(x => x.id === 'P10'); f.scenarios = []; st.touch(); location.hash = '#/screening/create'; });
await page.waitForTimeout(600);
const before = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.SCEN.length);
await page.click('#scr-create-all'); await page.waitForSelector('#scr-open-first'); await page.click('#scr-open-first'); await page.waitForTimeout(700);
const pr = await page.evaluate(async () => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.at(-1); return { n: st.S.ws.assessment.SCEN.length, ref: s.ref, hash: location.hash, rat: s.params.PbA.rat }; });
ok(pr.n === before + 1 && /^P10/.test(pr.ref) && /#\/scenario\//.test(pr.hash) && /Analytical estimate — validation required/.test(pr.rat), 'Create the scenario adds the family to the register with the estimate marker');
// CSV export rows
const csv = await page.evaluate(async () => (await import('/js/screening.js')).csvRows().slice(0, 2));
ok(csv[0].includes('Total (/60)') && csv[0].includes('Weighted - Impact-led') && csv[1][0] === 'C01', 'screening CSV');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t25 screening');
