/* logs.js — the access log and the data log of this installation (Settings → Logs).

   Access log: the application opened, sign-ins and sign-outs (and failed ones), screens opened,
   refused approvals and rights, features switched on or off, settings saved.
   Data log: workspaces created, saved, imported, migrated, reset or deleted; files downloaded
   (exports, reports, backups); files written by the local helper; ontology write-backs.

   What is recorded: when, who (the signed-in person, or "this computer" in single-user mode), what,
   on which workspace or file, and a short detail. Never the contents of a workspace or file, never a
   key, a PIN or a password. Entries are kept on this computer (IndexedDB, meta "logs"), trimmed to
   the retention chosen in Settings → Logs and to 10,000 entries per log.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';
import * as prefs from './prefs.js';

const KEY = 'logs', MAX = 10000;
export const RETENTION = [[30, '30 days'], [90, '90 days'], [180, '180 days'], [365, '1 year'], [730, '2 years']];
const L = { access: [], data: [], loaded: false };
let who = () => '';
let saveT = null;
const SECRET = /(key|token|secret|password|passphrase|pin)\s*[:=]\s*\S+/gi;

/** users.js tells the log who is signed in (kept as a function: the log never imports users). */
export function setWho(f) { who = f; }
export const retentionDays = () => Number(prefs.get('logRetention') || 180);

export async function load() {
  try { const d = await store.get('meta', KEY); if (d) { L.access = d.access || []; L.data = d.data || []; } } catch { /* storage unavailable: log in memory */ }
  L.loaded = true; trim();
}
function trim() {
  const cut = new Date(Date.now() - retentionDays() * 864e5).toISOString();
  for (const k of ['access', 'data']) L[k] = L[k].filter(e => e.t >= cut).slice(0, MAX);
}
function persist() {
  clearTimeout(saveT);
  saveT = setTimeout(() => { trim(); store.put('meta', KEY, { access: L.access, data: L.data }).catch(() => {}); }, 500);
}
const clean = v => String(v ?? '').replace(SECRET, '$1: [withheld]').slice(0, 300);

function add(kind, action, target = '', detail = '', ws = '') {
  const e = { t: new Date().toISOString(), user: clean(who() || ''), action: clean(action), target: clean(target), detail: clean(detail), ws: clean(ws) };
  L[kind].unshift(e);
  if (L[kind].length > MAX) L[kind].length = MAX;
  persist();
  return e;
}
export const access = (action, target, detail, ws) => add('access', action, target, detail, ws);
export const data = (action, target, detail, ws) => add('data', action, target, detail, ws);

/* Saving a workspace happens on every edit; one entry per workspace and minute is enough to answer
   "who changed this, and when". */
const lastSave = new Map();
export function saved(ws) {
  if (!ws) return;
  const k = ws.id + '|' + new Date().toISOString().slice(0, 16);
  if (lastSave.get(ws.id) === k) return;
  lastSave.set(ws.id, k);
  data('workspace saved', ws.name || ws.id, '', ws.name || '');
}

export const entries = kind => (kind === 'all' ? [...L.access.map(e => ({ ...e, kind: 'access' })), ...L.data.map(e => ({ ...e, kind: 'data' }))].sort((a, b) => (a.t < b.t ? 1 : -1)) : L[kind].map(e => ({ ...e, kind })));
export async function clear(kind) {
  if (kind === 'all' || kind === 'access') L.access = [];
  if (kind === 'all' || kind === 'data') L.data = [];
  await store.put('meta', KEY, { access: L.access, data: L.data }).catch(() => {});
}
export function setRetention(days) { prefs.set('logRetention', Number(days)); trim(); persist(); }

export function csv(rows) {
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  return ['time,log,user,action,target,workspace,detail', ...rows.map(e => [e.t, e.kind, e.user, e.action, e.target, e.ws, e.detail].map(q).join(','))].join('\n');
}
