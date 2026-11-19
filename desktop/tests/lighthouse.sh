#!/bin/bash
# Lighthouse budget for the desktop application (BL-23). Runs Lighthouse 12 (pinned) against the helper at CRG_URL with the
# Playwright Chromium, then checks the budget below. The application runs locally and offline, so the budget guards against
# regressions from the 1.9.3 level rather than chasing web scores: performance (simulated desktop) ≥ 0.50, accessibility
# ≥ 0.95, best practices ≥ 0.95, first contentful paint ≤ 4 s, at most 450 requests and 6 MB on the first load.
#   CRG_URL=http://127.0.0.1:8101/ bash lighthouse.sh
set -eu
cd "$(dirname "$0")"
URL="${CRG_URL:-http://127.0.0.1:8099/}"
OUT="${LH_OUT:-${TMPDIR:-/tmp}/crg-lighthouse.json}"
CHROME_PATH="${CHROME_PATH:-$(node -e "console.log(require('playwright').chromium.executablePath())")}"
export CHROME_PATH
npx --yes lighthouse@12.8.2 "$URL" --quiet --preset=desktop --only-categories=performance,accessibility,best-practices \
  --chrome-flags="--headless=new --no-sandbox" --output=json --output-path="$OUT"
python3 - "$OUT" <<'PY'
import json, sys
r = json.load(open(sys.argv[1]))
cat = {k: v["score"] for k, v in r["categories"].items()}
a = r["audits"]
req = a["network-requests"]["details"]["items"]
kb = sum(x.get("transferSize", 0) for x in req) / 1024
fcp = a["first-contentful-paint"]["numericValue"] / 1000
budget = [("performance", cat["performance"], ">=", 0.50), ("accessibility", cat["accessibility"], ">=", 0.95),
          ("best-practices", cat["best-practices"], ">=", 0.95), ("first contentful paint (s)", fcp, "<=", 4.0),
          ("requests", len(req), "<=", 450), ("transfer (KB)", kb, "<=", 6144)]
bad = 0
for name, v, op, lim in budget:
    good = v >= lim if op == ">=" else v <= lim
    bad += not good
    print(f"{'ok  ' if good else 'FAIL'} {name}: {v:.2f} (budget {op} {lim})")
print(f"LCP {a['largest-contentful-paint']['displayValue']} · TBT {a['total-blocking-time']['displayValue']} · CLS {a['cumulative-layout-shift']['displayValue']}")
sys.exit(1 if bad else 0)
PY
