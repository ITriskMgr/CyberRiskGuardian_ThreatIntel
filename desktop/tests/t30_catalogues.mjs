// 1.8.0 — only ISO/IEC 27002:2022, NIST CSF 2.0 and CIS v8.1 ship; legacy references are migrated with the
// old identifier kept in a note, unmapped ones flagged for review (never dropped), QC-23 lists them.
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const r = await page.evaluate(async () => {
  const K = await import('/js/catalog.js'); const M = await import('/js/migrate.js'); const st = await import('/js/state.js');
  const fws = K.frameworkList().map(f => f.id);
  const legacyCount = K.controls().filter(c => /^USR-/.test(c.fw)).length;
  const ex = st.S.list.find(w => w.kind === 'example');
  const w = JSON.parse(JSON.stringify(ex)); w.id = 'ws_legacy'; w.name = 'Legacy catalogues'; w.kind = 'organization'; w.dataVersion = 2;
  delete w.screening; delete w.mgmtSummary; delete w.catalogueMigration;
  w.measures = [{ id: 'M-L1', name: 'MFA', status: 'proposed', scen: ['S1'], ctl: ['USR-ISO13:9.4.2', 'USR-CSF11:PR.AC-7', 'USR-CIS71:16.3', 'USR-CSF11:ORG-APPLICATION', 'ISO22:5.15'], rp: 0.4, ri: 0.1 }];
  w.compliance = { frameworks: ['USR-ISO13', 'CSF2'], soa: { 'USR-ISO13:5.1.1': { status: 'implemented', evidence: 'policy v3' }, 'USR-ISO13:18.1.4': { status: 'partial' } }, checklists: {} };
  w.appetite_rationale = 'Low appetite. Analyst estimate — validation required.';
  const before = CRG.run(w.assessment).totals;
  const res = M.migrateWorkspace(w, { fill: st.migrate });
  const m = res.ws, after = CRG.run(m.assessment).totals;
  await st.create(m);
  const QC = await import('/js/panels/qc.js'); const q = QC.checks(m);
  return { fws, legacyCount, status: res.status, to: m.dataVersion, ctl: m.measures[0].ctl, notes: m.measures[0].legacyControls, review: m.measures[0].needsReview,
    fwList: m.compliance.frameworks, soa: Object.keys(m.compliance.soa), soaNote: m.compliance.soa['ISO22:5.1']?.legacyControls?.[0]?.note,
    mig: m.catalogueMigration, rat: m.appetite_rationale, same: Math.round(before.est) === Math.round(after.est) && Math.round(before.res) === Math.round(after.res),
    q23: q.find(x => x.id === 'QC-23'), q19: q.find(x => x.id === 'QC-19').state, steps: res.steps.map(s => s.notes).flat() };
});
ok(!r.fws.some(f => /^USR-/.test(f)) && r.legacyCount === 0, 'no legacy catalogue in the application ' + r.fws);
ok(['ISO22', 'CSF2', 'CIS81', 'NIST-53'].every(f => r.fws.includes(f)), 'current editions present');
ok(r.status === 'migrated' && r.to === 4, 'migrated to data version 4');
ok(JSON.stringify(r.ctl) === JSON.stringify(['ISO22:8.5', 'CSF2:PR.AA-03', 'CIS81:CIS 5', 'USR-CSF11:ORG-APPLICATION', 'ISO22:5.15']), 'mapped keys, the unmapped one kept ' + JSON.stringify(r.ctl));
ok(r.notes.length === 4 && /USR-ISO13:9\.4\.2 \(legacy\) → ISO22:8\.5/.test(r.notes[0].note) && r.review === true, 'old identifiers kept in a note; the item is flagged for review');
ok(JSON.stringify(r.fwList) === '["ISO22","CSF2"]', 'framework list mapped and de-duplicated');
ok(r.soa.includes('ISO22:5.1') && r.soa.includes('ISO22:5.34') && /USR-ISO13:5\.1\.1/.test(r.soaNote), 'statement of applicability re-keyed with the note');
ok(r.mig.some(d => d.from === 'USR-CSF11:ORG-APPLICATION' && d.review) && r.mig.filter(d => !d.review).length >= 5, 'the migration record lists what was mapped and what needs review');
ok(r.rat === 'Low appetite. Analytical estimate — validation required.', 'outdated marker modernized');
ok(r.same, 'no number changed by the migration');
ok(r.q23.state === 'warn' && /ORG-APPLICATION/.test(r.q23.detail), 'QC-23 lists the reference to review');
ok(r.q19 === 'pass', 'QC-19: no outdated marker left');
ok(r.steps.some(n => /mapped to ISO\/IEC 27002:2022/.test(n)) && r.steps.some(n => /flagged for review/.test(n)), 'migration journal says what it did');
// the measure still opens in Risk mitigation
await page.evaluate(() => { location.hash = '#/mitigation'; }); await page.waitForTimeout(900);
const bad = await page.evaluate(() => [...document.querySelectorAll('#panel-mitigation .banner')].some(b => /raised an error/.test(b.textContent)));
ok(!bad, 'Risk mitigation renders with a flagged legacy reference');
await page.evaluate(async () => { const st = await import('/js/state.js'); await st.remove('ws_legacy'); });
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t30 catalogues');
