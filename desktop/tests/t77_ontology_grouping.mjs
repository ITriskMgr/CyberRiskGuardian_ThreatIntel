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
// Part 2 (the W2 screens, W2b): ② Group with the ontology on MediBec (snapshot) with the review panel, accept/edit/reject, marks and
//  ontologyMatch, theme gap; ④ findings (states, Dismiss, Delete with audit, revoked-technique successor journalled), Create never
//  blocked, findings copied to the scenarios; Scenario editor Validate; QC-33 attention never fail; Add to the ontology preview
//  anonymized without parameters, Make public off/on; Ontology · CRGO → Proposals (approver required, reject with reason, export:
//  folder empty → message, folder set → file); non-admin in multi-user cannot approve; hidden in example and classroom workspaces.
import { open, ok, done, medibec, goto as goto0, CRGO, ORG, TMP, FIXTURES, CRGO_RELEASE, URL, apiHeaders } from './lib.mjs';
import fs from 'fs';
import path from 'path';

const goldenPath = [path.join(CRGO, 'contracts', 'library-proposal', 'v1', 'examples', 'golden-grouping.json'), path.join(FIXTURES, 'crgo-0.11.2-golden-grouping.json')]
  .find(p => fs.existsSync(p));
const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
fs.rmSync(path.join(ORG, '_installation'), { recursive: true, force: true });   // this run's installation store starts empty
const OUT = path.join(TMP, 'ontology-proposals'); fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });

const { browser, page, errors } = await open('#/process');
// going to the hash the page is already on does not redraw the screen: pass through #/process first
const goto = async (pg, h, ms = 600) => { if (await pg.evaluate(x => location.hash === x, h)) await goto0(pg, '#/process', 300); await goto0(pg, h, Math.max(ms, 900)); };

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


/* =====================================================================================================================
   Part 2 — the screens (W2b)
   ===================================================================================================================== */
page.on('dialog', d => d.accept());
const OUT2 = path.join(TMP, 'ontology-proposals-ui'); fs.rmSync(OUT2, { recursive: true, force: true }); fs.mkdirSync(OUT2, { recursive: true });
const show = (hash, ms = 900) => goto(page, hash, ms);
const setServer = async on => page.evaluate(async on => { const H = await import('/js/helper.js'); await H.loadConfig(); H.HS.config.ontology = { ...(H.HS.config.ontology || {}), enabled: on }; await H.saveConfig(); }, on);
const setFolder = async dir => page.evaluate(async dir => { const H = await import('/js/helper.js'); await H.loadConfig(); H.HS.config.links = { ...(H.HS.config.links || {}), ontology_proposals_dir: dir }; await H.saveConfig(); }, dir);

/* ---------------- 7. ② Group with the ontology on MediBec (snapshot path) ---------------- */
await medibec(page);
// the analyst completes the CRGO terms of each candidate (here from the golden mapping): they go into the kept draft, where toDescriptor reads them
const filled = await page.evaluate(async golden => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const ws = st.S.ws; const M = golden.medibec_mapping;
  const amap = M.assets, byFirst = {}; for (const k of Object.keys(amap)) { const w = k.split(' ')[0]; if (!(w in byFirst)) byFirst[w] = amap[k]; }
  let n = 0; SC.state(ws).families = []; SC.state(ws).themeGap = [];   // the teaching case arrives pre-screened: start from ungrouped candidates
  for (const c of SC.candidates(ws)) {
    const r = SC.rec(c.id, ws); r.draft = r.draft || {};
    const cats = []; for (const part of String(c.assets).split(/[\/;]/).map(x => x.trim()).filter(Boolean)) { const hit = part.startsWith('CJ') ? byFirst[part] : amap[part]; for (const x of hit || []) if (!cats.includes(x)) cats.push(x); }
    const ts = M.threat_sources[c.source] || M.threat_sources['(any other source)'] || [];
    r.unique = null; r.ontologyMatch = null;
    r.draft.crgo = { asset_categories: cats, threat_source_types: ts.slice() }; r.draft.attack = (M.techniques[c.id] || []).slice(); n++;
  }
  st.touch(); return n;
}, golden);
ok(filled === 45, 'the CRGO terms of the 45 MediBec candidates are completed in their drafts');
await setServer(false);                                   // the snapshot path
await goto(page, '#/screening/screen', 1200);
ok(await page.isVisible('#scr-grouping-slot #scr-onto-group') && /Group with the ontology/.test(await page.textContent('#scr-onto-group')), '② has the Group with the ontology button in the grouping slot');
await page.click('#scr-onto-group'); await page.waitForSelector('#scr-onto-panel .prop-item', { timeout: 20000 });
const gp = await page.evaluate(() => ({ kinds: [...document.querySelectorAll('#scr-onto-panel .prop-item')].map(x => x.dataset.kind), keys: [...document.querySelectorAll('#scr-onto-panel .prop-item')].map(x => x.dataset.key),
  src: document.querySelector('#scr-onto-panel .prop-source')?.textContent || '', gaps: document.querySelector('#scr-onto-gaps')?.textContent || '' }));
const exp0 = golden.cases[0].expected;
ok(/snapshot/.test(gp.src) && /CRGO 0\.11\.2/.test(gp.src), 'the panel shows the path (snapshot) and the CRGO release: ' + gp.src.slice(0, 80));
ok(gp.keys.length === exp0.groups.length && gp.keys.join() === exp0.groups.map(g => g.cluster_id).join(), 'the 45 candidates give the golden groups (' + gp.keys.length + ' proposals: ' + ['family', 'unique', 'own'].map(k => gp.kinds.filter(x => x === k).length + ' ' + k).join(', ') + ')');
ok(gp.kinds.includes('family') && gp.kinds.includes('unique') && (exp0.theme_gaps.length === 0 || /Theme gaps/.test(gp.gaps)), 'family, unique and own proposals shown; theme gaps listed: ' + gp.gaps.slice(0, 80));
const before = await page.evaluate(async () => { const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); return { fams: SC.state(st.S.ws).families.length, uniq: SC.candidates(st.S.ws).filter(c => SC.rec(c.id, st.S.ws).unique).length, match: Object.values(SC.state(st.S.ws).cands).filter(r => r.ontologyMatch).length }; });
// reject one: nothing changes
const rejKey = await page.evaluate(() => document.querySelector('#scr-onto-panel .prop-item[data-kind=own]')?.dataset.key || document.querySelector('#scr-onto-panel .prop-item:last-child')?.dataset.key);
await page.click(`#scr-onto-panel .prop-item[data-key="${rejKey}"] [data-act=reject]`);
const after0 = await page.evaluate(async () => { const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); return { fams: SC.state(st.S.ws).families.length, match: Object.values(SC.state(st.S.ws).cands).filter(r => r.ontologyMatch).length }; });
ok(after0.fams === before.fams && after0.match === before.match && !await page.isVisible(`#scr-onto-panel .prop-item[data-key="${rejKey}"]`), 'Reject drops the proposal and changes nothing in the workspace');
// accept one family as proposed, edited name
const famKey = gp.keys[gp.kinds.indexOf('family')];
await page.click(`#scr-onto-panel .prop-item[data-key="${famKey}"] [data-act=edit]`);
await page.fill(`#scr-onto-panel .prop-item[data-key="${famKey}"] .prop-edit input:not([type=checkbox])`, 'Edited family name (t77)');
await page.click(`#scr-onto-panel .prop-item[data-key="${famKey}"] [data-act=accept-edited]`);
await page.waitForTimeout(500);
const accFam = await page.evaluate(async famKey => {
  const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); const ws = st.S.ws, S = SC.state(ws);
  const f = S.families.find(x => x.name === 'Edited family name (t77)');
  return f ? { id: f.id, members: f.members, mark: f.ontoMark, mm: f.memberMarks, om: f.members.map(m => S.cands[m].ontologyMatch), shown: document.body.textContent.includes('Ontology-proposed, accepted by'), statement: f.statement } : null;
}, famKey);
ok(accFam && accFam.members.length >= 2 && accFam.mark?.source === 'ontology' && accFam.mark.cluster === famKey, 'accepted family created: ' + JSON.stringify(accFam?.members) + ' mark ' + JSON.stringify(accFam?.mark));
ok(accFam && accFam.members.every(m => accFam.mm[m]?.source === 'ontology' && accFam.mm[m].by && accFam.mm[m].at), 'every member carries {by, at, source: ontology}');
ok(accFam && accFam.om.every(o => o && o.source === 'snapshot' && o.release === '0.11.2' && ((o.crgoId && o.cluster === famKey) || (o.gap && o.theme))), 'rec.ontologyMatch = {crgoId, cluster, source: snapshot, release} (or the theme gap) on every member');
ok(accFam && accFam.statement && /\w/.test(accFam.statement), 'the family starts from the cluster representative statement');
await show('#/screening/screen', 800);
await page.waitForSelector('.scr-family', { timeout: 15000 });
ok(await page.evaluate(() => [...document.querySelectorAll('.scr-family .onto-mark')].some(x => /Ontology-proposed, accepted by .* on \d{4}-\d\d-\d\d/.test(x.textContent))), '② shows “Ontology-proposed, accepted by ‹name› on ‹date›” on the family');
// accept one unique (or own) candidate
await page.click('#scr-onto-group'); await page.waitForSelector('#scr-onto-panel .prop-item', { timeout: 20000 });
const uniKey = await page.evaluate(() => { const it = document.querySelector('#scr-onto-panel .prop-item[data-kind=unique]:not(:has(.prop-blocked))') || document.querySelector('#scr-onto-panel .prop-item[data-kind=own]:not(:has(.prop-blocked))'); return it ? it.dataset.key + '|' + it.dataset.kind : null; });
const [uk, ukind] = uniKey.split('|');
await page.click(`#scr-onto-panel .prop-item[data-key="${uk}"] [data-act=accept]`); await page.waitForTimeout(500);
const accU = await page.evaluate(async () => { const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); const ws = st.S.ws, S = SC.state(ws);
  const c = SC.candidates(ws).find(x => S.cands[x.id].unique?.source === 'ontology'); const r = c && S.cands[c.id];
  return c ? { id: c.id, unique: r.unique, om: r.ontologyMatch, gap: S.themeGap.slice(), fam: SC.familyOf(c.id, ws) } : null; });
ok(accU && accU.unique.by && accU.unique.at && accU.unique.source === 'ontology' && !accU.fam, `accepted ${ukind}: ${accU?.id} marked unique by the ontology, recorded {by, at}`);
ok(accU && accU.om && (ukind === 'own' ? accU.om.gap === true && accU.gap.includes(accU.om.theme) : accU.om.cluster === uk && accU.om.crgoId), 'ontologyMatch stored (' + JSON.stringify(accU?.om) + ')');
await show('#/screening/screen', 800);
ok(await page.evaluate(() => [...document.querySelectorAll('#scr-group [data-mark=ontology]')].some(x => /Ontology-proposed, accepted by/.test(x.textContent))), '② shows the ontology mark on the unique candidate');
// a theme gap is shown (own scenarios card) when an own proposal has been accepted
const ownKey = await page.evaluate(() => document.querySelector('#scr-onto-panel .prop-item[data-kind=own]:not(:has(.prop-blocked))')?.dataset.key || null);
if (ownKey) {
  await page.click(`#scr-onto-panel .prop-item[data-key="${ownKey}"] [data-act=accept]`); await page.waitForTimeout(400);
  const own = await page.evaluate(async () => { const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); return { gaps: SC.state(st.S.ws).themeGap.slice() }; });
  await show('#/screening/screen', 800);
  ok(own.gaps.length > 0 && await page.isVisible('#scr-own .onto-gap') && /Theme gap/.test(await page.textContent('#scr-own')), 'an own scenario is flagged “Theme gap” in ② with its themes in ws.screening.themeGap: ' + own.gaps.join(','));
  ok(await page.evaluate(() => !!document.querySelector('#scr-own .onto-gap .onto-gap-reason')), 'in the MediBec example workspace the flag says why Add to the ontology is hidden');
} else ok(true, 'SKIP own proposal: none left');
await setServer(true);

/* ---------------- 8. Add to the ontology is hidden in example and classroom workspaces ---------------- */
const hid = await page.evaluate(async () => {
  const PR = await import('/js/ontoprop.js'); const st = await import('/js/state.js');
  const ws = st.S.ws, el = PR.gapFlag({ kind: 'scenario', s: ws.assessment.SCEN[0] }, ws, { theme: 'ThemeX' });
  return { kind: ws.kind, reason: PR.blockedReason(ws), classroom: PR.blockedReason({ kind: 'classroom' }), normal: PR.blockedReason({ kind: 'user' }), hasBtn: !!el.querySelector('[data-act=add-ontology]'), text: el.textContent };
});
ok(hid.kind === 'example' && /Example workspaces/.test(hid.reason) && !hid.hasBtn && /cannot propose/.test(hid.text), 'MediBec (example): no Add to the ontology button, the flag says why');
ok(/Classroom workspaces cannot propose/.test(hid.classroom) && hid.normal === null, 'classroom workspaces are blocked, ordinary ones are not');

/* ---------------- 9. a working workspace: ④ findings, actions, creation not blocked ---------------- */
await page.evaluate(async () => { const st = await import('/js/state.js'); const w = st.newWorkspace({ name: 'Ontology review (t77)' }); w.org.name = 'Acme Clinic'; await st.create(w); });
await show('#/screening/create', 1000);
const mk = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const ws = st.S.ws;
  const defs = [
    ['Phishing of staff leading to ransomware', 'Cybercriminal', ['T1562', 'T1566'], ['CWE-79']],
    ['Odd technique used against the portal', 'Cybercriminal', ['T9999'], []],
    ['Zebra herd stampede on the datacentre roof of Acme Clinic', 'Wildlife', [], []],
    ['Backup failure after a power cut', 'Environment', [], []],
    ['Second zebra herd stampede at Acme Clinic', 'Wildlife', [], []]];
  const ids = defs.map(([name, source, attack, cwe]) => SC.addCandidate({ name, source, assets: 'Datacentre', vuln: 'weak control', consequence: 'Outage at Acme Clinic', draft: { statement: name + ': an event at Acme Clinic leads to an outage of the clinical systems.', attack, cwe, cves: [], params: {}, vulns: ['weak control'] } }, ws));
  for (const id of ids) { SC.markUnique(id, 'Tester', ws); SC.rec(id, ws).scores = Array(12).fill(3); }
  const A = SC.analysis(ws);
  for (const id of ids) { const u = A.units.find(x => x.id === id); SC.setSelected(u, true, ws); }
  for (const u of SC.selectedUnits(ws, SC.analysis(ws))) { const w = SC.whyOf(u, ws); for (let i = 0; i < 6; i++) w[i] = 'why ' + i; }
  st.touch(); return ids;
});
await show('#/screening/create', 800);
await page.waitForFunction(() => document.querySelectorAll('.scr-finding-slot .onto-findings').length === 5, null, { timeout: 20000 });
const f4 = await page.evaluate(ids => Object.fromEntries(ids.map(id => { const e = document.querySelector(`.onto-findings[data-for="${id}"]`); return [id, { state: e?.dataset.state, text: e?.textContent || '', acts: [...(e?.querySelectorAll('[data-act]') || [])].map(b => b.dataset.act) }]; })), mk);
ok(f4[mk[0]].state === 'attention' && /T1562 is revoked/.test(f4[mk[0]].text) && f4[mk[0]].acts.includes('replace') && f4[mk[0]].acts.includes('edit') && f4[mk[0]].acts.includes('delete') && f4[mk[0]].acts.includes('dismiss'), '④ revoked technique: needs attention, reason in the interface text, Replace/Edit/Delete/Dismiss');
ok(/T9999/.test(f4[mk[1]].text) && f4[mk[1]].state && /T9999 is not in CRGO/.test(f4[mk[1]].text), '④ unknown technique flagged');
ok(f4[mk[2]].state === 'outside' && /Theme gap/.test(f4[mk[2]].text) && /Add to the ontology/.test(f4[mk[2]].text), '④ no match: “outside the ontology”, theme-gap flag with Add to the ontology');
// Edit opens the field
await page.click(`.onto-findings[data-for="${mk[1]}"] [data-act=edit]`); await page.waitForSelector('#onto-edit-done');
ok(await page.evaluate(() => !!document.querySelector('.modal [data-edit=techniques]')), 'Edit opens the technique field');
await page.fill('.modal [data-edit=techniques]', 'T1190'); await page.press('.modal [data-edit=techniques]', 'Tab');
await page.click('#onto-edit-done'); await page.waitForTimeout(900);
ok(await page.evaluate(async id => (await import('/js/screening.js')).rec(id).draft.attack.join() === 'T1190', mk[1]) , 'the edited technique is kept in the candidate draft');
// Dismiss records by/at
await page.waitForFunction(id => !!document.querySelector(`.onto-findings[data-for="${id}"]`), mk[0]);
const nA = await page.evaluate(id => document.querySelectorAll(`.onto-findings[data-for="${id}"] .onto-finding`).length, mk[0]);
await page.click(`.onto-findings[data-for="${mk[0]}"] .onto-finding[data-code=TECHNIQUE_REVOKED] [data-act=dismiss]`); await page.waitForTimeout(700);
const dm = await page.evaluate(async id => { const SC = await import('/js/screening.js'); const f = SC.rec(id).ontologyFindings.find(x => x.code === 'TECHNIQUE_REVOKED'); return { f, shown: document.querySelector(`.onto-findings[data-for="${id}"]`).textContent }; }, mk[0]);
ok(dm.f.state === 'dismissed' && dm.f.by && /^\d{4}-\d\d-\d\dT/.test(dm.f.at) && /Seen by/.test(dm.shown), 'Dismiss records by/at and shows “Seen by …”');
// revoked technique: successor applied and journalled (use a fresh finding)
await page.evaluate(async id => { const SC = await import('/js/screening.js'); const f = SC.rec(id).ontologyFindings.find(x => x.code === 'TECHNIQUE_REVOKED'); f.state = 'open'; f.by = f.at = ''; const st = await import('/js/state.js'); st.touch(); }, mk[0]);
await show('#/screening/create', 900);
await page.waitForSelector(`.onto-findings[data-for="${mk[0]}"] [data-act=replace]`);
await page.click(`.onto-findings[data-for="${mk[0]}"] [data-act=replace]`); await page.waitForTimeout(1200);
const rp = await page.evaluate(async id => { const SC = await import('/js/screening.js'); const st = await import('/js/state.js'); const r = SC.rec(id);
  return { attack: r.draft.attack, audit: (st.S.ws.userAudit || []).find(a => a.action === 'revoked ATT&CK technique replaced'), still: r.ontologyFindings.some(f => f.code === 'TECHNIQUE_REVOKED') }; }, mk[0]);
ok(rp.attack.includes('T1685') && !rp.attack.includes('T1562') && rp.audit && /T1562 → T1685/.test(rp.audit.detail) && !rp.still, 'one click replaces T1562 by T1685, journalled in the audit log, and the finding is gone after revalidation');
// Delete: confirmation, audit-log entry; a candidate
const delId = mk[4];
await page.click(`.onto-findings[data-for="${delId}"] [data-act=gap-delete]`); await page.waitForTimeout(800);
const dl = await page.evaluate(async id => { const SC = await import('/js/screening.js'); const st = await import('/js/state.js');
  return { gone: !SC.candidates(st.S.ws).some(c => c.id === id), audit: (st.S.ws.userAudit || []).find(a => a.action === 'candidate removed' && a.detail.includes(id)) }; }, delId);
ok(dl.gone && dl.audit, 'Delete removes the candidate and writes an audit-log entry naming it: ' + dl.audit?.detail);
// Create is not blocked by findings; the findings travel to the scenarios
await show('#/screening/create', 900);
const dis0 = await page.evaluate(() => document.querySelector('#scr-create-all').disabled);
await page.click('#scr-create-all'); await page.waitForSelector('#scr-open-first', { timeout: 20000 });
const cr = await page.evaluate(async mk => { const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const SCEN = st.S.ws.assessment.SCEN;
  return { n: SCEN.length, f: SCEN.map(s => [s.id, s.origin.candidateIds[0], (s.ontologyFindings || []).length, (s.ontologyFindings || []).some(x => x.state === 'open' && x.severity === 'attention')]) }; }, mk);
ok(!dis0 && cr.n === 4 && cr.f.every(x => x[2] > 0), 'Create the 4 scenarios is enabled with open findings and the scenarios carry their findings: ' + JSON.stringify(cr.f));
await page.click('#scr-summary-close').catch(() => {});
const qc2 = await page.evaluate(async () => { const st = await import('/js/state.js'); const QC = await import('/js/panels/qc.js'); return QC.checks(st.S.ws).find(x => x.id === 'QC-33'); });
ok(qc2 && qc2.state === 'warn', 'QC-33 shows attention with open findings (never fail): ' + qc2?.state);

/* ---------------- 10. Scenario editor: Validate against the ontology ---------------- */
const sOdd = cr.f.find(x => x[1] === mk[1])[0], sZebra = cr.f.find(x => x[1] === mk[2])[0];
await page.evaluate(async sid => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === sid); s.attack = [...s.attack, 'T1562']; s.ontologyFindings = []; st.touch(); }, sOdd);
await page.evaluate(() => { try { localStorage.setItem('crg-scen-tab:local', 'onto'); } catch {} });
await goto(page, `#/scenario/${sOdd}/onto`, 1200);
ok(await page.isVisible('#scen-validate') && /Not validated against the ontology yet/.test(await page.textContent('#scen-onto-findings')), 'the Ontology · CRGO card has Validate against the ontology and says it was not validated yet');
await page.click('#scen-validate'); await page.waitForSelector('#scen-onto-findings .onto-findings', { timeout: 15000 });
ok(await page.isVisible('#scen-onto-findings [data-code=TECHNIQUE_REVOKED] [data-act=replace]'), 'the card lists the revoked technique with the one-click successor');
await page.click('#scen-onto-findings [data-code=TECHNIQUE_REVOKED] [data-act=replace]'); await page.waitForTimeout(1200);
const rv = await page.evaluate(async sid => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === sid); return { attack: s.attack, rev: (s.revisions || []).map(r => r.what) }; }, sOdd);
ok(rv.attack.includes('T1685') && !rv.attack.includes('T1562') && rv.rev.some(w => /T1562.*T1685/.test(w)), 'Replace on the scenario: revision-log entry ' + rv.rev.slice(-1)[0]?.slice(0, 80));
const qc3 = await page.evaluate(async () => { const st = await import('/js/state.js'); const QC = await import('/js/panels/qc.js'); return QC.checks(st.S.ws).find(x => x.id === 'QC-33').state; });
ok(qc3 !== 'fail', 'QC-33 after the editor validation: ' + qc3);
// scenario Delete from the findings list: confirmation + audit entry (use the zebra scenario's twin: duplicate, then delete)
await page.evaluate(async sid => { const st = await import('/js/state.js'); const s = JSON.parse(JSON.stringify(st.S.ws.assessment.SCEN.find(x => x.id === sid))); s.id = 'S99'; s.name = 'Disposable (t77)'; st.S.ws.assessment.SCEN.push(s); st.touch(); }, sZebra);
await goto(page, '#/scenario/S99/onto', 900);
await page.click('#scen-validate'); await page.waitForSelector('#scen-onto-findings .onto-findings [data-act=gap-delete]', { timeout: 15000 });
await page.click('#scen-onto-findings [data-act=gap-delete]'); await page.waitForTimeout(900);
ok(await page.evaluate(async () => { const st = await import('/js/state.js'); return !st.S.ws.assessment.SCEN.some(s => s.id === 'S99') && (st.S.ws.userAudit || []).some(a => a.action === 'scenario deleted' && /S99/.test(a.detail)); }), 'Delete on a scenario: removed, audit-log entry');

/* ---------------- 11. Add to the ontology: preview anonymized, no parameters, Make public ---------------- */
await goto(page, `#/scenario/${sZebra}/onto`, 1000);
await page.click('#scen-validate'); await page.waitForSelector('#scen-onto-findings [data-act=add-ontology]', { timeout: 15000 });
await page.click('#scen-onto-findings [data-act=add-ontology]'); await page.waitForSelector('#onto-prop-json', { timeout: 15000 });
const pv = await page.evaluate(() => ({ json: document.querySelector('#onto-prop-json').textContent, pubInfo: !document.querySelector('#onto-prop-public-info').hidden, pubTicked: document.querySelector('#onto-prop-public').checked, by: document.querySelector('#onto-prop-by').value }));
const pj = JSON.parse(pv.json);
ok(!/Acme/.test(pv.json) && /Organization A/.test(pv.json), 'preview anonymized: the organisation name is replaced ' + pj.statement.slice(0, 80));
ok(!/PbA|Pbx|"De"|"Dm"|estimates|params|cvss|owner|Th"|Mu"/.test(pv.json) && pj.anonymized === true && !('public' in pj) && pj.themes.length >= 1, 'preview carries no parameter, estimate or figure; anonymized: true; no public flag');
ok(!pv.pubTicked && !pv.pubInfo, 'Make public is unticked by default and the warning is hidden');
await page.check('#onto-prop-public'); await page.waitForTimeout(500);
const pb = await page.evaluate(() => ({ info: !document.querySelector('#onto-prop-public-info').hidden, text: document.querySelector('#onto-prop-public-info').textContent, json: JSON.parse(document.querySelector('#onto-prop-json').textContent), left: !!document.querySelector('#onto-prop-leftovers') }));
ok(pb.info && /leave this installation/.test(pb.text) && pb.json.public === true && pb.left, 'Make public ticked: warning that the text leaves the installation, public: true, leftover list shown');
// an unanonymised term typed back in is caught on the way out (the edited text is anonymized again) and listed as leftover when not replaceable
await page.fill('#onto-prop-extra', 'zebra'); await page.press('#onto-prop-extra', 'Tab'); await page.waitForTimeout(700);
ok(!/zebra/i.test(await page.textContent('#onto-prop-json')), 'an additional term is removed by the re-run anonymizer');
await page.fill('#onto-prop-extra', ''); await page.press('#onto-prop-extra', 'Tab'); await page.waitForTimeout(500);
await page.uncheck('#onto-prop-public'); await page.waitForTimeout(500);
await page.fill('#onto-prop-by', 'Prop Analyst');
await page.click('#onto-prop-send'); await page.waitForTimeout(1500);
const sp = await page.evaluate(async sid => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === sid); return s.ontoProposal; }, sZebra);
ok(sp && sp.state === 'proposed' && /^LOC-/.test(sp.id) && sp.makePublic === false, 'Propose: scenario.ontoProposal = proposed ' + JSON.stringify(sp));
await goto(page, `#/scenario/${sZebra}/onto`, 900);
ok(/Proposed/.test(await page.textContent('#scen-onto-findings .onto-gap')) , 'the flag shows the status Proposed');
// a second own scenario proposed with Make public, from Node-side API calls (a public one, a rejected one)
const extra = await page.evaluate(async () => {
  const C = await import('/js/crgo.js'); const mkp = (name, pub) => ({ name, statement: 'A generic event on the datacentre roof leads to an outage of the clinical systems.', themes: ['ThemeOther'], proposed_by: 'Prop Analyst', proposed_on: '2026-11-12', anonymized: true, ...(pub ? { public: true } : {}) });
  const pubP = await C.proposals.propose(mkp('Public candidate scenario (t77)', true)), rejP = await C.proposals.propose(mkp('Rejected candidate scenario (t77)', false));
  const locP = await C.proposals.propose({ ...mkp('Local only candidate scenario (t77)', false), statement: 'A local-only event on the datacentre roof leads to an outage of the clinical systems.' });
  return { pub: pubP.id, rej: rejP.id, loc: locP.id, errs: [pubP, rejP, locP].filter(x => x.error).map(x => x.message) };
});
ok(!extra.errs.length, 'three more proposals made for the Proposals tab ' + extra.errs.join(';'));

/* ---------------- 12. Ontology · CRGO → Proposals ---------------- */
await setFolder('');
await goto(page, '#/ontology/proposals', 1500);
ok(await page.evaluate(() => document.querySelector('#panel-ontology [role=tab][aria-selected=true]')?.textContent.trim() === 'Proposals') && await page.isVisible(`[data-act=preview][data-id="${sp.id}"]`), 'the Proposals tab lists the proposals with Preview');
ok(/not set/.test(await page.textContent('#prop-folder')) && /Folder for ontology proposals/.test(await page.textContent('#prop-folder')), 'the tab says the Folder for ontology proposals is not set and where to set it');
await page.click(`[data-act=preview][data-id="${sp.id}"]`); await page.waitForTimeout(500);
ok(/Organization A/.test(await page.textContent('.modal')) && !/Acme/.test(await page.textContent('.modal')), 'Preview shows the stored (anonymized) proposal');
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
// Approve needs an approver name
await page.click(`[data-act=approve][data-id="${sp.id}"]`); await page.waitForSelector('#prop-approve-ok');
await page.fill('#prop-approver', ''); await page.click('#prop-approve-ok'); await page.waitForTimeout(500);
ok(await page.isVisible('#prop-approve-ok') && (await page.evaluate(async id => (await (await import('/js/crgo.js')).proposals.read(id)).status, sp.id)) === 'proposed', 'Approve without an approver name is refused; the proposal stays proposed');
await page.fill('#prop-approver', 'Admin Person'); await page.click('#prop-approve-ok'); await page.waitForTimeout(1500);
const ap = await page.evaluate(async id => { const C = await import('/js/crgo.js'); const st = await import('/js/state.js'); const r = await C.proposals.read(id); await (await import('/js/ontoprop.js')).syncStatus(); const s = st.S.ws.assessment.SCEN.find(x => x.ontoProposal?.id === id);
  return { status: r.status, hist: r.history, audit: (st.S.ws.userAudit || (await import('/js/users.js')).U.audit || []).length, sop: s?.ontoProposal, ulog: (await import('/js/users.js')).U.audit.find(a => a.action === 'ontology proposal approved') }; }, sp.id);
ok(ap.status === 'approved' && ap.hist.some(h => h.by === 'Admin Person' && h.status === 'approved') && ap.sop?.state === 'approved' && ap.sop.approvedBy === 'Admin Person' && ap.ulog, 'approved with approver and date, the scenario status follows, audit-log entry');
// Make public off → no export button and no file
ok(!await page.isVisible(`[data-act=export][data-id="${sp.id}"]`) && fs.readdirSync(OUT2).length === 0, 'Make public unticked: no Export button, nothing written');
// the approved addition is used by validation: the scenario now matches and the gap clears
await goto(page, `#/scenario/${sZebra}/onto`, 900);
await page.click('#scen-validate'); await page.waitForSelector('#scen-onto-findings .onto-findings', { timeout: 15000 }); await page.waitForTimeout(500);
const gc = await page.evaluate(() => ({ gap: !!document.querySelector('#scen-onto-findings .onto-gap'), text: document.querySelector('#scen-onto-findings').textContent, state: document.querySelector('#scen-onto-findings .onto-findings').dataset.state }));
ok(!gc.gap && gc.state === 'consistent' && /LOC-/.test(gc.text), 'after approval the scenario matches the local addition and the theme-gap flag is gone: ' + gc.state);
// reject with a reason
await goto(page, '#/ontology/proposals', 1200);
await page.click(`[data-act=reject][data-id="${extra.rej}"]`); await page.waitForSelector('#prop-reject-ok');
await page.fill('#prop-rejector', 'Admin Person'); await page.click('#prop-reject-ok'); await page.waitForTimeout(400);
ok(await page.isVisible('#prop-reject-ok'), 'Reject without a reason is refused');
await page.fill('#prop-reason', 'Too generic for the library'); await page.click('#prop-reject-ok'); await page.waitForTimeout(1200);
const rj = await page.evaluate(async id => (await (await import('/js/crgo.js')).proposals.read(id)), extra.rej);
ok(rj.status === 'rejected' && rj.history.some(h => h.status === 'rejected' && h.reason === 'Too generic for the library'), 'Reject records the reason');
// export: approve the public one with the box ticked and the folder empty → approved, message points to the setting; export button then offers the file
await page.click(`[data-act=approve][data-id="${extra.pub}"]`); await page.waitForSelector('#prop-approve-ok');
ok(await page.evaluate(() => document.querySelector('#prop-approve-public').checked), 'at approval Make public is shown ticked for a proposal marked public');
await page.fill('#prop-approver', 'Admin Person'); await page.click('#prop-approve-ok'); await page.waitForTimeout(1500);
ok((await page.evaluate(async id => (await (await import('/js/crgo.js')).proposals.read(id)).status, extra.pub)) === 'approved' && fs.readdirSync(OUT2).length === 0, 'Make public ticked, folder empty: approved, no file written');
await goto(page, '#/ontology/proposals', 1200);
await page.click(`[data-act=export][data-id="${extra.pub}"]`); await page.waitForSelector('#prop-export-error');
ok(/Folder for ontology proposals/.test(await page.textContent('#prop-export-error')) && await page.isVisible('#prop-open-settings'), 'export with the folder empty: the message points to Settings → Links & shared folders → Folder for ontology proposals');
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
await setFolder(OUT2);
await goto(page, '#/ontology/proposals', 1200);
await page.click(`[data-act=export][data-id="${extra.pub}"]`); await page.waitForTimeout(1500);
const files = fs.readdirSync(OUT2);
const cf2 = files.length ? JSON.parse(fs.readFileSync(path.join(OUT2, files[0]), 'utf8')) : null;
ok(files.length === 1 && cf2 && cf2.schema === 'crgo-contribution/1' && cf2.key === 'CONTRIB-' + extra.pub && !/Prop Analyst|Admin Person|PbA/.test(JSON.stringify(cf2)), 'folder set: the contribution file is written (' + files[0] + '), no name, no figure');
await goto(page, '#/ontology/proposals', 1200);
ok(await page.isVisible(`[data-act=withdraw][data-id="${extra.pub}"]`) && /Public — submitted/.test(await page.textContent(`tr:has([data-id="${extra.pub}"])`)), 'status Public — submitted, with a Withdraw action');
ok(fs.readdirSync(OUT2).length === 1, 'the local-only and rejected proposals wrote nothing');
await setFolder('');

/* ---------------- 13. non-admin in multi-user mode cannot approve ---------------- */
await page.evaluate(async () => { const U = await import('/js/users.js'); U.U.enabled = true; U.U.users = [{ id: 'u-a', name: 'Admin Person', admin: true, raci: {} }, { id: 'u-b', name: 'Plain Analyst', admin: false, raci: {} }]; U.U.current = U.U.users[1]; });
await goto(page, '#/ontology/proposals', 1200);
const na = await page.evaluate(id => ({ approve: document.querySelector(`[data-act=approve][data-id="${id}"]`)?.disabled, note: !!document.querySelector('.prop-nonadmin') }), extra.loc);
ok(na.approve === true && na.note, 'multi-user, non-administrator: Approve is disabled and the tab says it is read only');
const na2 = await page.evaluate(async id => { const C = await import('/js/crgo.js'); const r = await C.proposals.approve(id, { approver: 'Plain Analyst', date: '2026-11-12' }); return { r, status: (await C.proposals.read(id)).status }; }, extra.loc);
ok(na2.r.error && na2.r.code === 'FORBIDDEN' && na2.status === 'proposed', 'the helper refuses a non-administrator (FORBIDDEN); nothing written');
await page.evaluate(async () => { const U = await import('/js/users.js'); U.U.enabled = false; U.U.current = null; U.U.users = []; });

const errs = errors.filter(e => !/status of (502|403)/.test(e));   // 403: the non-administrator's refused approval; 502: the switched-off ontology server
ok(!errs.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close();
done('t77 ontology grouping (parts 1 and 2)');
