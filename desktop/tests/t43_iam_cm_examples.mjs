// Identity & access management and Configuration management — the teaching-case samples, one per module (MediBec, CanaRetail; English
// and French), the same values as before the split, and the French screens of both modules.
import { open, ok, done, modulesOn, goto } from './lib.mjs';
import fs from 'fs';
const SRC = ['regcore.js', 'iam.js', 'cm.js', 'panels/regcore.js', 'panels/iam.js', 'panels/cm.js', 'panels/iam_regs.js', 'panels/cm_regs.js'].map(f => fs.readFileSync(new URL('../app/js/' + f, import.meta.url), 'utf8').replace(/\\'/g, "'")).join('\n');
const { browser, page, errors } = await open('#/process');
await modulesOn(page);
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const IAM = await import('/js/iam.js'); const CM = await import('/js/cm.js'); const out = {};
  for (const id of ['medibec', 'medibec-fr', 'canaretail', 'canaretail-fr']) {
    if (!st.exampleAvailable(id)) { out[id] = null; continue; }
    const ws = st.exampleWorkspace(id), R = st.compute(ws);
    const KI = IAM.kri(ws), KC = CM.kri(ws), K = { values: { ...KI.values, ...KC.values }, meta: { ...KI.meta, ...KC.meta } }, defs = [...IAM.defsWithOverrides(ws), ...CM.defsWithOverrides(ws)];
    const F = [...ws.iam.findings, ...ws.cm.findings];
    out[id] = { v: K.values, nd: Object.fromEntries(Object.entries(K.meta).map(([k, m]) => [k, `${m.num}/${m.den}`])), st: Object.fromEntries(defs.map(d => [d.id, IAM.status(d, K.values[d.id], K.meta[d.id]).k])),
      rows: IAM.REGISTER_KEYS.map(k => ws.iam[k].length).join(',') + ' · ' + CM.REGISTER_KEYS.map(k => ws.cm[k].length).join(','), label: ws.iam.accounts[0].label, ev: ws.assessment.EVIDENCE.map(e => e[0]),
      findIam: ws.iam.findings.map(f => `${f.id}|${f.rule}|${f.eid}|${f.scenarios.map(s => s.id).join('+')}|${f.proposals.length}`), findCm: ws.cm.findings.map(f => `${f.id}|${f.rule}|${f.eid}|${f.scenarios.map(s => s.id).join('+')}|${f.proposals.length}`),
      pending: [...IAM.pending(ws), ...CM.pending(ws)].map(x => `${x.p.scenario}|${x.p.param}|${x.p.from}|${x.p.to}|${x.p.state}`), accepted: F.some(f => f.proposals.some(p => p.state === 'accepted')),
      basis: ws.assessment.SCEN.some(s => (s.ipc_basis || []).length), revMod: (ws.revisionLog || []).some(x => /^(IPC|IAM|CM) /.test(x.cause || '')), tot: [Math.round(R.totals.est), Math.round(R.totals.res)],
      exc: ws.shared.exceptions.map(x => `${x.id}|${x.expiry}`), hash: ws.cm.baselines.filter(b => b.versions.some(v => v.state === 'approved')).every(b => /^[0-9a-f]{64}$/.test(CM.approvedVersion(b).hash)), ipc: 'ipc' in ws };
  }
  return out;
});
// the values of the single module before the split, unchanged; known coverage split: CRG-23 (identity) + CRG-25 (configuration) = 67/82 and 72/73
const MB = { 'CRG-17': [98.27, '1479/1505', 'warn'], 'CRG-18': [78.72, '74/94', 'bad'], 'CRG-19': [83.33, '30/36', 'bad'], 'CRG-20': [85.06, '1207/1419', 'bad'], 'CRG-21': [0, '0/1', 'bad'], 'CRG-22': [76.1, '1108/1456', 'bad'], 'CRG-23': [80.6, '54/67', 'warn'], 'CRG-24': [1, null, 'bad'], 'CRG-25': [86.67, '13/15', 'warn'] };
const CR = { 'CRG-17': [99.48, '4202/4224', 'good'], 'CRG-18': [95.15, '98/103', 'warn'], 'CRG-19': [42.86, '12/28', 'warn'], 'CRG-20': [92.65, '4160/4490', 'warn'], 'CRG-21': [100, '2/2', 'good'], 'CRG-22': [99.06, '1587/1602', 'good'], 'CRG-23': [98.28, '57/58', 'good'], 'CRG-24': [0, null, 'good'], 'CRG-25': [100, '15/15', 'good'] };
for (const [id, exp, tot, lab] of [['medibec', MB, [84305, 41023], 'Clinical and administrative staff'], ['medibec-fr', MB, [84305, 41023], 'Personnel clinique et administratif'],
  ['canaretail', CR, [27526, 16049], 'Store and head-office staff'], ['canaretail-fr', CR, [27526, 16049], 'Personnel des magasins et du siège']]) {
  const x = r[id];
  if (!x) { ok(false, id + ' is not bundled with this build'); continue; }
  for (const [k, [v, nd, st]] of Object.entries(exp)) ok(x.v[k] === v && (!nd || x.nd[k] === nd) && x.st[k] === st, `${id} ${k} = ${v}${nd ? ' (' + nd + ')' : ''} ${st}: got ${x.v[k]} (${x.nd[k]}) ${x.st[k]}`);
  ok(x.label === lab, `${id}: labels in the case language (${x.label})`);
  ok(!x.accepted && !x.basis && !x.revMod && !x.ipc && x.tot[0] === tot[0] && x.tot[1] === tot[1], `${id}: nothing accepted, no ipc record, totals ${x.tot.join(' / ')}`);
  ok(x.hash, `${id}: approved sample versions carry their SHA-256`);
}
const m = r.medibec;
ok(m.ev.slice(-3).join() === 'E13,E14,E15' && m.ev.length === 15, 'MediBec: evidence E13–E15 appended');
ok(m.rows === '5,3,2,2,2 · 3,3,3,3', 'MediBec: §9.1 rows per register, identity · configuration ' + m.rows);
ok(JSON.stringify(m.findIam) === JSON.stringify(['IF-01|IR-02|E13|S1+S5+S20|0', 'IF-02|IR-04|E13|S27|0', 'IF-03|IR-07|E13|S28|0', 'IF-04|IR-08|E14|S5+S28|0']) && JSON.stringify(m.findCm) === JSON.stringify(['IF-05|IR-11|E15|S6|0']),
  'MediBec: four identity findings and one configuration finding, recorded and linked, no proposal ' + m.findIam + ' · ' + m.findCm);
ok(m.pending.length === 0 && m.exc.includes('EXC-90|2026-09-30'), 'MediBec: no proposal; sample exception EXC-90 (expired)');
const c = r.canaretail;
ok(c.ev.at(-1) === 'E13' && JSON.stringify(c.findIam) === JSON.stringify(['IF-01|IR-01|E13|S10|1']) && !c.findCm.length && c.rows === '5,3,1,2,0 · 0,3,1,0' && c.exc.join() === 'EXC-91|2027-01-31', 'CanaRetail: IR-01 with evidence at the next E-number (E13), linked to S10; CM scopes and the compensated deviation ' + c.findIam + ' ' + c.rows);
ok(JSON.stringify(c.pending) === JSON.stringify(['S10|Pbx|0.4|0.45|proposed']), 'CanaRetail: exactly one pending proposal, S10 Pb(ψ,A) 0.40 → 0.45');
ok(JSON.stringify(r['canaretail-fr'].pending) === JSON.stringify(c.pending), 'CanaRetail (French): the same pending proposal');
// French screens of the module: every interface string translated
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => /MediBec/.test(w.name)); await st.select(ex.id); const i = await import('/js/i18n.js'); await i.setLang('fr'); });
await page.reload();
await page.waitForFunction(async () => { const m = await import('/js/state.js'); return !!m.S.ws; }, null, { timeout: 20000, polling: 300 });
await page.evaluate(async () => { const i = await import('/js/i18n.js'); window.__miss = i.collectMissing(); });
for (const t of ['overview', 'accounts', 'privileged', 'emergency', 'reviews', 'sod', 'findings', 'import']) await goto(page, '#/iam/' + t, 600);
for (const t of ['overview', 'baselines', 'deviations', 'changes', 'findings', 'import']) await goto(page, '#/cm/' + t, 600);
await goto(page, '#/dashboard', 900);
ok(await page.isVisible('nav >> text=Gestion des identités et des accès (GIA/GAP)') && await page.isVisible('nav >> text=Gestion de la configuration'), 'both menus in French');
const miss = await page.evaluate(async () => (await import('/js/i18n.js')).missingNow());
const ui = miss.filter(s => /[a-z]{3}/i.test(s) && !/^[A-Z0-9_\-.:\/ ]+$/.test(s));
const ours = await page.evaluate(async ui => { const words = /registre|population|privil|baseline|deviation|finding|proposal|account|identity|emergency|review|scope|count|MFA|owner|stale|unknown|indicator|ticked|Import/i; const fr = /[éèêàçôûœ’«»]|\b(des|les|du|de la|et|aux?|une?|sans|avec|par|pour|registre|comptes?|données|lignes)\b/i; return ui.filter(s => words.test(s) && !fr.test(s)); }, ui);
const SAME = new Set(['Population']);   // the same word in French
const mine = ours.filter(s => SRC.includes(s) && !SAME.has(s));
ok(mine.length === 0, 'no untranslated module text on the French screens: ' + mine.slice(0, 8).join(' | '));
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t43 iam cm examples');
