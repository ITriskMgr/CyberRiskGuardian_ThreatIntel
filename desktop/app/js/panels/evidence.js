/* Evidence register — the sources the assessment relies on (book ch05–ch06, Process step 1).

   Every row is numbered E1, E2… and typed as documented, exercise or simulation, SME input or external
   evidence, with what it supports and how strong it is. Organizational facts in the assessment cite an
   E-number; anything that cannot be cited is an assumption. Exercise or simulation material is indicative
   evidence to validate, never a confirmed incident; instructor, template or benchmark values are
   calibration aids, not organizational evidence.

   The rows are assessment.EVIDENCE, the array the workbook (Evidence sheet) and the plugin read:
   [id, title, type, what it supports, strength, classification, date, custodian]. The first four columns
   are those earlier files carry; the others are added when a row is edited here.
   The shared evidence register of the management modules (Governance → Shared registers) is a different
   record: compliance evidence with periods and validity.
   © 2026 Marc-André Léger. All rights reserved. */
'use strict';
import { el, card, banner, kpi, pill, field, select, toast, table, download, toCSV, today, n0 } from '../util.js';
import { S, touch } from '../state.js';
import { tr } from '../i18n.js';
import * as MK from '../markers.js';
import * as LOG from '../logs.js';

export const HELP = {
  '': { d: 'The sources the assessment relies on, numbered E1, E2… and typed as documented, exercise, SME input or external evidence.', g: 'evidence',
    h: ['Every organizational fact in the assessment cites an E-number; anything that cannot be cited is labelled as an assumption.',
      'Exercise or simulation material (a tabletop inject, sample logs) is indicative evidence to validate, never a confirmed incident. Instructor, template or benchmark values are calibration aids, not organizational evidence.',
      'The register drives the "evidence strength" screening criterion and the confidence of each parameter.'] },
};

export const TYPES = [['documented', 'Documented'], ['exercise', 'Exercise or simulation'], ['sme', 'SME input'], ['external', 'External']];
export const STRENGTH = [['', '—'], ['strong', 'Strong'], ['moderate', 'Moderate'], ['weak', 'Weak']];
export const CLASSES = [['', '—'], ['verified', 'Verified organizational evidence'], ['external', 'External or sector evidence'], ['expert', 'Expert judgment'], ['assumption', 'Assumption'], ['unknown', 'Unknown — requires validation']];

/** The type a free-text label of an earlier file most likely means ("Documented (case)" → documented). */
export function typeOf(label) {
  const t = String(label || '').toLowerCase();
  if (TYPES.some(x => x[0] === t)) return t;
  if (/exercise|simulat|tabletop|inject|sample log/.test(t)) return 'exercise';
  if (/sme|expert|interview|workshop/.test(t)) return 'sme';
  if (/external|sector|threat|report|advisor|intel|benchmark/.test(t)) return 'external';
  if (/document|policy|case|contract|audit|architecture|annual|plan/.test(t)) return 'documented';
  return '';
}
const rows = (ws = S.ws) => (ws.assessment.EVIDENCE ||= []);
export function nextId(ws = S.ws) {
  let n = 0;
  for (const r of rows(ws)) { const m = /^E(\d+)$/.exec(r[0]); if (m) n = Math.max(n, Number(m[1])); }
  return 'E' + (n + 1);
}
/** Where each E-number is cited: scenario parameters, CVSS notes and candidate rationales. */
export function citations(ws = S.ws) {
  const out = {};
  const add = (id, where) => { (out[id] ||= new Set()).add(where); };
  const scan = (text, where) => { for (const m of String(text || '').matchAll(/\bE(\d+)\b/g)) add('E' + m[1], where); };
  for (const s of ws.assessment.SCEN || []) {
    for (const [k, p] of Object.entries(s.params || {})) { scan(p?.ev, `${s.id} ${k}`); scan(p?.rat, `${s.id} ${k}`); }
    scan(s.cvss_note, `${s.id} CVSS`); scan(s.statement, s.id);
  }
  for (const [cid, r] of Object.entries(ws.screening?.cands || {})) scan(r?.rat, cid);
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [...v]]));
}

let editing = null;

export function render(sec) {
  const ws = S.ws, R = rows(ws), cites = citations(ws);
  const byType = t => R.filter(r => typeOf(r[2]) === t).length;
  const uncited = R.filter(r => !cites[r[0]]).length;
  const unknownRefs = Object.keys(cites).filter(id => !R.some(r => r[0] === id));
  sec.replaceChildren(el('h1', null, 'Evidence register'),
    el('div', 'grid g5',
      kpi('Entries', n0(R.length), R.length ? '' : tr('none yet'), R.length ? 'good' : 'warn'),
      kpi('Documented', n0(byType('documented'))), kpi('Exercise or simulation', n0(byType('exercise')), tr('indicative — validate')),
      kpi('SME input', n0(byType('sme'))), kpi('External', n0(byType('external')))));
  if (!R.length) sec.append(banner('warn', MK.INFO_GAP, 'The assessment cites no evidence yet. Add the sources the organization supplied, or propose one entry per context document.'));
  if (unknownRefs.length) sec.append(banner('warn', 'Cited but not in the register', tr('These E-numbers are cited in the assessment but have no entry: {0}.').replace('{0}', unknownRefs.join(', '))));
  if (R.some(r => typeOf(r[2]) === 'exercise')) sec.append(el('p', 'note', 'Exercise or simulation material is indicative evidence to validate, never a confirmed incident.'));

  const t = table([
    { key: 'id', label: 'ID', render: r => el('b', null, r[0]), sort: r => Number(String(r[0]).slice(1)) || 0 },
    { key: 'title', label: 'Source', render: r => r[1] },
    { key: 'type', label: 'Type', render: r => { const k = typeOf(r[2]); return k ? pill(tr((TYPES.find(x => x[0] === k) || [])[1]), k === 'exercise' ? 'warn' : '') : el('span', 'muted', r[2] || '—'); }, sort: r => typeOf(r[2]) },
    { key: 'sup', label: 'What it supports', render: r => el('span', 'small', String(r[3] || '').slice(0, 220)) },
    { key: 'str', label: 'Strength', render: r => r[4] ? tr((STRENGTH.find(x => x[0] === r[4]) || [])[1] || r[4]) : '—', sort: r => r[4] || '' },
    { key: 'cls', label: 'Classification', render: r => r[5] ? tr((CLASSES.find(x => x[0] === r[5]) || [])[1] || r[5]) : '—' },
    { key: 'cited', label: 'Cited in', render: r => cites[r[0]] ? el('span', 'small', cites[r[0]].slice(0, 6).join(', ') + (cites[r[0]].length > 6 ? ' …' : '')) : el('span', 'muted', tr('not cited')), sort: r => (cites[r[0]] || []).length },
    { key: 'act', label: '', sortable: false, render: r => el('button', { class: 'btn xs ghost', onclick: () => { editing = r[0]; render(sec); } }, 'Edit') },
  ], R, { class: 'compact' });
  sec.append(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { flex: 1, margin: 0 } }, 'Sources'),
      el('span', 'small muted', tr('{0} not cited').replace('{0}', uncited))),
    el('div', 'tablewrap', t),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', id: 'ev-add', onclick: () => { editing = '__new'; render(sec); } }, 'Add evidence'),
      el('button', { class: 'btn ghost', id: 'ev-docs', onclick: () => fromDocs(sec) }, 'Add the context documents'),
      el('button', { class: 'btn ghost', onclick: () => download(`evidence-register-${today()}.csv`, toCSV([['ID', 'Source', 'Type', 'What it supports', 'Strength', 'Classification', 'Date', 'Custodian', 'Cited in'], ...R.map(r => [r[0], r[1], r[2], r[3], r[4] || '', r[5] || '', r[6] || '', r[7] || '', (cites[r[0]] || []).join('; ')])]), 'text/csv') }, 'Export (.csv)'))));
  if (editing) sec.append(editor(sec));
}

function editor(sec) {
  const ws = S.ws, R = rows(ws), isNew = editing === '__new';
  const r = isNew ? [nextId(ws), '', 'Documented', '', '', '', today(), ''] : R.find(x => x[0] === editing);
  if (!r) { editing = null; return null; }
  const id = el('input', { value: r[0], id: 'ev-id' }), title = el('input', { value: r[1] || '', id: 'ev-title' });
  const typeSel = select([['', 'Choose…'], ...TYPES], typeOf(r[2])); typeSel.id = 'ev-type';
  const sup = el('textarea', { rows: 3, id: 'ev-sup' }); sup.value = r[3] || '';
  const str = select(STRENGTH, r[4] || ''); const cls = select(CLASSES, r[5] || '');
  const date = el('input', { type: 'date', value: r[6] || '' }), cust = el('input', { value: r[7] || '' });
  const save = () => {
    const nid = id.value.trim();
    if (!/^E\d+$/.test(nid)) { toast(tr('An evidence ID reads E1, E2, …'), 'bad'); return; }
    if (R.some(x => x[0] === nid && x !== r)) { toast(tr('That ID is already used'), 'bad'); return; }
    if (!title.value.trim()) { toast(tr('Give the source a title'), 'bad'); return; }
    const label = (TYPES.find(x => x[0] === typeSel.value) || [null, r[2]])[1];
    const row = [nid, title.value.trim(), label, sup.value.trim(), str.value, cls.value, date.value, cust.value.trim()];
    if (isNew) R.push(row); else R.splice(R.indexOf(r), 1, row);
    LOG.data(isNew ? 'evidence added' : 'evidence edited', nid, '', ws.name);
    editing = null; touch(); toast(tr('Saved {0}').replace('{0}', nid)); render(sec);
  };
  return card({ class: 'card', id: 'ev-editor' }, el('h2', null, isNew ? 'New evidence' : tr('Edit {0}').replace('{0}', r[0])),
    el('div', 'grid g3', field('<b>ID</b>', id), field('<b>Source</b>', title), field('<b>Type</b>', typeSel),
      field('Strength', str), field('Classification', cls), field('Date', date), field('Custodian', cust)),
    field('What it supports', sup),
    el('div', 'btnrow', el('button', { class: 'btn', id: 'ev-save', onclick: save }, 'Save'),
      el('button', { class: 'btn ghost', onclick: () => { editing = null; render(sec); } }, 'Cancel'),
      !isNew ? el('button', { class: 'btn ghost danger', onclick: () => { if (!window.confirm(tr('Delete {0}?').replace('{0}', r[0]))) return; R.splice(R.indexOf(r), 1); LOG.data('evidence deleted', r[0], '', ws.name); editing = null; touch(); render(sec); } }, 'Delete') : null));
}

function fromDocs(sec) {
  const ws = S.ws, R = rows(ws);
  const have = new Set(R.map(r => String(r[1]).toLowerCase()));
  let n = 0;
  for (const d of ws.docs || []) {
    const name = d.name || d.title || '';
    if (!name || have.has(name.toLowerCase())) continue;
    R.push([nextId(ws), name, 'Documented', MK.INFO_GAP + ' — ' + tr('state what this document supports'), '', 'verified', d.added || today(), '']);
    n++;
  }
  if (n) { LOG.data('evidence added', `${n} document(s)`, '', ws.name); touch(); }
  toast(n ? tr('{0} document(s) added to the register').replace('{0}', n) : tr('Every context document is already in the register'), n ? 'good' : 'warn');
  render(sec);
}
