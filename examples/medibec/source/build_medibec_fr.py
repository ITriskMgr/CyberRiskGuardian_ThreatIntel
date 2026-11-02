#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""Build desktop/app/medibec-fr.js — the MediBec teaching case in French, as a separate bundled example.

Only text is translated: every number, identifier, CVSS vector, ATT&CK and CWE reference, confidence level,
screening disposition, flag, strategy and coverage category is copied unchanged, so the French case
reproduces the reference totals 84,305 / 41,023 exactly. Translations: examples/medibec/source/fr/*.tsv
(id <TAB> French), keyed to the string list this script extracts from desktop/app/medibec.js and
medibec-screening.js. Terminology follows the French edition of the book (appétence pour le risque,
joyaux de la couronne, registre des éléments probants, ratio de tolérance).

Usage: python3 -I examples/medibec/source/build_medibec_fr.py [--check] [--dump strings.json]"""
import glob, json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
APP = os.path.join(ROOT, 'desktop', 'app')
OUT = os.path.join(APP, 'medibec-fr.js')

SKIP_KEYS = {'conf', 'disp', 'flags', 'strategy', 'coverage', 'cvss', 'attack', 'cwe', 'cves', 'id', 'members', 'scenarios', 'inits', 'ev', 'updated'}
IDRE = re.compile(r'^([A-Z]{1,4}-?\d+[a-z]?)([,/ ]+[A-Z]{1,4}-?\d+[a-z]?)*$|^[\d%<>=., +\-–]*$|^CVSS:|^T\d{4}|^CWE-')
# columns of the array records that hold text (the others are identifiers, ratings, amounts, frequencies);
# the start and end columns of INITIATIVES are listed but their "Month N" values stay English (recs.js parses them)
COLS = {'EVIDENCE': (1, 2, 3), 'CROWN': (1, 2, 3, 7, 8), 'CANDIDATES': (1, 2, 3, 4, 5, 6, 7, 8),
        'INITIATIVES': (1, 2, 4, 8, 9, 10, 11, 12), 'KRIS': (1, 3, 4, 5, 7, 8, 9)}

# the profile medibecWorkspace() builds (js/state.js), in French
ORG = {
    'name': 'MediBec (fictif)', 'sector': 'Santé — réseau de cliniques privées', 'size': 'Moyenne',
    'region': 'Québec, Canada', 'mission': 'Soins ambulatoires intégrés dans 10 cliniques (Montréal, Québec, Gatineau, Saguenay).',
    'services': 'Consultations cliniques, imagerie radiologique, laboratoire, pharmacie, prise de rendez-vous en ligne et portail patient, téléconsultation.',
    'processes': 'Documentation clinique et continuité des soins; diagnostic et résultats; gestion des médicaments; prise de rendez-vous; facturation.',
    'systems': 'DSE intégré; systèmes de radiologie, de laboratoire et de pharmacie; facturation; prise de rendez-vous; courriel et communications; équipement médical connecté.',
    'cloud': 'Accès à distance infonuagique; stockage infonuagique pour le transfert d’images médicales.',
    'suppliers': 'Fournisseur du DSE; fournisseurs des systèmes d’imagerie, de laboratoire et de pharmacie; fournisseurs d’hébergement et de services en ligne.',
    'regulations': ['Loi 25 du Québec (Loi sur la protection des renseignements personnels dans le secteur privé)', 'LPRPDE'],
    'sensitive': 'Renseignements de santé personnels des patients; renseignements personnels du personnel; données de paiement.',
    'availability': 'Les systèmes cliniques sont nécessaires pendant les heures d’ouverture des cliniques; une panne du DSE interrompt les consultations.',
    'maturity': 'Pare-feu, IDS/IPS, antimaliciel, stockage chiffré, sauvegardes sur place et hors site; deux employés dédiés à la sécurité.',
    'notes': 'Source : cas d’affaires MediBec v2.0b (cas pédagogique fictif). Tous les chiffres sont illustratifs.',
    'materiality': 'Toute menace crédible pour les décisions cliniques ou la sécurité des patients; toute exposition de renseignements de santé touchant de nombreux patients; toute perte des systèmes cliniques dans plusieurs cliniques au-delà d’une journée de travail. Estimation analytique — validation requise.',
}
APPETITE_RATIONALE = ('Prestataire de soins de santé traitant des renseignements de santé personnels sous le régime de la Loi 25 du Québec : '
                      'appétence pour le risque faible (0,30). Estimation analytique — validation requise.')
NAME = 'MediBec (français) — cas pédagogique (fictif)'


def load(f, v):
    s = open(os.path.join(APP, f), encoding='utf-8').read()
    return json.loads(s[s.index('=', s.index('self.' + v)) + 1:].strip().rstrip(';'))


def strings(a, sc):
    """The translatable strings, in a stable order (the ids of the .tsv files)."""
    order, seen = [], set()

    def add(s):
        if isinstance(s, str) and s not in seen and not IDRE.match(s.strip()) and re.search('[A-Za-z]', s):
            seen.add(s); order.append(s)

    def walk(o, key=None):
        if isinstance(o, str):
            if key not in SKIP_KEYS: add(o)
        elif isinstance(o, dict):
            for k, v in o.items(): walk(v, k)
        elif isinstance(o, list):
            for v in o: walk(v, key)
    for k in ('PERIOD', 'SOURCE'): add(a[k])
    for name in ('EVIDENCE', 'CROWN', 'CANDIDATES', 'INITIATIVES', 'KRIS'):
        for r in a[name]:
            for i in COLS[name]:
                add(r[i])
    for s in a['SCEN']: walk(s)
    walk(sc)
    return order


def translate(a, sc, T):
    def tr(s):
        return T.get(s, s) if isinstance(s, str) else s

    def walk(o, key=None):
        if isinstance(o, str):
            return o if key in SKIP_KEYS else tr(o)
        if isinstance(o, dict):
            return {k: walk(v, k) for k, v in o.items()}
        if isinstance(o, list):
            return [walk(v, key) for v in o]
        return o
    a = json.loads(json.dumps(a))
    for k in ('PERIOD', 'SOURCE'): a[k] = tr(a[k])
    for name in ('EVIDENCE', 'CROWN', 'CANDIDATES', 'INITIATIVES', 'KRIS'):
        for r in a[name]:
            for i in COLS[name]:
                r[i] = tr(r[i])
    a['SCEN'] = [walk(s) for s in a['SCEN']]
    return a, walk(sc)


def main():
    a, sc = load('medibec.js', 'CRG_MEDIBEC'), load('medibec-screening.js', 'CRG_MEDIBEC_SCREENING')
    order = strings(a, sc)
    if '--dump' in sys.argv:
        json.dump(order, open(sys.argv[sys.argv.index('--dump') + 1], 'w'), ensure_ascii=False, indent=0); return
    T = {}
    for f in sorted(glob.glob(os.path.join(HERE, 'fr', '*.tsv'))):
        for line in open(f, encoding='utf-8'):
            if not line.strip(): continue
            i, fr = line.rstrip('\n').split('\t', 1)
            T[order[int(i)]] = fr
    untranslated = [s for s in order if s not in T]
    fa, fsc = translate(a, sc, T)

    def skel(o):
        if isinstance(o, dict): return {k: skel(v) for k, v in o.items()}
        if isinstance(o, list): return [skel(v) for v in o]
        return 's' if isinstance(o, str) else o
    assert skel(fa) == skel(a) and skel(fsc) == skel(sc), 'the French case must keep every number and the shape'
    data = {'NAME': NAME, 'ORG': ORG, 'APPETITE_RATIONALE': APPETITE_RATIONALE,
            'BUDGET': {'it_budget': 100000000, 'spend': 912000, 'baseline': 912000}, 'ASSESSMENT': fa, 'SCREENING': fsc}
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f:
        json.dump(fa, f); path = f.name
    out = subprocess.run([sys.executable, '-I', os.path.join(APP, 'engine', 'crg_calc.py'), path], capture_output=True, text=True, check=True).stdout
    os.unlink(path)
    line = next(x for x in out.splitlines() if x.startswith('Total estimated'))
    print(f'{len(order)} strings, {len(order) - len(untranslated)} translated, {len(untranslated)} kept as they are (identifiers, references)')
    for s in untranslated: print('  kept:', s[:90])
    print('crg_calc.py on the French case:', line)
    assert 'Total estimated 84,305' in line and 'residual 41,023' in line
    body = ('/* Fictional MediBec teaching case in French — the 30-scenario assessment, its documents and its screening (CyberRiskGuardian\n'
            '   example, CC BY-NC 4.0). Built by examples/medibec/source/build_medibec_fr.py from medibec.js and medibec-screening.js:\n'
            '   text translated, numbers untouched (84,305 / 41,023). Draft translation — a native read-through is pending. */\n'
            'self.CRG_MEDIBEC_FR=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    if '--check' in sys.argv:
        same = os.path.exists(OUT) and open(OUT, encoding='utf-8').read() == body
        print('medibec-fr.js', 'up to date' if same else 'DIFFERS from the source'); sys.exit(0 if same else 1)
    open(OUT, 'w', encoding='utf-8').write(body)
    print('wrote', OUT, len(body), 'bytes')


if __name__ == '__main__':
    main()
