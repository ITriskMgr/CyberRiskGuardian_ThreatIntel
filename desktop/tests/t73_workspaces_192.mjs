// t73 — workspaces and registers of 1.9.2 (ws5): the migration sub-steps of js/migrate192/ws5.js (teaching-case identity,
// one-time asset review), restore and import that recognise a bundled teaching case whatever its id and ask
// Replace / Keep both / Skip (items 4–5, NV-036), the Risk register empty state with "—" tiles and the explanation of
// the two registers (item 9, NV-054), links to deleted scenarios flagged with Unlink and the warning before a
// scenario is deleted (item 10, NV-037), and "Create from profile & crown jewels" as a reviewed proposal that makes
// no fragments and lists unscored assets (item 19, NV-038). MediBec and CanaRetail totals are unchanged throughout.
import { open, ok, done, goto, medibec, waitInPage } from './lib.mjs';

const { browser, page, errors } = await open('#/process');
await medibec(page);
const totals = () => page.evaluate(async () => { const st = await import('/js/state.js'); const r = st.compute(); return [Math.round(r.totals.est), Math.round(r.totals.res)].join('/'); });
ok(await totals() === '84305/41023', 'MediBec 84,305 / 41,023 at the start');

/* ---------- migration sub-steps ---------- */
const mig = await page.evaluate(async () => { const M = await import('/js/migrate.js'); const st = await import('/js/state.js'); const T = await import('/js/teaching.js');
  const w = JSON.parse(JSON.stringify(st.S.ws)); w.id = 'ws-old1'; w.teaching = null; w.dataVersion = 5; delete w.assetReview;
  w.assets = [{ id: 'A-1', name: 'EHR (integrated', type: 'application', cia: { c: 3, i: 3, a: 3 } }, { id: 'A-2', name: 'and billing', type: 'application', cia: { c: 3, i: 3, a: 3 } }, { id: 'A-3', name: 'Patient portal', type: 'application', cia: { c: 4, i: 4, a: 3 } }];
  w.assetLog = [{ asset: 'A-1', action: 'create', src: 'organization profile' }, { asset: 'A-2', action: 'create', src: 'organization profile' }, { asset: 'A-3', action: 'create', src: 'manual' }];
  const before = JSON.stringify(w.assessment);
  const r = M.migrateWorkspace(w, { fill: st.migrate });
  const fr = JSON.parse(JSON.stringify(st.S.ws)); fr.id = 'ws-old2'; fr.teaching = null; fr.name = 'MediBec (français) — cas pédagogique (fictif)'; fr.dataVersion = 5;
  const r2 = M.migrateWorkspace(fr, { fill: st.migrate });
  const again = M.migrateWorkspace(JSON.parse(JSON.stringify(r.ws)), { fill: st.migrate });
  return { status: r.status, tcase: r.ws.teaching?.case, review: r.ws.assetReview?.pending?.map(x => x.id), assessmentSame: JSON.stringify(r.ws.assessment) === before, assets: r.ws.assets.map(a => a.name),
    notes: r.steps.flatMap(s => s.notes).filter(n => /teaching|asset/i.test(n)), fr: r2.ws.teaching?.case, again: again.status, inferReal: T.inferCase({ kind: 'organization', name: 'MediBec Inc.' }), fixed: T.FIXED_ID('medibec') }; });
ok(mig.status === 'migrated' && mig.tcase === 'medibec' && mig.fr === 'medibec-fr', `teaching case inferred (EN ${mig.tcase}, FR ${mig.fr}), id unchanged`);
ok(mig.review?.join() === 'A-1,A-2' && mig.assets.join('|') === 'EHR (integrated|and billing|Patient portal', 'junk assets listed for review, none changed: ' + mig.review);
ok(mig.assessmentSame && mig.notes.length >= 2 && mig.again === 'current', 'numbers untouched, journal notes (' + mig.notes.length + '), idempotent');
ok(mig.inferReal === null && mig.fixed === 'ws-example-medibec', 'a real organization named MediBec is not a teaching case; fixed id ws-example-medibec');
ok(await page.evaluate(async () => { const st = await import('/js/state.js'); return st.exampleWorkspace('canaretail').id === 'ws-example-canaretail' && st.exampleWorkspace('medibec').id === 'ws-example-medibec' && st.exampleWorkspace('medibec-fr').id === 'ws-example-medibec-fr'; }), 'bundled cases carry a fixed id per case (item 4a)');

/* ---------- restore: teaching twin → Replace / Keep both / Skip ---------- */
const plan = await page.evaluate(async () => { const B = await import('/js/backup.js'); const st = await import('/js/state.js');
  const obj = await B.build({ documents: false }); const w = JSON.parse(JSON.stringify(st.S.ws)); w.id = 'ws-other-id'; obj.payload.workspaces = [w];
  const p = await B.plan(obj); return p.rows.map(r => ({ state: r.state, twin: r.twin?.name, orphan: p.orphan.length })); });
ok(plan[0].state === 'teaching-twin' && /MediBec/.test(plan[0].twin) && plan[0].orphan === 0, 'restore plan: the bundled case under another id is a twin, not an orphan');
const res = await page.evaluate(async () => { const B = await import('/js/backup.js'); const st = await import('/js/state.js'); const store = await import('/js/store.js');
  const obj = await B.build({ documents: false }); const w = JSON.parse(JSON.stringify(st.S.ws)); w.id = 'ws-other-id'; w.org.notes = 'FROM FILE'; obj.payload.workspaces = [w];
  const before = (await store.all('ws')).length;
  const d1 = await B.restore(obj, { twins: { 'ws-other-id': 'skip' } }); const n1 = (await store.all('ws')).length;
  const d2 = await B.restore(obj, { twins: { 'ws-other-id': 'keep' } }); const n2 = (await store.all('ws')).length;
  const d3 = await B.restore(obj, { twins: { 'ws-other-id': { choice: 'replace', twin: st.S.ws.id } } }); const all3 = await store.all('ws'); const n3 = all3.length;
  const replaced = all3.find(x => x.id === st.S.ws.id); const kept = all3.find(x => x.id !== st.S.ws.id && /MediBec/.test(x.name));
  for (const x of all3) if (x.id !== st.S.ws.id && /MediBec/.test(x.name)) await store.del('ws', x.id);
  await store.put('ws', st.S.ws.id, st.S.ws); await st.refreshList();
  return { before, n1, n2, n3, d1: d1.skipped_twins, d2: d2.kept, d3: d3.replaced, notes: replaced?.org?.notes, keptId: kept?.id, anyFileId: all3.some(x => x.id === 'ws-other-id') }; });
ok(res.n1 === res.before && res.d1 === 1, 'Skip writes nothing');
ok(res.n2 === res.before + 1 && res.d2 === 1 && res.keptId && res.keptId !== 'ws-other-id' && !res.anyFileId, 'Keep both adds the copy under a new id');
ok(res.n3 === res.n2 && res.d3 === 1 && res.notes === 'FROM FILE', 'Replace overwrites the named twin under its own id');
// the restore screen offers the three choices for a twin
await goto(page, '#/backup', 800);
const choice = await page.evaluate(async () => { const B = await import('/js/backup.js'); const st = await import('/js/state.js');
  const obj = await B.build({ documents: false }); const w = JSON.parse(JSON.stringify(st.S.ws)); w.id = 'ws-other-id'; obj.payload.workspaces = [w]; obj.checksum = await B.digest(JSON.stringify(obj.payload));
  const f = new File([JSON.stringify(obj)], 'crg-backup-test.json', { type: 'application/json' });
  const inp = document.querySelector('#panel-backup input[type="file"]'); const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; inp.dispatchEvent(new Event('change')); return true; });
await page.waitForTimeout(1200);
const ui = await page.evaluate(() => { const sel = [...document.querySelectorAll('#panel-backup table select')].find(s => /Skip|Replace|Keep/.test(s.textContent)); return { options: sel ? [...sel.options].map(o => o.value) : null, value: sel?.value, banner: [...document.querySelectorAll('#panel-backup .banner b')].map(b => b.textContent).find(t => /teaching case/.test(t)) }; });
ok(ui.options?.join() === 'replace,keep,skip' && ui.value === 'replace' && /1 teaching case\(s\) in this file are already here/.test(ui.banner || ''), 'restore screen: Replace the copy here (default: the MediBec here is untouched) / Keep both / Skip, with its banner');
ok(await page.evaluate(async () => { const B = await import('/js/backup.js'); const st = await import('/js/state.js'); const w = JSON.parse(JSON.stringify(st.S.ws)); const pristine = B.unchangedSinceCreation(w); w.assessment.SCEN[0].params.PbA.v = 0.11; const changed = B.unchangedSinceCreation(w); const now = new Date().toISOString(); return pristine === true && changed === false && B.unchangedSinceCreation({ kind: 'organization', created: '2026-01-01T00:00:00Z', modified: now, docs: [] }) === false; }), 'Replace is the default only for a copy unchanged since its creation (a changed parameter → Skip)');

/* ---------- import: same rule (Workspaces tab) ---------- */
await goto(page, '#/org/workspaces', 800);
const imp = await page.evaluate(async () => { const st = await import('/js/state.js'); const w = JSON.parse(JSON.stringify(st.S.ws)); w.id = 'ws-import-id'; w.docTexts = {}; w.org.notes = 'FROM IMPORT';
  const sel = [...document.querySelectorAll('#panel-org select')].find(s => [...s.options].some(o => o.value === 'import')); sel.value = 'import'; sel.dispatchEvent(new Event('change'));
  const f = new File([JSON.stringify(w)], 'MediBec.crg-workspace.json', { type: 'application/json' }); const inp = document.querySelector('#panel-org input[type="file"][accept=".json"]'); const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; inp.dispatchEvent(new Event('change')); return true; });
await page.waitForTimeout(1200);
const dlg = await page.evaluate(() => ({ title: document.querySelector('.modal h2')?.textContent, buttons: [...document.querySelectorAll('.modal .btnrow button')].map(b => b.textContent) }));
ok(/teaching case is already here/.test(dlg.title || '') && dlg.buttons.join('|') === 'Update the one here|Keep both|Skip', 'import of a case already here asks Update the one here / Keep both / Skip: ' + dlg.buttons.join(' / '));
await page.click('.modal button:has-text("Skip")'); await page.waitForTimeout(500);
ok(await page.evaluate(async () => (await import('/js/state.js')).S.list.filter(w => /MediBec/.test(w.name)).length === 1), 'Skip: still one MediBec');
ok(await totals() === '84305/41023', 'MediBec totals unchanged after restore and import');

/* ---------- item 9: Risk register empty state on a blank workspace ---------- */
await page.evaluate(async () => { const st = await import('/js/state.js'); const w = st.newWorkspace({ name: 'Blank 192' }); await st.create(w); });
await goto(page, '#/riskreg', 800);
const rr = await page.evaluate(() => ({ tiles: [...document.querySelectorAll('#panel-riskreg .kpi .v')].map(v => v.textContent), empty: document.querySelector('#panel-riskreg .empty-state b')?.textContent, text: document.querySelector('#panel-riskreg .empty-state')?.textContent || '', btn: document.querySelector('#panel-riskreg .empty-state button')?.textContent, disabled: document.querySelector('#panel-riskreg .empty-state button')?.disabled }));
ok(rr.tiles.length === 5 && rr.tiles.every(t => t === '—'), 'risk register: five "—" tiles on a blank workspace ' + rr.tiles.join(' '));
ok(rr.empty === 'No risks yet — create them from your scenarios' && /Scenario register/.test(rr.text) && /management/.test(rr.text), 'the empty state: "No risks yet — create them from your scenarios", with the difference explained');
ok(await page.evaluate(() => !!document.querySelector('#panel-riskreg .lede a[href="#/register"]')), 'the Risk register lede links to the Scenario register');
await goto(page, '#/register', 600);
ok(await page.evaluate(() => !!document.querySelector('#panel-register .lede a[href="#/riskreg"]')), 'the Scenario register lede links to the Risk register');
await goto(page, '#/riskreg', 600);
ok(/Create from scenarios not yet in the register \(0\)/.test(rr.btn || '') && rr.disabled === true, 'the Create-from-scenarios button is there (disabled with 0 scenarios)');
await goto(page, '#/register', 600);
ok((await page.evaluate(() => [...document.querySelectorAll('#panel-register .kpi .v')].map(v => v.textContent))).every(t => t === '—'), 'scenario register: "—" tiles on a blank workspace');
await goto(page, '#/calc', 600);
ok((await page.evaluate(() => [...document.querySelectorAll('#panel-calc .kpi .v')].slice(0, 4).map(v => v.textContent))).every(t => t === '—'), 'calculator: "—" tiles on a blank workspace');
await goto(page, '#/summary', 800);
ok((await page.evaluate(() => [...document.querySelectorAll('#panel-summary .kpi .v')].filter((v, i) => i < 3).map(v => v.textContent))).every(t => t === '—'), 'summary: "—" totals on a blank workspace');
// with scenarios: the button creates risks
await medibec(page);
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.risks = []; st.touch(); });
await goto(page, '#/riskreg', 800);
await page.click('#panel-riskreg .empty-state button:has-text("Create from scenarios")'); await page.waitForTimeout(800);
ok(await page.evaluate(async () => (await import('/js/state.js')).S.ws.risks.length === 30), 'Create from scenarios not yet in the register (30) fills the register');
// the CRG columns follow a Scenario-editor change
const crg0 = await page.evaluate(async () => { const st = await import('/js/state.js'); const G = await import('/js/registry.js'); const r = st.S.ws.risks.find(x => x.scenarios.includes('S2')); return G.crgOf(r, st.compute()).ratio; });
await page.evaluate(async () => { const st = await import('/js/state.js'); const s = st.S.ws.assessment.SCEN.find(x => x.id === 'S2'); window.__de = s.params.De.v; s.params.De.v = Math.max(0, s.params.De.v - 0.3); st.touch(); });
await goto(page, '#/register', 300); await goto(page, '#/riskreg', 800);
const crg1 = await page.evaluate(async () => { const st = await import('/js/state.js'); const G = await import('/js/registry.js'); const r = st.S.ws.risks.find(x => x.scenarios.includes('S2')); const row = [...document.querySelectorAll('#panel-riskreg table tbody tr')].find(tr => tr.children[0]?.textContent.trim() === r.id && tr.querySelector('td.num')); return { ratio: G.crgOf(r, st.compute()).ratio, shown: row?.querySelector('td.num')?.textContent }; });
ok(crg1.ratio !== crg0 && crg1.shown && crg1.shown.startsWith(crg1.ratio.toFixed(2)), `CRG columns follow a Scenario-editor change (${crg0.toFixed(2)} → ${crg1.ratio.toFixed(2)}, shown ${crg1.shown})`);
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.assessment.SCEN.find(x => x.id === 'S2').params.De.v = window.__de; st.touch(); });
ok(await totals() === '84305/41023', 'totals unchanged by the register');

/* ---------- item 10: deleted scenario links ---------- */
await page.evaluate(async () => { const st = await import('/js/state.js'); const G = await import('/js/registry.js'); const r = G.blankRisk({ title: 'Test deleted link', scenarios: ['S99', 'S1'] }); st.S.ws.risks.push(r); st.touch(); window.__rid = r.id; });
await goto(page, '#/register', 400); await goto(page, '#/riskreg', 800);
const flag = await page.evaluate(() => ({ banner: [...document.querySelectorAll('#panel-riskreg .banner.warn b')].map(b => b.textContent).join(' '), pill: [...document.querySelectorAll('#panel-riskreg .pill.bad')].some(p => /Linked scenario S99 no longer exists/.test(p.textContent)) }));
ok(/1 risk\(s\) link a scenario that no longer exists/.test(flag.banner) && flag.pill, 'a link to a deleted scenario is flagged in the banner and the row ("Linked scenario S99 no longer exists")');
await page.evaluate(() => { location.hash = '#/riskreg/' + window.__rid; }); await page.waitForTimeout(800);
ok(await page.locator('#risk-edit button:has-text("Unlink")').count() === 1, 'the editor offers Unlink for the deleted scenario');
await page.click('#risk-edit button:has-text("Unlink")'); await page.waitForTimeout(500);
const after = await page.evaluate(async () => { const st = await import('/js/state.js'); const r = st.S.ws.risks.find(x => x.id === window.__rid); return { sc: r.scenarios.join(), hist: r.history.some(h => /Unlinked deleted scenario S99/.test(h.what)) }; });
ok(after.sc === 'S1' && after.hist, 'Unlink removes the link and journals it');
// the warning before deleting a scenario names the linked risks
await goto(page, '#/scenario/S1', 800);
let confirmText = '';
page.once('dialog', d => { confirmText = d.message(); d.dismiss(); });
await page.click('#panel-scenario button:has-text("Delete")'); await page.waitForTimeout(500);
ok(/\d+ risk\(s\) link this scenario/.test(confirmText) && /R-0\d\d/.test(confirmText), 'deleting a scenario warns "n risk(s) link this scenario": ' + confirmText.slice(0, 120));
// accept the deletion once to see the unlink logged in each risk's history, then restore S1
const s1 = await page.evaluate(async () => JSON.stringify((await import('/js/state.js')).S.ws.assessment.SCEN.find(s => s.id === 'S1')));
page.once('dialog', d => d.accept());
await page.click('#panel-scenario button:has-text("Delete")'); await page.waitForTimeout(600);
ok(await page.evaluate(async () => { const st = await import('/js/state.js'); return st.S.ws.risks.filter(r => r.scenarios.includes('S1')).every(r => r.history.some(h => /Linked scenario S1 deleted/.test(h.what))); }), 'the deletion is logged in each linked risk\'s history');
await page.evaluate(async s => { const st = await import('/js/state.js'); st.S.ws.assessment.SCEN.splice(0, 0, JSON.parse(s)); st.touch(); }, s1);
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.risks = st.S.ws.risks.filter(x => x.id !== window.__rid); st.touch(); });

/* ---------- item 19: assets from the profile, reviewed ---------- */
await goto(page, '#/assets', 800);
const prop = await page.evaluate(async () => { const X = await import('/js/assets.js'); const st = await import('/js/state.js'); const p = X.proposeFromProfile(st.S.ws);
  return { n: p.length, crown: p.filter(x => x.source === 'crown').length, withCia: p.filter(x => x.cia).length, ticked: p.filter(x => x.take).length, crownIds: p.filter(x => x.source === 'crown').every(x => /^CJ\d+$/.test(x.crownId)), types: [...new Set(p.map(x => x.type))], split: X.splitSystems('Integrated EHR (clinical, billing) (E1, E2); radiology, laboratory and pharmacy systems E3;\ne-mail, and connected medical equipment.'), frag: p.filter(x => /^and\b/i.test(x.name) || (x.name.match(/\(/g) || []).length !== (x.name.match(/\)/g) || []).length).length, iot: X.inferType('Connected medical equipment'), net: X.inferType('Clinic Wi-Fi network'), app: X.inferType('Integrated EHR') }; });
ok(prop.split.join('|') === 'Integrated EHR (clinical, billing)|radiology, laboratory and pharmacy systems|e-mail, and connected medical equipment', 'splitter: ";" and new lines only, evidence references stripped: ' + prop.split.join(' | '));
ok(prop.n > 0 && prop.frag === 0 && prop.crown > 0 && prop.withCia === prop.crown && prop.ticked === prop.crown && prop.crownIds && prop.types.length > 1, `proposals: ${prop.n}, ${prop.crown} crown jewels ticked with C/I/A and their id, ${prop.n - prop.crown} free-text names unticked`);
ok(prop.iot === 'iot' && prop.net === 'network' && prop.app === 'application', 'type inference: equipment → iot, Wi-Fi → network, EHR → application');
const nAssets0 = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assets.length);
await page.click('#panel-assets button:has-text("Create from profile")'); await page.waitForTimeout(600);
const modalRows = await page.evaluate(() => ({ rows: document.querySelectorAll('.modal table tbody tr').length, title: document.querySelector('.modal h2')?.textContent }));
ok(modalRows.rows === prop.n && /Review the assets proposed/.test(modalRows.title || ''), 'a review modal lists every proposal ticked (' + modalRows.rows + ')');
// tick every free-text name, untick the first crown jewel
await page.evaluate(() => { const cbs = [...document.querySelectorAll('.modal table tbody tr input[type="checkbox"]')]; cbs.forEach((c, i) => { const want = i !== 0; if (c.checked !== want) { c.checked = want; c.dispatchEvent(new Event('change')); } }); });
await page.click('.modal button:has-text("Add ticked assets")'); await page.waitForTimeout(700);
const created = await page.evaluate(async () => { const st = await import('/js/state.js'); return { n: st.S.ws.assets.length, frag: st.S.ws.assets.filter(a => /^and\b/i.test(a.name) || (a.name.match(/\(/g) || []).length !== (a.name.match(/\)/g) || []).length).length, review: document.querySelector('#panel-assets .banner.warn b')?.textContent, pending: st.S.ws.assetReview?.pending?.length || 0, log: st.S.ws.assetLog.filter(l => l.action === 'create' && /crown jewel|organization profile/.test(l.src)).length }; });
ok(created.n === nAssets0 + prop.n - 1 && created.frag === 0, `${prop.n - 1} assets added (first crown jewel unticked), no fragment`);
ok(/asset\(s\) to review/.test(created.review || '') && created.pending === prop.n - prop.crown && created.pending >= 2, 'assets added without C/I/A levels are listed for review (' + created.pending + ')');
ok(await page.evaluate(async () => { const st = await import('/js/state.js'); const a = st.S.ws.assets.find(x => x.crownId); return !!a && /^CJ\d+$/.test(a.crownId) && a.cia.c >= 1; }), 'a crown-jewel asset links back to its crown-jewel id');
// the one-time review list: Keep / Delete each, nothing deleted without a click
await page.click('#panel-assets .banner.warn button:has-text("Review them…")'); await page.waitForTimeout(500);
const rv = await page.evaluate(() => ({ title: document.querySelector('.modal h2')?.textContent, rows: document.querySelectorAll('.modal table tbody tr').length, keep: [...document.querySelectorAll('.modal table button')].filter(b => b.textContent === 'Keep').length }));
ok(/Review the assets created from the profile/.test(rv.title || '') && rv.rows === created.pending && rv.keep === rv.rows, 'the review list opens over the listed assets with Keep / Delete each: ' + rv.rows);
const nBefore = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assets.length);
await page.click('.modal table tbody tr:nth-child(1) button:has-text("Delete")'); await page.waitForTimeout(200);
await page.click('.modal button:has-text("Later")'); await page.waitForTimeout(400);
const afterRv = await page.evaluate(async () => { const st = await import('/js/state.js'); return { n: st.S.ws.assets.length, pending: st.S.ws.assetReview.pending.filter(p => st.S.ws.assets.some(a => a.id === p.id)).length, log: st.S.ws.assetLog.some(l => l.action === 'delete' && l.src === 'one-time review'), banner: !!document.querySelector('#panel-assets .banner.warn') }; });
ok(afterRv.n === nBefore - 1 && afterRv.pending === created.pending - 1 && afterRv.log && afterRv.banner, 'Delete removes one asset (journalled); Later keeps the rest listed');
await page.click('#panel-assets .banner.warn button:has-text("Review them…")'); await page.waitForTimeout(500);
await page.click('.modal table tbody tr:nth-child(1) button:has-text("Keep")'); await page.waitForTimeout(200);
await page.click('.modal button:has-text("Done")'); await page.waitForTimeout(500);
const afterKeep = await page.evaluate(async () => { const st = await import('/js/state.js'); return { n: st.S.ws.assets.length, pending: st.S.ws.assetReview.pending.length, reviewed: !!st.S.ws.assetReview.reviewed }; });
ok(afterKeep.n === nBefore - 1 && afterKeep.pending === created.pending - 2 && afterKeep.reviewed === (afterKeep.pending === 0), 'Keep clears one without deleting; the review closes by itself once the list is empty');
if (afterKeep.pending) { await page.click('#panel-assets .banner.warn button:has-text("Keep all and close the review")'); await page.waitForTimeout(500); }
ok(await page.evaluate(async () => { const st = await import('/js/state.js'); return !!st.S.ws.assetReview.reviewed && !document.querySelector('#panel-assets .banner.warn'); }), 'the review is closed');
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.assets = st.S.ws.assets.slice(0, 0); st.S.ws.assetReview = { pending: [], created: null, reviewed: null }; st.touch(); });
ok(await totals() === '84305/41023', 'MediBec 84,305 / 41,023 at the end');
ok(errors.length === 0, 'no page errors: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t73 workspaces 1.9.2');
