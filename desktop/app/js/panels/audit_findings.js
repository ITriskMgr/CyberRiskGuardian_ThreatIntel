/* Audit management — observations and findings, responses and follow-up, reports, quality and
   independence, traceability.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, n0, today, toast, modal, download, toCSV, select, field } from '../util.js';
import { S, touch } from '../state.js';
import * as SH from '../shared.js';
import * as M from '../ams.js';
import { targetField, targetLabel } from './csm.js';
import { tr } from '../i18n.js';
import { indep, ask, lab, short, dn, who, approveGuard, logData, listCard, recSelect } from './audit_ui.js';

const sigKind = s => ['high', 'critical'].includes(s) ? 'bad' : 'warn';
const fLabel = f => `${f.id} ${f.title || ''}`;

/* ---------------- observations, findings, recommendations ---------------- */
export function findingsTab(body, redraw, ws) {
  const A = ws.audit;
  const evOpts = SH.evidence(ws).map(e => [e.id, `${e.id} ${e.title || ''}`]);
  body.append(banner('warn', 'An observation is not a finding', 'Observations are preliminary: a condition noted during fieldwork, not yet validated against criteria and evidence. They are not counted, reported or used as findings. Validated, an observation becomes a finding; a monitoring alert or a compliance status never does.'));
  body.append(listCard({ title: 'Observations', rows: A.observations, redraw, canEdit: o => o.status === 'draft', lockedNote: 'A validated or dismissed observation is kept as it was.',
    fields: () => [{ key: 'title', label: 'Title', type: 'text', wide: true }, recSelect('engagement', 'Engagement', A.engagements, e => `${e.id} ${e.title || ''}`),
      recSelect('workpaper', 'Workpaper', A.workpapers, w => `${w.id} ${w.title || ''}`), { key: 'criterion', label: 'Criterion (what should be)', type: 'area' },
      { key: 'condition', label: 'Condition noted (what is)', type: 'area' }, { key: 'evidence', label: 'Evidence (shared register)', type: 'multi', options: evOpts },
      { key: 'limitation', label: 'Evidence limitation, if any', type: 'area' }, { key: 'raisedBy', label: 'Noted by', type: 'text' }, { key: 'raisedOn', label: 'Noted on', type: 'date' }],
    blank: () => ({ id: M.nextId(A.observations, 'OBS'), status: 'draft', evidence: [], raisedBy: who(), raisedOn: today(), engagement: A.engagements.slice(-1)[0]?.id || '' }),
    check: r => !r.engagement ? 'An observation belongs to an engagement.' : null,
    onSave: (r, isNew) => { if (isNew) { A.observations.push(r); M.event(ws, 'observation recorded', 'observation', r.id, r.engagement, who()); } return null; },
    columns: [{ key: 'id', label: 'Observation', cls: 'mono' }, { key: 'engagement', label: 'Engagement', cls: 'mono' }, { key: 'title', label: 'Title', render: r => dn(r.title) },
      { key: 'status', label: 'Status', render: r => pill(lab(M.OBS_STATES, r.status), r.status === 'validated' ? 'good' : r.status === 'dismissed' ? '' : 'warn') },
      { key: 'finding', label: 'Validated as', render: r => r.finding ? el('span', 'mono', r.finding) : r.reason ? dn(r.reason) : '—' }],
    actions: o => o.status !== 'draft' ? [] : [
      el('button', { class: 'btn sm', onclick: () => ask('Validate as a finding', [{ key: 'by', label: 'Validated by', type: 'text' }], { by: who() }, v => { const r = M.promote(ws, o, v.by); if (r.error) return r.error; toast(tr('Finding {0} created from {1}').replace('{0}', r.finding.id).replace('{1}', o.id)); return null; }, redraw) }, 'Validate as finding'),
      el('button', { class: 'btn sm ghost', onclick: () => ask('Dismiss the observation', [{ key: 'by', label: 'Dismissed by', type: 'text' }, { key: 'reason', label: 'Reason', type: 'area' }], { by: who(), reason: '' }, v => M.dismiss(ws, o, v.by, v.reason), redraw) }, 'Dismiss')] }));

  const conclusion = ['criterion', 'condition', 'cause', 'effect', 'significance'];
  const fFields = f => [{ key: 'title', label: 'Title', type: 'text', wide: true }, recSelect('engagement', 'Engagement', A.engagements, e => `${e.id} ${e.title || ''}`),
    targetField(ws, 'Control concerned'), { key: 'scenarios', label: 'Scenarios concerned', type: 'multi', options: ws.assessment.SCEN.map(s => [s.id, s.id]) },
    { key: 'criterion', label: 'Criterion (what should be)', type: 'area' }, { key: 'condition', label: 'Condition (what is)', type: 'area' },
    { key: 'cause', label: 'Cause', type: 'area' }, { key: 'rootCause', label: 'Root-cause category', type: 'select', options: [['', '—'], ['people', 'People'], ['process', 'Process'], ['technology', 'Technology'], ['governance', 'Governance'], ['third-party', 'Third party'], ['external', 'External event']] },
    { key: 'effect', label: 'Effect (risk)', type: 'area' }, { key: 'significance', label: 'Significance', type: 'select', options: M.SIGNIFICANCE },
    { key: 'significanceRationale', label: 'Why this significance (method and rationale)', type: 'area' },
    { key: 'evidence', label: 'Evidence (references, e.g. EV-001, WP-002)', type: 'list' }, { key: 'evidenceLimitation', label: 'Evidence limitation, if any', type: 'area' },
    { key: 'raisedOn', label: 'Raised on', type: 'date' }]
    .map(x => f.validation === 'issued' && conclusion.includes(x.key) ? { ...x, disabled: true } : x);
  body.append(listCard({ title: 'Findings', rows: A.findings, redraw, fields: fFields,
    note: 'A finding is a conclusion of an audit or assurance engagement. It issues only with criterion, condition, effect and evidence (or a stated evidence limitation); once issued, its conclusion is fixed — management responds separately. An open finding on a control lowers confidence in that control.',
    blank: () => ({ id: M.nextId(A.findings, 'FND'), significance: 'medium', status: 'open', validation: 'validated', raisedOn: today(), evidence: [], scenarios: [], reopened: [], target: null }),
    check: r => M.conclusionChanged(r) ? 'An issued finding\'s conclusion cannot be changed. Correct the report with an addendum, or record a new finding.' : M.closeOk(r),
    onSave: (r, isNew) => { if (isNew) A.findings.push(r); M.event(ws, isNew ? 'finding recorded' : 'finding saved', 'finding', r.id, '', who()); return null; },
    columns: [{ key: 'id', label: 'Finding', cls: 'mono' }, { key: 'title', label: 'Title', render: r => dn(r.title) }, { key: 'engagement', label: 'Engagement', cls: 'mono' },
      { key: 'target', label: 'Control', render: r => el('span', { class: 'small', 'data-noi18n': '' }, targetLabel(ws, r.target)) },
      { key: 'significance', label: 'Significance', render: r => pill(lab(M.SIGNIFICANCE, r.significance), sigKind(r.significance)) },
      { key: 'validation', label: 'Validation', render: r => pill(lab(M.F_VALIDATION, r.validation || 'validated'), r.validation === 'issued' ? 'good' : '') },
      { key: 'status', label: 'Status', render: r => pill(lab(M.F_STATUS, r.status), r.status === 'closed' ? 'good' : 'warn') },
      { key: 'recs', label: 'Recommendations', render: r => n0(M.recsOf(ws, r.id).length) },
      { key: 'due', label: 'Due', render: r => r.due ? (r.status !== 'closed' && r.due < today() ? pill(r.due, 'bad') : r.due) : '—' }],
    actions: f => [
      f.validation !== 'issued' ? el('button', { class: 'btn sm', onclick: () => ask('Issue the finding', [{ key: 'by', label: 'Issued by (audit)', type: 'text' }, { key: 'date', label: 'Date', type: 'date' }], { by: who(), date: today() },
        v => M.issueFinding(ws, f, v.by, v.date), redraw, 'Issuing communicates the finding under audit authority. Its criterion, condition, cause, effect and significance are then fixed.') }, 'Issue finding') : null,
      el('button', { class: 'btn sm ghost', onclick: () => ask('Add a recommendation', [{ key: 'text', label: 'Recommendation', type: 'area' }, { key: 'outcome', label: 'Outcome expected', type: 'area' },
        { key: 'priority', label: 'Priority', type: 'select', options: M.SIGNIFICANCE }, { key: 'by', label: 'Recommended by', type: 'text' }], { text: '', outcome: '', priority: f.significance, by: who() },
        v => { if (!String(v.text || '').trim()) return 'Write the recommendation.'; A.recommendations.push({ id: M.nextId(A.recommendations, 'REC'), finding: f.id, ...v, date: today() }); M.event(ws, 'recommendation', 'finding', f.id, '', v.by); return null; }, redraw) }, 'Recommend'),
      f.status === 'closed' ? el('button', { class: 'btn sm ghost', onclick: () => ask('Reopen the finding', [{ key: 'by', label: 'Reopened by', type: 'text' }, { key: 'reason', label: 'Why is this finding reopened?', type: 'area' }], { by: who(), reason: '' },
        v => { const bad = M.reopenRecord(f, v); if (!bad) M.event(ws, 'finding reopened', 'finding', f.id, v.reason, v.by); return bad; }, redraw) }, 'Reopen') : null].filter(Boolean) }));

  body.append(listCard({ title: 'Recommendations', rows: A.recommendations, redraw,
    fields: () => [recSelect('finding', 'Finding', A.findings, fLabel, false), { key: 'text', label: 'Recommendation', type: 'area' }, { key: 'outcome', label: 'Outcome expected', type: 'area' },
      { key: 'priority', label: 'Priority', type: 'select', options: M.SIGNIFICANCE }, { key: 'by', label: 'Recommended by', type: 'text' }, { key: 'date', label: 'Date', type: 'date' }],
    blank: () => ({ id: M.nextId(A.recommendations, 'REC'), finding: A.findings[0]?.id || '', priority: 'medium', by: who(), date: today() }),
    check: r => !r.finding ? 'Choose the finding.' : !String(r.text || '').trim() ? 'Write the recommendation.' : null,
    onSave: (r, isNew) => { if (isNew) A.recommendations.push(r); return null; },
    columns: [{ key: 'id', label: 'Recommendation', cls: 'mono' }, { key: 'finding', label: 'Finding', cls: 'mono' }, { key: 'text', label: 'Recommendation', render: r => dn(r.text) },
      { key: 'priority', label: 'Priority', render: r => lab(M.SIGNIFICANCE, r.priority) }, { key: 'resp', label: 'Responses', render: r => n0(A.responses.filter(x => x.recommendation === r.id || (!x.recommendation && x.finding === r.finding)).length) }] }));
}

/* ---------------- responses, corrective actions, follow-up ---------------- */
export function followupTab(body, redraw, ws) {
  const A = ws.audit, asOf = today();
  body.append(indep());
  body.append(el('p', 'note', 'Management owns the remediation; audit owns the closure decision. A response never changes the finding it answers.'));
  body.append(listCard({ title: 'Management responses', rows: A.responses, redraw,
    fields: () => [recSelect('finding', 'Finding', A.findings, fLabel, false), recSelect('recommendation', 'Recommendation answered', A.recommendations, r => `${r.id} (${r.finding}) ${String(r.text || '').slice(0, 60)}`),
      { key: 'stance', label: 'Response', type: 'select', options: M.STANCE }, { key: 'explanation', label: 'Management\'s explanation', type: 'area' },
      { key: 'actionPlan', label: 'Action plan', type: 'area' }, { key: 'owner', label: 'Action owner', type: 'text' }, { key: 'due', label: 'Agreed date', type: 'date' },
      { key: 'respondedBy', label: 'Responded by (manager)', type: 'text' }, { key: 'respondedOn', label: 'Responded on', type: 'date' },
      { key: 'approvedBy', label: 'Risk accepted by (manager, risk acceptance only)', type: 'text' }],
    blank: () => ({ id: M.nextId(A.responses, 'MR'), finding: A.findings.find(f => f.status !== 'closed')?.id || '', stance: 'accepted', respondedOn: today() }),
    check: r => M.responseError(r),
    onSave: r => M.saveResponse(ws, r),
    columns: [{ key: 'id', label: 'Response', cls: 'mono' }, { key: 'finding', label: 'Finding', cls: 'mono' },
      { key: 'stance', label: 'Response', render: r => pill(lab(M.STANCE, r.stance), r.stance === 'rejected' ? 'bad' : r.stance === 'risk-accepted' ? 'warn' : 'good') },
      { key: 'owner', label: 'Action owner', render: r => dn(r.owner) }, { key: 'due', label: 'Agreed date' }, { key: 'action', label: 'Corrective action', cls: 'mono' },
      { key: 'respondedBy', label: 'Responded by', render: r => dn(r.respondedBy) }],
    actions: r => {
      const f = A.findings.find(x => x.id === r.finding);
      return r.stance === 'risk-accepted' && f && f.status !== 'closed' ? [el('button', { class: 'btn sm ghost', onclick: () => ask('Close on risk acceptance', [{ key: 'by', label: 'Closure decided by (audit)', type: 'text' }, { key: 'date', label: 'Date', type: 'date' }], { by: who(), date: today() },
        v => { if (!String(v.by || '').trim()) return 'Name the auditor who records the closure.'; if (M.samePerson(v.by, r.approvedBy)) return 'The manager who accepted the risk cannot record the audit closure.';
          f.riskAcceptedBy = r.approvedBy; M.closeRecord(f, { by: v.by, date: v.date, riskAcceptedBy: r.approvedBy }); M.event(ws, 'finding closed on risk acceptance', 'finding', f.id, r.id, v.by); return null; }, redraw,
        'The finding is closed on management\'s recorded acceptance of the risk, not on a verified correction. The acceptance stays visible in the report and the traceability.') }, 'Close on risk acceptance')] : [];
    } }));

  const acts = SH.actions(ws).filter(a => a.source?.kind === 'finding' || (a.links || []).some(l => l.kind === 'finding'));
  body.append(card(el('h2', { style: { marginTop: 0 } }, tr('Corrective actions from findings ({0})').replace('{0}', acts.length)),
    el('p', 'note', 'Kept in the shared corrective-action register. One action can also answer a compliance nonconformity or a policy non-compliance: each record keeps its own conclusion.'),
    acts.length ? table([{ key: 'id', label: 'Action', cls: 'mono' }, { key: 'title', label: 'Action', render: r => dn(r.title) }, { key: 'owner', label: 'Owner', render: r => dn(r.owner) },
      { key: 'due', label: 'Due', render: r => r.due ? (SH.actionOverdue(r, asOf) ? pill(tr('overdue — {0}').replace('{0}', r.due), 'bad') : r.due) : '—' },
      { key: 'state', label: 'State', render: r => lab(SH.ACTION_STATES, r.state) }, { key: 'verifiedBy', label: 'Verified by', render: r => dn(r.verifiedBy) },
      { key: 'links', label: 'Linked to', render: r => dn((r.links || []).map(l => `${l.kind}:${l.id}`).join(', ')) },
      { key: 'x', label: '', sortable: false, render: a => el('div', 'btnrow',
        ['open', 'progress'].includes(a.state) ? el('button', { class: 'btn sm ghost', onclick: () => ask('Owner reports the action done', [{ key: 'by', label: 'Reported by (owner)', type: 'text' }, { key: 'note', label: 'What was done', type: 'area' }], { by: a.owner || '', note: '' },
          v => { a.state = 'done'; a.doneOn = today(); a.doneNote = v.note; M.event(ws, 'action reported done', 'action', a.id, v.note, v.by); return null; }, redraw) }, 'Report done') : null,
        el('button', { class: 'btn sm ghost', onclick: () => ask('Link to another record', [{ key: 'link', label: 'Record (kind:id, e.g. issue:NC-002 or obligation:OBL-004)', type: 'text' }], { link: '' },
          v => { const i = String(v.link || '').indexOf(':'); if (i < 1) return 'Write the record as kind:id.'; return M.linkAction(ws, a.id, v.link.slice(0, i).trim(), v.link.slice(i + 1).trim()); }, redraw) }, 'Link a record')) }], acts, { class: 'compact' })
      : el('div', 'empty-state', tr('No corrective action yet: an accepted management response opens one.'))));

  body.append(listCard({ title: 'Follow-up verifications', rows: A.followups, redraw, canEdit: r => !r.decision, lockedNote: 'A recorded verification is kept as it was; record a new one if needed.',
    fields: () => [recSelect('finding', 'Finding', A.findings, fLabel, false), recSelect('action', 'Corrective action', SH.actions(ws), a => `${a.id} ${a.title || ''}`),
      { key: 'steps', label: 'Verification steps', type: 'area' }, { key: 'evidence', label: 'Evidence examined (references)', type: 'list' },
      { key: 'verifier', label: 'Verified by (independent of the action owner)', type: 'text' }, { key: 'date', label: 'Date', type: 'date' },
      { key: 'result', label: 'Result', type: 'select', options: M.VERIFY }, { key: 'notes', label: 'Notes', type: 'area' }],
    blank: () => { const f = A.findings.find(x => x.status !== 'closed'); return { id: M.nextId(A.followups, 'FU'), finding: f?.id || '', action: f?.actionId || '', evidence: [], verifier: who(), date: today(), result: 'effective' }; },
    note: 'Effective: the action is verified and the finding closed. Partly or not effective: the action and the finding are reopened.',
    check: r => M.followupError(ws, r),
    onSave: r => M.applyFollowUp(ws, r),
    columns: [{ key: 'id', label: 'Follow-up', cls: 'mono' }, { key: 'finding', label: 'Finding', cls: 'mono' }, { key: 'action', label: 'Action', cls: 'mono' },
      { key: 'verifier', label: 'Verified by', render: r => dn(r.verifier) }, { key: 'date', label: 'Date' }, { key: 'result', label: 'Result', render: r => lab(M.VERIFY, r.result) },
      { key: 'decision', label: 'Decision', render: r => r.decision ? pill(tr(r.decision === 'accepted' ? 'Accepted — closed' : 'Rejected — reopened'), r.decision === 'accepted' ? 'good' : 'bad') : '—' }] }));

  const hist = A.findings.flatMap(f => [...(f.closures || []).map(c => ({ f: f.id, date: c.date, what: tr('Closed'), by: c.by, basis: c.basis?.kind === 'followup' ? c.basis.id : tr('risk accepted by {0}').replace('{0}', c.basis?.by || '') })),
    ...(f.reopened || []).map(r => ({ f: f.id, date: r.date, what: tr('Reopened'), by: r.by, basis: r.reason }))]).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Closure and reopening history'),
    hist.length ? table([{ key: 'date', label: 'Date' }, { key: 'f', label: 'Finding', cls: 'mono' }, { key: 'what', label: 'Event' }, { key: 'by', label: 'By', render: r => dn(r.by) }, { key: 'basis', label: 'Basis', render: r => dn(r.basis) }], hist, { class: 'compact' })
      : el('div', 'empty-state', tr('Nothing recorded yet.'))));
}

/* ---------------- reports ---------------- */
export function reportsTab(body, redraw, ws) {
  const A = ws.audit;
  body.append(indep());
  const preview = r => { const md = M.reportMarkdown(ws, r); const m = modal(tr('Report — {0}').replace('{0}', r.id), el('pre', { class: 'small', 'data-noi18n': '', style: { whiteSpace: 'pre-wrap', maxHeight: '60vh', overflow: 'auto' } }, md),
    el('div', 'btnrow', el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => download(`${r.id}-v${r.version || 1}${r.state === 'issued' ? '' : '-draft'}.md`, md, 'text/markdown') }, 'Export .md'), el('button', { class: 'btn', onclick: () => m.close() }, 'Close'))); };
  body.append(listCard({ title: 'Audit reports', rows: A.reports, redraw, canEdit: r => r.state === 'draft', lockedNote: 'Only a draft report can be edited. After issue, use an addendum or a new version.',
    fields: () => [recSelect('engagement', 'Engagement', A.engagements, e => `${e.id} ${e.title || ''}`, false), { key: 'title', label: 'Title', type: 'text', wide: true },
      { key: 'audience', label: 'Audience (who it is addressed to)', type: 'text', wide: true }, { key: 'recipients', label: 'Recipients', type: 'text', wide: true },
      { key: 'retention', label: 'Retention', type: 'text' }, { key: 'preparedBy', label: 'Prepared by', type: 'text' }],
    blank: () => ({ id: M.nextId(A.reports, 'RPT'), engagement: A.engagements.find(e => ['reporting', 'fieldwork'].includes(e.status))?.id || A.engagements[0]?.id || '', title: 'Audit report', version: 1, state: 'draft', preparedBy: who(), retention: '7 years', addenda: [] }),
    check: r => !r.engagement ? 'Choose the engagement.' : null,
    onSave: (r, isNew) => { if (isNew) { A.reports.push(r); M.event(ws, 'report drafted', 'report', r.id, r.engagement, r.preparedBy); } return null; },
    columns: [{ key: 'id', label: 'Report', cls: 'mono' }, { key: 'engagement', label: 'Engagement', cls: 'mono' }, { key: 'version', label: 'Version', render: r => 'v' + (r.version || 1) },
      { key: 'state', label: 'State', render: r => pill(lab(M.REPORT_STATES, r.state), r.state === 'issued' ? 'good' : 'warn') }, { key: 'issuedOn', label: 'Issued on', render: r => r.issuedOn || '—' },
      { key: 'hash', label: 'SHA-256', render: r => r.hash ? pill(M.reportIntact(r) && M.addendaIntact(r) ? tr('intact {0}').replace('{0}', short(r.hash)) : tr('altered'), M.reportIntact(r) && M.addendaIntact(r) ? 'good' : 'bad') : '—' },
      { key: 'addenda', label: 'Addenda', render: r => n0((r.addenda || []).length) }],
    actions: r => {
      const out = [el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => preview(r) }, 'Preview')];
      if (r.state === 'draft') out.push(el('button', { class: 'btn sm ghost', onclick: () => ask('Send to supervisory review', [{ key: 'by', label: 'Prepared by', type: 'text' }], { by: r.preparedBy || who() }, v => M.reportStep(ws, r, 'review', v), redraw) }, 'Send to review'));
      if (r.state === 'review') out.push(el('button', { class: 'btn sm', onclick: () => { const g = approveGuard(); if (g) { toast(g, 'bad'); return; }
        ask('Approve for issue', [{ key: 'reviewedBy', label: 'Supervisory reviewer', type: 'text' }, { key: 'approvedBy', label: 'Issue authorised by (e.g. chief audit executive)', type: 'text' }, { key: 'date', label: 'Date', type: 'date' }],
          { reviewedBy: '', approvedBy: '', date: today() }, v => M.reportStep(ws, r, 'approved', v), redraw, 'Neither the reviewer nor the person who authorises issue can be the person who prepared the report.'); } }, 'Approve'));
      if (r.state === 'approved') out.push(el('button', { class: 'btn sm', onclick: () => { const g = approveGuard(); if (g) { toast(g, 'bad'); return; }
        ask('Issue the report', [{ key: 'date', label: 'Issued on', type: 'date' }], { date: today() }, v => { const bad = M.reportStep(ws, r, 'issued', { ...v, by: r.approvedBy }); if (!bad) logData('audit report issued', r.id, r.hash.slice(0, 16)); return bad; }, redraw,
          'Issuing freezes a snapshot of the engagement, its issued findings, recommendations and management responses, with a SHA-256 hash. Later corrections are addenda.'); } }, 'Issue report'));
      if (r.state === 'issued') {
        out.push(el('button', { class: 'btn sm ghost', onclick: () => ask('Add an addendum', [{ key: 'by', label: 'Author', type: 'text' }, { key: 'text', label: 'Correction or addition', type: 'area' }], { by: who(), text: '' }, v => M.addendum(ws, r, v), redraw) }, 'Addendum'));
        out.push(el('button', { class: 'btn sm ghost', onclick: () => { const n = { ...JSON.parse(JSON.stringify(r)), id: M.nextId(A.reports, 'RPT'), version: (r.version || 1) + 1, state: 'draft', snapshot: null, hash: '', issuedOn: '', addenda: [], supersedes: r.id, reviewedBy: '', approvedBy: '', approvedOn: '', preparedBy: who() };
          A.reports.push(n); M.event(ws, 'report new version', 'report', n.id, `from ${r.id}`, who()); touch(); toast(tr('Draft {0} created').replace('{0}', n.id)); redraw(); } }, 'New version'));
      }
      return out;
    } }));
}

/* ---------------- quality and independence ---------------- */
export function qualityTab(body, redraw, ws) {
  const A = ws.audit;
  body.append(indep());
  body.append(listCard({ title: 'Conflict-of-interest declarations', rows: A.conflicts, redraw,
    note: 'Declared before assignment. A person with an open declaration cannot be assigned to the engagement (or its auditable entity) until a safeguard is recorded and authorised by someone else.',
    fields: () => [{ key: 'person', label: 'Person', type: 'text' }, recSelect('engagement', 'Engagement', A.engagements, e => `${e.id} ${e.title || ''}`),
      recSelect('entity', 'Auditable entity', A.universe, u => `${u.id} ${u.name}`), { key: 'nature', label: 'Nature of the conflict', type: 'area' }, { key: 'declaredOn', label: 'Declared on', type: 'date' },
      { key: 'safeguard', label: 'Safeguard', type: 'area' }, { key: 'authorisedBy', label: 'Safeguard authorised by', type: 'text' }, { key: 'authorisedOn', label: 'Authorised on', type: 'date' }],
    blank: () => ({ id: M.nextId(A.conflicts, 'COI'), declaredOn: today() }),
    check: r => !String(r.person || '').trim() ? 'Name the person who declares.' : (!r.engagement && !r.entity) ? 'Say which engagement or auditable entity the conflict concerns.' : M.samePerson(r.authorisedBy, r.person) ? 'A person cannot authorise the safeguard for their own conflict.' : null,
    onSave: (r, isNew) => { if (isNew) A.conflicts.push(r); M.event(ws, 'conflict of interest', 'conflict', r.id, r.person, who()); return null; },
    columns: [{ key: 'id', label: 'Declaration', cls: 'mono' }, { key: 'person', label: 'Person', render: r => dn(r.person) }, { key: 'engagement', label: 'Engagement', cls: 'mono' }, { key: 'entity', label: 'Entity', cls: 'mono' },
      { key: 'nature', label: 'Nature', render: r => dn(r.nature) }, { key: 's', label: 'Status', render: r => M.conflictOpen(r) ? pill('open — no authorised safeguard', 'bad') : pill('safeguarded', 'good') }] }));
  const subj = { key: 'subject', label: 'Subject (engagement:ENG-001, workpaper:WP-001 or function:audit)', type: 'text', encode: v => v ? `${v.kind}:${v.id}` : '', decode: s => { const i = s.indexOf(':'); return i > 0 ? { kind: s.slice(0, i).trim(), id: s.slice(i + 1).trim() } : null; } };
  body.append(listCard({ title: 'Quality reviews', rows: A.qreviews, redraw,
    note: 'Supervisory reviews of engagement work, internal quality assessments and external quality assessments of the audit function. A reviewer never reviews work they prepared or took part in.',
    fields: () => [{ key: 'kind', label: 'Kind', type: 'select', options: M.QR_KINDS }, subj, { key: 'reviewer', label: 'Reviewer', type: 'text' }, { key: 'date', label: 'Date', type: 'date' },
      { key: 'checks', label: 'Checks performed (one per line)', type: 'list' }, { key: 'exceptions', label: 'Exceptions (one per line)', type: 'list' },
      { key: 'resolution', label: 'Resolution', type: 'area' }, { key: 'state', label: 'State', type: 'select', options: [['open', 'Open'], ['closed', 'Closed']] }],
    blank: () => ({ id: M.nextId(A.qreviews, 'QR'), kind: 'supervisory', subject: A.engagements[0] ? { kind: 'engagement', id: A.engagements[0].id } : { kind: 'function', id: 'audit' }, date: today(), checks: [], exceptions: [], state: 'open' }),
    check: r => M.qreviewError(ws, r),
    onSave: (r, isNew) => { if (isNew) A.qreviews.push(r); M.event(ws, 'quality review', 'qreview', r.id, `${r.subject?.kind}:${r.subject?.id}`, r.reviewer); return null; },
    columns: [{ key: 'id', label: 'Quality review', cls: 'mono' }, { key: 'kind', label: 'Kind', render: r => lab(M.QR_KINDS, r.kind) }, { key: 'subject', label: 'Subject', render: r => dn(r.subject ? `${r.subject.kind}:${r.subject.id}` : '') },
      { key: 'reviewer', label: 'Reviewer', render: r => dn(r.reviewer) }, { key: 'date', label: 'Date' }, { key: 'ex', label: 'Exceptions', render: r => (r.exceptions || []).length ? pill(String(r.exceptions.length), 'warn') : '0' },
      { key: 'state', label: 'State', render: r => lab([['open', 'Open'], ['closed', 'Closed']], r.state) }] }));
}

/* ---------------- traceability ---------------- */
let traceEng = '';
export function traceTab(body, redraw, ws) {
  const A = ws.audit;
  const sel = select([['', tr('All engagements')], ...A.engagements.map(e => [e.id, `${e.id} ${e.title || ''}`])], traceEng);
  sel.addEventListener('change', () => { traceEng = sel.value; redraw(); });
  const rows = M.trace(ws).filter(r => !traceEng || r.engagement?.id === traceEng);
  const id = x => x ? el('span', 'mono small', x.id) : el('span', 'muted', '—');
  const cols = [
    { key: 'u', label: 'Universe', render: r => id(r.universe) },
    { key: 'pe', label: 'Plan entry', render: r => r.entry ? el('span', 'mono small', `${r.plan.id}/${r.entry.id}`) : el('span', 'muted', '—') },
    { key: 'e', label: 'Engagement', render: r => r.engagement ? el('span', null, el('span', 'mono small', r.engagement.id), ' ', pill(lab(M.E_STATES, r.engagement.status), '')) : el('span', 'muted', '—') },
    { key: 'p', label: 'Procedure', render: r => r.procedure ? el('span', 'mono small', r.procedure.id + (r.procedure.version ? ' v' + r.procedure.version : '')) : el('span', 'muted', '—') },
    { key: 'w', label: 'Workpaper', render: r => r.workpaper ? el('span', 'mono small', `${r.workpaper.id}${r.workpaper.state === 'locked' ? ' 🔒' : ''}`) : el('span', 'muted', '—') },
    { key: 'o', label: 'Observation', render: r => id(r.observation) },
    { key: 'f', label: 'Finding', render: r => r.finding ? el('span', null, el('span', 'mono small', r.finding.id), ' ', pill(lab(M.SIGNIFICANCE, r.finding.significance), sigKind(r.finding.significance))) : el('span', 'muted', '—') },
    { key: 'r', label: 'Recommendation', render: r => el('span', 'mono small', r.recommendations.map(x => x.id).join(', ') || '—') },
    { key: 'mr', label: 'Response', render: r => el('span', 'mono small', r.responses.map(x => x.id).join(', ') || '—') },
    { key: 'fu', label: 'Follow-up', render: r => el('span', 'mono small', r.followups.map(x => `${x.id}${x.decision === 'accepted' ? ' ✓' : x.decision === 'rejected' ? ' ✗' : ''}`).join(', ') || '—') },
    { key: 'c', label: 'Closure', render: r => r.closed ? pill(typeof r.closed === 'string' ? r.closed : tr('closed'), 'good') : r.finding ? pill(lab(M.F_STATUS, r.finding.status), 'warn') : el('span', 'muted', '—') },
    { key: 'g', label: 'Breaks in the chain', render: r => { const g = M.gaps(r); return g.length ? el('span', 'small', ...g.map(x => pill(tr(x), 'warn'))) : pill('complete so far', 'good'); } }];
  body.append(el('div', 'row', { style: { alignItems: 'end', gap: '10px' } }, field(tr('Engagement'), sel),
    el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => download(`audit-trace-${today()}.csv`, toCSV([['universe', 'plan entry', 'engagement', 'procedure', 'workpaper', 'observation', 'finding', 'recommendations', 'responses', 'follow-ups', 'closure', 'breaks'],
      ...rows.map(r => [r.universe?.id || '', r.entry ? `${r.plan.id}/${r.entry.id}` : '', r.engagement?.id || '', r.procedure?.id || '', r.workpaper?.id || '', r.observation?.id || '', r.finding?.id || '',
        r.recommendations.map(x => x.id).join(' '), r.responses.map(x => x.id).join(' '), r.followups.map(x => x.id).join(' '), r.closed ? String(r.closed) : '', M.gaps(r).join('; ')])]), 'text/csv') }, 'Export .csv')));
  body.append(card(el('h2', { style: { marginTop: 0 } }, tr('Chains ({0})').replace('{0}', rows.length)),
    el('p', 'note', 'Universe → plan entry → engagement → procedure → workpaper → observation → finding → recommendation → response → follow-up → closure. One row per finding, and one per engagement without findings.'),
    rows.length ? table(cols, rows, { class: 'compact' }) : el('div', 'empty-state', tr('Nothing recorded yet.'))));
}
