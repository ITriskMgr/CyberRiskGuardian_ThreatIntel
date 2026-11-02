#!/bin/bash
# Restart the helper with the update check pointed at the mock GitHub API ($1 = URL). See serve.sh.
CRG_UPDATE_URL="$1" exec bash "$(dirname "$0")/serve.sh"
