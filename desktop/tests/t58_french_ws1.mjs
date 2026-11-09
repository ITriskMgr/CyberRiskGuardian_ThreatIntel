// 1.9.2 (ws1) — the new screens and messages of the method items in French: the step-5 card and the Batch banner (C4),
// the Candidates & scores buttons (C1, C2, C5), the step-2 extraction card (NV-097), the appetite validation (NV-017), the
// approver messages (#22, NV-020), the D2 review item and the quality review's new rows. Nothing shown untranslated on
// these elements, and the markers in their French wording. Terminology: « probabilité », « éléments probants ».
import { open, ok, done, goto, waitInPage } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js');
  const w = st.newWorkspace({ name: 'Logistique Laurentide (t58)' }); w.org.name = 'Logistique Laurentide';
  w.docs = [{ id: 'doc-t58', name: 'profil.txt', size: 50, added: '2026-11-08' }]; w.assessment.EVIDENCE = [['E1', 'profil.txt', 'Documented', 'x']];
  w.reductionReview = { date: '2026-11-08', scenarios: ['S1'], reviewed: null, by: '', note: '' };
  const s = st.blankScenario('S1'); s.name = 'Hameçonnage'; s.red_p = 0.5; s.red_i = 0.5; w.assessment.SCEN.push(s);
  await st.create(w);
  st.S.ws.batchDraft = [{ pick: true, name: 'Ligne', statement: 'A → B', threat_source: 'Cybercriminel', assets: 'TMS', vulns: 'MFA', attack: [], cwe: [], cves: [], params: { PbA: 0.5, Pbx: 0.5, De: 0.5, Dm: 0.8, Th: 0.45, Mu: 0.7 }, cvss: '', cvss_score: null, red_p: 0, red_i: 0, pattern: 'phish', rat: {} }];
  SC.addCandidate({ name: 'Candidat un', source: 'Cybercriminel', assets: 'TMS' }, st.S.ws); st.touch(); await st.saveNow();
  const i = await import('/js/i18n.js'); await i.setLang('fr');
});
await page.reload();
await waitInPage(page, async () => { const m = await import('/js/state.js'); return !!m.S.ws; }, null, { timeout: 20000, every: 300 });
await page.evaluate(async () => { const i = await import('/js/i18n.js'); window.__miss = i.collectMissing(); });
const text = sel => page.evaluate(s => document.querySelector(s)?.textContent || '', sel);

/* ---------------- Process: D2 review item, step-2 card ---------------- */
await goto(page, '#/process', 1200);
const pr = { review: await text('#reduction-review'), card: await text('.next-step'), pre: await text('#step2-prereq') };
ok(/Point de revue — réductions encore à l’ancienne valeur par défaut/.test(pr.review) && /réductions de probabilité et d’impact/.test(pr.review) && /Marquer comme révisé/.test(pr.review), 'the D2 review item reads in French (« probabilité »)');
ok(/Extraire des documents…/.test(pr.card) && /champs de contexte remplis sur 12/.test(pr.card) && /Prérequis : 1 document\(s\) de contexte/.test(pr.pre), 'the step-2 extraction card reads in French ' + pr.pre.slice(0, 60));
ok(/Joyaux de la couronne/.test(pr.card) && /Importer des documents/.test(pr.card), 'its links are in French');

/* ---------------- step 5: the card and the Batch banner ---------------- */
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.org = Object.assign(st.S.ws.org, { context: 'c', mission: 'm', services: 's', processes: 'p', systems: 'sy', cloud: 'cl', suppliers: 'su', sensitive: 'se', regulations: ['Loi 25'] }); st.S.ws.assessment.CROWN = [['CJ1', 'TMS', 'r', 'COO', 'High', 'High', 'High'], ['CJ2', 'WMS', 'r', 'COO', 'High', 'High', 'High'], ['CJ3', 'ERP', 'r', 'CFO', 'High', 'High', 'High']]; st.S.ws.org.scope = 's'; st.S.ws.org.exclusions = 'aucune'; st.S.ws.org.perspectives = 'p'; st.S.ws.assessment.EVIDENCE = [['E1', 'x']]; st.S.ws.snapshot = { name: 'x' }; st.S.ws.vulns = [{ id: 'CVE-2024-3400', kind: 'CVE' }]; st.S.ws.appetite_rationale = 'r'; st.S.ws.budget.it_budget = 1000000; st.S.ws.org.materiality = 'm'; st.touch(); });
await goto(page, '#/batch', 600); await goto(page, '#/process', 1200);
const s5 = await text('.next-step');
ok(/Générer des scénarios candidats|Générer les scénarios candidats/.test(s5) && /20 candidats dans Filtrage des scénarios/.test(s5) && /1 maintenant/.test(s5) && /1 ligne\(s\) attendent dans la grille/.test(s5) && /Ajouter des scénarios du registre comme candidats/.test(s5), 'the step-5 card counts the candidates and names the three ways, in French ' + s5.replace(/\s+/g, ' ').slice(0, 160));
ok(!/candidates in Scenario|Batch grid|Generate or write/.test(s5), 'no English left on the step-5 card');
await goto(page, '#/batch', 1000);
const bb = await page.evaluate(() => [...document.querySelectorAll('#panel-batch .banner')].map(b => b.textContent).join(' | '));
ok(/Ces lignes ne sont pas encore des candidats/.test(bb) && /1 sur 20 maintenant/.test(bb), 'the Batch banner reads in French: ' + bb.slice(0, 80));

/* ---------------- Candidates & scores ---------------- */
await goto(page, '#/screening/candidates', 1000);
const sc = await page.$$eval('#panel-screening button', bs => bs.map(b => b.textContent));
ok(sc.some(b => /^Ajouter des scénarios du registre comme candidats \(1\)$/.test(b)) && sc.some(b => /^Estimer tous les non notés avec l’IA \(1\)$/.test(b)), 'C1 and C5 buttons in French ' + sc.filter(b => /registre|IA/.test(b)).join(' · '));
ok(/distincts · trop peu/.test(await text('#panel-screening')), 'the candidate KPI says « distincts »');
await page.evaluate(() => { [...document.querySelectorAll('#panel-screening tbody tr button')][0].click(); }); await page.waitForTimeout(500);
ok(await page.isVisible('#scr-remove') && (await text('#scr-remove')) === 'Retirer', 'the Remove button reads « Retirer »');

/* ---------------- Profile: appetite validation ---------------- */
await goto(page, '#/org/profile', 1000);
await page.fill('#org-appetite', '1.5'); await page.waitForTimeout(200);
ok(/doit être strictement entre 0 et 1/.test(await text('#org-appetite-check')), 'the appetite message reads in French');
await page.fill('#org-appetite', '0.3');
await page.click('#panel-org button:has-text("Annuler")').catch(() => {}); await page.waitForTimeout(300);
page.on('dialog', d => d.accept());

/* ---------------- Recommendations: the approver ---------------- */
await page.evaluate(async () => {
  const st = await import('/js/state.js'); const REC = await import('/js/recommend.js'); const ws = st.S.ws;
  ws.measures = [{ id: 'MS-1', name: 'MFA', status: 'proposed', scen: ['S1'], rp: 0.5, ri: 0.3, initial: 1000, recurring: 0, months: 3, owner: 'DSI', effect: 'prevent' }];
  const d = REC.fromMeasures(['MS-1'], ws); Object.assign(d, { title: 'MFA', objective: 'o', rationale: 'r', success: 's', owner: 'DSI' }); REC.list(ws).push(d); st.touch(); window.__rec = d.id; });
const recId = await page.evaluate(() => window.__rec);
await goto(page, '#/recs/' + recId, 1000);
ok((await page.getAttribute('#rec-by', 'placeholder')) === 'Votre nom (requis pour approuver)', 'the approver field placeholder reads in French');
await page.fill('#rec-by', ''); await page.waitForTimeout(200);
const ban = await page.evaluate(() => { const b = [...document.querySelectorAll('#panel-recs button')].find(x => /→ Approuvé/.test(x.textContent)); return { disabled: b?.disabled, title: b?.title || '' }; });
ok(ban.disabled && /approbateur nommé/.test(ban.title), 'the disabled Approve button explains itself in French: ' + ban.title.slice(0, 60));

/* ---------------- Quality review: new rows ---------------- */
await goto(page, '#/qc', 1200);
const qc = await page.evaluate(() => [...document.querySelectorAll('#panel-qc tbody tr')].filter(tr => /QC-(27|28|29|30)/.test(tr.firstElementChild.textContent)).map(tr => tr.children[1].textContent));
ok(qc.length === 4 && qc.every(t => /[éèà]/.test(t)) && /paramètres provisoires ou non estimés/.test(qc[0]) && /chaîne causale complète/.test(qc[1]), 'QC-27 to QC-30 titles in French ' + qc.join(' · ').slice(0, 120));

const miss = await page.evaluate(async () => (await import('/js/i18n.js')).missingNow());
const mine = miss.filter(s => /candidates in Scenario|Estimate all|Estimate with AI|scenarios from the register|Mark as reviewed|Prerequisites|Extract from the documents|approver|placeholder|Draft carried|Scope, exclusions|Confirm the vector/.test(s));
ok(mine.length === 0, 'none of the new strings shown untranslated: ' + mine.join(' | ').slice(0, 300));
ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 400));
await browser.close(); done('t58 French of the ws1 items');
