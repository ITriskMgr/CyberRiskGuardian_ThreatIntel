import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/ontology');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id); location.hash = '#/ontology/suggest'; });
await page.waitForSelector('text=The organization, in the ontology’s terms', { timeout: 30000 });
const prof = await page.evaluate(async () => { const st = await import('/js/state.js'); return st.S.ws.ontology?.profile; });
ok(prof && prof.sector === 'health', 'profile sector from workspace: ' + JSON.stringify(prof && prof.sector));
ok(prof && prof.techniques.length > 0, 'techniques taken from the register');
// tick a theme
await page.click('label.chip:has-text("malware and ransomware") input');
await page.click('#crgo-sweep');
await page.waitForSelector('h2:has-text("Suggested scenarios")', { timeout: 60000 });
ok(await page.isVisible('#panel-ontology .pill:has-text("MCP server")'), 'answered by the MCP server');
const n = await page.$$eval('#panel-ontology table tbody tr', r => r.length);
ok(n > 3, 'several suggestions: ' + n);
await page.click('button:has-text("Add ticked to Batch scenarios")');
const r = await page.evaluate(async () => { const st = await import('/js/state.js'); const d = st.S.ws.batchDraft.filter(x => x.crgo); return { n: d.length, first: d.find(x => x.crgo.basis) || d[0] }; });
ok(r.n > 0, 'rows added to the batch grid');
ok(r.first && /\[CRGO\]$/.test(r.first.name) && r.first.crgo.id && r.first.rat.PbA.includes(r.first.crgo.id), 'row carries ontology id and labelled priors');
ok(r.first && r.first.crgo.controls.some(c => /^(ISO22|CSF2|NIST-53):/.test(c)), 'controls in catalogue notation');
// snapshot fallback gives the same kind of answer
const cmp = await page.evaluate(async () => {
  const C = await import('/js/crgo.js');
  const a = await C.call('crgo_sweep', { sector: 'health', themes: ['ThemeRansomware'], max_total: 10 });
  const b = await C.call('crgo_sweep', { sector: 'health', themes: ['ThemeRansomware'], max_total: 10 }, { prefer: 'snapshot' });
  const t = await C.call('crgo_controls_for_technique', { technique: 'T1566' }, { prefer: 'snapshot' });
  const tm = await C.call('crgo_controls_for_technique', { technique: 'T1566' });
  const sc = await C.call('crgo_scenario', { scenario_id: 'LIB-F1436' }, { prefer: 'snapshot' });
  return { av: a.via, bv: b.via, an: a.result.scenarios.length, bn: b.result.scenarios.length,
    overlap: b.result.scenarios.filter(x => a.result.scenarios.some(y => y.id === x.id)).length,
    tTop: t.result.controls.csf2?.[0]?.id, tmTop: tm.result.controls.csf2?.[0]?.id, tN: t.result.scenarios, tmN: tm.result.scenarios, sc: sc.result.name };
});
ok(cmp.av === 'mcp' && cmp.bv === 'snapshot', 'both routes answer');
ok(cmp.bn > 0, 'snapshot sweep returns scenarios');
ok(cmp.tTop === cmp.tmTop, `controls_for_technique top CSF agrees: ${cmp.tTop} vs ${cmp.tmTop}`);
ok(cmp.tN === cmp.tmN, `same number of scenarios for T1566: ${cmp.tN} vs ${cmp.tmN}`);
ok(/phishing and ransomware/i.test(cmp.sc), 'scenario detail from snapshot');
ok(cmp.overlap >= 6, 'snapshot sweep close to the server: ' + cmp.overlap + '/' + cmp.bn);
// connection tab
await page.evaluate(() => { location.hash = '#/ontology/connection'; });
await page.waitForSelector('text=Where the ontology is', { timeout: 15000 });
ok(await page.isVisible('text=found next to the application') || await page.isVisible('text=set in Settings'), 'connection shows where the server comes from');
// explore
await page.evaluate(() => { location.hash = '#/ontology/explore'; });
await page.waitForSelector('text=Controls for a technique');
await page.fill('input[placeholder="T1566"]', 'T1486');
await page.click('.card:has-text("Controls for a technique") button:has-text("Show")');
await page.waitForSelector('text=library scenarios use this technique', { timeout: 30000 });
ok(true, 'explore: controls for technique');
// committing the grid keeps the ontology link on the scenario
const kept = await page.evaluate(async () => {
  const st = await import('/js/state.js');
  st.S.ws.batchDraft.forEach(d => { d.pick = !!d.crgo; });
  location.hash = '#/batch'; await new Promise(r => setTimeout(r, 700));
  const btn = [...document.querySelectorAll('#panel-batch button')].find(b => /to the register/.test(b.textContent));
  if (!btn) return 'no button';
  btn.click(); await new Promise(r => setTimeout(r, 500));
  const s = st.S.ws.assessment.SCEN.filter(x => x.crgo);
  return { n: s.length, origin: s[0]?.origin, pba: s[0]?.params.PbA };
});
ok(kept.n > 0 && /Ontology/.test(kept.origin), 'register scenario keeps the ontology link ' + JSON.stringify(kept));
ok(errors.length === 0, 'no console error: ' + errors.join(' | '));
await browser.close(); done('t04 ontology');
