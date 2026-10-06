/* reset.js — starting over, at the level the person chooses (1.5.6).

   Two different needs, one engine.

   A student working a teaching case needs to go back to the state the exercise started in, as often
   as they like, without an administrator. That is a RESTORE, not a reset: the starting point is kept
   as a baseline the moment the teaching workspace comes into existence (and an instructor can reset
   that baseline to the current state). It is offered only for a teaching case — kind "example" or
   "classroom" — because for a real organization there is no starting point to go back to, and
   silently rebuilding one would destroy work.

   An administrator working a real organization needs to clear a workspace at a chosen depth. That is
   a SCOPE. Scopes are written as what they KEEP, never as what they delete: a field added in a later
   release is then cleared by a reset instead of quietly surviving it, which is the safe direction. A
   unit test enumerates every field of a fully populated workspace and fails when one of them belongs
   to no group below, so adding a field to the workspace forces a decision here.

   What this module never touches:
     • the stored API keys, unless explicitly asked (they belong to the installation, not a workspace);
     • the framework catalogues, the bundled example snapshot and the AI settings, unless explicitly
       asked (same reason);
     • any other workspace than the one named.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';
import { S, newWorkspace, blankOrg, medibecWorkspace, migrate, refreshList, select, emit } from './state.js';
import { today } from './util.js';

/* ---------------- the fields of a workspace, in groups ---------------- */

/** Never cleared by any scope: without these the record is not a workspace at all. */
export const IDENTITY = ['schema', 'id', 'created'];
/** What the workspace is called and what type it is. */
export const NAMING = ['name', 'kind', 'modified'];
/** The organization itself: who they are, what they are worth, what they may spend. */
export const ORGANIZATION = ['org', 'appetite_rationale', 'crownProv', 'classroom', 'educational',
  'budget', 'budgetYears', 'budgetYear'];
/** Context documents and what was extracted from them as evidence. */
export const DOCUMENTS = ['docs', 'importLog'];
/** The context the assessment is built on — facts about the organization, not conclusions. */
export const CONTEXT = ['assets', 'assetLog', 'assetScoreHist', 'vulns', 'exposureText', 'discoverySeen',
  'compliance', 'safeguards', 'maturity', 'snapshot', 'iocWatch', 'feedNotes', 'feedState', 'feedLog', 'library'];
/** The assessment itself and everything derived from it. */
export const ASSESSMENT = ['excluded', 'decisions', 'measures', 'risks', 'recommendations', 'revisionLog',
  'linkLog', 'linkDraft', 'batchDraft', 'batchSeed', 'batchSpread', 'initPlan', 'published', 'kriHistory'];
/** Key risk indicators as designed (not their measurements, which go with the assessment). */
export const KRI_DEFS = ['kriDefs', 'kriSel', 'kriSelMode'];
/** Who did what in this workspace, in multi-user mode. */
export const AUDIT = ['userAudit'];
/** The record of the resets themselves. Always kept: a workspace should not be able to hide that it
    was cleared, and the entry is three fields long. */
export const JOURNAL = ['resetLog'];

/** Inside ws.assessment, the same split: the parameters of the engine, the context, the output. */
export const A_SETTINGS = ['APPETITE', 'FACTOR', 'CURRENCY', 'PERIOD', 'SOURCE'];
export const A_ORG = ['CROWN'];
export const A_DOCS = ['EVIDENCE'];
export const A_OUTPUT = ['SCEN', 'CANDIDATES', 'INITIATIVES'];
export const A_KRI = ['KRIS'];

/* ---------------- the scopes ---------------- */

/** id, label, what it keeps, one line of plain explanation. Order = increasing severity. */
export const SCOPES = [
  { id: 'assessment', label: 'Reset the assessment, keep the organization',
    keeps: ['ORGANIZATION', 'DOCUMENTS', 'CONTEXT', 'KRI_DEFS', 'AUDIT'],
    what: 'Clears the scenarios, the measures, the recommendations, the risk register and the KRI measurements. The organization profile, the appetite, the crown jewels, the documents, the information assets, the safeguards inventory, the maturity assessment and the KRI definitions stay.' },
  { id: 'context', label: 'Keep the context, drop the assessment',
    keeps: ['ORGANIZATION', 'DOCUMENTS', 'CONTEXT', 'AUDIT'],
    what: 'As above, and the key risk indicators you designed go too. Everything that describes the organization stays: profile, documents, assets, safeguards, maturity, threat context.' },
  { id: 'clean', label: 'A clean slate, same organization details',
    keeps: ['ORGANIZATION', 'DOCUMENTS', 'AUDIT'],
    what: 'Only the organization and its documents stay. The information assets, the safeguards inventory, the maturity assessment, the vulnerability register, the threat context, the compliance work and the whole assessment go — as if the workspace had just been created from these documents.' },
  { id: 'organization', label: 'Remove the organization completely',
    keeps: [],
    what: 'Empties the workspace entirely: the organization profile and every organizational detail, the appetite, the budget, the crown jewels, the documents and their extracted text, and everything built on them. Only the workspace itself and its name remain.' },
];
export const scope = id => SCOPES.find(s => s.id === id) || null;

export const GROUPS = { IDENTITY, NAMING, ORGANIZATION, DOCUMENTS, CONTEXT, ASSESSMENT, KRI_DEFS, AUDIT, JOURNAL };
/** Kept whatever the scope. */
export const ALWAYS = [...IDENTITY, ...NAMING, ...JOURNAL];

/** Every field a scope keeps. */
export function kept(scopeId) {
  const sc = scope(scopeId);
  if (!sc) throw new Error('Unknown reset scope: ' + scopeId);
  const out = new Set(ALWAYS);
  for (const g of sc.keeps) for (const k of GROUPS[g]) out.add(k);
  return out;
}
/** Does this scope keep a whole group? What the warning lines are built from. */
export function keepsGroup(scopeId, group) {
  const sc = scope(scopeId);
  if (!sc) throw new Error('Unknown reset scope: ' + scopeId);
  return sc.keeps.includes(group) || ['IDENTITY', 'NAMING', 'JOURNAL'].includes(group);
}
/** Every field a scope clears, for showing the person what is about to happen. */
export function cleared(scopeId) {
  const keep = kept(scopeId);
  const all = new Set(Object.keys(newWorkspace()));
  for (const g of Object.values(GROUPS)) for (const k of g) all.add(k);
  return [...all].filter(k => !keep.has(k) && k !== 'assessment').sort();
}

/** The options that apply on top of any scope. Everything defaults to the cautious answer. */
export const DEFAULT_OPTS = {
  clearSafeguards: false,    // the inventory of what already protects the organization
  clearMaturity: false,      // the CSF 2.0 maturity and resilience assessment
  clearSnapshot: false,      // the KEV/EPSS threat-context snapshot of this workspace
  keepInstallation: true,    // the bundled example snapshot, the framework catalogues, the AI settings
  keepKeys: true,            // the stored API keys
};

/* ---------------- counting, so the warning can be specific ---------------- */

/** What a workspace currently holds, for the "this will remove…" lines. */
export function contents(ws = S.ws) {
  const a = ws.assessment || {};
  return {
    scenarios: (a.SCEN || []).length,
    candidates: (a.CANDIDATES || []).length,
    risks: (ws.risks || []).length,
    measures: (ws.measures || []).filter(m => m.status !== 'rejected').length,
    recommendations: (ws.recommendations || []).length,
    assets: (ws.assets || []).length,
    safeguards: (ws.safeguards || []).length,
    vulns: (ws.vulns || []).length,
    docs: (ws.docs || []).length,
    kris: (ws.kriDefs || a.KRIS || []).length,
    kriReadings: (ws.kriHistory || []).length,
    maturity: Object.keys(ws.maturity?.scores || {}).length,
    snapshot: ws.snapshot ? 1 : 0,
    crown: (a.CROWN || []).length,
    evidence: (a.EVIDENCE || []).length,
  };
}

/** Lines of plain language: what this scope and these options would remove from this workspace. */
export function preview(scopeId, ws = S.ws, opts = DEFAULT_OPTS) {
  const o = { ...DEFAULT_OPTS, ...opts };
  const c = contents(ws);
  const keep = g => keepsGroup(scopeId, g);
  const lines = [];
  const say = (n, one, many) => { if (n > 0) lines.push(`${n} ${n === 1 ? one : many}`); };

  if (!keep('ASSESSMENT')) {
    say(c.scenarios, 'scenario', 'scenarios');
    say(c.candidates, 'candidate scenario', 'candidate scenarios');
    say(c.measures, 'mitigation measure', 'mitigation measures');
    say(c.recommendations, 'recommendation', 'recommendations');
    say(c.risks, 'risk in the risk register', 'risks in the risk register');
    say(c.kriReadings, 'KRI measurement', 'KRI measurements');
  }
  if (!keep('KRI_DEFS')) say(c.kris, 'key risk indicator', 'key risk indicators');
  if (!keep('CONTEXT')) {
    say(c.assets, 'information asset', 'information assets');
    say(c.vulns, 'entry in the vulnerability register', 'entries in the vulnerability register');
  }
  if (!keep('CONTEXT') || o.clearSafeguards) say(c.safeguards, 'safeguard in the inventory', 'safeguards in the inventory');
  if ((!keep('CONTEXT') || o.clearMaturity) && c.maturity) lines.push('the maturity and resilience assessment');
  if ((!keep('CONTEXT') || o.clearSnapshot) && c.snapshot) lines.push('the threat-context snapshot');
  if (!keep('DOCUMENTS')) {
    say(c.docs, 'context document (and its extracted text)', 'context documents (and their extracted text)');
    say(c.evidence, 'piece of extracted evidence', 'pieces of extracted evidence');
  }
  if (!keep('ORGANIZATION')) {
    lines.push('the organization profile and every organizational detail');
    say(c.crown, 'crown jewel', 'crown jewels');
    lines.push('the risk appetite and its rationale, and the budget years');
  }
  if (!o.keepKeys) lines.push('every API key stored by the helper');
  if (!o.keepInstallation) lines.push('the imported framework catalogues, the bundled example snapshot and the AI settings of this installation');
  return lines;
}

/* ---------------- performing a scope reset ---------------- */

/** Clear ws in place: keep the scope's fields, put every other field back to its factory value. */
export function apply(ws, scopeId, opts = DEFAULT_OPTS) {
  const o = { ...DEFAULT_OPTS, ...opts };
  const keep = kept(scopeId);
  const def = newWorkspace({ name: ws.name, kind: ws.kind });

  for (const k of Object.keys({ ...ws, ...def })) {
    if (k === 'assessment' || keep.has(k)) continue;
    if (k in def) ws[k] = structuredClone(def[k]);
    else delete ws[k];                       // a field this build does not know: a reset removes it
  }

  const a = (ws.assessment ||= {});
  const dA = def.assessment;
  const keepA = new Set([...A_SETTINGS,
    ...(keepsGroup(scopeId, 'ORGANIZATION') ? A_ORG : []),
    ...(keepsGroup(scopeId, 'DOCUMENTS') ? A_DOCS : []),
    ...(keepsGroup(scopeId, 'KRI_DEFS') ? A_KRI : [])]);
  for (const k of Object.keys({ ...a, ...dA })) {
    if (keepA.has(k)) continue;
    if (k in dA) a[k] = structuredClone(dA[k]);
    else delete a[k];
  }
  if (!keepsGroup(scopeId, 'ORGANIZATION')) {
    /* newWorkspace() copies the workspace name into the profile name, which is right when a workspace
       is created and wrong here: this scope exists to remove the organizational details. */
    ws.org = blankOrg();
    a.APPETITE = dA.APPETITE;
    ws.appetite_rationale = '';
  }

  // the options, on top of the scope
  if (o.clearSafeguards) ws.safeguards = [];
  if (o.clearMaturity) ws.maturity = null;
  if (o.clearSnapshot) ws.snapshot = null;

  ws.modified = new Date().toISOString();
  migrate(ws);                               // rebuild the invariants (budget years, arrays, defaults)
  return ws;
}

/** The blobs that must go with a scope: document text and the snapshot live outside the record. */
export function blobsToDelete(ws, scopeId, opts = DEFAULT_OPTS) {
  const o = { ...DEFAULT_OPTS, ...opts };
  const out = [];
  if (!keepsGroup(scopeId, 'DOCUMENTS')) for (const d of (ws.docs || [])) out.push('doc:' + d.id);
  if (!keepsGroup(scopeId, 'CONTEXT') || o.clearSnapshot) out.push('snap:' + ws.id);
  return out;
}

/** Reset one workspace. Returns what was done, for the audit entry and the message. */
export async function run(wsId, scopeId, opts = DEFAULT_OPTS) {
  const o = { ...DEFAULT_OPTS, ...opts };
  const ws = (S.ws?.id === wsId ? S.ws : await store.get('ws', wsId));
  if (!ws) throw new Error('That workspace no longer exists.');
  const sc = scope(scopeId);
  const before = contents(ws);
  const blobs = blobsToDelete(ws, scopeId, o);

  apply(ws, scopeId, o);
  const chosen = Object.keys(DEFAULT_OPTS).filter(k => o[k] !== DEFAULT_OPTS[k]);
  (ws.resetLog ||= []).unshift({ date: today(), scope: scopeId, label: sc.label, ...(chosen.length ? { options: chosen } : {}) });
  ws.resetLog = ws.resetLog.slice(0, 50);

  for (const b of blobs) await store.del('blob', b);
  await store.put('ws', ws.id, ws);
  if (S.ws?.id === ws.id && (!keepsGroup(scopeId, 'CONTEXT') || o.clearSnapshot)) S.snap = null;
  await refreshList();
  if (S.ws?.id === ws.id) await select(ws.id); else emit('workspace');
  return { scope: scopeId, label: sc.label, before, after: contents(ws), blobs };
}

/* ---------------- teaching cases: the starting point ---------------- */

export const TEACHING_KINDS = ['example', 'classroom'];
/** Only a teaching case may be restored to a starting point. A real organization has none. */
export const isTeaching = (ws = S.ws) => !!ws && TEACHING_KINDS.includes(ws.kind);
const baseKey = id => 'base:' + id;

/** Is there something to go back to, and where does it come from? */
export async function startingPoint(ws = S.ws) {
  if (!isTeaching(ws)) return { available: false, why: 'not-teaching' };
  const rec = await store.get('blob', baseKey(ws.id)).catch(() => null);
  if (rec?.ws) return { available: true, source: 'baseline', captured: rec.captured, docs: (rec.docs || []).length };
  if (ws.kind === 'example') return { available: true, source: 'bundled', captured: null, docs: 0 };
  return { available: false, why: 'none-recorded' };
}

/** Record the current state as the starting point of the exercise (an instructor's action, and what
    happens automatically when a teaching workspace is created or imported). */
export async function captureBaseline(ws = S.ws) {
  if (!isTeaching(ws)) throw new Error('Only a teaching case has a starting point.');
  const docs = [];
  for (const d of (ws.docs || [])) {
    const text = await store.get('blob', 'doc:' + d.id).catch(() => null);
    if (text != null) docs.push({ id: d.id, text });
  }
  const rec = { captured: new Date().toISOString(), ws: structuredClone(ws), docs };
  await store.put('blob', baseKey(ws.id), rec);
  return { captured: rec.captured, docs: docs.length };
}

/** Forget the recorded starting point (so a classroom workspace stops offering the student reset). */
export const forgetBaseline = id => store.del('blob', baseKey(id));

/** Put a teaching workspace back to its starting point. The id, the name and the type never change,
    so the workspace the student is in is the workspace they keep. */
export async function restoreTeaching(wsId, { keepName = true } = {}) {
  const live = (S.ws?.id === wsId ? S.ws : await store.get('ws', wsId));
  if (!live) throw new Error('That workspace no longer exists.');
  if (!isTeaching(live)) throw new Error('Only a teaching case can be reset to its starting point.');
  const sp = await startingPoint(live);
  if (!sp.available) {
    throw new Error('No starting point was recorded for this case, so there is nothing to go back to. ' +
      'An instructor can set one with “Set the current state as the starting point”, or restore the case from the file it was handed out in.');
  }

  const name = live.name, kind = live.kind, created = live.created, id = live.id;
  let fresh;
  if (sp.source === 'bundled') {
    fresh = medibecWorkspace();
    for (const d of (live.docs || [])) await store.del('blob', 'doc:' + d.id);
  } else {
    const rec = await store.get('blob', baseKey(id));
    fresh = structuredClone(rec.ws);
    const keepDocs = new Set((fresh.docs || []).map(d => d.id));
    for (const d of (live.docs || [])) if (!keepDocs.has(d.id)) await store.del('blob', 'doc:' + d.id);
    for (const d of (rec.docs || [])) await store.put('blob', 'doc:' + d.id, d.text);
  }
  await store.del('blob', 'snap:' + id);

  fresh.id = id; fresh.created = created; fresh.kind = kind;
  if (keepName) fresh.name = name;
  fresh.modified = new Date().toISOString();
  (fresh.resetLog ||= []).unshift({ date: today(), scope: 'teaching', label: 'Back to the starting point', source: sp.source });
  migrate(fresh);

  await store.put('ws', id, fresh);
  await refreshList();
  /* select() saves the workspace in memory before loading the one asked for, so the stale object has
     to go first: otherwise it is written straight back over the record just restored. */
  if (S.ws?.id === id) { S.ws = null; S.snap = null; await select(id); } else emit('workspace');
  return { source: sp.source, captured: sp.captured || null, name: fresh.name };
}

/** One teaching workspace being created or imported: record where it started, once.
    Never overwrites an existing baseline — a student's reset must not become "back to last week". */
export async function ensureBaseline(ws) {
  if (!isTeaching(ws)) return null;
  if (ws.kind === 'example') return null;                       // rebuilt from the bundled source
  const have = await store.get('blob', baseKey(ws.id)).catch(() => null);
  if (have?.ws) return null;
  return captureBaseline(ws);
}
