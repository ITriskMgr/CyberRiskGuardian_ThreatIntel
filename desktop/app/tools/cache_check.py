#!/usr/bin/env python3
"""cache_check.py — every module and data file the application loads is in the offline cache (1.5.7).

A module missing from sw.js FILES works while the helper serves the folder and fails the day the
installed app runs offline — which is when nobody is looking. This gate fails the build instead.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "sw.js"), encoding="utf-8").read()
listed = set(re.findall(r'"([^"]+)"', src[src.index("const FILES"):src.index("];", src.index("const FILES"))]))
need = []
for d in ("js", "js/panels", "js/data", "js/i18n", "help", "frameworks", "data", "examples/threat-context", "data/simulation", "data/simulation/medibec"):
    for f in sorted(os.listdir(os.path.join(ROOT, d))):
        p = f"{d}/{f}"
        if os.path.isfile(os.path.join(ROOT, p)) and not f.startswith("."):
            need.append(p)
missing = [p for p in need if p not in listed]
gone = [p for p in listed if p not in ("./",) and not os.path.exists(os.path.join(ROOT, p))]
print(f"cache_check: {len(listed)} files cached · {len(missing)} missing · {len(gone)} listed but absent")
for p in missing:
    print("  not cached:", p)
for p in gone:
    print("  listed, absent:", p)
sys.exit(1 if missing or gone else 0)
