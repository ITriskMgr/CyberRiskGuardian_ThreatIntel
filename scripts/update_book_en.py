#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""update_book_en.py — bring the English reference set of the textbook skill to a new revision of the book (BL-27).

The English set (references/*.md) was converted from the .docx and keeps its tables, subsection headings and inline
formatting. A plain-text export of a later revision has none of that, so this script does not regenerate the files: it
aligns each file's paragraphs with the same part of the new text and applies only what changed —
  * a paragraph whose wording changed gets the new wording, keeping its Markdown prefix (heading level, list number,
    bullet, quote);
  * a paragraph added in the new text is inserted after the paragraph it follows;
  * a paragraph removed from the new text is deleted.
Table cells are left alone (the plain text flattens tables); lines of the new text that belong to an existing table are
not inserted again. Deterministic. Writes a change report; --dry-run only reports.

    python3 scripts/update_book_en.py /path/to/Introduction_to_Cybersecurity_Governance_v2-51b.txt [--dry-run] [--report FILE]
"""
import difflib
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(REPO, "plugins", "cyberriskguardian-threatintel", "skills", "cybersecurity-governance", "references")
SPECIAL = [("Table of Acronyms", "00-acronyms.md"), ("Table of figures", "00-figures.md"),
           ("Introduction", "00-introduction.md"),
           ("Appendix: Using CyberRiskGuardian with this book", "zz-appendix-using-cyberriskguardian.md"),
           ("Appendix: Answers to multiple-choice questions", "zz-appendix-mcq-answer-key.md"),
           ("References", "zz-references.md"), ("Bibliography and further reading", "zz-bibliography.md")]
PREFIX = re.compile(r"^(\s*(?:#{1,6}\s+|>\s*|[-*]\s+|\d+\.\s+|\*\*\d+\.\*\*\s+|\*\*[A-D]\.\*\*\s+)*)")
TABLE = re.compile(r"^\s*(<|\|)")


def norm(t):
    t = re.sub(r"[  ]", " ", t)
    t = re.sub(r"<[^>]+>", "", t)
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)
    t = t.replace("\\", "").replace("**", "").replace("`", "")
    t = re.sub(r"(?<![\w*])\*(?=\S)|(?<=\S)\*(?![\w*])", "", t)
    for _ in range(4):
        t = re.sub(r"^\s*(#+|-|•|>|\d+\.)\s*", "", t)
    t = t.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    return re.sub(r"\s+", " ", t).strip()


def noise(o, n):
    """Differences that are artefacts of the plain-text export, not revisions: a page number after a figure-list entry,
    Word's second-level bullet glyph "o", and links Word appended to a sentence from a browser's clipboard."""
    if re.sub(r" \d+$", "", n) == o or re.sub(r"^o ", "", n) == o:
        return True
    url = re.compile(r"\s*<?https?://\S+?>?(?=\s|$)")
    return "utm_source=" in n or url.sub("", n) == url.sub("", o)


def skip_insert(n):
    """Lines of the export that are not paragraphs of the book: figure captions (figures are not part of the text
    version), labels inside figures, running headers and footers, page numbers."""
    return (len(n) < 40 or re.match(r"^Figure \d+:", n) is not None
            or re.match(r"^(3rd Edition \| Version|October 20\d\d$|\d+$)", n) is not None)


def keep_emphasis(old_line, txt):
    """Re-apply the bold and italic spans of the old paragraph wherever the same words survive in the new wording."""
    body = old_line[PREFIX.match(old_line).end():]
    for mark, span in re.findall(r"(\*\*|(?<![\w*])\*)(?=\S)(.+?)(?<=\S)\1", body):
        plain = span.replace("\\", "")
        if plain and plain in txt and (mark + plain + mark) not in txt:
            txt = txt.replace(plain, mark + plain + mark, 1)
    return txt


def table_cell(old, n):
    """(line index, raw cell text) of a pipe-table cell whose wording changed slightly in the new text, or None."""
    best = (0.85, None)
    for i, ln in enumerate(old):
        if not ln.lstrip().startswith("|"):
            continue
        for raw in ln.split("|")[1:-1]:
            r = difflib.SequenceMatcher(None, norm(raw), n, autojunk=False).ratio()
            if r > best[0]:
                best = (r, (i, raw.strip()))
    return best[1]


def parts(lines):
    """{english file name: [new lines]} from the plain-text book, by chapter and back/front section."""
    chap = {int(m.group(1)): f for f in os.listdir(REF) for m in [re.match(r"ch(\d\d)-.+\.md$", f)] if m}
    start = next(i for i, ln in enumerate(lines) if norm(ln) == "Introduction" and "\t" not in ln)
    marks, seen = [], set()
    for i, ln in enumerate(lines):
        if "\t" in ln:
            continue
        t = norm(ln)
        m = re.match(r"^Chapter (\d+): ", t)
        key = ("ch", int(m.group(1))) if m else t
        name = chap.get(int(m.group(1))) if m else dict(SPECIAL).get(t)
        if name and key not in seen and (i >= start or t in ("Table of Acronyms", "Table of figures")):
            seen.add(key)
            marks.append((i, name))
    marks.sort()
    out = {}
    for k, (i, name) in enumerate(marks):
        end = marks[k + 1][0] if k + 1 < len(marks) else len(lines)
        out[name] = [ln.strip() for ln in lines[i + 1:end] if ln.strip()]
    return out


def patch(path, new):
    old = open(path, encoding="utf-8").read().split("\n")
    idx = [i for i, ln in enumerate(old) if ln.strip() and not TABLE.match(ln) and not ln.lstrip().startswith("<!--")
           and not re.match(r"^\s*#\s", ln) and norm(ln)]  # the title line and empty quote lines stay
    table_text = {norm(ln) for ln in old if TABLE.match(ln)} | {norm(c) for ln in old if TABLE.match(ln)
                                                              for c in re.split(r"<[^>]+>|\|", ln)}
    a = [norm(old[i]) for i in idx]
    b = [norm(x) for x in new]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    repl, ins, dele = {}, {}, set()
    changed = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            continue
        olds, news = list(range(i1, i2)), list(range(j1, j2))
        # pair similar paragraphs inside the block, in order
        pairs, jstart = [], 0
        for oi in olds:
            best, bj = 0.0, None
            for nj in news[jstart:]:
                r = difflib.SequenceMatcher(None, a[oi], b[nj], autojunk=False).ratio()
                if r > best:
                    best, bj = r, nj
            if bj is not None and best >= 0.55:
                pairs.append((oi, bj))
                jstart = news.index(bj) + 1
        lo = [o for o in olds if o not in {p[0] for p in pairs}]
        ln_ = [n for n in news if n not in {p[1] for p in pairs} and not skip_insert(b[n]) and b[n] not in table_text]
        if lo and len(lo) == len(ln_):  # rewritten in place (e.g. answer options C and D)
            pairs = sorted(pairs + list(zip(lo, ln_)))
        paired_o = {p[0] for p in pairs}
        paired_n = {p[1] for p in pairs}
        for oi, nj in pairs:
            if noise(a[oi], b[nj]):
                continue
            ln = old[idx[oi]]
            pre = PREFIX.match(ln).group(1)
            txt = re.sub(r"^•\s*", "", new[nj])
            if re.search(r"\d+\.", pre):
                txt = re.sub(r"^\d+\.\s+", "", txt)
            txt = keep_emphasis(ln, txt)
            if pre.strip() == "" and new[nj].startswith("•"):
                pre = "- "
            repl[idx[oi]] = pre + txt
            changed.append(("~", a[oi], b[nj]))
        for oi in olds:
            if oi not in paired_o:
                dele.add(idx[oi])
                changed.append(("-", a[oi], ""))
        anchor = idx[i1 - 1] if i1 > 0 else (idx[0] - 1 if idx else len(old) - 1)
        for nj in news:
            if nj in paired_n or b[nj] in table_text or skip_insert(b[nj]):
                continue
            cell = table_cell(old, b[nj])
            if cell:
                li, raw = cell
                txt = new[nj].replace("$", "\\$")
                old[li] = old[li].replace(raw, txt.ljust(len(raw)) if len(txt) <= len(raw) else txt, 1)
                changed.append(("~", norm(raw), b[nj]))
                continue
            # attach after the last old paragraph before this new one
            before = [p for p in pairs if p[1] < nj]
            at = idx[before[-1][0]] if before else anchor
            t = new[nj]
            ins.setdefault(at, []).append(("- " + t.lstrip("•").strip()) if t.startswith("•") else t)
            changed.append(("+", "", b[nj]))
    out = []
    for i, ln in enumerate(old):
        if i not in dele:
            out.append(repl.get(i, ln))
        for t in ins.get(i, []):
            out += ["", t]
    return "\n".join(out), changed


def main(argv):
    args = [x for x in argv[1:] if not x.startswith("--")]
    if not args:
        print(__doc__)
        return 2
    dry = "--dry-run" in argv
    report = argv[argv.index("--report") + 1] if "--report" in argv else None
    lines = open(args[0], encoding="utf-8-sig").read().replace("\r\n", "\n").replace("\r", "\n").split("\n")
    rep = []
    for name, new in sorted(parts(lines).items()):
        path = os.path.join(REF, name)
        if not os.path.exists(path):
            rep.append(f"## {name}\n\nmissing in the reference set\n")
            continue
        text, ch = patch(path, new)
        text = re.sub(r"\n{3,}", "\n\n", text)
        n = {k: sum(1 for c in ch if c[0] == k) for k in "~+-"}
        print(f"{name:<80} {n['~']:>4} changed {n['+']:>4} added {n['-']:>4} removed")
        if ch:
            rep.append(f"## {name}\n")
            for k, o, nw in ch:
                rep.append(f"{k} OLD: {o}\n  NEW: {nw}\n" if k == "~" else f"{k} {o or nw}\n")
        if not dry and ch:
            open(path, "w", encoding="utf-8").write(text)
    if report:
        open(report, "w", encoding="utf-8").write("\n".join(rep))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
