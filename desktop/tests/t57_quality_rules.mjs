// 1.9.2 (ws1) — NV-082: the quality review asks the book's review questions it did not ask before — QC-27 placeholder or
// unestimated parameters, QC-28 chain completeness, QC-29 budget gap escalated, QC-30 memo agrees with the workbook — and the
// bundled cases pass or warn on them, never fail. A workspace of placeholder scenarios no longer passes 24 of 26 checks.
import { open, ok, done, goto, medibec } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await medibec(page);

const base = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const QC = await import('/js/panels/qc.js');
  const out = {};
  for (const id of ['medibec', 'canaretail', 'medibec-fr', 'canaretail-fr']) { const c = QC.checks(st.exampleWorkspace(id)); out[id] = { n: c.length, new: c.filter(x => Number(x.id.slice(3)) >= 27).map(x => x.id + ':' + x.state), fails: c.filter(x => x.state === 'fail').map(x => x.id) }; }
  return out;
});
for (const [id, v] of Object.entries(base)) {
  ok(v.n === 32 && v.new.length === 6, id + ': 32 checks, QC-27 to QC-32 present (QC-31 = ws3 snapshot freshness, numbered at integration; QC-32 = exposure evidence, review H3) ' + v.new.join(' '));
  ok(v.new.every(x => !/fail/.test(x)), id + ': the bundled case does not fail the new checks ' + v.new.join(' '));
  ok(v.fails.length === 0, id + ': no failed check at all on the bundled case ' + v.fails.join(','));
}
ok(base.canaretail.new.includes('QC-29:pass') && base.canaretail.new.includes('QC-30:warn'), 'CanaRetail: its exported summary asked the budget decision (QC-29 pass); exported without the figures of the day → QC-30 warns, not fails');

/* ---------------- a workspace of placeholder scenarios ---------------- */
const ph = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const QC = await import('/js/panels/qc.js'); const MK = await import('/js/markers.js');
  const w = st.newWorkspace({ name: 'Placeholders' }); w.org.name = 'Placeholders Inc.';
  for (let i = 1; i <= 10; i++) { const s = st.blankScenario('S' + i); s.name = 'Scenario ' + i; for (const p of Object.values(s.params)) p.rat = MK.PLACEHOLDER; w.assessment.SCEN.push(s); }
  const c = QC.checks(w);
  const q27 = c.find(x => x.id === 'QC-27'), q28 = c.find(x => x.id === 'QC-28');
  // one scenario estimated and chained: QC-27 warns, QC-28 still fails on the nine others
  const s1 = w.assessment.SCEN[0]; s1.statement = 'A → B → C'; s1.threat_source = 'Cybercriminal'; s1.vulns = ['weak MFA']; s1.assets = 'EHR';
  for (const p of Object.values(s1.params)) Object.assign(p, { rat: 'From the audit (E2).', ev: 'E2', conf: 'Medium' });
  const c2 = QC.checks(w);
  return { q27: q27.state, q27d: q27.detail.slice(0, 80), q28: q28.state, q28d: q28.detail, fails: c.filter(x => x.state === 'fail').map(x => x.id), q27b: c2.find(x => x.id === 'QC-27'), q28b: c2.find(x => x.id === 'QC-28').state, q28bd: c2.find(x => x.id === 'QC-28').detail };
});
ok(ph.q27 === 'fail' && /10 scenario\(s\) with none of the six parameters estimated/.test(ph.q27d), 'QC-27 fails ten placeholder scenarios: ' + ph.q27d);
ok(ph.q28 === 'fail' && /S1, S2/.test(ph.q28d), 'QC-28 fails scenarios without a causal chain: ' + ph.q28d.slice(0, 80));
ok(ph.fails.includes('QC-27') && ph.fails.includes('QC-28'), 'a placeholder workspace now fails the review: ' + ph.fails.join(', '));
ok(ph.q27b.state === 'fail' && /9 scenario\(s\) with none/.test(ph.q27b.detail) && ph.q28b === 'fail' && /S2, S3/.test(ph.q28bd) && !/: S1,/.test(ph.q28bd), 'with one scenario estimated and chained: QC-27 and QC-28 name the other nine ' + ph.q28bd.slice(-40));

/* ---------------- QC-29 and QC-30 on MediBec: export the summary, then change a figure ---------------- */
const mb = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const QC = await import('/js/panels/qc.js');
  const ws = st.S.ws, q = id => QC.checks(ws).find(x => x.id === id);
  const b29 = q('QC-29'), b30 = q('QC-30'), gap = QC.budgetGap(ws);
  return { b29: b29.state, b29d: b29.detail.slice(0, 50), b30: b30.state, gap: gap.gap, target: gap.target };
});
ok(mb.b29 === 'warn' && /Shortfall of 11,088,000/.test(mb.b29d) && Math.round(mb.target * 1000) === 120, 'MediBec: the shortfall to the 12% target is not yet asked of management (QC-29 attention) ' + mb.b29d);
ok(mb.b30 === 'warn', 'MediBec: the summary has not been exported (QC-30 attention)');
await goto(page, '#/summary', 1000);
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }).catch(() => null), page.click('#sum-md')]);
ok(!!dl, 'the management summary exports');
const after = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const QC = await import('/js/panels/qc.js');
  const ws = st.S.ws, q = id => QC.checks(ws).find(x => x.id === id);
  const f = ws.mgmtSummary.figures, a29 = q('QC-29'), a30 = q('QC-30');
  ws.assessment.SCEN[0].params.PbA.v = 0.95;   // a figure changes after the export
  const c30 = q('QC-30');
  ws.assessment.SCEN[0].params.PbA.v = 0.85; st.touch();
  return { f: f && { est: Math.round(f.est), res: Math.round(f.res), n: f.n, gap: f.gap }, a29: a29.state, a30: a30.state, c30: c30.state, c30d: c30.detail.slice(0, 90) };
});
ok(after.f && after.f.est === 84305 && after.f.res === 41023 && after.f.n === 30 && after.f.gap === 11088000, 'the export records the engine’s figures and the budget gap of the day ' + JSON.stringify(after.f));
ok(after.a29 === 'pass' && after.a30 === 'pass', 'after the export: the budget gap was asked of management (QC-29) and the memo agrees with the workbook (QC-30)');
ok(after.c30 === 'fail' && /estimated 84,305 →/.test(after.c30d), 'a figure changed after the export: QC-30 fails and says what moved: ' + after.c30d);

/* ---------------- the Quality review screen shows the new rows ---------------- */
await goto(page, '#/qc', 1000);
const rows = await page.$$eval('#panel-qc tbody tr', trs => trs.map(tr => tr.firstElementChild.textContent));
ok(rows.length === 32 && rows.includes('QC-27') && rows.includes('QC-30') && rows.includes('QC-31') && rows.includes('QC-32'), 'the Quality review screen lists 32 checks');

ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 400));
await browser.close(); done('t57 quality review rules (NV-082)');
