# CyberRiskGuardian Desktop 1.9.1 — decisions

Binding scope: the 1.9.1 sections of the release record (`desktop-1.9.0-status.md` in the CyberRiskGuardian project),
decided with the author on 3–4 November 2026. This file records the decisions taken **during the build** (author away,
rule: take the option that fits the binding rules, log it here, stop only for something irreversible or a shipped number).
Every 1.8.0 / 1.9.0 binding decision still holds (`DECISIONS-1.8.0.md`, `DECISIONS-1.9.0.md`).

## Bugs

- **B1.** `AI.settings()` now fills its defaults *in place* and always returns `ws.ai` itself. The other
  `Object.assign({defaults}, x)` getters were reviewed: `state.initPlan()` returns a computed view that is never written
  back, so it keeps its shape; the rest run once at load or migration.
- **B2.** The fix is local to the import chain (`goOrRedraw('org/import')` in `org.js` `toImport()`), not in `go()`:
  making every `go()` to the current screen redraw it broke the profile → import chain of t03 (a redraw in the middle of a
  run). `util.goOrRedraw()` is available for the same case elsewhere.
- **B3.** `localDefault()` / `remoteDefault()`: (1) the default chosen in *Settings → AI → Default providers*, (2) else
  the first provider of that side whose connection test passed — local order Ollama, LM Studio, Other local model, then
  providers added here; remote order Claude API, OpenAI, Gemini, Azure OpenAI, GitHub Models — (3) else the first with a
  model set, (4) else the historical default (Other local model / Claude API). The helper records a passed test in
  `crg-config.json` `ai.tested` (date only) and keeps that key when a page saves the configuration (a page can neither
  drop nor forge it). The page reloads the configuration after a passed test.
- **B4.** Not reproduced in the cloud build (the screens checked showed the new workspace at once, on 1.9.0 and on the
  branch); the cause on the author's Mac is still unknown. The decided fix applies regardless: after a workspace is
  **created, switched (selector, Workspaces → Open, Context documents → Open text), deleted (Workspaces, Reset data),
  restored from a backup, or started over (Reset data)** from a screen, the application saves and reloads itself
  (`state.reopen()`). It reopens on the Process page, except a creation, which reopens on the screen the creation flow
  chose (profile / crown jewels / documents / import) and carries the extraction chosen at creation through the reload
  (sessionStorage, one minute). The toast and the result message of the flow are shown after the reload. Programmatic
  `state.select()` / `create()` / `remove()` do not reload (the suites and the start-up chain use them).
- Small robustness fix met on the way: a context document without a stored type no longer breaks the Documents tab.

## Next step, level of detail, set-up questions

- **Next-step card.** Primary button: **Next: ‹first unmet check›** with "opens ‹screen›" beside it; it opens the
  check's own fix route (route argument included, e.g. `org/docs`, `screening/families`); no new focus targets were
  added inside screens. A step without named checks keeps its first screen as the primary button.
- **Landing.** Without an address in the URL the application opens on the Process page while a step of the workspace
  remains and the level is not Minimal; otherwise on the scenario register (as before).
- **Where the level lives.** *Settings → Language & detail* (the tab was *Language*; tab renamed so the setting can be
  found) and the Process page header. Stored in the preferences of the installation, or on the signed-in person's
  user record in multi-user mode (field `detail`).
- **"Why this screen matters".** One line per screen = per screen of the menu (45, Settings and About included), not
  per tab; drawn under the description by `helpdesc.js`, shown only at Detailed (CSS), EN and FR.
- **French names of the levels** are given in `detail.js` (*Minimal*, *Standard*, *Détaillé*): the catalogue already
  translates "Standard" as « Norme » (a standard document).
- **Kept hints at Minimal.** A hint keeps its place when `field(…, { keep: true })` or when it matches the data-meaning
  patterns (blank vs 0, the five evidence tags, 0–1 ranges, %, $, CAD, days/hours/months/years). The next-step
  card's hints are always shown.
- **Set-up questions are not a blocking dialog**: an invitation card at the top of the Process page (a modal would
  have hidden the screen at every first start, and blocked every browser suite). Shown once per installation until
  answered or skipped — 1.9.0 installations see it too, since the experience question is new. Answers are yes / no /
  not sure (not sure keeps the module as it is). Not asked: Cybersecurity management, Shared registers, Quality
  review, Ontology, Scenario screening (the method uses them). Secops = SIEM and SOAR together.
- **Virtual consultant.** The prompt carries `LEVEL OF DETAIL: …` and a length rule (Minimal 120 words, Standard 300,
  Detailed 500); every other rule (citations, GENERAL:, no figure the engine did not compute) is unchanged.

## One Help, pinned header and footer

- **Help menu**: *Help on this screen* (the screen's "?"; the user guide when a screen has none), *Step by step*,
  *User guide*, *Ask the help chatbot*, *About & versions* (`#/about/versions`). Keyboard: arrows, Home/End, Escape.
  The help windows open without `noopener` (with it `window.open` returns null and the fallback would have replaced
  the application); a blocked pop-up shows a toast.
- **Footer**: one line, `© Marc-André Léger · ✓ Engine verified` (✗ *Engine check failed* / ◻ *Engine unverified*
  otherwise); the year, the version and the totals are in the link's title; the full self-check text stays in
  `#engine-state` (screen readers, About & versions). The copyright omits the year on screen so the line fits the
  256 px column. Rail: © and ✓ only; drawer: as the full menu.
- Interface strings and guides: *Help → About → Versions* became *Help → About & versions*.

## Documentation and gates

- The first-time guides come from the CyberRiskGuardian project copies (Document 2 revised 2026-11-04); the Mac copies
  could not be reached from the build session. File names only where the reader acts on the file (`feeds-dir.txt`,
  the launchers, the ZIP and its `.sha256`).
- `label_check.py` also checks menu paths in `FIRST-INSTALL.md`, `FIRST-TIME-SETUP.md` and `USER-GUIDE.md` (English);
  *Organization → ‹tab of Organization profile›* is accepted; Claude Desktop's own *Settings → Developer* is exempt.
  Stale paths it found in the user guide were fixed (*Help → About → …*, *Programmes · SP 800-53A* → *Procedures ·
  SP 800-53A*, *Settings → Language*, *Risk Registry → Browse & search → Use ticked cards…*).
- `help/md.js`: a numbered list resumed after a table keeps its numbering (seen in the PDFs).
- `package-lock.json` at the repository root (the `docx` dependency). The test folder keeps no lockfile: generated
  here it would pin the build machine's local Playwright path; CI still installs the pinned Playwright 1.63.0.
- The 1.9.1 suites: t51 (B1–B4), t52 (next step, level of detail, set-up questions, consultant), t53 (Help, pinned
  header and footer); t22 and t47 follow the new footer and Help.
