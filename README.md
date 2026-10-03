# CyberRiskGuardian with Threat Live-feed

AI-assisted, scenario-driven cybersecurity risk assessment for Claude Code and Claude Cowork,
with **dated, traceable threat-intelligence calibration**. The agent acts as a Senior
Cybersecurity Risk Analyst and covers the whole assessment:

- selecting scenarios, including an intel-driven generation perspective;
- calibrating likelihood against current exploitation evidence (CISA KEV, FIRST EPSS);
- quantifying risk with the CyberRiskGuardian formulas and CVSS v4.0 Base scores;
- comparing residual risk with appetite;
- designing the treatment portfolio;
- calibrating the budget to appetite;
- producing management reports with a **threat-driven revision log**.

People stay accountable for validation and risk decisions.

Methodology and textbook © Marc-André Léger, licensed under **CC BY-NC 4.0**. Version **1.2.0**
(October 2026).

## Relationship to the base edition

This repository derives from **CyberRiskGuardian v1.1.0**
([`ITriskMgr/CyberRiskGuardian`](https://github.com/ITriskMgr/CyberRiskGuardian)), which remains
unchanged and continues to be the stable edition.

| | Base edition | This edition |
|---|---|---|
| Repository | `CyberRiskGuardian` | `CyberRiskGuardian_ThreatIntel` |
| Plugin id | `cyberriskguardian` | `cyberriskguardian-threatintel` |
| Version | 1.1.0 | 1.2.0 |
| Formulas | identical | identical |
| MediBec baseline | 84,491 / 41,104 | **84,491 / 41,104, unchanged** |
| Threat calibration | — | snapshot lifecycle, Threat Evidence Ladder, revision log |

**Install one or the other, not both.** Both plugins carry a `cyber-risk-assessment` skill and
overlapping command names; installing them together makes it ambiguous which one answers. The
plugin ids differ so they can coexist in a marketplace listing, not in one project.

Nothing in this repository changes a formula, so an assessment produced by the base edition
re-runs here with identical totals. The `threat_context` block is optional and absent by default.

## What's inside

```
CyberRiskGuardian_ThreatIntel/
├── CLAUDE.md                     # Claude Code memory: imports AGENTS.md + Claude-specific components
├── AGENTS.md                     # Agent-agnostic instructions (role, principles, formulas, threat context, stack)
├── LICENSE                       # CC BY-NC 4.0
├── NOTICE.md                     # Attribution, derivation, third-party material
├── CHANGELOG.md
├── BOOTSTRAP.md                  # how to bring the v1.1.0 base files into this repository
├── PUBLISHING.md
├── .mcp.json                     # Project MCP config: local crg-calculator server
├── .claude/
│   ├── settings.json             # Model, output style, env defaults, permissions
│   ├── rules/threat-intel.md     # ten enforcement rules for threat intelligence
│   └── skills/ commands/ agents/ output-styles/   # (synced from the plugin)
├── .claude-plugin/marketplace.json
├── plugins/cyberriskguardian-threatintel/        # THE PLUGIN — single source of truth
│   ├── .claude-plugin/plugin.json
│   ├── hooks/{hooks.json, session-context.md}
│   ├── commands/refresh-threat-context.md
│   ├── mcp/threat_context_tool.py.snippet
│   └── skills/
│       ├── cyber-risk-assessment/
│       │   ├── references/threat-context.md        # constraints, ladder, six source layers
│       │   ├── scripts/threat_snapshot.py          # the only component that touches the network
│       │   └── assets/threat-context-block.json    # data-model additions
│       └── threat-context-calibration/SKILL.md
├── examples/threat-context/      # the shipped snapshot
└── scripts/{bootstrap-from-upstream.sh, sync-project-config.sh}
```

Files carried over from v1.1.0 by `scripts/bootstrap-from-upstream.sh` — the assessment,
scenario-selection, budget and governance skills, the calculators, the MCP server, the MediBec
example — are listed in `BOOTSTRAP.md`.

## Install

**Prerequisites:** Python 3.10+ (`pip install -r requirements.txt`), Node 18+ for Word reports,
LibreOffice for recalculating workbooks and rendering PDFs.

**A. Use as a project (Claude Code):** clone and open with `claude`. Approve the
`crg-calculator` MCP server when prompted.

**B. Install as a plugin:**
```bash
claude plugin marketplace add ITriskMgr/CyberRiskGuardian_ThreatIntel
claude plugin install cyberriskguardian-threatintel@cyberriskguardian-threatintel-marketplace
```

**C. Claude Cowork:** upload `cyberriskguardian-threatintel.plugin` (a zip of
`plugins/cyberriskguardian-threatintel/`) through the plugin install flow.

## Use

| Ask or run | What happens |
|---|---|
| "Create 10 risk scenarios for <org> and complete a risk assessment" / `/risk-assessment` | Full workflow: context, threat-context check, selection, quantification, treatment, budget, report and workbook |
| "Refresh the threat intelligence" / `/refresh-threat-context` | New snapshot, exposure-gated recalibration of `Pb(A)` and `Pb(ψ,A)`, revision log |
| "Is this assessment still current?" | Snapshot age, what moved since the last snapshot, and why |
| "Select the most material scenarios" / `/select-scenarios` | Sections A–E scenario-selection workbook |
| "Determine the appropriate cybersecurity budget" / `/calibrate-budget` | Appetite-consistent budget vs the 4% / 7.8% / 12% guideline |
| `/crg-calc …` | KRIs for one scenario |
| `/qc-review <files>` | Independent read-only review, including snapshot freshness and the exposure gate |

### Threat-context scripts

```bash
# Build a snapshot (bulk download, local join; nothing client-specific is transmitted)
python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/threat_snapshot.py \
        --refresh --regions ca,intl -o examples/threat-context/threat-context-$(date +%F).json

# Inspect provenance and freshness, entirely offline
python3 .../threat_snapshot.py --offline examples/threat-context/threat-context-<date>.json --summary

# Join against the CVEs the organization is confirmed to operate
python3 .../threat_snapshot.py --offline <snapshot> --exposure confirmed-cves.txt --summary
```

Regions: `ca`, `us`, `eu`, `uk`, `intl`. Global sources (KEV, EPSS) are always included.

## How threat intelligence is allowed to work

Five constraints, in full in
`plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/references/threat-context.md`:

1. **Reproducibility** — no network call in the calculation path; intelligence enters as a dated,
   accepted snapshot.
2. **No double counting** — CVSS stays Base-only; exploitation evidence goes to `Pb(ψ,A)`.
3. **Bands, not decimals** — the Threat Evidence Ladder places a scenario on a rung.
4. **Exposure gate** — no uplift without organizational evidence of exposure.
5. **No disclosure** — bulk download then local join; client CVE lists never leave the host.

`δe`, `δm`, `θ` and `μ(E)` are never adjusted from a feed. They are properties of the
organization, and no external source knows them.

### Threat Evidence Ladder (Marc-André Léger)

| Rung | Band | Evidence |
|---|---|---|
| 1 | 0.10–0.20 | Theoretical threat |
| 2 | 0.30–0.40 | Known threat activity |
| 3 | 0.50–0.60 | Relevant active campaigns |
| 4 | 0.70–0.80 | Confirmed exploitation of relevant technology |
| 5 | 0.90–1.00 | Direct organizational evidence |

Rung 5 means an **incident**, not a prospective risk: invoke incident response first.

## Maintain and release
1. Edit only under `plugins/cyberriskguardian-threatintel/`, then run
   `bash scripts/sync-project-config.sh`.
2. Validate:
   - `claude plugin validate plugins/cyberriskguardian-threatintel/.claude-plugin/plugin.json`
   - `claude plugin validate .claude-plugin/marketplace.json`
3. Regression-check: `crg_calc.py examples/medibec/source/medibec30.json` must still report total
   estimated **84,491** and residual **41,104** with no `threat_context` block.
4. Confirm `threat_snapshot.py --offline` works with networking disabled, and that no network
   import exists in `crg_calc.py`, `build_workbook.py`, `budget_calibrator.py` or the `crg_risk`
   MCP path.
5. Regenerate the shipped snapshot if it is over 90 days old.
6. Bump the version (semver) in `plugin.json` and `marketplace.json`.

## Deliberately excluded
- Live feeds inside the calculation path.
- CVSS Threat and Environmental metrics.
- Paid commercial threat feeds, and any Auth-Key credential.
- Automatic re-quantification without analyst acceptance.
- `CLAUDE.local.md`, `.claude/settings.local.json`, session transcripts, personal memory, `.env`
  files, credentials, and organization data other than the fictional MediBec teaching case.

## Licence
© 2026 Marc-André Léger. Licensed under
[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) (SPDX `CC-BY-NC-4.0`). See
`LICENSE` for the legal code and `NOTICE.md` for attribution wording, the derivation statement
and third-party material.
