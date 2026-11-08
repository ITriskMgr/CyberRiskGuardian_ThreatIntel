# NOTICE — CyberRiskGuardian with Threat Live-feed (plugin `cyberriskguardian-threatintel`)

**CyberRiskGuardian with Threat Live-feed** 1.7.2 — © 2026 Marc-André Léger.
Licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).
The full text is in `LICENSE` (this folder) and at https://creativecommons.org/licenses/by-nc/4.0/legalcode.

Product site: https://cyberriskguardian.ca — licence enquiries, the Educational Licence, the Commercial Licence
and the professional editions: sales@cyberriskguardian.ca.

This file travels with the plugin when it is installed from the marketplace. The repository-level `NOTICE.md`
(one folder above `plugins/`) carries the same notices for the desktop application and the examples.

## What is covered
- The CyberRiskGuardian methodology in this plugin: the master task specification, the scenario-selection
  instructions, the budget guideline, the formula and workbook conventions, the threat-context reference and the
  Threat Evidence Ladder, the CRGO integration notes.
- The skills, commands, subagents, output styles, hooks and configuration of the plugin.
- The scripts (`crg_calc.py`, `build_workbook.py`, `budget_calibrator.py`, `threat_snapshot.py`, `ssvc.py`,
  `crgo_contract.py`, the tests) and the MCP calculator server (`mcp/crg_server.py`).
- The textbook *Introduction to Cybersecurity Governance for Business Technology Management*, 3rd edition,
  version 2.51 (October 2026), in `skills/cybersecurity-governance/references/`.
- The CanaRetail regression fixture (`skills/cyber-risk-assessment/scripts/fixtures/canaretail10.json`) — a
  fictional teaching case, never organizational evidence.

## Derivation
A derivative edition of **CyberRiskGuardian Agent v1.1.0** (https://github.com/ITriskMgr/CyberRiskGuardian), by the
same author and under the same licence. No risk formula was changed. Since 1.7.2 this plugin's calculation engine
is the **reference implementation** of the unified engine rules shared with the Core plugin, CRG Pro Quantitative
and the desktop application (CVSS-B only with the vector winning over a stored score; zero tolerated risk reported
as "Not applicable (tolerated risk 0)"; one validation rule set).

## Suggested attribution
> *CyberRiskGuardian with Threat Live-feed* and *Introduction to Cybersecurity Governance* (3rd ed., v2.51) by
> Marc-André Léger, licensed under CC BY-NC 4.0 (https://creativecommons.org/licenses/by-nc/4.0/).
> Changes: <describe your changes>.

## Third-party material
The following remain the property of their respective owners and are used by reference, quotation or retrieval at
run time; this licence grants no rights in them:

- names, standards and frameworks, including NIST CSF 2.0, NIST SP 800-61/800-63, ISO/IEC 27001/27002/27005/31000,
  FIRST CVSS, MITRE ATT&CK and CAPEC, OWASP, ITIL and COBIT;
- **CIS Controls® v8.1** — © Center for Internet Security, licensed CC BY-NC-ND 4.0; this plugin names the eighteen
  controls by identifier and title only and reproduces no CIS text; CIS Controls is a registered trademark of CIS;
- the **CISA Known Exploited Vulnerabilities Catalog**, a work of the United States Government, retrieved from
  cisa.gov or the `cisagov/kev-data` mirror by `threat_snapshot.py` only when the analyst runs it;
- the **FIRST Exploit Prediction Scoring System (EPSS)**, © FIRST and Empirical Security, retrieved at run time and
  **not redistributed** by this package;
- **SSVC** decision trees (CISA SSVC 2.0.3; CERT/CC deployer and supplier trees 1.0.0), copied row for row from
  the CERT/CC SSVC repository (https://github.com/CERTCC/SSVC) and the CISA SSVC Guide;
- **MITRE ATT&CK**, © The MITRE Corporation, used by reference for scenario generation;
- CVSS v4.0 metric tables as implemented by the `cvss` Python package;
- the Creative Commons legal code, © Creative Commons.

Sources that require an API key or impose their own terms (abuse.ch ThreatFox, URLhaus, MalwareBazaar, Feodo
Tracker; LevelBlue/AlienVault OTX; commercial threat-intelligence providers) are declared, never fetched: the
plugin ships no credentials and retrieves nothing from them.

## CyberRiskGuardian Ontology (CRGO)
The plugin can connect to the **CyberRiskGuardian Ontology** (CRGO), © 2026 Marc-André Léger, CC BY-NC 4.0
(https://github.com/ITriskMgr/CyberRiskGuardian-Ontology), release **0.11.0** (tag `v0.11.0`). CRGO is a separate
work and is not redistributed here; its imports and vocabularies keep their own licences as stated in CRGO's
`NOTICE.md`. Licensed standards (IIA, ISACA, AICPA, COSO, ISO) appear only as identifiers, official headings and
paraphrases. Suggested citation: "CyberRiskGuardian Ontology (CRGO) v0.11.0, Marc-André Léger, CC BY-NC 4.0."

## Software dependencies
`cvss`, `openpyxl`, `mcp` (optionally `pyoxigraph`, `rdflib`, `jsonschema` for CRGO), `docx` (npm) and LibreOffice
keep their own licences.

## Notes
- Creative Commons does not recommend its licences for software; the scripts are licensed under CC BY-NC 4.0 at the
  author's choice. For other terms, see https://cyberriskguardian.ca or write to sales@cyberriskguardian.ca.
- Generated assessments are produced with the assistance of generative AI. Every estimate is an
  **Analytical estimate — validation required**; every fact nobody supplied is an
  **Information gap — organizational validation required**; acceptance, transfer and funding are a
  **Management decision required**.
- Threat-intelligence snapshots capture third-party data at a point in time; check each source's terms before
  redistributing one.
