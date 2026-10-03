#!/usr/bin/env python3
"""
threat_snapshot.py — build a dated, pinned threat-context snapshot for CyberRiskGuardian.

CyberRiskGuardian v1.2.0.  © 2026 Marc-André Léger.  CC BY-NC 4.0.

Design constraints (see references/threat-context.md):
  C1  No network call ever occurs in the calculation path. This script is the ONLY
      component that touches the network, it is run deliberately by an analyst, and its
      output is a dated artifact that becomes part of the assessment record.
  C2  Exploitation evidence is routed to Pb(psi,A) only. CVSS stays Base-only.
  C3  Intelligence moves a band, never a decimal.
  C4  No parameter uplift without organizational exposure evidence.
  C5  Bulk download then local join. Never query an external API with the CVEs an
      organization is actually exposed to.

Usage
-----
  # Build a fresh snapshot (global + the regional modules you want)
  python3 threat_snapshot.py --refresh --regions ca,intl -o threat-context-2026-10-03.json

  # Re-use a shipped or previously built snapshot; no network at all
  python3 threat_snapshot.py --offline threat-context-2026-10-03.json --summary

  # Join a snapshot against your own CVE exposure list (local, nothing leaves the host)
  python3 threat_snapshot.py --offline snap.json --exposure my-cves.txt --summary
"""

from __future__ import annotations

import argparse
import csv
import datetime as _dt
import gzip
import io
import json
import os
import ssl
import sys
import urllib.error
import urllib.request
from typing import Any

SCHEMA_VERSION = "crg-threat-context/1"
DEFAULT_EXPIRY_DAYS = 90          # decision 2, author-approved
USER_AGENT = "CyberRiskGuardian/1.2.0 (+https://github.com/ITriskMgr/CyberRiskGuardian)"

# ---------------------------------------------------------------------------
# Source registry.  Global sources are always fetched; regional modules are opt-in
# so the package stays neutral for international users (decision 5).
# ---------------------------------------------------------------------------

GLOBAL_SOURCES = {
    "kev": {
        "name": "CISA Known Exploited Vulnerabilities Catalog",
        "url": "https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json",
        "fallback": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
        "licence": "US Government work, public domain",
        "role": "confirmed exploitation in the wild -> Pb(psi,A)",
    },
    "epss": {
        "name": "FIRST Exploit Prediction Scoring System (EPSS v4)",
        "url": "https://epss.empiricalsecurity.com/epss_scores-{date}.csv.gz",
        "licence": "FIRST / Empirical Security; fetched at run time, not redistributed",
        "role": "exploitation probability prior -> Pb(psi,A)",
    },
}

REGIONAL_SOURCES = {
    "ca": [
        {"name": "Canadian Centre for Cyber Security — advisories",
         "url": "https://www.cyber.gc.ca/en/alerts-advisories", "kind": "manual",
         "role": "national and sector threat context -> Pb(A)"},
        {"name": "Canadian Centre for Cyber Security — National Cyber Threat Assessment",
         "url": "https://www.cyber.gc.ca/en/guidance/national-cyber-threat-assessment-2025-2026",
         "kind": "manual", "role": "strategic sector context -> Pb(A)"},
    ],
    "us": [
        {"name": "CISA advisories and alerts", "url": "https://www.cisa.gov/news-events/cybersecurity-advisories",
         "kind": "manual", "role": "national and sector threat context -> Pb(A)"},
    ],
    "eu": [
        {"name": "ENISA Threat Landscape", "url": "https://www.enisa.europa.eu/topics/cyber-threats/threats-and-trends",
         "kind": "manual", "role": "strategic sector context -> Pb(A)"},
        {"name": "CIRCL OSINT feed", "url": "https://www.circl.lu/doc/misp/feed-osint/",
         "kind": "manual", "role": "IOC context; requires internal telemetry to be useful"},
    ],
    "uk": [
        {"name": "NCSC UK advisories", "url": "https://www.ncsc.gov.uk/section/advice-guidance/all-topics",
         "kind": "manual", "role": "national and sector threat context -> Pb(A)"},
    ],
    "intl": [
        {"name": "MITRE ATT&CK (STIX)", "url": "https://github.com/mitre-attack/attack-stix-data",
         "kind": "manual", "role": "scenario generation and event-sequence realism"},
    ],
}

# IOC feeds are a different class: they are worthless to a risk assessment unless the
# analyst can correlate them against internal telemetry (DNS, firewall, proxy, EDR, SIEM).
# CyberRiskGuardian does not ingest telemetry, so these are declared, never fetched. The
# analyst supplies a confirmed match as organizational evidence, which is what actually
# moves a parameter (see the ladder, rung 0.9-1.0).
TELEMETRY_CORRELATION_SOURCES = [
    {"name": "abuse.ch ThreatFox", "url": "https://threatfox.abuse.ch/api/", "auth": "Auth-Key required"},
    {"name": "abuse.ch URLhaus", "url": "https://urlhaus.abuse.ch/api/", "auth": "Auth-Key required"},
    {"name": "abuse.ch MalwareBazaar", "url": "https://bazaar.abuse.ch/api/", "auth": "Auth-Key required"},
    {"name": "abuse.ch Feodo Tracker", "url": "https://feodotracker.abuse.ch/", "auth": "Auth-Key required"},
    {"name": "LevelBlue / AlienVault OTX", "url": "https://otx.alienvault.com/api", "auth": "API key required"},
    {"name": "MISP (aggregation layer)", "url": "https://www.misp-project.org/feeds/", "auth": "self-hosted"},
]

# ---------------------------------------------------------------------------
# Threat Evidence Ladder — Marc-André Léger, CyberRiskGuardian v1.2.0.
# Intelligence places a scenario on a rung; the rung gives a band, not a decimal (C3).
# ---------------------------------------------------------------------------

THREAT_EVIDENCE_LADDER = [
    {"rung": 1, "band": [0.10, 0.20], "label": "Theoretical threat",
     "test": "Technically possible, little evidence of current exploitation."},
    {"rung": 2, "band": [0.30, 0.40], "label": "Known threat activity",
     "test": "Related malware, techniques or adversary activity observed somewhere."},
    {"rung": 3, "band": [0.50, 0.60], "label": "Relevant active campaigns",
     "test": "Organizations with similar technologies or characteristics are being targeted."},
    {"rung": 4, "band": [0.70, 0.80], "label": "Confirmed exploitation of relevant technology",
     "test": "KEV listing, or high EPSS, for a technology the organization is confirmed to operate."},
    {"rung": 5, "band": [0.90, 1.00], "label": "Direct organizational evidence",
     "test": "Matching malicious activity found in the organization's own telemetry.",
     "caution": "At this rung the situation is usually an incident, not a prospective risk. "
                "Invoke incident response first; risk assessment of it becomes a post-incident exercise."},
]

EPSS_RUNG4_MIN = 0.50          # or >= 90th percentile
EPSS_RUNG1_MAX = 0.05


_CERT_HINT = (
    "TLS certificate verification failed. The python.org build of Python on macOS ships without "
    "root certificates. Install them once with:\n"
    "    /Applications/Python\\ 3.x/Install\\ Certificates.command\n"
    "or install certifi (pip install certifi). Never disable verification: a threat-intelligence "
    "snapshot you cannot authenticate is worthless as evidence."
)


def _ssl_context() -> "ssl.SSLContext | None":
    """Prefer certifi's bundle when present; otherwise the interpreter's default."""
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:                                   # noqa: BLE001
        return None


def _fetch(url: str, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=_ssl_context()) as r:
            return r.read()
    except urllib.error.URLError as exc:
        if isinstance(getattr(exc, "reason", None), ssl.SSLError) or "CERTIFICATE_VERIFY_FAILED" in str(exc):
            raise RuntimeError(_CERT_HINT) from exc
        raise


def fetch_kev() -> dict[str, Any]:
    src = GLOBAL_SOURCES["kev"]
    for url in (src["url"], src["fallback"]):
        try:
            data = json.loads(_fetch(url))
            cves = {v["cveID"]: {"added": v.get("dateAdded"),
                                 "vendor": v.get("vendorProject"),
                                 "product": v.get("product"),
                                 "ransomware": v.get("knownRansomwareCampaignUse")}
                    for v in data.get("vulnerabilities", [])}
            return {"catalog_version": data.get("catalogVersion"),
                    "released": data.get("dateReleased"), "count": len(cves),
                    "retrieved_from": url, "cves": cves}
        except Exception as exc:                        # noqa: BLE001
            print(f"  KEV: {url} failed ({exc})", file=sys.stderr)
    raise RuntimeError("KEV could not be retrieved from any source")


def fetch_epss(date: str | None = None, back_days: int = 5) -> dict[str, Any]:
    """Bulk download, so no client CVE list is ever disclosed to FIRST (C5)."""
    start = _dt.date.fromisoformat(date) if date else _dt.date.today()
    for offset in range(back_days):
        day = (start - _dt.timedelta(days=offset)).isoformat()
        url = GLOBAL_SOURCES["epss"]["url"].format(date=day)
        try:
            raw = gzip.decompress(_fetch(url))
            text = io.StringIO(raw.decode("utf-8", "replace"))
            model = next(text).strip().lstrip("#")       # model/version comment line
            scores: dict[str, list[float]] = {}
            for row in csv.DictReader(text):
                cve = row.get("cve")
                if cve:
                    scores[cve] = [float(row["epss"]), float(row["percentile"])]
            return {"model_line": model, "score_date": day, "count": len(scores),
                    "retrieved_from": url, "scores": scores}
        except Exception as exc:                        # noqa: BLE001
            print(f"  EPSS: {day} unavailable ({exc})", file=sys.stderr)
    raise RuntimeError("EPSS could not be retrieved for any recent date")


def build(regions: list[str], epss_date: str | None, expiry_days: int) -> dict[str, Any]:
    today = _dt.date.today()
    print("Fetching global sources (bulk, no CVE disclosed)...", file=sys.stderr)
    kev = fetch_kev()
    epss = fetch_epss(epss_date)
    sources = [
        {**{k: v for k, v in GLOBAL_SOURCES["kev"].items() if k != "fallback"},
         "version": kev["catalog_version"], "released": kev["released"], "entries": kev["count"]},
        {**GLOBAL_SOURCES["epss"], "url": epss["retrieved_from"],
         "model": epss["model_line"], "score_date": epss["score_date"], "entries": epss["count"]},
    ]
    for region in regions:
        for s in REGIONAL_SOURCES.get(region, []):
            sources.append({**s, "region": region,
                            "note": "analyst-reviewed narrative source; not machine-ingested"})
    return {
        "schema": SCHEMA_VERSION,
        "generator": "threat_snapshot.py (CyberRiskGuardian 1.2.0)",
        "retrieved": today.isoformat(),
        "expires": (today + _dt.timedelta(days=expiry_days)).isoformat(),
        "regions": regions,
        "sources": sources,
        "telemetry_correlation_sources": TELEMETRY_CORRELATION_SOURCES,
        "threat_evidence_ladder": THREAT_EVIDENCE_LADDER,
        "thresholds": {"epss_rung4_min": EPSS_RUNG4_MIN, "epss_rung1_max": EPSS_RUNG1_MAX,
                       "epss_percentile_rung4_min": 0.90},
        "kev": {k: v for k, v in kev.items() if k != "cves"} | {"cves": kev["cves"]},
        "epss": {k: v for k, v in epss.items() if k != "scores"} | {"scores": epss["scores"]},
        "constraints": {
            "cvss": "Base score only. Exploitation evidence is routed to Pb(psi,A), never to CVSS "
                    "Threat metrics, to avoid double counting in a product (C2).",
            "exposure_gate": "No parameter uplift without organizational evidence of exposure (C4).",
            "never_adjust": ["delta_e", "delta_m", "theta", "mu_E"],
            "calculation_path": "Offline and deterministic. This snapshot is the only intelligence input (C1).",
        },
    }


def prune_epss(snap: dict[str, Any], threshold: float) -> dict[str, Any]:
    """Drop low-probability EPSS rows to keep a committed snapshot small.

    Rows for CVEs listed in KEV are always kept, whatever their score: they are the ones that
    reach ladder rung 4. classify() degrades gracefully for a CVE absent from the EPSS table and
    falls back to the KEV signal, so pruning costs nothing for the cases that matter.
    """
    epss = snap.get("epss", {})
    scores = epss.get("scores", {})
    kev = set(snap.get("kev", {}).get("cves", {}))
    before = len(scores)
    kept = {c: v for c, v in scores.items() if v[0] >= threshold or c in kev}
    epss["scores"] = kept
    epss["count"] = len(kept)
    epss["pruned"] = {"threshold": threshold, "kept": len(kept), "dropped": before - len(kept),
                      "rule": "score >= threshold, or CVE listed in KEV"}
    snap.setdefault("thresholds", {})["epss_pruned_below"] = threshold
    print(f"  EPSS pruned at {threshold}: kept {len(kept):,} of {before:,}", file=sys.stderr)
    return snap


def classify(cve: str, snap: dict[str, Any], exposed: bool) -> dict[str, Any]:
    """Place one CVE on the ladder. Returns the proposed band for Pb(psi,A)."""
    kev = snap.get("kev", {}).get("cves", {}).get(cve)
    sc = snap.get("epss", {}).get("scores", {}).get(cve)
    epss_score, percentile = (sc[0], sc[1]) if sc else (None, None)
    th = snap.get("thresholds", {})

    if kev:
        rung, why = 4, f"in CISA KEV since {kev.get('added')}"
        if kev.get("ransomware") == "Known":
            why += "; known ransomware campaign use"
    elif epss_score is not None and (epss_score >= th.get("epss_rung4_min", EPSS_RUNG4_MIN)
                                     or (percentile or 0) >= th.get("epss_percentile_rung4_min", 0.90)):
        rung, why = 4, f"EPSS {epss_score:.3f} ({percentile:.2%} pct)"
    elif epss_score is not None and epss_score < th.get("epss_rung1_max", EPSS_RUNG1_MAX):
        rung, why = 1, f"EPSS {epss_score:.3f}, not in KEV"
    elif epss_score is None and th.get("epss_pruned_below") is not None:
        # Absent from a pruned table and not in KEV: its score was below the prune threshold,
        # which is itself below the rung-1 ceiling. Treat as rung 1, not as "no signal".
        rung, why = 1, f"EPSS below {th['epss_pruned_below']} (pruned from this snapshot), not in KEV"
    else:
        rung, why = 2, (f"EPSS {epss_score:.3f}" if epss_score is not None else "no exploitation signal")

    entry = next(r for r in snap["threat_evidence_ladder"] if r["rung"] == rung)
    out = {"cve": cve, "rung": rung, "label": entry["label"], "band": entry["band"],
           "evidence": why, "exposure_confirmed": exposed}
    if not exposed:
        out["applies"] = False
        out["note"] = ("C4 exposure gate: no organizational evidence that this technology is "
                       "operated. Record as watch-list context; do not move Pb(psi,A).")
    else:
        out["applies"] = True
        out["parameter"] = "Pb(psi,A)"
        out["note"] = ("Propose Pb(psi,A) within the band. Record the exposure evidence in "
                       "threat_basis. CVSS stays Base-only (C2).")
    return out


def summarize(snap: dict[str, Any], exposure: list[str] | None) -> None:
    today = _dt.date.today().isoformat()
    stale = snap.get("expires", "9999-12-31") < today
    print(f"Snapshot    : {snap.get('retrieved')}  expires {snap.get('expires')}"
          f"{'   ** EXPIRED — refresh before use **' if stale else ''}")
    print(f"Schema      : {snap.get('schema')}")
    print(f"Regions     : {', '.join(snap.get('regions', [])) or 'global only'}")
    for s in snap.get("sources", []):
        bits = [s.get("name", "?")]
        for k in ("version", "released", "score_date", "entries"):
            if s.get(k) is not None:
                bits.append(f"{k}={s[k]}")
        print("  - " + "  ".join(str(b) for b in bits))
    print(f"KEV entries : {snap.get('kev', {}).get('count')}")
    print(f"EPSS scores : {snap.get('epss', {}).get('count')}")
    if exposure:
        print("\nExposure join (local only, nothing transmitted):")
        for cve in exposure:
            r = classify(cve, snap, exposed=True)
            band = f"{r['band'][0]:.2f}-{r['band'][1]:.2f}"
            print(f"  {cve:<18} rung {r['rung']} {r['label']:<42} band {band}  [{r['evidence']}]")
    print("\nReminder: this snapshot proposes bands for Pb(A) and Pb(psi,A) only. "
          "It must never adjust delta_e, delta_m, theta or mu(E).")


def main() -> int:
    p = argparse.ArgumentParser(description="Build or inspect a CyberRiskGuardian threat-context snapshot.")
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--refresh", action="store_true", help="fetch sources and build a new snapshot")
    g.add_argument("--offline", metavar="SNAPSHOT", help="load an existing snapshot; no network")
    p.add_argument("-o", "--out", help="output path (default threat-context-<date>.json)")
    p.add_argument("--regions", default="", help="comma list: ca,us,eu,uk,intl")
    p.add_argument("--epss-date", help="YYYY-MM-DD, for reproducing an older snapshot")
    p.add_argument("--expiry-days", type=int, default=DEFAULT_EXPIRY_DAYS)
    p.add_argument("--prune-epss", type=float, metavar="T",
                   help="drop EPSS rows below T (KEV-listed CVEs always kept); works with --refresh "
                        "or with --offline plus -o to shrink an existing snapshot without re-downloading")
    p.add_argument("--exposure", metavar="FILE", help="file of CVE ids the organization is confirmed to operate")
    p.add_argument("--summary", action="store_true", help="print a provenance summary for analyst review")
    a = p.parse_args()

    exposure = None
    if a.exposure:
        with open(a.exposure, encoding="utf-8") as fh:
            exposure = [ln.strip() for ln in fh if ln.strip() and not ln.startswith("#")]

    if a.prune_epss is not None and a.prune_epss >= EPSS_RUNG1_MAX:
        p.error(f"--prune-epss must stay below the rung-1 ceiling ({EPSS_RUNG1_MAX}); otherwise a "
                f"CVE absent from the pruned table cannot be inferred to sit on rung 1")

    if a.refresh:
        regions = [r.strip() for r in a.regions.split(",") if r.strip()]
        unknown = set(regions) - set(REGIONAL_SOURCES)
        if unknown:
            p.error(f"unknown region(s): {', '.join(sorted(unknown))}")
        snap = build(regions, a.epss_date, a.expiry_days)
        if a.prune_epss is not None:
            snap = prune_epss(snap, a.prune_epss)
        out = a.out or f"threat-context-{snap['retrieved']}.json"
        with open(out, "w", encoding="utf-8") as fh:
            json.dump(snap, fh, indent=1, sort_keys=False)
        print(f"Wrote {out} ({os.path.getsize(out) / 1e6:.1f} MB)", file=sys.stderr)
    else:
        with open(a.offline, encoding="utf-8") as fh:
            snap = json.load(fh)
        if snap.get("schema") != SCHEMA_VERSION:
            print(f"warning: schema {snap.get('schema')} != {SCHEMA_VERSION}", file=sys.stderr)
        if a.prune_epss is not None:
            if not a.out:
                p.error("--prune-epss with --offline also needs -o to write the pruned snapshot")
            snap = prune_epss(snap, a.prune_epss)
            with open(a.out, "w", encoding="utf-8") as fh:
                json.dump(snap, fh, indent=1, sort_keys=False)
            print(f"Wrote {a.out} ({os.path.getsize(a.out) / 1e6:.1f} MB)", file=sys.stderr)

    if a.summary:
        summarize(snap, exposure)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
