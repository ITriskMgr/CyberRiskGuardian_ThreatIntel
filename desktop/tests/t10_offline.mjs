import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { ok, done, waitInPage, URL, PORT, serveCmd } from './lib.mjs';
const browser = await chromium.launch();
const ctx = await browser.newContext({ serviceWorkers: 'allow' });
const page = await ctx.newPage();
await page.goto(URL + '#/process');
await page.waitForFunction(() => navigator.serviceWorker.controller || false, null, { timeout: 30000 }).catch(() => {});
// the application reloads itself once when the service worker takes over: let it, then reload
await page.waitForTimeout(2500); await page.reload().catch(() => {}); await page.waitForTimeout(2500);
ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'service worker controls the page');
execSync(`fuser -k ${PORT}/tcp || pkill -f 'serve.py ${PORT}$' || true`); await page.waitForTimeout(800);
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.reload();
await waitInPage(page, async () => { const m = await import('/js/state.js'); return !!m.S.ws; }, null, { timeout: 20000, every: 300 });
ok(/84,305 \/ 41,023/.test(await page.textContent('body')), 'offline: engine verified');
await page.evaluate(async () => { const M = await import('/js/modules.js'); M.set('iam', true); M.set('cm', true); });
for (const r of ['ontology/suggest', 'registry/browse', 'isp/policies', 'compliance/report', 'iam/overview', 'iam/findings', 'iam/import', 'cm/overview', 'cm/baselines', 'cm/findings', 'cm/import']) { await page.evaluate(h => location.hash = '#/' + h, r); await page.waitForTimeout(700); }
ok(!errs.length, 'offline: new screens render ' + errs.join('|').slice(0, 200));
for (const p of ['help/user-guide.html', 'help/step-by-step.html', 'USER-GUIDE.fr.md', 'data/crgo-snapshot.json']) {
  const r = await page.evaluate(async u => (await fetch('/' + u)).status, p); ok(r === 200, 'offline: ' + p + ' ' + r);
}
await browser.close(); execSync(serveCmd()); done('t10 offline');
