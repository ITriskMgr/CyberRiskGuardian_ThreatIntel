#!/usr/bin/env bash
# CyberRiskGuardian Desktop — local launcher.
# Serves this folder over http://localhost and opens it in your browser.
# Serving is required: js/app.js is an ES module, and browsers refuse to load
# modules from file:// URLs. No network connection is used or needed.
set -euo pipefail
cd "$(dirname "$0")"

PORT="${1:-8099}"

BIND=127.0.0.1   # loopback only: the app is never exposed to the local network

if   command -v python3 >/dev/null 2>&1; then SERVE=(python3 serve.py "$PORT")   # app + download helper, 127.0.0.1 only
elif command -v python  >/dev/null 2>&1; then SERVE=(python  serve.py "$PORT")
elif command -v ruby    >/dev/null 2>&1; then SERVE=(ruby -run -e httpd . -p "$PORT" --bind-address="$BIND")
else
  echo "No local web server found."
  echo "Install Python 3 from https://www.python.org/downloads/ and run this again."
  read -r -p "Press Return to close. " _ || true
  exit 1
fi

# An earlier copy (for example version 1.0.0) may still be serving this port from another
# folder. The browser would then keep showing the old version. Stop it if it is a local
# Python/Ruby web server; otherwise ask the user to choose another port.
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null || true)"
  if [ -n "$PIDS" ]; then
    for P in $PIDS; do
      CMD="$(ps -p "$P" -o command= 2>/dev/null || true)"
      case "$CMD" in
        *http.server*|*httpd*|*serve.py*)
          echo "Port $PORT was already in use by an earlier copy of the app:"
          echo "  $CMD   (process $P, folder: $(lsof -a -p "$P" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p'))"
          echo "Stopping it so this version is the one you see."
          kill "$P" 2>/dev/null || true; sleep 1 ;;
        *)
          echo "Port $PORT is used by another program: $CMD"
          echo "Start with another port, for example:  ./start.command 8150"
          read -r -p "Press Return to close. " _ || true
          exit 1 ;;
      esac
    done
  fi
fi

URL="http://localhost:$PORT/"
echo "CyberRiskGuardian Desktop"
echo "  serving $(pwd)"
echo "  at      $URL"
echo
echo "Leave this window open while you use the app and while downloads run."
echo "Downloads go to the feeds folder shown below (~/Downloads/CyberRiskGuardian-feeds unless feeds-dir.txt says otherwise). Control-C stops."
echo

( sleep 1
  if   command -v open     >/dev/null 2>&1; then open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"
  fi ) >/dev/null 2>&1 &

exec "${SERVE[@]}"
