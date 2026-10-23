# Cybersecurity budget guideline (step 18)

Source: rule stated by the CyberRiskGuardian author (Marc-André Léger), September 2026, as published in *Introduction to Cybersecurity Governance*, 3rd ed., v2.51, ch06 §Calibrating the budget to risk appetite and ch17.

**Rule (best practice).** The appetite-consistent cybersecurity budget is a **point target** expressed as a share of the **total IT budget, including salaries**:

| Appetite | Point target (% of IT budget) | Reading |
|---|---|---|
| 0.30 or below | 12% | Risk averse |
| 0.50 | 7.8% | Risk neutral |
| 0.70 or above | 4% | Risk seeking |

**Appetite → target.** Linear interpolation between the points, clamped outside: the target falls by 4.2 percentage points over 0.30–0.50 and by 3.8 points over 0.50–0.70. Examples: 0.35 → 10.95%; 0.40 → 9.9%; 0.60 → 5.9%.
**Implied appetite.** The inverse mapping turns a budget share into the appetite it expresses (9.4% → about 0.42). Below 4% the funding implies an appetite above 0.70, outside the guideline.
**The test** is the gap between existing cybersecurity spending plus the recommended portfolio and the appetite-consistent target — not whether spending lies "within 4–12%". A gap may be acceptable for a first-year programme, may reflect a portfolio that needs less, or may reveal that the stated appetite and the funding are inconsistent; it is always reported, and closing it or revising the appetite is a **Management decision required**.

## Calibration step (after the investment portfolio, before KRIs)
1. Set or confirm the risk appetite (strictly between 0 and 1).
2. Derive the appetite-consistent target (% and currency).
3. Estimate current security spend (staff, tooling, security embedded in IT contracts) and its gap to the target.
4. Build the risk-driven budget bottom-up from the treatment portfolio:
   - phase by fiscal year (one-time costs spread between start and end month; recurring from completion);
   - split shared initiatives between the cybersecurity and IT budgets, stating the share and why;
   - count shared controls once; add new security roles, risk-transfer premiums (placeholder until quoted, **Information gap — organizational validation required**) and a contingency (≈10%).
5. Compare current spending plus the portfolio with the target: gap (points and amount) and implied appetite.
6. Reconcile — one of: fund to the appetite (ramped to delivery capacity; any balancing reserve released only against scenario-linked business cases), formally revise the appetite, or accept the gap and the residual risk formally. **Management decision required.**
7. Show what each funding level buys: tolerance status counts and total residual risk per option.
8. Report the cybersecurity project budget and the security-relevant IT project budget separately (IT-funded prerequisites do not count toward the cyber %).
9. Test sensitivity to the IT budget figure; if the plan exceeds the target materially (and in any case above 12%), phase or trim starting with the lowest cost-effectiveness items.
10. Monitor with KRIs: cyber spend as % of IT budget (target = the appetite-consistent point target, warning below it); share of spend tied to assessed scenarios; reserve releases tied to scenario IDs.

Tools: `../../cyber-risk-assessment/scripts/budget_calibrator.py --it-budget N --appetite A --current C --portfolio P`, or the `crg-calculator` MCP tools `budget_target` and `budget_check`.

## Typical cyber/IT split conventions (state and justify per case)
| Initiative type | Cyber share |
|---|---|
| MFA, PAM, MDR/SIEM, cloud posture, access governance, vendor risk, awareness, DDoS/WAF, brand protection | 100% |
| Vulnerability management (scanning, SLAs, analyst) vs patch deployment | ~75% |
| IR readiness (plan, retainer, exercises) vs clinical/business downtime procedures | ~70% |
| Device security programme vs biomedical/OT engineering effort | ~70% |
| Immutable/isolated backup vs backup platform; segmentation vs network re-architecture; integrity monitoring vs application support | ~50% |
| MDM/endpoint encryption, secure communications platforms | ~30% |
| Carrier redundancy, SD-WAN, secondary site, device replacement | 0–20% (IT project) |

## First application (MediBec, Sept 2026 — fictional teaching case)
IT budget CAD 100M (**Information gap — organizational validation required**). Appetite 0.30 → 12% = CAD 12.0M. Current spend ≈ CAD 0.9M (0.9%, below even the 4% point). Risk-driven budget CAD 5.1M / 5.5M / 4.9M (5.1–5.5%, implied appetite ≈ 0.64 — inconsistent with 0.30, about 6.5–6.9 points below the target). Recommended ramp CAD 7.0M / 9.5M / 12.0M with a gated reserve. If the IT budget were ≈ CAD 46–50M, the risk-driven budget alone would sit at 10–12%.
