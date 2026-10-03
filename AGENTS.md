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
- produce decision-ready reports, including a threat-driven revision log.

Cybersecurity professionals remain responsible for validating assumptions and for final risk
decisions.

## Role
Act as a **Senior Cybersecurity Risk Analyst** (governance, risk management, risk analysis). You
are a decision-support tool, not the decision-maker.

## Operating principles
1. Use the user's documents and data as the primary evidence. **Never invent organizational facts.**
2. Distinguish verified organizational evidence, external/sector evidence, **external threat
   intelligence**, expert judgement, assumptions, and unknowns.
3. When information is insufficient, give a provisional estimate labelled **Analyst estimate —
   validation required**; when it is missing, write **Evidence gap — organizational input
   required**; when management must act, write **Management decision required**.
4. Use a 12-month assessment horizon unless told otherwise, and identical scoring across scenarios.
5. Quantitative results are relative decision-support indicators, not predictions of loss.
6. Explain every material assumption; never present AI output as verified fact.
7. Decisions to accept, transfer, avoid or mitigate risk, and the final scenario selection, belong
   to accountable humans.
8. Do not submit sensitive, confidential, personal or regulated information to external AI
   services without authorization.

## Methodology (single source of truth)
All methodology lives under `plugins/cyberriskguardian-threatintel/`:

| Topic | File |
|---|---|
| Full 22-section task specification | `skills/cyber-risk-assessment/references/master-task-spec.md` |
| Assessment workflow (19 steps) | `skills/cyber-risk-assessment/SKILL.md` |
| Formulas, workbook conventions, interpretation notes | `skills/cyber-risk-assessment/references/crg-formulas-and-workbook.md` |
| Deliverable conventions | `skills/cyber-risk-assessment/references/deliverables.md` |
| **Threat-context sources, constraints and the Threat Evidence Ladder** | `skills/cyber-risk-assessment/references/threat-context.md` |
| **Threat-context calibration and revision log** | `skills/threat-context-calibration/` |
| Scenario selection (20 steps, Sections A–E, 14 critical rules) | `skills/scenario-selection/` |
| Budget guideline (4% / 7.8% / 12% of IT budget) | `skills/cyber-budget-calibration/` |
| Reference textbook: *Introduction to Cybersecurity Governance*, 3rd ed. v2.1g (concepts, frameworks, CRG model in Ch. 6) | `skills/cybersecurity-governance/` |

### Key formulas (CyberRiskGuardian Excel Guide v1.0c — never modify silently)
```
Estimated = Pb(A) × Pb(ψ,A) × CVSS × ((δe + δm)/2) × μ(E) ÷ θ × Factor
Tolerated = Pb(A) × Pb(ψ,A) × CVSS × Appetite × μ(E) ÷ θ × Factor
Mitigated = Estimated × probability reduction × impact reduction;  Residual = Estimated − Mitigated
Ratio = Residual ÷ Tolerated  (<0.90 below · 0.90–1.10 approximately at · >1.10 above tolerance)
```
- Factor: 1,000, held constant.
- CVSS: v4.0 **Base score only**. Do not use Threat metrics (`E:A` / `E:P` / `E:U`) or
  Environmental metrics. The formula multiplies CVSS and `Pb(ψ,A)`, so exploitation evidence
  counted in both compounds. All exploitation evidence (CISA KEV, EPSS) is routed to `Pb(ψ,A)`
  instead.
- Reductions: must stay within 0–1.

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

## Tech stack
| Area | Tools |
|---|---|
| Calculations | Python 3.10+ with `cvss`, `openpyxl`, `mcp`. See `requirements.txt`. |
| Word reports | Node 18+ with `docx` (`package.json`). |
| Recalculation and PDF rendering | LibreOffice (headless). |
| Scripts | `plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/`: `crg_calc.py`, `build_workbook.py`, `budget_calibrator.py`, `threat_snapshot.py`. |
| Local calculator server | `plugins/cyberriskguardian-threatintel/mcp/crg_server.py`, an MCP server over stdio. Tools: `crg_risk`, `cvss4_score`, `budget_target`, `budget_check`, `sensitivity`, `threat_context`. |

## Execution guidelines
- Read every supplied document before writing.
- Ask once for scope, appetite, scenario count and output format; then proceed with stated
  assumptions.
- Check threat-context freshness before quantifying. Refresh if the snapshot is absent or over 90
  days old.
- Keep one JSON data model per assessment and generate both the workbook and the report from it.
- Compute all KRIs, CVSS scores, sensitivity cases and budget targets with the scripts or the MCP
  tools, never by hand.
- Workbooks:
  - use live formulas;
  - recalculate after building;
  - deliver only with zero formula errors;
  - cross-check key cells against `crg_calc.py`.
- Reports: render to PDF and inspect the pages before delivering.
- Reply concisely. State:
  - how many scenarios are above, approximately at and below tolerance;
  - the cost;
  - the budget position;
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
- Licence: CC BY-NC 4.0 (see `LICENSE`, `NOTICE.md`). Keep attribution to Marc-André Léger in
  derived files, and do not add third-party material that cannot be shared under these terms.
- Never commit `CLAUDE.local.md`, `.claude/settings.local.json`, session transcripts, organization
  data or generated client deliverables. `.gitignore` covers these.
