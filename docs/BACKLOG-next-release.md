# CyberRiskGuardian with Threat Live-feed: consolidated backlog for the next release

State of 19 November 2026. Branch baseline: `main` at `68dd8ad` (Desktop 1.9.3 Beta + Threat Live-feed plugin 1.7.3,
CHANGELOG still *unreleased*). This list replaces the scattered sources below for planning; the detail of each item stays in
its source document.

## 0. Sources and how they were sorted

| Source | Date | Used? | Note |
|---|---|---|---|
| *CRG complete backlog — next build* (Markdown) | 8 Nov 2026 | Yes | Sections A and B were the decided 1.9.2 scope (D4); section C was out of scope |
| `BACKLOG.md` (evaluation report, French) | 18 Nov 2026 | Yes | CRG-001 … CRG-014, each checked against the repository below |
| `desktop/app/DECISIONS-1.9.2.md`, `DECISIONS-1.9.3.md`, `CHANGELOG.md` | 8–12 Nov 2026 | Yes | Open items for the author, *Not yet done*, *Known issues* |
| This session's review | 19 Nov 2026 | Yes | Smoke run, stale-reference sweep |
| *BACKLOG — complete list (2026-11-08)* (Google Doc) | 8 Nov 2026 | **No** | It is the AgentFlow+ backlog, another product |
| *BackLog_v1-0a* (Google Doc) | Oct 2026 | **No** | It is the HoroCMS backlog, another product |
| `backlog-next-build-additions.md` (C6, C7, T1–T10) | 12 Nov 2026 | Not found | Its scope is recorded as built in `CHANGELOG.md` 1.9.3 and `DECISIONS-1.9.3.md` |

**How the 8 November backlog was closed.** Every desktop and Threat Live-feed ID of sections A and B (items 1–23, C1, C2,
C4, C5, NV-001…NV-099, NV-W01…W08, NV-P03/P08–P15, NV-C01, NV-E01, X-1…X-9) is recorded as delivered in the 1.9.2
CHANGELOG. The IDs **not** found in this repository belong to other products and are carried in §6 so their status can be
checked where they live.

Status values: **Open** · **Done on branch** (not merged) · **Close** (no work; reason given) · **Verify** (status unknown
here) · **Blocked** (waits for a person, a decision or another party).
Effort: S < 1 h · M ½–1 day · L several days · XL a build of its own.

---

## Status after the backlog build of 19 November 2026

Built on branch `claude/cool-archimedes-3vnkq3` (pull request #13), each with its tests; "you" means an author action.

| Item | Status |
|---|---|
| BL-01 proposals follow the folder · BL-03 macOS guard tests · BL-04 stale CRGO refs · BL-06 Dependabot (4) · BL-06a menu paths (all 99 in messages checked) · BL-06b revision log split | **Done** |
| BL-02 full suite with CRGO 0.11.2 | **Done**: 82 suites, 3,768 checks, 0 failures; rerun on the final commit (see the PR) |
| BL-16 ruff · BL-17 bandit · BL-18 pre-commit · BL-19 test procedure (`docs/TEST-PROCEDURE.md`) · BL-21 Semgrep method rules · BL-22 snapshot performance · BL-23 Lighthouse budget (+ deferred start-page scripts, first paint −1.3 s) | **Done**; CI workflow `quality.yml` |
| BL-20 WCAG 2.1 AA | **Done**: t84 on all 159 routes, EN light and FR dark, 0 violations |
| BL-12 plugin evals | **Done**: first model run ($4.12); two plugin fixes; plugin 1.7.4 |
| BL-09 CRGO tag and approvals · BL-14 doc checks | **Done** (verified, nothing to change) |
| BL-27 book alignment | **Mostly done**: items 1 (errata applied), 4, 6, 7 (French terms and spacing, FR-4 gate), 8, 9, 10, 11 done. Open: item 12 (MCQ self-check, part of the Classroom spec), item 13 (standards baseline in policy templates — needs a design choice: catalogues or a guidance field), word-for-word re-ingest of the published v2.51b |
| BL-07 launcher check · BL-08 signing key · BL-10 French read-through · BL-13 larger local models · BL-15 CIS | **Ready for you**: `docs/AUTHOR-KITS.md` (one-command signing, French review CSV) |
| BL-28 French reference set · BL-27 exact re-ingest | **Blocked**: the Drive connector reads only to chapter 7 of the French book and downloads nothing over 10 MB — upload the two .docx files or a Markdown export |
| BL-25 Classroom · BL-26 Exercises and simulations | **Needs a specification session** (no requirements file exists) |
| BL-05 release · BL-11 Education screenshots · BL-29 Educator Edition | **You**; §6 Education and Pro items: their GitHub repositories are empty, so the source is not reachable |
| BL-24 licence activation | Excluded (waits for Paddle) |
| §6 CRGO NV-C01…C08 | **Done in CRGO 0.11.1** (verified) |

## 1. Release blockers for 1.9.3 (P0)

| ID | Item | Source | Status | Effort | Done when |
|---|---|---|---|---|---|
| BL-01 | Ontology proposals left in the previous folder when the organisation-graph folder changes | 1.9.3 Known issues | **Done on branch** `claude/cool-archimedes-3vnkq3` | — | Merged; 4 regression tests in `test_helper_guard.py` pass (done: 60/60) |
| BL-02 | Run the full browser suite with a **CRGO 0.11.2** checkout. Without it `t06` fails on 3 ontology routes (`screening/watch`, `scenario/S1`, `ontology/suggest`, HTTP 502), on `main` as well | CRG-001 (restated), this session | Open | S | `CRGO_HOME=…/CyberRiskGuardian-Ontology-0.11.2 bash desktop/tests/run_all.sh` → all suites pass |
| BL-03 | Helper guard refuses a Google Drive folder under `~/Library/CloudStorage` on the Mac ("system folder"). The code already allows `CloudStorage`, so the cause is probably the resolved path (symlink or `HOME`) | CRG-004 | Open: reproduce on the Mac | M | Cause found; a legitimate synced folder is accepted, and a unit test covers a `CloudStorage` path |
| BL-04 | Stale "CRGO 0.11.0" references where 0.11.2 is pinned: `requirements.txt:6`, `desktop/tests/requirements-ci.txt:1`, `desktop/README.md:56` | This session | Open | S | `grep` finds 0.11.0 only in history notes |
| BL-05 | Release 1.9.3: date the CHANGELOG, rebuild the Community and commercial packages with SHA-256, tag, then follow `PUBLISHING.md` §4 | Release process | Open | M | Release published; `tools/version_check.py` passes |
| BL-06 | Review the four Dependabot updates (`actions/checkout` 7.0.1, `setup-node` 7.1.0, `setup-python` 7.1.0, Playwright 1.65.0) | Repository | Open | S | Merged or closed with a reason; CI passes |
| BL-06a | Wrong menu path in 4 helper messages (`crgo_client.py`): "Settings → Ontology" should read "Organization → Ontology · CRGO → Connection" (EN and FR catalogue) | This session (19 Nov, reported by the author) | Open | S | No message names a menu path that does not exist; `label_check.py` menu-path check extended to helper messages |
| BL-06b | Threat revision log records an empty `red_p / red_i` row (S1–S12, 2026-11-17, `— → —`, no classification, no cause). The log is for threat-driven `Pb(A)` / `Pb(ψ,A)` changes only; reduction edits and empty rows should not be written there | This session (19 Nov, seen in the author's workspace) | Open: reproduce | M | Only Pb(A)/Pb(ψ,A) changes with snapshot date, before/after ratio and cause are logged; a regression test covers a reduction edit |

## 2. Author actions (P1, Blocked on the author)

| ID | Item | Source | Status | Done when |
|---|---|---|---|---|
| BL-07 | Launcher prompt check on the Mac and on Windows (item 3) | 8 Nov §C; DECISIONS-1.9.2 | Blocked: author's machines | `start.command`, `start.sh` and `start.bat` each prompt when a launcher is already running |
| BL-08 | Pin the minisign public key (NV-086; status *no-key* until pinned) | DECISIONS-1.9.2 | Blocked: author generates the key pair | Public key pinned in `crg_signing.py`; signed update verified end to end |
| BL-09 | CRGO tag and approval rows: confirm `v0.11.2` is tagged and its approval rows recorded (the open item named v0.11.1) | DECISIONS-1.9.2 | Verify in the CRGO repository | Tag exists; approval rows present |
| BL-10 | Native French read-through: CanaRetail FR, MediBec FR, chapter help, CRGO FR labels, Detailed-level lines | 8 Nov §C | Blocked: native reader | Findings filed; `fr_terms_check.py` still passes |
| BL-11 | Education slide screenshots (from 1.9.1) | DECISIONS-1.9.2 | Blocked: Education material | Slides carry current screenshots |
| BL-12 | Run `claude plugin eval` with a model; Threat Live-feed ships no evals of its own yet (NV-P15) | DECISIONS-1.9.2; 8 Nov B | Open: needs approval of the model cost | An eval suite exists for the plugin and its report is kept with the release |
| BL-13 | Larger local-model test (24B / 32B / 70B) | 8 Nov §C (spec §13) | Blocked: new computer | Results recorded against NV-047 |
| BL-14 | Check Document 1 §4 "engine verified" row and the master-switch name in USER-GUIDE §8.3 | 8 Nov §C | Open | S | Both match the 1.9.3 application |
| BL-15 | CIS approval for identifiers and titles in the commercial editions (D3) | 8 Nov §C | Blocked: CIS | Approval received, or the identifier-only rule stays |

## 3. Engineering quality and CI (P2)

| ID | Item | Source | Status | Effort | Note / done when |
|---|---|---|---|---|---|
| BL-16 | Add `ruff` (config committed, `ruff check plugins/ desktop/app` clean) | CRG-006 | Open | M | Start with a small rule set; fix or exclude generated files |
| BL-17 | Add `bandit` as a CI step | CRG-005, CRG-007 | Open | S | Use per-line `# nosec` with a reason, not blanket `-s` skips |
| BL-18 | Commit `.pre-commit-config.yaml` (ruff, bandit, label check) | CRG-007, CRG-012 | Open | S | Fresh clone → `pre-commit install` → hooks run |
| BL-19 | Test procedure in the repository (engine, CRGO, desktop gates, E2E, security, smoke), with exact commands and expected results; link from the README | CRG-008 | Open | M | Include: `pip install -r requirements.txt`, `npm ci` in `desktop/tests`, the CRGO 0.11.2 checkout and `CRGO_HOME` |
| — | Python CI for the plugin tests | CRG-005 | **Close** | — | Already run by `desktop-ci.yml` (`test_crg_calc.py`, `test_crgo_contract.py`, `test_ssvc.py`, `test_cross_engine.py`) on every plugin change, with pip-audit and npm audit; BL-16/17 add the rest |
| — | `cvss==3.6` missing from `requirements.txt` | CRG-002 | **Close** | — | Already pinned; the evaluation ran without `pip install -r requirements.txt` |
| — | Install Playwright for the desktop tests | CRG-003 | **Close** | — | Environment step, not a defect; CI uses `npm ci`. Goes into the test procedure (BL-19) |
| — | Add `pytest` to the dependencies | CRG-009 | **Close** (proposed) | — | The suites are `unittest` and stand-alone scripts and run without pytest. **Management decision required** if pytest is wanted anyway |

## 4. Improvements (P3)

| ID | Item | Source | Status | Effort | Note |
|---|---|---|---|---|---|
| BL-20 | Accessibility to WCAG 2.1 AA: `t72_axe.mjs` already runs axe-core on 42 routes (EN/FR, light/dark) but gates six rules only. Gate colour contrast and the remaining AA rules | CRG-014, NV-028/064 | Open | L | Extend the gate rule by rule; each newly gated rule ships with its fixes |
| BL-21 | Semgrep rules for this method: no network in the calculation path, no CVSS Threat/Environmental metrics, reductions combined by product, retired marker wording | CRG-011 | Open | M | Rules under `.semgrep/`; run in CI |
| BL-22 | Performance test for `threat_snapshot.py` on a **local fixture** (no network in CI; KEV + EPSS join, transform and write) | CRG-013 | Open | S | Under 60 s on CI hardware |
| BL-23 | Lighthouse CI | CRG-010 | **Decision** | M | The application runs locally and offline, so Core Web Vitals say little. Suggest closing and using a start-up timing check instead. **Management decision required** |

## 5. Feature builds (next feature release)

| ID | Item | Source | Status | Size | Unblocks |
|---|---|---|---|---|---|
| BL-24 | Licence-key activation and first-run licence dialog | `desktop-app-licence-page.md` | Blocked: Paddle launch date | L | Licence checks; the application checks no licence today |
| BL-25 | Classroom: Settings → Classroom, Moodle roster, assignments, rubrics, gradebook, education pack; **instructor control** | `backlog-classroom-area.md` (requirements Q1–Q35) | Blocked: needs a spec | XL | C6 decision 4 and C7 decision 11 (instructor switch; classroom workspaces proposing to the ontology) |
| BL-26 | Exercises and simulations: LAN role-play, SOAR roles, four sample activities, after-action reports | `backlog-classroom-area.md` | Blocked: same build as BL-25 | XL | — |
| BL-27 | Book v2.51b alignment opportunities | `book-v2-51b-alignment-opportunities.md` | Blocked: author decides when | L | — |
| BL-28 | Core: French textbook reference set | 8 Nov §C | Blocked: French v2.51b source | M | — |
| BL-29 | Educator Edition: review what it holds for CanaRetail | 8 Nov §C | **Management decision required** | S | — |

## 6. Other repositories (status to verify where they live)

Not found in this repository's records. Some may already be done in their own repository.

| Repository | Items | Source |
|---|---|---|
| CRGO | NV-C02 (bare tool errors), NV-C03 (unbounded results), NV-C04 (write outside `build/`), NV-C05 (content: theme fit, names, FR), NV-C06 (`scenarios_for_control` for CIS v8.1), NV-C07 (`check.sh` rewrites shapes), NV-C08 (document `check.sh` prerequisites); WIDOCO site regeneration; library ABox + EPSS/KEV rebuild | 8 Nov B and §C |
| Education | NV-E02 (Lab 0 path), NV-E03 (Lab 8 "Drivers"), NV-E04 (FR apostrophes), NV-E05 (instructor-guide known issues), NV-E06 (`build_education.py` port and dependencies), NV-E07 (no Writer lab) | 8 Nov B |
| CRG Pro | NV-P02 (input validation), NV-P04 (mcp 2.x start), NV-P05 (below-tolerance rule text), NV-P06 (stale regression figures), NV-P07 (retired wording) | 8 Nov B |

---

## 7. Decisions required

1. Ship 1.9.3 once BL-02 to BL-06 are done (BL-01 is done on the branch)? **Management decision required**
2. Close CRG-002, CRG-003, CRG-005 and CRG-009 as proposed in §3, and decide on Lighthouse (BL-23). **Management decision required**
3. Order of the next feature build: licence activation (BL-24, waits for Paddle) or Classroom (BL-25/26, needs a spec).
   **Management decision required**
4. Approve the model cost of the plugin evals (BL-12). **Management decision required**
