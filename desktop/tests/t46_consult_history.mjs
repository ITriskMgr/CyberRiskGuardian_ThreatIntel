// Virtual consultant — history: conversations saved per workspace (field `consultant`), the Tools view,
// Markdown export, citation as evidence (E-number), decision-log entries, proposals through the existing
// review flow (Batch scenarios), and the data-version 3 → 4 migration that adds the field, built as a list
// of sub-steps other 1.9.0 work appends to.
import { open, ok, done, reload, MOCK, URL, FIXTURES } from './lib.mjs';
import fs from 'fs';
const FX = FIXTURES;
const fx = ['1.5.4', '1.5.5', '1.5.6', '1.5.7', '1.5.8'].map(v => JSON.parse(fs.readFileSync(`${FX}/ws-${v}.json`, 'utf8')));
fs.writeFileSync(MOCK + '/consultant.txt', 'The register shows phishing as the leading cause [P1].\n\nGENERAL: Consider an insider scenario. See [[scenario:S1]].\n\n```json\n{"scenarios":[{"name":"Insider copies patient files to a personal cloud","statement":"A clinician with broad EHR access copies records to a personal cloud folder.","params":{"PbA":{"v":0.3,"why":"assumed","conf":"Low"}}}]}\n```\n');

const { browser, ctx, page, errors } = await open('#/process');

/* ---------- migration 3 → 4 ---------- */
const M = await page.evaluate(async (fx) => {
  const MIG = await import('/js/migrate.js'); const st = await import('/js/state.js'); const R = await import('/js/reset.js');
  const out = { dv: MIG.DATA_VERSION, known: MIG.KNOWN_FIELDS.includes('consultant'), factory: st.newWorkspace().consultant, group: R.GROUPS.ASSESSMENT.includes('consultant') };
  out.per = [];
  for (const f of fx) for (const w of f.workspaces) {
    const res = MIG.migrateWorkspace(JSON.parse(JSON.stringify(w)), { fill: st.migrate });
    const last = res.ws.migrationLog[res.ws.migrationLog.length - 1];
    out.per.push({ app: f.app, status: res.status, to: res.ws.dataVersion, c: res.ws.consultant, step4: last.steps.some(s => s.to === 4 && s.notes.some(n => /Virtual consultant/.test(n))) });
  }
  // a workspace at data version 3 (what 1.8.x saved): one step, numbers unchanged, original untouched
  const v4 = MIG.migrateWorkspace(JSON.parse(JSON.stringify(fx[4].workspaces.find(w => w.kind === 'example') || fx[4].workspaces[0])), { fill: st.migrate }).ws;
  const v3 = JSON.parse(JSON.stringify(v4)); v3.dataVersion = 3; delete v3.consultant; v3.migrationLog = [];
  const snap = JSON.stringify(v3);
  const r3 = MIG.migrateWorkspace(v3, { fill: st.migrate });
  const a = self.CRG.run(v3.assessment), b = self.CRG.run(r3.ws.assessment);
  out.v3 = { status: r3.status, from: r3.from, steps: r3.steps.map(s => s.from + '→' + s.to), title: r3.steps[0]?.title, c: r3.ws.consultant, untouched: JSON.stringify(v3) === snap,
    same: Math.round(a.totals.est) === Math.round(b.totals.est) && Math.round(a.totals.res) === Math.round(b.totals.res), again: MIG.migrateWorkspace(r3.ws, { fill: st.migrate }).status };
  // a v4 workspace whose consultant record is partial keeps what it holds and gains the missing keys
  const part = JSON.parse(JSON.stringify(r3.ws)); part.consultant = { conversations: [{ id: 'cv-x', title: 't', messages: [] }] };
  st.migrate(part); out.partial = { n: part.consultant.conversations.length, mode: part.consultant.retrieval };
  // another lane appends a sub-step: the same step adds its field, KNOWN_FIELDS-style lists read it
  MIG.STEP4.push({ field: 'laneTest', blank: () => ({ rows: [] }), group: 'CONTEXT', title: 'Lane test: an appended sub-step' });
  const v3b = JSON.parse(snap);
  const r4 = MIG.migrateWorkspace(v3b, { fill: st.migrate });
  out.lane = { has: JSON.stringify(r4.ws.laneTest), title: r4.steps[0].title, factory: JSON.stringify(MIG.fieldsV4().laneTest) };
  MIG.STEP4.pop();
  // the engine self-check still holds
  const s = self.CRG.run(self.CRG_SAMPLE); out.medibec = [Math.round(s.totals.est), Math.round(s.totals.res)];
  return out;
}, fx);
ok(M.dv === 7, 'DATA_VERSION is 7');
ok(M.known && M.group && M.factory && Array.isArray(M.factory.conversations) && M.factory.retrieval === 'lexical', 'consultant is a known field, in a reset group, blank in new workspaces');
for (const p of M.per) ok(p.status === 'migrated' && p.to === 7 && p.c && Array.isArray(p.c.conversations) && p.step4, `${p.app}: migrated to 7 with the consultant record, journalled`);
ok(M.v3.status === 'migrated' && M.v3.from === 3 && M.v3.steps.join() === '3→4,4→5,5→6,6→7' && /Virtual consultant/.test(M.v3.title), 'a data-version-3 workspace takes the steps 3 → 4, 4 → 5 and 5 → 6 and 6 → 7 ' + M.v3.steps);
ok(M.v3.untouched && M.v3.same && M.v3.again === 'current', 'the original is untouched, engine totals unchanged, migrating twice changes nothing');
ok(M.partial.n === 1 && M.partial.mode === 'lexical', 'a partial record keeps its conversations and gains the missing keys');
ok(M.lane.has === '{"rows":[]}' && /Lane test/.test(M.lane.title) && M.lane.factory === '{"rows":[]}', 'a sub-step appended by another lane joins the same 3 → 4 step');
ok(M.medibec[0] === 84305 && M.medibec[1] === 41023, 'MediBec self-check holds ' + M.medibec);

/* ---------- a conversation, saved with the workspace ---------- */
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id);
  const AI = await import('/js/ai.js'); AI.settings(st.S.ws).acknowledged = new Date().toISOString(); });
await page.evaluate(() => { location.hash = '#/ai/consult'; }); await page.waitForTimeout(800);
ok(await page.isVisible('#panel-ai h1 >> text=Virtual consultant'), 'Tools → Virtual consultant opens the full view');
ok(await page.isVisible('#panel-ai >> text=Settings → Knowledge base'), 'the full view links to the library');
await page.fill('#panel-ai .consult-foot textarea', 'Which scenarios drive the portfolio?');
await page.click('#panel-ai .consult-foot .btn:not(.ghost)');
await page.waitForSelector('.modal textarea', { timeout: 15000 });
await page.click('.modal .btnrow .btn:not(.ghost)');
await page.waitForSelector('#panel-ai .consult-answer', { timeout: 15000 });
ok(await page.isVisible('#panel-ai .consult-cited >> text=From your sources') && await page.isVisible('#panel-ai .consult-general >> text=General knowledge, not from your sources'), 'cited passages and general knowledge are shown apart');
ok(await page.isVisible('#panel-ai .consult-answer a[href="#/scenario/S1"]'), 'a link in the answer opens the scenario');
const before = await page.evaluate(async () => { const st = await import('/js/state.js'); return { scen: st.S.ws.assessment.SCEN.length, cand: (st.S.ws.assessment.CANDIDATES || []).length }; });
await page.click('#panel-ai >> text=/Send 1 proposed scenario/');
// 1.9.2 (decided item 7 / C3): the proposal is a screening row (array) with its draft kept on the screening record, logged pending
const after = await page.evaluate(async () => { const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const c = st.S.ws.assessment.CANDIDATES; const last = c[c.length - 1]; return { scen: st.S.ws.assessment.SCEN.length, cand: c.length, isRow: Array.isArray(last), ref: last[6], origin: SC.rec(last[0]).draft?.origin, seen: SC.candidates().at(-1).name === last[1] }; });
ok(after.scen === before.scen && after.cand === before.cand + 1 && after.isRow && after.ref === 'consultant' && after.origin === 'ai' && after.seen, 'a proposal goes to Scenario screening as a candidate row with its draft; the register is unchanged ' + JSON.stringify(after));
await page.click('#panel-ai .consult-meta >> text=Useful');
const H = await page.evaluate(async () => { const st = await import('/js/state.js'); const AI = await import('/js/ai.js'); await st.saveNow();
  const c = st.S.ws.consultant.conversations[0]; const m = c.messages[1];
  const log = AI.log().find(e => e.id === m.logId);
  return { n: st.S.ws.consultant.conversations.length, roles: c.messages.map(x => x.role).join(','), parts: m.parts.map(p => p.kind).join(','), logTask: log?.task, logDecision: log?.decision, model: m.model }; });
ok(H.n === 1 && H.roles === 'user,consultant' && H.parts === 'cited,general', 'the conversation is saved in the workspace');
ok(H.logTask === 'consultant' && H.logDecision === 'accepted', 'the AI decision log records the call and the verdict');
// survives a reload
await reload(page);
const kept = await page.evaluate(async () => { const st = await import('/js/state.js'); return st.S.ws.consultant.conversations.length; });
ok(kept === 1, 'conversations persist with the workspace');

/* ---------- history: export, evidence, delete ---------- */
await page.evaluate(() => { location.hash = '#/ai/history'; }); await page.waitForTimeout(800);
ok(await page.isVisible('#panel-ai >> text=Which scenarios drive the portfolio?'), 'the History tab lists the conversation');
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#panel-ai >> text=Export as Markdown')]);
const mdText = fs.readFileSync(await dl.path(), 'utf8');
ok(/^# Virtual consultant — /.test(mdText) && mdText.includes('**From your sources**') && mdText.includes('General knowledge, not from your sources') && mdText.includes('Analytical estimate — validation required') && /\[P1\] /.test(mdText), 'exported as Markdown with provenance and markers');
ok(dl.suggestedFilename().endsWith('.md'), 'a .md file');
await page.click('#panel-ai >> text=Cite as evidence'); await page.waitForTimeout(400);
const ev = await page.evaluate(async () => { const st = await import('/js/state.js'); const c = st.S.ws.consultant.conversations[0]; const row = st.S.ws.assessment.EVIDENCE.find(r => r[0] === c.evidence);
  return { id: c.evidence, row }; });
ok(/^E\d+$/.test(ev.id) && ev.row && /Virtual consultant/.test(ev.row[1]) && ev.row[5] === 'assumption' && /Analytical estimate/.test(ev.row[3]), 'cited as evidence with an E-number, classified as an assumption ' + ev.id);
ok(await page.isVisible(`#panel-ai >> text=${ev.id}`), 'the History tab shows the E-number');
page.once('dialog', d => d.accept());
await page.click('#panel-ai >> text=Delete'); await page.waitForTimeout(400);
const del = await page.evaluate(async () => { const st = await import('/js/state.js'); const AI = await import('/js/ai.js'); return { n: st.S.ws.consultant.conversations.length, log: AI.log().filter(e => e.task === 'consultant').length }; });
ok(del.n === 0 && del.log >= 1, 'deleting a conversation keeps the decision log');
// reset: the assessment scope clears the conversations, never the AI log
const rs = await page.evaluate(async () => { const R = await import('/js/reset.js'); const st = await import('/js/state.js');
  const w = structuredClone(st.S.ws); w.consultant.conversations.push({ id: 'cv-r', title: 'r', messages: [] }); R.apply(w, 'assessment'); return { n: w.consultant?.conversations?.length || 0, log: (w.ai?.log || []).length }; });
ok(rs.n === 0 && rs.log >= 1, 'resetting the assessment clears conversations and keeps the AI log');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t46 consultant history');
