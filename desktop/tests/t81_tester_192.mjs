// t81 — tester findings of 1.9.2, fixed in 1.9.3 (W4): T2 the AI preview's "Destination" wraps (no overflow at 1280 px, EN/FR);
// T7 a stable screen code (SCR-nn) per route in js/screencodes.js, shown in Help → Help on this screen, as a faint footer
// token and in "Copy diagnostics" (no workspace content), and the gate tools/route_code_check.py; T8 the crown-jewel table
// shows the rows at once after "Add ticked crown jewels" (Extract from documents, rules); T9 the crown-jewel header cells
// line up with the body cells; T10 "Start the import" runs in a fresh workspace and in one created with documents.
// T1 (the window lock) has its own suite, t82_winlock.mjs. 
import { open, ok, done, goto, clickAndReopen, APP } from './lib.mjs';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const { browser, ctx, page, errors } = await open('#/process');
await page.setViewportSize({ width: 1280, height: 800 });
const setLang = l => page.evaluate(async l => { const I = await import('/js/i18n.js'); await I.setLang(l); }, l);
const freshWs = async (name, text) => {
  await page.evaluate(async ({ name, text }) => {
    const st = await import('/js/state.js'); const store = await import('/js/store.js');
    const w = st.newWorkspace({ name });
    w.docs = [{ id: 'doc-t81', name: 'case.txt', type: 'txt', quality: 'good', category: 'Business case', words: 60, added: '2026-11-01' }];
    await store.put('blob', 'doc:doc-t81', text);
    await st.create(w);
  }, { name, text });
  await page.waitForTimeout(2500);
};
const CASE = 'Acme Clinic is a regional healthcare provider. The electronic health record system (EHR) is critical to patient care and is hosted by CloudHost. The patient portal and the billing application are important. A ransomware incident occurred in 2024. The data centre firewall is supplied by NetCo. Asset inventory: Electronic health record server owned by IT. Billing application. Firewall.';

/* ---------- T2: Destination wraps ---------- */
await freshWs('T2 workspace', CASE);
for (const lang of ['en', 'fr']) {
  await setLang(lang);
  await page.evaluate(async () => {
    const AI = await import('/js/ai.js'); const H = await import('/js/helper.js'); const st = await import('/js/state.js');
    const r = AI.route('scenarios', st.S.ws); const id = r.provider || 'claude';
    H.HS.ai ||= {}; H.HS.ai.bases ||= {}; H.HS.ai.bases[id] = 'https://' + 'a-very-long-subdomain-name-'.repeat(4) + 'example.organization/v1';
    AI.settings(st.S.ws).acknowledged = new Date().toISOString();
    window.__t2 = import('/js/aiui.js').then(a => a.request('scenarios', { brief: 'x', count: 3, docs: '', secops: '' }, { title: 'Scenario proposals — what will be sent' })).catch(() => null);
  });
  await page.waitForSelector('.modal .kpi', { timeout: 8000 });
  const o = await page.evaluate(() => {
    const kp = [...document.querySelectorAll('.modal .kpi')]; const bad = [];
    for (const k of kp) { const kr = k.getBoundingClientRect(); for (const n of [k, ...k.querySelectorAll('*')]) { const r = n.getBoundingClientRect(); if (r.width && (r.right > kr.right + 1 || n.scrollWidth > n.clientWidth + 1)) bad.push((k.querySelector('.k')?.textContent || '') + ' › ' + n.className); } }
    const m = document.querySelector('.modal'); return { bad, n: kp.length, modalOver: m.scrollWidth > m.clientWidth + 1, doc: document.documentElement.scrollWidth > innerWidth + 1, dest: [...kp].find(k => /Destination|Destinataire/.test(k.querySelector('.k')?.textContent || ''))?.querySelector('.s')?.textContent };
  });
  ok(o.n >= 4 && o.bad.length === 0 && !o.modalOver && !o.doc, `T2 (${lang}): the Destination tile wraps its long host name, no overflow at 1280 px (${o.bad.join('; ') || 'none'}) — ${String(o.dest).slice(0, 40)}…`);
  await page.keyboard.press('Escape'); await page.evaluate(() => { document.querySelectorAll('.modal button[aria-label="Close"], .modal .btn.ghost').forEach((b, i) => i === 0 && b.click()); });
  await page.waitForTimeout(300);
}
await setLang('en');

/* ---------- T7: screen codes ---------- */
const gate = (...a) => { try { return { rc: 0, out: execFileSync('python3', [path.join(APP, 'tools/route_code_check.py'), ...a], { encoding: 'utf8' }) }; } catch (e) { return { rc: e.status, out: String(e.stdout || '') + String(e.stderr || '') }; } };
const g0 = gate();
ok(g0.rc === 0 && /ok \(\d+ routes/.test(g0.out), 'T7: tools/route_code_check.py passes: ' + g0.out.trim());
{ // the gate fails on a missing and on a duplicated code
  const f = path.join(APP, 'js/screencodes.js'); const orig = fs.readFileSync(f, 'utf8');
  try {
    fs.writeFileSync(f, orig.replace(/^\s*'process': 'SCR-01',\n/m, ''));
    const g1 = gate(); ok(g1.rc === 1 && /route without a screen code: process/.test(g1.out), 'T7: the gate fails when a route has no code');
    fs.writeFileSync(f, orig.replace("'about': 'SCR-02'", "'about': 'SCR-01'"));
    const g2 = gate(); ok(g2.rc === 1 && /code SCR-01 used by several routes/.test(g2.out), 'T7: the gate fails when a code is used twice');
  } finally { fs.writeFileSync(f, orig); }
}
const yml = fs.readFileSync(path.join(APP, '../../.github/workflows/desktop-ci.yml'), 'utf8');
ok(yml.indexOf('tools/route_code_check.py') > yml.indexOf('tools/csp_check.py') && yml.indexOf('tools/csp_check.py') > 0, 'T7: the gate is in the CI workflow after csp_check');
const reg = await page.evaluate(async () => { const S = await import('/js/screencodes.js'); const M = await import('/js/menu.js'); const codes = Object.values(S.CODES); return { n: codes.length, uniq: new Set(codes).size, fmt: codes.every(c => /^SCR-\d\d+$/.test(c)), org: S.codeOf('org', 'crown'), orgPanel: S.codeOf('org', ''), unknownTab: S.codeOf('org', 'zzz'), routeOf: S.routeOf(S.CODES['org/crown']), menu: M.PANELS_IN_MENU.every(p => !!S.CODES[p]) }; });
ok(reg.n === reg.uniq && reg.fmt && reg.menu && reg.org && reg.org !== reg.orgPanel && reg.unknownTab === reg.orgPanel && reg.routeOf === 'org/crown', `T7: registry of ${reg.n} unique SCR-nn codes; org/crown = ${reg.org}, org = ${reg.orgPanel}`);
await goto(page, '#/org/crown', 800);
const tok = await page.evaluate(() => { const t = document.getElementById('screen-code'); const cs = t && getComputedStyle(t); return t && { text: t.textContent, opacity: Number(cs.opacity), pe: cs.pointerEvents, aria: t.getAttribute('aria-hidden') }; });
ok(tok && tok.text === reg.org && tok.opacity < 0.7 && tok.pe === 'none' && tok.aria === 'true', `T7: the faint footer token shows ${tok?.text}`);
await goto(page, '#/register', 600);
ok(await page.evaluate(() => document.getElementById('screen-code').textContent) !== reg.org, 'T7: the token follows the route');
await goto(page, '#/org/crown', 800);
await page.click('#panel-org h1 .helpq'); await page.waitForTimeout(200);
const hp = await page.evaluate(() => { const b = document.querySelector('#panel-org .helppop .screencode'); return b && { text: b.textContent, btn: !!document.getElementById('copy-diagnostics') }; });
ok(hp && hp.text === `${reg.org} · org/crown` && hp.btn, 'T7: Help → Help on this screen shows the screen code and Copy diagnostics: ' + hp?.text);
await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.org.mission = 'SECRET-MISSION-TEXT'; st.S.ws.name = 'SECRET-WORKSPACE-NAME'; });
await page.click('#copy-diagnostics'); await page.waitForTimeout(300);
const diag = await page.evaluate(() => window.__lastDiagnostics);
const { VERSION } = await import(path.join(APP, 'js/version.js'));
ok(/^CyberRiskGuardian Desktop diagnostics/.test(diag) && diag.includes(`Version: ${VERSION}`) && diag.includes(`Screen code: ${reg.org}`) && diag.includes('Route: #/org/crown') && /Data version: \d+/.test(diag) && /Engine: .*engine/i.test(diag) || /Engine: /.test(diag), 'T7: diagnostics text carries version, screen code, route, data version, engine: ' + diag.replace(/\n/g, ' | '));
ok(!/SECRET/.test(diag) && !diag.includes('Acme') && !diag.includes('T2 workspace'), 'T7: diagnostics hold no workspace content');
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.org.mission = ''; });
await setLang('fr'); await goto(page, '#/org/crown', 800);
await page.click('#panel-org h1 .helpq'); await page.waitForTimeout(200);
const fr = await page.evaluate(() => ({ lab: document.querySelector('#panel-org .screencode-line span')?.textContent, btn: document.getElementById('copy-diagnostics')?.textContent }));
ok(fr.lab === 'Code d’écran: ' && fr.btn === 'Copier le diagnostic', `T7 (fr): ${fr.lab}${fr.btn}`);
await setLang('en');

/* ---------- T8 / T9: crown jewels ---------- */
await freshWs('T8 workspace', CASE);
await goto(page, '#/org/crown', 1000);
const rowsN = () => page.evaluate(() => document.querySelectorAll('#panel-org table.grid tbody tr').length);
const r0 = await rowsN();
await page.click('#panel-org button:has-text("Extract from documents")');
await page.click('.modal button:has-text("Rules only")');
await page.waitForSelector('.modal:has-text("Review the proposed crown jewels")', { timeout: 10000 });
const ticked = await page.$$eval('.modal td.cb input', a => a.filter(x => x.checked).length);
await page.click('.modal button:has-text("Add ticked crown jewels")');
await page.waitForTimeout(900);
const r1 = await rowsN();
ok(ticked > 0 && r1 === r0 + ticked, `T8: ${ticked} ticked crown jewel(s) appear in the table at once (${r0} → ${r1}), no reload`);
ok(await page.evaluate(() => location.hash) === '#/org/crown', 'T8: the screen stays on Crown jewels');
// the headers line up with the body, with long text in the cells, in EN and FR at 1280 px
const offsets = () => page.evaluate(() => { const t = document.querySelector('#panel-org table.grid'); const ths = [...t.querySelectorAll('thead th')]; return [...t.querySelectorAll('tbody tr')].map(tr => [...tr.children].map((td, i) => Math.round(td.getBoundingClientRect().left - ths[i].getBoundingClientRect().left))).flat(); });
await page.evaluate(async () => { const st = await import('/js/state.js'); const c = st.S.ws.assessment.CROWN; c[0][2] = 'A very long role description '.repeat(12); c[0][7] = 'Dependency one, dependency two, dependency three '.repeat(6); st.touch('redraw'); });
await page.waitForTimeout(500);
for (const lang of ['en', 'fr']) {
  await setLang(lang); await goto(page, '#/org/crown', 700);
  const off = await offsets();
  ok(off.length > 8 && off.every(o => Math.abs(o) <= 1), `T9 (${lang}): crown-jewel header cells and body cells have offset 0 (${[...new Set(off)].join(',')})`);
}
await setLang('en');

/* ---------- T10: Start the import ---------- */
async function startImport(label, { untickTop = true, method = 'rules' } = {}) {
  await goto(page, '#/org/import', 1200);
  const boxes = await page.$$('#import-card td.cb input');
  if (untickTop) for (const i of [0, 1]) if (await boxes[i].isChecked()) await boxes[i].uncheck();   // profile, crown jewels: straight to the sections
  await page.selectOption('#import-card select', method);
  await page.click('#import-card button:has-text("Start the import")');
  let opened = true; try { await page.waitForSelector('.modal', { timeout: 8000 }); } catch { opened = false; }
  ok(opened, `T10: Start the import opens a review in ${label}`);
}
await freshWs('T10 fresh', CASE);
await startImport('a fresh workspace');
await page.reload(); await page.waitForTimeout(2500);
await startImport('a fresh workspace, profile and crown jewels ticked', { untickTop: false });
await page.reload(); await page.waitForTimeout(2500);
// a workspace created with documents dropped at creation
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), '.t81-case.txt'), CASE);
await goto(page, '#/org/new', 1000);
await page.locator('#panel-org input:not([type=checkbox]):not([type=file])').first().fill('T10 created with documents');
await page.setInputFiles('#panel-org input[type=file][multiple]', path.join(path.dirname(new URL(import.meta.url).pathname), '.t81-case.txt'));
await page.waitForTimeout(600);
await clickAndReopen(page, '#panel-org button:has-text("Create workspace")');
await page.waitForTimeout(2500);
fs.unlinkSync(path.join(path.dirname(new URL(import.meta.url).pathname), '.t81-case.txt'));
await page.reload(); await page.waitForTimeout(2500);
ok(await page.evaluate(async () => { const st = await import('/js/state.js'); return st.S.ws.name === 'T10 created with documents' && st.S.ws.docs.length === 1; }), 'T10: the workspace created with a dropped document is open');
await startImport('a workspace created with documents');

ok(errors.filter(e => !/preload|Service Worker/i.test(e)).length === 0, 'no page errors: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t81 tester 1.9.2');
