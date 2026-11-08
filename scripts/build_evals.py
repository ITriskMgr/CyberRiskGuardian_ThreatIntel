#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""Generate the Threat Live-feed plugin's eval suite (case.yaml files) and replay its deterministic parts (NV-P15).

    python3 scripts/build_evals.py            # (re)write plugins/cyberriskguardian-threatintel/evals/*/case.yaml
    python3 scripts/build_evals.py --replay   # run the scripts behind each case and check the regex graders offline
    claude plugin eval plugins/cyberriskguardian-threatintel --allow-tools Bash Read Write   # needs the model

The replay is the release check that needs no model: it runs crg_calc.py, the MCP engine module, ssvc.py, the label
check and the shipped snapshot through the same expectations the graders hold, so a broken expectation is caught
before `claude plugin eval` is run. The llm graders can only be judged by `claude plugin eval` itself.
"""
import argparse, json, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLUGIN = os.path.join(ROOT, "plugins", "cyberriskguardian-threatintel")
SCRIPTS = os.path.join(PLUGIN, "skills", "cyber-risk-assessment", "scripts")
SNAPSHOT = os.path.join(ROOT, "examples", "threat-context", "threat-context-shipped.json")

EST = r"Analytical estimate|Estimation analytique"
GAP = r"Information gap|Lacune d.information"
DEC = r"Management decision required|D[ée]cision de la direction requise"
FIND = ("The fixture file {f} is not in the working directory: it is in a fixtures/ directory added to this session (listed "
        "among the additional working directories). Search there, for example with Glob **/fixtures/{f} from the added "
        "directory, then read it.")
VEC = "CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H"

CASES = {
 "quantify-worked-example": dict(
  tags=["smoke", "regression", "quantify"], runs=3, max_turns=10, tools=["Bash", "Read", "Skill"],
  prompt=f"Compute the CyberRiskGuardian risk indices for one scenario with the calculator, not by hand: Pb(A) 0.70, Pb(ψ,A) 0.60, CVSS vector {VEC}, δe 0.60, δm 0.80, θ 0.50, μ(E) 0.65, appetite 0.35, factor 1,000, probability reduction 0.65, impact reduction 0.70, cost $62,000. Give the CVSS score, estimated, tolerated, mitigated and residual risk, the risk-to-tolerance ratio, the classification and the cost-effectiveness.",
  graders=[
   dict(name="cvss", type="regex", pattern=r"\b9[.,]3\b"),
   dict(name="estimated", type="regex", pattern=r"3[,\s ]?554"),
   dict(name="tolerated", type="regex", pattern=r"1[,\s ]?777"),
   dict(name="residual", type="regex", pattern=r"1[,\s ]?937"),
   dict(name="ratio", type="regex", pattern=r"1[.,]09"),
   dict(name="cost-effectiveness", type="regex", pattern=r"26[.,]09"),
   dict(name="calculator-used", type="tool_used", tool="Bash", input_match="crg_calc"),
   dict(name="classification", type="llm", criteria="The scenario is classified as approximately at tolerance (ratio between 0.90 and 1.10) and the values are called risk indices, not KRIs, with the Analytical estimate marker."),
  ]),
 "quantify-cvss-base-only": dict(
  tags=["smoke", "regression", "quantify", "x-1"], runs=2, max_turns=10, tools=["Bash", "Read", "Skill"],
  prompt=f"Score this CVSS v4.0 vector with the CyberRiskGuardian calculator and compute the estimated risk for Pb(A) 0.70, Pb(ψ,A) 0.60, δe 0.60, δm 0.80, θ 0.50, μ(E) 0.65, appetite 0.35: {VEC}/E:U",
  graders=[
   dict(name="calculator-used", type="tool_used", tool="Bash", input_match="crg_calc|cvss"),
   dict(name="routed", type="regex", pattern=r"Pb\s*\(\s*[ψψ]|Pb\(psi", flags="i"),
   dict(name="not-8.1-as-base", type="llm", criteria="The reply refuses the Threat metric E:U: it explains that CyberRiskGuardian scores the CVSS v4.0 Base metrics only (CVSS-B, 9.3 for this vector without /E:U), that exploitation evidence (KEV, EPSS, proof of concept) belongs in Pb(ψ,A) instead, and it does not present 8.1 (the CVSS-BT value) as the base score or an estimated risk of 3,095.82 computed from it. If it computes the risk at all, it does so with the Base vector (Re 3,554.46) and says so."),
  ]),
 "quantify-zero-tolerance": dict(
  tags=["regression", "quantify", "x-2"], runs=2, max_turns=10, tools=["Bash", "Read", "Skill"],
  prompt=f"Run the CyberRiskGuardian calculator on this scenario and give me its tolerance verdict: Pb(A) 0, Pb(ψ,A) 0.60, δe 0.60, δm 0.80, θ 0.50, μ(E) 0.65, appetite 0.35, no treatment, CVSS vector {VEC}.",
  graders=[
   dict(name="calculator-used", type="tool_used", tool="Bash", input_match="crg_calc"),
   dict(name="not-applicable", type="regex", pattern=r"[Nn]ot applicable|[Nn]on applicable|tolerated risk (?:is )?0|risque tol[ée]r[ée] (?:est )?(?:de )?0"),
   dict(name="no-above", type="llm", criteria="The reply does not classify the scenario as above tolerance. It reports estimated and tolerated risk of 0, says the risk-to-tolerance ratio is not applicable because tolerated risk is 0, and asks the analyst to confirm that Pb(A) = 0 is deliberate (the threat is not expected in the period) rather than a placeholder, marking it Analytical estimate — validation required or Information gap — organizational validation required."),
  ]),
 "quantify-medibec30-regression": dict(
  tags=["regression", "quantify"], runs=1, fixtures=["medibec30.json"], max_turns=10, tools=["Bash", "Read", "Glob", "Skill"],
  prompt=FIND.format(f="medibec30.json") + " It is a CyberRiskGuardian data model for the 30-scenario MediBec assessment. Run the CyberRiskGuardian calculator on it and report the total estimated risk, the total residual risk and the counts above, approximately at and below tolerance.",
  graders=[
   dict(name="total-estimated", type="regex", pattern=r"84[,\s ]?305"),
   dict(name="total-residual", type="regex", pattern=r"41[,\s ]?023"),
   dict(name="counts", type="regex", pattern=r"12\b[^\n]{0,60}above|above[^\n]{0,60}\b12\b", flags="i"),
   dict(name="tool", type="tool_used", tool="Bash", input_match="crg_calc"),
  ]),
 "threat-context-freshness": dict(
  tags=["smoke", "threat-context"], runs=2, fixtures=["threat-context-shipped.json"], max_turns=12, tools=["Bash", "Read", "Glob", "Skill"],
  prompt=FIND.format(f="threat-context-shipped.json") + " It is a CyberRiskGuardian threat-context snapshot. Tell me its retrieval date, its expiry date, whether it is still usable for an assessment today, which sources it holds, and what the exposure gate means for a CVE it lists. Do not download anything.",
  graders=[
   dict(name="retrieved", type="regex", pattern=r"2026-11-02"),
   dict(name="expires", type="regex", pattern=r"2027-01-31"),
   dict(name="sources", type="regex", pattern=r"KEV|Known Exploited", flags="i"),
   dict(name="no-network", type="llm", criteria="The reply reads the snapshot locally (no download), states the 90-day lifetime and whether the snapshot is expired relative to today's date, names CISA KEV and FIRST EPSS as sources, and explains the exposure gate: a KEV listing or EPSS value may only move Pb(ψ,A) within a Threat Evidence Ladder band when organizational evidence confirms the affected technology is operated; it never becomes Pb(A) or Pb(ψ,A) directly and never changes δe, δm, θ or μ(E)."),
  ]),
 "ssvc-response-priority": dict(
  tags=["smoke", "threat-context", "ssvc"], runs=2, max_turns=10, tools=["Bash", "Read", "Skill"],
  prompt="Walk the CISA SSVC deployer tree with the CyberRiskGuardian tools for: exploitation active, automatable yes, technical impact total, mission prevalence support, public well-being minimal. Give the outcome and say what it means for the risk indices.",
  graders=[
   dict(name="tool", type="tool_used", tool="Bash", input_match="ssvc"),
   dict(name="outcome-act", type="regex", pattern=r"\bact\b", flags="i"),
   dict(name="not-a-likelihood", type="llm", criteria="The reply gives the outcome 'act' (with Mission & Well-being derived as medium) and states that an SSVC outcome is a response priority, never a likelihood: it does not change Pb(A) or Pb(ψ,A) and is not converted into a risk index."),
  ]),
 "label-check-cli": dict(
  tags=["smoke", "label-check"], runs=2, fixtures=["draft_summary.md"], max_turns=10, tools=["Bash", "Read", "Glob", "Skill"],
  prompt=FIND.format(f="draft_summary.md") + " Run the CyberRiskGuardian label check (/label-check) on it and tell me what to fix. Do not edit the file.",
  graders=[
   dict(name="check-run", type="tool_used", tool="Bash", input_match="check_labels"),
   dict(name="retired-marker", type="regex", pattern=r"Analyst estimate", flags="i"),
   dict(name="replacement", type="regex", pattern=EST, flags="i"),
   dict(name="findings", type="llm", criteria="The reply reports that the draft lacks the Information gap marker (the supplier list was not provided) and the Management decision required marker, that 'Analyst estimate — validation required' is retired wording to replace with 'Analytical estimate — validation required', and that an ABS() residual is outdated (residual = estimated − mitigated with a MAX(0, …) guard). It suggests wording fixes only, changes no number and does not edit the file."),
  ]),
}

DRAFT_SUMMARY = """# Clinique Nord — management summary (draft)

Appetite 0.30 (Analyst estimate — validation required). Supplier list not provided.

| Scenario | Pb(A) | Pb(ψ,A) | Estimated | Tolerated | Ratio | Verdict |
|---|---|---|---|---|---|---|
| S1 Admin credential compromise | 0.70 | 0.60 | 5,428 | 2,412 | 2.25 | Above tolerance |
| S2 Ransomware on scheduling servers | 0.60 | 0.55 | 4,100 | 2,050 | 2.00 | Above tolerance |
| S3 Supplier portal data leak | 0.40 | 0.50 | 1,200 | 1,150 | 1.04 | Approximately at tolerance |

Residual risk will be computed as ABS(L − R) once the treatment package is costed.
"""


def yaml_scalar(v):
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return str(v)
    return json.dumps(v, ensure_ascii=False)


def shared_fixtures():
    d = os.path.join(PLUGIN, "evals", "_shared")
    os.makedirs(d, exist_ok=True)
    shutil.copy(os.path.join(ROOT, "examples", "medibec", "source", "medibec30.json"), os.path.join(d, "medibec30.json"))
    shutil.copy(SNAPSHOT, os.path.join(d, "threat-context-shipped.json"))
    with open(os.path.join(d, "draft_summary.md"), "w", encoding="utf-8") as f:
        f.write(DRAFT_SUMMARY)
    return d


def write_case(name, c, shared):
    d = os.path.join(PLUGIN, "evals", name)
    if os.path.isdir(d):
        shutil.rmtree(d)
    os.makedirs(d)
    lines = ['schema_version: "1.1"', f"name: {name}", f"tags: {json.dumps(c['tags'])}", f"runs: {c['runs']}", "execution:",
             f"  prompt: {yaml_scalar(c['prompt'])}", f"  max_turns: {c['max_turns']}",
             f"  timeout_seconds: {c.get('timeout', 600)}", f"  allowed_tools: {json.dumps(c['tools'])}"]
    if c.get("fixtures"):
        os.makedirs(os.path.join(d, "fixtures"))
        for f in c["fixtures"]:
            shutil.copy(os.path.join(shared, f), os.path.join(d, "fixtures", f))
        lines += ["context:", "  add_dirs: [fixtures]"]
    lines.append("graders:")
    for g in c["graders"]:
        lines.append(f"  - name: {g['name']}")
        for k, v in g.items():
            if k != "name":
                lines.append(f"    {k}: {yaml_scalar(v)}")
    with open(os.path.join(d, "case.yaml"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def build():
    shared = shared_fixtures()
    for name, c in CASES.items():
        write_case(name, c, shared)
    print(f"{PLUGIN}: {len(CASES)} cases")


# ------------------------------------------------------------------------------------------------------ replay
def replay():
    """Run the deterministic part of each case and check its regex graders. Exit 1 on a failure."""
    sys.path.insert(0, SCRIPTS)
    import crg_calc as C, ssvc
    fails = []

    def grade(case, text, skip=()):
        for g in CASES[case]["graders"]:
            if g["type"] != "regex" or g["name"] in skip:
                continue
            ok = re.search(g["pattern"], text, re.I if g.get("flags") == "i" else 0) is not None
            print(f"{'PASS' if ok else 'FAIL'} {case}/{g['name']}")
            if not ok:
                fails.append(f"{case}/{g['name']}")

    ex = {"id": "G16", "params": {"PbA": 0.70, "Pbx": 0.60, "De": 0.60, "Dm": 0.80, "Th": 0.50, "Mu": 0.65}, "red_p": 0.65, "red_i": 0.70, "cvss": VEC}
    r = C.calc(ex, 0.35, 1000, cost=62000)
    grade("quantify-worked-example", f"CVSS {r['cvss']} estimated {r['est']:,.2f} tolerated {r['tol']:,.2f} residual {r['res']:,.2f} ratio {r['ratio']:.2f} cost-effectiveness {r['ce']:.2f} {C.classify(r['ratio'])}")
    try:
        C.calc(dict(ex, cvss=VEC + "/E:U"), 0.35)
        msg = "accepted"
    except C.CRGInputError as e:
        msg = "; ".join(e.errors)
    grade("quantify-cvss-base-only", msg)
    z = C.calc(dict(ex, params=dict(ex["params"], PbA=0.0), red_p=0, red_i=0), 0.35)
    grade("quantify-zero-tolerance", f"{C.classify(z['ratio'])}; " + "; ".join(z["warnings"]))
    out = C.run(json.load(open(os.path.join(ROOT, "examples", "medibec", "source", "medibec30.json"), encoding="utf-8")))
    from collections import Counter
    cnt = Counter(x["cls"] for x in out["results"])
    grade("quantify-medibec30-regression", f"Total estimated {out['totals']['est']:,.0f} residual {out['totals']['res']:,.0f}; {cnt['Above tolerance']} above, {cnt['Approximately at tolerance']} approximately at, {cnt['Below tolerance']} below")
    snap = json.load(open(SNAPSHOT, encoding="utf-8"))
    grade("threat-context-freshness", f"retrieved {snap.get('retrieved')} expires {snap.get('expires')} sources " + ", ".join(s.get("name", "") for s in snap.get("sources", [])))
    d = ssvc.evaluate("deployer", {"exploitation": "active", "automatable": "yes", "technical_impact": "total", "mission_prevalence": "support", "public_wellbeing": "minimal"})
    grade("ssvc-response-priority", f"outcome {d['outcome']} derived {d.get('derived')}")
    shared = shared_fixtures()
    p = subprocess.run([sys.executable, os.path.join(PLUGIN, "hooks", "check_labels.py"), os.path.join(shared, "draft_summary.md")], capture_output=True, text=True)
    grade("label-check-cli", p.stdout, skip=("replacement",))
    ok = "Analyst estimate" in p.stdout and "ABS(" in p.stdout and "Information gap" in p.stdout and "Management decision" in p.stdout
    print(f"{'PASS' if ok else 'FAIL'} label-check-cli/findings (mechanical part)")
    if not ok:
        fails.append("label-check-cli/findings")
    print(f"\n{'ALL PASSED' if not fails else str(len(fails)) + ' FAILED'} (llm and tool_used graders need `claude plugin eval`)")
    return 1 if fails else 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--replay", action="store_true", help="run the deterministic checks behind the regex graders")
    a = ap.parse_args()
    if a.replay:
        sys.exit(replay())
    build()
