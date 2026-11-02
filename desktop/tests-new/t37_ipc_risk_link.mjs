// Identity, privilege & configuration — risk link: Record as evidence → next E-number cited, scenarios untouched by linking and saving
// a proposal, Accept writes parameter + ipc_basis + revisions + revisionLog, Dismiss needs a reason, crg.js unchanged.
import { open, ok, done, URL } from './lib.mjs';
import { ipcOn, goto } from './ipc_lib.mjs';
import crypto from 'crypto';
import fs from 'fs';
const CRG_SHA = '358816882e46fb2f58bdec0ecdce7e7d4dba7902fd5262e59f06f81df96b688b';
const { browser, page, errors } = await open('#/process');
await ipcOn(page);
await goto(page, '#/ipc/findings', 900);
const scen0 = await page.evaluate(async () => JSON.stringify((await import('/js/state.js')).S.ws.assessment.SCEN));
// record the derived IR-01 finding on AP-03 (service accounts without an owner)
await page.click('#ipc-proposed button[data-rule="IR-01"][data-row="AP-03"]'); await page.waitForTimeout(300);
let f = await page.evaluate(async () => (await import('/js/state.js')).S.ws.ipc.findings.at(-1));
ok(f.rule === 'IR-01' && f.rowId === 'AP-03' && f.state === 'recorded' && f.id === 'IF-06', 'finding recorded ' + f.id);
// link a scenario: scenario not modified
await page.click(`#ipc-recorded button[data-act="link"][data-f="${f.id}"]`); await page.waitForSelector('#ipc-link-scen');
await page.selectOption('#ipc-link-scen', 'S5'); await page.selectOption('#ipc-link-param', 'Pbx'); await page.click('#ipc-link-save'); await page.waitForTimeout(300);
ok(await page.evaluate(async () => JSON.stringify((await import('/js/state.js')).S.ws.assessment.SCEN)) === scen0, 'linking does not modify SCEN');
// record as evidence
await page.click(`#ipc-recorded button[data-act="evidence"][data-f="${f.id}"]`); await page.waitForTimeout(300);
const ev = await page.evaluate(async () => { const ws = (await import('/js/state.js')).S.ws; const E = await import('/js/panels/evidence.js'); const f = ws.ipc.findings.at(-1); return { eid: f.eid, row: ws.assessment.EVIDENCE.at(-1), cites: E.citations()[f.eid] }; });
ok(ev.eid === 'E16' && ev.row[0] === 'E16' && /Supports: S5 Pb\(ψ,A\)/.test(ev.row[3]) && ev.row[4] === 'moderate' && ev.row[5] === 'verified', 'Record as evidence → E16, confirmed row: moderate, verified ' + JSON.stringify(ev.row));
ok((ev.cites || []).some(c => /S5 IPC IF-06/.test(c)), 'citations() counts the E-number ' + ev.cites);
// propose: saving changes nothing
await page.click(`#ipc-recorded button[data-act="propose"][data-f="${f.id}"]`); await page.waitForSelector('#ipc-prop-to');
await page.selectOption('#ipc-prop-scen', 'S5');
ok(await page.inputValue('#ipc-prop-to') === '', 'no computed default: the analyst types the value');
await page.click('#ipc-prop-save'); await page.waitForTimeout(200);
ok(await page.isVisible('.modal >> text=Type the proposed value'), 'empty value refused');
await page.fill('#ipc-prop-to', '0.8'); await page.selectOption('#ipc-prop-conf', 'Medium');
ok(/→/.test(await page.textContent('.modal')), 'ratio now → after shown');
await page.click('#ipc-prop-save'); await page.waitForTimeout(300);
ok(await page.evaluate(async () => JSON.stringify((await import('/js/state.js')).S.ws.assessment.SCEN)) === scen0, 'saving a proposal does not modify SCEN');
// a second proposal to dismiss
await page.evaluate(async () => { const st = await import('/js/state.js'); const I = await import('/js/ipc.js'); const f = st.S.ws.ipc.findings.at(-1); I.propose(st.S.ws, f, { scenario: 'S1', param: 'Th', to: 0.3, conf: 'Low' }); st.touch(); });
await goto(page, '#/ipc/overview', 300); await goto(page, '#/ipc/findings', 800);
page.once('dialog', d => d.accept(''));
await page.locator('#ipc-proposals button[data-act="dismiss"]').nth(1).click(); await page.waitForTimeout(300);
let ps = await page.evaluate(async () => (await import('/js/state.js')).S.ws.ipc.findings.at(-1).proposals.map(p => p.state));
ok(ps[1] === 'proposed', 'dismiss without a reason refused');
page.once('dialog', d => d.accept('Resilience reading comes from the questionnaire'));
await page.locator('#ipc-proposals button[data-act="dismiss"]').nth(1).click(); await page.waitForTimeout(300);
ps = await page.evaluate(async () => (await import('/js/state.js')).S.ws.ipc.findings.at(-1).proposals.map(p => [p.state, p.reason]));
ok(ps[1][0] === 'dismissed' && /questionnaire/.test(ps[1][1]), 'dismissed with its reason');
// accept
const before = await page.evaluate(async () => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S5'); return { v: s.params.Pbx.v, ev: s.params.Pbx.ev, log: (st.S.ws.revisionLog || []).length }; });
page.once('dialog', d => d.accept());
await page.locator('#ipc-proposals button[data-act="accept"]').first().click(); await page.waitForTimeout(500);
const a = await page.evaluate(async () => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S5'); return { p: s.params.Pbx, basis: s.ipc_basis, rev: (s.revisions || []).at(-1), log: st.S.ws.revisionLog.at(-1), n: st.S.ws.revisionLog.length, st: st.S.ws.ipc.findings.at(-1).proposals[0].state }; });
ok(a.p.v === 0.8 && a.p.conf === 'Medium' && a.p.ev === [before.ev, 'E16'].filter(Boolean).join('; '), 'Accept writes the parameter, confidence and evidence ' + JSON.stringify(a.p).slice(0, 160));
ok(a.basis?.length === 1 && a.basis[0].finding === 'IF-06' && a.basis[0].eid === 'E16' && a.basis[0].from === before.v && a.basis[0].to === 0.8, 'ipc_basis recorded');
ok(/IF-06/.test(a.rev?.what || ''), 'scenario revision recorded');
ok(a.n === before.log + 1 && a.log.scenario === 'S5' && a.log.cause === 'IPC IF-06: E16' && a.log.from === before.v && a.log.to === 0.8 && 'ratioFrom' in a.log && 'clsTo' in a.log, 'revisionLog line ' + JSON.stringify(a.log).slice(0, 200));
ok(a.st === 'accepted', 'proposal state accepted');
// scenario editor: read-only IPC evidence
await goto(page, '#/scenario/S5', 900);
ok(await page.isVisible('#ipc-scenario') && /E16/.test(await page.textContent('#ipc-scenario')), 'Scenario editor lists the linked IPC evidence');
// the engine file is unchanged
const sha = crypto.createHash('sha256').update(fs.readFileSync(new globalThis.URL('../app/crg.js', import.meta.url))).digest('hex');
ok(sha === CRG_SHA, 'crg.js identical to the 1.8.2 engine (SHA-256 ' + sha.slice(0, 12) + ')');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t37 ipc risk link');
