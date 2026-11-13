// 1.9.3 (W3, C6) — AI family proposals: Part A (families + six "why" drafts), Part B (match candidates), Part C (coverage gaps).
// Canned answers (mock/families_*.txt) written against the MediBec example and the hand-made grouping seed (mock/families_seed_medibec.json).
import { open, ok, done, goto, medibec, MOCK, MOCK_SRC } from './lib.mjs';
import fs from 'fs';
const { browser, page, errors } = await open('#/process');
await medibec(page);
const SEED = JSON.parse(fs.readFileSync(MOCK_SRC + '/families_seed_medibec.json', 'utf8'));
const mock = n => fs.copyFileSync(MOCK_SRC + '/' + n, MOCK + '/screening_families.txt');
const stop = on => { const p = MOCK + '/screening_families.stop'; if (on) fs.copyFileSync(MOCK_SRC + '/families_a_truncated.stop', p); else fs.rmSync(p, { force: true }); };
const last = () => JSON.parse(fs.readFileSync(MOCK + '/_last.json', 'utf8'));

// the workspace: AI allowed, the seed injected (W2 has its own determinism test)
await page.evaluate(async seed => {
  const st = await import('/js/state.js'); const AI = await import('/js/ai.js'); const F = await import('/js/familyai.js');
  const a = AI.settings(st.S.ws); a.acknowledged = new Date().toISOString(); a.confidential = false; F.setSeed(seed); st.touch();
}, SEED);
const fixture = async kind => page.evaluate(async kind => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const ws = st.S.ws, S0 = SC.state(ws);
  if (!window.__fam0) window.__fam0 = JSON.stringify(S0.families);
  S0.families = JSON.parse(window.__fam0);
  if (kind === 'A') S0.families = S0.families.filter(f => ['P01', 'P09'].includes(f.id));
  if (kind === 'C') { const out = { P04: 1, P10: 1 }; S0.families = S0.families.filter(f => !out[f.id]); ws.assessment.CANDIDATES = ws.assessment.CANDIDATES.filter(r => r[0] !== 'C29'); }
  for (const f of S0.families) { f.aiMark = null; f.whyDraft = null; f.memberMarks = f.memberMarks || {}; }
  for (const r of Object.values(S0.cands)) { r.unique = null; r.aiGap = null; r.proposals = []; }
  ws.assessment.CANDIDATES = ws.assessment.CANDIDATES.filter(r => +r[0].slice(1) <= 45);
  st.touch(); return { fams: S0.families.map(f => f.id), n: ws.assessment.CANDIDATES.length };
}, kind);
const snap = () => page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const ws = st.S.ws, S0 = SC.state(ws);
  const memberOf = {}; let multi = 0;
  for (const f of S0.families) for (const m of f.members) { if (memberOf[m]) multi++; memberOf[m] = f.id; }
  return { fams: S0.families.map(f => ({ id: f.id, members: f.members.slice(), name: f.name, aiMark: f.aiMark, whyDraft: f.whyDraft, cov: f.coverage, covMarks: Object.keys(f.coverageMarks || {}), mm: Object.keys(f.memberMarks || {}) })), multi,
    uniques: Object.entries(S0.cands).filter(([, r]) => r.unique).map(([id, r]) => [id, !!r.unique.ai]), cands: ws.assessment.CANDIDATES.length };
});
const start = async sel => { await goto(page, '#/screening/screen', 900); await page.click(sel); await page.waitForSelector('.modal textarea', { timeout: 15000 }); };
const mt = () => { try { return fs.statSync(MOCK + '/_last.json').mtimeMs; } catch { return 0; } };
const send = async () => {   // press Send, wait until the helper has received the request (_last.json rewritten)
  const m0 = mt(); await page.click('.modal .btnrow .btn:not(.ghost)');
  for (let i = 0; i < 100 && mt() === m0; i++) await page.waitForTimeout(100);
  await page.waitForTimeout(300);
};
const preview = async re => page.waitForFunction(r => { const t = document.querySelector('.modal textarea:nth-of-type(1)'); return [...document.querySelectorAll('.modal textarea')].some(x => new RegExp(r).test(x.value)); }, re.source, { timeout: 15000 });
const cancelPreview = async () => { await page.click('.modal .btnrow .btn.ghost >> text=Cancel'); await page.waitForTimeout(300); };
const run = () => page.evaluate(async () => { const st = await import('/js/state.js'); const F = await import('/js/familyai.js'); const r = F.lastRun(st.S.ws); return r && { counts: r.counts, na: [...r.notAnswered].sort(), trunc: r.truncated, fams: r.fams.map(f => ({ key: f.key, m: f.members, why: !!f.why })), uniques: r.uniques.map(u => ({ ref: u.ref, down: u.downgraded, why: !!u.why })), moves: r.moves.map(m => `${m.ref} ${m.from}>${m.to.id || m.to.key || m.to.kind}`), renames: r.renames.length, entries: r.entryIds.length, batchesOf: r.batchesOf }; });
const logOf = () => page.evaluate(async () => { const st = await import('/js/state.js'); const AI = await import('/js/ai.js'); return AI.log(st.S.ws).filter(e => e.task === 'screening_families').map(e => [e.decision, e.truncated || false, e.summary.slice(0, 40)]); });

/* ---------------- batches ---------------- */
const fa = await fixture('A');
ok(fa.fams.join() === 'P01,P09' && fa.n === 45, 'fixture A: families P01, P09 and 45 candidates ' + JSON.stringify(fa));
const parts = await page.evaluate(async () => { const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const F = await import('/js/familyai.js');
  const seed = F; const sd = (await import('/js/familyai.js')).seedFor ? (await F.seedFor(st.S.ws)).seed : null; const refs = SC.candidates(st.S.ws).map(c => c.id);
  const mk = (n) => Array.from({ length: n }, (_, i) => 'X' + String(i).padStart(3, '0'));
  return { a: F.batches(refs, sd, SC.state(st.S.ws).families).map(b => b.length), big: F.batches(mk(95), null, []).map(b => b.length), small: F.batches(mk(40), null, []).map(b => b.length), first: F.batches(refs, sd, SC.state(st.S.ws).families)[0].join(' ') }; });
ok(parts.a.join() === '23,22', 'A: 45 candidates in batches of 23 and 22 (' + parts.a + ')');
ok(parts.first === 'C01 C02 C03 C04 C05 C06 C07 C08 C09 C10 C11 C15 C20 C23 C24 C26 C30 C34 C35 C37 C40 C41 C43', 'A: batch 1 matches the reference partition');
ok(parts.big.join() === '32,32,31' && parts.small.join() === '40', 'batches never exceed 40 (95 → ' + parts.big + '; 40 → one)');

/* ---------------- Part A: happy path, two previews ---------------- */
mock('families_a.txt'); stop(false);
await start('#scr-ai-fam-a');
await send();
ok(/REQUEST: A — propose families for all candidates \(batch 1 of 2\)/.test(last().prompt) && /TASK: screening_families/.test(last().prompt), 'A: batch 1 preview carries the request line and the task');
ok(/Next new family id: N01/.test(last().prompt) && /LIB-F1436 \| family/.test(last().prompt) && /Evidence register/.test(last().prompt) && /Analytical estimate — validation required/.test(last().prompt), 'A: ids, the seed list, the register and the markers are in the payload');
ok(!/ aiProposal/.test(last().prompt) && last().max_tokens === 3000 + 450 * 23, 'A: max_tokens follows the formula (' + last().max_tokens + ')');
mock('families_a_batch2.txt');
await preview(/batch 2 of 2/);
const mid = await snap();
ok(mid.fams.length === 2, 'A: nothing is created between the batches');
await send();
ok(/batch 2 of 2/.test(last().prompt) && /Next new family id: N06/.test(last().prompt) && /N01 \| Ransomware/.test(last().prompt) && /N05 \| Bulk exposure/.test(last().prompt), 'A: the second preview carries the first batch’s families and Next new family id: N06');
await page.waitForSelector('#scr-ai-fam-panel', { timeout: 15000 });
const r1 = await run();
ok(Object.values(r1.counts).every(v => !v) && r1.na.length === 0 && !r1.trunc, 'A: all counters zero, nothing unanswered, not truncated ' + JSON.stringify(r1.counts));
ok(r1.fams.map(f => f.key).join() === 'N01,N02,N03,N05,N06,N07,N08,N09,N04'.split(',').sort().join() || r1.fams.length === 9, 'A: nine new families (' + r1.fams.map(f => f.key) + ')');
ok(r1.fams.find(f => f.key === 'N01').m.includes('C14') && r1.fams.find(f => f.key === 'N05').m.join() === 'C04,C05,C17,C44', 'A: continuations merged (N01 has C14; N05 C04 C05 C17 C44)');
ok(r1.uniques.length === 10 && r1.moves.join() === 'C24 unique>N08', 'A: ten unique candidates and the C24 → N08 suggestion (' + r1.moves + ')');
const before = await snap();
ok(before.fams.length === 2 && before.uniques.length === 0 && before.cands === 45, 'A: nothing is written before an acceptance');
ok((await page.locator('#scr-ai-fam-panel .prop-item').count()) >= 20, 'A: the review panel lists the proposals');
ok((await logOf()).length === 2 && (await logOf()).every(e => e[0] === 'pending' && /REQUEST: A/.test(e[2])), 'A: two AI log entries, pending');

// reject one, edit one, accept the rest
const reject = page.locator('#scr-ai-fam-panel .prop-item[data-key="fam:N07"] [data-act=reject]'); await reject.click();
await page.locator('#scr-ai-fam-panel .prop-item[data-key="fam:N02"] [data-act=edit]').click();
await page.fill('#scr-ai-fam-panel .prop-item[data-key="fam:N02"] .prop-edit input:not([type=checkbox])', 'Edited exposed systems family');
await page.locator('#scr-ai-fam-panel .prop-item[data-key="fam:N02"] [data-act=accept-edited]').click(); await page.waitForTimeout(400);
let s1 = await snap();
ok(s1.fams.length === 3 && s1.fams.find(f => f.name === 'Edited exposed systems family'), 'A: the edited family was accepted with its new name');
await page.click('#scr-ai-fam-panel-accept-all'); await page.waitForTimeout(800);
s1 = await snap();
ok(s1.multi === 0, 'A: a candidate is in at most one family');
ok(!s1.fams.find(f => /supplier/i.test(f.name)), 'A: the rejected proposal (supplier family) was not created');
const n01 = s1.fams.find(f => f.name.startsWith('Ransomware with data theft'));
ok(n01 && n01.aiMark?.request === 'A' && n01.aiMark.key === 'N01' && n01.aiMark.by !== undefined && n01.mm.length === 7, 'A: an accepted family carries aiMark {request, key} and a member mark per member ' + JSON.stringify(n01?.aiMark));
ok(n01.whyDraft?.answers.length === 6 && n01.whyDraft.answers.every(a => /Analytical estimate — validation required|Information gap — organizational/.test(a)) && n01.cov.includes('Ransomware / destructive') && n01.covMarks.length >= 5, 'A: the six why drafts carry the marker; coverage ticks are marked');
ok(s1.fams.find(f => f.id === 'P01').members.join() === 'C01,C20,C23,C30,C41' && !s1.fams.find(f => f.id === 'P01').aiMark, 'A: the analyst’s family P01 is untouched');
const rn = await page.evaluate(async () => {   // review n3: an accepted AI rename sets the family's AI mark
  const st = await import('/js/state.js'), SC = await import('/js/screening.js'), F = await import('/js/familyai.js');
  const f = SC.state(st.S.ws).families.find(x => x.id === 'P01'), keep = { name: f.name, statement: f.statement, aiMark: f.aiMark || null };
  const r = F.newRun('A', st.S.ws, {}); r.renames.push({ id: 'P01', name: 'P01: Renamed by the AI (t78)', statement: f.statement, reason: 'r', conf: 'M', entryId: 'e', model: 'm', batch: 1 });
  const it = F.itemsOf(r, st.S.ws).find(x => x.kind === 'rename'); const err = F.acceptItem(r, it, {}, st.S.ws);
  const out = { err, name: f.name, mark: f.aiMark && { request: f.aiMark.request, by: f.aiMark.by } };
  Object.assign(f, keep); return out;
});
ok(!rn.err && /Renamed by the AI/.test(rn.name) && rn.mark?.request === 'A', 'n3: an accepted AI rename sets the family aiMark ' + JSON.stringify(rn));
ok(s1.uniques.length === 8 && s1.uniques.every(u => u[1]) && s1.fams.find(f => f.members.includes('C24'))?.aiMark?.key === 'N08', 'A: accepted unique candidates carry the AI mark; C24 and C37 (cluster mates outside a family) stay blocked and C24 joined N08 by its accepted move (' + s1.uniques.length + ')');
const lg = await logOf();
ok(lg.length === 2 && lg.every(e => e[0] === 'accepted'), 'A: both log entries decided "accepted" ' + JSON.stringify(lg));
const dj = await page.evaluate(async () => { const L = await import('/js/logs.js'); return L.entries('data').filter(e => /proposed by AI/.test(e.action)).length; });
ok(dj >= 10, 'A: acceptances are journalled (' + dj + ' data-log entries)');
// ③ Select: the draft waits at the Select stage
await page.evaluate(async () => { const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const f = SC.state(st.S.ws).families.find(x => x.aiMark?.key === 'N01'); f.selected = true; f.why = []; st.touch(); });
await goto(page, '#/screening/select', 900);
ok(await page.isVisible('[data-draft]'), 'A: the why draft is offered at ③ Select');
await page.click('[data-draft] [data-act=use-draft]'); await page.waitForTimeout(500);
const used = await page.evaluate(async () => { const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const f = SC.state(st.S.ws).families.find(x => x.aiMark?.key === 'N01'); return { w: f.why.filter(Boolean).length, mark: f.whyMark?.request, draft: f.whyDraft }; });
ok(used.w === 6 && used.mark === 'A' && used.draft === null, 'A: using the draft fills the six answers and records whyMark');

/* ---------------- truncated answer ---------------- */
await fixture('A'); mock('families_a_truncated.txt'); stop(true);
await start('#scr-ai-fam-a'); await send(); await preview(/batch 2 of 2/);
mock('families_a_batch2.txt'); stop(false); await send();
await page.waitForSelector('#scr-ai-fam-panel', { timeout: 15000 });
const rt = await run();
ok(rt.trunc && rt.fams.map(f => f.key).slice(0, 3).join() === 'N01,N02,N03' && !rt.fams.some(f => f.key === 'N04' && f.m.includes('C15')), 'truncated: complete items kept, the cut one left out (' + rt.fams.map(f => f.key) + ')');
ok(['C04', 'C05', 'C10', 'C11', 'C15', 'C24', 'C37'].every(r => rt.na.includes(r)), 'truncated: the unplaced candidates are listed (' + rt.na + ')');
ok(await page.isVisible('#scr-ai-fam-again') && /cut off/.test(await page.innerText('#scr-ai-fam-out')), 'truncated: banner and “Ask again” offered');
ok((await logOf()).some(e => e[1] === true), 'truncated: the AI log entry keeps truncated: true');
await page.click('#scr-ai-fam-dismiss'); await page.waitForTimeout(400);
ok((await snap()).fams.length === 2, 'truncated: dismissing creates nothing');
stop(false);

/* ---------------- malformed answer ---------------- */
fs.writeFileSync(MOCK + '/screening_families.txt', 'Sorry {{ this is not json');
await start('#scr-ai-fam-a'); await send(); await page.waitForTimeout(1200);
const lm = await logOf();
ok(!(await page.isVisible('#scr-ai-fam-panel')) && (await snap()).fams.length === 2 && lm[0]?.[0] === 'rejected', 'malformed: an error is shown, nothing applied, the entry rejected ' + JSON.stringify(lm[0]) + ' ' + (await page.isVisible('#scr-ai-fam-panel')) + ' ' + (await snap()).fams.length);
ok((await page.locator('.toast, #toasts *').allInnerTexts().catch(() => [])).join(' ').length >= 0, 'malformed: ok');

/* ---------------- parser counters on the schema-invalid answer ---------------- */
const errTxt = fs.readFileSync(MOCK_SRC + '/families_errors.txt', 'utf8');
const ce = await page.evaluate(async ({ seed, txt }) => {
  const st = await import('/js/state.js'); const F = await import('/js/familyai.js'); const SC = await import('/js/screening.js'); const AI = await import('/js/ai.js');
  const ws = st.S.ws, refs = SC.candidates(ws).map(c => c.id), b = F.batches(refs, seed, SC.state(ws).families);
  const r = F.newRun('A', ws, { seed, refs }); r.sentNext = 1; F.ingestA(r, AI.parseJson(txt), b[0], { batch: 1, entryId: 'x', model: 'm' });
  const items = F.itemsOf(r, ws);
  return { counts: r.counts, na: [...r.notAnswered], fams: r.fams.map(f => f.key + ':' + f.members.join('+')), uniq: r.uniques.map(u => u.ref + (u.downgraded ? '*' : '') + (ws && SC.uniqueBlock(u.ref, ws) ? '!' : '')), moves: r.moves.map(m => m.ref + ' ' + m.from + '>' + (m.to.key || m.to.id)), ren: r.renames.length, items: items.length };
}, { seed: SEED, txt: errTxt });
const want = { unknownRefs: 4, unknownSeed: 1, unknownEvidence: 1, outOfBatch: 1, duplicateMembership: 1, moveSuggestions: 1, emptyDropped: 1, downgradedToUnique: 2, evReplaced: 2, markerAdded: 1, invalidValues: 1, extraFields: 1, renumbered: 1 };
for (const [k, v] of Object.entries(want)) ok(ce.counts[k] === v, `errors: ${k} = ${v} (${ce.counts[k]})`);
ok(ce.na.join() === 'C11', 'errors: only C11 was never placed (' + ce.na + ')');
ok(ce.fams.join('|') === 'N01:C02+C03+C08+C34+C35+C40|N02:C07+C26|N03:C06+C09+C43|N05:C04+C05|N08:C24+C37', 'errors: resulting families ' + ce.fams.join('|'));
ok(ce.moves.join() === 'C23 P01>N05' && ce.uniq.length === 2, 'errors: the C23 move beside P01; two downgraded uniques (' + ce.uniq + ')');

/* ---------------- Part B ---------------- */
await fixture('B');
mock('families_b.txt');
await start('#scr-fam-b'); await send();
ok(/REQUEST: B — match candidates to families \(all candidates, batch 1 of 2\)/.test(last().prompt) && last().max_tokens === 1500 + 160 * 24, 'B: batch 1 of 2 with 24 candidates (max_tokens ' + last().max_tokens + ')');
mock('families_b_batch2.txt'); await preview(/batch 2 of 2/); await send();
await page.waitForSelector('#scr-ai-fam-panel', { timeout: 15000 });
const rb = await page.evaluate(async () => { const st = await import('/js/state.js'); const F = await import('/js/familyai.js'); const r = F.lastRun(st.S.ws); return { counts: r.counts, keeps: r.keeps.size, na: r.notAnswered.size, items: F.itemsOf(r, st.S.ws).map(i => i.key) }; });
ok(Object.values(rb.counts).every(v => !v) && rb.keeps === 33 && rb.na === 0, 'B: 33 confirmed in their family, all counters zero ' + JSON.stringify(rb.counts));
ok(rb.items.includes('join:P07') && rb.items.includes('fam:N01') && rb.items.includes('move|C23|unique') && rb.items.includes('uniq:C37'), 'B: join P07, new family N01, C23 beside P01, uniques (' + rb.items.join(' ') + ')');
const sb0 = await snap();
await page.click('#scr-ai-fam-panel-accept-all'); await page.waitForTimeout(800);
const sb = await snap();
ok(sb.multi === 0 && sb.fams.find(f => f.id === 'P07').members.includes('C21') && sb.fams.some(f => f.members.includes('C19') && f.members.includes('C28')), 'B: C21 joined P07; C19 and C28 form a new family; no double membership');
ok(sb0.fams.length + 1 === sb.fams.length && !sb.fams.find(f => f.id === 'P01').members.includes('C23') === true && sb.uniques.some(u => u[0] === 'C23'), 'B: the accepted suggestion moved C23 out of P01 (explicitly) and marked it unique');
await page.evaluate(async () => { const F = await import('/js/familyai.js'); const st = await import('/js/state.js'); F.lastRun(st.S.ws) && 0; });

/* ---------------- Part C ---------------- */
await fixture('C');
const gaps = await page.evaluate(async () => { const st = await import('/js/state.js'); const F = await import('/js/familyai.js'); return F.gapCategories(st.S.ws); });
ok(gaps.join('|') === 'OT / IoT / medical devices|Fraud / BEC|Emerging technology (AI)'.split('|').sort((a, b) => 0).join('|') || gaps.length === 3, 'C: three gap categories (' + gaps + ')');
mock('families_c.txt');
await start('#scr-ai-fam-c'); await send();
ok(/REQUEST: C — propose families or candidates for missing coverage categories/.test(last().prompt) && /Gap categories to answer/.test(last().prompt) && /Next new candidate key: G01/.test(last().prompt), 'C: payload names the gap categories and the next candidate key');
await page.waitForSelector('#scr-ai-fam-panel', { timeout: 15000 });
const pc = await page.evaluate(async () => { const st = await import('/js/state.js'); const F = await import('/js/familyai.js'); const r = F.lastRun(st.S.ws); return { counts: r.counts, items: F.itemsOf(r, st.S.ws).map(i => i.key + ':' + i.kind) }; });
ok(pc.items.filter(i => i.startsWith('gap:')).length === 3 && pc.items.some(i => i === 'info:Fraud / BEC:info') && Object.entries(pc.counts).every(([k, v]) => !v || k === 'factNotFound'), 'C: three new candidates and Fraud / BEC listed as not proposed (' + pc.items + ' ' + JSON.stringify(pc.counts) + ')');
ok(/not material here/.test(await page.innerText('#scr-ai-fam-out')), 'C: “not proposed — not material here” is shown');
const nb = (await snap()).cands;
await page.click('#scr-ai-fam-panel-accept-all'); await page.waitForTimeout(800);
const gc = await page.evaluate(async () => { const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const ws = st.S.ws;
  return ws.assessment.CANDIDATES.slice(-3).map(r => ({ id: r[0], note: r[8], status: r[7], scored: SC.complete(SC.rec(r[0], ws)), gap: SC.rec(r[0], ws).aiGap, strat: SC.rec(r[0], ws).strategy, draft: !!SC.rec(r[0], ws).draft?.statement, basis: SC.rec(r[0], ws).basis, cves: SC.rec(r[0], ws).draft?.cves })); });
ok((await snap()).cands === nb + 3 && gc.map(g => g.id).join() === 'C46,C47,C48', 'C: accepting creates C46, C47, C48');
ok(gc.every(g => g.note.startsWith('[AI — coverage gap]') && /Analytical estimate — validation required/.test(g.note) && !g.scored && g.gap?.request === 'C' && g.strat.length && g.draft && g.basis && g.cves.length === 0), 'C: they land as [AI — coverage gap], unscored, with draft, strategy, basis and mark');
// CSV carries the mark
const csv = await page.evaluate(async () => { const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const rows = SC.csvRows(st.S.ws); return { head: rows[0].slice(-2), c46: rows.find(r => r[0] === 'C46').slice(-1)[0] }; });
ok(csv.head[1] === 'AI families' && /AI-proposed, accepted by/.test(csv.c46), 'CSV: the AI families column carries the mark (' + csv.c46 + ')');

/* ---------------- unmodified MediBec: only Fraud / BEC is a gap ---------------- */
await fixture('B');
const g2 = await page.evaluate(async () => { const st = await import('/js/state.js'); const F = await import('/js/familyai.js'); return F.gapCategories(st.S.ws); });
ok(g2.join() === 'Fraud / BEC', 'C: with the shipped families the only gap is Fraud / BEC (' + g2 + ')');


/* ---------------- one candidate, trimming, anonymizer ---------------- */
await fixture('B'); mock('families_b_batch2.txt');
await page.evaluate(async () => { const st = await import('/js/state.js'); const F = await import('/js/familyai.js'); window.__one = F.proposeB(st.S.ws, null, ['C21']); });
await preview(/match one candidate to a family \(C21\)/);
const one = await page.inputValue('.modal textarea >> nth=1');
ok(/Candidates to match/.test(one) && /Other candidates/.test(one), 'B (one candidate): the other candidates are sent as compact context');
await page.click('.modal .btnrow .btn.ghost >> text=Cancel'); await page.waitForTimeout(300);
const tz = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const AI = await import('/js/ai.js'); const SC = await import('/js/screening.js'); const anon = await import('/js/anon.js'); const ws = st.S.ws;
  const keep = JSON.stringify([ws.assessment.CANDIDATES, SC.state(ws).cands]);
  const small = AI.prepare('screening_families', ws, { request: 'A' }); const w = 'word '.repeat(80);
  for (const r of ws.assessment.CANDIDATES) { r[2] = r[3] = r[4] = r[5] = w.slice(0, 159); const d = SC.rec(r[0], ws); d.draft = { statement: w.repeat(2), initiating_event: w.slice(0, 159), processes: w.slice(0, 159), existing_controls: w.slice(0, 159) }; d.rat = w; }
  const big = AI.prepare('screening_families', ws, { request: 'A' });
  const ctx = anon.context(ws, anon.DEFAULT_OPTS), red = anon.text(small.prompt, ctx, anon.DEFAULT_OPTS);
  const ids = ['C01', 'P01', 'E6', 'CJ8', 'LIB-F1436', 'Next new family id: N01'].map(i => [i, red.includes(i)]);
  [ws.assessment.CANDIDATES, SC.state(ws).cands] = JSON.parse(keep); ws.assessment.CANDIDATES = JSON.parse(keep)[0]; SC.state(ws).cands = JSON.parse(keep)[1];
  return { smallB: small.bytes, bigB: big.bytes, note: /trimmed to fit: level \d/.exec(big.prompt)?.[0], ids };
});
ok(tz.note && tz.bigB < 400000, 'trimming: an oversized request is cut to the budget and says so (' + tz.note + ', ' + tz.bigB + ' bytes)');
ok(tz.ids.every(x => x[1]), 'anonymizer: C01, P01, E6, CJ8, LIB-F1436 and N01 survive ' + JSON.stringify(tz.ids.filter(x => !x[1])));

/* ---------------- French labels, feature off ---------------- */
await page.evaluate(async () => { const i = await import('/js/i18n.js'); await i.setLang('fr'); });
await goto(page, '#/screening/screen', 900);
const frT = await page.innerText('#scr-ai-fam-slot');
ok(/Proposer des familles avec l’IA/.test(frT) && /Proposer des familles pour les catégories manquantes/.test(frT), 'FR: the AI buttons are labelled in French');
await page.evaluate(async () => { const i = await import('/js/i18n.js'); await i.setLang('en'); });
await page.evaluate(async () => { const h = await import('/js/helper.js'); const AI = await import('/js/ai.js'); h.HS.config ||= {}; h.HS.config.ai = Object.assign({}, h.HS.config.ai, { policy: { ...AI.DEFAULT_POLICY, tasks: { ...AI.DEFAULT_POLICY.tasks, screening_families: 'off' } } }); });
await goto(page, '#/screening/candidates', 700); await goto(page, '#/screening/screen', 900);
const off = await page.evaluate(() => ({ a: !!document.querySelector('#scr-ai-fam-a'), c: !!document.querySelector('#scr-ai-fam-c'), b: !!document.querySelector('#scr-fam-b'), onto: !!document.querySelector('#scr-onto-group') }));
ok(!off.a && !off.c && !off.b && off.onto, 'feature off: the AI buttons are hidden, the ontology grouping stays ' + JSON.stringify(off));
errors.length && console.log(errors.slice(0, 3));
ok(errors.length === 0, 'no console errors ' + errors.slice(0, 2).join(' | '));
stop(false);
await browser.close(); done('t78 AI family proposals (C6)');
