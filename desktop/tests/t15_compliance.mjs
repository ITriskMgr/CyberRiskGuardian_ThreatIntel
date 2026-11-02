// t15 — Compliance management (CMS): tabs, obligations, interpretations, exemptions, campaigns and determinations,
// deadlines (calendar and triggered by incident confirmation), submissions, regulatory change, dashboard and report.
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
page.on('dialog', d => d.accept(''));
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id); });

// ---- tabs: exactly the menu's ids, in order; default tab is the dashboard
const tabs = await page.evaluate(async () => {
  const menu = await import('/js/menu.js'); const C = await import('/js/panels/compliance.js');
  const m = menu.MENU.flatMap(s => s.items).find(i => i.panel === 'compliance');
  return { menu: m.tabs.map(t => t.arg), screen: C.TABS.map(t => t[0]), help: Object.keys(C.HELP) };
});
const WANT = ['dashboard', 'obligations', 'applicability', 'programmes', 'mappings', 'assessment', 'requirements', 'campaigns', 'determinations', 'calendar', 'submissions', 'changes', 'ai', 'report'];
ok(JSON.stringify(tabs.screen) === JSON.stringify(WANT) && JSON.stringify(tabs.menu) === JSON.stringify(WANT), 'tab ids are exactly the menu ids: ' + tabs.screen.join(','));
ok(WANT.every(t => tabs.help.includes(t)) && tabs.help.includes(''), 'HELP covers every tab');
await page.evaluate(() => { location.hash = '#/compliance'; });
await page.waitForSelector('#panel-compliance >> text=With a current determination', { timeout: 8000 });
ok(await page.$$eval('#panel-compliance .subtabs button', b => b.length) === 14, 'fourteen tab buttons');
ok(await page.$eval('#panel-compliance .subtabs button[aria-selected="true"]', b => b.textContent) === 'Dashboard', 'default tab is the dashboard');

// ---- seed
const T = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const M = await import('/js/cms.js'); const ws = st.S.ws; const C = M.cms(ws);
  const d = n => { const x = new Date(); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  C.authorities.push({ id: 'AUTH-001', name: 'Commission d\'accès à l\'information', jurisdiction: 'Quebec' });
  C.sources.push({ id: 'SRC-001', title: 'Private sector privacy act', type: 'law', status: 'in-force', licence: 'public', url: 'https://example.org/p391',
    versions: [{ label: 'v2023', published: '2023-09-22' }, { label: 'v2026', published: '2026-06-01' }] });
  C.obligations.push(
    { id: 'OBL-001', title: 'Security measures', source: 'SRC-001', sourceVersion: 'v2023', provision: 'P-39.1 s. 10', paraphrase: 'Protect personal information with proportionate measures.', owner: 'Alice', applicability: 'applicable', reviewMonths: 12, status: 'active' },
    { id: 'OBL-002', title: 'Incident notification', source: 'SRC-001', sourceVersion: 'v2023', provision: 'P-39.1 s. 3.5', owner: 'Bob', applicability: 'applicable', reviewMonths: 12, status: 'active' },
    { id: 'OBL-003', title: 'Retention schedule', source: 'SRC-001', provision: 'P-39.1 s. 23', applicability: 'not-assessed', status: 'active' },
    { id: 'OBL-004', title: 'Biometric database disclosure', source: 'SRC-001', provision: 'C-1.1 s. 45', applicability: 'not-applicable', applicabilityRationale: 'No biometric database.', applicabilityReviewer: 'Counsel', status: 'active' });
  const E = ws.shared.evidence;
  E.push({ id: 'EV-901', title: 'Encryption configuration export', validUntil: '2099-12-31', links: [] }, { id: 'EV-902', title: 'Old pentest', validUntil: '2020-01-01', links: [] },
    { id: 'EV-903', title: 'Weak screenshot', sufficiency: 'insufficient', links: [] });
  ws.csm.incidents.push({ id: 'INC-901', title: 'Lost laptop', status: 'confirmed', confirmed: '2026-08-04', personalInfo: true, loi25: 'undetermined' },
    { id: 'INC-902', title: 'EDR alert', status: 'alert' });
  C.deadlines.push({ id: 'DL-001', title: 'Notify the authority', obligation: 'OBL-002', trigger: 'event', offset: 72, unit: 'hours', personalInfoOnly: true, citation: 'P-39.1 s. 3.5' },
    { id: 'DL-002', title: 'Annual privacy report', obligation: 'OBL-001', trigger: 'calendar', due: d(10), recurrence: 'annual' },
    { id: 'DL-003', title: 'Register filing', obligation: 'OBL-003', trigger: 'calendar', due: d(-5) });
  C.submissions.push({ id: 'SUB-001', title: 'Register filing', authority: 'AUTH-001', answers: 'DL-003', state: 'preparation' });
  ws.shared.exceptions.push({ id: 'EXC-901', title: 'Legacy POS without EDR', status: 'accepted', approvedBy: 'CIO', expiry: d(90), concerns: [{ kind: 'obligation', id: 'OBL-001' }] });
  C.interpretations.push({ id: 'INT-001', obligation: 'OBL-002', reading: 'SECRET-COUNSEL-ADVICE about notification thresholds', legalReview: 'reviewed', reviewedBy: 'Counsel', reviewedOn: '2026-09-01', privileged: true });
  ws.shared.mappings.push({ id: 'MAP-901', from: { kind: 'statement', id: 'POL-1.1' }, to: { kind: 'obligation', id: 'OBL-002' }, type: 'full', edition: 'v2023', rationale: 'Same scope', review: 'reviewed', reviewedBy: 'Analyst', confidence: 'high' },
    { id: 'MAP-902', from: { kind: 'control', id: 'EDR' }, to: { kind: 'obligation', id: 'OBL-001' }, type: 'partial', review: 'reviewed', reviewedBy: 'Analyst', confidence: 'medium' });
  st.touch();
  return { d10: d(10) };
});

// ---- model: triggered deadlines
const dl = await page.evaluate(async () => {
  const M = await import('/js/cms.js'); const I = M.deadlineInstances();
  const x = I.find(i => i.id.startsWith('DL-001'));
  return { n: I.filter(i => i.id.startsWith('DL-001')).length, id: x.id, due: x.due, exp: x.explanation, overdue: x.overdue, answered: x.answered,
    cal: I.find(i => i.id === 'DL-002'), past: I.find(i => i.id === 'DL-003') };
});
ok(dl.n === 1 && dl.id === 'DL-001@INC-901', 'only the confirmed incident triggers the deadline (an alert never does): ' + dl.id);
ok(dl.due === '2026-08-07T00:00' && /72 hours after the confirmation of incident INC-901 on 2026-08-04/.test(dl.exp), '72 h after confirmation, with the calculation: ' + dl.due + ' — ' + dl.exp);
ok(dl.overdue && !dl.answered, 'unanswered past triggered deadline is overdue');
ok(dl.cal.soon && !dl.cal.overdue && dl.past.overdue, 'calendar deadline due in 10 days is "soon"; past one is overdue');
const bd = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const M = await import('/js/cms.js'); const C = M.cms();
  C.holidays = ['2026-10-12'];
  st.S.ws.csm.incidents.push({ id: 'INC-903', title: 'Ransomware', status: 'confirmed', confirmed: '2026-10-09' });
  C.deadlines.push({ id: 'DL-004', title: 'Contract notice', trigger: 'event', incident: 'INC-903', offset: 2, unit: 'business-days' });
  const r = M.deadlineInstances().find(i => i.id === 'DL-004'); C.deadlines.pop(); st.S.ws.csm.incidents.pop(); C.holidays = [];
  return r.due;
});
ok(bd === '2026-10-14T00:00', 'business days skip the weekend and the listed holiday: ' + bd);

// ---- model: determinations rules
const R = await page.evaluate(async () => {
  const M = await import('/js/cms.js');
  const e = d => M.determinationError(d);
  return {
    expiredOnly: e({ id: 'X', obligation: 'OBL-001', provision: 'P-39.1 s. 10', state: 'satisfied', date: '2026-10-01', assessor: 'Carol', evidence: ['EV-902'] }),
    insufficientOnly: e({ id: 'X', obligation: 'OBL-001', state: 'satisfied', date: '2026-10-01', assessor: 'Carol', evidence: ['EV-903'] }),
    noEvidence: e({ id: 'X', obligation: 'OBL-001', state: 'satisfied', assessor: 'Carol', evidence: [] }),
    owner: e({ id: 'X', obligation: 'OBL-001', state: 'partially-satisfied', assessor: 'alice', evidence: ['EV-901'], evidenceGap: 'x' }),
    notApplicable: e({ id: 'X', obligation: 'OBL-004', state: 'unsatisfied', assessor: 'Carol', evidenceGap: 'x' }),
    good: e({ id: 'X', obligation: 'OBL-001', state: 'satisfied', date: '2026-10-01', assessor: 'Carol', evidence: ['EV-901'] }),
    exemptionNoAuthority: M.exemptionError({ obligation: 'OBL-001', state: 'granted', legalBasis: 'x', validFrom: '2026-01-01', reference: 'D-1' }),
    exemptionUnknownAuthority: M.exemptionError({ obligation: 'OBL-001', state: 'granted', authority: 'CIO', legalBasis: 'x', validFrom: '2026-01-01', reference: 'D-1' }),
    subNoApproval: M.submissionError({ authority: 'AUTH-001', state: 'submitted', submittedOn: '2026-10-01', preparedBy: 'Dan' }),
    subSelfApproval: M.submissionError({ authority: 'AUTH-001', state: 'submitted', submittedOn: '2026-10-01', preparedBy: 'Dan', approvedBy: 'dan' }),
    subNoReceipt: M.submissionError({ authority: 'AUTH-001', state: 'acknowledged', submittedOn: '2026-10-01', preparedBy: 'Dan', approvedBy: 'Eve' }),
    notApplicableNoRationale: M.obligationError({ title: 'x', provision: 'y', applicability: 'not-applicable' }),
  };
});
ok(/expired or judged insufficient/.test(R.expiredOnly) && /expired or judged insufficient/.test(R.insufficientOnly), 'satisfied on expired or insufficient evidence only is refused');
ok(/satisfied only with evidence/.test(R.noEvidence), 'satisfied without evidence is refused');
ok(/owner of an obligation cannot assess it/.test(R.owner), 'the owner cannot assess the obligation (independence by name)');
ok(/not applicable/.test(R.notApplicable), 'no determination for a requirement found not applicable');
ok(R.good === null, 'satisfied with current registered evidence is accepted');
ok(/Only a regulatory authority/.test(R.exemptionNoAuthority) && /not in the register of regulatory authorities/.test(R.exemptionUnknownAuthority), 'only a registered authority grants an exemption');
ok(/human approval/.test(R.subNoApproval) && /cannot approve it/.test(R.subSelfApproval) && /receipt reference/.test(R.subNoReceipt), 'submissions: approval, separation and receipt enforced');
ok(/rationale/.test(R.notApplicableNoRationale), '"not applicable" needs a rationale and a reviewer');

// ---- dashboard before any determination
let D = await page.evaluate(async () => { const M = await import('/js/cms.js'); const x = M.dashboard(); return { ...x, due30: x.due30.length, overdueDeadlines: x.overdueDeadlines.length, submissionsOverdue: x.submissionsOverdue.length, exposure: x.exposure.length }; });
ok(D.obligations === 4 && D.applicable === 2 && D.applicabilityNotAssessed === 1 && D.notApplicable === 1, 'applicable denominators: ' + JSON.stringify([D.obligations, D.applicable, D.applicabilityNotAssessed, D.notApplicable]));
ok(D.currentDetermination === 0 && D.currentEvidence === 0 && D.satisfied === 0 && D.assessed === 0 && D.notAssessed === 2, 'a full, reviewed mapping counts for nothing: no determination, not compliant');
ok(D.due30 === 1 && D.overdueDeadlines === 2 && D.submissionsOverdue === 1, 'deadlines due in 30 days, overdue, and overdue submission: ' + [D.due30, D.overdueDeadlines, D.submissionsOverdue]);
ok(D.exposure === 1, 'accepted exception on a legal obligation without exemption is an exposure');
ok(D.partialOnly === 1, 'an obligation covered by a partial mapping only is reported as such');

// ---- campaign through the screen
await page.evaluate(async () => { const M = await import('/js/cms.js'); M.cms().campaigns.push({ id: 'CMP-001', name: 'Q4 privacy review', scope: 'Head office', periodFrom: '2026-07-01', periodTo: '2026-09-30', method: 'manual', assessor: 'Carol', status: 'planned', obligations: ['OBL-001', 'OBL-002', 'OBL-004'] }); location.hash = '#/compliance/campaigns'; });
await page.waitForSelector('#panel-compliance >> text=Assessment campaigns', { timeout: 8000 });
ok(await page.isVisible('#panel-compliance >> text=Independence cannot be verified in single-user mode'), 'single-user independence warning');
await page.click('#panel-compliance button:text-is("Assess")');
await page.waitForSelector('#panel-compliance >> text=Campaign CMP-001');
ok(await page.$$eval('#panel-compliance button:text-is("Determine")', b => b.length) === 2, 'no "Determine" for the obligation found not applicable');
// OBL-001: satisfied with the expired evidence only → refused, then with current evidence → saved
await page.click('#panel-compliance button:text-is("Determine") >> nth=0');
await page.waitForSelector('.modal');
await page.selectOption('.modal select >> nth=0', 'satisfied');
await page.click('.modal label.chip:has-text("EV-902")');
await page.click('.modal button:text-is("Save")');
ok(await page.isVisible('.modal >> text=expired or judged insufficient'), 'screen refuses "satisfied" on expired evidence');
await page.click('.modal label.chip:has-text("EV-902")');
await page.click('.modal label.chip:has-text("EV-901")');
await page.click('.modal button:text-is("Save")');
await page.waitForTimeout(300);
// OBL-002: no evidence and no gap → refused; with a gap → saved
await page.click('#panel-compliance button:text-is("Determine") >> nth=0');
await page.waitForSelector('.modal');
await page.selectOption('.modal select >> nth=0', 'undetermined');
await page.click('.modal button:text-is("Save")');
ok(await page.isVisible('.modal >> text=State the evidence gap') || await page.isVisible('.modal >> text=explicit evidence gap'), 'a campaign determination needs register evidence or an explicit gap');
await page.fill('.modal textarea >> nth=0', 'No record of notification drills.');
await page.selectOption('.modal select >> nth=1', 'process');
await page.click('.modal button:text-is("Save")');
await page.waitForTimeout(300);
const ds = await page.evaluate(async () => (await import('/js/state.js')).S.ws.grc.determinations.filter(d => d.campaign === 'CMP-001').map(d => ({ id: d.id, o: d.obligation, s: d.state, ev: d.evidence, v: d.provisionVersion, rc: d.rootCause })));
ok(ds.length === 2 && ds.find(d => d.o === 'OBL-001')?.s === 'satisfied' && ds.find(d => d.o === 'OBL-001').ev.join() === 'EV-901' && ds.find(d => d.o === 'OBL-001').v === 'v2023', 'campaign produced determinations in ws.grc.determinations with evidence IDs and the source version: ' + JSON.stringify(ds));
ok(ds.find(d => d.o === 'OBL-002')?.s === 'undetermined' && ds.find(d => d.o === 'OBL-002').rc === 'process', 'evidence gap and root-cause category recorded');
// approve: reviewer = assessor refused; another reviewer freezes
await page.fill('#panel-compliance input[placeholder^="Reviewer"]', 'Carol');
await page.click('#panel-compliance button:text-is("Approve and freeze")');
await page.waitForTimeout(300);
ok(await page.evaluate(async () => !(await import('/js/cms.js')).cms().campaigns[0].frozen), 'the assessor cannot approve their own campaign');
await page.fill('#panel-compliance input[placeholder^="Reviewer"]', 'Frank');
await page.click('#panel-compliance button:text-is("Approve and freeze")');
await page.waitForSelector('#panel-compliance >> text=Approved and frozen');
const fr = await page.evaluate(async () => { const M = await import('/js/cms.js'); const c = M.cms().campaigns[0]; const d = M.determinations().find(x => x.campaign === 'CMP-001'); return { st: c.status, n: c.frozen.snapshot.length, err: M.determinationError({ ...d, notes: 'edited' }), add: M.determinationError({ id: 'CD-NEW', obligation: 'OBL-002', campaign: 'CMP-001', state: 'unsatisfied', evidenceGap: 'x', assessor: 'Z' }) }; });
ok(fr.st === 'approved' && fr.n === 2 && /frozen/.test(fr.err) && /frozen/.test(fr.add), 'approved campaign is frozen (no edit, no new determination)');
ok(!(await page.isVisible('#panel-compliance button:text-is("Determine")')) && !(await page.isVisible('#panel-compliance button:text-is("Edit")')), 'frozen campaign offers no edit');

// ---- dashboard after the campaign
D = await page.evaluate(async () => { const M = await import('/js/cms.js'); const x = M.dashboard(); return { ...x, exposure: x.exposure.length }; });
ok(D.currentDetermination === 2 && D.currentEvidence === 1 && D.satisfied === 1 && D.assessed === 2 && D.undetermined === 1, 'denominators after the campaign: ' + JSON.stringify([D.currentDetermination, D.currentEvidence, D.satisfied, D.assessed]));
await page.evaluate(() => { location.hash = '#/compliance/dashboard'; });
await page.waitForSelector('#panel-compliance >> text=Exceptions without exemption');
const kp = await page.$$eval('#panel-compliance .kpi', k => k.map(x => x.textContent));
ok(kp.some(t => /With a current determination\s*2 \/ 2/.test(t)) && kp.some(t => /With current evidence\s*1 \/ 2/.test(t)) && kp.some(t => /Obligations applicable\s*2 \/ 4/.test(t)), 'dashboard KPIs disclose their denominators: ' + kp.slice(0, 3).join(' | '));
ok(kp.some(t => /Satisfied\s*1 \/ 2/.test(t) && /not assessed \(excluded\)/.test(t)), 'compliance rate over assessed-and-applicable, exclusions stated');
ok(await page.isVisible('#panel-compliance >> text=Legacy POS without EDR'), 'exposure listed on the dashboard');
ok(await page.isVisible('#panel-compliance .paneldesc'), 'tab description shown under the title');
ok(await page.$$eval('#panel-compliance h1', h => h.length) === 1 && await page.$$eval('#panel-compliance h1 + p.lede', p => p.length) === 0, 'one h1, no lede');

// ---- exemption by an authority removes the exposure
await page.evaluate(async () => { const st = await import('/js/state.js'); const M = await import('/js/cms.js'); M.cms().exemptions.push({ id: 'EXM-001', title: 'Temporary relief', obligation: 'OBL-001', authority: 'AUTH-001', reference: 'CAI-2026-17', legalBasis: 's. 10 relief order', validFrom: '2026-01-01', state: 'granted' }); st.touch(); });
D = await page.evaluate(async () => (await import('/js/cms.js')).dashboard().exposure.length);
ok(D === 0, 'an exemption granted by an authority relieves the exposure');
await page.evaluate(async () => { (await import('/js/cms.js')).cms().exemptions[0].state = 'revoked'; });

// ---- obligations tab: privileged interpretation withheld; add from the ontology
await page.evaluate(() => { location.hash = '#/compliance/obligations'; });
await page.waitForSelector('#panel-compliance >> text=Regulatory sources', { timeout: 8000 });
await page.waitForSelector('#panel-compliance >> text=Privileged — withheld', { timeout: 5000 }).catch(() => {});
ok(await page.isVisible('#panel-compliance >> text=Privileged — withheld') && !(await page.isVisible('#panel-compliance >> text=SECRET-COUNSEL-ADVICE')), 'privileged interpretation withheld from the table');
ok(await page.isVisible('#panel-compliance a:has-text("P-39.1 s. 10")'), 'obligation links to its source provision');
const before = await page.evaluate(async () => (await import('/js/cms.js')).cms().obligations.length);
await page.selectOption('#panel-compliance select >> nth=0', 'P-39.1').catch(() => {});
await page.click('#panel-compliance button:has-text("Add its provisions")');
await page.waitForTimeout(400);
const after = await page.evaluate(async () => { const C = (await import('/js/cms.js')).cms(); return { n: C.obligations.length, dup: C.obligations.filter(o => o.provision === 'P-39.1 s. 10').length }; });
ok(after.n > before && after.dup === 1, `provisions added from the ontology without duplicates (${before} → ${after.n})`);

// ---- regulatory change: new obligation version, work items, originals untouched
const ch = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const M = await import('/js/cms.js'); const C = M.cms();
  const pol = st.S.ws.isp.policies[0]?.id; const sc = st.S.ws.assessment.SCEN[0]?.id;
  C.changes.push({ id: 'CHG-001', title: 'Amendment to s. 10', source: 'SRC-001', provision: 'P-39.1 s. 10', kind: 'amended', oldVersion: 'v2023', newVersion: 'v2026', impact: 'Encryption now expected at rest', obligations: ['OBL-001'], policies: pol ? [pol] : [], scenarios: sc ? [sc] : [], status: 'scoped', owner: 'Alice' });
  st.touch(); location.hash = '#/compliance/changes';
  return { before: JSON.stringify(C.obligations.find(o => o.id === 'OBL-001')), pol, sc };
});
await page.waitForSelector('#panel-compliance >> text=Regulatory changes', { timeout: 8000 });
await page.click('#panel-compliance button:has-text("New obligation versions")'); await page.waitForTimeout(300);
await page.click('#panel-compliance button:has-text("Create work items")'); await page.waitForTimeout(300);
const ch2 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const M = await import('/js/cms.js'); const C = M.cms();
  const old = C.obligations.find(o => o.id === 'OBL-001'); const nw = C.obligations.find(o => o.supersedes === 'OBL-001');
  return { old: JSON.stringify(old), nw: nw && { id: nw.id, v: nw.sourceVersion }, live: M.liveObligations().some(o => o.id === 'OBL-001'),
    oldDet: M.determinations().filter(d => d.obligation === 'OBL-001').length, acts: st.S.ws.shared.actions.filter(a => a.source?.id === 'CHG-001').length, status: C.changes[0].status };
});
ok(ch2.old === ch.before && ch2.nw?.v === 'v2026' && !ch2.live && ch2.oldDet === 1, 'amendment: new obligation version; the old one unchanged, still queryable with its determination');
ok(ch2.acts === 1 + (ch.pol ? 1 : 0) + (ch.sc ? 1 : 0) && ch2.status === 'tasks-assigned', 'impact work items created in the shared corrective actions: ' + ch2.acts);
await page.click('#panel-compliance button:has-text("Create work items")'); await page.waitForTimeout(300);
ok(await page.evaluate(async () => (await import('/js/state.js')).S.ws.shared.actions.filter(a => a.source?.id === 'CHG-001').length) === ch2.acts, 'work items are not duplicated');

// ---- calendar: prepare a submission from a deadline; submissions screen shows overdue
await page.evaluate(() => { location.hash = '#/compliance/calendar'; });
await page.waitForSelector('#panel-compliance >> text=How it is computed', { timeout: 8000 });
ok(await page.isVisible('#panel-compliance >> text=72 hours after the confirmation of incident INC-901'), 'calendar shows the calculation');
const nSub = await page.evaluate(async () => (await import('/js/cms.js')).cms().submissions.length);
await page.click('#panel-compliance tr:has-text("DL-001@INC-901") button:has-text("Prepare a submission")'); await page.waitForTimeout(300);
const sub = await page.evaluate(async () => (await import('/js/cms.js')).cms().submissions.at(-1));
ok(sub && sub.answers === 'DL-001@INC-901' && sub.state === 'preparation', 'submission prepared for the triggered deadline');
ok(await page.evaluate(async n => (await import('/js/cms.js')).cms().submissions.length === n + 1, nSub), 'one submission added');
// answering it on time-late: approved, submitted, acknowledged → deadline answered (late)
const ans = await page.evaluate(async () => { const M = await import('/js/cms.js'); const s = M.cms().submissions.at(-1); Object.assign(s, { authority: 'AUTH-001', state: 'acknowledged', preparedBy: 'Dan', approvedBy: 'Eve', submittedOn: '2026-08-10', receiptRef: 'CAI-R-55', receiptOn: '2026-08-11' });
  const x = M.deadlineInstances().find(i => i.id === 'DL-001@INC-901'); return { err: M.submissionError(s), answered: x.answered, late: x.late, overdue: x.overdue }; });
ok(ans.err === null && ans.answered && ans.late && !ans.overdue, 'acknowledged submission answers the deadline; late is computed from the dates');
await page.evaluate(() => { location.hash = '#/compliance/submissions'; });
await page.waitForSelector('#panel-compliance >> text=Regulatory submissions', { timeout: 8000 });
ok(await page.isVisible('#panel-compliance tr:has-text("SUB-001") >> text=overdue'), 'overdue submission flagged');
ok(await page.isVisible('#panel-compliance >> text=No unsupervised submission'), 'no unsupervised submission banner');

// ---- mappings tab
await page.evaluate(() => { location.hash = '#/compliance/mappings'; });
await page.waitForSelector('#panel-compliance >> text=Coverage matrix', { timeout: 8000 });
ok(await page.isVisible('#panel-compliance >> text=A mapping is never compliance'), 'mappings banner');
ok(await page.isVisible('#panel-compliance >> text=MAP-901'), 'mappings tab shows the shared mapping register');

// ---- programmes tab: adoption is a decision
await page.evaluate(() => { location.hash = '#/compliance/programmes'; });
await page.waitForSelector('#panel-compliance >> text=Framework adoptions', { timeout: 8000 });
await page.click('#panel-compliance .card:has(h2:has-text("Framework adoptions")) button:text-is("Add")');
await page.selectOption('.modal select >> nth=0', 'CSF2');
await page.fill('.modal textarea >> nth=0', 'Head office IT');
await page.click('.modal button:text-is("Save")');
ok(await page.isVisible('.modal >> text=An adoption is a decision'), 'an active adoption needs who decided and when');
await page.click('.modal button:text-is("Cancel")');

// ---- determinations tab still works and shows the campaign lock
await page.evaluate(() => { location.hash = '#/compliance/determinations'; });
await page.waitForSelector('#panel-compliance >> text=Compliance determinations', { timeout: 8000 });
ok(await page.isVisible('#panel-compliance >> text=CMP-001'), 'determinations register shows the campaign');

// ---- report: compliance posture, never compliance from a mapping, privileged text withheld
const md = await page.evaluate(async () => (await import('/js/panels/compliance_plus.js')).fullReport(undefined, await (await import('/js/panels/compliance_legal.js')).reportSections()));
ok(/## Compliance posture/.test(md) && /\| Obligation \| Applicability \| State \| Evidence status \| Exceptions without exemption \| Next deadline \|/.test(md), 'report has the Compliance posture table');
const row = n => md.split('\n').find(l => l.startsWith('| ' + n + ' '));
ok(/\| applicable \| undetermined/.test(row('OBL-002') || '') && !/satisfied/.test((row('OBL-002') || '').replace('undetermined', '')), 'OBL-002 (full mapping) is not reported compliant: ' + row('OBL-002'));
ok(/\| not-applicable \| not-applicable/.test(row('OBL-004') || ''), 'not-applicable obligation carries no compliance state');
ok(/\| not-assessed \| not-assessed \|/.test(row('OBL-003') || '') && /overdue/.test(row('OBL-003') || ''), 'not-assessed obligation with its overdue deadline: ' + row('OBL-003'));
ok(/Exceptions concerning a legal provision without exemption: 1/.test(md), 'report counts the exposure (exemption revoked)');
ok(!/SECRET-COUNSEL-ADVICE/.test(md) && /privileged interpretation\(s\) withheld/.test(md), 'privileged interpretation withheld from the report');
ok(/### Regulatory deadlines/.test(md) && /DL-001@INC-901/.test(md), 'report lists the regulatory deadlines');
await page.evaluate(() => { location.hash = '#/compliance/report'; });
await page.waitForSelector('#panel-compliance h2:has-text("Compliance posture")', { timeout: 8000 });
ok(await page.isVisible('#panel-compliance h2:has-text("Over time")'), 'report tab still has its earlier cards');

// ---- every tab renders cleanly
for (const t of WANT) {
  const before = errors.length;
  await page.evaluate(h => { location.hash = '#/compliance/' + h; }, t);
  await page.waitForTimeout(t === 'applicability' || t === 'obligations' ? 900 : 450);
  const st = await page.evaluate(() => ({ sel: document.querySelector('#panel-compliance .subtabs button[aria-selected="true"]')?.textContent, bad: [...document.querySelectorAll('#panel-compliance .banner')].some(b => /raised an error/.test(b.textContent)), h1: document.querySelectorAll('#panel-compliance h1').length }));
  ok(errors.length === before && !st.bad && st.h1 === 1 && st.sel, `tab ${t} renders cleanly ${errors.slice(before).join(' | ').slice(0, 200)}`);
}
// the self-check of the engine is untouched
const sc = await page.evaluate(async () => { try { const st = await import('/js/state.js'); return st.S.ws.assessment.SCEN.length > 0; } catch { return false; } });
ok(sc, 'assessment intact');
ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 300));
await page.evaluate(async () => { const R = await import('/js/reset.js'); const st = await import('/js/state.js'); if (R.restoreTeaching) await R.restoreTeaching(st.S.ws.id); }).catch(() => {});
await browser.close(); done('t15 compliance management');
