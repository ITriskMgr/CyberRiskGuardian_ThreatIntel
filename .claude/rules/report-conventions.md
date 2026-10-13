---
paths:
  - "**/*.docx"
  - "**/build_docx*.js"
  - "**/*report*"
---

# Report conventions

- Generate Word reports with docx-js from the same JSON data model as the workbook, so numbers cannot diverge.
- Follow the management-report outline in `skills/cyber-risk-assessment/references/deliverables.md`.
- Tables: explicit DXA column widths that sum to the content width; `ShadingType.CLEAR`; no literal bullet characters.
- Every detailed scenario shows its parameter table (value, reading, rationale, evidence, confidence), CVSS vector and metric rationale, and the calculation substitution.
- Render to PDF and inspect page images before delivery; fix overflow, empty tables and placeholder text.
- Any statement of the form "only X remains above tolerance" or "N scenarios change" must be computed from the data, not typed by hand.
- When CRGO was used: cite its release ("CRGO v0.10.0, ontology release 0.10.0, dss/v1, compliance/v1, secops/v1, as of <date>"); include the **Legal applicability** table and the **Control evidence** column with the assessor line (`crgo_contract.py context --summary`) and, with CRGO 0.10.0, the **Compliance posture** and **Detection and response readiness** tables (`compliance --summary`, `secops --summary`); report evidence expired or judged insufficient as a gap, approval gaps as audit signals, and never an alert as an incident; report write-backs as proposed; never call an obligation compliant because a control maps to it; never reproduce licensed standards' text.
