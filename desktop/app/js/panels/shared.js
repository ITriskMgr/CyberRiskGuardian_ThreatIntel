/* Shared registers — evidence, corrective actions, exceptions and qualified mappings, kept once and
   referenced from every management module ({kind, id} links).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, banner, pill, today, kpi, n0 } from '../util.js';
import { S, touch } from '../state.js';
import * as G from '../grcui.js';
import * as SH from '../shared.js';
import { tr } from '../i18n.js';

export const HELP = {
  '': { d: 'Evidence, corrective actions, exceptions and mappings kept once and used by every management module.', g: 'shared',
    h: ['A record here can be linked to policies, obligations, controls, findings, incidents, cases or rules. Each module shows the records linked to what you are looking at.'] },
  evidence: { d: 'Evidence metadata: what it shows, for which period, how long it stays valid, who keeps it and whether it was judged sufficient.', g: 'shared',
    h: ['Expired evidence, or evidence judged insufficient, is an evidence gap — never support for a compliance state. The file itself stays where it is kept; only its description and hash are recorded.'] },
  actions: { d: 'Corrective and remediation actions from findings, non-compliance, incidents and lessons learned.', g: 'shared',
    h: ['An action is closed only when someone other than its owner verified it. Overdue actions are evidence of weak control operation.'] },
  exceptions: { d: 'Approved, time-limited departures from internal requirements, with compensating controls.', g: 'shared',
    h: ['An exception never waives a law: a departure from a legal obligation is a non-compliance. Only an authority grants a regulatory exemption (Compliance management).'] },
  mappings: { d: 'Qualified mapping assertions: how a policy statement or control corresponds to an obligation or framework requirement.', g: 'shared',
    h: ['A mapping says exact, full, partial, broader, narrower, related or conflicting, against which edition, why, with what confidence and who reviewed it. A mapping is never evidence of compliance.'] },
};

let view = 'evidence';
/** A field for {kind, id} links, typed as "kind:id" one per line. */
export const linksField = (key = 'links', label = 'Linked to (kind:id, one per line — e.g. obligation:OBL-001)') => ({ key, label, type: 'list',
  encode: v => (v || []).map(l => `${l.kind}:${l.id}`), decode: v => v.map(s => { const i = s.indexOf(':'); return i > 0 ? { kind: s.slice(0, i).trim(), id: s.slice(i + 1).trim() } : { kind: 'other', id: s.trim() }; }) });
const showLinks = r => (r.links || r.concerns || []).map(l => `${tr(SH.kindLabel(l.kind))} ${l.id}`).join(', ') || '—';

export function render(sec, arg) {
  if (arg) view = arg.split('/')[0];
  const ws = S.ws, R = SH.reg(ws), asOf = today();
  sec.replaceChildren(el('h1', null, 'Shared registers'));
  sec.append(el('div', 'grid g4',
    kpi('Evidence', n0(R.evidence.length), tr('{0} expired or insufficient').replace('{0}', R.evidence.filter(e => SH.evidenceStatus(e, asOf) !== 'current').length), R.evidence.some(e => SH.evidenceStatus(e, asOf) !== 'current') ? 'warn' : ''),
    kpi('Corrective actions', n0(R.actions.filter(a => !['verified', 'cancelled'].includes(a.state)).length), tr('{0} overdue').replace('{0}', R.actions.filter(a => SH.actionOverdue(a, asOf)).length), R.actions.some(a => SH.actionOverdue(a, asOf)) ? 'bad' : ''),
    kpi('Exceptions', n0(R.exceptions.filter(x => x.status === 'accepted').length), tr('{0} expired').replace('{0}', R.exceptions.filter(x => SH.exceptionExpired(x, asOf)).length), R.exceptions.some(x => SH.exceptionExpired(x, asOf)) ? 'bad' : ''),
    kpi('Mappings', n0(R.mappings.length), tr('{0} not reviewed').replace('{0}', R.mappings.filter(m => m.review !== 'reviewed').length))));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['evidence', 'Evidence'], ['actions', 'Corrective actions'], ['exceptions', 'Exceptions'], ['mappings', 'Mappings']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; history.replaceState(null, '', '#/shared/' + k); render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  const redraw = () => render(sec);
  ({ evidence, actions, exceptions, mappings }[view] || evidence)(body, redraw, ws, asOf);
}

function evidence(body, redraw, ws, asOf) {
  body.append(G.register({ title: 'Evidence register', rows: SH.evidence(ws), prefix: 'EV', redraw, csv: true,
    fields: [{ key: 'title', label: 'What it is', type: 'text', wide: true }, { key: 'shows', label: 'What it shows', type: 'area' },
      { key: 'periodFrom', label: 'Period from', type: 'date' }, { key: 'periodTo', label: 'Period to', type: 'date' },
      { key: 'validUntil', label: 'Valid until', type: 'date' }, { key: 'custodian', label: 'Kept by', type: 'text' },
      { key: 'location', label: 'Where it is kept (path or link)', type: 'text', wide: true }, { key: 'sha256', label: 'SHA-256 of the file (optional)', type: 'text', wide: true },
      { key: 'sufficiency', label: 'Sufficiency', type: 'select', options: SH.SUFFICIENCY }, { key: 'judgedBy', label: 'Judged by', type: 'text' },
      linksField()],
    blank: () => ({ links: [], sufficiency: '', collected: today() }),
    columns: ['id', 'title', { key: 'st', label: 'Status', render: r => { const s = SH.evidenceStatus(r, asOf); return pill(tr({ current: 'Current', expired: 'Expired', 'judged-insufficient': 'Judged insufficient', none: 'None' }[s]), SH.EVIDENCE_KIND[s]); } },
      'validUntil', 'custodian', { key: 'links', label: 'Linked to', render: showLinks }] }));
}

function actions(body, redraw, ws, asOf) {
  body.append(G.register({ title: 'Corrective actions', rows: SH.actions(ws), prefix: 'ACT', redraw, csv: true,
    fields: [{ key: 'title', label: 'Action', type: 'text', wide: true }, { key: 'description', label: 'What will be done', type: 'area' },
      { key: 'source', label: 'Raised from (kind:id)', type: 'text', encode: v => v ? `${v.kind}:${v.id}` : '', decode: s => { const i = s.indexOf(':'); return i > 0 ? { kind: s.slice(0, i).trim(), id: s.slice(i + 1).trim() } : null; } },
      { key: 'owner', label: 'Owner', type: 'text' }, { key: 'due', label: 'Due', type: 'date' },
      { key: 'state', label: 'State', type: 'select', options: SH.ACTION_STATES }, { key: 'verifiedBy', label: 'Verified by (not the owner)', type: 'text' },
      { key: 'verified', label: 'Verified on', type: 'date' }, { key: 'rootCause', label: 'Root cause', type: 'text' }, linksField()],
    blank: () => ({ state: 'open', links: [], opened: today() }),
    validate: SH.closeActionError,
    columns: ['id', 'title', { key: 'source', label: 'From', render: r => r.source ? `${tr(SH.kindLabel(r.source.kind))} ${r.source.id}` : '—' }, 'owner',
      { key: 'due', label: 'Due', render: r => r.due ? (SH.actionOverdue(r, asOf) ? pill(tr('overdue — {0}').replace('{0}', r.due), 'bad') : r.due) : '—' }, 'state', 'verifiedBy'] }));
}

function exceptions(body, redraw, ws, asOf) {
  body.append(banner('warn', 'An exception never waives a law', 'An exception is a time-limited departure from an internal policy or standard, approved by a named person and usually compensated by other controls. It cannot set aside a legal or regulatory obligation: only the authority can grant an exemption, recorded in Compliance management.'));
  const pol = (ws.isp?.policies || []).map(p => [p.id, `${p.id} ${p.title}`]);
  body.append(G.register({ title: 'Exceptions', rows: SH.exceptions(ws), prefix: 'EXC', redraw, csv: true,
    fields: [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'policy', label: 'Policy', type: 'select', options: [['', '—'], ...pol] },
      { key: 'scope', label: 'Scope (systems, people, data)', type: 'area' }, { key: 'description', label: 'Departure', type: 'area' },
      { key: 'legalObligation', label: 'Legal or regulatory obligation concerned, if any', type: 'text', hint: 'If the departure touches a law, it cannot be an exception.' },
      { key: 'compensatedBy', label: 'Compensating controls (one per line)', type: 'list' },
      { key: 'scenarios', label: 'Scenarios whose residual risk counts on it', type: 'multi', options: ws.assessment.SCEN.map(s => [s.id, s.id]) },
      { key: 'approvedBy', label: 'Approved by (person)', type: 'text' }, { key: 'status', label: 'Status', type: 'select', options: SH.EXC_STATES },
      { key: 'expiry', label: 'Expires on', type: 'date' }, linksField('concerns', 'Concerns (kind:id, one per line)')],
    blank: () => ({ type: 'exception', status: 'requested', compensatedBy: [], scenarios: [], concerns: [], waivesLaw: false, severity: 'medium', opened: today() }),
    validate: SH.exceptionError,
    columns: ['id', 'title', { key: 'policy', label: 'Policy', render: r => r.policy || '—' }, 'approvedBy',
      { key: 'expiry', label: 'Expires on', render: r => r.expiry ? (SH.exceptionExpired(r, asOf) ? pill(tr('expired — {0}').replace('{0}', r.expiry), 'bad') : r.expiry) : '—' }, 'status'] }));
}

function mappings(body, redraw, ws) {
  body.append(banner('warn', 'A mapping is never compliance', 'A mapping says how two requirements correspond. Only a dated compliance determination backed by evidence states a compliance state.'));
  body.append(G.register({ title: 'Mappings', rows: SH.mappings(ws), prefix: 'MAP', redraw, csv: true,
    fields: [{ key: 'from', label: 'From (kind:id — policy statement or control)', type: 'text', encode: v => v ? `${v.kind}:${v.id}` : '', decode: s => { const i = s.indexOf(':'); return i > 0 ? { kind: s.slice(0, i).trim(), id: s.slice(i + 1).trim() } : null; } },
      { key: 'to', label: 'To (kind:id — obligation or framework requirement)', type: 'text', encode: v => v ? `${v.kind}:${v.id}` : '', decode: s => { const i = s.indexOf(':'); return i > 0 ? { kind: s.slice(0, i).trim(), id: s.slice(i + 1).trim() } : null; } },
      { key: 'type', label: 'Type', type: 'select', options: SH.MAP_TYPES }, { key: 'edition', label: 'Against which edition', type: 'text' },
      { key: 'rationale', label: 'Why', type: 'area' }, { key: 'confidence', label: 'Confidence', type: 'select', options: SH.CONFIDENCE },
      { key: 'review', label: 'Review', type: 'select', options: SH.REVIEW_STATES }, { key: 'reviewedBy', label: 'Reviewed by', type: 'text' }, { key: 'reviewed', label: 'Reviewed on', type: 'date' }],
    blank: () => ({ type: 'partial', confidence: 'medium', review: 'proposed' }),
    validate: r => (!r.from || !r.to) ? 'A mapping needs both ends, written kind:id.' : (r.review === 'reviewed' && !r.reviewedBy) ? 'A reviewed mapping needs the name of the reviewer.' : null,
    columns: ['id', { key: 'from', label: 'From', render: r => r.from ? `${tr(SH.kindLabel(r.from.kind))} ${r.from.id}` : '—' }, { key: 'to', label: 'To', render: r => r.to ? `${tr(SH.kindLabel(r.to.kind))} ${r.to.id}` : '—' },
      'type', 'edition', 'confidence', 'review'] }));
}
