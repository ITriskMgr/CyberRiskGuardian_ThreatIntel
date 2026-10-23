---
name: crg-dashboard
description: >
  This skill should be used when the user asks to "build my CyberRiskGuardian dashboard", "make a Claude Dashboard
  from this pack", "refresh my CyberRiskGuardian dashboard", or attaches a crg-dashboard-pack ZIP exported from
  CyberRiskGuardian Desktop (KRI dashboard → Claude Dashboard). It turns the pack into a Claude Dashboard artifact
  (KRIs, KRI history, scenarios against tolerance, security policies and acknowledgement coverage) or refreshes one.
metadata:
  version: "1.0.1"
  author: "Marc-André Léger (methodology) - packaged with Claude"
---

# CyberRiskGuardian → Claude Dashboard

CyberRiskGuardian Desktop exports a **dashboard pack** (`<organization>_crg-dashboard-pack.zip`, schema
`crg-dashboard-pack/1`) from **KRI dashboard → Claude Dashboard**. It holds:

| File | Use |
|---|---|
| `crg-dashboard-pack.json` | Manifest: `dashboard.title`, and one entry per dataset — `id`, `title`, `description`, `file`, `format`, `columns`, `rows`, `updated {at, by}` |
| `datasets/kri_current.csv`, `kri_history.csv`, `scenarios.csv`, `policies.csv` | The data, computed by the verified engine (`crg.js`, self-check 84,305 / 41,023) |
| `index.html` | A ready page written to the Dashboard contract (marks, `dash.onData`, `dash.calc` for `kri_status` and `ack_coverage`, d3 charts) |

## Build a dashboard from a pack

1. Read the manifest. Check `schema` is `crg-dashboard-pack/1`; say which workspace and organization it comes
   from and when it was created. A `kind` of `example` or `classroom` is fictional teaching data: say so in the title.
2. Create the dashboard from the **Dashboard** artifact type (quickstart with intent `other`, or the type's link),
   titled with `dashboard.title`, and follow the type's own instructions for everything below.
3. Upload each CSV of `datasets/` as an asset of the dashboard. Write one dataset document per manifest entry,
   with its `id`, `title`, `description`, `source: {kind: "file", url, name, format: "csv"}` and `updated` exactly
   as the manifest gives them. Mention once that anyone who can open the dashboard can read the attached files.
4. Write `dash/meta` with the title and `files/index.html` with the pack's `index.html` unchanged, unless the
   person asked for a different page. Then run the type's check.
5. Hand over in the person's words: what the page shows, the date of the pack, and these reading rules.

## Refresh

When a newer pack arrives for the same organization: upload the new CSVs and update each dataset's `url`, `name`
and `updated`; keep the page unless it changed (a new `index.html` replaces it). Never mix datasets from two packs.

## Reading rules (state them; never contradict them)

- Risk figures are **risk indices**: relative decision-support values in CRG risk units (factor 1,000), not predictions of
  loss and not KRIs. The risk-to-tolerance ratio reads < 0.90 below, 0.90–1.10 approximately at, > 1.10 above tolerance.
- Operational KRIs are what the organization recorded; anything not measured is an **Analytical estimate —
  validation required**.
- A policy acknowledgement or a mapping is **never compliance**.
- Do not recompute numbers from the pack: they come from the verified engine. Calculations on the page
  (`kri_status`, `ack_coverage`) only count and divide rows.
- The pack is confidential client data: no web search with its content, and keep the dashboard private until the
  person decides to share it.
