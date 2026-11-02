// 1.8.0 — CVSS by equivalency for non-technical weaknesses (book ch06): weakness type, a justification per
// metric, the label "limited applicability" and the estimate marker, stored with the scenario and exported.
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example') || (await (async () => { await new Promise(r => setTimeout(r, 1000)); await st.refreshList(); return st.S.list.find(w => w.kind === 'example'); })()); await st.select(ex.id); });
// the book's Example 1 (process weakness): BEC, 5.9 Medium
const V = 'CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:N/VI:H/VA:N/SC:N/SI:L/SA:N';
await page.evaluate(v => { location.hash = '#/cvss/' + encodeURIComponent(v) + '|S13'; }, V); await page.waitForTimeout(700);
await page.click('#panel-cvss [role=tab]:has-text("By equivalency")'); await page.waitForTimeout(500);
ok(await page.isVisible('#cv-eq-type'), 'equivalency mode shows the weakness type');
ok(await page.isVisible('#panel-cvss >> text=Who can reach the weakness, and from where?'), 'each metric shows its question');
ok(await page.isVisible('#panel-cvss >> text=limited applicability'), 'label limited applicability shown');
ok(/5[.,]9/.test(await page.textContent('#cvss-out')), 'the book example scores 5.9 ' + await page.textContent('#cvss-out'));
await page.selectOption('#cv-eq-type', 'process');
await page.fill('#cv-just-AV', 'Anyone who can send e-mail'); await page.fill('#cv-just-AC', 'No verification step');
await page.click('#cvss-save'); await page.waitForTimeout(800);
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const EQ = await import('/js/equiv.js'); const QC = await import('/js/panels/qc.js');
  const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S13');
  return { mode: s.cvss_mode, lim: s.cvss_limited, type: s.cvss_equiv.type, gaps: EQ.gaps(s), vec: s.cvss, hash: location.hash, qc: QC.checks(st.S.ws).find(x => x.id === 'QC-22').state, label: EQ.exportLabel(s) };
});
ok(r.mode === 'equivalency' && r.lim === true && r.type === 'process', 'saved to S13 as equivalency, limited applicability');
ok(r.gaps.length === 9 && !r.gaps.includes('AV'), 'nine metrics still unjustified ' + r.gaps);
ok(r.qc === 'fail', 'QC-22 fails while a metric is unjustified');
ok(/limited applicability/.test(r.label) && /Analytical estimate — validation required/.test(r.label), 'export label carries the label and the marker');
ok(/#\/scenario\/S13/.test(r.hash) && await page.isVisible('#panel-scenario >> text=Justification of each metric'), 'scenario editor shows the justifications');
// complete them in the editor
await page.evaluate(async () => { const st = await import('/js/state.js'); const EQ = await import('/js/equiv.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S13');
  for (const m of EQ.METRICS) s.cvss_equiv.just[m] ||= 'Justified for the test: ' + m; st.touch(); });
const r2 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const QC = await import('/js/panels/qc.js'); const X = await import('/js/exportx.js');
  const wb = X.buildWorkbook ? null : null;
  const c = QC.checks(st.S.ws).find(x => x.id === 'QC-22');
  return { qc: c.state, detail: c.detail };
});
ok(r2.qc === 'pass' && /1 scenario/.test(r2.detail), 'QC-22 passes once every metric is justified ' + r2.detail);
// the Excel export carries the CVSS basis sheet
const sheets = await page.evaluate(async () => { const X = await import('/js/exportx.js'); return X.OPTIONAL_SHEETS; });
ok(sheets.includes('CVSS_Basis'), 'Excel export: CVSS_Basis sheet');
// switching back to technical scoring keeps the justifications but drops the label
const r3 = await page.evaluate(async () => { const st = await import('/js/state.js'); const EQ = await import('/js/equiv.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S13');
  EQ.setMode(s, 'technical'); const out = { lim: s.cvss_limited, kept: Object.keys(s.cvss_equiv.just).length, label: EQ.exportLabel(s) }; EQ.setMode(s, 'equivalency'); return out; });
ok(r3.lim === false && r3.kept === 11 && r3.label === 'CVSS-B', 'technical mode: plain CVSS-B, justifications kept');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t26 equivalency');
