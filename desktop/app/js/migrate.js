/* migrate.js — keeping what people entered usable by every later release (1.5.8).

   Every record the application stores carries a data version: a workspace in ws.dataVersion, the
   installation's own records (preferences, users, settings, framework packs) in meta "dataVersion",
   a backup file in its top-level dataVersion. Releases that change the shape of stored data add one
   step to MIGRATIONS below; nothing else in the application rewrites old data.

   The rules a migration follows:
     • Steps run in order, from the version the record carries to DATA_VERSION, on a copy. A step that
       throws leaves the stored record exactly as it was, and the error is shown to the person.
     • Before a migrated workspace is first saved, the original is kept beside it (blob
       "premig:<id>") so the change can be undone from Backup & restore.
     • Every migration is journalled in ws.migrationLog: from, to, release, date, what each step did.
     • A record written by a NEWER release (a higher data version than this build knows) is never
       migrated downwards and never saved over: the workspace opens read-only, with an explanation.
     • Numbers are never recomputed or rescaled by a migration: parameters, reductions, KRIs and
       decisions are carried as they are. The engine self-check (84,305 / 41,023) runs on the result.
       (1.8.0: the shipped MediBec case has S2 and S8 at AV:L, as the book; stored copies are not rewritten.)
     • KNOWN_FIELDS lists every top-level field of a workspace at this data version. A test fails when
       the workspace factory gains a field that is not listed here — so adding a field forces the
       decision of how older workspaces get it (a new step, and a new DATA_VERSION).

   Data versions
     0  every release before 1.5.8 (crg-workspace/1 without dataVersion; 1.0 to 1.5.7)
     1  1.5.8 — governance, risk and compliance records aligned with CRGO 0.9 (grc, audit, csm, isms,
        crgo); imported incidents move into the incident register; policy exceptions gain the
        CRGO exception model; every workspace gets the fields earlier releases added lazily.
     2  1.6.0 — CRGO 0.10 management records: shared registers (evidence, corrective actions,
        exceptions, qualified mappings), policy management (versions, families, assignments,
        acknowledgements, training), compliance management, audit management, SIEM and SOAR.
        Evidence moves from grc.evidence to shared.evidence and policy exceptions from isp.issues to
        shared.exceptions, unchanged.
     3  1.8.0 — only the current control catalogues ship (ISO/IEC 27002:2022, NIST CSF 2.0, CIS v8.1):
        references to ISO/IEC 27002:2013, NIST CSF 1.1 and CIS v7.1 are mapped (js/data/legacy-map.js) with
        the old identifier kept in a note, or flagged for review when no correspondence exists — never
        dropped; outdated marker wordings take the standard markers; a MediBec teaching case still on the AV:N
        vectors of S2 and S8 keeps them (a migration changes no number) and is told how to take AV:L; empty scenario-screening and management-summary records are added.
     4  1.9.0 — one step made of sub-steps (STEP4 below), one per piece of 1.9.0 work that adds a workspace
        field: the Virtual consultant's conversation history (consultant), and those the other 1.9.0 modules
        append.
     5  1.9.0 — Identity & access management (iam) and Configuration management (cm) are two modules: a
        workspace saved by an earlier 1.9.0 build, with ONE identity, privilege & configuration record (ipc), has
        that record split into the two, losslessly (splitIpc5 below). A data version of its own, rather than a
        repair at load time, so the split is journalled, the copy from before is kept (premig), and an earlier
        1.9.0 build opens a split workspace read-only instead of saving over it.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { VERSION } from './version.js';
import { LEGACY } from './data/legacy-map.js';
import * as MK from './markers.js';
import * as IAM from './iam.js';
import * as CM from './cm.js';

/** MediBec S2 and S8: the earlier (AV:N) vector → the current (AV:L) one. The single copy of these constants
    (1.9.0): avl.js re-exports them and the Quality review (QC-26) reads them from there. */
export const AVL_VECTORS = Object.freeze({
  S2: Object.freeze({ from: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H', to: 'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H' }),
  S8: Object.freeze({ from: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:L/SC:H/SI:L/SA:L', to: 'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:L/SC:H/SI:L/SA:L' }),
});

export const DATA_VERSION = 5;

/* ---------------- the 1.9.0 records (data version 4) ----------------
   Data version 4 is ONE migration step made of sub-steps, one per piece of 1.9.0 work that adds a
   workspace field. To add a field in 1.9.0, append one entry to STEP4 — nothing else: KNOWN_FIELDS, the
   step 3 → 4 itself, the workspace factory (state.newWorkspace), the shape repair (state.migrate) and the
   reset groups (reset.GROUPS) all read this list.
     field   the top-level workspace field
     blank   () => its empty value: what a new workspace gets and what an older one is given
     group   the reset group it belongs to (reset.js: ORGANIZATION, DOCUMENTS, CONTEXT, ASSESSMENT, KRI_DEFS, AUDIT)
     title   one line for the migration journal
     up      optional (w, note) => void, for a sub-step that does more than add the blank field; it must
             leave numbers untouched and may only read fields earlier steps guarantee
   Sub-steps run in the order listed, on the copy the migration works on. */

/** Virtual consultant: saved conversations and the retrieval mode of this workspace. */
export const blankConsultant = () => ({
  conversations: [],            // { id, title, started, updated, evidence, messages: [{ role: 'user'|'consultant', at, text, screen, selected, parts, passages, model, provider, logId }] }
  retrieval: 'lexical',         // 'lexical' (default, offline) or 'hybrid' (lexical + a local embedding model)
});
export const STEP4 = [
  { field: 'consultant', blank: blankConsultant, group: 'ASSESSMENT', title: 'Virtual consultant: conversation history' },
  // Identity & access management: account, privileged-role, emergency-account, access-review and segregation-of-duties
  // registers, and the teaching-case sample (migrateIam4 below)
  { field: 'iam', blank: () => IAM.blank(), group: 'CONTEXT', title: 'Identity & access management registers',
    up: (w, note) => { migrateIam4(w, note); } },
  // Configuration management: baselines promoted from the asset register (the asset gains only baseline.ref), drift
  // deviations to classify, configuration scopes and changes, the teaching-case sample (migrateCm4 below)
  { field: 'cm', blank: () => CM.blank(), group: 'CONTEXT', title: 'Configuration management registers (baselines promoted from assets)',
    up: (w, note) => { migrateCm4(w, note); } },
  // SSVC decisions beside the vulnerability register, and the review items the exploitation forecast raises
  { field: 'ssvc', blank: () => blankSsvc(), group: 'CONTEXT', title: 'SSVC decisions and exploitation-forecast review items (response priorities, never likelihoods)' },
];
/** The blank value of every data-version-4 field, for the workspace factory. */
export const fieldsV4 = () => Object.fromEntries(STEP4.map(s => [s.field, s.blank()]));

/** Every top-level field of a workspace at DATA_VERSION (the test compares the factory with this list). */
export const KNOWN_FIELDS = [
  'schema', 'dataVersion', 'appVersion', 'migrationLog', 'id', 'name', 'kind', 'created', 'modified',
  'org', 'classroom', 'assessment', 'appetite_rationale', 'budget', 'budgetYears', 'budgetYear', 'initPlan',
  'excluded', 'decisions', 'vulns', 'docs', 'snapshot', 'kriDefs', 'kriHistory',
  'measures', 'risks', 'assets', 'assetLog', 'compliance', 'iocWatch', 'feedNotes', 'published', 'library',
  // fields earlier releases added only when a screen first used them (now present from the start)
  'recommendations', 'revisionLog', 'linkLog', 'linkDraft', 'batchDraft', 'batchSeed', 'batchSpread',
  'safeguards', 'maturity', 'exposureText', 'discoverySeen', 'feedState', 'feedLog', 'kriSel', 'kriSelMode',
  'userAudit', 'resetLog', 'crownProv', 'educational', 'importLog', 'importPlan', 'assetScoreHist',
  'ontology', 'isp', 'ai', 'teaching',
  // 1.5.8
  'grc', 'audit', 'csm', 'isms', 'crgo',
  // 1.6.0
  'shared', 'cms', 'siem', 'soar',
  // 1.8.0
  'screening', 'mgmtSummary', 'catalogueMigration',
  // 1.9.0 — data version 4, one entry per sub-step
  ...STEP4.map(s => s.field),
];

/* ---------------- the 1.5.8 records ---------------- */

/** Governance, risk and compliance records shared by the modules (CRGO 0.9 terms). */
export const blankGrc = () => ({
  profile: { orgTypes: [], establishedIn: [], offersServicesIn: [], monitorsBehaviourIn: [], activities: [], complete: [] },
  applicability: null,          // { date, source, release, results: { instrument: { state, met, notMet, undetermined } } }
  determinations: [],           // compliance determinations: provision, state, evidence, evidence gap
  controlTests: [],             // control assessments by assessor line and aspect
});
export const blankAudit = () => ({ engagements: [], findings: [], soc: [],
  // 1.6.0 — audit management (AMS)
  charter: null,                // { purpose, authority, independence, reportsTo, approvedBy, approved, version, hash }
  methodology: '',              // text: how engagements are planned, performed, reported
  universe: [],                 // auditable entities: name, kind, owner, inherent risk, last audited, links
  plans: [],                    // versioned risk-weighted plans: { id, period, version, state, entries[], approvedBy, hash }
  procedures: [],               // procedure library: objective, steps, criteria, method (inquire/observe/inspect/reperform)
  workpapers: [],               // engagement, procedure, performedBy, reviewedBy, conclusion, locked, hash
  samples: [],                  // reproducible samples: population, size, seed, method, selected
  observations: [],             // preliminary, not findings: may become a finding
  recommendations: [],          // linked to findings
  responses: [],                // management responses: accepted/partially/rejected, action plan, owner
  reports: [],                  // frozen report snapshots + addenda
  followups: [],                // verification of actions: by whom (independent), result
  qreviews: [],                 // quality and independence reviews
  directives: [],               // approved charter / methodology versions (hash-frozen)
  conflicts: [],                // conflict-of-interest declarations
  events: [],                   // append-only audit events
  weights: null, cycleMonths: null,  // plan scoring weights and audit cycle
});
export const blankCsm = () => ({ bodies: [], roles: [], delegations: [], decisions: [], incidents: [] });
export const blankIsms = () => ({ scope: '', boundaries: '', objectives: [], reviews: [], soaNote: '' });
/* ---------------- the 1.6.0 records ---------------- */

/** Registers shared by every management module: one record, referenced from wherever it is used. */
export const blankShared = () => ({
  evidence: [],                 // evidence metadata (moved from grc.evidence): period, validity, custodian, hash, sufficiency
  actions: [],                  // corrective / remediation actions: source {kind,id}, owner, due, state, verifiedBy
  exceptions: [],               // exceptions (moved from isp.issues): scope, approver, compensating controls, expiry; never waive a law
  mappings: [],                 // qualified mapping assertions: from {kind,id} → to {kind,id}, type, edition, rationale, confidence, review
});
/** Information security policy management (ISPMS) — the extra records beside isp.policies and isp.issues. */
export const blankIspExtra = () => ({ families: [], assignments: [], acks: [], training: [], reviewsDue: [] });
/** Compliance management (CMS). */
export const blankCms = () => ({
  sources: [],                  // laws, regulations, contracts, standards, with versions/editions
  obligations: [],              // atomic obligations: source, provision, text paraphrase, owner, applicability
  interpretations: [],          // reviewed interpretations: legal review state, privileged flag
  programmes: [],               // compliance programme and objectives
  adoptions: [],                // framework adoptions (voluntary commitments) with scope
  campaigns: [],                // assessment campaigns
  deadlines: [],                // calendar dates or triggered (e.g. 72 h after incident confirmation)
  submissions: [],              // regulatory submissions with receipts
  changes: [],                  // regulatory change log and impact
  exemptions: [],               // regulatory exemptions — granted only by an authority
});
/** SIEM — local: nothing connects to a live product. */
export const blankSiem = () => ({ sources: [], rules: [], tests: [], coverage: [], gaps: [], alerts: [], indicators: [], imports: [] });
/** SOAR — local: manual recorded actions and dry-run simulation only. */
export const blankSoar = () => ({ cases: [], playbooks: [], gates: [], approvals: [], executions: [], simulations: [], lessons: [] });

/* ---------------- the 1.8.0 records ---------------- */

/** Scenario screening (book ch05): scores, flags, families, watch list and evidence plan. */
export const blankScreening = () => ({
  cands: {},                    // candidate id → { scores[12], rat, flags[], conf, basis, disp, target, strategy[], exclReview }
  families: [],                 // { id, name, statement, members[], selected, rationale, judgment, coverage[], scenario }
  watch: [],                    // { id, trigger, owner }
  plan: [],                     // evidence-collection plan: { activity, scenarios, owner, due }
  updated: null,
});
/** Management summary (book ch06): what the screen cannot compute — the decisions asked and the limitations. */
export const blankSummary = () => ({ decisions: [], limitations: '', nextSteps: '', preparedBy: '', date: null });

/* ---------------- legacy control catalogues (1.8.0) ---------------- */

const LEGACY_FW = Object.keys(LEGACY);
const KEY_RE = /^(USR-ISO13|USR-CSF11|USR-CIS71):(.+)$/;
/** The current-edition key for a legacy control key, or null when no correspondence exists. */
export function mapLegacyKey(key) {
  const m = KEY_RE.exec(String(key)); if (!m) return undefined;
  const L = LEGACY[m[1]], id = m[2];
  if (L.map) return L.map[id] ? L.to + ':' + L.map[id] : null;
  const maj = String(id).split('.')[0];
  return L.byPrefix?.[maj] ? L.to + ':' + L.byPrefix[maj] : null;
}
/** Walk a workspace and replace every legacy reference; returns the list of what was done. */
export function migrateLegacyControls(w) {
  const done = [];
  const tag = (obj, from, to, path) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    (obj.legacyControls ||= []).push({ from, to, note: to ? `${from} (legacy) → ${to}` : `${from} (legacy): no correspondence in the current editions — review` });
    if (!to) obj.needsReview = true;
  };
  const walk = (v, path, parent, depth) => {
    if (depth > 14 || !v || typeof v !== 'object') return;
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        const x = v[i];
        if (typeof x === 'string') {
          const to = mapLegacyKey(x);
          if (to !== undefined) { done.push({ path: `${path}[${i}]`, from: x, to }); tag(parent, x, to, path); if (to) v[i] = to; }
          else if (LEGACY_FW.includes(x)) { const nf = LEGACY[x].to; done.push({ path: `${path}[${i}]`, from: x, to: nf }); v[i] = nf; }
        } else walk(x, `${path}[${i}]`, x && typeof x === 'object' && !Array.isArray(x) ? x : parent, depth + 1);
      }
      // a framework list or a control list may now hold the same identifier twice
      if (v.every(x => typeof x === 'string')) { const u = [...new Set(v)]; if (u.length !== v.length) v.splice(0, v.length, ...u); }
      return;
    }
    for (const k of Object.keys(v)) {
      if (k === 'legacyControls') continue;
      const x = v[k];
      const tk = mapLegacyKey(k);
      if (tk !== undefined) {                       // a record keyed by control (statement of applicability)
        const clash = !!tk && (tk in v);
        done.push({ path: `${path}.${k}`, from: k, to: tk, ...(clash ? { merged: true } : {}) });
        if (tk && !clash) { v[tk] = x; delete v[k]; if (x && typeof x === 'object') tag(x, k, tk); }
        else if (x && typeof x === 'object') {   // kept under its old key: unmapped, or the new key already holds a record
          tag(x, k, clash ? null : tk);
          if (clash) { x.legacyControls[x.legacyControls.length - 1].note = `${k} (legacy) corresponds to ${tk}, which already has a record — kept under the old key; review and merge`; x.needsReview = true; }
        }
        continue;
      }
      if (typeof x === 'string') {
        const to = mapLegacyKey(x);
        if (to !== undefined) { done.push({ path: `${path}.${k}`, from: x, to }); tag(v, x, to); if (to) v[k] = to; }
        else if (k === 'fw' && LEGACY_FW.includes(x)) {
          const id = v.id, to2 = mapLegacyKey(x + ':' + id);
          done.push({ path: `${path}.${k}`, from: x + ':' + id, to: to2 });
          tag(v, x + ':' + id, to2);
          if (to2) { const [nf, nid] = [to2.split(':')[0], to2.slice(to2.indexOf(':') + 1)]; v.fw = nf; v.id = nid; }
        }
      } else walk(x, `${path}.${k}`, x && typeof x === 'object' && !Array.isArray(x) ? x : v, depth + 1);
    }
  };
  walk(w, '', w, 0);
  return done;
}

/** Replace outdated marker wordings in a workspace (strings only; numbers are never touched). */
function modernizeMarkers(v, depth = 0) {
  let n = 0;
  if (depth > 14 || !v || typeof v !== 'object') return 0;
  for (const k of Object.keys(v)) {
    const x = v[k];
    if (typeof x === 'string') { const y = MK.modernize(x); if (y !== x) { v[k] = y; n++; } }
    else n += modernizeMarkers(x, depth + 1);
  }
  return n;
}

export const blankCrgo = id => ({ base: defaultBase(id), label: '', graph: null, contexts: {}, writeBacks: [] });
/** A private base that can never collide with a real namespace: the .invalid domain is reserved (RFC 2606). */
export const defaultBase = id => `https://crg.invalid/${String(id || 'org').replace(/[^\w-]/g, '')}/`;

/** Defaults for the fields earlier releases created lazily. */
const LAZY = {
  recommendations: () => [], revisionLog: () => [], linkLog: () => [], linkDraft: () => null, batchDraft: () => null,
  batchSeed: () => null, batchSpread: () => null, safeguards: () => [], maturity: () => null, exposureText: () => '',
  discoverySeen: () => ({}), feedState: () => ({}), feedLog: () => [], kriSel: () => null, kriSelMode: () => null,
  userAudit: () => [], resetLog: () => [], crownProv: () => ({}), educational: () => null, importLog: () => [],
  importPlan: () => null, assetScoreHist: () => [], ontology: () => ({ themes: [] }), isp: () => ({ policies: [], issues: [] }),
  ai: () => null, teaching: () => null,
};

/* ---------------- the steps ---------------- */

export const MIGRATIONS = [
  {
    from: 0, to: 1, release: '1.5.8',
    title: 'Releases before 1.5.8 → 1.5.8: governance, audit, incident and ontology records',
    up(w, note) {
      for (const [k, f] of Object.entries(LAZY)) if (w[k] === undefined) { w[k] = f(); }
      note('fields added lazily by earlier releases are now present');
      // Imported incidents (1.5.7 Import from documents) move into the incident register, unchanged.
      w.csm ||= blankCsm();
      const old = Array.isArray(w.incidents) ? w.incidents : [];
      for (const it of old) {
        w.csm.incidents.push({ id: it.id || 'INC-' + String(w.csm.incidents.length + 1).padStart(3, '0'),
          title: it.type || 'Incident', detected: it.date || '', type: it.type || '', assets: it.asset || '',
          impact: it.impact || '', cause: it.cause || '', status: 'recorded', confirmed: '', scenarios: [], timeline: [],
          reportability: {}, lessons: '', source: 'imported', prov: it.prov || null });
      }
      if (old.length) note(`${old.length} imported incident(s) moved to the incident register`);
      delete w.incidents;
      // Policy exceptions take the CRGO exception model: scope, approver, compensating controls, and the
      // rule that an exception never waives a law.
      let ex = 0;
      for (const x of (w.isp?.issues || [])) {
        if (x.type !== 'exception') continue;
        x.scope ??= ''; x.compensatedBy ??= []; x.approvedBy ??= x.acceptedBy || ''; x.waivesLaw = false; ex++;
      }
      if (ex) note(`${ex} policy exception(s) given scope, approver and compensating controls`);
      w.grc ||= blankGrc(); w.audit ||= blankAudit(); w.isms ||= blankIsms(); w.crgo ||= blankCrgo(w.id);
      note('empty governance, audit, cybersecurity-management, ISMS and ontology-link records added');
    },
  },
  {
    from: 1, to: 2, release: '1.6.0',
    title: 'Data version 1 → 2: shared registers, policy, compliance and audit management, SIEM and SOAR',
    up(w, note) {
      w.shared ||= blankShared();
      const ev = Array.isArray(w.grc?.evidence) ? w.grc.evidence : [];
      for (const e of ev) w.shared.evidence.push(e);
      if (w.grc) delete w.grc.evidence;
      if (ev.length) note(`${ev.length} evidence record(s) moved to the shared evidence register`);
      const issues = Array.isArray(w.isp?.issues) ? w.isp.issues : [];
      const exc = issues.filter(x => x.type === 'exception');
      for (const x of exc) w.shared.exceptions.push({ ...x, concerns: x.policy ? [{ kind: 'policy', id: x.policy }] : [] });
      if (w.isp) w.isp.issues = issues.filter(x => x.type !== 'exception');
      if (exc.length) note(`${exc.length} policy exception(s) moved to the shared exception register`);
      // Policy statements get a stable identifier and a modality (unknown until someone states it).
      let stn = 0;
      for (const p of (w.isp?.policies || [])) {
        (p.statements || []).forEach((st, i) => { if (!st.id) { st.id = `${p.id}-S${i + 1}`; stn++; } st.modality ??= ''; });
        p.versions ||= [];
      }
      if (stn) note(`${stn} policy statement(s) given an identifier; modality left to be stated`);
      w.isp = Object.assign(blankIspExtra(), w.isp || { policies: [], issues: [] });
      w.audit = Object.assign(blankAudit(), w.audit || {});
      w.cms ||= blankCms(); w.siem ||= blankSiem(); w.soar ||= blankSoar();
      note('empty compliance-management, audit-management, SIEM and SOAR records added');
    },
  },
  {
    from: 2, to: 3, release: '1.8.0',
    title: 'Data version 2 → 3: current control catalogues only, standard markers, scenario screening and management summary',
    up(w, note) {
      const done = migrateLegacyControls(w);
      const mapped = done.filter(d => d.to && !d.merged).length, unmapped = done.filter(d => !d.to || d.merged);
      w.catalogueMigration = done.map(d => ({ ...d, date: new Date().toISOString().slice(0, 10), review: !d.to || !!d.merged }));
      if (mapped) note(`${mapped} reference(s) to ISO/IEC 27002:2013, NIST CSF 1.1 or CIS v7.1 mapped to ISO/IEC 27002:2022, NIST CSF 2.0 or CIS v8.1; the old identifier is kept in a note`);
      if (unmapped.length) note(`${unmapped.length} legacy reference(s) kept and flagged for review (no correspondence, or a record already under the new identifier): ${[...new Set(unmapped.map(d => d.from))].slice(0, 8).join(', ')}`);
      const mk = modernizeMarkers(w);
      if (mk) note(`${mk} text(s) given the standard markers (Analytical estimate — validation required; Information gap — organizational validation required)`);
      // The shipped teaching case follows the book: the e-mailed document of S2 and S8 is opened locally (AV:L).
      if (w.kind === 'example') {
        // A migration never changes a number, so the vectors are left as they are and the case says how to
        // take the current ones: Reset data → Start over (the Quality review lists it too, QC-26).
        const n = (w.assessment?.SCEN || []).filter(sc => AVL_VECTORS[sc.id] && sc.cvss === AVL_VECTORS[sc.id].from).length;
        if (n) note(`teaching case: S2 and S8 keep the AV:N vectors of the earlier case (numbers are never changed by a migration); the Process page offers the AV:L vectors of the current case (journalled), or Reset data → Start over takes the whole current case`);
      }
      w.screening ||= blankScreening(); w.mgmtSummary ||= blankSummary(); w.catalogueMigration ||= [];
      const seed = globalThis.CRG_MEDIBEC_SCREENING;
      if (w.kind === 'example' && seed && !Object.keys(w.screening.cands || {}).length && (w.assessment?.CANDIDATES || []).length === 45) {
        w.screening = JSON.parse(JSON.stringify(seed)); note('teaching case: the screening of its 45 candidates into ten families added');
      } else note('empty scenario-screening and management-summary records added');
    },
  },
  {
    from: 3, to: 4, release: '1.9.0',
    get title() { return 'Data version 3 → 4: ' + STEP4.map(s => s.title).join('; '); },
    up(w, note) {
      for (const s of STEP4) {
        if (s.up) { s.up(w, note); continue; }
        if (w[s.field] === undefined) { w[s.field] = s.blank(); note(`${s.title}: empty record added`); }
      }
    },
  },
  {
    from: 4, to: 5, release: '1.9.0',
    title: 'Data version 4 → 5: the identity, privilege & configuration record split into Identity & access management and Configuration management',
    up(w, note) { splitIpc5(w, note); },
  },
];

/* ================= 1.9.0 — Identity & access management (iam) and Configuration management (cm) =================
   Their sub-steps of data version 3 → 4 (STEP4 entries 'iam' and 'cm'), and the split of data version 4 → 5.
   Idempotent, and they never change a risk number: each throws (and the original is kept) when an invariant breaks. */

/** The empty records of the two modules. */
export const blankIam = () => IAM.blank();
export const blankCm = () => CM.blank();

const clone = x => JSON.parse(JSON.stringify(x ?? null));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const engineTotals = w => {
  const C = globalThis.CRG; if (!C?.calc) return null;
  const A = w.assessment || {}; let est = 0, res = 0;
  for (const sc of A.SCEN || []) { try { const r = C.calc(sc, A.APPETITE ?? C.DEFAULT_APPETITE, A.FACTOR ?? C.DEFAULT_FACTOR); est += r.est; res += r.res; } catch { /* the same scenario fails on both sides */ } }
  return { est: Math.round(est * 1e6) / 1e6, res: Math.round(res * 1e6) / 1e6 };
};
/**
 * Run fn(w) under the invariants of these modules: the assessment is deep-equal except evidence rows appended
 * (only when `appendOk`), the engine totals are equal, an asset changes only by a baseline reference, and no
 * proposal is accepted. Throws `<label> migration: …` when one breaks.
 */
function guarded(w, label, fn) {
  const before = { assessment: clone(w.assessment), assets: clone(w.assets || []), totals: engineTotals(w) };
  const out = fn();
  const ev0 = before.assessment?.EVIDENCE || [];
  const a1 = clone(w.assessment); const ev1 = a1?.EVIDENCE || [];
  if (!same(ev1.slice(0, ev0.length), ev0) || (!out?.appendOk && ev1.length !== ev0.length)) throw new Error(`${label} migration: the evidence register would change other than by appending`);
  if (a1) { if (before.assessment && 'EVIDENCE' in before.assessment) a1.EVIDENCE = ev0; else delete a1.EVIDENCE; }
  if (!same(a1, before.assessment)) throw new Error(`${label} migration: the assessment would change`);
  const t1 = engineTotals(w);
  if (before.totals && !same(before.totals, t1)) throw new Error(`${label} migration: the engine totals would change`);
  const assets = clone(w.assets || []);
  for (const a of assets) if (a.baseline) delete a.baseline.ref;
  const orig = clone(before.assets); for (const a of orig) if (a.baseline) delete a.baseline.ref;
  if (!same(assets, orig)) throw new Error(`${label} migration: an asset would change other than by a baseline reference`);
  if (['iam', 'cm'].some(k => (w[k]?.findings || []).some(f => (f.proposals || []).some(p => p.state === 'accepted' && !out?.acceptedBefore?.has(p))))) throw new Error(`${label} migration: a proposal would be applied`);
  return out;
}

/** Seed a teaching case with one module's sample (MediBec, CanaRetail when that case exists) if its registers are empty.
 *  Never throws on a scenario the copy lacks: that link or proposal is left out and journalled (1.9.0 review M1). */
function seedModule(w, MOD, samples, note = () => {}) {
  const id = MOD.caseOf(w), S = samples || {};
  if (!id || !S[id] || !MOD.registersEmpty(w)) return null;
  const r = MOD.applySample(w, S[id], { strict: false });
  for (const k of r?.skipped || []) note(k.kind === 'link'
    ? `teaching case: sample finding ${k.rule} not linked to scenario ${k.scenario}, which is not in this workspace`
    : `teaching case: sample proposal of finding ${k.rule} not added — no scenario ${k.scenario} in this workspace`);
  if (r && MOD === IAM) note(`teaching case: identity & access management sample added — ${r.rows} register rows, evidence ${r.evidence.join(', ') || 'none'}, ${r.findings} finding(s), ${r.proposals} pending proposal(s), nothing accepted`);
  if (r && MOD === CM) note(`teaching case: configuration management sample added — ${r.rows} register rows, evidence ${r.evidence.join(', ') || 'none'}, ${r.exceptions.length} exception(s), ${r.findings} finding(s), nothing accepted`);
  return r;
}
/** Seed both modules of a teaching case, Identity & access management first (its evidence takes the lower E-numbers). */
export function seedModules(w, note = () => {}) {
  const a = seedModule(w, IAM, globalThis.CRG_IAM_SAMPLES, note);
  const b = seedModule(w, CM, globalThis.CRG_CM_SAMPLES, note);
  return a || b ? { iam: a, cm: b } : null;
}

/** The iam part of data version 3 → 4: empty record and the teaching-case seed. Running it twice changes nothing the second time. */
export function migrateIam4(w, note = () => {}) {
  return guarded(w, 'iam', () => {
    w.iam = Object.assign(IAM.blank(), w.iam || {});
    IAM.reg(w);
    const seeded = seedModule(w, IAM, globalThis.CRG_IAM_SAMPLES, note);
    if (!seeded) note('empty identity & access management registers added');
    return { seeded: !!seeded, appendOk: !!seeded };
  });
}

/**
 * The cm part of data version 3 → 4: empty record, baseline promotion from the asset register,
 * teaching-case seed. Running it twice changes nothing the second time.
 */
export function migrateCm4(w, note = () => {}) {
  return guarded(w, 'cm', () => {
    w.cm = Object.assign(CM.blank(), w.cm || {});
    const R = CM.reg(w);
    // baselines named on assets become versioned baseline objects; the asset keeps its fields and gains a ref
    let promoted = 0, created = 0, drift = 0;
    for (const a of w.assets || []) {
      const b = a.baseline; const name = String(b?.name || '').trim();
      if (!name) continue;
      let bl = R.baselines.find(x => x.name === name);
      if (!bl) {
        bl = { id: CM.nextIdReg(R.baselines, 'BL'), name, platform: name.replace(/^CIS Benchmark — /, ''), kind: CM.kindOfName(name), licenceRef: '', owner: '', legacy: true,
          versions: [{ v: 'legacy', state: 'legacy', approved: '', approvedBy: '', effective: '', review: '', hash: '', rationale: 'Promoted from the asset register by the 1.9.0 migration', applicability: { assetTypes: [], note: '' } }], note: '' };
        R.baselines.push(bl); created++;
        note(`baseline "${name}" promoted from the asset register as ${bl.id} (legacy version)`);
      }
      const ver = bl.versions.find(v => v.v === 'legacy');
      if (ver && a.type && !ver.applicability.assetTypes.includes(a.type)) ver.applicability.assetTypes.push(a.type);
      if (!b.ref) { b.ref = { id: bl.id, v: 'legacy' }; promoted++; note(`asset ${a.id}: baseline reference ${bl.id} legacy added (no other field changed)`); }
      if (b.status === 'drift' && !R.deviations.some(d => d.migrated && d.asset === a.id)) {
        R.deviations.push({ id: CM.nextIdReg(R.deviations, 'DV'), baseline: bl.id, version: 'legacy', ciScope: '', asset: a.id, count: 1, cls: '', severity: 'medium', requirement: '',
          opened: b.checked || '', lastSeen: b.checked || '', exception: '', state: 'open', owner: a.owner || '', source: 'Information assets (migrated)', status: 'inferred', conf: 'Low',
          evidence: '', migrated: true, prov: { tag: 'INFERENCE', method: 'rules', file: '', date: new Date().toISOString().slice(0, 10) }, note: b.deviations || '' });
        drift++; note(`asset ${a.id} in drift: deviation recorded, to be classified`);
      }
    }
    if ((created || promoted) && !R.ciScopes.some(c => c.fromAssets)) {
      R.ciScopes.push({ id: CM.nextIdReg(R.ciScopes, 'CS'), label: 'Information assets', baseline: '', version: '', fromAssets: true, assetTypes: [], inScope: null, assigned: null, assessed: null, compliant: null,
        asOf: '', source: 'Information assets (migrated)', status: 'inferred', conf: 'Low', evidence: '', prov: { tag: 'INFERENCE', method: 'rules', file: '', date: new Date().toISOString().slice(0, 10) }, note: '' });
      note('configuration scope counted live from Information assets added');
    }
    const seeded = seedModule(w, CM, globalThis.CRG_CM_SAMPLES, note);
    if (!created && !promoted && !drift && !seeded) note('empty configuration management registers added');
    return { created, promoted, drift, seeded: !!seeded, appendOk: !!seeded };
  });
}

/**
 * Data version 4 → 5: a workspace saved by an earlier 1.9.0 build holds ONE record, `ipc`, for both modules. Its
 * registers, findings, imports and windows are moved — unchanged, with their identifiers — to `iam` and `cm`:
 *   • accounts, privileged, emergency, reviews, sod → iam; baselines, ciScopes, deviations, changes → cm;
 *   • a finding goes with the module of its register (identifiers kept: one IF-nn sequence across both);
 *   • an import trace goes with the module whose rows it created (both when it created rows in both; iam otherwise);
 *   • settings: iam keeps asOf and every window, cm keeps asOf and the freshness window;
 *   • a corrective action raised from a finding (source kind 'ipc-finding') names the module now holding it.
 * Then `ipc` is removed. Nothing in the assessment changes (accepted proposals stay in each scenario's ipc_basis,
 * as they were); a record already holding rows is completed, never overwritten. Running it twice changes nothing.
 */
export function splitIpc5(w, note = () => {}) {
  const src = w.ipc;
  const before = src && typeof src === 'object' ? clone(src) : null;
  const accepted = new Set(['iam', 'cm'].flatMap(k => (w[k]?.findings || []).flatMap(f => (f.proposals || []).filter(p => p.state === 'accepted'))));
  return guarded(w, 'split', () => {
    w.iam = Object.assign(IAM.blank(), w.iam && typeof w.iam === 'object' ? w.iam : {});
    w.cm = Object.assign(CM.blank(), w.cm && typeof w.cm === 'object' ? w.cm : {});
    if (!before) { delete w.ipc; return { split: false, acceptedBefore: accepted }; }
    const iam = IAM.reg(w), cm = CM.reg(w);
    const moved = { iam: 0, cm: 0 };
    const put = (to, k, rows) => { for (const r of rows || []) if (!to[k].some(x => x.id === r.id)) { to[k].push(r); moved[to === iam ? 'iam' : 'cm']++; } };
    for (const k of IAM.REGISTER_KEYS) put(iam, k, src[k]);
    for (const k of CM.REGISTER_KEYS) put(cm, k, src[k]);
    const st = src.settings || {};
    for (const k of Object.keys(IAM.blankSettings())) if (st[k] !== undefined) iam.settings[k] = st[k];
    for (const k of Object.keys(CM.blankSettings())) if (st[k] !== undefined) cm.settings[k] = st[k];
    // findings with the module of their register (and their accepted proposals, which already sit in ipc)
    const where = {};
    for (const f of src.findings || []) {
      const to = CM.REGISTER_KEYS.includes(f.register) ? cm : iam;
      where[f.id] = to === cm ? 'cm' : 'iam';
      if (!to.findings.some(x => x.id === f.id)) { to.findings.push(f); for (const p of f.proposals || []) if (p.state === 'accepted') accepted.add(p); }
    }
    // import traces with the module whose rows they created
    for (const t of src.imports || []) {
      const made = k => (k === 'cm' ? CM.REGISTER_KEYS.map(r => cm[r]) : IAM.REGISTER_KEYS.map(r => iam[r])).flat().some(r => r?.prov?.file === t.file && (!t.method || r.prov.method === t.method));
      const inCm = made('cm'), inIam = made('iam');
      const targets = inCm && !inIam ? [cm] : inCm && inIam ? [iam, cm] : [iam];
      for (const to of targets) if (!to.imports.some(x => x.at === t.at && x.file === t.file && x.sha256 === t.sha256)) to.imports.push(t);
    }
    // corrective actions raised from a finding
    let acts = 0;
    for (const a of w.shared?.actions || []) if (a?.source?.kind === 'ipc-finding' && where[a.source.id]) { a.source = { ...a.source, kind: where[a.source.id] + '-finding' }; acts++; }
    delete w.ipc;
    // lossless: every row, finding and import trace is in iam or cm
    const kept = [...IAM.REGISTER_KEYS.map(k => [k, iam]), ...CM.REGISTER_KEYS.map(k => [k, cm])].every(([k, R]) => (before[k] || []).every(r => R[k].some(x => x.id === r.id && same(x, r))));
    if (!kept || (before.findings || []).some(f => !(where[f.id] === 'cm' ? cm : iam).findings.some(x => x.id === f.id && same(x, f))) || (before.imports || []).some(t => ![...iam.imports, ...cm.imports].some(x => same(x, t))))
      throw new Error('split migration: a row, finding or import trace would be lost');
    const fi = (before.findings || []).filter(f => where[f.id] === 'iam').length, fc = (before.findings || []).filter(f => where[f.id] === 'cm').length;
    note(`identity, privilege & configuration record split: ${moved.iam} row(s) and ${fi} finding(s) to Identity & access management, ${moved.cm} row(s) and ${fc} finding(s) to Configuration management, ${(before.imports || []).length} import trace(s) kept, identifiers unchanged`);
    if (acts) note(`${acts} corrective action(s) raised from a finding now name its module`);
    note('the ipc record removed; scenarios, parameters and accepted changes (ipc_basis) unchanged');
    return { split: true, moved, acceptedBefore: accepted };
  });
}

/* ---------------- running them ---------------- */

/** The data version a workspace carries (0 for anything before 1.5.8). */
export const versionOf = w => Number.isInteger(w?.dataVersion) ? w.dataVersion : 0;
export const isNewer = w => versionOf(w) > DATA_VERSION;

/**
 * Bring one workspace to DATA_VERSION. Returns { ws, status, from, to, steps, error }:
 *   status "current"  — nothing to do (ws is the same object)
 *          "migrated" — ws is a NEW object; the caller keeps `original` before saving it
 *          "newer"    — written by a later release: ws is the original, to be opened read-only
 *          "failed"   — a step threw: ws is the original, untouched; error says why
 * fill(w) is the caller's shape-repair (state.migrate) applied after the steps.
 */
export function migrateWorkspace(w, { fill = null, today = new Date().toISOString().slice(0, 10) } = {}) {
  const from = versionOf(w);
  if (from > DATA_VERSION) return { ws: w, status: 'newer', from, to: from, steps: [] };
  if (from === DATA_VERSION) { if (fill) fill(w); return { ws: w, status: 'current', from, to: from, steps: [] }; }
  const original = w;
  let copy;
  try { copy = structuredClone(w); } catch { copy = JSON.parse(JSON.stringify(w)); }
  const steps = [];
  try {
    for (const m of MIGRATIONS) {
      if (m.from < from || m.to > DATA_VERSION) continue;
      const notes = [];
      m.up(copy, s => notes.push(s));
      copy.dataVersion = m.to;
      steps.push({ from: m.from, to: m.to, release: m.release, title: m.title, notes });
    }
    if (fill) fill(copy);
  } catch (e) {
    return { ws: original, status: 'failed', from, to: from, steps, error: String(e?.message || e) };
  }
  copy.dataVersion = DATA_VERSION;
  (copy.migrationLog ||= []).push({ date: today, from, to: DATA_VERSION, by: VERSION, steps: steps.map(s => ({ to: s.to, release: s.release, notes: s.notes })) });
  return { ws: copy, original, status: 'migrated', from, to: DATA_VERSION, steps };
}

/* ---------------- installation records (meta store) ---------------- */

export const META_VERSION = 1;
export const META_MIGRATIONS = [
  { from: 0, to: 1, release: '1.5.8', title: 'Installation records carry a data version', up() { /* no change of shape */ } },
];
/** Run the installation-level steps once; returns { from, to, newer }. */
export async function migrateMeta(store) {
  const from = Number((await store.get('meta', 'dataVersion').catch(() => 0)) || 0);
  if (from > META_VERSION) return { from, to: from, newer: true };
  for (const m of META_MIGRATIONS) if (m.from >= from) await m.up(store);
  if (from !== META_VERSION) await store.put('meta', 'dataVersion', META_VERSION);
  return { from, to: META_VERSION, newer: false };
}

/* ================= 1.9.0 — SSVC (STEP4 entry 'ssvc') =================
   The tree chosen for the workspace, one decision record per registered vulnerability, and the review
   items the exploitation forecast raises. Changes no number: an SSVC outcome is a response priority. */
export const blankSsvc = () => ({
  tree: 'deployer',           // 'deployer' (CISA SSVC) · 'deployer-cert' (CERT/CC deployer) · 'supplier' (CERT/CC supplier)
  decisions: {},              // vulnerability id → { tree, points, derived, outcome, evidence, override, by, date, justification, history[] }
  review: [],                 // exploitation-forecast review items: { id, cve, date, forecast, band, reasons[], source, status, by, closed, note }
});
