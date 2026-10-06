/* backup.js — save, restore and migrate everything this installation holds (1.5.1).

   What a backup contains, and why each part is in it:
     • workspaces        — the assessments themselves (IndexedDB store "ws")
     • document text     — extracted context documents (blob "doc:<id>"), optional, usually the bulk
     • threat snapshots  — dated KEV/EPSS evidence (blob "snap:<workspace>"), optional and large
     • starting points   — the baseline a teaching case is reset to (blob "base:<workspace>"), kept
                           with the documents because that is what it mostly holds
     • framework packs   — imported or loaded control catalogues, per installation (meta)
     • helper settings   — feed sources, folders, links. Never API keys: those live in a file the
                           helper owns, outside the browser, and a backup must not become a way to
                           copy them around.

   Restoring never silently overwrites a workspace that has moved on. The plan compares what the file
   holds with what is here and labels every workspace — new, identical, older, or newer-here — so a
   restore from an old file cannot quietly undo a day's work.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { VERSION } from './version.js';
import * as store from './store.js';
import { S, loadAll } from './state.js';
import * as FW from './frameworks.js';
import { today } from './util.js';
import * as RESET from './reset.js';

export const SCHEMA = 'crg-backup/1';
export const APP = VERSION;

/* ---------------- integrity ---------------- */

/** SHA-256 where the browser offers it, a small deterministic hash where it does not. */
export async function digest(text) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return 'sha256:' + [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return 'fnv1a:' + h.toString(16).padStart(8, '0');
  }
}

const bytes = o => new Blob([JSON.stringify(o)]).size;
export const human = n => n >= 1e6 ? (n / 1e6).toFixed(1) + ' MB' : n >= 1e3 ? Math.round(n / 1e3) + ' kB' : n + ' B';

/* ---------------- what is here ---------------- */

/** Sizes before anything is written, so the choice to include documents is an informed one. */
export async function inventory() {
  const wss = (await store.all('ws')).filter(Boolean);
  const keys = await store.keys('blob');
  const docKeys = keys.filter(k => String(k).startsWith('doc:'));
  const snapKeys = keys.filter(k => String(k).startsWith('snap:'));
  const baseKeys = keys.filter(k => String(k).startsWith('base:'));
  let docBytes = 0, snapBytes = 0;
  for (const k of docKeys) docBytes += new Blob([String((await store.get('blob', k)) ?? '')]).size;
  for (const k of snapKeys) snapBytes += bytes((await store.get('blob', k)) ?? null);
  await FW.load();
  return {
    workspaces: wss.length,
    wsBytes: bytes(wss),
    documents: docKeys.length, docBytes,
    snapshots: snapKeys.length, snapBytes,
    startingPoints: baseKeys.length,
    frameworks: Object.keys(FW.packs()).length,
    scenarios: wss.reduce((t, w) => t + (w.assessment?.SCEN?.length || 0), 0),
    measures: wss.reduce((t, w) => t + (w.measures?.length || 0), 0),
    recommendations: wss.reduce((t, w) => t + (w.recommendations?.length || 0), 0),
  };
}

/* ---------------- building ---------------- */

export async function build({ documents = true, snapshots = false, settings = true, frameworks = true, note = '' } = {}) {
  const wss = (await store.all('ws')).filter(Boolean);
  const blob = {};
  for (const k of await store.keys('blob')) {
    const key = String(k);
    if (key.startsWith('doc:') && !documents) continue;
    if (key.startsWith('snap:') && !snapshots) continue;
    // 1.5.6 — the starting point of a teaching case is mostly its document text, so it travels with
    // the documents. Without it, a restored classroom case would lose the state students reset to.
    if (key.startsWith('base:') && !documents) continue;
    blob[key] = await store.get('blob', k);
  }
  await FW.load();
  const meta = {};
  if (frameworks) meta.frameworks = { packs: FW.packs(), log: FW.log() };
  if (settings) {
    const cfg = await store.get('meta', 'settings').catch(() => null);
    if (cfg) meta.settings = stripSecrets(cfg);
    // 1.5.2: interface preferences and the users / RACI matrix (PIN hashes are never copied: restored users have no PIN).
    const pf = await store.get('meta', 'prefs').catch(() => null);
    if (pf) meta.prefs = pf;
    const us = await store.get('meta', 'users').catch(() => null);
    if (us) meta.users = { ...us, users: (us.users || []).map(u => ({ ...u, pinHash: '' })) };
  }

  const payload = { workspaces: wss, blob, meta };
  const body = JSON.stringify(payload);
  return {
    schema: SCHEMA,
    app: APP,
    created: new Date().toISOString(),
    note,
    contents: {
      workspaces: wss.length,
      documents: Object.keys(blob).filter(k => k.startsWith('doc:')).length,
      snapshots: Object.keys(blob).filter(k => k.startsWith('snap:')).length,
      startingPoints: Object.keys(blob).filter(k => k.startsWith('base:')).length,
      frameworks: Object.keys(meta.frameworks?.packs || {}).length,
      settings: !!meta.settings,
      scenarios: wss.reduce((t, w) => t + (w.assessment?.SCEN?.length || 0), 0),
      measures: wss.reduce((t, w) => t + (w.measures?.length || 0), 0),
      recommendations: wss.reduce((t, w) => t + (w.recommendations?.length || 0), 0),
    },
    checksum: await digest(body),
    payload,
  };
}

/** Keys, tokens and passwords never travel in a backup, whatever the configuration calls them. */
function stripSecrets(cfg) {
  const out = JSON.parse(JSON.stringify(cfg));
  const walk = o => {
    if (!o || typeof o !== 'object') return;
    for (const k of Object.keys(o)) {
      if (/key|token|secret|password|credential/i.test(k)) { delete o[k]; continue; }
      walk(o[k]);
    }
  };
  walk(out);
  return out;
}

/* ---------------- reading ---------------- */

const semver = v => String(v || '0').split('.').map(n => parseInt(n, 10) || 0);
export function newerThanApp(fileApp) {
  const a = semver(fileApp), b = semver(APP);
  for (let i = 0; i < 3; i++) { if ((a[i] || 0) > (b[i] || 0)) return true; if ((a[i] || 0) < (b[i] || 0)) return false; }
  return false;
}

export function validate(obj) {
  const errs = [];
  if (!obj || typeof obj !== 'object') return ['The file is not a JSON object.'];
  if (obj.schema !== SCHEMA) errs.push(`Expected schema "${SCHEMA}", found "${obj.schema ?? 'none'}".`);
  if (!obj.payload || typeof obj.payload !== 'object') errs.push('No "payload".');
  else if (!Array.isArray(obj.payload.workspaces)) errs.push('"payload.workspaces" must be an array.');
  if (newerThanApp(obj.app))
    errs.push(`The file was written by version ${obj.app}, which is newer than this application (${APP}). ` +
              'Open it with that version rather than risking a silent loss of whatever it added.');
  return errs;
}

/** Confirm the file has not been altered or truncated since it was written. */
export async function verify(obj) {
  if (!obj.checksum) return { ok: null, note: 'The file carries no checksum; its integrity cannot be confirmed.' };
  const now = await digest(JSON.stringify(obj.payload));
  return now === obj.checksum
    ? { ok: true, note: 'Checksum matches.' }
    : { ok: false, note: 'The checksum does not match: the file has been altered or truncated since it was written.' };
}

/* ---------------- planning a restore ---------------- */

/**
 * What restoring this file would do, workspace by workspace. "newer-here" is the dangerous case —
 * the copy in the browser has been modified since the backup — and it is never included by default.
 */
export async function plan(obj) {
  const here = new Map((await store.all('ws')).filter(Boolean).map(w => [w.id, w]));
  const rows = (obj.payload.workspaces || []).map(w => {
    const cur = here.get(w.id);
    let state = 'new', note = 'Not present here; it would be added.';
    if (cur) {
      const a = w.modified || '', b = cur.modified || '';
      if (a === b) { state = 'identical'; note = 'Same modification time; restoring changes nothing.'; }
      else if (a > b) { state = 'older-here'; note = `The backup is newer (${a.slice(0, 16)} against ${b.slice(0, 16)}); restoring brings it forward.`; }
      else { state = 'newer-here'; note = `This browser holds a newer copy (${b.slice(0, 16)} against ${a.slice(0, 16)}); restoring would discard that work.`; }
    }
    return { id: w.id, name: w.name || w.id, kind: w.kind, state, note,
             modified: w.modified, here: cur?.modified || null,
             scenarios: w.assessment?.SCEN?.length || 0,
             recommendations: (w.recommendations || []).length };
  });
  const orphan = [...here.keys()].filter(id => !(obj.payload.workspaces || []).some(w => w.id === id))
    .map(id => ({ id, name: here.get(id).name || id }));
  return { rows, orphan,
           counts: rows.reduce((c, r) => (c[r.state] = (c[r.state] || 0) + 1, c), {}) };
}

/* ---------------- restoring ---------------- */

/**
 * Write the selected workspaces back.
 *   mode "merge"   — add and update the selected ones, leave everything else alone (the default).
 *   mode "replace" — the installation ends up holding exactly what the backup holds; workspaces not
 *                    in the file are deleted, which the caller must have shown and confirmed.
 */
export async function restore(obj, { ids = null, mode = 'merge', frameworks = true, settings = true } = {}) {
  const wss = (obj.payload.workspaces || []).filter(w => !ids || ids.includes(w.id));
  const done = { workspaces: 0, blobs: 0, deleted: 0, frameworks: 0, settings: false };

  for (const w of wss) { await store.put('ws', w.id, w); done.workspaces++; }

  const keep = new Set(wss.map(w => w.id));
  for (const [k, v] of Object.entries(obj.payload.blob || {})) {
    if (k.startsWith('snap:') && !keep.has(k.slice(5))) continue;
    if (k.startsWith('base:') && !keep.has(k.slice(5))) continue;
    await store.put('blob', k, v); done.blobs++;
  }

  /* 1.5.6 — a teaching case restored from a file is a case being handed out: the state in the file is
     what students reset to. ensureBaseline never overwrites a starting point the file already carried. */
  for (const w of wss) { try { await RESET.ensureBaseline(w); } catch { /* a baseline is a convenience */ } }

  if (mode === 'replace') {
    const all = (await store.all('ws')).filter(Boolean);
    const inFile = new Set((obj.payload.workspaces || []).map(w => w.id));
    for (const w of all) {
      if (inFile.has(w.id)) continue;
      for (const d of w.docs || []) await store.del('blob', 'doc:' + d.id);
      await store.del('blob', 'snap:' + w.id);
      await store.del('blob', 'base:' + w.id);
      await store.del('ws', w.id);
      done.deleted++;
    }
  }

  const m = obj.payload.meta || {};
  if (frameworks && m.frameworks) {
    await store.put('meta', 'frameworks', m.frameworks);
    // The registry caches the packs in memory; without this it would keep serving the pre-restore set.
    FW.reset();
    await FW.load();
    done.frameworks = Object.keys(m.frameworks.packs || {}).length;
  }
  if (settings && m.settings) { await store.put('meta', 'settings', m.settings); done.settings = true; }
  if (settings && m.prefs) await store.put('meta', 'prefs', m.prefs);
  if (settings && m.users) {
    // Never overwrite an active multi-user setup from a file: only an installation still in single-user mode takes it.
    const cur = await store.get('meta', 'users').catch(() => null);
    if (!cur?.enabled) { await store.put('meta', 'users', { ...m.users, enabled: false }); done.users = (m.users.users || []).length; }
  }

  // Make sure the application is pointing at a workspace that still exists.
  const left = (await store.all('ws')).filter(Boolean);
  const cur = await store.get('meta', 'current');
  if (!left.some(w => w.id === cur)) await store.put('meta', 'current', left[0]?.id || null);

  return done;
}

export const filename = () => `crg-backup-${today()}.json`;
