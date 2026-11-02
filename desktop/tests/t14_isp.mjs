// t14 — ISP management (ISPMS): versions, freeze hash, independence, diff, applicability, assignments,
// acknowledgements tied to an exact version, training, exceptions in the shared register.
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await page.waitForFunction(async () => { const st = await import('/js/state.js'); return st.S.list.some(w => w.kind === 'example'); }, null, { timeout: 20000, polling: 300 });
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id); location.hash = '#/isp/overview'; });
await page.waitForSelector('#panel-isp h1:has-text("ISP management")');
ok(await page.isVisible('#panel-isp .subtabs button:has-text("Applicability & assignments")'), 'seven tabs');
ok(await page.isVisible('#panel-isp .kpi:has-text("Acknowledgement coverage")'), 'overview KPI: acknowledgement coverage');

// 1. a policy, independence and freeze
const r1 = await page.evaluate(async () => {
  const P = await import('/js/isp.js');
  const p = P.fromTemplate('access', undefined, 'Alice');
  const ids0 = p.statements.map(s => s.id);
  P.transition(p, 'review', { by: 'Alice' });
  let selfApproval = false; try { await P.approve(p, { by: 'alice' }); } catch { selfApproval = true; }
  await P.approve(p, { by: 'Bob', note: 'ok' });
  const enc = new TextEncoder().encode(P.canonical(P.snapshot(p)));
  const sub = [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc))].map(b => b.toString(16).padStart(2, '0')).join('');
  return { id: p.id, ids0, selfApproval, status: p.status, version: p.version, hash: p.approval.hash, sub, sync: P.hashSync(P.snapshot(p)), vstate: p.versions[0]?.state, editable: P.editable(p), mods: p.statements.map(s => s.modality) };
});
ok(r1.selfApproval, 'the author cannot approve (case-insensitive name)');
ok(r1.status === 'approved' && r1.version === '1.0' && r1.vstate === 'approved' && !r1.editable, 'approved, v1.0 frozen, not editable');
ok(/^[0-9a-f]{64}$/.test(r1.hash) && r1.hash === r1.sub && r1.hash === r1.sync, 'freeze hash = SHA-256 of the canonical JSON (crypto.subtle = sync)');
ok(r1.mods.every(m => m === 'must') && r1.ids0[0] === r1.id + '.1', 'statements have a modality and a stable id');
const pid = r1.id;

// 2. tampering after approval blocks publication; restoring allows it
const r2 = await page.evaluate(async (pid) => {
  const P = await import('/js/isp.js'); const p = P.isp().policies.find(x => x.id === pid);
  const keep = p.statements[0].text; p.statements[0].text += ' (edited)';
  let blocked = false; try { P.transition(p, 'published', { by: 'Pat' }); } catch (e) { blocked = /changed after approval/.test(e.message); }
  p.statements[0].text = keep;
  P.transition(p, 'published', { by: 'Pat' });
  return { blocked, status: p.status, inForce: P.inForce(p)?.version, cur: p.currentHash === p.approval.hash, eff: p.effective, next: P.reviewDate(p) };
}, pid);
ok(r2.blocked, 'a content change after approval blocks publication');
ok(r2.status === 'published' && r2.inForce === '1.0' && r2.cur && r2.next > r2.eff, 'published v1.0 in force with a review date');

// 3. UI: frozen editor
await page.evaluate(pid => { location.hash = '#/isp/policy/' + pid; }, pid);
await page.waitForSelector('#panel-isp >> text=Policy statements');
ok(await page.isVisible('#panel-isp >> text=Frozen text'), 'published version shown frozen');
ok(await page.$eval('#panel-isp .docrow[data-stmt] textarea', t => t.disabled), 'frozen statements are read-only');

// 4. a new draft version, edits, diff
const r4 = await page.evaluate(async (pid) => {
  const P = await import('/js/isp.js'); const p = P.isp().policies.find(x => x.id === pid);
  P.transition(p, 'draft', { by: 'Carol' });
  p.statements[1].text = p.statements[1].text.replace('remote access', 'all remote access').replace('e-mail', 'messaging');
  p.statements[2].modality = 'should';
  const s = P.addStatement(p, { text: 'Break-glass accounts are sealed and tested quarterly.', refs: ['ISO22:8.2'] });
  const removed = p.statements.splice(4, 1)[0].id;
  const d = P.diff(P.inForce(p).content, P.snapshot(p));
  return { version: p.version, inForce: P.inForce(p)?.version, author: p.author, newId: s.id, removed, sum: d.summary, ch: d.statements.find(x => x.id === p.statements[1].id)?.changes, ch2: d.statements.find(x => x.id === p.statements[2].id)?.changes,
    wd: P.wordDiff('a b c', 'a x c').map(x => x.join('')).join('|') };
}, pid);
ok(r4.version === '2.0' && r4.inForce === '1.0' && r4.author === 'Carol', 'new draft v2.0 while v1.0 stays in force');
ok(r4.newId === pid + '.6' && r4.removed === pid + '.5', 'new statement gets a fresh stable id: ' + r4.newId);
ok(r4.sum.added === 1 && r4.sum.removed === 1 && r4.sum.changed === 2 && r4.sum.same === 2, 'diff summary ' + JSON.stringify(r4.sum));
ok(r4.ch?.includes('text') && r4.ch2?.includes('modality'), 'diff detects text and modality changes');
ok(r4.wd === '=a |-b|+x|= c', 'word diff ' + r4.wd);
await page.evaluate(() => { location.hash = '#/isp/reviews'; }); await page.waitForTimeout(150);
await page.evaluate(pid => { location.hash = '#/isp/policy/' + pid; }, pid);
await page.waitForSelector('#panel-isp h2:has-text("Compare two versions")');
ok(await page.$$eval('#panel-isp table.isp-diff ins', x => x.length) >= 1 && await page.$$eval('#panel-isp table.isp-diff del', x => x.length) >= 1, 'side-by-side diff marks deletions and insertions');
ok(await page.isVisible('#panel-isp .isp-diff >> text=Added') && await page.isVisible('#panel-isp .isp-diff >> text=Removed'), 'diff shows added and removed statements');
ok(!(await page.$eval('#panel-isp .docrow[data-stmt] textarea', t => t.disabled)), 'the draft is editable');

// 5. applicability and assignments
const r5 = await page.evaluate(async (pid) => {
  const P = await import('/js/isp.js');
  P.newRule({ policy: pid, dimension: 'unit', value: 'IT', effect: 'include' });
  P.newRule({ policy: pid, dimension: 'worker', value: 'contractor', effect: 'exclude' });
  const a = P.evaluate(pid, { unit: 'it' }), b = P.evaluate(pid, { unit: 'HR' }), c = P.evaluate(pid, { unit: 'IT', worker: 'Contractor' });
  const x1 = P.newAssignment({ policy: pid, kind: 'person', subject: 'Dana', unit: 'IT', due: '2020-01-01' });
  const x2 = P.newAssignment({ policy: pid, kind: 'group', subject: 'IT operations', members: ['Eve', 'Finn', 'dana'], unit: 'IT' });
  const x3 = P.newAssignment({ policy: pid, kind: 'person', subject: 'dana' });
  return { a: a.applies && a.matched.length === 1, b: !b.applies, c: !c.applies && c.excluded.length === 1, basis: x1.basis.applies, dup: x3 === x1, people: P.assignedPeople(pid).length, n: P.isp().assignments.length };
}, pid);
ok(r5.a && r5.b && r5.c, 'applicability rules: include, no match, exclude wins');
ok(r5.basis && r5.dup && r5.people === 3 && r5.n === 2, 'assignments keep the rule evaluation, no duplicate, people counted once');

// 6. acknowledgements of an exact version
const r6 = await page.evaluate(async (pid) => {
  const P = await import('/js/isp.js'); const p = P.isp().policies.find(x => x.id === pid);
  const v1 = P.inForce(p).hash;
  const a = P.acknowledge({ policy: pid, person: 'Dana', date: '2026-10-01' });
  const again = P.acknowledge({ policy: pid, person: 'dana' });
  const c1 = P.coverage(pid);
  // v2: submitted by Carol (author), approved by Bob, published
  P.transition(p, 'review', { by: 'Carol' });
  let indep = false; try { await P.approve(p, { by: 'Carol' }); } catch { indep = true; }
  await P.approve(p, { by: 'Bob' }); P.transition(p, 'published', { by: 'Bob' });
  const c2 = P.coverage(pid);
  const b = P.acknowledge({ policy: pid, person: 'Dana' });
  const c3 = P.coverage(pid);
  const draft = P.newPolicy({ title: 'Never published', statements: [{ text: 'x' }] });
  let refused = false; try { P.acknowledge({ policy: draft.id, person: 'Dana' }); } catch { refused = true; }
  return { ack: a.hash === v1 && a.version === '1.0', dup: again === a, c1: [c1.acknowledged, c1.assigned], indep, v1state: p.versions.find(v => v.version === '1.0' && v.state !== 'withdrawn').state, sup: p.versions[0].supersededBy,
    c2: [c2.acknowledged, c2.assigned, c2.stale.join()], b: b.version === '2.0' && b.hash !== v1, c3: [c3.acknowledged, c3.assigned], refused, n: P.isp().acks.length };
}, pid);
ok(r6.ack && r6.dup, 'acknowledgement records the exact version hash; a retry does not duplicate it');
ok(r6.c1.join() === '1,3', 'coverage 1 of 3 on v1');
ok(r6.indep, 'the submitter cannot approve');
ok(r6.v1state === 'superseded' && r6.sup === '2.0', 'publishing v2 supersedes v1');
ok(r6.c2.join() === '0,3,Dana', 'v2 publication creates a new obligation: earlier acknowledgement no longer counts ' + r6.c2.join());
ok(r6.b && r6.c3.join() === '1,3' && r6.n === 2, 'acknowledgement of v2 is a separate record');
ok(r6.refused, 'a version never published cannot be acknowledged');

// 7. UI acknowledgement + training
await page.evaluate(() => { location.hash = '#/isp/acks'; });
await page.waitForSelector('#panel-isp h2:has-text("Record an acknowledgement")');
ok(await page.isVisible('#panel-isp .banner:has-text("An acknowledgement is not compliance")'), 'banner: an acknowledgement is not compliance');
await page.selectOption('#panel-isp select >> nth=0', pid);
await page.fill('#panel-isp input[list="isp-people"] >> nth=0', 'Eve');
await page.click('#panel-isp button:has-text("Record the acknowledgement")'); await page.waitForTimeout(200);
const r7 = await page.evaluate(async (pid) => { const P = await import('/js/isp.js'); const a = P.isp().acks.at(-1); const p = P.isp().policies.find(x => x.id === pid);
  const t = P.newTraining({ title: 'Privileged-user training', policies: [pid], everyMonths: 12 }); p.statements[2].training = [t.id];
  P.recordCompletion({ training: t.id, person: 'Eve', date: '2026-01-15' }); P.recordCompletion({ training: t.id, person: 'Finn', date: '2024-01-15' });
  return { eve: a.person === 'Eve' && a.hash === P.inForce(p).hash, cov: P.coverage(pid).acknowledged, eveT: P.trainingStatus(t.id, 'eve').state, finnT: P.trainingStatus(t.id, 'Finn').state, none: P.trainingStatus(t.id, 'Dana').state }; }, pid);
ok(r7.eve && r7.cov === 2, 'acknowledgement recorded from the screen on the version in force');
ok(r7.eveT === 'current' && r7.finnT === 'expired' && r7.none === 'missing', 'training completion status');

// 8. departures: exception → shared register; non-compliance → isp.issues; corrective action → shared actions
await page.evaluate(() => { location.hash = '#/isp/issues'; }); await page.waitForSelector('text=Record a departure');
const before = await page.evaluate(async () => { const st = await import('/js/state.js'); return { exc: st.S.ws.shared.exceptions.length, nc: st.S.ws.isp.issues.length }; });
await page.selectOption('#panel-isp select >> nth=0', 'exception');
await page.selectOption('#panel-isp select >> nth=1', pid);
await page.fill('#panel-isp input[placeholder^="e.g. Shared administrator"]', 'Legacy PACS console without MFA');
await page.click('#panel-isp button:has-text("Record")'); await page.waitForTimeout(150);
const noJust = await page.evaluate(async () => (await import('/js/state.js')).S.ws.shared.exceptions.length);
ok(noJust === before.exc, 'an exception without justification and expiry is refused');
await page.fill('#panel-isp textarea >> nth=0', 'Vendor does not support MFA until the 2027 upgrade');
await page.fill('#panel-isp input[type=date] >> nth=1', '2027-03-31');
await page.fill('#panel-isp .field:has-text("Exception approved by") input', 'CIO');
await page.click('#panel-isp button:has-text("Record")'); await page.waitForTimeout(200);
const r8 = await page.evaluate(async (pid) => { const st = await import('/js/state.js'); const x = st.S.ws.shared.exceptions.at(-1); return { n: st.S.ws.shared.exceptions.length, nc: st.S.ws.isp.issues.length, x }; }, pid);
ok(r8.n === before.exc + 1 && r8.nc === before.nc, 'the exception went to the shared register, not to the policy issues');
ok(r8.x.type === 'exception' && r8.x.policy === pid && r8.x.status === 'accepted' && r8.x.approvedBy === 'CIO' && r8.x.expiry === '2027-03-31' && r8.x.version === '2.0' && r8.x.concerns.some(l => l.kind === 'policy' && l.id === pid), 'shared exception: type, policy, version, approver, expiry, link');
ok(await page.isVisible('#panel-isp td:has-text("Legacy PACS console without MFA")'), 'policy exceptions listed from the shared register');
const r8b = await page.evaluate(async (pid) => { const P = await import('/js/isp.js'); const out = {};
  try { P.recordException({ title: 't', policy: pid, description: 'j', expiry: '2027-01-01', requestedBy: 'Gil', approvedBy: 'gil' }); } catch { out.sameRefused = true; }
  try { P.recordException({ title: 't', policy: pid, description: 'j', expiry: '2027-01-01', approvedBy: 'X', legalObligation: 'Law 25 s. 3.5' }); } catch { out.lawRefused = true; }
  return out; }, pid);
ok(r8b.sameRefused && r8b.lawRefused, 'exception approver ≠ requester; an exception never waives a law');
await page.selectOption('#panel-isp select >> nth=0', 'noncompliance');
await page.selectOption('#panel-isp select >> nth=1', pid);
await page.fill('#panel-isp input[placeholder^="e.g. Shared administrator"]', 'Admin without MFA on the EHR');
await page.fill('#panel-isp textarea >> nth=0', '');
await page.click('#panel-isp button:has-text("Record")'); await page.waitForTimeout(200);
const nc = await page.evaluate(async () => (await import('/js/isp.js')).isp().issues.at(-1));
ok(nc.title === 'Admin without MFA on the EHR' && nc.type === 'noncompliance' && nc.version === '2.0', 'non-compliance recorded against the version in force');
await page.click('#panel-isp button:has-text("Corrective action") >> nth=0'); await page.waitForTimeout(200);
const act = await page.evaluate(async () => { const st = await import('/js/state.js'); const x = st.S.ws.isp.issues.at(-1); const a = st.S.ws.shared.actions.find(r => r.source?.kind === 'issue' && r.source.id === x.id); return { a: !!a, linked: (x.actions || []).includes(a?.id) }; });
ok(act.a && act.linked, 'corrective action created in the shared action register');

// 9. versions & approvals screen: ledger, hash verification, reviews, rejection
await page.evaluate(pid => { location.hash = '#/isp/reviews'; }, pid);
await page.waitForSelector('#panel-isp h2:has-text("Frozen versions")');
await page.selectOption('#panel-isp select >> nth=0', pid); await page.waitForTimeout(150);
ok(await page.$$eval('#panel-isp h2', h => h.some(x => /Frozen versions \(2\)/.test(x.textContent))), 'two frozen versions listed');
ok(await page.isVisible('#panel-isp .banner:has-text("Independence cannot be verified in single-user mode")'), 'single-user independence warning');
await page.click('#panel-isp button:has-text("Verify the hash") >> nth=0'); await page.waitForTimeout(300);
ok(await page.isVisible('text=Hash verified'), 'hash verified with crypto.subtle');
const r9 = await page.evaluate(async (pid) => { const P = await import('/js/isp.js'); const p = P.isp().policies.find(x => x.id === pid);
  const r = P.newReview({ policy: pid, trigger: 'incident', triggeredBy: 'INC-2026-07', due: '2020-01-01' });
  const overdue = P.reviewOverdue(r);
  P.completeReview(r, 'nochange', { by: 'Owner' });
  const q = P.newPolicy({ title: 'Reject me', statements: [{ text: 'x' }] }); P.transition(q, 'review', { by: 'A' });
  let need = false; try { P.reject(q, { by: 'B', note: '' }); } catch { need = true; }
  P.reject(q, { by: 'B', note: 'too vague' });
  const d = P.dashboard();
  return { overdue, done: !!r.completed && P.reviewDate(p) > '2026', need, rej: q.status === 'draft' && q.rejections.length === 1, ledger: p.versions.flatMap(v => v.approvals || []).length, d };
}, pid);
ok(r9.overdue && r9.done, 'triggered review: overdue, then closed with no change and a new review date');
ok(r9.need && r9.rej, 'rejection needs a reason and is recorded');
ok(r9.ledger === 2, 'approval ledger: one approval per version');
ok(r9.d.ack.assigned >= 3 && r9.d.ack.acknowledged >= 2 && r9.d.exceptions.accepted >= 1 && r9.d.nc.open >= 1 && r9.d.byState.published >= 1, 'dashboard figures with denominators ' + JSON.stringify(r9.d.ack));

// 10. UI life cycle with prompts: the approver typed equal to the submitter is refused
const answers = ['Hugo', 'hugo', '', 'Iris', ''];
page.on('dialog', d => d.accept(answers.length ? answers.shift() : ''));
await page.evaluate(() => { location.hash = '#/isp/policies'; }); await page.waitForSelector('text=Create a policy');
await page.selectOption('#panel-isp select >> nth=0', 'ai');
await page.click('button:has-text("Create from the template")'); await page.waitForSelector('#panel-isp >> text=Policy statements');
await page.click('#panel-isp button:has-text("Submit for review")'); await page.waitForTimeout(200);
await page.click('#panel-isp button:text-is("Approve")'); await page.waitForTimeout(300);
let q = await page.evaluate(async () => (await import('/js/isp.js')).isp().policies.at(-1));
ok(q.status === 'review' && q.submittedBy === 'Hugo', 'UI: approval by the submitter refused');
await page.click('#panel-isp button:text-is("Approve")'); await page.waitForTimeout(400);
q = await page.evaluate(async () => (await import('/js/isp.js')).isp().policies.at(-1));
ok(q.status === 'approved' && q.approval.by === 'Iris' && q.approval.hash && q.versions[0].hash === q.approval.hash, 'UI: approval by another person freezes the version');

// 11. retirement keeps acknowledgements
const r11 = await page.evaluate(async (pid) => { const P = await import('/js/isp.js'); const p = P.isp().policies.find(x => x.id === pid); const n = P.isp().acks.length; P.transition(p, 'retired', { by: 'Bob' }); return { n2: P.isp().acks.length === n, st: p.versions.at(-1).state, inForce: P.inForce(p) }; }, pid);
ok(r11.n2 && r11.st === 'retired' && !r11.inForce, 'retirement keeps acknowledgements and retires the version in force');
await page.evaluate(() => { location.hash = '#/isp/overview'; }); await page.waitForSelector('#panel-isp h2:has-text("Policies by state")');
const errs = errors.filter(e => !/Failed to load resource/.test(e));
ok(errs.length === 0, 'no console error: ' + errs.join(' | '));
await browser.close(); done('t14 ISP management');
