// SOAR module (local only): approvals (no self-approval, expiry, revocation, authority), risk-class gates,
// playbook versions frozen with SHA-256, dry-run simulation, incident confirmation by a person, regulator
// notice → regulatory submission, lessons → shared corrective actions, crg-soar-import/1, screens.
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');

const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const M = await import('/js/soar.js');
  await st.create(st.newWorkspace({ name: 'SOAR test t18' }));
  const ws = st.S.ws, out = {}, R = M.reg(ws);
  for (const k of ['cases', 'playbooks', 'gates', 'approvals', 'executions', 'simulations', 'lessons', 'communications']) R[k].length = 0;
  ws.cms.submissions = ws.cms.submissions || [];
  const subs0 = ws.cms.submissions.length, inc0 = ws.csm.incidents.length, act0 = ws.shared.actions.length;

  // --- approvals: no self-approval, bounded pre-authorisation
  out.self = M.approvalError({ kind: 'specific', requestedBy: 'Ann Analyst', approver: 'ann analyst', outcome: 'approved', decidedOn: '2026-10-01', validFrom: '2026-10-01', action: 'isolate host' });
  out.preNoExpiry = M.approvalError({ kind: 'pre-authorisation', requestedBy: 'Ann', approver: 'Sam Lead', outcome: 'approved', decidedOn: '2026-10-01', validFrom: '2026-10-01', riskClasses: ['containment'], targets: ['KIOSK-1'] });
  out.preNoScope = M.approvalError({ kind: 'pre-authorisation', requestedBy: 'Ann', approver: 'Sam Lead', outcome: 'approved', decidedOn: '2026-10-01', validFrom: '2026-10-01', validUntil: '2026-12-31', riskClasses: ['containment'] });
  out.revNoBy = M.approvalError({ kind: 'specific', requestedBy: 'Ann', approver: 'Sam Lead', outcome: 'approved', decidedOn: '2026-10-01', validFrom: '2026-10-01', action: 'x', revokedOn: '2026-10-02' });
  out.okAp = M.approvalError({ kind: 'specific', requestedBy: 'Ann', approver: 'Sam Lead', outcome: 'approved', decidedOn: '2026-10-01', validFrom: '2026-10-01', action: 'x' });

  // --- gates by risk class
  R.gates.push({ id: 'GATE-001', name: 'Containment and destructive need SOC lead', riskClasses: ['containment', 'destructive'], criticalAssets: true, authorities: ['Sam Lead', 'CISO'] });
  out.gRead = M.isGated(ws, { riskClass: 'read-only' });
  out.gAdmin = M.isGated(ws, { riskClass: 'administrative' });
  out.gAdminCrit = M.isGated(ws, { riskClass: 'administrative', criticalAsset: true });
  out.gCont = M.isGated(ws, { riskClass: 'containment' });
  R.gates.length = 0;
  out.gContNoGate = M.isGated(ws, { riskClass: 'destructive' });   // default-deny
  R.gates.push({ id: 'GATE-001', name: 'Containment and destructive need SOC lead', riskClasses: ['containment', 'destructive'], criticalAssets: true, authorities: ['Sam Lead', 'CISO'] });

  // --- a case from SIEM escalation (the SIEM shape) and the status machine
  const c = { id: 'CASE-001', title: 'Kiosk malware alert', source: { kind: 'alert', id: 'ALR-007' }, opened: '2026-10-10T08:00', status: 'open', severity: 'high', alerts: ['ALR-007'], timeline: [] };
  R.cases.push(c); M.normCase(c);
  out.skip = M.advance(c, 'contained', { by: 'Ann' });
  out.noBy = M.advance(c, 'investigating', { by: '' });
  out.adv = M.advance(c, 'investigating', { by: 'Ann', at: '2026-10-10T08:30' });
  out.closeNoWhy = M.advance(c, 'closed', { by: 'Ann' });
  M.advance(c, 'contained', { by: 'Ann', at: '2026-10-10T14:00' });
  out.status = c.status; out.tl = c.timeline.length;

  // --- incident confirmation needs a person and a date
  out.cfNoBy = M.confirmIncident(ws, c, { by: '', date: '2026-10-10' }).error;
  out.cfNoDate = M.confirmIncident(ws, c, { by: 'Sam Lead', date: '' }).error;
  out.stillNoInc = !c.incident && ws.csm.incidents.length === inc0;
  const cf = M.confirmIncident(ws, c, { by: 'Sam Lead', date: '2026-10-10', personalInfo: true, category: 'malware' });
  out.inc = cf.incident && { id: cf.incident.id, confirmed: cf.incident.confirmed, by: cf.incident.confirmedBy, status: cf.incident.status, pi: cf.incident.personalInfo, loi25: cf.incident.loi25, linked: c.incident === cf.incident.id, inReg: ws.csm.incidents.includes(cf.incident) };

  // --- executions checked against approvals (audit signals)
  R.approvals.push(
    { id: 'APR-001', kind: 'specific', gate: 'GATE-001', requestedBy: 'Ann', approver: 'Sam Lead', outcome: 'approved', decidedOn: '2026-10-01', validFrom: '2026-10-01', validUntil: '2026-10-05', action: 'isolate host', case: 'CASE-001' },
    { id: 'APR-002', kind: 'specific', gate: 'GATE-001', requestedBy: 'Ann', approver: 'Sam Lead', outcome: 'approved', decidedOn: '2026-10-10', validFrom: '2026-10-10', validUntil: '2026-10-20', action: 'isolate host', revokedOn: '2026-10-10T09:00', revokedBy: 'CISO' },
    { id: 'APR-003', kind: 'specific', gate: 'GATE-001', requestedBy: 'Ann', approver: 'Bob Helpdesk', outcome: 'approved', decidedOn: '2026-10-10', validFrom: '2026-10-10', action: 'isolate host' },
    { id: 'APR-004', kind: 'specific', gate: 'GATE-001', requestedBy: 'Ann', approver: 'Sam Lead', outcome: 'approved', decidedOn: '2026-10-10', validFrom: '2026-10-10', action: 'disable account' },
    { id: 'APR-005', kind: 'specific', gate: 'GATE-001', requestedBy: 'Ann', approver: 'Sam Lead', outcome: 'rejected', decidedOn: '2026-10-10', action: 'isolate host' },
    { id: 'APR-006', kind: 'specific', gate: 'GATE-001', requestedBy: 'Ann', approver: 'Sam Lead', outcome: 'approved', decidedOn: '2026-10-12', validFrom: '2026-10-12', action: 'isolate host' },
    { id: 'APR-007', kind: 'pre-authorisation', gate: 'GATE-001', requestedBy: 'Ann', approver: 'CISO', outcome: 'approved', decidedOn: '2026-10-01', validFrom: '2026-10-01', validUntil: '2026-12-31', riskClasses: ['containment'], targets: ['KIOSK-1', 'KIOSK-2'] },
    { id: 'APR-008', kind: 'specific', gate: 'GATE-001', requestedBy: 'Sam Lead', approver: 'Sam Lead', outcome: 'approved', decidedOn: '2026-10-10', validFrom: '2026-10-10', action: 'isolate host' });
  const x = (id, approval, o = {}) => ({ id, case: 'CASE-001', action: 'isolate host', riskClass: 'containment', target: 'KIOSK-1', performedBy: 'Ann', started: '2026-10-10T10:00', status: 'succeeded', attempt: 'att-' + id, approval, ...o });
  const xs = [x('EXE-001', ''), x('EXE-002', 'APR-001'), x('EXE-003', 'APR-002'), x('EXE-004', 'APR-006'), x('EXE-005', 'APR-003'), x('EXE-006', 'APR-004'), x('EXE-007', 'APR-005'),
    x('EXE-008', 'APR-007'), x('EXE-009', 'APR-007', { target: 'SRV-DB-1' }), x('EXE-010', '', { riskClass: 'read-only', action: 'collect logs' }), x('EXE-011', 'APR-008')];
  R.executions.push(...xs);
  out.reasons = Object.fromEntries(xs.map(e => [e.id, M.approvalReason(ws, e)]));
  out.unapproved = M.unapproved(ws).length;
  out.dupAttempt = M.executionError(ws, { ...x('EXE-099', ''), attempt: 'att-EXE-001' });
  out.noPerformer = M.executionError(ws, { ...x('EXE-099', ''), performedBy: '' });
  out.status2 = M.approvalStatus(R.approvals[0], M.T('2026-10-10T10:00')) + '/' + M.approvalStatus(R.approvals[1], M.T('2026-10-10T10:00'));

  // --- playbook: versions frozen with SHA-256, validation before publish
  const pb = { id: 'PB-001', name: 'Malware on a kiosk', trigger: { kind: 'alert', conditions: 'EDR malware alert on a kiosk' }, scenarios: [], versions: [], current: null };
  R.playbooks.push(pb);
  const d1 = M.newDraft(pb, null);
  d1.steps.push({ id: 'ST-1', name: 'Collect', action: 'collect EDR triage package', riskClass: 'read-only', evidence: 'triage package hash' },
    { id: 'ST-2', name: 'Contain', action: 'isolate host', riskClass: 'containment', gate: '', requiresGate: false, evidence: '' });
  out.pubErr = (await M.publish(ws, pb, d1, { by: 'Sam Lead' })).error || '';
  out.pubNoBy = (await M.publish(ws, pb, d1, { by: '' })).error || '';
  d1.steps[1].gate = 'GATE-001';
  const p1 = await M.publish(ws, pb, d1, { by: 'Sam Lead', date: '2026-10-01' });
  out.pub1 = { err: p1.error || '', state: d1.state, hash: d1.sha256, current: pb.current, verify: await M.verifyVersion(pb, d1) };
  d1.steps[0].action = 'tampered'; out.tamper = await M.verifyVersion(pb, d1); d1.steps[0].action = 'collect EDR triage package';
  // dry run of v1 against the case: step 2 needs approval (pre-authorisation APR-007 in force for KIOSK-1? case target unset → not corresponding), step 2 lacks expected evidence
  c.target = 'KIOSK-1';
  const run1 = M.dryRun(ws, pb, 1, { caseId: 'CASE-001', at: '2026-10-10T10:00' });
  out.run1 = { result: run1.result, executed: run1.executed, s2gated: run1.steps[1].gated, s2approval: run1.steps[1].approval, s2issues: run1.steps[1].issues, s1gated: run1.steps[0].gated };
  out.simNoBy = M.recordSimulation(ws, run1, { by: '' }).error || '';
  M.recordSimulation(ws, run1, { by: 'Ann', date: '2026-10-10' });
  out.passedAfterFail = M.simulationPassed(ws, pb);
  // v2: evidence added → passed
  const d2 = M.newDraft(pb); d2.steps[1].evidence = 'EDR isolation log';
  await M.publish(ws, pb, d2, { by: 'Sam Lead', date: '2026-10-11' });
  out.v1state = d1.state; out.v1hashKept = d1.sha256 === out.pub1.hash; out.current = pb.current;
  out.passedBeforeSim = M.simulationPassed(ws, pb);
  const run2 = M.dryRun(ws, pb, 2, { caseId: 'CASE-001', at: '2026-10-11T10:00' });
  out.run2 = { result: run2.result, s2approval: run2.steps[1].approval, flags: run2.steps[1].flags };
  const run2b = M.dryRun(ws, pb, 2, { scenario: 'S1', at: '2026-10-11T10:00' });
  out.run2b = { result: run2b.result, flags: run2b.steps[1].flags.join(' | ') };
  M.recordSimulation(ws, run2, { by: 'Ann', date: '2026-10-11' });
  out.passed = M.simulationPassed(ws, pb);

  // --- a regulator notice is also a regulatory submission (once)
  R.communications.push({ id: 'COM-001', incident: cf.incident.id, audience: 'regulator', authority: "Commission d'accès à l'information", subject: 'Confidentiality incident notice', sentAt: '2026-10-11T09:00', due: '2026-10-13', receipt: 'CAI-2026-123' },
    { id: 'COM-002', incident: cf.incident.id, audience: 'internal', sentAt: '2026-10-10T09:00' });
  out.commErr = M.communicationError({ incident: 'INC-1', audience: 'regulator' });
  out.sync1 = M.syncSubmissions(ws); out.sync2 = M.syncSubmissions(ws);
  const sub = ws.cms.submissions.find(s => s.id === R.communications[0].submission);
  out.sub = sub && { n: ws.cms.submissions.length - subs0, authority: sub.authority, submitted: sub.submitted, receipt: sub.receipt, due: sub.due, source: sub.source, keys: Object.keys(sub).sort().join(',') };

  // --- measurements from recorded dates
  cf.incident.detected = '2026-10-10';
  out.measures = M.proposeMeasures(ws, cf.incident).map(m => m.metric + '=' + m.hours);

  // --- lessons → shared corrective actions
  const l = { id: 'LL-001', case: 'CASE-001', incident: cf.incident.id, lesson: 'Kiosk EDR alerts were not routed to on-call', date: '2026-10-12' };
  R.lessons.push(l);
  const a = M.lessonAction(ws, l, { title: 'Route kiosk EDR alerts to on-call', owner: 'SOC lead', due: '2026-11-30' });
  out.action = { inShared: ws.shared.actions.includes(a), n: ws.shared.actions.length - act0, source: a.source, linked: l.actions.includes(a.id), state: a.state };

  // --- import crg-soar-import/1
  out.badFormat = (await M.importDoc(ws, { format: 'something-else' })).error || '';
  const rep = await M.importDoc(ws, { format: 'crg-soar-import/1',
    gates: [{ id: 'GATE-010', name: 'Destructive needs CISO', riskClasses: ['destructive'], criticalAssets: false, authorities: ['CISO'] }],
    playbooks: [{ id: 'PB-010', name: 'Compromised account', trigger: { kind: 'alert', conditions: 'impossible travel' }, versions: [
      { version: 1, state: 'retired', published: '2026-08-01', publishedBy: 'Sam Lead', steps: [{ id: 'ST-1', action: 'disable account', riskClass: 'containment', gate: 'GATE-001', evidence: 'IdP log' }] },
      { version: 2, state: 'published', published: '2026-09-01', publishedBy: 'Sam Lead', sha256: '0'.repeat(64), steps: [{ id: 'ST-1', action: 'disable account', riskClass: 'containment', gate: 'GATE-001', evidence: 'IdP log' }] }] },
      { id: 'PB-011', name: 'Bad', versions: [{ version: 1, state: 'published', steps: [{ id: 'ST-1', action: 'x', riskClass: 'nuke' }] }] }],
    cases: [{ id: 'CASE-010', title: 'Impossible travel', source: { kind: 'alert', id: 'ALR-100' }, opened: '2026-10-02T07:00', status: 'open', severity: 'medium', alerts: ['ALR-100'], timeline: [] },
      { id: 'CASE-011', title: 'Bad status', opened: '2026-10-02', status: 'resolved-ish' }],
    approvals: [{ id: 'APR-010', kind: 'specific', gate: 'GATE-001', requestedBy: 'Ann', approver: 'Ann', outcome: 'approved', decidedOn: '2026-10-02', validFrom: '2026-10-02', action: 'disable account' },
      { id: 'APR-011', kind: 'specific', gate: 'GATE-001', requestedBy: 'Ann', approver: 'Sam Lead', outcome: 'approved', decidedOn: '2026-10-02', validFrom: '2026-10-02', validUntil: '2026-10-03', action: 'disable account', case: 'CASE-010' }],
    executions: [{ id: 'EXE-020', case: 'CASE-010', playbook: 'PB-010', version: 2, step: 'ST-1', action: 'disable account', riskClass: 'containment', target: 'j.doe', performedBy: 'Ann', started: '2026-10-04T09:00', status: 'succeeded', attempt: 'att-imp-1', approval: 'APR-011', evidence: ['IdP log 2026-10-04'] }],
    simulations: [{ id: 'SIM-010', playbook: 'PB-010', version: 2, date: '2026-09-15', by: 'Ann', result: 'passed' }],
    confirmations: [{ case: 'CASE-010', by: 'Sam Lead', date: '2026-10-02', personalInfo: false }, { case: 'CASE-010x', by: 'Sam', date: '2026-10-02' }],
    communications: [{ id: 'COM-010', incident: 'INC-xyz', audience: 'regulator', authority: 'ICO', sentAt: '2026-10-03T10:00' }] });
  out.rep = { added: rep.added, skipped: rep.skipped.map(s => s.list + ':' + s.id + ':' + s.why), warnings: rep.warnings, submissions: rep.submissions };
  const ipb = R.playbooks.find(p => p.id === 'PB-010');
  out.imp = { current: ipb?.current, hash: ipb?.versions[1].sha256, passed: ipb && M.simulationPassed(ws, ipb), reason: M.approvalReason(ws, R.executions.find(e => e.id === 'EXE-020')),
    caseInc: R.cases.find(x => x.id === 'CASE-010')?.incident || '' };
  st.touch();
  return out;
});

ok(/No self-approval/.test(r.self || ''), 'no self-approval (names compared case-insensitively)');
ok(/must have an expiry/.test(r.preNoExpiry || '') && /bounded by a scope/.test(r.preNoScope || ''), 'a pre-authorisation needs an expiry and a scope');
ok(/revoked the approval/.test(r.revNoBy || '') && r.okAp === null, 'a revocation names who revoked; a proper approval is accepted');
ok(!r.gRead && !r.gAdmin && r.gAdminCrit && r.gCont && r.gContNoGate, 'risk-class gates: read-only/administrative not gated, crown-jewel target gated, containment gated, destructive gated by default-deny');
ok(/one stage at a time/.test(r.skip || '') && /Name the person/.test(r.noBy || '') && r.adv === null && /closure rationale/.test(r.closeNoWhy || ''), 'case status machine: one stage at a time, a person, closing needs a rationale');
ok(r.status === 'contained' && r.tl === 2, 'case moved to contained with its timeline');
ok(/named person/.test(r.cfNoBy || '') && /date/.test(r.cfNoDate || '') && r.stillNoInc, 'incident confirmation needs a person and a date; nothing is created without them');
ok(r.inc && r.inc.confirmed === '2026-10-10' && r.inc.by === 'Sam Lead' && r.inc.status === 'confirmed' && r.inc.pi && r.inc.loi25 === 'undetermined' && r.inc.linked && r.inc.inReg, 'confirmation creates the incident in ws.csm.incidents with its confirmed date ' + JSON.stringify(r.inc));
const R_ = r.reasons;
ok(R_['EXE-001'] === 'absent', 'no approval → absent');
ok(R_['EXE-002'] === 'expired', 'expired approval reason → expired');
ok(R_['EXE-003'] === 'revoked', 'revoked before the action → revoked');
ok(R_['EXE-004'] === 'not-yet-valid', 'approval decided after the action → not-yet-valid');
ok(R_['EXE-005'] === 'wrong-authority', 'approver not named by the gate → wrong-authority');
ok(R_['EXE-006'] === 'not-corresponding', 'approval for another action → not-corresponding');
ok(R_['EXE-007'] === 'not-granted', 'rejected approval → not-granted');
ok(R_['EXE-008'] === null, 'bounded pre-authorisation in scope and period → valid');
ok(R_['EXE-009'] === 'not-corresponding', 'pre-authorisation does not cover a target outside its scope');
ok(R_['EXE-010'] === null, 'read-only action is not gated');
ok(R_['EXE-011'] === 'wrong-authority', 'self-approval never counts, even by an authority');
ok(r.unapproved === 9, 'executions without a valid approval listed as audit signals ' + r.unapproved);
ok(/already used/.test(r.dupAttempt || '') && /Name the person/.test(r.noPerformer || ''), 'attempt identifiers are unique and an action names who did it');
ok(r.status2 === 'expired/revoked', 'approval status at a time: expired, revoked ' + r.status2);
ok(/must require an approval gate/.test(r.pubErr) && /Name the person/.test(r.pubNoBy), 'publishing validates steps (containment needs a gate) and needs a person');
ok(!r.pub1.err && r.pub1.state === 'published' && /^[0-9a-f]{64}$/.test(r.pub1.hash || '') && r.pub1.current === 1 && r.pub1.verify, 'publishing freezes v1 with SHA-256');
ok(r.tamper === false, 'a changed published version no longer matches its hash');
ok(r.run1.result === 'failed' && r.run1.executed === false && r.run1.s2gated && !r.run1.s1gated && r.run1.s2issues.includes('missing expected evidence') && r.run1.s2approval === 'APR-007', 'dry run: flags the gated step, finds the pre-authorisation, fails on missing evidence ' + JSON.stringify(r.run1));
ok(/Name the person/.test(r.simNoBy), 'a simulation is recorded by a named person');
ok(r.passedAfterFail === false, 'a failed simulation does not make a playbook tested');
ok(r.v1state === 'retired' && r.v1hashKept && r.current === 2 && r.passedBeforeSim === false, 'publishing v2 retires v1 (hash kept); v2 is not tested until simulated');
ok(r.run2.result === 'passed' && r.run2.s2approval === 'APR-007', 'dry run of v2 passes');
ok(r.run2b.result === 'passed' && /no valid approval/.test(r.run2b.flags), 'dry run against a scenario flags that no approval is in force');
ok(r.passed === true, 'simulationPassed for the current version');
ok(/names the authority/.test(r.commErr || ''), 'a regulator notice names the authority');
ok(r.sync1 === 1 && r.sync2 === 0 && r.sub && r.sub.n === 1 && r.sub.submitted === '2026-10-11' && r.sub.receipt === 'CAI-2026-123' && r.sub.due === '2026-10-13' && r.sub.source.kind === 'incident' && r.sub.keys === 'authority,due,id,receipt,source,subject,submitted',
  'a regulator notice creates exactly one submission {id, authority, subject, due, submitted, receipt, source:{kind:incident}} ' + JSON.stringify(r.sub));
ok(r.measures.includes('time-to-contain=14') && r.measures.some(m => m.startsWith('time-to-acknowledge=')), 'response measurements proposed from recorded dates ' + r.measures);
ok(r.action.inShared && r.action.n === 1 && r.action.source.kind === 'incident' && r.action.linked && r.action.state === 'open', 'a lesson creates a shared corrective action');
ok(/crg-soar-import\/1/.test(r.badFormat), 'import refuses another format');
ok(r.rep.added.playbooks === 1 && r.rep.added.cases === 1 && r.rep.added.approvals === 1 && r.rep.added.executions === 1 && r.rep.added.simulations === 1 && r.rep.added.gates === 1 && r.rep.added.confirmations === 1, 'import adds the valid records ' + JSON.stringify(r.rep.added));
ok(r.rep.skipped.some(s => s.startsWith('playbooks:PB-011')) && r.rep.skipped.some(s => s.startsWith('cases:CASE-011')) && r.rep.skipped.some(s => s.startsWith('approvals:APR-010') && /self-approval/.test(s)) && r.rep.skipped.some(s => s.startsWith('confirmations:CASE-010x')), 'import skips invalid records and self-approvals ' + r.rep.skipped.join(' | '));
ok(r.rep.warnings.some(w => /sha256 does not match/.test(w)) && /^[0-9a-f]{64}$/.test(r.imp.hash) && r.imp.hash !== '0'.repeat(64), 'import recomputes the hash of published versions');
ok(r.imp.current === 2 && r.imp.passed === true && r.imp.reason === 'expired' && /^INC-/.test(r.imp.caseInc) && r.rep.submissions === 1, 'imported data: version in force, simulation, approval check, confirmation, submission ' + JSON.stringify(r.imp));

// ---------------- screens ----------------
const tabs = ['dashboard', 'cases', 'incidents', 'playbooks', 'approvals', 'actions', 'simulations', 'lessons'];
await page.evaluate(() => { location.hash = '#/soar/dashboard'; });
await page.waitForSelector('#panel-soar h1:text-is("SOAR")', { timeout: 8000 });
ok((await page.$$eval('#panel-soar .subtabs button', b => b.map(x => x.dataset.tab))).join() === tabs.join(), 'SOAR tab ids match the menu');
ok(await page.isVisible('#panel-soar >> text=Executions without a valid approval'), 'overview lists approval audit signals');
// import through the screen
const doc = { format: 'crg-soar-import/1', cases: [{ id: 'CASE-020', title: 'Imported by screen', opened: '2026-10-12T10:00', status: 'open', severity: 'low', alerts: [], timeline: [] }] };
await page.setInputFiles('#panel-soar input[type=file]', { name: 'soar-test.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(doc)) });
await page.click('#panel-soar button:text-is("Import")');
await page.waitForSelector('#panel-soar >> text=Imported from soar-test.json', { timeout: 5000 });
const imp = await page.evaluate(async () => { const st = await import('/js/state.js'); const L = await import('/js/logs.js'); return { c: st.S.ws.soar.cases.some(c => c.id === 'CASE-020'), log: st.S.ws.soar.imports.length, data: L.entries('data').some(e => e.action === 'SOAR import') }; });
ok(imp.c && imp.log >= 1 && imp.data, 'screen import adds the case, logs it in the import log and the data log');
// cases: confirmation without a person is refused
await page.evaluate(() => { location.hash = '#/soar/cases/CASE-020'; });
await page.waitForSelector('#panel-soar button[data-act=confirm]', { timeout: 8000 });
await page.click('#panel-soar button[data-act=confirm]');
ok(await page.isVisible('#panel-soar >> text=An incident is confirmed by a named person.'), 'screen: confirming without a person is refused');
await page.click('#panel-soar button[data-act=advance]');
ok(await page.isVisible('#panel-soar >> text=Name the person who records the change.'), 'screen: a status change needs a person');
await page.fill('#panel-soar input[aria-label="Recorded by"]', 'Ann Analyst');
await page.click('#panel-soar button[data-act=advance]');
ok(await page.evaluate(async () => (await import('/js/state.js')).S.ws.soar.cases.find(c => c.id === 'CASE-020').status === 'investigating'), 'screen: case moved to investigating');
// approvals: self-approval refused in the form
await page.evaluate(() => { location.hash = '#/soar/approvals'; });
await page.waitForSelector('#panel-soar >> text=Approval decisions (', { timeout: 8000 });
ok(await page.isVisible('#panel-soar >> text=Independence cannot be verified in single-user mode'), 'single-user independence warning');
await page.click('#panel-soar .card:has(h2:has-text("Approval decisions")) button:text-is("Add")');
await page.selectOption('.modal select >> nth=2', 'approved');
await page.fill('.modal input >> nth=0', 'Pat Analyst');
await page.fill('.modal input >> nth=2', 'Pat Analyst');
await page.click('.modal button:text-is("Save")');
ok(await page.isVisible('.modal >> text=No self-approval'), 'screen: self-approval refused');
await page.click('.modal button:text-is("Cancel")');
// actions: reasons shown as audit signals
await page.evaluate(() => { location.hash = '#/soar/actions'; });
await page.waitForSelector('#panel-soar >> text=Action executions (', { timeout: 8000 });
ok(await page.isVisible('#panel-soar [data-reason=expired]') && await page.isVisible('#panel-soar [data-reason=absent]'), 'actions show the approval reasons');
ok(await page.isVisible('#panel-soar >> text=audit signal >> nth=0'), 'reasons are labelled audit signals');
// playbooks screen
await page.evaluate(() => { location.hash = '#/soar/playbooks'; });
await page.waitForSelector('#panel-soar >> text=Playbooks (', { timeout: 8000 });
await page.click('#panel-soar tr:has-text("PB-001") button:text-is("Steps and versions")');
ok(await page.isVisible('#panel-soar >> text=Published versions'), 'playbook versions shown');
await page.click('#panel-soar button:text-is("New draft version from the version in force")');
ok(await page.isVisible('#panel-soar table.steps'), 'step editor for the new draft');
await page.selectOption('#panel-soar tr[data-step="ST-1"] select[data-k=riskClass]', 'destructive');
await page.click('#panel-soar button[data-act=publish]');
ok(await page.isVisible('#panel-soar >> text=Cannot publish'), 'a destructive step without a gate cannot be published');
// simulations screen
await page.evaluate(() => { location.hash = '#/soar/simulations'; });
await page.waitForSelector('#panel-soar >> text=Run a dry run', { timeout: 8000 });
await page.selectOption('#panel-soar select[aria-label=Playbook]', 'PB-010');
await page.selectOption('#panel-soar select[aria-label=Version]', '2');
await page.click('#panel-soar button[data-act=dryrun]');
await page.waitForSelector('#panel-soar button[data-act=record-sim]', { timeout: 5000 });
await page.fill('#panel-soar input[aria-label="Run by"]', 'Ann Analyst');
const n0 = await page.evaluate(async () => (await import('/js/state.js')).S.ws.soar.simulations.length);
await page.click('#panel-soar button[data-act=record-sim]');
const n1 = await page.evaluate(async () => (await import('/js/state.js')).S.ws.soar.simulations.length);
ok(n1 === n0 + 1, 'screen: dry run recorded as a simulation');
// incidents and lessons screens render; csm incidents still render
for (const t of ['incidents', 'lessons']) {
  await page.evaluate(h => { location.hash = '#/soar/' + h; }, t);
  await page.waitForTimeout(300);
}
ok(await page.isVisible('#panel-soar >> text=Lessons learned ('), 'lessons screen');
await page.evaluate(() => { location.hash = '#/soar/incidents'; });
await page.waitForSelector('#panel-soar >> text=Communications (', { timeout: 8000 });
ok(await page.isVisible('#panel-soar >> text=Incident register ('), 'incidents screen shows the shared register');
await page.evaluate(() => { location.hash = '#/csm/incidents'; });
await page.waitForSelector('#panel-csm >> text=Incident register (', { timeout: 8000 });
ok(true, 'Cybersecurity management incidents still render');

// the example of docs/SIEM-SOAR-IMPORT-FORMAT.md imports cleanly into an empty workspace
const ex = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const M = await import('/js/soar.js');
  const md = await (await fetch('/docs/SIEM-SOAR-IMPORT-FORMAT.md')).text();
  const sec = md.slice(md.indexOf('## SOAR'));
  const json = sec.split('```json')[1].split('```')[0];
  await st.create(st.newWorkspace({ name: 'SOAR test t18 example' }));
  const ws = st.S.ws, rep = await M.importDoc(ws, JSON.parse(json)), R = M.reg(ws);
  const out = { skipped: rep.skipped.length + ':' + rep.skipped.map(s => s.why).join('|'), warnings: rep.warnings.join('|'), subs: ws.cms.submissions.map(s => s.id + ':' + s.source.kind + ':' + s.source.id),
    inc: ws.csm.incidents.map(i => i.id + ':' + i.confirmedBy), reason: M.approvalReason(ws, R.executions[0]), passed: M.simulationPassed(ws, R.playbooks[0]) };
  for (const n of ['SOAR test t18 example', 'SOAR test t18']) { const w = st.S.list.find(x => x.name === n); if (w) await st.remove(w.id); }
  return out;
});
ok(ex.skipped === '0:' && ex.subs.join() === 'SUB-001:incident:INC-101' && ex.inc.join() === 'INC-101:Sam Lead' && ex.reason === null && ex.passed === true, 'the documented example imports cleanly ' + JSON.stringify(ex));
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 400));
await browser.close(); done('t18 SOAR');
