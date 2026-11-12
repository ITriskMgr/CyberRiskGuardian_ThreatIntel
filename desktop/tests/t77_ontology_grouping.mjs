// t77 — ontology grouping, validation and proposals (1.9.3, W2; CRGO 0.11.2, contract library-proposal/v1). Part 1 (logic):
//  · the browser port js/crgo_group.js replays EVERY case of CRGO's golden file (MediBec 45 at M and L, synthetic cases with and
//    without the local extension, ten validations) to deep equality, on the snapshot shipped with the application (same data
//    fingerprint as the golden file);
//  · toDescriptor maps the application's MediBec screening (+ the mapping recorded in the golden file) to the golden inputs;
//  · determinism: shuffled input → same output; MCP server (through the helper) = snapshot on the MediBec 45 and on validations
//    (skipped with a message only when the ontology server cannot start);
//  · toBatchRow reads CWE from the snapshot's `cwe` (bug of 1.9.2: read from `weaknesses`, never carried, vulns "undefined");
//  · proposals through the helper: server path and file path (server switched off) write the same store; approval refused to a
//    non-administrator in multi-user mode; approved additions served to the browser and used by grouping on both paths;
//    contribution file only in the Folder for ontology proposals (message when unset);
//  · QC-33 is attention at most, never fail.
// Part 2 (the W2 screens) is added by the UI workstream.
import { open, ok, done, CRGO, ORG, TMP, FIXTURES, CRGO_RELEASE, URL, apiHeaders } from './lib.mjs';
import fs from 'fs';
import path from 'path';

const goldenPath = [path.join(CRGO, 'contracts', 'library-proposal', 'v1', 'examples', 'golden-grouping.json'), path.join(FIXTURES, 'crgo-0.11.2-golden-grouping.json')]
  .find(p => fs.existsSync(p));
const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
fs.rmSync(path.join(ORG, '_installation'), { recursive: true, force: true });   // this run's installation store starts empty
const OUT = path.join(TMP, 'ontology-proposals'); fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });

const { browser, page, errors } = await open('#/process');

/* ---------------- 1. golden replay in the browser (snapshot path) ---------------- */
const g1 = await page.evaluate(async golden => {
  const CG = await import('/js/crgo_group.js'); const C = await import('/js/crgo.js');
  const snap = await C.snapshot();
  const fp = CG.sha256(CG.canonical({ grouping: snap.grouping, records: snap.scenarios.map(s => [s.id, s.cluster ?? null, s.primary_theme ?? null]).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)) }));
  const cases = golden.cases.map(c => {
    const local = c.local ? golden.local_extension.scenarios : [];
    const r = c.tool === 'crgo_group_candidates' ? C.LOCAL.crgo_group_candidates({ candidates: c.input, min_confidence: c.min_confidence }, snap, local)
      : C.LOCAL.crgo_validate_scenario({ scenario: c.input, min_confidence: c.min_confidence }, snap, local);
    return { id: c.id, same: CG.canonical(r) === CG.canonical(c.expected) };
  });
  // shuffled input, same output (order-free ids, sorted output)
  const inp = golden.cases[0].input, shuffled = [...inp].reverse().map((c, i, a) => a[(i * 7) % a.length]);
  const a = CG.groupTool({ candidates: inp }, snap), b = CG.groupTool({ candidates: shuffled }, snap);
  // bad shapes: error documents, never exceptions
  const bad = CG.groupTool({ candidates: [{ ref: 'C1', name: 'x', PbA: 0.4 }] }, snap);
  const dup = CG.groupTool({ candidates: [{ ref: 'C1', name: 'x' }, { ref: 'C1', name: 'y' }] }, snap);
  const conf = CG.validateTool({ scenario: { name: 'x' }, min_confidence: 'Z' }, snap);
  return { schema: snap.schema, release: snap.release, fp, cases, shuffledSame: CG.canonical(a) === CG.canonical(b), bad, dup, conf,
    usable: CG.usable(snap) };
}, golden);
ok(g1.schema === 'crg-crgo-snapshot/3' && g1.release === CRGO_RELEASE && g1.usable, `snapshot schema /3, release ${g1.release}, grouping block present`);
ok(g1.fp === golden.data_fingerprint, 'snapshot data fingerprint = golden file (same grouping block, clusters and primary themes): ' + g1.fp.slice(0, 12));
for (const c of g1.cases) ok(c.same, 'golden case ' + c.id + ' deep-equal (browser port, snapshot)');
ok(g1.cases.length === golden.cases.length && golden.cases.length === 14, 'all 14 golden cases replayed (4 grouping, 10 validation)');
ok(g1.shuffledSame, 'shuffled MediBec input gives the same grouping');
ok(g1.bad.error && g1.bad.code === 'INVALID_ARGUMENT' && /fields not allowed: PbA/.test(g1.bad.message), 'a parameter in a candidate is refused (INVALID_ARGUMENT): ' + g1.bad.message);
ok(g1.dup.error && /duplicate ref/.test(g1.dup.message), 'duplicate refs refused');
ok(g1.conf.error && /min_confidence/.test(g1.conf.message), 'unknown min_confidence refused');

/* ---------------- 2. toDescriptor: the application's MediBec screening → the golden inputs ---------------- */
const td = await page.evaluate(async golden => {
  const CG = await import('/js/crgo_group.js'); const O = await import('/js/ontology.js');
  const rows = self.CRG_MEDIBEC.CANDIDATES;
  const got = rows.map(r => CG.toDescriptor(r, null, { mapping: golden.medibec_mapping }));
  const exp = golden.cases[0].input;
  const diff = got.filter((g, i) => CG.canonical(g) !== CG.canonical(exp[i])).map(g => g.ref);
  // a kept Batch draft wins: CRGO id, themes, terms, techniques and CWE; nothing outside the schema
  const d = CG.toDescriptor(['C99', 'Phishing of staff', 'Negligent or careless insider', '', 'Mail'], { statement: 'A careless clerk is phished.', attack: ['T1566'], cwe: ['CWE-1021'],
    crgo: { id: 'LIB-F0001', themes: ['ThemeSocialEng'] }, params: { PbA: { v: 0.4 } } }, { sources: O.THREAT_SOURCES, assets: [{ name: 'Mail', type: 'application' }] });
  const e = CG.toDescriptor({ id: 'C98', name: 'Flood at the clinic', source: 'environment', assets: 'CatFacility' }, null, { sources: O.THREAT_SOURCES });
  return { n: rows.length, diff, d, e, dOk: CG.checkCandidate(d).length === 0 };
}, golden);
ok(td.n === 45 && td.diff.length === 0, 'toDescriptor + the golden mapping reproduce the 45 golden MediBec inputs exactly ' + td.diff.join(','));
ok(td.dOk && td.d.crgo_id === 'LIB-F0001' && td.d.themes[0] === 'ThemeSocialEng' && td.d.techniques[0] === 'T1566' && td.d.cwe[0] === 'CWE-1021'
  && td.d.threat_source_types[0] === 'SrcAccidental' && td.d.asset_categories[0] === 'CatApplication' && !('params' in td.d) && !('PbA' in td.d),
  'toDescriptor: draft terms win, catalogue source → SrcAccidental, register asset → category, no parameter ' + JSON.stringify(td.d));
ok(td.e.threat_source_types[0] === 'SrcEnvironmental' && td.e.asset_categories[0] === 'CatFacility', 'toDescriptor: environment → SrcEnvironmental, a CRGO key kept');

/* ---------------- 3. toBatchRow carries CWE from the snapshot (fails before 1.9.3) ---------------- */
const br = await page.evaluate(async () => {
  const C = await import('/js/crgo.js'); const snap = await C.snapshot();
  const s = snap.scenarios.find(x => x.id === 'LIB-F0008');
  const row = C.toBatchRow(s);
  return { cwe: row.cwe, want: s.cwe.map(w => w.id), vulns: row.vulns };
});
ok(br.cwe.length > 0 && br.want.every(w => br.cwe.includes(w)), 'toBatchRow: CWE from the snapshot cwe list ' + JSON.stringify(br.cwe));
ok(!/undefined/.test(br.vulns) && br.vulns.length > 0, 'toBatchRow: weaknesses as text, never "undefined": ' + br.vulns.slice(0, 80));

/* ---------------- 4. MCP (through the helper) = snapshot ---------------- */
const mv = await page.evaluate(async golden => {
  const C = await import('/js/crgo.js'); const CG = await import('/js/crgo_group.js');
  const u = await C.groupingUsable();
  const strip = r => { const x = { ...r }; delete x.via; delete x.why; return CG.canonical(x); };
  const inp = golden.cases[0].input;
  const a = await C.group(inp), b = await C.group(inp, { prefer: 'snapshot' });
  const L = await C.group(inp, { minConfidence: 'L' }), Ls = await C.group(inp, { minConfidence: 'L', prefer: 'snapshot' });
  const vals = [];
  for (const c of golden.cases.filter(c => c.tool === 'crgo_validate_scenario' && !c.local)) {
    const x = await C.validate(c.input), y = await C.validate(c.input, { prefer: 'snapshot' });
    vals.push({ id: c.id, via: x.via, same: strip(x) === strip(y), golden: strip(x) === CG.canonical(c.expected) });
  }
  return { u, av: a.via, why: a.why, same: strip(a) === strip(b), golden: strip(a) === CG.canonical(golden.cases[0].expected), sameL: strip(L) === strip(Ls), vals };
}, golden);
ok(mv.u.usable && mv.u.snapshot, 'groupingUsable: the snapshot can group ' + JSON.stringify(mv.u));
if (mv.av !== 'mcp') {
  ok(true, 'SKIP MCP = snapshot: the ontology server could not start (' + (mv.why || 'no reason') + ')');
} else {
  ok(mv.u.mcp && mv.u.serverRelease === CRGO_RELEASE, 'groupingUsable: the server runs CRGO ' + mv.u.serverRelease);
  ok(mv.same && mv.golden, 'MediBec 45: MCP server = snapshot = golden (after dropping via/why)');
  ok(mv.sameL, 'MediBec 45 at confidence L: MCP server = snapshot');
  ok(mv.vals.length === 9 && mv.vals.every(v => v.via === 'mcp' && v.same && v.golden), 'validations: MCP server = snapshot = golden ' + mv.vals.filter(v => !(v.same && v.golden)).map(v => v.id).join(','));
}

/* ---------------- 5. proposals through the helper (server path, file path) ---------------- */
let forbidden = null;
await page.exposeFunction('__t77forbidden', async id => {
  const r = await fetch(URL.replace(/\/$/, '') + '/api/crgo/proposals/approve', { method: 'POST', headers: await apiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ proposal_id: id, approver: 'Analyst', user: { name: 'Analyst', admin: false, multi: true } }) });
  forbidden = { status: r.status, body: await r.json() };
});
const pr = await page.evaluate(async ({ golden, OUT }) => {
  const C = await import('/js/crgo.js'); const H = await import('/js/helper.js'); const CG = await import('/js/crgo_group.js');
  const out = {};
  out.avail = await C.proposals.available();
  const [p1, p2, p3] = golden.local_proposals;
  out.prop1 = await C.proposals.propose(p1);
  out.again = await C.proposals.propose(p1);
  out.bad = await C.proposals.propose({ ...p1, estimates: { PbA: 0.3 } });
  out.revoked = await C.proposals.propose({ ...p1, name: 'Another relay hijack', techniques: [['T1562', 'M']] });
  // file path: the server switched off in Settings → Ontology
  await H.loadConfig(); const before = JSON.parse(JSON.stringify(H.HS.config));
  H.HS.config.ontology = { ...(H.HS.config.ontology || {}), enabled: false }; await H.saveConfig();
  out.prop2 = await C.proposals.propose(p2);
  out.prop3 = await C.proposals.propose(p3);
  out.listFiles = await C.proposals.list();
  H.HS.config = before; await H.saveConfig();
  out.list = await C.proposals.list('proposed');
  await window.__t77forbidden(out.prop1.id);   // from Node: a refused request is not a page error
  out.stillProposed = (await C.proposals.list('proposed')).count;
  // administrator (single-user mode = the one person): approve all three, as the golden file did
  for (const p of [out.prop1, out.prop2]) out['ap' + p.id] = await C.proposals.approve(p.id, { approver: 'Admin', date: '2026-11-12' });
  H.HS.config.ontology = { ...(H.HS.config.ontology || {}), enabled: false }; await H.saveConfig();
  out.ap3 = await C.proposals.approve(out.prop3.id, { approver: 'Admin', date: '2026-11-12' });   // file path, on a store the server wrote
  H.HS.config = before; await H.saveConfig();
  out.twice = await C.proposals.approve(out.prop1.id, { approver: 'Admin', date: '2026-11-12' });
  out.rejectNoReason = await C.proposals.reject(out.prop1.id, '', { approver: 'Admin' });
  // the approved additions are served and take part in grouping on both paths
  const ext = await H.apiJson('/api/crgo/local-extension');
  out.extSame = CG.canonical(ext.scenarios) === CG.canonical(golden.local_extension.scenarios);
  const lx = await C.localExtension({ refresh: true });
  const syn = golden.cases.find(c => c.id === 'synthetic-edge-cases-with-local');
  const strip = r => { const x = { ...r }; delete x.via; delete x.why; return CG.canonical(x); };
  const ga = await C.group(syn.input), gb = await C.group(syn.input, { prefer: 'snapshot' });
  out.withLocal = { n: lx.length, via: ga.via, mcp: strip(ga) === CG.canonical(syn.expected), snap: strip(gb) === CG.canonical(syn.expected) };
  // contribution file: needs the folder setting
  out.noFolder = await C.proposals.exportContribution(out.prop1.id);
  H.HS.config.links = { ...(H.HS.config.links || {}), ontology_proposals_dir: OUT }; await H.saveConfig();
  out.notApproved = await C.proposals.exportContribution('LOC-0000000000');
  out.exp = await C.proposals.exportContribution(out.prop1.id, { date: '2026-11-12' });
  out.read = await C.proposals.read(out.prop1.id);
  out.listAfter = await C.proposals.list();
  H.HS.config.links = { ...H.HS.config.links, ontology_proposals_dir: '' }; await H.saveConfig();
  return out;
}, { golden, OUT });
ok(pr.avail, 'proposals available with the helper');
ok(/^LOC-[0-9a-f]{10}$/.test(pr.prop1.id) && pr.prop1.status === 'proposed' && pr.prop1.id === golden.local_extension.scenarios[0].id, `proposed ${pr.prop1.id} (via ${pr.prop1.via}), the golden id`);
ok(pr.again.existing === true && pr.again.id === pr.prop1.id, 'the same content proposed twice returns the existing proposal');
ok(pr.bad.error && pr.bad.code === 'SCHEMA_INVALID', 'a proposal with estimates is refused (SCHEMA_INVALID)');
ok(pr.revoked.error && pr.revoked.code === 'INVALID_ARGUMENT' && (pr.revoked.details || []).some(d => /T1562 is revoked, use T1685/.test(d)), 'a revoked technique is refused with its successor');
ok(pr.prop2.via === 'files' && pr.prop3.via === 'files' && pr.listFiles.count === 3, 'server switched off: the helper writes the same store itself (files) ' + pr.prop2.via);
ok(pr.list.count === 3 && pr.list.proposals.every(p => p.status === 'proposed'), 'list: three proposed');
ok(forbidden?.status === 403 && forbidden.body.code === 'FORBIDDEN' && pr.stillProposed === 3, 'approval refused to a non-administrator in multi-user mode; nothing written');
ok(pr.ap3.status === 'approved' && pr.ap3.via === 'files', 'approval on the file path, on the store the server wrote');
ok(pr.twice.error && pr.twice.code === 'STATUS_NOT_PROPOSED', 'approving twice: STATUS_NOT_PROPOSED');
ok(pr.rejectNoReason.error && (pr.rejectNoReason.code === 'INVALID_ARGUMENT' || pr.rejectNoReason.code === 'STATUS_NOT_PROPOSED'), 'reject needs a reason (or a proposed status)');
ok(pr.extSame, 'the local extension written by server and files = the golden local extension (same records, clusters, primary themes)');
ok(pr.withLocal.n === 3 && pr.withLocal.snap && (pr.withLocal.via !== 'mcp' || pr.withLocal.mcp), 'approved additions take part in grouping: snapshot path' + (pr.withLocal.via === 'mcp' ? ' and MCP path' : '') + ' = golden');
ok(pr.noFolder.error && pr.noFolder.code === 'NO_FOLDER' && /Folder for ontology proposals/.test(pr.noFolder.message), 'no folder set: the message points to the setting');
ok(pr.notApproved.error, 'export of an unknown or unapproved proposal refused');
const cf = pr.exp.path && fs.existsSync(pr.exp.path) ? JSON.parse(fs.readFileSync(pr.exp.path, 'utf8')) : null;
ok(cf && path.dirname(pr.exp.path) === fs.realpathSync(OUT) && cf.schema === 'crgo-contribution/1' && cf.status === 'proposed' && cf.key === 'CONTRIB-' + pr.prop1.id
  && !/PbA|estimates|proposed_by|Admin/.test(JSON.stringify(cf)), 'contribution file in the Folder for ontology proposals, status proposed, no figure and no name');
ok(pr.read.status === 'approved' && pr.read.history.some(h => h.public === 'submitted'), 'the proposal records the public submission');
ok(pr.listAfter.proposals.find(p => p.id === pr.prop1.id)?.public === 'submitted', 'list shows public: submitted');

/* ---------------- 6. QC-33: attention at most, never fail ---------------- */
const qc = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const QC = await import('/js/panels/qc.js');
  const v = QC.ontologyValidation([{ id: 'S1', ontologyFindings: [] }, { id: 'S2' }, { id: 'S3', ontologyFindings: [{ code: 'TECHNIQUE_REVOKED', state: 'open' }] },
    { id: 'S4', ontologyFindings: [{ code: 'TECHNIQUE_REVOKED', state: 'dismissed', by: 'A', at: '2026-11-12' }, { code: 'LIBRARY_MATCH' }] }]);
  const out = {};
  for (const id of ['medibec', 'canaretail']) out[id] = QC.checks(st.exampleWorkspace(id)).find(x => x.id === 'QC-33');
  return { v, out };
});
ok(qc.v.never.join() === 'S1,S2' && qc.v.open.length === 1 && qc.v.open[0].id === 'S3', 'QC-33: never validated, open findings; dismissed and info findings do not count ' + JSON.stringify(qc.v));
ok(Object.values(qc.out).every(c => c && c.state !== 'fail'), 'QC-33 never fails (example cases: ' + Object.values(qc.out).map(c => c?.state).join(', ') + ')');

ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close();
done('t77 ontology grouping (part 1)');
