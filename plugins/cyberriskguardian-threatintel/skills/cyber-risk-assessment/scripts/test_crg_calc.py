#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""Self-checks for crg_calc.py (offline, no CRGO needed).

    python3 test_crg_calc.py [--assessment examples/medibec/source/medibec30.json]

Checks: the MediBec regression (84,305 / 41,023); the book v2.51 ch06 worked example (AV:L, CVSS-B 9.3:
Re 3,554.46, Rt 1,777.23, mitigated 1,617.28, residual 1,937.18, ratio 1.09, cost-effectiveness 26.09,
sensitivity 0.69 / 1.53); the design thresholds 0.50 / 0.55; the ch06 budget example (10.95%, $5.475M,
9.4%, gap -$0.775M, implied appetite 0.42); input validation (decision 4) and the CVSS cross-check;
the product rule for combining reductions. Exit 1 on any failure.
"""
import argparse, copy, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import crg_calc as C

FAILS = []


def check(label, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + label + (f"  [{detail}]" if detail else ""))
    if not ok:
        FAILS.append(label)


def raises(fn, needle):
    try:
        fn()
    except C.CRGInputError as e:
        return any(needle in m for m in e.errors)
    return False


VEC_AVL = "CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H"
EX = {"id": "G16", "params": {"PbA": {"v": 0.70}, "Pbx": {"v": 0.60}, "De": {"v": 0.60}, "Dm": {"v": 0.80},
                              "Th": {"v": 0.50}, "Mu": {"v": 0.65}}, "red_p": 0.65, "red_i": 0.70, "cvss": VEC_AVL}


def main():
    ap = argparse.ArgumentParser()
    root = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", ".."))
    ap.add_argument("--assessment", default=os.path.join(root, "examples", "medibec", "source", "medibec30.json"))
    a = ap.parse_args()

    # 1. MediBec regression
    if os.path.exists(a.assessment):
        r = C.run(json.load(open(a.assessment, encoding="utf-8")))
        t = r["totals"]
        check("MediBec regression: estimated 84,305 / residual 41,023",
              round(t["est"]) == 84305 and round(t["res"]) == 41023, f"{t['est']:,.0f} / {t['res']:,.0f}")
        check("MediBec: no CVSS disagreement warning", not any("disagrees" in w for w in r["warnings"]), "; ".join(r["warnings"]))
        s2 = next(x for x in r["results"] if x["id"] == "S2"); s8 = next(x for x in r["results"] if x["id"] == "S8")
        check("MediBec S2 / S8 scored AV:L: 9.3 / 9.2", s2["cvss"] == 9.3 and s8["cvss"] == 9.2, f"{s2['cvss']} / {s8['cvss']}")
        from collections import Counter
        cnt = Counter(x["cls"] for x in r["results"])
        check("MediBec verdicts: 12 above / 11 approximately at / 7 below",
              (cnt["Above tolerance"], cnt["Approximately at tolerance"], cnt["Below tolerance"]) == (12, 11, 7), str(dict(cnt)))
    else:
        check("MediBec assessment file present", False, a.assessment)

    # 2. ch06 worked example (guide s.16 parameters, AV:L)
    check("CVSS v4.0 AV:L macro-document vector = 9.3", C.cvss4(VEC_AVL)[0] == 9.3)
    w = C.calc(EX, appetite=0.35, factor=1000, cost=62000)
    check("ch06: Re 3,554.46", round(w["est"], 2) == 3554.46, f"{w['est']:.2f}")
    check("ch06: Rt 1,777.23", round(w["tol"], 2) == 1777.23, f"{w['tol']:.2f}")
    check("ch06: pre-treatment ratio 2.00", round(w["pre_ratio"], 2) == 2.00)
    check("ch06: mitigated 1,617.28", round(w["mit"], 2) == 1617.28, f"{w['mit']:.2f}")
    check("ch06: residual 1,937.18", round(w["res"], 2) == 1937.18, f"{w['res']:.2f}")
    check("ch06: ratio 1.09, approximately at tolerance", round(w["ratio"], 2) == 1.09 and C.classify(w["ratio"]) == "Approximately at tolerance")
    check("ch06: cost-effectiveness 26.09 per $1,000", round(w["ce"], 2) == 26.09, f"{w['ce']:.2f}")
    lo = C.calc(C.shift(EX, -0.10), 0.35); hi = C.calc(C.shift(EX, 0.10), 0.35)
    check("ch06: sensitivity lower 0.69 / higher 1.53", (round(lo["ratio"], 2), round(hi["ratio"], 2)) == (0.69, 1.53),
          f"{lo['ratio']:.2f} / {hi['ratio']:.2f}")
    d = C.design_thresholds(0.60, 0.80, 0.35)
    check("ch06 design rule: ratio <= 1 needs rp x ri >= 0.50; below 0.90 needs > 0.55",
          round(d["at_or_below_tolerated"], 2) == 0.50 and round(d["below_band"], 2) == 0.55)
    alt = dict(copy.deepcopy(EX), red_p=0.75, red_i=0.80)
    check("ch06 stronger package (0.75 x 0.80): ratio 0.80", round(C.calc(alt, 0.35)["ratio"], 2) == 0.80)

    # 3. budget (point targets, ch06 example)
    check("budget point targets 12% / 7.8% / 4%", (C.budget_target(0.30), C.budget_target(0.50), C.budget_target(0.70)) == (0.12, 0.078, 0.04))
    check("budget clamped outside: 0.20 -> 12%, 0.80 -> 4%", (C.budget_target(0.20), C.budget_target(0.80)) == (0.12, 0.04))
    check("budget linear: 0.40 -> 9.9%, 0.60 -> 5.9%", (round(C.budget_target(0.40), 4), round(C.budget_target(0.60), 4)) == (0.099, 0.059))
    b = C.budget_position(0.35, 50e6, 3.0e6, 1.7e6)
    check("ch06 budget: target 10.95% = $5.475M", round(b["target_pct"], 4) == 0.1095 and round(b["target_amount"]) == 5475000)
    check("ch06 budget: planned 9.4%, gap -$0.775M, implied appetite 0.42",
          round(b["planned_pct"], 3) == 0.094 and round(b["gap_amount"]) == -775000 and round(b["implied_appetite"], 2) == 0.42,
          f"{b['planned_pct']:.3f} {b['gap_amount']:,.0f} {b['implied_appetite']:.3f}")
    check("implied appetite below 4% is outside the guideline (None)", C.implied_appetite(0.009) is None)

    # 4. validation (decision 4)
    def mut(**kw):
        s = copy.deepcopy(EX)
        for k, v in kw.items():
            if k in s["params"]:
                s["params"][k]["v"] = v
            else:
                s[k] = v
        return s
    check("rejects Pb(A) above 1", raises(lambda: C.calc(mut(PbA=1.2)), "Pb(A)"))
    check("rejects negative mu(E)", raises(lambda: C.calc(mut(Mu=-0.1)), "mu(E)"))
    check("rejects theta = 0", raises(lambda: C.calc(mut(Th=0)), "theta"))
    check("rejects dm < de", raises(lambda: C.calc(mut(De=0.8, Dm=0.6)), "must be at least de"))
    check("rejects a reduction above 1", raises(lambda: C.calc(mut(red_p=1.2)), "probability reduction"))
    check("rejects appetite 0 and 1", raises(lambda: C.calc(EX, appetite=0), "appetite") and raises(lambda: C.calc(EX, appetite=1), "appetite"))
    nov = copy.deepcopy(EX); del nov["cvss"]
    check("CVSS required: no vector and no score is an error", raises(lambda: C.calc(nov), "CVSS required"))
    blank = dict(copy.deepcopy(nov), cvss_score="")
    check("CVSS blank score is an error, never 0", raises(lambda: C.calc(blank), "CVSS required"))
    check("rejects CVSS score above 10", raises(lambda: C.calc(dict(copy.deepcopy(nov), cvss_score=11)), "0-10"))
    check("rejects an invalid vector", raises(lambda: C.calc(dict(copy.deepcopy(EX), cvss="CVSS:4.0/AV:Q")), "invalid CVSS"))
    bad = dict(copy.deepcopy(EX), cvss_score=9.4)
    rb = C.calc(bad, 0.35)
    check("stored score 9.4 disagreeing with the AV:L vector is flagged; the vector's 9.3 is used",
          rb["cvss"] == 9.3 and any("disagrees" in x for x in rb["warnings"]))
    check("run() reports every error in the file at once",
          raises(lambda: C.run({"APPETITE": 0.3, "SCEN": [mut(PbA=2), dict(mut(Th=0), id="G17")]}), "G17"))

    # 5. product rule
    check("product rule: 0.5 and 0.5 combine to 0.75", abs(C.combine_reductions([0.5, 0.5]) - 0.75) < 1e-12)
    check("product rule never exceeds 1 (twenty measures of 0.06)", C.combine_reductions([0.06] * 20) < 1)
    check("product rule rejects a coefficient above 1", raises(lambda: C.combine_reductions([0.5, 1.2]), "0-1"))

    print(f"\n{'ALL PASSED' if not FAILS else str(len(FAILS)) + ' FAILED'}")
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())
