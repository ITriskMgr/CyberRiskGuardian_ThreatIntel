/* CyberRiskGuardian calculation engine (browser/Node).
 * Mirrors plugins/cyberriskguardian/skills/cyber-risk-assessment/scripts/crg_calc.py exactly.
 * Formulas: CyberRiskGuardian Excel Guide v1.0c, s.11 — never modify silently.
 * Input validation (1.8.0): probabilities, damages, criticality and reductions in [0, 1]; θ in (0, 1];
 * appetite strictly in (0, 1); δm ≥ δe; CVSS required (blank is an error, never 0), 0–10.
 * (c) 2026 Marc-André Léger — CC BY-NC 4.0 */
(function (root) {
  "use strict";
  const BAND_LOW = 0.90, BAND_HIGH = 1.10;
  const BUDGET_BAND = { min: 0.04, median: 0.078, max: 0.12 };   // % of total IT budget incl. salaries
  const ANCHORS = { max: 0.30, median: 0.50, min: 0.70 };        // appetite anchors
  const DEFAULT_APPETITE = 0.30, DEFAULT_FACTOR = 1000;
  const PARAMS = ["PbA", "Pbx", "De", "Dm", "Th", "Mu"];
  const LABEL = { PbA: "Pb(A)", Pbx: "Pb(ψ,A)", De: "δe", Dm: "δm", Th: "θ", Mu: "μ(E)" };

  const val = x => (x && typeof x === "object" ? x.v : x);

  const blank = x => x === undefined || x === null || (typeof x === "string" && x.trim() === "");
  const C4 = () => (typeof CVSS4 !== "undefined" ? CVSS4 : require("./cvss4.js"));

  /** The CVSS score used by the formula: the stored score, else the score of the vector. Blank is an
      error ("CVSS required"), never 0; a score outside 0–10 is an error. */
  function cvssOf(s) {
    const id = s.id || "Scenario";
    if (!blank(s.cvss_score)) {
      const c = Number(s.cvss_score);
      if (!Number.isFinite(c) || c < 0 || c > 10) throw new Error(id + ": CVSS score must be a number from 0.0 to 10.0");
      return c;
    }
    if (!blank(s.cvss)) {
      const c = C4().score(String(s.cvss).trim());
      if (!Number.isFinite(c)) throw new Error(id + ": the CVSS vector could not be scored");
      return c;
    }
    throw new Error(id + ": CVSS required — provide a CVSS v4.0 vector or score");
  }

  /** Recompute the score from the vector and compare it with a stored score (flag only, never a change). */
  function cvssCheck(s) {
    const stored = blank(s.cvss_score) ? null : Number(s.cvss_score);
    let computed = null;
    if (!blank(s.cvss)) { try { computed = C4().score(String(s.cvss).trim()); } catch (e) { computed = null; } }
    const agree = stored === null || computed === null ? null : Math.abs(stored - computed) < 0.05;
    return { stored, computed, agree };
  }

  /** Validation of the inputs (decision 4): every rule, one message per problem. */
  function validate(s, appetite = DEFAULT_APPETITE, factor = DEFAULT_FACTOR) {
    const id = s.id || "Scenario", out = [];
    const p = {};
    for (const k of PARAMS) {
      const raw = val((s.params || {})[k]);
      p[k] = blank(raw) ? NaN : Number(raw);
    }
    for (const k of ["PbA", "Pbx", "De", "Dm", "Mu"]) {
      if (!Number.isFinite(p[k]) || p[k] < 0 || p[k] > 1) out.push(id + ": " + LABEL[k] + " must be within 0–1");
    }
    if (!(Number.isFinite(p.Th) && p.Th > 0 && p.Th <= 1)) out.push(id + ": resilience θ must be in (0, 1]");
    if (Number.isFinite(p.De) && Number.isFinite(p.Dm) && p.Dm < p.De) out.push(id + ": δm must be at least δe");
    for (const k of ["red_p", "red_i"]) {
      const r = blank(s[k]) ? NaN : Number(s[k]);
      if (!(Number.isFinite(r) && r >= 0 && r <= 1)) out.push(id + ": " + k + " must be within 0–1");
    }
    const a = Number(appetite);
    if (!(Number.isFinite(a) && a > 0 && a < 1)) out.push("Appetite must be strictly between 0 and 1");
    if (!(Number(factor) > 0)) out.push("The multiplication factor must be greater than 0");
    try { cvssOf(s); } catch (e) { out.push(e.message); }
    return out;
  }

  /** Estimated, tolerated, mitigated, residual risk and ratios for one scenario. */
  function calc(s, appetite = DEFAULT_APPETITE, factor = DEFAULT_FACTOR) {
    const errs = validate(s, appetite, factor);
    if (errs.length) throw new Error(errs.join("; "));
    const p = {};
    for (const k of PARAMS) p[k] = Number(val(s.params[k]));
    const c = cvssOf(s);
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

  /** Combined reduction of several measures on the same lever: 1 − ∏(1 − rᵢ) (decision 2, product rule). */
  function combine(rs) {
    let keep = 1;
    for (const r of rs || []) { const x = Number(r); if (!(x >= 0 && x <= 1)) throw new Error("each reduction must be within 0–1"); keep *= 1 - x; }
    return 1 - keep;
  }

  /** Cost-effectiveness: risk units removed per $1,000 = (Re − Residual) ÷ cost × 1,000. */
  const costEffectiveness = (est, res, cost) => (Number(cost) > 0 ? (est - res) / Number(cost) * 1000 : null);

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

  const api = { calc, validate, cvssOf, cvssCheck, combine, costEffectiveness, classify, caseNormalized, shift, sensitivity, budgetTarget, impliedAppetite, bandStatus, run,
    BAND_LOW, BAND_HIGH, BUDGET_BAND, ANCHORS, DEFAULT_APPETITE, DEFAULT_FACTOR, PARAMS };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.CRG = api;
})(typeof self !== "undefined" ? self : this);
