// t71 — French terminology (1.9.2, NV-042, decisions FR-1…FR-3): the static gate tools/fr_terms_check.py passes, and the
// running French interface shows the decided terms where they matter most — « Éléments probants » in the menu and the
// evidence register, « Ratio rés./tol. » / « ratio risque résiduel / risque toléré » on the registers, « probabilité »
// on the risk register's 1–5 scale — with none of the retired terms anywhere on the main screens.
import { spawnSync } from 'child_process';
import path from 'path';
import { open, ok, done, goto, medibec, modulesOn, APP } from './lib.mjs';

const gate = spawnSync('python3', [path.join(APP, 'tools', 'fr_terms_check.py')], { encoding: 'utf8' });
ok(gate.status === 0 && /fr_terms_check: OK/.test(gate.stdout), 'tools/fr_terms_check.py passes: ' + gate.stdout.trim().split('\n').pop());

const { browser, page, errors } = await open('#/process');
await medibec(page); await modulesOn(page, true);
await page.evaluate(async () => { const I = await import('/js/i18n.js'); await I.setLang('fr'); }); await page.waitForTimeout(500);
// Unicode-aware boundaries: « épreuve » and « éprouvé » are not « preuve »
const RETIRED = /(?<!\p{L})vraisemblances?(?!\p{L})|(?<!\p{L})ratios? de tol[ée]rance(?!\p{L})|(?<!\p{L})preuves?(?!\p{L})(?! de concept)/iu;
const visible = () => page.evaluate(() => { const sec = [...document.querySelectorAll('main > section')].find(s => !s.hidden);
  const w = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT, { acceptNode: n => { for (let e = n.parentElement; e; e = e.parentElement) if (e.hasAttribute('data-noi18n') || /^(SCRIPT|STYLE|TEXTAREA)$/.test(e.tagName)) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; } });
  const out = []; let n; while ((n = w.nextNode())) if (n.nodeValue.trim()) out.push(n.nodeValue.trim()); return out.join('\n'); });
ok(await page.isVisible('nav >> text=Éléments probants') || await page.evaluate(() => [...document.querySelectorAll('nav .tab')].some(t => /Éléments probants/.test(t.textContent))), 'menu: « Éléments probants » (FR-3)');
ok(!(await page.evaluate(() => [...document.querySelectorAll('nav .tab')].some(t => /\bPreuves?\b/.test(t.textContent)))), 'menu: « Preuves » retired');
for (const r of ['evidence', 'register', 'riskreg', 'calc', 'recs', 'summary', 'scenario/S1', 'mitigation', 'threat', 'qc', 'process', 'dashboard']) {
  await goto(page, '#/' + r, 800);
  const txt = await visible();
  const hits = [...new Set((txt.match(new RegExp(RETIRED.source, 'giu')) || []))];
  ok(hits.length === 0, `FR screen ${r}: no retired term ${hits.join(', ')}`);
}
await goto(page, '#/register', 700);
const reg = await visible();
ok(/Ratio rés\.\/tol\./.test(reg), 'scenario register header: « Ratio rés./tol. » (FR-1 short form)');
await goto(page, '#/riskreg', 800);
const rr = await visible();
ok(/échelle probabilité × impact de 1 à 5|probabilité 1–5|Probabilité/.test(rr) && !/vraisemblance/i.test(rr), 'risk register: the 1–5 scale says « probabilité » (FR-2)');
await goto(page, '#/evidence', 800);
const ev = await visible();
ok(/Registre des éléments probants/.test(ev), 'evidence register titled « Registre des éléments probants »');
await goto(page, '#/calc', 800);
ok(/ratio risque résiduel \/ risque toléré|Ratio rés\.\/tol\./i.test(await visible()), 'calculator: the ratio carries the decided name');
await page.evaluate(async () => { const I = await import('/js/i18n.js'); await I.setLang('en'); });
ok(errors.length === 0, 'no page errors: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t71 fr terms');
