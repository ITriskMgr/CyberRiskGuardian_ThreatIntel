/* ISP management — what the tabs of the screen share: the selected tab and policy, the redraw hook,
   who is acting, the approval right and the independence warning.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, banner, pill, select } from '../util.js';
import * as P from '../isp.js';
import * as users from '../users.js';

export const C = { view: 'overview', polId: null, sec: null, redraw: () => {}, go: () => {} };
export const byName = () => users.name() || '';
export const canApprove = () => !users.active() || !!users.me()?.admin || users.can('approve', 'report');
export const stLabel = s => P.VSTATE.find(x => x[0] === s)?.[1] || s;
export const statePill = s => pill(stLabel(s), P.STATUS_KIND[s]);
export const modLabel = m => P.MODALITY.find(x => x[0] === m)?.[1] || m;
export const short = h => h ? h.slice(0, 12) + '…' : '—';
export const noi = (t, tag = 'span') => el(tag, { 'data-noi18n': '' }, t ?? '—');
/** The single-user warning wherever independence is required. */
export const indepBanner = () => users.active() ? null
  : banner('warn', 'Independence cannot be verified in single-user mode', 'The approver of a version must not be its author or the person who submitted it. In single-user mode the application compares the names typed; switch on multi-user mode (Settings → Users & RACI) to record who is signed in.');
/** A policy picker; onPick(id). */
export function policyPick(I, value, onPick, { empty = '' } = {}) {
  const s = select([...(empty ? [['', empty]] : []), ...I.policies.map(p => [p.id, `${p.id} — ${p.title}`])], value || '');
  s.setAttribute('data-noi18n', '');
  s.addEventListener('change', () => onPick(s.value));
  return s;
}
/** A datalist of the names already known (users, assignees, acknowledgements). */
export function peopleList(I, id = 'isp-people') {
  const names = new Set([...users.U.users.map(u => u.name), ...I.assignments.flatMap(a => a.kind === 'group' ? a.members : [a.subject]), ...I.acks.map(a => a.person), ...I.completions.map(c => c.person)].filter(Boolean));
  return el('datalist', { id }, ...[...names].sort().map(n => el('option', { value: n })));
}
