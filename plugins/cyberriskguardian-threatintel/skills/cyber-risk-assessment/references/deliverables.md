# Deliverable conventions

## Formats
- **Management report** — Word (.docx) when the user asks for Word; otherwise the environment's document format. Build Word files with the `docx` npm package (docx-js): US Letter or A4 as requested, Arial, navy headings, tables with explicit DXA widths, `ShadingType.CLEAR`, numbered/bulleted lists via numbering config, a table of contents with `features: { updateFields: true }`. Render to PDF (LibreOffice headless) and inspect pages before delivering.
- **Workbook** — Excel (.xlsx) built with openpyxl using **live formulas** (never hard-coded results), Arial, blue = inputs, black = formulas, green = cross-sheet links, yellow fill = key assumptions. Recalculate with LibreOffice headless and confirm **zero formula errors**; then cross-check key cells against `scripts/crg_calc.py`.
- Use `scripts/build_workbook.py <scenarios.json> <out.xlsx>` for the standard CRG workbook (Parameters, Analyse, Inputs, Portfolio, Sensitivity, Case_View, Scenarios, Candidates, KRIs, Evidence).
- Keep one data model (JSON, see `assets/scenario-template.json`) as the single source of truth for both the workbook and the report so numbers cannot diverge.

## Report outline
Executive summary · scope and methodology (incl. evidence register, formulas and, when used, the CRGO release) · organizational and technology context (crown jewels) · legal applicability and compliance posture (when CRGO is used) · risk appetite (with appetite sensitivity table) · scenario development and selection (candidates, screening, consolidation, watch list) · scenario portfolio table · detailed scenarios (statement, stakeholders, background, threat, vulnerabilities, assets, existing controls with control evidence (result, assessor line, date), detection and response readiness (CRGO 0.10.0), narrative, event sequence, consequences, parameter table with rationale/evidence/confidence, CVSS vector and metric rationale, calculation table, treatment and result callout) · cross-scenario analysis · sensitivity · prioritization and treatment portfolio · cybersecurity budget · implementation roadmap · KRIs · cross-check with any organization-native scoring method · assumptions, limitations, methodological notes · management decisions required (each marked **Management decision required**).

Call the computed values risk indices (estimated, tolerated, mitigated and residual risk, risk-to-tolerance ratio), never KRIs; the KRIs section lists measured indicators only. In the treatment portfolio, record transfer (insurance, contract terms) as a costed line with the share of loss covered and the approver, claiming no reduction. Run the label check (`/label-check`) on every deliverable before release.

### Quick-scan summary (`/crg-quick-scan`)
One table — ID, scenario (short causal chain), CVSS-B, Re, Rt, pre-treatment ratio, verdict, main information gap — then the candidate count and dispositions, the strongest unselected candidate, the threat-context snapshot date and the decisions required. No treatment, residual or budget figures.

### Tables added in v1.3.0 (when CRGO is used)
Cite the CRGO release in *scope and methodology*: "CRGO v0.10.1 (ontology release 0.10.1), contracts dss/v1, compliance/v1 and secops/v1, as of <date>" (with a v0.9.1 checkout: "CRGO v0.9.1 (ontology release 0.9.0), contract dss/v1"). `scripts/crgo_contract.py context --summary` prints both tables from the risk context.

**Legal applicability** (context section; one row per provision or instrument):

| Provision | Instrument | Applicability | Unresolved conditions | Compliance state | Evidence gap |
|---|---|---|---|---|---|

- Applicability is one of: applicable · not applicable · **potentially applicable — qualified review required** · **unknown — Information gap — organizational validation required**. Never print unknown as not applicable. If no obligation is linked, say so as an **Information gap — organizational validation required**.
- Compliance state comes only from a recorded compliance determination with its evidence or explicit evidence gap. A control that *supports compliance with* a provision never makes the row "compliant".
- State that this is an evaluation over the stated organisation profile, not legal advice. Cite provisions by identifier and official heading only.

**Control evidence** (existing-controls table of each detailed scenario): add a column *Control evidence* giving, per control, the latest result (effective / partly effective / ineffective / not tested), the **assessor line** (management self-assessment, second line, internal audit, external assurer), the aspect (design, implementation, operation), the date and open findings. Mark a self-assessment-only control as lower-grade evidence and flag a self-assessment that disagrees with an independent result as a **conflict** (show both).

Licensed standards (IIA, ISACA, AICPA, COSO, ISO) appear in reports only as identifiers, official headings and CRGO paraphrases; never reproduce their text. Results written back to CRGO are reported as **proposed**, never as approved, accepted or funded.

### Tables added in v1.4.0 (when CRGO 0.10.0 is used)
Both come from read-only contracts dated to the assessment date (`--as-of`): `scripts/crgo_contract.py compliance --summary` and `secops --summary` print them; the JSON goes to the git-ignored `output/crgo/`.

**Compliance posture** (context section, after legal applicability; one row per obligation in `compliance/v1`):

| Obligation | Applicability | State | Evidence status | Exceptions without exemption | Next deadline |
|---|---|---|---|---|---|

- *State* is the organisation's latest recorded compliance determination and its date. A mapping, policy statement, acknowledgement or attestation never fills this column.
- A state recorded on evidence that is **expired**, **judged insufficient** or absent is reported as a **gap, not compliance**; partially satisfied and unsatisfied are gaps too.
- *Exceptions without exemption*: active exceptions whose `provisionsWithoutExemption` includes the obligation — a compliance exposure, since only an authority grants an exemption.
- *Next deadline*: earliest unanswered deadline with its computed due time; mark it **overdue** when the due time has passed. List deadlines tied to the programme rather than an obligation below the table, with overdue review of directive versions and findings with overdue corrective actions.
- Applicability wording as in the Legal applicability table (unknown → Information gap — organizational validation required; potentially applicable → qualified review required). Not legal advice.

**Detection and response readiness** (cross-scenario analysis, and in each detailed scenario's existing controls; one row per scenario in `secops/v1`):

| Scenario | Coverage validated | Gaps | Playbook simulated |
|---|---|---|---|

- *Coverage validated*: yes only when an effective detection test supports it; otherwise state the coverage status (untested, degraded, missing) and the ATT&CK techniques. No coverage recorded is an evidence gap.
- *Gaps*: recorded detection gaps; add, below the table, rules whose required telemetry is silent (they do not detect) or degraded.
- *Playbook simulated*: whether a simulation of the current playbook version passed.
- Below the table: untriaged alerts (flag crown jewels; an alert is never an incident or an attribution), executions without a valid approval with the reason (an **audit signal**: never write that CRGO authorised or did not authorise the action — **Management decision required**), and incidents whose regulatory reportability is undetermined (qualified review required).
- Respect TLP markings on any threat-intelligence material quoted. Source confidence values are not probabilities.

## Scenario-selection workbook (Sections A–E)
README · A_Context · A_AssetMap · A_Dependencies · B_Candidates · C_Weights · C_Screening (12 criteria 1–5, totals, weighted scores, escalation flags, evidence basis, confidence, disposition, family) · C_Sensitivity (family score = MAXIFS of member candidates under each weighting scheme; ranks; "selected by judgement" and "explicit review" flags) · D_Portfolio · D_WhyTest · D_QuantPrep · D_Validation · E_Coverage · E_Quality · Changes. A reference implementation is in `examples/medibec/source/build_sel.py` of the repository.

## Delivery
- State results in one or two sentences; do not recap every step.
- Put the key numbers (counts above/at/below tolerance, portfolio cost, budget %) and the decisions required in the reply.
- Flag every judgement call where the selection or recommendation deviates from the scores.
- Keep deliverable file names stable and descriptive (`<Org>_Cybersecurity_Risk_Assessment[_variant].docx`, `<Org>_CyberRiskGuardian_Workbook[_variant].xlsx`, `<Org>_Scenario_Selection.xlsx`).
