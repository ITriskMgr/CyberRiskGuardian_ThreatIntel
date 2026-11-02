// 1.9.0 — AI forecasting: exploitation forecast (EPSS history from dated snapshots, KEV, PoC/feed reports,
// exposure → review item only), mitigation optimizer (deterministic first, AI proposals accepted one by one),
// residual-risk path per funding option (phase-in, bands, risk avoided per $1,000). Routing rows default to the
// local model; the helper refuses a remote provider; nothing changes a parameter unless the analyst accepts it.
import { open, ok, done, URL } from './lib.mjs';
import fs from 'fs';
import path from 'path';
const FEEDS = process.env.CRG_FEEDS_DIR || '/home/claude/tmp/feeds-ssvc';
const MOCK = process.env.CRG_AI_MOCK || '/home/claude/tmp/mock-ssvc';

// dated snapshots in the feeds folder (and one damaged file, which is named and skipped)
const snap = (date, epss, kev) => ({ schema: 'crg-threat-context/1', retrieved: date, expires: '2027-01-30', regions: ['ca'],
  thresholds: { epss_rung4_min: 0.5, epss_rung1_max: 0.05, epss_percentile_rung4_min: 0.9, epss_pruned_below: 0.001 },
  kev: { count: Object.keys(kev).length, cves: kev }, epss: { score_date: date, count: Object.keys(epss).length, scores: epss } });
const S1 = snap('2026-09-01', { 'CVE-2026-50001': [0.10, 0.80], 'CVE-2026-50002': [0.02, 0.60], 'CVE-2026-50003': [0.70, 0.98], 'CVE-2026-50004': [0.01, 0.30] }, {});
const S2 = snap('2026-10-01', { 'CVE-2026-50001': [0.30, 0.90], 'CVE-2026-50002': [0.02, 0.60], 'CVE-2026-50003': [0.70, 0.98], 'CVE-2026-50004': [0.01, 0.30] }, {});
const S3 = snap('2026-11-01', { 'CVE-2026-50001': [0.55, 0.96], 'CVE-2026-50002': [0.02, 0.60], 'CVE-2026-50003': [0.70, 0.98], 'CVE-2026-50004': [0.01, 0.30] },
  { 'CVE-2026-50002': { added: '2026-10-20', vendor: 'Acme', product: 'Gateway', ransomware: 'Unknown' } });
fs.mkdirSync(FEEDS, { recursive: true });
for (const s of [S1, S2, S3]) fs.writeFileSync(path.join(FEEDS, `threat-context-${s.retrieved}.json`), JSON.stringify(s));
fs.writeFileSync(path.join(FEEDS, 'threat-context-2026-08-01.json'), '{ damaged');

const { browser, page, errors } = await open('#/process');
page.on('dialog', d => d.accept());
const r = await page.evaluate(async ({ S3 }) => {
  const st = await import('/js/state.js'); const store = await import('/js/store.js'); const AI = await import('/js/ai.js');
  let ex; for (let i = 0; i < 40 && !(ex = st.S.list.find(w => w.kind === 'example')); i++) { await new Promise(r => setTimeout(r, 250)); await st.refreshList?.(); } await st.select(ex.id);
  const ws = st.S.ws; AI.settings(ws).acknowledged = new Date().toISOString();
  await st.setSnapshot(S3, 'threat-context-2026-11-01.json');
  const v = (id, exposed) => ({ id, kind: 'CVE', title: '', product: 'Prod ' + id.slice(-1), asset: '', exposed, source: 'test', added: '2026-11-02', cwe: [], notes: '' });
  ws.vulns.push(v('CVE-2026-50001', true), v('CVE-2026-50002', true), v('CVE-2026-50003', false), v('CVE-2026-50004', true));
  await store.put('blob', 'feeds:items', { bySrc: { test: { items: [
    { src: 'test', title: 'Proof-of-concept exploit released for CVE-2026-50001', text: 'PoC on GitHub', cves: ['CVE-2026-50001'], attack: [], tags: [] },
    { src: 'test', title: 'Vendor advisory CVE-2026-50004', text: 'patch available', cves: ['CVE-2026-50004'], attack: [], tags: [] },
    { src: 'test', title: 'CVE-2026-50004 discussed', text: 'analysis', cves: ['CVE-2026-50004'], attack: [], tags: [] }] } } });
  st.touch();
  const X = await import('/js/aiforecast.js');
  const out = {};
  const before = st.compute(ws).totals; out.params = JSON.stringify(ws.assessment.SCEN.map(s => [s.params, s.red_p, s.red_i]));
  const hist = await X.epssHistory(ws);
  out.files = hist.files.map(f => f.error ? 'x' : f.date).join(',');
  out.len = hist.series['CVE-2026-50001']?.length;
  const items = (await store.get('blob', 'feeds:items')).bySrc.test.items;
  const rows = X.forecastAll(ws, { history: hist, snap: st.S.snap, items });
  out.rows = Object.fromEntries(rows.map(x => [x.id, { f: x.forecast, band: x.band, review: x.review, rising: x.rising, kev: x.kev, n: x.trend.n, reasons: x.reasons.join(' | ') }]));
  out.feat = AI.FEATURES.filter(f => ['exploit_forecast', 'mitigation_optimizer'].includes(f[0])).map(f => f[0] + ':' + f[4]).join(',');
  out.route = AI.isLocal(AI.route('exploit_forecast', ws).provider) && AI.isLocal(AI.route('mitigation_optimizer', ws).provider);
  // the helper refuses a remote provider for a local-only feature
  const H = await import('/js/helper.js');
  const res = await fetch('/api/ai', { method: 'POST', headers: await H.headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ provider: 'claude', task: 'exploit_forecast', prompt: 'TASK: exploit_forecast\nx' }) });
  out.refused = res.status + ' ' + ((await res.json()).error || '');
  // optimizer
  const t0 = performance.now();
  const o = X.optimize(ws, { budget: 1500000 });
  out.optMs = performance.now() - t0;
  out.opt = { method: o.method.split(' — ')[0], cost: o.cost, count: o.count, before: o.countBefore, fr: o.frontier.count, frCost: o.frontier.cost, funded: o.funded.length };
  // every treated residual is the engine's own
  const R = st.compute(ws);
  out.engineSame = o.rows.every(x => !x.treated || Math.abs(x.res - R.rows.find(y => y.id === x.id).res) < 1e-6);
  const full = X.optimize(ws, { budget: 1e9 });
  out.full = [full.count, Math.round(full.residual), full.funded.length];
  const zero = X.optimize(ws, { budget: 0 });
  out.zero = [zero.count, zero.funded.length, Math.round(zero.residual)];
  // residual path
  const p1 = await X.residualPath(ws, { years: 3, trials: 60, seed: 7 });
  const p2 = await X.residualPath(ws, { years: 3, trials: 60, seed: 7 });
  const A = p1.options.find(x => x.key === 'A'), D = p1.options.find(x => x.key === 'D');
  out.path = { months: p1.months, A0: Math.round(A.central[0]), A36: Math.round(A.central[36]), D0: Math.round(D.central[0]), D12: Math.round(D.central[12]), D36: Math.round(D.central[36]),
    mono: D.central.every((x, i) => !i || x <= D.central[i - 1] + 1e-6), perK: D.perK, benefit: D.benefitMonth, cost: D.cost, same: JSON.stringify(p1.options.map(x => x.band)) === JSON.stringify(p2.options.map(x => x.band)),
    band: D.band.find(b => b.t === 12), keys: p1.options.map(x => x.key).join('') };
  const p3 = await X.residualPath(ws, { years: 1, trials: 30, opt: o });
  out.path1 = { months: p3.months, keys: p3.options.map(x => x.key).join('') };
  const after = st.compute(ws).totals;
  out.same = Math.round(before.est) === Math.round(after.est) && Math.round(before.res) === Math.round(after.res) && out.params === JSON.stringify(ws.assessment.SCEN.map(s => [s.params, s.red_p, s.red_i]));
  out.totals = [Math.round(after.est), Math.round(after.res)];
  return out;
}, { S3 });

ok(r.files === 'x,2026-09-01,2026-10-01,2026-11-01' && r.len === 3, 'EPSS history read from the dated snapshots in the feeds folder (damaged file named) ' + r.files);
const f = r.rows;
ok(f['CVE-2026-50001'].band === 'high' && Math.abs(f['CVE-2026-50001'].f - 0.8057) < 0.002 && f['CVE-2026-50001'].review && f['CVE-2026-50001'].rising && f['CVE-2026-50001'].n === 3,
  'rising EPSS + PoC, exposed → high, review ' + JSON.stringify(f['CVE-2026-50001']));
ok(f['CVE-2026-50002'].kev && f['CVE-2026-50002'].f === 0.9 && f['CVE-2026-50002'].review, 'KEV → floor 0.90, review');
ok(f['CVE-2026-50003'].band === 'high' && !f['CVE-2026-50003'].review && /watch only/.test(f['CVE-2026-50003'].reasons), 'not exposed → watch only, no review (exposure gate)');
ok(f['CVE-2026-50004'].band === 'low' && !f['CVE-2026-50004'].review && Math.abs(f['CVE-2026-50004'].f - 0.0694) < 0.002, 'flat low EPSS with two reports → low ' + f['CVE-2026-50004'].f);
ok(/Latest EPSS/.test(f['CVE-2026-50001'].reasons) && /trend/.test(f['CVE-2026-50001'].reasons), 'every forecast states its reasons');
ok(r.feat === 'exploit_forecast:local,mitigation_optimizer:local' && r.route, 'routing rows: both features default to the local model');
ok(/^403/.test(r.refused) && /local model only/.test(r.refused), 'helper refuses a remote provider for a local-only feature: ' + r.refused);
ok(r.opt.method === 'exact' && r.opt.cost <= 1500000 && r.opt.count >= r.opt.fr && r.opt.count > r.opt.before, 'optimizer (exact) within budget, at least as good as the frontier ' + JSON.stringify(r.opt));
ok(r.optMs < 5000, 'optimizer runs in ' + Math.round(r.optMs) + ' ms');
ok(r.engineSame, 'optimizer residuals are the engine\'s');
ok(r.full[0] === 18 && r.full[1] === 41023 && r.full[2] === 23, 'unbounded budget: full portfolio, residual 41,023 ' + r.full);
ok(r.zero[0] === r.opt.before && r.zero[1] === 0 && r.zero[2] === 84305, 'zero budget: nothing funded, residual = estimated 84,305');
ok(r.path.months === 36 && r.path.A0 === 84305 && r.path.A36 === 84305 && r.path.D0 === 84305 && r.path.D36 === 41023 && r.path.D12 < r.path.D0 && r.path.D12 > r.path.D36 && r.path.mono,
  'residual path: status quo flat, full portfolio phases in from 84,305 to 41,023 ' + JSON.stringify(r.path));
ok(r.path.benefit === 24 && r.path.perK > 0 && r.path.cost > 0, 'full benefit at month 24; risk avoided per $1,000 > 0');
ok(r.path.same && r.path.band && r.path.band.p10 <= r.path.band.p90, 'bands reproducible with the same seed');
ok(r.path.keys === 'ABCD' && r.path1.keys === 'ABCDO' && r.path1.months === 12, 'options A–D, plus the optimizer portfolio when run; 1-year horizon');
ok(r.same && r.totals.join() === '84305,41023', 'nothing applied: parameters and totals unchanged (84,305 / 41,023)');

// ---- screens
await page.goto(URL + '#/forecast/exploit');
await page.waitForFunction(() => document.body.textContent.includes('Forecast by CVE'), null, { timeout: 15000 });
let t = await page.textContent('main');
ok(/evidence, never a likelihood of a scenario/.test(t) && /CVE-2026-50001/.test(t) && /Analytical estimate — validation required/.test(t), 'exploitation tab: labelled, apart, lists the register');
await page.click('button:has-text("Raise review items for the flagged CVEs (2)")');
await page.waitForTimeout(300);
let rev = await page.evaluate(async () => { const st = await import('/js/state.js'); return { r: st.S.ws.ssvc.review.map(x => x.cve + ':' + x.status + ':' + x.source).sort().join(','), d: Object.keys(st.S.ws.ssvc.decisions).length }; });
ok(rev.r === 'CVE-2026-50001:open:rule,CVE-2026-50002:open:rule' && rev.d === 0, 'review items raised for the exposed flagged CVEs only; no SSVC decision made ' + JSON.stringify(rev));
// AI second opinion, with the payload preview
await page.click('button:has-text("Ask AI (preview first)")');
await page.waitForSelector('.modal textarea');
const tas = await page.$$('.modal textarea');
const pay = await tas[1].inputValue();
ok(/TASK: exploit_forecast/.test(pay) && /CVE-2026-50001/.test(pay) && /never converted into a parameter/.test(pay), 'payload preview shows the CVEs and the rule');
await page.click('.modal .btnrow .btn:not(.ghost)');
await page.waitForFunction(() => document.body.textContent.includes('AI second opinion') && document.body.textContent.includes('62.0%'), null, { timeout: 15000 });
t = await page.textContent('main');
ok(!/CVE-2099-0001/.test(t) && /100\.0%/.test(t), 'AI answer: unknown id ignored, likelihood clamped to 100%');
const last = JSON.parse(fs.readFileSync(path.join(MOCK, '_last.json'), 'utf8'));
ok(/TASK: exploit_forecast/.test(last.prompt), 'what was sent is the previewed payload');
const log = await page.evaluate(async () => { const AI = await import('/js/ai.js'); const l = AI.log()[0]; return { task: l.task, local: AI.isLocal(l.provider) }; });
ok(log.task === 'exploit_forecast' && log.local, 'AI log: exploit_forecast sent to the local model');
// optimizer screen
await page.goto(URL + '#/forecast/optimizer');
await page.waitForSelector('text=Bring the most scenarios within tolerance for a budget');
await page.fill('input[type=number]', '1500000');
await page.click('main button:text-is("Optimize")');
await page.waitForFunction(() => document.body.textContent.includes('Scenarios meeting the target'));
t = await page.textContent('main');
ok(/Funding frontier, same budget/.test(t) && /Method: exact/.test(t), 'optimizer tab: result against the frontier, method stated');
await page.click('button:has-text("Ask AI (preview first)")');
await page.waitForSelector('.modal textarea');
ok(/TASK: mitigation_optimizer/.test(await (await page.$$('.modal textarea'))[1].inputValue()), 'optimizer payload preview');
await page.click('.modal .btnrow .btn:not(.ghost)');
await page.waitForFunction(() => document.body.textContent.includes('Initial: now → proposed'), null, { timeout: 15000 });
t = await page.textContent('main');
ok(/I01/.test(t) && !/I99/.test(t) && !/S999/.test(t) && /1\.00/.test(t) && /Analytical estimate — validation required/.test(t), 'proposals: unknown ids dropped, values clamped, labelled');
await page.click('button:has-text("if accepted")');
await page.waitForSelector('text=If accepted — computed by the engine, not applied');
let tot = await page.evaluate(async () => { const st = await import('/js/state.js'); const t = st.compute(st.S.ws).totals; return [Math.round(t.est), Math.round(t.res)]; });
ok(tot.join() === '84305,41023', '"if accepted" applies nothing');
// accept one proposal: S1 effect
await page.locator('tr:has-text("S1") input[type=checkbox]').first().check();
await page.click('button:has-text("Accept the ticked proposals")');
await page.waitForTimeout(400);
const acc = await page.evaluate(async () => { const st = await import('/js/state.js'); const AI = await import('/js/ai.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S1'); const i1 = st.S.ws.assessment.INITIATIVES.find(a => a[0] === 'I01');
  return { rp: s.red_p, ri: s.red_i, i1: i1[6], dec: AI.log()[0].decision || AI.log()[0].outcome || JSON.stringify(AI.log()[0]).includes('accepted') }; });
ok(acc.rp === 0.7 && acc.ri === 0.7 && acc.i1 === 180000 && acc.dec, 'only the ticked proposal is applied, and the acceptance is logged ' + JSON.stringify(acc));
// residual-path screen
await page.goto(URL + '#/forecast/path');
await page.waitForSelector('text=Residual risk over time, per funding option');
await page.click('main button:text-is("Run")');
await page.waitForFunction(() => document.body.textContent.includes('Options compared'), null, { timeout: 30000 });
t = await page.textContent('main');
ok(/Avoided per \$1,000/.test(t) && /O · Optimizer portfolio/.test(t) && /Residual at 36 months/.test(t), 'residual-path tab: options with the optimizer portfolio, risk avoided per $1,000');
const errs = errors.filter(e => !/status of 403/.test(e));   // the deliberate refusal above
ok(!errs.length, 'no console errors ' + errs.join(' | ').slice(0, 300));
await browser.close(); done('t34 AI forecasting');
