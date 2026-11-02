// t20 — scenario seeds from security operations (SIEM & SOAR): seeds from gaps, untested coverage, degraded
// telemetry, alert clusters, confirmed incidents only, cases, approval gaps, unsimulated playbooks, lessons;
// benign/false-positive alerts skipped but counted; dedupe against existing scenarios (same techniques + crown
// jewel or asset); TLP:RED / AMBER+STRICT never in the AI payload and masked on screen; seeds carry no number;
// drafts in the batch grid (never straight into the register) with evidence links; scenario-editor card;
// no parameter changed; engine 84,305 / 41,023.
import { open, ok, done } from './lib.mjs';

const { browser, page, errors } = await open('#/process');
page.on('dialog', d => d.accept());

await page.evaluate(async () => {
  const st = await import('/js/state.js');
  await st.create(st.newWorkspace({ name: 'SecOps seeds t20' }));
  const ws = st.S.ws;
  const s1 = st.blankScenario('S1'); s1.name = 'Administrator credential compromise on payments'; s1.attack = ['T1078']; s1.assets = 'Payment service';
  const s2 = st.blankScenario('S2'); s2.name = 'Ransomware on the file servers'; s2.attack = ['T1486', 'T1021']; s2.assets = 'File servers';
  s1.params.PbA.v = 0.7; s2.params.Th.v = 0.4;
  ws.assessment.SCEN.push(s1, s2);
  ws.assessment.CROWN.push(['CJ1', 'Payment service', 'Card payments', 'CFO', 'High', 'High', 'High', '', '']);
  ws.assets = [{ id: 'A-PAY', name: 'Payment service', type: 'service', cia: { c: 5, i: 5, a: 5 } }, { id: 'A-FS', name: 'File servers', type: 'server', cia: { c: 3, i: 4, a: 4 } },
    { id: 'A-WIKI', name: 'Intranet wiki', type: 'application', cia: { c: 1, i: 1, a: 1 } }];
  ws.siem = {
    sources: [{ id: 'TS-1', name: 'File server audit log', health: 'silent', healthDate: '2026-09-01', healthHistory: [{ date: '2026-09-01', state: 'silent' }], asset: 'A-FS' },
      { id: 'TS-2', name: 'Identity provider sign-ins', health: 'healthy', healthDate: '2026-09-01', healthHistory: [{ date: '2026-09-01', state: 'healthy' }] }],
    rules: [{ id: 'DR-1', title: 'Admin sign-in anomaly', version: '1', status: 'production', techniques: ['T1078'], scenarios: ['S1'], requiredSources: ['TS-2'], created: '2026-08-01', history: [] },
      { id: 'DR-2', title: 'Mass rename', version: '1', status: 'production', techniques: ['T1486'], scenarios: ['S2'], requiredSources: ['TS-1'], created: '2026-08-01', history: [] },
      { id: 'DR-3', title: 'Suspicious PowerShell', version: '1', status: 'production', techniques: ['T1059'], scenarios: [], requiredSources: ['TS-2'], created: '2026-08-01', history: [] }],
    tests: [{ id: 'DT-1', ruleId: 'DR-1', ruleVersion: '1', date: '2026-09-02', result: 'effective', tester: 'Purple Pat', method: 'emulation' }],
    coverage: [], gaps: [{ id: 'GAP-1', title: 'No exfiltration detection', scenario: '', technique: 'T1567', status: 'open', raised: '2026-09-05' }],
    alerts: [
      { id: 'AL-1', title: 'Admin login from new country', detected: '2026-10-01T10:00', severity: 'high', asset: 'A-PAY', techniques: ['T1078'], tlp: 'GREEN', triage: 'new', indicators: [] },
      { id: 'AL-2', title: 'Admin login impossible travel', detected: '2026-10-02T10:00', severity: 'medium', asset: 'Payment service', techniques: ['T1078'], tlp: 'GREEN', triage: 'in-triage', indicators: [] },
      { id: 'AL-3', title: 'Password spray on wiki', detected: '2026-10-03T10:00', severity: 'medium', asset: 'A-WIKI', techniques: ['T1110.003'], tlp: 'AMBER', triage: 'escalated', caseId: 'CASE-1', indicators: ['IND-2'] },
      { id: 'AL-4', title: 'Benign admin login', detected: '2026-10-03T11:00', severity: 'low', asset: 'A-PAY', techniques: ['T1078'], tlp: 'GREEN', triage: 'benign', indicators: [] },
      { id: 'AL-5', title: 'False positive rename', detected: '2026-10-03T12:00', severity: 'low', asset: 'A-FS', techniques: ['T1486'], tlp: 'GREEN', triage: 'false-positive', indicators: [] },
      { id: 'AL-6', title: 'Secret RED alert XYZZY', detected: '2026-10-04T12:00', severity: 'critical', asset: 'A-FS', techniques: ['T1021'], tlp: 'RED', triage: 'new', indicators: ['IND-1'] }],
    indicators: [{ id: 'IND-1', type: 'domain-name', value: 'evil-xyzzy.example', tlp: 'RED', confidence: 85, source: 'Partner feed' },
      { id: 'IND-2', type: 'ipv4-addr', value: '198.51.100.7', tlp: 'GREEN', confidence: 70, source: 'Open feed' }],
    imports: [], strategies: [], events: [] };
  ws.soar = {
    cases: [{ id: 'CASE-1', title: 'Password spray investigation', opened: '2026-10-03T11:00', status: 'investigating', severity: 'medium', alerts: ['AL-3'], assets: ['Intranet wiki'], timeline: [] },
      { id: 'CASE-2', title: 'File encryption on FS01', opened: '2026-09-20T08:00', status: 'contained', severity: 'critical', alerts: [], assets: ['File servers'], incident: 'INC-1', timeline: [] }],
    playbooks: [{ id: 'PB-1', name: 'Ransomware containment', scenarios: ['S2'], trigger: { kind: 'alert', conditions: '' }, current: 1, versions: [{ version: 1, state: 'published', published: '2026-09-01', publishedBy: 'SOC Lead', steps: [{ id: 'st1', action: 'isolate host', riskClass: 'containment', requiresGate: true, evidence: 'EDR log' }] }] }],
    gates: [], approvals: [], simulations: [],
    executions: [{ id: 'EXE-1', case: 'CASE-2', action: 'isolate host', riskClass: 'containment', target: 'FS01', performedBy: 'Ann', started: '2026-09-20T09:00', status: 'succeeded', attempt: 'a1', approval: '' }],
    lessons: [{ id: 'LES-1', case: 'CASE-2', incident: 'INC-1', date: '2026-09-30', by: 'SOC Lead', lesson: 'Backups were reachable from the production domain', scenarios: ['S2'], links: [], actions: [] }] };
  ws.csm.incidents.push({ id: 'INC-1', title: 'Ransomware on file servers', status: 'contained', type: 'malware', detected: '2026-09-20', confirmed: '2026-09-20', confirmedBy: 'Sam Lead', assets: 'File servers', techniques: ['T1486'], scenarios: [], case: 'CASE-2', timeline: [] },
    { id: 'INC-2', title: 'Unconfirmed doc incident QQQ', status: 'recorded', confirmed: '', detected: '2026-08-01', assets: 'Payment service', scenarios: [], timeline: [] });
  st.touch();
});
const snap = () => page.evaluate(async () => { const st = await import('/js/state.js'); return JSON.stringify(st.S.ws.assessment.SCEN.filter(s => ['S1', 'S2'].includes(s.id)).map(s => ({ id: s.id, params: s.params, red_p: s.red_p, red_i: s.red_i, cvss: s.cvss }))); });
const before = await snap();

// ---------- the model ----------
const m = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SEED = await import('/js/secops_seed.js');
  const ws = st.S.ws, out = {};
  const r = SEED.seeds(ws, { asOf: '2026-10-13' });
  out.kinds = [...new Set(r.seeds.map(s => s.kind))].sort();
  out.counts = r.counts;
  const find = (k, f) => r.seeds.find(s => s.kind === k && f(s));
  const cl = find('alert-cluster', s => s.techniques.includes('T1078'));
  out.cluster = cl && { n: cl.evidence.filter(e => e.kind === 'alert').length, ids: cl.evidence.map(e => e.id), sug: cl.whatItSuggests, crown: cl.crownJewels };
  const spray = find('alert-cluster', s => s.techniques.includes('T1110.003'));
  out.spray = spray && { sug: spray.whatItSuggests.type, ind: spray.evidence.find(e => e.kind === 'indicator') };
  const red = find('alert-cluster', s => s.techniques.includes('T1021'));
  out.red = red && { restricted: red.restricted, tlp: red.tlp };
  const masked = red && SEED.display(red, false);
  out.masked = masked && { m: masked.masked, tech: masked.techniques.length, ev: masked.evidence.filter(e => e.kind === 'alert').map(e => e.id), chain: masked.chain };
  out.revealed = red && SEED.display(red, true).evidence.some(e => e.id === 'AL-6');
  const inc = find('confirmed-incident', () => true);
  out.inc = r.seeds.filter(s => s.kind === 'confirmed-incident').map(s => s.id);
  out.incSug = inc?.whatItSuggests;
  out.incInforms = inc?.informs.map(i => i.param);
  out.noUnconfirmed = !JSON.stringify(r.seeds).includes('QQQ') && !r.seeds.some(s => s.id.includes('INC-2'));
  out.alertNotIncident = !r.seeds.some(s => s.kind === 'confirmed-incident' && s.evidence.every(e => e.kind === 'alert'));
  out.gap = find('detection-gap', s => s.techniques.includes('T1567'))?.whatItSuggests.type;
  out.gapS2 = find('detection-gap', s => s.techniques.includes('T1021'))?.whatItSuggests;
  out.untested = find('untested-coverage', s => s.techniques.includes('T1059'))?.informs.map(i => i.param);
  out.tel = find('degraded-telemetry', s => s.evidence.some(e => e.id === 'TS-1'));
  out.tel = out.tel && { informs: out.tel.informs.map(i => i.param), sug: out.tel.whatItSuggests, techs: out.tel.techniques };
  out.case = r.seeds.filter(s => s.kind === 'case').map(s => s.id);
  out.appr = find('approval-gap', () => true)?.evidence.map(e => e.id);
  out.pb = find('unsimulated-playbook', () => true)?.whatItSuggests;
  out.lesson = find('lesson', () => true)?.whatItSuggests;
  // never a number: the only numbers in a seed are an indicator's stated source confidence
  const nums = []; const walk = (o, path) => { if (typeof o === 'number') nums.push(path); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, path + '.' + k); };
  r.seeds.forEach(s => walk(s, s.id));
  out.nums = nums.filter(p => !/\.evidence\.\d+\.confidence$/.test(p));
  out.noParams = r.seeds.every(s => !('params' in s) && s.informs.every(i => !('v' in i)));
  // the AI summary
  const sum = SEED.aiSummary(ws, { asOf: '2026-10-13' });
  out.sum = sum;
  // the excluded set
  const ex = SEED.seeds(ws, { asOf: '2026-10-13', excludeRestricted: true });
  out.exLeft = ex.counts.restrictedLeftOut;
  out.exRed = ex.seeds.some(s => s.evidence.some(e => e.id === 'AL-6' || e.id === 'IND-1'));
  // draft and attach
  const d = SEED.toDraft(cl);
  out.draft = { secops: d.secops, ev: d.secopsEv.length, mark: /Analytical estimate — validation required/.test(d.background), rat: Object.values(d.rat).every(x => /Placeholder/.test(x)), conf: Object.values(d.conf).every(x => x === 'Low') };
  return out;
});
console.log(JSON.stringify(m.kinds), JSON.stringify(m.counts));
for (const k of ['detection-gap', 'untested-coverage', 'degraded-telemetry', 'alert-cluster', 'confirmed-incident', 'case', 'approval-gap', 'unsimulated-playbook', 'lesson'])
  ok(m.kinds.includes(k), 'seed kind ' + k);
ok(m.counts.benign === 1 && m.counts.falsePositive === 1, 'benign and false-positive alerts skipped and counted ' + JSON.stringify(m.counts));
ok(m.counts.unconfirmedIncidents === 1 && m.noUnconfirmed, 'an incident without a confirmation (date + person) is not counted as an incident');
ok(m.alertNotIncident && !m.inc.some(x => /AL-/.test(x)), 'no alert ever becomes an incident seed');
ok(m.inc.length === 1 && m.inc[0] === 'SEED-confirmed-incident-INC-1', 'one confirmed incident seed ' + m.inc);
ok(m.cluster && m.cluster.n === 2 && m.cluster.ids.includes('AL-1') && m.cluster.ids.includes('AL-2') && !m.cluster.ids.includes('AL-4'), 'alerts clustered by technique and asset (name or id), benign left out ' + JSON.stringify(m.cluster));
ok(m.cluster?.sug.type === 'existing' && m.cluster.sug.scenario === 'S1' && m.cluster.crown.includes('Payment service'), 'dedupe: same technique + same crown jewel → evidence for existing scenario S1 ' + JSON.stringify(m.cluster?.sug));
ok(m.spray?.sug === 'new', 'a cluster no scenario covers suggests a new scenario');
ok(m.spray?.ind?.id === 'IND-2' && m.spray.ind.confidence === 70, 'indicator evidence keeps its stated source confidence');
ok(m.incSug?.type === 'existing' && m.incSug.scenario === 'S2', 'confirmed incident with same technique + asset → evidence for S2 ' + JSON.stringify(m.incSug));
ok(JSON.stringify(m.incInforms) === JSON.stringify(['PbA', 'Pbx', 'De']), 'confirmed incident informs Pb(A), Pb(ψ,A), δe');
ok(m.gap === 'new', 'recorded detection gap without scenario → new candidate');
ok(m.gapS2?.type === 'existing' && m.gapS2.scenario === 'S2', 'missing coverage of a scenario technique → evidence for that scenario');
ok(m.untested?.[0] === 'Pbx', 'untested coverage informs Pb(ψ,A)');
ok(m.tel && m.tel.informs[0] === 'Th' && m.tel.techs.includes('T1486') && m.tel.sug.scenario === 'S2', 'degraded telemetry informs θ and touches S2 via its rule ' + JSON.stringify(m.tel));
ok(m.case.length === 1 && m.case[0] === 'SEED-case-CASE-1', 'open case not confirmed → case seed; case linked to a confirmed incident folded into the incident');
ok(m.appr?.includes('EXE-1'), 'execution without a valid approval → approval-gap seed');
ok(m.pb?.scenario === 'S2' && m.lesson?.scenario === 'S2', 'unsimulated playbook and lesson are evidence for their scenario');
ok(m.red?.restricted && m.red.tlp === 'RED', 'a cluster with a TLP:RED alert is restricted');
ok(m.masked?.m && m.masked.tech === 0 && m.masked.ev.every(x => x === '•••') && !/XYZZY|T1021/.test(m.masked.chain), 'restricted seed masked unless revealed');
ok(m.revealed, 'revealed locally on opt-in');
ok(m.nums.length === 0 && m.noParams, 'seeds carry no number (only stated source confidence) ' + m.nums.join(','));
ok(/Security-operations evidence/.test(m.sum) && /SEED-alert-cluster/.test(m.sum) && /TLP:GREEN/.test(m.sum), 'AI summary built');
ok(!/XYZZY|xyzzy|AL-6|IND-1\b|TLP:RED [^o]|\bRED\b(?! or)/.test(m.sum.replace('TLP:RED or TLP:AMBER+STRICT', '')), 'AI summary contains nothing TLP:RED');
ok(!/confidence|\/100|\b85\b|\b70\b/.test(m.sum.replace(/source confidence/g, '')), 'AI summary carries no source confidence');
ok(/not an incident/.test(m.sum) && /left out/.test(m.sum), 'AI summary states the rules and the restricted count');
ok(m.exLeft >= 2 && !m.exRed, 'excludeRestricted leaves RED alert and indicator out entirely ' + m.exLeft);
ok(m.draft.secops && m.draft.ev === 2 && m.draft.mark && m.draft.rat && m.draft.conf, 'a draft carries evidence links, placeholder rationales and the analytical-estimate label');

// ---------- Batch scenarios: the security-operations source ----------
await page.evaluate(() => { location.hash = '#/batch'; }); await page.waitForTimeout(500);
await page.click('#panel-batch .subtabs button:has-text("From security operations")'); await page.waitForTimeout(400);
const ui = await page.evaluate(() => {
  const p = document.querySelector('#panel-batch');
  const rows = [...p.querySelectorAll('.seedrow')];
  const red = rows.find(r => /alert-cluster/.test(r.dataset.seed) && /T1021/.test(r.dataset.seed));
  return { n: rows.length, txt: p.textContent, redDisabled: red?.querySelector('input[type=checkbox]').disabled, redText: red?.textContent || '' };
});
ok(ui.n >= 10, 'seeds listed with checkboxes ' + ui.n);
ok(/Analytical estimate — validation required/.test(ui.txt), 'labelled Analytical estimate — validation required');
ok(/1 benign and 1 false-positive alert\(s\) skipped/.test(ui.txt), 'benign / false-positive count shown');
ok(ui.redDisabled === true && !/XYZZY|evil-xyzzy/.test(ui.txt) && /masked/.test(ui.redText), 'TLP:RED seed masked and not selectable');
// reveal locally
await page.click('#panel-batch label:has-text("Show TLP:RED and TLP:AMBER+STRICT items") input'); await page.waitForTimeout(300);
const rev = await page.evaluate(() => { const r = [...document.querySelectorAll('#panel-batch .seedrow')].find(r => /T1021/.test(r.dataset.seed) && /alert-cluster/.test(r.dataset.seed)); return { dis: r?.querySelector('input').disabled, t: r?.textContent }; });
ok(rev.dis === false && /T1021/.test(rev.t), 'revealed on opt-in');
await page.click('#panel-batch label:has-text("Show TLP:RED and TLP:AMBER+STRICT items") input'); await page.waitForTimeout(300);
// record evidence on S1 from the matching cluster
await page.click('#panel-batch .seedrow[data-seed*="alert-cluster-T1078"] button:has-text("Record the evidence on S1")'); await page.waitForTimeout(200);
const att = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.SCEN.find(s => s.id === 'S1').secops);
ok(Array.isArray(att) && att.length === 2 && att.every(e => e.kind === 'alert' && e.tlp === 'GREEN'), 'evidence recorded on S1 as links ' + JSON.stringify(att));
// tick two seeds and create drafts
await page.click('#panel-batch .seedrow[data-seed="SEED-detection-gap-GAP-1"] input[type=checkbox]');
await page.click('#panel-batch .seedrow[data-seed*="T1110.003"] input[type=checkbox]');
await page.click('#panel-batch button:has-text("Create 2 draft candidate(s)")'); await page.waitForTimeout(400);
const dr = await page.evaluate(async () => { const ws = (await import('/js/state.js')).S.ws; return { draft: ws.batchDraft.map(r => ({ secops: r.secops, ev: r.secopsEv?.length, name: r.name })), scen: ws.assessment.SCEN.length, grid: /2 SIEM\/SOAR evidence link|1 SIEM\/SOAR evidence link/.test(document.querySelector('#panel-batch').textContent) }; });
ok(dr.draft.length === 2 && dr.draft.every(r => r.secops && r.ev >= 1) && dr.scen === 2, 'two drafts in the grid, the register untouched ' + JSON.stringify(dr));
ok(dr.grid, 'grid shows the evidence links');
await page.click('#panel-batch button:has-text("Add 2 selected to the register")'); await page.waitForTimeout(500);
const com = await page.evaluate(async () => { const ws = (await import('/js/state.js')).S.ws; return ws.assessment.SCEN.slice(2).map(s => ({ id: s.id, origin: s.origin, secops: s.secops, bg: s.background, ev: s.threat_event, rat: s.params.PbA.rat })); });
ok(com.length === 2 && com.every(s => /From security operations/.test(s.origin) && s.secops?.length >= 1 && /validation required/.test(s.bg) && s.ev && /Placeholder/.test(s.rat)), 'added only on explicit commit, with s.secops links and provenance ' + JSON.stringify(com).slice(0, 300));

// ---------- AI: batch "Propose with AI" — payload preview, TLP filter, seed linkage ----------
await page.evaluate(() => { location.hash = '#/batch'; }); await page.waitForTimeout(300);
await page.click('#panel-batch .subtabs button:has-text("Propose with AI")'); await page.waitForTimeout(800);
const cbOk = await page.$('#panel-batch label:has-text("Include security-operations evidence") input:not([disabled])');
ok(!!cbOk, 'batch AI offers "Include security-operations evidence"');
await cbOk.check();
await page.route('**/api/ai', async route => {
  const body = JSON.parse(route.request().postData() || '{}');
  await page.evaluate(p => { window.__sent = p; }, body.prompt);
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: JSON.stringify({ scenarios: [{ name: 'Password spraying on the wiki leads to admin access', statement: 'x', threat_source: 'Cybercriminal', asset: 'Intranet wiki', vulnerability: 'no lockout', params: { PbA: { v: 0.5, why: 'w', conf: 'Low' } }, attack: ['T1110.003'], seed: 'SEED-alert-cluster-T1110.003@intranet_wiki' }] }), model: 'mock-model', provider: 'claude', usage: { in: 1, out: 1 } }) });
});
await page.click('#panel-batch button:has-text("Propose candidates")'); await page.waitForTimeout(800);
const pv = await page.evaluate(() => [...document.querySelectorAll('.modal textarea')].map(t => t.value).join('\n'));
ok(/Security-operations evidence/.test(pv) && /SEED-/.test(pv), 'payload preview shows the security-operations summary');
ok(!/XYZZY|xyzzy|AL-6|IND-1\b/.test(pv), 'payload preview: nothing TLP:RED');
ok(!/\b85\b|\/100/.test(pv), 'payload preview: no source confidence');
const sendBtn = await page.$('.modal button:has-text("Confirm and send")') || await page.$('.modal button:has-text("Send")');
await sendBtn.click(); await page.waitForTimeout(800);
const sent = await page.evaluate(() => window.__sent || '');
ok(/Security-operations evidence/.test(sent) && !/XYZZY|AL-6/.test(sent), 'what was sent = the previewed TLP-filtered summary');
const aiRow = await page.evaluate(async () => (await import('/js/state.js')).S.ws.batchDraft.find(r => r.ai));
ok(aiRow && aiRow.seed && aiRow.secopsEv?.some(e => e.id === 'AL-3'), 'AI candidate prompted by a seed carries its evidence links ' + JSON.stringify(aiRow?.secopsEv));
await page.unroute('**/api/ai');

// ---------- AI assistant → Scenario generation ----------
await page.evaluate(() => { location.hash = '#/ai'; }); await page.waitForTimeout(800);
await page.click('#panel-ai .subtabs button:has-text("Scenario generation")'); await page.waitForTimeout(400);
const cb2 = await page.$('#panel-ai label:has-text("Include security-operations evidence") input:not([disabled])');
ok(!!cb2, 'AI assistant offers the checkbox');
if (cb2) { await cb2.check(); await page.click('#panel-ai button:has-text("Prepare the request")'); await page.waitForTimeout(500); }
const pv2 = await page.evaluate(() => document.querySelector('#panel-ai').innerText + [...document.querySelectorAll('#panel-ai textarea, #panel-ai pre')].map(t => t.value || t.textContent).join('\n'));
ok(/Security-operations evidence/.test(pv2) && !/XYZZY|AL-6/.test(pv2), 'AI assistant preview shows the filtered summary');

// ---------- Scenario editor card ----------
await page.evaluate(() => { location.hash = '#/scenario/S2'; }); await page.waitForTimeout(600);
const card = await page.evaluate(() => { const c = document.querySelector('#panel-scenario [data-secops]'); return c ? c.textContent : ''; });
ok(/Security-operations evidence/.test(card) && /DR-2/.test(card) && /PB-1/.test(card) && /INC-1/.test(card), 'scenario card: rules, playbooks, incidents ' + card.slice(0, 200));
ok(/not simulated/.test(card) && /confirmed/.test(card) && /degraded/.test(card), 'scenario card: simulation status, confirmation, coverage status');
ok(!/XYZZY/.test(card) && /Masked/.test(card), 'scenario card masks the TLP:RED alert');
await page.click('#scen-tab-links');   // 1.9.0 Atlas: the security-operations card sits under Links & evidence
await page.click('#panel-scenario [data-secops] label input'); await page.waitForTimeout(200);
ok(/XYZZY/.test(await page.evaluate(() => document.querySelector('#panel-scenario [data-secops]').textContent)), 'scenario card reveals on local opt-in');
ok(/siem\/coverage/.test(await page.evaluate(() => document.querySelector('#panel-scenario [data-secops]').innerHTML)), 'links to SIEM/SOAR screens');
await page.evaluate(() => { location.hash = '#/scenario/S1'; }); await page.waitForTimeout(500);
const c1 = await page.evaluate(() => document.querySelector('#panel-scenario [data-secops]')?.textContent || '');
ok(/validated/.test(c1) && /AL-1/.test(c1) && !/AL-4/.test(c1) && /Evidence links recorded/.test(c1), 'S1 card: validated coverage, non-benign alerts only, recorded links');

// ---------- nothing changed, engine intact ----------
ok(await snap() === before, 'no parameter of an existing scenario changed');
const eng = await page.evaluate(() => { const r = CRG.run(CRG_SAMPLE); return [Math.round(r.totals.est), Math.round(r.totals.res)]; });
ok(eng[0] === 84305 && eng[1] === 41023, 'engine 84,305 / 41,023 ' + eng);
ok(/84,305 \/ 41,023/.test(await page.textContent('body')), 'engine banner verified');
ok(!errors.length, 'no page errors ' + errors.join(' | ').slice(0, 400));
await browser.close();
done('t20_secops_scenarios');
