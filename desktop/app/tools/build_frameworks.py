#!/usr/bin/env python3
"""build_frameworks.py — make or check a CyberRiskGuardian framework pack.

A pack is what the Frameworks screen imports:

    {"schema": "crg-framework-pack/1",
     "framework": {"id", "name", "short", "edition", "date", "origin", "note", "url"},
     "controls": [{"id", "title", "grp", "fn", "tags", "note", "enh"}, ...]}

The app imports OSCAL and CSV directly, so this is for the offline route: converting a file on a
machine without the app open, or checking a pack before handing it to someone else.

    python3 build_frameworks.py from-oscal catalog.json --id NIST-171 --short "SP 800-171" \
        --name "NIST SP 800-171 Revision 3" --edition "Revision 3" --date 2024-05-14 -o pack.json
    python3 build_frameworks.py from-csv requirements.csv --id ITSP-171 --short "ITSP.10.171" -o pack.json
    python3 build_frameworks.py check pack.json

Standard library only. © 2026 Marc-André Léger. CC BY-NC 4.0
"""
import argparse, csv, json, re, sys

SCHEMA = "crg-framework-pack/1"


def framework(a, **extra):
    f = {"id": a.id, "name": a.name or a.short or a.id, "short": a.short or a.id,
         "edition": a.edition or "", "date": a.date or "", "origin": a.origin or "", 
         "note": a.note or "", "url": a.url or ""}
    f.update({k: v for k, v in extra.items() if v and not f.get(k)})
    return f


def from_oscal(path, a):
    cat = json.load(open(path, encoding="utf-8")).get("catalog")
    if not cat:
        sys.exit("Not an OSCAL catalog: no top-level 'catalog' object.")
    out = []

    def walk(node, grp):
        for g in node.get("groups", []) or []:
            walk(g, " — ".join(x for x in (g.get("id"), g.get("title")) if x))
        for c in node.get("controls", []) or []:
            out.append({"id": c["id"], "title": c.get("title", ""), "grp": grp,
                        "fn": "Prevention", "tags": [], "note": "", "enh": False})
            for e in c.get("controls", []) or []:
                out.append({"id": e["id"], "title": e.get("title", ""), "grp": grp,
                            "fn": "Prevention", "tags": [], "note": "", "enh": True})

    walk(cat, "")
    if not out:
        sys.exit("The OSCAL catalog contains no controls.")
    meta = cat.get("metadata", {})
    return {"schema": SCHEMA,
            "framework": framework(a, name=meta.get("title", ""), edition=meta.get("version", ""),
                                   date=(meta.get("last-modified") or "")[:10], origin="OSCAL import"),
            "controls": out}


def from_csv(path, a):
    with open(path, newline="", encoding="utf-8-sig") as fh:
        rows = list(csv.reader(fh))
    if len(rows) < 2:
        sys.exit("The CSV needs a header row and at least one control.")
    head = [re.sub(r"[^a-z]", "", h.lower()) for h in rows[0]]

    def col(*names):
        for n in names:
            if n in head:
                return head.index(n)
        return -1

    ci, ct = col("id", "identifier", "control", "controlid", "ref"), col("title", "name", "description")
    if ci < 0 or ct < 0:
        sys.exit(f"The CSV needs an id column and a title column. Found: {', '.join(rows[0])}")
    cg, cf, cx, cn, ce = (col("group", "family", "theme", "domain", "category", "clause"),
                          col("function", "fn"), col("tags", "tag"), col("note", "notes"),
                          col("enhancement", "enh"))
    get = lambda r, i: (r[i].strip() if 0 <= i < len(r) and r[i] else "")
    out = []
    for r in rows[1:]:
        cid = get(r, ci)
        if not cid:
            continue
        out.append({"id": cid, "title": get(r, ct), "grp": get(r, cg),
                    "fn": get(r, cf) or "Prevention",
                    "tags": [t.strip() for t in re.split(r"[;,|]", get(r, cx)) if t.strip()],
                    "note": get(r, cn),
                    "enh": get(r, ce).lower() in ("1", "true", "yes", "y")})
    if not out:
        sys.exit("No rows with an identifier were found.")
    return {"schema": SCHEMA, "framework": framework(a, origin="CSV import"), "controls": out}


def check(path):
    p = json.load(open(path, encoding="utf-8"))
    errs = []
    if p.get("schema") != SCHEMA:
        errs.append(f"schema is {p.get('schema')!r}, expected {SCHEMA!r}")
    f = p.get("framework") or {}
    if not re.fullmatch(r"[A-Za-z0-9._-]{2,24}", str(f.get("id", ""))):
        errs.append("framework.id must be 2–24 characters of letters, digits, dot, dash or underscore")
    if not f.get("name"):
        errs.append("framework.name is required")
    cs = p.get("controls")
    if not isinstance(cs, list) or not cs:
        errs.append("controls must be a non-empty array")
    else:
        seen = set()
        for i, c in enumerate(cs, 1):
            if not c.get("id"):
                errs.append(f"control {i} has no id")
            elif c["id"] in seen:
                errs.append(f"duplicate control id {c['id']!r}")
            else:
                seen.add(c["id"])
            if c.get("id") and not c.get("title"):
                errs.append(f"control {c['id']!r} has no title")
    for e in errs[:20]:
        print("  ✗", e)
    if errs:
        sys.exit(f"{len(errs)} problem(s); the app would refuse this pack.")
    groups = len({c.get("grp", "") for c in cs})
    enh = sum(1 for c in cs if c.get("enh"))
    print(f"  ✓ {f['short'] or f['id']} — {len(cs)} controls in {groups} group(s), {enh} enhancement(s)"
          f"{', edition ' + f['edition'] if f.get('edition') else ''}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("from-oscal", "from-csv"):
        s = sub.add_parser(name)
        s.add_argument("input")
        s.add_argument("--id", required=True, help="framework id used as the control-key prefix")
        s.add_argument("--short", default=""); s.add_argument("--name", default="")
        s.add_argument("--edition", default=""); s.add_argument("--date", default="")
        s.add_argument("--origin", default=""); s.add_argument("--note", default="")
        s.add_argument("--url", default=""); s.add_argument("-o", "--out", default="-")
    c = sub.add_parser("check"); c.add_argument("input")
    a = ap.parse_args()

    if a.cmd == "check":
        return check(a.input)
    pack = from_oscal(a.input, a) if a.cmd == "from-oscal" else from_csv(a.input, a)
    text = json.dumps(pack, indent=1, ensure_ascii=False)
    if a.out == "-":
        print(text)
    else:
        open(a.out, "w", encoding="utf-8").write(text)
        print(f"  ✓ {a.out} — {len(pack['controls'])} controls", file=sys.stderr)


if __name__ == "__main__":
    main()
