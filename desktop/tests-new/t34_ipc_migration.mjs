// Identity, privilege & configuration — the ipc part of data version 3 → 4 (migrateIpc4): baseline promotion, drift deviations,
// teaching-case seed, invariants, idempotence. Fixtures 1.5.4–1.5.8 and ws-1.8.2.json (DV 3, assets with baselines, two in drift).
import { open, ok, done } from './lib.mjs';
import fs from 'fs';
import { execSync } from 'child_process';
const fx = ['1.5.4', '1.5.5', '1.5.6', '1.5.7', '1.5.8', '1.8.2'].map(v => JSON.parse(fs.readFileSync(`fixtures/ws-${v}.json`, 'utf8')));
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
    const base = (before.assets || []).every((a, i) => { const b = w.assets[i].baseline, o = a.baseline; const { ref, ...rest } = b || {}; return JSON.stringify(rest) === JSON.stringify(o) && (!o?.name || (ref && ref.v === 'legacy')); });
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
if (r.dataVersion >= 4) ok(true, 'DATA_VERSION 4 wired by the integrator'); else console.log('note: DATA_VERSION is', r.dataVersion, '— the 3 → 4 step is wired by the integrator (migrateIpc4)');
let rel = 0; try { execSync('python3 ../app/tools/crgo_tbd_check.py --release', { stdio: 'pipe' }); } catch (e) { rel = e.status; }
ok(process.env.CRG_RELEASE ? rel === 0 : rel === 1, process.env.CRG_RELEASE ? 'release mode: no CRGO_TBD left' : 'release gate refuses CRGO_TBD placeholders (CRGO 0.11 not filled yet)');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t34 ipc migration');
