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
  1.9.0 — chapter-linked help (js/data/chapters.js): every screen of app.js PANELS and every step of
  js/process.js STEPS has an entry (a section id or "none"), every entry names a known section, and every
  section heading exists, verbatim, in the textbook chapter it cites (kb/book/chNN.md).
Exit 1 when an anchor is missing from a guide or a chapter reference does not resolve.
© 2026 Marc-André Léger. CC BY-NC 4.0
"""
import json, pathlib, re, sys

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


def js_block(src, name):
    """The strict-JSON object assigned to `export const NAME = {…};` in a data module."""
    i = src.index("export const " + name + " = ") + len("export const " + name + " = ")
    j = src.index("\n};", i) + 2
    return json.loads(src[i:j])


def chapter_refs():
    """Problems of the chapter-help table (empty list when every reference resolves)."""
    probs = []
    src = (ROOT / "js" / "data" / "chapters.js").read_text(encoding="utf-8")
    sections, screens, steps = js_block(src, "SECTIONS"), js_block(src, "SCREENS"), js_block(src, "STEPS")
    app = (ROOT / "js" / "app.js").read_text(encoding="utf-8")
    m = re.search(r"const PANELS = \{([^}]*)\}", app)
    panels = [k.split(":")[0].strip() for k in m.group(1).split(",") if k.strip()]
    for p in panels:
        if p not in screens:
            probs.append(f"screen {p} (app.js PANELS) has no entry in js/data/chapters.js SCREENS (a section id or \"none\")")
    for k in screens:
        if k.split("/")[0] not in panels:
            probs.append(f"SCREENS entry {k} names no screen of app.js PANELS")
    proc = (ROOT / "js" / "process.js").read_text(encoding="utf-8")
    for sid in re.findall(r"\{ id: '([a-z_]+)', n: ", proc):
        if sid not in steps:
            probs.append(f"process step {sid} has no entry in js/data/chapters.js STEPS")
    for k, v in list(screens.items()) + [("step:" + k, v) for k, v in steps.items()]:
        if v != "none" and v not in sections:
            probs.append(f"{k} → {v}: no such section in SECTIONS")
    book = ROOT / "kb" / "book"
    for sid, (ch, en, fr) in sections.items():
        f = book / f"ch{ch:02d}.md"
        if not f.exists():
            probs.append(f"{sid}: chapter file {f.name} not found in kb/book")
            continue
        heads = {re.sub(r"\s+", " ", h).strip() for h in re.findall(r"^#{2,4}\s+(.+?)\s*$", f.read_text(encoding="utf-8"), re.M)}
        if en not in heads:
            probs.append(f"{sid}: “{en}” is not a heading of chapter {ch} ({f.name})")
        if not fr.strip():
            probs.append(f"{sid}: no French heading")
    return probs, len(sections), len(screens), len(steps)


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
    probs, ns, nscr, nst = chapter_refs()
    if probs:
        failed = True
        print(f"anchor_check: chapter help: {len(probs)} problem(s)")
        for x in probs:
            print("  " + x)
    else:
        print(f"anchor_check: chapter help: {nscr} screen entries and {nst} steps resolve to {ns} book sections, all present in kb/book")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
