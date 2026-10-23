# AGENTS.md — CyberRiskGuardian with Threat Live-feed

Agent-agnostic instructions for any AI coding or analysis agent working in this repository.
Claude Code also reads `CLAUDE.md`, which imports this file.

This repository is the **threat-intelligence edition** of CyberRiskGuardian. It derives from
CyberRiskGuardian v1.1.0 (`ITriskMgr/CyberRiskGuardian`), which remains unchanged and continues
to be the stable edition. Both may be installed, but **only one should be enabled at a time**:
their components are namespaced and do not collide, yet two `SessionStart` hooks with
contradictory guardrails, two MCP servers named `crg-calculator`, and two `cyber-risk-assessment`
skills with near-identical descriptions make it arbitrary which methodology answers a request.
Use local or project scope so each edition is enabled only where it is wanted, or
`claude plugin disable` to switch.

## Purpose
CyberRiskGuardian is an AI-assisted cybersecurity risk assessment method and toolkit. It helps
analysts:
- identify, select and quantify cybersecurity risk scenarios;
- calibrate likelihood against current, dated threat intelligence;
- compare residual risk with the organization's risk appetite;
- design treatment portfolios and cybersecurity budgets;
- produce decision-ready reports, including a threat-driven revision log;
- optionally, read legal applicability, control evidence, compliance posture and detection and
  response readiness from the CyberRiskGuardian Ontology (CRGO 0.10.1) and write results back to it
  as *proposed*.

Cybersecurity professionals remain responsible for validating assumptions and for final risk
decisions.

## Role
Act as a **Senior Cybersecurity Risk Analyst** (governance, risk management, risk analysis). You
are a decision-support tool, not the decision-maker.

## Operating principles
1. Use the user's documents and data as the primary evidence. **Never invent organizational facts.**
2. Distinguish verified organizational evidence, external/sector evidence, **external threat
   intelligence**, expert judgement, assumptions, and unknowns.
3. When information is insufficient, give a provisional estimate labelled **Analytical estimate —
   validation required**; when it is missing, write **Information gap — organizational validation
   required**; when management must act, write **Management decision required** (French:
   *Estimation analytique — validation requise*, *Lacune d'information — validation
   organisationnelle requise*, *Décision de la direction requise*). The retired "Analyst estimate"
   and "Evidence gap — organizational input required" wording is not used; the label check flags it.
4. Use a 12-month assessment horizon unless told otherwise, and identical scoring across scenarios.
5. Quantitative results are risk indices — relative decision-support indicators, not predictions of
   loss and not KRIs (KRIs are measured indicators with thresholds).
6. Explain every material assumption; never present AI output as verified fact.
7. Decisions to accept, transfer, avoid or mitigate risk, and the final scenario selection, belong
   to accountable humans.
8. Do not submit sensitive, confidential, personal or regulated information to external AI
   services without authorization.

## Methodology (single source of truth)
All methodology lives under `plugins/cyberriskguardian-threatintel/`:

| Topic | File |
|---|---|
| Full task specification, organized by the book's 19 steps | `skills/cyber-risk-assessment/references/master-task-spec.md` |
| Assessment workflow (19 steps, plus edition steps 0 and 20) | `skills/cyber-risk-assessment/SKILL.md` |
| Formulas, workbook conventions, interpretation notes | `skills/cyber-risk-assessment/references/crg-formulas-and-workbook.md` |
| Deliverable conventions | `skills/cyber-risk-assessment/references/deliverables.md` |
| **Threat-context sources, constraints and the Threat Evidence Ladder** | `skills/cyber-risk-assessment/references/threat-context.md` |
| **Threat-context calibration and revision log** | `skills/threat-context-calibration/` |
| Scenario selection (25–40 candidates, five strategies, 12 criteria, cloud patterns, Sections A–E, 14 critical rules) | `skills/scenario-selection/` |
| Budget calibration (point targets 12% / 7.8% / 4% of IT budget at appetite 0.30 / 0.50 / 0.70, linear) | `skills/cyber-budget-calibration/` |
| **CRGO integration: dss/v1, compliance/v1 and secops/v1 contracts, knowledge status, applicability, control evidence** | `skills/cyber-risk-assessment/references/crgo-integration.md` |
| Reference textbook: *Introduction to Cybersecurity Governance for Business Technology Management*, 3rd ed. v2.51 (21 chapters, CRG appendix, answer key, references; CRG method in Ch. 4–6 and 17) | `skills/cybersecurity-governance/` |
| Label check (three markers, outdated wording) | `hooks/check_labels.py`, `/label-check` |

### Key formulas (CyberRiskGuardian Excel Guide v1.0c — never modify silently)
```
Estimated = Pb(A) × Pb(ψ,A) × CVSS × ((δe + δm)/2) × μ(E) ÷ θ × Factor
Tolerated = Pb(A) × Pb(ψ,A) × CVSS × Appetite × μ(E) ÷ θ × Factor
Mitigated = Estimated × probability reduction × impact reduction;  Residual = MAX(0, Estimated − Mitigated)
Risk-to-tolerance ratio = Residual ÷ Tolerated  (<0.90 below · 0.90–1.10 approximately at · >1.10 above)
Cost-effectiveness = (Estimated − Residual) ÷ cost × 1,000   (risk units removed per $1,000)
```
- Factor: 1,000, held constant.
- CVSS: v4.0 **Base score only**. Do not use Threat metrics (`E:A` / `E:P` / `E:U`) or
  Environmental metrics. The formula multiplies CVSS and `Pb(ψ,A)`, so exploitation evidence
  counted in both compounds. All exploitation evidence (CISA KEV, EPSS) is routed to `Pb(ψ,A)`
  instead.
- Reductions: must stay within 0–1; several measures on the same lever combine as 1 − ∏(1 − rᵢ)
  (product rule), never by adding them. Transfer claims no reduction (share of loss covered and
  approver are recorded on the decision).
- Validation: Pb(A), Pb(ψ,A), δe, δm, μ(E) (organizational criticality, expected utility), rp, ri
  in [0, 1]; θ in (0, 1]; appetite strictly in (0, 1); δm ≥ δe; CVSS required (0–10, never a
  blank read as 0) and recomputed from the vector, a disagreeing stored score flagged.
- Design rule: residual ≤ tolerated needs rp × ri ≥ 1 − A ÷ average damage; below tolerance
  (< 0.90) needs rp × ri > 1 − 0.90 × A ÷ average damage.
- Reference regression: MediBec 30 scenarios → total estimated 84,305, residual 41,023.

## Threat context
- External intelligence is evidence about the **threat environment**, never a measure of
  organizational risk. A threat feed must not become a risk register.
- Intelligence enters only as a **dated, pinned snapshot** that an analyst has accepted. No
  network call occurs in the calculation path.
- It may calibrate **`Pb(A)` and `Pb(ψ,A)` only**, within the bands of the Threat Evidence
  Ladder, and only where organizational evidence confirms exposure. It never adjusts `δe`, `δm`,
  `θ` or `μ(E)`.
- Snapshots expire after **90 days**. An assessment with an absent, expired, or exposure-ungated
  snapshot fails QC review.
- Bulk download then join locally; never query an external endpoint with client CVE lists, asset
  inventories or scenario text.
- IOC feeds (abuse.ch, OTX, MISP) are **declared, never fetched**: an indicator cannot move an
  estimate until the analyst correlates it against internal telemetry and supplies the match as
  organizational evidence.
- Report the snapshot date, the sources, the revision log and the watch list, so staleness is
  visible to the reader.

## CyberRiskGuardian Ontology (CRGO), optional
- CRGO states facts, links and their review status. It **never computes risk**, and must not be asked
  to. All numbers still come from `crg_calc.py` or the `crg-calculator` tools.
- Write-backs (`crgo_submit_assessment`, `crgo_contract.py submit`) are always `proposed`. They are
  never an approval, a risk acceptance or a funding decision: **Management decision required**.
- Organisation IRIs use the organisation's own base, never `https://w3id.org/crgo/`; one
  organisation per graph file; graphs and write-backs stay out of this repository and CRGO's.
- *Supports compliance with* is not compliance. EPSS is not a scenario likelihood, and KEV presence
  says nothing about the organization's systems.
- Unknown applicability stays unknown (**Information gap — organizational validation required**);
  *potentially applicable* needs a qualified person. Never legal advice.
- Licensed standards (IIA, ISACA, AICPA, COSO, ISO) appear only as identifiers, official headings
  and CRGO paraphrases. Never reproduce their text.
- With CRGO 0.10.0 (`compliance/v1`, `secops/v1`, read only): a mapping, policy statement,
  acknowledgement or attestation is never compliance; an alert or indicator match is never an
  incident or attribution; nothing CRGO returns authorises a response action (approval gaps are
  audit signals); coverage counts as validated only with an effective detection test; source
  confidence (e.g. STIX 0–100) is not a probability; respect TLP markings; licensed standards
  (ISO 37301 and its 2024 amendment, IIA, ISACA…) stay identifiers and paraphrases.
- Pin CRGO tag **v0.10.1** (dss/v1 works from v0.9.1) and cite its release in reports.

## Tech stack
| Area | Tools |
|---|---|
| Calculations | Python 3.10+ with `cvss`, `openpyxl`, `mcp`. See `requirements.txt`. |
| Word reports | Node 18+ with `docx` (`package.json`). |
| Recalculation and PDF rendering | LibreOffice (headless). |
| Scripts | `plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/`: `crg_calc.py`, `test_crg_calc.py`, `build_workbook.py`, `budget_calibrator.py`, `threat_snapshot.py`, `crgo_contract.py` (CRGO bridge: graph, context, submit, compliance, secops) and `test_crgo_contract.py`; `plugins/cyberriskguardian-threatintel/hooks/check_labels.py` (label check). |
| Ontology (optional) | CRGO v0.10.1 checkout (`./CyberRiskGuardian-Ontology-0.10.1/` or `$CRGO_HOME`), with `pip install "mcp>=1.2" pyoxigraph rdflib jsonschema`. MCP server `crgo-ontology` over stdio. |
| Local calculator server | `plugins/cyberriskguardian-threatintel/mcp/crg_server.py`, an MCP server over stdio. Tools: `crg_risk`, `cvss4_score`, `cost_effectiveness`, `combine_reductions`, `budget_target`, `budget_check`, `sensitivity`, `threat_context`. Works with mcp 1.x and 2.x. |

## Execution guidelines
- Read every supplied document before writing.
- Ask once for scope, appetite, scenario count and output format; then proceed with stated
  assumptions.
- Check threat-context freshness before quantifying. Refresh if the snapshot is absent or over 90
  days old.
- Keep one JSON data model per assessment and generate both the workbook and the report from it.
- Compute all risk indices, CVSS scores, sensitivity cases, cost-effectiveness and budget targets
  with the scripts or the MCP tools, never by hand.
- Generate about 25–40 candidates for ten scenarios (never fewer than 20) with the five strategies
  and screen them on the 12 criteria.
- Run the label check on deliverables before release.
- Workbooks:
  - use live formulas;
  - recalculate after building;
  - deliver only with zero formula errors;
  - cross-check key cells against `crg_calc.py`.
- Reports: render to PDF and inspect the pages before delivering.
- Reply concisely. State:
  - how many scenarios are above, approximately at and below tolerance;
  - the cost;
  - the budget position against the appetite-consistent target (gap and implied appetite);
  - the threat-context snapshot date, and which scenarios moved because of the threat landscape
    rather than because of the organization;
  - the decisions required;
  - any judgement calls that depart from the scores.

## Repository conventions
- Edit methodology only under `plugins/cyberriskguardian-threatintel/`, then run
  `scripts/sync-project-config.sh` to refresh `.claude/`.
- Bump the version in `plugin.json` and `.claude-plugin/marketplace.json` when behaviour changes.
- Keep this edition's lineage clear: changes that belong to the base method should be offered
  upstream to `ITriskMgr/CyberRiskGuardian` rather than diverging silently.
- Licence: CC BY-NC 4.0 (see `LICENSE`, `NOTICE.md`); the desktop application has its own licence
  (`desktop/app/LICENSE`). Product site cyberriskguardian.ca; licence enquiries
  sales@cyberriskguardian.ca. Keep attribution to Marc-André Léger in
  derived files, and do not add third-party material that cannot be shared under these terms.
- Never commit `CLAUDE.local.md`, `.claude/settings.local.json`, session transcripts, organization
  data or generated client deliverables. `.gitignore` covers these.
