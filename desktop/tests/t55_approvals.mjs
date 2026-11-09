// 1.9.2 (ws1) — process integrity around approvals: decided item 22 / NV-010 (QC-02 reads the approver the UI writes; an
// empty approver is refused), decided item 23 / NV-011 (a recommendation whose measure is already in force no longer freezes
// "reduction 0"; frozen zeros are recomputed at load with the earlier figures kept beside), NV-020 (ISP approval refuses a
// blank approver), NV-031 (step 13 routes to the initiatives and offers to create them), NV-032 (step 16 routes to
// Recommendations → By scenario), NV-018 (the report step requires no failed quality check).
import { open, ok, done, goto, medibec } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await medibec(page);

/* ---------------- a measure in force, a recommendation that carries it ---------------- */
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const REC = await import('/js/recommend.js'); const RE = await import('/js/receffect.js'); const QC = await import('/js/panels/qc.js');
  const ws = st.S.ws;
  ws.measures = ws.measures || [];
  const m1 = { id: 'MS-T1', name: 'EDR on all endpoints with a managed SOC', status: 'implemented', scen: ['S1', 'S2'], rp: 0.4, ri: 0.4, initial: 30000, recurring: 90000, months: 6, owner: 'CISO', effect: 'detect' };
  const m2 = { id: 'MS-T2', name: 'Phishing-resistant MFA', status: 'proposed', scen: ['S1'], rp: 0.5, ri: 0.3, initial: 60000, recurring: 25000, months: 3, owner: 'IT Director', effect: 'prevent' };
  ws.measures.push(m1, m2);
  const rec = REC.fromMeasures(['MS-T1'], ws);
  Object.assign(rec, { title: 'Extend EDR with a managed SOC', objective: 'Bring S1 and S2 toward tolerance', rationale: 'Detection gaps amplify every intrusion', success: 'MTTD < 1 h', owner: 'CISO' });
  REC.list(ws).push(rec);
  const e = REC.effect(rec, ws);
  // the old rule (measure in force on both sides) would have given 0; the decided rule gives the measure's effect
  const old = RE.effect(rec, ws, { inForce: ['approved', 'in-progress', 'implemented'] });
  let refused = '';
  try { REC.transition(rec, 'approved', { by: '', note: '', ws }); } catch (err) { refused = String(err.message); }
  const qcBefore = QC.checks(ws).find(c => c.id === 'QC-02');
  REC.transition(rec, 'approved', { by: 'Marc-André Léger', note: 'ok', ws });
  const qcAfter = QC.checks(ws).find(c => c.id === 'QC-02');
  // a legacy record approved under the earlier rule, frozen at 0 with the approver stored elsewhere
  const legacy = REC.fromMeasures(['MS-T1'], ws, REC.blank({ code: 'REC-90' }));
  Object.assign(legacy, { title: 'Legacy', objective: 'o', rationale: 'r', success: 's', owner: 'CISO', status: 'approved', version: 1,
    approved: { at: '2026-11-07', by: 'Someone', version: 1, curRes: 1, aftRes: 1, tol: 1, curRatio: 1.2, aftRatio: 1.2, reduction: 0, brought: 0, cost: { y1: 1 }, scenarios: ['S1', 'S2'], measures: ['MS-T1'] } });
  REC.list(ws).push(legacy);
  const fixed = RE.repairFrozenZeros(ws);
  const again = RE.repairFrozenZeros(ws);
  const blankApprover = REC.fromMeasures(['MS-T2'], ws, REC.blank({ code: 'REC-91' }));
  Object.assign(blankApprover, { title: 'Blank', objective: 'o', rationale: 'r', success: 's', owner: 'x', status: 'approved', version: 1, approved: { at: '2026-11-07', by: '', reduction: 5, cost: { y1: 1 } } });
  REC.list(ws).push(blankApprover);
  const qcBlank = QC.checks(ws).find(c => c.id === 'QC-02');
  REC.list(ws).pop();
  st.touch();
  return { reduction: e.totals.reduction, oldReduction: old.totals.reduction, refused, qcBefore: qcBefore.state, qcAfter: qcAfter.state, by: rec.approved.by, frozen: rec.approved.reduction,
    fixed, again, legacy: { reduction: legacy.approved.reduction, prev: legacy.approved.recomputed?.previous?.reduction, hist: legacy.history[0]?.action, rule: legacy.approved.recomputed?.rule?.slice(0, 40) }, qcBlank: qcBlank.state + ' ' + qcBlank.detail.slice(0, 80), code: rec.code };
});
ok(r.reduction > 0 && r.oldReduction === r.reduction, 'a recommendation whose only measure is already implemented delivers its reduction (decided rule, item 23): ' + Math.round(r.reduction));
// NV-066 — a coefficient outside 0–1 is flagged, never clamped
const coef = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const RE = await import('/js/receffect.js'); const ws = st.S.ws;
  const m = ws.measures.find(x => x.id === 'MS-T2'); m.rp = 1.4;
  const e = RE.effect({ measures: ['MS-T2'], scenarios: ['S1'] }, ws);
  m.rp = 0.5;
  const ok2 = RE.effect({ measures: ['MS-T2'], scenarios: ['S1'] }, ws);
  return { invalid: e.totals.invalid.map(x => x.m + ':' + x.lever + ':' + x.value), redWith: e.rows[0].aft.res > ok2.rows[0].aft.res, none: ok2.totals.invalid.length };
});
ok(coef.invalid.join() === 'MS-T2:rp:1.4' && coef.redWith && coef.none === 0, 'an rp of 1.4 is flagged and left out of the product (NV-066), not clamped to 1 ' + JSON.stringify(coef));
ok(/name of the approver/.test(r.refused), 'approval with an empty name is refused: ' + r.refused.slice(0, 60));
ok(r.qcBefore === 'pass' && r.qcAfter === 'pass' && r.by === 'Marc-André Léger' && Math.round(r.frozen) === Math.round(r.reduction), 'QC-02 passes for a recommendation approved in the UI with a named approver (item 22); the frozen reduction is the decided one');
ok(r.fixed.join() === 'REC-90' && r.again.length === 0, 'a legacy recommendation frozen at 0 is recomputed once at load (idempotent) ' + JSON.stringify([r.fixed, r.again]));
ok(r.legacy.reduction > 0 && r.legacy.prev === 0 && r.legacy.hist === 'recomputed' && /residual without/.test(r.legacy.rule), 'the earlier figure (0) is kept beside the recomputed one, labelled and in the history ' + JSON.stringify(r.legacy));
ok(/^fail/.test(r.qcBlank) && /REC-91/.test(r.qcBlank) && /without a named approver/.test(r.qcBlank), 'QC-02 fails an approved recommendation without a named approver: ' + r.qcBlank);
const q2 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const REC = await import('/js/recommend.js'); const QC = await import('/js/panels/qc.js'); const ws = st.S.ws;
  const h = REC.fromMeasures(['MS-T2'], ws, REC.blank({ code: 'REC-92' }));
  Object.assign(h, { title: 'History only', objective: 'o', rationale: 'r', success: 's', owner: 'x', status: 'in-implementation', version: 1, approved: { at: '2026-11-07', by: '', reduction: 5, cost: { y1: 1 } }, history: [{ at: '2026-11-07T10:00:00Z', action: 'status', from: 'in-review', to: 'approved', by: 'Alice (CISO)' }] });
  REC.list(ws).push(h);
  const c = QC.checks(ws).find(x => x.id === 'QC-02');
  h.history[0].by = ''; const c2 = QC.checks(ws).find(x => x.id === 'QC-02');
  REC.list(ws).pop(); return { pass: c.state, failFix: c2.fix, failDetail: c2.detail.slice(0, 40) };
});
ok(q2.pass === 'pass' && /^recs\/rec-/.test(q2.failFix) && /REC-92/.test(q2.failDetail), 'QC-02 accepts an approver named in the approval history entry, checks every formal status, and its fix link opens the recommendation ' + JSON.stringify(q2));

/* ---------------- the UI: the approve button needs the name ---------------- */
await page.evaluate(async () => {
  const st = await import('/js/state.js'); const REC = await import('/js/recommend.js'); const ws = st.S.ws;
  const d = REC.fromMeasures(['MS-T2'], ws); Object.assign(d, { title: 'Deploy phishing-resistant MFA', objective: 'o', rationale: 'r', success: 's', owner: 'IT Director' }); REC.list(ws).push(d); st.touch(); window.__recId = d.id;
});
const recId = await page.evaluate(() => window.__recId);
await goto(page, '#/recs/' + recId, 1000);
ok(await page.isVisible('#rec-by'), 'the recommendation screen shows the approver field');
await page.fill('#rec-by', ''); await page.waitForTimeout(200);
// decided item 22: the Approve button stays disabled until a name is typed
const ui = await page.evaluate(async id => { const st = await import('/js/state.js'); const r = st.S.ws.recommendations.find(x => x.id === id); const b = [...document.querySelectorAll('#panel-recs button')].find(x => /→ Approved/.test(x.textContent)); return { status: r.status, disabled: b?.disabled, title: b?.title || '' }; }, recId);
ok(ui.status !== 'approved' && ui.disabled && /named approver/.test(ui.title), 'the Approve button is disabled until the approver is named: ' + ui.title.slice(0, 60));
await page.fill('#rec-by', 'Marc-André Léger'); await page.click('#panel-recs button:has-text("→ Approved")'); await page.waitForTimeout(600);
const ui2 = await page.evaluate(async id => { const st = await import('/js/state.js'); const QC = await import('/js/panels/qc.js'); const r = st.S.ws.recommendations.find(x => x.id === id); return { status: r.status, by: r.approved?.by, qc: QC.checks(st.S.ws).find(c => c.id === 'QC-02').state, banner: document.querySelector('#panel-recs .banner.good')?.textContent || '' }; }, recId);
ok(ui2.status === 'approved' && ui2.by === 'Marc-André Léger' && ui2.qc === 'pass' && /approved .* by Marc-André Léger/.test(ui2.banner), 'approved with the name: approver frozen on the record, QC-02 passes ' + JSON.stringify([ui2.status, ui2.by, ui2.qc]));
ok(await page.isVisible('#panel-recs >> text=Frozen figures recomputed (decided item 23)').catch(() => false) === false, 'a recommendation approved under the decided rule shows no recomputation banner');

/* ---------------- NV-020: ISP approval refuses a blank approver ---------------- */
const isp = await page.evaluate(async () => {
  const P = await import('/js/isp.js'); const st = await import('/js/state.js');
  const blank = P.independenceError({ author: 'alice', submittedBy: 'alice' }, '');
  const p = P.newPolicy ? P.newPolicy({ title: 'T55 policy', type: 'policy' }, st.S.ws) : null;
  let refused = '';
  if (p) { try { p.status = 'review'; p.author = 'alice'; p.submittedBy = 'alice'; p.statements = [{ id: 'st1', text: 'Access must be reviewed.', modality: 'must' }]; await P.approve(p, { by: '   ' }); } catch (e) { refused = String(e.message); } }
  return { blank, refused, hasNew: !!p };
});
ok(/name of the approver/.test(isp.blank || ''), 'independenceError() refuses a blank approver instead of returning null: ' + isp.blank);
ok(!isp.hasNew || /name of the approver/.test(isp.refused), 'approve() with a blank name throws: ' + isp.refused.slice(0, 60));

/* ---------------- NV-031 / NV-032: steps 13 and 16 route to where the work is done ---------------- */
const steps = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const P = await import('/js/process.js');
  const w = st.newWorkspace({ name: 'routes' }); w.measures = [{ id: 'MS-A', name: 'A', status: 'proposed', scen: ['S1'], rp: 0.3, ri: 0.3 }]; w.assessment.SCEN = [st.blankScenario('S1')];
  const p13 = P.partsOf(P.STEP.shared, w), p16 = P.partsOf(P.STEP.prioritize, w);
  return { fix13: p13[0].fix[0], hint13: p13[0].hint, fix16: p16[0].fix[0], screens16: P.STEP.prioritize.screens[0][0] };
});
ok(steps.fix13 === 'recs/shared' && /Create initiatives from the measures \(1\)/.test(steps.hint13), 'step 13 without initiatives says how to create them (NV-031) ' + steps.hint13.slice(0, 80));
ok(steps.fix16 === 'recs/scenarios' && steps.screens16 === 'recs/scenarios', 'step 16 routes to Recommendations → By scenario (NV-032)');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ws = st.S.ws; ws.assessment.INITIATIVES = []; for (const m of ws.measures) delete m.initId; st.touch(); });
await goto(page, '#/recs/shared', 900);
ok(await page.isVisible('#shared-create-inits'), 'Shared controls offers “Create initiatives from the measures (n)” when none exists');
await page.click('#shared-create-inits'); await page.waitForTimeout(500);
const inits = await page.evaluate(async () => { const st = await import('/js/state.js'); return st.S.ws.assessment.INITIATIVES.map(i => [i[0], i[3].length]); });
ok(inits.length === 2 && inits.every(i => i[1] > 0), 'one initiative per measure, each addressing its scenarios ' + JSON.stringify(inits));

/* ---------------- NV-018: the report step requires no failed quality check ---------------- */
const rep = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const P = await import('/js/process.js'); const QC = await import('/js/panels/qc.js');
  const ws = st.S.ws; ws.mgmtSummary.date = '2026-11-08'; ws.mgmtSummary.figures = null;
  const parts = P.partsOf(P.STEP.report, ws), fails = QC.checks(ws).filter(c => c.state === 'fail').map(c => c.id);
  return { parts: parts.map(p => [p.what.slice(0, 40), p.ok]), fails, status: P.STEP.report.status(ws), registered: P.qcFailed(ws) !== null };
});
ok(rep.registered && rep.parts.length === 2 && /quality review shows no failed check/.test(rep.parts[1][0]), 'the report step has a “no failed check” part fed by the quality review');
ok((rep.fails.length === 0) === rep.parts[1][1] && (rep.fails.length ? rep.status === 'partial' : rep.status === 'done'), 'the part and the status follow the failed checks: ' + JSON.stringify(rep.fails));

ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 400));
await browser.close(); done('t55 approvals and recommendations (#22, #23, NV-010/011/018/020/031/032)');
