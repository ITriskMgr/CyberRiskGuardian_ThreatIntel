// t82 — single-window lock (1.9.3, T1). The prompt appears only in the window opened second; the first window shows a
// passive lock screen ("Opened in another window" — Use it here, no dialog); "Use it here" in either window takes the
// lock, removes the whole overlay (the 1.9.2 bug left a grey .winlock-back behind, so the window stayed unusable) and
// the other window becomes the passive screen; the lock is released when the holder closes or crashes (Web Locks, and the
// localStorage heartbeat where Web Locks are missing) and a waiting window recovers by itself. English and French.
import { chromium } from 'playwright';
import { URL, ok as ok0, done } from './lib.mjs';
const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); ok0(c, m); };
const ONLY = process.env.ONLY;

const browser = await chromium.launch();
const errs = [];
async function newCtx({ noLocks = false, sw = false } = {}) {
  const ctx = await browser.newContext({ serviceWorkers: sw ? 'allow' : 'block', viewport: { width: 1280, height: 800 } });
  if (noLocks) await ctx.addInitScript(() => { try { Object.defineProperty(navigator, 'locks', { value: undefined, configurable: true }); } catch { /* ignore */ } });
  return ctx;
}
async function openPage(ctx, hash = '#/process', wait = 2500) {
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL + hash); await p.waitForTimeout(wait); return p;
}
const lockInfo = async p => { for (let i = 0; i < 20; i++) { try { return await lockInfo1(p); } catch (e) { if (!/context was destroyed|navigation/i.test(String(e))) throw e; await p.waitForTimeout(300); } } return {}; };
const lockInfo1 = p => p.evaluate(() => { const w = document.querySelector('.winlock'); return { kind: w?.dataset.kind || null, role: w?.getAttribute('role') || null, modal: w?.getAttribute('aria-modal') || null, title: w?.querySelector('h1')?.textContent || '', btns: [...(w?.querySelectorAll('button') || [])].map(b => b.textContent), back: !!document.querySelector('.winlock-back'), locked: document.body.classList.contains('winlocked') }; });
/** The window is usable: no overlay left, a menu entry can be clicked (Playwright refuses a click an overlay would swallow) and the route changes. */
async function usable(p, panel = 'assets') {
  try { return await usable1(p, panel); } catch { return false; }
}
async function usable1(p, panel) {
  const li = await lockInfo(p);
  if (li.kind || li.back || li.locked) return false;
  try { await p.click(`nav a.tab[data-panel="${panel}"]`, { timeout: 4000 }); await p.waitForTimeout(500); } catch { return false; }
  return p.evaluate(async pn => location.hash.startsWith('#/' + pn) && !!(await import('/js/state.js')).S.ws, panel);
}
const waitFor = async (fn, ms = 15000) => { const end = Date.now() + ms; for (;;) { if (await fn().catch(() => false)) return true; if (Date.now() > end) return false; await new Promise(r => setTimeout(r, 250)); } };
const crash = async (ctx, p) => { const c = await ctx.newCDPSession(p); c.send('Page.crash').catch(() => {}); await new Promise(r => setTimeout(r, 500)); };   // Page.crash never answers: not awaited

async function scenario(label, opts) {
  const ctx = await newCtx(opts);
  /* A first, then B */
  const A = await openPage(ctx);
  ok(!(await lockInfo(A)).kind && await usable(A, 'process'), `${label}: window A (first) opens without any prompt and holds the lock`);
  const B = await openPage(ctx);
  const b0 = await lockInfo(B), a0 = await lockInfo(A);
  ok(b0.kind === 'busy' && b0.role === 'dialog' && b0.modal === 'true' && b0.btns.join('|') === 'Use it here|Close this window', `${label}: the prompt appears in B, the window opened second (${b0.btns.join(' / ')})`);
  ok(!a0.kind && !a0.back && !a0.locked, `${label}: the first window A shows no prompt at all while B asks`);
  ok(await B.evaluate(async () => !(await import('/js/state.js')).S.ws), `${label}: B has loaded nothing while locked`);

  /* B takes over */
  const stamp = 'typed in A ' + Date.now();
  await A.evaluate(async s => { const st = await import('/js/state.js'); st.S.ws.org.notes = s; st.touch(); }, stamp);
  await B.click('#winlock-use');
  ok(await waitFor(async () => (await lockInfo(A)).kind === 'taken', 20000), `${label}: A becomes the passive lock screen after B took over`);
  const a1 = await lockInfo(A);
  ok(a1.role === 'status' && a1.modal === null && /Opened in another window/.test(a1.title) && a1.btns.includes('Use it here'), `${label}: A's screen is passive (role ${a1.role}, no aria-modal): "${a1.title}" / ${a1.btns.join(' / ')}`);
  ok(await waitFor(() => usable(B, 'assets'), 10000), `${label}: B is fully usable after "Use it here" (no grey overlay left, menu clickable)`);
  const b1 = await lockInfo(B);
  ok(!b1.back && !b1.locked, `${label}: B left neither .winlock-back nor body.winlocked behind`);
  ok(await B.evaluate(async s => (await import('/js/state.js')).S.ws.org.notes === s, stamp), `${label}: B sees what A had typed`);

  /* A takes it back */
  await A.click('#winlock-use');
  ok(await waitFor(async () => (await lockInfo(B)).kind === 'taken', 25000), `${label}: B becomes the passive screen when A takes it back`);
  ok(await waitFor(() => usable(A, 'assets'), 25000), `${label}: A is fully usable again after "Use it here" (re-rendered, unlocked)`);

  /* close A (the holder): B, passive, recovers by itself */
  await A.close({ runBeforeUnload: false });
  ok(await waitFor(() => usable(B, 'register'), 20000), `${label}: after A closes, B recovers by itself and is usable (no permanent lock)`);

  /* crash B (the holder) while a third window is waiting */
  const C = await openPage(ctx);
  ok((await lockInfo(C)).kind === 'busy', `${label}: a new window C is asked while B holds`);
  await crash(ctx, B);
  ok(await waitFor(() => usable(C, 'assets'), 25000), `${label}: after B crashes, C's prompt goes away by itself and C is usable (lock released by timeout)`);
  /* a window opened after everything was released is not prompted */
  await C.close({ runBeforeUnload: false });
  const D = await openPage(ctx);
  ok(await waitFor(() => usable(D, 'assets'), 15000), `${label}: a window opened after the holder closed is not prompted`);
  await ctx.close();
}

if (!ONLY || ONLY === 'locks') await scenario('Web Locks', {});
if (!ONLY || ONLY === 'hb') await scenario('heartbeat fallback (no Web Locks)', { noLocks: true });
if (!ONLY || ONLY === 'sw') await scenario('installed app (service worker active)', { sw: true });

/* French strings */
{
  const ctx = await newCtx();
  const A = await openPage(ctx);
  await A.evaluate(async () => { const I = await import('/js/i18n.js'); const P = await import('/js/prefs.js'); await I.setLang('fr'); P.set?.('lang', 'fr'); });
  await A.waitForTimeout(500);
  const B = await openPage(ctx);
  const f0 = await lockInfo(B);
  ok(f0.kind === 'busy' && f0.btns[0] === 'Utiliser ici' && /déjà ouvert/.test(f0.title), `French prompt in the second window: "${f0.title}" / ${f0.btns.join(' / ')}`);
  await B.click('#winlock-use');
  ok(await waitFor(async () => (await lockInfo(A)).kind === 'taken', 20000), 'French: A passive');
  const f1 = await lockInfo(A);
  ok(f1.title === 'Ouvert dans une autre fenêtre' && f1.btns[0] === 'Utiliser ici', `French passive screen: "${f1.title}" / ${f1.btns.join(' / ')}`);
  await ctx.close();
}
ok(errs.length === 0, 'no page errors: ' + errs.join(' | ').slice(0, 300));
await browser.close(); done('t82 window lock');
