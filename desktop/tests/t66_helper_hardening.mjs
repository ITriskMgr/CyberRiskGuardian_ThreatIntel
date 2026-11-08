// t66 — helper and settings hardening (1.9.2, ws4): HTTP robustness (NV-043), the size / token / model checks of
// /api/ai (NV-055), /api/files serving catalogue files only (NV-057), the NVD API key kept by the helper and moved out
// of localStorage (NV-058), the organisation-graph folder validated like the registry folder (NV-059), legacy AI tasks
// refused and the connectivity test following "remote AI off" (NV-019), and signed releases (NV-086: a valid minisign
// signature is reported, an invalid one refuses the download, no pinned key says so).
import { open, ok, done, URL, PORT, FEEDS, TESTS, MOCK_GITHUB_PORT, tmp, serveCmd, apiHeaders, goto } from './lib.mjs';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import net from 'net';
import path from 'path';

const APP = path.resolve(process.env.CRG_APP_DIR || path.join(TESTS, '..', 'app'));
const CUR = /export const VERSION = '([\d.]+)'/.exec(fs.readFileSync(path.join(APP, 'js', 'version.js'), 'utf8'))[1];
const NEWER = CUR.replace(/^(\d+)\.(\d+)\.\d+$/, (_, a, b) => `${a}.${Number(b) + 1}.0`);
const ZIP = `CyberRiskGuardian_Desktop_v${NEWER}-beta.zip`;
const MP = MOCK_GITHUB_PORT, LOGF = tmp('mock-github-t66.log'), PUB = tmp('release-signing.pub');
fs.rmSync(LOGF, { force: true }); fs.rmSync(PUB, { force: true });
fs.mkdirSync(FEEDS, { recursive: true });
const mock = spawn('python3', ['mock_github.py', String(MP), LOGF, NEWER, CUR, PUB], { cwd: TESTS, stdio: 'ignore', env: { ...process.env, CRG_APP_DIR: APP } });
await new Promise(r => setTimeout(r, 1200));
ok(fs.existsSync(PUB) && /^untrusted comment/.test(fs.readFileSync(PUB, 'utf8')), 'the mock made a minisign key pair for the run');

/** A raw HTTP request to the helper (so that headers the browser never sends can be forged). */
function raw(request, waitMs = 1500) {
  return new Promise(resolve => {
    const s = net.connect(PORT, '127.0.0.1'); let buf = '';
    const t = setTimeout(() => { s.destroy(); resolve(buf || '<timeout>'); }, waitMs);
    s.on('connect', () => s.write(request)); s.on('data', d => { buf += d.toString(); }); s.on('close', () => { clearTimeout(t); resolve(buf); }); s.on('error', () => { clearTimeout(t); resolve(buf || '<error>'); });
  });
}
try {
  execSync(serveCmd(`CRG_UPDATE_URL=http://127.0.0.1:${MP}/signed CRG_UPDATE_PUBKEY=${PUB}`));
  const H = await apiHeaders({ 'Content-Type': 'application/json' });
  const hostLine = `Host: 127.0.0.1:${PORT}\r\nX-CRG: 1\r\nX-CRG-Token: ${H['X-CRG-Token']}\r\n`;

  // ---------- NV-043: Content-Length
  let r = await raw(`POST /api/ai HTTP/1.1\r\n${hostLine}Content-Type: application/json\r\nContent-Length: abc\r\nConnection: close\r\n\r\n`);
  ok(/^HTTP\/1\.[01] 400/.test(r) && /bad Content-Length/.test(r), 'NV-043: a non-numeric Content-Length → 400: ' + r.split('\r\n')[0]);
  r = await raw(`POST /api/ai HTTP/1.1\r\n${hostLine}Content-Type: application/json\r\nContent-Length: -5\r\nConnection: close\r\n\r\n`);
  ok(/^HTTP\/1\.[01] 400/.test(r), 'NV-043: a negative Content-Length → 400 (not a read to EOF): ' + r.split('\r\n')[0]);
  r = await raw(`POST /api/ai HTTP/1.1\r\n${hostLine}Content-Type: application/json\r\nContent-Length: 5\r\nConnection: close\r\n\r\n[1,2]`);
  ok(/^HTTP\/1\.[01] 400/.test(r) && /bad json/.test(r), 'a JSON body that is not an object → 400: ' + r.split('\r\n')[0]);
  const t0 = Date.now(); r = await raw(`POST /api/ai HTTP/1.1\r\n${hostLine}Content-Type: application/json\r\nContent-Length: 1000\r\nConnection: close\r\n\r\n{}`, 2500);
  ok(r === '<timeout>' || /408|400/.test(r), 'a declared body that never arrives does not get an answer within 2.5 s but the helper stays up (30 s read timeout): ' + r.slice(0, 20));
  const alive = await fetch(URL + 'api/session', { headers: { 'X-CRG': '1' } });
  ok(alive.status === 200, 'the helper still answers after the half-open request (' + (Date.now() - t0) + ' ms)');

  // ---------- NV-055 / NV-019 through the normal API
  const post = (path, body) => fetch(URL.replace(/\/$/, '') + path, { method: 'POST', headers: H, body: JSON.stringify(body) });
  let x = await post('/api/ai', { provider: 'claude', task: 'critique', prompt: 'TASK: critique\nx', system: 'x'.repeat(450_000) });
  ok(x.status === 413 && /kB limit/.test((await x.json()).error), 'NV-055: system + prompt over 400 kB → 413 (mock path included): ' + x.status);
  x = await post('/api/ai', { provider: 'claude', task: 'critique', prompt: 'TASK: critique\nx', model: 'not a model name!' });
  ok(x.status === 400, 'NV-055: an invalid model string → 400: ' + x.status);
  x = await post('/api/ai', { provider: 'claude', task: 'critique', prompt: 'TASK: critique\nx', max_tokens: 'many' });
  ok(x.status === 400, 'NV-055: a non-numeric max_tokens → 400: ' + x.status);
  x = await post('/api/ai', { provider: 'claude', task: 'critique', prompt: 'TASK: critique\nx', max_tokens: 10 ** 9 });
  const xj = await x.json();
  ok(x.status === 200 && JSON.parse(fs.readFileSync(path.join(tmp('mock'), '_last.json'), 'utf8')).max_tokens === 64000, 'NV-055: max_tokens is capped at 64,000: ' + x.status);
  ok('stop_reason' in xj && 'truncated' in xj && 'empty' in xj, 'NV-033: every answer carries stop_reason, truncated and empty: ' + JSON.stringify({ s: xj.stop_reason, t: xj.truncated, e: xj.empty }));
  for (const t of ['chat', 'analyst']) {
    x = await post('/api/ai', { provider: 'claude', task: t, prompt: `TASK: ${t}\nhello` });
    ok(x.status === 403 && /refused/.test((await x.json()).error), `NV-019: legacy task "${t}" is refused (${x.status})`);
  }
  // the connectivity test respects "remote AI off"
  let cfg = await (await fetch(URL + 'api/config', { headers: H })).json();
  const saveCfg = async c => post('/api/config', { config: c });
  const pol0 = cfg.config.ai?.policy || {};
  await saveCfg({ ...cfg.config, ai: { ...(cfg.config.ai || {}), policy: { ...pol0, remote_allowed: false } } });
  x = await post('/api/ai/test', { provider: 'claude' });
  ok(x.status === 403 && /switched off/.test((await x.json()).error), 'NV-019: /api/ai/test to a remote provider is refused while remote AI is off: ' + x.status);
  x = await post('/api/ai/test', { provider: 'local' });
  ok(x.status === 200, 'the test of a local provider still runs with remote AI off (' + x.status + ')');
  cfg = await (await fetch(URL + 'api/config', { headers: H })).json();
  await saveCfg({ ...cfg.config, ai: { ...(cfg.config.ai || {}), policy: { ...pol0, remote_allowed: true } } });

  // ---------- NV-057: /api/files serves catalogue files only
  fs.writeFileSync(path.join(FEEDS, 'crg-legacy-keys.json'), '{"anthropic":"sk-should-never-be-served"}');
  fs.writeFileSync(path.join(FEEDS, 'kev-2026-01-01.json'), '{"vulnerabilities":[]}');
  x = await fetch(URL + 'api/files/crg-legacy-keys.json', { headers: H });
  ok(x.status === 404, 'NV-057: a hidden crg-* file is not served (' + x.status + ')');
  x = await fetch(URL + 'api/files/crg-config.json', { headers: H });
  ok(x.status === 404, 'NV-057: crg-config.json is not served (' + x.status + ')');
  x = await fetch(URL + 'api/files/manifest.json', { headers: H });
  ok(x.status === 404, 'NV-057: manifest.json is not served (' + x.status + ')');
  x = await fetch(URL + 'api/files/kev-2026-01-01.json', { headers: H });
  ok(x.status === 200, 'a catalogue file is served (' + x.status + ')');
  fs.rmSync(path.join(FEEDS, 'crg-legacy-keys.json'), { force: true });

  // ---------- NV-059: links.org_graph_dir validated
  cfg = await (await fetch(URL + 'api/config', { headers: H })).json();
  x = await saveCfg({ ...cfg.config, links: { ...(cfg.config.links || {}), org_graph_dir: '~/.config/autostart' } });
  ok(x.status === 400 && /organisation-graph folder/.test((await x.json()).error), 'NV-059: a configuration folder is refused for the organisation-graph folder: ' + x.status);
  const okDir = tmp('orggraphs-ok'); fs.mkdirSync(okDir, { recursive: true });
  x = await saveCfg({ ...cfg.config, links: { ...(cfg.config.links || {}), org_graph_dir: okDir } });
  ok(x.status === 200, 'an ordinary data folder is accepted (' + x.status + ')');
  await saveCfg(cfg.config);

  // ---------- NV-058: the NVD key moves from localStorage to the helper's key store
  const { browser, page, errors } = await open('#/process');
  await page.evaluate(() => localStorage.setItem('crg-nvd-key', 'nvd-test-key-0123456789abcdef'));
  await goto(page, '#/vulns/online', 2500);
  const K = await page.evaluate(async () => { const h = await import('/js/helper.js'); await h.loadConfig(); return { keys: h.HS.keys, legacy: localStorage.getItem('crg-nvd-key') }; });
  ok(K.keys.includes('nvd') && K.legacy === null, 'NV-058: the legacy key was moved to the helper and removed from localStorage: ' + JSON.stringify(K));
  const ph = await page.$eval('#panel-vulns input[type=password]', i => i.placeholder + '|' + i.value);
  ok(/stored by the helper/.test(ph) && ph.endsWith('|'), 'NV-058: the field says a key is stored and never shows it: ' + ph);
  const keysJson = fs.existsSync(path.join(tmp('keys'), 'crg-keys.json')) ? fs.readFileSync(path.join(tmp('keys'), 'crg-keys.json'), 'utf8') : '';
  ok(/nvd/.test(keysJson), 'the key is in the helper\'s key store file (file backend in the tests)');
  const idx = fs.existsSync(path.join(tmp('keys'), 'keys-index.json')) ? JSON.parse(fs.readFileSync(path.join(tmp('keys'), 'keys-index.json'), 'utf8')) : {};
  ok(JSON.stringify(idx).includes('services.nvd.nist.gov'), 'NV-058: the key is bound to services.nvd.nist.gov: ' + JSON.stringify(idx.nvd || idx));
  await fetch(URL.replace(/\/$/, '') + '/api/keys', { method: 'POST', headers: H, body: JSON.stringify({ name: 'nvd', value: '' }) });

  // ---------- NV-086: signed release → "Signed", an invalid signature refuses the download, no key → said so
  fs.rmSync(path.join(FEEDS, ZIP), { force: true });
  await page.evaluate(async () => { const U = await import('/js/updates.js'); U.setAsked?.(true); });
  await goto(page, '#/about/versions', 900);
  await page.click('#update-check-now'); await page.waitForSelector('#panel-about #update-download', { timeout: 8000 });
  await page.click('#panel-about #update-download'); await page.waitForTimeout(3000);
  let t = await page.textContent('#panel-about');
  ok(/Signed: the minisign signature of the release verifies/.test(t) && fs.existsSync(path.join(FEEDS, ZIP)), 'NV-086: a valid minisign signature is verified against the pinned key and said so');
  ok(/Verified: its SHA-256 checksum matches/.test(t), 'the SHA-256 check still runs beside the signature');
  await browser.close();
  for (const [p, key, re, kept] of [['/badsig', PUB, /does NOT verify against the pinned public key/, false], ['/signed', '', /Signature not checked: this build pins no release-signing key/, true], ['/verified', PUB, /unsigned release is refused/, false]]) {   // 1.9.2 review (M6): a pinned key refuses an unsigned release
    fs.rmSync(path.join(FEEDS, ZIP), { force: true });
    execSync(serveCmd(`CRG_UPDATE_URL=http://127.0.0.1:${MP}${p} CRG_UPDATE_PUBKEY=${key}`));
    const o = await open('#/about/versions'); await o.page.waitForTimeout(900);
    await o.page.click('#update-check-now'); await o.page.waitForSelector('#panel-about #update-download', { timeout: 8000 });
    await o.page.click('#panel-about #update-download'); await o.page.waitForTimeout(3000);
    t = await o.page.textContent('#panel-about');
    ok(re.test(t) && fs.existsSync(path.join(FEEDS, ZIP)) === kept, `NV-086 ${p} (key: ${key ? 'pinned' : 'none'}): ${re} · kept=${kept}`);
    await o.browser.close();
  }
  ok(errors.filter(e => !/status of (40[0-9]|413|502)/.test(e)).length === 0, 'no console error: ' + errors.slice(0, 5).join(' | '));
} finally {
  mock.kill();
  execSync(serveCmd());   // the helper back on its normal settings for the next suite
}
done('t66 helper hardening, NVD key, signed updates');
