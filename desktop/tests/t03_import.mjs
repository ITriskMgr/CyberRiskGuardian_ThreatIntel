import { open, ok, done, URL } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await page.evaluate(async () => {
  const st = await import('/js/state.js'); const store = await import('/js/store.js');
  const w = st.newWorkspace({ name: 'Import test' });
  w.docs = [{ id: 'doc-i1', name: 'old.txt', category: 'Business case', words: 20, added: '2026-10-01' },
            { id: 'doc-i2', name: 'inventory.txt', category: 'Asset inventory / CMDB extract', words: 30, added: '2026-10-09' }];
  await store.put('blob', 'doc:doc-i1', 'Acme Clinic. Mission: outpatient care in Montreal. Regulations: Quebec Law 25.');
  await store.put('blob', 'doc:doc-i2', 'Asset inventory. Electronic health record (EHR) server owned by IT. PACS imaging system. Billing application. Active Directory domain controller. Firewall.');
  await st.create(w);
  const IU = await import('/js/panels/importui.js'); IU.markFresh(['doc-i2']);
});
await page.evaluate(() => { location.hash = '#/org/import'; }); await page.waitForTimeout(800);
ok(await page.isVisible('text=1. Documents to read'), 'import tab renders');
ok(await page.isVisible('[role=tab]:has-text("Import from documents")'), 'tab present in Organization');
const checks = await page.$$eval('#panel-org table tbody tr td.cb input', xs => xs.slice(0, 2).map(x => x.checked));
ok(checks[0] === false && checks[1] === true, 'only the new document is preselected ' + JSON.stringify(checks));
// keep only profile + assets targets
await page.evaluate(async () => { const IU = await import('/js/panels/importui.js'); IU.preselect(['assets'], 'rules'); });
// untick crown (row 2 of target table) – find target table checkboxes
const tgtBoxes = await page.$$('#import-card tbody td.cb input');
if (await tgtBoxes[1].isChecked()) await tgtBoxes[1].uncheck();
if (!(await tgtBoxes[0].isChecked())) await tgtBoxes[0].check();
await page.selectOption('#import-card select', 'rules');
await page.click('#import-card button:has-text("Start the import")');
// method chooser for the profile
await page.click('.modal button:has-text("Rules only")');
await page.waitForSelector('.modal:has-text("Review the extracted profile")');
const corpusDocs = await page.evaluate(async () => (await import('/js/extractor.js')).scope());
ok(JSON.stringify(corpusDocs) === '["doc-i2"]', 'scope limited to the new document');
await page.click('.modal button:has-text("Put ticked values in the form")');
await page.click('.modal button:has-text("Save the profile and continue")');
// the import run starts on its own
await page.waitForSelector('.modal:has-text("Information assets")', { timeout: 8000 });
ok(true, 'import continues automatically after the profile');
const addBtn = await page.$('.modal button:has-text("Add ticked")');
if (addBtn) await addBtn.click(); else await page.click('.modal button:has-text("Continue")');
await page.waitForSelector('text=Import summary', { timeout: 8000 });
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const P = await import('/js/process.js'); const X = await import('/js/extractor.js');
  const ws = st.S.ws;
  return { log: ws.importLog.map(e => [e.section, e.docs]), plan: ws.importPlan, step: P.partsOf(P.STEP.setup, ws).filter(p => p.optional).every(p => p.ok) ? 'done' : 'todo',
    marks: ws.docs.map(d => (d.extracted || []).map(x => x.into)), scope: X.scope(), n: P.STEPS.length, n4: P.STEPS[0].id, n19: P.STEPS[18].n, last: P.STEPS[19].n };
});
ok(r.log.length >= 1 && r.log[0][0] === 'assets' && JSON.stringify(r.log[0][1]) === '["doc-i2"]', 'import log records target and documents ' + JSON.stringify(r.log));
ok(JSON.stringify(r.plan) === '["assets"]', 'import plan saved');
ok(r.step === 'done', 'Process step 1: the import plan parts are ticked once reviewed: ' + r.step);
ok(r.marks[0].length === 0, 'old document not marked');
ok(r.scope === null, 'scope cleared at the end');
ok(r.n === 20 && r.n4 === 'setup' && r.n19 === 19 && r.last === 'R', 'nineteen numbered steps then the Report step');
await page.goto(URL + '#/process'); await page.waitForTimeout(600);
ok(await page.isVisible('text=Build the evidence register'), 'process shows step 1 — the evidence register');
ok(await page.isVisible('text=nineteen numbered steps in seven groups'), 'lede says nineteen steps');
await page.evaluate(() => { document.getElementById('process-all').open = true; });   // 1.9.0 Atlas: the step cards sit behind "All nineteen steps"
ok(await page.isVisible('text=Reviewed: Information assets'), 'the import plan is listed under step 1');
ok(errors.length === 0, 'no console error: ' + errors.join(' | '));
await browser.close(); done('t03 import from documents');
