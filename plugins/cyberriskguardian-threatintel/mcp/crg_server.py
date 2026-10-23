#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""CyberRiskGuardian calculator - local MCP server (stdio).

Exposes deterministic tools so the agent never computes risk indices, CVSS scores or budget targets "by eye":
  - crg_risk           : estimated / tolerated / mitigated / residual risk, risk-to-tolerance ratio,
                         classification and cost-effectiveness (risk indices, not KRIs)
  - cvss4_score        : CVSS v4.0 base score (CVSS-B) and severity from a vector
  - cost_effectiveness : risk units removed per $1,000
  - combine_reductions : package reduction from several measures, 1 - prod(1 - r_i) (product rule)
  - budget_target      : appetite-consistent cybersecurity budget (point targets 12% / 7.8% / 4%, linear),
                         optionally with current spending and the portfolio, gap and implied appetite
  - budget_check       : each year's planned spend against the appetite-consistent target, implied appetite
  - sensitivity        : lower / central / higher case for one scenario
  - threat_context     : places CVEs on the Threat Evidence Ladder from a LOCAL snapshot file

Every tool is offline and deterministic (threat-intel rule 1): no network I/O. Inputs are validated as in
crg_calc.py (CRG 1.8.0 decision 4); an invalid input returns {"error": ..., "errors": [...]}.

Requires: pip install "mcp>=1.2" cvss (works with mcp 1.x FastMCP and mcp 2.x MCPServer)
"""
import datetime as _dt
import json, os, pathlib, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "skills", "cyber-risk-assessment", "scripts"))
try:                                    # mcp 1.x
    from mcp.server.fastmcp import FastMCP as _Server
except ImportError:                     # mcp 2.x renamed FastMCP to MCPServer
    from mcp.server.mcpserver import MCPServer as _Server
import crg_calc as C

mcp = _Server("crg-calculator")


def _err(e):
    errs = getattr(e, "errors", None) or [str(e)]
    return {"error": "Input validation failed", "errors": errs}


def _scenario(pba, pbx, de, dm, theta, mu, red_p, red_i, cvss_vector=None, cvss_score=None):
    s = {"id": "X", "params": {"PbA": {"v": pba}, "Pbx": {"v": pbx}, "De": {"v": de}, "Dm": {"v": dm},
                               "Th": {"v": theta}, "Mu": {"v": mu}}, "red_p": red_p, "red_i": red_i}
    if cvss_score is not None:
        s["cvss_score"] = cvss_score
    if cvss_vector:
        s["cvss"] = cvss_vector
    return s


@mcp.tool()
def crg_risk(pba: float, pbx: float, de: float, dm: float, theta: float, mu: float,
             red_p: float = 0.0, red_i: float = 0.0, appetite: float = C.DEFAULT_APPETITE,
             factor: float = C.DEFAULT_FACTOR, cvss_vector: str = "", cvss_score: float | None = None,
             cost: float | None = None) -> dict:
    """CyberRiskGuardian risk indices for one scenario (Excel Guide v1.0c formulas, unmodified).
    pba=Pb(A) threat presence, pbx=Pb(psi,A) exploitation, de/dm expected/maximum damage (dm >= de),
    theta=resilience in (0,1], mu=mu(E) organizational criticality (expected utility), red_p/red_i =
    probability/impact reduction of the treatment package (0-1; combine several measures with
    combine_reductions, never by adding them), appetite strictly in (0,1).
    CVSS is required: give cvss_vector (CVSS:4.0/...) and/or cvss_score (0-10). With both, the score is
    recomputed from the vector and a disagreeing stored score is flagged in `warnings`.
    cost (optional) = package cost for cost-effectiveness (risk units removed per $1,000)."""
    s = _scenario(pba, pbx, de, dm, theta, mu, red_p, red_i, cvss_vector or None, cvss_score)
    try:
        r = C.calc(s, appetite, factor, cost=cost)
    except C.CRGInputError as e:
        return _err(e)
    cur, post = C.case_normalized(s)
    r.update(classification=C.classify(r["ratio"]), normalized_current=cur, normalized_post=post,
             design_thresholds=C.design_thresholds(de, dm, appetite),
             note=("Risk-to-tolerance ratio = ((de+dm)/2) x (1 - red_p x red_i) / appetite; probabilities, CVSS, "
                   "resilience and criticality scale magnitude only. Below tolerance (< 0.90) needs red_p x red_i > "
                   "1 - 0.90 x appetite / average damage; ratio <= 1.00 needs red_p x red_i >= 1 - appetite / average "
                   "damage. These are risk indices, not KRIs. Analytical estimate — validation required."))
    return r


@mcp.tool()
def cvss4_score(vector: str) -> dict:
    """CVSS v4.0 base score (CVSS-B) and severity for a vector such as CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N."""
    try:
        score, sev = C.cvss4(vector)
    except Exception as e:
        return {"error": f"Invalid CVSS v4.0 vector: {e}", "vector": vector}
    return {"vector": vector, "base_score": score, "severity": sev, "nomenclature": "CVSS-B"}


@mcp.tool()
def cost_effectiveness(estimated: float, residual: float, cost: float) -> dict:
    """Cost-effectiveness = (Re - Residual) / cost x 1,000, in risk units removed per $1,000."""
    ce = C.cost_effectiveness(estimated, residual, cost)
    if ce is None:
        return {"error": "cost must be a positive amount"}
    return {"cost_effectiveness": ce, "unit": "risk units removed per $1,000"}


@mcp.tool()
def combine_reductions(reductions: list[float]) -> dict:
    """Package-level reduction from several measures acting on the same lever (all probability reductions
    together, or all impact reductions together): 1 - prod(1 - r_i). Each r_i must be within 0-1."""
    try:
        return {"combined": C.combine_reductions(reductions), "rule": "1 - prod(1 - r_i) (product rule)"}
    except C.CRGInputError as e:
        return _err(e)


@mcp.tool()
def budget_target(appetite: float, it_budget: float, current_spend: float = 0.0, portfolio_cost: float = 0.0) -> dict:
    """Appetite-consistent cybersecurity budget (step 18). Best-practice point targets of total IT budget
    including salaries: 12% at appetite 0.30 or below, 7.8% at 0.50, 4% at 0.70 or above, linear interpolation
    in between. With current_spend and/or portfolio_cost, also returns the planned total and share, the gap to
    the target (negative = below target) and the implied appetite. Closing a gap or revising the appetite is a
    Management decision required."""
    try:
        r = C.budget_position(appetite, it_budget, current_spend, portfolio_cost)
    except C.CRGInputError as e:
        return _err(e)
    r["point_targets"] = {f"{a:.2f}": t for a, t in C.POINT_TARGETS}
    return r


@mcp.tool()
def budget_check(spend: list[float], it_budget: float, appetite: float | None = None) -> list[dict]:
    """For each year of planned cybersecurity spend: share of IT budget, implied appetite and, with an appetite,
    the appetite-consistent target and the gap to it (point targets 12% / 7.8% / 4%, linear)."""
    if not C._num(it_budget) or it_budget <= 0:
        return [_err(ValueError("IT budget must be a positive amount"))]
    if appetite is not None and (not C._num(appetite) or not (0 < appetite < 1)):
        return [_err(ValueError("appetite must be strictly between 0 and 1"))]
    out = []
    for i, s in enumerate(spend, 1):
        pct = s / it_budget
        row = {"year": i, "spend": s, "pct": pct, "position": C.band_status(pct), "implied_appetite": C.implied_appetite(pct)}
        if appetite is not None:
            ts = C.target_status(pct, appetite)
            row.update(target_pct=ts["target_pct"], gap_pct=ts["gap_pct"], gap_amount=ts["gap_pct"] * it_budget, status=ts["status"])
        out.append(row)
    return out


@mcp.tool()
def sensitivity(pba: float, pbx: float, de: float, dm: float, theta: float, mu: float, red_p: float, red_i: float,
                delta: float = 0.10, appetite: float = C.DEFAULT_APPETITE, factor: float = C.DEFAULT_FACTOR,
                cvss_vector: str = "", cvss_score: float | None = None) -> dict:
    """Lower / central / higher case: Pb(A), Pb(psi,A), de, dm shifted by -/+ delta, theta and both reductions by
    +/- delta (against or in favour of the organization), every value clamped to [0.05, 0.99]."""
    s = _scenario(pba, pbx, de, dm, theta, mu, red_p, red_i, cvss_vector or None, cvss_score)
    out = {}
    try:
        for lab, d in (("lower", -delta), ("central", 0.0), ("higher", delta)):
            r = C.calc(C.shift(s, d) if d else s, appetite, factor)
            out[lab] = {"estimated": r["est"], "residual": r["res"], "ratio": r["ratio"], "classification": C.classify(r["ratio"])}
    except C.CRGInputError as e:
        return _err(e)
    out["robust"] = out["lower"]["classification"] == out["higher"]["classification"]
    return out


_SCRIPTS = pathlib.Path(HERE).parent / "skills" / "cyber-risk-assessment" / "scripts"


@mcp.tool()
def threat_context(snapshot_path: str, cves: list[str] | None = None, exposure_confirmed: bool = False) -> dict:
    """Place CVEs on the CyberRiskGuardian Threat Evidence Ladder using a LOCAL snapshot (no network I/O).

    Returns the proposed band for Pb(psi,A) per CVE, plus snapshot freshness. Never a point value: the band is
    deliberate. With exposure_confirmed=False the result carries applies=False, because external intelligence
    alone may not move a parameter (exposure gate).

    Args:
        snapshot_path: path to a threat-context-YYYY-MM-DD.json built by threat_snapshot.py.
        cves: CVE identifiers to classify. Omit for freshness and provenance only.
        exposure_confirmed: True only where organizational evidence confirms the affected technology is operated.
    """
    sys.path.insert(0, str(_SCRIPTS))
    import threat_snapshot as _ts
    snap = json.loads(pathlib.Path(snapshot_path).read_text(encoding="utf-8"))
    today = _dt.date.today().isoformat()
    expired = snap.get("expires", "9999-12-31") < today
    out = {
        "snapshot": {
            "retrieved": snap.get("retrieved"),
            "expires": snap.get("expires"),
            "expired": expired,
            "regions": snap.get("regions", []),
            "sources": [{k: s.get(k) for k in ("name", "version", "score_date", "entries") if s.get(k) is not None}
                        for s in snap.get("sources", [])],
            "kev_entries": snap.get("kev", {}).get("count"),
            "epss_entries": snap.get("epss", {}).get("count"),
        },
        "ladder": snap.get("threat_evidence_ladder", []),
        "constraints": snap.get("constraints", {}),
    }
    if expired:
        out["warning"] = ("Snapshot expired (90-day lifetime). Refresh with /refresh-threat-context before relying "
                          "on it; QC review will fail otherwise.")
    if cves:
        out["classification"] = [_ts.classify(c, snap, exposed=exposure_confirmed) for c in cves]
    return out


if __name__ == "__main__":
    mcp.run()
