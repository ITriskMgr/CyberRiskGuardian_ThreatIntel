# Build specification — Classroom and Exercises (BL-25 + BL-26)

Agreed with the author on 19 November 2026 (specification Q&A, Q1–Q16). One build, after Desktop 1.9.4. Every decision
below is binding for the build; a change needs the author's decision and is recorded in the build's DECISIONS file.

## 1. Principles

- **File exchange, no server (Q1).** Instructor and students each run the desktop application on their own computer.
  The instructor exports **packs**; students import them, work offline, and export a **submission file** handed in through
  the LMS (Moodle upload), email or a shared folder. No network service is added; the helper stays loopback-only.
- **Editions (Q3).** The **student side** (import a pack, work, quiz, exercise, submit) is in every edition, including the
  free Community edition. The **instructor side** (create and sign packs, roster, rubrics, gradebook, course packs) is in
  the Educational edition.
- **One build (Q2).** Classroom and Exercises ship together; Exercises reuse the Classroom's packs, roles and submissions.
- The method is unchanged: no formula, marker or threat-context rule changes. Classroom work is labelled teaching material;
  fictional cases stay fictional (evidence-discipline rule).

## 2. Trust and instructor control

- **Signed packs (Q5).** The instructor's application generates an Ed25519 key pair on first use (the minisign format and
  `crg_signing.py` verification already used for releases; the secret key in the keychain or `~/.cyberriskguardian`, never in
  a workspace or a pack). Every assignment, exercise and course pack is signed. A student's application refuses a pack whose
  signature does not verify.
- **Key trust (Q12).** The first signed pack for a course pins that course's key and shows a short fingerprint; the
  instructor posts the same fingerprint on the LMS course page so students can compare. A later pack for the same course
  signed by another key is refused unless the student confirms a key change the instructor announced (journalled).
- **Instructor control, enforced from the pack:**
  - **AI (Q13):** off by default; the pack lists the AI features allowed (per feature, using the existing feature list of
    Settings → AI). Every AI proposal a student accepts is logged (feature, when, what) and travels in the submission.
    This replaces the per-feature switch as the instructor switch decided for C5 and C6.
  - **Ontology proposals:** allowed or not per pack (replaces C7 decision 11, "classroom workspaces cannot propose").
  - **Quiz answer reveal:** immediately, after submission, or never.
  - **Due date:** shown; a late submission is **marked late, never blocked**.
- **Submissions** carry a SHA-256 checksum over their content; the instructor's application shows whether a submission was
  altered after export.

## 3. Roster (Q6)

- Imported from the LMS participants export (CSV: name, email, group — Moodle's columns recognised; others mapped once), or
  typed in. Teams are created from groups or by hand.
- The roster stays in the instructor's confidential folder (`confidential/classroom/`), never in a pack: packs carry team
  names only. Student names reach the instructor only as typed on a submission.

## 4. Assignment types (Q9)

| Type | What the pack sets | Deliverables |
|---|---|---|
| Assessment steps | Which of the 19 steps; starting point: MediBec, CanaRetail, a blank organisation, or case documents attached by the instructor | The named deliverables (workbook, report, scenario portfolio, management summary) |
| Quiz | Chapters, number of questions, answer reveal | The quiz result |
| Exercise | See §6 | The after-action report |
| Policy writing | A Security Policy Writer task (organisation, policies to draft, language) | The Writer's draft or Word export (NV-E07: first lab using the Writer) |

## 5. Quiz (Q4, Q14)

- Self-check by chapter from the book's 420 multiple-choice review questions, with the **public answer key**; each answer
  shows right or wrong and the chapter section to reread ("Read more: Chapter N — section"). **Rationales stay
  Educator-only** and are never shipped.
- **English and French.** The French questions come from the French edition (v2.51 FR); the build needs its full text
  (a UTF-8 plain-text export of the .docx). Until it is available, French mode offers the English set and says so.

## 6. Exercises (Q8, Q10, Q15)

- **Tabletop role-play.** Roles: incident commander, SOC analyst, CISO, communications, legal/privacy, IT operations (an
  exercise lists the roles it uses). **Teams pick their roles** in the application unless the pack fixes them per member.
- **Injects** stay hidden until the facilitator reads out their **unlock code**; the facilitator controls the tempo; works
  offline.
- **After-action report** (the deliverable): when each inject was opened, each decision with the role that took it and its
  time, the debrief answers, and links to the book chapters. Alerts and indicator matches in an exercise are exercise
  material, never confirmed incidents (evidence-discipline rule).
- **Four sample exercises** (fictional, each with roles, 6–10 injects and debrief questions tied to book chapters), shipped
  as a course pack:
  1. Ransomware across MediBec's clinics;
  2. Compromised supplier at CanaRetail (third-party breach);
  3. Business email compromise and payment fraud;
  4. Cloud storage exposure of personal information (Québec Law 25 notification).

## 7. Submissions (Q16)

A submission file contains the **full workspace** (the instructor can open it in the application), the **named
deliverables**, the **AI-use log**, the **19-step progress** and the quiz or exercise results, with a checksum and the
submission time (late flagged). Student names only as typed on the submission.

## 8. Grading (Q7)

- The instructor scores each submission against the pack's **rubric** (criteria, levels, weights, comments).
- The application **pre-fills objective evidence** — quality-review results, 19-step progress, quiz score, exercise
  timeline — as evidence for the grader, **never as the grade**.
- Grades export as a **CSV in Moodle's grade-import format** (identifier column mapped to the roster).

## 9. Course packs (Q11)

A signed bundle of assignments, rubrics, quizzes and exercises an instructor exports once and reuses each term, or shares
with another instructor, who re-signs it under their own key. The four sample exercises (and the Education labs, when their
source is available) ship as one.

## 10. Screens and placement

- Instructor (Educational edition): **Settings → Classroom** (key, fingerprint, roster), **Classroom → Packs**,
  **Classroom → Submissions & grading**, **Classroom → Course packs**.
- Student (every edition): **Classroom → My assignments** (import, status, due date, submit), **Quiz**, **Exercise**
  (roles, unlock codes, decisions, after-action report).
- English and French throughout; WCAG 2.1 AA (t84 covers the new routes).

## 11. Done when

- Packs: sign, verify, refuse on a bad signature or an unannounced key change; settings enforced (AI, proposals, reveal).
- Round trip: instructor builds a pack → student imports, works, submits → instructor opens, grades, exports the CSV.
- Quiz in EN and FR (FR as soon as the source is supplied); no rationale anywhere in the package.
- The four sample exercises play end to end with unlock codes and produce an after-action report.
- Tests: new browser suites for the round trip, the signing and key pinning, the quiz and an exercise; the existing suite,
  t84 accessibility and all gates green; the label check on the shipped exercise texts.

## 12. Build status (19 November 2026)

| "Done when" item | Status | Where |
|---|---|---|
| Packs: sign, verify, refuse on a bad signature or an unannounced key change | Done | `crg_classroom.py`, `test_classroom.py`, t85 |
| Settings enforced (AI, proposals, reveal) | Done | `js/ai.js` route, `js/ontoprop.js`, Quiz tab; t85, t87 |
| Round trip: pack → import → work → submit → open, grade, CSV | Done | t87 |
| Quiz in English and French; no rationale anywhere in the package | Done | `scripts/build_quiz.py`, `js/data/quiz.js`; t85 |
| Four sample exercises play end to end with unlock codes and an after-action report | Done | `examples/classroom/sample-exercises.json`, `js/exercise.js`; t86 |
| Tests, t84 accessibility on the new routes, all gates green | Done | t84 (student routes), t88 (instructor screens and working states) |
| Label check on the shipped exercise texts | Done | `hooks/check_labels.py`: no outdated wording |

Choices made during the build, within the spec:
- **Instructor side and the source tree.** The instructor side is shown when `js/edition.js` is the Educational
  edition. The source tree is the Community edition, so the instructor tabs appear only in the Educational package;
  t87 and t88 draw them directly.
- **Unlock codes.** Codes are generated fresh each time an exercise pack is built and printed on the facilitator sheet.
  The shipped sample source holds no code. Its inject texts are public in the repository, so for graded work the
  instructor writes their own exercises.
- **Rubrics.** The default rubrics have four criteria for assessments and three for exercises, with five levels. They
  are a starting point; a pack can carry its own (`content.rubric`).
- **Roster and grades.** They are kept in the confidential folder used for the organisation graphs, so they move with
  it.
