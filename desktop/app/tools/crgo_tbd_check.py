#!/usr/bin/env python3
"""crgo_tbd_check.py — the CRGO identifiers of the Identity, privilege & configuration module.

Usage
  python3 tools/crgo_tbd_check.py            # report how many placeholders remain (exit 0)
  python3 tools/crgo_tbd_check.py --release  # a release build: exit 1 while any CRGO_TBD placeholder remains

The module's CRGO alignment lives in one map, IPC.CRGO in js/ipc.js. Its IRIs are placeholders
(https://w3id.org/crgo/CRGO_TBD-nn) until they are filled from CRGO 0.11 (see the CRGO 0.11 release notes).
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
n = sum(1 for _ in re.finditer(r"TBD\(\d+\)", (ROOT / "js" / "ipc.js").read_text(encoding="utf-8")))
if "--release" in sys.argv and (hits or n):
    print(f"crgo_tbd_check: FAIL — {n} CRGO placeholder(s) remain in IPC.CRGO ({', '.join(hits[:5])}); fill them from CRGO 0.11")
    sys.exit(1)
print(f"crgo_tbd_check: {n} CRGO placeholder(s) waiting for CRGO 0.11" if n else "crgo_tbd_check: every CRGO identifier is filled")
