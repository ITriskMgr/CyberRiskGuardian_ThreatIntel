/* rhub.js — the shared Risk Registry (1.5.7).

   A catalogue of risks that several organizations contribute to and read from. Each contribution is
   a risk card: one risk told as a causal chain, with what treats it, catalogued along dimensions that
   let another organization find the risks of organizations like its own — sector, region, size,
   regulation, the ontology's themes, asset categories, threat sources and impact dimensions, ATT&CK
   techniques, controls, maturity, severity, evidence level and validity.

   How it is shared without a server. Cards travel as packages (crg-registry/2, JSON) through a shared
   folder — a Google Drive, OneDrive or SharePoint folder synced on each computer, or the helper's
   outbox uploaded by the scheduled task. Every installation reads the packages in that folder into
   its own copy of the catalogue. A moderator (a privileged user of any installation) reviews the
   cards and publishes a curated package of the approved ones; readers can restrict themselves to
   moderated cards. A multi-tenant server is the next step (MULTIUSER-ARCHITECTURE.md, option B); the
   package format is the contract it will keep.

   Who may share. In single-user mode, the one person. In multi-user mode, an administrator or a user
   holding the Accountable right (RACI "A") on step 13 — report, demonstrate compliance and share.

   Anonymization is on by default and cannot be switched off silently: turning it off asks for a
   second confirmation, and the card then says it is not anonymized. Anonymized cards keep their
   catalogue dimensions at a level that does not single out the contributor — region at province or
   country level, size as a band, amounts as ranges, no organization name, no people, no asset names.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';
import { S, compute } from './state.js';
import * as A from './anon.js';
import * as users from './users.js';
import { GENERATOR } from './version.js';
import { today, uid } from './util.js';

export const SCHEMA = 'crg-registry/2';
export const CARD = 'crg-riskcard/1';

/* ---------------- the catalogue dimensions (recommended) ---------------- */
export const SIZE_BANDS = [['micro', 'Micro (fewer than 10 employees)'], ['small', 'Small (10–99)'], ['medium', 'Medium (100–499)'],
  ['large', 'Large (500–4,999)'], ['xlarge', 'Very large (5,000 or more)'], ['', 'Not stated']];
export const EVIDENCE = [['incident', 'Observed — an incident happened'], ['assessed', 'Assessed — from a risk assessment'], ['hypothetical', 'Hypothetical — a plausible scenario'], ['intel', 'Threat intelligence — seen against peers']];
export const SEVERITY = [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['vhigh', 'Very high']];
export const SECTORS = [['health', 'Health care and social assistance'], ['finance', 'Finance and insurance'], ['public', 'Public administration'], ['education', 'Educational services'],
  ['retail', 'Retail and wholesale trade'], ['manufacturing', 'Manufacturing'], ['energy', 'Utilities and energy'], ['transport', 'Transportation and warehousing'],
  ['ict', 'Information and cultural industries, telecommunications'], ['professional', 'Professional, scientific and technical services'], ['hospitality', 'Accommodation and food services'],
  ['construction', 'Construction'], ['nonprofit', 'Non-profit and community organizations'], ['other', 'Other']];
export const REGIONS = [['CA-QC', 'Canada — Quebec'], ['CA-ON', 'Canada — Ontario'], ['CA-BC', 'Canada — British Columbia'], ['CA-AB', 'Canada — Alberta'], ['CA-MB', 'Canada — Manitoba'],
  ['CA-SK', 'Canada — Saskatchewan'], ['CA-NS', 'Canada — Nova Scotia'], ['CA-NB', 'Canada — New Brunswick'], ['CA-NL', 'Canada — Newfoundland and Labrador'], ['CA-PE', 'Canada — Prince Edward Island'],
  ['CA', 'Canada'], ['US', 'United States'], ['FR', 'France'], ['BE', 'Belgium'], ['CH', 'Switzerland'], ['EU', 'European Union (other)'], ['INTL', 'International'], ['', 'Not stated']];
export const REGULATIONS = ['Quebec Law 25', 'Quebec health-information act (R-22.1)', 'PIPEDA', 'Bill C-27 / CPPA', 'PHIPA (Ontario)', 'HIPAA', 'GDPR', 'NIS2', 'PCI DSS', 'SOX', 'OSFI B-13', 'DORA'];
export const DIMENSIONS = [
  ['sector', 'Industry sector', 'NAICS-aligned families, so a hospital and a clinic network meet under “Health care”.'],
  ['subsector', 'Sub-sector', 'Free text, generalized on anonymization (“private clinic network”).'],
  ['region', 'Region', 'Country and province or state — where the threat landscape and the law differ.'],
  ['size', 'Organization size', 'A band, never a headcount.'],
  ['regulations', 'Regulatory regimes', 'Law 25, PIPEDA, HIPAA, GDPR, PCI DSS… — risks follow obligations.'],
  ['themes', 'Ontology themes', 'The CyberRiskGuardian Ontology’s 23 themes (ransomware, third party, identity…).'],
  ['asset_categories', 'Asset categories', 'The ontology’s 10 categories (cloud, OT/IoT, identity…).'],
  ['threat_source_types', 'Threat source type', 'Adversarial, accidental, environmental, structural.'],
  ['impact_dimensions', 'Impact dimensions', 'Confidentiality, availability, privacy, safety, financial, legal…'],
  ['attack', 'ATT&CK techniques', 'How it happens — the common language of threat intelligence.'],
  ['controls', 'Controls', 'ISO/IEC 27002, NIST CSF 2.0, SP 800-53 references of what treats it.'],
  ['maturity', 'Maturity band', 'The contributor’s overall CSF maturity (0–5), as a band — context for the values.'],
  ['severity', 'Severity band', 'From the contributor’s residual-to-tolerated ratio — never the raw figures.'],
  ['evidence', 'Evidence level', 'Observed incident, assessed, hypothetical, or threat intelligence.'],
  ['valid_until', 'Valid until', 'Risks age; a card past its date is shown as stale.'],
];

/* ---------------- the local copy of the catalogue (installation-wide) ---------------- */
const KEY = 'hub';
export const H = { entries: {}, moderation: {}, sources: [], mine: [], settings: {} };
export const DEFAULT_SETTINGS = { alias: '', regionLevel: 'province', validityMonths: 12, moderatedOnly: false, folderNote: '' };
export async function load() {
  const d = await store.get('meta', KEY).catch(() => null);
  Object.assign(H, { entries: {}, moderation: {}, sources: [], mine: [], settings: { ...DEFAULT_SETTINGS } }, d || {});
  H.settings = { ...DEFAULT_SETTINGS, ...(H.settings || {}) };
  return H;
}
export const save = () => store.put('meta', KEY, JSON.parse(JSON.stringify(H)));

/** Privileged: may share cards and moderate. */
export function privileged() {
  if (!users.active()) return true;
  const me = users.me();
  return !!me && (me.admin || users.can('approve', 'report'));
}

/* ---------------- from the workspace to cards ---------------- */
const CAT_OF_TYPE = { hardware: 'CatEndpoint', server: 'CatInfrastructure', network: 'CatNetwork', application: 'CatApplication', data: 'CatInformation',
  service: 'CatApplication', cloud: 'CatCloud', iot: 'CatOTIoT', supplier: 'CatCloud', people: 'CatPeople', facility: 'CatFacility' };
export function sizeBand(o) {
  const n = Number(String(o?.employees || '').replace(/[^\d]/g, ''));
  if (Number.isFinite(n) && n > 0) return n < 10 ? 'micro' : n < 100 ? 'small' : n < 500 ? 'medium' : n < 5000 ? 'large' : 'xlarge';
  const s = String(o?.size || '').toLowerCase();
  return /micro/.test(s) ? 'micro' : /small|petite/.test(s) ? 'small' : /mid|medium|moyenne/.test(s) ? 'medium' : /very large|très grande/.test(s) ? 'xlarge' : /large|grande/.test(s) ? 'large' : '';
}
export function sectorKey(text) {
  const s = String(text || '').toLowerCase();
  return /health|santé|clinic|hospital|médic|medical|pharma/.test(s) ? 'health' : /bank|financ|insur|assur|credit/.test(s) ? 'finance'
    : /government|public|municipal|gouvern/.test(s) ? 'public' : /school|universit|college|éducation|education|cégep/.test(s) ? 'education'
    : /retail|commerce|wholesale|détail/.test(s) ? 'retail' : /manufactur|fabrication|industri/.test(s) ? 'manufacturing'
    : /energy|énergie|utility|hydro|électric/.test(s) ? 'energy' : /transport|logistic/.test(s) ? 'transport'
    : /telecom|software|logiciel|technolog|media/.test(s) ? 'ict' : /consult|legal|account|engineering|profession/.test(s) ? 'professional'
    : /hotel|hôtel|restaurant|hospitality|tourism/.test(s) ? 'hospitality' : /construct/.test(s) ? 'construction' : /non-profit|nonprofit|charity|osbl|community/.test(s) ? 'nonprofit' : s ? 'other' : '';
}
export function regionKey(text) {
  const s = String(text || '').toLowerCase();
  const prov = [['CA-QC', /quebec|québec|montreal|montréal|gatineau|saguenay|sherbrooke/], ['CA-ON', /ontario|toronto|ottawa/], ['CA-BC', /british columbia|vancouver|colombie/],
    ['CA-AB', /alberta|calgary|edmonton/], ['CA-MB', /manitoba|winnipeg/], ['CA-SK', /saskatchewan/], ['CA-NS', /nova scotia|halifax|nouvelle-écosse/], ['CA-NB', /new brunswick|nouveau-brunswick/],
    ['CA-NL', /newfoundland|terre-neuve/], ['CA-PE', /prince edward|île-du-prince/]];
  for (const [k, re] of prov) if (re.test(s)) return k;
  return /canada/.test(s) ? 'CA' : /united states|usa|\bus\b/.test(s) ? 'US' : /france/.test(s) ? 'FR' : /belgi/.test(s) ? 'BE' : /suisse|switzerland/.test(s) ? 'CH' : '';
}
export const regionAt = (k, level) => !k ? '' : level === 'country' ? k.split('-')[0] : k;
const MAT_BAND = v => !Number.isFinite(v) ? '' : v < 1.5 ? '0–1 initial' : v < 2.5 ? '2 repeatable' : v < 3.5 ? '3 defined' : '4–5 managed or optimizing';
export const severityOf = ratio => !Number.isFinite(ratio) ? '' : ratio < 0.9 ? 'low' : ratio <= 1.1 ? 'medium' : ratio < 2 ? 'high' : 'vhigh';

/** The catalogue a workspace offers by default for its cards. */
export async function catalogDefaults(ws = S.ws) {
  let mat = NaN; try { mat = (await import('./maturity.js')).maturity(ws).overall; } catch { /* no maturity */ }
  return { sector: sectorKey(ws.org?.sector), subsector: ws.org?.sector || '', region: regionKey(ws.org?.region), size: sizeBand(ws.org),
    regulations: (ws.org?.regulations || []).map(r => REGULATIONS.find(x => r.toLowerCase().includes(x.toLowerCase().split(' (')[0].toLowerCase())) || r).slice(0, 8),
    maturity: MAT_BAND(mat) };
}

/** One card from one scenario (and the risk-register entry that owns it, if any). */
export function cardFromScenario(s, ws, base, { evidence = 'assessed' } = {}) {
  const R = compute(ws);
  const row = R.rows.find(x => x.id === s.id);
  const risk = (ws.risks || []).find(r => (r.scenarios || []).includes(s.id));
  const ms = (ws.measures || []).filter(m => m.status !== 'rejected' && (m.scen || []).includes(s.id));
  const cats = new Set([...(s.crgo?.asset_categories || []), ...(s.assetIds || []).map(id => CAT_OF_TYPE[(ws.assets || []).find(a => a.id === id)?.type]).filter(Boolean)]);
  const until = new Date(); until.setMonth(until.getMonth() + (Number(H.settings.validityMonths) || 12));
  const impact = Object.entries(s.consequences || {}).filter(([, v]) => String(v || '').trim()).map(([k]) => k.toLowerCase())
    .map(k => /privacy|personal/.test(k) ? 'DimPrivacy' : /financ/.test(k) ? 'DimFinancial' : /legal|regul/.test(k) ? 'DimLegal' : /reput/.test(k) ? 'DimReputation' : /safety|health/.test(k) ? 'DimSafety' : /operat/.test(k) ? 'DimOperational' : null).filter(Boolean);
  return {
    schema: CARD, uid: uid('rc'), title: s.name || s.id, statement: s.statement || '',
    chain: { threat_source: s.threat_source || '', threat_event: s.threat_event || '', weakness: (s.vulns || []).join('; '), assets: s.assets || '', consequence: Object.values(s.consequences || {}).filter(Boolean).join(' ').slice(0, 400) },
    treatment: { decision: ws.decisions?.[s.id]?.option || risk?.treatment || '', measures: ms.map(m => ({ name: m.name, fn: m.fn || '', controls: m.ctl || [], rp: m.rp, ri: m.ri })) },
    params: Object.fromEntries(['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu'].map(k => [k, Number(s.params?.[k]?.v)])), cvss: s.cvss || '', red_p: s.red_p, red_i: s.red_i,
    result: row ? { classification: row.cls, severity: severityOf(row.ratio) } : null,
    catalog: { ...base,
      themes: [...new Set(s.crgo?.themes || [])], asset_categories: [...cats], threat_source_types: [...new Set(s.crgo?.threat_source_types || [])],
      impact_dimensions: [...new Set(impact)], attack: [...new Set(s.attack || [])], controls: [...new Set([...(s.crgo?.controls || []), ...ms.flatMap(m => m.ctl || [])])].slice(0, 30),
      severity: row ? severityOf(row.ratio) : '', evidence, valid_until: until.toISOString().slice(0, 10) },
    crgo: s.crgo?.id || null, cwe: s.cwe || [], lang: document.documentElement.lang || 'en',
    source_ref: s.id,
  };
}

/** Anonymize a set of cards for sharing. Region and size stay at their band; names, people, assets go. */
export function anonymize(cards, ws, opts = A.DEFAULT_OPTS, regionLevel = H.settings.regionLevel) {
  const ctx = A.context(ws, opts);
  const out = cards.map(c => {
    const keep = { catalog: c.catalog, schema: c.schema, uid: c.uid, crgo: c.crgo, cwe: c.cwe, lang: c.lang, params: c.params, cvss: c.cvss, red_p: c.red_p, red_i: c.red_i, result: c.result };
    const x = A.walk({ title: c.title, statement: c.statement, chain: c.chain, treatment: c.treatment }, ctx, { ...opts, region: false });
    const cat = { ...c.catalog, region: regionAt(c.catalog.region, regionLevel), subsector: A.text(c.catalog.subsector || '', ctx, opts) };
    delete x.source_ref;
    return { ...keep, ...x, catalog: cat, anonymized: true };
  });
  return { cards: out, ctx };
}

/** A package of cards, ready for the shared folder. */
export function pack(cards, { anonymized = true, alias = H.settings.alias, kind = 'contribution' } = {}) {
  return { schema: SCHEMA, kind, generated: new Date().toISOString(), generator: GENERATOR, anonymized,
    contributor: { alias: alias || (anonymized ? 'Anonymous contributor' : (S.ws?.org?.name || S.ws?.name || '')) },
    licence: 'Shared under the terms the contributor accepted in the registry; CyberRiskGuardian content CC BY-NC 4.0.',
    note: 'Decision-support material. Parameters describe the contributor’s organization — re-estimate them for yours. Analytical estimate — validation required.',
    entries: cards.map(c => ({ ...c, contributor: alias || 'Anonymous contributor', published: today() })) };
}
export const packageName = (kind = 'contribution') => `crg-registry2-${kind}-${(H.settings.alias || 'anon').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24) || 'anon'}-${today()}-${Math.random().toString(36).slice(2, 6)}.json`;

/* ---------------- reading packages into the catalogue ---------------- */
/** Accepts crg-registry/2 and converts crg-registry/1 (1.4.0 to 1.5.6) packages. Returns cards added. */
export function ingest(pkg, sourceName) {
  let cards = [];
  if (pkg?.schema === SCHEMA && pkg.kind === 'withdrawal') {
    for (const u of pkg.withdraw || []) H.moderation[u] = { state: 'rejected', by: pkg.contributor?.alias || 'contributor', date: (pkg.generated || '').slice(0, 10), note: 'withdrawn by the contributor' };
    if (!H.sources.some(s => s.name === sourceName)) H.sources.push({ name: sourceName, date: today(), count: 0, kind: 'withdrawal' });
    return 0;
  }
  if (pkg?.schema === SCHEMA) cards = pkg.entries || [];
  else if (pkg?.schema === 'crg-registry/1') {
    const org = pkg.organization || {};
    const base = { sector: sectorKey(org.sector), subsector: org.sector || '', region: regionKey(org.region), size: sizeBand(org), regulations: [], evidence: 'assessed' };
    cards = (pkg.scenarios || []).map(s => ({ schema: CARD, uid: 'v1-' + hash(sourceName + s.id + s.name), title: s.name, statement: s.statement || '',
      chain: { threat_source: s.threat_source || '', threat_event: s.threat_event || '', weakness: (s.vulnerabilities || []).join('; '), assets: s.assets || '', consequence: '' },
      treatment: { decision: '', measures: [] }, params: Object.fromEntries(Object.entries(s.params || {}).map(([k, p]) => [k, Number(p?.v ?? p)])), cvss: s.cvss, red_p: s.red_p, red_i: s.red_i,
      result: s.results ? { classification: s.results.classification, severity: severityOf(s.results.ratio) } : null,
      catalog: { ...base, themes: [], asset_categories: [], threat_source_types: [], impact_dimensions: [], attack: s.attack || [], controls: [], severity: s.results ? severityOf(s.results.ratio) : '' },
      anonymized: !!pkg.anonymized, contributor: org.name || 'crg-registry/1', published: (pkg.generated || '').slice(0, 10), lang: 'en' }));
  } else throw new Error('Not a CyberRiskGuardian registry package (crg-registry/1 or /2).');
  let added = 0;
  for (const c of cards) {
    if (!c?.uid || !c.title) continue;
    if (!H.entries[c.uid]) added++;
    H.entries[c.uid] = { ...c, _source: sourceName, _received: H.entries[c.uid]?._received || today(), _curated: pkg.kind === 'curated' || H.entries[c.uid]?._curated };
    if (pkg.kind === 'curated' && !H.moderation[c.uid]) H.moderation[c.uid] = { state: 'approved', by: pkg.contributor?.alias || 'moderator', date: (pkg.generated || '').slice(0, 10), note: 'from a curated package' };
  }
  const prev = H.sources.find(s => s.name === sourceName);
  if (prev) Object.assign(prev, { date: today(), count: cards.length }); else H.sources.push({ name: sourceName, date: today(), count: cards.length, kind: pkg.kind || 'contribution' });
  return added;
}
function hash(s) { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return (h >>> 0).toString(36); }

/* ---------------- search ---------------- */
export const stale = c => !!c.catalog?.valid_until && c.catalog.valid_until < today();
export const modState = c => H.moderation[c.uid]?.state || 'pending';
export function search(q = {}) {
  const words = String(q.text || '').toLowerCase().split(/\s+/).filter(Boolean);
  const has = (list, v) => !v || (list || []).includes(v);
  return Object.values(H.entries).filter(c => {
    const k = c.catalog || {};
    if (q.sector && k.sector !== q.sector) return false;
    if (q.region && !(k.region === q.region || (k.region || '').startsWith(q.region + '-') || q.region.startsWith((k.region || '#') + '-'))) return false;
    if (q.size && k.size !== q.size) return false;
    if (q.severity && k.severity !== q.severity) return false;
    if (q.evidence && k.evidence !== q.evidence) return false;
    if (!has(k.themes, q.theme) || !has(k.asset_categories, q.asset) || !has(k.regulations, q.regulation) || !has(k.threat_source_types, q.source)) return false;
    if (q.attack && !(k.attack || []).some(t => t === q.attack || t.startsWith(q.attack + '.'))) return false;
    if (q.moderated && modState(c) !== 'approved') return false;
    if (modState(c) === 'rejected' && !q.showRejected) return false;
    if (q.hideStale && stale(c)) return false;
    if (words.length) { const t = (c.title + ' ' + c.statement + ' ' + (c.catalog?.subsector || '')).toLowerCase(); if (!words.every(w => t.includes(w))) return false; }
    return true;
  }).sort((a, b) => (b.published || '').localeCompare(a.published || ''));
}

/** A card as a Batch scenarios row, excluded from nothing and re-estimated by the analyst. */
export function toBatchRow(c) {
  const params = {}, rat = {}, conf = {};
  for (const k of ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu']) {
    const v = Number(c.params?.[k]);
    params[k] = Number.isFinite(v) && v > 0 ? v : 0.5;
    rat[k] = `From the shared Risk Registry (${c.contributor || 'contributor'}, ${c.published || ''}) — describes another organization; re-estimate for this one. Analytical estimate — validation required.`;
    conf[k] = 'Low';
  }
  return { pick: true, hubRow: true, name: c.title + ' [Registry]', statement: c.statement, threat_source: c.chain?.threat_source || '', assets: c.chain?.assets || '', vulns: c.chain?.weakness || '',
    attack: (c.catalog?.attack || []).filter(t => /^T\d{4}/.test(t)), cwe: c.cwe || [], cves: [], params, rat, conf, cvss: c.cvss || '', cvss_score: null,
    cvss_note: 'CVSS of the contributing organization — check it for yours.', red_p: Number(c.red_p) || 0.5, red_i: Number(c.red_i) || 0.5, owner: '', pattern: 'registry',
    ...(c.crgo ? { crgo: { id: c.crgo, themes: c.catalog?.themes || [], asset_categories: c.catalog?.asset_categories || [], threat_source_types: c.catalog?.threat_source_types || [], controls: c.catalog?.controls || [], obligations: [], basis: null, imported: today() } } : {}) };
}
