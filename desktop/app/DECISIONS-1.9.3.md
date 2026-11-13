# CyberRiskGuardian Desktop 1.9.3 — decisions

Binding scope: `next-build-spec-1.9.3.md` (C6, C7, T1–T10) and the author decisions of 12 November 2026 in
`backlog-next-build-additions.md`. This file records the decisions taken **during the build** and copies the author's
decisions for C7 and C6. Every earlier binding decision still holds (`DECISIONS-1.8.0.md`, `DECISIONS-1.9.0.md`,
`DECISIONS-1.9.1.md`, `DECISIONS-1.9.2.md`).

## Lead decisions taken during the build

### CRGO and the ontology
- **Fixed CRGO clusters.** 1,817 scenarios group into **1,377 clusters** under the rule `crgo-grouping/1`; sweep merging is
  unchanged.
- **`crgo_reject_proposal` tool added** to the CRGO server beside the proposal tools.
- **Proposal store** under `<org root>/_installation/crgo-local/`. Proposals always live in the installation store.
- **Without the helper, *Add to the ontology* and *Proposals* are disabled.**
- **Contributions are exported as JSON.**
- **The folder setting *Folder for ontology proposals* is used only for contribution files** (not for the proposals).
- **Admin check relies on the user object sent by the page** (the helper does not authenticate users itself).
  Reviewed: acceptable for 1.9.3 — only the app's own page can reach the helper (session token, Host and Origin checks), and multi-user mode is not a security boundary (users and roles live in browser storage, see users.js). In multi-user mode the approver name is pre-filled read-only.
- **Writer `CRGO_RELEASE` constant not bumped** (the Writer's own pin is unchanged by the 0.11.2 patch).
- **CRGO 0.11.2 and snapshot `crg-crgo-snapshot/3`** are the pin of this release.

### Quality review
- **QC-33** is the number of the new quality check (QC-27 was already taken by the NV-082 checks of 1.9.2).

### AI-proposed families (C6)
- **One task id, `screening_families`**, for all three parts.
- **Batches of at most 40 candidates, sent sequentially, each with its own payload preview.**
- **Part C reads the coverage ticks of all accepted families**; Part A accepts a `coverage` list; the reason
  `not_material` is accepted for a category not proposed.
- **The step 6 two-part check is kept** (every candidate scored, every candidate with a disposition and family or unique).

### Window lock (T1)
- **A taken-over window keeps the lock until the other window really takes it** — no timed release, which avoids the race
  between two windows. If the other window gives up, use *Use it here*.

### Tester fixes (T6)
- **"Need attention" counts two things, named in plain words on the screen** (EN/FR): judgments without a rationale, and
  flagged exclusions not yet reviewed; each item links to its row. **An accepted AI rationale counts as a rationale** for a
  candidate selected by judgment (it keeps the marker *Analytical estimate — validation required*); **a family selected by
  judgment still needs its own written judgment.** Regression test: t80.

## Author decisions for C7 (one path from candidate to scenario), 12 November 2026, binding

1. **Batch *Add … selected to the register*: kept, under *Advanced — skip screening*,** with a warning that the rows will
   not count as candidates and skip the 20 → 10 selection; each use journalled.
2. **Screen renamed *From candidates to scenarios* / *Des candidats aux scénarios*.**
3. **A candidate is a family of one only if it is unique** — not every candidate by default. **The ontology groups
   candidates into families** (§G), and **scenarios are validated against the ontology** (§H).
4. **All selected scenarios are created in one click** (after a review list).
5. **C6 and C7 ship together.**
6. **"Unique" means:** no other candidate in its ontology cluster, no accepted AI match, and the analyst confirms it (§C).
7. **Ontology validation reports findings only — it never blocks creation;** each finding offers **Edit** and **Delete**
   (§H).
8. **A candidate with no ontology match is allowed as a unique own scenario and flagged as a theme gap,** with **Edit**,
   **Delete** and **Add to the ontology** (§I).
9. **Where an ontology proposal goes:** to the CRGO server's proposal store when the server is running; otherwise to a file
   for the CRGO repository, written to a **folder path set in Settings** (new setting).
10. **Who approves:** the **administrator of the CRG installation** (in single-user mode, the one person).
11. **Classroom workspaces cannot propose to the ontology** until the Classroom build adds an instructor control.
12. **Approved proposals stay local** (this installation's ontology) **unless a box named *Make public* is ticked** (§I).

## Author decisions for C6 (AI-proposed families), 12 November 2026, binding

1. **Scope of a request: all candidates** — every AI family request covers all candidates, including those already in a
   family (Part A and Part B "all" buttons). Suggestions about a candidate already in a family are still shown beside its
   current family and accepted separately; nothing is moved without acceptance.
2. **Offline proposal:** yes — the **ontology grouping** (C7 §G).
3. **The AI drafts both the grouping and each family's "why this scenario?" answers** (the six questions: relevance,
   organizational evidence, asset/objective threatened, weakness/condition, material consequence, why it beats the
   unselected candidates). The drafts are proposals, marked *Analytical estimate — validation required*, cite evidence IDs
   where they rely on evidence (same EV rule as C5: no cited evidence → the organizational-evidence answer says *Information
   gap — organizational validation required*), and are edited or accepted by the analyst at ③ Select; the selection itself
   stays the analyst's.
4. **Classes: the instructor switch waits for the Classroom build,** as for C5; until then the per-feature switch in
   Settings → AI turns it off.
5. **Part C, a missing category with no candidate that fits: the AI proposes new candidates for that category.** Each
   proposed candidate is a full causal chain for the missing category, tagged with the category, the generation strategy and
   the profile facts or evidence it rests on; it goes through the usual review (accept, edit or reject), lands in
   ① Candidates marked *[AI — coverage gap]*, and is then scored like any other candidate before a family can be created.
   The book rule holds: a category is proposed only where the exposure is credible and material for the organization.
