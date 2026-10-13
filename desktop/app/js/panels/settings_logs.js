/* Settings → Logs — the access log and the data log of this installation.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, select, table, banner, download, toast, kpi, n0, today } from '../util.js';
import * as LOG from '../logs.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';

const F = { kind: 'all', user: '', q: '', from: '', to: '' };

export function render(body, rerender) {
  const admin = !users.active() || !!users.me()?.admin;
  if (!admin) { body.append(banner('warn', 'Administrators only', 'Only an administrator can read the logs of this installation.')); return; }
  const all = LOG.entries('all');
  const day = today();
  body.append(el('div', 'grid g4',
    kpi('Access log', n0(LOG.entries('access').length), 'entries'),
    kpi('Data log', n0(LOG.entries('data').length), 'entries'),
    kpi('Today', n0(all.filter(e => e.t.slice(0, 10) === day).length), 'entries'),
    kpi('Kept for', tr('{0} days').replace('{0}', LOG.retentionDays()), 'retention')));

  body.append(card(el('p', 'note', 'The access log records sign-ins and sign-outs (and failed ones), screens opened, refused approvals and features switched on or off. The data log records workspaces created, saved, imported or deleted, files downloaded (exports, reports, backups), files written by the local helper and ontology write-backs. Neither log records the contents of a workspace or a file, a key, a PIN or a password. Both stay on this computer.')));

  const users_ = [...new Set(all.map(e => e.user).filter(Boolean))].sort();
  const k = select([['all', 'Both logs'], ['access', 'Access log'], ['data', 'Data log']], F.kind); k.addEventListener('change', () => { F.kind = k.value; rerender(); });
  const u = select([['', 'Everyone'], ...users_.map(x => [x, x])], F.user); u.addEventListener('change', () => { F.user = u.value; rerender(); });
  const q = el('input', { type: 'search', placeholder: 'Search action, screen, file…', value: F.q }); q.addEventListener('change', () => { F.q = q.value; rerender(); });
  const from = el('input', { type: 'date', value: F.from }); from.addEventListener('change', () => { F.from = from.value; rerender(); });
  const to = el('input', { type: 'date', value: F.to }); to.addEventListener('change', () => { F.to = to.value; rerender(); });
  const rows = LOG.entries(F.kind).filter(e => (!F.user || e.user === F.user) && (!F.from || e.t.slice(0, 10) >= F.from) && (!F.to || e.t.slice(0, 10) <= F.to)
    && (!F.q || [e.action, e.target, e.detail, e.ws].join(' ').toLowerCase().includes(F.q.toLowerCase())));

  const ret = select(LOG.RETENTION.map(([d, l]) => [String(d), l]), String(LOG.retentionDays()));
  ret.addEventListener('change', () => { LOG.setRetention(ret.value); LOG.access('log retention changed', ret.value + ' days'); toast(tr('Retention saved')); rerender(); });

  body.append(card(el('div', 'grid g6', el('label', null, 'Log', k), el('label', null, 'Person', u), el('label', null, 'Search', q), el('label', null, 'From', from), el('label', null, 'To', to), el('label', null, 'Keep entries for', ret)),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn ghost', onclick: () => download(`crg-logs-${day}.csv`, LOG.csv(rows), 'text/csv') }, tr('Export {0} entries as CSV').replace('{0}', n0(rows.length))),
      el('button', { class: 'btn ghost danger', onclick: async () => {
        if (!window.confirm(tr('Clear the selected log? This cannot be undone.'))) return;
        await LOG.clear(F.kind); LOG.access('log cleared', F.kind); toast(tr('Log cleared')); rerender();
      } }, 'Clear the selected log')),
    el('div', 'tablewrap', { style: { marginTop: '10px' } }, table([
      { key: 't', label: 'When', render: e => e.t.replace('T', ' ').slice(0, 19) },
      { key: 'kind', label: 'Log', render: e => tr(e.kind === 'access' ? 'Access' : 'Data') },
      { key: 'user', label: 'Who', render: e => e.user || tr('this computer') },
      { key: 'action', label: 'What' }, ...['target', 'ws', 'detail'].map((key, i) => ({ key, label: ['On', 'Workspace', 'Detail'][i], render: e => el('span', { 'data-noi18n': '' }, e[key] || '') }))],
      rows.slice(0, 500), { class: 'compact' })),
    rows.length > 500 ? el('p', 'small muted', tr('Showing the latest 500 of {0}; export the CSV for all of them.').replace('{0}', n0(rows.length))) : null));
}
