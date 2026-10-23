# CRGO integration (CyberRiskGuardian Ontology 0.10.0, contracts dss/v1, compliance/v1, secops/v1)

CyberRiskGuardian v1.4.0. © 2026 Marc-André Léger. CC BY-NC 4.0. Proof of concept: validate every output
before organizational use.

CRGO is an OWL 2 ontology (BFO-2020, CCO) with SKOS vocabularies that gives formal meaning to CRG data:
about 1,900 generic scenarios linked to ATT&CK, CSF 2.0, SP 800-53 r5, ISO/IEC 27002:2022, Loi 25 and other
regimes, plus a local MCP server. **CRGO states facts, links and their review status. It never computes
risk.** Every number comes from `scripts/crg_calc.py` or the `crg-calculator` MCP tools. The formulas, the
factor of 1,000 and the MediBec regression (84,305 / 41,023) are unchanged by CRGO.

## Connecting

| Item | Value |
|---|---|
| Release | pinned tag **v0.10.0** (documents report `ontologyRelease: "0.10.0"`; cite "CRGO v0.10.0 (ontology release 0.10.0)"). Minimum for dss/v1 (`graph`, `context`, `submit`): **v0.9.1** (v0.9.0 lacks the bridge fix; its documents report `"0.9.0"`). `compliance` and `secops` need v0.10.0 and stop with a clear message (exit 4) on an older checkout. |
| Location | `<repository>/CyberRiskGuardian-Ontology-0.10.0/` (git-ignored), or any path in `CRGO_HOME` |
| Requirements | `pip install "mcp>=1.2" pyoxigraph rdflib jsonschema` |
| Project `.mcp.json` | `python3 ./CyberRiskGuardian-Ontology-0.10.0/pipeline/mcp/crgo_server.py` |
| Plugin `.mcp.json` | `python3 ${CRGO_HOME:-./CyberRiskGuardian-Ontology-0.10.0}/pipeline/mcp/crgo_server.py` |
| First call | builds a local store in about 10 s |
| Licence | CRGO is CC BY-NC 4.0, a separate work by the same author; it is not redistributed here |

Tools: `crgo_sweep`, `crgo_identify`, `crgo_scenario` (also weaknesses, D3FEND, KEV evidence, EPSS
observations, `other_regimes`), `crgo_controls_for_technique`, `crgo_scenarios_for_control`,
`crgo_list_values`, `crgo_risk_context(org_graph_files, organization, scenario, as_of)` (read),
`crgo_submit_assessment(document, org_graph_files)` (write-back) and, from 0.10.0,
`crgo_compliance_context(org_graph_files, organization, as_of)` and `crgo_secops_context(org_graph_files, organization, as_of)`
(read only, dated, tenant-filtered).

## Rules

1. CRGO computes no risk, and CRG must not ask it to.
2. Write-backs are always `proposed`. A write-back is never an approval, a risk acceptance or a funding decision — **Management decision required**.
3. Organisation IRIs use the organisation's own base, never `https://w3id.org/crgo/`. One organisation per graph file. Use a base the organisation controls, or a private one for tests (`urn:` or `https://example.org/<org>/`).
4. *Supports compliance with* is not compliance. A mapped control supports an obligation; only a recorded compliance determination with its evidence states a compliance result.
5. EPSS is not a scenario likelihood. It is a dated observation about a CVE and is never `Pb(A)` or `Pb(ψ,A)`. A KEV listing says nothing about this organization's systems; the exposure gate still applies.
6. Unknown applicability stays unknown (**Information gap — organizational validation required**). *Potentially applicable* needs a qualified person (**qualified review required**). Neither is legal advice.
7. Licensed standards (IIA, ISACA, AICPA, COSO, ISO) appear only as identifiers, official headings and CRGO paraphrases. Never reproduce their text.
8. Nordelle, Boréal and MediBec are fictional and are not calibration evidence.
9. Organisation graphs, risk contexts, compliance and secops reads, and write-backs are client data. Keep them with the confidential deliverables (`output/crgo/` is git-ignored), never in this repository or in CRGO's.

Additions for CRGO 0.10.0 (brief 0.10.0, section 4):

10. A mapping, policy statement, acknowledgement or attestation is never compliance. Only a dated compliance determination with evidence states a compliance state.
11. An alert or an indicator match is never an incident or an attribution. Incidents are confirmed by incident confirmations.
12. Nothing CRGO returns authorises a response action; approval gaps are audit signals.
13. Coverage counts as validated only with an effective detection test of the rule or strategy providing it.
14. Source confidence (e.g. STIX 0–100) is not a probability and must not feed CRG likelihoods directly.
15. Respect TLP markings on threat intelligence in reports.
16. Licensed standards (ISO 37301 and its 2024 amendment, IIA, ISACA…) stay identifiers and paraphrases only.

## Knowledge status (evidence register, step 1)

| CRG evidence class | CRGO knowledge status |
|---|---|
| Verified organizational evidence | organisational observation |
| External / sector evidence, reference texts | reference fact |
| Assumption | assumption |
| Analytical estimate (parameters, risk indices) | risk estimate |
| Scenario (any) | analytical hypothesis |
| Audit opinion or finding | audit conclusion |
| Approval, acceptance, exception, funding | management decision (by a named person, never by CRG) |
| Confirmed after the fact | verified outcome |

Record the evidence period, validity date and custodian. Flag stale or out-of-scope evidence.

## Workflow with `scripts/crgo_contract.py`

```bash
CRGO=${CRGO_HOME:-./CyberRiskGuardian-Ontology-0.10.0}
S=plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts

# 1. organisation graph (crg2rdf.py + this skill's crg_calc.py); refuses bases under https://w3id.org/crgo/
python3 $S/crgo_contract.py graph <assessment>.json --crgo $CRGO \
        --base https://<org-namespace>/ --org-label "<Organization>"          # -> output/crgo/<org>.ttl + manifest

# 2. risk context per selected scenario (schema-validated); --summary prints the report tables
python3 $S/crgo_contract.py context --crgo $CRGO --graph output/crgo/<org>.ttl \
        --scenario S1 --as-of 2026-10-12 --out output/crgo/<org>-context-S1.json --summary

# 3. after crg_calc: proposed write-backs, one per scenario x quantity
python3 $S/crgo_contract.py submit --crgo $CRGO --graph output/crgo/<org>.ttl --assessment <assessment>.json \
        --scenarios S1,S2 --kinds residual-risk,risk-to-tolerance-ratio --actor "<analyst>"

# 4. (CRGO >= 0.10.0) compliance posture and detection/response readiness at the assessment date
python3 $S/crgo_contract.py compliance --crgo $CRGO --graph output/crgo/<org>.ttl [--graph <org>-policy.ttl ...] \
        --as-of 2026-10-12 --summary        # -> output/crgo/<org>-compliance-2026-10-12.json
python3 $S/crgo_contract.py secops --crgo $CRGO --graph output/crgo/<org>.ttl [--graph <org>-secops.ttl ...] \
        --as-of 2026-10-12 --summary        # -> output/crgo/<org>-secops-2026-10-12.json
```

- `context` accepts several `--graph` files (profile, applicability, assurance) for one organisation.
- `submit` runs `crg_calc.py` on the exact file, sets `inputDocumentSha256` to its SHA-256, `modelVersion` to this plugin's version, `ontologyRelease` from CRGO, the scenario's input records (`<base>S1-PbA`, `-Pbx`, `-De`, `-Dm`, `-Th`, `-Mu`, `-cvss`, plus `-red_p`, `-red_i` and `appetite` where they enter the quantity) and `status: proposed`. It refuses a graph built from a different file and a placeholder model version (TBD, unknown, n/a).
- Results go to `<org>-dss-proposed.ttl` next to the graph, the same name `crgo_server.py` uses, with a `-submissions.jsonl` log of each document and response.

| assessmentKind | crg_calc | Unit |
|---|---|---|
| estimated-risk | `est` | CRG risk units |
| tolerated-risk | `tol` | CRG risk units |
| mitigated-risk | `mit` | CRG risk units |
| residual-risk | `res` | CRG risk units |
| risk-to-tolerance-ratio | `ratio` | ratio |
| budget-target | `budget_target(appetite)` × IT budget, once per assessment | currency + ISO 4217 code (`--it-budget`, `--currency`, or `IT_BUDGET` / `CURRENCY` in the data) |
| sensitivity-case | residual of the lower and higher case (±0.10), scenarios in `SENS_IDS` only | CRG risk units |

Errors come back as `{"error": true, "code", "message", "details"}`: `SCHEMA_INVALID`, `UNKNOWN_ORGANISATION`,
`UNKNOWN_SUBJECT`, `TENANT_MISMATCH`, `REFERENCE_NAMESPACE`, `STATUS_NOT_PROPOSED`, `MODEL_VERSION_MISSING`,
`INPUT_UNKNOWN`. Show the message to the analyst and stop. Never retry with altered data.

`compliance` and `secops` call the same CRGO functions the MCP tools wrap (`pipeline/contracts/views.py`), with
`org_graph_files`, `organization` (default `<base>org`; `--org` is passed to CRGO unchanged) and `as_of`. The
document is validated against its schema before it is saved. On an error document (`UNKNOWN_ORGANISATION`,
`REFERENCE_NAMESPACE`, `SCHEMA_INVALID` for a bad date) the document is printed verbatim on stdout, the code and
message on stderr, nothing is saved, and the script exits 3: show it to the analyst; never retry with altered data.
The new records (policies, mappings, deadlines, rules, playbooks…) are added to the organisation's graph by the
organisation or by CRG under the organisation's base, with provenance; CRGO 0.10.0 has no write-back for them.
CRGO's synthetic Nordelle files (`tests/samples/nordelle-pca.ttl`, `nordelle-secops.ttl`) show every pattern.

## Reading the compliance context (compliance/v1)

| Field | Use in CRG |
|---|---|
| `obligations[].applicability`, `complianceState`, `determinedOn` | Compliance posture table (step 2): the latest recorded determination, never a mapping |
| `obligations[].evidenceStatus` | step 1: *expired*, *judged-insufficient* or *none* → Information gap — organizational validation required, not support; a state on such evidence is reported as a gap |
| `obligations[].supportingStatements` (mapping type, review state, version), `implementingMeasures` (latest result) | why a control is relevant; never proof of compliance |
| `obligations[].openFindings`, `findings[].overdueActions`, `rootCauses` | step 2 and step 8: weak control operation; overdue actions are treatment candidates (12–14) |
| `directiveVersions[].reviewOverdue` | governance gap (policy or standard past its review date) |
| `exceptions[].provisionsWithoutExemption` | compliance exposure: an internal exception cannot waive a law |
| `deadlines[]` (`due`, `answered`) | upcoming filings; an unanswered deadline already due is a pending obligation |
| `caveats`, `ontologyRelease`, `asOf` | limitations and citation |

## Reading the secops context (secops/v1)

| Field | Use in CRG |
|---|---|
| `scenarios[].coverage` (`status`, `validatedByTest`, techniques) | step 8 detective controls; validated only with an effective detection test |
| `scenarios[].detectionGaps` | step 8 evidence and step 12–14 treatment candidates |
| `scenarios[].playbooks[].simulationPassed` | response-control evidence; unsimulated playbook → simulate (12–14) |
| `detectionRules[]` (status, version, `requiredSources[].health`) | a rule needing silent telemetry does not detect; degraded telemetry weakens it |
| `untriagedAlerts[]` (`crownJewel`) | triage backlog; an alert is never an incident or attribution |
| `approvalGates[]`, `executionsWithoutValidApproval[]` (reason) | response-control operation; audit signals only, never an authorisation or a condemnation |
| `openRegulatoryTriage[]` | pending obligations: reportability undetermined, qualified review required |

Step 9: these are reasons for lower confidence in detection and response factors (chiefly `θ`), cited as CRGO
records; CRGO gives no numbers.

## Reading the risk context

| Field | Use in CRG |
|---|---|
| `scenario.knowledgeStatus` | always *analytical hypothesis* |
| `relatedAssets` | crown-jewel and dependency check (step 2–3) |
| `candidateObligations` | Legal applicability table: applicability, unresolved conditions, compliance state, evidence gap |
| `controlLinks` | step 8: control status, latest result per assessor line, aspect, date, open findings |
| `estimates` | step 9: assumptions, distribution and evidence quality feed rationale and confidence |
| `evidenceRefs`, `caveats` | evidence register and limitations |
| `ontologyRelease`, `asOf` | cite in the methodology section |

There is no risk score in the context, by design.

## Legal applicability (step 2)

The evaluator is a Python function, not an MCP tool:

```bash
python3 $CRGO/pipeline/grc/applicability.py <profile>.ttl <org IRI> <YYYY-MM-DD> <assessor IRI> <out>.ttl
```

It reads the organisation profile (organisation type, establishment, markets, processing activities,
data categories, transfers) and answers, per instrument (Loi 25 / P-39.1, A-2.1, R-22.1, PIPEDA, OSFI B-13,
GDPR, C-1.1): applicable · not applicable · potentially applicable · unknown. A fact the profile does not list
makes a condition *not met* only for properties the profile declares complete; otherwise it stays unknown.
Pass the output file to `context` as an extra `--graph`.

Converted CRG assessments carry no legal obligation unless the CRG data names one (link scenarios to
provisions such as `P-39.1 s. 10`) or the evaluator runs on a profile. An empty obligations list is therefore
an **Information gap — organizational validation required**, not "not applicable".

## Control evidence (step 8)

- One latest result per assessor line: self-assessment, second line, internal audit, external assurer.
- Prefer independent results. A self-assessment alone is lower-grade evidence.
- Self-assessment vs independent result that differ: show both and flag the conflict (CQ-GRCA-08).
- Open findings lower confidence. Operating-effectiveness tests record period, population, sample size and deviations; cite them.
- Policy exceptions: scoped, approved, compensated, expiring. An expired exception is no longer a mitigation, and none waives a law.

## Known limits of CRGO 0.9.x and 0.10.0

- 0.10.0: no write-back for policies, mappings, rules or playbooks; rule, alert, case and approval statuses are as last recorded (point-in-time history needs dated records); TAXII collections, OpenTelemetry attributes and CACAO agents/targets are not modelled; incident category and severity and root causes are CRGO's own scales; the order of some lists (e.g. `implementingMeasures`) is not guaranteed.

- The applicability evaluator is not exposed through MCP.
- IIA documents carry publication dates, not effective dates; COSO English titles are CRGO translations.
- Work programmes AUD-PAM-001 and AUD-VULN-001 are illustrative, not a validated methodology.
- ITSM, enterprise architecture, risk registers and domain packages are planned later.
