# CLAUDE.md — CyberRiskGuardian with Threat Live-feed

@AGENTS.md

## Claude Code specifics
- Skills, commands, subagents, hooks and output styles live in `plugins/cyberriskguardian-threatintel/`
  and are mirrored to `.claude/` by `scripts/sync-project-config.sh`. Edit the source, not `.claude/`.
  Rules (`.claude/rules/`) and `.claude/settings.json` are project-level and edited in place.
- Output styles: `CyberRiskGuardian Analyst` (default) and `CyberRiskGuardian Executive Brief`.
- Do not also enable the plugin in this repository: its hooks would run twice.
- Run `risk-qc-reviewer` before any board-level delivery.
- With CRGO connected, use `scripts/crgo_contract.py` or the `crgo_*` tools per
  `references/crgo-integration.md`. Organisation graphs stay in git-ignored `output/crgo/`.
- Environment defaults are in `.claude/settings.json` `env`. Override them in
  `.claude/settings.local.json` (never committed). `CRGO_HOME` (unset by default) points to a
  CRGO checkout outside the repository (default `./CyberRiskGuardian-Ontology-0.11.2/`).
