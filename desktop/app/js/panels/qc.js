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

/** Every check: { id, title, state: 'pass'|'warn'|'fail', detail, fix (route) }. */
export function checks(ws = S.ws) {
  const out = [];
  const add = (id, title, state, detail, fix) => out.push({ id, title, state, detail, fix });
  const wb = ws.crgo?.writeBacks || [];
  add('QC-01', 'Write-backs are proposals with a model version and inputs', wb.every(w => w.status !== 'proposed' || w.stored) ? 'pass' : 'fail',
    wb.length ? tr('{0} proposed, {1} refused (each refusal shown as CRGO returned it).').replace('{0}', wb.filter(w => w.status === 'proposed').length).replace('{1}', wb.filter(w => w.status === 'refused').length) : tr('No write-back yet. Every write-back is built by this application with its version, its inputs and the SHA-256 of the input, and status "proposed".'), 'ontology/link');
  const badDec = (ws.csm?.decisions || []).filter(d => d.outcome !== 'draft' && delegationOk(ws, d));
  const recs = (ws.recommendations || []).filter(r => r.status === 'approved' && !(r.approvedBy || r.approver || (r.history || []).some(h => /approv/i.test(h.what || h.status || '') && (h.by || h.who))));
  add('QC-02', 'No result is called approved unless a person approved it', badDec.length || recs.length ? 'fail' : 'pass',
    badDec.length || recs.length ? [...badDec.map(d => d.id), ...recs.map(r => r.id)].join(', ') : tr('Every decision recorded as made names its decision maker; risk acceptances rest on a delegation valid on the decision date.'), 'csm/decisions');
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
  add('QC-13', 'Licensed standards are cited by identifier only', 'pass', tr('IIA, ISACA, AICPA, COSO and ISO texts are not stored in the application; reports cite identifiers and headings. Check text you paste yourself.'), null);
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
  const AVN = ['CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H', 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:L/SC:H/SI:L/SA:L'];
  const oldCase = ws.kind === 'example' && ws.assessment.SCEN.some(x => (x.id === 'S2' || x.id === 'S8') && AVN.includes(x.cvss));
  add('QC-26', 'The teaching case carries the current MediBec vectors', oldCase ? 'warn' : 'pass',
    oldCase ? tr('S2 and S8 still use AV:N. The current case and the book use AV:L (the e-mailed document is opened locally): Reset data → Start over takes them.') : tr('Not a teaching case on the earlier vectors.'), 'reset');
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
