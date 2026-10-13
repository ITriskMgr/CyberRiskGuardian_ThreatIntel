#!/usr/bin/env python3
"""history_check.py — screens, help and guides describe the application as it is, not its history.

Every string the person can read (code outside comments, the help pages, the user guides, README and
INSTALL) is searched for a mention of an earlier release ("1.5.7", "Until 1.5.5", "since release …",
"proof of concept"). CHANGELOG.md keeps the history and is not searched. Exit 1 when one is found.
"""
import pathlib, re, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from version_check import strip_comments

ROOT = pathlib.Path(__file__).resolve().parent.parent
REL = re.compile(r"(?<![\w.\-/])v?1\.[0-5]\.(?:\d+|x)(?![\w.])|(?:[Ss]ince|[Uu]ntil|[Bb]efore|[Aa]fter|[Ff]rom|[Rr]elease|[Vv]ersion|[Dd]epuis|[Aa]vant|[Aa]près|[Jj]usqu'(?:à|en)|[Vv]ersion) v?1\.[0-5]\b")
WORDS = re.compile(r"proof[ -]of[ -]concept|preuve de concept|[Uu]ntil 1\.\d|[Jj]usqu'(?:à|en) 1\.\d|this release added|previous release|earlier release|versions? antérieure", re.I)
# Contexts where a 1.x number is not an application release: standards, CVSS, OCSF, CRGO tags, TLP…
ALLOW = re.compile(r"CVSS|OCSF|TLP|STIX|CSF|ISO|NIST|SP 800|ATT&CK|CRGO|ontology|ontologie|Ontology|crg-workspace/1|schema|v1\.|SemVer|1\.0\.0|Loi|GDPR|RGPD|Python|python|Node|TLS|HTTP|SVG|UTF|section|art\.|s\. |§", re.I)


def lines_of(path):
    text = path.read_text(encoding="utf-8")
    if path.suffix == ".js":
        text = strip_comments(text)
    if path.suffix == ".html":
        text = re.sub(r"<!--[\s\S]*?-->", "", text)
        text = strip_comments(text)
    return text.split("\n")


def main():
    # migrate.js journals the data versions of the person's own records; that history is data, not chrome.
    files = [p for p in (ROOT / "js").rglob("*.js") if "/data/" not in p.as_posix() and "/i18n/" not in p.as_posix() and p.name != "migrate.js"]
    files += list((ROOT / "help").glob("*.html")) + [ROOT / "index.html"]
    files += [ROOT / f for f in ("USER-GUIDE.md", "USER-GUIDE.fr.md", "README.md", "INSTALL.md")]
    bad = []
    for f in files:
        if not f.exists():
            continue
        for i, line in enumerate(lines_of(f), 1):
            if WORDS.search(line):
                bad.append(f"{f.relative_to(ROOT)}:{i}: {line.strip()[:140]}")
                continue
            for m in REL.finditer(line):
                ctx = line[max(0, m.start() - 40): m.end() + 25]
                if ALLOW.search(ctx):
                    continue
                bad.append(f"{f.relative_to(ROOT)}:{i}: …{ctx.strip()}…")
                break
    if bad:
        print(f"history_check: FAIL — {len(bad)} mention(s) of earlier releases")
        print("\n".join(bad[:400]))
        return 1
    print("history_check: no mention of earlier releases on screens, help or guides")
    return 0


if __name__ == "__main__":
    sys.exit(main())
