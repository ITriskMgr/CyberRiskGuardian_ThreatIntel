// Identity, privilege & configuration — Import from a report: CSV rules counts, AI to the local mock by default with the preview,
// remote needs the tick, confidential asks every call, and sentinel names, e-mails and keys never land anywhere stored.
import { open, ok, done } from './lib.mjs';
import { ipcOn, goto } from './ipc_lib.mjs';
import fs from 'fs';
const SENT = /sentinel|AKIAZZ|CORP\\\\zz/i;
const { browser, page, errors } = await open('#/process');
await ipcOn(page);
await page.evaluate(async () => { const st = await import('/js/state.js'); await st.create(st.newWorkspace({ name: 'Import test' })); const I = await import('/js/ipc.js'); I.reg(st.S.ws).settings.asOf = '2026-11-01'; });
await goto(page, '#/ipc/import', 700);
await page.setInputFiles('#ipc-file', 'fixtures/ipc-accounts.csv'); await page.waitForTimeout(700);
ok(await page.isVisible('#ipc-rules'), 'CSV: rules offered');
const cols = await page.$$eval('#panel-ipc select[data-col]', s => Object.fromEntries(s.map(x => [x.dataset.col, x.value])));
ok(cols.type === '2' && cols.enabled === '3' && cols.lastSignIn === '4' && cols.mfa === '5' && cols.mfaMethod === '6' && cols.owner === '7' && cols.tier === '8', 'columns guessed ' + JSON.stringify(cols));
await page.click('#ipc-rules'); await page.waitForTimeout(400);
const items = await page.evaluate(async () => (await import('/js/panels/ipc.js'))._imp.items);
const emp = items.find(i => i.type === 'employee'), svc = items.find(i => i.type === 'service'), con = items.find(i => i.type === 'contractor');
ok(emp.count === 4 && emp.mfa === 3 && emp.mfaPR === 2 && emp.dormant === 1 && emp.ownerless === 0, 'employees: 4 enabled, 3 MFA, 2 phishing-resistant, 1 dormant ' + JSON.stringify(emp));
ok(svc.count === 2 && svc.mfa === null && svc.dormant === 1 && svc.ownerless === 1, 'service: 2, no MFA count, 1 dormant, 1 ownerless ' + JSON.stringify(svc));
ok(con.count === 1 && con.mfa === 1 && con.mfaPR === 0, 'contractor counted');
const tiers = items.filter(i => i.register === 'privileged').map(i => `${i.tier}:${i.holders}/${i.mfa}/${i.mfaPR}`);
ok(JSON.stringify(tiers) === '["0:1/1/1","1:1/1/1","2:1/1/0"]', 'privileged by tier ' + tiers);
await page.click('#ipc-accept'); await page.waitForTimeout(500);
let ws = await page.evaluate(async () => (await import('/js/state.js')).S.ws);
ok(ws.ipc.accounts.length === 3 && ws.ipc.privileged.length === 3 && ws.ipc.accounts.every(r => r.prov.method === 'rules' && r.prov.file === 'ipc-accounts.csv'), 'accepted rows carry provenance');
const imp = ws.ipc.imports[0];
ok(imp && /^[0-9a-f]{64}$/.test(imp.sha256) && imp.rows === 8 && imp.bytes > 0 && imp.method === 'rules' && imp.accepted === 6, 'import trace: SHA-256, rows, bytes ' + JSON.stringify(imp).slice(0, 160));
ok(await page.evaluate(async () => (await import('/js/panels/ipc.js'))._imp.text === ''), 'file released after Accept');
// AI: local by default, preview shown
await page.setInputFiles('#ipc-file', 'fixtures/ipc-report.txt'); await page.waitForTimeout(600);
ok(/this machine/.test(await page.textContent('#ipc-ai-box')), 'AI routed to the local model by default');
ok(/[1-9]/.test(await page.locator('#ipc-ai-box .kpi').nth(1).textContent()), 'personal-data-like tokens counted');
await page.click('#ipc-ai'); await page.waitForSelector('.modal textarea');
ok(await page.isVisible('.modal >> text=Apply the anonymizer'), 'payload preview with the anonymizer');
await page.click('.modal .btnrow .btn:not(.ghost)'); await page.waitForTimeout(800);
const ai = await page.evaluate(async () => (await import('/js/panels/ipc.js'))._imp);
ok(ai.items.length === 3 && ai.dropped >= 2 && !JSON.stringify(ai.items).match(/sentinel/i), 'AI answer: whitelisted counts kept, names and e-mails dropped ' + JSON.stringify(ai.items).slice(0, 200));
const last = JSON.parse(fs.readFileSync('/home/claude/tmp/mock-ipc/_last.json', 'utf8'));
ok(/^TASK: extract_s_ipc/.test(last.prompt) && /AGGREGATE COUNTS ONLY/.test(last.prompt), 'the request names the task and asks for counts only');
await page.click('#ipc-accept'); await page.waitForTimeout(500);
// remote routing needs the tick
await page.evaluate(async () => { const h = await import('/js/helper.js'); h.HS.config = { ...(h.HS.config || {}), ai: { policy: { tasks: { extract_sensitive: 'remote' } } } }; });
await page.setInputFiles('#ipc-file', 'fixtures/ipc-report.txt'); await page.waitForTimeout(600);
ok(await page.isDisabled('#ipc-ai') && await page.isVisible('#ipc-remote-ok'), 'remote: send disabled until the tick');
await page.check('#ipc-remote-ok'); ok(await page.isEnabled('#ipc-ai'), 'remote: enabled after the tick');
// confidential: every call is confirmed
await page.evaluate(async () => { const h = await import('/js/helper.js'); h.HS.config.ai.policy.tasks.extract_sensitive = 'local'; const AI = await import('/js/ai.js'); AI.settings().confidential = true; AI.settings().acknowledged = new Date().toISOString(); });
for (let i = 0; i < 2; i++) {
  await goto(page, '#/ipc/overview', 300); await goto(page, '#/ipc/import', 500);
  await page.setInputFiles('#ipc-file', 'fixtures/ipc-report.txt'); await page.waitForTimeout(600);
  await page.click('#ipc-ai'); await page.waitForSelector('.modal textarea');
  ok(await page.isVisible('.modal >> text=Confirm and send') && await page.isVisible('.modal >> text=This workspace is marked confidential'), `confidential workspace: call ${i + 1} confirmed`);
  await page.click('.modal .btnrow .btn:not(.ghost)'); await page.waitForTimeout(700);
  await page.click('#ipc-accept'); await page.waitForTimeout(400);
}
// sentinels: nowhere in what is stored
await page.waitForTimeout(800);
const stored = await page.evaluate(async () => {
  const st = await import('/js/state.js'); await st.saveNow(); const ws = st.S.ws;
  const dump = {};
  for (const name of (await indexedDB.databases()).map(d => d.name)) {
    const db = await new Promise((res, rej) => { const r = indexedDB.open(name); r.onsuccess = () => res(r.result); r.onerror = rej; });
    for (const s of db.objectStoreNames) dump[name + '/' + s] = await new Promise(res => { const r = db.transaction(s).objectStore(s).getAll(); r.onsuccess = () => res(JSON.stringify(r.result)); r.onerror = () => res(''); });
    db.close();
  }
  return { ws: JSON.stringify(ws), importLog: JSON.stringify(ws.importLog), ailog: JSON.stringify(ws.ai?.log || []), imports: JSON.stringify(ws.ipc.imports), docs: ws.docs.length, dump, ls: JSON.stringify(localStorage) };
});
ok(!SENT.test(stored.ws), 'no sentinel in the workspace JSON');
ok(!SENT.test(stored.importLog) && stored.importLog === '[]' && stored.docs === 0, 'nothing in importLog or the context documents');
ok(!SENT.test(stored.ailog) && JSON.parse(stored.ailog).length === 3, 'AI log holds no report text (3 calls logged)');
ok(!SENT.test(stored.imports), 'no sentinel in ipc.imports');
const leaks = Object.entries(stored.dump).filter(([, v]) => SENT.test(v)).map(([k]) => k);
ok(!leaks.length && Object.keys(stored.dump).length > 0, 'no sentinel in any IndexedDB store (' + Object.keys(stored.dump).length + ' stores) ' + leaks);
ok(!SENT.test(stored.ls), 'none in localStorage');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t38 ipc import');
