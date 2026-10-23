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
- Re-run the regression check: `python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/crg_calc.py examples/medibec/source/medibec30.json` must reproduce total estimated 84,305 and residual 41,023, and `python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/test_crg_calc.py` must pass (regression, book ch06 worked example, validation, product rule, budget point targets).
- Never hand-edit a total in examples, docs or tests: change the inputs (`examples/medibec/source/data.py`, `new_scen.py`), regenerate with `python3 data.py && python3 data30.py && python3 budget.py`, and rebuild the deliverables as `examples/medibec/README.md` describes.
- Run the label check on any changed deliverable: `python3 plugins/cyberriskguardian-threatintel/hooks/check_labels.py <files>`.
- Keep wording aligned with the book (v2.51): three markers, 19 steps, 25–40 candidates (never fewer than 20), 12 screening criteria, five generation strategies, risk indices vs KRIs, budget point targets 12% / 7.8% / 4%. CRG wins on method; the book gets an erratum.
- With a CRGO checkout (tag v0.10.0) available, also run `python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/test_crgo_contract.py --crgo <path>`: every check must pass, and it must leave no `.ttl` or result file in the repository.
- Never change a CRG formula silently; record methodology decisions in `master-task-spec.md` ("Resolved methodology choices").
