// CRGO dss/v1 acceptance (0.9.1 brief §8) through the app, the helper and the real ontology server — CRGO v0.10.0 (CRGO_HOME).
// The context is read as of the graph's build date (today): the applicability assessments are dated when the graph is built.
import { open, ok, done, tmp, CRGO, ORG } from './lib.mjs';
import fs from 'fs';
import { execFileSync } from 'child_process';
const { browser, page, errors } = await open('#/process');
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const D = await import('/js/dss.js'); const C = await import('/js/crgo.js');
  const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id);
  const ws = st.S.ws; const out = {};
  out.defaultBaseOk = D.validBase(ws.crgo.base) === null && ws.crgo.base.startsWith('https://crg.invalid/');
  out.w3idRefused = !!D.validBase('https://w3id.org/crgo/data/x/');
  ws.crgo.base = 'https://example.org/crgo-sample/medibec/'; ws.crgo.label = 'MediBec (fictional)';
  const s1 = ws.assessment.SCEN.find(s => s.id === 'S1');
  s1.obligations = ['P-39.1 s. 10'];
  const tgt = { kind: 'scenario-control', sid: 'S1', index: 1, text: s1.controls[0] };
  ws.grc.profile = { orgTypes: ['OrgEnterprise'], establishedIn: ['JurQuebec'], offersServicesIn: [], monitorsBehaviourIn: [], activities: [{ id: 'PA-001', name: 'Patient care', dataCategories: ['DataHealth'], dataSubjectsIn: ['JurQuebec'], transfersTo: [] }], complete: ['hasOrganisationType'] };
  ws.grc.controlTests = [{ id: 'CT-001', target: tgt, date: '2026-09-01', line: 'self-assessment', aspect: 'operation', result: 'effective' },
    { id: 'CT-002', target: tgt, date: '2026-09-15', line: 'internal-audit', aspect: 'operation', result: 'ineffective', sample: 25, deviations: 4, population: 120 }];
  ws.audit.findings = [{ id: 'FND-001', title: 'MFA not enforced', target: tgt, raisedOn: '2026-09-15', status: 'open', condition: 'MFA not enforced on 12 admin accounts', significance: 'high', reopened: [] }];
  ws.grc.determinations = [{ id: 'CD-001', provision: 'P-39.1 s. 10', state: 'partially-satisfied', date: '2026-09-20', evidence: ['EV-1'], evidenceGap: 'No evidence of encryption at rest for imaging storage.' }];
  st.touch();
  // local applicability (port) — kept to compare with the helper's
  const snap = await C.snapshot();
  out.local = D.evaluate(ws.grc.profile, '2026-10-12', snap.legal);
  out.localConflict = D.controlEvidence(ws, tgt, '2026-10-12').conflict;
  const t0 = Date.now();
  const g = await D.buildGraph(ws); out.graph = g.error ? g : { totals: g.totals, agrees: ws.crgo.graph.agrees, sha: g.sha256, release: g.release, app: g.applicability };
  out.graphSecs = (Date.now() - t0) / 1000;
  const help = await D.applicabilityViaHelper(ws); out.helper = help.states;
  const ctx = await D.context('S1', new Date().toISOString().slice(0, 10), ws); out.ctx = ctx;
  const doc = D.document(ws, 'S1', 'residual-risk', { actor: 'test analyst' });
  out.doc = doc;
  out.ok = await D.submit(ws, doc);
  out.approved = await D.submit(ws, { ...doc, status: 'approved' });
  out.tbd = await D.submit(ws, { ...doc, modelVersion: 'TBD' });
  out.badInput = await D.submit(ws, { ...doc, inputs: [D.base(ws) + 'no-such-record'] });
  out.budget = await D.submit(ws, D.document(ws, 'S1', 'budget-target', { actor: 'test analyst' }));
  out.wsid = ws.id; st.touch(); await st.saveNow();
  out.engineRes = Math.round(self.CRG.run(ws.assessment).totals.res);
  out.appVersion = (await import('/js/version.js')).VERSION;
  return out;
});
ok(r.defaultBaseOk && r.w3idRefused, 'default base is private (.invalid); a base under w3id.org/crgo is refused');
ok(!r.graph.error && Math.round(r.graph.totals.est) === 84305 && Math.round(r.graph.totals.res) === 41023 && r.graph.agrees, 'organisation graph built through CRGO\'s bridge reproduces 84,305 / 41,023 ' + JSON.stringify(r.graph).slice(0, 300));
ok(r.graph.release?.tag === '0.10.1' && r.graph.release?.contractUsable && r.graph.release?.viewsUsable, 'CRGO v0.10.1 detected, dss/v1 contract and the 0.10 views usable');
ok(JSON.stringify(Object.fromEntries(Object.entries(r.local).map(([k, v]) => [k, v.state]))) === JSON.stringify(Object.fromEntries(Object.entries(r.helper).map(([k, v]) => [k, v.state]))), 'browser port of the applicability evaluator agrees with CRGO\'s evaluator ' + JSON.stringify(r.helper));
ok(r.local['P-39.1'].state === 'Applicable' && r.local.GDPR.state === 'Unknown', 'Loi 25 applicable; GDPR unknown (facts missing), never "not applicable"');
fs.writeFileSync(tmp('ctx.json'), JSON.stringify(r.ctx));
let schemaOk = '';
try { schemaOk = execFileSync('python3', ['-c', `import sys,json;sys.path.insert(0,'${CRGO}/pipeline/contracts');import dss;print(len(dss.validate_doc(json.load(open('${tmp('ctx.json')}')),'risk-context.schema.json')))`]).toString().trim(); } catch (e) { schemaOk = String(e); }
ok(!r.ctx.error && schemaOk === '0', 'crgo_risk_context for MediBec S1 is schema-valid ' + schemaOk + ' ' + JSON.stringify(r.ctx).slice(0, 200));
const ob = (r.ctx.candidateObligations || []).find(o => o.notation === 'P-39.1 s. 10');
ok(ob && ob.applicability === 'applicable' && ob.complianceState === 'partially-satisfied' && ob.evidenceGap, 'obligation carries applicability, compliance state and evidence gap');
const cl = (r.ctx.controlLinks || [])[0];
ok(cl && cl.latestAssessments.length === 2 && cl.openFindings.length === 1, 'control link carries the latest result per assessor line and the open finding');
ok(r.localConflict, 'self-assessment contradicted by internal audit is a conflict (local)');
ok(r.ctx.ontologyRelease && !JSON.stringify(r.ctx).includes('"riskScore"'), 'no risk score in the context; ontology release cited');
ok(r.ok.status === 'proposed' && /dss-result/.test(r.ok.stored || ''), 'residual-risk write-back stored as proposed ' + JSON.stringify(r.ok).slice(0, 200));
ok(r.doc.modelVersion === r.appVersion && r.doc.inputDocumentSha256 === r.graph.sha && r.doc.inputs.length === 9 && r.doc.result.value > 0, 'write-back carries model version, sha256 of the exact input and the inputs');
const prop = `${ORG}/${r.wsid}/org-dss-proposed.ttl`;
const ttl = fs.existsSync(prop) ? fs.readFileSync(prop, 'utf8') : '';
ok(ttl.includes(r.appVersion) && /CRGO_\d+ "residual-risk|residual-risk of scenario-S1/.test(ttl), 'the proposed graph holds the result, next to the organisation graph');
ok(r.approved.status === 'refused' && r.approved.code === 'STATUS_NOT_PROPOSED', 'status approved is refused and reported');
ok(r.tbd.status === 'refused' && r.tbd.code === 'MODEL_VERSION_MISSING', 'modelVersion TBD is refused and reported');
ok(r.badInput.status === 'refused' && r.badInput.code === 'INPUT_UNKNOWN', 'CRGO\'s own refusal (INPUT_UNKNOWN) is relayed as it came ' + r.badInput.code);
ok(r.budget.status === 'proposed', 'budget-target write-back (currency) stored as proposed ' + (r.budget.message || ''));
ok(r.engineRes === 41023, 'MediBec regression unchanged after all of it');
// UI
await page.evaluate(() => { location.hash = '#/ontology/link'; });
ok(await page.waitForSelector('#panel-ontology >> text=STATUS_NOT_PROPOSED', { timeout: 15000 }).then(() => true, () => false), 'write-back journal shows the refusals');
await page.evaluate(() => { location.hash = '#/qc'; });
ok(await page.waitForSelector('#panel-qc >> text=QC-06', { timeout: 8000 }).then(() => true, () => false), 'Quality review renders');
const qc = await page.evaluate(async () => (await import('/js/panels/qc.js')).checks().reduce((o, c) => (o[c.id] = c.state, o), {}));
ok(qc['QC-06'] === 'fail' && qc['QC-01'] === 'pass' && qc['QC-09'] === 'pass' && qc['QC-12'] === 'pass', 'QC flags the unresolved conflict; write-backs, base and engine pass ' + JSON.stringify(qc));
await page.evaluate(() => { location.hash = '#/scenario/S1'; });
await page.waitForTimeout(800);
await page.click('#scen-tab-onto');   // 1.9.0 Atlas: the ontology card has its own tab
await page.click('#panel-scenario button:has-text("Organisation context and control evidence")');
ok(await page.waitForSelector('#panel-scenario >> text=self-assessment contradicted', { timeout: 30000 }).then(() => true, () => false), 'scenario editor shows the organisation context with the conflict');
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.assessment.SCEN.find(s => s.id === 'S1').crgo = { id: 'LIB-F1467', obligations: [] }; location.hash = '#/scenario/S2'; });
await page.waitForTimeout(400); await page.evaluate(() => { location.hash = '#/scenario/S1'; }); await page.waitForTimeout(800);
await page.click('#scen-tab-onto');   // 1.9.0 Atlas: the ontology card has its own tab
await page.click('#panel-scenario button:has-text("Other regimes, D3FEND and exploitation evidence")');
ok(await page.waitForSelector('#panel-scenario >> text=not a likelihood', { timeout: 30000 }).then(() => true, () => false), 'EPSS/KEV shown as evidence, not a likelihood');
// put the example back
await page.evaluate(async () => { const R = await import('/js/reset.js'); const st = await import('/js/state.js'); await R.restoreTeaching(st.S.ws.id); });
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t12 crgo contract');
