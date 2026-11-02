/* iam.js — Identity & access management (IAM/PAM): the model behind the optional module (workspace field `iam`).

   Five population-level registers — account populations, privileged roles by tier, emergency (break-glass)
   accounts, access-review campaigns and segregation-of-duties rules — counts per group, never per person,
   never a secret. From them: six automatic KRIs (CRG-17 to CRG-21 and CRG-23), finding rules IR-01 to IR-10
   (and IR-16 for its stale or conflicting rows), proposals for the resilience questions pv1 and pv3, the CSF 2.0
   category PR.AA and the identity rows of the statement of applicability, and links to scenarios as evidence.
   A change to Pb(ψ,A) or θ is only ever proposed. The shared machinery is in regcore.js.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, touch } from './state.js';
import * as C from './regcore.js';
import * as MOD from './modules.js';
import { today } from './util.js';

export { TYPES, HUMAN, TIERS, CONTROLS_EMERGENCY, YNU, POPULATIONS, SEVERITY, STATUS, CONF, TAGS, PARAMS, REGISTERS, blankRow, validate, guardText, guardRow,
  rowStale, staleDate, isNum, rowLabel, rowOf, link, propose, dismiss, applyPrefill, tokenCount, tableRows, sha256, nextIdReg, caseOf, caseLang, status, setOverride, daysBetween, monthsBefore } from './regcore.js';

export const ID = 'iam';
export const LABEL = 'Identity & access management (IAM/PAM)';
export const REGISTER_KEYS = ['accounts', 'privileged', 'emergency', 'reviews', 'sod'];
export const blankSettings = () => ({ asOf: null, staleDays: 90, reviewMonths: 12, testDays: 365, dormantDays: 90 });
export const blank = () => ({ settings: blankSettings(), accounts: [], privileged: [], emergency: [], reviews: [], sod: [], findings: [], imports: [] });
export const on = () => MOD.enabled(ID);
// read through the namespace at call time (no top-level destructuring: the import cycle via state.js may not have evaluated regcore.js yet)
const isNum = v => C.isNum(v), sum = (r, f) => C.sum(r, f), monthsBefore = (d, m) => C.monthsBefore(d, m), rowStale = (k, r, w) => C.rowStale(k, r, w);

/* ---------------- CRGO alignment ----------------
   Filled from CRGO 0.11.0 (docs/crg-brief-0.11.0.md; every 0.11 term approved by the CRGO project owner on
   2026-11-02, src/approvals.tsv, tag v0.11.0). `sup` is the CRGO (or CCO) superclass or value set the term sits under. A
   release build fails if a placeholder ever comes back (tools/crgo_tbd_check.py --release). */
const CRGO_NS = 'https://w3id.org/crgo/';
const T = (n, sup, status = 'approved') => ({ iri: CRGO_NS + n, sup, status });
/** The CRGO release the identifiers come from. */
export const CRGO_RELEASE = '0.11.0';
export const CRGO = {
  AccountPopulation: T('CRGO_0001384', 'CRGO_0000528'),             // account population ⊑ population
  PrivilegedRolePopulation: T('CRGO_0001386', 'CRGO_0000528'),      // privileged role holder population ⊑ population
  EmergencyAccessAccountSet: T('CRGO_0001385', 'CRGO_0001384'),     // emergency access account population ⊑ account population
  AccessReviewCampaign: T('CRGO_0001354', 'cco:ont00000228'),       // access review campaign (a planned act)
  SegregationRule: T('CRGO_0001350', 'CRGO_0000019'),               // segregation-of-duties rule ⊑ control
  IdentityFinding: T('CRGO_0001364', 'CRGO_0000018'),               // identity finding ⊑ control gap finding
  PrivilegeFinding: T('CRGO_0001365', 'CRGO_0001364'),              // privilege finding ⊑ identity finding
  RegisterRecord: T('CRGO_0000036', 'CRGO_0000036', 'approved'),    // evidence register entry (existing term)
  // the indicators: values of the value set identity and configuration indicator CRGO_0001467 (an outcome metric
  // CRGO_0001382, a key risk indicator, has indicator kind CRGO_0001532 → one of these)
  'CRG-17': T('CRGO_0001469', 'CRGO_0001467'), 'CRG-18': T('CRGO_0001470', 'CRGO_0001467'), 'CRG-19': T('CRGO_0001471', 'CRGO_0001467'),
  'CRG-20': T('CRGO_0001472', 'CRGO_0001467'), 'CRG-21': T('CRGO_0001473', 'CRGO_0001467'),
  // CRGO 0.11 has one known-coverage value, for configuration (CRGO_0001475, CRG-25 of Configuration management);
  // identity data known coverage is recorded under the value set itself until CRGO names a narrower value
  'CRG-23': T('CRGO_0001467', 'CRGO_0001382'),
  // an accepted proposal is an existing decision record
  AcceptedProposal: T('CRGO_0000504', 'CRGO_0000504', 'approved'),
};
/** The CRGO concepts still waiting for a CRGO identifier (none since CRGO 0.11.0). */
export const crgoPending = () => Object.entries(CRGO).filter(([, v]) => !/\/CRGO_\d{7}$/.test(v.iri)).map(([k]) => k);
/** The CRGO concepts whose 0.11 term is still proposed (awaiting the CRGO project owner's approval). */
export const crgoProposed = () => Object.entries(CRGO).filter(([, v]) => v.status === 'proposed').map(([k]) => k);

/** CIS Controls v8.1 used by the module: identifiers with the author's own short labels (no CIS text). */
export const CIS = [['CIS 5', 'Manage accounts through their life'], ['CIS 6', 'Grant, change and remove access deliberately']];
export const CIS_SAFEGUARDS = ['5.1', '5.3', '5.4', '5.5', '6.1', '6.2', '6.5', '6.8'];

/** The existing maturity, resilience and statement-of-applicability keys the module speaks to. */
export const CONTROLS = {
  categories: ['PR.AA'],
  questions: ['pv1', 'pv3', 'ct2', 'ct3'],
  soa: ['ISO22:5.15', 'ISO22:5.16', 'ISO22:5.17', 'ISO22:5.18', 'ISO22:8.2', 'ISO22:8.5', 'CSF2:PR.AA-01', 'CSF2:PR.AA-03', 'CSF2:PR.AA-05', 'CIS81:CIS 5', 'CIS81:CIS 6'],
};

/* ---------------- KRIs ---------------- */
export const KRIS = [
  { id: 'CRG-17', name: 'Identity ownership coverage', unit: '%', dir: 'up', target: 99, warn: 99, crit: 95, risk: 'Accounts without an accountable owner', method: '100 × Σ(count − ownerless) ÷ Σ count', fmt: 2, module: ID },
  { id: 'CRG-18', name: 'Privileged MFA coverage', unit: '%', dir: 'up', target: 100, warn: 99, crit: 95, risk: 'Takeover of privileged access', method: '100 × Σ MFA ÷ Σ holders, tiers 0–2 (unknown MFA counts as none)', fmt: 2, module: ID },
  { id: 'CRG-19', name: 'Standing-privilege ratio', unit: '%', dir: 'down', target: 20, warn: 30, crit: 50, risk: 'Standing privileged access', method: '100 × Σ standing ÷ Σ holders, tiers 0–1 (unknown standing counts as all holders)', fmt: 2, module: ID },
  { id: 'CRG-20', name: 'Access-review completion', unit: '%', dir: 'up', target: 98, warn: 98, crit: 90, risk: 'Access no longer needed', method: '100 × Σ decisions made ÷ Σ decisions due, campaigns due in the review window', fmt: 2, module: ID },
  { id: 'CRG-21', name: 'Emergency use reviewed', unit: '%', dir: 'up', target: 100, warn: 100, crit: 80, risk: 'Unreviewed emergency access', method: '100 × Σ reviewed uses ÷ Σ uses', fmt: 2, module: ID },
  { id: 'CRG-23', name: 'Identity data known coverage', unit: '%', dir: 'up', target: 95, warn: 90, crit: 70, risk: 'Decisions made on unknown identity data', method: '100 × required identity values known and fresh ÷ required values', fmt: 2, module: ID },
];
export const KRI_IDS = KRIS.map(k => k.id);

/** The six values with their basis: { values: {id: v|null}, meta: {id: {num, den, unknown, stale, na, ...}}, asOf }. */
export function kri(ws = S.ws) {
  const R = reg(ws), at = asOf(ws), st = R.settings;
  const { values, meta, put } = C.collector();
  // CRG-17
  {
    const rows = R.accounts, withCount = rows.filter(r => isNum(r.count)), both = withCount.filter(r => isNum(r.ownerless));
    put('CRG-17', sum(both, r => r.count - r.ownerless), sum(withCount, r => r.count), { empty: !rows.length, denKnown: withCount.length,
      unknown: rows.filter(r => !isNum(r.count) || !isNum(r.ownerless)).length, stale: rows.filter(r => rowStale('accounts', r, ws)).length });
  }
  // CRG-18 / CRG-19
  {
    const P = R.privileged, all = P.filter(r => [0, 1, 2].includes(Number(r.tier))), t01 = all.filter(r => Number(r.tier) <= 1);
    const hold = r => isNum(r.holders) ? r.holders : 0;
    put('CRG-18', sum(all, r => Math.min(isNum(r.mfa) ? r.mfa : 0, hold(r))), sum(all, hold), { empty: !P.length, denKnown: all.length ? all.filter(r => isNum(r.holders)).length : undefined,
      unknown: all.filter(r => !isNum(r.mfa) || !isNum(r.holders)).length, stale: all.filter(r => rowStale('privileged', r, ws)).length,
      more: { pr: sum(all, r => isNum(r.mfaPR) ? r.mfaPR : 0), prUnknown: all.filter(r => !isNum(r.mfaPR)).length } });
    put('CRG-19', sum(t01, r => isNum(r.standing) ? r.standing : hold(r)), sum(t01, hold), { empty: !P.length, denKnown: t01.length ? t01.filter(r => isNum(r.holders)).length : undefined,
      unknown: t01.filter(r => !isNum(r.standing) || !isNum(r.holders)).length, stale: t01.filter(r => rowStale('privileged', r, ws)).length });
  }
  // CRG-20
  {
    const from = monthsBefore(at, st.reviewMonths);
    const inWin = R.reviews.filter(r => r.due && r.due > from && r.due <= at);
    put('CRG-20', sum(inWin, r => isNum(r.decisionsDone) ? r.decisionsDone : 0), sum(inWin, r => isNum(r.decisionsDue) ? r.decisionsDue : 0), { empty: !R.reviews.length,
      denKnown: inWin.length ? inWin.filter(r => isNum(r.decisionsDue)).length : undefined,
      unknown: inWin.filter(r => !isNum(r.decisionsDone) || !isNum(r.decisionsDue)).length, more: { campaigns: inWin.length } });
  }
  // CRG-21
  {
    const E = R.emergency, known = E.filter(r => isNum(r.uses));
    put('CRG-21', sum(known, r => isNum(r.usesReviewed) ? Math.min(r.usesReviewed, r.uses) : 0), sum(known, r => r.uses), { empty: !E.length, denKnown: known.length,
      unknown: E.filter(r => !isNum(r.uses) || !isNum(r.usesReviewed)).length });
  }
  // CRG-23
  {
    const k = known(ws);
    put('CRG-23', k.known, k.required, { empty: !k.rows, more: { staleValues: k.staleValues } });
  }
  return { values, meta, asOf: at };
}

/** CRG-23: required identity values known and fresh, register by register. */
export function known(ws = S.ws) {
  const R = reg(ws);
  let required = 0, k = 0, staleValues = 0, rows = 0;
  const req = (ok) => { required++; if (ok) k++; };
  const date = (register, row) => { required++; const s = rowStale(register, row, ws); if (s) staleValues++; else k++; };
  for (const r of R.accounts) { rows++; ['count', 'dormant', 'ownerless'].forEach(f => req(isNum(r[f]))); date('accounts', r); if (C.HUMAN.has(r.type)) ['mfa', 'mfaPR'].forEach(f => req(isNum(r[f]))); }
  for (const r of R.privileged) { rows++; ['holders', 'standing', 'mfa', 'mfaPR'].forEach(f => req(isNum(r[f]))); date('privileged', r); }
  for (const r of R.emergency) { rows++; ['count', 'uses', 'usesReviewed'].forEach(f => req(isNum(r[f]))); date('emergency', r);
    for (const [c] of C.CONTROLS_EMERGENCY) req((r.controls?.[c] || 'unknown') !== 'unknown'); }
  for (const r of R.reviews) { rows++; ['decisionsDue', 'decisionsDone', 'revocationsRequested', 'revocationsVerified'].forEach(f => req(isNum(r[f]))); }
  return { required, known: k, staleValues, rows };
}

/* ---------------- overview figures ---------------- */
export function figures(ws = S.ws) {
  const R = reg(ws);
  const dormant = R.accounts.filter(r => isNum(r.dormant));
  const unverified = R.reviews.filter(r => isNum(r.revocationsRequested)).reduce((t, r) => t + Math.max(0, r.revocationsRequested - (isNum(r.revocationsVerified) ? r.revocationsVerified : 0)), 0);
  return { dormant: dormant.length ? sum(dormant, r => r.dormant) : null, dormantUnknown: R.accounts.length - dormant.length, unverified: R.reviews.length ? unverified : null };
}

/* ---------------- finding rules ---------------- */
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
  { id: 'IR-16', register: '*', severity: 'low', param: null, dir: '', title: 'Stale or conflicting register row' },
];
export const RULE = Object.fromEntries(RULES.map(r => [r.id, r]));
const lt = (a, b) => isNum(b) && (!isNum(a) || a < b);
function deriveInto(ws, add) {
  const R = reg(ws);
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
  for (const k of REGISTER_KEYS) for (const r of R[k]) if (r.status === 'conflicting' || rowStale(k, r, ws)) add('IR-16', k, r);
}

/* ---------------- maturity and statement of applicability ---------------- */
/** Proposals for EMPTY cells only: { kind: answer|category|soa, key, value, current, rationale }. */
export function prefill(ws = S.ws) {
  const R = reg(ws), K = kri(ws), v = K.values, m = K.meta, out = [];
  const eids = [...new Set(R.findings.map(f => f.eid).filter(Boolean))];
  const cite = eids.length ? ' ' + eids.join(', ') + '.' : '';
  const MT = ws.maturity || {}, answers = MT.answers || {}, scores = MT.scores || {};
  const F = figures(ws);
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
    out.push({ kind: 'answer', key: 'pv3', value: val, current: answers.pv3 ?? null, rationale: `CRG-20 ${v['CRG-20'] ?? '—'} %, dormant ${F.dormant ?? '—'}, campaigns ${R.reviews.map(r => r.id).join(', ') || '—'}.${cite}` });
  }
  // CSF 2.0 category PR.AA (capped at 3)
  {
    const closedAny = R.reviews.some(r => r.closed);
    let aa = REGISTER_KEYS.some(k => R[k].length) ? 1 : 0;
    if (aa && closedAny && v['CRG-18'] !== null && v['CRG-18'] >= 95) aa = 2;
    if (aa === 2 && ['CRG-17', 'CRG-18', 'CRG-20'].every(id => onTarget(id, ws, K) && m[id].unknown === 0)) aa = 3;
    if (aa) out.push({ kind: 'category', key: 'PR.AA', value: aa, current: scores['PR.AA'] ?? null, rationale: `Registers: ${REGISTER_KEYS.map(k => `${k} ${R[k].length}`).join(', ')}; CRG-17 ${v['CRG-17'] ?? '—'}, CRG-18 ${v['CRG-18'] ?? '—'}, CRG-20 ${v['CRG-20'] ?? '—'}. Never above 3.${cite}` });
  }
  // statement of applicability
  {
    const T = id => ({ has: v[id] !== null && v[id] !== undefined, ok: onTarget(id, ws, K) });
    const dorm = { has: F.dormant !== null, ok: F.dormant === 0 && F.dormantUnknown === 0 };
    const MAP = { '5.16': ['CRG-17', 'CRG-20'], '5.18': ['CRG-17', 'CRG-20'], '5.15': ['CRG-18', 'CRG-19'], '8.2': ['CRG-18', 'CRG-19'], '5.17': ['CRG-18'], '8.5': ['CRG-18'],
      'PR.AA-03': ['CRG-18'], 'CIS 5': ['CRG-17', 'dormant'], 'PR.AA-01': ['CRG-17', 'dormant'], 'CIS 6': ['CRG-20'], 'PR.AA-05': ['CRG-20'] };
    for (const it of C.soaProposals(ws, CONTROLS.soa, MAP, k => k === 'dormant' ? dorm : T(k), k => k === 'dormant' ? `dormant ${F.dormant ?? '—'}` : `${k} ${v[k] ?? '—'}`)) out.push({ ...it, rationale: it.rationale + '.' + cite });
  }
  return out;
}

/* ---------------- import from a report (rules for tables, AI for prose) ---------------- */
export const AI_KEYS = { accounts: ['count', 'mfa', 'mfaPR', 'dormant', 'ownerless'], privileged: ['holders', 'standing', 'jit', 'mfa', 'mfaPR', 'shared'],
  emergency: ['count', 'uses', 'usesReviewed'], reviews: ['decisionsDue', 'decisionsDone', 'revocationsRequested', 'revocationsVerified', 'reviewerConflicts'] };
const ACCOUNT_HINT = [['service', /serv|svc|workload|app(lication)?\b|daemon|system/i], ['ai_agent', /\bagent|\bbot\b|\bai\b|\bia\b/i], ['emergency', /break.?glass|emergency|urgence/i],
  ['contractor', /contract|vendor|extern|guest|locum|supplier|fournisseur|invit/i]];
const YES = /^(y|yes|true|1|enabled|on|registered|oui|vrai|actif|active)$/i;
const PRM = /fido|webauthn|passkey|smart ?card|piv|cert|windows hello|yubikey/i;
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
    const a = (acc[type] ||= { register: 'accounts', type, count: 0, mfa: C.HUMAN.has(type) ? 0 : null, mfaPR: C.HUMAN.has(type) ? 0 : null, dormant: 0, ownerless: 0, tag: 'FACT' });
    a.count++;
    const meth = String(r[cols.mfaMethod] ?? '').trim();
    const hasMfa = cols.mfa >= 0 ? YES.test(String(r[cols.mfa] ?? '').trim()) || (!!meth && !/none|aucun|^-$/i.test(meth)) : !!meth && !/none|aucun/i.test(meth);
    if (C.HUMAN.has(type) && hasMfa) { a.mfa++; if (PRM.test(meth)) a.mfaPR++; }
    const last = String(r[cols.lastSignIn] ?? '').trim().slice(0, 10);
    if (cols.lastSignIn >= 0 && (!/^\d{4}-\d{2}-\d{2}$/.test(last) || C.daysBetween(last, at) > dormantDays)) a.dormant++;
    if (cols.owner >= 0 && !String(r[cols.owner] ?? '').trim()) a.ownerless++;
    if (cols.tier >= 0) {
      const mm = /(?:tier|niveau|t)\s*([012])\b|^([012])$/i.exec(String(r[cols.tier] ?? '').trim());
      if (mm) { const t = Number(mm[1] ?? mm[2]); const p = (priv[t] ||= { register: 'privileged', tier: t, holders: 0, mfa: 0, mfaPR: 0, tag: 'FACT' }); p.holders++; if (hasMfa) { p.mfa++; if (PRM.test(meth)) p.mfaPR++; } }
    }
  }
  return { items: [...Object.values(acc), ...Object.values(priv).sort((x, y) => x.tier - y.tier)], used };
}
/** The request sent to the model (never shown as interface text): aggregate counts of the module's registers only. */
export const AI_PROMPT = `Extract AGGREGATE COUNTS ONLY from the report below, for population-level identity and access
registers.
Never output a name, username, e-mail address, account identifier, host name, IP address, password, key,
token or any quotation of the report: only the registers, enumerations and integer counts below.
Registers and their keys:
- accounts: type employee|contractor|service|ai_agent|emergency; count, mfa, mfaPR, dormant, ownerless
- privileged: tier 0|1|2; holders, standing, jit, mfa, mfaPR, shared
- emergency: count, uses, usesReviewed
- reviews: decisionsDue, decisionsDone, revocationsRequested, revocationsVerified, reviewerConflicts
Omit a key that the report does not state: an omitted count is unknown, which is different from zero.
Provenance tag for every item, exactly one of FACT, INFERENCE, ASSUMPTION, EXTERNAL, UNKNOWN;
"page" is the page number where the count appears, if any.
Answer with JSON only, in this shape:
{"items":[{"register":"accounts","type":"service","count":0,"ownerless":0,"tag":"FACT","page":1}]}`;

/* ---------------- teaching-case samples ---------------- */
/** Load the module's per-case sample (js/data/iam-samples.js). */
export const applySample = (ws, sample, opts = {}) => C.applySample(ws, M, sample, opts);
export const SAMPLES = () => globalThis.CRG_IAM_SAMPLES || {};

/* ---------------- tips for the process steps ---------------- */
export const STEP_TIPS = {
  setup: ['Identity & access management: record a finding as evidence and it takes the next E-number of the evidence register.'],
  context: ['Identity & access management holds the account and privileged-role populations of the organization — counts only, never names.'],
  quantify: ['A recorded identity or access finding can propose a Pb(ψ,A) or θ change; accepting it is a separate act in Findings & proposals.'],
  monitor: ['Switching on Identity & access management adds six automatic indicators, CRG-17 to CRG-21 and CRG-23, to the KRI dashboard.'],
};
export const STEP_LINKS = { setup: [['iam/findings', 'Findings & proposals']], context: [['iam/overview', 'Identity & access management (IAM/PAM)']], quantify: [['iam/findings', 'Findings & proposals']],
  monitor: [['iam/overview', 'Identity & access management (IAM/PAM)']] };

/* ---------------- the descriptor and the bound API ---------------- */
const M = { id: ID, field: ID, label: LABEL, registers: REGISTER_KEYS, blank, blankSettings, KRIS, RULES, RULE, AI_KEYS, kri, derive: deriveInto,
  cause: 'IAM', findingKind: 'iam-finding' };
export const MODULE = M;
export const { reg, asOf, defsWithOverrides, completeness, derive, proposed, record, recordEvidence, accept, pending, forScenario, basisOf, parseAIItems, acceptImport,
  registersEmpty, onTarget } = C.api(M);

export { touch };
