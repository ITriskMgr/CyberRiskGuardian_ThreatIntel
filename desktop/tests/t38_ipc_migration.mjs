// Identity, privilege & configuration — the ipc part of data version 3 → 4 (migrateIpc4): baseline promotion, drift deviations,
// teaching-case seed, invariants, idempotence. Fixtures 1.5.4–1.5.8 and ws-1.8.2.json (DV 3, assets with baselines, two in drift).
import { open, ok, done, APP, CRGO, CRGO_011 } from './lib.mjs';
import fs from 'fs';
import { execSync } from 'child_process';
const FX = v => new URL(`./fixtures/ws-${v}.json`, import.meta.url);
const fx = ['1.5.4', '1.5.5', '1.5.6', '1.5.7', '1.5.8', '1.8.2'].map(v => JSON.parse(fs.readFileSync(FX(v), 'utf8')));
const { browser, page, errors } = await open('#/process');
const r = await page.evaluate(async fx => {
  const M = await import('/js/migrate.js'); const st = await import('/js/state.js'); const R = await import('/js/reset.js'); const A = await import('/js/assets.js');
  const out = { per: [] };
  const nw = st.newWorkspace();
  out.factoryEqualsKnown = Object.keys(nw).filter(k => !M.KNOWN_FIELDS.includes(k)).length === 0 && M.KNOWN_FIELDS.filter(k => !(k in nw) && k !== 'classroom').length === 0;
  out.ipcInFactory = !!nw.ipc && Array.isArray(nw.ipc.accounts);
  const g = new Set(); for (const x of Object.values(R.GROUPS)) for (const k of x) g.add(k);
  out.knownWithoutGroup = M.KNOWN_FIELDS.filter(k => !g.has(k) && k !== 'assessment');
  out.ipcInContext = R.CONTEXT.includes('ipc');
  out.dataVersion = M.DATA_VERSION;
  const totals = w => { const t = { est: 0, res: 0 }; for (const s of w.assessment?.SCEN || []) { const x = CRG.calc(s, w.assessment.APPETITE, w.assessment.FACTOR); t.est += x.est; t.res += x.res; } return [Math.round(t.est), Math.round(t.res)].join('/'); };
  for (const f of fx) for (const w0 of f.workspaces) {
    const orig = JSON.stringify(w0);
    let w = M.migrateWorkspace(JSON.parse(orig), { fill: null }).ws;        // to the data version of this build
    w = JSON.parse(JSON.stringify(w)); delete w.ipc;
    const before = JSON.parse(JSON.stringify(w));
    const dyn0 = (w.assets || []).map(a => A.dynamic(a, w).score);
    const notes = []; const res = M.migrateIpc4(w, s => notes.push(s));
    const dyn1 = (w.assets || []).map(a => A.dynamic(a, w).score);
    const base = (before.assets || []).every((a, i) => { const b = w.assets[i].baseline, o = a.baseline; const { ref, ...rest } = b || {}; const { ref: r0, ...o0 } = o || {}; return JSON.stringify(rest) === JSON.stringify(o0) && (!o?.name || (ref && ref.v === 'legacy')); });
    const snap = JSON.stringify(w); const again = M.migrateIpc4(w, () => {}); const idem = JSON.stringify(w) === snap;
    out.per.push({ app: f.app, name: w.name, res, notes: notes.length, baselines: w.ipc.baselines.map(b => `${b.id}|${b.kind}|${b.versions[0].state}|${b.versions[0].applicability.assetTypes.join('+')}`),
      drift: w.ipc.deviations.filter(d => d.migrated).map(d => `${d.asset}|${d.cls === ''}|${d.opened}|${d.note}`), scopes: w.ipc.ciScopes.filter(c => c.fromAssets).length,
      base, dyn: JSON.stringify(dyn0) === JSON.stringify(dyn1), totals: totals(before) === totals(w), assessment: (() => { const a = JSON.parse(JSON.stringify(w.assessment)), e0 = before.assessment.EVIDENCE || []; const pre = JSON.stringify((a.EVIDENCE || []).slice(0, e0.length)) === JSON.stringify(e0); a.EVIDENCE = e0; return pre && JSON.stringify(a) === JSON.stringify(before.assessment); })(), seeded: res.seeded,
      idem, again, origUntouched: JSON.stringify(w0) === orig, proposals: w.ipc.findings.flatMap(f => f.proposals).length });
  }
  // invariant: the step throws (and the caller keeps the original) when a risk number would move
  const bad = JSON.parse(JSON.stringify(fx[5].workspaces[0])); delete bad.ipc;
  bad.assets[0].baseline = { name: 'X', status: 'drift', get ref() { return undefined; }, set ref(v) { bad.assessment.SCEN[0].params.Pbx.v = 0.99; } };
  try { M.migrateIpc4(bad); out.throws = false; } catch (e) { out.throws = /ipc migration/.test(e.message); }
  // the teaching case is seeded once, evidence appended, nothing accepted
  const mb = st.medibecWorkspace(); delete mb.ipc; mb.assessment.EVIDENCE = mb.assessment.EVIDENCE.slice(0, 12); mb.shared.exceptions = [];
  const t0 = totals(mb); M.migrateIpc4(mb); const t1 = totals(mb);
  out.medibec = { ev: mb.assessment.EVIDENCE.length, f: mb.ipc.findings.length, accepted: mb.ipc.findings.some(f => f.proposals.some(p => p.state === 'accepted')), same: t0 === t1, t1 };
  // the whole chain: the 1.8.2 fixture through migrateWorkspace (3 → 4, STEP4)
  { const res = M.migrateWorkspace(JSON.parse(JSON.stringify(fx[5].workspaces[0])), { fill: st.migrate });
    out.full = { to: res.ws.dataVersion, ipc: !!res.ws.ipc?.baselines?.length, drift: (res.ws.ipc?.deviations || []).filter(d => d.migrated).length,
      ref: res.ws.assets.filter(a => a.baseline?.name).every(a => a.baseline.ref?.v === 'legacy'), journal: res.steps.some(s => s.to === 4 && s.notes.some(n => /promoted from the asset register/.test(n))) }; }
  // review M1 — a student's MediBec copy without S27 and S28 (deleted or renumbered) still migrates 3 → 4: the links are left out and journalled
  { const I = await import('/js/ipc.js');
    const mb = st.medibecWorkspace(); delete mb.ipc; mb.assessment.EVIDENCE = mb.assessment.EVIDENCE.slice(0, 12); mb.shared.exceptions = [];
    mb.assessment.SCEN = mb.assessment.SCEN.filter(s => s.id !== 'S27' && s.id !== 'S28'); mb.dataVersion = 3;
    const res = M.migrateWorkspace(JSON.parse(JSON.stringify(mb)), { fill: st.migrate });
    const notes = res.steps.flatMap(s => s.notes), F = res.ws.ipc?.findings || [], sc = rule => (F.find(f => f.rule === rule)?.scenarios || []).map(s => s.id).join('+');
    let strictThrows = false; try { const w2 = JSON.parse(JSON.stringify(mb)); delete w2.ipc; I.applySample(w2, globalThis.CRG_IPC_SAMPLES.medibec); } catch { strictThrows = true; }
    const cr = st.exampleWorkspace('canaretail'); delete cr.ipc; cr.assessment.SCEN = cr.assessment.SCEN.filter(s => s.id !== 'S10'); cr.dataVersion = 3;
    const rc = M.migrateWorkspace(JSON.parse(JSON.stringify(cr)), { fill: st.migrate });
    out.missing = { status: res.status, error: res.error || '', to: res.ws.dataVersion, findings: F.length, ir04: sc('IR-04'), ir07: sc('IR-07'), ir08: sc('IR-08'), ir02: sc('IR-02'),
      journal: notes.filter(n => /not linked to scenario S2[78], which is not in this workspace/.test(n)).length, accepted: F.some(f => f.proposals.some(p => p.state === 'accepted')), strictThrows,
      cana: { status: rc.status, error: rc.error || '', proposals: (rc.ws.ipc?.findings || []).flatMap(f => f.proposals).length, journal: rc.steps.flatMap(s => s.notes).some(n => /sample proposal of finding IR-01 not added — no scenario S10/.test(n)) } }; }
  // a workspace written by a newer release opens read-only
  const newer = M.migrateWorkspace({ ...nw, dataVersion: M.DATA_VERSION + 1 });
  out.newer = newer.status;
  return out;
}, fx);
ok(r.factoryEqualsKnown, 'KNOWN_FIELDS equals the factory');
ok(r.ipcInFactory, 'newWorkspace has an empty ipc record');
ok(!r.knownWithoutGroup.length && r.ipcInContext, 'every field in a reset group; ipc in CONTEXT ' + r.knownWithoutGroup);
for (const p of r.per) {
  ok(p.origUntouched && p.assessment && p.totals && p.dyn, JSON.stringify([p.origUntouched, p.assessment, p.totals, p.dyn]) + `${p.app}: original untouched, assessment equal (evidence only appended${p.seeded ? ', teaching case seeded' : ''}), engine totals and asset scores equal`);
  ok(p.base, `${p.app}: asset.baseline = original + ref`);
  ok(p.idem && !p.again.created && !p.again.promoted && !p.again.drift, `${p.app}: idempotent`);
  ok(p.proposals === 0, `${p.app}: no proposal created`);
}
const x = r.per.find(p => p.app === '1.8.2');
ok(x.baselines.length === 3 && x.baselines.includes('BL-01|cis-benchmark|legacy|server') && x.baselines.includes('BL-02|internal|legacy|hardware') && x.baselines.includes('BL-03|stig|legacy|network'), '1.8.2: three baselines promoted, kind inferred, legacy version, applicability ' + x.baselines);
ok(x.drift.length === 2 && x.drift.includes('A-001|true|2026-08-01|SMBv1 enabled') && x.drift.includes('A-003|true|2026-07-15|Local admin rights'), '1.8.2: the two drift assets get a deviation to be classified ' + x.drift);
ok(x.scopes === 1 && x.notes >= 6, '1.8.2: one live scope from Information assets; every action journalled (' + x.notes + ' notes)');
ok(r.throws, 'an invariant violation throws');
ok(r.medibec.ev === 15 && r.medibec.f === 5 && !r.medibec.accepted && r.medibec.same && r.medibec.t1 === '84305/41023', 'MediBec seeded: E13–E15, five findings, nothing accepted, 84,305 / 41,023 ' + JSON.stringify(r.medibec));
ok(r.newer === 'newer', 'a newer workspace opens read-only');
const mi = r.missing;
ok(mi.status === 'migrated' && mi.to === 4 && mi.findings === 5 && mi.ir04 === '' && mi.ir07 === '' && mi.ir08 === 'S5' && mi.ir02 === 'S1+S5+S20' && !mi.accepted,
  'review M1: a MediBec copy without S27/S28 migrates 3 → 4, the sample keeps its five findings and leaves out the missing links ' + JSON.stringify(mi));
ok(mi.journal === 3, 'review M1: each left-out link is journalled in the migration log (' + mi.journal + ')');
ok(mi.strictThrows, 'review M1: applySample stays strict outside the seed (an explicit load still refuses a missing scenario)');
ok(mi.cana.status === 'migrated' && mi.cana.proposals === 0 && mi.cana.journal, 'review M1: a CanaRetail copy without S10 migrates, its sample proposal is left out and journalled ' + JSON.stringify(mi.cana));
ok(r.dataVersion === 4 && r.full.to === 4 && r.full.ipc && r.full.journal && r.full.drift === 2 && r.full.ref, 'the 1.8.2 fixture reaches data version 4 through the STEP4 ipc sub-step ' + JSON.stringify(r.full));
// 1.9.0 — IPC.CRGO is filled from CRGO 0.11.0: the release gate passes and every identifier is defined in the CRGO checkout
let rel = 0, relOut = ''; try { relOut = execSync(`python3 ${APP}/tools/crgo_tbd_check.py --release${CRGO_011 ? ' --crgo ' + CRGO : ''}`, { stdio: 'pipe' }).toString(); } catch (e) { rel = e.status; relOut = String(e.stdout || e); }
ok(rel === 0 && /every CRGO identifier is filled/.test(relOut), (CRGO_011 ? 'release gate: no CRGO_TBD left, every IPC.CRGO identifier defined in CRGO ' : 'release gate: no CRGO_TBD left ') + relOut.trim().replace(/\n/g, ' · '));
const map = await page.evaluate(async () => { const I = await import('/js/ipc.js'); return { rel: I.CRGO_RELEASE, pending: I.crgoPending().length, proposed: I.crgoProposed().length,
  acc: I.CRGO.AccountPopulation.iri, kri: I.CRGO['CRG-24'].iri, drift: I.CRGO['drift:unknown'].iri }; });
ok(map.rel === '0.11.0' && map.pending === 0 && map.proposed > 0 && map.acc === 'https://w3id.org/crgo/CRGO_0001384' && map.kri === 'https://w3id.org/crgo/CRGO_0001476'
  && map.drift === 'https://w3id.org/crgo/CRGO_0001460', 'IPC.CRGO cites CRGO 0.11.0 (account population, expired-exceptions indicator, unknown drift) ' + JSON.stringify(map));
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t38 ipc migration');
