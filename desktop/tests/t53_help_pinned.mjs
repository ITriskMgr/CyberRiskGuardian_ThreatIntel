// 1.9.1 — one Help, in the top bar, and the pinned header and footer of the menu.
// Help (top bar) opens a menu: Help on this screen · Step by step · User guide · Ask the help chatbot · About & versions;
// the side menu has no Help section any more; the "?" beside each title stays. The logo and name stay at the top of the
// menu and "© … · ✓ Engine verified" at the bottom, whatever the scroll, in full, rail and drawer modes; the footer opens
// About & versions, which shows the totals.
import { open, ok, done } from './lib.mjs';

const { browser, ctx, page, errors } = await open('#/register');

/* ---------- one Help ---------- */
ok(!(await page.$('nav .navsec[data-sec="help"]')), 'the side menu has no Help section');
await page.click('#help-toggle');
const items = await page.$$eval('#help-menu [role=menuitem]', xs => xs.map(x => x.textContent));
ok(JSON.stringify(items) === JSON.stringify(['Help on this screen', 'Step by step', 'User guide', 'Ask the help chatbot', 'About & versions']), 'the Help menu ' + JSON.stringify(items));
ok(await page.getAttribute('#help-toggle', 'aria-expanded') === 'true' && await page.evaluate(() => document.activeElement?.dataset.help) === 'screen', 'opens with the first item focused');
await page.keyboard.press('ArrowDown');
ok(await page.evaluate(() => document.activeElement?.dataset.help) === 'steps', 'arrow keys move in the menu');
await page.keyboard.press('Escape');
ok(await page.isHidden('#help-menu') && await page.evaluate(() => document.activeElement?.id) === 'help-toggle', 'Escape closes it and returns to the button');
await page.click('#help-toggle'); await page.click('#help-menu [data-help="screen"]'); await page.waitForTimeout(300);
ok(await page.isVisible('#panel-register .helppop'), 'Help on this screen opens the screen’s help (the same as its "?")');
ok(await page.isVisible('#panel-register h1 .helpq'), 'the "?" beside the title stays');
await page.click('#help-toggle'); await page.click('#help-menu [data-help="about"]'); await page.waitForTimeout(800);
ok(await page.evaluate(() => location.hash) === '#/about/versions', 'About & versions opens Help → About → Versions');
const kpi = await page.textContent('#panel-about');
ok(/84,305 \/ 41,023/.test(kpi) && /27,526 \/ 16,049/.test(kpi), 'About & versions shows the engine totals');
const [pop] = await Promise.all([ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null), (async () => { await page.click('#help-toggle'); await page.click('#help-menu [data-help="steps"]'); })()]);
ok(pop && /step-by-step\.html/.test(pop.url()), 'Step by step opens its own window');
if (pop) await pop.close();
await page.click('#help-toggle'); await page.click('#help-menu [data-help="ask"]'); await page.waitForTimeout(300);
ok(await page.isVisible('#chat-panel'), 'Ask opens the help chatbot');

/* ---------- pinned header and footer ---------- */
const vis = sel => page.evaluate(sel => { const n = document.querySelector(sel); if (!n) return false; const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight + 1; }, sel);
const openAll = () => page.evaluate(() => document.querySelectorAll('nav .navsec.shut .navgroup').forEach(b => b.click()));
await page.setViewportSize({ width: 1280, height: 640 });
await page.evaluate(() => { location.hash = '#/register'; }); await page.waitForTimeout(400);
await openAll(); await page.waitForTimeout(300);
const scrollable = await page.evaluate(() => { const t = document.getElementById('navtree'); return t.scrollHeight > t.clientHeight; });
ok(scrollable, 'with every section open, the menu scrolls inside its column');
await page.evaluate(() => { const t = document.getElementById('navtree'); t.scrollTop = t.scrollHeight; });
await page.waitForTimeout(200);
ok(await vis('nav .brand img') && await vis('nav .brand b'), 'after scrolling to the end, the logo and name are still visible at the top');
ok(await vis('nav .foot') && /©/.test(await page.textContent('nav .foot')) && /Engine verified/.test(await page.textContent('nav .foot')), 'and © with ✓ Engine verified at the bottom');
ok(await page.evaluate(() => document.querySelector('nav').scrollTop === 0), 'the column itself does not scroll: only the menu between them');
const oneLine = await page.evaluate(() => { const f = document.querySelector('nav .foot'); return f.getBoundingClientRect().height < 40; });
ok(oneLine, 'the footer is one line');
ok(/84,305 \/ 41,023/.test(await page.getAttribute('nav .foot', 'title')), 'its title carries the totals');
await page.click('nav .foot'); await page.waitForTimeout(600);
ok(await page.evaluate(() => location.hash) === '#/about/versions', 'the footer opens About & versions');
// rail
await page.click('#nav-rail'); await page.waitForTimeout(300);
ok(await vis('nav .brand img') && await vis('nav .foot'), 'rail: the logo and the footer stay visible');
ok(await page.evaluate(() => getComputedStyle(document.querySelector('nav .foot .foot-copy'), '::before').content.includes('©')), 'rail: the footer folds to ©');
await page.click('#nav-rail'); await page.waitForTimeout(300);
// drawer
await page.setViewportSize({ width: 600, height: 700 }); await page.waitForTimeout(300);
await page.click('#nav-toggle'); await page.waitForTimeout(400);
await openAll(); await page.evaluate(() => { const t = document.getElementById('navtree'); t.scrollTop = t.scrollHeight; }); await page.waitForTimeout(200);
ok(await vis('nav .brand img') && await vis('nav .foot'), 'drawer: the logo and the footer stay visible after scrolling');
await page.setViewportSize({ width: 1280, height: 800 });

// the footer reads the state of the self-check: an unverified engine is never shown as verified
const unv = await page.evaluate(() => { const st = document.getElementById('engine-state'), was = st.textContent; st.textContent = 'engine loaded, unverified';
  window.dispatchEvent(new CustomEvent('crg-lang', { detail: 'en' })); const t = document.getElementById('engine-short').textContent; st.textContent = was; window.dispatchEvent(new CustomEvent('crg-lang', { detail: 'en' })); return t; });
ok(/Engine unverified/.test(unv) && !/✓/.test(unv), 'an unverified engine shows ◻ Engine unverified, never ✓ ' + unv);

/* ---------- French ---------- */
await page.evaluate(async () => { const i = await import('/js/i18n.js'); await i.setLang('fr'); }); await page.waitForTimeout(400);
ok(/Moteur vérifié/.test(await page.textContent('nav .foot')), 'French footer: « Moteur vérifié »');
await page.click('#help-toggle');
ok(/À propos et versions/.test(await page.textContent('#help-menu')), 'French Help menu');
await page.keyboard.press('Escape');
await page.evaluate(async () => { const i = await import('/js/i18n.js'); await i.setLang('en'); });

ok(errors.filter(e => !/net::ERR|Failed to load resource/.test(e)).length === 0, 'no console error: ' + errors.join(' | '));
await browser.close(); done('t53 one Help and the pinned header and footer');
