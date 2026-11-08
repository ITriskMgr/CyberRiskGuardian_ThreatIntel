/* CyberRiskGuardian calculation engine (browser/Node).
 * Mirrors plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/crg_calc.py (the reference engine)
 * and desktop/app/engine/crg_calc.py exactly.
 * Formulas: CyberRiskGuardian Excel Guide v1.0c, s.11 — never modify silently.
 * Input validation (1.8.0): probabilities, damages, criticality and reductions in [0, 1]; θ in (0, 1];
 * appetite strictly in (0, 1); δm ≥ δe; CVSS required (blank is an error, never 0), 0–10.
 * One rule for every engine (X-2): a value must be a number — a numeric string ("0.7") or a boolean is rejected;
 * a missing reduction (red_p / red_i absent or null) is 0 (no treatment); a blank CVSS is never 0.
 * CVSS precedence (X-1): the vector wins. When a scenario carries both a vector and a stored score, the score is
 * recomputed from the vector and used; a stored score that disagrees is flagged (result.warnings), never corrected
 * silently. Only CVSS v4.0 Base metrics are accepted (CVSS-B); exploitation evidence belongs in Pb(ψ,A).
 * Zero tolerated risk (Pb(A), Pb(ψ,A), μ(E) or CVSS at 0): the ratios are NaN (null in JSON) and the scenario is classified
 * "Not applicable (tolerated risk 0)" — never "Above tolerance"; a warning asks to confirm the zero is deliberate.
 * (c) 2026 Marc-André Léger — CC BY-NC 4.0 */
(function (root) {
  "use strict";
  const BAND_LOW = 0.90, BAND_HIGH = 1.10;
  // Best-practice budget point targets (% of total IT budget incl. salaries) by appetite, linear in between,
  // clamped outside: 12% at appetite ≤ 0.30, 7.8% at 0.50, 4% at ≥ 0.70 (book v2.51 ch06 step 18, ch17).
  const POINT_TARGETS = [[0.30, 0.12], [0.50, 0.078], [0.70, 0.04]];
  const BUDGET_BAND = { min: 0.04, median: 0.078, max: 0.12 };   // the three point targets (kept for compatibility)
  const ANCHORS = { max: 0.30, median: 0.50, min: 0.70 };        // appetite at each point target
  const DEFAULT_APPETITE = 0.30, DEFAULT_FACTOR = 1000;
  const CVSS_TOLERANCE = 0.05;              // a stored score differing from the vector's score by more is flagged
  const NOT_APPLICABLE = "Not applicable (tolerated risk 0)";
  const PARAMS = ["PbA", "Pbx", "De", "Dm", "Th", "Mu"];
  const LABEL = { PbA: "Pb(A)", Pbx: "Pb(ψ,A)", De: "δe", Dm: "δm", Th: "θ", Mu: "μ(E)" };

  const val = x => (x && typeof x === "object" ? x.v : x);

  const blank = x => x === undefined || x === null || (typeof x === "string" && x.trim() === "");
  /** A number proper: not a numeric string, not a boolean, finite. */
  const isNum = x => typeof x === "number" && Number.isFinite(x);
  const C4 = () => (typeof CVSS4 !== "undefined" ? CVSS4 : require("./cvss4.js"));

  // CVSS v4.0 metric families outside the Base metrics; refused with the reference engine's messages (X-1).
  const THREAT = ["E"], ENVIRONMENTAL = ["CR", "IR", "AR", "MAV", "MAC", "MAT", "MPR", "MUI", "MVC", "MVI", "MVA", "MSC", "MSI", "MSA"], SUPPLEMENTAL = ["S", "AU", "R", "V", "RE", "U"];
  /** Throws when the vector carries Threat, Environmental or Supplemental metrics: CRG scores CVSS-B only. */
  function checkBaseOnly(vec) {
    const keys = String(vec).trim().split("/").slice(1).filter(Boolean).map(f => f.split(":")[0]);
    const t = keys.filter(k => THREAT.includes(k)), e = keys.filter(k => ENVIRONMENTAL.includes(k)), u = keys.filter(k => SUPPLEMENTAL.includes(k));
    if (t.length) throw new Error("CVSS-B only: Threat metric " + t.join(", ") + " is not accepted — route exploitation evidence (CISA KEV, EPSS, proof of concept) to Pb(ψ,A) and give the Base vector");
    if (e.length) throw new Error("CVSS-B only: Environmental metric " + e.join(", ") + " is not accepted — organizational context enters through μ(E), δe, δm and θ; give the Base vector");
    if (u.length) throw new Error("CVSS-B only: Supplemental metric " + u.join(", ") + " is not accepted (it does not change the score) — give the Base vector");
  }
  /** Score a vector (Base metrics only; cvss4.js refuses anything else too). */
  function scoreVector(vec) {
    checkBaseOnly(vec);
    const c = C4().score(String(vec).trim());
    if (!Number.isFinite(c)) throw new Error("the CVSS vector could not be scored");
    return c;
  }

  /**
   * Resolve the CVSS score of a scenario: { score, source, errors, warnings }.
   * The vector is authoritative: its score is recomputed and used; a stored score that disagrees by more than
   * CVSS_TOLERANCE is flagged in warnings. A scenario with a score and no vector uses the score. Neither → "CVSS required".
   */
  function resolveCvss(s) {
    const id = s.id || "Scenario", errors = [], warnings = [];
    const vec = blank(s.cvss) ? null : String(s.cvss).trim();
    let stored = s.cvss_score;
    if (blank(stored)) stored = null;
    else if (!isNum(stored)) { errors.push(id + ": CVSS score must be a number from 0.0 to 10.0 (got " + JSON.stringify(stored) + ")"); stored = null; }
    else if (stored < 0 || stored > 10) { errors.push(id + ": CVSS score must be a number from 0.0 to 10.0 (got " + stored + ")"); stored = null; }
    if (vec === null && stored === null) {
      if (!errors.length) errors.push(id + ": CVSS required — provide a CVSS v4.0 vector or score (a blank score is never 0)");
      return { score: null, source: null, errors, warnings };
    }
    if (vec !== null) {
      let computed;
      try { computed = scoreVector(vec); }
      catch (e) {
        const m = String(e.message || e);
        errors.push(m.startsWith("CVSS-B only") ? id + ": " + m + " (vector " + JSON.stringify(vec) + ")" : id + ": invalid CVSS v4.0 vector " + JSON.stringify(vec) + " (" + m + ")");
        return { score: null, source: null, errors, warnings };
      }
      if (stored !== null && Math.abs(stored - computed) > CVSS_TOLERANCE)
        warnings.push(id + ": stored CVSS score " + stored + " disagrees with its vector (" + computed + "); the vector's score " + computed + " is used — correct the stored score");
      return { score: computed, source: "vector", errors, warnings };
    }
    return { score: stored, source: "stored score (no vector)", errors, warnings };
  }

  /** The CVSS score the formula uses (the vector's when a vector is present). Throws on a missing or invalid CVSS. */
  function cvssOf(s) {
    const r = resolveCvss(s);
    if (r.errors.length) throw new Error(r.errors.join("; "));
    return r.score;
  }

  /** Recompute the score from the vector and compare it with a stored score (a flag, never a change). */
  function cvssCheck(s) {
    const stored = blank(s.cvss_score) || !isNum(s.cvss_score) ? null : Number(s.cvss_score);
    let computed = null;
    if (!blank(s.cvss)) { try { computed = scoreVector(s.cvss); } catch (e) { computed = null; } }
    const agree = stored === null || computed === null ? null : Math.abs(stored - computed) <= CVSS_TOLERANCE;
    return { stored, computed, agree };
  }

  /** The parameters of a scenario as plain values ({v} records unwrapped). */
  const paramsOf = s => { const p = {}; for (const k of PARAMS) p[k] = val((s.params || {})[k]); return p; };
  /** A reduction as the engine reads it: missing (undefined / null) is 0; anything else must be a number in [0, 1]. */
  const reductionOf = x => (x === undefined || x === null ? 0 : x);

  /** Validation of the inputs (decision 4): every rule, one message per problem. */
  function validate(s, appetite = DEFAULT_APPETITE, factor = DEFAULT_FACTOR) {
    const id = s.id || "Scenario", out = [];
    const p = paramsOf(s);
    for (const k of PARAMS) {
      if (blank(p[k])) { out.push(id + ": " + LABEL[k] + " required"); continue; }
      if (!isNum(p[k])) { out.push(id + ": " + LABEL[k] + " must be a number (got " + JSON.stringify(p[k]) + ")"); continue; }
      if (k === "Th") { if (!(p.Th > 0 && p.Th <= 1)) out.push(id + ": resilience θ must be in (0, 1]"); }
      else if (p[k] < 0 || p[k] > 1) out.push(id + ": " + LABEL[k] + " must be within 0–1");
    }
    if (isNum(p.De) && isNum(p.Dm) && p.Dm < p.De) out.push(id + ": δm must be at least δe");
    for (const k of ["red_p", "red_i"]) {
      const r = reductionOf(s[k]);
      if (!isNum(r)) out.push(id + ": " + k + " must be a number (got " + JSON.stringify(r) + ")");
      else if (r < 0 || r > 1) out.push(id + ": " + k + " must be within 0–1 (a reduction above 1 is invalid — combine several measures with 1 − ∏(1 − rᵢ), never by adding them)");
    }
    if (!(isNum(appetite) && appetite > 0 && appetite < 1)) out.push("Appetite must be strictly between 0 and 1");
    if (!(isNum(factor) && factor > 0)) out.push("The multiplication factor must be greater than 0");
    out.push(...resolveCvss(s).errors);
    return out;
  }

  /** Estimated, tolerated, mitigated, residual risk and ratios for one scenario (plus cvss_source and warnings). */
  function calc(s, appetite = DEFAULT_APPETITE, factor = DEFAULT_FACTOR) {
    const errs = validate(s, appetite, factor);
    if (errs.length) throw new Error(errs.join("; "));
    const p = paramsOf(s);
    const cv = resolveCvss(s), c = cv.score;
    const rp = reductionOf(s.red_p), ri = reductionOf(s.red_i);
    const base = p.PbA * p.Pbx * c * p.Mu / p.Th * factor;
    const est = base * (p.De + p.Dm) / 2;
    const tol = base * appetite;
    const mit = est * rp * ri;
    const res = Math.max(0, est - mit);        // guard: never negative (reductions are validated to 0–1)
    // zero tolerated risk: the ratios are NaN (null once serialized to JSON, as the reference engine's None) and the verdict
    // is "Not applicable (tolerated risk 0)"; a warning asks to confirm the zero is deliberate, never "Above tolerance"
    const warnings = cv.warnings.slice();
    let ratio = NaN, pre_ratio = NaN;
    if (tol) { ratio = res / tol; pre_ratio = est / tol; }
    else {
      const zero = ["PbA", "Pbx", "Mu"].filter(k => p[k] === 0).map(k => LABEL[k]).concat(c === 0 ? ["CVSS"] : []);
      warnings.push((s.id || "Scenario") + ": tolerated risk is 0 (" + zero.join(", ") + " = 0): the risk-to-tolerance ratio is not applicable — confirm the zero is deliberate (the scenario is then not a risk in the period) rather than a placeholder");
    }
    return { cvss: c, cvss_source: cv.source, est, tol, mit, res, ratio, pre_ratio, warnings };
  }

  /** Tolerance verdict; an undefined ratio (tolerated risk 0) is "Not applicable (tolerated risk 0)". */
  function classify(ratio) {
    if (!isNum(ratio)) return NOT_APPLICABLE;
    if (ratio < BAND_LOW) return "Below tolerance";
    if (ratio <= BAND_HIGH) return "Approximately at tolerance";
    return "Above tolerance";
  }

  /** Secondary cross-check: T × E × I × (1 − C), C proxied by resilience. */
  function caseNormalized(s) {
    const p = paramsOf(s);
    const cur = p.PbA * p.Pbx * (p.De + p.Dm) / 2 * (1 - p.Th);
    return [cur, cur * (1 - reductionOf(s.red_p) * reductionOf(s.red_i))];
  }

  /** Combined reduction of several measures on the same lever: 1 − ∏(1 − rᵢ) (decision 2, product rule). */
  function combine(rs) {
    let keep = 1;
    for (const r of rs || []) { if (!(isNum(r) && r >= 0 && r <= 1)) throw new Error("each reduction must be within 0–1 (got " + JSON.stringify(r) + ")"); keep *= 1 - r; }
    return 1 - keep;
  }

  /** Cost-effectiveness: risk units removed per $1,000 = (Re − Residual) ÷ cost × 1,000. */
  const costEffectiveness = (est, res, cost) => (isNum(cost) && cost > 0 ? (est - res) / cost * 1000 : null);

  /** Minimum rp × ri for residual ≤ tolerated (ratio ≤ 1.00) and for ratio < 0.90 (book v2.51 ch06 'What cancels'). */
  function designThresholds(de, dm, appetite) {
    const avg = (de + dm) / 2;
    if (!(avg > 0)) return { at_or_below_tolerated: null, below_band: null };
    return { at_or_below_tolerated: Math.max(0, 1 - appetite / avg), below_band: Math.max(0, 1 - BAND_LOW * appetite / avg) };
  }

  /**
   * Sensitivity case: raise threat, exploitation and damages by d; lower resilience and reductions by d (the higher
   * case), or the reverse (the lower case). The central case (d = 0) is never shifted and never clamped. A shifted
   * value is clamped to [0.05, 0.99] in the direction of the shift only: a case can never be milder than the central
   * case because of the clamp (a value already outside the clamp range stays where it is). δm ≥ δe is kept.
   */
  function shift(s, d) {
    const t = JSON.parse(JSON.stringify(s));
    const p = paramsOf(s);
    const rec = (k, v) => { t.params[k] = Object.assign({}, typeof s.params[k] === "object" && s.params[k] ? s.params[k] : {}, { v }); };
    const move = (x, m) => (m > 0 ? Math.max(x, Math.min(0.99, x + m)) : m < 0 ? Math.min(x, Math.max(0.05, x + m)) : x);
    for (const k of ["PbA", "Pbx", "De", "Dm"]) rec(k, move(p[k], d));
    rec("Th", move(p.Th, -d));
    rec("Mu", p.Mu);
    t.red_p = move(reductionOf(s.red_p), -d);
    t.red_i = move(reductionOf(s.red_i), -d);
    if (t.params.Dm.v < t.params.De.v) t.params.Dm.v = t.params.De.v;
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

  /** Appetite (0–1) → appetite-consistent cybersecurity budget as a share of total IT budget incl. salaries. */
  function budgetTarget(a) {
    const [[a0, t0], [a1, t1], [a2, t2]] = POINT_TARGETS;
    if (a <= a0) return t0;
    if (a <= a1) return t0 + (a - a0) / (a1 - a0) * (t1 - t0);
    if (a <= a2) return t1 + (a - a1) / (a2 - a1) * (t2 - t1);
    return t2;
  }

  /** Share of IT budget → implied appetite (inverse of budgetTarget); null below the 4% point target, where the
   *  funding implies an appetite above 0.70, outside the guideline. */
  function impliedAppetite(pct) {
    const [[a0, t0], [a1, t1], [a2, t2]] = POINT_TARGETS;
    if (pct >= t0) return a0;
    if (pct >= t1) return a0 + (t0 - pct) / (t0 - t1) * (a1 - a0);
    if (pct >= t2) return a1 + (t1 - pct) / (t1 - t2) * (a2 - a1);
    return null;
  }

  /** Position of a budget share relative to the three point targets (TI convention; not a pass/fail test). */
  function bandStatus(pct) {
    if (pct < BUDGET_BAND.min) return "Below the 4% point target (funding implies an appetite above 0.70, outside the guideline)";
    if (pct > BUDGET_BAND.max) return "Above the 12% point target (more than a risk-averse organization's best-practice target)";
    return "Between the 4% and 12% point targets";
  }

  /** Compare a budget share with the appetite-consistent point target (gap = share − target; negative = below). */
  function targetStatus(pct, appetite) {
    const t = budgetTarget(appetite), gap = pct - t;
    return { target_pct: t, gap_pct: gap, status: gap < 0 ? "Below the appetite-consistent target" : "At or above the appetite-consistent target" };
  }

  /** Step 18: spending (current + portfolio) against the appetite-consistent target. gap_amount = planned − target
   *  (negative = below target), as in the reference engine. Throws on invalid inputs. */
  function budgetPosition(appetite, itBudget, currentSpend = 0, portfolioCost = 0) {
    const errs = [];
    if (!(isNum(appetite) && appetite > 0 && appetite < 1)) errs.push("appetite must be strictly between 0 and 1");
    if (!(isNum(itBudget) && itBudget > 0)) errs.push("IT budget must be a positive amount");
    if (!(isNum(currentSpend) && currentSpend >= 0)) errs.push("current spending must be a non-negative amount");
    if (!(isNum(portfolioCost) && portfolioCost >= 0)) errs.push("portfolio cost must be a non-negative amount");
    if (errs.length) throw new Error(errs.join("; "));
    const t = budgetTarget(appetite), planned = currentSpend + portfolioCost, pct = planned / itBudget;
    return { appetite, target_pct: t, target_amount: t * itBudget, current_spend: currentSpend, portfolio_cost: portfolioCost, planned_total: planned, planned_pct: pct,
      gap_amount: planned - t * itBudget, gap_pct: pct - t, implied_appetite: impliedAppetite(pct), status: targetStatus(pct, appetite).status, position: bandStatus(pct) };
  }

  /** Every scenario of an assessment; results carry cls, the normalized cross-check and the collected warnings. */
  function run(data, appetite, factor) {
    appetite = appetite ?? data.APPETITE ?? DEFAULT_APPETITE;
    factor = factor ?? data.FACTOR ?? DEFAULT_FACTOR;
    const warnings = [];
    const results = data.SCEN.map(s => {
      const r = calc(s, appetite, factor);
      const [nc, np] = caseNormalized(s);
      for (const w of r.warnings) if (!warnings.includes(w)) warnings.push(w);
      return Object.assign({ id: s.id, name: s.name || "" }, r, { cls: classify(r.ratio), norm_cur: nc, norm_post: np });
    });
    return { appetite, factor, results, warnings,
      totals: { est: results.reduce((a, x) => a + x.est, 0), res: results.reduce((a, x) => a + x.res, 0) } };
  }

  const api = { calc, validate, cvssOf, cvssCheck, resolveCvss, combine, costEffectiveness, classify, caseNormalized, shift, sensitivity, designThresholds,
    budgetTarget, impliedAppetite, bandStatus, targetStatus, budgetPosition, run,
    BAND_LOW, BAND_HIGH, BUDGET_BAND, ANCHORS, POINT_TARGETS, CVSS_TOLERANCE, NOT_APPLICABLE, DEFAULT_APPETITE, DEFAULT_FACTOR, PARAMS };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.CRG = api;
})(typeof self !== "undefined" ? self : this);
