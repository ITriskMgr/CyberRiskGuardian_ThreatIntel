// t63 — threat context (1.9.2: NV-007, NV-023, NV-024, NV-090, NV-091, NV-099). From the campaign repros wC N05 and N03b:
// an expired snapshot blocks the proposals until a justification is recorded and says so in threat_context and threat_basis;
// no "TODO" placeholder is copied or stored; exposure without register evidence is an information gap and its row is unticked;
// the confidence starts empty; a malformed snapshot is refused and a stored one leaves Clear reachable; QC-31 fails an
// assessment calibrated from an expired or missing snapshot; the download hook (CRG_SOURCES_BASE, loopback only) feeds
// download → dated snapshot → expiry.
import { open, ok, done, goto, reload, FEEDS, PORT, serveCmd, tmp } from './lib.mjs';
import { execSync } from 'child_process';
import http from 'http';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
const SAMPLES = path.join(path.dirname(new URL(import.meta.url).pathname), 'fixtures', 'threatctx');
const EXPIRED = { schema: 'crg-threat-context/1', retrieved: '2025-01-01', expires: '2025-04-01', kev: { count: 1, catalog_version: '2025.01.01', cves: { 'CVE-2024-3400': { added: '2024-04-12' } } }, epss: { score_date: '2025-01-01', count: 1, scores: { 'CVE-2024-3400': [0.95, 0.99] } }, regions: [], sources: [{ name: 'CISA KEV', version: '2025.01.01', entries: 1 }] };
const WEIRD = { schema: 'crg-threat-context/1', retrieved: '<img src=x onerror="window.__pwn=1">', expires: '2020-01-01', kev: { cves: 'not an object' }, epss: { scores: [1, 2] }, sources: '<img src=x>' };
fs.mkdirSync(SAMPLES, { recursive: true });
fs.writeFileSync(path.join(SAMPLES, 'snapshot_weird.json'), JSON.stringify(WEIRD));
const { browser, ctx, page, errors } = await open('#/process');
await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
const S0 = JSON.stringify(EXPIRED);
await page.evaluate(async (snap) => {
  const st = await import('/js/state.js');
  const ws = st.exampleWorkspace('medibec'); ws.name = 't63 threat ctx'; ws.kind = 'organization'; await st.create(ws); await st.select(ws.id);
  const s = st.S.ws.assessment.SCEN[0]; s.cves = ['CVE-2024-3400']; s.params.Pbx.v = 0.2;   // linked, below the rung-4 band
  const s2 = st.S.ws.assessment.SCEN[1]; s2.cves = ['CVE-2023-0001']; s2.params.Pbx.v = 0.1;
  st.S.ws.vulns = [{ id: 'CVE-2023-0001', kind: 'CVE', exposed: true, product: 'Acme VPN 3.1', asset: 'vpn-gw', source: 'scanner 2026-10' }];   // exposure recorded for the second only
  st.S.ws.exposureText = 'CVE-2024-3400\nCVE-2023-0001';
  await st.setSnapshot(JSON.parse(snap), 'threat-context-2025-01-01.json'); st.touch(); await st.saveNow();
}, S0);
await goto(page, '#/threat', 1500);
// ---- NV-090: the introduction says what the join proposes
const lede = await page.locator('#panel-threat .lede, main section:not([hidden]) .lede').first().innerText();
ok(/proposes Pb\(ψ,A\) changes only/.test(lede) && /Pb\(A\) stays the analyst/.test(lede), 'the introduction says the join proposes Pb(ψ,A) only and Pb(A) stays the analyst\'s');
await page.click('#join-run'); await page.waitForTimeout(1200);
const screen = await page.locator('main').innerText();
ok(!/TODO/.test(screen), 'no TODO text on the Threat context screen');
const joinBox = await page.locator('#join-out').innerText();
ok(/snapshot is expired/i.test(joinBox) && /586 days ago|\d{3} days ago/.test(joinBox), 'the exposure join warns, where the decision is made, that the snapshot is expired: ' + (joinBox.match(/expired[^\n]{0,80}/i) || [''])[0]);
ok(/Information gap — organizational validation required/.test(joinBox), 'exposure without register evidence is shown as an information gap');
ok(/Vulnerability register: Acme VPN 3\.1 on vpn-gw \(scanner 2026-10\)/.test(joinBox), 'exposure with register evidence cites the register');
// ---- NV-023: the copied threat_basis JSON
await page.click('#join-copy'); await page.waitForTimeout(500);
let copied = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '');
if (!copied) copied = await page.locator('#join-out textarea.code').last().inputValue().catch(() => '');
ok(!/TODO/.test(copied), 'copied threat_basis JSON has no TODO placeholder');
const cj = JSON.parse(copied || '{}');
ok(cj.threat_context?.expired === true && cj.threat_context.days_past_expiry > 500 && /2025-01-01/.test(copied), 'copied threat_context states expired and days_past_expiry, and cites the snapshot date: ' + JSON.stringify(cj.threat_context).slice(0, 160));
const b3400 = (cj.threat_basis || []).find(b => b.cve === 'CVE-2024-3400'), b0001 = (cj.threat_basis || []).find(b => b.cve === 'CVE-2023-0001');
ok(b3400 && b3400.confidence === null && b3400.confidence_required === true && b3400.exposure_confirmed === false && /Information gap/.test(b3400.exposure) && b3400.snapshot_expired === true, 'threat_basis without evidence: confidence null + confidence_required, exposure = information gap, snapshot_expired');
ok(b0001 && b0001.exposure_confirmed === true && /Acme VPN/.test(b0001.exposure), 'threat_basis with register evidence cites it');
// ---- proposals: confidence empty, rows without evidence unticked, Accept blocked until confidence + justification
const prop = page.locator('#join-out table.compact');
const nProps = await prop.locator('tbody tr').count();
ok(nProps === 2, 'two proposals (both scenarios sit below their band): ' + nProps);
const confVals = await prop.locator('tbody select').evaluateAll(els => els.map(e => e.value));
ok(confVals.every(v => v === ''), 'confidence starts empty, nothing preselected: ' + JSON.stringify(confVals));
const ticked = await prop.locator('tbody input[type=checkbox]').evaluateAll(els => els.map(e => e.checked));
ok(ticked.length === 2 && ticked.includes(false) && ticked.includes(true), 'the proposal without register evidence is unticked, the one with evidence ticked: ' + JSON.stringify(ticked));
const acceptBtn = page.locator('#join-out button:has-text("Accept selected")');
ok(await acceptBtn.isDisabled(), 'Accept is disabled while a confidence is missing');
await prop.locator('tbody select').nth(0).selectOption('High'); await prop.locator('tbody select').nth(1).selectOption('Medium'); await page.waitForTimeout(200);
ok(await acceptBtn.isDisabled() && /expired: write a justification/.test(await page.locator('#join-out').innerText()), 'with the confidence chosen, Accept still waits for the justification (expired snapshot)');
await page.locator('#join-out textarea.code').first().fill('No newer snapshot can be retrieved on this network; the KEV listing is permanent.'); await page.waitForTimeout(200);
ok(!(await acceptBtn.isDisabled()), 'Accept is enabled once the justification is written');
await acceptBtn.click(); await page.waitForTimeout(800);
const stored = await page.evaluate(async () => { const st = await import('/js/state.js'); const [s0, s1] = st.S.ws.assessment.SCEN; return { s0: { Pbx: s0.params.Pbx, basis: s0.threat_basis }, s1: { Pbx: s1.params.Pbx, basis: s1.threat_basis }, log: st.S.ws.revisionLog, just: st.S.ws.threatJustifications, exp: st.exportAssessment().threat_context }; });
ok(!/TODO/.test(JSON.stringify(stored)), 'nothing stored with a TODO placeholder after Accept');
ok(!stored.s0.basis && stored.s0.Pbx.v === 0.2, 'the unticked proposal (no exposure evidence) left the scenario untouched');
ok(stored.s1.Pbx.v === 0.3 && stored.s1.Pbx.conf === 'Medium' && /expired/.test(stored.s1.Pbx.ev), 'the accepted proposal raised Pb(ψ,A) to the band floor (rung 2: 0.30, no KEV/EPSS signal) with the chosen confidence and notes the expired snapshot in its evidence: ' + JSON.stringify(stored.s1.Pbx));
const b = stored.s1.basis?.[0] || {};
ok(b.snapshot_expired === true && b.days_past_expiry > 500 && /KEV listing is permanent/.test(b.justification) && b.exposure_confirmed === true && b.confidence === 'Medium', 'stored threat_basis carries expired, days_past_expiry, the justification and the register evidence: ' + JSON.stringify(b).slice(0, 200));
ok(stored.just?.length === 1 && stored.just[0].scenarios.length === 1 && stored.just[0].days_past_expiry === b.days_past_expiry, 'the justification is journalled in threatJustifications');
ok(stored.log.length === 1 && stored.log[0].expired === true && /snapshot expired/.test(stored.log[0].cause), 'the revision log line says the snapshot was expired');
ok(stored.exp.expired === true && stored.exp.days_past_expiry === b.days_past_expiry, 'the assessment export threat_context states expired and days_past_expiry: ' + JSON.stringify(stored.exp));
// ---- NV-099: QC-31 fails on the expired snapshot, passes on a fresh one, fails when the snapshot is missing
const qc = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const QC = await import('/js/panels/qc.js');
  const get = () => QC.checks(st.S.ws).find(x => x.id === 'QC-31');
  const a = get();
  const fresh = JSON.parse(JSON.stringify(st.S.snap)); const t = new Date(); fresh.retrieved = t.toISOString().slice(0, 10); fresh.expires = new Date(t.getTime() + 60 * 864e5).toISOString().slice(0, 10);
  await st.setSnapshot(fresh, 'threat-context-fresh.json'); const b = get();
  await st.setSnapshot(null); const c = get();
  await st.setSnapshot(JSON.parse(JSON.stringify(fresh)), 'threat-context-fresh.json');
  return { a, b, c };
});
ok(qc.a.state === 'fail' && /expired on 2025-04-01/.test(qc.a.detail) && qc.a.fix === 'threat', 'QC-31 fails with threat_basis on an expired snapshot and opens Threat context: ' + qc.a.detail.slice(0, 120));
ok(qc.b.state === 'pass' && /1 threat_basis/.test(qc.b.detail), 'QC-31 passes with a current snapshot');
ok(qc.c.state === 'fail' && /no snapshot is loaded/.test(qc.c.detail), 'QC-31 fails when threat_basis entries exist and no snapshot is loaded');
// with a fresh snapshot the join needs no justification and proposes nothing new (already at the floor)
await goto(page, '#/process', 300); await goto(page, '#/threat', 1200);
await page.click('#join-run'); await page.waitForTimeout(800);
const fresh = await page.locator('#join-out').innerText();
ok(!/snapshot is expired/i.test(fresh) && !/justification/i.test(fresh), 'a current snapshot: no expiry banner, no justification asked');
// ---- NV-024: a malformed snapshot is refused at load; one stored earlier leaves Clear reachable and breaks no screen
await page.setInputFiles('#snap-file', path.join(SAMPLES, 'snapshot_weird.json')); await page.waitForTimeout(1200);
const st1 = await page.locator('#snap-status').innerText();
const keptFresh = await page.evaluate(async () => (await import('/js/state.js')).S.ws.snapshot?.name);
ok(/Not a usable snapshot — nothing was stored/.test(st1) && /kev\.cves/.test(st1) && keptFresh === 'threat-context-fresh.json', 'a snapshot of the wrong shape is refused with its problems, the stored one kept: ' + st1.slice(0, 160));
await page.evaluate(async (w) => { const st = await import('/js/state.js'); await st.setSnapshot(w, 'weird.json'); await st.saveNow(); }, WEIRD);   // as an earlier release could have stored it
const res = {};
for (const h of ['#/threat', '#/vulns', '#/vulns/ssvc', '#/process', '#/export', '#/dashboard', '#/qc']) {
  const n = errors.length; await goto(page, '#/about', 200); await goto(page, h, 1200);
  res[h] = { h1: await page.evaluate(() => [...document.querySelectorAll('main > section')].find(s => !s.hidden)?.querySelector('h1')?.textContent || '(no visible screen)'), newErrors: errors.slice(n).map(e => e.split('\n')[0].slice(0, 120)) };
}
await reload(page); await goto(page, '#/threat', 1500);
res.afterReload = { h1: await page.evaluate(() => [...document.querySelectorAll('main > section')].find(s => !s.hidden)?.querySelector('h1')?.textContent || '(no visible screen)'), clear: await page.locator('#snap-clear').count(), status: await page.locator('#snap-status').innerText().catch(() => '') };
ok(Object.values(res).every(r => !r.newErrors?.length && r.h1 !== '(no visible screen)'), 'no screen throws or disappears because of the stored malformed snapshot: ' + JSON.stringify(res).slice(0, 300));
ok(res.afterReload.clear === 1 && /stored snapshot is malformed/.test(res.afterReload.status), 'Threat context says the stored snapshot is malformed and offers Clear');
ok(!(await page.evaluate(() => window.__pwn)), 'no injected script ran');
await page.click('#snap-clear'); await page.waitForTimeout(600);
ok(!(await page.evaluate(async () => (await import('/js/state.js')).S.snap)), 'Clear removes the malformed snapshot');
errors.length = 0;
// ---- NV-091: download → dated snapshot → expiry, through the loopback-only source hook
const MP = PORT + 200;
const today = new Date().toISOString().slice(0, 10), yday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
const kevDoc = { title: 'CISA KEV', catalogVersion: today.replace(/-/g, '.'), dateReleased: today + 'T12:00:00Z', count: 2, vulnerabilities: [
  { cveID: 'CVE-2024-3400', vendorProject: 'Palo Alto', product: 'PAN-OS', dateAdded: '2024-04-12', knownRansomwareCampaignUse: 'Unknown' }, { cveID: 'CVE-2023-0001', vendorProject: 'Acme', product: 'VPN', dateAdded: '2023-02-01', knownRansomwareCampaignUse: 'Known' }] };
const epssCsv = `#model_version:v2025.03.14,score_date:${yday}T00:00:00+0000\ncve,epss,percentile\nCVE-2024-3400,0.94,0.99\nCVE-2023-0001,0.61,0.97\nCVE-2020-0001,0.0004,0.05\n`;
const hits = [];
const mock = http.createServer((req, res) => {
  hits.push(req.url);
  if (req.url === '/kev.json') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(kevDoc)); }
  else if (/^\/epss_scores-\d{4}-\d{2}-\d{2}\.csv\.gz$/.test(req.url)) { if (!req.url.includes(yday)) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': 'application/gzip' }); res.end(zlib.gzipSync(epssCsv)); }
  else { res.writeHead(404); res.end(); }
});
await new Promise(r => mock.listen(MP, '127.0.0.1', r));
for (const f of fs.existsSync(FEEDS) ? fs.readdirSync(FEEDS).filter(f => /^(kev-|epss_scores-)/.test(f)) : []) fs.rmSync(path.join(FEEDS, f));
try {
  execSync(serveCmd(`CRG_SOURCES_BASE=http://127.0.0.1:${MP}`));
  await reload(page);
  await page.evaluate(async () => { const st = await import('/js/state.js'); const w = st.S.list.find(x => x.name === 't63 threat ctx'); if (w && st.S.ws.id !== w.id) await st.select(w.id); });
  const H = await page.evaluate(async () => { const h = await import('/js/helper.js'); await h.probe(true); return h.HS.helper ? 'up' : 'down'; });
  ok(H === 'up', 'helper restarted with the source hook');
  const jobs = await page.evaluate(async () => {
    const h = await import('/js/helper.js');
    for (const j of (await h.apiJson('/api/jobs')).jobs) if (j.status !== 'running') await h.post(`/api/jobs/${j.id}/forget`, {});   // jobs of earlier suites (their files may be gone)
    await h.post('/api/download', { source: 'kev', params: {} }); await h.post('/api/download', { source: 'epss', params: {} });
    for (let i = 0; i < 60; i++) { const { jobs } = await h.apiJson('/api/jobs'); if (jobs.filter(j => ['kev', 'epss'].includes(j.source)).every(j => j.status !== 'running') && jobs.filter(j => ['kev', 'epss'].includes(j.source)).length === 2) return jobs; await new Promise(r => setTimeout(r, 500)); }
    return (await h.apiJson('/api/jobs')).jobs;
  });
  const kj = jobs.find(j => j.source === 'kev'), ej = jobs.find(j => j.source === 'epss');
  ok(kj?.status === 'done' && /^kev-/.test(kj.file) && ej?.status === 'done' && ej.file === `epss_scores-${yday}.csv.gz`, 'KEV and EPSS downloaded from the loopback mock: ' + JSON.stringify([kj?.status, kj?.file, ej?.status, ej?.file]));
  ok(hits.includes('/kev.json') && hits.some(h => h.startsWith('/epss_scores-')), 'the helper asked the mock, not the internet: ' + hits.join(' '));
  // Online screen: load both files, build and use the snapshot
  await goto(page, '#/vulns/online', 1500);
  await page.locator('#panel-vulns table button:has-text("Load")').first().waitFor({ timeout: 10000 });
  const rowSel = '#panel-vulns table tr:has(td.mono:text-matches("^(kev-|epss_scores-)")) button:has-text("Load")';   // the files table, our two files only
  const nBtn = await page.locator(rowSel).count();
  ok(nBtn === 2, 'the two downloaded files are listed with a Load button: ' + nBtn);
  for (let i = 0; i < nBtn; i++) { await page.locator(rowSel).nth(i).click(); await page.waitForTimeout(1200); }
  await page.locator('button:has-text("Build and use snapshot")').waitFor({ timeout: 10000 });
  ok(!(await page.locator('button:has-text("Build and use snapshot")').isDisabled()), 'both files staged: the snapshot can be built');
  await page.click('button:has-text("Build and use snapshot")'); await page.waitForTimeout(1200);
  const snap = await page.evaluate(async () => { const st = await import('/js/state.js'); const T = await import('/threat.js'); const s = st.S.snap; return { retrieved: s?.retrieved, expires: s?.expires, kev: s?.kev?.count, epss: s?.epss?.count, name: st.S.ws.snapshot?.name, age: T.snapshotAge(s), later: T.snapshotAge(s, new Date(Date.now() + 91 * 864e5)), problems: T.validateSnapshot(s), cls: T.classify('CVE-2024-3400', s, true).rung }; });
  const exp = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);
  ok(snap.retrieved === today && snap.expires === exp && snap.name === `threat-context-${today}.json`, `the snapshot is dated today and expires in 90 days: ${snap.retrieved} → ${snap.expires}`);
  ok(snap.kev === 2 && snap.epss >= 2 && snap.problems.length === 0 && snap.cls === 4, 'the snapshot carries the 2 KEV entries, the EPSS scores, validates, and places the KEV CVE at rung 4');
  ok(snap.age.expired === false && snap.age.daysLeft === 90 && snap.later.expired === true && snap.later.daysPastExpiry === 1, 'expiry: 90 days left today, expired by 1 day at day 91');
} finally {
  mock.close();
  execSync(serveCmd());   // the helper back to its normal sources
}
// the hook ignores a host that is not this machine (unit-level, through the helper's module)
const pyOut = execSync(`cd ${JSON.stringify(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'app'))} && CRG_FEEDS_DIR=${JSON.stringify(tmp('feeds-py'))} CRG_SOURCES_BASE=https://evil.example python3 -c "import sys; sys.argv=['x']; import crg_feeds; print(crg_feeds._BASE)"`, { encoding: 'utf8' }).trim();
ok(pyOut === 'None', 'a non-loopback CRG_SOURCES_BASE is ignored by the helper: ' + pyOut);
ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t63 threat context');
