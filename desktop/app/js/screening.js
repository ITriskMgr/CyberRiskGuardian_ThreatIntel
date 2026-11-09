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
import { S, blankScenario, nextScenarioId, PARAMS } from './state.js';
import { today } from './util.js';
import * as MK from './markers.js';
import { tr } from './i18n.js';

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
  const distinct = new Set(list.map(dupKey)).size;   // 1.9.2 (NV-034) — duplicates are counted once
  return { list, units, selected, judgmentMissing, flaggedOut, flaggedUnreviewed, coverage, gaps: CATEGORIES.filter(c => !coverage[c].length),
    strategies: [...strategies], scored, totals, distinct, guidance: countGuidance(distinct) };
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
/** Add a candidate row (the CANDIDATES layout the workbook reads: id, name, source, vulnerability, assets, consequence, ref, status, rationale).
 *  1.9.2 (decided item 20): `draft` — the candidate's parameters, vector, links and chain as the batch grid, the AI or the
 *  consultant proposed them — is kept on its screening record and travels to the scenario when the candidate is promoted. */
export function addCandidate(o, ws = S.ws) {
  const id = o.id || nextCandidateId(ws);
  (ws.assessment.CANDIDATES ||= []).push([id, o.name || '', o.source || '', o.vuln || '', o.assets || '', o.consequence || '', o.ref || '', o.status || 'Candidate', o.note || '']);
  const r = rec(id, ws);
  if (o.strategy?.length) r.strategy = o.strategy.slice();
  if (o.draft) r.draft = o.draft;
  if (o.scenario) r.scenario = o.scenario;
  return id;
}

/* ---------------- 1.9.2 — drafts, duplicates, removal, the register as a source, promotion ---------------- */

/** The key that tells two candidates apart for counting (NV-034): name, threat source and assets, case and spacing aside. */
export const dupKey = c => [c.name, c.source, c.assets].map(x => String(x || '').trim().toLowerCase().replace(/\s+/g, ' ')).join('|');
/** Distinct candidates (NV-034): duplicates are consolidated into families during screening, but they are counted once. */
export function distinctCount(ws = S.ws) { return new Set(candidates(ws).map(dupKey)).size; }
/** Does a candidate with this name, source and assets already exist? */
export function hasDuplicate(o, ws = S.ws) { const k = dupKey(o); return candidates(ws).some(c => dupKey(c) === k); }

/** A draft from a batch-grid row (panels/batch.js) or a consultant proposal: only what a scenario can take. */
export function draftFromRow(r) {
  const P = r.params || {};
  const num = v => (v && typeof v === 'object' ? v.v : v);
  const params = {};
  for (const k of PARAMS) { const v = Number(num(P[k])); if (Number.isFinite(v)) params[k] = { v, rat: (r.rat && r.rat[k]) || '', ev: (r.rat && r.rat[k + '_ev']) || '', conf: (r.conf && r.conf[k]) || '' }; }
  const d = { statement: r.statement || '', threat_source: r.threat_source || '', vulns: Array.isArray(r.vulns) ? r.vulns.slice() : String(r.vulns || '').split(/;\s*/).filter(Boolean),
    assets: r.assets || r.asset || '', processes: r.process || '', consequence: r.consequence || '', initiating_event: r.initiating_event || r.threat_event || '',
    existing_controls: r.existing_controls || '', assumptions: r.assumptions || '',
    params, attack: (r.attack || []).slice(), cwe: (r.cwe || []).slice(), cves: (r.cves || []).slice(),
    cvss: r.cvss || '', cvss_score: r.cvss_score ?? null, cvss_note: r.cvss_note || '', red_p: Number(r.red_p) || 0, red_i: Number(r.red_i) || 0,
    owner: r.owner || '', horizon: r.horizon || '', pattern: r.pattern || '', origin: r.ai ? 'ai' : r.hubRow ? 'registry' : r.crgo ? 'crgo' : r.docs ? 'docs' : r.secops ? 'secops' : r.pattern === 'csv' ? 'csv' : 'batch' };
  if (r.scenPattern) d.scenPattern = r.scenPattern;
  if (r.crgo) d.crgo = JSON.parse(JSON.stringify(r.crgo));
  if (r.secopsEv?.length) d.secopsEv = r.secopsEv.map(e => ({ ...e, seed: r.seed || '' }));
  if (r.model) d.model = r.model;
  return d;
}

/** The candidate rows that stand for register scenarios not yet among the candidates (C1). */
export function registerNotCandidates(ws = S.ws) {
  const C = state(ws).cands, linked = new Set(Object.values(C).map(r => r?.scenario).filter(Boolean));
  for (const f of state(ws).families || []) for (const id of f.scenarios || []) linked.add(id);
  const refs = new Set(candidates(ws).map(c => c.ref));
  return (ws.assessment.SCEN || []).filter(s => !linked.has(s.id) && !refs.has(s.id));
}
/** C1 — add the register's scenarios as candidates (one row each, linked to its scenario; nothing in the register changes). */
export function addFromRegister(ws = S.ws, ids = null) {
  const out = [];
  for (const s of registerNotCandidates(ws)) {
    if (ids && !ids.includes(s.id)) continue;
    const id = addCandidate({ name: s.name || s.id, source: s.threat_source || '', vuln: (s.vulns || []).join('; '), assets: s.assets || '', consequence: s.statement || '',
      ref: s.id, status: 'In the register', note: 'Added from the Scenario register (' + s.id + ').', scenario: s.id, strategy: [] }, ws);
    out.push(id);
  }
  return out;
}

/** C2 — why a candidate cannot be removed, or null. A member of a selected family is part of the portfolio. */
export function removeBlock(id, ws = S.ws) {
  const f = familyOf(id, ws);
  if (f?.selected) return `${id} is a member of ${f.id}, a family selected for the portfolio: take it out of the family first.`;
  return null;
}
/** C2 — remove a candidate: its row, its score card, its watch entry and its family membership. Returns false when blocked. */
export function removeCandidate(id, ws = S.ws) {
  if (removeBlock(id, ws)) return false;
  const a = ws.assessment, st = state(ws);
  a.CANDIDATES = (a.CANDIDATES || []).filter(r => r[0] !== id);
  delete st.cands[id];
  st.watch = (st.watch || []).filter(w => w.id !== id);
  for (const f of st.families || []) f.members = (f.members || []).filter(m => m !== id);
  return true;
}

/** The candidate whose draft a family's scenario should start from: the member with the highest total, else the first. */
export function bestMember(f, ws = S.ws) {
  const C = state(ws).cands, list = candidates(ws);
  const ms = (f.members || []).map(id => list.find(c => c.id === id)).filter(Boolean);
  if (!ms.length) return null;
  return ms.slice().sort((x, y) => (total(C[y.id]) ?? -1) - (total(C[x.id]) ?? -1))[0];
}

/**
 * Decided item 20 — a scenario for the register from a candidate (and, for a family, its consolidated statement).
 * Everything the candidate carries goes with it: the chain, the six parameters with their rationales and confidence, the
 * vector (marked 'pattern' until the analyst confirms or changes it), the ATT&CK, CWE and CVE links, the owner and
 * horizon. A parameter the candidate never had keeps the placeholder that step 9 does not count. Reductions start at 0
 * (NV-001) unless the candidate's row set them. Nothing is pushed to the register here: the caller does.
 */
export function scenarioFromCandidate(c, ws = S.ws, { family = null } = {}) {
  const s = blankScenario(nextScenarioId(ws));
  const d = (c && rec(c.id, ws).draft) || {};
  const list = candidates(ws), C = state(ws).cands;
  // a family: its members' rows and drafts, for the links and the assets combined across them (decided item 20)
  const members = family ? (family.members || []).map(id => list.find(x => x.id === id)).filter(Boolean) : (c ? [c] : []);
  const drafts = members.map(m => C[m.id]?.draft || {});
  const union = k => [...new Set(drafts.flatMap(x => x[k] || []))];
  s.name = family ? (family.name || family.id) : (c?.name || c?.id || '');
  s.statement = family?.statement || d.statement || c?.consequence || '';
  s.ref = family ? family.id + ' (' + (family.members || []).join(', ') + ')' : (c ? c.id : '');
  s.threat_source = d.threat_source || c?.source || [...new Set(members.map(m => m.source).filter(Boolean))].join('; ');
  s.vulns = d.vulns?.length ? d.vulns.slice() : [...new Set(members.flatMap(m => String(m.vuln || '').split(/;\s*/)).filter(Boolean))];
  const assets = [...new Set([d.assets || c?.assets, ...members.map(m => C[m.id]?.draft?.assets || m.assets)].filter(Boolean))];
  s.assets = assets.join('; ');
  if (d.processes) s.processes = d.processes;
  if (d.initiating_event) s.threat_event = d.initiating_event;
  if (d.existing_controls) s.controls = Array.isArray(d.existing_controls) ? d.existing_controls.slice() : String(d.existing_controls).split(/;\s*/).filter(Boolean);
  if (d.assumptions) s.assumptions = d.assumptions;
  for (const k of ['attack', 'cwe', 'cves']) { const u = union(k); if (u.length) s[k] = u; }
  // consequences, from the candidate rows; background (why / rationale) from the family and the score cards; origin
  const cons = [...new Set(members.map(m => C[m.id]?.draft?.consequence || (m.consequence !== s.statement ? m.consequence : '')).filter(Boolean))];
  if (cons.length) s.consequences = Object.assign({}, s.consequences, { Operations: cons.join('; ') });
  const why = [];
  if (family?.rationale) why.push(`${family.id}: ${family.rationale}`);
  if (family?.judgment) why.push(`${tr('Selected by judgment')}: ${family.judgment}`);
  for (const m of members) { const r = C[m.id]; if (r?.rat) why.push(`${m.id}: ${r.rat}`); if (r?.basis) why.push(`${m.id} — ${tr('evidence basis')}: ${r.basis}`); if (m.note && !/to estimate/.test(m.note)) why.push(`${m.id}: ${m.note}`); }
  if (why.length) s.background = why.join('\n');
  const from = c ? `From candidate ${c.id}` : `From family ${family?.id || ''}`;
  for (const k of PARAMS) {
    const p = d.params?.[k];
    if (p && Number.isFinite(Number(p.v))) s.params[k] = { v: Number(p.v), qual: '', rat: p.rat || `${from} — ${MK.ESTIMATE} (starting value, not estimated).`, ev: p.ev || '', conf: ['High', 'Medium', 'Low'].includes(p.conf) ? p.conf : 'Low' };
    else s.params[k].rat = MK.PLACEHOLDER;
  }
  if (d.cvss && /^CVSS:4\.0\//.test(d.cvss)) { s.cvss = d.cvss; s.vector_source = 'pattern'; s.vector_ref = d.cvss; }
  else if (d.cvss_score !== null && d.cvss_score !== undefined && d.cvss_score !== '' && Number.isFinite(Number(d.cvss_score))) { s.cvss = ''; s.cvss_score = Number(d.cvss_score); s.vector_source = 'score'; s.vector_ref = ''; }   // 1.9.2 review (H2): a score with no vector computes on the score
  if (d.cvss_note) s.cvss_note = d.cvss_note;
  if (d.red_p > 0 || d.red_i > 0) { s.red_p = Number(d.red_p) || 0; s.red_i = Number(d.red_i) || 0; }   // set on the row: an entry, counted by step 14 (no red_source record — that one names measures)
  if (d.owner) s.owner = d.owner;
  if (d.horizon) s.horizon = d.horizon;
  if (d.scenPattern) s.scenPattern = d.scenPattern;
  if (d.crgo) s.crgo = JSON.parse(JSON.stringify(d.crgo));
  if (d.secopsEv?.length) s.secops = d.secopsEv.map(e => ({ ...e }));
  s.origin = (family ? `From the scenario screening, family ${family.id}` : `From the scenario screening, candidate ${c.id}`) + (c ? ` (${c.id}${d.origin ? ', ' + d.origin : ''})` : '') + ' ' + today();
  return s;
}

/** The screening as CSV rows (header first). */
export function csvRows(ws = S.ws) {
  const a = analysis(ws), C = state(ws).cands;
  const head = ['ID', 'Candidate', ...CRITERIA.map(c => c[0]), 'Total (/60)', ...SCHEMES.map(s => 'Weighted - ' + s[1]), 'Escalation flags', 'Confidence', 'Disposition', 'Family / target', 'Strategies', 'Rationale', 'Exclusion review', 'AI scores'];
  // 1.9.2 (C5) — the last column marks cards whose scores were proposed by AI and accepted (name, date, model)
  const aiMark = r => r?.ai ? `AI-proposed, accepted by ${r.ai.by || '—'} on ${r.ai.date || ''}${r.ai.model ? ' (' + r.ai.model + ')' : ''}` : r?.aiProposal ? 'AI proposal beside the analyst\u2019s scores (not accepted)' : '';
  return [head, ...a.list.map(c => { const r = C[c.id] || {}; const sc = r.scores || [];
    return [c.id, c.name, ...CRITERIA.map((_, i) => sc[i] ?? ''), total(r) ?? '', ...SCHEMES.map(([, , w]) => weighted(r, w) ?? ''), (r.flags || []).join(' '), r.conf || '', r.disp || '',
      familyOf(c.id, ws)?.id || r.target || '', (r.strategy || []).join(' '), r.rat || '', r.exclReview || '', aiMark(r)]; })];
}
