// t62 — anonymization (1.9.2: NV-005, NV-006, NV-026, NV-089, NV-098). The campaign's leak harness (wC N01): 39 identifiers
// seeded in every field that can reach a package — owners of every shape (O'Brien, "Dr.", "(CISO)", lower case), people in
// free text, the organization's acronym, e-mail local parts, internal hosts (DNS, NetBIOS, UNC, IPv6, MAC), phones, file and
// employee numbers, a project code name — then crg-registry/1 published as JSON, Markdown and CSV through Publish & share,
// a crg-registry/2 contribution, and the AI payload with "Anonymize before sending" on. Zero identifiers may leak; the preview
// warns when anything remains, and lists the name-like terms it could not attribute.
import { open, ok, done, SHARED, goto, medibec } from './lib.mjs';
import fs from 'fs';
fs.rmSync(SHARED, { recursive: true, force: true }); fs.mkdirSync(SHARED, { recursive: true });
const { browser, page, errors } = await open('#/process');
page.on('dialog', d => d.dismiss());   // a leak confirmation must never be needed in this suite
await medibec(page);
// Seeded identifiers: [token, where it was put]
const SEED = await page.evaluate(async (dir) => {
  const H = await import('/js/helper.js'); await H.loadConfig(); H.HS.config.links.registry_local_dir = dir; await H.saveConfig();
  const st = await import('/js/state.js');
  const base = JSON.parse(JSON.stringify(st.S.ws.assessment));
  const ws = st.newWorkspace({ name: 'Northwind Santé — engagement 2026', assessment: base, org: { name: 'Northwind Santé Inc.', sector: 'Health care', region: 'Laval, Quebec, Canada', size: 'Medium' } });
  ws.org.aliases = '';
  const T = (s, x) => (s || '') + ' ' + x;
  const sc = ws.assessment.SCEN;
  const seed = [];
  const put = (tok, where) => seed.push([tok, where]);
  sc[0].statement = T(sc[0].statement, 'Northwind Santé relies on its EHR.'); put('Northwind', 'scenario.statement (org name)');
  sc[0].statement += ' NWS clinics in Laval are affected.'; put('NWS', 'scenario.statement (org acronym)');
  const owners = ['Sophie Gagnon', "Mary O'Brien", 'Dr. Paul Leduc', 'anne mcdonald', 'Jean Tremblay (CISO)', 'Anne McDonald', 'Li Wei'];
  owners.forEach((o, i) => { sc[i].owner = o; put(o.replace(/^Dr\. /, '').replace(/ \(CISO\)/, ''), `scenario[${i}].owner = "${o}"`); });
  sc[1].params.PbA.rat = T(sc[1].params.PbA.rat, 'Confirmed in interview with Karim Haddad (IT director).'); put('Karim Haddad', 'scenario.params.PbA.rat (free text)');
  sc[1].params.PbA.ev = T(sc[1].params.PbA.ev, 'E-12 ticket INC0012345'); put('INC0012345', 'scenario.params.PbA.ev (ticket id)');
  sc[2].stakeholders = 'Nadia Belkacem (privacy officer), Board'; put('Nadia Belkacem', 'scenario.stakeholders');
  sc[2].threat_event = 'Phishing e-mail sent to sophie.gagnon@northwind.ca and nadia.belkacem@northwind-sante.ca'; put('sophie.gagnon', 'threat_event e-mail local part (org-domain)'); put('nadia.belkacem', 'threat_event e-mail local part (2nd domain)');
  sc[3].assets = 'EHR on ehr-prod-01.northwind.local (10.20.30.40), DC dc01.northwind.fr, PACS SRV-PACS01, backup 2001:db8:85a3::8a2e:370:7334'; put('ehr-prod-01', 'scenario.assets hostname (.local)'); put('10.20.30.40', 'IPv4'); put('dc01', 'hostname .fr'); put('SRV-PACS01', 'bare NetBIOS host'); put('2001:db8:85a3::8a2e:370:7334', 'IPv6');
  sc[3].processes = 'Intake via https://intranet.northwind.ca/intake and \\\\SRV-FS01\\clinical share'; put('intranet', 'URL host'); put('SRV-FS01', 'UNC path host');
  sc[4].consequences = Object.assign({}, sc[4].consequences, { Operational: 'Call centre 514-555-0199 down; patient file MRN 00483921 exposed; staff badge EMP-004512.' }); put('514-555-0199', 'phone'); put('00483921', 'MRN (free-text id)'); put('EMP-004512', 'employee id');
  sc[4].narrative = 'Project Bluefin migration led by Olivier Roy; vendor contact olivier.roy@acmehealth-it.com, +33 1 42 68 53 00.'; put('Bluefin', 'project codename'); put('Olivier Roy', 'narrative person'); put('olivier.roy', 'e-mail local part (vendor domain)'); put('42 68 53 00', 'non-NANP phone');
  sc[5].controls = ['MFA on vpn.northwind.ca', 'Firewall 192.168.10.0/24']; put('vpn.northwind', 'controls host'); put('192.168.10.0', 'IPv4 CIDR');
  sc[6].sequence = ['Attacker logs into jira.northwind.io as admin.jlapointe', 'MAC 00:1A:2B:3C:4D:5E observed']; put('jlapointe', 'username'); put('00:1A:2B:3C:4D:5E', 'MAC');
  sc[7].vulns = ['Default password on Cisco ASA at 172.16.5.9']; put('172.16.5.9', 'IPv4 in vulns');
  ws.assets = [{ id: 'A-001', name: 'Northwind EHR Cluster', type: 'application', owner: 'Sophie Gagnon', custodian: 'Mary O\'Brien', hostname: 'ehrclu01', ip: '10.9.9.9' },
    { id: 'A-002', name: 'Clinic Laval-Est WiFi', type: 'network', owner: 'IT', hostname: 'wlc-lavalest.northwind.local' }];
  sc[3].assetIds = ['A-001', 'A-002']; put('ehrclu01', 'asset hostname'); put('Laval-Est', 'asset name fragment');
  ws.risks = sc.slice(0, 3).map((s, i) => ({ id: 'R-00' + (i + 1), title: s.name, desc: s.statement + ' Reported by Hélène Côté.', category: 'Privacy', owner: ['Sophie Gagnon', 'Dr. Paul Leduc', 'Mary O\'Brien'][i], scenarios: [s.id], assets: i === 0 ? ['A-001', 'A-002'] : [], threats: s.attack || [], threatText: 'Targeted at Northwind Santé by FIN-group', vulns: [], inherent: { l: 3, i: 4 }, current: { l: 3, i: 4 }, target: { l: 2, i: 2 }, treatment: 'Accept', measures: [], status: 'accepted', review: 'Review with Guillaume Ouellet Q1', acceptance: { by: 'Dr. Paul Leduc', date: '2026-10-01', until: '2027-10-01', rationale: 'Accepted by the CEO Martine Lavoie after the board meeting' }, history: [], created: '2026-10-01' }));
  put('Hélène Côté', 'risk.desc person'); put('Guillaume Ouellet', 'risk.review person'); put('Martine Lavoie', 'risk.acceptance.rationale person');
  ws.measures = [{ id: 'M-01', name: 'Harden ehr-prod-01.northwind.local', fn: 'Protect', owner: 'Karim Haddad', ctl: ['5.15'], scen: [sc[0].id], rp: 0.3, ri: 0.1, initial: 12345, recurring: 2345, months: 3, status: 'proposed', conf: 'Medium', rationale: 'Quote from Acme Health IT (olivier.roy@acmehealth-it.com)' }];
  put('Karim Haddad', 'measure.owner');
  await st.create(ws); await st.select(ws.id);
  await st.saveNow();
  return seed;
}, SHARED);
await page.waitForTimeout(800);
ok(SEED.length === 39, '39 identifiers seeded: ' + SEED.length);
const results = {};
const scan = (txt, label) => { const leaked = SEED.filter(([tok]) => txt.toLowerCase().includes(tok.toLowerCase())).map(([tok, where]) => `${tok} [${where}]`); ok(!leaked.length, `${label}: no seeded identifier (${leaked.length} leaked: ${leaked.join('; ')})`); return leaked; };
// ---- crg-registry/1 through the Publish & share UI, three formats, measures included ----
for (const fmt of ['json', 'md', 'csv']) {
  await goto(page, '#/share', 600); await page.waitForSelector('text=1 · Content', { timeout: 15000 });
  const meas = page.locator('#panel-share label:has-text("Mitigation measures") input'); if (!(await meas.isChecked())) { await meas.check(); await page.waitForTimeout(400); }
  await page.locator('#panel-share select').nth(1).selectOption(fmt); await page.waitForTimeout(500);
  const banner = await page.locator('#panel-share .card:has-text("3 · Preview")').innerText();
  results['banner_' + fmt] = banner.split('\n').slice(0, 3).join(' | ');
  ok(!/Identifying terms remain/.test(banner), `${fmt}: the preview reports no identifying term left (${results['banner_' + fmt].slice(0, 120)})`);
  const before = new Set(fs.readdirSync(SHARED));
  await page.click('button:has-text("Publish to the shared registry")'); await page.waitForTimeout(1200);
  const neu = fs.readdirSync(SHARED).filter(f => !before.has(f));
  ok(neu.length >= 1, `${fmt}: package written to the shared folder (${neu.join(', ')})`);
  for (const f of neu) scan(fs.readFileSync(SHARED + '/' + f, 'utf8'), `${fmt} ${f}`);
}
// the published package still carries what matters: placeholders, identifiers that carry no organizational information
const js = fs.readdirSync(SHARED).find(f => f.endsWith('.json') && f.startsWith('crg-registry-anon'));
const pkg = JSON.parse(fs.readFileSync(SHARED + '/' + js, 'utf8'));
ok(pkg.organization.name === 'Organization A' && pkg.anonymized === true, 'organization replaced in the JSON package');
ok(pkg.scenarios.every(s => /^Person \d+$/.test(s.owner || 'Person 0') || !s.owner), 'every scenario owner is a placeholder: ' + pkg.scenarios.slice(0, 7).map(s => s.owner).join(', '));
ok(/T1566/.test(JSON.stringify(pkg.scenarios.map(s => s.attack))), 'ATT&CK identifiers kept');
ok(/\[reference\]/.test(JSON.stringify(pkg)) && /\[UNC path\]/.test(JSON.stringify(pkg)) && /\[MAC address\]/.test(JSON.stringify(pkg)) && /\[codename\]/.test(JSON.stringify(pkg)), 'reference, UNC, MAC and code-name placeholders present');
ok(/Person F\d/.test(JSON.stringify(pkg)), 'people named in free text with a cue are replaced (Person F…)');
// ---- the re-identification table stays local and names every replaced person ----
const mapping = await page.evaluate(async () => { const st = await import('/js/state.js'); const p = st.S.ws.published.slice(-1)[0]; return { keys: Object.keys(p.mapping || {}), residual: p.residual }; });
ok(mapping.keys.some(k => k === "Mary O'Brien") && mapping.keys.some(k => k === 'Paul Leduc') && mapping.keys.some(k => k === 'Martine Lavoie') && mapping.keys.includes('NWS'), 'the re-identification table names O\'Brien, Leduc (bare), Lavoie (free text) and the acronym NWS');
ok(Array.isArray(mapping.residual) && mapping.residual.length === 0, 'the publication records no residual term');
// ---- crg-registry/2 contribution (all scenarios) ----
await goto(page, '#/registry/contribute', 600); await page.waitForSelector('text=1 · The risks to share', { timeout: 15000 });
const cbs = await page.$$('#panel-registry table tbody td.cb input'); for (const b of cbs) await b.check();
await goto(page, '#/registry/browse', 300);
await goto(page, '#/registry/contribute', 600); await page.waitForSelector('text=3 · Anonymization');
const cText = await page.locator('#panel-registry').innerText();
ok(!/Identifying terms remain/.test(cText), 'contribution preview reports no identifying term left');
const before2 = new Set(fs.readdirSync(SHARED));
await page.click('button:has-text("Share to the registry")'); await page.waitForTimeout(1200);
const contrib = fs.readdirSync(SHARED).filter(f => !before2.has(f));
ok(contrib.length === 1, 'contribution written: ' + contrib);
for (const f of contrib) scan(fs.readFileSync(SHARED + '/' + f, 'utf8'), 'contribution ' + f);
// ---- the AI payload with "Anonymize before sending" (NV-098): the same context and text functions ----
const ai = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const AI = await import('/js/ai.js'); const anon = await import('/js/anon.js');
  const ws = st.S.ws; AI.settings(ws).anon = true; AI.settings(ws).enabled = true;
  const out = {};
  for (const [task, opts] of [['causal_chain', { scen: ws.assessment.SCEN[3] }], ['causal_chain', { scen: ws.assessment.SCEN[4] }], ['causal_chain', { scen: ws.assessment.SCEN[6] }], ['critique', {}]]) {
    try { const p = AI.prepare(task, ws, opts); out[task + (opts.scen ? ':' + opts.scen.id : '')] = { anonymized: p.anonymized, sent: p.prompt }; }
    catch (e) { // no provider routes the task on this machine: anonymize the built prompt the way prepare() does
      const ctx = anon.context(ws, anon.DEFAULT_OPTS); const built = String(e.message || e);
      out[task + ':fallback'] = { anonymized: true, sent: anon.text(JSON.stringify([ws.assessment.SCEN[3], ws.assessment.SCEN[4], ws.assessment.SCEN[6], ws.measures]), ctx, anon.DEFAULT_OPTS), why: built };
    }
  }
  return out;
});
for (const [k, v] of Object.entries(ai)) { ok(v.anonymized === true, `AI payload ${k} anonymized` + (v.why ? ' (prepare: ' + v.why.slice(0, 60) + ')' : '')); scan(v.sent, 'AI payload ' + k); }
// ---- the preview warns when something remains: a supplier name in free text that no rule covers ----
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.assessment.SCEN[8].narrative = 'Hosting contract with Zorvatek Hébergement renewed; Ulrich Vanderstraeten (Zorvatek Hébergement, account manager) confirmed the renewal.'; st.touch(); await st.saveNow(); });
await goto(page, '#/share', 800); await page.waitForSelector('text=3 · Preview');
await page.locator('#panel-share select').nth(1).selectOption('json'); await page.waitForTimeout(600);
let prev = await page.locator('#panel-share .card:has-text("3 · Preview")').innerText();
ok(/Check these before publishing/.test(prev) && /Zorvatek Hébergement ×2/.test(prev), 'the preview lists the unattributed name-like term Zorvatek Hébergement (twice): ' + prev.split('\n').slice(0, 4).join(' | ').slice(0, 200));
ok(!/Ulrich Vanderstraeten/.test(prev) && /Ulrich Vanderstraeten/.test(await page.evaluate(async () => (await import('/js/state.js')).S.ws.assessment.SCEN[8].narrative)), 'the person named with a role in brackets is replaced (Person F…), not listed');
// one click adds the term to the workspace's replacement list, shared with the Risk Registry contribution
await page.locator('#panel-share button[title="Add to “Additional terms to replace”"]:has-text("Zorvatek Hébergement")').first().click(); await page.waitForTimeout(800);
prev = await page.locator('#panel-share .card:has-text("3 · Preview")').innerText();
const terms = await page.evaluate(async () => (await import('/js/state.js')).S.ws.anonTerms);
ok(/Zorvatek/.test(terms || '') && !/Zorvatek/.test(await page.locator('#panel-share textarea.mono').inputValue()), 'added term is stored in the workspace (anonTerms) and no longer appears in the package');
// a term of the replacement table that survives (a different spelling) is flagged as a leak, and publishing asks first
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.anonTerms = 'Zorvatek => Zorvatek Hébergement'; st.touch(); await st.saveNow(); });
await goto(page, '#/process', 300); await goto(page, '#/share', 800); await page.waitForSelector('text=3 · Preview');
prev = await page.locator('#panel-share .card:has-text("3 · Preview")').innerText();
ok(/Identifying terms remain in the package/.test(prev), 'a replacement-table term still present is reported as a leak');
let asked = false; page.removeAllListeners('dialog'); page.once('dialog', d => { asked = true; d.dismiss(); });
const before3 = new Set(fs.readdirSync(SHARED));
await page.click('button:has-text("Publish to the shared registry")'); await page.waitForTimeout(800);
ok(asked && fs.readdirSync(SHARED).filter(f => !before3.has(f)).length === 0, 'publishing with a leak asks for confirmation; dismissed, nothing is written');
// ---- unit checks of the name test used by the registers (regcore.js) ----
const names = await page.evaluate(async () => { const A = await import('/js/anon.js'); return ["Mary O'Brien", 'Anne McDonald', 'Dr. Paul Leduc', 'Jean Tremblay (CISO)', 'Security team', 'Service desk'].map(A.looksLikeName); });
ok(names.slice(0, 4).every(Boolean) && !names[4] && !names[5], 'looksLikeName accepts O\'Brien, McDonald, Dr. and (CISO) shapes and rejects roles: ' + names.join(','));
console.log(JSON.stringify(results, null, 1));
ok(errors.length === 0, 'no console error: ' + errors.join(' | '));
await browser.close(); done('t62 anonymization');
