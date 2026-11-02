#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""Build desktop/app/canaretail.js — the CanaRetail teaching case, English and French, same numbers.

Usage: python3 -I examples/canaretail/source/build_canaretail.py [--check]
Prints the reference totals computed by desktop/app/engine/crg_calc.py and the screening ranks; --check fails
when the shipped file differs from what this script builds."""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from cr_common import pick, ORG, APPETITE_RATIONALE, BUDGET_YEARS, EVIDENCE, CROWN, T  # noqa: E402
from cr_scen import SCEN  # noqa: E402
from cr_screen import CANDS, SCREEN, FAMILIES, WATCH, PLAN  # noqa: E402
from cr_rest import INITIATIVES, KRIS, SENS_IDS, SUMMARY  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
APP = os.path.join(ROOT, 'desktop', 'app')
OUT = os.path.join(APP, 'canaretail.js')

CASE = {
    'NAME': T('CanaRetail — teaching case (fictional)', 'CanaRetail — cas pédagogique (fictif)'),
    'ORG': ORG, 'APPETITE_RATIONALE': APPETITE_RATIONALE, 'BUDGET_YEARS': BUDGET_YEARS, 'BUDGET_YEAR': 2026,
    'ASSESSMENT': {
        'APPETITE': 0.5, 'FACTOR': 1000, 'CASE_APPETITE': 0.5, 'CURRENCY': 'CAD',
        'PERIOD': T('next 12 months (November 2026 - October 2027)', '12 prochains mois (novembre 2026 à octobre 2027)'),
        'SOURCE': T('CanaRetail Business Case v2.0c, student version (fictional teaching case)', 'Cas d’affaires CanaRetail v2.0c, version étudiante (cas pédagogique fictif)'),
        'EVIDENCE': EVIDENCE, 'CROWN': CROWN, 'CANDIDATES': CANDS, 'INITIATIVES': INITIATIVES, 'SCEN': SCEN, 'KRIS': KRIS, 'SENS_IDS': SENS_IDS},
    'SCREENING': {'cands': SCREEN, 'families': FAMILIES, 'watch': WATCH, 'plan': PLAN, 'updated': '2026-11-02',
                  'source': T('CanaRetail screening (examples/canaretail/source/cr_screen.py)', 'Tri de CanaRetail (examples/canaretail/source/cr_screen.py)')},
    'SUMMARY': SUMMARY,
}

SCHEMES = [('equal', [1] * 12), ('impact', [2, 1, 1, 1, 2, 1.5, 1.5, 1, 1, 1, 1, 1]),
           ('evidence', [1, 1, 1.5, 1.5, 1, 1, 1, 1, 2, 1, 1, 1]), ('decision', [1] * 10 + [1.5, 2])]


def screening_check(sc):
    """Mirror of js/screening.js analysis(): which selected families are outside the top ten somewhere."""
    C, fam = sc['cands'], sc['families']
    in_fam = {m for f in fam for m in f['members']}
    units = [{'id': f['id'], 'sel': True, 'm': f['members'], 'j': f['judgment']} for f in fam]
    units += [{'id': c[0], 'sel': C[c[0]]['disp'] == 'Select', 'm': [c[0]], 'j': C[c[0]]['rat']} for c in sc['_cands'] if c[0] not in in_fam]
    for u in units:
        u['score'] = {k: max(sum(a * b for a, b in zip(C[m]['scores'], w)) for m in u['m']) for k, w in SCHEMES}
    for k, _ in SCHEMES:
        for i, u in enumerate(sorted(units, key=lambda u: (-u['score'][k], u['id']))):
            u.setdefault('rank', {})[k] = i + 1
    probs = []
    for u in units:
        top_all = all(u['rank'][k] <= 10 for k, _ in SCHEMES)
        top_some = any(u['rank'][k] <= 10 for k, _ in SCHEMES)
        print(f"  {u['id']:4} sel={u['sel']!s:5} ranks={u['rank']}" + ('  BY JUDGMENT' if u['sel'] and not top_all else '') + ('  REVIEW' if not u['sel'] and top_some else ''))
        if u['sel'] and not top_all and not u['j'].strip():
            probs.append(u['id'] + ': selected by judgment without a judgment text')
        if not u['sel'] and top_some and not C[u['id']].get('exclReview') and u['id'] not in {w['id'] for w in sc['watch']}:
            probs.append(u['id'] + ': needs an explicit review')
    for cid, r in C.items():
        assert len(r['scores']) == 12 and all(isinstance(x, int) and 1 <= x <= 5 for x in r['scores']), cid
    return probs


def main():
    data = {'en': pick(CASE, 0), 'fr': pick(CASE, 1)}
    # sanity: same numbers, same structure
    def skel(o):
        if isinstance(o, dict): return {k: skel(v) for k, v in o.items()}
        if isinstance(o, list): return [skel(v) for v in o]
        return o if isinstance(o, (int, float, bool)) or o is None else 's'
    assert skel(data['en']) == skel(data['fr']), 'EN and FR trees differ in shape or numbers'
    scen_ids = {s['id'] for s in SCEN}
    for i in INITIATIVES:
        for s in i[3]:
            assert i[0] in next(x for x in SCEN if x['id'] == s)['inits'], (i[0], s)
    for s in SCEN:
        for i in s['inits']:
            assert s['id'] in next(x for x in INITIATIVES if x[0] == i)[3], (s['id'], i)
        p = s['params']; assert p['Dm']['v'] >= p['De']['v']
    assert any('service account' in s['name'][0] for s in SCEN)
    for f in FAMILIES:
        assert all(x in scen_ids for x in f['scenarios'])
    n = len(CANDS); assert 25 <= n <= 40, n
    sc = dict(data['en']['SCREENING']); sc['_cands'] = data['en']['ASSESSMENT']['CANDIDATES']
    print('screening ranks (top ten per scheme):')
    probs = screening_check(sc)
    for p in probs: print('  PROBLEM', p)
    # reference totals with the Python engine (both languages)
    tot = {}
    for lang in ('en', 'fr'):
        with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f:
            json.dump(data[lang]['ASSESSMENT'], f); path = f.name
        out = subprocess.run([sys.executable, '-I', os.path.join(APP, 'engine', 'crg_calc.py'), path, '--json'], capture_output=True, text=True, check=True).stdout
        os.unlink(path)
        r = json.loads(out); tot[lang] = r
    t = tot['en']['totals'] if 'totals' in tot['en'] else tot['en']
    print('crg_calc.py totals:', json.dumps(t)[:300])
    body = ('/* Fictional CanaRetail teaching case — full ten-scenario assessment in English and French (CyberRiskGuardian example,\n'
            '   CC BY-NC 4.0). Built by examples/canaretail/source/build_canaretail.py — edit the source, not this file.\n'
            '   Same numbers in both languages; the start-up self-check verifies the reference totals of each. */\n'
            'self.CRG_CANARETAIL=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    if '--check' in sys.argv:
        same = os.path.exists(OUT) and open(OUT, encoding='utf-8').read() == body
        print('canaretail.js', 'up to date' if same else 'DIFFERS from the source'); sys.exit(0 if same and not probs else 1)
    open(OUT, 'w', encoding='utf-8').write(body)
    print('wrote', OUT, len(body), 'bytes')
    sys.exit(1 if probs else 0)


if __name__ == '__main__':
    main()
