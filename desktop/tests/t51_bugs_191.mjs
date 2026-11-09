// 1.9.1 — the four bugs found in author testing on 3–4 November 2026.
// B1 "This workspace" AI settings stick (Settings → AI and after a reload);
// B2 Start the import with a single target opens its review (no redraw was triggered when already on the screen);
// B3 a "Local model only" feature goes to the local provider that was set up (first passed connection test, or the
//    default chosen in Settings → AI), not to the generic "Other local model"; same for the remote side;
// B4 a workspace created, switched or deleted from the screens reopens the application on it: no screen keeps
//    the previous workspace (MediBec) in memory.
import { open, ok, done, FEEDS, clickAndReopen } from './lib.mjs';
import fs from 'fs';
import path from 'path';
// 1.9.2 (NV-069) — the suite sets its own AI configuration: whatever a previous run or a person left in crg-config.json
// (a model name, a default provider, connection tests) is cleared, so the routing checks below start from a known state.
try { const f = path.join(FEEDS, 'crg-config.json'); const c = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; c.ai = {}; fs.mkdirSync(FEEDS, { recursive: true }); fs.writeFileSync(f, JSON.stringify(c)); } catch { /* no configuration yet */ }

const { browser, page, errors } = await open('#/process');
const ready = async (ms = 20000) => {
  const end = Date.now() + ms;
  for (;;) {
    try { if (await page.evaluate(async () => { const m = await import('/js/state.js'); return !!m.S.ws && !![...document.querySelectorAll('main > section')].find(s => !s.hidden)?.querySelector('h1'); })) return; }
    catch { /* the page is reloading */ }
    if (Date.now() > end) throw new Error('page not ready'); await page.waitForTimeout(250);
  }
};
const visible = () => page.evaluate(() => [...document.querySelectorAll('main > section')].find(s => !s.hidden)?.innerText || '');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example' && /MediBec/.test(w.name)); await st.select(ex.id); });

/* ---------- B1 ---------- */
await page.evaluate(() => { location.hash = '#/settings/ai'; }); await page.waitForTimeout(1500);
const cardSel = '#panel-settings .card:has(h2:has-text("This workspace"))';
await page.check(`${cardSel} label:has-text("Treat as confidential") input`);
await page.waitForTimeout(400);
await page.check(`${cardSel} label:has-text("Anonymize before sending") input`);
await page.waitForTimeout(400);
const provSel = page.locator(`${cardSel} select`).first();
await provSel.selectOption('ollama');
await page.waitForTimeout(600);
let a = await page.evaluate(async () => { const AI = await import('/js/ai.js'); const s = AI.settings(); return { c: s.confidential, an: s.anon, p: s.provider }; });
ok(a.c === true && a.an === true && a.p === 'ollama', 'B1: confidential, anonymize and the provider stick on Settings → AI ' + JSON.stringify(a));
await page.evaluate(async () => { const st = await import('/js/state.js'); await st.saveNow(); });
await page.reload(); await ready();
a = await page.evaluate(async () => { const AI = await import('/js/ai.js'); const s = AI.settings(); return { c: s.confidential, an: s.anon, p: s.provider }; });
ok(a.c === true && a.an === true && a.p === 'ollama', 'B1: and after a reload ' + JSON.stringify(a));
const same = await page.evaluate(async () => { const AI = await import('/js/ai.js'); const st = await import('/js/state.js'); return AI.settings(st.S.ws) === st.S.ws.ai && AI.settings(st.S.ws) === AI.settings(st.S.ws); });
ok(same, 'B1: settings() returns the workspace object itself, never a copy');
await page.evaluate(async () => { const AI = await import('/js/ai.js'); const st = await import('/js/state.js'); Object.assign(AI.settings(), { confidential: false, anon: false, provider: 'claude' }); st.touch(); await st.saveNow(); });

/* ---------- B3 ---------- */
const def0 = await page.evaluate(async () => { const AI = await import('/js/ai.js'); return { l: AI.localDefault(), r: AI.remoteDefault() }; });
ok(def0.l === 'local' && def0.r === 'claude', 'B3: with nothing tested, the historical defaults ' + JSON.stringify(def0));
const tested = await page.evaluate(async () => { const H = await import('/js/helper.js');
  const r = await fetch('/api/ai/test', { method: 'POST', headers: await H.headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ provider: 'lmstudio' }) });
  const out = await r.json(); await H.loadConfig(); return { ok: out.ok, tested: H.HS.config.ai?.tested || {} }; });
ok(tested.ok && tested.tested.lmstudio, 'B3: a passed connection test is recorded by the helper ' + JSON.stringify(tested.tested));
const route1 = await page.evaluate(async () => { const AI = await import('/js/ai.js'); const r = AI.route('link_vulns'); return { p: r.provider, l: AI.localDefault() }; });
ok(route1.p === 'lmstudio' && route1.l === 'lmstudio', 'B3: a "Local model only" feature goes to the tested local provider ' + JSON.stringify(route1));
// a page save cannot drop or forge the helper's record
const kept = await page.evaluate(async () => { const H = await import('/js/helper.js'); H.HS.config.ai = { ...H.HS.config.ai, tested: { local: '2020-01-01' } }; await H.saveConfig(); await H.loadConfig(); return H.HS.config.ai.tested; });
ok(kept.lmstudio && !kept.local, 'B3: ai.tested is written by the helper only ' + JSON.stringify(kept));
const kept2 = await page.evaluate(async () => { const H = await import('/js/helper.js');
  for (const config of [{}, { ai: null }]) await fetch('/api/config', { method: 'POST', headers: await H.headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ config }) });
  await H.loadConfig(); return H.HS.config.ai?.tested || {}; });
ok(kept2.lmstudio, 'B3: a configuration posted without "ai" (or with a null one) keeps the record ' + JSON.stringify(kept2));
const failed = await page.evaluate(async () => { const H = await import('/js/helper.js');
  await fetch('/api/ai/test', { method: 'POST', headers: await H.headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ provider: 'nosuch' }) });
  await H.loadConfig(); return Object.keys(H.HS.config.ai?.tested || {}); });
ok(failed.includes('lmstudio'), 'B3: an unknown provider changes nothing in the record');
// an explicit default wins
await page.evaluate(() => { location.hash = '#/settings/ai'; }); await page.waitForTimeout(1500);
ok(await page.isVisible('#panel-settings h2:has-text("Default providers")'), 'B3: Settings → AI shows the default providers');
const localSel = page.locator('#panel-settings .card:has(h2:has-text("Default providers")) select').first();
await localSel.selectOption('ollama'); await page.waitForTimeout(800);
const route2 = await page.evaluate(async () => { const AI = await import('/js/ai.js'); return AI.route('link_vulns').provider; });
ok(route2 === 'ollama', 'B3: the default local provider chosen in Settings wins ' + route2);
ok(/Ollama/.test(await page.textContent('#panel-settings .card:has(h2:has-text("Default providers"))')), 'B3: the card says which provider is used now');
await localSel.selectOption(''); await page.waitForTimeout(600);

/* ---------- B2 ---------- */
await page.evaluate(async () => {
  const st = await import('/js/state.js'); const store = await import('/js/store.js');
  const w = st.newWorkspace({ name: 'B2 import' });
  w.docs = [{ id: 'doc-b2', name: 'inv.txt', type: 'txt', quality: 'good', category: 'Asset inventory / CMDB extract', words: 20, added: '2026-11-01' }];
  await store.put('blob', 'doc:doc-b2', 'Asset inventory. Electronic health record server owned by IT. Billing application. Firewall.');
  await st.create(w);
});
await page.evaluate(() => { location.hash = '#/org/import'; }); await page.waitForTimeout(1000);
await page.evaluate(async () => { const IU = await import('/js/panels/importui.js'); IU.preselect(['assets'], 'rules'); });
await page.evaluate(() => { location.hash = '#/org/docs'; }); await page.waitForTimeout(300);
await page.evaluate(() => { location.hash = '#/org/import'; }); await page.waitForTimeout(800);
const boxes = await page.$$('#import-card tbody td.cb input');
for (let i = 0; i < boxes.length; i++) { const want = i > 1 ? null : false; if (want === false && await boxes[i].isChecked()) await boxes[i].uncheck(); }
await page.selectOption('#import-card select', 'rules');
await page.click('#import-card button:has-text("Start the import")');
let opened = true;
try { await page.waitForSelector('.modal', { timeout: 8000 }); } catch { opened = false; }
ok(opened, 'B2: Start the import with targets ticked (no profile, no crown jewels) opens the review');
await page.reload(); await ready();   // stop the run: the remaining targets would open their reviews one after the other

/* ---------- B4 ---------- */
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example' && /MediBec/.test(w.name)); await st.select(ex.id); });
await page.evaluate(() => { location.hash = '#/register'; }); await page.waitForTimeout(800);
ok(/clinic/i.test(await visible()), 'B4: MediBec is open (its register is on screen)');
const marker = async () => page.evaluate(() => { window.__b4 = 1; });
const reloaded = async () => page.evaluate(() => window.__b4 !== 1);
async function createVia(name, from) {
  await page.evaluate(() => { location.hash = '#/org/new'; }); await page.waitForTimeout(1000);
  await page.locator('#panel-org input:not([type=checkbox]):not([type=file])').first().fill(name);
  for (const s of await page.$$('#panel-org select')) {
    const vals = await s.evaluate(n => [...n.options].map(o => o.value));
    if (vals.includes('canaretail')) await s.selectOption(from);
  }
  for (const s of await page.$$('#panel-org select')) {
    const vals = await s.evaluate(n => [...n.options].map(o => o.value));
    if (vals.includes('example') && vals.includes('organization')) await s.selectOption('organization');
  }
  await marker();
  await clickAndReopen(page, '#panel-org button:has-text("Create workspace")');   // waits for the B4 reload (t35 flake)
  await page.waitForTimeout(300); await ready();
}
const screens = ['#/process', '#/org/profile', '#/register', '#/calc', '#/summary', '#/assets', '#/dashboard', '#/budget'];
async function noMediBec(label) {
  const hits = [];
  for (const h of screens) {
    await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(600);
    if (/MediBec|clinic/i.test(await visible())) hits.push(h);
  }
  ok(!hits.length, `B4: ${label}: no screen shows MediBec ` + hits.join(' '));
}
await createVia('Real blank B4', 'blank');
ok(await reloaded(), 'B4: creating a workspace reopens the application');
ok(await page.evaluate(async () => (await import('/js/state.js')).S.ws.name) === 'Real blank B4', 'B4: on the new workspace');
ok(/#\/org\/profile/.test(await page.evaluate(() => location.hash)), 'B4: a creation without documents reopens on its profile');
ok(/Workspace created/.test(await page.evaluate(() => document.getElementById('toast')?.textContent || '')), 'B4: the creation message is shown after the reload');
await noMediBec('blank real organization');
await createVia('Real Cana B4', 'canaretail');
ok(await reloaded(), 'B4: creating from CanaRetail reopens the application');
const cana = await page.evaluate(async () => { const st = await import('/js/state.js'); return { n: st.S.ws.name, k: st.S.ws.kind, s: st.S.ws.assessment.SCEN.length }; });
ok(cana.n === 'Real Cana B4' && cana.k === 'organization' && cana.s === 10, 'B4: the CanaRetail-based real organization is open ' + JSON.stringify(cana));
await noMediBec('real organization from CanaRetail');
// switch with the workspace selector
await marker();
const exId = await page.evaluate(async () => (await import('/js/state.js')).S.list.find(w => /MediBec/.test(w.name) && w.kind === 'example').id);
await page.selectOption('#ws-select', exId);
await page.waitForTimeout(1500); await ready();
ok(await reloaded(), 'B4: switching with the workspace selector reopens the application');
ok(/#\/process/.test(await page.evaluate(() => location.hash)), 'B4: a switch reopens on the Process page');
await page.evaluate(() => { location.hash = '#/register'; }); await page.waitForTimeout(800);
ok(/clinic/i.test(await visible()), 'B4: MediBec is back after the switch');
// delete from Workspaces
await page.evaluate(() => { location.hash = '#/org/workspaces'; }); await page.waitForTimeout(1000);
page.once('dialog', d => d.accept());
await marker();
await page.click('#panel-org tr:has-text("Real blank B4") button:has-text("Delete")');
await page.waitForTimeout(1500); await ready();
ok(await reloaded(), 'B4: deleting a workspace reopens the application');
ok(!(await page.evaluate(async () => (await import('/js/state.js')).S.list.some(w => w.name === 'Real blank B4'))), 'B4: the workspace is deleted');

ok(errors.filter(e => !/net::ERR|Failed to load resource/.test(e)).length === 0, 'no console error: ' + errors.join(' | '));
await browser.close(); done('t51 1.9.1 bugs B1–B4');
