/* assets.js — information-asset model of CyberRiskGuardian Desktop 1.4.0: classification and criticality
   scoring, business impact analysis, dynamic risk scoring, vulnerability and configuration correlation,
   dependency graph and blast radius, discovery imports (Nmap XML, CSV, AWS / Azure JSON) with diff, and the
   timestamped audit trail. All transparent rules; scores are decision-support indicators.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, compute } from './state.js';
import { parseCSV, today } from './util.js';

export const TYPES = [['hardware', 'Hardware / endpoint'], ['server', 'Server'], ['network', 'Network device'], ['application', 'Application / software'], ['data', 'Data / information'],
  ['service', 'Business service / process'], ['cloud', 'Cloud service / tenant'], ['iot', 'Medical / IoT / OT device'], ['supplier', 'Supplier / third party'], ['people', 'People / role'], ['facility', 'Facility']];
export const CLASS = ['Public', 'Internal', 'Confidential', 'Restricted'];
export const SENS = [['PII', 'Personal information'], ['PHI', 'Health information'], ['PCI', 'Payment card data'], ['FIN', 'Financial'], ['IP', 'Intellectual property'], ['CRED', 'Credentials / secrets'], ['LEGAL', 'Legal / privileged'], ['HR', 'Employee records']];
export const STAGES = [['planned', 'Planned'], ['acquired', 'Acquired'], ['service', 'In service'], ['maintenance', 'Maintenance'], ['retiring', 'Retiring'], ['disposed', 'Disposed']];
export const BASELINES = ['CIS Benchmark — Windows 11 Enterprise L1', 'CIS Benchmark — Windows Server 2022 L1', 'CIS Benchmark — macOS', 'CIS Benchmark — Ubuntu Linux 22.04 L1', 'CIS Benchmark — RHEL 9 L1',
  'CIS Benchmark — Microsoft 365', 'CIS Benchmark — Microsoft Azure Foundations', 'CIS Benchmark — AWS Foundations', 'CIS Benchmark — Google Workspace', 'CIS Benchmark — Cisco IOS', 'CIS Benchmark — Fortinet FortiGate',
  'CIS Benchmark — Palo Alto PAN-OS', 'CIS Benchmark — VMware ESXi', 'CIS Benchmark — Kubernetes', 'CIS Benchmark — Microsoft SQL Server', 'CIS Benchmark — PostgreSQL', 'DISA STIG', 'Vendor hardening guide', 'Internal standard'];
const ENDPOINT_TYPES = new Set(['hardware', 'server']);
const CLASS_W = { Public: 0, Internal: 4, Confidential: 10, Restricted: 15 };

export function nextAssetId(ws = S.ws) { let n = 0; for (const a of ws.assets || []) { const m = /^A-(\d+)$/.exec(a.id); if (m) n = Math.max(n, +m[1]); } return 'A-' + String(n + 1).padStart(3, '0'); }
export function blankAsset(o = {}) {
  return Object.assign({ id: nextAssetId(), name: '', type: 'application', subtype: '', desc: '', owner: '', custodian: '', location: '', env: 'production', ip: '', hostname: '', os: '', vendor: '', product: '', version: '', cpe: '',
    tags: [], classification: 'Internal', sensitivity: [], cia: { c: 3, i: 3, a: 3 }, bia: { mtd: '', rto: '', rpo: '', fin: 0, ops: 0, legal: 0, rep: 0, safety: 0, processes: '', revhr: '' },
    lifecycle: { stage: 'service', acquired: '', eos: '', eol: '', retire: '' }, endpoint: { edr: null, disk_enc: null, last_patch: '', last_seen: '' }, baseline: { name: '', status: 'unknown', checked: '', deviations: '' },
    deps: [], vulns: [], software: [], discovery: null, created: today(), updated: today() }, o);
}

/* ---------------- audit trail ---------------- */
export function log(ws, asset, action, field = '', oldV = '', newV = '', src = 'manual') {
  (ws.assetLog ||= []).push({ ts: new Date().toISOString().slice(0, 19), asset, action, field, old: oldV === undefined ? '' : typeof oldV === 'object' ? JSON.stringify(oldV) : String(oldV),
    new: newV === undefined ? '' : typeof newV === 'object' ? JSON.stringify(newV) : String(newV), src });
  if (ws.assetLog.length > 20000) ws.assetLog.splice(0, ws.assetLog.length - 20000);
}
/** Set a (possibly nested 'a.b') field with an audit entry. */
export function setField(ws, a, path, value, src = 'manual') {
  const ks = path.split('.'); let o = a; for (const k of ks.slice(0, -1)) o = (o[k] ||= {});
  const k = ks[ks.length - 1], old = o[k];
  if (JSON.stringify(old) === JSON.stringify(value)) return false;
  o[k] = value; a.updated = today(); log(ws, a.id, 'update', path, old, value, src); return true;
}

/* ---------------- scoring ---------------- */
export const dependents = (id, ws = S.ws) => (ws.assets || []).filter(a => (a.deps || []).includes(id));
export const scenariosOf = (id, ws = S.ws) => ws.assessment.SCEN.filter(s => (s.assetIds || []).includes(id));
export const risksOf = (id, ws = S.ws) => (ws.risks || []).filter(r => (r.assets || []).includes(id));
export const biaImpact = a => Math.max(0, ...['fin', 'ops', 'legal', 'rep', 'safety'].map(k => Number(a.bia?.[k]) || 0));

/** Criticality 0–100 with its components. */
export function criticality(a, ws = S.ws) {
  const cia = Math.max(+a.cia?.c || 0, +a.cia?.i || 0, +a.cia?.a || 0);
  const parts = [['CIA (highest of C, I, A)', cia / 5 * 40], ['Business impact (BIA, highest category)', biaImpact(a) / 5 * 30], ['Classification ' + (a.classification || '—'), CLASS_W[a.classification] || 0],
    ['Sensitive data tags', Math.min(10, (a.sensitivity || []).length * 4)], ['Dependents', Math.min(5, dependents(a.id, ws).length * 1.5)]];
  const score = Math.min(100, Math.round(parts.reduce((t, p) => t + p[1], 0)));
  return { score, tier: tier(score), parts };
}
export const tier = s => s >= 70 ? 'Critical' : s >= 50 ? 'High' : s >= 30 ? 'Medium' : 'Low';
export const tierKind = t => t === 'Critical' ? 'bad' : t === 'High' ? 'warn' : t === 'Medium' ? '' : 'good';
const daysSince = d => d ? (Date.now() - new Date(d)) / 864e5 : null;

/** Dynamic risk score 0–100 = criticality × exposure; exposure from vulnerabilities (KEV, EPSS, exposure),
 *  configuration posture, lifecycle and the residual-to-tolerance ratio of linked scenarios. Recomputed live. */
export function dynamic(a, ws = S.ws, R = null) {
  const crit = criticality(a, ws).score;
  const f = [];
  let vmax = 0;
  for (const id of a.vulns || []) {
    const v = (ws.vulns || []).find(x => x.id === id);
    const kev = !!S.snap?.kev?.cves?.[id], epss = S.snap?.epss?.scores?.[id]?.[0] ?? 0;
    const x = Math.min(1, 0.3 + (kev ? 0.4 : 0) + epss * 0.3 + (v?.exposed ? 0.2 : 0));
    if (x > vmax) vmax = x;
  }
  if (vmax) f.push([`Vulnerabilities (worst: ${(a.vulns || []).length} linked)`, vmax * 0.5]);
  const sw = (a.software || []).length;
  if (ENDPOINT_TYPES.has(a.type)) {
    if (a.endpoint?.edr === false) f.push(['No EDR / anti-malware', 0.15]);
    if (a.endpoint?.disk_enc === false && ['Confidential', 'Restricted'].includes(a.classification)) f.push(['Sensitive data without disk encryption', 0.1]);
    const pd = daysSince(a.endpoint?.last_patch); if (pd !== null && pd > 60) f.push([`Last patch ${Math.round(pd)} days ago`, 0.1]);
  }
  if (a.baseline?.status === 'drift') f.push(['Configuration drift from baseline', 0.1]);
  const eos = a.lifecycle?.eos || a.lifecycle?.eol; if (eos && eos < today() && a.lifecycle?.stage !== 'disposed') f.push(['Past end of support', 0.2]);
  if ((a.tags || []).some(t => /internet|public|exposed|dmz/i.test(t))) f.push(['Internet-facing', 0.15]);
  R ||= compute(ws);
  const sc = scenariosOf(a.id, ws).map(s => R.rows.find(r => r.id === s.id)).filter(Boolean);
  const ratio = sc.length ? Math.max(...sc.map(r => r.ratio)) : null;
  if (ratio !== null && ratio > CRG.BAND_HIGH) f.push([`Linked scenario above tolerance (ratio ${ratio.toFixed(2)})`, 0.15]);
  const exposure = Math.min(1, 0.1 + f.reduce((t, x) => t + x[1], 0));
  return { score: Math.round(crit * exposure), crit, exposure, factors: f, ratio, sw };
}

/* ---------------- correlation ---------------- */
const norm = s => String(s || '').toLowerCase();
/** CVEs of the register that plausibly concern an asset (asset / product field, vendor, product, software). */
export function vulnSuggestions(a, ws = S.ws) {
  const terms = [a.name, a.hostname, a.product, ...(a.software || []).map(s => s.name)].map(norm).filter(t => t.length >= 3);
  const vendor = norm(a.vendor);
  const out = [];
  for (const v of ws.vulns || []) {
    if ((a.vulns || []).includes(v.id)) continue;
    const hay = norm([v.asset, v.product, v.title, v.desc, v.notes].join(' '));
    const why = terms.filter(t => hay.includes(t));
    if (vendor.length >= 3 && hay.includes(vendor) && !why.length && a.product && hay.includes(norm(a.product).split(' ')[0])) why.push(vendor);
    if (why.length) out.push({ id: v.id, why: why.join(', '), kev: !!S.snap?.kev?.cves?.[v.id], exposed: !!v.exposed });
  }
  return out;
}

/* ---------------- dependencies and blast radius ---------------- */
/** Everything that depends, directly or transitively, on the asset (what breaks when it fails), with hop counts. */
export function blastRadius(id, ws = S.ws, maxHops = 6) {
  const hops = new Map([[id, 0]]); let frontier = [id];
  for (let h = 1; h <= maxHops && frontier.length; h++) {
    const next = [];
    for (const x of frontier) for (const d of dependents(x, ws)) if (!hops.has(d.id)) { hops.set(d.id, h); next.push(d.id); }
    frontier = next;
  }
  hops.delete(id);
  const assets = [...hops.entries()].map(([aid, h]) => ({ a: ws.assets.find(x => x.id === aid), h })).filter(x => x.a);
  const all = [id, ...hops.keys()];
  const scen = [...new Set(all.flatMap(x => scenariosOf(x, ws).map(s => s.id)))];
  const risks = [...new Set(all.flatMap(x => risksOf(x, ws).map(r => r.id)))];
  const services = assets.filter(x => x.a.type === 'service');
  const mtds = [ws.assets.find(x => x.id === id), ...assets.map(x => x.a)].map(a => Number(a?.bia?.mtd)).filter(n => n > 0);
  return { assets, scen, risks, services, critSum: assets.reduce((t, x) => t + criticality(x.a, ws).score, 0), minMtd: mtds.length ? Math.min(...mtds) : null };
}
/** Upstream: what the asset needs (transitive dependencies). */
export function upstream(id, ws = S.ws, maxHops = 6) {
  const seen = new Set(); let frontier = [id];
  for (let h = 1; h <= maxHops && frontier.length; h++) { const next = []; for (const x of frontier) for (const d of ws.assets.find(a => a.id === x)?.deps || []) if (!seen.has(d) && d !== id) { seen.add(d); next.push(d); } frontier = next; }
  return [...seen];
}

/* ---------------- discovery imports ---------------- */
export function parseNmap(xml) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Not valid XML');
  const out = [];
  for (const h of doc.querySelectorAll('host')) {
    if (h.querySelector('status')?.getAttribute('state') === 'down') continue;
    const ip = h.querySelector('address[addrtype="ipv4"]')?.getAttribute('addr') || h.querySelector('address[addrtype="ipv6"]')?.getAttribute('addr') || '';
    const mac = h.querySelector('address[addrtype="mac"]');
    const host = h.querySelector('hostnames hostname')?.getAttribute('name') || '';
    const os = h.querySelector('os osmatch')?.getAttribute('name') || '';
    const sw = [...h.querySelectorAll('ports port')].filter(p => p.querySelector('state')?.getAttribute('state') === 'open').map(p => {
      const s = p.querySelector('service'); return { name: s?.getAttribute('product') || s?.getAttribute('name') || 'port ' + p.getAttribute('portid'), version: s?.getAttribute('version') || '', port: p.getAttribute('portid') + '/' + p.getAttribute('protocol') };
    });
    out.push({ key: (host || ip).toLowerCase(), name: host || ip, hostname: host, ip, os, vendor: mac?.getAttribute('vendor') || '', type: /router|switch|firewall|fortigate|cisco ios/i.test(os) ? 'network' : /windows server|linux|esxi|unix/i.test(os) ? 'server' : 'hardware', software: sw, last_seen: today() });
  }
  return out;
}
const COLS = { name: ['name', 'asset', 'asset name', 'device name', 'computer name', 'computername', 'display name', 'hostname', 'host', 'device'], hostname: ['hostname', 'host name', 'dns name', 'fqdn', 'computer name'],
  ip: ['ip', 'ip address', 'ipaddress', 'ipv4', 'private ip', 'last ip'], os: ['os', 'operating system', 'os name', 'platform', 'os platform'], version: ['version', 'os version', 'build'],
  owner: ['owner', 'assigned to', 'user', 'primary user', 'managed by'], type: ['type', 'category', 'class', 'asset type', 'device type'], vendor: ['vendor', 'manufacturer', 'make', 'publisher'],
  product: ['product', 'model', 'application', 'software'], location: ['location', 'site', 'region', 'office'], last_seen: ['last seen', 'lastseen', 'last contact', 'last check-in', 'last_seen'],
  edr: ['edr', 'sensor', 'agent', 'edr status', 'defender status', 'sensor status', 'onboarding status'], classification: ['classification', 'data classification'], cpe: ['cpe'], serial: ['serial', 'serial number'] };
function mapCols(h) { const m = {}; const hl = h.map(x => x.trim().toLowerCase()); for (const [k, names] of Object.entries(COLS)) { const i = hl.findIndex(x => names.includes(x)); if (i >= 0) m[k] = i; } return m; }
const typeFrom = s => { s = norm(s); return /server/.test(s) ? 'server' : /switch|router|firewall|network|access point/.test(s) ? 'network' : /laptop|desktop|workstation|endpoint|mobile|phone|tablet/.test(s) ? 'hardware' : /app|software|saas/.test(s) ? 'application' : /cloud|vm|instance/.test(s) ? 'cloud' : /iot|medical|ot|scada|printer/.test(s) ? 'iot' : /data/.test(s) ? 'data' : ''; };
const edrFrom = s => { s = norm(s); if (!s) return null; return /^(yes|true|1|active|onboarded|healthy|installed|running|enabled)/.test(s) ? true : /^(no|false|0|inactive|missing|not|disabled|unhealthy)/.test(s) ? false : null; };
export function parseCsvAssets(text) {
  const rows = parseCSV(text); if (rows.length < 2) return [];
  const m = mapCols(rows[0]); if (m.name === undefined && m.hostname === undefined && m.ip === undefined) throw new Error('No name, hostname or IP column found');
  const g = (r, k) => m[k] !== undefined ? (r[m[k]] || '').trim() : '';
  return rows.slice(1).map(r => { const name = g(r, 'name') || g(r, 'hostname') || g(r, 'ip');
    return { key: (g(r, 'hostname') || name || g(r, 'ip')).toLowerCase(), name, hostname: g(r, 'hostname'), ip: g(r, 'ip'), os: g(r, 'os'), version: g(r, 'version'), owner: g(r, 'owner'), type: typeFrom(g(r, 'type')) || typeFrom(g(r, 'os')) || '',
      vendor: g(r, 'vendor'), product: g(r, 'product'), location: g(r, 'location'), last_seen: g(r, 'last_seen').slice(0, 10), edr: edrFrom(g(r, 'edr')), classification: CLASS.find(c => c.toLowerCase() === g(r, 'classification').toLowerCase()) || '', cpe: g(r, 'cpe') }; }).filter(x => x.name);
}
export function parseJsonAssets(text) {
  const j = JSON.parse(text);
  if (j.Reservations) return j.Reservations.flatMap(r => r.Instances || []).map(i => { const nm = (i.Tags || []).find(t => t.Key === 'Name')?.Value || i.InstanceId;
    return { key: i.InstanceId.toLowerCase(), name: nm, hostname: i.PrivateDnsName || '', ip: i.PrivateIpAddress || '', os: i.PlatformDetails || i.Platform || '', type: 'cloud', vendor: 'AWS', product: 'EC2 ' + (i.InstanceType || ''), location: i.Placement?.AvailabilityZone || '', last_seen: today(), cloudId: i.InstanceId, tags: (i.Tags || []).map(t => t.Key + '=' + t.Value) }; });
  const arr = Array.isArray(j) ? j : j.value || j.items || j.assets || j.devices || [];
  return arr.map(x => {
    if (x.type && /^Microsoft\./.test(x.type)) return { key: (x.id || x.name).toLowerCase(), name: x.name, type: 'cloud', vendor: 'Microsoft Azure', product: x.type, location: x.location || '', last_seen: today(), cloudId: x.id, tags: Object.entries(x.tags || {}).map(([k, v]) => k + '=' + v) };
    const name = x.name || x.hostname || x.deviceName || x.computerDnsName || x.ip || x.ipAddress;
    return { key: String(x.hostname || x.computerDnsName || name || '').toLowerCase(), name, hostname: x.hostname || x.computerDnsName || '', ip: x.ip || x.ipAddress || x.lastIpAddress || '', os: x.os || x.osPlatform || '', version: x.osVersion || x.version || '',
      type: typeFrom(x.type || x.deviceType || x.osPlatform), vendor: x.vendor || '', product: x.product || x.model || '', last_seen: String(x.lastSeen || x.last_seen || '').slice(0, 10), edr: x.healthStatus ? /active/i.test(x.healthStatus) : edrFrom(x.edr) };
  }).filter(x => x.name);
}
export function parseDiscovery(name, text) {
  if (/^\s*<\?xml|<nmaprun/.test(text)) return { kind: 'Nmap XML', items: parseNmap(text) };
  if (/^\s*[[{]/.test(text)) return { kind: 'JSON inventory', items: parseJsonAssets(text) };
  return { kind: 'CSV inventory', items: parseCsvAssets(text) };
}
const matchKey = a => [a.discovery?.key, a.hostname, a.name, a.ip, a.cloudId].filter(Boolean).map(norm);
/** Diff discovered items against the inventory: new, changed (field list), unchanged, missing (same source). */
export function diff(items, src, ws = S.ws) {
  const out = { add: [], change: [], same: [], missing: [] };
  const seen = new Set();
  for (const it of items) {
    const a = (ws.assets || []).find(x => matchKey(x).some(k => k && (k === it.key || k === norm(it.ip) && it.ip || k === norm(it.name))));
    if (!a) { out.add.push(it); continue; }
    seen.add(a.id);
    const ch = [];
    for (const k of ['ip', 'hostname', 'os', 'version', 'vendor', 'product', 'location', 'owner']) if (it[k] && it[k] !== a[k]) ch.push([k, a[k], it[k]]);
    if (it.edr !== undefined && it.edr !== null && it.edr !== a.endpoint?.edr) ch.push(['endpoint.edr', a.endpoint?.edr, it.edr]);
    if (it.last_seen && it.last_seen !== a.endpoint?.last_seen) ch.push(['endpoint.last_seen', a.endpoint?.last_seen, it.last_seen]);
    if (it.software?.length && JSON.stringify(it.software.map(s => s.name + s.version).sort()) !== JSON.stringify((a.software || []).map(s => s.name + s.version).sort())) ch.push(['software', (a.software || []).length + ' items', it.software.length + ' items', it.software]);
    (ch.filter(c => c[0] !== 'endpoint.last_seen').length ? out.change : out.same).push({ a, it, ch });
  }
  for (const a of ws.assets || []) if (a.discovery?.source === src && !seen.has(a.id)) out.missing.push(a);
  return out;
}
export function applyDiff(d, src, ws = S.ws, pick = {}) {
  let n = 0;
  for (const it of d.add) {
    if (pick.add && !pick.add.has(it.key)) continue;
    const a = blankAsset({ name: it.name, hostname: it.hostname || '', ip: it.ip || '', os: it.os || '', version: it.version || '', vendor: it.vendor || '', product: it.product || '', owner: it.owner || '', location: it.location || '',
      type: it.type || 'hardware', classification: it.classification || 'Internal', software: it.software || [], tags: it.tags || [], cloudId: it.cloudId,
      endpoint: { edr: it.edr ?? null, disk_enc: null, last_patch: '', last_seen: it.last_seen || '' }, discovery: { source: src, key: it.key, first: today(), last: today() } });
    ws.assets.push(a); log(ws, a.id, 'create', '', '', a.name, 'discovery: ' + src); n++;
  }
  for (const x of [...d.change, ...d.same]) {
    if (pick.change && d.change.includes(x) && !pick.change.has(x.a.id)) continue;
    for (const [k, , nv, full] of x.ch) setField(ws, x.a, k, full ?? nv, 'discovery: ' + src);
    x.a.discovery = Object.assign(x.a.discovery || { source: src, key: x.it.key, first: today() }, { last: today() });
    n++;
  }
  for (const a of d.missing) if (!pick.missing || pick.missing.has(a.id)) { setField(ws, a, 'discovery.missing', today(), 'discovery: ' + src); n++; }
  return n;
}

/* ---------------- compliance reporting ---------------- */
export const CHECKS = [
  { id: 'AC-1', name: 'Asset has an owner', ctl: 'ISO 27002:2022 5.9 · CIS 1 · CSF ID.AM', test: a => !!a.owner },
  { id: 'AC-2', name: 'Asset is classified', ctl: 'ISO 5.12 · CSF ID.AM-05', test: a => !!a.classification },
  { id: 'AC-3', name: 'Restricted or confidential data is tagged with its sensitivity', ctl: 'ISO 5.13 · CIS 3', applies: a => ['Confidential', 'Restricted'].includes(a.classification) && ['data', 'application', 'cloud'].includes(a.type), test: a => (a.sensitivity || []).length > 0 },
  { id: 'AC-4', name: 'Endpoint protected by EDR / anti-malware', ctl: 'ISO 8.7 · CIS 10', applies: a => ENDPOINT_TYPES.has(a.type), test: a => a.endpoint?.edr === true },
  { id: 'AC-5', name: 'Disk encryption on endpoints holding sensitive data', ctl: 'ISO 8.24 · CIS 3.6', applies: a => ENDPOINT_TYPES.has(a.type) && ['Confidential', 'Restricted'].includes(a.classification), test: a => a.endpoint?.disk_enc === true },
  { id: 'AC-6', name: 'Patched within 60 days', ctl: 'ISO 8.8 · CIS 7', applies: a => ENDPOINT_TYPES.has(a.type) || a.type === 'network', test: a => { const d = daysSince(a.endpoint?.last_patch); return d !== null && d <= 60; } },
  { id: 'AC-7', name: 'Compliant with its configuration baseline', ctl: 'ISO 8.9 · CIS 4', applies: a => ['server', 'hardware', 'network', 'cloud'].includes(a.type), test: a => a.baseline?.status === 'compliant' },
  { id: 'AC-8', name: 'Not past end of support', ctl: 'ISO 8.8 · CIS 2.2', applies: a => a.lifecycle?.stage !== 'disposed', test: a => { const e = a.lifecycle?.eos || a.lifecycle?.eol; return !e || e >= today(); } },
  { id: 'AC-9', name: 'Business impact analysed (RTO set) for services and critical assets', ctl: 'ISO 5.30 · CSF ID.BE / GV.OC-04', applies: a => a.type === 'service' || criticality(a).tier === 'Critical', test: a => !!a.bia?.rto },
  { id: 'AC-10', name: 'Seen by discovery in the last 30 days', ctl: 'CIS 1.1 · ISO 5.9', applies: a => !!a.discovery, test: a => { const d = daysSince(a.discovery?.last); return d !== null && d <= 30; } },
];
export function complianceReport(ws = S.ws) {
  const A = (ws.assets || []).filter(a => a.lifecycle?.stage !== 'disposed');
  return CHECKS.map(c => { const app = A.filter(a => !c.applies || c.applies(a)); const fail = app.filter(a => !c.test(a)); return { ...c, applicable: app.length, pass: app.length - fail.length, fail, pct: app.length ? (app.length - fail.length) / app.length : null }; });
}
