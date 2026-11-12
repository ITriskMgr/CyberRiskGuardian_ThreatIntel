#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""crgo_local.py — ontology proposals without the CRGO server (1.9.3, CRGO 0.11.2, contract library-proposal/v1).

When the CRGO MCP server is running, the helper (serve.py) calls its five write tools — crgo_propose_library_scenario,
crgo_list_proposals, crgo_approve_proposal, crgo_reject_proposal, crgo_export_contribution — with store_dir = this
installation's folder (<org root>/_installation/crgo-local/). When it is not, the helper calls the functions below,
which write and read THE SAME files with the same shapes, ids and cluster rule (a port of CRGO's
pipeline/contracts/proposals.py and of local_record / local_clusters in pipeline/query/grouping.py), over the snapshot
shipped with the application (data/crgo-snapshot.json, schema crg-crgo-snapshot/3). Either path can then pick up where
the other left off.

  <store>/proposals/LOC-xxxxxxxxxx.json        one proposal and its history (proposed -> approved | rejected; public)
  <store>/approved/crgo-local-extension.json   approved additions, export-shaped records loaded beside the snapshot
  <out_dir>/crgo-contribution-LOC-….json        a public contribution file (nothing is ever sent anywhere)

Schemas: data/crgo-library-proposal-v1/{proposal,contribution}.schema.json, copies of CRGO 0.11.2's, checked with the
small JSON-schema subset they use (no third-party library). Identifier checks use the snapshot: vocabulary keys, ATT&CK
ids (revoked ones refused with their successor), CWE ids, and requirement / obligation ids CRGO links to a library
scenario. Errors are CRGO's error documents (INVALID_ARGUMENT, UNKNOWN_ID, SCHEMA_INVALID, REPOSITORY_PATH,
STATUS_NOT_PROPOSED). Roles are checked by the helper, not here (CRGO records the approver's name only).
"""
from __future__ import annotations

import datetime
import hashlib
import json
import os
import re
import tempfile
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
SNAPSHOT = os.path.join(HERE, "data", "crgo-snapshot.json")
SCHEMAS = os.path.join(HERE, "data", "crgo-library-proposal-v1")
RX_LOC = re.compile(r"^LOC-[0-9a-f]{10}$")
RX_DATE = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}$")
CONTENT_KEYS = ("name", "statement", "themes", "asset_categories", "threat_source_types", "impact_dimensions", "weaknesses",
                "techniques", "cwe", "csf2", "sp80053r5", "iso27002", "loi25")
STATUSES = ("proposed", "approved", "rejected")
EXTENSION = os.path.join("approved", "crgo-local-extension.json")
STOP = {"a", "an", "and", "at", "attack", "by", "due", "for", "from", "in", "of", "on", "or", "risk", "scenario", "the",
        "through", "to", "via", "with"}
_WS = re.compile(r"[ \t\n\r\f\v\xa0]+")


class ProposalError(ValueError):
    def __init__(self, code, message, details=None):
        super().__init__(message)
        self.code, self.message, self.details = code, message, details

    def document(self):
        d = {"error": True, "code": self.code, "message": self.message}
        if self.details:
            d["details"] = [str(x) for x in self.details]
        return d


# ---------------------------------------------------------------- text (grouping.py)
def nfc(s):
    return unicodedata.normalize("NFC", str(s if s is not None else ""))


def norm_text(s):
    return _WS.sub(" ", nfc(s).lower()).strip()


def tokens(s, stop=STOP):
    return {w for w in re.findall(r"[a-z0-9]+", norm_text(s)) if w not in stop}


def canonical(obj):
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha10(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:10]


def risk_of(rec):
    e = rec.get("estimates") or {}
    for k in ("case_calibrated", "case", "library_2023"):
        r = (e.get(k) or {}).get("risk") or {}
        if r.get("estimated") is not None:
            return float(r["estimated"])
    return 0.0


# ---------------------------------------------------------------- reference (the snapshot)
class Reference:
    """What the proposal tools need from the snapshot: release, vocabulary labels, ATT&CK and CWE ids, titles of linked
    identifiers, and the library's cluster representatives."""

    def __init__(self, doc):
        g = doc.get("grouping")
        if not g:
            raise ProposalError("INVALID_ARGUMENT", "The ontology snapshot has no 'grouping' block: it needs CRGO 0.11.2 (tools/build_crgo.py).")
        self.release = doc.get("version") or doc.get("release")
        vals = doc.get("values") or {}
        self.labels = {k: {x["key"]: x["label"] for x in vals.get(k, [])} for k in ("asset_category", "theme", "threat_source_type", "impact_dimension")}
        self.active = set(g["attack"]["active"])
        self.replaced = dict(g["attack"]["replaced"])
        self.deprecated = set(g["attack"]["deprecated"])
        self.cwe_ids = set(g["cwe_ids"])
        self.stop = set(g.get("stop_words") or STOP)
        self.library = [r for r in doc.get("scenarios", []) if r.get("kind") == "library scenario"]
        self.titles = {}
        for r in self.library:
            for t in r.get("attack_techniques", []): self.titles.setdefault(("attack", t["id"]), t.get("title", ""))
            for t in r.get("cwe", []): self.titles.setdefault(("cwe", t["id"]), t.get("title", ""))
            for fw, xs in (r.get("controls") or {}).items():
                for t in xs: self.titles.setdefault((fw, t["id"]), t.get("title", ""))
            for t in r.get("obligations", []): self.titles.setdefault(("obligation", t["id"]), t.get("title", ""))
        self.provisions = set(((doc.get("legal") or {}).get("provisions") or {}).keys())

    def successor(self, t):
        seen = set()
        while t in self.replaced and t not in seen:
            seen.add(t); t = self.replaced[t]
        return t

    def id_exists(self, fw, ident):
        """Requirement / obligation identifiers CRGO links to a library scenario (or a Loi 25 provision it holds)."""
        key = {"csf2": "csf2", "sp80053r5": "sp800-53r5", "sp800-53r5": "sp800-53r5", "iso27002": "iso27002-2022",
               "iso27002-2022": "iso27002-2022", "loi25": "obligation"}.get(fw, fw)
        return (key, ident) in self.titles or (fw == "loi25" and ident in self.provisions)


_REF = {"mtime": None, "ref": None}


def reference(path=SNAPSHOT):
    m = os.path.getmtime(path)
    if _REF["mtime"] != m:
        with open(path, encoding="utf-8") as fh:
            _REF["ref"], _REF["mtime"] = Reference(json.load(fh)), m
    return _REF["ref"]


# ---------------------------------------------------------------- the JSON-schema subset of the two schemas
def _schema(name):
    with open(os.path.join(SCHEMAS, name), encoding="utf-8") as fh:
        return json.load(fh)


def _check(x, s, path, errs):
    p = "/".join(path) or "(root)"
    if "const" in s and x != s["const"]:
        errs.append("%s: %r was expected" % (p, s["const"])); return
    if "enum" in s and x not in s["enum"]:
        errs.append("%s: %r is not one of %r" % (p, x, s["enum"])); return
    t = s.get("type")
    ok = {"object": isinstance(x, dict), "array": isinstance(x, list), "string": isinstance(x, str),
          "boolean": isinstance(x, bool)}.get(t, True)
    if not ok:
        errs.append("%s: %r is not of type %r" % (p, x, t)); return
    if isinstance(x, str):
        if "minLength" in s and len(x) < s["minLength"]: errs.append("%s: %r is too short" % (p, x))
        if "maxLength" in s and len(x) > s["maxLength"]: errs.append("%s: %r is too long" % (p, x[:40]))
        if "pattern" in s and not re.search(s["pattern"], x): errs.append("%s: %r does not match %r" % (p, x, s["pattern"]))
    if isinstance(x, list):
        if "minItems" in s and len(x) < s["minItems"]: errs.append("%s: %r is too short" % (p, x))
        if "maxItems" in s and len(x) > s["maxItems"]: errs.append("%s: is too long" % p)
        if s.get("uniqueItems") and len({canonical(v) for v in x}) != len(x): errs.append("%s: %r has non-unique elements" % (p, x))
        pre = s.get("prefixItems") or []
        for i, v in enumerate(x):
            sub = pre[i] if i < len(pre) else s.get("items")
            if isinstance(sub, dict): _check(v, sub, path + [str(i)], errs)
    if isinstance(x, dict):
        props = s.get("properties") or {}
        for k in s.get("required", []):
            if k not in x: errs.append("%s: %r is a required property" % (p, k))
        if s.get("additionalProperties") is False:
            extra = sorted(set(x) - set(props))
            if extra: errs.append("%s: Additional properties are not allowed (%s)" % (p, ", ".join(repr(e) for e in extra)))
        for k, v in x.items():
            if k in props: _check(v, props[k], path + [k], errs)


def validate_doc(doc, name):
    errs = []
    _check(doc, _schema(name), [], errs)
    return sorted(errs)


# ---------------------------------------------------------------- local records (grouping.py)
def local_record(pid, proposal, ref, approver, date):
    lab = ref.labels
    link = lambda scheme, xs: [{"id": i, "title": ref.titles.get((scheme, i), ""), "confidence": c, "status": "proposed"} for i, c in xs]
    return {"id": pid, "name": proposal["name"], "kind": "local scenario", "source": "local", "statement": proposal["statement"],
            "themes": [{"key": k, "label": lab["theme"][k]} for k in proposal["themes"]],
            "asset_categories": [lab["asset_category"][k] for k in proposal.get("asset_categories", [])],
            "threat_source_types": [lab["threat_source_type"][k] for k in proposal.get("threat_source_types", [])],
            "impact_dimensions": [lab["impact_dimension"][k] for k in proposal.get("impact_dimensions", [])],
            "weaknesses": list(proposal.get("weaknesses", [])),
            "attack_techniques": link("attack", proposal.get("techniques", [])),
            "controls": {"csf2": link("csf2", proposal.get("csf2", [])), "sp800-53r5": link("sp800-53r5", proposal.get("sp80053r5", [])),
                         "iso27002-2022": link("iso27002-2022", proposal.get("iso27002", []))},
            "obligations": link("obligation", proposal.get("loi25", [])),
            "cwe": link("cwe", proposal.get("cwe", [])),
            "primary_theme": proposal["themes"][0], "cluster": pid, "approved_by": approver, "approved_on": date}


def local_clusters(local, ref):
    reps = []
    for r in ref.library:
        if r.get("cluster") == r["id"]:
            reps.append((r["primary_theme"], -risk_of(r), r["id"], tokens(r.get("name", ""), ref.stop)))
    reps.sort(key=lambda x: (x[0], x[1], x[2]))
    reps = [(x[2], x[0], x[3]) for x in reps]
    out = []
    for r in sorted(local, key=lambda r: r["id"]):
        r = dict(r); r["primary_theme"] = r["themes"][0]["key"]
        tk = tokens(r.get("name", ""), ref.stop)
        rep = next((rid for rid, th, rtk in reps if th == r["primary_theme"] and 5 * len(tk & rtk) >= 2 * max(1, len(tk | rtk))), None)
        if rep is None:
            reps.append((r["id"], r["primary_theme"], tk)); rep = r["id"]
        r["cluster"] = rep
        out.append(r)
    return out


# ---------------------------------------------------------------- paths and files (proposals.py)
def store_path(store_dir):
    p = str(store_dir or "").strip()
    if not p or "\x00" in p or not os.path.isabs(p):
        raise ProposalError("INVALID_ARGUMENT", "store_dir must be an absolute path.")
    if not os.path.isdir(p):
        raise ProposalError("INVALID_ARGUMENT", "store_dir is not an existing folder.", [p])
    return os.path.realpath(p)


def _write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), prefix=".tmp-", suffix=".json")
    with os.fdopen(fd, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=1, sort_keys=True)
        fh.write("\n")
    os.replace(tmp, path)


def _date(date):
    d = str(date or "").strip() or datetime.date.today().isoformat()
    try:
        if not RX_DATE.match(d): raise ValueError
        datetime.date.fromisoformat(d)
    except ValueError:
        raise ProposalError("INVALID_ARGUMENT", "date must be written yyyy-mm-dd.")
    return d


def _who(name, what):
    n = nfc(name).strip() if isinstance(name, str) else ""
    if not n or len(n) > 200:
        raise ProposalError("INVALID_ARGUMENT", "%s is required (a name of at most 200 characters)." % what)
    return n


def _pid(proposal_id):
    p = str(proposal_id or "").strip()
    if not RX_LOC.match(p):
        raise ProposalError("INVALID_ARGUMENT", "proposal_id must look like 'LOC-' followed by 10 hexadecimal digits.")
    return p


def _load(store, pid):
    path = os.path.join(store, "proposals", pid + ".json")
    if not os.path.isfile(path):
        raise ProposalError("UNKNOWN_ID", "unknown proposal: %s" % pid)
    with open(path, encoding="utf-8") as fh:
        return json.load(fh), path


def load_local(store_dir):
    """Approved local records of a store ([] without a store or before the first approval)."""
    if not store_dir or not os.path.isdir(store_dir):
        return []
    path = os.path.join(store_dir, EXTENSION)
    if not os.path.isfile(path):
        return []
    with open(path, encoding="utf-8") as fh:
        return list(json.load(fh).get("scenarios", []))


def _nfc(x):
    if isinstance(x, str): return nfc(x).strip()
    if isinstance(x, list): return [_nfc(v) for v in x]
    if isinstance(x, dict): return {k: _nfc(v) for k, v in x.items()}
    return x


def proposal_id(proposal):
    return "LOC-" + sha10(canonical({k: proposal[k] for k in CONTENT_KEYS if k in proposal}))


def check_proposal(proposal, ref):
    if not isinstance(proposal, dict):
        raise ProposalError("SCHEMA_INVALID", "proposal must be a JSON object valid against proposal.schema.json.")
    errs = validate_doc(proposal, "proposal.schema.json")
    if errs:
        raise ProposalError("SCHEMA_INVALID", "The proposal does not conform to library-proposal/v1 (no parameters, estimates or organisation figures).", errs)
    bad = []
    for field, kind in (("themes", "theme"), ("asset_categories", "asset_category"), ("threat_source_types", "threat_source_type"), ("impact_dimensions", "impact_dimension")):
        bad += ["%s: unknown %s %s" % (field, kind, v) for v in proposal.get(field, []) if v not in ref.labels[kind]]
    for t, _c in proposal.get("techniques", []):
        if t in ref.replaced: bad.append("techniques: %s is revoked, use %s" % (t, ref.successor(t)))
        elif t in ref.deprecated: bad.append("techniques: %s is deprecated and has no successor" % t)
        elif t not in ref.active: bad.append("techniques: unknown ATT&CK id %s" % t)
    bad += ["cwe: unknown %s" % w for w, _c in proposal.get("cwe", []) if w not in ref.cwe_ids]
    for field in ("csf2", "sp80053r5", "iso27002", "loi25"):
        bad += ["%s: unknown requirement %s" % (field, i) for i, _c in proposal.get(field, []) if not ref.id_exists(field, i)]
    for field in ("techniques", "cwe", "csf2", "sp80053r5", "iso27002", "loi25"):
        ids = [i for i, _c in proposal.get(field, [])]
        bad += ["%s: %s listed twice" % (field, i) for i in sorted({i for i in ids if ids.count(i) > 1})]
    if bad:
        raise ProposalError("INVALID_ARGUMENT", "The proposal uses identifiers CRGO does not hold (CRGO never invents identifiers).", bad)


# ---------------------------------------------------------------- operations
def propose(proposal, store_dir, ref=None):
    ref = ref or reference()
    store = store_path(store_dir)
    proposal = _nfc(proposal) if isinstance(proposal, dict) else proposal
    check_proposal(proposal, ref)
    pid = proposal_id(proposal)
    path = os.path.join(store, "proposals", pid + ".json")
    if os.path.isfile(path):
        with open(path, encoding="utf-8") as fh:
            doc = json.load(fh)
        return {"id": pid, "status": doc["status"], "path": path, "existing": True}
    doc = {"schema": "crgo-library-proposal/1", "id": pid, "status": "proposed", "crgo_release": ref.release, "proposal": proposal,
           "history": [{"status": "proposed", "by": proposal["proposed_by"], "on": proposal["proposed_on"]}]}
    _write(path, doc)
    return {"id": pid, "status": "proposed", "path": path, "existing": False}


def _summary(doc):
    p = doc["proposal"]
    s = {"id": doc["id"], "status": doc["status"], "name": p["name"], "proposed_by": p["proposed_by"], "proposed_on": p["proposed_on"]}
    dec = [h for h in doc.get("history", []) if h.get("status") in ("approved", "rejected")]
    if dec:
        s["decided_by"], s["decided_on"] = dec[-1]["by"], dec[-1]["on"]
        if dec[-1].get("reason"): s["reason"] = dec[-1]["reason"]
    pub = [h for h in doc.get("history", []) if "public" in h]
    if pub: s["public"] = pub[-1]["public"]
    elif p.get("public"): s["public"] = "requested"
    return s


def list_proposals(store_dir, status=""):
    store = store_path(store_dir)
    status = str(status or "").strip()
    if status and status not in STATUSES:
        raise ProposalError("INVALID_ARGUMENT", "status must be one of %s or empty." % ", ".join(STATUSES), list(STATUSES))
    folder = os.path.join(store, "proposals")
    out = []
    for f in sorted(os.listdir(folder)) if os.path.isdir(folder) else []:
        if f.endswith(".json") and RX_LOC.match(f[:-5]):
            with open(os.path.join(folder, f), encoding="utf-8") as fh:
                doc = json.load(fh)
            if not status or doc["status"] == status: out.append(_summary(doc))
    return {"proposals": sorted(out, key=lambda s: s["id"]), "count": len(out)}


def read_proposal(store_dir, proposal_id_):
    """The whole proposal document (for the preview; not a CRGO tool)."""
    doc, _path = _load(store_path(store_dir), _pid(proposal_id_))
    return doc


def approve(store_dir, proposal_id_, approver, date, ref=None):
    ref = ref or reference()
    store, pid = store_path(store_dir), _pid(proposal_id_)
    approver, date = _who(approver, "approver"), _date(date)
    doc, path = _load(store, pid)
    if doc["status"] != "proposed":
        raise ProposalError("STATUS_NOT_PROPOSED", "proposal %s is already %s." % (pid, doc["status"]))
    local = [r for r in load_local(store) if r["id"] != pid]
    local.append(local_record(pid, doc["proposal"], ref, approver, date))
    local = local_clusters(local, ref)
    _write(os.path.join(store, EXTENSION), {"schema": "crgo-local-extension/1", "release_built_against": ref.release, "scenarios": local})
    doc["status"] = "approved"
    doc["history"].append({"status": "approved", "by": approver, "on": date})
    _write(path, doc)
    rec = next(r for r in local if r["id"] == pid)
    return {"id": pid, "status": "approved", "path": path, "local_extension": os.path.join(store, EXTENSION),
            "primary_theme": rec["primary_theme"], "cluster": rec["cluster"]}


def reject(store_dir, proposal_id_, approver, date, reason):
    store, pid = store_path(store_dir), _pid(proposal_id_)
    approver, date = _who(approver, "approver"), _date(date)
    reason = nfc(reason).strip() if isinstance(reason, str) else ""
    if not reason or len(reason) > 1000:
        raise ProposalError("INVALID_ARGUMENT", "reason is required to reject a proposal (at most 1,000 characters).")
    doc, path = _load(store, pid)
    if doc["status"] != "proposed":
        raise ProposalError("STATUS_NOT_PROPOSED", "proposal %s is already %s." % (pid, doc["status"]))
    doc["status"] = "rejected"
    doc["history"].append({"status": "rejected", "by": approver, "on": date, "reason": reason})
    _write(path, doc)
    return {"id": pid, "status": "rejected", "path": path}


def contribution(doc, action, date, tool, release):
    p = doc["proposal"]
    return {"schema": "crgo-contribution/1", "for": "ITriskMgr/CyberRiskGuardian-Ontology", "crgo_release": release, "status": "proposed",
            "action": action, "key": "CONTRIB-" + doc["id"],
            "scenario": {"name": p["name"], "statement": p["statement"], "theme": p["themes"][0],
                         "asset_categories": p.get("asset_categories", []), "threat_source_types": p.get("threat_source_types", []),
                         "impact_dimensions": p.get("impact_dimensions", []), "weaknesses": p.get("weaknesses", []),
                         "attack": p.get("techniques", []), "csf2": p.get("csf2", []), "sp80053r5": p.get("sp80053r5", []),
                         "iso27002": p.get("iso27002", []), "loi25": p.get("loi25", []), "cwe": p.get("cwe", [])},
            "provenance": {"tool": tool, "anonymized": True, "submitted_on": date}}


def export_contribution(store_dir, proposal_id_, out_dir, action="add", date="", tool="", ref=None):
    """out_dir is checked by the helper (Folder for ontology proposals, outside the CRGO folder)."""
    ref = ref or reference()
    store, pid = store_path(store_dir), _pid(proposal_id_)
    out = str(out_dir or "").strip()
    if not out or not os.path.isabs(out) or not os.path.isdir(out):
        raise ProposalError("INVALID_ARGUMENT", "out_dir must be the absolute path of the folder for ontology proposals.")
    action = str(action or "add").strip()
    if action not in ("add", "withdraw"):
        raise ProposalError("INVALID_ARGUMENT", "action must be 'add' or 'withdraw'.", ["add", "withdraw"])
    date = _date(date)
    tool = nfc(tool).strip() if isinstance(tool, str) and tool.strip() else "CRGO %s crgo_export_contribution" % ref.release
    if len(tool) > 100:
        raise ProposalError("INVALID_ARGUMENT", "tool: at most 100 characters.")
    doc, path = _load(store, pid)
    if doc["status"] != "approved":
        raise ProposalError("STATUS_NOT_PROPOSED", "only an approved proposal can be made public (%s is %s)." % (pid, doc["status"]))
    c = contribution(doc, action, date, tool, ref.release)
    errs = validate_doc(c, "contribution.schema.json")
    if errs:
        raise ProposalError("SCHEMA_INVALID", "The contribution does not conform to contribution.schema.json.", errs)
    f = os.path.join(os.path.realpath(out), "crgo-contribution-%s%s.json" % (pid, "-withdraw" if action == "withdraw" else ""))
    _write(f, c)
    doc["history"].append({"public": "submitted" if action == "add" else "withdrawn", "on": date, "file": os.path.basename(f)})
    _write(path, doc)
    return {"id": pid, "action": action, "path": f}
