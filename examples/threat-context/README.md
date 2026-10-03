# Shipped threat-context snapshot

`threat-context-shipped.json` lets the threat-calibration feature work offline on first install
and gives the MediBec example an intel-backed variant.

It is **not** committed by this repository's initial scaffold, because a snapshot must be produced
by the script rather than written by hand. Generate it once:

```bash
python3 ../../plugins/cyberriskguardian-threatintel/skills/cyber-risk-assessment/scripts/threat_snapshot.py \
        --refresh --regions ca,intl -o threat-context-shipped.json
```

`.gitignore` excludes locally generated snapshots but keeps `threat-context-shipped.json`, so the
shipped one is tracked and the analyst's working copies are not.

## Refresh policy

Snapshots expire 90 days after retrieval. Regenerate before each release, and note the date in
`CHANGELOG.md`. A stale shipped snapshot is worse than none, because it reads as current: the
QC reviewer fails any assessment that relies on an expired snapshot, which is the intended
behaviour.

## Size

Expect roughly 15–30 MB — about 1,400 KEV entries plus around 290,000 EPSS scores. If that is
uncomfortable to commit, keep KEV in full and prune EPSS rows below 0.01; `classify()` degrades
gracefully when a CVE is absent from the EPSS table and falls back to the KEV signal.

## Redistribution

Check each source's terms before redistributing a snapshot. CISA KEV is a work of the United
States Government. EPSS is retrieved at run time and is not redistributed by the package itself —
committing a snapshot that embeds EPSS scores is a redistribution decision the author makes
deliberately. See `NOTICE.md`.
