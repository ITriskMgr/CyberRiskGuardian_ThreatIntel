---
description: Refresh the threat-context snapshot and re-calibrate an existing assessment's Pb(A) and Pb(psi,A), with a revision log
argument-hint: [assessment.json] [--regions ca,intl]
allowed-tools: Bash, Read, Edit, Glob
---

Refresh the threat-context snapshot and re-calibrate: $ARGUMENTS

Follow the `threat-context-calibration` skill. In order:

1. Locate the assessment JSON and its current `threat_context` block. Report the snapshot date
   and whether it has expired (90-day lifetime).
2. Build a new snapshot with `threat_snapshot.py --refresh`, using the regions that match where
   the organization operates. Show the provenance summary and ask the analyst to accept it.
3. Ask for, or locate, the organization's confirmed exposure list. Without it, produce watch-list
   context only and say so plainly.
4. Classify the exposed CVEs, propose band-constrained changes to `Pb(ψ,A)` — and to `Pb(A)` where
   sector campaign evidence supports it — and write a `threat_basis` block for each change.
5. Re-run `crg_calc.py`. Never compute by hand.
6. Produce the revision log, separating threat-landscape movement from organizational movement,
   and state which scenarios changed tolerance classification.

Constraints that are not negotiable: CVSS stays Base-only; no uplift without confirmed exposure;
`δe`, `δm`, `θ` and `μ(E)` are never adjusted from a feed; nothing client-specific is sent to an
external endpoint. The snapshot proposes, the analyst accepts.
