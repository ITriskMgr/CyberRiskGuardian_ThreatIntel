#!/usr/bin/env python3
"""package_desktop.py — build the release zip of CyberRiskGuardian Desktop for one edition (decision D3).

    python3 tools/package_desktop.py --edition community|educational|commercial [--out ../dist] [--dry-run]

What it does
  1. copies desktop/app into a temporary folder (without tests, caches, hidden files and the packaged zips);
  2. writes the edition into js/edition.js of that copy (the source tree stays the community edition);
  3. for the commercial edition, strips the CIS Controls v8.1 titles and the CRGO paraphrased safeguard labels from
     js/data/controls.js in that copy — the package then carries CIS identifiers only, until CIS approves the titles
     in a paid product (the Community and Educational editions keep the titles with the CIS notice);
  4. writes CyberRiskGuardian_Desktop_v<version>-<channel>[-<edition>].zip and its .sha256 next to it (PUBLISHING.md §4).
  The community zip keeps the historical name (no edition suffix), so the update check and its SHA-256 file are unchanged.

Exit 1 when the edition is unknown, when the strip leaves a CIS title behind, or when the copy differs from the source
in anything but the two files above (a package must be the source tree plus the edition).
© 2026 Marc-André Léger. CC BY-NC 4.0
"""
import argparse, hashlib, json, os, re, shutil, sys, tempfile, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HERE, ".."))
EDITIONS = ("community", "educational", "commercial")
SKIP_DIRS = {"__pycache__", ".pytest_cache", "node_modules", ".git"}
SKIP_FILES = {".DS_Store", "crg-config.json"}


def version():
    src = open(os.path.join(APP, "js", "version.js"), encoding="utf-8").read()
    v = re.search(r"export const VERSION = '([^']+)'", src).group(1)
    ch = re.search(r"export const CHANNEL = '([^']+)'", src).group(1)
    return v, ch


def copy_tree(dst):
    for root, dirs, files in os.walk(APP):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        rel = os.path.relpath(root, APP)
        out = dst if rel == "." else os.path.join(dst, rel)
        os.makedirs(out, exist_ok=True)
        for f in files:
            if f in SKIP_FILES or f.startswith(".") or f.endswith((".pyc", ".zip", ".sha256")):
                continue
            shutil.copy2(os.path.join(root, f), os.path.join(out, f))


def set_edition(dst, edition):
    p = os.path.join(dst, "js", "edition.js")
    src = open(p, encoding="utf-8").read()
    new, n = re.subn(r"export const EDITION = '[a-z]+';", f"export const EDITION = '{edition}';", src)
    if n != 1:
        sys.exit("package_desktop: js/edition.js has no EDITION line to set")
    open(p, "w", encoding="utf-8").write(new)


def strip_cis(dst):
    """CIS v8.1 rows of js/data/controls.js: title → identifier wording, group → 'CIS n', note → ''. Returns the row count."""
    p = os.path.join(dst, "js", "data", "controls.js")
    src = open(p, encoding="utf-8").read()
    head, _, rest = src.partition("self.CRG_CONTROLS = ")
    body, sep, tail = rest.rpartition(";")
    data = json.loads(body)
    fi = next((i for i, f in enumerate(data["frameworks"]) if f["id"] == "CIS81"), None)
    if fi is None:
        return 0
    n = 0
    for row in data["controls"]:
        if row[0] != fi:
            continue
        cid = row[1]
        row[2] = cid if cid.startswith("CIS ") else "CIS v8.1 safeguard " + cid
        row[3] = "CIS Controls v8.1" if cid.startswith("CIS ") else "CIS " + cid.split(".")[0]
        row[6] = ""
        n += 1
    data["frameworks"][fi]["note"] = ("18 controls and 153 safeguards by identifier only (commercial edition, pending CIS approval of the titles); "
                                      "cite CIS by identifier: https://www.cisecurity.org/controls/v8-1. CIS Controls © Center for Internet Security.")
    data["frameworks"][fi]["origin"] = "Bundled — identifiers only (commercial edition)"
    head = head.replace("CIS Controls: identifiers and titles only", "CIS Controls: identifiers only (commercial edition)")
    open(p, "w", encoding="utf-8").write(head + "self.CRG_CONTROLS = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + sep + tail)
    # nothing CIS-worded may remain in the CIS rows
    check = json.loads(open(p, encoding="utf-8").read().partition("self.CRG_CONTROLS = ")[2].rpartition(";")[0])
    leaks = [r for r in check["controls"] if r[0] == fi and not (r[2].startswith("CIS ") or r[2].startswith("CIS v8.1 safeguard "))]
    if leaks:
        sys.exit(f"package_desktop: {len(leaks)} CIS rows still carry a title")
    return n


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--edition", required=True, choices=EDITIONS)
    ap.add_argument("--out", default=os.path.join(APP, "..", "dist"))
    ap.add_argument("--dry-run", action="store_true", help="build the copy and report, write no zip")
    a = ap.parse_args()
    v, ch = version()
    suffix = "" if a.edition == "community" else "-" + a.edition
    name = f"CyberRiskGuardian_Desktop_v{v}-{ch}{suffix}.zip"
    tmp = tempfile.mkdtemp(prefix="crg-pkg-")
    try:
        dst = os.path.join(tmp, "CyberRiskGuardian_Desktop")
        copy_tree(dst)
        set_edition(dst, a.edition)
        stripped = strip_cis(dst) if a.edition == "commercial" else 0
        print(f"package_desktop: {a.edition} edition, version {v} {ch}; CIS rows reduced to identifiers: {stripped}")
        if a.dry_run:
            print("dry run — no zip written; copy at", dst)
            tmp = None   # keep it for inspection
            return 0
        os.makedirs(a.out, exist_ok=True)
        zpath = os.path.join(a.out, name)
        with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
            for root, _, files in os.walk(dst):
                for f in sorted(files):
                    full = os.path.join(root, f)
                    z.write(full, os.path.relpath(full, dst))
        digest = sha256(zpath)
        open(zpath + ".sha256", "w", encoding="utf-8").write(f"{digest}  {name}\n")
        print(f"wrote {zpath}\n      {zpath}.sha256 ({digest})")
        return 0
    finally:
        if tmp:
            shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
