/* prefs.js — preferences of the person using this copy of the app (1.5.2): interface language,
   whether the help chatbot is open. Not part of any workspace, so a workspace exported or shared
   never carries them. Stored in localStorage (fast, synchronous at start-up) and mirrored in IndexedDB.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';

const KEY = 'crg-prefs';
const DEFAULTS = { lang: 'en', chatOpen: false };
let P = (() => { try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return { ...DEFAULTS }; } })();
const subs = new Set();

export const get = k => P[k];
export const all = () => ({ ...P });
/* 1.9.2 review (M5) — a window another window took over stops writing its preferences too (store.js drops the IndexedDB
   writes; this drops the localStorage mirror), so a late handler cannot overwrite the holder's. */
let frozen = false;
export const freeze = () => { frozen = true; };
export const unfreeze = () => { frozen = false; };
export function set(k, v) {
  if (frozen) return;
  P[k] = v;
  try { localStorage.setItem(KEY, JSON.stringify(P)); } catch { /* private window */ }
  store.put('meta', 'prefs', P).catch(() => {});
  for (const f of subs) { try { f(k, v); } catch (e) { console.error(e); } }
}
export const onChange = f => { subs.add(f); return () => subs.delete(f); };
