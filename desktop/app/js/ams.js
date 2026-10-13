/* ams.js — the audit management model (Beta 1.6.x), aligned with CRGO 0.10 (crgo-audit).

   Audit management is the only owner of audit records; other modules link to them ({kind, id}).
   Everything here works on ws.audit (data version 2, blankAudit in migrate.js); sub-fields this model
   needs beyond blankAudit (directives, conflicts, events, weights, cycleMonths) are filled lazily.

   Rules carried by the model (CRGO 0.10 audit terms):
     • Charter and methodology are directives: an approval freezes a version with a SHA-256 hash; a
       revision is a new version, the previous one is superseded (never edited).
     • Plan entries are scored from the universe's inherent risk, the time since the last audit and
       the residual risk of the linked scenarios — read from the engine, never written back. A deferred
       or cancelled entry needs a reason and an authoriser; a mandatory entry cannot be dropped for a
       low score. Approving a plan freezes the version (hash); an amendment is a new version.
     • Engagement type (nature and focus) and state; the state machine planned → fieldwork → reporting →
       follow-up → closed records every transition (who, when, why) and checks completeness.
     • Workpapers: preparer and reviewer are different people (no sole self-review); sign-off locks the
       workpaper with a hash; a controlled reopening keeps the reason and the previous hash.
     • Sampling is reproducible: population snapshot (hash), method, size, seed (deterministic PRNG),
       exclusions and the selected items are recorded so the draw can be re-run and compared.
     • An observation is preliminary, never a finding; validated, it becomes one (validated as).
     • A finding issues only with criterion, condition and evidence (or a stated evidence limitation);
       once issued its conclusion cannot be edited — management responds in a separate record.
     • Closure needs a follow-up verification by someone independent of the action owner; a failed
       verification reopens the action and the finding. Findings and nonconformities share the same
       closure and reopening records.
     • An issued report is an immutable snapshot with a hash; corrections are addenda.
   No function here changes a risk score, a scenario parameter or the calculation engine.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, compute } from './state.js';
import { today } from './util.js';
import * as SH from './shared.js';
import { tr } from './i18n.js';

/* ---------------- vocabularies (CRGO 0.10 terms) ---------------- */
export const SIGNIFICANCE = [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['critical', 'Critical']];
export const F_STATUS = [['open', 'Open'], ['action-planned', 'Action planned'], ['remediated', 'Remediated — awaiting independent follow-up'], ['closed', 'Closed'], ['reopened', 'Reopened']];
/** Finding validation: a validated finding is not yet communicated; an issued one is (under audit authority). */
export const F_VALIDATION = [['validated', 'Validated'], ['issued', 'Issued']];
/** Engagement type: nature (assurance or advisory) and focus (CRGO engagement type scheme). */
export const NATURE = [['assurance', 'Assurance engagement'], ['advisory', 'Advisory engagement']];
export const FOCUS = [['', 'General'], ['compliance', 'Compliance audit'], ['follow-up', 'Follow-up engagement']];
/** Engagement states (CRGO engagement state scheme, with follow-up kept as a stage of the file). */
export const E_STATES = [['planned', 'Engagement planning'], ['fieldwork', 'Fieldwork'], ['reporting', 'Engagement reporting'], ['follow-up', 'Follow-up'], ['closed', 'Closed'], ['cancelled', 'Cancelled']];
export const E_NEXT = { planned: ['fieldwork', 'cancelled'], fieldwork: ['reporting', 'cancelled'], reporting: ['follow-up', 'closed', 'cancelled'], 'follow-up': ['closed'], closed: [], cancelled: [] };
export const PE_STATES = [['proposed', 'Proposed'], ['approved', 'Approved'], ['deferred', 'Deferred'], ['cancelled', 'Cancelled'], ['completed', 'Completed']];
export const PLAN_STATES = [['draft', 'Draft'], ['review', 'Under review'], ['approved', 'Approved'], ['superseded', 'Superseded'], ['closed', 'Closed']];
export const WP_STATES = [['draft', 'Draft'], ['prepared', 'Prepared'], ['review', 'Review requested'], ['changes', 'Changes requested'], ['locked', 'Signed off and locked']];
export const WP_RESULT = [['', 'Not concluded'], ['no-exception', 'No exception'], ['exceptions', 'Exceptions found'], ['inconclusive', 'Inconclusive'], ['not-applicable', 'Not applicable']];
export const METHODS = [['inquire', 'Inquiry'], ['observe', 'Observation'], ['inspect', 'Inspection'], ['reperform', 'Re-performance'], ['examine', 'Examine'], ['interview', 'Interview'], ['test', 'Test'], ['analytics', 'Data analytics']];
export const SAMPLE_METHODS = [['random', 'Random (seeded)'], ['systematic', 'Systematic (seeded start)'], ['all', 'Full population'], ['judgemental', 'Judgemental (chosen items)']];
export const OBS_STATES = [['draft', 'Preliminary'], ['validated', 'Validated as a finding'], ['dismissed', 'Dismissed']];
/** Management response stance (CRGO: agrees, will act / partly agrees / disagrees / accepts the risk). */
export const STANCE = [['accepted', 'Accepted — will act'], ['partially', 'Partially accepted'], ['rejected', 'Rejected'], ['risk-accepted', 'Risk accepted by management']];
/** Verification result (CRGO verification result scheme). */
export const VERIFY = [['effective', 'Implemented and effective'], ['partly', 'Partly effective'], ['not-effective', 'Not implemented or not effective']];
export const RATING = [['', 'Not rated'], ['satisfactory', 'Satisfactory'], ['needs-improvement', 'Needs improvement'], ['unsatisfactory', 'Unsatisfactory']];
export const REPORT_STATES = [['draft', 'Draft'], ['review', 'Supervisory review'], ['approved', 'Approved for issue'], ['issued', 'Issued']];
export const QR_KINDS = [['supervisory', 'Supervisory review'], ['internal', 'Internal quality assessment'], ['external', 'External quality assessment']];
export const UNIVERSE_KINDS = [['process', 'Business process'], ['system', 'System or application'], ['asset', 'Information asset'], ['supplier', 'Supplier or third party'], ['unit', 'Organizational unit'], ['programme', 'Programme or project'], ['regulatory', 'Regulatory obligation']];
export const DEFAULT_WEIGHTS = { inherent: 0.5, time: 0.3, scenario: 0.2 };

const lc = s => String(s || '').trim().toLowerCase();
/** Two names that are the same person (as typed). Empty names are never "the same". */
export const samePerson = (a, b) => !!lc(a) && lc(a) === lc(b);
export const nextId = (rows, prefix) => prefix + '-' + String(rows.reduce((m, r) => Math.max(m, Number(String(r.id || '').split('-').pop()) || 0), 0) + 1).padStart(3, '0');

/* ---------------- lazy shape ---------------- */
const LISTS = ['engagements', 'findings', 'soc', 'universe', 'plans', 'procedures', 'workpapers', 'samples', 'observations', 'recommendations', 'responses', 'reports', 'followups', 'qreviews',
  'directives', 'conflicts', 'events'];
export function ensure(ws = S.ws) {
  const A = (ws.audit ||= {});
  for (const k of LISTS) if (!Array.isArray(A[k])) A[k] = [];
  if (!A.charter || typeof A.charter !== 'object') A.charter = { purpose: '', authority: '', responsibilities: '', independence: '', reportsTo: '', standards: '', version: 0, approvedBy: '', approved: '', hash: '' };
  if (typeof A.methodology !== 'string') A.methodology = A.methodology?.text || '';
  if (!A.weights || typeof A.weights !== 'object') A.weights = { ...DEFAULT_WEIGHTS };
  if (!Number.isFinite(A.cycleMonths)) A.cycleMonths = 36;
  for (const e of A.engagements) {
    e.status ||= 'planned'; e.transitions ||= []; e.team ||= []; e.procedures ||= []; e.criteria ||= []; e.objectives ||= [];
    if (!e.nature) { e.nature = e.kind === 'advisory' ? 'advisory' : 'assurance'; e.focus ??= e.kind === 'compliance-audit' ? 'compliance' : ''; }
  }
  for (const f of A.findings) { f.reopened ||= []; f.evidence ||= []; f.validation ||= 'validated'; }
  return A;
}

/* ---------------- SHA-256 (synchronous, so freezes are atomic) ---------------- */
const K = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
/** SHA-256 of a string (UTF-8) or bytes, as 64 hex characters. */
export function sha256(input) {
  const msg = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  const l = msg.length, nb = ((l + 9 + 63) >> 6) << 6, b = new Uint8Array(nb);
  b.set(msg); b[l] = 0x80;
  const dv = new DataView(b.buffer); dv.setUint32(nb - 4, (l * 8) >>> 0); dv.setUint32(nb - 8, Math.floor(l / 0x20000000));
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]), W = new Uint32Array(64);
  const r = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < nb; o += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) { const s0 = r(W[i - 15], 7) ^ r(W[i - 15], 18) ^ (W[i - 15] >>> 3), s1 = r(W[i - 2], 17) ^ r(W[i - 2], 19) ^ (W[i - 2] >>> 10); W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0; }
    let [a, bb, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) >>> 0;
      const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = bb; bb = a; a = (t1 + t2) >>> 0;
    }
    H[0] += a; H[1] += bb; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
  }
  return [...H].map(x => x.toString(16).padStart(8, '0')).join('');
}
/** Canonical JSON (sorted keys) so the same content always gives the same hash. */
export function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return JSON.stringify(v ?? null);
}
export const hashOf = v => sha256(canon(v));
const clone = v => JSON.parse(JSON.stringify(v ?? null));

/* ---------------- audit events (append-only) ---------------- */
export function event(ws, action, kind, id, detail = '', by = '') {
  const A = ensure(ws);
  A.events.push({ t: new Date().toISOString(), by: String(by || ''), action, kind, id, detail: String(detail || '').slice(0, 300) });
  if (A.events.length > 5000) A.events.splice(0, A.events.length - 5000);
}

/* ---------------- charter and methodology (directives) ---------------- */
const CHARTER_KEYS = ['purpose', 'authority', 'responsibilities', 'independence', 'reportsTo', 'standards'];
export const charterContent = A => Object.fromEntries(CHARTER_KEYS.map(k => [k, A.charter[k] || '']));
export const methodologyContent = A => ({ text: A.methodology || '', weights: { ...A.weights }, cycleMonths: A.cycleMonths });
export const currentDirective = (ws, kind) => ensure(ws).directives.filter(d => d.kind === kind && d.state === 'approved').slice(-1)[0] || null;
/** Is the working copy different from the last approved version? */
export function draftDiffers(ws, kind) {
  const A = ensure(ws), d = currentDirective(ws, kind);
  if (!d) return true;
  return hashOf(kind === 'charter' ? charterContent(A) : methodologyContent(A)) !== hashOf(d.content);
}
export function approveDirectiveError(ws, kind, { preparedBy, approvedBy, approvingBody }) {
  const A = ensure(ws);
  if (kind === 'charter') {
    const c = charterContent(A);
    if (!c.purpose || !c.authority || !c.independence || !c.reportsTo) return 'A charter needs its purpose, authority, independence and reporting line before approval.';
    if (!approvingBody) return 'Name the governing body that approves the charter (e.g. the audit committee).';
  } else if (!String(A.methodology || '').trim()) return 'Write the methodology before approving it.';
  if (!approvedBy) return 'An approval needs the name of the person who approves.';
  if (samePerson(approvedBy, preparedBy)) return 'The person who approves cannot be the person who prepared it.';
  if (!draftDiffers(ws, kind)) return 'This version is already approved: nothing changed since.';
  return null;
}
export function approveDirective(ws, kind, o) {
  const bad = approveDirectiveError(ws, kind, o); if (bad) return { error: bad };
  const A = ensure(ws);
  const prev = currentDirective(ws, kind);
  const version = A.directives.filter(d => d.kind === kind).reduce((m, d) => Math.max(m, d.version), 0) + 1;
  const content = kind === 'charter' ? charterContent(A) : methodologyContent(A);
  const d = { id: `${kind === 'charter' ? 'CHR' : 'MTH'}-v${version}`, kind, version, state: 'approved', content, preparedBy: o.preparedBy || '', approvedBy: o.approvedBy,
    approvingBody: o.approvingBody || '', approvedOn: o.date || today(), effective: o.effective || o.date || today() };
  d.hash = hashOf({ kind, version, content, approvedBy: d.approvedBy, approvedOn: d.approvedOn });
  if (prev) prev.state = 'superseded';
  A.directives.push(d);
  if (kind === 'charter') Object.assign(A.charter, { version, approvedBy: d.approvedBy, approved: d.approvedOn, hash: d.hash });
  event(ws, 'approved', kind, d.id, d.approvingBody, d.approvedBy);
  return { directive: d };
}
export const directiveIntact = d => d.hash === hashOf({ kind: d.kind, version: d.version, content: d.content, approvedBy: d.approvedBy, approvedOn: d.approvedOn });

/* ---------------- universe ---------------- */
export const refOf = (kind, id) => `${kind}:${id}`;
/** Universe items that stand for a canonical record (asset:A-001…), active or not. */
export const universeFor = (ws, ref) => ensure(ws).universe.filter(u => u.ref === ref || (ref.startsWith('asset:') && (u.assets || []).includes(ref.slice(6))));
/** Add a universe item for every critical or high asset (or crown jewel) not represented yet. Never duplicates a canonical identity. */
export function suggestFromAssets(ws, criticality) {
  const A = ensure(ws), out = [];
  for (const a of ws.assets || []) {
    const c = criticality ? criticality(a, ws) : { tier: 'High', score: 60 };
    if (!['Critical', 'High'].includes(c.tier) && !a.crown) continue;
    const ref = refOf('asset', a.id);
    if (universeFor(ws, ref).length) continue;
    const u = { id: nextId(A.universe, 'AUE'), name: a.name || a.id, kind: a.type === 'service' ? 'process' : a.type === 'supplier' ? 'supplier' : 'system', ref, owner: a.owner || '',
      inherentRisk: c.tier === 'Critical' ? 5 : 4, inherentBasis: `Asset criticality ${c.score}/100 (${c.tier})`, lastAudited: '', mandatory: false, mandatoryBasis: '',
      assets: [a.id], processes: [], scenarios: (ws.assessment.SCEN || []).filter(s => (s.assetIds || []).includes(a.id)).map(s => s.id), status: 'active', added: today(), source: 'asset inventory' };
    A.universe.push(u); out.push(u);
  }
  if (out.length) event(ws, 'universe completed from assets', 'universe', out.map(u => u.id).join(', '));
  return out;
}

/* ---------------- risk-weighted scoring ---------------- */
/** A short fingerprint of the risk results used for scoring (source risk version). */
export function riskVersion(ws, R = compute(ws)) {
  return 'R-' + hashOf({ app: R.appetite, rows: R.rows.map(r => [r.id, Math.round(r.res || 0), Math.round(r.tol || 0)]) }).slice(0, 10);
}
const monthsBetween = (a, b) => (new Date(b) - new Date(a)) / (864e5 * 30.44);
/** Score an auditable entity 0–100 from inherent risk, time since last audit and the linked scenarios' residual-to-tolerance ratio (read only). */
export function scoreEntity(ws, u, weights = ensure(ws).weights, asOf = today(), R = null) {
  const A = ensure(ws);
  const cycle = Number(u.cycleMonths) || A.cycleMonths || 36;
  const inh = Math.max(0, Math.min(5, Number(u.inherentRisk) || 0)) / 5;
  const months = u.lastAudited ? Math.max(0, monthsBetween(u.lastAudited, asOf)) : null;
  const time = months == null ? 1 : Math.min(1, months / cycle);
  let ratio = null, scen = 0;
  if ((u.scenarios || []).length) {
    R ||= compute(ws);
    const rs = R.rows.filter(r => u.scenarios.includes(r.id));
    if (rs.length) { ratio = Math.max(...rs.map(r => Number(r.ratio) || 0)); scen = Math.min(1, ratio / 2); }
  }
  const w = { inherent: Math.max(0, +weights.inherent || 0), time: Math.max(0, +weights.time || 0), scenario: Math.max(0, +weights.scenario || 0) };
  const tot = w.inherent + w.time + w.scenario || 1;
  const score = Math.round(100 * (w.inherent * inh + w.time * time + w.scenario * scen) / tot);
  const factors = {
    inherent: { value: +inh.toFixed(3), source: `Inherent risk ${u.inherentRisk || 0}/5${u.inherentBasis ? ' — ' + u.inherentBasis : ''}` },
    time: { value: +time.toFixed(3), months: months == null ? null : Math.round(months), source: months == null ? 'Never audited' : `Last audited ${u.lastAudited} (${Math.round(months)} of ${cycle} months)` },
    scenario: { value: +scen.toFixed(3), ratio: ratio == null ? null : +ratio.toFixed(2), source: ratio == null ? 'No linked scenario' : `Highest residual-to-tolerance ratio ${ratio.toFixed(2)} (${u.scenarios.join(', ')}), read from the engine` },
  };
  const rationale = `${u.mandatory ? 'Mandatory' + (u.mandatoryBasis ? ' (' + u.mandatoryBasis + ')' : '') + '; ' : ''}score ${score} = ${w.inherent}×inherent ${factors.inherent.value} + ${w.time}×time ${factors.time.value} + ${w.scenario}×scenarios ${factors.scenario.value} (weights normalized)`;
  return { score, factors, rationale, weights: w };
}

/* ---------------- plans ---------------- */
export const planFrozen = p => p.state === 'approved' || p.state === 'superseded' || p.state === 'closed';
export function newPlan(ws, { period = String(new Date().getFullYear() + 1), by = '' } = {}) {
  const A = ensure(ws);
  const p = { id: nextId(A.plans, 'PLAN'), period, version: 1, state: 'draft', methodology: currentDirective(ws, 'methodology')?.id || '', weights: { ...A.weights },
    riskVersion: '', scoredOn: '', capacityHours: null, entries: [], preparedBy: by, approvedBy: '', approvingBody: '', approvedOn: '', hash: '', supersedes: '',
    changeLog: [{ date: today(), by, what: 'Created' }] };
  A.plans.push(p); addCandidates(ws, p); event(ws, 'plan created', 'plan', p.id, p.period, by);
  return p;
}
/** Every active universe item not yet in the plan becomes a proposed entry, scored. */
export function addCandidates(ws, p) {
  if (planFrozen(p)) return [];
  const A = ensure(ws), R = compute(ws), out = [];
  for (const u of A.universe.filter(u => u.status !== 'retired')) {
    if (p.entries.some(e => e.universe === u.id)) continue;
    const s = scoreEntity(ws, u, p.weights, today(), R);
    const e = { id: nextId(p.entries, 'PE'), universe: u.id, title: u.name, state: 'proposed', mandatory: !!u.mandatory, mandatoryBasis: u.mandatoryBasis || '', hours: null, scheduled: '',
      score: s.score, factors: s.factors, rationale: s.rationale, reason: '', authorisedBy: '', override: '', engagement: '' };
    p.entries.push(e); out.push(e);
  }
  p.riskVersion = riskVersion(ws, R); p.scoredOn = today();
  return out;
}
export function rescore(ws, p) {
  if (planFrozen(p)) return false;
  const A = ensure(ws), R = compute(ws);
  for (const e of p.entries) { const u = A.universe.find(x => x.id === e.universe); if (!u) continue; Object.assign(e, (({ score, factors, rationale }) => ({ score, factors, rationale }))(scoreEntity(ws, u, p.weights, today(), R))); e.mandatory = !!u.mandatory || e.mandatory; e.mandatoryBasis ||= u.mandatoryBasis || ''; }
  p.riskVersion = riskVersion(ws, R); p.scoredOn = today();
  return true;
}
/** Entries in plan order: mandatory first (whatever their score), then by score. */
export const ordered = p => [...p.entries].sort((a, b) => (b.mandatory - a.mandatory) || (b.score - a.score));
/** Entries a capacity limit would push out: lowest-scoring non-mandatory ones. Never a mandatory entry. */
export function capacityCut(p, capacity = p.capacityHours) {
  if (!capacity) return [];
  let used = 0; const cut = [];
  for (const e of ordered(p).filter(e => ['proposed', 'approved'].includes(e.state))) {
    const h = Number(e.hours) || 0;
    if (e.mandatory || used + h <= capacity) used += h; else cut.push(e);
  }
  return cut;
}
/** The displayed state: an approved entry whose engagement is closed is completed. */
export function entryState(ws, e) {
  if (e.state === 'approved' && e.engagement && ensure(ws).engagements.find(x => x.id === e.engagement)?.status === 'closed') return 'completed';
  return e.state;
}
export function entryStateError(p, e, to, { reason, authorisedBy, override } = {}) {
  if (planFrozen(p)) return 'An approved plan is frozen: amend it to create a new version.';
  if (to === 'deferred' || to === 'cancelled') {
    if (!String(reason || '').trim()) return 'A deferred or cancelled entry needs the reason.';
    if (!String(authorisedBy || '').trim()) return 'A deferred or cancelled entry needs the name of the person who authorised it.';
    if (e.mandatory && !String(override || '').trim()) return 'This entry is mandatory: a low risk score is not a reason to drop it. State why the mandatory requirement is met otherwise or no longer applies.';
  }
  return null;
}
export function setEntryState(ws, p, e, to, o = {}) {
  const bad = entryStateError(p, e, to, o); if (bad) return bad;
  const from = e.state;
  e.state = to;
  if (to === 'deferred' || to === 'cancelled') Object.assign(e, { reason: o.reason, authorisedBy: o.authorisedBy, override: o.override || '' });
  else Object.assign(e, { reason: '', authorisedBy: '', override: '' });
  p.changeLog.push({ date: today(), by: o.by || o.authorisedBy || '', what: `${e.id} ${from} → ${to}${o.reason ? ' — ' + o.reason : ''}` });
  event(ws, 'plan entry ' + to, 'plan', `${p.id}/${e.id}`, o.reason, o.authorisedBy || o.by);
  return null;
}
const planHashBody = p => ({ id: p.id, period: p.period, version: p.version, methodology: p.methodology, weights: p.weights, riskVersion: p.riskVersion, scoredOn: p.scoredOn, capacityHours: p.capacityHours,
  approvedBy: p.approvedBy, approvingBody: p.approvingBody, approvedOn: p.approvedOn, supersedes: p.supersedes,
  entries: p.entries.map(e => ({ id: e.id, universe: e.universe, title: e.title, state: e.state, mandatory: e.mandatory, mandatoryBasis: e.mandatoryBasis, hours: e.hours, scheduled: e.scheduled, score: e.score, factors: e.factors, rationale: e.rationale, reason: e.reason, authorisedBy: e.authorisedBy, override: e.override })) });
export const planIntact = p => !p.hash || p.hash === hashOf(planHashBody(p));
export function approvePlanError(p, { approvedBy, approvingBody }) {
  if (planFrozen(p)) return 'This plan version is already approved.';
  if (!p.entries.length) return 'The plan has no entries.';
  if (!approvedBy) return 'An approval needs the name of the person who approves.';
  if (!approvingBody) return 'Name the body that approves the plan (e.g. the audit committee).';
  if (samePerson(approvedBy, p.preparedBy)) return 'The person who approves the plan cannot be the person who prepared it.';
  return null;
}
export function approvePlan(ws, p, o) {
  const bad = approvePlanError(p, o); if (bad) return bad;
  for (const e of p.entries) if (e.state === 'proposed') e.state = 'approved';
  Object.assign(p, { state: 'approved', approvedBy: o.approvedBy, approvingBody: o.approvingBody, approvedOn: o.date || today() });
  p.changeLog.push({ date: p.approvedOn, by: o.approvedBy, what: `Approved by ${o.approvingBody}` });
  p.hash = hashOf(planHashBody(p));
  if (p.supersedes) { const old = ensure(ws).plans.find(x => x.id === p.supersedes); if (old && old.state === 'approved') { old.state = 'superseded'; old.changeLog.push({ date: today(), by: o.approvedBy, what: `Superseded by ${p.id} v${p.version}` }); } }
  event(ws, 'plan approved', 'plan', p.id, `v${p.version} ${p.hash.slice(0, 12)}`, o.approvedBy);
  return null;
}
/** An amendment: a new draft version of an approved plan (the approved one stays frozen until the amendment is approved). */
export function amendPlan(ws, p, by = '', why = '') {
  if (p.state !== 'approved') return { error: 'Only the approved version of a plan can be amended.' };
  const A = ensure(ws);
  if (A.plans.some(x => x.supersedes === p.id && !planFrozen(x))) return { error: 'An amendment of this plan is already in draft.' };
  const n = clone(p);
  Object.assign(n, { id: nextId(A.plans, 'PLAN'), version: p.version + 1, state: 'draft', supersedes: p.id, approvedBy: '', approvingBody: '', approvedOn: '', hash: '', preparedBy: by,
    changeLog: [{ date: today(), by, what: `Amendment of ${p.id} v${p.version}${why ? ' — ' + why : ''}` }] });
  A.plans.push(n); event(ws, 'plan amended', 'plan', n.id, `from ${p.id}`, by);
  return { plan: n };
}

/* ---------------- conflicts of interest and assignment ---------------- */
export const conflictOpen = c => !String(c.safeguard || '').trim() || !String(c.authorisedBy || '').trim() || samePerson(c.authorisedBy, c.person);
export function conflictsFor(ws, eng, name) {
  return ensure(ws).conflicts.filter(c => samePerson(c.person, name) && ((c.engagement && c.engagement === eng.id) || (c.entity && c.entity === eng.universe)));
}
/** An auditor with a declared conflict on the engagement (or its entity) needs a documented safeguard authorised by someone else. */
export function assignError(ws, eng, name) {
  if (!String(name || '').trim()) return 'Name the person to assign.';
  const open = conflictsFor(ws, eng, name).filter(conflictOpen);
  if (open.length) return `${name} declared a conflict of interest (${open.map(c => c.id).join(', ')}): record a safeguard authorised by someone else before assigning them.`;
  return null;
}
export function assign(ws, eng, name, role = 'auditor', by = '') {
  const bad = assignError(ws, eng, name); if (bad) return bad;
  eng.team ||= [];
  if (!eng.team.some(t => samePerson(t.name, name) && t.role === role)) eng.team.push({ name: name.trim(), role, assigned: today() });
  event(ws, 'assigned', 'engagement', eng.id, `${name} (${role})`, by);
  return null;
}

/* ---------------- engagements ---------------- */
export const wpsOf = (ws, id) => ensure(ws).workpapers.filter(w => w.engagement === id);
export const findingsOf = (ws, id) => ensure(ws).findings.filter(f => f.engagement === id);
export const obsOf = (ws, id) => ensure(ws).observations.filter(o => o.engagement === id);
export const reportsOf = (ws, id) => ensure(ws).reports.filter(r => r.engagement === id);
export function transitionError(ws, e, to, { reason } = {}) {
  const from = e.status || 'planned';
  const sl = k => tr((E_STATES.find(x => x[0] === k) || [k, k])[1]);
  if (!(E_NEXT[from] || []).includes(to)) return `An engagement cannot go from ${sl(from)} to ${sl(to)}.`;
  if (to === 'cancelled') return String(reason || '').trim() ? null : 'Cancelling an engagement needs the reason.';
  if (to === 'fieldwork') {
    const miss = [!String(e.scope || '').trim() && 'scope', !String(e.lead || '').trim() && 'lead auditor', !(e.objectives || []).length && 'objectives', !(e.criteria || []).length && 'criteria'].filter(Boolean);
    if (miss.length) return `Fieldwork cannot start without: ${miss.map(tr).join(', ')}.`;
    const people = [e.lead, ...(e.team || []).map(t => t.name)].filter(Boolean);
    for (const p of people) { const bad = assignError(ws, e, p); if (bad) return bad; }
  }
  if (to === 'reporting') {
    const w = wpsOf(ws, e.id);
    if (!w.length) return 'Reporting needs at least one workpaper.';
    const open = w.filter(x => x.state !== 'locked');
    if (open.length) return `Every workpaper must be signed off first (${open.map(x => x.id).join(', ')}).`;
    const pre = obsOf(ws, e.id).filter(o => o.status === 'draft');
    if (pre.length) return `Validate or dismiss the preliminary observations first (${pre.map(o => o.id).join(', ')}).`;
  }
  if (to === 'follow-up' || to === 'closed') {
    if (!reportsOf(ws, e.id).some(r => r.state === 'issued')) return 'The engagement report must be issued first.';
    if (to === 'closed') {
      const open = findingsOf(ws, e.id).filter(f => f.status !== 'closed');
      if (open.length) return `Findings still open: ${open.map(f => f.id).join(', ')}. Close them after independent follow-up, or keep the engagement in follow-up.`;
    }
  }
  return null;
}
export function transition(ws, e, to, { by = '', reason = '', date = today() } = {}) {
  const bad = transitionError(ws, e, to, { reason }); if (bad) return bad;
  const from = e.status || 'planned';
  (e.transitions ||= []).push({ from, to, date, by, note: reason });
  e.status = to;
  if (to === 'closed') {
    e.end ||= date;
    const u = e.universe && ensure(ws).universe.find(x => x.id === e.universe);
    if (u && e.nature !== 'advisory' && (!u.lastAudited || u.lastAudited < date)) { u.lastAudited = date; u.lastEngagement = e.id; }
  }
  if (to === 'fieldwork') e.start ||= date;
  event(ws, `engagement ${from} → ${to}`, 'engagement', e.id, reason, by);
  return null;
}

/* ---------------- procedure library (versioned) ---------------- */
const PROC_KEYS = ['title', 'objective', 'steps', 'criteria', 'controls', 'method', 'expectedEvidence', 'expected', 'exception', 'sampling'];
export const procContent = p => Object.fromEntries(PROC_KEYS.map(k => [k, p[k] ?? (k === 'criteria' || k === 'controls' ? [] : '')]));
/** A procedure version that a workpaper already used. */
export const procUsed = (ws, id, version) => ensure(ws).workpapers.some(w => w.proc?.id === id && w.proc?.version === version);
/** Save a library procedure: a change to a version already executed creates a new version (never a silent change). */
export function saveProcedure(ws, p) {
  p.version ||= 1; p.history ||= [];
  const h = hashOf(procContent(p));
  if (p.hash && h !== p.hash && procUsed(ws, p.id, p.version)) {
    p.history.push({ version: p.version, hash: p.hash, until: today(), content: p._prev || null });
    p.version += 1;
  }
  p.hash = h; p._prev = procContent(p);
  return p.version;
}
/** The procedure a workpaper performs, as it stands now: from the library or from the engagement's programme. */
export function findProcedure(ws, eng, pid) {
  const lib = ensure(ws).procedures.find(p => p.id === pid);
  if (lib) return { id: lib.id, version: lib.version || 1, hash: lib.hash || hashOf(procContent(lib)), title: lib.title, step: lib.steps, criteria: lib.criteria || [], method: lib.method, source: 'library' };
  const ep = (eng?.procedures || []).find(p => p.id === pid);
  if (ep) { const c = { title: ep.title, step: ep.step, expected: ep.expected, exception: ep.exception, objectives: ep.objectives || [], method: ep.method };
    return { id: ep.id, version: ep.version || 1, hash: hashOf(c), title: ep.title, step: ep.step, criteria: ep.objectives || [], method: ep.method, source: eng.programme || 'engagement' }; }
  return null;
}
/** The criteria as they stood when the work was done: a policy criterion keeps its version and state. */
export function criteriaSnapshot(ws, refs) {
  return (refs || []).map(ref => {
    const m = /^policy:(.+)$/.exec(ref) || /^(POL-\d+)$/.exec(ref);
    const pol = m ? (ws.isp?.policies || []).find(p => p.id === m[1].trim()) : null;
    return pol ? { ref, title: pol.title || '', version: pol.version || '', status: pol.status || '', effective: pol.effective || '' } : { ref };
  });
}

/* ---------------- workpapers ---------------- */
export function newWorkpaper(ws, eng, pid, by = '') {
  const A = ensure(ws);
  const proc = pid ? findProcedure(ws, eng, pid) : null;
  const w = { id: nextId(A.workpapers, 'WP'), engagement: eng.id, procedure: pid || '', proc, criteria: criteriaSnapshot(ws, [...(eng.criteria || []), ...(proc?.criteria || [])]),
    title: proc?.title || '', workDone: '', conclusion: '', result: '', sample: '', evidence: [], state: 'draft', performedBy: by, performedOn: '', reviewedBy: '', reviewedOn: '',
    comments: [], hash: '', lockedOn: '', reopenings: [], created: today() };
  A.workpapers.push(w); event(ws, 'workpaper created', 'workpaper', w.id, `${eng.id}${pid ? ' / ' + pid : ''}`, by);
  return w;
}
const WP_KEYS = ['id', 'engagement', 'procedure', 'proc', 'criteria', 'title', 'workDone', 'conclusion', 'result', 'sample', 'evidence', 'performedBy', 'performedOn', 'reviewedBy', 'reviewedOn'];
export const wpHash = w => hashOf(Object.fromEntries(WP_KEYS.map(k => [k, w[k] ?? ''])));
export const wpIntact = w => w.state !== 'locked' || w.hash === wpHash(w);
export function wpPrepare(ws, w, by, date = today()) {
  if (w.state === 'locked') return 'A locked workpaper cannot change: reopen it first.';
  if (!String(by || '').trim()) return 'Name the person who prepared the work.';
  if (!String(w.workDone || '').trim() || !w.result) return 'Describe the work done and its result before marking it prepared.';
  Object.assign(w, { performedBy: by.trim(), performedOn: date, state: 'prepared' });
  event(ws, 'workpaper prepared', 'workpaper', w.id, '', by);
  return null;
}
export function wpRequestReview(ws, w, by = '') {
  if (!['prepared', 'changes'].includes(w.state)) return 'Only a prepared workpaper can be sent for review.';
  w.state = 'review'; event(ws, 'review requested', 'workpaper', w.id, '', by); return null;
}
export function wpReviewError(w, reviewer) {
  if (!String(reviewer || '').trim()) return 'Name the reviewer.';
  if (samePerson(reviewer, w.performedBy)) return 'The person who prepared a workpaper cannot be its sole reviewer.';
  if (w.state !== 'review') return 'The workpaper is not waiting for review.';
  return null;
}
export function wpRequestChanges(ws, w, reviewer, comment) {
  const bad = wpReviewError(w, reviewer); if (bad) return bad;
  if (!String(comment || '').trim()) return 'Say what must change.';
  w.comments.push({ by: reviewer, date: today(), text: comment }); w.state = 'changes';
  event(ws, 'changes requested', 'workpaper', w.id, comment, reviewer); return null;
}
/** Sign-off: the independent reviewer approves; the workpaper is locked with a hash of its content. */
export function wpSignOff(ws, w, reviewer, date = today(), comment = '') {
  const bad = wpReviewError(w, reviewer); if (bad) return bad;
  if (comment) w.comments.push({ by: reviewer, date, text: comment });
  Object.assign(w, { reviewedBy: reviewer.trim(), reviewedOn: date, state: 'locked', lockedOn: date });
  w.hash = wpHash(w);
  event(ws, 'workpaper signed off and locked', 'workpaper', w.id, w.hash.slice(0, 12), reviewer);
  return null;
}
/** Controlled reopening of a locked workpaper: the reason and the previous hash are kept. */
export function wpReopen(ws, w, by, reason) {
  if (w.state !== 'locked') return 'Only a locked workpaper can be reopened.';
  if (!String(by || '').trim() || !String(reason || '').trim()) return 'Reopening a signed-off workpaper needs who reopens it and why.';
  w.reopenings.push({ date: today(), by, reason, hash: w.hash, reviewedBy: w.reviewedBy, reviewedOn: w.reviewedOn });
  Object.assign(w, { state: 'draft', hash: '', lockedOn: '', reviewedBy: '', reviewedOn: '' });
  event(ws, 'workpaper reopened', 'workpaper', w.id, reason, by);
  return null;
}

/* ---------------- reproducible sampling ---------------- */
/** Seed string → 32-bit state (xmur3), then mulberry32: the same seed always gives the same sequence. */
export function prng(seed) {
  let h = 1779033703 ^ String(seed).length;
  for (const ch of String(seed)) { h = Math.imul(h ^ ch.codePointAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
  h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); let a = (h ^= h >>> 16) >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** The frame after exclusions, in population order. */
export const frameOf = s => (s.population || []).filter(x => !(s.exclusions || []).includes(x));
/** Draw the sample. Returns { selected, error }. Judgemental samples keep the chosen items. */
export function draw(s) {
  const frame = frameOf(s), n = frame.length, size = Math.floor(Number(s.size) || 0);
  if (!n) return { error: 'The population is empty.' };
  if (s.method === 'all') return { selected: frame.slice() };
  if (s.method === 'judgemental') { const bad = (s.chosen || []).filter(x => !frame.includes(x)); return bad.length ? { error: `Chosen items not in the population: ${bad.join(', ')}` } : { selected: (s.chosen || []).slice() }; }
  if (!String(s.seed ?? '').trim()) return { error: 'A random or systematic sample needs a seed, so it can be re-run.' };
  if (size < 1 || size > n) return { error: `The sample size must be between 1 and ${n}.` };
  const rnd = prng(s.seed);
  if (s.method === 'systematic') {
    const k = n / size, start = rnd() * k;
    return { selected: Array.from({ length: size }, (_, i) => frame[Math.min(n - 1, Math.floor(start + i * k))]) };
  }
  const idx = frame.map((_, i) => i);
  for (let i = 0; i < size; i++) { const j = i + Math.floor(rnd() * (n - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { selected: idx.slice(0, size).sort((a, b) => a - b).map(i => frame[i]) };
}
export const drawInputs = s => ({ population: s.population || [], exclusions: s.exclusions || [], method: s.method, size: Number(s.size) || 0, seed: String(s.seed ?? ''), chosen: s.chosen || [] });
export function drawSample(ws, s, by = '') {
  if (s.drawnOn) return 'This sample was already drawn: re-run it to check it, or create a new sample.';
  const r = draw(s); if (r.error) return r.error;
  s.drawKey = hashOf(drawInputs(s));
  Object.assign(s, { selected: r.selected, populationHash: sha256((s.population || []).join('\n')), populationCount: (s.population || []).length, drawnOn: today(), drawnBy: by || s.drawnBy || '' });
  event(ws, 'sample drawn', 'sample', s.id, `${s.method} ${r.selected.length}/${frameOf(s).length} seed ${s.seed ?? ''}`, by);
  return null;
}
/** Re-run a recorded sample: same population snapshot, seed and method must give the same items. */
export function rerun(s) {
  const popOk = !s.populationHash || s.populationHash === sha256((s.population || []).join('\n'));
  const r = draw(s);
  return { populationOk: popOk, same: !r.error && popOk && canon(r.selected) === canon(s.selected || []), selected: r.selected || [], error: r.error || null };
}

/* ---------------- observations and findings ---------------- */
export function promoteError(o) {
  if (o.status !== 'draft') return 'Only a preliminary observation can be validated.';
  if (!String(o.criterion || '').trim() || !String(o.condition || '').trim()) return 'Validating an observation needs the criterion and the condition found.';
  if (!(o.evidence || []).length && !String(o.limitation || '').trim()) return 'Validating an observation needs evidence, or a stated evidence limitation.';
  return null;
}
/** Validate an observation as a finding (CRGO "validated as"). */
export function promote(ws, o, by = '') {
  const bad = promoteError(o); if (bad) return { error: bad };
  const A = ensure(ws);
  const f = { id: nextId(A.findings, 'FND'), engagement: o.engagement, observation: o.id, workpapers: o.workpaper ? [o.workpaper] : [], title: o.title, criterion: o.criterion, condition: o.condition,
    cause: '', effect: '', significance: 'medium', significanceRationale: '', evidence: (o.evidence || []).slice(), evidenceLimitation: o.limitation || '', raisedOn: today(), status: 'open',
    validation: 'validated', target: o.target || null, scenarios: [], reopened: [], followUp: [], validatedBy: by };
  A.findings.push(f);
  Object.assign(o, { status: 'validated', finding: f.id, validatedBy: by, validatedOn: today() });
  event(ws, 'observation validated as finding', 'observation', o.id, f.id, by);
  return { finding: f };
}
export function dismiss(ws, o, by, reason) {
  if (o.status !== 'draft') return 'Only a preliminary observation can be dismissed.';
  if (!String(reason || '').trim()) return 'Say why the observation is dismissed.';
  Object.assign(o, { status: 'dismissed', reason, dismissedBy: by, dismissedOn: today() });
  event(ws, 'observation dismissed', 'observation', o.id, reason, by); return null;
}
const CONCLUSION = ['criterion', 'condition', 'cause', 'effect', 'significance'];
export const conclusionHash = f => hashOf(Object.fromEntries(CONCLUSION.map(k => [k, f[k] || ''])));
export function issueError(f) {
  if (f.validation === 'issued') return 'This finding is already issued.';
  const miss = [!String(f.criterion || '').trim() && 'criterion', !String(f.condition || '').trim() && 'condition', !String(f.effect || '').trim() && 'effect', !f.significance && 'significance'].filter(Boolean);
  if (miss.length) return `A finding cannot issue without: ${miss.map(tr).join(', ')}.`;
  if (!(f.evidence || []).length && !String(f.evidenceLimitation || '').trim()) return 'A finding cannot issue without evidence, or a stated evidence limitation.';
  return null;
}
export function issueFinding(ws, f, by = '', date = today()) {
  const bad = issueError(f); if (bad) return bad;
  Object.assign(f, { validation: 'issued', issuedOn: date, issuedBy: by });
  f.conclusionHash = conclusionHash(f);
  event(ws, 'finding issued', 'finding', f.id, '', by); return null;
}
/** An issued finding's conclusion is the auditor's: nobody edits it (management responds separately). */
export const conclusionChanged = f => f.validation === 'issued' && !!f.conclusionHash && f.conclusionHash !== conclusionHash(f);

/* ---------------- closure and reopening (findings and nonconformities) ---------------- */
export function closeOk(f) {
  if (f.status !== 'closed') return null;
  if (!f.closedOn) return 'A closed finding needs its closing date.';
  if (f.riskAcceptedBy && !f.followUpBy) return null;
  if (!f.followUpBy || !f.followUpOn) return 'Closing a finding needs an independent follow-up: who verified the corrective action, and when.';
  if (f.followUpBy && f.owner && f.followUpBy.trim().toLowerCase() === f.owner.trim().toLowerCase()) return 'The follow-up must be independent of the person who owns the corrective action.';
  return null;
}
/** Close a finding or a nonconformity on a verification (or a recorded risk acceptance). */
export function closeRecord(rec, { by, date = today(), verification = '', riskAcceptedBy = '' }) {
  rec.closures ||= [];
  rec.closures.push({ date, by, basis: verification ? { kind: 'followup', id: verification } : { kind: 'risk-acceptance', by: riskAcceptedBy } });
  Object.assign(rec, { status: 'closed', closedOn: date });
}
export function reopenRecord(rec, { by = '', reason, date = today() }) {
  if (!String(reason || '').trim()) return 'Reopening needs the reason.';
  (rec.reopened ||= []).push({ date, reason, by });
  rec.status = 'reopened'; rec.closedOn = '';
  return null;
}

/* ---------------- recommendations, responses, actions ---------------- */
export const recsOf = (ws, fid) => ensure(ws).recommendations.filter(r => r.finding === fid);
export const responsesOf = (ws, fid) => ensure(ws).responses.filter(r => r.finding === fid);
export const followupsOf = (ws, fid) => ensure(ws).followups.filter(r => r.finding === fid);
export const actionOf = (ws, id) => SH.actions(ws).find(a => a.id === id) || null;
export function responseError(r) {
  if (!r.finding) return 'Choose the finding answered.';
  if (!String(r.respondedBy || '').trim()) return 'Name the manager who responds.';
  if (['accepted', 'partially'].includes(r.stance) && (!String(r.actionPlan || '').trim() || !String(r.owner || '').trim() || !r.due)) return 'An accepted response needs an action plan, an owner and a due date.';
  if (r.stance === 'rejected' && !String(r.explanation || '').trim()) return 'A rejected recommendation needs management\'s reasons.';
  if (r.stance === 'risk-accepted' && (!String(r.explanation || '').trim() || !String(r.approvedBy || '').trim())) return 'A risk acceptance needs the reasons and the name of the manager who accepts the risk.';
  return null;
}
/** Record a response; an accepted one opens (or updates) the corrective action in the shared register. */
export function saveResponse(ws, r) {
  const bad = responseError(r); if (bad) return bad;
  const A = ensure(ws), f = A.findings.find(x => x.id === r.finding);
  if (!A.responses.includes(r)) A.responses.push(r);
  r.respondedOn ||= today();
  if (['accepted', 'partially'].includes(r.stance)) {
    let a = r.action && actionOf(ws, r.action);
    if (!a) {
      a = { id: nextId(SH.actions(ws), 'ACT'), title: String(r.actionPlan).split('\n')[0].slice(0, 120), description: r.actionPlan, source: { kind: 'finding', id: r.finding }, owner: r.owner, due: r.due,
        state: 'open', links: [{ kind: 'finding', id: r.finding }], opened: today() };
      SH.actions(ws).push(a); r.action = a.id;
    } else Object.assign(a, { owner: r.owner, due: r.due, description: r.actionPlan });
    if (f) { Object.assign(f, { owner: r.owner, due: r.due, action: r.actionPlan, actionId: a.id, response: r.explanation || f.response || '' }); if (['open', 'reopened'].includes(f.status)) f.status = 'action-planned'; }
  } else if (f) f.response = r.explanation || '';
  event(ws, 'management response', 'finding', r.finding, r.stance, r.respondedBy);
  return null;
}
/** Link a shared corrective action to another record (e.g. a CMS nonconformity): one remediation, distinct conclusions. */
export function linkAction(ws, actionId, kind, id) {
  const a = actionOf(ws, actionId); if (!a) return 'Unknown corrective action.';
  a.links ||= [];
  if (!a.links.some(l => l.kind === kind && l.id === id)) a.links.push({ kind, id });
  return null;
}
export function followupError(ws, fu) {
  if (!fu.finding) return 'Choose the finding followed up.';
  if (!String(fu.verifier || '').trim()) return 'Name the person who verified.';
  if (!fu.result) return 'Record the verification result.';
  const f = ensure(ws).findings.find(x => x.id === fu.finding);
  const a = fu.action ? actionOf(ws, fu.action) : (f?.actionId ? actionOf(ws, f.actionId) : null);
  const owners = [a?.owner, f?.owner, ...responsesOf(ws, fu.finding).map(r => r.owner)].filter(Boolean);
  if (owners.some(o => samePerson(o, fu.verifier))) return 'The verification must be independent of the person who owns the corrective action.';
  if (!(fu.evidence || []).length && !String(fu.steps || '').trim()) return 'Describe the verification steps or the evidence examined.';
  return null;
}
/** Apply a follow-up: effective → the action is verified and the finding closed; otherwise the action and the finding are reopened. */
export function applyFollowUp(ws, fu) {
  const bad = followupError(ws, fu); if (bad) return bad;
  const A = ensure(ws), f = A.findings.find(x => x.id === fu.finding);
  if (!A.followups.includes(fu)) A.followups.push(fu);
  fu.date ||= today();
  const a = fu.action ? actionOf(ws, fu.action) : (f.actionId ? actionOf(ws, f.actionId) : null);
  if (a) fu.action = a.id;
  if (fu.result === 'effective') {
    fu.decision = 'accepted';
    if (a) Object.assign(a, { state: 'verified', verifiedBy: fu.verifier, verified: fu.date });
    Object.assign(f, { followUpBy: fu.verifier, followUpOn: fu.date, followUpResult: fu.notes || tr0(fu.result) });
    closeRecord(f, { by: fu.verifier, date: fu.date, verification: fu.id });
    event(ws, 'finding closed', 'finding', f.id, fu.id, fu.verifier);
  } else {
    fu.decision = 'rejected';
    if (a) Object.assign(a, { state: 'progress', verifiedBy: '', verified: '' });
    if (f.status === 'closed') reopenRecord(f, { by: fu.verifier, reason: `Follow-up ${fu.id}: ${tr0(fu.result)}`, date: fu.date });
    else { f.status = 'action-planned'; (f.reopened ||= []).push({ date: fu.date, reason: `Follow-up ${fu.id}: action reopened (${tr0(fu.result)})`, by: fu.verifier }); }
    event(ws, 'action reopened', 'finding', f.id, fu.id, fu.verifier);
  }
  return null;
}
const tr0 = v => (VERIFY.find(x => x[0] === v) || [v, v])[1];

/* ---------------- reports ---------------- */
export function snapshot(ws, eng) {
  const A = ensure(ws);
  const fs = findingsOf(ws, eng.id).filter(f => f.validation === 'issued');
  return {
    engagement: { id: eng.id, title: eng.title || '', nature: eng.nature || '', focus: eng.focus || '', scope: eng.scope || '', exclusions: eng.exclusions || '', objectives: eng.objectives || [],
      criteria: eng.criteria || [], period: eng.period || '', lead: eng.lead || '', team: (eng.team || []).map(t => `${t.name} (${t.role})`), methodology: eng.methodology || currentDirective(ws, 'methodology')?.id || '' },
    rating: eng.rating || '', conclusion: eng.opinion || '', limitations: eng.limitations || '',
    findings: fs.map(f => ({ id: f.id, title: f.title || '', criterion: f.criterion || '', condition: f.condition || '', cause: f.cause || '', effect: f.effect || '', significance: f.significance || '',
      significanceRationale: f.significanceRationale || '', evidenceLimitation: f.evidenceLimitation || '',
      recommendations: recsOf(ws, f.id).map(r => ({ id: r.id, text: r.text || '' })),
      responses: responsesOf(ws, f.id).map(r => ({ id: r.id, stance: r.stance, explanation: r.explanation || '', actionPlan: r.actionPlan || '', owner: r.owner || '', due: r.due || '', respondedBy: r.respondedBy || '' })) })),
    notIssued: findingsOf(ws, eng.id).filter(f => f.validation !== 'issued').length,
    preliminaryObservations: A.observations.filter(o => o.engagement === eng.id && o.status === 'draft').length,
  };
}
export function reportError(ws, r, to, o = {}) {
  const eng = ensure(ws).engagements.find(e => e.id === r.engagement);
  if (!eng) return 'The report needs its engagement.';
  if (r.state === 'issued') return 'An issued report is frozen: add an addendum instead.';
  if (to === 'review') { if (!String(o.by || r.preparedBy || '').trim()) return 'Name the person who prepared the report.'; }
  if (to === 'approved') {
    if (r.state !== 'review') return 'A report is approved after its supervisory review.';
    if (!String(o.reviewedBy || '').trim() || !String(o.approvedBy || '').trim()) return 'Name the supervisory reviewer and the person who authorises issue.';
    if (samePerson(o.reviewedBy, r.preparedBy)) return 'The supervisory reviewer cannot be the person who prepared the report.';
    if (samePerson(o.approvedBy, r.preparedBy)) return 'The person who authorises issue cannot be the person who prepared the report.';
  }
  if (to === 'issued') {
    if (r.state !== 'approved') return 'Only an approved report can be issued.';
    const notIssued = findingsOf(ws, eng.id).filter(f => f.validation !== 'issued');
    if (notIssued.length) return `Issue or withdraw the findings first (${notIssued.map(f => f.id).join(', ')}).`;
    if (!String(r.audience || '').trim()) return 'Say who the report is addressed to.';
  }
  return null;
}
export function reportStep(ws, r, to, o = {}) {
  const bad = reportError(ws, r, to, o); if (bad) return bad;
  const eng = ensure(ws).engagements.find(e => e.id === r.engagement);
  if (to === 'review') r.preparedBy = o.by || r.preparedBy;
  if (to === 'approved') Object.assign(r, { reviewedBy: o.reviewedBy, approvedBy: o.approvedBy, approvedOn: o.date || today() });
  if (to === 'issued') {
    r.snapshot = clone(snapshot(ws, eng));
    r.issuedOn = o.date || today();
    r.hash = hashOf({ id: r.id, version: r.version, engagement: r.engagement, audience: r.audience, issuedOn: r.issuedOn, approvedBy: r.approvedBy, snapshot: r.snapshot });
  }
  r.state = to;
  event(ws, 'report ' + to, 'report', r.id, to === 'issued' ? r.hash.slice(0, 12) : '', o.by || o.approvedBy || '');
  return null;
}
export const reportIntact = r => r.state !== 'issued' || r.hash === hashOf({ id: r.id, version: r.version, engagement: r.engagement, audience: r.audience, issuedOn: r.issuedOn, approvedBy: r.approvedBy, snapshot: r.snapshot });
export function addendum(ws, r, { by, text, date = today() }) {
  if (r.state !== 'issued') return 'Addenda are for issued reports; edit the draft instead.';
  if (!String(by || '').trim() || !String(text || '').trim()) return 'An addendum needs its author and its text.';
  r.addenda ||= [];
  const prev = r.addenda.length ? r.addenda[r.addenda.length - 1].hash : r.hash;
  const a = { n: r.addenda.length + 1, date, by, text, prevHash: prev };
  a.hash = hashOf(a);
  r.addenda.push(a);
  event(ws, 'report addendum', 'report', r.id, `#${a.n}`, by); return null;
}
export const addendaIntact = r => (r.addenda || []).every((a, i, arr) => a.prevHash === (i ? arr[i - 1].hash : r.hash) && a.hash === hashOf({ n: a.n, date: a.date, by: a.by, text: a.text, prevHash: a.prevHash }));
const lab = (list, v) => (list.find(x => x[0] === v) || [v, v || '—'])[1];
export function reportMarkdown(ws, r) {
  const eng = ensure(ws).engagements.find(e => e.id === r.engagement) || { id: r.engagement };
  const s = r.state === 'issued' ? r.snapshot : snapshot(ws, eng);
  const E = s.engagement, L = [];
  L.push(`# ${r.title || 'Audit report'} — ${E.id} ${E.title}`, '');
  L.push(`${ws.org?.name || ws.name || ''} · ${lab(REPORT_STATES, r.state)}${r.issuedOn ? ' · issued ' + r.issuedOn : ''} · version ${r.version || 1}`, '');
  if (r.state !== 'issued') L.push('> DRAFT — not issued. Content may change until the report is approved and issued.', '');
  L.push(`Audience: ${r.audience || '—'}  `, `Recipients: ${r.recipients || '—'}  `, `Prepared by: ${r.preparedBy || '—'} · Supervisory review: ${r.reviewedBy || '—'} · Issue authorised by: ${r.approvedBy || '—'}`, '');
  L.push('## Engagement', '', `- Type: ${lab(NATURE, E.nature)}${E.focus ? ' · ' + lab(FOCUS, E.focus) : ''}`, `- Scope: ${E.scope || '—'}`, `- Exclusions: ${E.exclusions || '—'}`,
    `- Objectives: ${(E.objectives || []).join('; ') || '—'}`, `- Criteria: ${(E.criteria || []).join('; ') || '—'}`, `- Period audited: ${E.period || '—'}`, `- Lead: ${E.lead || '—'} · Team: ${(E.team || []).join(', ') || '—'}`,
    `- Methodology: ${E.methodology || '—'}`, '');
  L.push('## Conclusion', '', `Rating: ${lab(RATING, s.rating)}`, '', s.conclusion || '—', '');
  if (s.limitations) L.push(`Scope and resource limitations: ${s.limitations}`, '');
  L.push(`## Findings (${s.findings.length})`, '');
  for (const f of s.findings) {
    L.push(`### ${f.id} ${f.title} — ${lab(SIGNIFICANCE, f.significance)}`, '', `- Criterion: ${f.criterion}`, `- Condition: ${f.condition}`, `- Cause: ${f.cause || '—'}`, `- Effect: ${f.effect}`);
    if (f.significanceRationale) L.push(`- Significance rationale: ${f.significanceRationale}`);
    if (f.evidenceLimitation) L.push(`- Evidence limitation: ${f.evidenceLimitation}`);
    for (const x of f.recommendations) L.push(`- Recommendation ${x.id}: ${x.text}`);
    for (const x of f.responses) L.push(`- Management response ${x.id} (${lab(STANCE, x.stance)}, ${x.respondedBy}): ${x.explanation || ''}${x.actionPlan ? ' Action: ' + x.actionPlan + ' — owner ' + x.owner + ', due ' + x.due : ''}`);
    L.push('');
  }
  if (s.notIssued) L.push(`_${s.notIssued} finding(s) validated but not issued are not part of this report._`, '');
  if (s.preliminaryObservations) L.push(`_${s.preliminaryObservations} preliminary observation(s) are not findings and are not reported._`, '');
  if (r.state === 'issued') L.push('## Integrity', '', `SHA-256 of the issued snapshot: \`${r.hash}\``, '');
  if ((r.addenda || []).length) { L.push('## Addenda', ''); for (const a of r.addenda) L.push(`${a.n}. ${a.date} — ${a.by}: ${a.text} (\`${a.hash.slice(0, 16)}…\`)`); L.push(''); }
  L.push('---', 'Audit conclusions are those of the audit function. A compliance status, a risk score or a policy acknowledgement is not an audit conclusion. Licensed standards are cited by identifier only.');
  return L.join('\n');
}

/* ---------------- quality and independence ---------------- */
/** The people whose work a quality review covers (they cannot review it). */
export function preparersOf(ws, subj) {
  const A = ensure(ws);
  if (!subj) return [];
  if (subj.kind === 'workpaper') { const w = A.workpapers.find(x => x.id === subj.id); return w ? [w.performedBy] : []; }
  if (subj.kind === 'engagement') { const e = A.engagements.find(x => x.id === subj.id); return e ? [e.lead, ...(e.team || []).map(t => t.name), ...wpsOf(ws, e.id).map(w => w.performedBy)] : []; }
  return [];
}
export function qreviewError(ws, q) {
  if (!String(q.reviewer || '').trim()) return 'Name the reviewer.';
  if (!q.subject || !q.subject.kind) return 'Say what is reviewed.';
  if (preparersOf(ws, q.subject).some(p => samePerson(p, q.reviewer))) return 'A reviewer cannot review work they prepared or took part in.';
  if (q.state === 'closed' && (q.exceptions || []).length && !String(q.resolution || '').trim()) return 'A review with exceptions closes only with their resolution.';
  return null;
}

/* ---------------- traceability ---------------- */
/** One chain per finding (and one per engagement or universe item without findings): universe → … → closure. */
export function trace(ws) {
  const A = ensure(ws), rows = [];
  const planEntry = (engId, uId) => { for (const p of A.plans.filter(p => p.state !== 'superseded')) { const e = p.entries.find(x => (engId && x.engagement === engId) || (!engId && x.universe === uId)); if (e) return { plan: p, entry: e }; } return null; };
  const seenEng = new Set();
  for (const f of A.findings) {
    const eng = A.engagements.find(e => e.id === f.engagement) || null; if (eng) seenEng.add(eng.id);
    const obs = A.observations.find(o => o.id === f.observation || o.finding === f.id) || null;
    const wp = A.workpapers.find(w => (f.workpapers || []).includes(w.id) || (obs && w.id === obs.workpaper)) || null;
    const pe = eng ? planEntry(eng.id, eng.universe) : null;
    const uid = eng?.universe || pe?.entry.universe || '';
    rows.push({ universe: A.universe.find(u => u.id === uid) || null, plan: pe?.plan || null, entry: pe?.entry || null, engagement: eng, procedure: wp?.proc || (f.procedure ? { id: f.procedure } : null), workpaper: wp,
      observation: obs, finding: f, recommendations: recsOf(ws, f.id), responses: responsesOf(ws, f.id), followups: followupsOf(ws, f.id), closed: f.status === 'closed' ? f.closedOn || true : null });
  }
  for (const e of A.engagements.filter(e => !seenEng.has(e.id))) {
    const pe = planEntry(e.id, e.universe), uid = e.universe || pe?.entry.universe || '';
    rows.push({ universe: A.universe.find(u => u.id === uid) || null, plan: pe?.plan || null, entry: pe?.entry || null, engagement: e, procedure: null, workpaper: wpsOf(ws, e.id)[0] || null,
      observation: null, finding: null, recommendations: [], responses: [], followups: [], closed: null });
  }
  return rows;
}
/** Breaks in a chain the traceability view flags. */
export function gaps(row) {
  const g = [];
  if (row.engagement && !row.entry) g.push('engagement not in an approved plan');
  if (row.engagement && !row.universe) g.push('engagement not linked to the audit universe');
  if (row.finding) {
    if (!row.observation && !row.workpaper) g.push('finding not traced to a workpaper or observation');
    if (!row.recommendations.length) g.push('no recommendation');
    if (row.finding.validation === 'issued' && !row.responses.length) g.push('no management response');
    if (row.finding.status === 'closed' && !row.followups.some(x => x.decision === 'accepted') && !row.finding.riskAcceptedBy) g.push('closed without a recorded verification');
  }
  return g;
}

/* ---------------- dashboard ---------------- */
export function metrics(ws, asOf = today()) {
  const A = ensure(ws);
  const plan = A.plans.filter(p => p.state === 'approved').slice(-1)[0] || null;
  const inPlan = plan ? plan.entries.filter(e => ['approved', 'completed'].includes(entryState(ws, e))) : [];
  const done = inPlan.filter(e => entryState(ws, e) === 'completed');
  const issued = A.findings.filter(f => f.validation === 'issued');
  const openIssued = issued.filter(f => f.status !== 'closed');
  const acts = SH.actions(ws).filter(a => (a.links || []).some(l => l.kind === 'finding') || a.source?.kind === 'finding');
  const active = A.universe.filter(u => u.status !== 'retired');
  const covered = active.filter(u => u.lastAudited && monthsBetween(u.lastAudited, asOf) <= (Number(u.cycleMonths) || A.cycleMonths));
  return {
    plan, planDone: done.length, planTotal: inPlan.length,
    issued: issued.length, openIssued: openIssued.length, highOpen: openIssued.filter(f => ['high', 'critical'].includes(f.significance)).length,
    validatedNotIssued: A.findings.filter(f => f.validation !== 'issued').length,
    preliminary: A.observations.filter(o => o.status === 'draft').length,
    overdue: acts.filter(a => SH.actionOverdue(a, asOf)).length, actions: acts.length,
    awaitingReview: A.workpapers.filter(w => w.state === 'review').length, wpTotal: A.workpapers.length,
    awaitingVerification: acts.filter(a => a.state === 'done').length,
    covered: covered.length, universe: active.length,
    byState: Object.fromEntries(E_STATES.map(([k]) => [k, A.engagements.filter(e => (e.status || 'planned') === k).length])),
    openCoi: A.conflicts.filter(conflictOpen).length,
  };
}
