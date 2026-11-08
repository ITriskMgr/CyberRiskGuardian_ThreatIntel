#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""xlsx_recalc.py — recalculate an exported workbook in LibreOffice (headless) and compare every formula cell with the value
the application cached; print a JSON report (used by t61; adapted from the test campaign's harness wA/scripts/xlcheck.py).

    python3 xlsx_recalc.py export.xlsx workdir            -> {"formulas": n, "nocache": n, "differ": n, "diffs": [...], "sheets": {...}}

Without LibreOffice (soffice) the report says "lo": false and compares nothing; the suite then checks the cells only.
"""
import json, os, shutil, subprocess, sys

import openpyxl


def main(src, work):
    os.makedirs(work, exist_ok=True)
    base = os.path.splitext(os.path.basename(src))[0]
    rep = {"lo": bool(shutil.which("soffice")), "formulas": 0, "nocache": 0, "differ": 0, "diffs": [], "sheets": {}}
    frm = openpyxl.load_workbook(src)
    app = openpyxl.load_workbook(src, data_only=True)
    # a few cells the suite reads back (sheet, coordinate) -> (formula or value, cached value)
    for ws in frm.worksheets:
        cells = {}
        for row in ws.iter_rows():
            for c in row:
                if c.value is None:
                    continue
                cells[c.coordinate] = [c.value if not isinstance(c.value, str) or len(c.value) < 400 else c.value[:400], app[ws.title][c.coordinate].value]
        rep["sheets"][ws.title] = cells
    rec = None
    if rep["lo"]:
        stripped = os.path.join(work, base + "-nocache.xlsx")
        frm.save(stripped)                       # openpyxl writes no cached values
        out = os.path.join(work, "lo"); os.makedirs(out, exist_ok=True)
        subprocess.run(["soffice", "--headless", "--calc", "--convert-to", "xlsx:Calc MS Excel 2007 XML", "--outdir", out, stripped],
                       check=True, capture_output=True, timeout=240)
        rec = openpyxl.load_workbook(os.path.join(out, base + "-nocache.xlsx"), data_only=True)
    for ws in frm.worksheets:
        for row in ws.iter_rows():
            for c in row:
                if not (isinstance(c.value, str) and c.value.startswith("=")):
                    continue
                rep["formulas"] += 1
                a = app[ws.title][c.coordinate].value
                if a is None:
                    rep["nocache"] += 1
                if rec is None:
                    continue
                r = rec[ws.title][c.coordinate].value
                ok = (a == r) or (isinstance(a, (int, float)) and isinstance(r, (int, float)) and abs(a - r) <= 1e-6 * max(1, abs(a))) or (a in (None, "") and r in (None, ""))
                if not ok:
                    rep["differ"] += 1
                    if len(rep["diffs"]) < 30:
                        rep["diffs"].append(f"{ws.title}!{c.coordinate} {c.value[:70]} app={a!r} lo={r!r}")
    print(json.dumps(rep, ensure_ascii=False, default=str))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
