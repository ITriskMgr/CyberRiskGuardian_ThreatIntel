/* anon.js — anonymization of registry packages before they are published or shared (1.4.0).
   Replaces the organization's names, people's names, asset names, e-mail addresses, IP addresses, internal host
   names and domains, URLs, phone numbers and postal codes with stable placeholders; optionally generalizes
   amounts and dates, and drops free-text fields. Identifiers that carry no organizational information —
   ATT&CK, CWE, CVE, CAPEC, control identifiers, parameters — are kept so the package stays useful.
   The re-identification table stays on this computer. Review the preview: automatic anonymization reduces,
   but does not eliminate, the risk of re-identification. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

export const DEFAULT_OPTS = { enabled: true, org: true, people: true, assets: true, network: true, contact: true, amounts: true, dates: false, dropText: false, region: true, custom: '' };
export const OPT_LABEL = {
  org: 'Organization names → “Organization A”', people: 'People\'s names (owners, members, instructor) → “Person 1…”', assets: 'Asset names → “Asset A01 (type)”',
  network: 'IP addresses, internal host names, domains and URLs (public references kept)', contact: 'E-mail addresses, phone numbers, postal codes',
  amounts: 'Money amounts → ranges', dates: 'Dates → month only', dropText: 'Drop free-text fields (rationale, evidence, notes, narrative)', region: 'Region → country only',
};
const KEEP_HOSTS = /(^|\.)(mitre\.org|nist\.gov|cve\.org|first\.org|cisa\.gov|cyber\.gc\.ca|ncsc\.gov\.uk|github\.com|abuse\.ch|sans\.edu|alienvault\.com|microsoft\.com|cwe\.mitre\.org|attack\.mitre\.org|epss\.empiricalsecurity\.com|iso\.org|cisecurity\.org)$/i;
const TEXT_KEYS = new Set(['rat', 'ev', 'evidence', 'rationale', 'notes', 'note', 'narrative', 'desc_private', 'acceptance_note', 'cvss_note', 'history']);
const ROLE_WORDS = /\b(lead|manager|officer|director|team|operations|ciso|cio|cto|ceo|owner|administrator|admin|architect|security|it|hr|privacy|procurement|facilities|board|committee|vendor|supplier|department|service|desk|analyst|engineer|head|chief|responsible|dpo|soc)\b/i;
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const looksLikeName = s => /^[A-ZÀ-Ý][a-zà-ÿ'’-]+(?:[ -][A-ZÀ-Ý][a-zà-ÿ'’-]+){1,3}$/.test(String(s).trim()) && !ROLE_WORDS.test(s);

/** Build the replacement context from the workspace. */
export function context(ws, opts) {
  const repl = []; // [regex, replacement, kind]
  const map = {};  // original → placeholder, kept locally
  const add = (orig, rep, kind) => { orig = String(orig || '').trim(); if (orig.length < 3 || map[orig]) return; map[orig] = rep; repl.push([new RegExp('(?<![\\w])' + esc(orig) + '(?![\\w])', 'gi'), rep, kind]); };
  if (opts.org) {
    const names = [ws.org?.name, ws.name, ws.classroom?.team, ws.classroom?.case_title].filter(Boolean);
    for (const n of names) {
      const clean = n.replace(/\s*[—–-]\s*.*$/, '').replace(/\(.*?\)/g, '').trim();
      add(n, 'Organization A', 'organization'); add(clean, 'Organization A', 'organization');
      const first = clean.split(/\s+/)[0]; if (first && first.length >= 4 && /^[A-Z]/.test(first)) add(first, 'Organization A', 'organization');
    }
    for (const a of String(ws.org?.aliases || '').split(/[,;\n]/)) add(a, 'Organization A', 'organization');
  }
  if (opts.people) {
    let n = 0;
    const people = new Set();
    const owners = [...ws.assessment.SCEN.map(s => s.owner), ...(ws.measures || []).map(m => m.owner), ...(ws.risks || []).flatMap(r => [r.owner, r.acceptance?.by]),
      ...(ws.assets || []).flatMap(a => [a.owner, a.custodian]), ws.classroom?.instructor, ...String(ws.classroom?.members || '').split(/[,;\n]/)];
    for (const o of owners) if (o && looksLikeName(o)) people.add(o.trim());
    for (const p of people) add(p, 'Person ' + (++n), 'person');
  }
  if (opts.assets) {
    (ws.assets || []).forEach((a, i) => { if (a.name && a.name.length >= 4) add(a.name, `Asset A${String(i + 1).padStart(2, '0')} (${a.type || 'asset'})`, 'asset'); if (a.hostname) add(a.hostname, `host-${String(i + 1).padStart(2, '0')}`, 'network'); });
  }
  for (const line of String(opts.custom || '').split('\n')) {
    const m = /^(.+?)\s*(?:=>|→|=)\s*(.*)$/.exec(line.trim());
    if (m) add(m[1], m[2] || '[redacted]', 'custom'); else if (line.trim()) add(line.trim(), '[redacted]', 'custom');
  }
  repl.sort((a, b) => b[0].source.length - a[0].source.length);
  return { repl, map, counts: {}, ips: {}, hosts: {}, mails: {} };
}

function money(x) {
  const v = Number(x); if (!Number.isFinite(v) || v === 0) return v;
  const bands = [1e4, 5e4, 1e5, 2.5e5, 5e5, 1e6, 2.5e6, 5e6, 1e7, 5e7, 1e8, 1e9];
  const k = n => n >= 1e6 ? (n / 1e6) + 'M' : n >= 1e3 ? (n / 1e3) + 'k' : String(n);
  let lo = 0; for (const b of bands) { if (v < b) return `${k(lo)}–${k(b)}`; lo = b; }
  return `> ${k(lo)}`;
}
const MONEY_KEYS = new Set(['initial', 'recurring', 'cost', 'y1', 'it_budget', 'spend', 'baseline', 'actual', 'revenue_hour', 'value']);

export function text(s, ctx, opts) {
  if (typeof s !== 'string' || !s) return s;
  const bump = k => { ctx.counts[k] = (ctx.counts[k] || 0) + 1; };
  for (const [rx, rep, kind] of ctx.repl) s = s.replace(rx, () => { bump(kind); return rep; });
  if (opts.contact) {
    s = s.replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, m => { bump('email'); return ctx.mails[m] ||= 'user' + (Object.keys(ctx.mails).length + 1) + '@example.org'; });
    s = s.replace(/(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g, () => { bump('phone'); return '[phone]'; });
    s = s.replace(/\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/gi, () => { bump('postal'); return '[postal code]'; });
  }
  if (opts.network) {
    s = s.replace(/https?:\/\/[^\s)"'<>]+/g, u => { let h = ''; try { h = new URL(u).hostname; } catch { /* keep */ } if (KEEP_HOSTS.test(h)) return u; bump('url'); return '[internal URL]'; });
    s = s.replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g, m => { bump('ip'); return ctx.ips[m] ||= `[IP-${Object.keys(ctx.ips).length + 1}]`; });
    s = s.replace(/\b(?:[a-z0-9-]+\.)+(?:local|lan|corp|internal|intra|ad|qc\.ca|ca|com|org|net|io|med)\b/gi, m => {
      if (KEEP_HOSTS.test(m) || /\.(js|json|py|md|csv|xlsx|docx|pdf)$/i.test(m) || /^(crg|kb|sample|threat|cvss4)\./i.test(m)) return m;
      bump('host'); return ctx.hosts[m.toLowerCase()] ||= `host-${Object.keys(ctx.hosts).length + 1}.example`;
    });
  }
  if (opts.dates) s = s.replace(/\b(\d{4}-\d{2})-\d{2}(T[\d:.]+Z?)?\b/g, '$1');
  return s;
}

/** Deep-copy obj with every string anonymized, money generalized, free text optionally dropped. */
export function walk(obj, ctx, opts, key = '') {
  if (!opts.enabled) return obj;
  if (Array.isArray(obj)) return obj.map(x => walk(x, ctx, opts, key));
  if (obj && typeof obj === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(obj)) {
      if (opts.dropText && TEXT_KEYS.has(k)) continue;
      if (opts.amounts && MONEY_KEYS.has(k) && typeof v === 'number') { o[k] = money(v); continue; }
      o[k] = walk(v, ctx, opts, k);
    }
    return o;
  }
  if (typeof obj === 'string') {
    if (opts.region && key === 'region') return generalizeRegion(obj);
    return text(obj, ctx, opts);
  }
  return obj;
}
function generalizeRegion(r) {
  const s = r.toLowerCase();
  if (/canada|quebec|québec|ontario|montreal|montréal|british columbia|alberta/.test(s)) return 'Canada';
  if (/united states|usa|\bus\b|california|new york|texas/.test(s)) return 'United States';
  if (/france|paris/.test(s)) return 'France';
  return r.split(',').pop().trim();
}
export function summary(ctx) {
  return Object.entries(ctx.counts).map(([k, n]) => `${n} ${k}`).join(' · ') || 'no replacement';
}
