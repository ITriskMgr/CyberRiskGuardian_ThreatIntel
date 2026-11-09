"""Open the EN and FR Word files with python-docx: unfilled placeholders, statement numbers, markers, refs."""
import sys, re, json, zipfile
import docx
def info(path):
    d = docx.Document(path)
    paras = [p.text for p in d.paragraphs]
    body = "\n".join(paras)
    tables = []
    for t in d.tables:
        for r in t.rows:
            tables.append([c.text for c in r.cells])
    alltext = body + "\n" + "\n".join("\t".join(r) for r in tables)
    nums = [m.group(1) for p in paras for m in [re.match(r"^(\d+\.\d+)\t", p)] if m]
    xml = zipfile.ZipFile(path).read("word/document.xml").decode()
    marks = re.findall(r'w:name="(_crgs_[^"]+)"', xml)
    trace = {}
    for r in tables:
        m = re.match(r"^(\d+\.\d+) · ", r[0]) if r else None
        if m and len(r) >= 4:
            trace[m.group(1)] = r[3]
    return {"curly": sorted(set(re.findall(r"\{[A-Za-z_]+\}", alltext))), "decision_ph": len(re.findall(r"\[(?:DECISION|DÉCISION)", alltext)),
            "other_ph": sorted(set(re.findall(r"\[([A-ZÉ ]{4,}):", alltext))), "nums": nums, "marks": len(marks), "trace": trace,
            "identifier": d.core_properties.identifier, "paras": len(paras)}
en, fr = info(sys.argv[1]), info(sys.argv[2])
out = {"en": {k: v for k, v in en.items() if k != "trace"}, "fr": {k: v for k, v in fr.items() if k != "trace"},
       "same_numbers": en["nums"] == fr["nums"] and len(en["nums"]) > 0, "same_bookmark_count": en["marks"] == fr["marks"],
       "same_refs": en["trace"] == fr["trace"] and len(en["trace"]) > 0,
       "refs_diff": [k for k in set(en["trace"]) | set(fr["trace"]) if en["trace"].get(k) != fr["trace"].get(k)][:10]}
print(json.dumps(out, ensure_ascii=False))
