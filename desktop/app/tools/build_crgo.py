#!/usr/bin/env python3
"""build_crgo.py — the offline snapshots of the CyberRiskGuardian Ontology (1.5.8, CRGO 0.9.x; CRGO 0.11.0 in 1.9.0).

Writes two files beside the application, from a CRGO checkout (v0.9.1 or later):

  data/crgo-snapshot.json   the identification export (data/export/crgo-identification.json): scenarios,
                            links, confidences, estimates — plus, from crgo_scenario, the 0.9 additions
                            for each scenario (obligations under other regimes, D3FEND countermeasures,
                            KEV/EPSS exploitation evidence), and the legal-applicability data: the
                            instruments, their 19 conditions, the profile vocabularies (organisation
                            types, jurisdictions, data categories) and the provisions by notation.
  data/crgo-assurance.json  NIST SP 800-53A Rev. 5 assessment objectives and methods per SP 800-53 control
                            (public domain, NIST), and CRGO's two ILLUSTRATIVE audit work programmes
                            (AUD-PAM-001, AUD-VULN-001). Licensed standards (IIA, ISACA, AICPA, COSO,
                            ISO) are NOT exported: CRGO holds them only as identifiers and headings.

From CRGO 0.11.0 (1.9.0) the snapshot also carries, under "v011": the six scenario patterns (labels, definitions,
pattern links with their confidence), CIS Controls v8.1 controls and safeguards (identifiers, Implementation Groups,
asset type, security function and CRGO's OWN paraphrased labels — never CIS text; values CRGO flags REVIEW: are
marked unverified), the OWASP Top 10:2025, LLM 2025 and Agentic 2026 identifiers with CRGO labels, and the status of
the release: when CRGO's CHANGELOG marks the release "proposed", every 0.11 term is a proposal awaiting the CRGO
project owner's approval, and the snapshot says so ("status", "statusNote").

The application uses these when the ontology's MCP server cannot be reached, and says so on every result.
Needs rdflib and pyoxigraph (as CRGO itself does). Takes about four minutes (the store is built first).

Usage: python3 tools/build_crgo.py /path/to/CyberRiskGuardian-Ontology
"""
import datetime as dt
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


STATUS_NOTE = {"proposed": "CRGO %s is proposed: its new terms (registers, scenario patterns, CIS v8.1, OWASP, ISO/IEC 27701 and 42001, CCSPA) "
                           "await the CRGO project owner's approval (src/approvals.tsv). Cite them as proposed.",
               "approved": "CRGO %s: every term approved by the CRGO project owner."}


def strip(x):
    if isinstance(x, dict):
        return {k: strip(v) for k, v in x.items() if k not in ("iri", "caveat", "framework")}
    if isinstance(x, list):
        return [strip(v) for v in x]
    return x


def release(onto):
    """(tag release from CHANGELOG, ontology release from src/build.py, status: 'proposed' or 'approved')."""
    tag = None; status = "approved"
    for line in open(os.path.join(onto, "CHANGELOG.md"), encoding="utf-8"):
        m = re.match(r"## \[(\d+\.\d+\.\d+)\](.*)", line)
        if m:
            tag = m.group(1); status = "proposed" if "proposed" in m.group(2).lower() else "approved"; break
    onto_rel = next((l.split('"')[1] for l in open(os.path.join(onto, "src", "build.py"), encoding="utf-8") if l.startswith("VERSION")), None)
    return tag, onto_rel, status


def v011(onto):
    """CRGO 0.11.0 additions: scenario patterns, CIS Controls v8.1 (CRGO labels only), OWASP identifiers."""
    from rdflib import Graph, URIRef
    from rdflib.namespace import RDFS, SKOS
    ids = dict(l.rstrip("\n").split("\t") for l in open(os.path.join(onto, "src", "ids.tsv"), encoding="utf-8"))
    T = lambda k: URIRef("https://w3id.org/crgo/CRGO_%07d" % int(ids[k]))
    short = lambda u: str(u).rsplit("/", 1)[1]
    lang = lambda g, s, p: {l.language or "en": str(l) for l in g.objects(s, p)}
    gstat = lambda g, s: "proposed" if g.value(s, T("governanceStatus")) == T("StatusProposed") else "approved"
    ctx = Graph().parse(os.path.join(onto, "ontology", "crgo-context.ttl"))
    links = {}
    tsv = os.path.join(onto, "data", "frameworks", "pattern_links.tsv")
    for row in list(open(tsv, encoding="utf-8"))[1:]:
        f = row.rstrip("\n").split("\t")
        if len(f) >= 4:
            links.setdefault(f[0], []).append({"kind": f[1], "target": f[2], "confidence": f[3], "note": f[5] if len(f) > 5 else ""})
    pats = []
    for s in ctx.subjects(SKOS.inScheme, T("ScenarioPatternScheme")):
        key = next((k for k, v in ids.items() if int(v) == int(short(s)[5:])), None)
        pats.append({"id": short(s), "key": key, "notation": str(ctx.value(s, SKOS.notation) or ""), "label": lang(ctx, s, RDFS.label),
                     "definition": lang(ctx, s, SKOS.definition), "links": links.get(key, []), "status": gstat(ctx, s)})
    pats.sort(key=lambda p: p["id"])
    cg = Graph().parse(os.path.join(onto, "ontology", "vocab", "cis81.ttl"))
    ig = {T("IG1"): 1, T("IG2"): 2, T("IG3"): 3}
    ctls, sgs = [], []
    for s, n in cg.subject_objects(SKOS.notation):
        n = str(n); lab = lang(cg, s, SKOS.prefLabel)
        note = " ".join(str(x) for x in cg.objects(s, SKOS.editorialNote))
        if "." not in n:
            ctls.append({"id": n, "label": lab, "status": gstat(cg, s)})
            continue
        at = cg.value(s, T("hasSafeguardAssetType"))
        fn = cg.value(s, T("hasSecurityFunction"))
        sgs.append({"id": n, "control": n.split(".")[0], "label": lab, "ig": sorted(ig[x] for x in cg.objects(s, T("inImplementationGroup")) if x in ig),
                    "asset": next((k[9:] for k, v in ids.items() if at is not None and k.startswith("AssetType") and int(v) == int(short(at)[5:])), ""),
                    "function": short(fn) if fn is not None else "", "unverified": "REVIEW:" in note, "status": gstat(cg, s),
                    "seeAlso": sorted(short(x) for x in cg.objects(s, RDFS.seeAlso) if "w3id.org/crgo/CRGO_" in str(x))})
    num = lambda x: tuple(int(p) for p in x["id"].split("."))
    owasp = {}
    for f in ("owasp-top10-2025", "owasp-llm-2025", "owasp-agentic-2026"):
        og = Graph().parse(os.path.join(onto, "ontology", "vocab", f + ".ttl"))
        owasp[f] = sorted(({"id": str(n), "label": lang(og, s, SKOS.prefLabel), "status": gstat(og, s),
                            "patterns": sorted(short(x) for x in og.objects(s, T("partiallyOverlaps")) if "/CRGO_" in str(x))}
                           for s, n in og.subject_objects(SKOS.notation)), key=lambda x: x["id"])
    return {"patterns": pats, "property": {"hasScenarioPattern": short(T("hasScenarioPattern")), "ScenarioPattern": short(T("ScenarioPattern"))},
            "cis81": {"source": "https://www.cisecurity.org/controls/v8-1", "labels": "CRGO paraphrases (no CIS text); cite CIS by identifier",
                      "controls": sorted(ctls, key=lambda x: int(x["id"])), "safeguards": sorted(sgs, key=num)},
            "owasp": owasp}


def legal(onto):
    from rdflib import Graph, URIRef
    from rdflib.namespace import RDFS, SKOS
    ids = dict(l.rstrip("\n").split("\t") for l in open(os.path.join(onto, "src", "ids.tsv"), encoding="utf-8"))
    T = lambda k: URIRef("https://w3id.org/crgo/CRGO_%07d" % int(ids[k]))
    KEY = {T(k): k for k in ids}
    mods = Graph()
    for f in os.listdir(os.path.join(onto, "ontology")):
        if f.startswith("crgo-") and f.endswith(".ttl"):
            mods.parse(os.path.join(onto, "ontology", f))
    lab = lambda g, s: {l.language or "en": str(l) for l in list(g.objects(s, RDFS.label)) + list(g.objects(s, SKOS.prefLabel))}
    vocab = lambda prefix: [{"key": k, "label": lab(mods, T(k))} for k in ids if re.fullmatch(prefix + r"[A-Z]\w*", k) and lab(mods, T(k))]
    g = Graph().parse(os.path.join(onto, "ontology", "vocab", "legal.ttl"))
    insts = {}
    for c in sorted(set(g.subjects(None, None)), key=str):
        test = g.value(c, T("conditionTest"))
        if test is None:
            continue
        role, expr, kind = str(test).split("|")
        for inst in g.objects(c, T("conditionOf")):
            d = insts.setdefault(str(inst), {"id": str(inst).rsplit("/", 1)[1], "iri": str(inst), "label": lab(g, inst), "conditions": []})
            d["conditions"].append({"id": str(c).rsplit("/", 1)[1], "role": role, "test": expr, "interpretive": kind == "interpretive", "label": lab(g, c)})
    sys.path.insert(0, os.path.join(onto, "pipeline", "grc"))
    import applicability as A
    for d in insts.values():
        d["starts"] = A.starts(g, URIRef(d["iri"]))
        d["status"] = "proposed" if g.value(URIRef(d["iri"]), T("governanceStatus")) == T("StatusProposed") else "approved"   # 1.9.0
        d["jurisdictions"] = [KEY.get(j, str(j)) for j in g.objects(URIRef(d["iri"]), T("hasJurisdiction"))]
        d["conditions"].sort(key=lambda c: c["id"])
    prov = {}
    for f in ("loi25", "lrsss", "a21", "gdpr", "pipeda", "osfi-b13"):
        vg = Graph().parse(os.path.join(onto, "ontology", "vocab", f + ".ttl"))
        for s, n in vg.subject_objects(SKOS.notation):
            prov[str(n)] = {"iri": str(s), "scheme": f, "label": lab(vg, s)}
    return {"instruments": sorted(insts.values(), key=lambda d: d["id"]),
            "orgTypes": vocab("Org"), "jurisdictions": vocab("Jur"), "dataCategories": vocab("Data"), "technologies": vocab("Tech"),
            "lines": vocab("Line"), "aspects": vocab("Aspect"), "testResults": vocab("Test"), "complianceStates": vocab("Comp"),
            "knowledgeStatus": vocab("Ks"), "applicabilityStates": vocab("App"), "provisions": prov,
            "evaluator": "pipeline/grc/applicability.py (ported to js/crgo.js for offline use; the helper runs the original)"}


def assurance(onto):
    from rdflib import Graph, URIRef
    from rdflib.namespace import SKOS, RDFS
    ids = dict(l.rstrip("\n").split("\t") for l in open(os.path.join(onto, "src", "ids.tsv"), encoding="utf-8"))
    T = lambda k: URIRef("https://w3id.org/crgo/CRGO_%07d" % int(ids[k]))
    KEY = {T(k): k for k in ids}
    g = Graph().parse(os.path.join(onto, "ontology", "vocab", "sp800-53a.ttl"))
    ctl = {}
    ctl_of = lambda n: re.match(r"^([A-Z]{2}-\d{2}(?:\(\d{2}\))?)", n).group(1) if re.match(r"^([A-Z]{2}-\d{2}(?:\(\d{2}\))?)", n) else None
    for s, n in g.subject_objects(SKOS.notation):
        n = str(n)
        meth = g.value(s, T("usesAssessmentMethod"))
        if meth is not None:                                     # an assessment-method concept: objects to examine, people to interview, mechanisms to test
            alt = str(g.value(s, SKOS.altLabel) or n)
            c = ctl_of(alt) or alt.split("-Examine")[0]
            ctl.setdefault(c, {"objectives": [], "methods": {}})["methods"][KEY[meth][6:].lower()] = str(g.value(s, SKOS.definition) or "")
            continue
        c = ctl_of(n)
        if not c:
            continue
        d = str(g.value(s, SKOS.definition) or "") or str(g.value(s, SKOS.prefLabel) or "")[len(n):].strip()
        if d:
            ctl.setdefault(c, {"objectives": [], "methods": {}})["objectives"].append([n, d])
    for v in ctl.values():
        v["objectives"].sort()
    wp = Graph().parse(os.path.join(onto, "data", "abox", "crgo-workprogrammes.ttl"))
    progs = []
    for p in wp.subjects(T("localIdentifier"), None):
        pid = str(wp.value(p, T("localIdentifier")))
        lab = {l.language: str(l) for l in wp.objects(p, RDFS.label)}
        ob = wp.value(p, T("hasAuditObjective"))
        procs = []
        for pr in wp.objects(p, T("hasProcedure")):
            procs.append({"id": str(pr).rsplit("/", 1)[1], "label": {l.language: str(l) for l in wp.objects(pr, RDFS.label)},
                          "method": KEY.get(wp.value(pr, T("usesAssessmentMethod")), "")[6:].lower(),
                          "step": str(wp.value(pr, T("procedureStep")) or ""), "expected": str(wp.value(pr, T("expectedResult")) or ""),
                          "exception": str(wp.value(pr, T("exceptionLogic")) or ""), "sampling": str(wp.value(pr, T("samplingRationale")) or ""),
                          "objectives": sorted(str(g.value(o, SKOS.notation) or o) for o in wp.objects(pr, T("servesObjective")))})
        procs.sort(key=lambda x: x["id"])
        progs.append({"id": pid, "label": lab, "objective": {l.language: str(l) for l in wp.objects(ob, SKOS.definition)},
                      "families": sorted({re.sub(r"[a-z.\[].*$", "", o) for x in procs for o in x["objectives"]}), "illustrative": True, "procedures": procs})
    return {"controls": ctl, "programmes": sorted(progs, key=lambda x: x["id"])}


def main(onto):
    tag, onto_rel, status = release(onto)
    src = os.path.join(onto, "data", "export", "crgo-identification.json")
    with open(src, encoding="utf-8") as fh:
        d = json.load(fh)
    scen = strip(d.get("scenarios", []))
    # 0.9 additions per scenario, from the query module the MCP server uses (crgo_scenario)
    sys.path.insert(0, os.path.join(onto, "pipeline", "query"))
    import identify as I
    n = 0; notes = {}; titles = {}
    for s in scen:
        if not (s.get("attack_techniques") or s.get("obligations") or any(s.get("controls", {}).values())):
            continue
        try:
            full = I.scenario(s["id"])
        except Exception as e:                                   # noqa: BLE001
            print("  skipped", s["id"], e); continue
        # repeated explanatory strings are kept once, in "notes", rather than on 1,800 scenarios
        if full.get("other_regimes"):
            notes["other_regimes"] = full["other_regimes"].get("note", notes.get("other_regimes"))
            s["other_regimes"] = {}
            for k, v in full["other_regimes"].items():
                if k == "note": continue
                for x in v: titles.setdefault(k, {})[x["id"]] = x["title"]
                s["other_regimes"][k] = [x["id"] for x in v]
        if full.get("countermeasures_d3fend"):
            notes["d3fend"] = full["countermeasures_d3fend"][0].get("source", notes.get("d3fend"))
            for x in full["countermeasures_d3fend"]: titles.setdefault("d3fend", {})[x["id"]] = x["title"]
            s["countermeasures_d3fend"] = [[x["id"], x["confidence"], x.get("for_techniques", [])] for x in full["countermeasures_d3fend"]]
        if full.get("exploitation_evidence"):
            notes["exploitation"] = full["exploitation_evidence"].get("source", notes.get("exploitation"))
            s["exploitation_evidence"] = [[x["id"], x["kev_vulnerabilities"], x["known_ransomware_use"], x["epss_median"], x["epss_max"]]
                                          for k in ("by_technique", "by_weakness") for x in full["exploitation_evidence"].get(k, [])]
        n += 1
    out = {"schema": "crg-crgo-snapshot/2", "title": d.get("title"), "version": d.get("version"), "release": tag, "ontologyRelease": onto_rel,
           "status": status, "statusNote": STATUS_NOTE[status] % tag,
           "licence": d.get("licence"), "caveat": d.get("caveat"), "built": dt.date.today().isoformat(), "values": d.get("values"),
           "legal": legal(onto), "notes": notes, "titles": titles,
           "rows": {"countermeasures_d3fend": ["id", "confidence", "for_techniques"], "other_regimes": "regime: [ids]; titles in titles[regime]",
                    "exploitation_evidence": ["id", "kev_vulnerabilities", "known_ransomware_use", "epss_median", "epss_max"]},
           "scenarios": scen}
    if os.path.isfile(os.path.join(onto, "ontology", "vocab", "cis81.ttl")):
        out["v011"] = v011(onto)
    dst = os.path.join(ROOT, "data", "crgo-snapshot.json")
    with open(dst, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    if out.get("v011"):
        v = out["v011"]
        print(f"crgo 0.11: {len(v['patterns'])} scenario patterns, CIS v8.1 {len(v['cis81']['controls'])} controls / {len(v['cis81']['safeguards'])} safeguards "
              f"({sum(s['unverified'] for s in v['cis81']['safeguards'])} unverified), OWASP {sum(len(x) for x in v['owasp'].values())} entries")
    print(f"crgo snapshot: CRGO {tag} ({status}; ontology {onto_rel}), {len(scen)} scenarios ({n} with 0.9 detail), {os.path.getsize(dst):,} bytes -> {dst}")
    a = assurance(onto)
    a.update({"schema": "crg-crgo-assurance/1", "release": tag, "ontologyRelease": onto_rel, "built": out["built"], "status": status, "statusNote": out["statusNote"],
              "note": "NIST SP 800-53A Rev. 5 objectives and methods (public domain, NIST) and CRGO's illustrative work programmes (CC BY-NC 4.0). "
                      "The work programmes are illustrative, not a validated audit methodology."})
    dst2 = os.path.join(ROOT, "data", "crgo-assurance.json")
    with open(dst2, "w", encoding="utf-8") as fh:
        json.dump(a, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"crgo assurance: {len(a['controls'])} controls, {sum(len(v['objectives']) for v in a['controls'].values())} objectives, "
          f"{len(a['programmes'])} programmes, {os.path.getsize(dst2):,} bytes -> {dst2}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
