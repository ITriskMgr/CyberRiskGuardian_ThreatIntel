#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""crgo_bridge.py — the organisation graph of a workspace, for the CRGO dss/v1 contract (1.5.8).

Run by the helper (serve.py) with the SAME Python interpreter that runs the ontology's MCP server, because
it imports CRGO's own code (rdflib): CRGO's bridge pipeline/crg/crg2rdf.py converts the assessment, and
CRGO's evaluator pipeline/grc/applicability.py assesses legal applicability. Nothing is re-implemented
here except the translation of the application's own records (control tests, findings, compliance
determinations, the organisation profile) into CRGO terms, so that crgo_risk_context can read them back.

  graph         IN=request.json  → <dir>/org.ttl (crg2rdf, with engine/crg_calc.py) and <dir>/orgfacts.ttl
  applicability IN=request.json  → the evaluator's states for the profile at a date (also kept in orgfacts.ttl)

The request (JSON on stdin) carries: crgo (CRGO folder), dir (the workspace's confidential folder), base,
label, assessment (the crg_calc JSON), facts (profile, controlTests, findings, determinations, obligations),
date. Answer: JSON on stdout. Guard rails: the base may not be under https://w3id.org/crgo/; files are
written only in `dir`, which the helper chose outside any repository.
"""
import hashlib
import importlib.util
import json
import os
import re
import sys

CRGO_NS = "https://w3id.org/crgo/"


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def terms(crgo):
    from rdflib import URIRef
    ids = dict(l.rstrip("\n").split("\t") for l in open(os.path.join(crgo, "src", "ids.tsv"), encoding="utf-8"))
    return lambda k: URIRef(CRGO_NS + "CRGO_%07d" % int(ids[k])), ids


def dtl(d):
    from rdflib import Literal
    from rdflib.namespace import XSD
    d = str(d or "")[:10]
    return Literal(d + "T00:00:00", datatype=XSD.dateTime) if re.fullmatch(r"\d{4}-\d{2}-\d{2}", d) else None


def provisions(crgo):
    from rdflib import Graph
    from rdflib.namespace import SKOS
    out = {}
    for f in ("loi25", "lrsss", "a21", "gdpr", "pipeda", "osfi-b13"):
        p = os.path.join(crgo, "ontology", "vocab", f + ".ttl")
        if os.path.isfile(p):
            for s, n in Graph().parse(p).subject_objects(SKOS.notation):
                out[str(n)] = s
    return out


LINE = {"self-assessment": "LineSelfAssessment", "second-line": "LineSecond", "internal-audit": "LineInternalAudit", "external": "LineExternal"}
RESULT = {"effective": "TestEffective", "partly-effective": "TestPartlyEffective", "ineffective": "TestIneffective", "not-tested": "TestNotTested"}
ASPECT = {"design": "AspectDesign", "implementation": "AspectImplementation", "operation": "AspectOperation"}
COMP = {"satisfied": "CompSatisfied", "partially-satisfied": "CompPartial", "unsatisfied": "CompUnsatisfied", "not-assessed": "CompNotAssessed", "undetermined": "CompUndetermined"}


def profile_graph(T, X, prof):
    """The organisation profile in CRGO's crgo-org terms (what the applicability evaluator reads)."""
    from rdflib import Graph, Literal, URIRef
    from rdflib.namespace import RDF, OWL, RDFS
    g = Graph()
    org = X["org"]
    for key, prop in (("orgTypes", "hasOrganisationType"), ("establishedIn", "establishedIn"), ("offersServicesIn", "offersServicesIn"),
                      ("monitorsBehaviourIn", "monitorsBehaviourIn")):
        for v in prof.get(key) or []:
            g.add((org, T(prop), T(v)))
    for i, a in enumerate(prof.get("activities") or [], 1):
        n = X["activity-%d" % i]
        g.add((n, RDF.type, OWL.NamedIndividual)); g.add((n, RDF.type, T("ProcessingActivity")))
        g.add((n, RDFS.label, Literal(a.get("name") or "Processing activity %d" % i, lang="en"))); g.add((n, T("carriedOutBy"), org))
        for v in a.get("dataCategories") or []: g.add((n, T("processesDataCategory"), T(v)))
        for v in a.get("dataSubjectsIn") or []: g.add((n, T("dataSubjectsIn"), T(v)))
        for v in a.get("transfersTo") or []: g.add((n, T("transfersDataTo"), T(v)))
    for k in prof.get("complete") or []:
        g.add((org, T("profileCompleteFor"), Literal(k)))
    return g


def applicability(req, T, X, prof_g):
    from rdflib import Graph
    crgo = req["crgo"]
    A = load(os.path.join(crgo, "pipeline", "grc", "applicability.py"), "crgo_applicability")
    g = Graph()
    for t in prof_g: g.add(t)
    g.parse(os.path.join(crgo, "ontology", "vocab", "legal.ttl"))
    date = req.get("date") or __import__("datetime").date.today().isoformat()
    out, res = A.evaluate(g, X["org"], date, X["assessor/cyberriskguardian-desktop"], str(X))
    detail = {}
    from rdflib.namespace import RDF
    for a in out.subjects(RDF.type, T("ApplicabilityAssessment")):
        inst = str(out.value(a, T("applicabilityOf"))).rsplit("/", 1)[1]
        detail[inst] = {"met": sorted(str(c).rsplit("/", 1)[1] for c in out.objects(a, T("conditionMet"))),
                        "notMet": sorted(str(c).rsplit("/", 1)[1] for c in out.objects(a, T("conditionNotMet"))),
                        "undetermined": sorted(str(c).rsplit("/", 1)[1] for c in out.objects(a, T("conditionUndetermined")))}
    states = {k: {"state": v[3:], **detail.get(k, {})} for k, v in res.items()}
    return out, states, date


def facts_graph(req, T, X):
    """The application's own records about the organisation, in CRGO terms, under the organisation's base."""
    from rdflib import Graph, Literal
    from rdflib.namespace import RDF, OWL, RDFS
    f = req.get("facts") or {}
    g = profile_graph(T, X, f.get("profile") or {})
    ind = lambda n, cls, label: (g.add((n, RDF.type, OWL.NamedIndividual)), g.add((n, RDF.type, T(cls))), g.add((n, RDFS.label, Literal(label, lang="en"))))
    safe = lambda s: re.sub(r"[^A-Za-z0-9_.-]", "-", str(s))
    prov = provisions(req["crgo"])
    unknown = []
    for sid, notations in (f.get("obligations") or {}).items():
        for n in notations:
            if n in prov: g.add((X["scenario-" + sid], T("triggersObligation"), prov[n]))
            else: unknown.append(n)
    for t in f.get("controlTests") or []:
        if not t.get("control"): continue
        n = X["control-assessment/" + safe(t["id"])]
        ind(n, "ControlAssessment", "%s: %s" % (t["id"], t.get("label") or "control test"))
        g.add((n, T("evaluatesControlMeasure"), X[t["control"]]))
        if dtl(t.get("date")) is not None: g.add((n, T("assessedOn"), dtl(t["date"])))
        if t.get("line") in LINE: g.add((n, T("performedInCapacity"), T(LINE[t["line"]])))
        if t.get("result") in RESULT: g.add((n, T("hasTestResult"), T(RESULT[t["result"]])))
        if t.get("aspect") in ASPECT: g.add((n, T("assessesAspect"), T(ASPECT[t["aspect"]])))
    for x in f.get("findings") or []:
        n = X["finding/" + safe(x["id"])]
        ind(n, "AuditFinding", "%s: %s" % (x["id"], x.get("title") or "finding"))
        if x.get("control"): g.add((n, T("findingOnControl"), X[x["control"]]))     # 1.6.0: findings without a control link are written too
        if dtl(x.get("raisedOn")) is not None: g.add((n, T("raisedOn"), dtl(x["raisedOn"])))
        if x.get("condition"): g.add((n, T("findingCondition"), Literal(x["condition"], lang="en")))
        if x.get("closedOn") and dtl(x["closedOn"]) is not None:
            c = X["finding/" + safe(x["id"]) + "/closure"]; ind(c, "FindingClosure", "Closure of " + x["id"])
            g.add((c, T("closesFinding"), n)); g.add((c, T("closedOn"), dtl(x["closedOn"])))
        for i, r in enumerate(x.get("reopened") or [], 1):
            if dtl(r.get("date")) is None: continue
            c = X["finding/%s/reopening-%d" % (safe(x["id"]), i)]; ind(c, "FindingReopening", "Reopening of " + x["id"])
            g.add((c, T("reopensFinding"), n)); g.add((c, T("reopenedOn"), dtl(r["date"])))
            if r.get("reason"): g.add((c, T("reopeningReason"), Literal(r["reason"], lang="en")))
    req_of = requirement_resolver(f, X, prov)
    for d in f.get("determinations") or []:
        # 0.9.1: a determination on a provision CRGO knows; 1.6.0: else on the obligation of the register
        target = prov.get(d.get("provision")) if d.get("provision") in prov else (req_of(d.get("obligation")) if d.get("obligation") else None)
        if target is None: unknown.append(d.get("provision")); continue
        n = X["compliance/" + safe(d["id"])]
        ind(n, "ComplianceDetermination", "%s: %s" % (d["id"], d.get("provision") or d.get("obligation")))
        g.add((n, T("complianceWith"), target)); g.add((n, T("concernsOrganisation"), X["org"]))
        if dtl(d.get("date")) is not None: g.add((n, T("assessedOn"), dtl(d["date"])))
        if d.get("state") in COMP: g.add((n, T("hasComplianceState"), T(COMP[d["state"]])))
        if d.get("evidenceGap"): g.add((n, T("evidenceGap"), Literal(d["evidenceGap"], lang="en")))
        for e in d.get("evidence") or []:                      # only evidence of the shared register (1.6.0)
            g.add((n, T("hasEvidence"), X["evidence/" + safe(e)]))
        if d.get("assessor"): g.add((n, T("assessedBy"), person(g, T, X, d["assessor"])))
    try:
        T("PlaybookVersion")                                  # the 1.6.0 records need CRGO 0.10 terms
    except KeyError:
        return g, sorted(set(u for u in unknown if u))
    ops_graph(f, T, X, g, req["crgo"], prov, req_of, unknown)
    return g, sorted(set(u for u in unknown if u))


# ---------------------------------------------------------------------------------------------------------------
# 1.6.0 — policy, compliance, audit, SIEM and SOAR records in CRGO 0.10 terms, following the patterns of CRGO's
# synthetic samples tests/samples/nordelle-pca.ttl and nordelle-secops.ttl. Every record of the application keeps
# its identifier as localIdentifier on its IRI under the organisation's base. Nothing is inferred here: a mapping is
# written as a mapping (never a determination), an incident only with its confirmation (a person, a date), an
# execution with the approvals it relied on (CRGO reports the gaps; nothing authorises an action).
LIFE = {"draft": "LifeDraft", "review": "LifeUnderReview", "approved": "LifeApproved", "published": "LifePublished", "retired": "LifeRetired", "superseded": "LifeSuperseded"}
MODALITY = {"must": "ModalityMust", "mustnot": "ModalityMustNot", "should": "ModalityShould", "may": "ModalityMay"}
APPL = {"applicable": "AppApplicable", "not-applicable": "AppNotApplicable", "potentially-applicable": "AppPotentiallyApplicable", "undetermined": "AppUnknown"}
MAPT = {"exact": "MapExact", "full": "MapFullCoverage", "partial": "MapPartialCoverage", "broader": "MapBroader", "narrower": "MapNarrower", "related": "MapRelated", "conflicting": "MapConflicting"}
REVIEW = {"proposed": "RevDraft", "reviewed": "RevApproved", "rejected": "RevRejected"}
ACTION = {"open": "ActionOpen", "progress": "ActionInProgress", "done": "ActionAwaitingVerification", "verified": "ActionVerified", "cancelled": "ActionCancelled"}
ROOT = {"people": "RootPeople", "process": "RootProcess", "technology": "RootTechnology", "governance": "RootGovernance", "third-party": "RootThirdParty",
        "control-design": "RootDesign", "resourcing": "RootResourcing"}
SIG = {"low": "SigLow", "medium": "SigMedium", "high": "SigHigh", "critical": "SigCritical"}
SUB = {"preparation": "SubDraft", "submitted": "SubSubmitted", "acknowledged": "SubAcknowledged", "rejected": "SubRejected"}
HEALTH = {"healthy": "HealthHealthy", "degraded": "HealthDegraded", "silent": "HealthSilent", "unknown": "HealthUnknown"}
DETS = {"draft": "DetDraft", "testing": "DetTesting", "production": "DetEnabled", "disabled": "DetSuppressed", "retired": "DetRetired"}
COV = {"validated": "CovValidated", "untested": "CovUntested", "degraded": "CovDegraded", "missing": "CovMissing"}
DISP = {"new": "DispUnreviewed", "in-triage": "DispUnreviewed", "benign": "DispBenign", "false-positive": "DispFalsePositive", "escalated": "DispIndeterminate"}
TLP = {"RED": "TlpRed", "AMBER+STRICT": "TlpAmberStrict", "AMBER": "TlpAmber", "GREEN": "TlpGreen", "CLEAR": "TlpClear"}
CASE = {"open": "CaseNew", "investigating": "CaseInvestigating", "contained": "CaseContained", "eradicated": "CaseRecovering", "recovered": "CaseResolved", "closed": "CaseClosed"}
INCCAT = {"malware": "CatMalware", "unauthorised-access": "CatUnauthorisedAccess", "data-exposure": "CatDataExposure", "denial-of-service": "CatDenialOfService",
          "social-engineering": "CatSocialEngineering", "insider-misuse": "CatInsiderMisuse", "loss-theft": "CatLossTheft", "misconfiguration": "CatMisconfiguration"}
SEV = {"low": "SevLow", "medium": "SevMedium", "high": "SevHigh", "critical": "SevCritical"}
REPORT = {"report": "ReportReportable", "no-report": "ReportNotReportable", "not-applicable": "ReportNotReportable", "undetermined": "ReportUndetermined"}
RISKC = {"read-only": "RiskReadOnly", "administrative": "RiskAdministrative", "containment": "RiskContainment", "destructive": "RiskDestructive"}
EXEC = {"succeeded": "ExecSucceeded", "partial": "ExecFailed", "failed": "ExecFailed", "cancelled": "ExecCancelled", "compensated": "ExecCompensated"}
APPR = {"requested": "ApprRequested", "granted": "ApprGranted", "denied": "ApprDenied", "expired": "ApprExpired", "revoked": "ApprRevoked"}
FRAMEWORK = {"CSF2": "csf2", "ISO22": "iso27002-2022", "NIST-53": "sp800-53r5", "COBIT19": "cobit2019"}
PERSON = "https://www.commoncoreontologies.org/ont00001262"


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", str(s or "").strip().lower()).strip("-") or "unnamed"


def dtt(v, end=False):
    """A date or a local date-time (zones dropped, as the application does) → xsd:dateTime; a bare date that ends a
    validity is taken at the end of its day (the application's rule), otherwise at its start."""
    from rdflib import Literal
    from rdflib.namespace import XSD
    s = str(v or "").strip().replace(" ", "T")
    s = re.sub(r"(Z|[+-]\d\d:?\d\d)$", "", s)
    if re.fullmatch(r"\d{4}-\d\d-\d\d", s):
        return Literal(s + ("T23:59:59" if end else "T00:00:00"), datatype=XSD.dateTime)
    m = re.fullmatch(r"(\d{4}-\d\d-\d\dT\d\d:\d\d)(:\d\d)?(\.\d+)?", s)
    return Literal(m.group(1) + (m.group(2) or ":00"), datatype=XSD.dateTime) if m else None


def person(g, T, X, name):
    from rdflib import Literal, URIRef
    from rdflib.namespace import RDF, RDFS
    n = X["person/" + slug(name)]
    g.add((n, RDF.type, URIRef(PERSON))); g.add((n, RDFS.label, Literal(str(name).strip(), lang="en")))
    return n


def requirement_resolver(f, X, prov):
    """The requirement IRI of an obligation of the register: the CRGO provision it cites when CRGO knows it, else the
    organisation's own obligation record."""
    obs = {o["id"]: o for o in f.get("cmsObligations") or []}
    def req_of(oid):
        o = obs.get(oid)
        if o is None:
            return None
        return prov.get(o.get("provision")) if o.get("provision") in prov else X["obligation/" + re.sub(r"[^A-Za-z0-9_.-]", "-", oid)]
    return req_of


def notations(crgo, scheme):
    """Concepts of a CRGO vocabulary by notation, read with a pattern (the ATT&CK files are large): {notation: IRI}."""
    from rdflib import URIRef
    out = {}
    try:
        txt = open(os.path.join(crgo, "ontology", "vocab", scheme + ".ttl"), encoding="utf-8").read()
    except OSError:
        return out
    for m in re.finditer(r"^%s:(\S+) a skos:Concept" % re.escape(scheme), txt, re.M):
        out[m.group(1)] = URIRef(CRGO_NS + "vocab/%s/%s" % (scheme, m.group(1)))
    return out


def ops_graph(f, T, X, g, crgo, prov, req_of, unknown):
    from rdflib import Literal, URIRef
    from rdflib.namespace import RDF, OWL, RDFS, XSD
    safe = lambda s: re.sub(r"[^A-Za-z0-9_.-]", "-", str(s))
    org = X["org"]
    def ind(key, cls, label, local=None):
        n = X[key]
        g.add((n, RDF.type, OWL.NamedIndividual)); g.add((n, RDF.type, T(cls))); g.add((n, RDFS.label, Literal(str(label), lang="en")))
        if local: g.add((n, T("localIdentifier"), Literal(str(local))))
        return n
    def add(s, k, *vals):
        for v in vals:
            if v is not None: g.add((s, T(k), v))
    who = lambda name: person(g, T, X, name) if str(name or "").strip() else None
    txt = lambda s: Literal(str(s), lang="en")
    # ---------------------------------------------------------------- evidence (shared register)
    for e in f.get("evidence") or []:
        n = ind("evidence/" + safe(e["id"]), "EvidenceItem", e["title"], e["id"])
        add(n, "validUntil", dtt(e.get("validUntil"), end=True)); add(n, "periodStart", dtt(e.get("periodFrom"))); add(n, "periodEnd", dtt(e.get("periodTo"), end=True))
        if e.get("sufficiency") in ("sufficient", "insufficient"):
            s = ind("evidence/%s/sufficiency" % safe(e["id"]), "EvidenceSufficiencyAssessment", "Sufficiency of %s" % e["id"])
            add(s, "sufficiencyOf", n); add(s, "hasSufficiencyConclusion", T("SuffSufficient" if e["sufficiency"] == "sufficient" else "SuffInsufficient")); add(s, "assessedBy", who(e.get("judgedBy")))
    # ---------------------------------------------------------------- obligations (compliance register)
    for o in f.get("cmsObligations") or []:
        n = ind("obligation/" + safe(o["id"]), "LegalObligation", o["title"], o["id"])
        if o.get("provision") in prov: add(n, "derivedFromRequirement", prov[o["provision"]])
        elif o.get("provision"): unknown.append(o["provision"])
        req = req_of(o["id"])
        if o.get("owner"): add(who(o["owner"]), "accountableFor", req)
        if o.get("applicability") in APPL and dtt(o.get("applicabilityOn")) is not None:
            a = ind("obligation/%s/applicability" % safe(o["id"]), "ApplicabilityAssessment", "Applicability of %s to the organisation" % o["id"])
            add(a, "applicabilityOf", req); add(a, "concernsOrganisation", org); add(a, "hasApplicabilityState", T(APPL[o["applicability"]]))
            add(a, "assessedOn", dtt(o["applicabilityOn"])); add(a, "assessedBy", who(o.get("applicabilityReviewer")))
    for a in f.get("authorities") or []:
        ind("authority/" + safe(a["id"]), "RegulatoryAuthority", a["name"], a["id"])
    for x in f.get("exemptions") or []:
        req = req_of(x["obligation"]) if x.get("obligation") else prov.get(x.get("provision"))
        if req is None: unknown.append(x.get("provision")); continue
        n = ind("exemption/" + safe(x["id"]), "RegulatoryExemption", x["title"], x["id"])
        add(n, "exemptionFrom", req); add(n, "validFrom", dtt(x.get("validFrom"))); add(n, "validUntil", dtt(x.get("validUntil"), end=True))
        if x.get("authority"): add(n, "grantedBy", X["authority/" + safe(x["authority"])])
    for p in f.get("programmes") or []:
        n = ind("compliance/programme/" + safe(p["id"]), "ComplianceProgramme", p["name"], p["id"])
        add(n, "concernsOrganisation", org); add(n, "hasOwner", who(p.get("owner")))
        for oid in p.get("covers") or []: add(n, "programmeCovers", req_of(oid))
    for a in f.get("adoptions") or []:
        n = ind("compliance/adoption/" + safe(a["id"]), "FrameworkAdoption", "Adoption of %s%s" % (a.get("framework") or "a framework", (" (" + a["part"] + ")") if a.get("part") else ""), a["id"])
        add(n, "concernsOrganisation", org)
        if a.get("framework") in FRAMEWORK: add(n, "adoptsFramework", URIRef(CRGO_NS + "vocab/" + FRAMEWORK[a["framework"]]))
        if a.get("scope"): add(n, "adoptionScope", txt(a["scope"]))
        if a.get("status") == "active" and a.get("decidedOn"):
            add(n, "decisionMadeBy", who(a.get("decidedBy"))); add(n, "hasDecisionOutcome", T("DecApproved")); add(n, "decidedOn", dtt(a["decidedOn"]))
        if a.get("programme"): add(X["compliance/programme/" + safe(a["programme"])], "programmeCovers", n)
    # ---------------------------------------------------------------- policies, versions, statements
    fams = {x["id"] for x in f.get("families") or []}
    for x in f.get("families") or []:
        ind("policy-family/" + safe(x["id"]), "PolicyFamily", x["name"], x["id"])
    stmt_iri, version_iri = {}, {}
    order = {"published": 0, "approved": 1, "review": 2, "draft": 3, "retired": 4, "superseded": 5}
    for p in f.get("policies") or []:
        pol = ind("policy/" + safe(p["id"]), "Policy", p["title"], p["id"])
        if p.get("family") in fams: add(pol, "inPolicyFamily", X["policy-family/" + safe(p["family"])])
        if p.get("owner"): add(pol, "hasOwner", who(p["owner"]))
        for vi, v in enumerate(p.get("versions") or []):
            vk = "policy-version/%s/%s" % (safe(p["id"]), safe(v["version"]))
            vn = ind(vk, "PolicyVersion", "%s, version %s" % (p["title"], v["version"]), "%s v%s" % (p["id"], v["version"]))
            add(vn, "versionOfDirective", pol); add(vn, "versionLabel", Literal(v["version"]))
            if v.get("state") in LIFE: add(vn, "hasLifecycleState", T(LIFE[v["state"]]))
            add(vn, "effectiveOn", dtt(v.get("effective"))); add(vn, "reviewDueOn", dtt(v.get("nextReview"))); add(vn, "retiredOn", dtt(v.get("retired")))
            if v.get("approvedBy") and dtt(v.get("approvedOn")) is not None:
                d = ind(vk + "/approval", "DecisionRecord", "Approval of %s v%s" % (p["id"], v["version"]))
                add(d, "decisionOn", vn); add(d, "decisionMadeBy", who(v["approvedBy"])); add(d, "hasDecisionOutcome", T("DecApproved")); add(d, "decidedOn", dtt(v["approvedOn"]))
            version_iri[(p["id"], v["version"])] = vn
            if v.get("hash"): version_iri[(p["id"], "#" + v["hash"])] = vn
            for s in v.get("statements") or []:
                sn = ind("%s/statement/%s" % (vk, safe(s["id"])), "PolicyStatement", (s.get("text") or s["id"])[:160], s["id"])
                add(sn, "statementInVersion", vn); add(sn, "statementOfPolicy", pol); add(sn, "hasNormativeModality", T(MODALITY.get(s.get("modality"), "ModalityMust")))
                if s.get("text"): add(sn, "statementText", txt(s["text"]))
                for t in s.get("training") or []: add(sn, "requiresTraining", X["training/" + safe(t)])
                # the statement a mapping or an exception names: the one in the version in force, else the latest
                k = (order.get(v.get("state"), 9), -vi)
                if s["id"] not in stmt_iri or k < stmt_iri[s["id"]][0]: stmt_iri[s["id"]] = (k, sn)
    stmt_of = lambda sid: stmt_iri[sid][1] if sid in stmt_iri else None
    for t in f.get("training") or []:
        n = ind("training/" + safe(t["id"]), "TrainingRequirement", t["title"], t["id"])
        for sid in t.get("statements") or []: add(stmt_of(sid), "requiresTraining", n)
    for a in f.get("acks") or []:
        vn = version_iri.get((a["policy"], "#" + a["hash"])) if a.get("hash") else None
        vn = vn or version_iri.get((a["policy"], a.get("version")))
        if vn is None or not a.get("person"): continue
        n = ind("ack/" + safe(a["id"]), "PolicyAcknowledgement", "Acknowledgement of %s v%s by %s" % (a["policy"], a.get("version"), a["person"]), a["id"])
        add(n, "attestedBy", who(a["person"])); add(n, "attestedOn", dtt(a.get("date"))); add(n, "attestationAbout", vn); add(n, "hasKnowledgeStatus", T("KsManagementDecision"))
    # ---------------------------------------------------------------- qualified mappings (never compliance)
    def node(ref):
        k, i = (ref or {}).get("kind"), (ref or {}).get("id")
        if not i: return None
        if k == "statement": return stmt_of(i)
        if k == "obligation": return req_of(i)
        if k == "policy": return X["policy/" + safe(i)]
        if k == "control":
            n = X["control/" + safe(i)]; g.add((n, RDF.type, T("ControlMeasure"))); g.add((n, T("localIdentifier"), Literal(i))); return n
        return None
    for m in f.get("mappings") or []:
        src, tgt = node(m.get("from")), node(m.get("to"))
        if src is None or tgt is None: continue
        n = ind("mapping/" + safe(m["id"]), "MappingAssertion", "%s → %s" % ((m.get("from") or {}).get("id"), (m.get("to") or {}).get("id")), m["id"])
        add(n, "mappingSource", src); add(n, "mappingTarget", tgt); add(n, "hasMappingType", T(MAPT.get(m.get("type"), "MapRelated"))); add(n, "hasReviewState", T(REVIEW.get(m.get("review"), "RevDraft")))
        if m.get("rationale"): add(n, "rationale", txt(m["rationale"]))
        if m.get("confidence"): g.add((n, RDFS.comment, Literal("Analyst confidence: %s; edition: %s" % (m["confidence"], m.get("edition") or "not stated"), lang="en")))
        add(n, "reviewedBy", who(m.get("reviewedBy"))); add(n, "reviewedOn", dtt(m.get("reviewed")))
    # ---------------------------------------------------------------- exceptions (never waive a law)
    for x in f.get("exceptions") or []:
        n = ind("exception/" + safe(x["id"]), "PolicyException", x["title"], x["id"])
        tos = []
        if x.get("statement"): tos.append(stmt_of(x["statement"]))
        elif x.get("policy"): tos.append(X["policy/" + safe(x["policy"])])
        for l in x.get("concerns") or []:
            if l.get("kind") == "statement": tos.append(stmt_of(l.get("id")))
            elif l.get("kind") == "policy" and not x.get("statement"): tos.append(X["policy/" + safe(l.get("id"))])
            elif l.get("kind") == "obligation" and any(o["id"] == l.get("id") for o in f.get("cmsObligations") or []): tos.append(X["obligation/" + safe(l["id"])])
        for t in dict.fromkeys(t for t in tos if t is not None): add(n, "exceptionTo", t)
        add(n, "validFrom", dtt(x.get("opened"))); add(n, "validUntil", dtt(x.get("expiry"), end=True)); add(n, "approvingAuthority", who(x.get("approvedBy")))
    # ---------------------------------------------------------------- incidents (confirmed by a person, on a date) and reportability
    p35 = prov.get("P-39.1 s. 3.5 (1st para.)") or prov.get("P-39.1 s. 3.5")
    p33 = prov.get("GDPR Art. 33(1)")
    confirmation = {}
    for i in f.get("incidents") or []:
        if not (i.get("confirmed") and str(i.get("confirmedBy") or "").strip()): continue    # an alert or an unconfirmed event is not an incident
        n = ind("incident/" + safe(i["id"]), "Incident", i["title"], i["id"])
        if i.get("category") in INCCAT: add(n, "hasIncidentCategory", T(INCCAT[i["category"]]))
        if i.get("severity") in SEV: add(n, "hasIncidentSeverity", T(SEV[i["severity"]]))
        c = ind("incident/%s/confirmation" % safe(i["id"]), "IncidentConfirmation", "Confirmation of %s" % i["id"])
        add(c, "confirmsIncident", n); add(c, "confirmedOn", dtt(i["confirmed"])); add(c, "assessedBy", who(i["confirmedBy"]))
        confirmation[i["id"]] = c
        for key, provision in (("loi25", p35), ("gdpr", p33)):
            if i.get(key) not in REPORT: continue
            r = ind("incident/%s/reportability-%s" % (safe(i["id"]), key), "BreachReportabilityAssessment", "%s reportability of %s" % ("Loi 25" if key == "loi25" else "GDPR", i["id"]))
            add(r, "reportabilityOf", n); add(r, "reportableUnder", provision); add(r, "hasReportabilityState", T(REPORT[i[key]]))
            add(r, "assessedOn", dtt(i.get("reportAssessedOn") or i["confirmed"]))
    # ---------------------------------------------------------------- deadlines and submissions
    for d in f.get("deadlines") or []:
        n = ind("compliance/deadline/" + safe(d["id"]), "ComplianceDeadline", d["title"], d["id"])
        if d.get("obligation"): add(n, "deadlineFor", req_of(d["obligation"]))
        add(n, "hasDeadlineTriggerKind", T("DeadlineEvent" if d.get("trigger") == "event" else "DeadlineCalendar"))
        if d.get("trigger") == "event":
            if d.get("incident") in confirmation: add(n, "deadlineTriggeredBy", confirmation[d["incident"]])
            if d.get("unit") in ("hours", "days") and d.get("incident") in confirmation:
                add(n, "dueOffsetHours", Literal(int(d.get("offset") or 0) * (24 if d["unit"] == "days" else 1), datatype=XSD.nonNegativeInteger))
            elif d.get("due"): add(n, "dueOn", dtt(d["due"]))          # business days: the due time computed by the application
            add(n, "deadlineComputation", txt("%s %s after the incident confirmation" % (d.get("offset"), d.get("unit"))))
        else:
            add(n, "dueOn", dtt(d.get("due")))
    inst_ids = {d["id"] for d in f.get("deadlines") or []}
    for s in f.get("submissions") or []:
        n = ind("compliance/submission/" + safe(s["id"]), "RegulatorySubmission", s["title"], s["id"])
        if s.get("authority"): add(n, "submissionTo", X["authority/" + safe(s["authority"])])
        if s.get("obligation"): add(n, "submissionUnder", req_of(s["obligation"]))
        add(n, "hasSubmissionState", T(SUB.get(s.get("state"), "SubDraft"))); add(n, "submittedOn", dtt(s.get("submittedOn"))); add(n, "receiptAcknowledgedOn", dtt(s.get("receiptOn")))
        if s.get("answers") in inst_ids and s.get("state") in ("submitted", "acknowledged") and s.get("submittedOn"):
            add(n, "answersDeadline", X["compliance/deadline/" + safe(s["answers"])])
    # ---------------------------------------------------------------- audit: findings, observations, nonconformities, corrective actions
    for x in f.get("findings") or []:
        n = X["finding/" + safe(x["id"])]
        g.add((n, RDF.type, OWL.NamedIndividual)); g.add((n, RDF.type, T("AuditFinding"))); g.add((n, T("localIdentifier"), Literal(x["id"])))
        if x.get("significance") in SIG: add(n, "hasFindingSignificance", T(SIG[x["significance"]]))
        if x.get("rootCause") in ROOT: add(n, "hasRootCauseCategory", T(ROOT[x["rootCause"]]))
        for i, oid in enumerate(x.get("obligations") or [], 1):
            c = ind("finding/%s/criterion-%d" % (safe(x["id"]), i), "AuditCriterion", "Criterion of %s: %s" % (x["id"], oid))
            add(c, "criterionRefersTo", req_of(oid)); add(n, "usesCriterion", c)
    for o in f.get("observations") or []:
        n = ind("observation/" + safe(o["id"]), "AuditObservation", o["title"], o["id"])
        if o.get("status") == "validated" and o.get("finding"): add(n, "validatedAs", X["finding/" + safe(o["finding"])])
    for x in f.get("nonconformities") or []:
        n = ind("nonconformity/" + safe(x["id"]), "Nonconformity", x["title"], x["id"])
        add(n, "concernsOrganisation", org); add(n, "identifiedOn", dtt(x.get("detected")))
        if x.get("statement"): add(n, "nonconformityWith", stmt_of(x["statement"]))
        if x.get("rootCause") in ROOT: add(n, "hasRootCauseCategory", T(ROOT[x["rootCause"]]))
        if x.get("status") == "closed" and dtt(x.get("closedOn")) is not None:
            c = ind("nonconformity/%s/closure" % safe(x["id"]), "FindingClosure", "Closure of " + x["id"]); add(c, "closesFinding", n); add(c, "closedOn", dtt(x["closedOn"]))
    for a in f.get("actions") or []:
        targets = [X[("finding/" if r.startswith("finding:") else "nonconformity/") + safe(r.split(":", 1)[1])] for r in a.get("corrects") or []]
        if not targets: continue
        n = ind("action/" + safe(a["id"]), "CorrectiveAction", a["title"], a["id"])
        for t in targets: add(n, "correctsFinding", t)
        add(n, "hasOwner", who(a.get("owner"))); add(n, "dueOn", dtt(a.get("due"))); add(n, "hasActionStatus", T(ACTION.get(a.get("state"), "ActionOpen")))
    # ---------------------------------------------------------------- SIEM
    siem, soar = f.get("siem") or {}, f.get("soar") or {}
    att = notations(crgo, "attack") if (siem or soar) else {}
    det = notations(crgo, "attack-detection") if siem.get("strategies") else {}
    tech = lambda t: att.get(str(t).upper())
    asset = lambda a: X["asset-" + safe(a)] if a else None
    for s in siem.get("sources") or []:
        n = ind("telemetry/" + safe(s["id"]), "TelemetrySource", s["name"], s["id"])
        add(n, "sourceAsset", asset(s.get("asset")))
        if s.get("system"): add(n, "sourceSystem", Literal(s["system"]))
        for i, h in enumerate(s.get("health") or [], 1):
            if h.get("state") not in HEALTH or dtt(h.get("date")) is None: continue
            o = ind("telemetry-health/%s/%d" % (safe(s["id"]), i), "TelemetryHealthObservation", "Telemetry health of %s on %s" % (s["id"], h["date"]))
            add(o, "observationOf", n); add(o, "observedOn", dtt(h["date"])); add(o, "hasTelemetryHealthState", T(HEALTH[h["state"]]))
    for s in siem.get("strategies") or []:
        n = ind("detection-strategy/" + safe(s["id"]), "DetectionStrategy", s["name"], s["id"])
        add(n, "adaptsReferenceStrategy", det.get(str(s.get("reference") or "").upper()))
        for t in s.get("techniques") or []: add(n, "targetsTechnique", tech(t))
    for r in siem.get("rules") or []:
        n = ind("detection-rule/" + safe(r["id"]), "DetectionRule", r["title"], r["id"])
        add(n, "hasDetectionStatus", T(DETS.get(r.get("status"), "DetDraft"))); add(n, "versionLabel", Literal(r.get("version") or "1"))
        if r.get("language"): add(n, "ruleLanguage", Literal(r["language"]))
        if r.get("ruleId"): add(n, "ruleIdentifier", Literal(r["ruleId"]))
        for sid in r.get("requiredSources") or []: add(n, "requiresSource", X["telemetry/" + safe(sid)])
        for t in r.get("techniques") or []: add(n, "targetsTechnique", tech(t))
        if r.get("strategy"): add(n, "implementsStrategy", X["detection-strategy/" + safe(r["strategy"])])
    for t in siem.get("tests") or []:
        if t.get("result") not in ("effective", "ineffective") or dtt(t.get("date")) is None: continue
        n = ind("detection-test/" + safe(t["id"]), "DetectionTest", "Detection test %s of rule %s" % (t["id"], t["rule"]), t["id"])
        add(n, "testedRule", X["detection-rule/" + safe(t["rule"])]); add(n, "assessedOn", dtt(t["date"])); add(n, "concernsOrganisation", org)
        add(n, "hasTestResult", T("TestEffective" if t["result"] == "effective" else "TestIneffective")); add(n, "assessedBy", who(t.get("tester")))
    for c in siem.get("coverage") or []:
        n = ind("coverage/" + safe(c["id"]), "DetectionCoverage", "Coverage of %s%s" % (c["scenario"], (" / " + c["technique"]) if c.get("technique") else ""), c["id"])
        add(n, "coversScenario", X["scenario-" + safe(c["scenario"])]); add(n, "coversTechnique", tech(c.get("technique")))
        for rid in c.get("rules") or []: add(n, "coverageBy", X["detection-rule/" + safe(rid)])
        for sid in c.get("strategies") or []: add(n, "coverageBy", X["detection-strategy/" + safe(sid)])
        add(n, "hasCoverageStatus", T(COV.get(c.get("status"), "CovUntested"))); add(n, "assessedOn", dtt(c.get("date")))
        if c.get("test"): add(n, "supportedByTest", X["detection-test/" + safe(c["test"])])
    for gp in siem.get("gaps") or []:
        n = ind("detection-gap/" + safe(gp["id"]), "DetectionGap", gp["title"], gp["id"])
        if gp.get("source"): add(n, "gapInTelemetry", X["telemetry/" + safe(gp["source"])])
        add(n, "gapForTechnique", tech(gp.get("technique")))
        if gp.get("scenario"): add(X["scenario-" + safe(gp["scenario"])], "hasControlGap", n)
    crown = set()
    for a in siem.get("alerts") or []:
        n = ind("alert/" + safe(a["id"]), "SecurityAlert", a["title"], a["id"])
        add(n, "hasAlertDisposition", T(DISP.get(a.get("triage"), "DispUnreviewed"))); add(n, "recordedAt", dtt(a.get("detected")))
        add(n, "hasInformationMarking", T(TLP.get(a.get("tlp"), "TlpAmber")))
        if a.get("rule"): add(n, "generatedByRule", X["detection-rule/" + safe(a["rule"])])
        if a.get("asset"):
            add(n, "involvesAsset", asset(a["asset"]))
            if a.get("crown") and a["asset"] not in crown:
                crown.add(a["asset"]); v = ind("valuation-" + safe(a["asset"]), "AssetValuation", "Valuation of %s" % a["asset"])
                add(v, "valuationOf", asset(a["asset"])); add(v, "isCrownJewel", Literal(True)); add(v, "valuedBy", org)
        for i in a.get("indicators") or []: add(n, "matchedIndicator", X["indicator/" + safe(i)])
        if a.get("case"): add(n, "openedInvestigation", X["investigation/" + safe(a["case"])])
    for i in siem.get("indicators") or []:
        n = ind("indicator/" + safe(i["id"]), "ThreatIndicator", i["name"], i["id"])
        if i.get("pattern"): add(n, "indicatorPattern", Literal(i["pattern"])); add(n, "patternLanguage", Literal(i.get("patternType") or "stix"))
        add(n, "validFrom", dtt(i.get("validFrom"))); add(n, "validUntil", dtt(i.get("validUntil"), end=True)); add(n, "hasInformationMarking", T(TLP.get(i.get("tlp"), "TlpAmber")))
        if i.get("confidence") is not None:     # source confidence as stated, with its method; never a probability
            add(n, "statedConfidence", Literal(str(i["confidence"]), datatype=XSD.decimal)); add(n, "confidenceMethod", txt(i.get("confidenceMethod") or "Source confidence (0-100) as stated by the producer"))
        if i.get("source"):
            s = ind("cti/" + slug(i["source"]), "ThreatIntelligenceSource", i["source"]); add(n, "indicatorFromSource", s)
    # ---------------------------------------------------------------- SOAR
    for c in soar.get("cases") or []:
        n = ind("investigation/" + safe(c["id"]), "SecurityInvestigation", c["title"], c["id"])
        add(n, "hasCaseStatus", T(CASE.get(c.get("status"), "CaseNew"))); add(n, "investigationOpenedAt", dtt(c.get("opened")))
        for a in c.get("alerts") or []: add(n, "investigatesAlert", X["alert/" + safe(a)])
        if c.get("incident") in confirmation: add(n, "concludedIncident", X["incident/" + safe(c["incident"])])
    pbv = {}
    for p in soar.get("playbooks") or []:
        n = ind("playbook/" + safe(p["id"]), "ResponsePlaybook", p["name"], p["id"])
        add(n, "hasOwner", who(p.get("owner")))
        for sid in p.get("scenarios") or []: add(n, "addressesScenario", X["scenario-" + safe(sid)])
        for v in p.get("versions") or []:
            vn = ind("playbook-version/%s/%s" % (safe(p["id"]), v["version"]), "PlaybookVersion", "%s v%s" % (p["name"], v["version"]), "%s v%s" % (p["id"], v["version"]))
            add(vn, "versionOfDirective", n); add(vn, "versionLabel", Literal(str(v["version"])))
            add(vn, "hasLifecycleState", T({"draft": "LifeDraft", "published": "LifePublished", "retired": "LifeSuperseded"}.get(v.get("state"), "LifeDraft")))
            if v.get("state") != "draft": add(vn, "effectiveOn", dtt(v.get("published")))
            add(vn, "retiredOn", dtt(v.get("retired")))
            pbv[(p["id"], str(v["version"]))] = vn
    for s in soar.get("simulations") or []:
        vn = pbv.get((s.get("playbook"), str(s.get("version"))))
        if vn is None or s.get("result") not in ("passed", "failed"): continue
        n = ind("simulation/" + safe(s["id"]), "PlaybookSimulation", "Dry run %s of %s v%s" % (s["id"], s["playbook"], s["version"]), s["id"])
        add(n, "simulatedPlaybook", vn); add(n, "hasTestResult", T("TestEffective" if s["result"] == "passed" else "TestIneffective"))
        add(n, "assessedOn", dtt(s.get("date"))); add(n, "assessedBy", who(s.get("by"))); add(n, "concernsOrganisation", org)
    for gt in soar.get("gates") or []:
        n = ind("approval-gate/" + safe(gt["id"]), "ApprovalGate", gt["name"], gt["id"])
        for rc in gt.get("riskClasses") or []: add(n, "gateForRiskClass", T(RISKC[rc]) if rc in RISKC else None)
        for w in gt.get("authorities") or []: add(n, "gateAuthority", who(w))
        add(n, "gateForCriticalAssets", Literal(bool(gt.get("criticalAssets"))))
    action_iri = lambda x: X["response-action/%s-%s%s" % (slug(x.get("action")), x.get("riskClass") or "unclassified", "-crown" if x.get("criticalAsset") else "")]
    for x in soar.get("executions") or []:
        act = action_iri(x)
        if (act, RDF.type, T("ResponseAction")) not in g:
            ind(str(act)[len(str(X)):], "ResponseAction", x.get("action") or "Response action")
            if x.get("riskClass") in RISKC: add(act, "hasActionRiskClass", T(RISKC[x["riskClass"]]))
        for gid in x.get("gates") or []: add(act, "requiresApproval", X["approval-gate/" + safe(gid)])
        n = ind("action-execution/" + safe(x["id"]), "ActionExecution", "%s (%s)" % (x.get("action") or x["id"], x["id"]), x["id"])
        add(n, "performsAction", act); add(n, "executionStartedAt", dtt(x.get("started")))
        if x.get("status") in EXEC: add(n, "hasExecutionStatus", T(EXEC[x["status"]]))
        if x.get("attempt"): add(n, "attemptIdentifier", Literal(x["attempt"]))
        for a in x.get("approvals") or []: add(n, "authorizedBy", X["approval/" + safe(a)])
    execs = {x["id"]: x for x in soar.get("executions") or []}
    for a in soar.get("approvals") or []:
        n = ind("approval/" + safe(a["id"]), "ApprovalDecision", "Approval decision %s" % a["id"], a["id"])
        add(n, "hasDecisionOutcome", T({"approved": "DecApproved", "rejected": "DecRejected"}.get(a.get("outcome"))) if a.get("outcome") in ("approved", "rejected") else None)
        add(n, "hasApprovalStatus", T(APPR.get(a.get("status"), "ApprRequested"))); add(n, "decisionMadeBy", who(a.get("approver")))
        add(n, "decidedOn", dtt(a.get("decidedOn"))); add(n, "validFrom", dtt(a.get("validFrom"))); add(n, "validUntil", dtt(a.get("validUntil"), end=True)); add(n, "revokedOn", dtt(a.get("revokedOn")))
        if a.get("execution"): add(n, "decisionOn", X["action-execution/" + safe(a["execution"])])
        elif a.get("kind") == "pre-authorisation":
            for rc in a.get("riskClasses") or []: add(n, "preauthorisesAction", T(RISKC[rc]) if rc in RISKC else None)
        elif a.get("action"):
            for x in execs.values():
                if slug(x.get("action")) == slug(a["action"]): add(n, "decisionOn", action_iri(x))


def main():
    req = json.load(sys.stdin)
    op = sys.argv[1] if len(sys.argv) > 1 else "graph"
    base = str(req.get("base") or "")
    if not re.match(r"^https?://", base) or base.startswith(CRGO_NS):
        return {"error": True, "code": "REFERENCE_NAMESPACE", "message": "The organisation base must be an http(s) address the organisation controls (or a private one), never under https://w3id.org/crgo/."}
    if not base.endswith(("/", "#")):
        base += "/"
    from rdflib import Namespace
    X = Namespace(base)
    T, _ = terms(req["crgo"])
    d = req["dir"]
    os.makedirs(d, exist_ok=True)
    if op == "applicability":
        out, states, date = applicability(req, T, X, profile_graph(T, X, (req.get("facts") or {}).get("profile") or {}))
        return {"date": date, "states": states}
    # graph: the assessment through CRGO's own bridge, then the application's facts beside it
    raw = json.dumps(req["assessment"], ensure_ascii=False, sort_keys=True).encode("utf-8")
    inp = os.path.join(d, "assessment.json")
    with open(inp, "wb") as fh:
        fh.write(raw)
    bridge = load(os.path.join(req["crgo"], "pipeline", "crg", "crg2rdf.py"), "crgo_crg2rdf")
    calc = bridge.load_calc(os.path.join(os.path.dirname(os.path.abspath(__file__)), "engine", "crg_calc.py"))
    g, run = bridge.convert(req["assessment"], calc, base, req.get("label") or None)
    if "vann" not in g.serialize(format="turtle") and "preferredNamespaceUri" not in g.serialize(format="turtle"):
        return {"error": True, "code": "BRIDGE_TOO_OLD", "message": "This CRGO's crg2rdf.py does not declare the organisation base: CRGO v0.9.1 or later is needed."}
    g.serialize(os.path.join(d, "org.ttl"), format="turtle")
    fg, unknown = facts_graph(req, T, X)
    states = None
    if (req.get("facts") or {}).get("profile"):
        ag, states, _ = applicability(req, T, X, profile_graph(T, X, req["facts"]["profile"]))
        for t in ag: fg.add(t)
    fg.serialize(os.path.join(d, "orgfacts.ttl"), format="turtle")
    return {"files": [os.path.join(d, "org.ttl"), os.path.join(d, "orgfacts.ttl")], "triples": len(g), "factTriples": len(fg),
            "sha256": hashlib.sha256(raw).hexdigest(), "input": inp, "organization": base + "org",
            "totals": {"est": round(run["totals"]["est"], 2), "res": round(run["totals"]["res"], 2)},
            "results": {r["id"]: {k: r[k] for k in ("est", "tol", "mit", "res", "ratio")} for r in run["results"]},
            "applicability": states, "unknownProvisions": unknown}


if __name__ == "__main__":
    try:
        out = main()
    except Exception as e:                                      # noqa: BLE001
        out = {"error": True, "code": "BRIDGE_FAILED", "message": "%s: %s" % (type(e).__name__, e)}
    sys.stdout.write(json.dumps(out, ensure_ascii=False))
