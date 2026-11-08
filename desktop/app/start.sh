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

# Another copy of the app may already be serving this port — the same folder started twice, or an earlier
# version in another folder. Until 1.9.1 the launcher stopped it silently; since 1.9.2 (item 3) it asks first:
#   y  — stop the running copy and start this one (the browser then shows this version);
#   N  — leave it running, open it in the browser, and close this launcher window (the default).
# A port used by something that is not a local web server is never touched: choose another port.
# Non-interactive runs (no terminal on stdin) keep the earlier behaviour unless CRG_LAUNCH_KEEP=1 is set.
URL="http://localhost:$PORT/"
ask_replace() {   # $1 = description of the running copy; returns 0 to replace, 1 to keep
  if [ "${CRG_LAUNCH_KEEP:-}" = "1" ]; then return 1; fi
  if [ "${CRG_LAUNCH_REPLACE:-}" = "1" ]; then return 0; fi
  if [ ! -t 0 ] && [ -z "${CRG_LAUNCH_PROMPT:-}" ]; then return 0; fi    # no terminal: behave as before 1.9.2
  local a
  printf 'Stop it and start this one? [y/N] '
  read -r a || a=""
  case "$a" in y|Y|yes|YES|Yes|o|O|oui|OUI|Oui) return 0 ;; *) return 1 ;; esac
}
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null || true)"
  if [ -n "$PIDS" ]; then
    for P in $PIDS; do
      CMD="$(ps -p "$P" -o command= 2>/dev/null || true)"
      case "$CMD" in
        *http.server*|*httpd*|*serve.py*)
          DIR="$(lsof -a -p "$P" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p')"
          # the version of the running copy, read from its own js/version.js (unknown for a bare http.server folder)
          RV=""
          if [ -n "$DIR" ] && [ -f "$DIR/js/version.js" ]; then RV="$(sed -n "s/^export const VERSION = '\([0-9.]*\)'.*/\1/p" "$DIR/js/version.js" | head -1)"; fi
          echo "CyberRiskGuardian is already running (version ${RV:-unknown}, folder ${DIR:-unknown}) on port $PORT."
          echo "  $CMD   (process $P)"
          if [ -n "$DIR" ] && [ "$DIR" = "$(pwd)" ]; then echo "  It is this same folder."; fi
          if ask_replace "$CMD"; then
            echo "Stopping it so this version is the one you see."
            kill "$P" 2>/dev/null || true; sleep 1
          else
            echo "Leaving it running. Opening $URL in your browser; you can close this window."
            ( if command -v open >/dev/null 2>&1; then open "$URL"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"; fi ) >/dev/null 2>&1 || true
            exit 0
          fi ;;
        *)
          echo "Port $PORT is used by another program: $CMD"
          echo "Start with another port, for example:  ./start.command 8150"
          read -r -p "Press Return to close. " _ || true
          exit 1 ;;
      esac
    done
  fi
fi

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
