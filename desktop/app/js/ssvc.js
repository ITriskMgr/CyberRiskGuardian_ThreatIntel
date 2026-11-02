/* ssvc.js — Stakeholder-Specific Vulnerability Categorization beside EPSS and KEV (1.9.0).

   SSVC answers a different question from the risk engine: not "how much risk", but "how soon do we
   respond to this vulnerability". It walks a published decision tree — a handful of decision points,
   each with a few qualitative values — to one of four outcomes. This module keeps three trees, chosen
   per workspace:

     deployer       CISA SSVC (default): Exploitation, Automatable, Technical Impact, Mission & Well-being
                    → Track · Track* · Attend · Act
     deployer-cert  CERT/CC SSVC deployer (patch application priority): Exploitation, System Exposure,
                    Automatable, Human Impact → Defer · Scheduled · Out-of-Cycle · Immediate
     supplier       CERT/CC SSVC supplier (patch development priority): Exploitation, Utility (Automatable +
                    Value Density), Technical Impact, Public Safety Impact → Defer · Scheduled · Out-of-Cycle · Immediate

   The tables themselves are in js/data/ssvc-tables.js, row for row as published, with their source.

   Rules this module keeps (DECISIONS-1.9.0, carried forward):
   - **EPSS and KEV are evidence for the Exploitation decision point, never a likelihood.** KEV listed →
     active; EPSS at or above the snapshot's rung-4 thresholds, or a public proof of concept in the loaded
     feeds → public PoC; otherwise none. The analyst may choose another value, with a justification.
   - **An SSVC outcome is never converted to a likelihood.** Nothing here reads or writes Pb(A), Pb(ψ,A)
     or any other parameter; the risk totals are untouched by any decision.
   - **One decision record per vulnerability**: decision points, values, who, when, justification,
     outcome; a new decision keeps the previous one in its history.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { CISA_ROWS, DEPLOYER_ROWS, SUPPLIER_ROWS, HUMAN_IMPACT_ROWS, UTILITY_ROWS, PUBLIC_SAFETY_ROWS, MWB_ROWS } from './data/ssvc-tables.js';
import { blankSsvc } from './migrate.js';
import { today } from './util.js';

/* ---------------- decision points ---------------- */
/** id → { label, values: [[key, label, meaning]] }. Keys are the published SSVC keys, in lower case. */
export const POINTS = {
  exploitation: { label: 'Exploitation', values: [
    ['none', 'None', 'No evidence of exploitation and no public proof of concept.'],
    ['public poc', 'Public PoC', 'A public proof of concept or exploit code exists, or exploitation is straightforward from public information.'],
    ['active', 'Active', 'Credible public evidence of exploitation in the wild (for example, a CISA KEV listing).']] },
  exposure: { label: 'System Exposure', values: [
    ['small', 'Small', 'Local service or program, or a highly controlled network.'],
    ['controlled', 'Controlled', 'Networked, with access restrictions or mitigations that reliably stop exploitation.'],
    ['open', 'Open', 'Reachable from the internet or another widely accessible network.']] },
  automatable: { label: 'Automatable', values: [
    ['no', 'No', 'Reconnaissance, weaponization, delivery and exploitation cannot all be reliably automated.'],
    ['yes', 'Yes', 'An attacker can reliably automate reconnaissance, weaponization, delivery and exploitation.']] },
  technical_impact: { label: 'Technical Impact', values: [
    ['partial', 'Partial', 'Limited control of the component, or limited disclosure of its information.'],
    ['total', 'Total', 'Total control of the component, or total disclosure of its information.']] },
  mission_prevalence: { label: 'Mission Prevalence', values: [
    ['minimal', 'Minimal', 'Used, but neither supports nor provides a mission-essential function.'],
    ['support', 'Support', 'Supports mission-essential functions.'],
    ['essential', 'Essential', 'Directly provides at least one mission-essential function.']] },
  public_wellbeing: { label: 'Public Well-Being Impact', values: [
    ['minimal', 'Minimal', 'Negligible effect on public well-being.'],
    ['material', 'Material', 'Material physical, psychological or financial harm, or harm to essential services.'],
    ['irreversible', 'Irreversible', 'Irreversible harm, such as loss of life or lasting damage to health or the environment.']] },
  safety_impact: { label: 'Safety Impact', values: [
    ['negligible', 'Negligible', 'Minor injuries at most; negligible effect on people or the environment.'],
    ['marginal', 'Marginal', 'Minor injuries or limited, reversible harm.'],
    ['critical', 'Critical', 'Serious injuries or significant harm.'],
    ['catastrophic', 'Catastrophic', 'Loss of life or catastrophic harm.']] },
  mission_impact: { label: 'Mission Impact', values: [
    ['degraded', 'Degraded', 'Little to no effect on mission-essential functions.'],
    ['mef support crippled', 'MEF support crippled', 'Activities that support mission-essential functions are crippled.'],
    ['mef failure', 'MEF failure', 'At least one mission-essential function fails for a period of time.'],
    ['mission failure', 'Mission failure', 'Several or all mission-essential functions fail.']] },
  value_density: { label: 'Value Density', values: [
    ['diffuse', 'Diffuse', 'Each target yields little: the attacker must compromise many.'],
    ['concentrated', 'Concentrated', 'Each target yields much: a single compromise is rich.']] },
  // derived decision points — computed from the sub-trees, never entered
  mwb: { label: 'Mission & Well-being', derived: true, values: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High']] },
  human_impact: { label: 'Human Impact', derived: true, values: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['very high', 'Very high']] },
  utility: { label: 'Utility', derived: true, values: [['laborious', 'Laborious'], ['efficient', 'Efficient'], ['super effective', 'Super effective']] },
  public_safety: { label: 'Public Safety Impact', derived: true, values: [['minimal', 'Minimal'], ['significant', 'Significant']] },
};
export const valueLabel = (point, key) => (POINTS[point]?.values.find(v => v[0] === key) || [key, key || '—'])[1];

/* ---------------- outcomes ---------------- */
export const OUTCOMES = {
  track: { label: 'Track', rank: 0, kind: 'good', meaning: 'No action required now; remediate within standard update timelines.' },
  'track*': { label: 'Track*', rank: 1, kind: 'warn', meaning: 'Remediate within standard timelines, but watch closely: the vulnerability has characteristics that may change the decision.' },
  attend: { label: 'Attend', rank: 2, kind: 'warn', meaning: 'Supervisory attention; remediate sooner than standard timelines.' },
  act: { label: 'Act', rank: 3, kind: 'bad', meaning: 'Supervisory and leadership attention; remediate as soon as possible.' },
  defer: { label: 'Defer', rank: 0, kind: 'good', meaning: 'Do not act at present.' },
  scheduled: { label: 'Scheduled', rank: 1, kind: 'warn', meaning: 'Act during regularly scheduled maintenance.' },
  'out-of-cycle': { label: 'Out-of-Cycle', rank: 2, kind: 'warn', meaning: 'Act more quickly than usual: mitigate or remediate out of cycle.' },
  immediate: { label: 'Immediate', rank: 3, kind: 'bad', meaning: 'Act immediately, with all necessary resources.' },
};
export const outcomeLabel = k => OUTCOMES[k]?.label || '—';

/* ---------------- trees ---------------- */
const lookup = (rows, keys) => { const r = rows.find(x => keys.every((k, i) => x[i] === k)); return r ? r[keys.length] : null; };

export const TREES = {
  deployer: {
    label: 'Deployer — CISA SSVC', short: 'CISA SSVC',
    source: 'CISA SSVC decision tree 2.0.3 (CERT/CC SSVC repository, data/csv/cisa/cisa_coordinator_2_0_3.csv)',
    outcomes: ['track', 'track*', 'attend', 'act'],
    inputs: ['exploitation', 'automatable', 'technical_impact', 'mission_prevalence', 'public_wellbeing'],
    derive: p => ({ mwb: lookup(MWB_ROWS, [p.mission_prevalence, p.public_wellbeing]) }),
    key: (p, d) => [p.exploitation, p.automatable, p.technical_impact, d.mwb],
    keyPoints: ['exploitation', 'automatable', 'technical_impact', 'mwb'],
    rows: CISA_ROWS,
  },
  'deployer-cert': {
    label: 'Deployer — CERT/CC SSVC patch application priority', short: 'CERT/CC deployer',
    source: 'CERT/CC SSVC deployer patch application priority 1.0.0 (data/csv/ssvc/deployer_patch_application_priority_1_0_0.csv)',
    outcomes: ['defer', 'scheduled', 'out-of-cycle', 'immediate'],
    inputs: ['exploitation', 'exposure', 'automatable', 'safety_impact', 'mission_impact'],
    derive: p => ({ human_impact: lookup(HUMAN_IMPACT_ROWS, [p.safety_impact, p.mission_impact]) }),
    key: (p, d) => [p.exploitation, p.exposure, p.automatable, d.human_impact],
    keyPoints: ['exploitation', 'exposure', 'automatable', 'human_impact'],
    rows: DEPLOYER_ROWS,
  },
  supplier: {
    label: 'Supplier — CERT/CC SSVC patch development priority', short: 'CERT/CC supplier',
    source: 'CERT/CC SSVC supplier patch development priority 1.0.0 (data/csv/ssvc/supplier_patch_development_priority_1_0_0.csv)',
    outcomes: ['defer', 'scheduled', 'out-of-cycle', 'immediate'],
    inputs: ['exploitation', 'automatable', 'value_density', 'technical_impact', 'safety_impact'],
    derive: p => ({ utility: lookup(UTILITY_ROWS, [p.automatable, p.value_density]), public_safety: lookup(PUBLIC_SAFETY_ROWS, [p.safety_impact]) }),
    key: (p, d) => [p.exploitation, d.utility, p.technical_impact, d.public_safety],
    keyPoints: ['exploitation', 'utility', 'technical_impact', 'public_safety'],
    rows: SUPPLIER_ROWS,
  },
};
export const TREE_IDS = Object.keys(TREES);

/** Walk a tree. Returns { derived, outcome, complete, missing }: outcome null until every input is set. */
export function evaluate(treeId, points = {}) {
  const T = TREES[treeId];
  if (!T) throw new Error('Unknown SSVC tree: ' + treeId);
  const missing = T.inputs.filter(k => !POINTS[k].values.some(v => v[0] === points[k]));
  if (missing.length) return { derived: {}, outcome: null, complete: false, missing };
  const derived = T.derive(points);
  const outcome = lookup(T.rows, T.key(points, derived));
  return { derived, outcome, complete: !!outcome, missing: outcome ? [] : ['table'] };
}

/* ---------------- the workspace record ---------------- */
export function ensure(ws) {
  ws.ssvc = Object.assign(blankSsvc(), ws.ssvc || {});
  if (!TREES[ws.ssvc.tree]) ws.ssvc.tree = 'deployer';
  return ws.ssvc;
}
export const treeOf = ws => (TREES[ws?.ssvc?.tree] ? ws.ssvc.tree : 'deployer');
export function setTree(ws, id) {
  if (!TREES[id]) throw new Error('Unknown SSVC tree: ' + id);
  ensure(ws).tree = id;
}
export const decisionFor = (ws, id) => ws?.ssvc?.decisions?.[id] || null;

/* ---------------- Exploitation from EPSS, KEV and the feeds (evidence, not likelihood) ---------------- */
export const POC_RE = /proof[- ]of[- ]concept|\bpoc\b|exploit (?:code|released|published|available)|public exploit|metasploit|exploit-db|nuclei template/i;

/** Feed items (as the Threat feeds screen stores them) that name this CVE, and those that report a PoC. */
export function feedSignals(id, items = []) {
  const up = String(id).toUpperCase();
  const hits = items.filter(it => (it.cves || []).some(c => String(c).toUpperCase() === up) || String(it.title || '').toUpperCase().includes(up));
  const poc = hits.filter(it => POC_RE.test(`${it.title || ''} ${it.text || ''} ${(it.tags || []).join(' ')}`));
  return { items: hits.length, poc: poc.length, pocTitles: poc.slice(0, 3).map(it => it.title || '') };
}

/** The thresholds a high EPSS is read against: the snapshot's own rung-4 thresholds when it carries them. */
export function epssThresholds(snap) {
  const t = snap?.thresholds || {};
  return { score: Number(t.epss_rung4_min) || 0.5, percentile: Number(t.epss_percentile_rung4_min) || 0.9 };
}

/**
 * The value the evidence points to for Exploitation, and why. KEV → active; EPSS at or above the rung-4
 * thresholds or a public PoC reported in the loaded feeds → public PoC; otherwise none. A suggestion
 * the analyst confirms or overrides — never a probability.
 */
export function suggestExploitation(v, snap, items = []) {
  const id = String(v?.id || '').toUpperCase();
  const kev = snap?.kev?.cves?.[id] || null;
  const epss = snap?.epss?.scores?.[id] || null;
  const th = epssThresholds(snap);
  const feed = feedSignals(id, items);
  const basis = [];
  let value = 'none';
  if (kev) { value = 'active'; basis.push(`CISA KEV: listed ${kev.added || ''}`.trim()); }
  const hiEpss = epss && (epss[0] >= th.score || epss[1] >= th.percentile);
  if (epss) basis.push(`EPSS ${(epss[0] * 100).toFixed(1)}% (percentile ${(epss[1] * 100).toFixed(0)})${hiEpss ? ' — at or above the high threshold' : ''}`);
  if (feed.poc) basis.push(`${feed.poc} feed item(s) report a public proof of concept`);
  if (value === 'none' && (hiEpss || feed.poc)) value = 'public poc';
  if (!snap) basis.push('No threat-context snapshot loaded: KEV and EPSS unknown');
  else if (!kev && !epss) basis.push('Not in CISA KEV; no EPSS score in the snapshot');
  return { value, basis, kev: kev ? { added: kev.added || '', ransomware: kev.ransomware || '' } : null,
           epss: epss ? [epss[0], epss[1]] : null, poc: feed.poc, items: feed.items, snapshot: snap?.retrieved || null };
}

/**
 * Record a decision. One record per vulnerability; the previous one moves into its history.
 * Requires who decided; requires a justification when Exploitation departs from the evidence.
 */
export function decide(ws, vulnId, { tree = treeOf(ws), points = {}, by = '', justification = '', suggestion = null, date = today() } = {}) {
  const r = evaluate(tree, points);
  if (!r.complete) throw new Error('Every decision point needs a value: ' + r.missing.map(k => POINTS[k]?.label || k).join(', '));
  if (!String(by).trim()) throw new Error('Name the person who takes the decision.');
  const override = suggestion && suggestion.value !== points.exploitation
    ? { from: suggestion.value, to: points.exploitation, justification: String(justification || '').trim() } : null;
  if (override && !override.justification) throw new Error('Exploitation differs from what the evidence suggests: a justification is required.');
  const S = ensure(ws);
  const prev = S.decisions[vulnId];
  const rec = {
    vuln: vulnId, tree, treeSource: TREES[tree].source,
    points: Object.fromEntries(TREES[tree].inputs.map(k => [k, points[k]])),
    derived: r.derived, outcome: r.outcome,
    evidence: suggestion ? { suggested: suggestion.value, basis: suggestion.basis, kev: suggestion.kev, epss: suggestion.epss, poc: suggestion.poc, snapshot: suggestion.snapshot } : null,
    override, by: String(by).trim(), date, justification: String(justification || '').trim(),
    history: prev ? [...(prev.history || []), Object.assign({}, prev, { history: undefined })].slice(-20) : [],
  };
  S.decisions[vulnId] = rec;
  return rec;
}

/** Is a recorded decision out of date? Tree changed, or the evidence now points to a stronger Exploitation value. */
export function stale(rec, ws, suggestion) {
  if (!rec) return null;
  if (rec.tree !== treeOf(ws)) return 'The workspace now uses another SSVC tree.';
  const order = ['none', 'public poc', 'active'];
  if (suggestion && order.indexOf(suggestion.value) > order.indexOf(rec.points.exploitation) && !rec.override)
    return `The evidence now suggests Exploitation = ${valueLabel('exploitation', suggestion.value)}.`;
  return null;
}

/** Counts by outcome for the current tree, for the register KPI. */
export function summary(ws) {
  const t = treeOf(ws), out = Object.fromEntries(TREES[t].outcomes.map(o => [o, 0]));
  let n = 0;
  for (const v of ws.vulns || []) { const d = decisionFor(ws, v.id); if (d && d.tree === t) { out[d.outcome]++; n++; } }
  return { tree: t, decided: n, total: (ws.vulns || []).length, by: out };
}
