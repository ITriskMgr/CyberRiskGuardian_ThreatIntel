// Virtual consultant — knowledge base library (Settings → Knowledge base): the licence attestation, local
// extraction and indexing once for every workspace, short quotes, exclusion from backups, restores,
// registry packages and conversation exports, and the Quality review check (QC-13).
import { open, ok, done, MOCK } from './lib.mjs';
import fs from 'fs';
const CANARY = 'ZEBRAQUILL';
const LONG = Array.from({ length: 40 }, (_, i) => `Clause ${i + 1}. The ${CANARY} control requires that privileged access to clinical systems is reviewed every ninety days by the system owner, with evidence kept for audit, and that dormant privileged accounts are disabled within thirty days of the last use.`).join('\n\n');
fs.writeFileSync(MOCK + '/consultant.txt', 'Privileged access is reviewed every ninety days [P1].\n\nGENERAL: Quarterly reviews are common.\n');

const { browser, page, errors } = await open('#/settings/kb');
await page.waitForTimeout(1500);
ok(await page.isVisible('#panel-settings >> text=What the Virtual consultant knows'), 'Settings → Knowledge base lists the sources');
ok(await page.isVisible('#panel-settings >> text=I hold a licence for this text; it stays on this computer.'), 'the attestation is shown');

// the attestation gates the button, and the module refuses without it
await page.setInputFiles('#panel-settings input[type=file]', { name: 'ISO-27002-extract.md', mimeType: 'text/markdown', buffer: Buffer.from('# Access reviews\n\n' + LONG) });
ok(await page.isDisabled('#panel-settings >> text=Add to the library'), 'Add stays disabled until the attestation is ticked');
const refused = await page.evaluate(async () => { const L = await import('/js/kblib.js'); try { await L.add(new File(['x y z'], 'a.txt'), {}); return false; } catch (e) { return /attestation/.test(e.message); } });
ok(refused, 'the library refuses a file without the attestation');
await page.check('#panel-settings .kb-attest input[type=checkbox]');
ok(!(await page.isDisabled('#panel-settings >> text=Add to the library')), 'ticked: the file can be added');
await page.click('#panel-settings >> text=Add to the library');
await page.waitForSelector('#panel-settings >> text=ISO-27002-extract.md', { timeout: 10000 });
const L1 = await page.evaluate(async () => { const L = await import('/js/kblib.js'); await L.load(); const f = L.list()[0]; const store = await import('/js/store.js');
  return { n: L.list().length, att: f.attestation, sig: f.licensedSignal, passages: f.passages, keys: (await store.keys('blob')).filter(k => String(k).startsWith('kblib:')).length }; });
ok(L1.n === 1 && L1.att.text === 'I hold a licence for this text; it stays on this computer.' && /^\d{4}-/.test(L1.att.at), 'the attestation is kept with the file');
ok(L1.passages > 3 && L1.keys === 2, 'extracted and indexed once on this computer (text + passages)');
ok(L1.sig === true, 'a file that looks like a licensed standard is flagged');

// available in every workspace, quoted briefly
const R = await page.evaluate(async (CANARY) => {
  const st = await import('/js/state.js'); const C = await import('/js/consult.js'); const L = await import('/js/kblib.js');
  const w = st.newWorkspace({ name: 'Library elsewhere' }); await st.create(w);
  const r = await C.retrieve('how often is privileged access to clinical systems reviewed', { ws: w });
  const lib = r.passages.filter(p => p.source === 'library');
  await st.remove(w.id);
  return { n: lib.length, cite: lib[0]?.cite, maxLen: Math.max(0, ...lib.map(p => p.text.length)), max: L.QUOTE_MAX };
}, CANARY);
ok(R.n >= 1 && /^Library — ISO-27002-extract\.md, .*passage \d+$/.test(R.cite), 'library passages are available in another workspace, tagged by source ' + R.cite);
ok(R.maxLen <= R.max + 2, 'library passages are quoted briefly ' + R.maxLen);

// ask: the saved answer and its Markdown export carry only short quotes
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id);
  const AI = await import('/js/ai.js'); AI.settings(st.S.ws).acknowledged = new Date().toISOString(); });
await page.click('#consult-toggle');
await page.fill('#consult-panel textarea', 'How often is privileged access to clinical systems reviewed?');
await page.click('#consult-panel .consult-foot .btn:not(.ghost)');
await page.waitForSelector('.modal textarea', { timeout: 15000 });
const prompt = await (await page.$$('.modal textarea'))[1].inputValue();
ok(prompt.includes('Library — ISO-27002-extract.md') && (prompt.match(new RegExp(CANARY, 'g')) || []).length <= 3, 'the request carries short library excerpts, not the file');
await page.click('.modal .btnrow .btn:not(.ghost)');
await page.waitForSelector('#consult-panel .consult-answer', { timeout: 15000 });
const SV = await page.evaluate(async () => { const C = await import('/js/consult.js'); const L = await import('/js/kblib.js'); const c = C.current();
  const lib = c.messages.flatMap(m => (m.passages || []).filter(p => p.source === 'library'));
  return { md: C.toMarkdown(c), n: lib.length, short: lib.every(p => p.quote.length <= L.QUOTE_MAX + 2) }; });
ok(SV.n >= 1 && SV.short, 'the saved answer keeps library passages as short quotes');
ok((SV.md.match(/ZEBRAQUILL/g) || []).length <= 3, 'the Markdown export quotes the library briefly');

await page.click('#consult-panel .consult-head button[aria-label="Close"]');
// never in a backup, a restore or a registry package
const X = await page.evaluate(async (CANARY) => {
  const B = await import('/js/backup.js'); const store = await import('/js/store.js'); const REG = await import('/js/registry.js');
  const b = await B.build({ documents: true, snapshots: true, settings: true, frameworks: true });
  const s = JSON.stringify(b);
  // a crafted file that carries library keys: never written
  await B.restore({ payload: { workspaces: [], blob: { 'kblib:evil': 'smuggled', 'kbvec:book': { model: 'x' } }, meta: {} } }, { mode: 'merge' });
  const evil = await store.get('blob', 'kblib:evil'), vec = await store.get('blob', 'kbvec:book');
  const pkg = JSON.stringify(REG.buildPackage());
  // the backup does carry the saved conversation (short quotes only)
  return { inBackup: (s.match(new RegExp(CANARY, 'g')) || []).length, libKeys: Object.keys(b.payload.blob).filter(k => k.startsWith('kblib:')).length,
    meta: 'kbLibrary' in (b.payload.meta || {}), evil: evil ?? null, vec: vec ?? null, inPkg: pkg.includes(CANARY) };
}, CANARY);
ok(X.libKeys === 0 && !X.meta, 'backups leave out the library text, passages and list');
ok(X.inBackup <= 3, 'a backup holds at most the short quotes saved with an answer ' + X.inBackup);
ok(X.evil === null && X.vec === null, 'a restore never writes library or vector keys from a file');
ok(!X.inPkg, 'registry packages never carry library text');

// Quality review: QC-13
await page.evaluate(() => { location.hash = '#/qc'; }); await page.waitForTimeout(1200);
const qc13 = await page.evaluate(() => [...document.querySelectorAll('#panel-qc tr')].find(r => /QC-13/.test(r.textContent))?.textContent || '');
ok(/look like licensed standards/.test(qc13), 'QC-13 extends to the library ' + qc13.slice(0, 160));
const fail = await page.evaluate(async () => { const store = await import('/js/store.js'); const L = await import('/js/kblib.js');
  const m = await store.get('meta', 'kbLibrary'); const keep = JSON.parse(JSON.stringify(m)); m.files[0].attestation = null; await store.put('meta', 'kbLibrary', m); await L.load();
  location.hash = '#/register'; await new Promise(r => setTimeout(r, 300)); location.hash = '#/qc'; await new Promise(r => setTimeout(r, 1000));
  const t = [...document.querySelectorAll('#panel-qc tr')].find(r => /QC-13/.test(r.textContent))?.textContent || '';
  await store.put('meta', 'kbLibrary', keep); await L.load(); return t; });
ok(/without the licence attestation/.test(fail), 'QC-13 fails for a library file without the attestation');

// removing a file deletes its text and passages
await page.evaluate(() => { location.hash = '#/settings/kb'; }); await page.waitForTimeout(1200);
page.once('dialog', d => d.accept());
await page.click('#panel-settings >> text=Remove'); await page.waitForTimeout(800);
const gone = await page.evaluate(async () => { const store = await import('/js/store.js'); const L = await import('/js/kblib.js'); await L.load();
  return { n: L.list().length, keys: (await store.keys('blob')).filter(k => String(k).startsWith('kblib:')).length }; });
ok(gone.n === 0 && gone.keys === 0, 'a removed file leaves nothing on this computer');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t45 consultant library');
