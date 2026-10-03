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
