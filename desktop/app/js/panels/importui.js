/* Import from documents (1.5.4, proof of concept) — Organization → Workspaces → "Import from the
   documents", and the Organization → Evidence tab where incidents, people and roles, the budget split
   and the import log are kept. One review dialog per target: tick, edit, add. Nothing is written
   before "Add ticked". © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, toast, banner, table, modal, select, go, chip } from '../util.js';
import { S, touch } from '../state.js';
import * as IM from '../importer.js';
import * as X from '../extractor.js';
import * as AI from '../ai.js';
import * as aiui from '../aiui.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';

const pick = { sel: new Set(['assets', 'controls', 'weaknesses', 'incidents', 'scenarios']), method: 'ai' };

/** The card on Organization → Workspaces. `org` gives access to the profile / crown extraction. */
export function importCard(body, sec, org) {
  const ws = S.ws;
  const has = (ws.docs || []).length;
  const already = [
    ['Profile & appetite — all 18 fields, tagged', () => { org.setTab('profile'); go('org/profile'); setTimeout(() => org.extractProfile(sec), 80); }, 'Extract…'],
    ['Crown jewels', () => { org.setTab('crown'); go('org/crown'); setTimeout(() => org.extractCrown(sec), 80); }, 'Extract…'],
    ['Context hints — sector, laws and standards, technologies, amounts, CVEs (unconfirmed)', () => go('org/docs'), 'Open'],
    ['Full text, kept with the workspace for the AI assistant and Batch → Propose with AI', () => go('org/docs'), 'Open'],
  ];
  const meth = select([['ai', 'AI — preview before sending (routes in Settings → AI — local & remote)'], ['rules', 'Rules only — no AI, offline (where available)']], pick.method);
  meth.addEventListener('change', () => { pick.method = meth.value; });
  const rows = IM.SECTIONS.map(s => {
    const c = el('input', { type: 'checkbox', checked: pick.sel.has(s.id), style: { width: 'auto' } });
    c.addEventListener('change', () => { c.checked ? pick.sel.add(s.id) : pick.sel.delete(s.id); });
    const route = AI.route(IM.taskOf(s), ws);
    return el('tr', null, el('td', 'cb', c), el('td', null, el('b', null, s.label), el('div', 'small muted', s.what)),
      el('td', null, pill(s.value, s.value === 'High' ? 'good' : '')),
      el('td', null, s.rules ? pill('rules + AI', 'good') : pill('AI only', '')),
      el('td', null, pill(!route.provider ? tr('blocked') : AI.isLocal(route.provider) ? tr('local model') : AI.provider(route.provider).label, !route.provider ? '' : AI.kindOf(route.provider))));
  });
  const t = el('table', 'compact', el('thead', null, el('tr', null, el('th', null, ''), el('th', null, 'What can be prefilled'), el('th', null, 'Value'), el('th', null, 'Methods'), el('th', null, 'AI route'))), el('tbody', null, ...rows));
  const status = el('div');
  body.append(card({ id: 'import-card' }, el('h2', { style: { marginTop: 0 } }, 'Import from the documents'),
    el('p', 'note', 'Pre-fill the assessment from the documents of this workspace with the same approach as the profile: proposals, each tagged FACT, INFERENCE, ASSUMPTION, EXTERNAL or UNKNOWN with its source, that you review, edit and accept. Nothing is written before you add it. Extraction never sets a risk parameter value.'),
    !has ? banner('warn', 'No context documents in this workspace', 'Add documents under Organization → Context documents, or create the workspace with its documents.') : null,
    el('h4', null, 'Already available'),
    el('div', null, ...already.map(([t, f, b]) => el('div', 'row', { style: { alignItems: 'center', margin: '4px 0' } }, el('span', { style: { flex: 1 } }, t), el('button', { class: 'btn sm ghost', disabled: !has, onclick: f }, b)))),
    el('h4', null, 'Import more'),
    el('div', 'tablewrap', t),
    el('div', 'grid g2', { style: { marginTop: '10px' } }, el('label', null, el('span', null, 'Method'), meth)),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn ghost sm', 'data-ro-ok': '', onclick: () => { IM.SECTIONS.forEach(s => pick.sel.add(s.id)); body.replaceChildren(); importCard(body, sec, org); } }, 'Tick all'),
      el('button', { class: 'btn ghost sm', 'data-ro-ok': '', onclick: () => { pick.sel.clear(); body.replaceChildren(); importCard(body, sec, org); } }, 'Untick all'),
      el('button', { class: 'btn', disabled: !has, onclick: () => runAll(status) }, 'Start the import')),
    status));
}

/** Run the ticked targets one after the other: proposal → review → add. */
export async function runAll(status) {
  const ws = S.ws, list = IM.SECTIONS.filter(s => pick.sel.has(s.id));
  if (!list.length) { toast(tr('Tick at least one target'), 'bad'); return; }
  const done = [];
  let text = null;
  for (const sec of list) {
    status.replaceChildren(el('p', 'note', `${tr('Importing')} — ${tr(sec.label)}…`));
    let res = null;
    try {
      if (pick.method === 'rules' && !sec.rules) { done.push([sec, 'skipped', tr('AI only — choose the AI method for this target')]); continue; }
      if (pick.method === 'rules') res = await IM.byRules(sec, ws);
      else {
        const st = await aiui.status(ws, IM.taskOf(sec));
        if (!st.ok) {
          if (sec.rules) { toast(`${tr(sec.label)}: ${tr('AI not available — rules used')}`, 'warn'); res = await IM.byRules(sec, ws); }
          else { done.push([sec, 'skipped', st.why]); continue; }
        } else {
          text ??= (await X.corpus(ws, 200000)).text;
          const out = await aiui.request(IM.taskOf(sec), { text, fictional: ws.kind !== 'organization' }, { title: tr('Import from documents — what will be sent') + ' · ' + tr(sec.label), ws });
          if (!out) { done.push([sec, 'cancelled']); continue; }
          res = IM.parseAI(sec, out.text); res.entryId = out.entryId;
        }
      }
    } catch (e) { done.push([sec, 'error', String(e.message || e)]); continue; }
    const n = await review(sec, res);
    if (res.entryId) AI.decide(res.entryId, n > 0 ? 'accepted' : 'rejected', `${n} item(s) added`);
    done.push([sec, n === null ? 'cancelled' : 'added', n]);
  }
  status.replaceChildren(card(el('h4', { style: { marginTop: 0 } }, 'Import summary'), table([
    { key: 'l', label: 'Target', render: d => tr(d[0].label) },
    { key: 's', label: 'Result', render: d => d[1] === 'added' ? pill(`${d[2]} ${tr('added')}`, d[2] ? 'good' : '') : d[1] === 'skipped' ? pill(tr('skipped'), 'warn') : d[1] === 'error' ? pill(tr('error'), 'bad') : pill(tr('cancelled'), '') },
    { key: 'w', label: 'Note', render: d => d[1] === 'added' ? el('a', { href: '#/' + d[0].route }, tr('Open the screen')) : el('span', 'small', d[2] || '') },
  ], done, { class: 'compact' })));
}

/** The review dialog for one target. Resolves with the number added, or null if cancelled. */
export function review(sec, res) {
  return new Promise(resolve => {
    const items = (res?.items || []).map(x => ({ ...x, _take: x.tag !== 'UNKNOWN' }));
    const tg = t => el('span', { class: 'pill tag-' + t + ' ' + X.TAG_KIND[t], title: X.TAG_HELP[t] }, t);
    const m = modal(tr('Review') + ' — ' + tr(sec.label),
      el('p', 'note', sec.what),
      el('div', 'chips', pill(items.length + ' ' + tr('proposal(s)'), ''), pill(res?.items?.[0]?._method === 'rules' ? tr('Proposed by rules (no AI)') : 'AI', ''), res?.truncated ? pill(tr('answer truncated — first items kept'), 'warn') : null),
      items.length ? el('div', 'tablewrap', { style: { maxHeight: '55vh', overflow: 'auto', marginTop: '8px' } }, table([
        { key: '_take', label: '', sortable: false, cls: 'cb', render: it => { const c = el('input', { type: 'checkbox', checked: it._take }); c.addEventListener('change', () => { it._take = c.checked; }); return c; } },
        ...sec.cols.map(([k, l, ed]) => ({ key: k, label: l, sortable: false, render: it => {
          const v = String(IM.cell(sec, it, k) ?? '');
          if (!ed) return el('span', { class: 'small', 'data-noi18n': '' }, v || '—');
          const i = el(v.length > 60 ? 'textarea' : 'input', { value: v, rows: 2, 'data-noi18n': '' }); if (i.tagName === 'TEXTAREA') i.value = v;
          i.addEventListener('input', () => { IM.setCell(it, k, i.value); it._take = true; });
          return i; } })),
        { key: 'tag', label: 'Tag', render: it => tg(it.tag || 'INFERENCE') },
        { key: 'source', label: 'Source', sortable: false, render: it => el('div', { class: 'small muted', 'data-noi18n': '', style: { maxWidth: '260px' } }, String(it.source || '—').slice(0, 220)) },
      ], items, { class: 'compact' })) : el('div', 'empty-state', el('b', null, 'Nothing found'), res?.items ? 'The documents do not seem to contain this information. Try the other method, or add it by hand.' : 'This target needs AI.'),
      el('div', 'btnrow', { style: { marginTop: '12px' } },
        items.length ? el('button', { class: 'btn', onclick: () => {
          const t = items.filter(x => x._take);
          const n = IM.apply(sec, t, S.ws, users.name ? users.name() : '');
          users.audit?.('import from documents', `${sec.label}: ${n}`, S.ws);
          toast(`${n} ${tr('added')} — ${tr(sec.label)}`); resolve(n); m.close();
        } }, 'Add ticked') : null,
        el('button', { class: 'btn ghost', onclick: () => { resolve(items.length ? null : 0); m.close(); } }, items.length ? 'Cancel' : 'Continue')));
    m.box.classList.add('wide');
    m.back.onclose = () => resolve(null);
  });
}

/* ---------------- Organization → Evidence ---------------- */
export function evidence(body) {
  const ws = S.ws, tg = p => p?.tag ? el('span', { class: 'pill tag-' + p.tag + ' ' + X.TAG_KIND[p.tag], title: p.source || '' }, p.tag) : '—';
  const inc = ws.incidents || [];
  body.append(card(el('h2', { style: { marginTop: 0 } }, `Incidents (${inc.length})`),
    el('p', 'note', 'Past incidents are evidence for Pb(A) and Pb(ψ,A): cite them in the rationale of the scenarios they concern.'),
    inc.length ? table([{ key: 'id', label: 'ID', cls: 'mono' }, { key: 'date', label: 'Date' }, { key: 'type', label: 'Type', render: r => el('span', { 'data-noi18n': '' }, r.type) },
      { key: 'asset', label: 'Asset', render: r => el('span', { 'data-noi18n': '' }, r.asset) }, { key: 'impact', label: 'Impact', render: r => el('span', { class: 'small', 'data-noi18n': '' }, r.impact) },
      { key: 'cause', label: 'Cause', render: r => el('span', { class: 'small', 'data-noi18n': '' }, r.cause) }, { key: 'tag', label: 'Tag', render: r => tg(r.prov) },
      { key: 'x', label: '', sortable: false, render: r => el('button', { class: 'btn sm ghost danger', onclick: () => { ws.incidents = inc.filter(x => x !== r); touch(); body.replaceChildren(); evidence(body); } }, 'Remove') }], inc, { class: 'compact' })
      : el('div', 'empty-state', 'None yet — Workspaces → Import from the documents → Incidents.')));
  const roles = ws.org.roles || [];
  body.append(card(el('h2', { style: { marginTop: 0 } }, `People and roles (${roles.length})`),
    el('p', 'note', 'Named roles become proposed owners of scenarios, risks and measures. In multi-user mode an administrator can create a user from a role with its starting rights.'),
    roles.length ? table([{ key: 'role', label: 'Role', render: r => el('b', { 'data-noi18n': '' }, r.role) }, { key: 'name', label: 'Name', render: r => el('span', { 'data-noi18n': '' }, r.name || '—') },
      { key: 'responsibilities', label: 'Responsibilities', render: r => el('span', { class: 'small', 'data-noi18n': '' }, r.responsibilities || '') }, { key: 'raci_template', label: 'Starting rights' }, { key: 'tag', label: 'Tag', render: r => tg(r.prov) },
      { key: 'x', label: '', sortable: false, render: r => users.U.enabled && users.me()?.admin ? el('button', { class: 'btn sm ghost', disabled: users.U.users.some(u => u.name === (r.name || r.role)), onclick: async () => {
        const u = users.newUser({ name: r.name || r.role, title: r.role, admin: false, raci: users.template(r.raci_template || 'viewer') }); users.U.users.push(u); users.audit('user added', u.name + ' (from roles)'); await users.save(); toast(u.name + ' ' + tr('added')); body.replaceChildren(); evidence(body); } }, 'Create user') : '' }], roles, { class: 'compact' })
      : el('div', 'empty-state', 'None yet — Workspaces → Import from the documents → People and roles.')));
  const b = ws.budget?.breakdown;
  if (b) body.append(card(el('h2', { style: { marginTop: 0 } }, 'Current cybersecurity spend — breakdown from the documents'),
    el('div', 'chips', pill('staff ' + money0(b.staff)), pill('tools ' + money0(b.tools)), pill('services ' + money0(b.services)), tg(b.prov))));
  const lg = ws.importLog || [];
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Import log'),
    lg.length ? table([{ key: 'at', label: 'Time', cls: 'mono', render: e => e.at.slice(0, 16).replace('T', ' ') }, { key: 'label', label: 'Target' }, { key: 'added', label: 'Added', num: true }, { key: 'offered', label: 'Proposed', num: true },
      { key: 'method', label: 'Method' }, { key: 'by', label: 'By', render: e => el('span', { 'data-noi18n': '' }, e.by || '—') }], lg.slice(0, 50), { class: 'compact' }) : el('p', 'note', 'No import yet.')));
}
const money0 = x => '$' + Number(x || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
