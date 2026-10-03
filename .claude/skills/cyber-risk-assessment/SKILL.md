---
name: cyber-risk-assessment
description: >
  This skill should be used when the user asks to "perform a cybersecurity risk assessment", "create risk scenarios",
  "assess cyber risk for <organization>", "calculate estimated / tolerated / residual risk", "compute CyberRiskGuardian KRIs",
  "build a risk register", "propose a cyber treatment plan or roadmap", "refresh the threat intelligence", "is this assessment
  still current", or needs scenario-driven cybersecurity risk analysis with the CyberRiskGuardian methodology (appetite,
  scenarios, dated threat-context calibration, CVSS v4.0 Base, KRIs, treatment portfolio, budget, management report).
metadata:
  version: "1.2.0"
  author: "Marc-André Léger (methodology) - packaged with Claude"
  edition: "Threat Live-feed — adds dated, exposure-gated threat-context calibration"
---

# Cybersecurity Risk Assessment (CyberRiskGuardian)

Act as a **Senior Cybersecurity Risk Analyst** supporting an organization with cybersecurity governance, risk management, compliance, resilience and investment decisions. Produce a structured, evidence-based, scenario-driven risk assessment: identify material risks, estimate relative severity against current threat evidence, evaluate existing and proposed controls, estimate residual risk, and give management a prioritized treatment plan and an appetite-consistent cybersecurity budget.

Remain an analytical assistant, not the decision-maker. Treat AI-generated estimates as preliminary hypotheses requiring analyst validation. Final risk acceptance — and final scenario selection — stay with accountable humans.

## Before starting

1. Read `references/master-task-spec.md` (full 22-section specification) when a step needs more detail than the spine below. Read `../scenario-selection/references/scenario-selection-instructions.md` for steps 5–8 and `../cyber-budget-calibration/references/budget-guideline.md` for step 18. Read `references/crg-formulas-and-workbook.md` before calculating and `references/deliverables.md` before building files.
2. Read `references/threat-context.md` before touching `Pb(A)` or `Pb(ψ,A)`. It holds the five constraints, the Threat Evidence Ladder, the six source layers and the snapshot lifecycle. For building, refreshing or applying a snapshot, and for the revision log, use the `threat-context-calibration` skill.
3. For governance, risk and compliance concepts (CIA triad, fraud and risk triangles, three lines model, appetite vs tolerance, IPM cycle, KRIs, investment governance) and for the teaching description of the CRG Excel model, use the `cybersecurity-governance` skill. It holds the author's textbook; Chapter 6 covers the CRG model. If a CyberRiskGuardian project knowledge base is attached, also search it for the Excel workbook guide, scenario development guide and data classification guide, and prefer organization-supplied versions over the bundled references.
4. Review every attached organizational document **before** writing anything.
5. Ask for the assessment scope, approved risk appetite and deliverable format if not supplied. Ask once — then state assumptions and proceed.

## Non-negotiable principles

- Base conclusions on supplied evidence. **Never invent organizational facts.**
- Distinguish verified evidence, external/sector evidence, **external threat intelligence**, expert judgement, assumptions and unknowns.
- Use one time horizon — **12 months** unless specified — and identical scoring across scenarios.
- Scores are decision-support indicators, not loss probabilities or dollar predictions.
- Preserve traceability: objectives → assets → threats → vulnerabilities → scenarios → consequences → controls → scores → recommendations → budget.
- CVSS alone is never a measure of organizational risk, and never a selection criterion. **Base score only** — never Threat (`E:A`/`E:P`/`E:U`) or Environmental metrics, because the formula multiplies CVSS and `Pb(ψ,A)` and exploitation evidence counted in both compounds.
- External intelligence is evidence about the **threat environment**, never a measure of organizational risk. A threat feed must not become a risk register. It enters only as a dated, accepted snapshot; it may move `Pb(A)` and `Pb(ψ,A)` within ladder bands and only where exposure is confirmed; it never touches `δe`, `δm`, `θ` or `μ(E)`.
- Compute with tools, not by eye: use `scripts/crg_calc.py` or the `crg-calculator` MCP tools for KRIs, CVSS v4.0 scores, sensitivity and budget targets. No network call ever occurs in the calculation path.

## Workflow

**0. Threat-context freshness.** Locate the snapshot named in the assessment's `threat_context` block, or the shipped one in `examples/threat-context/`. Report its date and whether it has expired (90-day lifetime).

```
python3 scripts/threat_snapshot.py --offline <snapshot> --summary
```

Absent or expired → refresh before quantifying, with the `threat-context-calibration` skill or `/refresh-threat-context`. Proceeding on an expired snapshot fails QC. If the analyst declines to refresh, say so in the report and mark every intel-derived value **Analyst estimate — validation required**.

**1. Evidence register.** List evidence; tag each important assertion's basis, including `external-intel` with the snapshot date for anything drawn from the threat context.

**2. Organizational context.** Mission, objectives, services, critical processes, information and technology assets, architecture and maturity, cloud, identity, remote access, OT/IoT/medical devices, third parties, obligations, jurisdictions, transformation initiatives, incidents and audit findings, continuity and safety requirements. Identify **crown jewels** (owner, C/I/A, dependencies) and map Objective → Process → Primary asset → Supporting assets → Dependencies → Consequences. Capture the **confirmed technology exposure** — products, versions, internet-facing services, CVEs from scanner or CMDB evidence — because the exposure gate in step 9 depends on it.

**3. Scope and dependencies.** Scope, period, risk perspective, exclusions, assumptions, gaps. Analyse single points of failure and concentration (identity, DNS/network, cloud, virtualization, backup, telecom, privileged administration, SaaS, MSPs, software supply chain, payment providers) and flag peripheral assets.

**4. Risk appetite and materiality** on 0–1: `0.1–0.2` very high aversion · `0.3` risk averse · `0.5` neutral · `0.7` relatively high · `0.8–0.9` very high. State `Estimated Risk Appetite: X.XX` with rationale, or use the approved value. Translate appetite into materiality criteria for selection.

**5–7. Generate, construct and select scenarios** following the `scenario-selection` skill: 25–40 causal-chain candidates for a 10-scenario assessment; 12-criterion 1–5 screening with rationale; mandatory escalation flags; consolidation of variants; coverage, decision-usefulness and "why this scenario?" tests; confidence; weighting sensitivity; validators; dispositions Select / Consolidate / Consider / Defer; documented watch list.

Add an **intel-driven** generation perspective to the others: campaigns active against this sector and region, KEV additions affecting confirmed organizational technology, and ATT&CK techniques observed against comparable organizations. This perspective shapes which scenarios get written; it alters no formula and is never a selection criterion on its own.

**8. Develop each selected scenario**: ID, name, statement, objective/process, stakeholders, background, threat source and event, vulnerabilities, assets and processes, dependencies, existing controls (evidence-backed only), appetite relevance, selection rationale, evidence basis, confidence, validation needs, narrative, event sequence, consequences across all impact dimensions.

**9. Quantify on 0–1** — Pb(A), Pb(ψ,A), δe, δm, θ (higher = stronger), μ(E). For each: estimate, reading, rationale, evidence, confidence, evidence required. No false precision.

Where the snapshot bears on a scenario, calibrate `Pb(A)` and `Pb(ψ,A)` on the **Threat Evidence Ladder** — rung 1 `0.10–0.20` theoretical · rung 2 `0.30–0.40` known activity · rung 3 `0.50–0.60` relevant active campaigns · rung 4 `0.70–0.80` confirmed exploitation of relevant technology · rung 5 `0.90–1.00` direct organizational evidence. A rung yields a **band**, never a decimal. Record a `threat_basis` block per changed parameter: value before and after, rung, evidence with dates, the exposure evidence, and confidence.

Two rules bite here. **Exposure gate**: exploitation evidence with no organizational evidence of exposure changes nothing — record it on the watch list. **Rung 5 is an incident**, not a prospective risk: invoke incident response and treat the assessment of that scenario as a post-incident exercise. And `δe`, `δm`, `θ` and `μ(E)` are properties of the organization — no feed informs them.

**10. CVSS v4.0 Base score** (unless the workbook specifies another version) for a specific or defensible representative weakness; document vector, score and each metric choice. Do not set Threat or Environmental metrics — exploitation evidence belongs in `Pb(ψ,A)`. Label limited applicability rather than fabricating a vulnerability.

**11. Calculate the KRIs** with the workbook's formulas as authoritative (see `references/crg-formulas-and-workbook.md`). Show every calculation; never silently change a formula; keep the factor constant; keep reductions within 0–1. If the mitigated amount exceeds estimated risk, the reduction estimates are wrong — revise them rather than reporting a negative or absolute-valued residual. Classify residual below / approximately at / above tolerance and explain what it means for management.

**12–14. Mitigation, shared controls, residual risk.** Balanced packages across governance, prevention, detection, response, recovery and resilience; costed initiatives with owners, timing, probability and impact reduction, evidence and confidence; shared controls costed once and allocated; recalculated residual; options where insufficient (mitigate further, avoid, transfer, accept formally, change the process, improve resilience).

**15. Sensitivity** — lower/central/higher cases (±0.10 convention) and appetite sensitivity; flag scenarios whose recommendation flips and those above tolerance even in the lower case. Include a **threat-context case**: what happens to the portfolio if an intel-derived parameter drops one ladder rung, which is the realistic failure mode when exposure evidence turns out weaker than assumed.

**16. Prioritize** on multiple dimensions, never one score; present a tiered management attention list as judgement.

**17. Investment portfolio** — initiatives with scenario IDs, owner, priority, initial and recurring cost, expected reduction, dependencies, timing, success indicators; state the financial basis.

**18. Calibrate the cybersecurity budget** with the `cyber-budget-calibration` skill: 4% risk seeking · 7.8% neutral · 12% risk averse of total IT budget incl. salaries; appetite-consistent target; risk-driven budget; implied appetite; reconciliation; project budgets; IT-budget sensitivity.

**19. KRIs** for monitoring (name, risk, method, source, owner, frequency, target, warning, critical), including cyber spend as % of IT budget, and these four from this edition:

| KRI | Target |
|---|---|
| Age in days of the threat-context snapshot in force | ≤ 90 |
| Share of material scenarios with an exposure-gated, intel-backed `Pb(ψ,A)` | ≥ 80% |
| KEV additions in the period affecting confirmed organizational technology | tracked |
| Mean time from KEV listing to remediation of affected systems | organization-specific |

**20. Revision log.** When a prior assessment exists, compare the two snapshots and the two result sets, and state for each movement whether the cause was the **threat landscape** or the **organization**. Name the scenarios that changed tolerance classification. See the `threat-context-calibration` skill for the form. This is what keeps an assessment from reading as current while resting on a stale threat picture.

## Tools bundled with this skill

- `scripts/crg_calc.py <data.json> [--appetite A] [--factor F] [--json]` — KRIs, CVSS v4.0, classification, normalized cross-check, sensitivity helpers, budget mapping (importable module). Offline and deterministic.
- `scripts/build_workbook.py <data.json> <out.xlsx> [--title T]` — standard CRG workbook with live formulas; recalculate afterwards and verify zero errors.
- `scripts/budget_calibrator.py --it-budget N [--appetite A] [--spend y1 y2 y3]` — guideline band, target and implied appetite.
- `scripts/threat_snapshot.py --refresh [--regions ca,us,eu,uk,intl] | --offline <snap> [--exposure FILE] [--summary]` — builds or inspects a dated threat-context snapshot from CISA KEV and FIRST EPSS by bulk download and local join; places exposed CVEs on the ladder. **The only component that touches the network.**
- `assets/scenario-template.json` — the data model (single source of truth for workbook and report).
- `assets/threat-context-block.json` — the optional `threat_context`, `threat_basis` and `watch_list` additions to that model.
- MCP server `crg-calculator` (plugin `.mcp.json`) — tools `crg_risk`, `cvss4_score`, `budget_target`, `budget_check`, `sensitivity`, `threat_context` (read-only against a local snapshot, no network I/O).
Dependencies: Python 3.10+, `pip install cvss openpyxl "mcp>=1.2"`; Node `docx` for Word; LibreOffice for recalculation and rendering.

## Management report

Executive summary · scope and methodology · context · risk appetite · **threat-context basis** (snapshot date, expiry, sources with versions and entry counts, regions, which scenarios carry an exposure-gated intel-backed `Pb`) · scenario selection summary · scenario portfolio table (ID, scenario, estimated, tolerated, residual, ratio, key treatment) · detailed scenarios · cross-scenario analysis · **revision log** · **watch list** (exploitation evidence with no confirmed exposure, named so management sees what was considered and consciously excluded) · treatment portfolio · cybersecurity budget · roadmap (0–90 days, 3–6, 6–12, 12–24 months) · KRIs · assumptions and limitations · management decisions required.

## Quality control before delivering

Organization-specific causal chains · threats not confused with vulnerabilities or scenarios · all candidates screened with rationale · escalation flags reviewed · variants consolidated · coverage tested · why-test passed · consequences present · controls evidence-backed · values justified · common horizon · **snapshot present, not expired, and every intel-derived change carrying an exposure note** · **no CVSS Threat or Environmental metrics** · **no feed influence on δe, δm, θ or μ(E)** · CVSS appropriate and not used for selection · mitigation effectiveness documented · mitigated amount not exceeding estimated risk · consistent cost basis · no double-counting · residual compared to tolerated · budget within 4–12% and consistent with appetite, or the inconsistency escalated · assumptions and gaps visible · AI estimates labelled · workbook recalculated with zero errors and cross-checked · acceptance and selection left to accountable humans.

## Output style

Write for specialists and senior management at once: clear headings, concise business language, structured tables, transparent calculations, consistent terminology. Use these markers literally where they apply:

- **Analyst estimate — validation required**
- **Evidence gap — organizational input required**
- **Management decision required**

The finished product answers: what can happen, why, what is affected, how serious, how likely **given current threat evidence**, why these scenarios, what controls exist, what treatment is available, what it costs, how much risk it removes, what remains, whether that is within tolerance, what budget is consistent with the appetite, what changed since the last assessment and whether the cause was the threat landscape or the organization, and what management should decide or fund next.
