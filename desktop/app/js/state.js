/* state.js — workspaces (one per organization, business case or class team) and derived results.
   The calculation itself is always CRG.calc from the verified crg.js engine.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as LOG from './logs.js';
import * as store from './store.js';
import { uid, today, val } from './util.js';
import * as MIG from './migrate.js';
import { VERSION } from './version.js';
import { FIXED_ID } from './teaching.js';

export const SCHEMA = 'crg-workspace/1';
const listeners = new Set();
export const S = { ws: null, list: [], snap: null, persistent: true,
  /* 1.5.8 — workspaces written by a newer release are open read-only (never saved over), and the outcome
     of the last migration is kept for the screen that explains it. */
  readOnly: new Set(), migration: null, migrations: [], metaMigration: null };
export const isReadOnly = (w = S.ws) => !!w && S.readOnly.has(w.id);

export function on(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function emit(what = 'change') { for (const f of listeners) { try { f(what); } catch (e) { console.error(e); } } }

/* ---------------- workspace factory ---------------- */
export function blankOrg() {
  return { name: '', context: '', sector: '', size: '', employees: '', region: '', mission: '', services: '', processes: '',
    systems: '', cloud: '', suppliers: '', regulations: [], sensitive: '', availability: '', maturity: '',
    incidents: '', controls: '', notes: '', materiality: '',
    // 1.9.2 (NV-035, step 3): what the assessment covers and leaves out, and the risk perspectives it takes (book ch. 5)
    scope: '', exclusions: '', perspectives: '' };
}
export function newWorkspace({ name = 'New organization', kind = 'organization', assessment = null, org = null } = {}) {
  const now = new Date().toISOString(), id = uid('ws');
  return {
    schema: SCHEMA, id, name, kind, created: now, modified: now,
    org: Object.assign(blankOrg(), org || {}, { name: (org && org.name) || (kind === 'classroom' ? '' : name) }),
    classroom: kind === 'classroom' ? { course: '', case_title: '', team: '', members: '', instructor: '', due: '', notes: '' } : null,
    assessment: assessment || { APPETITE: 0.30, FACTOR: 1000, CURRENCY: 'CAD', PERIOD: 'next 12 months',
      SOURCE: 'Organization documents supplied by the analyst', SCEN: [], INITIATIVES: [], KRIS: [], EVIDENCE: [], CANDIDATES: [], CROWN: [] },
    appetite_rationale: '',
    budget: { it_budget: 0, spend: 0, baseline: 0 }, budgetYears: null, budgetYear: null, initPlan: {},
    excluded: [], decisions: {}, vulns: [], docs: [], snapshot: null,
    kriDefs: [], kriHistory: [],
    // 1.4.0
    measures: [], risks: [], assets: [], assetLog: [], compliance: { frameworks: [], soa: {}, checklists: {} },
    iocWatch: [], feedNotes: {}, published: [], library: [],
    // 1.5.8 — every field a workspace can hold is present from the start, and the data version is recorded
    recommendations: [], revisionLog: [], linkLog: [], linkDraft: null, batchDraft: null, batchSeed: null, batchSpread: null,
    safeguards: [], maturity: null, exposureText: '', discoverySeen: {}, feedState: {}, feedLog: [], kriSel: null, kriSelMode: null,
    userAudit: [], resetLog: [], crownProv: {}, educational: null, importLog: [], importPlan: null, assetScoreHist: [],
    ontology: { themes: [] }, isp: { policies: [], issues: [], ...MIG.blankIspExtra() }, ai: null, teaching: null,
    grc: MIG.blankGrc(), audit: MIG.blankAudit(), csm: MIG.blankCsm(), isms: MIG.blankIsms(), crgo: MIG.blankCrgo(id),
    shared: MIG.blankShared(), cms: MIG.blankCms(), siem: MIG.blankSiem(), soar: MIG.blankSoar(),
    // 1.8.0
    screening: MIG.blankScreening(), mgmtSummary: MIG.blankSummary(), catalogueMigration: [],
    // 1.9.0 — data version 4: every field of migrate.js STEP4
    ...MIG.fieldsV4(),
    // 1.9.2 — data version 6: every field of migrate.js STEP6 (js/migrate192.js)
    ...MIG.fieldsV6(),
    dataVersion: MIG.DATA_VERSION, appVersion: VERSION, migrationLog: [],
  };
}

export function medibecWorkspace() {
  const a = JSON.parse(JSON.stringify(self.CRG_MEDIBEC));
  const ws = newWorkspace({ name: 'MediBec — teaching case (fictional)', kind: 'example', assessment: a, org: {
    name: 'MediBec (fictional)', sector: 'Healthcare — private clinic network', size: 'Mid-sized',
    region: 'Quebec, Canada', mission: 'Integrated outpatient care across 10 clinics (Montreal, Quebec City, Gatineau, Saguenay).',
    services: 'Clinical consultations, radiology imaging, laboratory, pharmacy, online booking and patient portal, teleconsultation.',
    processes: 'Clinical documentation and continuity of care; diagnosis and results; medication management; scheduling; billing.',
    systems: 'Integrated EHR; radiology, laboratory and pharmacy systems; billing; scheduling; e-mail and communications; connected medical equipment.',
    cloud: 'Cloud-based remote access; cloud medical-image transfer storage.',
    suppliers: 'EHR vendor; imaging, laboratory and pharmacy system vendors; hosting and online service providers.',
    regulations: ['Quebec Law 25 (Act respecting the protection of personal information in the private sector)', 'PIPEDA'],
    sensitive: 'Personal health information of patients; staff personal information; payment data.',
    availability: 'Clinical systems are needed during clinic hours; EHR outage halts consultations.',
    maturity: 'Firewalls, IDS/IPS, antimalware, encrypted storage, on-site and off-site backups; two dedicated security staff.',
    notes: 'Source: MediBec business case v2.0b (fictional teaching case). All figures are illustrative.' } });
  ws.budget = { it_budget: 100000000, spend: 912000, baseline: 912000 };
  ws.budgetYears = null; ensureBudgetYears(ws);
  ws.appetite_rationale = 'Healthcare provider handling personal health information under Quebec Law 25: low appetite (0.30). Analytical estimate — validation required.';
  ws.classroom = null;
  // 1.8.0 — the screening of the 45 candidates into ten families, from the case's selection workbook
  if (self.CRG_MEDIBEC_SCREENING) ws.screening = JSON.parse(JSON.stringify(self.CRG_MEDIBEC_SCREENING));
  // 1.9.0 — the identity & access management and configuration management samples of the case (evidence only, nothing accepted)
  MIG.seedModules(ws);
  ws.org.materiality = 'Any credible threat to clinical decisions or patient safety; any exposure of health information for many patients; any loss of clinical systems at several clinics beyond a working day. Analytical estimate — validation required.';
  return ws;
}

/* ---------------- the bundled teaching examples (1.9.0) ----------------
   Four workspaces ship with the application: MediBec (English, the reference case), MediBec in French,
   and CanaRetail in English and in French. Each language version carries the same numbers, so its totals
   match its own reference in the start-up self-check. The case a workspace was built from is recorded in
   ws.teaching.case (a field of the NAMING reset group, so starting over always rebuilds the right one); a
   workspace without it is MediBec, as every example before 1.9.0. */
export const EXAMPLES = [
  { id: 'medibec', label: 'Teaching example: MediBec — private healthcare (English)', lang: 'en', data: () => self.CRG_MEDIBEC },
  { id: 'medibec-fr', label: 'Teaching example: MediBec — private healthcare (French)', lang: 'fr', data: () => self.CRG_MEDIBEC_FR },
  { id: 'canaretail', label: 'Teaching example: CanaRetail — national retail (English)', lang: 'en', data: () => self.CRG_CANARETAIL?.en },
  { id: 'canaretail-fr', label: 'Teaching example: CanaRetail — national retail (French)', lang: 'fr', data: () => self.CRG_CANARETAIL?.fr },
];
export const exampleOf = id => EXAMPLES.find(e => e.id === id) || null;
/** The bundled case a teaching workspace was built from ('medibec' when none was recorded). */
export const caseOf = (ws = S.ws) => (exampleOf(ws?.teaching?.case) ? ws.teaching.case : 'medibec');
/** Is this example shipped with this build (its data file loaded)? */
export const exampleAvailable = id => !!exampleOf(id)?.data();

/** A fresh workspace of a bundled example, as shipped. */
export function exampleWorkspace(id = 'medibec') {
  const ex = exampleOf(id);
  if (!ex) throw new Error(`Unknown bundled example: ${id}`);
  if (id === 'medibec') { const ws = medibecWorkspace(); ws.teaching = { case: 'medibec' }; ws.id = FIXED_ID('medibec'); ws.crgo = MIG.blankCrgo(ws.id); return ws; }   // 1.9.2 (item 4): a fixed id per bundled case
  const src = ex.data();
  if (!src) throw new Error(`The bundled example ${id} is not installed with this build.`);
  const d = JSON.parse(JSON.stringify(src));
  const ws = newWorkspace({ name: d.NAME, kind: 'example', assessment: d.ASSESSMENT, org: d.ORG });
  ws.id = FIXED_ID(id); ws.crgo = MIG.blankCrgo(ws.id);   // 1.9.2 (item 4): a fixed id per bundled case
  ws.appetite_rationale = d.APPETITE_RATIONALE || '';
  if (Array.isArray(d.BUDGET_YEARS)) { ws.budgetYears = d.BUDGET_YEARS; ws.budgetYear = d.BUDGET_YEAR ?? null; }
  else { ws.budget = Object.assign({ it_budget: 0, spend: 0, baseline: 0 }, d.BUDGET || {}); ws.budgetYears = null; }
  ensureBudgetYears(ws);
  ws.classroom = null;
  if (d.SCREENING) ws.screening = d.SCREENING;
  if (d.SUMMARY) ws.mgmtSummary = Object.assign(MIG.blankSummary(), d.SUMMARY);
  ws.teaching = { case: id };
  MIG.seedModules(ws);  // 1.9.0 — the identity & access management and configuration management samples of the case (nothing accepted)
  return ws;
}

/* ---------------- persistence ---------------- */
let saveT = null;
export function touch(what = 'change') {
  if (!S.ws) return;
  if (isReadOnly()) { emit(what); return; }      // 1.5.8 — a newer release's workspace is never saved over
  S.ws.modified = new Date().toISOString();
  S.ws.appVersion = VERSION;
  clearTimeout(saveT); saveT = setTimeout(() => { const w = S.ws; store.put('ws', w.id, w).then(() => LOG.saved(w)).catch(console.error); }, 300);
  emit(what);
}
/** 1.9.1 (B4) — after a workspace is created, switched, restored, started over or deleted from a screen, the
 *  application saves and reloads itself, so every screen and module starts from the workspace now open and none
 *  keeps the previous one in memory. `route` is where it reopens (the Process page unless the flow needs another
 *  screen); `carry` is handed to that screen after the reload (a toast, the extraction to run after a creation). */
const REOPEN = 'crg-reopen';
export async function reopen(route = 'process', carry = null) {
  await saveNow();
  await LOG.flush();                                       // the debounced logs and the audit trail are written first
  try { const U = await import('./users.js'); if (U.active()) await U.save(); } catch { /* single-user */ }
  try { sessionStorage.setItem(REOPEN, JSON.stringify({ route, carry: carry || {}, at: Date.now() })); } catch { /* private window */ }
  // replaceState, not location.hash: a hashchange would draw the target screen in the old page just before the reload
  history.replaceState(null, '', '#/' + route);
  location.reload();
}
/** What the previous page asked to hand over after a reopen (read once; stale after a minute). */
export function reopened() {
  try {
    const v = JSON.parse(sessionStorage.getItem(REOPEN) || 'null');
    if (v && Date.now() - v.at < 60000) return v;
  } catch { /* ignore */ }
  return null;
}
export function reopenedDone() { try { sessionStorage.removeItem(REOPEN); } catch { /* ignore */ } }
export async function saveNow() { if (S.ws && !isReadOnly()) await store.put('ws', S.ws.id, S.ws); }

export async function loadAll() {
  S.persistent = await store.persistent();
  S.list = (await store.all('ws')).filter(Boolean).sort((a, b) => (b.modified || '').localeCompare(a.modified || ''));
  // 1.5.8 — installation records and every stored workspace are brought to this release's data version
  // once, at start-up, so no screen ever meets an older shape. The outcome of each is kept for Backup & restore.
  S.metaMigration = await MIG.migrateMeta(store).catch(e => ({ error: String(e) }));
  S.migrations = [];
  for (let i = 0; i < S.list.length; i++) { S.list[i] = await upgrade(S.list[i]); if (S.migration.status !== 'current') S.migrations.push(S.migration); }
  S.migration = null;
  if (!S.list.length) {
    const ex = exampleWorkspace('medibec');   // 1.9.2 (item 4): the seeded case carries its fixed id
    await store.put('ws', ex.id, ex); S.list = [ex];
  }
  const cur = await store.get('meta', 'current');
  await select(S.list.find(w => w.id === cur)?.id || S.list[0].id, false);
}

export async function select(id, announce = true) {
  await saveNow();
  let w = (await store.get('ws', id)) || S.list.find(x => x.id === id);
  if (!w) return;
  w = await upgrade(w);
  S.ws = w;
  S.snap = await store.get('blob', 'snap:' + w.id) || null;
  await store.put('meta', 'current', id);
  if (announce) emit('workspace');
}

export async function create(ws) {
  await store.put('ws', ws.id, ws);
  LOG.data('workspace created', ws.name || ws.id, ws.kind || '', ws.name || '');
  S.list = [ws, ...S.list.filter(x => x.id !== ws.id)];
  await select(ws.id);
}
export async function remove(id) {
  LOG.data('workspace deleted', (S.list.find(w => w.id === id) || {}).name || id);
  const w = await store.get('ws', id);
  for (const d of (w?.docs || [])) await store.del('blob', 'doc:' + d.id);
  await store.del('blob', 'snap:' + id);
  await store.del('blob', 'base:' + id);      // 1.5.6 — the starting point of a teaching case
  await store.del('blob', 'premig:' + id);    // 1.5.8 — the copy kept from before a migration
  await store.del('ws', id);
  S.list = S.list.filter(x => x.id !== id);
  if (!S.list.length) { const ex = exampleWorkspace('medibec'); await store.put('ws', ex.id, ex); S.list = [ex]; }
  if (S.ws?.id === id) { S.ws = null; await select(S.list[0].id); }
  else emit('workspace');
}
export async function refreshList() {
  S.list = (await store.all('ws')).filter(Boolean).sort((a, b) => (b.modified || '').localeCompare(a.modified || ''));
}

export async function setSnapshot(snap, name) {
  S.snap = snap;
  if (snap) {
    await store.put('blob', 'snap:' + S.ws.id, snap);
    S.ws.snapshot = { name: name || 'threat-context.json', retrieved: snap.retrieved, expires: snap.expires, schema: snap.schema,
      kev: snap.kev?.count ?? Object.keys(snap.kev?.cves || {}).length, epss: snap.epss?.count ?? Object.keys(snap.epss?.scores || {}).length,
      loaded: today() };
  } else {
    await store.del('blob', 'snap:' + S.ws.id); S.ws.snapshot = null;
  }
  touch('snapshot');
}

export async function docText(id) { return (await store.get('blob', 'doc:' + id)) || ''; }
export async function setDocText(id, text) { await store.put('blob', 'doc:' + id, text); }
export async function delDoc(id) { await store.del('blob', 'doc:' + id); }

/**
 * 1.5.8 — run the data migrations on a stored workspace (migrate.js) and save the result, keeping the
 * original beside it. A workspace from a newer release is opened read-only; a failed migration leaves the
 * stored workspace untouched and opens it read-only too, so nothing half-converted is ever written.
 */
export async function upgrade(w, { persist = true } = {}) {
  const r = MIG.migrateWorkspace(w, { fill: migrate });
  S.migration = { id: w.id, name: w.name, status: r.status, from: r.from, to: r.to, steps: r.steps, error: r.error || null };
  if (r.status === 'newer' || r.status === 'failed') { S.readOnly.add(w.id); return r.ws; }
  S.readOnly.delete(w.id);
  if (r.status === 'migrated' && persist) {
    const key = 'premig:' + w.id;
    if (!(await store.get('blob', key).catch(() => null))) await store.put('blob', key, { from: r.from, to: r.to, saved: new Date().toISOString(), app: w.appVersion || 'before 1.5.8', ws: r.original });
    r.ws.crgo ||= MIG.blankCrgo(r.ws.id);
    await store.put('ws', r.ws.id, r.ws);
    S.list = S.list.map(x => x.id === r.ws.id ? r.ws : x);
  }
  return r.ws;
}

/** Shape repair after the migrations: fills missing fields with defaults, never touches numbers. */
export function migrate(w) {
  const def = newWorkspace();
  for (const k of Object.keys(def)) if (w[k] === undefined) w[k] = def[k];
  w.org = Object.assign(blankOrg(), w.org || {});
  if (!Array.isArray(w.org.regulations)) w.org.regulations = String(w.org.regulations || '').split(/[;\n]/).map(s => s.trim()).filter(Boolean);
  const a = w.assessment;
  for (const k of ['SCEN', 'INITIATIVES', 'KRIS', 'EVIDENCE', 'CANDIDATES', 'CROWN']) if (!Array.isArray(a[k])) a[k] = [];
  for (const s of a.SCEN) normalizeScenario(s);
  ensureBudgetYears(w);
  // 1.4.0 collections
  for (const k of ['measures', 'risks', 'assets', 'assetLog', 'iocWatch', 'published', 'library']) if (!Array.isArray(w[k])) w[k] = [];
  if (!w.compliance || typeof w.compliance !== 'object') w.compliance = { frameworks: [], soa: {}, checklists: {} };
  w.compliance.frameworks ||= []; w.compliance.soa ||= {}; w.compliance.checklists ||= {};
  w.feedNotes ||= {};
  // 1.5.8 records
  w.grc = Object.assign(MIG.blankGrc(), w.grc || {}); w.audit = Object.assign(MIG.blankAudit(), w.audit || {});
  w.csm = Object.assign(MIG.blankCsm(), w.csm || {}); w.isms = Object.assign(MIG.blankIsms(), w.isms || {});
  w.crgo = Object.assign(MIG.blankCrgo(w.id), w.crgo || {});
  w.shared = Object.assign(MIG.blankShared(), w.shared || {}); w.cms = Object.assign(MIG.blankCms(), w.cms || {});
  w.siem = Object.assign(MIG.blankSiem(), w.siem || {}); w.soar = Object.assign(MIG.blankSoar(), w.soar || {});
  w.isp = Object.assign({ policies: [], issues: [] }, MIG.blankIspExtra(), w.isp || {});
  w.screening = Object.assign(MIG.blankScreening(), w.screening || {}); w.mgmtSummary = Object.assign(MIG.blankSummary(), w.mgmtSummary || {});
  if (!Array.isArray(w.catalogueMigration)) w.catalogueMigration = [];
  // 1.9.0 — data version 4 and 1.9.2 — data version 6: an object record keeps what it holds and gains the keys its blank has
  for (const st of [...MIG.STEP4, ...MIG.STEP6.filter(x => x.field)]) {
    const b = st.blank();
    if (b && typeof b === 'object' && !Array.isArray(b)) w[st.field] = Object.assign(b, w[st.field] && typeof w[st.field] === 'object' ? w[st.field] : {});
    else if (w[st.field] === undefined) w[st.field] = b;
  }
  w.migrationLog ||= [];
  return w;
}

/* ---------------- multi-year budget (1.2.0) ----------------
   ws.budgetYears = [{year, it_budget, spend (planned cyber), actual (actual cyber), baseline, note}]
   ws.budget is kept as the SAME object as the selected year's entry, so every screen that reads
   ws.budget (profile, budget calibrator, KRIs, export) works on the selected year. */
export const thisYear = () => new Date().getFullYear();
export function ensureBudgetYears(w) {
  if (!Array.isArray(w.budgetYears) || !w.budgetYears.length) {
    const b = w.budget || {};
    w.budgetYears = [{ year: thisYear(), it_budget: Number(b.it_budget) || 0, spend: Number(b.spend) || 0, actual: b.actual ?? null, baseline: Number(b.baseline) || 0, note: '' }];
  }
  w.budgetYears.sort((x, y) => x.year - y.year);
  if (!w.budgetYears.some(y => y.year === w.budgetYear)) w.budgetYear = (w.budgetYears.find(y => y.year === thisYear()) || w.budgetYears[w.budgetYears.length - 1]).year;
  w.budget = w.budgetYears.find(y => y.year === w.budgetYear);
  w.initPlan ||= {};
  return w;
}
export function selectBudgetYear(y, w = S.ws) { w.budgetYear = Number(y); ensureBudgetYears(w); touch('redraw'); }
export function addBudgetYear(y, w = S.ws) {
  if (w.budgetYears.some(x => x.year === y)) return;
  const prev = w.budgetYears.filter(x => x.year < y).pop() || w.budgetYears[0];
  w.budgetYears.push({ year: y, it_budget: prev?.it_budget || 0, spend: prev?.spend || 0, actual: null, baseline: prev?.baseline || 0, note: '' });
  ensureBudgetYears(w);
}
/** Multi-year allocation of one initiative (3 years max). mode: 'auto' (Y1 initial + recurring, then recurring),
 *  'pct' (split % of the 3-year total), 'amount' (explicit amounts). */
export function initPlan(o, w = S.ws) {
  const p = Object.assign({ start: w.budgetYear || thisYear(), mode: 'auto', years: (Number(o.recurring) || 0) > 0 ? 3 : 1, pct: [100, 0, 0], amounts: [0, 0, 0] }, w.initPlan?.[o.id] || {});
  const ini = Number(o.initial) || 0, rec = Number(o.recurring) || 0;
  const n = Math.max(1, Math.min(3, Number(p.years) || 1));
  let amt;
  if (p.mode === 'amount') amt = p.amounts.slice(0, 3).map(Number).map(x => x || 0);
  else if (p.mode === 'pct') { const tot = ini + rec * n; amt = p.pct.slice(0, 3).map(x => tot * (Number(x) || 0) / 100); }
  else amt = [ini + rec, n >= 2 ? rec : 0, n >= 3 ? rec : 0];
  for (let i = n; i < 3; i++) amt[i] = 0;
  return Object.assign(p, { years: n, amounts3: amt, byYear: Object.fromEntries(amt.map((v, i) => [Number(p.start) + i, v])) });
}
export function commitments(w = S.ws) {
  const per = {}, rows = [];
  for (const o of initiatives(w)) {
    const p = initPlan(o, w);
    rows.push({ o, p });
    for (const [y, v] of Object.entries(p.byYear)) per[y] = (per[y] || 0) + v;
  }
  return { per, rows };
}

export const PARAMS = ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu'];
export const PARAM_LABEL = { PbA: 'Pb(A)', Pbx: 'Pb(ψ,A)', De: 'δe', Dm: 'δm', Th: 'θ', Mu: 'μ(E)' };
export const PARAM_HELP = {
  PbA: 'Probability that the threat is present during the assessment period',
  Pbx: 'Probability that the threat exploits the weakness',
  De: 'Expected damage (normalized)', Dm: 'Maximum plausible damage (normalized)',
  Th: 'Organizational resilience — prevent, detect, contain, respond, recover (0,1]',
  Mu: 'Organizational criticality (expected utility) of the affected service or asset' };

export function normalizeScenario(s) {
  s.params = s.params || {};
  for (const k of PARAMS) {
    const p = s.params[k];
    if (p === undefined || p === null || typeof p !== 'object') s.params[k] = { v: p === undefined || p === null ? 0.5 : Number(p), conf: 'Low', rat: '', ev: '' };
  }
  for (const k of ['attack', 'cwe', 'cves', 'inits', 'vulns', 'controls', 'assetIds']) if (!Array.isArray(s[k])) s[k] = s[k] ? [s[k]] : [];
  // 1.9.2 (NV-001, D2): a missing reduction is 0 — the book's pre-treatment value and the Threat Intel engine's rule —
  // never an invented 0.5. Stored scenarios that lacked the field were given 0.5 by data version 5 → 6 before this runs,
  // explicitly and listed for review, so no existing organization's numbers move.
  if (s.red_p === undefined || s.red_p === null) s.red_p = 0;
  if (s.red_i === undefined || s.red_i === null) s.red_i = 0;
  return s;
}

/** The vector a scenario starts with when nobody has chosen one (NV-002: marked vector_source 'default'). */
export const DEFAULT_VECTOR = 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N';
/** 1.9.2 (NV-002) — is the scenario's vector still the one it was created with, not entered by the analyst?
 *  'default' is the blank scenario's vector; 'pattern' a batch pattern's or a candidate's starting vector. A vector that
 *  differs from the one recorded at creation (vector_ref) counts as entered. A score by equivalency is an analyst entry. */
export function vectorState(s) {
  if (!s || !s.vector_source || s.vector_source === 'confirmed') return 'entered';
  if (s.cvss_mode === 'equivalency') return 'entered';
  /* 1.9.2 review (H2) — 'score': the scenario came with a score and no vector (CVE register with a non-v4 score, CRGO
     prior, Risk Registry row, batch or screening row): it computes on that stored score until the analyst confirms it
     or enters a v4.0 vector. A vector typed since counts as entered. */
  if (s.vector_source === 'score') return (s.cvss === '' || s.cvss == null) && s.cvss_score !== undefined && s.cvss_score !== null && s.cvss_score !== '' ? 'score' : 'entered';
  if (s.cvss !== (s.vector_ref || DEFAULT_VECTOR)) return 'entered';
  return s.vector_source;
}

/** 1.9.2 (NV-002, step 10) — the analyst confirms a vector that came with a pattern or a candidate: one click, recorded in
 *  the scenario's revisions. The vector itself does not change. */
export function confirmVector(s, by = '') {
  if (!s || vectorState(s) === 'entered') return false;
  const from = s.vector_source;
  s.vector_source = 'confirmed'; s.vector_confirmed = { date: today(), by: String(by || '').trim(), from };
  (s.revisions ||= []).push({ date: today(), what: from === 'score'
    ? `CVSS score ${s.cvss_score} (stored, no vector) confirmed by the analyst${by ? ' (' + by + ')' : ''} — it came with the row the scenario was created from (Process step 10)`
    : `CVSS vector ${s.cvss} confirmed by the analyst${by ? ' (' + by + ')' : ''} — it came with a ${from === 'pattern' ? 'batch pattern or candidate' : 'new scenario'} (Process step 10)` });
  return true;
}

export function blankScenario(id) {
  return normalizeScenario({
    id, ref: '', name: '', statement: '', stakeholders: '', threat_source: '', threat_event: '', vulns: [], assets: '', processes: '',
    controls: [], narrative: '', sequence: [], consequences: {},
    params: Object.fromEntries(PARAMS.map(k => [k, { v: k === 'Th' ? 0.5 : 0.5, qual: '', rat: '', ev: '', conf: 'Low' }])),
    cvss: DEFAULT_VECTOR, cvss_note: '', vector_source: 'default', vector_ref: DEFAULT_VECTOR,
    // 1.9.2 (NV-001, D2): before treatment rp and ri are both zero (book v2.51b ch. 6); the figures start as the
    // pre-treatment risk, and every reduction is an analyst's or a measure's entry.
    red_p: 0, red_i: 0, inits: [], treatment: '', owner: '', horizon: '', attack: [], cwe: [], cves: [],
    origin: 'manual', created: today(),
  });
}
export function nextScenarioId(ws = S.ws) {
  let n = 0;
  for (const s of ws.assessment.SCEN) { const m = /^S(\d+)$/.exec(s.id); if (m) n = Math.max(n, Number(m[1])); }
  return 'S' + (n + 1);
}
export const scen = id => S.ws?.assessment.SCEN.find(s => s.id === id);

/* ---------------- initiatives (arrays kept for build_workbook.py compatibility) ---------------- */
export const INIT_COLS = ['id', 'name', 'desc', 'scenarios', 'owner', 'priority', 'initial', 'recurring', 'start', 'end', 'success', 'dependencies', 'type'];
export function initObj(a) { const o = {}; INIT_COLS.forEach((k, i) => { o[k] = a[i]; }); o.scenarios = o.scenarios || []; o.y1 = (Number(o.initial) || 0) + (Number(o.recurring) || 0); return o; }
export function initArr(o) { return INIT_COLS.map(k => o[k]); }
export const initiatives = (ws = S.ws) => (ws.assessment.INITIATIVES || []).map(initObj);

/** Year-1 cost allocated to each scenario: an initiative is split equally across the scenarios it addresses
 *  (same rule as build_workbook.py Portfolio sheet, so shared controls are never counted twice). */
export function allocation(ws = S.ws) {
  const out = {};
  for (const s of ws.assessment.SCEN) out[s.id] = { y1: 0, initial: 0, recurring: 0, inits: [] };
  // In-scope (included) scenarios share each initiative's cost; an excluded scenario shows an informational
  // share computed over all the scenarios the initiative addresses. The Excel export uses the same rule.
  for (const i of initiatives(ws)) {
    const scs = i.scenarios.filter(id => out[id]);
    if (!scs.length) continue;
    const inc = scs.filter(id => included(id, ws));
    for (const id of scs) {
      const n = included(id, ws) ? inc.length : scs.length;
      out[id].y1 += i.y1 / n; out[id].initial += (Number(i.initial) || 0) / n;
      out[id].recurring += (Number(i.recurring) || 0) / n; out[id].inits.push(i.id);
    }
  }
  for (const s of ws.assessment.SCEN) if (Number(s.cost_y1_manual) > 0 && !out[s.id].inits.length) out[s.id].y1 = Number(s.cost_y1_manual);
  return out;
}

/* ---------------- results ---------------- */
export const included = (id, ws = S.ws) => !(ws.excluded || []).includes(id);
export function setIncluded(id, on) {
  const ex = new Set(S.ws.excluded || []);
  if (on) ex.delete(id); else ex.add(id);
  S.ws.excluded = [...ex]; touch('include');
}

/** Run the verified engine scenario by scenario so one malformed scenario does not hide the others. */
export function compute(ws = S.ws, { appetite, factor } = {}) {
  const a = ws.assessment;
  appetite = appetite ?? a.APPETITE ?? CRG.DEFAULT_APPETITE;
  factor = factor ?? a.FACTOR ?? CRG.DEFAULT_FACTOR;
  const alloc = allocation(ws);
  const rows = [], errors = [];
  for (const s of a.SCEN) {
    try {
      const r = CRG.calc(s, appetite, factor);
      const [nc, np] = CRG.caseNormalized(s);
      const cost = alloc[s.id]?.y1 || 0;
      rows.push(Object.assign({ id: s.id, name: s.name || '', s }, r, { cls: CRG.classify(r.ratio), norm_cur: nc, norm_post: np,
        cost, ce: cost > 0 ? (r.est - r.res) / cost * 1000 : null, inc: included(s.id, ws) }));
    } catch (e) { errors.push({ id: s.id, name: s.name, error: String(e.message || e) }); }
  }
  const inc = rows.filter(r => r.inc);
  const sum = (xs, k) => xs.reduce((t, x) => t + (x[k] || 0), 0);
  return { appetite, factor, rows, errors, inc,
    totals: { est: sum(inc, 'est'), tol: sum(inc, 'tol'), mit: sum(inc, 'mit'), res: sum(inc, 'res'), cost: sum(inc, 'cost') },
    all: { est: sum(rows, 'est'), res: sum(rows, 'res') },
    counts: { above: inc.filter(r => r.cls.startsWith('Above')).length, at: inc.filter(r => r.cls.startsWith('Approx')).length,
      below: inc.filter(r => r.cls.startsWith('Below')).length } };
}

/** The assessment JSON exactly as crg_calc.py / build_workbook.py read it, plus the optional links. */
export function exportAssessment(ws = S.ws, { includedOnly = false } = {}) {
  const a = JSON.parse(JSON.stringify(ws.assessment));
  if (includedOnly) a.SCEN = a.SCEN.filter(s => included(s.id, ws));
  a.ORGANIZATION = ws.org.name || ws.name;
  if (ws.snapshot) {   // 1.9.2 (NV-007, ws3): the export says whether the snapshot was expired at export time
    const exp = typeof ws.snapshot.expires === 'string' && /^\d{4}-\d{2}-\d{2}/.test(ws.snapshot.expires) ? new Date(ws.snapshot.expires.slice(0, 10)) : null;
    const t = new Date(today()); const past = exp ? Math.round((t - exp) / 86400000) : null;
    a.threat_context = { snapshot: ws.snapshot.name, retrieved: ws.snapshot.retrieved, expires: ws.snapshot.expires, expired: exp ? past > 0 : true, days_past_expiry: exp ? Math.max(0, past) : null };
  }
  // The vector wins (X-1): a stored score that disagrees with its vector is flagged in the file too, so a reader that
  // uses the stored score sees the disagreement. Nothing is changed: both values are exported as entered.
  const warnings = [];
  for (const s of a.SCEN) {
    const c = CRG.cvssCheck(s);
    if (c.agree === false) { s.cvss_check = { stored: c.stored, computed: c.computed, agree: false, used: 'vector' }; warnings.push(`${s.id}: stored CVSS score ${c.stored} disagrees with its vector (${c.computed}); the vector's score is used`); }
  }
  if (warnings.length) a.warnings = warnings;
  return a;
}

export const val0 = val;
