#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""SSVC table cross-check: the plugin's ssvc.py against the desktop application's js/ssvc.js (NV-P14).

Both ship the same three trees (CISA deployer 2.0.3, CERT/CC deployer 1.0.0, CERT/CC supplier 1.0.0), copied row
for row from the CERT/CC SSVC repository. This script evaluates every leaf combination of every tree in the desktop
JavaScript (through node) and in Python, and fails when an outcome or a derived value differs, or when an invalid
input is accepted by one side only. Offline; needs node 18+.

    python3 scripts/ssvc_compare.py            # from the repository root
Exit 0 when the tables agree (492 leaves: 108 + 288 + 96), 1 otherwise.

Campaign origin: /campaign/wC/ssvc/compare.py (test campaign of 8 November 2026), kept here as a release check.
"""
import json, os, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(ROOT, "plugins", "cyberriskguardian-threatintel", "skills", "cyber-risk-assessment", "scripts")
APP_JS = os.path.join(ROOT, "desktop", "app", "js") + os.sep
sys.path.insert(0, SCRIPTS)
import ssvc  # noqa: E402

JS = r"""
// Evaluate desktop js/ssvc.js on every leaf combination of every tree; print one JSON document.
const APP = process.argv[2];
globalThis.localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };
class E {}; globalThis.Element ??= E; globalThis.DocumentFragment ??= class {}; globalThis.Node ??= E; globalThis.HTMLElement ??= E;
globalThis.document ??= { createElement: () => ({}), addEventListener() {}, documentElement: {} }; globalThis.window ??= globalThis; globalThis.navigator ??= {};
const M = await import(APP + 'ssvc.js');
const out = [];
for (const [tid, T] of Object.entries(M.TREES)) {
  const doms = T.inputs.map(k => M.POINTS[k].values.map(v => v[0]));
  const rec = (i, acc) => {
    if (i === doms.length) { const p = Object.fromEntries(T.inputs.map((k, j) => [k, acc[j]])); const r = M.evaluate(tid, p);
      out.push({ tree: tid, p, outcome: r.outcome, derived: r.derived }); return; }
    for (const v of doms[i]) rec(i + 1, [...acc, v]); };
  rec(0, []);
}
for (const bad of [{}, { exploitation: 'ACTIVE' }, { exploitation: 'active', automatable: 'yes', technical_impact: 'total', mission_prevalence: 'support', public_wellbeing: 'x' }])
  out.push({ tree: 'deployer', bad: true, p: bad, r: M.evaluate('deployer', bad) });
console.log(JSON.stringify(out));
"""


def main():
    if not os.path.exists(APP_JS + "ssvc.js"):
        print(f"SKIP: desktop ssvc.js not found at {APP_JS}ssvc.js")
        return 0
    with tempfile.TemporaryDirectory() as td:
        mjs = os.path.join(td, "leaves.mjs")
        open(mjs, "w", encoding="utf-8").write(JS)
        try:
            raw = subprocess.check_output(["node", "--no-warnings", mjs, APP_JS], text=True, stderr=subprocess.DEVNULL)
        except (OSError, subprocess.CalledProcessError) as e:
            print(f"FAIL: node could not evaluate desktop/app/js/ssvc.js ({e})")
            return 1
    js = json.loads(raw)
    leaves = [x for x in js if not x.get("bad")]
    counts, mis = {}, 0
    for x in leaves:
        r = ssvc.evaluate(x["tree"], x["p"])
        counts[x["tree"]] = counts.get(x["tree"], 0) + 1
        if x["outcome"] is None or r["outcome"] != x["outcome"] or (r.get("derived") or {}) != (x.get("derived") or {}):
            mis += 1
            print("MISMATCH", x["tree"], x["p"], "js:", x["outcome"], x.get("derived"), "py:", r["outcome"], r.get("derived"))
    for x in [y for y in js if y.get("bad")]:
        if x["r"].get("outcome") is not None:
            mis += 1
            print("MISMATCH: desktop accepted an invalid input", x["p"], x["r"])
        try:
            ssvc.evaluate("deployer", x["p"])
            mis += 1
            print("MISMATCH: ssvc.py accepted an invalid input", x["p"])
        except ValueError:
            pass
    expected = {"deployer": 108, "deployer-cert": 288, "supplier": 96}
    if counts != expected:
        mis += 1
        print(f"MISMATCH: leaf counts {counts} differ from {expected}")
    print(f"SSVC tables: leaves per tree {counts}; mismatches {mis}")
    return 1 if mis else 0


if __name__ == "__main__":
    sys.exit(main())
