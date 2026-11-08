# CyberRiskGuardian Desktop 1.9.2 — decisions

Binding scope: the decided items 1–23 and C1–C5 of the release record (`desktop-1.9.0-status.md` in the
CyberRiskGuardian project) and the findings of the 8 November 2026 test campaign (`next-version-spec.md` v6, decisions
D1–D6, FR-1–FR-3, R-1, R-2). This file records the decisions taken **during the build**. Every earlier binding decision
still holds (`DECISIONS-1.8.0.md`, `DECISIONS-1.9.0.md`, `DECISIONS-1.9.1.md`). Each workstream appends its own entries.

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
