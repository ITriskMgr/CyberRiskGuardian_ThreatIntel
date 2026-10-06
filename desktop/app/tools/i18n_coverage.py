#!/usr/bin/env python3
"""i18n_coverage.py — interface strings and catalogue coverage (CyberRiskGuardian Desktop 1.5.2).

Usage
  python3 tools/i18n_coverage.py              # coverage of every catalogue in js/i18n/
  python3 tools/i18n_coverage.py fr --missing # list the interface strings French does not cover yet
  python3 tools/i18n_coverage.py --dump strings.json   # every interface string found (to start a new language)

How it works
  The screens are written in English. This tool reads index.html, the pages in help/ that open in
  their own window, and every module in js/ and js/panels/
  (not js/data/: reference catalogues such as ISO/IEC 27002 titles stay in their original language, like
  user and case content), finds the string literals that look like interface text, and turns template
  literals into catalogue patterns: `Open ${x}` becomes "Open {0}". A string is covered when the catalogue
  has it as an exact key, as a numbered key ('#' = a number) or through a {0} pattern.

  Static analysis cannot see every string drawn at run time; the end-to-end French test complements it by
  collecting, on every screen, the text shown without a translation (i18n.collectMissing()).
© 2026 Marc-André Léger. CC BY-NC 4.0
"""
import html as htmlmod, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = [os.path.join(ROOT, 'js'), os.path.join(ROOT, 'js', 'panels')]
SKIP_FILES = {'i18n.js', 'cvss4.js', 'crg.js', 'sample.js', 'threat.js', 'xlsx.js', 'snapgen.js', 'ontology.js', 'feedparse.js'}


def tokens(src):
    """Yield (kind, value) for string and template literals in JavaScript source (comments and regex skipped)."""
    i, n, prev = 0, len(src), ''
    while i < n:
        c = src[i]
        if c in ' \t\r\n':
            i += 1; continue
        if src.startswith('//', i):
            j = src.find('\n', i); i = n if j < 0 else j; continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c in '\'"':
            j, buf = i + 1, []
            while j < n and src[j] != c:
                if src[j] == '\\' and j + 1 < n:
                    nx = src[j + 1]
                    buf.append({'n': '\n', 't': '\t', '\\': '\\', "'": "'", '"': '"', '`': '`'}.get(nx, nx if nx != 'u' else ''))
                    if nx == 'u':
                        m = re.match(r'u\{?([0-9a-fA-F]{4,5})\}?', src[j + 1:])
                        if m: buf.append(chr(int(m.group(1), 16))); j += len(m.group(0)) - 1
                    j += 2; continue
                if src[j] == '\n': break
                buf.append(src[j]); j += 1
            yield ('s', ''.join(buf)); i = j + 1; prev = 'v'; continue
        if c == '`':
            j, parts, buf, depth = i + 1, [], [], 0
            while j < n and src[j] != '`':
                if src[j] == '\\' and j + 1 < n:
                    buf.append({'n': '\n', 't': '\t'}.get(src[j + 1], src[j + 1])); j += 2; continue
                if src.startswith('${', j):
                    k, d = j + 2, 1
                    while k < n and d:
                        if src[k] == '{': d += 1
                        elif src[k] == '}': d -= 1
                        elif src[k] in '\'"`':   # skip nested strings roughly
                            q = src[k]; k += 1
                            while k < n and src[k] != q:
                                k += 2 if src[k] == '\\' else 1
                        k += 1
                    parts.append(''.join(buf)); buf = []
                    parts.append(('expr', src[j + 2:k - 1]))
                    j = k; continue
                buf.append(src[j]); j += 1
            parts.append(''.join(buf))
            yield ('t', parts); i = j + 1; prev = 'v'; continue
        if c == '/' and prev not in ('v', ')', ']'):
            # regular expression literal
            j, cls = i + 1, False
            while j < n:
                if src[j] == '\\': j += 2; continue
                if src[j] == '[': cls = True
                elif src[j] == ']': cls = False
                elif src[j] == '/' and not cls: break
                elif src[j] == '\n': break
                j += 1
            i = j + 1
            while i < n and src[i].isalpha(): i += 1
            prev = 'v'; continue
        if c.isalnum() or c in '_$':
            j = i
            while j < n and (src[j].isalnum() or src[j] in '_$'): j += 1
            w = src[i:j]
            prev = '' if w in ('return', 'typeof', 'case', 'in', 'of', 'else', 'do', 'throw', 'new', 'void', 'delete', 'instanceof', 'yield', 'await') else 'v'
            i = j; continue
        prev = c if c in ')]' else ''
        i += 1


CODEY = re.compile(r'^(?:[a-z0-9_\-./:#\[\]=>*+@$]+|[A-Z0-9_]+|#[0-9a-fA-F]{3,8}|https?://\S+|[\w-]+\.(?:js|json|css|html|md|csv|xlsx|txt|zip|py|svg|png))$')
CSSY = re.compile(r'^[\w\s.#:>\-+~*,()\[\]="\'^$|]+$')


TOKEN = re.compile(r'[a-z*][\w-]*(?:[.#][\w-]+)*(?::[\w-]+)?(?:\[[^\]]{1,40}\])?')


def ui_like(s):
    s = s.strip()
    if len(s) < 2 or not re.search(r'[A-Za-zÀ-ÿ]{2}', s): return False
    if CODEY.match(s) or re.fullmatch(r'&#?\w+;', s): return False
    if re.match(r'^[a-z]+(?:[A-Z][a-z0-9]+)+$', s): return False            # camelCase
    if re.match(r'^(?:var|calc|rgba?|hsla?|url)\(', s): return False
    if re.match(r'^[\d.\s]+(px|em|rem|%|vh|vw|fr|s|ms)\b', s): return False
    if re.match(r'^(?:btn|pill|card|grid|row|col|small|muted|note|chips|mono|tablewrap|kpi|g\d)(?:\s+[\w-]+)*$', s): return False
    if re.match(r'^[a-z][\w-]*(?:\s+[a-z][\w-]*)*$', s) and ' ' in s and all('-' in w or w in ('sm', 'ghost', 'danger', 'on', 'off', 'good', 'warn', 'bad', 'wide', 'compact', 'cb', 'num') for w in s.split()): return False
    if s.startswith(('M', 'L')) and re.match(r'^[ML][\d\s.,MLHVCZhvlmcz-]+$', s): return False   # svg path
    # a CSS selector: every whitespace-separated part is a lower-case tag carrying a class, id,
    # attribute or pseudo, and at least one of them does (nav a.tab.navout). Checked part by part,
    # because one regex over the whole string backtracks exponentially on long sentences.
    parts = s.split()
    if len(parts) <= 4 and any(re.search(r'[.#\[:]', x) for x in parts) \
       and all(x in '>~+' or TOKEN.fullmatch(x) for x in parts): return False
    if re.fullmatch(r'\.{0,2}/?[\w.-]+(?:/[\w.-]+)*\.[a-z]{2,4}', s): return False    # a file path
    if re.match(r'^(application|text|image)/', s): return False
    if re.match(r'^(SELECT|INSERT|function|return|const|let)\b', s): return False
    if re.match(r'^\w+=', s): return False
    if '\n' in s and s.count('\n') > 6: return False   # prompts and long blocks (sent to AI, not shown)
    return True


def template_key(parts):
    out, k = [], 0
    for p in parts:
        if isinstance(p, tuple):
            out.append('{%d}' % k); k += 1
        else:
            out.append(p)
    return ''.join(out)


def collect():
    found = {}
    for d in SRC:
        for f in sorted(os.listdir(d)):
            if not f.endswith('.js') or f in SKIP_FILES or d.endswith('js') and f.startswith('i18n'):
                continue
            src = open(os.path.join(d, f), encoding='utf-8').read()
            src = re.sub(r"'\s*\+\s*'", '', src); src = re.sub(r'"\s*\+\s*"', '', src)   # 'a ' + 'b' → 'a b'
            rel = os.path.relpath(os.path.join(d, f), ROOT)
            def walk(code, depth=0):
                for kind, v in tokens(code):
                    if kind == 's':
                        s = v.strip()
                        if ui_like(s): found.setdefault(s, set()).add(rel)
                        continue
                    key = template_key(v).strip()
                    lit = re.sub(r'\{\d+\}', ' ', key)
                    if ui_like(lit) and re.search(r'[A-Za-z]{3}', lit) and not re.fullmatch(r'\{0\}', key):
                        found.setdefault(key, set()).add(rel)
                    if depth < 3:                       # strings inside ${…}, e.g. tr('…') in a template
                        for part in v:
                            if isinstance(part, tuple): walk(part[1], depth + 1)
            walk(src)
    # index.html, and the pages in help/ that open in their own window. Those pages carry their
    # interface in an inline module, so the markup AND the script are read (1.5.6): without this the
    # Step by step and User guide windows would be outside the translation gate entirely.
    pages = ['index.html']
    helpdir = os.path.join(ROOT, 'help')
    if os.path.isdir(helpdir):
        pages += [os.path.join('help', f) for f in sorted(os.listdir(helpdir)) if f.endswith('.html')]
    for rel in pages:
        raw = open(os.path.join(ROOT, rel), encoding='utf-8').read()
        for m in re.finditer(r'<script[^>]*>([\s\S]*?)</script>', raw):
            code = re.sub(r"'\s*\+\s*'", '', m.group(1))
            code = re.sub(r'"\s*\+\s*"', '', code)
            for kind, v in tokens(code):
                if kind == 's':
                    t = v.strip()
                    if ui_like(t): found.setdefault(t, set()).add(rel)
                else:
                    key = template_key(v).strip()
                    lit = re.sub(r'\{\d+\}', ' ', key)
                    if ui_like(lit) and re.search(r'[A-Za-z]{3}', lit) and not re.fullmatch(r'\{0\}', key):
                        found.setdefault(key, set()).add(rel)
        html = re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>|<!--[\s\S]*?-->', ' ', raw)
        for m in re.finditer(r'>([^<>]+)<', html):
            t = htmlmod.unescape(re.sub(r'\s+', ' ', m.group(1)).strip())
            if ui_like(t): found.setdefault(t, set()).add(rel)
        for m in re.finditer(r'(?:title|placeholder|aria-label)="([^"]+)"', html):
            if ui_like(m.group(1)): found.setdefault(htmlmod.unescape(m.group(1).strip()), set()).add(rel)
    return found


CONTENT_ONLY = {'js/exportx.js'}            # text of exported workbooks and files: kept in English


def interface_strings():
    """collect() narrowed to text that can appear on a screen (HTML split, exports, prompts and formats removed)."""
    out = {}
    def add(x, src):
        x = re.sub(r'\s+', ' ', x).strip()
        if not ui_like(x): return
        if re.search(r'\{"|^<!doctype|^CVSS:|^[A-Za-z_]+!\$?[A-Z{]|^#{1,3} |^\| |^\{\d+\}$|^[\W\d_{}]+$|^"', x, re.I): return
        out.setdefault(x, set()).update(src)
    for k, v in collect().items():
        if v <= CONTENT_ONLY: continue
        if re.search(r'</?[a-z][^>]*>', k):
            for seg in re.split(r'<[^>]+>', k): add(seg, v)
        else: add(k, v)
    return out


def load_catalogue(code):
    p = os.path.join(ROOT, 'js', 'i18n', code + '.js')
    src = open(p, encoding='utf-8').read()
    src = src[src.index('export default'):]
    body = src[src.index('{'): src.rindex('}') + 1]
    try:
        return json.loads(body)
    except Exception:
        # tolerate a trailing comma
        return json.loads(re.sub(r',\s*}\s*$', '}', body))


# The runtime's own number regex (js/i18n.js NUM). The tool has to normalise numbers exactly as the
# application does, or a catalogue entry that works on screen is reported missing: "1.5.6" is ONE
# number to the runtime, while a plainer \d+(?:[.,]\d+)? reads it as two and looked for "#.#".
NUM_JS = re.compile(r'[+\-\u2212]?\d[\d\u202f\u00a0,. ]*\d|\d')


def numkey(s):
    return NUM_JS.sub('#', s)


def pattern_hit(cat, s):
    """The catalogue entry whose {0} placeholders match this string, if any, with what each
    placeholder swallowed. Returns (key, [captured, ...]) or None."""
    for k in cat:
        if '{' in k:
            rx = '^' + re.sub(r'\\\{\d+\\\}', '(.+?)', re.escape(k)).replace('\\#', r'\d[\d,. ]*') + '$'
            mm = re.match(rx, s, re.S)
            if mm: return k, list(mm.groups())
    return None


def english_prose(x):
    """Does this look like untranslated English rather than a name, a number or an identifier?
    Two or more ordinary lower-case words is the test; "Add {0}" matching "Add the provider" leaves
    "the provider", which is prose and so is NOT a translation of anything."""
    words = re.findall(r"[A-Za-z][a-z']{2,}", x or '')
    return len(words) >= 2


def covered(cat, s):
    if s in cat: return True
    if re.search(r'\{\d+\}', s): return False      # a template needs its own entry (another pattern would mask it)
    if numkey(s) in cat: return True
    hit = pattern_hit(cat, s)
    if not hit: return False
    # 1.5.5 - a loose pattern match is only a translation when the part it swallowed is not itself
    # English prose. "Add {0}" once counted "Add a provider of your own" as covered, and the screen
    # then showed "Ajouter a provider of your own": reported 100 %, visibly half translated.
    return not any(english_prose(c) for c in hit[1])


def suspect(cat, s):
    """Covered only because a {0} pattern matched, with prose inside the placeholder."""
    if s in cat or numkey(s) in cat: return None
    hit = pattern_hit(cat, s)
    if not hit: return None
    prose = [c for c in hit[1] if english_prose(c)]
    return (hit[0], prose) if prose else None


def main(argv):
    found = interface_strings()
    if '--dump' in argv:
        out = argv[argv.index('--dump') + 1]
        json.dump({k: sorted(v) for k, v in sorted(found.items())}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(f'{len(found)} interface strings written to {out}'); return
    codes = [a for a in argv if not a.startswith('-')] or [f[:-3] for f in os.listdir(os.path.join(ROOT, 'js', 'i18n')) if f.endswith('.js')]
    for code in codes:
        cat = load_catalogue(code)
        miss = sorted(s for s in found if not covered(cat, s))
        print(f'{code}: {len(cat)} catalogue entries · {len(found) - len(miss)}/{len(found)} interface strings covered ({100 * (len(found) - len(miss)) / max(1, len(found)):.1f} %)')
        if '--missing' in argv:
            for s in miss: print('  ', json.dumps(s, ensure_ascii=False), '·', ', '.join(sorted(found[s]))[:80])


if __name__ == '__main__':
    main(sys.argv[1:])
