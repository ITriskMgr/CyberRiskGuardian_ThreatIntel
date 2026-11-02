# SSVC beside EPSS and KEV — reference

Stakeholder-Specific Vulnerability Categorization (SSVC) walks a short decision tree to a response
priority. CyberRiskGuardian uses it in vulnerability triage, beside the Threat Evidence Ladder: the
ladder may propose a band for `Pb(ψ,A)`; SSVC says how soon to respond. **An SSVC outcome is never a
likelihood and never moves a parameter.**

Source of every table: the CERT/CC SSVC repository (which also publishes CISA's tree),
<https://github.com/CERTCC/SSVC>, commit `bf3213bc0bd2bf3cf1329c9b48f72d7163a682b1`. The rows are
in `../../cyber-risk-assessment/scripts/ssvc.py` and, identically, in the desktop app
(`desktop/app/js/data/ssvc-tables.js`); `test_ssvc.py` diffs them against the CSVs when `SSVC_REPO`
points to a clone.

## The three trees

| Tree id | Use | Decision points | Outcomes |
|---|---|---|---|
| `deployer` (default) | CISA SSVC 2.0.3 — organizations that run the software | Exploitation · Automatable · Technical Impact · Mission & Well-being (Mission Prevalence × Public Well-Being Impact) | Track · Track\* · Attend · Act |
| `deployer-cert` | CERT/CC deployer patch application priority 1.0.0 | Exploitation · System Exposure · Automatable · Human Impact (Safety Impact × Mission Impact) | Defer · Scheduled · Out-of-Cycle · Immediate |
| `supplier` | CERT/CC supplier patch development priority 1.0.0 — organizations that develop it | Exploitation · Utility (Automatable × Value Density) · Technical Impact · Public Safety Impact (from Safety Impact) | Defer · Scheduled · Out-of-Cycle · Immediate |

**To check (author):** Mission & Well-being for Mission Prevalence *minimal* with Public Well-Being
Impact *material* is *medium* per CISA's SSVC Guide (November 2022). The SSVC decision-point
definition (Mission and Well-Being Impact 1.0.0) does not cover that combination; no published CSV
holds it.

## Exploitation from the snapshot

| Evidence (local snapshot, loaded feeds) | Suggested value |
|---|---|
| CVE listed in CISA KEV | `active` |
| EPSS ≥ `thresholds.epss_rung4_min` (0.50) or percentile ≥ `epss_percentile_rung4_min` (0.90), or a reported public proof of concept | `public poc` |
| Otherwise | `none` |

The analyst confirms or overrides the suggestion. An override needs a written justification, and
the record keeps both the suggested and the chosen value.

## The decision record (one per CVE)

`tree`, the decision points and their values, the derived points, `outcome`, the evidence (KEV
listing date, EPSS score and percentile, PoC reports, snapshot date), any override with its
justification, `by`, `date`, `justification`, and the history of earlier decisions.

## What SSVC does not do

- It does not set or adjust `Pb(A)`, `Pb(ψ,A)`, CVSS or any other parameter.
- It is not a risk index and is not compared with tolerance.
- It does not replace the exposure gate: an unconfirmed CVE can be triaged, but intelligence still
  moves nothing without confirmed exposure.
