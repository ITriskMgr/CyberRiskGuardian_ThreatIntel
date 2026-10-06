/* methods.js — the methods and standards register (1.5.0).

   This register is deliberately separate from the control catalogue in controls.js. A control
   catalogue is a list of controls an organization can select and state applicability for. A method
   is a way of working: a management system, a risk process, a scoring scheme, a quantification
   model. Forcing the two into one list would produce a catalogue whose rows are not comparable —
   "FAIR" is not a control you implement, and "ISO/IEC 27001" is a management system, not 93 items.

   Entries record what the method is, what CyberRiskGuardian uses it for, and — importantly — where
   CRG does NOT claim conformity. Identifiers and short titles only for the standards whose text is
   not free to reproduce; no clause text is carried here.

   `verified` carries the source and date for facts checked against a primary or named source.
   Where an edition or date is not verified it is left empty rather than guessed: an unverified
   edition in a compliance tool is worse than a blank one.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
self.CRG_METHODS = {
  version: '1.5.0',
  methods: [
    {
      id: 'ISO27001', name: 'ISO/IEC 27001 — Information security management systems — Requirements',
      short: 'ISO/IEC 27001', body: 'ISO/IEC', edition: '2022', date: '',
      kind: 'Management system',
      role: 'Defines the requirements for an ISMS, including the risk assessment and risk treatment process (clauses 6.1.2 and 6.1.3) and the Statement of Applicability.',
      crg: 'CRG supports clause 6.1.2 (risk assessment) and 6.1.3 (risk treatment) by producing scenarios, estimated and residual risk, a treatment portfolio and a Statement of Applicability. CRG does not implement the management system itself — leadership, competence, internal audit and management review remain outside the tool.',
      claims: false,
      licence: 'Identifiers and Annex A control numbers only. The standard text is © ISO/IEC and is not reproduced.',
      url: 'https://www.iso.org/standard/27001',
      annexA: 'ISO22',
    },
    {
      id: 'ISO27002', name: 'ISO/IEC 27002 — Information security controls',
      short: 'ISO/IEC 27002', body: 'ISO/IEC', edition: '2022', date: '',
      kind: 'Control catalogue',
      role: 'The reference set of information security controls, reorganized in the 2022 edition into four themes with 93 controls.',
      crg: 'Bundled as a control catalogue (2013 and 2022 editions) for mitigation selection and the Statement of Applicability.',
      claims: false,
      licence: 'Identifiers and short titles only. © ISO/IEC.',
      url: 'https://www.iso.org/standard/75652.html',
      catalogue: 'ISO22',
    },
    {
      id: 'ISO27005', name: 'ISO/IEC 27005 — Guidance on managing information security risks',
      short: 'ISO/IEC 27005', body: 'ISO/IEC', edition: '2022', date: '',
      kind: 'Risk management process',
      role: 'Guidance for the information security risk management process: context, identification, analysis, evaluation, treatment, acceptance, communication and monitoring.',
      crg: 'CRG follows this shape. Context is the Organization screen; identification is scenarios, assets, threats and vulnerabilities; analysis and evaluation are the CRG formulas and the residual-to-tolerance ratio; treatment is Risk mitigation and Recommendations; acceptance is the decision register. The quantification is the CRG model, not a method prescribed by 27005.',
      claims: false,
      licence: 'Process step names only. © ISO/IEC.',
      url: 'https://www.iso.org/standard/80585.html',
    },
    {
      id: 'CSF2', name: 'NIST Cybersecurity Framework 2.0',
      short: 'NIST CSF 2.0', body: 'NIST', edition: '2.0', date: '2024-02',
      kind: 'Framework and catalogue',
      role: 'Six functions — Govern, Identify, Protect, Detect, Respond, Recover — with categories and subcategories used as an outcome-based common language.',
      crg: 'Bundled as a control catalogue (subcategories) and used to classify measures by function. Public domain.',
      claims: false,
      licence: 'Public domain (NIST).',
      url: 'https://www.nist.gov/cyberframework',
      catalogue: 'CSF2',
    },
    {
      id: 'SP800-30', name: 'NIST SP 800-30 — Guide for Conducting Risk Assessments',
      short: 'NIST SP 800-30', body: 'NIST', edition: 'Revision 1', date: '2012-09',
      kind: 'Risk assessment process',
      role: 'Prepare, conduct, communicate and maintain; threat sources and events, vulnerabilities and predisposing conditions, likelihood, impact and risk determination.',
      crg: 'The CRG scenario structure follows this causal chain — threat source, initiating event, vulnerability or predisposing condition, affected asset, adverse event, organizational consequence. CRG expresses likelihood and impact on a 0–1 scale through its own parameters rather than the qualitative scales of Appendix I–J.',
      claims: false,
      licence: 'Public domain (NIST).',
      url: 'https://csrc.nist.gov/pubs/sp/800/30/r1/final',
    },
    {
      id: 'SP800-53', name: 'NIST SP 800-53 — Security and Privacy Controls for Information Systems and Organizations',
      short: 'NIST SP 800-53', body: 'NIST', edition: 'Revision 5', date: '',
      kind: 'Control catalogue',
      role: 'The federal control catalogue: 20 families of controls and control enhancements.',
      crg: 'Bundled as a control catalogue from the NIST OSCAL release, for mitigation selection and the Statement of Applicability.',
      claims: false,
      licence: 'Public domain (NIST OSCAL).',
      url: 'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final',
      catalogue: 'NIST-53',
    },
    {
      id: 'SP800-171', name: 'NIST SP 800-171 — Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations',
      short: 'NIST SP 800-171', body: 'NIST', edition: 'Revision 3', date: '2024-05-14',
      kind: 'Requirement set',
      role: 'Security requirements for protecting controlled unclassified information in non-federal systems, restructured in Revision 3 into 17 requirement families (Revision 2 held 110 requirements in 14 families).',
      crg: 'Ships as a control catalogue, loaded on request from the Frameworks screen. CRG does not assess conformity; it maps selected measures to the requirements they support.',
      claims: false,
      licence: 'Public domain (NIST).',
      url: 'https://csrc.nist.gov/pubs/sp/800/171/r3/final',
      catalogue: 'NIST-171',
      verified: { fact: 'Revision 3 published 14 May 2024; 17 families; Revision 2 held 110 requirements in 14 families. Extracted from the publication: 130 identifiers, 97 requirements in force and 33 withdrawn.', on: '2026-10-04' },
    },
    {
      id: 'ITSP10171', name: 'ITSP.10.171 — Protecting specified information in non-Government of Canada systems and organizations',
      short: 'ITSP.10.171', body: 'Canadian Centre for Cyber Security', edition: 'Second release', date: '2025-10-28',
      kind: 'Requirement set',
      role: 'The Canadian counterpart to NIST SP 800-171, with 17 security requirement families. The Centre states there are no substantial technical changes between this publication and SP 800-171; the modifications reflect Canadian regulatory requirements. ITSP.10.171-01 is the companion assessment guidance.',
      crg: 'Ships as a control catalogue, loaded on request from the Frameworks screen. Relevant to Canadian organizations handling specified information on behalf of the Government of Canada.',
      claims: false,
      licence: 'Crown copyright, Government of Canada. Identifiers and titles only.',
      url: 'https://www.cyber.gc.ca/en/guidance/protecting-specified-information-non-government-canada-systems-and-organizations-itsp10171',
      catalogue: 'ITSP-171',
      verified: { fact: '17 requirement families; "a Canadian version of NIST SP 800-171" with "no substantial technical changes"; first release 2 April 2025, second release 28 October 2025. Extracted from the publication: 131 identifiers, 98 requirements in force. Every requirement in force in SP 800-171 r3 is present; ITSP adds exactly one, 03.14.09 Dedicated administration workstation.', on: '2026-10-04' },
    },
    {
      id: 'COBIT', name: 'COBIT 2019 — Governance and management of enterprise information and technology',
      short: 'COBIT 2019', body: 'ISACA', edition: '2019', date: '',
      kind: 'Governance framework',
      role: '40 governance and management objectives across five domains: EDM (5), APO (14), BAI (11), DSS (6) and MEA (4).',
      crg: 'Used for governance traceability of recommendations. COBIT governs the enterprise IT function as a whole; CRG addresses the cybersecurity risk process within it, and maps recommendations to objectives rather than assessing COBIT capability levels.',
      claims: false,
      licence: 'Identifiers and short titles only. © ISACA.',
      url: 'https://www.isaca.org/resources/cobit',
      catalogue: 'COBIT19',
      verified: { fact: '40 objectives: EDM 5, APO 14, BAI 11, DSS 6, MEA 4. Extracted from the ISACA objectives workbook (November 2018); the counts match the published structure exactly.', on: '2026-10-04' },
    },
    {
      id: 'CIS', name: 'CIS Critical Security Controls',
      short: 'CIS Controls', body: 'Center for Internet Security', edition: 'v8.1 and v7.1', date: '',
      kind: 'Control catalogue',
      role: 'A prioritized set of safeguards, organized into implementation groups.',
      crg: 'Bundled as a control catalogue (v7.1 sub-controls from the analyst list, v8.1 at control level).',
      claims: false,
      licence: 'Identifiers and titles only. © Center for Internet Security.',
      url: 'https://www.cisecurity.org/controls',
      catalogue: 'CIS81',
    },
    {
      id: 'CVSS4', name: 'CVSS v4.0 — Common Vulnerability Scoring System',
      short: 'CVSS v4.0', body: 'FIRST', edition: '4.0', date: '',
      kind: 'Severity scoring',
      role: 'A scoring scheme for the technical severity of a vulnerability, with Base, Threat, Environmental and Supplemental metric groups.',
      crg: 'CRG uses the **Base score only**, as a severity multiplier in the risk formulas. Threat metrics (E:A, E:P, E:U) and Environmental metrics are deliberately excluded: the CRG formula already multiplies CVSS by Pb(ψ,A), so exploitation evidence counted in both would compound. CVSS is a property of a vulnerability, not a measure of organizational risk, and is never used alone to prioritize.',
      claims: false,
      licence: 'Open specification. © FIRST.',
      url: 'https://www.first.org/cvss/v4-0/',
    },
    {
      id: 'FAIR', name: 'FAIR — Factor Analysis of Information Risk',
      short: 'FAIR', body: 'The Open Group', edition: 'O-RT / O-RA', date: '',
      kind: 'Quantification model',
      role: 'A taxonomy and analysis method that decomposes risk into loss event frequency and loss magnitude, and expresses results as a distribution of annualized loss in currency.',
      crg: 'FAIR and CRG are **parallel quantification methods, not layers of one another**. FAIR produces a monetary loss distribution; CRG produces a dimensionless relative indicator compared against a tolerated risk derived from the stated appetite. CRG does not implement FAIR and does not convert its results to annualized loss expectancy. Where an organization already works in FAIR, the CRG parameters are best read as an ordering of scenarios, not as an input to a FAIR model.',
      claims: false,
      licence: 'Open Group standard. © The Open Group.',
      url: 'https://www.opengroup.org/forum/security/riskmanagement',
    },
    {
      id: 'CRG', name: 'CyberRiskGuardian risk model',
      short: 'CRG', body: 'Marc-André Léger', edition: 'Excel guide v1.0c §11', date: '',
      kind: 'Quantification model',
      role: 'Estimated, tolerated, mitigated and residual risk from Pb(A), Pb(ψ,A), CVSS Base, δe, δm, θ, μ(E), the risk appetite and a scale factor; interpretation through the residual-to-tolerance ratio.',
      crg: 'The authoritative calculation for this application. Implemented in the verified crg.js engine, which reproduces the MediBec baseline 84,491 / 41,104 on every start-up.',
      claims: true,
      licence: 'CC BY-NC 4.0.',
      url: '',
    },
  ],
};
