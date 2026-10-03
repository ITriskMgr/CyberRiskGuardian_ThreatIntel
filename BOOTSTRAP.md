# Bootstrap — bringing the v1.1.0 base files into this repository

This repository contains everything that is **new or changed** in the threat-intelligence
edition. The base methodology, calculators, example and textbook are unchanged from
CyberRiskGuardian v1.1.0 and must be copied in once, so that this repository is self-contained
and installable on its own.

Run this from the parent directory that holds both clones:

```bash
git clone https://github.com/ITriskMgr/CyberRiskGuardian.git
git clone https://github.com/ITriskMgr/CyberRiskGuardian_ThreatIntel.git
cd CyberRiskGuardian_ThreatIntel
bash scripts/bootstrap-from-upstream.sh ../CyberRiskGuardian
```

## What the script copies

| From v1.1.0 | To this repository |
|---|---|
| `LICENSE` | `LICENSE` (replaces the bootstrap stub — required before release) |
| `package.json` | `package.json` |
| `scripts/sync-project-config.sh` | kept, this edition's version is already present |
| `plugins/cyberriskguardian/skills/cyber-risk-assessment/SKILL.md` | `plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/SKILL.md` |
| `…/cyber-risk-assessment/references/` (master-task-spec.md, crg-formulas-and-workbook.md, deliverables.md) | same path under this plugin — **do not overwrite `threat-context.md`** |
| `…/cyber-risk-assessment/scripts/` (crg_calc.py, build_workbook.py, budget_calibrator.py) | same path — **do not overwrite `threat_snapshot.py`** |
| `…/cyber-risk-assessment/assets/` (scenario-template.json) | same path — **do not overwrite `threat-context-block.json`** |
| `…/skills/scenario-selection/` | `…/skills/scenario-selection/` |
| `…/skills/cyber-budget-calibration/` | `…/skills/cyber-budget-calibration/` |
| `…/skills/cybersecurity-governance/` (including the textbook chapters) | `…/skills/cybersecurity-governance/` |
| `…/commands/` (risk-assessment, select-scenarios, calibrate-budget, crg-calc, qc-review) | `…/commands/` — **do not overwrite `refresh-threat-context.md`** |
| `…/agents/` | `…/agents/` |
| `…/output-styles/` | `…/output-styles/` |
| `…/mcp/crg_server.py` | `…/mcp/crg_server.py` |
| `.claude/rules/` (evidence-discipline, data-protection, workbook, report, maintenance) | `.claude/rules/` — **do not overwrite `threat-intel.md`** |
| `examples/medibec/` | `examples/medibec/` |

## Manual steps the script cannot do

1. **`mcp/crg_server.py`** — paste the `threat_context` tool from
   `mcp/threat_context_tool.py.snippet` into the copied server, then delete the snippet.
2. **`AGENTS.md`** — already merged in this repository. Do not copy the upstream version over it.
3. **`CLAUDE.md`** — already adapted. Do not copy the upstream version over it.
4. **`skills/cyber-risk-assessment/SKILL.md`** — after copying, add to the workflow:
   - a threat-context freshness check before quantification (step 0);
   - the intel-driven generation perspective;
   - the revision log and watch list in the reporting step.
5. **`.claude/rules/evidence-discipline.md`** — add the `external-intel` provenance tag.
6. **`risk-qc-reviewer`** — add the three snapshot checks: present, not expired, exposure-gated.
7. **The shipped snapshot** — generate it:
   ```bash
   python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/threat_snapshot.py \
           --refresh --regions ca,intl -o examples/threat-context/threat-context-shipped.json
   ```
   Expect roughly 15–30 MB (about 1,400 KEV entries plus around 290,000 EPSS scores). If that is
   too large to commit comfortably, keep KEV in full and prune EPSS rows below 0.01;
   `classify()` degrades gracefully when a CVE is absent from the EPSS table.

### macOS: certificate verification

The python.org build of Python on macOS ships without root certificates, so
`threat_snapshot.py --refresh` fails with `CERTIFICATE_VERIFY_FAILED`. Install them once:

```bash
/Applications/Python\ 3.x/Install\ Certificates.command
```

The script also uses `certifi` when it is importable, which `pip install -r requirements.txt`
provides. Never work around this by disabling verification: a threat-intelligence snapshot you
cannot authenticate is worthless as evidence.

## Verify before the first push

```bash
claude plugin validate plugins/cyberriskguardian-threatintel/.claude-plugin/plugin.json
claude plugin validate .claude-plugin/marketplace.json

# the baseline must be untouched
python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/crg_calc.py \
        examples/medibec/source/medibec30.json            # 84,491 / 41,104

# the snapshot must work with no network
python3 .../threat_snapshot.py --offline examples/threat-context/threat-context-shipped.json --summary

# no network in the calculation path
grep -nE 'urllib|requests|httpx|socket' \
     plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/crg_calc.py \
     plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/build_workbook.py \
     plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/budget_calibrator.py \
     plugins/cyberriskguardian-threatintel/mcp/crg_server.py | grep -v threat_context

bash scripts/sync-project-config.sh
```

The last `grep` should return nothing except the `threat_context` tool's own import of
`threat_snapshot`, which is a local module import and not network access.
