/* siem.js — SIEM model, local only (Beta 1.6.x): telemetry sources and their health, event records
   (pointers, never payloads), OCSF 1.9.0 normalisation, ATT&CK detection strategies, detection rules
   and their lifecycle, detection tests, coverage, detection gaps, alerts and threat indicators.
   Parsers for Sigma YAML (a subset), STIX 2.1 bundles, CSV and the "crg-siem-import/1" envelope
   (docs/SIEM-SOAR-IMPORT-FORMAT.md). No network call: files are imported from this computer.

   Rules carried here (CRGO 0.10 crgo-siem, contract secops/v1):
     • Coverage counts as validated only with an effective detection test of the rule, dated on or
       before the as-of date. A rule whose required telemetry is silent does not detect.
     • An alert, or an indicator match, is never an incident nor an attribution.
     • Source confidence (STIX 0–100) is kept with its method and is never a probability: it never
       feeds a CRG likelihood.
     • TLP 2.0 markings travel with every indicator and alert, in screens and exports.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, touch } from './state.js';
import { today, parseCSV, toCSV } from './util.js';
import { nextId } from './grcui.js';
import * as LOG from './logs.js';
import { criticality } from './assets.js';

export const IMPORT_SCHEMA = 'crg-siem-import/1';

/* ---------------- vocabularies (value → label → CRGO term) ---------------- */
export const HEALTH = [['healthy', 'Healthy'], ['degraded', 'Degraded'], ['silent', 'Silent'], ['unknown', 'Unknown']];
export const HEALTH_KIND = { healthy: 'good', degraded: 'warn', silent: 'bad', unknown: '' };
export const HEALTH_CRGO = { healthy: 'CRGO_0001152', degraded: 'CRGO_0001153', silent: 'CRGO_0001154', unknown: 'CRGO_0001155' };

export const RULE_STATUS = [['draft', 'Draft'], ['testing', 'Testing'], ['production', 'Production'], ['disabled', 'Disabled'], ['retired', 'Retired']];
export const RULE_KIND = { draft: '', testing: 'warn', production: 'good', disabled: 'bad', retired: '' };
/** Application status → CRGO detection status (draft, testing, enabled, suppressed, retired). */
export const RULE_CRGO = { draft: 'CRGO_0001131', testing: 'CRGO_0001132', production: 'CRGO_0001134', disabled: 'CRGO_0001135', retired: 'CRGO_0001136' };
export const LEVELS = [['informational', 'Informational'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['critical', 'Critical']];
export const LANGS = [['sigma', 'Sigma'], ['native', 'Native (SIEM query language)'], ['correlation', 'Correlation rule'], ['yara', 'YARA'], ['other', 'Other']];

export const TEST_RESULTS = [['effective', 'Effective'], ['ineffective', 'Ineffective']];
export const TEST_METHODS = [['replay', 'Replay of recorded events'], ['emulation', 'Adversary emulation (atomic test)'], ['purple-team', 'Purple-team exercise'], ['unit', 'Rule unit test (fixture)'], ['other', 'Other']];

export const COVERAGE = [['validated', 'Validated'], ['untested', 'Untested'], ['degraded', 'Degraded'], ['missing', 'Missing']];
export const COVERAGE_KIND = { validated: 'good', untested: 'warn', degraded: 'bad', missing: 'bad' };
export const COVERAGE_CRGO = { validated: 'CRGO_0001147', untested: 'CRGO_0001146', degraded: 'CRGO_0001148', missing: 'CRGO_0001149' };
const COVERAGE_RANK = { validated: 3, untested: 2, degraded: 1, missing: 0 };

export const TRIAGE = [['new', 'New'], ['in-triage', 'In triage'], ['benign', 'Benign'], ['false-positive', 'False positive'], ['escalated', 'Escalated to a SOAR case']];
export const TRIAGE_KIND = { new: 'warn', 'in-triage': 'warn', benign: 'good', 'false-positive': 'good', escalated: 'bad' };
/** Triage state → CRGO alert disposition. Escalation is "indeterminate": only an incident confirmation (SOAR) makes an incident. */
export const TRIAGE_CRGO = { new: 'CRGO_0001139', 'in-triage': 'CRGO_0001139', benign: 'CRGO_0001142', 'false-positive': 'CRGO_0001141', escalated: 'CRGO_0001143' };
export const SEVERITY = [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['critical', 'Critical']];
const SEV_W = { informational: 0, low: 1, medium: 2, high: 3, critical: 4 };

export const GAP_STATES = [['open', 'Open'], ['accepted', 'Accepted by management'], ['closed', 'Closed']];

/** TLP 2.0. Restricted = never exported without an explicit choice. */
export const TLP = [['CLEAR', 'TLP:CLEAR'], ['GREEN', 'TLP:GREEN'], ['AMBER', 'TLP:AMBER'], ['AMBER+STRICT', 'TLP:AMBER+STRICT'], ['RED', 'TLP:RED']];
export const TLP_CRGO = { RED: 'CRGO_0001158', 'AMBER+STRICT': 'CRGO_0001159', AMBER: 'CRGO_0001160', GREEN: 'CRGO_0001161', CLEAR: 'CRGO_0001162' };
export const TLP_RESTRICTED = new Set(['RED', 'AMBER+STRICT']);
/** STIX marking-definition ids: TLP 2.0 (extension) and TLP 1.0 (STIX 2.1 §7.2.1.4; WHITE = CLEAR). */
const TLP_STIX = {
  'marking-definition--94868c89-83c2-464b-929b-a1a8aa3c8487': 'CLEAR', 'marking-definition--bab4a63c-aed9-4cf5-a766-dfca5abac2bb': 'GREEN',
  'marking-definition--55d920b0-5e8b-4f79-9ee9-91f868d9b421': 'AMBER', 'marking-definition--939a9414-2ddd-4d32-a0cd-375ea402b003': 'AMBER+STRICT',
  'marking-definition--e828b379-4e03-4974-9ac4-e53a884c97c1': 'RED',
  'marking-definition--613f2e26-407d-48c7-9eca-b8e91df99dc9': 'CLEAR', 'marking-definition--34098fce-860f-48ae-8e50-ebd3cc5e41da': 'GREEN',
  'marking-definition--f88d31f6-486f-44da-b317-01333bde0b82': 'AMBER', 'marking-definition--5e57c739-391a-4eb3-b6be-7d15ca92d5ed': 'RED',
};
/** "TLP:AMBER+STRICT", "amber+strict", "white", "TLP:CLEAR" → canonical value, or '' when not a TLP label. */
export function normTlp(v) {
  const s = String(v ?? '').trim().toUpperCase().replace(/^TLP\s*:\s*/, '').replace(/\s+/g, '');
  if (s === 'WHITE') return 'CLEAR';
  return TLP.some(t => t[0] === s) ? s : '';
}
export const tlpLabel = v => 'TLP:' + (normTlp(v) || 'AMBER');
export const TLP_KIND = { CLEAR: '', GREEN: 'good', AMBER: 'warn', 'AMBER+STRICT': 'bad', RED: 'bad' };

/** OCSF 1.9.0 event classes: uid → [class name, caption]. */
export const OCSF = {
  1001: ['file_activity', 'File System Activity'], 1002: ['kernel_extension_activity', 'Kernel Extension Activity'], 1003: ['kernel_activity', 'Kernel Activity'],
  1004: ['memory_activity', 'Memory Activity'], 1005: ['module_activity', 'Module Activity'], 1006: ['scheduled_job_activity', 'Scheduled Job Activity'],
  1007: ['process_activity', 'Process Activity'], 1008: ['event_log_actvity', 'Event Log Activity'], 1009: ['script_activity', 'Script Activity'],
  1010: ['peripheral_activity', 'Peripheral Activity'], 1011: ['device_power_state_activity', 'Device Power State Activity'], 1012: ['clipboard_activity', 'Clipboard Activity'],
  2001: ['security_finding', 'Security Finding'], 2002: ['vulnerability_finding', 'Vulnerability Finding'], 2003: ['compliance_finding', 'Compliance Finding'],
  2004: ['detection_finding', 'Detection Finding'], 2005: ['incident_finding', 'Incident Finding'], 2006: ['data_security_finding', 'Data Security Finding'],
  2007: ['application_security_posture_finding', 'Application Security Posture Finding'], 2008: ['iam_analysis_finding', 'IAM Analysis Finding'],
  3001: ['account_change', 'Account Change'], 3002: ['authentication', 'Authentication'], 3003: ['authorize_session', 'Authorize Session'],
  3004: ['entity_management', 'Entity Management'], 3005: ['user_access', 'User Access Management'], 3006: ['group_management', 'Group Management'],
  3007: ['user_management', 'User Management'], 3008: ['role_management', 'Role Management'],
  4001: ['network_activity', 'Network Activity'], 4002: ['http_activity', 'HTTP Activity'], 4003: ['dns_activity', 'DNS Activity'], 4004: ['dhcp_activity', 'DHCP Activity'],
  4005: ['rdp_activity', 'RDP Activity'], 4006: ['smb_activity', 'SMB Activity'], 4007: ['ssh_activity', 'SSH Activity'], 4008: ['ftp_activity', 'FTP Activity'],
  4009: ['email_activity', 'Email Activity'], 4010: ['network_file_activity', 'Network File Activity'], 4011: ['email_file_activity', 'Email File Activity'],
  4012: ['email_url_activity', 'Email URL Activity'], 4013: ['ntp_activity', 'NTP Activity'], 4014: ['tunnel_activity', 'Tunnel Activity'],
  5001: ['inventory_info', 'Device Inventory Info'], 5002: ['config_state', 'Device Config State'], 5003: ['user_inventory', 'User Inventory Info'],
  5004: ['patch_state', 'Operating System Patch State'], 5006: ['kernel_object_query', 'Kernel Object Query'], 5007: ['file_query', 'File Query'],
  5008: ['folder_query', 'Folder Query'], 5009: ['admin_group_query', 'Admin Group Query'], 5010: ['job_query', 'Job Query'], 5011: ['module_query', 'Module Query'],
  5012: ['network_connection_query', 'Network Connection Query'], 5013: ['networks_query', 'Networks Query'], 5014: ['peripheral_device_query', 'Peripheral Device Query'],
  5015: ['process_query', 'Process Query'], 5016: ['service_query', 'Service Query'], 5017: ['session_query', 'User Session Query'], 5018: ['user_query', 'User Query'],
  5019: ['device_config_state_change', 'Device Config State Change'], 5020: ['software_info', 'Software Inventory Info'], 5021: ['osint_inventory_info', 'OSINT Inventory Info'],
  5022: ['startup_item_query', 'Startup Item Query'], 5023: ['cloud_resources_inventory_info', 'Cloud Resources Inventory Info'], 5040: ['evidence_info', 'Live Evidence Info'],
  6001: ['web_resources_activity', 'Web Resources Activity'], 6002: ['application_lifecycle', 'Application Lifecycle'], 6003: ['api_activity', 'API Activity'],
  6004: ['web_resource_access_activity', 'Web Resource Access Activity'], 6005: ['datastore_activity', 'Datastore Activity'], 6006: ['file_hosting', 'File Hosting Activity'],
  6007: ['scan_activity', 'Scan Activity'], 6008: ['application_error', 'Application Error'],
  7001: ['remediation_activity', 'Remediation Activity'], 7002: ['file_remediation_activity', 'File Remediation Activity'], 7003: ['process_remediation_activity', 'Process Remediation Activity'],
  7004: ['network_remediation_activity', 'Network Remediation Activity'], 8001: ['drone_flights_activity', 'Drone Flights Activity'], 8002: ['airborne_broadcast_activity', 'Airborne Broadcast Activity'],
};
export const OCSF_VERSION = '1.9.0';
/** 3002, "3002", "authentication", "Authentication" → 3002; anything else → null. */
export function normOcsf(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (Number.isInteger(n) && OCSF[n]) return n;
  const s = String(v).trim().toLowerCase();
  for (const [k, [name, cap]] of Object.entries(OCSF)) if (s === name || s === cap.toLowerCase()) return Number(k);
  return null;
}
export const ocsfLabel = uid => OCSF[uid] ? `${uid} ${OCSF[uid][1]} (${OCSF[uid][0]})` : '—';
export const OCSF_OPTIONS = [['', '—'], ...Object.entries(OCSF).map(([k, v]) => [k, `${k} ${v[1]}`])];

/* ATT&CK identifiers (techniques, detection strategies, analytics, data components). */
export const TECH_RE = /\bT\d{4}(?:\.\d{3})?\b/g;
export const techniques = v => [...new Set((Array.isArray(v) ? v.join(' ') : String(v ?? '')).toUpperCase().match(TECH_RE) || [])];
const idsOf = (v, re) => [...new Set((Array.isArray(v) ? v.join(' ') : String(v ?? '')).toUpperCase().match(re) || [])];
export const detStrategies = v => idsOf(v, /\bDET\d{4}\b/g);
export const analytics = v => idsOf(v, /\bAN\d{4}\b/g);
export const dataComponents = v => idsOf(v, /\bDC\d{4}\b/g);

/* ---------------- record access ---------------- */
/** The SIEM record of a workspace, with every sub-register present. */
export function reg(ws = S.ws) {
  const R = (ws.siem ||= {});
  for (const k of ['sources', 'rules', 'tests', 'coverage', 'gaps', 'alerts', 'indicators', 'imports', 'strategies', 'events']) if (!Array.isArray(R[k])) R[k] = [];
  return R;
}
const day = d => String(d || '').slice(0, 10);
const onOrBefore = (d, asOf) => !!d && day(d) <= asOf;
const lc = s => String(s ?? '').trim().toLowerCase();
const arr = v => Array.isArray(v) ? v.map(x => String(x).trim()).filter(Boolean) : String(v ?? '').split(/[;|,\n]/).map(x => x.trim()).filter(Boolean);

/* ---------------- telemetry health ---------------- */
/**
 * Health of a telemetry source at a date: the latest observation recorded on or before it (else the
 * source's own state), made "silent" when the last event is older than three expected cadences
 * (stale collection). Returns { state, stale, observed }.
 */
export function healthAt(src, asOf = today()) {
  if (!src) return { state: 'silent', stale: false, missing: true, observed: null };
  const h = (src.healthHistory || []).filter(e => onOrBefore(e.date, asOf)).sort((a, b) => (day(a.date) < day(b.date) ? -1 : 1));
  let state = h.length ? h[h.length - 1].state : (!src.healthDate || onOrBefore(src.healthDate, asOf) ? src.health : 'unknown');
  const observed = h.length ? h[h.length - 1].date : src.healthDate || null;
  let stale = false;
  const cad = Number(src.cadenceHours);
  if (src.lastSeen && cad > 0 && onOrBefore(src.lastSeen, asOf)) {
    const end = new Date(asOf + 'T23:59:59Z').getTime(), last = new Date(src.lastSeen.length <= 10 ? src.lastSeen + 'T00:00:00Z' : src.lastSeen).getTime();
    if (Number.isFinite(last) && (end - last) / 3.6e6 > 3 * cad) { stale = true; state = 'silent'; }
  }
  return { state: HEALTH.some(x => x[0] === state) ? state : 'unknown', stale, observed };
}

/* ---------------- rules ---------------- */
/** A rule's status on a date, from its recorded transitions. */
export function statusAt(rule, asOf = today()) {
  const h = (rule.history || []).filter(e => e.to).slice().sort((a, b) => (day(a.date) < day(b.date) ? -1 : 1));
  if (!h.length) return rule.status || 'draft';
  let st = h[0].from || 'draft';
  for (const e of h) if (onOrBefore(e.date, asOf)) st = e.to;
  return st;
}
export const ruleExistsAt = (rule, asOf) => !rule.created || onOrBefore(rule.created, asOf);
/** Tests that apply to the rule's current version (a test of another version does not validate it). */
export const testsOf = (rule, ws = S.ws, asOf = null) => reg(ws).tests
  .filter(t => t.ruleId === rule.id && (!t.ruleVersion || !rule.version || String(t.ruleVersion) === String(rule.version)) && (!asOf || onOrBefore(t.date, asOf)))
  .sort((a, b) => (day(a.date) < day(b.date) ? 1 : day(a.date) > day(b.date) ? -1 : 0));
export const latestTest = (rule, ws = S.ws, asOf = today()) => testsOf(rule, ws, asOf)[0] || null;

/**
 * Lifecycle check for a status change made in the application (the external SIEM stays the system of
 * record for imported states). Returns an error message or null.
 */
export function transitionError(prev, next, ws = S.ws) {
  const from = prev?.status || 'draft', to = next.status;
  if (to === 'production' && from !== 'production') {
    if (from === 'draft' || from === 'retired') return 'A draft rule cannot be deployed: move it to testing and test it first.';
    if (!testsOf(next, ws).some(t => t.result === 'effective')) return 'A rule goes to production only after an effective detection test of this version.';
    if (!String(next.approvedBy || '').trim()) return 'Deployment to production needs the name of the person who approved it.';
    if (next.owner && lc(next.owner) === lc(next.approvedBy)) return 'The owner of a rule cannot approve its deployment: approval must be independent.';
  }
  if (from === 'retired' && to !== 'retired') return 'A retired rule stays retired: create a new version instead.';
  return null;
}
/** Record a status change (CRGO: has detection status, dated). */
export function setStatus(rule, to, by = '', date = today(), ws = S.ws) {
  const from = rule.status || 'draft';
  if (from === to) return false;
  (rule.history ||= []).push({ date, from, to, by });
  rule.status = to; rule.updated = date;
  LOG.data('detection rule status changed', rule.id, `${from} → ${to}${by ? ' · ' + by : ''}`, ws.name);
  return true;
}

/** Telemetry sources a rule requires, with their health at a date. */
export function requiredHealth(rule, ws = S.ws, asOf = today()) {
  const R = reg(ws);
  return (rule.requiredSources || []).map(id => { const src = R.sources.find(s => s.id === id); return { id, src, ...healthAt(src, asOf) }; });
}

/**
 * Coverage one rule gives on a date, with reasons:
 *   missing   — the rule did not exist, or is draft, disabled or retired at that date;
 *   degraded  — in testing, required telemetry silent, degraded or unregistered, or the latest test ineffective;
 *   untested  — in production with no effective test on or before the date;
 *   validated — in production, latest test on or before the date effective, telemetry not silent or degraded.
 */
export function ruleCoverage(rule, ws = S.ws, asOf = today()) {
  const why = [];
  if (!ruleExistsAt(rule, asOf)) return { status: 'missing', why: ['rule not created yet at that date'], test: null, detects: false };
  const st = statusAt(rule, asOf);
  const test = latestTest(rule, ws, asOf);
  if (!['production', 'testing'].includes(st)) return { status: 'missing', why: [{ draft: 'rule in draft', disabled: 'rule disabled', retired: 'rule retired' }[st] || 'rule not active'], test, detects: false };
  const tel = requiredHealth(rule, ws, asOf);
  const silent = tel.filter(t => t.state === 'silent'), weak = tel.filter(t => t.state === 'degraded');
  let status;
  if (silent.length) { status = 'degraded'; why.push('required telemetry silent: ' + silent.map(t => t.id).join(', ')); }
  else if (weak.length) { status = 'degraded'; why.push('required telemetry degraded: ' + weak.map(t => t.id).join(', ')); }
  else if (st === 'testing') { status = 'degraded'; why.push('rule in testing, not in production'); }
  else if (test && test.result === 'ineffective') { status = 'degraded'; why.push('latest detection test ineffective'); }
  else if (test && test.result === 'effective') status = 'validated';
  else { status = 'untested'; why.push('no effective detection test on or before the as-of date'); }
  if (!tel.length) why.push('no required telemetry declared');
  return { status, why, test, detects: !silent.length, telemetry: tel };
}
const best = list => list.reduce((b, s) => (COVERAGE_RANK[s] > COVERAGE_RANK[b] ? s : b), 'missing');

/**
 * The coverage matrix at a date: one row per (scenario, technique) pair drawn from the scenarios'
 * ATT&CK techniques, the rules' links and the recorded coverage assertions.
 */
export function coverageMatrix(ws = S.ws, asOf = today()) {
  const R = reg(ws), pairs = new Map();
  const put = (scenario, technique) => { const k = `${scenario || ''}|${technique || ''}`; if (!pairs.has(k)) pairs.set(k, { scenario: scenario || '', technique: technique || '', rules: new Set(), assertions: [] }); return pairs.get(k); };
  for (const s of ws.assessment?.SCEN || []) for (const t of techniques(s.attack)) put(s.id, t);
  for (const r of R.rules) {
    const sc = r.scenarios || [], te = r.techniques || [];
    if (sc.length) for (const s of sc) { if (te.length) te.forEach(t => put(s, t).rules.add(r.id)); else put(s, '').rules.add(r.id); }
    else te.forEach(t => put('', t).rules.add(r.id));
  }
  // technique-only rules also cover every scenario that uses the technique
  for (const p of pairs.values()) if (p.technique && p.scenario) for (const r of R.rules) if (!(r.scenarios || []).length && (r.techniques || []).includes(p.technique)) p.rules.add(r.id);
  for (const c of R.coverage) { const p = put(c.scenario, c.technique); (c.rules || []).forEach(id => p.rules.add(id)); p.assertions.push(c); }
  return [...pairs.values()].map(p => {
    const rules = [...p.rules].map(id => R.rules.find(r => r.id === id)).filter(Boolean).map(r => ({ rule: r, ...ruleCoverage(r, ws, asOf) }));
    const status = best(rules.map(x => x.status));
    const gap = R.gaps.find(g => g.status !== 'closed' && (g.scenario || '') === p.scenario && (g.technique || '') === p.technique) || null;
    return { scenario: p.scenario, technique: p.technique, rules, status, gap, assertions: p.assertions };
  }).sort((a, b) => COVERAGE_RANK[a.status] - COVERAGE_RANK[b.status] || (a.scenario + a.technique < b.scenario + b.technique ? -1 : 1));
}
export function coverageCounts(rows) { const c = { validated: 0, untested: 0, degraded: 0, missing: 0 }; for (const r of rows) c[r.status]++; return c; }

/* ---------------- alerts ---------------- */
/** The asset an alert names, matched by asset id or name. */
export function assetOf(ref, ws = S.ws) { const k = lc(ref); if (!k) return null; return (ws.assets || []).find(a => lc(a.id) === k || lc(a.name) === k) || null; }
/** A crown jewel: listed in the organization's crown jewels (by id or name) or matching an asset that is. */
export function isCrownJewel(ref, ws = S.ws) {
  const k = lc(ref); if (!k) return false;
  const a = assetOf(ref, ws), names = [k, lc(a?.name), lc(a?.id)].filter(Boolean);
  if (a && (a.crown || a.crownJewel)) return true;
  return (ws.assessment?.CROWN || []).some(r => { const id = lc(r[0]), n = lc(r[1]); return names.some(x => x === id || (n && x.length > 2 && (n === x || n.includes(x) || x.includes(n)))); });
}
/** Triage priority: crown jewels first, then severity weighted by asset criticality (0–100). */
export function triageWeight(a, ws = S.ws) {
  const crown = isCrownJewel(a.asset, ws), asset = assetOf(a.asset, ws);
  const crit = asset ? criticality(asset, ws).score : null;
  const score = Math.round((SEV_W[a.severity] ?? 2) * 20 * (0.5 + (crit ?? (crown ? 100 : 30)) / 100) + (crown ? 25 : 0));
  return { crown, crit, score };
}
export function triageQueue(ws = S.ws) {
  return reg(ws).alerts.map(a => ({ a, ...triageWeight(a, ws) }))
    .sort((x, y) => (y.crown - x.crown) || (y.score - x.score) || (String(y.a.detected) > String(x.a.detected) ? 1 : -1));
}
export const openAlert = a => ['new', 'in-triage'].includes(a.triage || 'new');
export const dedupKey = a => `${lc(a.sourceSystem)}|${lc(a.externalId || a.id)}|${String(a.version ?? 1)}`;

/**
 * Escalate an alert: create (or reuse — the alert id is the idempotency key) a SOAR case in
 * ws.soar.cases. The case is not an incident: only an incident confirmation, in SOAR, makes one.
 */
export function escalate(alert, ws = S.ws, by = '') {
  const cases = ((ws.soar ||= {}).cases ||= []);
  let c = cases.find(x => x.id === alert.caseId) || cases.find(x => x.source?.kind === 'alert' && x.source?.id === alert.id);
  const reused = !!c;
  if (!c) {
    c = { id: nextId(cases, 'CASE'), title: alert.title || `Alert ${alert.id}`, source: { kind: 'alert', id: alert.id }, opened: today(), status: 'open', severity: alert.severity || 'medium', alerts: [alert.id], timeline: [] };
    cases.push(c);
  } else if (!(c.alerts ||= []).includes(alert.id)) c.alerts.push(alert.id);
  alert.caseId = c.id;
  if (alert.triage !== 'escalated') (alert.notes ||= []).push({ date: today(), by, text: `Escalated to SOAR case ${c.id}` });
  alert.triage = 'escalated';
  if (!reused) LOG.data('alert escalated to a SOAR case', alert.id, c.id, ws.name);
  touch();
  return { case: c, reused };
}

/* ---------------- indicators ---------------- */
export const indicatorStale = (i, asOf = today()) => !!(i.revoked || (i.validUntil && day(i.validUntil) < asOf));
/** Source confidence as stated (0–100) — never a probability. */
export function normConfidence(v) { if (v === null || v === undefined || v === '') return null; const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : null; }
/** Indicator type and value from a simple STIX pattern "[domain-name:value = 'x']". */
export function patternValue(p) {
  const m = /\[\s*([\w-]+):([\w.'"\- ]+?)\s*=\s*'((?:[^'\\]|\\.)*)'/.exec(String(p || ''));
  if (!m) return { type: '', value: '' };
  const prop = m[2].replace(/['"\s]/g, '');
  return { type: m[1] === 'file' ? 'file:' + (prop.match(/hashes\.(.+)/)?.[1] || prop).toLowerCase().replace(/-/g, '') : m[1], value: m[3].replace(/\\'/g, "'") };
}
export function patternOf(type, value) {
  if (!type || !value) return '';
  const t = String(type).toLowerCase();
  if (t.startsWith('file:')) return `[file:hashes.'${t.slice(5).toUpperCase().replace('SHA256', 'SHA-256').replace('SHA1', 'SHA-1')}' = '${value}']`;
  return `[${t}:value = '${String(value).replace(/'/g, "\\'")}']`;
}
const guessType = v => /^[a-f0-9]{64}$/i.test(v) ? 'file:sha256' : /^[a-f0-9]{40}$/i.test(v) ? 'file:sha1' : /^[a-f0-9]{32}$/i.test(v) ? 'file:md5' : /^https?:\/\//i.test(v) ? 'url'
  : /^\d+\.\d+\.\d+\.\d+$/.test(v) ? 'ipv4-addr' : v.includes(':') && /^[0-9a-f:]+$/i.test(v) ? 'ipv6-addr' : v.includes('@') ? 'email-addr' : 'domain-name';

/* ---------------- TLP-aware CSV ---------------- */
/** mode 'exclude': TLP:RED and TLP:AMBER+STRICT rows left out; mode 'mark': kept, every row carries its TLP. */
export function tlpFilter(rows, mode = 'exclude', tlpOf = r => r.tlp) {
  const kept = rows.filter(r => mode === 'mark' || !TLP_RESTRICTED.has(normTlp(tlpOf(r)) || 'AMBER'));
  return { kept, excluded: rows.length - kept.length, restricted: kept.filter(r => TLP_RESTRICTED.has(normTlp(tlpOf(r)) || 'AMBER')).length };
}
export function tlpCsv(header, rows, mode, project, tlpOf = r => r.tlp) {
  const f = tlpFilter(rows, mode, tlpOf);
  return { csv: toCSV([['tlp', ...header], ...f.kept.map(r => [tlpLabel(tlpOf(r)), ...project(r)])]), ...f };
}

/* ---------------- Sigma (YAML subset) ---------------- */
function scalar(s) {
  s = s.trim();
  if (s === '' || s === '~' || s === 'null') return null;
  if ((s[0] === '"' && s.endsWith('"')) || (s[0] === "'" && s.endsWith("'"))) return s[0] === '"' ? s.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n') : s.slice(1, -1).replace(/''/g, "'");
  if (s[0] === '[' && s.endsWith(']')) return splitFlow(s.slice(1, -1)).map(scalar);
  if (s === 'true') return true; if (s === 'false') return false;
  return s;
}
function splitFlow(s) { const out = []; let cur = '', q = ''; for (const c of s) { if (q) { if (c === q) q = ''; cur += c; } else if (c === '"' || c === "'") { q = c; cur += c; } else if (c === ',') { out.push(cur); cur = ''; } else cur += c; } if (cur.trim()) out.push(cur); return out; }
function stripComment(line) { let q = ''; for (let i = 0; i < line.length; i++) { const c = line[i]; if (q) { if (c === q) q = ''; } else if (c === '"' || c === "'") q = c; else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i); } return line; }
/** A small YAML reader: block mappings and sequences, scalars, flow lists, block scalars (| and >). Enough for Sigma. */
export function parseYaml(text) {
  const lines = String(text).replace(/\r/g, '').split('\n').map(raw => ({ raw, s: stripComment(raw) })).map(l => ({ ...l, ind: l.s.search(/\S/), t: l.s.trim() }));
  let i = 0;
  const skip = () => { while (i < lines.length && (lines[i].ind < 0 || !lines[i].t)) i++; };
  const block = (ind, folded) => { const out = []; let base = -1; while (i < lines.length) { const l = lines[i]; if (l.raw.trim() && l.raw.search(/\S/) <= ind) break; if (l.raw.trim() && base < 0) base = l.raw.search(/\S/); out.push(base >= 0 ? l.raw.slice(base) : ''); i++; } while (out.length && !out[out.length - 1]) out.pop(); return folded ? out.join(' ').replace(/\s+/g, ' ').trim() : out.join('\n'); };
  const value = (rest, ind) => { if (rest === '|' || rest === '|-' || rest === '>' || rest === '>-') return block(ind, rest[0] === '>'); if (rest !== '') return scalar(rest); skip(); if (i < lines.length && lines[i].ind > ind) return node(lines[i].ind); if (i < lines.length && lines[i].ind === ind && lines[i].t.startsWith('- ')) return node(ind); return null; };
  const node = ind => {
    skip(); if (i >= lines.length) return null;
    if (lines[i].t.startsWith('- ') || lines[i].t === '-') {
      const out = [];
      while (i < lines.length) { skip(); if (i >= lines.length || lines[i].ind !== ind || !(lines[i].t.startsWith('- ') || lines[i].t === '-')) break;
        const rest = lines[i].t.slice(1).trim();
        if (/^[\w.$-]+\s*:(\s|$)/.test(rest) && !/^['"]/.test(rest)) { const off = lines[i].s.indexOf(rest); lines[i] = { ...lines[i], s: ' '.repeat(off) + rest, t: rest, ind: off }; out.push(node(off)); }
        else { i++; out.push(rest ? scalar(rest) : value('', ind)); } }
      return out;
    }
    const out = {};
    while (i < lines.length) { skip(); if (i >= lines.length || lines[i].ind !== ind) break;
      const m = /^("[^"]*"|'[^']*'|[^:]+?)\s*:(?:\s+(.*)|$)/.exec(lines[i].t); if (!m) { i++; continue; }
      const k = scalar(m[1]); i++; out[k] = value((m[2] || '').trim(), ind); }
    return out;
  };
  return node(Math.max(0, (skip(), lines[i]?.ind ?? 0)));
}
/** The raw text of a top-level key's block (kept verbatim, e.g. the Sigma detection). */
function rawBlock(text, key) {
  const lines = String(text).replace(/\r/g, '').split('\n'); const at = lines.findIndex(l => new RegExp('^' + key + '\\s*:').test(l));
  if (at < 0) return '';
  const out = []; for (let j = at + 1; j < lines.length; j++) { if (/^\S/.test(lines[j])) break; out.push(lines[j]); }
  while (out.length && !out[out.length - 1].trim()) out.pop();
  const ind = Math.min(...out.filter(l => l.trim()).map(l => l.search(/\S/)));
  return out.map(l => l.slice(Number.isFinite(ind) ? ind : 0)).join('\n');
}
const SIGMA_STATUS = { experimental: 'draft', test: 'testing', stable: 'testing', deprecated: 'retired', unsupported: 'retired' };
/** One or more Sigma rules (documents separated by ---) → rule drafts (not stored). */
export function parseSigma(text) {
  const docs = String(text).replace(/\r/g, '').split(/^---\s*$/m).filter(d => d.trim());
  const out = [], errors = [];
  for (const d of docs) {
    let y; try { y = parseYaml(d); } catch (e) { errors.push(String(e.message || e)); continue; }
    if (!y || typeof y !== 'object' || Array.isArray(y) || !y.title) { if (y && (y.action || y.logsource)) errors.push('document without a title skipped'); else if (d.trim()) errors.push('not a Sigma rule (no title)'); continue; }
    const tags = (Array.isArray(y.tags) ? y.tags : y.tags ? [y.tags] : []).map(String);
    const ls = y.logsource && typeof y.logsource === 'object' ? y.logsource : {};
    out.push({
      title: String(y.title), ruleId: y.id ? String(y.id) : '', language: 'sigma', sigmaStatus: y.status ? String(y.status) : '', status: SIGMA_STATUS[lc(y.status)] || 'draft',
      level: LEVELS.some(l => l[0] === lc(y.level)) ? lc(y.level) : '', description: y.description ? String(y.description) : '',
      author: y.author ? String(y.author) : '', date: y.date ? String(y.date) : '', modified: y.modified ? String(y.modified) : '',
      logsource: { product: ls.product ? String(ls.product) : '', service: ls.service ? String(ls.service) : '', category: ls.category ? String(ls.category) : '' },
      techniques: [...new Set(tags.map(t => /^attack\.(t\d{4}(?:\.\d{3})?)$/i.exec(t.trim())?.[1]?.toUpperCase()).filter(Boolean))],
      tags, references: (Array.isArray(y.references) ? y.references : []).map(String), falsepositives: (Array.isArray(y.falsepositives) ? y.falsepositives : y.falsepositives ? [y.falsepositives] : []).map(String),
      detection: rawBlock(d, 'detection'),
    });
  }
  return { rules: out, errors };
}
/** Telemetry sources whose log source (product, service, category) matches a rule's: every key both declare must agree. */
export function matchSources(logsource, ws = S.ws) {
  const keys = ['product', 'service', 'category'].filter(k => logsource?.[k]);
  if (!keys.length) return [];
  return reg(ws).sources.filter(s => { const shared = keys.filter(k => s.logsource?.[k]); return shared.length && shared.every(k => lc(s.logsource[k]) === lc(logsource[k])); }).map(s => s.id);
}

/* ---------------- STIX 2.1 bundle ---------------- */
function stixTlp(o, markings, fallback) {
  for (const ref of o.object_marking_refs || []) { if (TLP_STIX[ref]) return TLP_STIX[ref]; const m = markings[ref]; if (m) { const t = normTlp(m.name) || normTlp(m.definition?.tlp) || normTlp(m.extensions && Object.values(m.extensions)[0]?.tlp_2_0) || normTlp(m.extensions && Object.values(m.extensions)[0]?.tlp); if (t) return t; } }
  return fallback;
}
/** A STIX 2.1 bundle → { indicators, sightings } drafts. Other objects are counted and ignored. */
export function parseStix(json, defaultTlp = 'AMBER') {
  const b = typeof json === 'string' ? JSON.parse(json) : json;
  if (!b || b.type !== 'bundle' || !Array.isArray(b.objects)) throw new Error('Not a STIX 2.1 bundle (type "bundle" with an "objects" list expected).');
  const markings = {}; for (const o of b.objects) if (o.type === 'marking-definition') markings[o.id] = o;
  const ids = {}; for (const o of b.objects) if (o.type === 'identity') ids[o.id] = o.name;
  const indicators = [], sightings = []; let ignored = 0;
  for (const o of b.objects) {
    if (o.type === 'indicator') {
      const pv = patternValue(o.pattern);
      indicators.push({ stixId: o.id, name: o.name || '', description: o.description || '', pattern: o.pattern || '', patternType: o.pattern_type || 'stix', type: pv.type, value: pv.value,
        validFrom: o.valid_from || '', validUntil: o.valid_until || '', confidence: normConfidence(o.confidence), confidenceMethod: o.confidence !== undefined ? 'STIX 2.1 confidence (0–100) as stated by the producer' : '',
        source: ids[o.created_by_ref] || o.created_by_ref || 'STIX bundle', tlp: stixTlp(o, markings, defaultTlp), labels: o.labels || o.indicator_types || [], revoked: !!o.revoked,
        techniques: techniques((o.kill_chain_phases || []).map(k => k.phase_name).concat(o.external_references?.map(r => r.external_id) || [])) });
    } else if (o.type === 'sighting') {
      sightings.push({ stixId: o.id, of: o.sighting_of_ref, first: o.first_seen || o.created || '', last: o.last_seen || o.first_seen || o.created || '', count: o.count ?? 1,
        where: (o.where_sighted_refs || []).map(r => ids[r] || r).join(', '), tlp: stixTlp(o, markings, defaultTlp), description: o.description || '', confidence: normConfidence(o.confidence) });
    } else if (o.type !== 'marking-definition' && o.type !== 'identity') ignored++;
  }
  return { indicators, sightings, ignored };
}

/* ---------------- record normalisation (envelope, CSV, STIX) ---------------- */
const pick = (o, ...ks) => { for (const k of ks) if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]; return undefined; };
export function normSource(o) {
  const ls = o.logsource || {};
  const health = lc(pick(o, 'health', 'state')) || 'unknown';
  return { id: String(pick(o, 'id') || ''), name: String(pick(o, 'name', 'title') || pick(o, 'id') || ''), system: String(pick(o, 'system', 'sourceSystem', 'source_system') || ''),
    asset: String(pick(o, 'asset', 'assetRef', 'asset_ref') || ''), sourceType: String(pick(o, 'sourceType', 'source_type', 'type') || ''),
    ocsfClass: normOcsf(pick(o, 'ocsfClass', 'ocsf_class', 'ocsf')), dataComponents: dataComponents(pick(o, 'dataComponents', 'data_components') || []),
    parser: String(pick(o, 'parser') || ''), parserVersion: String(pick(o, 'parserVersion', 'parser_version') ?? ''),
    logsource: { product: String(pick(ls, 'product') ?? pick(o, 'product') ?? ''), service: String(pick(ls, 'service') ?? pick(o, 'service') ?? ''), category: String(pick(ls, 'category') ?? pick(o, 'category') ?? '') },
    cadenceHours: pick(o, 'cadenceHours', 'cadence_hours', 'expectedCadenceHours') !== undefined ? Number(pick(o, 'cadenceHours', 'cadence_hours', 'expectedCadenceHours')) : null,
    lastSeen: String(pick(o, 'lastSeen', 'last_seen') || ''), health: HEALTH.some(h => h[0] === health) ? health : 'unknown',
    healthDate: String(pick(o, 'healthDate', 'health_date', 'observed') || ''), healthHistory: Array.isArray(o.healthHistory) ? o.healthHistory.filter(e => e && e.date && HEALTH.some(h => h[0] === e.state)).map(e => ({ date: String(e.date), state: e.state, note: e.note || '' })) : [],
    notes: String(pick(o, 'notes', 'description') || '') };
}
export function normRule(o) {
  const status = lc(pick(o, 'status')) || 'draft', ls = o.logsource || {};
  return { id: String(pick(o, 'id') || ''), title: String(pick(o, 'title', 'name') || ''), version: String(pick(o, 'version') ?? '1'), language: lc(pick(o, 'language')) || 'sigma',
    ruleId: String(pick(o, 'ruleId', 'rule_id', 'sigmaId', 'externalId') || ''), status: RULE_STATUS.some(s => s[0] === status) ? status : 'draft', level: lc(pick(o, 'level')) || '',
    description: String(pick(o, 'description') || ''), owner: String(pick(o, 'owner') || ''), author: String(pick(o, 'author') || ''),
    logsource: { product: String(ls.product || ''), service: String(ls.service || ''), category: String(ls.category || '') },
    techniques: techniques(pick(o, 'techniques') || []), scenarios: arr(pick(o, 'scenarios') || []), requiredSources: arr(pick(o, 'requiredSources', 'required_sources') || []),
    strategy: String(pick(o, 'strategy', 'detectionStrategy') || ''), detection: String(pick(o, 'detection', 'query') || ''),
    approvedBy: String(pick(o, 'approvedBy') || ''), approvedOn: String(pick(o, 'approvedOn') || ''), created: String(pick(o, 'created') || ''),
    history: Array.isArray(o.history) ? o.history.filter(h => h && h.date && h.to).map(h => ({ date: String(h.date), from: h.from || '', to: h.to, by: h.by || '' })) : [] };
}
export function normTest(o) {
  const result = lc(pick(o, 'result'));
  return { id: String(pick(o, 'id') || ''), ruleId: String(pick(o, 'ruleId', 'rule_id', 'rule') || ''), ruleVersion: String(pick(o, 'ruleVersion', 'rule_version') ?? ''),
    date: String(pick(o, 'date') || '').slice(0, 10), tester: String(pick(o, 'tester', 'by') || ''), result: result === 'effective' || result === 'ineffective' ? result : '',
    method: lc(pick(o, 'method')) || 'other', fixture: String(pick(o, 'fixture', 'fixtureId') || ''), evidence: String(pick(o, 'evidence') || ''), notes: String(pick(o, 'notes') || '') };
}
export function normAlert(o, defaultTlp = 'AMBER') {
  const sev = lc(pick(o, 'severity', 'level')), tri = lc(pick(o, 'triage', 'disposition')) || 'new';
  const ev = Array.isArray(o.events) ? o.events : [];
  return { id: String(pick(o, 'id') || ''), externalId: String(pick(o, 'externalId', 'external_id') || ''), version: Number(pick(o, 'version') ?? 1) || 1,
    sourceSystem: String(pick(o, 'sourceSystem', 'source_system', 'source') || ''), title: String(pick(o, 'title', 'name') || ''),
    ruleId: String(pick(o, 'ruleId', 'rule_id', 'rule') || ''), ruleVersion: String(pick(o, 'ruleVersion', 'rule_version') ?? ''),
    detected: String(pick(o, 'detected', 'detected_at', 'detectedAt', 'time') || ''), firstSeen: String(pick(o, 'firstSeen', 'first_seen') || ''),
    severity: SEVERITY.some(s => s[0] === sev) ? sev : sev === 'informational' ? 'low' : 'medium', confidence: normConfidence(pick(o, 'confidence')),
    asset: String(pick(o, 'asset', 'assetRef', 'asset_ref') || ''), techniques: techniques(pick(o, 'techniques') || []), scenarios: arr(pick(o, 'scenarios') || []),
    indicators: arr(pick(o, 'indicators') || []), ocsfClass: normOcsf(pick(o, 'ocsfClass', 'ocsf_class')) || 2004,
    events: ev.map(e => ({ ref: String(e.ref || e.externalRef || e.id || ''), sourceId: String(e.sourceId || e.source || ''), sourceTime: String(e.sourceTime || e.time || ''), hash: String(e.hash || ''), ocsfClass: normOcsf(e.ocsfClass) })).filter(e => e.ref),
    rawRef: String(pick(o, 'rawRef', 'raw_ref', 'link') || ''), tlp: normTlp(pick(o, 'tlp')) || defaultTlp,
    triage: TRIAGE.some(t => t[0] === tri) && tri !== 'escalated' ? tri : 'new', assignee: String(pick(o, 'assignee') || '') };
}
export function normIndicator(o, defaultTlp = 'AMBER') {
  let type = lc(pick(o, 'type')), value = String(pick(o, 'value') || ''), pattern = String(pick(o, 'pattern') || '');
  if (!value && pattern) ({ type, value } = { ...patternValue(pattern), type: type || patternValue(pattern).type });
  if (value && !type) type = guessType(value);
  if (!pattern && value) pattern = patternOf(type, value);
  return { id: String(pick(o, 'id') || ''), stixId: String(pick(o, 'stixId', 'stix_id') || ''), type, value, pattern, patternType: String(pick(o, 'patternType', 'pattern_type') || 'stix'),
    name: String(pick(o, 'name', 'title') || ''), validFrom: String(pick(o, 'validFrom', 'valid_from') || ''), validUntil: String(pick(o, 'validUntil', 'valid_until') || ''),
    confidence: normConfidence(pick(o, 'confidence')), confidenceMethod: String(pick(o, 'confidenceMethod', 'confidence_method') || (pick(o, 'confidence') !== undefined ? 'Source confidence (0–100) as stated' : '')),
    source: String(pick(o, 'source', 'feed') || ''), tlp: normTlp(pick(o, 'tlp')) || defaultTlp, labels: arr(pick(o, 'labels') || []),
    techniques: techniques(pick(o, 'techniques') || []), revoked: !!pick(o, 'revoked'), sightings: Array.isArray(o.sightings) ? o.sightings : [] };
}

/* ---------------- import ---------------- */
export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
/** What a file is: envelope, stix, sigma, or a CSV of sources / alerts / indicators. */
export function detectKind(text, fileName = '') {
  const t = String(text).trim(), f = lc(fileName);
  if (t.startsWith('{')) { try { const j = JSON.parse(t); const fmt = j.format ?? j.schema; if (fmt === IMPORT_SCHEMA) return 'envelope'; if (fmt) return 'unknown'; if (j.type === 'bundle') return 'stix'; if (Array.isArray(j.alerts) || Array.isArray(j)) return 'alerts-json'; } catch { return 'unknown'; } }
  if (t.startsWith('[')) return 'alerts-json';
  if (/\.(ya?ml)$/.test(f) || /^title\s*:/m.test(t) && /^detection\s*:/m.test(t)) return 'sigma';
  const head = lc(t.split('\n')[0]);
  if (/\bexpected|cadence|health|ocsf/.test(head) && !/severity/.test(head)) return 'sources-csv';
  if (/severity|detected|rule_id/.test(head)) return 'alerts-csv';
  if (/\bvalue\b|pattern|valid_until/.test(head)) return 'indicators-csv';
  return 'unknown';
}
export const KINDS = [['auto', 'Detect from the file'], ['envelope', 'crg-siem-import/1 envelope (JSON)'], ['sigma', 'Sigma rules (YAML)'], ['stix', 'STIX 2.1 bundle (indicators, sightings)'],
  ['alerts-json', 'Alerts (JSON list)'], ['alerts-csv', 'Alerts (CSV)'], ['sources-csv', 'Telemetry sources (CSV)'], ['indicators-csv', 'Indicators (CSV)']];
function csvObjects(text) {
  const rows = parseCSV(text); if (!rows.length) return [];
  const head = rows[0].map(h => lc(h).replace(/\s+/g, '_'));
  return rows.slice(1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

/**
 * Import one file's text into the workspace. Records are added, never silently overwritten:
 *   sources    — same id: a new health observation is appended (telemetry health observation) and
 *                lastSeen updated; other fields are kept;
 *   rules      — same id (or Sigma id) and version: duplicate; another version: the previous one is
 *                kept in versions[] and the rule takes the new version;
 *   tests, indicators, gaps, coverage, strategies, events — same id (or STIX id): duplicate, skipped;
 *   alerts     — same source system + external id + version: duplicate, skipped (the original stays).
 * Returns the import record pushed into ws.siem.imports.
 */
export async function importText(text, { fileName = 'pasted text', kind = 'auto', defaultTlp = 'AMBER', ws = S.ws, by = '' } = {}) {
  const R = reg(ws);
  const k = kind === 'auto' ? detectKind(text, fileName) : kind;
  const c = { sources: 0, rules: 0, tests: 0, alerts: 0, indicators: 0, sightings: 0, gaps: 0, coverage: 0, strategies: 0, events: 0, duplicates: 0, updated: 0, skipped: 0 };
  const errors = [];
  defaultTlp = normTlp(defaultTlp) || 'AMBER';
  let env = { sources: [], rules: [], tests: [], alerts: [], indicators: [], gaps: [], coverage: [], strategies: [], events: [] }, sightings = [];
  try {
    if (k === 'envelope') {
      const j = JSON.parse(text);
      const fmt = j.format ?? j.schema;
      if (fmt !== IMPORT_SCHEMA) throw new Error(`Unknown format "${fmt}" — expected ${IMPORT_SCHEMA}.`);
      defaultTlp = normTlp(j.tlp) || defaultTlp;
      for (const key of Object.keys(env)) if (j[key] !== undefined) { if (!Array.isArray(j[key])) throw new Error(`"${key}" must be a list.`); env[key] = j[key]; }
    } else if (k === 'sigma') {
      const p = parseSigma(text); errors.push(...p.errors); env.rules = p.rules.map(r => ({ ...r, _sigma: true }));
    } else if (k === 'stix') {
      const p = parseStix(text, defaultTlp); env.indicators = p.indicators.map(i => ({ ...i, _stix: true })); sightings = p.sightings; c.skipped += p.ignored;
    } else if (k === 'alerts-json') { const j = JSON.parse(text); env.alerts = Array.isArray(j) ? j : j.alerts; }
    else if (k === 'alerts-csv') env.alerts = csvObjects(text).map(o => ({ ...o, techniques: o.techniques || o.technique, indicators: o.indicators }));
    else if (k === 'sources-csv') env.sources = csvObjects(text);
    else if (k === 'indicators-csv') env.indicators = csvObjects(text);
    else throw new Error('The file was not recognised: choose its kind.');
  } catch (e) { errors.push(String(e.message || e)); }

  const now = today();
  // sources
  for (const raw of env.sources) {
    const s = normSource(raw); if (!s.id) s.id = nextId(R.sources, 'TS');
    const old = R.sources.find(x => x.id === s.id);
    if (old) {
      if (s.lastSeen && s.lastSeen > (old.lastSeen || '')) old.lastSeen = s.lastSeen;
      const obs = s.healthHistory.length ? s.healthHistory : (raw.health ? [{ date: s.healthDate || now, state: s.health, note: 'imported from ' + fileName }] : []);
      let added = 0; for (const e of obs) if (!(old.healthHistory ||= []).some(x => x.date === e.date && x.state === e.state)) { old.healthHistory.push(e); added++; }
      if (added) { const last = old.healthHistory.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).pop(); old.health = last.state; old.healthDate = last.date; c.updated++; } else c.duplicates++;
      continue;
    }
    if (!s.healthHistory.length && raw.health !== undefined && raw.health !== '') s.healthHistory.push({ date: s.healthDate || now, state: s.health, note: 'imported from ' + fileName });
    s.imported = now; R.sources.push(s); c.sources++;
  }
  // strategies (ATT&CK detection strategies adapted by the organisation)
  for (const o of env.strategies) {
    const st = { id: String(o.id || nextId(R.strategies, 'DS')), name: String(o.name || o.title || ''), reference: detStrategies(o.reference || o.det || '')[0] || '', analytics: analytics(o.analytics || []), dataComponents: dataComponents(o.dataComponents || []), techniques: techniques(o.techniques || []) };
    if (R.strategies.some(x => x.id === st.id)) { c.duplicates++; continue; } R.strategies.push(st); c.strategies++;
  }
  // rules
  for (const raw of env.rules) {
    const r = raw._sigma ? { ...raw, version: '1', owner: '', scenarios: [], requiredSources: [], strategy: '', history: [] } : normRule(raw);
    delete r._sigma;
    if (!r.title) { errors.push('rule without a title skipped'); c.skipped++; continue; }
    const old = R.rules.find(x => (r.id && x.id === r.id) || (r.ruleId && x.ruleId === r.ruleId));
    if (old) {
      const same = raw._sigma !== undefined ? old.detection === r.detection && old.title === r.title : String(old.version) === String(r.version);
      if (same) { c.duplicates++; continue; }
      (old.versions ||= []).push({ version: old.version, status: old.status, detection: old.detection, title: old.title, until: now });
      const ver = raw._sigma !== undefined ? String((Number(old.version) || 1) + 1) : r.version;
      Object.assign(old, { title: r.title, description: r.description || old.description, detection: r.detection, level: r.level || old.level, logsource: r.logsource, techniques: r.techniques.length ? r.techniques : old.techniques, version: ver, updated: now, sigmaStatus: r.sigmaStatus ?? old.sigmaStatus });
      if (!raw._sigma && r.status !== old.status) setStatus(old, r.status, 'import', now, ws);
      c.updated++; continue;
    }
    if (!r.id) r.id = nextId(R.rules, 'DR');
    if (!r.requiredSources.length) { r.requiredSources = matchSources(r.logsource, ws); r.requiredAuto = !!r.requiredSources.length; }
    r.created ||= now; r.imported = now; r.source = fileName;
    R.rules.push(r); c.rules++;
  }
  // tests
  for (const o of env.tests) {
    const t = normTest(o);
    if (!t.ruleId || !t.date || !t.result) { errors.push(`test ${t.id || '?'} needs ruleId, date and result (effective or ineffective)`); c.skipped++; continue; }
    if (!t.id) t.id = nextId(R.tests, 'DT');
    if (R.tests.some(x => x.id === t.id)) { c.duplicates++; continue; }
    R.tests.push(t); c.tests++;
  }
  // indicators
  for (const o of env.indicators) {
    const ind = o._stix ? { ...o } : normIndicator(o, defaultTlp); delete ind._stix;
    ind.sightings ||= [];
    if (!ind.value && !ind.pattern) { errors.push('indicator without a value or pattern skipped'); c.skipped++; continue; }
    if (R.indicators.some(x => (ind.id && x.id === ind.id) || (ind.stixId && x.stixId === ind.stixId))) { c.duplicates++; continue; }
    if (!ind.id) ind.id = nextId(R.indicators, 'IND');
    ind.imported = now; R.indicators.push(ind); c.indicators++;
  }
  // STIX sightings: attached to their indicator, and each becomes an alert to triage (never an incident)
  for (const s of sightings) {
    const ind = R.indicators.find(i => i.stixId === s.of);
    if (ind && !(ind.sightings ||= []).some(x => x.stixId === s.stixId)) { ind.sightings.push({ stixId: s.stixId, first: s.first, last: s.last, count: s.count, where: s.where }); c.sightings++; }
    env.alerts.push({ externalId: s.stixId, sourceSystem: 'STIX sighting', title: `Sighting of ${ind?.name || ind?.value || s.of}`, detected: s.last || s.first, firstSeen: s.first, severity: 'medium',
      indicators: ind ? [ind.id] : [], tlp: s.tlp, confidence: s.confidence, techniques: ind?.techniques || [], asset: s.where && assetOf(s.where, ws) ? s.where : '' });
  }
  // alerts
  for (const o of env.alerts) {
    const a = normAlert(o, defaultTlp);
    if (!a.title) { errors.push('alert without a title skipped'); c.skipped++; continue; }
    if (!a.externalId) a.externalId = a.id || '';
    if (R.alerts.some(x => dedupKey(x) === dedupKey(a) || (a.id && x.id === a.id))) { c.duplicates++; continue; }
    if (!a.id) a.id = nextId(R.alerts, 'AL');
    const rule = R.rules.find(r => r.id === a.ruleId || (a.ruleId && r.ruleId === a.ruleId));
    if (rule) { a.ruleId = rule.id; if (!a.ruleVersion) a.ruleVersion = String(rule.version || ''); }
    a.original = JSON.stringify(o).slice(0, 4000); a.imported = now; a.notes = []; a.importFile = fileName;
    R.alerts.push(a); c.alerts++;
  }
  // gaps, coverage assertions, event pointers
  for (const o of env.gaps) {
    const g = { id: String(o.id || nextId(R.gaps, 'GAP')), title: String(o.title || ''), scenario: String(o.scenario || ''), technique: techniques(o.technique || '')[0] || '', source: String(o.source || o.telemetry || ''), description: String(o.description || ''), owner: String(o.owner || ''), status: GAP_STATES.some(x => x[0] === o.status) ? o.status : 'open', raised: String(o.raised || now), actions: arr(o.actions || []) };
    if (R.gaps.some(x => x.id === g.id)) { c.duplicates++; continue; } R.gaps.push(g); c.gaps++;
  }
  for (const o of env.coverage) {
    const cv = { id: String(o.id || nextId(R.coverage, 'COV')), scenario: String(o.scenario || ''), technique: techniques(o.technique || '')[0] || '', rules: arr(o.rules || []), note: String(o.note || '') };
    if (R.coverage.some(x => x.id === cv.id)) { c.duplicates++; continue; } R.coverage.push(cv); c.coverage++;
  }
  for (const o of env.events) {
    const e = { id: String(o.id || nextId(R.events, 'EV')), sourceId: String(o.sourceId || o.source || ''), externalRef: String(o.externalRef || o.ref || ''), observed: String(o.observed || o.time || ''), recorded: String(o.recorded || ''), ocsfClass: normOcsf(o.ocsfClass), parser: String(o.parser || ''), hash: String(o.hash || ''), link: String(o.link || '') };
    if (!e.externalRef) { c.skipped++; continue; }
    if (R.events.some(x => x.id === e.id)) { c.duplicates++; continue; } R.events.push(e); c.events++;
  }

  const rec = { id: nextId(R.imports, 'IMP'), date: new Date().toISOString().slice(0, 19), file: fileName, kind: k, counts: Object.fromEntries(Object.entries(c).filter(([, v]) => v)), sha256: await sha256(text), by, errors: errors.slice(0, 20), tlpDefault: defaultTlp };
  R.imports.push(rec);
  LOG.data('SIEM import', fileName, `${k} · ${Object.entries(rec.counts).map(([x, v]) => `${x} ${v}`).join(', ') || 'nothing added'} · sha256 ${rec.sha256.slice(0, 16)}…`, ws.name);
  touch();
  return rec;
}

/* ---------------- summary (dashboard, organisation graph) ---------------- */
export function summary(ws = S.ws, asOf = today()) {
  const R = reg(ws);
  const health = { healthy: 0, degraded: 0, silent: 0, unknown: 0 }; for (const s of R.sources) health[healthAt(s, asOf).state]++;
  const rules = Object.fromEntries(RULE_STATUS.map(([k]) => [k, 0])); for (const r of R.rules) rules[statusAt(r, asOf)] = (rules[statusAt(r, asOf)] || 0) + 1;
  const cov = coverageCounts(coverageMatrix(ws, asOf));
  const open = R.alerts.filter(openAlert), q = triageQueue(ws);
  return { health, rules, coverage: cov, alerts: { total: R.alerts.length, open: open.length, crownOpen: q.filter(x => x.crown && openAlert(x.a)).length, escalated: R.alerts.filter(a => a.triage === 'escalated').length, oldestOpen: open.map(a => day(a.detected)).filter(Boolean).sort()[0] || null },
    indicators: { total: R.indicators.length, stale: R.indicators.filter(i => indicatorStale(i, asOf)).length, restricted: R.indicators.filter(i => TLP_RESTRICTED.has(i.tlp)).length },
    gaps: R.gaps.filter(g => g.status === 'open').length };
}
