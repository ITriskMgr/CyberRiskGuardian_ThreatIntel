---
name: threat-context-calibration
description: Build, refresh or apply a dated threat-context snapshot (CISA KEV, FIRST EPSS, regional advisories) to calibrate Pb(A) and Pb(psi,A) in a CyberRiskGuardian assessment, and produce the threat-driven revision log. Use when asked to refresh threat intelligence, check whether an assessment is stale, calibrate likelihood against current exploitation evidence, or explain why a scenario crossed tolerance.
---

# Threat-context calibration

Turns external threat intelligence into dated, traceable, reproducible calibration of two
parameters — `Pb(A)` and `Pb(ψ,A)` — and nothing else.

Read `../cyber-risk-assessment/references/threat-context.md` before using this skill. It carries
the five constraints, the Threat Evidence Ladder and the source layers. The rules below are the
operative summary.

## Hard rules

1. **Never compute in the live feed.** Intelligence enters as a snapshot file the analyst
   accepts. The calculator stays offline.
2. **CVSS Base-only.** Route exploitation evidence to `Pb(ψ,A)`. Never set CVSS Threat metrics.
3. **Bands, not decimals.** Place the scenario on a ladder rung; propose a value inside the band.
4. **Exposure gate.** No uplift without organizational evidence that the affected technology,
   sector or vector applies. Otherwise record watch-list context and change nothing.
5. **Bulk, then join locally.** Never send client CVE lists, scenario text or asset inventories
   to an external endpoint.
6. **Never touch `δe`, `δm`, `θ`, `μ(E)`.** No feed knows them.
7. The snapshot **proposes**; a human **accepts**. No automatic re-quantification.

## Workflow

**1. Check freshness.**
```
python3 ../cyber-risk-assessment/scripts/threat_snapshot.py --offline <snapshot> --summary
```
Expired (over 90 days) or absent → refresh before doing anything else.

**2. Refresh.**
```
python3 ../cyber-risk-assessment/scripts/threat_snapshot.py --refresh --regions ca,intl \
        -o threat-context-$(date +%F).json
```
Pick regions from `ca,us,eu,uk,intl` to match where the organization operates. Review the
provenance summary with the analyst before accepting.

**3. Establish exposure.** From the organization's own evidence — CMDB, scanner output, asset
inventory, architecture documentation — list the CVEs and technologies it is confirmed to
operate. Without this list, step 4 produces watch-list context only. Say so rather than
proceeding as if exposure were established.

**4. Classify and propose.**
```
python3 ../cyber-risk-assessment/scripts/threat_snapshot.py --offline <snapshot> \
        --exposure confirmed-cves.txt --summary
```
For each affected scenario, record a `threat_basis` block in the assessment JSON: the parameter,
the value before and after, the evidence with dates, the exposure evidence, and a confidence
rating. A proposed change with no exposure line is not acceptable.

**5. Recalculate and compare.** Re-run `crg_calc.py` on the updated JSON. Report how many
scenarios are now above, approximately at, and below tolerance, and which ones moved.

**6. Produce the revision log.** This is the deliverable that answers "the assessment feels
outdated". Compare the previous snapshot and assessment with the current pair, and for each
movement write one sentence naming the cause:

> Since the 2026-07-02 assessment: **S4 moved from approximately at tolerance (1.04) to above
> tolerance (1.31)** because CVE-2026-XXXXX affecting the VPN appliance entered CISA KEV on
> 2026-08-14, raising `Pb(ψ,A)` from 0.50 to 0.70 (ladder rung 4, exposure confirmed in asset
> inventory §3.2). **No organizational change.** Recommended: accelerate the patch initiative
> from the 3–6 month tranche into 0–90 days.

Always separate movements caused by the **threat landscape** from movements caused by the
**organization**. A CISO needs to know which of the two happened.

## Scenario generation

When generating candidates, add an eighth perspective to the seven in `scenario-selection`:

**Intel-driven** — current campaigns against the sector and region, KEV additions affecting
confirmed organizational technology, ATT&CK techniques active against comparable organizations.
This perspective shapes which scenarios get written; it does not alter any formula.

## Reporting

Add to the cross-scenario analysis section:

- **Threat-context basis** — snapshot date, expiry, sources with versions and entry counts, the
  regions selected, and which scenarios carry an intel-backed `Pb` with exposure confirmed.
- **Revision log** — step 6.
- **Watch list** — exploitation evidence with no confirmed exposure, named so management can see
  what was considered and consciously excluded.

## KRIs this feature adds

| KRI | Target |
|---|---|
| Age in days of the threat-context snapshot in force | ≤ 90 |
| Share of material scenarios with an exposure-gated, intel-backed `Pb(ψ,A)` | ≥ 80% |
| KEV additions in the period affecting confirmed organizational technology | tracked, no target |
| Mean time from KEV listing to remediation of affected systems | organization-specific |

## Failure modes to avoid

- **Recency bias.** Everything at 0.9 because ransomware is in the news. The exposure gate exists
  precisely to stop this.
- **Double counting.** CVSS-BT plus an uplifted `Pb(ψ,A)` for the same KEV entry.
- **IOC theatre.** Downloading 500,000 indicators with no telemetry to correlate them against,
  then reporting the download as threat-informed risk management.
- **Silent staleness.** An assessment that reads as current while resting on a two-year-old
  threat picture. Always print the snapshot date in the report.
- **Mistaking an incident for a risk.** Ladder rung 5 means incident response, not a revised
  estimate.
