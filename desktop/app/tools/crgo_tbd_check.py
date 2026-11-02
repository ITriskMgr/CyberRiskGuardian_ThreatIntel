#!/usr/bin/env python3
"""crgo_tbd_check.py — the CRGO identifiers of the Identity & access management and Configuration management modules.

Usage
  python3 tools/crgo_tbd_check.py            # report how many placeholders remain (exit 0)
  python3 tools/crgo_tbd_check.py --release  # a release build: exit 1 while any CRGO_TBD placeholder remains
  python3 tools/crgo_tbd_check.py --release --crgo /path/to/CRGO   # also: every IRI of IAM.CRGO and CM.CRGO is defined in that checkout

Each module's CRGO alignment lives in one map: IAM.CRGO in js/iam.js and CM.CRGO in js/cm.js. Their IRIs were placeholders
(https://w3id.org/crgo/CRGO_TBD-nn) until 1.9.0 filled them from CRGO 0.11.0 (docs/crg-brief-0.11.0.md); the gate
keeps a placeholder from coming back. With --crgo, each IRI must be a term defined (subject of a triple) in one of
the checkout's ontology modules.
© 2026 Marc-André Léger. CC BY-NC 4.0
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
hits = []
for f in sorted((ROOT / "js").rglob("*.js")):
    if "/i18n/" in f.as_posix():
        continue
    for i, line in enumerate(f.read_text(encoding="utf-8").split("\n"), 1):
        if "CRGO_TBD" in line:
            hits.append(f"{f.relative_to(ROOT)}:{i}")
MAPS = [ROOT / "js" / "iam.js", ROOT / "js" / "cm.js"]
n = sum(1 for p in MAPS for _ in re.finditer(r"TBD\(\d+\)", p.read_text(encoding="utf-8")))
missing = []
if "--crgo" in sys.argv:
    home = pathlib.Path(sys.argv[sys.argv.index("--crgo") + 1])
    defined = set()
    for f in (home / "ontology").glob("crgo-*.ttl"):
        defined |= set(re.findall(r"^crgo:(CRGO_\d{7})\s", f.read_text(encoding="utf-8"), re.M))
    used = []
    for p in MAPS:
        block = p.read_text(encoding="utf-8")
        block = block[block.index("export const CRGO = {"):]
        block = block[:block.index("\n};")]
        used += re.findall(r"T\('(CRGO_\d{7})'", block)
    missing = sorted(set(u for u in used if u not in defined))
    print(f"crgo_tbd_check: {len(set(used))} CRGO identifiers checked against {home}" + (f"; not defined there: {', '.join(missing)}" if missing else ""))
if missing:
    print("crgo_tbd_check: FAIL — IAM.CRGO or CM.CRGO cites identifiers this CRGO does not define")
    sys.exit(1)
if "--release" in sys.argv and (hits or n):
    print(f"crgo_tbd_check: FAIL — {n} CRGO placeholder(s) remain in IAM.CRGO or CM.CRGO ({', '.join(hits[:5])}); fill them from CRGO 0.11")
    sys.exit(1)
print(f"crgo_tbd_check: {n} CRGO placeholder(s) waiting for CRGO 0.11" if n else "crgo_tbd_check: every CRGO identifier is filled")
