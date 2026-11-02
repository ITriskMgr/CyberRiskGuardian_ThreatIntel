// Identity & access management and Configuration management — risk link: Record as evidence → next E-number cited, scenarios untouched by
// linking and saving a proposal, Accept writes parameter + ipc_basis (with its module) + revisions + revisionLog, Dismiss needs a reason,
// one finding-id sequence across both modules, corrective actions name their module, crg.js unchanged.
import { open, ok, done, URL, modulesOn, goto } from './lib.mjs';
import crypto from 'crypto';
import fs from 'fs';
const CRG_SHA = '358816882e46fb2f58bdec0ecdce7e7d4dba7902fd5262e59f06f81df96b688b';
const { browser, page, errors } = await open('#/process');
await modulesOn(page);
await goto(page, '#/iam/findings', 900);
const scen0 = await page.evaluate(async () => JSON.stringify((await import('/js/state.js')).S.ws.assessment.SCEN));
// record the derived IR-01 finding on AP-03 (service accounts without an owner)
await page.click('#iam-proposed button[data-rule="IR-01"][data-row="AP-03"]'); await page.waitForTimeout(300);
let f = await page.evaluate(async () => (await import('/js/state.js')).S.ws.iam.findings.at(-1));
ok(f.rule === 'IR-01' && f.rowId === 'AP-03' && f.state === 'recorded' && f.id === 'IF-06', 'finding recorded ' + f.id);
// link a scenario: scenario not modified
await page.click(`#iam-recorded button[data-act="link"][data-f="${f.id}"]`); await page.waitForSelector('#iam-link-scen');
await page.selectOption('#iam-link-scen', 'S5'); await page.selectOption('#iam-link-param', 'Pbx'); await page.click('#iam-link-save'); await page.waitForTimeout(300);
ok(await page.evaluate(async () => JSON.stringify((await import('/js/state.js')).S.ws.assessment.SCEN)) === scen0, 'linking does not modify SCEN');
// record as evidence
await page.click(`#iam-recorded button[data-act="evidence"][data-f="${f.id}"]`); await page.waitForTimeout(300);
const ev = await page.evaluate(async () => { const ws = (await import('/js/state.js')).S.ws; const E = await import('/js/panels/evidence.js'); const f = ws.iam.findings.at(-1); return { eid: f.eid, row: ws.assessment.EVIDENCE.at(-1), cites: E.citations()[f.eid] }; });
ok(ev.eid === 'E16' && ev.row[0] === 'E16' && /Supports: S5 Pb\(ψ,A\)/.test(ev.row[3]) && ev.row[4] === 'moderate' && ev.row[5] === 'verified', 'Record as evidence → E16, confirmed row: moderate, verified ' + JSON.stringify(ev.row));
ok((ev.cites || []).some(c => /S5 IAM IF-06/.test(c)), 'citations() counts the E-number ' + ev.cites);
// propose: saving changes nothing
await page.click(`#iam-recorded button[data-act="propose"][data-f="${f.id}"]`); await page.waitForSelector('#iam-prop-to');
await page.selectOption('#iam-prop-scen', 'S5');
ok(await page.inputValue('#iam-prop-to') === '', 'no computed default: the analyst types the value');
await page.click('#iam-prop-save'); await page.waitForTimeout(200);
ok(await page.isVisible('.modal >> text=Type the proposed value'), 'empty value refused');
await page.fill('#iam-prop-to', '0.8'); await page.selectOption('#iam-prop-conf', 'Medium');
ok(/→/.test(await page.textContent('.modal')), 'ratio now → after shown');
await page.click('#iam-prop-save'); await page.waitForTimeout(300);
ok(await page.evaluate(async () => JSON.stringify((await import('/js/state.js')).S.ws.assessment.SCEN)) === scen0, 'saving a proposal does not modify SCEN');
// a second proposal to dismiss
await page.evaluate(async () => { const st = await import('/js/state.js'); const I = await import('/js/iam.js'); const f = st.S.ws.iam.findings.at(-1); I.propose(st.S.ws, f, { scenario: 'S1', param: 'Th', to: 0.3, conf: 'Low' }); st.touch(); });
await goto(page, '#/iam/overview', 300); await goto(page, '#/iam/findings', 800);
page.once('dialog', d => d.accept(''));
await page.locator('#iam-proposals button[data-act="dismiss"]').nth(1).click(); await page.waitForTimeout(300);
let ps = await page.evaluate(async () => (await import('/js/state.js')).S.ws.iam.findings.at(-1).proposals.map(p => p.state));
ok(ps[1] === 'proposed', 'dismiss without a reason refused');
page.once('dialog', d => d.accept('Resilience reading comes from the questionnaire'));
await page.locator('#iam-proposals button[data-act="dismiss"]').nth(1).click(); await page.waitForTimeout(300);
ps = await page.evaluate(async () => (await import('/js/state.js')).S.ws.iam.findings.at(-1).proposals.map(p => [p.state, p.reason]));
ok(ps[1][0] === 'dismissed' && /questionnaire/.test(ps[1][1]), 'dismissed with its reason');
// accept
const before = await page.evaluate(async () => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S5'); return { v: s.params.Pbx.v, ev: s.params.Pbx.ev, log: (st.S.ws.revisionLog || []).length }; });
page.once('dialog', d => d.accept());
await page.locator('#iam-proposals button[data-act="accept"]').first().click(); await page.waitForTimeout(500);
const a = await page.evaluate(async () => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S5'); return { p: s.params.Pbx, basis: s.ipc_basis, rev: (s.revisions || []).at(-1), log: st.S.ws.revisionLog.at(-1), n: st.S.ws.revisionLog.length, st: st.S.ws.iam.findings.at(-1).proposals[0].state }; });
ok(a.p.v === 0.8 && a.p.conf === 'Medium' && a.p.ev === [before.ev, 'E16'].filter(Boolean).join('; '), 'Accept writes the parameter, confidence and evidence ' + JSON.stringify(a.p).slice(0, 160));
ok(a.basis?.length === 1 && a.basis[0].module === 'iam' && a.basis[0].finding === 'IF-06' && a.basis[0].eid === 'E16' && a.basis[0].from === before.v && a.basis[0].to === 0.8, 'ipc_basis recorded with its module');
ok(/from identity & access management finding IF-06 \(E16\)/.test(a.rev?.what || ''), 'scenario revision recorded ' + a.rev?.what);
ok(a.n === before.log + 1 && a.log.scenario === 'S5' && a.log.cause === 'IAM IF-06: E16' && a.log.from === before.v && a.log.to === 0.8 && 'ratioFrom' in a.log && 'clsTo' in a.log, 'revisionLog line ' + JSON.stringify(a.log).slice(0, 200));
ok(a.st === 'accepted', 'proposal state accepted');
// scenario editor: read-only IPC evidence
// Configuration management: the next finding takes the next identifier of the one sequence, its evidence the next E-number
await goto(page, '#/cm/findings', 900);
await page.click('#cm-proposed button[data-rule="IR-13"][data-row="CH-03"]'); await page.waitForTimeout(300);
const g = await page.evaluate(async () => (await import('/js/state.js')).S.ws.cm.findings.at(-1));
ok(g.rule === 'IR-13' && g.id === 'IF-07', 'CM finding recorded with the next identifier of the one sequence ' + g.id);
await page.click(`#cm-recorded button[data-act="link"][data-f="${g.id}"]`); await page.waitForSelector('#cm-link-scen');
await page.selectOption('#cm-link-scen', 'S6'); await page.selectOption('#cm-link-param', 'Pbx'); await page.click('#cm-link-save'); await page.waitForTimeout(300);
await page.click(`#cm-recorded button[data-act="evidence"][data-f="${g.id}"]`); await page.waitForTimeout(300);
await page.locator(`#cm-recorded tr:has(button[data-f="${g.id}"]) button`, { hasText: 'Raise an action' }).click(); await page.waitForTimeout(300);
const ce = await page.evaluate(async () => { const ws = (await import('/js/state.js')).S.ws; const E = await import('/js/panels/evidence.js'); const f = ws.cm.findings.at(-1);
  return { eid: f.eid, cites: E.citations()[f.eid], act: ws.shared.actions.find(a => a.id === f.action)?.source }; });
ok(ce.eid === 'E17' && (ce.cites || []).some(c => /S6 CM IF-07/.test(c)) && ce.act?.kind === 'cm-finding' && ce.act?.id === 'IF-07', 'CM evidence E17 cited; the corrective action names its module ' + JSON.stringify(ce));
await page.evaluate(async () => { const st = await import('/js/state.js'); const C = await import('/js/cm.js'); const f = st.S.ws.cm.findings.at(-1); C.propose(st.S.ws, f, { scenario: 'S6', param: 'Pbx', to: 0.9, conf: 'Low' }); st.touch(); });
await goto(page, '#/cm/overview', 300); await goto(page, '#/cm/findings', 800);
page.once('dialog', d => d.accept());
await page.locator('#cm-proposals button[data-act="accept"]').first().click(); await page.waitForTimeout(500);
const ca = await page.evaluate(async () => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S6'); return { basis: s.ipc_basis, rev: (s.revisions || []).at(-1)?.what, log: st.S.ws.revisionLog.at(-1).cause }; });
ok(ca.basis?.at(-1)?.module === 'cm' && ca.basis.at(-1).finding === 'IF-07' && /from configuration management finding IF-07 \(E17\)/.test(ca.rev) && ca.log === 'CM IF-07: E17', 'CM Accept journals its module ' + JSON.stringify(ca).slice(0, 220));
// scenario editor: read-only evidence of each module
await goto(page, '#/scenario/S5/links', 900);   // 1.9.0 Atlas: the module evidence sits under Links & evidence
ok(await page.isVisible('#iam-scenario') && /E16/.test(await page.textContent('#iam-scenario')) && !(await page.isVisible('#cm-scenario')), 'Scenario editor (S5) lists the linked IAM evidence only');
await goto(page, '#/scenario/S6/links', 900);
ok(await page.isVisible('#cm-scenario') && /E17/.test(await page.textContent('#cm-scenario')) && /IF-07/.test(await page.textContent('#cm-scenario')), 'Scenario editor (S6) lists the CM evidence and its accepted change');
// the engine file is unchanged
const sha = crypto.createHash('sha256').update(fs.readFileSync(new globalThis.URL('../app/crg.js', import.meta.url))).digest('hex');
ok(sha === CRG_SHA, 'crg.js identical to the 1.8.2 engine (SHA-256 ' + sha.slice(0, 12) + ')');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t41 iam cm risk link');
