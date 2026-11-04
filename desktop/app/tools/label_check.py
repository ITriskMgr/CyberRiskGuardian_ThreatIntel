#!/usr/bin/env python3
"""label_check.py — the guidelines and the user guide must name the screens exactly (1.5.4).

Usage
  python3 tools/label_check.py            # check, list anything not found, exit 1 if something is missing

What is checked
  • js/guidelines.js GUIDELINES: every label in “…” quotes inside the guideline text and steps, every
    screen named in `where` (split on → and ;), and every route label of the Open buttons.
  • USER-GUIDE.md, section "Guidelines in detail": every **bold** label and every “…” label.
  • 1.9.1 — menu paths: every "Section → Screen (→ Tab)" path quoted in the first-time guides and the user guide
    (English text) must exist in the side menu (js/menu.js), and every "Help → …" path in the top-bar Help menu
    (js/helpmenu.js) — a tester could not find a screen the guide named.
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


# ---------------------------------------------------------------- 1.9.1: menu paths
MENU_DOCS = ['FIRST-INSTALL.md', 'FIRST-TIME-SETUP.md', 'USER-GUIDE.md']
NOT_PATHS = ('Settings → Developer',)   # Claude Desktop's own menu, quoted by the ontology set-up


def menu_tree():
    """{section label: {child label: set(tab labels)}} from js/menu.js, plus Help from js/helpmenu.js."""
    src = open(os.path.join(ROOT, 'js', 'menu.js'), encoding='utf-8').read()
    body = src[src.index('export const MENU'):]
    tree = {}
    for m in re.finditer(r"\{ id: '[a-z]+', label: '([^']+)', items: \[(.*?)\] \}(?:,|\n)", body, re.S):
        sec, items = m.group(1), m.group(2)
        kids = {}
        for t in re.finditer(r"\bT\('[a-z]+', '([^']+)'", items):
            kids.setdefault(t.group(1), set())
        for sm in re.finditer(r"\bsub\('[a-z]+', '([^']+)', \[(.*?)\](?:, \{[^}]*\})?\)", items, re.S):
            tabs = set(re.findall(r"\['[a-z]+', '([^']+)'\]", sm.group(2)))
            kids.setdefault(sm.group(1), set()).update(tabs)
            for tb in tabs:                       # a flat sub-menu lists its tabs directly under the section
                kids.setdefault(tb, set())
        tree[sec] = kids
    hm = open(os.path.join(ROOT, 'js', 'helpmenu.js'), encoding='utf-8').read()
    tree['Help'] = {l: set() for l in re.findall(r"\['[a-z]+', '([^']+)'\]", hm[hm.index('export const ITEMS'):hm.index('];', hm.index('export const ITEMS'))])}
    tree['Help']['About & versions'] = {'About', 'Licence', 'Versions'}
    # the tabs of Organization profile: the guides name them as "Organization → Workspaces" (a tab of the first screen)
    org = open(os.path.join(ROOT, 'js', 'panels', 'org.js'), encoding='utf-8').read()
    otabs = set(re.findall(r"\['[a-z]+', [`']([A-Z][^`'(]+?)(?: \(\$\{[^}]+\}\))?[`']\]", org[org.index('const tabs = '):org.index('\n', org.index('const tabs = '))]))
    tree['Organization']['Organization profile'] = otabs
    for t in otabs:
        tree['Organization'].setdefault(t, set())
    return tree


def starts(seg, names):
    seg = seg.strip().strip('*').replace('“', '').replace('”', '').strip()
    return max((n for n in names if seg == n or any(seg.startswith(n + c) for c in ' ,).:;|')), key=len, default=None)


def menu_paths():
    tree = menu_tree()
    out, bad = 0, []
    for f in MENU_DOCS:
        text = open(os.path.join(ROOT, f), encoding='utf-8').read()
        text = text.split('\n# Français')[0]
        # soft-wrapped lines of a paragraph are joined, so a path broken across two lines is read whole
        text = re.sub(r'(?<=[^\n])\n(?:(?=[^\n|#>\-\d\s`])|\s+(?=[^\s\-\d|`>]))', ' ', text)
        for ln, line in enumerate(text.splitlines(), 1):
            if any(x in line for x in NOT_PATHS):
                continue
            pieces = line.replace('**', '').replace('*', '').split(' → ')
            ctx = None                               # (section, child) matched exactly by the previous piece
            for i in range(len(pieces) - 1):
                left, right = pieces[i].rstrip(), pieces[i + 1]
                if ctx and ctx[2] == left.strip():
                    sec, child = ctx[0], ctx[1]
                    names = tree[sec][child] if child else tree[sec]
                    if not names:                    # a screen without tabs: what follows is a button or a card
                        ctx = None; continue
                else:
                    if re.search(r'(left-hand menu|left menu)$', left, re.I):
                        sec = starts(right, tree)
                        out += 1
                        if not sec:
                            bad.append((f'{f}:{ln}', f'left-hand menu → {right.strip()[:50]}'))
                            ctx = None; continue
                        ctx = (sec, None, sec); continue
                    sec = max((x for x in tree if re.search(r'(^|[\s(“"])' + re.escape(x) + r'$', left)), key=len, default=None)
                    if not sec:
                        ctx = None; continue
                    child, names = None, tree[sec]
                out += 1
                hit = starts(right, names) or starts(right, {'Check now', 'Answer the set-up questions again', 'Make a backup'})
                if not hit:
                    bad.append((f'{f}:{ln}', f'{sec}{" → " + child if child else ""} → {right.strip()[:50]}'))
                    ctx = None; continue
                ctx = (sec, hit if child is None and hit in tree[sec] else child, hit) if child is None else None
    return out, bad


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
    n, bad = menu_paths()
    print(f'{n} menu paths checked in the first-time guides and the user guide · {len(bad)} not in the menu')
    for w, l in bad:
        print(f'  {w}: {l}')
    sys.exit(1 if missing or bad else 0)


if __name__ == '__main__':
    main()
