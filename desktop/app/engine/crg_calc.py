#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""CyberRiskGuardian calculation engine (desktop copy).

Implements the risk-index formulas of the CyberRiskGuardian Excel Guide v1.0c (s.11) without modification,
CVSS v4.0 base scoring (CVSS-B, via the `cvss` package), tolerance classification, sensitivity shifts,
the case-style normalized cross-check and the cybersecurity budget calibration rule. It mirrors the reference
engine (plugins/cyberriskguardian-threatintel/.../scripts/crg_calc.py) and the browser engine (crg.js).

Input validation (1.8.0): 0-1 ranges, θ in (0, 1], appetite in (0, 1), δm ≥ δe, CVSS required.
One rule for every engine: a value must be a number (a numeric string or a boolean is rejected); a missing
reduction (red_p / red_i absent or None) is 0; a blank CVSS is never 0.
CVSS precedence: the vector wins — its score is recomputed and used; a stored score that disagrees is flagged
(result["warnings"]), never corrected silently. Only CVSS v4.0 Base metrics are accepted (CVSS-B): a vector
carrying Threat (E), Environmental (CR/IR/AR, M*) or Supplemental metrics is rejected; exploitation evidence
belongs in Pb(ψ,A).
Zero tolerated risk (Pb(A), Pb(ψ,A), μ(E) or CVSS at 0): the ratios are nan and the scenario is classified
"Not applicable (tolerated risk 0)".

Usage:
    python3 crg_calc.py scenarios.json [--appetite 0.30] [--factor 1000] [--json]

The input JSON follows assets/scenario-template.json (keys: APPETITE, FACTOR, SCEN[...]).
Offline and deterministic: no network access.
"""
import argparse, copy, json, math, os, sys

BAND_LOW, BAND_HIGH = 0.90, 1.10          # "approximately at tolerance" band on Residual/Tolerated
POINT_TARGETS = ((0.30, 0.12), (0.50, 0.078), (0.70, 0.04))   # best-practice budget point targets by appetite
BUDGET_BAND = {"min": 0.04, "median": 0.078, "max": 0.12}   # the three point targets (kept for compatibility)
ANCHORS = {"max": 0.30, "median": 0.50, "min": 0.70}        # appetite at each point target
CVSS_TOLERANCE = 0.05                     # a stored score differing from the vector's score by more is flagged
NOT_APPLICABLE = "Not applicable (tolerated risk 0)"

DEFAULT_APPETITE = float(os.environ.get("CRG_DEFAULT_APPETITE", "0.30"))
DEFAULT_FACTOR = float(os.environ.get("CRG_FACTOR", "1000"))

LABEL = {"PbA": "Pb(A)", "Pbx": "Pb(ψ,A)", "De": "δe", "Dm": "δm", "Th": "θ", "Mu": "μ(E)"}
PARAMS = ("PbA", "Pbx", "De", "Dm", "Th", "Mu")

# CVSS v4.0 Base metrics (CVSS-B). Anything else in a vector is refused: Threat (E), Environmental (CR, IR, AR,
# MAV, MAC, …), Supplemental (S, AU, R, V, RE, U).
BASE_METRICS = ("AV", "AC", "AT", "PR", "UI", "VC", "VI", "VA", "SC", "SI", "SA")


class CRGInputError(ValueError):
    """Raised when inputs fail validation; .errors lists every problem found."""

    def __init__(self, errors):
        self.errors = list(errors)
        super().__init__("; ".join(self.errors))


def check_base_vector(vector):
    """Raise ValueError unless the vector carries CVSS v4.0 Base metrics only (every mandatory metric, no other)."""
    v = str(vector).strip()
    if not v.startswith("CVSS:4.0/"):
        raise ValueError('vector must start with "CVSS:4.0/"')
    keys = []
    for f in v.split("/")[1:]:
        if ":" not in f:
            raise ValueError(f'malformed field "{f}"')
        k = f.split(":", 1)[0]
        if k not in BASE_METRICS:
            raise ValueError(f'only CVSS v4.0 Base metrics are accepted (CVSS-B); "{k}" is not a Base metric '
                             "- route exploitation evidence to Pb(ψ,A)")
        keys.append(k)
    missing = [k for k in BASE_METRICS if k not in keys]
    if missing:
        raise ValueError("missing mandatory metrics: " + ", ".join(missing))
    return v


def cvss4(vector):
    """Return (base score, severity) for a CVSS v4.0 Base vector string (CVSS-B only)."""
    from cvss import CVSS4
    v = CVSS4(check_base_vector(vector))
    return float(v.base_score), v.severities()[0]


def _blank(x):
    return x is None or (isinstance(x, str) and not x.strip())


def _num(x):
    """A number proper: not a bool, not a numeric string, finite."""
    return isinstance(x, (int, float)) and not isinstance(x, bool) and not math.isnan(x) and not math.isinf(x)


def _params(s):
    return {k: (v["v"] if isinstance(v, dict) else v) for k, v in (s.get("params") or {}).items()}


def _red(s, k):
    """A reduction as the engine reads it: missing (absent or None) is 0."""
    v = s.get(k)
    return 0.0 if v is None else v


def resolve_cvss(s):
    """Return (score, source, errors, warnings). The vector is authoritative: its score is recomputed and used,
    and a stored score that disagrees is flagged. Neither a vector nor a score → "CVSS required"."""
    sid = s.get("id") or "Scenario"
    errors, warnings = [], []
    vec = s.get("cvss")
    vec = None if _blank(vec) else str(vec).strip()
    stored = s.get("cvss_score")
    if _blank(stored):
        stored = None
    elif not _num(stored):
        errors.append(f"{sid}: CVSS score must be a number from 0.0 to 10.0 (got {stored!r})")
        stored = None
    elif not (0 <= stored <= 10):
        errors.append(f"{sid}: CVSS score must be a number from 0.0 to 10.0 (got {stored})")
        stored = None
    if vec is None and stored is None:
        if not errors:
            errors.append(f"{sid}: CVSS required - provide a CVSS v4.0 vector or score (a blank score is never 0)")
        return None, None, errors, warnings
    if vec is not None:
        try:
            computed = cvss4(vec)[0]
        except ImportError:
            errors.append(f"{sid}: the cvss package is needed to score the vector (pip install cvss)")
            return None, None, errors, warnings
        except Exception as e:                              # noqa: BLE001 — invalid vector string
            errors.append(f"{sid}: invalid CVSS v4.0 vector {vec!r} ({e})")
            return None, None, errors, warnings
        if stored is not None and abs(stored - computed) > CVSS_TOLERANCE:
            warnings.append(f"{sid}: stored CVSS score {stored} disagrees with its vector ({computed}); "
                            f"the vector's score {computed} is used - correct the stored score")
        return computed, "vector", errors, warnings
    return float(stored), "stored score (no vector)", errors, warnings


def cvss_of(s):
    """The CVSS score the formula uses (the vector's when a vector is present). Raises on a missing or invalid CVSS."""
    score, _, errors, _ = resolve_cvss(s)
    if errors:
        raise CRGInputError(errors)
    return score


def cvss_check(s):
    """Recompute the score from the vector and compare it with a stored score (a flag, never a change)."""
    st = s.get("cvss_score")
    stored = None if _blank(st) or not _num(st) else float(st)
    computed = None
    if not _blank(s.get("cvss")):
        try:
            computed = cvss4(str(s["cvss"]).strip())[0]
        except Exception:                                   # noqa: BLE001
            computed = None
    agree = None if stored is None or computed is None else abs(stored - computed) <= CVSS_TOLERANCE
    return {"stored": stored, "computed": computed, "agree": agree}


def validate(s, appetite=DEFAULT_APPETITE, factor=DEFAULT_FACTOR):
    """Every input rule (decision 4); returns the list of problems, empty when the scenario is valid."""
    sid = s.get("id") or "Scenario"
    out = []
    p = _params(s)
    for k in PARAMS:
        v = p.get(k)
        if _blank(v):
            out.append(f"{sid}: {LABEL[k]} required")
            continue
        if not _num(v):
            out.append(f"{sid}: {LABEL[k]} must be a number (got {v!r})")
            continue
        if k == "Th":
            if not (0 < v <= 1):
                out.append(f"{sid}: resilience θ must be in (0, 1]")
        elif not (0 <= v <= 1):
            out.append(f"{sid}: {LABEL[k]} must be within 0-1")
    if _num(p.get("De")) and _num(p.get("Dm")) and p["Dm"] < p["De"]:
        out.append(f"{sid}: δm must be at least δe")
    for k in ("red_p", "red_i"):
        r = _red(s, k)
        if not _num(r):
            out.append(f"{sid}: {k} must be a number (got {r!r})")
        elif not (0 <= r <= 1):
            out.append(f"{sid}: {k} must be within 0-1 (a reduction above 1 is invalid - combine several measures "
                       "with 1 - prod(1 - r_i), never by adding them)")
    if not (_num(appetite) and 0 < appetite < 1):
        out.append("Appetite must be strictly between 0 and 1")
    if not (_num(factor) and factor > 0):
        out.append("The multiplication factor must be greater than 0")
    out += resolve_cvss(s)[2]
    return out


def combine(reductions):
    """Combined reduction of several measures on the same lever: 1 - prod(1 - r_i) (product rule)."""
    keep = 1.0
    for r in reductions:
        if not (_num(r) and 0 <= r <= 1):
            raise CRGInputError([f"each reduction must be within 0-1 (got {r!r})"])
        keep *= 1 - r
    return 1 - keep


def cost_effectiveness(est, res, cost):
    """Risk units removed per $1,000: (Re - Residual) / cost x 1,000. None when no positive cost is given."""
    return (est - res) / cost * 1000 if _num(cost) and cost > 0 else None


def calc(s, appetite=DEFAULT_APPETITE, factor=DEFAULT_FACTOR):
    """Estimated, tolerated, mitigated, residual risk and ratios for one scenario dict (plus cvss_source, warnings).
    Raises CRGInputError (a ValueError) listing every invalid input."""
    errs = validate(s, appetite, factor)
    if errs:
        raise CRGInputError(errs)
    p = _params(s)
    c, src, _, warnings = resolve_cvss(s)
    rp, ri = float(_red(s, "red_p")), float(_red(s, "red_i"))
    base = p["PbA"] * p["Pbx"] * c * p["Mu"] / p["Th"] * factor
    est = base * (p["De"] + p["Dm"]) / 2
    tol = base * appetite
    mit = est * rp * ri
    res = max(0.0, est - mit)             # guard: never negative (reductions are validated to 0-1)
    ratio = res / tol if tol else float("nan")
    pre = est / tol if tol else float("nan")
    return dict(cvss=c, cvss_source=src, est=est, tol=tol, mit=mit, res=res, ratio=ratio, pre_ratio=pre, warnings=warnings)


def classify(ratio):
    """Tolerance verdict; an undefined ratio (tolerated risk 0) is "Not applicable (tolerated risk 0)"."""
    if not _num(ratio):
        return NOT_APPLICABLE
    if ratio < BAND_LOW:
        return "Below tolerance"
    if ratio <= BAND_HIGH:
        return "Approximately at tolerance"
    return "Above tolerance"


def design_thresholds(de, dm, appetite):
    """Minimum rp x ri for residual <= tolerated (ratio <= 1.00) and for ratio < 0.90 (book v2.51 ch06 'What cancels').
    None when the average damage is 0."""
    avg = (de + dm) / 2
    if not avg > 0:
        return {"at_or_below_tolerated": None, "below_band": None}
    return {"at_or_below_tolerated": max(0.0, 1 - appetite / avg), "below_band": max(0.0, 1 - BAND_LOW * appetite / avg)}


def case_normalized(s):
    """Secondary cross-check: T x E x I x (1 - C), C proxied by resilience; post = cur x (1 - P x Q)."""
    p = _params(s)
    cur = p["PbA"] * p["Pbx"] * (p["De"] + p["Dm"]) / 2 * (1 - p["Th"])
    return cur, cur * (1 - _red(s, "red_p") * _red(s, "red_i"))


def _move(x, m):
    """Shift x by m, clamped to [0.05, 0.99] in the direction of the shift only (never milder than x)."""
    if m > 0:
        return max(x, min(0.99, x + m))
    if m < 0:
        return min(x, max(0.05, x + m))
    return x


def shift(s, d):
    """Sensitivity case: raise threat, exploitation and damages by d; lower resilience and reductions by d.
    The central case (d = 0) is never shifted and never clamped; a shifted value is clamped in the direction of
    the shift only, so a case is never milder than the central case because of the clamp. δm ≥ δe is kept."""
    t = copy.deepcopy(s)
    p = _params(s)
    for k in PARAMS:
        if not isinstance(t["params"].get(k), dict):
            t["params"][k] = {"v": p[k]}
    for k in ("PbA", "Pbx", "De", "Dm"):
        t["params"][k]["v"] = _move(p[k], d)
    t["params"]["Th"]["v"] = _move(p["Th"], -d)
    t["red_p"] = _move(_red(s, "red_p"), -d)
    t["red_i"] = _move(_red(s, "red_i"), -d)
    if t["params"]["Dm"]["v"] < t["params"]["De"]["v"]:
        t["params"]["Dm"]["v"] = t["params"]["De"]["v"]
    return t


def sensitivity(s, delta=0.10, appetite=DEFAULT_APPETITE, factor=DEFAULT_FACTOR):
    out = {}
    for lab, d in (("lower", -delta), ("central", 0), ("higher", delta)):
        r = calc(shift(s, d), appetite, factor)
        out[lab] = dict(estimated=r["est"], residual=r["res"], ratio=r["ratio"], classification=classify(r["ratio"]))
    out["robust"] = out["lower"]["classification"] == out["higher"]["classification"]
    return out


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
    """Share of IT budget -> implied appetite; None below the 4% point target (funding implies an appetite above
    0.70, outside the guideline)."""
    (a0, t0), (a1, t1), (a2, t2) = POINT_TARGETS
    if pct >= t0:
        return a0
    if pct >= t1:
        return a0 + (t0 - pct) / (t0 - t1) * (a1 - a0)
    if pct >= t2:
        return a1 + (t1 - pct) / (t1 - t2) * (a2 - a1)
    return None


def band_status(pct):
    """Position of a budget share relative to the three point targets (not a pass/fail test)."""
    if pct < BUDGET_BAND["min"]:
        return "Below the 4% point target (funding implies an appetite above 0.70, outside the guideline)"
    if pct > BUDGET_BAND["max"]:
        return "Above the 12% point target (more than a risk-averse organization's best-practice target)"
    return "Between the 4% and 12% point targets"


def target_status(pct, appetite):
    """Compare a budget share with the appetite-consistent point target (gap = share - target; negative = below)."""
    t = budget_target(appetite)
    gap = pct - t
    status = "Below the appetite-consistent target" if gap < 0 else "At or above the appetite-consistent target"
    return {"target_pct": t, "gap_pct": gap, "status": status}


def budget_position(appetite, it_budget, current_spend=0.0, portfolio_cost=0.0):
    """Step 18: spending (current + portfolio) against the appetite-consistent target. gap_amount = planned - target
    (negative = below target)."""
    errs = []
    if not (_num(appetite) and 0 < appetite < 1):
        errs.append(f"appetite must be strictly between 0 and 1 (got {appetite!r})")
    if not (_num(it_budget) and it_budget > 0):
        errs.append(f"IT budget must be a positive amount (got {it_budget!r})")
    for name, v in (("current spending", current_spend), ("portfolio cost", portfolio_cost)):
        if not (_num(v) and v >= 0):
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
    """Compute every scenario; results carry cls, the normalized cross-check and the collected warnings."""
    appetite = appetite if appetite is not None else data.get("APPETITE", DEFAULT_APPETITE)
    factor = factor if factor is not None else data.get("FACTOR", DEFAULT_FACTOR)
    out, warnings = [], []
    for s in data["SCEN"]:
        r = calc(s, appetite, factor)
        cur, post = case_normalized(s)
        for w in r["warnings"]:
            if w not in warnings:
                warnings.append(w)
        out.append(dict(id=s["id"], name=s.get("name", ""), **r, cls=classify(r["ratio"]), norm_cur=cur, norm_post=post))
    return dict(appetite=appetite, factor=factor, results=out, warnings=warnings,
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
    print(f"{'ID':5}{'CVSS':>6}{'Estimated':>11}{'Tolerated':>11}{'Residual':>10}{'Res/Tol':>9}  Status")
    for x in r["results"]:
        ratio = f"{x['ratio']:9.2f}" if _num(x["ratio"]) else f"{'n/a':>9}"
        print(f"{x['id']:5}{x['cvss']:6.1f}{x['est']:11,.0f}{x['tol']:11,.0f}{x['res']:10,.0f}{ratio}  {x['cls']}")
    t = r["totals"]
    red = f"  reduction {1 - t['res'] / t['est']:.0%}" if t["est"] else ""
    print(f"Total estimated {t['est']:,.0f}  residual {t['res']:,.0f}{red}")
    for w in r["warnings"]:
        print("Warning: " + w)
    return 0


if __name__ == "__main__":
    sys.exit(main())
