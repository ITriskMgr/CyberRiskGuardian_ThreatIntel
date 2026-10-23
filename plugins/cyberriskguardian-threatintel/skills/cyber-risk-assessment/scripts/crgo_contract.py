#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""CyberRiskGuardian <-> CRGO bridge: data contract dss/v1 (CRGO >= 0.9.1) and the read contracts compliance/v1 and
secops/v1 (CRGO >= 0.10.0). Pinned tag: v0.10.0.

CRGO (CyberRiskGuardian Ontology) states facts, links and their review status. It never computes risk:
every number written back here comes from this skill's crg_calc.py, run on the exact assessment file.

Subcommands
  graph   ASSESSMENT.json --crgo PATH --base BASE --org-label NAME [--out DIR]
          Convert a CRG assessment (assets/scenario-template.json model) into the organisation's own
          graph with CRGO's pipeline/crg/crg2rdf.py and this skill's crg_calc.py. Writes <name>.ttl and
          <name>.manifest.json (sha256 of the assessment file, base, CRGO release) to DIR
          (default output/crgo/, git-ignored). Bases under https://w3id.org/crgo/ are refused (ADR-008).
  context --crgo PATH --graph FILE.ttl [--graph ...] [--org IRI] --scenario IRI|S1 [--as-of YYYY-MM-DD] [--out FILE] [--summary]
          Read document (crgo_risk_context) for one scenario, validated against
          contracts/dss/v1/risk-context.schema.json. It carries no risk score. --summary prints the report's
          'Legal applicability' and 'Control evidence' tables (unknown applicability stays an evidence gap;
          self-assessment vs independent results that differ are flagged as a conflict).
  submit  --crgo PATH --graph FILE.ttl --assessment ASSESSMENT.json --scenarios S1,S2 --kinds residual-risk,...
          --actor NAME [--model-version 1.4.0] [--it-budget N --currency CAD]
          Run crg_calc.py on the exact assessment file, build one dss/v1 write-back per scenario x kind and
          submit each through CRGO's submit_assessment. Results are stored as PROPOSED in
          <graph>-dss-proposed.ttl next to the graph (same naming as crgo_server.py). A write-back is never an
          approval, a risk acceptance or a funding decision: Management decision required.

  compliance --crgo PATH --graph FILE.ttl [--graph ...] [--org IRI] [--as-of YYYY-MM-DD] [--out FILE] [--summary]
          compliance/v1 read (the function MCP tool crgo_compliance_context wraps): obligations with applicability,
          latest compliance state and evidence status (current / expired / judged-insufficient / none), directive
          versions (review overdue), exceptions (provisions without a regulatory exemption), deadlines (answered or
          not), findings (overdue actions). --summary prints the report's 'Compliance posture' table and the gaps.
          A mapping, statement, acknowledgement or attestation is never reported as compliance.
  secops  same options; secops/v1 read (crgo_secops_context): coverage per scenario (validated only by an effective
          detection test), detection gaps, playbooks (simulation passed), rules and telemetry health, untriaged
          alerts, approval gates, executions without valid approval, open regulatory triage. --summary prints the
          'Detection and response readiness' table. Approval gaps are audit signals: nothing authorises an action.
          Both write the JSON to output/crgo/<org>-<compliance|secops>-<as-of>.json (git-ignored) unless --out is
          given. They need CRGO v0.10.0; on an older checkout they stop with a clear message (exit 4) while graph,
          context and submit keep working with v0.9.1.

Kinds: estimated-risk (est), tolerated-risk (tol), mitigated-risk (mit), residual-risk (res),
risk-to-tolerance-ratio (ratio), budget-target (once per assessment; needs --it-budget/IT_BUDGET and
--currency/CURRENCY), sensitivity-case (lower and higher residual for scenarios listed in SENS_IDS).

On a CRGO error document (e.g. UNKNOWN_ORGANISATION, REFERENCE_NAMESPACE, SCHEMA_INVALID) the code and message are
printed (compliance and secops also print the error document verbatim on stdout) and the script exits 3. It never
retries with altered data. Keep every output with the client's confidential deliverables, never in a repository.

Requires: Python 3.10+, rdflib and jsonschema (CRGO's own requirements: pip install "mcp>=1.2" pyoxigraph rdflib
jsonschema), and the cvss package used by crg_calc.py.
"""
import argparse, datetime, hashlib, importlib.util, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CRG_CALC = os.path.join(HERE, "crg_calc.py")
PLUGIN_JSON = os.path.join(HERE, "..", "..", "..", ".claude-plugin", "plugin.json")
REFERENCE_NS = "https://w3id.org/crgo/"
VANN = "http://purl.org/vocab/vann/preferredNamespaceUri"
MIN_READ_RELEASE = "0.10.0"   # compliance/v1 and secops/v1; dss/v1 needs 0.9.1
PINNED_RELEASE = "0.10.0"
PLACEHOLDER = re.compile(r"^\s*(tbd|unknown|n/?a|todo|-|\?)?\s*$", re.I)

KINDS = {  # assessmentKind -> (crg_calc key, unit)
    "estimated-risk": ("est", "CRG risk units"),
    "tolerated-risk": ("tol", "CRG risk units"),
    "mitigated-risk": ("mit", "CRG risk units"),
    "residual-risk": ("res", "CRG risk units"),
    "risk-to-tolerance-ratio": ("ratio", "ratio"),
    "budget-target": ("budget_target", "currency"),
    "sensitivity-case": ("sensitivity", "CRG risk units"),
}
PARAMS = ("PbA", "Pbx", "De", "Dm", "Th", "Mu")   # crg2rdf names them <base><sid>-<key>


def plugin_version():
    """Version of the plugin actually used: its plugin.json (also found from the project copy under .claude/)."""
    cands = [PLUGIN_JSON]
    d = HERE
    for _ in range(6):
        d = os.path.dirname(d)
        cands.append(os.path.join(d, "plugins", "cyberriskguardian-threatintel", ".claude-plugin", "plugin.json"))
    for c in cands:
        try:
            return json.load(open(c, encoding="utf-8"))["version"]
        except (OSError, ValueError, KeyError):
            continue
    return "1.4.0"


class ContractError(Exception):
    """A dss/v1 error document (CRGO's or an equivalent client-side refusal)."""
    def __init__(self, doc):
        super().__init__(doc.get("message", ""))
        self.doc = doc


def err(code, message, details=None):
    d = {"error": True, "code": code, "message": message}
    if details:
        d["details"] = details
    return d


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def crgo_paths(crgo):
    crgo = os.path.abspath(os.path.expanduser(crgo or os.environ.get("CRGO_HOME", "")))
    p = {"root": crgo, "crg2rdf": os.path.join(crgo, "pipeline", "crg", "crg2rdf.py"),
         "dss": os.path.join(crgo, "pipeline", "contracts", "dss.py"), "schemas": os.path.join(crgo, "contracts", "dss", "v1")}
    if not os.path.isfile(p["dss"]) or not os.path.isfile(p["crg2rdf"]):
        sys.exit("error: %s is not a CRGO checkout (pipeline/contracts/dss.py and pipeline/crg/crg2rdf.py expected). "
                 "Pass --crgo or set CRGO_HOME; pin tag v%s." % (crgo, PINNED_RELEASE))
    if "org-label" not in open(p["crg2rdf"], encoding="utf-8").read():
        sys.exit("error: this CRGO checkout predates 0.9.1 (crg2rdf.py has no --org-label / declared base). Check out tag v0.10.0 (minimum v0.9.1).")
    return p


def crgo_tooling_release(root):
    """Release of the CRGO checkout (tooling), from its CHANGELOG; the ontology release comes from dss.RELEASE."""
    try:
        for line in open(os.path.join(root, "CHANGELOG.md"), encoding="utf-8"):
            m = re.match(r"## \[(\d+\.\d+\.\d+)\]", line)
            if m:
                return m.group(1)
    except OSError:
        pass
    return None


def import_dss(p):
    sys.path.insert(0, os.path.dirname(p["dss"]))
    import dss  # noqa: E402  (CRGO's own module, imported by path)
    return dss


def check_base(base):
    if base.startswith(REFERENCE_NS):
        raise ContractError(err("REFERENCE_NAMESPACE", "Organisation data must use the organisation's own base, never %s (ADR-008)." % REFERENCE_NS))
    if not re.match(r"^(https?://|urn:)", base):
        sys.exit("error: --base must be an http(s) or urn: namespace the organisation controls (e.g. https://example.org/<org>/ for tests).")
    if not base.endswith(("/", "#", ":")):
        sys.exit("error: --base must end with '/' (or '#'), e.g. https://example.org/crgo-sample/medibec/")


def guard_out_dir(d, crgo_root):
    """Client data stays out of both repositories: refuse CRGO's tree and tracked (non-ignored) repository paths."""
    d = os.path.abspath(d)
    if d == crgo_root or d.startswith(crgo_root + os.sep):
        sys.exit("error: %s is inside the CRGO checkout. Keep organisation graphs with the client's deliverables." % d)
    probe = d
    while not os.path.isdir(probe):
        probe = os.path.dirname(probe)
    try:
        top = subprocess.run(["git", "-C", probe, "rev-parse", "--show-toplevel"], capture_output=True, text=True)
        if top.returncode == 0:
            ign = subprocess.run(["git", "-C", top.stdout.strip(), "check-ignore", "-q", os.path.join(d, "x.ttl")])
            if ign.returncode != 0:
                sys.exit("error: %s is inside a git repository and not git-ignored. Use output/crgo/ (ignored) or a folder "
                         "outside any repository." % d)
    except FileNotFoundError:
        pass


def graph_bases(graph_files):
    from rdflib import Graph, URIRef
    bases = set()
    for f in graph_files:
        bases |= {str(o) for o in Graph().parse(f).objects(None, URIRef(VANN))}
    return bases


def graph_base(graph_file):
    bases = graph_bases([graph_file])
    if len(bases) != 1:
        sys.exit("error: %s must declare exactly one organisation base (vann:preferredNamespaceUri); found %s. "
                 "Rebuild it with 'graph' (CRGO >= 0.9.1)." % (graph_file, sorted(bases) or "none"))
    return bases.pop(), None


def proposed_file(graph_file):
    """Same naming as CRGO's crgo_server.crgo_submit_assessment."""
    return os.path.join(os.path.dirname(os.path.abspath(graph_file)),
                        os.path.splitext(os.path.basename(graph_file))[0].split("-")[0] + "-dss-proposed.ttl")


def emit_error(doc, code_exit=3):
    print("CRGO contract error %s: %s" % (doc.get("code"), doc.get("message")), file=sys.stderr)
    for d in doc.get("details", []) or []:
        print("  - %s" % d, file=sys.stderr)
    print("Stopped. Show this message to the analyst; do not retry with altered data.", file=sys.stderr)
    sys.exit(code_exit)


# --------------------------------------------------------------------------- graph
def cmd_graph(a):
    p = crgo_paths(a.crgo)
    check_base(a.base)
    out_dir = a.out or os.path.join("output", "crgo")
    guard_out_dir(out_dir, p["root"])
    os.makedirs(out_dir, exist_ok=True)
    # no hyphen in the stem: CRGO names the proposed graph after the stem's first hyphen-separated part
    name = a.name or re.sub(r"[^a-z0-9_]+", "_", (a.org_label or os.path.splitext(os.path.basename(a.assessment))[0]).lower()).strip("_")
    ttl = os.path.join(out_dir, name + ".ttl")
    r = subprocess.run([sys.executable, p["crg2rdf"], a.assessment, "--crg-calc", CRG_CALC, "--base", a.base,
                        "--org-label", a.org_label, "--out", ttl], capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr)
        sys.exit("error: crg2rdf.py failed (exit %d)." % r.returncode)
    print(r.stdout.strip())
    dss = import_dss(p)
    manifest = {"assessment": os.path.abspath(a.assessment), "assessmentSha256": sha256_file(a.assessment),
                "base": a.base, "organizationId": a.base + "org", "orgLabel": a.org_label, "graph": os.path.abspath(ttl),
                "proposedGraph": proposed_file(ttl), "crgoPath": p["root"], "crgoRelease": crgo_tooling_release(p["root"]),
                "ontologyRelease": dss.RELEASE, "crgCalc": CRG_CALC, "producer": "CyberRiskGuardian %s" % plugin_version(),
                "createdAt": now()}
    json.dump(manifest, open(os.path.join(out_dir, name + ".manifest.json"), "w", encoding="utf-8"), indent=1)
    print("graph %s\norganisation %s\nCRGO %s (ontology release %s)" % (ttl, manifest["organizationId"], manifest["crgoRelease"], dss.RELEASE))
    print("Confidential: keep these files with the client's deliverables, never in either repository.")


def now():
    return datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


# --------------------------------------------------------------------------- context
def scenario_iri(base, s):
    return s if re.match(r"^(https?://|urn:)", s) else base + "scenario-" + s


def get_context(p, graph_files, scenario, as_of, org=None):
    dss = import_dss(p)
    graph_files = [graph_files] if isinstance(graph_files, str) else list(graph_files)
    bases = graph_bases(graph_files)
    if org:
        base = next((b for b in sorted(bases, key=len, reverse=True) if org.startswith(b)), None)
        if base is None:
            raise ContractError(err("UNKNOWN_ORGANISATION", "No graph file declares a base for %s." % org))
    elif len(bases) == 1:
        base = next(iter(bases)); org = base + "org"
    else:
        sys.exit("error: the graph files declare %d bases %s; pass --org." % (len(bases), sorted(bases)))
    doc = dss.risk_context([os.path.abspath(f) for f in graph_files], org, scenario_iri(base, scenario), as_of)
    if doc.get("error"):
        raise ContractError(doc)
    errs = dss.validate_doc(doc, "risk-context.schema.json")
    if errs:
        raise ContractError(err("SCHEMA_INVALID", "CRGO returned a risk context that does not conform to dss/v1.", errs))
    return doc


APPLICABILITY_TEXT = {
    "applicable": "Applicable (CRGO evaluation over the profile; not legal advice)",
    "not-applicable": "Not applicable (CRGO evaluation over the profile; not legal advice)",
    "potentially-applicable": "Potentially applicable: qualified review required",
    "unknown": "Unknown: Information gap — organizational validation required",
    "not-assessed": "Not assessed: Information gap — organizational validation required",
}
INDEPENDENT = ("second-line", "internal-audit", "external")


def control_conflicts(link):
    """Self-assessment result differing from an independent line's result (CQ-GRCA-08): show both, flag the conflict."""
    rows = {a["line"]: a for a in link.get("latestAssessments", [])}
    self_ = rows.get("self-assessment")
    if not self_:
        return []
    return [(self_, rows[l]) for l in INDEPENDENT if l in rows and rows[l]["result"] != self_["result"]]


def summarize_context(doc):
    """Markdown tables for the report: Legal applicability and Control evidence (with assessor line)."""
    out = ["Risk context for %s as of %s (CRGO ontology release %s; dss/v1). Knowledge status: %s. No risk score."
           % (doc["scenario"]["label"], doc["asOf"], doc["ontologyRelease"], doc["scenario"]["knowledgeStatus"]), "",
           "Legal applicability", "", "| Provision | Instrument | Applicability | Unresolved conditions | Compliance state | Evidence gap |",
           "|---|---|---|---|---|---|"]
    obs = doc.get("candidateObligations", [])
    for o in obs:
        comp = o.get("complianceState", "not determined")
        if comp == "satisfied":
            comp = "satisfied (a recorded determination; a mapped control alone supports, never proves, compliance)"
        out.append("| %s | %s | %s | %s | %s | %s |" % (o.get("notation", o["id"]), o.get("instrument", "").rsplit("/", 1)[-1] or "-",
                   APPLICABILITY_TEXT.get(o["applicability"], o["applicability"]),
                   ", ".join(c.rsplit("/", 1)[-1] for c in o.get("unresolvedConditions", [])) or "-", comp,
                   o.get("evidenceGap", "-")))
    if not obs:
        out.append("| none linked | - | No obligation is linked to this scenario in the organisation graph: Information gap — organizational validation required (this is not 'not applicable') | - | - | - |")
    out += ["", "Control evidence", "", "| Control | Status | Control evidence (result · assessor line · aspect · date) | Open findings | Conflict |",
            "|---|---|---|---|---|"]
    for c in doc.get("controlLinks", []):
        ev = "; ".join("%s · %s · %s · %s" % (a["result"], a["line"], a.get("aspect", "aspect not stated"), a["assessedOn"])
                       for a in c.get("latestAssessments", [])) or "no assessment recorded: Information gap — organizational validation required"
        lines = {a["line"] for a in c.get("latestAssessments", [])}
        if lines and not lines & set(INDEPENDENT):
            ev += " (%s: lower-grade evidence, no independent result)" % (
                "self-assessment only" if lines == {"self-assessment"} else "assessor line not stated or self-assessment")
        conf = control_conflicts(c)
        flag = "; ".join("CONFLICT (CQ-GRCA-08): self-assessment %s vs %s %s; rely on the independent result"
                         % (s["result"], i["line"], i["result"]) for s, i in conf) or "-"
        out.append("| %s | %s | %s | %s | %s |" % (c["label"], c.get("controlStatus", "-"), ev,
                   len(c.get("openFindings", [])) or "-", flag))
    out += ["", "Caveats: " + " ".join(doc.get("caveats", []))]
    return "\n".join(out)


def cmd_context(a):
    p = crgo_paths(a.crgo)
    try:
        doc = get_context(p, a.graph, a.scenario, a.as_of, a.org)
    except ContractError as e:
        emit_error(e.doc)
    text = json.dumps(doc, indent=1, ensure_ascii=False)
    if a.out:
        guard_out_dir(os.path.dirname(os.path.abspath(a.out)), p["root"])
        open(a.out, "w", encoding="utf-8").write(text + "\n")
        print("risk context (schema-valid) -> %s" % a.out)
        s = doc["scenario"]
        print("scenario %s | assets %d | obligations %d | control links %d | estimates %d | ontology release %s"
              % (s["label"], len(doc["relatedAssets"]), len(doc["candidateObligations"]), len(doc["controlLinks"]),
                 len(doc["estimates"]), doc["ontologyRelease"]))
    elif not a.summary:
        print(text)
    if a.summary:
        print(summarize_context(doc))


# --------------------------------------------------------------------------- compliance / secops (CRGO >= 0.10.0)
READ_CONTRACTS = {  # subcommand -> (contract, views function = what the MCP tool wraps, MCP tool name)
    "compliance": ("compliance/v1", "compliance_context", "crgo_compliance_context"),
    "secops": ("secops/v1", "secops_context", "crgo_secops_context"),
}


def import_views(p, contract):
    """CRGO's pipeline/contracts/views.py (0.10.0+): the functions crgo_compliance_context / crgo_secops_context wrap.
    An older checkout fails here with a clear message; the dss/v1 commands keep working with v0.9.1."""
    fn = READ_CONTRACTS[contract][1]
    path = os.path.join(p["root"], "pipeline", "contracts", "views.py")
    schema = os.path.join(p["root"], "contracts", READ_CONTRACTS[contract][0])
    rel = crgo_tooling_release(p["root"]) or "unknown"
    if not os.path.isfile(path) or not os.path.isdir(schema):
        print("error: '%s' reads contract %s, which needs CRGO v%s or later (tool %s). This checkout is CRGO %s. "
              "Check out tag v%s; graph, context and submit (dss/v1) still work with v0.9.1."
              % (contract, READ_CONTRACTS[contract][0], MIN_READ_RELEASE, READ_CONTRACTS[contract][2], rel, MIN_READ_RELEASE), file=sys.stderr)
        sys.exit(4)
    import_dss(p)
    sys.path.insert(0, os.path.dirname(path))
    import views  # noqa: E402  (CRGO's own module, imported by path)
    if not hasattr(views, fn):
        print("error: CRGO %s has no %s (contract %s); check out tag v%s." % (rel, fn, READ_CONTRACTS[contract][0], MIN_READ_RELEASE), file=sys.stderr)
        sys.exit(4)
    return views


def resolve_org(graph_files, org=None):
    """Organisation IRI: --org as given (CRGO itself answers UNKNOWN_ORGANISATION / REFERENCE_NAMESPACE), else <base>org."""
    if org:
        return org
    bases = graph_bases(graph_files)
    if len(bases) != 1:
        sys.exit("error: the graph files declare %d organisation bases %s; pass --org." % (len(bases), sorted(bases) or "none"))
    return next(iter(bases)) + "org"


def get_read_context(p, contract, graph_files, as_of, org=None):
    """Call the compliance/v1 or secops/v1 read through CRGO's own function (same parameters as the MCP tool:
    org_graph_files, organization, as_of). Returns (doc, labels); raises ContractError with CRGO's error document
    verbatim. Never retried."""
    views = import_views(p, contract)
    dss = import_dss(p)
    graph_files = [graph_files] if isinstance(graph_files, str) else list(graph_files)
    files = [os.path.abspath(f) for f in graph_files]
    missing = [f for f in files if not os.path.exists(f)]
    if missing:
        sys.exit("error: organisation graph file(s) not found: %s" % missing)
    organization = resolve_org(files, org)
    g = dss.load(files)
    doc = getattr(views, READ_CONTRACTS[contract][1])(files, organization, as_of, g=g)
    if doc.get("error"):
        raise ContractError(doc)
    errs = views.validate(doc, READ_CONTRACTS[contract][0])
    if errs:
        raise ContractError(err("SCHEMA_INVALID", "CRGO returned a document that does not conform to %s." % READ_CONTRACTS[contract][0], errs))
    return doc, label_map(g, doc)


def label_map(g, doc):
    """Readable names for the IRIs the (tenant-filtered) document carries: skos:notation for legal provisions,
    otherwise the English rdfs:label. Only IRIs already in the document are looked up."""
    from rdflib import URIRef
    from rdflib.namespace import RDFS, SKOS
    iris = set(re.findall(r'"((?:https?://|urn:)[^"]+)"', json.dumps(doc)))
    out = {}
    for i in iris:
        s = URIRef(i)
        n = next(iter(g.objects(s, SKOS.notation)), None)
        if n is not None and "/vocab/" in i:
            out[i] = str(n); continue
        lab = next((str(l) for l in g.objects(s, RDFS.label) if getattr(l, "language", None) in ("en", None)), None)
        if lab:
            out[i] = lab
    return out


def _name(i, labels):
    return labels.get(i) or i.rstrip("/").rsplit("/", 1)[-1]


def _when(ts):
    return ts.replace("T00:00:00", "") if ts else "-"


def _deadline(d, labels):
    """Deadline name with its computed due time (not repeated when the label already states it)."""
    n, due = _name(d["id"], labels), _when(d.get("due"))
    return n if due != "-" and due[:10] in n else "%s, due %s" % (n, due)


STATE_TEXT = {"satisfied": "satisfied", "partially-satisfied": "partially satisfied", "unsatisfied": "unsatisfied",
              "not-assessed": "not assessed", "undetermined": "undetermined"}
EVIDENCE_TEXT = {"current": "current", "expired": "EXPIRED: evidence gap, not support",
                 "judged-insufficient": "JUDGED INSUFFICIENT: evidence gap, not support", "none": "none recorded: evidence gap"}


def compliance_gaps(doc, labels=None):
    """Gaps CRG reports from compliance/v1 (never as compliance): one (obligation-or-record, text) per gap."""
    labels = labels or {}
    gaps, asof = [], doc["asOf"]
    for o in doc["obligations"]:
        n = _name(o["id"], labels)
        st, ev = o["complianceState"], o["evidenceStatus"]
        if st in ("satisfied", "partially-satisfied") and ev != "current":
            gaps.append((o["id"], "%s: recorded as %s on evidence %s; reported as a gap, not as compliance"
                         % (n, STATE_TEXT[st], ev.replace("-", " "))))
        elif st in ("partially-satisfied", "unsatisfied"):
            gaps.append((o["id"], "%s: %s (determination of %s)" % (n, STATE_TEXT[st], o.get("determinedOn", "?"))))
        elif st in ("not-assessed", "undetermined"):
            gaps.append((o["id"], "%s: compliance %s: Information gap — organizational validation required" % (n, STATE_TEXT[st])))
        if o["applicability"] in ("unknown", "not-assessed"):
            gaps.append((o["id"], "%s: applicability %s: Information gap — organizational validation required" % (n, o["applicability"].replace("-", " "))))
        elif o["applicability"] == "potentially-applicable":
            gaps.append((o["id"], "%s: potentially applicable: qualified review required" % n))
    for e in doc["exceptions"]:
        if e.get("active") and e.get("provisionsWithoutExemption"):
            gaps.append((e["id"], "exception %s concerns %s without a regulatory exemption: compliance exposure (an internal exception cannot waive a law)"
                         % (_name(e["id"], labels), ", ".join(_name(x, labels) for x in e["provisionsWithoutExemption"]))))
    for d in doc["deadlines"]:
        if not d["answered"] and d.get("due") and d["due"][:10] <= asof:
            gaps.append((d["id"], "deadline %s (%s) is unanswered" % (_deadline(d, labels), ", ".join(_name(x, labels) for x in d["deadlineFor"]))))
    for v in doc["directiveVersions"]:
        if v.get("reviewOverdue"):
            gaps.append((v["id"], "%s version %s: review overdue (due %s)" % (_name(v["directive"], labels), v.get("versionLabel", "?"), v.get("reviewDueOn", "?"))))
    for f in doc["findings"]:
        if f["open"] and f["overdueActions"]:
            gaps.append((f["id"], "%s %s open with overdue action(s) %s: weak control operation"
                         % (f["kind"].replace("-", " "), _name(f["id"], labels), ", ".join(_name(x, labels) for x in f["overdueActions"]))))
    return gaps


def summarize_compliance(doc, labels=None):
    """The report's 'Compliance posture' table, then the gaps. A mapping, statement, acknowledgement or attestation
    never makes a row compliant: the state column is the latest recorded determination, qualified by its evidence."""
    labels = labels or {}
    asof = doc["asOf"]
    out = ["Compliance posture as of %s (CRGO ontology release %s; compliance/v1, read only). States are the organisation's "
           "latest recorded determinations; a mapping, policy statement, acknowledgement or attestation is never compliance."
           % (asof, doc["ontologyRelease"]), "",
           "| Obligation | Applicability | State | Evidence status | Exceptions without exemption | Next deadline |",
           "|---|---|---|---|---|---|"]
    for o in doc["obligations"]:
        st = STATE_TEXT[o["complianceState"]]
        if o.get("determinedOn"):
            st += " (determination %s)" % o["determinedOn"]
        if o["complianceState"] in ("satisfied", "partially-satisfied") and o["evidenceStatus"] != "current":
            st += ": GAP, not compliance"
        elif o["complianceState"] in ("partially-satisfied", "unsatisfied"):
            st += ": GAP"
        app = {"potentially-applicable": "potentially applicable: qualified review required",
               "unknown": "unknown: Information gap — organizational validation required",
               "not-assessed": "not assessed: Information gap — organizational validation required"}.get(o["applicability"], o["applicability"].replace("-", " "))
        exc = [_name(e["id"], labels) for e in doc["exceptions"] if e.get("active") and o["id"] in e.get("provisionsWithoutExemption", [])]
        dls = sorted((d for d in doc["deadlines"] if o["id"] in d["deadlineFor"] and not d["answered"]), key=lambda d: d.get("due") or "9999")
        if dls:
            d = dls[0]
            nd = "%s, unanswered%s" % (_deadline(d, labels), " (OVERDUE)" if d.get("due") and d["due"][:10] <= asof else "")
        else:
            nd = "-"
        out.append("| %s | %s | %s | %s | %s | %s |" % (_name(o["id"], labels), app, st, EVIDENCE_TEXT[o["evidenceStatus"]],
                                                       "; ".join(exc) or "-", nd))
    if not doc["obligations"]:
        out.append("| none recorded | - | - | - | - | No obligation in the organisation graph: Information gap — organizational validation required |")
    other = [d for d in doc["deadlines"] if not any(o["id"] in d["deadlineFor"] for o in doc["obligations"]) and not d["answered"]]
    if other:
        out += ["", "Other open deadlines: " + "; ".join(_deadline(d, labels) for d in other)]
    out += ["", "Gaps (report as gaps, never as compliance):"] + ["- " + t for _, t in compliance_gaps(doc, labels)]
    out += ["", "Caveats: " + " ".join(doc.get("caveats", []))]
    return "\n".join(out)


APPROVAL_TEXT = {"absent": "no approval recorded", "expired": "approval or pre-authorisation had expired", "revoked": "approval revoked",
                 "not-yet-valid": "approval not yet valid", "wrong-authority": "approver lacks the gate's authority",
                 "not-corresponding": "approval does not correspond to this execution", "not-granted": "approval not granted"}


def secops_gaps(doc, labels=None):
    """Evidence CRG takes from secops/v1 for detective and response controls (steps 8-9): one (record, text) per item."""
    labels = labels or {}
    gaps = []
    for s in doc["scenarios"]:
        n = _name(s["id"], labels)
        if not s["coverage"]:
            gaps.append((s["id"], "%s: no detection coverage recorded" % n))
        for c in s["coverage"]:
            if not c["validatedByTest"]:
                gaps.append((s["id"], "%s: coverage %s, not validated by an effective detection test (%s)" % (n, c["status"], ", ".join(c.get("techniques", [])) or "-")))
        for gp in s["detectionGaps"]:
            gaps.append((s["id"], "%s: detection gap %s" % (n, _name(gp, labels))))
        for pb in s["playbooks"]:
            if not pb["simulationPassed"]:
                gaps.append((s["id"], "%s: playbook %s has not passed a simulation" % (n, _name(pb["id"], labels))))
    for r in doc["detectionRules"]:
        bad = [x for x in r["requiredSources"] if x["health"] in ("silent", "degraded", "unknown")]
        if bad and r["status"] in ("enabled", "testing", "approved"):
            gaps.append((r["id"], "rule %s (%s) needs telemetry %s: %s" % (_name(r["id"], labels), r["status"],
                         ", ".join("%s %s" % (_name(x["id"], labels), x["health"]) for x in bad),
                         "a rule needing silent telemetry does not detect" if any(x["health"] == "silent" for x in bad) else "detection weakened")))
    for a in doc["untriagedAlerts"]:
        gaps.append((a["id"], "untriaged alert %s%s (an alert is not an incident)" % (_name(a["id"], labels), " on a CROWN JEWEL" if a["crownJewel"] else "")))
    for x in doc["executionsWithoutValidApproval"]:
        gaps.append((x["id"], "execution %s of %s: %s (%s). Audit signal only: CRGO neither authorises nor condemns the action; "
                     "Management decision required" % (_name(x["id"], labels), _name(x["action"], labels), x["reason"], APPROVAL_TEXT.get(x["reason"], x["reason"]))))
    for t in doc["openRegulatoryTriage"]:
        gaps.append((t["incident"], "incident %s: reportability %s: qualified review required (pending obligation)" % (_name(t["incident"], labels), t["reason"])))
    return gaps


def summarize_secops(doc, labels=None):
    """The report's 'Detection and response readiness' table, then the evidence items (audit signals, not authorisations)."""
    labels = labels or {}
    out = ["Detection and response readiness as of %s (CRGO ontology release %s; secops/v1, read only). Coverage is validated "
           "only by an effective detection test. Nothing here authorises a response action." % (doc["asOf"], doc["ontologyRelease"]), "",
           "| Scenario | Coverage validated | Gaps | Playbook simulated |", "|---|---|---|---|"]
    for s in doc["scenarios"]:
        cov = "; ".join(("yes: validated by an effective detection test (%s)" if c["validatedByTest"] else
                         "no: " + c["status"] + ", no effective detection test (%s)") % (", ".join(c.get("techniques", [])) or "-")
                        for c in s["coverage"]) or "no coverage recorded: Information gap — organizational validation required"
        gaps = "; ".join(_name(g, labels) for g in s["detectionGaps"]) or "-"
        pbs = "; ".join("%s: %s" % (_name(p["id"], labels), "yes, passed" if p["simulationPassed"] else "NO, not passed")
                        for p in s["playbooks"]) or "no playbook recorded"
        out.append("| %s | %s | %s | %s |" % (_name(s["id"], labels), cov, gaps, pbs))
    if not doc["scenarios"]:
        out.append("| none recorded | - | - | No scenario in the organisation graph: Information gap — organizational validation required |")
    out += ["", "Evidence for detective and response controls (audit signals, not authorisations; no incident inferred from an alert):"]
    out += ["- " + t for _, t in secops_gaps(doc, labels)]
    out += ["", "Caveats: " + " ".join(doc.get("caveats", []))]
    return "\n".join(out)


def read_out_path(contract, graph_files, as_of):
    stem = os.path.splitext(os.path.basename(graph_files[0]))[0].split("-")[0]
    return os.path.join("output", "crgo", "%s-%s-%s.json" % (stem, contract, re.sub(r"[^0-9A-Za-z-]", "_", as_of)))


def cmd_read(a):
    p = crgo_paths(a.crgo)
    try:
        doc, labels = get_read_context(p, a.cmd, a.graph, a.as_of, a.org)
    except ContractError as e:
        print(json.dumps(e.doc, ensure_ascii=False))  # verbatim error document, never retried
        emit_error(e.doc)
    out = a.out or read_out_path(a.cmd, a.graph, a.as_of)
    guard_out_dir(os.path.dirname(os.path.abspath(out)), p["root"])
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    open(out, "w", encoding="utf-8").write(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
    print("%s context (schema-valid %s, ontology release %s, as of %s) -> %s"
          % (a.cmd, doc["contract"], doc["ontologyRelease"], doc["asOf"], out))
    if a.summary:
        print(summarize_compliance(doc, labels) if a.cmd == "compliance" else summarize_secops(doc, labels))


# --------------------------------------------------------------------------- submit
def inputs_for(base, sid, key, case=None):
    """IRIs of the records a quantity was computed from, exactly as crg2rdf.py names them."""
    ins = [base + "%s-%s" % (sid, k) for k in PARAMS] + [base + "%s-cvss" % sid]
    if key in ("mit", "res", "ratio", "sensitivity"):
        ins += [base + "%s-red_p" % sid, base + "%s-red_i" % sid]
    if key in ("tol", "ratio"):
        ins.append(base + "appetite")
    if case:
        ins.append(base + "case-%s-%s" % (sid, case))
    return ins


def build_documents(data, assessment_sha, base, scenarios, kinds, actor, model_version, ontology_release,
                    computed_at=None, status="proposed", it_budget=None, currency=None, calc=None):
    """One dss/v1 write-back per scenario x kind, values from crg_calc.run on the exact assessment data."""
    if PLACEHOLDER.match(model_version or ""):
        raise ContractError(err("MODEL_VERSION_MISSING", "modelVersion must be the CyberRiskGuardian version actually used, "
                                "not a placeholder (%r)." % model_version))
    calc = calc or load_module("crg_calc", CRG_CALC)
    run = calc.run(data)
    res = {r["id"]: r for r in run["results"]}
    unknown = [s for s in scenarios if s not in res]
    if unknown:
        sys.exit("error: scenario(s) %s not in the assessment." % ", ".join(unknown))
    computed_at = computed_at or now()
    org = base + "org"
    note_base = "crg_calc.py, appetite %.2f, factor %s" % (run["appetite"], format(run["factor"], "g"))

    def doc(subject, kind, value, unit, inputs, note, currency_code=None):
        d = {"schemaVersion": "1.0", "contract": "dss/v1", "organizationId": org, "subjectId": subject,
             "assessmentKind": kind, "modelId": "CyberRiskGuardian", "modelVersion": model_version,
             "computedAt": computed_at, "inputs": inputs, "inputDocumentSha256": assessment_sha,
             "ontologyRelease": ontology_release, "result": {"value": round(float(value), 6), "unit": unit, "note": note},
             "status": status, "provenance": {"producer": "CyberRiskGuardian", "tool": "crg_calc.py", "actor": actor}}
        if currency_code:
            d["result"]["currency"] = currency_code
        return d

    docs, skipped = [], []
    for kind in kinds:
        key, unit = KINDS[kind]
        if key == "budget_target":
            it = it_budget if it_budget is not None else data.get("IT_BUDGET")
            cur = currency or data.get("CURRENCY")
            if it is None or not cur:
                skipped.append("budget-target: needs the total IT budget (--it-budget or IT_BUDGET) and an ISO 4217 currency (--currency or CURRENCY)")
                continue
            pct = calc.budget_target(run["appetite"])
            docs.append(doc(base + "assessment", kind, pct * float(it), "currency", [base + "appetite"],
                            "budget_target: %.1f%% of total IT budget %s at appetite %.2f (guideline 4%%/7.8%%/12%%)"
                            % (pct * 100, format(float(it), ",.0f"), run["appetite"]), cur.upper()))
            continue
        for sid in scenarios:
            subj = base + "scenario-" + sid
            if key == "sensitivity":
                if sid not in data.get("SENS_IDS", []):
                    skipped.append("sensitivity-case %s: not listed in SENS_IDS, so the graph has no case records" % sid)
                    continue
                s = next(x for x in data["SCEN"] if x["id"] == sid)
                for d_, case in ((-0.10, "lower"), (0.10, "higher")):
                    r = calc.calc(calc.shift(s, d_), run["appetite"], run["factor"])
                    docs.append(doc(subj, kind, r["res"], unit, inputs_for(base, sid, key, case),
                                    "sensitivity case %s (%+.2f convention): residual risk; ratio %.2f, %s; %s"
                                    % (case, d_, r["ratio"], calc.classify(r["ratio"]), note_base)))
                continue
            r = res[sid]
            note = note_base + ("; %s" % r["cls"] if key == "ratio" else "")
            docs.append(doc(subj, kind, r[key], unit, inputs_for(base, sid, key), note))
    return docs, skipped, run


def cmd_submit(a):
    p = crgo_paths(a.crgo)
    dss = import_dss(p)
    base, _ = graph_base(a.graph)
    if a.base and a.base != base:
        sys.exit("error: --base %s differs from the base the graph declares (%s)." % (a.base, base))
    kinds = [k.strip() for k in a.kinds.split(",") if k.strip()]
    bad = [k for k in kinds if k not in KINDS]
    if bad:
        sys.exit("error: unknown kind(s) %s; allowed: %s" % (bad, ", ".join(KINDS)))
    data = json.load(open(a.assessment, encoding="utf-8"))
    scenarios = [s["id"] for s in data["SCEN"]] if a.scenarios.strip().lower() == "all" else [s.strip() for s in a.scenarios.split(",") if s.strip()]
    sha = sha256_file(a.assessment)
    manifest = os.path.splitext(a.graph)[0] + ".manifest.json"
    if os.path.exists(manifest):
        m = json.load(open(manifest, encoding="utf-8"))
        if m.get("assessmentSha256") != sha:
            sys.exit("error: %s was built from a different assessment file (sha256 %s, this file %s). Rebuild the graph with "
                     "'graph' from the file you are submitting." % (a.graph, m.get("assessmentSha256", "?")[:12], sha[:12]))
    else:
        print("warning: no manifest next to the graph; cannot confirm it was built from this assessment file.", file=sys.stderr)
    try:
        docs, skipped, run = build_documents(data, sha, base, scenarios, kinds, a.actor, a.model_version, dss.RELEASE,
                                             a.computed_at, a.status, a.it_budget, a.currency)
    except ContractError as e:
        emit_error(e.doc)
    for s in skipped:
        print("skipped %s" % s, file=sys.stderr)
    if not docs:
        sys.exit("error: nothing to submit.")
    # validate every document before storing any, so a schema failure stores nothing
    for d in docs:
        errs = dss.validate_doc(d, "assessment-result.schema.json")
        if errs and a.status == "proposed":
            emit_error(err("SCHEMA_INVALID", "Write-back for %s / %s does not conform to dss/v1." % (d["subjectId"], d["assessmentKind"]), errs))
    out = proposed_file(a.graph)
    log = os.path.splitext(out)[0] + "-submissions.jsonl"
    stored = []
    for d in docs:
        r = dss.submit_assessment(d, [os.path.abspath(a.graph)], out)
        with open(log, "a", encoding="utf-8") as f:
            f.write(json.dumps({"document": d, "response": r}, ensure_ascii=False) + "\n")
        if r.get("error"):
            if stored:
                print("%d result(s) were stored as proposed before this error." % len(stored), file=sys.stderr)
            emit_error(r)
        stored.append(r["stored"])
        print("%-26s %-8s %14s %-15s -> %s (proposed)" % (d["assessmentKind"], d["subjectId"].rsplit("scenario-", 1)[-1] if "scenario-" in d["subjectId"] else "portfolio",
                                                       format(d["result"]["value"], ",.2f"), d["result"]["unit"], r["stored"]))
    print("%d write-back(s) stored as PROPOSED in %s (ontology release %s, model CyberRiskGuardian %s)."
          % (len(stored), out, dss.RELEASE, a.model_version))
    print("A write-back is not an approval, a risk acceptance or a funding decision. Management decision required.")


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    crgo_help = "CRGO checkout (tag v0.10.0; dss/v1 commands work from v0.9.1); default $CRGO_HOME"

    g = sub.add_parser("graph", help="assessment JSON -> organisation graph (crg2rdf.py)")
    g.add_argument("assessment"); g.add_argument("--crgo", help=crgo_help); g.add_argument("--base", required=True)
    g.add_argument("--org-label", required=True); g.add_argument("--out", help="output folder (default output/crgo/)")
    g.add_argument("--name", help="file stem (default: slug of --org-label, no hyphens)")
    g.set_defaults(fn=cmd_graph)

    c = sub.add_parser("context", help="crgo_risk_context for one scenario (read)")
    c.add_argument("--crgo", help=crgo_help)
    c.add_argument("--graph", required=True, action="append", help="organisation graph file (repeat for profile, applicability or assurance files)")
    c.add_argument("--org", help="organisation IRI (default <base>org)")
    c.add_argument("--scenario", required=True, help="scenario IRI or CRG id such as S1")
    c.add_argument("--as-of", default=datetime.date.today().isoformat()); c.add_argument("--out")
    c.add_argument("--summary", action="store_true", help="print the Legal applicability and Control evidence tables")
    c.set_defaults(fn=cmd_context)

    s = sub.add_parser("submit", help="crgo_submit_assessment for computed results (write-back, proposed)")
    s.add_argument("--crgo", help=crgo_help); s.add_argument("--graph", required=True); s.add_argument("--assessment", required=True)
    s.add_argument("--base", help="organisation base; must equal the base the graph declares")
    s.add_argument("--scenarios", required=True, help="comma-separated CRG ids, or 'all'")
    s.add_argument("--kinds", default="residual-risk", help="comma-separated: " + ", ".join(KINDS))
    s.add_argument("--actor", required=True, help="analyst or service account that ran the calculation")
    s.add_argument("--model-version", default=plugin_version(), help="CyberRiskGuardian version actually used (default: this plugin's)")
    s.add_argument("--computed-at", help="ISO 8601 UTC time (default now)")
    s.add_argument("--it-budget", type=float, help="total IT budget incl. salaries, for budget-target")
    s.add_argument("--currency", help="ISO 4217 code, for budget-target")
    s.add_argument("--status", default="proposed", help=argparse.SUPPRESS)  # testing only: CRGO accepts nothing but 'proposed'
    s.set_defaults(fn=cmd_submit)

    for name, helptext in (("compliance", "crgo_compliance_context: obligations, evidence status, exceptions, deadlines, findings (read; CRGO >= 0.10.0)"),
                           ("secops", "crgo_secops_context: coverage, gaps, telemetry, playbooks, approval gaps, regulatory triage (read; CRGO >= 0.10.0)")):
        r = sub.add_parser(name, help=helptext)
        r.add_argument("--crgo", help=crgo_help)
        r.add_argument("--graph", required=True, action="append", help="organisation graph file (repeat for each file of the organisation)")
        r.add_argument("--org", help="organisation IRI (default <base>org)")
        r.add_argument("--as-of", default=datetime.date.today().isoformat(), help="assessment date yyyy-mm-dd; later records are ignored")
        r.add_argument("--out", help="JSON output (default output/crgo/<org>-%s-<as-of>.json, git-ignored)" % name)
        r.add_argument("--summary", action="store_true", help="print the '%s' table" % ("Compliance posture" if name == "compliance" else "Detection and response readiness"))
        r.set_defaults(fn=cmd_read)

    a = ap.parse_args(argv)
    try:
        a.fn(a)
    except ContractError as e:
        emit_error(e.doc)


if __name__ == "__main__":
    main()
