/* feedparse.js — parsers for the threat-feed and social-media sources of crg_feeds.py (1.4.0), relevance
   matching against the workspace (assets, technologies, register CVEs, scenario techniques, sector, region,
   watch terms) and IOC export (CSV, STIX 2.1). Parsing and matching run in the browser: nothing leaves the
   computer. Feed items are evidence for the analyst — they never change a risk score.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

const CVE_RX = /CVE-\d{4}-\d{4,7}/gi, ATT_RX = /\bT1\d{3}(?:\.\d{3})?\b/g;
const uniq = a => [...new Set(a.filter(Boolean))];
const strip = h => String(h || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const iso = d => { if (!d) return ''; const t = typeof d === 'number' ? new Date(d * 1000) : new Date(String(d).replace(' UTC', 'Z').replace(/^(\d{4}-\d\d-\d\d) (\d)/, '$1T$2')); return isNaN(t) ? String(d).slice(0, 10) : t.toISOString().slice(0, 16).replace('T', ' '); };
const cvesIn = s => uniq((String(s || '').match(CVE_RX) || []).map(x => x.toUpperCase()));
const attIn = s => uniq(String(s || '').match(ATT_RX) || []);
function item(src, o) {
  const text = [o.title, o.text].join(' ');
  return Object.assign({ src, cat: '', type: 'news', title: '', text: '', url: '', date: '', tags: [], cves: [], attack: [], iocs: [], malware: '', actor: '', sectors: [], countries: [] }, o,
    { cves: uniq([...(o.cves || []), ...cvesIn(text)]), attack: uniq([...(o.attack || []), ...attIn(text)]), key: src + ':' + (o.id || o.url || o.title) });
}

/* 1.9.2 (NV-062): one bad record never discards a file — every record is parsed in its own try, and the reasons are
   returned beside the items (parse() → items.errors, a list) so Sources & downloads can show them per source. */
let ERRORS = null;
const note = (what, e) => { if (ERRORS && ERRORS.length < 20) ERRORS.push(`${what}: ${String(e?.message || e).slice(0, 120)}`); };
/** Map a list record by record; a record that throws is skipped and noted. A non-list is an error, not a throw. */
function each(list, fn, what = 'record') {
  if (!Array.isArray(list)) { if (list !== undefined && list !== null) note(what + 's', 'not a list'); return []; }
  const out = [];
  list.forEach((d, n) => { try { if (d === null || typeof d !== 'object') throw new Error('not an object'); const it = fn(d, n); if (it) out.push(it); } catch (e) { note(`${what} ${n + 1}`, e); } });
  return out;
}
const S = v => (v === null || v === undefined) ? '' : typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' ? String(v) : '';
const L = v => Array.isArray(v) ? v.filter(x => x !== null && x !== undefined).map(x => typeof x === 'object' ? x : String(x)) : [];
const safeUrl = u => { const t = S(u).trim(); return /^https?:\/\//i.test(t) ? t : ''; };

function rss(src, xml) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const bad = doc.querySelector('parsererror');
  if (bad) { note('XML', (bad.textContent || 'malformed XML').replace(/\s+/g, ' ').slice(0, 160)); return []; }
  const nodes = [...doc.querySelectorAll('item, entry')];
  if (!nodes.length && !doc.querySelector('rss, feed, channel')) note('XML', 'not an RSS or Atom document');
  return each(nodes, n => {
    const g = s => n.querySelector(s)?.textContent || '';
    const link = n.querySelector('link')?.getAttribute('href') || g('link');
    return item(src, { type: 'news', title: strip(g('title')), text: strip(g('description') || g('summary') || g('content')).slice(0, 600), url: safeUrl(link),
      date: iso(g('pubDate') || g('updated') || g('published') || g('date')), tags: [...n.querySelectorAll('category')].map(c => c.textContent || c.getAttribute('term')).filter(Boolean) });
  }, 'item');
}

const P = {
  otx(j) {
    return each(j.results, p => item('otx', { id: S(p.id), type: 'pulse', title: S(p.name), text: strip(p.description).slice(0, 800), url: p.id ? 'https://otx.alienvault.com/pulse/' + encodeURIComponent(S(p.id)) : '',
      date: iso(p.modified || p.created), tags: L(p.tags).map(S), attack: L(p.attack_ids).map(a => S(a.id || a)), sectors: L(p.industries).map(S), countries: L(p.targeted_countries).map(S),
      malware: L(p.malware_families).map(m => S(m.display_name || m)).join(', '), actor: S(p.adversary),
      cves: L(p.indicators).filter(i => i.type === 'CVE').map(i => S(i.indicator)),
      iocs: L(p.indicators).filter(i => i.type !== 'CVE').slice(0, 200).map(i => ({ type: S(i.type), value: S(i.indicator) })) }), 'pulse');
  },
  threatfox(j) {
    return each(j.data, d => item('threatfox', { id: S(d.id), type: 'ioc', title: `${S(d.malware_printable || d.malware)} — ${S(d.ioc_type)} ${S(d.ioc)}`, text: S(d.threat_type_desc || d.threat_type),
      url: d.id ? 'https://threatfox.abuse.ch/ioc/' + encodeURIComponent(S(d.id)) + '/' : '', date: iso(d.first_seen), tags: L(d.tags).map(S), malware: S(d.malware_printable || d.malware),
      iocs: [{ type: S(d.ioc_type), value: S(d.ioc), confidence: d.confidence_level, threat: S(d.threat_type) }] }), 'IOC');
  },
  malwarebazaar(j) {
    return each(j.data, d => { const h = S(d.sha256_hash); if (!/^[0-9a-f]{64}$/i.test(h)) throw new Error('missing or malformed sha256_hash'); return item('malwarebazaar', { id: h, type: 'ioc', title: `${S(d.signature) || 'Unknown family'} — ${S(d.file_name) || h.slice(0, 16)}`,
      text: [S(d.file_type), S(d.delivery_method)].filter(Boolean).join(' · '), url: 'https://bazaar.abuse.ch/sample/' + h + '/', date: iso(d.first_seen), tags: L(d.tags).map(S), malware: S(d.signature),
      iocs: [{ type: 'sha256', value: h }] }); }, 'sample');
  },
  urlhaus(j) {
    return each(j.urls, d => item('urlhaus', { id: S(d.id), type: 'ioc', title: `${S(d.threat) || 'malicious URL'} — ${S(d.host)}`, text: `${S(d.url_status)} ${S(d.url)}`.trim(), url: safeUrl(d.urlhaus_reference),
      date: iso(d.date_added), tags: L(d.tags).map(S), malware: L(d.tags).map(S).join(', '), iocs: [{ type: 'url', value: S(d.url) }, { type: 'domain', value: S(d.host) }].filter(x => x.value) }), 'URL');
  },
  feodo(j) {
    return each(j, d => { if (!d.ip_address) throw new Error('no ip_address'); return item('feodo', { id: S(d.ip_address) + ':' + S(d.port), type: 'ioc', title: `${S(d.malware)} C2 — ${S(d.ip_address)}:${S(d.port)}`, text: `${S(d.status)} · ${S(d.as_name)} · ${S(d.country)}`,
      url: 'https://feodotracker.abuse.ch/browse/host/' + encodeURIComponent(S(d.ip_address)) + '/', date: iso(d.last_online || d.first_seen), malware: S(d.malware), countries: d.country ? [S(d.country)] : [],
      iocs: [{ type: 'ip:port', value: S(d.ip_address) + ':' + S(d.port) }] }); }, 'host');
  },
  'isc-infocon'(j) { return [item('isc-infocon', { id: 'infocon', type: 'stat', title: 'SANS ISC Infocon: ' + (S(j.status) || '?'), text: 'Internet Storm Center threat level', url: 'https://isc.sans.edu/infocon.html', tags: [S(j.status)].filter(Boolean) })]; },
  'isc-topports'(j) {
    const rows = Object.entries(j).filter(([k]) => /^\d+$/.test(k)).map(([, v]) => v);
    const n = v => { const x = Number(v); return Number.isFinite(x) ? x.toLocaleString() : '?'; };
    return each(rows, v => { const port = Number(v.targetport); if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('targetport is not a port'); return item('isc-topports', { id: 'port-' + port, type: 'stat', title: `Port ${port} — rank ${n(v.rank)}`, text: `${n(v.records)} reports · ${n(v.targets)} targets · ${n(v.sources)} sources (${S(j.date)})`,
      url: 'https://isc.sans.edu/port.html?port=' + port, date: S(j.date), tags: ['port ' + port] }); }, 'port');
  },
  'x-search'(j) {
    return each(j.data, t => item('x-search', { id: S(t.id), type: 'post', title: strip(t.text).slice(0, 140), text: strip(t.text), url: t.id ? 'https://x.com/i/web/status/' + encodeURIComponent(S(t.id)) : '', date: iso(t.created_at),
      tags: L(t.entities?.hashtags).map(h => S(h.tag)) }), 'post');
  },
  'mastodon-infosec'(j) {
    return each(j, t => item('mastodon-infosec', { id: S(t.id), type: 'post', title: strip(t.content).slice(0, 140), text: strip(t.content), url: safeUrl(t.url), date: iso(t.created_at),
      tags: L(t.tags).map(x => S(x.name)), actor: '' }), 'post');
  },
  'bluesky-search'(j) {
    return each(j.posts, p => { const uri = S(p.uri); if (!uri) throw new Error('no uri'); const id = uri.split('/').pop(); return item('bluesky-search', { id: uri, type: 'post', title: strip(p.record?.text).slice(0, 140), text: strip(p.record?.text),
      url: p.author?.handle ? `https://bsky.app/profile/${encodeURIComponent(S(p.author.handle))}/post/${encodeURIComponent(id)}` : '', date: iso(p.record?.createdAt || p.indexedAt) }); }, 'post');
  },
  'reddit-netsec'(j) {
    return each(j.data?.children, c => { const d = c.data; if (!d || typeof d !== 'object') throw new Error('no data'); return item('reddit-netsec', { id: S(d.permalink), type: 'post', title: S(d.title), text: d.selftext ? strip(d.selftext).slice(0, 400) : safeUrl(d.url),
      url: d.permalink ? 'https://www.reddit.com' + S(d.permalink) : '', date: iso(d.created_utc) }); }, 'post');
  },
  'github-advisories'(j) {
    return each(j, a => item('github-advisories', { id: S(a.ghsa_id), type: 'advisory', title: `${a.severity ? S(a.severity).toUpperCase() + ' · ' : ''}${S(a.summary)}`,
      text: L(a.vulnerabilities).map(v => `${S(v.package?.ecosystem)}:${S(v.package?.name)}`).join(', '), url: safeUrl(a.html_url), date: iso(a.published_at),
      cves: a.cve_id ? [S(a.cve_id)] : [], tags: L(a.cwes).map(c => S(c.cwe_id)) }), 'advisory');
  },
  'ransomware-live'(j) {
    return each(Array.isArray(j) ? j : j.victims, v => item('ransomware-live', { id: S(v.group_name || v.group) + ':' + S(v.post_title || v.victim), type: 'victim',
      title: `${S(v.group_name || v.group)} claims ${S(v.post_title || v.victim)}`, text: [S(v.activity), S(v.country), S(v.website || v.domain)].filter(Boolean).join(' · '),
      url: safeUrl(v.post_url) || 'https://www.ransomware.live/', date: iso(v.discovered || v.attackdate), actor: S(v.group_name || v.group), sectors: v.activity ? [S(v.activity)] : [], countries: v.country ? [S(v.country)] : [] }), 'victim');
  },
};

/** Parse one downloaded file. src = source id; cat = category from the catalogue; fmt = json | rss.
    Returns the items; `items.errors` lists the records skipped and why (empty when every record was read). A file that cannot
    be read at all (malformed JSON, malformed XML) throws, as before, with the reason. */
export function parse(src, raw, { cat = '', fmt = '' } = {}) {
  const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
  const isXml = fmt === 'rss' || /^\s*<\?xml|^\s*<(rss|feed)\b/.test(text);
  ERRORS = [];
  let items, errors;
  try {
    if (isXml) { items = rss(src, text); if (!items.length && ERRORS.some(e => /^XML/.test(e))) throw new Error(ERRORS[0]); }
    else {
      if (!text.trim()) throw new Error('empty file');
      const j = JSON.parse(text);
      if (j === null || typeof j !== 'object') throw new Error('JSON is not an object or a list');
      if (P[src]) items = P[src](j);
      else items = guess(src, j);
    }
  } finally { errors = ERRORS; ERRORS = null; }
  for (const i of items) i.cat = cat || i.cat;
  items.errors = errors;
  return items;
}
/** Unknown JSON source (custom or accepted suggestion): best-effort title/url/date from common shapes. */
function guess(src, j) {
  const arr = Array.isArray(j) ? j : j.data && Array.isArray(j.data) ? j.data : j.results || j.items || j.posts || [];
  return each(Array.isArray(arr) ? arr.slice(0, 500) : [], (d, n) => item(src, { id: S(d.id) || n, type: 'news', title: strip(d.title || d.name || d.summary || d.text || JSON.stringify(d).slice(0, 120)),
    text: strip(d.description || d.summary || d.text || '').slice(0, 600), url: safeUrl(d.url || d.link || d.html_url), date: iso(d.date || d.published || d.created_at || d.created || '') }));
}

/* ---------------- relevance ---------------- */
const VENDORS = ['fortinet', 'fortigate', 'fortios', 'citrix', 'netscaler', 'microsoft', 'exchange', 'sharepoint', 'windows', 'active directory', 'entra', 'azure', 'm365', 'office 365', 'outlook',
  'vmware', 'esxi', 'vcenter', 'cisco', 'palo alto', 'pan-os', 'globalprotect', 'ivanti', 'pulse secure', 'sonicwall', 'veeam', 'oracle', 'sap', 'epic', 'cerner', 'meditech', 'salesforce', 'aws',
  'google workspace', 'okta', 'atlassian', 'confluence', 'jira', 'moveit', 'gitlab', 'github', 'apache', 'tomcat', 'linux', 'chrome', 'zimbra', 'juniper', 'f5', 'big-ip', 'barracuda',
  'wordpress', 'drupal', 'solarwinds', 'kaseya', 'connectwise', 'screenconnect', 'teamviewer', 'anydesk', 'pacs', 'dicom', 'hl7', 'fhir', 'synology', 'qnap', 'zoom', 'teams', 'mitel', 'avaya'];
const SECTOR = { health: ['health', 'healthcare', 'hospital', 'clinic', 'medical', 'patient', 'pharma', 'santé', 'clinique'], finance: ['bank', 'financial', 'finance', 'insurance', 'credit union'],
  education: ['education', 'university', 'school', 'college'], government: ['government', 'municipal', 'public sector'], manufacturing: ['manufactur', 'industrial', 'ot ', 'ics', 'scada'],
  retail: ['retail', 'e-commerce', 'ecommerce'], energy: ['energy', 'utility', 'utilities', 'oil', 'gas', 'electric'], legal: ['law firm', 'legal'] };
const COUNTRY = { canada: ['canada', 'canadian', 'quebec', 'québec', 'montreal', 'montréal', 'ontario', ' ca '] };

/** Terms that make an item relevant to this workspace, with their weight and reason. */
export function profileTerms(ws, cfg) {
  const T = [];
  const add = (term, w, why, exact = false) => { term = String(term || '').trim(); if (term.length >= 3) T.push({ term: term.toLowerCase(), w, why, exact }); };
  const orgText = [ws.org.systems, ws.org.cloud, ws.org.suppliers, ws.org.services, ws.org.notes].join(' ').toLowerCase();
  for (const v of VENDORS) if (orgText.includes(v)) add(v, 3, 'technology in the organization profile');
  for (const a of ws.assets || []) {
    for (const v of [a.vendor, a.product]) if (v && v.length >= 3) add(v, 3, `asset ${a.id} ${a.name}`);
    for (const s of a.software || []) if (s.name) add(s.name, 3, `software on ${a.id}`);
  }
  for (const v of ws.vulns || []) { add(v.id, v.exposed ? 6 : 3, v.exposed ? 'CVE in the register — exposure confirmed' : 'CVE in the register', true); if (v.product) add(v.product, 2, 'product of a registered CVE'); }
  for (const s of ws.assessment.SCEN) for (const t of s.attack || []) add(t, 2, `technique of ${s.id}`, true);
  const sec = (ws.org.sector || '').toLowerCase();
  for (const [k, words] of Object.entries(SECTOR)) if (words.some(w => sec.includes(w.trim()))) for (const w of words) add(w, 2, `sector (${k})`);
  const reg = (ws.org.region || '').toLowerCase();
  for (const [k, words] of Object.entries(COUNTRY)) if (words.some(w => reg.includes(w.trim()))) for (const w of words) add(w.trim(), 1, `region (${k})`);
  for (const w of cfg?.social?.watch_terms || []) add(w, 3, 'watch term (Settings)');
  for (const w of ws.iocWatch || []) add(w.value, 5, 'IOC on the watch list', true);
  const seen = new Map(); for (const t of T) if (!seen.has(t.term) || seen.get(t.term).w < t.w) seen.set(t.term, t);
  return [...seen.values()];
}
export function relevance(it, terms) {
  const hay = (' ' + [it.title, it.text, it.tags.join(' '), it.malware, it.actor, it.sectors.join(' '), it.countries.join(' '), it.iocs.map(i => i.value).join(' ')].join(' ') + ' ').toLowerCase();
  const ids = new Set([...it.cves, ...it.attack].map(x => x.toLowerCase()));
  let score = 0; const why = [];
  for (const t of terms) {
    const hit = t.exact ? ids.has(t.term) || hay.includes(t.term) : hay.includes(t.term.length <= 4 ? ' ' + t.term : t.term);
    if (hit) { score += t.w; why.push(`${t.term} — ${t.why}`); }
  }
  if (it.countries.some(c => /^(ca|canada)$/i.test(c)) && terms.some(t => t.why.startsWith('region'))) { score += 1; why.push('targets Canada'); }
  return { score, why: uniq(why).slice(0, 8) };
}

/* ---------------- IOC export ---------------- */
const STIX_PAT = { 'ipv4': v => `[ipv4-addr:value = '${v}']`, 'ip:port': v => `[ipv4-addr:value = '${v.split(':')[0]}']`, 'domain': v => `[domain-name:value = '${v}']`, 'hostname': v => `[domain-name:value = '${v}']`,
  'url': v => `[url:value = '${v.replace(/'/g, "\\'")}']`, 'sha256': v => `[file:hashes.'SHA-256' = '${v}']`, 'md5': v => `[file:hashes.MD5 = '${v}']`, 'sha1': v => `[file:hashes.'SHA-1' = '${v}']`,
  'filehash-sha256': v => `[file:hashes.'SHA-256' = '${v}']`, 'email': v => `[email-addr:value = '${v}']` };
const uuid4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });
export function stixBundle(iocs, name = 'CyberRiskGuardian IOC watch list') {
  const now = new Date().toISOString();
  const idn = { type: 'identity', spec_version: '2.1', id: 'identity--' + uuid4(), created: now, modified: now, name: 'CyberRiskGuardian Desktop', identity_class: 'system' };
  const objs = [idn];
  for (const i of iocs) {
    const f = STIX_PAT[String(i.type).toLowerCase()]; if (!f) continue;
    objs.push({ type: 'indicator', spec_version: '2.1', id: 'indicator--' + uuid4(), created: now, modified: now, created_by_ref: idn.id, name: `${i.type} ${i.value}`,
      description: [i.malware, i.note, 'Source: ' + i.src].filter(Boolean).join(' · '), indicator_types: ['malicious-activity'], pattern: f(i.value), pattern_type: 'stix',
      valid_from: (i.added ? new Date(i.added) : new Date()).toISOString(), labels: [i.src].filter(Boolean) });
  }
  return { type: 'bundle', id: 'bundle--' + uuid4(), objects: objs, x_crg_name: name };
}
