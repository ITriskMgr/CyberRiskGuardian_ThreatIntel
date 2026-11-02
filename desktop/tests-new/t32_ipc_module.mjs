// Identity, privilege & configuration — the module switch: off by default, Settings → Modules, menu, data kept, KRIs hidden, access matrix.
import { open, ok, done } from './lib.mjs';
import { goto } from './ipc_lib.mjs';
const { browser, page, errors } = await open('#/process');
const on0 = await page.evaluate(async () => (await import('/js/modules.js')).enabled('ipc'));
ok(on0 === false, 'off by default');
ok(!(await page.isVisible('nav a[data-panel="ipc"]')), 'no menu entry when off');
await goto(page, '#/ipc/overview');
ok(await page.isVisible('#panel-ipc >> text=This module is switched off'), 'off panel shown');
await page.click('#panel-ipc >> text=Open Settings → Modules'); await page.waitForTimeout(600);
ok(/#\/settings\/modules/.test(page.url()), 'off panel links to Settings → Modules');
const lab = page.locator('#panel-settings label', { hasText: 'Identity, privilege & configuration' });
ok(await lab.count() === 1, 'listed in Settings → Modules');
ok(await lab.locator('xpath=ancestor::div[1]').locator('h3', { hasText: 'Governance' }).count() === 1 || await page.isVisible('#panel-settings h3:text-is("Governance")'), 'group Governance');
await lab.locator('input[type=checkbox]').check(); await page.waitForTimeout(500);
ok(await page.evaluate(async () => (await import('/js/modules.js')).enabled('ipc')), 'switched on from Settings');
const tabs = await page.$$eval('nav a.tab[data-panel="ipc"]', a => a.filter(x => x.style.display !== 'none' && !x.hidden).map(x => x.dataset.arg).filter(Boolean));
ok(tabs.length === 11 && tabs.includes('overview') && tabs.includes('import'), 'menu shows the 11 tabs: ' + tabs.join(','));
// KRIs present when on
const k1 = await page.evaluate(async () => { const K = await import('/js/kri.js'); return K.autoDefs().filter(d => d.module === 'ipc').map(d => d.id); });
ok(k1.length === 8 && k1[0] === 'CRG-17' && k1[7] === 'CRG-24', 'eight KRIs when on');
await goto(page, '#/dashboard', 900);
ok(await page.isVisible('#panel-dashboard >> text=CRG-17'), 'dashboard lists CRG-17');
ok(await page.isVisible('#panel-dashboard >> text=Identity, privilege & configuration'), 'grouped under the module name');
// data survives switching off
const rows = await page.evaluate(async () => (await import('/js/state.js')).S.ws.ipc.accounts.length);
await lab.locator('input[type=checkbox]').count();
await page.evaluate(async () => (await import('/js/modules.js')).set('ipc', false)); await page.waitForTimeout(400);
ok(!(await page.isVisible('nav a[data-panel="ipc"]')), 'menu hidden again when off');
const k2 = await page.evaluate(async () => { const K = await import('/js/kri.js'); return { d: K.autoDefs().filter(d => d.module === 'ipc').length, v: Object.keys(K.autoValues()).filter(k => /^CRG-(1[7-9]|2[0-4])$/.test(k)).length }; });
ok(k2.d === 0 && k2.v === 0, 'KRIs hidden when off');
const rows2 = await page.evaluate(async () => (await import('/js/state.js')).S.ws.ipc.accounts.length);
ok(rows > 0 && rows2 === rows, `data kept while off (${rows2} account rows)`);
// access matrix
const m = await page.evaluate(async () => { const u = await import('/js/users.js'); const P = await import('/js/process.js'); return { inMatrix: u.MENUS.some(x => x[0] === 'ipc'), step: P.stepOf('ipc') }; });
ok(m.inMatrix && m.step === 'context', 'ipc in the access matrix, rights of step 2');
// steps 1, 2, 9, 19 gain tips and links only when on
await page.evaluate(async () => (await import('/js/modules.js')).set('ipc', true));
await goto(page, '#/process', 800);
ok(await page.locator('#panel-process button', { hasText: 'Open Findings & proposals' }).count() >= 2, 'process steps link to the module when on');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t32 ipc module');
