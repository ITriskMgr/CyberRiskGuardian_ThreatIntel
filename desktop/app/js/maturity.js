/* maturity.js — measuring cybersecurity maturity and resilience (1.5.5).

   Two instruments, deliberately kept apart, because they answer different questions.

   MATURITY asks how well the organization does cybersecurity as a practice, and is scored against
   NIST CSF 2.0 — its six functions and the 22 categories underneath them, read from the bundled
   publisher content rather than typed from memory. A category is scored 0 to 5 against a target the
   organization chooses. It is a management view: it compares, it trends, it supports a budget case.

   RESILIENCE asks something narrower and more useful to the model: can this organization prevent,
   detect, contain, respond, recover and keep critical operations running? Those six are exactly the
   capabilities θ(ψ,A) is defined as in the methodology, so this instrument speaks directly to a
   parameter. It is answered with explicit questions, and cross-checked against the inventory of
   existing safeguards, which knows what is actually in force.

   Where they meet. Maturity sets expectations — how many scenarios an assessment should carry, how
   much evidence to expect. Resilience sets θ. Both are dated, both keep a history, and neither
   changes a stored value on its own: every number here is a proposal the analyst accepts.

   Two readings, not an average. The questionnaire and the inventory are independent readings of the
   same thing. When they disagree materially, that disagreement is a finding — somebody believes a
   capability exists that nothing in the inventory supports, or the inventory holds controls nobody
   credits. This module reports both and the gap; it does not quietly average them away.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, touch } from './state.js';
import * as SG from './safeguards.js';
import * as K from './catalog.js';

const today = () => new Date().toISOString().slice(0, 10);

/* ---------------- maturity: the scale ---------------- */
export const LEVELS = [
  [0, 'Not performed',  'Nothing is done, or nothing anyone can point to.'],
  [1, 'Ad hoc',         'It happens when someone makes it happen. No definition, no record.'],
  [2, 'Repeatable',     'It is done the same way most of the time, by the people who know how.'],
  [3, 'Defined',        'Written down, assigned, and followed across the organization.'],
  [4, 'Managed',        'Measured against targets, with evidence, and corrected when it drifts.'],
  [5, 'Optimizing',     'Improved deliberately from its own measurements and from outside evidence.'],
];
export const LEVEL = Object.fromEntries(LEVELS.map(([v, label, hint]) => [v, { v, label, hint }]));
export const MAX_LEVEL = 5;

export const FUNCTIONS = [
  ['GV', 'Govern',   'The strategy, expectations and policy that govern the rest.'],
  ['ID', 'Identify', 'Understanding the assets, the suppliers and the risks.'],
  ['PR', 'Protect',  'The safeguards that keep events from happening.'],
  ['DE', 'Detect',   'Finding events when they happen.'],
  ['RS', 'Respond',  'Acting on a detected incident.'],
  ['RC', 'Recover',  'Restoring what the incident disrupted.'],
];
export const FUNCTION = Object.fromEntries(FUNCTIONS.map(([k, label, hint]) => [k, { key: k, label, hint }]));

/**
 * The CSF 2.0 categories, read from the bundled catalogue — the publisher's own identifiers and
 * titles, with the count of subcategories each one carries. Nothing here is typed from memory, so a
 * newer edition imported in Frameworks & standards changes this list rather than contradicting it.
 */
export function categories() {
  const rows = (K.controls() || []).filter(c => c.fw === 'CSF2');
  const out = new Map();
  for (const c of rows) {
    const m = /^([A-Z]{2})\.([A-Z]{2})/.exec(c.id || '');
    if (!m) continue;
    const key = `${m[1]}.${m[2]}`;
    if (!out.has(key)) {
      // The group reads "GV.OC Organizational Context": the identifier then the title.
      const title = String(c.grp || '').replace(/^[A-Z]{2}\.[A-Z]{2}\s*/, '').trim();
      out.set(key, { key, fn: m[1], title: title || key, n: 0, ids: [] });
    }
    const e = out.get(key); e.n++; e.ids.push(c.id);
  }
  return [...out.values()].sort((a, b) =>
    FUNCTIONS.findIndex(f => f[0] === a.fn) - FUNCTIONS.findIndex(f => f[0] === b.fn) || a.key.localeCompare(b.key));
}

/* ---------------- resilience: the questionnaire ----------------
   Three questions per capability, each answerable with evidence. They are deliberately about what the
   organization can demonstrate, not about what it owns: "we have backups" is not an answer to whether
   it can recover. */
export const ANSWERS = [
  [3, 'Yes, demonstrated', 'Done, and there is evidence a third party could check.'],
  [2, 'Yes, believed',     'We are confident, but nothing has been tested or recorded.'],
  [1, 'Partly',            'For some systems, some of the time.'],
  [0, 'No',                'Not in place.'],
  [-1, 'Unknown',          'Nobody here can answer. Recorded as an information gap, not as a zero.'],
];
export const ANSWER = Object.fromEntries(ANSWERS.map(([v, label, hint]) => [v, { v, label, hint }]));
export const MAX_ANSWER = 3;

export const QUESTIONS = {
  prevent: [
    ['pv1', 'Privileged and remote access requires multi-factor authentication everywhere it is used.'],
    ['pv2', 'Internet-facing systems are inventoried, and a critical patch reaches them within a stated time.'],
    ['pv3', 'A person joining, moving or leaving gains and loses access through one defined process.'],
  ],
  detect: [
    ['dt1', 'Security-relevant events from critical systems are collected somewhere a person actually looks.'],
    ['dt2', 'There is a stated expectation of how quickly a serious event should be noticed, and it is measured.'],
    ['dt3', 'Someone is responsible for noticing out of hours, and that has been tested.'],
  ],
  contain: [
    ['ct1', 'Critical systems are separated from the general network, so one compromise does not reach everything.'],
    ['ct2', 'An account or a device can be isolated quickly, by someone who is authorized to decide.'],
    ['ct3', 'Administrative credentials are not reused across environments.'],
  ],
  respond: [
    ['rs1', 'There is an incident response plan naming people, not roles in the abstract.'],
    ['rs2', 'It has been exercised in the last twelve months, with the findings recorded.'],
    ['rs3', 'Legal, privacy and communications obligations are written into the plan, with the deadlines.'],
  ],
  recover: [
    ['rc1', 'Backups of critical data exist, and at least one copy cannot be altered or deleted by an attacker.'],
    ['rc2', 'A restoration has actually been performed from those backups, and the time it took is known.'],
    ['rc3', 'Recovery objectives (RTO, RPO) are stated for critical services and compared with reality.'],
  ],
  continuity: [
    ['cn1', 'For each critical service there is a way to keep operating while systems are unavailable.'],
    ['cn2', 'That fallback has been used or exercised, not only written.'],
    ['cn3', 'Staff know what to do when the systems are down, without being told at the time.'],
  ],
};
export const ALL_QUESTIONS = Object.entries(QUESTIONS).flatMap(([cap, qs]) => qs.map(([id, text]) => ({ cap, id, text })));

/* ---------------- stored assessments ---------------- */
/**
 * The stored assessment, created once and then filled in place.
 *
 * Deliberately NOT `ws.maturity = Object.assign({defaults}, ws.maturity)`: that replaces the object on
 * every call, so any reference a caller took a moment earlier — a form's closure, a local in a
 * function that then calls a helper — writes to a discarded copy and the change vanishes. It did
 * exactly that to record() before a test caught it.
 */
const DEFAULTS = { scores: {}, targets: {}, evidence: {}, answers: {}, note: '', date: '', history: [] };
export function state(ws = S.ws) {
  const m = (ws.maturity ||= {});
  for (const [k, v] of Object.entries(DEFAULTS)) {
    if (m[k] === undefined || m[k] === null) m[k] = Array.isArray(v) ? [] : (typeof v === 'object' ? {} : v);
  }
  return m;
}

/** Mean of the values that were actually scored. Unscored categories are not zeros. */
function mean(xs) { const v = xs.filter(x => Number.isFinite(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }

export function maturity(ws = S.ws) {
  const M = state(ws), cats = categories();
  const scored = cats.map(c => ({ ...c, score: num(M.scores[c.key]), target: num(M.targets[c.key]), evidence: M.evidence[c.key] || '' }));
  const byFn = FUNCTIONS.map(([key, label]) => {
    const rows = scored.filter(c => c.fn === key);
    return { key, label, rows, score: mean(rows.map(r => r.score)), target: mean(rows.map(r => r.target)),
             done: rows.filter(r => Number.isFinite(r.score)).length, of: rows.length };
  });
  const overall = mean(scored.map(c => c.score));
  const target = mean(scored.map(c => c.target));
  const gaps = scored.filter(c => Number.isFinite(c.score) && Number.isFinite(c.target) && c.score < c.target)
    .sort((a, b) => (b.target - b.score) - (a.target - a.score));
  return { cats: scored, byFn, overall, target, gaps,
           done: scored.filter(c => Number.isFinite(c.score)).length, of: scored.length,
           complete: scored.every(c => Number.isFinite(c.score)) };
}
const num = x => (x === '' || x === null || x === undefined ? NaN : Number(x));

/* ---------------- resilience from the questionnaire ---------------- */
export function resilience(ws = S.ws) {
  const M = state(ws);
  const caps = SG.CAPABILITIES.map(([key, label]) => {
    const qs = (QUESTIONS[key] || []).map(([id, text]) => ({ id, text, a: M.answers[id] === undefined ? null : Number(M.answers[id]) }));
    const answered = qs.filter(q => q.a !== null && q.a >= 0);
    const unknown = qs.filter(q => q.a === -1);
    const score = answered.length ? answered.reduce((a, q) => a + q.a, 0) / (answered.length * MAX_ANSWER) : null;
    return { key, label, qs, answered: answered.length, unknown: unknown.length, of: qs.length, score };
  });
  const scored = caps.filter(c => c.score !== null);
  const overall = scored.length ? scored.reduce((a, c) => a + c.score, 0) / scored.length : null;
  return { caps, overall, answered: caps.reduce((a, c) => a + c.answered, 0),
           unknown: caps.reduce((a, c) => a + c.unknown, 0),
           of: ALL_QUESTIONS.length, complete: caps.every(c => c.score !== null) };
}

/** θ proposed by the questionnaire alone, on the same band the inventory proposal uses. */
export function questionnaireTheta(ws = S.ws) {
  const r = resilience(ws);
  if (r.overall === null) return { theta: null, why: 'No question has been answered yet.' };
  const theta = +(SG.THETA_FLOOR + r.overall * (SG.THETA_CEIL - SG.THETA_FLOOR)).toFixed(2);
  const weak = r.caps.filter(c => c.score !== null && c.score < 0.34).map(c => c.label);
  return {
    theta, score: +r.overall.toFixed(3),
    why: `Proposed from the resilience questionnaire: ${r.answered} of ${r.of} questions answered` +
         (r.unknown ? `, ${r.unknown} recorded as unknown and excluded` : '') +
         (weak.length ? `; weakest on ${weak.join(', ').toLowerCase()}` : '') +
         `. Each capability scores the mean of its answers, all six weighted equally, mapped onto ` +
         `${SG.THETA_FLOOR}–${SG.THETA_CEIL}. Analytical estimate — validation required.`,
    weak,
  };
}

/**
 * The two readings side by side, with the disagreement named.
 *
 * The threshold for "material" is one step of the inventory's own scale: 1/(6×3) of the band, times
 * three, which comes out at a tenth. Below that the two readings are saying the same thing.
 */
export const DISAGREEMENT = 0.10;
export function thetaReadings(ws = S.ws, { scen = null } = {}) {
  const inv = SG.proposedTheta(ws, { scen });
  const q = questionnaireTheta(ws);
  const both = q.theta !== null;
  const gap = both ? +(q.theta - inv.theta).toFixed(2) : null;
  let verdict = 'one reading only', note = '';
  if (both && Math.abs(gap) < DISAGREEMENT) { verdict = 'they agree'; note = 'The questionnaire and the inventory say the same thing, which is the case for believing either.'; }
  else if (both && gap > 0) { verdict = 'the questionnaire is more optimistic'; note = `The questionnaire proposes ${q.theta}, the inventory ${inv.theta}. Somebody believes in a capability that nothing recorded supports. Either the inventory is incomplete, or the belief is.`; }
  else if (both) { verdict = 'the inventory is more optimistic'; note = `The inventory proposes ${inv.theta}, the questionnaire ${q.theta}. Controls are recorded that the people answering do not credit — worth knowing before relying on them.`; }
  else note = 'Only the inventory has been scored. Answering the questionnaire gives a second, independent reading.';
  // The conservative choice is the default, and it is stated as a choice rather than a calculation.
  const recommended = both ? Math.min(q.theta, inv.theta) : inv.theta;
  return { inventory: inv, questionnaire: q, gap, verdict, note, recommended,
           why: `${both ? 'The lower of the two readings' : 'The inventory reading'} (${recommended}). ` +
                `Resilience claimed without evidence is the more expensive mistake, so the lower reading is ` +
                `offered by default. Analytical estimate — validation required.` };
}

/* ---------------- what maturity implies for the assessment ----------------
   The guidance says to start with about 10 scenarios. How many an organization should carry after that
   is a function of how much it can actually maintain, which is what maturity measures. These are
   stated anchors, not a formula with any claim to precision. */
export const SCENARIO_ANCHORS = [
  [0,   10, 'Start with the ten most material scenarios. At this level the constraint is not analysis, it is the capacity to act on it.'],
  [2,   15, 'Fifteen or so. Enough to cover the main threat families without a register nobody revisits.'],
  [3,   20, 'Around twenty. Defined practices can keep that many parameters current and reviewed.'],
  [3.5, 30, 'Thirty or more, broken down by service or business line. Measurement makes a larger register maintainable.'],
];
export function scenarioGuidance(ws = S.ws) {
  const m = maturity(ws);
  const level = m.overall;
  if (level === null) return { n: 10, level: null, why: 'Maturity has not been assessed. The methodology’s starting point is about 20 candidates and the 10 most material.', measured: false };
  let row = SCENARIO_ANCHORS[0];
  for (const r of SCENARIO_ANCHORS) if (level >= r[0]) row = r;
  return { n: row[1], level: +level.toFixed(2), why: row[2], measured: true,
           assessed: `${m.done} of ${m.of} CSF 2.0 categories scored` };
}

/* ---------------- proposing maturity from the inventory ----------------
   The inventory knows which framework controls each safeguard implements. A category with in-force
   safeguards against it is being done; whether it is defined, managed or optimizing is a judgement the
   inventory cannot make, so the proposal stops at 3 and says why. */
export function proposeFromInventory(ws = S.ws) {
  const cats = categories(), sgs = SG.list(ws).filter(SG.inForce);
  const out = [];
  for (const c of cats) {
    const hits = sgs.filter(sg => (sg.ctl || []).some(k => String(k).startsWith('CSF2:' + c.key) || (c.ids || []).includes(String(k).replace(/^CSF2:/, ''))));
    if (!hits.length) continue;
    const tested = hits.filter(sg => !SG.stale(sg)).length;
    // 1 something exists · 2 more than one, or one with current evidence · 3 several with evidence.
    const level = hits.length >= 2 && tested >= 2 ? 3 : (hits.length >= 2 || tested >= 1) ? 2 : 1;
    out.push({ key: c.key, title: c.title, fn: c.fn, level, hits,
               why: `${hits.length} safeguard${hits.length === 1 ? '' : 's'} in force mapped to ${c.key}` +
                    (tested ? `, ${tested} with current evidence` : ', none with current evidence') +
                    '. The inventory cannot tell defined from managed, so a proposal never exceeds 3.' });
  }
  return out;
}

/* ---------------- history ---------------- */
export function record(ws = S.ws, { note = '', by = '' } = {}) {
  const M = state(ws), m = maturity(ws), r = resilience(ws), t = thetaReadings(ws);
  const entry = {
    date: today(), note, by,
    maturity: m.overall === null ? null : +m.overall.toFixed(2),
    target: m.target === null ? null : +m.target.toFixed(2),
    byFn: Object.fromEntries(m.byFn.map(f => [f.key, f.score === null ? null : +f.score.toFixed(2)])),
    categoriesScored: m.done, categoriesOf: m.of,
    resilience: r.overall === null ? null : +r.overall.toFixed(3),
    answered: r.answered, unknown: r.unknown,
    thetaQuestionnaire: t.questionnaire.theta, thetaInventory: t.inventory.theta, thetaRecommended: t.recommended,
    capabilitiesCovered: t.inventory.covered,
  };
  M.history = [...(M.history || []).filter(h => h.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date));
  M.date = entry.date;
  touch();
  return entry;
}
export const history = (ws = S.ws) => (state(ws).history || []);
export function previous(ws = S.ws) {
  const h = history(ws);
  return h.length >= 2 ? h[h.length - 2] : null;
}
