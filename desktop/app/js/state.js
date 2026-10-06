/* state.js — workspaces (one per organization, business case or class team) and derived results.
   The calculation itself is always CRG.calc from the verified crg.js engine.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';
import { uid, today, val } from './util.js';

export const SCHEMA = 'crg-workspace/1';
const listeners = new Set();
export const S = { ws: null, list: [], snap: null, persistent: true };

export function on(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function emit(what = 'change') { for (const f of listeners) { try { f(what); } catch (e) { console.error(e); } } }

/* ---------------- workspace factory ---------------- */
export function blankOrg() {
  return { name: '', context: '', sector: '', size: '', employees: '', region: '', mission: '', services: '', processes: '',
    systems: '', cloud: '', suppliers: '', regulations: [], sensitive: '', availability: '', maturity: '',
    incidents: '', controls: '', notes: '' };
}
export function newWorkspace({ name = 'New organization', kind = 'organization', assessment = null, org = null } = {}) {
  const now = new Date().toISOString();
  return {
    schema: SCHEMA, id: uid('ws'), name, kind, created: now, modified: now,
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
  return ws;
}

/* ---------------- persistence ---------------- */
let saveT = null;
export function touch(what = 'change') {
  if (!S.ws) return;
  S.ws.modified = new Date().toISOString();
  clearTimeout(saveT); saveT = setTimeout(() => store.put('ws', S.ws.id, S.ws).catch(console.error), 300);
  emit(what);
}
export async function saveNow() { if (S.ws) await store.put('ws', S.ws.id, S.ws); }

export async function loadAll() {
  S.persistent = await store.persistent();
  S.list = (await store.all('ws')).filter(Boolean).sort((a, b) => (b.modified || '').localeCompare(a.modified || ''));
  if (!S.list.length) {
    const ex = medibecWorkspace();
    await store.put('ws', ex.id, ex); S.list = [ex];
  }
  const cur = await store.get('meta', 'current');
  await select(S.list.find(w => w.id === cur)?.id || S.list[0].id, false);
}

export async function select(id, announce = true) {
  await saveNow();
  const w = (await store.get('ws', id)) || S.list.find(x => x.id === id);
  if (!w) return;
  migrate(w);
  S.ws = w;
  S.snap = await store.get('blob', 'snap:' + w.id) || null;
  await store.put('meta', 'current', id);
  if (announce) emit('workspace');
}

export async function create(ws) {
  await store.put('ws', ws.id, ws);
  S.list = [ws, ...S.list.filter(x => x.id !== ws.id)];
  await select(ws.id);
}
export async function remove(id) {
  const w = await store.get('ws', id);
  for (const d of (w?.docs || [])) await store.del('blob', 'doc:' + d.id);
  await store.del('blob', 'snap:' + id);
  await store.del('blob', 'base:' + id);      // 1.5.6 — the starting point of a teaching case
  await store.del('ws', id);
  S.list = S.list.filter(x => x.id !== id);
  if (!S.list.length) { const ex = medibecWorkspace(); await store.put('ws', ex.id, ex); S.list = [ex]; }
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

/** Bring older or imported workspaces up to the current shape without touching numbers. */
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
  Mu: 'Criticality of the affected service or asset to the mission' };

export function normalizeScenario(s) {
  s.params = s.params || {};
  for (const k of PARAMS) {
    const p = s.params[k];
    if (p === undefined || p === null || typeof p !== 'object') s.params[k] = { v: p === undefined || p === null ? 0.5 : Number(p), conf: 'Low', rat: '', ev: '' };
  }
  for (const k of ['attack', 'cwe', 'cves', 'inits', 'vulns', 'controls', 'assetIds']) if (!Array.isArray(s[k])) s[k] = s[k] ? [s[k]] : [];
  if (s.red_p === undefined) s.red_p = 0.5;
  if (s.red_i === undefined) s.red_i = 0.5;
  return s;
}

export function blankScenario(id) {
  return normalizeScenario({
    id, ref: '', name: '', statement: '', stakeholders: '', threat_source: '', threat_event: '', vulns: [], assets: '', processes: '',
    controls: [], narrative: '', sequence: [], consequences: {},
    params: Object.fromEntries(PARAMS.map(k => [k, { v: k === 'Th' ? 0.5 : 0.5, qual: '', rat: '', ev: '', conf: 'Low' }])),
    cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N', cvss_note: '',
    red_p: 0.5, red_i: 0.5, inits: [], treatment: '', owner: '', horizon: '', attack: [], cwe: [], cves: [],
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
  if (ws.snapshot) a.threat_context = { snapshot: ws.snapshot.name, retrieved: ws.snapshot.retrieved, expires: ws.snapshot.expires };
  return a;
}

export const val0 = val;
