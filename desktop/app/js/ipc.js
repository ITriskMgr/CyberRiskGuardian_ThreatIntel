/* ipc.js — Identity, privilege & configuration: the model behind the optional module.

   Seven local governance registers kept at POPULATION level — counts per group of accounts, roles,
   campaigns, configuration scopes or change types — never per person or per account, and never a
   secret. From them the module derives deterministic findings, eight automatic KRIs (CRG-17 to
   CRG-24), proposals for existing maturity and statement-of-applicability answers, and links to
   scenarios as evidence (E-numbers). A change to Pb(ψ,A) or θ is only ever PROPOSED; accepting it is
   a separate act of the analyst. The engine, its formulas and the 19 process steps are unchanged.

   Rules carried here:
     • a count is an integer ≥ 0 or null (unknown) — never coerced to 0;
     • an unverified revocation never counts as done; an expired exception never counts;
     • a KRI is never green by excluding unknowns: an unknown or stale input caps it at warning;
     • rows hold groups, not people: e-mail addresses, UPNs, DOMAIN\user, SIDs and secrets are refused.
   Nothing here runs at load time: every function takes the workspace it works on.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, touch } from './state.js';
import { today } from './util.js';
import * as SH from './shared.js';
import * as MOD from './modules.js';
import { looksLikeName } from './anon.js';

/* ---------------- vocabularies ---------------- */
export const TYPES = [['employee', 'Employee'], ['contractor', 'Contractor or vendor'], ['service', 'Service or workload'], ['ai_agent', 'AI agent'], ['emergency', 'Emergency']];
/** Account types that a person signs in with (MFA applies). Machine identities have no MFA count. */
export const HUMAN = new Set(['employee', 'contractor', 'emergency']);
export const TIERS = [[0, 'Tier 0 — control plane'], [1, 'Tier 1 — critical production'], [2, 'Tier 2 — limited administration']];
export const CONTROLS_EMERGENCY = [['offlineCustody', 'Offline custody of the credentials'], ['strongAuth', 'Strong authentication'], ['alertOnUse', 'Alert on every use'],
  ['idpIndependent', 'Independent of the identity provider'], ['resetAfterUse', 'Credentials reset after use']];
export const YNU = [['unknown', 'Unknown'], ['yes', 'Yes'], ['no', 'No']];
export const POPULATIONS = [['all', 'All accounts'], ['privileged', 'Privileged roles'], ['tier0', 'Tier 0 only'], ['vendor', 'Vendors and contractors'], ['service', 'Service accounts']];
export const BL_KINDS = [['cis-benchmark', 'CIS Benchmark'], ['stig', 'DISA STIG'], ['vendor', 'Vendor hardening guide'], ['internal', 'Internal standard']];
export const V_STATES = [['draft', 'Draft'], ['approved', 'Approved'], ['superseded', 'Superseded'], ['legacy', 'Legacy']];
export const DRIFT = [['', 'To be classified'], ['degradation', 'Degradation'], ['functional', 'Functional'], ['transitional', 'Transitional'], ['compensated', 'Compensated'],
  ['strengthening', 'Strengthening'], ['unknown', 'Unknown']];
export const SEVERITY = [['high', 'High'], ['medium', 'Medium'], ['low', 'Low']];
export const DV_STATES = [['open', 'Open'], ['closed', 'Closed']];
export const CH_TYPES = [['standard', 'Standard'], ['normal', 'Normal'], ['emergency', 'Emergency'], ['unauthorized_suspected', 'Unauthorized (suspected)']];
export const STATUS = [['inferred', 'Inferred'], ['confirmed', 'Confirmed'], ['unknown', 'Unknown'], ['conflicting', 'Conflicting']];
export const CONF = [['Low', 'Low'], ['Medium', 'Medium'], ['High', 'High']];
export const TAGS = ['FACT', 'INFERENCE', 'ASSUMPTION', 'EXTERNAL', 'UNKNOWN'];
export const PARAMS = [['Pbx', 'Pb(ψ,A)'], ['Th', 'θ']];
const PARAM_LOG = { Pbx: 'Pb(psi,A)', Th: 'theta' };

/** The registers, their identifier prefixes and the count fields each one holds. */
export const REGISTERS = {
  accounts: { prefix: 'AP', label: 'Accounts', counts: ['count', 'mfa', 'mfaPR', 'dormant', 'ownerless'], dates: ['reconciled'] },
  privileged: { prefix: 'PR', label: 'Privileged roles', counts: ['holders', 'standing', 'jit', 'mfa', 'mfaPR', 'shared'], dates: ['reviewed'] },
  emergency: { prefix: 'BG', label: 'Emergency accounts', counts: ['count', 'uses', 'usesReviewed'], dates: ['lastTest', 'lastUse'] },
  reviews: { prefix: 'AR', label: 'Access reviews', counts: ['decisionsDue', 'decisionsDone', 'revocationsRequested', 'revocationsVerified', 'reviewerConflicts'], dates: ['closed'] },
  baselines: { prefix: 'BL', label: 'Baselines', counts: [], dates: [] },
  ciScopes: { prefix: 'CS', label: 'Configuration scopes', counts: ['inScope', 'assigned', 'assessed', 'compliant'], dates: ['asOf'] },
  deviations: { prefix: 'DV', label: 'Deviations', counts: ['count'], dates: ['opened', 'lastSeen'] },
  sod: { prefix: 'SD', label: 'Segregation of duties', counts: ['conflicts'], dates: ['reviewed'] },
  changes: { prefix: 'CH', label: 'Configuration changes', counts: ['count', 'verified'], dates: [] },
};
export const REGISTER_KEYS = ['accounts', 'privileged', 'emergency', 'reviews', 'baselines', 'ciScopes', 'deviations', 'sod', 'changes'];

/* ---------------- CRGO alignment (§10.2) ----------------
   One map. The IRIs are placeholders until CRGO 0.11 is released — see CRGO 0.11 release notes — and a
   release build fails while any CRGO_TBD remains (tools/crgo_tbd_check.py --release). */
const TBD = n => 'https://w3id.org/crgo/CRGO_TBD-' + String(n).padStart(2, '0');
export const CRGO = {
  AccountPopulation: { iri: TBD(1), sup: 'CRGO_0000001' },
  PrivilegedRolePopulation: { iri: TBD(2), sup: 'CRGO_0000001' },
  EmergencyAccessAccountSet: { iri: TBD(3), sup: 'CRGO_0000001' },
  AccessReviewCampaign: { iri: TBD(4), sup: 'CRGO_0000019' },
  SegregationRule: { iri: TBD(5), sup: 'CRGO_0000020' },
  SecurityBaseline: { iri: TBD(6), sup: 'CRGO_0000501' },
  BaselineVersion: { iri: TBD(7), sup: 'CRGO_0000501' },
  ConfigurationDrift: { iri: TBD(8), sup: 'CRGO_0000018' },
  IdentityFinding: { iri: TBD(9), sup: 'CRGO_0000527' },
  PrivilegeFinding: { iri: TBD(10), sup: 'CRGO_0000527' },
  ConfigurationFinding: { iri: TBD(11), sup: 'CRGO_0000527' },
  Misconfiguration: { iri: TBD(12), sup: 'CRGO_0000016' },
  ConfigurationException: { iri: TBD(13), sup: 'CRGO_0000502' },
  IPCRegisterRecord: { iri: TBD(14), sup: 'CRGO_0000036' },
  // drift classes (SKOS concepts of ConfigurationDrift)
  'drift:degradation': { iri: TBD(15), sup: 'ConfigurationDrift' }, 'drift:functional': { iri: TBD(16), sup: 'ConfigurationDrift' },
  'drift:transitional': { iri: TBD(17), sup: 'ConfigurationDrift' }, 'drift:compensated': { iri: TBD(18), sup: 'ConfigurationDrift' },
  'drift:strengthening': { iri: TBD(19), sup: 'ConfigurationDrift' }, 'drift:unknown': { iri: TBD(20), sup: 'ConfigurationDrift' },
  // the eight indicators (individuals of KRI CRGO_0000034)
  'CRG-17': { iri: TBD(21), sup: 'CRGO_0000034' }, 'CRG-18': { iri: TBD(22), sup: 'CRGO_0000034' }, 'CRG-19': { iri: TBD(23), sup: 'CRGO_0000034' },
  'CRG-20': { iri: TBD(24), sup: 'CRGO_0000034' }, 'CRG-21': { iri: TBD(25), sup: 'CRGO_0000034' }, 'CRG-22': { iri: TBD(26), sup: 'CRGO_0000034' },
  'CRG-23': { iri: TBD(27), sup: 'CRGO_0000034' }, 'CRG-24': { iri: TBD(28), sup: 'CRGO_0000034' },
  // an accepted proposal is an existing decision record
  AcceptedProposal: { iri: 'https://w3id.org/crgo/CRGO_0000504', sup: 'CRGO_0000504' },
};
/** The CRGO concepts still waiting for their CRGO 0.11 identifier. */
export const crgoPending = () => Object.entries(CRGO).filter(([, v]) => /CRGO_TBD/.test(v.iri)).map(([k]) => k);

/** CIS Controls v8.1 used by the module: identifiers with the author's own short labels (no CIS text). */
export const CIS = [
  ['CIS 4', 'Keep enterprise assets and software securely configured'],
  ['CIS 5', 'Manage accounts through their life'],
  ['CIS 6', 'Grant, change and remove access deliberately'],
];
export const CIS_SAFEGUARDS = ['4.1', '4.7', '5.1', '5.3', '5.4', '5.5', '6.1', '6.2', '6.5', '6.8'];

/** The existing maturity, resilience and statement-of-applicability keys the module speaks to (§7). */
export const CONTROLS = {
  categories: ['PR.AA', 'PR.PS'],
  questions: ['pv1', 'pv3', 'ct2', 'ct3'],
  soa: ['ISO22:5.15', 'ISO22:5.16', 'ISO22:5.17', 'ISO22:5.18', 'ISO22:8.2', 'ISO22:8.5', 'ISO22:8.9', 'ISO22:8.32',
    'CSF2:PR.AA-01', 'CSF2:PR.AA-03', 'CSF2:PR.AA-05', 'CSF2:PR.PS-01', 'CIS81:CIS 4', 'CIS81:CIS 5', 'CIS81:CIS 6'],
};

/* ---------------- the record ---------------- */
export const blankSettings = () => ({ asOf: null, staleDays: 90, reviewMonths: 12, testDays: 365, dormantDays: 90 });
export const blank = () => ({ settings: blankSettings(), accounts: [], privileged: [], emergency: [], reviews: [], baselines: [], ciScopes: [],
  deviations: [], sod: [], changes: [], findings: [], imports: [] });
/** The module's record in a workspace, created or completed in place (never replaced). */
export function reg(ws = S.ws) {
  const r = (ws.ipc ||= blank());
  const b = blank();
  for (const k of Object.keys(b)) if (r[k] === undefined || r[k] === null) r[k] = b[k];
  r.settings = Object.assign(blankSettings(), r.settings || {});
  return r;
}
export const on = () => MOD.enabled('ipc');
export const asOf = (ws = S.ws) => reg(ws).settings.asOf || today();

/** Defaults of a new row of each register. */
export function blankRow(register) {
  const common = { source: '', status: 'inferred', conf: 'Low', evidence: '', prov: { tag: 'ASSUMPTION', method: 'manual', file: '', date: today() }, note: '' };
  const n = null;
  switch (register) {
    case 'accounts': return { type: 'employee', label: '', scope: '', owner: '', count: n, mfa: n, mfaPR: n, dormant: n, ownerless: n, reconciled: '', ...common };
    case 'privileged': return { tier: 1, label: '', scope: '', owner: '', holders: n, standing: n, jit: n, mfa: n, mfaPR: n, shared: n, reviewed: '', ...common };
    case 'emergency': return { label: '', scope: '', owner: '', count: n, controls: Object.fromEntries(CONTROLS_EMERGENCY.map(([k]) => [k, 'unknown'])), lastTest: '', uses: n, usesReviewed: n, lastUse: '', ...common };
    case 'reviews': return { name: '', population: 'all', scope: '', owner: '', due: '', closed: '', decisionsDue: n, decisionsDone: n, revocationsRequested: n, revocationsVerified: n, reviewerConflicts: n, ...common };
    case 'baselines': return { name: '', platform: '', kind: 'internal', licenceRef: '', owner: '', legacy: false, versions: [blankVersion('1.0')], note: '' };
    case 'ciScopes': return { label: '', baseline: '', version: '', fromAssets: false, assetTypes: [], inScope: n, assigned: n, assessed: n, compliant: n, asOf: '', ...common };
    case 'deviations': return { baseline: '', version: '', ciScope: '', asset: '', count: n, cls: '', severity: 'medium', requirement: '', opened: today(), lastSeen: '', exception: '', state: 'open', owner: '', migrated: false, ...common };
    case 'sod': return { rule: '', process: '', conflicts: n, owner: '', mitigation: '', compensating: [], reviewed: '', ...common };
    case 'changes': return { period: '', type: 'normal', scope: '', count: n, verified: n, ticket: '', ...common };
    default: return { ...common };
  }
}
export const blankVersion = (v = '1.0') => ({ v, state: 'draft', approved: '', approvedBy: '', effective: '', review: '', hash: '', rationale: '', applicability: { assetTypes: [], note: '' } });

/* ---------------- small helpers ---------------- */
export const isNum = v => typeof v === 'number' && Number.isFinite(v);
const sum = (rows, f) => rows.reduce((t, r) => t + (f(r) || 0), 0);
const dayMs = 864e5;
const d = s => new Date(s + 'T00:00:00Z').getTime();
export const daysBetween = (a, b) => Math.round((d(b) - d(a)) / dayMs);
export function monthsBefore(date, m) { const x = new Date(date + 'T00:00:00Z'); x.setUTCMonth(x.getUTCMonth() - m); return x.toISOString().slice(0, 10); }
const fixed = x => x === null ? null : +x.toFixed(2);

/** Freshness of a row's date, against its window: true when empty or older than the window. */
export function staleDate(date, register, key, ws = S.ws) {
  const st = reg(ws).settings, at = asOf(ws);
  if (!date) return true;
  if (key === 'reviewed') return date < monthsBefore(at, st.reviewMonths);
  if (key === 'lastTest') return daysBetween(date, at) > st.testDays;
  return daysBetween(date, at) > st.staleDays;      // reconciled, asOf
}
const FRESH_KEY = { accounts: 'reconciled', privileged: 'reviewed', emergency: 'lastTest', ciScopes: 'asOf', sod: 'reviewed' };
/** Is a row stale? (A stale row still counts; it is badged and lowers CRG-23.) */
export function rowStale(register, row, ws = S.ws) {
  const k = FRESH_KEY[register];
  if (!k || (register === 'ciScopes' && row.fromAssets)) return false;
  if (register === 'sod' && !row.reviewed) return false;
  return staleDate(row[k], register, k, ws);
}

/* ---------------- guards (§4: personal data, secrets) ---------------- */
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const DOMAIN_USER = /\b[A-Za-z][\w.-]{0,30}\\[A-Za-z][\w.$-]{1,40}/;
const SID = /\bS-1-\d{1,2}(?:-\d+){1,}/i;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const SECRETS = [/AKIA[0-9A-Z]{16}/, /-----BEGIN/, /xox[bp]-/, /ghp_/, /\beyJ[\w-]{6,}\.[\w-]{6,}\.[\w-]{6,}/, /password\s*[:=]/i];
/** A personal-data or secret problem in one text: { block } or { warn } or null. */
export function guardText(s) {
  const t = String(s ?? '');
  if (!t) return null;
  if (SECRETS.some(r => r.test(t))) return { block: 'A secret, key or token cannot be recorded here: registers never hold secrets or secret references.' };
  if (EMAIL.test(t)) return { block: 'Remove the e-mail address or UPN: registers hold groups, not people.' };
  if (DOMAIN_USER.test(t)) return { block: 'Remove the DOMAIN\\user account name: registers hold groups, not people.' };
  if (SID.test(t)) return { block: 'Remove the security identifier (SID): registers hold groups, not people.' };
  if ((t.match(IPV4) || []).length > 3) return { block: 'More than three IP addresses: record a scope or a count, not a list of hosts.' };
  if (looksLikeName(t)) return { warn: 'Registers hold groups, not people: use a role or team.' };
  return null;
}
const strings = v => typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
/** Every text of a row through the guards. */
export function guardRow(row) {
  const out = { block: null, warn: [] };
  for (const [k, v] of Object.entries(row)) {
    if (['prov', 'id', 'status', 'conf', 'type', 'tier', 'population', 'kind', 'cls', 'severity', 'state'].includes(k)) continue;
    for (const s of strings(v)) {
      const g = guardText(s);
      if (g?.block && !out.block) out.block = g.block;
      if (g?.warn && !out.warn.includes(g.warn)) out.warn.push(g.warn);
    }
  }
  return out;
}

/* ---------------- validation (§4: block = Save disabled, warn = Save allowed) ---------------- */
const MSG = {
  neg: 'Counts are whole numbers of zero or more. Leave blank when unknown — 0 means none.',
  future: 'A date of this register cannot be in the future.',
};
/** { block: message|null, warn: [messages] } for a row about to be saved. */
export function validate(register, row, ws = S.ws) {
  const out = { block: null, warn: [] };
  const B = m => { if (!out.block) out.block = m; };
  const R = REGISTERS[register] || { counts: [], dates: [] };
  for (const k of R.counts) {
    const v = row[k];
    if (v === null || v === undefined || v === '') continue;
    if (!isNum(v) || v < 0 || !Number.isInteger(v)) B(MSG.neg);
  }
  const le = (a, b, m) => { if (isNum(row[a]) && isNum(row[b]) && row[a] > row[b]) B(m); };
  if (register === 'accounts') {
    le('mfa', 'count', 'MFA cannot exceed the number of accounts.'); le('mfaPR', 'mfa', 'Phishing-resistant MFA cannot exceed MFA.');
    le('dormant', 'count', 'Dormant accounts cannot exceed the number of accounts.'); le('ownerless', 'count', 'Accounts without an owner cannot exceed the number of accounts.');
  }
  if (register === 'privileged') {
    for (const k of ['standing', 'jit', 'shared', 'mfa']) le(k, 'holders', 'Standing, just-in-time, shared and MFA counts cannot exceed the number of holders.');
    le('mfaPR', 'mfa', 'Phishing-resistant MFA cannot exceed MFA.');
    if (isNum(row.standing) && isNum(row.jit) && isNum(row.holders) && row.standing + row.jit !== row.holders) out.warn.push('Standing plus just-in-time does not equal the number of holders.');
  }
  if (register === 'emergency') le('usesReviewed', 'uses', 'Reviewed uses cannot exceed the uses.');
  if (register === 'reviews') { le('decisionsDone', 'decisionsDue', 'Decisions made cannot exceed decisions due.'); le('revocationsVerified', 'revocationsRequested', 'Verified revocations cannot exceed revocations requested.'); }
  if (register === 'changes') { le('verified', 'count', 'Verified changes cannot exceed the number of changes.');
    if (row.period && !/^\d{4}-(Q[1-4]|0[1-9]|1[0-2])$/.test(row.period)) B('The period reads YYYY-Qn or YYYY-MM.'); }
  if (register === 'ciScopes') { le('compliant', 'assessed', 'Compliant cannot exceed assessed, assessed cannot exceed assigned, assigned cannot exceed in scope.');
    le('assessed', 'assigned', 'Compliant cannot exceed assessed, assessed cannot exceed assigned, assigned cannot exceed in scope.');
    le('assigned', 'inScope', 'Compliant cannot exceed assessed, assessed cannot exceed assigned, assigned cannot exceed in scope.'); }
  const t = today();
  for (const k of ['reconciled', 'reviewed', 'lastTest', 'lastUse', 'asOf', 'closed']) if (row[k] && row[k] > t) B(MSG.future);
  if (register === 'deviations' && row.cls === 'compensated' && !row.exception) B('A compensated deviation needs a linked exception.');
  const needsOwner = (register === 'accounts' && ['service', 'ai_agent', 'emergency'].includes(row.type)) || (register === 'privileged' && Number(row.tier) === 0) || register === 'emergency';
  if (needsOwner && !String(row.owner || '').trim()) out.warn.push('Give this row an owner (a role or team): service, AI-agent, emergency and tier 0 populations need one.');
  if (register === 'accounts' && !HUMAN.has(row.type)) { row.mfa = null; row.mfaPR = null; }
  if (row.source && String(row.source).length > 200) B('The source is at most 200 characters.');
  const g = guardRow(row);
  if (g.block) B(g.block);
  out.warn.push(...g.warn);
  return out;
}

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
  const nv = { ...blankVersion(v), rationale: last?.rationale || '', applicability: JSON.parse(JSON.stringify(last?.applicability || { assetTypes: [], note: '' })) };
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

/* ---------------- KRIs (§5) ---------------- */
export const KRIS = [
  { id: 'CRG-17', name: 'Identity ownership coverage', unit: '%', dir: 'up', target: 99, warn: 99, crit: 95, risk: 'Accounts without an accountable owner', method: '100 × Σ(count − ownerless) ÷ Σ count', fmt: 2, module: 'ipc' },
  { id: 'CRG-18', name: 'Privileged MFA coverage', unit: '%', dir: 'up', target: 100, warn: 99, crit: 95, risk: 'Takeover of privileged access', method: '100 × Σ MFA ÷ Σ holders, tiers 0–2 (unknown MFA counts as none)', fmt: 2, module: 'ipc' },
  { id: 'CRG-19', name: 'Standing-privilege ratio', unit: '%', dir: 'down', target: 20, warn: 30, crit: 50, risk: 'Standing privileged access', method: '100 × Σ standing ÷ Σ holders, tiers 0–1 (unknown standing counts as all holders)', fmt: 2, module: 'ipc' },
  { id: 'CRG-20', name: 'Access-review completion', unit: '%', dir: 'up', target: 98, warn: 98, crit: 90, risk: 'Access no longer needed', method: '100 × Σ decisions made ÷ Σ decisions due, campaigns due in the review window', fmt: 2, module: 'ipc' },
  { id: 'CRG-21', name: 'Emergency use reviewed', unit: '%', dir: 'up', target: 100, warn: 100, crit: 80, risk: 'Unreviewed emergency access', method: '100 × Σ reviewed uses ÷ Σ uses', fmt: 2, module: 'ipc' },
  { id: 'CRG-22', name: 'Baseline assignment coverage', unit: '%', dir: 'up', target: 95, warn: 95, crit: 80, risk: 'Unmanaged configuration', method: '100 × Σ assigned ÷ Σ in scope (draft versions do not count)', fmt: 2, module: 'ipc' },
  { id: 'CRG-23', name: 'Known coverage', unit: '%', dir: 'up', target: 95, warn: 90, crit: 70, risk: 'Decisions made on unknown data', method: '100 × required values known and fresh ÷ required values', fmt: 2, module: 'ipc' },
  { id: 'CRG-24', name: 'Expired exceptions', unit: 'count', dir: 'down', target: 0, warn: 1, crit: 1, risk: 'Deviations relying on an expired exception', method: 'Expired exceptions concerning a deviation or baseline, or cited by an open deviation', fmt: 0, module: 'ipc' },
];
export const KRI_IDS = KRIS.map(k => k.id);
const NO_CAP = new Set(['CRG-23', 'CRG-24']);

/** The thresholds in force: defaults merged with the overrides in ws.kriDefs. */
export function defsWithOverrides(ws = S.ws) {
  const ov = Object.fromEntries((Array.isArray(ws.kriDefs) ? ws.kriDefs : []).filter(o => o && o.id).map(o => [o.id, o]));
  return KRIS.map(k => ov[k.id] ? { ...k, target: num(ov[k.id].target, k.target), warn: num(ov[k.id].warn, k.warn), crit: num(ov[k.id].crit, k.crit), override: ov[k.id] } : { ...k });
}
const num = (v, dflt) => v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? dflt : Number(v);
export function setOverride(ws, id, o, by = '') {
  ws.kriDefs = (Array.isArray(ws.kriDefs) ? ws.kriDefs : []).filter(x => x?.id !== id);
  if (o) ws.kriDefs.push({ id, target: o.target, warn: o.warn, crit: o.crit, by, date: today() });
}

/**
 * The eight values with their basis: { values: {id: v|null}, meta: {id: {num, den, unknown, stale, na, ...}} }.
 * One definition, read by the KRI dashboard (kri.js) and by this module's screens.
 */
export function kri(ws = S.ws) {
  const R = reg(ws), at = asOf(ws), st = R.settings;
  const values = {}, meta = {};
  const put = (id, num, den, extra = {}) => {
    const empty = extra.empty;
    const na = !empty && !(den > 0) && !extra.count;
    const v = empty ? null : extra.count ? num : (den > 0 ? fixed(100 * num / den) : null);
    values[id] = v;
    meta[id] = { num, den, unknown: extra.unknown || 0, stale: extra.stale || 0, na: !!na && !empty, empty: !!empty, ...extra.more };
  };
  // CRG-17
  {
    const rows = R.accounts, withCount = rows.filter(r => isNum(r.count)), both = withCount.filter(r => isNum(r.ownerless));
    put('CRG-17', sum(both, r => r.count - r.ownerless), sum(withCount, r => r.count), { empty: !rows.length,
      unknown: rows.filter(r => !isNum(r.count) || !isNum(r.ownerless)).length, stale: rows.filter(r => rowStale('accounts', r, ws)).length });
  }
  // CRG-18 / CRG-19
  {
    const P = R.privileged, all = P.filter(r => [0, 1, 2].includes(Number(r.tier))), t01 = all.filter(r => Number(r.tier) <= 1);
    const hold = r => isNum(r.holders) ? r.holders : 0;
    put('CRG-18', sum(all, r => Math.min(isNum(r.mfa) ? r.mfa : 0, hold(r))), sum(all, hold), { empty: !P.length,
      unknown: all.filter(r => !isNum(r.mfa) || !isNum(r.holders)).length, stale: all.filter(r => rowStale('privileged', r, ws)).length,
      more: { pr: sum(all, r => isNum(r.mfaPR) ? r.mfaPR : 0), prUnknown: all.filter(r => !isNum(r.mfaPR)).length } });
    put('CRG-19', sum(t01, r => isNum(r.standing) ? r.standing : hold(r)), sum(t01, hold), { empty: !P.length,
      unknown: t01.filter(r => !isNum(r.standing) || !isNum(r.holders)).length, stale: t01.filter(r => rowStale('privileged', r, ws)).length });
  }
  // CRG-20
  {
    const from = monthsBefore(at, st.reviewMonths);
    const inWin = R.reviews.filter(r => r.due && r.due > from && r.due <= at);
    put('CRG-20', sum(inWin, r => isNum(r.decisionsDone) ? r.decisionsDone : 0), sum(inWin, r => isNum(r.decisionsDue) ? r.decisionsDue : 0), { empty: !R.reviews.length,
      unknown: inWin.filter(r => !isNum(r.decisionsDone) || !isNum(r.decisionsDue)).length, more: { campaigns: inWin.length } });
  }
  // CRG-21
  {
    const E = R.emergency, known = E.filter(r => isNum(r.uses));
    put('CRG-21', sum(known, r => isNum(r.usesReviewed) ? Math.min(r.usesReviewed, r.uses) : 0), sum(known, r => r.uses), { empty: !E.length,
      unknown: E.filter(r => !isNum(r.uses) || !isNum(r.usesReviewed)).length });
  }
  // CRG-22
  {
    const C = R.ciScopes; let legacy = 0, unknown = 0, stale = 0, assigned = 0, inScope = 0;
    for (const cs of C) {
      const c = scopeCounts(cs, ws);
      if (!isNum(c.inScope)) { unknown++; continue; }
      inScope += c.inScope;
      const vs = cs.fromAssets ? null : versionState(cs.baseline, cs.version, ws);
      if (!isNum(c.assigned)) unknown++;
      else if (vs !== 'draft') { assigned += c.assigned; if (vs === 'legacy') legacy += c.assigned; }
      if (rowStale('ciScopes', cs, ws)) stale++;
    }
    put('CRG-22', assigned, inScope, { empty: !C.length, unknown, stale, more: { legacy } });
  }
  // CRG-23
  {
    const k = known(ws);
    put('CRG-23', k.known, k.required, { empty: !k.rows, more: { staleValues: k.staleValues } });
  }
  // CRG-24
  {
    const x = expiredExceptions(ws, at);
    const relevant = R.deviations.length || x.related;
    values['CRG-24'] = relevant ? x.expired.length : null;
    meta['CRG-24'] = { num: x.expired.length, den: null, unknown: 0, stale: 0, na: !relevant && !!REGISTER_KEYS.some(rk => R[rk].length), empty: !REGISTER_KEYS.some(rk => R[rk].length), ids: x.expired.map(e => e.id) };
  }
  // the counts every overview figure needs
  return { values, meta, asOf: at };
}

/** CRG-23: required values known and fresh, register by register. */
export function known(ws = S.ws) {
  const R = reg(ws);
  let required = 0, k = 0, staleValues = 0, rows = 0;
  const req = (ok) => { required++; if (ok) k++; };
  const date = (register, row, key) => { required++; const s = rowStale(register, row, ws); if (s) staleValues++; else k++; };
  for (const r of R.accounts) { rows++; ['count', 'dormant', 'ownerless'].forEach(f => req(isNum(r[f]))); date('accounts', r, 'reconciled'); if (HUMAN.has(r.type)) ['mfa', 'mfaPR'].forEach(f => req(isNum(r[f]))); }
  for (const r of R.privileged) { rows++; ['holders', 'standing', 'mfa', 'mfaPR'].forEach(f => req(isNum(r[f]))); date('privileged', r, 'reviewed'); }
  for (const r of R.emergency) { rows++; ['count', 'uses', 'usesReviewed'].forEach(f => req(isNum(r[f]))); date('emergency', r, 'lastTest');
    for (const [c] of CONTROLS_EMERGENCY) req((r.controls?.[c] || 'unknown') !== 'unknown'); }
  for (const r of R.reviews) { rows++; ['decisionsDue', 'decisionsDone', 'revocationsRequested', 'revocationsVerified'].forEach(f => req(isNum(r[f]))); }
  for (const r of R.ciScopes) { rows++; const c = scopeCounts(r, ws); ['inScope', 'assigned', 'assessed', 'compliant'].forEach(f => req(isNum(c[f]))); date('ciScopes', r, 'asOf'); }
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

/** Threshold evaluation (the same rule as the KRI dashboard), with the module's two additions:
    not applicable, and the cap at warning when an input is unknown or stale. */
export function status(def, v, m = null) {
  if (m?.na) return { k: 'na', label: 'not applicable' };
  if (v === null || v === undefined || !Number.isFinite(v)) return { k: 'none', label: 'no data' };
  const inclusive = def.unit === 'count';
  const breach = th => th !== null && th !== undefined && (def.dir === 'down' ? (inclusive ? v >= th : v > th) : (inclusive ? v <= th : v < th));
  if (breach(def.crit)) return { k: 'bad', label: 'critical' };
  if (breach(def.warn)) return { k: 'warn', label: 'warning' };
  if (m && !NO_CAP.has(def.id) && (m.unknown > 0 || m.stale > 0)) return { k: 'warn', label: 'on target — incomplete data' };
  return { k: 'good', label: 'on target' };
}
/** On target, from the values in force (used by the maturity proposals). */
export function onTarget(id, ws = S.ws, K = kri(ws)) {
  const def = defsWithOverrides(ws).find(x => x.id === id);
  return status(def, K.values[id], K.meta[id]).k === 'good';
}

/* ---------------- overview figures ---------------- */
export function figures(ws = S.ws) {
  const R = reg(ws), at = asOf(ws);
  const dormant = R.accounts.filter(r => isNum(r.dormant));
  const unverified = R.reviews.filter(r => isNum(r.revocationsRequested)).reduce((t, r) => t + Math.max(0, r.revocationsRequested - (isNum(r.revocationsVerified) ? r.revocationsVerified : 0)), 0);
  const highOpen = R.deviations.filter(v => v.state !== 'closed' && v.severity === 'high').map(v => ({ id: v.id, age: v.opened ? daysBetween(v.opened, at) : null }));
  const ch = R.changes.filter(r => isNum(r.count));
  const chCount = sum(ch, r => r.count), chVer = sum(ch, r => isNum(r.verified) ? r.verified : 0);
  let assessed = 0, compliant = 0, assigned = 0;
  for (const cs of R.ciScopes) { const c = scopeCounts(cs, ws); if (isNum(c.assessed)) assessed += c.assessed; if (isNum(c.compliant)) compliant += c.compliant; if (isNum(c.assigned)) assigned += c.assigned; }
  return {
    dormant: dormant.length ? sum(dormant, r => r.dormant) : null, dormantUnknown: R.accounts.length - dormant.length,
    unverified: R.reviews.length ? unverified : null,
    highOpen,
    changesVerified: chCount > 0 ? fixed(100 * chVer / chCount) : null, changes: chCount,
    adherence: assessed > 0 ? fixed(100 * compliant / assessed) : null, unassessed: assigned > 0 ? fixed(100 * (1 - assessed / assigned)) : null,
  };
}
/** Rows per register, and how many are complete (no unknown required value) — the completeness card. */
export function completeness(ws = S.ws) {
  const R = reg(ws);
  const req = { accounts: r => ['count', 'dormant', 'ownerless', ...(HUMAN.has(r.type) ? ['mfa', 'mfaPR'] : [])], privileged: () => ['holders', 'standing', 'mfa', 'mfaPR'],
    emergency: () => ['count', 'uses', 'usesReviewed'], reviews: () => ['decisionsDue', 'decisionsDone', 'revocationsRequested', 'revocationsVerified'],
    ciScopes: () => ['inScope', 'assigned', 'assessed', 'compliant'], deviations: () => ['count'], sod: () => ['conflicts'], changes: () => ['count', 'verified'], baselines: () => [] };
  return REGISTER_KEYS.map(k => {
    const rows = R[k];
    const full = rows.filter(r => { const c = k === 'ciScopes' ? scopeCounts(r, ws) : r; return req[k](r).every(f => isNum(c[f])); }).length;
    return { register: k, label: REGISTERS[k].label, rows: rows.length, complete: full, stale: rows.filter(r => rowStale(k, r, ws)).length };
  });
}

/* ---------------- finding rules (§6) ---------------- */
export const RULES = [
  { id: 'IR-01', register: 'accounts', severity: 'high', param: 'Pbx', dir: '↑', title: 'Service or AI-agent accounts without an owner' },
  { id: 'IR-02', register: 'privileged', severity: 'high', param: 'Pbx', dir: '↑', title: 'Tier 0–1 privileged access without MFA for every holder' },
  { id: 'IR-03', register: 'privileged', severity: 'medium', param: 'Pbx', dir: '↑', title: 'Standing tier 0 privilege' },
  { id: 'IR-04', register: 'accounts', severity: 'medium', param: 'Pbx', dir: '↑', title: 'Dormant accounts still enabled' },
  { id: 'IR-05', register: 'privileged', severity: 'medium', param: 'Th', dir: '↓', title: 'Shared administrative accounts' },
  { id: 'IR-06', register: 'emergency', severity: 'high', param: 'Th', dir: '↓', title: 'Emergency access not tested recently or missing a protective control' },
  { id: 'IR-07', register: 'emergency', severity: 'high', param: 'Th', dir: '↓', title: 'Emergency account uses not reviewed' },
  { id: 'IR-08', register: 'reviews', severity: 'medium', param: 'Pbx', dir: '↑', title: 'Access review incomplete or revocations unverified' },
  { id: 'IR-09', register: 'reviews', severity: 'medium', param: null, dir: '', title: 'Reviewers reviewing their own access' },
  { id: 'IR-10', register: 'sod', severity: 'medium', param: 'Pbx', dir: '↑', title: 'Segregation-of-duties conflicts without mitigation' },
  { id: 'IR-11', register: 'deviations', severity: 'high', param: 'Pbx', dir: '↑', title: 'Open high-severity configuration degradation' },
  { id: 'IR-12', register: 'deviations', severity: 'high', param: 'Pbx', dir: '↑', title: 'Deviation compensated by an expired exception' },
  { id: 'IR-13', register: 'changes', severity: 'high', param: 'Pbx', dir: '↑', title: 'Suspected unauthorized configuration changes' },
  { id: 'IR-14', register: 'changes', severity: 'medium', param: 'Th', dir: '↓', title: 'Emergency changes not verified' },
  { id: 'IR-15', register: 'ciScopes', severity: 'low', param: null, dir: '', title: 'Assigned baseline is only legacy or draft' },
  { id: 'IR-16', register: '*', severity: 'low', param: null, dir: '', title: 'Stale or conflicting register row' },
];
export const RULE = Object.fromEntries(RULES.map(r => [r.id, r]));
const lt = (a, b) => isNum(b) && (!isNum(a) || a < b);

/** Every finding the rules derive now: [{rule, register, rowId, severity, param, dir, title}]. */
export function derive(ws = S.ws) {
  const R = reg(ws), at = asOf(ws), out = [];
  const add = (rule, register, row) => out.push({ rule, register, rowId: row.id, severity: RULE[rule].severity, param: RULE[rule].param, dir: RULE[rule].dir, title: RULE[rule].title, label: rowLabel(register, row) });
  for (const r of R.accounts) {
    if (['service', 'ai_agent'].includes(r.type) && isNum(r.ownerless) && r.ownerless > 0) add('IR-01', 'accounts', r);
    if (isNum(r.dormant) && r.dormant > 0) add('IR-04', 'accounts', r);
  }
  for (const r of R.privileged) {
    const t = Number(r.tier);
    if (t <= 1 && (lt(r.mfa, r.holders) || !isNum(r.mfa))) add('IR-02', 'privileged', r);
    if (t === 0 && isNum(r.standing) && r.standing > 0) add('IR-03', 'privileged', r);
    if (isNum(r.shared) && r.shared > 0) add('IR-05', 'privileged', r);
  }
  for (const r of R.emergency) {
    if (rowStale('emergency', r, ws) || Object.values(r.controls || {}).includes('no')) add('IR-06', 'emergency', r);
    if (isNum(r.uses) && lt(r.usesReviewed, r.uses)) add('IR-07', 'emergency', r);
  }
  for (const r of R.reviews) {
    if (lt(r.decisionsDone, r.decisionsDue) || lt(r.revocationsVerified, r.revocationsRequested)) add('IR-08', 'reviews', r);
    if (isNum(r.reviewerConflicts) && r.reviewerConflicts > 0) add('IR-09', 'reviews', r);
  }
  for (const r of R.sod) if (isNum(r.conflicts) && r.conflicts > 0 && !String(r.mitigation || '').trim() && !(r.compensating || []).length) add('IR-10', 'sod', r);
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
  for (const k of ['accounts', 'privileged', 'emergency', 'reviews', 'ciScopes', 'deviations', 'sod', 'changes'])
    for (const r of R[k]) if (r.status === 'conflicting' || rowStale(k, r, ws)) add('IR-16', k, r);
  return out;
}
export function rowLabel(register, r) {
  if (!r) return '';
  return r.label || r.name || r.rule || r.requirement || [r.period, r.type].filter(Boolean).join(' ') || r.id;
}
const same = (f, p) => f.rule === p.rule && f.register === p.register && f.rowId === p.rowId;
/** Derived findings not yet recorded or dismissed. */
export const proposed = (ws = S.ws) => derive(ws).filter(p => !reg(ws).findings.some(f => same(f, p)));
export function record(ws, p, state = 'recorded', reason = '') {
  const R = reg(ws);
  const f = { id: nextId(R.findings, 'IF'), rule: p.rule, register: p.register, rowId: p.rowId, title: p.title, severity: p.severity, state,
    eid: '', scenarios: [], proposals: [], action: '', created: today(), ...(reason ? { reason } : {}) };
  R.findings.push(f);
  return f;
}
export const nextId = (rows, prefix) => prefix + '-' + String(rows.reduce((m, r) => Math.max(m, Number(String(r.id || '').split('-').pop()) || 0), 0) + 1).padStart(2, '0');
export const rowOf = (ws, f) => (reg(ws)[f.register] || []).find(r => r.id === f.rowId) || null;

/* ---------------- risk link (§8) ---------------- */
const nextE = ws => { let n = 0; for (const r of ws.assessment.EVIDENCE || []) { const m = /^E(\d+)$/.exec(r[0]); if (m) n = Math.max(n, +m[1]); } return 'E' + (n + 1); };
/** "Record as evidence": one assessment.EVIDENCE row; the finding keeps its E-number. */
export function recordEvidence(ws, f, regLabel = null, titleText = null) {
  if (f.eid) return f.eid;
  const row = rowOf(ws, f), confirmed = row?.status === 'confirmed';
  const supports = f.scenarios.length ? 'Supports: ' + f.scenarios.map(s => s.id + (s.param ? ' ' + (PARAMS.find(p => p[0] === s.param)?.[1] || s.param) : '')).join(', ') : 'Supports: no scenario linked yet';
  const id = nextE(ws);
  (ws.assessment.EVIDENCE ||= []).push([id, `${regLabel || REGISTERS[f.register]?.label || f.register} — ${titleText || f.title} (as of ${asOf(ws)})`,
    row?.prov?.tag === 'FACT' ? 'Documented' : 'SME input', supports, confirmed ? 'moderate' : 'weak', confirmed ? 'verified' : 'assumption', asOf(ws), row?.owner || '']);
  f.eid = id;
  return id;
}
/** "Link scenario": the finding cites it; the scenario itself is not modified. */
export function link(f, scenarioId, param = null) {
  if (!f.scenarios.some(s => s.id === scenarioId && (s.param || null) === (param || null))) f.scenarios.push({ id: scenarioId, param: param || null });
}
/** Save a proposal: nothing changes in the scenario. */
export function propose(ws, f, { scenario, param, to, conf = 'Low', rationale = '', by = '' }) {
  const s = ws.assessment.SCEN.find(x => x.id === scenario);
  if (!s) throw new Error('Choose a scenario.');
  if (!['Pbx', 'Th'].includes(param)) throw new Error('A proposal changes Pb(ψ,A) or θ only.');
  const v = Number(to);
  if (to === '' || to === null || !Number.isFinite(v) || v > 1 || v < 0 || (param === 'Th' && v <= 0)) throw new Error('Type the proposed value: Pb(ψ,A) in [0, 1], θ in (0, 1].');
  const from = Number(s.params?.[param]?.v);
  const p = { scenario, param, from, to: v, rationale, conf, state: 'proposed', date: today(), by, decidedBy: '', decidedOn: '', reason: '' };
  f.proposals.push(p);
  return p;
}
/** Accept a proposal — the one act in this module that changes a scenario parameter. */
export function accept(ws, f, p, by = '') {
  if (p.state !== 'proposed') throw new Error('Only a pending proposal can be accepted.');
  const a = ws.assessment, s = a.SCEN.find(x => x.id === p.scenario);
  if (!s) throw new Error('The scenario no longer exists.');
  const old = s.params[p.param] || { v: p.from };
  const before = CRG.calc(s, a.APPETITE, a.FACTOR);
  s.params[p.param] = { ...old, v: p.to, conf: p.conf, ev: [old.ev, f.eid].filter(Boolean).join('; ') };
  const after = CRG.calc(s, a.APPETITE, a.FACTOR);
  (s.ipc_basis ||= []).push({ finding: f.id, eid: f.eid, parameter: p.param, from: old.v, to: p.to, date: today(), by });
  (s.revisions ||= []).push({ date: today(), what: `${PARAM_LOG[p.param]} ${old.v} → ${p.to} from identity, privilege & configuration finding ${f.id}${f.eid ? ' (' + f.eid + ')' : ''}${by ? '; accepted by ' + by : ''}` });
  (ws.revisionLog ||= []).push({ date: today(), scenario: s.id, parameter: PARAM_LOG[p.param], from: old.v, to: p.to, ratioFrom: before.ratio, ratioTo: after.ratio,
    clsFrom: CRG.classify(before.ratio), clsTo: CRG.classify(after.ratio), cause: `IPC ${f.id}: ${f.eid || 'no evidence recorded'}` });
  Object.assign(p, { state: 'accepted', decidedBy: by, decidedOn: today() });
  return { before, after };
}
export function dismiss(f, p, reason, by = '') {
  if (!String(reason || '').trim()) throw new Error('Dismissing a proposal needs a reason.');
  Object.assign(p, { state: 'dismissed', reason: reason.trim(), decidedBy: by, decidedOn: today() });
}
/** Pending proposals across the module. */
export const pending = (ws = S.ws) => reg(ws).findings.flatMap(f => (f.proposals || []).filter(p => p.state === 'proposed').map(p => ({ f, p })));
/** The module's evidence for a scenario: findings that cite it (read-only in the Scenario editor). */
export const forScenario = (id, ws = S.ws) => (ws.ipc?.findings || []).filter(f => f.state === 'recorded' && (f.scenarios || []).some(s => s.id === id));

/* ---------------- maturity and statement of applicability (§7) ---------------- */
/** Proposals for EMPTY cells only: { kind: answer|category|soa, key, value, current, rationale }. */
export function prefill(ws = S.ws) {
  const R = reg(ws), K = kri(ws), v = K.values, m = K.meta, out = [];
  const eids = [...new Set(R.findings.map(f => f.eid).filter(Boolean))];
  const cite = eids.length ? ' ' + eids.join(', ') + '.' : '';
  const anyRows = keys => keys.some(k => R[k].length);
  const M = ws.maturity || {}, answers = M.answers || {}, scores = M.scores || {}, soa = ws.compliance?.soa || {};
  // pv1
  {
    const t01 = R.privileged.filter(r => Number(r.tier) <= 1);
    let val = null;
    if (v['CRG-18'] === null) val = -1;
    else if (v['CRG-18'] === 100) val = m['CRG-18'].unknown === 0 && t01.every(r => r.evidence) ? 3 : 2;
    else if (m['CRG-18'].unknown > 0) val = -1;
    else val = v['CRG-18'] > 0 ? 1 : 0;
    out.push({ kind: 'answer', key: 'pv1', value: val, current: answers.pv1 ?? null, rationale: `CRG-18 ${v['CRG-18'] ?? '—'} % (${m['CRG-18'].num}/${m['CRG-18'].den}), rows ${R.privileged.map(r => r.id).join(', ') || '—'}.${cite}` });
  }
  // pv3
  {
    const from = monthsBefore(K.asOf, R.settings.reviewMonths);
    const closed = R.reviews.some(r => r.closed && r.closed > from && r.closed <= K.asOf);
    const noDormant = R.accounts.length > 0 && R.accounts.every(r => r.dormant === 0);
    const val = v['CRG-20'] !== null && v['CRG-20'] >= 98 && noDormant ? 2 : closed ? 1 : -1;
    out.push({ kind: 'answer', key: 'pv3', value: val, current: answers.pv3 ?? null, rationale: `CRG-20 ${v['CRG-20'] ?? '—'} %, dormant ${figures(ws).dormant ?? '—'}, campaigns ${R.reviews.map(r => r.id).join(', ') || '—'}.${cite}` });
  }
  // categories
  {
    const closedAny = R.reviews.some(r => r.closed);
    let aa = anyRows(['accounts', 'privileged', 'emergency', 'reviews', 'sod']) ? 1 : 0;
    if (aa && closedAny && v['CRG-18'] !== null && v['CRG-18'] >= 95) aa = 2;
    if (aa === 2 && ['CRG-17', 'CRG-18', 'CRG-20'].every(id => onTarget(id, ws, K) && m[id].unknown === 0)) aa = 3;
    if (aa) out.push({ kind: 'category', key: 'PR.AA', value: aa, current: scores['PR.AA'] ?? null, rationale: `Registers: ${['accounts', 'privileged', 'emergency', 'reviews', 'sod'].map(k => `${k} ${R[k].length}`).join(', ')}; CRG-17 ${v['CRG-17'] ?? '—'}, CRG-18 ${v['CRG-18'] ?? '—'}, CRG-20 ${v['CRG-20'] ?? '—'}. Never above 3.${cite}` });
    const F = figures(ws);
    const assessedAny = R.ciScopes.some(cs => isNum(scopeCounts(cs, ws).assessed) && scopeCounts(cs, ws).assessed > 0);
    let ps = anyRows(['baselines', 'ciScopes', 'deviations', 'changes']) ? 1 : 0;
    if (ps && assessedAny && v['CRG-22'] !== null && v['CRG-22'] >= 95 && F.adherence !== null && F.adherence >= 95 && v['CRG-24'] === 0) ps = 2;
    if (ps === 2 && onTarget('CRG-22', ws, K) && m['CRG-22'].unknown === 0 && F.adherence >= 95 && v['CRG-24'] === 0) ps = 3;
    if (ps) out.push({ kind: 'category', key: 'PR.PS', value: ps, current: scores['PR.PS'] ?? null, rationale: `CRG-22 ${v['CRG-22'] ?? '—'}, adherence ${F.adherence ?? '—'} %, CRG-24 ${v['CRG-24'] ?? '—'}. Never above 3.${cite}` });
  }
  // statement of applicability
  {
    const F = figures(ws);
    const T = id => ({ has: v[id] !== null && v[id] !== undefined, ok: onTarget(id, ws, K) });
    const chg = { has: F.changesVerified !== null, ok: F.changesVerified !== null && F.changesVerified >= 98 };
    const dorm = { has: F.dormant !== null, ok: F.dormant === 0 && F.dormantUnknown === 0 };
    const MAP = { '5.16': ['CRG-17', 'CRG-20'], '5.18': ['CRG-17', 'CRG-20'], '5.15': ['CRG-18', 'CRG-19'], '8.2': ['CRG-18', 'CRG-19'], '5.17': ['CRG-18'], '8.5': ['CRG-18'],
      'PR.AA-03': ['CRG-18'], '8.9': ['CRG-22', 'CRG-24'], 'CIS 4': ['CRG-22', 'CRG-24'], 'PR.PS-01': ['CRG-22', 'CRG-24'], '8.32': ['changes'], 'CIS 5': ['CRG-17', 'dormant'],
      'PR.AA-01': ['CRG-17', 'dormant'], 'CIS 6': ['CRG-20'], 'PR.AA-05': ['CRG-20'] };
    for (const key of CONTROLS.soa) {
      const id = key.slice(key.indexOf(':') + 1), ks = MAP[id] || [];
      const st = ks.map(k => k === 'changes' ? chg : k === 'dormant' ? dorm : T(k));
      const value = st.length && st.every(x => x.ok) ? 'implemented' : st.some(x => x.has) ? 'partial' : null;
      if (!value) continue;
      out.push({ kind: 'soa', key, value, current: soa[key]?.status || null,
        rationale: `${ks.map(k => k === 'changes' ? `changes verified ${F.changesVerified ?? '—'} %` : k === 'dormant' ? `dormant ${F.dormant ?? '—'}` : `${k} ${v[k] ?? '—'}`).join(', ')}.${cite}` });
    }
  }
  return out;
}
/** "Apply ticked": fills empty cells only, never overwrites a differing answer. Returns the number filled. */
export function applyPrefill(ws, items) {
  let n = 0;
  ws.maturity ||= {}; const M = ws.maturity;
  M.answers ||= {}; M.scores ||= {}; M.evidence ||= {};
  ws.compliance ||= { frameworks: [], soa: {}, checklists: {} }; ws.compliance.soa ||= {};
  for (const it of items) {
    if (it.kind === 'answer') { if (M.answers[it.key] !== undefined && M.answers[it.key] !== null) continue; M.answers[it.key] = it.value; n++; }
    else if (it.kind === 'category') { if (Number.isFinite(Number(M.scores[it.key])) && M.scores[it.key] !== '' && M.scores[it.key] !== null) continue; M.scores[it.key] = it.value; M.evidence[it.key] ||= it.rationale; n++; }
    else if (it.kind === 'soa') { const r = (ws.compliance.soa[it.key] ||= {}); if (r.status) continue; r.status = it.value; r.evidence ||= it.rationale; r.updated = today(); n++; }
  }
  return n;
}

/* ---------------- import from a report (§10.1) ---------------- */
const ACCOUNT_HINT = [['service', /serv|svc|workload|app(lication)?\b|daemon|system/i], ['ai_agent', /\bagent|\bbot\b|\bai\b|\bia\b/i], ['emergency', /break.?glass|emergency|urgence/i],
  ['contractor', /contract|vendor|extern|guest|locum|supplier|fournisseur|invit/i]];
const YES = /^(y|yes|true|1|enabled|on|registered|oui|vrai|actif|active)$/i;
const PR = /fido|webauthn|passkey|smart ?card|piv|cert|windows hello|yubikey/i;
/** Guess the column of each concept from the header row. */
export function guessColumns(header) {
  const h = header.map(x => String(x || '').toLowerCase());
  const find = re => h.findIndex(x => re.test(x));
  return { type: find(/type|kind|category|catégorie/), enabled: find(/enabled|active|status|état|statut|actif/), lastSignIn: find(/last.?(sign|log)|dernière.?connexion|lastlogon/),
    mfa: find(/^mfa$|mfa.?(enabled|registered|status)|multi.?factor|amf/), mfaMethod: find(/method|méthode/), owner: find(/owner|propriétaire|responsable|sponsor|manager/),
    tier: find(/tier|niveau|role|rôle|privilege|privilège/) };
}
/** Counts per account type and privileged tier from a table — computed here, the rows never kept. */
export function countsFromTable(rows, cols, { dormantDays = 90, at = today() } = {}) {
  const acc = {}, priv = {};
  let used = 0;
  for (const r of rows) {
    const enabled = cols.enabled < 0 || !/^(n|no|false|0|disabled|off|inactive|non|faux|désactivé|inactif)$/i.test(String(r[cols.enabled] || '').trim());
    if (!enabled) continue;
    used++;
    const tv = String(r[cols.type] ?? '');
    const type = (ACCOUNT_HINT.find(([, re]) => re.test(tv)) || ['employee'])[0];
    const a = (acc[type] ||= { register: 'accounts', type, count: 0, mfa: HUMAN.has(type) ? 0 : null, mfaPR: HUMAN.has(type) ? 0 : null, dormant: 0, ownerless: 0, tag: 'FACT' });
    a.count++;
    const meth = String(r[cols.mfaMethod] ?? '').trim();
    const hasMfa = cols.mfa >= 0 ? YES.test(String(r[cols.mfa] ?? '').trim()) || (!!meth && !/none|aucun|^-$/i.test(meth)) : !!meth && !/none|aucun/i.test(meth);
    if (HUMAN.has(type) && hasMfa) { a.mfa++; if (PR.test(meth)) a.mfaPR++; }
    const last = String(r[cols.lastSignIn] ?? '').trim().slice(0, 10);
    if (cols.lastSignIn >= 0 && (!/^\d{4}-\d{2}-\d{2}$/.test(last) || daysBetween(last, at) > dormantDays)) a.dormant++;
    if (cols.owner >= 0 && !String(r[cols.owner] ?? '').trim()) a.ownerless++;
    if (cols.tier >= 0) {
      const m = /(?:tier|niveau|t)\s*([012])\b|^([012])$/i.exec(String(r[cols.tier] ?? '').trim());
      if (m) { const t = Number(m[1] ?? m[2]); const p = (priv[t] ||= { register: 'privileged', tier: t, holders: 0, mfa: 0, mfaPR: 0, tag: 'FACT' }); p.holders++; if (hasMfa) { p.mfa++; if (PR.test(meth)) p.mfaPR++; } }
    }
  }
  return { items: [...Object.values(acc), ...Object.values(priv).sort((x, y) => x.tier - y.tier)], used };
}
/** Tabular text (CSV or the tab-separated text of an XLSX) to rows. */
export function tableRows(text, parse) { return parse(String(text || '').split('\n').filter(l => !/^## /.test(l)).join('\n')); }

/** The AI answer, kept only where it is a whitelisted count or enumeration; anything else is dropped. */
const AI_KEYS = { accounts: ['count', 'mfa', 'mfaPR', 'dormant', 'ownerless'], privileged: ['holders', 'standing', 'jit', 'mfa', 'mfaPR', 'shared'],
  emergency: ['count', 'uses', 'usesReviewed'], reviews: ['decisionsDue', 'decisionsDone', 'revocationsRequested', 'revocationsVerified', 'reviewerConflicts'],
  ciScopes: ['inScope', 'assigned', 'assessed', 'compliant'], changes: ['count', 'verified'] };
export function parseAIItems(json) {
  const raw = Array.isArray(json) ? json : (json?.items || []);
  const out = [];
  let dropped = 0;
  for (const x of raw) {
    if (!x || typeof x !== 'object' || !AI_KEYS[x.register]) { dropped++; continue; }
    const it = { register: x.register, tag: TAGS.includes(String(x.tag).toUpperCase()) ? String(x.tag).toUpperCase() : 'UNKNOWN' };
    if (x.register === 'accounts') { if (!TYPES.some(t => t[0] === x.type)) { dropped++; continue; } it.type = x.type; }
    if (x.register === 'privileged') { const t = Number(x.tier); if (![0, 1, 2].includes(t)) { dropped++; continue; } it.tier = t; }
    if (x.register === 'changes') it.type = CH_TYPES.some(t => t[0] === x.type) ? x.type : 'normal';
    for (const k of AI_KEYS[x.register]) { const v = Number(x[k]); if (x[k] !== null && x[k] !== undefined && x[k] !== '' && Number.isInteger(v) && v >= 0) it[k] = v; }
    const pg = Number(x.page); if (Number.isInteger(pg) && pg > 0 && pg < 100000) it.page = pg;
    for (const [k, v] of Object.entries(x)) if (typeof v === 'string' && guardText(v)?.block) dropped++;
    out.push(it);
  }
  return { items: out, dropped };
}
/** Personal-data-like tokens in a text (for the payload preview). */
export function tokenCount(text) {
  const t = String(text || '');
  return (t.match(new RegExp(EMAIL.source, 'g')) || []).length + (t.match(new RegExp(DOMAIN_USER.source, 'g')) || []).length + (t.match(new RegExp(SID.source, 'gi')) || []).length;
}
/** Accept reviewed counts: new rows with provenance; nothing else is written. Returns the rows created. */
export function acceptImport(ws, items, { file, sha256, bytes, rows, method, by = '' }) {
  const R = reg(ws), made = [];
  for (const it of items) {
    const register = it.register; if (!AI_KEYS[register]) continue;
    const row = { ...blankRow(register), id: nextIdReg(R[register], REGISTERS[register].prefix) };
    for (const k of AI_KEYS[register]) if (isNum(it[k])) row[k] = it[k];
    if (register === 'accounts') { row.type = it.type; row.label = (TYPES.find(t => t[0] === it.type)?.[1] || it.type) + ' (imported)'; if (!HUMAN.has(row.type)) { row.mfa = null; row.mfaPR = null; } row.reconciled = today(); }
    if (register === 'privileged') { row.tier = it.tier; row.label = (TIERS.find(t => t[0] === it.tier)?.[1] || 'Tier ' + it.tier) + ' (imported)'; }
    if (register === 'changes') row.type = it.type || 'normal';
    row.source = String(file + (it.page ? ', p. ' + it.page : '')).slice(0, 200);
    row.prov = { tag: TAGS.includes(it.tag) ? it.tag : 'UNKNOWN', method, file, date: today() };
    row.status = 'inferred';
    R[register].push(row); made.push(row);
  }
  R.imports.push({ at: new Date().toISOString(), file, sha256, bytes, rows, method, proposed: items.length, accepted: made.length, by });
  return made;
}
export const nextIdReg = (rows, prefix) => prefix + '-' + String(rows.reduce((m, r) => Math.max(m, Number(String(r.id || '').split('-').pop()) || 0), 0) + 1).padStart(2, '0');
export async function sha256(buf) { const h = await crypto.subtle.digest('SHA-256', buf); return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join(''); }

/* ---------------- teaching-case samples (§9) ---------------- */
/** Which teaching case a workspace is, from its name: 'medibec', 'canaretail' or null. */
export function caseOf(ws) {
  if (!ws || ws.kind !== 'example') return null;
  const n = [ws.name, ws.org?.name].join(' ');
  return /medibec/i.test(n) ? 'medibec' : /cana\s*retail/i.test(n) ? 'canaretail' : null;
}
/** The language of a teaching case (its labels follow it). */
export const caseLang = ws => (ws.lang || ws.org?.lang || ws.teaching?.lang || (/\b(fictif|fictive|cas d.enseignement)\b/i.test(ws.name || '') ? 'fr' : 'en')) === 'fr' ? 'fr' : 'en';
export const registersEmpty = ws => !ws.ipc || REGISTER_KEYS.every(k => !(ws.ipc[k] || []).length) && !(ws.ipc.findings || []).length;
/**
 * Load a per-case sample into a workspace: rows (labels in the case language), evidence appended at the
 * next free E-numbers with every reference remapped, sample exceptions appended to the shared register,
 * findings recorded and linked, and proposals saved as PENDING — never accepted. Returns a summary.
 */
export function applySample(ws, sample, { lang = caseLang(ws) } = {}) {
  if (!sample) return null;
  const pick = v => v && typeof v === 'object' && !Array.isArray(v) && ('en' in v || 'fr' in v) ? (v[lang] ?? v.en) : v;
  const deep = v => Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? (('en' in v || 'fr' in v) && Object.keys(v).every(k => k === 'en' || k === 'fr') ? pick(v) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)]))) : v;
  const R = reg(ws), out = { rows: 0, evidence: [], exceptions: [], findings: 0, proposals: 0 };
  // evidence: next free E-numbers, remapped
  const emap = {};
  for (const e of sample.evidence || []) {
    const id = nextE(ws);
    emap[e.id] = id;
    (ws.assessment.EVIDENCE ||= []).push([id, pick(e.title), 'Documented', pick(e.supports) || '', e.strength || 'moderate', e.classification || '', e.date || '', e.custodian || '']);
    out.evidence.push(id);
  }
  const remapE = s => typeof s === 'string' ? s.replace(/\bE\d+\b/g, m => emap[m] || m) : s;
  // exceptions
  const xmap = {};
  for (const x of sample.exceptions || []) {
    const X = SH.exceptions(ws);
    let id = x.id;
    if (X.some(e => e.id === id)) id = 'EXC-' + String(X.reduce((m, e) => Math.max(m, Number(String(e.id).split('-').pop()) || 0), 0) + 1).padStart(3, '0');
    xmap[x.id] = id;
    X.push(deep({ type: 'exception', compensatedBy: [], scenarios: [], waivesLaw: false, severity: 'medium', ...x, id }));
    out.exceptions.push(id);
  }
  // rows
  Object.assign(R.settings, sample.settings || {});
  for (const k of REGISTER_KEYS) for (const row of sample[k] || []) {
    const r = { ...blankRow(k), ...deep(row) };
    if (r.evidence) r.evidence = remapE(r.evidence);
    if (r.source) r.source = remapE(r.source);
    if (k === 'baselines') for (const v of r.versions || []) if (v.state === 'approved' && !v.hash) v.hash = versionHash(v);
    if (r.exception) r.exception = xmap[r.exception] || r.exception;
    r.prov = { tag: 'FACT', method: 'manual', file: 'teaching case', date: sample.settings?.asOf || today(), ...(row.prov || {}) };
    R[k].push(r); out.rows++;
  }
  // findings, linked, with proposals left pending
  for (const f of sample.findings || []) {
    const rule = RULE[f.rule];
    const scen = (f.scenarios || []).map(s => typeof s === 'string' ? { id: s, param: null } : s);
    for (const s of scen) if (!ws.assessment.SCEN.some(x => x.id === s.id)) throw new Error(`Sample finding ${f.rule}: scenario ${s.id} is not in this case.`);
    const rec = { id: nextId(R.findings, 'IF'), rule: f.rule, register: f.register || rule.register, rowId: f.rowId, title: pick(f.title) || rule.title, severity: rule.severity,
      state: 'recorded', eid: emap[f.eid] || '', scenarios: scen, proposals: [], action: '', created: sample.settings?.asOf || today() };
    for (const p of f.proposals || []) {
      const s = p.scenario ? ws.assessment.SCEN.find(x => x.id === p.scenario) : ws.assessment.SCEN.find(x => p.scenarioMatch && new RegExp(p.scenarioMatch, 'i').test(x.name || ''));
      if (!s) throw new Error(`Sample proposal: no scenario matches ${p.scenario || p.scenarioMatch}.`);
      rec.proposals.push({ scenario: s.id, param: p.param, from: Number(s.params?.[p.param]?.v), to: p.to, rationale: remapE(pick(p.rationale) || ''), conf: p.conf || 'Low',
        state: 'proposed', date: sample.settings?.asOf || today(), by: 'teaching case', decidedBy: '', decidedOn: '', reason: '' });
      if (!rec.scenarios.some(x => x.id === s.id)) rec.scenarios.push({ id: s.id, param: p.param });
      out.proposals++;
    }
    if (f.evidenceAtNext && !rec.eid) {
      const row = (R[rec.register] || []).find(r => r.id === rec.rowId);
      rec.eid = nextE(ws);
      ws.assessment.EVIDENCE.push([rec.eid, pick(f.evidenceAtNext.title), 'Documented', `Supports: ${rec.scenarios.map(s => s.id + (s.param ? ' ' + PARAMS.find(x => x[0] === s.param)[1] : '')).join(', ')}`,
        'moderate', '', sample.settings?.asOf || '', row?.owner || '']);
      out.evidence.push(rec.eid);
    }
    R.findings.push(rec); out.findings++;
  }
  return out;
}

/* ---------------- tips for the process steps (§1) ---------------- */
export const STEP_TIPS = {
  setup: ['Identity, privilege & configuration: record a finding as evidence and it takes the next E-number of the evidence register.'],
  context: ['Identity, privilege & configuration holds the account, privileged-role and baseline populations of the organization — counts only, never names.'],
  quantify: ['A recorded identity, privilege or configuration finding can propose a Pb(ψ,A) or θ change; accepting it is a separate act in Findings & proposals.'],
  monitor: ['Switching on Identity, privilege & configuration adds eight automatic indicators, CRG-17 to CRG-24, to the KRI dashboard.'],
};
export const STEP_LINKS = { setup: [['ipc/findings', 'Findings & proposals']], context: [['ipc/overview', 'Identity, privilege & configuration']], quantify: [['ipc/findings', 'Findings & proposals']], monitor: [['ipc/overview', 'Identity, privilege & configuration']] };

export { touch };
