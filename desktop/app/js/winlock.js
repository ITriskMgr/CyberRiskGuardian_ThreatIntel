/* winlock.js — one window at a time (1.9.2, item 2, NV-012).

   Two windows or tabs of the application on the same address share the same storage, and until 1.9.1 the last one
   to save won: a mission typed in window 1 was lost when window 2 saved. From 1.9.2 a window must hold the
   application lock before it reads or writes anything.

   How it works. The lock is a Web Lock (navigator.locks, name "crg-desktop-window"): the browser releases it by
   itself when the holding window closes, navigates or crashes, so a crash never leaves the application locked. A
   second window that finds the lock held shows a screen with two choices:
     • Use it here — this window takes over. The other window is asked (BroadcastChannel) to save what it holds,
       then it freezes: its store refuses every write (store.js) and an overlay says the copy is now open elsewhere,
       with the same two choices. Only then does this window load the data.
     • Close — the window closes (or, when the browser refuses a script close, says it can be closed).
   Where Web Locks are unavailable (very old browsers) a localStorage heartbeat does the same job: a holder refreshes
   its stamp every 2 s and a stamp older than 6 s counts as a crashed window.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';
import * as prefs from './prefs.js';
import * as i18n from './i18n.js';

const NAME = 'crg-desktop-window';
const CHANNEL = 'crg-desktop-window';
const HEART_KEY = 'crg-winlock';
const ID = Math.random().toString(36).slice(2) + Date.now().toString(36);
export const windowId = () => ID;

let chan = null, held = false, frozen = false, releaseFn = null, heart = null;
const hasLocks = () => typeof navigator !== 'undefined' && !!navigator.locks && typeof navigator.locks.request === 'function';

function channel() {
  if (chan || typeof BroadcastChannel === 'undefined') return chan;
  chan = new BroadcastChannel(CHANNEL);
  chan.onmessage = e => {
    const m = e.data || {};
    if (m.from === ID) return;
    if (m.type === 'takeover' && held) onStolen(m.from);
    if (m.type === 'who' && held) post({ type: 'held', since: heldSince });
  };
  return chan;
}
const post = m => { try { channel()?.postMessage({ ...m, from: ID }); } catch { /* no channel */ } };
let heldSince = 0;

/* ---------- the lock itself ---------- */
async function tryLock({ steal = false } = {}) {
  if (hasLocks()) {
    return new Promise(resolve => {
      const p = navigator.locks.request(NAME, { ifAvailable: !steal, steal }, lock => {
        if (!lock) { resolve(false); return; }
        held = true; heldSince = Date.now(); clearRetakeBy(); resolve(true);
        return new Promise(r => { releaseFn = r; });
      });
      // A stolen lock rejects the holder's request with an AbortError: the holder learns of the takeover even
      // when the channel message was missed.
      p.catch(e => { if (held && /Abort/i.test(String(e?.name || e))) onStolen(null); });
    });
  }
  // fallback: a heartbeat stamp in localStorage
  try {
    const cur = JSON.parse(localStorage.getItem(HEART_KEY) || 'null');
    if (!steal && cur && cur.id !== ID && Date.now() - cur.at < 6000) return false;
    localStorage.setItem(HEART_KEY, JSON.stringify({ id: ID, at: Date.now() }));
    held = true; heldSince = Date.now();
    clearInterval(heart);
    heart = setInterval(() => {
      try {
        const now = JSON.parse(localStorage.getItem(HEART_KEY) || 'null');
        if (now && now.id !== ID) { onStolen(now.id); return; }
        localStorage.setItem(HEART_KEY, JSON.stringify({ id: ID, at: Date.now() }));
      } catch { /* private window */ }
    }, 2000);
    window.addEventListener('beforeunload', () => { try { const now = JSON.parse(localStorage.getItem(HEART_KEY) || 'null'); if (now?.id === ID) localStorage.removeItem(HEART_KEY); } catch { /* ignore */ } });
    return true;
  } catch { return true; }   // no storage at all: nothing to protect
}

/* ---------- waiting for a free lock (1.9.3, T1) ----------
   A window that shows the lock screen (second window, or a frozen first window) queues for the lock: when the holder
   closes or crashes the browser grants it and the window recovers by itself. Aborted whenever the person takes over. */
let waitAbort = null, waitPoll = null;
function cancelWait() { try { waitAbort?.abort(); } catch { /* done */ } waitAbort = null; clearInterval(waitPoll); waitPoll = null; }
function waitFree(onFree, { settle = 0 } = {}) {
  cancelWait();
  if (hasLocks()) {
    const ac = new AbortController(); waitAbort = ac;
    let mine = false;
    const rearm = () => { if (!ac.signal.aborted) waitFree(onFree, { settle }); };
    navigator.locks.request(NAME, { signal: ac.signal }, () => {
      if (ac.signal.aborted) return undefined;
      const wait = retakeByOther();
      if (wait) { setTimeout(rearm, wait + 200); return undefined; }   // another window is taking the lock back: leave the gap to it
      mine = true; held = true; heldSince = Date.now(); waitAbort = null;
      // `settle`: a window that has just been taken over from queues while the taker is still stealing the lock; it is
      // free only if the lock is still ours after the taker had its chance
      if (settle) setTimeout(() => { if (mine && held) onFree(); }, settle); else onFree();
      return new Promise(r => { releaseFn = r; });
    }).catch(() => { if (mine && !ac.signal.aborted) { mine = false; held = false; releaseFn = null; rearm(); } });   // stolen from us while settling
    return;
  }
  waitPoll = setInterval(async () => {   // no Web Locks: a stamp older than 6 s means the holder is gone
    try { const cur = JSON.parse(localStorage.getItem(HEART_KEY) || 'null'); if (cur && cur.id !== ID && Date.now() - cur.at < 6000) return; } catch { /* free */ }
    clearInterval(waitPoll); waitPoll = null;
    if (await tryLock()) onFree();
  }, 1500);
}
const RETAKE = 'crg-winlock-retake';
/* Take-back (1.9.3 review m2): the window that takes the lock back reloads, and the lock is free while it does. A marker (window id +
   time) tells the window it took the lock from not to recover into that gap; the marker is cleared once the taker holds the lock again. */
const RETAKE_BY = 'crg-winlock-retake-by', RETAKE_BY_MS = 15000;
const TAB = (() => { try { return sessionStorage.getItem('crg-winlock-tab') || (sessionStorage.setItem('crg-winlock-tab', ID), ID); } catch { return ID; } })();   // survives the reload
const markRetakeBy = () => { try { localStorage.setItem(RETAKE_BY, JSON.stringify({ id: TAB, at: Date.now() })); } catch { /* ignore */ } };
const clearRetakeBy = () => { try { const c = JSON.parse(localStorage.getItem(RETAKE_BY) || 'null'); if (c?.id === TAB) localStorage.removeItem(RETAKE_BY); } catch { /* ignore */ } };
/** Milliseconds left of another window's take-back marker (0 when none). */
const retakeByOther = () => { try { const c = JSON.parse(localStorage.getItem(RETAKE_BY) || 'null'); return c && c.id !== TAB ? Math.max(0, RETAKE_BY_MS - (Date.now() - c.at)) : 0; } catch { return 0; } };
const retaking = () => { try { return Date.now() - Number(sessionStorage.getItem(RETAKE) || 0) < 10000; } catch { return false; } };
const markRetake = () => { try { sessionStorage.setItem(RETAKE, String(Date.now())); } catch { /* ignore */ } };

/** How long the taking-over window waits for the holder's "frozen" (saved) confirmation before offering the override. */
let ACK_TIMEOUT_MS = 15000;
export const ackTimeout = () => ACK_TIMEOUT_MS;
/** For the test suites only: shorten the wait before the override is offered. */
export const setAckTimeout = ms => { ACK_TIMEOUT_MS = Math.max(200, Number(ms) || 15000); };
/** Ask the holder to save and freeze, then take the lock. Resolves { acked } when this window holds it.
 *  1.9.2 review (M5): the lock is taken only after the holder confirms it saved (its "frozen" message), so this window never
 *  loads data the other window is still writing. When no confirmation comes within ACK_TIMEOUT_MS (a hung window, a
 *  missed message), `onWait` is told and the person decides: keep waiting, or take over anyway — never silently. */
async function takeOver({ onWait = null } = {}) {
  cancelWait();
  const c = channel();
  let acked = false;
  if (c) {
    acked = await new Promise(resolve => {
      let timer = null, done = false;
      const finish = v => { if (done) return; done = true; clearTimeout(timer); c.removeEventListener('message', h); resolve(v); };
      const h = e => { if (e.data?.type === 'frozen' && e.data.from !== ID) finish(true); };
      c.addEventListener('message', h);
      const arm = () => { timer = setTimeout(async () => {
        if (!onWait) { finish(false); return; }
        const again = await onWait();           // true: wait another round; false: take over anyway
        if (again) { post({ type: 'takeover' }); arm(); } else finish(false);
      }, ACK_TIMEOUT_MS); };
      arm();
      post({ type: 'takeover' });
    });
  } else post({ type: 'takeover' });
  await tryLock({ steal: true });
  return { acked };
}

/* ---------- when another window took over ---------- */
async function onStolen() {
  if (frozen) return;
  frozen = true; held = false; clearInterval(heart);
  try { const st = await import('./state.js'); await st.saveNow(); } catch { /* nothing open yet */ }
  try { const U = await import('./users.js'); if (U.active()) await U.save(); } catch { /* single-user */ }
  store.freeze();                       // from here on nothing is written from this window
  try { (await import('./prefs.js')).freeze?.(); } catch { /* preferences module not loaded */ }   // M5: preferences stop writing too
  post({ type: 'frozen' });
  // M5 (1.9.2 rule, binding): the frozen window keeps the lock until the taker has really stolen it, so a takeover that is
  // waiting for the confirmation (or for the person's decision) is never overtaken by this window re-grabbing a released
  // lock and recovering. The recovery queue below sits behind the held lock and fires only once it is gone.
  overlay('taken');
  waitFree(() => { markRetake(); store.unfreeze(); location.reload(); }, { settle: 1500 });   // the new holder closed or crashed: this window recovers
}
export const isFrozen = () => frozen;
export const isHeld = () => held;
/** The last takeover from this window: { acked, at } — acked false means the person took over without the other window's confirmation. */
let lastTakeover = null;
export const takeoverInfo = () => lastTakeover;

/* ---------- screens ---------- */
let box = null;
function screen(kind) {
  const d = (tag, cls, ...kids) => { const n = document.createElement(tag); if (cls) n.className = cls; for (const k of kids) n.append(k instanceof Node ? k : document.createTextNode(String(k))); return n; };
  const t = i18n.tr;
  const title = kind === 'busy' ? t('CyberRiskGuardian is already open in another window') : kind === 'taken' ? t('Opened in another window') : t('CyberRiskGuardian is closed');
  const body = kind === 'busy'
    ? t('Two windows on the same workspaces would overwrite each other’s work. Use the application here, and the other window will save and stop; or close this one and keep working there.')
    : kind === 'taken'
      ? t('Your work here was saved before the other window took over. Nothing you change in this window is saved any more. Use it here to continue in this window, or close this window.')
      : t('You can close this window or tab.');
  const wrap = d('div', 'winlock', d('img', ''), d('h1', '', title), d('p', '', body));
  const img = wrap.querySelector('img'); img.src = 'icons/icon-192.png'; img.alt = ''; img.width = 72; img.height = 72;
  // the window opened second is asked (dialog); the first window only shows a passive lock screen (T1)
  if (kind === 'busy') { wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'winlock-title'); }
  else wrap.setAttribute('role', 'status');
  wrap.querySelector('h1').id = 'winlock-title';
  wrap.dataset.kind = kind;
  if (kind !== 'closed') {
    const row = d('div', 'btnrow');
    const use = d('button', 'btn', t('Use it here')); use.type = 'button'; use.id = 'winlock-use';
    const close = d('button', 'btn ghost', t('Close this window')); close.type = 'button'; close.id = 'winlock-close';
    row.append(use, close); wrap.append(row);
    close.addEventListener('click', () => closeWindow());
    const wait = d('p', 'small winlock-wait'); wait.hidden = true; wrap.append(wait);
    use.addEventListener('click', async () => {
      use.disabled = true; close.disabled = true; use.textContent = t('Waiting for the other window to save…');
      // 1.9.2 review (M5): no silent takeover — after ACK_TIMEOUT_MS without the other window's confirmation, the person chooses
      const onWait = () => new Promise(resolve => {
        wait.hidden = false; wait.replaceChildren();
        wait.append(d('b', '', t('The other window did not confirm that it saved its work.')), ' ',
          d('span', '', t('It may be busy saving a large workspace, or it may be hung. Keep waiting, or take over anyway: whatever that window has not saved yet will be lost.')));
        const row = d('div', 'btnrow'); const keep = d('button', 'btn', t('Keep waiting')); keep.type = 'button'; keep.id = 'winlock-wait-more';
        const anyway = d('button', 'btn ghost', t('Take over anyway')); anyway.type = 'button'; anyway.id = 'winlock-force';
        row.append(keep, anyway); wait.append(row); close.disabled = false;
        keep.addEventListener('click', () => { wait.hidden = true; close.disabled = true; resolve(true); });
        anyway.addEventListener('click', () => { wait.hidden = true; resolve(false); });
      });
      const { acked } = await takeOver({ onWait });
      lastTakeover = { acked, at: Date.now() };
      if (kind === 'taken') { markRetake(); markRetakeBy(); store.unfreeze(); location.reload(); return; }   // reload: the data may have changed in the other window
      dismiss();
      acquireResolve?.(true); acquireResolve = null;
    });
  }
  return wrap;
}
function dismiss() { cancelWait(); if (box) box.remove(); box = null; document.body.classList.remove('winlocked'); }
function overlay(kind) {
  if (box) box.remove();
  box = document.createElement('div'); box.className = 'winlock-back'; box.append(screen(kind));
  document.body.append(box); document.body.classList.add('winlocked');
  try { i18n.translateTree?.(box); } catch { /* before init */ }
  box.querySelector('button')?.focus();
}
function closeWindow() {
  try { window.close(); } catch { /* not script-opened */ }
  setTimeout(() => { if (!window.closed) { if (box) box.remove(); box = document.createElement('div'); box.className = 'winlock-back'; box.append(screen('closed')); document.body.append(box); } }, 300);
}

let acquireResolve = null;
/** Take the application lock, or show the choice screen until the person decides. Never rejects. */
export async function acquire() {
  try {
    channel();
    if (await tryLock()) return true;
    if (retaking()) { for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 100)); if (await tryLock()) return true; } }   // a reload that just gave its lock up
    // another window holds the lock: ask the person (in their language, read from the preferences)
    try { await i18n.setLang(prefs.get('lang') || 'en', { save: false }); } catch { /* English */ }
    overlay('busy');
    return await new Promise(resolve => {
      acquireResolve = resolve;
      waitFree(() => { dismiss(); acquireResolve?.(true); acquireResolve = null; });   // the holder closed or crashed while this prompt was open
    });
  } catch (e) {
    console.warn('winlock:', e); return true;
  }
}
