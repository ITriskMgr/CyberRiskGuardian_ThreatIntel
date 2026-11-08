#!/usr/bin/env python3
"""fr_terms_check.py — French terminology gate (CyberRiskGuardian Desktop 1.9.2, NV-042, decisions FR-1…FR-3).

The author decided on 8 November 2026:
  FR-1  the ratio is « ratio risque résiduel / risque toléré » (short « Ratio rés./tol. » in tight table headers);
        « ratio de tolérance » is retired;
  FR-2  « probabilité » everywhere; « vraisemblance » is retired (including the 1–5 scale of the risk register);
  FR-3  « éléments probants » everywhere (menus and registers); « preuve(s) » for *evidence* is retired.

This gate reads the French values of js/i18n/fr.js (never the English keys), USER-GUIDE.fr.md, the French half of
FIRST-TIME-SETUP.md and the help pages, and fails on any retired term. Idioms that are not the evidence sense are
allowed: « preuve de concept » (proof of concept), « faire la preuve de », « preuves à l’appui », « preuve de
destruction » (a document kind). Case data (medibec-fr.js, canaretail.js) is never checked: it is content, not interface.

Usage: python3 tools/fr_terms_check.py [--list]      exit 1 when a retired term remains.
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RETIRED = [
    ('FR-2', re.compile(r'\bvraisemblances?\b', re.I)),
    ('FR-1', re.compile(r'\bratios? de tol[ée]rance\b', re.I)),
    ('FR-3', re.compile(r'\bpreuves?\b', re.I)),
]
ALLOWED = re.compile(r"\bpreuves? de concept\b|\b(?:fai[st]|faire|font|fasse|faisant|fera|feront|faite?) (?:la )?preuve\b|\bpreuves? à l['’]appui\b|\bpreuve de destruction\b|\bà preuve du contraire\b", re.I)


def fr_values(path):
    """(line number, French value) for every catalogue entry."""
    out = []
    for i, line in enumerate(open(path, encoding='utf-8'), 1):
        m = re.match(r'^"(?:[^"\\]|\\.)*":\s*"((?:[^"\\]|\\.)*)",?\s*$', line)
        if m: out.append((i, m.group(1)))
    return out


def french_lines(path):
    """Every line of a French document; for FIRST-TIME-SETUP.md only the part after the « # Français » heading."""
    lines = open(path, encoding='utf-8').read().split('\n')
    if os.path.basename(path) == 'FIRST-TIME-SETUP.md':
        start = next((i for i, l in enumerate(lines) if l.strip() == '# Français'), 0)
        return [(i + 1, l) for i, l in enumerate(lines) if i >= start]
    return [(i + 1, l) for i, l in enumerate(lines)]


def scan(items):
    hits = []
    for n, text in items:
        clean = ALLOWED.sub(' ', text)
        for rule, rx in RETIRED:
            for m in rx.finditer(clean):
                hits.append((n, rule, m.group(0), clean[max(0, m.start() - 40):m.end() + 30].replace('\n', ' ')))
    return hits


def main(argv):
    files = [('js/i18n/fr.js', fr_values), ('USER-GUIDE.fr.md', french_lines), ('FIRST-TIME-SETUP.md', french_lines)]
    helpdir = os.path.join(ROOT, 'help')
    if os.path.isdir(helpdir):
        files += [(os.path.join('help', f), french_lines) for f in sorted(os.listdir(helpdir)) if f.endswith('.html')]
    total = 0
    for rel, reader in files:
        p = os.path.join(ROOT, rel)
        if not os.path.isfile(p): continue
        hits = scan(reader(p))
        total += len(hits)
        if hits:
            print(f'{rel}: {len(hits)} retired term(s)')
            for n, rule, term, ctx in hits[:50 if '--list' in argv else 8]:
                print(f'  {rel}:{n} [{rule}] «{term}» … {ctx}')
    if total:
        print(f'fr_terms_check: FAIL — {total} retired French term(s); apply FR-1…FR-3 (« ratio risque résiduel / risque toléré », « probabilité », « éléments probants »)')
        return 1
    print('fr_terms_check: OK — no retired French term (FR-1 ratio, FR-2 probabilité, FR-3 éléments probants)')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
