/* anon.js — anonymization of registry packages and AI payloads before they leave this computer (1.4.0; rebuilt in 1.9.2).
   Replaces the organization's names, people's names, asset names, e-mail addresses, IP addresses (v4 and v6), MAC
   addresses, internal host names (DNS, NetBIOS, UNC paths), domains, URLs, phone numbers, postal codes, personal
   and reference numbers with stable placeholders; optionally generalizes amounts and dates, and drops free-text
   fields. Identifiers that carry no organizational information — ATT&CK, CWE, CVE, CAPEC, control identifiers,
   parameters — are kept so the package stays useful.
   1.9.2 (NV-005, NV-006, NV-026, NV-089, NV-098): every value of a people field is a person whatever its shape
   (O'Brien, McDonald, "Dr." prefixes, "(CISO)" suffixes, lower-case names), the technical passes (e-mail, URL, host,
   address) run before the name replacements so that local parts and host labels cannot survive a partial
   replacement, every replacement is inserted as a token so no later pass re-reads another pass's output, and the
   residual check reads the replacement table itself. The preview lists the name-like pairs and acronyms it could
   not attribute, for the analyst to add.
   The re-identification table stays on this computer. Review the preview: automatic anonymization reduces,
   but does not eliminate, the risk of re-identification. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

import { ROLE_WORDS, TITLE_RX, TLDS, TECH_WORDS, ORG_WORDS, SAFE_ACRONYMS, CAP, NAME_PAIR, NAME_CUE_RX, KEEP_HOSTS, FILE_EXT, NETBIOS_RX, REF_RX, USER_CUE_RX, CODENAME_RX, splitPeople } from './data/anon-words.js';

export const DEFAULT_OPTS = { enabled: true, org: true, people: true, assets: true, network: true, contact: true, amounts: true, dates: false, dropText: false, region: true, custom: '' };
export const OPT_LABEL = {
  org: 'Organization names and acronym → “Organization A”', people: 'People\'s names (owners, custodians, approvers, members, instructor, users) and user names → “Person 1…”',
  assets: 'Asset names → “Asset A01 (type)”',
  network: 'IP addresses (v4, v6), MAC addresses, internal host names (DNS, NetBIOS, UNC paths), domains and URLs (public references kept)',
  contact: 'E-mail addresses, phone numbers, postal codes, personal and reference numbers (file, employee, ticket)',
  amounts: 'Money amounts → ranges', dates: 'Dates → month only', dropText: 'Drop free-text fields (rationale, evidence, notes, narrative, stakeholders, review notes, descriptions)', region: 'Region → country only',
};
/* 1.9.2 — free text that may name people or describe the organization indirectly (NV-089). */
const TEXT_KEYS = new Set(['rat', 'ev', 'evidence', 'rationale', 'notes', 'note', 'narrative', 'desc_private', 'acceptance_note', 'cvss_note', 'history',
  'stakeholders', 'review', 'threat_description', 'threatText', 'description', 'desc', 'exposure', 'background', 'why']);
/* People fields (NV-005): every value is a person, whatever its shape. */
const PEOPLE_KEYS = new Set(['owner', 'custodian', 'accountable', 'approver', 'approvedBy', 'approved_by', 'requestedBy', 'acceptedBy', 'submittedBy', 'confirmedBy',
  'author', 'sponsor', 'by', 'who', 'instructor', 'decisionMaker', 'reviewer', 'assessor', 'requester', 'contact', 'members', 'consulted', 'informed', 'assignee', 'analyst']);
const SKIP_KEYS = new Set(['published', 'crgo', 'snapshot', 'consultant', 'aiLog', 'docs', 'kb', 'premig', 'catalogueMigration']);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Two to four capitalized words, O'/Mc/Mac/accents/hyphens allowed, no role word: the 1.4.0 test, kept for the register validation. */
export const looksLikeName = s => /^[A-ZÀ-Ý](?:[a-zà-ÿ'’-]+|c[A-Z][a-zà-ÿ]+|'[A-Z][a-zà-ÿ]+)(?:[ -][A-ZÀ-Ý](?:[a-zà-ÿ'’-]+|c[A-Z][a-zà-ÿ]+|'[A-Z][a-zà-ÿ]+)){1,3}$/.test(bareName(String(s))) && !ROLE_WORDS.test(bareName(String(s)));
/** The name without its title, parenthesised role or trailing ", role" (NV-005). */
export function bareName(v) {
  let s = String(v || '').trim().replace(/\s+/g, ' ');
  s = s.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s*\[.*?\]\s*/g, ' ').trim();
  s = s.replace(TITLE_RX, '').trim();
  const parts = s.split(/\s*[,—–|/]\s*/);
  if (parts.length > 1 && parts.slice(1).every(p => !p || ROLE_WORDS.test(p) || !/[a-zà-ÿ]/i.test(p))) s = parts[0];
  s = s.replace(/\s*[-–—]\s*(?:[^-–—]*\b(?:ciso|cio|cto|ceo|cfo|coo|dpo|director|directeur|directrice|manager|gestionnaire|officer|lead|head|chief)\b[^-–—]*)$/i, '').trim();
  return s;
}
/** A value of a people field that is not a person: empty, a role only ("IT", "Security team"), or a placeholder. */
// 1.9.3 (W3): a record identifier (C01, P07, CJ8, E6) listed in a "members" field is not a person's name — the family requests need their ids to survive
const notAPerson = s => !s || s.length < 3 || /^[A-Z]{1,3}-?\d{1,5}$/.test(s) || !/[a-zà-ÿ]/i.test(s) || s.split(/\s+/).every(w => ROLE_WORDS.test(w)) || /^(person|personne)\s*\d+$/i.test(s) || /^(organization|organisation)\s+[a-z]$/i.test(s);
/** The pieces of a people-field value: "A, B and C" → [A, B, C]. */

let USERS = null;
import('./users.js').then(m => { USERS = m; }).catch(() => { USERS = null; });

/** Every person named in a people field of the workspace (and the application's user accounts). */
export function peopleOf(ws) {
  const out = new Set();
  const take = v => { for (const piece of splitPeople(v)) { const bare = bareName(piece); if (!notAPerson(bare)) { out.add(bare); const full = piece.trim(); if (full !== bare && full.length >= 3) out.add(full); } } };
  const seen = new Set();
  const visit = (o, depth) => {
    if (!o || typeof o !== 'object' || depth > 8 || seen.has(o)) return;
    seen.add(o);
    if (Array.isArray(o)) { for (const x of o) visit(x, depth + 1); return; }
    for (const [k, v] of Object.entries(o)) {
      if (SKIP_KEYS.has(k)) continue;
      if (PEOPLE_KEYS.has(k)) { if (typeof v === 'string') take(v); else if (Array.isArray(v)) v.forEach(x => typeof x === 'string' ? take(x) : visit(x, depth + 1)); else if (v && typeof v === 'object') { if (typeof v.name === 'string') take(v.name); visit(v, depth + 1); } }
      else if (v && typeof v === 'object') visit(v, depth + 1);
    }
  };
  visit(ws, 0);
  for (const u of USERS?.U?.users || []) if (u?.name) take(u.name);
  for (const g of USERS?.U?.groups || []) for (const m of g?.members || []) if (typeof m === 'string') take(m);
  return [...out];
}

/** Upper-case tokens of the workspace text that read as an acronym of the organization's name (NV-089): the first
    letter opens the name, the last letter opens one of its words, every letter appears in order ("NWS" for Northwind Santé). */
export function orgAcronyms(ws, clean) {
  const name = String(clean || '').toLowerCase();
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length < 1 || name.length < 4) return [];
  const initials = new Set(words.map(w => w[0]));
  let blob = '';
  try { blob = JSON.stringify(ws, (k, v) => SKIP_KEYS.has(k) ? undefined : v); } catch { return []; }
  const out = new Set();
  for (const m of blob.matchAll(/(?<![\p{L}\p{N}])[A-Z]{3,6}(?![\p{L}\p{N}])/gu)) {
    const t = m[0]; if (SAFE_ACRONYMS.has(t) || out.has(t)) continue;
    const l = t.toLowerCase();
    if (l[0] !== words[0][0] || !initials.has(l[l.length - 1])) continue;
    let i = 0, ok = true;
    for (const ch of l) { i = name.indexOf(ch, i); if (i < 0) { ok = false; break; } i++; }
    if (ok) out.add(t);
  }
  return [...out];
}

/** Build the replacement context from the workspace. */
export function context(ws, opts) {
  const repl = []; // [regex, replacement, kind]
  const map = {};  // original → placeholder, kept locally
  const add = (orig, rep, kind, { ci = true } = {}) => {
    orig = String(orig || '').trim(); if (orig.length < 3 || map[orig]) return;
    map[orig] = rep;
    repl.push([new RegExp('(?<![\\p{L}\\p{N}_])' + esc(orig) + '(?![\\p{L}\\p{N}_])', ci ? 'giu' : 'gu'), rep, kind]);
  };
  if (opts.org) {
    const names = [ws.org?.name, ws.name, ws.classroom?.team, ws.classroom?.case_title].filter(Boolean);
    for (const n of names) {
      const clean = n.replace(/\s*[—–-]\s*.*$/, '').replace(/\(.*?\)/g, '').trim();
      add(n, 'Organization A', 'organization'); add(clean, 'Organization A', 'organization');
      const words = clean.split(/\s+/).filter(w => /^\p{Lu}/u.test(w) && !/^(inc|ltd|ltée|llc|corp|co|sa|sarl|gmbh|plc|the|le|la|les|de|du|des|et|and|of|group|groupe)\.?$/i.test(w));
      const first = words[0]; if (first && first.length >= 4) add(first, 'Organization A', 'organization');
      // the acronym of the name (NV-089): "Northwind Santé Inc." → NSI and NS; two-letter acronyms only as whole upper-case tokens
      const acr = words.map(w => w[0]).join('').toUpperCase();
      if (acr.length >= 3) add(acr, 'Organization A', 'organization', { ci: false });
      if (acr.length >= 4) add(acr.slice(0, acr.length - 1), 'Organization A', 'organization', { ci: false });
      for (const a of orgAcronyms(ws, clean)) add(a, 'Organization A', 'organization', { ci: false });
    }
    for (const a of String(ws.org?.aliases || '').split(/[,;\n]/)) add(a, 'Organization A', 'organization');
  }
  if (opts.people) {
    let n = 0;
    const people = peopleOf(ws).sort((a, b) => b.length - a.length);
    const byBare = {};
    for (const p of people) {
      const bare = bareName(p);
      const rep = byBare[bare.toLowerCase()] || (byBare[bare.toLowerCase()] = 'Person ' + (++n));
      add(p, rep, 'person'); add(bare, rep, 'person');
      const w = bare.toLowerCase().split(/[\s-]+/).filter(Boolean);
      if (w.length >= 2) {   // the user names and e-mail local parts derived from the name
        const f = w[0].replace(/[^a-z0-9]/g, ''), l = w[w.length - 1].replace(/[^a-z0-9]/g, '');
        if (f && l) for (const u of [`${f}.${l}`, `${f[0]}${l}`, `${f}_${l}`, `${f}${l}`, `${l}.${f}`, `${f[0]}.${l}`]) if (u.length >= 5) add(u, rep.toLowerCase().replace(' ', ''), 'person');
      }
    }
  }
  if (opts.assets) {
    (ws.assets || []).forEach((a, i) => {
      const nn = String(i + 1).padStart(2, '0');
      if (a.name && a.name.length >= 4) add(a.name, `Asset A${nn} (${a.type || 'asset'})`, 'asset');
      for (const h of String(a.hostname || '').split(/[,;\s]+/)) if (h.length >= 3) add(h, `host-a${nn}`, 'network');
      for (const h of String(a.ip || '').split(/[,;\s]+/)) if (h.length >= 3) add(h, `[IP-a${nn}]`, 'network');
      for (const h of String(a.url || '').split(/[,;\s]+/)) if (h.length >= 6) add(h, '[internal URL]', 'network');
    });
    // IAM / CM scopes name systems and hosts (NV-026)
    for (const r of [...(ws.cm?.ciScopes || []), ...(ws.cm?.baselines || []), ...(ws.iam?.accounts || []), ...(ws.iam?.privileged || [])])
      for (const k of ['hostname', 'host', 'hosts', 'ip', 'system', 'systems']) for (const h of String(r?.[k] || '').split(/[,;\s]+/)) if (/[a-z]/i.test(h) && /[\d.-]/.test(h) && h.length >= 4) add(h, 'host-' + (Object.keys(map).length + 1), 'network');
  }
  // the analyst's additional terms: the options' own list, else the workspace's (anonTerms, 1.9.2) — so AI payloads get them too
  for (const line of String(opts.custom || ws.anonTerms || '').split('\n')) {
    const m = /^(.+?)\s*(?:=>|→|=)\s*(.*)$/.exec(line.trim());
    if (m) add(m[1], m[2] || '[redacted]', 'custom'); else if (line.trim()) add(line.trim(), '[redacted]', 'custom');
  }
  repl.sort((a, b) => b[0].source.length - a[0].source.length);
  return { repl, map, counts: {}, ips: {}, hosts: {}, mails: {}, free: {}, nFree: 0 };
}

function money(x) {
  const v = Number(x); if (!Number.isFinite(v) || v === 0) return v;
  const bands = [1e4, 5e4, 1e5, 2.5e5, 5e5, 1e6, 2.5e6, 5e6, 1e7, 5e7, 1e8, 1e9];
  const k = n => n >= 1e6 ? (n / 1e6) + 'M' : n >= 1e3 ? (n / 1e3) + 'k' : String(n);
  let lo = 0; for (const b of bands) { if (v < b) return `${k(lo)}–${k(b)}`; lo = b; }
  return `> ${k(lo)}`;
}
const MONEY_KEYS = new Set(['initial', 'recurring', 'cost', 'y1', 'it_budget', 'spend', 'baseline', 'actual', 'revenue_hour', 'value']);

/* ---------------- the technical patterns (NV-006, NV-026) ---------------- */
const EMAIL_RX = /[\p{L}\p{N}.+_-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu;
const URL_RX = /\b(?:https?|ftps?|sftp|smb|ldaps?|rdp|ssh|vnc):\/\/[^\s)"'<>\]]+/gi;
const UNC_RX = /\\\\[\p{L}\p{N}._$-]{2,}(?:\\[^\s\\"'<>|]+)*\\?/gu;
const IPV6_RX = /(?<![\p{L}\p{N}:.])(?:(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){1,7}:(?:[0-9a-f]{1,4}(?::[0-9a-f]{1,4}){0,6})?|::(?:[0-9a-f]{1,4}(?::[0-9a-f]{1,4}){0,6}))(?:\/\d{1,3})?(?![\p{L}\p{N}:.])/giu;
const MAC_RX = /\b(?:[0-9A-F]{2}[:-]){5}[0-9A-F]{2}\b|\b(?:[0-9A-F]{4}\.){2}[0-9A-F]{4}\b/gi;
const IPV4_RX = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\/\d{1,2})?(?::\d{1,5})?\b/g;
const HOST_RX = new RegExp('(?<![\\p{L}\\p{N}@/._-])(?:[a-z0-9](?:[a-z0-9_-]{0,62})\\.)+' + TLDS + '(?![\\p{L}\\p{N}_-])(?:\\.(?![\\p{L}\\p{N}]))?', 'giu');
const E164_RX = /(?<![\p{L}\p{N}])\+\d{1,3}(?:[\s.-]?\(?\d{1,4}\)?){2,5}(?![\p{L}\p{N}])/gu;
const NANP_RX = /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g;
const POSTAL_RX = /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/gi;
const DOTTED_USER_RX = /\b[a-z]{2,}\.[a-z]{3,}\b(?![.-]?[a-z])/g;
/* Free-text names (NV-089): a capitalized pair with a cue — a title, a role in brackets, or "with/by/led by…" — and no technology or role word. */
/* The ATT&CK, CWE and mitigation vocabulary of the bundled knowledge base (kb.js, self.CRG_KB): a capitalized pair made only of
   those words ("Removable Media", "Valid Accounts") is a technique, not a person. Built once, on first use. */
let KBWORDS = null;
const kbWords = () => {
  if (KBWORDS) return KBWORDS;
  KBWORDS = new Set();
  const KB = (typeof self !== 'undefined' && self.CRG_KB) || null;
  const takeWords = t => { for (const w of String(t || '').toLowerCase().split(/[^\p{L}]+/u)) if (w.length >= 2) KBWORDS.add(w); };
  if (KB) {
    for (const t of Object.values(KB.tech || {})) { takeWords(t.n || t.name); takeWords(t.fullName); }
    for (const m of Object.values(KB.mit || {})) takeWords(m.n);
    for (const c of Object.values(KB.cwe || {})) takeWords(c.n || c.name);
    for (const t of KB.tactics || []) takeWords(t[2]);
  }
  return KBWORDS;
};
/* Words that make a capitalized pair an organization, a product or a place rather than a person (listed in the preview, never replaced as a person). */
const pairOk = s => { const w = s.toLowerCase().split(/[\s-]+/); if (w.length < 2 || w.some(x => TECH_WORDS.has(x) || ROLE_WORDS.test(x))) return false; const kb = kbWords(); return !w.every(x => kb.has(x)); };
const nameOk = s => pairOk(s) && !s.toLowerCase().split(/[\s-]+/).some(x => ORG_WORDS.has(x));

/* Replacements are inserted as private-use tokens and resolved at the end: no pass ever reads another pass's output,
   and nothing already replaced (or deliberately kept) is matched again. */
const TOK = (i) => `${i}`;
const TOK_RX = /(\d+)/g;

export function text(s, ctx, opts) {
  if (typeof s !== 'string' || !s) return s;
  const bump = k => { ctx.counts[k] = (ctx.counts[k] || 0) + 1; };
  const slots = [];
  const put = v => { slots.push(v); return TOK(slots.length - 1); };
  // 0 · public references are kept whole (and never re-read by the host or user-name patterns)
  s = s.replace(URL_RX, u => { let h = ''; try { h = new URL(u).hostname; } catch { /* keep */ } if (KEEP_HOSTS.test(h)) return put(u); if (!opts.network) return u; bump('url'); return put('[internal URL]'); });
  // 1 · contact and network passes first (NV-006): local parts and host labels never survive a partial replacement
  if (opts.contact) {
    s = s.replace(EMAIL_RX, m => { if (/@example\.(org|com|net)$/i.test(m)) return put(m); bump('email'); return put(ctx.mails[m.toLowerCase()] ||= 'user' + (Object.keys(ctx.mails).length + 1) + '@example.org'); });
  }
  if (opts.network) {
    s = s.replace(UNC_RX, () => { bump('unc'); return put('[UNC path]'); });
    s = s.replace(MAC_RX, () => { bump('mac'); return put('[MAC address]'); });
    s = s.replace(IPV6_RX, m => { bump('ip'); return put(ctx.ips[m.toLowerCase()] ||= `[IP-${Object.keys(ctx.ips).length + 1}]`); });
    s = s.replace(IPV4_RX, m => { const base = m.split(/[/:]/)[0]; bump('ip'); return put((ctx.ips[base] ||= `[IP-${Object.keys(ctx.ips).length + 1}]`) + (m.includes('/') ? '/' + m.split('/')[1].split(':')[0] : '')); });
    s = s.replace(HOST_RX, m => {
      const h = m.replace(/\.$/, '');
      const first = h.split('.')[0];
      if (KEEP_HOSTS.test(h) || FILE_EXT.test(h) || /^(crg|kb|sample|threat|cvss4|host-\w+|user\d+)\./i.test(h) || first.length < 2 || !/[a-z]/i.test(first) || /^(p\.ex|e\.g|i\.e|etc|cf|vs|no|nos|art|al|ex|eg|ie|ph\.d|m\.sc|b\.sc|et\.al|a\.m|p\.m)$/i.test(h)) return m;
      bump('host'); return put((ctx.hosts[h.toLowerCase()] ||= `host-${Object.keys(ctx.hosts).length + 1}.example`) + (m.endsWith('.') ? '.' : ''));
    });
    s = s.replace(NETBIOS_RX, m => { bump('host'); return put(ctx.hosts[m.toLowerCase()] ||= `host-${Object.keys(ctx.hosts).length + 1}`); });
  }
  if (opts.contact) {
    s = s.replace(E164_RX, () => { bump('phone'); return put('[phone]'); });
    s = s.replace(NANP_RX, () => { bump('phone'); return put('[phone]'); });
    s = s.replace(POSTAL_RX, () => { bump('postal'); return put('[postal code]'); });
    s = s.replace(REF_RX, () => { bump('reference'); return put('[reference]'); });
  }
  // 2 · the replacement table: organization, people, assets, custom terms (longest first)
  for (const [rx, rep, kind] of ctx.repl) s = s.replace(rx, () => { bump(kind); return put(rep); });
  // project and programme code names (NV-089): "Project Bluefin" → "Project [codename]"
  if (opts.org) s = s.replace(CODENAME_RX, (m, cue, name) => { if (TECH_WORDS.has(name.toLowerCase()) || ROLE_WORDS.test(name)) return m; bump('codename'); return cue + put('[codename]'); });
  // 3 · people named in free text with a cue, and user names (NV-089, NV-026)
  if (opts.people) {
    s = s.replace(NAME_CUE_RX, (m, a, b, c) => {
      const name = a || b || c; if (!name || !nameOk(name)) return m;
      const key = name.toLowerCase();
      const rep = ctx.free[key] || (ctx.free[key] = 'Person F' + (++ctx.nFree));
      ctx.map[name] ||= rep; bump('person');
      return m.replace(name, put(rep));
    });
    s = s.replace(USER_CUE_RX, (m, u) => { if (/^(?:person\d+|user\d+)$/.test(u)) return m; bump('username'); return m.slice(0, m.length - u.length) + put('[username]'); });
    s = s.replace(DOTTED_USER_RX, m => { if (FILE_EXT.test(m) || /^(e\.g|i\.e|etc|vs|cf|ex|p\.ex|env|www)\b/i.test(m) || /^(person\d+|user\d+)$/i.test(m) || /\.(js|py|md|ca|com|org|net|io|ch|fr|uk|us|gov|edu|example|local|lan|exe|dll|txt|log|csv|json|xml|yml|yaml|html|pdf|doc|docx|xls|xlsx|zip|gz)$/i.test(m)) return m; bump('username'); return put('[username]'); });
  }
  if (opts.dates) s = s.replace(/\b(\d{4}-\d{2})-\d{2}(T[\d:.]+Z?)?\b/g, '$1');
  // 4 · resolve the tokens (nested tokens are not possible: a token is never matched by any pattern above)
  return s.replace(TOK_RX, (_, i) => slots[+i]);
}

/** Deep-copy obj with every string anonymized, money generalized, free text optionally dropped. */
export function walk(obj, ctx, opts, key = '') {
  if (!opts.enabled) return obj;
  if (Array.isArray(obj)) return obj.map(x => walk(x, ctx, opts, key));
  if (obj && typeof obj === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(obj)) {
      if (opts.dropText && TEXT_KEYS.has(k) && (typeof v === 'string' || Array.isArray(v))) continue;
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

/* ---------------- the residual check (NV-005: reads the replacement table) ---------------- */
/** Terms of the replacement table (organization, people, assets, hosts, custom) still present in the output text. */
export function residual(out, ctx) {
  const t = String(out || '').toLowerCase();
  const found = [];
  for (const k of Object.keys(ctx?.map || {})) {
    const key = k.toLowerCase(); if (key.length < 3) continue;
    // a term is "present" as a whole word (a four-letter acronym inside a longer word is not a leak)
    const rx = new RegExp('(?<![\\p{L}\\p{N}_])' + esc(key) + '(?![\\p{L}\\p{N}_])', 'u');
    if (rx.test(t)) found.push(k);
  }
  return [...new Set(found)];
}
/** Name-like pairs and acronyms in the output that no replacement covers — for the preview, so the analyst can add them (NV-089). */
export function nameLike(out, ctx) {
  const s = String(out || '');
  const known = new Set(Object.keys(ctx?.map || {}).map(k => k.toLowerCase()));
  const pairs = new Map(), acronyms = new Map();
  const pairRx = new RegExp(`(?<![\\p{L}\\p{N}'’-])${CAP}(?:[ -]${CAP}){1,2}(?![\\p{L}\\p{N}])`, 'gu');
  for (const m of s.matchAll(pairRx)) {
    const v = m[0].trim();
    if (known.has(v.toLowerCase()) || !pairOk(v) || /^(Person|Organization|Asset|Analytical|Information|Management)\b/.test(v)) continue;
    if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(v) && /^(The|This|That|Each|Every|Some|Any|All|No|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|New|Old|First|Second|Third|Last|Next|If|When|While|Before|After|During|Since|Until|Because|Although|However|Therefore|Also|Then|Thus|Hence|Both|Either|Neither|Such|Other|Another|Most|Many|Few|Several|Various|Le|La|Les|Un|Une|Des|Ce|Cette|Ces|Si|Quand|Lorsque|Après|Avant|Pendant|Depuis|Chaque|Tout|Toute|Tous|Toutes|Aucun|Aucune|Plusieurs|Certains|Certaines|Autre|Autres)$/.test(v.split(' ')[0])) continue;
    pairs.set(v, (pairs.get(v) || 0) + 1);
  }
  for (const m of s.matchAll(/(?<![\p{L}\p{N}-])[A-Z]{3,6}(?![\p{L}\p{N}-])/gu)) {
    const v = m[0]; if (SAFE_ACRONYMS.has(v) || known.has(v.toLowerCase()) || !/[A-Z]{2}/.test(v) || s[m.index - 1] === '[' || s[m.index + v.length] === ':' || s.slice(m.index + v.length, m.index + v.length + 2) === '":') continue;
    acronyms.set(v, (acronyms.get(v) || 0) + 1);
  }
  return { pairs: [...pairs.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => ({ term: t, n })), acronyms: [...acronyms.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => ({ term: t, n })) };
}
