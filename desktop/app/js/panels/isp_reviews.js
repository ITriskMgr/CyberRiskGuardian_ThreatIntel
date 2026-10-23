/* ISP management — Versions & approvals: the life cycle of the selected policy with who and when,
   frozen versions with their SHA-256 (verified again with crypto.subtle on request), the approval
   ledger, the review schedule and triggered reviews, and supersession by another policy.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, toast, banner, table, field, select, download, today } from '../util.js';
import { S } from '../state.js';
import * as P from '../isp.js';
import * as G from '../grcui.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';
import { C, byName, canApprove, statePill, noi, short, indepBanner, policyPick } from './isp_common.js';

/** Life-cycle buttons for one policy (used by the editor and by this tab). */
export function lifecycle(p) {
  const ws = S.ws;
  return (P.FLOW[p.status] || []).map(([to, lab]) => el('button', { class: 'btn' + (to === 'retired' || (to === 'draft' && p.status !== 'published' && p.status !== 'retired') ? ' ghost' : ''), onclick: async () => {
    try {
      if (to === 'approved' && !canApprove()) throw new Error(tr('Approving a policy needs the Approve right (RACI “A”) on the Report step, or an administrator.'));
      if (to === 'review' && !p.statements.length) throw new Error(tr('Add at least one policy statement first.'));
      let by = byName();
      if (!users.active() && (to === 'review' || to === 'approved')) {
        const who = window.prompt(tr(to === 'review' ? 'Your name (who submits this version for review)' : 'Name of the approver'), to === 'approved' ? (p.approver || '') : (p.owner || ''));
        if (who === null) return;
        by = who.trim() || (to === 'approved' ? p.approver || '' : '');
      }
      const note = ['approved', 'retired', 'draft'].includes(to) ? (window.prompt(tr('Note for the history (optional)'), '') ?? null) : '';
      if (note === null) return;
      let e;
      if (to === 'approved') { e = await P.approve(p, { by, note }); if (by) p.approver = by; }
      else e = P.transition(p, to, { by, note });
      users.audit('policy ' + to, `${p.id} v${p.version}${to === 'approved' ? ' sha256 ' + p.approval.hash : ''}`, ws);
      toast(e.what); C.redraw();
    } catch (err) { toast(tr(String(err.message || err)), 'bad'); }
  } }, lab)).concat(p.status === 'review' ? [el('button', { class: 'btn ghost', onclick: () => {
    try {
      const note = window.prompt(tr('Why is this version rejected? (required)'), ''); if (note === null) return;
      const by = users.active() ? byName() : (window.prompt(tr('Name of the reviewer'), p.approver || '') ?? '').trim();
      P.reject(p, { by, note }); users.audit('policy rejected', `${p.id} v${p.version}`, ws); toast(tr('Changes requested: back to draft')); C.redraw();
    } catch (err) { toast(tr(String(err.message || err)), 'bad'); }
  } }, 'Reject (changes requested)')] : []);
}

export function reviewsTab(body) {
  const ws = S.ws, I = P.isp(ws);
  const p = I.policies.find(x => x.id === C.polId) || I.policies[0];
  body.append(indepBanner() || '');
  if (!p) { body.append(el('div', 'empty-state', el('b', null, 'No policy yet'), 'Create one in the Policy library.')); return; }
  C.polId = p.id;
  // the selected policy
  const v = P.inForce(p);
  body.append(card(el('div', 'row', { style: { alignItems: 'center', gap: '8px' } }, el('div', { style: { flex: 1 } }, policyPick(I, p.id, id => { C.polId = id; C.redraw(); })), statePill(p.status), pill('v' + p.version, '')),
    el('div', 'grid g4',
      el('div', null, el('div', 'small muted', 'Author of this version'), noi(p.author || '—', 'b')),
      el('div', null, el('div', 'small muted', 'Submitted by'), noi(p.submittedBy || '—', 'b')),
      el('div', null, el('div', 'small muted', 'Approved by'), noi(p.approval ? `${p.approval.by || '—'} · ${p.approval.at || p.approval.date}` : '—', 'b')),
      el('div', null, el('div', 'small muted', 'Version in force'), el('b', null, v ? `v${v.version} · ${v.effective}` : '—'))),
    p.approval?.hash ? el('div', 'small', { style: { marginTop: '6px' } }, el('span', 'muted', 'Frozen at approval — SHA-256 '), el('code', { 'data-noi18n': '' }, p.approval.hash)) : null,
    el('div', 'btnrow', { style: { marginTop: '8px' } }, ...lifecycle(p)),
    ['published', 'retired'].includes(p.status) ? el('div', 'row', { style: { alignItems: 'end', gap: '8px', marginTop: '8px' } },
      (() => { const s = policyPick(I, '', () => {}, { empty: '—' }); s.id = 'isp-supersede'; return field('Superseded by another policy', s); })(),
      el('button', { class: 'btn ghost', onclick: () => { try { const to = document.getElementById('isp-supersede').value; P.supersede(p, to, { by: byName() }); users.audit('policy superseded', `${p.id} by ${to}`, ws); toast(tr('{0} is superseded').replace('{0}', p.id)); C.redraw(); } catch (e) { toast(tr(String(e.message || e)), 'bad'); } } }, 'Mark as superseded')) : null));
  // frozen versions
  body.append(card(el('h2', { style: { marginTop: 0 } }, `${tr('Frozen versions')} (${p.versions.length})`),
    el('p', 'note', 'Each approved version is frozen with the SHA-256 hash of its canonical content. A frozen version is never edited: changes go into a new draft version.'),
    p.versions.length ? el('div', 'tablewrap', table([
      { key: 'version', label: 'Version', cls: 'mono', render: x => 'v' + x.version }, { key: 'state', label: 'State', render: x => statePill(x.state) },
      { key: 'hash', label: 'SHA-256', render: x => el('span', { class: 'mono small', title: x.hash }, short(x.hash), x.legacyHash ? el('span', 'muted', ' ' + tr('(recorded at upgrade)')) : '') },
      { key: 'author', label: 'Author', render: x => noi(x.author || '—') }, { key: 'sub', label: 'Submitted by', render: x => noi(x.submittedBy || '—') },
      { key: 'appr', label: 'Approved by', render: x => noi(x.approval ? `${x.approval.by || '—'} · ${x.approval.at || x.approval.date}` : '—') },
      { key: 'effective', label: 'In force', cls: 'mono', render: x => x.effective ? `${x.effective} → ${x.until || x.retired || ''}` : '—' },
      { key: 'sup', label: 'Superseded by', cls: 'mono', render: x => x.supersededBy || '—' },
      { key: 'a', label: '', sortable: false, render: x => el('div', 'btnrow',
        el('button', { class: 'btn sm ghost', onclick: async () => { const h = await P.hashOf(x.content); toast(h === x.hash ? tr('Hash verified: the frozen content is unchanged') : tr('Hash mismatch: the frozen content was altered'), h === x.hash ? 'good' : 'bad'); } }, 'Verify the hash'),
        el('button', { class: 'btn sm ghost', onclick: () => download(`${p.id}-v${x.version}.md`, P.toMarkdown(p, ws, x.content), 'text/markdown') }, 'Download')) }],
      p.versions.slice().reverse(), { class: 'compact' })) : el('div', 'small muted', 'No version approved yet.')));
  // history
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Transitions'),
    table([{ key: 'at', label: 'When', cls: 'mono', render: h => h.at || h.date }, { key: 'version', label: 'Version', cls: 'mono' }, { key: 'status', label: 'Status', render: h => statePill(h.status) },
      { key: 'by', label: 'By', render: h => noi(h.by || '—') }, { key: 'what', label: 'Change', render: h => noi(h.what) }], p.history.slice().reverse(), { class: 'compact' })));
  // approval ledger across policies
  const ledger = I.policies.flatMap(x => [...(x.versions || []).flatMap(v => (v.approvals || (v.approval ? [{ ...v.approval, decision: 'approved' }] : [])).map(a => ({ policy: x.id, version: v.version, ...a }))),
    ...(x.rejections || []).map(r => ({ policy: x.id, version: r.version, by: r.by, at: r.at, decision: 'rejected', note: r.note, hash: r.hash }))]).sort((a, b) => ((a.at || '') < (b.at || '') ? 1 : -1));
  body.append(card(el('h2', { style: { marginTop: 0 } }, `${tr('Approval ledger')} (${ledger.length})`),
    ledger.length ? el('div', 'tablewrap', table([{ key: 'at', label: 'When', cls: 'mono', render: a => a.at || a.date }, { key: 'policy', label: 'Policy', cls: 'mono', render: a => `${a.policy} v${a.version}` },
      { key: 'decision', label: 'Decision', render: a => pill(a.decision === 'approved' ? tr('Approved') : tr('Rejected'), a.decision === 'approved' ? 'good' : 'bad') },
      { key: 'by', label: 'By', render: a => noi(a.by || '—') }, { key: 'hash', label: 'SHA-256', render: a => el('span', { class: 'mono small', title: a.hash || '' }, short(a.hash)) }, { key: 'note', label: 'Note', render: a => noi(a.note || '') }], ledger, { class: 'compact' })) : el('div', 'small muted', 'No decision recorded yet.'),
    el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn ghost sm', disabled: !ledger.length, onclick: () => download(`isp-approval-ledger-${today()}.json`, JSON.stringify(ledger, null, 2), 'application/json') }, 'Approval ledger (.json)'))));
  // queues
  const list = (title, rows, empty) => card(el('h2', { style: { marginTop: 0 } }, `${tr(title)} (${rows.length})`), rows.length ? table([
    { key: 'id', label: 'ID', cls: 'mono' }, { key: 'title', label: 'Policy', render: x => el('a', { href: '#/isp/policy/' + x.id, 'data-noi18n': '' }, x.title) },
    { key: 'version', label: 'Version', cls: 'mono' }, { key: 'owner', label: 'Owner', render: x => noi(x.owner || '—') }, { key: 'nextReview', label: 'Review date', cls: 'mono', render: x => P.reviewDate(x) || '—' }], rows, { class: 'compact' }) : el('div', 'small muted', empty));
  body.append(el('div', 'grid g2', list('Waiting for approval', I.policies.filter(x => x.status === 'review'), 'Nothing waiting.'),
    list('Approved, not published yet', I.policies.filter(x => x.status === 'approved'), 'Nothing waiting.'),
    list('Review overdue', I.policies.filter(P.overdue), 'No review overdue.'),
    list('Review due within a month', I.policies.filter(P.dueSoon), 'Nothing due this month.')));
  // directive reviews
  const pol = I.policies.map(x => [x.id, `${x.id} ${x.title}`]);
  body.append(G.register({ title: 'Policy reviews', rows: I.reviewsDue, prefix: 'REV', redraw: C.redraw, csv: true,
    note: 'A review is scheduled (the review date) or triggered by a change: regulatory, incident, finding, risk, organisational or technology. Its outcome is recorded with who and when.',
    fields: [{ key: 'policy', label: 'Policy', type: 'select', options: pol.length ? pol : [['', '—']] }, { key: 'trigger', label: 'Trigger', type: 'select', options: P.TRIGGERS },
      { key: 'triggeredBy', label: 'Triggered by (incident, finding, change…)', type: 'text' }, { key: 'assignee', label: 'Reviewer', type: 'text' },
      { key: 'due', label: 'Due', type: 'date' }, { key: 'note', label: 'Note', type: 'area' }],
    blank: () => ({ policy: p.id, trigger: 'scheduled', outcome: '', completed: '', opened: today(), version: p.version }),
    validate: r => !r.policy ? 'Choose a policy.' : !r.due ? 'A review needs a due date.' : null,
    columns: ['id', 'policy', 'trigger', 'triggeredBy', 'assignee', { key: 'due', label: 'Due', render: r => P.reviewOverdue(r) ? pill(tr('overdue — {0}').replace('{0}', r.due), 'bad') : r.due || '—' },
      { key: 'outcome', label: 'Outcome', render: r => r.completed ? `${tr(P.OUTCOMES.find(o => o[0] === r.outcome)?.[1] || r.outcome)} · ${r.completed}` : '—' }],
    actions: r => r.completed ? [] : P.OUTCOMES.filter(o => o[0]).map(([k, lab]) => el('button', { class: 'btn sm ghost', title: lab, onclick: () => {
      try { if (!window.confirm(tr('Close review {0}: {1}?').replace('{0}', r.id).replace('{1}', tr(lab)))) return; P.completeReview(r, k, { by: byName() }, ws); users.audit('policy review completed', `${r.id} ${k}`, ws); C.redraw(); }
      catch (e) { toast(tr(String(e.message || e)), 'bad'); } } }, { nochange: 'No change', revise: 'Revise', retire: 'Retire' }[k])) }));
}
