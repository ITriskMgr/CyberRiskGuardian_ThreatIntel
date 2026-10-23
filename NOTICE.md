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
- an intel-driven scenario-generation perspective;
- from 1.3.0, an optional bridge to the CyberRiskGuardian Ontology (CRGO) through the dss/v1 data
  contract (`crgo_contract.py`, `crgo-integration.md`), with proposed-only write-backs;
- from 1.4.0, read-only use of CRGO 0.10.0's compliance/v1 and secops/v1 contracts;
- from 1.6.0, alignment with the textbook v2.51 (three markers, 19 steps, validated calculator,
  product rule for combined measures, budget point targets), the `/crg-quick-scan` command and the
  label check.

No risk formula was changed. In 1.6.0 the MediBec S2 and S8 vectors were scored AV:L (a malicious
document opened locally); the MediBec baseline is now 84,305 / 41,023, with no verdict change.

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
  3rd edition, version 2.51 (October 2026), with its CyberRiskGuardian appendix, multiple-choice answer key,
  references and bibliography, in
  `plugins/cyberriskguardian-threatintel/skills/cybersecurity-governance/references/`.
- The fictional MediBec teaching case and the example deliverables in `examples/medibec/`.

## Suggested attribution
> *CyberRiskGuardian with Threat Live-feed* and *Introduction to Cybersecurity Governance*
> (3rd ed., v2.51) by Marc-André Léger, licensed under CC BY-NC 4.0
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

## CyberRiskGuardian Ontology (CRGO)
Since version 1.4.0 the plugin can connect to the **CyberRiskGuardian Ontology** (CRGO), © 2026 Marc-André Léger,
licensed under CC BY-NC 4.0 (https://github.com/ITriskMgr/cyberriskguardian-ontology). The release
used and cited is **v0.10.0** (2026-10-13; the dss/v1 commands also work with v0.9.1). CRGO
is a separate work and is **not redistributed** in this repository: the analyst clones it
(`CyberRiskGuardian-Ontology*/` is git-ignored). Its third-party imports and vocabularies (BFO,
CCO, PROV-O, OWL-Time, ATT&CK, NIST, ISO/IEC 27002, legal texts and others) keep their own licences
as stated in CRGO's `NOTICE.md`. Licensed standards (IIA, ISACA, AICPA, COSO, ISO, including ISO 37301 and its 2024 amendment) appear in CRGO
and in this plugin only as identifiers, official headings and paraphrases; their text is not
reproduced. Suggested citation in reports: "CyberRiskGuardian Ontology (CRGO) v0.10.0, ontology
release 0.10.0, Marc-André Léger, CC BY-NC 4.0." The CRGO integration is a proof of concept.

## Software dependencies
The dependencies keep their own licences:
- `cvss`, `openpyxl`, `mcp`;
- optionally, for CRGO: `pyoxigraph`, `rdflib`, `jsonschema`;
- `docx` (npm);
- LibreOffice.

## Notes
- Creative Commons does not recommend its licences for software. The scripts are licensed under
  CC BY-NC 4.0 at the author's choice. For different terms, commercial use, the Educational Licence
  or the professional editions, see https://cyberriskguardian.ca or write to sales@cyberriskguardian.ca.
- The book and the generated assessments were produced with the assistance of generative AI. The
  estimates they contain are illustrative and must be validated before any organizational use.
- Threat-intelligence snapshots capture third-party data at a point in time. Before redistributing
  a snapshot, check the terms of each source it contains. The shipped snapshot is included for
  offline first use; `.gitignore` excludes locally generated ones by default.
