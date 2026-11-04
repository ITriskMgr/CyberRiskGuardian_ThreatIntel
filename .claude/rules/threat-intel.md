---
description: Threat-intelligence discipline for CyberRiskGuardian
globs: ["**/threat-context*.json", "**/threat_snapshot.py", "**/threat-context-calibration/**", "**/*assessment*.json"]
---

# Threat-intelligence rules

Complements AGENTS.md §Threat context and §Key formulas (snapshot pinning and 90-day expiry, `Pb(A)`/`Pb(ψ,A)` only,
exposure, `δe`/`δm`/`θ`/`μ(E)` never from a feed, CVSS Base-only, bulk download, IOC feeds declared only).

1. **Only `threat_snapshot.py` fetches**, and only when an analyst runs it deliberately. `crg_calc.py`,
   `build_workbook.py`, `budget_calibrator.py` and the `crg_risk` MCP tool stay offline and deterministic.
2. **Exposure note or watch list.** An intel-derived parameter change without an exposure note
   (organizational evidence that the technology, sector or vector applies here) is an unsupported claim;
   record the intelligence on the watch list instead.
3. **Bands, not decimals.** A feed never justifies a value to two decimal places.
4. **Cite by snapshot**: source, version or score date, and the snapshot's retrieval date. "CISA KEV" alone
   is not a citation; "CVE-2026-XXXXX in KEV since 2026-08-14, snapshot 2026-10-03" is. Where a stale
   (> 90 days) snapshot is used, say so; an expired or absent snapshot fails QC.
5. **The snapshot proposes; a human accepts.** No automatic re-quantification of a risk register.
6. **Rung 5 is an incident.** Matching activity confirmed in organizational telemetry means incident
   response, not a revised estimate; its assessment becomes a post-incident exercise with facts.
7. **No client names** in external queries either.
8. **Licence hygiene.** Only sources whose terms permit this use. KEV is public domain; EPSS is fetched,
   never redistributed; ATT&CK and EPSS attribution belong in `NOTICE.md`. Commercial and Auth-Key feeds
   are optional and analyst-supplied, never bundled.
