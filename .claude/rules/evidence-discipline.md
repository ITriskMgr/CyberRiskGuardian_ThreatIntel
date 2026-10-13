# Evidence discipline (always applies)

- Every organizational fact must trace to supplied evidence; cite evidence IDs (E1, E2...) in registers, tables and reports.
- Classify support as: verified organizational evidence · external/sector evidence · **external threat intelligence (dated snapshot)** · expert judgement · assumption · unknown (requires validation).
- Exercise or simulation material (tabletop injects, sample logs) is indicative evidence to validate, never a confirmed incident.
- Use the markers literally: **Analyst estimate — validation required**, **Evidence gap — organizational input required**, **Management decision required**.
- Never convert a guess into a fact across iterations: an assumption stays labelled until the organization confirms it.
- Instructor, template or benchmark values (e.g. annex scores, worked examples) are calibration aids, not organizational evidence.

## External threat intelligence

- Threat intelligence is evidence about the **threat environment**, never about this organization. It corroborates; organizational evidence remains primary.
- Cite it by snapshot: source, version or score date, and the snapshot's own retrieval date. "CISA KEV" alone is not a citation; "CVE-2026-XXXXX in KEV since 2026-08-14, snapshot 2026-10-03" is.
- An intel-derived parameter change without an **exposure note** — organizational evidence that the affected technology, sector or vector applies here — is an unsupported claim. Record it on the watch list instead.
- Intelligence may support `Pb(A)` and `Pb(ψ,A)` only, within Threat Evidence Ladder bands. It never informs `δe`, `δm`, `θ` or `μ(E)`; no external source knows this organization's damage profile, resilience or criticality.
- A snapshot older than 90 days is stale evidence. Say so where it is used rather than letting the report read as current.
- Direct organizational evidence of matching malicious activity (ladder rung 5) is an **incident**, not a prospective risk. Escalate to incident response; the risk assessment of it becomes a post-incident exercise with facts instead of estimates.

## Knowledge status (CRGO 0.9.x and 0.10.0)

Map every evidence class to the knowledge status CRGO records, and keep the mapping visible in the evidence register:

| Evidence class | Knowledge status |
|---|---|
| Verified organizational evidence | organisational observation |
| External / sector evidence, reference texts | reference fact |
| Assumption | assumption |
| Analyst estimate (parameters, KRIs, write-backs) | risk estimate |
| Any scenario | analytical hypothesis |
| Audit opinion or finding | audit conclusion |
| Approval, acceptance, exception, funding | management decision — by a named person with delegated authority, never by CRG |
| Confirmed after the fact | verified outcome |

- Record each item's evidence period, validity date and custodian; flag stale or out-of-scope evidence where it is used.
- **CRGO computes no risk.** Every number comes from `crg_calc.py` or the `crg-calculator` tools; do not ask CRGO for a score.
- **Write-backs are proposed, never approved.** A result stored through `crgo_submit_assessment` is a risk estimate with status *proposed*, not an approval, an acceptance or a funding decision. Cite it as proposed.
- **Supports ≠ proves.** A control that *supports compliance with* an obligation never shows compliance. Only a recorded compliance determination, with its evidence or an explicit evidence gap, states a compliance result.
- **EPSS ≠ scenario likelihood.** EPSS is a dated observation about a CVE in the wild; it is never `Pb(A)` or `Pb(ψ,A)`. Through the Threat Evidence Ladder, behind the exposure gate, it may only place `Pb(ψ,A)` in a band. A KEV listing says nothing about this organization's systems.
- **Unknown stays unknown.** Unknown applicability is **Evidence gap — organizational input required**, never "not applicable". *Potentially applicable* needs a qualified person: write "qualified review required". None of this is legal advice.
- **Incidents inform, they do not prove.** A confirmed incident is evidence for a scenario's likelihood, not proof of it. Alerts and monitoring exceptions are not findings.
- **Assessor lines.** Prefer independent control results (second line, internal audit, external assurer) over self-assessment; when they disagree, show both and flag the conflict.
- **Licensed standards** (IIA, ISACA, AICPA, COSO, ISO) appear only as identifiers, official headings and CRGO paraphrases. Never reproduce their text.
- **Fictional cases** (MediBec, Nordelle, Boréal) are teaching material, never calibration evidence.
- **Mapping ≠ compliance (0.10.0).** A mapping, policy statement, acknowledgement or attestation is never compliance. Only a dated compliance determination with evidence states a compliance state; one resting on evidence expired or judged insufficient is an evidence gap.
- **Alert ≠ incident (0.10.0).** An alert or an indicator match is never an incident or an attribution; incidents are confirmed by incident confirmations.
- **No authorisation from CRGO (0.10.0).** Nothing CRGO returns authorises a response action; executions without valid approval are audit signals. **Management decision required.**
- **Validated coverage needs a test (0.10.0).** Coverage counts as validated only with an effective detection test of the rule or strategy providing it.
- **Source confidence ≠ probability (0.10.0).** Indicator source confidence (e.g. STIX 0–100) never feeds `Pb(A)` or `Pb(ψ,A)` directly. CRGO gives no numbers.
- **TLP (0.10.0).** Respect TLP markings on threat intelligence in reports. Licensed standards such as ISO 37301 (and its 2024 amendment) stay identifiers and paraphrases.
- **Tenant separation.** Organisation graphs use the organisation's own IRI base, never `https://w3id.org/crgo/`, one organisation per file, and stay outside both repositories (git-ignored `output/` at most).
