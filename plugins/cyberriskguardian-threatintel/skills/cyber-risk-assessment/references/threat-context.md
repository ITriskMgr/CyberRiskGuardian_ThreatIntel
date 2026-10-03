# Threat context — sources, calibration and constraints

CyberRiskGuardian v1.2.0. © 2026 Marc-André Léger. CC BY-NC 4.0.

External threat intelligence is evidence about the **threat environment**. It is never a measure
of organizational risk. Risk emerges only when that evidence is placed against this
organization's assets, exposures, controls, criticality and consequences.

> A threat feed must not become a risk register.

## The analytical chain

```
Threat intelligence → organizational relevance → exposure → risk scenario
    → likelihood → impact → residual risk → risk decision
```

Worked example:

| Step | Content |
|---|---|
| External intelligence | A vulnerability is added to CISA KEV |
| Asset correlation | The CMDB identifies 14 systems running the affected product |
| Exposure analysis | Three of them are internet-facing |
| Control analysis | Two have compensating controls; one is directly exposed |
| Risk scenario | An external actor exploits the internet-facing vulnerability to obtain unauthorized access to the affected server |
| Business consequence | Access to sensitive information and a path for lateral movement |
| Reassessment | `Pb(ψ,A)` rises because exploitation is confirmed in the wild |

That chain is what management can act on. "A new IOC appeared" is not.

## Five constraints

**C1 — Reproducibility.** No network call may occur in the calculation path. Intelligence enters
only as a dated, pinned snapshot that an analyst has accepted and that becomes part of the
assessment record. `crg_calc.py`, `build_workbook.py`, `budget_calibrator.py` and the
`crg_risk` MCP tool stay offline and deterministic.

**C2 — No double counting.** CVSS v4.0 carries exploitation evidence in its Threat metric group
(`E`, Exploit Maturity). The CRG formula multiplies CVSS **and** `Pb(ψ,A)`. Counting a KEV
listing in both places overstates risk multiplicatively.
**Rule: CVSS stays Base-only. All exploitation evidence is routed to `Pb(ψ,A)`.** Base scores are
stable and reproducible; threat metrics are not. Do not set `E:A`, `E:P` or `E:U`.

**C3 — Horizon discipline.** Feeds work in days; `Pb(A)` and `Pb(ψ,A)` are 12-month judgements.
Intelligence places a scenario on a ladder rung and the rung gives a **band**. Never a decimal.

**C4 — Exposure gate.** Intelligence may move a parameter only where organizational evidence
shows exposure to the affected technology, sector or vector. Without it, the intelligence is
recorded as watch-list context and no score changes. This is what keeps Operating Principle 1
intact: organizational evidence is primary, external intelligence corroborates.

**C5 — Disclosure.** Querying an enrichment API for the exact CVEs an organization is exposed to
discloses that organization's vulnerability posture to a third party. **Bulk download, then join
locally.** Never transmit scenario text, asset inventories, client names or client CVE lists.

## Threat Evidence Ladder (Marc-André Léger)

| Rung | Band | Evidence |
|---|---|---|
| 1 | 0.10–0.20 | **Theoretical threat** — technically possible, little evidence of current exploitation |
| 2 | 0.30–0.40 | **Known threat activity** — related malware, techniques or adversary activity observed |
| 3 | 0.50–0.60 | **Relevant active campaigns** — organizations with similar technologies or characteristics are being targeted |
| 4 | 0.70–0.80 | **Confirmed exploitation of relevant technology** — KEV listing, or high EPSS, for technology the organization is confirmed to operate |
| 5 | 0.90–1.00 | **Direct organizational evidence** — matching malicious activity in the organization's own telemetry |

These are not universal probabilities. They are a calibration ladder for turning external
evidence into structured, comparable estimates inside one organization's model.

**Caution on rung 5.** If matching activity is confirmed in the organization's telemetry, the
situation is an **incident**, not a prospective risk. Invoke incident response first; the risk
assessment of that scenario becomes a post-incident exercise with known facts rather than
estimates.

### Mechanical thresholds

| Signal | Rung |
|---|---|
| CVE in CISA KEV, exposure confirmed | 4 |
| EPSS ≥ 0.50 or ≥ 90th percentile, exposure confirmed | 4 |
| EPSS < 0.05 and not in KEV | 1 |
| Otherwise, with some exploitation signal | 2 |
| Sector campaigns documented in region, last 12 months | 3 (or 4 with confirmed technology match) |
| Exploitation evidence, exposure **not** confirmed | no change — watch-list only |

### What intelligence may never touch

`δe`, `δm`, `θ` and `μ(E)` are properties of the organization: its damage profile, its resilience,
its criticality. No external feed knows them. Any adjustment of these four from a feed is a
methodology error.

## Source layers

**1 — Vulnerability intelligence.** CVE ecosystem, NVD CVE API 2.0 for CVSS v4.0 Base vectors and
CWE, vendor advisories. A published CVE establishes that a weakness exists, nothing more.

**2 — Exploitation intelligence.** Machine-ingested by `threat_snapshot.py`.

| Source | Access | Licence |
|---|---|---|
| CISA KEV | `cisagov/kev-data` mirror (JSON, CSV, schema; synced within minutes of cisa.gov, weekday updates) with cisa.gov as fallback | US Government work, public domain |
| FIRST EPSS v4 | bulk `https://epss.empiricalsecurity.com/epss_scores-YYYY-MM-DD.csv.gz`; REST at `https://api.first.org/data/v1/epss` (BETA) for ad-hoc checks only | fetched at run time, not redistributed |

EPSS and CVSS answer different questions and both are needed: **CVSS** how severe exploitation
could be, **EPSS** how likely exploitation is, **KEV** whether exploitation has already been
observed.

**3 — Malware and IOC intelligence.** abuse.ch ThreatFox, URLhaus, MalwareBazaar, Feodo Tracker;
LevelBlue/AlienVault OTX pulses. **Declared, never fetched by this toolkit.** An IOC is worthless
to a risk assessment until it is correlated against internal telemetry — DNS, firewall, proxy,
EDR, SIEM, authentication logs — and CyberRiskGuardian does not ingest telemetry. The analyst
performs the correlation in their own environment and supplies a confirmed match as
organizational evidence. That match, not the feed, is what moves a scenario to rung 5. Most of
these APIs now require an Auth-Key, which the analyst supplies and the package never ships.

**4 — Aggregation and correlation.** MISP, or a commercial threat-intelligence platform, as the
normalization layer: `feeds → MISP → normalization and correlation → risk analysis`. Preferable
to wiring dozens of feeds independently, because provenance, confidence, timestamps, tags and
relationships survive. STIX 2.1 and TAXII 2.1 (OASIS) are the exchange standards:
`sources → TAXII → STIX → TIP → SIEM/SOAR → risk register`.

**5 — Strategic intelligence.** Regional modules, ISAC/ISAO membership feeds, government
assessments, vendor research. Analyst-reviewed narrative, not machine-ingested. Selected with
`--regions`:

| Module | Sources |
|---|---|
| `ca` | Canadian Centre for Cyber Security advisories; National Cyber Threat Assessment |
| `us` | CISA advisories and alerts |
| `eu` | ENISA Threat Landscape; CIRCL OSINT |
| `uk` | NCSC advisories |
| `intl` | MITRE ATT&CK (STIX) |

Commercial platforms (Recorded Future, Mandiant/Google Cloud, CrowdStrike, Microsoft, Flashpoint,
Unit 42, Talos, FortiGuard) can supply actor profiling, sector targeting, dark-web and
credential-leak monitoring, ransomware intelligence and supply-chain intelligence. They are
optional and never a dependency: a CC BY-NC package must stay reproducible by anyone without a
licence. Their value is strategic context — "this ransomware group has shifted toward healthcare
organizations using a particular VPN product" is worth more to a hospital running that product
than a hundred thousand unrelated IP addresses.

**6 — Internal organizational evidence.** CMDB, vulnerability scanners, EDR, SIEM, identity
systems, cloud inventories, incident history. This layer is primary. The strongest assessment
comes from correlating layers 1–5 against this one.

## Operational practices

**Relevance** — filter by industry, geography, technologies, processes, adversaries, critical
assets and regulatory environment. **Timeliness** — keep first-seen, last-seen, publication and
expiry; stale IOCs generate heavy false positives because addresses and cloud infrastructure are
reassigned constantly. **Confidence** — an unverified community IOC does not carry the weight of
exploitation confirmed by CISA. **Correlation** — against asset inventories, scanners, identity
systems, telemetry and the existing scenario set. **Deduplication** — the same IOC appears in
dozens of feeds. **Automation** — APIs, STIX/TAXII, MISP, SIEM, SOAR for collection and
enrichment. **Expiration** — every indicator has a lifetime; ThreatFox now expires older IOCs
from its active datasets for this reason. **Human validation** — automation supports the analyst;
the analyst decides whether an observed threat is applicable and whether it materially changes a
scenario's likelihood or impact.

## Snapshot lifecycle

Snapshots expire **90 days** after retrieval. An assessment whose snapshot is absent, expired, or
applied without an exposure note fails QC review. Refresh with
`/refresh-threat-context`, which also produces the revision log.
