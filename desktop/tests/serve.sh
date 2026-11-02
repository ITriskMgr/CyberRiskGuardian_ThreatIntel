#!/bin/bash
# (Re)start the helper for the test suites: app + API on the port of CRG_URL, with this run's folders.
# Same defaults as lib.mjs. Kills only the helper on that port (by port, then by command line), never another.
# CRG_UPDATE_URL, when set, points the update check at the mock GitHub API (t29).
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
URL="${CRG_URL:-http://127.0.0.1:8099/}"
PORT="$(python3 -c "import sys,urllib.parse as u;print(u.urlsplit(sys.argv[1]).port or 80)" "$URL")"
APP="${CRG_APP_DIR:-$HERE/../app}"
TMPD="${CRG_TMP:-$HERE/.tmp}"
export CRG_FEEDS_DIR="${CRG_FEEDS_DIR:-$TMPD/feeds}"
export CRG_ORG_DIR="${CRG_ORG_DIR:-$TMPD/orggraphs}"
export CRG_KEYS_DIR="${CRG_KEYS_DIR:-$TMPD/keys}"
export CRG_AI_MOCK="${CRG_AI_MOCK:-$HERE/mock}"
export CRGO_HOME="${CRGO_HOME:-$HERE/../../CyberRiskGuardian-Ontology-0.10.1}"
LOG="${CRG_SERVE_LOG:-$TMPD/serve-$PORT.log}"
mkdir -p "$TMPD" "$CRG_FEEDS_DIR" "$CRG_ORG_DIR"
(fuser -k "$PORT/tcp" >/dev/null 2>&1 || pkill -f "serve.py $PORT\$" >/dev/null 2>&1) ; sleep 0.5
cd "$APP"
nohup python3 serve.py "$PORT" > "$LOG" 2>&1 &
for i in $(seq 1 40); do
  curl -s -o /dev/null "http://127.0.0.1:$PORT/" && exit 0
  sleep 0.25
done
echo "serve.sh: the helper did not start on port $PORT; see $LOG" >&2
exit 1
