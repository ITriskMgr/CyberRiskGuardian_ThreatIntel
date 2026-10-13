/* grcui.js — one register component for the governance, audit and management modules (1.5.8).

   A register is a list of records shown as a table, each opened in a form. Field kinds: text, area
   (long text), date, number, select (options [[value, label]]), multi (a list of values from options),
   list (free values, one per line), check. Labels and option texts are interface strings (translated);
   record content is the organization's data (never translated, marked data-noi18n).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, table, field, select, toast, today, modal, pill, download, toCSV } from './util.js';
import { touch } from './state.js';
import { tr } from './i18n.js';

/** Next identifier with a prefix, e.g. ENG-003. */
export const nextId = (rows, prefix) => prefix + '-' + String(rows.reduce((m, r) => Math.max(m, Number(String(r.id || '').split('-').pop()) || 0), 0) + 1).padStart(3, '0');

/** An input for one field definition; returns { node, get }. */
export function input(f, value) {
  if (f.encode) { const r = input({ ...f, encode: null }, f.encode(value)); return { node: r.node, get: () => f.decode(r.get()) }; }
  let node, get;
  if (f.type === 'area') { node = el('textarea', { rows: f.rows || 3, 'data-noi18n': '' }); node.value = value ?? ''; get = () => node.value; }
  else if (f.type === 'select') { node = select(f.options.map(([v, t]) => [v, tr(t)]), value ?? f.options[0]?.[0] ?? ''); get = () => node.value; }
  else if (f.type === 'multi') {
    const set = new Set(value || []);
    node = el('div', 'chips', ...f.options.map(([v, t]) => { const c = el('input', { type: 'checkbox', checked: set.has(v), style: { width: 'auto' } });
      c.addEventListener('change', () => { if (c.checked) set.add(v); else set.delete(v); }); return el('label', { class: 'chip', style: { gap: '4px' } }, c, el('span', null, tr(t))); }));
    get = () => f.options.map(o => o[0]).filter(v => set.has(v));
  }
  else if (f.type === 'list') { node = el('textarea', { rows: f.rows || 3, 'data-noi18n': '', placeholder: tr('One per line') }); node.value = (value || []).join('\n'); get = () => node.value.split('\n').map(s => s.trim()).filter(Boolean); }
  else if (f.type === 'check') { node = el('input', { type: 'checkbox', checked: !!value, style: { width: 'auto' } }); get = () => node.checked; }
  else { node = el('input', { type: f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text', 'data-noi18n': '', step: f.step || 'any', placeholder: f.placeholder ? tr(f.placeholder) : '' }); node.value = value ?? ''; get = () => f.type === 'number' ? (node.value === '' ? null : Number(node.value)) : node.value; }
  if (f.disabled) node.disabled = true;
  return { node, get };
}

/** Open one record in a modal form; onSave(record) after validation. */
export function edit(title, fields, rec, { onSave, onDelete, validate, note } = {}) {
  const ins = fields.filter(f => !f.hidden).map(f => [f, input(f, rec[f.key])]);
  const msg = el('div');
  const m = modal(tr(title),
    note ? el('p', 'note', tr(note)) : null,
    el('div', 'grid g2', ...ins.map(([f, i]) => { const d = field(tr(f.label), i.node, f.hint ? tr(f.hint) : null); if (f.wide || f.type === 'area' || f.type === 'multi' || f.type === 'list') d.style.gridColumn = '1 / -1'; return d; })),
    msg,
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', onclick: () => {
        const next = { ...rec }; for (const [f, i] of ins) next[f.key] = i.get();
        const bad = validate ? validate(next) : null;
        if (bad) { msg.replaceChildren(el('div', 'banner bad', tr(bad))); return; }
        Object.assign(rec, next); m.close(); onSave?.(rec);
      } }, 'Save'),
      onDelete ? el('button', { class: 'btn ghost danger', onclick: () => { if (window.confirm(tr('Delete this record?'))) { m.close(); onDelete(rec); } } }, 'Delete') : null,
      el('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancel')));
  return m;
}

/**
 * A register card: title, a table of rows, "Add", open a row to edit it, CSV export.
 * spec: { title, rows (the live array), fields, columns, prefix, blank(), redraw(), note, validate, actions(row), csv }
 */
export function register(spec) {
  const { rows } = spec;
  const save = rec => { if (!rows.includes(rec)) rows.push(rec); touch(); spec.redraw?.(); };
  const del = rec => { const i = rows.indexOf(rec); if (i >= 0) rows.splice(i, 1); touch(); spec.redraw?.(); };
  const open = rec => edit(spec.title, spec.fields, rec, { onSave: save, onDelete: rows.includes(rec) ? del : null, validate: spec.validate, note: spec.formNote });
  const cols = spec.columns.map(c => typeof c === 'string' ? { key: c, label: spec.fields.find(f => f.key === c)?.label || c, render: r => labelOf(spec.fields.find(f => f.key === c), r[c]) } : c);
  cols.push({ key: '_', label: '', sortable: false, render: r => el('div', 'btnrow', ...(spec.actions ? spec.actions(r) : []), el('button', { class: 'btn sm ghost', onclick: () => open(r) }, 'Open')) });
  return card(
    el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, `${tr(spec.title)} (${rows.length})`),
      spec.csv !== false && rows.length ? el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => download(`${spec.prefix.toLowerCase()}-${today()}.csv`, toCSV([spec.fields.map(f => f.key), ...rows.map(r => spec.fields.map(f => Array.isArray(r[f.key]) ? r[f.key].join('; ') : r[f.key] ?? ''))]), 'text/csv') }, '.csv') : null,
      el('button', { class: 'btn sm', onclick: () => open({ id: nextId(rows, spec.prefix), ...(spec.blank ? spec.blank() : {}) }) }, 'Add')),
    spec.note ? el('p', 'note', tr(spec.note)) : null,
    rows.length ? el('div', 'tablewrap', table(cols, rows, { class: 'compact' })) : el('div', 'empty-state', tr(spec.empty || 'Nothing recorded yet.')));
}

/** The label of a value for a select field, or the value itself (organization data). */
export function labelOf(f, v) {
  if (v == null || v === '') return '—';
  if (f?.encode) v = f.encode(v);
  if (f?.type === 'select') { const o = f.options.find(x => x[0] === v); return o ? tr(o[1]) : el('span', { 'data-noi18n': '' }, String(v)); }
  if (f?.type === 'multi') return (v || []).map(x => tr(f.options.find(o => o[0] === x)?.[1] || x)).join(', ');
  if (Array.isArray(v)) return el('span', { 'data-noi18n': '' }, v.join('; '));
  if (f?.type === 'check') return v ? '✓' : '';
  return el('span', { 'data-noi18n': '' }, String(v));
}

/** Knowledge status of a record (CRGO epistemic status), as a pill. */
export const KS = [['organisational-observation', 'Organisational observation'], ['reference-fact', 'Reference fact'], ['analytical-hypothesis', 'Analytical hypothesis'],
  ['risk-estimate', 'Risk estimate'], ['audit-conclusion', 'Audit conclusion'], ['management-decision', 'Management decision'], ['verified-outcome', 'Verified outcome'], ['assumption', 'Assumption']];
export const ksPill = k => k ? pill(tr(KS.find(x => x[0] === k)?.[1] || k), k === 'verified-outcome' || k === 'audit-conclusion' ? 'good' : k === 'assumption' || k === 'analytical-hypothesis' ? 'warn' : '') : '';
