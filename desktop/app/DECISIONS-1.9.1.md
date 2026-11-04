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
