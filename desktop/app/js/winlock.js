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
        held = true; heldSince = Date.now(); resolve(true);
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

/** Ask the holder to save and freeze, then take the lock. Resolves when this window holds it. */
async function takeOver() {
  const acked = new Promise(resolve => {
    const c = channel(); if (!c) { resolve(false); return; }
    const h = e => { if (e.data?.type === 'frozen' && e.data.from !== ID) { c.removeEventListener('message', h); resolve(true); } };
    c.addEventListener('message', h);
    setTimeout(() => { c.removeEventListener('message', h); resolve(false); }, 1500);
  });
  post({ type: 'takeover' });
  await acked;
  await tryLock({ steal: true });
}

/* ---------- when another window took over ---------- */
async function onStolen() {
  if (frozen) return;
  frozen = true; held = false; clearInterval(heart);
  try { const st = await import('./state.js'); await st.saveNow(); } catch { /* nothing open yet */ }
  try { const U = await import('./users.js'); if (U.active()) await U.save(); } catch { /* single-user */ }
  store.freeze();                       // from here on nothing is written from this window
  post({ type: 'frozen' });
  if (releaseFn) { try { releaseFn(); } catch { /* released */ } releaseFn = null; }
  overlay('taken');
}
export const isFrozen = () => frozen;
export const isHeld = () => held;

/* ---------- screens ---------- */
let box = null;
function screen(kind) {
  const d = (tag, cls, ...kids) => { const n = document.createElement(tag); if (cls) n.className = cls; for (const k of kids) n.append(k instanceof Node ? k : document.createTextNode(String(k))); return n; };
  const t = i18n.tr;
  const title = kind === 'busy' ? t('CyberRiskGuardian is already open in another window') : kind === 'taken' ? t('This copy is now open in another window') : t('CyberRiskGuardian is closed');
  const body = kind === 'busy'
    ? t('Two windows on the same workspaces would overwrite each other’s work. Use the application here, and the other window will save and stop; or close this one and keep working there.')
    : kind === 'taken'
      ? t('Your work here was saved before the other window took over. Nothing you change in this window is saved any more. Take it back to continue here, or close this window.')
      : t('You can close this window or tab.');
  const wrap = d('div', 'winlock', d('img', ''), d('h1', '', title), d('p', '', body));
  const img = wrap.querySelector('img'); img.src = 'icons/icon-192.png'; img.alt = ''; img.width = 72; img.height = 72;
  wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'winlock-title'); wrap.querySelector('h1').id = 'winlock-title';
  wrap.dataset.kind = kind;
  if (kind !== 'closed') {
    const row = d('div', 'btnrow');
    const use = d('button', 'btn', t('Use it here')); use.type = 'button'; use.id = 'winlock-use';
    const close = d('button', 'btn ghost', t('Close this window')); close.type = 'button'; close.id = 'winlock-close';
    row.append(use, close); wrap.append(row);
    close.addEventListener('click', () => closeWindow());
    use.addEventListener('click', async () => {
      use.disabled = true; use.textContent = t('Taking over…');
      await takeOver();
      if (kind === 'taken') { store.unfreeze(); location.reload(); return; }   // reload: the data may have changed in the other window
      wrap.remove(); box = null; document.body.classList.remove('winlocked');
      acquireResolve?.(true); acquireResolve = null;
    });
  }
  return wrap;
}
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
    // another window holds the lock: ask the person (in their language, read from the preferences)
    try { await i18n.setLang(prefs.get('lang') || 'en', { save: false }); } catch { /* English */ }
    overlay('busy');
    return await new Promise(resolve => { acquireResolve = resolve; });
  } catch (e) {
    console.warn('winlock:', e); return true;
  }
}
