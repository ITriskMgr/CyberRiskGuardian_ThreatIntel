/* proposalpanel.js — the review panel for proposed families (1.9.3). Shared by the ontology grouping (W2, ② Screen →
   Group with the ontology) and the AI family proposals (W3): the same pattern, nothing changes until the analyst accepts.

   reviewPanel({ id, title, lede, source, items, onAccept, onReject, onAcceptAll, empty }) → an element.
     items       [{ key, kind: 'family'|'unique'|'own', name, statement, members: [{ id, name, note? }], note?, badges?: [text],
                    blocked?: 'reason' (acceptance refused, shown), done?: 'text' (already applied), editable?: false }]
     source      a node (or null) shown in the header line: where the proposals come from (MCP server / snapshot, CRGO release, …)
     onAccept(item, { name, statement, members: [ids] }) → null on success, or a message (shown, the proposal stays)
     onReject(item)            the proposal is dropped from the panel (the caller decides whether to remember it)
   Per proposal: Accept (as proposed), Edit (name, statement, members to keep) then Accept, Reject. Nothing is written here.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, toast, field, chip } from './util.js';
import { tr } from './i18n.js';

const KIND = { family: 'Family', unique: 'Unique candidate', own: 'Own scenario — theme gap',
  move: 'Move suggestion', rename: 'Rename suggestion', tick: 'Coverage tick', gap: 'New candidate — coverage gap', info: 'Not proposed' };

export function reviewPanel({ id = 'proposal-panel', title, lede = null, source = null, items = [], onAccept, onReject, onAcceptAll = null, empty = 'Nothing to review.' }) {
  const box = el('div', { class: 'card prop-panel', id });
  const state = { items: items.slice() };
  const draw = () => {
    box.replaceChildren(el('div', { class: 'row', style: { alignItems: 'center' } }, el('h2', { style: { flex: 1, margin: 0 } }, title),
        state.items.some(i => !i.blocked && !i.done) && onAcceptAll ? el('button', { class: 'btn sm', id: id + '-accept-all', onclick: () => acceptAll() }, tr('Accept all that can be accepted')) : null),
      source ? el('div', { class: 'small prop-source' }, source) : null,
      lede ? el('p', 'note', lede) : null,
      state.items.length ? el('div', { class: 'prop-list' }, ...state.items.map(row)) : el('p', 'small muted', tr(empty)));
  };
  const drop = it => { state.items = state.items.filter(x => x !== it); draw(); };
  const accept = (it, edits) => {
    const r = onAccept(it, edits || { name: it.name, statement: it.statement, members: it.members.map(m => m.id) });
    if (r) { toast(tr(r), 'bad'); return false; }
    drop(it); return true;
  };
  const acceptAll = () => { let n = 0; for (const it of state.items.slice()) if (!it.blocked && !it.done && accept(it)) n++; if (n) toast(tr('{0} proposal(s) accepted').replace('{0}', n)); };
  const row = it => {
    const mem = el('div', { class: 'small' }, ...it.members.map(m => chip(m.id, { title: [m.name, m.note].filter(Boolean).join(' — ') })));
    const edit = el('div', { class: 'prop-edit', hidden: true });
    const name = el('input', { value: it.name || '', 'aria-label': tr('Name of the family') }), stm = el('textarea', { rows: 3, 'aria-label': tr('Consolidated statement') });
    stm.value = it.statement || '';
    const keep = new Set(it.members.map(m => m.id));
    const boxes = el('div', { class: 'chips' }, ...it.members.map(m => {
      const cb = el('input', { type: 'checkbox', checked: true, style: { width: 'auto', margin: 0 }, 'data-member': m.id }); cb.addEventListener('change', () => { cb.checked ? keep.add(m.id) : keep.delete(m.id); });
      return el('label', { class: 'chip', style: { cursor: 'pointer' } }, cb, ' ', m.id, ' ', el('span', { class: 'muted', 'data-noi18n': '' }, String(m.name || '').slice(0, 50)));
    }));
    edit.append(field('Name of the family', name), field('Consolidated statement (the stronger causal statement that represents the family)', stm),
      it.kind === 'family' ? field('Members to keep', boxes) : null,
      el('div', { class: 'btnrow' }, el('button', { class: 'btn sm', 'data-act': 'accept-edited', onclick: () => {
          const ids = it.members.map(m => m.id).filter(i => keep.has(i));
          if (it.kind === 'family' && ids.length < 2) { toast(tr('A family needs at least two members; reject it or keep two.'), 'bad'); return; }
          accept(it, { name: name.value, statement: stm.value, members: ids }); } }, tr('Accept as edited')),
        el('button', { class: 'btn sm ghost', onclick: () => { edit.hidden = true; } }, tr('Cancel'))));
    return el('div', { class: 'prop-item', 'data-key': it.key, 'data-kind': it.kind },
      el('div', { class: 'row', style: { alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
        pill(tr(KIND[it.kind] || it.kind), it.kind === 'own' ? 'warn' : it.kind === 'family' ? 'good' : ''),
        el('b', { 'data-noi18n': '' }, String(it.name || it.key).slice(0, 120)),
        ...(it.badges || []).map(b => pill(tr(b), '')),
        it.done ? pill(tr(it.done), 'good') : null),
      it.statement ? el('div', { class: 'small', 'data-noi18n': '' }, String(it.statement).slice(0, 320)) : null,
      mem, it.note ? el('div', { class: 'small muted' }, it.note) : null, it.extra || null,
      it.blocked ? el('div', { class: 'small prop-blocked' }, pill(tr('cannot be accepted'), 'bad'), ' ', tr(it.blocked)) : null,
      it.done ? null : el('div', { class: 'btnrow', style: { marginTop: '6px' } },
        el('button', { class: 'btn sm', 'data-act': 'accept', disabled: !!it.blocked, onclick: () => accept(it) }, tr('Accept')),
        el('button', { class: 'btn sm ghost', 'data-act': 'edit', disabled: !!it.blocked || it.editable === false, onclick: () => { edit.hidden = !edit.hidden; } }, tr('Edit')),
        el('button', { class: 'btn sm ghost', 'data-act': 'reject', onclick: () => { onReject?.(it); drop(it); } }, tr('Reject'))),
      edit);
  };
  draw();
  box.reviewState = state;
  return box;
}
