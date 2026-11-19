#!/usr/bin/env python3
"""fr_review_export.py — a spreadsheet for the native French read-through (1.9.3, BL-10).

Writes one CSV (UTF-8 with BOM, so Excel and Numbers open the accents correctly) with every French interface string the
application shows, the English it translates, the screens' source files, and two empty columns for the reviewer
("Correction" and "Note"). Rows are grouped by source file so a reviewer can work screen by screen; strings flagged by
fr_terms_check's retired-term rules come first. Nothing is changed in the application.

    python3 tools/fr_review_export.py ~/Desktop/crg-fr-review.csv

After the review, the corrections are applied to js/i18n/fr.js (the key stays the English text) and to USER-GUIDE.fr.md.
© 2026 Marc-André Léger. CC BY-NC 4.0
"""
import csv
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import i18n_coverage as C  # noqa: E402

# the method's French terms (book v2.51 FR, decisions FR-1 to FR-3): a row using a variant is listed first for review
VARIANTS = re.compile(r"appétit pour le risque|actifs essentiels|registre des preuves|lacune de preuve|probabilité", re.I)


def main(argv):
    out = os.path.expanduser(argv[1] if len(argv) > 1 else "crg-fr-review.csv")
    found = C.interface_strings()
    fr = C.load_catalogue("fr")
    rows = []
    for en, files in found.items():
        tr = fr.get(en)
        if tr is None:
            continue
        where = sorted(os.path.basename(f) for f in files)
        rows.append((0 if VARIANTS.search(tr) else 1, where[0] if where else "", en, tr, ", ".join(where[:6])))
    rows.sort()
    with open(out, "w", encoding="utf-8-sig", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["Check first", "Source file", "English", "Français (actuel)", "Correction", "Note", "All source files"])
        for flag, first, en, tr, where in rows:
            w.writerow(["yes" if flag == 0 else "", first, en, tr, "", "", where])
    print(f"{len(rows)} strings written to {out} ({sum(1 for r in rows if r[0] == 0)} to check first)")


if __name__ == "__main__":
    main(sys.argv)
