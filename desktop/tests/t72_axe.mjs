// t72 — accessibility (1.9.2, NV-028, NV-064, NV-092): axe-core 4.14 (tests/vendor, MPL-2.0) on the application's screens,
// English and French, light and dark. Gate: no critical violation of "label" / "select-name" (every control has an
// accessible name — field() in util.js gives the label an htmlFor; a11y.js names the filter selects, title-only
// tick boxes and search inputs), no "label-title-only", no colour-contrast failure on the menu badge, no empty table
// header, the ATT&CK matrix reachable from the keyboard, the chip "×" at least 24 px, the skip link and the focus moved
// to the screen's title after a menu navigation. Heading order is gated too (NV-064, 1.9.2 integration: recommendation cards, ATT&CK matrix columns, compliance import and ontology sub-headings). Other rules are reported, not gated.
import fs from 'fs';
import path from 'path';
import { open, ok, done, goto, medibec, modulesOn, TESTS } from './lib.mjs';

const AXE = fs.readFileSync(path.join(TESTS, 'vendor', 'axe.min.js'), 'utf8');
const ROUTES = ['process', 'org', 'org/crown', 'org/docs', 'org/workspaces', 'assets', 'assets/compliance', 'maturity', 'evidence', 'dashboard', 'safeguards', 'batch', 'screening/candidates',
  'register', 'scenario/S1', 'scenario/S1/links', 'calc', 'riskreg', 'mitigation', 'recs', 'summary', 'threats', 'vulns', 'feeds', 'threat', 'budget', 'export', 'backup', 'qc', 'cvss',
  'iam/overview', 'iam/accounts', 'cm/overview', 'cm/changes', 'compliance', 'compliance/requirements', 'ontology', 'settings', 'settings/ai', 'settings/modules', 'about', 'about/versions'];
const GATED = new Set(['label', 'select-name', 'label-title-only', 'empty-table-header', 'scrollable-region-focusable', 'heading-order']);   // heading-order gated since the 1.9.2 integration (NV-064)

const { browser, page, errors } = await open('#/process');
await medibec(page); await modulesOn(page, true);
await page.setViewportSize({ width: 1600, height: 1000 });
await page.evaluate(AXE + '\n;window.axe = axe; true');

const summary = {};   // rule → { impact, n, routes:Set, example }
const gated = [];
for (const [lang, theme] of [['en', 'light'], ['fr', 'light'], ['en', 'dark']]) {
  await page.evaluate(async l => { const I = await import('/js/i18n.js'); await I.setLang(l); }, lang);
  await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
  for (const r of ROUTES) {
    await goto(page, '#/' + r, /^(ontology|settings|assets|vulns|feeds|compliance)/.test(r) ? 1200 : 700);
    if (!(await page.evaluate(() => !!window.axe))) await page.evaluate(AXE + '\n;window.axe = axe; true');
    const res = await page.evaluate(async () => {
      const sec = [...document.querySelectorAll('main > section')].find(s => !s.hidden);
      const r = await axe.run(sec || document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
      return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes.slice(0, 2).map(x => x.html.slice(0, 120) + ' @ ' + x.target.join(' ')) }));
    }).catch(e => [{ id: 'axe-error', impact: 'n/a', n: 0, ex: [String(e).slice(0, 160)] }]);
    for (const v of res) {
      const s = summary[v.id] ||= { impact: v.impact, n: 0, routes: new Set(), ex: v.ex };
      s.n += v.n; s.routes.add(`${lang}-${theme}:${r}`);
      if (GATED.has(v.id)) gated.push(`${v.id} ${lang}-${theme} ${r} ×${v.n}: ${v.ex[0]}`);
    }
  }
}
for (const [id, s] of Object.entries(summary).sort((a, b) => b[1].n - a[1].n)) console.log(`  [${s.impact}] ${id}: ${s.n} node(s) on ${s.routes.size} screen(s) — e.g. ${s.ex[0]}`);
ok(gated.length === 0, `no gated violation (label, select-name, label-title-only, empty-table-header, scrollable region, heading-order) ${gated.slice(0, 6).join(' | ')}`);
ok(!summary['color-contrast'] || ![...summary['color-contrast'].routes].length, 'no colour-contrast violation reported by axe ' + (summary['color-contrast'] ? summary['color-contrast'].ex[0] : ''));
ok(!summary['axe-error'], 'axe ran on every screen');

/* ---------- the menu badge contrast (NV-064: 3.49:1 before) ---------- */
await page.evaluate(async () => { const I = await import('/js/i18n.js'); await I.setLang('en'); document.documentElement.dataset.theme = 'light'; });
await goto(page, '#/register', 600);
const badge = await page.evaluate(() => {
  const b = document.querySelector('nav .tab[aria-current="page"] .badge'); if (!b) return null;
  const cs = getComputedStyle(b), rgb = s => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
  const L = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const fg = rgb(cs.color), bg = rgb(cs.backgroundColor); const l1 = L(fg), l2 = L(bg); return { ratio: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05), fg: cs.color, bg: cs.backgroundColor, text: b.textContent };
});
ok(badge && badge.ratio >= 4.5, `current-menu badge contrast ≥ 4.5:1 (${badge?.ratio?.toFixed(2)} ${badge?.fg} on ${badge?.bg})`);

/* ---------- targets, matrix, skip link and focus ---------- */
await goto(page, '#/scenario/S1/links', 800);
const x = await page.evaluate(() => { const b = document.querySelector('#panel-scenario .chip .x'); if (!b) return null; const r = b.getBoundingClientRect(); return { w: r.width, h: r.height, type: b.type }; });
ok(x && x.w >= 24 && x.h >= 24 && x.type === 'button', `chip remove button is a 24 px target (${x?.w}×${x?.h})`);
await goto(page, '#/threats', 900);
ok(await page.evaluate(() => { const m = document.querySelector('#panel-threats .matrix'); return !!m && m.tabIndex === 0 && !!m.getAttribute('aria-label'); }), 'the ATT&CK matrix is focusable and labelled');
const skip = await page.evaluate(() => { const a = document.getElementById('skip-link'); return { there: !!a, href: a?.getAttribute('href'), text: a?.textContent }; });
ok(skip.there && skip.href === '#main', 'skip link present: ' + skip.text);
await page.evaluate(() => document.getElementById('skip-link').focus());
const skipVisible = await page.evaluate(() => { const a = document.getElementById('skip-link'); const r = a.getBoundingClientRect(); return r.top >= 0 && r.height > 0; });
ok(skipVisible, 'the skip link becomes visible when focused');
await page.keyboard.press('Enter'); await page.waitForTimeout(200);
ok(await page.evaluate(() => document.activeElement?.tagName === 'H1'), 'the skip link moves the focus to the screen title');
await page.click('nav .tab[data-panel="riskreg"]'); await page.waitForTimeout(800);
ok(await page.evaluate(() => document.activeElement?.tagName === 'H1' && document.activeElement.closest('#panel-riskreg') !== null), 'after a menu navigation the focus is on the new screen\'s title (NV-092)');
await page.click('#panel-riskreg .btnrow button:has-text("New risk")'); await page.waitForTimeout(400);
await goto(page, '#/org/profile', 700);
// accessible names through field(): label[for] points at the control; hint linked by aria-describedby
const fld = await page.evaluate(() => { const f = [...document.querySelectorAll('#panel-org .field')].find(f => f.querySelector('label') && f.querySelector('input,select,textarea')); const l = f?.querySelector('label'), c = f?.querySelector('input,select,textarea'); return { htmlFor: l?.htmlFor, id: c?.id, ok: !!l && !!c && l.htmlFor === c.id }; });
ok(fld.ok, `field(): label.htmlFor = control.id (${fld.htmlFor} / ${fld.id})`);
await page.click('#panel-org .subtabs [role="tab"]:has-text("Crown jewels")'); await page.waitForTimeout(600);
ok(await page.evaluate(() => document.activeElement?.getAttribute('role') === 'tab' && document.activeElement.getAttribute('aria-selected') === 'true'), 'a tab switch inside a screen keeps the focus on the (now selected) tab');
await goto(page, '#/riskreg', 700);
ok(await page.evaluate(() => [...document.querySelectorAll('#panel-riskreg .filterbar select')].every(s => s.getAttribute('aria-label'))), 'filter selects carry an aria-label (a11y.js)');
ok(await page.evaluate(() => [...document.querySelectorAll('#panel-riskreg table thead th')].every(th => th.textContent.trim().length > 0)), 'no empty table header (sr-only text)');
ok(errors.length === 0, 'no page errors: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t72 axe');
