// 1.8.0 — the evidence register screen (assessment.EVIDENCE): E-numbers, types, strength, citations.
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example') || (await (async () => { await new Promise(r => setTimeout(r, 1000)); await st.refreshList(); return st.S.list.find(w => w.kind === 'example'); })()); await st.select(ex.id); location.hash = '#/evidence'; });
await page.waitForTimeout(800);
ok(await page.isVisible('#panel-evidence h1:text-is("Evidence register")'), 'evidence register screen');
ok(await page.isVisible('nav a[data-panel="evidence"]'), 'in the side menu');
const n = await page.$$eval('#panel-evidence table tbody tr', x => x.length);
ok(n === 12, 'MediBec evidence E1–E12 listed: ' + n);
ok(await page.isVisible('#panel-evidence td >> text=E6') && await page.isVisible('#panel-evidence >> text=Exercise or simulation'), 'types inferred (E6 is exercise material)');
const cites = await page.evaluate(async () => (await import('/js/panels/evidence.js')).citations());
ok((cites.E6 || []).length > 0 && (cites.E1 || []).length > 0, 'citations found in the scenario parameters ' + (cites.E6 || []).slice(0, 3));
// add evidence; invalid id refused
await page.click('#ev-add'); await page.waitForSelector('#ev-editor');
ok(await page.inputValue('#ev-id') === 'E13', 'next id proposed: E13');
await page.fill('#ev-id', 'X1'); await page.fill('#ev-title', 'Test'); await page.click('#ev-save'); await page.waitForTimeout(300);
ok(await page.isVisible('text=An evidence ID reads E1, E2'), 'invalid id refused');
await page.fill('#ev-id', 'E13'); await page.selectOption('#ev-type', 'sme'); await page.fill('#ev-sup', 'Interview of the CIO on backups'); await page.click('#ev-save'); await page.waitForTimeout(400);
const last = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.EVIDENCE.at(-1));
ok(last[0] === 'E13' && last[2] === 'SME input' && last[3] === 'Interview of the CIO on backups', 'saved with its type ' + JSON.stringify(last));
// context documents proposed once each
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.docs = [{ id: 'd1', name: 'Case.pdf', added: '2026-10-01' }]; st.touch(); });
await page.click('#ev-docs'); await page.waitForTimeout(300); await page.click('#ev-docs'); await page.waitForTimeout(300);
const docs = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.EVIDENCE.filter(r => r[1] === 'Case.pdf'));
ok(docs.length === 1 && /Information gap — organizational validation required/.test(docs[0][3]), 'a document is proposed once, with the information-gap marker');
// process step 1 counts the register; help anchor
const p = await page.evaluate(async () => { const P = await import('/js/process.js'); const st = await import('/js/state.js'); return P.partsOf(P.STEP.setup, st.S.ws).find(x => /evidence register/.test(x.what)).ok; });
ok(p, 'Process step 1: the evidence register part is done');
await page.click('#panel-evidence .help-q, #panel-evidence button[aria-label*="Help"], #panel-evidence h1 + button').catch(() => {});
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t27 evidence register');
