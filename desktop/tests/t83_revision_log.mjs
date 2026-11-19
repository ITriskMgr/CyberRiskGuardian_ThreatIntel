// t83 — the threat revision log shows threat-driven lines only (1.9.3, BL-06b). The workspace keeps one revision log for every
// kind of change; the D2 review of the default reductions, an IAM/CM finding or an import retyping is not caused by the threat
// landscape and must not appear as a threat revision with "— → —" values. Those lines are listed apart, with their own note,
// and the Excel sheet keeps the same split. Nothing is dropped.
import { open, ok, done, goto } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const split = await page.evaluate(async () => {
  const T = await import('/threat.js');
  const st = await import('/js/state.js');
  const ws = st.exampleWorkspace('medibec'); ws.name = 't83 revision log'; ws.kind = 'organization'; await st.create(ws); await st.select(ws.id);
  st.S.ws.revisionLog = [
    { date: '2026-11-17', scenario: 'S1, S2, S3', parameter: 'red_p / red_i', from: '0.5 / 0.5', to: '0.5 / 0.5', what: 'D2 review of the default reductions closed by A. Analyst: 3 scenario(s) deliberately left at 0.5 / 0.5', by: 'A. Analyst' },
    { date: '2026-11-18', scenario: 'S4', parameter: 'Pb(psi,A)', from: 0.2, to: 0.7, ratioFrom: 0.8, ratioTo: 1.4, clsFrom: 'Below tolerance', clsTo: 'Above tolerance', cause: 'CVE-2024-3400: KEV', snapshot: '2026-11-04' },
    { date: '2026-11-18', scenario: 'S5', parameter: 'theta', from: 0.5, to: 0.4, ratioFrom: 1.0, ratioTo: 1.2, clsFrom: 'Approximately at tolerance', clsTo: 'Above tolerance', cause: 'IAM finding F-1: E3' },
  ];
  st.touch(); await st.saveNow();
  const r = T.splitRevisionLog(st.S.ws.revisionLog);
  return { threat: r.threat.map(x => x.scenario), other: r.other.map(x => x.scenario), empty: T.splitRevisionLog(undefined) };
});
ok(JSON.stringify(split.threat) === '["S4"]', 'splitRevisionLog keeps the snapshot-driven line as threat: ' + JSON.stringify(split.threat));
ok(JSON.stringify(split.other) === '["S1, S2, S3","S5"]', 'the D2 review and the IAM finding are other revisions, in stored order: ' + JSON.stringify(split.other));
ok(split.empty.threat.length === 0 && split.empty.other.length === 0, 'a missing log splits into two empty lists');
await goto(page, '#/threat', 1200);
const main = await page.locator('main').innerText();
const logTable = await page.locator('h2:has-text("Revision log") + .card table').innerText();
ok(/S4/.test(logTable) && !/red_p \/ red_i/.test(logTable) && !/theta/.test(logTable), 'the threat revision log lists S4 only');
ok(!/— → —/.test(logTable), 'no "— → —" row in the threat revision log');
ok(/Other revisions in this workspace \(2\)/.test(main), 'the other revisions are counted apart');
await page.locator('#revlog-other-box summary').click();
const other = await page.locator('#revlog-other').innerText();
ok(/0\.5 \/ 0\.5 → 0\.5 \/ 0\.5/.test(other) && /D2 review of the default reductions/.test(other), 'the D2 review shows its text values and its note');
ok(/IAM finding F-1/.test(other), 'the IAM finding shows its cause');
ok(await page.locator('#revlog-other a[href="#/scenario/S2"]').count() === 1, 'each scenario of a multi-scenario line is its own link');
ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t83 revision log');
