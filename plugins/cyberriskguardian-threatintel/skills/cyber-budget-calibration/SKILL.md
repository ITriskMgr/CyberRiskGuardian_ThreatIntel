---
name: cyber-budget-calibration
description: >
  This skill should be used when the user asks to "determine the cybersecurity budget", "check whether the security budget is
  appropriate", "align the cyber budget with risk appetite", "calculate the budget for IT and cybersecurity projects", or needs
  the best-practice budget point targets (12% / 7.8% / 4% of the IT budget by risk appetite) applied to a risk assessment's
  treatment portfolio (step 18 of the CyberRiskGuardian method).
metadata:
  version: "1.1.0"
  author: "Marc-André Léger (methodology) - packaged with Claude"
---

# Cybersecurity Budget Calibration

Set the cybersecurity budget with the same logic as risk decisions: the risk appetite fixes the appetite-consistent target, and the risk assessment shows what the money must buy (book v2.51, ch06 §Calibrating the budget to risk appetite, ch17). Read `references/budget-guideline.md` before starting.

## Rule

Best practice: the appetite-consistent cybersecurity budget is a **point target** of the **total IT budget, including salaries** — **12%** for a risk-averse organization (appetite 0.30 or below), **7.8%** for a risk-neutral one (0.50), **4%** for a risk-seeking one (0.70 or above) — with **linear interpolation** between these points (−4.2 points over 0.30–0.50, −3.8 points over 0.50–0.70) and clamped outside. The test is the gap between existing spending plus the portfolio and this target, not whether spending falls "within 4–12%". Compute targets, gaps and implied appetites with `../cyber-risk-assessment/scripts/budget_calibrator.py` (`--current`, `--portfolio`, `--spend`) or the `crg-calculator` MCP tools `budget_target` (with `current_spend` and `portfolio_cost`) and `budget_check` (with `appetite`). Worked check (book ch06): IT budget $50M, appetite 0.35 → 10.95% = $5.48M; $3.0M current + $1.7M portfolio = 9.4%, about $0.78M below target, implied appetite 0.42.

## Procedure

1. Confirm the IT budget (including salaries) and the approved or estimated appetite; flag implausible figures (e.g. budget inconsistent with headcount) as **Information gap — organizational validation required**; an estimated appetite carries **Analytical estimate — validation required**.
2. Derive the appetite-consistent target (% and amount); show the appetite sensitivity table (0.2–0.8).
3. Estimate current security spend (security staff, tooling, security embedded in IT contracts) and its gap to the appetite-consistent target; note when it is below even the lowest point target (4%).
4. Build the risk-driven budget bottom-up from the treatment portfolio: phase by fiscal year (one-time costs spread between start and end month, recurring from completion); split each shared initiative between cyber and IT budgets and state why; count shared controls once; add new security roles (state FTE valuation), risk-transfer premiums (placeholder until quoted) and ~10% contingency.
5. Compare options with the appetite-consistent target (status quo; portfolio; + staffing; + second-wave treatments): gap in points and amount, and each option's implied appetite.
6. Show what each funding level buys: counts above / approximately at / below tolerance and total residual risk (re-run CRG calculations with improved reductions only where a funded treatment justifies them, labelled as estimates).
7. Reconcile budget and appetite — fund to appetite (ramp limited by delivery capacity; any balancing reserve released only against scenario-linked business cases), formally revise the appetite, or accept residual risk formally. Mark **Management decision required**.
8. Report the cybersecurity project budget (committed and gated reserve) separately from security-relevant IT projects; note IT-funded prerequisites.
9. Test sensitivity to the IT budget figure; where the plan exceeds the appetite-consistent target (and in any case above 12%), phase or trim starting with the lowest cost-effectiveness items (risk units removed per $1,000).
10. Add KRIs (measured indicators, not risk indices): cyber spend % of IT budget (target = the appetite-consistent point target; warning = below that target; critical = below the target by more than the tolerance management sets, or below 4%); share of spend tied to scenarios; reserve releases tied to scenario IDs.

## Output

A budget section in the management report and budget sheets in the workbook (Budget_Params with the live mapping formula, Budget_Lines with gross/cyber/IT splits by year, Budget_Summary with options, gap to the appetite-consistent target, implied appetite, project budgets and IT-budget sensitivity, Budget_Risk with tolerance status by funding level). Recalculate and verify zero errors. In the reply, state the appetite-consistent target, the risk-driven budget and its implied appetite, the recommendation, and the decisions required.
