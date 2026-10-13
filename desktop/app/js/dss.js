/* dss.js — the CRGO dss/v1 contract, legal applicability and control evidence (1.5.8).

   CRGO 0.9 reads an organisation's context and receives results back through two tools of its MCP
   server, crgo_risk_context and crgo_submit_assessment, over an RDF graph of the organisation that
   CRGO's own bridge (crg2rdf.py) builds from the assessment. The helper builds that graph in a folder
   kept with the client's confidential deliverables (never in a repository), adds the application's own
   records in CRGO terms (control tests by assessor line, audit findings, compliance determinations, the
   organisation profile and the legal applicability it implies), and calls the two tools.

   The rules this module enforces (CRGO brief, section 6):
     • CRGO computes no risk. Every number written back comes from this application's verified engine.
     • A write-back is always "proposed": approval, risk acceptance and funding are human decisions.
     • Organisation identifiers use the organisation's own base, never https://w3id.org/crgo/.
     • "Supports compliance with" is not compliance: only a determination with evidence says satisfied.
     • EPSS is not a scenario likelihood, and KEV says nothing about the organisation's own systems.
     • Unknown applicability stays unknown (an evidence gap); "potentially applicable" needs a qualified person.
     • A refusal from CRGO is shown to the analyst as it came, and the request is not retried with altered data.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as helper from './helper.js';
import { VERSION } from './version.js';
import { S, exportAssessment, included } from './state.js';
import * as SH from './shared.js';
import * as CMS from './cms.js';
import * as SIEM from './siem.js';
import * as SOAR from './soar.js';

export const CONTRACT = 'dss/v1';
export const GAP = 'Evidence gap — organizational input required.';
export const QUALIFIED = 'Qualified review required (potentially applicable).';
export const MGMT = 'Management decision required.';

/** assessmentKind → [engine key, unit] (brief §4). */
export const KINDS = {
  'estimated-risk': ['est', 'CRG risk units'], 'tolerated-risk': ['tol', 'CRG risk units'], 'mitigated-risk': ['mit', 'CRG risk units'],
  'residual-risk': ['res', 'CRG risk units'], 'risk-to-tolerance-ratio': ['ratio', 'ratio'], 'budget-target': [null, 'currency'],
};
/** What each refusal code means, for the analyst. */
export const ERRORS = {
  SCHEMA_INVALID: 'The document does not conform to dss/v1.', UNKNOWN_ORGANISATION: 'No organisation graph declares this organisation: rebuild the graph.',
  UNKNOWN_SUBJECT: 'The scenario is not in the organisation graph: rebuild the graph after adding or renaming scenarios.',
  TENANT_MISMATCH: 'The subject or an input belongs to another organisation base.', REFERENCE_NAMESPACE: 'Organisation identifiers may not be under https://w3id.org/crgo/.',
  STATUS_NOT_PROPOSED: 'Only proposed results can be written back; approval is a separate human act.', MODEL_VERSION_MISSING: 'The model version actually used is required.',
  INPUT_UNKNOWN: 'An input is not one of the organisation\'s records: rebuild the graph.', CRGO_TOO_OLD: 'This CRGO release is too old for this contract (dss/v1 needs v0.9.1, compliance/v1 and secops/v1 need v0.10.0).',
  NO_GRAPH: 'Build the organisation graph first.', HELPER: 'The local helper reported a problem.', BRIDGE_FAILED: 'The bridge could not convert the assessment.',
};

/* ---------------- identifiers ---------------- */
export function validBase(b) {
  b = String(b || '').trim();
  if (!/^https?:\/\/[^\s]+$/.test(b)) return 'The base must be an http(s) address the organisation controls (or a private one such as https://crg.invalid/…).';
  if (b.startsWith('https://w3id.org/crgo/') || b.startsWith('http://w3id.org/crgo/')) return 'Organisation identifiers may never be under https://w3id.org/crgo/ (the ontology\'s own namespace).';
  return null;
}
export const base = (ws = S.ws) => { const b = String(ws.crgo?.base || '').trim(); return /[/#]$/.test(b) ? b : b + '/'; };
export const orgIri = (ws = S.ws) => base(ws) + 'org';
export const scenIri = (sid, ws = S.ws) => base(ws) + 'scenario-' + sid;
/** The parameter IRIs crg2rdf gives a scenario: the inputs of every result written back. */
export const inputs = (sid, ws = S.ws) => ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu', 'red_p', 'red_i', 'cvss'].map(k => base(ws) + sid + '-' + k);

/* ---------------- the organisation's records in CRGO terms ---------------- */
/** 'control-<sid>-<n>', the identifier crg2rdf gives the n-th existing control of a scenario (1-based). */
export function controlRef(ws, target) {
  if (!target || target.kind !== 'scenario-control') return null;
  const s = ws.assessment.SCEN.find(x => x.id === target.sid);
  if (!s) return null;
  let i = (s.controls || []).findIndex(c => c === target.text);
  if (i < 0) i = Number(target.index) - 1;
  return i >= 0 && i < (s.controls || []).length ? `control-${s.id}-${i + 1}` : null;
}
export function facts(ws = S.ws) {
  const g = ws.grc || {};
  const obligations = {};
  for (const s of ws.assessment.SCEN) {
    const own = (s.obligations || []).map(String);
    const linked = (s.crgo?.obligations || []).map(o => String(o).split(' — ')[0]);
    const all = [...new Set([...own, ...linked])].filter(Boolean);
    if (all.length) obligations[s.id] = all;
  }
  return {
    profile: g.profile || {},
    obligations,
    controlTests: (g.controlTests || []).map(t => ({ id: t.id, label: t.label, control: controlRef(ws, t.target), date: t.date, line: t.line, result: t.result, aspect: t.aspect })).filter(t => t.control),
    // 1.6.0 — every finding (the control link stays optional): compliance/v1 lists findings and their overdue actions
    findings: (ws.audit?.findings || []).map(f => ({ id: f.id, title: f.title, control: controlRef(ws, f.target), raisedOn: f.raisedOn, condition: f.condition,
      closedOn: f.status === 'closed' ? f.closedOn : '', reopened: f.reopened || [], significance: f.significance || '', rootCause: f.rootCause || '',
      obligations: obligationRefs(ws, f), observation: f.observation || '' })),
    determinations: (g.determinations || []).map(d => ({ id: d.id, provision: d.provision, obligation: d.obligation || '', state: d.state, date: d.date, evidenceGap: d.evidenceGap,
      evidence: (d.evidence || []).map(x => String(x).trim()).filter(id => SH.evidence(ws).some(e => e.id === id)), assessor: d.assessor || '', rootCause: d.rootCause || '' })),
    ...opsFacts(ws),
  };
}

/* ---------------- 1.6.0 — policy, compliance, audit, SIEM and SOAR records for CRGO 0.10 ---------------- */
const arr = v => Array.isArray(v) ? v : v ? [v] : [];
const day10 = v => String(v || '').slice(0, 10);
/** Obligation identifiers a finding refers to: its links of kind obligation, and OBL- identifiers in its criterion. */
function obligationRefs(ws, f) {
  const ids = new Set([...arr(f.links), ...arr(f.concerns)].filter(l => l?.kind === 'obligation').map(l => l.id));
  for (const m of String(f.criterion || '').matchAll(/\bOBL-\d+\b/g)) ids.add(m[0]);
  return [...ids].filter(id => (ws.cms?.obligations || []).some(o => o.id === id));
}
/** The date on which the current coverage status of a matrix row became true (its last change point on or before asOf). */
function coverageSince(ws, row, asOf) {
  const R = SIEM.reg(ws), pts = new Set();
  for (const x of row.rules) {
    const r = x.rule;
    if (r.created) pts.add(day10(r.created));
    for (const h of r.history || []) if (h.date) pts.add(day10(h.date));
    for (const t of R.tests.filter(t => t.ruleId === r.id)) if (t.date) pts.add(day10(t.date));
    for (const id of r.requiredSources || []) { const s = R.sources.find(y => y.id === id); for (const h of s?.healthHistory || []) if (h.date) pts.add(day10(h.date)); if (s?.healthDate) pts.add(day10(s.healthDate)); }
  }
  const dates = [...pts].filter(d => /^\d{4}-\d\d-\d\d$/.test(d) && d <= asOf).sort();
  const at = d => { const st = row.rules.map(x => SIEM.ruleCoverage(x.rule, ws, d).status); return ['validated', 'untested', 'degraded'].find(s => st.includes(s)) || 'missing'; };
  let since = dates[0] || asOf;
  for (let i = 1; i < dates.length; i++) if (at(dates[i]) !== at(dates[i - 1])) since = dates[i];
  return since;
}
/**
 * The records of the management modules, as the bridge writes them into orgfacts.ttl in CRGO 0.10 terms.
 * Only what the application states is sent: nothing is inferred here (no compliance from a mapping, no
 * incident from an alert, no authorisation from anything but a recorded approval).
 */
export function opsFacts(ws = S.ws, asOf = new Date().toISOString().slice(0, 10)) {
  const I = ws.isp || {}, C = ws.cms || {}, A = ws.audit || {}, SR = ws.siem ? SIEM.reg(ws) : null, OR = ws.soar ? SOAR.reg(ws) : null;
  const policies = (I.policies || []).map(p => {
    const versions = (p.versions || []).filter(v => v.state !== 'withdrawn').map(v => ({ version: String(v.version), state: v.state, hash: v.hash || '', effective: v.effective || v.published || '',
      nextReview: v.nextReview || '', retired: v.retired || (v.state === 'superseded' ? v.until || '' : ''), approvedBy: v.approval?.by || '', approvedOn: v.approval?.date || '',
      statements: (v.content?.statements || []).map(s => ({ id: s.id, text: s.text || '', modality: s.modality || 'must', guideline: !!s.guideline, training: s.training || [] })) }));
    if (['draft', 'review'].includes(p.status) && !versions.some(v => v.version === String(p.version)))
      versions.push({ version: String(p.version), state: p.status, hash: '', effective: '', nextReview: '', retired: '', working: true,
        statements: (p.statements || []).map(s => ({ id: s.id, text: s.text || '', modality: s.modality || 'must', guideline: !!s.guideline, training: s.training || [] })) });
    return { id: p.id, title: p.title || p.id, type: p.type || 'policy', family: p.family || '', owner: p.owner || '', versions };
  });
  const incidents = (ws.csm?.incidents || []).map(i => ({ id: i.id, title: i.title || i.id, status: i.status, confirmed: i.confirmed || '', confirmedBy: i.confirmedBy || '',
    severity: i.severity || '', category: i.category || '', personalInfo: !!i.personalInfo, loi25: i.loi25 || 'not-assessed', gdpr: i.gdpr || 'not-assessed',
    reportAssessedOn: i.reportAssessedOn || '', case: i.case || '' }));
  const out = {
    families: (I.families || []).map(f => ({ id: f.id, name: f.name || f.id })),
    policies,
    acks: (I.acks || []).map(a => ({ id: a.id, policy: a.policy, version: String(a.version || ''), hash: a.hash || '', person: a.person || '', date: a.date || '' })),
    training: (I.training || []).map(t => ({ id: t.id, title: t.title || t.id, policies: t.policies || [], statements: t.statements || [] })),
    nonconformities: (I.issues || []).filter(x => x.type !== 'exception').map(x => ({ id: x.id, title: x.title || x.id, policy: x.policy || '', statement: x.statement || '',
      detected: x.detected || '', status: x.status || 'open', closedOn: x.closedOn || x.closed || '', rootCause: x.rootCause || '' })),
    cmsObligations: (C.obligations || []).map(o => ({ id: o.id, title: o.title || o.id, provision: o.provision || '', owner: o.owner || '', applicability: o.applicability || 'not-assessed',
      applicabilityOn: o.applicabilityOn || o.applicabilityReviewed || o.created || '', applicabilityReviewer: o.applicabilityReviewer || '', status: o.status || 'active' })),
    authorities: (C.authorities || []).map(a => ({ id: a.id, name: a.name || a.id })),
    exemptions: (C.exemptions || []).filter(x => ['granted', 'expired'].includes(x.state)).map(x => ({ id: x.id, title: x.title || x.id, obligation: x.obligation || '', provision: x.provision || '',
      authority: x.authority || '', validFrom: x.validFrom || '', validUntil: x.validUntil || '' })),
    programmes: (C.programmes || []).map(p => ({ id: p.id, name: p.name || p.id, owner: p.owner || '', covers: p.covers || [], status: p.status || 'draft' })),
    adoptions: (C.adoptions || []).map(a => ({ id: a.id, framework: a.framework || '', part: a.part || '', scope: a.scope || '', programme: a.programme || '', decidedBy: a.decidedBy || '',
      decidedOn: a.decidedOn || '', status: a.status || 'active' })),
    deadlines: (ws.cms ? CMS.deadlineInstances(ws) : []).map(x => ({ id: x.id, title: x.title || x.deadline.title || x.id, obligation: x.obligation || '', trigger: x.trigger, incident: x.incident || '',
      offset: Number(x.deadline.offset) || 0, unit: x.deadline.unit || 'hours', due: x.due || '', pending: !!x.pending })),
    submissions: (C.submissions || []).map(s => ({ id: s.id, title: s.title || s.subject || s.id, authority: s.authority || '', obligation: s.obligation || '', answers: s.answers || '',
      state: s.state || (s.submitted ? 'submitted' : 'preparation'), submittedOn: s.submittedOn || s.submitted || '', receiptOn: s.receiptOn || '' })),
    evidence: (ws.shared?.evidence || []).map(e => ({ id: e.id, title: e.title || e.id, validUntil: e.validUntil || '', periodFrom: e.periodFrom || '', periodTo: e.periodTo || '',
      sufficiency: e.sufficiency || '', judgedBy: e.judgedBy || '' })),
    mappings: (ws.shared?.mappings || []).filter(m => m.from && m.to).map(m => ({ id: m.id, from: m.from, to: m.to, type: m.type || 'related', review: m.review || 'proposed',
      reviewedBy: m.reviewedBy || '', reviewed: m.reviewed || '', confidence: m.confidence || '', rationale: m.rationale || '', edition: m.edition || '' })),
    exceptions: (ws.shared?.exceptions || []).filter(x => x.status === 'accepted').map(x => ({ id: x.id, title: x.title || x.id, policy: x.policy || '', statement: x.statement || '',
      concerns: [...arr(x.concerns), ...(String(x.legalObligation || '').match(/\bOBL-\d+\b/g) || []).map(id => ({ kind: 'obligation', id }))],
      opened: x.opened || '', expiry: x.expiry || '', approvedBy: x.approvedBy || '' })),
    actions: (ws.shared?.actions || []).map(a => ({ id: a.id, title: a.title || a.id, owner: a.owner || '', due: a.due || '', state: a.state || 'open',
      corrects: [a.source, ...arr(a.links)].filter(l => l && ['finding', 'issue'].includes(l.kind)).map(l => l.kind + ':' + l.id) })),
    observations: (A.observations || []).map(o => ({ id: o.id, title: o.title || o.id, status: o.status || 'draft', finding: o.finding || '' })),
    incidents,
  };
  if (SR) {
    const rows = SIEM.coverageMatrix(ws, asOf).filter(r => r.scenario && r.rules.length);
    out.siem = {
      sources: SR.sources.map(s => ({ id: s.id, name: s.name || s.id, asset: s.asset || '', system: s.system || '',
        health: [...(s.healthHistory || []).map(h => ({ date: day10(h.date), state: h.state })), ...(!(s.healthHistory || []).length && s.healthDate ? [{ date: day10(s.healthDate), state: s.health || 'unknown' }] : []),
          ...(SIEM.healthAt(s, asOf).stale ? [{ date: asOf, state: 'silent', note: 'stale collection' }] : [])] })),
      strategies: SR.strategies.map(s => ({ id: s.id, name: s.name || s.id, reference: s.reference || '', techniques: s.techniques || [] })),
      rules: SR.rules.map(r => ({ id: r.id, title: r.title || r.id, version: String(r.version || '1'), status: SIEM.statusAt(r, asOf), language: r.language || '', ruleId: r.ruleId || '',
        techniques: r.techniques || [], requiredSources: r.requiredSources || [], strategy: r.strategy || '', created: day10(r.created) })),
      tests: SR.tests.filter(t => { const r = SR.rules.find(x => x.id === t.ruleId); return r && (!t.ruleVersion || String(t.ruleVersion) === String(r.version || '1')); })
        .map(t => ({ id: t.id, rule: t.ruleId, date: day10(t.date), result: t.result || '', tester: t.tester || '' })),
      coverage: rows.map(r => {
        const eff = r.rules.map(x => x.test).filter(t => t && t.result === 'effective').sort((a, b) => (a.date < b.date ? 1 : -1))[0];
        return { id: `${r.scenario}-${r.technique || 'any'}`, scenario: r.scenario, technique: r.technique || '', rules: r.rules.map(x => x.rule.id), strategies: [...new Set(r.rules.map(x => x.rule.strategy).filter(Boolean))],
          status: r.status, test: r.status === 'validated' && eff ? eff.id : '', date: coverageSince(ws, r, asOf) };
      }),
      gaps: SR.gaps.filter(g => g.status !== 'closed').map(g => ({ id: g.id, title: g.title || g.id, scenario: g.scenario || '', technique: g.technique || '', source: g.source || '', raised: day10(g.raised) })),
      alerts: SR.alerts.map(a => { const cj = (ws.assessment?.CROWN || []).find(c => [c[0], c[1]].some(k => String(k || '').toLowerCase() === String(a.asset || '').toLowerCase()));
        return { id: a.id, title: a.title || a.id, triage: a.triage || 'new', detected: a.detected || '', rule: a.ruleId || '', asset: cj ? cj[0] : a.asset || '', crown: SIEM.isCrownJewel(a.asset, ws),
          indicators: a.indicators || [], tlp: SIEM.normTlp(a.tlp) || 'AMBER', case: a.caseId || '' }; }),
      indicators: SR.indicators.map(i => ({ id: i.id, name: i.name || i.value || i.id, pattern: SIEM.TLP_RESTRICTED.has(SIEM.normTlp(i.tlp) || 'AMBER') ? '' : i.pattern || '', patternType: i.patternType || 'stix',
        validFrom: day10(i.validFrom), validUntil: day10(i.validUntil), confidence: i.confidence ?? null, confidenceMethod: i.confidenceMethod || '', tlp: SIEM.normTlp(i.tlp) || 'AMBER', source: i.source || '' })),
    };
  }
  if (OR) {
    out.soar = {
      cases: OR.cases.map(c => ({ id: c.id, title: c.title || c.id, status: c.status || 'open', opened: c.opened || '', alerts: c.alerts || [], incident: c.incident || '' })),
      playbooks: OR.playbooks.map(p => {
        const vs = (p.versions || []).slice().sort((a, b) => a.version - b.version);
        return { id: p.id, name: p.name || p.id, owner: p.owner || '', scenarios: p.scenarios || [], versions: vs.map((v, i) => ({ version: v.version, state: v.state, published: v.published || '',
          retired: v.state === 'retired' ? (vs.slice(i + 1).find(n => n.published)?.published || '') : '' })) };
      }),
      gates: OR.gates.map(g => ({ id: g.id, name: g.name || g.id, riskClasses: g.riskClasses || [], criticalAssets: !!g.criticalAssets, authorities: g.authorities || [] })),
      approvals: OR.approvals.map(a => ({ id: a.id, kind: a.kind || 'specific', outcome: a.outcome || 'requested', approver: a.approver || '', requestedBy: a.requestedBy || '', decidedOn: a.decidedOn || '',
        validFrom: a.validFrom || '', validUntil: a.validUntil || '', revokedOn: a.revokedOn || '', execution: a.execution || '', action: a.action || '', riskClasses: a.riskClasses || [],
        status: SOAR.approvalStatus(a) })),
      executions: OR.executions.map(x => {
        const step = (OR.playbooks.find(p => p.id === x.playbook)?.versions || []).find(v => v.version === Number(x.version))?.steps?.find(s => s.id === x.step);
        return { id: x.id, action: x.action || '', riskClass: x.riskClass || '', criticalAsset: !!x.criticalAsset, started: x.started || '', status: x.status || '', attempt: x.attempt || '',
          approvals: Array.isArray(x.approval) ? x.approval : x.approval ? [x.approval] : [], case: x.case || '',
          gates: SOAR.gatesFor(ws, { riskClass: x.riskClass, criticalAsset: !!x.criticalAsset, step }, SOAR.T(x.started)).map(g => g.id), gated: SOAR.isGated(ws, x, SOAR.T(x.started)) };
      }),
      simulations: OR.simulations.map(s => ({ id: s.id, playbook: s.playbook, version: s.version, date: day10(s.date), result: s.result, by: s.by || '' })),
    };
  }
  return out;
}
/** The assessment exactly as it is sent to CRGO's bridge (included scenarios, CVSS score from this engine). */
export function assessmentFor(ws = S.ws) {
  const a = exportAssessment(ws, { includedOnly: true });
  const run = self.CRG.run(ws.assessment);
  const cv = Object.fromEntries(run.results.map(r => [r.id, r.cvss]));
  for (const s of a.SCEN) { if (cv[s.id] != null) s.cvss_score = cv[s.id]; }
  return a;
}

/* ---------------- calls ---------------- */
async function post(op, body) {
  await helper.probe().catch(() => {});
  if (!helper.HS.helper) return { error: true, code: 'HELPER', message: 'The local helper is not running: start the application with its launcher to reach the ontology server.' };
  try { return await helper.post('/api/crgo/' + op, body); }
  catch (e) { return { error: true, code: 'HELPER', message: String(e.message || e) }; }
}
export async function buildGraph(ws = S.ws) {
  const bad = validBase(ws.crgo.base);
  if (bad) return { error: true, code: 'REFERENCE_NAMESPACE', message: bad };
  const a = assessmentFor(ws);
  const out = await post('graph', { ws: ws.id, base: base(ws), label: ws.crgo.label || ws.org.name || ws.name, assessment: a, facts: facts(ws), date: new Date().toISOString().slice(0, 10) });
  if (out.error) return out;
  const local = self.CRG.run(ws.assessment).results.filter(r => included(r.id, ws));
  const est = local.reduce((t, r) => t + r.est, 0), res = local.reduce((t, r) => t + r.res, 0);
  ws.crgo.graph = { built: new Date().toISOString(), sha256: out.sha256, triples: out.triples, factTriples: out.factTriples, totals: out.totals,
    organization: out.organization, release: out.release, unknownProvisions: out.unknownProvisions || [], results: out.results,
    agrees: Math.abs(est - out.totals.est) < 0.5 && Math.abs(res - out.totals.res) < 0.5 };
  if (out.applicability) ws.grc.applicability = { date: new Date().toISOString().slice(0, 10), source: 'mcp', release: out.release?.tag, results: out.applicability };
  return out;
}
export async function context(sid, asOf, ws = S.ws) {
  const out = await post('context', { ws: ws.id, organization: orgIri(ws), scenario: scenIri(sid, ws), as_of: asOf });
  if (out.error) return out;
  if (out.document?.error) return out.document;
  ws.crgo.contexts[sid] = { asOf, at: new Date().toISOString(), doc: out.document };
  return out.document;
}
/** One dss/v1 document per quantity, from this application's own engine. */
export function document(ws, sid, kind, { actor = '', computedAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z') } = {}) {
  const [key, unit] = KINDS[kind];
  const g = ws.crgo.graph;
  let value, subject = scenIri(sid, ws), ins = inputs(sid, ws), extra = {};
  if (kind === 'budget-target') {
    const it = Number(ws.budget?.it_budget) || 0;
    value = +(it * self.CRG.budgetTarget(Number(ws.assessment.APPETITE))).toFixed(2);
    subject = base(ws) + 'assessment'; ins = [base(ws) + 'appetite']; extra = { currency: String(ws.assessment.CURRENCY || 'CAD').toUpperCase().slice(0, 3) };
  } else {
    const r = self.CRG.run(ws.assessment).results.find(x => x.id === sid);
    value = +Number(r[key]).toFixed(kind === 'risk-to-tolerance-ratio' ? 4 : 2);
  }
  return { schemaVersion: '1.0', contract: CONTRACT, organizationId: orgIri(ws), subjectId: subject, assessmentKind: kind,
    modelId: 'CyberRiskGuardian', modelVersion: VERSION, computedAt, inputs: ins, inputDocumentSha256: g?.sha256 || '',
    ontologyRelease: g?.release?.ontology || '0.9.0', result: { value, unit, ...extra }, status: 'proposed',
    provenance: { producer: 'CyberRiskGuardian', tool: 'crg.js (CyberRiskGuardian Desktop ' + VERSION + ')', actor: actor || 'analyst' } };
}
export async function submit(ws, doc) {
  const out = await post('submit', { ws: ws.id, document: doc });
  const r = out.result || out;
  const row = { at: new Date().toISOString(), sid: doc.subjectId.split('scenario-').pop(), kind: doc.assessmentKind, value: doc.result.value, unit: doc.result.unit };
  if (r.error) Object.assign(row, { status: 'refused', code: r.code, message: r.message, details: r.details || null });
  else Object.assign(row, { status: 'proposed', stored: r.stored, file: r.file });
  ws.crgo.writeBacks.unshift(row);
  ws.crgo.writeBacks = ws.crgo.writeBacks.slice(0, 500);
  return row;
}
/* ---------------- 1.6.0 — read contracts compliance/v1 and secops/v1 (CRGO v0.10.0) ---------------- */
export const VIEW_CONTRACTS = { compliance: 'compliance/v1', secops: 'secops/v1' };
/** One read of a view at a date. CRGO's refusal comes back as it came ({error, code, message}); nothing is retried. */
async function view(op, ws, asOf) {
  const out = await post(op, { ws: ws.id, organization: orgIri(ws), as_of: asOf });
  if (out.error) return out;
  const doc = out.document;
  if (!doc || doc.error) return doc || { error: true, code: 'HELPER', message: 'No document.' };
  (ws.crgo.views ||= {})[op] = { asOf, at: new Date().toISOString(), release: out.release?.tag || doc.ontologyRelease, doc };
  return doc;
}
/** crgo_compliance_context: obligations with their latest determination and evidence status, directive versions, exceptions, deadlines, findings. */
export const complianceContext = (ws = S.ws, asOf = new Date().toISOString().slice(0, 10)) => view('compliance', ws, asOf);
/** crgo_secops_context: coverage (validated by test or not), rules and telemetry, untriaged alerts, gates, executions without a valid approval, triage. */
export const secopsContext = (ws = S.ws, asOf = new Date().toISOString().slice(0, 10)) => view('secops', ws, asOf);
export const REASON_TEXT = { absent: 'no approval recorded', expired: 'approval expired', revoked: 'approval revoked', 'not-yet-valid': 'approval not yet valid',
  'wrong-authority': 'approver without the gate\'s authority', 'not-corresponding': 'approval does not correspond to the action', 'not-granted': 'approval not granted' };

export async function applicabilityViaHelper(ws = S.ws) {
  const out = await post('applicability', { ws: ws.id, base: base(ws), facts: { profile: ws.grc.profile }, date: new Date().toISOString().slice(0, 10) });
  return out;
}

/* ---------------- legal applicability, offline (a port of pipeline/grc/applicability.py) ---------------- */
const MET = 'met', NOT = 'not met', UNK = 'undetermined';
function member(f, props, wanted) {
  const listed = new Set(props.flatMap(p => f[p] || []));
  if (wanted.some(w => listed.has(w))) return MET;
  return props.every(p => f.complete.includes(p)) ? NOT : UNK;
}
function factsOf(p) {
  const acts = p.activities || [];
  return { hasOrganisationType: p.orgTypes || [], establishedIn: p.establishedIn || [], offersServicesIn: p.offersServicesIn || [],
    monitorsBehaviourIn: p.monitorsBehaviourIn || [], carriedOutBy: acts, processesDataCategory: acts.flatMap(a => a.dataCategories || []),
    dataSubjectsIn: acts.flatMap(a => a.dataSubjectsIn || []), transfersDataTo: acts.flatMap(a => a.transfersTo || []), complete: p.complete || [] };
}
function test(f, expr) {
  const [name, arg = ''] = expr.split(/=(.*)/s);
  if (name === 'orgType') return member(f, ['hasOrganisationType'], [arg]);
  if (name === 'orgTypeIn') return member(f, ['hasOrganisationType'], arg.split(','));
  if (['establishedIn', 'offersServicesIn', 'monitorsBehaviourIn'].includes(name)) return member(f, [name], [arg]);
  if (name === 'activeIn') return member(f, ['offersServicesIn', 'dataSubjectsIn'], [arg]);
  if (name === 'processesPersonalInfo') return f.carriedOutBy.length ? MET : (f.complete.includes('carriedOutBy') ? NOT : UNK);
  if (name === 'processesData') return member(f, ['processesDataCategory'], [arg]);
  if (name === 'transfersOutside') {
    const places = new Set([...f.dataSubjectsIn, ...f.transfersDataTo]);
    if ([...places].some(x => x !== arg)) return MET;
    return ['dataSubjectsIn', 'transfersDataTo'].every(k => f.complete.includes(k)) ? NOT : UNK;
  }
  throw new Error('unknown condition test: ' + expr);
}
/** States per instrument: Applicable, NotApplicable, PotentiallyApplicable, Unknown — as CRGO's evaluator. */
export function evaluate(profile, date, legal) {
  const f = factsOf(profile || {}), out = {};
  for (const inst of legal.instruments) {
    const ev = inst.conditions.map(c => ({ id: c.id, role: c.role, interp: c.interpretive, r: test(f, c.test) }));
    const req = ev.filter(e => e.role === 'required'), any = ev.filter(e => e.role === 'anyof'), exc = ev.filter(e => e.role === 'exception');
    let state;
    if (inst.starts && date < inst.starts) state = 'NotApplicable';
    else if (exc.some(e => e.r === MET && !e.interp) || req.some(e => e.r === NOT) || (any.length && any.every(e => e.r === NOT))) state = 'NotApplicable';
    else if (exc.some(e => e.r === MET)) state = 'PotentiallyApplicable';
    else if ([...req, ...exc].some(e => e.r === UNK) || (any.length && !any.some(e => e.r === MET))) state = 'Unknown';
    else {
      let relied = req.filter(e => e.r === MET);
      const plain = any.filter(e => e.r === MET && !e.interp);
      relied = relied.concat(plain.length ? plain : any.filter(e => e.r === MET));
      state = relied.some(e => e.interp) ? 'PotentiallyApplicable' : 'Applicable';
    }
    out[inst.id] = { state, met: ev.filter(e => e.r === MET).map(e => e.id).sort(), notMet: ev.filter(e => e.r === NOT).map(e => e.id).sort(),
      undetermined: ev.filter(e => e.r === UNK).map(e => e.id).sort() };
  }
  return out;
}
/** How a state is said to the analyst: never legal advice, unknown never becomes "not applicable". */
export const STATE_TEXT = { Applicable: 'applicable', NotApplicable: 'not applicable', PotentiallyApplicable: QUALIFIED, Unknown: GAP };
export const STATE_KIND = { Applicable: 'warn', NotApplicable: '', PotentiallyApplicable: 'warn', Unknown: 'bad' };

/* ---------------- control evidence: the latest result per assessor line, and conflicts ---------------- */
export const LINES = [['self-assessment', 'Management self-assessment'], ['second-line', 'Second line'], ['internal-audit', 'Internal audit'], ['external', 'External assurer']];
export const RESULTS = [['effective', 'Effective'], ['partly-effective', 'Partly effective'], ['ineffective', 'Ineffective'], ['not-tested', 'Not tested']];
export const ASPECTS = [['design', 'Design'], ['implementation', 'Implementation'], ['operation', 'Operation']];
const RANK = { effective: 2, 'partly-effective': 1, ineffective: 0 };
/** Latest test per line for one control target, the open findings on it, and whether the lines disagree. */
export function controlEvidence(ws, target, asOf = new Date().toISOString().slice(0, 10)) {
  const same = t => JSON.stringify(t.target) === JSON.stringify(target) || (t.target?.kind === 'scenario-control' && target?.kind === 'scenario-control' && controlRef(ws, t.target) === controlRef(ws, target));
  const latest = {};
  for (const t of (ws.grc?.controlTests || []).filter(same)) {
    if (!t.date || t.date > asOf) continue;
    if (!latest[t.line] || t.date > latest[t.line].date) latest[t.line] = t;
  }
  return conflictOf(Object.values(latest), (ws.audit?.findings || []).filter(f => same(f) && f.status !== 'closed' && (!f.raisedOn || f.raisedOn <= asOf)));
}
/** From a list of latest assessments ({line, result}) — local or from crgo_risk_context — the CQ-GRCA-08 conflict. */
export function conflictOf(latest, openFindings = []) {
  const self_ = latest.find(t => t.line === 'self-assessment');
  const indep = latest.filter(t => t.line !== 'self-assessment' && t.line !== 'unstated' && t.result in RANK);
  const conflict = !!self_ && self_.result in RANK && indep.some(t => RANK[t.result] < RANK[self_.result]);
  const confidence = indep.length ? (indep.some(t => t.result !== 'effective') || openFindings.length ? 'lowered' : 'independent') : self_ ? 'self-assessed only' : 'untested';
  return { latest, openFindings, conflict, confidence };
}
