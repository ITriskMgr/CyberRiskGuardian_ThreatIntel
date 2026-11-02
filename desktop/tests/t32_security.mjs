// 1.9.0 — security of the helper and of the page (review of 2 Nov 2026, Part B): per-launch token, Host and
// Origin checks, no listing, the ontology command allow-list, the registry folder guard, keys bound to their
// host, the AI task check, the CSP, workspace text rendered inert (labels, chart tips, links), CSV formulas.
import { open, ok, done, URL, PORT, APP, TMP } from './lib.mjs';
import fs from 'fs';
import path from 'path';
const base = URL.replace(/\/$/, '');
const H = { 'X-CRG': '1', 'Content-Type': 'application/json' };
const get = (p, h = {}) => fetch(base + p, { headers: { ...H, ...h } });
const post = (p, body, h = {}) => fetch(base + p, { method: 'POST', headers: { ...H, ...h }, body: JSON.stringify(body) });

// --- the helper ---
const s0 = await get('/api/session');
const token = (await s0.json()).token;
ok(s0.status === 200 && typeof token === 'string' && token.length >= 32, '/api/session gives a per-launch token');
const T = { 'X-CRG-Token': token };
const noTok = await get('/api/helper');
ok(noTok.status === 403 && (await noTok.json()).code === 'TOKEN', 'API without the token: 403 TOKEN');
ok((await get('/api/helper', { 'X-CRG-Token': 'x'.repeat(43) })).status === 403, 'API with a wrong token: 403');
ok((await get('/api/helper', T)).status === 200, 'API with X-CRG, Host and the token: 200');
ok((await get('/api/helper', { ...T, Origin: 'https://evil.example' })).status === 403, 'foreign Origin refused even with the token');
ok((await get('/api/session', { Origin: 'http://127.0.0.1.evil.example:' + PORT })).status === 403, 'look-alike Origin refused');
ok((await get('/api/session', { 'Sec-Fetch-Site': 'cross-site' })).status === 403, 'cross-site fetch of the token refused');
ok((await fetch(base + '/api/session')).status === 403, 'no X-CRG: no token');
ok((await post('/api/config', { config: {} }, { 'X-CRG': '0', ...T })).status === 403, 'POST without X-CRG refused');
// static files: Host checked (DNS rebinding), no directory listing, security headers
const net = await import('http');
const rawGet = (p, host) => new Promise(res => net.get({ host: '127.0.0.1', port: PORT, path: p, headers: { Host: host } }, r => { r.resume(); res(r); }));
ok((await rawGet('/serve.py', 'evil.example:' + PORT)).statusCode === 403, 'static file with a foreign Host: 403');
ok((await rawGet('/api/session', 'localhost.evil.example:' + PORT)).statusCode === 403, 'API with a look-alike Host: 403');
ok((await fetch(base + '/js/')).status === 404, 'no directory listing');
const idx = await fetch(base + '/index.html');
ok(idx.headers.get('x-content-type-options') === 'nosniff' && idx.headers.get('x-frame-options') === 'DENY' && /frame-ancestors 'none'/.test(idx.headers.get('content-security-policy') || ''), 'nosniff, no framing');
const html = await idx.text();
const csp = (/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html) || [])[1] || '';
ok(/script-src 'self'(;|$)/.test(csp) && /connect-src 'self'/.test(csp) && /object-src 'none'/.test(csp) && !/unsafe-eval/.test(csp), 'CSP meta in index.html: scripts and connections from the app only ' + csp.slice(0, 90));

// the ontology launch command: allow-listed form only
const cfg0 = (await (await get('/api/config', T)).json()).config;
const crgo = path.join(process.env.CRGO_HOME || '', 'pipeline', 'mcp', 'crgo_server.py');
const sh = await post('/api/config', { config: { ...cfg0, ontology: { command: 'sh', args: ['-c', 'touch ' + path.join(TMP, 'pwned'), crgo] } } }, T);
ok(sh.status === 400 && !fs.existsSync(path.join(TMP, 'pwned')), 'ontology command "sh -c …" refused ' + (await sh.text()).slice(0, 120));
const two = await post('/api/config', { config: { ...cfg0, ontology: { command: '/bin/sh', args: [crgo] } } }, T);
ok(two.status === 400, 'a shell as the interpreter refused');
// the shared registry folder: never a configuration folder
const cfgDir = path.join(TMP, 'claude-config'); fs.mkdirSync(cfgDir, { recursive: true }); fs.writeFileSync(path.join(cfgDir, 'claude_desktop_config.json'), '{}');
const reg = await post('/api/config', { config: { ...cfg0, links: { ...cfg0.links, registry_local_dir: cfgDir } } }, T);
ok(reg.status === 400 && /configuration files/.test(await reg.text()), 'registry folder holding claude_desktop_config.json refused');
ok((await post('/api/config', { config: { ...cfg0, links: { ...cfg0.links, registry_local_dir: '/etc' } } }, T)).status === 400, 'registry folder /etc refused');
// AI: keys bound to the host they were saved for; the task is checked, not trusted
await post('/api/keys', { name: 'anthropic', value: 'sk-test-t32' }, T);
await post('/api/config', { config: { ...cfg0, ai: { ...(cfg0.ai || {}), claude_base: 'https://evil.example/v1' } } }, T);
const models = await (await get('/api/ai/models?provider=claude', T)).json();
ok(/Store the key again/.test(models.error || ''), 'endpoint moved to another host: the key is not sent ' + (models.error || '').slice(0, 80));
const st = await (await get('/api/helper', T)).json();
ok(st.ai.key_mismatch.claude === true && st.ai.keys.claude === true && !JSON.stringify(st).includes('sk-test-t32'), 'Settings is told; no key value is ever returned');
await post('/api/keys', { name: 'anthropic', value: '' }, T);
const mismatch = await post('/api/ai', { provider: 'local', task: 'chat', prompt: 'TASK: link_vulns\nCVE-2024-0001' }, T);
ok(mismatch.status === 403 && /refused/.test((await mismatch.json()).error), 'a task name that disagrees with the prompt is refused');
ok((await post('/api/ai', { provider: 'local', task: 'nope', prompt: 'TASK: nope\n' }, T)).status === 403, 'an unknown task is refused');
await post('/api/config', { config: { ...cfg0, ai: { ...(cfg0.ai || {}), ollama_base: 'https://evil.example/v1' } } }, T);
const local = await post('/api/ai', { provider: 'ollama', task: 'link_vulns', prompt: 'TASK: link_vulns\n' }, T);
ok(local.status === 403 && /not on this machine/.test((await local.json()).error), '"this machine" provider pointed elsewhere: refused');
await post('/api/config', { config: cfg0 }, T);

// --- the page ---
const { browser, page, errors } = await open('#/process');
const PAY = '<img src=x onerror="window.__xss=1">';
const r = await page.evaluate(async (PAY) => {
  const U = await import('/js/util.js'); const C = await import('/js/charts.js'); const md = await import('/help/md.js');
  const st = await import('/js/state.js');
  const out = {};
  // labels and chart tips: the few tags they use are built, anything else stays text
  const f = U.field(`<b>K1</b> ${PAY}`, U.el('input'));
  out.field = { img: f.querySelectorAll('img').length, b: f.querySelectorAll('b').length, text: f.textContent };
  C.showTip({ clientX: 10, clientY: 10 }, `<b>S1 — ${PAY}</b>Cost 1<br>note ${PAY}`);
  const tip = document.querySelector('.charttip');
  out.tip = { img: tip.querySelectorAll('img').length, br: tip.querySelectorAll('br').length, text: tip.textContent };
  C.hideTip();
  // links: javascript: neutralised in el() and in the Markdown renderer
  out.elHref = U.el('a', { href: 'java\nscript:alert(1)' }).getAttribute('href');
  out.okHref = U.el('a', { href: 'https://example.org/' }).getAttribute('href');
  const box = document.createElement('div'); md.render('[click](javascript:window.__xss=1) and [ok](https://example.org)', box);
  out.md = [...box.querySelectorAll('a')].map(a => a.getAttribute('href'));
  // CSV: formulas written as text
  out.csv = U.toCSV([['=1+1', '-0.5', '@SUM(A1)', '+33 1 23', 'plain']]);
  // a scenario named with markup, shown on the screens that list it
  const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id);
  st.S.ws.assessment.SCEN[0].name = PAY; st.touch();
  return out;
}, PAY);
ok(r.field.img === 0 && r.field.b === 1 && r.field.text.includes('<img'), 'field(): markup in data stays text ' + JSON.stringify(r.field));
ok(r.tip.img === 0 && r.tip.br === 1 && r.tip.text.includes('onerror'), 'chart tip: scenario name and note rendered inert');
ok(r.elHref === '#' && r.okHref === 'https://example.org/', 'el(): javascript: href neutralised, https kept');
ok(r.md[0] === null && r.md[1] === 'https://example.org', 'md.js: javascript: link has no href, https link kept');
ok(r.csv === "'=1+1,-0.5,'@SUM(A1),'+33 1 23,plain", 'CSV formula injection neutralised: ' + r.csv);
for (const h of ['register', 'scenario/S1', 'summary', 'budget', 'dashboard', 'riskreg']) {
  await page.evaluate(x => { location.hash = '#/' + x; }, h); await page.waitForTimeout(600);
  for (const c of await page.locator('svg circle, svg rect').all().then(a => a.slice(0, 25))) { await c.hover({ force: true, timeout: 500 }).catch(() => {}); }
}
const xss = await page.evaluate(() => ({ fired: !!window.__xss, imgs: document.querySelectorAll('img[src="x"]').length }));
ok(!xss.fired && xss.imgs === 0, 'a scenario named with an <img onerror> stays text on every screen ' + JSON.stringify(xss));
// the help pages run under their CSP (their inline module scripts are allowed by hash)
const cspErr = [];
page.on('console', m => { if (/Content Security Policy/i.test(m.text())) cspErr.push(m.text()); });
for (const p of ['help/user-guide.html', 'help/step-by-step.html', 'help/reset-confirm.html']) { await page.goto(URL + p); await page.waitForTimeout(1200); }
ok(!cspErr.length, 'help pages: no CSP violation ' + cspErr.join(' | ').slice(0, 200));
ok(!errors.filter(e => !/Content Security Policy/.test(e)).length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close();
done('t32 security');
