# CyberRiskGuardian Desktop 1.9.2 — decisions

Binding scope: the decided items 1–23 and C1–C5 of the release record (`desktop-1.9.0-status.md` in the
CyberRiskGuardian project) and the findings of the 8 November 2026 test campaign (`next-version-spec.md` v6, decisions
D1–D6, FR-1–FR-3, R-1, R-2). This file records the decisions taken **during the build**. Every earlier binding decision
still holds (`DECISIONS-1.8.0.md`, `DECISIONS-1.9.0.md`, `DECISIONS-1.9.1.md`). Each workstream appends its own entries.

## Author decisions applied (recorded 8 November 2026, binding)

| # | Decision | Where it landed |
|---|---|---|
| D1 | The desktop copy of the Security Policy Writer is canonical. | `crg_writer/` here is the source; `WRITER_TREE_HASH` in `js/version.js` pins it (`tools/writer_tree_hash.py`); the stand-alone repository is synced *from* the desktop (`writer-sync.patch`, `--force` once because its tree had drifted). |
| D2 | New scenarios start with reductions of 0; existing untouched 0.5 are flagged for review, never changed. | `state.blankScenario`, every creation path; `ws.reductionReview` one-time review (NV-001). |
| D3 | Ask CIS for approval; until then the commercial build ships CIS identifiers only. | `js/edition.js`, `tools/package_desktop.py --edition commercial` strips the titles and CRGO labels from `js/data/controls.js`; Community and Educational keep them with the CIS notice (NV-P12). |
| D4 | Everything in one release. | Desktop 1.9.2 with TI 1.7.2, Core 2.2.1, Pro 2.0.1, Writer 0.1.1, CRGO 0.11.1, Education 2.1.2. |
| D5 | Guidance and a warning for local models; local-only defaults kept. | Settings → AI card *Which AI model for which feature* (≥ 30B on ≥ 48 GB), `AI.smallLocalWarnings()`, *Route to ‹default remote›* / *Switch off* (NV-047). |
| D6 | Money follows the interface locale; exports keep plain numbers. | `util.money / moneyShort`; `exportx.js` untouched for numbers (NV-093). |
| FR-1 | « Ratio risque résiduel / risque toléré » (short « Ratio rés./tol. »). | `fr.js`, guides, `tools/fr_terms_check.py` (NV-042). |
| FR-2 | « probabilité » everywhere; « vraisemblance » retired. | Same; CRGO 0.11.1 labels follow (« vraisemblance » kept as altLabel in CRGO). |
| FR-3 | « Éléments probants » everywhere; « Preuves » retired. | Same; the CRGO label *TestEvidence* reads « élément probant d'essai ». |
| R-1 | Keep the campaign's severities. | No change to the findings. |
| R-2 | Item 23 keeps the decided rule (reduction = residual without this recommendation's own measures − with them, whatever their status). | `js/receffect.js`; the "implemented only" variant was not adopted. |

## Release preparation (lead, 8 November 2026)

- **CRGO 0.11.1 is the bundled release.** The snapshot was rebuilt with `tools/build_crgo.py` against CRGO branch
  `claude/crgo-0.11.1` (commit e86cf11, store rebuilt first) rather than copied: the only difference from the prepared
  files is that the class *TestEvidence* no longer appears among the legal test results (`vocab("Test")` matched it; one
  filter in `legal()`). CRGO's CHANGELOG heading `## [0.11.1] — 2026-11-08` has no "proposed", so the snapshot says
  **approved** — the author confirms the two approval rows of `src/approvals.tsv` (changes/0.11.1, content/0.11.1, MAL,
  2026-11-08) or adds "proposed" to the heading and rebuilds. Every pin moved to 0.11.1 (tag `v0.11.1`): AGENTS.md,
  CLAUDE.md, NOTICE files, READMEs, PUBLISHING.md, both `.mcp.json`, the skill references, `crgo_contract.PINNED_RELEASE`,
  `iam.js` / `cm.js` / `scenpatterns.js` release constants (identifiers unchanged since 0.11.0), the guides, the test
  harness (`lib.mjs`, `serve.sh`: default checkout `CyberRiskGuardian-Ontology-0.11.1`, `CRGO_RELEASE` 0.11.1) and
  `desktop-ci.yml` (`CRGO_REF: v0.11.1`). **CI needs the CRGO tag `v0.11.1` to exist** before the workflow runs.
  Historical mentions of 0.11.0 (what 1.9.0 added, approval of 2 November) are kept.
- **CRGO's contract examples still say `ontologyRelease: "0.11.0"`** on the 0.11.1 branch (not regenerated).
  `test_crgo_contract.py` now compares the example content without `ontologyRelease` and requires the *document* to carry
  the pin (53/53 against 0.11.1). The author may regenerate the examples in CRGO instead; the test then still passes.
- **`controls.js` CIS rows rebuilt** (`build_controls.py --cis-only`) from the 0.11.1 snapshot: only the release text in
  the per-safeguard notes changed (CIS EN labels are unchanged in 0.11.1).
- **QC numbering.** ws1's QC-27…30 (NV-082) keep their numbers; ws3's snapshot-freshness rule (NV-099) is **QC-31**, in the
  panel, the banner, the French catalogue, both guides and t57/t63.
- **`validCoef` deduplicated.** One helper in the leaf module `js/receffect.js`, re-exported by `js/catalog.js` (the
  reverse direction would import `state.js` into the migration chain). `recommend.effect()` no longer clamps anywhere.
- **Unused French entries removed**: `above ceiling`, `below floor`, `beyond risk-seeking (below floor)` (ws5 wording the
  merged Budget screen does not use; ws2's point-target strings kept).
- **Versions.** 1.9.2 everywhere `version_check` covers; `WRITER_VERSION` 0.1.1 as ws4 set it; the 1.9.1 CHANGELOG
  heading now carries its date (4 November 2026, merge of PR #9). READMEs had stayed at 1.9.0 through 1.9.1; they say
  1.9.2 (plugin 1.7.2, Core 2.2.1).
- **INSTALL.md §7** gains a *From 1.9.0 or 1.9.1* paragraph (EN/FR): data version 6, one-way (read-only in 1.9.1), the
  item 23 exception, duplicates deleted by hand, the launcher prompt.
- **Threat Intel plugin 1.7.2 merged** into this branch (`claude/ti-1.7.2`, 7b6c3d4; no conflict) so one pull request
  carries desktop 1.9.2 and TI 1.7.2; the repository's own TI copy is the reference for `test_engine_cross.py` (9/9, the
  pre-1.7.2 skip notice is gone). `desktop-ci.yml` runs `test_cross_engine.py`, `scripts/ssvc_compare.py` and
  `scripts/build_evals.py --replay` (plugins workstream hand-off). `claude plugin eval` was not run (needs the model).
- **Release ZIPs** built with `tools/package_desktop.py` (Community: historical file name for the update check;
  commercial: `…-beta-commercial.zip`, CIS identifiers only) and committed under `desktop/dist/` as 1.9.1 did; the
  `FIRST-INSTALL`, `FIRST-TIME-SETUP` and `INSTALL-Windows-macOS-EN-FR` PDFs rebuilt with `tools/build_install_pdf.py`.
- **Known open items for the author** (not build decisions): the launcher prompt on the Mac and on Windows (item 3), the
  minisign public key (NV-086, status *no-key* until pinned), the CRGO `v0.11.1` tag and approval rows, the stand-alone
  Writer repository sync (`--force` once), the Education slide screenshots (1.9.1), a native French read-through,
  `claude plugin eval` with a model.

## Engines, CVSS, forecasts, Excel (ws2)

- **NV-004 / item 21 — the vector wins.** `resolveCvss` / `resolve_cvss` recompute the vector's score; a stored score
  that disagrees by more than 0.05 is flagged, never used. Typing a vector that parses clears `cvss_score` and records a
  revision; a plain score typed over a vector replaces the vector with a recorded revision (an explicit action).
- **NV-016 — zero tolerated risk.** JS ratios are `NaN` (serialised `null`, as Python's `None`); verdict *Not applicable
  (tolerated risk 0)*; a warning asks to confirm the zero is deliberate. Pb(A), Pb(ψ,A), μ(E) and CVSS = 0 are admissible.
- **NV-095 — one typing rule** (TI convention): numeric strings and booleans rejected, NaN / infinity rejected, missing
  reductions = 0; a load-time sub-step retypes numeric text (same figures, journalled; it also journals "nothing retyped").
- **NV-045 — sensitivity.** Central case never clamped; shifted values clamped in the direction of the shift only. TI 1.7.2
  and Pro 2.0.1 adopted the same rule (lead's follow-up).
- **NV-066 — flag, don't clamp.** `combined()` leaves an out-of-range coefficient out of the product and lists it;
  `parseClaude` keeps an AI-proposed out-of-range coefficient and warns.
- **NV-094 — budget conventions** on the TI convention: gap = planned − target with its sign; implied appetite `null`
  below 4 %; the Summary's "Fund the gap…" sentence still quotes a positive amount in prose.
- **NV-083 — Excel in the interface language.** Sheet names stay English (formulas refer to them); formula string literals
  and their cached values are translated together; user data never translated.
- **NV-P12 / D3 — edition switch.** No build-time edition existed (the ZIP is the folder): `js/edition.js` carries the
  edition, `tools/package_desktop.py` writes it and strips the CIS titles in the commercial copy (fails if any remains).

## Privacy, sharing, threat intelligence, imports (ws3)

- **NV-005 — people fields.** A value under a people key is a person whatever its shape, **except** a value made only of
  role words ("IT", "Security team", "Service desk", "N/A"), otherwise every KRI owner written as a role would become
  "Person n".
- **NV-089 — free-text names** are replaced automatically **only with a cue** (title, bracketed role, "approved by …");
  everything else name-like and every unrecognised 3–6-letter acronym is listed in the preview with one-click buttons.
  Known false positives accepted: a supplier with a person cue may become "Person Fn", lower-case `first.last` becomes
  `[username]`, "DC01" in prose becomes `host-n`.
- **Residual check.** When identifying terms remain, the banner is red and Download / Copy / Publish **ask for
  confirmation** (recorded in the publication log); the buttons are not locked — the decision stays the analyst's.
- **Additional terms** live in the workspace (`anonTerms`) so every anonymizer replaces the same terms.
- **NV-023.** Proposals without register evidence start unticked; an analyst may still tick them and the stored entry
  carries the Information-gap marker — chosen over a hard block because the register may lag reality.
- **NV-007.** Accepting from an expired snapshot needs a confidence and a typed justification; nothing is blocked.
- **NV-024.** A malformed snapshot is refused before storage; one already stored shows a red status with Clear reachable;
  `state.setSnapshot` itself is unchanged.
- **NV-060.** Publish writes only the application's own names and never over a file it did not record (`published.json`)
  or that does not read as ours; 409 otherwise.
- **NV-091.** `CRG_SOURCES_BASE` accepted only as plain `http://` to loopback, otherwise ignored with a stderr line.
- Scaffold fix kept at merge: the 5 → 6 step journals "no change to the workspace: the data version is recorded" when
  nothing was added, so t11's "notes ≥ 1" holds for a factory workspace left at version 5.

## AI handling, helper, Writer (ws4)

- **Item 18 — repair condition.** `[object Object]` values are cleared and re-tagged UNKNOWN **only** under provenance
  method `rules` or no source; a value under another provenance is left and listed for review in the journal. A value
  typed by hand over a repaired field is not recovered (the profile keeps no history) — release note.
- **NV-067 — conservative rules.** Mission and suppliers are read only from a mission- or supplier-titled block or a
  labelled line; vendors mentioned in general text are never taken. On the MediBec and CanaRetail student cases both
  fields are now UNKNOWN (the 1.9.1 scan took an instructor note and a communications-plan line).
- **X-3 — untrusted text.** One wrapper for every task; a grounded FACT for a field that already holds a value is still
  **not** pre-ticked (the 1.9.1 rule); two injection patterns added on both sides (page and Writer), kept in step.
- **NV-033.** Empty answer → 502 and a rejected log entry; truncated → warning, the partial text kept (salvage).
  `max_completion_tokens` first for OpenAI, Azure and GitHub Models; local servers and **Gemini keep `max_tokens`**
  (the flip covers a refusal either way) — to confirm.
- **NV-019.** `chat` and `analyst` removed from the policy; `/api/ai/test` goes through the policy check.
- **NV-047 / D5.** A local model whose size is not in its name is warned about too ("size not stated in the name"); no
  model configured → no warning; nothing re-routed by itself.
- **NV-086.** Verification implemented (Ed25519 / minisign, standard library), pinned key empty until the author publishes
  one; release convention: `minisign -Sm <zip> -t "CyberRiskGuardian Desktop release X.Y.Z"` → `<zip>.minisig` beside
  the ZIP and its `.sha256`.
- **NV-087.** Action majors were already SHA-pinned and were not bumped offline; pip-audit / npm audit advisory only.
- **Writer 0.1.1.** The stand-alone repository was not modified; `writer-sync.patch` reverses `sync_to_desktop.py`
  (desktop → repo by default, refuses a diverged destination without `--force`). Gate taught: a `"` or `'` inside a regex
  literal desynchronises the gates' comment stripper — use `\x22` / `\x27`.

## Interface, French, accessibility, workspaces, launchers (ws5)

- **Item 2 — the window lock is per browser profile** (two different browsers never share IndexedDB either). A frozen
  window's **Use it here** steals back and reloads; the browser releases the Web Lock when a window crashes.
- **Item 3 — launchers.** Without a tty and without `CRG_LAUNCH_KEEP` / `CRG_LAUNCH_REPLACE` / `CRG_LAUNCH_PROMPT` the old
  behaviour (replace) is kept, so scripts and CI are unchanged. **To check on the author's Mac and on Windows** (double
  start, Return opens the browser on the running copy, `y` stops it, `lsof` prints the folder, Gatekeeper still opens
  `start.command`; `start.bat` prompt, `taskkill`, `%CRG_LAUNCH_KEEP%` unset).
- **Items 4 / 5.** The default on restore is *Replace the copy here* when the copy is unchanged since creation (bundled
  case compared with a fresh copy), *Skip* otherwise; a second copy created from the tab gets a uid after the question;
  identifiers are never changed by the migration (store, blobs and "current" are keyed by id).
- **Item 19.** Nothing is deleted without a click; the one-time review closes when the list is empty or with *Keep all*.
- **D6 / NV-040.** `toLocaleString('fr-CA')`, U+00A0 before % and $; exports untouched. The IAM tile reads
  "1,479 / 1,505" in English (t39 follows the interface locale).
- **NV-064.** Heading order was first reported, not gated; the lead fixed the 17 nodes at integration and t72 gates
  `heading-order` (recommendation cards: `summary > h2.sumh`; matrix columns h2; compliance / ontology sub-headings h3).
- **NV-042.** The Writer's French policy prose and the CRGO snapshot labels were not rewritten by the desktop (legal sense;
  CRGO content — CRGO 0.11.1 carries its own FR-2 / FR-3 labels).

## Integration (lead)

- Merge order ws2 → ws3 → ws4 → ws1 → ws5 on the scaffold a66ee4f, merge commits, `fr.js` with a union merge then exact
  duplicates removed. `exportAssessment`: ws3's `threat_context` (expiry) and ws2's `cvss_check` + `warnings` both kept.
  `panels/budget.js`: ws2 semantics with ws5 formatting. `panels/register.js`: a duplicate `tr` import (both workstreams
  added one) broke the whole app at load — removed; no other duplicate import.
- **t35 flake** was the harness, not the app: *Create workspace* ends in `reopen()` (1.9.1 B4) and the poll could land
  between the handler and the reload; `lib.mjs clickAndReopen()` waits for the new page; `waitInPage` retries an
  evaluation cut by a navigation (t35, t51).
- **NV-041 batch names** through `tr()` at creation (the asset is user text, never translated; the generated statement
  stays English — not asked).

## Method, process and recommendations (ws1)

- **Item 23 — the one written exception to "a migration never changes a real organization's numbers".** Data version
  5 → 6 recomputes the figures frozen on a recommendation approved under the earlier effect rule when that rule froze a
  reduction of 0 while the recommendation's measures do reduce the risk (the earlier rule counted the recommendation's
  already-implemented measures in the baseline). The decided rule (R-2): reduction = residual without this
  recommendation's own measures − residual with them, whatever their status; other measures in force stay in the
  baseline. The frozen 0 is kept beside the new figure in `approved.recomputed.previous`, labelled **"recomputed in 1.9.2
  from current measures"**, with a `recomputed` entry in the recommendation's history and a note in the migration
  journal; the recommendation screen shows a banner. Nothing else of any organization's numbers is changed by the
  migration (`js/migrate192/ws1.js`, `js/receffect.js`).
- **Item 20 — already-promoted scenarios are not recoverable.** A scenario created from the screening before 1.9.2 has
  no draft to take its parameters from: it keeps its "to estimate (Process step 9)" placeholders, which step 9 and QC-27
  no longer count as estimates. The release note says so.
- **NV-001 / D2.** A stored scenario without a recorded reduction is given the 0.5 the earlier release displayed, so its
  numbers do not move; scenarios still on the untouched 0.5 / 0.5 are listed in `ws.reductionReview` for a one-time
  review on the Process page, never changed automatically.
- **Step 10.** A vector that came with a batch pattern or a candidate blocks step 10 until the analyst confirms it (one
  click on the Process card, recorded in the scenario's revisions) or changes it; the blank scenario's default vector
  always blocks.
- **C5.** The AI's evidence-strength score (EV) is capped at 2 unless its rationale cites an evidence ID of the register
  (E1, E2…); proposals never overwrite an analyst's scores (a re-estimate is kept beside the card as a proposal); flags are
  only added; acceptance needs the name of the person accepting.
