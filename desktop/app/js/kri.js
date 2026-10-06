/* kri.js — key risk indicators: computed (from the assessment) and operational (measured by the organization),
   threshold evaluation and trend statistics. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, compute, allocation } from './state.js';
import { snapshotAge, classify as ladder } from '../threat.js';
import { criticality } from './assets.js';
import * as MT from './maturity.js';
import * as SG from './safeguards.js';

/** Threshold spec: {dir: 'down'|'up', target, warn, crit} — 'down' = lower is better. */
export const AUTO = [
  { id: 'CRG-01', name: 'Portfolio residual / tolerated ratio', unit: 'ratio', dir: 'down', target: 0.9, warn: 0.9, crit: 1.1, risk: 'All included scenarios', method: 'Σ residual ÷ Σ tolerated (verified engine)', fmt: 2 },
  { id: 'CRG-02', name: 'Scenarios above tolerance', unit: 'count', dir: 'down', target: 0, warn: 1, crit: 3, risk: 'All included scenarios', method: 'Residual/Tolerated > 1.10', fmt: 0 },
  { id: 'CRG-03', name: 'Total residual risk', unit: 'units', dir: 'down', target: null, warn: null, crit: null, risk: 'All included scenarios', method: 'Σ residual (relative units)', fmt: 0 },
  { id: 'CRG-04', name: 'Threat-context snapshot age', unit: 'days', dir: 'down', target: 90, warn: 75, crit: 90, risk: 'Threat calibration', method: 'Today − snapshot retrieval date', fmt: 0 },
  { id: 'CRG-05', name: 'Material scenarios with exposure-gated intel-backed Pb(ψ,A)', unit: '%', dir: 'up', target: 80, warn: 80, crit: 50, risk: 'Material scenarios', method: 'Scenarios untreated ≥ 0.90 with a threat_basis entry ÷ material scenarios', fmt: 0 },
  { id: 'CRG-06', name: 'Exposed CVEs listed in CISA KEV', unit: 'count', dir: 'down', target: 0, warn: 1, crit: 3, risk: 'Exploitation of known vulnerabilities', method: 'Register CVEs with exposure confirmed and KEV-listed in the snapshot', fmt: 0 },
  { id: 'CRG-07', name: 'Scenarios mapped to ATT&CK', unit: '%', dir: 'up', target: 100, warn: 90, crit: 70, risk: 'Assessment quality', method: 'Scenarios with ≥ 1 technique ÷ scenarios', fmt: 0 },
  { id: 'CRG-08', name: 'Above-tolerance scenarios with funded treatment', unit: '%', dir: 'up', target: 100, warn: 80, crit: 50, risk: 'Treatment coverage', method: 'Untreated > 1.10 with Year-1 cost > 0 ÷ untreated > 1.10', fmt: 0 },
  { id: 'CRG-09', name: 'Scenarios with a recorded management decision', unit: '%', dir: 'up', target: 100, warn: 80, crit: 50, risk: 'Governance', method: 'Decision register entries ÷ included scenarios', fmt: 0 },
  { id: 'CRG-11', name: 'EDR coverage of critical endpoints and servers', unit: '%', dir: 'up', target: 100, warn: 98, crit: 90, risk: 'Malware, ransomware', method: 'Critical/high-tier hardware and servers with EDR ÷ those assets (Information assets)', fmt: 0 },
  { id: 'CRG-12', name: 'Assets in service past end of support', unit: 'count', dir: 'down', target: 0, warn: 1, crit: 3, risk: 'Unpatchable vulnerabilities', method: 'Assets not disposed whose end-of-support date has passed', fmt: 0 },
  { id: 'CRG-13', name: 'Critical assets with a KEV-listed CVE', unit: 'count', dir: 'down', target: 0, warn: 1, crit: 2, risk: 'Exploitation of known vulnerabilities', method: 'Critical/high-tier assets linked to a CVE listed in CISA KEV (snapshot)', fmt: 0 },
  { id: 'CRG-14', name: 'Controls implemented — first followed framework', unit: '%', dir: 'up', target: 90, warn: 80, crit: 60, risk: 'Compliance', method: 'Implemented (+½ partial) ÷ applicable controls assessed in Compliance', fmt: 0 },
  // 1.5.5 — the two indicators the maturity & resilience assessment produces. Both are null until it
  // has been scored: an unassessed organization is not a zero.
  { id: 'CRG-15', name: 'CSF 2.0 maturity against target', unit: 'level', dir: 'up', target: null, warn: null, crit: null, risk: 'Capacity to run the practice', method: 'Mean of the CSF 2.0 categories scored (Maturity & resilience); target is the mean target set', fmt: 2 },
  { id: 'CRG-16', name: 'Resilience capabilities covered by a safeguard in force', unit: 'count', dir: 'up', target: 6, warn: 5, crit: 3, risk: 'θ(ψ,A) — organizational resilience', method: 'Capabilities with ≥ 1 in-force safeguard contributing (Existing safeguards)', fmt: 0 },
  { id: 'CRG-10', name: 'Cybersecurity spend as % of IT budget', unit: '%', dir: 'up', target: null, warn: null, crit: null, risk: 'Budget alignment', method: 'Current cyber spend ÷ total IT budget; target from appetite', fmt: 2 },
];

export function autoValues(ws = S.ws) {
  const R = compute(ws);
  const v = {};
  v['CRG-01'] = R.totals.tol ? R.totals.res / R.totals.tol : null;
  v['CRG-02'] = R.counts.above;
  v['CRG-03'] = R.totals.res;
  v['CRG-04'] = ws.snapshot?.retrieved ? snapshotAge({ retrieved: ws.snapshot.retrieved, expires: ws.snapshot.expires }).ageDays : null;
  const material = R.inc.filter(r => r.est / r.tol >= CRG.BAND_LOW);
  v['CRG-05'] = material.length ? 100 * material.filter(r => (r.s.threat_basis || []).length).length / material.length : null;
  v['CRG-06'] = S.snap && ws === S.ws ? ws.vulns.filter(x => x.exposed && S.snap.kev?.cves?.[x.id]).length : null;
  v['CRG-07'] = R.rows.length ? 100 * R.rows.filter(r => (r.s.attack || []).length).length / R.rows.length : null;
  const above = R.inc.filter(r => r.est / r.tol > CRG.BAND_HIGH);
  v['CRG-08'] = above.length ? 100 * above.filter(r => r.cost > 0).length / above.length : 100;
  v['CRG-09'] = R.inc.length ? 100 * R.inc.filter(r => ws.decisions[r.id]?.option).length / R.inc.length : null;
  const crit = (ws.assets || []).filter(a => ['hardware', 'server'].includes(a.type) && a.lifecycle?.stage !== 'disposed' && ['Critical', 'High'].includes(criticality(a, ws).tier));
  v['CRG-11'] = crit.length ? 100 * crit.filter(a => a.endpoint?.edr === true).length / crit.length : null;
  const live = (ws.assets || []).filter(a => a.lifecycle?.stage !== 'disposed');
  v['CRG-12'] = live.length ? live.filter(a => { const e = a.lifecycle?.eos || a.lifecycle?.eol; return e && e < new Date().toISOString().slice(0, 10); }).length : null;
  v['CRG-13'] = live.length && S.snap && ws === S.ws ? live.filter(a => ['Critical', 'High'].includes(criticality(a, ws).tier) && (a.vulns || []).some(c => S.snap.kev?.cves?.[c])).length : null;
  const fw = ws.compliance?.frameworks?.[0];
  if (fw) { const soa = ws.compliance.soa || {}; const rs = Object.entries(soa).filter(([k, r]) => k.startsWith(fw + ':') && r.status && r.status !== 'na' && r.applicable !== 'no');
    v['CRG-14'] = rs.length ? 100 * rs.reduce((t, [, r]) => t + (r.status === 'implemented' ? 1 : r.status === 'partial' ? 0.5 : 0), 0) / rs.length : null; } else v['CRG-14'] = null;
  const b = ws.budget || {};
  v['CRG-10'] = b.it_budget > 0 ? 100 * b.spend / b.it_budget : null;
  // 1.5.5 — read through the two models so there is one definition of each, not a second copy here.
  const m = MT.maturity(ws);
  v['CRG-15'] = m.overall === null ? null : +m.overall.toFixed(2);
  v['CRG-16'] = SG.list(ws).length ? SG.capabilityCoverage(ws).filter(c => c.best > 0).length : null;
  return v;
}
export function autoDefs(ws = S.ws) {
  return AUTO.map(d => {
    if (d.id === 'CRG-10') { const t = CRG.budgetTarget(Number(ws.assessment.APPETITE)) * 100; return Object.assign({}, d, { target: +t.toFixed(2), warn: +(t * 0.9).toFixed(2), crit: CRG.BUDGET_BAND.min * 100 }); }
    if (d.id === 'CRG-03') return d;
    return d;
  });
}

/** Parse "100%", "< 95%", "> 8%", "≤ 30 days", "> 70% / < 5%" → first number and comparator. */
function parseTh(s) {
  if (s === null || s === undefined || s === '') return null;
  if (typeof s === 'number') return { v: s, op: null };
  const m = /([<>≤≥]=?)?\s*(-?\d+(?:[.,]\d+)?)/.exec(String(s));
  return m ? { v: Number(m[2].replace(',', '.')), op: m[1] || null } : null;
}
export function manualDefs(ws = S.ws) {
  return (ws.assessment.KRIS || []).map(k => {
    const [id, name, scen, method, source, owner, freq, target, warning, critical] = k;
    const t = parseTh(target), w = parseTh(warning), c = parseTh(critical);
    let dir = 'up';
    if (w?.op && /</.test(w.op)) dir = 'up'; else if (w?.op && />/.test(w.op)) dir = 'down';
    else if (t && c) dir = c.v < t.v ? 'up' : 'down';
    const unit = /%/.test(String(target)) ? '%' : /day/i.test(String(target) + String(warning)) ? 'days' : '';
    return { id, name, risk: scen, method, source, owner, freq, unit, dir, target: t?.v ?? null, warn: w?.v ?? null, crit: c?.v ?? null, raw: { target, warning, critical }, manual: true, fmt: 1 };
  });
}
export const allDefs = (ws = S.ws) => [...autoDefs(ws), ...manualDefs(ws)];

export function status(def, v) {
  if (v === null || v === undefined || !Number.isFinite(v)) return { k: 'none', label: 'no data' };
  if (def.crit === null && def.warn === null) return { k: 'info', label: 'tracked' };
  const inclusive = def.unit === 'count';
  const breach = th => th !== null && th !== undefined && (def.dir === 'down' ? (inclusive ? v >= th : v > th) : (inclusive ? v <= th : v < th));
  if (breach(def.crit)) return { k: 'bad', label: 'critical' };
  if (breach(def.warn)) return { k: 'warn', label: 'warning' };
  return { k: 'good', label: 'on target' };
}

export function series(id, ws = S.ws) {
  return (ws.kriHistory || []).filter(h => Number.isFinite(h.values?.[id])).map(h => ({ x: h.date, y: h.values[id], note: h.note })).sort((a, b) => a.x.localeCompare(b.x));
}

/** Trend: least-squares slope per 30 days, change since first and since previous point, direction. */
export function trend(def, pts) {
  if (pts.length < 2) return { n: pts.length, dir: 'flat', label: pts.length ? 'one point' : 'no history' };
  const t0 = +new Date(pts[0].x);
  const xs = pts.map(p => (+new Date(p.x) - t0) / 864e5), ys = pts.map(p => p.y);
  const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
  const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const slope = sxx ? xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / sxx * 30 : 0;
  const last = ys[ys.length - 1], prev = ys[ys.length - 2], first = ys[0];
  const scale = Math.max(Math.abs(my), 1e-9);
  const flat = Math.abs(slope) / scale < 0.02 && Math.abs(last - prev) / scale < 0.02;
  const up = slope > 0;
  const good = flat ? null : (def.dir === 'down' ? !up : up);
  const breaches = pts.filter(p => status(def, p.y).k === 'bad').length;
  return { n: pts.length, slope, last, prev, first, delta: last - prev, deltaFirst: last - first, dir: flat ? 'flat' : up ? 'up' : 'down', good, breaches,
    label: flat ? 'stable' : (good ? 'improving' : 'worsening') };
}
