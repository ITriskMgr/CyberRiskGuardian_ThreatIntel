#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""test_engine_cross.py — the three engines agree: desktop JavaScript (crg.js), desktop Python (engine/crg_calc.py) and the
Threat Live-feed plugin engine (the reference, X-2). Runs with the helper guard tests (unittest discover, run_all.sh, CI).

1. Conformance: the plugin's shared test_cross_engine.py (X-1 CVSS precedence and Base-only scope, X-2 zero tolerated risk
   and input rules, the MediBec / CanaRetail regressions, the book worked example) is run against both desktop engines.
2. Fidelity: seeded random scenario sets, the campaign's edge and boundary sets and the bundled cases go through the
   three engines; estimated, tolerated, residual and CVSS agree within 0.5 unit (ratios within 0.005), the verdicts are
   identical, and a disagreeing stored score is flagged by every engine.
3. Sensitivity (NV-045): desktop JS and Python agree case by case; the central case equals the plain calculation.

Where the reference engine is: CRG_TI_SCRIPTS (a scripts/ folder holding crg_calc.py and test_cross_engine.py), else this
repository's plugins/cyberriskguardian-threatintel/.../scripts, else a sibling worktree. Re-point with the variable.
"""
import copy, glob, importlib.util, json, os, random, subprocess, sys, unittest

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
APP = os.path.abspath(os.environ.get("CRG_APP_DIR") or os.path.join(HERE, "..", "app"))
sys.path.insert(0, HERE)
import js_engine_shim as JS   # noqa: E402

VEC = "CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H"


def ti_scripts():
    cands = [os.environ.get("CRG_TI_SCRIPTS"),
             os.path.join(ROOT, "plugins", "cyberriskguardian-threatintel", "skills", "cyber-risk-assessment", "scripts"),
             os.path.join(os.path.dirname(ROOT), "plugins-ti", "plugins", "cyberriskguardian-threatintel", "skills", "cyber-risk-assessment", "scripts")]
    for c in cands:
        if c and os.path.isfile(os.path.join(c, "crg_calc.py")):
            return c
    return None


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


PY = load(os.path.join(APP, "engine", "crg_calc.py"), "desktop_py_engine")
TI_DIR = ti_scripts()
TI = load(os.path.join(TI_DIR, "crg_calc.py"), "ti_engine") if TI_DIR else None
# The reference rules are those of Threat Live-feed 1.7.2 (X-1 / X-2). An older copy (1.7.1 has no NOT_APPLICABLE) is not
# a reference for these checks: it is left out and the conformance test is skipped with a notice, so that a branch built
# before the plugin patch is merged stays honest without going red for the plugin's own findings.
TI_OK = bool(TI) and hasattr(TI, "NOT_APPLICABLE")
ENGINES = {"desktop_js": JS, "desktop_py": PY}
if TI_OK:
    ENGINES["ti_py"] = TI

METRICS = dict(AV="NALP", AC="LH", AT="NP", PR="NLH", UI="NPA", VC="HLN", VI="HLN", VA="HLN", SC="HLN", SI="HLN", SA="HLN")


def rand_vector(rng):
    return "CVSS:4.0/" + "/".join(f"{k}:{rng.choice(v)}" for k, v in METRICS.items())


def mk(sid, p, vec, rp, ri, score=None):
    s = {"id": sid, "name": "Scenario " + sid, "cvss": vec, "red_p": rp, "red_i": ri,
         "params": {k: {"v": v, "conf": "Low"} for k, v in p.items()}}
    if score is not None:
        s["cvss_score"] = score
    return s


def random_set(seed, n, appetite):
    rng = random.Random(seed)
    r2 = lambda x: round(x, 2)
    scen = []
    for i in range(n):
        de = r2(rng.uniform(0, 1)); dm = r2(rng.uniform(de, 1))
        p = dict(PbA=r2(rng.uniform(0.05, 1)), Pbx=r2(rng.uniform(0.05, 1)), De=de, Dm=dm, Th=r2(rng.uniform(0.05, 1)), Mu=r2(rng.uniform(0, 1)))
        scen.append(mk(f"R{i + 1}", p, rand_vector(rng), r2(rng.uniform(0, 0.9)), r2(rng.uniform(0, 0.9))))
    return {"APPETITE": appetite, "FACTOR": 1000, "SCEN": scen}


def edge_set():
    V0 = "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N"
    V10 = "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H"
    one = dict(PbA=1, Pbx=1, De=1, Dm=1, Th=1, Mu=1)
    mid = dict(PbA=0.7, Pbx=0.6, De=0.6, Dm=0.8, Th=0.5, Mu=0.65)
    E = [("E01", one, V10, 1, 1, None), ("E02", one, V10, 0, 0, None), ("E03_PbA0", dict(mid, PbA=0), VEC, 0.5, 0.5, None),
         ("E04_Pbx0", dict(mid, Pbx=0), VEC, 0.5, 0.5, None), ("E05_mu0", dict(mid, Mu=0), VEC, 0.5, 0.5, None),
         ("E06_cvss0", mid, V0, 0.5, 0.5, None), ("E07", dict(mid, Th=1), VEC, 0.65, 0.7, None), ("E08", dict(mid, Th=0.01), V10, 0.65, 0.7, None),
         ("E09_dmg0", dict(mid, De=0, Dm=0), VEC, 0, 0, None), ("E10", mid, VEC, 1, 0, None), ("E11", mid, VEC, 0, 1, None),
         ("E12", dict(mid, De=0.7, Dm=0.7), VEC, 0.2, 0.3, None), ("E13_book", mid, VEC, 0.65, 0.70, None),
         ("E14_stored_disagrees", mid, VEC, 0.65, 0.70, 9.9), ("E15_stored_agrees", mid, VEC, 0.65, 0.70, 9.3)]
    return {"APPETITE": 0.35, "FACTOR": 1000, "SCEN": [mk(*e) for e in E]}


def boundary_set():
    V = "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"
    base = dict(PbA=0.7, Pbx=0.6, Th=0.5, Mu=0.65)
    E = [("B1", 0.45, 0.45, 0, 0), ("B2", 0.55, 0.55, 0, 0), ("B3", 0.552, 0.552, 0, 0), ("B4", 0.448, 0.448, 0, 0),
         ("B5", 0.6, 0.8, 0.5, (1 - 0.55 / 0.7) / 0.5)]
    return {"APPETITE": 0.5, "FACTOR": 1000, "SCEN": [mk(i, dict(base, De=de, Dm=dm), V, rp, ri) for i, de, dm, rp, ri in E]}


def cases():
    out = {"random_A035": random_set(35, 30, 0.35), "random_A050": random_set(50, 20, 0.50), "random_A010": random_set(10, 12, 0.10),
           "edge": edge_set(), "boundary": boundary_set()}
    mb = os.path.join(ROOT, "examples", "medibec", "source", "medibec30.json")
    if os.path.exists(mb):
        with open(mb, encoding="utf-8") as f:
            out["medibec30"] = json.load(f)
    return out


def run_engine(E, d):
    """Per scenario: the engine's result dict or {'error': …}; run() is used so warnings are collected as the CLI does."""
    out = {}
    for s in d["SCEN"]:
        try:
            r = E.calc(copy.deepcopy(s), d["APPETITE"], d["FACTOR"])
            r["cls"] = E.classify(r["ratio"])
            out[s["id"]] = r
        except Exception as e:                                   # noqa: BLE001
            out[s["id"]] = {"error": f"{type(e).__name__}: {e}"}
    return out


def same_num(a, b, tol):
    if a is None or b is None or (isinstance(a, float) and a != a) or (isinstance(b, float) and b != b):
        return (a is None or a != a) and (b is None or b != b)
    return abs(a - b) <= tol


class CrossEngine(unittest.TestCase):
    def test_reference_engine_found(self):
        self.assertIsNotNone(TI_DIR, "no Threat Live-feed engine found (set CRG_TI_SCRIPTS to its scripts/ folder)")
        if not TI_OK:
            self.skipTest(f"the Threat Live-feed engine at {TI_DIR} predates 1.7.2 (no NOT_APPLICABLE): desktop JS and Python are "
                          "compared with each other only; set CRG_TI_SCRIPTS to a 1.7.2 scripts/ folder for the full comparison")

    def test_shared_conformance_test(self):
        """The plugin's test_cross_engine.py, against both desktop engines (28 checks each in TI 1.7.2)."""
        if not TI_OK or not os.path.isfile(os.path.join(TI_DIR, "test_cross_engine.py")):
            self.skipTest("test_cross_engine.py not in the reference scripts folder (TI 1.7.2 or later)")
        p = subprocess.run([sys.executable, os.path.join(TI_DIR, "test_cross_engine.py"), "--only-extra", "--no-mcp",
                            "--engine", "desktop_js=" + os.path.join(HERE, "js_engine_shim.py"),
                            "--engine", "desktop_py=" + os.path.join(APP, "engine", "crg_calc.py")],
                           capture_output=True, text=True, timeout=600, cwd=TI_DIR)
        fails = [l for l in p.stdout.splitlines() if l.startswith("FAIL")]
        self.assertEqual(p.returncode, 0, "\n".join(fails) or p.stderr[-800:])
        self.assertGreaterEqual(p.stdout.count("PASS "), 50, "fewer checks than expected ran")

    def test_fidelity_across_engines(self):
        """Estimated, tolerated, residual, CVSS, verdict and flags agree across desktop JS, desktop Python and the reference."""
        mism = []
        for name, d in cases().items():
            res = {k: run_engine(E, d) for k, E in ENGINES.items()}
            ref = res["ti_py"] if "ti_py" in res else res["desktop_py"]
            for s in d["SCEN"]:
                sid = s["id"]
                a = ref[sid]
                for k, r in res.items():
                    b = r[sid]
                    if ("error" in a) != ("error" in b):
                        mism.append(f"{name}/{sid} {k}: {a.get('error', 'ok')} vs {b.get('error', 'ok')}"); continue
                    if "error" in a:
                        continue
                    for f, tol in (("est", 0.5), ("tol", 0.5), ("res", 0.5), ("cvss", 0.05), ("ratio", 0.005), ("pre_ratio", 0.005)):
                        if not same_num(a[f], b[f], tol):
                            mism.append(f"{name}/{sid} {k}.{f}: {a[f]} vs {b[f]}")
                    if a["cls"] != b["cls"]:
                        mism.append(f"{name}/{sid} {k}.cls: {a['cls']} vs {b['cls']}")
                    fa = any("disagree" in w for w in a.get("warnings", [])); fb = any("disagree" in w for w in b.get("warnings", []))
                    if fa != fb:
                        mism.append(f"{name}/{sid} {k}: stored-score flag {fa} vs {fb}")
        self.assertEqual(mism, [], "\n".join(mism[:40]))

    def test_reference_totals(self):
        """MediBec 84,305 / 41,023 and CanaRetail 27,526 / 16,049 in both desktop engines (never move)."""
        mb = os.path.join(ROOT, "examples", "medibec", "source", "medibec30.json")
        self.assertTrue(os.path.exists(mb), mb)
        with open(mb, encoding="utf-8") as f:
            d = json.load(f)
        for k, E in ENGINES.items():
            t = E.run(d)["totals"]
            self.assertEqual((round(t["est"]), round(t["res"])), (84305, 41023), k)
        cr = glob.glob(os.path.join(ROOT, "plugins", "*", "skills", "*", "scripts", "fixtures", "canaretail10.json")) + \
             glob.glob(os.path.join(TI_DIR or "", "fixtures", "canaretail10.json"))
        if cr:
            d = json.load(open(cr[0], encoding="utf-8"))
            for k, E in ENGINES.items():
                t = E.run(d)["totals"]
                self.assertEqual((round(t["est"]), round(t["res"])), (27526, 16049), k)

    def test_vector_wins_everywhere(self):
        """Book example with a stored 9.9 beside the AV:L vector: 9.3 and Re 3,554.46 in every engine, plus a flag."""
        s = mk("G16", dict(PbA=0.7, Pbx=0.6, De=0.6, Dm=0.8, Th=0.5, Mu=0.65), VEC, 0.65, 0.70, 9.9)
        for k, E in ENGINES.items():
            r = E.calc(copy.deepcopy(s), 0.35, 1000)
            self.assertEqual(r["cvss"], 9.3, k)
            self.assertAlmostEqual(r["est"], 3554.46, 2, k)
            self.assertTrue(any("disagree" in w for w in r["warnings"]), k)

    def test_zero_tolerance_not_applicable(self):
        for k, E in ENGINES.items():
            for zero in ({"PbA": 0}, {"Pbx": 0}, {"Mu": 0}):
                p = dict(dict(PbA=0.7, Pbx=0.6, De=0.6, Dm=0.8, Th=0.5, Mu=0.65), **zero)
                r = E.calc(mk("Z", p, VEC, 0.5, 0.5), 0.35, 1000)
                self.assertEqual(r["tol"], 0, k)
                self.assertEqual(E.classify(r["ratio"]), "Not applicable (tolerated risk 0)", k)
            r = E.calc(mk("Z0", dict(PbA=0.7, Pbx=0.6, De=0.6, Dm=0.8, Th=0.5, Mu=0.65), "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N", 0.5, 0.5), 0.35, 1000)
            self.assertEqual(E.classify(r["ratio"]), "Not applicable (tolerated risk 0)", k)

    def test_base_metrics_only(self):
        for k, E in ENGINES.items():
            for tail, needle in (("/E:U", "Pb(psi,A)"), ("/MAV:L", "CVSS-B only"), ("/AU:Y", "Supplemental")):
                with self.assertRaises(ValueError, msg=k + tail) as cm:
                    E.calc(mk("T", dict(PbA=0.7, Pbx=0.6, De=0.6, Dm=0.8, Th=0.5, Mu=0.65), VEC + tail, 0.65, 0.7), 0.35, 1000)
                msg = str(cm.exception).replace("ψ", "psi")
                self.assertIn(needle, msg, k + tail)

    def test_input_rules(self):
        """One rule everywhere: numeric strings and booleans rejected, missing reductions = 0."""
        base = dict(PbA=0.7, Pbx=0.6, De=0.6, Dm=0.8, Th=0.5, Mu=0.65)
        for k, E in ENGINES.items():
            for bad in (dict(base, PbA="0.7"), dict(base, Mu=True)):
                with self.assertRaises(ValueError, msg=k):
                    E.calc(mk("S", bad, VEC, 0.5, 0.5), 0.35, 1000)
            s = mk("M", base, VEC, 0, 0); del s["red_p"]; del s["red_i"]
            r = E.calc(s, 0.35, 1000)
            self.assertAlmostEqual(r["res"], r["est"], 6, k)

    def test_sensitivity_js_equals_python(self):
        """NV-045: the central case is the plain calculation; shifted cases agree between the desktop engines; a value
        already outside the clamp range is never pulled back (the higher case is never milder than the central one)."""
        for s, app in ((mk("G16", dict(PbA=0.7, Pbx=0.6, De=0.6, Dm=0.8, Th=0.5, Mu=0.65), VEC, 0.65, 0.70), 0.35),
                       (mk("P1", dict(PbA=1, Pbx=1, De=0.6, Dm=0.8, Th=0.5, Mu=0.65), VEC, 0, 0), 0.35),
                       (mk("P2", dict(PbA=0.02, Pbx=0.6, De=0.6, Dm=0.8, Th=0.03, Mu=0.65), VEC, 0, 0), 0.35)):
            a = JS.sensitivity(copy.deepcopy(s), 0.10, app, 1000); b = PY.sensitivity(copy.deepcopy(s), 0.10, app, 1000)
            c = PY.calc(copy.deepcopy(s), app, 1000)
            for case in ("lower", "central", "higher"):
                for f in ("estimated", "residual"):
                    self.assertAlmostEqual(a[case][f], b[case][f], 4, f"{s['id']} {case} {f}")
                self.assertEqual(a[case]["classification"], b[case]["classification"], s["id"])
            self.assertAlmostEqual(b["central"]["estimated"], c["est"], 6, "central = plain calculation " + s["id"])
            self.assertAlmostEqual(b["central"]["residual"], c["res"], 6, s["id"])
            self.assertGreaterEqual(b["higher"]["residual"], b["central"]["residual"] - 1e-9, "higher never milder " + s["id"])
            self.assertLessEqual(b["lower"]["residual"], b["central"]["residual"] + 1e-9, "lower never harsher " + s["id"])


if __name__ == "__main__":
    unittest.main()
