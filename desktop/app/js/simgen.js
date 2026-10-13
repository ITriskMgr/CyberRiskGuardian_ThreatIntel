/* simgen.js — simulation packs for teaching (Beta 1.6.x): the pack format "crg-simulation-pack/1", its
   validation against a workspace, and the AI prompt that asks a model for a new pack built on the
   CURRENT workspace (organization profile, scenarios, crown jewels, assets — nothing else).

   A pack bundles fictional SIEM and SOAR records ("crg-siem-import/1", "crg-soar-import/1",
   docs/SIEM-SOAR-IMPORT-FORMAT.md) with a teaching manifest: learning objectives, a day-by-day storyline
   and exercises. How a pack is designed: docs/SIMULATION-DATA-GUIDE.md.

   Dependency-free on purpose (no DOM, no workspace state): the functions take the workspace as an
   argument, so a script can validate or prepare packs outside the application too.

   Rules carried here:
     • Every record is fictional and marked so (pack "fictional": true, envelopes and records
       "simulation": true, fictional producers).
     • Only documentation addresses (RFC 5737 IPv4, RFC 3849 IPv6) and reserved domains (RFC 2606/6761:
       example.com/.net/.org, *.example, *.test, *.invalid) appear in observables and links.
     • References to scenarios and crown jewels are the ids of the workspace the pack is built for.
     • TLP 2.0 values only; source confidence is 0–100 and never a probability.
     • An alert is never imported as escalated; incident confirmations are left to the students.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

export const PACK_FORMAT = 'crg-simulation-pack/1';
export const SIEM_FORMAT = 'crg-siem-import/1';
export const SOAR_FORMAT = 'crg-soar-import/1';
export const TLP_VALUES = ['CLEAR', 'GREEN', 'AMBER', 'AMBER+STRICT', 'RED'];
export const FOCUS = [['ransomware', 'Ransomware'], ['phishing', 'Phishing and account takeover'], ['insider', 'Insider misuse'], ['supplier', 'Supplier or third-party compromise'], ['cloud', 'Cloud data exposure'], ['mixed', 'Mixed']];
export const INTENSITY = [['low', 'Low — mostly noise, one short intrusion'], ['medium', 'Medium — noise, false positives and one intrusion chain'], ['high', 'High — a fast intrusion chain and several gaps']];
export const LENGTH = [[7, '1 week'], [14, '2 weeks'], [21, '3 weeks']];

/* ---------------- the pack schema (JSON Schema, draft 2020-12 subset) ----------------
   The SIEM and SOAR envelopes are described field by field in docs/SIEM-SOAR-IMPORT-FORMAT.md; here
   only what the pack adds is constrained, plus the fields the validation reads. */
const str = { type: 'string' }, strs = { type: 'array', items: str }, date = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}' };
export const PACK_SCHEMA = {
  $id: 'crg-simulation-pack/1',
  title: 'CyberRiskGuardian simulation pack',
  type: 'object',
  required: ['format', 'id', 'title', 'case', 'fictional', 'description', 'learningObjectives', 'storyline', 'exercises'],
  properties: {
    format: { const: PACK_FORMAT },
    id: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{2,63}$', description: 'stable pack id, e.g. medibec-ransomware-2026' },
    version: str,
    title: str,
    case: { type: 'string', description: 'teaching case the pack is built for (e.g. "medibec"); the workspace must contain the scenario and crown-jewel ids the pack cites' },
    fictional: { const: true },
    language: { enum: ['en', 'fr'] },
    created: date,
    author: str,
    license: str,
    description: str,
    asOfHint: { type: 'string', description: 'the as-of date from which the teaching points hold' },
    timezone: str,
    scenarios: { ...strs, description: 'scenario ids of the workspace the storyline exercises (S1…)' },
    crownJewels: { ...strs, description: 'crown-jewel ids of the workspace touched (CJ1…)' },
    people: { ...strs, description: 'fictional people, each marked (fictional)' },
    learningObjectives: { type: 'array', minItems: 3, items: str },
    storyline: { type: 'array', minItems: 3, items: { type: 'object', required: ['day', 'date', 'text'], properties: { day: { type: 'integer' }, date, title: str, text: str, alerts: strs } } },
    exercises: { type: 'array', minItems: 3, items: { type: 'object', required: ['id', 'question', 'screen', 'expected'], properties: { id: str, question: str, screen: str, route: { type: 'string', pattern: '^#/' }, expected: str } } },
    expectedImport: { type: 'object', description: 'counts the import should report: {siem:{alerts:…}, soar:{cases:…}, soarSkipped:[{list,id,why}]}' },
    files: { type: 'array', items: { type: 'object', required: ['path', 'format'], properties: { path: str, format: { enum: [SIEM_FORMAT, SOAR_FORMAT] }, module: { enum: ['siem', 'soar'] } } } },
    siem: { type: 'object', description: 'inline crg-siem-import/1 envelope (a generated or downloaded pack carries its files inline)', required: ['format'], properties: { format: { const: SIEM_FORMAT }, simulation: { const: true } } },
    soar: { type: 'object', description: 'inline crg-soar-import/1 document', required: ['format'], properties: { format: { const: SOAR_FORMAT }, simulation: { const: true } } },
    i18n: { type: 'object', description: 'optional translations of the teaching texts: {fr: {title, description, learningObjectives[], storyline[{title,text}], exercises[{question, expected}]}}' },
  },
};

/** The teaching points a pack must make visible, and how validation recognises them (warnings when absent). */
export const TEACHING_MIX = [
  ['health', 'telemetry sources in the three states: healthy, degraded and silent (or stale)'],
  ['tests', 'detection tests both effective and ineffective, and at least one production rule never tested'],
  ['rules', 'rules in several lifecycle states (production, testing, draft or disabled)'],
  ['triage', 'alerts that are benign, false positives, and still new'],
  ['crown', 'at least one alert on a crown jewel'],
  ['tlp', 'indicators marked TLP:AMBER+STRICT and TLP:RED, and one stale (revoked or expired)'],
  ['approvals', 'approvals expired, revoked, refused (self-approval or rejected) and executions without any approval'],
  ['sims', 'playbook simulations that passed and that failed'],
];

/* ---------------- small helpers ---------------- */
const arr = v => Array.isArray(v) ? v : v == null || v === '' ? [] : String(v).split(/[;|,]/).map(s => s.trim()).filter(Boolean);
const lc = s => String(s ?? '').trim().toLowerCase();
export const normTlp = v => { const s = String(v ?? '').trim().toUpperCase().replace(/^TLP\s*:\s*/, '').replace(/\s+/g, ''); return s === 'WHITE' ? 'CLEAR' : TLP_VALUES.includes(s) ? s : ''; };
const ISO = /^\d{4}-\d\d-\d\d([T ]\d\d:\d\d(:\d\d)?(\.\d+)?(Z|[+-]\d\d:?\d\d)?)?$/;
const validDate = v => ISO.test(String(v)) && !Number.isNaN(Date.parse(String(v).slice(0, 10) + 'T00:00:00Z'));
const DATE_KEYS = new Set(['generated', 'created', 'detected', 'firstSeen', 'date', 'approvedOn', 'validFrom', 'validUntil', 'healthDate', 'lastSeen', 'raised', 'opened', 'started', 'ended',
  'decidedOn', 'revokedOn', 'requested', 'published', 'observed', 'recorded', 'sourceTime', 'acquired', 'sentAt', 'due', 'activityStart', 'at']);

/** RFC 5737 documentation IPv4 ranges. */
export const safeIPv4 = ip => /^(192\.0\.2|198\.51\.100|203\.0\.113)\.\d{1,3}$/.test(ip) && Number(ip.split('.')[3]) <= 255;
/** RFC 3849 documentation IPv6 prefix 2001:db8::/32. */
export const safeIPv6 = ip => /^2001:0?db8(:|$)/i.test(String(ip).trim());
/** Reserved names (RFC 2606, RFC 6761): example.com/.net/.org and their subdomains, *.example, *.test, *.invalid, *.localhost. */
export function safeDomain(d) {
  const h = lc(d).replace(/\.$/, '');
  return /(^|\.)example\.(com|net|org)$/.test(h) || /(^|\.)(example|test|invalid|localhost)$/.test(h);
}
const hostOf = u => { try { return new URL(u).hostname; } catch { return ''; } };

/** Ids of the workspace a pack may cite. */
export function workspaceRefs(ws) {
  const scen = new Set((ws?.assessment?.SCEN || []).map(s => s.id));
  const crown = (ws?.assessment?.CROWN || []).map(r => ({ id: String(r[0] || ''), name: String(r[1] || '') }));
  const assets = (ws?.assets || []).map(a => ({ id: String(a.id || ''), name: String(a.name || '') }));
  return { scen, crown, assets };
}
function assetKnown(ref, R) {
  const k = lc(ref); if (!k) return true;
  return R.crown.some(c => lc(c.id) === k || lc(c.name) === k) || R.assets.some(a => lc(a.id) === k || lc(a.name) === k);
}

/** Every string in a value, with its path (for the observable and date scans). */
function* walk(v, path = '') {
  if (v == null) return;
  if (typeof v === 'string') { yield [path, v]; return; }
  if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) yield* walk(v[i], `${path}[${i}]`); return; }
  if (typeof v === 'object') for (const [k, x] of Object.entries(v)) yield* walk(x, path ? `${path}.${k}` : k);
}
const IPV4_RE = /(?<![\d.])(\d{1,3}(?:\.\d{1,3}){3})(?![\d.])/g;
const URL_RE = /\b(?:https?|ftp):\/\/[^\s'"<>)]+/gi;
const EMAIL_RE = /\b[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})\b/gi;

/**
 * Validate a pack (manifest with its SIEM and SOAR files inline) against a workspace.
 * Returns { ok, errors[], warnings[], counts:{siem:{…}, soar:{…}}, mix:{…} }. Errors block an import;
 * warnings tell the educator what a teaching point lacks.
 */
export function validatePack(pack, ws, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const errors = [], warnings = [];
  const E = m => errors.push(m), W = m => warnings.push(m);
  if (!pack || typeof pack !== 'object' || Array.isArray(pack)) return { ok: false, errors: ['The pack is not a JSON object.'], warnings, counts: {}, mix: {} };
  if (pack.format !== PACK_FORMAT) E(`"format" must be "${PACK_FORMAT}".`);
  if (pack.fictional !== true) E('"fictional" must be true: simulation packs hold fictional data only.');
  for (const k of ['id', 'title', 'case', 'description']) if (!String(pack[k] || '').trim()) E(`"${k}" is required.`);
  if (pack.id && !/^[a-z0-9][a-z0-9-]{2,63}$/.test(pack.id)) E('"id" must be lower-case letters, digits and hyphens (3–64 characters).');
  for (const [k, min] of [['learningObjectives', 3], ['storyline', 3], ['exercises', 3]]) {
    if (!Array.isArray(pack[k])) E(`"${k}" must be a list.`);
    else if (pack[k].length < min) W(`"${k}" has ${pack[k].length} entr${pack[k].length === 1 ? 'y' : 'ies'}; at least ${min} are expected.`);
  }
  for (const [i, x] of (Array.isArray(pack.exercises) ? pack.exercises : []).entries()) {
    if (!x || !x.question || !x.expected || !x.screen) E(`exercises[${i}] needs a question, the screen to use and the expected finding.`);
    if (x?.route && !/^#\//.test(x.route)) W(`exercises[${i}].route should start with "#/".`);
  }
  for (const [i, s] of (Array.isArray(pack.storyline) ? pack.storyline : []).entries()) if (!s || !validDate(s.date) || !s.text) E(`storyline[${i}] needs a date (YYYY-MM-DD) and a text.`);

  const siem = pack.siem, soar = pack.soar;
  if (!siem && !soar) E('The pack carries neither a "siem" nor a "soar" file.');
  if (siem) { if (siem.format !== SIEM_FORMAT) E(`siem.format must be "${SIEM_FORMAT}".`); if (siem.simulation !== true) E('siem.simulation must be true (fictional marking).'); }
  if (soar) { if (soar.format !== SOAR_FORMAT) E(`soar.format must be "${SOAR_FORMAT}".`); if (soar.simulation !== true) E('soar.simulation must be true (fictional marking).'); }
  const L = (doc, k) => { if (!doc || doc[k] == null) return []; if (!Array.isArray(doc[k])) { E(`${doc === siem ? 'siem' : 'soar'}.${k} must be a list.`); return []; } return doc[k]; };
  const S = Object.fromEntries(['sources', 'strategies', 'rules', 'tests', 'alerts', 'indicators', 'gaps', 'coverage', 'events'].map(k => [k, L(siem, k)]));
  const O = Object.fromEntries(['playbooks', 'gates', 'cases', 'approvals', 'executions', 'simulations', 'lessons', 'impacts', 'communications', 'recoveries', 'measurements', 'artefacts', 'confirmations'].map(k => [k, L(soar, k)]));
  const counts = { siem: Object.fromEntries(Object.entries(S).map(([k, v]) => [k, v.length])), soar: Object.fromEntries(Object.entries(O).map(([k, v]) => [k, v.length])) };

  /* references to the workspace */
  const R = workspaceRefs(ws);
  const scenRef = (id, where) => { if (id && !R.scen.has(String(id))) E(`${where}: scenario ${id} is not in this workspace.`); };
  const assetRef = (ref, where) => {
    if (!ref) return;
    if (/^CJ\d+$/i.test(String(ref).trim())) { if (!R.crown.some(c => lc(c.id) === lc(ref))) E(`${where}: crown jewel ${ref} is not in this workspace.`); }
    else if (!assetKnown(ref, R)) W(`${where}: "${ref}" is neither an asset nor a crown jewel of this workspace (kept as text; it will not weigh in triage).`);
  };
  arr(pack.scenarios).forEach(id => scenRef(id, 'manifest.scenarios'));
  arr(pack.crownJewels).forEach(id => assetRef(id, 'manifest.crownJewels'));
  S.rules.forEach(r => arr(r.scenarios).forEach(id => scenRef(id, `rule ${r.id || r.title}`)));
  S.alerts.forEach(a => { arr(a.scenarios).forEach(id => scenRef(id, `alert ${a.id || a.title}`)); assetRef(a.asset, `alert ${a.id || a.title}`); });
  S.sources.forEach(s => assetRef(s.asset, `source ${s.id || s.name}`));
  S.gaps.forEach(g => scenRef(g.scenario, `gap ${g.id || g.title}`));
  S.coverage.forEach(c => scenRef(c.scenario, `coverage ${c.id}`));
  O.playbooks.forEach(p => arr(p.scenarios).forEach(id => scenRef(id, `playbook ${p.id}`)));
  O.simulations.forEach(s => scenRef(s.scenario, `simulation ${s.id}`));
  O.lessons.forEach(l => arr(l.scenarios).forEach(id => scenRef(id, `lesson ${l.id}`)));
  O.cases.forEach(c => arr(c.assets).forEach(a => assetRef(a, `case ${c.id}`)));
  if (!R.scen.size) W('This workspace has no risk scenarios: the pack cannot be linked to them.');

  /* references inside the pack */
  const ids = k => new Set(k.map(x => x?.id).filter(Boolean));
  const srcIds = ids(S.sources), ruleIds = new Set([...ids(S.rules), ...S.rules.map(r => r.ruleId).filter(Boolean)]), indIds = ids(S.indicators);
  S.rules.forEach(r => { if (!r.title) E(`rule ${r.id || '?'}: title required.`); arr(r.requiredSources).forEach(s => { if (!srcIds.has(s)) W(`rule ${r.id}: required source ${s} is not in the pack (counts as silent).`); }); });
  S.tests.forEach(t => { if (!ruleIds.has(t.ruleId)) W(`test ${t.id}: rule ${t.ruleId} is not in the pack.`); if (!['effective', 'ineffective'].includes(lc(t.result))) E(`test ${t.id}: result must be effective or ineffective.`); });
  S.alerts.forEach(a => {
    if (!a.title) E(`alert ${a.id || '?'}: title required.`);
    if (a.ruleId && !ruleIds.has(a.ruleId)) W(`alert ${a.id}: rule ${a.ruleId} is not in the pack.`);
    arr(a.indicators).forEach(i => { if (!indIds.has(i)) W(`alert ${a.id}: indicator ${i} is not in the pack.`); });
    if (lc(a.triage) === 'escalated') E(`alert ${a.id}: "escalated" is not accepted from a file — escalation is done in the application.`);
    (a.events || []).forEach(e => { if (e && (e.payload || e.raw || e.message)) E(`alert ${a.id}: events are pointers only (ref, sourceId, sourceTime, hash) — no payload.`); });
  });
  const caseIds = ids(O.cases), aprIds = ids(O.approvals), pbIds = ids(O.playbooks), gateIds = ids(O.gates);
  O.executions.forEach(x => { if (x.case && !caseIds.has(x.case)) W(`execution ${x.id}: case ${x.case} is not in the pack.`); arr(x.approval).forEach(a => { if (!aprIds.has(a)) W(`execution ${x.id}: approval ${a} is not in the pack.`); }); if (x.playbook && !pbIds.has(x.playbook)) W(`execution ${x.id}: playbook ${x.playbook} is not in the pack.`); });
  O.playbooks.forEach(p => (p.versions || []).forEach(v => (v.steps || []).forEach(s => { if (s.gate && !gateIds.has(s.gate)) W(`playbook ${p.id} v${v.version}: gate ${s.gate} is not in the pack.`); })));
  O.approvals.forEach(a => { if (a.outcome && a.outcome !== 'requested' && a.approver && lc(a.approver) === lc(a.requestedBy)) W(`approval ${a.id}: self-approval — the import will refuse this record (a teaching point if intended).`); });
  if (O.confirmations.length) W('soar.confirmations create incidents on import. Prefer to let the students confirm incidents themselves.');

  /* fictional markings */
  const unmarked = [...Object.entries(S), ...Object.entries(O).filter(([k]) => k !== 'confirmations')].reduce((n, [, rows]) => n + rows.filter(r => r && r.simulation !== true).length, 0);
  if (unmarked) W(`${unmarked} record(s) do not carry "simulation": true. The import marks them anyway; mark them in the file so a copy outside the application stays recognisable.`);
  S.alerts.forEach(a => { if (a.sourceSystem && !/fiction|simulat/i.test(a.sourceSystem)) W(`alert ${a.id}: source system "${a.sourceSystem}" should say it is fictional or simulated.`); });
  S.indicators.forEach(i => { if (i.source && !/fiction|simulat/i.test(i.source)) W(`indicator ${i.id}: source "${i.source}" should say it is fictional or simulated.`); });

  /* observables: documentation addresses and reserved domains only */
  const bad = new Set();
  for (const [p, s] of walk({ siem, soar, storyline: pack.storyline, exercises: pack.exercises, description: pack.description })) {
    for (const m of s.matchAll(IPV4_RE)) if (!safeIPv4(m[1]) && !/version|parser/i.test(p)) bad.add(`${p}: IPv4 ${m[1]} is outside the documentation ranges 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (RFC 5737)`);
    for (const m of s.matchAll(URL_RE)) { const h = hostOf(m[0]); if (h && !safeDomain(h) && !(/^[\d.]+$/.test(h) && safeIPv4(h)) && !(h.startsWith('[') && safeIPv6(h.slice(1, -1)))) bad.add(`${p}: URL host ${h} is not a reserved example domain`); }
    for (const m of s.matchAll(EMAIL_RE)) if (!safeDomain(m[1])) bad.add(`${p}: e-mail domain ${m[1]} is not a reserved example domain`);
  }
  for (const i of S.indicators) {
    const t = lc(i.type), v = String(i.value || '');
    if (t === 'domain-name' && v && !safeDomain(v)) bad.add(`indicator ${i.id}: domain ${v} is not a reserved example domain (example.com/.net/.org, *.example, *.test)`);
    if (t === 'ipv6-addr' && v && !safeIPv6(v)) bad.add(`indicator ${i.id}: IPv6 ${v} is outside 2001:db8::/32 (RFC 3849)`);
    if (t === 'ipv4-addr' && v && !safeIPv4(v)) bad.add(`indicator ${i.id}: IPv4 ${v} is outside the documentation ranges (RFC 5737)`);
    if (t.startsWith('file:') && v && !/^[a-f0-9]{32,64}$/i.test(v)) bad.add(`indicator ${i.id}: hash ${v} is not hexadecimal`);
    const pm = /\[\s*(domain-name|ipv4-addr|ipv6-addr|url|email-addr):value\s*=\s*'([^']*)'/.exec(String(i.pattern || ''));
    if (pm) { const [, pt, pv] = pm; if ((pt === 'domain-name' && !safeDomain(pv)) || (pt === 'ipv4-addr' && !safeIPv4(pv)) || (pt === 'ipv6-addr' && !safeIPv6(pv))) bad.add(`indicator ${i.id}: pattern value ${pv} is not a documentation address or reserved domain`); }
  }
  bad.forEach(E);

  /* TLP and confidence */
  if (siem?.tlp && !normTlp(siem.tlp)) E(`siem.tlp "${siem.tlp}" is not a TLP 2.0 value (CLEAR, GREEN, AMBER, AMBER+STRICT, RED).`);
  for (const [k, rows] of [['alert', S.alerts], ['indicator', S.indicators]]) for (const r of rows) {
    if (r.tlp != null && r.tlp !== '' && !normTlp(r.tlp)) E(`${k} ${r.id}: TLP "${r.tlp}" is not a TLP 2.0 value.`);
    if (r.confidence != null && r.confidence !== '' && !(typeof r.confidence === 'number' && r.confidence >= 0 && r.confidence <= 100)) E(`${k} ${r.id}: confidence must be a number from 0 to 100 (source confidence, not a probability).`);
  }
  S.indicators.forEach(i => { if (i.confidence != null && /probab/i.test(String(i.confidenceMethod || '')) && !/not a probab/i.test(String(i.confidenceMethod || ''))) W(`indicator ${i.id}: the confidence method calls it a probability — source confidence is never a probability.`); });

  /* dates */
  const horizon = String(Number(today.slice(0, 4)) + 1) + today.slice(4);
  for (const [p, s] of walk({ siem, soar, storyline: pack.storyline })) {
    const key = p.split('.').pop().replace(/\[\d+\]$/, '');
    if (!DATE_KEYS.has(key) || s === '') continue;
    if (!validDate(s)) { E(`${p}: "${s}" is not an ISO 8601 date.`); continue; }
    if (key !== 'validUntil' && key !== 'due' && s.slice(0, 10) > horizon) W(`${p}: ${s.slice(0, 10)} is more than a year ahead — the storyline should be in the past of the as-of date.`);
  }
  for (const r of S.sources) for (const h of r.healthHistory || []) if (!validDate(h.date)) E(`source ${r.id}: health observation date "${h.date}" is not an ISO date.`);
  for (const r of S.rules) for (const h of r.history || []) if (!validDate(h.date)) E(`rule ${r.id}: history date "${h.date}" is not an ISO date.`);

  /* the teaching mix */
  const states = new Set(S.sources.flatMap(s => [(s.healthHistory || []).slice(-1)[0]?.state || s.health, s.lastSeen && s.cadenceHours ? 'silent' : null].filter(Boolean)));
  const tested = new Set(S.tests.map(t => t.ruleId)), results = new Set(S.tests.map(t => lc(t.result)));
  const triage = new Set(S.alerts.map(a => lc(a.triage) || 'new')), tlps = new Set(S.indicators.map(i => normTlp(i.tlp)));
  const crownAlert = S.alerts.some(a => /^CJ\d+$/i.test(String(a.asset || '')) || (a.asset && R.crown.some(c => lc(c.name) === lc(a.asset))));
  const reasons = O.approvals.reduce((s, a) => { if (a.revokedOn) s.add('revoked'); if (a.validUntil) s.add('dated'); if (a.outcome === 'rejected' || (a.approver && lc(a.approver) === lc(a.requestedBy))) s.add('refused'); return s; }, new Set());
  const mix = {
    health: ['healthy', 'degraded', 'silent'].every(x => states.has(x)),
    tests: results.has('effective') && results.has('ineffective') && S.rules.some(r => lc(r.status) === 'production' && !tested.has(r.id)),
    rules: new Set(S.rules.map(r => lc(r.status) || 'draft')).size >= 3,
    triage: ['benign', 'false-positive', 'new'].every(x => triage.has(x)),
    crown: crownAlert,
    tlp: tlps.has('AMBER+STRICT') && tlps.has('RED') && S.indicators.some(i => i.revoked || (i.validUntil && String(i.validUntil).slice(0, 10) < today)),
    approvals: reasons.has('revoked') && reasons.has('dated') && reasons.has('refused') && O.executions.some(x => !arr(x.approval).length && ['containment', 'destructive', 'administrative'].includes(x.riskClass)),
    sims: O.simulations.some(s => s.result === 'passed') && O.simulations.some(s => s.result === 'failed'),
  };
  if (siem) for (const [k, label] of TEACHING_MIX.slice(0, 6)) if (!mix[k]) W(`Teaching point missing: ${label}.`);
  if (soar) for (const [k, label] of TEACHING_MIX.slice(6)) if (!mix[k]) W(`Teaching point missing: ${label}.`);
  return { ok: !errors.length, errors, warnings, counts, mix };
}

/* ---------------- the AI prompt ---------------- */
/** The rules of docs/SIMULATION-DATA-GUIDE.md a model must follow, in the words of the guide. */
export const GUIDE_RULES = [
  'Everything is FICTIONAL. Set "fictional": true on the pack and "simulation": true on the siem and soar envelopes and on every record. Name producers and source systems as fictional (e.g. "Simulated SIEM (fictional)").',
  'People are fictional: invent names, mark them "(fictional)" in manifest.people. Never use a real person, company, product or malware family name.',
  'Observables: IPv4 only from 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (RFC 5737); IPv6 only from 2001:db8::/32 (RFC 3849); domains only example.com, example.net, example.org or names ending in .example or .test; hashes are made-up hexadecimal strings. Hosts may have internal-looking names (e.g. SRV-EHR-01).',
  'Use only the scenario ids (S…) and crown-jewel ids (CJ…) listed below. Put a crown-jewel id in alert.asset when the alert concerns one; leave it empty otherwise.',
  'ATT&CK technique ids must be real ATT&CK Enterprise ids (T#### or T####.###) that fit the event. When unsure, leave techniques empty.',
  'Storyline: consecutive days in the past, ending at least two days before today; one time zone, times written YYYY-MM-DDTHH:MM:SS without a zone. Mix routine noise, false positives and benign alerts with ONE intrusion chain that reaches a crown jewel.',
  'Events are pointers only: {ref, sourceId, sourceTime, hash}. Never a log payload.',
  'Never set alert triage to "escalated" (escalation happens in the application) and never include soar.confirmations: students confirm incidents themselves.',
  'TLP 2.0 values only (CLEAR, GREEN, AMBER, AMBER+STRICT, RED); include at least one AMBER+STRICT and one RED indicator. Confidence is an integer 0-100 stated by the (fictional) source, with confidenceMethod saying it is not a probability.',
  'Make every teaching point appear: telemetry healthy, degraded and silent (or stale: lastSeen older than three cadences); detection tests effective and ineffective, with test dates before the storyline and at least one production rule never tested; rules in production, testing and draft or disabled; alerts benign, false-positive, in-triage and new; indicators revoked or expired; approvals expired, revoked, rejected, one self-approval attempt and one approved by someone outside the gate authorities; executions of containment actions with no approval; playbook simulations passed and failed.',
  'Containment and destructive actions always need an approval through a gate; a pre-authorisation needs riskClasses, validUntil and a scope (targets, case or scope text).',
  'Detection rules reference only sources in the file (requiredSources); tests reference rules and the rule version they tested.',
  'Do not state risk scores, probabilities or parameter changes: the pack is operational evidence for teaching, not an assessment.',
];

/** A compact field list of the two import formats — what the model must produce. */
export const FORMAT_SPEC = `PACK (one JSON object):
{ "format":"${PACK_FORMAT}", "id":"<case>-<focus>-<year>", "version":"1.0", "title":"", "case":"<case id>", "fictional":true, "language":"en|fr",
  "created":"YYYY-MM-DD", "description":"", "asOfHint":"", "timezone":"", "scenarios":["S…"], "crownJewels":["CJ…"], "people":["Name (fictional)"],
  "learningObjectives":[""], "storyline":[{"day":1,"date":"YYYY-MM-DD","title":"","text":"","alerts":["AL-…"]}],
  "exercises":[{"id":"EX-01","question":"","screen":"SIEM → Alerts & triage","route":"#/siem/alerts","expected":""}],
  "files":[{"path":"siem.json","format":"${SIEM_FORMAT}","module":"siem"},{"path":"soar.json","format":"${SOAR_FORMAT}","module":"soar"}],
  "siem":{ "format":"${SIEM_FORMAT}", "simulation":true, "generated":"", "source":"", "tlp":"AMBER",
    "sources":[{"id":"TS-…","name":"","system":"","asset":"CJ…|","ocsfClass":3002,"logsource":{"product":"","service":"","category":""},"cadenceHours":1,"lastSeen":"","healthHistory":[{"date":"","state":"healthy|degraded|silent","note":""}],"simulation":true}],
    "rules":[{"id":"DR-…","title":"","version":"1","language":"sigma|native|correlation","ruleId":"","status":"production|testing|draft|disabled|retired","level":"low|medium|high|critical","owner":"","approvedBy":"","created":"","techniques":["T…"],"scenarios":["S…"],"requiredSources":["TS-…"],"detection":"","simulation":true}],
    "tests":[{"id":"DT-…","ruleId":"DR-…","ruleVersion":"1","date":"","tester":"","result":"effective|ineffective","method":"replay|emulation|purple-team|unit|other","simulation":true}],
    "alerts":[{"id":"AL-…","externalId":"","version":1,"sourceSystem":"Simulated SIEM (fictional)","title":"","ruleId":"DR-…","detected":"","severity":"low|medium|high|critical","confidence":70,"asset":"CJ…|","techniques":["T…"],"scenarios":["S…"],"indicators":["IND-…"],"tlp":"","triage":"new|in-triage|benign|false-positive","assignee":"","events":[{"ref":"","sourceId":"TS-…","sourceTime":"","hash":"sha256:…"}],"simulation":true}],
    "indicators":[{"id":"IND-…","type":"domain-name|ipv4-addr|ipv6-addr|url|email-addr|file:sha256","value":"","name":"","validFrom":"","validUntil":"","confidence":70,"confidenceMethod":"Source confidence 0-100 as stated by the fictional producer — not a probability","source":"… (fictional)","tlp":"CLEAR|GREEN|AMBER|AMBER+STRICT|RED","revoked":false,"techniques":["T…"],"simulation":true}],
    "gaps":[{"id":"GAP-…","title":"","scenario":"S…","technique":"T…","source":"TS-…","status":"open|accepted","raised":"","simulation":true}] },
  "soar":{ "format":"${SOAR_FORMAT}", "simulation":true,
    "gates":[{"id":"GATE-…","name":"","riskClasses":["containment","destructive"],"criticalAssets":true,"authorities":[""],"simulation":true}],
    "playbooks":[{"id":"PB-…","name":"","owner":"","category":"malware|unauthorised-access|data-exposure|social-engineering|insider-misuse|…","trigger":{"kind":"alert|manual","conditions":""},"scenarios":["S…"],
      "versions":[{"version":1,"state":"published|draft|retired","published":"YYYY-MM-DD","publishedBy":"","steps":[{"id":"ST-1","name":"","action":"","riskClass":"read-only|administrative|containment|destructive","gate":"GATE-…","requiresGate":false,"evidence":""}]}],"simulation":true}],
    "cases":[{"id":"CASE-…","title":"","source":{"kind":"alert","id":"AL-…"},"opened":"YYYY-MM-DDTHH:MM","status":"open|investigating|contained|eradicated|recovered|closed","severity":"","category":"","alerts":["AL-…"],"assignee":"","assets":["CJ…"],"target":"","statusDates":{},"timeline":[{"at":"","by":"","text":""}],"simulation":true}],
    "approvals":[{"id":"APR-…","kind":"specific|pre-authorisation","gate":"GATE-…","requestedBy":"","requested":"","outcome":"requested|approved|rejected","approver":"","decidedOn":"","validFrom":"","validUntil":"","case":"CASE-…","action":"","targets":[""],"riskClasses":[],"scope":"","revokedOn":"","revokedBy":"","rationale":"","simulation":true}],
    "executions":[{"id":"EXE-…","case":"CASE-…","playbook":"PB-…","version":1,"step":"ST-…","action":"","riskClass":"","target":"","criticalAsset":false,"performedBy":"","attempt":"att-…","started":"","ended":"","status":"succeeded|partial|failed|cancelled","approval":"APR-…","evidence":[""],"simulation":true}],
    "simulations":[{"id":"SIM-…","playbook":"PB-…","version":1,"date":"","by":"","result":"passed|failed","scenario":"S…","simulation":true}] } }`;

/** What of the workspace goes into the prompt: profile fields, scenarios, crown jewels, assets — no notes, documents, keys or figures. */
export function promptContext(ws) {
  const o = ws?.org || {};
  const prof = [['Organization', o.name || ws?.name], ['Sector', o.sector], ['Size', o.size], ['Region', o.region], ['Mission', o.mission], ['Services', o.services],
    ['Critical processes', o.processes], ['Systems', o.systems], ['Cloud', o.cloud], ['Suppliers', o.suppliers], ['Obligations', (o.regulations || []).join('; ')],
    ['Sensitive information', o.sensitive], ['Availability needs', o.availability], ['Existing controls', o.maturity]].filter(([, v]) => String(v || '').trim()).map(([k, v]) => `${k}: ${String(v).replace(/\s+/g, ' ').slice(0, 400)}`);
  const scen = (ws?.assessment?.SCEN || []).filter(s => !(ws.excluded || []).includes(s.id)).slice(0, 40)
    .map(s => `${s.id} | ${String(s.name || '').slice(0, 140)} | ATT&CK ${(Array.isArray(s.attack) ? s.attack : String(s.attack || '').match(/T\d{4}(?:\.\d{3})?/g) || []).join(',') || '—'}`);
  const crown = (ws?.assessment?.CROWN || []).slice(0, 20).map(r => `${r[0]} | ${r[1]}${r[7] ? ' | depends on: ' + String(r[7]).slice(0, 160) : ''}`);
  const assets = (ws?.assets || []).slice(0, 60).map(a => `${a.id} | ${a.name || ''}${a.type ? ' | ' + a.type : ''}${a.crown || a.crownJewel ? ' | crown jewel' : ''}`);
  return { prof, scen, crown, assets };
}

/**
 * The prompt for a new pack. options: { caseId, days (7|14|21), intensity, focus, alerts (count), language ('en'|'fr'), today }.
 * Returns { system, prompt, max_tokens, json }.
 */
export function buildPrompt(ws, options = {}) {
  const o = { caseId: '', days: 14, intensity: 'medium', focus: 'ransomware', alerts: 25, language: 'en', today: new Date().toISOString().slice(0, 10), ...options };
  const caseId = String(o.caseId || ws?.name || 'case').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'case';
  const C = promptContext(ws);
  const focus = (FOCUS.find(f => f[0] === o.focus) || FOCUS[0])[1], intensity = (INTENSITY.find(f => f[0] === o.intensity) || INTENSITY[1])[1];
  const nAlerts = Math.max(8, Math.min(40, Number(o.alerts) || 25));
  const body = [
    'TASK: simulation_pack',
    'Create a FICTIONAL simulation pack of SIEM and SOAR records for a cybersecurity classroom, built on the teaching case described below. The data will be imported into CyberRiskGuardian for students to triage alerts, assess detection coverage and audit response approvals.',
    '',
    'CASE PROFILE (from the workspace):', ...(C.prof.length ? C.prof : ['(no profile recorded)']), '',
    'RISK SCENARIOS (id | name | ATT&CK techniques linked by the analyst):', ...(C.scen.length ? C.scen : ['(none)']), '',
    'CROWN JEWELS (id | name | dependencies):', ...(C.crown.length ? C.crown : ['(none)']), '',
    ...(C.assets.length ? ['INFORMATION ASSETS (id | name | type):', ...C.assets, ''] : []),
    'PARAMETERS:',
    `- case id: ${caseId}`,
    `- storyline length: ${o.days} days, ending no later than two days before ${o.today}`,
    `- focus of the intrusion chain: ${focus}`,
    `- intensity: ${intensity}`,
    `- number of alerts: about ${nAlerts} (8-12 telemetry sources, 8-12 detection rules, 10-15 indicators, 3-5 playbooks, 3-4 cases)`,
    `- language of the texts (titles, descriptions, storyline, exercises, notes): ${o.language === 'fr' ? 'Canadian French' : 'English'}; JSON keys and enumerated values stay in English`,
    '',
    'RULES (from the CyberRiskGuardian simulation-data guide):', ...GUIDE_RULES.map((r, i) => `${i + 1}. ${r}`), '',
    'Write 6-10 exercises: each asks one question, names the screen to use and states the expected finding with the record ids. Write 5-9 learning objectives. Give the storyline day by day with the alert ids of each day.',
    'Fill "expectedImport" with the number of records per list ({"siem":{"alerts":n,…},"soar":{"cases":n,…}}).',
    '',
    'FORMAT:', FORMAT_SPEC, '',
    'Return the pack as ONE JSON object and nothing else: no prose, no code fence. Keep it compact (no indentation).',
  ];
  return {
    system: 'You write fictional training data for cybersecurity education. Everything you produce is invented and must be recognisable as such: documentation IP ranges, reserved example domains, fake hashes, fictional people and products. You never reproduce real indicators, real malware names or real organizations other than the teaching case given. You return JSON only.',
    prompt: body.join('\n'), max_tokens: 24000, json: true,
  };
}

/** A pack loaded from the bundled files: the manifest with its SIEM and SOAR documents inline. */
export async function loadBundled(manifestUrl, fetcher = fetch) {
  const base = manifestUrl.replace(/[^/]*$/, '');
  const m = await (await fetcher(manifestUrl)).json();
  const pack = { ...m };
  for (const f of m.files || []) {
    const doc = await (await fetcher(base + f.path)).json();
    if (f.format === SIEM_FORMAT || f.module === 'siem') pack.siem = doc;
    else if (f.format === SOAR_FORMAT || f.module === 'soar') pack.soar = doc;
  }
  return pack;
}

/** The teaching texts in a language, from the pack's i18n block when it has one. */
export function localised(pack, lang = 'en') {
  const t = lang !== (pack.language || 'en') ? pack.i18n?.[lang] : null;
  if (!t) return pack;
  const ex = (pack.exercises || []).map((x, i) => ({ ...x, ...(t.exercises?.[i] || {}) }));
  const st = (pack.storyline || []).map((x, i) => ({ ...x, ...(t.storyline?.[i] || {}) }));
  return { ...pack, title: t.title || pack.title, description: t.description || pack.description, learningObjectives: t.learningObjectives || pack.learningObjectives, exercises: ex, storyline: st };
}
