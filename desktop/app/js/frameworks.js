/* frameworks.js — the framework and standards registry (1.5.0).

   Two registers, deliberately distinct:
     • control catalogues — selectable controls, used by Risk mitigation and the Statement of
       Applicability. Bundled packs live in js/data/controls.js; imported packs live in the local
       `meta` store and are merged on top.
     • methods — management systems, risk processes, scoring schemes and quantification models,
       from js/data/methods.js. These are recorded and cited, never "implemented".

   Catalogues are a property of the installation, not of a workspace, so imports are stored once in
   `meta` and shared. A workspace still chooses which frameworks it follows (compliance.frameworks).

   Importing a new edition never silently remaps anything: the diff names what was added, removed,
   renumbered and retitled, and the impact report names every measure and SoA statement pointing at
   a control the new edition no longer has.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';
import { today } from './util.js';

export const PACK_SCHEMA = 'crg-framework-pack/1';
const META_KEY = 'frameworks';
const M = self.CRG_METHODS || { methods: [] };
export const METHODS = [...M.methods];
export const method = id => METHODS.find(m => m.id === id) || null;

/* ---------------- imported packs ---------------- */
let PACKS = null;                       // { [fwId]: pack }, cached after the first read
let LOG = null;                         // [{ at, fw, action, from, to, added, removed, renamed, renumbered }]

export async function load() {
  if (PACKS) return PACKS;
  const rec = (await store.get('meta', META_KEY)) || {};
  PACKS = rec.packs || {};
  LOG = rec.log || [];
  return PACKS;
}
async function save() {
  await store.put('meta', META_KEY, { packs: PACKS, log: LOG });
}
/** Drop the in-memory cache so the next load() re-reads the store. Needed after a restore, which
    writes the packs underneath this module. */
export function reset() { PACKS = null; LOG = null; }
export const packs = () => PACKS || {};
export const log = () => LOG || [];
export const pack = id => (PACKS || {})[id] || null;

/* ---------------- declared-but-not-loaded catalogues ---------------- */
/* Catalogues extracted from the publishers' own documents and shipped with the application, but not
   compiled into controls.js. They are loaded on request rather than automatically, so the register
   always says where a catalogue came from and when it was loaded. The structure line for each is
   verified against the publisher; `bundled` is the file beside index.html that holds the rows. */
export const SHELLS = [
  { id: 'NIST-171', name: 'NIST SP 800-171 — Protecting Controlled Unclassified Information', short: 'SP 800-171',
    edition: 'Revision 3', date: '2024-05-14', origin: 'Declared — import from NIST',
    url: 'https://csrc.nist.gov/pubs/sp/800/171/r3/final',
    structure: '17 security requirement families. 130 identifiers: 97 requirements in force and 33 withdrawn, kept so earlier references still resolve.',
    bundled: 'frameworks/nist-800-171r3.json',
    note: 'Public domain. Extracted from the NIST publication; identifiers and requirement titles only.' },
  { id: 'ITSP-171', name: 'ITSP.10.171 — Protecting specified information in non-Government of Canada systems and organizations', short: 'ITSP.10.171',
    edition: 'Second release', date: '2025-10-28', origin: 'Declared — import from cyber.gc.ca',
    url: 'https://www.cyber.gc.ca/en/guidance/protecting-specified-information-non-government-canada-systems-and-organizations-itsp10171',
    structure: '17 security requirement families. 131 identifiers: 98 requirements in force and 33 not allocated. Every requirement in force in NIST SP 800-171 r3 is present; ITSP adds one, 03.14.09 Dedicated administration workstation.',
    bundled: 'frameworks/itsp-10-171.json',
    note: 'Crown copyright, Government of Canada. Extracted from the publication; identifiers and requirement titles only.' },
  { id: 'COBIT19', name: 'COBIT 2019 — Governance and management objectives', short: 'COBIT 2019',
    edition: '2019', date: '', origin: 'Declared — import from ISACA',
    url: 'https://www.isaca.org/resources/cobit',
    structure: '40 objectives across five domains: EDM 5, APO 14, BAI 11, DSS 6, MEA 4.',
    bundled: 'frameworks/cobit-2019.json',
    note: '© ISACA. Objective identifiers and titles only, from the ISACA objectives workbook.' },
  { id: 'ISO27001A', name: 'ISO/IEC 27001:2022 Annex A', short: 'ISO 27001 Annex A',
    edition: '2022', date: '', origin: 'Alias of ISO/IEC 27002:2022',
    url: 'https://www.iso.org/standard/27001',
    alias: 'ISO22',
    structure: 'Annex A of ISO/IEC 27001:2022 lists the same 93 controls as ISO/IEC 27002:2022.',
    note: 'Not duplicated: select the bundled ISO/IEC 27002:2022 catalogue, whose identifiers are the Annex A identifiers.' },
];

/* ---------------- the register ---------------- */
/** Every control catalogue: bundled, bundled-but-replaced, and imported. */
export function register(bundledFrameworks, bundledCount) {
  const out = [];
  const seen = new Set();
  for (const f of bundledFrameworks) {
    const p = pack(f.id);
    seen.add(f.id);
    out.push({
      id: f.id, name: f.name, short: f.short, note: f.note || '',
      origin: p ? (p.framework.origin || 'Imported') : (f.origin || 'Bundled'),
      edition: p?.framework?.edition || f.edition || '',
      date: p?.framework?.date || f.date || '',
      url: p?.framework?.url || f.url || '',
      count: p ? p.controls.length : (bundledCount(f.id) ?? f.count ?? 0),
      loaded: p?.loaded || null,
      replaced: !!p,
      shell: !p && (f.shell === true),
      method: METHODS.find(m => m.catalogue === f.id)?.id || null,
    });
  }
  for (const sh of SHELLS) {
    if (seen.has(sh.id)) continue;
    const p = pack(sh.id);
    seen.add(sh.id);
    out.push({
      id: sh.id, name: sh.name, short: sh.short, note: sh.note || '',
      origin: p ? (p.framework.origin || 'Imported') : sh.origin, edition: p?.framework?.edition || sh.edition || '',
      date: p?.framework?.date || sh.date || '', url: sh.url || '',
      count: p ? p.controls.length : 0, loaded: p?.loaded || null,
      replaced: !!p, shell: !p, structure: sh.structure || '', alias: sh.alias || null,
      bundled: sh.bundled || null,
      method: METHODS.find(m => m.catalogue === sh.id)?.id || null,
    });
  }
  for (const [id, p] of Object.entries(packs())) {
    if (seen.has(id)) continue;
    out.push({
      id, name: p.framework.name, short: p.framework.short || p.framework.name,
      note: p.framework.note || '', origin: 'Imported',
      edition: p.framework.edition || '', date: p.framework.date || '', url: p.framework.url || '',
      count: p.controls.length, loaded: p.loaded, replaced: false, shell: false,
      method: METHODS.find(m => m.catalogue === id)?.id || null,
    });
  }
  return out;
}

/** Controls contributed by imported packs, in the shape catalog.controls() produces. */
export function importedControls() {
  const out = [];
  for (const [id, p] of Object.entries(packs())) {
    const short = p.framework.short || p.framework.name;
    for (const c of p.controls)
      out.push({ key: id + ':' + c.id, fw: id, fwName: short, id: c.id, title: c.title,
                 grp: c.grp || '', fn: c.fn || 'Prevention', tags: c.tags || [], note: c.note || '', enh: !!c.enh });
  }
  return out;
}

/* ---------------- validation ---------------- */
export function validate(obj) {
  const errs = [];
  if (!obj || typeof obj !== 'object') return ['The file is not a JSON object.'];
  if (obj.schema !== PACK_SCHEMA) errs.push(`Expected schema "${PACK_SCHEMA}", found "${obj.schema ?? 'none'}".`);
  const f = obj.framework;
  if (!f || typeof f !== 'object') errs.push('No "framework" block.');
  else {
    if (!f.id || !/^[A-Za-z0-9._-]{2,24}$/.test(f.id)) errs.push('framework.id must be 2–24 characters, letters, digits, dot, dash or underscore.');
    if (!f.name) errs.push('framework.name is required.');
  }
  if (!Array.isArray(obj.controls) || !obj.controls.length) errs.push('"controls" must be a non-empty array.');
  else {
    const ids = new Set();
    obj.controls.forEach((c, i) => {
      if (!c || !c.id) errs.push(`Control ${i + 1} has no id.`);
      else if (ids.has(c.id)) errs.push(`Duplicate control id "${c.id}".`);
      else ids.add(c.id);
      if (c && c.id && !c.title) errs.push(`Control "${c.id}" has no title.`);
    });
  }
  return errs;
}

/* ---------------- diff ---------------- */
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();

/**
 * Compare the controls currently in the register for a framework with the ones a pack would install.
 * `renumbered` pairs an old id with a new id carrying the same title — the case that silently breaks
 * a Statement of Applicability if it is applied without being shown.
 */
export function diff(currentControls, nextControls) {
  const cur = new Map(currentControls.map(c => [c.id, c]));
  const nxt = new Map(nextControls.map(c => [c.id, c]));
  const added = [], removed = [], retitled = [], renumbered = [], unchanged = [];

  for (const [id, c] of nxt) {
    const was = cur.get(id);
    if (!was) added.push(c);
    else if (norm(was.title) !== norm(c.title)) retitled.push({ id, from: was.title, to: c.title });
    else unchanged.push(c);
  }
  for (const [id, c] of cur) if (!nxt.has(id)) removed.push(c);

  // A removed id whose title reappears under a new id is a renumbering, not a deletion.
  const addedByTitle = new Map();
  for (const c of added) {
    const k = norm(c.title);
    if (!k) continue;
    if (!addedByTitle.has(k)) addedByTitle.set(k, []);
    addedByTitle.get(k).push(c);
  }
  for (let i = removed.length - 1; i >= 0; i--) {
    const cand = addedByTitle.get(norm(removed[i].title));
    if (cand && cand.length) {
      const to = cand.shift();
      renumbered.push({ from: removed[i].id, to: to.id, title: to.title });
      removed.splice(i, 1);
      const ai = added.indexOf(to); if (ai >= 0) added.splice(ai, 1);
    }
  }
  return { added, removed, retitled, renumbered, unchanged,
           counts: { added: added.length, removed: removed.length, retitled: retitled.length,
                     renumbered: renumbered.length, unchanged: unchanged.length } };
}

/**
 * What an import would break. `workspaces` is the full list; each is inspected for measures and
 * Statement-of-Applicability rows pointing at a control key that disappears or moves.
 */
export function impact(fwId, d, workspaces) {
  const gone = new Map();                       // old key → 'removed' | new key
  for (const c of d.removed) gone.set(fwId + ':' + c.id, null);
  for (const r of d.renumbered) gone.set(fwId + ':' + r.from, fwId + ':' + r.to);
  const hits = [];
  for (const ws of workspaces) {
    for (const m of ws.measures || [])
      for (const k of m.ctl || []) if (gone.has(k))
        hits.push({ ws: ws.name, kind: 'measure', ref: m.name || m.id, key: k, moved: gone.get(k) });
    for (const k of Object.keys(ws.compliance?.soa || {})) {
      if (!gone.has(k)) continue;
      const r = ws.compliance.soa[k];
      if (r && (r.status || r.applicable || r.maturity != null || r.owner || r.evidence))
        hits.push({ ws: ws.name, kind: 'statement of applicability', ref: k.split(':')[1], key: k, moved: gone.get(k) });
    }
  }
  return hits;
}

/* ---------------- apply ---------------- */
export async function install(obj, { note = '' } = {}) {
  const errs = validate(obj);
  if (errs.length) throw new Error(errs.join(' '));
  await load();
  const id = obj.framework.id;
  const before = PACKS[id];
  PACKS[id] = {
    framework: obj.framework,
    controls: obj.controls.map(c => ({ id: String(c.id), title: String(c.title), grp: c.grp || '',
                                       fn: c.fn || 'Prevention', tags: Array.isArray(c.tags) ? c.tags : [],
                                       note: c.note || '', enh: !!c.enh })),
    loaded: today(),
  };
  LOG.unshift({ at: new Date().toISOString(), fw: id, action: before ? 'replaced' : 'installed',
                from: before?.framework?.edition || '', to: obj.framework.edition || '',
                count: PACKS[id].controls.length, note });
  await save();
  return PACKS[id];
}

export async function remove(id) {
  await load();
  const p = PACKS[id];
  if (!p) return false;
  delete PACKS[id];
  LOG.unshift({ at: new Date().toISOString(), fw: id, action: 'removed',
                from: p.framework.edition || '', to: '', count: p.controls.length, note: '' });
  await save();
  return true;
}

/** Fetch a pack that ships with the application. No network: it is a file beside index.html. */
export async function fetchBundled(path) {
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${path} could not be read (${r.status}). The file ships with the app; re-extract the archive if it is missing.`);
  return r.json();
}

/* ---------------- parsers ---------------- */
/** NIST OSCAL catalog JSON → pack. Walks groups recursively; control enhancements are flagged. */
export function fromOSCAL(json, framework = {}) {
  const cat = json?.catalog;
  if (!cat) throw new Error('Not an OSCAL catalog: no top-level "catalog" object.');
  const controls = [];
  const walk = (node, grp, parent) => {
    for (const g of node.groups || []) walk(g, [g.id, g.title].filter(Boolean).join(' — '), null);
    for (const c of node.controls || []) {
      const title = c.title || '';
      controls.push({ id: c.id, title, grp: grp || '', fn: 'Prevention', tags: [], enh: !!parent });
      if (c.controls) for (const e of c.controls)
        controls.push({ id: e.id, title: e.title || '', grp: grp || '', fn: 'Prevention', tags: [], enh: true });
    }
  };
  walk(cat, '', null);
  if (!controls.length) throw new Error('The OSCAL catalog contains no controls.');
  return {
    schema: PACK_SCHEMA,
    framework: Object.assign({
      id: framework.id || 'OSCAL',
      name: cat.metadata?.title || framework.name || 'OSCAL catalogue',
      short: framework.short || '',
      edition: cat.metadata?.version || '',
      date: (cat.metadata?.['last-modified'] || '').slice(0, 10),
      origin: 'OSCAL import',
      note: '',
    }, framework),
    controls,
  };
}

/**
 * CSV → pack. Header row required; recognized columns (case- and space-insensitive):
 * id, title, group, function, tags, note, enhancement.
 */
export function fromCSV(rows, framework = {}) {
  if (!rows || rows.length < 2) throw new Error('The CSV needs a header row and at least one control.');
  const head = rows[0].map(h => String(h || '').toLowerCase().replace(/[^a-z]/g, ''));
  const col = (...names) => { for (const n of names) { const i = head.indexOf(n); if (i >= 0) return i; } return -1; };
  const ci = col('id', 'identifier', 'control', 'controlid', 'ref', 'reference');
  const ct = col('title', 'name', 'controltitle', 'description');
  if (ci < 0 || ct < 0) throw new Error('The CSV needs at least an "id" column and a "title" column. Found: ' + rows[0].join(', '));
  const cg = col('group', 'family', 'theme', 'domain', 'category', 'clause');
  const cf = col('function', 'fn');
  const cx = col('tags', 'tag');
  const cn = col('note', 'notes', 'comment');
  const ce = col('enhancement', 'enh', 'isenhancement');
  const controls = [];
  for (const r of rows.slice(1)) {
    const id = String(r[ci] ?? '').trim();
    if (!id) continue;
    controls.push({
      id, title: String(r[ct] ?? '').trim(),
      grp: cg >= 0 ? String(r[cg] ?? '').trim() : '',
      fn: cf >= 0 && r[cf] ? String(r[cf]).trim() : 'Prevention',
      tags: cx >= 0 && r[cx] ? String(r[cx]).split(/[;,|]/).map(s => s.trim()).filter(Boolean) : [],
      note: cn >= 0 ? String(r[cn] ?? '').trim() : '',
      enh: ce >= 0 ? /^(1|true|yes|y)$/i.test(String(r[ce] ?? '').trim()) : false,
    });
  }
  if (!controls.length) throw new Error('No rows with an identifier were found.');
  return { schema: PACK_SCHEMA, framework: Object.assign({ id: 'IMPORT', name: 'Imported catalogue', short: '', edition: '', date: '', origin: 'CSV import', note: '' }, framework), controls };
}
