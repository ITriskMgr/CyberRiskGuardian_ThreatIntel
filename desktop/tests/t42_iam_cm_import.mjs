// Identity & access management and Configuration management — Import from a report: IAM CSV rules counts, AI to the local mock by default
// with the preview, remote needs the tick, confidential asks every call; CM by AI only (scope and change counts, its own task and record);
// sentinel names, e-mails and keys never land anywhere stored.
import { open, ok, done, MOCK, modulesOn, goto } from './lib.mjs';
const FIX = f => new URL('./fixtures/' + f, import.meta.url).pathname;
import fs from 'fs';
const SENT = /sentinel|AKIAZZ|CORP\\\\zz/i;
const { browser, page, errors } = await open('#/process');
await modulesOn(page);
await page.evaluate(async () => { const st = await import('/js/state.js'); await st.create(st.newWorkspace({ name: 'Import test' })); const I = await import('/js/iam.js'); I.reg(st.S.ws).settings.asOf = '2026-11-01'; });
await goto(page, '#/iam/import', 700);
await page.setInputFiles('#iam-file', FIX('iam-accounts.csv')); await page.waitForTimeout(700);
ok(await page.isVisible('#iam-rules'), 'CSV: rules offered');
const cols = await page.$$eval('#panel-iam select[data-col]', s => Object.fromEntries(s.map(x => [x.dataset.col, x.value])));
ok(cols.type === '2' && cols.enabled === '3' && cols.lastSignIn === '4' && cols.mfa === '5' && cols.mfaMethod === '6' && cols.owner === '7' && cols.tier === '8', 'columns guessed ' + JSON.stringify(cols));
await page.click('#iam-rules'); await page.waitForTimeout(400);
const items = await page.evaluate(async () => (await import('/js/panels/iam.js'))._imp.items);
const emp = items.find(i => i.type === 'employee'), svc = items.find(i => i.type === 'service'), con = items.find(i => i.type === 'contractor');
ok(emp.count === 4 && emp.mfa === 3 && emp.mfaPR === 2 && emp.dormant === 1 && emp.ownerless === 0, 'employees: 4 enabled, 3 MFA, 2 phishing-resistant, 1 dormant ' + JSON.stringify(emp));
ok(svc.count === 2 && svc.mfa === null && svc.dormant === 1 && svc.ownerless === 1, 'service: 2, no MFA count, 1 dormant, 1 ownerless ' + JSON.stringify(svc));
ok(con.count === 1 && con.mfa === 1 && con.mfaPR === 0, 'contractor counted');
const tiers = items.filter(i => i.register === 'privileged').map(i => `${i.tier}:${i.holders}/${i.mfa}/${i.mfaPR}`);
ok(JSON.stringify(tiers) === '["0:1/1/1","1:1/1/1","2:1/1/0"]', 'privileged by tier ' + tiers);
await page.click('#iam-accept'); await page.waitForTimeout(500);
let ws = await page.evaluate(async () => (await import('/js/state.js')).S.ws);
ok(ws.iam.accounts.length === 3 && ws.iam.privileged.length === 3 && ws.iam.accounts.every(r => r.prov.method === 'rules' && r.prov.file === 'iam-accounts.csv'), 'accepted rows carry provenance');
const imp = ws.iam.imports[0];
ok(imp && /^[0-9a-f]{64}$/.test(imp.sha256) && imp.rows === 8 && imp.bytes > 0 && imp.method === 'rules' && imp.accepted === 6, 'import trace: SHA-256, rows, bytes ' + JSON.stringify(imp).slice(0, 160));
ok(await page.evaluate(async () => (await import('/js/panels/iam.js'))._imp.text === ''), 'file released after Accept');
// AI: local by default, preview shown
await page.setInputFiles('#iam-file', FIX('iam-report.txt')); await page.waitForTimeout(600);
ok(/this machine/.test(await page.textContent('#iam-ai-box')), 'AI routed to the local model by default');
ok(/[1-9]/.test(await page.locator('#iam-ai-box .kpi').nth(1).textContent()), 'personal-data-like tokens counted');
await page.click('#iam-ai'); await page.waitForSelector('.modal textarea');
ok(await page.isVisible('.modal >> text=Apply the anonymizer'), 'payload preview with the anonymizer');
await page.click('.modal .btnrow .btn:not(.ghost)'); await page.waitForTimeout(800);
const ai = await page.evaluate(async () => (await import('/js/panels/iam.js'))._imp);
ok(ai.items.length === 3 && ai.dropped >= 2 && !JSON.stringify(ai.items).match(/sentinel/i), 'AI answer: whitelisted counts kept, names and e-mails dropped ' + JSON.stringify(ai.items).slice(0, 200));
const last = JSON.parse(fs.readFileSync(MOCK + '/_last.json', 'utf8'));
ok(/^TASK: extract_s_iam/.test(last.prompt) && /AGGREGATE COUNTS ONLY/.test(last.prompt) && /- accounts:/.test(last.prompt) && !/- ciScopes:/.test(last.prompt), 'the request names the IAM task and asks for identity counts only');
await page.click('#iam-accept'); await page.waitForTimeout(500);
// remote routing needs the tick
await page.evaluate(async () => { const h = await import('/js/helper.js'); h.HS.config = { ...(h.HS.config || {}), ai: { policy: { tasks: { extract_sensitive: 'remote' } } } }; });
await page.setInputFiles('#iam-file', FIX('iam-report.txt')); await page.waitForTimeout(600);
ok(await page.isDisabled('#iam-ai') && await page.isVisible('#iam-remote-ok'), 'remote: send disabled until the tick');
await page.check('#iam-remote-ok'); ok(await page.isEnabled('#iam-ai'), 'remote: enabled after the tick');
// confidential: every call is confirmed
await page.evaluate(async () => { const h = await import('/js/helper.js'); h.HS.config.ai.policy.tasks.extract_sensitive = 'local'; const AI = await import('/js/ai.js'); AI.settings().confidential = true; AI.settings().acknowledged = new Date().toISOString(); });
for (let i = 0; i < 2; i++) {
  await goto(page, '#/iam/overview', 300); await goto(page, '#/iam/import', 500);
  await page.setInputFiles('#iam-file', FIX('iam-report.txt')); await page.waitForTimeout(600);
  await page.click('#iam-ai'); await page.waitForSelector('.modal textarea');
  ok(await page.isVisible('.modal >> text=Confirm and send') && await page.isVisible('.modal >> text=This workspace is marked confidential'), `confidential workspace: call ${i + 1} confirmed`);
  await page.click('.modal .btnrow .btn:not(.ghost)'); await page.waitForTimeout(700);
  await page.click('#iam-accept'); await page.waitForTimeout(400);
}
// Configuration management: no column rules, AI only, its own task, registers and import trace
await goto(page, '#/cm/import', 600);
await page.setInputFiles('#cm-file', FIX('iam-accounts.csv')); await page.waitForTimeout(600);
ok(!(await page.isVisible('#cm-rules')) && await page.isVisible('#cm-ai'), 'CM: no column rules for a table, the AI request only');
await goto(page, '#/cm/overview', 300); await goto(page, '#/cm/import', 500);
await page.setInputFiles('#cm-file', FIX('cm-report.txt')); await page.waitForTimeout(600);
ok(/this machine/.test(await page.textContent('#cm-ai-box')) && /[1-9]/.test(await page.locator('#cm-ai-box .kpi').nth(1).textContent()), 'CM: local model by default, tokens counted');
await page.click('#cm-ai'); await page.waitForSelector('.modal textarea');
ok(await page.isVisible('.modal >> text=Confirm and send'), 'CM: the confidential workspace confirms the call');
await page.click('.modal .btnrow .btn:not(.ghost)'); await page.waitForTimeout(800);
const cai = await page.evaluate(async () => (await import('/js/panels/cm.js'))._imp);
ok(cai.items.length === 3 && cai.items.every(i => ['ciScopes', 'changes'].includes(i.register)) && cai.dropped >= 3 && !JSON.stringify(cai.items).match(/sentinel/i), 'CM AI answer: scope and change counts kept; accounts, hosts and e-mails dropped ' + JSON.stringify(cai.items).slice(0, 220));
const lastCm = JSON.parse(fs.readFileSync(MOCK + '/_last.json', 'utf8'));
ok(/^TASK: extract_s_cm/.test(lastCm.prompt) && /- ciScopes:/.test(lastCm.prompt) && !/- accounts:/.test(lastCm.prompt), 'the request names the CM task and asks for configuration counts only');
await page.click('#cm-accept'); await page.waitForTimeout(500);
const cws = await page.evaluate(async () => { const w = (await import('/js/state.js')).S.ws; return { cs: w.cm.ciScopes.map(r => `${r.inScope}/${r.assigned}/${r.assessed}/${r.compliant}|${r.prov.method}`), ch: w.cm.changes.map(r => `${r.type}:${r.count}/${r.verified}`), imp: w.cm.imports.map(t => `${t.file}|${t.method}|${t.accepted}`), iamImp: w.iam.imports.length, iamCs: 'ciScopes' in w.iam }; });
ok(cws.cs.join() === '120/110/100/90|ai' && cws.ch.join() === 'emergency:6/4,unauthorized_suspected:1/0' && cws.imp.join() === 'cm-report.txt|ai|3' && cws.iamImp === 4 && !cws.iamCs, 'CM counts and import trace in the cm record only ' + JSON.stringify(cws));
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
  return { ws: JSON.stringify(ws), importLog: JSON.stringify(ws.importLog), ailog: JSON.stringify(ws.ai?.log || []), imports: JSON.stringify([ws.iam.imports, ws.cm.imports]), docs: ws.docs.length, dump, ls: JSON.stringify(localStorage) };
});
ok(!SENT.test(stored.ws), 'no sentinel in the workspace JSON');
ok(!SENT.test(stored.importLog) && stored.importLog === '[]' && stored.docs === 0, 'nothing in importLog or the context documents');
ok(!SENT.test(stored.ailog) && JSON.parse(stored.ailog).length === 4, 'AI log holds no report text (4 calls logged) ' + JSON.parse(stored.ailog).length);
ok(!SENT.test(stored.imports), 'no sentinel in iam.imports or cm.imports');
const leaks = Object.entries(stored.dump).filter(([, v]) => SENT.test(v)).map(([k]) => k);
ok(!leaks.length && Object.keys(stored.dump).length > 0, 'no sentinel in any IndexedDB store (' + Object.keys(stored.dump).length + ' stores) ' + leaks);
ok(!SENT.test(stored.ls), 'none in localStorage');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t42 iam cm import');
