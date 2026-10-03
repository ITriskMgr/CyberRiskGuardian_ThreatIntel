#!/usr/bin/env bash
# Copy the unchanged v1.1.0 base files from a CyberRiskGuardian clone into this repository.
# Never overwrites a file that belongs to the threat-intelligence edition.
#
# Usage: bash scripts/bootstrap-from-upstream.sh ../CyberRiskGuardian
set -euo pipefail

UP="${1:-../CyberRiskGuardian}"
SRC="$UP/plugins/cyberriskguardian"
DST="plugins/cyberriskguardian-threatintel"

[[ -d "$SRC" ]] || { echo "error: $SRC not found. Pass the path to a CyberRiskGuardian clone." >&2; exit 1; }
[[ -f "$DST/.claude-plugin/plugin.json" ]] || { echo "error: run this from the repository root." >&2; exit 1; }

# Files this edition owns. Never overwrite them.
PROTECTED=(
  "$DST/skills/cyber-risk-assessment/references/threat-context.md"
  "$DST/skills/cyber-risk-assessment/scripts/threat_snapshot.py"
  "$DST/skills/cyber-risk-assessment/assets/threat-context-block.json"
  "$DST/skills/threat-context-calibration/SKILL.md"
  "$DST/commands/refresh-threat-context.md"
  "$DST/hooks/hooks.json"
  "$DST/hooks/session-context.md"
  "$DST/.claude-plugin/plugin.json"
  "$DST/.mcp.json"
  ".claude/rules/threat-intel.md"
  ".claude/settings.json"
  "AGENTS.md" "CLAUDE.md" "README.md" "NOTICE.md" "CHANGELOG.md" "BOOTSTRAP.md" "PUBLISHING.md"
  ".claude-plugin/marketplace.json" ".gitignore" "requirements.txt"
)

is_protected() { local f="$1"; for p in "${PROTECTED[@]}"; do [[ "$f" == "$p" ]] && return 0; done; return 1; }

copy_in() {            # copy_in <src dir> <dst dir>
  local s="$1" d="$2"
  [[ -d "$s" ]] || { echo "  skip (absent upstream): $s"; return; }
  mkdir -p "$d"
  while IFS= read -r -d '' f; do
    local rel="${f#"$s"/}" target="$d/$rel"
    if is_protected "$target"; then echo "  keep  $target"; continue; fi
    mkdir -p "$(dirname "$target")"
    cp -p "$f" "$target"
    echo "  copy  $target"
  done < <(find "$s" -type f -print0)
}

echo "Bootstrapping from $UP"

for f in LICENSE package.json; do
  if [[ -f "$UP/$f" ]]; then
    if [[ "$f" == "LICENSE" ]]; then cp -p "$UP/$f" ./LICENSE; echo "  copy  LICENSE (replaces bootstrap stub)"
    else cp -p "$UP/$f" "./$f"; echo "  copy  $f"; fi
  else echo "  skip (absent upstream): $f"; fi
done

copy_in "$SRC/skills/cyber-risk-assessment"   "$DST/skills/cyber-risk-assessment"
copy_in "$SRC/skills/scenario-selection"      "$DST/skills/scenario-selection"
copy_in "$SRC/skills/cyber-budget-calibration" "$DST/skills/cyber-budget-calibration"
copy_in "$SRC/skills/cybersecurity-governance" "$DST/skills/cybersecurity-governance"
copy_in "$SRC/commands"                       "$DST/commands"
copy_in "$SRC/agents"                         "$DST/agents"
copy_in "$SRC/output-styles"                  "$DST/output-styles"
copy_in "$SRC/mcp"                            "$DST/mcp"
copy_in "$UP/.claude/rules"                   ".claude/rules"
copy_in "$UP/examples/medibec"                "examples/medibec"

cat <<'NEXT'

Done. Manual steps remain — see BOOTSTRAP.md:
  1. paste mcp/threat_context_tool.py.snippet into mcp/crg_server.py, then delete the snippet
  2. add the threat-context freshness check, the intel-driven perspective, the revision log and
     the watch list to skills/cyber-risk-assessment/SKILL.md
  3. add the external-intel provenance tag to .claude/rules/evidence-discipline.md
  4. add the three snapshot checks to the risk-qc-reviewer agent
  5. generate examples/threat-context/threat-context-shipped.json
  6. verify the MediBec baseline still reports 84,491 / 41,104
NEXT
