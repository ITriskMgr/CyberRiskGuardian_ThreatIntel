/* Audit management — engagements (type, team, state machine, procedures) and workpapers with
   independent sign-off and reproducible sampling.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, n0, go, today, toast, modal, field, select } from '../util.js';
import { S, touch } from '../state.js';
import * as G from '../grcui.js';
import * as SH from '../shared.js';
import * as M from '../ams.js';
import { tr } from '../i18n.js';
import { indep, ask, lab, short, dn, who, listCard, recSelect } from './audit_ui.js';

const L = x => (x || {})[document.documentElement.lang === 'fr' ? 'fr' : 'en'] || (x || {}).en || '';
const PROC_RESULT = [['', 'Not performed'], ['no-exception', 'No exception'], ['exceptions', 'Exceptions found'], ['not-applicable', 'Not applicable']];
const CONFIDENTIALITY = [['internal', 'Internal'], ['restricted', 'Restricted'], ['confidential', 'Confidential']];
const ROLES = [['lead', 'Engagement lead'], ['auditor', 'Auditor'], ['reviewer', 'Independent reviewer'], ['expert', 'Subject-matter expert'], ['external', 'External assessor']];
const typeLabel = e => `${lab(M.NATURE, e.nature || 'assurance')}${e.focus ? ' · ' + lab(M.FOCUS, e.focus) : ''}`;
const stateKind = s => s === 'closed' ? 'good' : s === 'cancelled' ? '' : s === 'planned' ? '' : 'warn';

/** Record a preliminary observation from a procedure or a workpaper. */
export function recordObservation(ws, { engagement, procedure = '', workpaper = '', title = '', criterion = '' }) {
  const A = ws.audit;
  const o = { id: M.nextId(A.observations, 'OBS'), engagement, procedure, workpaper, title, criterion, condition: '', evidence: [], limitation: '', raisedBy: who(), raisedOn: today(), status: 'draft', finding: '' };
  A.observations.push(o); M.event(ws, 'observation recorded', 'observation', o.id, engagement, who());
  return o;
}

/* ---------------- engagements ---------------- */
export async function engagementsTab(body, redraw, ws) {
  const A = ws.audit;
  let progs = []; try { progs = (await (await import('./audit.js')).assurance()).programmes; } catch { /* shown in Procedures */ }
  const fields = () => [{ key: 'title', label: 'Title', type: 'text', wide: true },
    { key: 'nature', label: 'Nature', type: 'select', options: M.NATURE }, { key: 'focus', label: 'Focus', type: 'select', options: M.FOCUS },
    recSelect('universe', 'Auditable entity', A.universe, u => `${u.id} ${u.name}`),
    { key: 'programme', label: 'Work programme', type: 'select', options: [['', 'Own programme'], ...progs.map(p => [p.id, L(p.label)])] },
    { key: 'methodology', label: 'Methodology version', type: 'select', options: [['', '—'], ...A.directives.filter(d => d.kind === 'methodology').map(d => [d.id, `${d.id} (${d.approvedOn})`])] },
    { key: 'scope', label: 'Scope', type: 'area' }, { key: 'exclusions', label: 'Exclusions', type: 'area' },
    { key: 'objectives', label: 'Audit objectives (one per line)', type: 'list' },
    { key: 'criteria', label: 'Criteria (identifiers: policy:POL-001, SP 800-53A objectives, laws, contracts)', type: 'list' },
    { key: 'lead', label: 'Lead auditor', type: 'text' }, { key: 'period', label: 'Period audited', type: 'text' },
    { key: 'start', label: 'Start date', type: 'date' }, { key: 'end', label: 'End date', type: 'date' },
    { key: 'confidentiality', label: 'Confidentiality', type: 'select', options: CONFIDENTIALITY },
    { key: 'rating', label: 'Overall rating', type: 'select', options: M.RATING }, { key: 'opinion', label: 'Conclusion', type: 'area' },
    { key: 'limitations', label: 'Scope or resource limitations', type: 'area' }];
  body.append(listCard({ title: 'Engagements', rows: A.engagements, redraw, fields,
    note: 'The state is changed through the lifecycle (Lifecycle button), never in the form: each transition is checked and recorded.',
    blank: () => ({ id: G.nextId(A.engagements, 'ENG'), nature: 'assurance', focus: '', kind: 'internal-audit', line: 'internal-audit', status: 'planned', criteria: [], objectives: [], procedures: [], team: [], transitions: [],
      confidentiality: 'internal', methodology: M.currentDirective(ws, 'methodology')?.id || '' }),
    check: r => !String(r.title || '').trim() ? 'An engagement needs a title.' : null,
    onSave: (r, isNew) => {
      r.kind = r.focus === 'compliance' ? 'compliance-audit' : r.kind || 'internal-audit';
      if (isNew) A.engagements.push(r);
      M.event(ws, isNew ? 'engagement created' : 'engagement saved', 'engagement', r.id, r.title, who()); return null;
    },
    columns: [{ key: 'id', label: 'Engagement', cls: 'mono' }, { key: 'title', label: 'Title', render: r => dn(r.title) }, { key: 'type', label: 'Type', render: typeLabel },
      { key: 'status', label: 'State', render: r => pill(lab(M.E_STATES, r.status), stateKind(r.status)) }, { key: 'lead', label: 'Lead', render: r => dn(r.lead) },
      { key: 'programme', label: 'Programme', render: r => r.programme ? el('span', null, el('span', { 'data-noi18n': '' }, r.programme), ' ', pill('illustrative', 'warn')) : '—' },
      { key: 'procedures', label: 'Procedures', render: r => `${(r.procedures || []).filter(p => p.result).length}/${(r.procedures || []).length}` },
      { key: 'wp', label: 'Workpapers signed off', render: r => { const w = M.wpsOf(ws, r.id); return `${w.filter(x => x.state === 'locked').length}/${w.length}`; } },
      { key: 'f', label: 'Findings', render: r => String(A.findings.filter(f => f.engagement === r.id).length) }],
    actions: r => [el('button', { class: 'btn sm ghost', onclick: () => procedures(ws, r, progs, redraw) }, 'Procedures'),
      el('button', { class: 'btn sm ghost', onclick: () => team(ws, r, redraw) }, 'Team'),
      el('button', { class: 'btn sm ghost', onclick: () => lifecycle(ws, r, redraw) }, 'Lifecycle')] }));
}

/** The lifecycle of an engagement: its recorded transitions and the next allowed states. */
function lifecycle(ws, eng, redraw) {
  const box = el('div');
  let m;
  const draw = () => box.replaceChildren(
    el('p', null, tr('Current state: '), pill(lab(M.E_STATES, eng.status), stateKind(eng.status))),
    eng.transitions.length ? table([{ key: 'date', label: 'Date' }, { key: 'from', label: 'From', render: r => lab(M.E_STATES, r.from) }, { key: 'to', label: 'To', render: r => lab(M.E_STATES, r.to) },
      { key: 'by', label: 'By', render: r => dn(r.by) }, { key: 'note', label: 'Note', render: r => dn(r.note) }], eng.transitions, { class: 'compact' }) : el('p', 'small muted', tr('No transition recorded yet.')),
    el('div', 'btnrow', ...(M.E_NEXT[eng.status] || []).map(to => {
      const why = M.transitionError(ws, eng, to, { reason: 'x' });
      return el('button', { class: to === 'cancelled' ? 'btn ghost danger' : 'btn', title: why || '', onclick: () => ask(tr('Move to: {0}').replace('{0}', tr(lab(M.E_STATES, to))),
        [{ key: 'by', label: 'Recorded by', type: 'text' }, { key: 'date', label: 'Date', type: 'date' }, { key: 'reason', label: to === 'cancelled' ? 'Reason' : 'Note', type: 'area' }],
        { by: who() || eng.lead || '', date: today(), reason: '' }, v => M.transition(ws, eng, to, v), () => { draw(); redraw(); }) }, tr('Move to: {0}').replace('{0}', tr(lab(M.E_STATES, to))));
    })),
    ...(M.E_NEXT[eng.status] || []).filter(to => to !== 'cancelled').map(to => { const why = M.transitionError(ws, eng, to); return why ? el('p', 'small muted', { 'data-noi18n': '' }, `${lab(M.E_STATES, to)}: ${why}`) : null; }));
  m = modal(tr('Lifecycle — {0}').replace('{0}', eng.title || eng.id), box, el('div', 'btnrow', el('button', { class: 'btn ghost', onclick: () => { m.close(); redraw(); } }, 'Close')));
  draw();
}

/** The team: assignments, checked against declared conflicts of interest. */
function team(ws, eng, redraw) {
  const box = el('div'), msg = el('div');
  const name = el('input', { 'data-noi18n': '', placeholder: tr('Name') }), role = select(ROLES.map(([v, t]) => [v, tr(t)]), 'auditor');
  let m;
  const draw = () => box.replaceChildren(
    indep(),
    el('p', 'small', tr('Lead auditor: '), dn(eng.lead)),
    eng.team.length ? table([{ key: 'name', label: 'Name', render: r => dn(r.name) }, { key: 'role', label: 'Role', render: r => lab(ROLES, r.role) }, { key: 'assigned', label: 'Assigned' },
      { key: 'coi', label: 'Conflicts declared', render: r => { const c = M.conflictsFor(ws, eng, r.name); return c.length ? pill(c.map(x => `${x.id} ${M.conflictOpen(x) ? tr('open') : tr('safeguarded')}`).join(', '), c.some(M.conflictOpen) ? 'bad' : 'good') : '—'; } },
      { key: 'x', label: '', sortable: false, render: r => el('button', { class: 'btn sm ghost', onclick: () => { eng.team.splice(eng.team.indexOf(r), 1); M.event(ws, 'unassigned', 'engagement', eng.id, r.name, who()); touch(); draw(); } }, 'Remove') }], eng.team, { class: 'compact' })
      : el('p', 'small muted', tr('No one assigned yet.')),
    el('div', 'row', { style: { alignItems: 'end', gap: '8px' } }, field(tr('Person'), name), field(tr('Role'), role),
      el('button', { class: 'btn', onclick: () => { const bad = M.assign(ws, eng, name.value, role.value, who()); if (bad) { msg.replaceChildren(el('div', 'banner bad', bad)); return; } msg.replaceChildren(); name.value = ''; touch(); draw(); } }, 'Assign')),
    msg,
    el('p', 'note', 'A person who declared a conflict of interest on this engagement or its auditable entity is assigned only once a safeguard is recorded and authorised by someone else (Quality & independence).'));
  m = modal(tr('Team — {0}').replace('{0}', eng.title || eng.id), box, el('div', 'btnrow', el('button', { class: 'btn ghost', onclick: () => { m.close(); redraw(); } }, 'Close')));
  draw();
}

/** The procedures of an engagement: load them from the programme or the library, record results, open workpapers, record observations. */
function procedures(ws, eng, progs, redraw) {
  const A = ws.audit;
  eng.procedures ||= [];
  const prog = progs.find(p => p.id === eng.programme);
  const box = el('div');
  const lib = select([['', tr('— a library procedure —')], ...A.procedures.map(p => [p.id, `${p.id} v${p.version || 1} ${p.title}`])], '');
  let m;
  const draw = () => box.replaceChildren(
    prog ? banner('warn', tr('{0} is illustrative').replace('{0}', prog.id), 'CRGO\'s work programmes show the structure of a reusable programme. They are not a validated audit methodology: adapt the steps, the sampling and the exception logic to the engagement.') : null,
    el('div', 'btnrow', prog ? el('button', { class: 'btn ghost', onclick: () => {
      for (const p of prog.procedures) if (!eng.procedures.some(x => x.id === p.id)) eng.procedures.push({ id: p.id, title: L(p.label), method: p.method, step: p.step, expected: p.expected, exception: p.exception, sampling: p.sampling, objectives: p.objectives, result: '', sample: null, deviations: null, workpaper: '', version: 1 });
      touch(); draw();
    } }, tr('Load the procedures of {0}').replace('{0}', prog.id)) : null,
      el('button', { class: 'btn ghost', onclick: () => { eng.procedures.push({ id: `${eng.id}-P${String(eng.procedures.length + 1).padStart(2, '0')}`, title: '', method: 'examine', step: '', expected: '', exception: '', sampling: '', objectives: [], result: '', version: 1 }); touch(); draw(); } }, 'Add a procedure'),
      lib, el('button', { class: 'btn ghost', onclick: () => {
        const p = A.procedures.find(x => x.id === lib.value); if (!p) return;
        if (!eng.procedures.some(x => x.id === p.id)) eng.procedures.push({ id: p.id, title: p.title, method: p.method, step: p.steps, expected: p.expected, exception: p.exception, sampling: p.sampling, objectives: p.criteria || [], result: '', version: p.version || 1, library: true });
        touch(); draw();
      } }, 'Add from the library')),
    ...eng.procedures.map(p => card(
      el('div', 'row', { style: { alignItems: 'center' } }, el('b', { style: { flex: 1 }, 'data-noi18n': '' }, `${p.id} ${p.title || ''}`), pill(tr(p.method || ''), ''), p.library ? pill('v' + (p.version || 1), '') : null,
        (p.objectives || []).length ? el('span', 'small mono', { 'data-noi18n': '' }, p.objectives.join(', ')) : null),
      p.step ? el('p', 'small', { 'data-noi18n': '' }, p.step) : null,
      p.expected ? el('p', 'small muted', null, el('b', null, tr('Expected: ')), el('span', { 'data-noi18n': '' }, p.expected)) : null,
      p.exception ? el('p', 'small muted', null, el('b', null, tr('Exception logic: ')), el('span', { 'data-noi18n': '' }, p.exception)) : null,
      p.sampling ? el('p', 'small muted', null, el('b', null, tr('Sampling: ')), el('span', { 'data-noi18n': '' }, p.sampling)) : null,
      el('div', 'grid g4', ...(() => {
        const res = select(PROC_RESULT.map(([v, t]) => [v, tr(t)]), p.result || ''); res.addEventListener('change', () => { p.result = res.value; touch(); });
        const sm = el('input', { type: 'number', value: p.sample ?? '' }); sm.addEventListener('change', () => { p.sample = sm.value === '' ? null : Number(sm.value); touch(); });
        const dv = el('input', { type: 'number', value: p.deviations ?? '' }); dv.addEventListener('change', () => { p.deviations = dv.value === '' ? null : Number(dv.value); touch(); });
        const wps = M.wpsOf(ws, eng.id).filter(w => w.procedure === p.id);
        return [field(tr('Result'), res), field(tr('Sample size'), sm), field(tr('Deviations found'), dv), field(tr('Workpapers'), el('span', 'mono small', wps.map(w => `${w.id} (${tr(lab(M.WP_STATES, w.state))})`).join(', ') || '—'))];
      })()),
      el('div', 'btnrow',
        el('button', { class: 'btn sm ghost', onclick: () => { const w = M.newWorkpaper(ws, eng, p.id, who()); touch(); m.close(); toast(tr('Workpaper {0} opened').replace('{0}', w.id)); go('audit/workpapers'); } }, 'Open a workpaper'),
        el('button', { class: 'btn sm ghost', onclick: () => {
          const o = recordObservation(ws, { engagement: eng.id, procedure: p.id, title: p.title, criterion: (p.objectives || []).join(', ') });
          touch(); m.close(); go('audit/findings'); toast(tr('Observation {0} recorded: complete it').replace('{0}', o.id));
        } }, 'Record an observation')))));
  m = modal(tr('Procedures — {0}').replace('{0}', eng.title || eng.id), box,
    el('div', 'btnrow', el('button', { class: 'btn', onclick: () => { m.close(); redraw(); } }, 'Close')));
  draw();
}

/* ---------------- workpapers and sampling ---------------- */
export function workpapersTab(body, redraw, ws) {
  const A = ws.audit;
  body.append(indep());
  const engs = A.engagements.filter(e => !['closed', 'cancelled'].includes(e.status));
  const procOpts = () => [['', '— none —'], ...A.procedures.map(p => [p.id, `${tr('Library')} · ${p.id} v${p.version || 1} ${p.title}`]),
    ...A.engagements.flatMap(e => (e.procedures || []).filter(p => !p.library).map(p => [p.id, `${e.id} · ${p.id} ${p.title || ''}`]))];
  body.append(el('div', 'btnrow', el('button', { class: 'btn', onclick: () => ask('New workpaper', [recSelect('engagement', 'Engagement', engs, e => `${e.id} ${e.title || ''}`, false),
    { key: 'procedure', label: 'Procedure performed', type: 'select', options: procOpts() }, { key: 'by', label: 'Prepared by', type: 'text' }], { engagement: engs[0]?.id || '', procedure: '', by: who() },
    v => {
      const e = A.engagements.find(x => x.id === v.engagement); if (!e) return 'Choose the engagement.';
      if (v.procedure && !A.procedures.some(p => p.id === v.procedure) && !(e.procedures || []).some(p => p.id === v.procedure)) return 'That procedure belongs to another engagement.';
      M.newWorkpaper(ws, e, v.procedure, v.by); return null;
    }, redraw) }, 'New workpaper')));
  const wpFields = w => [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'workDone', label: 'Work performed', type: 'area', rows: 5 },
    { key: 'result', label: 'Result', type: 'select', options: M.WP_RESULT }, { key: 'conclusion', label: 'Conclusion', type: 'area' },
    { key: 'sample', label: 'Sample', type: 'select', options: [['', '—'], ...A.samples.filter(s => s.engagement === w.engagement).map(s => [s.id, `${s.id} ${s.title || ''}`])] },
    { key: 'evidence', label: 'Evidence (shared register)', type: 'multi', options: SH.evidence(ws).map(e => [e.id, `${e.id} ${e.title || ''}`]) },
    { key: 'performedBy', label: 'Prepared by', type: 'text' }];
  body.append(listCard({ title: 'Workpapers', rows: A.workpapers, redraw, fields: wpFields, canEdit: w => w.state !== 'locked',
    lockedNote: 'This workpaper is signed off and locked. Reopen it (the reason is recorded) to change it.',
    check: r => r.state === 'locked' ? 'This workpaper is signed off and locked.' : null,
    onSave: r => { M.event(ws, 'workpaper saved', 'workpaper', r.id, '', who()); return null; },
    columns: [{ key: 'id', label: 'Workpaper', cls: 'mono' }, { key: 'engagement', label: 'Engagement', cls: 'mono' },
      { key: 'proc', label: 'Procedure (version at the time)', render: r => r.proc ? el('span', { class: 'mono small', title: `sha256 ${r.proc.hash}` }, `${r.proc.id} v${r.proc.version}`) : '—' },
      { key: 'title', label: 'Title', render: r => dn(r.title) }, { key: 'result', label: 'Result', render: r => lab(M.WP_RESULT, r.result) },
      { key: 'state', label: 'State', render: r => pill(lab(M.WP_STATES, r.state), r.state === 'locked' ? 'good' : r.state === 'changes' ? 'bad' : 'warn') },
      { key: 'performedBy', label: 'Prepared by', render: r => dn(r.performedBy) }, { key: 'reviewedBy', label: 'Reviewed by', render: r => dn(r.reviewedBy) },
      { key: 'crit', label: 'Criteria at the time', render: r => (r.criteria || []).length ? el('details', null, el('summary', null, String(r.criteria.length)), el('div', 'small', { 'data-noi18n': '' }, ...r.criteria.map(c => el('div', null, c.version ? `${c.ref} — ${c.title} v${c.version} (${c.status})` : c.ref)))) : '—' },
      { key: 'hash', label: 'Lock', render: r => r.state === 'locked' ? pill(M.wpIntact(r) ? tr('intact {0}').replace('{0}', short(r.hash)) : tr('altered'), M.wpIntact(r) ? 'good' : 'bad') : '—' }],
    actions: w => wpButtons(ws, w, redraw) }));
  samples(body, redraw, ws);
}

function wpButtons(ws, w, redraw) {
  const out = [];
  if (['draft', 'changes'].includes(w.state)) out.push(el('button', { class: 'btn sm ghost', onclick: () => ask('Mark as prepared', [{ key: 'by', label: 'Prepared by', type: 'text' }, { key: 'date', label: 'Date', type: 'date' }],
    { by: w.performedBy || who(), date: today() }, v => M.wpPrepare(ws, w, v.by, v.date), redraw) }, 'Mark prepared'));
  if (['prepared', 'changes'].includes(w.state) && w.performedBy) out.push(el('button', { class: 'btn sm ghost', onclick: () => { const bad = M.wpRequestReview(ws, w, who()); if (bad) toast(bad, 'bad'); touch(); redraw(); } }, 'Request review'));
  if (w.state === 'review') {
    out.push(el('button', { class: 'btn sm ghost', onclick: () => ask('Request changes', [{ key: 'reviewer', label: 'Reviewer', type: 'text' }, { key: 'comment', label: 'What must change', type: 'area' }],
      { reviewer: who(), comment: '' }, v => M.wpRequestChanges(ws, w, v.reviewer, v.comment), redraw) }, 'Request changes'));
    out.push(el('button', { class: 'btn sm', onclick: () => ask('Sign off and lock', [{ key: 'reviewer', label: 'Reviewer (not the preparer)', type: 'text' }, { key: 'date', label: 'Date', type: 'date' }, { key: 'comment', label: 'Review comment', type: 'area' }],
      { reviewer: who(), date: today(), comment: '' }, v => M.wpSignOff(ws, w, v.reviewer, v.date, v.comment), redraw, 'Sign-off locks the workpaper with a SHA-256 hash of its content. The reviewer must be someone other than the preparer.') }, 'Sign off'));
  }
  if (w.state === 'locked') out.push(el('button', { class: 'btn sm ghost', onclick: () => ask('Reopen the workpaper', [{ key: 'by', label: 'Reopened by', type: 'text' }, { key: 'reason', label: 'Reason', type: 'area' }],
    { by: who(), reason: '' }, v => M.wpReopen(ws, w, v.by, v.reason), redraw, 'A controlled reopening: the reason, the person and the previous hash are kept.') }, 'Reopen'));
  out.push(el('button', { class: 'btn sm ghost', onclick: () => { const o = recordObservation(ws, { engagement: w.engagement, workpaper: w.id, procedure: w.procedure, title: w.title, criterion: (w.criteria || []).map(c => c.ref).join(', ') });
    touch(); toast(tr('Observation {0} recorded: complete it').replace('{0}', o.id)); go('audit/findings'); } }, 'Record an observation'));
  return out;
}

function samples(body, redraw, ws) {
  const A = ws.audit;
  const fields = () => [{ key: 'title', label: 'What is sampled', type: 'text', wide: true },
    recSelect('engagement', 'Engagement', A.engagements, e => `${e.id} ${e.title || ''}`), recSelect('workpaper', 'Workpaper', A.workpapers, w => `${w.id} ${w.title || ''}`),
    { key: 'populationSource', label: 'Population source (system, report, query)', type: 'text', wide: true }, { key: 'frameVersion', label: 'Frame version or extraction date', type: 'text' },
    { key: 'population', label: 'Population (one item per line)', type: 'list', rows: 6 }, { key: 'exclusions', label: 'Exclusions (items removed from the frame, one per line)', type: 'list' },
    { key: 'method', label: 'Method', type: 'select', options: M.SAMPLE_METHODS }, { key: 'size', label: 'Sample size', type: 'number' }, { key: 'seed', label: 'Seed', type: 'text' },
    { key: 'chosen', label: 'Chosen items (judgemental only, one per line)', type: 'list' }, { key: 'limitations', label: 'Projection limitations', type: 'area' }];
  body.append(listCard({ title: 'Samples', rows: A.samples, redraw, fields,
    note: 'A sample keeps its population snapshot (hash), method, size, seed and the items selected. Re-running it with the same seed and population gives the same selection; a changed population is detected.',
    blank: () => ({ id: M.nextId(A.samples, 'SMP'), method: 'random', size: 10, seed: `${today()}-${Math.floor(Math.random() * 1e6)}`, population: [], exclusions: [], chosen: [], selected: [] }),
    check: r => r.drawnOn && r.drawKey && M.hashOf(M.drawInputs(r)) !== r.drawKey ? 'This sample was drawn: its population, method, size and seed cannot change. Create a new sample instead.' : null,
    onSave: (r, isNew) => { if (isNew) A.samples.push(r); return null; },
    columns: [{ key: 'id', label: 'Sample', cls: 'mono' }, { key: 'title', label: 'What is sampled', render: r => dn(r.title) }, { key: 'engagement', label: 'Engagement', cls: 'mono' },
      { key: 'method', label: 'Method', render: r => lab(M.SAMPLE_METHODS, r.method) }, { key: 'seed', label: 'Seed', render: r => el('span', 'mono small', r.seed || '—') },
      { key: 'n', label: 'Selected / frame', render: r => `${(r.selected || []).length} / ${M.frameOf(r).length}` },
      { key: 'populationHash', label: 'Population hash', render: r => el('span', 'mono small', short(r.populationHash)) },
      { key: 'sel', label: 'Selected items', render: r => (r.selected || []).length ? el('details', null, el('summary', null, tr('show')), el('div', 'small mono', { 'data-noi18n': '' }, r.selected.join(', '))) : '—' }],
    actions: s => [s.drawnOn ? null : el('button', { class: 'btn sm', onclick: () => { const bad = M.drawSample(ws, s, who()); if (bad) toast(bad, 'bad'); else toast(tr('{0} items selected').replace('{0}', s.selected.length)); touch(); redraw(); } }, 'Draw'),
      s.drawnOn ? el('button', { class: 'btn sm ghost', onclick: () => { const r = M.rerun(s); toast(r.same ? tr('Reproduced: the same {0} items').replace('{0}', r.selected.length) : !r.populationOk ? tr('The population changed since the draw') : tr('Not reproduced: the selection differs'), r.same ? 'good' : 'bad'); } }, 'Re-run') : null].filter(Boolean) }));
}
