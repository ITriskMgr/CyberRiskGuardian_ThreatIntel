#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""csp_check.py — gate (1.9.0): every HTML page of the application carries a Content-Security-Policy <meta>,
script-src never allows 'unsafe-inline' or 'unsafe-eval', and every inline <script> is allowed by its SHA-256
hash. An inline script edited without updating its hash would silently stop running: this gate catches it.

    python3 tools/csp_check.py          # check (exit 1 on a problem)
    python3 tools/csp_check.py --fix    # rewrite the 'sha256-…' sources of each page from its inline scripts
"""
import base64
import hashlib
import os
import re
import sys

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ["index.html", "help/step-by-step.html", "help/user-guide.html", "help/reset-confirm.html"]
BASE = ("default-src 'self'; script-src 'self'{hashes}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
        "font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; frame-src 'none'; "
        "object-src 'none'; base-uri 'none'; form-action 'self'")
META = re.compile(r'<meta http-equiv="Content-Security-Policy" content="([^"]*)">')


def inline_hashes(html):
    out = []
    for m in re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", html, re.S):
        out.append("'sha256-" + base64.b64encode(hashlib.sha256(m.group(1).encode("utf-8")).digest()).decode() + "'")
    return out


def policy(html):
    hs = inline_hashes(html)
    return BASE.format(hashes=(" " + " ".join(hs)) if hs else "")


def main(fix=False):
    problems, n = [], 0
    for rel in PAGES:
        p = os.path.join(APP, rel)
        html = open(p, encoding="utf-8").read()
        m = META.search(html)
        want = policy(html)
        if fix:
            tag = f'<meta http-equiv="Content-Security-Policy" content="{want}">'
            html = META.sub(lambda _: tag, html, 1) if m else html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + tag, 1)
            open(p, "w", encoding="utf-8").write(html)
            n += 1
            continue
        if not m:
            problems.append(f"{rel}: no Content-Security-Policy meta")
            continue
        got = m.group(1)
        src = re.search(r"script-src ([^;]*)", got)
        if not src or "'unsafe-inline'" in src.group(1) or "'unsafe-eval'" in src.group(1):
            problems.append(f"{rel}: script-src missing or allows unsafe-inline/unsafe-eval")
        for h in inline_hashes(html):
            if h not in got:
                problems.append(f"{rel}: an inline script is not allowed by its hash {h} (run tools/csp_check.py --fix)")
        if "connect-src 'self'" not in got or "object-src 'none'" not in got:
            problems.append(f"{rel}: connect-src 'self' and object-src 'none' are required")
        n += 1
    for p in problems:
        print("CSP:", p)
    print(f"csp_check: {n} page(s), {len(problems)} problem(s)" + (" (fixed)" if fix else ""))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main("--fix" in sys.argv))
