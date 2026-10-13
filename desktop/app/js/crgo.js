/* crgo.js — the CyberRiskGuardian Ontology (CRGO) inside the application (1.5.7; CRGO 0.9 in 1.5.8; CRGO v0.10.0 in 1.6.0:
   the read contracts compliance/v1 and secops/v1 are called through dss.js complianceContext / secopsContext).

   Two ways to reach it, one answer shape:

   1. The ontology's own MCP server (pipeline/mcp/crgo_server.py), started and spoken to by the local
      helper (crgo_client.py). This is the reference: the same six read-only tools Claude uses, the
      same ranking, near-duplicate merging and gap reporting.
   2. When the helper is not running or the server cannot be started, a snapshot of the ontology's
      identification export shipped with the application (data/crgo-snapshot.json), queried here in
      the browser with a simpler ranking. Every result says which of the two produced it.

   Whatever the source, the numbers are calibration priors — AI estimates of 2023 for a fictitious
   healthcare organization, or instructor values of teaching cases — and arrive labelled
   "Analytical estimate — validation required". Nothing here changes a stored value by itself.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as helper from './helper.js';

export const TOOLS = ['crgo_sweep', 'crgo_identify', 'crgo_scenario', 'crgo_controls_for_technique', 'crgo_scenarios_for_control', 'crgo_list_values'];
export const FRAMEWORKS = [['csf2', 'NIST CSF 2.0'], ['sp800-53r5', 'NIST SP 800-53 r5'], ['iso27002-2022', 'ISO/IEC 27002:2022']];
export const MARK = 'Analytical estimate — validation required.';
export const RISK_UNIT = 'CRG risk units (factor 1000, appetite 0.30): relative, comparable across scenarios, not a 0–1 score';

/* ---------------- the snapshot (fallback) ---------------- */
let SNAP = null, snapLoading = null;
export async function snapshot() {
  if (SNAP) return SNAP;
  snapLoading ||= fetch(new URL('../data/crgo-snapshot.json', import.meta.url)).then(r => { if (!r.ok) throw new Error('The ontology snapshot is missing from this installation.'); return r.json(); })
    .then(j => { SNAP = j; index(j); return j; }).finally(() => { snapLoading = null; });
  return snapLoading;
}
const BY_ID = new Map();
function index(j) { BY_ID.clear(); for (const s of j.scenarios) BY_ID.set(s.id, s); }

/* ---------------- status ---------------- */
export const state = { via: null, status: null, last: null };
export async function status() {
  await helper.probe().catch(() => {});
  if (!helper.HS.helper) return (state.status = { helper: false, usable: false, problem: 'The local helper is not running — the snapshot is used.' });
  try { state.status = { helper: true, ...(await helper.apiJson('/api/crgo/status')) }; }
  catch (e) { state.status = { helper: true, usable: false, problem: String(e.message || e) }; }
  return state.status;
}

/** Call one tool. Returns { result, via: 'mcp'|'snapshot', why? }. */
export async function call(tool, args = {}, { prefer = 'auto' } = {}) {
  if (!TOOLS.includes(tool)) throw new Error('Unknown ontology tool ' + tool);
  let why = '';
  if (prefer !== 'snapshot') {
    await helper.probe().catch(() => {});
    if (helper.HS.helper) {
      try {
        const out = await helper.post('/api/crgo/call', { tool, args });
        if (!out.error) { state.via = 'mcp'; state.last = new Date().toISOString(); return { result: out.result, via: 'mcp', server: out.server, source: out.source }; }
        why = out.error;
      } catch (e) { why = String(e.message || e); }
    } else why = 'The local helper is not running.';
  }
  const snap = await snapshot();
  state.via = 'snapshot';
  return { result: LOCAL[tool](args, snap), via: 'snapshot', why, version: snap.version, built: snap.built };
}

/* ---------------- the workspace as an ontology profile ---------------- */
const TYPE_CAT = { hardware: 'CatEndpoint', server: 'CatInfrastructure', network: 'CatNetwork', application: 'CatApplication', data: 'CatInformation',
  service: 'CatApplication', cloud: 'CatCloud', iot: 'CatOTIoT', supplier: 'CatCloud', people: 'CatPeople', facility: 'CatFacility' };
export function sectorOf(text) {
  const s = String(text || '').toLowerCase();
  return /health|santé|clinic|hospital|hôpital|medical|médic|pharma/.test(s) ? 'health'
    : /bank|banque|financ|credit|insur|assur/.test(s) ? 'bank'
    : /retail|commerce|détail|store|magasin/.test(s) ? 'retail'
    : /hotel|hôtel|hospitality|hôtellerie|restaurant|tourism/.test(s) ? 'hospitality' : '';
}
/** What the workspace says about itself, in the ontology's vocabulary. */
export function profileOf(ws) {
  const cats = new Set((ws.assets || []).map(a => TYPE_CAT[a.type]).filter(Boolean));
  if ((ws.assessment.CROWN || []).length) cats.add('CatInformation');
  if (ws.org?.cloud) cats.add('CatCloud');
  const techniques = [...new Set((ws.assessment.SCEN || []).flatMap(s => s.attack || []).map(t => String(t).split('.')[0]))].slice(0, 25);
  const kw = [];
  const sys = `${ws.org?.systems || ''} ${ws.org?.services || ''}`.toLowerCase();
  for (const [re, w] of [[/\behr\b|dossier|electronic health/, 'EHR'], [/pacs|dicom|imag/, 'DICOM'], [/hl7/, 'HL7'], [/tele(consult|health|médecine)/, 'telehealth'],
    [/portal|portail/, 'portal'], [/payment|paiement|billing|factur/, 'payment'], [/active directory|\bad\b|entra|azure ad/, 'Active Directory'], [/backup|sauvegarde/, 'backup']]) if (re.test(sys)) kw.push(w);
  return { sector: sectorOf(ws.org?.sector), asset_categories: [...cats], techniques, keywords: kw, themes: (ws.ontology?.themes || []).slice() };
}

/* ---------------- tagging ---------------- */
/** The ontology keys a scenario carries: imported ones as recorded, otherwise inferred from its ATT&CK techniques. */
export function tagsOf(s) {
  if (s?.crgo?.themes?.length || s?.crgo?.asset_categories?.length) return s.crgo;
  return null;
}

/* ---------------- local engine over the snapshot ---------------- */
const CONF = { H: ['H'], M: ['H', 'M'], L: ['H', 'M', 'L'] };
const okConf = (c, min) => (CONF[min] || CONF.M).includes(c || 'M');
const low = x => String(x || '').toLowerCase();
const keyIn = (list, want) => (list || []).some(x => want.some(w => low(x.key || x) === low(w) || low(x.label || '') === low(w)));
const techMatch = (s, ts) => (s.attack_techniques || []).some(t => ts.some(w => t.id === w || String(t.id).startsWith(w + '.')));
const kwMatch = (s, ks) => ks.some(k => low(s.name + ' ' + (s.statement || '')).includes(low(k)));
const held = (s, holdout) => (holdout || []).some(h => s.id.startsWith(h + '/') || (s.estimates?.case?.evidence || []).includes('CASE-' + h));
function filterLinks(s, min) {
  const f = l => (l || []).filter(x => okConf(x.confidence, min));
  return { ...s, attack_techniques: f(s.attack_techniques), weaknesses: f(s.weaknesses), obligations: f(s.obligations),
    controls: Object.fromEntries(Object.entries(s.controls || {}).map(([k, v]) => [k, f(v)])) };
}
function risk(s) {
  const e = s.estimates || {};
  const c = e.case_calibrated || e.case, l = e.library_2023 || e.library;
  const pick = c?.risk ? c : l?.risk ? l : null;
  return pick ? { estimated_risk: pick.risk.estimated, risk_basis: pick === c ? 'case-calibrated' : 'library 2023' } : { estimated_risk: null, risk_basis: null };
}
function brief(s, min, extra = {}) { const f = filterLinks(s, min); return { ...f, ...risk(s), ...extra }; }
function matches(s, a) {
  const sector = a.sector ? [low(s.sector).includes(low(a.sector)) || low(s.sector) === 'generic'] : [];
  return {
    cats: a.asset_categories?.length ? keyIn(s.asset_categories, a.asset_categories) : null,
    themes: a.themes?.length ? keyIn(s.themes, a.themes) : null,
    sector: a.sector ? sector[0] : null,
    tech: a.techniques?.length ? techMatch(s, a.techniques) : null,
    kw: a.keywords?.length ? kwMatch(s, a.keywords) : null,
  };
}
const fitOf = m => Object.values(m).filter(v => v === true).length;

const SYNONYMS = [['telehealth', 'telemedicine', 'teleconsultation', 'virtual care', 'remote consultation'],
  ['generative ai', 'genai', 'chatgpt', 'llm', 'large language model', 'ai tool', 'ai assistant'], ['hl7', 'dicom', 'pacs', 'interface engine', 'medical imaging transfer'],
  ['mfa', 'multi-factor', 'multifactor', 'two-factor', '2fa'], ['ransomware', 'encrypt', 'extortion'], ['backup', 'restore', 'recovery'], ['wi-fi', 'wifi', 'wireless'],
  ['email', 'e-mail', 'business email compromise', 'bec'], ['usb', 'removable media', 'portable media'], ['cloud', 'saas', 'tenant', 'm365', 'office 365', 'azure'],
  ['oauth', 'app consent', 'access token', 'session token', 'token theft'], ['mfa fatigue', 'push fatigue', 'push notification', 'mfa bombing', 'prompt bombing', 'mfa push'],
  ['radiology', 'medical image', 'medical imaging', 'imaging', 'pacs', 'x-ray', 'mri'], ['wan', 'wide area network', 'network link', 'network outage', 'connectivity loss', 'telecommunication outage', 'hub'],
  ['rogue access point', 'evil twin', 'rogue wi-fi', 'rogue wifi'], ['local storage', 'nas', 'network attached storage', 'file share', 'local server'],
  ['asset inventory', 'inventory', 'unmanaged device', 'shadow it'], ['adaptive authentication', 'conditional access', 'contextual access'],
  ['insider sabotage', 'sabotage', 'disgruntled', 'departing employee'], ['help desk', 'helpdesk', 'service desk'], ['vendor', 'supplier', 'third party', 'third-party'],
  ['patient portal', 'web portal', 'online portal'], ['disposal', 'decommission', 'retired device', 'e-waste']];
const BASELINE = [['phishing and credential theft', ['phishing', 'credential theft']], ['ransomware', ['ransomware']],
  ['business email compromise', ['business email compromise', 'bec', 'invoice fraud', 'payment fraud', 'ceo fraud']],
  ['help-desk social engineering', ['help desk', 'helpdesk', 'service desk', 'password reset']],
  ['accidental disclosure by staff', ['accidental disclosure', 'misdirected', 'human error', 'accidental']],
  ['lost or stolen device', ['lost', 'stolen', 'theft of']], ['removable media', ['usb', 'removable media', 'portable media']],
  ['disposal of equipment and media', ['disposal', 'decommission', 'retired', 'e-waste']], ['third-party compromise', ['third-party', 'third party', 'vendor', 'supplier']],
  ['cloud misconfiguration', ['cloud misconfiguration', 'misconfigured cloud', 'exposed storage', 'public bucket']],
  ['unpatched systems', ['unpatched', 'patch management', 'outdated software']], ['insider misuse or sabotage', ['insider', 'sabotage', 'disgruntled']],
  ['network or telecom outage', ['outage', 'network failure', 'telecommunication', 'connectivity']], ['backup and recovery failure', ['backup', 'recovery failure', 'restore']],
  ['impersonation of the organisation', ['impersonat', 'spoofed domain', 'fake website', 'brand']],
  ['web application vulnerability', ['web application', 'sql injection', 'cross-site', 'portal vulnerability']],
  ['denial of service', ['denial of service', 'ddos']], ['privileged account misuse', ['privileged account', 'admin account', 'privileged access']]];
const esc = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function expand(keywords) {
  return keywords.map(k0 => { const k = low(k0).trim();
    const g = [k, ...[k.replace('centre', 'center'), k.replace('center', 'centre'), k.replace(/-/g, ' '), k.replace(/ /g, '-')].filter(v => v !== k)];
    for (const grp of SYNONYMS) if (grp.includes(k)) for (const w of grp) if (!g.includes(w)) g.push(w);
    return g; });
}
const TEXT = new WeakMap();
function textOf(s) {
  if (!TEXT.has(s)) TEXT.set(s, low([s.name, s.statement, ...(s.weaknesses || []).map(w => w.title || w.id), ...(s.attack_techniques || []).map(t => t.title || t.id)].join(' ')));
  return TEXT.get(s);
}
const hits = (text, groups) => groups.filter(g => g.some(w => new RegExp('\\b' + esc(w) + 's?\\b').test(text))).length;
const baselineHits = text => BASELINE.filter(([, ws]) => ws.some(w => new RegExp('\\b' + esc(w) + '\\w{0,3}\\b').test(text))).map(([n]) => n);
const STOP = new Set(['the', 'a', 'an', 'of', 'to', 'and', 'or', 'in', 'on', 'for', 'by', 'with', 'due', 'from', 'at', 'through', 'via', 'attack', 'risk', 'scenario']);
const tokens = n => new Set((low(n).match(/[a-z0-9]+/g) || []).filter(w => !STOP.has(w)));
const jaccard = (x, y) => { let i = 0; for (const w of x) if (y.has(w)) i++; return i / Math.max(1, new Set([...x, ...y]).size); };
const caseKey = s => s.kind === 'case scenario' ? s.id.split('/')[0] : null;
const allowed = (s, cases, holdout) => s.kind === 'library scenario' || (cases && !(holdout || []).includes(caseKey(s)) && !(holdout || []).some(h => caseKey(s) === h || caseKey(s)?.startsWith(h + '-')));

export const LOCAL = {
  crgo_list_values({ kind }, snap) {
    if (kind === 'sector') return [...new Set(snap.scenarios.map(s => s.sector).filter(Boolean))].sort().map(k => ({ key: k, label: k }));
    return (snap.values || {})[kind] || [];
  },
  crgo_identify(a, snap) {
    const min = a.min_confidence || 'M', limit = a.limit || 15;
    const out = [];
    for (const s of snap.scenarios) {
      if (!allowed(s, a.include_cases !== false, a.holdout || [])) continue;
      const m = matches(s, a);
      if (Object.values(m).some(v => v === false)) continue;
      out.push(brief(s, min, { fit: fitOf(m) }));
    }
    out.sort((x, y) => y.fit - x.fit || (y.estimated_risk || 0) - (x.estimated_risk || 0));
    return { profile: a, matches: out.length, scenarios: out.slice(0, limit), risk_unit: RISK_UNIT, caveat: snap.caveat };
  },
  /* A port of the server's sweep (pipeline/query/identify.py): every scenario matching ANY profile
     element is scored (techniques and keyword groups count double, the sector adds one); near-duplicates
     — same first theme, names sharing ≥ 40 % of their words — are merged under one representative; the
     result keeps per_theme representatives per requested theme, one representative per commonly
     assessed risk, then the best others matching at least two elements. */
  crgo_sweep(a, snap) {
    const min = a.min_confidence || 'M', per = a.per_theme ?? 3, max = a.max_total || 60, baseline = a.baseline !== false;
    const pool0 = snap.scenarios.filter(s => allowed(s, a.include_cases !== false, a.holdout || []));
    const score = new Map();
    const add = (list, w = 1) => { for (const s of list) score.set(s.id, (score.get(s.id) || 0) + w); };
    for (const v of a.asset_categories || []) add(pool0.filter(s => keyIn(s.asset_categories, [v])));
    for (const v of a.themes || []) add(pool0.filter(s => keyIn(s.themes, [v])));
    if ((a.techniques || []).length) add(pool0.filter(s => techMatch(s, a.techniques)), 2);
    for (const g of expand(a.keywords || [])) add(pool0.filter(s => hits(textOf(s), [g]) > 0), 2);
    const base = new Map();
    if (baseline) for (const s of pool0) for (const nm of baselineHits(low(s.name))) { if (!base.has(nm)) base.set(nm, []); base.get(nm).push(s); }
    if (a.sector) for (const s of pool0) if (score.has(s.id) && low(s.sector).includes(low(a.sector))) score.set(s.id, score.get(s.id) + 1);
    const byId = new Map(pool0.map(s => [s.id, s]));
    const poolIds = new Set([...score.keys(), ...[...base.values()].flat().map(s => s.id)]);
    const rk = id => risk(byId.get(id)).estimated_risk || 0;
    const key = (x, y) => (score.get(y) || 0) - (score.get(x) || 0) || rk(y) - rk(x);
    const themeOf = id => byId.get(id)?.themes?.[0]?.key;
    const reps = [], seen = new Map();
    for (const id of [...poolIds].sort(key)) {
      const tk = tokens(byId.get(id).name);
      const rep = reps.find(r => themeOf(r) === themeOf(id) && jaccard(tk, tokens(byId.get(r).name)) >= 0.4);
      if (rep) { if (!seen.has(rep)) seen.set(rep, []); seen.get(rep).push(id); } else reps.push(id);
    }
    const chosen = [], why = new Map();
    const take = (id, reason) => { if (why.has(id)) { if (!why.get(id).includes(reason)) why.set(id, why.get(id) + '; ' + reason); } else if (chosen.length < max) { chosen.push(id); why.set(id, reason); } };
    for (const th of a.themes || []) for (const id of reps.filter(r => themeOf(r) === th && score.has(r)).slice(0, per)) take(id, 'requested theme');
    const baseGaps = [];
    for (const [nm] of BASELINE) { const c = (base.get(nm) || []).map(s => s.id).sort(key); if (c.length) take(c[0], 'commonly assessed: ' + nm); else if (baseline) baseGaps.push(nm); }
    for (const id of reps.filter(r => (score.get(r) || 0) >= 2)) take(id, 'matches the profile');
    const out = chosen.map(id => brief(byId.get(id), min, { fit: score.get(id) || 0, selected_because: why.get(id),
      see_also: (seen.get(id) || []).slice(0, 8).map(x => ({ id: x, name: byId.get(x).name })) }));
    const covered = new Set(out.flatMap(s => (s.themes || []).map(t => t.key)));
    return { profile: a, candidates: poolIds.size, distinct: reps.length, returned: out.length,
      themes_covered: (a.themes || []).filter(t => covered.has(t)), theme_gaps: (a.themes || []).filter(t => !covered.has(t)), baseline_gaps: baseGaps,
      scenarios: out, risk_unit: RISK_UNIT, caveat: snap.caveat };
  },
  crgo_scenario({ scenario_id, min_confidence = 'M' }, snap) {
    if (!BY_ID.size) index(snap);
    const s = BY_ID.get(scenario_id) || snap.scenarios.find(x => x.id.endsWith('/' + scenario_id));
    if (!s) throw new Error('No scenario ' + scenario_id + ' in the ontology snapshot.');
    return { ...brief(s, min_confidence), ...detail09(s, snap), caveat: snap.caveat };
  },
  crgo_controls_for_technique({ technique, min_confidence = 'M', top = 10 }, snap) {
    const ss = snap.scenarios.filter(s => techMatch(s, [technique]));   // as the server: any link to the technique, any scenario
    const controls = {};
    for (const s of ss) for (const [fw, list] of Object.entries(filterLinks(s, min_confidence).controls || {})) for (const c of list) {
      const m = (controls[fw] ||= new Map()); const e = m.get(c.id) || { id: c.id, title: c.title, scenarios: 0 }; e.scenarios++; m.set(c.id, e);
    }
    return { technique, scenarios: ss.length, controls: Object.fromEntries(Object.entries(controls).map(([fw, m]) => [fw, [...m.values()].sort((a, b) => b.scenarios - a.scenarios).slice(0, top)])) };
  },
  crgo_scenarios_for_control({ framework, control_id, min_confidence = 'M', limit = 50 }, snap) {
    const out = [];
    let title = '';
    for (const s of snap.scenarios) {
      if (s.kind !== 'library scenario') continue;
      const c = (s.controls?.[framework] || []).find(x => x.id === control_id && okConf(x.confidence, min_confidence));
      if (c) { title ||= c.title; out.push({ id: s.id, name: s.name, confidence: c.confidence }); }
    }
    return { framework, control: control_id, title, matches: out.length, scenarios: out.slice(0, limit) };
  },
};

/** 1.5.8 — CRGO 0.9 additions of crgo_scenario, expanded from the snapshot's compact rows. */
export function detail09(s, snap) {
  const out = {}, T = snap.titles || {}, N = snap.notes || {};
  if (s.other_regimes) {
    out.other_regimes = { note: N.other_regimes || '' };
    for (const [k, ids] of Object.entries(s.other_regimes)) out.other_regimes[k] = ids.map(id => ({ id, title: (T[k] || {})[id] || '' }));
  }
  if (s.countermeasures_d3fend) out.countermeasures_d3fend = s.countermeasures_d3fend.map(([id, confidence, for_techniques]) => ({ id, title: (T.d3fend || {})[id] || '', confidence, for_techniques, source: N.d3fend || '' }));
  if (s.exploitation_evidence) {
    const rows = s.exploitation_evidence.map(([id, kev_vulnerabilities, known_ransomware_use, epss_median, epss_max]) => ({ id, kev_vulnerabilities, known_ransomware_use, epss_median, epss_max }));
    out.exploitation_evidence = { by_technique: rows.filter(r => /^T\d/.test(r.id)), by_weakness: rows.filter(r => !/^T\d/.test(r.id)), source: N.exploitation || '' };
  }
  return out;
}

/* ---------------- from an ontology scenario to the application ---------------- */
/** Parameter priors carried by an ontology scenario: case-calibrated first, then the 2023 library. */
export function priors(s) {
  const e = s.estimates || {};
  const lib = e.library_2023 || e.library;
  const src = (e.case_calibrated || e.case)?.values ? (e.case_calibrated || e.case) : lib?.values ? lib : null;
  if (!src) return null;
  const v = k => { const x = src.values[k]; const n = Number(x?.value ?? x); return Number.isFinite(n) ? n : null; };
  return { basis: src === lib ? 'library 2023' : 'case-calibrated', confidence: src.confidence || 'L',
    PbA: v('PbA'), Pbx: v('Pbx'), De: v('De'), Dm: v('Dm'), Th: v('Th'), Mu: v('Mu'), cvss: v('cvss'), red_p: v('red_p'), red_i: v('red_i') };
}
/** Framework references in the application's catalogue notation. */
export function controlRefs(s) {
  const c = s.controls || {};
  return [...(c['iso27002-2022'] || []).map(x => 'ISO22:' + x.id), ...(c.csf2 || []).map(x => 'CSF2:' + x.id), ...(c['sp800-53r5'] || []).map(x => 'NIST-53:' + x.id)];
}
/** A Batch scenarios grid row from an ontology scenario. */
export function toBatchRow(s, { usePriors = true } = {}) {
  const P = usePriors ? priors(s) : null;
  const params = {}, rat = {}, conf = {};
  for (const k of ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu']) {
    const val = P && P[k] != null ? P[k] : 0.5;
    params[k] = Math.max(0.01, Math.min(1, val));
    rat[k] = P && P[k] != null
      ? `Prior from the CyberRiskGuardian Ontology (${s.id}, ${P.basis}) — not organizational evidence. ${MARK}`
      : `Default — scenario from the CyberRiskGuardian Ontology (${s.id}). ${MARK}`;
    conf[k] = 'Low';
  }
  const tech = (s.attack_techniques || []).map(t => t.id).filter(t => /^T\d{4}/.test(t));
  return { pick: true, crgoRow: true, name: (s.name || s.id) + ' [CRGO]', statement: s.statement || s.name || '', threat_source: (s.threat_source_types || []).map(t => t.label || t).join(', '),
    assets: (s.asset_categories || []).map(a => a.label || a).join('; '), vulns: (s.weaknesses || []).map(w => w.id + (w.title ? ' ' + w.title : '')).join('; '),
    attack: tech, cwe: (s.weaknesses || []).map(w => w.id).filter(w => /^CWE-/.test(w)), cves: [],
    params, rat, conf, cvss: '', cvss_score: P?.cvss ?? null, cvss_note: P?.cvss != null ? `CVSS input ${P.cvss} from the ontology prior — replace with the vector of the actual weakness.` : 'Set the CVSS in the scenario editor.',
    red_p: P?.red_p ?? 0.5, red_i: P?.red_i ?? 0.5, owner: '', pattern: 'crgo',
    crgo: { id: s.id, kind: s.kind, sector: s.sector, themes: (s.themes || []).map(t => t.key), asset_categories: (s.asset_categories || []).map(a => a.key || a.label || a),
      threat_source_types: (s.threat_source_types || []).map(t => t.key || t.label || t), controls: controlRefs(s),
      obligations: (s.obligations || []).map(o => o.id + ' — ' + o.title), basis: P?.basis || null, imported: new Date().toISOString().slice(0, 10) } };
}
