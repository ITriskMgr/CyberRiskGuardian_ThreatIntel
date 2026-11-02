import { open, URL, tmp } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await page.waitForTimeout(1500);
const panels = ['process','org','isp','compliance','audit','siem','soar','shared/evidence','settings/logs','settings/modules','threat','isms','csm'];
for (const p of panels) { await page.goto(URL + '#/' + p); await page.waitForTimeout(500);
  const t = await page.evaluate(() => { const s=[...document.querySelectorAll('main > section')].find(x=>!x.hidden); return s ? (s.querySelector('h1')?.textContent + ' | ' + (s.querySelector('.paneldesc')?.textContent||'-') + ' | ' + (s.querySelector('.banner.bad')?.textContent||'').slice(0,200)) : 'none'; });
  console.log(p, '→', t); }
const nav = await page.evaluate(() => [...document.querySelectorAll('nav .navsec')].map(s => s.dataset.sec + (s.hidden?'(hidden)':'') + ':' + s.querySelectorAll('a.tab').length).join(' '));
console.log(nav);
await page.screenshot({ path: tmp('nav.png') });
console.log('errors', errors.slice(0,10));
await browser.close();
