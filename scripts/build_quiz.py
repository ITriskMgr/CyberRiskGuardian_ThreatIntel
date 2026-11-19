#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""build_quiz.py — the Classroom self-check quiz bank, English and French (BL-25/26 spec §5).

Reads the book's multiple-choice review questions (20 per chapter, 21 chapters) and the public answer key from the
textbook skill's reference sets (references/ and references/fr/), and writes desktop/app/js/data/quiz.js:

    self.CRG_QUIZ = {version, source, chapters: [{n, title: {en, fr}, questions: [{n, answer, section: {en, fr},
                     q: {en, fr}, options: {en: [A, B, C, D], fr: [...]}}]}]}

Only the public answer key is used: the rationales are in the instructor resource guide and are never shipped. Each
question also gets the chapter section to reread ("Read more: Chapter N — section"): the section, among the chapter's
"##" sections before its review questions, whose words overlap most with the question and its correct answer. It is a
reading pointer, chosen deterministically, not part of the book. The build fails if a chapter does not have 20 questions
with four options in both languages, or if the two languages' answer keys differ.

    python3 scripts/build_quiz.py            # write the bank
    python3 scripts/build_quiz.py --check    # fail if the written bank is out of date
"""
import json
import os
import re
import sys
from collections import Counter

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(REPO, "plugins", "cyberriskguardian-threatintel", "skills", "cybersecurity-governance", "references")
OUT = os.path.join(REPO, "desktop", "app", "js", "data", "quiz.js")
STOP = set("""a an the and or of to in on for by with as at is are be it its that this which what how why when who
whom from into than then their there these those not no can may must should would could does do according chapter
le la les un une des du de d l et ou à au aux en dans par pour sur avec est sont être ce cette ces qui que quoi
comment pourquoi selon chapitre il elle ils elles se sa son ses leur leurs ne pas plus""".split())


def words(t):
    return [w for w in re.findall(r"[a-zà-ÿ0-9]{3,}", t.lower().replace("’", "'")) if w not in STOP]


def chapter_files(d):
    return sorted(f for f in os.listdir(d) if re.match(r"ch\d\d-.+\.md$", f))


def clean(t):
    t = re.sub(r"\*\*|\\", "", t).strip()
    return re.sub(r"\s+", " ", t)


def parse(path, lang):
    text = open(path, encoding="utf-8").read()
    title = re.search(r"^# (.+)$", text, re.M).group(1).strip()
    marker = "### Multiple-choice questions" if lang == "en" else "Questions à choix multiples"
    i = text.index(marker)
    body, mcq = text[:i], text[i:]
    rv = body.find("## Review questions" if lang == "en" else "## Questions de révision")
    body = body[:rv] if rv > 0 else body
    sections = []
    for m in re.finditer(r"^## (.+)$", body, re.M):
        sections.append([m.group(1).strip(), m.end()])
    for k, s in enumerate(sections):
        end = sections[k + 1][1] if k + 1 < len(sections) else len(body)
        s.append(Counter(words(s[0] + " " + body[s[1]:end])))
    qs = []
    cur = None
    for ln in mcq.split("\n"):
        t = ln.strip().lstrip(">").strip()
        if not t:
            continue
        m = re.match(r"^(?:\*\*)?(\d{1,2})\.(?:\*\*)?\s+(.+)$", t)
        o = re.match(r"^(?:\*\*)?([A-D])\.(?:\*\*)?\s+(.+)$", t)
        if m and (cur is None or len(cur["options"]) == 4):
            cur = {"n": int(m.group(1)), "q": clean(m.group(2)), "options": []}
            qs.append(cur)
        elif o and cur is not None and len(cur["options"]) < 4 and "ABCD"[len(cur["options"])] == o.group(1):
            cur["options"].append(clean(o.group(2)))
    return title, sections, qs


def answer_key(path):
    key = {}
    for ln in open(path, encoding="utf-8"):
        m = re.match(r"^\s*(?:\*\*)?(?:Chapter|Chapitre)\s+(\d+)\s*:.*?\.\s*(?:\*\*)?\s*(1\.\s*[A-D].*)$", ln.strip())
        if m:
            key[int(m.group(1))] = re.findall(r"(\d+)\.\s*([A-D])", m.group(2))
    return {c: {int(n): a for n, a in v} for c, v in key.items()}


def best_section(sections, q, ans):
    w = Counter(words(q + " " + ans))
    best, score = sections[0][0] if sections else "", -1
    for name, _, bag in sections:
        if name.lower().startswith(("learning outcomes", "résultats d")):
            continue
        s = sum(min(c, bag[k]) for k, c in w.items())
        if s > score:
            best, score = name, s
    return best


def build():
    en_files, fr_files = chapter_files(REF), chapter_files(os.path.join(REF, "fr"))
    assert en_files == fr_files and len(en_files) == 21, "both languages need chapters 1–21 with the same file names"
    key_en = answer_key(os.path.join(REF, "zz-appendix-mcq-answer-key.md"))
    key_fr = answer_key(os.path.join(REF, "fr", "zz-appendix-mcq-answer-key.md"))
    assert key_en == key_fr and len(key_en) == 21, "the English and French answer keys differ or are incomplete"
    chapters = []
    for f in en_files:
        n = int(f[2:4])
        te, se, qe = parse(os.path.join(REF, f), "en")
        tf, sf, qf = parse(os.path.join(REF, "fr", f), "fr")
        for lang, qs in (("en", qe), ("fr", qf)):
            assert [q["n"] for q in qs] == list(range(1, 21)), f"chapter {n} ({lang}): questions {[q['n'] for q in qs]}"
            assert all(len(q["options"]) == 4 for q in qs), f"chapter {n} ({lang}): a question without four options"
        assert sorted(key_en[n]) == list(range(1, 21)), f"chapter {n}: answer key incomplete"
        out = []
        for a, b in zip(qe, qf):
            ans = key_en[n][a["n"]]
            idx = "ABCD".index(ans)
            out.append({"n": a["n"], "answer": ans,
                        "section": {"en": best_section(se, a["q"], a["options"][idx]), "fr": best_section(sf, b["q"], b["options"][idx])},
                        "q": {"en": a["q"], "fr": b["q"]}, "options": {"en": a["options"], "fr": b["options"]}})
        chapters.append({"n": n, "title": {"en": te, "fr": tf}, "questions": out})
    data = {"version": "1.0.0",
            "source": {"en": "Léger, M.-A. (2026). Introduction to Cybersecurity Governance for Business Technology Management (3rd ed., v2.51b). Review questions and the public answer key. CC BY-NC 4.0.",
                       "fr": "Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51b). Questions de révision et corrigé public. CC BY-NC 4.0."},
            "chapters": chapters}
    return ("/* quiz.js — the Classroom self-check quiz bank (generated by scripts/build_quiz.py; do not edit).\n"
            "   420 multiple-choice review questions of the book, English and French, with the PUBLIC answer key only:\n"
            "   the rationales stay in the instructor resource guide. \"section\" is a reading pointer chosen by word overlap.\n"
            "   © 2026 Marc-André Léger. CC BY-NC 4.0 */\n'use strict';\nself.CRG_QUIZ = "
            + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")


def main(argv):
    js = build()
    if "--check" in argv:
        cur = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
        if cur != js:
            print("build_quiz: js/data/quiz.js is out of date — run python3 scripts/build_quiz.py")
            return 1
        print("build_quiz: quiz bank up to date")
        return 0
    open(OUT, "w", encoding="utf-8").write(js)
    print(f"build_quiz: 21 chapters, 420 questions, EN and FR → {os.path.relpath(OUT, REPO)} ({len(js) // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
