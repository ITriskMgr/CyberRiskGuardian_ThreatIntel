/* registry.js — the risk register model (1.4.0) and the shareable registry package (crg-registry/1):
   risks with their threats, vulnerabilities, assets, scenarios and treatment; the scenario registry; optional
   measures; anonymized on request; JSON, Markdown or CSV. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { GENERATOR } from './version.js';
import { S, compute, scen, included } from './state.js';
import { techName } from './ontology.js';
import { combined } from './catalog.js';
import { today, toCSV } from './util.js';
import * as A from './anon.js';

export const CATEGORIES = ['Operational', 'Privacy', 'Compliance', 'Financial', 'Strategic', 'Technology', 'Third party', 'Safety'];
export const TREAT = ['Mitigate', 'Transfer', 'Avoid', 'Accept'];
export const RSTATUS = [['open', 'Open'], ['treating', 'Treatment in progress'], ['monitoring', 'Monitoring'], ['accepted', 'Accepted'], ['closed', 'Closed']];
export const L_LABEL = ['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'];
export const I_LABEL = ['', 'Minimal', 'Minor', 'Moderate', 'Major', 'Severe'];
const v = (s, k) => Number(s.params?.[k]?.v ?? s.params?.[k]);
const band = (x, cuts) => { let n = 1; for (const c of cuts) if (x >= c) n++; return Math.min(5, n); };
export const lFrom = (pa, px) => band(pa * px, [0.05, 0.15, 0.35, 0.6]);
export const iFrom = (de, dm, mu) => band((de + dm) / 2 * mu, [0.1, 0.25, 0.45, 0.65]);

/** 1–5 ratings suggested from a scenario: current (its parameters), target (after the measures' combined reductions). */
export function ratingsFromScenario(s, ws = S.ws) {
  const cur = { l: lFrom(v(s, 'PbA'), v(s, 'Pbx')), i: iFrom(v(s, 'De'), v(s, 'Dm'), v(s, 'Mu')) };
  const c = combined(s.id, ws);
  const rp = c.measures.length ? c.red_p : s.red_p, ri = c.measures.length ? c.red_i : s.red_i;
  const tgt = { l: lFrom(v(s, 'PbA'), v(s, 'Pbx') * (1 - rp)), i: iFrom(v(s, 'De') * (1 - ri), v(s, 'Dm') * (1 - ri), v(s, 'Mu')) };
  return { inherent: { ...cur }, current: cur, target: tgt };
}
export function nextRiskId(ws = S.ws) { let n = 0; for (const r of ws.risks || []) { const m = /^R-(\d+)$/.exec(r.id); if (m) n = Math.max(n, +m[1]); } return 'R-' + String(n + 1).padStart(3, '0'); }
export function blankRisk(o = {}) {
  return Object.assign({ id: nextRiskId(), title: '', desc: '', category: 'Operational', owner: '', scenarios: [], assets: [], threats: [], threatText: '', vulns: [],
    inherent: { l: 3, i: 3 }, current: { l: 3, i: 3 }, target: { l: 2, i: 2 }, treatment: 'Mitigate', measures: [], status: 'open', review: '', acceptance: null, history: [], created: today() }, o);
}
export function riskFromScenario(s, ws = S.ws) {
  const rt = ratingsFromScenario(s, ws);
  const ms = (ws.measures || []).filter(m => m.status !== 'rejected' && (m.scen || []).includes(s.id)).map(m => m.id);
  const dec = ws.decisions?.[s.id]?.option;
  return blankRisk({ title: s.name || s.id, desc: s.statement || '', owner: s.owner || '', scenarios: [s.id], assets: (s.assetIds || []).slice(), threats: (s.attack || []).slice(),
    threatText: [s.threat_source, s.threat_event].filter(Boolean).join(' — '), vulns: [...(s.cves || []), ...(s.cwe || [])], ...rt, measures: ms,
    treatment: dec || (ms.length ? 'Mitigate' : 'Mitigate'), category: /privacy|personal|health information|law 25/i.test(s.statement + s.name) ? 'Privacy' : 'Operational',
    history: [{ date: today(), what: `Created from scenario ${s.id}` }] });
}
export const score = x => (x?.l || 0) * (x?.i || 0);
export const level = n => n >= 15 ? ['Very high', 'bad'] : n >= 10 ? ['High', 'bad'] : n >= 5 ? ['Medium', 'warn'] : ['Low', 'good'];

/** CRG metrics of a risk = sum over its scenarios (verified engine). */
export function crgOf(r, R) {
  const rows = R.rows.filter(x => (r.scenarios || []).includes(x.id));
  if (!rows.length) return null;
  const est = rows.reduce((t, x) => t + x.est, 0), tol = rows.reduce((t, x) => t + x.tol, 0), res = rows.reduce((t, x) => t + x.res, 0);
  return { est, tol, res, ratio: res / tol, cls: CRG.classify(res / tol), n: rows.length };
}
export function log(r, what) { (r.history ||= []).push({ date: today(), what }); }

/* ---------------- shareable package ---------------- */
export function buildPackage(ws = S.ws, { risks = true, scenarios = true, measures = false, scope = 'all', anon = A.DEFAULT_OPTS } = {}) {
  const R = compute(ws);
  const res = id => R.rows.find(x => x.id === id);
  const snap = S.snap;
  let scens = ws.assessment.SCEN.filter(s => scope === 'all' || included(s.id, ws));
  let rks = (ws.risks || []).filter(r => scope === 'all' || r.status !== 'closed');
  const vulnInfo = id => { const x = (ws.vulns || []).find(y => y.id === id); return { id, exposed: !!x?.exposed, kev: !!snap?.kev?.cves?.[id], epss: snap?.epss?.scores?.[id]?.[0] ?? snap?.epss?.scores?.[id]?.epss ?? null }; };
  const assetInfo = id => { const a = (ws.assets || []).find(x => x.id === id); return a ? { id, name: a.name, type: a.type, classification: a.classification, criticality: a.critScore ?? null } : { id }; };
  const pkg = {
    schema: 'crg-registry/1', generated: new Date().toISOString(), generator: GENERATOR,
    anonymized: !!anon.enabled,
    organization: { name: ws.org.name || ws.name, sector: ws.org.sector, size: ws.org.size, region: ws.org.region, kind: ws.kind },
    method: { appetite: ws.assessment.APPETITE, factor: ws.assessment.FACTOR, currency: ws.assessment.CURRENCY || 'CAD', period: ws.assessment.PERIOD || 'next 12 months',
      formulas: 'CyberRiskGuardian Excel guide v1.0c §11 — estimated = Pb(A)·Pb(ψ,A)·CVSS·((δe+δm)/2)·μ(E)/θ·factor; tolerated uses the appetite; mitigated = estimated·red_p·red_i; residual = estimated − mitigated',
      note: 'Relative decision-support indicators, not predictions of loss. Analytical estimates require validation by the organization.' },
  };
  if (risks) pkg.risks = rks.map(r => {
    const c = crgOf(r, R);
    return { id: r.id, title: r.title, description: r.desc, category: r.category, owner: r.owner, status: r.status, treatment: r.treatment,
      inherent: r.inherent, current: r.current, target: r.target, current_level: level(score(r.current))[0], target_level: level(score(r.target))[0],
      crg: c ? { estimated: Math.round(c.est), tolerated: Math.round(c.tol), residual: Math.round(c.res), ratio: +c.ratio.toFixed(3), classification: c.cls } : null,
      scenarios: r.scenarios, assets: (r.assets || []).map(assetInfo),
      threats: (r.threats || []).map(t => ({ id: t, name: techName(t) })), threat_description: r.threatText,
      vulnerabilities: (r.vulns || []).map(x => x.startsWith('CVE') ? vulnInfo(x) : { id: x }), measures: r.measures, review: r.review,
      acceptance: r.acceptance ? { by: r.acceptance.by, date: r.acceptance.date, until: r.acceptance.until, rationale: r.acceptance.rationale } : null };
  });
  if (scenarios) pkg.scenarios = scens.map(s => {
    const x = res(s.id);
    return { id: s.id, ref: s.ref, name: s.name, statement: s.statement, stakeholders: s.stakeholders, threat_source: s.threat_source, threat_event: s.threat_event,
      vulnerabilities: s.vulns, assets: s.assets, processes: s.processes, existing_controls: s.controls, sequence: s.sequence, consequences: s.consequences,
      params: Object.fromEntries(Object.entries(s.params).map(([k, p]) => [k, { v: p.v, conf: p.conf, rat: p.rat }])), cvss: s.cvss, red_p: s.red_p, red_i: s.red_i,
      attack: s.attack, cwe: s.cwe, cves: (s.cves || []).map(vulnInfo), narrative: s.narrative,
      results: x ? { estimated: Math.round(x.est), tolerated: Math.round(x.tol), residual: Math.round(x.res), ratio: +x.ratio.toFixed(3), classification: x.cls } : null };
  });
  if (measures) pkg.measures = (ws.measures || []).filter(m => m.status !== 'rejected').map(m => ({ id: m.id, name: m.name, fn: m.fn, owner: m.owner, controls: m.ctl, scenarios: m.scen,
    rp: m.rp, ri: m.ri, effects: m.eff, initial: Number(m.initial) || 0, recurring: Number(m.recurring) || 0, months: m.months, status: m.status, confidence: m.conf, rationale: m.rationale }));
  // threat and vulnerability summary
  const tech = {}; for (const s of scens) for (const t of s.attack || []) (tech[t] ||= { id: t, name: techName(t), scenarios: [] }).scenarios.push(s.id);
  pkg.threats = Object.values(tech).sort((a, b) => b.scenarios.length - a.scenarios.length);
  const vids = new Set([...scens.flatMap(s => s.cves || []), ...(risks ? rks.flatMap(r => (r.vulns || []).filter(x => x.startsWith('CVE'))) : [])]);
  pkg.vulnerabilities = [...vids].map(vulnInfo);
  let out = pkg, ctx = null;
  if (anon.enabled) {
    ctx = A.context(ws, anon);
    out = A.walk(pkg, ctx, anon);
    out.organization.name = 'Organization A';
    out.anonymization = { options: Object.fromEntries(Object.entries(anon).filter(([k]) => k !== 'custom')), replacements: ctx.counts,
      note: 'Automatically anonymized by CyberRiskGuardian Desktop and reviewed by the publisher. Placeholders are stable within this package.' };
  }
  return { pkg: out, ctx };
}

export function toMarkdown(p) {
  const L = [`# Risk registry — ${p.organization.name}`, '', `Generated ${p.generated.slice(0, 10)} by ${p.generator}${p.anonymized ? ' · anonymized' : ''}.`, '',
    `Sector: ${p.organization.sector || '—'} · Region: ${p.organization.region || '—'} · Appetite ${p.method.appetite} · Period ${p.method.period}`, '', '> ' + p.method.note, ''];
  if (p.risks) {
    L.push('## Risk register', '', '| ID | Risk | Category | Owner | Current | Target | CRG ratio | Treatment | Status |', '|---|---|---|---|---|---|---|---|---|');
    for (const r of p.risks) L.push(`| ${r.id} | ${r.title} | ${r.category} | ${r.owner || ''} | ${r.current_level} (${r.current.l}×${r.current.i}) | ${r.target_level} (${r.target.l}×${r.target.i}) | ${r.crg ? r.crg.ratio + ' — ' + r.crg.classification : '—'} | ${r.treatment} | ${r.status} |`);
    for (const r of p.risks) {
      L.push('', `### ${r.id} — ${r.title}`, r.description || '', '');
      if (r.threats.length || r.threat_description) L.push(`- **Threats:** ${[r.threat_description, ...r.threats.map(t => `${t.id} ${t.name}`)].filter(Boolean).join('; ')}`);
      if (r.vulnerabilities.length) L.push(`- **Vulnerabilities:** ${r.vulnerabilities.map(v => v.id + (v.kev ? ' (KEV)' : '') + (v.exposed ? ' (exposed)' : '')).join(', ')}`);
      if (r.assets.length) L.push(`- **Assets:** ${r.assets.map(a => a.name || a.id).join(', ')}`);
      if (r.scenarios.length) L.push(`- **Scenarios:** ${r.scenarios.join(', ')}`);
      if (r.measures?.length) L.push(`- **Measures:** ${r.measures.join(', ')}`);
    }
  }
  if (p.scenarios) {
    L.push('', '## Scenario registry', '', '| ID | Scenario | Pb(A) | Pb(ψ,A) | δe | δm | θ | μ(E) | Residual / tolerated | Classification |', '|---|---|---|---|---|---|---|---|---|---|');
    for (const s of p.scenarios) L.push(`| ${s.id} | ${s.name} | ${s.params.PbA?.v} | ${s.params.Pbx?.v} | ${s.params.De?.v} | ${s.params.Dm?.v} | ${s.params.Th?.v} | ${s.params.Mu?.v} | ${s.results ? s.results.ratio : '—'} | ${s.results?.classification || '—'} |`);
    for (const s of p.scenarios) L.push('', `### ${s.id} — ${s.name}`, s.statement || '', '', `- ATT&CK: ${(s.attack || []).join(', ') || '—'} · CWE: ${(s.cwe || []).join(', ') || '—'} · CVE: ${(s.cves || []).map(c => c.id).join(', ') || '—'}`);
  }
  if (p.measures) { L.push('', '## Measures', '', '| ID | Measure | Function | Scenarios | rp | ri | One-time | Recurring |', '|---|---|---|---|---|---|---|---|'); for (const m of p.measures) L.push(`| ${m.id} | ${m.name} | ${m.fn} | ${m.scenarios.join(', ')} | ${m.rp} | ${m.ri} | ${m.initial} | ${m.recurring} |`); }
  if (p.threats?.length) { L.push('', '## Threat techniques (ATT&CK)', ''); for (const t of p.threats) L.push(`- ${t.id} ${t.name} — ${t.scenarios.join(', ')}`); }
  if (p.anonymization) L.push('', '---', `Anonymization: ${Object.entries(p.anonymization.replacements).map(([k, n]) => n + ' ' + k).join(', ') || 'none needed'}.`);
  return L.join('\n');
}
export function toCSVs(p) {
  const out = {};
  if (p.risks) out.risks = toCSV([['id', 'title', 'category', 'owner', 'status', 'treatment', 'current_l', 'current_i', 'target_l', 'target_i', 'crg_ratio', 'crg_class', 'scenarios', 'threats', 'vulnerabilities', 'assets', 'measures'],
    ...p.risks.map(r => [r.id, r.title, r.category, r.owner, r.status, r.treatment, r.current.l, r.current.i, r.target.l, r.target.i, r.crg?.ratio ?? '', r.crg?.classification ?? '', r.scenarios.join(' '), r.threats.map(t => t.id).join(' '), r.vulnerabilities.map(v => v.id).join(' '), r.assets.map(a => a.name || a.id).join('; '), (r.measures || []).join(' ')])]);
  if (p.scenarios) out.scenarios = toCSV([['id', 'name', 'statement', 'threat_source', 'PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu', 'cvss', 'red_p', 'red_i', 'estimated', 'tolerated', 'residual', 'ratio', 'classification', 'attack', 'cwe', 'cves'],
    ...p.scenarios.map(s => [s.id, s.name, s.statement, s.threat_source, s.params.PbA?.v, s.params.Pbx?.v, s.params.De?.v, s.params.Dm?.v, s.params.Th?.v, s.params.Mu?.v, s.cvss, s.red_p, s.red_i,
      s.results?.estimated, s.results?.tolerated, s.results?.residual, s.results?.ratio, s.results?.classification, (s.attack || []).join(' '), (s.cwe || []).join(' '), (s.cves || []).map(c => c.id).join(' ')])]);
  return out;
}
