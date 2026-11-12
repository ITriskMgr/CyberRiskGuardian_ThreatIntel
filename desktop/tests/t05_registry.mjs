import { open, ok, done, SHARED, URL as APPURL } from './lib.mjs';
import fs from 'fs';
fs.rmSync(SHARED, { recursive: true, force: true }); fs.mkdirSync(SHARED, { recursive: true });
const { browser, page, errors } = await open('#/process');
// point the helper at the shared folder
await page.evaluate(async (dir) => {
  const H = await import('/js/helper.js'); await H.loadConfig(); H.HS.config.links.registry_local_dir = dir; await H.saveConfig();
  const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id);
  location.hash = '#/registry/contribute';
}, SHARED);
await page.waitForSelector('text=1 · The risks to share', { timeout: 20000 });
ok(await page.isVisible('nav a[aria-current="page"]:has-text("Contribute risks")'), 'menu marks the Contribute entry');
// 1.9.2 (NV-005): owners of every shape are people, whatever the shape — they must not reach the contribution
await page.evaluate(async () => { const st = await import('/js/state.js'); const sc = st.S.ws.assessment.SCEN; sc[0].owner = "Mary O'Brien"; sc[1].owner = 'Dr. Paul Leduc'; sc[2].owner = 'anne mcdonald (CISO)'; sc[0].stakeholders = 'Nadia Belkacem (privacy officer), Board'; st.touch(); await st.saveNow(); location.hash = '#/registry/browse'; });
await page.waitForTimeout(300); await page.evaluate(() => { location.hash = '#/registry/contribute'; }); await page.waitForSelector('text=1 · The risks to share', { timeout: 20000 });
// defaults from the profile
const cat = await page.evaluate(async () => { const RH = await import('/js/rhub.js'); const st = await import('/js/state.js'); return RH.catalogDefaults(st.S.ws); });
ok(cat.sector === 'health' && cat.region === 'CA-QC' && cat.size === 'medium', 'catalogue defaults from the profile ' + JSON.stringify(cat));
// tick 3 scenarios
const boxes = await page.$$('#panel-registry table tbody td.cb input');
for (const b of boxes.slice(0, 3)) await b.check();
await page.evaluate(() => { location.hash = '#/registry/browse'; }); await page.waitForTimeout(300);
await page.evaluate(() => { location.hash = '#/registry/contribute'; }); await page.waitForSelector('text=3 · Anonymization');
ok(await page.isVisible('text=Preview — 3 card(s)'), 'three cards prepared');
const anonChecked = await page.isChecked('#panel-registry input[type=checkbox] >> nth=-1').catch(() => null);
await page.click('button:has-text("Share to the registry")');
await page.waitForTimeout(800);
const files = fs.readdirSync(SHARED);
ok(files.length === 1 && files[0].startsWith('crg-registry2-contribution'), 'package written to the shared folder: ' + files);
const pkg = JSON.parse(fs.readFileSync(SHARED + '/' + files[0], 'utf8'));
const txt = JSON.stringify(pkg);
ok(pkg.schema === 'crg-registry/2' && pkg.anonymized === true && pkg.entries.length === 3, 'anonymized crg-registry/2 package with 3 entries');
ok(!/MediBec/i.test(txt), 'organization name not in the package');
ok(!/O'Brien|Leduc|mcdonald|Belkacem/i.test(txt), 'owners of every shape (O\'Brien, Dr., lower case, (CISO)) and a stakeholder named with a role are not in the package');
ok(pkg.entries[0].catalog.region === 'CA-QC' && pkg.entries[0].catalog.sector === 'health', 'catalogue kept at province level');
ok(!('source_ref' in pkg.entries[0]), 'no internal scenario id');
// second installation: fresh browser context reads the shared folder
const ctx2 = await browser.newContext({ serviceWorkers: 'block' });
const p2 = await ctx2.newPage(); const err2 = []; p2.on('pageerror', e => err2.push(String(e)));
await p2.goto(APPURL + '#/registry/browse');
await p2.waitForSelector('text=Find risks', { timeout: 20000 });
await p2.click('button:has-text("Read the shared folder")'); await p2.waitForTimeout(1200);
const n2 = await p2.evaluate(async () => Object.keys((await import('/js/rhub.js')).H.entries).length);
ok(n2 === 3, 'another installation reads the 3 cards: ' + n2);
await p2.selectOption('#panel-registry select >> nth=0', 'finance'); await p2.waitForTimeout(300);
ok(await p2.isVisible('text=0 card(s)'), 'sector filter excludes them');
await p2.evaluate(() => { location.hash = '#/registry/moderate'; }); await p2.waitForSelector('text=Cards waiting for a decision');
await p2.click('#panel-registry button:has-text("Approve") >> nth=0'); await p2.waitForTimeout(300);
await p2.click('button:has-text("Publish the curated package")'); await p2.waitForTimeout(800);
ok(fs.readdirSync(SHARED).some(f => f.includes('curated')), 'curated package published');
// first installation reads, restricts to moderated
await page.evaluate(() => { location.hash = '#/registry/browse'; }); await page.waitForSelector('text=Find risks');
await page.click('button:has-text("Read the shared folder")'); await page.waitForTimeout(1200);
const mod = await page.evaluate(async () => { const RH = await import('/js/rhub.js'); return RH.search({ moderated: true }).length; });
ok(mod === 1, 'one moderated card visible through the curated package: ' + mod);
// use a card in the workspace
const before = await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.CANDIDATES.length);
await page.click('#panel-registry table tbody td.cb input >> nth=0');
await page.click('button:has-text("Use ticked cards in this workspace")');
const after = await page.evaluate(async () => { const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const ws = st.S.ws, C = SC.candidates(ws), c = C[C.length - 1], d = SC.rec(c.id, ws).draft; return { n: C.length, last: { name: c.name, rat: { PbA: d.params.PbA.rat } } }; });
ok(after.n === before + 1 && /\[Registry\]$/.test(after.last.name) && after.last.rat.PbA.includes('another organization'), 'card goes to the candidates, labelled');
// withdrawal
await page.evaluate(() => { location.hash = '#/registry/mine'; }); await page.waitForSelector('#panel-registry button:has-text("Withdraw")');
page.once('dialog', d => d.accept());
await page.click('#panel-registry button:has-text("Withdraw")'); await page.waitForTimeout(800);
await p2.evaluate(() => { location.hash = '#/registry/browse'; }); await p2.waitForSelector('text=Find risks');
await p2.click('button:has-text("Read the shared folder")'); await p2.waitForTimeout(1200);
const vis = await p2.evaluate(async () => (await import('/js/rhub.js')).search({}).length);
ok(vis === 0, 'withdrawn cards disappear for other readers: ' + vis);
// privilege
const priv = await page.evaluate(async () => { const U = await import('/js/users.js'); const RH = await import('/js/rhub.js');
  const save = { ...U.U }; U.U.enabled = true; U.U.current = { name: 'v', admin: false, raci: { report: 'R' } }; const a = RH.privileged();
  U.U.current = { name: 'm', admin: false, raci: { report: 'A' } }; const b = RH.privileged(); Object.assign(U.U, save); return [a, b]; });
ok(priv[0] === false && priv[1] === true, 'only A on step 13 or an administrator may share');
ok(errors.length === 0 && err2.length === 0, 'no console error: ' + errors.concat(err2).join(' | '));
await browser.close(); done('t05 registry');
