/* Settings → Language & chatbot, Users & RACI (1.5.2). © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, select, toast, table, banner, field, download, toCSV, chip } from '../util.js';
import { S } from '../state.js';
import * as prefs from '../prefs.js';
import * as i18n from '../i18n.js';
import * as users from '../users.js';
import * as AI from '../ai.js';
import { STEPS } from '../process.js';

/* ---------------- language (AI settings moved to settings_ai.js in 1.5.3) ---------------- */
export function general(body, sec, rerender) {
  const lang = select(i18n.LANGS.map(l => [l.code, l.name]), i18n.current(), { 'data-noi18n': '', 'data-ro-ok': '' });
  lang.addEventListener('change', async () => { await i18n.setLang(lang.value); rerender(); });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Interface language'),
    field('Language of the screens', lang, 'Only the interface is translated. Organization data, case documents, scenarios and AI answers stay in their original language. The EN / FR buttons in the top bar do the same.'),
    el('p', 'note', 'More languages can be added: one catalogue file per language in js/i18n/, and one line in the language list (see README).')));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'AI settings'),
    el('p', null, 'The help chatbot’s AI answers, AI for this workspace, and where each AI feature may send its requests are managed in one place: ',
      el('a', { href: '#/settings/ai' }, 'Settings → AI — local & remote'), '.')));
}

/* ---------------- users & RACI ---------------- */
export function usersView(body, sec, rerender) {
  const U = users.U;
  if (!U.enabled) {
    const nm = el('input', { placeholder: 'Your name (first administrator)' });
    const pin = el('input', { type: 'password', placeholder: 'Optional PIN', autocomplete: 'new-password' });
    body.append(card(el('h2', { style: { marginTop: 0 } }, 'Multi-user mode'),
      el('p', null, 'Single-user mode is on: everything works as before, without sign-in. Turn multi-user mode on to give several people their own sign-in on this computer, with view, edit and approve rights per process step, defined with a RACI matrix.'),
      banner('warn', 'Option A — one computer', 'Users and rights are stored in this browser and enforced by the application. This organizes who does what and records who did it; it is not a security boundary (someone with access to the computer can bypass it). Option B, a team server enforcing the same model, is designed for a later version (MULTIUSER-ARCHITECTURE.md).'),
      el('div', 'grid g3', field('<b>First administrator</b>', nm), field('PIN', pin, 'Stored as a salted SHA-256 hash.')),
      el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: async () => { if (!nm.value.trim()) { toast('Enter a name', 'bad'); return; } await users.enable(nm.value.trim(), pin.value); toast('Multi-user mode on — you are the administrator'); location.reload(); } }, 'Turn multi-user mode on'))));
    return;
  }
  const me = users.me();
  if (!me?.admin) {
    body.append(card(el('h2', { style: { marginTop: 0 } }, 'Your rights'), raciTable([me], false, rerender),
      el('p', 'note', 'Only an administrator can change users and rights.')));
    return;
  }
  // users list
  const nm = el('input', { placeholder: 'Name' }), em = el('input', { placeholder: 'E-mail (optional)' }), ti = el('input', { placeholder: 'Title / role (optional)' });
  const pin = el('input', { type: 'password', placeholder: 'Optional PIN', autocomplete: 'new-password' });
  const tpl = select([['viewer', 'Template: Informed everywhere (viewer)'], ['analyst', 'Template: Analyst (R on steps 1–8, 10–12)'], ['owner', 'Template: Risk owner (A on steps 7–9)'], ['manager', 'Template: Manager (A everywhere)'], ['admin', 'Administrator']], 'analyst');
  const TPL = new Proxy({}, { get: (_, k) => () => users.template(k) });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Users'),
    table([
      { key: 'name', label: 'Name', render: u => el('div', { 'data-noi18n': '' }, el('b', null, u.name), u.title ? el('div', 'small muted', u.title) : null) },
      { key: 'email', label: 'E-mail', render: u => el('span', { 'data-noi18n': '' }, u.email || '—') },
      { key: 'admin', label: 'Administrator', render: u => { const c = el('input', { type: 'checkbox', checked: !!u.admin, disabled: u.id === me.id, style: { width: 'auto' } }); c.addEventListener('change', async () => { u.admin = c.checked; users.audit('admin ' + (c.checked ? 'granted' : 'removed'), u.name); await users.save(); rerender(); }); return c; } },
      { key: 'pin', label: 'PIN', render: u => u.pinHash ? pill('set', 'good') : pill('none', '') },
      { key: 'x', label: '', sortable: false, render: u => el('div', 'btnrow',
        el('button', { class: 'btn sm ghost', onclick: async () => { const p = window.prompt('New PIN for ' + u.name + ' (empty = no PIN)', ''); if (p === null) return; u.pinHash = p ? await users.hashPin(p, u.salt) : ''; users.audit('PIN changed', u.name); await users.save(); rerender(); } }, 'Set PIN'),
        u.id === me.id ? null : el('button', { class: 'btn sm ghost danger', onclick: async () => { if (!window.confirm('Remove ' + u.name + '?')) return; U.users = U.users.filter(x => x !== u); users.audit('user removed', u.name); await users.save(); rerender(); } }, 'Remove')) },
    ], U.users, { class: 'compact' }),
    el('h4', null, 'Add a user'),
    el('div', 'grid g4', field('Name', nm), field('E-mail', em), field('Title', ti), field('PIN', pin), field('Starting rights', tpl)),
    el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn', onclick: async () => {
      if (!nm.value.trim()) { toast('Enter a name', 'bad'); return; }
      const u = users.newUser({ name: nm.value.trim(), email: em.value.trim(), title: ti.value.trim(), admin: tpl.value === 'admin', raci: TPL[tpl.value]() });
      if (pin.value) u.pinHash = await users.hashPin(pin.value, u.salt);
      U.users.push(u); users.audit('user added', u.name); await users.save(); toast(u.name + ' added'); rerender();
    } }, 'Add user'))));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'RACI matrix — rights per process step'),
    el('p', 'note', 'R Responsible: view and edit · A Accountable: view, edit and approve · C Consulted: view · I Informed: view · – no access (the step’s screens are hidden). Administrators have every right. Approvals of recommendations, formal risk acceptances and measure approvals need A.'),
    raciTable(U.users, true, rerender),
    el('div', 'btnrow', { style: { marginTop: '8px' } },
      el('button', { class: 'btn ghost', onclick: () => download('raci-matrix.csv', toCSV([['User', ...STEPS.map(s => `${s.n}. ${s.title}`)], ...U.users.map(u => [u.name, ...STEPS.map(s => u.admin ? 'A (admin)' : (u.raci?.[s.id] || 'I'))])]), 'text/csv') }, 'Export the RACI matrix (CSV)'))));
  menuAccess(body, rerender);
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Activity'),
    el('div', 'tablewrap', { style: { maxHeight: '320px', overflow: 'auto' } }, table([{ key: 'at', label: 'Time', cls: 'mono' }, { key: 'user', label: 'User', render: e => el('span', { 'data-noi18n': '' }, e.user) }, { key: 'action', label: 'Action' }, { key: 'detail', label: 'Detail', render: e => el('span', { 'data-noi18n': '' }, e.detail || '') }], U.audit.slice(0, 300), { class: 'compact' })),
    el('div', 'btnrow', { style: { marginTop: '8px' } },
      el('button', { class: 'btn ghost', onclick: () => download('user-activity.csv', toCSV([['time', 'user', 'action', 'detail'], ...U.audit.map(e => [e.at, e.user, e.action, e.detail])]), 'text/csv') }, 'Export activity (CSV)'),
      el('button', { class: 'btn ghost danger', onclick: async () => { if (!window.confirm('Turn multi-user mode off? Users and rights are kept for later; the app returns to single-user mode.')) return; await users.disable(); location.reload(); } }, 'Turn multi-user mode off'))));
}

function raciTable(list, editable, rerender) {
  const t = el('table', 'compact raci');
  t.append(el('thead', null, el('tr', null, el('th', null, 'User'), ...STEPS.map(s => el('th', { title: s.title }, `${s.n}. ${s.title}`)))));
  const tb = el('tbody');
  for (const u of list) {
    tb.append(el('tr', null, el('td', { 'data-noi18n': '' }, el('b', null, u.name), u.admin ? el('div', 'small muted', 'administrator') : null),
      ...STEPS.map(s => {
        const L = u.admin ? 'A' : (u.raci?.[s.id] || 'I');
        if (!editable || u.admin) return el('td', { class: 'raci-' + (L === '-' ? 'none' : L), style: { textAlign: 'center' } }, L === '-' ? '–' : L);
        const sel = select(users.LETTERS.map(([k]) => [k, k === '-' ? '–' : k]), L, { 'data-noi18n': '', title: users.LETTERS.find(x => x[0] === L)?.[1] });
        sel.addEventListener('change', async () => { u.raci[s.id] = sel.value; users.audit('RACI changed', `${u.name}: ${s.title} → ${sel.value}`); await users.save(); rerender(); });
        return el('td', { class: 'raci-' + (L === '-' ? 'none' : L) }, sel);
      })));
  }
  t.append(tb);
  return el('div', 'tablewrap', t);
}

/* ---------------- menu access by group and user (1.5.4) ---------------- */
function menuAccess(body, rerender) {
  const U = users.U;
  U.groups ||= [];
  const gname = el('input', { placeholder: 'Group name — e.g. Students, Auditors, Risk committee' });
  const people = U.users.filter(u => !u.admin);
  // membership
  const member = table([
    { key: 'name', label: 'User', render: u => el('b', { 'data-noi18n': '' }, u.name) },
    ...U.groups.map(g => ({ key: g.id, label: g.name, sortable: false, render: u => { const c = el('input', { type: 'checkbox', checked: (u.groups || []).includes(g.id), style: { width: 'auto' } });
      c.addEventListener('change', async () => { u.groups = c.checked ? [...new Set([...(u.groups || []), g.id])] : (u.groups || []).filter(x => x !== g.id); users.audit('group membership', `${u.name} ${c.checked ? '+' : '−'} ${g.name}`); await users.save(); rerender(); }); return c; } })),
  ], people, { class: 'compact' });
  // matrix: rows = menus, columns = groups then users
  const cols = [...U.groups.map(g => ({ kind: 'g', o: g, label: '👥 ' + g.name })), ...people.map(u => ({ kind: 'u', o: u, label: u.name }))];
  const t = el('table', 'compact raci');
  t.append(el('thead', null, el('tr', null, el('th', null, 'Menu'), ...cols.map(c => el('th', { 'data-noi18n': c.kind === 'u' ? '' : null, title: c.kind === 'g' ? 'Group' : 'User account' }, c.label)), el('th', null, 'Effective for'))));
  const tb = el('tbody');
  for (const [p, label] of users.MENUS) {
    tb.append(el('tr', null, el('td', null, label), ...cols.map(c => {
      const cur = c.o.menu?.[p] || 'default';
      const s = select(users.MODES, cur, { title: label });
      s.addEventListener('change', async () => { c.o.menu ||= {}; if (s.value === 'default') delete c.o.menu[p]; else c.o.menu[p] = s.value; users.audit('menu access', `${c.kind === 'g' ? 'group ' : ''}${c.o.name}: ${label} → ${s.value}`); await users.save(); rerender(); });
      return el('td', { class: cur === 'hidden' ? 'raci-none' : cur === 'view' ? 'raci-C' : cur === 'full' ? 'raci-R' : '' }, s);
    }), el('td', 'small', people.map(u => { const m = users.menuMode(p, u); return m === 'default' ? null : `${u.name}: ${m}`; }).filter(Boolean).join(' · ') || '—')));
  }
  t.append(tb);
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Menu access by group and user account'),
    el('p', 'note', 'Default follows the RACI matrix. Full: the screen is shown and editable. View only: shown, read-only. Hidden: removed from the menu. A user’s own setting wins over the groups; between groups the most permissive applies. Approvals still need RACI “A”; Settings and Backup stay administrator-only; administrators are never restricted.'),
    el('h4', null, 'Groups'),
    el('div', 'row', { style: { gap: '8px', alignItems: 'center' } }, gname, el('button', { class: 'btn sm', onclick: async () => { const n = gname.value.trim(); if (!n) { toast('Enter a name', 'bad'); return; } U.groups.push(users.newGroup(n)); users.audit('group added', n); await users.save(); rerender(); } }, 'Add group'),
      ...U.groups.map(g => chip('👥 ' + g.name, { onRemove: async () => { if (!window.confirm('Remove group ' + g.name + '?')) return; U.groups = U.groups.filter(x => x !== g); for (const u of U.users) u.groups = (u.groups || []).filter(x => x !== g.id); users.audit('group removed', g.name); await users.save(); rerender(); } }))),
    U.groups.length && people.length ? el('div', { style: { marginTop: '10px' } }, el('h4', null, 'Membership'), el('div', 'tablewrap', member)) : null,
    el('h4', null, 'Access per menu'),
    cols.length ? el('div', 'tablewrap', { style: { maxHeight: '60vh', overflow: 'auto' } }, t) : el('p', 'note', 'Add a group or a non-administrator user first.'),
    el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn ghost', onclick: () => download('menu-access.csv', toCSV([['Menu', ...cols.map(c => (c.kind === 'g' ? 'group: ' : 'user: ') + c.o.name)], ...users.MENUS.map(([p, l]) => [l, ...cols.map(c => c.o.menu?.[p] || 'default')])]), 'text/csv') }, 'Export menu access (CSV)'))));
}
