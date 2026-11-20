// t89 — error messages stay until they are read (tester report on 1.9.3: an AI request refused for lack of tokens showed
// a message that vanished after a few seconds, and nothing on the page said what had happened). An error ('bad') stays
// until it is dismissed (× or Escape), replaced by the next message, or the screen changes; other messages still fade.
// The message never blocks clicks: only its × button takes them. Errors are announced as alerts.
import { open, ok, done, goto } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const state = () => page.evaluate(() => { const t = document.getElementById('toast'); return t ? { cls: t.className, role: t.getAttribute('role'), text: t.textContent, x: !!t.querySelector('.toast-x'), pe: getComputedStyle(t).pointerEvents } : null; });
const say = (msg, kind) => page.evaluate(async ([m, k]) => { const U = await import('/js/util.js'); U.toast(m, k); }, [msg, kind]);

await say('Saved', 'good');
let s = await state();
ok(/show/.test(s.cls) && s.role === 'status' && !s.x, 'an ordinary message shows as a status, without a close button');
await page.waitForTimeout(3200);
ok(!/show/.test((await state()).cls), 'an ordinary message fades after about 2.6 s');

await say('The AI provider refused the request: not enough tokens.', 'bad');
await page.waitForTimeout(3500);
s = await state();
ok(/show/.test(s.cls) && /sticky/.test(s.cls) && /not enough tokens/.test(s.text), 'an error is still on screen after 3.5 s');
ok(s.role === 'alert' && s.x, 'an error is announced as an alert and has a close button');
ok(s.pe === 'none', 'the message itself never blocks clicks');
await page.click('#toast .toast-x');
await page.waitForTimeout(300);
ok(!/show/.test((await state()).cls), 'the × button dismisses the error');

await say('Second error', 'bad');
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
ok(!/show/.test((await state()).cls), 'Escape dismisses the error');

await say('Third error', 'bad');
await say('Done', 'good');
s = await state();
ok(/Done/.test(s.text) && !/sticky/.test(s.cls), 'the next message replaces an error');

await say('Fourth error', 'bad');
await goto(page, '#/register', 600);
ok(!/show/.test((await state()).cls), 'moving to another screen clears the error');

await page.evaluate(async () => { const I = await import('/js/i18n.js'); await I.setLang('fr'); });
await say('Erreur', 'bad');
await page.waitForTimeout(400);
const fr = await page.evaluate(() => document.querySelector('#toast .toast-x')?.getAttribute('aria-label'));
ok(fr === 'Fermer ce message', 'the close button is labelled in French: ' + fr);
await page.evaluate(async () => { const I = await import('/js/i18n.js'); await I.setLang('en'); });

ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t89 toast errors');
