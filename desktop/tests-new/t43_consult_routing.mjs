// Virtual consultant — routing: its own row in Settings → AI, on the local model by default and enforced by
// the helper; the workspace provider when switched; confidential workspaces confirm every call; payload
// preview and anonymizer; remote providers never embed (helper and screen); the help chatbot is help-only
// and hands questions over; the "AI assistant" label is gone.
import { open, ok, done, MOCK, URL } from './lib.mjs';
import fs from 'fs';
fs.writeFileSync(MOCK + '/consultant.txt', 'Answer from the mock [P1].\n');
const api = (page, path, body) => page.evaluate(async ({ path, body }) => { const r = await fetch(path, { method: 'POST', headers: { 'X-CRG': '1', 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { status: r.status, body: await r.json() }; }, { path, body });

const { browser, page, errors } = await open('#/process');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id);
  const AI = await import('/js/ai.js'); const a = AI.settings(st.S.ws); a.provider = 'claude'; a.acknowledged = new Date().toISOString(); a.confidential = false; a.anon = false; st.touch(); });

/* ---------- local by default, in the app and in the helper ---------- */
const D = await page.evaluate(async () => { const AI = await import('/js/ai.js'); const C = await import('/js/consult.js');
  const row = AI.FEATURES.find(f => f[0] === 'consultant'); const r = AI.route('consultant');
  const p = AI.prepare('consultant', undefined, { question: 'q', ctx: C.screenContext('#/register'), passages: [], history: [] });
  return { row: row && [row[1], row[3], row[4]], mode: r.mode, local: AI.isLocal(r.provider), prov: p.provider, rows: AI.FEATURES.map(f => f[1]) }; });
ok(D.row && D.row[0] === 'Virtual consultant' && D.row[2] === 'local', 'the routing table has a "Virtual consultant" row, local by default ' + D.row);
ok(D.mode === 'local' && D.local, 'with a remote workspace provider, the consultant still goes to the local model');
ok(!D.rows.some(l => /AI assistant|Help chatbot/.test(l)), 'no "AI assistant" or chatbot-AI routing rows remain');
const refused = await api(page, '/api/ai', { provider: 'claude', task: 'consultant', system: 's', prompt: 'TASK: consultant\nq', max_tokens: 10 });
ok(refused.status === 403 && /local model only/.test(refused.body.error), 'the helper refuses to send the consultant to a remote provider by default');
await page.evaluate(() => { location.hash = '#/settings/ai'; }); await page.waitForTimeout(1500);
ok(await page.isVisible('#panel-settings td >> text=Virtual consultant'), 'Settings → AI shows the Virtual consultant row');

/* ---------- switched to the workspace provider: preview shows the remote destination ---------- */
await page.evaluate(async () => { const h = await import('/js/helper.js'); await h.loadConfig(); const P = (await import('/js/ai.js')).policy(); P.tasks.consultant = 'workspace'; h.HS.config.ai = { ...h.HS.config.ai, policy: P }; await h.saveConfig(); });
await page.evaluate(() => { location.hash = '#/register'; }); await page.waitForTimeout(500);
await page.click('#consult-toggle');
await page.fill('#consult-panel textarea', 'Which scenario is furthest above tolerance?');
await page.click('#consult-panel .consult-foot .btn:not(.ghost)');
await page.waitForSelector('.modal textarea', { timeout: 15000 });
const dest = await page.textContent('.modal .grid');
ok(/Claude API|api\.anthropic\.com/.test(dest), 'switched to the workspace provider, the preview shows the remote destination');
const ta = (await page.$$('.modal textarea'))[1];
ok(/SOURCES \(\d+ passages retrieved on this computer\)/.test(await ta.inputValue()), 'the preview shows the retrieved passages before anything is sent');
await page.click('.modal .btnrow .btn:not(.ghost)');
await page.waitForSelector('#consult-panel .consult-answer', { timeout: 15000 });
const last = JSON.parse(fs.readFileSync(MOCK + '/_last.json', 'utf8'));
ok(last.task === 'consultant', 'the helper received the consultant task');

/* ---------- confidential: every call confirmed; anonymizer ---------- */
await page.evaluate(async () => { const st = await import('/js/state.js'); const AI = await import('/js/ai.js'); const a = AI.settings(st.S.ws); a.confidential = true; a.anon = true; st.touch(); });
for (const i of [1, 2]) {
  await page.fill('#consult-panel textarea', 'Second question ' + i);
  await page.click('#consult-panel .consult-foot .btn:not(.ghost)');
  await page.waitForSelector('.modal textarea', { timeout: 15000 });
  ok(await page.isVisible('.modal >> text=This workspace is marked confidential') && await page.isVisible('.modal >> text=Confirm and send'), `confidential workspace: call ${i} is confirmed individually`);
  const pr = await (await page.$$('.modal textarea'))[1].inputValue();
  if (i === 1) ok(!/MediBec/.test(pr), 'anonymizer on: the organization name is replaced in the payload');
  await page.click('.modal .btnrow .btn:not(.ghost)');
  await page.waitForTimeout(800);
}
await page.evaluate(async () => { const st = await import('/js/state.js'); const AI = await import('/js/ai.js'); const a = AI.settings(st.S.ws); a.confidential = false; a.anon = false; st.touch();
  const h = await import('/js/helper.js'); const P = AI.policy(); P.tasks.consultant = 'local'; h.HS.config.ai = { ...h.HS.config.ai, policy: P }; await h.saveConfig(); });

/* ---------- remote providers never embed ---------- */
await page.evaluate(async () => { const h = await import('/js/helper.js'); h.HS.config.ai = { ...h.HS.config.ai, embed: { provider: 'claude', model: 'text-embed' } }; await h.saveConfig(); await h.probe(true); });
const emb = await api(page, '/api/embed', { texts: ['hello'] });
ok(emb.status === 403 && /Remote providers never embed/.test(emb.body.error), 'the helper refuses embeddings from a remote provider');
const ui = await page.evaluate(async () => { const C = await import('/js/consult.js'); return { ready: C.embedReady() }; });
ok(ui.ready === false, 'a remote embedding provider never makes hybrid retrieval available');
await page.click('#consult-panel .consult-head button[aria-label="Close"]');
await page.evaluate(() => { location.hash = '#/settings/ai'; }); await page.waitForTimeout(1500);
ok(await page.evaluate(() => document.querySelector('#panel-settings select[aria-label="Retrieval for this workspace"] option[value="hybrid"]').disabled), 'Settings → AI greys out hybrid until a local model is configured');
ok(await page.evaluate(() => [...document.querySelectorAll('#panel-settings select')].some(s => [...s.options].some(o => o.value === 'ollama')) && ![...document.querySelector('#panel-settings input[aria-label="Embedding model"]').closest('.card').querySelectorAll('select')[0].options].some(o => o.value === 'claude')), 'the embedding provider list offers providers on this machine only');
await page.evaluate(async () => { const h = await import('/js/helper.js'); h.HS.config.ai = { ...h.HS.config.ai, embed: { provider: '', model: '' } }; await h.saveConfig(); await h.probe(true); return 1; });
const emb2 = await api(page, '/api/embed', { texts: ['hello'] });
ok(emb2.status === 403 && /No local embedding model/.test(emb2.body.error), 'no embedding model configured: nothing is embedded');

/* ---------- the help chatbot is help-only and hands over ---------- */
await page.click('#help-toggle');
await page.fill('#chat-panel input', 'what is the baseline cost');
await page.keyboard.press('Enter'); await page.waitForTimeout(400);
ok(!(await page.isVisible('#chat-panel >> text=Ask AI')) && await page.isVisible('#chat-panel >> text=help only'), 'the help chatbot has no AI mode');
await page.click('#chat-panel >> text=Ask the Virtual consultant'); await page.waitForTimeout(300);
ok(await page.isVisible('#consult-panel') && (await page.inputValue('#consult-panel textarea')) === 'what is the baseline cost', '"Ask the Virtual consultant" opens the panel with the question');

/* ---------- the retired label ---------- */
const labels = await page.evaluate(async () => { const m = await import('/js/menu.js'); const mod = await import('/js/modules.js'); return { menu: m.labelOf('ai'), nav: document.querySelector('nav').innerText, mod: JSON.stringify(mod.MODULES || '') }; });
ok(labels.menu === 'Virtual consultant' && !/AI assistant/.test(labels.nav) && !/AI assistant/.test(labels.mod), 'Tools → Virtual consultant; "AI assistant" is gone from the menu and the modules');
const real = errors.filter(e => !/status of 403/.test(e));   // the refusals this suite provokes on purpose
ok(!real.length, 'no console errors ' + real.join(' | ').slice(0, 300));
await browser.close(); done('t43 consultant routing');
