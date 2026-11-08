#!/usr/bin/env python3
"""ai_policy_check.py — one routing policy, in the page and in the helper (Desktop 1.9.2, NV-019).

js/ai.js FEATURES lists the AI features the page offers routes for; serve.py AI_DEFAULT_POLICY["tasks"] is the map
the helper enforces before it sends anything. In 1.9.1 the helper's map still carried two legacy tasks ("chat",
"analyst") the page no longer offered, so a request named after them reached a remote provider while every
feature of Settings → AI was set to local. This gate fails the build when the two sets differ, or when a default
mode differs between the two.

    python3 tools/ai_policy_check.py
"""
import ast
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def js_features():
    src = (ROOT / "js" / "ai.js").read_text(encoding="utf-8")
    m = re.search(r"export const FEATURES = \[(.*?)\n\];", src, re.S)
    if not m:
        raise SystemExit("ai_policy_check: FEATURES not found in js/ai.js")
    out = {}
    for row in re.finditer(r"^\s*\['([a-z0-9_]+)',\s*'(?:[^'\\]|\\.)*',\s*'(?:[^'\\]|\\.)*',\s*'(?:[^'\\]|\\.)*',\s*'([a-z]+)'\]", m.group(1), re.M):
        out[row.group(1)] = row.group(2)
    return out


def py_tasks():
    src = (ROOT / "serve.py").read_text(encoding="utf-8")
    tree = ast.parse(src)
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "AI_DEFAULT_POLICY" for t in node.targets):
            val = ast.literal_eval(node.value)
            return val["tasks"]
    raise SystemExit("ai_policy_check: AI_DEFAULT_POLICY not found in serve.py")


def main():
    js, py = js_features(), py_tasks()
    bad = []
    for k in sorted(set(py) - set(js)):
        bad.append(f"  helper has a task the page does not offer: {k!r} (serve.py AI_DEFAULT_POLICY) — remove it, or add the feature to js/ai.js FEATURES")
    for k in sorted(set(js) - set(py)):
        bad.append(f"  page offers a feature the helper does not know: {k!r} (js/ai.js FEATURES) — the helper would treat it as local; add it to AI_DEFAULT_POLICY")
    for k in sorted(set(js) & set(py)):
        if js[k] != py[k]:
            bad.append(f"  default route differs for {k!r}: js/ai.js {js[k]!r}, serve.py {py[k]!r}")
    print(f"  features in js/ai.js: {len(js)} · tasks in serve.py: {len(py)}")
    if bad:
        print("ai_policy_check: FAIL")
        print("\n".join(bad))
        return 1
    print("ai_policy_check: the page and the helper agree on every feature and its default route")
    return 0


if __name__ == "__main__":
    sys.exit(main())
