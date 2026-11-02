#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""ssvc.py - SSVC decision trees beside EPSS and KEV (CyberRiskGuardian 1.9.0).

Deterministic, offline. Walks one of three published SSVC trees to its outcome and suggests the
Exploitation value from a LOCAL threat-context snapshot. The same tables ship in the desktop app
(desktop/app/js/data/ssvc-tables.js); both are copied row for row from the CERT/CC SSVC repository,
https://github.com/CERTCC/SSVC commit bf3213bc0bd2bf3cf1329c9b48f72d7163a682b1:
  deployer       data/csv/cisa/cisa_coordinator_2_0_3.csv                    Track / Track* / Attend / Act
  deployer-cert  data/csv/ssvc/deployer_patch_application_priority_1_0_0.csv  Defer / Scheduled / Out-of-Cycle / Immediate
  supplier       data/csv/ssvc/supplier_patch_development_priority_1_0_0.csv  Defer / Scheduled / Out-of-Cycle / Immediate
CHECK: Mission & Well-being for Mission Prevalence minimal + Public Well-Being material = medium comes from
CISA's SSVC Guide (Nov 2022) table, not from a published CSV (author to verify).

Rules: EPSS and KEV are evidence for the Exploitation decision point, never a likelihood; an SSVC outcome
is a response priority and is never converted into Pb(A) or Pb(psi,A).

Usage
  python3 ssvc.py --tree deployer exploitation=active automatable=yes technical_impact=total \
                  mission_prevalence=support public_wellbeing=minimal
  python3 ssvc.py --snapshot threat-context-2026-11-01.json --suggest CVE-2026-1234
"""
import argparse, json, sys

CISA_ROWS = [
    ('none', 'no', 'partial', 'low', 'track'),
    ('none', 'no', 'partial', 'medium', 'track'),
    ('none', 'no', 'partial', 'high', 'track'),
    ('none', 'no', 'total', 'low', 'track'),
    ('none', 'no', 'total', 'medium', 'track'),
    ('none', 'no', 'total', 'high', 'track*'),
    ('none', 'yes', 'partial', 'low', 'track'),
    ('none', 'yes', 'partial', 'medium', 'track'),
    ('none', 'yes', 'partial', 'high', 'attend'),
    ('none', 'yes', 'total', 'low', 'track'),
    ('none', 'yes', 'total', 'medium', 'track'),
    ('none', 'yes', 'total', 'high', 'attend'),
    ('public poc', 'no', 'partial', 'low', 'track'),
    ('public poc', 'no', 'partial', 'medium', 'track'),
    ('public poc', 'no', 'partial', 'high', 'track*'),
    ('public poc', 'no', 'total', 'low', 'track'),
    ('public poc', 'no', 'total', 'medium', 'track*'),
    ('public poc', 'no', 'total', 'high', 'attend'),
    ('public poc', 'yes', 'partial', 'low', 'track'),
    ('public poc', 'yes', 'partial', 'medium', 'track'),
    ('public poc', 'yes', 'partial', 'high', 'attend'),
    ('public poc', 'yes', 'total', 'low', 'track'),
    ('public poc', 'yes', 'total', 'medium', 'track*'),
    ('public poc', 'yes', 'total', 'high', 'attend'),
    ('active', 'no', 'partial', 'low', 'track'),
    ('active', 'no', 'partial', 'medium', 'track'),
    ('active', 'no', 'partial', 'high', 'attend'),
    ('active', 'no', 'total', 'low', 'track'),
    ('active', 'no', 'total', 'medium', 'attend'),
    ('active', 'no', 'total', 'high', 'act'),
    ('active', 'yes', 'partial', 'low', 'attend'),
    ('active', 'yes', 'partial', 'medium', 'attend'),
    ('active', 'yes', 'partial', 'high', 'act'),
    ('active', 'yes', 'total', 'low', 'attend'),
    ('active', 'yes', 'total', 'medium', 'act'),
    ('active', 'yes', 'total', 'high', 'act'),
]
DEPLOYER_ROWS = [
    ('none', 'small', 'no', 'low', 'defer'),
    ('none', 'small', 'no', 'medium', 'defer'),
    ('none', 'small', 'no', 'high', 'scheduled'),
    ('none', 'small', 'no', 'very high', 'scheduled'),
    ('none', 'small', 'yes', 'low', 'defer'),
    ('none', 'small', 'yes', 'medium', 'scheduled'),
    ('none', 'small', 'yes', 'high', 'scheduled'),
    ('none', 'small', 'yes', 'very high', 'scheduled'),
    ('none', 'controlled', 'no', 'low', 'defer'),
    ('none', 'controlled', 'no', 'medium', 'scheduled'),
    ('none', 'controlled', 'no', 'high', 'scheduled'),
    ('none', 'controlled', 'no', 'very high', 'scheduled'),
    ('none', 'controlled', 'yes', 'low', 'scheduled'),
    ('none', 'controlled', 'yes', 'medium', 'scheduled'),
    ('none', 'controlled', 'yes', 'high', 'scheduled'),
    ('none', 'controlled', 'yes', 'very high', 'scheduled'),
    ('none', 'open', 'no', 'low', 'defer'),
    ('none', 'open', 'no', 'medium', 'scheduled'),
    ('none', 'open', 'no', 'high', 'scheduled'),
    ('none', 'open', 'no', 'very high', 'scheduled'),
    ('none', 'open', 'yes', 'low', 'scheduled'),
    ('none', 'open', 'yes', 'medium', 'scheduled'),
    ('none', 'open', 'yes', 'high', 'scheduled'),
    ('none', 'open', 'yes', 'very high', 'out-of-cycle'),
    ('public poc', 'small', 'no', 'low', 'defer'),
    ('public poc', 'small', 'no', 'medium', 'scheduled'),
    ('public poc', 'small', 'no', 'high', 'scheduled'),
    ('public poc', 'small', 'no', 'very high', 'scheduled'),
    ('public poc', 'small', 'yes', 'low', 'scheduled'),
    ('public poc', 'small', 'yes', 'medium', 'scheduled'),
    ('public poc', 'small', 'yes', 'high', 'scheduled'),
    ('public poc', 'small', 'yes', 'very high', 'scheduled'),
    ('public poc', 'controlled', 'no', 'low', 'defer'),
    ('public poc', 'controlled', 'no', 'medium', 'scheduled'),
    ('public poc', 'controlled', 'no', 'high', 'scheduled'),
    ('public poc', 'controlled', 'no', 'very high', 'scheduled'),
    ('public poc', 'controlled', 'yes', 'low', 'scheduled'),
    ('public poc', 'controlled', 'yes', 'medium', 'scheduled'),
    ('public poc', 'controlled', 'yes', 'high', 'scheduled'),
    ('public poc', 'controlled', 'yes', 'very high', 'out-of-cycle'),
    ('public poc', 'open', 'no', 'low', 'scheduled'),
    ('public poc', 'open', 'no', 'medium', 'scheduled'),
    ('public poc', 'open', 'no', 'high', 'scheduled'),
    ('public poc', 'open', 'no', 'very high', 'out-of-cycle'),
    ('public poc', 'open', 'yes', 'low', 'scheduled'),
    ('public poc', 'open', 'yes', 'medium', 'scheduled'),
    ('public poc', 'open', 'yes', 'high', 'out-of-cycle'),
    ('public poc', 'open', 'yes', 'very high', 'out-of-cycle'),
    ('active', 'small', 'no', 'low', 'scheduled'),
    ('active', 'small', 'no', 'medium', 'scheduled'),
    ('active', 'small', 'no', 'high', 'out-of-cycle'),
    ('active', 'small', 'no', 'very high', 'out-of-cycle'),
    ('active', 'small', 'yes', 'low', 'scheduled'),
    ('active', 'small', 'yes', 'medium', 'out-of-cycle'),
    ('active', 'small', 'yes', 'high', 'out-of-cycle'),
    ('active', 'small', 'yes', 'very high', 'out-of-cycle'),
    ('active', 'controlled', 'no', 'low', 'scheduled'),
    ('active', 'controlled', 'no', 'medium', 'scheduled'),
    ('active', 'controlled', 'no', 'high', 'out-of-cycle'),
    ('active', 'controlled', 'no', 'very high', 'out-of-cycle'),
    ('active', 'controlled', 'yes', 'low', 'out-of-cycle'),
    ('active', 'controlled', 'yes', 'medium', 'out-of-cycle'),
    ('active', 'controlled', 'yes', 'high', 'out-of-cycle'),
    ('active', 'controlled', 'yes', 'very high', 'out-of-cycle'),
    ('active', 'open', 'no', 'low', 'scheduled'),
    ('active', 'open', 'no', 'medium', 'out-of-cycle'),
    ('active', 'open', 'no', 'high', 'out-of-cycle'),
    ('active', 'open', 'no', 'very high', 'immediate'),
    ('active', 'open', 'yes', 'low', 'out-of-cycle'),
    ('active', 'open', 'yes', 'medium', 'out-of-cycle'),
    ('active', 'open', 'yes', 'high', 'immediate'),
    ('active', 'open', 'yes', 'very high', 'immediate'),
]
SUPPLIER_ROWS = [
    ('none', 'laborious', 'partial', 'minimal', 'defer'),
    ('none', 'laborious', 'partial', 'significant', 'scheduled'),
    ('none', 'laborious', 'total', 'minimal', 'scheduled'),
    ('none', 'laborious', 'total', 'significant', 'out-of-cycle'),
    ('none', 'efficient', 'partial', 'minimal', 'scheduled'),
    ('none', 'efficient', 'partial', 'significant', 'out-of-cycle'),
    ('none', 'efficient', 'total', 'minimal', 'scheduled'),
    ('none', 'efficient', 'total', 'significant', 'out-of-cycle'),
    ('none', 'super effective', 'partial', 'minimal', 'scheduled'),
    ('none', 'super effective', 'partial', 'significant', 'out-of-cycle'),
    ('none', 'super effective', 'total', 'minimal', 'out-of-cycle'),
    ('none', 'super effective', 'total', 'significant', 'out-of-cycle'),
    ('public poc', 'laborious', 'partial', 'minimal', 'scheduled'),
    ('public poc', 'laborious', 'partial', 'significant', 'out-of-cycle'),
    ('public poc', 'laborious', 'total', 'minimal', 'scheduled'),
    ('public poc', 'laborious', 'total', 'significant', 'immediate'),
    ('public poc', 'efficient', 'partial', 'minimal', 'scheduled'),
    ('public poc', 'efficient', 'partial', 'significant', 'immediate'),
    ('public poc', 'efficient', 'total', 'minimal', 'out-of-cycle'),
    ('public poc', 'efficient', 'total', 'significant', 'immediate'),
    ('public poc', 'super effective', 'partial', 'minimal', 'out-of-cycle'),
    ('public poc', 'super effective', 'partial', 'significant', 'immediate'),
    ('public poc', 'super effective', 'total', 'minimal', 'out-of-cycle'),
    ('public poc', 'super effective', 'total', 'significant', 'immediate'),
    ('active', 'laborious', 'partial', 'minimal', 'out-of-cycle'),
    ('active', 'laborious', 'partial', 'significant', 'immediate'),
    ('active', 'laborious', 'total', 'minimal', 'out-of-cycle'),
    ('active', 'laborious', 'total', 'significant', 'immediate'),
    ('active', 'efficient', 'partial', 'minimal', 'out-of-cycle'),
    ('active', 'efficient', 'partial', 'significant', 'immediate'),
    ('active', 'efficient', 'total', 'minimal', 'out-of-cycle'),
    ('active', 'efficient', 'total', 'significant', 'immediate'),
    ('active', 'super effective', 'partial', 'minimal', 'immediate'),
    ('active', 'super effective', 'partial', 'significant', 'immediate'),
    ('active', 'super effective', 'total', 'minimal', 'immediate'),
    ('active', 'super effective', 'total', 'significant', 'immediate'),
]
HUMAN_IMPACT_ROWS = [
    ('negligible', 'degraded', 'low'),
    ('negligible', 'mef support crippled', 'low'),
    ('negligible', 'mef failure', 'medium'),
    ('negligible', 'mission failure', 'very high'),
    ('marginal', 'degraded', 'low'),
    ('marginal', 'mef support crippled', 'low'),
    ('marginal', 'mef failure', 'medium'),
    ('marginal', 'mission failure', 'very high'),
    ('critical', 'degraded', 'medium'),
    ('critical', 'mef support crippled', 'high'),
    ('critical', 'mef failure', 'high'),
    ('critical', 'mission failure', 'very high'),
    ('catastrophic', 'degraded', 'very high'),
    ('catastrophic', 'mef support crippled', 'very high'),
    ('catastrophic', 'mef failure', 'very high'),
    ('catastrophic', 'mission failure', 'very high'),
]
UTILITY_ROWS = [
    ('no', 'diffuse', 'laborious'),
    ('no', 'concentrated', 'efficient'),
    ('yes', 'diffuse', 'efficient'),
    ('yes', 'concentrated', 'super effective'),
]
PUBLIC_SAFETY_ROWS = [
    ('negligible', 'minimal'),
    ('marginal', 'significant'),
    ('critical', 'significant'),
    ('catastrophic', 'significant'),
]
MWB_ROWS = [
    ('minimal', 'minimal', 'low'),
    ('minimal', 'material', 'medium'),       # CHECK - CISA SSVC Guide (Nov 2022) table
    ('minimal', 'irreversible', 'high'),
    ('support', 'minimal', 'medium'),
    ('support', 'material', 'medium'),
    ('support', 'irreversible', 'high'),
    ('essential', 'minimal', 'high'),
    ('essential', 'material', 'high'),
    ('essential', 'irreversible', 'high'),
]

VALUES = {
    "exploitation": ["none", "public poc", "active"],
    "exposure": ["small", "controlled", "open"],
    "automatable": ["no", "yes"],
    "technical_impact": ["partial", "total"],
    "mission_prevalence": ["minimal", "support", "essential"],
    "public_wellbeing": ["minimal", "material", "irreversible"],
    "safety_impact": ["negligible", "marginal", "critical", "catastrophic"],
    "mission_impact": ["degraded", "mef support crippled", "mef failure", "mission failure"],
    "value_density": ["diffuse", "concentrated"],
}


def _lookup(rows, key):
    for r in rows:
        if tuple(r[:len(key)]) == tuple(key):
            return r[len(key)]
    return None


TREES = {
    "deployer": {
        "source": "CISA SSVC 2.0.3",
        "outcomes": ["track", "track*", "attend", "act"],
        "inputs": ["exploitation", "automatable", "technical_impact", "mission_prevalence", "public_wellbeing"],
        "derive": lambda p: {"mwb": _lookup(MWB_ROWS, (p["mission_prevalence"], p["public_wellbeing"]))},
        "key": lambda p, d: (p["exploitation"], p["automatable"], p["technical_impact"], d["mwb"]),
        "rows": CISA_ROWS,
    },
    "deployer-cert": {
        "source": "CERT/CC SSVC deployer patch application priority 1.0.0",
        "outcomes": ["defer", "scheduled", "out-of-cycle", "immediate"],
        "inputs": ["exploitation", "exposure", "automatable", "safety_impact", "mission_impact"],
        "derive": lambda p: {"human_impact": _lookup(HUMAN_IMPACT_ROWS, (p["safety_impact"], p["mission_impact"]))},
        "key": lambda p, d: (p["exploitation"], p["exposure"], p["automatable"], d["human_impact"]),
        "rows": DEPLOYER_ROWS,
    },
    "supplier": {
        "source": "CERT/CC SSVC supplier patch development priority 1.0.0",
        "outcomes": ["defer", "scheduled", "out-of-cycle", "immediate"],
        "inputs": ["exploitation", "automatable", "value_density", "technical_impact", "safety_impact"],
        "derive": lambda p: {"utility": _lookup(UTILITY_ROWS, (p["automatable"], p["value_density"])),
                              "public_safety": _lookup(PUBLIC_SAFETY_ROWS, (p["safety_impact"],))},
        "key": lambda p, d: (p["exploitation"], d["utility"], p["technical_impact"], d["public_safety"]),
        "rows": SUPPLIER_ROWS,
    },
}


def evaluate(tree, points):
    """Walk a tree. Returns {tree, source, points, derived, outcome} or raises ValueError."""
    t = TREES.get(tree)
    if not t:
        raise ValueError(f"unknown SSVC tree: {tree} (choose {', '.join(TREES)})")
    bad = [k for k in t["inputs"] if points.get(k) not in VALUES[k]]
    if bad:
        raise ValueError("missing or invalid decision point(s): " + ", ".join(
            f"{k} (one of {', '.join(VALUES[k])})" for k in bad))
    derived = t["derive"](points)
    outcome = _lookup(t["rows"], t["key"](points, derived))
    return {"tree": tree, "source": t["source"], "points": {k: points[k] for k in t["inputs"]},
            "derived": derived, "outcome": outcome,
            "note": "A response priority, never a likelihood: it does not change Pb(A) or Pb(psi,A)."}


def suggest_exploitation(cve, snap, poc_reports=0):
    """KEV listed -> active; EPSS at/above the snapshot's rung-4 thresholds or a reported public PoC -> public poc;
    otherwise none. Evidence for the decision point, not a probability."""
    cve = cve.upper()
    kev = (snap.get("kev") or {}).get("cves", {}).get(cve)
    epss = (snap.get("epss") or {}).get("scores", {}).get(cve)
    th = snap.get("thresholds") or {}
    s_min, p_min = float(th.get("epss_rung4_min") or 0.5), float(th.get("epss_percentile_rung4_min") or 0.9)
    basis, value = [], "none"
    if kev:
        value = "active"; basis.append(f"CISA KEV: listed {kev.get('added', '')}".strip())
    hi = bool(epss) and (epss[0] >= s_min or epss[1] >= p_min)
    if epss:
        basis.append(f"EPSS {epss[0]:.5f} (percentile {epss[1]:.3f})" + (" - at or above the high threshold" if hi else ""))
    if poc_reports:
        basis.append(f"{poc_reports} report(s) of a public proof of concept")
    if value == "none" and (hi or poc_reports):
        value = "public poc"
    return {"cve": cve, "suggested": value, "basis": basis, "snapshot": snap.get("retrieved")}


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--tree", default="deployer", choices=list(TREES))
    ap.add_argument("--snapshot")
    ap.add_argument("--suggest", nargs="*", default=[])
    ap.add_argument("--poc", type=int, default=0, help="number of public PoC reports (with --suggest)")
    ap.add_argument("points", nargs="*", help="decision point=value")
    a = ap.parse_args(argv)
    if a.suggest:
        if not a.snapshot:
            ap.error("--suggest needs --snapshot")
        with open(a.snapshot, encoding="utf-8") as fh:
            snap = json.load(fh)
        print(json.dumps([suggest_exploitation(c, snap, a.poc) for c in a.suggest], indent=1))
        return 0
    pts = dict(p.split("=", 1) for p in a.points)
    try:
        print(json.dumps(evaluate(a.tree, pts), indent=1))
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
