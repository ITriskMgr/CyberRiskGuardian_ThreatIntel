# Notice

CyberRiskGuardian Desktop — © 2026 Marc-André Léger. All rights reserved. From the release after 1.7.0
the application is proprietary software, licensed under the CyberRiskGuardian Commercial Licence or
Educational Licence (French and English texts in the `licences` folder). Students, for personal
learning, and non-profit organisations, for their own risk management, use it free; any organization
may evaluate it for up to 30 days. Versions up to 1.7.0 remain available under CC BY-NC 4.0, and the
CyberRiskGuardian method, the Core plugin for Claude and the governance textbook remain under
CC BY-NC 4.0. Summary: `LICENSE` and **Help → About → Licence**. Tiers and prices:
https://www.leger.ca/cyberriskguardian/ · marcandre@leger.ca.

## Third-party material

`cvss4.js` contains the CVSS v4.0 macro-vector lookup tables and scoring algorithm from the reference implementation:

> Copyright (c) 2023 FIRST.ORG, Inc., Red Hat, and contributors. Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met: (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

CVSS is a registered trademark of FIRST.ORG, Inc. Apple Intelligence and Shortcuts are trademarks of Apple Inc. This app is not affiliated with or endorsed by FIRST or Apple.

The MediBec organization in `sample.js` and `medibec.js` is fictional and used for teaching. The
ATT&CK and CWE links added to the MediBec scenarios in `medibec.js` are an analyst mapping for
teaching purposes — validation required.

### MITRE ATT&CK, CAPEC and CWE (`kb.js`)

`kb.js` is a compact extract generated from:

- **MITRE ATT&CK® Enterprise v19.2** (STIX 2.1, `mitre/cti`, matrix modified 2026-07-31) — technique
  and tactic identifiers, names, abridged descriptions, platforms, mitigations and the count of
  intrusion sets using each technique. © 2015–2026 The MITRE Corporation. This work is reproduced and
  distributed with the permission of The MITRE Corporation, under the ATT&CK Terms of Use
  (https://attack.mitre.org/resources/legal-and-branding/terms-of-use/).
- **CAPEC™ v3.9** (STIX 2.1, `mitre/cti`) — used only to derive the technique → CWE links.
  © The MITRE Corporation, CAPEC Terms of Use.
- **CWE™ v4.14** (2024-02-29) — identifiers, names, abstraction levels and abridged descriptions,
  and the 2024 CWE Top 25 ranking. © The MITRE Corporation, CWE Terms of Use
  (https://cwe.mitre.org/about/termsofuse.html).

ATT&CK, CAPEC and CWE are trademarks or registered trademarks of The MITRE Corporation. This app is
not affiliated with or endorsed by MITRE.

### Control catalogue (`js/data/controls.js`)

- **NIST SP 800-53 Rev. 5** and **NIST Cybersecurity Framework 2.0** — from the NIST OSCAL content
  (`usnistgov/oscal-content`); works of the US Government, not subject to copyright in the United States.
- **ISO/IEC 27002:2013 and :2022** — control identifiers and short titles only, for reference.
  © ISO/IEC. The control text is not reproduced; consult the standards.
- **CIS Controls® v7.1 and v8.1** — identifiers and titles only. © Center for Internet Security, Inc.,
  licensed CC BY-NC-ND 4.0. CIS Controls is a registered trademark of CIS.
- **NIST CSF 1.1**, ISO/IEC 27002:2013 and CIS v7.1 rows come from the analyst's own list
  (Controls_list.xlsx); corrections are documented in the catalogue's flags.
- Capability tags and default effect ranges are the author's analytical aids, not mappings endorsed
  by NIST, ISO or CIS.

### Bundled framework packs (`frameworks/*.json`)

Three catalogues are extracted from the publishers' own documents, shipped with the app and loaded
only when the analyst asks for them. Each pack records its source document, edition and date, and
`tools/extract.py` with `tools/build_packs.py` rebuilds it from that document.

- **NIST SP 800-171 Revision 3**, *Protecting Controlled Unclassified Information in Nonfederal
  Systems and Organizations* (14 May 2024) — 130 identifiers, 97 in force, 17 families; identifiers
  and requirement titles only. A work of the US Government, not subject to copyright in the United
  States. Withdrawn identifiers are kept and marked so earlier references still resolve.
- **ITSP.10.171**, *Protecting specified information in non-Government of Canada systems and
  organizations*, second release (28 October 2025), Canadian Centre for Cyber Security —
  131 identifiers, 98 in force, 17 families. Identifiers and requirement titles only.
  © His Majesty the King in Right of Canada. Not an endorsement by the Canadian Centre for Cyber
  Security.
- **COBIT® 2019** (*Governance and Management Objectives*, November 2018) — the 40 objectives,
  **identifiers and titles only** (EDM 5, APO 14, BAI 11, DSS 6, MEA 4). © ISACA. The objective
  descriptions, practices, activities and capability-level guidance are **not** reproduced; consult
  the COBIT 2019 publications. CRG maps recommendations to objectives for traceability and does not
  assess COBIT capability levels. COBIT is a registered trademark of ISACA. This app is not
  affiliated with or endorsed by ISACA.

### Methods and standards register (`js/data/methods.js`)

This register cites methods and standards; it does not reproduce them. **ISO/IEC 27001, 27002 and
27005** appear as identifiers, titles and edition dates only (© ISO/IEC — the standards must be
purchased from ISO or a national member body). **NIST SP 800-30, SP 800-53, SP 800-171 and the
Cybersecurity Framework 2.0** are US Government works. **CIS Controls®** © Center for Internet
Security, Inc. **CVSS v4.0** © FIRST.ORG, Inc. **FAIR** (Factor Analysis of Information Risk) is
published by The Open Group as the O-RT taxonomy and O-RA analysis standards, © The Open Group; it is
named here as a *parallel* quantification method to the CRG model, not a layer of it, and no FAIR
material is reproduced. Where each statement says "where CRG stops", that boundary is the author's analysis, not a position of the
body concerned.

An imported catalogue is the analyst's own material: the app validates and diffs it but makes no
claim about its licence. Reproducing a standard's control text may require a licence from its
publisher.

### AI providers

The AI assistant transmits only what the analyst previews and sends. With the `claude` provider the
text goes to the Claude API (api.anthropic.com) under the analyst's own account and Anthropic's terms
of service and privacy policy; the key belongs to the analyst and is held by the helper, never by
this app's author. With the `local` provider the text goes to an OpenAI-compatible endpoint on the
same machine — oMLX, Ollama, LM Studio or equivalent, each under its own licence and the licence of
the model it serves — and nothing leaves the computer. The API shape used for local providers follows
the OpenAI chat-completions convention; no OpenAI service is called and no OpenAI code is included.
Model names are read from the endpoint, not bundled.

Feed triage, the weekly briefing written from it, the forecasts and every calculation run locally and
send nothing. The triage profile exported for the scheduled task is written to the analyst's own
feeds folder and contains no organization name, no scenario text and no asset names.

### Threat feeds and social media (downloaded by the analyst, not bundled)

AlienVault OTX (LevelBlue; account terms), abuse.ch ThreatFox, MalwareBazaar, URLhaus and Feodo
Tracker (CC0; Auth-Key), SANS Internet Storm Center (CC BY-NC-SA), CISA (public domain), Canadian
Centre for Cyber Security, NCSC UK (Open Government Licence), GitHub Advisory Database (CC BY 4.0),
news sites (headlines and links only), ransomware.live (unverified leak-site claims), X API (paid plan;
X Developer terms), Mastodon, Bluesky and Reddit public APIs. Each source's terms apply to the files
you download; they are not redistributed with this app.

### Bundled example threat-context snapshot (`examples/threat-context/threat-context-example.json`)

One example snapshot ships with the application so that the Threat Evidence Ladder, the exposure join
and Process step 5 work on a machine with no network access. It is derived from
`examples/threat-context/threat-context-shipped.json` in
[`CyberRiskGuardian_ThreatIntel`](https://github.com/ITriskMgr/CyberRiskGuardian_ThreatIntel),
generated by `threat_snapshot.py`, and it carries a fixed build date. It is labelled an example in the
file and on the screen, and it is not current threat intelligence.

- **CISA Known Exploited Vulnerabilities Catalog** — the catalogue of the build date, in full
  (1,733 entries). A work of the US Government, public domain.
- **FIRST EPSS** — 38,533 scores, pruned at the Threat Evidence Ladder's rung-1 ceiling.
  **Including EPSS scores in the package is a deliberate redistribution decision by the author.** See https://www.first.org/epss/ for
  FIRST's terms of use, and `examples/threat-context/README.md` in the ThreatIntel repository for the
  refresh policy. Scores the analyst downloads at run time are still not redistributed.

### CyberRiskGuardian Ontology (`data/crgo-snapshot.json`; CRGO v0.10.1)

The identification export of the **CyberRiskGuardian Ontology (CRGO)** — © 2026 Marc-André Léger,
CC BY-NC 4.0, https://github.com/ITriskMgr/CyberRiskGuardian-Ontology — rebuilt by
`tools/build_crgo.py` without per-row caveats and IRIs. It carries, as the ontology does:

- **MITRE ATT&CK Enterprise 19.2** technique identifiers and names — © The MITRE Corporation, reproduced
  under the ATT&CK Terms of Use;
- **NIST CSF 2.0** and **NIST SP 800-53 Rev. 5** control identifiers and titles — US Government works;
- **ISO/IEC 27002:2022** control identifiers and titles only, © ISO/IEC, cited for reference and
  mapping — no control text is reproduced;
- **Quebec Law 25 (P-39.1)** and the **Act respecting health and social services information
  (R-22.1)**: CRGO paraphrases with section references; the official text is published in LégisQuébec;
- library estimates (AI estimates of 2023 for a fictitious healthcare organization) and values from
  fictional teaching cases (CanaRetail, ACRB, MediBec, Chez Pierre) by Marc-André Léger — calibration
  aids, not facts about real organizations.

It also carries: obligations under other regimes (A-2.1, PIPEDA, OSFI
Guideline B-13, GDPR — identifiers and CRGO paraphrased headings), **MITRE D3FEND 1.6.0** countermeasure
identifiers and names (© The MITRE Corporation), exploitation evidence aggregated from the **CISA Known
Exploited Vulnerabilities** catalogue (US Government work) and **FIRST EPSS** scores of 2026-10-04 (median and
maximum per technique or weakness; EPSS is © FIRST, used under its terms), and the legal instruments with
their applicability conditions (CRGO's own modelling, not legal advice).

The snapshot is used when the ontology's own server is not running. With **CRGO v0.10.0** installed, the
helper starts its MCP server from its own folder (its own notices apply) and the application reads its
contracts dss/v1, compliance/v1 and secops/v1. The compliance and security-operations records the application
sends to it are written in CRGO terms; the rules CRGO states for them are applied here too — a mapping, an
acknowledgement or an attestation is never compliance; an alert is never an incident; nothing authorises a
response action; coverage is validated only by an effective detection test; source confidence is not a
probability; TLP markings are respected; licensed standards appear as identifiers only.

### SP 800-53A objectives and illustrative work programmes (`data/crgo-assurance.json`)

**NIST SP 800-53A Rev. 5** assessment objectives and examine / interview / test methods, as bound by CRGO to
the SP 800-53 Rev. 5.2.0 OSCAL catalogue — US Government work, not subject to copyright in the United
States. CRGO's two work programmes AUD-PAM-001 and AUD-VULN-001 — © 2026 Marc-André Léger, CC BY-NC 4.0 —
are **illustrative, not a validated audit methodology**. Licensed audit and governance standards (IIA Global
Internal Audit Standards and Topical Requirements, ISACA ITAF, AICPA Trust Services Criteria, COSO ERM,
ISO 19011, 27007, 27008, 37301, 37302) are not reproduced: they are cited by identifier only.

### CyberRiskGuardian calculation engine (`engine/crg_calc.py`)

A copy of the plugin's `crg_calc.py` — © 2026 Marc-André Léger, CC BY-NC 4.0 — used only by CRGO's bridge
to build the organisation graph; it implements the same formulas as `crg.js`, and the graph reproduces the
MediBec baseline.

The ontology's MCP server is not part of this package; when it is installed, the helper starts it from
its own folder and its own notices apply. Organisation graphs and write-backs are written in a folder of
the analyst's choice, outside the application and any repository.

### Security-policy templates (`js/isp.js`)

Written for this application. Control references cite ISO/IEC 27002:2022 and NIST CSF 2.0 identifiers
only. Templates are starting points to adapt, not legal advice.

### Security-operations formats and markings (SIEM, SOAR)

The SIEM and SOAR screens read files the analyst imports; no product, library or content below is bundled,
and no live connector exists. Formats and vocabularies are used as formats only:

- **OCSF** (Open Cybersecurity Schema Framework) — event class and category **names** may label a telemetry
  source. The OCSF schema is published under the Apache License 2.0; no schema file is included.
- **STIX 2.1** and **TAXII** (OASIS Open) — STIX bundles of indicators and sightings can be imported and the
  IOC watch list exported as STIX 2.1; TAXII is named for the origin of such bundles, and no TAXII client is
  included. STIX and TAXII are OASIS standards; © OASIS Open.
- **Traffic Light Protocol (TLP) 2.0** — the marking definitions of FIRST (CLEAR, GREEN, AMBER,
  AMBER+STRICT, RED); TLP 1.0 identifiers are read as their 2.0 equivalents. © FIRST.ORG, Inc.; TLP is used
  as published by FIRST. TLP:RED and TLP:AMBER+STRICT material is masked, never sent to AI, and left out of
  exports unless kept marked.
- **Sigma** — the detection-rule format (YAML) is read to import rules the analyst supplies; the Sigma
  specification is used as a format only. Rules from the SigmaHQ repository are under the Detection Rule
  License (DRL) 1.1, which applies to any rule you import; none is bundled.
- **MITRE ATT&CK** technique identifiers in rules, alerts and coverage — as above.

### Simulation data for teaching (`data/simulation/`)

The MediBec simulation pack — © 2026 Marc-André Léger, CC BY-NC 4.0 — is **fictional**: people, producers,
source systems, hosts and events are invented; IP addresses are from the documentation ranges of RFC 5737
and RFC 3849, domains from RFC 2606 and RFC 6761, and hashes are made up. A pack generated with AI in
Settings → Simulation data is labelled as such and is the educator's own material.

### Data the analyst loads (not bundled)

- **CISA Known Exploited Vulnerabilities Catalog** — US Government work, public domain. Current
  catalogues are downloaded by the analyst; only the example above is bundled.
- **FIRST EPSS** — current scores are fetched by the analyst at run time and not redistributed with
  this app, except for the pruned example table described above;
  see https://www.first.org/epss/ for terms of use.
- **NVD / CVE records** — public CVE content (cve.org terms of use; NVD is a US Government work).

## Derivation

This desktop application reuses `crg.js`, `cvss4.js` and `sample.js` verbatim from
CyberRiskGuardian Mobile (https://github.com/ITriskMgr/CyberRiskGuardian_IOS) v1.0.1, by the same
author and under the same licence. `threat.js` ports the Threat Evidence Ladder and snapshot rules
from `threat_snapshot.py` in CyberRiskGuardian with Threat Live-feed
(https://github.com/ITriskMgr/CyberRiskGuardian_ThreatIntel) v1.2.0.

One example threat-context snapshot is bundled (see above); every current catalogue is downloaded by
the analyst. The application makes no network requests of its own. The launcher's local helper (`serve.py`) and
`crg_feeds.py` (run by the helper or a scheduled task) download public sources — CISA KEV, FIRST EPSS,
NVD and the threat feeds in the analyst's accepted list — in full, into the analyst's feeds folder; they
never transmit organizational data.

**The AI features are the one exception, and it is deliberate.** When the analyst sends a
request from that screen, the helper — never the browser — transmits the text to the provider chosen
for that workspace. With the `claude` provider that text goes to api.anthropic.com; with a local
provider it goes to a model on the same machine and nothing leaves it. The payload is shown in full,
with its size and its destination, before it is sent, and the anonymizer can be applied to it first.
Nothing is ever sent automatically, by a schedule, or in the background, and no AI output changes a
stored value until the analyst accepts it. API keys are held by the helper in `crg-keys.json`
(mode 600); they are never written to `crg-config.json`, never logged, and never included in a backup. Social-media searches send only the search query set in Settings.
Registry packages leave the computer only when the analyst publishes them, anonymized on request. Threat-context snapshots are produced either by
`threat_snapshot.py` or by the in-app generator from files the analyst downloaded, and are loaded
here from local files. Links to attack.mitre.org, cwe.mitre.org, nvd.nist.gov, cve.org and the
download pages open in the browser only when the analyst clicks them.

## Use of generative AI

CyberRiskGuardian Desktop was developed by Marc-André Léger with the assistance of generative AI
(Anthropic Claude, through Claude Cowork and Claude Code). AI assisted with code, documentation,
the French interface catalogue (`js/i18n/fr.js`, drafted from a reviewed glossary), reference
catalogues and automated tests. The author directed the work, reviewed it and remains responsible
for it. The calculation engine (`crg.js`) implements the author's published model and is verified at
every start; it does not use AI. The AI features inside the application are optional, show what
they would send before anything leaves the computer, and produce proposals that a person accepts or
rejects.

Version 1.7.0 is a **beta (Beta 1.7.x)**: treat its results as initial analytical hypotheses and
validate them before they support a decision.
