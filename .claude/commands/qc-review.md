---
description: Quality-control review of a risk assessment deliverable
argument-hint: "[report / workbook path]"
---

Delegate to the `risk-qc-reviewer` agent to review $ARGUMENTS against the CyberRiskGuardian quality-control checklist and the 14 critical scenario-selection rules, including, when CRGO was used, the write-back checks (model version, inputs, status proposed, nothing cited as approved), legal-applicability wording (supports is not compliant; unknown is an Information gap — organizational validation required), EPSS not used as likelihood, no reproduced text of licensed standards, client graphs kept out of both repositories, and, with CRGO 0.10.0, the seven added rules (no compliance from a mapping, statement, acknowledgement or attestation; no incident or attribution from an alert or indicator; no response action presented as authorised by CRGO; coverage validated only by an effective detection test; source confidence not a probability; TLP respected; no licensed standard text). Return findings ranked by severity with the exact location and a suggested fix; do not edit the files.
