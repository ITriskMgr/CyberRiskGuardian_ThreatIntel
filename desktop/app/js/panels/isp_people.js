/* ISP management — who a policy applies to and who acknowledged it.
   Applicability & assignments  rules by organisational unit, role, system, supplier, location or
                                worker type (auditable evaluation), assignments to people or groups
   Acknowledgements & training  acknowledgements of an EXACT version (its SHA-256) by person and date,
                                coverage of the version in force, training requirements and completions.
   An acknowledgement is not compliance; neither is a training completion.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, toast, banner, table, field, select, download, today, pct, toCSV } from '../util.js';
import { S, touch } from '../state.js';
import * as P from '../isp.js';
import * as G from '../grcui.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';
import { C, byName, noi, short, policyPick, peopleList } from './isp_common.js';

const polOpts = I => I.policies.map(p => [p.id, `${p.id} ${p.title}`]);
const inp = (o, k, attrs = {}) => { const i = el(attrs.rows ? 'textarea' : 'input', { 'data-noi18n': '', ...attrs }); i.value = o[k] ?? ''; i.addEventListener('input', () => { o[k] = i.value; }); return i; };

/* ---------------- applicability and assignments ---------------- */
const chk = { policy: '', unit: '', role: '', system: '', supplier: '', location: '', worker: '' };
export function applicabilityTab(body) {
  const ws = S.ws, I = P.isp(ws);
  body.append(peopleList(I));
  body.append(G.register({ title: 'Applicability rules', rows: I.rules, prefix: 'APR', redraw: C.redraw, csv: true,
    note: 'A policy without rules applies to everyone. With include rules, at least one must match; an exclude rule always wins. Dates limit when a rule is in effect.',
    fields: [{ key: 'policy', label: 'Policy', type: 'select', options: polOpts(I).length ? polOpts(I) : [['', '—']] }, { key: 'statement', label: 'Only this statement (optional, e.g. POL-003.2)', type: 'text' },
      { key: 'dimension', label: 'Applies by', type: 'select', options: P.DIMENSIONS }, { key: 'value', label: 'Value (unit, role, system, supplier…)', type: 'text' },
      { key: 'effect', label: 'Effect', type: 'select', options: [['include', 'Include'], ['exclude', 'Exclude']] },
      { key: 'from', label: 'In effect from', type: 'date' }, { key: 'until', label: 'In effect until', type: 'date' }, { key: 'note', label: 'Why', type: 'area' }],
    blank: () => ({ policy: C.polId || I.policies[0]?.id || '', statement: '', dimension: 'unit', effect: 'include' }),
    validate: r => !r.policy ? 'Choose a policy.' : !String(r.value || '').trim() ? 'A rule needs a value.' : null,
    columns: ['id', 'policy', 'statement', 'dimension', 'value', 'effect', 'from', 'until'] }));
  // evaluation
  const out = el('div');
  const run = () => {
    if (!chk.policy) { out.replaceChildren(); return; }
    const r = P.evaluate(chk.policy, chk, ws);
    out.replaceChildren(banner(r.applies ? 'good' : 'warn', r.applies ? tr('The policy applies') : tr('The policy does not apply'),
      r.noRules ? tr('No rule: the policy applies to everyone.') : tr('Rules matched: {0} · excluded by: {1} · rules evaluated: {2}').replace('{0}', r.matched.join(', ') || '—').replace('{1}', r.excluded.join(', ') || '—').replace('{2}', r.rules.join(', '))));
  };
  const ps = policyPick(I, chk.policy, v => { chk.policy = v; run(); }, { empty: '—' });
  const live = (k, ph) => { const i = inp(chk, k, { placeholder: ph }); i.addEventListener('input', run); return i; };
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Check applicability'),
    el('div', 'grid g4', field('Policy', ps), field('Organisational unit', live('unit', 'e.g. Clinics')), field('Role', live('role', 'e.g. System administrator')), field('Systems', live('system', 'separated by ;'))),
    el('div', 'grid g3', field('Suppliers', live('supplier', 'separated by ;')), field('Location or jurisdiction', live('location', 'e.g. Quebec')), field('Worker type', live('worker', 'e.g. contractor'))), out));
  run();
  // assignments
  const f = { policy: C.polId || I.policies[0]?.id || '', kind: 'person', subject: '', members: '', unit: '', role: '', system: '', supplier: '', due: '' };
  const kind = select([['person', 'Person'], ['group', 'Group']], f.kind); kind.addEventListener('change', () => { f.kind = kind.value; });
  const subj = inp(f, 'subject', { list: 'isp-people', placeholder: 'name of the person or group' });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Assign a policy'),
    el('div', 'grid g4', field('Policy', policyPick(I, f.policy, v => { f.policy = v; })), field('Assign to', kind), field('<b>Person or group</b>', subj), field('Acknowledge by', inp(f, 'due', { type: 'date' }))),
    el('div', 'grid g4', field('Organisational unit', inp(f, 'unit')), field('Role', inp(f, 'role')), field('Systems', inp(f, 'system', { placeholder: 'separated by ;' })), field('Suppliers', inp(f, 'supplier', { placeholder: 'separated by ;' }))),
    field('Members of the group (one per line)', inp(f, 'members', { rows: 3 })),
    el('div', 'btnrow', el('button', { class: 'btn', onclick: () => {
      try {
        const before = I.assignments.length;
        const a = P.newAssignment({ ...f, subject: f.subject.trim(), members: f.kind === 'group' ? f.members.split('\n').map(x => x.trim()).filter(Boolean) : [], by: byName() }, ws);
        if (I.assignments.length === before) { toast(tr('Already assigned: {0}').replace('{0}', a.id), 'warn'); return; }
        users.audit('policy assigned', `${a.policy} → ${a.subject}`, ws);
        toast(a.basis.applies ? tr('{0} assigned').replace('{0}', a.id) : tr('{0} assigned — note: the applicability rules do not cover this subject').replace('{0}', a.id), a.basis.applies ? 'good' : 'warn'); C.redraw();
      } catch (e) { toast(tr(String(e.message || e)), 'bad'); }
    } }, 'Assign'))));
  const rows = I.assignments;
  body.append(card(el('h2', { style: { marginTop: 0 } }, `${tr('Assignments')} (${rows.length})`),
    rows.length ? el('div', 'tablewrap', table([
      { key: 'id', label: 'ID', cls: 'mono' }, { key: 'policy', label: 'Policy', cls: 'mono' },
      { key: 'subject', label: 'Assigned to', render: a => el('div', null, noi(a.subject, 'b'), el('div', 'small muted', a.kind === 'group' ? tr('Group of {0}').replace('{0}', (a.members || []).length) : tr('Person'))) },
      { key: 'basis', label: 'Rules at assignment', render: a => a.basis ? el('div', null, pill(a.basis.applies ? tr('in scope') : tr('outside the rules'), a.basis.applies ? 'good' : 'warn'), el('div', 'small muted mono', a.basis.noRules ? tr('no rule') : (a.basis.matched.join(', ') || '—'))) : '—' },
      { key: 'due', label: 'Due', cls: 'mono', render: a => a.due || '—' },
      { key: 'ack', label: 'Version in force', render: a => {
        const c = P.coverage(a.policy, ws); const names = a.kind === 'group' ? a.members || [] : [a.subject];
        if (!c.version) return el('span', 'muted', tr('none published'));
        const done = names.filter(n => !c.missing.some(m => m.toLowerCase() === String(n).toLowerCase())).length;
        return el('div', null, el('span', 'mono', 'v' + c.version + ' '), pill(`${done}/${names.length}`, done === names.length ? 'good' : a.due && a.due < today() ? 'bad' : 'warn'));
      } },
      { key: 'x', label: '', sortable: false, render: a => el('button', { class: 'btn sm ghost danger', onclick: () => { if (!window.confirm(tr('Remove this assignment?'))) return; I.assignments.splice(I.assignments.indexOf(a), 1); touch('isp'); C.redraw(); } }, 'Remove') }],
      rows, { class: 'compact' })) : el('div', 'empty-state', 'No assignment yet.')));
}

/* ---------------- acknowledgements and training ---------------- */
export function acksTab(body) {
  const ws = S.ws, I = P.isp(ws);
  body.append(peopleList(I));
  body.append(banner('warn', 'An acknowledgement is not compliance', 'An acknowledgement records that a person read and accepted one exact version of a policy (its SHA-256 hash) on a date. A training completion records that a person followed a course. Neither says that the requirements are met: only a dated compliance determination backed by evidence does.'));
  // coverage
  const live = I.policies.filter(p => P.inForce(p));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Coverage of the versions in force'),
    live.length ? el('div', 'tablewrap', table([{ key: 'id', label: 'Policy', render: p => noi(`${p.id} ${p.title}`) },
      { key: 'v', label: 'Version', cls: 'mono', render: p => 'v' + P.inForce(p).version }, { key: 'h', label: 'SHA-256', render: p => el('span', { class: 'mono small', title: P.inForce(p).hash }, short(P.inForce(p).hash)) },
      { key: 'n', label: 'Acknowledged', num: true, render: p => { const c = P.coverage(p.id, ws); return c.assigned ? `${c.acknowledged}/${c.assigned}` : '—'; } },
      { key: 'p', label: 'Coverage', num: true, render: p => { const c = P.coverage(p.id, ws); return c.pct === null ? '—' : pct(c.pct, 0); } },
      { key: 's', label: 'Acknowledged an earlier version only', render: p => noi(P.coverage(p.id, ws).stale.join(', ') || '—') },
      { key: 'l', label: 'Late', render: p => { const l = P.coverage(p.id, ws).late; return l.length ? pill(String(l.length), 'bad') : '—'; } }], live, { class: 'compact' }))
      : el('div', 'small muted', 'No published version yet.')));
  // record
  const f = { policy: live[0]?.id || '', person: '', date: today(), method: 'portal' };
  const info = el('div', 'small');
  const showV = () => { const p = I.policies.find(x => x.id === f.policy), v = p && P.inForce(p); info.replaceChildren(v ? el('span', null, tr('Acknowledges exactly: '), el('b', 'mono', `${p.id} v${v.version}`), ' · SHA-256 ', el('code', { 'data-noi18n': '' }, v.hash)) : el('span', 'muted', tr('Only a published version can be acknowledged.'))); };
  const ps = select(live.map(p => [p.id, `${p.id} — ${p.title} (v${P.inForce(p).version})`]), f.policy); ps.setAttribute('data-noi18n', ''); ps.addEventListener('change', () => { f.policy = ps.value; showV(); });
  const meth = select(P.ACK_METHODS, f.method); meth.addEventListener('change', () => { f.method = meth.value; });
  showV();
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Record an acknowledgement'),
    el('div', 'grid g4', field('Policy (version in force)', ps), field('<b>Person</b>', inp(f, 'person', { list: 'isp-people' })), field('Date', inp(f, 'date', { type: 'date' })), field('How', meth)), info,
    el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn', disabled: !live.length, onclick: () => {
      try {
        const n = I.acks.length;
        const a = P.acknowledge({ ...f, by: byName() }, ws);
        if (I.acks.length === n) { toast(tr('Already recorded: {0} acknowledged this version on {1}').replace('{0}', a.person).replace('{1}', a.date), 'warn'); return; }
        users.audit('policy acknowledged', `${a.policy} v${a.version} ${a.person}`, ws); toast(tr('{0} recorded').replace('{0}', a.id)); C.redraw();
      } catch (e) { toast(tr(String(e.message || e)), 'bad'); }
    } }, 'Record the acknowledgement'))));
  // ledger
  const acks = I.acks.slice().reverse();
  body.append(card(el('h2', { style: { marginTop: 0 } }, `${tr('Acknowledgement ledger')} (${acks.length})`),
    acks.length ? el('div', 'tablewrap', table([{ key: 'id', label: 'ID', cls: 'mono' }, { key: 'policy', label: 'Policy', cls: 'mono', render: a => `${a.policy} v${a.version}` },
      { key: 'hash', label: 'SHA-256', render: a => el('span', { class: 'mono small', title: a.hash }, short(a.hash)) }, { key: 'person', label: 'Person', render: a => noi(a.person) },
      { key: 'date', label: 'Date', cls: 'mono' }, { key: 'method', label: 'How', render: a => tr(P.ACK_METHODS.find(m => m[0] === a.method)?.[1] || a.method) },
      { key: 'cur', label: 'Version in force?', render: a => { const v = P.inForce(I.policies.find(p => p.id === a.policy) || {}); return v && v.hash === a.hash ? pill(tr('yes'), 'good') : pill(tr('earlier version'), ''); } }], acks, { class: 'compact' }))
      : el('div', 'small muted', 'No acknowledgement recorded yet.'),
    el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn ghost sm', disabled: !acks.length, onclick: () => download(`isp-acknowledgements-${today()}.csv`, toCSV([['id', 'policy', 'version', 'sha256', 'person', 'date', 'method', 'recorded_by', 'recorded_at'],
      ...I.acks.map(a => [a.id, a.policy, a.version, a.hash, a.person, a.date, a.method, a.recordedBy, a.at])]), 'text/csv') }, 'Acknowledgement ledger (.csv)'))));
  // training
  body.append(G.register({ title: 'Training requirements', rows: I.training, prefix: 'TRN', redraw: C.redraw, csv: true,
    note: 'A training requirement is linked to policies (and, in the editor, to the statements that require it). Completing it is not compliance.',
    fields: [{ key: 'title', label: 'Training', type: 'text', wide: true }, { key: 'policies', label: 'Policies', type: 'multi', options: I.policies.map(p => [p.id, p.id]) },
      { key: 'audience', label: 'Who must follow it (roles, units)', type: 'text' }, { key: 'everyMonths', label: 'Renew every (months, 0 = once)', type: 'number' }, { key: 'provider', label: 'Provider', type: 'text' }],
    blank: () => ({ title: '', policies: C.polId ? [C.polId] : [], statements: [], audience: '', everyMonths: 12, provider: '' }),
    validate: r => !String(r.title || '').trim() ? 'Give the training a title.' : null,
    columns: ['id', 'title', { key: 'policies', label: 'Policies', render: t => (t.policies || []).join(', ') || '—' },
      { key: 'st', label: 'Statements requiring it', render: t => I.policies.flatMap(p => p.statements.filter(s => (s.training || []).includes(t.id)).map(s => s.id)).join(', ') || '—' }, 'audience', 'everyMonths',
      { key: 'n', label: 'Completions', render: t => String(I.completions.filter(c => c.training === t.id && c.result !== 'failed').length) }] }));
  const g = { training: I.training[0]?.id || '', person: '', date: today(), result: 'completed', evidence: '' };
  const ts = select(I.training.map(t => [t.id, `${t.id} ${t.title}`]), g.training); ts.setAttribute('data-noi18n', ''); ts.addEventListener('change', () => { g.training = ts.value; });
  const rs = select(P.TRAIN_RESULTS, g.result); rs.addEventListener('change', () => { g.result = rs.value; });
  const comps = I.completions.slice().reverse();
  body.append(card(el('h2', { style: { marginTop: 0 } }, `${tr('Training completions')} (${comps.length})`),
    el('div', 'grid g5', field('Training', ts), field('<b>Person</b>', inp(g, 'person', { list: 'isp-people' })), field('Date', inp(g, 'date', { type: 'date' })), field('Result', rs), field('Evidence (reference)', inp(g, 'evidence'))),
    el('div', 'btnrow', el('button', { class: 'btn', disabled: !I.training.length, onclick: () => {
      try { const c = P.recordCompletion({ ...g, recordedBy: byName() }, ws); users.audit('training completion recorded', `${c.training} ${c.person}`, ws); toast(tr('{0} recorded').replace('{0}', c.id)); C.redraw(); }
      catch (e) { toast(tr(String(e.message || e)), 'bad'); }
    } }, 'Record the completion')),
    comps.length ? el('div', 'tablewrap', table([{ key: 'id', label: 'ID', cls: 'mono' }, { key: 'training', label: 'Training', cls: 'mono' }, { key: 'person', label: 'Person', render: c => noi(c.person) },
      { key: 'date', label: 'Date', cls: 'mono' }, { key: 'result', label: 'Result', render: c => tr(P.TRAIN_RESULTS.find(r => r[0] === c.result)?.[1] || c.result) },
      { key: 'st', label: 'Valid', render: c => { if (c.result === 'failed') return pill(tr('Failed'), 'bad'); const s = P.trainingStatus(c.training, c.person, ws); return s.last?.id !== c.id ? el('span', 'muted', tr('replaced')) : pill(s.state === 'current' ? (s.until ? tr('until {0}').replace('{0}', s.until) : tr('yes')) : tr('expired'), s.state === 'current' ? 'good' : 'bad'); } },
      { key: 'evidence', label: 'Evidence', render: c => noi(c.evidence || '—') }], comps, { class: 'compact' })) : el('div', 'small muted', 'No completion recorded yet.')));
}
