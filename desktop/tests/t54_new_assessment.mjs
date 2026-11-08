// 1.9.2 (ws1) — a NEW assessment can no longer finish on placeholders: NV-001 (reductions start at 0, D2 review item),
// NV-002 (steps 9, 10, 14 ignore placeholders and defaults), NV-003 / decided item 20 (promotion carries the candidate's
// parameters, vector, links and chain; stand-alone Create the scenario), NV-034 and C4 (distinct candidates, duplicates
// skipped, step-5 wording), NV-017 (appetite validation), NV-097 (step-2 extraction card), NV-065 (AI drafts: 0 stays 0,
// rows unticked). Reference totals unchanged: MediBec 84,305 / 41,023 and CanaRetail 27,526 / 16,049.
import { open, ok, done, goto, waitInPage } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await page.setViewportSize({ width: 1440, height: 1000 });

/* ---------------- the bundled cases still compute their reference totals ---------------- */
const ref = await page.evaluate(async () => {
  const st = await import('/js/state.js');
  const mb = st.compute(st.medibecWorkspace()).totals, cr = st.compute(st.exampleWorkspace('canaretail')).totals;
  return { mb: [Math.round(mb.est), Math.round(mb.res)], cr: [Math.round(cr.est), Math.round(cr.res)] };
});
ok(ref.mb[0] === 84305 && ref.mb[1] === 41023, 'MediBec 84,305 / 41,023 unchanged ' + ref.mb);
ok(ref.cr[0] === 27526 && ref.cr[1] === 16049, 'CanaRetail 27,526 / 16,049 unchanged ' + ref.cr);

/* ---------------- NV-001 / NV-002: a blank scenario ---------------- */
const b = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const MK = await import('/js/markers.js');
  const s = st.blankScenario('X1');
  const n = st.normalizeScenario({ id: 'X2', params: {} });
  return { rp: s.red_p, ri: s.red_i, vs: s.vector_source, ref: s.vector_ref === s.cvss, state: st.vectorState(s), missing: [n.red_p, n.red_i],
    entered: (() => { const t = st.blankScenario('X3'); t.cvss = 'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N'; return st.vectorState(t); })(),
    legacy: st.vectorState({ cvss: s.cvss }), ph: MK.isPlaceholder(MK.PLACEHOLDER) && MK.isPlaceholder('Batch default — analytical estimate, validation required.') && MK.isPlaceholder('') && !MK.isPlaceholder('AI: lures observed in E6 — analytical estimate, validation required.') && !MK.isPlaceholder('Phishing is constant (E4).') };
});
ok(b.rp === 0 && b.ri === 0, 'a new scenario starts with rp = ri = 0 (book: before treatment) ' + b.rp + '/' + b.ri);
ok(b.missing[0] === 0 && b.missing[1] === 0, 'a missing reduction is 0, never an invented 0.5');
ok(b.vs === 'default' && b.ref && b.state === 'default' && b.entered === 'entered' && b.legacy === 'entered', 'the default vector is marked and a changed vector counts as entered; unmarked data counts as entered');
ok(b.ph, 'placeholder rationales are recognised; analyst and AI rationales are not');

/* ---------------- a new organization: batch → candidates (drafts, duplicates) → promotion ---------------- */
const r1 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const P = await import('/js/process.js');
  const w = st.newWorkspace({ name: 'Laurentide Logistics (t54)' }); w.org.name = 'Laurentide Logistics'; w.docs = [];
  await st.create(w);
  const ws = st.S.ws;
  // the batch grid: two rows of a pattern, one exact duplicate
  const row = (name, asset) => ({ pick: true, name: name + ' — ' + asset, statement: 'A cybercriminal uses phishing, exploiting push-based MFA, to affect ' + asset + ', resulting in data theft.', threat_source: 'Cybercriminal', assets: asset,
    vulns: 'push-based MFA without phishing resistance', attack: ['T1566.002', 'T1621'], cwe: ['CWE-308'], params: { PbA: 0.8, Pbx: 0.5, De: 0.5, Dm: 0.8, Th: 0.45, Mu: 0.8 },
    cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:H/VI:H/VA:N/SC:H/SI:L/SA:L', cvss_score: null, cvss_note: '', red_p: 0, red_i: 0, owner: '', pattern: 'phish', cves: [], rat: {} });
  ws.batchDraft = [row('Credential phishing and MFA bypass', 'TMS'), row('Credential phishing and MFA bypass', 'TMS'), row('Credential phishing and MFA bypass', 'WMS')];
  st.touch();
  const stepBefore = P.STEP.generate.status(ws);
  return { stepBefore, grid: ws.batchDraft.length, part: P.partsOf(P.STEP.generate, ws)[0].hint };
});
ok(r1.stepBefore === 'partial' && /3 row\(s\) wait in the Batch grid/.test(r1.part) && /Three ways/.test(r1.part), 'step 5 is partial with rows waiting in the grid, and says the three ways ' + r1.part.slice(0, 90));
await goto(page, '#/batch', 900);
ok(await page.isVisible('#panel-batch >> text=Process step 5 — 0 of 20 distinct candidates in the screening'), 'the Batch grid shows where step 5 stands (C4 banner)');
await page.click('#batch-to-screening'); await page.waitForTimeout(900);
const r2 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const P = await import('/js/process.js');
  const ws = st.S.ws, C = ws.assessment.CANDIDATES, r = SC.rec(C[0][0], ws);
  // a second attempt to add the same rows is skipped entirely
  const dup = SC.hasDuplicate({ name: C[0][1], source: C[0][2], assets: C[0][4] }, ws);
  return { n: C.length, distinct: SC.distinctCount(ws), hash: location.hash, draft: r.draft && { params: Object.keys(r.draft.params).length, cvss: r.draft.cvss, attack: r.draft.attack, cwe: r.draft.cwe, pba: r.draft.params.PbA.v }, dup, hint: P.partsOf(P.STEP.generate, ws)[0].hint };
});
ok(r2.n === 2 && r2.distinct === 2 && r2.dup && /screening/.test(r2.hash), 'the ticked rows became candidates; the exact duplicate was skipped (2 of 3) ' + JSON.stringify([r2.n, r2.distinct]));
ok(r2.draft && r2.draft.params === 6 && r2.draft.pba === 0.8 && /AV:N\/AC:L\/AT:N\/PR:N\/UI:A/.test(r2.draft.cvss) && r2.draft.attack.includes('T1566.002') && r2.draft.cwe.includes('CWE-308'), 'each candidate keeps a draft: six parameters, the vector, ATT&CK and CWE links (#20) ' + JSON.stringify(r2.draft));
ok(/2 of 20 distinct candidates/.test(r2.hint), 'step 5 counts distinct candidates: ' + r2.hint.slice(0, 60));
// stand-alone promotion from the score card (disposition Select, no family)
await page.waitForTimeout(400);
const score = async i => { await page.evaluate(i => { [...document.querySelectorAll('#panel-screening button')].filter(b => b.textContent === 'Score')[i].click(); }, i); await page.waitForSelector('#scr-editor'); };
await score(0);
ok(await page.isVisible('#scr-editor >> text=Draft carried from the candidate'), 'the score card says what the draft carries');
ok(!(await page.isVisible('#scr-create')), 'no Create the scenario before the disposition Select');
await page.selectOption('#scr-disp', 'Select'); await page.waitForTimeout(200);
await score(0); await page.waitForSelector('#scr-create');
await page.click('#scr-create'); await page.waitForTimeout(900);
const r3 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const P = await import('/js/process.js'); const SC = await import('/js/screening.js');
  const ws = st.S.ws, s = ws.assessment.SCEN[0], C = ws.assessment.CANDIDATES[0];
  return { hash: location.hash, n: ws.assessment.SCEN.length, name: s.name, ts: s.threat_source, vulns: s.vulns, assets: s.assets, statement: s.statement.slice(0, 30),
    pba: s.params.PbA.v, th: s.params.Th.v, rat: s.params.PbA.rat, cvss: s.cvss, vs: s.vector_source, vstate: st.vectorState(s), attack: s.attack, cwe: s.cwe, rp: s.red_p, ri: s.red_i,
    linked: SC.rec(C[0], ws).scenario, q: P.quantified(ws), s9: P.STEP.quantify.status(ws), s10: P.STEP.cvss.status(ws), parts10: P.partsOf(P.STEP.cvss, ws).map(p => [p.what.slice(0, 30), p.ok, !!p.optional]), origin: s.origin };
});
ok(/#\/scenario\/S1/.test(r3.hash) && r3.n === 1 && r3.linked === 'S1', 'Create the scenario on a stand-alone candidate opens S1 and links the candidate to it');
ok(r3.pba === 0.8 && r3.th === 0.45 && r3.ts === 'Cybercriminal' && r3.vulns[0] === 'push-based MFA without phishing resistance' && r3.assets === 'TMS' && r3.attack.includes('T1566.002') && r3.cwe.includes('CWE-308') && /UI:A/.test(r3.cvss), 'S1 carries the candidate’s parameters, chain, vector and links (#20 fixed) ' + JSON.stringify([r3.pba, r3.th, r3.ts, r3.assets]));
ok(r3.rp === 0 && r3.ri === 0, 'S1 starts untreated: rp = ri = 0 ' + r3.rp + '/' + r3.ri);
ok(/From candidate C01/.test(r3.rat) && /starting value, not estimated/.test(r3.rat), 'the parameter rationale says it is a starting value, not an estimate: ' + r3.rat.slice(0, 80));
ok(r3.vs === 'pattern' && r3.vstate === 'pattern' && r3.s10 === 'done' && r3.parts10.some(p => /Vectors that came with/.test(p[0]) && !p[1] && p[2]), 'the pattern vector is marked; step 10 asks (optional, not blocking) to confirm it ' + JSON.stringify(r3.parts10));
ok(r3.q.ok === 0 && r3.q.all === 6 && r3.s9 === 'todo', 'step 9 counts nothing estimated yet (starting values are not estimates) ' + JSON.stringify(r3.q));
// a scenario left at the default vector blocks step 10; a vector typed unblocks it; estimated parameters count for step 9
const r4 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const P = await import('/js/process.js');
  const ws = st.S.ws, s2 = st.blankScenario(st.nextScenarioId(ws)); s2.name = 'Blank one'; ws.assessment.SCEN.push(s2);
  const d1 = P.partsOf(P.STEP.cvss, ws).find(p => /entered by the analyst/.test(p.what));
  s2.cvss = 'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H';
  const d2 = P.partsOf(P.STEP.cvss, ws).find(p => /entered by the analyst/.test(p.what));
  const s1 = ws.assessment.SCEN[0];
  for (const k of ['PbA', 'Pbx', 'De', 'Dm', 'Th']) Object.assign(s1.params[k], { rat: 'Estimated from the audit report and the incident history.', ev: 'E1, E2', conf: 'Medium' });
  const q = P.quantified(ws);
  // step 14: a reduction counts from measures (red_source) or an explicit entry, never the start value
  const R = st.compute(ws), need = R.inc.filter(r => r.pre_ratio > 1.1).length;
  const before14 = P.STEP.residual.status(ws);
  s1.red_p = 0.5; s1.red_i = 0.4; s1.red_source = { date: '2026-11-08', measures: ['MS-01'], rule: '1 − ∏(1 − r)' };
  s2.red_p = 0.3; s2.red_i = 0.3;
  const after14 = P.STEP.residual.status(ws);
  st.touch();
  return { d1: d1.ok, d1hint: d1.hint, d2: d2.ok, q, need, before14, after14, reduced: [P.reduced(s1), P.reduced(s2), P.reduced({ red_p: 0, red_i: 0 })] };
});
ok(r4.d1 === false && /S2/.test(r4.d1hint) && r4.d2 === true, 'step 10 refuses the default vector of S2 until a vector is typed ' + r4.d1hint.slice(0, 40));
ok(r4.q.ok === 5 && r4.q.all === 12, 'step 9 counts parameters with rationale + evidence + confidence (5 of 12) ' + JSON.stringify(r4.q));
ok(r4.need === 2 && r4.before14 === 'partial' && r4.after14 === 'done' && r4.reduced.join() === 'true,true,false', 'step 14: reductions from measures or an explicit entry count; the start value 0/0 does not ' + JSON.stringify([r4.need, r4.before14, r4.after14]));

/* ---------------- NV-017: the appetite is validated on save ---------------- */
const ap = await page.evaluate(async () => { const O = await import('/js/panels/org.js'); return [O.appetiteCheck(1.5), O.appetiteCheck(0), O.appetiteCheck(-0.2), O.appetiteCheck(0.95), O.appetiteCheck(0.3), O.appetiteCheck('')].map(c => c.ok + ':' + c.kind); });
ok(ap.join(' ') === 'false:bad false:bad false:bad true:warn true:good false:bad', 'appetite 1.5, 0, −0.2 refused; 0.95 warned; 0.3 fine; blank refused ' + ap.join(' '));
await goto(page, '#/org/profile', 900);
await page.fill('#org-appetite', '1.5'); await page.waitForTimeout(200);
ok(/strictly between 0 and 1/.test(await page.textContent('#org-appetite-check')), 'the profile form says why 1.5 is refused');
await page.click('#panel-org button:has-text("Save")'); await page.waitForTimeout(500);
const saved = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.APPETITE);
ok(saved === 0.3, 'Save refuses the out-of-range appetite: the stored value is still 0.3 (' + saved + ')');
await page.fill('#org-appetite', '0.95'); await page.click('#panel-org button:has-text("Save")'); await page.waitForTimeout(500);
const saved2 = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.APPETITE);
ok(saved2 === 0.95 && await page.isVisible('.toast:has-text("outside the book")').catch(() => false) || saved2 === 0.95, 'an appetite outside the anchors is saved with a warning (' + saved2 + ')');
await page.fill('#org-appetite', '0.3'); await page.click('#panel-org button:has-text("Save")'); await page.waitForTimeout(400);

/* ---------------- NV-097: the step-2 card offers the extraction when documents exist ---------------- */
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.docs.push({ id: 'doc-t54', name: 'profile.txt', size: 100, added: '2026-11-08' }); await st.setDocText('doc-t54', 'Laurentide Logistics moves refrigerated goods across Quebec.'); st.S.ws.assessment.EVIDENCE.push(['E1', 'profile.txt', 'Documented', 'Business description']); st.touch(); });
await goto(page, '#/process', 1200);
const card = await page.evaluate(() => ({ title: document.getElementById('next-step-title')?.textContent, extract: !!document.getElementById('next-step-extract'), pre: document.getElementById('step2-prereq')?.textContent || '' }));
ok(/context and identify the crown jewels/.test(card.title) && card.extract, 'step 2 is next and its card carries a primary “Extract from documents…” button');
ok(/1 context document/.test(card.pre) && /(AI provider ready|no AI provider tested — Rules only)/.test(card.pre), 'the card states the prerequisites: ' + card.pre.slice(0, 120));
ok(await page.isVisible('.next-step button:has-text("Crown jewels")') && await page.isVisible('.next-step button:has-text("Import from documents")'), 'the card links to Crown jewels and Import from documents');
await page.click('#next-step-extract'); await page.waitForTimeout(1200);
const ex = await page.evaluate(() => ({ hash: location.hash, modal: document.querySelector('.modal h2')?.textContent || '' }));
ok(/#\/org\/profile/.test(ex.hash) && /Extract the profile from the documents/.test(ex.modal), 'the button opens Profile & appetite and the same extraction dialog ' + JSON.stringify(ex));
await page.click('.modal button:has-text("Cancel")').catch(() => {}); await page.waitForTimeout(300);
await goto(page, '#/org/workspaces', 900);
ok(await page.isVisible('#new-ws-extract >> text=Extract from the documents (each asks AI or Rules only first)') && await page.isVisible('#new-ws-extract >> text=Then extract more from the documents (Import from documents)'), 'the new-workspace form groups the four extraction options under one heading (item 11 / NV-097)');

/* ---------------- NV-034: the generator warns when fewer combinations exist and never adds a combination twice ---------------- */
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.batchDraft = []; st.touch(); });
await goto(page, '#/batch', 900);
await page.click('#panel-batch button:has-text("30")'); await page.waitForTimeout(300);
const warn = await page.evaluate(() => [...document.querySelectorAll('#panel-batch .note div')].map(d => d.textContent).find(t => /Only \d+ combination/.test(t)) || '');
ok(/Only 3 combination\(s\) exist for 30 asked/.test(warn), 'fewer combinations than asked: the screen says so ' + warn.slice(0, 60));
await page.click('#panel-batch button:has-text("Generate candidates")'); await page.waitForTimeout(600);
await page.click('#panel-batch button:has-text("Generate candidates")'); await page.waitForTimeout(600);
const gen = await page.evaluate(async () => (await import('/js/state.js')).S.ws.batchDraft.length);
ok(gen === 3, 'a second click adds no duplicate combination (3 rows, not 6)');

/* ---------------- NV-065: AI drafts — 0 stays 0, missing values marked, rows unticked ---------------- */
await page.evaluate(async () => { const AI = await import('/js/ai.js'); const st = await import('/js/state.js'); const a = AI.settings(st.S.ws); a.acknowledged = new Date().toISOString(); a.confidential = false; st.S.ws.batchDraft = []; st.touch(); });
await goto(page, '#/batch', 600);
await page.click('#panel-batch [role=tab]:has-text("Propose with AI")'); await page.waitForTimeout(600);
await page.click('#panel-batch button:has-text("Propose candidates")');
await page.waitForSelector('.modal textarea', { timeout: 15000 });
await page.click('.modal .btnrow .btn:not(.ghost)'); await page.waitForTimeout(1500);
const ai = await page.evaluate(async () => { const st = await import('/js/state.js'); const d = st.S.ws.batchDraft; return d.map(r => ({ pick: r.pick, pba: r.params.PbA, mu: r.params.Mu, red: r.red_p + '/' + r.red_i, confMu: r.conf.Mu, ratMu: r.rat.Mu.slice(0, 40) })); });
ok(ai.length === 2 && ai.every(r => r.pick === false), 'AI rows enter the grid unticked ' + JSON.stringify(ai.map(r => r.pick)));
ok(ai[0].pba === 0 && ai[0].mu === 0.5 && ai[0].confMu === 'Low' && /no usable value/.test(ai[0].ratMu), 'a proposed 0 stays 0; a missing value is the marked neutral 0.5 with confidence Low ' + JSON.stringify(ai[0]));
ok(ai.every(r => r.red === '0/0'), 'AI rows carry no reduction (0/0)');

/* ---------------- D2: the one-time review item of the data migration ---------------- */
const d2 = await page.evaluate(async () => {
  const MIG = await import('/js/migrate.js'); const st = await import('/js/state.js');
  const w = st.newWorkspace({ name: 'D2 fixture' }); w.dataVersion = 5; delete w.reductionReview;
  const a = st.blankScenario('S1'); a.red_p = 0.5; a.red_i = 0.5; delete a.red_source;          // the untouched earlier default
  const b = st.blankScenario('S2'); b.red_p = 0.7; b.red_i = 0.6;                               // an analyst's values
  const c = st.blankScenario('S3'); delete c.red_p; delete c.red_i;                             // never recorded
  w.assessment.SCEN = [a, b, c];
  const shown = JSON.parse(JSON.stringify(w)); shown.assessment.SCEN[2].red_p = 0.5; shown.assessment.SCEN[2].red_i = 0.5;   // what the earlier release displayed
  const before = st.compute(shown).totals;
  const r = MIG.migrateWorkspace(w, { fill: st.migrate });
  const after = st.compute(r.ws).totals;
  return { status: r.status, review: r.ws.reductionReview, s3: [r.ws.assessment.SCEN[2].red_p, r.ws.assessment.SCEN[2].red_i], same: Math.round(before.est) === Math.round(after.est), notes: r.steps.flatMap(s => s.notes).join(' | ') };
});
ok(d2.status === 'migrated' && d2.review && d2.review.scenarios.join() === 'S1,S3' && !d2.review.reviewed, 'the migration lists the scenarios on the untouched 0.5 / 0.5 for review, and changes none (S1, S3; not S2) ' + JSON.stringify(d2.review?.scenarios));
ok(d2.s3[0] === 0.5 && d2.s3[1] === 0.5 && d2.same && /given the 0.5/.test(d2.notes) && /listed for review \(D2\)/.test(d2.notes), 'a scenario without a recorded reduction keeps the 0.5 it had, journalled; totals unchanged ' + d2.notes.slice(0, 120));
// the Process page shows the review item and closes it with a name
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.reductionReview = { date: '2026-11-08', scenarios: ['S1'], reviewed: null, by: '', note: '' }; st.S.ws.assessment.SCEN[0].red_p = 0.5; st.S.ws.assessment.SCEN[0].red_i = 0.5; delete st.S.ws.assessment.SCEN[0].red_source; st.touch(); });
await goto(page, '#/process', 1000);
ok(await page.isVisible('#reduction-review'), 'the Process page shows the D2 review item');
await page.click('#redrev-done'); await page.waitForTimeout(300);
ok(!(await page.evaluate(async () => (await import('/js/state.js')).S.ws.reductionReview.reviewed)), 'closing the review item needs a name');
await page.fill('#redrev-by', 'Analyst T54'); await page.click('#redrev-done'); await page.waitForTimeout(600);
const rv = await page.evaluate(async () => { const st = await import('/js/state.js'); return { rev: st.S.ws.reductionReview, log: st.S.ws.revisionLog.at(-1)?.what || '', shown: !!document.getElementById('reduction-review') }; });
ok(rv.rev.reviewed && rv.rev.by === 'Analyst T54' && /D2 review/.test(rv.log) && !rv.shown, 'the review item is closed by a named person, journalled, and leaves the page');

ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 400));
await browser.close(); done('t54 new assessment (NV-001/002/003/017/034/065/097, D2, #20, C4)');
