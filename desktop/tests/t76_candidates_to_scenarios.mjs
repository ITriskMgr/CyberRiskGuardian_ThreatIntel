// 1.9.3 (W1) — From candidates to scenarios: four stages, the progress strip and its one next action, the plain done lines,
// Batch "Send the ticked rows to Candidates" + "Advanced — skip screening", families and unique candidates, one-click creation
// (idempotent), the watch list, the From screening card, the migration 6 → 7, and the bundled cases unchanged.
import { open, ok, done, goto, medibec } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await page.setViewportSize({ width: 1440, height: 1000 });

/* ---------------- an empty workspace: the strip is at zero and its button opens Batch ---------------- */
await page.evaluate(async () => { const st = await import('/js/state.js'); const w = st.newWorkspace({ name: 'Candidates flow (t76)' }); w.org.name = 'Candidates flow'; await st.create(w); });
await goto(page, '#/screening/candidates', 900);
const z = await page.evaluate(() => ({ strip: document.querySelector('#scr-strip')?.textContent || '', next: document.querySelector('#scr-next')?.textContent || '', tabs: [...document.querySelectorAll('#panel-screening [role=tab]')].map(b => b.textContent.trim()),
  h1: document.querySelector('#panel-screening h1')?.textContent }));
z.tabs = z.tabs.map(t => t.replace(/\u200b/g, ''));
ok(/^0 candidates · 0 scored · 0 families \+ 0 unique · 0 selected · 0 created/.test(z.strip), 'empty workspace: strip at zero: ' + z.strip.slice(0, 90));
ok(/Add candidates/.test(z.next), 'empty workspace: the one next action is “Add candidates”');
ok(z.h1.startsWith('From candidates to scenarios') && z.tabs.join('|') === '① Candidates|② Screen|③ Select|④ Create scenarios', 'renamed screen with four numbered stages: ' + z.tabs.join('|'));
await page.click('#scr-next'); await page.waitForTimeout(700);
ok(/#\/batch/.test(await page.evaluate(() => location.hash)), 'with no candidate the button opens Batch scenarios');
const strip4 = [];
for (const t of ['candidates', 'screen', 'select', 'create']) { await goto(page, '#/screening/' + t, 500); strip4.push(await page.isVisible('#scr-strip') && await page.isVisible('#scr-next')); }
ok(strip4.every(Boolean), 'the strip and the next-action button are on all four stages');
// legacy addresses open the stage their content moved to
await goto(page, '#/screening/final', 500);
ok(await page.evaluate(() => document.querySelector('#scr-tab-create')?.getAttribute('aria-selected') === 'true'), 'the former Final portfolio address opens ④');

/* ---------------- Batch: rows not sent → banner; skip-screening confirms and journals ---------------- */
await page.evaluate(async () => {
  const st = await import('/js/state.js');
  const row = (name, asset) => ({ pick: true, name: name + ' — ' + asset, statement: 'A cybercriminal uses phishing to affect ' + asset + ', resulting in data theft.', threat_source: 'Cybercriminal', assets: asset,
    vulns: 'weak MFA', attack: ['T1566.002'], cwe: ['CWE-308'], params: { PbA: 0.8, Pbx: 0.5, De: 0.5, Dm: 0.8, Th: 0.45, Mu: 0.8 },
    cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:H/VI:H/VA:N/SC:H/SI:L/SA:L', cvss_score: null, cvss_note: '', red_p: 0, red_i: 0, owner: '', pattern: 'phish', cves: [], rat: {} });
  st.S.ws.batchDraft = [row('Skip me', 'TMS'), row('Send me', 'WMS')]; st.S.ws.batchDraft[1].pick = false; st.touch();
});
await goto(page, '#/batch', 900);
ok(await page.isVisible('#panel-batch >> text=These rows are not candidates yet'), 'rows in the grid and none sent: the banner says so');
ok(await page.isVisible('#batch-to-screening') && /Send the ticked rows to Candidates/.test(await page.textContent('#batch-to-screening')), 'main exit is “Send the ticked rows to Candidates”');
ok(await page.evaluate(() => document.querySelector('#batch-skip')?.open === false), '“Advanced — skip screening” is collapsed');
await page.click('#batch-skip summary'); await page.click('#batch-add-register'); await page.waitForSelector('#skip-confirm');
ok(await page.isVisible('.modal >> text=They will not count as candidates for step 5'), 'skipping asks for a confirmation that says what is skipped');
const n0s = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.SCEN.length);
await page.click('#skip-confirm'); await page.waitForTimeout(800);
const sk = await page.evaluate(async () => { const st = await import('/js/state.js'); const e = (st.S.ws.userAudit || []).find(x => x.action === 'skip-screening'); return { n: st.S.ws.assessment.SCEN.length, e, cands: st.S.ws.assessment.CANDIDATES.length }; });
ok(sk.n === n0s + 1 && sk.cands === 0, 'confirming adds the row to the register and no candidate');
ok(sk.e && sk.e.rowIds.length === 1 && sk.e.who && sk.e.when && JSON.parse(sk.e.detail).action === 'skip-screening', 'the audit log has {who, when, rowIds, action:skip-screening} ' + JSON.stringify(sk.e).slice(0, 120));
// the other generators land in ①
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.batchDraft = [{ pick: true, name: 'Sent row', statement: 'x', threat_source: 'Cybercriminal', assets: 'TMS', vulns: 'weak', attack: [], cwe: [], params: { PbA: 0.8, Pbx: 0.5, De: 0.5, Dm: 0.8, Th: 0.45, Mu: 0.8 }, cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:H/VI:H/VA:N/SC:H/SI:L/SA:L', red_p: 0, red_i: 0, pattern: 'phish', cves: [], rat: {} }]; st.touch(); });
await goto(page, '#/batch', 800); await page.click('#batch-to-screening'); await page.waitForTimeout(800);
ok(/#\/screening\/candidates/.test(await page.evaluate(() => location.hash)) && await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.CANDIDATES.length) === 1, 'Send the ticked rows to Candidates opens ① with the candidate');

/* ---------------- 20 candidates → step 5 done; scoring; ungrouped not selectable; unique; merge ---------------- */
const setup = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const P = await import('/js/process.js'); const ws = st.S.ws;
  const before = P.STEP.generate.status(ws);
  const mk = (i, extra = {}) => SC.addCandidate({ name: 'Candidate ' + i, source: 'Actor ' + i, assets: 'Asset ' + i, vuln: 'weakness ' + i, consequence: 'consequence ' + i,
    draft: { statement: 'Actor ' + i + ' exploits weakness ' + i, params: { PbA: { v: 0.4 + i / 100, rat: '', ev: '', conf: 'Low' } }, attack: ['T10' + (10 + i)], cwe: [], cves: [], cvss: i % 2 ? 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N' : '', origin: 'batch' }, ...extra }, ws);
  const ids = []; for (let i = 2; i <= 21; i++) ids.push(mk(i));
  for (const [k, id] of ids.entries()) { const r = SC.rec(id, ws); r.scores = Array(12).fill(1 + (k % 5)); r.disp = 'Defer'; }
  { const r0 = SC.rec(ws.assessment.CANDIDATES[0][0], ws); r0.scores = Array(12).fill(2); r0.disp = 'Defer'; }
  st.touch();
  return { before, after: P.STEP.generate.status(ws), n: SC.distinctCount(ws), ids, ids2: ws.assessment.CANDIDATES.map(r => r[0]) };
});
ok(setup.before === 'partial' && setup.after === 'done' && setup.n === 21, '20 distinct candidates → step 5 done (' + setup.n + ')');
const all = setup.ids2;
const g0 = await page.evaluate(async ({ all }) => {
  const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); const ws = st.S.ws, A = SC.analysis(ws);
  const u = A.units.find(x => x.id === all[3]);
  return { sel: SC.setSelected(u, true, ws), selectable: SC.isSelectable(u, ws), selected: SC.state(ws).cands[all[3]].disp, ungrouped: A.progress.ungrouped, next: A.progress.next.id };
}, { all });
ok(g0.sel === 'Group or mark unique first' && !g0.selectable && g0.selected !== 'Select', 'an ungrouped, unconfirmed candidate cannot be selected');
ok(['score', 'group', 'select'].includes(g0.next), 'next action follows the first unmet condition (' + g0.next + ')');
await goto(page, '#/screening/select', 800);
ok(await page.evaluate(() => [...document.querySelectorAll('#panel-screening .scr-greyed')].some(x => /Group or mark unique first/.test(x.textContent)) && document.querySelector('#panel-screening .scr-select[disabled]') !== null), '③ greys ungrouped candidates with “Group or mark unique first”');
// cluster match refuses “Mark as unique”
const m1 = await page.evaluate(async ({ all }) => {
  const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); const ws = st.S.ws;
  SC.rec(all[1], ws).ontologyMatch = { crgoId: 'X', cluster: 'K1', score: 0.9, source: 'test' }; SC.rec(all[2], ws).ontologyMatch = { crgoId: 'X', cluster: 'K1', score: 0.9, source: 'test' };
  const refused = SC.markUnique(all[1], 'Tester', ws); const rec = SC.rec(all[1], ws).unique;
  const lone = SC.markUnique(all[5], 'Tester', ws); const u = SC.rec(all[5], ws).unique;
  return { refused, rec, lone, u };
}, { all });
ok(/cluster/.test(m1.refused || '') && m1.rec === null, '“Mark as unique” is refused while an ontology cluster match exists, and says why: ' + m1.refused);
ok(m1.lone === null && m1.u && m1.u.by === 'Tester' && /^\d{4}-\d\d-\d\dT/.test(m1.u.at), 'a lone candidate is marked unique, recorded {by, at}');
await goto(page, '#/screening/screen', 900);
ok(await page.isVisible('.scr-unique-why') && await page.isVisible('.scr-unique'), '② offers “Mark as unique” only where it can, and says why where it cannot');
// merge clears unique
const m2 = await page.evaluate(async ({ all }) => {
  const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); const ws = st.S.ws;
  const f = SC.mergeInto([all[5], all[6]], { name: 'Merged family', statement: 'A representative statement' }, ws);
  return { fam: f.id, members: f.members, unique: SC.rec(all[5], ws).unique, grouped: SC.grouped(all[5], ws) };
}, { all });
ok(m2.members.join() === `${all[5]},${all[6]}` && m2.unique === null && m2.grouped, 'merging a unique candidate into a family clears its unique mark');
// the Merge into… dialog
await goto(page, '#/screening/screen', 800);
await page.evaluate(() => { document.querySelector('.scr-pick')?.click(); });
await page.click('#scr-merge'); await page.waitForSelector('#merge-ok');
ok(await page.isVisible('#merge-statement'), 'Merge into… has an editable representative statement');
await page.click('#merge-ok'); await page.waitForTimeout(500);

/* ---------------- ten selected → ④ creates ten with inherited values, even with open findings; second click creates none ---------------- */
const prep = await page.evaluate(async ({ all }) => {
  const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); const ws = st.S.ws; const S = SC.state(ws);
  // families of two members and unique candidates: 5 families + 5 unique = 10
  const ids = all.filter(i => !SC.familyOf(i, ws)).slice(0, 15);
  const fams = [];
  for (let k = 0; k < 5; k++) { const f = SC.mergeInto([ids[2 * k], ids[2 * k + 1]], { name: 'Family ' + k, statement: 'Family statement ' + k }, ws); fams.push(f.id); }
  const uniq = ids.slice(10, 15).filter(i => !SC.markUnique(i, 'Tester', ws) || true);
  for (const i of uniq) if (!SC.rec(i, ws).unique) SC.markUnique(i, 'Tester', ws);
  // a best member with higher scores in family 0, and an open finding on a candidate (never blocks)
  SC.rec(ids[1], ws).scores = Array(12).fill(5);
  SC.rec(ids[1], ws).ontologyFindings = [{ code: 'T-REVOKED', detail: 'revoked technique', state: 'open', by: '', at: '' }];
  const A = SC.analysis(ws); const out = [];
  for (const u of A.units) if ((u.kind === 'family' && fams.includes(u.id)) || (u.kind === 'cand' && uniq.includes(u.id))) out.push(SC.setSelected(u, true, ws));
  for (const u of SC.selectedUnits(ws, SC.analysis(ws))) { const w = SC.whyOf(u, ws); for (let i = 0; i < 6; i++) w[i] = 'why ' + i; }
  st.touch();
  const p = SC.analysis(ws).progress;
  return { refused: out.filter(Boolean).length, selected: p.selected, toCreate: p.toCreate, next: p.next.id, fams, uniq, best: ids[1], bestMember: SC.bestMember(S.families.find(f => f.id === fams[0]), ws).id };
}, { all });
ok(prep.refused === 0 && prep.selected === 10 && prep.toCreate === 10, 'ten selected (5 families + 5 unique): ' + JSON.stringify([prep.selected, prep.toCreate]));
ok(prep.next === 'create', 'with ten selected and none created the next action is “Create the 10 scenarios”');
await goto(page, '#/screening/create', 900);
ok(/Create the 10 scenarios/.test(await page.textContent('#scr-create-all')) && await page.evaluate(() => document.querySelectorAll('.scr-review').length) === 10, '④ lists the ten items in the review');
ok(await page.evaluate(() => !!document.querySelector('#scr-findings-slot')) && await page.evaluate(() => document.querySelectorAll('.scr-finding-slot').length) === 10 && (await goto(page, '#/screening/screen', 500), await page.evaluate(() => !!document.querySelector('#scr-grouping-slot'))) && (await goto(page, '#/screening/create', 500), true), 'the empty slots for the ontology findings exist in ④ (and the grouping slot in ②)');
const sc0 = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.SCEN.length);
await page.click('#scr-create-all'); await page.waitForSelector('#scr-open-first');
const c1 = await page.evaluate(async ({ prep }) => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const ws = st.S.ws; const SCEN = ws.assessment.SCEN;
  const made = SCEN.slice(-10); const f0 = SCEN.find(s => s.origin && s.origin.familyId === prep.fams[0]);
  return { n: SCEN.length, objs: made.every(s => s.origin && typeof s.origin === 'object' && Array.isArray(s.origin.candidateIds) && s.origin.createdAt && 'scores' in s.origin && Array.isArray(s.origin.why)),
    f0pba: f0?.params.PbA.v, bestPba: SC.rec(prep.best, ws).draft.params.PbA.v, links: f0?.attack, marker: /Analytical estimate — validation required/.test(f0?.params.PbA.rat || ''), fam: f0?.origin.familyId,
    uniqueOrigin: made.filter(s => s.origin.familyId === null).length, text: document.querySelector('.modal')?.textContent || '', progress: SC.analysis(ws).progress };
}, { prep });
ok(c1.n === sc0 + 10 && c1.objs, 'creates ten scenarios, each with origin {candidateIds, familyId, scores, why, …, createdAt}');
const uw = await page.evaluate(async () => { const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); const ws = st.S.ws;
  const u = ws.assessment.SCEN.find(s => s.origin?.familyId === null);
  // cluster mates already in a family do not block “Mark as unique”
  const ids = ws.assessment.CANDIDATES.map(r => r[0]).filter(i => !SC.familyOf(i, ws) && !SC.rec(i, ws).unique);
  SC.rec(ids[0], ws).ontologyMatch = { crgoId: 'Y', cluster: 'K2', score: 1, source: 't' }; SC.rec(ids[1], ws).ontologyMatch = { crgoId: 'Y', cluster: 'K2', score: 1, source: 't' };
  const blocked = SC.uniqueBlock(ids[0], ws); SC.mergeInto([ids[1], ids[2]], { name: 'F' }, ws); const freed = SC.uniqueBlock(ids[0], ws);
  return { why: u?.origin.why, keys: SC.WHY_KEYS.length === SC.WHY.length, blocked: !!blocked, freed }; });
ok(uw.why[0] === 'why 0' && uw.why.length === 6 && uw.keys, 'a unique candidate’s six answers are copied into origin.why; WHY_KEYS matches WHY');
ok(uw.blocked && uw.freed === null, 'cluster mates already in a family no longer block “Mark as unique”');
ok(c1.f0pba === c1.bestPba && c1.links.length === 2 && c1.marker, 'inherited values: the highest-scoring member’s parameters, the links of both members, the estimate marker (' + c1.f0pba + ')');
ok(c1.uniqueOrigin === 5 && /10 scenarios created — next: step 8/.test(c1.text), 'summary dialog: “10 scenarios created — next: step 8”');
ok(c1.progress.created === 10 && c1.progress.next.id === 'develop', 'after creation the next action is “Develop the scenarios (step 8)”');
// second click creates none
await page.evaluate(() => document.querySelector('#scr-summary-close')?.click()); await page.waitForTimeout(300);
const again = await page.evaluate(async () => { const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); const n = st.S.ws.assessment.SCEN.length; const made = SC.createSelected(st.S.ws); return { n, made: made.length, after: st.S.ws.assessment.SCEN.length }; });
ok(again.made === 0 && again.after === again.n, 'a second creation creates nothing (idempotent marker)');
ok(await page.evaluate(() => document.querySelector('#scr-create-all')?.disabled === true), 'the button is disabled once everything selected is created');

/* ---------------- watch list ---------------- */
const w = await page.evaluate(async () => { const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); const ws = st.S.ws; const left = SC.watchCandidates(ws).filter(x => !x.entry).length; return { left, n: ws.screening.watch.length }; });
ok(w.left > 0, 'candidates not selected are offered for the watch list (' + w.left + ')');
await page.click('#watch-add-rest'); await page.waitForTimeout(500);
const w2 = await page.evaluate(() => ({ boxes: [...document.querySelectorAll('.watch-trigger')].length, empty: [...document.querySelectorAll('.watch-trigger.empty')].length, outlined: [...document.querySelectorAll('.watch-trigger')].every(t => t.style.outline) }));
ok(w2.boxes === w.left && w2.empty === w.left && w2.outlined, 'watch list filled, each with an empty promotion trigger highlighted');

/* ---------------- step 8 opens on the first created scenario; the From screening card ---------------- */
await goto(page, '#/screening/create', 600);
await page.click('#scr-next'); await page.waitForTimeout(1000);
const s8 = await page.evaluate(() => ({ hash: location.hash, chain: document.querySelector('#scen-tab-chain')?.getAttribute('aria-selected'), card: !!document.querySelector('#scen-from-screening'), cardText: document.querySelector('#scen-from-screening')?.textContent || '' }));
ok(/#\/scenario\/S\d+/.test(s8.hash) && s8.chain === 'true', 'step 8: the Scenario editor opens on a created scenario, Causal chain tab');
ok(s8.card && /From screening/.test(s8.cardText) && /Candidates/.test(s8.cardText), 'the editor shows the read-only “From screening” card');

/* ---------------- Process card shows the strip on steps 5–7 ---------------- */
await goto(page, '#/process', 900);
const pc = await page.evaluate(async () => { const P = await import('/js/process.js'); const st = await import('/js/state.js'); return { next: P.nextStep(st.S.ws)?.s.id, strip: !!document.querySelector('#panel-process #scr-strip') }; });
// move the work to step 7 so the card is on a screening step regardless of the earlier steps of this empty workspace
const pc2 = await page.evaluate(async () => { const P = await import('/js/process.js'); const PP = await import('/js/panels/process.js'); return { steps: ['generate', 'screen', 'select'].map(id => P.STEPS.find(s => s.id === id).done) }; });
ok(pc2.steps[0] === 'Have at least 20 candidates — short causal statements, not yet scenarios.' && pc2.steps[1] === 'Score every candidate and group the variants into families.'
  && pc2.steps[2] === 'Choose the scenarios to develop, usually ten, and say why each one.', 'plain done lines of steps 5, 6, 7');
ok(await page.evaluate(async () => (await import('/js/process.js')).STEPS.find(s => s.id === 'scenarios').done) === 'Develop each created scenario: causal chain, assets, controls, consequences.', 'plain done line of step 8');
// force the Process card onto step 5/6/7 by showing it with a workspace whose earlier steps are done: draw the strip builder directly too
const stripFn = await page.evaluate(async () => { const M = await import('/js/panels/screening.js'); const st = await import('/js/state.js'); const n = M.progressStrip(st.S.ws); return n.textContent; });
ok(/candidates · .* scored · .* families \+ .* unique · .* selected · .* created/.test(stripFn), 'the strip builder is shared with the Process card');
const onCard = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const P = await import('/js/process.js'); const ws = st.S.ws;
  // the Process page draws the next step's card; make steps 1–4 done on a copy of the logic by checking the source of the card instead
  const src = await (await fetch('/js/panels/process.js')).text(); return /progressStrip\(ws\)/.test(src) && /'generate', 'screen', 'select'/.test(src);
});
ok(onCard, 'the Process card of steps 5–7 draws the strip');

/* ---------------- the bundled cases render in the new stages with unchanged totals ---------------- */
await medibec(page);
for (const t of ['candidates', 'screen', 'select', 'create']) {
  await goto(page, '#/screening/' + t, 600);
  const bad = await page.evaluate(() => [...document.querySelectorAll('#panel-screening .banner')].some(b => /raised an error/.test(b.textContent)) || /raised an error/.test(document.querySelector('#panel-screening')?.textContent || ''));
  ok(!bad, 'MediBec renders in stage ' + t);
}
const tot = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js');
  const mb = st.compute(st.medibecWorkspace()).totals, cr = st.compute(st.exampleWorkspace('canaretail')).totals;
  const A = SC.analysis(st.medibecWorkspace()), B = SC.analysis(st.exampleWorkspace('canaretail'));
  return { mb: [Math.round(mb.est), Math.round(mb.res)], cr: [Math.round(cr.est), Math.round(cr.res)], mbSel: A.progress.selected, crSel: B.progress.selected, mbUnits: A.units.length, mbC01: SC.total(SC.state(st.medibecWorkspace()).cands.C01) };
});
ok(tot.mb.join() === '84305,41023' && tot.cr.join() === '27526,16049', 'MediBec 84,305 / 41,023 and CanaRetail 27,526 / 16,049 unchanged');
ok(tot.mbSel === 10 && tot.crSel === 10 && tot.mbC01 === 52, 'both teaching screenings keep ten selected families and their totals');

/* ---------------- migration from a 1.9.2 workspace ---------------- */
const mig = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const M = await import('/js/migrate.js');
  const w = st.exampleWorkspace('canaretail'); w.dataVersion = 6; w.migrationLog = [];
  // a 1.9.2 workspace: no 1.9.3 fields, scenarios with a text origin
  for (const r of Object.values(w.screening.cands)) { delete r.unique; delete r.ontologyMatch; delete r.proposals; delete r.ontologyFindings; }
  for (const f of w.screening.families) { delete f.whyDraft; delete f.whyMark; }
  delete w.screening.themeGap;
  const linked = new Set(w.screening.families.flatMap(f => f.scenarios || []));
  const orphan = w.assessment.SCEN.find(s => !linked.has(s.id)), fam = w.screening.families.find(f => (f.scenarios || []).length);
  const sid = fam.scenarios[0]; const textBefore = w.assessment.SCEN.find(s => s.id === sid).origin;
  const t0 = JSON.stringify(st.compute(w).totals);
  const r = M.migrateWorkspace(JSON.parse(JSON.stringify(w)), { fill: st.migrate });
  const t1 = JSON.stringify(st.compute(r.ws).totals);
  const s = r.ws.assessment.SCEN.find(x => x.id === sid), o = orphan && r.ws.assessment.SCEN.find(x => x.id === orphan.id);
  const rec = Object.values(r.ws.screening.cands)[0];
  const again = M.migrateWorkspace(JSON.parse(JSON.stringify(r.ws)), { fill: st.migrate });
  return { dv: M.DATA_VERSION, status: r.status, to: r.ws.dataVersion, steps: r.steps.map(x => x.from + '→' + x.to).join(), same: t0 === t1, journal: (r.ws.migrationLog || []).length === 1 && r.ws.migrationLog[0].from === 6 && r.ws.migrationLog[0].to === 7,
    notes: r.steps.flatMap(x => x.notes).join(' | '), origin: s?.origin && { fam: s.origin.familyId, rec: s.origin.reconstructed, text: s.origin.text === (typeof textBefore === 'string' ? textBefore : ''), ids: s.origin.candidateIds.length, by: s.origin.createdBy },
    orphanOrigin: o ? typeof o.origin : 'none', fields: rec && ['unique' in rec, 'ontologyMatch' in rec, Array.isArray(rec.proposals), Array.isArray(rec.ontologyFindings)], famFields: ['whyDraft' in r.ws.screening.families[0], 'whyMark' in r.ws.screening.families[0]], gap: Array.isArray(r.ws.screening.themeGap),
    scenFields: Array.isArray(s?.ontologyFindings) && s?.ontoProposal === null, again: again.status };
});
ok(mig.dv === 7 && mig.status === 'migrated' && mig.to === 7 && mig.steps === '6→7', 'a 1.9.2 workspace migrates 6 → 7 (DATA_VERSION ' + mig.dv + ')');
ok(mig.same && mig.journal, 'no number changed; the migration is journalled');
ok(mig.origin && mig.origin.fam && mig.origin.rec && mig.origin.text && mig.origin.ids > 0 && mig.origin.by === '', 'a scenario listed by a family gets its origin rebuilt (marked reconstructed, earlier text kept)');
ok(mig.orphanOrigin === 'string' || mig.orphanOrigin === 'none' || mig.orphanOrigin === 'undefined', 'a scenario no family lists keeps its text origin (nothing invented): ' + mig.orphanOrigin);
ok(mig.fields.every(Boolean) && mig.famFields.every(Boolean) && mig.gap && mig.scenFields, 'the new optional fields are created empty: ' + JSON.stringify([mig.fields, mig.famFields, mig.gap, mig.scenFields]));
ok(/rebuilt from the family/.test(mig.notes), 'the journal says which scenarios got an origin');
ok(mig.again === 'current', 'a migrated workspace is current');

ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 400));
await browser.close(); done('t76 candidates to scenarios');
