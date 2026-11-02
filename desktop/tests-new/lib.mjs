import { chromium } from 'playwright';
export const URL = process.env.CRG_URL || 'http://127.0.0.1:8099/';
export async function open(hash = '#/process') {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ serviceWorkers: process.env.CRG_SW ? 'allow' : 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL + hash);
  await page.waitForFunction(async () => { const m = await import('/js/state.js'); return !!m.S.ws; }, null, { timeout: 20000, polling: 300 });
  return { browser, ctx, page, errors };
}
let fails = 0, passes = 0;
export function ok(cond, msg) { if (cond) { passes++; } else { fails++; console.log('FAIL', msg); } }
export function done(name) { console.log(`${name}: ${passes} passed, ${fails} failed`); process.exit(fails ? 1 : 0); }
