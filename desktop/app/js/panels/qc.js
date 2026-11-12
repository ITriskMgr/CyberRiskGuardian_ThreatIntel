/* Quality review (1.5.8) — the checks a reviewer runs before results leave the analyst.

   Each check reads the workspace and says pass, attention or fail, with what to fix and where. They
   follow the CRGO brief's rules and CyberRiskGuardian's evidence discipline:
     write-backs carry a model version and inputs, and are only proposals · no result is called approved
     unless a person approved it, under valid delegated authority · "supported by" is not "compliant" ·
     EPSS is not a likelihood · unknown applicability is an evidence gap · self-assessments contradicted
     by independent results are resolved by a person · expired exceptions are not mitigations · the
     organisation base is the organisation's own · fictional cases are not calibration evidence ·
     licensed standards are cited by identifier only · the engine still reproduces the MediBec baseline.
   1.6.0 (CRGO 0.10.0 brief §4): no obligation called compliant from a mapping, acknowledgement or attestation ·
     no incident inferred from an alert · no response action presented as authorised without a valid approval
     (approval gaps are audit signals) · TLP:RED and TLP:AMBER+STRICT material kept out of reports · source
     confidence never used as a probability.
   1.8.0 (book v2.51): standard markers · valid inputs and a CVSS for every scenario · stored scores agree with
     their vectors · equivalency justified · no reference left on a superseded catalogue · screening flags reviewed ·
     transfers approved.
   1.9.2 (QC-31, ws3): likelihoods calibrated from the threat context rest on a current (≤ 90 days) snapshot.
   1.9.2 review (QC-32, H3): every likelihood calibrated from the threat context rests on exposure evidence (threat-intel rule 2).
   1.9.3 (QC-33, W2): scenarios validated against the ontology (attention only, never fail: findings never block anything).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, table, kpi, n0, go, today } from '../util.js';
import { S, compute } from '../state.js';
import * as D from '../dss.js';
import { conflictsOf, delegationOk } from './csm.js';
import { expiredReliance } from './isms.js';
import { tr } from '../i18n.js';
import * as SOAR from '../soar.js';
import * as MK from '../markers.js';
import * as EQ from '../equiv.js';
import * as SCR from '../screening.js';
import * as AVL from '../avl.js';
import * as LIB from '../kblib.js';
import * as PROC from '../process.js';

/** Every check: { id, title, state: 'pass'|'warn'|'fail', detail, fix (route) }. */
export function checks(ws = S.ws) {
  const out = [];
  const add = (id, title, state, detail, fix) => out.push({ id, title, state, detail, fix });
  const wb = ws.crgo?.writeBacks || [];
  add('QC-01', 'Write-backs are proposals with a model version and inputs', wb.every(w => w.status !== 'proposed' || w.stored) ? 'pass' : 'fail',
    wb.length ? tr('{0} proposed, {1} refused (each refusal shown as CRGO returned it).').replace('{0}', wb.filter(w => w.status === 'proposed').length).replace('{1}', wb.filter(w => w.status === 'refused').length) : tr('No write-back yet. Every write-back is built by this application with its version, its inputs and the SHA-256 of the input, and status "proposed".'), 'ontology/link');
  const badDec = (ws.csm?.decisions || []).filter(d => d.outcome !== 'draft' && delegationOk(ws, d));
  // 1.9.2 (decided item 22): the approver is rec.approved.by, written by recommend.js transition(); an empty name fails
  // A formal recommendation names its approver in approved.by, or in a history entry of the approval (to 'approved', with a by)
  const namedApprover = r => String(r.approved?.by || '').trim() || (r.history || []).some(h => h.to === 'approved' && String(h.by || '').trim());
  const recs = (ws.recommendations || []).filter(r => ['approved', 'in-implementation', 'completed'].includes(r.status) && !namedApprover(r));
  // 1.9.2 review (M3, X-5): the scenario decisions of Recommendations → By scenario (ws.decisions) need a named decision-maker, a transfer its approver
  const scenDec = Object.entries(ws.decisions || {}).filter(([, d]) => d?.option && !PROC.decisionNamed(d)).map(([id, d]) => `${id} (${tr(d.option === 'Transfer' && String(d.by || '').trim() ? 'transfer without a named approver' : 'decision without a named decision-maker')})`);
  add('QC-02', 'No result is called approved unless a person approved it', badDec.length || recs.length || scenDec.length ? 'fail' : 'pass',
    badDec.length || recs.length || scenDec.length ? [...badDec.map(d => d.id), ...recs.map(r => (r.code || r.id) + ' (' + tr('approved without a named approver') + ')'), ...scenDec].join(', ') : tr('Every decision recorded as made names its decision maker, every approved recommendation its approver; risk acceptances rest on a delegation valid on the decision date.'), recs.length && !badDec.length ? 'recs/' + recs[0].id : scenDec.length && !badDec.length ? 'recs/scenarios' : 'csm/decisions');   // the fix link opens the recommendation
  const satNoEv = (ws.grc?.determinations || []).filter(d => d.state === 'satisfied' && !(d.evidence || []).length);
  const reqCompliantNoEv = (ws.compliance?.requirements || []).filter(r => r.status === 'compliant' && !String(r.evidence || '').trim());
  add('QC-03', '"Supported by a control" is not called "compliant"', satNoEv.length ? 'fail' : reqCompliantNoEv.length ? 'warn' : 'pass',
    satNoEv.length || reqCompliantNoEv.length ? tr('Compliance stated without evidence: {0}').replace('{0}', [...satNoEv.map(d => d.provision), ...reqCompliantNoEv.map(r => r.id)].join(', ')) : tr('Every obligation stated as satisfied has evidence.'), 'compliance/determinations');
  const epss = [];
  for (const s of ws.assessment.SCEN) {
    const scores = (s.cves || []).map(c => S.snap?.epss?.scores?.[c]?.[0]).filter(x => x != null);
    for (const k of ['PbA', 'Pbx']) {
      const v = Number(s.params?.[k]?.v), rat = String(s.params?.[k]?.rat || '');
      if (scores.some(x => Math.abs(x - v) < 0.0005) || /EPSS[^.]{0,40}(=|equals|set to|used as)/i.test(rat)) epss.push(`${s.id} ${k}`);
    }
  }
  add('QC-04', 'EPSS is not used as a likelihood', epss.length ? 'fail' : 'pass',
    epss.length ? tr('A likelihood equals an EPSS score, or its rationale says it was set from EPSS: {0}').replace('{0}', epss.join(', ')) : tr('No likelihood is set to an EPSS score. EPSS and KEV are evidence of exploitation in the wild only.'), 'scenario');
  const A = ws.grc?.applicability;
  const unknown = A ? Object.entries(A.results).filter(([, v]) => v.state === 'Unknown').map(([k]) => k) : [];
  const potential = A ? Object.entries(A.results).filter(([, v]) => v.state === 'PotentiallyApplicable').map(([k]) => k) : [];
  add('QC-05', 'Unknown applicability is an evidence gap, potentially applicable needs qualified review', !A ? 'warn' : unknown.length || potential.length ? 'warn' : 'pass',
    !A ? tr('Legal applicability has not been assessed (Compliance → Legal applicability).') : tr('Unknown: {0}. Qualified review: {1}.').replace('{0}', unknown.join(', ') || '—').replace('{1}', potential.join(', ') || '—'), 'compliance/applicability');
  const conf = conflictsOf(ws);
  add('QC-06', 'Self-assessments contradicted by independent results are resolved by a person', conf.length ? 'fail' : 'pass',
    conf.length ? conf.map(c => c.target.kind === 'scenario-control' ? `${c.target.sid}: ${c.target.text}` : c.target.id).join(' · ') : tr('No conflict between lines of defence.'), 'csm/tests');
  const rel = expiredReliance(ws);
  add('QC-07', 'Expired exceptions are not counted as mitigations', rel.length ? 'fail' : 'pass',
    rel.length ? rel.map(r => `${r.id} (${r.expiry}) → ${r.scenarios.join(', ')}`).join(' · ') : tr('No scenario counts on an expired exception.'), 'isms/exceptions');
  const lawEx = (ws.shared?.exceptions || []).filter(x => x.status === 'accepted' && String(x.legalObligation || '').trim());
  add('QC-08', 'No exception waives a law', lawEx.length ? 'fail' : 'pass', lawEx.length ? lawEx.map(x => x.id).join(', ') : tr('No accepted exception names a legal obligation.'), 'isms/exceptions');
  const bad = D.validBase(ws.crgo?.base);
  add('QC-09', 'The organisation base is the organisation\'s own', bad ? 'fail' : 'pass', bad ? tr(bad) : String(ws.crgo?.base || ''), 'ontology/link');
  const fictional = ws.kind === 'example' || ws.kind === 'classroom';
  const priors = ws.assessment.SCEN.filter(s => Object.values(s.params || {}).some(p => /Prior from the CyberRiskGuardian Ontology/.test(p?.rat || '')));
  add('QC-10', 'Fictional cases and ontology priors are not calibration evidence', fictional ? 'warn' : priors.length ? 'warn' : 'pass',
    fictional ? tr('This workspace is a fictional teaching case: its values are not evidence for a real organization.') : priors.length ? tr('{0} scenario(s) still carry ontology priors labelled "Analytical estimate — validation required": replace them with organizational evidence.').replace('{0}', priors.length) : tr('No ontology prior left unvalidated.'), 'register');
  const stale = (ws.shared?.evidence || []).filter(e => e.validUntil && e.validUntil < today());
  add('QC-11', 'Evidence is current', stale.length ? 'warn' : 'pass', stale.length ? stale.map(e => e.id).join(', ') : tr('No evidence past its validity date.'), 'audit/assurance');
  let ok = false;
  try { const r = self.CRG.run(self.CRG_SAMPLE); ok = Math.round(r.totals.est) === 84305 && Math.round(r.totals.res) === 41023; } catch { ok = false; }
  add('QC-12', 'The engine reproduces the MediBec baseline (84,305 / 41,023)', ok ? 'pass' : 'fail', ok ? tr('Verified at start-up.') : tr('The engine self-check did not pass: no number should be used.'), 'about');
  // 1.9.0 — the check extends to the knowledge base library and to the consultant's saved answers
  const lib = LIB.list(), unattested = lib.filter(f => f.attestation?.text !== LIB.ATTESTATION), signal = lib.filter(f => f.licensedSignal);
  const longQuotes = (ws.consultant?.conversations || []).flatMap(c => c.messages.flatMap(m => (m.passages || []).filter(p => p.source === 'library' && String(p.quote || '').length > LIB.QUOTE_MAX + 2).map(() => c.title)));
  add('QC-13', 'Licensed standards are cited by identifier only', unattested.length || longQuotes.length ? 'fail' : signal.length ? 'warn' : 'pass',
    unattested.length ? tr('Library file(s) without the licence attestation: {0}. Remove them or add them again with the attestation.').replace('{0}', unattested.map(f => f.name).join(', '))
      : longQuotes.length ? tr('Saved consultant answers quote the library at length: {0}. Delete those conversations.').replace('{0}', [...new Set(longQuotes)].join(', '))
      : signal.length ? tr('{0} library file(s) look like licensed standards ({1}); each carries the attestation “I hold a licence for this text; it stays on this computer.” Their text is never in a backup, a package or an export, and answers quote them briefly. Reports still cite identifiers and headings only.').replace('{0}', signal.length).replace('{1}', signal.map(f => f.name).join(', '))
      : tr('IIA, ISACA, AICPA, COSO and ISO texts are not stored in the application; reports cite identifiers and headings. Check text you paste yourself.') + (lib.length ? ' ' + tr('Knowledge base library: {0} attested file(s), kept on this computer and quoted briefly.').replace('{0}', lib.length) : ''), lib.length ? 'settings/kb' : null);
  // 1.6.0 — CRGO 0.10.0 brief §4
  const c14 = compliantWithoutEvidence(ws);
  add('QC-14', 'No obligation is called compliant from a mapping, an acknowledgement or an attestation', c14.length ? 'fail' : 'pass',
    c14.length ? tr('"Satisfied" without current evidence from the shared evidence register: {0}').replace('{0}', c14.join(' · ')) : tr('Every determination "satisfied" rests on current evidence of the shared register; mappings, acknowledgements and attestations are never counted as compliance.'), 'compliance/determinations');
  const c15 = incidentsWithoutConfirmation(ws);
  add('QC-15', 'No incident is inferred from an alert', c15.length ? 'fail' : 'pass',
    c15.length ? tr('Counted as incidents without a confirmation by a person on a date: {0}').replace('{0}', c15.join(', ')) : tr('Every incident has a confirmation by a named person on a date; alerts and SOAR cases are not counted as incidents.'), 'soar/incidents');
  const c16 = approvalSignals(ws);
  add('QC-16', 'No response action is presented as authorised without a valid approval', c16.length ? 'warn' : 'pass',
    c16.length ? tr('Audit signals — containment or destructive actions without a valid approval: {0}').replace('{0}', c16.join(' · ')) : tr('Every gated action recorded relied on a valid human approval.'), 'soar/actions');
  const c17 = tlpLeaks(ws);
  add('QC-17', 'TLP:RED and TLP:AMBER+STRICT material stays out of reports and exports', c17.leaks.length ? 'fail' : 'pass',
    c17.leaks.length ? tr('Restricted material found in: {0}').replace('{0}', c17.leaks.join(' · ')) : tr('{0} restricted indicator(s) or alert(s); none appears in reports, recommendations, scenario rationales or communications. Exports leave them out unless explicitly marked.').replace('{0}', c17.restricted), 'siem/intel');
  const c18 = confidenceAsProbability(ws);
  add('QC-18', 'Source confidence is never used as a probability', c18.length ? 'fail' : 'pass',
    c18.length ? tr('A likelihood rationale relies on a source confidence (STIX 0–100, feed or indicator confidence): {0}').replace('{0}', c18.join(', ')) : tr('No likelihood is set from a source confidence; it is a statement of the producer, not a probability.'), 'scenario');
  // 1.8.0 — the book v2.51 alignment
  const old = MK.findOutdated(ws);
  add('QC-19', 'The three markers use the standard wording', old.length ? 'warn' : 'pass',
    old.length ? tr('Outdated marker wording in {0} place(s), e.g. {1}: use “{2}”.').replace('{0}', old.length).replace('{1}', old[0].path || '—').replace('{2}', old[0].use) : tr('Analytical estimate — validation required · Information gap — organizational validation required · Management decision required.'), 'register');
  const inc = ws.assessment.SCEN.filter(s => !(ws.excluded || []).includes(s.id));
  const invalid = inc.map(s => ({ s, e: CRG.validate(s, ws.assessment.APPETITE, ws.assessment.FACTOR) })).filter(x => x.e.length);
  add('QC-20', 'Every input is within its valid range, and every scenario has a CVSS score', invalid.length ? 'fail' : 'pass',
    invalid.length ? invalid.slice(0, 6).map(x => x.e.join('; ')).join(' · ') : tr('Probabilities, damages, criticality and reductions within 0–1; θ in (0, 1]; appetite strictly between 0 and 1; δm ≥ δe; CVSS present and within 0–10.'), 'calc');
  const mism = inc.filter(s => CRG.cvssCheck(s).agree === false);
  add('QC-21', 'A stored CVSS score agrees with its vector', mism.length ? 'warn' : 'pass',
    mism.length ? mism.map(s => { const c = CRG.cvssCheck(s); return `${s.id}: ${c.stored} ≠ ${c.computed}`; }).join(', ') : tr('Every stored score matches the score of its vector (or no score is stored).'), 'scenario');
  const eqg = inc.filter(s => EQ.isEquiv(s) && EQ.gaps(s).length);
  add('QC-22', 'Scores by equivalency are justified metric by metric and labelled limited applicability', eqg.length ? 'fail' : 'pass',
    eqg.length ? eqg.map(s => `${s.id} (${EQ.gaps(s).join(', ')})`).join(' · ') : tr('{0} scenario(s) scored by equivalency, each with its justifications, the label and the marker.').replace('{0}', inc.filter(EQ.isEquiv).length), 'cvss');
  const legacy = (ws.catalogueMigration || []).filter(d => d.review);
  add('QC-23', 'No control reference is left on a superseded catalogue', legacy.length ? 'warn' : 'pass',
    legacy.length ? tr('{0} reference(s) to ISO/IEC 27002:2013, NIST CSF 1.1 or CIS v7.1 could not be mapped and need review: {1}').replace('{0}', legacy.length).replace('{1}', [...new Set(legacy.map(d => d.from))].slice(0, 6).join(', ')) : tr('Only ISO/IEC 27002:2022, NIST CSF 2.0 and CIS Controls v8.1 are referenced.'), 'mitigation');
  const sa = SCR.analysis(ws);
  add('QC-24', 'Flagged candidates are not excluded without review; judgment-based selections say why', sa.flaggedUnreviewed.length || sa.judgmentMissing.length ? 'fail' : sa.list.length < 20 ? 'warn' : 'pass',
    sa.flaggedUnreviewed.length || sa.judgmentMissing.length ? tr('Exclusions without review: {0}. Judgments without rationale: {1}.').replace('{0}', sa.flaggedUnreviewed.map(c => c.id).join(', ') || '—').replace('{1}', sa.judgmentMissing.map(u => u.id).join(', ') || '—')
      : sa.list.length < 20 ? tr('{0} candidate(s): the method asks for at least 20 (about 25 to 40 for ten scenarios).').replace('{0}', sa.list.length) : tr('Every flagged candidate left out is reviewed or watched, and every judgment is explained.'), 'screening/watch');
  const tx = Object.entries(ws.decisions || {}).filter(([, d]) => d?.option === 'Transfer' && !String(d.approver || '').trim());
  add('QC-25', 'Every transfer names its approver and claims no reduction', tx.length ? 'warn' : 'pass',
    tx.length ? tr('Transfers without an approver: {0}').replace('{0}', tx.map(([k]) => k).join(', ')) : tr('A transfer records the share of loss covered for information and its approver; it never reduces the risk index.'), 'recs');
  // 1.9.0 — the vectors and the decision come from avl.js (one copy of the constants); after a decline the text says
  // that the Process page lets the person reconsider, which it does.
  const oldCase = AVL.detect(ws).length > 0;
  const declined = oldCase && AVL.decision(ws) === 'declined';
  add('QC-26', 'The teaching case carries the current MediBec vectors', oldCase ? 'warn' : 'pass',
    !oldCase ? tr('Not a teaching case on the earlier vectors.')
      : declined ? tr('S2 and S8 still use AV:N: the AV:L vectors were declined on {0}. The Process page lets you reconsider and take them (journalled), or Reset data → Start over takes the current case.').replace('{0}', AVL.lastEntry(ws)?.date || '—')
      : tr('S2 and S8 still use AV:N. The current case and the book use AV:L (the e-mailed document is opened locally): the Process page offers the AV:L vectors (journalled), or Reset data → Start over takes the current case.'), 'process');
  // 1.9.2 (NV-082) — the book's review questions the checks did not ask: placeholder rationales, chain completeness,
  // the budget gap escalated, the memo agreeing with the workbook.
  const ph = inc.map(s => ({ s, n: ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu'].filter(k => !PROC.paramEstimated(s.params?.[k])).length })).filter(x => x.n);
  const phAll = ph.filter(x => x.n === 6);
  add('QC-27', 'No included scenario rests on placeholder or unestimated parameters', phAll.length ? 'fail' : ph.length ? 'warn' : inc.length ? 'pass' : 'warn',
    phAll.length ? tr('{0} scenario(s) with none of the six parameters estimated (placeholder rationale, no evidence or no confidence): {1}').replace('{0}', phAll.length).replace('{1}', phAll.map(x => x.s.id).join(', '))
      : ph.length ? tr('{0} scenario(s) with parameters not yet estimated: {1}').replace('{0}', ph.length).replace('{1}', ph.map(x => `${x.s.id} (${x.n})`).join(', '))
      : inc.length ? tr('Every parameter of every included scenario has a rationale that is not the placeholder, its evidence and a confidence level.') : tr('No scenario is included yet.'), 'scenario');
  const chainBad = inc.filter(s => !PROC.chainOk(s));
  add('QC-28', 'Every included scenario is a complete causal chain', chainBad.length ? 'fail' : inc.length ? 'pass' : 'warn',
    chainBad.length ? tr('Statement, threat source, vulnerabilities or affected assets missing: {0}').replace('{0}', chainBad.map(s => s.id).join(', ')) : inc.length ? tr('Every included scenario names its statement, threat source, vulnerabilities and affected assets.') : tr('No scenario is included yet.'), 'scenario');
  const bg = budgetGap(ws);
  add('QC-29', 'A budget gap to the appetite-consistent target is escalated, not reconciled silently', bg.gap > 0 && !bg.escalated ? 'warn' : 'pass',
    !bg.it ? tr('No IT budget entered: the target cannot be computed (Process step 4).') : bg.gap > 0 ? (bg.escalated ? tr('Shortfall of {0} to the target is recorded as a decision requested in the management summary.').replace('{0}', n0(bg.gap)) : tr('Shortfall of {0} to the {1}% target with no decision requested in the management summary: write it as a decision — Management decision required.').replace('{0}', n0(bg.gap)).replace('{1}', (bg.target * 100).toFixed(1))) : tr('Spend is at or above the appetite-consistent target.'), bg.gap > 0 && !bg.escalated ? 'summary' : 'budget');
  const mm = memoMismatch(ws);
  add('QC-30', 'The management summary agrees with the workbook to the unit', mm === null || mm === 'unknown' ? 'warn' : mm.length ? 'fail' : 'pass',
    mm === null ? tr('The management summary has not been exported yet; export it after the last change.')
      : mm === 'unknown' ? tr('Exported on {0} without the figures of the day (an export of this release records them): export the summary again to compare.').replace('{0}', ws.mgmtSummary.date)
      : mm.length ? tr('Exported on {0}; since then: {1}. Export the summary again.').replace('{0}', ws.mgmtSummary.date).replace('{1}', mm.join(', ')) : tr('The figures exported with the summary on {0} are the engine’s figures today.').replace('{0}', ws.mgmtSummary.date), 'summary');
  // 1.9.2 (NV-099, ws3; numbered QC-31 at integration, QC-27..30 are NV-082) — the project rule: an assessment that calibrates Pb(ψ,A) from the threat context needs a current snapshot
  const fresh = snapshotFreshness(ws);
  add('QC-31', 'The threat-context snapshot behind the calibrated likelihoods is current', fresh.state,
    fresh.state === 'pass' ? (fresh.n ? tr('{0} threat_basis entry(ies) rest on the snapshot of {1}, valid until {2}.').replace('{0}', fresh.n).replace('{1}', fresh.retrieved || '—').replace('{2}', fresh.expires || '—') : tr('No likelihood is calibrated from the threat context; the 90-day rule applies once one is.'))
      : fresh.missing ? tr('{0} threat_basis entry(ies) calibrate Pb(ψ,A), but no snapshot is loaded in this workspace: load the one they cite, or a refreshed one, and re-run the exposure join.').replace('{0}', fresh.n)
      : tr('{0} threat_basis entry(ies) rest on a snapshot that expired on {1} ({2} days ago): refresh the snapshot and re-run the exposure join. Snapshots expire after 90 days.').replace('{0}', fresh.n).replace('{1}', fresh.expires || '—').replace('{2}', fresh.daysPast ?? '—'), 'threat');
  // 1.9.2 review (H3) — AGENTS.md: intelligence calibrates Pb(A) / Pb(ψ,A) only where organizational evidence confirms exposure;
  // an exposure-ungated calibration fails the quality review (threat-intel rule 2: watch list, not an estimate)
  const ug = ungatedThreatBasis(ws);
  add('QC-32', 'Every likelihood calibrated from the threat context rests on exposure evidence', ug.length ? 'fail' : 'pass',
    ug.length ? tr('{0} threat_basis entry(ies) have no exposure evidence (the CVE is not confirmed in the vulnerability register): {1}. Record the exposure in the register and re-run the join, or revert the parameter and keep the intelligence on the watch list — Information gap — organizational validation required.').replace('{0}', ug.length).replace('{1}', ug.map(x => `${x.scenario} · ${x.cve}`).join(', '))
      : fresh.n ? tr('Every threat_basis entry names the vulnerability-register evidence of the exposure.') : tr('No likelihood is calibrated from the threat context.'), 'threat');
  // 1.9.3 (W2, spec 4.2; QC-27 was taken) — validation against the ontology gives findings, never a block: attention at most
  const ov = ontologyValidation(inc);
  add('QC-33', 'Scenarios validated against the ontology', ov.never.length || ov.open.length ? 'warn' : 'pass',
    !inc.length ? tr('No scenario is included yet.')
      : [ov.never.length ? tr('Never validated against the ontology: {0}. Scenario editor → Ontology · CRGO → Validate against the ontology.').replace('{0}', ov.never.join(', ')) : '',
        ov.open.length ? tr('Open findings not dismissed: {0}. Edit the field, or dismiss the finding once it is seen.').replace('{0}', ov.open.map(x => `${x.id} (${x.n})`).join(', ')) : '']
        .filter(Boolean).join(' ') || tr('Every included scenario was validated against the ontology; no open finding is left.'), 'scenario');
  return out;
}

/** 1.9.3 — QC-33: included scenarios never validated against the ontology, and those with open findings. Reads
 *  scenario.ontologyFindings ([{code, detail, state, by, at, severity?}], created empty by the 1.9.3 migration) defensively:
 *  an empty or missing list = never validated (a validation always records at least its match finding); a finding is open
 *  unless dismissed or resolved, and counts when its code is not one of the information-only codes. */
const ONTO_INFO = new Set(['LIBRARY_MATCH', 'THEME_MATCH_ONLY', 'CWE_NO_REFERENCE']);
export function ontologyValidation(scens) {
  const never = [], open = [];
  for (const s of scens || []) {
    const F = Array.isArray(s.ontologyFindings) ? s.ontologyFindings : [];
    if (!F.length) { never.push(s.id); continue; }
    const n = F.filter(f => f && typeof f === 'object' && !['dismissed', 'resolved', 'fixed', 'done'].includes(String(f.state || 'open').toLowerCase())
      && (f.severity ? f.severity === 'attention' : !ONTO_INFO.has(f.code))).length;
    if (n) open.push({ id: s.id, n });
  }
  return { never, open };
}
PROC.registerQc(checks);   // 1.9.2 (NV-018) — the report step requires no failed check

/* ---------------- 1.9.2 checks (NV-082) ---------------- */
/** The shortfall of the cybersecurity spend to the appetite-consistent target, and whether the summary asks a decision about it. */
export function budgetGap(ws = S.ws) {
  const b = ws.budget || {}, it = Number(b.it_budget) || 0, spend = Number(b.spend) || 0;
  const app = Number(ws.assessment?.APPETITE), target = it && Number.isFinite(app) && self.CRG?.budgetTarget ? self.CRG.budgetTarget(app) : 0;
  const gap = it ? Math.round(target * it - spend) : 0;
  // escalated: the analyst wrote the decision, or the exported summary asked management to fund the gap (its automatic line)
  const escalated = (ws.mgmtSummary?.decisions || []).some(d => /budget|shortfall|gap|fund|financ|écart|manque/i.test(String(typeof d === 'string' ? d : d?.text || d?.what || JSON.stringify(d))))
    || (ws.mgmtSummary?.date && Number(ws.mgmtSummary?.figures?.gap) > 0);
  return { it, spend, target, gap, escalated };
}
/** What changed since the management summary was exported (the figures recorded with it): an array of differences, 'unknown' when the export recorded no figures, or null when never exported. */
export function memoMismatch(ws = S.ws) {
  const f = ws.mgmtSummary?.figures;
  if (!ws.mgmtSummary?.date) return null;
  if (!f) return 'unknown';
  const R = compute(ws), out = [];
  for (const [k, l] of [['est', 'estimated'], ['tol', 'tolerated'], ['res', 'residual']]) if (Math.round(R.totals[k]) !== Math.round(f[k])) out.push(`${tr(l)} ${n0(f[k])} → ${n0(R.totals[k])}`);
  if ((f.n ?? R.inc.length) !== R.inc.length) out.push(tr('{0} → {1} scenarios included').replace('{0}', f.n).replace('{1}', R.inc.length));
  return out;
}

/** Snapshot freshness against the threat_basis entries (NV-099): fail when entries exist and the snapshot is missing or expired. */
export function snapshotFreshness(ws = S.ws, today = new Date()) {
  const n = (ws.assessment?.SCEN || []).reduce((t, s) => t + (Array.isArray(s.threat_basis) ? s.threat_basis.length : 0), 0);
  const snap = ws.snapshot;
  const exp = typeof snap?.expires === 'string' && /^\d{4}-\d{2}-\d{2}/.test(snap.expires) ? new Date(snap.expires.slice(0, 10)) : null;
  const t = new Date(today.toISOString().slice(0, 10));
  const daysPast = exp ? Math.round((t - exp) / 86400000) : null;
  const expired = !exp || daysPast > 0;
  if (!n) return { state: 'pass', n: 0, retrieved: snap?.retrieved || null, expires: snap?.expires || null, missing: !snap, expired, daysPast };
  if (!snap) return { state: 'fail', n, missing: true, expired: true, retrieved: null, expires: null, daysPast: null };
  return { state: expired ? 'fail' : 'pass', n, missing: false, expired, retrieved: snap.retrieved || null, expires: snap.expires || null, daysPast: expired ? daysPast : 0 };
}

/** 1.9.2 review (H3) — threat_basis entries that calibrated a parameter without exposure evidence: exposure_confirmed false, or
 *  (older entries) an exposure text that is empty, the information-gap marker or a placeholder. */
export function ungatedThreatBasis(ws = S.ws) {
  const out = [];
  for (const s of ws.assessment?.SCEN || []) for (const b of Array.isArray(s.threat_basis) ? s.threat_basis : []) {
    if (!b || typeof b !== 'object') continue;
    const ex = String(b.exposure || '').trim();
    const gated = b.exposure_confirmed === true || (b.exposure_confirmed === undefined && ex && !/^(TODO|—|-|n\/a|none|information gap|lacune d)/i.test(ex));
    if (!gated) out.push({ scenario: s.id, cve: b.cve || '—' });
  }
  return out;
}

/* ---------------- 1.6.0 checks (CRGO 0.10.0 brief §4) ---------------- */
const lc = s => String(s || '').toLowerCase();
/** Determinations "satisfied" whose evidence is not current evidence of the shared register (mapping, acknowledgement, attestation or nothing). */
export function compliantWithoutEvidence(ws = S.ws) {
  const reg = ws.shared?.evidence || [];
  const out = [];
  for (const d of ws.grc?.determinations || []) {
    if (d.state !== 'satisfied') continue;
    const ids = (d.evidence || []).map(x => String(x).trim());
    const recs = ids.map(id => reg.find(e => e.id === id)).filter(Boolean);
    const at = d.date || today();
    const st = recs.map(e => e.sufficiency === 'insufficient' ? 'judged-insufficient' : e.validUntil && e.validUntil < at ? 'expired' : 'current');
    const soft = ids.filter(id => /^(MAP|ACK|ATT)-/i.test(id) || /mapping|acknowledg|attest/i.test(id));
    const why = !recs.length ? (soft.length ? 'mapping or acknowledgement only' : 'no evidence of the register') : !st.includes('current') ? st.join('/') : '';
    if (why) out.push(`${d.id}${d.obligation ? ' (' + d.obligation + ')' : d.provision ? ' (' + d.provision + ')' : ''}: ${why}`);
  }
  for (const r of ws.compliance?.requirements || []) if (r.status === 'compliant' && /mapping|mapped|acknowledg|attest/i.test(String(r.evidence || '')) && !/\bEV-\d+/.test(String(r.evidence || ''))) out.push(`${r.id}: ${tr('mapping or attestation only')}`);
  return out;
}
/** Incidents counted without a confirmation by a person on a date (an alert or a SOAR case is never an incident). */
export function incidentsWithoutConfirmation(ws = S.ws) {
  const inc = ws.csm?.incidents || [];
  const linked = new Set((ws.soar?.cases || []).map(c => c.incident).filter(Boolean));
  return inc.filter(i => (['confirmed', 'contained', 'closed'].includes(i.status) || linked.has(i.id)) && !(i.confirmed && String(i.confirmedBy || '').trim())).map(i => i.id)
    .concat((ws.soar?.cases || []).filter(c => c.incident && !inc.some(i => i.id === c.incident)).map(c => `${c.id} → ${c.incident}`));
}
/** Gated executions without a valid approval (the application's rule, and CRGO's last secops/v1 reading). */
export function approvalSignals(ws = S.ws) {
  const out = new Map();
  if (ws.soar) for (const u of SOAR.unapproved(ws)) out.set(u.x.id, `${u.x.id} (${tr(D.REASON_TEXT[u.reason] || u.reason)})`);
  const doc = ws.crgo?.views?.secops?.doc;
  for (const x of doc?.executionsWithoutValidApproval || []) { const id = String(x.id).split('/').pop(); if (!out.has(id)) out.set(id, `${id} (${tr(D.REASON_TEXT[x.reason] || x.reason)}, CRGO)`); }
  return [...out.values()];
}
/** Restricted (TLP:RED, TLP:AMBER+STRICT) indicator and alert material found in reports, recommendations, rationales or communications. */
export function tlpLeaks(ws = S.ws) {
  const R = new Set(['RED', 'AMBER+STRICT']);
  const norm = t => String(t || '').toUpperCase().replace(/^TLP\s*:\s*/, '').replace(/\s+/g, '');
  const items = [...(ws.siem?.indicators || []).filter(i => R.has(norm(i.tlp))).flatMap(i => [i.value, i.pattern, ...[...String(i.pattern || '').matchAll(/=\s*'((?:[^'\\]|\\.)*)'/g)].map(m => m[1])]), ...(ws.siem?.alerts || []).filter(a => R.has(norm(a.tlp))).map(a => a.title)]
    .map(x => String(x || '').trim()).filter(x => x.length >= 6);
  const restricted = (ws.siem?.indicators || []).filter(i => R.has(norm(i.tlp))).length + (ws.siem?.alerts || []).filter(a => R.has(norm(a.tlp))).length;
  const places = [['audit reports', ws.audit?.reports], ['recommendations', ws.recommendations], ['scenario rationales', (ws.assessment?.SCEN || []).map(s => s.params)],
    ['communications', ws.soar?.communications], ['regulatory submissions', ws.cms?.submissions], ['management reviews', ws.isms?.reviews]];
  const leaks = [];
  for (const [name, v] of places) { const t = lc(JSON.stringify(v || '')); if (items.some(x => t.includes(lc(x)))) leaks.push(tr(name)); }
  return { restricted, leaks };
}
/** Likelihoods whose rationale says they were taken from a source confidence (never a probability). */
export function confidenceAsProbability(ws = S.ws) {
  const RE = /(STIX|ISAC|feed|indicator|threat[- ]?intel\w*|CTI|source)\b[^.]{0,30}\bconfidence\b[^.]{0,30}\d|\bconfidence\b[^.]{0,20}(0\s*[–-]\s*100|STIX)/i;
  const confs = [...(ws.siem?.indicators || []), ...(ws.siem?.alerts || [])].map(x => Number(x.confidence)).filter(n => Number.isFinite(n) && n > 0);
  const out = [];
  for (const s of ws.assessment?.SCEN || []) for (const k of ['PbA', 'Pbx']) {
    const v = Number(s.params?.[k]?.v), rat = String(s.params?.[k]?.rat || '');
    if (RE.test(rat) || (/confidence/i.test(rat) && confs.some(c => Math.abs(c / 100 - v) < 0.0005))) out.push(`${s.id} ${k}`);
  }
  return out;
}

export function render(sec) {
  const ws = S.ws, c = checks(ws);
  sec.replaceChildren(el('h1', null, 'Quality review'),
    el('p', 'lede', 'The checks a reviewer runs before results leave the analyst: what is called approved, compliant or likely has to rest on a person, on evidence and on the right kind of data. Run it before every report and every write-back.'),
    el('div', 'grid g3', kpi('Passed', n0(c.filter(x => x.state === 'pass').length), '', 'good'), kpi('Attention', n0(c.filter(x => x.state === 'warn').length), '', c.some(x => x.state === 'warn') ? 'warn' : ''),
      kpi('Failed', n0(c.filter(x => x.state === 'fail').length), '', c.some(x => x.state === 'fail') ? 'bad' : 'good')),
    card(table([{ key: 'id', label: 'Check', cls: 'mono' }, { key: 'title', label: 'What is checked' },
      { key: 'state', label: 'Result', render: r => pill(tr(r.state === 'pass' ? 'pass' : r.state === 'warn' ? 'attention' : 'fail'), r.state === 'pass' ? 'good' : r.state === 'warn' ? 'warn' : 'bad') },
      { key: 'detail', label: 'Detail', render: r => el('span', { class: 'small', 'data-noi18n': '' }, r.detail) },
      { key: 'fix', label: '', sortable: false, render: r => r.fix ? el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => go(r.fix) }, 'Open') : '' }], c, { class: 'compact' })),
    el('p', 'note', 'These checks support a reviewer; they do not replace one. A pass means the rule was not visibly broken in the data recorded here.'));
}
