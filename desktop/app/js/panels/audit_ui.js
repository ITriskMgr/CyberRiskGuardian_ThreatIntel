/* Audit management — small interface helpers shared by the audit_*.js screens.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, toast } from '../util.js';
import { S, touch } from '../state.js';
import * as G from '../grcui.js';
import * as users from '../users.js';
import * as LOG from '../logs.js';
import { tr } from '../i18n.js';

/** The signed-in person (multi-user mode), or '' — single-user mode names people as typed. */
export const who = () => users.name() || '';
/** A label from a [[value, label]] list, translated. */
export const lab = (list, v) => tr((list.find(x => x[0] === v) || [v, v || '—'])[1] || '—');
export const short = h => h ? h.slice(0, 12) + '…' : '—';
export const dn = s => el('span', { 'data-noi18n': '' }, s == null || s === '' ? '—' : String(s));

/** Rule 10: independence by name only in single-user mode. */
export function indep() {
  if (users.active()) return document.createTextNode('');
  return banner('warn', 'Independence cannot be verified in single-user mode',
    'Names are compared as typed: the application refuses the same name as preparer and reviewer, action owner and verifier, or requester and approver, but it cannot know who is at the keyboard. Turn on multi-user mode (Settings → Users & RACI) to record signed-in names.');
}
/** In multi-user mode an approval or an issue needs the Approve right (RACI "A") on the reporting step. */
export function approveGuard() {
  if (!users.active()) return null;
  try { users.requireApprove('report'); return null; } catch (e) { return e.message; }
}

/**
 * A dialog for an action: fields, a working record, and act(values) → error message or null.
 * The action runs only when it returns null; then the screen is redrawn.
 */
export function ask(title, fields, rec, act, redraw, note) {
  return G.edit(title, fields, rec, { note, validate: next => { const bad = act(next); if (!bad) touch(); return bad; }, onSave: () => redraw?.() });
}
/** Record an approval-type event in the installation's data log as well. */
export const logData = (action, target, detail) => LOG.data(action, target, detail || '', S.ws?.name || '');

/**
 * A list card like G.register, where saving goes through the model (onSave returns an error or null).
 * spec: { title, rows, columns, fields(rec), blank(), onSave(rec, isNew), note, actions(row), canEdit(row), prefix, empty }
 */
export function listCard(spec) {
  const open = (rec, isNew) => {
    const ro = spec.canEdit && !isNew && !spec.canEdit(rec);
    const fields = spec.fields(rec).map(f => ro ? { ...f, disabled: true } : f);
    G.edit(spec.title, fields, isNew ? rec : { ...rec }, { note: ro ? spec.lockedNote : spec.formNote,
      validate: next => {
        if (ro) return spec.lockedNote || 'This record is locked.';
        const cand = isNew ? next : { ...rec, ...next };
        const bad = spec.check ? spec.check(cand, isNew) : null;
        if (bad) return bad;
        if (!isNew) Object.assign(rec, next);
        return spec.onSave(isNew ? next : rec, isNew) || null;
      },
      onSave: () => { touch(); spec.redraw?.(); } });
  };
  const cols = [...spec.columns, { key: '_', label: '', sortable: false, render: r => el('div', 'btnrow', ...(spec.actions ? spec.actions(r) : []), el('button', { class: 'btn sm ghost', onclick: () => open(r, false) }, 'Open')) }];
  return card(
    el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, `${tr(spec.title)} (${spec.rows.length})`),
      ...(spec.extra || []),
      spec.blank ? el('button', { class: 'btn sm', onclick: () => open({ ...(spec.blank()) }, true) }, spec.addLabel || 'Add') : null),
    spec.note ? el('p', 'note', tr(spec.note)) : null,
    spec.rows.length ? table(cols, spec.rows, { class: 'compact' }) : el('div', 'empty-state', tr(spec.empty || 'Nothing recorded yet.')));
}
/** A select field of records. */
export const recSelect = (key, label, rows, fmt = r => `${r.id} ${r.title || r.name || ''}`, blank = true) => ({ key, label, type: 'select', options: [...(blank ? [['', '—']] : []), ...rows.map(r => [r.id, fmt(r)])] });
export { el, card, pill, banner, table, toast, tr };
