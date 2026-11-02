// Test helpers for the Virtual consultant suites (same style as the main suite's lib.mjs).
// CRG_URL points at a running helper (serve.py) started with CRG_AI_MOCK set to a folder of canned answers.
import { chromium } from 'playwright';
export const URL = process.env.CRG_URL || 'http://127.0.0.1:8103/';
export const MOCK = process.env.CRG_AI_MOCK_DIR || '/home/claude/tmp/mock-consult';
export async function open(hash = '#/process') {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ serviceWorkers: process.env.CRG_SW ? 'allow' : 'block', acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL + hash);
  await page.waitForFunction(async () => { const m = await import('/js/state.js'); return !!m.S.ws; }, null, { timeout: 20000, polling: 300 });
  // the first check can answer from a module instance that is about to be replaced: settle, then check again
  await page.waitForTimeout(1200);
  await page.waitForFunction(async () => { const m = await import('/js/state.js'); return !!m.S.ws && m.S.list.length > 0; }, null, { timeout: 20000, polling: 300 });
  return { browser, ctx, page, errors };
}
let fails = 0, passes = 0;
export function ok(cond, msg) { if (cond) { passes++; } else { fails++; console.log('FAIL', msg); } }
export function done(name) { console.log(`${name}: ${passes} passed, ${fails} failed`); process.exit(fails ? 1 : 0); }
