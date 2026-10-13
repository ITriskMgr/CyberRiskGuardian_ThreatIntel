---
paths:
  - "plugins/**"
  - ".claude/skills/**"
  - ".claude/agents/**"
  - ".claude/commands/**"
  - ".claude/output-styles/**"
---

# Methodology maintenance

- `plugins/cyberriskguardian-threatintel/` is the single source of truth. Edit there, then run `bash scripts/sync-project-config.sh` to refresh `.claude/`.
- Bump `version` in `plugins/cyberriskguardian-threatintel/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` for any behaviour change (semver).
- Validate before release: `claude plugin validate plugins/cyberriskguardian-threatintel/.claude-plugin/plugin.json` and `claude plugin validate .claude-plugin/marketplace.json`.
- Re-run the regression check: `python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/crg_calc.py examples/medibec/source/medibec30.json` must reproduce total estimated 84,491 and residual 41,104.
- With a CRGO checkout (tag v0.10.0) available, also run `python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/test_crgo_contract.py --crgo <path>`: every check must pass, and it must leave no `.ttl` or result file in the repository.
- Never change a CRG formula silently; record methodology decisions in `master-task-spec.md` ("Resolved methodology choices").
