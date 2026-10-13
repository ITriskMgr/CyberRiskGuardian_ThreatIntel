#!/usr/bin/env python3
"""build_crgo.py — the offline snapshots of the CyberRiskGuardian Ontology (1.5.8, CRGO 0.9.x).

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


def strip(x):
    if isinstance(x, dict):
        return {k: strip(v) for k, v in x.items() if k not in ("iri", "caveat", "framework")}
    if isinstance(x, list):
        return [strip(v) for v in x]
    return x


def release(onto):
    """(tag release from CHANGELOG, ontology release from src/build.py)."""
    tag = None
    for line in open(os.path.join(onto, "CHANGELOG.md"), encoding="utf-8"):
        m = re.match(r"## \[(\d+\.\d+\.\d+)\]", line)
        if m:
            tag = m.group(1); break
    onto_rel = next((l.split('"')[1] for l in open(os.path.join(onto, "src", "build.py"), encoding="utf-8") if l.startswith("VERSION")), None)
    return tag, onto_rel


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
    for c in g.subjects(None, None):
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
        d["jurisdictions"] = [KEY.get(j, str(j)) for j in g.objects(URIRef(d["iri"]), T("hasJurisdiction"))]
        d["conditions"].sort(key=lambda c: c["id"])
    prov = {}
    for f in ("loi25", "lrsss", "a21", "gdpr", "pipeda", "osfi-b13"):
        vg = Graph().parse(os.path.join(onto, "ontology", "vocab", f + ".ttl"))
        for s, n in vg.subject_objects(SKOS.notation):
            prov[str(n)] = {"iri": str(s), "scheme": f, "label": lab(vg, s)}
    return {"instruments": sorted(insts.values(), key=lambda d: d["id"]),
            "orgTypes": vocab("Org"), "jurisdictions": vocab("Jur"), "dataCategories": vocab("Data"),
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
    tag, onto_rel = release(onto)
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
           "licence": d.get("licence"), "caveat": d.get("caveat"), "built": dt.date.today().isoformat(), "values": d.get("values"),
           "legal": legal(onto), "notes": notes, "titles": titles,
           "rows": {"countermeasures_d3fend": ["id", "confidence", "for_techniques"], "other_regimes": "regime: [ids]; titles in titles[regime]",
                    "exploitation_evidence": ["id", "kev_vulnerabilities", "known_ransomware_use", "epss_median", "epss_max"]},
           "scenarios": scen}
    dst = os.path.join(ROOT, "data", "crgo-snapshot.json")
    with open(dst, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"crgo snapshot: CRGO {tag} (ontology {onto_rel}), {len(scen)} scenarios ({n} with 0.9 detail), {os.path.getsize(dst):,} bytes -> {dst}")
    a = assurance(onto)
    a.update({"schema": "crg-crgo-assurance/1", "release": tag, "ontologyRelease": onto_rel, "built": out["built"],
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
