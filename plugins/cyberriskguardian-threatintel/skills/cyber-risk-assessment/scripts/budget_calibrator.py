#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""Cybersecurity budget calibration against the best-practice point targets (step 18).

Examples:
    python3 budget_calibrator.py --it-budget 50000000 --appetite 0.35 --current 3.0e6 --portfolio 1.7e6
    python3 budget_calibrator.py --it-budget 100000000 --appetite 0.30 --spend 5.05e6 5.55e6 4.87e6

Rule (book v2.51 ch06 step 18 and ch17): the appetite-consistent cybersecurity budget is a point target
expressed as a share of the total IT budget including salaries - 12% for appetite 0.30 or below (risk
averse), 7.8% at 0.50 (risk neutral), 4% at 0.70 or above (risk seeking) - with linear interpolation in
between. Existing spending plus the recommended portfolio is compared with that target; the gap and the
implied appetite are reported. Closing the gap or revising the appetite is a Management decision required.
Offline and deterministic.
"""
import argparse, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from crg_calc import budget_target, implied_appetite, band_status, budget_position, target_status, POINT_TARGETS, CRGInputError

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--it-budget", type=float, required=True, help="Total IT budget including salaries")
ap.add_argument("--appetite", type=float, help="Approved or estimated risk appetite, strictly between 0 and 1")
ap.add_argument("--current", type=float, default=0.0, help="Existing cybersecurity spending per year")
ap.add_argument("--portfolio", type=float, default=0.0, help="First-year cost of the recommended portfolio")
ap.add_argument("--spend", type=float, nargs="*", help="Planned cybersecurity spend per year")
a = ap.parse_args()

print(f"IT budget (incl. salaries): {a.it_budget:,.0f}")
print("Point targets: " + " · ".join(f"appetite {ap_:.2f} -> {t:.1%} = {t * a.it_budget:,.0f}" for ap_, t in POINT_TARGETS)
      + "  (linear in between, clamped outside)")
if a.appetite is not None:
    try:
        b = budget_position(a.appetite, a.it_budget, a.current, a.portfolio)
    except CRGInputError as e:
        sys.exit("Input validation failed: " + "; ".join(e.errors))
    print(f"Appetite {a.appetite:.2f} -> appetite-consistent target {b['target_pct']:.2%} = {b['target_amount']:,.0f} per year")
    if a.current or a.portfolio:
        ia = b["implied_appetite"]
        print(f"Current {a.current:,.0f} + portfolio {a.portfolio:,.0f} = {b['planned_total']:,.0f} = {b['planned_pct']:.1%}; "
              f"gap {b['gap_amount']:+,.0f} ({b['gap_pct'] * 100:+.2f} points); {b['status']}; "
              f"implied appetite {'outside the guideline (below 4%)' if ia is None else f'{ia:.2f}'}")
        print("Management decision required: close the gap, accept it for a stated reason, or revise the appetite.")
for i, s in enumerate(a.spend or [], 1):
    pct = s / a.it_budget
    ia = implied_appetite(pct)
    line = f"Year {i}: spend {s:,.0f} = {pct:.1%}  implied appetite {'outside the guideline (below 4%)' if ia is None else f'{ia:.2f}'}"
    if a.appetite is not None:
        ts = target_status(pct, a.appetite)
        line += f"  gap {ts['gap_pct'] * 100:+.2f} points ({ts['status']})"
    else:
        line += f"  {band_status(pct)}"
    print(line)
