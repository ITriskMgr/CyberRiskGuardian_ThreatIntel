# SIEM and SOAR in CyberRiskGuardian — current state

*Briefing for a needs and improvement analysis. Written 26 November 2026 from the repository on branch
`claude/eloquent-brown-hc7ajh`. Describes CyberRiskGuardian Desktop **1.9.5 Beta** (`desktop/app/js/version.js`) and
the Threat Live-feed plugin with CRGO 0.11.2. © 2026 Marc-André Léger, CC BY-NC 4.0.*

Parts 1 to 9 are facts read from the code, tests and guides, with file references. Part 10 lists observations for the
needs analysis; they are an analyst's reading, not decisions.

---

## 0. In one paragraph

CyberRiskGuardian has a **local SIEM and SOAR**. It is not a log platform and not an orchestration engine.
The **SIEM** module is a register of the organization's detection programme: telemetry sources and their health,
detection rules and their lifecycle, detection tests, coverage of the risk scenarios, detection gaps, alerts and threat
indicators. The **SOAR** module is a register of the response: cases, incident confirmation, versioned playbooks,
approval gates and decisions, response actions recorded by hand, dry-run simulations, communications and lessons.
**All data arrives as local files.** No events are ingested, no connector exists, and nothing is ever executed on
a real system. The value for CRG is **evidence about detective and response controls**, read at an as-of date. It
feeds scenario selection (steps 3–5), existing-control assessment (step 8) and confidence in the parameters (step 9),
especially θ. It **never sets a parameter value** and never changes a risk score.

The SIEM and SOAR were introduced in Desktop **1.6.0 (13 October 2026)**. The module headers still say "Beta 1.6.x".
Later releases hardened them, for example the Sigma validation of NV-063 in 1.9.2.

---

## 1. Where it lives

| Layer | Files | Role |
|---|---|---|
| SIEM model | `desktop/app/js/siem.js` (662 lines) | registers, vocabularies, health, rule lifecycle, coverage, triage, indicators/TLP, parsers (Sigma subset, STIX 2.1, CSV, envelope), import |
| SOAR model | `desktop/app/js/soar.js` (430 lines) | cases, incident confirmation, playbooks and hashes, gates and approvals, approval audit check, dry runs, submissions, measurements, lessons, import |
| SIEM screens | `js/panels/siem.js`, `siem_rules.js`, `siem_alerts.js` | Overview · Telemetry sources · Detection rules · Coverage & gaps · Alerts & triage · Indicators & TLP · Import |
| SOAR screens | `js/panels/soar.js`, `soar_ops.js` | Overview · Cases · Incidents · Playbooks · Approval gates · Actions · Simulations · Lessons learned |
| Bridge to risk method | `js/secops_seed.js` (349 lines) | scenario seeds and per-scenario evidence from SIEM/SOAR records |
| CRGO export / read | `js/dss.js` (SIEM/SOAR → organisation graph input; `secopsContext()` line 299), `desktop/app/crgo_bridge.py` (line 454 onwards: records in CRGO 0.10 terms) | organisation graph and secops/v1 read |
| Quality review | `js/panels/qc.js` QC-14 to QC-18 | guardrail checks over SIEM/SOAR data |
| Teaching data | `js/simgen.js`, `js/panels/settings_sim.js`, `data/simulation/medibec/` | simulation packs, AI pack generation, validation, import/removal |
| Formats | `desktop/app/docs/SIEM-SOAR-IMPORT-FORMAT.md`, `docs/SIMULATION-DATA-GUIDE.md` | `crg-siem-import/1`, `crg-soar-import/1`, `crg-simulation-pack/1` |
| User guide | `desktop/app/USER-GUIDE.md` §7.8 (lines 3046–3182), Settings → Simulation data (line 3742) | screen-by-screen behaviour |
| Plugin (Claude Code) | `plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/crgo_contract.py secops` (`secops_gaps` line 520, `summarize_secops` line 552); `references/crgo-integration.md` §"Reading the secops context"; `references/deliverables.md` "Detection and response readiness"; `agents/risk-qc-reviewer.md` item 9 | the plugin reads SIEM/SOAR only **through CRGO secops/v1** |
| Tests | `desktop/tests/t17_siem.mjs`, `t18_soar.mjs`, `t19_simulation.mjs`, `t20_secops_scenarios.mjs`, `t21_crgo_010.mjs` (plus t64, t75, t81 touch them) | Playwright suites against the running app |

Menu: **Security operations → SIEM / SOAR** (`js/menu.js` lines 66–68). Each module can be switched off in
**Settings → Modules**.

---

## 2. Design boundaries (rules, not missing features)

These come from `AGENTS.md`, `.claude/rules/threat-intel.md`, `.claude/rules/evidence-discipline.md` and the CRGO 0.10
secops/v1 contract. They are enforced in code and checked by QC. Any improvement proposal has to respect them or
explicitly propose a change to the method, which is a **Management decision required** for the method owner.

| Rule | Where it bites |
|---|---|
| **No network in the calculation path; no live connector.** The external SIEM stays the system of record for events. An event here is a pointer: reference, time, hash and link, never the payload. | all imports are local files (`siem.js` header, `soar.js` header) |
| **An alert is never an incident, nor an attribution.** Escalation opens a SOAR case. Only a **confirmation by a named person on a date** makes an incident. | `siem.escalate()` line 283; `soar.confirmIncident()` line 102; import refuses `triage: "escalated"`; QC-15 |
| **Nothing authorises a response action.** Approvals are recorded human decisions. An execution without a valid approval is an **audit signal**, never an authorisation or a condemnation. | `soar.approvalReason()` line 234; QC-16 |
| **Default-deny** for `containment` and `destructive` actions, whatever the gates say. **No self-approval.** | `ALWAYS_GATED`, `approvalError()` line 199 |
| **Coverage is validated only by an effective detection test** of the rule's current version, dated on or before the as-of date, with telemetry that is not silent and not degraded. | `ruleCoverage()` line 210 |
| **Source confidence (STIX 0–100) is not a probability.** It never feeds Pb(A) or Pb(ψ,A) and is never sent to AI. | `normConfidence()`; QC-18; `secops_seed.aiSummary()` |
| **TLP 2.0 travels with every indicator and alert.** TLP:RED and TLP:AMBER+STRICT are masked on screens (opt-in per computer), never sent to AI, and left out of exports unless the user chooses to keep them marked. | `tlpFilter()` / `tlpCsv()` line 321; QC-17 |
| **Records inform, never set, a parameter.** | `secops_seed.js` header and `toDraft()` (neutral placeholders) |

SIEM/SOAR records are **organizational evidence**: the organization's own telemetry and response records. They are not
external threat intelligence. This is why a seed may *inform* θ or δe, while a threat feed may only touch Pb(A) and
Pb(ψ,A). The two rules do not conflict.

---

## 3. Data flow

```
 Your SIEM / SOAR / TIP / Sigma repo           (outside CRG — system of record)
        │  export to file (JSON envelope, Sigma YAML, STIX 2.1 bundle, CSV)
        ▼
 Desktop import (local file, SHA-256 recorded, data log)          Settings → Simulation data (teaching packs)
        │                                                                 │
        ▼                                                                 ▼
 ws.siem {sources, strategies, rules, tests, coverage, gaps,      ws.soar {cases, playbooks, gates, approvals,
          alerts, indicators, events, imports}  ── escalate ──▶            executions, simulations, lessons, impacts,
                                                                           communications, recoveries, measurements,
                                                                           artefacts, imports}
                                                     │ confirm (person + date)      │ regulator notice
                                                     ▼                              ▼
                                         ws.csm.incidents (incident register)   ws.cms.submissions (Compliance)
        │                                                                  │
        └───────────────┬──────────────────────────────────────────────────┘
                        ▼
  As-of-date views ─ coverage matrix · telemetry health · triage queue · approval audit signals · playbook readiness
                        │
     ┌──────────────────┼──────────────────────┬─────────────────────────────┬─────────────────────┐
     ▼                  ▼                      ▼                             ▼                     ▼
 Scenario seeds    Scenario editor:       AI scenario proposals        QC-14…18 checks       CRGO organisation graph
 (Batch → From     read-only "Security-   (TLP-filtered seeds,                                → secops/v1 read
 security ops)     operations evidence"   no source confidence)                                (desktop + plugin)
```

---

## 4. SIEM module — what it holds and how it reasons

### 4.1 Registers (`ws.siem`, `siem.reg()` line 126)

| Register | CRGO class | Key fields |
|---|---|---|
| `sources` | telemetry source (CRGO_0001097) | system, asset, OCSF 1.9.0 class, ATT&CK data components, parser, Sigma `logsource`, `cadenceHours`, `lastSeen`, `health`, dated `healthHistory` |
| `strategies` | detection strategy (CRGO_0001101) | ATT&CK `DET####`, analytics `AN####`, data components, techniques |
| `rules` | detection rule (CRGO_0001102) | version, language (sigma/native/correlation/yara), status, level, owner, approver, techniques, scenarios, `requiredSources`, strategy, detection text, dated `history`, previous `versions[]` |
| `tests` | detection test (CRGO_0001108) | rule + rule version, date, tester, result (effective/ineffective), method (replay, emulation, purple team, unit) |
| `coverage` | detection coverage (CRGO_0001106) | assertion scenario/technique → rules (status is **computed**, never imported) |
| `gaps` | detection gap (CRGO_0001107) | scenario, technique, missing/silent source, status open/accepted/closed, linked corrective actions |
| `alerts` | alert (CRGO_0000551) | source system + external id + version (dedup key), rule + version, times, severity, confidence, asset, techniques, scenarios, indicators, event pointers, TLP, triage, verbatim `original` |
| `indicators` | threat indicator (CRGO_0001104) | STIX id, type/value/pattern, validity, confidence + method, source, TLP, revoked, sightings |
| `events` | security event record (CRGO_0001098) | pointer only: external ref, source, times, OCSF class, parser, hash, link |
| `imports` | — | file, kind, counts, SHA-256, user, errors, TLP default |

### 4.2 Reasoning at an as-of date

Every view can be replayed at a past date. Later tests, health observations and status changes are then ignored.

- **Telemetry health** (`healthAt()` line 142): the latest observation on or before the date. A source becomes
  **silent (stale)** when `lastSeen` is older than 3 × `cadenceHours`. A required source that is not registered counts
  as silent.
- **Rule status** (`statusAt()` line 158), from dated transitions.
- **Coverage per rule** (`ruleCoverage()` line 210):
  - **missing**: not created yet, draft, disabled or retired;
  - **degraded**: required telemetry silent or degraded, rule in testing, or latest test ineffective;
  - **untested**: in production with no effective test;
  - **validated**: in production, latest test effective, telemetry healthy.
- **Coverage matrix** (`coverageMatrix()` line 234): one row per (scenario, ATT&CK technique). Rows come from the
  scenarios' `attack` techniques, the rules' links and the coverage assertions. A technique-only rule also covers
  every scenario that uses the technique. A row takes the **best** status among its rules, and shows any open gap.
- **Rule lifecycle in the application** (`transitionError()` line 176): production only from testing, only after an
  effective test of *this version*, only with an approver who is **not the owner**; a retired rule stays retired.
- **Triage priority** (`triageWeight()` line 266): crown jewels first, then
  `score = round(severityWeight × 20 × (0.5 + criticality/100) + 25 if crown jewel)`. Severity weights run from
  low = 1 to critical = 4. Criticality comes from the asset register; it defaults to 100 for a crown jewel and 30
  otherwise. Ties are broken by most recent detection.
- **Escalation** (`escalate()` line 283) creates or reuses a SOAR case. The alert id is the idempotency key. The
  alert's triage becomes `escalated`, which maps to CRGO disposition *indeterminate*.
- **Indicators**: stale when revoked or past `validUntil` ("supports no inference"). STIX patterns are generated or
  parsed for simple equality patterns. The *Indicators across SIEM and threat feeds* table merges SIEM indicators, the
  IOC watch list and the loaded feeds (`siem_alerts.js mergeRows()`); it shows counts only and draws no inference.

### 4.3 Import (`importText()` line 529)

| Accepted input | Notes |
|---|---|
| `crg-siem-import/1` envelope (JSON) | every list optional; processing order: sources → strategies → rules → tests → indicators → STIX sightings → alerts → gaps → coverage → events |
| Sigma YAML (one or more documents) | in-house **YAML subset** reader; requires `logsource` and `detection` mappings (1.9.2, NV-063). Sigma status maps experimental → draft, test/stable → testing, deprecated → retired, **never production**. `attack.t####` tags become techniques; the detection block is kept verbatim. |
| STIX 2.1 bundle | `indicator` objects become indicators, with TLP from 2.0 or 1.0 marking ids or named markings. Each `sighting` is attached to its indicator **and** becomes an alert to triage. Other object types are counted and skipped. |
| Alerts as a JSON list; CSV of alerts, sources or indicators | kind detected from the header or chosen by the user |

Deduplication is **add-only**:

- sources append a new health observation;
- rules with the same id or Sigma id and the same version are skipped; a new version pushes the old one into `versions[]`;
- alerts are skipped on the same `sourceSystem + externalId + version`, and the original stays;
- other registers are deduplicated by id.

---

## 5. SOAR module — what it holds and how it reasons

### 5.1 Registers (`ws.soar`, `soar.reg()` line 52)

`cases`, `playbooks` (with `versions[]`), `gates`, `approvals`, `executions`, `simulations`, `lessons`, `impacts`,
`communications`, `recoveries`, `measurements`, `artefacts`, `imports`. Incidents live in the **shared incident
register** `ws.csm.incidents`, the same records as Cybersecurity management → Incidents. Regulator notices create
`ws.cms.submissions` in Compliance management.

### 5.2 Behaviour

| Function | Behaviour |
|---|---|
| Case lifecycle (`advance()` line 82) | open → investigating → contained → eradicated → recovered → closed, **one stage at a time**; closing (from any stage) needs a rationale; every change needs a named person and goes to the timeline. Mapped to CRGO case status (open→new, eradicated→recovering, recovered→resolved). |
| Incident confirmation (`confirmIncident()` line 102) | needs a person and a date; creates or links the incident and records confirmed date and confirmer. Personal information sets Loi 25 / GDPR reportability to *undetermined*. Compliance computes notification deadlines from the confirmed date. |
| Playbooks (`publishErrors()` line 140, `publish()`, `newDraft()`, `verifyVersion()`) | one draft and one published version at a time. Publishing freezes the version with a **SHA-256** over a canonical JSON of trigger and steps, and retires the previous version. Published versions are never edited. A containment or destructive step must name a gate or require one. Executions pin the exact version. |
| Gates and approvals (`gatesFor()`, `isGated()` line 186, `approvalStatus()`, `approvalError()`) | a gate lists risk classes, crown-jewel applicability, authorities and validity. An approval is *specific* (one action or execution) or a *pre-authorisation*, which needs an expiry, risk classes and a scope (targets, case or written scope). No self-approval. Revocation needs a named person. |
| **Approval audit check** (`approvalReason()` line 234, `unapproved()`) | for each gated execution: `absent`, `not-granted`, `not-corresponding`, `wrong-authority`, `not-yet-valid`, `revoked`, `expired`. When several approvals are cited, the most telling reason is shown. Same rule as CRGO `approval_reason` / SHACL ActionApproval / CQ-SOAR-02. |
| Dry run (`dryRun()` line 275, `recordSimulation()`) | walks a playbook version against a case or scenario at a time. For each step it shows whether approval is needed and whether a valid approval or pre-authorisation is in force. A step fails with no action, no risk class, an unknown gate or **no expected evidence**. A gated step without an approval path is flagged, not failed. `executed: false` always. A playbook counts as tested only with a passed simulation of its **current** version. |
| Communications (`syncSubmissions()` line 314) | a regulator notice names its authority and creates the regulatory submission once |
| Measurements (`proposeMeasures()` line 334) | *proposes* time to detect, acknowledge, contain and recover, and dwell time, in hours, from recorded dates |
| Lessons (`lessonAction()`) | create a corrective action in the shared register, which closes only after independent verification |

### 5.3 Import (`importDoc()` line 390)

- Input: `crg-soar-import/1`.
- Records are validated **one by one**. An invalid record is skipped and listed; the others are imported.
- **A record with an existing id replaces it.** This differs from the SIEM importer, which only adds.
- Published hashes are recomputed; a supplied hash that does not match is reported as a warning.
- `confirmations` go through `confirmIncident()`. Regulator communications create submissions.
- **Time zones are ignored.** Times are compared as written, so one file must use one zone.

---

## 6. Connections to the risk method

| Consumer | What it does with SIEM/SOAR | Reference |
|---|---|---|
| **Scenario seeds** (Batch scenarios → *From security operations (SIEM & SOAR)*) | nine seed kinds; see the list below the table | `secops_seed.seeds()` line 107 |
| Seed → draft | parameters are **neutral placeholders** the analyst must set; `pattern: 'secops'`, no treatment | `toDraft()` line 272 |
| Seed → existing scenario | records evidence links in `s.secops`; never touches a parameter | `attachEvidence()` line 293 |
| **Scenario editor** | read-only *Security-operations evidence* card | `scenario.js` line 287, `scenarioEvidence()` |
| **AI scenario proposals** | optional *Include security-operations evidence*. The summary is TLP-filtered and has no source confidence. Alert and case titles are wrapped as **untrusted data** (prompt-injection guard). | `ai.js` line 429, `panels/ai.js` line 244 |
| **Quality review** | QC-14 (no compliance from mappings), **QC-15** (no incident from an alert), **QC-16** (no action presented as authorised without a valid approval; warn), **QC-17** (no restricted TLP in reports or exports), **QC-18** (confidence never a probability) | `panels/qc.js` lines 101–113, 276–304 |
| **CRGO organisation graph** | SIEM and SOAR records written in CRGO 0.10 terms, following CRGO's synthetic Nordelle samples | `dss.js` lines 97–215, `crgo_bridge.py` lines 454–570 |
| **secops/v1 read** (desktop) | Ontology · CRGO → Organisation link reads coverage, rules and telemetry, untriaged alerts, gates, executions without valid approval and open regulatory triage | `dss.js secopsContext()` line 299 |
| **secops/v1 read** (plugin) | `crgo_contract.py secops --summary` produces the report table *Detection and response readiness* (Scenario · Coverage validated · Gaps · Playbook simulated) and the step 8–9 evidence list | `crgo_contract.py` lines 520–575; `deliverables.md` line 47 |
| **Teaching** | Settings → Simulation data imports packs, marks every record `simulation: true` and `simPack`, and removes them; *Generate with AI* plus `validatePack()` | `settings_sim.js`, `simgen.js` |

The nine seed kinds, each with its evidence (kind, id, date, TLP) and the parameters it *may inform*:

- detection gap;
- untested coverage;
- degraded telemetry;
- alert cluster (by technique and asset; benign and false-positive alerts are skipped but counted);
- confirmed incident (only those with a confirmation date and a named person);
- case (not an incident);
- approval gap;
- unsimulated playbook;
- lesson learned.

A seed that matches an existing scenario becomes evidence for that scenario rather than a new one.

**Not connected today** (searched by import path and direct `ws.siem` / `ws.soar` access): the desktop Word/PDF report
and export modules (`exportx.js`), the KRI dashboard, the budget module and the risk engine `crg.js` import nothing
from `siem.js`, `soar.js` or `secops_seed.js`. In the desktop, SIEM/SOAR reach the report only indirectly, through
analyst-written scenarios and rationale. In the plugin, they reach it through CRGO secops/v1.

---

## 7. Where each rule is enforced

| Rule | Editing in the app | SIEM file import | SOAR file import |
|---|---|---|---|
| Rule to production needs an effective test, from testing, with an independent approver | **enforced** (`transitionError`) | **not enforced**: an envelope may deliver a rule already `production` (the SIEM is the system of record for imported states). Sigma never yields production. | — |
| Coverage *validated* only by an effective test | computed | computed (assertions carry no status) | — |
| Alert never escalated by file | — | **enforced** (`escalated` refused) | a case is accepted as recorded |
| Case moves one stage at a time | **enforced** (`advance`) | — | **not enforced**: status taken as recorded |
| No self-approval; bounded pre-authorisation | **enforced** | — | **enforced**: record skipped (`approvalError` in `VALID.approvals`) |
| Execution needs action, risk class, performer and a unique attempt id | **enforced** (`executionError`) | — | **not enforced**: only `id`, `started` and `status` are required |
| Containment or destructive step needs a gate | **enforced** at publish | — | **not enforced** for imported published versions (risk class checked, gate presence not). The audit check still flags their executions. |
| Incident only by named confirmation | **enforced** | **enforced** | **enforced** (through `confirmIncident`) |
| Published playbook immutable, hashed | **enforced** | — | hash **recomputed**, mismatch warned |

---

## 8. Formats and teaching data

- **`crg-siem-import/1`** and **`crg-soar-import/1`** are fully specified in
  `desktop/app/docs/SIEM-SOAR-IMPORT-FORMAT.md`, with field tables, value sets, CRGO term mappings and examples.
  Standards are referenced **as formats only**: OCSF 1.9.0, Sigma, STIX 2.1 / TAXII, TLP 2.0, MITRE ATT&CK (techniques,
  detection strategies, analytics and data components).
- **`crg-simulation-pack/1`**: a manifest (learning objectives, day-by-day storyline, exercises with expected findings,
  expected import counts) plus one SIEM and one SOAR file. One pack is bundled: **MediBec — phishing to ransomware on
  the EHR**, a fictional case covering three weeks of SOC activity. It contains:
  - SIEM: 12 sources, 2 strategies, 13 rules, 12 tests, 15 indicators, 40 alerts, 3 gaps, 2 coverage assertions,
    6 event pointers;
  - SOAR: 5 playbooks, 2 gates, 4 cases, 8 approvals, 11 executions, 4 simulations, 1 lesson, 1 artefact.

  Every teaching point is built in: alert ≠ incident, crown-jewel triage, false positives from the same rules, every
  approval failure reason, healthy, degraded, silent and stale telemetry, a blind spot, restricted TLP and stale
  intelligence. A pack never contains confirmations: students confirm the incidents themselves. Observables use only
  RFC 5737 and RFC 3849 documentation addresses and reserved domains. Teaching data is never organizational or
  calibration evidence.

---

## 9. Tests

| Suite | Covers | Result in this session |
|---|---|---|
| t17 SIEM | Sigma import, envelope with SHA-256 record, coverage by test and as-of date, silent telemetry → degraded, lifecycle, alert dedup, crown-jewel triage, idempotent escalation, STIX with TLP 2.0, TLP-aware exports | **98 passed, 0 failed** |
| t18 SOAR | no self-approval, expiry, revocation, authority, risk-class gates, frozen versions, dry run, confirmation, regulator notice → submission, lessons → actions, import | **60 passed, 0 failed** |
| t19 Simulation | MediBec pack through the real importers, coverage, triage order, audit signals, no incident from alerts, `validatePack` / `buildPrompt` | **64 passed, 0 failed** |
| t20 SecOps seeds | all nine seed kinds, benign/FP skipped and counted, dedup against existing scenarios, TLP handling | **62 passed, 1 failed**: the failing check is "no page errors", caused by HTTP 502 responses on resource loads. Probably this sandbox's blocked network or helper endpoint, not the seed logic. **Not confirmed.** |
| t21 CRGO 0.10 | compliance/v1 and secops/v1 through the app, helper and real ontology server | **not run**: needs a CRGO checkout; the `crgo-ontology` server failed to connect in this session |

The suites ran against a local `tests/serve.sh` server with the pre-installed Playwright. The secops/v1 behaviour
described above was read from code (`dss.js`, `crgo_contract.py`), not exercised.

---

## 10. Observations for the needs analysis

*An analyst's reading of the code, for discussion; nothing below has been decided. Items marked with the
**Management decision required** marker change the product's scope or method and belong to the product owner.*

### 10.1 Data intake

1. **No vendor converters.** Every SIEM or SOAR export must be reshaped into the CRG envelopes by hand or by an
   external script. Mapping tables or converters to `crg-siem-import/1` would remove the biggest adoption barrier
   without breaking the no-network rule. Candidate sources:
   - Splunk saved searches and notable events;
   - Microsoft Sentinel analytics rules and incidents;
   - Elastic detection rules and alerts;
   - Google SecOps, QRadar;
   - TheHive / Cortex, XSOAR, Tines for the SOAR side.
2. **Analyst-run pull tool (option).** A `threat_snapshot.py`-style script could fetch from a SIEM API on demand and
   write a dated, hashed envelope file for the analyst to import. It would keep the calculation path offline.
   **Management decision required**: this is a method change, because it adds a second fetching tool besides
   `threat_snapshot.py`.
3. **Alert state cannot be refreshed from the SIEM.** An alert with the same source, external id and version is
   skipped, and the original is kept by design. An upstream closure or reclassification therefore never arrives
   unless the exporter bumps `version`. The behaviour on a new version needs to be defined, as does what is kept
   for audit.
4. **Sigma coverage is partial.** The parser reads a YAML subset, keeps the detection block as text and does not
   evaluate it. Correlation rules and Sigma filters are not modelled. Which Sigma features analysts actually rely on
   is an **Information gap — organizational validation required**.
5. **Time handling is weak.** The SIEM compares dates on their first ten characters. The SOAR ignores time-zone
   offsets. Files from different zones can therefore misorder approvals against executions and skew the proposed
   measurements.

### 10.2 Import integrity

6. **The importers follow different policies.** The SIEM importer is add-only; the SOAR importer replaces a record
   with the same id **without keeping the previous version**. For an audit-signal register this is the weaker
   choice. A versioned replace with a history entry would make the two consistent.
7. **Imports bypass rules the app enforces** (see Part 7). A file can deliver:
   - a production rule with no test and no approver;
   - an execution with no performer or attempt id;
   - a published containment step with no gate;
   - a case at any status.

   One option is to keep importing as recorded but raise **import findings**: "imported as production without an
   effective test", and so on. These would count as audit signals, like the approval check.
8. **Approver identity is a free-text name.** Names are compared case-insensitively and are not tied to the
   application's users (`users.js`), so independence checks rely on spelling.

### 10.3 From records to risk decisions

9. **No desktop report section for detection and response readiness.** The plugin produces it through CRGO
   secops/v1. The desktop report and exports do not read SIEM/SOAR at all. A native section built from
   `coverageMatrix()`, `unapproved()` and `simulationPassed()` would reach report parity without needing CRGO.
10. **The plugin reads SIEM/SOAR only through CRGO.** Without a CRGO checkout, Claude Code assessments cannot use an
    organization's `crg-siem-import/1` or `crg-soar-import/1` files. A small script that reads the two envelopes
    and prints the same readiness table would close that gap.
11. **Response measurements stop at the incident.** `proposeMeasures()` computes times to detect, contain and
    recover, and dwell time, but nothing feeds the KRI module. These are natural **KRIs**: measured, with owner,
    source, frequency, target, warning and critical thresholds. Proposing KRI definitions from them would connect
    operations to monitoring (method step 19). Distinguish them from the risk indices, which are computed.
12. **The link from seeds to parameter rationale is manual.** Seeds name what they *may inform*: θ for detection and
    response, Pb(ψ,A) for unseen techniques, δe for incident impact. The analyst still re-types the evidence into the
    step 9 rationale. A one-click insert of the cited records, carrying the
    **Analytical estimate — validation required** marker and never a value, would help.
13. **The coverage matrix takes the best rule per pair and weights nothing.** Techniques are not weighted by their
    place in the scenario's causal chain or by crown-jewel exposure. ATT&CK data components on sources are recorded
    but not used to find telemetry that is missing for a technique.

### 10.4 SOAR depth

14. **No suggestion of a playbook for a case** by incident category or trigger. No RACI or role model behind gate
    authorities.
15. **Dry runs check structure and approvals only.** They do not check timing (SLA against the playbook),
    dependencies between steps, or whether the expected evidence was actually captured in later executions.
16. **Scale is untested.** The bundled pack has 40 alerts. Behaviour with thousands of alerts, and the workspace
    storage limits, were not measured: **Information gap — organizational validation required**.

### 10.5 Questions for the helpers

- Which SIEM and SOAR products must be supported first (item 1), and in which export formats?
- Is SIEM/SOAR in CRG primarily a **risk-evidence** feature, a **teaching** feature, or an **operational register**?
  The answer decides whether items 3, 6, 7 and 14–16 matter. **Management decision required**
- Should the desktop report carry detection and response readiness natively (item 9), or keep CRGO as the single path?
- Who owns approval identities: free names, the application's users, or the organisation's IAM register in CRGO?
