# Changelog

All notable changes to **CyberRiskGuardian with Threat Live-feed**.
Lineage: derived from CyberRiskGuardian v1.1.0, which remains the stable edition.

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
