#!/usr/bin/env python3
"""label_check.py — the guidelines and the user guide must name the screens exactly (1.5.4).

Usage
  python3 tools/label_check.py            # check, list anything not found, exit 1 if something is missing

What is checked
  • js/guidelines.js GUIDELINES: every label in “…” quotes inside the guideline text and steps, every
    screen named in `where` (split on → and ;), and every route label of the Open buttons.
  • USER-GUIDE.md, section "Guidelines in detail": every **bold** label and every “…” label.
A label is found when it is an interface string of the application (tools/i18n_coverage.collect, the
same extraction the translation coverage uses) or a verbatim substring of one. " … " inside a label
stands for a variable part (a number, a name). Quotations that are not interface labels (examples such
as “Ransomware”, RACI letters) are listed in NOT_LABELS.
© 2026 Marc-André Léger. CC BY-NC 4.0
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import i18n_coverage as C

ROOT = C.ROOT
NOT_LABELS = {'Ransomware', 'A', 'R', 'C', 'I', '–', 'Done', 'High', 'Medium', 'Low', 'FACT', 'INFERENCE', 'ASSUMPTION', 'EXTERNAL', 'UNKNOWN',
              'Draft', 'In review', 'Approved', 'Workspace provider', 'Local model only', 'Default (RACI)', 'Full', 'View only', 'Hidden'}


def interface_strings():
    found = C.collect()
    # leave out the texts that quote labels (the guidelines and help themselves): they would match anything
    return [re.sub(r'<[^>]+>', ' ', k) for k, files in found.items()
            if not ('“' in k and files <= {'js/guidelines.js', 'js/panels/process.js', 'js/help.js', 'js/process.js'})]


def matcher(strings):
    blob = '\n'.join(strings)
    # templates: {0} → any text
    pats = [re.compile('^' + re.sub(r'\\\{\d+\\\}', '.+?', re.escape(s)) + '$', re.S) for s in strings if '{' in s]

    def has(label):
        lab = label.strip()
        if not lab or lab in NOT_LABELS:
            return True
        if lab in blob:
            return True
        if ' … ' in lab or re.search(r'\d', lab):
            rx = re.escape(lab).replace(r'\ …\ ', '.+?')
            rx = re.sub(r'\d[\d,.]*', r'.+?', rx)
            if any(re.search(rx, s) for s in strings) or any(p.match(lab) for p in pats):
                return True
        # a label can be a variable sentence the app builds: "Add 12 selected to the register"
        return any(p.match(lab) for p in pats)
    return has


def guideline_labels():
    src = open(os.path.join(ROOT, 'js', 'guidelines.js'), encoding='utf-8').read()
    body = src[src.index('export const GUIDELINES'):src.index('];', src.index('export const GUIDELINES'))]
    out = []
    for q in re.findall(r'“([^”]+)”', body):
        out.append(('guidelines.js guideline', q))
    for w in re.findall(r"where: '([^']+)'", body):
        for seg in re.split(r'\s*(?:→|;)\s*', w):
            seg = re.sub(r'\s*\(.*?\)\s*', '', seg).strip()
            if seg and seg[0].isupper():
                out.append(('guidelines.js where', seg))
    for r in re.findall(r"\['[^']+', '([^']+)'\]", body):
        out.append(('guidelines.js route', r))
    return out


def guide_labels():
    g = open(os.path.join(ROOT, 'USER-GUIDE.md'), encoding='utf-8').read()
    m = re.search(r'\n### [^\n]*Guidelines in detail[^\n]*\n([\s\S]*?)(?=\n### |\n## )', g)
    if not m:
        return [('USER-GUIDE.md', '(section "Guidelines in detail" not found)')]
    sec = m.group(1)
    out = [('USER-GUIDE.md bold', b) for b in re.findall(r'\*\*([^*]+)\*\*', sec)]
    out += [('USER-GUIDE.md quoted', q) for q in re.findall(r'“([^”]+)”', sec)]
    return out


def main():
    has = matcher(interface_strings())
    labels = guideline_labels() + guide_labels()
    # bold headings of the guidelines themselves are not screen labels
    from_guidelines = {h for h in re.findall(r"\{ h: '([^']+)'", open(os.path.join(ROOT, 'js', 'guidelines.js'), encoding='utf-8').read())}
    missing = []
    for where, lab in labels:
        core = re.sub(r'^\d+\.\s*', '', lab).rstrip('.').strip()
        if core in from_guidelines or core.startswith(('Where', 'Done when', 'Steps')):
            continue
        if not has(core):
            missing.append((where, core))
    print(f'{len(labels)} labels checked · {len(missing)} not found in the application')
    for w, l in missing:
        print(f'  {w}: “{l}”')
    sys.exit(1 if missing else 0)


if __name__ == '__main__':
    main()
