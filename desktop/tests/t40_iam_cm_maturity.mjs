// Identity & access management and Configuration management — maturity reuse: one filter chip per module showing exactly its keys,
// each module proposing only its own keys, the ladders, "Apply ticked" fills empty cells only.
import { open, ok, done, modulesOn, goto } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await goto(page, '#/maturity', 800);
ok(!(await page.isVisible('#mt-iam-chip')) && !(await page.isVisible('#mt-cm-chip')), 'no chip when the modules are off');
await modulesOn(page);
await goto(page, '#/process', 300); await goto(page, '#/maturity', 800);
const catsOf = () => page.$$eval('#panel-maturity table tbody tr b[data-noi18n]', b => b.map(x => x.textContent));
await page.check('#mt-iam-chip'); await page.waitForTimeout(400);
ok(JSON.stringify(await catsOf()) === '["PR.AA"]', 'IAM chip: PR.AA only');
await page.uncheck('#mt-iam-chip'); await page.waitForTimeout(300); await page.check('#mt-cm-chip'); await page.waitForTimeout(400);
ok(JSON.stringify(await catsOf()) === '["PR.PS"]', 'CM chip: PR.PS only');
await page.check('#mt-iam-chip'); await page.waitForTimeout(400);
const cats = await catsOf();
ok(JSON.stringify(cats) === '["PR.AA","PR.PS"]', 'both chips: PR.AA and PR.PS ' + cats);
await page.click('#panel-maturity [role=tab]:has-text("Resilience")'); await page.waitForTimeout(400);
ok(!(await page.isVisible('#mt-cm-chip')), 'Configuration management has no resilience question: no chip there');
await page.check('#mt-iam-chip'); await page.waitForTimeout(400);
const qs = await page.evaluate(async () => { const MT = await import('/js/maturity.js'); const shown = [...document.querySelectorAll('#panel-maturity .card select')].length; return { shown, ids: MT.ALL_QUESTIONS.filter(q => ['pv1', 'pv3', 'ct2', 'ct3'].includes(q.id)).length }; });
ok(qs.shown === 4 && qs.ids === 4, 'resilience filter: pv1, pv3, ct2, ct3 (' + qs.shown + ' questions shown)');
// SoA chip in Compliance → Frameworks & checklists
await goto(page, '#/compliance/assessment', 900);
const isoOf = () => page.$$eval('#panel-compliance table tbody tr b.mono', b => b.map(x => x.textContent));
await page.check('#soa-iam-chip'); await page.waitForTimeout(500);
ok(JSON.stringify(await isoOf()) === JSON.stringify(['5.15', '5.16', '5.17', '5.18', '8.2', '8.5']), 'SoA IAM chip (ISO/IEC 27002:2022): 5.15–5.18, 8.2, 8.5');
await page.check('#soa-cm-chip'); await page.waitForTimeout(500);
const iso = await isoOf();
ok(JSON.stringify(iso) === JSON.stringify(['5.15', '5.16', '5.17', '5.18', '8.2', '8.5', '8.9', '8.32']), 'SoA IAM + CM chips: ' + iso);
await page.uncheck('#soa-iam-chip'); await page.waitForTimeout(500);
ok(JSON.stringify(await isoOf()) === JSON.stringify(['8.9', '8.32']), 'SoA CM chip: 8.9, 8.32');
// ladders on MediBec
const pp = await page.evaluate(async () => { const I = await import('/js/iam.js'); const C = await import('/js/cm.js'); return { i: Object.fromEntries(I.prefill().map(x => [x.key, x.value])), c: Object.fromEntries(C.prefill().map(x => [x.key, x.value])) }; });
const p = { ...pp.i, ...pp.c };
ok(!('PR.PS' in pp.i) && !Object.keys(pp.i).some(k => /8\.9|8\.32|PR\.PS|CIS 4/.test(k)) && !('PR.AA' in pp.c) && !('pv1' in pp.c) && Object.keys(pp.c).every(k => ['PR.PS', 'ISO22:8.9', 'ISO22:8.32', 'CSF2:PR.PS-01', 'CIS81:CIS 4'].includes(k)),
  'each module proposes only its own keys ' + Object.keys(pp.i).length + ' + ' + Object.keys(pp.c).length);
ok(p.pv1 === 1 && p.pv3 === -1 && p['PR.AA'] === 1 && p['PR.PS'] === 1, 'MediBec ladders: pv1 1, pv3 unknown, PR.AA 1, PR.PS 1 ' + JSON.stringify(p).slice(0, 120));
ok(!('ct2' in p) && !('ct3' in p), 'ct2 and ct3 never proposed');
ok(p['ISO22:5.16'] === 'partial' && p['CIS81:CIS 6'] === 'partial' && p['ISO22:8.9'] === 'partial' && Object.keys(pp.i).filter(k => k.includes(':')).length === 11 && Object.keys(pp.c).filter(k => k.includes(':')).length === 4, 'SoA proposals: partial on the 11 + 4 keys');
// ladders on a strong organization
const strong = await page.evaluate(async () => { const st = await import('/js/state.js'); const I = await import('/js/iam.js');
  const w = st.newWorkspace(); const R = I.reg(w); R.settings.asOf = '2026-11-01';
  R.accounts.push({ ...I.blankRow('accounts'), id: 'a', type: 'employee', count: 10, ownerless: 0, mfa: 10, mfaPR: 10, dormant: 0, reconciled: '2026-10-20', evidence: 'E1' });
  R.privileged.push({ ...I.blankRow('privileged'), id: 'p', tier: 0, holders: 3, standing: 0, jit: 3, mfa: 3, mfaPR: 3, shared: 0, reviewed: '2026-10-01', evidence: 'E1' });
  R.reviews.push({ ...I.blankRow('reviews'), id: 'r', due: '2026-09-30', closed: '2026-09-28', decisionsDue: 10, decisionsDone: 10, revocationsRequested: 1, revocationsVerified: 1 });
  return Object.fromEntries(I.prefill(w).map(x => [x.key, x.value])); });
ok(strong.pv1 === 3 && strong.pv3 === 2 && strong['PR.AA'] === 3 && strong['ISO22:5.16'] === 'implemented', 'strong organization: pv1 3, pv3 2, PR.AA 3, 5.16 implemented ' + JSON.stringify(strong).slice(0, 160));
// Apply ticked fills empty cells only
await page.evaluate(async () => { const st = await import('/js/state.js'); const ws = st.S.ws; ws.maturity ||= {}; ws.maturity.answers = { pv1: 3 }; ws.maturity.scores = {}; ws.compliance.soa['ISO22:5.15'] = { status: 'implemented', evidence: 'mine' }; st.touch(); });
await goto(page, '#/iam/overview', 900);
await page.click('#iam-apply-prefill'); await page.waitForTimeout(500);
const after = await page.evaluate(async () => { const ws = (await import('/js/state.js')).S.ws; return { pv1: ws.maturity.answers.pv1, pv3: ws.maturity.answers.pv3, aa: ws.maturity.scores['PR.AA'], s15: ws.compliance.soa['ISO22:5.15'], s16: ws.compliance.soa['ISO22:5.16']?.status }; });
ok(after.pv1 === 3 && after.s15.status === 'implemented' && after.s15.evidence === 'mine', 'differing existing answers never overwritten');
ok(after.pv3 === -1 && after.aa === 1 && after.s16 === 'partial', 'empty cells filled ' + JSON.stringify(after).slice(0, 140));
const notCm = await page.evaluate(async () => { const ws = (await import('/js/state.js')).S.ws; return [ws.maturity.scores['PR.PS'] ?? null, ws.compliance.soa['ISO22:8.9']?.status || null]; });
ok(notCm[0] === null && notCm[1] === null, 'applying IAM proposals leaves the configuration keys to Configuration management ' + notCm);
await goto(page, '#/cm/overview', 900);
await page.click('#cm-apply-prefill'); await page.waitForTimeout(500);
const cmAfter = await page.evaluate(async () => { const ws = (await import('/js/state.js')).S.ws; return [ws.maturity.scores['PR.PS'], ws.compliance.soa['ISO22:8.9']?.status, ws.maturity.answers.pv1]; });
ok(cmAfter[0] === 1 && cmAfter[1] === 'partial' && cmAfter[2] === 3, 'CM fills PR.PS and 8.9; the IAM answers stay ' + cmAfter);
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t40 iam cm maturity');
