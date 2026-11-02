#!/usr/bin/env python3
"""build_book.py — bundle the reference textbook as local text for the Virtual consultant.

Source: plugins/cyberriskguardian-threatintel/skills/cybersecurity-governance/references/*.md
(Léger, Introduction to Cybersecurity Governance for Business Technology Management, 3rd ed., v2.51b,
CC BY-NC 4.0, the author's own text). The 21 chapters, the introduction and the appendix on using
CyberRiskGuardian are copied unchanged to kb/book/; the multiple-choice answer key, the figure list, the
front matter and the reference lists are left out (they answer nothing a consultant is asked, and the
answer key is for instructors). kb/book/index.json lists the files with their chapter number and title,
so the application can cite "Chapter N — section" without parsing file names.

Deterministic: same input, same output (sorted, no dates). Usage: python3 tools/build_book.py
© 2026 Marc-André Léger. CC BY-NC 4.0
"""
import json
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(os.path.dirname(ROOT))
SRC = os.path.join(REPO, "plugins", "cyberriskguardian-threatintel", "skills", "cybersecurity-governance", "references")
OUT = os.path.join(ROOT, "kb", "book")
EDITION = "v2.51b"
TITLE = "Introduction to Cybersecurity Governance for Business Technology Management, 3rd ed."
KEEP = re.compile(r"^(ch\d\d-.+|00-introduction|zz-appendix-using-cyberriskguardian)\.md$")


def main():
    if not os.path.isdir(SRC):
        raise SystemExit(f"build_book: source folder not found: {SRC}")
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):                       # a removed chapter must not linger
        if f.endswith(".md"):
            os.remove(os.path.join(OUT, f))
    files = []
    for name in sorted(os.listdir(SRC)):
        if not KEEP.match(name):
            continue
        text = open(os.path.join(SRC, name), encoding="utf-8").read()
        m = re.search(r"^# (.+)$", text, re.M)
        head = m.group(1).strip() if m else name
        cm = re.match(r"ch(\d\d)-", name)
        if cm:
            n, kind, title = int(cm.group(1)), "chapter", re.sub(r"^Chapter \d+:\s*", "", head)
        elif name.startswith("00-"):
            n, kind, title = 0, "introduction", head
        else:
            n, kind, title = 99, "appendix", re.sub(r"^Appendix:\s*", "", head)
        short = (f"ch{n:02d}.md" if kind == "chapter" else name.split("-", 1)[0] + "-" + kind + ".md")
        shutil.copyfile(os.path.join(SRC, name), os.path.join(OUT, short))
        files.append({"file": short, "n": n, "kind": kind, "title": title, "bytes": len(text.encode("utf-8"))})
    files.sort(key=lambda x: (x["n"], x["file"]))
    index = {"schema": "crg-book/1", "title": TITLE, "author": "Marc-André Léger", "edition": EDITION,
             "licence": "CC BY-NC 4.0", "language": "en", "files": files}
    with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as fh:
        json.dump(index, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    print(f"build_book: {len(files)} files → {os.path.relpath(OUT, ROOT)} ({sum(f['bytes'] for f in files) // 1024} kB)")


if __name__ == "__main__":
    main()
