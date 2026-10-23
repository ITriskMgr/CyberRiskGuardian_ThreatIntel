---
name: cybersecurity-governance
description: >
  This skill should be used when the user asks about cybersecurity governance, risk, compliance or resilience concepts as taught in
  "Introduction to Cybersecurity Governance for Business Technology Management" (Marc-André Léger, 3rd ed., v2.51) - e.g. "explain
  the CIA triad", "fraud triangle", "risk triangle", "three lines model", "risk appetite vs tolerance", "IPM risk cycle", "balanced
  cybersecurity scorecard", "SMART metrics", "compliance management system", "cybersecurity maturity", "investment governance",
  "third-party governance", "AI governance", "key management", "CVSS by equivalency", "what does chapter N say", "answer key for
  chapter N" - or when a risk assessment needs the book's definitions, frameworks, chapter guidance or references as the reference text.
metadata:
  version: "2.0.0"
  author: "Marc-André Léger"
  source: "Introduction to Cybersecurity Governance for Business Technology Management, 3rd edition, v2.51 (October 2026)"
  license: "CC BY-NC 4.0"
---

# Cybersecurity Governance reference (Léger, 3rd ed., v2.51)

Use the author's textbook as the reference for the governance, risk, compliance and resilience concepts behind the CyberRiskGuardian method. Version 2.51 (October 2026) completes the third edition: every chapter was reviewed, Chapters 4 to 6 and 17 were aligned with the CyberRiskGuardian method (formulas, scenario process, tolerance bands, budget calibration, evidence markers, CVSS v4.0 including scoring of non-technical weaknesses by equivalency), and an appendix on using CyberRiskGuardian, the multiple-choice answer key, a references section and a bibliography were added. Primary standards baseline:
- NIST CSF 2.0, SP 800-61 Rev. 3 and SP 800-63-4;
- CIS Controls v8.1;
- CVSS v4.0;
- ISO/IEC 27001:2022/Amd 1:2024 (with ISO/IEC 27002:2022 for controls).

## How to use

1. Identify the concept or chapter the question needs from the index below. Read only that file from `references/`. Chapters are long, so use Grep on the `##` / `###` section headings to jump to the relevant part.
2. Quote or paraphrase the book faithfully and cite it as: *Léger, M.-A. (2026). Introduction to Cybersecurity Governance for Business Technology Management (3rd ed., v2.51), Chapter N: Title.* For an appendix, cite "Appendix: Using CyberRiskGuardian with this book" or "Appendix: Answers to multiple-choice questions". Each reference file starts with its own citation line.
3. Keep the book's own terminology, e.g. "security is the absence of unacceptable risk", the IPM cycle, risk appetite as the managerial core, *risk indices* (computed values) versus *key risk indicators* (measured values with thresholds), μ(E) as "organizational criticality (expected utility)", the *risk-to-tolerance ratio*, and the three markers **Analytical estimate — validation required**, **Information gap — organizational validation required**, **Management decision required**.
4. Where the book and a newer official standard differ, say so and defer to the official publication for operational decisions. This follows the book's editorial note.
5. For assessments, pair the book with the `cyber-risk-assessment` skill:
   - Chapter 4 covers risk fundamentals, treatment strategies (including how transfer and avoidance are recorded), appetite and tolerance, KRIs, threats and vulnerabilities, and the budget guideline.
   - Chapter 5 covers scenario construction: candidate population (about 25 to 40 for ten, never fewer than 20), the five generation strategies, the twelve screening criteria, escalation flags, consolidation and selection.
   - Chapter 6 covers the nineteen-step CyberRiskGuardian workflow, the risk index formulas and valid ranges, the tolerance bands and what cancels in the ratio, CVSS v4.0 scoring and the equivalency method for non-technical weaknesses, the Excel procedure, the MediBec worked example, budget calibration, KRIs, the management report and the quality review.
   - Chapter 17 covers the economics of controls, investment governance and the monetary cross-check.
   - The appendix *Using CyberRiskGuardian with this book* maps each chapter to CRG features, the editions and the three tracks.
   Where the book's text and the CRG method differ on method, the CRG method (`cyber-risk-assessment` skill) governs; report the difference.
6. The multiple-choice answer key (`zz-appendix-mcq-answer-key.md`) is for checking a learner's own answers. When a student asks for help on review questions, explain the reasoning from the chapter first; give the key only when asked to check an answer.
7. Figures are not included in this text version. The figure list is in `00-figures.md`; refer to figures by number when needed. Look up a cited source in `zz-references.md`, and further reading in `zz-bibliography.md`.

## Chapter index (`references/`)

| File | Content |
|---|---|
| `00-front-matter.md` | Title, v2.51 revision note, standards baseline, editorial note, notice on AI use |
| `00-acronyms.md` · `00-figures.md` | Acronyms; list of figures |
| `00-introduction.md` | Purpose and structure of the book |
| `ch01-basic-concepts-of-cybersecurity.md` | Domain definition; security as the absence of unacceptable risk; CIA triad; privacy vs confidentiality; data classification; fraud and risk triangles; risk treatment; human factor and zero trust; maturity; three lines model and assurance; risk appetite as the managerial core |
| `ch02-cybersecurity-governance.md` | Direction, control and accountability; ethics; enterprise, IT and cyber governance; governance outcomes; change management; implementing a governance framework; balanced cybersecurity scorecard; SMART metrics |
| `ch03-cybersecurity-compliance.md` | Compliance as a management system; why compliance fails; obligations landscape; compliance risk assessment; evidence and reporting; assessment approaches; PDCA |
| `ch04-cybersecurity-risk-management.md` | Risk fundamentals; the IPM cycle; ISO alignment; treatment strategies (accept, avoid, transfer, mitigate); appetite and tolerance; biases; metrics and KRIs; threat agents and intelligence; vulnerability management; kill chain, MITRE ATT&CK, CAPEC; budget guideline |
| `ch05-creating-cybersecurity-risk-scenarios.md` | Scenario-based assessment: causal chains, candidate population, generation strategies, twelve screening criteria, escalation flags, families, weighting schemes, coverage, selection of the final ten, watch list |
| `ch06-performing-a-cybersecurity-risk-assessment.md` | The CyberRiskGuardian method: inputs and nineteen steps; evidence discipline and the three markers; risk index formulas and valid ranges; bands; cost-effectiveness; shared controls, transfer and avoidance; CVSS v4.0 and equivalency; spreadsheet procedure; MediBec worked example; prioritization, portfolio and budget calibration; KRIs; management report and QC; IM/BCP/DRP; ISO/NIST compatibility; responsible use of generative AI |
| `ch07-cybersecurity-operations.md` | Security operations, tooling and maturity, SOC, measurement |
| `ch08-cybersecurity-detection-orchestration-vulnerabilities-response-and-tes.md` | Detection, SIEM/SOAR, vulnerability management, response and testing |
| `ch09-cybersecurity-control-frameworks.md` | Control frameworks (NIST CSF 2.0, CIS Controls v8.1, ISO/IEC 27001/27002:2022 and others) |
| `ch10-identity-and-access-management.md` | Identity and access management (NIST SP 800-63-4, MFA, PAM, lifecycle) |
| `ch11-ot-iot-and-cyber-physical-security.md` | OT, IoT and cyber-physical security (incl. medical devices) |
| `ch12-incident-management-business-continuity-and-resilience.md` | Incident management (SP 800-61 Rev. 3), BCP, DRP, resilience |
| `ch13-security-architecture-and-security-engineering.md` | Security architecture and engineering |
| `ch14-security-baselines-and-configuration-governance.md` | Baselines and configuration governance |
| `ch15-cloud-cybersecurity.md` | Cloud security and shared responsibility |
| `ch16-data-protection-and-privacy.md` | Data protection, privacy engineering (incl. Québec Law 25) |
| `ch17-cybersecurity-economics-and-investment-governance.md` | Control costs, run vs change investments, TCO, investment governance, monetary cross-check of CRG scenarios |
| `ch18-ai-for-cybersecurity-and-the-cybersecurity-of-ai.md` | AI for security and security of AI; governed use of AI |
| `ch19-third-party-and-supply-chain-cybersecurity-governance.md` | Third-party and supply-chain governance |
| `ch20-cryptography-and-key-management-in-managerial-terms.md` | Cryptography and key management for managers |
| `ch21-people-organizational-design-and-accountability-mechanisms.md` | People, organizational design, accountability |
| `zz-appendix-using-cyberriskguardian.md` | Appendix: what CyberRiskGuardian is, editions, the three tracks, chapter-by-chapter feature guide, the Excel teaching template, responsible AI use, where to get it |
| `zz-appendix-mcq-answer-key.md` | Appendix: answers to the multiple-choice questions of every chapter |
| `zz-references.md` | References cited in the book |
| `zz-bibliography.md` | Bibliography and further reading |

The book has twenty-one chapters, numbered 1 to 21 without gaps.

## Licence and attribution

The book text is © Marc-André Léger and is licensed under **CC BY-NC 4.0** (https://creativecommons.org/licenses/by-nc/4.0/).
- **Attribution:** credit the author, edition (3rd ed., v2.51) and licence, and indicate any changes made.
- **Non-commercial:** do not use it for commercial purposes.
- **Third-party material:** quoted standards, frameworks and names (NIST, ISO/IEC, CIS, FIRST, MITRE, OWASP) remain under their owners' terms.
