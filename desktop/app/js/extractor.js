/* extractor.js — extraction of the organization profile and the crown jewels from the workspace's
   context documents (1.5.2).

   Two methods, same output:
   - AI (through the helper, preview before sending): reads the documents and returns every field as
     a short, normalized value with a provenance tag; with the Claude provider it may search the web
     for missing information (EXTERNAL, with the page cited). With a local model, missing items are
     ASSUMPTION or UNKNOWN only.
   - Rules (no AI, offline): keyword sentences and the context hints; anything not found is UNKNOWN.

   Provenance tags (kept with every accepted value):
     FACT        explicitly contained in the source material
     INFERENCE   analytically derived from one or more facts
     ASSUMPTION  plausible initial value introduced because information is missing
     EXTERNAL    obtained from external evidence (web), with its source
     UNKNOWN     material information still requiring collection
   Values are normalized for AI ingestion: at most 50 words, noun phrases separated by semicolons,
   numbers as plain digits, appetite 0.1–0.9, currency as an ISO 4217 code. Nothing is applied until
   the person accepts it. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, docText } from './state.js';
import * as AI from './ai.js';
import { hints } from './extract.js';

export const TAGS = ['FACT', 'INFERENCE', 'ASSUMPTION', 'EXTERNAL', 'UNKNOWN'];
export const TAG_HELP = {
  FACT: 'Explicitly contained in the source material', INFERENCE: 'Analytically derived from one or more facts',
  ASSUMPTION: 'Plausible initial value introduced because information is missing', EXTERNAL: 'Obtained from external evidence',
  UNKNOWN: 'Material information still requiring collection' };
export const TAG_KIND = { FACT: 'good', INFERENCE: '', ASSUMPTION: 'warn', EXTERNAL: 'warn', UNKNOWN: 'bad' };

/** key, label, kind (text | list | number | appetite | currency), where it is stored. */
export const FIELDS = [
  ['context', 'Context', 'text'], ['mission', 'Mission', 'text'], ['services', 'Products and services', 'text'],
  ['processes', 'Critical business processes', 'text'], ['systems', 'Critical systems and applications', 'text'],
  ['cloud', 'Cloud environments', 'text'], ['suppliers', 'Key suppliers and partners', 'text'], ['sensitive', 'Sensitive information', 'text'],
  ['availability', 'Availability and continuity requirements', 'text'], ['maturity', 'Existing controls and maturity', 'text'],
  ['incidents', 'Incident history', 'text'], ['regulations', 'Legal and regulatory obligations', 'list'],
  ['appetite', 'Risk appetite', 'appetite'], ['appetite_rationale', 'Appetite rationale', 'text'], ['currency', 'Currency', 'currency'],
  ['it_budget', 'Total IT budget', 'number'], ['spend', 'Cybersecurity budget', 'number'], ['baseline', 'Baseline (run) security cost', 'number'],
  ['name', 'Organization name', 'text'], ['sector', 'Sector / industry', 'text'], ['size', 'Size', 'text'], ['region', 'Region / jurisdiction', 'text'],
];
export const LABEL = Object.fromEntries(FIELDS.map(([k, l]) => [k, l]));
const KIND = Object.fromEntries(FIELDS.map(([k, , t]) => [k, t]));

/* ---------------- reading and writing a profile draft ---------------- */
/** Value of a field in a draft {org, assessment, budget, appetite_rationale}. */
export function getField(d, k) {
  if (k === 'appetite') return d.assessment.APPETITE;
  if (k === 'currency') return d.assessment.CURRENCY;
  if (k === 'appetite_rationale') return d.appetite_rationale;
  if (['it_budget', 'spend', 'baseline'].includes(k)) return d.budget[k];
  return d.org[k];
}
export function setField(d, k, v) {
  if (k === 'appetite') d.assessment.APPETITE = Number(v);
  else if (k === 'currency') d.assessment.CURRENCY = v;
  else if (k === 'appetite_rationale') d.appetite_rationale = v;
  else if (['it_budget', 'spend', 'baseline'].includes(k)) d.budget[k] = v === '' ? '' : Number(v);
  else if (k === 'regulations') d.org.regulations = Array.isArray(v) ? v : String(v).split(/\s*;\s*/).filter(Boolean);
  else d.org[k] = v;
}
export const isEmpty = v => v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length) || (typeof v === 'number' && v === 0);

/** Normalize one proposed value: ≤ 50 words, types, ranges. */
export function normalize(k, raw) {
  const kind = KIND[k] || 'text';
  let value = raw?.value ?? raw ?? '';
  let tag = String(raw?.tag || '').toUpperCase().trim();
  if (!TAGS.includes(tag)) tag = isEmpty(value) ? 'UNKNOWN' : 'INFERENCE';
  const notes = [];
  if (kind === 'number') {
    const n = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.\-]/g, ''));
    value = Number.isFinite(n) && String(value).trim() !== '' ? Math.round(n) : '';
  } else if (kind === 'appetite') {
    const n = Number(value);
    value = Number.isFinite(n) && n > 0 ? Math.max(0.1, Math.min(0.9, Math.round(n * 100) / 100)) : '';
    if (Number.isFinite(n) && (n < 0.1 || n > 0.9)) notes.push('clamped to 0.1–0.9');
  } else if (kind === 'currency') {
    const m = /\b([A-Z]{3})\b/.exec(String(value).toUpperCase());
    value = m ? m[1] : /\$/.test(String(value)) ? 'CAD' : /€/.test(String(value)) ? 'EUR' : '';
  } else if (kind === 'list') {
    value = (Array.isArray(value) ? value : String(value).split(/\s*[;\n]\s*/)).map(x => String(x).trim()).filter(Boolean);
    const words = value.join(' ').split(/\s+/).filter(Boolean);
    if (words.length > 50) { notes.push('shortened to 50 words'); let c = 0; value = value.filter(x => (c += x.split(/\s+/).length) <= 50); }
  } else {
    value = String(value).replace(/\s+/g, ' ').trim();
    const w = value.split(' ').filter(Boolean);
    if (w.length > 50) { value = w.slice(0, 50).join(' ').replace(/[,;:]?$/, '…'); notes.push('shortened to 50 words'); }
  }
  if (isEmpty(value)) tag = 'UNKNOWN';
  return { key: k, value, tag, source: String(raw?.source || '').slice(0, 300), confidence: ['High', 'Medium', 'Low'].includes(raw?.confidence) ? raw.confidence : (tag === 'FACT' ? 'High' : tag === 'UNKNOWN' ? 'Low' : 'Medium'), notes };
}

/* ---------------- the document corpus ---------------- */
export async function corpus(ws = S.ws, max = 220000) {
  const docs = [];
  for (const d of ws.docs || []) docs.push({ name: d.name, cat: d.category, text: (await docText(d.id)) || '' });
  const per = Math.max(4000, Math.floor(max / Math.max(1, docs.length)));
  const parts = docs.filter(d => d.text.trim()).map(d => `### Document: ${d.name}${d.cat ? ` (${d.cat})` : ''}\n${d.text.length > per ? d.text.slice(0, per) + '\n[…truncated…]' : d.text}`);
  return { docs, text: parts.join('\n\n'), truncated: docs.some(d => d.text.length > per) };
}

/* ---------------- AI tasks ---------------- */
const RULES = `Provenance tag for every value, exactly one of:
FACT (explicitly in the documents), INFERENCE (derived from facts), ASSUMPTION (plausible value because the information is missing),
EXTERNAL (from external evidence, with its URL), UNKNOWN (still to collect — then value is empty).
Normalize every value for machine ingestion: at most 50 words, concise noun phrases separated by semicolons, no marketing language,
no full sentences except for "context" and "appetite_rationale". Numbers: plain digits, no separators and no currency sign.
Write each value in the language of the source documents. Never invent facts: a value not supported by the documents is ASSUMPTION,
EXTERNAL or UNKNOWN, never FACT.`;

AI.TASKS.extract_profile = {
  label: 'Profile extraction',
  build(ws, { text = '', web = false, fictional = false } = {}) {
    const fields = FIELDS.map(([k, l, t]) => `- ${k}: ${l}${t === 'number' ? ' (annual amount, digits only)' : t === 'appetite' ? ' (0.1–0.9: 0.1–0.2 very risk-averse, 0.3 low, 0.5 neutral, 0.7 high, 0.8–0.9 very high)' : t === 'currency' ? ' (ISO 4217 code)' : t === 'list' ? ' (JSON array of names)' : ''}`);
    const body = [
      'TASK: extract_profile',
      `Workspace: ${ws.name}${fictional ? ' — an educational / fictional business case' : ''}. Organization name if known: ${ws.org.name || '(not given)'}.`,
      '', 'Extract the organization profile from the documents below, for a cybersecurity risk assessment. Fields:', ...fields, '',
      'Definitions: "spend" is the current annual cybersecurity budget (everything spent on cybersecurity). "baseline" is the part of that spend needed just to keep',
      'existing security running — salaries of the current security staff, licence renewals, existing managed services, maintenance; it covers no new treatment.',
      '"appetite" is the cybersecurity risk appetite; justify it in "appetite_rationale" (industry, sensitivity, regulation, impact on individuals, financial capacity).',
      '', RULES, '',
      web ? (fictional
        ? 'You may use web search ONLY for sector benchmarks (e.g. IT budget as % of revenue, security spend as % of IT budget, typical regulations) — the organization itself is fictional. Tag such values EXTERNAL and give the URL in "source".'
        : 'For fields the documents do not cover, you may use web search for public information about this organization or, failing that, sector benchmarks. Tag such values EXTERNAL and give the URL in "source".')
        : 'Web search is not available: for fields the documents do not cover, propose a cautious ASSUMPTION (say why in "source") or leave the value empty with tag UNKNOWN.',
      '', 'Return JSON only:',
      '{"fields":{"<field key>":{"value":"…","tag":"FACT|INFERENCE|ASSUMPTION|EXTERNAL|UNKNOWN","source":"<document name and a short quote, or URL, or why it is assumed>","confidence":"High|Medium|Low"}},"gaps":["<what to collect, ≤ 12 words each>"]}',
      'Include every field key above, even when UNKNOWN.', '', 'DOCUMENTS:', text || '(no document text available)',
    ];
    return { system: AI_SYSTEM, prompt: body.join('\n'), max_tokens: 6000, json: true, web_search: web, keepLanguage: true };
  },
};
AI.TASKS.extract_crown = {
  label: 'Crown-jewel extraction',
  build(ws, { text = '', profile = '' } = {}) {
    const body = [
      'TASK: extract_crown',
      `Workspace: ${ws.name}. Organization: ${ws.org.name || '(not given)'}.`, profile ? 'Profile:\n' + profile : '',
      '', 'Identify the crown jewels: the assets, services, systems, data sets and processes whose loss or compromise would most harm the mission (at most 12).',
      'For each: name (short), role in the mission, owner (role, not a person, unless named in the documents), confidentiality / integrity / availability importance',
      '(Low, Medium, High, Very high), main dependencies, suppliers involved.', '', RULES, '',
      'Return JSON only:',
      '{"crown":[{"name":"","role":"","owner":"","c":"Low|Medium|High|Very high","i":"…","a":"…","dependencies":"","suppliers":"","tag":"FACT|INFERENCE|ASSUMPTION|EXTERNAL|UNKNOWN","source":""}]}',
      '', 'DOCUMENTS:', text || '(no document text available)',
    ].filter(x => x !== '');
    return { system: AI_SYSTEM, prompt: body.join('\n'), max_tokens: 5000, json: true, keepLanguage: true };
  },
};
const AI_SYSTEM = `You extract structured information for CyberRiskGuardian, a cybersecurity risk assessment tool.
You never invent organizational facts; every value carries a provenance tag and a source. You return JSON only.`;

export function parseProfile(text) {
  const j = AI.parseJson(text);
  const f = j.fields || j;
  const out = {};
  for (const [k] of FIELDS) out[k] = normalize(k, f[k] || {});
  return { fields: out, gaps: Array.isArray(j.gaps) ? j.gaps.slice(0, 20).map(String) : [] };
}
const LV = v => { const s = String(v || '').toLowerCase(); return /very/.test(s) ? 'Very high' : /high|élev/.test(s) ? 'High' : /med|moy/.test(s) ? 'Medium' : /low|faib/.test(s) ? 'Low' : ''; };
export function parseCrown(text) {
  const j = AI.parseJson(text);
  return (j.crown || j.crown_jewels || []).slice(0, 12).map(r => {
    const n = normalize('context', { value: r.role, tag: r.tag });
    return { name: String(r.name || '').trim().slice(0, 80), role: n.value, owner: String(r.owner || '').slice(0, 80), c: LV(r.c), i: LV(r.i), a: LV(r.a),
      dependencies: normalize('context', { value: r.dependencies }).value, suppliers: normalize('context', { value: r.suppliers }).value,
      tag: TAGS.includes(String(r.tag).toUpperCase()) ? String(r.tag).toUpperCase() : 'INFERENCE', source: String(r.source || '').slice(0, 300) };
  }).filter(r => r.name);
}

/* ---------------- rules (no AI) ---------------- */
const KW = {
  context: /\b(context|background|overview|about us|présentation|contexte)\b/i,
  mission: /\b(mission|vision|purpose|raison d'être)\b/i,
  services: /\b(services?|products?|offer|produits?|offre)\b/i,
  processes: /\b(process(es)?|operations|workflow|processus|opérations)\b/i,
  systems: /\b(system|application|EHR|ERP|CRM|platform|software|logiciel|système)\b/i,
  cloud: /\b(cloud|Azure|AWS|Google Cloud|Microsoft 365|Office 365|SaaS|infonuagique|nuage)\b/i,
  suppliers: /\b(supplier|vendor|provider|partner|outsourc|fournisseur|partenaire|sous-trait)/i,
  sensitive: /\b(personal|health|patient|confidential|sensitive|payment|PII|PHI|renseignements personnels|santé|confidentiel)\b/i,
  availability: /\b(availability|continuity|downtime|24\/7|RTO|RPO|disponibilité|continuité)\b/i,
  maturity: /\b(firewall|antivirus|MFA|backup|SOC|SIEM|EDR|IDS|IPS|encryption|policy|pare-feu|sauvegarde|chiffrement)\b/i,
  incidents: /\b(incident|breach|attack|ransomware|phishing|outage|intrusion|fuite|attaque|hameçonnage)\b/i,
};
function sentences(text) { return text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý0-9])/).map(s => s.trim()).filter(s => s.length > 25 && s.length < 600); }
export async function byRules(ws = S.ws) {
  const { docs, text } = await corpus(ws);
  const out = {};
  const sens = docs.flatMap(d => sentences(d.text).map(s => ({ s, d: d.name })));
  for (const [k] of FIELDS) {
    const rx = KW[k];
    if (!rx) { out[k] = normalize(k, {}); continue; }
    const hits = sens.filter(x => rx.test(x.s)).slice(0, 3);
    out[k] = hits.length ? normalize(k, { value: hits.map(h => h.s).join(' '), tag: 'FACT', source: `${hits[0].d} — “${hits[0].s.slice(0, 120)}”`, confidence: 'Medium' }) : normalize(k, {});
  }
  const h = hints(text);
  if (h.regulations.length) out.regulations = normalize('regulations', { value: h.regulations, tag: 'FACT', source: 'Named in the documents (keyword scan)' });
  if (h.sectors.length) out.sector = normalize('sector', { value: h.sectors[0], tag: 'INFERENCE', source: 'Most frequent sector vocabulary in the documents' });
  if (h.technologies.length && out.systems.tag === 'UNKNOWN') out.systems = normalize('systems', { value: h.technologies.join('; '), tag: 'FACT', source: 'Technologies named in the documents' });
  if (/\$|\bCAD\b|canad|québec|quebec|montr[eé]al/i.test(text)) out.currency = normalize('currency', { value: 'CAD', tag: 'INFERENCE', source: 'Canadian context and $ amounts in the documents' });
  else if (/€|\bEUR\b/.test(text)) out.currency = normalize('currency', { value: 'EUR', tag: 'INFERENCE', source: '€ amounts in the documents' });
  const amount = (rx) => { const m = rx.exec(text); if (!m) return null; let n = Number(m[1].replace(/[\s,]/g, '')); if (/million|M\b/i.test(m[2] || '')) n *= 1e6; if (/k\b|thousand|mille/i.test(m[2] || '')) n *= 1e3; return { n, q: m[0] }; };
  const it = amount(/(?:IT|information technology|informatique|TI)[^.$€]{0,60}?budget[^.\d$€]{0,40}?\$?\s?([\d][\d\s,.]*)\s*(million|M|k|thousand|mille)?/i);
  if (it) out.it_budget = normalize('it_budget', { value: it.n, tag: 'FACT', source: `“${it.q.slice(0, 120)}”` });
  const sp = amount(/(?:cyber ?security|security|sécurité)[^.$€]{0,40}?(?:budget|spend|spending|dépenses)[^.\d$€]{0,40}?\$?\s?([\d][\d\s,.]*)\s*(million|M|k|thousand|mille)?/i);
  if (sp) out.spend = normalize('spend', { value: sp.n, tag: 'FACT', source: `“${sp.q.slice(0, 120)}”` });
  const reg = h.regulations.length > 0, health = /health|santé|patient|hospital|clinic|clinique/i.test(text);
  const ap = reg && health ? 0.3 : reg ? 0.35 : 0.5;
  out.appetite = normalize('appetite', { value: ap, tag: 'ASSUMPTION', source: reg ? 'Regulated sensitive information named in the documents: low appetite by default' : 'No regulation found: neutral appetite by default', confidence: 'Low' });
  out.appetite_rationale = normalize('appetite_rationale', { value: (health ? 'Health information; ' : '') + (reg ? 'regulated personal information (' + h.regulations.slice(0, 3).join(', ') + '); ' : '') + 'value to be validated by management', tag: 'ASSUMPTION', source: 'Rule-based default', confidence: 'Low' });
  const gaps = FIELDS.filter(([k]) => out[k].tag === 'UNKNOWN').map(([, l]) => l);
  return { fields: out, gaps, method: 'rules' };
}
export async function crownByRules(ws = S.ws) {
  const { text } = await corpus(ws);
  const h = hints(text);
  return h.crown.map(c => ({ name: c, role: '', owner: '', c: '', i: '', a: '', dependencies: '', suppliers: '', tag: 'FACT', source: 'Named in the documents (keyword scan) — role to describe' }));
}

/** Compact, tagged profile for AI ingestion (≤ 50 words per field). */
export function brief(ws = S.ws) {
  const d = { org: ws.org, assessment: ws.assessment, budget: ws.budget || {}, appetite_rationale: ws.appetite_rationale };
  const prov = ws.org.prov || {};
  return FIELDS.map(([k, l]) => { const v = getField(d, k); return isEmpty(v) ? null : `${l} [${prov[k]?.tag || 'ANALYST'}]: ${Array.isArray(v) ? v.join('; ') : v}`; }).filter(Boolean).join('\n');
}
