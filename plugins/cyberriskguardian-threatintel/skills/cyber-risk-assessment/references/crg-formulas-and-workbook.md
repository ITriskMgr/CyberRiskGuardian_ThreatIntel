# CyberRiskGuardian formulas, workbook conventions and interpretation

Reference text: *Introduction to Cybersecurity Governance for Business Technology Management*, 3rd ed., v2.51, Chapter 6 (§The risk index and underlying formulas, §Step-by-step procedure) and the CyberRiskGuardian appendix (§The Excel teaching template).

## Formulas (Excel Guide v1.0c, s.11 — authoritative, never modify silently)

```
Estimated risk (Re)      = Pb(A) × Pb(ψ,A) × CVSS × ((δe + δm) / 2) × μ(E) ÷ θ(ψ,A) × Factor
Tolerated risk (Rt)      = Pb(A) × Pb(ψ,A) × CVSS × Appetite × μ(E) ÷ θ(ψ,A) × Factor
Mitigated                = Re × rp × ri            (rp = probability reduction, ri = impact reduction)
Residual                 = MAX(0, Re − Mitigated)  (the guard never binds while rp and ri are validated to 0–1)
Risk-to-tolerance ratio  = Residual ÷ Rt           (pre-treatment ratio = Re ÷ Rt, with rp = ri = 0)
Cost-effectiveness       = (Re − Residual) ÷ cost × 1,000   (risk units removed per $1,000)
```

These are **risk indices**: dimensionless, relative decision-support values, not dollar amounts, not predictions of loss and **not KRIs**. KRIs are measured monitoring indicators with owner, source, frequency, target, warning and critical thresholds (step 19).

**Variables and validation** (enforced by `scripts/crg_calc.py`, the `crg-calculator` MCP tools and the v2-6 template):

| Symbol | Meaning | Valid range |
|---|---|---|
| Pb(A) | Probability the threat is present in 12 months | 0–1 |
| Pb(ψ,A) | Probability it exploits the weakness, given existing controls | 0–1 |
| δe, δm | Normalized expected and plausible maximum damage | 0–1 each, **δm ≥ δe** (error otherwise) |
| θ(ψ,A) | Organizational resilience | above 0, up to 1 |
| μ(E) | Organizational criticality (expected utility) | 0–1 |
| CVSS | CVSS v4.0 Base score (CVSS-B) of the representative weakness | 0.0–10.0, **required**: a blank score is an error, never 0 |
| Appetite | Approved or estimated risk appetite | strictly between 0 and 1 (0.1–0.9 in practice) |
| rp, ri | Package probability and impact reduction | 0–1 each |
| Factor | Multiplication factor | 1,000, constant |

Values are rounded to two decimals. When a scenario holds both a vector and a stored score, the calculator recomputes the score from the vector, uses it, and flags a stored score that disagrees.

**Worked example (guide s.16 parameters applied to MediBec ransomware, book v2.51 ch06 §Worked example).** Pb(A) 0.70, Pb(ψ,A) 0.60, CVSS-B 9.3 (`CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H` — the macro-enabled document is delivered by e-mail but opened locally, so AV:L per the FIRST user guide), δe 0.60, δm 0.80, θ 0.50, μ(E) 0.65, appetite 0.35, factor 1,000, rp 0.65, ri 0.70, cost $62,000 → common term 5,077.8; **Re 3,554.46; Rt 1,777.23; pre-treatment ratio 2.00; mitigated 1,617.28; residual 1,937.18; ratio 1.09 (approximately at tolerance); cost-effectiveness 26.09**. Design thresholds: rp × ri ≥ 0.50 for residual ≤ tolerated, > 0.55 for below tolerance. Sensitivity (±0.10, clamped [0.05, 0.99]): lower 0.69 (below), higher 1.53 (above). All values recomputed with `crg_calc.py` (`scripts/test_crg_calc.py`); every input is an **Analytical estimate — validation required**.

**Reference regression.** `crg_calc.py examples/medibec/source/medibec30.json` must print total estimated **84,305** and total residual **41,023** (30 scenarios; S2 and S8 scored AV:L, CVSS-B 9.3 and 9.2).

## Conventions
- **Factor**: 1,000, constant across all scenarios of an assessment and across assessments that will be compared. It scales indices, never ratios or verdicts.
- **CVSS**: v4.0 Base score (CVSS-B) unless the workbook specifies otherwise; state the nomenclature. Compute scores with `scripts/crg_calc.py` or the `crg-calculator` MCP tool `cvss4_score`; never estimate a score by eye. Keep the full vector next to the score.
- **Classification bands** (analyst convention reflecting estimate precision): ratio < 0.90 below tolerance; 0.90–1.10 approximately at tolerance; > 1.10 above tolerance. The single 1.25 threshold of earlier editions is retired.
- **Several measures — product rule.** Estimate one package-level rp and one ri. When several measures act on the same lever, combine their coefficients as **1 − ∏(1 − rᵢ)** — probability reductions together, impact reductions together (MCP tool `combine_reductions`; the desktop application and the v2-6 template use the same rule). Never add coefficients: twenty controls at 0.06 would sum to 1.20, which is impossible. Each rᵢ must lie within 0–1. The package estimate must still reflect overlap and diminishing returns; a second detection tool adds less than the first.
- **Single-lever measures.** Because mitigation is multiplicative, a package that reduces only probability or only impact mitigates nothing. **Transfer** (insurance, contract terms) is recorded as a costed line and a decision-register entry with the **share of loss covered** (0–1) and the **approver** — informational, never a reduction in the index. **Avoidance** is a management decision with its owner. Both are **Management decision required**.
- **FTE valuation** in the template: 1,950 h × $80 = $156,000 per year.
- **Cost allocation**: when one initiative serves several scenarios, split its cost across those scenarios (equal split is an acceptable default) so no scenario carries the full enterprise cost; totals come from the portfolio, not the sum of scenario allocations. An existing control is never recommended again: its effect is already in Pb(ψ,A) and θ.
- **Excel teaching template (v2-6, education package of the Core repository).** Analyse sheet with one row per scenario (L estimated, M tolerated, O cost, P Pb reduction, Q impact reduction, R mitigated = L×P×Q, S residual = MAX(0, L−R), X pre-treatment ratio, Y risk-to-tolerance ratio, Z verdict, AA cost-effectiveness); S1–S10 scenario input sheets; M1–M10 mitigation sheets. Rules: factor **1,000** by default, with a warning when changed; CVSS cells **required**, blank (not 0), validated to 0–10, with the **CVSS v4.0 vector column next to the score** and a check that the score matches it; "CVSS required" or "θ required" shown instead of a silent zero; θ validated to (0, 1]; appetite strictly between 0 and 1 (warning outside 0.1–0.9); δm ≥ δe checked; each package reduction combined from the selected controls' coefficients with the **product rule** (the "Other" row is one more factor), each coefficient checked to lie within 0–1; residual guard **MAX(0, …)** instead of ABS(); risk-to-tolerance verdict with the 0.90 / 1.10 bands; cost-effectiveness per $1,000; budget block with the point targets, an input for **current cybersecurity spending** and the gap to the appetite-consistent target; transfer lines with share of loss covered and approver. Catalogue on the M sheets: **ISO/IEC 27002:2022** (93 controls), **NIST CSF 2.0** (106 subcategories) and the eighteen **CIS Controls v8.1**; default costs and coefficients are placeholders to recalibrate. The workbook opens in manual calculation mode: press Calculate Now (F9) before reading. The template holds 10 scenarios; `scripts/build_workbook.py` applies the same formulas to any number of rows.

## Interpretation notes (methodological observations)
1. **The tolerance test depends only on damage, treatment and appetite.** The risk-to-tolerance ratio simplifies to ((δe + δm)/2) × (1 − rp × ri) ÷ Appetite: probabilities, CVSS, resilience, criticality and the factor cancel. They drive magnitude (ranking) but not the verdict, so a rare scenario and a frequent one with equal damage and treatment get the same verdict. Always read the ratio together with estimated risk.
2. **Pre-treatment ratio** = average damage ÷ appetite, so with appetite 0.30 nearly every scenario with average damage above 0.33 starts above tolerance.
3. **Mitigation is multiplicative**: 80% probability and 80% impact reduction remove 64% of risk. Design rule: the residual is no greater than tolerated (ratio ≤ 1.00) when **rp × ri ≥ 1 − Appetite ÷ average damage**; it is **below tolerance (< 0.90)** only when **rp × ri > 1 − 0.90 × Appetite ÷ average damage**.
4. **CVSS is a mandatory multiplier, never a ranking or selection criterion.** For process, people, governance, physical, third-party or configuration and policy weaknesses (insider misuse, detection gaps, supplier concentration, fraud, human error), score the weakness **by equivalency** (book ch06 §Non-technical vulnerabilities by equivalency): ask each metric's question of the weakness (who can reach it and from where; must a safeguard be defeated; does success depend on an uncontrolled condition; what role or access is needed first; must a victim act, and deliberately; what happens to the process and downstream), and record three things: a **one-line justification per metric**, the label ***limited applicability*** next to the score, and **Analytical estimate — validation required**. Apply the equivalency consistently across the portfolio, never inflate or deflate Pb(A) or Pb(ψ,A) to compensate, and never adjust the vector to reach a preferred ranking. Book examples: supplier bank-detail change without call-back `CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:N/VI:H/VA:N/SC:N/SI:L/SA:N` = 5.9; departed administrator's live account `…/AV:N/AC:L/AT:N/PR:H/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H` = 9.4; unlocked network closet `…/AV:P/AC:L/AT:N/PR:N/UI:N/VC:L/VI:L/VA:H/SC:L/SI:L/SA:H` = 7.0. A low equivalency score depresses the estimated risk of fraud and error scenarios whose weight lies in the damage estimates; mention it in the report rather than adjusting the score. Where no defensible representative weakness exists, state the limited applicability.
5. **Two lenses may disagree.** A simpler normalized score (T × E × I × (1 − control maturity)) with escalation thresholds (e.g. 0.25 executive review, 0.40 Board) often places post-treatment risks inside authority limits that the CRG ratio flags above tolerance. Tie governance thresholds to one method and state which.

## EPSS, KEV and CRGO values are not formula inputs
- **EPSS is never `Pb(A)` or `Pb(ψ,A)`.** It is a dated probability that a CVE will see exploitation activity somewhere in the next 30 days — an observation about the threat environment, not about this organization or this scenario. Through the Threat Evidence Ladder it can, with confirmed exposure, place `Pb(ψ,A)` in a band; it never becomes the value. CRGO 0.9.x records EPSS as dated observations for the same reason.
- A **KEV** listing confirms exploitation in the wild; it says nothing about whether this organization runs the affected product. The exposure gate applies.
- CRGO library and case estimates (`crgo_scenario`, `crgo_risk_context.estimates`) are calibration priors: carry their assumptions, distribution and evidence quality into the rationale, label them **Analytical estimate — validation required**, and never substitute them for the organization's own parameters. CRGO computes no risk; a value written back with `crgo_contract.py submit` is a **proposed** copy of a crg_calc result, not a new calculation.

## Sensitivity convention
Lower / central / higher cases: shift Pb(A), Pb(ψ,A), δe, δm by ∓/± 0.10, θ by ±/∓ 0.10 and both reductions by ±/∓ 0.10, every shifted value clamped to [0.05, 0.99]; μ(E) and CVSS are not shifted. Flag scenarios whose classification changes between the lower and higher case (better evidence is worth paying for); those whose classification is "above" even in the lower case need transfer or formal acceptance rather than more spending.

## Budget calibration (step 18)
Best practice: the appetite-consistent cybersecurity budget is a **point target** of the total IT budget including salaries — **12%** at appetite 0.30 or below, **7.8%** at 0.50, **4%** at 0.70 or above — with linear interpolation in between (−4.2 points over 0.30–0.50, −3.8 points over 0.50–0.70). Existing spending plus the recommended portfolio is compared with that target; the gap and the implied appetite are reported (book example: IT budget $50M, appetite 0.35 → 10.95% = $5.48M; $3.0M current + $1.7M portfolio = 9.4%, $0.78M below target, implied appetite 0.42). Closing the gap or revising the appetite is a **Management decision required**. Use `budget_calibrator.py` or the MCP tools `budget_target` / `budget_check`.

## Parameter guidance (anchors used so far)
| Parameter | Low (≈0.2–0.35) | Moderate (≈0.4–0.6) | High (≈0.65–0.85+) |
|---|---|---|---|
| Pb(A) | rare actor/event, needs special position | plausible for sector | observed or constant (phishing, scanning) |
| Pb(ψ,A) | strong, evidenced controls | partial or unknown controls | weakness evidenced (e.g. push MFA approved, alert closed) |
| δe / δm | limited records or one site | material, several sites | network-wide, safety, catastrophic data loss |
| θ | resilience weak: no tested recovery, small team | partial | tested recovery, 24×7 detection |
| μ(E) | supporting process | important process | mission-critical (care delivery, identity) |

Each value needs rationale, evidence reference and confidence; mark **Analytical estimate — validation required**; a fact nobody has supplied is **Information gap — organizational validation required**.
