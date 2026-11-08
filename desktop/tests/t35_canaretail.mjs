// 1.9.0 group 3 — the bundled teaching examples: CanaRetail (EN/FR) and MediBec in French.
// The picker offers the four cases in both interface languages; every case reproduces the reference of the
// start-up self-check in the browser engine and in engine/crg_calc.py; Start over rebuilds the case the
// workspace came from; the French MediBec keeps every number (84,305 / 41,023) and only translates text.
import { open, ok, done, waitInPage, clickAndReopen, APP, TMP } from './lib.mjs';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const { browser, page, errors } = await open('#/org/workspaces');

// footer: MediBec reference, then CanaRetail
ok(/engine verified · 84,305 \/ 41,023 · CanaRetail 27,526 \/ 16,049/.test(await page.textContent('#engine-state')), 'footer: engine verified · 84,305 / 41,023 · CanaRetail 27,526 / 16,049');

// the picker, in English
const optsEN = await page.$$eval('#panel-org select', ss => ss.map(s => [...s.options].map(o => [o.value, o.textContent])).find(o => o.some(([v]) => v === 'canaretail')) || []);
const vals = optsEN.map(o => o[0]);
ok(['medibec', 'medibec-fr', 'canaretail', 'canaretail-fr'].every(v => vals.includes(v)), 'picker offers MediBec and CanaRetail in English and French ' + vals.join(','));
ok(optsEN.some(([v, t]) => v === 'canaretail-fr' && /Teaching example: CanaRetail — national retail \(French\)/.test(t)), 'English labels');

// create CanaRetail (English) through the screen
const fromSel = await page.$$('#panel-org select');
for (const s of fromSel) if (await s.evaluate(n => [...n.options].some(o => o.value === 'canaretail'))) { await s.selectOption('canaretail'); break; }
const kindNow = await page.$$eval('#panel-org select', ss => ss.find(s => [...s.options].some(o => o.value === 'example'))?.value);
ok(kindNow === 'example', 'choosing a bundled example sets the type to teaching example');
// Create workspace ends in reopen() (reload): wait for the new page, then for the case (polling before the reload could
// land between select() and location.reload() and the next evaluation died with the context — the t35 flake of 1.9.1)
await clickAndReopen(page, '#panel-org button:has-text("Create workspace")');
await waitInPage(page, async () => (await import('/js/state.js')).S.ws?.teaching?.case === 'canaretail');

const r = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const R = await import('/js/reset.js');
  const SCR = await import('/js/screening.js'); const SUM = await import('/js/panels/summary.js'); const EQ = await import('/js/equiv.js');
  const { S, compute } = st;
  const out = {};
  const tot = ws => { const c = compute(ws); return { est: Math.round(c.totals.est), res: Math.round(c.totals.res), counts: c.counts, err: c.errors.length }; };
  out.kind = S.ws.kind; out.name = S.ws.name; out.en = tot(S.ws);
  const a = S.ws.assessment;
  out.shape = { scen: a.SCEN.length, cand: a.CANDIDATES.length, ev: a.EVIDENCE.length, crown: a.CROWN.length, init: a.INITIATIVES.length, kri: a.KRIS.length, app: a.APPETITE };
  out.svc = a.SCEN.find(s => /service account/.test(s.name))?.id;
  out.svcPbx = a.SCEN.find(s => s.id === out.svc)?.params.Pbx.v;
  out.equiv = a.SCEN.filter(s => EQ.isEquiv(s)).map(s => [s.id, EQ.gaps(s).length]);
  out.cvssAgree = a.SCEN.every(s => CRG.cvssCheck(s).computed !== null);
  const A = SCR.analysis(S.ws);
  out.scr = { list: A.list.length, scored: A.scored, selected: A.selected.length, missing: A.judgmentMissing.length, unreviewed: A.flaggedUnreviewed.length, guidance: A.guidance.kind };
  const B = SUM.build(S.ws);
  out.sum = { decisions: B.decisions.length, it: B.it, gaps: B.gaps };
  out.budgetYears = S.ws.budgetYears.map(y => y.year).join(',');
  out.exportJSON = JSON.stringify(st.exportAssessment(S.ws));
  // Start over: break the case, then rebuild it from the shipped data
  const id = S.ws.id;
  S.ws.assessment.SCEN[0].params.PbA.v = 0.99; S.ws.assessment.SCEN.pop(); S.ws.screening.families = [];
  out.broken = tot(S.ws);
  const sp = await R.startingPoint(S.ws); out.sp = sp.source;
  out.restore = await R.restoreTeaching(id);
  out.after = tot(S.ws); out.afterCase = S.ws.teaching?.case; out.afterKind = S.ws.kind; out.afterId = S.ws.id === id;
  out.afterScen = S.ws.assessment.SCEN.length; out.afterFam = S.ws.screening.families.length; out.afterName = S.ws.name;
  out.afterAppetite = S.ws.assessment.APPETITE;     // default redo steps hand step 2 (context and appetite) back to the student
  // French CanaRetail and French MediBec, built as the picker builds them
  for (const id2 of ['canaretail-fr', 'medibec-fr']) {
    const w = st.exampleWorkspace(id2); w.name += ' t35'; await st.create(w);
    out[id2] = { tot: tot(S.ws), name: S.ws.name, s1: S.ws.assessment.SCEN[0].name, cand: S.ws.assessment.CANDIDATES.length, fam: S.ws.screening.families.length,
      scen: S.ws.assessment.SCEN.length, ev: S.ws.assessment.EVIDENCE[0][2], json: JSON.stringify(st.exportAssessment(S.ws)) };
    const sp2 = await R.startingPoint(S.ws); out[id2].sp = sp2.source;
    S.ws.assessment.SCEN.splice(0, 3);
    await R.restoreTeaching(S.ws.id);
    out[id2].restored = tot(S.ws); out[id2].restoredCase = S.ws.teaching?.case; out[id2].restoredS1 = S.ws.assessment.SCEN[0].name;
  }
  // same numbers across languages: everything but text
  const strip = o => JSON.stringify(o, (k, v) => typeof v === 'string' && (k === 'qual' || !/^(CVSS:|[A-Z]{1,3}\d+$|I\d\d$|E\d+$|CJ\d$|C\d\d$|P\d\d$|S\d+$|T\d|CWE-)/.test(v) && !['High', 'Medium', 'Low', 'Select', 'Consolidate', 'Consider', 'Defer', 'Very high', 'Immediate', 'Near-term', 'Medium-term', 'Monthly', 'Weekly', 'Quarterly'].includes(v) && !/^Month \d+$/.test(v)) ? '' : v);   // qual is free text (“High” / “Élevée”)
  out.sameCR = strip(self.CRG_CANARETAIL.en.ASSESSMENT) === strip(self.CRG_CANARETAIL.fr.ASSESSMENT) && strip(self.CRG_CANARETAIL.en.SCREENING.cands) === strip(self.CRG_CANARETAIL.fr.SCREENING.cands);
  out.sameMB = strip(self.CRG_MEDIBEC.SCEN) === strip(self.CRG_MEDIBEC_FR.ASSESSMENT.SCEN) && strip(self.CRG_MEDIBEC_SCREENING.cands) === strip(self.CRG_MEDIBEC_FR.SCREENING.cands);
  out.mbVectors = self.CRG_MEDIBEC.SCEN.every((s, i) => s.cvss === self.CRG_MEDIBEC_FR.ASSESSMENT.SCEN[i].cvss && s.red_p === self.CRG_MEDIBEC_FR.ASSESSMENT.SCEN[i].red_p);
  out.mbFR = JSON.stringify(self.CRG_MEDIBEC_FR);
  out.crFR = JSON.stringify(self.CRG_CANARETAIL.fr);
  return out;
});

ok(r.kind === 'example' && /CanaRetail/.test(r.name), 'CanaRetail created as a teaching example ' + r.kind + ' ' + r.name);
ok(r.en.est === 27526 && r.en.res === 16049 && r.en.err === 0, 'CanaRetail totals 27,526 / 16,049 ' + JSON.stringify(r.en));
ok(r.en.counts.above === 2 && r.en.counts.at === 3 && r.en.counts.below === 5, 'two above, three approximately at, five below tolerance ' + JSON.stringify(r.en.counts));
ok(r.shape.scen === 10 && r.shape.cand >= 25 && r.shape.cand <= 40 && r.shape.ev >= 10 && r.shape.crown === 8 && r.shape.init === 10 && r.shape.kri >= 10 && r.shape.app === 0.5, 'ten scenarios, 25–40 candidates, evidence, crown jewels, ten measures, KRIs, appetite 0.5 ' + JSON.stringify(r.shape));
ok(r.svc === 'S10' && r.svcPbx === 0.4, 'the service-account scenario is S10 with Pb(ψ,A) 0.40 (hook for the IAM sample proposal)');
ok(r.equiv.length === 3 && r.equiv.every(([, g]) => g === 0), 'three scenarios by equivalency, every metric justified ' + JSON.stringify(r.equiv));
ok(r.cvssAgree, 'every CVSS v4.0 vector scores');
ok(r.scr.list === 40 && r.scr.scored === 40 && r.scr.selected === 10 && r.scr.missing === 0 && r.scr.unreviewed === 0 && r.scr.guidance === 'good', 'screening: 40 scored, ten families, judgments and reviews recorded ' + JSON.stringify(r.scr));
ok(r.sum.decisions >= 3 && r.sum.it === 150000000 && !r.sum.gaps.includes('No evidence register.'), 'management summary: decisions, IT budget, evidence ' + JSON.stringify(r.sum));
ok(r.budgetYears === '2026,2027,2028', 'budget years from the case table');
ok(r.broken.res !== 16049 && r.sp === 'bundled', 'the case can be broken, and its starting point is the bundled case');
ok(r.after.est === 27526 && r.after.res === 16049 && r.afterScen === 10 && r.afterFam === 10, 'Start over restores CanaRetail ' + JSON.stringify(r.after));
ok(r.afterCase === 'canaretail' && r.afterKind === 'example' && r.afterId, 'Start over keeps the workspace, its type and its case');
ok(r.afterAppetite === 0.3, 'step 2 handed back to the student: appetite back to the default 0.30');
const cf = r['canaretail-fr'], mf = r['medibec-fr'];
ok(cf.tot.est === 27526 && cf.tot.res === 16049 && /Rançongiciel/.test(cf.s1) && cf.cand === 40 && cf.fam === 10, 'CanaRetail (French): same totals, French text ' + JSON.stringify(cf.tot));
ok(cf.restored.est === 27526 && cf.restoredCase === 'canaretail-fr' && /Rançongiciel/.test(cf.restoredS1), 'Start over rebuilds the French CanaRetail, not the English one');
ok(mf.tot.est === 84305 && mf.tot.res === 41023, 'MediBec (French): 84,305 / 41,023 ' + JSON.stringify(mf.tot));
ok(mf.scen === 30 && mf.cand === 45 && mf.fam === 10 && /^Compromission/.test(mf.s1) && mf.ev === 'Documenté (cas)', 'MediBec (French): 30 scenarios, 45 candidates, ten families, French text');
ok(mf.restored.est === 84305 && mf.restored.res === 41023 && mf.restoredCase === 'medibec-fr' && /^Compromission/.test(mf.restoredS1), 'Start over rebuilds the French MediBec');
ok(r.sameCR, 'CanaRetail EN and FR: same numbers, identifiers and enumerations');
ok(r.sameMB && r.mbVectors, 'MediBec FR: numbers, vectors, reductions, identifiers and enumerations untouched');
// French terminology of the book, standard French markers, no retired wording
ok(/appétence pour le risque/.test(r.mbFR) && !/appétit/.test(r.mbFR) && !/appétit/.test(r.crFR), 'French cases say “appétence pour le risque”, never “appétit”');
ok(/joyaux? de la couronne/.test(r.mbFR) && /joyaux? de la couronne/.test(r.crFR), '“joyaux de la couronne”');
ok(/Estimation analytique — validation requise/.test(r.crFR) && /Lacune d’information — validation organisationnelle requise|lacune d’information — validation organisationnelle requise/.test(r.crFR) && /Décision de la direction requise/.test(r.mbFR + r.crFR), 'standard French markers');
ok(!/Analyst estimate|Evidence gap — organi|Lacune de preuve/.test(r.mbFR + r.crFR), 'no retired marker wording');

// the Python engine agrees with the browser on every case
for (const [label, json, est, res] of [['CanaRetail EN', r.exportJSON, '27,526', '16,049'], ['CanaRetail FR', cf.json, '27,526', '16,049'], ['MediBec FR', mf.json, '84,305', '41,023']]) {
  const f = path.join(TMP, 't35-' + label.replace(/\W+/g, '_') + '.json'); fs.writeFileSync(f, json);
  const py = execFileSync('python3', ['-I', path.join(APP, 'engine', 'crg_calc.py'), f]).toString();
  ok(new RegExp(`Total estimated ${est}\\s+residual ${res}`).test(py), `engine/crg_calc.py on ${label}: ${est} / ${res}`);
}

// every screen renders with each new example open (no console error)
const SCREENS = ['process', 'org', 'org/crown', 'org/evidence', 'dashboard', 'evidence', 'register', 'scenario/S1', 'scenario/S10', 'screening', 'calc', 'riskreg',
  'mitigation', 'recs', 'budget', 'summary', 'cvss', 'export', 'qc', 'threats', 'reset', 'forecast'];
const before = errors.length;
for (const id of ['canaretail', 'canaretail-fr', 'medibec-fr']) {
  await page.evaluate(async id => { const st = await import('/js/state.js'); const w = st.S.list.find(x => x.teaching?.case === id); await st.select(w.id); }, id);
  for (const h of SCREENS) { await page.evaluate(h => { location.hash = '#/' + h; }, h); await page.waitForTimeout(250); }
}
ok(errors.length === before, 'every screen renders with CanaRetail (EN/FR) and MediBec (FR) open ' + errors.slice(before).join(' | ').slice(0, 300));
const qc = await page.evaluate(async () => { const st = await import('/js/state.js'); const Q = await import('/js/panels/qc.js');
  const w = st.S.list.find(x => x.teaching?.case === 'canaretail'); await st.select(w.id); return Q.checks(st.S.ws).filter(c => c.state === 'fail').map(c => c.id + ' ' + c.title); });
ok(!qc.some(x => /^QC-(12|26)\b/.test(x)), 'quality review: no reference or AV:N failure on CanaRetail ' + qc.join('; ').slice(0, 300));

// the picker in French
await page.evaluate(async () => { const I = await import('/js/i18n.js'); await I.setLang('fr'); location.hash = '#/org/workspaces'; });
await page.waitForTimeout(1200);
const optsFR = await page.$$eval('#panel-org select option', os => os.map(o => o.textContent));
ok(optsFR.some(t => /Exemple pédagogique : CanaRetail — commerce de détail national \(français\)/.test(t)) && optsFR.some(t => /Exemple pédagogique : MediBec — soins de santé privés \(anglais\)/.test(t)), 'French labels in the picker');
await page.evaluate(async () => { const I = await import('/js/i18n.js'); await I.setLang('en'); });

ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t35 CanaRetail and MediBec (French)');
