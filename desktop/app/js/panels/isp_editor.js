/* ISP management — the structured policy editor: header, clauses, statements (stable identifier,
   modality, guideline flag, clause, controls, training), and a side-by-side comparison of two
   versions. A frozen (approved or published) version is shown read-only.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, chip, toast, banner, table, field, select, download } from '../util.js';
import { S, touch } from '../state.js';
import * as P from '../isp.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';
import { C, byName, statePill, stLabel, modLabel, noi, indepBanner, policyPick } from './isp_common.js';
import { lifecycle } from './isp_reviews.js';

const cmp = { a: '', b: '' };

export function policyTab(body) {
  const ws = S.ws, I = P.isp(ws);
  const p = I.policies.find(x => x.id === C.polId) || I.policies[0];
  if (!p) { body.append(el('div', 'empty-state', el('b', null, 'No policy yet'), 'Create one in the Policy library.')); return; }
  if (C.polId !== p.id) { cmp.a = cmp.b = ''; }
  C.polId = p.id;
  const ed = P.editable(p);
  const ch = () => touch('isp');
  const inp = (k, attrs = {}) => { const i = el(attrs.rows ? 'textarea' : 'input', { ...attrs, disabled: !ed, 'data-noi18n': '' }); i.value = p[k] ?? ''; i.addEventListener('input', () => { p[k] = attrs.type === 'number' ? Number(i.value) : i.value; ch(); }); return i; };
  const meta = (k, attrs = {}) => { const i = el('input', { ...attrs, 'data-noi18n': '' }); i.value = p[k] ?? ''; i.addEventListener('input', () => { p[k] = attrs.type === 'number' ? Number(i.value) : i.value; ch(); }); return i; };
  const type = select(P.TYPES, p.type); type.disabled = !ed; type.addEventListener('change', () => { p.type = type.value; if (p.type === 'guideline') for (const s of p.statements) Object.assign(s, P.normStatement({ ...s, guideline: true }, p)); ch(); C.redraw(); });
  const fam = select([['', '—'], ...I.families.map(f => [f.id, f.name || f.id])], p.family || ''); fam.disabled = !ed; fam.setAttribute('data-noi18n', ''); fam.addEventListener('change', () => { p.family = fam.value; ch(); });
  const v = P.inForce(p);
  body.append(card(el('div', 'row', { style: { alignItems: 'center', gap: '8px' } }, el('div', { style: { flex: 1 } }, policyPick(I, p.id, id => C.go('policy', id))), statePill(p.status), pill('v' + p.version, ''),
      v && v.version !== p.version ? pill(tr('v{0} in force').replace('{0}', v.version), 'good') : null, P.overdue(p) ? pill('review overdue', 'bad') : null),
    !ed ? banner('good', p.status === 'retired' ? 'Retired' : p.status === 'superseded' ? 'Superseded' : 'Frozen text', p.status === 'retired' ? 'This policy is no longer in force. Reinstating it starts a new version.'
      : p.status === 'superseded' ? 'Another policy replaced this one. Its versions stay readable.' : 'An approved or published version is frozen with the SHA-256 hash of its content and is never edited. “Start a new version” opens a draft; the frozen versions stay readable and comparable.') : null,
    p.status === 'review' ? banner('warn', 'Under review', 'Any change made now is part of what the approver freezes. Approval hashes the content as it is at that moment.') : null,
    el('div', 'grid g3', field('<b>Title</b>', inp('title')), field('Type', type), field('Policy family', fam)),
    el('div', 'grid g4', field('Domain', inp('domain')), field('Owner', meta('owner', { placeholder: 'role or person' })), field('Sponsor', meta('sponsor', { placeholder: 'role or person' })), field('Approver', meta('approver', { placeholder: 'role or person' }))),
    el('div', 'grid g3', field('Review every (months)', meta('reviewMonths', { type: 'number', min: 1, max: 60 })),
      field('Next review', (() => { const i = el('input', { type: 'date', value: P.reviewDate(p) || p.nextReview || '' }); i.addEventListener('change', () => { p.nextReview = i.value; const f = P.inForce(p); if (f) f.nextReview = i.value; ch(); }); return i; })()),
      el('div', null, el('div', 'small muted', 'Author of this version'), noi(p.author || '—', 'b'))),
    field('Purpose', inp('purpose', { rows: 2 })), field('Scope', inp('scope', { rows: 2 })),
    el('div', 'btnrow', { style: { marginTop: '8px' } }, ...lifecycle(p),
      el('button', { class: 'btn ghost', onclick: () => download(`${p.id}-${p.title.replace(/[^\w]+/g, '-')}-v${p.version}.md`, P.toMarkdown(p, ws), 'text/markdown') }, 'Download (.md)'),
      ed ? el('button', { class: 'btn ghost', onclick: async () => { const { draftWithAI } = await import('./isp.js'); draftWithAI(null, p); } }, 'Improve with AI…') : null,
      el('button', { class: 'btn ghost', onclick: () => C.go('reviews') }, 'Versions & approvals'),
      p.status === 'draft' && !p.versions.length ? el('button', { class: 'btn ghost danger', onclick: () => { if (!window.confirm(tr('Delete this draft policy?'))) return; I.policies.splice(I.policies.indexOf(p), 1); touch('isp'); C.polId = null; C.go('policies'); } }, 'Delete the draft') : null)));
  if (p.status === 'review' || p.status === 'approved') body.append(indepBanner() || '');
  // clauses
  const clauseOpts = () => [['', '—'], ...p.clauses.map(c => [c.id, `${c.id} ${c.heading || ''}`])];
  body.append(card(el('h2', { style: { marginTop: 0 } }, `${tr('Clauses')} (${p.clauses.length})`),
    el('p', 'note', 'Clauses are the sections of the document (CRGO policy clause). Statements can be placed in a clause.'),
    ...p.clauses.map((c, i) => {
      const h = el('input', { value: c.heading, disabled: !ed, 'data-noi18n': '', placeholder: 'Heading' }); h.addEventListener('input', () => { c.heading = h.value; ch(); });
      const t = el('textarea', { rows: 2, disabled: !ed, 'data-noi18n': '' }); t.value = c.text || ''; t.addEventListener('input', () => { c.text = t.value; ch(); });
      return el('div', 'docrow', el('div', { style: { flex: 1 } }, el('b', 'mono', c.id), h, t),
        ed ? el('div', 'btnrow', el('button', { class: 'btn sm ghost', disabled: i === 0, onclick: () => { p.clauses.splice(i - 1, 0, p.clauses.splice(i, 1)[0]); ch(); C.redraw(); } }, '↑'),
          el('button', { class: 'btn sm ghost danger', onclick: () => { p.clauses.splice(i, 1); for (const s of p.statements) if (s.clause === c.id) s.clause = ''; ch(); C.redraw(); } }, 'Remove')) : null);
    }),
    ed ? el('button', { class: 'btn ghost sm', onclick: () => { P.addClause(p, { heading: '' }); C.redraw(); } }, 'Add a clause') : null));
  // statements
  const trn = I.training;
  const sbody = el('div');
  sbody.append(...p.statements.map((s, i) => {
    const ta = el('textarea', { rows: 2, disabled: !ed, 'data-noi18n': '' }); ta.value = s.text; ta.addEventListener('input', () => { s.text = ta.value; ch(); });
    const refs = el('input', { value: (s.refs || []).join(', '), disabled: !ed, placeholder: 'ISO22:5.15, CSF2:PR.AA-05', class: 'mono' });
    refs.addEventListener('change', () => { s.refs = refs.value.split(/\s*,\s*/).filter(Boolean); ch(); });
    const mod = select(s.guideline ? P.MODALITY.filter(m => !P.BINDING.has(m[0])) : P.MODALITY, s.modality); mod.disabled = !ed; mod.addEventListener('change', () => { s.modality = mod.value; ch(); });
    const gl = el('input', { type: 'checkbox', checked: !!s.guideline, disabled: !ed || p.type === 'guideline', style: { width: 'auto' } });
    gl.addEventListener('change', () => { s.guideline = gl.checked; if (s.guideline && P.BINDING.has(s.modality)) s.modality = 'should'; ch(); C.redraw(); });
    const cl = select(clauseOpts(), s.clause || ''); cl.disabled = !ed; cl.setAttribute('data-noi18n', ''); cl.addEventListener('change', () => { s.clause = cl.value; ch(); });
    const tset = new Set(s.training || []);
    const tr8 = trn.length ? el('div', 'chips', ...trn.map(t => { const c = el('input', { type: 'checkbox', checked: tset.has(t.id), disabled: !ed, style: { width: 'auto' } });
      c.addEventListener('change', () => { if (c.checked) tset.add(t.id); else tset.delete(t.id); s.training = [...tset]; ch(); }); return el('label', { class: 'chip', style: { gap: '4px' } }, c, noi(t.id + ' ' + (t.title || ''))); })) : el('span', 'small muted', 'No training requirement yet (Acknowledgements & training).');
    return el('div', 'docrow', { 'data-stmt': s.id }, el('div', { style: { flex: 1 } },
      el('div', 'row', { style: { alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }, el('b', 'mono', s.id), field('Modality', mod), field('Clause', cl),
        el('label', { style: { display: 'flex', gap: '4px', alignItems: 'center' } }, gl, el('span', null, 'Guideline (never binding)')),
        s.guideline ? pill('not binding', '') : P.BINDING.has(s.modality) ? pill('binding', 'warn') : null),
      ta, el('div', 'small muted', 'Controls (implemented by)'), refs, el('div', 'small muted', 'Training required'), tr8),
      ed ? el('div', 'btnrow', el('button', { class: 'btn sm ghost', disabled: i === 0, onclick: () => { p.statements.splice(i - 1, 0, p.statements.splice(i, 1)[0]); ch(); C.redraw(); } }, '↑'),
        el('button', { class: 'btn sm ghost danger', onclick: () => { p.statements.splice(i, 1); ch(); C.redraw(); } }, 'Remove')) : null);
  }));
  const sc = P.scenariosFor(p, ws);
  body.append(card(el('h2', { style: { marginTop: 0 } }, `${tr('Policy statements')} (${p.statements.length})`),
    el('p', 'note', 'Each statement keeps its identifier across versions. A mapping to a control shows traceability; it is not evidence of compliance.'),
    sbody,
    ed ? el('button', { class: 'btn ghost sm', onclick: () => { P.addStatement(p, { text: '' }); C.redraw(); } }, 'Add a statement') : null,
    field('Details (optional — roles, definitions, procedures)', inp('body', { rows: 5 })),
    el('h4', null, 'Scenarios of the register this policy addresses'),
    sc.length ? el('div', 'chips', ...sc.map(id => chip(id, { href: '#/scenario/' + id }))) : el('div', 'small muted', 'None found: a scenario is linked when its ontology controls or its measures share a control with a statement.')));
  body.append(compareCard(p));
}

/* ---------------- comparison ---------------- */
const SEG = { '-': { background: 'rgba(220,38,38,.18)', textDecoration: 'line-through' }, '+': { background: 'rgba(22,163,74,.22)' } };
function words(ops, side) {
  return el('span', { 'data-noi18n': '' }, ...ops.filter(([op]) => op === '=' || (side === 'a' ? op === '-' : op === '+')).map(([op, t]) => op === '=' ? t : el(side === 'a' ? 'del' : 'ins', { style: SEG[op] }, t)));
}
function compareCard(p) {
  const list = P.comparable(p);
  const c = card(el('h2', { style: { marginTop: 0 } }, 'Compare two versions'));
  if (list.length < 2) { c.append(el('div', 'small muted', 'Comparison needs two versions: approve a version, then start a new one.')); return c; }
  if (!list.some(x => x.key === cmp.a)) cmp.a = list.at(-2).key;
  if (!list.some(x => x.key === cmp.b)) cmp.b = list.at(-1).key;
  const sa = select(list.map(x => [x.key, x.label]), cmp.a), sb = select(list.map(x => [x.key, x.label]), cmp.b);
  sa.id = 'isp-cmp-a'; sb.id = 'isp-cmp-b';
  sa.addEventListener('change', () => { cmp.a = sa.value; C.redraw(); }); sb.addEventListener('change', () => { cmp.b = sb.value; C.redraw(); });
  const A = list.find(x => x.key === cmp.a), B = list.find(x => x.key === cmp.b);
  const d = P.diff(A.content, B.content);
  const kindPill = k => pill(tr({ added: 'Added', removed: 'Removed', changed: 'Changed', same: 'Unchanged' }[k]), { added: 'good', removed: 'bad', changed: 'warn', same: '' }[k]);
  const sText = s => s ? el('div', null, el('div', 'small muted', `${modLabel(s.modality)}${s.guideline ? ' · ' + tr('guideline') : ''}${s.clause ? ' · ' + s.clause : ''}${s.refs?.length ? ' · ' + s.refs.join(', ') : ''}`)) : null;
  const cell = (r, side) => {
    const x = side === 'a' ? r.a : r.b; if (!x) return el('span', 'muted', '—');
    const t = r.kind === 'changed' && r.changes.includes('text') ? words(P.wordDiff(r.a.text, r.b.text), side) : noi(x.text);
    return el('div', null, t, sText(x));
  };
  c.append(el('div', 'grid g2', field('Version A (before)', sa), field('Version B (after)', sb)),
    el('div', 'small', { style: { margin: '6px 0' } }, tr('{0} added · {1} removed · {2} changed · {3} unchanged').replace('{0}', d.summary.added).replace('{1}', d.summary.removed).replace('{2}', d.summary.changed).replace('{3}', d.summary.same),
      A.hash ? el('span', 'muted mono', ` · A ${A.hash.slice(0, 12)}…`) : '', B.hash ? el('span', 'muted mono', ` · B ${B.hash.slice(0, 12)}…`) : ''),
    d.fields.length ? el('div', 'tablewrap', table([{ key: 'key', label: 'Field', render: f => tr({ title: 'Title', type: 'Type', family: 'Policy family', purpose: 'Purpose', scope: 'Scope', body: 'Details' }[f.key]) },
      { key: 'a', label: 'Version A', render: f => words(P.wordDiff(f.a, f.b), 'a') }, { key: 'b', label: 'Version B', render: f => words(P.wordDiff(f.a, f.b), 'b') }], d.fields, { class: 'compact isp-diff' })) : null,
    d.clauses.some(x => x.kind !== 'same') ? el('div', 'tablewrap', table([{ key: 'id', label: 'Clause', cls: 'mono' }, { key: 'k', label: '', render: r => kindPill(r.kind) },
      { key: 'a', label: 'Version A', render: r => r.a ? noi(`${r.a.heading}${r.a.text ? ' — ' + r.a.text : ''}`) : '—' }, { key: 'b', label: 'Version B', render: r => r.b ? noi(`${r.b.heading}${r.b.text ? ' — ' + r.b.text : ''}`) : '—' }],
      d.clauses.filter(x => x.kind !== 'same'), { class: 'compact isp-diff' })) : null,
    el('div', 'tablewrap', table([{ key: 'id', label: 'Statement', cls: 'mono' }, { key: 'k', label: '', render: r => kindPill(r.kind) },
      { key: 'a', label: 'Version A', render: r => cell(r, 'a') }, { key: 'b', label: 'Version B', render: r => cell(r, 'b') }],
      d.statements.filter(x => x.kind !== 'same'), { class: 'compact isp-diff' })),
    d.summary.same ? el('div', 'small muted', tr('{0} unchanged statements are not shown.').replace('{0}', d.summary.same)) : null);
  return c;
}
