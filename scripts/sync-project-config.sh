#!/usr/bin/env bash
# Mirror the plugin's components into .claude/ so the repository also works as a plain
# Claude Code project. The plugin remains the single source of truth.
set -euo pipefail

SRC="plugins/cyberriskguardian-threatintel"
[[ -d "$SRC" ]] || { echo "error: run from the repository root." >&2; exit 1; }

for part in skills commands agents output-styles; do
  if [[ -d "$SRC/$part" ]]; then
    rm -rf ".claude/$part"
    mkdir -p ".claude/$part"
    cp -R "$SRC/$part/." ".claude/$part/"
    echo "synced .claude/$part"
  fi
done

mkdir -p .claude/hooks
[[ -f "$SRC/hooks/session-context.md" ]] && cp -p "$SRC/hooks/session-context.md" .claude/hooks/ \
  && echo "synced .claude/hooks/session-context.md"

echo "Rules and settings are project-level and are not synced."
