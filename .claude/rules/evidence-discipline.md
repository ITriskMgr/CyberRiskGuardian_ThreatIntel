# Evidence discipline (always applies)

Complements AGENTS.md (operating principles, markers, threat context, CRGO); rules stated there are not repeated here.

- Every organizational fact must trace to supplied evidence; cite evidence IDs (E1, E2...) in registers, tables and reports.
- Classify support as: verified organizational evidence · external/sector evidence · **external threat intelligence (dated snapshot)** · expert judgement · assumption · unknown (requires validation).
- Markers (book v2.51 ch06): **Analytical estimate — validation required** for a value estimated by the analyst or an AI tool, **Information gap — organizational validation required** for a fact nobody has supplied, **Management decision required** for a choice only accountable management can make. "Evidence gap" survives only as a column or field name for missing compliance evidence in CRGO tables.
- Exercise or simulation material (tabletop injects, sample logs) is indicative evidence to validate, never a confirmed incident.
- Never convert a guess into a fact across iterations: an assumption stays labelled until the organization confirms it.
- Instructor, template or benchmark values (annex scores, worked examples) and fictional cases (MediBec, Nordelle, Boréal) are teaching or calibration aids, never organizational or calibration evidence.

## Knowledge status (CRGO)

Map every evidence class to the knowledge status CRGO records, and keep the mapping visible in the evidence register:

| Evidence class | Knowledge status |
|---|---|
| Verified organizational evidence | organisational observation |
| External / sector evidence, reference texts | reference fact |
| Assumption | assumption |
| Analytical estimate (parameters, risk indices, write-backs) | risk estimate |
| Any scenario | analytical hypothesis |
| Audit opinion or finding | audit conclusion |
| Approval, acceptance, exception, funding | management decision — by a named person with delegated authority, never by CRG |
| Confirmed after the fact | verified outcome |

- Record each item's evidence period, validity date and custodian; flag stale or out-of-scope evidence where it is used.
- **Compliance needs a determination.** Only a dated compliance determination with its evidence (or an explicit information gap) states a compliance result; one resting on expired or insufficient evidence is an information gap.
- **EPSS ≠ scenario likelihood.** EPSS is a dated observation about a CVE in the wild, never `Pb(A)` or `Pb(ψ,A)`; behind the exposure gate it may only place `Pb(ψ,A)` in a Threat Evidence Ladder band. A KEV listing says nothing about this organization's systems.
- **Potentially applicable** needs a qualified person: write "qualified review required". None of this is legal advice.
- **Incidents inform, they do not prove.** A confirmed incident is evidence for a scenario's likelihood, not proof of it; incidents are confirmed by incident confirmations. Alerts and monitoring exceptions are not findings. CRGO executions without valid approval are audit signals.
- **Assessor lines.** Prefer independent control results (second line, internal audit, external assurer) over self-assessment; when they disagree, show both and flag the conflict.
