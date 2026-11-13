#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""route_code_check.py — gate (1.9.3, T7): every route of the application has a stable screen code (SCR-nn) in
js/screencodes.js, and no code is used twice.

Routes are read from the code, not from a list kept by hand: the panels of PANELS in js/app.js, the menu entries
and sub-menu tabs of js/menu.js, and the tabs of Organization in js/panels/org.js. A panel is a route ("org"); a tab
is a route ("org/crown"). The registry may hold more codes than there are routes only if they are marked retired.

    python3 tools/route_code_check.py            # check (exit 1 on a problem)
    python3 tools/route_code_check.py --list     # print the routes found
    python3 tools/route_code_check.py --add      # append codes for the routes that lack one (then commit the file)
"""
import os
import re
import sys

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(APP, p), encoding="utf-8").read()


def routes():
    out = []
    m = re.search(r"const PANELS = \{([^}]*)\}", rd("js/app.js"))
    for item in m.group(1).split(","):
        item = item.strip()
        if not item:
            continue
        key = item.split(":")[0].strip()
        out.append(key)
    menu = rd("js/menu.js")
    for m in re.finditer(r"\bsub\('(\w+)',\s*'[^']*',\s*\[\[(.*?)\]\]", menu, re.S):
        out.append(m.group(1))
        for a in re.findall(r"(?:^|\[)'(\w+)',\s*'", "[" + m.group(2)):
            out.append(f"{m.group(1)}/{a}")
    for m in re.finditer(r"\bT\('(\w+)',\s*'[^']*',\s*\{[^}]*\barg:\s*'(\w+)'", menu):
        out.append(m.group(1)); out.append(f"{m.group(1)}/{m.group(2)}")
    for m in re.finditer(r"\bT\('(\w+)',", menu):
        out.append(m.group(1))
    org = re.search(r"const tabs = \[(\[.*?\])\];", rd("js/panels/org.js"), re.S)
    for a in re.findall(r"\['(\w+)',", org.group(1)):
        out.append(f"org/{a}")
    # 1.9.3: the tabs of Ontology · CRGO (suggest, explore, link, connection, proposals)
    on = re.search(r"for \(const \[k, t\] of \[(\[.*?\])\]\)", rd("js/panels/ontology.js"), re.S)
    if on:
        for a in re.findall(r"\['(\w+)',", on.group(1)):
            out.append(f"ontology/{a}")
    seen, uniq = set(), []
    for r in out:
        if r not in seen:
            seen.add(r); uniq.append(r)
    return uniq


def registry():
    src = rd("js/screencodes.js")
    entries = re.findall(r"^\s*'([\w/]+)':\s*'(SCR-\d+)'", src, re.M)
    return entries


def main():
    rs = routes()
    if "--list" in sys.argv:
        print("\n".join(rs)); return 0
    ents = registry()
    codes = {}
    for r, c in ents:
        codes.setdefault(c, []).append(r)
    have = {r for r, _ in ents}
    if "--add" in sys.argv:
        n = max([int(c[4:]) for c in codes] + [0])
        add = [r for r in rs if r not in have]
        lines = []
        for r in add:
            n += 1; lines.append(f"  '{r}': 'SCR-{n:02d}',\n")
        p = os.path.join(APP, "js/screencodes.js")
        s = open(p, encoding="utf-8").read()
        s = s.replace("  // @@END", "".join(lines) + "  // @@END")
        open(p, "w", encoding="utf-8").write(s)
        print(f"added {len(add)} codes"); return 0
    bad = []
    for r in rs:
        if r not in have:
            bad.append(f"route without a screen code: {r}")
    for c, rr in codes.items():
        if len(rr) > 1:
            bad.append(f"code {c} used by several routes: {', '.join(rr)}")
    seen = {}
    for r, c in ents:
        if r in seen and seen[r] != c:
            bad.append(f"route {r} has two codes")
        seen[r] = c
    for r in have - set(rs):
        bad.append(f"code for a route that no longer exists: {r}")
    if bad:
        print("route_code_check: FAILED"); print("\n".join("  " + b for b in bad)); return 1
    print(f"route_code_check: ok ({len(rs)} routes, {len(codes)} codes)"); return 0


if __name__ == "__main__":
    sys.exit(main())
