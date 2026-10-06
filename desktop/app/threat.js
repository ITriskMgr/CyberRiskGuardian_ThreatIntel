/* threat.js — threat-context panel logic for CyberRiskGuardian Desktop.
   Faithful port of classify() and the snapshot rules in threat_snapshot.py.
   © 2026 Marc-André Léger. CC BY-NC 4.0. */
'use strict';

export const SCHEMA = 'crg-threat-context/1';
export const EPSS_RUNG4_MIN = 0.50;
export const EPSS_RUNG1_MAX = 0.05;
export const EPSS_PCT_RUNG4_MIN = 0.90;
export const EPSS_AGE_GUARD_YEARS = 10;   // outside KEV, an older CVE cannot reach rung 4 on EPSS alone

export const LADDER = [
  { rung: 1, band: [0.10, 0.20], label: 'Theoretical threat',
    test: 'Technically possible, little evidence of current exploitation.' },
  { rung: 2, band: [0.30, 0.40], label: 'Known threat activity',
    test: 'Related malware, techniques or adversary activity observed somewhere.' },
  { rung: 3, band: [0.50, 0.60], label: 'Relevant active campaigns',
    test: 'Organizations with similar technologies or characteristics are being targeted.' },
  { rung: 4, band: [0.70, 0.80], label: 'Confirmed exploitation of relevant technology',
    test: 'KEV listing, or high EPSS, for a technology the organization is confirmed to operate.' },
  { rung: 5, band: [0.90, 1.00], label: 'Direct organizational evidence',
    test: "Matching malicious activity found in the organization's own telemetry.",
    caution: 'At this rung the situation is usually an incident, not a prospective risk. ' +
             'Invoke incident response first.' },
];

/** Days until expiry; negative when expired. */
export function snapshotAge(snap, today = new Date()) {
  const t = new Date(today.toISOString().slice(0, 10));
  const retrieved = snap?.retrieved ? new Date(snap.retrieved) : null;
  const expires = snap?.expires ? new Date(snap.expires) : null;
  const day = 86400000;
  return {
    retrieved: snap?.retrieved ?? null,
    expires: snap?.expires ?? null,
    ageDays: retrieved ? Math.round((t - retrieved) / day) : null,
    daysLeft: expires ? Math.round((expires - t) / day) : null,
    expired: expires ? expires < t : true,
  };
}

/** Place one CVE on the ladder. Mirrors threat_snapshot.classify(). */
export function classify(cve, snap, exposed) {
  const id = String(cve || '').trim().toUpperCase();
  const kev = snap?.kev?.cves?.[id];
  const sc = snap?.epss?.scores?.[id];
  const epss = sc ? sc[0] : null;
  const pct = sc ? sc[1] : null;
  const th = snap?.thresholds ?? {};
  const r4 = th.epss_rung4_min ?? EPSS_RUNG4_MIN;
  const r1 = th.epss_rung1_max ?? EPSS_RUNG1_MAX;
  const p4 = th.epss_percentile_rung4_min ?? EPSS_PCT_RUNG4_MIN;
  const prunedBelow = th.epss_pruned_below ?? null;
  const guard = th.epss_age_guard_years ?? EPSS_AGE_GUARD_YEARS;
  const yr = (id.match(/^CVE-(\d{4})-/) || [])[1];
  const ref = Number(String(snap?.retrieved ?? '9999').slice(0, 4));

  let rung, why;
  if (kev) {
    rung = 4;
    why = `in CISA KEV since ${kev.added ?? 'unknown date'}`;
    if (kev.ransomware === 'Known') why += '; known ransomware campaign use';
  } else if (epss !== null && (epss >= r4 || (pct ?? 0) >= p4)) {
    rung = 4;
    why = `EPSS ${epss.toFixed(3)} (${((pct ?? 0) * 100).toFixed(1)}% pct)`;
    // Age guard. EPSS stays high for very old CVEs because automated scanning keeps probing them,
    // not because a modern organization is credibly exposed. Outside KEV, cap those at rung 2.
    if (guard && yr && ref - Number(yr) > guard) {
      rung = 2;
      why = `${why} but the CVE is ${ref - Number(yr)} years old and not in KEV — ` +
            `age guard applied (over ${guard} years), capped at rung 2`;
    }
  } else if (epss !== null && epss < r1) {
    rung = 1;
    why = `EPSS ${epss.toFixed(3)}, not in KEV`;
  } else if (epss === null && prunedBelow !== null) {
    rung = 1;
    why = `EPSS below ${prunedBelow} (pruned from this snapshot), not in KEV`;
  } else {
    rung = 2;
    why = epss !== null ? `EPSS ${epss.toFixed(3)}` : 'no exploitation signal';
  }

  const entry = LADDER.find(l => l.rung === rung);
  const out = { cve: id, rung, label: entry.label, band: entry.band.slice(),
                evidence: why, exposureConfirmed: !!exposed };
  if (!exposed) {
    out.applies = false;
    out.note = 'C4 exposure gate: no organizational evidence that this technology is operated. ' +
               'Record as watch-list context; do not move Pb(psi,A).';
  } else {
    out.applies = true;
    out.parameter = 'Pb(psi,A)';
    out.note = 'Propose Pb(psi,A) within the band. Record the exposure evidence in threat_basis. ' +
               'CVSS stays Base-only (C2).';
    if (rung === 5) out.caution = entry.caution;
  }
  return out;
}

/** Parse a pasted or uploaded exposure list: CVE ids, one per line, # comments allowed. */
export function parseExposure(text) {
  const re = /CVE-\d{4}-\d{4,}/gi;
  const seen = new Set();
  for (const line of String(text || '').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    for (const m of line.match(re) || []) seen.add(m.toUpperCase());
  }
  return [...seen];
}

/** Summary counts for the panel header. */
export function snapshotStats(snap) {
  return {
    schema: snap?.schema ?? null,
    schemaOk: snap?.schema === SCHEMA,
    regions: snap?.regions ?? [],
    kev: snap?.kev?.count ?? Object.keys(snap?.kev?.cves ?? {}).length,
    epss: snap?.epss?.count ?? Object.keys(snap?.epss?.scores ?? {}).length,
    pruned: snap?.epss?.pruned ?? null,
    sources: (snap?.sources ?? []).map(s => ({
      name: s.name, version: s.version ?? null, scoreDate: s.score_date ?? null,
      entries: s.entries ?? null, region: s.region ?? null,
    })),
  };
}

/** Revision log between two result sets, keyed by scenario id. */
export function revisionLog(prev, next) {
  const band = r => (r < 0.90 ? 'below tolerance'
                   : r <= 1.10 ? 'approximately at tolerance' : 'above tolerance');
  const rows = [];
  const ids = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]);
  for (const id of [...ids].sort()) {
    const a = prev?.[id], b = next?.[id];
    if (!a || !b) { rows.push({ id, change: a ? 'removed' : 'added' }); continue; }
    const from = band(a.ratio), to = band(b.ratio);
    if (from !== to || Math.abs(a.ratio - b.ratio) >= 0.05) {
      rows.push({ id, fromRatio: a.ratio, toRatio: b.ratio, from, to,
                  crossed: from !== to, cause: b.cause ?? 'unattributed' });
    }
  }
  return rows;
}
