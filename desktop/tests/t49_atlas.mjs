// t49 — the Atlas design system (1.9.0): tokens, bundled fonts (also offline), the Scenario editor's tabs and live risk
// indices, the Process deep links to a tab, WCAG AA contrast of the key token pairs in both themes, and reduced motion.
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { open, ok, done, goto, medibec, URL, PORT, APP, serveCmd } from './lib.mjs';

const FONTS = fs.readdirSync(path.join(APP, 'fonts')).filter(f => f.endsWith('.woff2'));

/* ---------- static: files, cache, CSP, licences ---------- */
const sw = fs.readFileSync(path.join(APP, 'sw.js'), 'utf8');
const css = fs.readFileSync(path.join(APP, 'styles.css'), 'utf8');
const html = fs.readFileSync(path.join(APP, 'index.html'), 'utf8');
ok(FONTS.length === 6, `six bundled font files (${FONTS.length})`);
ok(FONTS.every(f => sw.includes(`"fonts/${f}"`)), 'every font file is in the offline cache (sw.js)');
ok(FONTS.every(f => css.includes(`fonts/${f}`)), 'every font file is declared by an @font-face');
ok(!/fonts\.googleapis|fonts\.gstatic|@import\s+url\(\s*["']?https?:/i.test(css + html), 'no font CDN');
ok(/font-src 'self'/.test(html), "the CSP allows the bundled fonts (font-src 'self')");
for (const l of ['Sora-OFL-1.1.txt', 'AtkinsonHyperlegible-OFL-1.1.txt']) ok(fs.existsSync(path.join(APP, 'licences', l)), 'licence text ' + l);
ok(/Sora/.test(fs.readFileSync(path.join(APP, 'NOTICE.md'), 'utf8')) && /Atkinson Hyperlegible/.test(fs.readFileSync(path.join(APP, 'NOTICE.md'), 'utf8')), 'NOTICE names both typefaces');

const { browser, ctx, page, errors } = await open('#/process');
await medibec(page);

/* ---------- tokens and fonts ---------- */
const tok = await page.evaluate(() => { const cs = getComputedStyle(document.documentElement); const g = k => cs.getPropertyValue(k).trim().toUpperCase();
  return { rail: g('--rail'), bg: g('--bg'), ink: g('--ink'), coral: g('--coral'), gold: g('--gold'), good: g('--good'), bad: g('--bad'), badBg: g('--bad-bg'), surface: g('--surface') }; });
ok(tok.rail === '#103B30' && tok.bg === '#E6EEE9' && tok.ink === '#10201B' && tok.coral === '#E2552B' && tok.gold === '#D9A520' && tok.good === '#0F5C45'
  && tok.bad === '#9A3414' && tok.badBg === '#FBE3DA' && tok.surface === '#FFFFFF', 'Atlas tokens present ' + JSON.stringify(tok));
const fonts = await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([document.fonts.load('600 20px Sora'), document.fonts.load('400 14px "Atkinson Hyperlegible"'), document.fonts.load('700 14px "Atkinson Hyperlegible"')]);
  const h1 = getComputedStyle(document.querySelector('#panel-process h1')).fontFamily, body = getComputedStyle(document.body).fontFamily;
  return { sora: document.fonts.check('600 20px Sora'), atk: document.fonts.check('400 14px "Atkinson Hyperlegible"'), h1, body,
    loaded: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '') + ' ' + f.weight) };
});
ok(fonts.sora && fonts.atk, 'Sora and Atkinson Hyperlegible load from the application ' + fonts.loaded.join(', '));
ok(/^"?Sora/.test(fonts.h1) && /^"?Atkinson Hyperlegible/.test(fonts.body), `headings in Sora, body in Atkinson Hyperlegible (${fonts.h1} | ${fonts.body})`);

/* ---------- Process: ring, next-step band, seven tiles, group rows ---------- */
const pr = await page.evaluate(() => ({ ring: document.querySelector('#panel-process svg.ring')?.getAttribute('aria-label') || '',
  band: !!document.querySelector('#panel-process .next-step h2'), tiles: document.querySelectorAll('#panel-process .ptile[data-group]').length,
  expanded: [...document.querySelectorAll('#panel-process .ptile[aria-expanded="true"]')].map(t => t.dataset.group), rows: document.querySelectorAll('#process-group .prow').length,
  steps: document.querySelectorAll('#panel-process .pstep').length }));
ok(/of 19 steps done/.test(pr.ring), 'progress ring with its text alternative: ' + pr.ring);
ok(pr.band && pr.tiles === 7 && pr.expanded.length === 1 && pr.rows > 0, `next-step band, seven group tiles, one group expanded (${pr.tiles}, ${pr.expanded}, ${pr.rows} rows)`);
ok(pr.steps === 20, 'all nineteen steps and the report stay on the page (behind a disclosure)');
await page.click('#panel-process .ptile[data-group="quant"]'); await page.waitForTimeout(200);
ok(await page.evaluate(() => document.querySelector('.ptile[data-group="quant"]').getAttribute('aria-expanded') === 'true'
  && [...document.querySelectorAll('#process-group .prow')].map(r => r.dataset.step).join() === 'quantify,cvss,evaluate'), 'a tile opens its group: steps 9, 10 and 11');

/* ---------- Process deep links: step 9 → Quantification, step 8 → Causal chain, step 10 → CVSS ---------- */
const tabOf = () => page.evaluate(() => document.querySelector('#panel-scenario [role="tab"][aria-selected="true"]')?.dataset.tab || '');
for (const [step, tab] of [['quantify', 'quant'], ['scenarios', 'chain'], ['cvss', 'cvss']]) {
  await goto(page, '#/process', 700);
  await page.evaluate(() => { document.getElementById('process-all').open = true; });
  await page.click(`#step-${step} button:has-text("Open Scenario editor")`); await page.waitForTimeout(800);
  const t = await tabOf();
  ok(/#\/scenario/.test(page.url()) && t === tab, `Process step ${step} opens the Scenario editor on ${tab} (${t})`);
  ok(await page.isVisible(`#scen-panel-${tab}`) && (await page.locator('#panel-scenario .scen-panel:not([hidden])').count()) === 1, `only the ${tab} panel is shown`);
}
// from the group rows too
await goto(page, '#/process', 700);
await page.click('#panel-process .ptile[data-group="quant"]'); await page.waitForTimeout(150);
await page.click('#process-group .prow[data-step="cvss"] button'); await page.waitForTimeout(800);
ok(await tabOf() === 'cvss', 'the group row of step 10 opens the CVSS v4.0 tab');

/* ---------- Scenario editor: tabs, ARIA, keyboard, remembered choice, address ---------- */
await goto(page, '#/scenario/S2', 800);
const aria = await page.evaluate(() => { const l = document.querySelector('#panel-scenario [role="tablist"]'); const tabs = [...l.querySelectorAll('[role="tab"]')];
  return { label: l.getAttribute('aria-label'), names: tabs.map(t => t.textContent.trim()), sel: tabs.filter(t => t.getAttribute('aria-selected') === 'true').length,
    tabindex: tabs.map(t => t.tabIndex), panels: tabs.every(t => { const p = document.getElementById(t.getAttribute('aria-controls')); return p && p.getAttribute('role') === 'tabpanel' && p.getAttribute('aria-labelledby') === t.id; }) }; });
ok(aria.names.join('|') === 'Causal chain|Quantification|CVSS v4.0|Treatment|Links & evidence|Ontology · CRGO', 'six tabs: ' + aria.names.join(' | '));
ok(aria.label && aria.sel === 1 && aria.tabindex.filter(x => x === 0).length === 1 && aria.panels, 'tablist labelled, one selected, roving tabindex, panels labelled by their tab');
await page.click('#scen-tab-chain'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
ok(await tabOf() === 'quant' && await page.evaluate(() => document.activeElement?.id) === 'scen-tab-quant', 'ArrowRight moves focus and selection to Quantification');
await page.keyboard.press('End'); ok(await tabOf() === 'onto', 'End selects the last tab');
await page.keyboard.press('ArrowRight'); ok(await tabOf() === 'chain', 'ArrowRight wraps to the first tab');
await page.keyboard.press('ArrowLeft'); await page.keyboard.press('Home'); ok(await tabOf() === 'chain', 'Home selects the first tab');
await page.click('#scen-tab-treat'); await goto(page, '#/scenario/S3', 700);
ok(await tabOf() === 'treat', 'the tab chosen is remembered on the next scenario');
const key = await page.evaluate(() => Object.keys(localStorage).find(k => k.startsWith('crg-scen-tab:')) || '');
ok(/^crg-scen-tab:/.test(key), 'remembered per person (' + key + ')');
await goto(page, '#/scenario/S3/links', 700);
ok(await tabOf() === 'links', 'an address #/scenario/S3/links opens that tab');
await page.click('#scen-tab-quant'); ok(!/\/links$/.test(page.url()), 'choosing a tab drops it from the address');
await page.click('#scen-tab-treat');

/* ---------- the live risk indices: recalculated on every edit, by the engine ---------- */
await goto(page, '#/scenario/S2', 800);
const card = () => page.evaluate(() => { const c = document.getElementById('scen-riskcard');
  return { ratio: c.querySelector('#rk-ratio')?.textContent || '', dd: [...c.querySelectorAll('dd')].map(d => d.textContent), cost: c.querySelector('.rk-cost')?.textContent || '', vis: !!c.offsetParent }; });
const c0 = await card();
const eng = await page.evaluate(async () => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S2'); const r = CRG.calc(s, st.S.ws.assessment.APPETITE, st.S.ws.assessment.FACTOR);
  return { ratio: r.ratio.toFixed(2), est: Math.round(r.est).toLocaleString('en-US'), res: Math.round(r.res).toLocaleString('en-US'), pre: r.pre_ratio.toFixed(2), de: s.params.De.v }; });
ok(c0.vis && c0.ratio === eng.ratio && c0.dd.length === 6 && c0.dd[1] === eng.est && c0.dd[4] === eng.res && c0.dd[5] === eng.pre && /\$/.test(c0.cost),
  `risk card = engine (ratio ${c0.ratio}, six indices ${c0.dd.join(' / ')}, year-1 cost)`);
await page.click('#scen-tab-quant');
const de = page.locator('#scen-panel-quant .paramgrid input[type="number"]').nth(2);   // δe: moves the estimate and the ratio
await de.fill(String(Math.max(0, eng.de - 0.3).toFixed(2))); await page.waitForTimeout(200);
const c1 = await card();
const eng1 = await page.evaluate(async () => { const st = await import('/js/state.js'); const r = CRG.calc(st.S.ws.assessment.SCEN.find(x => x.id === 'S2'), st.S.ws.assessment.APPETITE, st.S.ws.assessment.FACTOR); return r.ratio.toFixed(2); });
ok(c1.ratio !== c0.ratio && c1.dd[1] !== c0.dd[1] && c1.ratio === eng1, `editing δe recalculates the card at once (${c0.ratio} → ${c1.ratio}, engine ${eng1})`);
await page.click('#scen-tab-treat');
ok((await card()).vis, 'the risk card stays visible whatever the tab');
await page.evaluate(async v => { const st = await import('/js/state.js'); st.S.ws.assessment.SCEN.find(x => x.id === 'S2').params.De.v = v; st.touch(); }, eng.de);

/* ---------- contrast of the key token pairs (WCAG AA 4.5:1 for text), light and dark ---------- */
const PAIRS = [['--ink', '--bg'], ['--ink', '--surface'], ['--muted', '--bg'], ['--muted', '--surface'], ['--muted', '--surface-2'], ['--accent', '--surface'], ['--accent', '--bg'],
  ['--good', '--good-bg'], ['--warn', '--warn-bg'], ['--bad', '--bad-bg'], ['--todo', '--todo-bg'], ['--btn-ink', '--btn'], ['#FFFFFF', '--coral-ink'],
  ['--rail-ink', '--rail'], ['--rail-muted', '--rail'], ['--peach', '--rail'], ['#FFFFFF', '--rail'], ['--ai-ink', '--ai'], ['--danger-ink', '--bad'], ['--toast-ink', '--toast']];
const contrast = theme => page.evaluate(([pairs, theme]) => {
  document.documentElement.dataset.theme = theme;
  const cs = getComputedStyle(document.documentElement);
  const hex = v => { v = v.startsWith('--') ? cs.getPropertyValue(v).trim() : v; const m = /^#([0-9a-f]{6})$/i.exec(v); return m ? m[1] : null; };
  const L = h => { const c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(x => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  return pairs.map(([f, b]) => { const F = hex(f), B = hex(b); if (!F || !B) return [f, b, null]; const [a, c] = [L(F), L(B)].sort((x, y) => y - x); return [f, b, +((a + 0.05) / (c + 0.05)).toFixed(2)]; });
}, [PAIRS, theme]);
for (const theme of ['light', 'dark']) {
  const res = await contrast(theme);
  const bad = res.filter(r => r[2] === null || r[2] < 4.5);
  ok(!bad.length, `${theme}: every key text pair ≥ 4.5:1 (${res.length} pairs) ${bad.map(r => r.join(' ')).join('; ')}`);
}
await page.evaluate(() => { delete document.documentElement.dataset.theme; });
// non-text: the focus ring against the page and the surfaces (WCAG 1.4.11, 3:1)
const ring = await page.evaluate(() => { const cs = getComputedStyle(document.documentElement); const L = h => { h = h.trim().slice(1); const c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(x => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const r = (a, b) => { const [x, y] = [L(cs.getPropertyValue(a)), L(cs.getPropertyValue(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  return [r('--focus', '--bg'), r('--focus', '--surface'), r('--focus-dark', '--rail')].map(x => +x.toFixed(2)); });
ok(ring.every(x => x >= 3), 'focus rings ≥ 3:1 against page, surface and rail ' + ring.join(' / '));
// a visible focus ring on a tab, a button and a menu entry
await goto(page, '#/scenario/S2', 600);
await page.focus('#scen-tab-chain'); await page.keyboard.press('ArrowRight');
const fr = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle + ' ' + s.outlineWidth; });
ok(/solid 3px/.test(fr), 'keyboard focus on a tab draws a 3px ring: ' + fr);

/* ---------- the Virtual consultant slide-over: dialog semantics, Escape closes and returns focus ---------- */
await page.click('#consult-toggle'); await page.waitForTimeout(400);
const so = await page.evaluate(() => { const p = document.getElementById('consult-panel'); return { role: p.getAttribute('role'), modal: p.getAttribute('aria-modal'), lab: !!document.getElementById(p.getAttribute('aria-labelledby') || '-'), exp: document.getElementById('consult-toggle').getAttribute('aria-expanded'), inside: p.contains(document.activeElement) }; });
ok(so.role === 'dialog' && so.modal === 'false' && so.lab && so.exp === 'true' && so.inside, 'the consultant opens as a labelled non-modal dialog with focus inside ' + JSON.stringify(so));
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
ok(await page.evaluate(() => document.getElementById('consult-panel').hidden && document.activeElement?.id === 'consult-toggle'), 'Escape closes it and returns focus to its button');

/* ---------- reduced motion: the page-load reveal is skipped ---------- */
const anim = async reduce => {
  const c = await browser.newContext({ serviceWorkers: 'block', reducedMotion: reduce ? 'reduce' : 'no-preference' });
  const p = await c.newPage(); await p.goto(URL + '#/process');
  await p.waitForSelector('#panel-process .ptile', { timeout: 20000 });
  const r = await p.evaluate(() => { const t = document.querySelector('#panel-process .ptile'); return { boot: document.body.classList.contains('boot'), name: getComputedStyle(t).animationName }; });
  await p.waitForTimeout(1800);
  const after = await p.evaluate(() => document.body.classList.contains('boot'));
  await c.close(); return { ...r, after };
};
const moving = await anim(false), still = await anim(true);
ok(moving.boot && moving.name === 'atlas-pop' && !moving.after, 'one staggered reveal at load, then it is gone ' + JSON.stringify(moving));
ok(still.name === 'none', 'prefers-reduced-motion: no reveal animation ' + JSON.stringify(still));

/* ---------- French: the new labels are translated ---------- */
await page.evaluate(async () => (await import('/js/i18n.js')).setLang('fr')); await page.waitForTimeout(500);
await goto(page, '#/scenario/S2', 800);
const frTabs = await page.evaluate(() => [...document.querySelectorAll('#panel-scenario [role="tab"]')].map(t => t.textContent.trim()).join('|'));
ok(frTabs === 'Chaîne causale|Quantification|CVSS v4.0|Traitement|Liens et preuves|Ontologie · CRGO', 'French tabs: ' + frTabs);
await goto(page, '#/process', 800);
ok(/Sept groupes/.test(await page.textContent('#panel-process')) && /étapes sur 19 terminées/.test(await page.evaluate(() => document.querySelector('svg.ring').getAttribute('aria-label'))), 'French Process page');
await page.evaluate(async () => (await import('/js/i18n.js')).setLang('en')); await page.waitForTimeout(300);
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close();

/* ---------- offline: the fonts come from the service worker's cache ---------- */
{
  const b = await chromium.launch();
  const c = await b.newContext({ serviceWorkers: 'allow' });
  const p = await c.newPage();
  await p.goto(URL + '#/process');
  await p.waitForFunction(() => navigator.serviceWorker.controller || false, null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(2500); await p.reload().catch(() => {}); await p.waitForTimeout(2500);
  execSync(`fuser -k ${PORT}/tcp || pkill -f 'serve.py ${PORT}$' || true`); await p.waitForTimeout(800);
  await p.reload();
  await p.waitForFunction(async () => { const m = await import('/js/state.js'); return !!m.S.ws; }, null, { timeout: 20000, polling: 300 });
  const off = await p.evaluate(async () => { await document.fonts.ready; await document.fonts.load('600 20px Sora'); await document.fonts.load('400 14px "Atkinson Hyperlegible"');
    const st = await Promise.all(['sora-latin-600-normal.woff2', 'atkinson-hyperlegible-latin-400-normal.woff2'].map(async f => (await fetch('/fonts/' + f)).status));
    return { sora: document.fonts.check('600 20px Sora'), atk: document.fonts.check('400 14px "Atkinson Hyperlegible"'), st }; });
  ok(off.sora && off.atk && off.st.every(x => x === 200), 'offline: both typefaces load from the cache ' + JSON.stringify(off));
  await b.close(); execSync(serveCmd());
}
done('t49 atlas');
