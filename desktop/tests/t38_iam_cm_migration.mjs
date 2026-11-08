// Identity & access management and Configuration management — migrations.
//  • data version 3 → 4: the iam and cm sub-steps of STEP4 (migrateIam4, migrateCm4): baseline promotion into cm, drift deviations,
//    teaching-case seed per module, invariants, idempotence. Fixtures 1.5.4–1.5.8 and ws-1.8.2.json (DV 3, assets with baselines).
//  • data version 4 → 5 (splitIpc5): ws-1.9.0-preSplit.json, saved by the pre-split 1.9.0 build (DV 4, one `ipc` record), is split
//    losslessly into iam and cm, journalled, idempotent, no risk number changed, ipc removed, the stored copy from before kept.
import { open, ok, done, APP, CRGO, CRGO_011, reload } from './lib.mjs';
import fs from 'fs';
import { execSync } from 'child_process';
const FX = v => new URL(`./fixtures/ws-${v}.json`, import.meta.url);
const fx = ['1.5.4', '1.5.5', '1.5.6', '1.5.7', '1.5.8', '1.8.2'].map(v => JSON.parse(fs.readFileSync(FX(v), 'utf8')));
const pre = JSON.parse(fs.readFileSync(FX('1.9.0-preSplit'), 'utf8'));
const { browser, page, errors } = await open('#/process');
const r = await page.evaluate(async ({ fx, pre }) => {
  const M = await import('/js/migrate.js'); const st = await import('/js/state.js'); const R = await import('/js/reset.js'); const A = await import('/js/assets.js');
  const IAM = await import('/js/iam.js'); const CM = await import('/js/cm.js');
  const out = { per: [] };
  const nw = st.newWorkspace();
  out.factoryEqualsKnown = Object.keys(nw).filter(k => !M.KNOWN_FIELDS.includes(k)).length === 0 && M.KNOWN_FIELDS.filter(k => !(k in nw) && k !== 'classroom').length === 0;
  out.inFactory = !!nw.iam && Array.isArray(nw.iam.accounts) && !('baselines' in nw.iam) && !!nw.cm && Array.isArray(nw.cm.baselines) && !('accounts' in nw.cm) && !('ipc' in nw) && !M.KNOWN_FIELDS.includes('ipc');
  const g = new Set(); for (const x of Object.values(R.GROUPS)) for (const k of x) g.add(k);
  out.knownWithoutGroup = M.KNOWN_FIELDS.filter(k => !g.has(k) && k !== 'assessment');
  out.inContext = R.CONTEXT.includes('iam') && R.CONTEXT.includes('cm') && !R.CONTEXT.includes('ipc');
  out.dataVersion = M.DATA_VERSION;
  out.step4 = M.STEP4.map(s => s.field + ':' + s.group).join();
  const totals = w => { const t = { est: 0, res: 0 }; for (const s of w.assessment?.SCEN || []) { const x = CRG.calc(s, w.assessment.APPETITE, w.assessment.FACTOR); t.est += x.est; t.res += x.res; } return [Math.round(t.est), Math.round(t.res)].join('/'); };
  for (const f of fx) for (const w0 of f.workspaces) {
    const orig = JSON.stringify(w0);
    let w = M.migrateWorkspace(JSON.parse(orig), { fill: null }).ws;        // to the data version of this build
    w = JSON.parse(JSON.stringify(w)); delete w.iam; delete w.cm;
    const before = JSON.parse(JSON.stringify(w));
    const dyn0 = (w.assets || []).map(a => A.dynamic(a, w).score);
    const notes = []; const ri = M.migrateIam4(w, s => notes.push(s)); const res = M.migrateCm4(w, s => notes.push(s));
    const dyn1 = (w.assets || []).map(a => A.dynamic(a, w).score);
    const base = (before.assets || []).every((a, i) => { const b = w.assets[i].baseline, o = a.baseline; const { ref, ...rest } = b || {}; const { ref: r0, ...o0 } = o || {}; return JSON.stringify(rest) === JSON.stringify(o0) && (!o?.name || (ref && ref.v === 'legacy')); });
    const snap = JSON.stringify(w); M.migrateIam4(w, () => {}); const again = M.migrateCm4(w, () => {}); const idem = JSON.stringify(w) === snap;
    out.per.push({ app: f.app, name: w.name, res, notes: notes.length, baselines: w.cm.baselines.map(b => `${b.id}|${b.kind}|${b.versions[0].state}|${b.versions[0].applicability.assetTypes.join('+')}`),
      drift: w.cm.deviations.filter(d => d.migrated).map(d => `${d.asset}|${d.cls === ''}|${d.opened}|${d.note}`), scopes: w.cm.ciScopes.filter(c => c.fromAssets).length,
      base, dyn: JSON.stringify(dyn0) === JSON.stringify(dyn1), totals: totals(before) === totals(w), assessment: (() => { const a = JSON.parse(JSON.stringify(w.assessment)), e0 = before.assessment.EVIDENCE || []; const p = JSON.stringify((a.EVIDENCE || []).slice(0, e0.length)) === JSON.stringify(e0); a.EVIDENCE = e0; return p && JSON.stringify(a) === JSON.stringify(before.assessment); })(), seeded: res.seeded || ri.seeded,
      idem, again, origUntouched: JSON.stringify(w0) === orig, proposals: [...w.iam.findings, ...w.cm.findings].flatMap(f => f.proposals).length, noBaselineInIam: !('baselines' in w.iam) });
  }
  // invariant: the step throws (and the caller keeps the original) when a risk number would move
  const bad = JSON.parse(JSON.stringify(fx[5].workspaces[0])); delete bad.cm;
  bad.assets[0].baseline = { name: 'X', status: 'drift', get ref() { return undefined; }, set ref(v) { bad.assessment.SCEN[0].params.Pbx.v = 0.99; } };
  try { M.migrateCm4(bad); out.throws = false; } catch (e) { out.throws = /cm migration/.test(e.message); }
  // the teaching case is seeded once per module, IAM first, evidence appended, nothing accepted
  const mb = st.medibecWorkspace(); delete mb.iam; delete mb.cm; mb.assessment.EVIDENCE = mb.assessment.EVIDENCE.slice(0, 12); mb.shared.exceptions = [];
  const t0 = totals(mb); M.migrateIam4(mb); M.migrateCm4(mb); const t1 = totals(mb);
  out.medibec = { ev: mb.assessment.EVIDENCE.length, fi: mb.iam.findings.map(f => f.id + f.rule + f.eid).join(), fc: mb.cm.findings.map(f => f.id + f.rule + f.eid).join(),
    exc: mb.shared.exceptions.map(x => x.id).join(), accepted: [...mb.iam.findings, ...mb.cm.findings].some(f => f.proposals.some(p => p.state === 'accepted')), same: t0 === t1, t1 };
  // the whole chain: the 1.8.2 fixture through migrateWorkspace (3 → 4 → 5)
  { const res = M.migrateWorkspace(JSON.parse(JSON.stringify(fx[5].workspaces[0])), { fill: st.migrate });
    out.full = { to: res.ws.dataVersion, steps: res.steps.map(s => s.from + '→' + s.to).join(), cm: !!res.ws.cm?.baselines?.length, ipc: 'ipc' in res.ws, drift: (res.ws.cm?.deviations || []).filter(d => d.migrated).length,
      ref: res.ws.assets.filter(a => a.baseline?.name).every(a => a.baseline.ref?.v === 'legacy'), journal: res.steps.some(s => s.to === 4 && s.notes.some(n => /promoted from the asset register/.test(n))) }; }
  // review M1 — a student's MediBec copy without S27 and S28 still migrates: the links are left out and journalled
  { const mb2 = st.medibecWorkspace(); delete mb2.iam; delete mb2.cm; mb2.assessment.EVIDENCE = mb2.assessment.EVIDENCE.slice(0, 12); mb2.shared.exceptions = [];
    mb2.assessment.SCEN = mb2.assessment.SCEN.filter(s => s.id !== 'S27' && s.id !== 'S28'); mb2.dataVersion = 3;
    const res = M.migrateWorkspace(JSON.parse(JSON.stringify(mb2)), { fill: st.migrate });
    const notes = res.steps.flatMap(s => s.notes), F = [...(res.ws.iam?.findings || []), ...(res.ws.cm?.findings || [])], sc = rule => (F.find(f => f.rule === rule)?.scenarios || []).map(s => s.id).join('+');
    let strictThrows = false; try { const w2 = JSON.parse(JSON.stringify(mb2)); delete w2.iam; IAM.applySample(w2, globalThis.CRG_IAM_SAMPLES.medibec); } catch { strictThrows = true; }
    const cr = st.exampleWorkspace('canaretail'); delete cr.iam; delete cr.cm; cr.assessment.SCEN = cr.assessment.SCEN.filter(s => s.id !== 'S10'); cr.dataVersion = 3;
    const rc = M.migrateWorkspace(JSON.parse(JSON.stringify(cr)), { fill: st.migrate });
    out.missing = { status: res.status, error: res.error || '', to: res.ws.dataVersion, findings: F.length, ir04: sc('IR-04'), ir07: sc('IR-07'), ir08: sc('IR-08'), ir02: sc('IR-02'),
      journal: notes.filter(n => /not linked to scenario S2[78], which is not in this workspace/.test(n)).length, accepted: F.some(f => f.proposals.some(p => p.state === 'accepted')), strictThrows,
      cana: { status: rc.status, error: rc.error || '', proposals: (rc.ws.iam?.findings || []).flatMap(f => f.proposals).length, journal: rc.steps.flatMap(s => s.notes).some(n => /sample proposal of finding IR-01 not added — no scenario S10/.test(n)) } }; }
  // a workspace written by a newer release opens read-only
  out.newer = M.migrateWorkspace({ ...nw, dataVersion: M.DATA_VERSION + 1 }).status;

  /* ---------- data version 4 → 5: the pre-split workspaces ---------- */
  out.split = [];
  for (const w0 of pre.workspaces) {
    const orig = JSON.stringify(w0), ipc = w0.ipc;
    const res = M.migrateWorkspace(JSON.parse(orig), { fill: st.migrate }); const w = res.ws;
    const byId = (rows, id) => (rows || []).find(r => r.id === id);
    const lossless = [...IAM.REGISTER_KEYS.map(k => [k, w.iam]), ...CM.REGISTER_KEYS.map(k => [k, w.cm])].every(([k, R]) => (ipc[k] || []).length === R[k].length && ipc[k].every(r => JSON.stringify(byId(R[k], r.id)) === JSON.stringify(r)));
    const fin = (ipc.findings || []).every(f => JSON.stringify(byId(CM.REGISTER_KEYS.includes(f.register) ? w.cm.findings : w.iam.findings, f.id)) === JSON.stringify(f))
      && w.iam.findings.length + w.cm.findings.length === ipc.findings.length;
    // the step itself leaves the assessment deep-equal (the shape repair run after it completes empty scenario fields, as for every workspace)
    const assessment = JSON.stringify(M.migrateWorkspace(JSON.parse(orig), { fill: null }).ws.assessment) === JSON.stringify(w0.assessment);
    const again = M.migrateWorkspace(JSON.parse(JSON.stringify(w)), { fill: st.migrate }).status;
    const w2 = JSON.parse(JSON.stringify(w)); M.splitIpc5(w2); const idem = JSON.stringify(w2) === JSON.stringify(w);
    // a pre-split record that would lose a row makes the step fail and leaves the original untouched
    const broken = JSON.parse(orig); broken.iam = { accounts: [{ ...broken.ipc.accounts[0], label: 'different row, same id' }] };
    const rb = M.migrateWorkspace(broken, { fill: st.migrate });
    // KRIs computed from the split records equal those of the single record (CRG-23 + CRG-25 = the former known coverage)
    const K = { ...IAM.kri(w).meta, ...CM.kri(w).meta };
    out.split.push({ name: w0.name, from: res.from, status: res.status, to: w.dataVersion, original: res.original === undefined ? false : JSON.stringify(res.original) === orig, untouched: JSON.stringify(w0) === orig,
      ipc: 'ipc' in w, lossless, fin, assessment, totals: totals(w0) === totals(w), again, idem, broken: rb.status + ':' + /would be lost/.test(rb.error || '') + ':' + (JSON.stringify(rb.ws) === JSON.stringify(broken)),
      notes: res.steps.filter(s => s.to === 5).flatMap(s => s.notes), steps: res.steps.map(s => s.from + '→' + s.to).join(),
      fi: w.iam.findings.map(f => f.id + ':' + f.rule).join(), fc: w.cm.findings.map(f => f.id + ':' + f.rule).join(), si: w.iam.settings, sc: w.cm.settings,
      imp: [w.iam.imports.map(t => t.file).join(), w.cm.imports.map(t => t.file).join()], acts: (w.shared.actions || []).map(a => a.source.kind + ':' + a.source.id).join(),
      accepted: w.iam.findings.flatMap(f => f.proposals).filter(p => p.state === 'accepted').length, pending: [...w.iam.findings, ...w.cm.findings].flatMap(f => f.proposals).filter(p => p.state === 'proposed').length,
      basis: w.assessment.SCEN.flatMap(s => (s.ipc_basis || []).map(b => s.id + ':' + b.finding)).join(), kriDefs: (w.kriDefs || []).map(o => o.id).join(),
      nd: Object.fromEntries(Object.entries(K).map(([k, m]) => [k, `${m.num}/${m.den}`])) });
  }
  return out;
}, { fx, pre });
ok(r.factoryEqualsKnown, 'KNOWN_FIELDS equals the factory');
ok(r.inFactory, 'newWorkspace has two separate empty records, iam and cm, and no ipc');
ok(!r.knownWithoutGroup.length && r.inContext, 'every field in a reset group; iam and cm in CONTEXT ' + r.knownWithoutGroup);
ok(r.dataVersion === 6, 'DATA_VERSION is 6');
ok(r.step4 === 'consultant:ASSESSMENT,iam:CONTEXT,cm:CONTEXT,ssvc:CONTEXT', 'STEP4 has the iam and cm entries in place of ipc ' + r.step4);
for (const p of r.per) {
  ok(p.origUntouched && p.assessment && p.totals && p.dyn, `${p.app}: original untouched, assessment equal (evidence only appended${p.seeded ? ', teaching case seeded' : ''}), engine totals and asset scores equal`);
  ok(p.base, `${p.app}: asset.baseline = original + ref`);
  ok(p.idem && !p.again.created && !p.again.promoted && !p.again.drift, `${p.app}: idempotent`);
  ok(p.proposals === 0 && p.noBaselineInIam, `${p.app}: no proposal created; baselines only in cm`);
}
const x = r.per.find(p => p.app === '1.8.2');
ok(x.baselines.length === 3 && x.baselines.includes('BL-01|cis-benchmark|legacy|server') && x.baselines.includes('BL-02|internal|legacy|hardware') && x.baselines.includes('BL-03|stig|legacy|network'), '1.8.2: three baselines promoted into cm, kind inferred, legacy version, applicability ' + x.baselines);
ok(x.drift.length === 2 && x.drift.includes('A-001|true|2026-08-01|SMBv1 enabled') && x.drift.includes('A-003|true|2026-07-15|Local admin rights'), '1.8.2: the two drift assets get a deviation to be classified ' + x.drift);
ok(x.scopes === 1 && x.notes >= 6, '1.8.2: one live scope from Information assets; every action journalled (' + x.notes + ' notes)');
ok(r.throws, 'an invariant violation throws');
ok(r.medibec.ev === 15 && r.medibec.fi === 'IF-01IR-02E13,IF-02IR-04E13,IF-03IR-07E13,IF-04IR-08E14' && r.medibec.fc === 'IF-05IR-11E15' && r.medibec.exc === 'EXC-90' && !r.medibec.accepted && r.medibec.same && r.medibec.t1 === '84305/41023',
  'MediBec seeded per module: E13–E14 identity, E15 configuration, IF-01–IF-05 as before, nothing accepted, 84,305 / 41,023 ' + JSON.stringify(r.medibec));
ok(r.newer === 'newer', 'a newer workspace opens read-only');
const mi = r.missing;
ok(mi.status === 'migrated' && mi.to === 6 && mi.findings === 5 && mi.ir04 === '' && mi.ir07 === '' && mi.ir08 === 'S5' && mi.ir02 === 'S1+S5+S20' && !mi.accepted,
  'review M1: a MediBec copy without S27/S28 migrates, the samples keep their five findings and leave out the missing links ' + JSON.stringify(mi));
ok(mi.journal === 3, 'review M1: each left-out link is journalled in the migration log (' + mi.journal + ')');
ok(mi.strictThrows, 'review M1: applySample stays strict outside the seed (an explicit load still refuses a missing scenario)');
ok(mi.cana.status === 'migrated' && mi.cana.proposals === 0 && mi.cana.journal, 'review M1: a CanaRetail copy without S10 migrates, its sample proposal is left out and journalled ' + JSON.stringify(mi.cana));
ok(r.full.to === 6 && r.full.steps === '3→4,4→5,5→6' && r.full.cm && !r.full.ipc && r.full.journal && r.full.drift === 2 && r.full.ref, 'the 1.8.2 fixture reaches data version 6 through the STEP4 cm sub-step ' + JSON.stringify(r.full));
// data version 4 → 5
ok(r.split.length === 2, 'two pre-split workspaces in the fixture');
for (const s of r.split) {
  ok(s.from === 4 && s.status === 'migrated' && s.to === 6 && s.steps === '4→5,5→6' && !s.ipc, `${s.name}: data version 4 → 5 in one step (then 5 → 6), the ipc record removed`);
  ok(s.lossless && s.fin, `${s.name}: every row and finding moved unchanged, identifiers kept`);
  ok(s.assessment && s.totals && s.untouched && s.original, `${s.name}: assessment and engine totals unchanged; the original kept for the copy from before ` + JSON.stringify([s.assessment, s.totals, s.untouched, s.original]));
  ok(s.again === 'current' && s.idem, `${s.name}: idempotent (a second run changes nothing)`);
  ok(/^failed:true:true$/.test(s.broken), `${s.name}: a split that would lose a row fails and leaves the workspace as it was (${s.broken})`);
  ok(s.notes.some(n => /record split: \d+ row\(s\) and \d+ finding\(s\) to Identity & access management, \d+ row\(s\) and \d+ finding\(s\) to Configuration management/.test(n)) && s.notes.some(n => /ipc record removed/.test(n)), `${s.name}: journalled ` + s.notes.join(' | ').slice(0, 200));
}
const org = r.split.find(s => /Fixture org/.test(s.name)), mbs = r.split.find(s => /MediBec/.test(s.name));
ok(org.fi === 'IF-01:IR-01,IF-03:IR-05' && org.fc === 'IF-02:IR-11,IF-04:IR-13,IF-05:IR-12', 'findings go with the module of their register, interleaved identifiers kept ' + org.fi + ' · ' + org.fc);
ok(JSON.stringify(org.si) === '{"asOf":"2026-10-31","staleDays":60,"reviewMonths":6,"testDays":180,"dormantDays":45}' && JSON.stringify(org.sc) === '{"asOf":"2026-10-31","staleDays":60}', 'settings split by what each module uses ' + JSON.stringify([org.si, org.sc]));
ok(org.imp[0] === 'idp-export.csv' && org.imp[1] === 'cm-report.pdf', 'each import trace goes with the module whose rows it created ' + org.imp);
ok(org.acts === 'cm-finding:IF-02,iam-finding:IF-03', 'corrective actions name the module of their finding ' + org.acts);
ok(org.accepted === 1 && org.pending === 1 && org.basis === 'S5:IF-01', 'the accepted proposal and the pending one kept; the scenario basis unchanged ' + org.basis);
ok(org.kriDefs === 'CRG-22,CRG-17', 'KRI threshold overrides kept');
ok(mbs.fi === 'IF-01:IR-02,IF-02:IR-04,IF-03:IR-07,IF-04:IR-08' && mbs.fc === 'IF-05:IR-11', 'MediBec: four identity findings and one configuration finding, as seeded by this build');
const nd = mbs.nd, [a23, b23] = nd['CRG-23'].split('/').map(Number), [a25, b25] = nd['CRG-25'].split('/').map(Number);
ok(nd['CRG-17'] === '1479/1505' && nd['CRG-18'] === '74/94' && nd['CRG-22'] === '1108/1456' && a23 + a25 === 67 && b23 + b25 === 82,
  'MediBec KRIs after the split equal the single record\'s; CRG-23 + CRG-25 = the former known coverage 67/82 ' + JSON.stringify(nd));
// the stored workspace: start-up migrates it once and keeps the copy from before (premig)
const stored = await page.evaluate(async pre => { const store = await import('/js/store.js'); const w = JSON.parse(JSON.stringify(pre.workspaces.find(x => /Fixture org/.test(x.name)))); w.id = 'ws_presplit'; await store.put('ws', w.id, w); return w.id; }, pre);
await reload(page);
const s2 = await page.evaluate(async id => { const store = await import('/js/store.js'); const w = await store.get('ws', id); const p = await store.get('blob', 'premig:' + id);
  return { v: w.dataVersion, ipc: 'ipc' in w, iam: w.iam?.accounts?.length, cm: w.cm?.baselines?.length, pre: !!p && p.ws?.dataVersion === 4 && !!p.ws?.ipc, log: (w.migrationLog || []).at(-1)?.steps?.map(s => s.to).join() }; }, stored);
ok(s2.v === 6 && !s2.ipc && s2.iam === 2 && s2.cm === 1 && s2.pre && s2.log === '5,6', 'start-up splits a stored pre-split workspace, journals it and keeps the copy from before ' + JSON.stringify(s2));
await page.evaluate(async id => { const store = await import('/js/store.js'); await store.del?.('ws', id); await store.del?.('blob', 'premig:' + id); }, stored).catch(() => {});
// 1.9.0 — IAM.CRGO and CM.CRGO are filled from CRGO 0.11.0: the release gate passes and every identifier is defined in the CRGO checkout
let rel = 0, relOut = ''; try { relOut = execSync(`python3 ${APP}/tools/crgo_tbd_check.py --release${CRGO_011 ? ' --crgo ' + CRGO : ''}`, { stdio: 'pipe' }).toString(); } catch (e) { rel = e.status; relOut = String(e.stdout || e); }
ok(rel === 0 && /every CRGO identifier is filled/.test(relOut), (CRGO_011 ? 'release gate: no CRGO_TBD left, every identifier defined in CRGO ' : 'release gate: no CRGO_TBD left ') + relOut.trim().replace(/\n/g, ' · '));
const map = await page.evaluate(async () => { const I = await import('/js/iam.js'); const C = await import('/js/cm.js'); return { rel: I.CRGO_RELEASE + C.CRGO_RELEASE, pending: I.crgoPending().length + C.crgoPending().length, proposed: I.crgoProposed().length + C.crgoProposed().length,
  acc: I.CRGO.AccountPopulation.iri, kri: C.CRGO['CRG-24'].iri, k25: C.CRGO['CRG-25'].iri, drift: C.CRGO['drift:unknown'].iri, iamDrift: 'drift:unknown' in I.CRGO, cmAcc: 'AccountPopulation' in C.CRGO }; });
ok(map.rel === '0.11.00.11.0' && map.pending === 0 && map.proposed === 0 && map.acc === 'https://w3id.org/crgo/CRGO_0001384' && map.kri === 'https://w3id.org/crgo/CRGO_0001476'
  && map.k25 === 'https://w3id.org/crgo/CRGO_0001475' && map.drift === 'https://w3id.org/crgo/CRGO_0001460' && !map.iamDrift && !map.cmAcc, 'IAM.CRGO and CM.CRGO cite CRGO 0.11.0, every term approved, each its own concepts ' + JSON.stringify(map));
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t38 iam cm migration');
