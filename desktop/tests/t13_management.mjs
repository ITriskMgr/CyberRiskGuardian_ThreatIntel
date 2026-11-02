// 1.5.8 management modules: Cybersecurity management, Audit management, Information security management, Compliance.
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const csm = await import('/js/panels/csm.js'); const au = await import('/js/panels/audit.js');
  const ism = await import('/js/panels/isms.js'); const D = await import('/js/dss.js');
  const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id);
  const ws = st.S.ws, out = {};
  ws.csm.delegations = [{ id: 'DA-001', from: 'Board', to: 'Jane CEO', scope: ['risk-acceptance'], validFrom: '2026-01-01', validTo: '2026-12-31' }];
  const d = { id: 'DR-001', subject: 'S1', type: 'risk-acceptance', outcome: 'approved', date: '2026-10-12', decidedBy: 'Jane CEO', delegation: 'DA-001' };
  out.decOk = csm.delegationOk(ws, d);
  out.decLate = csm.delegationOk(ws, { ...d, date: '2027-02-01' });
  out.decWrongPerson = csm.delegationOk(ws, { ...d, decidedBy: 'Bob' });
  out.decNoDel = csm.delegationOk(ws, { ...d, delegation: '' });
  out.decDraftByApp = csm.delegationOk(ws, { ...d, draftedBy: 'application' });
  out.decDraft = csm.delegationOk(ws, { ...d, outcome: 'draft', decidedBy: '' });
  out.closeNoFollow = au.closeOk({ status: 'closed', closedOn: '2026-10-01' });
  out.closeSelf = au.closeOk({ status: 'closed', closedOn: '2026-10-01', followUpBy: 'Ann', followUpOn: '2026-10-01', owner: 'ann' });
  out.closeOk = au.closeOk({ status: 'closed', closedOn: '2026-10-01', followUpBy: 'IA team', followUpOn: '2026-10-01', owner: 'Ann' });
  const A = await au.assurance();
  out.a53 = A.controls['AC-02']?.objectives.length || 0;
  out.methods = Object.keys(A.controls['AC-02']?.methods || {});
  out.progs = A.programmes.map(p => p.id + ':' + p.procedures.length + ':' + p.illustrative);
  // exceptions: expired reliance
  ws.shared.exceptions.push({ id: 'EXC-001', type: 'exception', status: 'accepted', title: 'Legacy VPN', expiry: '2026-01-31', approvedBy: 'Jane CEO', scenarios: ['S2'], compensatedBy: ['IP allow-list'] });
  out.reliance = ism.expiredReliance(ws).map(x => x.id + '>' + x.scenarios);
  st.touch();
  return out;
});
ok(r.decOk === null, 'a risk acceptance by the delegate, within the period, is valid');
ok(/not valid on the decision date/.test(r.decLate || ''), 'a delegation not valid on the decision date is refused (CQ-06)');
ok(/not the person/.test(r.decWrongPerson || ''), 'a decision by someone other than the delegate is refused');
ok(/Choose the delegation/.test(r.decNoDel || ''), 'a risk acceptance without delegation is refused');
ok(/only be decided by a person/.test(r.decDraftByApp || ''), 'a record the application drafted needs a person to confirm it');
ok(r.decDraft === null, 'a draft needs no decision maker');
ok(/independent follow-up/.test(r.closeNoFollow || '') && /independent of the person/.test(r.closeSelf || '') && r.closeOk === null, 'closing a finding needs an independent follow-up');
ok(r.a53 > 10 && r.methods.length === 3, 'SP 800-53A objectives and examine/interview/test methods for AC-02 ' + r.a53 + ' ' + r.methods);
ok(r.progs.length === 2 && r.progs.every(p => p.endsWith(':true')) && r.progs[0].startsWith('AUD-PAM-001:6'), 'the two illustrative work programmes ' + r.progs);
ok(r.reliance.length === 1 && r.reliance[0] === 'EXC-001>S2', 'an expired exception a scenario counts on is flagged');
// UI flows
await page.evaluate(() => { location.hash = '#/isms/exceptions'; });
await page.waitForSelector('#panel-isms >> text=Expired exceptions are no longer mitigations', { timeout: 8000 });
ok(true, 'ISMS banner for expired exceptions');
await page.click('#panel-isms button:text-is("Add")');
await page.fill('.modal input >> nth=0', 'Waive retention');
await page.fill('.modal input >> nth=1', 'P-39.1 s. 10');
await page.selectOption('.modal select >> nth=1', 'accepted');
await page.click('.modal button:text-is("Save")');
ok(await page.isVisible('.modal >> text=can never waive a law'), 'an exception that names a legal obligation cannot be accepted');
await page.click('.modal button:text-is("Cancel")');
// audit: plan an engagement from a programme, load its procedures
await page.evaluate(() => { location.hash = '#/audit/programmes'; });
await page.waitForSelector('#panel-audit >> text=AUD-PAM-001', { timeout: 8000 });
await page.fill('#panel-audit input[type=search]', 'AC-02');
ok(await page.waitForSelector('#panel-audit >> text=AC-02a.', { timeout: 5000 }).then(() => true, () => false), '800-53A search shows objectives');
await page.click('#panel-audit button:has-text("Plan an engagement with this programme") >> nth=0');
await page.waitForSelector('#panel-audit >> text=Engagements (', { timeout: 8000 });
await page.click('#panel-audit button:text-is("Procedures") >> nth=0');
await page.click('.modal button:has-text("Load the procedures of")');
ok(await page.isVisible('.modal >> text=AUD-PAM-001-01'), 'procedures loaded from the illustrative programme');
await page.click('.modal button:text-is("Record an observation") >> nth=0');
ok(await page.waitForSelector('#panel-audit >> text=Observations (1)', { timeout: 8000 }).then(() => true, () => false), 'an observation (preliminary, not a finding) recorded from a procedure');
// compliance: determinations need evidence
await page.evaluate(() => { location.hash = '#/compliance/determinations'; });
await page.waitForSelector('#panel-compliance >> text=Compliance determinations', { timeout: 8000 });
await page.click('#panel-compliance button:text-is("Add")');
await page.selectOption('.modal select >> nth=0', 'P-39.1 s. 10');
await page.selectOption('.modal select >> nth=1', 'satisfied');
await page.click('.modal button:text-is("Save")');
ok(await page.isVisible('.modal >> text=satisfied only with evidence'), 'satisfied without evidence is refused');
await page.click('.modal button:text-is("Cancel")');
await page.evaluate(() => { location.hash = '#/compliance/applicability'; });
await page.waitForSelector('#panel-compliance >> text=Evaluate in the browser', { timeout: 8000 });
await page.click('#panel-compliance button:text-is("Evaluate in the browser")');
ok(await page.waitForSelector('#panel-compliance >> text=Information gap — organizational validation required', { timeout: 5000 }).then(() => true, () => false), 'empty profile: instruments are evidence gaps, not "not applicable"');
// csm: incident validation, decisions drafting
await page.evaluate(() => { location.hash = '#/csm/decisions'; });
await page.click('#panel-csm button:has-text("Draft decision records")');
const drafts = await page.evaluate(async () => (await import('/js/state.js')).S.ws.csm.decisions.filter(d => d.outcome === 'draft' && d.draftedBy === 'application').length);
ok(drafts > 0, 'draft decision records created for scenarios above tolerance, never approved ' + drafts);
// modules can be switched off
await page.evaluate(async () => { const M = await import('/js/modules.js'); M.set('audit', false); location.hash = '#/audit'; });
await page.waitForTimeout(400);
ok(await page.isVisible('text=This module is switched off'), 'Audit management can be switched off');
await page.evaluate(async () => { const M = await import('/js/modules.js'); M.set('audit', true); const R = await import('/js/reset.js'); const st = await import('/js/state.js'); await R.restoreTeaching(st.S.ws.id); });
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t13 management modules');
