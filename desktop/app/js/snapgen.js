/* snapgen.js — build a threat-context snapshot in the browser from files the analyst downloaded in bulk
   (CISA KEV JSON and the FIRST EPSS daily CSV). Produces the same crg-threat-context/1 artifact as
   threat_snapshot.py --refresh. The app never fetches anything itself: C1 and C5 hold.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { GENERATOR } from './version.js';
import { LADDER, SCHEMA, EPSS_RUNG4_MIN, EPSS_RUNG1_MAX, EPSS_PCT_RUNG4_MIN, EPSS_AGE_GUARD_YEARS } from '../threat.js';

export const KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
export const KEV_MIRROR = 'https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json';
export const epssUrl = date => `https://epss.empiricalsecurity.com/epss_scores-${date}.csv.gz`;

export const GLOBAL_SOURCES = {
  kev: { name: 'CISA Known Exploited Vulnerabilities Catalog', url: KEV_MIRROR, licence: 'US Government work, public domain', role: 'confirmed exploitation in the wild -> Pb(psi,A)' },
  epss: { name: 'FIRST Exploit Prediction Scoring System (EPSS v4)', url: 'https://epss.empiricalsecurity.com/epss_scores-{date}.csv.gz', licence: 'FIRST / Empirical Security; fetched at run time, not redistributed', role: 'exploitation probability prior -> Pb(psi,A)' },
};
export const REGIONAL_SOURCES = {
  ca: [{ name: 'Canadian Centre for Cyber Security — advisories', url: 'https://www.cyber.gc.ca/en/alerts-advisories', kind: 'manual', role: 'national and sector threat context -> Pb(A)' },
       { name: 'Canadian Centre for Cyber Security — National Cyber Threat Assessment', url: 'https://www.cyber.gc.ca/en/guidance/national-cyber-threat-assessment-2025-2026', kind: 'manual', role: 'strategic sector context -> Pb(A)' }],
  us: [{ name: 'CISA advisories and alerts', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories', kind: 'manual', role: 'national and sector threat context -> Pb(A)' }],
  eu: [{ name: 'ENISA Threat Landscape', url: 'https://www.enisa.europa.eu/topics/cyber-threats/threats-and-trends', kind: 'manual', role: 'strategic sector context -> Pb(A)' },
       { name: 'CIRCL OSINT feed', url: 'https://www.circl.lu/doc/misp/feed-osint/', kind: 'manual', role: 'IOC context; requires internal telemetry to be useful' }],
  uk: [{ name: 'NCSC UK advisories', url: 'https://www.ncsc.gov.uk/section/advice-guidance/all-topics', kind: 'manual', role: 'national and sector threat context -> Pb(A)' }],
  intl: [{ name: 'MITRE ATT&CK (STIX)', url: 'https://github.com/mitre-attack/attack-stix-data', kind: 'manual', role: 'scenario generation and event-sequence realism' }],
};
export const TELEMETRY_CORRELATION_SOURCES = [
  { name: 'abuse.ch ThreatFox', url: 'https://threatfox.abuse.ch/api/', auth: 'Auth-Key required' },
  { name: 'abuse.ch URLhaus', url: 'https://urlhaus.abuse.ch/api/', auth: 'Auth-Key required' },
  { name: 'abuse.ch MalwareBazaar', url: 'https://bazaar.abuse.ch/api/', auth: 'Auth-Key required' },
  { name: 'abuse.ch Feodo Tracker', url: 'https://feodotracker.abuse.ch/', auth: 'Auth-Key required' },
  { name: 'LevelBlue / AlienVault OTX', url: 'https://otx.alienvault.com/api', auth: 'API key required' },
  { name: 'MISP (aggregation layer)', url: 'https://www.misp-project.org/feeds/', auth: 'self-hosted' },
];

async function fileText(file) {
  if (/\.gz$/i.test(file.name)) {
    const ds = new DecompressionStream('gzip');
    return await new Response(file.stream().pipeThrough(ds)).text();
  }
  return await file.text();
}

export async function parseKev(file) {
  const data = JSON.parse(await fileText(file));
  if (!Array.isArray(data.vulnerabilities)) throw new Error('not the CISA KEV JSON feed (no "vulnerabilities" array)');
  const cves = {};
  for (const v of data.vulnerabilities) cves[v.cveID] = { added: v.dateAdded, vendor: v.vendorProject, product: v.product, ransomware: v.knownRansomwareCampaignUse };
  return { catalog_version: data.catalogVersion, released: data.dateReleased, count: Object.keys(cves).length, retrieved_from: file.name + ' (analyst download)', cves };
}

export async function parseEpss(file) {
  const text = await fileText(file);
  const lines = text.split(/\r?\n/);
  let i = 0, model = '';
  if (lines[0].startsWith('#')) { model = lines[0].replace(/^#/, '').trim(); i = 1; }
  const head = lines[i].split(',').map(s => s.trim());
  const ci = head.indexOf('cve'), ei = head.indexOf('epss'), pi = head.indexOf('percentile');
  if (ci < 0 || ei < 0) throw new Error('not an EPSS CSV (expected columns cve, epss, percentile)');
  const scores = {};
  for (let k = i + 1; k < lines.length; k++) {
    const r = lines[k]; if (!r) continue;
    const c = r.split(',');
    scores[c[ci]] = [Number(c[ei]), Number(c[pi])];
  }
  const m = /score_date:(\d{4}-\d{2}-\d{2})/.exec(model) || /(\d{4}-\d{2}-\d{2})/.exec(file.name);
  return { model_line: model, score_date: m ? m[1] : null, count: Object.keys(scores).length, retrieved_from: file.name + ' (analyst download)', scores };
}

export function build({ kev, epss, regions = [], expiryDays = 90, ageGuard = EPSS_AGE_GUARD_YEARS, prune = null, today = new Date() }) {
  const t = new Date(today.toISOString().slice(0, 10));
  const iso = d => d.toISOString().slice(0, 10);
  const sources = [
    Object.assign({}, GLOBAL_SOURCES.kev, { version: kev.catalog_version, released: kev.released, entries: kev.count }),
    Object.assign({}, GLOBAL_SOURCES.epss, { url: epss.retrieved_from, model: epss.model_line, score_date: epss.score_date, entries: epss.count }),
  ];
  for (const r of regions) for (const s of REGIONAL_SOURCES[r] || []) sources.push(Object.assign({}, s, { region: r, note: 'analyst-reviewed narrative source; not machine-ingested' }));
  const snap = {
    schema: SCHEMA, generator: GENERATOR + ' (in-browser, from analyst-downloaded bulk files)',
    retrieved: iso(t), expires: iso(new Date(t.getTime() + expiryDays * 864e5)), regions, sources,
    telemetry_correlation_sources: TELEMETRY_CORRELATION_SOURCES,
    threat_evidence_ladder: LADDER.map(l => Object.assign({}, l)),
    thresholds: { epss_rung4_min: EPSS_RUNG4_MIN, epss_rung1_max: EPSS_RUNG1_MAX, epss_percentile_rung4_min: EPSS_PCT_RUNG4_MIN, epss_age_guard_years: ageGuard },
    kev: { catalog_version: kev.catalog_version, released: kev.released, count: kev.count, retrieved_from: kev.retrieved_from, cves: kev.cves },
    epss: { model_line: epss.model_line, score_date: epss.score_date, count: epss.count, retrieved_from: epss.retrieved_from, scores: epss.scores },
    constraints: {
      cvss: 'Base score only. Exploitation evidence is routed to Pb(psi,A), never to CVSS Threat metrics, to avoid double counting in a product (C2).',
      exposure_gate: 'No parameter uplift without organizational evidence of exposure (C4).',
      never_adjust: ['delta_e', 'delta_m', 'theta', 'mu_E'],
      calculation_path: 'Offline and deterministic. This snapshot is the only intelligence input (C1).',
    },
  };
  if (prune !== null && prune !== undefined && prune > 0) {
    if (prune >= EPSS_RUNG1_MAX) throw new Error(`prune threshold must stay below the rung-1 ceiling (${EPSS_RUNG1_MAX})`);
    const kevSet = new Set(Object.keys(kev.cves));
    const before = Object.keys(snap.epss.scores).length;
    const kept = {};
    for (const [c, v] of Object.entries(snap.epss.scores)) if (v[0] >= prune || kevSet.has(c)) kept[c] = v;
    snap.epss.scores = kept; snap.epss.count = Object.keys(kept).length;
    snap.epss.pruned = { threshold: prune, kept: snap.epss.count, dropped: before - snap.epss.count, rule: 'score >= threshold, or CVE listed in KEV' };
    snap.thresholds.epss_pruned_below = prune;
  }
  return snap;
}
