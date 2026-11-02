#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""Tests for ssvc.py - the SSVC trees are complete, deterministic and never a likelihood.

Run: python3 test_ssvc.py      (set SSVC_REPO=<CERTCC/SSVC clone> to also diff every row against the CSVs)
"""
import csv, itertools, json, os, sys, tempfile, unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ssvc as S


class Trees(unittest.TestCase):
    def test_every_combination_has_one_outcome(self):
        for tree, t in S.TREES.items():
            for combo in itertools.product(*(S.VALUES[k] for k in t["inputs"])):
                out = S.evaluate(tree, dict(zip(t["inputs"], combo)))
                self.assertIn(out["outcome"], t["outcomes"], (tree, combo))

    def test_table_sizes(self):
        self.assertEqual((len(S.CISA_ROWS), len(S.DEPLOYER_ROWS), len(S.SUPPLIER_ROWS)), (36, 72, 36))

    def test_known_cells(self):
        e = S.evaluate
        self.assertEqual(e("deployer", dict(exploitation="active", automatable="yes", technical_impact="total",
                                            mission_prevalence="essential", public_wellbeing="minimal"))["outcome"], "act")
        self.assertEqual(e("deployer", dict(exploitation="none", automatable="no", technical_impact="partial",
                                            mission_prevalence="minimal", public_wellbeing="minimal"))["outcome"], "track")
        self.assertEqual(e("deployer-cert", dict(exploitation="active", exposure="open", automatable="yes",
                                                 safety_impact="negligible", mission_impact="mef failure"))["outcome"], "out-of-cycle")
        self.assertEqual(e("supplier", dict(exploitation="public poc", automatable="yes", value_density="diffuse",
                                            technical_impact="total", safety_impact="marginal"))["outcome"], "immediate")

    def test_invalid_input(self):
        with self.assertRaises(ValueError):
            S.evaluate("deployer", {"exploitation": "maybe"})

    def test_never_a_likelihood(self):
        out = S.evaluate("deployer", dict(exploitation="active", automatable="yes", technical_impact="total",
                                          mission_prevalence="essential", public_wellbeing="irreversible"))
        self.assertFalse(any(isinstance(v, float) for v in out.values()))


class Suggest(unittest.TestCase):
    SNAP = {"retrieved": "2026-11-01", "thresholds": {"epss_rung4_min": 0.5, "epss_percentile_rung4_min": 0.9},
            "kev": {"cves": {"CVE-2026-0001": {"added": "2026-10-01"}}},
            "epss": {"scores": {"CVE-2026-0001": [0.9, 0.99], "CVE-2026-0002": [0.6, 0.95], "CVE-2026-0003": [0.01, 0.3]}}}

    def test_ladder(self):
        f = lambda c, poc=0: S.suggest_exploitation(c, self.SNAP, poc)["suggested"]
        self.assertEqual(f("CVE-2026-0001"), "active")
        self.assertEqual(f("CVE-2026-0002"), "none", "a high EPSS alone is not a public PoC (review L4)")
        self.assertEqual(f("CVE-2026-0003"), "none")
        self.assertEqual(f("CVE-2026-0003", 1), "public poc")
        self.assertEqual(f("CVE-2026-0002", 1), "public poc")
        hi = S.suggest_exploitation("CVE-2026-0002", self.SNAP)
        self.assertTrue(hi["epss_high"])
        self.assertTrue(any("high exploitation probability (EPSS)" in b for b in hi["basis"]))
        self.assertFalse(any("PoC" in b or "proof of concept" in b for b in hi["basis"]))


@unittest.skipUnless(os.environ.get("SSVC_REPO"), "set SSVC_REPO to diff against the CERT/CC CSVs")
class AgainstSource(unittest.TestCase):
    def test_rows_match(self):
        base = os.path.join(os.environ["SSVC_REPO"], "data", "csv")
        for rows, path in [(S.CISA_ROWS, "cisa/cisa_coordinator_2_0_3.csv"),
                           (S.DEPLOYER_ROWS, "ssvc/deployer_patch_application_priority_1_0_0.csv"),
                           (S.SUPPLIER_ROWS, "ssvc/supplier_patch_development_priority_1_0_0.csv"),
                           (S.HUMAN_IMPACT_ROWS, "ssvc/human_impact_1_0_0.csv"),
                           (S.UTILITY_ROWS, "ssvc/utility_1_0_0.csv"),
                           (S.PUBLIC_SAFETY_ROWS, "ssvc/public_safety_impact_1_0_0.csv")]:
            with open(os.path.join(base, path), encoding="utf-8") as fh:
                src = [tuple(r[1:]) for r in list(csv.reader(fh))[1:]]
            self.assertEqual([tuple(r) for r in rows], src, path)


if __name__ == "__main__":
    unittest.main(verbosity=1)
