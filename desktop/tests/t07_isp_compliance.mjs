import { open, ok, done, MOCK } from './lib.mjs';
import fs from 'fs';
const { browser, page, errors } = await open('#/process');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id); location.hash = '#/isp/policies'; });
await page.waitForSelector('text=Create a policy');
// create from template (access control)
await page.selectOption('#panel-isp select >> nth=0', 'access');
await page.click('button:has-text("Create from the template")');
await page.waitForSelector('#panel-isp >> text=Policy statements');
let p = await page.evaluate(async () => (await import('/js/isp.js')).isp().policies.at(-1));
ok(p.title === 'Access control and authentication' && p.status === 'draft' && p.statements.length === 5 && p.statements[0].id === p.id + '.1', 'policy from template');
// life cycle
page.on('dialog', d => d.accept(/approver|approbateur/i.test(d.message()) ? 'Bob (CISO)' : ''));   // 1.9.2 (NV-020): an approval needs a named approver
await page.click('#panel-isp button:has-text("Submit for review")'); await page.waitForTimeout(200);
await page.click('#panel-isp button:text-is("Approve")'); await page.waitForTimeout(200);
await page.click('#panel-isp button:text-is("Publish")'); await page.waitForTimeout(200);
p = await page.evaluate(async () => (await import('/js/isp.js')).isp().policies.at(-1));
ok(p.status === 'published' && p.version === '1.0' && p.effective && p.nextReview > p.effective && p.approval, 'draft → review → approved → published, v1.0 with review date');
ok(await page.isVisible('text=Frozen text'), 'published text is frozen');
await page.click('#panel-isp button:has-text("Start a new version")'); await page.waitForTimeout(200);
p = await page.evaluate(async () => (await import('/js/isp.js')).isp().policies.at(-1));
ok(p.status === 'draft' && p.version === '2.0' && p.archive.length === 1 && p.archive[0].version === '1.0', 'new version keeps v1.0 in the archive');
ok(p.history.length === 5, 'every transition in the history: ' + p.history.length);
// publishing without approval is refused
const refused = await page.evaluate(async () => { const P = await import('/js/isp.js'); const x = P.isp().policies.at(-1); try { x.status = 'approved'; x.approval = null; P.transition(x, 'published'); return false; } catch { x.status = 'draft'; return true; } });
ok(refused, 'publishing an unapproved policy is refused');
// non-compliance
await page.evaluate(() => { location.hash = '#/isp/issues'; }); await page.waitForSelector('text=Record a departure');
await page.fill('#panel-isp input[placeholder^="e.g. Shared administrator"]', 'Shared admin account on PACS');
await page.click('#panel-isp button:has-text("Record")'); await page.waitForTimeout(200);
const nc = await page.evaluate(async () => (await import('/js/isp.js')).isp().issues.at(-1));
ok(nc && nc.id === 'NC-001' && nc.status === 'open', 'non-compliance recorded');
await page.click('#panel-isp button:has-text("Make it a risk")'); await page.waitForTimeout(200);
const risk = await page.evaluate(async () => { const st = await import('/js/state.js'); const x = (await import('/js/isp.js')).isp().issues.at(-1); return st.S.ws.risks.find(r => r.id === x.risk); });
ok(risk && risk.category === 'Compliance', 'non-compliance becomes a risk-register entry');
// exceptions need expiry and acceptor
const exc = await page.evaluate(async () => { const P = await import('/js/isp.js'); const x = P.newIssue({ type: 'exception', status: 'accepted', title: 'Legacy PACS without MFA', expiry: '2026-01-01', acceptedBy: 'CIO' }); return P.exceptionExpired(x); });
ok(exc === true, 'expired exception detected');
// compliance: requirements from the ontology and the policies, rules assessment, report
await page.evaluate(async () => { const P = await import('/js/isp.js'); const x = P.isp().policies.find(p => p.status === 'draft' && p.title.startsWith('Access')); x.status = 'review'; P.transition(x, 'approved', { by: 't' }); P.transition(x, 'published', { by: 't' });
  location.hash = '#/compliance/requirements'; });
await page.waitForSelector('text=Import requirements');
await page.click('button:has-text("Add the Law 25 and R-22.1 obligations")'); await page.waitForTimeout(1500);
await page.click('button:has-text("Add the published policy statements")'); await page.waitForTimeout(300);
const R = await page.evaluate(async () => { const st = await import('/js/state.js'); const r = st.S.ws.compliance.requirements; return { n: r.length, law: r.filter(x => /P-39\.1/.test(x.ref)).length, pol: r.filter(x => x.source === 'policy').length }; });
ok(R.law > 5 && R.pol === 5, 'requirements from the ontology and the policies ' + JSON.stringify(R));
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.compliance.soa['ISO22:8.5'] = { status: 'implemented' }; st.S.ws.compliance.soa['ISO22:5.15'] = { status: 'partial' }; location.hash = '#/compliance/ai'; });
await page.waitForSelector('text=What to assess');
await page.selectOption('#panel-compliance select >> nth=1', 'Security policies (ISP)');
await page.click('#panel-compliance button:has-text("Propose")');
await page.waitForSelector('text=Review the proposals');
const nTick = await page.$$eval('#panel-compliance table tbody td.cb input:checked', x => x.length);
ok(nTick >= 1, 'rules propose statuses: ' + nTick);
await page.click('button:has-text("Apply the ticked proposals")'); await page.waitForTimeout(300);
const applied = await page.evaluate(async () => { const st = await import('/js/state.js'); return st.S.ws.compliance.requirements.filter(r => r.assessed?.method === 'rules accepted').length; });
ok(applied === nTick, 'accepted proposals written with their method');
// AI path with the mock
fs.writeFileSync(MOCK + '/compliance_assess.txt', JSON.stringify({ items: [{ id: 'L25-01', status: 'partial', evidence: 'Mock evidence', gap: 'Title not published', confidence: 'Low', tag: 'INFERENCE' }] }));
await page.evaluate(async () => { const AI = await import('/js/ai.js'); AI.settings().acknowledged = new Date().toISOString(); });
await page.selectOption('#panel-compliance select >> nth=0', 'chk'); await page.waitForTimeout(200);
await page.selectOption('#panel-compliance select >> nth=3', 'ai'); await page.waitForTimeout(200);
await page.click('#panel-compliance button:has-text("Propose")');
await page.waitForSelector('.modal textarea');
const pl = await page.$eval('.modal textarea >> nth=1', t => t.value);
ok(/TASK: compliance_assess/.test(pl) && /L25-01/.test(pl) && /CREATIVITY:/.test(pl), 'AI payload lists the items and the creativity');
await page.click('.modal .btnrow .btn:not(.ghost)');
await page.waitForSelector('text=Review the proposals');
ok(await page.isVisible('#panel-compliance td >> text=Partially compliant'), 'AI proposal shown');
// report
await page.evaluate(() => { location.hash = '#/compliance/report'; }); await page.waitForSelector('#panel-compliance h2:has-text("Over time")');
const md = await page.evaluate(async () => (await import('/js/panels/compliance_plus.js')).fullReport());
ok(/## Compliance requirements/.test(md) && /## Security policies/.test(md) && /NC-001/.test(md), 'full report gathers requirements, policies and non-compliance');
ok(errors.length === 0, 'no console error: ' + errors.join(' | '));
await browser.close(); done('t07 ISP and compliance');
