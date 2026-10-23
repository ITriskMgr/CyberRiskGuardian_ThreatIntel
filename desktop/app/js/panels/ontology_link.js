/* Ontology · CRGO → Organisation link (1.5.8): the dss/v1 contract.

   1. The organisation base: an address the organisation controls, or a private one. Never the ontology's.
   2. The organisation graph: the included scenarios through CRGO's own bridge (crg2rdf.py), with this
      application's records in CRGO terms (control tests, findings, determinations, profile and its legal
      applicability), written by the helper in a folder kept with the client's confidential files.
   3. Context: crgo_risk_context for a scenario at a date — obligations and their applicability, control
      status by assessor line, open findings, estimates with their evidence quality. No risk score.
   4. Write-back: crgo_submit_assessment, one document per quantity, computed by this application's engine,
      always "proposed". A refusal is shown as CRGO returned it and nothing is retried.
   5. (1.6.0) The read contracts of CRGO v0.10.0 at an as-of date: compliance/v1 (obligations, latest
      determination and evidence status, policy versions, exceptions without exemption, deadlines, findings)
      and secops/v1 (coverage validated by test or not, rules and telemetry, untriaged alerts, approval gates,
      executions without a valid approval, open regulatory triage). Shown as returned, with CRGO's caveats;
      a mapping is never compliance, an alert never an incident, nothing authorises a response action.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, kpi, n0, n2, today, toast, field, select } from '../util.js';
import { S, touch, compute, included } from '../state.js';
import * as D from '../dss.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';
import { HS, loadConfig, saveConfig } from '../helper.js';

export async function link(body, redraw) {
  const ws = S.ws, L = ws.crgo;
  const g = L.graph;
  body.append(el('p', 'note', 'Reads the context of this organisation\'s scenarios from the ontology and records this application\'s results in it as proposals (dss/v1), and reads its compliance and security-operations contexts (compliance/v1, secops/v1). The ontology computes no risk: every number comes from this application\'s verified engine. A write-back is never an approval, a risk acceptance or a funding decision.'));
  body.append(el('div', 'grid g4',
    kpi('Organisation base', L.base ? (D.validBase(L.base) ? 'invalid' : 'set') : 'not set', L.base || '', D.validBase(L.base) ? 'bad' : 'good'),
    kpi('Organisation graph', g ? tr('built {0}').replace('{0}', String(g.built).slice(0, 10)) : 'not built', g ? tr('{0} + {1} triples').replace('{0}', n0(g.triples)).replace('{1}', n0(g.factTriples)) : '', g ? (g.agrees ? 'good' : 'bad') : 'warn'),
    kpi('CRGO', g?.release?.tag ? 'v' + g.release.tag : '—', g?.release?.ontology ? tr('ontology release {0}').replace('{0}', g.release.ontology) : ''),
    kpi('Write-backs', n0(L.writeBacks.filter(w => w.status === 'proposed').length), tr('{0} refused').replace('{0}', n0(L.writeBacks.filter(w => w.status === 'refused').length)), L.writeBacks.some(w => w.status === 'refused') ? 'warn' : '')));
  // 1. base
  const b = el('input', { value: L.base || '', 'data-noi18n': '', placeholder: 'https://organisation.example/crg/' });
  const lb = el('input', { value: L.label || ws.org.name || '', 'data-noi18n': '' });
  const msg = el('div');
  body.append(card(el('h2', { style: { marginTop: 0 } }, '1. Organisation base'),
    el('p', 'small muted', 'Every identifier of this organisation\'s records starts with this base, so that two organisations are never mixed. The default, under the reserved .invalid domain, is private and resolves nowhere. Never use https://w3id.org/crgo/.'),
    el('div', 'grid g2', field(tr('Base'), b), field(tr('Organisation name in the graph'), lb)), msg,
    el('div', 'btnrow', el('button', { class: 'btn ghost', onclick: () => {
      const bad = D.validBase(b.value);
      if (bad) { msg.replaceChildren(banner('bad', 'Refused', tr(bad))); return; }
      L.base = b.value.trim(); L.label = lb.value.trim(); L.graph = null; touch(); toast(tr('Saved')); redraw();
    } }, 'Save'))));
  // 2. graph
  const included_ = ws.assessment.SCEN.filter(s => included(s.id, ws)).length;
  const gout = el('div');
  await loadConfig().catch(() => {});
  const dir = el('input', { value: (HS.config?.links || {}).org_graph_dir || '', 'data-noi18n': '', placeholder: '~/CyberRiskGuardian-confidential/crgo' });
  body.append(card(el('h2', { style: { marginTop: 0 } }, '2. Organisation graph'),
    el('p', 'small muted', tr('{0} included scenarios, {1} control tests, {2} findings, {3} compliance determinations and the applicability profile are converted. The files are written by the helper in the workspace\'s confidential folder (Settings → Links & shared folders), never in the application or a repository.')
      .replace('{0}', included_).replace('{1}', ws.grc.controlTests.length).replace('{2}', ws.audit.findings.length).replace('{3}', ws.grc.determinations.length)),
    g ? el('div', 'small', el('b', null, 'SHA-256 of the input: '), el('span', 'mono', g.sha256), ' · ', tr('totals {0} / {1}').replace('{0}', n0(g.totals.est)).replace('{1}', n0(g.totals.res)),
      ' ', g.agrees ? pill('same totals as this application', 'good') : pill('totals differ from this application', 'bad')) : null,
    g?.unknownProvisions?.length ? banner('warn', 'Provisions not found in the ontology', g.unknownProvisions.join(', ')) : null,
    gout,
    field(tr('Confidential folder for organisation graphs (on this computer, outside any repository)'), dir),
    el('div', 'btnrow', el('button', { class: 'btn ghost', disabled: !HS.helper, onclick: async () => {
      HS.config.links = { ...(HS.config.links || {}), org_graph_dir: dir.value.trim() };
      try { await saveConfig(); toast(tr('Saved')); } catch (err) { toast(String(err.message || err), 'bad'); }
    } }, 'Save the folder'), el('button', { class: 'btn', onclick: async e => {
      e.target.disabled = true; gout.replaceChildren(el('p', 'note', 'Building the organisation graph… (the first call builds CRGO\'s store, about 10 to 20 seconds)'));
      const r = await D.buildGraph(ws);
      e.target.disabled = false;
      if (r.error) { gout.replaceChildren(errorBox(r)); return; }
      touch(); toast(tr('Organisation graph built')); redraw();
    } }, g ? 'Rebuild the organisation graph' : 'Build the organisation graph'))));
  // 3. context
  const sids = ws.assessment.SCEN.filter(s => included(s.id, ws)).map(s => [s.id, `${s.id} ${s.name}`]);
  const sid = select(sids, sids[0]?.[0]);
  const asOf = el('input', { type: 'date', value: today() });
  const cout = el('div');
  body.append(card(el('h2', { style: { marginTop: 0 } }, '3. Context of a scenario (crgo_risk_context)'),
    el('div', 'row', { style: { alignItems: 'end', gap: '8px' } }, field(tr('Scenario'), sid), field(tr('As of'), asOf),
      el('button', { class: 'btn', disabled: !g, onclick: async () => {
        cout.replaceChildren(el('p', 'note', 'Asking the ontology…'));
        const d = await D.context(sid.value, asOf.value, ws);
        if (d.error) { cout.replaceChildren(errorBox(d)); return; }
        touch(); cout.replaceChildren(contextView(d));
      } }, 'Read the context')), cout));
  // 4. write-back
  const res = compute(ws).inc;
  const picks = new Set(), kinds = new Set(['residual-risk']);
  const actor = el('input', { value: users.name() || '', 'data-noi18n': '' });
  const wout = el('div');
  body.append(card(el('h2', { style: { marginTop: 0 } }, '4. Write results back as proposals (crgo_submit_assessment)'),
    banner('warn', 'Proposed, never approved', 'Each result is stored in the organisation\'s proposed graph with status "proposed" and knowledge status "risk estimate", with this application\'s version, the inputs it used and the SHA-256 of the exact assessment sent. Approval, risk acceptance and funding remain management decisions, recorded in Cybersecurity management → Decisions.'),
    el('div', 'chips', ...Object.keys(D.KINDS).map(k => { const c = el('input', { type: 'checkbox', checked: kinds.has(k), style: { width: 'auto' } }); c.addEventListener('change', () => c.checked ? kinds.add(k) : kinds.delete(k)); return el('label', { class: 'chip' }, c, ' ', tr(k)); })),
    table([{ key: 'p', label: '', sortable: false, render: r => { const c = el('input', { type: 'checkbox', style: { width: 'auto' } }); c.addEventListener('change', () => c.checked ? picks.add(r.id) : picks.delete(r.id)); return c; } },
      { key: 'id', label: 'Scenario', cls: 'mono' }, { key: 'est', label: 'Estimated', num: true, render: r => n0(r.est) }, { key: 'res', label: 'Residual', num: true, render: r => n0(r.res) }, { key: 'ratio', label: 'Ratio', num: true, render: r => n2(r.ratio) }], res, { class: 'compact' }),
    field(tr('Actor (analyst or service account)'), actor), wout,
    el('div', 'btnrow', el('button', { class: 'btn', disabled: !g, onclick: async e => {
      if (!picks.size || !kinds.size) { toast(tr('Tick at least one scenario and one quantity'), 'bad'); return; }
      e.target.disabled = true;
      const rows = [];
      const once = new Set();
      for (const sidv of picks) for (const k of kinds) {
        if (k === 'budget-target') { if (once.has(k)) continue; once.add(k); }
        const doc = D.document(ws, sidv, k, { actor: actor.value });
        const r = await D.submit(ws, doc);
        rows.push(r);
        if (r.status === 'refused') break;                 // a refusal stops the batch: nothing is retried or altered
      }
      e.target.disabled = false; touch();
      wout.replaceChildren(...rows.filter(r => r.status === 'refused').map(errorBox));
      toast(tr('{0} proposed, {1} refused').replace('{0}', rows.filter(r => r.status === 'proposed').length).replace('{1}', rows.filter(r => r.status === 'refused').length), rows.some(r => r.status === 'refused') ? 'bad' : 'good');
      redraw();
    } }, 'Send the ticked results as proposals'))));
  // 5. compliance/v1 and secops/v1 (CRGO v0.10.0)
  viewsCard(body, ws, g);
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Write-back journal'),
    L.writeBacks.length ? table([{ key: 'at', label: 'When', render: r => String(r.at).slice(0, 16).replace('T', ' ') }, { key: 'sid', label: 'Subject', cls: 'mono' }, { key: 'kind', label: 'Quantity' },
      { key: 'value', label: 'Value', num: true, render: r => r.unit === 'ratio' ? n2(r.value) : n0(r.value) },
      { key: 'status', label: 'Status', render: r => r.status === 'proposed' ? pill('proposed', 'warn') : pill(tr('refused — {0}').replace('{0}', r.code), 'bad') },
      { key: 'x', label: 'Stored as / why refused', render: r => el('span', { class: 'small mono', 'data-noi18n': '' }, r.stored || r.message || '') }], L.writeBacks, { class: 'compact' }) : el('div', 'empty-state', 'Nothing written back yet.')));
}

export function errorBox(r) {
  return banner('bad', tr('Refused by the ontology: {0}').replace('{0}', r.code || 'error'),
    el('div', null, el('div', { 'data-noi18n': '' }, r.message || ''), D.ERRORS[r.code] ? el('div', 'small', tr(D.ERRORS[r.code])) : null,
      r.details ? el('pre', { class: 'small', 'data-noi18n': '' }, JSON.stringify(r.details, null, 1)) : null,
      el('div', 'small muted', 'Nothing was changed or retried. Correct the cause, then send again.')));
}

/** A risk-context document, read for the analyst. */
export function contextView(d) {
  const line = k => tr(D.LINES.find(x => x[0] === k)?.[1] || k);
  const res = k => tr(D.RESULTS.find(x => x[0] === k)?.[1] || k);
  const ob = d.candidateObligations || [];
  return el('div', null,
    el('p', 'small', el('b', { 'data-noi18n': '' }, d.scenario?.label || ''), ' · ', pill('analytical hypothesis', 'warn'), ' · ', tr('as of {0}').replace('{0}', d.asOf), ' · CRGO ', d.ontologyRelease),
    card(el('h3', { style: { marginTop: 0 } }, 'Candidate obligations'),
      ob.length ? table([{ key: 'n', label: 'Provision', render: o => el('span', { 'data-noi18n': '' }, o.notation || o.id) },
        { key: 'a', label: 'Applicability', render: o => o.applicability === 'unknown' || o.applicability === 'not-assessed' ? pill(tr(D.GAP), 'bad') : o.applicability === 'potentially-applicable' ? pill(tr(D.QUALIFIED), 'warn') : pill(tr(o.applicability), '') },
        { key: 'u', label: 'Unresolved conditions', render: o => el('span', 'small mono', (o.unresolvedConditions || []).map(x => x.split('/').pop()).join(', ')) },
        { key: 'c', label: 'Compliance', render: o => o.complianceState ? pill(tr(o.complianceState), o.complianceState === 'satisfied' ? 'good' : 'warn') : el('span', 'small muted', 'no determination — supported by controls is not compliance') },
        { key: 'g', label: 'Evidence gap', render: o => el('span', { class: 'small', 'data-noi18n': '' }, o.evidenceGap || '') }], ob, { class: 'compact' })
        : el('p', 'small', tr(D.GAP) + ' ' + tr('No obligation is linked to this scenario: link it to Loi 25 provisions in the scenario editor, or run the legal applicability.'))),
    card(el('h3', { style: { marginTop: 0 } }, 'Controls and their evidence'),
      table([{ key: 'l', label: 'Control', render: c => el('span', { 'data-noi18n': '' }, c.label) }, { key: 's', label: 'Status', render: c => c.controlStatus || '—' },
        { key: 'a', label: 'Latest result per line', render: c => el('div', null, ...(c.latestAssessments || []).map(a => el('div', 'small', line(a.line), ': ', res(a.result), a.aspect ? ` (${tr(a.aspect)})` : '', ' · ', a.assessedOn))) },
        { key: 'f', label: 'Open findings', render: c => (c.openFindings || []).length ? pill(String(c.openFindings.length), 'bad') : '0' },
        { key: 'k', label: 'Conflict', render: c => D.conflictOf(c.latestAssessments || [], c.openFindings || []).conflict ? pill('self-assessment contradicted — resolve', 'bad') : '' }], d.controlLinks || [], { class: 'compact' })),
    card(el('h3', { style: { marginTop: 0 } }, 'Estimates and their evidence'),
      table([{ key: 'k', label: 'Estimate', render: e => e.kind }, { key: 'v', label: 'Value', num: true, render: e => String(e.value) }, { key: 'c', label: 'Confidence', render: e => e.confidence || '—' },
        { key: 'q', label: 'Evidence quality', render: e => e.evidenceQuality ? (['low', 'very-low'].includes(e.evidenceQuality) ? pill(tr(e.evidenceQuality) + ' — ' + tr('Analytical estimate — validation required'), 'warn') : tr(e.evidenceQuality)) : '—' },
        { key: 'a', label: 'Assumptions', render: e => el('span', { class: 'small', 'data-noi18n': '' }, (e.assumptions || []).map(a => a.label).join('; ')) }], d.estimates || [], { class: 'compact' })),
    el('ul', 'small muted', ...(d.caveats || []).map(c => el('li', { 'data-noi18n': '' }, c))));
}

/* ---------------- 5. compliance/v1 and secops/v1 (1.6.0) ---------------- */
const short = (iri, ws) => { const b = D.base(ws); const s = String(iri || ''); return s.startsWith(b) ? s.slice(b.length) : s.replace(/^https:\/\/w3id\.org\/crgo\/vocab\/[^/]+\//, '').replace(/_/g, ' '); };
const data = (t, cls = '') => el('span', { class: cls, 'data-noi18n': '' }, t);
const EVK = { current: 'good', expired: 'bad', 'judged-insufficient': 'bad', none: 'warn' };
function viewsCard(body, ws, g) {
  const V = (ws.crgo.views ||= {});
  const rel = g?.release;
  const asOf = el('input', { type: 'date', id: 'crgo-views-asof', value: V.compliance?.asOf || V.secops?.asOf || today() });
  const cout = el('div'), sout = el('div');
  const show = () => {
    cout.replaceChildren(V.compliance ? complianceView(V.compliance.doc, ws) : el('p', 'small muted', 'Not read yet.'));
    sout.replaceChildren(V.secops ? secopsView(V.secops.doc, ws) : el('p', 'small muted', 'Not read yet.'));
  };
  show();
  body.append(card(el('h2', { style: { marginTop: 0 } }, '5. Compliance and security-operations contexts (compliance/v1 · secops/v1)'),
    rel ? (rel.viewsUsable ? banner('good', tr('CRGO v{0}: compliance/v1 and secops/v1 are available').replace('{0}', rel.tag || '?'), 'Read only. Records dated after the as-of date are ignored; another organisation\'s records are withheld.')
      : banner('warn', tr('CRGO v{0}: the compliance and security-operations contexts need CRGO v0.10.0').replace('{0}', rel.tag || '?'), rel.viewsProblem || '')) : null,
    el('p', 'small muted', 'The organisation graph carries this application\'s policies, obligations, determinations, evidence, mappings, exceptions, deadlines, findings, telemetry, rules, tests, coverage, alerts, cases, incidents, playbooks, approvals and executions. Rebuild it (section 2) after changing them. A mapping, an acknowledgement or an attestation is never compliance; an alert is never an incident; nothing here authorises a response action.'),
    el('div', 'row', { style: { alignItems: 'end', gap: '8px' } }, field(tr('As of'), asOf),
      el('button', { class: 'btn', disabled: !g, onclick: async e => {
        e.target.disabled = true; cout.replaceChildren(el('p', 'note', 'Asking the ontology…')); sout.replaceChildren();
        const c = await D.complianceContext(ws, asOf.value);
        const s = await D.secopsContext(ws, asOf.value);
        e.target.disabled = false; touch();
        cout.replaceChildren(c.error ? errorBox(c) : complianceView(c, ws));
        sout.replaceChildren(s.error ? errorBox(s) : secopsView(s, ws));
      } }, 'Read both contexts')),
    el('h3', null, 'Compliance context (crgo_compliance_context)'), cout,
    el('h3', null, 'Security-operations context (crgo_secops_context)'), sout));
}

/** A compliance/v1 document, read for the analyst: states are CRGO's latest recorded determinations, never inferred. */
export function complianceView(d, ws = S.ws) {
  const ob = d.obligations || [];
  return el('div', null,
    el('p', 'small', tr('as of {0}').replace('{0}', d.asOf), ' · CRGO ', d.ontologyRelease, ' · ', d.contract),
    ob.length ? table([{ key: 'id', label: 'Obligation', render: o => el('div', null, data(o.label || short(o.id, ws)), el('div', { class: 'small muted mono', 'data-noi18n': '' }, short(o.id, ws))) },
      { key: 'applicability', label: 'Applicability', render: o => o.applicability === 'potentially-applicable' ? pill(tr(D.QUALIFIED), 'warn') : ['unknown', 'not-assessed'].includes(o.applicability) ? pill(tr(o.applicability), 'warn') : pill(tr(o.applicability), '') },
      { key: 'complianceState', label: 'Compliance state (determination)', render: o => el('div', null, pill(tr(o.complianceState), o.complianceState === 'satisfied' ? (o.evidenceStatus === 'current' ? 'good' : 'bad') : 'warn'), o.determinedOn ? data(' ' + o.determinedOn, 'small') : '') },
      { key: 'evidenceStatus', label: 'Evidence status', render: o => pill(o.evidenceStatus, EVK[o.evidenceStatus] || '') },
      { key: 's', label: 'Supporting statements (mappings — not compliance)', sortable: false, render: o => el('div', null, ...(o.supportingStatements || []).map(x => el('div', 'small', data(short(x.id, ws) + ' '), pill(x.mappingType, ''), ' ', pill(x.reviewState, x.reviewState === 'approved' ? '' : 'warn')))) },
      { key: 'f', label: 'Open findings', render: o => (o.openFindings || []).length ? data((o.openFindings || []).map(x => short(x, ws)).join(', ')) : '0' }], ob, { class: 'compact' }) : el('p', 'small muted', 'No obligation in the graph.'),
    (d.exceptions || []).length ? card(el('h4', { style: { marginTop: 0 } }, 'Exceptions'),
      table([{ key: 'id', label: 'Exception', render: x => data(short(x.id, ws)) }, { key: 'active', label: 'Active', render: x => x.active ? pill('active', 'warn') : pill('inactive', '') },
        { key: 'u', label: 'Valid until', render: x => data(x.validUntil || '—') },
        { key: 'p', label: 'Legal provisions without a regulatory exemption', render: x => (x.provisionsWithoutExemption || []).length ? pill(x.provisionsWithoutExemption.map(p => short(p, ws)).join(', '), 'bad') : '—' }], d.exceptions, { class: 'compact' }),
      el('p', 'small muted', 'An internal exception never waives a law: a provision without a regulatory exemption is a compliance exposure.')) : null,
    (d.deadlines || []).length ? card(el('h4', { style: { marginTop: 0 } }, 'Deadlines'),
      table([{ key: 'id', label: 'Deadline', render: x => data(short(x.id, ws)) }, { key: 'trigger', label: 'Kind', render: x => tr(x.trigger) }, { key: 'due', label: 'Due', render: x => data(x.due ? x.due.replace('T', ' ') : '—', 'mono') },
        { key: 'answered', label: 'Answered', render: x => x.answered ? pill('answered', 'good') : pill('not answered', 'warn') }], d.deadlines, { class: 'compact' })) : null,
    (d.findings || []).length ? card(el('h4', { style: { marginTop: 0 } }, 'Findings and nonconformities'),
      table([{ key: 'id', label: 'Finding', render: x => data(short(x.id, ws)) }, { key: 'kind', label: 'Kind', render: x => tr(x.kind) }, { key: 'open', label: 'Open', render: x => x.open ? pill('open', 'warn') : pill('closed', 'good') },
        { key: 'r', label: 'Root causes', render: x => (x.rootCauses || []).join(', ') || '—' },
        { key: 'o', label: 'Overdue actions', render: x => (x.overdueActions || []).length ? pill(x.overdueActions.map(a => short(a, ws)).join(', '), 'bad') : '—' }], d.findings, { class: 'compact' })) : null,
    (d.directiveVersions || []).length ? card(el('h4', { style: { marginTop: 0 } }, 'Policy, standard and playbook versions'),
      table([{ key: 'id', label: 'Version', render: x => data(short(x.id, ws)) }, { key: 'state', label: 'State', render: x => tr(x.state) }, { key: 'e', label: 'Effective', render: x => data(x.effectiveOn || '—') },
        { key: 'r', label: 'Review due', render: x => x.reviewOverdue ? pill(tr('overdue — {0}').replace('{0}', x.reviewDueOn), 'bad') : data(x.reviewDueOn || '—') }], d.directiveVersions, { class: 'compact' })) : null,
    el('ul', 'small muted', ...(d.caveats || []).map(c => el('li', { 'data-noi18n': '' }, c))));
}

/** A secops/v1 document: coverage is validated only by an effective detection test; approval gaps are audit signals. */
export function secopsView(d, ws = S.ws) {
  const sc = (d.scenarios || []).filter(s => (s.coverage || []).length || (s.playbooks || []).length || (s.detectionGaps || []).length);
  return el('div', null,
    el('p', 'small', tr('as of {0}').replace('{0}', d.asOf), ' · CRGO ', d.ontologyRelease, ' · ', d.contract),
    sc.length ? table([{ key: 'id', label: 'Scenario', render: s => data(s.label || short(s.id, ws)) },
      { key: 'c', label: 'Coverage', sortable: false, render: s => (s.coverage || []).length ? el('div', null, ...s.coverage.map(c => el('div', 'small', data((c.techniques || []).join(', ') + ' '), pill(tr(c.status), c.status === 'validated' ? 'good' : 'warn'), ' ', c.validatedByTest ? pill('validated by a test', 'good') : pill('not validated by a test', 'warn')))) : pill('no coverage recorded', 'bad') },
      { key: 'g', label: 'Detection gaps', render: s => (s.detectionGaps || []).length ? pill(s.detectionGaps.map(x => short(x, ws)).join(', '), 'bad') : '—' },
      { key: 'p', label: 'Playbooks', sortable: false, render: s => (s.playbooks || []).length ? el('div', null, ...s.playbooks.map(p => el('div', 'small', data(short(p.id, ws) + ' '), p.simulationPassed ? pill('simulation passed', 'good') : pill('not simulated', 'warn')))) : '—' }], sc, { class: 'compact' })
      : el('p', 'small muted', 'No coverage, detection gap or playbook recorded for the scenarios.'),
    (d.detectionRules || []).length ? card(el('h4', { style: { marginTop: 0 } }, 'Detection rules and required telemetry'),
      table([{ key: 'id', label: 'Rule', render: x => data(x.label || short(x.id, ws)) }, { key: 'status', label: 'Status', render: x => tr(x.status) }, { key: 'version', label: 'Version', render: x => data(x.version || '—') },
        { key: 't', label: 'Required telemetry', sortable: false, render: x => el('div', null, ...(x.requiredSources || []).map(t => el('div', 'small', data(short(t.id, ws) + ' '), pill(tr(t.health), t.health === 'healthy' ? 'good' : t.health === 'silent' ? 'bad' : 'warn')))) }], d.detectionRules, { class: 'compact' }),
      el('p', 'small muted', 'A rule whose required telemetry is silent does not detect.')) : null,
    (d.untriagedAlerts || []).length ? card(el('h4', { style: { marginTop: 0 } }, 'Untriaged alerts (not incidents)'),
      table([{ key: 'id', label: 'Alert', render: x => data(short(x.id, ws)) }, { key: 'a', label: 'Assets', render: x => data((x.assets || []).map(a => short(a, ws)).join(', ') || '—') },
        { key: 'crownJewel', label: 'Crown jewel', render: x => x.crownJewel ? pill('crown jewel', 'bad') : '' }], d.untriagedAlerts, { class: 'compact' })) : null,
    card(el('h4', { style: { marginTop: 0 } }, 'Executions without a valid approval (audit signals)'),
      (d.executionsWithoutValidApproval || []).length ? table([{ key: 'id', label: 'Execution', render: x => data(short(x.id, ws)) }, { key: 'action', label: 'Action', render: x => data(short(x.action, ws)) },
        { key: 'reason', label: 'Reason', render: x => pill(tr(D.REASON_TEXT[x.reason] || x.reason), 'bad') }], d.executionsWithoutValidApproval, { class: 'compact' }) : el('p', 'small muted', 'None recorded.'),
      el('p', 'small muted', 'An audit signal, not a verdict: CRGO never says an action was authorised. Approvals are human decisions recorded in SOAR.')),
    (d.openRegulatoryTriage || []).length ? card(el('h4', { style: { marginTop: 0 } }, 'Open regulatory triage'),
      table([{ key: 'incident', label: 'Incident', render: x => data(short(x.incident, ws)) }, { key: 'reason', label: 'Why open', render: x => tr(x.reason) }], d.openRegulatoryTriage, { class: 'compact' })) : null,
    el('ul', 'small muted', ...(d.caveats || []).map(c => el('li', { 'data-noi18n': '' }, c))));
}
