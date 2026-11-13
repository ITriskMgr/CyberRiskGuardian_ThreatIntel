#!/bin/bash
# Run every browser suite (t*.mjs) and the helper's Python tests against the helper at CRG_URL.
#   CRG_URL=http://127.0.0.1:8101/ CRGO_HOME=/path/to/CRGO-0.11.2 bash run_all.sh [t05 t29 …]
#   CRG_PORT=8103 bash run_all.sh   (several checkouts at once: port, scratch folder and mock ports derive from it; lib.mjs)
#   (CRGO_RELEASE=0.10.1 with a 0.10.1 checkout runs the 0.10 contracts only)
# Starts the helper with serve.sh (same folders as lib.mjs), runs the suites one after the other (several
# restart the helper or share its folders), prints one line per suite and exits 1 if any failed.
set -u
cd "$(dirname "$0")"
export CRG_URL="${CRG_URL:-http://127.0.0.1:${CRG_PORT:-8099}/}"
bash serve.sh || exit 1
FAILED=()
SUITES=("$@")
[ ${#SUITES[@]} -eq 0 ] && SUITES=($(ls t[0-9][0-9]_*.mjs | sed 's/\.mjs$//'))
for s in "${SUITES[@]}"; do
  f="$(ls ${s}*.mjs 2>/dev/null | head -1)"
  [ -z "$f" ] && { echo "no suite $s"; FAILED+=("$s"); continue; }
  out="$(timeout 900 node "$f" 2>&1)"; rc=$?
  last="$(printf '%s\n' "$out" | grep -E ': [0-9]+ passed, [0-9]+ failed' | tail -1)"
  if [ $rc -ne 0 ]; then FAILED+=("$f"); printf '%s\n' "$out" | grep -E '^FAIL|Error' | head -20; fi
  echo "${last:-$f: exit $rc}"
done
echo "python: helper guard tests"
python3 -m unittest discover -s . -p "test_*.py" -q || FAILED+=("test_*.py")
if [ ${#FAILED[@]} -gt 0 ]; then echo "FAILED: ${FAILED[*]}"; exit 1; fi
echo "all suites passed"
