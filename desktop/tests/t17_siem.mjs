// t17 — SIEM module (local only): Sigma import, envelope import with SHA-256 record, coverage validated only by an
// effective test on or before the as-of date, silent telemetry → degraded, rule lifecycle, alert import and
// dedup, crown-jewel triage, escalation to a SOAR case (idempotent), STIX bundle with TLP 2.0, TLP-aware exports.
import { open, ok, done } from './lib.mjs';
import crypto from 'crypto';
import fs from 'fs';

const { browser, page, errors } = await open('#/process');
page.on('dialog', d => d.accept());

// ---------- a fresh workspace with scenarios, assets and crown jewels ----------
await page.evaluate(async () => {
  const st = await import('/js/state.js');
  const w = st.newWorkspace({ name: 'SIEM test org' });
  await st.create(w);
  const ws = st.S.ws;
  const s1 = st.blankScenario('S1'); s1.name = 'Credential compromise of an administrator'; s1.attack = ['T1078 Valid Accounts'];
  const s2 = st.blankScenario('S2'); s2.name = 'Ransomware on the file servers'; s2.attack = ['T1486'];
  ws.assessment.SCEN.push(s1, s2);
  ws.assessment.CROWN.push(['CJ1', 'Payment service', 'Card payments', 'CFO', 'High', 'High', 'High', '', '']);
  ws.assets = [{ id: 'A-PAY', name: 'Payment service', type: 'service', cia: { c: 5, i: 5, a: 5 }, classification: 'Confidential' },
    { id: 'A-WIKI', name: 'Intranet wiki', type: 'application', cia: { c: 1, i: 1, a: 1 }, classification: 'Internal' }];
  st.touch();
});
const paramsBefore = await page.evaluate(async () => JSON.stringify((await import('/js/state.js')).S.ws.assessment.SCEN.map(s => s.params)));
const go = async (tab) => { await page.evaluate(h => { location.hash = '#/siem/' + h; }, tab); await page.waitForTimeout(350); };

// ---------- every tab renders ----------
for (const t of ['dashboard', 'sources', 'rules', 'coverage', 'alerts', 'intel', 'import']) {
  const before = errors.length;
  await go(t);
  const h1 = await page.evaluate(() => document.querySelectorAll('#panel-siem h1').length);
  const sel = await page.evaluate(() => document.querySelector('#panel-siem .subtabs [aria-selected="true"]')?.textContent);
  const bad = await page.evaluate(() => /raised an error/.test(document.querySelector('#panel-siem').textContent));
  ok(h1 === 1 && !bad && errors.length === before, `tab ${t} renders (one h1, no error) ${errors.slice(before).join(' | ')}`);
  ok(!!sel, `tab ${t} selected in the sub-tabs`);
}
const lede = await page.evaluate(() => document.querySelector('#panel-siem h1')?.nextElementSibling?.classList.contains('lede'));
ok(!lede, 'no p.lede after the h1');

// ---------- Sigma import (UI paste) ----------
const SIGMA = `title: Suspicious sign-in from an unusual country # comment
id: 5f2b6c1e-1111-4a2b-9c3d-000000000001
status: stable
level: high
description: |
  Detects a successful administrator sign-in
  from a country never seen before.
author: SOC team
references:
    - https://example.test/ref
logsource:
    product: azure
    service: signinlogs
tags:
    - attack.initial_access
    - attack.t1078
    - attack.t1110.003
detection:
    selection:
        ResultType: 0
        Role|contains: 'Admin'
    filter:
        Country: ['CA', 'US']
    condition: selection and not filter
falsepositives:
    - Travel
---
title: Mass file rename with unusual extensions
id: 5f2b6c1e-1111-4a2b-9c3d-000000000002
status: experimental
level: critical
logsource: { }
tags: [attack.t1486, attack.impact]
detection:
    sel:
        EventID: 4663
    condition: sel
`;
await go('rules');
await page.fill('#siem-sigma-text', SIGMA);
await page.click('#siem-sigma-import');
await page.waitForTimeout(500);
let R = await page.evaluate(async () => (await import('/js/siem.js')).reg());
const sg = R.rules.find(r => r.ruleId === '5f2b6c1e-1111-4a2b-9c3d-000000000001');
ok(R.rules.length === 2, 'two Sigma documents → two rules: ' + R.rules.length);
ok(sg && sg.title === 'Suspicious sign-in from an unusual country' && sg.level === 'high' && sg.language === 'sigma', 'Sigma title, id, level');
ok(sg && sg.status === 'testing' && sg.sigmaStatus === 'stable', 'Sigma "stable" never means production: rule in testing');
ok(sg && JSON.stringify(sg.techniques) === '["T1078","T1110.003"]', 'attack.t#### tags → techniques ' + JSON.stringify(sg?.techniques));
ok(sg && sg.logsource.product === 'azure' && sg.logsource.service === 'signinlogs', 'logsource product/service');
ok(sg && /^selection:\n {4}ResultType: 0/.test(sg.detection) && /condition: selection and not filter/.test(sg.detection) && !/falsepositives/.test(sg.detection), 'detection kept verbatim as text');
ok(sg && /Detects a successful administrator sign-in\nfrom a country/.test(sg.description), 'block scalar description');
ok(sg && sg.falsepositives[0] === 'Travel' && sg.references[0] === 'https://example.test/ref', 'falsepositives and references');
const sg2 = R.rules.find(r => r.ruleId.endsWith('0002'));
ok(sg2 && sg2.status === 'draft' && JSON.stringify(sg2.techniques) === '["T1486"]', 'flow-list tags, experimental → draft');
ok(R.imports.length === 1 && R.imports[0].kind === 'sigma' && /^[0-9a-f]{64}$/.test(R.imports[0].sha256), 'Sigma import recorded with SHA-256');
ok(R.imports[0].sha256 === crypto.createHash('sha256').update(SIGMA).digest('hex'), 'recorded SHA-256 is the SHA-256 of the text');
// re-import → duplicate; changed detection → version 2
let rec = await page.evaluate(async t => (await import('/js/siem.js')).importText(t, { fileName: 'again.yml' }), SIGMA);
ok(rec.counts.duplicates === 2 && !rec.counts.rules, 'same Sigma twice → duplicates, nothing added');
rec = await page.evaluate(async t => (await import('/js/siem.js')).importText(t, { fileName: 'v2.yml' }), SIGMA.replace("Country: ['CA', 'US']", "Country: ['CA']"));
R = await page.evaluate(async () => (await import('/js/siem.js')).reg());
const sgv = R.rules.find(r => r.ruleId.endsWith('0001'));
ok(rec.counts.updated === 1 && sgv.version === '2' && sgv.versions.length === 1 && sgv.versions[0].version === '1', 'changed detection → version 2, version 1 kept');
// parser unit checks
const py = await page.evaluate(async () => { const M = await import('/js/siem.js'); return M.parseYaml('a: 1\nb:\n  - x\n  - "y: z"\nc: {}\nd: [p, \'q, r\']\ne:\n  f: g # c\n'); });
ok(py.a === '1' && py.b[1] === 'y: z' && py.d[1] === 'q, r' && py.e.f === 'g', 'YAML subset: lists, quotes, flow lists, comments ' + JSON.stringify(py));

// ---------- envelope import through the Import tab (file input) ----------
const ENV = {
  format: 'crg-siem-import/1', generated: '2026-10-12T08:00:00Z', source: 't17', tlp: 'AMBER',
  sources: [
    { id: 'TS-IDP', name: 'Identity provider sign-in logs', system: 'Fictional SIEM 9', asset: 'Payment service', ocsfClass: 'authentication', dataComponents: ['DC0002'], logsource: { product: 'azure', service: 'signinlogs' }, health: 'healthy', healthDate: '2026-01-01' },
    { id: 'TS-EDR', name: 'EDR telemetry from servers', ocsfClass: 1007, healthHistory: [{ date: '2026-01-01', state: 'healthy' }, { date: '2026-10-11', state: 'silent', note: 'forwarding broken' }, { date: '2026-10-21', state: 'healthy' }] },
    { id: 'TS-POS', name: 'Point-of-sale syslog', ocsfClass: 'Process Activity', health: 'healthy', healthDate: '2026-01-01' },
    { id: 'TS-OLD', name: 'Stale proxy log', health: 'healthy', healthDate: '2026-01-01', cadenceHours: 1, lastSeen: '2026-09-01T00:00:00Z' },
  ],
  strategies: [{ id: 'DS-VA', name: 'Detect abuse of valid administrator accounts', reference: 'DET0560', analytics: ['AN0001'], techniques: ['T1078'] }],
  rules: [
    { id: 'DR-IT', title: 'Impossible travel for administrators', version: '2', language: 'native', status: 'production', owner: 'Dana', techniques: ['T1078'], scenarios: ['S1'], requiredSources: ['TS-IDP', 'TS-EDR'], strategy: 'DS-VA', created: '2026-01-15' },
    { id: 'DR-RW', title: 'Burst of file renames', version: '3', status: 'production', techniques: ['T1486'], scenarios: ['S2'], requiredSources: ['TS-POS'], created: '2026-01-15' },
    { id: 'DR-BF', title: 'Failed sign-ins then success', version: '1', status: 'testing', techniques: ['T1110'], requiredSources: ['TS-IDP'], created: '2026-01-15' },
    { id: 'DR-UN', title: 'Untested production rule', version: '1', status: 'production', techniques: ['T1059'], scenarios: ['S1'], requiredSources: ['TS-POS'], created: '2026-01-15' },
    { id: 'DR-BAD', title: 'Rule found ineffective', version: '1', status: 'production', techniques: ['T1566'], requiredSources: ['TS-POS'], created: '2026-01-15' },
    { id: 'DR-STALE', title: 'Rule on a stale source', version: '1', status: 'production', techniques: ['T1071'], requiredSources: ['TS-OLD'], created: '2026-01-15' },
  ],
  tests: [
    { id: 'DT-RW', ruleId: 'DR-RW', ruleVersion: '3', date: '2026-06-10', tester: 'SOC lead', result: 'effective', method: 'replay' },
    { id: 'DT-IT', ruleId: 'DR-IT', ruleVersion: '2', date: '2026-10-20', tester: 'SOC lead', result: 'effective' },
    { id: 'DT-IT-OLDVER', ruleId: 'DR-IT', ruleVersion: '1', date: '2026-03-01', tester: 'SOC lead', result: 'effective' },
    { id: 'DT-BAD', ruleId: 'DR-BAD', date: '2026-05-01', tester: 'Red team', result: 'ineffective' },
    { id: 'DT-STALE', ruleId: 'DR-STALE', date: '2026-05-01', tester: 'SOC lead', result: 'effective' },
    { id: 'DT-NORES', ruleId: 'DR-UN', date: '2026-05-01', tester: 'x' },
  ],
  alerts: [
    { externalId: 'S9-1', sourceSystem: 'Fictional SIEM 9', title: 'Wiki page edited at night', ruleId: 'DR-BF', detected: '2026-10-11T03:00:00Z', severity: 'critical', asset: 'Intranet wiki' },
    { externalId: 'S9-2', sourceSystem: 'Fictional SIEM 9', title: 'Impossible travel on a payment administrator', ruleId: 'DR-IT', detected: '2026-10-11T22:05:00Z', severity: 'medium', asset: 'A-PAY', indicators: ['IND-DOM'],
      events: [{ ref: 'evt-7781', sourceId: 'TS-IDP', sourceTime: '2026-10-11T22:04:10Z', hash: 'sha256:abc' }], tlp: 'AMBER+STRICT' },
    { externalId: 'S9-3', sourceSystem: 'Fictional SIEM 9', title: 'Low alert', severity: 'low', triage: 'escalated' },
  ],
  indicators: [
    { id: 'IND-DOM', type: 'domain-name', value: 'login-example.test', validUntil: '2026-12-31', confidence: 70, confidenceMethod: 'STIX 2.1 confidence', source: 'ISAC', tlp: 'AMBER+STRICT' },
    { id: 'IND-OLD', value: '203.0.113.9', validUntil: '2025-12-31', confidence: 90, source: 'ISAC' },
  ],
  events: [{ id: 'EV-1', externalRef: 'evt-7781', sourceId: 'TS-IDP', observed: '2026-10-11T22:04:10Z', ocsfClass: 3002 }],
  gaps: [{ id: 'GAP-EDR', title: 'No server EDR telemetry', technique: 'T1078', source: 'TS-EDR' }],
};
const envText = JSON.stringify(ENV, null, 1);
const envFile = '/tmp/t17-siem-envelope.json'; fs.writeFileSync(envFile, envText);
await go('import');
await page.setInputFiles('#siem-imp-file', envFile);
await page.waitForTimeout(800);
R = await page.evaluate(async () => (await import('/js/siem.js')).reg());
const imp = R.imports.at(-1);
ok(imp.kind === 'envelope' && imp.file === 't17-siem-envelope.json', 'envelope detected from the file');
ok(imp.sha256 === crypto.createHash('sha256').update(envText).digest('hex'), 'import SHA-256 matches the file');
ok(imp.counts.sources === 4 && imp.counts.rules === 6 && imp.counts.tests === 5 && imp.counts.alerts === 3 && imp.counts.indicators === 2 && imp.counts.events === 1 && imp.counts.gaps === 1, 'counts ' + JSON.stringify(imp.counts));
ok(imp.errors.some(e => /DT-NORES/.test(e)), 'test without a result rejected with a message');
ok(await page.isVisible('#panel-siem >> text=Import history'), 'import history shown');
const s = R.sources.find(x => x.id === 'TS-IDP'), pos = R.sources.find(x => x.id === 'TS-POS');
ok(s.ocsfClass === 3002 && pos.ocsfClass === 1007 && R.sources.find(x => x.id === 'TS-EDR').ocsfClass === 1007, 'OCSF class normalised from name, caption and uid');
ok(R.alerts.every(a => a.ocsfClass === 2004), 'alerts normalised to OCSF Detection Finding');
ok(R.alerts.find(a => a.externalId === 'S9-3').triage === 'new', 'a file cannot set "escalated"');
ok(R.alerts.find(a => a.externalId === 'S9-1').tlp === 'AMBER' && R.alerts.find(a => a.externalId === 'S9-2').tlp === 'AMBER+STRICT', 'TLP default from the envelope, explicit kept');
ok(R.alerts.find(a => a.externalId === 'S9-2').ruleVersion === '2', 'alert keeps the rule version that fired');
const logs = await page.evaluate(async () => (await import('/js/logs.js')).entries('data').filter(e => e.action === 'SIEM import').length);
ok(logs >= 4, 'each import in LOG.data: ' + logs);

// ---------- coverage: validated only by an effective test on or before the as-of date ----------
const cov = await page.evaluate(async () => {
  const M = await import('/js/siem.js'); const out = {};
  for (const d of ['2026-06-01', '2026-10-12', '2026-10-20', '2026-10-22']) out[d] = Object.fromEntries(M.coverageMatrix(undefined, d).map(r => [`${r.scenario}|${r.technique}`, { status: r.status, why: r.rules.flatMap(x => x.why) }]));
  return out;
});
ok(cov['2026-10-12']['S2|T1486'].status === 'validated', 'S2/T1486 validated by an effective test (2026-06-10) on or before 2026-10-12');
ok(cov['2026-06-01']['S2|T1486'].status === 'untested', 'as of 2026-06-01 the test of 2026-06-10 does not count → untested');
ok(cov['2026-10-12']['S1|T1078'].status === 'degraded' && cov['2026-10-12']['S1|T1078'].why.some(w => /silent: TS-EDR/.test(w)), 'required telemetry silent → degraded (rule does not detect)');
ok(cov['2026-10-20']['S1|T1078'].status === 'degraded', 'still silent on 2026-10-20 even with the effective test that day');
ok(cov['2026-10-22']['S1|T1078'].status === 'validated', 'telemetry healthy again and effective test before as-of → validated');
ok(cov['2026-10-12']['S1|T1059'].status === 'untested', 'production rule with no test → untested, never validated');
ok(cov['2026-10-12']['|T1566'].status === 'degraded' && cov['2026-10-12']['|T1566'].why.some(w => /ineffective/.test(w)), 'latest test ineffective → degraded');
ok(cov['2026-10-12']['|T1110'].status === 'degraded', 'rule in testing → degraded, not validated');
ok(cov['2026-10-12']['|T1071'].status === 'degraded' && cov['2026-10-12']['|T1071'].why.some(w => /silent: TS-OLD/.test(w)), 'stale collection (last event > 3 cadences) → silent → degraded');
const verOnly = await page.evaluate(async () => { const M = await import('/js/siem.js'); const r = M.reg().rules.find(x => x.id === 'DR-IT'); return M.testsOf(r).map(t => t.id); });
ok(!verOnly.includes('DT-IT-OLDVER'), 'a test of version 1 does not validate version 2');
// a coverage assertion alone never validates
await page.evaluate(async () => { const M = await import('/js/siem.js'); M.reg().coverage.push({ id: 'COV-X', scenario: 'S1', technique: 'T1021', rules: [], note: 'claimed by vendor' }); });
const covX = await page.evaluate(async () => (await import('/js/siem.js')).coverageMatrix(undefined, '2026-10-22').find(r => r.technique === 'T1021').status);
ok(covX === 'missing', 'a coverage claim without a tested rule is missing, not validated');
// UI: matrix at an as-of date
await go('coverage');
await page.fill('#siem-asof', '2026-10-12'); await page.dispatchEvent('#siem-asof', 'change'); await page.waitForTimeout(400);
const nVal = await page.evaluate(() => document.querySelectorAll('#panel-siem tr.cov-validated').length);
const nDeg = await page.evaluate(() => document.querySelectorAll('#panel-siem tr.cov-degraded').length);
ok(nVal === 1 && nDeg >= 4, `coverage matrix as of 2026-10-12: ${nVal} validated, ${nDeg} degraded`);
await page.fill('#siem-asof', '2026-10-22'); await page.dispatchEvent('#siem-asof', 'change'); await page.waitForTimeout(400);
ok(await page.evaluate(() => document.querySelectorAll('#panel-siem tr.cov-validated').length) === 2, 'as of 2026-10-22: two validated pairs');
// record a gap from the matrix and raise a shared corrective action
const before = await page.evaluate(async () => (await import('/js/siem.js')).reg().gaps.length);
await page.click('#panel-siem tr.cov-untested button:has-text("Record gap")'); await page.waitForTimeout(300);
const gaps = await page.evaluate(async () => (await import('/js/siem.js')).reg().gaps);
ok(gaps.length === before + 1 && gaps.at(-1).technique === 'T1059' && gaps.at(-1).scenario === 'S1', 'gap recorded from the matrix');
await page.click('#panel-siem button:has-text("Corrective action") >> nth=-1'); await page.waitForTimeout(300);
const act = await page.evaluate(async () => { const SH = await import('/js/shared.js'); const M = await import('/js/siem.js'); const g = M.reg().gaps.at(-1); return { g, a: SH.actions().find(a => a.id === g.actions[0]) }; });
ok(act.a && act.a.source.kind === 'gap' && act.a.source.id === act.g.id && act.a.state === 'open', 'corrective action created in the shared register and linked to the gap');

// ---------- rule lifecycle ----------
const lc = await page.evaluate(async () => {
  const M = await import('/js/siem.js'); const R = M.reg();
  const draft = R.rules.find(r => r.status === 'draft'), bf = R.rules.find(r => r.id === 'DR-BF'), un = R.rules.find(r => r.id === 'DR-UN');
  return {
    draft: M.transitionError(draft, { ...draft, status: 'production', approvedBy: 'X' }),
    noTest: M.transitionError(bf, { ...bf, status: 'production', approvedBy: 'X' }),
    retired: M.transitionError({ status: 'retired' }, { status: 'testing' }),
    statusAt: [M.statusAt({ status: 'production', history: [{ date: '2026-03-01', from: 'draft', to: 'testing' }, { date: '2026-05-01', from: 'testing', to: 'production' }] }, '2026-04-01'),
      M.statusAt({ status: 'production', history: [{ date: '2026-03-01', from: 'draft', to: 'testing' }] }, '2026-02-01')],
  };
});
ok(/draft rule cannot be deployed/.test(lc.draft || ''), 'draft → production refused');
ok(/effective detection test/.test(lc.noTest || ''), 'testing → production refused without an effective test');
ok(/retired rule stays retired/.test(lc.retired || ''), 'retired rule cannot come back');
ok(lc.statusAt[0] === 'testing' && lc.statusAt[1] === 'draft', 'status read at an as-of date from the history');
// through the form: put the testing rule DR-BF in production after an effective test, owner ≠ approver
await page.evaluate(async () => { const M = await import('/js/siem.js'); M.reg().tests.push({ id: 'DT-BF', ruleId: 'DR-BF', ruleVersion: '1', date: '2026-10-01', tester: 'SOC lead', result: 'effective' }); const r = M.reg().rules.find(x => x.id === 'DR-BF'); r.owner = 'Dana'; });
await go('rules');
await page.click('#panel-siem tr:has-text("DR-BF") button:has-text("Open")');
await page.selectOption('.modal select >> nth=1', 'production');
await page.fill('.modal .field:has-text("Deployment approved by") input', 'dana');
await page.click('.modal button:text-is("Save")'); await page.waitForTimeout(200);
ok(await page.isVisible('.modal >> text=cannot approve its deployment'), 'owner cannot approve the deployment of their rule');
ok(await page.isVisible('.modal >> text=Independence cannot be verified in single-user mode'), 'single-user independence warning in the form');
await page.fill('.modal .field:has-text("Deployment approved by") input', 'Sam (SOC lead)');
await page.click('.modal button:text-is("Save")'); await page.waitForTimeout(300);
const bf = await page.evaluate(async () => (await import('/js/siem.js')).reg().rules.find(x => x.id === 'DR-BF'));
ok(bf.status === 'production' && bf.history.at(-1).from === 'testing' && bf.history.at(-1).to === 'production' && bf.approvedOn, 'testing → production recorded with approval');
const approvedLog = await page.evaluate(async () => (await import('/js/logs.js')).entries('data').some(e => e.action === 'detection rule approved for production' && e.target === 'DR-BF'));
ok(approvedLog, 'approval logged');

// ---------- alerts: import CSV, dedup, crown jewels first, triage, escalation ----------
const CSV = 'external_id,source_system,title,rule_id,detected,severity,asset,techniques,tlp\nC-1,Fictional SIEM 9,Admin login from new device,DR-IT,2026-10-12T09:00:00Z,low,Payment service,T1078,GREEN\nC-2,Fictional SIEM 9,Malware on wiki host,,2026-10-12T10:00:00Z,high,A-WIKI,,\n';
fs.writeFileSync('/tmp/t17-alerts.csv', CSV);
await go('alerts');
ok(await page.isVisible('#panel-siem >> text=An alert is never an incident'), 'banner: an alert is never an incident');
await page.setInputFiles('#siem-alert-file', '/tmp/t17-alerts.csv'); await page.waitForTimeout(700);
R = await page.evaluate(async () => (await import('/js/siem.js')).reg());
ok(R.alerts.length === 5 && R.imports.at(-1).kind === 'alerts-csv', 'CSV alerts imported: ' + R.alerts.length);
const c1 = R.alerts.find(a => a.externalId === 'C-1');
ok(c1.tlp === 'GREEN' && c1.ruleId === 'DR-IT' && JSON.stringify(c1.techniques) === '["T1078"]', 'CSV fields');
// dedup + original never overwritten
const orig = R.alerts.find(a => a.externalId === 'S9-2').original;
const edited = JSON.parse(envText); edited.alerts[1].title = 'CHANGED TITLE'; edited.alerts[1].severity = 'critical';
rec = await page.evaluate(async t => (await import('/js/siem.js')).importText(t, { fileName: 'replay.json' }), JSON.stringify(edited));
R = await page.evaluate(async () => (await import('/js/siem.js')).reg());
const s92 = R.alerts.find(a => a.externalId === 'S9-2');
ok(R.alerts.length === 5 && rec.counts.duplicates >= 3, 'duplicate deliveries create no new alert');
ok(s92.title === 'Impossible travel on a payment administrator' && s92.original === orig, 'the original alert is never overwritten');
// crown jewel first in the queue
await page.selectOption('#siem-alert-filter', 'all'); await page.waitForTimeout(300);
const firstRows = await page.evaluate(() => [...document.querySelectorAll('#panel-siem table tbody tr')].slice(0, 2).map(tr => tr.textContent));
ok(/Crown jewel/.test(firstRows[0]) && /Crown jewel/.test(firstRows[1]), 'crown-jewel alerts first (even when less severe)');
const order = await page.evaluate(async () => (await import('/js/siem.js')).triageQueue().map(x => x.a.externalId + (x.crown ? '*' : '')));
ok(order.indexOf('S9-1') > order.indexOf('C-1*'), 'a critical alert on the wiki comes after a low alert on a crown jewel ' + order.join(','));
// triage
const s91id = R.alerts.find(a => a.externalId === 'S9-1').id;
await page.selectOption(`#panel-siem tr:has-text("${s91id}") select.siem-triage`, 'false-positive'); await page.waitForTimeout(300);
ok(await page.evaluate(async id => (await import('/js/siem.js')).reg().alerts.find(a => a.id === id).triage, s91id) === 'false-positive', 'triage state recorded');
// escalation
const incBefore = await page.evaluate(async () => JSON.stringify((await import('/js/state.js')).S.ws.csm?.incidents || []));
await page.click(`#panel-siem [data-escalate="${s92.id}"]`); await page.waitForTimeout(300);
const esc = await page.evaluate(async id => { const st = await import('/js/state.js'); const M = await import('/js/siem.js'); return { cases: st.S.ws.soar.cases, a: M.reg().alerts.find(x => x.id === id) }; }, s92.id);
const cs = esc.cases.find(x => x.source?.id === s92.id);
ok(cs && cs.source.kind === 'alert' && cs.status === 'open' && cs.opened && cs.severity === 'medium' && JSON.stringify(cs.alerts) === JSON.stringify([s92.id]) && Array.isArray(cs.timeline) && cs.title === s92.title && /^CASE-/.test(cs.id), 'SOAR case record with the agreed fields ' + JSON.stringify(cs));
ok(esc.a.triage === 'escalated' && esc.a.caseId === cs.id, 'alert escalated and linked to its case');
const again = await page.evaluate(async id => { const M = await import('/js/siem.js'); const a = M.reg().alerts.find(x => x.id === id); const r = M.escalate(a); const st = await import('/js/state.js'); return { reused: r.reused, n: st.S.ws.soar.cases.filter(c => c.source?.id === id).length }; }, s92.id);
ok(again.reused && again.n === 1, 'escalating twice reuses the case (idempotent)');
ok(await page.evaluate(async () => JSON.stringify((await import('/js/state.js')).S.ws.csm?.incidents || [])) === incBefore, 'escalation creates no incident');
// alert details
await page.click(`#panel-siem tr:has-text("${s92.id}") button:has-text("Open")`); await page.waitForTimeout(200);
ok(await page.isVisible('.modal >> text=An indicator match is not an attribution'), 'matched indicator shown as not an attribution');
ok(await page.isVisible('.modal >> text=evt-7781'), 'event pointer shown');
await page.keyboard.press('Escape');

// ---------- STIX 2.1 bundle: indicators, sightings, TLP 2.0 ----------
const BUNDLE = { type: 'bundle', id: 'bundle--1', objects: [
  { type: 'identity', id: 'identity--isac', name: 'Sector ISAC', identity_class: 'organization' },
  { type: 'marking-definition', id: 'marking-definition--custom-red', name: 'TLP:RED', definition_type: 'statement', definition: { statement: 'x' } },
  { type: 'indicator', id: 'indicator--a', name: 'C2 server', pattern: "[ipv4-addr:value = '198.51.100.7']", pattern_type: 'stix', valid_from: '2026-10-01T00:00:00Z', valid_until: '2026-12-31T00:00:00Z', confidence: 85, created_by_ref: 'identity--isac',
    object_marking_refs: ['marking-definition--e828b379-4e03-4974-9ac4-e53a884c97c1'] },
  { type: 'indicator', id: 'indicator--b', name: 'Phish domain', pattern: "[domain-name:value = 'evil.example']", pattern_type: 'stix', valid_from: '2026-10-01T00:00:00Z', confidence: 40,
    object_marking_refs: ['marking-definition--939a9414-2ddd-4d32-a0cd-375ea402b003'] },
  { type: 'indicator', id: 'indicator--c', name: 'Payload hash', pattern: "[file:hashes.'SHA-256' = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa']", pattern_type: 'stix', valid_from: '2026-10-01T00:00:00Z',
    object_marking_refs: ['marking-definition--34098fce-860f-48ae-8e50-ebd3cc5e41da'] },
  { type: 'indicator', id: 'indicator--d', name: 'Custom red', pattern: "[url:value = 'https://bad.example/x']", pattern_type: 'stix', valid_from: '2026-10-01T00:00:00Z', object_marking_refs: ['marking-definition--custom-red'] },
  { type: 'indicator', id: 'indicator--e', name: 'Unmarked', pattern: "[domain-name:value = 'plain.example']", pattern_type: 'stix', valid_from: '2026-10-01T00:00:00Z' },
  { type: 'sighting', id: 'sighting--1', sighting_of_ref: 'indicator--a', first_seen: '2026-10-11T10:00:00Z', last_seen: '2026-10-11T11:00:00Z', count: 3, where_sighted_refs: ['identity--isac'] },
  { type: 'malware', id: 'malware--x', name: 'ignored', is_family: true },
] };
fs.writeFileSync('/tmp/t17-bundle.json', JSON.stringify(BUNDLE));
await go('import');
await page.selectOption('#siem-imp-tlp', 'GREEN');
await page.setInputFiles('#siem-imp-file', '/tmp/t17-bundle.json'); await page.waitForTimeout(700);
R = await page.evaluate(async () => (await import('/js/siem.js')).reg());
const byStix = id => R.indicators.find(i => i.stixId === id);
ok(R.imports.at(-1).kind === 'stix' && R.imports.at(-1).counts.indicators === 5 && R.imports.at(-1).counts.sightings === 1 && R.imports.at(-1).counts.skipped === 1, 'STIX bundle counts ' + JSON.stringify(R.imports.at(-1).counts));
ok(byStix('indicator--a').tlp === 'RED' && byStix('indicator--b').tlp === 'AMBER+STRICT' && byStix('indicator--c').tlp === 'GREEN' && byStix('indicator--d').tlp === 'RED', 'TLP 2.0 / 1.0 marking ids and inline marking definitions');
ok(byStix('indicator--e').tlp === 'GREEN', 'unmarked object takes the TLP chosen in the import screen');
ok(byStix('indicator--a').value === '198.51.100.7' && byStix('indicator--a').type === 'ipv4-addr' && byStix('indicator--c').type === 'file:sha256', 'pattern → type and value');
ok(byStix('indicator--a').confidence === 85 && /not|as stated|STIX/.test(byStix('indicator--a').confidenceMethod) && byStix('indicator--a').source === 'Sector ISAC', 'source confidence kept 0–100 with its method and source');
ok(byStix('indicator--a').sightings.length === 1 && R.alerts.some(a => a.externalId === 'sighting--1' && a.indicators.includes(byStix('indicator--a').id) && a.triage === 'new'), 'sighting attached to its indicator and queued as an alert to triage');
ok(await page.evaluate(async () => JSON.stringify((await import('/js/state.js')).S.ws.assessment.SCEN.map(s => s.params))) === paramsBefore, 'no scenario parameter changed (confidence never feeds a likelihood)');

// ---------- Indicators & TLP screen, TLP-aware export ----------
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.iocWatch = [{ type: 'domain-name', value: 'login-example.test', src: 'otx', added: '2026-10-01', status: 'watch' }, { type: 'domain', value: 'feed-only.example', src: 'otx', added: '2026-10-01', status: 'watch' }, { type: 'domain', value: 'mine.example', src: 'analyst', added: '2026-10-01', status: 'watch' }]; st.touch(); });
await go('intel');
await page.fill('#siem-asof', '2026-10-12'); await page.dispatchEvent('#siem-asof', 'change'); await page.waitForTimeout(600);
ok(await page.isVisible('#panel-siem >> text=Confidence is not a probability'), 'confidence banner');
const pills = await page.evaluate(() => [...document.querySelectorAll('#panel-siem .pill')].map(p => p.textContent).filter(t => t.startsWith('TLP:')));
ok(['TLP:RED', 'TLP:AMBER+STRICT', 'TLP:GREEN', 'TLP:AMBER'].every(t => pills.includes(t)), 'TLP shown on indicators: ' + [...new Set(pills)].join(' '));
ok(await page.isVisible('#panel-siem >> text=Stale — no inference'), 'expired indicator shown as stale');
await page.waitForSelector('#siem-merge-csv');
const merged = await page.evaluate(async () => { const A = await import('/js/panels/siem_alerts.js'); const st = await import('/js/state.js'); return A.mergeRows(st.S.ws, new Map(), '2026-10-12'); });
const mr = v => merged.find(r => r.value === v);
ok(mr('login-example.test').siem && mr('login-example.test').watch && mr('login-example.test').tlp === 'AMBER+STRICT', 'merge view joins SIEM indicator and IOC watch entry; the marking wins');
ok(mr('feed-only.example').tlp === 'CLEAR' && /assumed/.test(mr('feed-only.example').tlpNote) && mr('mine.example').tlp === 'AMBER', 'unmarked feed items assumed CLEAR, analyst entries AMBER — shown as assumed');
// export: asks; "without them" drops RED and AMBER+STRICT
let [dl] = await Promise.all([page.waitForEvent('download'), (async () => { await page.click('#siem-ind-csv'); await page.click('#tlp-exclude'); })()]);
let txt = fs.readFileSync(await dl.path(), 'utf8');
ok(!/198\.51\.100\.7|evil\.example|login-example\.test|bad\.example/.test(txt) && /plain\.example/.test(txt) && /^tlp,/.test(txt), 'export without TLP:RED / AMBER+STRICT items');
[dl] = await Promise.all([page.waitForEvent('download'), (async () => { await page.click('#siem-ind-csv'); await page.click('#tlp-mark'); })()]);
txt = fs.readFileSync(await dl.path(), 'utf8');
ok(/TLP:RED,IND-\d+,ipv4-addr,198\.51\.100\.7/.test(txt) && /contains-TLP-RED-or-AMBER-STRICT/.test(dl.suggestedFilename()), 'kept items marked in the TLP column and in the file name');
const fx = await page.evaluate(async () => { const M = await import('/js/siem.js'); return [M.normTlp('tlp:white'), M.normTlp('TLP:AMBER+STRICT'), M.normTlp('amber + strict'), M.normTlp('purple')]; });
ok(JSON.stringify(fx) === '["CLEAR","AMBER+STRICT","AMBER+STRICT",""]', 'TLP labels normalised ' + JSON.stringify(fx));

// ---------- sources: health at a date, record an observation ----------
await go('sources');
await page.fill('#siem-asof', '2026-10-12'); await page.dispatchEvent('#siem-asof', 'change'); await page.waitForTimeout(300);
ok(await page.isVisible('#panel-siem tr:has-text("TS-EDR") >> text=Silent'), 'TS-EDR silent as of 2026-10-12');
ok(await page.isVisible('#panel-siem tr:has-text("TS-OLD") >> text=stale'), 'stale collection flagged');
await page.click('#panel-siem tr:has-text("TS-POS") button:has-text("Record health")');
await page.fill('.modal input[type=date]', '2026-10-05'); await page.selectOption('.modal select', 'silent');
await page.click('.modal button:text-is("Save")'); await page.waitForTimeout(300);
const posCov = await page.evaluate(async () => (await import('/js/siem.js')).coverageMatrix(undefined, '2026-10-12').find(r => r.technique === 'T1486' && r.scenario === 'S2').status);
ok(posCov === 'degraded', 'recording POS syslog silent makes the ransomware coverage degraded');

// ---------- dashboard ----------
await go('dashboard');
await page.fill('#siem-asof', '2026-10-12'); await page.dispatchEvent('#siem-asof', 'change'); await page.waitForTimeout(300);
ok(await page.isVisible('#panel-siem >> text=Silent telemetry') && await page.isVisible('#panel-siem >> text=Top of the triage queue'), 'overview: silent telemetry and triage queue');
const sum = await page.evaluate(async () => (await import('/js/siem.js')).summary(undefined, '2026-10-12'));
ok(sum.health.silent >= 2 && sum.alerts.crownOpen >= 1 && sum.indicators.restricted >= 3, 'summary ' + JSON.stringify(sum));

ok(!errors.length, 'no console error: ' + errors.join(' | '));
await browser.close(); done('t17 siem');
