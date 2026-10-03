# NOTICE

**CyberRiskGuardian with Threat Live-feed** — © 2026 Marc-André Léger.
Licensed under the Creative Commons Attribution-NonCommercial 4.0 International License
(CC BY-NC 4.0). The full text is in `LICENSE` and at
https://creativecommons.org/licenses/by-nc/4.0/legalcode.

## Derivation

This repository is a derivative edition of **CyberRiskGuardian Agent v1.1.0**
(https://github.com/ITriskMgr/CyberRiskGuardian), by the same author and under the same licence.

Changes in this edition:
- threat-context snapshot lifecycle (`threat_snapshot.py`, 90-day expiry, pinned artifacts);
- the Threat Evidence Ladder and its five constraints;
- the `threat-context-calibration` skill, the `/refresh-threat-context` command, the
  `threat_context` MCP tool and the `threat-intel` rules;
- CVSS narrowed to **Base score only**, with exploitation evidence routed to `Pb(ψ,A)`;
- threat-driven revision log, watch list, and four threat-related KRIs;
- an intel-driven scenario-generation perspective.

No formula was changed. The MediBec baseline remains 84,491 / 41,104.

## What is covered
- The CyberRiskGuardian methodology, including:
  - the master task specification;
  - the scenario-selection instructions;
  - the budget guideline;
  - the formula and workbook conventions;
  - the threat-context reference and the Threat Evidence Ladder.
- The skills, commands, subagents, output styles, rules, hooks and configuration in this
  repository.
- The scripts, including `threat_snapshot.py`, and the MCP calculator server.
- The textbook *Introduction to Cybersecurity Governance for Business Technology Management*,
  3rd edition, version 2.1g (August 2026), in
  `plugins/cyberriskguardian-threatintel/skills/cybersecurity-governance/references/`.
- The fictional MediBec teaching case and the example deliverables in `examples/medibec/`.

## Suggested attribution
> *CyberRiskGuardian with Threat Live-feed* and *Introduction to Cybersecurity Governance*
> (3rd ed., v2.1g) by Marc-André Léger, licensed under CC BY-NC 4.0
> (https://creativecommons.org/licenses/by-nc/4.0/). Changes: <describe your changes>.

## Third-party material
The following remain the property of their respective owners and are used here by reference,
quotation, or retrieval at run time:

- names, standards and frameworks, including NIST CSF 2.0, NIST SP 800-61/800-63, ISO/IEC
  27001/27002/27005/31000, CIS Controls, FIRST CVSS, MITRE ATT&CK and CAPEC, OWASP, ITIL and
  COBIT;
- the **CISA Known Exploited Vulnerabilities Catalog**, a work of the United States Government,
  retrieved from cisa.gov or the `cisagov/kev-data` mirror;
- the **FIRST Exploit Prediction Scoring System (EPSS)**, © FIRST and Empirical Security,
  retrieved at run time and **not redistributed** by this package;
- **MITRE ATT&CK**, © The MITRE Corporation, used by reference for scenario generation;
- CVSS v4.0 metric tables as implemented by the `cvss` Python package;
- the Creative Commons legal code, © Creative Commons.

This licence does not grant rights in that third-party material. Where a source requires an
API key or imposes its own terms — abuse.ch ThreatFox, URLhaus, MalwareBazaar, Feodo Tracker;
LevelBlue/AlienVault OTX; commercial threat-intelligence providers — this package neither ships
credentials nor retrieves data from them. The analyst supplies any such access and accepts those
terms directly.

## Software dependencies
The dependencies keep their own licences:
- `cvss`, `openpyxl`, `mcp`;
- `docx` (npm);
- LibreOffice.

## Notes
- Creative Commons does not recommend its licences for software. The scripts are licensed under
  CC BY-NC 4.0 at the author's choice. Contact the author if you need different terms for the
  code or for commercial use.
- The book and the generated assessments were produced with the assistance of generative AI. The
  estimates they contain are illustrative and must be validated before any organizational use.
- Threat-intelligence snapshots capture third-party data at a point in time. Before redistributing
  a snapshot, check the terms of each source it contains. The shipped snapshot is included for
  offline first use; `.gitignore` excludes locally generated ones by default.
