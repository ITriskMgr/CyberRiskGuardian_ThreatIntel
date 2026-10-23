/* screening.js — scenario screening, consolidation and selection (book ch05, "Screening, consolidating,
   and selecting"; Process steps 6 and 7).

   Every candidate (assessment.CANDIDATES) is scored 1 to 5 on twelve criteria with a rationale. The total
   out of 60 is a screening aid, not a rule. Mandatory escalation flags stop a severe but improbable
   scenario from dropping out for low probability alone: leaving a flagged candidate out needs an explicit
   review and is a management decision. Variants are consolidated into families; each family takes the
   highest weighted score of its members, so variants do not add up. The selection is tested under four
   weighting schemes: a family selected but not in the top ten under every scheme is "selected by
   judgment" (its rationale must say why); a candidate not selected that ranks in the top ten under some
   scheme needs "explicit review". A coverage matrix tests the selected families for blind spots, and the
   strongest candidates left out go on a watch list with promotion triggers.
   Nothing here computes risk: the risk index comes from the verified engine, after selection.
   © 2026 Marc-André Léger. All rights reserved. */
'use strict';
import { S } from './state.js';

export const CRITERIA = [
  ['BC', 'Business criticality', 'Does the scenario threaten an important objective or critical process?'],
  ['AC', 'Asset criticality', 'Does it affect high-value information, technology, services or infrastructure?'],
  ['TR', 'Threat relevance', 'Is the threat credible for this organization and sector?'],
  ['EX', 'Exposure or vulnerability', 'Are there plausible weaknesses or predisposing conditions?'],
  ['IM', 'Potential impact', 'Could the consequences materially affect the organization?'],
  ['RL', 'Regulatory and legal', 'Could it create important compliance, privacy, contractual or legal consequences?'],
  ['OR', 'Operational resilience', 'Could it disrupt critical services or create cascading failures?'],
  ['DC', 'Dependency and concentration', 'Does it involve important third parties or single points of failure?'],
  ['EV', 'Evidence strength', 'Is there organizational, technical, historical, sector or threat-intelligence evidence? (5 = direct organizational evidence, 1 = assumption only)'],
  ['RV', 'Risk velocity', 'Could material consequences develop rapidly?'],
  ['CU', 'Control uncertainty', 'Is it uncertain whether existing controls would prevent or contain it?'],
  ['DU', 'Decision usefulness', 'Would analysing it potentially change a management decision?'],
];
/** The mandatory escalation flags (ch05). */
export const FLAGS = [
  ['S', 'Human safety'], ['ES', 'Essential service interruption'], ['CD', 'Catastrophic data loss'], ['SY', 'Systemic organizational failure'],
  ['PV', 'Severe privacy consequences'], ['RG', 'Major regulatory breach'], ['FN', 'Existential financial loss'], ['PI', 'Compromise of highly privileged infrastructure'],
  ['BK', 'Destruction of backup or recovery capabilities'], ['PR', 'Simultaneous failure of primary and recovery environments'],
  ['SC', 'Critical supply-chain concentration'], ['MU', 'Spread across multiple units or jurisdictions'],
];
/** The five generation strategies (ch05). */
export const STRATEGIES = [['TD', 'Top-down'], ['BU', 'Bottom-up'], ['TH', 'Threat-driven'], ['DP', 'Dependency-driven'], ['GL', 'Localized generic']];
export const DISPOSITIONS = [['Select', 'Select'], ['Consolidate', 'Consolidate (into a family)'], ['Consider', 'Consider (explicit review)'], ['Defer', 'Defer']];
export const CONFIDENCE = ['High', 'Medium', 'Low'];
/** The four weighting schemes (ch05; weights as in the MediBec selection workbook). */
export const SCHEMES = [
  ['equal', 'Equal', [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
  ['impact', 'Impact-led', [2, 1, 1, 1, 2, 1.5, 1.5, 1, 1, 1, 1, 1]],
  ['evidence', 'Evidence-led', [1, 1, 1.5, 1.5, 1, 1, 1, 1, 2, 1, 1, 1]],
  ['decision', 'Decision-led', [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 2]],
];
/** Coverage categories (ch05): a test for blind spots, not a quota. */
export const CATEGORIES = ['Confidentiality', 'Integrity', 'Availability', 'Identity & privileged access', 'Ransomware / destructive', 'Cloud & SaaS',
  'Third-party / supply chain', 'Insider', 'Application / API', 'Infrastructure / network', 'Endpoint', 'OT / IoT / medical devices',
  'Data protection / privacy', 'Fraud / BEC', 'Resilience / DR', 'Emerging technology (AI)', 'Safety'];
/** The six "why this scenario?" questions. */
export const WHY = ['Why is it relevant to this organization?', 'What organizational evidence supports it?', 'Which asset or objective does it threaten?',
  'Which weakness or condition does it exploit?', 'What material consequence could it cause?', 'Why was it selected over the strongest candidates left out?'];
export const TOP = 10;

const blank = () => ({ cands: {}, families: [], watch: [], plan: [], updated: null });
export const state = (ws = S.ws) => (ws.screening ||= blank());
export const candidates = (ws = S.ws) => (ws.assessment.CANDIDATES || []).map(r => ({ id: r[0], name: r[1] || '', source: r[2] || '', vuln: r[3] || '', assets: r[4] || '', consequence: r[5] || '', ref: r[6] || '', status: r[7] || '', note: r[8] || '', row: r }));
export function rec(id, ws = S.ws) {
  const C = state(ws).cands;
  const r = (C[id] ||= {});
  if (!Array.isArray(r.scores) || r.scores.length !== 12) r.scores = Array.from({ length: 12 }, (_, i) => (Array.isArray(r.scores) ? r.scores[i] ?? null : null));
  r.flags ||= []; r.strategy ||= []; r.rat ??= ''; r.conf ??= ''; r.disp ??= ''; r.target ??= ''; r.basis ??= '';
  return r;
}
const valid = x => Number.isInteger(x) && x >= 1 && x <= 5;
export const complete = r => !!r && Array.isArray(r.scores) && r.scores.length === 12 && r.scores.every(valid);
export const total = r => complete(r) ? r.scores.reduce((a, b) => a + b, 0) : null;
export const weighted = (r, w) => complete(r) ? r.scores.reduce((a, x, i) => a + x * w[i], 0) : null;
export function scoredCount(ws = S.ws) {
  const C = state(ws).cands;
  return candidates(ws).filter(c => complete(C[c.id]) && C[c.id].disp).length;
}
export const familyOf = (id, ws = S.ws) => state(ws).families.find(f => (f.members || []).includes(id)) || null;

/** Candidate-count guidance: about 25 to 40 for ten scenarios, never fewer than 20 (20 = the quick lab version). */
export function countGuidance(n, portfolio = TOP) {
  const lo = Math.round(25 * portfolio / 10), hi = Math.round(40 * portfolio / 10), min = Math.round(20 * portfolio / 10);
  if (n < min) return { kind: 'bad', text: `Too few candidates: ${n}. Generate at least ${min} — about ${lo} to ${hi} for a portfolio of ${portfolio}.` };
  if (n < lo) return { kind: 'warn', text: `${n} candidates: enough for the quick lab version. About ${lo} to ${hi} is preferable when the context is rich.` };
  return { kind: 'good', text: `${n} candidates for a portfolio of ${portfolio} (about ${lo} to ${hi} recommended).` };
}

/** Everything the screens show, computed in one pass. */
export function analysis(ws = S.ws) {
  const st = state(ws), list = candidates(ws), C = st.cands;
  const fam = st.families || [];
  // units ranked: every family (score = best member), and every candidate not in a family
  const inFam = new Set(fam.flatMap(f => f.members || []));
  const units = [
    ...fam.map(f => ({ kind: 'family', id: f.id, name: f.name || f.id, selected: !!f.selected, f, members: (f.members || []).filter(m => C[m]) })),
    ...list.filter(c => !inFam.has(c.id)).map(c => ({ kind: 'cand', id: c.id, name: c.name, selected: C[c.id]?.disp === 'Select', members: [c.id] })),
  ];
  for (const u of units) {
    u.score = {}; u.rank = {};
    for (const [k, , w] of SCHEMES) {
      const xs = u.members.map(m => weighted(C[m], w)).filter(x => x !== null);
      u.score[k] = xs.length ? Math.max(...xs) : null;
    }
    u.flags = [...new Set(u.members.flatMap(m => C[m]?.flags || []))];
  }
  for (const [k] of SCHEMES) {
    const ranked = units.filter(u => u.score[k] !== null).sort((a, b) => b.score[k] - a.score[k] || (a.id < b.id ? -1 : 1));
    ranked.forEach((u, i) => { u.rank[k] = i + 1; });
  }
  const inTop = (u, k) => u.rank[k] !== undefined && u.rank[k] <= TOP;
  for (const u of units) {
    u.topAll = SCHEMES.every(([k]) => inTop(u, k));
    u.topSome = SCHEMES.some(([k]) => inTop(u, k));
    u.byJudgment = u.selected && !u.topAll;
    u.review = !u.selected && u.topSome;
  }
  const selected = units.filter(u => u.kind === 'family' && u.selected);
  const judgmentMissing = units.filter(u => u.byJudgment && !String((u.kind === 'family' ? u.f.judgment : C[u.id]?.rat) || '').trim());
  // flagged candidates left out of the selection: need an explicit, recorded review (Management decision required)
  const selMembers = new Set(selected.flatMap(u => u.members));
  const flaggedOut = list.filter(c => (C[c.id]?.flags || []).length && !selMembers.has(c.id) && C[c.id]?.disp !== 'Consolidate' && C[c.id]?.disp !== 'Select');
  const watched = new Set((st.watch || []).map(w => w.id));
  const flaggedUnreviewed = flaggedOut.filter(c => !String(C[c.id]?.exclReview || '').trim() && !watched.has(c.id));
  // coverage of the selected families
  const coverage = Object.fromEntries(CATEGORIES.map(cat => [cat, selected.filter(u => (u.f.coverage || []).includes(cat)).map(u => u.id)]));
  const strategies = new Set(list.flatMap(c => C[c.id]?.strategy || []));
  const scored = scoredCount(ws);
  const totals = list.map(c => ({ id: c.id, total: total(C[c.id]) })).filter(x => x.total !== null);
  return { list, units, selected, judgmentMissing, flaggedOut, flaggedUnreviewed, coverage, gaps: CATEGORIES.filter(c => !coverage[c].length),
    strategies: [...strategies], scored, totals, guidance: countGuidance(list.length) };
}

/** A new family id (P01, P02 …). */
export function nextFamilyId(ws = S.ws) {
  let n = 0;
  for (const f of state(ws).families) { const m = /^P(\d+)$/.exec(f.id); if (m) n = Math.max(n, Number(m[1])); }
  return 'P' + String(n + 1).padStart(2, '0');
}
/** A new candidate id (C01 …). */
export function nextCandidateId(ws = S.ws) {
  let n = 0;
  for (const c of ws.assessment.CANDIDATES || []) { const m = /^C(\d+)$/.exec(c[0]); if (m) n = Math.max(n, Number(m[1])); }
  return 'C' + String(n + 1).padStart(2, '0');
}
/** Add a candidate row (the CANDIDATES layout the workbook reads: id, name, source, vulnerability, assets, consequence, ref, status, rationale). */
export function addCandidate(o, ws = S.ws) {
  const id = o.id || nextCandidateId(ws);
  (ws.assessment.CANDIDATES ||= []).push([id, o.name || '', o.source || '', o.vuln || '', o.assets || '', o.consequence || '', o.ref || '', o.status || 'Candidate', o.note || '']);
  if (o.strategy?.length) rec(id, ws).strategy = o.strategy.slice();
  return id;
}

/** The screening as CSV rows (header first). */
export function csvRows(ws = S.ws) {
  const a = analysis(ws), C = state(ws).cands;
  const head = ['ID', 'Candidate', ...CRITERIA.map(c => c[0]), 'Total (/60)', ...SCHEMES.map(s => 'Weighted - ' + s[1]), 'Escalation flags', 'Confidence', 'Disposition', 'Family / target', 'Strategies', 'Rationale', 'Exclusion review'];
  return [head, ...a.list.map(c => { const r = C[c.id] || {}; const sc = r.scores || [];
    return [c.id, c.name, ...CRITERIA.map((_, i) => sc[i] ?? ''), total(r) ?? '', ...SCHEMES.map(([, , w]) => weighted(r, w) ?? ''), (r.flags || []).join(' '), r.conf || '', r.disp || '',
      familyOf(c.id, ws)?.id || r.target || '', (r.strategy || []).join(' '), r.rat || '', r.exclReview || '']; })];
}
