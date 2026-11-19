// t84 — WCAG 2.1 AA on every route (1.9.3, BL-20). t72 checks 42 screens in three settings and gates selected rules; this
// suite takes every route of the screen-code registry (js/screencodes.js) and fails on ANY axe-core violation tagged WCAG 2.0,
// 2.1 or 2.2 level A or AA, in English (light) and French (dark), and on heading order (best practice, gated as in t72).
// Other best-practice findings are reported, not gated.
import fs from 'fs';
import path from 'path';
import { open, ok, done, goto, medibec, modulesOn, TESTS } from './lib.mjs';
const AXE = fs.readFileSync(path.join(TESTS, 'vendor', 'axe.min.js'), 'utf8');
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const { browser, page, errors } = await open('#/process');
await medibec(page); await modulesOn(page, true);
await page.setViewportSize({ width: 1600, height: 1000 });
const routes = await page.evaluate(async () => Object.keys((await import('/js/screencodes.js')).CODES));
ok(routes.length >= 150, `the registry lists every route (${routes.length})`);
const gated = [], advice = {};
let checked = 0;
for (const [lang, theme] of [['en', 'light'], ['fr', 'dark']]) {
  await page.evaluate(async l => { const I = await import('/js/i18n.js'); await I.setLang(l); }, lang);
  await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
  for (const r of routes) {
    await goto(page, '#/' + r, 600);
    if (!(await page.evaluate(() => !!window.axe))) await page.evaluate(AXE + '\n;window.axe = axe; true');
    const res = await page.evaluate(async (wcag) => {
      const sec = [...document.querySelectorAll('main > section')].find(s => !s.hidden);
      const out = await axe.run(sec || document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: [...wcag, 'best-practice'] } });
      return out.violations.map(v => ({ id: v.id, wcag: v.tags.some(t => wcag.includes(t)), n: v.nodes.length, ex: (v.nodes[0]?.html || '').slice(0, 120) + ' @ ' + (v.nodes[0]?.target || []).join(' ') }));
    }, WCAG).catch(e => [{ id: 'axe-error', wcag: true, n: 0, ex: String(e).slice(0, 160) }]);
    checked++;
    for (const v of res) {
      if (v.wcag || v.id === 'heading-order') gated.push(`${v.id} ${lang}-${theme} #/${r} ×${v.n}: ${v.ex}`);
      else (advice[v.id] ||= new Set()).add(r);
    }
  }
}
for (const [id, s] of Object.entries(advice)) console.log(`  [best practice, not gated] ${id} on ${s.size} route(s): ${[...s].slice(0, 6).join(', ')}`);
for (const g of gated.slice(0, 40)) console.log('  ' + g);
ok(checked === routes.length * 2, `axe ran on ${checked} route views`);
ok(gated.length === 0, `no WCAG A/AA violation and no heading-order skip on any route (${gated.length}) ${gated.slice(0, 3).join(' | ')}`);
ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t84 axe all routes');
