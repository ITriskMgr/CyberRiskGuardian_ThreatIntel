// t79 — every accept / add / apply action that writes data redraws its screen and its tiles (1.9.3, W4 rule).
// Part 1 reads the code: every onclick handler of the screens that writes to the workspace (touch(), push, splice…) must
// redraw (draw / render / redraw / go / reopen…) — the handlers that deliberately do not are listed below with their reason,
// so a new one has to be reviewed. Part 2 drives a representative set in the browser and asserts the new value is visible
// without a reload: crown jewels, information assets, evidence, measures (add, apply), initiatives from measures, a
// recommendation transition, a KRI recording, the sensitivity-review record.
import { open, ok, done, goto, medibec, APP } from './lib.mjs';
import fs from 'fs';
import path from 'path';

/* ---------- part 1: the list is built from the code ---------- */
const OUT = /\b(open[A-Z]\w*|draw\w*|redraw|goOrRedraw|go\(|refresh\w*|render\w*|paint\w*|replaceChildren|reopen\w*|importTab|again|rebuild\w*|update\w*|reload|mount\w*|location|rerender|portfolio|show\w*|count\(|sync\w*)/;
const MUT = /\b(touch\(|saveNow|save\w*\(|\.push\(|\.splice\(|\.unshift\()/;
function handlers(file) {
  const s = fs.readFileSync(file, 'utf8'), out = [];
  const re = /onclick:\s*(async\s*)?(\(\w*\)|\w+)\s*=>\s*/g; let m;
  while ((m = re.exec(s))) {
    let i = m.index + m[0].length, body;
    if (s[i] === '{') { let d = 0, j = i; for (; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (d === 0) break; } } body = s.slice(i, j + 1); }
    else body = s.slice(i, s.indexOf('\n', i));
    out.push({ line: s.slice(0, m.index).split('\n').length, body });
  }
  return out;
}
// handlers reviewed in 1.9.3 that write without redrawing, on purpose (the value is already on screen, or the write is elsewhere)
const REVIEWED = {
  'batch.js': 1,        // new random seed: the seed output and the count are updated in place
  'calc.js': 3,         // appetite/factor save (inputs stay), the three portfolio selectors call portfolio() — matched by name only partly
  'export.js': 1,       // saveNow before a file export
  'forecast.js': 1,     // CSV download
  'importui.js': 1,     // Start the import: sets the plan, then org.start() navigates
  'ontology_link.js': 1, // helper configuration
  'org.js': 1,          // Save the profile and continue → proceed()
  'rhub.js': 3,         // cards to the Batch grid (touch('batch'), another screen), package download, settings
  'settings_ai.js': 4, 'settings_more.js': 5,   // settings screens: rerender() by another name, prompts
  'threatctx.js': 1, 'writer.js': 3, 'writer_steps.js': 1,   // textarea fill; Writer save() redraws itself
  'calc.js#save': 0,
};
const panels = path.join(APP, 'js/panels');
const flagged = {};
for (const f of fs.readdirSync(panels).filter(f => f.endsWith('.js') && !/^screening/.test(f))) {
  for (const h of handlers(path.join(panels, f))) if (MUT.test(h.body) && !OUT.test(h.body)) (flagged[f] ||= []).push(h.line);
}
let unexpected = [];
for (const [f, lines] of Object.entries(flagged)) if (lines.length > (REVIEWED[f] ?? 0)) unexpected.push(`${f}:${lines.join(',')}`);
ok(unexpected.length === 0, 'part 1: no unreviewed handler writes data without redrawing its screen' + (unexpected.length ? ' — ' + unexpected.join(' ') : ''));
const recsSrc = fs.readFileSync(path.join(panels, 'recs.js'), 'utf8');
ok(/K\.toInitiative\(m\)\); touch\('redraw'\)/.test(recsSrc), 'part 1: "Create initiatives from the measures" redraws (it did not in 1.9.2)');

/* ---------- part 2: the screens ---------- */
const { browser, page, errors } = await open('#/process');
await medibec(page);
const text = sel => page.evaluate(s => document.querySelector(s)?.innerText || '', sel);
const badge = id => page.evaluate(id => document.getElementById(id)?.textContent || '', id);

// crown jewels: Add crown jewel
await goto(page, '#/org/crown', 800);
const cj = () => page.evaluate(() => document.querySelectorAll('#panel-org table.grid tbody tr').length);
const c0 = await cj(); await page.click('#panel-org button:has-text("Add crown jewel")'); await page.waitForTimeout(300);
ok(await cj() === c0 + 1, `crown jewels: Add crown jewel shows the new row at once (${c0} → ${await cj()})`);
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.assessment.CROWN.pop(); st.touch(); });

// information assets: New asset (tile in the menu and the editor)
await goto(page, '#/assets', 800);
const a0 = Number(await badge('nb-assets') || 0);
await page.click('#panel-assets button:has-text("New asset")'); await page.waitForTimeout(500);
const a1 = Number(await badge('nb-assets') || 0);
ok(a1 === a0 + 1 && /New asset|ID|Name/i.test(await text('#panel-assets')) && await page.evaluate(() => !!document.querySelector('#panel-assets input, #panel-assets textarea')), `information assets: New asset opens its editor and the menu tile moves (${a0} → ${a1})`);

// evidence: Add evidence → Save
await goto(page, '#/evidence', 800);
const ev0 = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.EVIDENCE.length);
await page.click('#ev-add'); await page.waitForSelector('#ev-editor');
const nid = await page.inputValue('#ev-id'); await page.fill('#ev-title', 'T79 evidence source');
await page.click('#ev-save'); await page.waitForTimeout(500);
ok(await page.evaluate(() => !document.getElementById('ev-editor')) && (await text('#panel-evidence')).includes('T79 evidence source') && (await text('#panel-evidence')).includes(nid), `evidence: the saved ${nid} is in the register at once, editor closed (${ev0} rows before)`);

// measures: New measure, then Apply
await goto(page, '#/mitigation', 800);
const m0 = Number(await badge('nb-meas') || 0);
await page.click('#panel-mitigation button:has-text("New measure")'); await page.waitForTimeout(500);
const m1 = Number(await badge('nb-meas') || 0);
ok(m1 === m0 + 1, `measures: New measure moves the menu tile (${m0} → ${m1}) and opens the editor`);
const sid = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const K = await import('/js/catalog.js'); const ws = st.S.ws;
  const s = ws.assessment.SCEN.find(x => !x.red_source && x.red_p !== 0.5 && x.red_i !== 0.5) || ws.assessment.SCEN[0];
  const m = ws.measures[ws.measures.length - 1]; m.name = 'T79 measure'; m.scen = [s.id]; m.rp = 0.5; m.ri = 0.5; m.status = 'planned'; st.touch('redraw');
  return s.id;
});
await page.waitForTimeout(600);
const resCell = () => page.evaluate(sid => { const tb = [...document.querySelectorAll('#panel-mitigation table')].find(t => /Current red_p/.test(t.innerText)); const r = [...(tb?.querySelectorAll('tbody tr') || [])].find(tr => tr.cells[0]?.innerText.trim().startsWith(sid + ' ') || tr.cells[0]?.innerText.trim() === sid); return r ? r.cells[1].innerText.trim() : null; }, sid);
const before = await resCell();
const applyBtn = page.locator('#panel-mitigation button:has-text("Apply")').first();
if (await applyBtn.count()) {
  await applyBtn.click(); await page.waitForTimeout(500);
  const after = await resCell();
  const applied = await page.evaluate(async sid => (await import('/js/state.js')).S.ws.assessment.SCEN.find(x => x.id === sid).red_source?.measures?.length > 0, sid);
  ok(applied && before !== after, `measures: Apply writes the reductions and the row shows them at once ("${before}" → "${after}")`);
} else ok(false, 'measures: no Apply button found on the impact view for ' + sid + ' (tabs: ' + tabs.join(', ') + ')');

// initiatives from measures (shared controls)
await page.evaluate(async () => { const st = await import('/js/state.js'); for (const m of st.S.ws.measures) m.initId = null; st.S.ws.assessment.INITIATIVES = []; st.touch('redraw'); });
await goto(page, '#/recs', 800);
const sharedTab = (await page.$$eval('#panel-recs [role=tab]', a => a.map(x => x.textContent.trim()))).find(t => /Shared/.test(t));
await page.click(`#panel-recs [role=tab]:has-text("${sharedTab}")`); await page.waitForTimeout(500);
ok(await page.isVisible('#shared-create-inits'), 'initiatives: the "create initiatives" banner shows when a measure has none');
await page.click('#shared-create-inits'); await page.waitForTimeout(600);
ok(!(await page.isVisible('#shared-create-inits').catch(() => false)) && await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.INITIATIVES.length > 0), 'initiatives: after "Create initiatives from the measures" the banner is gone and the list shows them (no reload)');

// recommendation: New draft, then a transition
await goto(page, '#/recs/register', 800);
await page.click('#panel-recs button:has-text("New draft"), #panel-recs button:has-text("Start an empty draft")'); await page.waitForTimeout(500);
const bar = () => page.$$eval('#panel-recs button', a => a.map(b => b.textContent.trim()).filter(t => t.startsWith('→')));
const b0 = await bar();
ok(b0.length > 0, 'recommendations: New draft opens the recommendation with its transitions: ' + b0.join(' '));
await page.click(`#panel-recs button:has-text("${b0[0]}")`); await page.waitForTimeout(600);
const b1 = await bar();
ok(JSON.stringify(b0) !== JSON.stringify(b1) && !b1.includes(b0[0]), `recommendations: after ${b0[0]} the available transitions change at once (${b1.join(' ')})`);

// KRI: record a measurement
await goto(page, '#/dashboard', 900);
const h0 = await page.evaluate(async () => (await import('/js/state.js')).S.ws.kriHistory.length);
await page.fill('#panel-dashboard input[type=date]', '2026-11-12').catch(() => {});
await page.click('#panel-dashboard button:has-text("Record computed + entered values")'); await page.waitForTimeout(700);
const h1 = await page.evaluate(async () => (await import('/js/state.js')).S.ws.kriHistory.length);
ok(h1 === h0 + 1 && /2026-11-12/.test(await text('#panel-dashboard')), `KRI: the recorded measurement (2026-11-12) is visible in the history at once (${h0} → ${h1})`);

// calculator: record the sensitivity review
const sc1 = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.SCEN[0].id);
await page.evaluate(async () => { (await import('/js/state.js')).S.ws.assessment.SENS_IDS = []; });
await goto(page, '#/calc/' + sc1, 1000);
const sens = page.locator('#sens-record');
if (await sens.count()) {
  const t0 = await sens.innerText(); await sens.click(); await page.waitForTimeout(300);
  ok(/✓/.test(await page.locator('#sens-record').innerText()) && t0 !== await page.locator('#sens-record').innerText(), 'calculator: "Record the sensitivity review" shows "Sensitivity reviewed ✓" at once');
} else ok(false, 'calculator: no #sens-record button (a scenario must be open)');

ok(errors.filter(e => !/preload|Service Worker/i.test(e)).length === 0, 'no page errors: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t79 rerender');
