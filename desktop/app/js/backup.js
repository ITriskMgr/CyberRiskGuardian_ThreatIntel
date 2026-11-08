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
   What a backup never contains: the knowledge base library (blob "kblib:…", meta "kbLibrary") — texts the
   person attested they hold a licence for, which stay on this computer — and the Virtual consultant's vector
   index (blob "kbvec:…"), which is rebuilt from the sources.

   Restoring never silently overwrites a workspace that has moved on. The plan compares what the file
   holds with what is here and labels every workspace — new, identical, older, or newer-here — so a
   restore from an old file cannot quietly undo a day's work.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { VERSION } from './version.js';
import * as store from './store.js';
import { S, loadAll, exampleWorkspace } from './state.js';
import * as FW from './frameworks.js';
import { today } from './util.js';
import * as RESET from './reset.js';
import * as MIG from './migrate.js';
import { migrate as fillShape } from './state.js';
import * as TEACH from './teaching.js';

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
    if (key.startsWith('premig:')) continue;        // 1.5.8 — pre-migration copies stay on this computer
    if (key.startsWith('kblib:') || key.startsWith('kbvec:')) continue;   // the knowledge base library and vector index stay on this computer
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
    dataVersion: MIG.DATA_VERSION,                 // 1.5.8 — the data version of what the file holds
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
/** A copy that nobody changed since it was created. For a bundled teaching case the assessment, risks, measures,
 *  recommendations, documents and KRI history are compared with a fresh copy of the case; for any other workspace,
 *  no save after the creation minutes and no document or recommendation. */
export function unchangedSinceCreation(w) {
  if (!w) return false;
  const c = TEACH.inferCase(w);
  if (c) {
    try {
      const fresh = fillShape(exampleWorkspace(c));   // the same shape repair a stored copy went through (assetIds, …)
      // 1.9.2 review (H1 test): the stored copy is compared after the same shape repair — a seeded copy that was never
      // saved after a load lacks the fields fillShape adds (assetIds, …) and is not "changed" for that
      const here = fillShape(JSON.parse(JSON.stringify(w)));
      const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
      return same(here.assessment, fresh.assessment) && same(here.risks || [], fresh.risks || []) && same(here.measures || [], fresh.measures || []) && !(w.docs || []).length
        && !(w.recommendations || []).length && !(w.kriHistory || []).length && same(here.org, fresh.org);
    } catch { /* case not installed: fall through */ }
  }
  if (!w.created || !w.modified) return false;
  const cr = Date.parse(w.created), m = Date.parse(w.modified);
  return Number.isFinite(cr) && Number.isFinite(m) && m - cr < 5 * 60 * 1000 && !(w.docs || []).length && !(w.recommendations || []).length;
}
export async function plan(obj) {
  const all = (await store.all('ws')).filter(Boolean);
  const here = new Map(all.map(w => [w.id, w]));
  const rows = (obj.payload.workspaces || []).map(w => {
    const cur = here.get(w.id);
    let state = 'new', note = 'Not present here; it would be added.', twin = null;
    /* 1.9.2 (item 4, NV-036) — a bundled teaching case is recognised whatever its id: the same case already here under
       another id is a twin, and the person chooses Replace / Keep both / Skip (Skip by default). */
    let suggest = null;
    if (!cur) { twin = all.find(x => TEACH.sameCase(x, w)) || null; if (twin) { state = 'teaching-twin'; suggest = unchangedSinceCreation(twin) ? 'replace' : 'skip'; note = `The teaching case ${TEACH.CASE_LABEL[TEACH.inferCase(w)] || w.name} is already here as “${twin.name}” (another id). Choose Replace the copy here${suggest === 'replace' ? ' (it has not been changed since it was created)' : ''}, Keep both, or Skip.`; } }
    if (cur) {
      const a = w.modified || '', b = cur.modified || '';
      if (a === b) { state = 'identical'; note = 'Same modification time; restoring changes nothing.'; }
      else if (a > b) { state = 'older-here'; note = `The backup is newer (${a.slice(0, 16)} against ${b.slice(0, 16)}); restoring brings it forward.`; }
      else { state = 'newer-here'; note = `This browser holds a newer copy (${b.slice(0, 16)} against ${a.slice(0, 16)}); restoring would discard that work.`; }
    }
    // 1.5.8 — a workspace written by a newer release is not restored: this build cannot read it faithfully.
    if (MIG.isNewer(w)) { state = 'newer-format'; note = `Written by a newer release (data version ${MIG.versionOf(w)}; this one reads up to ${MIG.DATA_VERSION}). Update the application to restore it.`; }
    else if (MIG.versionOf(w) < MIG.DATA_VERSION) note += ` It will be brought from data version ${MIG.versionOf(w)} to ${MIG.DATA_VERSION} as it is restored.`;
    return { id: w.id, name: w.name || w.id, kind: w.kind, state, note, dataVersion: MIG.versionOf(w), twin: twin ? { id: twin.id, name: twin.name } : null, suggest,
             teaching: TEACH.inferCase(w), modified: w.modified, here: cur?.modified || twin?.modified || null,
             scenarios: w.assessment?.SCEN?.length || 0,
             recommendations: (w.recommendations || []).length };
  });
  /* 1.9.2 review (H1) — several copies of the same case in one file (two examples, both non-identical to the copy here):
     Replace targets the bundled copy here once; every further row is offered Keep both, never a second Replace that
     would overwrite the first. */
  const seenTwin = new Set();
  for (const r of rows) {
    if (r.state !== 'teaching-twin' || !r.twin) continue;
    if (seenTwin.has(r.twin.id)) { r.suggest = 'keep'; r.note += ' Another workspace in this file already targets that copy: Keep both is suggested (one Replace per copy here).'; }
    seenTwin.add(r.twin.id);
  }
  const twinIds = new Set(rows.map(r => r.twin?.id).filter(Boolean));
  const orphan = [...here.keys()].filter(id => !(obj.payload.workspaces || []).some(w => w.id === id) && !twinIds.has(id))
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
export async function restore(obj, { ids = null, mode = 'merge', frameworks = true, settings = true, twins = {} } = {}) {
  let wss = (obj.payload.workspaces || []).filter(w => !ids || ids.includes(w.id)).map(w => JSON.parse(JSON.stringify(w)));
  const done = { workspaces: 0, blobs: 0, deleted: 0, frameworks: 0, settings: false, replaced: 0, kept: 0, skipped_twins: 0 };
  /* 1.9.2 (item 4) — teaching twins: twins[fileId] = 'replace' (the file's copy takes the twin's id and overwrites it),
     'keep' (both stay, the file's copy under a new id) or 'skip' (the default: the file's copy is not written); or
     { choice, twin } to name the twin the plan showed when several copies of the case are here. */
  const remap = {};   // old blob key id → new id
  done.kept_conflicts = 0;
  if (Object.keys(twins).length) {
    const all = (await store.all('ws')).filter(Boolean);
    const replacedTwins = new Set();
    wss = wss.filter(w => {
      const t = twins[w.id]; if (!t) return true;
      let choice = typeof t === 'string' ? t : t.choice;
      const twin = (t.twin && all.find(x => x.id === t.twin)) || all.find(x => x.id !== w.id && TEACH.sameCase(x, w));
      /* 1.9.2 review (H1): a twin choice is only honoured for a bundled teaching copy (kind "example") on both sides. A
         classroom or organization workspace is never skipped or overwritten through the twin rule: it is written as itself. */
      if (!twin || twin.kind !== 'example' || w.kind !== 'example' || !TEACH.sameCase(twin, w)) return true;
      if (choice === 'skip') { done.skipped_twins++; return false; }
      // one Replace per copy here: a second Replace on the same twin would overwrite the first (last write wins) → Keep both
      if (choice === 'replace' && replacedTwins.has(twin.id)) { choice = 'keep'; done.kept_conflicts++; }
      const oldId = w.id;
      if (choice === 'replace') { remap[oldId] = twin.id; w.id = twin.id; done.replaced++; replacedTwins.add(twin.id); }
      else if (choice === 'keep') { const nid = 'ws-' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); remap[oldId] = nid; w.id = nid; done.kept++; }
      // the CRGO organisation base is derived from the id: a default base follows the new id, a base the person set is kept
      if (w.id !== oldId && (!w.crgo?.base || w.crgo.base === MIG.blankCrgo(oldId).base)) w.crgo = Object.assign(MIG.blankCrgo(w.id), { label: w.crgo?.label || '' });
      return true;
    });
  }

  // 1.5.8 — every restored workspace goes through the data migrations first; a newer one is skipped, and
  // one that fails to migrate is skipped with its reason, never written half-converted.
  done.migrated = 0; done.skipped = [];
  for (let i = wss.length - 1; i >= 0; i--) {
    const r = MIG.migrateWorkspace(wss[i], { fill: fillShape });
    if (r.status === 'newer' || r.status === 'failed') { done.skipped.push({ id: wss[i].id, name: wss[i].name, why: r.status === 'newer' ? 'newer data version' : r.error }); wss.splice(i, 1); continue; }
    if (r.status === 'migrated') done.migrated++;
    wss[i] = r.ws;
  }
  for (const w of wss) { await store.put('ws', w.id, w); done.workspaces++; }

  const keep = new Set(wss.map(w => w.id));
  const rekey = k => { const m = /^(snap|base):(.+)$/.exec(k); return m && remap[m[2]] ? `${m[1]}:${remap[m[2]]}` : k; };
  for (const [k0, v] of Object.entries(obj.payload.blob || {})) {
    const k = rekey(k0);
    if (k.startsWith('snap:') && !keep.has(k.slice(5))) continue;
    if (k.startsWith('base:') && !keep.has(k.slice(5))) continue;
    if (k.startsWith('kblib:') || k.startsWith('kbvec:')) continue;   // never written from a file: the library is added on this computer, with its attestation
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
