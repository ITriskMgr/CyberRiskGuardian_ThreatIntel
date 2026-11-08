// 1.9.2 — NV-014 / NV-015 / NV-045 / NV-066 / NV-094 (ws2): Monte Carlo, tornado and the residual path never abort on a
// sampled δm < δe (the draw is raised to δe; proposed ranges keep the δm bounds at or above the δe bounds); the per-scenario
// P(above tolerance) counts each trial's own ratio; the sensitivity central case is never shifted or clamped and a shifted
// case is never milder than the central one; out-of-range measure coefficients are flagged, never clamped; the budget
// screen follows the reference conventions (gap = spend − target, position wording, implied appetite below 4%).
import { open, ok, done, goto } from './lib.mjs';

const { browser, page, errors } = await open('#/process');
page.on('dialog', d => d.accept());

const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const F = await import('/js/forecast.js'); const X = await import('/js/aiforecast.js'); const K = await import('/js/catalog.js');
  let ex; for (let i = 0; i < 40 && !(ex = st.S.list.find(w => w.kind === 'example' && /MediBec/.test(w.name))); i++) { await new Promise(r => setTimeout(r, 250)); await st.refreshList?.(); }
  await st.select(ex.id);
  const ws = st.S.ws, A = ws.assessment, out = {};
  const before = JSON.stringify(A.SCEN.map(s => [s.params, s.red_p, s.red_i]));
  // NV-014 — "Propose ranges" on every scenario (the campaign's reproduction: S30's δe range overlapped its δm range)
  let overlap = 0;
  for (const s of A.SCEN) { s.ranges = F.proposeRanges(s); if (s.ranges.Dm.min < s.ranges.De.min || s.ranges.Dm.max < s.ranges.De.max) overlap++; }
  out.overlap = overlap;
  const s30 = A.SCEN.find(s => s.id === 'S30');
  out.s30 = s30 ? { De: s30.ranges.De, Dm: s30.ranges.Dm } : null;
  let mc = null, err = '';
  try { mc = await F.run(ws, { trials: 400, seed: 7 }); } catch (e) { err = String(e.message || e); }
  out.mcErr = err; out.mcN = mc ? mc.scenarios.length : 0;
  out.mcRepro = mc ? JSON.stringify((await F.run(ws, { trials: 400, seed: 7 })).portfolio) === JSON.stringify(mc.portfolio) : false;
  // a range typed by hand with δm below δe is still safe: the draw raises δm to δe
  const s1 = A.SCEN[0]; const keep = JSON.stringify(s1.ranges);
  s1.ranges.De = { min: 0.7, likely: 0.8, max: 0.9, dist: 'uniform' }; s1.ranges.Dm = { min: 0.2, likely: 0.3, max: 0.4, dist: 'uniform' };
  try { await F.run(ws, { trials: 200, seed: 3, ids: [s1.id] }); out.handErr = ''; } catch (e) { out.handErr = String(e.message || e); }
  try { F.tornado(ws, s1.id); out.tornErr = ''; } catch (e) { out.tornErr = String(e.message || e); }
  try { await X.residualPath(ws, { years: 1, trials: 20, seed: 5 }); out.pathErr = ''; } catch (e) { out.pathErr = String(e.message || e); }
  s1.ranges = JSON.parse(keep);
  // NV-015 — per-scenario P(above) uses each trial's own tolerated risk: with no ranges on a scenario, P(above) is 0 or 1
  for (const s of A.SCEN) delete s.ranges;
  const flat = await F.run(ws, { trials: 100, seed: 11 });
  out.flat = flat.scenarios.map(x => ({ id: x.id, p: x.pAbove, cls: CRG.classify(x.pointRatio) }));
  // the campaign case: a scenario whose point ratio is 1.09 (approximately at) with wide ranges: the portfolio KPI and the
  // per-scenario figure now use the same rule (per-trial ratio), so a single-scenario run gives the same number
  const g = A.SCEN.find(s => CRG.classify(st.compute(ws).rows.find(r => r.id === s.id).ratio) === 'Approximately at tolerance');
  g.ranges = F.proposeRanges(g); for (const k of Object.keys(g.ranges)) { g.ranges[k].min = Math.max(k === 'Th' ? 0.05 : 0, g.ranges[k].likely - 0.3); g.ranges[k].max = Math.min(1, g.ranges[k].likely + 0.3); }
  g.ranges.Dm.min = Math.max(g.ranges.Dm.min, g.ranges.De.min); g.ranges.Dm.max = Math.max(g.ranges.Dm.max, g.ranges.De.max);
  const one = await F.run(ws, { trials: 2000, seed: 21, ids: [g.id] });
  out.one = { id: g.id, perScen: one.scenarios[0].pAbove, portfolio: one.pAboveTolerance };
  delete g.ranges;
  // NV-045 — sensitivity: central = plain calculation; shifted cases never milder because of the clamp
  const EX = { id: 'P1', params: { PbA: { v: 1 }, Pbx: { v: 1 }, De: { v: 0.6 }, Dm: { v: 0.8 }, Th: { v: 0.5 }, Mu: { v: 0.65 } }, red_p: 0, red_i: 0, cvss: 'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H' };
  const sens = CRG.sensitivity(EX, 0.1, 0.35, 1000), plain = CRG.calc(EX, 0.35, 1000);
  out.sens = { central: +sens.central.estimated.toFixed(2), plain: +plain.est.toFixed(2), higher: +sens.higher.estimated.toFixed(2), lower: +sens.lower.estimated.toFixed(2), sh: CRG.shift(EX, 0.1).params.PbA.v, sl: CRG.shift(EX, -0.1).red_p };
  out.sensAll = A.SCEN.every(s => Math.abs(CRG.sensitivity(s, 0.1, A.APPETITE, A.FACTOR).central.residual - CRG.calc(s, A.APPETITE, A.FACTOR).res) < 1e-9);
  // NV-066 — coefficients outside 0–1 are flagged, not clamped
  const m = K.blankMeasure({ name: 'Test measure', scen: [A.SCEN[0].id, A.SCEN[1].id], rp: 0.3, ri: 0.3 });
  m.eff[A.SCEN[0].id] = { rp: 1.3, ri: 0.2 };
  ws.measures.push(m);
  const c0 = K.combined(A.SCEN[0].id, ws), c1 = K.combined(A.SCEN[1].id, ws);
  out.coef = { invalid: c0.invalid.map(x => x.lever + ':' + x.value), red_p: +c0.red_p.toFixed(4), red_i: +c0.red_i.toFixed(4), ok1: c1.invalid.length, red_p1: +c1.red_p.toFixed(4) };
  const parsed = K.parseClaude(JSON.stringify({ measures: [{ name: 'AI measure', scenarios: [{ id: A.SCEN[0].id, rp: 1.4, ri: 0.5 }] }] }), ws);
  out.parsed = { warn: parsed.warnings.join(' | '), rp: parsed.measures[0].eff[A.SCEN[0].id].rp };
  ws.measures.pop();
  // NV-094 — budget conventions
  out.band = [CRG.bandStatus(0.02), CRG.bandStatus(0.08), CRG.bandStatus(0.15)];
  out.pos = CRG.budgetPosition(0.35, 50e6, 3e6, 1.7e6);
  out.pos2 = CRG.budgetPosition(0.35, 50e6, 1e6, 0);
  out.ts = CRG.targetStatus(0.094, 0.35);
  out.same = before === JSON.stringify(A.SCEN.map(s => [s.params, s.red_p, s.red_i]));
  const T = st.compute(ws).totals; out.totals = [Math.round(T.est), Math.round(T.res)];
  st.touch();
  return out;
});

ok(r.overlap === 0 && r.s30 && r.s30.Dm.min >= r.s30.De.min && r.s30.Dm.max >= r.s30.De.max, 'proposeRanges keeps the δm bounds at or above the δe bounds on all 30 (S30 ' + JSON.stringify(r.s30) + ')');
ok(r.mcErr === '' && r.mcN === 30 && r.mcRepro, 'Monte Carlo with proposed ranges runs on MediBec (30 scenarios, seeded and reproducible) ' + r.mcErr);
ok(r.handErr === '' && r.tornErr === '' && r.pathErr === '', 'a hand-typed δm range below δe never aborts the run, the tornado or the residual path ' + [r.handErr, r.tornErr, r.pathErr].join(' | '));
ok(r.flat.every(x => (x.cls === 'Above tolerance') === (x.p === 1) && (x.cls !== 'Above tolerance') === (x.p === 0)), 'no ranges: per-scenario P(above) is 1 exactly for the scenarios above tolerance, 0 otherwise');
ok(Math.abs(r.one.perScen - r.one.portfolio) < 1e-9, `per-scenario P(above) = portfolio KPI on a single-scenario run (${r.one.id}: ${r.one.perScen} vs ${r.one.portfolio})`);
ok(r.sens.central === r.sens.plain && r.sens.central === 8463, 'sensitivity central case = plain calculation (Pb(A) = 1 not clamped to 0.99): ' + JSON.stringify(r.sens));
ok(r.sens.higher >= r.sens.central && r.sens.lower <= r.sens.central && r.sens.sh === 1 && r.sens.sl === 0.1, 'shifted cases never milder than the central one; Pb(A) 1 stays 1 in the higher case, red_p 0 → 0.1 in the lower case');
ok(r.sensAll, 'MediBec: every central case equals the plain calculation');
ok(r.coef.invalid.join() === 'rp:1.3' && r.coef.red_p === 0 && r.coef.red_i === 0.2 && r.coef.ok1 === 0 && r.coef.red_p1 === 0.3, 'combined(): rp 1.3 flagged and left out of the product, not clamped to 1 ' + JSON.stringify(r.coef));
ok(/rp 1.4 .* outside 0–1 — flagged/.test(r.parsed.warn) && r.parsed.rp === 1.4, 'parseClaude: an out-of-range coefficient is kept and flagged in the warnings, not clamped ' + r.parsed.warn);
ok(/^Below the 4% point target/.test(r.band[0]) && r.band[1] === 'Between the 4% and 12% point targets' && /^Above the 12% point target/.test(r.band[2]), 'budget position wording follows the reference engine');
ok(r.pos.gap_amount === -775000 && Math.abs(r.pos.gap_pct + 0.0155) < 1e-9 && Math.abs(r.pos.implied_appetite - 0.4238095238) < 1e-6 && r.pos.status === 'Below the appetite-consistent target', 'budgetPosition: gap = planned − target (−775,000), implied appetite 0.42 ' + JSON.stringify(r.pos));
ok(r.pos2.implied_appetite === null && /^Below the 4% point target/.test(r.pos2.position) && r.pos2.planned_pct === 0.02, 'at a 2% spend the implied appetite is null (above 0.70, outside the guideline), not clamped to 0.70');
ok(r.ts.status === 'Below the appetite-consistent target' && Math.abs(r.ts.gap_pct + 0.0155) < 1e-9, 'targetStatus gap sign: share − target');
ok(r.same && r.totals[0] === 84305 && r.totals[1] === 41023, 'nothing changed a parameter; totals 84,305 / 41,023 ' + r.totals);

// the screens: budget conventions and the flagged coefficient
await goto(page, '#/budget', 1000);
const b = await page.evaluate(() => [...document.querySelectorAll('main > section')].find(x => !x.hidden).textContent);
ok(/Position/.test(b) && /point target/.test(b) && /spend − target; negative = below the target/.test(b), 'budget screen: Position KPI with point-target wording and the gap convention');
ok(!/Within band|below floor|12% ceiling|4% floor/.test(b), 'no retired band wording on the budget screen');
await goto(page, '#/forecast', 1000);
await page.evaluate(() => { const sec = [...document.querySelectorAll('main > section')].find(x => !x.hidden); const t = [...sec.querySelectorAll('input[type=number]')][0]; if (t) t.value = '200'; [...sec.querySelectorAll('button')].find(b => b.textContent.trim() === 'Run forecast')?.click(); });
await page.waitForTimeout(4000);
const f = await page.evaluate(() => [...document.querySelectorAll('main > section')].find(x => !x.hidden).textContent);
ok(/each trial compares its residual with its own tolerated risk/.test(f) && /raised to δe/.test(f), 'forecast screen explains the per-trial P(above) and the δm ≥ δe rule');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t60 forecast rules');
