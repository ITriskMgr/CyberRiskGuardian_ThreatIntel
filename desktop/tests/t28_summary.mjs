// 1.8.0 — the management summary (book ch06): decisions requested, residual vs tolerance before and after
// treatment, portfolio and budget, top risks, markers, limitations; export sets the Report step.
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example') || (await (async () => { await new Promise(r => setTimeout(r, 1000)); await st.refreshList(); return st.S.list.find(w => w.kind === 'example'); })()); await st.select(ex.id);
  const SU = await import('/js/panels/summary.js'); const R = st.compute(st.S.ws); const x = SU.build(st.S.ws);
  const md = SU.markdown(st.S.ws);
  return { after: x.after, before: x.before, counts: R.counts, inc: R.inc.length, tot: Math.round(x.R.totals.res), res: Math.round(R.totals.res), auto: x.auto, md, target: x.target, top: x.top.map(t => t.id) };
});
ok(r.after['Above tolerance'] === r.counts.above && r.after['Approximately at tolerance'] === r.counts.at && r.after['Below tolerance'] === r.counts.below, 'after-treatment counts equal the engine counts');
ok(Object.values(r.before).reduce((a, b) => a + b, 0) === r.inc, 'before-treatment counts cover every included scenario');
ok(r.tot === r.res, 'residual total equals the engine total');
ok(r.auto.some(d => /^S2 — decide/.test(d)) && r.auto.some(d => /Approve the risk appetite/.test(d)), 'decisions requested include S2 and the appetite');
ok(/## Decisions requested/.test(r.md) && /Management decision required\*\*/.test(r.md) && /Fictional teaching case/.test(r.md), 'markdown: decisions with the marker, fictional label');
ok(/Analytical estimate — validation required/.test(r.md) && /\| ID \| Scenario \| Residual/.test(r.md), 'markdown: markers and top-risks table');
ok(Math.abs(r.target - 0.12) < 1e-9, 'appetite-consistent target 12% at appetite 0.30');
await page.evaluate(() => { location.hash = '#/summary'; }); await page.waitForTimeout(800);
ok(await page.isVisible('#panel-summary >> text=Decisions requested') && await page.isVisible('#panel-summary >> text=Top risks'), 'summary screen renders');
ok(await page.isVisible('nav a[data-panel="summary"]'), 'in the side menu');
await page.fill('#sum-decisions', 'Approve the 2027 treatment portfolio');
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#sum-md')]);
ok(/management-summary-\d{4}-\d{2}-\d{2}\.md/.test(dl.suggestedFilename()), 'export downloads the summary ' + dl.suggestedFilename());
const s = await page.evaluate(async () => { const st = await import('/js/state.js'); const P = await import('/js/process.js'); return { date: st.S.ws.mgmtSummary.date, dec: st.S.ws.mgmtSummary.decisions, part: P.partsOf(P.STEP.report, st.S.ws)[0].ok }; });
ok(!!s.date && s.dec[0] === 'Approve the 2027 treatment portfolio' && s.part, 'export recorded; the Report step part is done');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t28 management summary');
