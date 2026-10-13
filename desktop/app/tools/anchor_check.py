#!/usr/bin/env python3
"""anchor_check.py — every "?" help on a screen links to a section of the user guide that exists.

Usage
  python3 tools/anchor_check.py            # check USER-GUIDE.md and USER-GUIDE.fr.md (if present)
  python3 tools/anchor_check.py --list     # also print the anchors the screens use
  python3 tools/anchor_check.py USER-GUIDE.md   # check only the guide(s) named

What is checked
  The help entries of the screens (js/helpdesc.js HELP and the HELP objects that screen modules
  export) are { d: description, h: [paragraphs], g: anchor }. Every anchor `g` must exist in the guide
  as an explicit heading anchor `### Title {#anchor}` (the syntax help/md.js reads). Only values that
  follow a `d:` description inside such an entry, and look like guide anchors (lowercase letters,
  digits and hyphens), are collected — other `g:` keys in the code are not anchors.
Exit 1 when an anchor is missing from a guide.
© 2026 Marc-André Léger. CC BY-NC 4.0
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
# d: '…' (or "…" / `…`), then g: 'anchor' — the shape of a help entry, possibly across lines.
ENTRY = re.compile(r"\bd:\s*(['\"`])(?:\\.|(?!\1)[\s\S])*?\1\s*,\s*g:\s*'([a-z][a-z0-9-]*)'")
HEAD = re.compile(r"^#{1,6}\s+.*\{#([\w-]+)\}\s*$", re.M)


def anchors_used():
    used = {}
    for f in sorted((ROOT / "js").rglob("*.js")):
        p = f.as_posix()
        if "/data/" in p or "/i18n/" in p:
            continue
        for m in ENTRY.finditer(f.read_text(encoding="utf-8")):
            used.setdefault(m.group(2), set()).add(str(f.relative_to(ROOT)))
    return used


def main():
    used = anchors_used()
    if "--list" in sys.argv:
        print(" ".join(sorted(used)))
    failed = False
    names = [a for a in sys.argv[1:] if not a.startswith("-")] or ["USER-GUIDE.md", "USER-GUIDE.fr.md"]
    for name in names:
        g = ROOT / name
        if not g.exists():
            if name in sys.argv:
                print(f"anchor_check: {name}: not found")
                failed = True
            continue
        text = g.read_text(encoding="utf-8")
        have = HEAD.findall(text)
        dup = sorted({a for a in have if have.count(a) > 1})
        missing = sorted(a for a in used if a not in have)
        if missing or dup:
            failed = True
            print(f"anchor_check: {name}: {len(missing)} anchor(s) missing" + (f", duplicated: {' '.join(dup)}" if dup else ""))
            for a in missing:
                print(f"  {{#{a}}}  used by {', '.join(sorted(used[a]))}")
        else:
            print(f"anchor_check: {name}: all {len(used)} anchors used by the screens are present")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
