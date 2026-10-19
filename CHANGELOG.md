# Changelog

All notable changes to **CyberRiskGuardian with Threat Live-feed**.
Lineage: derived from CyberRiskGuardian v1.1.0, which remains the stable edition.

## 1.5.0 — 2026-10-19

Plugin 1.5.0, with CyberRiskGuardian Desktop **1.7.0 Beta** (Security Policy Writer 0.1.0 Beta and the Claude
Dashboard pack). No formula change; MediBec regression unchanged (84,491 / 41,104).

### Added
- Skill **`crg-dashboard`** and command **`/crg-dashboard`**: build or refresh a Claude Dashboard (dashboard
  artifact on claude.ai) from the dashboard pack the desktop exports (KRI dashboard → Claude Dashboard):
  datasets attached with the manifest's titles, descriptions and dates; the pack's page installed; reading
  rules stated (relative indicators, estimates to validate, acknowledgement is not compliance).
- Desktop 1.7.0: **Governance → Security Policy Writer** (drafts the policy set for ISP management, CRGO-based
  legal applicability and control links, facts from documents with OCR, Accept all suggestions, Word export and
  re-import) — see `desktop/app/CHANGELOG.md`.

## 1.4.0 — 2026-10-13

Uses the **CyberRiskGuardian Ontology (CRGO) v0.10.0** (pinned tag `v0.10.0`): its read-only
contracts **compliance/v1** and **secops/v1** feed the compliance posture and the detection and
response evidence of an assessment. Additive and optional. No formula change; MediBec regression
unchanged (84,491 / 41,104). The dss/v1 commands still work with CRGO v0.9.1; the new reads need
v0.10.0 and stop with a clear message (exit 4) on an older checkout.

### Added
- `crgo_contract.py compliance` and `secops`: call CRGO's `crgo_compliance_context` /
  `crgo_secops_context` functions (`org_graph_files`, `organization`, `as_of`) for the assessment
  date, validate against the contract schema and save the JSON in git-ignored
  `output/crgo/<org>-<contract>-<as-of>.json`; `--summary` prints the **Compliance posture** and
  **Detection and response readiness** tables and the gaps. Contract errors
  (`UNKNOWN_ORGANISATION`, `REFERENCE_NAMESPACE`, `SCHEMA_INVALID`) are printed verbatim, nothing is
  saved, exit 3, never retried.
- Report template (`deliverables.md`): *Compliance posture* (obligation, applicability, state,
  evidence status, exceptions without exemption, next deadline) and *Detection and response
  readiness* (scenario, coverage validated, gaps, playbook simulated).
- The seven rules of the 0.10.0 brief (section 4) wherever the 0.9.1 rules are listed (SKILL.md,
  `crgo-integration.md`, `evidence-discipline.md`, AGENTS.md, README, session hook).
- `test_crgo_contract.py`: 31 new checks (53 in all) — the brief's Nordelle acceptance tests for
  2026-10-12 (s. 10 partially satisfied, s. 3.8 satisfied on evidence judged insufficient, EDR
  exception concerning s. 10 without exemption, GDPR 72-hour deadline unanswered; ransomware
  coverage validated by test, credential compromise untested with a gap, ransomware playbook not
  simulated, kiosk isolation without valid approval (expired), two incidents with undetermined GDPR
  reportability), content equal to CRGO's example documents, no validated coverage before
  2026-06-10, verbatim errors, refusal on an older CRGO, default output git-ignored.

### Changed
- `cyber-risk-assessment` workflow: evidence status as evidence gap (step 1); obligations, framework
  adoptions, deadlines, exceptions without exemption, overdue findings, open regulatory triage
  (step 2); coverage, telemetry health, playbook simulations and approval gaps as control evidence
  (step 8); lower confidence, no numbers from CRGO, source confidence not a probability (step 9);
  new treatment candidates (steps 12–14); approvals stay human (steps 16–17); QC checklist.
- Agents: `risk-scenario-analyst` (obligations, deadlines, open regulatory triage),
  `risk-quantifier` (coverage and telemetry as evidence; CRGO gives no numbers),
  `risk-qc-reviewer` (check 9: the seven rules). `/qc-review` and the session hook updated.
- Default CRGO location `./CyberRiskGuardian-Ontology-0.10.0/` in both `.mcp.json` files, README,
  AGENTS.md, CLAUDE.md, NOTICE.md, PUBLISHING.md, requirements.txt; version 1.4.0 in `plugin.json`,
  `marketplace.json`, SKILL.md metadata and `threat_snapshot.py`.

## 1.3.0 — 2026-10-12

Connects the plugin to the **CyberRiskGuardian Ontology (CRGO) v0.9.1** through the data contract
dss/v1. Additive and optional: without CRGO the workflow is unchanged. No formula change, no change
to the evidence discipline's existing rules, no breaking change to the data model. A proof of
concept, like the rest of this edition.

### Added
- `crgo-ontology` MCP server in the project `.mcp.json`
  (`./CyberRiskGuardian-Ontology-0.9.1/pipeline/mcp/crgo_server.py`) and the plugin `.mcp.json`
  (`${CRGO_HOME:-./CyberRiskGuardian-Ontology-0.9.1}/…`). Pinned to tag v0.9.1; requires
  `pip install "mcp>=1.2" pyoxigraph rdflib jsonschema`.
- `skills/cyber-risk-assessment/scripts/crgo_contract.py` — `graph` (assessment JSON → organisation
  graph with CRGO's `crg2rdf.py` and this skill's `crg_calc.py`; bases under `https://w3id.org/crgo/`
  refused; output in git-ignored `output/crgo/`), `context` (`risk_context`, validated against the
  dss/v1 schema; `--summary` prints the Legal applicability and Control evidence tables) and `submit`
  (one *proposed* write-back per scenario × quantity — estimated, tolerated, mitigated, residual,
  ratio, budget target, sensitivity case — with the plugin version, the input records and the
  SHA-256 of the exact assessment file; error documents are reported and never retried with altered
  data; placeholder model versions refused client-side).
- `skills/cyber-risk-assessment/scripts/test_crgo_contract.py` — regression and acceptance checks.
- `skills/cyber-risk-assessment/references/crgo-integration.md` — connection, rules, knowledge-status
  mapping, contract fields and error codes, applicability evaluator, control evidence, known limits.
- Report: **Legal applicability** table and **Control evidence** column with the assessor line; the
  CRGO release is cited in *scope and methodology*.
- Optional audit support: SP 800-53A objectives and the illustrative work programmes AUD-PAM-001
  and AUD-VULN-001, labelled illustrative.

### Changed
- `cyber-risk-assessment` workflow: knowledge-status mapping, evidence period, validity and custodian
  (step 1); organisation profile, applicability states, incidents and audit findings (step 2);
  CRGO candidates, `other_regimes`, EPSS/KEV as in-the-wild evidence only (steps 5–7); control status
  by assessor line with conflicts flagged (step 8); CRGO assumptions, distributions and evidence
  quality in confidence (step 9); proposed write-back after the KRIs (step 11); policy exceptions and
  expiry (steps 12–14); delegated authority for acceptance, decision records never marked approved
  (step 16); QC checklist.
- `scenario-selection` (1.1.0): applicability states and `other_regimes` in the regulatory/legal
  criterion.
- `crg-formulas-and-workbook.md`: EPSS, KEV and CRGO values are not formula inputs.
- `threat-context-calibration`: hard rule 8, EPSS is not a scenario likelihood.
- Agents `risk-scenario-analyst`, `risk-quantifier`, `risk-qc-reviewer` and `/qc-review`: CRGO
  steps and checks (write-backs proposed with model version and inputs, nothing cited as approved,
  supports ≠ compliant, EPSS not likelihood, no licensed text, client graphs out of both repositories).
- `.claude/rules/evidence-discipline.md`: knowledge status and the CRGO rules; `data-protection.md`,
  `report-conventions.md`, `methodology-maintenance.md` (also corrected to this plugin's path);
  SessionStart guardrails.
- `.gitignore`: `CyberRiskGuardian-Ontology*/` and `/output/`.
- `.claude/` re-synced from the plugin, which also brings the EPSS age guard of `threat_snapshot.py`
  and `threat-context.md` into the project copy.

### Unchanged
- All formulas, the factor of 1,000 and the 12-month horizon.
- MediBec regression: **84,491 / 41,104**, with `crg_calc.py` and through CRGO's bridge.
- CRGO computes no risk; every number comes from `crg_calc.py` or the `crg-calculator` tools.

## 1.2.0 — October 2026

First release of this edition. Additive relative to v1.1.0: no formula change, no breaking change
to the data model.

### Added
- `skills/cyber-risk-assessment/scripts/threat_snapshot.py` — builds a dated, pinned
  threat-context snapshot from CISA KEV and FIRST EPSS v4 by bulk download and local join.
  `--offline` works with no network; `--regions ca,us,eu,uk,intl` selects strategic source
  modules; `--exposure` joins a confirmed-exposure CVE list locally and places each CVE on the
  Threat Evidence Ladder.
- `skills/cyber-risk-assessment/references/threat-context.md` — the five constraints, the Threat
  Evidence Ladder, the six source layers, operational practices, snapshot lifecycle.
- `skills/threat-context-calibration/SKILL.md` — calibration workflow and the revision log.
- `commands/refresh-threat-context.md` — `/refresh-threat-context`.
- `.claude/rules/threat-intel.md` — ten enforcement rules.
- `skills/cyber-risk-assessment/assets/threat-context-block.json` — the optional `threat_context`
  and per-scenario `threat_basis` / `watch_list` data-model blocks.
- `mcp/threat_context_tool.py.snippet` — the `threat_context` MCP tool, read-only against a local
  snapshot, no network I/O.
- Eighth scenario-generation perspective: **intel-driven**.
- Four KRIs: snapshot age; share of scenarios with exposure-gated intel-backed `Pb(ψ,A)`; KEV
  additions affecting confirmed organizational technology; mean time from KEV listing to
  remediation.
- Environment defaults `CRG_CVSS_SCOPE=base-only`, `CRG_SNAPSHOT_MAX_AGE_DAYS=90`,
  `CRG_THREAT_REGIONS=ca,intl`.
- `examples/threat-context/` — the shipped snapshot, so the feature works offline on first
  install.

### Changed
- CVSS is **Base-only**. CVSS v4.0 Threat metrics (`E:A`, `E:P`, `E:U`) and Environmental metrics
  are prohibited, because the formula multiplies CVSS and `Pb(ψ,A)` and counting exploitation
  evidence in both compounds.
- Evidence discipline gains an `external-intel` provenance tag.
- `risk-qc-reviewer` and `/qc-review` fail an assessment whose snapshot is absent, expired, or
  applied without an exposure note.
- Report template: cross-scenario analysis gains **Threat-context basis**, **Revision log** and
  **Watch list**.

### Unchanged
- All formulas, the factor of 1,000 and the 12-month horizon.
- MediBec regression with no `threat_context` block: **84,491 / 41,104**.
- `crg_calc.py`, `build_workbook.py` and `budget_calibrator.py` remain offline and deterministic.
