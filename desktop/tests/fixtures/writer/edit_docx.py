"""Edit a Writer Word file as a person would: reword one statement, change a modal verb, delete one statement."""
import sys, re, docx
d = docx.Document(sys.argv[1])
stm = [p for p in d.paragraphs if re.match(r"^\d+\.\d+\t", p.text)]
done = []
def rep(p, a, b):
    for r in p.runs:
        if a in r.text:
            r.text = r.text.replace(a, b, 1); return True
    return False
for p in stm:
    if " information " in p.text and " must " not in p.text and rep(p, " information ", " information always "):
        done.append(("reworded", p.text[:60])); break
for p in stm:
    if " must " in p.text and "always" not in p.text and rep(p, " must ", " should "):
        done.append(("modality", p.text[:60])); break
victim = next(p for p in reversed(stm) if "always" not in p.text and "should" not in p.text)
done.append(("deleted", victim.text[:60]))
victim._p.getparent().remove(victim._p)
d.save(sys.argv[2])
print(done)
