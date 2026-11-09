// t70 — French number format (1.9.2, X-6 / NV-040 / NV-093 / D6, items 12–13): on the French interface every percentage,
// amount, count and decimal drawn by the screens follows OQLF typography (« 98,27 % », « 5 311 000 $ », « 84 305 »,
// « 0,91 »), through the one set of helpers in util.js (n0 / n1 / n2 / dec / pct / pct100 / money / moneyShort) and
// trn() for plurals. The gate walks the text of the X-6 screens (IAM/CM, Budget, KRI dashboard, engine status,
// Calculator, Recommendations, Summary, Scenario register, Risk register, Information assets, Maturity, Compliance)
// and fails on any EN-formatted number: 12.5%, $5,311,000, 84,305. Exports keep plain numbers (D6) and are not read.
import { open, ok, done, goto, medibec, modulesOn } from './lib.mjs';

const { browser, page, errors } = await open('#/process');
await medibec(page);
await modulesOn(page, true);

/* ---------- the helpers themselves, in both locales ---------- */
const H = await page.evaluate(async () => {
  const U = await import('/js/util.js'); const I = await import('/js/i18n.js');
  const run = () => ({ n0: U.n0(5311000), n1: U.n1(9.3), n2: U.n2(0.9125), pct: U.pct(0.98274, 2), pct0: U.pct(0.5, 0), pct100: U.pct100(98.27, 2), money: U.money(5311000), moneyEur: U.money(1234, 'EUR'), moneyNeg: U.money(-5), short: U.moneyShort(5311000), shortK: U.moneyShort(180000), dash: U.money('x'),
    trn1: I.trn(1, '# row unknown', '# rows unknown'), trn3: I.trn(1234, '# row unknown', '# rows unknown') });
  await I.setLang('en'); const en = run();
  await I.setLang('fr'); const fr = run();
  return { en, fr };
});
ok(H.en.n0 === '5,311,000' && H.en.n1 === '9.3' && H.en.n2 === '0.91' && H.en.pct === '98.27%' && H.en.pct0 === '50%' && H.en.pct100 === '98.27%', 'EN helpers: ' + JSON.stringify(H.en));
ok(H.en.money === '$5,311,000' && H.en.moneyEur === 'EUR 1,234' && H.en.moneyNeg === '−$5' && H.en.short === '$5.3M' && H.en.shortK === '$180k' && H.en.dash === '—', 'EN money (D6): ' + H.en.money + ' ' + H.en.short);
// French grouping and the space before % / $ are non-breaking (U+202F or U+00A0 depending on the ICU build): both count
const nb = x => String(x).replace(/[\u202f\u00a0]/g, ' ');
const NBSP = /[\u202f\u00a0]/;
ok(nb(H.fr.n0) === '5 311 000' && NBSP.test(H.fr.n0) && H.fr.n1 === '9,3' && H.fr.n2 === '0,91' && nb(H.fr.pct) === '98,27 %' && NBSP.test(H.fr.pct) && nb(H.fr.pct0) === '50 %' && nb(H.fr.pct100) === '98,27 %', 'FR helpers (OQLF): ' + JSON.stringify(H.fr));
ok(nb(H.fr.money) === '5 311 000 $' && NBSP.test(H.fr.money) && nb(H.fr.moneyEur) === '1 234 EUR' && nb(H.fr.short) === '5,3 M$' && nb(H.fr.shortK) === '180 k$', 'FR money (D6): ' + H.fr.money + ' ' + H.fr.short);
ok(H.en.trn1 === '1 row unknown' && H.en.trn3 === '1,234 rows unknown', 'trn() EN: ' + H.en.trn1 + ' / ' + H.en.trn3);
ok(H.fr.trn1 === '1 ligne inconnue' && nb(H.fr.trn3) === '1 234 lignes inconnues', 'trn() FR (item 13): ' + H.fr.trn1 + ' / ' + H.fr.trn3);

/* ---------- the gate: no EN-formatted number on the FR screens ---------- */
// text drawn by the screens only: input values, user text (data-noi18n), code and the AI payloads are skipped
const TEXT = () => { const sec = [...document.querySelectorAll('main > section')].find(s => !s.hidden) || document.body;
  const w = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT, { acceptNode: n => { for (let e = n.parentElement; e; e = e.parentElement) { if (e.hasAttribute('data-noi18n') || /^(CODE|PRE|SCRIPT|STYLE|TEXTAREA|OPTION)$/.test(e.tagName)) return NodeFilter.FILTER_REJECT; } return NodeFilter.FILTER_ACCEPT; } });
  const out = []; let n; while ((n = w.nextNode())) if (n.nodeValue.trim()) out.push(n.nodeValue); return out.join('\n'); };
const EN_NUM = /\d\.\d+\s?%|(?<![\d,.])\d%|\$ ?\d[\d,]*|(?<![\d.,])\d{1,3}(?:,\d{3})+(?![\d,])/g;   // the $ of an FR amount ends a text node: a line break is never part of an EN amount
const ROUTES = ['register', 'riskreg', 'calc', 'recs', 'recs/scenarios', 'recs/roadmap', 'summary', 'budget', 'dashboard', 'iam/overview', 'iam/accounts', 'cm/overview', 'assets', 'assets/compliance', 'maturity', 'compliance', 'compliance/dashboard', 'mitigation', 'process', 'about/versions'];
await page.evaluate(async () => { const I = await import('/js/i18n.js'); await I.setLang('fr'); });
await page.waitForTimeout(500);
const found = {};
for (const r of ROUTES) {
  await goto(page, '#/' + r, /^(assets|dashboard|compliance)/.test(r) ? 1200 : 800);
  const txt = await page.evaluate(TEXT);
  const hits = [...new Set((txt.match(EN_NUM) || []))];
  if (hits.length) found[r] = hits.slice(0, 12);
  ok(!hits.length, `FR screen ${r}: no EN-formatted number ${hits.length ? JSON.stringify(hits.slice(0, 8)) : ''}`);
}
// the engine status in the footer follows the locale too
const foot = await page.evaluate(() => document.getElementById('engine-state').textContent);
ok(/moteur vérifié · 84 305 \/ 41 023/.test(nb(foot)), 'engine status in French: ' + foot);
await page.evaluate(async () => { const I = await import('/js/i18n.js'); await I.setLang('en'); });
await page.waitForTimeout(300);
ok(/engine verified · 84,305 \/ 41,023/.test(await page.evaluate(() => document.getElementById('engine-state').textContent)), 'engine status back in English');
ok(errors.length === 0, 'no page errors: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t70 fr numbers');
