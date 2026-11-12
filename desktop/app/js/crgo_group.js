/* crgo_group.js — candidate grouping and scenario validation with the CyberRiskGuardian Ontology, offline (1.9.3, CRGO 0.11.2).

   A line-for-line port of CRGO's pipeline/query/grouping.py (contract library-proposal/v1, rules crgo-grouping/1 and
   crgo-validation/1; the rules are written down in CRGO's contracts/library-proposal/v1/README.md). It runs over the
   snapshot shipped with the application (data/crgo-snapshot.json, schema crg-crgo-snapshot/3: the export's "grouping"
   block, and "cluster" / "primary_theme" on every scenario) plus this installation's approved additions (the local
   extension the helper serves), so the MCP server and this port give IDENTICAL answers for identical inputs. Tested
   against CRGO's examples/golden-grouping.json (desktop/tests/t77_ontology_grouping.mjs).

   Determinism, as in the original: integer arithmetic only (5·|A∩B| ≥ 2·|A∪B|, Jaccard compared by cross-multiplying),
   every sort ends on an identifier compared by code point (`<`, never localeCompare), text is NFC-normalised before
   lower-casing, theme regexes run with ASCII semantics (RegExp without the u flag = Python re.ASCII for the patterns
   CRGO ships), group ids are SHA-256 hashes of the sorted member refs, the output is sorted. Library clusters are read
   from the snapshot, NEVER recomputed here. Python's str.strip() and len() are reproduced (pyStrip, cpLen) so that
   edge-case input is treated the same way. No AI, nothing leaves the computer.

   toDescriptor() maps the application's screening candidate (and the Batch draft kept with it) to the CRGO candidate
   descriptor (candidate.schema.json) — see its comment.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { sha256Sync } from './isp.js';

export const ALGORITHM_GROUP = 'crgo-grouping/1';
export const ALGORITHM_VALID = 'crgo-validation/1';
export const CAVEAT = 'Ontology-proposed grouping and findings: suggestions for the analyst, who accepts, edits or rejects them. ' +
  "Library values are calibration priors, not organisational evidence: label them 'Analytical estimate — validation required'.";
export const CANDIDATES_MAX = 200;
export const LIST_MAX = 50;
const CONF_RANK = { H: 0, M: 1, L: 2 };
const ALLOW = { H: ['H'], M: ['H', 'M'], L: ['H', 'M', 'L'] };
const KIND_ORDER = { family: 0, unique: 1, own: 2 };
export const FRAMEWORKS = ['csf2', 'sp800-53r5', 'iso27002-2022'];
const RX_CWE = /^CWE-[0-9]{1,6}$/;
const WS = /[ \t\n\r\f\v ]+/g;
// Python's re `$` also matches before one final newline: reproduced where grouping.py uses re.match with `$`
const RX_REF = /^[A-Za-z0-9][A-Za-z0-9._:\-]{0,39}\n?$/;
const RX_CWE_NUM = /^[0-9]{1,6}\n?$/;

/* ---------------- text (Python semantics) ---------------- */
// str.isspace() characters: what Python's str.strip() removes (JavaScript's trim() differs on \x1c-\x1f, \x85, ﻿)
const PY_SPACE = '\t\n\v\f\r\x1c\x1d\x1e\x1f \x85\xa0                　';
export function pyStrip(s) {
  let a = 0, b = s.length;
  while (a < b && PY_SPACE.includes(s[a])) a++;
  while (b > a && PY_SPACE.includes(s[b - 1])) b--;
  return s.slice(a, b);
}
const cpLen = s => [...s].length;                       // len() counts code points
const isStr = x => typeof x === 'string';
const isObj = x => x !== null && typeof x === 'object' && !Array.isArray(x);
export const nfc = s => String(s ?? '').normalize('NFC');
/** NFC, lower case, runs of white space (space, tab, CR, LF, FF, VT, no-break space) to one space, trimmed. */
export const normText = s => pyStrip(nfc(s).toLowerCase().replace(WS, ' '));
export const baseTechnique = t => t.split('.')[0];
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);                  // code-point order for identifiers and refs
const uniqSorted = xs => [...new Set(xs)].sort(cmp);
const inter = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n; };
const unionSize = (a, b) => { let n = a.size; for (const x of b) if (!a.has(x)) n++; return n; };
const meets = (a, b) => { for (const x of a) if (b.has(x)) return true; return false; };

/** Canonical JSON: keys sorted recursively, no white space, non-ASCII kept (Python json.dumps(sort_keys=True,
 *  separators=(",", ":"), ensure_ascii=False)). */
const sortKeys = v => Array.isArray(v) ? v.map(sortKeys) : isObj(v) ? Object.fromEntries(Object.keys(v).sort(cmp).map(k => [k, sortKeys(v[k])])) : v;
export const canonical = v => JSON.stringify(sortKeys(v));
export const sha256 = s => sha256Sync(s);
export const sha10 = s => sha256(s).slice(0, 10);

/* ---------------- reference data ---------------- */
/** Estimated risk used for ordering only (case-calibrated, case, then 2023 library value, else 0). */
export function riskOf(rec) {
  const e = rec.estimates || {};
  for (const k of ['case_calibrated', 'case', 'library_2023']) {
    const r = (e[k] || {}).risk || {};
    if (r.estimated != null) return Number(r.estimated);
  }
  return 0;
}

export class GroupingError extends Error {
  constructor(code, message, details) { super(message); this.code = code; this.details = details; }
  document() { const d = { error: true, code: this.code, message: this.message }; if (this.details) d.details = this.details; return d; }
}
const valueError = msg => new GroupingError('INVALID_ARGUMENT', 'ValueError: ' + [...msg].slice(0, 300).join(''));

const REFS = new WeakMap();
/** The snapshot (or the export) prepared for grouping and validation; cached per document. */
export function reference(doc) {
  let r = REFS.get(doc);
  if (!r) { r = new Reference(doc); REFS.set(doc, r); }
  return r;
}
/** Is the snapshot able to group (schema /3, or any document carrying the 0.11.2 grouping block)? */
export const usable = doc => !!(doc && doc.grouping && doc.grouping.attack && (doc.scenarios || []).some(s => s.cluster));

export class Reference {
  constructor(doc) {
    const g = doc.grouping;
    if (!g) throw new Error("the snapshot has no 'grouping' block: it needs CRGO 0.11.2 or later (tools/build_crgo.py)");
    this.release = doc.version || doc.release;
    this.values = {};
    for (const k of ['asset_category', 'theme', 'threat_source_type', 'impact_dimension']) this.values[k] = (doc.values || {})[k] || [];
    this.labels = {}; this.lookup = {};
    for (const [k, v] of Object.entries(this.values)) {
      this.labels[k] = Object.fromEntries(v.map(x => [x.key, x.label]));
      this.lookup[k] = Reference._lookup(v);
    }
    this.active = new Set(g.attack.active);
    this.replaced = new Map(Object.entries(g.attack.replaced));
    this.deprecated = new Set(g.attack.deprecated);
    this.cweIds = new Set(g.cwe_ids);
    this.cweBroader = g.cwe_broader;
    this.cweTechniques = g.cwe_techniques;
    STOP_WORDS = Array.isArray(g.stop_words) ? new Set(g.stop_words) : null;   // the export's list (= grouping.STOP)
    this.themeRules = g.theme_rules.map(([k, p]) => [k, new RegExp(p)]);   // no u flag: ASCII \b, as re.ASCII
    this.records = doc.scenarios;
    this.byId = new Map(this.records.map(r => [r.id, r]));
    this.library = this.records.filter(r => r.kind === 'library scenario');
    this._prep = null;
  }
  static _lookup(vals) {
    const m = new Map();
    for (const x of vals) {
      m.set(x.key, x.key);
      const l = normText(x.label); if (!m.has(l)) m.set(l, x.key);
      const k = normText(x.key); if (!m.has(k)) m.set(k, x.key);
    }
    return m;
  }
  /** Vocabulary key for a key (exact) or an English label or key (case-insensitive, NFC); null when unknown. */
  keyOf(kind, value) {
    const v = pyStrip(nfc(value)), lk = this.lookup[kind];
    return lk.get(v) || lk.get(normText(v)) || null;
  }
  successor(t) {
    const seen = new Set();
    while (this.replaced.has(t) && !seen.has(t)) { seen.add(t); t = this.replaced.get(t); }
    return t;
  }
  knownTechnique(t) { return this.active.has(t) || this.replaced.has(t) || this.deprecated.has(t); }
  inferTheme(text) {
    const t = normText(text);
    for (const [k, rx] of this.themeRules) if (rx.test(t)) return k;
    return 'ThemeOther';
  }
  /** Library and local records reduced to what matching needs, for one confidence level (one cache entry). */
  prepared(local, minConf) {
    const key = minConf + '|' + localInfo(local).sha256;
    if (this._prep && this._prep.key === key) return this._prep.out;
    const out = this.library.map(r => this._prepRec(r, 'library', minConf));
    for (const r of [...local].sort((a, b) => cmp(a.id, b.id))) out.push(this._prepRec(r, 'local', minConf));
    out.sort((a, b) => cmp(a.id, b.id));
    this._prep = { key, out };
    return out;
  }
  _prepRec(r, source, minConf) {
    const cats = new Set();
    for (const c of r.asset_categories || []) { const k = this.keyOf('asset_category', c); if (k != null) cats.add(k); }
    const techs = new Set();
    for (const t of r.attack_techniques || []) if (ALLOW[minConf].includes(t.confidence)) techs.add(baseTechnique(this.successor(t.id)));
    return { id: r.id, pt: r.primary_theme, cluster: r.cluster, tok: tokens(r.name || ''), techs, cats, risk: riskOf(r), source, rec: r };
  }
}

let STOP_WORDS = null;
/** Name tokens: [a-z0-9]+ runs of the normalised text, minus the stop words. */
export function tokens(s) {
  const stop = STOP_WORDS || DEFAULT_STOP;
  return new Set((normText(s).match(/[a-z0-9]+/g) || []).filter(w => !stop.has(w)));
}
const DEFAULT_STOP = new Set(['a', 'an', 'and', 'at', 'attack', 'by', 'due', 'for', 'from', 'in', 'of', 'on', 'or', 'risk', 'scenario', 'the', 'through',
  'to', 'via', 'with']);

/* ---------------- candidates ---------------- */
export const CANDIDATE_KEYS = ['ref', 'name', 'statement', 'techniques', 'cwe', 'asset_categories', 'threat_source_types', 'themes', 'crgo_id'];

/** Shape check of a candidate descriptor (candidate.schema.json). Returns a list of messages; empty = valid. */
export function checkCandidate(c, where = 'candidate') {
  const errs = [];
  if (!isObj(c)) return [where + ': must be an object'];
  const extra = Object.keys(c).filter(k => !CANDIDATE_KEYS.includes(k)).sort(cmp);
  if (extra.length) errs.push(`${where}: fields not allowed: ${extra.join(', ')} (no parameters or organisation figures)`);
  if (!isStr(c.ref) || !RX_REF.test(c.ref)) errs.push(`${where}: ref is required, 1-40 characters A-Z a-z 0-9 . _ : - (starting with a letter or digit)`);
  for (const [k, n] of [['name', 300], ['statement', 4000], ['crgo_id', 100]])
    if (k in c && (!isStr(c[k]) || cpLen(c[k]) > n)) errs.push(`${where}: ${k} must be a string of at most ${n} characters`);
  if (!(isStr(c.name) && pyStrip(c.name)) && !(isStr(c.statement) && pyStrip(c.statement))) errs.push(where + ': name or statement is required');
  for (const k of ['techniques', 'cwe', 'asset_categories', 'threat_source_types', 'themes']) {
    if (!(k in c)) continue;
    const v = c[k];
    if (!Array.isArray(v) || v.length > LIST_MAX || !v.every(x => isStr(x) && cpLen(x) <= 100))
      errs.push(`${where}: ${k} must be a list of at most ${LIST_MAX} strings of at most 100 characters`);
  }
  return errs;
}

/** A candidate in CRGO terms: known keys, successor techniques, primary theme (given or inferred). */
export function normalise(c, ref) {
  const name = pyStrip(nfc(c.name ?? '')), statement = pyStrip(nfc(c.statement ?? ''));
  const n = { ref: c.ref, name, statement, crgo_id: pyStrip(nfc(c.crgo_id ?? '')),
    unknown: { asset_categories: [], threat_source_types: [], themes: [] },
    unknown_techniques: [], replaced: {}, deprecated: [], techs_full: [], cwe: [], cwe_unknown: [] };
  for (const [field, kind] of [['asset_categories', 'asset_category'], ['threat_source_types', 'threat_source_type'], ['themes', 'theme']]) {
    const keys = [];
    for (let v of c[field] || []) {
      v = pyStrip(nfc(v));
      if (!v) continue;
      const k = ref.keyOf(kind, v);
      if (k == null) n.unknown[field].push(v);
      else if (!keys.includes(k)) keys.push(k);
    }
    n[field] = keys;
  }
  for (const f of Object.keys(n.unknown)) n.unknown[f] = uniqSorted(n.unknown[f]);
  const full = new Set();
  for (let t of c.techniques || []) {
    t = pyStrip(nfc(t)).toUpperCase();
    if (!t) continue;
    if (!ref.knownTechnique(t)) { n.unknown_techniques.push(t); continue; }
    const s = ref.successor(t);
    if (s !== t) n.replaced[t] = s;
    if (ref.deprecated.has(t) && !ref.replaced.has(t)) n.deprecated.push(t);
    full.add(s);
  }
  n.unknown_techniques = uniqSorted(n.unknown_techniques);
  n.deprecated = uniqSorted(n.deprecated);
  n.techs_full = [...full].sort(cmp);
  n.techs = new Set(n.techs_full.map(baseTechnique));
  for (let w of c.cwe || []) {
    w = pyStrip(nfc(w)).toUpperCase();
    if (!w) continue;
    if (RX_CWE_NUM.test(w)) w = 'CWE-' + w;
    if (RX_CWE.test(w) && ref.cweIds.has(w)) n.cwe.push(w); else n.cwe_unknown.push(w);
  }
  n.cwe = uniqSorted(n.cwe); n.cwe_unknown = uniqSorted(n.cwe_unknown);
  if (n.themes.length) { n.pt = n.themes[0]; n.theme_inferred = false; }
  else { n.pt = ref.inferTheme(name || statement); n.theme_inferred = true; }
  n.theme_set = new Set([...n.themes, n.pt]);
  n.tok = tokens(name || statement);
  n.cats = new Set(n.asset_categories);
  return n;
}

/** True when match a beats match b: near, then Jaccard (cross-multiplied), then facet, then risk, then smaller id. */
function better(a, b) {
  if (a.near !== b.near) return a.near;
  const x = a.inter * b.union, y = b.inter * a.union;
  if (x !== y) return x > y;
  if (a.facet !== b.facet) return a.facet;
  if (a.p.risk !== b.p.risk) return a.p.risk > b.p.risk;
  return a.p.id < b.p.id;
}

/** [prepared record, rule] or [null, null]. rule: kept | near_duplicate | theme_technique_asset. */
export function match(n, ref, prep) {
  const byId = new Map(prep.map(p => [p.id, p]));
  const cid = n.crgo_id;
  if (cid) {
    const r = ref.byId.get(cid);
    let target = cid;
    if (r != null && r.kind === 'case scenario') {
      const fams = (r.refines || []).map(x => x.id).filter(id => byId.has(id)).sort(cmp);
      target = fams.length ? fams[0] : null;
    }
    if (target != null && byId.has(target)) return [byId.get(target), 'kept'];
  }
  let best = null;
  for (const p of prep) {
    const i = inter(n.tok, p.tok), u = Math.max(1, unionSize(n.tok, p.tok));
    const near = p.pt === n.pt && 5 * i >= 2 * u;
    const facet = n.theme_set.has(p.pt) && meets(n.techs, p.techs) && meets(n.cats, p.cats);
    if (!(near || facet)) continue;
    const m = { p, near, facet, inter: i, union: u };
    if (best === null || better(m, best)) best = m;
  }
  if (best === null) return [null, null];
  return [best.p, best.near ? 'near_duplicate' : 'theme_technique_asset'];
}

export function localInfo(local) {
  return { count: local.length, sha256: sha256(canonical([...local].sort((a, b) => cmp(a.id, b.id)))) };
}

function representative(p) {
  const r = p.rec;
  return { id: r.id, name: r.name || '', statement: r.statement || null, themes: (r.themes || []).map(t => t.key), source: p.source };
}

function checkList(candidates) {
  if (!Array.isArray(candidates)) throw valueError('candidates must be a list of candidate objects');
  if (!candidates.length) throw valueError('candidates: at least one candidate is required');
  if (candidates.length > CANDIDATES_MAX)
    throw valueError(`candidates: at most ${CANDIDATES_MAX} per call (received ${candidates.length}); grouping is across candidates, so do not split a screening`);
  const errs = candidates.flatMap((c, i) => checkCandidate(c, `candidates[${i}]`));
  if (errs.length) throw valueError(errs.slice(0, 20).join('; '));
  const refs = candidates.map(c => c.ref), count = new Map();
  for (const r of refs) count.set(r, (count.get(r) || 0) + 1);
  const dup = uniqSorted(refs.filter(r => count.get(r) > 1));
  if (dup.length) throw valueError('candidates: duplicate ref(s): ' + dup.join(', '));
}

const sortedObj = o => Object.fromEntries(Object.entries(o).sort((a, b) => cmp(a[0], b[0])));

/** crgo-grouping/1. Throws GroupingError (INVALID_ARGUMENT) on a bad shape. */
export function group(candidates, ref, local = [], minConfidence = 'M') {
  checkList(candidates);
  local = [...(local || [])];
  const prep = ref.prepared(local, minConfidence);
  const norm = candidates.map(c => normalise(c, ref));
  const matched = new Map(), unmatched = [], members = {};
  for (const n of norm) {
    const [p, rule] = match(n, ref, prep);
    members[n.ref] = { ref: n.ref, match: p ? { id: p.id, rule } : null, primary_theme: n.pt, theme_inferred: n.theme_inferred,
      replaced_techniques: sortedObj(n.replaced) };
    if (p) { if (!matched.has(p.cluster)) matched.set(p.cluster, []); matched.get(p.cluster).push(n.ref); }
    else unmatched.push(n);
  }
  const groups = [];
  const repOf = new Map(prep.map(p => [p.id, p]));
  for (const [cl, refs] of matched)
    groups.push({ cluster_id: cl, kind: refs.length >= 2 ? 'family' : 'unique', representative: repOf.has(cl) ? representative(repOf.get(cl)) : null,
      members: [...refs].sort(cmp).map(r => members[r]), theme_gap: null });
  // unmatched: union-find on (primary theme, a shared base technique, a shared asset category)
  const parent = new Map(unmatched.map(n => [n.ref, n.ref]));
  const find = x => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
  const um = [...unmatched].sort((a, b) => cmp(a.ref, b.ref));
  for (let i = 0; i < um.length; i++) for (const b of um.slice(i + 1)) {
    const a = um[i];
    if (a.pt === b.pt && meets(a.techs, b.techs) && meets(a.cats, b.cats)) {
      const ra = find(a.ref), rb = find(b.ref);
      if (ra !== rb) parent.set(ra > rb ? ra : rb, ra < rb ? ra : rb);
    }
  }
  const comps = new Map();
  for (const n of um) { const r = find(n.ref); if (!comps.has(r)) comps.set(r, []); comps.get(r).push(n); }
  for (const ns of comps.values()) {
    const refs = ns.map(n => n.ref).sort(cmp);
    groups.push({ cluster_id: 'GRP-' + sha10(refs.join('\n')), kind: refs.length >= 2 ? 'family' : 'own', representative: null,
      members: refs.map(r => members[r]), theme_gap: ns[0].pt });
  }
  groups.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || cmp(a.cluster_id, b.cluster_id));
  const out = { algorithm: ALGORITHM_GROUP, release: ref.release, min_confidence: minConfidence, local: localInfo(local), groups,
    theme_gaps: uniqSorted(groups.map(g => g.theme_gap).filter(Boolean)),
    unknown_techniques: uniqSorted(norm.flatMap(n => n.unknown_techniques)) };
  const unk = {};
  for (const f of ['asset_categories', 'threat_source_types', 'themes']) unk[f] = uniqSorted(norm.flatMap(n => n.unknown[f]));
  unk.cwe = uniqSorted(norm.flatMap(n => n.cwe_unknown));
  for (const k of Object.keys(unk)) if (!unk[k].length) delete unk[k];
  if (Object.keys(unk).length) out.unknown_values = unk;
  const ids = uniqSorted(norm.filter(n => n.crgo_id && (members[n.ref].match || {}).rule !== 'kept').map(n => n.crgo_id));
  if (ids.length) out.unknown_crgo_ids = ids;
  out.caveat = CAVEAT;
  return out;
}

/* ---------------- validation ---------------- */
export const MESSAGES = {
  LIBRARY_MATCH: 'Matches CRGO scenario %s (%s).',
  THEME_MATCH_ONLY: 'No CRGO scenario matches; scenarios of the theme %s share a technique or an asset category (theme gap: own scenario).',
  OUTSIDE_ONTOLOGY: 'Outside the ontology: no CRGO scenario matches and no scenario of the theme %s shares a technique or an asset category (own scenario).',
  TECHNIQUE_UNKNOWN: 'ATT&CK technique %s is not in CRGO.',
  TECHNIQUE_REVOKED: 'ATT&CK technique %s is revoked; its successor is %s.',
  TECHNIQUE_DEPRECATED: 'ATT&CK technique %s is deprecated and has no successor.',
  CWE_UNKNOWN: '%s is not in the CWE list CRGO holds.',
  CWE_TECHNIQUE_UNLINKED: 'No technique of the scenario is linked to %s or its parent weaknesses (expected one of: %s).',
  CWE_NO_REFERENCE: 'CRGO has no technique reference for %s or its parent weaknesses: consistency cannot be judged.',
  ASSET_CATEGORY_UNKNOWN: 'Asset category %s is not in the CRGO vocabulary.',
  THREAT_SOURCE_TYPE_UNKNOWN: 'Threat source type %s is not in the CRGO vocabulary.',
  THEME_UNKNOWN: 'Theme %s is not in the CRGO vocabulary.',
  CRGO_ID_UNKNOWN: 'CRGO scenario %s is unknown.',
};
const fmt = (tpl, args) => { let i = 0; return tpl.replace(/%s/g, () => String(args[i++])); };
function finding(code, severity, field, value, args, suggestion) {
  const f = { code, severity, field, value, message: fmt(MESSAGES[code], args) };
  if (suggestion != null) f.suggestion = suggestion;
  return f;
}

/** Base techniques referenced for a CWE and its ancestors (breadth first); null when none has an entry. */
export function cweReference(ref, cwe) {
  const seen = new Set(), queue = [cwe], techs = new Set();
  let found = false;
  while (queue.length) {
    const w = queue.shift();
    if (seen.has(w)) continue;
    seen.add(w);
    if (Object.prototype.hasOwnProperty.call(ref.cweTechniques, w)) { found = true; for (const t of ref.cweTechniques[w]) techs.add(t); }
    queue.push(...[...(ref.cweBroader[w] || [])].sort(cmp));
  }
  return found ? [...techs].sort(cmp) : null;
}

function links(xs, minConf) {
  const out = (xs || []).filter(x => ALLOW[minConf].includes(x.confidence))
    .map(x => ({ id: x.id, title: x.title ?? '', confidence: x.confidence, status: x.status ?? 'proposed' }));
  return out.sort((a, b) => CONF_RANK[a.confidence] - CONF_RANK[b.confidence] || cmp(a.id, b.id));
}

function aggregate(prep, techs, minConf, top = 10) {
  const count = new Map(), titles = new Map();
  const bump = (fw, x) => { const k = fw + '\u0000' + x.id; count.set(k, (count.get(k) || 0) + 1); titles.set(k, x.title ?? ''); };
  for (const p of prep) {
    if (!meets(techs, p.techs)) continue;
    const r = p.rec;
    for (const fw of FRAMEWORKS) for (const x of (r.controls || {})[fw] || []) if (ALLOW[minConf].includes(x.confidence)) bump(fw, x);
    for (const x of r.obligations || []) if (ALLOW[minConf].includes(x.confidence)) bump('obligation', x);
  }
  const topOf = fw => [...count.entries()].filter(([k]) => k.split('\u0000')[0] === fw).map(([k, n]) => [k.split('\u0000')[1], n, k])
    .sort((a, b) => b[1] - a[1] || cmp(a[0], b[0])).slice(0, top).map(([id, n, k]) => ({ id, title: titles.get(k), scenarios: n }));
  return [Object.fromEntries(FRAMEWORKS.map(fw => [fw, topOf(fw)])), topOf('obligation')];
}

const themeMatches = (n, prep) => prep.some(p => p.pt === n.pt && (meets(n.techs, p.techs) || meets(n.cats, p.cats)));

/** crgo-validation/1 for one scenario descriptor (candidate shape, 'ref' optional). Throws GroupingError on a bad shape. */
export function validate(scenario, ref, local = [], minConfidence = 'M') {
  if (isObj(scenario) && !('ref' in scenario)) scenario = { ...scenario, ref: 'scenario' };
  const errs = checkCandidate(scenario, 'scenario');
  if (errs.length) throw valueError(errs.join('; '));
  local = [...(local || [])];
  const prep = ref.prepared(local, minConfidence);
  const n = normalise(scenario, ref);
  const [p, rule] = match(n, ref, prep);
  const themeMatch = !!p || themeMatches(n, prep);
  const F = [];
  if (p) F.push(finding('LIBRARY_MATCH', 'info', 'match', p.id, [p.id, rule]));
  else if (themeMatch) F.push(finding('THEME_MATCH_ONLY', 'info', 'themes', n.pt, [n.pt]));
  else F.push(finding('OUTSIDE_ONTOLOGY', 'attention', 'themes', n.pt, [n.pt]));
  for (const t of n.unknown_techniques) F.push(finding('TECHNIQUE_UNKNOWN', 'attention', 'techniques', t, [t]));
  for (const [t, s] of Object.entries(n.replaced).sort((a, b) => cmp(a[0], b[0]))) F.push(finding('TECHNIQUE_REVOKED', 'attention', 'techniques', t, [t, s], s));
  for (const t of n.deprecated) F.push(finding('TECHNIQUE_DEPRECATED', 'attention', 'techniques', t, [t]));
  for (const w of n.cwe_unknown) F.push(finding('CWE_UNKNOWN', 'attention', 'cwe', w, [w]));
  for (const w of n.cwe) {
    const exp = cweReference(ref, w);
    if (exp === null) F.push(finding('CWE_NO_REFERENCE', 'info', 'cwe', w, [w]));
    else if (n.techs.size && !exp.some(t => n.techs.has(t)))
      F.push(finding('CWE_TECHNIQUE_UNLINKED', 'attention', 'cwe', w, [w, exp.slice(0, 10).join(', ') + (exp.length > 10 ? ' ...' : '')]));
  }
  for (const [field, code] of [['asset_categories', 'ASSET_CATEGORY_UNKNOWN'], ['threat_source_types', 'THREAT_SOURCE_TYPE_UNKNOWN'], ['themes', 'THEME_UNKNOWN']])
    for (const v of n.unknown[field]) F.push(finding(code, 'attention', field, v, [v]));
  if (n.crgo_id && !(p && rule === 'kept')) F.push(finding('CRGO_ID_UNKNOWN', 'attention', 'crgo_id', n.crgo_id, [n.crgo_id]));
  let controls, obligations, basis;
  if (p) {
    const r = p.rec;
    controls = Object.fromEntries(FRAMEWORKS.map(fw => [fw, links((r.controls || {})[fw], minConfidence)]));
    obligations = links(r.obligations, minConfidence); basis = 'match';
  } else if (n.techs.size) {
    [controls, obligations] = aggregate(prep, n.techs, minConfidence); basis = 'techniques';
  } else {
    controls = Object.fromEntries(FRAMEWORKS.map(fw => [fw, []])); obligations = []; basis = 'none';
  }
  const state = !themeMatch ? 'outside_ontology' : F.some(f => f.severity === 'attention') ? 'needs_attention' : 'consistent';
  return { algorithm: ALGORITHM_VALID, release: ref.release, min_confidence: minConfidence, local: localInfo(local),
    state, match: p ? { id: p.id, cluster_id: p.cluster, rule } : null, theme_gap: p ? null : n.pt,
    primary_theme: n.pt, theme_inferred: n.theme_inferred, replaced_techniques: sortedObj(n.replaced),
    findings: F, controls_basis: basis, controls, obligations, caveat: CAVEAT };
}

/* ---------------- the two tools, as the MCP server answers them ---------------- */
function confidence(c) {
  const v = pyStrip(String(c || 'M')).toUpperCase();
  if (!['H', 'M', 'L'].includes(v)) throw new GroupingError('INVALID_ARGUMENT', `min_confidence must be one of H/M/L (received '${v.slice(0, 200)}').`);
  return v;
}
function guarded(fn) {
  try { return fn(); }
  catch (e) {
    if (e instanceof GroupingError) return e.document();
    if (e instanceof TypeError) return { error: true, code: 'INVALID_ARGUMENT', message: 'TypeError: ' + String(e.message).slice(0, 300) };
    throw e;
  }
}
/** crgo_group_candidates over the snapshot (+ local records); returns the result or an error document, never throws on input. */
export function groupTool({ candidates, min_confidence = 'M' } = {}, snap, local = []) {
  return guarded(() => { const ref = reference(snap); return group(candidates, ref, local, confidence(min_confidence)); });
}
/** crgo_validate_scenario over the snapshot (+ local records). */
export function validateTool({ scenario, min_confidence = 'M' } = {}, snap, local = []) {
  return guarded(() => { const ref = reference(snap); return validate(scenario, ref, local, confidence(min_confidence)); });
}

/* ---------------- the application's candidate → CRGO candidate descriptor ---------------- */
/** CRGO threat-source types of the application's threat-source catalogue (js/ontology.js THREAT_SOURCES): insider error →
 *  accidental, non-adversarial events → environmental, every other source adversarial (W5 survey §7.2). */
export const SOURCE_TYPE = { 'insider-err': ['SrcAccidental'], environment: ['SrcEnvironmental'] };
/** CRGO asset categories of the application's asset types (as js/crgo.js TYPE_CAT). */
export const ASSET_TYPE_CAT = { hardware: 'CatEndpoint', server: 'CatInfrastructure', network: 'CatNetwork', application: 'CatApplication', data: 'CatInformation',
  service: 'CatApplication', cloud: 'CatCloud', iot: 'CatOTIoT', supplier: 'CatCloud', people: 'CatPeople', facility: 'CatFacility' };
const pushU = (arr, x) => { if (x && !arr.includes(x)) arr.push(x); };
const clip = (s, n) => [...String(s)].slice(0, n).join('');

/**
 * toDescriptor(candidate, draft?, options?) → a CRGO candidate descriptor (candidate.schema.json): {ref, name, statement?,
 * techniques?, cwe?, asset_categories, threat_source_types, themes?, crgo_id?}. Never a parameter, figure or free-text
 * field outside the schema: what cannot be mapped is left out (grouping then relies on the name and the inferred theme).
 *
 *  candidate  the screening row: an array [id, name, source, vuln, assets, …] (assessment.CANDIDATES) or an object
 *             {id|ref, name, source|threat_source, assets}.
 *  draft      the Batch draft kept on the candidate (js/screening.js draftFromRow): statement, attack, cwe, threat_source,
 *             assets, crgo {id, themes, asset_categories, threat_source_types} — CRGO ids and terms already present win.
 *  options.mapping   an analyst mapping in the shape CRGO's golden file records (`medibec_mapping`):
 *             {assets: {"CJ1 (EHR …)": ["CatApplication", …], "Cloud": ["CatCloud"], …},
 *              threat_sources: {"Negligent insider": ["SrcAccidental"], …, "(any other source)": ["SrcAdversarial"]},
 *              techniques: {"C01": ["T1566"], …}}.
 *             Assets: the free text is split on "/" and ";"; each part is looked up as a key, then by the first word of the
 *             keys (so "CJ5" finds "CJ5 (identity, …)"). Threat source: the whole text as a key, else "(any other source)".
 *             Techniques: by candidate ref, when the draft has none.
 *  options.assets    the workspace's asset register ([{name, type}]): an asset part naming a register entry takes the
 *             CRGO category of its type (ASSET_TYPE_CAT).
 *  options.sources   the threat-source catalogue ([{id, label}], js/ontology.js THREAT_SOURCES): a source text equal to an
 *             entry's id or label takes SOURCE_TYPE (adversarial by default).
 * Without a mapping, parts that are CRGO keys themselves (Cat…, Src…) are kept; nothing is guessed from other free text.
 */
export function toDescriptor(cand, draft = null, { mapping = null, assets = null, sources = null } = {}) {
  const row = Array.isArray(cand) ? { id: cand[0], name: cand[1], source: cand[2], assets: cand[4] } : (cand || {});
  const d = draft || {}, crgo = d.crgo || {};
  const ref = String(row.ref || row.id || '');
  const out = { ref, name: clip(row.name || '', 300) };
  if (d.statement && pyStrip(String(d.statement))) out.statement = clip(d.statement, 4000);
  const techs = (d.attack || []).length ? d.attack : (mapping?.techniques?.[ref] || []);
  if (techs.length) out.techniques = techs.slice(0, LIST_MAX).map(t => clip(t, 100));
  if ((d.cwe || []).length) out.cwe = d.cwe.slice(0, LIST_MAX).map(w => clip(w, 100));
  // asset categories
  let cats = [];
  if ((crgo.asset_categories || []).length) cats = crgo.asset_categories.map(String);
  else {
    const amap = mapping?.assets || {};
    const byFirst = {}; for (const k of Object.keys(amap)) { const w = k.split(' ')[0]; if (!(w in byFirst)) byFirst[w] = amap[k]; }
    const reg = new Map((assets || []).map(a => [String(a.name || '').trim().toLowerCase(), a.type]));
    for (const part of String(row.assets ?? d.assets ?? '').split(/[\/;]/).map(x => x.trim()).filter(Boolean)) {
      const hit = Object.prototype.hasOwnProperty.call(byFirst, part) && part.startsWith('CJ') ? byFirst[part]
        : Object.prototype.hasOwnProperty.call(amap, part) ? amap[part] : null;
      if (hit) { for (const c of hit) pushU(cats, c); continue; }
      const t = reg.get(part.toLowerCase());
      if (t && ASSET_TYPE_CAT[t]) { pushU(cats, ASSET_TYPE_CAT[t]); continue; }
      if (/^Cat[A-Za-z]+$/.test(part)) pushU(cats, part);
    }
  }
  out.asset_categories = cats.slice(0, LIST_MAX);
  // threat-source types
  let ts = [];
  if ((crgo.threat_source_types || []).length) ts = crgo.threat_source_types.map(String);
  else {
    const src = String(row.source ?? row.threat_source ?? d.threat_source ?? '').trim();
    const tmap = mapping?.threat_sources || {};
    const cat = (sources || []).find(s => s.id === src || s.label === src);
    if (Object.prototype.hasOwnProperty.call(tmap, src)) ts = tmap[src].slice();
    else if (cat) ts = (SOURCE_TYPE[cat.id] || ['SrcAdversarial']).slice();
    else if (/^Src[A-Za-z]+$/.test(src)) ts = [src];
    else if (tmap['(any other source)'] && src) ts = tmap['(any other source)'].slice();
    else if (tmap['(any other source)'] && !src) ts = [];
  }
  out.threat_source_types = ts.slice(0, LIST_MAX);
  if ((crgo.themes || []).length) out.themes = crgo.themes.slice(0, LIST_MAX).map(String);
  if (crgo.id) out.crgo_id = clip(crgo.id, 100);
  return out;
}
