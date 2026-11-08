// 1.9.2 — NV-004 / #21 / NV-016 / NV-095 / NV-P03 (ws2): the vector wins. A stored CVSS score that disagrees with its vector
// is flagged on the risk card, in the Risk calculator, in the Scenario register, in the JSON export and in the Excel export,
// and the engines use the vector's score; the editor clears the override when a typed vector parses and records the old
// score in the scenario's revisions. Zero tolerated risk is "Not applicable (tolerated risk 0)", never "Above tolerance".
// One input rule (numeric strings and booleans rejected, missing reductions = 0); only Base metrics are accepted; the
// Python engine agrees with the browser on the exported file; reference totals never move.
import { open, ok, done, APP, tmp as tmpf, goto } from './lib.mjs';
import { execFileSync } from 'child_process';
import fs from 'fs';

const VEC = 'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H';   // book ch06 worked example, 9.3
const { browser, page, errors } = await open('#/process');
page.on('dialog', d => d.accept());

const r = await page.evaluate(async ({ VEC }) => {
  const st = await import('/js/state.js');
  let ex; for (let i = 0; i < 40 && !(ex = st.S.list.find(w => w.kind === 'example' && /MediBec/.test(w.name))); i++) { await new Promise(r => setTimeout(r, 250)); await st.refreshList?.(); }
  await st.select(ex.id);
  const ws = st.S.ws, a = ws.assessment;
  const out = {};
  const before = st.compute(ws).totals; out.before = [Math.round(before.est), Math.round(before.res)];
  // engine: book example with a disagreeing stored score
  const EX = { id: 'G16', params: { PbA: { v: 0.7 }, Pbx: { v: 0.6 }, De: { v: 0.6 }, Dm: { v: 0.8 }, Th: { v: 0.5 }, Mu: { v: 0.65 } }, red_p: 0.65, red_i: 0.7, cvss: VEC, cvss_score: 9.9 };
  const x = CRG.calc(EX, 0.35, 1000);
  out.book = { cvss: x.cvss, est: +x.est.toFixed(2), res: +x.res.toFixed(2), ratio: +x.ratio.toFixed(2), src: x.cvss_source, warn: x.warnings.length, flag: /disagrees/.test(x.warnings[0] || '') };
  out.check = CRG.cvssCheck(EX);
  // zero tolerated risk
  const z = CRG.calc(Object.assign({}, EX, { params: Object.assign({}, EX.params, { PbA: { v: 0 } }) }), 0.35, 1000);
  out.zero = { ratio: z.ratio, cls: CRG.classify(z.ratio), warn: /deliberate/.test(z.warnings.join(' ')), json: JSON.parse(JSON.stringify(z)).ratio };
  // one input rule
  const rej = s => { try { CRG.calc(s, 0.35, 1000); return 'accepted'; } catch (e) { return String(e.message); } };
  out.str = rej(Object.assign({}, EX, { params: Object.assign({}, EX.params, { PbA: { v: '0.7' } }) }));
  out.bool = rej(Object.assign({}, EX, { params: Object.assign({}, EX.params, { Mu: { v: true } }) }));
  const m = Object.assign({}, EX); delete m.red_p; delete m.red_i; out.missing = +CRG.calc(m, 0.35, 1000).res.toFixed(2);
  out.threat = rej(Object.assign({}, EX, { cvss: VEC + '/E:U', cvss_score: undefined }));
  out.env = rej(Object.assign({}, EX, { cvss: VEC + '/MAV:L', cvss_score: undefined }));
  out.supp = rej(Object.assign({}, EX, { cvss: VEC + '/AU:Y', cvss_score: undefined }));
  out.blank = rej(Object.assign({}, EX, { cvss: '', cvss_score: undefined }));
  out.score11 = rej(Object.assign({}, EX, { cvss: '', cvss_score: 11 }));
  // the register, the calculator and the exports see the flag: S1 gets a disagreeing stored score
  const s1 = a.SCEN[0];
  s1.cvss_score = Math.abs(CVSS4.score(s1.cvss) - 9.9) > 0.1 ? 9.9 : 5.5;
  st.touch();
  const R = st.compute(ws);
  const row = R.rows.find(q => q.id === s1.id);
  out.rowFlag = { cvss: row.cvss, vec: CVSS4.score(s1.cvss), stored: s1.cvss_score, warn: row.warnings.length, src: row.cvss_source };
  out.totalsFlagged = [Math.round(R.totals.est), Math.round(R.totals.res)];   // the vector wins: the stored score changes nothing
  const J = st.exportAssessment(ws);
  out.json = { check: J.SCEN[0].cvss_check, warnings: (J.warnings || []).length, score: J.SCEN[0].cvss_score };
  out.jsonText = JSON.stringify(J);
  const D = await import('/js/dss.js');
  out.crgo = D.assessmentFor(ws).SCEN[0].cvss_score;   // what the CRGO bridge gets: the vector's score
  out.s1 = s1.id;
  return out;
}, { VEC });

ok(r.before[0] === 84305 && r.before[1] === 41023, 'MediBec 84,305 / 41,023 before ' + r.before);
ok(r.book.cvss === 9.3 && r.book.est === 3554.46 && r.book.res === 1937.18 && r.book.ratio === 1.09 && r.book.src === 'vector', 'book example with stored 9.9: the vector\'s 9.3 is used (Re 3,554.46, ratio 1.09) ' + JSON.stringify(r.book));
ok(r.book.warn === 1 && r.book.flag && r.check.agree === false && r.check.stored === 9.9 && r.check.computed === 9.3, 'the disagreement is flagged, never corrected silently ' + JSON.stringify(r.check));
ok(Number.isNaN(r.zero.ratio) && r.zero.cls === 'Not applicable (tolerated risk 0)' && r.zero.warn && r.zero.json === null, 'Pb(A) = 0: ratio NaN (null in JSON), "Not applicable (tolerated risk 0)", confirm-the-zero warning ' + JSON.stringify(r.zero));
ok(/must be a number/.test(r.str) && /must be a number/.test(r.bool) && r.missing === 3554.46, 'one input rule: numeric string and boolean rejected, missing reductions = 0 ' + r.str + ' | ' + r.bool);
ok(/CVSS-B only: Threat metric E/.test(r.threat) && /Pb\(ψ,A\)/.test(r.threat), '/E:U refused, exploitation evidence routed to Pb(ψ,A): ' + r.threat.slice(0, 90));
ok(/CVSS-B only: Environmental metric MAV/.test(r.env) && /CVSS-B only: Supplemental metric AU/.test(r.supp), '/MAV:L and /AU:Y refused as CVSS-B only');
ok(/CVSS required/.test(r.blank) && /0\.0 to 10\.0/.test(r.score11), 'blank CVSS is "CVSS required", a score above 10 is rejected');
ok(r.rowFlag.cvss === r.rowFlag.vec && r.rowFlag.warn === 1 && r.rowFlag.src === 'vector', 'compute(): the row uses the vector\'s score and carries the flag ' + JSON.stringify(r.rowFlag));
ok(r.totalsFlagged[0] === 84305 && r.totalsFlagged[1] === 41023, 'a disagreeing stored score changes no total (the vector wins) ' + r.totalsFlagged);
ok(r.json.check && r.json.check.agree === false && r.json.check.used === 'vector' && r.json.warnings === 1 && r.json.score === r.rowFlag.stored, 'JSON export: both values kept, cvss_check and a warning added ' + JSON.stringify(r.json));
ok(r.crgo === r.rowFlag.vec, 'CRGO bridge receives the vector\'s score ' + r.crgo);

// the Python engine reads the exported file the same way
const f = tmpf('t59-export.json'); fs.writeFileSync(f, r.jsonText);
const py = execFileSync('python3', ['-I', APP + '/engine/crg_calc.py', f]).toString();
ok(/Total estimated 84,305\s+residual 41,023/.test(py), 'engine/crg_calc.py on the export: 84,305 / 41,023');
ok(/Warning: .*stored CVSS score .* disagrees with its vector/.test(py), 'engine/crg_calc.py flags the stored score ' + (py.match(/Warning:.*/) || [''])[0].slice(0, 100));
const zf = tmpf('t59-zero.json');
fs.writeFileSync(zf, JSON.stringify({ APPETITE: 0.35, FACTOR: 1000, SCEN: [{ id: 'Z1', params: { PbA: { v: 0 }, Pbx: { v: 0.6 }, De: { v: 0.6 }, Dm: { v: 0.8 }, Th: { v: 0.5 }, Mu: { v: 0.65 } }, cvss: VEC, red_p: 0.5, red_i: 0.5 }] }));
const pz = execFileSync('python3', ['-I', APP + '/engine/crg_calc.py', zf]).toString();
ok(/n\/a\s+Not applicable \(tolerated risk 0\)/.test(pz) && !/Above tolerance/.test(pz), 'engine/crg_calc.py: zero tolerated risk → n/a, Not applicable (no crash) ' + pz.split('\n')[2]);
let bad = '';
fs.writeFileSync(tmpf('t59-bad.json'), JSON.stringify({ APPETITE: 0.35, FACTOR: 1000, SCEN: [{ id: 'B1', params: { PbA: { v: '0.7' }, Pbx: { v: 0.6 }, De: { v: 0.6 }, Dm: { v: 0.8 }, Th: { v: 0.5 }, Mu: { v: true } }, cvss: VEC + '/E:U', red_p: 0.5, red_i: 0.5 }] }));
try { execFileSync('python3', ['-I', APP + '/engine/crg_calc.py', tmpf('t59-bad.json')], { stdio: 'pipe' }); } catch (e) { bad = String(e.stderr); }
ok(/Pb\(A\) must be a number/.test(bad) && /μ\(E\) must be a number/.test(bad) && /CVSS-B only: Threat metric E/.test(bad), 'engine/crg_calc.py: structured rejection of a string, a boolean and /E:U');

// the screens: risk card, calculator, register
await goto(page, '#/scenario/' + r.s1 + '/cvss', 900);
const card = await page.evaluate(() => document.getElementById('scen-riskcard')?.textContent || '');
ok(/disagrees with its vector/.test(card) && /vector's score is used/.test(card), 'risk card: the disagreement banner says the vector\'s score is used');
ok(/from the vector/.test(card), 'risk card names the score source (from the vector)');
await goto(page, '#/register', 900);
const reg = await page.evaluate(() => { const s = [...document.querySelectorAll('main > section')].find(x => !x.hidden); return { banner: [...s.querySelectorAll('.banner')].map(b => b.textContent).join(' | '), pills: s.querySelectorAll('.pill.warn').length, text: s.textContent }; });
ok(/1 scenario\(s\) carry a stored CVSS score that disagrees/.test(reg.banner) && /stored score ≠ vector/.test(reg.text), 'register: banner and row pill flag the scenario');
await goto(page, '#/calc/' + r.s1, 1200);
const calc = await page.evaluate(() => { const s = [...document.querySelectorAll('main > section')].find(x => !x.hidden); return s.textContent; });
ok(/stored score ≠ vector/.test(calc) && /disagrees with its vector/.test(calc), 'risk calculator: portfolio row pill and single-scenario banner');
const loaded = await page.evaluate(() => document.getElementById('p-cvss')?.value || '');
ok(/^CVSS:4\.0\//.test(loaded), 'the calculator loads the vector, not the stored score: ' + loaded.slice(0, 20));

// #21 — the editor: typing a vector that parses clears the override and records the old score
await goto(page, '#/scenario/' + r.s1 + '/cvss', 900);
const ed = await page.evaluate(async ({ VEC }) => {
  const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN[0];
  const sec = [...document.querySelectorAll('main > section')].find(x => !x.hidden);
  const vecIn = [...sec.querySelectorAll('input.mono')].find(i => /^CVSS:4\.0/.test(i.value));
  const old = s.cvss_score;
  vecIn.value = VEC; vecIn.dispatchEvent(new Event('input', { bubbles: true }));
  await new Promise(r => setTimeout(r, 300));
  const rev = (s.revisions || []).slice(-1)[0] || {};
  const scoreIn = [...sec.querySelectorAll('input[type=number]')].find(i => i.max === '10');
  return { old, cleared: s.cvss_score === undefined, vec: s.cvss, rev: rev.what || '', revScore: rev.cvss_score, field: scoreIn ? scoreIn.value : 'n/a', card: document.getElementById('scen-riskcard').textContent };
}, { VEC });
ok(ed.cleared && ed.vec === VEC, '#21: typing a vector that parses clears the stored override');
ok(/override .* cleared/.test(ed.rev) && ed.revScore === ed.old && /the vector wins/.test(ed.rev), '#21: the old score is noted in the scenario\'s revisions: ' + ed.rev.slice(0, 90));
ok(ed.field === '' && !/disagrees/.test(ed.card), 'the override field is emptied and the banner is gone');

// the stored score override still works alone (no vector), and a QC-21 warning follows a disagreement
const q = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const QC = await import('/js/panels/qc.js');
  const s = st.S.ws.assessment.SCEN[1]; const keep = s.cvss; s.cvss_score = 9.9;
  const w = QC.checks(st.S.ws).find(x => x.id === 'QC-21').state;
  delete s.cvss_score; s.cvss = keep;
  const R = st.compute(st.S.ws).totals;
  return { qc: w, totals: [Math.round(R.est), Math.round(R.res)] };
});
ok(q.qc === 'warn', 'QC-21 warns on a disagreeing stored score');
// data version 6 (ws2 sub-step): numbers stored as text are retyped, same figures, journalled
const mg = await page.evaluate(async () => {
  const W = await import('/js/migrate192/ws2.js');
  const w = { assessment: { SCEN: [{ id: 'T1', params: { PbA: { v: '0.7' }, Pbx: { v: 0.6 }, De: '0.6', Dm: { v: 0.8 }, Th: { v: 0.5 }, Mu: { v: 'high' } }, red_p: '0.65', red_i: 0.7, cvss_score: '9.3' }] } };
  const fixed = W.retypeNumbers(w); const s = w.assessment.SCEN[0];
  const notes = []; W.default[0].up(w, n => notes.push(n));
  return { fixed, types: [typeof s.params.PbA.v, typeof s.params.De, typeof s.red_p, typeof s.cvss_score, s.params.Mu.v], vals: [s.params.PbA.v, s.params.De, s.red_p, s.cvss_score], notes };
});
ok(mg.fixed.join() === 'T1.red_p,T1.cvss_score,T1.PbA,T1.De' && mg.types.join() === 'number,number,number,number,high' && mg.vals.join() === '0.7,0.6,0.65,9.3', 'migrate192/ws2: numeric text retyped as numbers (same figures), a word left alone ' + JSON.stringify(mg));
ok(mg.notes.length === 1 && /nothing retyped/.test(mg.notes[0]), 'the sub-step journals even when nothing changes: ' + mg.notes[0]);
ok(q.totals[0] === 84305 && q.totals[1] === 41023, 'totals unchanged after the exercise ' + q.totals);
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t59 CVSS precedence');
