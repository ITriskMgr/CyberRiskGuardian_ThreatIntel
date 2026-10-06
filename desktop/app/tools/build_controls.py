#!/usr/bin/env python3
"""build_controls.py — builds js/data/controls.js, the offline mitigation-control catalogue of
CyberRiskGuardian Desktop 1.4.0.

Sources
  * the analyst's list Controls_list.xlsx (ISO/IEC 27002:2013, NIST CSF 1.1 subcategories —
    labelled "NIST 800-53" in the sheet —, CIS Controls v7.1), saved as text by the build;
  * NIST SP 800-53 Rev. 5 and NIST CSF 2.0 OSCAL catalogues (public domain, usnistgov/oscal-content);
  * ISO/IEC 27002:2022 and CIS Controls v8.1: identifiers and short titles only (the texts are
    copyrighted by ISO and CIS and are not reproduced);
  * MITRE ATT&CK mitigations come from kb.js at run time (not duplicated here).

Every control gets a CRG function (Governance, Identify, Prevention, Detection, Response,
Recovery) and capability tags from a transparent keyword table; tags link controls to the CRG
measure catalogue, to ATT&CK mitigations, and to default effectiveness ranges.
© 2026 Marc-André Léger. CC BY-NC 4.0"""
import json, re, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/data'
OUT = os.path.join(HERE, '..', 'js', 'data', 'controls.js')

# ---------------------------------------------------------------- capability tags
# tag: (label, keywords regex, CRG measure key, ATT&CK mitigations, fn, default red_p, default red_i)
TAGS = {
  'mfa':     ('Multi-factor authentication', r'multi-?factor|\bmfa\b|authenticat(ed|ion) commensurate|secure authentication|identification and authentication', 'mfa', ['M1032'], 'Prevention', 0.45, 0.10),
  'iam':     ('Identity and access management', r'identit|access control|access rights|access permissions|user access|account|credential|authenticat|least privilege|separation of duties|segregation of duties|access restriction|session lock|password', 'iam', ['M1018', 'M1027'], 'Prevention', 0.30, 0.10),
  'pam':     ('Privileged access', r'privileged|administrative account|administrator|dedicated (admin|machines|workstations)|privileged utility', 'pam', ['M1026'], 'Prevention', 0.40, 0.25),
  'asset':   ('Asset and data inventory', r'inventor|asset|catalog|discovery tool|ownership of assets|data flows are mapped|component', 'harden', [], 'Identify', 0.10, 0.05),
  'vuln':    ('Vulnerability and patch management', r'vulnerab|patch|flaw remediation|security-related updates|supported by vendor|up-to-date|unsupported|scan', 'vuln', ['M1051', 'M1016'], 'Prevention', 0.35, 0.05),
  'harden':  ('Secure configuration and hardening', r'configur|baseline|hardening|least functionality|secure images|ports|protocols|services are running|auto-run|application whitelist|allowlist|software installation|installation of software|restrictions on (changes|software)|default password', 'harden', ['M1042', 'M1028', 'M1038'], 'Prevention', 0.30, 0.10),
  'seg':     ('Network security and segmentation', r'network|segment|segregat(ion|e) in networks|firewall|boundar|wireless|remote access|vlan|zero trust|communications protection|proxy|netflow|dns', 'seg', ['M1030', 'M1035', 'M1037', 'M1031'], 'Prevention', 0.25, 0.35),
  'edr':     ('Malware defence and endpoint security', r'malware|malicious code|anti-?malware|endpoint|anti-exploit|mobile code|user endpoint', 'edr', ['M1040', 'M1049', 'M1050'], 'Detection', 0.35, 0.30),
  'siem':    ('Logging, monitoring and detection', r'\blog|audit (record|log)|monitor|siem|detect|event data|anomal|alert|clock synchron|time sources|intrusion detection|ids\b|ips\b|continuous monitoring|adverse event', 'siem', ['M1047'], 'Detection', 0.15, 0.40),
  'mail':    ('E-mail and web protection', r'e-?mail|browser|web filter|url|dmarc|phish|messaging|attachments|file types', 'mail', ['M1054', 'M1021', 'M1031'], 'Prevention', 0.40, 0.05),
  'crypto':  ('Cryptography and data protection', r'cryptograph|encrypt|key management|data-at-rest|data-in-transit|masking|hash', 'crypto', ['M1041'], 'Prevention', 0.15, 0.45),
  'dlp':     ('Data leakage prevention and data handling', r'leak|exfiltrat|data loss|dlp|sensitive (data|information)|classification|labell?ing|handling of|media|removable|usb|information transfer|deletion|disposal|destroy|data security|data protection', 'dlp', ['M1057'], 'Detection', 0.20, 0.35),
  'backup':  ('Backup and recovery', r'backup|back-up|recovery|restor|data recovery|redundanc|failsafe|resilien', 'backup', ['M1053'], 'Recovery', 0.05, 0.60),
  'bcp':     ('Continuity and capacity', r'continuity|disruption|contingency|capacity|availability|utilities|ict readiness|alternate (processing|storage)', 'bcp', [], 'Recovery', 0.05, 0.45),
  'ir':      ('Incident response', r'incident|response plan|forensic|evidence|contain|lessons learned|reporting|investigat|public relations|reputation', 'ir', [], 'Response', 0.05, 0.45),
  'tprm':    ('Supplier and supply-chain risk', r'supplier|supply chain|third[- ]party|outsourc|external (information )?systems|service provider|external service|acquisition|cloud service', 'tprm', [], 'Governance', 0.20, 0.20),
  'cloud':   ('Cloud security', r'cloud', 'cloud', ['M1022'], 'Prevention', 0.25, 0.15),
  'aware':   ('Awareness and training', r'aware|train|education|skills|social engineering|informed', 'aware', ['M1017'], 'Prevention', 0.30, 0.05),
  'appsec':  ('Secure development and testing', r'develop|coding|code analysis|source code|software development|system development|engineering principles|test data|security testing|acceptance testing|application security|web application|sdlc|life cycle|change control|change management', 'pentest', ['M1013', 'M1016', 'M1048'], 'Prevention', 0.25, 0.10),
  'pentest': ('Penetration testing and assessment', r'penetration|red team|assessment|technical (compliance|review)|independent review|audit', 'pentest', ['M1016'], 'Identify', 0.15, 0.05),
  'cti':     ('Threat intelligence', r'threat intelligence|threat information|information sharing|special interest|cyber ?threat|threats? .*identified', 'cti', ['M1019'], 'Identify', 0.10, 0.05),
  'gov':     ('Governance, policy and risk management', r'polic|governance|roles and responsibilities|risk management|risk (assessment|tolerance|appetite|strategy)|oversight|program|plan|procedure|legal|regulat|compliance|contract|management responsibilit|accountab', 'tprm', [], 'Governance', 0.10, 0.10),
  'physical':('Physical and environmental security', r'physical|premises|perimeter|entry|offices|facilit|environmental|cabling|equipment|clear desk|secure areas|delivery and loading|visitor|fire|power', None, [], 'Prevention', 0.15, 0.15),
  'hr':      ('Personnel security', r'screening|employment|disciplinary|personnel|termination|human resources|non-disclosure|confidentiality agreements|remote working|teleworking', None, [], 'Prevention', 0.10, 0.05),
  'privacy': ('Privacy and personal information', r'privacy|personally identifiable|\bpii\b|personal (information|data)', 'dlp', [], 'Governance', 0.10, 0.25),
}
FN_BY_PREFIX = {'GV': 'Governance', 'ID': 'Identify', 'PR': 'Prevention', 'DE': 'Detection', 'RS': 'Response', 'RC': 'Recovery'}

def tags_for(text, limit=4):
    t = text.lower()
    out = [k for k, v in TAGS.items() if re.search(v[1], t)]
    # prefer the most specific tags: gov is a fallback
    if len(out) > 1 and 'gov' in out: out.remove('gov')
    return out[:limit] or ['gov']

def fn_for(tags, hint=None):
    if hint: return hint
    return TAGS[tags[0]][4]

# ---------------------------------------------------------------- analyst list
def parse_userlist(path):
    s = open(path, encoding='utf-8').read().strip() + ' '
    rx = re.compile(r'\s*("(?:[^"]|"")*"|[^,]*),([^,]*),(\d*)(?=\s|$)')
    rows, pos = [], 0
    while pos < len(s):
        m = rx.match(s, pos)
        if not m: break
        name = m.group(1)
        if name.startswith('"'): name = name[1:-1].replace('""', '"')
        rows.append((name.strip(), m.group(2).strip(), m.group(3)))
        pos = m.end()
    return rows

CIS71_FIX = {  # spreadsheet numbering artefacts (decimal comma, Excel rounding) → CIS v7.1 sub-control
  ('10', 'Ensure Regular Automated BackUps'): '10.1', ('10', 'Perform Complete System Backups'): '10.2',
  ('10', 'Test Data on Backup Media'): '10.3', ('18', 'Deploy Web Application Firewalls'): '18.10',
}

def user_controls(rows):
    out, flags = [], []
    iso_cat = None
    for name, src, num in rows:
        if src.startswith('ISO') or (not src and re.match(r'^\d+\.\d+ ', name)):
            m = re.match(r'^(\d+(?:\.\d+)+)\s*-?\s*(.*)$', name)
            cid, title = m.group(1), m.group(2).strip()
            title = re.sub(r'\s*\((new|New)\)\s*$', '', title).replace('- ', '-').replace('mal-Ware', 'malware').replace('environ-mental', 'environmental')
            if not src:  # category heading
                iso_cat = cid + ' ' + title; continue
            note = ''
            if cid == '12.4.1' and 'operational software' in title.lower():
                note = 'Listed under 14.1 with number 12.4.1 in the source sheet; in ISO/IEC 27002:2013 this is 12.5.1 — kept as supplied, review the number.'
                flags.append(('ISO27002:2013', cid, title, note)); cid = '12.4.1*'
            out.append({'fw': 'USR-ISO13', 'id': cid, 't': title, 'grp': iso_cat or cid.split('.')[0], 'note': note})
        elif src == 'NIST 800-53':
            m = re.match(r'^([A-Z]{2}\.[A-Z]{2}-\d+):\s*(.*)$', name)
            if not m:
                note = 'Row without an identifier in the source sheet; kept as an organization-specific control.'
                flags.append(('NIST 800-53 (sheet label)', '—', name, note))
                out.append({'fw': 'USR-CSF11', 'id': 'ORG-' + re.sub(r'\W+', '-', name.upper())[:12].strip('-'), 't': name, 'grp': 'Organization-specific', 'note': note})
                continue
            cid, title = m.group(1), m.group(2).strip()
            note = ''
            if cid.startswith('PR.SE'):
                note = 'Not a NIST CSF 1.1 subcategory (no PR.SE category exists); kept as an organization-specific control.'
                flags.append(('NIST 800-53 (sheet label)', cid, title, note))
            out.append({'fw': 'USR-CSF11', 'id': cid, 't': title, 'grp': cid.split('-')[0], 'fn': FN_BY_PREFIX.get(cid[:2]), 'note': note})
        elif src.startswith('CIS'):
            m = re.match(r'^(\d+)[,.](\d+)\s+(.*)$', name)
            maj, mi, title = m.group(1), m.group(2), m.group(3).strip()
            note = ''
            if (maj, title) in CIS71_FIX and CIS71_FIX[(maj, title)] != f'{maj}.{mi}':
                fixed = CIS71_FIX[(maj, title)]
                note = f'Number "{maj},{mi}" in the source sheet corrected to {fixed} (decimal-comma / rounding artefact).'
                flags.append(('CIS controls V7.1', f'{maj},{mi}', title, note)); cid = fixed
            else:
                cid = f'{int(maj)}.{int(mi)}'
                if ',' in name.split(' ')[0]: pass  # decimal comma only: silent normalization
            out.append({'fw': 'USR-CIS71', 'id': cid, 't': title, 'grp': 'CIS ' + cid.split('.')[0], 'note': note})
    return out, flags

# ---------------------------------------------------------------- NIST OSCAL
def prose(parts, name='statement'):
    for p in parts or []:
        if p.get('name') == name:
            txt = p.get('prose', '')
            for q in p.get('parts', []) or []:
                txt += ' ' + prose([q], q.get('name'))
            return re.sub(r'\{\{\s*insert: param, [^}]+\}\}', '[assignment]', txt).strip()
    return ''

FAM = {'ac': 'iam', 'at': 'aware', 'au': 'siem', 'ca': 'pentest', 'cm': 'harden', 'cp': 'backup', 'ia': 'mfa', 'ir': 'ir', 'ma': 'physical',
       'mp': 'dlp', 'pe': 'physical', 'pl': 'gov', 'pm': 'gov', 'ps': 'hr', 'pt': 'privacy', 'ra': 'vuln', 'sa': 'appsec', 'sc': 'seg', 'si': 'edr', 'sr': 'tprm'}
def fam_tags(fam, title):
    if re.search(r'policy and procedures', title, re.I): return ['gov']
    t = [FAM.get(fam, 'gov')]
    for x in tags_for(title, 3):
        if x not in t and x != 'gov': t.append(x)
    return t[:3]

def nist53(path):
    c = json.load(open(path))['catalog']
    out = []
    for g in c['groups']:
        for x in g['controls']:
            props = {p['name']: p.get('value') for p in x.get('props', [])}
            if props.get('status') == 'withdrawn': continue
            cid = props.get('label') or x['id'].upper()
            out.append({'fw': 'NIST-53', 'id': cid, 't': x['title'], 'grp': g['title'], 'tags': fam_tags(g['id'], x['title'])})
            for e in x.get('controls', []) or []:
                ep = {p['name']: p.get('value') for p in e.get('props', [])}
                if ep.get('status') == 'withdrawn': continue
                out.append({'fw': 'NIST-53', 'id': ep.get('label') or e['id'].upper(), 't': x['title'] + ' | ' + e['title'], 'grp': g['title'], 'enh': 1, 'tags': fam_tags(g['id'], e['title'])})
    return out

def csf2(path):
    c = json.load(open(path))['catalog']
    out = []
    for f in c['groups']:
        for cat in f.get('groups', []) + f.get('controls', []):
            if cat.get('props') and any(p.get('name') == 'status' and p.get('value') == 'withdrawn' for p in cat['props']): continue
            for sc in cat.get('controls', []) or []:
                st = prose(sc.get('parts'))
                if not st or any(p.get('name') == 'status' and p.get('value') == 'withdrawn' for p in sc.get('props', [])): continue
                out.append({'fw': 'CSF2', 'id': sc['id'], 't': st, 'grp': f"{cat['id']} {cat['title']}", 'fn': FN_BY_PREFIX.get(sc['id'][:2])})
    return out

# ---------------------------------------------------------------- ISO/IEC 27002:2022 (IDs + short titles)
ISO22 = """5.1 Policies for information security|5.2 Information security roles and responsibilities|5.3 Segregation of duties|5.4 Management responsibilities|5.5 Contact with authorities|5.6 Contact with special interest groups|5.7 Threat intelligence|5.8 Information security in project management|5.9 Inventory of information and other associated assets|5.10 Acceptable use of information and other associated assets|5.11 Return of assets|5.12 Classification of information|5.13 Labelling of information|5.14 Information transfer|5.15 Access control|5.16 Identity management|5.17 Authentication information|5.18 Access rights|5.19 Information security in supplier relationships|5.20 Addressing information security within supplier agreements|5.21 Managing information security in the ICT supply chain|5.22 Monitoring, review and change management of supplier services|5.23 Information security for use of cloud services|5.24 Information security incident management planning and preparation|5.25 Assessment and decision on information security events|5.26 Response to information security incidents|5.27 Learning from information security incidents|5.28 Collection of evidence|5.29 Information security during disruption|5.30 ICT readiness for business continuity|5.31 Legal, statutory, regulatory and contractual requirements|5.32 Intellectual property rights|5.33 Protection of records|5.34 Privacy and protection of PII|5.35 Independent review of information security|5.36 Compliance with policies, rules and standards for information security|5.37 Documented operating procedures|6.1 Screening|6.2 Terms and conditions of employment|6.3 Information security awareness, education and training|6.4 Disciplinary process|6.5 Responsibilities after termination or change of employment|6.6 Confidentiality or non-disclosure agreements|6.7 Remote working|6.8 Information security event reporting|7.1 Physical security perimeters|7.2 Physical entry|7.3 Securing offices, rooms and facilities|7.4 Physical security monitoring|7.5 Protecting against physical and environmental threats|7.6 Working in secure areas|7.7 Clear desk and clear screen|7.8 Equipment siting and protection|7.9 Security of assets off-premises|7.10 Storage media|7.11 Supporting utilities|7.12 Cabling security|7.13 Equipment maintenance|7.14 Secure disposal or re-use of equipment|8.1 User endpoint devices|8.2 Privileged access rights|8.3 Information access restriction|8.4 Access to source code|8.5 Secure authentication|8.6 Capacity management|8.7 Protection against malware|8.8 Management of technical vulnerabilities|8.9 Configuration management|8.10 Information deletion|8.11 Data masking|8.12 Data leakage prevention|8.13 Information backup|8.14 Redundancy of information processing facilities|8.15 Logging|8.16 Monitoring activities|8.17 Clock synchronization|8.18 Use of privileged utility programs|8.19 Installation of software on operational systems|8.20 Networks security|8.21 Security of network services|8.22 Segregation of networks|8.23 Web filtering|8.24 Use of cryptography|8.25 Secure development life cycle|8.26 Application security requirements|8.27 Secure system architecture and engineering principles|8.28 Secure coding|8.29 Security testing in development and acceptance|8.30 Outsourced development|8.31 Separation of development, test and production environments|8.32 Change management|8.33 Test information|8.34 Protection of information systems during audit testing"""
ISO_THEME = {'5': 'Organizational controls', '6': 'People controls', '7': 'Physical controls', '8': 'Technological controls'}

CIS81 = """1 Inventory and Control of Enterprise Assets|2 Inventory and Control of Software Assets|3 Data Protection|4 Secure Configuration of Enterprise Assets and Software|5 Account Management|6 Access Control Management|7 Continuous Vulnerability Management|8 Audit Log Management|9 Email and Web Browser Protections|10 Malware Defenses|11 Data Recovery|12 Network Infrastructure Management|13 Network Monitoring and Defense|14 Security Awareness and Skills Training|15 Service Provider Management|16 Application Software Security|17 Incident Response Management|18 Penetration Testing"""
CIS81_TAGS = {'1': ['asset'], '2': ['asset', 'harden'], '3': ['dlp', 'crypto'], '4': ['harden'], '5': ['iam'], '6': ['iam', 'mfa', 'pam'], '7': ['vuln'], '8': ['siem'],
              '9': ['mail'], '10': ['edr'], '11': ['backup'], '12': ['seg'], '13': ['seg', 'siem'], '14': ['aware'], '15': ['tprm'], '16': ['appsec'], '17': ['ir'], '18': ['pentest']}

FRAMEWORKS = [
  {'id': 'USR-ISO13', 'name': 'ISO/IEC 27002:2013', 'short': 'ISO 27002:2013', 'origin': 'Your list (Controls_list.xlsx)', 'note': 'Identifiers and titles as supplied in the analyst list. ISO/IEC 27002 is © ISO/IEC; the control text is not reproduced.'},
  {'id': 'USR-CSF11', 'name': 'NIST Cybersecurity Framework 1.1 subcategories', 'short': 'NIST CSF 1.1', 'origin': 'Your list (Controls_list.xlsx)', 'note': 'Labelled "NIST 800-53" in the source sheet; the identifiers (ID.AM-1 … RC.CO-3) are NIST CSF 1.1 subcategories, which reference SP 800-53 as informative references. Relabelled for accuracy.'},
  {'id': 'USR-CIS71', 'name': 'CIS Controls v7.1 sub-controls', 'short': 'CIS v7.1', 'origin': 'Your list (Controls_list.xlsx)', 'note': 'Decimal-comma numbering normalized (1,1 → 1.1); four numbers corrected (see flags). CIS Controls © Center for Internet Security, CC BY-NC-ND 4.0.'},
  {'id': 'ISO22', 'name': 'ISO/IEC 27002:2022', 'short': 'ISO 27002:2022', 'origin': 'Bundled — identifiers and short titles', 'note': 'Current edition (93 controls in 4 themes). © ISO/IEC — titles only; consult the standard for the control text.'},
  {'id': 'NIST-53', 'name': 'NIST SP 800-53 Rev. 5', 'short': 'SP 800-53 r5', 'origin': 'Bundled — NIST OSCAL catalogue (public domain)', 'note': 'Base controls and control enhancements, withdrawn items excluded.'},
  {'id': 'CSF2', 'name': 'NIST Cybersecurity Framework 2.0', 'short': 'NIST CSF 2.0', 'origin': 'Bundled — NIST OSCAL catalogue (public domain)', 'note': 'Subcategory outcomes with their statements.'},
  {'id': 'CIS81', 'name': 'CIS Controls v8.1', 'short': 'CIS v8.1', 'origin': 'Bundled — control level', 'note': '18 controls (safeguards not reproduced). CIS Controls © Center for Internet Security, CC BY-NC-ND 4.0.'},
  {'id': 'ATTACK-M', 'name': 'MITRE ATT&CK Enterprise mitigations', 'short': 'ATT&CK M', 'origin': 'Bundled — kb.js (ATT&CK v19.2)', 'note': 'Read from the bundled ATT&CK knowledge base at run time; linked to techniques.'},
  {'id': 'CRG', 'name': 'CyberRiskGuardian measure catalogue', 'short': 'CRG', 'origin': 'Built in', 'note': 'The 20 CRG measures used by Recommendations, mapped to ATT&CK mitigations.'},
]

def main():
    rows = parse_userlist(os.path.join(DATA, 'ctl', 'userlist.txt'))
    user, flags = user_controls(rows)
    ctl = list(user)
    for line in ISO22.split('|'):
        cid, title = line.split(' ', 1)
        ctl.append({'fw': 'ISO22', 'id': cid, 't': title, 'grp': ISO_THEME[cid.split('.')[0]]})
    ctl += nist53(os.path.join(DATA, 'nist53.json'))
    ctl += csf2(os.path.join(DATA, 'csf2.json'))
    for line in CIS81.split('|'):
        cid, title = line.split(' ', 1)
        ctl.append({'fw': 'CIS81', 'id': 'CIS ' + cid, 't': title, 'grp': 'CIS Controls v8.1', 'tags': CIS81_TAGS[cid]})
    for c in ctl:
        if 'tags' not in c: c['tags'] = tags_for(c['t'] + ' ' + (c.get('grp') or ''))
        c['fn'] = c.get('fn') or fn_for(c['tags'])
        if not c.get('note'): c.pop('note', None)
    counts = {}
    for c in ctl: counts[c['fw']] = counts.get(c['fw'], 0) + 1
    for f in FRAMEWORKS: f['count'] = counts.get(f['id'], 0)
    tags = {k: {'label': v[0], 'measure': v[2], 'mits': v[3], 'fn': v[4], 'rp': v[5], 'ri': v[6]} for k, v in TAGS.items()}
    # compact arrays: [fw, id, title, group, fn, tags, note, enh]
    fwi = {f['id']: i for i, f in enumerate(FRAMEWORKS)}
    packed = [[fwi[c['fw']], c['id'], c['t'], c.get('grp', ''), c['fn'], c['tags'], c.get('note', ''), c.get('enh', 0)] for c in ctl]
    data = {'version': '1.4.0', 'frameworks': FRAMEWORKS, 'tags': tags, 'controls': packed,
            'flags': [{'source': a, 'id': b, 'title': c, 'note': d} for a, b, c, d in flags]}
    js = ('/* controls.js — mitigation-control catalogue for CyberRiskGuardian Desktop 1.4.0 (generated by tools/build_controls.py).\n'
          '   NIST SP 800-53 r5 and CSF 2.0: public domain (NIST OSCAL). ISO/IEC 27002: identifiers and titles only, © ISO/IEC.\n'
          '   CIS Controls: identifiers and titles only, © Center for Internet Security. Analyst list: Controls_list.xlsx. */\n'
          'self.CRG_CONTROLS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(OUT, 'w', encoding='utf-8').write(js)
    print('controls', len(ctl), counts, 'flags', len(flags), 'bytes', len(js))
    for f in flags: print('  FLAG', f)

if __name__ == '__main__':
    main()
