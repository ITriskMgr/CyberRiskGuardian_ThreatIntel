// Identity, privilege & configuration — CRG-17 to CRG-24: formulas, "no data" vs N/A, the unknown/stale cap, threshold overrides, dashboard.
import { open, ok, done } from './lib.mjs';
import { ipcOn, goto } from './ipc_lib.mjs';
const { browser, page, errors } = await open('#/process');
await ipcOn(page);
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const I = await import('/js/ipc.js');
  const w = st.newWorkspace({ name: 'KRI fixture' }); const R = I.reg(w); R.settings.asOf = '2026-11-01';
  const out = {};
  out.empty = I.kri(w);
  const row = (k, o) => R[k].push({ ...I.blankRow(k), id: k + R[k].length, ...o });
  row('accounts', { type: 'employee', count: 100, ownerless: 2, mfa: 90, mfaPR: 10, dormant: 3, reconciled: '2026-10-01' });
  row('accounts', { type: 'service', count: 50, ownerless: null, dormant: 0, reconciled: '2026-10-01' });   // ownerless unknown: excluded from numerator rows, kept in denominator
  row('privileged', { tier: 0, holders: 4, standing: null, mfa: 4, mfaPR: 4, reviewed: '2026-10-01' });      // standing unknown → counts as all holders
  row('privileged', { tier: 2, holders: 6, standing: 6, mfa: null, mfaPR: null, reviewed: '2026-10-01' });   // MFA unknown → 0
  row('emergency', { count: 1, uses: 0, usesReviewed: 0, lastTest: '2026-09-01' });                         // no use: N/A
  row('reviews', { due: '2024-01-31', decisionsDue: 10, decisionsDone: 1 });                                // outside the window: N/A
  row('ciScopes', { inScope: 0, assigned: 0, assessed: 0, compliant: 0, asOf: '2026-10-01' });              // nothing in scope: N/A
  out.k = I.kri(w);
  const defs = Object.fromEntries(I.defsWithOverrides(w).map(d => [d.id, d]));
  out.st = Object.fromEntries(Object.keys(out.k.values).map(id => [id, I.status(defs[id], out.k.values[id], out.k.meta[id])]));
  // cap: a perfect value with a stale row is only "on target — incomplete data"
  const w2 = st.newWorkspace(); const R2 = I.reg(w2); R2.settings.asOf = '2026-11-01';
  R2.accounts.push({ ...I.blankRow('accounts'), id: 'a', type: 'employee', count: 10, ownerless: 0, mfa: 10, mfaPR: 10, dormant: 0, reconciled: '2025-01-01' });
  const k2 = I.kri(w2); out.cap = I.status(I.KRIS[0], k2.values['CRG-17'], k2.meta['CRG-17']);
  R2.accounts[0].reconciled = '2026-10-15'; const k3 = I.kri(w2); out.capOff = I.status(I.KRIS[0], k3.values['CRG-17'], k3.meta['CRG-17']);
  // CRG-22: draft versions do not count; legacy counts and is shown
  R2.baselines.push({ ...I.blankRow('baselines'), id: 'BL-01', versions: [{ ...I.blankVersion('1'), state: 'draft' }] }, { ...I.blankRow('baselines'), id: 'BL-02', versions: [{ ...I.blankVersion('legacy'), state: 'legacy' }] });
  R2.ciScopes.push({ ...I.blankRow('ciScopes'), id: 'c1', baseline: 'BL-01', version: '1', inScope: 10, assigned: 10, assessed: 0, compliant: 0, asOf: '2026-10-15' },
    { ...I.blankRow('ciScopes'), id: 'c2', baseline: 'BL-02', version: 'legacy', inScope: 10, assigned: 4, assessed: 0, compliant: 0, asOf: '2026-10-15' });
  const k4 = I.kri(w2); out.c22 = [k4.values['CRG-22'], k4.meta['CRG-22'].legacy];
  // CRG-24: expired exception cited by an open deviation
  w2.shared.exceptions.push({ id: 'EXC-001', status: 'accepted', expiry: '2026-06-30', concerns: [] });
  R2.deviations.push({ ...I.blankRow('deviations'), id: 'DV-01', cls: 'compensated', exception: 'EXC-001', state: 'open' });
  out.c24 = I.kri(w2).values['CRG-24'];
  return out;
});
const E = r.empty;
ok(Object.values(E.values).every(v => v === null) && Object.values(E.meta).every(m => m.empty && !m.na), 'empty registers: no data (not N/A)');
const k = r.k.values, m = r.k.meta;
ok(k['CRG-17'] === +(100 * 98 / 150).toFixed(2) && m['CRG-17'].num === 98 && m['CRG-17'].den === 150 && m['CRG-17'].unknown === 1, 'CRG-17 = Σ(count − ownerless) over known ÷ Σ count ' + k['CRG-17']);
ok(k['CRG-18'] === 40 && m['CRG-18'].num === 4 && m['CRG-18'].den === 10, 'CRG-18 unknown MFA counts as 0: ' + k['CRG-18']);
ok(k['CRG-19'] === 100 && m['CRG-19'].den === 4, 'CRG-19 tiers 0–1, unknown standing counts as holders: ' + k['CRG-19']);
ok(k['CRG-20'] === null && m['CRG-20'].na && r.st['CRG-20'].k === 'na' && r.st['CRG-20'].label === 'not applicable', 'CRG-20 no campaign due in the window: not applicable');
ok(k['CRG-21'] === null && m['CRG-21'].na, 'CRG-21 no use: not applicable');
ok(k['CRG-22'] === null && m['CRG-22'].na, 'CRG-22 nothing in scope: not applicable');
ok(k['CRG-24'] === null && m['CRG-24'].na, 'CRG-24 no deviation, no exception: not applicable');
ok(typeof k['CRG-23'] === 'number' && m['CRG-23'].den > 0, 'CRG-23 computed ' + k['CRG-23'] + ' (' + m['CRG-23'].num + '/' + m['CRG-23'].den + ')');
ok(r.cap.k === 'warn' && r.cap.label === 'on target — incomplete data' && r.capOff.k === 'good', 'never green with a stale input; green when fresh');
ok(r.c22[0] === 20 && r.c22[1] === 4, 'CRG-22: draft not assigned, legacy counted and shown ' + r.c22);
ok(r.c24 === 1, 'CRG-24 counts an expired exception cited by an open deviation');
// overrides through the overview, Restore default
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => /MediBec/.test(w.name)); await st.select(ex.id); });
await goto(page, '#/ipc/overview', 900);
ok(await page.locator('#ipc-kris [data-kri]').count() === 8, 'eight tiles on the overview');
ok(/1479 \/ 1505/.test(await page.textContent('#ipc-kris [data-kri="CRG-17"]')), 'tile shows num / den');
await page.fill('#ipc-thresholds input[data-kri="CRG-17"][data-k="crit"]', '99'); await page.dispatchEvent('#ipc-thresholds input[data-kri="CRG-17"][data-k="crit"]', 'change'); await page.waitForTimeout(500);
let ov = await page.evaluate(async () => (await import('/js/state.js')).S.ws.kriDefs.find(x => x.id === 'CRG-17'));
ok(ov && ov.crit === 99 && ov.date, 'override stored in kriDefs ' + JSON.stringify(ov));
const s17 = await page.evaluate(async () => { const K = await import('/js/kri.js'); const d = K.autoDefs().find(x => x.id === 'CRG-17'); return K.status(d, K.autoValues()['CRG-17'], K.autoMeta()['CRG-17']).k; });
ok(s17 === 'bad', 'override changes the dashboard status (CRG-17 now critical)');
await page.click('#ipc-thresholds button:text-is("Restore default")'); await page.waitForTimeout(400);
ov = await page.evaluate(async () => (await import('/js/state.js')).S.ws.kriDefs.find(x => x.id === 'CRG-17'));
ok(!ov, 'Restore default removes the override');
// dashboard: selection and history
await goto(page, '#/dashboard', 1000);
ok(await page.isVisible('#panel-dashboard >> text=1479 / 1505'), 'dashboard method cell: num / den');
await page.click('#panel-dashboard button:has-text("Record computed")'); await page.waitForTimeout(500);
const h = await page.evaluate(async () => (await import('/js/state.js')).S.ws.kriHistory.at(-1).values);
ok(h['CRG-17'] === 98.27 && h['CRG-24'] === 1, 'kriHistory records the module KRIs');
const top = await page.evaluate(async () => (await import('/js/state.js')).S.ws.kriSel);
ok(Array.isArray(top) && top.length === 5, 'top-5 selection still works with the new KRIs: ' + top);
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t35 ipc kri');
