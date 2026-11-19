#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""ingest_book_fr.py — the French reference set of the textbook skill (BL-28), from the book's plain-text export.

Input: the French edition saved from Word as UTF-8 plain text ("Introduction à la gouvernance de la cybersécurité …",
Troisième édition, version 2.51). Output: plugins/cyberriskguardian-threatintel/skills/cybersecurity-governance/references/fr/,
one Markdown file per chapter and per front/back section, with the same file names as the English set so a chapter is
found the same way in either language. Headings come from the book's own table of contents (chapter = #, section = ##);
the plain-text export does not mark lower heading levels, so subsections stay as paragraphs. Bullets "•" become "-".
Deterministic: same input, same output.

    python3 scripts/ingest_book_fr.py /path/to/Introduction_a_la_gouvernance_…_FR.txt
"""
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILL = os.path.join(REPO, "plugins", "cyberriskguardian-threatintel", "skills", "cybersecurity-governance", "references")
OUT = os.path.join(SKILL, "fr")
CITE = ("<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies "
        "d’affaires (3e éd., v2.51). {part}. CC BY-NC 4.0 -->")
# back and front sections: (title in the French book, English file name)
SPECIAL = [("Liste des sigles et acronymes", "00-acronyms.md"), ("Liste des figures", "00-figures.md"),
           ("Introduction", "00-introduction.md"),
           ("Annexe : Utiliser CyberRiskGuardian avec ce manuel", "zz-appendix-using-cyberriskguardian.md"),
           ("Annexe : Réponses aux questions à choix multiples", "zz-appendix-mcq-answer-key.md"),
           ("Références", "zz-references.md"), ("Bibliographie et lectures complémentaires", "zz-bibliography.md")]


def read(path):
    s = open(path, encoding="utf-8-sig").read().replace("\r\n", "\n").replace("\r", "\n")
    return s.split("\n")


def norm(t):
    """Match headings whatever space precedes the French colon (the export keeps non-breaking spaces)."""
    return re.sub(r"[\u00a0\u202f]", " ", t).strip()


def toc(lines):
    """[(title, page)] from the table of contents: lines 'Title<TAB>page' before the first body section."""
    out = []
    for ln in lines:
        m = re.match(r"^(.+?)\t(\d+)\s*$", ln)
        if m:
            out.append(norm(m.group(1)))
        elif out and norm(ln) == "Liste des sigles et acronymes":
            break
    return out


def english_names():
    return {int(m.group(1)): f for f in os.listdir(SKILL) for m in [re.match(r"ch(\d\d)-.+\.md$", f)] if m}


def main(argv):
    if len(argv) < 2:
        print(__doc__); return 2
    lines = read(argv[1])
    entries = toc(lines)
    start = next(i for i, ln in enumerate(lines) if i > 0 and norm(ln) == "Liste des sigles et acronymes" and "\t" not in ln)
    body = lines[start:]
    # part boundaries: special sections and chapters, in book order, matched on whole lines without a page number
    marks = []
    for i, ln in enumerate(body):
        t = norm(ln)
        if re.match(r"^Chapitre \d+ : ", t) and "\t" not in ln:
            marks.append((i, t))
        elif any(t == s for s, _ in SPECIAL) and "\t" not in ln:
            marks.append((i, t))
    # keep the first occurrence of each part: a chapter title recurs in the answer-key annex ("Chapitre 1 : … 1. B · 2. D")
    seen, parts = set(), []
    for i, t in marks:
        m = re.match(r"^Chapitre (\d+) : ", t)
        key = ("ch", int(m.group(1))) if m else t
        if key in seen:
            continue
        seen.add(key); parts.append((i, t))
    en = english_names()
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith(".md"):
            os.remove(os.path.join(OUT, f))
    sections = set(entries)
    written = []
    for k, (i, title) in enumerate(parts):
        end = parts[k + 1][0] if k + 1 < len(parts) else len(body)
        chunk = body[i + 1:end]
        m = re.match(r"^Chapitre (\d+) : (.+)$", title)
        name = en.get(int(m.group(1))) if m else dict(SPECIAL).get(title)
        if not name:
            continue
        md = [CITE.format(part=title), "", "# " + title, ""]
        for ln in chunk:
            t = ln.strip()
            if not t:
                continue
            if norm(t) in sections and len(t) < 160:
                md += ["", "## " + t, ""]
            elif t.startswith("•"):
                md.append("- " + t.lstrip("•").strip())
            else:
                md += [t, ""]
        text = re.sub(r"\n{3,}", "\n\n", "\n".join(md)).strip() + "\n"
        open(os.path.join(OUT, name), "w", encoding="utf-8").write(text)
        written.append((name, len(text.split())))
    # front matter: everything before the acronym list, from the original start of the file
    fm = [ln.strip() for ln in lines[:start] if ln.strip() and "\t" not in ln]
    open(os.path.join(OUT, "00-front-matter.md"), "w", encoding="utf-8").write(
        CITE.format(part="Pages liminaires") + "\n\n# Pages liminaires\n\n" + "\n\n".join(fm) + "\n")
    written.append(("00-front-matter.md", len(" ".join(fm).split())))
    for n, w in sorted(written):
        print(f"{w:>7} words  {n}")
    print(f"{len(written)} files, {sum(w for _, w in written):,} words → {os.path.relpath(OUT, REPO)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
