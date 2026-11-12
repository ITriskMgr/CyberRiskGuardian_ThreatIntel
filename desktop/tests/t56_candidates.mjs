// 1.9.2 (ws1) — the candidate items: C1 (register scenarios as candidates), C2 (remove a candidate: confirmation, audit log,
// refused for a member of a selected family), decided item 7 / C3 / NV-022 (consultant proposals become screening rows with
// their draft, logged pending; stored object candidates converted at load), C5 (AI proposes the twelve scores for review:
// EV cap, flags only added, marked cards, log entry) and the family promotion carrying its best member's draft (#20).
import { open, ok, done, goto, medibec } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await medibec(page);
const candidates = async (stage = 'screen') => { await goto(page, '#/process', 300); await goto(page, '#/screening/' + stage, 900); };   // 1.9.3: scoring and the AI buttons are in ② Screen, the register button in ① Candidates

/* ---------------- C1: the register's scenarios as candidates ---------------- */
const c1 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js');
  const ws = st.S.ws;
  // MediBec's ten families already link 22 of the 30 register scenarios (Final portfolio → "In the register"): the other eight are offered
  const offered = SC.registerNotCandidates(ws).map(s => s.id);
  ws.assessment.CANDIDATES[0][6] = offered[0];                      // a row naming a scenario as its ref excludes it too
  const offered2 = SC.registerNotCandidates(ws).map(s => s.id);
  const ids = SC.addFromRegister(ws, offered2.slice(0, 2));
  const row = ws.assessment.CANDIDATES.find(r => r[0] === ids[0]);
  const rec = SC.rec(ids[0], ws);
  const after = SC.registerNotCandidates(ws).map(s => s.id);
  st.touch();
  return { offered: offered.length, offered2: offered2.length, first: offered[0], ids, row: { name: row[1], source: row[2], ref: row[6], status: row[7] }, link: rec.scenario, after: after.length, n: ws.assessment.CANDIDATES.length, want: offered2[0] };
});
ok(c1.offered === 8 && c1.offered2 === 7, 'the register scenarios not yet linked to a candidate or a family are offered (8; 7 once a row names ' + c1.first + ' as its ref)');
ok(c1.ids.length === 2 && c1.row.ref === c1.want && c1.row.status === 'In the register' && c1.link === c1.want && c1.row.name.length > 5 && c1.after === 5 && c1.n === 47, 'two register scenarios became candidates, linked to their scenario; the register itself is untouched ' + JSON.stringify(c1.row));
await candidates('candidates');
ok(await page.isVisible('#scr-from-register') && /\(5\)/.test(await page.textContent('#scr-from-register')), '① Candidates has the button “Add scenarios from the register as candidates (5)”');
// the tick list: untick one, add the rest
await page.click('#scr-from-register'); await page.waitForSelector('#reg-add');
const nPicks = await page.$$eval('.modal .reg-pick', cbs => cbs.length);
await page.evaluate(() => { const cb = document.querySelector('.modal .reg-pick'); cb.checked = false; cb.dispatchEvent(new Event('change')); });
await page.click('#reg-add'); await page.waitForTimeout(500);
const c1b = await page.evaluate(async () => { const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const LOG = await import('/js/logs.js'); return { left: SC.registerNotCandidates(st.S.ws).length, n: st.S.ws.assessment.CANDIDATES.length, logged: JSON.stringify(LOG.entries('data')).includes('candidates added from the register') }; });
ok(nPicks === 5 && c1b.left === 1 && c1b.n === 51 && c1b.logged, 'the tick list adds the ticked scenarios (4 of 5) with an audit entry ' + JSON.stringify(c1b));

/* ---------------- C2: remove a candidate ---------------- */
const c2 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js');
  const ws = st.S.ws, st2 = SC.state(ws);
  const sel = st2.families.find(f => f.selected), member = sel.members[0];
  const block = SC.removeBlock(member, ws), rm1 = SC.removeCandidate(member, ws);
  const id = SC.addCandidate({ name: 'To remove', source: 'x', assets: 'y' }, ws); SC.rec(id, ws).scores[0] = 3; st2.watch.push({ id, trigger: '', owner: '' });
  const nBefore = ws.assessment.CANDIDATES.length;
  const rm2 = SC.removeCandidate(id, ws);
  st.touch();
  return { block, rm1, still: ws.assessment.CANDIDATES.some(r => r[0] === member), rm2, gone: !ws.assessment.CANDIDATES.some(r => r[0] === id) && !st2.cands[id] && !st2.watch.some(w => w.id === id), n: ws.assessment.CANDIDATES.length, nBefore, id };
});
ok(/member of P\d\d, a family selected/.test(c2.block) && c2.rm1 === false && c2.still, 'a member of a selected family cannot be removed: ' + c2.block);
ok(c2.rm2 === true && c2.gone && c2.n === c2.nBefore - 1, 'another candidate is removed with its score card and watch entry');
// through the screen: confirmation and audit entry
const newId = await page.evaluate(async () => { const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const id = SC.addCandidate({ name: 'UI removal', source: 'x', assets: 'y' }, st.S.ws); st.touch(); return id; });
await candidates();
let confirmText = '';
page.once('dialog', d => { confirmText = d.message(); d.accept(); });
// the row's own × button (Candidates & scores), with its confirmation
await page.evaluate(id => { const row = [...document.querySelectorAll('#panel-screening tbody tr')].find(tr => tr.textContent.startsWith(id)); row.querySelector('button.danger').click(); }, newId);
await page.waitForTimeout(600);
const c2b = await page.evaluate(async id => { const st = await import('/js/state.js'); const LOG = await import('/js/logs.js'); const entries = LOG.entries('data'); return { gone: !st.S.ws.assessment.CANDIDATES.some(r => r[0] === id), logged: JSON.stringify(entries).includes('candidate removed') }; }, newId);
ok(/Remove candidate C\d+ — UI removal\?/.test(confirmText) && c2b.gone && c2b.logged, 'the row’s Remove asks for confirmation naming the candidate, removes it and writes the data log (who, when, id, name): ' + confirmText.slice(0, 60));
const c2c = await page.evaluate(async () => { const LOG = await import('/js/logs.js'); const e = LOG.entries('data').find(x => x.action === 'candidate removed'); return e && /UI removal — by /.test(e.detail || '') && !!e.t; });
ok(c2c, 'the audit entry carries who and when');

/* ---------------- C3 / item 7: consultant proposals → screening rows with their draft ---------------- */
const c3 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const CONS = await import('/js/consult.js'); const AI = await import('/js/ai.js'); const SC = await import('/js/screening.js'); const P = await import('/js/process.js');
  const ws = st.S.ws, before = ws.assessment.CANDIDATES.length;
  const entry = AI.record({ task: 'consultant', model: 'mock', bytes: 1, decision: 'pending' }, ws);
  const n = CONS.toCandidates([{ name: 'Vendor remote access compromise', statement: 'A threat actor…', threat_source: 'Organised crime', vulnerability: 'Password-only vendor VPN', asset: 'TMS',
    params: { PbA: { v: 0.6, why: 'vendor VPN has no MFA', conf: 'Medium' }, Pbx: { v: 0.5 }, Dm: { v: 0.9, why: 'full access' } }, attack: ['T1133', 'bad'] }], { model: 'mock', entryId: entry.id }, ws);
  const row = ws.assessment.CANDIDATES.at(-1), rec = SC.rec(row[0], ws);
  const dup = CONS.toCandidates([{ name: 'Vendor remote access compromise', threat_source: 'Organised crime', asset: 'TMS' }], { model: 'mock' }, ws);
  return { n, dup, isArray: Array.isArray(row), row: { name: row[1], source: row[2], vuln: row[3], assets: row[4], ref: row[6], note: row[8].slice(0, 50) }, strategy: rec.strategy, draft: { pba: rec.draft.params.PbA, attack: rec.draft.attack, origin: rec.draft.origin },
    decision: AI.log(ws).find(e => e.id === entry.id).decision, step5: P.STEP.generate.status(ws), after: ws.assessment.CANDIDATES.length - before, shows: SC.candidates(ws).at(-1).name };
});
ok(c3.n === 1 && c3.isArray && c3.row.name === 'Vendor remote access compromise' && c3.row.source === 'Organised crime' && c3.row.assets === 'TMS' && c3.row.ref === 'consultant' && /Analytical estimate/.test(c3.row.note), 'consultant proposals are stored as the array rows the screening reads (item 7) ' + JSON.stringify(c3.row));
ok(c3.draft.pba.v === 0.6 && /^AI: vendor VPN/.test(c3.draft.pba.rat) && c3.draft.pba.conf === 'Medium' && c3.draft.attack.join() === 'T1133' && c3.draft.origin === 'ai' && c3.strategy.join() === 'TD', 'the proposal is kept as the candidate’s draft (parameters with AI rationale, valid techniques only) ' + JSON.stringify(c3.draft));
ok(c3.decision === 'pending' && c3.dup === 0 && c3.after === 1 && c3.shows === 'Vendor remote access compromise', 'the AI log entry stays pending (sent for review, not accepted); a duplicate proposal is not added twice');
// stored object candidates (the 1.9.1 shape) are converted at load, their proposal kept
const mig = await page.evaluate(async () => {
  const MIG = await import('/js/migrate.js'); const st = await import('/js/state.js'); const SC = await import('/js/screening.js');
  const w = st.newWorkspace({ name: 'C3 fixture' }); w.dataVersion = 5; delete w.reductionReview;
  w.assessment.CANDIDATES = [['C01', 'Row one', 'src', 'vuln', 'asset', 'cons', '', 'Candidate', ''],
    { id: 'CAND-1', name: 'Object one', statement: 'A threat actor…', threat_source: 'Organised crime', vulnerability: 'Password-only VPN', asset: 'TMS', params: { PbA: { v: 0.8, why: 'w', conf: 'Low' } }, attack: ['T1133'], source: 'ai', model: 'mock', generated: '2026-11-08', reviewed: false, note: 'Analytical estimate — validation required.' }];
  const r = MIG.migrateWorkspace(w, { fill: st.migrate });
  const C = r.ws.assessment.CANDIDATES, list = SC.candidates(r.ws), rec = r.ws.screening.cands[C[1][0]];
  return { status: r.status, all: C.every(Array.isArray), ids: C.map(c => c[0]), name: list[1].name, source: list[1].source, draft: rec?.draft && { pba: rec.draft.params.PbA.v, attack: rec.draft.attack, model: rec.draft.model }, note: r.steps.flatMap(s => s.notes).find(n => /converted to screening rows/.test(n)) || '' };
});
ok(mig.status === 'migrated' && mig.all && mig.ids.join() === 'C01,C02' && mig.name === 'Object one' && mig.source === 'Organised crime', 'a stored object candidate becomes row C02 at load, visible in the screening ' + JSON.stringify(mig.ids));
ok(mig.draft && mig.draft.pba === 0.8 && mig.draft.attack.join() === 'T1133' && mig.draft.model === 'mock' && /1 consultant candidate\(s\)/.test(mig.note), 'its proposal is kept as the draft and the conversion is journalled: ' + mig.note.slice(0, 80));

/* ---------------- #20: a family takes its best member's draft ---------------- */
const fam = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js');
  const ws = st.S.ws;
  const a = SC.addCandidate({ name: 'Variant A', source: 'Cybercriminal', assets: 'EHR', draft: { params: { PbA: { v: 0.3 } }, cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:H/VI:H/VA:N/SC:H/SI:L/SA:L', attack: ['T1566.002'], cwe: [], cves: [], vulns: ['weak MFA'], red_p: 0, red_i: 0 } }, ws);
  const b = SC.addCandidate({ name: 'Variant B', source: 'Cybercriminal', assets: 'EHR and billing', draft: { params: { PbA: { v: 0.9, rat: 'Lures observed (E6).', ev: 'E6', conf: 'High' } }, cvss: 'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H', attack: ['T1566.001'], cwe: ['CWE-269'], cves: [], vulns: ['macros'], red_p: 0, red_i: 0 } }, ws);
  SC.rec(a, ws).scores = Array(12).fill(2); SC.rec(b, ws).scores = Array(12).fill(4);
  const f = { id: SC.nextFamilyId(ws), name: 'Phishing family', statement: 'Consolidated statement', members: [a, b], selected: true, rationale: 'r', judgment: '', coverage: [], scenarios: [] };
  SC.state(ws).families.push(f);
  const best = SC.bestMember(f, ws);
  const s = SC.scenarioFromCandidate(best, ws, { family: f });
  return { best: best.id === b, name: s.name, statement: s.statement, assets: s.assets, pba: s.params.PbA.v, rat: s.params.PbA.rat, conf: s.params.PbA.conf, ev: s.params.PbA.ev, pbx: s.params.Pbx.rat, cvss: s.cvss, vs: s.vector_source, attack: s.attack, cwe: s.cwe, vulns: s.vulns, ref: s.ref };
});
ok(fam.best && fam.name === 'Phishing family' && fam.statement === 'Consolidated statement' && /^P\d\d \(C\d+, C\d+\)$/.test(fam.ref), 'a family’s scenario takes the consolidated statement and starts from its best-scored member');
ok(fam.pba === 0.9 && fam.rat === 'Lures observed (E6).' && fam.conf === 'High' && fam.ev === 'E6' && /to estimate \(Process step 9\)/.test(fam.pbx), 'the member’s estimated parameter travels with its rationale, evidence and confidence; the others keep the placeholder');
ok(/AV:L/.test(fam.cvss) && fam.vs === 'pattern' && fam.attack.sort().join() === 'T1566.001,T1566.002' && fam.cwe.join() === 'CWE-269' && fam.vulns.join() === 'macros' && /EHR and billing; EHR|EHR; EHR and billing/.test(fam.assets || ''), 'vector (marked pattern) from the best member; techniques, weaknesses and assets combined across the members ' + JSON.stringify([fam.attack, fam.assets]));

/* ---------------- C5: scores proposed by AI, for review ---------------- */
await page.evaluate(async () => { const AI = await import('/js/ai.js'); const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const a = AI.settings(st.S.ws); a.acknowledged = new Date().toISOString(); a.confidential = false;
  const r = SC.rec('C01', st.S.ws); r.flags = ['S']; r.scores = Array(12).fill(null); r.rat = ''; delete r.ai; st.touch(); });
await candidates();
ok(/Estimate all unscored with AI \(\d+\)/.test(await page.textContent('#scr-ai')), '① Candidates has “Estimate all unscored with AI (n)”');
await page.click('#scr-ai');
await page.waitForSelector('.modal textarea', { timeout: 15000 });
const payload = await page.$eval('.modal textarea >> nth=1', t => t.value);
ok(/TASK: screening_scores/.test(payload) && /Evidence register \(cite these IDs/.test(payload) && /E6 — /.test(payload) && /Crown jewels:/.test(payload) && /Threat-context snapshot|No threat-context snapshot/.test(payload) && /C01 \| Phishing-led compromise/.test(payload) && !/PbA=/.test(payload), 'the payload carries the chains, the profile, the crown jewels, the evidence register and the snapshot summary, and no risk parameter');
ok(!/C37 \|/.test(payload), 'only the unscored candidates are sent (C37, already scored, is not)');
await page.click('.modal .btnrow .btn:not(.ghost)');
await page.waitForSelector('#sai-apply', { timeout: 15000 });
const review = await page.evaluate(() => ({ rows: document.querySelectorAll('.modal .sai-card').length, selects: document.querySelectorAll('.modal .sai-score').length, cited: [...document.querySelectorAll('.modal .sai-card')].map(tr => tr.textContent).some(t => /E4, E6/.test(t)) }));
ok(review.rows === 1 && review.selects === 12 && review.cited, 'the review panel shows the one known unscored candidate (C99 dropped), editable criterion by criterion, with the evidence it cites');
// edit one criterion before accepting; acceptance needs a name
await page.evaluate(() => { const s = [...document.querySelectorAll('.modal .sai-score')][0]; s.value = '4'; s.dispatchEvent(new Event('change')); });
await page.fill('#sai-by', ''); await page.click('#sai-apply'); await page.waitForTimeout(300);
ok(await page.isVisible('.modal >> text=Name required'), 'acceptance without a name is refused');
await page.fill('#sai-by', 'Reviewer T56'); await page.click('#sai-apply'); await page.waitForTimeout(800);
const c5 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const AI = await import('/js/ai.js');
  const ws = st.S.ws, r1 = SC.rec('C01', ws);
  return { s1: r1.scores, ev: r1.scores[8], flags: r1.flags, rat: r1.rat.slice(0, 20), ai: r1.ai && { model: r1.ai.model, by: r1.ai.by, cited: r1.ai.cited }, total: SC.total(r1), log: AI.log(ws)[0].task + ':' + AI.log(ws)[0].decision, csv: SC.csvRows(ws).find(row => row[0] === 'C01').at(-1) };
});
ok(c5.s1[0] === 4 && c5.ev === 5 && c5.total === 52 && c5.ai?.cited?.join() === 'E4,E6', 'the edited criterion is kept (BC 4); EV 5 stands because the rationale cites E4 and E6; total 52 ' + JSON.stringify(c5.s1));
ok(c5.flags.includes('S') && c5.flags.includes('PV') && c5.flags.includes('ES'), 'flags are only added: the analyst\u2019s S stays, PV and ES join ' + c5.flags.join(' '));
ok(/^AI: Mock answer/.test(c5.rat) && c5.ai.model === 'mock-model' && c5.ai.by === 'Reviewer T56' && c5.log === 'screening_scores:accepted' && /^AI-proposed, accepted by Reviewer T56 on \d{4}-\d\d-\d\d/.test(c5.csv), 'the accepted card is marked “AI-proposed, accepted by ‹name› on ‹date›”, in the CSV too; the AI log entry accepted ' + c5.csv);
await page.evaluate(() => { [...document.querySelectorAll('#panel-screening tbody tr')].find(tr => tr.textContent.startsWith('C01')).querySelector('button').click(); }); await page.waitForTimeout(400);
ok(await page.isVisible('#scr-editor >> text=AI-proposed, accepted by Reviewer T56'), 'the score card shows the acceptance mark');
ok(await page.isVisible('#scr-ai-one'), 'the score card has “Estimate with AI”');
// a candidate the analyst scored: the proposal goes beside the card, never over the scores; EV capped at 2 without a cited ID
await page.evaluate(() => { [...document.querySelectorAll('#panel-screening tbody tr')].find(tr => tr.textContent.startsWith('C37')).querySelector('button').click(); }); await page.waitForTimeout(400);
await page.click('#scr-ai-one'); await page.waitForSelector('.modal textarea', { timeout: 15000 }); await page.click('.modal .btnrow .btn:not(.ghost)'); await page.waitForSelector('#sai-apply', { timeout: 15000 });
const kept = await page.evaluate(() => [...document.querySelectorAll('.modal .sai-card')].map(tr => tr.textContent).join(' '));
ok(/your scores kept \(18\)/.test(kept) && /EV capped at 2/.test(kept), 'the review says the analyst\u2019s scores are kept and that EV is capped at 2 without a cited evidence ID');
await page.fill('#sai-by', 'Reviewer T56'); await page.click('#sai-apply'); await page.waitForTimeout(600);
const c37 = await page.evaluate(async () => { const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const r = SC.rec('C37', st.S.ws); return { total: SC.total(r), ai: !!r.ai, prop: r.aiProposal && { ev: r.aiProposal.scores[8], capped: r.aiProposal.capped }, csv: SC.csvRows(st.S.ws).find(row => row[0] === 'C37').at(-1) }; });
ok(c37.total === 18 && !c37.ai && c37.prop?.ev === 2 && c37.prop.capped && /beside the analyst/.test(c37.csv), 'C37 keeps its 18; the proposal sits beside it with EV capped at 2 ' + JSON.stringify(c37));
await page.evaluate(() => { [...document.querySelectorAll('#panel-screening tbody tr')].find(tr => tr.textContent.startsWith('C37')).querySelector('button').click(); }); await page.waitForTimeout(400);
ok(await page.isVisible('#scr-editor >> text=AI proposal beside your scores'), 'the card shows the proposal beside the analyst\u2019s scores');
// dismissing a proposal in the review rejects the log entry; feature off hides the buttons
await page.evaluate(async () => { const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); const r = SC.rec('C01', st.S.ws); r.scores = Array(12).fill(null); delete r.ai; st.touch(); });
await candidates();
await page.click('#scr-ai'); await page.waitForSelector('.modal textarea', { timeout: 15000 }); await page.click('.modal .btnrow .btn:not(.ghost)'); await page.waitForSelector('#sai-apply', { timeout: 15000 });
await page.click('.modal button:has-text("Dismiss")'); await page.waitForTimeout(300);
const dismissed = await page.evaluate(async () => (await import('/js/ai.js')).log()[0].decision);
ok(dismissed === 'rejected', 'dismissing the proposals records the log entry as rejected');
const feat = await page.evaluate(async () => { const AI = await import('/js/ai.js'); return AI.FEATURES.some(f => f[0] === 'screening_scores' && f[1] === 'Screening score estimates' && f[3] === 'medium') && AI.DEFAULT_POLICY.tasks.screening_scores === 'workspace'; });
ok(feat, 'screening_scores is a routed feature “Screening score estimates” (medium, workspace provider)');
await page.evaluate(async () => { const H = await import('/js/helper.js'); H.HS.config ||= {}; H.HS.config.ai ||= {}; H.HS.config.ai.policy = { ...(H.HS.config.ai.policy || {}), tasks: { ...((H.HS.config.ai.policy || {}).tasks || {}), screening_scores: 'off' } }; });
await candidates();
const hidden = await page.evaluate(() => !document.getElementById('scr-ai'));
await page.evaluate(() => { [...document.querySelectorAll('#panel-screening tbody tr')][0].querySelector('button').click(); }); await page.waitForTimeout(300);
ok(hidden && !(await page.isVisible('#scr-ai-one')), 'feature off → both buttons hidden');
await page.evaluate(async () => { const H = await import('/js/helper.js'); delete H.HS.config.ai.policy.tasks.screening_scores; });

ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 400));
await browser.close(); done('t56 candidates (C1, C2, C3/#7, C5, #20 families)');
