---
description: Align the cybersecurity budget with risk appetite (point targets 12% / 7.8% / 4% of IT budget)
argument-hint: "[IT budget] [appetite] [assessment or portfolio]"
---

Use the `cyber-budget-calibration` skill for: $ARGUMENTS

Compute the appetite-consistent target with the best-practice point targets (12% of total IT budget including salaries at appetite 0.30 or below, 7.8% at 0.50, 4% at 0.70 or above, linear interpolation in between), estimate current spend, compare current spend plus the portfolio with the target (gap and implied appetite), build the phased risk-driven budget from the treatment portfolio with the cyber/IT split, compare options and their implied appetite, show what each funding level buys in residual risk, reconcile, report cyber and IT project budgets separately, and test sensitivity to the IT budget figure. Use `budget_calibrator.py` or the `crg-calculator` MCP tools (`budget_target` with `current_spend` and `portfolio_cost`, `budget_check`) for every number. Closing the gap or revising the appetite is a **Management decision required**.
