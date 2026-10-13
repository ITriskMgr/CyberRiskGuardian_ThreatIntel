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
       decisions are carried as they are. The engine self-check (84,491 / 41,104) runs on the result.
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
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { VERSION } from './version.js';

export const DATA_VERSION = 2;

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
];

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
