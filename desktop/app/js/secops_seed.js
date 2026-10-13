/* secops_seed.js — scenario seeds from security-operations data (Beta 1.6.x).

   A seed is a pointer from what SIEM and SOAR recorded to a risk scenario the analyst may write, or to
   an existing scenario the records bear on. It carries a suggested causal chain, the evidence (kind, id,
   date, TLP) and the parameters it may INFORM — never a value: the analyst decides every number.

   Rules carried here (CRGO 0.10 §4, contract secops/v1):
     • An alert or an indicator match is never an incident. Only incidents confirmed in the incident
       register (ws.csm.incidents: a confirmation date and a named person) count as incidents.
     • Source confidence (STIX 0–100) is not a probability: it is shown as stated and never sent to AI.
     • TLP:RED and TLP:AMBER+STRICT items are never sent to AI; screens mask them unless the analyst
       opts in on this computer.
     • Benign and false-positive alerts are skipped (and counted). Alerts cluster by technique and asset.
     • A seed whose techniques and crown jewel (or asset) match an existing scenario, or that is linked
       to one explicitly, is evidence for that scenario rather than a new one.
     • Nothing here changes a scenario, a parameter or the engine.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, PARAMS, PARAM_LABEL } from './state.js';
import { today } from './util.js';
import * as SIEM from './siem.js';
import * as SOAR from './soar.js';
import { techName } from './ontology.js';

export const MARK = 'Analytical estimate — validation required.';
export const KINDS = [
  ['detection-gap', 'Detection gap'], ['untested-coverage', 'Untested coverage'], ['degraded-telemetry', 'Degraded telemetry'],
  ['alert-cluster', 'Alert cluster'], ['confirmed-incident', 'Confirmed incident'], ['case', 'SOAR case (not an incident)'],
  ['approval-gap', 'Approval gap'], ['unsimulated-playbook', 'Playbook not simulated'], ['lesson', 'Lesson learned'],
];
export const kindLabel = k => (KINDS.find(x => x[0] === k) || [k, k])[1];
/** What each kind may inform — never a value. */
const INFORMS = {
  'detection-gap': [['Pbx', 'a technique no rule detects can succeed unseen'], ['Th', 'detection is part of the ability to contain']],
  'untested-coverage': [['Pbx', 'detection that was never shown to work is not validated coverage']],
  'degraded-telemetry': [['Th', 'rules that need this telemetry cannot detect reliably'], ['Pbx', 'reduced visibility over the techniques those rules cover']],
  'alert-cluster': [['PbA', 'activity matching these techniques was observed here (alerts, not incidents)']],
  'confirmed-incident': [['PbA', 'the threat was present: a confirmed incident'], ['Pbx', 'the weakness was exploited at least once'], ['De', 'the recorded impact of the incident']],
  case: [['PbA', 'an investigation is open; it is not a confirmed incident']],
  'approval-gap': [['Pbx', 'a response control did not operate as designed'], ['Th', 'response actions without a valid approval']],
  'unsimulated-playbook': [['Th', 'the response playbook has not been shown to work in a simulation']],
  lesson: [['Th', 'a lesson recorded after a case or an incident']],
};
export const informsOf = k => (INFORMS[k] || []).map(([param, why]) => ({ param, label: PARAM_LABEL[param], why }));

const lc = s => String(s ?? '').trim().toLowerCase();
const day = d => String(d || '').slice(0, 10);
const uniq = a => [...new Set(a.filter(Boolean))];
const parent = t => String(t).split('.')[0];
const list = v => Array.isArray(v) ? v.map(String).map(x => x.trim()).filter(Boolean) : String(v ?? '').split(/[;,\n]/).map(x => x.trim()).filter(Boolean);
export const restricted = tlp => !!tlp && SIEM.TLP_RESTRICTED.has(SIEM.normTlp(tlp) || 'AMBER');
const TLP_ORDER = ['CLEAR', 'GREEN', 'AMBER', 'AMBER+STRICT', 'RED'];
const worst = tlps => tlps.filter(Boolean).map(t => SIEM.normTlp(t) || 'AMBER').sort((a, b) => TLP_ORDER.indexOf(b) - TLP_ORDER.indexOf(a))[0] || '';
const techLabel = ts => ts.length ? ts.slice(0, 3).map(t => `${t} ${techName(t) === t ? '' : techName(t)}`.trim()).join(', ') + (ts.length > 3 ? '…' : '') : 'techniques not recorded';

/* ---------------- assets, crown jewels and scenarios ---------------- */
/** The crown-jewel name an asset reference designates, or ''. */
export function crownOf(ref, ws = S.ws) {
  if (!ref || !SIEM.isCrownJewel(ref, ws)) return '';
  const a = SIEM.assetOf(ref, ws), names = [lc(ref), lc(a?.name), lc(a?.id)].filter(Boolean);
  const row = (ws.assessment?.CROWN || []).find(r => { const id = lc(r[0]), n = lc(r[1]); return names.some(x => x === id || (n && x.length > 2 && (n === x || n.includes(x) || x.includes(n)))); });
  return row ? String(row[1] || row[0]) : (a?.name || String(ref));
}
const assetName = (ref, ws) => SIEM.assetOf(ref, ws)?.name || String(ref || '').trim();
const scenTechs = s => SIEM.techniques(s.attack || []);
/** Does a scenario carry this asset (by name in its assets text, its asset links, or the crown jewel)? */
function scenHasAsset(s, ref, ws) {
  const a = SIEM.assetOf(ref, ws), text = lc(s.assets);
  const names = uniq([lc(ref), lc(a?.name), lc(crownOf(ref, ws))]).filter(n => n.length > 2);
  return names.some(n => text.includes(n)) || (!!a && (s.assetIds || []).includes(a.id));
}
/** Same techniques (by parent technique) and same crown jewel or asset → the existing scenario. */
function sameAs(s, techs, assets, ws) {
  if (!techs.length || !assets.length) return false;
  const st = new Set(scenTechs(s).map(parent));
  return techs.every(t => st.has(parent(t))) && assets.some(r => scenHasAsset(s, r, ws));
}

/* ---------------- building a seed ---------------- */
function make(ws, o) {
  const SC = ws.assessment?.SCEN || [];
  const techs = uniq(o.techniques || []);
  const assets = uniq((o.assets || []).map(String));
  const crown = uniq(assets.map(a => crownOf(a, ws)));
  const linked = uniq(o.linked || []).filter(id => SC.some(s => s.id === id));
  const overlap = techs.length ? SC.filter(s => scenTechs(s).some(t => techs.some(x => parent(x) === parent(t)))).map(s => s.id) : [];
  const match = linked[0] || SC.find(s => sameAs(s, techs, assets, ws))?.id || '';
  const tlp = worst(o.evidence.map(e => e.tlp));
  const assetText = assets.length ? assets.map(a => assetName(a, ws)).join(', ') : 'the assets or processes concerned (to identify)';
  const chain = [o.threat, o.weakness, assetText + (crown.length ? ` (crown jewel: ${crown.join(', ')})` : ''), o.event,
    o.consequence || 'a consequence for the organization to assess (information gap — organizational validation required)'].join(' → ');
  return {
    id: `SEED-${o.kind}-${o.key}`, kind: o.kind, title: o.title, threatSource: o.threat, initiatingEvent: o.event, weakness: o.weakness,
    techniques: techs, assets: assets.map(a => assetName(a, ws)), crownJewels: crown, scenarios: uniq([...linked, ...overlap]), linked,
    evidence: o.evidence, chain, tlp, restricted: o.evidence.some(e => restricted(e.tlp)),
    whatItSuggests: match ? { type: 'existing', scenario: match, text: `Evidence for existing scenario ${match}` } : { type: 'new', scenario: '', text: 'A new candidate scenario' },
    informs: informsOf(o.kind), notes: o.notes || [], mark: MARK,
  };
}

/**
 * Every seed the security-operations records suggest at a date.
 *   excludeRestricted: true leaves TLP:RED and TLP:AMBER+STRICT alerts and indicators out entirely
 *   (what the AI summary uses); false keeps them, flagged restricted, for a screen that masks them.
 * Returns { seeds, counts }.
 */
export function seeds(ws = S.ws, { asOf = today(), excludeRestricted = false } = {}) {
  const R = SIEM.reg(ws), O = SOAR.reg(ws), out = [];
  const counts = { benign: 0, falsePositive: 0, alerts: 0, restrictedLeftOut: 0, unconfirmedIncidents: 0, closedCases: 0 };
  const keep = x => { if (excludeRestricted && restricted(x.tlp || 'AMBER')) { counts.restrictedLeftOut++; return false; } return true; };
  const indicators = R.indicators.filter(keep);
  const indById = new Map(indicators.map(i => [i.id, i]));
  const alertsAll = R.alerts.filter(a => !a.detected || day(a.detected) <= asOf);
  const alerts = alertsAll.filter(keep);
  const alertById = new Map(alerts.map(a => [a.id, a]));
  const ruleOf = a => R.rules.find(r => r.id === a.ruleId);
  const alertTechs = a => a.techniques?.length ? a.techniques : (ruleOf(a)?.techniques || []);
  const alertEv = a => ({ kind: 'alert', id: a.id, date: day(a.detected), tlp: SIEM.normTlp(a.tlp) || 'AMBER' });
  const indEv = (ids) => ids.map(id => indById.get(id)).filter(Boolean).map(i => ({ kind: 'indicator', id: i.id, date: day(i.validFrom || i.imported), tlp: SIEM.normTlp(i.tlp) || 'AMBER', confidence: i.confidence ?? null }));
  const caseTechs = c => uniq((c.alerts || []).map(id => alertById.get(id)).filter(Boolean).flatMap(alertTechs).concat(SIEM.techniques(c.techniques || [])));
  const caseAssets = c => uniq([...list(c.assets), ...(c.alerts || []).map(id => alertById.get(id)?.asset), c.target]);
  const caseAlertsEv = c => (c.alerts || []).map(id => alertById.get(id)).filter(Boolean).map(alertEv);

  // 1 — detection gaps (recorded) and coverage the matrix shows as missing, untested or weak
  const done = new Set();
  for (const g of R.gaps.filter(g => g.status !== 'closed')) {
    const techs = SIEM.techniques(g.technique || ''); done.add(`${g.scenario || ''}|${techs[0] || ''}`);
    out.push(make(ws, { kind: 'detection-gap', key: g.id, title: `Detection gap: ${techLabel(techs)}${g.scenario ? ` (${g.scenario})` : ''}`,
      techniques: techs, assets: [], linked: [g.scenario],
      threat: `An adversary using ${techLabel(techs)}`, weakness: `no validated detection for it${g.source ? ` (telemetry: ${g.source})` : ''}${g.title ? ` — ${g.title}` : ''}`,
      event: 'the activity proceeds without an alert', evidence: [{ kind: 'gap', id: g.id, date: day(g.raised), tlp: '' }],
      notes: [g.status === 'accepted' ? 'Gap accepted by management — still a gap.' : 'Open detection gap.'] }));
  }
  if (R.rules.length || R.coverage.length) {
    for (const row of SIEM.coverageMatrix(ws, asOf)) {
      const k = `${row.scenario}|${row.technique}`;
      if (row.status === 'validated' || done.has(k) || !row.technique) continue;
      const telemetry = row.rules.some(x => (x.why || []).some(w => /telemetry/.test(w)));
      if (row.status === 'degraded' && telemetry) continue;              // seeded per source below
      const techs = [row.technique], ruleIds = row.rules.map(x => x.rule.id);
      const ev = row.rules.map(x => ({ kind: 'rule', id: x.rule.id, date: day(x.test?.date || x.rule.updated || x.rule.created), tlp: '' }));
      if (row.status === 'missing') {
        out.push(make(ws, { kind: 'detection-gap', key: `${row.scenario || 'none'}-${row.technique}`, title: `No active detection: ${techLabel(techs)}${row.scenario ? ` (${row.scenario})` : ''}`,
          techniques: techs, linked: [row.scenario], threat: `An adversary using ${techLabel(techs)}`,
          weakness: ruleIds.length ? `the rules for it are not active (${row.rules.map(x => (x.why || [])[0]).filter(Boolean).join('; ')})` : 'no detection rule covers it',
          event: 'the activity proceeds without an alert', evidence: ev.length ? ev : [{ kind: 'coverage', id: k, date: asOf, tlp: '' }], notes: ['Coverage missing at ' + asOf + '.'] }));
      } else {
        out.push(make(ws, { kind: 'untested-coverage', key: `${row.scenario || 'none'}-${row.technique}`, title: `Detection not validated: ${techLabel(techs)}${row.scenario ? ` (${row.scenario})` : ''}`,
          techniques: techs, linked: [row.scenario], threat: `An adversary using ${techLabel(techs)}`,
          weakness: `detection by ${ruleIds.join(', ')} not validated by an effective test (${uniq(row.rules.flatMap(x => x.why || [])).join('; ')})`,
          event: 'the activity may proceed without a reliable alert', evidence: ev, notes: [`Coverage ${row.status} at ${asOf}.`] }));
      }
    }
  }

  // 2 — degraded or silent telemetry the active rules depend on
  for (const src of R.sources) {
    const h = SIEM.healthAt(src, asOf);
    if (!['silent', 'degraded'].includes(h.state)) continue;
    const rules = R.rules.filter(r => (r.requiredSources || []).includes(src.id) && ['production', 'testing'].includes(SIEM.statusAt(r, asOf)));
    if (!rules.length && !crownOf(src.asset, ws)) continue;
    const techs = uniq(rules.flatMap(r => r.techniques || []));
    out.push(make(ws, { kind: 'degraded-telemetry', key: src.id, title: `Telemetry ${h.state}: ${src.name || src.id}${rules.length ? ` — ${rules.length} rule(s) affected` : ''}`,
      techniques: techs, assets: src.asset ? [src.asset] : [], linked: rules.flatMap(r => r.scenarios || []),
      threat: techs.length ? `An adversary using ${techLabel(techs)}` : 'An adversary active on the monitored systems',
      weakness: `telemetry source ${src.name || src.id} ${h.state}${h.stale ? ' (no event within three expected cadences)' : ''}: ${rules.length ? 'rules ' + rules.map(r => r.id).join(', ') + ' cannot detect reliably' : 'no rule uses it'}`,
      event: 'the activity is not seen in time', evidence: [{ kind: 'source', id: src.id, date: day(h.observed || src.lastSeen), tlp: '' }, ...rules.map(r => ({ kind: 'rule', id: r.id, date: day(r.updated || r.created), tlp: '' }))],
      notes: [`Health ${h.state} at ${asOf}.`] }));
  }

  // 3 — alert clusters (technique × asset), benign and false positives skipped but counted
  const clusters = new Map();
  for (const a of alertsAll) {
    if (a.triage === 'benign') { counts.benign++; continue; }
    if (a.triage === 'false-positive') { counts.falsePositive++; continue; }
    if (!alertById.has(a.id)) continue;
    counts.alerts++;
    const techs = uniq(alertTechs(a)).sort();
    const key = `${techs.join('+') || 'none'}@${lc(assetName(a.asset, ws)) || 'unknown'}`;
    if (!clusters.has(key)) clusters.set(key, { techs, asset: a.asset, alerts: [] });
    clusters.get(key).alerts.push(a);
  }
  for (const [key, c] of clusters) {
    const sev = c.alerts.map(a => a.severity).sort((x, y) => ['low', 'medium', 'high', 'critical'].indexOf(y) - ['low', 'medium', 'high', 'critical'].indexOf(x))[0];
    const dates = c.alerts.map(a => day(a.detected)).filter(Boolean).sort();
    const escalated = c.alerts.filter(a => a.triage === 'escalated').length;
    out.push(make(ws, { kind: 'alert-cluster', key: key.replace(/[^\w.+@-]+/g, '_'), title: `${c.alerts.length} alert(s): ${techLabel(c.techs)} on ${assetName(c.asset, ws) || 'an unidentified asset'}`,
      techniques: c.techs, assets: c.asset ? [c.asset] : [], linked: uniq(c.alerts.flatMap(a => [...(a.scenarios || []), ...(ruleOf(a)?.scenarios || [])])),
      threat: `An unattributed actor whose activity matches ${techLabel(c.techs)}`, weakness: 'a weakness to establish — the alerts show activity, not how it could succeed',
      event: `detections fired ${dates.length ? `between ${dates[0]} and ${dates[dates.length - 1]}` : ''}`.trim(),
      evidence: [...c.alerts.map(alertEv), ...indEv(uniq(c.alerts.flatMap(a => a.indicators || [])))],
      notes: [`Highest severity ${sev || '—'}; ${escalated} escalated to a case.`, 'An alert is not an incident and not an attribution.'] }));
  }

  // 4 — confirmed incidents (only those with a confirmation date and a named person)
  const confirmed = inc => !!(inc.confirmed && String(inc.confirmedBy || '').trim());
  const incs = ws.csm?.incidents || [];
  for (const inc of incs) {
    if (!confirmed(inc)) { counts.unconfirmedIncidents++; continue; }
    const c = O.cases.find(x => x.id === inc.case || x.incident === inc.id);
    const techs = uniq([...SIEM.techniques(inc.techniques || inc.attack || []), ...(c ? caseTechs(c) : [])]);
    out.push(make(ws, { kind: 'confirmed-incident', key: inc.id, title: `Confirmed incident ${inc.id}: ${inc.title || inc.type || ''}`.trim(),
      techniques: techs, assets: uniq([...list(inc.assets), ...(c ? caseAssets(c) : [])]), linked: inc.scenarios || [],
      threat: `The actor behind incident ${inc.id}${inc.category || inc.type ? ` (${inc.category || inc.type})` : ''}`,
      weakness: inc.cause ? String(inc.cause) : 'the weakness exploited (to document from the post-incident review)',
      event: `incident confirmed on ${inc.confirmed} by ${inc.confirmedBy}`, consequence: inc.impact ? String(inc.impact) : '',
      evidence: [{ kind: 'incident', id: inc.id, date: day(inc.confirmed), tlp: '' }, ...(c ? [{ kind: 'case', id: c.id, date: day(c.opened), tlp: '' }, ...caseAlertsEv(c)] : [])],
      notes: [`Status ${inc.status || 'confirmed'}.`] }));
  }

  // 5 — SOAR cases not (yet) confirmed as incidents
  for (const c of O.cases) {
    const inc = c.incident ? incs.find(x => x.id === c.incident) : null;
    if (inc && confirmed(inc)) continue;
    if (c.status === 'closed') { counts.closedCases++; continue; }
    const techs = caseTechs(c);
    out.push(make(ws, { kind: 'case', key: c.id, title: `Case ${c.id} under investigation: ${c.title || ''}`.trim(),
      techniques: techs, assets: caseAssets(c), linked: c.scenarios || [],
      threat: `An actor under investigation in case ${c.id}${c.category ? ` (${c.category})` : ''}`, weakness: 'the weakness is under investigation',
      event: `case opened ${day(c.opened)}, status ${c.status || 'open'}`, evidence: [{ kind: 'case', id: c.id, date: day(c.opened), tlp: '' }, ...caseAlertsEv(c)],
      notes: ['A case is not an incident until someone confirms it.'] }));
  }

  // 6 — response actions without a valid approval (audit signal)
  for (const { x, reason } of SOAR.unapproved(ws)) {
    const c = O.cases.find(k => k.id === x.case);
    out.push(make(ws, { kind: 'approval-gap', key: x.id, title: `Action without a valid approval: ${x.action || x.id} (${SOAR.REASON_LABEL[reason] || reason})`,
      techniques: c ? caseTechs(c) : [], assets: uniq([x.target, ...(c ? caseAssets(c) : [])]), linked: c?.scenarios || [],
      threat: c ? `The actor in case ${c.id}` : 'An actor whose activity triggered a response',
      weakness: `a ${x.riskClass || ''} response action carried out without a valid approval (${SOAR.REASON_LABEL[reason] || reason})`.replace('a  ', 'a '),
      event: `action ${x.action || ''} on ${x.target || 'a target'} at ${String(x.started || '').replace('T', ' ')}`, consequence: 'an unauthorised or uncontrolled response affecting operations',
      evidence: [{ kind: 'execution', id: x.id, date: day(x.started), tlp: '' }, ...(c ? [{ kind: 'case', id: c.id, date: day(c.opened), tlp: '' }] : [])],
      notes: ['An audit signal: nothing authorises a response action except a recorded human approval.'] }));
  }

  // 7 — playbooks without a passed simulation of their current version
  for (const pb of O.playbooks) {
    if (SOAR.simulationPassed(ws, pb)) continue;
    const sims = O.simulations.filter(s => s.playbook === pb.id).sort((a, b) => (day(a.date) < day(b.date) ? 1 : -1));
    const why = pb.current == null ? 'no published version' : sims.some(s => s.version === pb.current) ? 'the latest simulation of its current version failed' : 'its current version was never simulated';
    out.push(make(ws, { kind: 'unsimulated-playbook', key: pb.id, title: `Playbook not validated: ${pb.name || pb.id}`,
      techniques: [], assets: [], linked: pb.scenarios || [],
      threat: 'The threat the playbook responds to', weakness: `response playbook ${pb.name || pb.id}: ${why}`,
      event: 'the response may not run as written when it is needed', consequence: 'slower or failed containment and recovery',
      evidence: [{ kind: 'playbook', id: pb.id, date: day(currentVersionDate(pb)), tlp: '' }, ...sims.slice(0, 2).map(s => ({ kind: 'simulation', id: s.id, date: day(s.date), tlp: '' }))],
      notes: [why[0].toUpperCase() + why.slice(1) + '.'] }));
  }

  // 8 — lessons learned
  for (const l of O.lessons) {
    const c = O.cases.find(k => k.id === l.case);
    out.push(make(ws, { kind: 'lesson', key: l.id, title: `Lesson ${l.id}: ${String(l.lesson || '').slice(0, 90)}`,
      techniques: c ? caseTechs(c) : [], assets: c ? caseAssets(c) : [], linked: l.scenarios || [],
      threat: l.incident ? `The actor in incident ${l.incident}` : c ? `The actor in case ${c.id}` : 'The threat behind the case',
      weakness: String(l.lesson || 'the weakness the lesson names'), event: `lesson recorded ${day(l.date)}`,
      evidence: [{ kind: 'lesson', id: l.id, date: day(l.date), tlp: '' }, ...(l.incident ? [{ kind: 'incident', id: l.incident, date: '', tlp: '' }] : []), ...(l.case ? [{ kind: 'case', id: l.case, date: '', tlp: '' }] : [])],
      notes: [] }));
  }
  return { seeds: out, counts, asOf };
}
const currentVersionDate = pb => SOAR.currentVersion(pb)?.published || (pb.versions || []).slice(-1)[0]?.created || '';

/** A seed as a screen may show it: restricted seeds masked unless the analyst opted in on this computer. */
export function display(seed, reveal = false) {
  if (!seed.restricted || reveal) return seed;
  const m = `Masked — ${'TLP:' + seed.tlp} evidence. Show restricted items on this computer to read it.`;
  return { ...seed, masked: true, title: `${kindLabel(seed.kind)} — masked (TLP:${seed.tlp})`, threatSource: '', initiatingEvent: '', weakness: '', chain: m, techniques: [], assets: [], crownJewels: [],
    evidence: seed.evidence.map(e => restricted(e.tlp) ? { ...e, id: '•••', masked: true, confidence: null } : e) };
}

/** A batch-grid draft from a seed. Parameters are neutral placeholders the analyst must set — the seed proposes none. */
export function toDraft(seed, PARAMS_ = PARAMS) {
  const hint = seed.informs.map(i => `${i.label}: ${i.why}`).join('; ');
  return {
    pick: true, secops: true, seed: seed.id, seedKind: seed.kind, name: seed.title, statement: seed.chain,
    threat_source: seed.threatSource, threat_event: seed.initiatingEvent, assets: seed.assets.join(', '), vulns: seed.weakness,
    attack: seed.techniques.slice(), cwe: [], cves: [],
    params: Object.fromEntries(PARAMS_.map(k => [k, 0.5])),
    rat: Object.fromEntries(PARAMS_.map(k => {
      const inf = seed.informs.find(i => i.param === k);
      return [k, `Placeholder — not derived from security-operations data; set it from the evidence.${inf ? ' The seed may inform it: ' + inf.why + '.' : ''} ${MARK}`];
    })),
    conf: Object.fromEntries(PARAMS_.map(k => [k, 'Low'])),
    cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N', cvss_score: null,
    cvss_note: 'Default vector — security-operations evidence does not set CVSS; score the weakness in the CVSS calculator.',
    red_p: 0.5, red_i: 0.5, owner: '', pattern: 'secops', tlp: seed.tlp,
    secopsEv: seed.evidence.map(e => ({ kind: e.kind, id: e.id, date: e.date || '', tlp: e.tlp || '' })),
    background: `From security operations (${kindLabel(seed.kind)}). ${seed.whatItSuggests.text}. May inform — ${hint || 'none'}. ${seed.notes.join(' ')} ${MARK}`.replace(/\s+/g, ' ').trim(),
  };
}

/** Record a seed's evidence links on an existing scenario (s.secops). Never touches a parameter. Returns the number added. */
export function attachEvidence(s, seed) {
  s.secops ||= [];
  let n = 0;
  for (const e of seed.evidence) {
    if (s.secops.some(x => x.kind === e.kind && x.id === e.id)) continue;
    s.secops.push({ kind: e.kind, id: e.id, date: e.date || '', tlp: e.tlp || '', seed: seed.id, added: today() }); n++;
  }
  return n;
}

/**
 * The compact, TLP-filtered summary added to an AI scenario request. Built from seeds computed with
 * excludeRestricted, so nothing marked TLP:RED or TLP:AMBER+STRICT can be in it; source confidence is
 * left out (it is not a probability).
 */
export function aiSummary(ws = S.ws, { asOf = today(), max = 25 } = {}) {
  const { seeds: list, counts } = seeds(ws, { asOf, excludeRestricted: true });
  if (!list.length) return '';
  const rank = { 'confirmed-incident': 0, 'detection-gap': 1, 'alert-cluster': 2, 'degraded-telemetry': 3, 'untested-coverage': 4, 'approval-gap': 5, case: 6, 'unsimulated-playbook': 7, lesson: 8 };
  const top = list.slice().sort((a, b) => rank[a.kind] - rank[b.kind]).slice(0, max);
  const lines = [
    `Security-operations evidence (SIEM and SOAR records of this organization), as of ${asOf}.`,
    'How to read it: an alert or an indicator match is not an incident and not an attribution; only the items of kind confirmed-incident are incidents; a detection gap or untested coverage is evidence about detection, not a likelihood; nothing below is a probability. ' +
      `Items marked TLP:RED or TLP:AMBER+STRICT are not included${counts.restrictedLeftOut ? ` (${counts.restrictedLeftOut} left out)` : ''}; ${counts.benign + counts.falsePositive} benign or false-positive alert(s) were skipped.`,
    'Seeds:',
  ];
  for (const s of top) {
    lines.push(`- ${s.id} [${s.kind}] ${s.title}. Techniques: ${s.techniques.join(', ') || 'none recorded'}. Assets: ${s.assets.join(', ') || 'not recorded'}${s.crownJewels.length ? ` (crown jewel: ${s.crownJewels.join(', ')})` : ''}. ` +
      `${s.whatItSuggests.type === 'existing' ? 'Evidence for existing scenario ' + s.whatItSuggests.scenario : 'Suggests a new scenario'}. Chain: ${s.chain.slice(0, 400)}. ` +
      `Evidence: ${s.evidence.slice(0, 6).map(e => `${e.kind} ${e.id}${e.date ? ' ' + e.date : ''}${e.tlp ? ' TLP:' + e.tlp : ''}`).join('; ')}${s.evidence.length > 6 ? `; +${s.evidence.length - 6} more` : ''}.`);
  }
  if (list.length > top.length) lines.push(`(${list.length - top.length} more seed(s) not listed.)`);
  return lines.join('\n');
}

/* ---------------- evidence for one open scenario (Scenario editor) ---------------- */
/** What SIEM and SOAR hold that bears on one scenario. Read only. */
export function scenarioEvidence(ws, s, { asOf = today() } = {}) {
  const R = SIEM.reg(ws), O = SOAR.reg(ws);
  const techs = scenTechs(s), tp = new Set(techs.map(parent));
  const hitT = ts => (ts || []).some(t => tp.has(parent(t)));
  const coverage = SIEM.coverageMatrix(ws, asOf).filter(r => r.scenario === s.id);
  const gaps = R.gaps.filter(g => g.status !== 'closed' && (g.scenario === s.id || (!g.scenario && g.technique && tp.has(parent(g.technique)))));
  const ruleOf = a => R.rules.find(r => r.id === a.ruleId);
  const alerts = R.alerts.filter(a => !['benign', 'false-positive'].includes(a.triage) && (!a.detected || day(a.detected) <= asOf)
    && ((a.scenarios || []).includes(s.id) || (ruleOf(a)?.scenarios || []).includes(s.id) || hitT(a.techniques?.length ? a.techniques : ruleOf(a)?.techniques)))
    .sort((a, b) => (String(a.detected) < String(b.detected) ? 1 : -1));
  const alertIds = new Set(alerts.map(a => a.id));
  const cases = O.cases.filter(c => (c.scenarios || []).includes(s.id) || (c.alerts || []).some(id => alertIds.has(id)));
  const incidents = (ws.csm?.incidents || []).filter(i => (i.scenarios || []).includes(s.id) || cases.some(c => c.incident === i.id) || hitT(SIEM.techniques(i.techniques || i.attack || [])))
    .map(i => ({ inc: i, confirmed: !!(i.confirmed && String(i.confirmedBy || '').trim()) }));
  const playbooks = O.playbooks.filter(p => (p.scenarios || []).includes(s.id)).map(p => {
    const sims = O.simulations.filter(x => x.playbook === p.id).sort((a, b) => (day(a.date) < day(b.date) ? 1 : -1));
    return { pb: p, passed: SOAR.simulationPassed(ws, p), last: sims[0] || null };
  });
  return { techs, coverage, gaps, alerts, cases, incidents, playbooks, attached: s.secops || [], asOf };
}
