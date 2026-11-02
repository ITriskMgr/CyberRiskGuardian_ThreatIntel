// Identity, privilege & configuration — the teaching-case samples (MediBec, CanaRetail; English and French) and the French screens.
import { open, ok, done, ipcOn, goto } from './lib.mjs';
import fs from 'fs';
const SRC = ['ipc.js', 'panels/ipc.js', 'panels/ipc_regs.js', 'panels/ipc_cm.js'].map(f => fs.readFileSync(new URL('../app/js/' + f, import.meta.url), 'utf8').replace(/\\'/g, "'")).join('\n');
const { browser, page, errors } = await open('#/process');
await ipcOn(page);
const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const I = await import('/js/ipc.js'); const out = {};
  for (const id of ['medibec', 'medibec-fr', 'canaretail', 'canaretail-fr']) {
    if (!st.exampleAvailable(id)) { out[id] = null; continue; }
    const ws = st.exampleWorkspace(id), K = I.kri(ws), R = st.compute(ws), defs = I.defsWithOverrides(ws);
    out[id] = { v: K.values, nd: Object.fromEntries(Object.entries(K.meta).map(([k, m]) => [k, `${m.num}/${m.den}`])), st: Object.fromEntries(defs.map(d => [d.id, I.status(d, K.values[d.id], K.meta[d.id]).k])),
      rows: I.REGISTER_KEYS.map(k => ws.ipc[k].length).join(','), label: ws.ipc.accounts[0].label, ev: ws.assessment.EVIDENCE.map(e => e[0]), find: ws.ipc.findings.map(f => `${f.rule}|${f.eid}|${f.scenarios.map(s => s.id).join('+')}|${f.proposals.length}`),
      pending: I.pending(ws).map(x => `${x.p.scenario}|${x.p.param}|${x.p.from}|${x.p.to}|${x.p.state}`), accepted: ws.ipc.findings.some(f => f.proposals.some(p => p.state === 'accepted')),
      basis: ws.assessment.SCEN.some(s => (s.ipc_basis || []).length), revIpc: (ws.revisionLog || []).some(x => /^IPC/.test(x.cause || '')), tot: [Math.round(R.totals.est), Math.round(R.totals.res)],
      exc: ws.shared.exceptions.map(x => `${x.id}|${x.expiry}`), hash: ws.ipc.baselines.filter(b => b.versions.some(v => v.state === 'approved')).every(b => /^[0-9a-f]{64}$/.test(I.approvedVersion(b).hash)) };
  }
  return out;
});
const MB = { 'CRG-17': [98.27, '1479/1505', 'warn'], 'CRG-18': [78.72, '74/94', 'bad'], 'CRG-19': [83.33, '30/36', 'bad'], 'CRG-20': [85.06, '1207/1419', 'bad'], 'CRG-21': [0, '0/1', 'bad'], 'CRG-22': [76.1, '1108/1456', 'bad'], 'CRG-23': [81.71, '67/82', 'warn'], 'CRG-24': [1, null, 'bad'] };
const CR = { 'CRG-17': [99.48, '4202/4224', 'good'], 'CRG-18': [95.15, '98/103', 'warn'], 'CRG-19': [42.86, '12/28', 'warn'], 'CRG-20': [92.65, '4160/4490', 'warn'], 'CRG-21': [100, '2/2', 'good'], 'CRG-22': [99.06, '1587/1602', 'good'], 'CRG-23': [98.63, '72/73', 'good'], 'CRG-24': [0, null, 'good'] };
for (const [id, exp, tot, lab] of [['medibec', MB, [84305, 41023], 'Clinical and administrative staff'], ['medibec-fr', MB, [84305, 41023], 'Personnel clinique et administratif'],
  ['canaretail', CR, [27526, 16049], 'Store and head-office staff'], ['canaretail-fr', CR, [27526, 16049], 'Personnel des magasins et du siège']]) {
  const x = r[id];
  if (!x) { ok(false, id + ' is not bundled with this build'); continue; }
  for (const [k, [v, nd, st]] of Object.entries(exp)) ok(x.v[k] === v && (!nd || x.nd[k] === nd) && x.st[k] === st, `${id} ${k} = ${v}${nd ? ' (' + nd + ')' : ''} ${st}: got ${x.v[k]} (${x.nd[k]}) ${x.st[k]}`);
  ok(x.label === lab, `${id}: labels in the case language (${x.label})`);
  ok(!x.accepted && !x.basis && !x.revIpc && x.tot[0] === tot[0] && x.tot[1] === tot[1], `${id}: nothing accepted, totals ${x.tot.join(' / ')}`);
  ok(x.hash, `${id}: approved sample versions carry their SHA-256`);
}
const m = r.medibec;
ok(m.ev.slice(-3).join() === 'E13,E14,E15' && m.ev.length === 15, 'MediBec: evidence E13–E15 appended');
ok(m.rows === '5,3,2,2,3,3,3,2,3', 'MediBec: §9.1 rows per register ' + m.rows);
ok(JSON.stringify(m.find) === JSON.stringify(['IR-02|E13|S1+S5+S20|0', 'IR-04|E13|S27|0', 'IR-07|E13|S28|0', 'IR-08|E14|S5+S28|0', 'IR-11|E15|S6|0']), 'MediBec: five recorded, linked findings, no proposal ' + m.find);
ok(m.pending.length === 0 && m.exc.includes('EXC-90|2026-09-30'), 'MediBec: no proposal; sample exception EXC-90 (expired)');
const c = r.canaretail;
ok(c.ev.at(-1) === 'E13' && JSON.stringify(c.find) === JSON.stringify(['IR-01|E13|S10|1']), 'CanaRetail: IR-01 with evidence at the next E-number (E13), linked to S10 ' + c.find);
ok(JSON.stringify(c.pending) === JSON.stringify(['S10|Pbx|0.4|0.45|proposed']), 'CanaRetail: exactly one pending proposal, S10 Pb(ψ,A) 0.40 → 0.45');
ok(JSON.stringify(r['canaretail-fr'].pending) === JSON.stringify(c.pending), 'CanaRetail (French): the same pending proposal');
// French screens of the module: every interface string translated
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => /MediBec/.test(w.name)); await st.select(ex.id); const i = await import('/js/i18n.js'); await i.setLang('fr'); });
await page.reload();
await page.waitForFunction(async () => { const m = await import('/js/state.js'); return !!m.S.ws; }, null, { timeout: 20000, polling: 300 });
await page.evaluate(async () => { const i = await import('/js/i18n.js'); window.__miss = i.collectMissing(); });
for (const t of ['overview', 'accounts', 'privileged', 'emergency', 'reviews', 'baselines', 'deviations', 'sod', 'changes', 'findings', 'import']) await goto(page, '#/ipc/' + t, 600);
await goto(page, '#/dashboard', 900);
ok(await page.isVisible('nav >> text=Identité, privilèges et configuration'), 'menu in French');
const miss = await page.evaluate(async () => (await import('/js/i18n.js')).missingNow());
const ui = miss.filter(s => /[a-z]{3}/i.test(s) && !/^[A-Z0-9_\-.:\/ ]+$/.test(s));
const ours = await page.evaluate(async ui => { const I = await import('/js/ipc.js'); const P = await import('/js/panels/ipc.js'); const words = /registre|population|privil|baseline|deviation|finding|proposal|account|identity|emergency|review|scope|count|MFA|owner|stale|unknown|indicator|ticked|Import/i; const fr = /[éèêàçôûœ’«»]|\b(des|les|du|de la|et|aux?|une?|sans|avec|par|pour|registre|comptes?|données|lignes)\b/i; return ui.filter(s => words.test(s) && !fr.test(s)); }, ui);
const SAME = new Set(['Population']);   // the same word in French
const mine = ours.filter(s => SRC.includes(s) && !SAME.has(s));
ok(mine.length === 0, 'no untranslated module text on the French screens: ' + mine.slice(0, 8).join(' | '));
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t43 ipc examples');
