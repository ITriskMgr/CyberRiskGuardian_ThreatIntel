#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""CyberRiskGuardian calculation engine.

Implements the risk-index formulas of the CyberRiskGuardian Excel Guide v1.0c (s.11) without modification
(book v2.51, ch06 "The risk index and underlying formulas"), CVSS v4.0 base scoring (CVSS-B, via the `cvss`
package), tolerance classification, sensitivity shifts, cost-effectiveness, the case-style normalized
cross-check and the cybersecurity budget calibration rule (point targets 12% / 7.8% / 4%).

The computed values (estimated, tolerated, mitigated and residual risk, risk-to-tolerance ratio) are
*risk indices*, not KRIs. KRIs are measured monitoring indicators (step 19).

Input validation (decision 4 of CRG 1.8.0): Pb(A), Pb(psi,A), de, dm, mu(E), red_p, red_i in [0, 1];
theta in (0, 1]; appetite strictly in (0, 1); dm >= de; CVSS required and in 0-10 (a blank score is an
error, never 0). When a scenario carries both a vector and a stored score, the score is recomputed from
the vector, the vector's score is used, and a stored score that disagrees is flagged.

Usage:
    python3 crg_calc.py scenarios.json [--appetite 0.30] [--factor 1000] [--json]

The input JSON follows assets/scenario-template.json (keys: APPETITE, FACTOR, SCEN[...]).
Offline and deterministic: no network access.
"""
import argparse, copy, json, math, os, sys

BAND_LOW, BAND_HIGH = 0.90, 1.10          # "approximately at tolerance" band on the risk-to-tolerance ratio
# Best-practice budget point targets (% of total IT budget incl. salaries) by appetite, linear in between,
# clamped outside: 12% at appetite <= 0.30, 7.8% at 0.50, 4% at >= 0.70 (book v2.51 ch06 step 18, ch17).
POINT_TARGETS = ((0.30, 0.12), (0.50, 0.078), (0.70, 0.04))
BUDGET_BAND = {"min": 0.04, "median": 0.078, "max": 0.12}   # the three point targets (kept for compatibility)
ANCHORS = {"max": 0.30, "median": 0.50, "min": 0.70}        # appetite at each point target
CVSS_TOLERANCE = 0.05                     # a stored score differing from the vector's score by more is flagged

DEFAULT_APPETITE = float(os.environ.get("CRG_DEFAULT_APPETITE", "0.30"))
DEFAULT_FACTOR = float(os.environ.get("CRG_FACTOR", "1000"))

PARAM_NAMES = {"PbA": "Pb(A)", "Pbx": "Pb(psi,A)", "De": "de (expected damage)", "Dm": "dm (maximum damage)",
               "Th": "theta (resilience)", "Mu": "mu(E) (organizational criticality, expected utility)"}


class CRGInputError(ValueError):
    """Raised when inputs fail validation; .errors lists every problem found."""

    def __init__(self, errors):
        self.errors = list(errors)
        super().__init__("; ".join(self.errors))


def cvss4(vector):
    """Return (base score, severity) for a CVSS v4.0 vector string (CVSS-B)."""
    from cvss import CVSS4
    v = CVSS4(vector)
    return float(v.base_score), v.severities()[0]


def _num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and not math.isnan(x) and not math.isinf(x)


def _params(s):
    return {k: (v["v"] if isinstance(v, dict) else v) for k, v in (s.get("params") or {}).items()}


def validate_settings(appetite, factor):
    """Errors and warnings for the assessment-level settings."""
    errors, warnings = [], []
    if not _num(appetite) or not (0 < appetite < 1):
        errors.append(f"appetite must be strictly between 0 and 1 (got {appetite!r})")
    elif not (0.10 <= appetite <= 0.90):
        warnings.append(f"appetite {appetite:.2f} is outside 0.10-0.90, the range used in practice")
    if not _num(factor) or factor <= 0:
        errors.append(f"factor must be a positive number (got {factor!r})")
    elif factor != 1000:
        warnings.append(f"factor {factor:g} differs from the CRG constant 1,000 (it scales indices, never ratios)")
    return errors, warnings


def resolve_cvss(s):
    """Return (score, source, errors, warnings) for a scenario.

    The vector is authoritative: the score is recomputed from it and a disagreeing stored score is flagged.
    A scenario with neither a vector nor a score has no index ("CVSS required")."""
    sid = s.get("id", "?")
    errors, warnings = [], []
    vec = s.get("cvss")
    stored = s.get("cvss_score")
    if isinstance(vec, str) and not vec.strip():
        vec = None
    if stored is not None and not _num(stored):
        if isinstance(stored, str) and not stored.strip():
            stored = None
        else:
            errors.append(f"{sid}: CVSS score must be a number from 0 to 10 (got {stored!r})")
            stored = None
    if stored is not None and not (0 <= stored <= 10):
        errors.append(f"{sid}: CVSS score must be within 0-10 (got {stored})")
        stored = None
    if vec is None and stored is None:
        if not any(e.startswith(f"{sid}: CVSS") for e in errors):
            errors.append(f"{sid}: CVSS required (no vector and no score; a blank score is never 0)")
        return None, None, errors, warnings
    if vec is not None:
        try:
            computed = cvss4(vec)[0]
        except ImportError:
            if stored is None:
                errors.append(f"{sid}: the cvss package is needed to score the vector (pip install cvss)")
                return None, None, errors, warnings
            warnings.append(f"{sid}: vector not verified (cvss package missing); stored score {stored} used")
            return float(stored), "stored (unverified)", errors, warnings
        except Exception as e:  # invalid vector string
            errors.append(f"{sid}: invalid CVSS v4.0 vector {vec!r} ({e})")
            return None, None, errors, warnings
        if stored is not None and abs(stored - computed) > CVSS_TOLERANCE:
            warnings.append(f"{sid}: stored CVSS score {stored} disagrees with its vector ({computed}); "
                            f"the vector's score {computed} is used - correct the stored score")
        return computed, "vector", errors, warnings
    return float(stored), "stored score (no vector)", errors, warnings


def validate_scenario(s):
    """Errors and warnings for one scenario's parameters and reductions (CVSS excluded)."""
    sid = s.get("id", "?")
    errors, warnings = [], []
    p = _params(s)
    for k, label in PARAM_NAMES.items():
        if k not in p or p[k] is None or (isinstance(p[k], str) and not p[k].strip()):
            errors.append(f"{sid}: {label} required")
            continue
        v = p[k]
        if not _num(v):
            errors.append(f"{sid}: {label} must be a number (got {v!r})")
        elif k == "Th":
            if not (0 < v <= 1):
                errors.append(f"{sid}: {label} must be in (0, 1] (got {v})")
        elif not (0 <= v <= 1):
            errors.append(f"{sid}: {label} must be within 0-1 (got {v})")
    if _num(p.get("De")) and _num(p.get("Dm")) and p["Dm"] < p["De"]:
        errors.append(f"{sid}: dm ({p['Dm']}) must be at least de ({p['De']})")
    for k, label in (("red_p", "probability reduction"), ("red_i", "impact reduction")):
        v = s.get(k, 0.0)
        if v is None:
            v = 0.0
        if not _num(v):
            errors.append(f"{sid}: {label} ({k}) must be a number (got {v!r})")
        elif not (0 <= v <= 1):
            errors.append(f"{sid}: {label} ({k}) must be within 0-1 (got {v}); a reduction above 1 is invalid - "
                          "combine several measures with 1 - prod(1 - r_i), never by adding them")
    tr = s.get("transfer")
    if isinstance(tr, dict) and tr.get("share_covered") is not None:
        sc = tr["share_covered"]
        if not _num(sc) or not (0 <= sc <= 1):
            errors.append(f"{sid}: transfer share_covered must be within 0-1 (got {sc!r})")
    return errors, warnings


def combine_reductions(rs):
    """Package reduction from several measures on the same lever: 1 - prod(1 - r_i) (product rule)."""
    out = 1.0
    for r in rs:
        if not _num(r) or not (0 <= r <= 1):
            raise CRGInputError([f"each reduction coefficient must be within 0-1 (got {r!r})"])
        out *= (1 - r)
    return 1 - out


def cost_effectiveness(est, res, cost):
    """Risk units removed per $1,000: (Re - Residual) / cost x 1,000. None when no positive cost is given."""
    if not _num(cost) or cost <= 0:
        return None
    return (est - res) / cost * 1000


def calc(s, appetite=DEFAULT_APPETITE, factor=DEFAULT_FACTOR, cost=None):
    """Estimated, tolerated, mitigated, residual risk, ratios and cost-effectiveness for one scenario dict.

    Raises CRGInputError listing every invalid input. The result carries `warnings` (non-blocking flags such
    as a stored CVSS score that disagrees with its vector)."""
    errors, warnings = validate_settings(appetite, factor)
    e2, w2 = validate_scenario(s)
    c, src, e3, w3 = resolve_cvss(s)
    errors += e2 + e3
    warnings += w2 + w3
    if errors:
        raise CRGInputError(errors)
    p = _params(s)
    rp, ri = s.get("red_p") or 0.0, s.get("red_i") or 0.0
    base = p["PbA"] * p["Pbx"] * c * p["Mu"] / p["Th"] * factor
    est = base * (p["De"] + p["Dm"]) / 2
    tol = base * appetite
    mit = est * rp * ri
    res = max(0.0, est - mit)            # guard: never negative (reductions are validated to 0-1)
    if cost is None:
        cost = s.get("cost", s.get("cost_y1"))
    ratio = res / tol if tol else float("nan")
    pre = est / tol if tol else float("nan")
    return dict(cvss=c, cvss_source=src, est=est, tol=tol, mit=mit, res=res, ratio=ratio, pre_ratio=pre,
                ce=cost_effectiveness(est, res, cost), warnings=warnings)


def classify(ratio):
    if ratio < BAND_LOW:
        return "Below tolerance"
    if ratio <= BAND_HIGH:
        return "Approximately at tolerance"
    return "Above tolerance"


def design_thresholds(de, dm, appetite):
    """Minimum rp x ri for the residual to be no greater than tolerated (ratio <= 1.00) and for it to fall
    below the 0.90 band (rp x ri > 1 - 0.90 x appetite / average damage). Book v2.51 ch06 'What cancels'."""
    avg = (de + dm) / 2
    return {"at_or_below_tolerated": max(0.0, 1 - appetite / avg), "below_band": max(0.0, 1 - BAND_LOW * appetite / avg)}


def case_normalized(s):
    """Secondary cross-check: T x E x I x (1 - C), C proxied by resilience; post = cur x (1 - P x Q)."""
    p = _params(s)
    cur = p["PbA"] * p["Pbx"] * (p["De"] + p["Dm"]) / 2 * (1 - p["Th"])
    return cur, cur * (1 - (s.get("red_p") or 0) * (s.get("red_i") or 0))


def shift(s, d):
    """Sensitivity case: raise threat, exploitation and damages by d; lower resilience and reductions by d.
    Every shifted value is clamped to [0.05, 0.99]; mu(E) and CVSS are not shifted."""
    t = copy.deepcopy(s)
    clamp = lambda x: max(0.05, min(0.99, x))
    for k in ("PbA", "Pbx", "De", "Dm", "Th"):
        if not isinstance(t["params"][k], dict):
            t["params"][k] = {"v": t["params"][k]}
    for k in ("PbA", "Pbx", "De", "Dm"):
        t["params"][k]["v"] = clamp(t["params"][k]["v"] + d)
    t["params"]["Th"]["v"] = clamp(t["params"]["Th"]["v"] - d)
    t["red_p"] = clamp((t.get("red_p") or 0) - d)
    t["red_i"] = clamp((t.get("red_i") or 0) - d)
    if t["params"]["Dm"]["v"] < t["params"]["De"]["v"]:      # clamping can only tie them; keep dm >= de
        t["params"]["Dm"]["v"] = t["params"]["De"]["v"]
    return t


def budget_target(appetite):
    """Appetite (0-1) -> appetite-consistent cybersecurity budget as a share of total IT budget incl. salaries.
    Point targets 12% (0.30) / 7.8% (0.50) / 4% (0.70), linear interpolation, clamped outside."""
    (a0, t0), (a1, t1), (a2, t2) = POINT_TARGETS
    a = appetite
    if a <= a0:
        return t0
    if a <= a1:
        return t0 + (a - a0) / (a1 - a0) * (t1 - t0)
    if a <= a2:
        return t1 + (a - a1) / (a2 - a1) * (t2 - t1)
    return t2


def implied_appetite(pct):
    """Share of IT budget -> implied appetite (inverse of budget_target); None below the 4% point target,
    where the funding implies an appetite above 0.70, outside the guideline."""
    (a0, t0), (a1, t1), (a2, t2) = POINT_TARGETS
    if pct >= t0:
        return a0
    if pct >= t1:
        return a0 + (t0 - pct) / (t0 - t1) * (a1 - a0)
    if pct >= t2:
        return a1 + (t1 - pct) / (t1 - t2) * (a2 - a1)
    return None


def band_status(pct):
    """Position of a budget share relative to the three point targets (not a pass/fail test: compare with the
    appetite-consistent target with target_status)."""
    if pct < BUDGET_BAND["min"]:
        return "Below the 4% point target (funding implies an appetite above 0.70, outside the guideline)"
    if pct > BUDGET_BAND["max"]:
        return "Above the 12% point target (more than a risk-averse organization's best-practice target)"
    return "Between the 4% and 12% point targets"


def target_status(pct, appetite):
    """Compare a budget share with the appetite-consistent point target."""
    t = budget_target(appetite)
    gap = pct - t
    status = "Below the appetite-consistent target" if gap < 0 else "At or above the appetite-consistent target"
    return {"target_pct": t, "gap_pct": gap, "status": status}


def budget_position(appetite, it_budget, current_spend=0.0, portfolio_cost=0.0):
    """Step 18: existing cybersecurity spending plus the recommended portfolio against the appetite-consistent
    target. Returns target %, target amount, planned total and %, gap (amount, negative = below target) and the
    implied appetite. Book v2.51 ch06 'Calibrating the budget to risk appetite'."""
    errs = []
    if not _num(appetite) or not (0 < appetite < 1):
        errs.append(f"appetite must be strictly between 0 and 1 (got {appetite!r})")
    if not _num(it_budget) or it_budget <= 0:
        errs.append(f"IT budget must be a positive amount (got {it_budget!r})")
    for name, v in (("current spending", current_spend), ("portfolio cost", portfolio_cost)):
        if not _num(v) or v < 0:
            errs.append(f"{name} must be a non-negative amount (got {v!r})")
    if errs:
        raise CRGInputError(errs)
    t = budget_target(appetite)
    planned = current_spend + portfolio_cost
    pct = planned / it_budget
    return {"appetite": appetite, "target_pct": t, "target_amount": t * it_budget, "current_spend": current_spend,
            "portfolio_cost": portfolio_cost, "planned_total": planned, "planned_pct": pct,
            "gap_amount": planned - t * it_budget, "gap_pct": pct - t, "implied_appetite": implied_appetite(pct),
            "status": target_status(pct, appetite)["status"], "position": band_status(pct)}


def run(data, appetite=None, factor=None):
    """Compute every scenario. Raises CRGInputError with all validation errors found across the file."""
    appetite = appetite if appetite is not None else data.get("APPETITE", DEFAULT_APPETITE)
    factor = factor if factor is not None else data.get("FACTOR", DEFAULT_FACTOR)
    errors, warnings = validate_settings(appetite, factor)
    scen = data.get("SCEN") or []
    if not scen:
        errors.append("no scenarios (SCEN is empty)")
    ids = [s.get("id") for s in scen]
    dup = sorted({i for i in ids if ids.count(i) > 1 and i is not None})
    if dup:
        errors.append("duplicate scenario IDs: " + ", ".join(map(str, dup)))
    for s in scen:
        e, _ = validate_scenario(s)
        _, _, e2, _ = resolve_cvss(s)
        errors += e + e2
    if errors:
        raise CRGInputError(errors)
    out = []
    for s in scen:
        r = calc(s, appetite, factor)
        cur, post = case_normalized(s)
        warnings += r["warnings"]
        out.append(dict(id=s["id"], name=s.get("name", ""), **r, cls=classify(r["ratio"]), norm_cur=cur, norm_post=post))
    seen, uniq = set(), []
    for w in warnings:
        if w not in seen:
            seen.add(w); uniq.append(w)
    return dict(appetite=appetite, factor=factor, results=out, warnings=uniq,
                totals=dict(est=sum(x["est"] for x in out), res=sum(x["res"] for x in out)))


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("scenarios")
    ap.add_argument("--appetite", type=float)
    ap.add_argument("--factor", type=float)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    data = json.load(open(a.scenarios, encoding="utf-8"))
    try:
        r = run(data, a.appetite, a.factor)
    except CRGInputError as e:
        print("Input validation failed:", file=sys.stderr)
        for m in e.errors:
            print("  - " + m, file=sys.stderr)
        return 2
    if a.json:
        json.dump(r, sys.stdout, indent=1); print()
        return 0
    print(f"Appetite {r['appetite']:.2f}  Factor {r['factor']:,.0f}")
    print(f"{'ID':5}{'CVSS':>6}{'Estimated':>11}{'Tolerated':>11}{'Residual':>10}{'Ratio':>7}{'CE/$1k':>8}  Status")
    for x in r["results"]:
        ce = "" if x["ce"] is None else f"{x['ce']:8.2f}"
        print(f"{x['id']:5}{x['cvss']:6.1f}{x['est']:11,.0f}{x['tol']:11,.0f}{x['res']:10,.0f}{x['ratio']:7.2f}{ce:>8}  {x['cls']}")
    t = r["totals"]
    print("Ratio = risk-to-tolerance ratio (residual / tolerated); CE = risk units removed per $1,000.")
    print(f"Total estimated {t['est']:,.0f}  residual {t['res']:,.0f}  reduction {1 - t['res'] / t['est']:.0%}")
    for w in r["warnings"]:
        print("Warning: " + w)
    return 0


if __name__ == "__main__":
    sys.exit(main())
