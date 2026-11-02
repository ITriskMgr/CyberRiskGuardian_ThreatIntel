// Identity & access management and Configuration management — two module switches: each off by default, each switched on its
// own in Settings → Modules, its own menu and tabs, data kept, its KRIs hidden when off, both in the access matrix; an installation
// that had switched on the single pre-split module finds both on, and per-user menu rights set on it apply to both.
import { open, ok, done, goto } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const en = id => page.evaluate(async id => (await import('/js/modules.js')).enabled(id), id);
ok(await en('iam') === false && await en('cm') === false, 'both off by default');
for (const id of ['iam', 'cm']) ok(!(await page.isVisible(`nav a[data-panel="${id}"]`)), `no ${id} menu entry when off`);
await goto(page, '#/iam/overview');
ok(await page.isVisible('#panel-iam >> text=This module is switched off'), 'IAM off panel shown');
await page.click('#panel-iam >> text=Open Settings → Modules'); await page.waitForTimeout(600);
ok(/#\/settings\/modules/.test(page.url()), 'off panel links to Settings → Modules');
const labIam = page.locator('#panel-settings label', { hasText: 'Identity & access management (IAM/PAM)' });
const labCm = page.locator('#panel-settings label', { hasText: /^\s*Configuration management/ });
ok(await labIam.count() === 1 && await labCm.count() === 1, 'both listed in Settings → Modules');
ok(await page.isVisible('#panel-settings h3:text-is("Governance")'), 'group Governance');
// IAM alone
await labIam.locator('input[type=checkbox]').check(); await page.waitForTimeout(500);
ok(await en('iam') && !(await en('cm')), 'IAM switched on alone from Settings');
const tabs = id => page.$$eval(`nav a.tab[data-panel="${id}"]`, a => a.filter(x => x.style.display !== 'none' && !x.hidden).map(x => x.dataset.arg).filter(Boolean));
const ti = await tabs('iam');
ok(JSON.stringify(ti) === JSON.stringify(['overview', 'accounts', 'privileged', 'emergency', 'reviews', 'sod', 'findings', 'import']), 'IAM menu shows its 8 tabs: ' + ti.join(','));
ok(!(await page.isVisible('nav a[data-panel="cm"]')), 'CM menu still hidden');
// the two submenus sit in Governance right after Cybersecurity management
const order = await page.$$eval('nav a[data-panel]', a => [...new Set(a.map(x => x.dataset.panel))]);
ok(order.indexOf('iam') === order.indexOf('csm') + 1, 'IAM right after Cybersecurity management ' + order.slice(order.indexOf('csm'), order.indexOf('csm') + 4));
let k = await page.evaluate(async () => { const K = await import('/js/kri.js'); return K.autoDefs().filter(d => d.module).map(d => d.module + ':' + d.id); });
ok(JSON.stringify(k) === JSON.stringify(['iam:CRG-17', 'iam:CRG-18', 'iam:CRG-19', 'iam:CRG-20', 'iam:CRG-21', 'iam:CRG-23']), 'IAM on: its six KRIs only ' + k);
// CM too
await labCm.locator('input[type=checkbox]').check(); await page.waitForTimeout(500);
const tc = await tabs('cm');
ok(JSON.stringify(tc) === JSON.stringify(['overview', 'baselines', 'deviations', 'changes', 'findings', 'import']), 'CM menu shows its 6 tabs: ' + tc.join(','));
const order2 = await page.$$eval('nav a[data-panel]', a => [...new Set(a.map(x => x.dataset.panel))]);
ok(order2.indexOf('cm') === order2.indexOf('iam') + 1, 'CM right after IAM');
k = await page.evaluate(async () => { const K = await import('/js/kri.js'); return K.autoDefs().filter(d => d.module).map(d => d.module + ':' + d.id); });
ok(k.length === 9 && k.includes('cm:CRG-22') && k.includes('cm:CRG-24') && k.includes('cm:CRG-25'), 'both on: nine KRIs ' + k);
await goto(page, '#/dashboard', 900);
ok(await page.isVisible('#panel-dashboard >> text=CRG-17') && await page.isVisible('#panel-dashboard >> text=CRG-25'), 'dashboard lists CRG-17 and CRG-25');
ok(await page.locator('#panel-dashboard .small.muted', { hasText: 'Identity & access management (IAM/PAM)' }).count() === 6
  && await page.locator('#panel-dashboard .small.muted', { hasText: /^Configuration management$/ }).count() === 3, 'two KRI groups, under each module name');
// data survives switching off; each switch hides only its own KRIs
const rows = await page.evaluate(async () => { const w = (await import('/js/state.js')).S.ws; return [w.iam.accounts.length, w.cm.baselines.length]; });
await page.evaluate(async () => (await import('/js/modules.js')).set('cm', false)); await page.waitForTimeout(400);
ok(!(await page.isVisible('nav a[data-panel="cm"]')) && await page.isVisible('nav a[data-panel="iam"]'), 'CM menu hidden again, IAM stays');
const k2 = await page.evaluate(async () => { const K = await import('/js/kri.js'); return { d: K.autoDefs().filter(d => d.module).map(d => d.id), v: Object.keys(K.autoValues()).filter(k => /^CRG-(1[7-9]|2[0-5])$/.test(k)) }; });
ok(!k2.d.some(id => ['CRG-22', 'CRG-24', 'CRG-25'].includes(id)) && k2.d.length === 6 && k2.v.length === 6, 'CM KRIs hidden when CM is off ' + JSON.stringify(k2));
await page.evaluate(async () => (await import('/js/modules.js')).set('iam', false)); await page.waitForTimeout(400);
const k3 = await page.evaluate(async () => { const K = await import('/js/kri.js'); return K.autoDefs().filter(d => d.module).length + Object.keys(K.autoValues()).filter(k => /^CRG-(1[7-9]|2[0-5])$/.test(k)).length; });
ok(k3 === 0, 'every module KRI hidden when both are off');
const rows2 = await page.evaluate(async () => { const w = (await import('/js/state.js')).S.ws; return [w.iam.accounts.length, w.cm.baselines.length]; });
ok(rows[0] > 0 && rows[1] > 0 && JSON.stringify(rows2) === JSON.stringify(rows), `data kept while off (${rows2})`);
// access matrix and process steps
const m = await page.evaluate(async () => { const u = await import('/js/users.js'); const P = await import('/js/process.js'); return { iam: u.MENUS.some(x => x[0] === 'iam'), cm: u.MENUS.some(x => x[0] === 'cm'), ipc: u.MENUS.some(x => x[0] === 'ipc'), s1: P.stepOf('iam'), s2: P.stepOf('cm') }; });
ok(m.iam && m.cm && !m.ipc && m.s1 === 'context' && m.s2 === 'context', 'iam and cm in the access matrix, rights of step 2 ' + JSON.stringify(m));
await page.evaluate(async () => { const M = await import('/js/modules.js'); M.set('iam', true); M.set('cm', true); });
await goto(page, '#/process', 800);
ok(await page.locator('#panel-process button', { hasText: 'Open Findings & proposals' }).count() >= 4, 'process steps link to both modules when on');
// an installation that had switched on the single pre-split module: both successors on until set; menu rights carried
const carry = await page.evaluate(async () => {
  const prefs = await import('/js/prefs.js'); const M = await import('/js/modules.js'); const U = await import('/js/users.js');
  const saved = prefs.get('modules');
  prefs.set('modules', { ipc: true }); const a = [M.enabled('iam'), M.enabled('cm')];
  prefs.set('modules', { ipc: true, cm: false }); const b = [M.enabled('iam'), M.enabled('cm')];
  prefs.set('modules', saved);
  const u = { id: 'u-x', admin: false, menu: { ipc: 'view' }, groups: [] };
  U.U.enabled = true; const r = [U.menuMode('iam', u), U.menuMode('cm', u), U.menuMode('isms', u)]; U.U.enabled = false;
  return { a, b, r };
});
ok(carry.a.join() === 'true,true' && carry.b.join() === 'true,false', 'a pre-split switch carries to both modules until each is set ' + JSON.stringify(carry));
ok(carry.r.join() === 'view,view,default', 'a menu right on the pre-split screen applies to both ' + carry.r);
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t36 iam cm modules');
