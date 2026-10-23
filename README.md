# CyberRiskGuardian with Threat Live-feed

AI-assisted, scenario-driven cybersecurity risk assessment for Claude Code and Claude Cowork,
with **dated, traceable threat-intelligence calibration**. The agent acts as a Senior
Cybersecurity Risk Analyst and covers the whole assessment:

- selecting scenarios, including an intel-driven generation perspective;
- calibrating likelihood against current exploitation evidence (CISA KEV, FIRST EPSS);
- quantifying risk with the CyberRiskGuardian formulas (risk indices) and CVSS v4.0 Base scores, every input validated;
- comparing residual risk with appetite;
- designing the treatment portfolio;
- calibrating the budget to appetite;
- producing management reports with a **threat-driven revision log**, a one-table quick scan, and a label check for the three standard markers;
- optionally, reading legal applicability, control evidence, findings, compliance posture and
  detection and response readiness from the **CyberRiskGuardian Ontology (CRGO 0.10.0)** and writing
  results back to it as *proposed* — see
  [below](#cyberriskguardian-ontology-crgo--optional).

People stay accountable for validation and risk decisions.

Methodology and textbook © Marc-André Léger, licensed under **CC BY-NC 4.0**. Plugin version **1.6.0**
(October 2026), aligned with the textbook *Introduction to Cybersecurity Governance for Business Technology
Management*, 3rd ed., **v2.51**; desktop application **1.8.1 Beta** — see below. Product site:
[cyberriskguardian.ca](https://cyberriskguardian.ca) · licence enquiries: sales@cyberriskguardian.ca.

## Relationship to the base edition

This repository derives from **CyberRiskGuardian v1.1.0**
([`ITriskMgr/CyberRiskGuardian`](https://github.com/ITriskMgr/CyberRiskGuardian)), which remains
unchanged and continues to be the stable edition.

| | Base edition | This edition |
|---|---|---|
| Repository | `CyberRiskGuardian` | `CyberRiskGuardian_ThreatIntel` |
| Plugin id | `cyberriskguardian` | `cyberriskguardian-threatintel` |
| Version | 1.1.0 | 1.6.0 |
| Formulas | identical | identical (package reductions combined with the product rule 1 − ∏(1 − rᵢ)) |
| MediBec baseline | 84,305 / 41,023 with S2/S8 scored AV:L | **84,305 / 41,023** |
| Threat calibration | — | snapshot lifecycle, Threat Evidence Ladder, revision log |
| Ontology (CRGO) | — | optional: dss/v1 risk context and proposed write-backs (1.3.0); compliance/v1 and secops/v1 reads (1.4.0) |

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
re-runs here with identical totals (as long as both editions carry the same MediBec vectors). The `threat_context` block is optional and absent by default.
That makes this edition a **drop-in replacement** rather than a companion: there is no reason to
run both at once.

## Desktop application — try it without installing anything else

**[CyberRiskGuardian Desktop 1.8.1 Beta](desktop/)** is a standalone edition of the same method that
runs entirely in your browser, offline, with your data staying on your computer. It includes the
**Security Policy Writer** (it drafts the policy set in English and French for ISP management) and a
**Claude Dashboard** pack for the KRI dashboard (built in Claude with the `crg-dashboard` skill). It needs neither this
plugin nor an AI provider, and it shares the engine: the MediBec baseline is the same
**84,305 / 41,023**, checked at every start. See [`desktop/README.md`](desktop/README.md) for what this version adds.

| | |
|---|---|
| **Installable version** | [`desktop/dist/CyberRiskGuardian_Desktop_v1.8.1-beta.zip`](desktop/dist/CyberRiskGuardian_Desktop_v1.8.1-beta.zip) — everything included |
| **Installation instructions** | [`desktop/app/INSTALL.md`](desktop/app/INSTALL.md) — English and French · [print version, Windows and macOS side by side](desktop/app/INSTALL-Windows-macOS-EN-FR.pdf) |
| **What it does** | [`desktop/README.md`](desktop/README.md) · the full guide in [`desktop/app/USER-GUIDE.md`](desktop/app/USER-GUIDE.md) |

Unpack the zip, double-click `start.bat` (Windows) or `start.command` (macOS), and check that the
footer reads `engine verified · 84,305 / 41,023` before trusting any number. You need a current
browser and Python 3 — no account, no licence key, no installer, no administrator rights. It must be
served over `http://`, which the launchers do on `127.0.0.1` only; double-clicking `index.html` does
not work.

**This is a beta (1.8.x), anyone interested can test it, and feedback is welcome** — what the footer said at first
start, anything that did not open, any wording that is wrong for how you actually work, anything in
the French interface that reads badly. Open an issue, or write to sales@cyberriskguardian.ca.

## Editions

The method is the same in every edition (textbook v2.51, appendix §Editions):
- **Community Edition** (free, CC BY-NC 4.0) — this repository and the base repository: students for their own
  coursework, including graded work; non-profit organizations for their own risk; instructors may adapt the free
  materials for non-commercial teaching, with attribution.
- **Educational edition** (Educational Licence) — colleges, CEGEPs and universities as institutions, at a reduced
  price, with installation and customization, the current desktop application and the Educator Edition of the
  teaching materials.
- **Professional editions** — companies, consultants, MSSPs and government bodies.

The desktop application has its own licence (see `desktop/app/LICENSE`). Product information:
[cyberriskguardian.ca](https://cyberriskguardian.ca); licence enquiries: sales@cyberriskguardian.ca.

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
├── .mcp.json                     # Project MCP config: crg-calculator, and crgo-ontology (CRGO clone)
├── .claude/
│   ├── settings.json             # Model, output style, env defaults, permissions, SessionStart and label-check hooks
│   ├── rules/                    # evidence discipline, data protection, threat intel (ten rules), workbook, report, maintenance
│   └── skills/ commands/ agents/ output-styles/ hooks/   # (synced from the plugin)
├── .claude-plugin/marketplace.json
├── plugins/cyberriskguardian-threatintel/        # THE PLUGIN — single source of truth
│   ├── .claude-plugin/plugin.json
│   ├── hooks/{hooks.json, session-context.md, check_labels.py}   # guardrails + label check
│   ├── commands/                 # risk-assessment, crg-quick-scan, select-scenarios, crg-calc, calibrate-budget,
│   │                             # qc-review, label-check, refresh-threat-context, crg-dashboard
│   ├── mcp/crg_server.py         # crg-calculator MCP server (offline)
│   └── skills/
│       ├── cyber-risk-assessment/
│       │   ├── references/threat-context.md        # constraints, ladder, six source layers
│       │   ├── references/crgo-integration.md      # CRGO 0.10.0: dss/v1, compliance/v1, secops/v1
│       │   ├── scripts/crg_calc.py, test_crg_calc.py # engine (validated inputs) and its self-checks
│       │   ├── scripts/threat_snapshot.py          # the only component that touches the network
│       │   ├── scripts/crgo_contract.py            # CRGO bridge: graph, context, submit (proposed), compliance, secops
│       │   ├── scripts/test_crgo_contract.py       # CRGO acceptance checks
│       │   └── assets/threat-context-block.json    # data-model additions
│       ├── cybersecurity-governance/            # the textbook v2.51 as a reference skill
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

## CyberRiskGuardian Ontology (CRGO) — optional

Since version 1.4.0 the plugin can work with the **CyberRiskGuardian Ontology** (CRGO), a separate OWL 2 ontology and
local MCP server by the same author. CRGO states facts, links and their review status — legal
applicability (Loi 25, A-2.1, R-22.1, PIPEDA, OSFI B-13, GDPR, C-1.1), control assessments by
assessor line, audit findings, incidents, typed mappings to ATT&CK, CSF 2.0, SP 800-53 and ISO/IEC
27002 and, from CRGO 0.10.0, the organisation's compliance posture (obligations, evidence status,
exceptions, deadlines, findings) and detection and response readiness (coverage validated by test,
detection gaps, telemetry health, playbook simulations, approval gaps, regulatory triage) — and
**never computes risk**. Every number still comes from `crg_calc.py`, so the formulas
and the MediBec baseline (84,305 / 41,023) are unaffected by CRGO. Without CRGO, nothing changes. Like the
rest of this edition, the integration is a **beta**: validate every output before
organizational use.

**Set up** (pin tag **v0.10.0**). The dss/v1 commands (`graph`, `context`, `submit`) still work with
v0.9.1 (v0.9.0 lacks the bridge fix); `compliance` and `secops` need v0.10.0 and stop with a clear
message on an older checkout:
```bash
# inside this repository's folder; CyberRiskGuardian-Ontology*/ is git-ignored
git clone --branch v0.10.0 --depth 1 https://github.com/ITriskMgr/cyberriskguardian-ontology CyberRiskGuardian-Ontology-0.10.0
pip install "mcp>=1.2" pyoxigraph rdflib jsonschema
```
The first CRGO call builds a local store (about 10 s).

| Where | How CRGO is found |
|---|---|
| Project `.mcp.json` | `./CyberRiskGuardian-Ontology-0.10.0/pipeline/mcp/crgo_server.py` |
| Plugin `.mcp.json` | `${CRGO_HOME:-./CyberRiskGuardian-Ontology-0.10.0}/pipeline/mcp/crgo_server.py` — set **`CRGO_HOME`** to the checkout's absolute path when the clone is elsewhere (Claude Code expands `${VAR}` and `${VAR:-default}` in `.mcp.json`) |
| `crgo_contract.py` and its test | `--crgo <path>`, else `$CRGO_HOME` |

**Use** (all outputs go to the git-ignored `output/crgo/`; they are client data and belong with the
confidential deliverables, never in this repository or CRGO's):
```bash
S=plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts
python3 $S/crgo_contract.py graph <assessment>.json --base https://<org-namespace>/ --org-label "<Org>"
python3 $S/crgo_contract.py context --graph output/crgo/<org>.ttl --scenario S1 --summary
python3 $S/crgo_contract.py submit --graph output/crgo/<org>.ttl --assessment <assessment>.json \
        --scenarios S1,S2 --kinds residual-risk,risk-to-tolerance-ratio --actor "<analyst>"
python3 $S/crgo_contract.py compliance --graph output/crgo/<org>.ttl --as-of <date> --summary   # CRGO >= 0.10.0
python3 $S/crgo_contract.py secops --graph output/crgo/<org>.ttl --as-of <date> --summary       # CRGO >= 0.10.0
python3 $S/test_crgo_contract.py --crgo CyberRiskGuardian-Ontology-0.10.0    # acceptance checks
```

Rules that come with it: write-backs are always *proposed* and never an approval, acceptance or
funding decision; organisation IRIs use the organisation's own base, never `https://w3id.org/crgo/`;
*supports compliance* is not compliance; EPSS is not a scenario likelihood; unknown applicability stays
an information gap and *potentially applicable* needs qualified review; licensed standards (IIA, ISACA,
AICPA, COSO, ISO) appear only as identifiers, official headings and CRGO paraphrases. With 0.10.0: a
mapping, policy statement, acknowledgement or attestation is never compliance; an alert or indicator
match is never an incident or attribution; nothing CRGO returns authorises a response action; coverage
is validated only by an effective detection test; source confidence is not a probability; TLP markings
are respected; ISO 37301, IIA, ISACA stay identifiers and paraphrases. Reports cite the CRGO release
("CRGO v0.10.0, ontology release 0.10.0"). Details:
`plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/references/crgo-integration.md`.

## Use

| Ask or run | What happens |
|---|---|
| "Create 10 risk scenarios for <org> and complete a risk assessment" / `/risk-assessment` | Full workflow: context, threat-context check, selection, quantification, treatment, budget, report and workbook |
| "Refresh the threat intelligence" / `/refresh-threat-context` | New snapshot, exposure-gated recalibration of `Pb(A)` and `Pb(ψ,A)`, revision log |
| "Is this assessment still current?" | Snapshot age, what moved since the last snapshot, and why |
| "Select the most material scenarios" / `/select-scenarios` | Sections A–E scenario-selection workbook |
| "Give me a quick scan of <org>" / `/crg-quick-scan` | 25–40 candidates screened on 12 criteria, 10 selected, one table with the pre-treatment ratio and verdict (no treatment) |
| "Determine the appropriate cybersecurity budget" / `/calibrate-budget` | Current spending plus portfolio against the appetite-consistent point target (12% / 7.8% / 4% of IT budget at appetite 0.30 / 0.50 / 0.70, linear), gap and implied appetite |
| `/crg-calc …` | Risk indices for one scenario (validated inputs, CVSS recomputed from the vector, cost-effectiveness) |
| `/label-check <files>` | Flags missing markers (*Analytical estimate — validation required*, *Information gap — organizational validation required*, *Management decision required*) and outdated wording; also runs as PostToolUse and Stop hooks |
| `/qc-review <files>` | Independent read-only review, including snapshot freshness, the exposure gate and, with CRGO, write-backs and applicability wording |
| "What obligations apply and how good is the control evidence for S1?" (CRGO connected) | `crgo_risk_context`: Legal applicability table and Control evidence by assessor line; no risk score |
| "What is our compliance posture and detection readiness at the assessment date?" (CRGO 0.10.0) | `crgo_compliance_context` / `crgo_secops_context`: Compliance posture and Detection and response readiness tables; gaps reported as gaps, approval gaps as audit signals |

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
3. Regression-check: `crg_calc.py examples/medibec/source/medibec30.json` must report total
   estimated **84,305** and residual **41,023** with no `threat_context` block, and
   `test_crg_calc.py` must pass.
4. Confirm `threat_snapshot.py --offline` works with networking disabled, and that no network
   import exists in `crg_calc.py`, `build_workbook.py`, `budget_calibrator.py` or the `crg_risk`
   MCP path.
5. With a CRGO v0.10.0 checkout, run `test_crgo_contract.py --crgo <path>`; all checks must pass.
6. Regenerate the shipped snapshot if it is over 90 days old.
7. Bump the version (semver) in `plugin.json` and `marketplace.json`.

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
and third-party material. CRGO is a separate work, also under CC BY-NC 4.0, and is not
redistributed here.
