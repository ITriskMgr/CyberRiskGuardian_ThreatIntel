# Test procedure — CyberRiskGuardian with Threat Live-feed

How to test a release candidate on one machine, in six phases. Every command runs from the repository root unless a phase
says otherwise. CI runs the same checks (`.github/workflows/desktop-ci.yml` and `quality.yml`); this procedure is for a
local run before a release or after a change to the method, the engines or the desktop application.

## 0. Set-up (once per machine)

| Need | Command or source |
|---|---|
| Python 3.10+ with the method's packages | `pip install -r requirements.txt` (pins `cvss`, `openpyxl`, `mcp`, `certifi`) |
| The quality tools | `pip install -r requirements-dev.txt` (ruff, bandit, pre-commit); Semgrep in its own environment: `python3 -m venv ~/.venvs/semgrep && ~/.venvs/semgrep/bin/pip install -r requirements-semgrep.txt`, then put `~/.venvs/semgrep/bin` on the PATH |
| The ontology's packages | `pip install -r desktop/tests/requirements-ci.txt` (mcp, pyoxigraph, rdflib, jsonschema, python-docx) |
| CRGO 0.11.2 | `git clone --depth 1 --branch v0.11.2 https://github.com/ITriskMgr/CyberRiskGuardian-Ontology CyberRiskGuardian-Ontology-0.11.2` (git-ignored), or set `CRGO_HOME` to a checkout elsewhere |
| Node 18+ and the browser suites | `cd desktop/tests && npm ci && npx playwright install chromium` |
| Pre-commit hooks (optional) | `pre-commit install` |

Without `cvss`, the engine and cross-engine tests fail with "the cvss package is needed"; without a CRGO checkout, three
ontology screens of the smoke test fail with HTTP 502. Neither is a defect of the code under test.

## 1. Engine and method

```bash
python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/test_crg_calc.py
python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/test_cross_engine.py
python3 -I plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/test_ssvc.py
python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/crg_calc.py examples/medibec/source/medibec30.json
```

Expected: `ALL PASSED` twice, `OK` for SSVC, and the MediBec regression **84,305 estimated / 41,023 residual**.

## 2. Ontology bridge (CRGO 0.11.2)

```bash
python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/test_crgo_contract.py --crgo "$CRGO_HOME"
python3 desktop/app/tools/crgo_tbd_check.py --release --crgo "$CRGO_HOME"
```

Expected: every check passes, and no `.ttl` or result file is left in the repository (`git status` is clean).

## 3. Desktop gates

```bash
cd desktop/app
python3 tools/version_check.py      # every file agrees on the version; the Writer tree hash matches
python3 tools/label_check.py        # 0 labels and 0 menu paths outside the application
python3 tools/i18n_coverage.py      # fr: 100.0 %
python3 tools/fr_terms_check.py     # no retired French term
python3 tools/route_code_check.py   # every route has a screen code
python3 tools/csp_check.py          # 0 problems
python3 tools/cache_check.py        # 0 missing
```

## 4. Behaviour suites (browser and helper)

```bash
cd desktop/tests
CRGO_HOME=/path/to/CyberRiskGuardian-Ontology-0.11.2 bash run_all.sh            # all suites, about 60–90 minutes
CRGO_HOME=… bash run_all.sh t06 t63 t83                                          # or named suites
```

Expected: one line per suite `…: N passed, 0 failed`, then `all suites passed`. The helper's Python tests
(`python3 -m unittest discover -s . -p "test_*.py"`) run at the end and must print `OK`. Use `CRG_PORT=81xx` to run a
second checkout at the same time.

## 5. Security and code quality

```bash
pre-commit run --all-files          # ruff, bandit, Semgrep method rules, label check
```

Or one by one, as CI does:

```bash
ruff check .
bandit -q -ll -r desktop/app plugins scripts desktop/tools -x '*/node_modules/*,*/tests/*,*/test_*.py,*/crg_writer/*'
bandit -q -ll -r desktop/app/crg_writer -s B324,B314
semgrep scan --config .semgrep --metrics off --error
```

Expected: no finding. The Semgrep rules enforce the method: no network in the calculation path, CVSS Base only (no Threat
metric in a vector literal), reductions combined by the product rule, no retired marker wording.

## 6. Performance and smoke

```bash
python3 plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/test_snapshot_perf.py   # < 60 s, < 1.5 GB
cd desktop/tests && bash serve.sh && bash lighthouse.sh                                                       # Lighthouse budget
```

Then a manual smoke on the release package: start `start.command` (macOS), `start.sh` (Linux) or `start.bat` (Windows);
the footer must read `✓ Engine verified` and **Help → About & versions** `engine verified · 84,305 / 41,023 · CanaRetail
27,526 / 16,049`; **Organization → Ontology · CRGO → Connection** shows CRGO v0.11.2; **Threats & vulnerabilities →
Threat context** loads the bundled example snapshot.

## Before a release

- Plugin: `claude plugin validate plugins/cyberriskguardian-threatintel/.claude-plugin/plugin.json` and
  `claude plugin validate .claude-plugin/marketplace.json`; `python3 scripts/build_evals.py --replay`, then
  `claude plugin eval plugins/cyberriskguardian-threatintel --allow-tools Bash Read Write` (needs the model).
- Label check on every changed deliverable: `python3 plugins/cyberriskguardian-threatintel/hooks/check_labels.py <files>`.
- Record the results (suite counts, regression totals, the CRGO tag used) in the release notes.
