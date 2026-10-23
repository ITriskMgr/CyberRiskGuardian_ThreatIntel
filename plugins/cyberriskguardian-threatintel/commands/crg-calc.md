---
description: Compute CyberRiskGuardian risk indices for one scenario (estimated, tolerated, residual, ratio)
argument-hint: "PbA Pbx de dm theta mu red_p red_i CVSS-vector [appetite] [factor] [cost]"
---

Compute the CyberRiskGuardian risk indices (not KRIs) for the scenario parameters in: $ARGUMENTS

Use the `crg-calculator` MCP tool `crg_risk` if available; otherwise run `python3` with the `crg_calc` module from the `cyber-risk-assessment` skill's `scripts/` directory. Default appetite 0.30 and factor 1,000 unless given. The calculator validates the inputs (Pb(A), Pb(ψ,A), δe, δm, μ(E), reductions in 0–1; θ in (0, 1]; appetite strictly between 0 and 1; δm ≥ δe; CVSS required, 0–10) and recomputes the CVSS score from the vector, flagging a stored score that disagrees: report any error or warning verbatim. Show the formula substitution, estimated, tolerated, mitigated and residual risk, the pre-treatment ratio, the risk-to-tolerance ratio, the classification (below < 0.90 / approximately at 0.90–1.10 / above > 1.10), cost-effectiveness (risk units removed per $1,000) when a cost is given, the CVSS-B score and severity, the two design thresholds (ratio ≤ 1.00 needs rp × ri ≥ 1 − A ÷ average damage; below tolerance needs rp × ri > 1 − 0.90 × A ÷ average damage), and a one-line interpretation. Remind that the ratio depends only on damage, reductions and appetite. Label the inputs **Analytical estimate — validation required**.
