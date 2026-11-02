// CRGO 0.10.0 read contracts compliance/v1 and secops/v1 through the app, the helper and the real ontology server
// (CRGO_HOME, CRG_ORG_DIR). The MediBec teaching case is seeded with
// records equivalent to CRGO's synthetic Nordelle story (nordelle-pca.ttl, nordelle-secops.ttl), then restored.
import { open, ok, done, tmp, CRGO, ORG } from './lib.mjs';
import fs from 'fs';
import { execFileSync } from 'child_process';
const { browser, page, errors } = await open('#/process');
page.setDefaultTimeout(60000);

const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const D = await import('/js/dss.js'); const SOAR = await import('/js/soar.js');
  const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id);
  const ws = st.S.ws, out = {};
  ws.crgo.base = 'https://example.org/crgo-sample/medibec/'; ws.crgo.label = 'MediBec (fictional)';
  const crown = ws.assessment.CROWN[0][0];
  out.crown = crown;
  // ---- shared registers
  ws.shared.evidence = [
    { id: 'EV-901', title: 'Incident register export', validUntil: '2026-06-30', links: [] },
    { id: 'EV-902', title: 'Restore test report', validUntil: '2027-06-30', links: [] },
    { id: 'EV-903', title: 'Breach register review', validUntil: '2027-06-30', sufficiency: 'insufficient', judgedBy: 'Compliance Officer', links: [] }];
  ws.shared.mappings = [
    { id: 'MAP-901', from: { kind: 'statement', id: 'POL-901.1' }, to: { kind: 'obligation', id: 'OBL-901' }, type: 'partial', review: 'reviewed', reviewedBy: 'Compliance Officer', reviewed: '2026-03-15', confidence: 'medium', rationale: 'Detection on servers is one security measure s. 10 requires.' },
    { id: 'MAP-902', from: { kind: 'statement', id: 'POL-901.2' }, to: { kind: 'obligation', id: 'OBL-901' }, type: 'partial', review: 'reviewed', reviewedBy: 'Compliance Officer', reviewed: '2026-03-15' },
    { id: 'MAP-903', from: { kind: 'statement', id: 'POL-901.2' }, to: { kind: 'obligation', id: 'OBL-904' }, type: 'full', review: 'reviewed', reviewedBy: 'Compliance Officer', reviewed: '2026-03-15' }];
  ws.shared.exceptions = [{ id: 'EXC-901', type: 'exception', title: 'No EDR on the legacy imaging server until replacement', policy: 'POL-901', statement: 'POL-901.1', status: 'accepted',
    approvedBy: 'CEO', requestedBy: 'IT Ops', opened: '2026-07-01', expiry: '2026-12-31', concerns: [{ kind: 'statement', id: 'POL-901.1' }], legalObligation: '', compensatedBy: [], scenarios: [] }];
  ws.shared.actions = [
    { id: 'ACT-901', title: 'Automate the quarterly privileged-access review', source: { kind: 'finding', id: 'FND-901' }, owner: 'IAM Lead', due: '2026-09-30', state: 'progress', links: [] },
    { id: 'ACT-902', title: 'Re-train store managers', source: { kind: 'finding', id: 'FND-902' }, owner: 'Store Manager', due: '2026-12-31', state: 'open', links: [] }];
  // ---- policy
  const stmts = [{ id: 'POL-901.1', text: 'Endpoint detection and response runs on every server.', modality: 'must', guideline: false, clause: '', refs: [], training: [] },
    { id: 'POL-901.2', text: 'Backups are restored in a full test twice a year.', modality: 'must', guideline: false, clause: '', refs: [], training: [] }];
  ws.isp.policies = (ws.isp.policies || []).filter(p => p.id !== 'POL-901');
  ws.isp.policies.push({ id: 'POL-901', title: 'Information security policy', type: 'policy', version: '3', status: 'published', owner: 'CISO', statements: stmts, clauses: [], history: [],
    versions: [{ version: '2', state: 'superseded', hash: 'h2', content: { statements: stmts.slice(1) }, effective: '2024-02-01', until: '2026-01-31' },
      { version: '3', state: 'published', hash: 'h3', content: { statements: stmts }, effective: '2026-02-01', nextReview: '2027-02-01', approval: { by: 'Board chair', date: '2026-01-20' } }] });
  ws.isp.acks = [{ id: 'ACK-901', policy: 'POL-901', version: '3', hash: 'h3', person: 'Store Manager', date: '2026-02-10' }];
  // ---- compliance management
  ws.cms.obligations = [
    { id: 'OBL-901', title: 'Security measures for personal information', provision: 'P-39.1 s. 10', owner: 'Compliance Officer', applicability: 'applicable', applicabilityOn: '2026-10-01', status: 'active' },
    { id: 'OBL-902', title: 'Register of confidentiality incidents', provision: 'P-39.1 s. 3.8', owner: 'CISO', applicability: 'applicable', applicabilityOn: '2026-10-01', status: 'active' },
    { id: 'OBL-903', title: 'Notify the supervisory authority within 72 hours', provision: 'GDPR Art. 33(1)', owner: 'Compliance Officer', applicability: 'potentially-applicable', applicabilityOn: '2026-10-01', status: 'active' },
    { id: 'OBL-904', title: 'Hospital backup commitment (contract)', provision: '', owner: 'IT Ops', applicability: 'applicable', applicabilityOn: '2026-10-01', status: 'active' }];
  ws.cms.authorities = [{ id: 'AUTH-901', name: 'Commission d\'accès à l\'information du Québec' }];
  ws.cms.programmes = [{ id: 'PRG-901', name: 'Compliance programme 2026', owner: 'Compliance Officer', covers: ['OBL-901', 'OBL-902', 'OBL-903'], status: 'active' }];
  ws.cms.adoptions = [{ id: 'ADP-901', framework: 'CSF2', part: 'GV, PR', scope: 'All sites', programme: 'PRG-901', decidedBy: 'Board chair', decidedOn: '2026-01-20', status: 'active' }];
  ws.cms.exemptions = [];
  ws.cms.deadlines = [
    { id: 'DL-901', title: 'GDPR notice of the August incident: 72 hours from confirmation', obligation: 'OBL-903', trigger: 'event', incident: 'INC-901', offset: 72, unit: 'hours' },
    { id: 'DL-902', title: 'Annual privacy-officer report', obligation: 'OBL-902', trigger: 'calendar', due: '2026-10-31' },
    { id: 'DL-903', title: 'CAI notice of the August incident', obligation: 'OBL-901', trigger: 'calendar', due: '2026-08-07' }];
  ws.cms.submissions = [{ id: 'SUB-901', title: 'Notice to the CAI', authority: 'AUTH-901', obligation: 'OBL-901', answers: 'DL-903', state: 'acknowledged', preparedBy: 'Compliance Officer', approvedBy: 'CEO', submittedOn: '2026-08-06', receiptRef: 'R-1', receiptOn: '2026-08-07' }];
  ws.grc.determinations = [
    { id: 'CD-901', provision: 'P-39.1 s. 10', obligation: 'OBL-901', state: 'partially-satisfied', date: '2026-10-01', evidence: ['EV-902'], evidenceGap: 'Confidentiality measures not evidenced.', assessor: 'CISO' },
    { id: 'CD-902', provision: 'P-39.1 s. 3.8', obligation: 'OBL-902', state: 'satisfied', date: '2026-10-01', evidence: ['EV-903'], assessor: 'Compliance Officer' },
    { id: 'CD-903', provision: '', obligation: 'OBL-904', state: 'satisfied', date: '2026-09-01', evidence: ['EV-901'], assessor: 'CISO' }];
  // ---- audit
  ws.audit.findings = [
    { id: 'FND-901', title: 'Privileged access review not performed for all accounts', raisedOn: '2026-07-20', status: 'action-planned', condition: 'No Q2 review for adm-07', criterion: 'Policy statement and OBL-902', significance: 'high', reopened: [] },
    { id: 'FND-902', title: 'Store backup checklist not followed', raisedOn: '2026-06-01', status: 'closed', closedOn: '2026-08-26', condition: 'Two stores skipped', significance: 'medium', reopened: [] }];
  ws.audit.observations = [{ id: 'OBS-901', engagement: 'ENG-901', title: 'Q2 review evidence missing', status: 'validated', finding: 'FND-901' }];
  // ---- incidents (csm register)
  ws.csm.incidents = [
    { id: 'INC-901', title: 'Phishing compromise of a customer-service account', status: 'confirmed', detected: '2026-08-03', confirmed: '2026-08-03T10:00', confirmedBy: 'CISO', personalInfo: true, loi25: 'report', gdpr: 'undetermined', category: 'social-engineering', severity: 'high', scenarios: [], timeline: [] },
    { id: 'INC-902', title: 'Malware on an imaging kiosk', status: 'contained', detected: '2026-10-10', confirmed: '2026-10-10', confirmedBy: 'SOC Lead', personalInfo: true, loi25: 'no-report', gdpr: 'undetermined', category: 'malware', severity: 'medium', scenarios: [], timeline: [] },
    { id: 'INC-903', title: 'Impossible-travel alert on an administrator', status: 'alert', detected: '2026-10-11', scenarios: [], timeline: [], loi25: 'not-assessed', gdpr: 'not-assessed' }];
  // ---- SIEM
  const S = ws.siem;
  S.sources = [{ id: 'TS-901', name: 'Identity provider sign-in logs', health: 'healthy', healthHistory: [{ date: '2026-01-01', state: 'healthy' }] },
    { id: 'TS-902', name: 'EDR telemetry from servers', health: 'silent', healthHistory: [{ date: '2026-10-11', state: 'silent' }] }];
  S.strategies = [{ id: 'DS-901', name: 'Detect mass file encryption', reference: 'DET0215', techniques: ['T1486'] }, { id: 'DS-902', name: 'Detect valid-account abuse', reference: 'DET0560', techniques: ['T1078'] }];
  S.rules = [{ id: 'DR-901', title: 'Burst of file renames', version: '3', status: 'production', techniques: ['T1486'], scenarios: ['S1'], requiredSources: ['TS-901'], strategy: 'DS-901', created: '2026-05-01', history: [] },
    { id: 'DR-902', title: 'Impossible travel for administrators', version: '2', status: 'production', techniques: ['T1078'], scenarios: ['S2'], requiredSources: ['TS-901', 'TS-902'], strategy: 'DS-902', created: '2026-09-01', history: [] }];
  S.tests = [{ id: 'DT-901', ruleId: 'DR-901', ruleVersion: '3', date: '2026-06-10', tester: 'SOC Lead', result: 'effective', method: 'replay' }];
  S.coverage = []; S.gaps = [{ id: 'GAP-901', title: 'No server EDR telemetry', scenario: 'S2', technique: 'T1078', source: 'TS-902', status: 'open', raised: '2026-09-01' }];
  S.alerts = [{ id: 'AL-901', title: 'Impossible travel on a crown-jewel administrator', triage: 'new', detected: '2026-10-11T22:05', ruleId: 'DR-902', asset: crown, tlp: 'AMBER', indicators: ['IND-901'] },
    { id: 'AL-902', title: 'VPN exit node (false positive)', triage: 'false-positive', detected: '2026-10-09T07:30', ruleId: 'DR-902', asset: crown, tlp: 'GREEN' },
    { id: 'AL-903', title: 'Later alert', triage: 'new', detected: '2026-10-13T01:00', asset: 'kiosk', tlp: 'CLEAR' }];
  S.indicators = [{ id: 'IND-901', name: 'Phishing domain', pattern: "[domain-name:value = 'login-medibec.example']", patternType: 'stix', validFrom: '2026-10-01', validUntil: '2026-12-31', confidence: 70, confidenceMethod: 'STIX 2.1 confidence', tlp: 'RED', source: 'Health ISAC (fictional)' }];
  // ---- SOAR
  const O = SOAR.reg(ws);
  O.gates = [{ id: 'GATE-901', name: 'Containment needs SOC lead or CISO', riskClasses: ['containment', 'destructive'], criticalAssets: true, authorities: ['SOC Lead', 'CISO'] }];
  O.playbooks = [{ id: 'PB-901', name: 'Compromised account', owner: 'SOC Lead', scenarios: ['S2'], trigger: { kind: 'alert' }, current: 2,
      versions: [{ version: 1, state: 'retired', published: '2025-11-01', publishedBy: 'SOC Lead', steps: [] }, { version: 2, state: 'published', published: '2026-09-15', publishedBy: 'SOC Lead', steps: [] }] },
    { id: 'PB-902', name: 'Ransomware on a server', owner: 'SOC Lead', scenarios: ['S1'], trigger: { kind: 'alert' }, current: 1, versions: [{ version: 1, state: 'published', published: '2026-05-01', publishedBy: 'SOC Lead', steps: [] }] }];
  O.simulations = [{ id: 'SIM-901', playbook: 'PB-901', version: 2, date: '2026-09-20', by: 'CISO', result: 'passed', mode: 'dry-run', steps: [] }];
  O.approvals = [{ id: 'APR-901', kind: 'specific', outcome: 'approved', requestedBy: 'SOC Analyst', approver: 'SOC Lead', decidedOn: '2026-08-03T09:30', validFrom: '2026-08-03T09:30', validUntil: '2026-08-03T21:30', execution: 'EXE-901' },
    { id: 'APR-902', kind: 'pre-authorisation', outcome: 'approved', requestedBy: 'SOC Lead', approver: 'CISO', decidedOn: '2026-07-01', validFrom: '2026-07-01', validUntil: '2026-09-30', riskClasses: ['containment'], targets: ['KIOSK-12'] }];
  O.executions = [
    { id: 'EXE-901', action: 'Disable account adm-07', riskClass: 'containment', target: 'adm-07', performedBy: 'SOC Analyst', attempt: 'run-5521-2', started: '2026-08-03T09:35', status: 'succeeded', approval: 'APR-901' },
    { id: 'EXE-902', action: 'Isolate kiosk', riskClass: 'containment', target: 'KIOSK-12', performedBy: 'SOC Analyst', attempt: 'run-6010-1', started: '2026-10-10T14:02', status: 'succeeded', approval: 'APR-902' },
    { id: 'EXE-903', action: 'Collect kiosk logs', riskClass: 'read-only', target: 'KIOSK-12', performedBy: 'SOC Analyst', attempt: 'run-6010-0', started: '2026-10-10T14:01', status: 'succeeded' },
    { id: 'EXE-904', action: 'Block payment admin', riskClass: 'containment', target: 'pay-admin', performedBy: 'SOC Analyst', attempt: 'run-7000-1', started: '2026-10-11T23:00', status: 'succeeded' }];
  O.cases = [{ id: 'CASE-901', title: 'August phishing', status: 'closed', opened: '2026-08-03', alerts: [], incident: 'INC-901', timeline: [] }];
  out.appUnapproved = Object.fromEntries(SOAR.unapproved(ws).map(u => [u.x.id, u.reason]));
  st.touch();
  // ---- graph, then the two views
  const g = await D.buildGraph(ws);
  out.graph = g.error ? g : { totals: g.totals, agrees: ws.crgo.graph.agrees, release: g.release, factTriples: g.factTriples, unknown: g.unknownProvisions };
  out.c = await D.complianceContext(ws, '2026-10-12');
  out.s = await D.secopsContext(ws, '2026-10-12');
  out.cEarly = await D.complianceContext(ws, '2026-06-01');
  out.sEarly = await D.secopsContext(ws, '2026-06-01');
  out.sToday = await D.secopsContext(ws, '2026-10-13');
  out.bad = await D.complianceContext(ws, '12/10/2026');
  out.wsid = ws.id; out.base = D.base(ws);
  ws.crgo.base = 'https://w3id.org/crgo/x/';
  out.refNs = await D.secopsContext(ws, '2026-10-12');
  ws.crgo.base = out.base;
  out.engine = [Math.round(self.CRG.run(ws.assessment).totals.est), Math.round(self.CRG.run(ws.assessment).totals.res)];
  st.touch(); await st.saveNow();
  return out;
});
fs.writeFileSync(tmp('t21.json'), JSON.stringify(r, null, 1));
const B = r.base, P = 'https://w3id.org/crgo/vocab/';
ok(!r.graph.error && Math.round(r.graph.totals.est) === 84305 && Math.round(r.graph.totals.res) === 41023 && r.graph.agrees, 'graph with the 1.6.0 records keeps the MediBec totals 84,305 / 41,023 ' + JSON.stringify(r.graph).slice(0, 300));
ok(r.graph.release?.tag === '0.10.1' && r.graph.release?.viewsUsable, 'CRGO v0.10.1 detected, views usable');
ok(r.engine[0] === 84305 && r.engine[1] === 41023, 'engine regression unchanged');
// schema validity of both documents (CRGO's own validator)
fs.writeFileSync(tmp('t21c.json'), JSON.stringify(r.c)); fs.writeFileSync(tmp('t21s.json'), JSON.stringify(r.s));
const val = (f, c) => { try { return execFileSync('python3', ['-c', `import sys,json;sys.path.insert(0,'${CRGO}/pipeline/contracts');import views;print(len(views.validate(json.load(open('${f}')),'${c}')))`]).toString().trim(); } catch (e) { return String(e).slice(0, 300); } };
ok(!r.c.error && val(tmp('t21c.json'), 'compliance/v1') === '0', 'compliance/v1 document is schema-valid ' + JSON.stringify(r.c).slice(0, 200));
ok(!r.s.error && val(tmp('t21s.json'), 'secops/v1') === '0', 'secops/v1 document is schema-valid ' + JSON.stringify(r.s).slice(0, 200));
// compliance/v1
const obl = id => (r.c.obligations || []).find(o => o.id === id);
const s10 = obl(P + 'loi25/P-39.1_s._10'), s38 = obl(P + 'loi25/P-39.1_s._3.8'), a33 = obl(P + 'gdpr/GDPR_Art._33_1'), own = obl(B + 'obligation/OBL-904');
ok(s10 && s10.applicability === 'applicable' && s10.complianceState === 'partially-satisfied' && s10.evidenceStatus === 'current', 's. 10: applicable, partially satisfied, evidence current ' + JSON.stringify(s10).slice(0, 300));
ok(s10 && s10.supportingStatements.length === 2 && s10.supportingStatements.every(x => x.mappingType === 'partial-coverage' && x.reviewState === 'approved'), 's. 10 supporting statements carry mapping type and review state (not compliance)');
ok(s10 && s10.owners.includes(B + 'person/compliance-officer'), 's. 10 owner from the obligation register');
ok(s38 && s38.complianceState === 'satisfied' && s38.evidenceStatus === 'judged-insufficient', 's. 3.8 satisfied on evidence judged insufficient ' + JSON.stringify(s38).slice(0, 200));
ok(s38 && s38.openFindings.includes(B + 'finding/FND-901'), 's. 3.8 lists the open finding whose criterion cites OBL-902');
ok(a33 && a33.applicability === 'potentially-applicable' && a33.complianceState === 'not-assessed' && a33.evidenceStatus === 'none', 'GDPR Art. 33(1): potentially applicable, no determination (programme coverage only)');
ok(own && own.complianceState === 'satisfied' && own.evidenceStatus === 'expired' && own.supportingStatements.some(x => x.mappingType === 'full-coverage'), 'own obligation: a full-coverage mapping does not hide that the evidence relied on had expired ' + JSON.stringify(own).slice(0, 200));
const exc = (r.c.exceptions || []).find(e => e.id === B + 'exception/EXC-901');
ok(exc && exc.active && exc.provisionsWithoutExemption.includes(P + 'loi25/P-39.1_s._10'), 'EDR exception is active and concerns s. 10 without a regulatory exemption ' + JSON.stringify(exc));
const dl = id => (r.c.deadlines || []).find(d => d.id === B + 'compliance/deadline/' + id);
ok(dl('DL-901') && dl('DL-901').trigger === 'event' && dl('DL-901').due === '2026-08-06T10:00:00' && dl('DL-901').answered === false, 'GDPR 72-hour deadline computed from the confirmation and unanswered ' + JSON.stringify(dl('DL-901')));
ok(dl('DL-903') && dl('DL-903').answered === true && dl('DL-902') && dl('DL-902').answered === false, 'calendar deadlines: one answered by a submission, one open');
const f1 = (r.c.findings || []).find(f => f.id === B + 'finding/FND-901'), f2 = (r.c.findings || []).find(f => f.id === B + 'finding/FND-902');
ok(f1 && f1.open && f1.overdueActions.includes(B + 'action/ACT-901') && f2 && !f2.open, 'findings: open with an overdue action; closed one closed');
const pv = (r.c.directiveVersions || []).find(v => v.id === B + 'policy-version/POL-901/3');
ok(pv && pv.state === 'published' && pv.reviewDueOn === '2027-02-01' && !pv.reviewOverdue, 'policy version 3 published, review due 2027-02-01');
ok((r.c.caveats || []).some(c => /never evidence of compliance/.test(c)), 'compliance caveats returned');
// dated records
const s10e = (r.cEarly.obligations || []).find(o => o.id === P + 'loi25/P-39.1_s._10');
ok(s10e && s10e.complianceState === 'not-assessed' && s10e.applicability === 'not-assessed', 'as of 2026-06-01 the October determination and applicability are ignored');
// secops/v1
const sc = id => (r.s.scenarios || []).find(s => s.id === B + 'scenario-' + id);
ok(sc('S1') && sc('S1').coverage.some(c => c.validatedByTest && c.techniques.includes('T1486')), 'S1 coverage validated by an effective detection test ' + JSON.stringify(sc('S1')).slice(0, 300));
ok(sc('S2') && sc('S2').coverage.length && sc('S2').coverage.every(c => !c.validatedByTest) && sc('S2').detectionGaps.includes(B + 'detection-gap/GAP-901'), 'S2 coverage not validated, with its detection gap ' + JSON.stringify(sc('S2')).slice(0, 300));
const pb = (s, id) => (sc(s)?.playbooks || []).find(p => p.id === B + 'playbook/' + id);
ok(pb('S2', 'PB-901')?.simulationPassed === true && pb('S1', 'PB-902')?.simulationPassed === false, 'compromised-account playbook simulated; ransomware playbook not');
const dr2 = (r.s.detectionRules || []).find(x => x.id === B + 'detection-rule/DR-902');
ok(dr2 && dr2.status === 'enabled' && dr2.requiredSources.some(x => x.id === B + 'telemetry/TS-902' && x.health === 'silent'), 'rule needing silent EDR telemetry reported with its health');
const al = (r.s.untriagedAlerts || []);
ok(al.length === 1 && al[0].id === B + 'alert/AL-901' && al[0].crownJewel, 'one untriaged alert, on a crown jewel; the false positive and the later alert are not listed ' + JSON.stringify(al));
ok(((r.sToday.untriagedAlerts || []).length === 2), 'as of 2026-10-13 the later alert appears');
const ex = Object.fromEntries((r.s.executionsWithoutValidApproval || []).map(x => [x.id.split('/').pop(), x.reason]));
ok(ex['EXE-902'] === 'expired' && ex['EXE-904'] === 'absent' && !ex['EXE-901'] && !ex['EXE-903'], 'executions without valid approval: expired pre-authorisation, absent approval ' + JSON.stringify(ex));
ok(JSON.stringify(ex) === JSON.stringify(Object.fromEntries(Object.entries(r.appUnapproved).sort())), 'CRGO and the application agree on the approval gaps ' + JSON.stringify(r.appUnapproved));
const tri = (r.s.openRegulatoryTriage || []).map(t => t.incident.split('/').pop());
ok(tri.includes('INC-901') && tri.includes('INC-902') && !tri.includes('INC-903'), 'two incidents with undetermined GDPR reportability; the alert is not an incident ' + JSON.stringify(tri));
ok((r.s.approvalGates || []).length === 1 && r.s.approvalGates[0].authorities.length === 2, 'approval gate with its authorities');
ok((r.sEarly.scenarios || []).every(s => s.coverage.every(c => !c.validatedByTest)), 'as of 2026-06-01 no coverage is validated (dated records respected)');
// errors verbatim
ok(r.bad.error && r.bad.code === 'SCHEMA_INVALID', 'a bad date is refused by CRGO with SCHEMA_INVALID ' + JSON.stringify(r.bad));
ok(r.refNs.error && r.refNs.code === 'REFERENCE_NAMESPACE', 'an organisation under w3id.org/crgo is refused with REFERENCE_NAMESPACE ' + JSON.stringify(r.refNs));
// the graph file: TLP:RED indicator kept without its pattern; confidence stated with its method; no incident for the alert
const ttl = fs.readFileSync(`${ORG}/${r.wsid}/orgfacts.ttl`, 'utf8');
ok(!ttl.includes('login-medibec.example') && ttl.includes('indicator/IND-901'), 'TLP:RED indicator: marking kept, pattern not written');
ok(!ttl.includes('incident/INC-903'), 'an alert-status entry of the incident register is not written as an incident');
ok(ttl.includes('"POL-901.1"') && ttl.includes('"EXE-902"') && ttl.includes('"OBL-901"'), 'application identifiers kept as localIdentifier');

// ---- UI: Ontology → Organisation link shows both contexts
await page.evaluate(() => { location.hash = '#/ontology/link'; });
ok(await page.waitForSelector('#panel-ontology >> text=Compliance context', { timeout: 20000 }).then(() => true, () => false), 'link tab shows the compliance context section');
await page.fill('#crgo-views-asof', '2026-10-12');
await page.click('#panel-ontology button:has-text("Read both contexts")');
ok(await page.waitForSelector('#panel-ontology >> text=judged-insufficient', { timeout: 60000 }).then(() => true, () => false), 'compliance table shows evidence status');
ok(await page.waitForSelector('#panel-ontology >> text=expired pre-authorisation', { timeout: 30000 }).then(() => true, () => false) || await page.locator('#panel-ontology >> text=approval expired').count() > 0, 'secops table shows the approval gap reason');
ok(await page.locator('#panel-ontology >> text=No inference made in CRGO authorises a response action').count() > 0, 'secops caveats shown verbatim');
await page.fill('#crgo-views-asof', '');
await page.click('#panel-ontology button:has-text("Read both contexts")');
ok(await page.waitForSelector('#panel-ontology >> text=SCHEMA_INVALID', { timeout: 30000 }).then(() => true, () => false), 'a refusal is shown verbatim');
ok(await page.locator('#panel-ontology >> text=CRGO v0.10.1').count() > 0, 'release banner names CRGO v0.10.1');
// ---- QC
const qc = await page.evaluate(async () => (await import('/js/panels/qc.js')).checks().reduce((o, c) => (o[c.id] = { s: c.state, d: c.detail }, o), {}));
fs.writeFileSync(tmp('t21qc.json'), JSON.stringify(qc, null, 1));
ok(qc['QC-14'] && qc['QC-14'].s === 'fail' && /OBL-904|CD-903/.test(qc['QC-14'].d), 'QC-14: a determination "satisfied" on expired evidence is flagged ' + JSON.stringify(qc['QC-14']));
ok(qc['QC-15'] && qc['QC-15'].s === 'pass', 'QC-15: every incident confirmed by a person on a date ' + JSON.stringify(qc['QC-15']));
ok(qc['QC-16'] && qc['QC-16'].s !== 'pass' && /EXE-902/.test(qc['QC-16'].d) && /EXE-904/.test(qc['QC-16'].d), 'QC-16: containment executions without valid approval listed as audit signals ' + JSON.stringify(qc['QC-16']));
ok(qc['QC-17'] && qc['QC-17'].s === 'pass', 'QC-17: no TLP:RED / AMBER+STRICT material in reports ' + JSON.stringify(qc['QC-17']));
ok(qc['QC-18'] && qc['QC-18'].s === 'pass', 'QC-18: source confidence not used as a probability ' + JSON.stringify(qc['QC-18']));
// negative cases
const qc2 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const ws = st.S.ws;
  ws.siem.alerts[0].triage = 'escalated'; ws.soar.cases.push({ id: 'CASE-902', title: 'Escalated', status: 'investigating', opened: '2026-10-12', alerts: ['AL-901'], incident: 'INC-904', timeline: [] });
  ws.csm.incidents.push({ id: 'INC-904', title: 'From an alert', status: 'confirmed', detected: '2026-10-12', scenarios: [], timeline: [] });
  const s = ws.assessment.SCEN.find(x => x.id === 'S2'); const old = s.params.PbA.rat; s.params.PbA.rat = (old || '') + ' Set from the ISAC confidence 70 (0.70).';
  const Q = await import('/js/panels/qc.js'); const out = Q.checks().reduce((o, c) => (o[c.id] = { s: c.state, d: c.detail }, o), {});
  ws.recommendations = ws.recommendations || []; ws.recommendations.push({ id: 'REC-T21', text: 'Block login-medibec.example at the proxy' });
  out.c17 = Q.checks().find(c => c.id === 'QC-17'); ws.recommendations.pop();
  s.params.PbA.rat = old; ws.csm.incidents.pop(); ws.soar.cases.pop(); ws.siem.alerts[0].triage = 'new';
  return out;
});
ok(qc2['QC-15'].s === 'fail' && /INC-904/.test(qc2['QC-15'].d), 'QC-15 fails for an incident without a confirmation by a person ' + JSON.stringify(qc2['QC-15']));
ok(qc2.c17?.state === 'fail' && /recommendations/.test(qc2.c17.detail), 'QC-17 fails when TLP:RED material appears in a recommendation ' + JSON.stringify(qc2.c17));
ok(qc2['QC-18'].s === 'fail' && /S2/.test(qc2['QC-18'].d), 'QC-18 fails when a likelihood rationale is set from a source confidence ' + JSON.stringify(qc2['QC-18']));
// put the example back
await page.evaluate(async () => { const R = await import('/js/reset.js'); const st = await import('/js/state.js'); await R.restoreTeaching(st.S.ws.id); });
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t21 crgo 0.10 contracts');
