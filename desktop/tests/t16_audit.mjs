// Audit management (AMS), CRGO 0.10 audit terms: charter and methodology, universe, risk-weighted versioned plan,
// engagement state machine, conflicts of interest, versioned procedures, workpapers (no sole self-review), reproducible
// sampling, observations → findings, issue, responses, shared corrective actions, independent follow-up, closure and
// reopening, frozen reports with addenda, quality reviews, traceability, dashboard denominators.
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const M = await import('/js/ams.js'); const AU = await import('/js/panels/audit.js');
  const AS = await import('/js/assets.js'); const SH = await import('/js/shared.js');
  const w = st.medibecWorkspace(); w.name = 'AMS test (fictional)'; w.kind = 'organization';
  await st.create(w);
  const ws = st.S.ws, A = M.ensure(ws), out = {};
  const before = st.compute(ws), scenBefore = JSON.stringify(ws.assessment.SCEN);
  out.exports = typeof AU.closeOk === 'function' && AU.SIGNIFICANCE.length === 4 && AU.F_STATUS.some(x => x[0] === 'reopened');
  // ---- AT-01 universe from assets, no duplicate canonical identity
  ws.assets.push(AS.blankAsset({ id: 'A-901', name: 'EHR core', type: 'application', cia: { c: 5, i: 5, a: 5 }, classification: 'Restricted', bia: { fin: 5, ops: 5, legal: 5, rep: 5, safety: 4 }, owner: 'CIO' }));
  ws.assets.push(AS.blankAsset({ id: 'A-902', name: 'Cafeteria menu', type: 'application', cia: { c: 1, i: 1, a: 1 }, classification: 'Public' }));
  const s1 = M.suggestFromAssets(ws, AS.criticality), s2 = M.suggestFromAssets(ws, AS.criticality);
  out.at01 = s1.length === 1 && s1[0].ref === 'asset:A-901' && s2.length === 0 && M.universeFor(ws, 'asset:A-901').length === 1;
  const uEhr = s1[0]; uEhr.scenarios = [ws.assessment.SCEN[0].id]; uEhr.lastAudited = '2023-01-15';
  A.universe.push({ id: 'AUE-002', name: 'Privileged access', kind: 'process', ref: 'process:pam', inherentRisk: 4, lastAudited: '', mandatory: false, assets: [], processes: ['IAM'], scenarios: [], status: 'active' });
  A.universe.push({ id: 'AUE-003', name: 'Law 25 privacy programme', kind: 'regulatory', ref: 'obligation:loi25', inherentRisk: 1, lastAudited: '2026-06-01', mandatory: true, mandatoryBasis: 'Board resolution 2026-04', assets: [], processes: [], scenarios: [], status: 'active' });
  A.universe.push({ id: 'AUE-004', name: 'Cafeteria', kind: 'unit', ref: 'unit:caf', inherentRisk: 1, lastAudited: '2026-05-01', mandatory: false, assets: [], processes: [], scenarios: [], status: 'active' });
  // ---- charter and methodology
  out.charterIncomplete = M.approveDirective(ws, 'charter', { preparedBy: 'Cae Ann', approvedBy: 'Chair Bo', approvingBody: 'Audit committee' }).error || '';
  Object.assign(A.charter, { purpose: 'Independent assurance', authority: 'Full access', independence: 'Reports to the audit committee', reportsTo: 'Audit committee', standards: 'IIA GIAS 2024' });
  out.charterSelf = M.approveDirective(ws, 'charter', { preparedBy: 'Cae Ann', approvedBy: 'cae ann', approvingBody: 'Audit committee' }).error || '';
  const c1 = M.approveDirective(ws, 'charter', { preparedBy: 'Cae Ann', approvedBy: 'Chair Bo', approvingBody: 'Audit committee', date: '2026-01-10' }).directive;
  out.charterAgain = M.approveDirective(ws, 'charter', { preparedBy: 'Cae Ann', approvedBy: 'Chair Bo', approvingBody: 'Audit committee' }).error || '';
  A.charter.purpose = 'Independent, objective assurance and advice';
  const c2 = M.approveDirective(ws, 'charter', { preparedBy: 'Cae Ann', approvedBy: 'Chair Bo', approvingBody: 'Audit committee' }).directive;
  out.charter = !!c1 && c1.hash.length === 64 && M.directiveIntact(c1) && c1.state === 'superseded' && c2.version === 2 && c2.state === 'approved' && A.charter.version === 2;
  A.methodology = 'Risk-based plan; seeded random sampling; significance low to critical.';
  A.weights = { inherent: 0.5, time: 0.3, scenario: 0.2 };
  const m1 = M.approveDirective(ws, 'methodology', { preparedBy: 'Cae Ann', approvedBy: 'Chair Bo', approvingBody: 'Audit committee' }).directive;
  out.methodology = m1?.id === 'MTH-v1' && m1.content.weights.time === 0.3;
  // ---- AT-02 plan scoring
  const p = M.newPlan(ws, { period: '2027', by: 'Cae Ann' });
  const eEhr = p.entries.find(e => e.universe === uEhr.id), ePam = p.entries.find(e => e.universe === 'AUE-002'), eLaw = p.entries.find(e => e.universe === 'AUE-003'), eCaf = p.entries.find(e => e.universe === 'AUE-004');
  out.at02 = p.entries.length === 4 && p.methodology === 'MTH-v1' && p.weights.inherent === 0.5 && /^R-[0-9a-f]{10}$/.test(p.riskVersion) && !!p.scoredOn
    && eEhr.factors.scenario.ratio > 0 && /read from the engine/.test(eEhr.factors.scenario.source) && eEhr.factors.time.months > 30 && /score \d+ = /.test(eEhr.rationale)
    && ePam.factors.time.value === 1 && /Never audited/.test(ePam.factors.time.source);
  out.scores = p.entries.map(e => e.universe + ':' + e.score).join(' ');
  // ---- AT-03 mandatory entries cannot be dropped for a low score
  out.mandLow = eLaw.score < eCaf.score + 50 && eLaw.mandatory && M.ordered(p)[0].id === eLaw.id;
  eLaw.hours = 400; eEhr.hours = 120; ePam.hours = 100; eCaf.hours = 80; p.capacityHours = 300;
  const cut = M.capacityCut(p);
  out.at03cut = !cut.includes(eLaw) && cut.length >= 1;
  out.at03defer = M.setEntryState(ws, p, eLaw, 'deferred', { reason: 'Low score', authorisedBy: 'Chair Bo' }) || '';
  out.deferNoReason = M.setEntryState(ws, p, eCaf, 'deferred', { authorisedBy: 'Chair Bo' }) || '';
  out.deferOk = M.setEntryState(ws, p, eCaf, 'deferred', { reason: 'Low risk; next cycle', authorisedBy: 'Chair Bo' }) === null && eCaf.state === 'deferred';
  // ---- AT-04 approval freezes; amendment = new version
  out.approveSelf = M.approvePlan(ws, p, { approvedBy: 'Cae Ann', approvingBody: 'Audit committee' }) || '';
  out.approveOk = M.approvePlan(ws, p, { approvedBy: 'Chair Bo', approvingBody: 'Audit committee', date: '2026-12-01' }) === null && p.state === 'approved' && p.hash.length === 64 && ePam.state === 'approved';
  out.frozen = M.setEntryState(ws, p, ePam, 'cancelled', { reason: 'x', authorisedBy: 'y' }) || '';
  out.planIntact = M.planIntact(p);
  const sc = ePam.score; ePam.score = 99; out.planTamper = !M.planIntact(p); ePam.score = sc;
  const am = M.amendPlan(ws, p, 'Cae Ann', 'IAM audit moved to Q3').plan;
  out.amend = am.version === 2 && am.supersedes === p.id && am.state === 'draft' && p.state === 'approved';
  out.amendTwice = M.amendPlan(ws, p, 'Cae Ann').error || '';
  M.approvePlan(ws, am, { approvedBy: 'Chair Bo', approvingBody: 'Audit committee' });
  out.superseded = p.state === 'superseded' && am.state === 'approved';
  // ---- engagement from the plan; AT-06 completeness; AT-05 conflicts
  const amPam = am.entries.find(e => e.universe === 'AUE-002');
  const eng = { id: M.nextId(A.engagements, 'ENG'), title: 'Privileged access audit', nature: 'assurance', focus: '', universe: 'AUE-002', planEntry: `${am.id}/${amPam.id}`, status: 'planned', scope: '', objectives: [], criteria: [], procedures: [], team: [], transitions: [] };
  A.engagements.push(eng); amPam.engagement = eng.id; M.ensure(ws);
  out.at06 = M.transition(ws, eng, 'fieldwork', { by: 'Cae Ann' }) || '';
  ws.isp.policies.push({ id: 'POL-901', title: 'Access control policy', version: '2.0', status: 'published', effective: '2026-01-01', statements: [] });
  Object.assign(eng, { scope: 'Admin accounts on EHR', lead: 'Lead Lou', objectives: ['Privileged accounts are authorised and reviewed'], criteria: ['policy:POL-901', 'AC-02'] });
  A.conflicts.push({ id: 'COI-001', person: 'Aud Two', engagement: eng.id, nature: 'Former IAM team member', declaredOn: '2026-11-01' });
  out.at05 = M.assign(ws, eng, 'Aud Two', 'auditor') || '';
  A.conflicts[0].safeguard = 'Does not test IAM processes she designed'; A.conflicts[0].authorisedBy = 'aud two';
  out.at05self = M.assign(ws, eng, 'Aud Two', 'auditor') || '';
  A.conflicts[0].authorisedBy = 'Cae Ann';
  out.at05ok = M.assign(ws, eng, 'Aud Two', 'auditor') === null && eng.team.length === 1;
  M.assign(ws, eng, 'Rev Rae', 'reviewer');
  out.fieldwork = M.transition(ws, eng, 'fieldwork', { by: 'Lead Lou', date: '2027-03-01' }) === null && eng.status === 'fieldwork' && eng.transitions[0].from === 'planned' && eng.transitions[0].by === 'Lead Lou';
  out.badJump = M.transition(ws, eng, 'closed', {}) || '';
  // ---- AT-07 / AT-16 procedure and criterion versions kept
  const proc = { id: 'PRC-001', title: 'Quarterly privileged access review', objective: 'Reviews happen', steps: 'Inspect review records', criteria: ['AC-02j'], controls: ['AC-02'], method: 'inspect', expected: 'All reviewed', exception: 'Any account not reviewed' };
  A.procedures.push(proc); M.saveProcedure(ws, proc);
  const wp = M.newWorkpaper(ws, eng, 'PRC-001', 'Aud Two');
  proc.steps = 'Inspect review records and re-perform two reviews'; M.saveProcedure(ws, proc);
  ws.isp.policies[0].version = '3.0';
  out.at07 = wp.proc.id === 'PRC-001' && wp.proc.version === 1 && proc.version === 2 && proc.history.length === 1 && wp.criteria.find(c => c.ref === 'policy:POL-901')?.version === '2.0';
  const wpHashProc = wp.proc.hash;
  proc.title = 'Quarterly privileged access review (rev)'; M.saveProcedure(ws, proc);
  out.at07b = proc.version === 2 && wp.proc.hash === wpHashProc;   // v2 not yet used: no new version
  // ---- AT-10 sampling
  const pop = Array.from({ length: 50 }, (_, i) => `adm-${String(i + 1).padStart(2, '0')}`);
  const smp = { id: 'SMP-001', engagement: eng.id, workpaper: wp.id, title: 'Admin accounts', population: pop.slice(), exclusions: ['adm-50'], method: 'random', size: 5, seed: 'ENG-2027-pam' };
  A.samples.push(smp);
  out.drawErr = M.drawSample(ws, { ...smp, seed: '' }) || '';
  M.drawSample(ws, smp, 'Aud Two');
  const again = M.draw({ ...smp }), other = M.draw({ ...smp, seed: 'other' });
  out.at10 = smp.selected.length === 5 && !smp.selected.includes('adm-50') && M.rerun(smp).same && JSON.stringify(again.selected) === JSON.stringify(smp.selected) && JSON.stringify(other.selected) !== JSON.stringify(smp.selected)
    && smp.populationHash.length === 64 && !!smp.drawKey;
  const sys = M.draw({ population: pop, method: 'systematic', size: 10, seed: 's1' });
  out.systematic = sys.selected.length === 10 && new Set(sys.selected).size === 10 && JSON.stringify(M.draw({ population: pop, method: 'systematic', size: 10, seed: 's1' }).selected) === JSON.stringify(sys.selected);
  out.redraw = M.drawSample(ws, smp) || '';
  const changed = { ...smp, population: pop.slice(1) };
  out.popChanged = M.rerun(changed).populationOk === false && M.rerun(changed).same === false;
  // ---- AT-08 workpaper review
  wp.workDone = 'Inspected Q1-Q2 reviews for 5 sampled accounts'; wp.result = 'exceptions'; wp.sample = 'SMP-001'; wp.evidence = ['EV-901'];
  out.prepare = M.wpPrepare(ws, wp, 'Aud Two') === null && wp.state === 'prepared';
  M.wpRequestReview(ws, wp, 'Aud Two');
  out.at08 = M.wpSignOff(ws, wp, ' aud two ') || '';
  out.signOff = M.wpSignOff(ws, wp, 'Rev Rae', '2027-03-20') === null && wp.state === 'locked' && wp.hash.length === 64 && M.wpIntact(wp);
  out.lockedEdit = M.wpPrepare(ws, wp, 'Aud Two') || '';
  wp.conclusion = 'tampered'; out.wpTamper = !M.wpIntact(wp); wp.conclusion = '';
  out.reopenNoReason = M.wpReopen(ws, wp, 'Lead Lou', '') || '';
  const h0 = wp.hash;
  out.reopen = M.wpReopen(ws, wp, 'Lead Lou', 'Add the second sample') === null && wp.state === 'draft' && wp.reopenings[0].hash === h0;
  M.wpPrepare(ws, wp, 'Aud Two'); M.wpRequestReview(ws, wp); M.wpSignOff(ws, wp, 'Rev Rae');
  // ---- observations → findings; AT-19 dashboard
  SH.evidence(ws).push({ id: 'EV-901', title: 'Q2 review export', sha256: 'ab'.repeat(32), links: [{ kind: 'engagement', id: eng.id }] });
  const obs = { id: 'OBS-001', engagement: eng.id, workpaper: wp.id, title: 'Q2 review missing for adm-07', criterion: 'AC-02j quarterly review (POL-901 v2.0)', condition: 'No Q2 review record for adm-07', evidence: [], status: 'draft' };
  const obs2 = { id: 'OBS-002', engagement: eng.id, title: 'Unclear naming', criterion: '', condition: 'Account names not standard', evidence: [], status: 'draft' };
  A.observations.push(obs, obs2);
  out.promoteNoEv = M.promote(ws, obs, 'Lead Lou').error || '';
  const met0 = M.metrics(ws);
  out.at19pre = met0.issued === 0 && met0.preliminary === 2;
  obs.evidence = ['EV-901'];
  const f = M.promote(ws, obs, 'Lead Lou').finding;
  out.promote = f.observation === 'OBS-001' && obs.status === 'validated' && obs.finding === f.id && f.validation === 'validated' && f.workpapers[0] === wp.id;
  out.reportingBlocked = M.transition(ws, eng, 'reporting', { by: 'Lead Lou' }) || '';
  M.dismiss(ws, obs2, 'Lead Lou', 'Naming is a style matter, not a criterion');
  // ---- AT-11 issue
  out.at11 = M.issueError(f) || '';
  Object.assign(f, { cause: 'Reviewer on leave, no backup', effect: 'Excess privileges may persist unnoticed', significance: 'high', significanceRationale: 'Crown-jewel system' });
  out.issued = M.issueFinding(ws, f, 'Lead Lou') === null && f.validation === 'issued' && f.conclusionHash.length === 64;
  const met1 = M.metrics(ws);
  out.at19 = met1.issued === 1 && met1.preliminary === 0 && met1.highOpen === 1;
  A.recommendations.push({ id: 'REC-001', finding: f.id, text: 'Assign a backup reviewer', priority: 'high', by: 'Lead Lou' });
  // ---- AT-12 response without altering the finding
  const resp = { id: 'MR-001', finding: f.id, recommendation: 'REC-001', stance: 'accepted', explanation: 'Agreed', actionPlan: 'Name a backup reviewer and re-run Q2', respondedBy: 'CIO Cy' };
  out.respNoOwner = M.saveResponse(ws, resp) || '';
  Object.assign(resp, { owner: 'IAM Ida', due: '2027-06-30' });
  out.resp = M.saveResponse(ws, resp) === null && !!resp.action && f.status === 'action-planned' && f.owner === 'IAM Ida';
  const act = SH.actions(ws).find(a => a.id === resp.action);
  out.sharedAction = act.source.kind === 'finding' && act.source.id === f.id && act.owner === 'IAM Ida';
  out.at12 = !M.conclusionChanged(f);
  const fc = { ...f, condition: 'Softened by management' }; out.at12b = M.conclusionChanged(fc);
  // ---- AT-15 one remediation, two records
  ws.isp.issues.push({ id: 'NC-901', type: 'non-compliance', title: 'Access review not performed (POL-901)', status: 'open' });
  M.linkAction(ws, act.id, 'issue', 'NC-901');
  out.at15 = act.links.some(l => l.kind === 'finding') && act.links.some(l => l.kind === 'issue' && l.id === 'NC-901') && SH.linkedTo(SH.actions(ws), 'issue', 'NC-901').length === 1;
  // ---- reporting, report issue (AT-13)
  out.toReporting = M.transition(ws, eng, 'reporting', { by: 'Lead Lou' }) === null;
  out.followupBlocked = M.transition(ws, eng, 'follow-up', { by: 'Lead Lou' }) || '';
  eng.rating = 'needs-improvement'; eng.opinion = 'Privileged access reviews mostly operate; one gap.';
  const rep = { id: 'RPT-001', engagement: eng.id, title: 'IAM audit report', version: 1, state: 'draft', audience: 'Audit committee; CIO', preparedBy: 'Lead Lou', addenda: [] };
  A.reports.push(rep);
  M.reportStep(ws, rep, 'review', { by: 'Lead Lou' });
  out.repSelf = M.reportStep(ws, rep, 'approved', { reviewedBy: 'lead lou', approvedBy: 'Cae Ann' }) || '';
  out.repEarlyIssue = M.reportStep(ws, rep, 'issued', {}) || '';
  M.reportStep(ws, rep, 'approved', { reviewedBy: 'Rev Rae', approvedBy: 'Cae Ann' });
  out.repIssue = M.reportStep(ws, rep, 'issued', { date: '2027-04-15' }) === null && rep.state === 'issued' && rep.hash.length === 64 && M.reportIntact(rep) && rep.snapshot.findings.length === 1;
  out.repEdit = M.reportStep(ws, rep, 'review', {}) || '';
  f.title = 'changed later'; out.snapshotStable = rep.snapshot.findings[0].title === 'Q2 review missing for adm-07' && M.reportIntact(rep); f.title = 'Q2 review missing for adm-07';
  out.addendumNoText = M.addendum(ws, rep, { by: 'Cae Ann', text: '' }) || '';
  M.addendum(ws, rep, { by: 'Cae Ann', text: 'Due date corrected to 2027-06-30' }); M.addendum(ws, rep, { by: 'Cae Ann', text: 'Recipient list completed' });
  out.addenda = rep.addenda.length === 2 && rep.addenda[1].prevHash === rep.addenda[0].hash && M.addendaIntact(rep);
  const md = M.reportMarkdown(ws, rep);
  out.md = md.includes(rep.hash) && md.includes('Due date corrected') && md.includes('Criterion: AC-02j') && !md.includes('DRAFT');
  rep.snapshot.findings[0].significance = 'low'; out.repTamper = !M.reportIntact(rep); rep.snapshot.findings[0].significance = 'high';
  out.toFollowup = M.transition(ws, eng, 'follow-up', { by: 'Lead Lou' }) === null;
  out.closeBlocked = M.transition(ws, eng, 'closed', { by: 'Lead Lou' }) || '';
  // ---- AT-14 independent verification; failure reopens
  const fu0 = { id: 'FU-001', finding: f.id, verifier: 'iam ida', date: '2027-07-02', result: 'effective', steps: 'Inspected Q2 rerun' };
  out.at14self = M.applyFollowUp(ws, fu0) || '';
  act.state = 'done';
  const fu1 = { id: 'FU-001', finding: f.id, verifier: 'Aud Two', date: '2027-07-02', result: 'not-effective', steps: 'Backup reviewer named but Q2 not re-run' };
  out.fail = M.applyFollowUp(ws, fu1) === null && fu1.decision === 'rejected' && act.state === 'progress' && f.status === 'action-planned' && f.reopened.length === 1;
  const fu2 = { id: 'FU-002', finding: f.id, verifier: 'Aud Two', date: '2027-08-10', result: 'effective', steps: 'Inspected Q2 rerun evidence', evidence: ['EV-901'] };
  out.pass = M.applyFollowUp(ws, fu2) === null && f.status === 'closed' && f.closedOn === '2027-08-10' && act.state === 'verified' && act.verifiedBy === 'Aud Two' && AU.closeOk(f) === null && SH.closeActionError(act) === null;
  out.reopenFinding = M.reopenRecord(f, { by: 'Lead Lou', reason: '' }) || '';
  // nonconformities share closure and reopening
  const nc = ws.isp.issues.find(x => x.id === 'NC-901'); M.closeRecord(nc, { by: 'Comp Col', verification: 'FU-002' });
  out.ncClose = nc.status === 'closed' && nc.closures.length === 1 && M.reopenRecord(nc, { by: 'Comp Col', reason: 'Recurred in Q3' }) === null && nc.status === 'reopened' && f.status === 'closed';
  // ---- close the engagement; universe last audited; plan entry completed
  out.close = M.transition(ws, eng, 'closed', { by: 'Lead Lou', date: '2027-08-20' }) === null && A.universe.find(u => u.id === 'AUE-002').lastAudited === '2027-08-20' && M.entryState(ws, amPam) === 'completed' && M.planIntact(am);
  const met2 = M.metrics(ws);
  out.dash = met2.planDone === 1 && met2.planTotal >= 3 && met2.openIssued === 0;
  // ---- quality review: no self-review
  out.qrSelf = M.qreviewError(ws, { reviewer: 'Aud Two', subject: { kind: 'engagement', id: eng.id } }) || '';
  out.qrOk = M.qreviewError(ws, { reviewer: 'QA Quinn', subject: { kind: 'engagement', id: eng.id } }) === null;
  // ---- traceability
  const tr = M.trace(ws).find(x => x.finding?.id === f.id);
  out.trace = tr.universe?.id === 'AUE-002' && tr.entry?.id === amPam.id && tr.engagement?.id === eng.id && tr.procedure?.id === 'PRC-001' && tr.workpaper?.id === wp.id && tr.observation?.id === 'OBS-001'
    && tr.recommendations.length === 1 && tr.responses.length === 1 && tr.followups.length === 2 && !!tr.closed && M.gaps(tr).length === 0;
  out.events = A.events.length > 20 && A.events.every(e => e.t && e.action);
  // ---- the engine is untouched
  const after = st.compute(ws);
  out.engine = JSON.stringify(ws.assessment.SCEN) === scenBefore && Math.round(after.totals.est) === Math.round(before.totals.est) && Math.round(after.totals.res) === Math.round(before.totals.res);
  out.selfcheck = `${Math.round(after.totals.est)} / ${Math.round(after.totals.res)}`;
  // a second engagement for the UI: a workpaper in review, an observation without evidence
  const e2 = { id: 'ENG-777', title: 'Backup audit', nature: 'assurance', focus: 'compliance', status: 'planned', scope: '', objectives: [], criteria: [], procedures: [], team: [], transitions: [] };
  A.engagements.push(e2);
  const w2 = M.newWorkpaper(ws, e2, '', 'Prep Pat'); w2.title = 'Restore test'; w2.workDone = 'Restored 3 backups'; w2.result = 'no-exception';
  M.wpPrepare(ws, w2, 'Prep Pat'); M.wpRequestReview(ws, w2);
  A.observations.push({ id: 'OBS-003', engagement: 'ENG-777', title: 'Restore log incomplete', criterion: 'CP-09', condition: 'One log missing', evidence: [], status: 'draft' });
  st.touch();
  out.wsId = ws.id; out.w2 = w2.id;
  return out;
});
ok(r.exports, 'audit.js keeps SIGNIFICANCE, F_STATUS and closeOk for the other modules');
ok(r.at01, 'AT-01 a critical asset enters the universe once; no duplicate canonical identity');
ok(/purpose, authority/.test(r.charterIncomplete) && /cannot be the person who prepared/.test(r.charterSelf) && /already approved/.test(r.charterAgain), 'charter approval: complete, by someone else, not twice ' + [r.charterIncomplete, r.charterSelf, r.charterAgain].join(' | '));
ok(r.charter && r.methodology, 'charter and methodology approved as hash-frozen versions; a revision supersedes the previous one');
ok(r.at02, 'AT-02 plan scoring records weights, factors with provenance, rationale, date and source risk version ' + r.scores);
ok(r.mandLow && r.at03cut && /mandatory/.test(r.at03defer), 'AT-03 a mandatory entry stays first, is never cut for capacity and cannot be deferred for a low score ' + r.at03defer);
ok(/reason/.test(r.deferNoReason) && r.deferOk, 'a deferred entry needs a reason and an authoriser');
ok(/prepared it/.test(r.approveSelf) && r.approveOk && /frozen/.test(r.frozen) && r.planIntact && r.planTamper, 'AT-04 approval by another person freezes the plan with a hash; tampering is detected');
ok(r.amend && /already in draft/.test(r.amendTwice) && r.superseded, 'AT-04 an amendment is a new traceable version; approving it supersedes the old one');
ok(/scope, lead auditor, objectives, criteria/.test(r.at06), 'AT-06 fieldwork refused without scope, lead, objectives and criteria ' + r.at06);
ok(/conflict of interest/.test(r.at05) && /conflict of interest/.test(r.at05self) && r.at05ok, 'AT-05 a declared conflict blocks assignment until a safeguard is authorised by someone else');
ok(r.fieldwork && /cannot go from/.test(r.badJump), 'engagement transitions are recorded and follow the state machine');
ok(r.at07 && r.at07b, 'AT-07/AT-16 the workpaper keeps the procedure version and the policy version in force at the time');
ok(/seed/.test(r.drawErr) && r.at10 && r.systematic && /already drawn/.test(r.redraw) && r.popChanged, 'AT-10 seeded samples are reproducible; a changed population is detected');
ok(r.prepare && /sole reviewer/.test(r.at08) && r.signOff && /locked/.test(r.lockedEdit) && r.wpTamper, 'AT-08 the preparer cannot sign off; sign-off locks with a hash; tampering is detected');
ok(/who reopens it and why/.test(r.reopenNoReason) && r.reopen, 'a locked workpaper reopens only with a reason; the previous hash is kept');
ok(/evidence/.test(r.promoteNoEv) && r.promote, 'an observation becomes a finding only with criterion, condition and evidence (validated as)');
ok(/preliminary observations/.test(r.reportingBlocked), 'reporting waits until preliminary observations are validated or dismissed ' + r.reportingBlocked);
ok(/effect/.test(r.at11) && r.issued, 'AT-11 a finding without its effect cannot issue ' + r.at11);
ok(r.at19pre && r.at19, 'AT-19 dashboard counts issued findings only, preliminary observations apart');
ok(/action plan, an owner/.test(r.respNoOwner) && r.resp && r.sharedAction, 'an accepted response needs owner and date and opens a shared corrective action');
ok(r.at12 && r.at12b, 'AT-12 a management response leaves the issued conclusion unchanged; a change would be detected');
ok(r.at15, 'AT-15 one remediation answers the audit finding and the nonconformity, each keeping its own record');
ok(r.toReporting && /issued first/.test(r.followupBlocked), 'follow-up needs an issued report');
ok(/prepared the report/.test(r.repSelf) && /Only an approved report/.test(r.repEarlyIssue) && r.repIssue && /frozen/.test(r.repEdit), 'AT-13 report reviewed and approved by others, issued as a hashed snapshot');
ok(r.snapshotStable && /author and its text/.test(r.addendumNoText) && r.addenda && r.md && r.repTamper, 'AT-13 the snapshot does not follow later edits; addenda are hash-chained; Markdown export carries hash and addenda');
ok(r.toFollowup && /still open/.test(r.closeBlocked), 'an engagement closes only when its findings are closed');
ok(/independent/.test(r.at14self) && r.fail && r.pass, 'AT-14 verification by someone other than the owner; a failed check reopens the action');
ok(/reason/.test(r.reopenFinding) && r.ncClose, 'findings and nonconformities share closure and reopening');
ok(r.close && r.dash, 'closing the engagement completes its plan entry and updates the universe; plan hash unaffected');
ok(/cannot review work they prepared/.test(r.qrSelf) && r.qrOk, 'quality review: no self-review');
ok(r.trace, 'traceability: universe → plan entry → engagement → procedure → workpaper → observation → finding → recommendation → response → follow-up → closure');
ok(r.events, 'audit events are recorded');
console.log('scores', r.scores, 'engine', r.selfcheck); ok(r.engine, 'scenarios and engine results unchanged by audit management ' + r.selfcheck);

// ---------------- the screens ----------------
const tabs = ['dashboard', 'charter', 'universe', 'plan', 'engagements', 'programmes', 'workpapers', 'findings', 'followup', 'reports', 'quality', 'assurance', 'trace'];
for (const t of tabs) {
  const b = errors.length;
  await page.evaluate(h => { location.hash = '#/audit/' + h; }, t);
  await page.waitForTimeout(t === 'programmes' ? 900 : 450);
  const bad = await page.evaluate(() => [...document.querySelectorAll('#panel-audit .banner')].map(b => b.textContent).filter(t => /raised an error/.test(t)));
  ok(!bad.length && errors.length === b, `audit/${t} renders ${bad.join(' ').slice(0, 300)} ${errors.slice(b).join(' | ').slice(0, 300)}`);
  ok(await page.evaluate(() => document.querySelectorAll('#panel-audit h1').length === 1 && !!document.querySelector('#panel-audit .subtabs [aria-selected="true"]')), `audit/${t}: one h1 and the tab selected`);
}
await page.evaluate(() => { location.hash = '#/audit/dashboard'; }); await page.waitForTimeout(400);
ok(await page.isVisible('#panel-audit >> text=Plan progress') && await page.isVisible('#panel-audit >> text=Denominators'), 'dashboard shows plan progress and explains denominators');
await page.evaluate(() => { location.hash = '#/audit/charter'; }); await page.waitForTimeout(400);
ok(await page.isVisible('#panel-audit >> text=Independence cannot be verified in single-user mode'), 'single-user independence warning');
ok(await page.isVisible('#panel-audit >> text=CHR-v2') && await page.isVisible('#panel-audit >> text=intact'), 'approved versions listed with integrity');
await page.evaluate(() => { location.hash = '#/audit/plan'; }); await page.waitForTimeout(400);
ok(await page.isVisible('#panel-audit >> text=Amendment of PLAN-001'), 'plan screen shows the amendment');
// workpaper sign-off by the preparer is refused in the dialog
await page.evaluate(() => { location.hash = '#/audit/workpapers'; }); await page.waitForTimeout(400);
const row = page.locator(`#panel-audit tr:has(td:text-is("${r.w2}"))`);
await row.locator('button:text-is("Sign off")').click();
await page.fill('.modal input >> nth=0', 'prep pat');
await page.click('.modal button:text-is("Save")');
ok(await page.isVisible('.modal >> text=cannot be its sole reviewer'), 'UI: the preparer cannot sign off the workpaper');
await page.fill('.modal input >> nth=0', 'Rev Rae');
await page.click('.modal button:text-is("Save")');
await page.waitForTimeout(300);
ok(await page.evaluate(async id => (await import('/js/state.js')).S.ws.audit.workpapers.find(w => w.id === id).state === 'locked', r.w2), 'UI: an independent reviewer signs off and locks');
// observation without evidence cannot be validated
await page.evaluate(() => { location.hash = '#/audit/findings'; }); await page.waitForTimeout(400);
ok(await page.isVisible('#panel-audit >> text=An observation is not a finding'), 'observations are labelled preliminary');
await page.locator('#panel-audit tr:has(td:text-is("OBS-003")) button:text-is("Validate as finding")').click();
await page.click('.modal button:text-is("Save")');
ok(await page.isVisible('.modal >> text=evidence limitation'), 'UI: validating an observation without evidence is refused');
await page.click('.modal button:text-is("Cancel")');
// issued finding: conclusion fields are locked in the form
await page.locator('#panel-audit tr:has(td:text-is("FND-001")) button:text-is("Open")').first().click();
ok(await page.evaluate(() => [...document.querySelectorAll('.modal textarea')].filter(t => t.disabled).length >= 4), 'UI: an issued finding opens with its conclusion locked');
await page.click('.modal button:text-is("Cancel")');
// report preview shows the hash
await page.evaluate(() => { location.hash = '#/audit/reports'; }); await page.waitForTimeout(400);
await page.locator('#panel-audit tr:has(td:text-is("RPT-001")) button:text-is("Preview")').click();
ok(await page.isVisible('.modal >> text=SHA-256 of the issued snapshot'), 'UI: issued report preview shows its hash');
await page.click('.modal button:text-is("Close")');
// engagement lifecycle dialog
await page.evaluate(() => { location.hash = '#/audit/engagements'; }); await page.waitForTimeout(500);
await page.locator('#panel-audit tr:has(td:text-is("ENG-777")) button:text-is("Lifecycle")').click();
await page.click('.modal button:text-is("Move to: Fieldwork")');
await page.click('.modal >> nth=-1 >> button:text-is("Save")');
ok(await page.isVisible('.modal >> text=Fieldwork cannot start without'), 'UI: fieldwork refused for an incomplete engagement');
await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
// traceability
await page.evaluate(() => { location.hash = '#/audit/trace'; }); await page.waitForTimeout(400);
ok(await page.isVisible('#panel-audit >> text=complete so far'), 'traceability shows a complete chain');
await page.evaluate(async id => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id); await st.remove(id); }, r.wsId);
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 400));
await browser.close(); done('t16 audit management');
