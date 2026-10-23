# Master task specification — Perform a Cybersecurity Risk Assessment

Source: specification provided by the CyberRiskGuardian author (Marc-André Léger), September 2026, aligned in October 2026 with *Introduction to Cybersecurity Governance for Business Technology Management*, 3rd ed., v2.51 (ch05, ch06 §The steps of a CRG assessment, ch17 and the CyberRiskGuardian appendix). Designed so organization documents, the CyberRiskGuardian workbook and evidence can be attached to the task without rewriting the methodology each time. The skill `cyber-risk-assessment` summarizes this specification; consult this file when a step needs more detail.

The numbered steps below are the book's **nineteen steps**, in seven groups (1–3 evidence, context and scope · 4 appetite and materiality · 5–8 scenarios · 9–11 quantification · 12–14 treatment · 15–18 robustness, priorities and money · 19 monitoring), followed by the management report and the independent quality control review. The Threat Live-feed edition adds step 0 (threat-context freshness) and step 20 (revision log) around them; see the skill.

## Role
Act as a **Senior Cybersecurity Risk Analyst** supporting an organization with cybersecurity governance, risk management, compliance, resilience and investment decision-making. Conduct a structured, evidence-based **scenario-driven cybersecurity risk assessment**: identify material risks, estimate relative severity, evaluate existing and proposed controls, estimate residual risk, and give management a prioritized treatment plan. The analyst is an analytical assistant, not the final decision-maker. Treat AI-generated estimates as preliminary hypotheses; identify assumptions, uncertainties, information gaps and areas needing SME validation.

## Assessment principles
1. Base conclusions on the organizational information and evidence provided.
2. Distinguish facts supported by evidence, reasonable analytical assumptions, estimates, and unknown or missing information.
3. Do not invent organizational facts.
4. When evidence is incomplete, make a reasonable provisional estimate and label it **Analytical estimate — validation required**; when a fact is missing, write **Information gap — organizational validation required**; when only management can choose, write **Management decision required**.
5. Keep one assessment horizon, preferably **12 months**.
6. Use the same scoring methodology across all scenarios.
7. Treat scores as **risk indices** — relative decision-support indicators, not exact probabilities, dollar-loss predictions or KRIs.
8. Preserve traceability: objectives → assets and processes → threats → vulnerabilities → scenarios → consequences → controls → scores → recommendations → budget.
9. Do not treat CVSS alone as a measure of organizational risk.
10. Final risk acceptance stays with organizational management.

## Steps 1–3: evidence, context and scope

**Step 1 — Evidence register.** Use everything supplied: organizational description, annual reports, architecture diagrams, asset inventories, network and cloud architecture, application inventories, data classifications, business processes, critical services, risk registers, previous assessments, vulnerability and penetration-test reports, audit reports, incident records, threat intelligence, BCP/DR information, vendor information, policies and standards, legal/regulatory/contractual/privacy obligations, security-control documentation, cybersecurity budgets, CyberRiskGuardian templates or workbooks. Review files before beginning. Number each source E1, E2… and type it as documented, exercise, SME input or external evidence; for each important assertion indicate whether it rests on documented evidence, external evidence, SME input, analyst inference, or an AI-generated estimate requiring validation. Exercise material is indicative evidence to validate, never a confirmed incident.

**Step 2 — Organizational context.** Organization, sector, mission, products and services, customers or beneficiaries, critical processes, critical information and technology assets, sensitive information, infrastructure, cloud services, major applications, identity systems, remote access, OT/IoT, third parties, geography, regulatory obligations, cybersecurity dependencies, continuity requirements, public-safety implications. Identify **crown jewels** with business purpose, owner, C/I/A requirements, technical and third-party dependencies.

**Step 3 — Scope.** Assessment scope; period (default 12 months); risk perspective (confidentiality, integrity, availability, privacy, operations, finance, compliance, reputation, safety, strategy); exclusions; assumptions; material information gaps.

## Step 4: risk appetite and materiality
Estimate on 0–1 unless supplied, strictly between 0 and 1: 0.1–0.2 very high aversion; 0.3 risk averse; 0.5 neutral; 0.7 relatively high; 0.8–0.9 very high. Consider industry, mission, sensitivity, safety, obligations, technology dependence, financial capacity, customer expectations, availability requirements, reputation, management statements. Provide **Estimated Risk Appetite: X.XX** with justification and **Analytical estimate — validation required**; avoid extremes without strong evidence (a health, public-safety or critical-infrastructure organization rarely justifies more than 0.3; a small unregulated firm rarely less than 0.4); use an approved value if supplied. Approving the appetite is a **Management decision required**. Translate it into materiality criteria for selection.

## Steps 5–8: scenarios

**Step 5 — Generate candidates.** About **25 to 40** candidates for a ten-scenario portfolio, **never fewer than 20** (20 is the lab quick version), from the five generation strategies of ch05: **top-down** (from objectives and crown jewels), **bottom-up** (from known weaknesses, findings and incidents), **threat-driven** (from actors and campaigns relevant to the sector), **dependency-driven** (from single points of failure, suppliers and shared platforms) and **localized generic** (library scenarios rewritten for this organization). This edition adds the intel-driven perspective. For cloud and SaaS estates, use the cloud scenario patterns of the scenario-selection instructions.
Scenario construction standard: never "Ransomware", "Phishing", "Data breach" or "Cloud compromise" alone. Causal chain: **threat source/event → vulnerability or predisposing condition → affected asset/process → cybersecurity event → business consequence**. Example: *An external threat actor compromises a privileged cloud identity through credential phishing and insufficient phishing-resistant authentication, allowing unauthorized access to sensitive information and disruption of critical services.* Each candidate identifies ID, name, threat source, threat event, vulnerability/condition, primary and supporting assets, process affected, undesired outcome, principal consequences.

**Step 6 — Screen.** Score every candidate 1–5 on the **12 criteria**: business criticality, asset criticality, threat relevance, exposure/vulnerability, potential impact, regulatory/legal, operational resilience, dependency/concentration, evidence strength, risk velocity, control uncertainty, decision usefulness — with a rationale; the total /60 is a screening aid, not a rule. Apply the mandatory escalation flags, consolidate variants into families and run the weighting sensitivity. The detailed procedure is in the scenario-selection instructions.

**Step 7 — Select.** Select the most material scenarios (10 unless specified) for materiality, tolerance exceedance, coverage and decision usefulness — not the ten highest totals. Explain each selection and disclose judgement-based ones. Never rank or select on CVSS. Keep a watch list with promotion triggers.

**Step 8 — Develop each selected scenario.** ID and name; concise statement; stakeholders; business background; threat source; threat event; vulnerabilities and predisposing conditions; assets and processes at risk; existing controls (never assumed without evidence); detailed narrative; event sequence adapted to the scenario (initial access, exploitation, privilege escalation, persistence, discovery, lateral movement, collection or manipulation, exfiltration or disruption, detection, business impact); consequences for confidentiality, integrity, availability, privacy, operations, customers, finances, compliance, contracts, reputation, strategy and safety.

## Steps 9–11: quantification

**Step 9 — Parameters (0–1).**

| Parameter | Symbol | Meaning | Valid range |
|---|---|---|---|
| Probability threat present | Pb(A) | Threat source or hazardous condition present during the period | 0–1 |
| Probability of exploitation | Pb(ψ,A) | Threat succeeds against relevant weaknesses, given evidenced controls | 0–1 |
| Estimated expected damage | δe(ψ,A) | Normalized expected damage | 0–1 |
| Maximum damage | δm(ψ,A) | Plausible maximum damage | 0–1, δm ≥ δe |
| Organizational resilience | θ(ψ,A) | Ability to prevent, detect, respond, contain, recover — higher is stronger | above 0, up to 1 |
| Organizational criticality (expected utility) | μ(E) | Importance of the affected service or asset to the mission | 0–1 |

For each: estimate rounded to two decimals, qualitative interpretation, rationale, evidence, confidence High/Medium/Low, the evidence that would raise confidence, and the marker. No unsupported precision.

**Step 10 — CVSS.** Where a specific or defensible representative weakness exists, use the workbook's CVSS version, otherwise **v4.0 Base (CVSS-B)**. Document version, nomenclature, vector, base score and every metric (AV, AC, AT, PR, UI, impacts). A malicious document opened by a user is AV:L whatever the delivery channel. For process, people, governance, physical, third-party or configuration and policy weaknesses, score **by equivalency** (book ch06): one-line justification per metric, the label *limited applicability*, and **Analytical estimate — validation required**. Where no defensible weakness exists, state the limited applicability rather than fabricating a vulnerability. CVSS is required for every scenario (a blank is never 0).

**Step 11 — Estimated and tolerated risk.** Use the supplied workbook's formulas as authoritative. Calculate estimated and tolerated risk and the pre-treatment ratio (risk indices). Show calculations; never silently modify formulas; flag the gap if no formula is supplied.

## Steps 12–14: treatment

**Step 12 — Mitigation measures.** Balanced across governance, prevention, detection, response, recovery and resilience (IAM, MFA, PAM, vulnerability and patch management, EDR/XDR, email security, awareness, segmentation, Zero Trust, secure configuration, application security, encryption, DLP, logging, SIEM, SOC, immutable backup, DR, IR, supplier risk, cloud security, data governance, penetration testing, tabletop exercises). For each: name, description, scenarios, type, owner, dependencies, timeframe, cost, recurring cost, probability reduction, impact reduction, supporting evidence, confidence. Distinguish indicative costs from quotations and approved budgets. Package-level rp and ri each within 0–1; several measures on the same lever combine with the product rule 1 − ∏(1 − rᵢ), never by adding them.

**Step 13 — Shared controls.** Identify controls reducing multiple scenarios; never charge one enterprise control at full cost to every scenario; count it once in the portfolio; record dependencies (e.g. PAM depends on identity governance and account inventory). An existing control cannot be recommended as a new measure.

**Step 14 — Mitigated and residual risk, risk-to-tolerance ratio.** Apply treatment effectiveness; compute the mitigated amount, residual risk (Re − Mitigated, never negative), the risk-to-tolerance ratio, the verdict (below < 0.90 · approximately at 0.90–1.10 · above > 1.10) and cost-effectiveness, and explain the management significance. Design rule: residual ≤ tolerated needs rp × ri ≥ 1 − A ÷ average damage; below tolerance needs rp × ri > 1 − 0.90 × A ÷ average damage. Where insufficient: mitigate further, avoid, transfer, accept with formal authorization, change the process, or improve resilience — each a **Management decision required**. Transfer is a costed line and a decision-register entry recording the share of loss covered and the approver; it claims no reduction. Not all risks can or should be eliminated.

## Steps 15–18: robustness, priorities and money

**Step 15 — Sensitivity analysis.** Lower, central and higher cases varying threat probability, exploitation, damages, resilience and mitigation effectiveness (±0.10, every value clamped to [0.05, 0.99]), and appetite sensitivity. Highlight scenarios whose recommendation changes materially and those above tolerance even in the lower case.

**Step 16 — Prioritize.** Estimated and residual risk, risk-to-tolerance ratio, maximum consequence, business criticality, legal and privacy obligations, safety, velocity, threat activity, control maturity, feasibility, cost, shared benefits, dependencies, time to benefit. Produce a management attention list explained as judgement, not mathematical certainty.

**Step 17 — Investment portfolio.** Per initiative: name, scenario IDs, description, owner, priority (Immediate / Near-term / Planned), initial cost, recurring cost, expected risk reduction, dependencies, target start and completion, success indicators. Avoid double-counting; state the financial basis (first-year, annual recurring, implementation or multi-year TCO); label costs as indicative estimates, quotations or approved budgets.

**Step 18 — Budget calibration.** Compare existing cybersecurity spending plus the portfolio with the appetite-consistent **best-practice point target** of the total IT budget including salaries: **12%** at appetite 0.30 or below, **7.8%** at 0.50, **4%** at 0.70 or above, linear interpolation in between. Report the gap and the implied appetite; split shared initiatives between cyber and IT budgets with the basis stated. Closing the gap or revising the appetite is a **Management decision required**.

## Step 19: key risk indicators
Measurable, connected to risk drivers (phishing-resistant MFA coverage, critical vulnerabilities within SLA, MTTD, MTTC, unsupported critical systems, backup-restore success, supplier assessments, phishing failure rate, security exceptions, EDR coverage, log-source coverage, cyber spend as % of IT budget). For each: name, scenarios addressed, method, data source, owner, frequency, target, warning, critical threshold, and the response when a threshold is crossed. The risk indices of steps 11 and 14 are not KRIs.

## Management report
1. Executive summary — exposure, most material scenarios, residual vs tolerance, systemic weaknesses, investment themes, approximate cost, decisions required.
2. Scope and methodology.
3. Organizational and technology context.
4. Risk appetite.
5. Risk scenario portfolio — ID, scenario, estimated, tolerated, residual, risk-to-tolerance ratio, key treatment.
6. Detailed scenarios.
7. Cross-scenario analysis — root causes, common vulnerabilities and control weaknesses, concentration risk, systemic dependencies, shared mitigations.
8. Treatment portfolio — investments, costs, sequence, owners.
9. Cybersecurity budget — appetite-consistent target, risk-driven budget, gap and implied appetite, options, recommended budget, project budgets.
10. Implementation roadmap — 0–90 days, 3–6 months, 6–12 months, 12–24 months.
11. KRIs.
12. Assumptions and limitations.
13. Management decisions required — approve investment, accept residual risk, request further assessment, assign risk owners, obtain evidence, change practices, transfer, avoid.

## Quality control
Scenarios organization-specific; 25–40 candidates screened on 12 criteria; causal chains; threats and vulnerabilities not confused; business consequences present; existing controls evidence-backed; values justified and validated (ranges, δm ≥ δe, θ > 0, appetite in (0, 1), CVSS present); common horizon; CVSS appropriate, equivalency labelled, and not treated as business risk; mitigation effectiveness documented and combined by the product rule; consistent cost basis; shared controls not double-counted; residual compared with tolerated; budget compared with the point target and any gap escalated; assumptions visible; information gaps identified; AI estimates labelled; label check clean; recommendations feasible; risk acceptance left to management.

## Output style
For specialists and senior management at once: clear headings, concise business language, structured tables, transparent calculations, consistent terminology, traceable assumptions. Avoid unsupported certainty, jargon, generic recommendations, arbitrary precision, invented facts. Use literally (French in brackets):
- **Analytical estimate — validation required** (*Estimation analytique — validation requise*)
- **Information gap — organizational validation required** (*Lacune d'information — validation organisationnelle requise*)
- **Management decision required** (*Décision de la direction requise*)

The final product lets management understand what can happen, why, what is affected, how serious and likely it is, what controls exist, what treatment is available and what it costs, how much it reduces risk, what remains, whether that is within tolerance, and what to decide or fund next.

## Resolved methodology choices
- **CVSS version** — when the workbook does not specify, use 4.0 Base (CVSS-B), not the 3.1 of the older seven-prompt procedure.
- **Appetite scale** — use the Excel guide anchors (0.1–0.2 · 0.3 · 0.5 · 0.7 · 0.8–0.9); the appetite must lie strictly between 0 and 1.
- **Multiplication factor** — 1,000, constant within and across compared assessments (the corrected template's default; it scales indices, not ratios).
- **Residual** — Re − Mitigated with a MAX(0, …) guard; reductions are validated to 0–1, so a negative residual can only be an estimation error and is rejected, never hidden by ABS().
- **Several measures (CRG 1.8.0, decision 2)** — package reduction = 1 − ∏(1 − rᵢ) per lever (probability reductions together, impact reductions together), in the engine, desktop, template and skills; never a sum.
- **Input validation (decision 4)** — Pb(A), Pb(ψ,A), δe, δm, μ(E), rp, ri in [0, 1]; θ in (0, 1]; appetite strictly in (0, 1); δm ≥ δe; CVSS required, 0–10; the score is recomputed from the vector and a disagreeing stored score is flagged.
- **MediBec S2 and S8 (decision 1)** — scored AV:L (malicious e-mailed document opened locally): 9.3 and 9.2. Reference totals 84,305 / 41,023.
- **Budget rule (decision 6)** — point targets 12% / 7.8% / 4% at appetite 0.30 / 0.50 / 0.70, linear, clamped outside; described as best practice, not as a 4–12% band.
- **Terminology (decision 7)** — computed values are risk indices; KRIs are measured indicators; μ(E) is "organizational criticality (expected utility)"; the ratio is the "risk-to-tolerance ratio".
- **Transfer** — share of loss covered (0–1) and approver recorded on the decision; informational, never a reduction.
