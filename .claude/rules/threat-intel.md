---
description: Threat-intelligence discipline for CyberRiskGuardian
globs: ["**/threat-context*.json", "**/threat_snapshot.py", "**/threat-context-calibration/**", "**/*assessment*.json"]
---

# Threat-intelligence rules

1. **No network in the calculation path.** `crg_calc.py`, `build_workbook.py`,
   `budget_calibrator.py` and the `crg_risk` MCP tool must remain offline and deterministic.
   `threat_snapshot.py` is the only component permitted to fetch, and only when an analyst runs
   it deliberately.
2. **CVSS is Base-only.** Exploitation evidence goes to `Pb(ψ,A)`. Never set CVSS v4.0 Threat
   metrics (`E:A`, `E:P`, `E:U`) — the formula multiplies CVSS and `Pb(ψ,A)`, so the same fact
   counted twice compounds.
3. **Exposure gate.** No parameter may be raised on external intelligence alone. Organizational
   evidence of exposure to the affected technology, sector or vector is required. Otherwise the
   intelligence is recorded as watch-list context.
4. **Bands, not decimals.** Use the Threat Evidence Ladder. A feed never justifies a value to
   two decimal places.
5. **`δe`, `δm`, `θ` and `μ(E)` are never adjusted from a feed.** They are properties of the
   organization.
6. **Bulk download, local join.** Never query an external endpoint with client CVE lists, asset
   inventories, scenario text or client names.
7. **Snapshots are dated and pinned.** Every assessment records the snapshot it used. Expiry is
   90 days. An expired or absent snapshot fails QC.
8. **The snapshot proposes; a human accepts.** No automatic re-quantification of a risk register.
9. **Rung 5 is an incident.** Matching activity confirmed in organizational telemetry means
   incident response, not a revised estimate.
10. **Licence hygiene.** Only sources whose terms permit this use. KEV is public domain; EPSS is
    fetched, never redistributed; ATT&CK and EPSS attribution belong in `NOTICE.md`. Commercial
    and Auth-Key feeds are optional and analyst-supplied, never bundled.
