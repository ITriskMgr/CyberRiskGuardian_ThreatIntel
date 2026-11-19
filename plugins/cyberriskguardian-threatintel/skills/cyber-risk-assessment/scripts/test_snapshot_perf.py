#!/usr/bin/env python3
# SPDX-License-Identifier: CC-BY-NC-4.0
# Copyright (c) 2026 Marc-André Léger
"""test_snapshot_perf.py — time and memory budget of threat_snapshot.py on a full-size, synthetic input (BL-22).

No network: the two bulk downloads are replaced by local data of real size (1,800 KEV entries; 400,000 EPSS rows,
gzipped like FIRST's daily file), then the snapshot is built, pruned at 0.001, written to a temporary file and 2,000 CVEs
are classified on the ladder. Fails when the whole run exceeds 60 seconds or 1.5 GB of Python heap.

    python3 test_snapshot_perf.py            # prints the timings
"""
import gzip
import io
import json
import os
import random
import sys
import tempfile
import time
import tracemalloc

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import threat_snapshot as ts  # noqa: E402

N_KEV, N_EPSS, N_CLASSIFY = 1_800, 400_000, 2_000
BUDGET_S, BUDGET_MB = 60.0, 1_536


def synthetic():
    rnd = random.Random(20261119)
    cves = [f"CVE-{2000 + i % 27}-{10000 + i}" for i in range(N_EPSS)]
    kev = {"catalogVersion": "2026.11.18", "dateReleased": "2026-11-18T00:00:00Z",
           "vulnerabilities": [{"cveID": c, "dateAdded": "2025-01-01", "vendorProject": "v", "product": "p",
                                "knownRansomwareCampaignUse": "Unknown"} for c in rnd.sample(cves, N_KEV)]}
    buf = io.StringIO()
    buf.write("#model_version:v2025.03.14,score_date:2026-11-18T00:00:00+0000\ncve,epss,percentile\n")
    for c in cves:
        e = rnd.random() ** 6                          # most scores are tiny, as in the real file
        buf.write(f"{c},{e:.5f},{min(1.0, e * 3):.5f}\n")
    return json.dumps(kev).encode(), gzip.compress(buf.getvalue().encode()), cves, rnd


def main():
    kev_bytes, epss_bytes, cves, rnd = synthetic()
    ts._fetch = lambda url, timeout=60: kev_bytes if "known_exploited" in url or "kev" in url.lower() else epss_bytes
    tracemalloc.start()
    t0 = time.perf_counter()
    snap = ts.build(["ca", "intl"], "2026-11-18", 90)
    t1 = time.perf_counter()
    ts.prune_epss(snap, 0.001)
    t2 = time.perf_counter()
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, "threat-context-2026-11-18.json")
        with open(out, "w", encoding="utf-8") as fh:
            json.dump(snap, fh)
        size = os.path.getsize(out)
    t3 = time.perf_counter()
    for c in rnd.sample(cves, N_CLASSIFY):
        ts.classify(c, snap, exposed=True)
    t4 = time.perf_counter()
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    total, peak_mb = t4 - t0, peak / 2 ** 20
    print(f"build {t1 - t0:.1f} s · prune {t2 - t1:.1f} s · write {t3 - t2:.1f} s ({size / 2 ** 20:.1f} MB) · "
          f"classify {N_CLASSIFY:,} {t4 - t3:.2f} s · total {total:.1f} s · peak heap {peak_mb:.0f} MB")
    assert snap["kev"]["count"] == N_KEV and snap["epss"]["pruned"]["kept"] >= N_KEV, "KEV entries must survive pruning"
    assert total < BUDGET_S, f"snapshot pipeline took {total:.1f} s (budget {BUDGET_S:.0f} s)"
    assert peak_mb < BUDGET_MB, f"peak heap {peak_mb:.0f} MB (budget {BUDGET_MB} MB)"
    print("OK")


if __name__ == "__main__":
    main()
