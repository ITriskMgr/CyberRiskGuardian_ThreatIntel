// 1.9.0 — SSVC beside EPSS/KEV: the published trees, Exploitation suggested from KEV/EPSS/PoC as evidence,
// one decision record per CVE (who, when, justification, outcome, history), override needs a justification,
// tree per workspace, never a likelihood (no parameter and no total changes), the ssvc field and its migration.
import { open, ok, done, URL } from './lib.mjs';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN = path.resolve(HERE, '../../plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts');

const { browser, page, errors } = await open('#/process');
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SV = await import('/js/ssvc.js'); const M = await import('/js/migrate.js'); const R = await import('/js/reset.js');
  let ex; for (let i = 0; i < 40 && !(ex = st.S.list.find(w => w.kind === 'example')); i++) { await new Promise(r => setTimeout(r, 250)); await st.refreshList?.(); } await st.select(ex.id);
  const ws = st.S.ws, out = {};
  const snap = await (await fetch('/examples/threat-context/threat-context-example.json')).json();
  await st.setSnapshot(snap, 'threat-context-2026-10-03.json');
  const before = st.compute(ws).totals, params = JSON.stringify(ws.assessment.SCEN.map(s => [s.params, s.red_p, s.red_i, s.cvss]));
  // tables
  out.sizes = [SV.TREES.deployer.rows.length, SV.TREES['deployer-cert'].rows.length, SV.TREES.supplier.rows.length];
  out.cells = [
    SV.evaluate('deployer', { exploitation: 'active', automatable: 'yes', technical_impact: 'total', mission_prevalence: 'essential', public_wellbeing: 'minimal' }).outcome,
    SV.evaluate('deployer', { exploitation: 'none', automatable: 'no', technical_impact: 'partial', mission_prevalence: 'minimal', public_wellbeing: 'minimal' }).outcome,
    SV.evaluate('deployer', { exploitation: 'public poc', automatable: 'no', technical_impact: 'total', mission_prevalence: 'support', public_wellbeing: 'minimal' }).outcome,
    SV.evaluate('deployer-cert', { exploitation: 'active', exposure: 'open', automatable: 'yes', safety_impact: 'negligible', mission_impact: 'mef failure' }).outcome,
    SV.evaluate('supplier', { exploitation: 'public poc', automatable: 'yes', value_density: 'diffuse', technical_impact: 'total', safety_impact: 'marginal' }).outcome];
  out.incomplete = SV.evaluate('deployer', { exploitation: 'active' });
  // every combination of every tree reaches an outcome of that tree
  out.allOk = Object.entries(SV.TREES).every(([id, T]) => {
    const vals = T.inputs.map(k => SV.POINTS[k].values.map(v => v[0]));
    const combos = vals.reduce((acc, vs) => acc.flatMap(a => vs.map(v => [...a, v])), [[]]);
    return combos.every(c => T.outcomes.includes(SV.evaluate(id, Object.fromEntries(T.inputs.map((k, i) => [k, c[i]]))).outcome));
  });
  // register three CVEs: KEV-listed, high EPSS, absent from the snapshot
  ws.vulns.push({ id: 'CVE-2026-102490', kind: 'CVE', title: '', product: 'Zammad', asset: 'helpdesk', exposed: true, source: 'test', added: '2026-11-02', cwe: [], notes: '' },
    { id: 'CVE-1999-0016', kind: 'CVE', title: '', product: 'Old', asset: '', exposed: false, source: 'test', added: '2026-11-02', cwe: [], notes: '' },
    { id: 'CVE-2026-99999', kind: 'CVE', title: '', product: 'Portal', asset: '', exposed: true, source: 'test', added: '2026-11-02', cwe: [], notes: '' });
  const sug = id => SV.suggestExploitation(ws.vulns.find(v => v.id === id), st.S.snap, []);
  out.sug = ['CVE-2026-102490', 'CVE-1999-0016', 'CVE-2026-99999'].map(id => sug(id).value);
  out.sugPoc = SV.suggestExploitation({ id: 'CVE-2026-99999' }, st.S.snap, [{ title: 'PoC released for CVE-2026-99999', text: 'public exploit on GitHub', cves: ['CVE-2026-99999'] }]).value;
  out.basis = sug('CVE-2026-102490').basis.join(' | ');
  { const h = sug('CVE-1999-0016'); out.hi = { high: h.epssHigh, basis: h.basis.join(' | ') }; }
  out.hiPoc = SV.suggestExploitation({ id: 'CVE-1999-0016' }, st.S.snap, [{ title: 'PoC released for CVE-1999-0016', text: 'public exploit', cves: ['CVE-1999-0016'] }]).value;
  // a decision needs who, and a justification when Exploitation departs from the evidence
  const pts = { exploitation: 'none', automatable: 'no', technical_impact: 'partial', mission_prevalence: 'minimal', public_wellbeing: 'minimal' };
  try { SV.decide(ws, 'CVE-2026-99999', { points: pts, by: '', suggestion: sug('CVE-2026-99999') }); out.noBy = 'accepted'; } catch (e) { out.noBy = e.message; }
  try { SV.decide(ws, 'CVE-2026-99999', { points: { ...pts, exploitation: 'active' }, by: 'Analyst A', suggestion: sug('CVE-2026-99999') }); out.noJust = 'accepted'; } catch (e) { out.noJust = e.message; }
  const rec = SV.decide(ws, 'CVE-2026-99999', { points: { ...pts, exploitation: 'active' }, by: 'Analyst A', justification: 'Vendor confirms exploitation seen at peers', suggestion: sug('CVE-2026-99999') });
  out.rec = { outcome: rec.outcome, override: rec.override, by: rec.by, date: rec.date, tree: rec.tree, points: rec.points, derived: rec.derived, ev: rec.evidence?.suggested };
  const rec2 = SV.decide(ws, 'CVE-2026-99999', { points: { ...pts, exploitation: 'active', automatable: 'yes', technical_impact: 'total', mission_prevalence: 'essential' }, by: 'Analyst B', justification: 'Re-assessed', suggestion: sug('CVE-2026-99999') });
  out.rec2 = { outcome: rec2.outcome, history: rec2.history.length, prevBy: rec2.history[0]?.by };
  out.one = Object.keys(ws.ssvc.decisions).length;
  // never a likelihood: nothing in the assessment moved
  const after = st.compute(ws).totals;
  out.same = Math.round(before.est) === Math.round(after.est) && Math.round(before.res) === Math.round(after.res) && params === JSON.stringify(ws.assessment.SCEN.map(s => [s.params, s.red_p, s.red_i, s.cvss]));
  out.totals = [Math.round(after.est), Math.round(after.res)];
  out.noProb = !JSON.stringify(ws.ssvc).match(/"(likelihood|probability|Pbx|PbA)"/);
  // field, migration and reset group
  out.known = M.KNOWN_FIELDS.includes('ssvc') && 'ssvc' in st.newWorkspace() && st.newWorkspace().ssvc.tree === 'deployer';
  const entry = M.STEP4.find(x => x.field === 'ssvc');
  out.step = !!entry && entry.group === 'CONTEXT' && entry.blank().tree === 'deployer' && Array.isArray(entry.blank().review) && M.DATA_VERSION === 4;
  const v3 = st.newWorkspace({ name: 'v3' }); delete v3.ssvc; v3.dataVersion = 3;
  const mr = M.migrateWorkspace(JSON.parse(JSON.stringify(v3)), { fill: st.migrate });
  out.mig = mr.status === 'migrated' && mr.ws.ssvc?.tree === 'deployer' && Array.isArray(mr.ws.ssvc.review) && /SSVC/.test(JSON.stringify(mr.ws.migrationLog));
  const keep = st.migrate(Object.assign(st.newWorkspace(), { ssvc: { tree: 'supplier', decisions: { a: 1 } } }));
  out.migKeep = keep.ssvc.tree === 'supplier' && keep.ssvc.decisions.a === 1 && Array.isArray(keep.ssvc.review);
  out.reset = R.CONTEXT.includes('ssvc') && !R.kept('clean').has('ssvc') && R.kept('context').has('ssvc');
  st.touch();
  return out;
});
ok(r.sizes.join() === '36,72,36', 'tables: CISA 36 rows, CERT/CC deployer 72, supplier 36 ' + r.sizes);
ok(r.cells.join() === 'act,track,track*,out-of-cycle,immediate', 'published cells ' + r.cells);
ok(!r.incomplete.complete && r.incomplete.outcome === null && r.incomplete.missing.length === 4, 'an incomplete decision has no outcome');
ok(r.allOk, 'every combination of every tree reaches one of its outcomes');
ok(r.sug.join() === 'active,none,none', 'Exploitation suggested: KEV → active, EPSS high alone → none (review L4), nothing → none ' + r.sug);
ok(r.hi.high && /high exploitation probability \(EPSS\); not evidence of public exploit code/.test(r.hi.basis) && !/PoC/.test(r.hi.basis), 'review L4: a high EPSS is stated as a high exploitation probability (EPSS), not a public PoC ' + JSON.stringify(r.hi));
ok(r.hiPoc === 'public poc', 'review L4: a PoC report (not the EPSS) sets public poc');
ok(r.sugPoc === 'public poc', 'a public PoC in the feeds → public poc');
ok(/CISA KEV: listed 2026-10-02/.test(r.basis) && /EPSS/.test(r.basis), 'the basis names KEV and EPSS ' + r.basis);
ok(/Name the person/.test(r.noBy), 'a decision needs who decides');
ok(/justification is required/.test(r.noJust), 'an override without justification is refused');
ok(r.rec.outcome === 'track' && r.rec.override?.from === 'none' && r.rec.override?.to === 'active' && r.rec.by === 'Analyst A' && /^\d{4}-\d\d-\d\d$/.test(r.rec.date) && r.rec.tree === 'deployer' && r.rec.derived.mwb === 'low' && r.rec.ev === 'none',
  'decision record: points, derived, outcome, override with justification, who, when ' + JSON.stringify(r.rec));
ok(r.rec2.outcome === 'act' && r.rec2.history === 1 && r.rec2.prevBy === 'Analyst A', 'a new decision keeps the previous one in its history');
ok(r.one === 1, 'one decision record per CVE');
ok(r.same && r.totals.join() === '84305,41023', 'never a likelihood: parameters and totals unchanged (84,305 / 41,023)');
ok(r.noProb, 'no likelihood or probability field in the SSVC record');
ok(r.known, 'ssvc in KNOWN_FIELDS and the factory (tree deployer)');
ok(r.step && r.mig && r.migKeep, 'STEP4 entry ssvc: data version 3 → 4 adds the empty record (journalled); the shape repair keeps an existing one');
ok(r.reset, 'reset: ssvc goes with the vulnerability register (CONTEXT)');

// the screen
await page.goto(URL + '#/vulns/ssvc');
await page.waitForFunction(() => document.body.textContent.includes('Decisions by vulnerability'), null, { timeout: 15000 });
let t = await page.textContent('main');
ok(/A response priority, not a likelihood/.test(t) && /CVE-2026-102490/.test(t) && /Act/.test(t), 'SSVC tab lists the register with outcomes');
await page.click('tr:has-text("CVE-2026-102490") >> button:has-text("Decide")');
await page.waitForSelector('text=SSVC decision — CVE-2026-102490');
const exploitSel = page.locator('select[aria-label="Exploitation"]');
ok(await exploitSel.inputValue() === 'active', 'the form preselects the suggested Exploitation (KEV → active)');
await page.selectOption('select[aria-label="Automatable"]', 'yes');
await page.selectOption('select[aria-label="Technical Impact"]', 'total');
await page.selectOption('select[aria-label="Mission Prevalence"]', 'support');
await page.selectOption('select[aria-label="Public Well-Being Impact"]', 'minimal');
await page.fill('input[placeholder="Name of the person deciding"]', 'Analyst C');
await page.click('button:has-text("Record the decision")');
await page.waitForTimeout(500);
const d = await page.evaluate(async () => { const st = await import('/js/state.js'); return st.S.ws.ssvc.decisions['CVE-2026-102490']; });
ok(d && d.outcome === 'act' && d.by === 'Analyst C' && !d.override && d.evidence.kev.added === '2026-10-02', 'recorded from the screen: Act, by Analyst C, KEV evidence kept');
// register column and CVE detail
await page.goto(URL + '#/vulns');
await page.waitForSelector('th:has-text("SSVC")');
t = await page.textContent('main');
ok(/SSVC/.test(t) && /decide/.test(t), 'register shows an SSVC column (decided and to decide)');
await page.goto(URL + '#/vulns/CVE-2026-102490');
await page.waitForSelector('text=Review the decision');
ok(/never a likelihood/.test(await page.textContent('main')), 'CVE detail shows the SSVC outcome as a response priority');
// tree per workspace: switching marks decisions for review
await page.goto(URL + '#/vulns/ssvc');
await page.waitForSelector('select[aria-label="SSVC tree for this workspace"]');
await page.selectOption('select[aria-label="SSVC tree for this workspace"]', 'supplier');
await page.waitForTimeout(400);
t = await page.textContent('main');
ok(/other tree — review/.test(t) && /Out-of-Cycle/.test(t), 'switching to the supplier tree marks earlier decisions for review');
const tree = await page.evaluate(async () => (await import('/js/state.js')).S.ws.ssvc.tree);
ok(tree === 'supplier', 'tree stored per workspace');
await page.selectOption('select[aria-label="SSVC tree for this workspace"]', 'deployer');
// clean up the example workspace
await page.evaluate(async () => { const st = await import('/js/state.js'); const ws = st.S.ws; ws.vulns = ws.vulns.filter(v => v.source !== 'test'); ws.ssvc = { tree: 'deployer', decisions: {}, review: [] }; st.touch(); await st.saveNow?.(); });
// the plugin's deterministic script and its tests
const py = spawnSync('python3', ['-I', path.join(PLUGIN, 'test_ssvc.py')], { encoding: 'utf8' });
ok(py.status === 0 && /\bOK\b/.test(py.stderr + py.stdout), 'plugin test_ssvc.py passes ' + (py.stderr || '').slice(-200));
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t33 SSVC');
