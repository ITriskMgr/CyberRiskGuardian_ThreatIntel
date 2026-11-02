// CRGO 0.11.0 (proposed) in the application, against the real ontology at CRGO_HOME: the snapshot's release and status,
// the six scenario patterns end to end (batch archetype → register → organisation graph 'has scenario pattern'), the AI
// answer path, the scenario editor, CIS v8.1 safeguards with CRGO labels, applicability with technologies in use
// (browser port = CRGO's evaluator), and the consultant's citations. Skipped when CRGO_RELEASE is older than 0.11.
import { open, ok, done, CRGO, ORG, CRGO_RELEASE, CRGO_011 } from './lib.mjs';
import fs from 'fs';
const { browser, page, errors } = await open('#/process');
if (!CRGO_011) { ok(true, `CRGO_RELEASE ${CRGO_RELEASE}: the 0.11 suite does not apply`); await browser.close(); done('t50 crgo 0.11'); }

const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const D = await import('/js/dss.js'); const C = await import('/js/crgo.js');
  const PAT = await import('/js/data/scenpatterns.js'); const B = await import('/js/panels/batch.js'); const K = await import('/js/catalog.js');
  const out = {};
  const snap = await C.snapshot();
  out.snap = { release: snap.release, onto: snap.ontologyRelease, status: snap.status, note: snap.statusNote, built: snap.built, n: snap.scenarios.length,
    pats: (snap.v011?.patterns || []).map(p => ({ id: p.id, en: p.label.en, fr: p.label.fr, status: p.status,
      tech: p.links.filter(l => l.kind === 'technique').map(l => l.target), cwe: p.links.filter(l => l.kind === 'weakness').map(l => l.target) })),
    cis: snap.v011?.cis81?.safeguards?.length, unverified: (snap.v011?.cis81?.safeguards || []).filter(s => s.unverified).length,
    inst: Object.fromEntries((snap.legal?.instruments || []).map(i => [i.id, i.status])), techs: (snap.legal?.technologies || []).map(t => t.key),
    dupConditions: (snap.legal?.instruments || []).some(i => new Set(i.conditions.map(c => c.id)).size !== i.conditions.length) };
  out.mod = PAT.CRGO_PATTERNS.map(p => ({ id: p.id, name: p.name, attack: p.attack, cwe: p.cwe }));
  out.batch = B.PATTERNS.filter(p => p.scenPattern).map(p => ({ key: p.key, id: p.scenPattern, attack: p.attack, cwe: p.cwe, score: CVSS4.score(p.cvss), known: p.attack.every(t => self.CRG_KB.tech[t]) && p.cwe.every(c => self.CRG_KB.cwe[c]) }));
  out.valid = [PAT.valid('crgo_0001393'), PAT.valid('PatAISupplyChain'), PAT.valid('https://w3id.org/crgo/CRGO_0001389'), PAT.valid('CRGO_0000023'), PAT.valid('')];
  // the AI scenario prompt lists the six patterns and asks for "pattern"
  const AI = await import('/js/ai.js');
  const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id);
  const prompt = AI.TASKS?.scenarios?.build ? AI.TASKS.scenarios.build(st.S.ws, { count: 3 }).prompt : '';
  out.prompt = { has: PAT.CRGO_PATTERNS.every(p => prompt.includes(p.id)), field: prompt.includes('"pattern"'), len: prompt.length };
  // CIS v8.1 safeguards in the control catalogue: CRGO labels, identifiers, flagged values
  const cis = K.controls().filter(c => c.fw === 'CIS81');
  const s54 = cis.find(c => c.key === 'CIS81:5.4'), s185 = cis.find(c => c.key === 'CIS81:18.5'), c5 = cis.find(c => c.key === 'CIS81:CIS 5');
  out.cis = { n: cis.length, ctl: cis.filter(c => !c.enh).length, s54: s54 && { title: s54.title, note: s54.note, enh: s54.enh, fn: s54.fn },
    unverified: cis.filter(c => /unverified \(CRGO REVIEW\)/.test(c.note || '')).length, s185: !!s185, c5: !!c5,
    labelsMatch: cis.filter(c => c.enh).every(c => snap.v011.cis81.safeguards.find(s => s.id === c.id)?.label.en === c.title) };
  // applicability with technologies in use: local port vs CRGO's evaluator through the helper
  const ws = st.S.ws;
  ws.grc.profile = { orgTypes: ['OrgEnterprise'], establishedIn: ['JurQuebec'], offersServicesIn: [], monitorsBehaviourIn: [], technologies: ['TechAIAgents', 'TechWebApplication'],
    activities: [{ id: 'PA-001', name: 'Patient care', dataCategories: ['DataHealth'], dataSubjectsIn: ['JurQuebec'], transfersTo: [] }], complete: ['hasOrganisationType', 'usesTechnology'] };
  ws.crgo.base = 'https://example.org/crgo-sample/medibec-011/'; ws.crgo.label = 'MediBec (fictional, CRGO 0.11)';
  out.local = D.evaluate(ws.grc.profile, new Date().toISOString().slice(0, 10), snap.legal);
  // a scenario of the register carries a pattern: facts and the organisation graph
  const s1 = ws.assessment.SCEN.find(s => s.id === 'S1'); const before = s1.scenPattern; s1.scenPattern = 'CRGO_0001392';
  out.facts = D.facts(ws).patterns;
  st.touch();
  const g = await D.buildGraph(ws); out.graph = g.error ? g : { est: Math.round(g.totals.est), res: Math.round(g.totals.res), release: g.release };
  const help = await D.applicabilityViaHelper(ws); out.helper = help.states;
  out.wsid = ws.id;
  if (before === undefined) delete s1.scenPattern; else s1.scenPattern = before;
  ws.grc.profile.technologies = []; st.touch(); await st.saveNow();
  return out;
});

ok(r.snap.release === CRGO_RELEASE && r.snap.onto === CRGO_RELEASE && r.snap.status === 'proposed' && /approval/.test(r.snap.note || '') && r.snap.n === 1884,
  `snapshot: CRGO ${CRGO_RELEASE}, status proposed with its note, 1,884 scenarios ` + JSON.stringify({ ...r.snap, pats: undefined, inst: undefined }));
ok(!r.snap.dupConditions, 'legal conditions are listed once each in the snapshot');
ok(r.snap.cis === 153 && r.snap.unverified === 39 && r.snap.techs.includes('TechAIAgents'), 'snapshot: 153 CIS v8.1 safeguards (39 unverified) and the technology vocabulary');
ok(['CCSPA', 'ISO-IEC-27701-2025', 'ISO-IEC-42001-2023', 'OWASP-TOP10-2025', 'OWASP-LLM-2025', 'OWASP-AGENTIC-2026'].every(k => r.snap.inst[k] === 'proposed') && r.snap.inst['P-39.1'] === 'approved',
  'the 0.11 instruments are proposed, Loi 25 stays approved ' + JSON.stringify(r.snap.inst));
// the app's six patterns are CRGO's, with CRGO's labels and only links CRGO proposes
const same = r.mod.length === 6 && r.mod.every(m => { const s = r.snap.pats.find(p => p.id === m.id); return s && s.status === 'proposed' && m.name.toLowerCase().startsWith(s.en.toLowerCase())
  && m.attack.every(t => s.tech.includes(t)) && m.cwe.every(c => s.cwe.includes(c)); });
ok(same && r.snap.pats.length === 6, 'scenario patterns CRGO_0001389–0001394: identifiers, labels and ATT&CK/CWE links match CRGO 0.11.0 ' + JSON.stringify(r.snap.pats.map(p => p.id + ' ' + p.en)));
ok(r.batch.length === 6 && new Set(r.batch.map(b => b.id)).size === 6 && r.batch.every(b => b.score > 0 && b.known), 'batch: six pattern archetypes, one per CRGO pattern, valid CVSS v4.0 vectors, ATT&CK/CWE in the bundled KB ' + JSON.stringify(r.batch));
ok(r.valid.join('|') === 'CRGO_0001393|CRGO_0001394|CRGO_0001389||', 'pattern identifiers are checked against the six (case, key, IRI; others refused) ' + r.valid.join('|'));
ok(r.prompt.has && r.prompt.field, 'the AI scenario prompt lists the six patterns and asks for "pattern" ' + JSON.stringify(r.prompt));
ok(r.cis.n === 171 && r.cis.ctl === 18 && r.cis.s54?.title === 'Use separate admin accounts' && r.cis.s54.enh && /CRGO 0\.11\.0 label \(proposed/.test(r.cis.s54.note) && r.cis.s185 && r.cis.c5,
  'catalogue: CIS v8.1 = 18 controls + 153 safeguards with CRGO labels ' + JSON.stringify(r.cis.s54));
ok(r.cis.unverified === 39 && r.cis.labelsMatch, 'catalogue: every safeguard title is CRGO\'s own label; the 39 REVIEW values are marked unverified');
const states = o => JSON.stringify(Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [k, v.state]).sort()));
ok(states(r.local) === states(r.helper), 'applicability with technologies in use: browser port agrees with CRGO\'s evaluator ' + states(r.helper));
ok(r.local['OWASP-AGENTIC-2026'].state === 'PotentiallyApplicable' && r.local['OWASP-TOP10-2025'].state === 'PotentiallyApplicable' && r.local['OWASP-LLM-2025'].state === 'NotApplicable'
  && r.local['ISO-IEC-42001-2023'].state === 'NotApplicable', 'voluntary standards are at most potentially applicable; a technology not listed (complete) makes them not applicable ' + states(r.local));
ok(r.local['CCSPA'].state !== 'Applicable', 'CCSPA: designated-operator condition is interpretive, never plainly applicable ' + r.local['CCSPA'].state);
ok(JSON.stringify(r.facts) === JSON.stringify({ S1: 'CRGO_0001392' }), 'facts carry has-scenario-pattern per scenario ' + JSON.stringify(r.facts));
ok(!r.graph.error && r.graph.est === 84305 && r.graph.res === 41023 && r.graph.release?.tag === CRGO_RELEASE && r.graph.release?.status === 'proposed',
  'organisation graph through CRGO 0.11.0 still reproduces 84,305 / 41,023; release status proposed ' + JSON.stringify(r.graph).slice(0, 300));
const facts = fs.existsSync(`${ORG}/${r.wsid}/orgfacts.ttl`) ? fs.readFileSync(`${ORG}/${r.wsid}/orgfacts.ttl`, 'utf8') : '';
ok(/scenario-S1>?\s[^.]*CRGO_0001478[^.]*CRGO_0001392/s.test(facts) || (facts.includes('CRGO_0001478') && facts.includes('CRGO_0001392')), 'orgfacts.ttl: scenario S1 has scenario pattern CRGO_0001392');
ok(facts.includes('CRGO_0001479') && facts.includes('CRGO_0001400'), 'orgfacts.ttl: the organisation uses technology "AI agents" (CRGO_0001479 → CRGO_0001400)');

// batch → register: a pattern row keeps its pattern; the AI path keeps a valid pattern and drops an invented one
const reg = await page.evaluate(async () => {
  const st = await import('/js/state.js');
  const ws = st.newWorkspace({ name: 'CRGO 0.11 patterns (test)' }); await st.create(ws); await st.select(ws.id);
  const base = { pick: true, statement: 'x', threat_source: 'Cybercriminal', assets: 'Agent platform', vulns: 'w', attack: [], cwe: [], cves: [],
    params: { PbA: 0.5, Pbx: 0.5, De: 0.5, Dm: 0.8, Th: 0.5, Mu: 0.7 }, cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N', red_p: 0.6, red_i: 0.6 };
  st.S.ws.batchDraft = [{ ...base, name: 'Prompt injection row', scenPattern: 'CRGO_0001393' }, { ...base, name: 'Invented pattern row', scenPattern: 'CRGO_0009999' }, { ...base, name: 'Plain row' }];
  st.touch(); location.hash = '#/batch'; return ws.id;
});
await page.waitForTimeout(800);
ok(await page.locator('#panel-batch >> text=Pattern: Prompt injection in agent workflows (CRGO_0001393)').count() > 0, 'batch grid shows the row\'s CRGO pattern');
await page.click('#panel-batch button:has-text("Add 3 selected to the register")');
await page.waitForTimeout(400);
const after = await page.evaluate(async () => { const st = await import('/js/state.js'); return st.S.ws.assessment.SCEN.map(s => [s.name, s.scenPattern ?? null]); });
ok(JSON.stringify(after) === JSON.stringify([['Prompt injection row', 'CRGO_0001393'], ['Invented pattern row', null], ['Plain row', null]]), 'register: the pattern travels with the scenario; an unknown identifier is dropped ' + JSON.stringify(after));
// scenario editor → Ontology card shows and edits the pattern
const sid = await page.evaluate(async () => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN[0]; location.hash = '#/scenario/' + s.id; return s.id; });
// 1.9.0 Atlas: the editor is tabbed — the pattern lives in the "Ontology · CRGO" tab, which must render it
await page.waitForSelector('#scen-tab-onto', { timeout: 15000 });
await page.click('#scen-tab-onto');
await page.waitForSelector('#scen-panel-onto:not([hidden])', { state: 'visible', timeout: 15000 });
const onto = page.locator('#scen-panel-onto');
ok(await page.locator('#scen-tab-onto').getAttribute('aria-selected') === 'true'
  && await onto.locator('text=Scenario pattern (CRGO 0.11.0, proposed)').first().isVisible() && await onto.locator('text=CRGO_0001478').first().isVisible()
  && await onto.locator('select:has(option[value="CRGO_0001391"])').isVisible(),
  'scenario editor, Ontology · CRGO tab: the pattern picker renders with its identifier and has-scenario-pattern');
await onto.locator('select:has(option[value="CRGO_0001391"])').selectOption('CRGO_0001391');
await page.waitForTimeout(400);
const edited = await page.evaluate(async id => { const st = await import('/js/state.js'); return st.S.ws.assessment.SCEN.find(s => s.id === id).scenPattern; }, sid);
ok(edited === 'CRGO_0001391', 'the analyst can set the pattern in the editor ' + edited);
// Ontology · CRGO → Connection names the proposed release and the 0.11 additions
await page.evaluate(() => { location.hash = '#/ontology/connection'; });
ok(await page.waitForSelector(`#panel-ontology >> text=CRGO v${CRGO_RELEASE} is a proposed release`, { timeout: 20000 }).then(() => true, () => false), 'Connection: proposed-release banner');
ok(await page.locator('#panel-ontology >> text=153 safeguards with CRGO labels').count() > 0, 'Connection: the snapshot card lists the CRGO 0.11.0 additions');
await page.evaluate(async () => { const st = await import('/js/state.js'); await st.remove(st.S.ws.id); });
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t50 crgo 0.11');
