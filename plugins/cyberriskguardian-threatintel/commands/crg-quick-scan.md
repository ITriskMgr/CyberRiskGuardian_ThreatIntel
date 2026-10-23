---
description: Quick CyberRiskGuardian scan - 25-40 candidates screened, 10 selected, pre-treatment verdicts in one table (no treatment)
argument-hint: "[organization description or documents] [--candidates N]"
---

Run a quick CyberRiskGuardian scan for: $ARGUMENTS

This is steps 1–11 of the 19-step method in compressed form. It stops before treatment: no measures, costs, residual risk or budget.

1. **Evidence and context (steps 1–3).** Read everything supplied and build a short evidence register (E1, E2…; documented, exercise, SME input or external). Name the crown jewels and the 12-month horizon. Do not interview at length: list each missing fact as **Information gap — organizational validation required**.
2. **Appetite (step 4).** Use the approved appetite, or estimate one on the CRG anchors (0.1–0.2 · 0.3 · 0.5 · 0.7 · 0.8–0.9), strictly between 0 and 1, with its rationale and **Analytical estimate — validation required**. Approving it is a **Management decision required**.
3. **Candidates (step 5).** Following the `scenario-selection` skill, generate about **25–40** causal-chain candidates (threat source → vulnerability or condition → asset/process → event → consequence), never fewer than 20, using the five strategies: top-down, bottom-up, threat-driven, dependency-driven and localized generic, plus the intel-driven perspective of this edition. Include the cloud patterns where the organization uses cloud or SaaS.
4. **Screen and select (steps 6–7).** Score every candidate 1–5 on the 12 criteria (total /60 is a screening aid, not a rule), apply the mandatory escalation flags, consolidate variants, and select the **10** most material for materiality, coverage and decision usefulness, with a one-line rationale each. Say which selections rest on judgement rather than score.
5. **Parameters and CVSS (steps 8–10).** For each selected scenario state the causal chain in one sentence, estimate Pb(A), Pb(ψ,A), δe, δm (≥ δe), θ and μ(E) (organizational criticality, expected utility) to two decimals, and score the representative weakness with a CVSS v4.0 Base vector (CVSS-B); for a process, people, governance, physical, third-party or configuration weakness use the equivalency method and label the score *limited applicability*. Check the threat-context snapshot first; intelligence may move Pb(A) and Pb(ψ,A) only within ladder bands and only with confirmed exposure.
6. **Risk indices (step 11).** Compute estimated and tolerated risk and the pre-treatment ratio with the `crg-calculator` MCP tool `crg_risk` (red_p = red_i = 0) or `scripts/crg_calc.py` — never by hand. Classify: below (< 0.90), approximately at (0.90–1.10), above tolerance (> 1.10).

**Return one table:**

| ID | Scenario (causal chain, short) | CVSS-B | Re | Rt | Pre-treatment ratio | Verdict | Main information gap |
|---|---|---|---|---|---|---|---|

Then: the candidate count and dispositions in one line, the strongest unselected candidate, the threat-context snapshot date, and the decisions required (appetite approval, which scenarios to take to full treatment). Remind that the pre-treatment ratio equals average damage ÷ appetite, so at a low appetite most material scenarios start above tolerance, and that the values are risk indices, not KRIs. Label every estimate with the markers in the language of the reply. For treatment, residual risk, portfolio and budget, continue with `/risk-assessment`.
