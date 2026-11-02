/* regcore.js — the population-register core shared by two optional modules:
     Identity & access management (IAM/PAM)  — js/iam.js, workspace field `iam`
     Configuration management                — js/cm.js,  workspace field `cm`

   Local governance registers kept at POPULATION level — counts per group of accounts, roles,
   campaigns, configuration scopes or change types — never per person or per account, and never a
   secret. Each module derives deterministic findings and automatic KRIs from its own registers,
   proposes existing maturity and statement-of-applicability answers, and links findings to
   scenarios as evidence (E-numbers). A change to Pb(ψ,A) or θ is only ever PROPOSED; accepting it is
   a separate act of the analyst. The engine, its formulas and the 19 process steps are unchanged.

   This file holds what both modules use: the register catalogue (fields, prefixes, validation,
   freshness), the guards, the KRI threshold rule, the finding → evidence → proposal → accept flow, the
   report import and the teaching-case loader. A function that concerns one module takes its
   descriptor M (iam.js / cm.js: { id, field, label, registers, blank, KRIS, RULES, … }).

   Rules carried here:
     • a count is an integer ≥ 0 or null (unknown) — never coerced to 0;
     • an unverified revocation never counts as done; an expired exception never counts;
     • a KRI is never green by excluding unknowns: an unknown or stale input caps it at warning;
     • rows hold groups, not people: e-mail addresses, UPNs, DOMAIN\user, SIDs and secrets are refused.
   Nothing here runs at load time: every function takes the workspace it works on.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S } from './state.js';
import { today } from './util.js';
import * as SH from './shared.js';
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

/** Every register, the module (workspace field) that owns it, its identifier prefix, its count and date fields. */
export const REGISTERS = {
  accounts: { module: 'iam', prefix: 'AP', label: 'Accounts', counts: ['count', 'mfa', 'mfaPR', 'dormant', 'ownerless'], dates: ['reconciled'] },
  privileged: { module: 'iam', prefix: 'PR', label: 'Privileged roles', counts: ['holders', 'standing', 'jit', 'mfa', 'mfaPR', 'shared'], dates: ['reviewed'] },
  emergency: { module: 'iam', prefix: 'BG', label: 'Emergency accounts', counts: ['count', 'uses', 'usesReviewed'], dates: ['lastTest', 'lastUse'] },
  reviews: { module: 'iam', prefix: 'AR', label: 'Access reviews', counts: ['decisionsDue', 'decisionsDone', 'revocationsRequested', 'revocationsVerified', 'reviewerConflicts'], dates: ['closed'] },
  sod: { module: 'iam', prefix: 'SD', label: 'Segregation of duties', counts: ['conflicts'], dates: ['reviewed'] },
  baselines: { module: 'cm', prefix: 'BL', label: 'Baselines', counts: [], dates: [] },
  ciScopes: { module: 'cm', prefix: 'CS', label: 'Configuration scopes', counts: ['inScope', 'assigned', 'assessed', 'compliant'], dates: ['asOf'] },
  deviations: { module: 'cm', prefix: 'DV', label: 'Deviations', counts: ['count'], dates: ['opened', 'lastSeen'] },
  changes: { module: 'cm', prefix: 'CH', label: 'Configuration changes', counts: ['count', 'verified'], dates: [] },
};
/** The module (workspace field) a register belongs to. */
export const ownerOf = register => REGISTERS[register]?.module || null;

/* ---------------- the record ---------------- */
/** Every window a module may use; each module keeps the ones it needs (iam: all, cm: asOf and staleDays). */
export const DEFAULT_SETTINGS = () => ({ asOf: null, staleDays: 90, reviewMonths: 12, testDays: 365, dormantDays: 90 });
/** A module's record in a workspace, created or completed in place (never replaced). */
export function reg(ws, M) {
  const r = (ws[M.field] ||= M.blank());
  const b = M.blank();
  for (const k of Object.keys(b)) if (r[k] === undefined || r[k] === null) r[k] = b[k];
  r.settings = Object.assign(M.blankSettings(), r.settings || {});
  return r;
}
/** The settings in force for a register: its module's, completed with the defaults. */
const settingsFor = (register, ws) => Object.assign(DEFAULT_SETTINGS(), ws?.[ownerOf(register)]?.settings || {});
const asOfFor = (register, ws) => settingsFor(register, ws).asOf || today();
export const asOf = (ws, M) => reg(ws, M).settings.asOf || today();

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
export const sum = (rows, f) => rows.reduce((t, r) => t + (f(r) || 0), 0);
const dayMs = 864e5;
const d = s => new Date(s + 'T00:00:00Z').getTime();
export const daysBetween = (a, b) => Math.round((d(b) - d(a)) / dayMs);
export function monthsBefore(date, m) { const x = new Date(date + 'T00:00:00Z'); x.setUTCMonth(x.getUTCMonth() - m); return x.toISOString().slice(0, 10); }
export const fixed = x => x === null ? null : +x.toFixed(2);

/** Freshness of a row's date, against its window: true when empty or older than the window. */
export function staleDate(date, register, key, ws = S.ws) {
  const st = settingsFor(register, ws), at = asOfFor(register, ws);
  if (!date) return true;
  if (key === 'reviewed') return date < monthsBefore(at, st.reviewMonths);
  if (key === 'lastTest') return daysBetween(date, at) > st.testDays;
  return daysBetween(date, at) > st.staleDays;      // reconciled, asOf
}
const FRESH_KEY = { accounts: 'reconciled', privileged: 'reviewed', emergency: 'lastTest', ciScopes: 'asOf', sod: 'reviewed' };
/** Is a row stale? (A stale row still counts; it is badged and lowers the module's known-coverage KRI.) */
export function rowStale(register, row, ws = S.ws) {
  const k = FRESH_KEY[register];
  if (!k || (register === 'ciScopes' && row.fromAssets)) return false;
  if (register === 'sod' && !row.reviewed) return false;
  return staleDate(row[k], register, k, ws);
}

/* ---------------- guards (personal data, secrets) ---------------- */
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

/* ---------------- validation (block = Save disabled, warn = Save allowed) ---------------- */
const MSG = {
  neg: 'Counts are whole numbers of zero or more. Leave blank when unknown — 0 means none.',
  future: 'A date of this register cannot be in the future.',
};
/** { block: message|null, warn: [messages] } for a row about to be saved. */
export function validate(register, row) {
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

/* ---------------- KRIs: thresholds and the module rules ---------------- */
/** Known-coverage and count indicators are never capped at warning by unknown or stale inputs. */
const NO_CAP = new Set(['CRG-23', 'CRG-24', 'CRG-25']);
const num = (v, dflt) => v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? dflt : Number(v);
/** The thresholds in force for a module's KRIs: defaults merged with the overrides in ws.kriDefs. */
export function defsWithOverrides(ws, KRIS) {
  const ov = Object.fromEntries((Array.isArray(ws.kriDefs) ? ws.kriDefs : []).filter(o => o && o.id).map(o => [o.id, o]));
  return KRIS.map(k => ov[k.id] ? { ...k, target: num(ov[k.id].target, k.target), warn: num(ov[k.id].warn, k.warn), crit: num(ov[k.id].crit, k.crit), override: ov[k.id] } : { ...k });
}
export function setOverride(ws, id, o, by = '') {
  ws.kriDefs = (Array.isArray(ws.kriDefs) ? ws.kriDefs : []).filter(x => x?.id !== id);
  if (o) ws.kriDefs.push({ id, target: o.target, warn: o.warn, crit: o.crit, by, date: today() });
}
/** A collector for a module's KRI values and their basis. Spec §5 N/A rule: empty register → no data; rows but a
    zero denominator → not applicable; rows whose denominator values are ALL unknown (denKnown 0) → no data, shown as
    an information gap with the unknown count (review L1). */
export function collector() {
  const values = {}, meta = {};
  const put = (id, n, den, extra = {}) => {
    const empty = extra.empty;
    const gap = !empty && !(den > 0) && !extra.count && extra.denKnown === 0;
    const na = !empty && !gap && !(den > 0) && !extra.count;
    values[id] = empty ? null : extra.count ? n : (den > 0 ? fixed(100 * n / den) : null);
    meta[id] = { num: n, den, unknown: extra.unknown || 0, stale: extra.stale || 0, na: !!na, empty: !!empty, gap: !!gap, ...extra.more };
  };
  return { values, meta, put };
}
/** Threshold evaluation (the same rule as the KRI dashboard), with the modules' two additions:
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

/** Rows per register of a module, and how many are complete (no unknown required value) — the completeness card. */
const REQUIRED = { accounts: r => ['count', 'dormant', 'ownerless', ...(HUMAN.has(r.type) ? ['mfa', 'mfaPR'] : [])], privileged: () => ['holders', 'standing', 'mfa', 'mfaPR'],
  emergency: () => ['count', 'uses', 'usesReviewed'], reviews: () => ['decisionsDue', 'decisionsDone', 'revocationsRequested', 'revocationsVerified'],
  ciScopes: () => ['inScope', 'assigned', 'assessed', 'compliant'], deviations: () => ['count'], sod: () => ['conflicts'], changes: () => ['count', 'verified'], baselines: () => [] };
export function completeness(ws, M, counts = r => r) {
  const R = reg(ws, M);
  return M.registers.map(k => {
    const rows = R[k];
    const full = rows.filter(r => { const c = k === 'ciScopes' ? counts(r) : r; return REQUIRED[k](r).every(f => isNum(c[f])); }).length;
    return { register: k, label: REGISTERS[k].label, rows: rows.length, complete: full, stale: rows.filter(r => rowStale(k, r, ws)).length };
  });
}

/* ---------------- findings ---------------- */
export function rowLabel(register, r) {
  if (!r) return '';
  return r.label || r.name || r.rule || r.requirement || [r.period, r.type].filter(Boolean).join(' ') || r.id;
}
/** Every finding a module's rules derive now: [{rule, register, rowId, severity, param, dir, title, label}]. */
export function derive(ws, M) {
  const out = [];
  const add = (rule, register, row) => out.push({ rule, register, rowId: row.id, severity: M.RULE[rule].severity, param: M.RULE[rule].param, dir: M.RULE[rule].dir, title: M.RULE[rule].title, label: rowLabel(register, row) });
  M.derive(ws, add);
  return out;
}
const same = (f, p) => f.rule === p.rule && f.register === p.register && f.rowId === p.rowId;
/** Derived findings not yet recorded or dismissed. */
export const proposed = (ws, M) => derive(ws, M).filter(p => !reg(ws, M).findings.some(f => same(f, p)));
export const nextId = (rows, prefix) => prefix + '-' + String(rows.reduce((m, r) => Math.max(m, Number(String(r.id || '').split('-').pop()) || 0), 0) + 1).padStart(2, '0');
export const nextIdReg = nextId;
/** Finding identifiers are one sequence across both modules (IF-nn), so a finding id names one finding in the
    workspace — in actions, the scenario basis and the revision log — whichever module holds it. */
export const nextFindingId = ws => nextId([...(ws.iam?.findings || []), ...(ws.cm?.findings || [])], 'IF');
export function record(ws, M, p, state = 'recorded', reason = '') {
  const R = reg(ws, M);
  const f = { id: nextFindingId(ws), rule: p.rule, register: p.register, rowId: p.rowId, title: p.title, severity: p.severity, state,
    eid: '', scenarios: [], proposals: [], action: '', created: today(), ...(reason ? { reason } : {}) };
  R.findings.push(f);
  return f;
}
/** The register row a finding concerns (looked up in the module that owns its register). */
export const rowOf = (ws, f) => (ws?.[ownerOf(f.register)]?.[f.register] || []).find(r => r.id === f.rowId) || null;

/* ---------------- risk link ---------------- */
export const nextE = ws => { let n = 0; for (const r of ws.assessment.EVIDENCE || []) { const m = /^E(\d+)$/.exec(r[0]); if (m) n = Math.max(n, +m[1]); } return 'E' + (n + 1); };
/** "Record as evidence": one assessment.EVIDENCE row; the finding keeps its E-number. */
export function recordEvidence(ws, M, f, regLabel = null, titleText = null) {
  if (f.eid) return f.eid;
  const row = rowOf(ws, f), confirmed = row?.status === 'confirmed';
  const supports = f.scenarios.length ? 'Supports: ' + f.scenarios.map(s => s.id + (s.param ? ' ' + (PARAMS.find(p => p[0] === s.param)?.[1] || s.param) : '')).join(', ') : 'Supports: no scenario linked yet';
  const id = nextE(ws);
  (ws.assessment.EVIDENCE ||= []).push([id, `${regLabel || REGISTERS[f.register]?.label || f.register} — ${titleText || f.title} (as of ${asOf(ws, M)})`,
    row?.prov?.tag === 'FACT' ? 'Documented' : 'SME input', supports, confirmed ? 'moderate' : 'weak', confirmed ? 'verified' : 'assumption', asOf(ws, M), row?.owner || '']);
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
/** Accept a proposal — the one act in these modules that changes a scenario parameter. The scenario keeps the
    journal of accepted identity and configuration proposals in its `ipc_basis` list (the field the 1.9.0 data
    model gave it; each entry names its module). */
export function accept(ws, M, f, p, by = '') {
  if (p.state !== 'proposed') throw new Error('Only a pending proposal can be accepted.');
  const a = ws.assessment, s = a.SCEN.find(x => x.id === p.scenario);
  if (!s) throw new Error('The scenario no longer exists.');
  const old = s.params[p.param] || { v: p.from };
  const before = CRG.calc(s, a.APPETITE, a.FACTOR);
  s.params[p.param] = { ...old, v: p.to, conf: p.conf, ev: [old.ev, f.eid].filter(Boolean).join('; ') };
  const after = CRG.calc(s, a.APPETITE, a.FACTOR);
  (s.ipc_basis ||= []).push({ module: M.id, finding: f.id, eid: f.eid, parameter: p.param, from: old.v, to: p.to, date: today(), by });
  const tail = `${f.eid ? ' (' + f.eid + ')' : ''}${by ? '; accepted by ' + by : ''}`;
  (s.revisions ||= []).push({ date: today(), what: M.id === 'cm' ? `${PARAM_LOG[p.param]} ${old.v} → ${p.to} from configuration management finding ${f.id}${tail}`
    : `${PARAM_LOG[p.param]} ${old.v} → ${p.to} from identity & access management finding ${f.id}${tail}` });
  (ws.revisionLog ||= []).push({ date: today(), scenario: s.id, parameter: PARAM_LOG[p.param], from: old.v, to: p.to, ratioFrom: before.ratio, ratioTo: after.ratio,
    clsFrom: CRG.classify(before.ratio), clsTo: CRG.classify(after.ratio), cause: `${M.cause} ${f.id}: ${f.eid || 'no evidence recorded'}` });
  Object.assign(p, { state: 'accepted', decidedBy: by, decidedOn: today() });
  return { before, after };
}
export function dismiss(f, p, reason, by = '') {
  if (!String(reason || '').trim()) throw new Error('Dismissing a proposal needs a reason.');
  Object.assign(p, { state: 'dismissed', reason: reason.trim(), decidedBy: by, decidedOn: today() });
}
/** Pending proposals of a module. */
export const pending = (ws, M) => reg(ws, M).findings.flatMap(f => (f.proposals || []).filter(p => p.state === 'proposed').map(p => ({ f, p })));
/** A module's evidence for a scenario: findings that cite it (read-only in the Scenario editor). */
export const forScenario = (id, ws, M) => (ws[M.field]?.findings || []).filter(f => f.state === 'recorded' && (f.scenarios || []).some(s => s.id === id));
/** The accepted changes of a scenario that came from a module (entries made before the split name no module:
    they belong to the module holding their finding). */
export const basisOf = (s, ws, M) => (s.ipc_basis || []).filter(b => b.module ? b.module === M.id : (ws[M.field]?.findings || []).some(f => f.id === b.finding));

/** "Apply ticked": fills empty cells only, never overwrites a differing answer. Returns the number filled. */
export function applyPrefill(ws, items) {
  let n = 0;
  ws.maturity ||= {}; const MT = ws.maturity;
  MT.answers ||= {}; MT.scores ||= {}; MT.evidence ||= {};
  ws.compliance ||= { frameworks: [], soa: {}, checklists: {} }; ws.compliance.soa ||= {};
  for (const it of items) {
    if (it.kind === 'answer') { if (MT.answers[it.key] !== undefined && MT.answers[it.key] !== null) continue; MT.answers[it.key] = it.value; n++; }
    else if (it.kind === 'category') { if (Number.isFinite(Number(MT.scores[it.key])) && MT.scores[it.key] !== '' && MT.scores[it.key] !== null) continue; MT.scores[it.key] = it.value; MT.evidence[it.key] ||= it.rationale; n++; }
    else if (it.kind === 'soa') { const r = (ws.compliance.soa[it.key] ||= {}); if (r.status) continue; r.status = it.value; r.evidence ||= it.rationale; r.updated = today(); n++; }
  }
  return n;
}
/** A statement-of-applicability proposal per key from the KRI states its map names (implemented / partial / none). */
export function soaProposals(ws, keys, MAP, state, label) {
  const soa = ws.compliance?.soa || {}, out = [];
  for (const key of keys) {
    const id = key.slice(key.indexOf(':') + 1), ks = MAP[id] || [];
    const st = ks.map(state);
    const value = st.length && st.every(x => x.ok) ? 'implemented' : st.some(x => x.has) ? 'partial' : null;
    if (!value) continue;
    out.push({ kind: 'soa', key, value, current: soa[key]?.status || null, rationale: ks.map(label).join(', ') });
  }
  return out;
}

/* ---------------- import from a report ---------------- */
/** The AI answer, kept only where it is a whitelisted count or enumeration of the module's registers; anything else is dropped. */
export function parseAIItems(json, keys) {
  const raw = Array.isArray(json) ? json : (json?.items || []);
  const out = [];
  let dropped = 0;
  for (const x of raw) {
    if (!x || typeof x !== 'object' || !keys[x.register]) { dropped++; continue; }
    const it = { register: x.register, tag: TAGS.includes(String(x.tag).toUpperCase()) ? String(x.tag).toUpperCase() : 'UNKNOWN' };
    if (x.register === 'accounts') { if (!TYPES.some(t => t[0] === x.type)) { dropped++; continue; } it.type = x.type; }
    if (x.register === 'privileged') { const t = Number(x.tier); if (![0, 1, 2].includes(t)) { dropped++; continue; } it.tier = t; }
    if (x.register === 'changes') it.type = CH_TYPES.some(t => t[0] === x.type) ? x.type : 'normal';
    for (const k of keys[x.register]) { const v = Number(x[k]); if (x[k] !== null && x[k] !== undefined && x[k] !== '' && Number.isInteger(v) && v >= 0) it[k] = v; }
    const pg = Number(x.page); if (Number.isInteger(pg) && pg > 0 && pg < 100000) it.page = pg;
    for (const [, v] of Object.entries(x)) if (typeof v === 'string' && guardText(v)?.block) dropped++;
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
export function acceptImport(ws, M, items, { file, sha256, bytes, rows, method, by = '' }) {
  const R = reg(ws, M), made = [];
  for (const it of items) {
    const register = it.register; if (!M.AI_KEYS[register]) continue;
    const row = { ...blankRow(register), id: nextId(R[register], REGISTERS[register].prefix) };
    for (const k of M.AI_KEYS[register]) if (isNum(it[k])) row[k] = it[k];
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
/** Tabular text (CSV or the tab-separated text of an XLSX) to rows. */
export function tableRows(text, parse) { return parse(String(text || '').split('\n').filter(l => !/^## /.test(l)).join('\n')); }
export async function sha256(buf) { const h = await crypto.subtle.digest('SHA-256', buf); return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join(''); }

/* ---------------- teaching-case samples ---------------- */
/** Which teaching case a workspace is, from its name: 'medibec', 'canaretail' or null. */
export function caseOf(ws) {
  if (!ws || ws.kind !== 'example') return null;
  const c = String(ws.teaching?.case || '');
  if (c) return /^medibec/.test(c) ? 'medibec' : /^canaretail/.test(c) ? 'canaretail' : null;
  return /medibec/i.test([ws.name, ws.org?.name].join(' ')) ? 'medibec' : null;   // examples made before the case was recorded are MediBec
}
/** The language of a teaching case (its labels follow it): the '-fr' cases are in French. */
export const caseLang = ws => /-fr$/.test(String(ws?.teaching?.case || '')) ? 'fr' : 'en';
export const registersEmpty = (ws, M) => !ws[M.field] || M.registers.every(k => !(ws[M.field][k] || []).length) && !(ws[M.field].findings || []).length;
/**
 * Load a module's per-case sample into a workspace: rows (labels in the case language), evidence appended at the
 * next free E-numbers with every reference remapped, sample exceptions appended to the shared register,
 * findings recorded and linked, and proposals saved as PENDING — never accepted. Returns a summary.
 * A finding link or proposal that names a scenario the workspace lacks (a student renumbered or deleted it)
 * throws when strict, and otherwise is left out and listed in out.skipped ({ kind, rule, scenario }) for the
 * caller to journal — the migration seed is never strict, so a changed case still opens (1.9.0 review M1).
 * `version` (cm) completes an approved sample version with its hash.
 */
export function applySample(ws, M, sample, { lang = caseLang(ws), strict = true, version = null } = {}) {
  if (!sample) return null;
  const pick = v => v && typeof v === 'object' && !Array.isArray(v) && ('en' in v || 'fr' in v) ? (v[lang] ?? v.en) : v;
  const deep = v => Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? (('en' in v || 'fr' in v) && Object.keys(v).every(k => k === 'en' || k === 'fr') ? pick(v) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)]))) : v;
  const R = reg(ws, M), out = { rows: 0, evidence: [], exceptions: [], findings: 0, proposals: 0, skipped: [] };
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
  for (const k of M.registers) for (const row of sample[k] || []) {
    const r = { ...blankRow(k), ...deep(row) };
    if (r.evidence) r.evidence = remapE(r.evidence);
    if (r.source) r.source = remapE(r.source);
    if (version) version(k, r);
    if (r.exception) r.exception = xmap[r.exception] || r.exception;
    r.prov = { tag: 'FACT', method: 'manual', file: 'teaching case', date: sample.settings?.asOf || today(), ...(row.prov || {}) };
    R[k].push(r); out.rows++;
  }
  // findings, linked, with proposals left pending
  for (const f of sample.findings || []) {
    const rule = M.RULE[f.rule];
    const scen = (f.scenarios || []).map(s => typeof s === 'string' ? { id: s, param: null } : s).filter(s => {
      if (ws.assessment.SCEN.some(x => x.id === s.id)) return true;
      if (strict) throw new Error(`Sample finding ${f.rule}: scenario ${s.id} is not in this case.`);
      out.skipped.push({ kind: 'link', rule: f.rule, scenario: s.id }); return false;
    });
    const rec = { id: nextFindingId(ws), rule: f.rule, register: f.register || rule.register, rowId: f.rowId, title: pick(f.title) || rule.title, severity: rule.severity,
      state: 'recorded', eid: emap[f.eid] || '', scenarios: scen, proposals: [], action: '', created: sample.settings?.asOf || today() };
    for (const p of f.proposals || []) {
      const s = p.scenario ? ws.assessment.SCEN.find(x => x.id === p.scenario) : ws.assessment.SCEN.find(x => p.scenarioMatch && new RegExp(p.scenarioMatch, 'i').test(x.name || ''));
      if (!s) {
        if (strict) throw new Error(`Sample proposal: no scenario matches {0}.`.replace('{0}', p.scenario || p.scenarioMatch));
        out.skipped.push({ kind: 'proposal', rule: f.rule, scenario: p.scenario || p.scenarioMatch }); continue;
      }
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

/* ---------------- one module's API, bound to its descriptor ----------------
   iam.js and cm.js re-export this object's members, so both modules offer the same names to the screens
   (panels/regcore.js draws the Overview, Findings & proposals, Import and the Scenario-editor card of either). */
export function api(M) {
  return {
    reg: (ws = S.ws) => reg(ws, M),
    asOf: (ws = S.ws) => asOf(ws, M),
    defsWithOverrides: (ws = S.ws) => defsWithOverrides(ws, M.KRIS),
    completeness: (ws = S.ws) => completeness(ws, M, r => M.counts ? M.counts(r, ws) : r),
    derive: (ws = S.ws) => derive(ws, M),
    proposed: (ws = S.ws) => proposed(ws, M),
    record: (ws, p, state = 'recorded', reason = '') => record(ws, M, p, state, reason),
    recordEvidence: (ws, f, regLabel = null, titleText = null) => recordEvidence(ws, M, f, regLabel, titleText),
    accept: (ws, f, p, by = '') => accept(ws, M, f, p, by),
    pending: (ws = S.ws) => pending(ws, M),
    forScenario: (id, ws = S.ws) => forScenario(id, ws, M),
    basisOf: (s, ws = S.ws) => basisOf(s, ws, M),
    parseAIItems: json => parseAIItems(json, M.AI_KEYS),
    acceptImport: (ws, items, meta) => acceptImport(ws, M, items, meta),
    registersEmpty: ws => registersEmpty(ws, M),
    onTarget: (id, ws = S.ws, K = M.kri(ws)) => { const def = defsWithOverrides(ws, M.KRIS).find(x => x.id === id); return status(def, K.values[id], K.meta[id]).k === 'good'; },
  };
}
