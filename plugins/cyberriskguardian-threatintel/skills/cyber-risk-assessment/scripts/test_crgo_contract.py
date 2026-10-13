#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""Regression and acceptance checks for the CRGO bridge (crgo_contract.py): dss/v1, compliance/v1 and secops/v1.

    python3 test_crgo_contract.py --crgo PATH/TO/CyberRiskGuardian-Ontology-0.10.0 [--assessment medibec30.json]

Checks: the MediBec regression (84,491 / 41,104) with crg_calc.py; graph -> context of S1 (schema-valid) ->
residual-risk write-back stored as proposed; status 'approved' and modelVersion 'TBD' refused
(STATUS_NOT_PROPOSED, MODEL_VERSION_MISSING); a base under https://w3id.org/crgo/ refused; the report tables keep
unknown applicability as an evidence gap and flag a self-assessment vs independent conflict (CRGO's synthetic
Nordelle sample); with CRGO >= 0.10.0, the acceptance tests of the 0.10.0 brief (section 6) on the synthetic Nordelle
files: compliance and secops as of 2026-10-12 (gaps reported as gaps, never as compliance; approval gap flagged
without calling the action authorised or not), no validated coverage before 2026-06-10, contract errors returned
verbatim and never retried, and a clear refusal on an older CRGO checkout. Everything is written to a temporary folder outside the repository and removed afterwards.
Prints PASS/FAIL per check and exits non-zero on any failure. MediBec and Nordelle are fictional.
"""
import argparse, copy, hashlib, json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "crgo_contract.py")


def find_repo(start):
    """Repository root (holds .claude-plugin/marketplace.json), from the plugin or from its .claude/ copy."""
    d = start
    for _ in range(8):
        d = os.path.dirname(d)
        if os.path.isfile(os.path.join(d, ".claude-plugin", "marketplace.json")):
            return d
    return os.path.abspath(os.path.join(start, "..", "..", "..", "..", ".."))


REPO = find_repo(HERE)
BASE = "https://example.org/crgo-sample/medibec/"
results = []


def check(label, cond, detail=""):
    results.append(bool(cond))
    print("%s  %-78s %s" % ("PASS" if cond else "FAIL", label, detail))


def run(*args):
    return subprocess.run([sys.executable, SCRIPT, *args], capture_output=True, text=True)


N = "https://example.org/crgo-sample/nordelle/"
S10 = "https://w3id.org/crgo/vocab/loi25/P-39.1_s._10"
S38 = "https://w3id.org/crgo/vocab/loi25/P-39.1_s._3.8"
GDPR331 = "https://w3id.org/crgo/vocab/gdpr/GDPR_Art._33_1"


def read_contracts(cc, crgo, nd, tmp):
    files = [os.path.join(nd, f) for f in ("nordelle.ttl", "nordelle-applicability.ttl", "nordelle-grca.ttl", "nordelle-pca.ttl", "nordelle-secops.ttl")]
    graphs = [x for f in files for x in ("--graph", f)]
    p = cc.crgo_paths(crgo)
    views = cc.import_views(p, "compliance")

    def same_as_example(doc, contract, name):
        ex = json.load(open(os.path.join(crgo, "contracts", contract, "examples", name), encoding="utf-8"))
        a, b = dict(doc), dict(ex)
        a.pop("generatedAt", None); b.pop("generatedAt", None)
        return canon(a) == canon(b)

    def canon(x):
        """Order-insensitive form: CRGO does not guarantee the order of some lists (e.g. implementingMeasures)."""
        if isinstance(x, dict):
            return {k: canon(v) for k, v in x.items()}
        if isinstance(x, list):
            return sorted((canon(v) for v in x), key=lambda v: json.dumps(v, sort_keys=True))
        return x

    # compliance/v1 through the CLI (JSON saved where asked), as of 2026-10-12
    out_c = os.path.join(tmp, "nordelle-compliance.json")
    r = run("compliance", "--crgo", crgo, *graphs, "--as-of", "2026-10-12", "--out", out_c, "--summary")
    check("compliance: crgo_compliance_context read as of 2026-10-12", r.returncode == 0 and os.path.exists(out_c), r.stderr.strip()[-200:])
    c = json.load(open(out_c, encoding="utf-8"))
    check("compliance: valid against compliance-context.schema.json", views.validate(c, "compliance/v1") == [])
    check("compliance: same content as CRGO's example (except generatedAt; list order ignored)", same_as_example(c, "compliance/v1", "compliance-context.nordelle.json"))
    ob = {o["id"]: o for o in c["obligations"]}
    check("compliance: Loi 25 s. 10 applicable and partially satisfied",
          ob[S10]["applicability"] == "applicable" and ob[S10]["complianceState"] == "partially-satisfied")
    check("compliance: s. 3.8 satisfied on evidence judged insufficient",
          ob[S38]["complianceState"] == "satisfied" and ob[S38]["evidenceStatus"] == "judged-insufficient")
    ex = {e["id"]: e for e in c["exceptions"]}.get(N + "exception/edr-legacy-pos", {})
    check("compliance: EDR exception active, concerns s. 10 without a regulatory exemption",
          ex.get("active") is True and ex.get("provisionsWithoutExemption") == [S10])
    dl = {d["id"]: d for d in c["deadlines"]}.get(N + "compliance/deadline/gdpr-72h-2026-08", {})
    check("compliance: GDPR 72-hour deadline (Art. 33(1)) due 2026-08-07T00:00, unanswered",
          dl.get("due") == "2026-08-07T00:00:00" and dl.get("answered") is False and dl.get("deadlineFor") == [GDPR331])
    rows = {l.split(" | ")[0].lstrip("| "): l for l in r.stdout.splitlines() if l.startswith("| P-39.1") or l.startswith("| GDPR")}
    gaps = [t for _, t in cc.compliance_gaps(c, cc.label_map(cc.import_dss(p).load(files), c))]
    check("compliance report: s. 10 and s. 3.8 reported as gaps, not as compliance",
          "GAP" in rows.get("P-39.1 s. 10", "") and "GAP, not compliance" in rows.get("P-39.1 s. 3.8", "")
          and "JUDGED INSUFFICIENT" in rows.get("P-39.1 s. 3.8", "") and any("s. 3.8: recorded as satisfied" in g for g in gaps))
    check("compliance report: exception without exemption and overdue unanswered GDPR deadline shown",
          "Exception" in rows.get("P-39.1 s. 10", "") and "unanswered (OVERDUE)" in rows.get("GDPR Art. 33(1)", "")
          and any("without a regulatory exemption" in g for g in gaps))
    check("compliance report: never states compliance from a mapping", not re.search(r"\bcompliant\b", r.stdout, re.I)
          and "Compliance posture" in r.stdout)

    # secops/v1, as of 2026-10-12
    out_s = os.path.join(tmp, "nordelle-secops.json")
    r = run("secops", "--crgo", crgo, *graphs, "--as-of", "2026-10-12", "--out", out_s, "--summary")
    check("secops: crgo_secops_context read as of 2026-10-12", r.returncode == 0 and os.path.exists(out_s), r.stderr.strip()[-200:])
    s = json.load(open(out_s, encoding="utf-8"))
    check("secops: valid against secops-context.schema.json", views.validate(s, "secops/v1") == [])
    check("secops: same content as CRGO's example (except generatedAt; list order ignored)", same_as_example(s, "secops/v1", "secops-context.nordelle.json"))
    sc = {x["id"]: x for x in s["scenarios"]}
    rw, cr = sc.get(N + "scenario/ransomware", {}), sc.get(N + "scenario/credential-compromise", {})
    check("secops: ransomware coverage validated by a test", any(cv["validatedByTest"] for cv in rw.get("coverage", [])))
    check("secops: credential-compromise coverage untested, with a detection gap",
          [cv["status"] for cv in cr.get("coverage", [])] == ["untested"] and not any(cv["validatedByTest"] for cv in cr["coverage"])
          and cr.get("detectionGaps") == [N + "detection-gap/edr-servers"])
    check("secops: ransomware playbook not simulated (no passed simulation)", [pb["simulationPassed"] for pb in rw.get("playbooks", [])] == [False])
    check("secops: October kiosk isolation without valid approval (expired pre-authorisation)",
          s["executionsWithoutValidApproval"] == [{"id": N + "action-execution/2026-10-10-isolate", "action": N + "response-action/isolate-host", "reason": "expired"}]
          and "Isolate kiosk K-12" in r.stdout)
    check("secops: two incidents with undetermined GDPR reportability",
          sorted((t["incident"], t["reason"]) for t in s["openRegulatoryTriage"]) ==
          [(N + "incident/2026-08-phishing", "undetermined"), (N + "incident/2026-10-kiosk-malware", "undetermined")])
    ex_line = next((l for l in r.stdout.splitlines() if "Isolate kiosk K-12" in l), "")
    check("secops report: approval gap flagged, action neither called authorised nor unauthorised",
          "Audit signal only" in ex_line and "neither authorises nor condemns" in ex_line
          and not re.search(r"\b(un)?authori[sz]ed\b", r.stdout, re.I) and "Detection and response readiness" in r.stdout)
    check("secops report: alerts never presented as incidents", "an alert is not an incident" in r.stdout)

    # dated records: before 2026-06-10 no validated coverage
    out_e = os.path.join(tmp, "nordelle-secops-early.json")
    r = run("secops", "--crgo", crgo, *graphs, "--as-of", "2026-06-09", "--out", out_e)
    e = json.load(open(out_e, encoding="utf-8")) if r.returncode == 0 else {"scenarios": [{"coverage": [{"validatedByTest": True}]}]}
    check("secops/temporal: on 2026-06-09 no coverage is validated",
          not any(cv["validatedByTest"] for x in e["scenarios"] for cv in x["coverage"]))
    r = run("secops", "--crgo", crgo, *graphs, "--as-of", "2026-06-10", "--out", out_e)
    e = json.load(open(out_e, encoding="utf-8"))
    check("secops/temporal: from 2026-06-10 the ransomware coverage is validated",
          any(cv["validatedByTest"] for x in e["scenarios"] if x["id"] == N + "scenario/ransomware" for cv in x["coverage"]))

    # contract errors returned verbatim, non-zero, never retried
    for args, code in ((("--as-of", "2026-13-01"), "SCHEMA_INVALID"),
                       (("--org", "https://w3id.org/crgo/data/x/org"), "REFERENCE_NAMESPACE"),
                       (("--org", "https://example.org/crgo-sample/nobody/org"), "UNKNOWN_ORGANISATION")):
        for cmd in ("compliance", "secops"):
            r = run(cmd, "--crgo", crgo, *graphs, *args, "--out", os.path.join(tmp, "err.json"))
            first = (r.stdout.strip().splitlines() or ["{}"])[0]
            try:
                doc = json.loads(first)
            except ValueError:
                doc = {}
            check("error %s (%s): returned verbatim, exit 3, nothing written" % (code, cmd),
                  r.returncode == 3 and doc.get("error") is True and doc.get("code") == code and code in r.stderr
                  and "do not retry" in r.stderr and not os.path.exists(os.path.join(tmp, "err.json")))

    # an older CRGO checkout (no compliance/secops contracts) is refused with a clear message
    old = os.path.join(tmp, "crgo-0.9.1-like")
    os.makedirs(os.path.join(old, "pipeline", "contracts")); os.makedirs(os.path.join(old, "pipeline", "crg"))
    shutil.copy(os.path.join(crgo, "pipeline", "contracts", "dss.py"), os.path.join(old, "pipeline", "contracts"))
    shutil.copy(os.path.join(crgo, "pipeline", "crg", "crg2rdf.py"), os.path.join(old, "pipeline", "crg"))
    open(os.path.join(old, "CHANGELOG.md"), "w").write("# Changelog\n\n## [0.9.1] — 2026-10-12, patch\n")
    for cmd in ("compliance", "secops"):
        r = run(cmd, "--crgo", old, *graphs, "--as-of", "2026-10-12", "--out", os.path.join(tmp, "old.json"))
        check("older CRGO (0.9.1): %s refused with a clear message, exit 4" % cmd,
              r.returncode == 4 and "needs CRGO v0.10.0" in r.stderr and "0.9.1" in r.stderr and not os.path.exists(os.path.join(tmp, "old.json")))

    # default output: the git-ignored output/crgo/ folder
    if shutil.which("git") and os.path.isdir(os.path.join(REPO, ".git")):
        existed = os.path.isdir(os.path.join(REPO, "output"))
        r = subprocess.run([sys.executable, SCRIPT, "compliance", "--crgo", crgo, *graphs, "--as-of", "2026-10-12"],
                           capture_output=True, text=True, cwd=REPO)
        dflt = os.path.join(REPO, "output", "crgo", "nordelle-compliance-2026-10-12.json")
        ign = subprocess.run(["git", "-C", REPO, "check-ignore", "-q", dflt]).returncode == 0
        check("default output in git-ignored output/crgo/", r.returncode == 0 and os.path.exists(dflt) and ign, dflt)
        if os.path.exists(dflt):
            os.remove(dflt)
        if not existed:
            shutil.rmtree(os.path.join(REPO, "output"), ignore_errors=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--crgo", default=os.environ.get("CRGO_HOME") or os.path.join(REPO, "CyberRiskGuardian-Ontology-0.10.0"))
    ap.add_argument("--assessment", default=os.path.join(REPO, "examples", "medibec", "source", "medibec30.json"))
    ap.add_argument("--keep", action="store_true", help="keep the temporary folder")
    a = ap.parse_args()
    crgo = os.path.abspath(a.crgo)
    if not os.path.isfile(os.path.join(crgo, "pipeline", "contracts", "dss.py")):
        sys.exit("CRGO not found at %s: pass --crgo or set CRGO_HOME (tag v0.10.0)." % crgo)
    sys.path.insert(0, HERE)
    import crg_calc
    import crgo_contract as cc

    # 1. MediBec regression, unchanged formulas
    data = json.load(open(a.assessment, encoding="utf-8"))
    t = crg_calc.run(data)["totals"]
    check("MediBec regression: estimated 84,491 / residual 41,104", round(t["est"]) == 84491 and round(t["res"]) == 41104,
          "%s / %s" % (format(round(t["est"]), ","), format(round(t["res"]), ",")))

    tmp = tempfile.mkdtemp(prefix="crgo-contract-test-")
    try:
        # 2. graph
        r = run("graph", a.assessment, "--crgo", crgo, "--base", BASE, "--org-label", "MediBec", "--out", tmp)
        ttl = os.path.join(tmp, "medibec.ttl")
        check("graph: crg2rdf.py builds the organisation graph", r.returncode == 0 and os.path.exists(ttl), "" if r.returncode == 0 else r.stderr.strip()[-200:])
        check("graph: totals reproduced by the bridge (84491 / 41104)", "total estimated 84491, residual 41104" in r.stdout)
        m = json.load(open(os.path.join(tmp, "medibec.manifest.json")))
        sha = hashlib.sha256(open(a.assessment, "rb").read()).hexdigest()
        check("graph: manifest records the sha256 of the exact assessment file", m["assessmentSha256"] == sha, sha[:16])
        r = run("graph", a.assessment, "--crgo", crgo, "--base", "https://w3id.org/crgo/data/x/", "--org-label", "X", "--out", tmp)
        check("graph: a base under https://w3id.org/crgo/ is refused", r.returncode != 0 and "REFERENCE_NAMESPACE" in r.stderr)

        # 3. context of S1, schema-valid
        ctx = os.path.join(tmp, "medibec-context-S1.json")
        r = run("context", "--crgo", crgo, "--graph", ttl, "--scenario", "S1", "--as-of", "2026-10-12", "--out", ctx)
        check("context: S1 returned", r.returncode == 0 and os.path.exists(ctx), "" if r.returncode == 0 else r.stderr.strip()[-200:])
        import jsonschema
        doc = json.load(open(ctx))
        schema = json.load(open(os.path.join(crgo, "contracts", "dss", "v1", "risk-context.schema.json")))
        errs = list(jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker()).iter_errors(doc))
        check("context: valid against risk-context.schema.json", not errs, "%d error(s)" % len(errs))
        check("context: scenario is an analytical hypothesis, no risk score",
              doc["scenario"]["knowledgeStatus"] == "analytical-hypothesis" and "risk" not in {k.lower() for k in doc})
        check("context: ontologyRelease reported", bool(doc.get("ontologyRelease")), doc.get("ontologyRelease"))

        # 4. residual-risk write-back, stored as proposed
        common = ["--crgo", crgo, "--graph", ttl, "--assessment", a.assessment, "--scenarios", "S1", "--actor", "Test analyst (fictional)"]
        proposed = os.path.join(tmp, "medibec-dss-proposed.ttl")
        r = run("submit", *common, "--kinds", "residual-risk")
        check("submit: residual-risk accepted", r.returncode == 0, "" if r.returncode == 0 else r.stderr.strip()[-200:])
        check("submit: stored in medibec-dss-proposed.ttl (crgo_server naming)", os.path.exists(proposed))
        from rdflib import Graph, URIRef, Literal
        from rdflib.namespace import RDF
        dss = cc.import_dss(cc.crgo_paths(crgo))
        g = Graph().parse(proposed)
        T = dss.T
        stored = list(g.subjects(RDF.type, T("AnalyticalResult")))
        check("submit: one analytical result, status proposed, knowledge status risk estimate",
              len(stored) == 1 and (stored[0], T("governanceStatus"), T("StatusProposed")) in g
              and (stored[0], T("hasKnowledgeStatus"), T("KsRiskEstimate")) in g)
        s1 = next(x for x in crg_calc.run(data)["results"] if x["id"] == "S1")
        val = float(g.value(stored[0], T("numericValue"))) if stored else None
        check("submit: stored value equals crg_calc residual for S1", val is not None and abs(val - round(s1["res"], 6)) < 1e-6, "%.2f" % (val or 0))
        check("submit: inputDocumentSha256 is the assessment file's sha256", (stored[0], T("inputDocumentHash"), Literal(sha)) in g if stored else False)
        check("submit: inputs are the scenario's parameter records", (stored[0], T("computedFromInput"), URIRef(BASE + "S1-PbA")) in g if stored else False)

        # 5. refusals: status approved, modelVersion TBD (client side and CRGO side)
        before = len(Graph().parse(proposed))
        r = run("submit", *common, "--kinds", "residual-risk", "--status", "approved")
        check("refused: status approved -> STATUS_NOT_PROPOSED, non-zero exit", r.returncode != 0 and "STATUS_NOT_PROPOSED" in r.stderr)
        r = run("submit", *common, "--kinds", "residual-risk", "--model-version", "TBD")
        check("refused: modelVersion TBD -> MODEL_VERSION_MISSING, non-zero exit", r.returncode != 0 and "MODEL_VERSION_MISSING" in r.stderr)
        docs, _, _ = cc.build_documents(data, sha, BASE, ["S1"], ["residual-risk"], "Test analyst (fictional)", cc.plugin_version(), dss.RELEASE)
        bad = copy.deepcopy(docs[0]); bad["modelVersion"] = "TBD"
        resp = dss.submit_assessment(bad, [ttl], proposed)
        check("refused by CRGO too: modelVersion TBD -> MODEL_VERSION_MISSING", resp.get("code") == "MODEL_VERSION_MISSING")
        check("refusals stored nothing", len(Graph().parse(proposed)) == before)

        # 6. report tables: unknown applicability stays an evidence gap; RCSA vs audit conflict is flagged
        nd = os.path.join(crgo, "tests", "samples")
        files = [os.path.join(nd, f) for f in ("nordelle.ttl", "nordelle-applicability.ttl", "nordelle-grca.ttl")]
        if all(os.path.exists(f) for f in files):
            nctx = cc.get_context(cc.crgo_paths(crgo), files, "https://example.org/crgo-sample/nordelle/scenario/ransomware",
                                  "2026-10-11", "https://example.org/crgo-sample/nordelle/org")
            summary = cc.summarize_context(nctx)
            check("conflict: self-assessment vs internal audit shown as a conflict (Nordelle, synthetic)",
                  "CONFLICT (CQ-GRCA-08): self-assessment effective vs internal-audit partly-effective" in summary)
            unk = copy.deepcopy(nctx); unk["candidateObligations"][0]["applicability"] = "unknown"
            row = cc.summarize_context(unk).splitlines()
            line = next(l for l in row if l.startswith("| " + unk["candidateObligations"][0].get("notation", "")))
            check("applicability: unknown shown as evidence gap, never 'not applicable'",
                  "Evidence gap — organizational input required" in line and "Not applicable" not in line)
        else:
            check("Nordelle sample present in the CRGO checkout", False, nd)

        # 7. CRGO 0.10.0 read contracts (brief 0.10.0, section 6), synthetic Nordelle data
        if os.path.isfile(os.path.join(crgo, "pipeline", "contracts", "views.py")):
            read_contracts(cc, crgo, nd, tmp)
        else:
            check("CRGO >= 0.10.0 for compliance/v1 and secops/v1", False, "views.py missing in %s" % crgo)

        # 8. nothing generated inside the repository
        if shutil.which("git") and os.path.isdir(os.path.join(REPO, ".git")):
            st = subprocess.run(["git", "-C", REPO, "status", "--porcelain", "--untracked-files=all"], capture_output=True, text=True).stdout
            leaked = [l for l in st.splitlines() if l.rstrip().endswith((".ttl", ".jsonl", "manifest.json", "-context-S1.json"))]
            check("no generated graph or result files in the repository tree", not leaked, "; ".join(leaked)[:200])
    finally:
        if a.keep:
            print("kept %s" % tmp)
        else:
            shutil.rmtree(tmp, ignore_errors=True)
    print("%d/%d checks passed" % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


if __name__ == "__main__":
    main()
