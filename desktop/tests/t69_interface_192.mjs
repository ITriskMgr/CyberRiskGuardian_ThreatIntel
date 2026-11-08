// t69 — interface items of 1.9.2 (ws5): the one-line footer with the version (item 1, NV-050) and spaced separators
// (item 16), one window at a time (item 2, NV-012: lock, "Use it here" saves the other window's work and freezes it,
// late writes dropped, crash-safe through Web Locks), the support code on every screen (NV-080), the French top bar
// with the consultant open at 1600 px (item 15, NV-051), table.grid headers aligned with their cells (NV-027), and the
// Crown jewels tab redrawn after an extraction (NV-039).
import fs from 'fs';
import path from 'path';
import { open, ok, done, goto, medibec, modulesOn, APP } from './lib.mjs';

const VERSION = /export const VERSION = '([\d.]+)'/.exec(fs.readFileSync(path.join(APP, 'js', 'version.js'), 'utf8'))[1];
const html = fs.readFileSync(path.join(APP, 'index.html'), 'utf8');
ok(!/foot-version[^>]*>v\d/.test(html), 'index.html carries no typed version in the footer span (version.js fills it)');
ok(/\.foot-sep \{[^}]*white-space: pre/.test(fs.readFileSync(path.join(APP, 'styles.css'), 'utf8')), 'the footer separator keeps its spaces (item 16)');

const { browser, ctx, page, errors } = await open('#/process');
await medibec(page); await modulesOn(page, true);
await page.setViewportSize({ width: 1600, height: 1000 });

/* ---------- item 1 / 16: footer ---------- */
const foot = await page.evaluate(() => ({ text: document.getElementById('nav-foot').innerText.replace(/\s+/g, ' ').trim(), ver: document.getElementById('foot-version').textContent,
  visible: (() => { const v = document.getElementById('foot-version'); const r = v.getBoundingClientRect(); const n = document.querySelector('nav').getBoundingClientRect(); return r.width > 0 && r.right <= n.right + 1; })(),
  title: document.getElementById('nav-foot').title }));
ok(foot.ver === `v${VERSION} Beta`, `footer version from version.js: ${foot.ver}`);
ok(new RegExp(`^© Marc-André Léger · v${VERSION.replace(/\\./g, '\\.')} Beta · ✓ Engine verified`).test(foot.text), 'one-line footer "© Marc-André Léger · vX.Y.Z Beta · ✓ Engine verified": ' + foot.text.slice(0, 70));
ok(foot.visible, 'the version is visible inside the rail (not clipped)');
ok(/84,305 \/ 41,023/.test(foot.title), 'the footer title still carries the totals');
await page.evaluate(async () => { const I = await import('/js/i18n.js'); await I.setLang('fr'); }); await page.waitForTimeout(400);
const footFr = await page.evaluate(() => document.getElementById('nav-foot').innerText.replace(/\s+/g, ' ').trim());
ok(new RegExp(`^© Marc-André Léger · v${VERSION.replace(/\\./g, '\\.')} Beta · ✓ Moteur vérifié`).test(footFr), 'French footer: ' + footFr.slice(0, 70));

/* ---------- item 15: FR top bar at 1600 px with the consultant open ---------- */
await page.click('#consult-toggle'); await page.waitForTimeout(600);
const bar = await page.evaluate(() => {
  const r = e => e.getBoundingClientRect();
  const kind = document.getElementById('ws-kind'), sel = document.getElementById('ws-select'), right = document.querySelector('.topright'), bar = document.querySelector('.topbar');
  const overlap = (a, b) => !(a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1);
  const btns = [...right.querySelectorAll('button')].map(b => ({ t: b.textContent.trim(), r: r(b) }));
  return { kindText: kind.textContent, kindInBar: r(kind).right <= r(bar).right + 1 && r(kind).left >= r(sel).right - 1, kindVsRight: btns.filter(b => overlap(r(kind), b.r)).map(b => b.t), selVsKind: overlap(r(sel), r(kind)), consultOpen: document.body.classList.contains('consult-open') };
});
ok(bar.consultOpen && /Exemple pédagogique/.test(bar.kindText), 'consultant open, French kind pill: ' + bar.kindText);
ok(bar.kindInBar && !bar.selVsKind && bar.kindVsRight.length === 0, `no overlap in the French top bar at 1600 px (pill vs buttons: ${bar.kindVsRight.join(', ') || 'none'})`);
await page.click('#consult-toggle'); await page.waitForTimeout(300);
await page.evaluate(async () => { const I = await import('/js/i18n.js'); await I.setLang('en'); }); await page.waitForTimeout(300);

/* ---------- NV-080: support code ---------- */
for (const [route, code] of [['org/crown', 'ORG-CROWN'], ['register', 'REGISTER'], ['iam/overview', 'IAM-OVERVIEW'], ['about/versions', 'ABOUT-VERSIONS']]) {
  await goto(page, '#/' + route, 800);
  const sc = await page.evaluate(() => { const b = [...document.querySelectorAll('main > section')].find(s => !s.hidden)?.querySelector('h1 .support-code'); return b ? { text: b.textContent, code: b.dataset.code, noi18n: b.hasAttribute('data-noi18n'), label: b.getAttribute('aria-label') } : null; });
  ok(sc && sc.text === `${code} · ${VERSION}` && sc.noi18n && /click to copy/.test(sc.label), `support code on ${route}: ${sc?.text}`);
}
await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
await page.click('#panel-about h1 .support-code'); await page.waitForTimeout(200);
const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => null));
ok(clip === null || clip === `ABOUT-VERSIONS · ${VERSION}`, 'a click copies the code: ' + clip);

/* ---------- NV-027: table.grid alignment ---------- */
await goto(page, '#/org/crown', 800);
const off = await page.evaluate(() => { const t = document.querySelector('#panel-org table.grid'); const ths = [...t.querySelectorAll('thead th')], tds = [...(t.querySelector('tbody tr')?.children || [])]; return { display: getComputedStyle(t).display, offsets: ths.map((h, i) => Math.round((tds[i]?.getBoundingClientRect().left ?? h.getBoundingClientRect().left) - h.getBoundingClientRect().left)) }; });
ok(off.display === 'table' && off.offsets.every(o => Math.abs(o) <= 1), `crown-jewel grid: display table, header offsets ${off.offsets.join(',')}`);
await goto(page, '#/budget', 1000);
const off2 = await page.evaluate(() => [...document.querySelectorAll('#panel-budget table.grid')].map(t => { const ths = [...t.querySelectorAll('thead th')], tds = [...(t.querySelector('tbody tr')?.children || [])]; return Math.max(0, ...ths.map((h, i) => Math.abs(Math.round((tds[i]?.getBoundingClientRect().left ?? h.getBoundingClientRect().left) - h.getBoundingClientRect().left)))); }));
ok(off2.length > 0 && off2.every(o => o <= 1), 'Budget grids aligned (max offsets ' + off2.join(', ') + ' px)');

/* ---------- NV-039: Crown jewels redraw after "Add ticked" ---------- */
await goto(page, '#/org/crown', 800);
const before = await page.evaluate(() => document.querySelectorAll('#panel-org table.grid tbody tr').length);
// the same path the extraction dialog takes: add a crown jewel then goOrRedraw('org/crown') while the tab is open
await page.evaluate(async () => { const st = await import('/js/state.js'); const U = await import('/js/util.js'); st.S.ws.assessment.CROWN.push(['CJ99', 'Test jewel 192', 'role', '', 'High', 'High', 'High', '', '']); st.touch(); U.goOrRedraw('org/crown'); });
await page.waitForTimeout(600);
const after = await page.evaluate(() => document.querySelectorAll('#panel-org table.grid tbody tr').length);
ok(after === before + 1, `Crown jewels tab redrawn in place (${before} → ${after} rows)`);
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.assessment.CROWN = st.S.ws.assessment.CROWN.filter(r => r[0] !== 'CJ99'); st.touch(); });

/* ---------- item 2: one window at a time ---------- */
const p2 = await ctx.newPage(); const err2 = []; p2.on('pageerror', e => err2.push(String(e)));
await p2.goto(page.url()); await p2.waitForTimeout(2500);
const lock = await p2.evaluate(() => ({ kind: document.querySelector('.winlock')?.dataset.kind, title: document.querySelector('.winlock h1')?.textContent, ws: false, use: !!document.getElementById('winlock-use'), close: !!document.getElementById('winlock-close') }));
ok(lock.kind === 'busy' && /already open in another window/.test(lock.title) && lock.use && lock.close, 'second window: lock screen with Use it here / Close');
const hasWs2 = await p2.evaluate(async () => { const st = await import('/js/state.js'); return !!st.S.ws; });
ok(!hasWs2, 'the second window has not loaded any workspace while locked');
// unsaved work in window 1 (debounced save pending), then take over from window 2
await goto(page, '#/org/profile', 600);
const stamp = 'typed in window 1 at ' + Date.now();
await page.evaluate(async s => { const st = await import('/js/state.js'); st.S.ws.org.notes = s; st.touch(); }, stamp);
await p2.click('#winlock-use'); await p2.waitForTimeout(3000);
const w2 = await p2.evaluate(async () => { const st = await import('/js/state.js'); return { ws: !!st.S.ws, notes: st.S.ws?.org?.notes, lock: !!document.querySelector('.winlock'), held: (await import('/js/winlock.js')).isHeld() }; });
ok(w2.ws && w2.notes === stamp && !w2.lock && w2.held, 'Use it here: window 2 holds the lock and sees the work saved by window 1');
const w1 = await page.evaluate(async () => { const s = await import('/js/store.js'); const W = await import('/js/winlock.js'); return { frozen: s.isFrozen(), kind: document.querySelector('.winlock')?.dataset.kind, held: W.isHeld(), locked: document.body.classList.contains('winlocked') }; });
ok(w1.frozen && w1.kind === 'taken' && !w1.held && w1.locked, 'window 1 is frozen behind a "now open in another window" screen');
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.org.notes = 'late write from window 1'; await st.saveNow(); });
await page.waitForTimeout(500);
const stored = await p2.evaluate(async () => { const s = await import('/js/store.js'); const st = await import('/js/state.js'); return (await s.get('ws', st.S.ws.id)).org.notes; });
ok(stored === stamp, 'a late write from the frozen window is dropped');
// crash-safety: closing the holder releases the lock; a third window opens without the prompt
await p2.close(); await page.waitForTimeout(500);
const p3 = await ctx.newPage(); await p3.goto(page.url()); await p3.waitForTimeout(2500);
ok(await p3.evaluate(async () => !document.querySelector('.winlock') && !!(await import('/js/state.js')).S.ws), 'after the holder closes, a new window opens without the lock screen (crash-safe)');
// take it back from the frozen window: Use it here there reloads it as the holder
await page.click('#winlock-use'); await page.waitForTimeout(3500);
ok(await page.evaluate(async () => !document.querySelector('.winlock') && (await import('/js/winlock.js')).isHeld()), 'the frozen window takes the lock back with Use it here');
ok(await p3.evaluate(() => document.querySelector('.winlock')?.dataset.kind === 'taken'), 'and the third window is now the frozen one');
await p3.close();
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.org.notes = 'Source: MediBec business case v2.0b (fictional teaching case). All figures are illustrative.'; st.touch(); });
ok(errors.length === 0 && err2.length === 0, 'no page errors: ' + [...errors, ...err2].join(' | ').slice(0, 300));
await browser.close(); done('t69 interface 1.9.2');
