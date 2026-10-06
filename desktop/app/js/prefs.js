/* prefs.js — preferences of the person using this copy of the app (1.5.2): interface language,
   whether the help chatbot may use AI. Not part of any workspace, so a workspace exported or shared
   never carries them. Stored in localStorage (fast, synchronous at start-up) and mirrored in IndexedDB.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';

const KEY = 'crg-prefs';
const DEFAULTS = { lang: 'en', chatbotAI: false, chatOpen: false };
let P = (() => { try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return { ...DEFAULTS }; } })();
const subs = new Set();

export const get = k => P[k];
export const all = () => ({ ...P });
export function set(k, v) {
  P[k] = v;
  try { localStorage.setItem(KEY, JSON.stringify(P)); } catch { /* private window */ }
  store.put('meta', 'prefs', P).catch(() => {});
  for (const f of subs) { try { f(k, v); } catch (e) { console.error(e); } }
}
export const onChange = f => { subs.add(f); return () => subs.delete(f); };
