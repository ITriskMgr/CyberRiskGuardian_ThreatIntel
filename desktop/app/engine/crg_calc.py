#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""CyberRiskGuardian calculation engine.

Implements the risk-index formulas of the CyberRiskGuardian Excel Guide v1.0c (s.11) without modification,
CVSS v4.0 base scoring (via the `cvss` package), tolerance classification, sensitivity shifts,
the case-style normalized cross-check and the cybersecurity budget calibration rule.
Inputs are validated (1.8.0): 0-1 ranges, θ in (0, 1], appetite in (0, 1), δm ≥ δe, CVSS required.

Usage:
    python3 crg_calc.py scenarios.json [--appetite 0.30] [--factor 1000] [--json]

The input JSON follows assets/scenario-template.json (keys: APPETITE, FACTOR, SCEN[...]).
"""
import argparse, copy, json, os, sys

BAND_LOW, BAND_HIGH = 0.90, 1.10          # "approximately at tolerance" band on Residual/Tolerated
BUDGET_BAND = {"min": 0.04, "median": 0.078, "max": 0.12}   # % of total IT budget incl. salaries
ANCHORS = {"max": 0.30, "median": 0.50, "min": 0.70}        # appetite anchors for the band

DEFAULT_APPETITE = float(os.environ.get("CRG_DEFAULT_APPETITE", "0.30"))
DEFAULT_FACTOR = float(os.environ.get("CRG_FACTOR", "1000"))


def cvss4(vector):
    """Return (base score, severity) for a CVSS v4.0 vector string."""
    from cvss import CVSS4
    v = CVSS4(vector)
    return float(v.base_score), v.severities()[0]


LABEL = {"PbA": "Pb(A)", "Pbx": "Pb(ψ,A)", "De": "δe", "Dm": "δm", "Th": "θ", "Mu": "μ(E)"}


def _blank(x):
    return x is None or (isinstance(x, str) and not x.strip())


def _num(x):
    try:
        v = float(x)
    except (TypeError, ValueError):
        return float("nan")
    return v


def cvss_of(s):
    """The CVSS score the formula uses: the stored score, else the score of the vector.
    Blank is an error ("CVSS required"), never 0; a score outside 0-10 is an error."""
    sid = s.get("id") or "Scenario"
    if not _blank(s.get("cvss_score")):
        c = _num(s.get("cvss_score"))
        if not (0 <= c <= 10):
            raise ValueError(f"{sid}: CVSS score must be a number from 0.0 to 10.0")
        return c
    if not _blank(s.get("cvss")):
        return cvss4(str(s["cvss"]).strip())[0]
    raise ValueError(f"{sid}: CVSS required - provide a CVSS v4.0 vector or score")


def cvss_check(s):
    """Recompute the score from the vector and compare it with a stored score (a flag, never a change)."""
    stored = None if _blank(s.get("cvss_score")) else _num(s.get("cvss_score"))
    computed = None
    if not _blank(s.get("cvss")):
        try:
            computed = cvss4(str(s["cvss"]).strip())[0]
        except Exception:                                   # noqa: BLE001
            computed = None
    agree = None if stored is None or computed is None else abs(stored - computed) < 0.05
    return {"stored": stored, "computed": computed, "agree": agree}


def validate(s, appetite=DEFAULT_APPETITE, factor=DEFAULT_FACTOR):
    """Every input rule (decision 4); returns the list of problems, empty when the scenario is valid."""
    sid = s.get("id") or "Scenario"
    out = []
    p = {}
    for k in ("PbA", "Pbx", "De", "Dm", "Th", "Mu"):
        v = (s.get("params") or {}).get(k)
        v = v.get("v") if isinstance(v, dict) else v
        p[k] = float("nan") if _blank(v) else _num(v)
    for k in ("PbA", "Pbx", "De", "Dm", "Mu"):
        if not (0 <= p[k] <= 1):
            out.append(f"{sid}: {LABEL[k]} must be within 0-1")
    if not (0 < p["Th"] <= 1):
        out.append(f"{sid}: resilience θ must be in (0, 1]")
    if p["De"] == p["De"] and p["Dm"] == p["Dm"] and p["Dm"] < p["De"]:
        out.append(f"{sid}: δm must be at least δe")
    for k in ("red_p", "red_i"):
        r = float("nan") if _blank(s.get(k)) else _num(s.get(k))
        if not (0 <= r <= 1):
            out.append(f"{sid}: {k} must be within 0-1 (a reduction above 1 is invalid)")
    a = _num(appetite)
    if not (0 < a < 1):
        out.append("Appetite must be strictly between 0 and 1")
    if not (_num(factor) > 0):
        out.append("The multiplication factor must be greater than 0")
    try:
        cvss_of(s)
    except Exception as exc:                                # noqa: BLE001
        out.append(str(exc))
    return out


def combine(reductions):
    """Combined reduction of several measures on the same lever: 1 - prod(1 - r_i) (product rule)."""
    keep = 1.0
    for r in reductions:
        r = _num(r)
        if not (0 <= r <= 1):
            raise ValueError("each reduction must be within 0-1")
        keep *= 1 - r
    return 1 - keep


def cost_effectiveness(est, res, cost):
    """Risk units removed per $1,000: (Re - Residual) / cost x 1,000."""
    return (est - res) / cost * 1000 if cost and cost > 0 else None


def calc(s, appetite=DEFAULT_APPETITE, factor=DEFAULT_FACTOR):
    """Estimated, tolerated, mitigated, residual risk and ratios for one scenario dict."""
    errs = validate(s, appetite, factor)
    if errs:
        raise ValueError("; ".join(errs))
    p = {k: float(v["v"] if isinstance(v, dict) else v) for k, v in s["params"].items()}
    c = cvss_of(s)
    rp, ri = float(s["red_p"]), float(s["red_i"])
    base = p["PbA"] * p["Pbx"] * c * p["Mu"] / p["Th"] * factor
    est = base * (p["De"] + p["Dm"]) / 2
    tol = base * appetite
    mit = est * rp * ri
    res = est - mit
    return dict(cvss=c, est=est, tol=tol, mit=mit, res=res, ratio=res / tol, pre_ratio=est / tol)


def classify(ratio):
    if ratio < BAND_LOW:
        return "Below tolerance"
    if ratio <= BAND_HIGH:
        return "Approximately at tolerance"
    return "Above tolerance"


def case_normalized(s):
    """Secondary cross-check: T x E x I x (1 - C), C proxied by resilience; post = cur x (1 - P x Q)."""
    p = {k: v["v"] if isinstance(v, dict) else v for k, v in s["params"].items()}
    cur = p["PbA"] * p["Pbx"] * (p["De"] + p["Dm"]) / 2 * (1 - p["Th"])
    return cur, cur * (1 - s["red_p"] * s["red_i"])


def shift(s, d):
    """Sensitivity case: raise threat, exploitation and damages by d; lower resilience and reductions by d."""
    t = copy.deepcopy(s)
    clamp = lambda x: max(0.05, min(0.99, x))
    for k in ("PbA", "Pbx", "De", "Dm"):
        t["params"][k]["v"] = clamp(t["params"][k]["v"] + d)
    t["params"]["Th"]["v"] = clamp(t["params"]["Th"]["v"] - d)
    t["red_p"] = clamp(t["red_p"] - d)
    t["red_i"] = clamp(t["red_i"] - d)
    return t


def budget_target(appetite):
    """Appetite (0-1) -> appetite-consistent cybersecurity budget as % of total IT budget."""
    a, B, A = appetite, BUDGET_BAND, ANCHORS
    if a <= A["max"]:
        return B["max"]
    if a <= A["median"]:
        return B["max"] + (a - A["max"]) / (A["median"] - A["max"]) * (B["median"] - B["max"])
    if a <= A["min"]:
        return B["median"] + (a - A["median"]) / (A["min"] - A["median"]) * (B["min"] - B["median"])
    return B["min"]


def implied_appetite(pct):
    """% of IT budget -> implied appetite; None if below the 4% floor."""
    B, A = BUDGET_BAND, ANCHORS
    if pct >= B["max"]:
        return A["max"]
    if pct >= B["median"]:
        return A["max"] + (B["max"] - pct) / (B["max"] - B["median"]) * (A["median"] - A["max"])
    if pct >= B["min"]:
        return A["median"] + (B["median"] - pct) / (B["median"] - B["min"]) * (A["min"] - A["median"])
    return None


def band_status(pct):
    if pct < BUDGET_BAND["min"]:
        return "Below floor (risk seeking beyond guideline)"
    if pct > BUDGET_BAND["max"]:
        return "Above ceiling"
    return "Within band"


def run(data, appetite=None, factor=None):
    appetite = appetite if appetite is not None else data.get("APPETITE", DEFAULT_APPETITE)
    factor = factor if factor is not None else data.get("FACTOR", DEFAULT_FACTOR)
    out = []
    for s in data["SCEN"]:
        r = calc(s, appetite, factor)
        cur, post = case_normalized(s)
        out.append(dict(id=s["id"], name=s.get("name", ""), **r, cls=classify(r["ratio"]), norm_cur=cur, norm_post=post))
    return dict(appetite=appetite, factor=factor, results=out,
                totals=dict(est=sum(x["est"] for x in out), res=sum(x["res"] for x in out)))


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("scenarios")
    ap.add_argument("--appetite", type=float)
    ap.add_argument("--factor", type=float)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    data = json.load(open(a.scenarios, encoding="utf-8"))
    r = run(data, a.appetite, a.factor)
    if a.json:
        json.dump(r, sys.stdout, indent=1); sys.exit(0)
    print(f"Appetite {r['appetite']:.2f}  Factor {r['factor']:,.0f}")
    print(f"{'ID':5}{'CVSS':>6}{'Estimated':>11}{'Tolerated':>11}{'Residual':>10}{'Res/Tol':>9}  Status")
    for x in r["results"]:
        print(f"{x['id']:5}{x['cvss']:6.1f}{x['est']:11,.0f}{x['tol']:11,.0f}{x['res']:10,.0f}{x['ratio']:9.2f}  {x['cls']}")
    t = r["totals"]
    print(f"Total estimated {t['est']:,.0f}  residual {t['res']:,.0f}  reduction {1 - t['res'] / t['est']:.0%}")
