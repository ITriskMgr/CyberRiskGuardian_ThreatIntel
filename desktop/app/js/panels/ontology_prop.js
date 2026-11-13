/* Ontology · CRGO → Proposals (1.9.3, W2b; C7 §I): the library-scenario proposals of this installation — list, preview, Approve,
   Reject with a reason, and for an approved proposal marked Make public the contribution file for the public ontology.
   Approval belongs to the administrator of the installation (single-user mode: the one person); in multi-user mode the buttons are
   disabled for everybody else and the helper refuses the request (403). Approver and date are recorded, with an audit-log entry.
   The application never pushes to GitHub: the contribution file is written to Settings → Links & shared folders → Folder for
   ontology proposals. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, toast, banner, table, modal, field, go } from '../util.js';
import { S, touch } from '../state.js';
import * as C from '../crgo.js';
import * as P from '../ontoprop.js';
import * as users from '../users.js';
import { HS, loadConfig } from '../helper.js';
import { tr } from '../i18n.js';

const today = () => new Date().toISOString().slice(0, 10);
export const isAdmin = () => !users.active() || !!users.me()?.admin;
const STATUS = { proposed: 'Proposed', approved: 'Approved — local', rejected: 'Rejected' };
const kindOf = s => s === 'approved' ? 'good' : s === 'rejected' ? 'bad' : 'warn';
const rowText = p => P.statusText({ state: p.status, public: p.public });

export async function proposals(body, sec) {
  const ws = S.ws, admin = isAdmin();
  await loadConfig().catch(() => {});
  const folder = ((HS.config?.links || {}).ontology_proposals_dir || '').trim();
  if (!(await C.proposals.available())) { body.append(banner('warn', tr('The local helper is needed'), tr(C.NO_HELPER))); return; }
  const l = await C.proposals.list();
  if (l.error) { body.append(banner('bad', tr('The proposals could not be read'), tr(l.message || l.code))); return; }
  await P.syncStatus(ws).catch(() => {});
  const redraw = async () => { body.replaceChildren(); await proposals(body, sec); };
  const folderLine = folder ? el('p', { class: 'small', id: 'prop-folder' }, tr('Folder for ontology proposals'), ': ', el('span', { class: 'mono', 'data-noi18n': '' }, folder))
    : el('p', { class: 'small', id: 'prop-folder' }, pill(tr('not set'), 'warn'), ' ', tr('No folder for ontology proposals is set: choose one in Settings → Links & shared folders → Folder for ontology proposals.'), ' ',
      el('a', { href: '#/settings/links' }, tr('Open Settings')));
  body.append(card(el('h2', null, tr('Proposals')),
    el('p', { class: 'note' }, tr('Only the administrator of this installation approves or rejects a proposal (in single-user mode, the one person). Nothing enters the ontology without it. Approved proposals stay in this installation unless Make public is ticked.')),
    admin ? null : el('p', { class: 'small prop-nonadmin' }, pill(tr('read only'), 'warn'), ' ', tr('You are not an administrator: you can read the proposals, not decide them.')),
    folderLine,
    (l.proposals || []).length ? el('div', { class: 'tablewrap' }, table([
      { key: 'id', label: 'ID', render: p => el('b', { 'data-noi18n': '' }, p.id) },
      { key: 'name', label: 'Scenario', render: p => el('span', { class: 'small', 'data-noi18n': '' }, p.name || '') },
      { key: 'by', label: 'Proposed by', render: p => el('span', { class: 'small', 'data-noi18n': '' }, [p.proposed_by, p.proposed_on].filter(Boolean).join(' · ')) },
      { key: 'st', label: 'Status', render: p => el('span', null, pill(tr(rowText(p)), kindOf(p.status)), p.public === 'requested' ? ' ' : '', p.public === 'requested' ? pill(tr('Make public'), '') : '') },
      { key: 'dec', label: 'Decision', render: p => el('span', { class: 'small', 'data-noi18n': '' }, [p.decided_by, p.decided_on, p.reason].filter(Boolean).join(' · ')) },
      { key: 'act', label: '', sortable: false, render: p => actions(p, ws, admin, folder, redraw) },
    ], l.proposals, { class: 'compact' })) : el('p', { class: 'small muted', id: 'prop-empty' }, tr('No proposal yet. Use Add to the ontology on an own scenario (a theme gap).'))));
}

function actions(p, ws, admin, folder, redraw) {
  const dis = admin ? {} : { disabled: true, title: tr('Only an administrator can decide a proposal.') };
  const b = (label, act, extra, fn) => el('button', { class: 'btn xs ghost', 'data-act': act, 'data-id': p.id, ...extra, onclick: fn }, tr(label));
  return el('span', { class: 'btnrow', style: { display: 'inline-flex', gap: '4px', flexWrap: 'wrap' } },
    b('Preview', 'preview', {}, () => preview(p.id)),
    p.status === 'proposed' ? b('Approve', 'approve', dis, () => approve(p, ws, folder, redraw)) : null,
    p.status === 'proposed' ? b('Reject', 'reject', dis, () => reject(p, ws, redraw)) : null,
    p.status === 'approved' && (p.public === 'requested' || p.public === 'withdrawn') ? b('Export contribution file', 'export', dis, () => exportFile(p, ws, 'add', redraw)) : null,
    p.status === 'approved' && p.public === 'submitted' ? b('Withdraw from the public ontology', 'withdraw', dis, () => exportFile(p, ws, 'withdraw', redraw)) : null);
}

async function preview(id) {
  const r = await C.proposals.read(id);
  if (r.error) { toast(tr(r.message || r.code), 'bad'); return; }
  const q = r.proposal || {};
  const list = (k, f = x => x) => (q[k] || []).length ? el('div', { class: 'small' }, el('b', null, k + ': '), el('span', { 'data-noi18n': '' }, q[k].map(f).join(', '))) : null;
  modal(tr('Proposal {0}').replace('{0}', id), el('p', { class: 'small' }, pill(tr(STATUS[r.status] || r.status), kindOf(r.status)), ' CRGO ', r.crgo_release || ''),
    el('h3', { 'data-noi18n': '' }, q.name || ''), el('p', { 'data-noi18n': '' }, q.statement || ''),
    list('themes'), list('asset_categories'), list('threat_source_types'), list('techniques', x => x[0]), list('cwe', x => x[0]), list('weaknesses'), list('csf2', x => x[0]), list('sp80053r5', x => x[0]), list('iso27002', x => x[0]), list('loi25', x => x[0]),
    q.public ? el('p', { class: 'small' }, pill(tr('Make public'), 'warn'), ' ', tr('Marked for the public ontology by the proposer; nothing leaves this installation before the administrator exports it.')) : null,
    el('details', null, el('summary', { class: 'small' }, tr('History')), el('pre', { class: 'small', 'data-noi18n': '' }, JSON.stringify(r.history || [], null, 1))));
}

function approve(p, ws, folder, redraw) {
  const by = el('input', { value: users.name() || '', id: 'prop-approver', 'aria-label': tr('Approver') });
  const pub = el('input', { type: 'checkbox', id: 'prop-approve-public', checked: p.public === 'requested', style: { width: 'auto' } });
  const m = modal(tr('Approve {0}').replace('{0}', p.id),
    el('p', { class: 'small', 'data-noi18n': '' }, p.name),
    el('p', { class: 'note' }, tr('The scenario joins this installation’s ontology: grouping and validation use it from now on, and the theme-gap flag clears at the next validation.')),
    field('Approver (name and role)', by),
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center' } }, pub, el('b', null, tr('Make public')), el('span', { class: 'small muted' }, tr('Ticked: the contribution file for the public ontology is written now, into the Folder for ontology proposals.'))),
    el('div', { class: 'btnrow', style: { marginTop: '10px' } }, el('button', { class: 'btn', id: 'prop-approve-ok', onclick: async e => {
      if (!by.value.trim()) { toast(tr('Say who approves it'), 'bad'); by.focus(); return; }
      e.target.disabled = true;
      const r = await C.proposals.approve(p.id, { approver: by.value.trim(), date: today() });
      if (r.error) { e.target.disabled = false; toast(tr(r.message || r.code), 'bad'); return; }
      let msg = tr('Approved {0}: it is now part of this installation’s ontology.').replace('{0}', p.id), kind = 'good';
      if (pub.checked) { const x = await C.proposals.exportContribution(p.id, { action: 'add', date: today() }); if (x.error) { msg += ' ' + tr(x.message || x.code); kind = 'warn'; } else msg += ' ' + tr('Contribution file written: {0}').replace('{0}', x.path); }
      await P.syncStatus(ws).catch(() => {});
      m.close(); toast(msg, kind); redraw();
    } }, tr('Approve')), el('button', { class: 'btn ghost', onclick: () => m.close() }, tr('Cancel'))));
}
function reject(p, ws, redraw) {
  const by = el('input', { value: users.name() || '', id: 'prop-rejector', 'aria-label': tr('Approver') });
  const why = el('textarea', { rows: 3, id: 'prop-reason', 'aria-label': tr('Reason') });
  const m = modal(tr('Reject {0}').replace('{0}', p.id), el('p', { class: 'small', 'data-noi18n': '' }, p.name),
    field('Approver (name and role)', by), field('Reason (required)', why),
    el('div', { class: 'btnrow', style: { marginTop: '10px' } }, el('button', { class: 'btn', id: 'prop-reject-ok', onclick: async () => {
      if (!by.value.trim()) { toast(tr('Say who decides'), 'bad'); return; }
      if (!why.value.trim()) { toast(tr('A reason is required'), 'bad'); why.focus(); return; }
      const r = await C.proposals.reject(p.id, why.value.trim(), { approver: by.value.trim(), date: today() });
      if (r.error) { toast(tr(r.message || r.code), 'bad'); return; }
      await P.syncStatus(ws).catch(() => {});
      m.close(); toast(tr('Rejected {0}').replace('{0}', p.id)); redraw();
    } }, tr('Reject')), el('button', { class: 'btn ghost', onclick: () => m.close() }, tr('Cancel'))));
}
async function exportFile(p, ws, action, redraw) {
  if (action === 'add' && !window.confirm(tr('Export the contribution file for {0}? Its text is meant for the public ontology: it leaves this installation when you send the file.').replace('{0}', p.id))) return;
  const r = await C.proposals.exportContribution(p.id, { action, date: today() });
  if (r.error) {
    const m = modal(tr('The contribution file was not written'), el('p', { id: 'prop-export-error' }, tr(r.message || r.code)),
      r.code === 'NO_FOLDER' ? el('div', { class: 'btnrow' }, el('button', { class: 'btn', id: 'prop-open-settings', onclick: () => { m.close(); go('settings/links'); } }, tr('Open Settings'))) : null);
    return;
  }
  for (const s of ws.assessment.SCEN || []) if (s.ontoProposal?.id === p.id) { s.ontoProposal.exportedAt = today(); s.ontoProposal.file = r.path; }
  await P.syncStatus(ws).catch(() => {}); touch();
  toast(tr('Contribution file written: {0}').replace('{0}', r.path)); redraw();
}
