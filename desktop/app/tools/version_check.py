#!/usr/bin/env python3
"""version_check.py — one version, everywhere (1.5.6).

js/version.js is the source of truth. Modules import it; three files cannot (index.html is markup,
sw.js runs outside the module graph, serve.py is Python), so this gate reads the version out of each
of them and fails the build when any of them disagrees. Until 1.5.5 these drifted silently and the
About page announced a version the package had not been for two releases.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def strip_comments(src):
    """Blank out // and /* */ comments without touching string or template literals.

    A regex cannot do this: "https://..." inside a string is not a comment, and a version number
    inside a comment is not a claim. Regex literals are treated as strings, which is enough here.
    """
    out = []
    i, n = 0, len(src)
    while i < n:
        c = src[i]
        if c in "'\"`":
            q = c
            out.append(c)
            i += 1
            while i < n:
                if src[i] == "\\":
                    out.append("  ")
                    i += 2
                    continue
                out.append(src[i])
                if src[i] == q:
                    i += 1
                    break
                i += 1
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "/":
            while i < n and src[i] != "\n":
                out.append(" ")
                i += 1
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            while i < n and not (src[i] == "*" and i + 1 < n and src[i + 1] == "/"):
                out.append("\n" if src[i] == "\n" else " ")
                i += 1
            out.append("  ")
            i += 2
            continue
        out.append(c)
        i += 1
    return "".join(out)


def read(p):
    return (ROOT / p).read_text(encoding="utf-8")


def main():
    m = re.search(r"export const VERSION = '([\d.]+)'", read("js/version.js"))
    if not m:
        print("version_check: js/version.js does not declare VERSION")
        return 1
    want = m.group(1)
    found, bad = [], []

    def check(label, path, pattern, got=None):
        s = read(path)
        mm = re.search(pattern, s)
        v = got(mm) if got and mm else (mm.group(1) if mm else None)
        found.append((label, v))
        if v != want:
            bad.append(f"  {label:<28} {path} says {v!r}, js/version.js says {want!r}")

    check("service worker cache", "sw.js", r'const CACHE = "crg-desktop-([\d.]+)"')
    check("helper", "serve.py", r'VERSION = "([\d.]+)"')
    check("beta pill", "index.html", r'title="Beta ([\d.]+) ')
    check("sidebar footer", "index.html", r'v([\d.]+) Beta')

    # No module may hardcode a version of its own any more. Comments that record which release
    # introduced something are fine, so the comments are removed before the search; what is left is
    # code, and a version literal in code is a claim the build cannot keep true.
    for f in sorted((ROOT / "js").rglob("*.js")):
        rel = f.relative_to(ROOT).as_posix()
        if rel in ("js/version.js",) or "/i18n/" in rel or "/data/" in rel:
            continue
        code = strip_comments(f.read_text(encoding="utf-8"))
        for i, line in enumerate(code.split("\n"), 1):
            m = re.search(r"(?<![\w.])\d+\.\d+\.\d+(?![\w.])", line)
            if m and re.search(r"CyberRiskGuardian|[Bb]eta|crg-desktop", line):
                bad.append(f"  hardcoded version           {rel}:{i} {line.strip()[:80]}")

    for label, v in found:
        print(f"  {label:<28} {v}")
    if bad:
        print("version_check: FAIL")
        print("\n".join(bad))
        return 1
    print(f"version_check: every file agrees on {want}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
