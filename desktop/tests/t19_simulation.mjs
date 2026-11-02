// Simulation data for teaching: the bundled MediBec pack (crg-siem-import/1 + crg-soar-import/1 + manifest)
// imported through the real SIEM and SOAR importers into the MediBec workspace; coverage, triage order,
// approval audit signals; no incident from alerts; simgen.validatePack / buildPrompt; Settings → Simulation
// data (bundled pack, AI generation with the mock helper, removal of the simulation records).
import { open, ok, done } from './lib.mjs';
import fs from 'fs';
const { browser, page, errors } = await open('#/process');
page.on('dialog', d => d.accept());

const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const G = await import('/js/simgen.js');
  const SIEM = await import('/js/siem.js'); const SOAR = await import('/js/soar.js'); const P = await import('/js/panels/settings_sim.js');
  const w = st.medibecWorkspace(); w.name = 'MediBec — simulation test t19'; await st.create(w);
  const ws = st.S.ws, out = {};
  out.kind = ws.kind;
  const idx = await (await fetch('/data/simulation/index.json')).json();
  out.idx = idx.packs.map(p => p.id);
  const pack = await G.loadBundled('/data/simulation/' + idx.packs[0].path);
  out.manifest = { format: pack.format, fictional: pack.fictional, case: pack.case, nEx: pack.exercises.length, nObj: pack.learningObjectives.length, nDays: pack.storyline.length, fr: !!pack.i18n?.fr };
  const v = G.validatePack(pack, ws); out.valid = { ok: v.ok, errors: v.errors, warnings: v.warnings, mix: v.mix };
  // the same pack in a workspace of another case does not validate
  const other = st.newWorkspace({ name: 'Other case' }); other.assessment.SCEN = [{ id: 'S1', name: 'x' }];
  out.otherErrors = G.validatePack(pack, other).errors.length;

  const inc0 = ws.csm.incidents.length;
  const rep = await P.importPack(ws, pack);
  out.siemCounts = rep.siem.counts; out.siemErrors = rep.siem.errors;
  out.soarAdded = rep.soar.added; out.soarSkipped = rep.soar.skipped; out.marked = rep.marked;
  out.expected = pack.expectedImport;
  out.incidentsAdded = ws.csm.incidents.length - inc0;
  const R = SIEM.reg(ws), O = SOAR.reg(ws);
  out.escalated = R.alerts.filter(a => a.triage === 'escalated').length;
  out.allMarked = R.alerts.every(a => a.simulation === true && a.simPack === pack.id) && O.executions.every(x => x.simulation === true);
  // coverage at the as-of date
  const cov = id => SIEM.ruleCoverage(R.rules.find(x => x.id === id), ws).status;
  out.cov = Object.fromEntries(['DR-MB-01', 'DR-MB-02', 'DR-MB-03', 'DR-MB-04', 'DR-MB-05', 'DR-MB-06', 'DR-MB-07', 'DR-MB-08', 'DR-MB-09', 'DR-MB-10', 'DR-MB-11', 'DR-MB-12', 'DR-MB-13'].map(k => [k, cov(k)]));
  out.counts = SIEM.coverageCounts(SIEM.coverageMatrix(ws));
  const sum = SIEM.summary(ws); out.summary = { health: sum.health, ind: sum.indicators, alerts: sum.alerts };
  // triage: crown jewels first
  const q = SIEM.triageQueue(ws); out.firstCrown = q[0].crown; out.crownFirst = q.findIndex(x => !x.crown) > q.map(x => x.crown).lastIndexOf(true);
  out.crownN = q.filter(x => x.crown).length; out.first5 = q.slice(0, 5).map(x => x.a.id);
  // approval audit signals
  out.reasons = Object.fromEntries(SOAR.unapproved(ws).map(u => [u.x.id, u.reason]));
  out.playbookTested = Object.fromEntries(O.playbooks.map(p => [p.id, SOAR.simulationPassed(ws, p)]));
  // re-import adds nothing on the SIEM side
  const again = await SIEM.importText(JSON.stringify(pack.siem), { kind: 'envelope', ws, fileName: 'again' });
  out.again = again.counts;
  // removal
  out.simCount = P.simulationRecords(ws).reduce((t, g) => t + g.rows.length, 0);
  out.removed = P.removeSimulation(ws);
  out.left = P.simulationRecords(ws).reduce((t, g) => t + g.rows.length, 0);
  out.leftAlerts = R.alerts.length; out.leftCases = O.cases.length;
  st.touch();
  return out;
});
ok(r.kind === 'example' && r.idx.includes('medibec-ransomware-2026'), 'index lists the MediBec pack');
ok(r.manifest.format === 'crg-simulation-pack/1' && r.manifest.fictional === true && r.manifest.case === 'medibec', 'manifest format, fictional, case');
ok(r.manifest.nEx >= 8 && r.manifest.nObj >= 5 && r.manifest.nDays >= 14 && r.manifest.fr, 'exercises, objectives, storyline, French texts');
ok(r.valid.ok && !r.valid.errors.length, 'pack valid for MediBec: ' + r.valid.errors.join(' | '));
ok(Object.values(r.valid.mix).every(Boolean), 'every teaching point present ' + JSON.stringify(r.valid.mix));
ok(r.otherErrors > 5, 'pack refused in a workspace of another case');
ok(!r.siemErrors.length, 'SIEM import without errors: ' + r.siemErrors.join(' | '));
for (const [k, n] of Object.entries(r.expected.siem)) ok((r.siemCounts[k] || 0) === n, `SIEM ${k}: ${r.siemCounts[k]} = ${n}`);
for (const [k, n] of Object.entries(r.expected.soar)) ok((r.soarAdded[k] || 0) === n, `SOAR ${k}: ${r.soarAdded[k]} = ${n}`);
ok(r.soarSkipped.length === 1 && r.soarSkipped[0].id === 'APR-MB-04' && /self-approval/i.test(r.soarSkipped[0].why), 'only the deliberate self-approval is refused');
ok(r.incidentsAdded === 0 && r.escalated === 0, 'importing alerts creates no incident and escalates nothing');
ok(r.allMarked && r.marked > 130, 'records marked as simulation: ' + r.marked);
const expCov = { 'DR-MB-01': 'validated', 'DR-MB-02': 'degraded', 'DR-MB-03': 'untested', 'DR-MB-04': 'validated', 'DR-MB-05': 'degraded', 'DR-MB-06': 'validated', 'DR-MB-07': 'degraded', 'DR-MB-08': 'validated', 'DR-MB-09': 'degraded', 'DR-MB-10': 'untested', 'DR-MB-11': 'degraded', 'DR-MB-12': 'missing', 'DR-MB-13': 'missing' };
for (const [k, s] of Object.entries(expCov)) ok(r.cov[k] === s, `coverage ${k} ${r.cov[k]} = ${s}`);
ok(r.counts.validated >= 1 && r.counts.untested >= 1 && r.counts.degraded >= 1, 'matrix shows validated, untested and degraded ' + JSON.stringify(r.counts));
ok(r.summary.health.healthy >= 7 && r.summary.health.degraded === 2 && r.summary.health.silent === 2, 'telemetry health mix ' + JSON.stringify(r.summary.health));
ok(r.summary.ind.restricted === 2 && r.summary.ind.stale >= 2, 'indicators: AMBER+STRICT and RED restricted, revoked and expired stale');
ok(r.firstCrown && r.crownFirst && r.crownN >= 20, 'crown-jewel alerts come first ' + r.first5.join(','));
const R = r.reasons;
ok(R['EXE-MB-06'] === 'expired' && R['EXE-MB-03'] === 'revoked' && R['EXE-MB-04'] === 'absent' && R['EXE-MB-07'] === 'absent', 'executionsWithoutValidApproval: expired, revoked, absent ' + JSON.stringify(R));
ok(R['EXE-MB-08'] === 'wrong-authority' && R['EXE-MB-10'] === 'not-granted' && !R['EXE-MB-02'] && !R['EXE-MB-05'] && !R['EXE-MB-09'], 'wrong-authority, not-granted; valid and ungated actions not flagged');
ok(r.playbookTested['PB-MB-01'] && r.playbookTested['PB-MB-03'] && !r.playbookTested['PB-MB-02'] && !r.playbookTested['PB-MB-04'], 'playbook simulations passed / missing / failed');
ok(!r.again.alerts && !r.again.rules && r.again.duplicates > 50, 're-import adds nothing');
ok(r.removed === r.simCount && r.left === 0 && r.leftAlerts === 0 && r.leftCases === 0, `removal: ${r.removed} of ${r.simCount}`);

/* ---------------- the screen ---------------- */
await page.evaluate(() => { location.hash = '#/settings/simulation'; });
await page.waitForSelector('text=Bundled packs', { timeout: 15000 });
const vis = sel => page.waitForSelector(sel, { state: 'visible', timeout: 5000 }).then(() => true, () => false);
ok(await vis('h3:has-text("MediBec — phishing to ransomware on the EHR")'), 'bundled pack listed');
ok(await vis('.banner:has-text("Valid for this workspace")'), 'validation shown');
await page.click('summary:has-text("Exercises for students")');
ok(await page.isVisible('td >> text=Which alerts should an analyst open first'), 'exercises shown');
await page.click('button:has-text("Import into this workspace")');
await page.waitForSelector('text=Last import', { timeout: 15000 });
const afterUi = await page.evaluate(async () => { const st = await import('/js/state.js'); const P = await import('/js/panels/settings_sim.js'); return { n: P.simulationRecords(st.S.ws).reduce((t, g) => t + g.rows.length, 0), alerts: st.S.ws.siem.alerts.length }; });
ok(afterUi.alerts === 40 && afterUi.n > 130, 'imported from the screen: ' + JSON.stringify(afterUi));
ok(await page.isVisible('td >> text=APR-MB-04'), 'refused self-approval listed in the report');
const logged = await page.evaluate(async () => (await import('/js/logs.js')).entries('data').some(e => e.action === 'simulation pack imported'));
ok(logged, 'import recorded in the data log');
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('button:has-text("Download the pack") >> nth=0')]);
const dlText = fs.readFileSync(await dl.path(), 'utf8'); const dlPack = JSON.parse(dlText);
ok(dlPack.format === 'crg-simulation-pack/1' && dlPack.siem?.alerts?.length === 40 && dlPack.soar?.cases?.length === 4, 'downloaded pack carries its files inline');

/* ---------------- AI generation with the mock helper ---------------- */
await page.evaluate(async () => { const AI = await import('/js/ai.js'); AI.settings().acknowledged = new Date().toISOString(); });
await page.selectOption('select:near(:text("Focus of the intrusion"))', 'phishing').catch(() => {});
await page.click('button:has-text("Prepare the request")');
await page.waitForSelector('.modal textarea', { timeout: 15000 });
const pl = await page.$eval('.modal textarea >> nth=1', t => t.value);
ok(/TASK: simulation_pack/.test(pl) && /S2 \| Ransomware/.test(pl) && /CJ1 \| Integrated EHR/.test(pl), 'payload carries the scenarios and crown jewels of the workspace');
ok(/RFC 5737/.test(pl) && /crg-siem-import\/1/.test(pl) && /FICTIONAL/.test(pl), 'payload carries the guide rules and the format');
ok(!/All figures are illustrative/.test(pl) && !/PbA=/.test(pl) && !/912000|100000000/.test(pl), 'payload carries no notes, parameters or budget');
await page.click('.modal .btnrow .btn:not(.ghost)');
await page.waitForSelector('text=MediBec — phishing week (mock AI answer)', { timeout: 15000 });
ok(await page.isVisible('text=generated with AI'), 'AI pack labelled as generated with AI');
const aiLog = await page.evaluate(async () => (await import('/js/ai.js')).log()[0]);
ok(aiLog.task === 'simulation_pack', 'AI call recorded in the AI log');
const okBtns = await page.$$('button:has-text("Import into this workspace"):not([disabled])');
ok(okBtns.length === 2, 'the generated pack validates and can be imported');

/* ---------------- removal from the screen ---------------- */
await page.click('button:has-text("Remove simulation data"):not([disabled])');
await page.waitForTimeout(800);
const left = await page.evaluate(async () => { const st = await import('/js/state.js'); const P = await import('/js/panels/settings_sim.js'); return P.simulationRecords(st.S.ws).length + st.S.ws.siem.alerts.length; });
ok(left === 0, 'simulation records removed from the screen');
ok(errors.length === 0, 'no console error: ' + errors.join(' | '));
await browser.close(); done('t19 simulation data');
