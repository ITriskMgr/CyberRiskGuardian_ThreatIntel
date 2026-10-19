# CLAUDE.md — CyberRiskGuardian with Threat Live-feed

@AGENTS.md

## Claude Code specifics

### Components in this project
| Component | Location | Purpose |
|---|---|---|
| Skills | `.claude/skills/` (source: `plugins/cyberriskguardian-threatintel/skills/`) | `cyber-risk-assessment`, `threat-context-calibration`, `scenario-selection`, `cyber-budget-calibration`, `cybersecurity-governance`, `crg-dashboard`. They auto-trigger on risk-assessment, threat-intelligence, scenario-selection, budget, governance-concept and dashboard-pack requests. |
| Commands | `.claude/commands/` | `/risk-assessment`, `/refresh-threat-context`, `/select-scenarios`, `/calibrate-budget`, `/crg-calc`, `/qc-review`, `/crg-dashboard` |
| Subagents | `.claude/agents/` | `risk-scenario-analyst` (candidates and screening), `risk-quantifier` (parameters, CVSS, KRIs, workbook), `risk-qc-reviewer` (independent read-only review, including snapshot freshness and the exposure gate) |
| Output styles | `.claude/output-styles/` | `CyberRiskGuardian Analyst` (default via settings), `CyberRiskGuardian Executive Brief` |
| Rules | `.claude/rules/` | Evidence discipline, data protection and **threat-intel** (always); workbook, report and methodology-maintenance rules (path-gated) |
| MCP | `.mcp.json` | `crg-calculator` — tools `crg_risk`, `cvss4_score`, `budget_target`, `budget_check`, `sensitivity`, `threat_context`; `crgo-ontology` (optional, CRGO v0.10.0 clone in `./CyberRiskGuardian-Ontology-0.10.0/`) — `crgo_sweep`, `crgo_identify`, `crgo_scenario`, `crgo_controls_for_technique`, `crgo_scenarios_for_control`, `crgo_list_values`, `crgo_risk_context`, `crgo_submit_assessment`, `crgo_compliance_context`, `crgo_secops_context` |
| Settings | `.claude/settings.json` | Model, output style, environment defaults, permissions, SessionStart guardrail hook |

### How to work
- For a full assessment, follow the `cyber-risk-assessment` skill. It hands off to the others:
  - threat calibration → `threat-context-calibration`;
  - scenario selection → `scenario-selection`;
  - budget → `cyber-budget-calibration`.
- Check the threat-context snapshot **before** quantifying. Absent or over 90 days old means
  refresh first with `/refresh-threat-context`.
- Use the MCP tools or `scripts/crg_calc.py` for every number, and never compute KRIs or CVSS
  scores by hand.
- Delegation:
  - **`risk-scenario-analyst`** — the document-heavy scenario generation and screening step,
    including the intel-driven generation perspective.
  - **`risk-quantifier`** — quantification and building the workbook.
  - **`risk-qc-reviewer`** — before any board-level delivery.
- With CRGO connected, use `scripts/crgo_contract.py` (or the `crgo_risk_context` / `crgo_submit_assessment` / `crgo_compliance_context` / `crgo_secops_context` tools) per `references/crgo-integration.md`: CRGO never computes risk, write-backs stay *proposed*, compliance and secops reads are dated to the assessment date and never stand for compliance or authorisation, organisation graphs stay in git-ignored `output/crgo/`.
- Keep outputs private until the user decides to share them.
- For documents the user will edit, ask which format they want (Word/Excel files or the
  environment's document format).

### Environment defaults (from settings.json `env`)
| Variable | Default |
|---|---|
| `CRG_DEFAULT_APPETITE` | 0.30 |
| `CRG_FACTOR` | 1000 |
| `CRG_HORIZON_MONTHS` | 12 |
| `CRG_CVSS_VERSION` | 4.0 |
| `CRG_CVSS_SCOPE` | base-only |
| `CRG_SNAPSHOT_MAX_AGE_DAYS` | 90 |
| `CRG_THREAT_REGIONS` | ca,intl |

Override them in `.claude/settings.local.json`, which is never committed.

`CRGO_HOME` (not set by default) points the plugin's `crgo-ontology` server and `crgo_contract.py` to a
CRGO checkout outside the repository folder.
