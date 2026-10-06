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

function rss(src, xml) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const out = [];
  for (const n of [...doc.querySelectorAll('item, entry')]) {
    const g = s => n.querySelector(s)?.textContent || '';
    const link = n.querySelector('link')?.getAttribute('href') || g('link');
    out.push(item(src, { type: 'news', title: strip(g('title')), text: strip(g('description') || g('summary') || g('content')).slice(0, 600), url: link.trim(),
      date: iso(g('pubDate') || g('updated') || g('published') || g('date')), tags: [...n.querySelectorAll('category')].map(c => c.textContent || c.getAttribute('term')).filter(Boolean) }));
  }
  return out;
}

const P = {
  otx(j) {
    return (j.results || []).map(p => item('otx', { id: p.id, type: 'pulse', title: p.name, text: strip(p.description).slice(0, 800), url: 'https://otx.alienvault.com/pulse/' + p.id,
      date: iso(p.modified || p.created), tags: p.tags || [], attack: (p.attack_ids || []).map(a => a.id || a), sectors: p.industries || [], countries: p.targeted_countries || [],
      malware: (p.malware_families || []).map(m => m.display_name || m).join(', '), actor: p.adversary || '',
      cves: (p.indicators || []).filter(i => i.type === 'CVE').map(i => i.indicator),
      iocs: (p.indicators || []).filter(i => i.type !== 'CVE').slice(0, 200).map(i => ({ type: i.type, value: i.indicator })) }));
  },
  threatfox(j) {
    return (Array.isArray(j.data) ? j.data : []).map(d => item('threatfox', { id: d.id, type: 'ioc', title: `${d.malware_printable || d.malware} — ${d.ioc_type} ${d.ioc}`, text: d.threat_type_desc || d.threat_type || '',
      url: 'https://threatfox.abuse.ch/ioc/' + d.id + '/', date: iso(d.first_seen), tags: d.tags || [], malware: d.malware_printable || d.malware || '',
      iocs: [{ type: d.ioc_type, value: d.ioc, confidence: d.confidence_level, threat: d.threat_type }] }));
  },
  malwarebazaar(j) {
    return (Array.isArray(j.data) ? j.data : []).map(d => item('malwarebazaar', { id: d.sha256_hash, type: 'ioc', title: `${d.signature || 'Unknown family'} — ${d.file_name || d.sha256_hash.slice(0, 16)}`,
      text: [d.file_type, d.delivery_method].filter(Boolean).join(' · '), url: 'https://bazaar.abuse.ch/sample/' + d.sha256_hash + '/', date: iso(d.first_seen), tags: d.tags || [], malware: d.signature || '',
      iocs: [{ type: 'sha256', value: d.sha256_hash }] }));
  },
  urlhaus(j) {
    return (j.urls || []).map(d => item('urlhaus', { id: d.id, type: 'ioc', title: `${d.threat || 'malicious URL'} — ${d.host}`, text: `${d.url_status || ''} ${d.url}`, url: d.urlhaus_reference,
      date: iso(d.date_added), tags: d.tags || [], malware: (d.tags || []).join(', '), iocs: [{ type: 'url', value: d.url }, { type: 'domain', value: d.host }] }));
  },
  feodo(j) {
    return (Array.isArray(j) ? j : []).map(d => item('feodo', { id: d.ip_address + ':' + d.port, type: 'ioc', title: `${d.malware} C2 — ${d.ip_address}:${d.port}`, text: `${d.status || ''} · ${d.as_name || ''} · ${d.country || ''}`,
      url: 'https://feodotracker.abuse.ch/browse/host/' + d.ip_address + '/', date: iso(d.last_online || d.first_seen), malware: d.malware || '', countries: d.country ? [d.country] : [],
      iocs: [{ type: 'ip:port', value: d.ip_address + ':' + d.port }] }));
  },
  'isc-infocon'(j) { return [item('isc-infocon', { id: 'infocon', type: 'stat', title: 'SANS ISC Infocon: ' + (j.status || '?'), text: 'Internet Storm Center threat level', url: 'https://isc.sans.edu/infocon.html', tags: [j.status] })]; },
  'isc-topports'(j) {
    const rows = Object.entries(j).filter(([k]) => /^\d+$/.test(k)).map(([, v]) => v);
    return rows.map(v => item('isc-topports', { id: 'port-' + v.targetport, type: 'stat', title: `Port ${v.targetport} — rank ${v.rank}`, text: `${Number(v.records).toLocaleString()} reports · ${Number(v.targets).toLocaleString()} targets · ${Number(v.sources).toLocaleString()} sources (${j.date || ''})`,
      url: 'https://isc.sans.edu/port.html?port=' + v.targetport, date: j.date || '', tags: ['port ' + v.targetport] }));
  },
  'x-search'(j) {
    return (j.data || []).map(t => item('x-search', { id: t.id, type: 'post', title: strip(t.text).slice(0, 140), text: strip(t.text), url: 'https://x.com/i/web/status/' + t.id, date: iso(t.created_at),
      tags: (t.entities?.hashtags || []).map(h => h.tag) }));
  },
  'mastodon-infosec'(j) {
    return (Array.isArray(j) ? j : []).map(t => item('mastodon-infosec', { id: t.id, type: 'post', title: strip(t.content).slice(0, 140), text: strip(t.content), url: t.url, date: iso(t.created_at),
      tags: (t.tags || []).map(x => x.name), actor: '' }));
  },
  'bluesky-search'(j) {
    return (j.posts || []).map(p => { const id = p.uri.split('/').pop(); return item('bluesky-search', { id: p.uri, type: 'post', title: strip(p.record?.text).slice(0, 140), text: strip(p.record?.text),
      url: `https://bsky.app/profile/${p.author?.handle}/post/${id}`, date: iso(p.record?.createdAt || p.indexedAt) }); });
  },
  'reddit-netsec'(j) {
    return (j.data?.children || []).map(c => c.data).map(d => item('reddit-netsec', { id: d.permalink, type: 'post', title: d.title, text: d.selftext ? strip(d.selftext).slice(0, 400) : d.url,
      url: 'https://www.reddit.com' + d.permalink, date: iso(d.created_utc) }));
  },
  'github-advisories'(j) {
    return (Array.isArray(j) ? j : []).map(a => item('github-advisories', { id: a.ghsa_id, type: 'advisory', title: `${a.severity ? a.severity.toUpperCase() + ' · ' : ''}${a.summary}`,
      text: (a.vulnerabilities || []).map(v => `${v.package?.ecosystem}:${v.package?.name}`).join(', '), url: a.html_url, date: iso(a.published_at),
      cves: a.cve_id ? [a.cve_id] : [], tags: (a.cwes || []).map(c => c.cwe_id) }));
  },
  'ransomware-live'(j) {
    return (Array.isArray(j) ? j : j.victims || []).map(v => item('ransomware-live', { id: (v.group_name || v.group) + ':' + (v.post_title || v.victim), type: 'victim',
      title: `${v.group_name || v.group} claims ${v.post_title || v.victim}`, text: [v.activity, v.country, v.website || v.domain].filter(Boolean).join(' · '),
      url: v.post_url || 'https://www.ransomware.live/', date: iso(v.discovered || v.attackdate), actor: v.group_name || v.group || '', sectors: v.activity ? [v.activity] : [], countries: v.country ? [v.country] : [] }));
  },
};

/** Parse one downloaded file. src = source id; cat = category from the catalogue; fmt = json | rss. */
export function parse(src, raw, { cat = '', fmt = '' } = {}) {
  const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
  const isXml = fmt === 'rss' || /^\s*<\?xml|^\s*<(rss|feed)\b/.test(text);
  let items;
  if (isXml) items = rss(src, text);
  else {
    const j = JSON.parse(text);
    if (P[src]) items = P[src](j);
    else items = guess(src, j);
  }
  for (const i of items) i.cat = cat || i.cat;
  return items;
}
/** Unknown JSON source (custom or accepted suggestion): best-effort title/url/date from common shapes. */
function guess(src, j) {
  const arr = Array.isArray(j) ? j : j.data && Array.isArray(j.data) ? j.data : j.results || j.items || j.posts || [];
  return arr.slice(0, 500).map((d, n) => item(src, { id: d.id || n, type: 'news', title: strip(d.title || d.name || d.summary || d.text || JSON.stringify(d).slice(0, 120)),
    text: strip(d.description || d.summary || d.text || '').slice(0, 600), url: d.url || d.link || d.html_url || '', date: iso(d.date || d.published || d.created_at || d.created || '') }));
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
