/* safeguards.js — the inventory of risk-mitigation assets the organization already has (1.5.5).

   Why this is not the mitigation plan. Risk mitigation holds the treatment portfolio: measures
   proposed, costed and argued for, each with a likelihood and impact reduction, feeding the
   recommendations. This register holds what is already in force — the firewall that is running, the
   access review somebody performs every quarter, the awareness programme people actually attend. The
   two were conflated until now: "Import from the documents" put existing controls into the mitigation
   plan as measures marked implemented, which is why a recommendation could look as though it were
   claiming credit for a control the organization already had, and why nothing in the application
   could answer "what protects us today, who owns it, and when was it last shown to work?"

   What it is for.
     · The context the methodology asks for: existing cybersecurity controls, as evidence, not memory.
     · θ(ψ,A) — organizational resilience. The six capabilities below are exactly the ones θ is defined
       as, so the inventory can PROPOSE a θ per scenario. It never sets one: a proposal is accepted
       scenario by scenario, like every other intelligence-driven change.
     · The budget baseline: what it costs each year to keep existing security running, which the
       budget band needs and which was previously typed from memory.
     · The Statement of Applicability: a control claimed as implemented should point at something in
       here.

   What it deliberately does not do. It does not compute a reduction, it does not change a score, and
   a safeguard marked "planned" counts for nothing: a control protects an organization when it
   operates, not when it is decided.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, touch } from './state.js';

/* Kept local rather than imported from util.js: this module is pure logic and is unit-tested under
   node, where util.js touches the DOM at load time. */
const today = () => new Date().toISOString().slice(0, 10);

/* The kinds the analyst asked for, in the order they are usually easiest to inventory. */
export const KINDS = [
  ['technical',   'Technical measure',          'Implemented in technology: a product, a platform capability, a configuration.'],
  ['process',     'Business process',           'A way of working that lowers exposure: joiner-mover-leaver, change management, supplier onboarding.'],
  ['control',     'Internal control',           'A verification a person performs and can evidence: an access review, a reconciliation, an approval.'],
  ['awareness',   'Awareness programme',        'Training, phishing simulations, campaigns, onboarding.'],
  ['governance',  'Policy, role or governance', 'A policy, a standard, a committee, a mandate, an accountable role.'],
  ['physical',    'Physical or environmental',  'Locks, access cards, surveillance, power, cooling, site security.'],
  ['contractual', 'Contractual or insurance',   'Clauses, service levels, certifications required of suppliers, cyber insurance.'],
  ['people',      'Personnel measure',          'Screening, separation of duties, confidentiality agreements, on-call capability.'],
  ['other',       'Other',                      ''],
];
export const KIND = Object.fromEntries(KINDS.map(([k, label, hint]) => [k, { key: k, label, hint }]));

export const STATES = [
  ['in-place', 'In place',         'Operating as intended, across its stated scope.', 'good'],
  ['partial',  'Partly in place',  'Covers part of the scope, or operates inconsistently.', 'warn'],
  ['planned',  'Planned',          'Decided but not yet operating. It protects nothing until it does, and counts for nothing here.', ''],
  ['retired',  'Retired',          'No longer operating. Kept so earlier assessments still make sense.', ''],
];
export const STATE = Object.fromEntries(STATES.map(([k, label, hint, kind]) => [k, { key: k, label, hint, kind }]));
/** Only these two protect anything today. Everything that counts, counts on this. */
export const IN_FORCE = ['in-place', 'partial'];
export const inForce = sg => IN_FORCE.includes(sg?.state);

/* θ(ψ,A) is defined in the methodology as the organization's ability to prevent, detect, contain,
   respond, recover and maintain critical operations. The inventory records which of those six a
   safeguard contributes to, and how strongly, so resilience can be argued from the inventory instead
   of guessed. */
export const CAPABILITIES = [
  ['prevent',    'Prevent',                      'Stops the event happening at all.'],
  ['detect',     'Detect',                       'Makes the event visible, sooner or at all.'],
  ['contain',    'Contain',                      'Stops it spreading once it has started.'],
  ['respond',    'Respond',                      'Improves the intervention while it is happening.'],
  ['recover',    'Recover',                      'Shortens the disruption, restores the capability.'],
  ['continuity', 'Maintain critical operations', 'Keeps the essential service running meanwhile.'],
];
export const CAPABILITY = Object.fromEntries(CAPABILITIES.map(([k, label, hint]) => [k, { key: k, label, hint }]));
/** 0 none · 1 contributes · 2 material · 3 principal. Deliberately coarse: this is a judgement. */
export const STRENGTH = [[0, 'none'], [1, 'contributes'], [2, 'material'], [3, 'principal']];
export const MAX_STRENGTH = 3;

export const RESULTS = [
  ['effective',   'Effective',    'good'],
  ['partial',     'Partly effective', 'warn'],
  ['ineffective', 'Not effective', 'bad'],
  ['', 'Not tested', ''],
];
export const CONF = ['High', 'Medium', 'Low'];
/** A test older than this is reported as stale: evidence of operation has a shelf life. */
export const STALE_DAYS = 365;

export function list(ws = S.ws) { return (ws.safeguards ||= []); }

export function nextId(ws = S.ws) {
  let n = 0;
  for (const s of list(ws)) { const m = /^SG-(\d+)$/.exec(s.id || ''); if (m) n = Math.max(n, +m[1]); }
  return 'SG-' + String(n + 1).padStart(2, '0');
}

export function blank(o = {}, ws = S.ws) {
  return Object.assign({
    id: nextId(ws), name: '', kind: 'technical', desc: '', owner: '', state: 'in-place',
    since: '', scope: '', assets: [], scen: [], ctl: [],
    cap: {},                      // capability key -> 0..3
    initial: 0, recurring: 0,     // one-time already spent, and the annual cost of keeping it running
    tested: '', result: '', test_note: '',
    evidence: '', conf: 'Low', deps: '', note: '', created: today(),
  }, o);
}

export function add(o = {}, ws = S.ws) { const sg = blank(o, ws); list(ws).push(sg); touch(); return sg; }
export function remove(id, ws = S.ws) {
  const i = list(ws).findIndex(s => s.id === id);
  if (i >= 0) { list(ws).splice(i, 1); touch(); return true; }
  return false;
}

/** The strength a safeguard contributes to one capability, 0 when it is not in force. */
export function strength(sg, capKey) {
  if (!inForce(sg)) return 0;
  const v = Number(sg.cap?.[capKey]) || 0;
  // A partly-implemented safeguard contributes less than a fully operating one. Half, rounded down to
  // the nearest step, is a stated convention and not a measurement.
  return sg.state === 'partial' ? Math.min(v, Math.max(0, v - 1)) : v;
}

/** How well each θ capability is covered by the inventory, with the safeguards that cover it. */
export function capabilityCoverage(ws = S.ws, { scen = null } = {}) {
  const items = list(ws).filter(sg => inForce(sg) && (!scen || (sg.scen || []).includes(scen)));
  return CAPABILITIES.map(([key, label]) => {
    const contributors = items.filter(sg => strength(sg, key) > 0)
      .sort((a, b) => strength(b, key) - strength(a, key));
    const best = contributors.length ? strength(contributors[0], key) : 0;
    return { key, label, best, contributors, count: contributors.length };
  });
}

/**
 * A θ proposed from the inventory, for the analyst to accept or ignore.
 *
 * Every capability counts equally, because the methodology gives no weighting and inventing one would
 * be a false precision. A capability's score is its strongest contributor, not the sum: three partial
 * backups are not a recovery capability. The result is deliberately capped below 1 and floored above
 * 0 — an inventory can never prove perfect resilience, and an organization with nothing recorded is
 * not helpless, only undocumented.
 */
export const THETA_FLOOR = 0.10, THETA_CEIL = 0.90;
export function proposedTheta(ws = S.ws, { scen = null } = {}) {
  const cov = capabilityCoverage(ws, { scen });
  const covered = cov.filter(c => c.best > 0).length;
  const score = cov.reduce((a, c) => a + c.best, 0) / (CAPABILITIES.length * MAX_STRENGTH);
  const theta = +(THETA_FLOOR + score * (THETA_CEIL - THETA_FLOOR)).toFixed(2);
  const weakest = cov.filter(c => c.best === 0).map(c => c.label);
  return {
    theta, score: +score.toFixed(3), covered, of: CAPABILITIES.length, coverage: cov, weakest,
    why: `Proposed from the inventory of existing safeguards: ${covered} of ${CAPABILITIES.length} ` +
         `resilience capabilities are covered by a safeguard in force` +
         (weakest.length ? `, and nothing covers ${weakest.join(', ').toLowerCase()}` : '') +
         `. Each capability is scored by its strongest contributor out of ${MAX_STRENGTH}, all six weighted equally, ` +
         `mapped onto ${THETA_FLOOR}–${THETA_CEIL}. Analytical estimate — validation required.`,
  };
}

/** What it costs each year to keep existing security running — the budget baseline, from evidence. */
export function runCost(ws = S.ws) {
  return list(ws).filter(inForce).reduce((a, s) => a + (Number(s.recurring) || 0), 0);
}

export function stale(sg, days = STALE_DAYS) {
  if (!inForce(sg)) return false;
  if (!sg.tested) return true;
  const t = Date.parse(sg.tested);
  return !Number.isFinite(t) || (Date.now() - t) / 864e5 > days;
}

export function stats(ws = S.ws) {
  const all = list(ws), live = all.filter(inForce);
  const byKind = Object.fromEntries(KINDS.map(([k]) => [k, all.filter(s => s.kind === k).length]));
  const byState = Object.fromEntries(STATES.map(([k]) => [k, all.filter(s => s.state === k).length]));
  const cov = capabilityCoverage(ws);
  return {
    total: all.length, inForce: live.length, byKind, byState,
    runCost: runCost(ws),
    tested: live.filter(s => s.tested && !stale(s)).length,
    staleOrUntested: live.filter(s => stale(s)).length,
    ineffective: live.filter(s => s.result === 'ineffective').length,
    unowned: live.filter(s => !String(s.owner || '').trim()).length,
    capabilitiesCovered: cov.filter(c => c.best > 0).length,
    gaps: cov.filter(c => c.best === 0).map(c => c.label),
  };
}

/** Safeguards touching one asset name, or one scenario id. */
export const forAsset = (name, ws = S.ws) => list(ws).filter(s => (s.assets || []).includes(name));
export const forScenario = (id, ws = S.ws) => list(ws).filter(s => (s.scen || []).includes(id));

/* ---------------- bringing existing controls over from the mitigation plan ----------------
   Workspaces built with 1.5.4 and earlier have their existing controls in ws.measures, marked
   implemented, usually with zero reductions and `source: 'documents'`. Those are inventory entries
   that ended up in the treatment plan. They are not moved automatically: the analyst sees the list,
   ticks what belongs in the inventory, and decides whether to leave or delete the measure. */
export function candidates(ws = S.ws) {
  const have = new Set(list(ws).map(s => norm(s.name)));
  return (ws.measures || [])
    .filter(m => m.status === 'implemented' && !have.has(norm(m.name)))
    .map(m => ({ m, why: m.source === 'documents' ? 'imported from the documents as implemented' : 'marked implemented in the mitigation plan' }));
}
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

const FN_CAP = { Governance: {}, Prevention: { prevent: 2 }, Detection: { detect: 2 },
                 Response: { respond: 2, contain: 1 }, Recovery: { recover: 2, continuity: 1 } };
const FN_KIND = { Governance: 'governance', Prevention: 'technical', Detection: 'technical',
                  Response: 'process', Recovery: 'technical' };

/**
 * One measure, read as an inventory entry — built, not stored, so a caller can show it before
 * committing to it. Use adoptMeasure() to put it in the inventory.
 */
export function fromMeasure(m, ws = S.ws) {
  return blank({
    name: m.name, kind: FN_KIND[m.fn] || 'technical', desc: m.desc || '',
    owner: m.owner || '', state: 'in-place', scope: '', assets: [], scen: (m.scen || []).slice(),
    ctl: (m.ctl || []).slice(), cap: { ...(FN_CAP[m.fn] || {}) },
    recurring: Number(m.recurring) || 0, initial: Number(m.initial) || 0,
    evidence: m.evidence || '', conf: m.conf || 'Low',
    note: `Brought over from the mitigation plan (${m.id}). Its contribution to each resilience ` +
          `capability was set from its function “${m.fn}” — review it.`,
    prov: m.prov,
  }, ws);
}

/** Bring one measure into the inventory. Returns the new safeguard. The measure itself is untouched:
    what happens to the plan is the analyst's decision, not a side effect of reading it. */
export function adoptMeasure(m, ws = S.ws) {
  const sg = fromMeasure(m, ws);
  list(ws).push(sg);
  touch();
  return sg;
}
