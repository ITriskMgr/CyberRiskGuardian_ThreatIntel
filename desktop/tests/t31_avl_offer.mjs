// 1.8.2 — P4: the opt-in re-vector of MediBec S2/S8 (AV:N → AV:L) for teaching cases only, journalled, never for a
// real organization; QC-26 covers classroom copies; the Process page offers it once and remembers the decision.
import { open, ok, done } from './lib.mjs';
import fs from 'fs';
const fx = JSON.parse(fs.readFileSync('fixtures/ws-1.5.8.json', 'utf8'));
const { browser, page, errors } = await open('#/process');
const r = await page.evaluate(async ({ fx }) => {
  const AVL = await import('/js/avl.js'); const M = await import('/js/migrate.js'); const st = await import('/js/state.js');
  const store = await import('/js/store.js'); const QC = await import('/js/panels/qc.js');
  const mig = w => M.migrateWorkspace(JSON.parse(JSON.stringify(w)), { fill: st.migrate }).ws;
  const ex = mig(fx.workspaces.find(w => w.kind === 'example')); ex.id = 'ws_avl_ex'; ex.name = 'AVL example';
  const org = mig(fx.workspaces.find(w => w.kind === 'organization')); org.id = 'ws_avl_org';
  const cls = JSON.parse(JSON.stringify(ex)); cls.id = 'ws_avl_cls'; cls.kind = 'classroom'; cls.name = 'AVL classroom'; cls.classroom = { course: 'BTM', case_title: 'MediBec', team: 'A', members: '', instructor: '', due: '', notes: '' };
  const dec = JSON.parse(JSON.stringify(ex)); dec.id = 'ws_avl_dec'; dec.name = 'AVL declined';
  const out = {};
  out.detectEx = AVL.detect(ex).map(x => x.id); out.detectCls = AVL.detect(cls).map(x => x.id); out.detectOrg = AVL.detect(org).map(x => x.id);
  out.pendingEx = AVL.pending(ex); out.pendingOrg = AVL.pending(org);
  const before = CRG.run(ex.assessment);
  const s2score = ex.assessment.SCEN.find(s => s.id === 'S2'); s2score.cvss_score = 9.4;   // a stale override must go
  const ids = AVL.accept(ex);
  const after = CRG.run(ex.assessment);
  out.accepted = ids; out.before = [Math.round(before.totals.est), Math.round(before.totals.res)]; out.after = [Math.round(after.totals.est), Math.round(after.totals.res)];
  const s2 = ex.assessment.SCEN.find(s => s.id === 'S2'), s8 = ex.assessment.SCEN.find(s => s.id === 'S8');
  out.v2 = s2.cvss; out.v8 = s8.cvss; out.note2 = s2.cvss_note; out.score2 = s2.cvss_score; out.rev2 = (s2.revisions || []).at(-1)?.what;
  out.c2 = CVSS4.score(s2.cvss); out.c8 = CVSS4.score(s8.cvss);
  const j = ex.migrationLog.at(-1); out.journal = { kind: j.kind, decision: j.decision, scenarios: j.scenarios, by: j.by };
  out.pendingAfter = AVL.pending(ex); out.decisionAfter = AVL.decision(ex); out.detectAfter = AVL.detect(ex).length;
  out.secondAccept = AVL.accept(ex);
  // declined: journalled, vectors untouched, not pending any more, QC-26 still warns
  const orgSnap = JSON.stringify(org); AVL.decline(org); out.orgUntouched = JSON.stringify(org) === orgSnap; out.orgAccept = AVL.accept(org);
  AVL.decline(dec); out.decDecision = AVL.decision(dec); out.decPending = AVL.pending(dec); out.decVec = dec.assessment.SCEN.find(s => s.id === 'S2').cvss;
  out.decTotals = [Math.round(CRG.run(dec.assessment).totals.est), Math.round(CRG.run(dec.assessment).totals.res)];
  const qc = w => QC.checks(w).find(x => x.id === 'QC-26');
  out.qcEx = qc(ex).state; out.qcCls = qc(cls).state; out.qcDec = qc(dec).state; out.qcOrg = qc(org).state; out.qcFix = qc(dec).fix;
  // store a pending classroom copy for the UI part
  await store.put('ws', cls.id, cls);
  return out;
}, { fx });
ok(r.detectEx.join() === 'S2,S8' && r.detectCls.join() === 'S2,S8', 'S2 and S8 detected on the example and on a classroom copy');
ok(!r.detectOrg.length && !r.pendingOrg && !r.orgAccept.length && r.orgUntouched, 'a real organization is never detected, offered or changed');
ok(r.pendingEx, 'the example is pending before a decision');
ok(r.accepted.join() === 'S2,S8' && /\/AV:L\//.test(r.v2) && /\/AV:L\//.test(r.v8) && r.c2 === 9.3 && r.c8 === 9.2, `accept sets AV:L: ${r.c2} / ${r.c8}`);
ok(r.before.join('/') === '84491/41104' && r.after.join('/') === '84305/41023', `engine recomputes 84,491 / 41,104 → 84,305 / 41,023 (${r.before} → ${r.after})`);
ok(r.score2 === undefined && /opened locally/.test(r.note2), 'stale score override removed, cvss_note explains AV:L');
ok(/AV:N → AV:L/.test(r.rev2 || ''), 'a revision entry per scenario');
ok(r.journal.kind === 're-vector' && r.journal.decision === 'accepted' && r.journal.scenarios.join() === 'S2,S8' && /^1\.8\./.test(r.journal.by), 'journalled in migrationLog with the release');
ok(!r.pendingAfter && r.decisionAfter === 'accepted' && r.detectAfter === 0 && !r.secondAccept.length, 'idempotent: nothing pending, a second accept changes nothing');
ok(r.decDecision === 'declined' && !r.decPending && /\/AV:N\//.test(r.decVec) && r.decTotals.join('/') === '84491/41104', 'decline: journalled, vectors and totals untouched, not offered again');
ok(r.qcEx === 'pass' && r.qcCls === 'warn' && r.qcDec === 'warn' && r.qcOrg === 'pass' && r.qcFix === 'process', 'QC-26: pass after accept, warn on classroom and declined copies, pass for an organization, opens Process');
// UI: the classroom copy shows the offer on the Process page; taking it removes the banner and the journal records it
await page.evaluate(async () => { const st = await import('/js/state.js'); await st.refreshList(); await st.select('ws_avl_cls'); });
await page.goto(page.url().split('#')[0] + '#/process'); await page.waitForTimeout(600);
ok(await page.locator('text=This teaching case still scores S2 and S8 with AV:N').count() === 1, 'Process page shows the offer for the classroom copy');
await page.click('text=Take the AV:L vectors'); await page.waitForTimeout(500);
ok(await page.locator('text=This teaching case still scores S2 and S8 with AV:N').count() === 0, 'the offer disappears once taken');
const u = await page.evaluate(async () => { const st = await import('/js/state.js'); const w = st.S.ws; const r = CRG.run(w.assessment);
  return { id: w.id, tot: [Math.round(r.totals.est), Math.round(r.totals.res)], dec: w.migrationLog.at(-1).decision, v: w.assessment.SCEN.find(s => s.id === 'S2').cvss }; });
ok(u.id === 'ws_avl_cls' && u.tot.join('/') === '84305/41023' && u.dec === 'accepted' && /AV:L/.test(u.v), `classroom copy re-vectored through the screen: ${u.tot}`);
// 1.9.0 — review findings A3–A9
const r2 = await page.evaluate(async ({ fx }) => {
  const AVL = await import('/js/avl.js'); const M = await import('/js/migrate.js'); const st = await import('/js/state.js');
  const store = await import('/js/store.js'); const QC = await import('/js/panels/qc.js');
  const mig = w => M.migrateWorkspace(JSON.parse(JSON.stringify(w)), { fill: st.migrate }).ws;
  const out = {};
  out.oneCopy = AVL.VECTORS === M.AVL_VECTORS;
  // A5: a typed score that is not the stale AV:N score is kept and recorded
  const own = mig(fx.workspaces.find(w => w.kind === 'example')); own.id = 'ws_avl_own';
  own.assessment.SCEN.find(s => s.id === 'S2').cvss_score = 8.1;
  AVL.accept(own);
  const s2 = own.assessment.SCEN.find(s => s.id === 'S2');
  out.ownScore = s2.cvss_score; out.ownRev = s2.revisions.at(-1);
  // A6: a decline is not inherited by a copy (new identifier); A3: reconsider after a decline
  const dec = mig(fx.workspaces.find(w => w.kind === 'example')); dec.id = 'ws_avl_dec2'; dec.name = 'AVL declined 2';
  AVL.decline(dec);
  const copy = JSON.parse(JSON.stringify(dec)); copy.id = 'ws_avl_copy'; copy.kind = 'classroom';
  out.copyPending = AVL.pending(copy); out.decPending = AVL.pending(dec); out.decReconsider = AVL.reconsider(dec);
  out.qcDecText = QC.checks(dec).find(x => x.id === 'QC-26').detail || JSON.stringify(QC.checks(dec).find(x => x.id === 'QC-26'));
  // A7: a read-only (newer-release) workspace is never offered and never changed
  const ro = mig(fx.workspaces.find(w => w.kind === 'example')); ro.id = 'ws_avl_ro';
  st.S.readOnly.add(ro.id);
  out.roPending = AVL.pending(ro); out.roAccept = AVL.accept(ro); out.roVec = ro.assessment.SCEN.find(s => s.id === 'S2').cvss;
  st.S.readOnly.delete(ro.id);
  await store.put('ws', dec.id, dec);
  return out;
}, { fx });
ok(r2.oneCopy, 'A9: one copy of the vector constants (avl.js re-exports migrate.js)');
ok(r2.ownScore === 8.1 && /8\.1/.test(r2.ownRev.what) && r2.ownRev.cvss_score === 8.1, 'A5: a typed score is kept and the revision records it ' + JSON.stringify(r2.ownRev));
ok(r2.copyPending && !r2.decPending && r2.decReconsider, 'A6: a copy of a declined case is offered again; A3: the declined case can reconsider');
ok(/declined on/.test(r2.qcDecText) && /reconsider/.test(r2.qcDecText), 'A3: QC-26 after a decline says the Process page lets you reconsider');
ok(!r2.roPending && !r2.roAccept.length && /\/AV:N\//.test(r2.roVec), 'A7: a read-only workspace is not offered and not changed');
await page.evaluate(async () => { const st = await import('/js/state.js'); await st.refreshList(); await st.select('ws_avl_dec2'); });
await page.goto(page.url().split('#')[0] + '#/process'); await page.waitForTimeout(600);
ok(await page.locator('#avl-reconsider').count() === 1, 'A3: Process shows "Reconsider" after a decline');
await page.click('text=Reconsider: take the AV:L vectors'); await page.waitForTimeout(500);
const u2 = await page.evaluate(async () => { const st = await import('/js/state.js'); const w = st.S.ws; return { dec: w.migrationLog.filter(e => e.kind === 're-vector').map(e => e.decision), v: w.assessment.SCEN.find(s => s.id === 'S2').cvss }; });
ok(u2.dec.join() === 'declined,accepted' && /AV:L/.test(u2.v) && await page.locator('#avl-reconsider').count() === 0, 'A3: reconsidering takes the vectors and journals a new entry');
// A4: the journal shows the decisions
await page.evaluate(() => { location.hash = '#/backup'; }); await page.waitForTimeout(800);
const jt = await page.textContent('main');
ok(/AV:L vectors declined/.test(jt) && /AV:L vectors accepted/.test(jt) && /Scenarios: S2, S8/.test(jt), 'A4: Backup → Migration journal shows the re-vector decisions');
// clean up
await page.evaluate(async () => { const store = await import('/js/store.js'); const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id); await store.del('ws', 'ws_avl_cls'); await store.del('ws', 'ws_avl_dec2'); });
ok(!errors.length, 'no console errors ' + errors.slice(0, 3).join(' | '));
await browser.close();
done('t31 AV:L offer');
