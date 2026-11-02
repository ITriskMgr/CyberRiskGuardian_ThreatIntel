import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open();
const r = await page.evaluate(async () => {
  const { S, create, newWorkspace, medibecWorkspace } = await import('/js/state.js');
  const P = await import('/js/process.js');
  const R = await import('/js/reset.js');
  // 1.8.0 — step 2 holds the context and the crown jewels as two parts (they were steps 2 and 3)
  const st = () => { const o = Object.fromEntries(P.statuses(S.ws).map(x => [x.s.id, x.st])); const p = P.partsOf(P.STEP.context, S.ws);
    o.context = p[0].ok ? 'done' : 'todo'; o.assets = p[1].ok ? 'done' : 'todo'; return o; };
  const out = {};
  // 1. the bundled example
  const { select, refreshList } = await import('/js/state.js');
  // the first-run seeding may still be writing the example when the page reports ready
  const ex = S.list.find(w => w.kind === 'example') || (await (async () => { await new Promise(r => setTimeout(r, 1000)); await refreshList(); return S.list.find(w => w.kind === 'example'); })());
  await select(ex.id);
  out.exBefore = st();
  out.restore = await R.restoreTeaching(S.ws.id);
  out.exAfter = st();
  out.exName = S.ws.org.name; out.exScen = S.ws.assessment.SCEN.length;
  // 2. a classroom case with a recorded baseline that holds a filled profile and crown jewels
  const c = medibecWorkspace(); c.id = 'ws-test-class'; c.name = 'Class test'; c.kind = 'classroom';
  c.classroom = { course: 'X' }; c.docs = [{ id: 'doc-t1', name: 'case.txt', type: 'Business case' }];
  await (await import('/js/store.js')).put('blob', 'doc:doc-t1', 'MediBec case text');
  c.assets = [{ id: 'a1', name: 'EHR' }];
  await create(c);
  await R.captureBaseline(S.ws);
  out.clBefore = st();
  await R.restoreTeaching(S.ws.id);
  out.clAfter = st(); out.clDocs = S.ws.docs.length; out.clName = S.ws.org.name;
  // 3. instructor chooses to keep step 3
  S.ws.teaching = { redo: ['context'] };
  S.ws.assessment.CROWN = [{ name: 'EHR' }, { name: 'PACS' }, { name: 'Billing' }];
  await R.captureBaseline(S.ws);
  await R.restoreTeaching(S.ws.id);
  out.cl2 = st(); out.cl2Redo = S.ws.teaching?.redo;
  // 4. the field-group invariant: every field of a populated workspace belongs to a group
  const all = new Set(Object.values(R.GROUPS).flat());
  out.orphans = Object.keys(S.ws).filter(k => k !== 'assessment' && !all.has(k));
  return out;
});
ok(r.exBefore.context === 'done' || r.exBefore.context === 'partial', 'example starts with a profile');
ok(r.exAfter.context === 'todo', 'example: step 2 not done after start over (' + r.exAfter.context + ')');
ok(r.exAfter.assets === 'todo', 'example: step 2 (crown jewels) not done after start over (' + r.exAfter.assets + ')');
ok(r.exName === 'MediBec (fictional)', 'example keeps the organization name');
ok(r.exScen === 30, 'example keeps its scenarios');
ok(r.clBefore.context !== 'todo' && r.clBefore.assets === 'done', 'classroom baseline holds both parts of step 2');
ok(r.clAfter.context === 'todo' && r.clAfter.assets === 'todo', 'classroom: both parts of step 2 reset ' + JSON.stringify(r.clAfter));
ok(r.clAfter.setup === 'done' && r.clDocs === 1, 'classroom: step 1 and documents kept');
ok(r.cl2.context === 'todo' && r.cl2.assets === 'done', 'instructor choice honoured ' + JSON.stringify(r.cl2));
ok(JSON.stringify(r.cl2Redo) === '["context"]', 'redo choice survives start over');
ok(r.orphans.length === 0, 'no workspace field outside a reset group: ' + r.orphans);
ok(errors.length === 0, 'no console error: ' + errors.join(' | '));
await browser.close(); done('t01 reset');
