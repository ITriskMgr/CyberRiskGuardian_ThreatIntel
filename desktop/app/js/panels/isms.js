/* Information security management — module (1.5.8).

   Overview     the information security management system at a glance: scope and boundaries, security
                objectives with their measures, management reviews, and where the policies, the
                statement of applicability and the risk treatment stand.
   Exceptions   policy exceptions in CRGO's model: scoped, approved by a named person, compensated by
                other controls, and expiring. An exception never waives a law: an exception that names a
                legal obligation cannot be accepted. An expired exception is no longer a mitigation, and
                the scenarios that counted on it are shown in the residual-risk discussion.
   The policies themselves are kept in Security policies (ISP); this screen reads and links to them.
   ISO/IEC 27001 and 27002 are cited by identifier only.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, kpi, n0, go, today } from '../util.js';
import { S, touch, compute } from '../state.js';
import * as P from '../isp.js';
import * as G from '../grcui.js';
import * as SH from '../shared.js';
import { tr } from '../i18n.js';

let view = 'overview';

/** Exceptions with the CRGO model, and whether they still count. */
export function exceptions(ws = S.ws) { return SH.exceptions(ws); }
export const expired = x => !!x.expiry && x.expiry < today();
/** Scenarios that rely on an exception that has expired: it is no longer a mitigation. */
export function expiredReliance(ws = S.ws) {
  return exceptions(ws).filter(x => expired(x) && x.status === 'accepted' && (x.scenarios || []).length).map(x => ({ id: x.id, title: x.title, expiry: x.expiry, scenarios: x.scenarios }));
}

export async function render(sec, arg) {
  const [v] = String(arg || '').split('/');
  if (['overview', 'exceptions'].includes(v)) view = v;
  const ws = S.ws, M = ws.isms, I = P.isp(ws);
  sec.replaceChildren(el('h1', null, 'Information security management'),
    el('p', 'lede', 'The management system that holds the rest together: its scope, security objectives, management reviews and policy exceptions — with the policies, the statement of applicability and the risk treatment shown where they stand.'));
  const ex = exceptions(ws);
  const rel = expiredReliance(ws);
  sec.append(el('div', 'grid g4',
    kpi('Policies published', n0(I.policies.filter(p => p.status === 'published').length), tr('{0} in total').replace('{0}', n0(I.policies.length))),
    kpi('Objectives', n0(M.objectives.length), tr('{0} met').replace('{0}', n0(M.objectives.filter(o => o.status === 'met').length))),
    kpi('Last management review', (M.reviews.map(r => r.date).sort().pop()) || '—', M.reviews.length ? '' : 'none recorded', M.reviews.length ? '' : 'warn'),
    kpi('Exceptions', n0(ex.filter(x => x.status === 'accepted' && !expired(x)).length), tr('{0} expired').replace('{0}', n0(ex.filter(expired).length)), rel.length ? 'bad' : ex.some(expired) ? 'warn' : '')));
  if (rel.length) sec.append(banner('bad', 'Expired exceptions are no longer mitigations', rel.map(r => `${r.id} (${r.expiry}) → ${r.scenarios.join(', ')}`).join(' · ')));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['overview', 'Overview'], ['exceptions', 'Policy exceptions']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; go('isms/' + k); } }, t));
  const body = el('div'); sec.append(st, body);
  const redraw = () => render(sec, view);
  ({ overview, exceptionsTab }[view === 'exceptions' ? 'exceptionsTab' : 'overview'])(body, redraw);
}

function overview(body, redraw) {
  const ws = S.ws, M = ws.isms, I = P.isp(ws);
  const sc = el('textarea', { rows: 3, 'data-noi18n': '' }); sc.value = M.scope || ''; sc.addEventListener('change', () => { M.scope = sc.value; touch(); });
  const bd = el('textarea', { rows: 2, 'data-noi18n': '' }); bd.value = M.boundaries || ''; bd.addEventListener('change', () => { M.boundaries = bd.value; touch(); });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Scope of the management system'),
    el('div', 'grid g2', el('div', 'field', el('label', null, 'Scope'), sc), el('div', 'field', el('label', null, 'Boundaries and exclusions'), bd))));
  body.append(G.register({ title: 'Security objectives', rows: M.objectives, prefix: 'OBJ', redraw,
    fields: [{ key: 'text', label: 'Objective', type: 'area', wide: true }, { key: 'measure', label: 'How it is measured', type: 'text' }, { key: 'target', label: 'Target', type: 'text' },
      { key: 'owner', label: 'Owner', type: 'text' }, { key: 'due', label: 'Due', type: 'date' }, { key: 'status', label: 'Status', type: 'select', options: [['planned', 'Planned'], ['on-track', 'On track'], ['at-risk', 'At risk'], ['met', 'Met'], ['missed', 'Missed']] },
      { key: 'kri', label: 'Key risk indicator', type: 'select', options: [['', '—'], ...(ws.assessment.KRIS || []).map(k => [k[0], `${k[0]} ${k[1]}`])] }],
    blank: () => ({ status: 'planned' }), columns: ['id', 'text', 'owner', 'target', 'status', 'due'] }));
  body.append(G.register({ title: 'Management reviews', rows: M.reviews, prefix: 'MR', redraw,
    fields: [{ key: 'date', label: 'Date', type: 'date' }, { key: 'body', label: 'Held by', type: 'select', options: [['', '—'], ...ws.csm.bodies.map(b => [b.id, b.name])] },
      { key: 'attendees', label: 'Attendees', type: 'list' }, { key: 'inputs', label: 'Inputs reviewed (risks, audit results, incidents, objectives, KRIs)', type: 'area' },
      { key: 'decisions', label: 'Decisions and actions', type: 'area' }, { key: 'next', label: 'Next review', type: 'date' }],
    blank: () => ({ date: today(), attendees: [] }), columns: ['id', 'date', { key: 'body', label: 'Held by', render: r => ws.csm.bodies.find(b => b.id === r.body)?.name || '—' }, 'next'] }));
  const res = compute(ws).inc;
  const soa = Object.values(ws.compliance?.soa || {}).flatMap(f => Object.values(f || {}));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Where the parts stand'),
    table([{ key: 'k', label: 'Part' }, { key: 'v', label: 'State' }, { key: 'go', label: '', render: r => el('button', { class: 'btn sm ghost', onclick: () => go(r.go) }, 'Open') }], [
      { k: tr('Security policies (ISP)'), v: tr('{0} published, {1} in review, {2} overdue for review').replace('{0}', I.policies.filter(p => p.status === 'published').length).replace('{1}', I.policies.filter(p => p.status === 'review').length).replace('{2}', I.policies.filter(P.overdue).length), go: 'isp' },
      { k: tr('Statement of applicability'), v: tr('{0} controls recorded').replace('{0}', soa.length), go: 'compliance' },
      { k: tr('Risk treatment'), v: tr('{0} scenarios, {1} above tolerance').replace('{0}', res.length).replace('{1}', res.filter(r => r.ratio > 1.1).length), go: 'riskreg' },
      { k: tr('Audit findings'), v: tr('{0} open').replace('{0}', ws.audit.findings.filter(f => f.status !== 'closed').length), go: 'audit/findings' },
      { k: tr('Incidents'), v: tr('{0} recorded').replace('{0}', ws.csm.incidents.length), go: 'csm/incidents' }], { class: 'compact' })));
}

function exceptionsTab(body, redraw) {
  const ws = S.ws, I = P.isp(ws), rows = exceptions(ws);
  body.append(banner('warn', 'An exception never waives a law', 'A policy exception is a time-limited departure from an internal policy, approved by a named person, usually compensated by other controls. It cannot set aside a legal or regulatory obligation: an exception that names one is refused. When an exception expires it stops being a mitigation.'));
  const policies = [['', '—'], ...I.policies.map(p => [p.id, `${p.id} ${p.title}`])];
  body.append(G.register({ title: 'Policy exceptions', rows, prefix: 'EXC', csv: true,
    redraw: () => { for (const r of rows) { r.acceptedBy = r.approvedBy || r.acceptedBy || ''; r.concerns = r.policy ? [{ kind: 'policy', id: r.policy }] : (r.concerns || []); } touch(); redraw(); },
    fields: [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'policy', label: 'Policy', type: 'select', options: policies },
      { key: 'scope', label: 'Scope (systems, people, data)', type: 'area' }, { key: 'description', label: 'Departure from the policy', type: 'area' },
      { key: 'legalObligation', label: 'Legal or regulatory obligation concerned, if any', type: 'text', hint: 'If the departure touches a law, it cannot be an exception.' },
      { key: 'compensatedBy', label: 'Compensating controls (one per line)', type: 'list' }, { key: 'scenarios', label: 'Scenarios whose residual risk counts on it', type: 'multi', options: ws.assessment.SCEN.map(s => [s.id, s.id]) },
      { key: 'approvedBy', label: 'Approved by (person)', type: 'text' }, { key: 'status', label: 'Status', type: 'select', options: [['requested', 'Requested'], ['accepted', 'Accepted'], ['refused', 'Refused'], ['closed', 'Closed']] },
      { key: 'expiry', label: 'Expires on', type: 'date' }],
    blank: () => ({ type: 'exception', status: 'requested', compensatedBy: [], scenarios: [], waivesLaw: false, severity: 'medium', opened: today() }),
    validate: r => {
      if (r.status === 'accepted' && String(r.legalObligation || '').trim()) return 'An exception can never waive a law: a departure from a legal obligation is a non-compliance, not an exception.';
      if (r.status === 'accepted' && !r.approvedBy) return 'An accepted exception needs the name of the person who approved it.';
      if (r.status === 'accepted' && !r.expiry) return 'An accepted exception needs an expiry date.';
      return null;
    },
    columns: ['id', 'title', { key: 'policy', label: 'Policy', render: r => r.policy || '—' }, 'approvedBy',
      { key: 'expiry', label: 'Expires on', render: r => r.expiry ? (expired(r) ? pill(tr('expired — {0}').replace('{0}', r.expiry), 'bad') : r.expiry) : '—' },
      { key: 'compensatedBy', label: 'Compensating', render: r => String((r.compensatedBy || []).length) }, { key: 'scenarios', label: 'Scenarios', render: r => (r.scenarios || []).join(', ') || '—' }, 'status'] }));
}
