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

Methodology and textbook © Marc-André Léger, licensed under **CC BY-NC 4.0**. Plugin version **1.2.0**
(October 2026); desktop application **1.5.6 Beta** — see below.

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

**Install both if you like — but keep only one enabled at a time.**

Plugin components are namespaced by plugin name, so nothing collides on disk or in the command
list: you get `/cyberriskguardian:risk-assessment` and
`/cyberriskguardian-threatintel:risk-assessment` side by side. The problem is only with both
**enabled** in the same session:

| What | Why it matters |
|---|---|
| Two `SessionStart` hooks fire | Their guardrails disagree. This edition enforces CVSS Base-only and the exposure gate; the base edition knows neither |
| Two MCP servers named `crg-calculator` | Same name, both running |
| Two `cyber-risk-assessment` skills with near-identical descriptions | Ask for "a risk assessment" without naming the plugin and the choice is arbitrary — fatal for a method whose value is comparability between assessments |
| Duplicate subagent and output-style names | Ambiguous selection |
| Double context cost | An enabled plugin is in *every* session, even those that never use it |

### Choose which edition is active

- **Local scope** (cleanest): install each plugin with local scope, so each is enabled only in
  the repository where you want it. `/plugin` asks for the scope during installation.
- **Project scope**: record the choice in a repository's committed `.claude/settings.json`, so it
  applies to everyone working there.
- **Switch on demand**: `claude plugin disable` in a shell, or the **Installed** tab of `/plugin`,
  turns a plugin off without uninstalling it.
- **Project mode, no plugins at all**: open either repository directly with `claude`. Each carries
  its own `CLAUDE.md` and `.claude/`, which gives complete isolation.

Nothing in this repository changes a formula, so an assessment produced by the base edition
re-runs here with identical totals. The `threat_context` block is optional and absent by default.
That makes this edition a **drop-in replacement** rather than a companion: there is no reason to
run both at once.

## Desktop application — try it without installing anything else

**[CyberRiskGuardian Desktop 1.5.6 Beta](desktop/)** is a standalone edition of the same method that
runs entirely in your browser, offline, with your data staying on your computer. It needs neither this
plugin nor an AI provider, and it shares the engine: the MediBec baseline is the same
**84,491 / 41,104**, checked at every start.

| | |
|---|---|
| **Installable version** | [`desktop/dist/CyberRiskGuardian_Desktop_v1.5.6-beta.zip`](desktop/dist/CyberRiskGuardian_Desktop_v1.5.6-beta.zip) — about 2.4 MB, everything included |
| **Installation instructions** | [`desktop/app/INSTALL.md`](desktop/app/INSTALL.md) — English and French · [print version, Windows and macOS side by side](desktop/app/INSTALL-Windows-macOS-EN-FR.pdf) |
| **What it does** | [`desktop/README.md`](desktop/README.md) · the full guide in [`desktop/app/USER-GUIDE.md`](desktop/app/USER-GUIDE.md) |

Unpack the zip, double-click `start.bat` (Windows) or `start.command` (macOS), and check that the
footer reads `engine verified · 84,491 / 41,104` before trusting any number. You need a current
browser and Python 3 — no account, no licence key, no installer, no administrator rights. It must be
served over `http://`, which the launchers do on `127.0.0.1` only; double-clicking `index.html` does
not work.

**This is a beta and a proof of concept, and feedback is welcome** — what the footer said at first
start, anything that did not open, any wording that is wrong for how you actually work, anything in
the French interface that reads badly. Open an issue, or write to marcandre@leger.ca.

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
