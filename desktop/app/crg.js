/* CyberRiskGuardian calculation engine (browser/Node).
 * Mirrors plugins/cyberriskguardian/skills/cyber-risk-assessment/scripts/crg_calc.py exactly.
 * Formulas: CyberRiskGuardian Excel Guide v1.0c, s.11 — never modify silently.
 * (c) 2026 Marc-André Léger — CC BY-NC 4.0 */
(function (root) {
  "use strict";
  const BAND_LOW = 0.90, BAND_HIGH = 1.10;
  const BUDGET_BAND = { min: 0.04, median: 0.078, max: 0.12 };   // % of total IT budget incl. salaries
  const ANCHORS = { max: 0.30, median: 0.50, min: 0.70 };        // appetite anchors
  const DEFAULT_APPETITE = 0.30, DEFAULT_FACTOR = 1000;
  const PARAMS = ["PbA", "Pbx", "De", "Dm", "Th", "Mu"];

  const val = x => (x && typeof x === "object" ? x.v : x);

  function cvssOf(s) {
    if (s.cvss_score !== undefined && s.cvss_score !== null && s.cvss_score !== "") return Number(s.cvss_score);
    if (s.cvss) {
      const C = typeof CVSS4 !== "undefined" ? CVSS4 : require("./cvss4.js");
      return C.score(s.cvss);
    }
    throw new Error((s.id || "Scenario") + ": provide a CVSS vector or score");
  }

  /** Estimated, tolerated, mitigated, residual risk and ratios for one scenario. */
  function calc(s, appetite = DEFAULT_APPETITE, factor = DEFAULT_FACTOR) {
    const p = {};
    for (const k of PARAMS) p[k] = Number(val(s.params[k]));
    const c = cvssOf(s);
    if (!(p.Th > 0 && p.Th <= 1)) throw new Error((s.id || "Scenario") + ": resilience θ must be in (0, 1]");
    for (const k of ["red_p", "red_i"]) {
      if (!(s[k] >= 0 && s[k] <= 1)) throw new Error((s.id || "Scenario") + ": " + k + " must be within 0–1");
    }
    const base = p.PbA * p.Pbx * c * p.Mu / p.Th * factor;
    const est = base * (p.De + p.Dm) / 2;
    const tol = base * appetite;
    const mit = est * s.red_p * s.red_i;
    const res = est - mit;
    return { cvss: c, est, tol, mit, res, ratio: res / tol, pre_ratio: est / tol };
  }

  function classify(ratio) {
    if (ratio < BAND_LOW) return "Below tolerance";
    if (ratio <= BAND_HIGH) return "Approximately at tolerance";
    return "Above tolerance";
  }

  /** Secondary cross-check: T × E × I × (1 − C), C proxied by resilience. */
  function caseNormalized(s) {
    const p = {}; for (const k of PARAMS) p[k] = Number(val(s.params[k]));
    const cur = p.PbA * p.Pbx * (p.De + p.Dm) / 2 * (1 - p.Th);
    return [cur, cur * (1 - s.red_p * s.red_i)];
  }

  /** Sensitivity case: raise threat, exploitation and damages by d; lower resilience and reductions by d. */
  function shift(s, d) {
    const t = JSON.parse(JSON.stringify(s));
    const clamp = x => Math.max(0.05, Math.min(0.99, x));
    for (const k of ["PbA", "Pbx", "De", "Dm"]) t.params[k] = { v: clamp(Number(val(s.params[k])) + d) };
    t.params.Th = { v: clamp(Number(val(s.params.Th)) - d) };
    t.params.Mu = { v: Number(val(s.params.Mu)) };
    t.red_p = clamp(s.red_p - d);
    t.red_i = clamp(s.red_i - d);
    return t;
  }

  function sensitivity(s, delta = 0.10, appetite = DEFAULT_APPETITE, factor = DEFAULT_FACTOR) {
    const out = {};
    for (const [lab, d] of [["lower", -delta], ["central", 0], ["higher", delta]]) {
      const r = calc(shift(s, d), appetite, factor);
      out[lab] = { estimated: r.est, residual: r.res, ratio: r.ratio, classification: classify(r.ratio) };
    }
    out.robust = out.lower.classification === out.higher.classification;
    return out;
  }

  function budgetTarget(a) {
    const B = BUDGET_BAND, A = ANCHORS;
    if (a <= A.max) return B.max;
    if (a <= A.median) return B.max + (a - A.max) / (A.median - A.max) * (B.median - B.max);
    if (a <= A.min) return B.median + (a - A.median) / (A.min - A.median) * (B.min - B.median);
    return B.min;
  }

  function impliedAppetite(pct) {
    const B = BUDGET_BAND, A = ANCHORS;
    if (pct >= B.max) return A.max;
    if (pct >= B.median) return A.max + (B.max - pct) / (B.max - B.median) * (A.median - A.max);
    if (pct >= B.min) return A.median + (B.median - pct) / (B.median - B.min) * (A.min - A.median);
    return null;
  }

  function bandStatus(pct) {
    if (pct < BUDGET_BAND.min) return "Below floor (risk seeking beyond guideline)";
    if (pct > BUDGET_BAND.max) return "Above ceiling";
    return "Within band";
  }

  function run(data, appetite, factor) {
    appetite = appetite ?? data.APPETITE ?? DEFAULT_APPETITE;
    factor = factor ?? data.FACTOR ?? DEFAULT_FACTOR;
    const results = data.SCEN.map(s => {
      const r = calc(s, appetite, factor);
      const [nc, np] = caseNormalized(s);
      return Object.assign({ id: s.id, name: s.name || "" }, r, { cls: classify(r.ratio), norm_cur: nc, norm_post: np });
    });
    return { appetite, factor, results,
      totals: { est: results.reduce((a, x) => a + x.est, 0), res: results.reduce((a, x) => a + x.res, 0) } };
  }

  const api = { calc, classify, caseNormalized, shift, sensitivity, budgetTarget, impliedAppetite, bandStatus, run,
    BAND_LOW, BAND_HIGH, BUDGET_BAND, ANCHORS, DEFAULT_APPETITE, DEFAULT_FACTOR, PARAMS };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.CRG = api;
})(typeof self !== "undefined" ? self : this);
