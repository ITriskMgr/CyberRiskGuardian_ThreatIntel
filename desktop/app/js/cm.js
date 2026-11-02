/* cm.js — Configuration management: the model behind the optional module (workspace field `cm`).

   Four population-level registers — versioned configuration baselines (promoted from the asset register's
   baseline fields), configuration scopes, deviations by drift class with their exceptions (shared.exceptions; an
   expired exception never counts) and configuration changes — counts per scope or change type, never a secret.
   From them: three automatic KRIs (CRG-22, CRG-24 and CRG-25), finding rules IR-11 to IR-15 (and IR-16 for its
   stale or conflicting rows), proposals for the CSF 2.0 category PR.PS and the configuration rows of the
   statement of applicability, and links to scenarios as evidence. A change to Pb(ψ,A) or θ is only ever
   proposed. The shared machinery is in regcore.js.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, touch } from './state.js';
import { today } from './util.js';
import * as C from './regcore.js';
import * as SH from './shared.js';
import * as MOD from './modules.js';

export { BL_KINDS, V_STATES, DRIFT, SEVERITY, DV_STATES, CH_TYPES, STATUS, CONF, TAGS, PARAMS, REGISTERS, blankRow, blankVersion, validate, guardText, guardRow,
  rowStale, staleDate, isNum, rowLabel, rowOf, link, propose, dismiss, applyPrefill, tokenCount, tableRows, sha256, nextIdReg, caseOf, caseLang, status, setOverride, daysBetween } from './regcore.js';

export const ID = 'cm';
export const LABEL = 'Configuration management';
export const REGISTER_KEYS = ['baselines', 'ciScopes', 'deviations', 'changes'];
export const blankSettings = () => ({ asOf: null, staleDays: 90 });
export const blank = () => ({ settings: blankSettings(), baselines: [], ciScopes: [], deviations: [], changes: [], findings: [], imports: [] });
export const on = () => MOD.enabled(ID);
// read through the namespace at call time (no top-level destructuring: the import cycle via state.js may not have evaluated regcore.js yet)
const isNum = v => C.isNum(v), sum = (r, f) => C.sum(r, f), fixed = x => C.fixed(x), rowStale = (k, r, w) => C.rowStale(k, r, w), daysBetween = (a, b) => C.daysBetween(a, b);

/* ---------------- CRGO alignment ----------------
   Filled from CRGO 0.11.0 (docs/crg-brief-0.11.0.md; every 0.11 term is *proposed* until the CRGO project owner
   approves it in src/approvals.tsv). A release build fails if a placeholder ever comes back
   (tools/crgo_tbd_check.py --release). */
const CRGO_NS = 'https://w3id.org/crgo/';
const T = (n, sup, status = 'proposed') => ({ iri: CRGO_NS + n, sup, status });
/** The CRGO release the identifiers come from. */
export const CRGO_RELEASE = '0.11.0';
export const CRGO = {
  SecurityBaseline: T('CRGO_0000501', 'cco:ont00000965', 'approved'), // configuration baseline (existing, approved term)
  BaselineVersion: T('CRGO_0001374', 'CRGO_0000886'),               // baseline version ⊑ directive version (of a CRGO_0000501)
  ConfigurationDrift: T('CRGO_0001377', 'cco:ont00000853'),         // baseline deviation (a description, with a drift class)
  ConfigurationFinding: T('CRGO_0001367', 'CRGO_0000018'),          // configuration finding ⊑ control gap finding
  // CRGO 0.11 has no narrower misconfiguration class: a misconfiguration is recorded as a vulnerability (existing term)
  Misconfiguration: T('CRGO_0000016', 'CRGO_0000016', 'approved'),
  ConfigurationException: T('CRGO_0000502', 'CRGO_0000502', 'approved'), // policy exception (existing term)
  RegisterRecord: T('CRGO_0000036', 'CRGO_0000036', 'approved'),    // evidence register entry (existing term)
  // drift classes: values of the value set drift class CRGO_0001453 (scheme CRGO_0001454)
  'drift:degradation': T('CRGO_0001455', 'CRGO_0001453'), 'drift:functional': T('CRGO_0001456', 'CRGO_0001453'),
  'drift:transitional': T('CRGO_0001457', 'CRGO_0001453'), 'drift:compensated': T('CRGO_0001458', 'CRGO_0001453'),
  'drift:strengthening': T('CRGO_0001459', 'CRGO_0001453'), 'drift:unknown': T('CRGO_0001460', 'CRGO_0001453'),
  // the indicators: values of the value set identity and configuration indicator CRGO_0001467
  'CRG-22': T('CRGO_0001474', 'CRGO_0001467'), 'CRG-24': T('CRGO_0001476', 'CRGO_0001467'),
  'CRG-25': T('CRGO_0001475', 'CRGO_0001467'),                      // known configuration coverage
  // an accepted proposal is an existing decision record
  AcceptedProposal: T('CRGO_0000504', 'CRGO_0000504', 'approved'),
};
/** The CRGO concepts still waiting for a CRGO identifier (none since CRGO 0.11.0). */
export const crgoPending = () => Object.entries(CRGO).filter(([, v]) => !/\/CRGO_\d{7}$/.test(v.iri)).map(([k]) => k);
/** The CRGO concepts whose 0.11 term is still proposed (awaiting the CRGO project owner's approval). */
export const crgoProposed = () => Object.entries(CRGO).filter(([, v]) => v.status === 'proposed').map(([k]) => k);

/** CIS Controls v8.1 used by the module: identifiers with the author's own short labels (no CIS text). */
export const CIS = [['CIS 4', 'Keep enterprise assets and software securely configured']];
export const CIS_SAFEGUARDS = ['4.1', '4.7'];

/** The existing maturity and statement-of-applicability keys the module speaks to (no resilience question). */
export const CONTROLS = {
  categories: ['PR.PS'],
  questions: [],
  soa: ['ISO22:8.9', 'ISO22:8.32', 'CSF2:PR.PS-01', 'CIS81:CIS 4'],
};

/* ---------------- baselines ---------------- */
/** SHA-256 (hex) of a string, synchronous (small, standard; used for the frozen baseline versions). */
export function sha256Hex(str) {
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const bytes = new TextEncoder().encode(str), l = bytes.length, n = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(n);
  m.set(bytes); m[l] = 0x80; const dv = new DataView(m.buffer); dv.setUint32(n - 4, l * 8 >>> 0); dv.setUint32(n - 8, Math.floor(l / 0x20000000));
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], W = new Uint32Array(64);
  const r = (x, k) => (x >>> k) | (x << (32 - k));
  for (let o = 0; o < n; o += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) { const a = W[i - 15], b = W[i - 2]; W[i] = (W[i - 16] + (r(a, 7) ^ r(a, 18) ^ (a >>> 3)) + W[i - 7] + (r(b, 17) ^ r(b, 19) ^ (b >>> 10))) >>> 0; }
    let [a, b, c, d2, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) >>> 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      h = g; g = f; f = e; e = (d2 + t1) >>> 0; d2 = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d2) >>> 0; H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return H.map(x => x.toString(16).padStart(8, '0')).join('');
}
/** The canonical JSON of a version without its hash (keys sorted). */
export const canonical = x => Array.isArray(x) ? '[' + x.map(canonical).join(',') + ']' : x && typeof x === 'object'
  ? '{' + Object.keys(x).filter(k => k !== 'hash').sort().map(k => JSON.stringify(k) + ':' + canonical(x[k])).join(',') + '}' : JSON.stringify(x ?? null);
/** SHA-256 of a version's canonical JSON without its hash. */
export const versionHash = v => sha256Hex(canonical(v));
export const latestVersion = bl => (bl?.versions || [])[(bl?.versions || []).length - 1] || null;
export const approvedVersion = bl => (bl?.versions || []).filter(v => v.state === 'approved').pop() || null;
/** "New version" copies the latest as a draft. */
export function newVersion(bl) {
  const last = latestVersion(bl);
  const n = String(last?.v || '1.0').match(/^(\d+)\.(\d+)$/);
  const v = n ? `${n[1]}.${Number(n[2]) + 1}` : (last?.v || '1') + '+';
  const nv = { ...C.blankVersion(v), rationale: last?.rationale || '', applicability: JSON.parse(JSON.stringify(last?.applicability || { assetTypes: [], note: '' })) };
  bl.versions.push(nv);
  return nv;
}
/** Approve a draft: needs approvedBy; sets approved and hash; the previous approved version is superseded. */
export function approve(bl, ver, approvedBy) {
  if (!String(approvedBy || '').trim()) throw new Error('Approval needs the name of the approver.');
  if (ver.state !== 'draft') throw new Error('Only a draft version can be approved.');
  for (const v of bl.versions) if (v !== ver && v.state === 'approved') v.state = 'superseded';
  ver.state = 'approved'; ver.approvedBy = approvedBy.trim(); ver.approved = today(); ver.effective ||= ver.approved;
  ver.hash = versionHash(ver);
  return ver;
}
/** Kind inferred from a baseline name (the asset register's list). */
export const kindOfName = name => /^CIS Benchmark/i.test(name) ? 'cis-benchmark' : /DISA STIG/i.test(name) ? 'stig' : /Vendor hardening guide/i.test(name) ? 'vendor' : 'internal';

/* ---------------- configuration scopes ---------------- */
/** A scope's four counts; a scope built from Information assets is counted live. */
export function scopeCounts(cs, ws = S.ws) {
  if (!cs.fromAssets) return { inScope: cs.inScope, assigned: cs.assigned, assessed: cs.assessed, compliant: cs.compliant };
  const types = cs.assetTypes || [];
  const A = (ws.assets || []).filter(a => a.lifecycle?.stage !== 'disposed' && (!types.length || types.includes(a.type)));
  const linked = A.filter(a => a.baseline?.name);
  return { inScope: A.length, assigned: linked.length, assessed: linked.filter(a => ['compliant', 'drift'].includes(a.baseline?.status)).length,
    compliant: linked.filter(a => a.baseline?.status === 'compliant').length };
}
const baselineOf = (id, ws) => reg(ws).baselines.find(b => b.id === id) || null;
/** The state of the baseline version a scope or deviation points at. */
export function versionState(blId, v, ws = S.ws) {
  const bl = baselineOf(blId, ws); if (!bl) return null;
  const ver = (bl.versions || []).find(x => x.v === v) || approvedVersion(bl) || latestVersion(bl);
  return ver?.state || null;
}

/* ---------------- KRIs ---------------- */
export const KRIS = [
  { id: 'CRG-22', name: 'Baseline assignment coverage', unit: '%', dir: 'up', target: 95, warn: 95, crit: 80, risk: 'Unmanaged configuration', method: '100 × Σ assigned ÷ Σ in scope (draft versions do not count)', fmt: 2, module: ID },
  { id: 'CRG-24', name: 'Expired exceptions', unit: 'count', dir: 'down', target: 0, warn: 1, crit: 1, risk: 'Deviations relying on an expired exception', method: 'Expired exceptions concerning a deviation or baseline, or cited by an open deviation', fmt: 0, module: ID },
  { id: 'CRG-25', name: 'Configuration data known coverage', unit: '%', dir: 'up', target: 95, warn: 90, crit: 70, risk: 'Decisions made on unknown configuration data', method: '100 × required configuration values known and fresh ÷ required values', fmt: 2, module: ID },
];
export const KRI_IDS = KRIS.map(k => k.id);

/** The three values with their basis: { values, meta, asOf }. */
export function kri(ws = S.ws) {
  const R = reg(ws), at = asOf(ws);
  const { values, meta, put } = C.collector();
  // CRG-22
  {
    const CS = R.ciScopes; let legacy = 0, unknown = 0, stale = 0, assigned = 0, inScope = 0, denKnown = 0;
    for (const cs of CS) {
      const c = scopeCounts(cs, ws);
      if (!isNum(c.inScope)) { unknown++; continue; }
      inScope += c.inScope; denKnown++;
      const vs = cs.fromAssets ? null : versionState(cs.baseline, cs.version, ws);
      if (!isNum(c.assigned)) unknown++;
      else if (vs !== 'draft') { assigned += c.assigned; if (vs === 'legacy') legacy += c.assigned; }
      if (rowStale('ciScopes', cs, ws)) stale++;
    }
    put('CRG-22', assigned, inScope, { empty: !CS.length, denKnown, unknown, stale, more: { legacy } });
  }
  // CRG-24
  {
    const x = expiredExceptions(ws, at);
    const relevant = R.deviations.length || x.related;
    const any = REGISTER_KEYS.some(rk => R[rk].length);
    values['CRG-24'] = relevant ? x.expired.length : null;
    meta['CRG-24'] = { num: x.expired.length, den: null, unknown: 0, stale: 0, na: !relevant && any, empty: !any, ids: x.expired.map(e => e.id) };
  }
  // CRG-25
  {
    const k = known(ws);
    put('CRG-25', k.known, k.required, { empty: !k.rows, more: { staleValues: k.staleValues } });
  }
  return { values, meta, asOf: at };
}
/** CRG-25: required configuration values known and fresh — the four counts and the as-of date of each scope. */
export function known(ws = S.ws) {
  const R = reg(ws);
  let required = 0, k = 0, staleValues = 0, rows = 0;
  for (const r of R.ciScopes) {
    rows++; const c = scopeCounts(r, ws);
    for (const f of ['inScope', 'assigned', 'assessed', 'compliant']) { required++; if (isNum(c[f])) k++; }
    required++; if (rowStale('ciScopes', r, ws)) staleValues++; else k++;
  }
  return { required, known: k, staleValues, rows };
}
/** Exceptions that have expired and concern the module (a deviation or a baseline, or cited by an open deviation). */
export function expiredExceptions(ws = S.ws, at = asOf(ws)) {
  const R = reg(ws), X = SH.exceptions(ws);
  const cited = new Set(R.deviations.filter(v => v.state !== 'closed' && v.exception).map(v => v.exception));
  const concerns = x => (x.concerns || []).some(l => l.kind === 'deviation' || l.kind === 'baseline') || cited.has(x.id);
  const related = X.filter(concerns);
  return { expired: related.filter(x => SH.exceptionExpired(x, at)), related: related.length };
}

/* ---------------- overview figures ---------------- */
export function figures(ws = S.ws) {
  const R = reg(ws), at = asOf(ws);
  const highOpen = R.deviations.filter(v => v.state !== 'closed' && v.severity === 'high').map(v => ({ id: v.id, age: v.opened ? daysBetween(v.opened, at) : null }));
  const ch = R.changes.filter(r => isNum(r.count));
  const chCount = sum(ch, r => r.count), chVer = sum(ch, r => isNum(r.verified) ? r.verified : 0);
  let assessed = 0, compliant = 0, assigned = 0;
  for (const cs of R.ciScopes) { const c = scopeCounts(cs, ws); if (isNum(c.assessed)) assessed += c.assessed; if (isNum(c.compliant)) compliant += c.compliant; if (isNum(c.assigned)) assigned += c.assigned; }
  return {
    highOpen,
    changesVerified: chCount > 0 ? fixed(100 * chVer / chCount) : null, changes: chCount,
    adherence: assessed > 0 ? fixed(100 * compliant / assessed) : null, unassessed: assigned > 0 ? fixed(100 * (1 - assessed / assigned)) : null,
  };
}

/* ---------------- finding rules ---------------- */
export const RULES = [
  { id: 'IR-11', register: 'deviations', severity: 'high', param: 'Pbx', dir: '↑', title: 'Open high-severity configuration degradation' },
  { id: 'IR-12', register: 'deviations', severity: 'high', param: 'Pbx', dir: '↑', title: 'Deviation compensated by an expired exception' },
  { id: 'IR-13', register: 'changes', severity: 'high', param: 'Pbx', dir: '↑', title: 'Suspected unauthorized configuration changes' },
  { id: 'IR-14', register: 'changes', severity: 'medium', param: 'Th', dir: '↓', title: 'Emergency changes not verified' },
  { id: 'IR-15', register: 'ciScopes', severity: 'low', param: null, dir: '', title: 'Assigned baseline is only legacy or draft' },
  { id: 'IR-16', register: '*', severity: 'low', param: null, dir: '', title: 'Stale or conflicting register row' },
];
export const RULE = Object.fromEntries(RULES.map(r => [r.id, r]));
const lt = (a, b) => isNum(b) && (!isNum(a) || a < b);
function deriveInto(ws, add) {
  const R = reg(ws), at = asOf(ws);
  const X = SH.exceptions(ws);
  for (const r of R.deviations) {
    if (r.state !== 'closed' && r.severity === 'high' && r.cls === 'degradation') add('IR-11', 'deviations', r);
    if (r.cls === 'compensated' && r.exception) { const x = X.find(e => e.id === r.exception); if (x && SH.exceptionExpired(x, at)) add('IR-12', 'deviations', r); }
  }
  for (const r of R.changes) {
    if (r.type === 'unauthorized_suspected' && isNum(r.count) && r.count > 0) add('IR-13', 'changes', r);
    if (r.type === 'emergency' && isNum(r.count) && lt(r.verified, r.count)) add('IR-14', 'changes', r);
  }
  for (const r of R.ciScopes) {
    if (r.fromAssets || !r.baseline) continue;
    const bl = baselineOf(r.baseline, ws);
    if (bl && !(bl.versions || []).some(v => v.state === 'approved')) add('IR-15', 'ciScopes', r);
  }
  for (const k of ['ciScopes', 'deviations', 'changes']) for (const r of R[k]) if (r.status === 'conflicting' || rowStale(k, r, ws)) add('IR-16', k, r);
}

/* ---------------- maturity and statement of applicability ---------------- */
/** Proposals for EMPTY cells only: { kind: category|soa, key, value, current, rationale }. */
export function prefill(ws = S.ws) {
  const R = reg(ws), K = kri(ws), v = K.values, m = K.meta, out = [];
  const eids = [...new Set(R.findings.map(f => f.eid).filter(Boolean))];
  const cite = eids.length ? ' ' + eids.join(', ') + '.' : '';
  const scores = ws.maturity?.scores || {};
  const F = figures(ws);
  // CSF 2.0 category PR.PS (capped at 3)
  {
    const assessedAny = R.ciScopes.some(cs => isNum(scopeCounts(cs, ws).assessed) && scopeCounts(cs, ws).assessed > 0);
    let ps = REGISTER_KEYS.some(k => R[k].length) ? 1 : 0;
    if (ps && assessedAny && v['CRG-22'] !== null && v['CRG-22'] >= 95 && F.adherence !== null && F.adherence >= 95 && v['CRG-24'] === 0) ps = 2;
    if (ps === 2 && onTarget('CRG-22', ws, K) && m['CRG-22'].unknown === 0 && F.adherence >= 95 && v['CRG-24'] === 0) ps = 3;
    if (ps) out.push({ kind: 'category', key: 'PR.PS', value: ps, current: scores['PR.PS'] ?? null, rationale: `CRG-22 ${v['CRG-22'] ?? '—'}, adherence ${F.adherence ?? '—'} %, CRG-24 ${v['CRG-24'] ?? '—'}. Never above 3.${cite}` });
  }
  // statement of applicability
  {
    const T = id => ({ has: v[id] !== null && v[id] !== undefined, ok: onTarget(id, ws, K) });
    const chg = { has: F.changesVerified !== null, ok: F.changesVerified !== null && F.changesVerified >= 98 };
    const MAP = { '8.9': ['CRG-22', 'CRG-24'], 'CIS 4': ['CRG-22', 'CRG-24'], 'PR.PS-01': ['CRG-22', 'CRG-24'], '8.32': ['changes'] };
    for (const it of C.soaProposals(ws, CONTROLS.soa, MAP, k => k === 'changes' ? chg : T(k), k => k === 'changes' ? `changes verified ${F.changesVerified ?? '—'} %` : `${k} ${v[k] ?? '—'}`)) out.push({ ...it, rationale: it.rationale + '.' + cite });
  }
  return out;
}

/* ---------------- import from a report (AI for prose reports; no table rules) ---------------- */
export const AI_KEYS = { ciScopes: ['inScope', 'assigned', 'assessed', 'compliant'], changes: ['count', 'verified'] };
export const guessColumns = null;
export const countsFromTable = null;
/** The request sent to the model (never shown as interface text): aggregate counts of the module's registers only. */
export const AI_PROMPT = `Extract AGGREGATE COUNTS ONLY from the report below, for population-level configuration
registers.
Never output a name, username, e-mail address, account identifier, host name, IP address, password, key,
token or any quotation of the report: only the registers, enumerations and integer counts below.
Registers and their keys:
- ciScopes: inScope, assigned, assessed, compliant
- changes: type standard|normal|emergency|unauthorized_suspected; count, verified
Omit a key that the report does not state: an omitted count is unknown, which is different from zero.
Provenance tag for every item, exactly one of FACT, INFERENCE, ASSUMPTION, EXTERNAL, UNKNOWN;
"page" is the page number where the count appears, if any.
Answer with JSON only, in this shape:
{"items":[{"register":"ciScopes","inScope":0,"assigned":0,"assessed":0,"compliant":0,"tag":"FACT","page":1}]}`;

/* ---------------- teaching-case samples ---------------- */
/** Load the module's per-case sample (js/data/cm-samples.js): an approved sample version gets its hash. */
export const applySample = (ws, sample, opts = {}) => C.applySample(ws, M, sample, { ...opts,
  version: (k, r) => { if (k === 'baselines') for (const v of r.versions || []) if (v.state === 'approved' && !v.hash) v.hash = versionHash(v); } });
export const SAMPLES = () => globalThis.CRG_CM_SAMPLES || {};

/* ---------------- tips for the process steps ---------------- */
export const STEP_TIPS = {
  setup: ['Configuration management: record a finding as evidence and it takes the next E-number of the evidence register.'],
  context: ['Configuration management holds the baselines, configuration scopes, deviations and changes of the organization — counts only.'],
  quantify: ['A recorded configuration finding can propose a Pb(ψ,A) or θ change; accepting it is a separate act in Findings & proposals.'],
  monitor: ['Switching on Configuration management adds three automatic indicators, CRG-22, CRG-24 and CRG-25, to the KRI dashboard.'],
};
export const STEP_LINKS = { setup: [['cm/findings', 'Findings & proposals']], context: [['cm/overview', 'Configuration management']], quantify: [['cm/findings', 'Findings & proposals']],
  monitor: [['cm/overview', 'Configuration management']] };

/* ---------------- the descriptor and the bound API ---------------- */
const M = { id: ID, field: ID, label: LABEL, registers: REGISTER_KEYS, blank, blankSettings, KRIS, RULES, RULE, AI_KEYS, kri, derive: deriveInto, counts: scopeCounts,
  cause: 'CM', findingKind: 'cm-finding' };
export const MODULE = M;
export const { reg, asOf, defsWithOverrides, completeness, derive, proposed, record, recordEvidence, accept, pending, forScenario, basisOf, parseAIItems, acceptImport,
  registersEmpty, onTarget } = C.api(M);

export { touch };
