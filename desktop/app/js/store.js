/* store.js — local persistence in the browser's IndexedDB. Nothing leaves the machine.
   Stores: ws (workspaces), blob (large items: document text, threat snapshots), meta (settings).
   Falls back to memory, with a warning, where IndexedDB is unavailable (private windows).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

const DB = 'crg-desktop', VER = 1;
let dbp = null, memory = null;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve) => {
    let req;
    try { req = indexedDB.open(DB, VER); } catch { memory = new Map(); resolve(null); return; }
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const s of ['ws', 'blob', 'meta']) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { memory = new Map(); resolve(null); };
  });
  return dbp;
}

async function tx(store, mode, fn) {
  const db = await open();
  if (!db) {
    const m = memory;
    return fn({
      get: k => m.get(store + ':' + k), put: (v, k) => m.set(store + ':' + k, v), delete: k => m.delete(store + ':' + k),
      keys: () => [...m.keys()].filter(k => k.startsWith(store + ':')).map(k => k.slice(store.length + 1)),
    }, true);
  }
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode), os = t.objectStore(store);
    let out;
    const r = fn(os, false);
    if (r && 'onsuccess' in r) r.onsuccess = () => { out = r.result; };
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error);
  });
}

export const persistent = async () => !!(await open());
/* 1.9.2 (item 2, NV-012) — a window that another window took over is frozen: every write is dropped (and logged
   once), so a debounced save or a late handler can never overwrite the work of the window now in charge. */
let frozen = false, warned = false;
export const freeze = () => { frozen = true; };
export const unfreeze = () => { frozen = false; };
export const isFrozen = () => frozen;
const dropped = () => { if (!warned) { warned = true; console.warn('store: this window is frozen (open in another window); the write was dropped'); } return Promise.resolve(undefined); };
export const get = (store, key) => tx(store, 'readonly', (os, mem) => mem ? os.get(key) : os.get(key));
export const put = (store, key, value) => frozen ? dropped() : tx(store, 'readwrite', (os, mem) => mem ? os.put(value, key) : os.put(value, key));
export const del = (store, key) => frozen ? dropped() : tx(store, 'readwrite', os => os.delete(key));
export const keys = (store) => tx(store, 'readonly', (os, mem) => mem ? os.keys() : os.getAllKeys());
export async function all(store) {
  const ks = await keys(store);
  const out = [];
  for (const k of ks) out.push(await get(store, k));
  return out;
}
export async function estimate() {
  try { const e = await navigator.storage?.estimate?.(); return e || null; } catch { return null; }
}
export async function requestPersist() {
  try { return await navigator.storage?.persist?.(); } catch { return false; }
}
