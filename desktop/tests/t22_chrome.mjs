// Menu hierarchy, feature switches, per-user hiding, rail and drawer, "?" help, Settings → Logs, beta wording.
import { open, ok, done, URL } from './lib.mjs';
const { browser, ctx, page, errors } = await open('#/process');
await page.waitForTimeout(800);

// beta wording, top bar
const top = await page.evaluate(() => document.querySelector('.topright').textContent);
ok(!/Saved locally|proof of concept|Beta ·/i.test(top), 'top right shows no saved time and no beta pill');
const V = await page.evaluate(async () => { const v = await import('/js/version.js'); return { version: v.VERSION, series: v.SERIES }; });
// 1.9.1 — one pinned footer line: © and the engine check; the version is in its title and in Help → About & versions
ok((await page.getAttribute('nav .foot', 'title')).includes(`v${V.version} Beta (${V.series})`), `footer title says v${V.version} Beta (${V.series})`);
ok(/© 2026 Marc-André Léger/.test(await page.textContent('nav .foot')) && /Engine verified/.test(await page.textContent('#engine-short')), 'footer: © and ✓ Engine verified on one line');
ok(!/proof of concept/i.test(await page.evaluate(() => document.body.innerText)), 'no proof of concept on screen');

// hierarchy from menu.js
const M = await page.evaluate(async () => { const m = await import('/js/menu.js'); return m.MENU.map(s => ({ id: s.id, items: s.items.length })); });
for (const s of M) ok(await page.$(`nav .navsec[data-sec="${s.id}"]`), 'section ' + s.id + ' is in the menu');
ok(await page.$('nav .navsub[data-sub="siem"] .subitems a[href="#/siem/rules"]'), 'SIEM has its tabs as a sub-menu');
ok(await page.$('nav .navsec[data-sec="governance"] .navsub[data-sub="isp"]'), 'ISP management sits under Governance');

// every menu route renders with a title, a description and a "?" help — with every module on: a module that is off by
// default (identity, privilege & configuration) shows only its "switched off" notice, which is not the screen under test
const wasOff = await page.evaluate(async () => { const M = await import('/js/modules.js'); const off = M.MODULES.filter(m => !M.enabled(m.id)).map(m => m.id); for (const id of off) M.set(id, true); return off; });
const routes = await page.evaluate(async () => { const m = await import('/js/menu.js'); return m.MENU.flatMap(s => s.items.flatMap(i => i.tabs ? i.tabs.map(t => t.panel + '/' + t.arg) : i.panel ? [i.panel + (i.arg ? '/' + i.arg : '')] : [])); });
let noHelp = [];
for (const r of routes) {
  await page.evaluate(h => { location.hash = '#/' + h; }, r);
  // the "?" is added when the screen has finished drawing; the ontology screen waits on the helper's CRGO server, which can
  // take more than a second just after a helper restart: wait for the decoration (bounded), then look
  await page.waitForTimeout(300);
  await page.waitForFunction(() => { const s = [...document.querySelectorAll('main > section')].find(x => !x.hidden); return !!s?.querySelector('h1 .helpq'); }, null, { timeout: 8000, polling: 150 }).catch(() => {});
  const st = await page.evaluate(() => { const s = [...document.querySelectorAll('main > section')].find(x => !x.hidden); const h1 = s?.querySelector('h1');
    return { help: !!h1?.querySelector('.helpq'), desc: !!(s?.querySelector('.paneldesc') || (h1?.nextElementSibling?.classList.contains('lede'))) }; });
  if (!st.help || !st.desc) noHelp.push(r + (st.help ? '' : ' (no ?)') + (st.desc ? '' : ' (no description)'));
}
ok(!noHelp.length, 'every screen and tab has a description and a "?" help: ' + noHelp.join(', '));
await page.evaluate(async off => { const M = await import('/js/modules.js'); for (const id of off) M.set(id, false); }, wasOff);
await page.evaluate(() => { location.hash = '#/siem/rules'; }); await page.waitForTimeout(400);
await page.click('#panel-siem h1 .helpq');
ok(await page.isVisible('#panel-siem .helppop a[href="help/user-guide.html#siem-rules"]'), '"?" opens the help with a link to the guide section');

// feature switches: SIEM and SOAR off → Security operations section disappears
await page.evaluate(async () => { const m = await import('/js/modules.js'); m.set('siem', false); m.set('soar', false); });
await page.waitForTimeout(300);
ok(await page.evaluate(() => document.querySelector('nav .navsec[data-sec="secops"]').hidden), 'a section whose features are all off is left out');
await page.evaluate(() => { location.hash = '#/siem/dashboard'; }); await page.waitForTimeout(300);
ok(await page.isVisible('#panel-siem >> text=This module is switched off'), 'a switched-off screen says how to switch it on');
await page.evaluate(async () => { const m = await import('/js/modules.js'); m.set('siem', true); });
await page.waitForTimeout(300);
ok(await page.evaluate(() => !document.querySelector('nav .navsec[data-sec="secops"]').hidden && document.querySelector('nav .navsub[data-sub="soar"]').hidden), 'one feature back on: the section returns without the other');
await page.evaluate(async () => { const m = await import('/js/modules.js'); m.set('soar', true); });

// per-user: a hidden screen is left out of the menu
await page.evaluate(async () => { const n = await import('/js/nav.js'); n.visibility(new Set(['audit'])); });
ok(await page.evaluate(() => document.querySelector('nav .navsec[data-sec="audit"]').hidden), 'screens hidden from a person leave the menu, with their section');
await page.evaluate(async () => { const n = await import('/js/nav.js'); n.visibility(new Set()); });

// rail mode remembered
await page.click('#nav-rail');
ok(await page.evaluate(() => document.body.classList.contains('navrail')), 'the menu folds into a rail');
await page.reload(); await page.waitForTimeout(1200);
ok(await page.evaluate(() => document.body.classList.contains('navrail')), 'the rail is remembered');
await page.click('nav .navsec[data-sec="governance"] .navgroup');
ok(await page.isVisible('nav .navsec.fly .navitems'), 'a rail section opens a flyout');
await page.keyboard.press('Escape');
await page.click('#nav-rail');

// drawer on a narrow screen
await page.setViewportSize({ width: 420, height: 800 });
await page.waitForTimeout(300);
ok(await page.isVisible('#nav-toggle'), 'narrow screen: the ☰ button is shown');
await page.click('#nav-toggle'); await page.waitForTimeout(300);
ok(await page.evaluate(() => document.body.classList.contains('navopen')), 'the drawer opens');
await page.click('nav a.tab[href="#/register"]'); await page.waitForTimeout(300);
ok(await page.evaluate(() => !document.body.classList.contains('navopen')), 'choosing a screen closes the drawer');
await page.setViewportSize({ width: 1280, height: 800 });

// logs
await page.evaluate(() => { location.hash = '#/settings/logs'; }); await page.waitForTimeout(1200);
const L = await page.evaluate(async () => { const l = await import('/js/logs.js'); const u = await import('/js/util.js'); u.download('x.txt', 'secret: abc', 'text/plain');
  return { acc: l.entries('access').map(e => e.action + '|' + e.target), dat: l.entries('data').map(e => e.action + '|' + e.target + '|' + e.detail) }; });
ok(L.acc.some(a => a.startsWith('screen opened|siem')), 'the access log records screens opened');
ok(L.acc.some(a => a.startsWith('application opened')), 'the access log records the application opening');
ok(L.dat.some(a => a.startsWith('file downloaded|x.txt')), 'the data log records downloads');
ok(!JSON.stringify(L).includes('abc'), 'no file contents in the log');
const csv = await page.evaluate(async () => (await import('/js/logs.js')).csv((await import('/js/logs.js')).entries('all')));
ok(csv.startsWith('time,log,user,action'), 'logs export as CSV');
ok(await page.isVisible('#panel-settings >> text=Keep entries for'), 'retention is set in Settings → Logs');
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.name = st.S.ws.name; st.touch(); });
await page.waitForTimeout(900);
ok(await page.evaluate(async () => (await import('/js/logs.js')).entries('data').some(e => e.action === 'workspace saved')), 'the data log records workspace saves');

// engine untouched
ok(/84[,  ]?305/.test(await page.textContent('#engine-state')), 'engine still verified 84,305 / 41,023');
ok(!errors.length, 'no console errors ' + errors.slice(0, 3).join(' | '));
await browser.close();
done('t22 chrome, menu and logs');
