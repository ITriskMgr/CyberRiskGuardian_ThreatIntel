/* ISP management — the information security policy management screen (Beta 1.6).

   Overview        dashboard with denominators: policies by state, reviews overdue, acknowledgement
                   coverage of the version in force, open non-compliance, exceptions expiring
   Policy library  policies and policy families; create from a template, blank, or drafted with AI
   Policy editor   clauses and statements (stable id, modality, guideline flag, controls, training);
                   side-by-side comparison of two versions            → isp_editor.js
   Versions & approvals  life cycle with who and when, frozen versions with their SHA-256, approval
                   ledger, review schedule and triggers, supersession → isp_reviews.js
   Applicability & assignments, Acknowledgements & training          → isp_people.js
   Non-compliance  non-compliance and violations; exceptions go to the shared exception register,
                   corrective actions to the shared action register
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, chip, toast, banner, table, kpi, n0, pct, field, select, download, today, modal, toCSV } from '../util.js';
import { S, touch } from '../state.js';
import * as P from '../isp.js';
import * as SH from '../shared.js';
import * as G from '../grcui.js';
import * as AI from '../ai.js';
import * as aiui from '../aiui.js';
import * as users from '../users.js';
import { blankRisk } from '../registry.js';
import { tr } from '../i18n.js';
import { decorate } from '../helpdesc.js';
import { C, byName, statePill, stLabel, noi, policyPick } from './isp_common.js';
import { policyTab } from './isp_editor.js';
import { reviewsTab } from './isp_reviews.js';
import { applicabilityTab, acksTab } from './isp_people.js';

export const HELP = {
  '': { d: 'Information security policies from drafting to approval, publication, acknowledgement, review and retirement.', g: 'isp',
    h: ['Each policy has versions. Approval freezes a version with a SHA-256 hash of its content; changing it starts a new draft version.', 'An acknowledgement, a mapping or a policy statement is never compliance: only a dated compliance determination backed by evidence states a compliance state.'] },
  overview: { d: 'Policies by state, reviews overdue, acknowledgement coverage of the version in force, open non-compliance and exceptions expiring — each with its denominator.', g: 'isp-overview',
    h: ['Coverage counts the assigned people who acknowledged the exact version in force (its hash). An acknowledgement of an earlier version does not count.', 'Acknowledgement coverage is an adoption indicator, not a compliance indicator.'] },
  policies: { d: 'The policy library: policies, standards, procedures and guidelines, grouped in policy families.', g: 'isp-policies',
    h: ['Start from one of the templates, a blank policy or an AI draft. Templates are starting points, not legal advice.', 'A policy family groups the policies, standards and procedures of one topic (CRGO policy family).'] },
  policy: { d: 'The structured editor: clauses and statements with a stable identifier, a modality, controls and training; comparison of two versions.', g: 'isp-policy',
    h: ['Each statement belongs to one exact version and states its modality: must, must not, should or may. A guideline is never binding: its modality is should or may.', 'An approved or published version is frozen. “Start a new version” opens a draft; the frozen versions stay readable and comparable.'] },
  reviews: { d: 'Life cycle and approvals: who submitted, who approved and when, frozen versions with their hash, reviews and supersession.', g: 'isp-reviews',
    h: ['The approver of a version must not be its author or the person who submitted it. Publication checks that the content still has the approved hash.', 'Reviews are scheduled (review date) or triggered by a regulatory change, an incident, a finding, a risk, an organisational or a technology change.'] },
  applicability: { d: 'Applicability rules by organisational unit, role, system or supplier, and assignments of policies to people or groups with due dates.', g: 'isp-applicability',
    h: ['A policy without rules applies to everyone. With include rules, at least one must match; an exclude rule always wins. Each assignment keeps the rules that matched when it was made.'] },
  acks: { d: 'Acknowledgements of an exact version by person and date, training requirements and completion records.', g: 'isp-acks',
    h: ['An acknowledgement says that a person read and accepted a version. It is not compliance, and training is not compliance either.', 'Publishing a new version creates a new obligation to acknowledge: earlier acknowledgements stay in the ledger but do not count for the new version.'] },
  issues: { d: 'Departures from the policies: non-compliance and violations here; exceptions in the shared exception register; corrective actions in the shared action register.', g: 'isp-issues',
    h: ['An exception needs a justification, an expiry date and an approver who is not the requester. It never waives a law.', 'A departure that exposes the organization belongs in the risk register: “Make it a risk”.'] },
};

const TABS = [['overview', 'Overview'], ['policies', 'Policy library'], ['policy', 'Policy editor'], ['reviews', 'Versions & approvals'], ['applicability', 'Applicability & assignments'], ['acks', 'Acknowledgements & training'], ['issues', 'Non-compliance']];
const flt = { status: '', family: '', domain: '', q: '' };
const nflt = { status: 'active', severity: '', policy: '' };

export async function render(sec, arg) {
  const [v, id] = String(arg || '').split('/');
  C.view = TABS.some(t => t[0] === v) ? v : 'overview';
  if (v === 'policy' && id) C.polId = id;
  C.sec = sec;
  C.redraw = () => { render(sec, C.view + (C.view === 'policy' && C.polId ? '/' + C.polId : '')); decorate(sec, 'isp', C.view, { HELP }); };
  C.go = (k, pid) => { C.view = k; if (pid) C.polId = pid; history.replaceState(null, '', '#/isp/' + k + (k === 'policy' && C.polId ? '/' + C.polId : '')); C.redraw(); };
  const I = P.isp(S.ws);
  sec.replaceChildren(el('h1', null, 'ISP management'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  const openNc = I.issues.filter(x => x.type !== 'exception' && ['open', 'progress'].includes(x.status)).length;
  for (const [k, t] of TABS) st.append(el('button', { role: 'tab', 'aria-selected': String(C.view === k), onclick: () => C.go(k) }, k === 'issues' && openNc ? `${tr(t)} (${openNc})` : t));
  const body = el('div'); sec.append(st, body);
  ({ overview, policies, policy: policyTab, reviews: reviewsTab, applicability: applicabilityTab, acks: acksTab, issues }[C.view] || overview)(body, sec);
}

/* ---------------- overview ---------------- */
function overview(body) {
  const ws = S.ws, I = P.isp(ws), d = P.dashboard(ws);
  const of = (a, b) => tr('{0} of {1}').replace('{0}', n0(a)).replace('{1}', n0(b));
  body.append(el('div', 'grid g5',
    kpi('Policies', n0(d.policies), tr('{0} with a version in force').replace('{0}', n0(d.inForce))),
    kpi('Reviews overdue', n0(d.reviewsOverdue), of(d.reviewsOverdue, d.reviewable) + ' ' + tr('scheduled or triggered reviews'), d.reviewsOverdue ? 'bad' : 'good'),
    kpi('Acknowledgement coverage', d.ack.pct === null ? '—' : pct(d.ack.pct, 0), of(d.ack.acknowledged, d.ack.assigned) + ' ' + tr('assigned people, on the version in force'), d.ack.pct === null ? '' : d.ack.pct >= 0.9 ? 'good' : 'warn'),
    kpi('Open non-compliance', n0(d.nc.open), of(d.nc.open, d.nc.total) + ' ' + tr('recorded'), d.nc.open ? 'warn' : 'good'),
    kpi('Exceptions expiring', n0(d.exceptions.expiring), tr('{0} expired · {1} accepted').replace('{0}', n0(d.exceptions.expired)).replace('{1}', n0(d.exceptions.accepted)), d.exceptions.expired ? 'bad' : d.exceptions.expiring ? 'warn' : '')));
  body.append(banner('warn', 'An acknowledgement is not compliance', 'Coverage shows who acknowledged the exact version in force. Whether a requirement is met is stated only by a dated compliance determination backed by evidence (Compliance management).'));
  body.append(el('div', 'grid g2',
    card(el('h2', { style: { marginTop: 0 } }, 'Policies by state'), table([
      { key: 'k', label: 'State', render: r => statePill(r.k) }, { key: 'n', label: 'Policies (current state)', num: true, render: r => n0(r.n) },
      { key: 'p', label: 'Share', num: true, render: r => d.policies ? pct(r.n / d.policies, 0) : '—' }, { key: 'v', label: 'Versions', num: true, render: r => n0(r.v) },
      { key: 'c', label: 'CRGO term', render: r => el('span', 'mono small', P.CRGO_STATE[r.k] || '') }],
      P.STATUS.map(([k]) => ({ k, n: d.byState[k] || 0, v: d.versionsByState[k] || 0 })), { class: 'compact' }),
      el('p', 'note', 'A policy under revision counts as a draft while its previous version stays in force; the Versions column counts every version, frozen or not.')),
    card(el('h2', { style: { marginTop: 0 } }, 'Needs attention'), table([{ key: 'k', label: 'Indicator' }, { key: 'v', label: 'Value', num: true }], [
      { k: tr('Policies without an owner'), v: of(d.noOwner, d.policies - (d.byState.retired || 0) - (d.byState.superseded || 0)) },
      { k: tr('Statements not mapped to a control'), v: of(d.unmapped, d.statements) },
      { k: tr('Waiting for approval'), v: n0(d.byState.review || 0) },
      { k: tr('Approved, not published yet'), v: n0(d.byState.approved || 0) },
      { k: tr('Policies with assignments'), v: of(d.ack.policies, d.inForce) },
      { k: tr('Exceptions expired'), v: of(d.exceptions.expired, d.exceptions.accepted) }], { class: 'compact' }))));
  const live = I.policies.filter(p => P.inForce(p));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Versions in force'), live.length ? el('div', 'tablewrap', table([
    { key: 'id', label: 'ID', cls: 'mono' }, { key: 'title', label: 'Policy', render: p => el('a', { href: '#/isp/policy/' + p.id, 'data-noi18n': '' }, p.title) },
    { key: 'v', label: 'Version', cls: 'mono', render: p => 'v' + P.inForce(p).version }, { key: 'h', label: 'SHA-256', render: p => el('span', { class: 'mono small', title: P.inForce(p).hash }, P.inForce(p).hash.slice(0, 12) + '…') },
    { key: 'r', label: 'Next review', render: p => P.overdue(p) ? pill(tr('overdue — {0}').replace('{0}', P.reviewDate(p)), 'bad') : P.reviewDate(p) || '—' },
    { key: 'c', label: 'Acknowledged', num: true, render: p => { const c = P.coverage(p.id, ws); return c.assigned ? `${c.acknowledged}/${c.assigned} (${pct(c.pct, 0)})` : '—'; } },
    { key: 'w', label: 'Working copy', render: p => p.status !== 'published' ? el('span', null, statePill(p.status), ' v' + p.version) : '—' }], live, { class: 'compact' }))
    : el('div', 'empty-state', el('b', null, 'No version in force'), 'Publish an approved version on the Versions & approvals tab.')));
}

/* ---------------- the library ---------------- */
function policies(body, sec) {
  const ws = S.ws, I = P.isp(ws);
  const tpl = select(P.TEMPLATES.map(t => [t.id, `${tr(t.title)} (${tr(t.domain)})`]), P.TEMPLATES[0].id);
  const done = new Set(I.policies.map(p => p.origin));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Create a policy'),
    el('p', 'note', 'Start from one of the sixteen templates — each a set of policy statements tied to ISO/IEC 27002:2022 and NIST CSF 2.0 controls — then adapt it to the organization, or ask AI to draft it from the organization profile. Templates are starting points, not legal advice.'),
    el('div', 'grid g2', field('Template', tpl), el('div', 'btnrow', { style: { alignSelf: 'end' } },
      el('button', { class: 'btn', onclick: () => { const p = P.fromTemplate(tpl.value, ws, byName()); users.audit('policy created', p.id + ' ' + p.title, ws); C.go('policy', p.id); } }, 'Create from the template'),
      el('button', { class: 'btn ghost', onclick: () => draftWithAI(P.template(tpl.value)) }, 'Draft it with AI…'),
      el('button', { class: 'btn ghost', onclick: () => { const p = P.newPolicy({ title: 'New policy', _by: byName() }, ws); C.go('policy', p.id); } }, 'Blank policy'))),
    el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn ghost sm', onclick: () => {
      const missing = P.TEMPLATES.filter(t => !done.has('template:' + t.id));
      if (!missing.length) { toast(tr('Every template is already in use')); return; }
      if (!window.confirm(tr('Create a draft for each of the {0} templates not used yet?').replace('{0}', missing.length))) return;
      for (const t of missing) P.fromTemplate(t.id, ws, byName());
      users.audit('policy set created', String(missing.length), ws); toast(`${missing.length} ${tr('draft policies created')}`); C.redraw();
    } }, 'Create the whole policy set as drafts'))));
  const domains = [...new Set(I.policies.map(p => p.domain).filter(Boolean))].sort();
  const fs = select([['', 'All statuses'], ...P.STATUS], flt.status); fs.addEventListener('change', () => { flt.status = fs.value; C.redraw(); });
  const ff = select([['', 'All families'], ...I.families.map(f => [f.id, f.name || f.id])], flt.family); ff.addEventListener('change', () => { flt.family = ff.value; C.redraw(); });
  const fd = select([['', 'All domains'], ...domains.map(d => [d, d])], flt.domain); fd.addEventListener('change', () => { flt.domain = fd.value; C.redraw(); });
  const q = el('input', { type: 'search', placeholder: 'Search the policies and statements', value: flt.q, style: { maxWidth: '260px' } });
  q.addEventListener('change', () => { flt.q = q.value; C.redraw(); });
  const qq = flt.q.trim().toLowerCase();
  const rows = I.policies.filter(p => (!flt.status || p.status === flt.status) && (!flt.family || p.family === flt.family) && (!flt.domain || p.domain === flt.domain)
    && (!qq || [p.id, p.title, p.purpose, p.scope, ...p.statements.map(s => s.text + ' ' + s.id + ' ' + s.refs.join(' '))].join(' ').toLowerCase().includes(qq)));
  body.append(card(el('div', 'row', { style: { alignItems: 'center', gap: '6px', flexWrap: 'wrap' } }, el('h2', { style: { margin: 0, flex: 1 } }, `${tr('Policy library')} (${rows.length})`), q, fs, ff, fd),
    rows.length ? el('div', 'tablewrap', table([
      { key: 'id', label: 'ID', cls: 'mono' },
      { key: 'title', label: 'Policy', render: p => el('a', { href: '#/isp/policy/' + p.id, 'data-noi18n': '' }, el('b', null, p.title)) },
      { key: 'type', label: 'Type', render: p => P.TYPES.find(t => t[0] === p.type)?.[1] || p.type },
      { key: 'family', label: 'Family', render: p => noi(P.familyName(p.family, ws) || '—') }, { key: 'domain', label: 'Domain' },
      { key: 'version', label: 'Version', cls: 'mono', render: p => { const f = P.inForce(p); return f && f.version !== p.version ? `v${p.version} (v${f.version} ${tr('in force')})` : 'v' + p.version; } },
      { key: 'status', label: 'Status', render: p => el('div', null, statePill(p.status), P.overdue(p) ? pill('review overdue', 'bad') : P.dueSoon(p) ? pill('review due soon', 'warn') : null) },
      { key: 'owner', label: 'Owner', render: p => p.owner ? noi(p.owner) : pill('no owner', 'warn') },
      { key: 'nextReview', label: 'Next review', cls: 'mono', render: p => P.reviewDate(p) || '—' },
      { key: 'n', label: 'Statements', num: true, render: p => String(p.statements.length) },
      { key: 'nc', label: 'Open NC', num: true, render: p => String(I.issues.filter(x => x.policy === p.id && x.type !== 'exception' && ['open', 'progress'].includes(x.status)).length) },
    ], rows, { class: 'compact' })) : el('div', 'empty-state', el('b', null, 'No policy yet'), 'Create one from a template above.'),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn ghost', disabled: !I.policies.length, onclick: () => download(`isp-register-${today()}.csv`, toCSV([['id', 'title', 'type', 'family', 'domain', 'version', 'status', 'version_in_force', 'sha256_in_force', 'owner', 'approver', 'effective', 'next_review', 'statements'],
        ...I.policies.map(p => [p.id, p.title, p.type, P.familyName(p.family, ws), p.domain, p.version, p.status, P.inForce(p)?.version || '', P.inForce(p)?.hash || '', p.owner, p.approver, P.inForce(p)?.effective || p.effective, P.reviewDate(p), p.statements.length])]), 'text/csv') }, 'Policy register (.csv)'),
      el('button', { class: 'btn ghost', disabled: !I.policies.some(p => P.inForce(p)), onclick: () => download(`isp-published-${today()}.md`, I.policies.filter(p => P.inForce(p)).map(p => P.toMarkdown(p, ws, P.inForce(p).content)).join('\n\n---\n\n'), 'text/markdown') }, 'Published policies (.md)'),
      el('button', { class: 'btn ghost', disabled: !I.policies.length, onclick: () => download(`isp-statements-${today()}.csv`, toCSV([['policy', 'version', 'state', 'statement', 'modality', 'guideline', 'clause', 'controls', 'training', 'text'],
        ...I.policies.flatMap(p => p.statements.map(s => [p.id, p.version, p.status, s.id, s.modality, s.guideline ? 'yes' : 'no', s.clause, s.refs.join('; '), s.training.join('; '), s.text]))]), 'text/csv') }, 'Statements and mappings (.csv)'))));
  body.append(G.register({ title: 'Policy families', rows: I.families, prefix: 'FAM', redraw: C.redraw, csv: true,
    note: 'A policy family groups the policies, standards, procedures and guidelines of one topic, e.g. access control.',
    fields: [{ key: 'name', label: 'Name', type: 'text', wide: true }, { key: 'description', label: 'Description', type: 'area' }, { key: 'owner', label: 'Owner', type: 'text' }],
    blank: () => ({ name: '', description: '', owner: '' }),
    validate: r => !String(r.name || '').trim() ? 'Give the family a name.' : null,
    columns: ['id', 'name', 'owner', { key: 'n', label: 'Policies', render: f => String(I.policies.filter(p => p.family === f.id).length) }] }));
}

/* ---------------- AI drafting ---------------- */
AI.TASKS.isp_draft = {
  label: 'Policy drafting (ISP)',
  build(ws, { template = null, policy = null } = {}) {
    const base = policy || template;
    const body = [
      'TASK: isp_draft',
      AI.orgContext(ws), '',
      `Draft the ${base ? `"${base.title}"` : 'requested'} information security ${(base?.type) || 'policy'} for this organization.`,
      base ? `Purpose so far: ${base.purpose || ''}\nScope so far: ${base.scope || ''}` : '',
      base?.statements?.length ? 'Statements so far (keep their intent; adapt them to the organization; add what is missing):\n' + base.statements.map((s, i) => `${i + 1}. [${s.modality || 'must'}] ${s.text} [${(s.refs || []).join(', ')}]`).join('\n') : '',
      '', 'Rules: write short, testable policy statements, each with a normative modality ("must", "mustnot", "should" or "may") and mapped to real control identifiers: ISO22:<control> (ISO/IEC 27002:2022, e.g. 5.15) and CSF2:<subcategory> (e.g. PR.AA-05).',
      'Use the organization\'s context (sector, regulations, systems, suppliers) only as it is given; do not invent facts about the organization. Where the organization must decide something (a delay, a threshold), write it as [to be decided: …].',
      '', 'Return JSON only: {"purpose":"","scope":"","statements":[{"text":"","modality":"must","refs":["ISO22:…","CSF2:…"]}],"body":"<optional details in Markdown>","notes":["what the organization must decide or check"]}',
    ].filter(Boolean);
    return { system: 'You are a senior information security governance specialist who writes clear, auditable security policies. You never invent facts about the organization. You return JSON only.', prompt: body.join('\n'), max_tokens: 5000, json: true, keepLanguage: false };
  },
};

export async function draftWithAI(template, policy = null) {
  const st = await aiui.status(S.ws, 'isp_draft');
  if (!st.ok) { toast(st.why, 'bad'); return; }
  const out = await aiui.request('isp_draft', { template, policy }, { title: tr('Policy drafting — what will be sent') });
  if (!out) return;
  let j; try { j = AI.parseJson(out.text); } catch (e) { toast(String(e.message || e), 'bad'); AI.decide(out.entryId, 'rejected', 'unparseable'); return; }
  const stmts = (j.statements || []).filter(s => s && s.text).map(s => ({ text: String(s.text).slice(0, 800), modality: P.MODALITY.some(m => m[0] === s.modality) ? s.modality : 'must',
    refs: (s.refs || []).map(String).filter(r => /^(ISO22|CSF2|NIST-53|CIS81):/.test(r)), take: true }));
  const m = modal(tr('Review the drafted policy'),
    el('p', 'note', tr('Proposed by AI') + (out.model ? ' · ' + out.model : '') + ' — ' + AI.MARK),
    el('div', 'small', el('b', null, 'Purpose: '), noi(j.purpose || '—')), el('div', 'small', el('b', null, 'Scope: '), noi(j.scope || '—')),
    el('div', 'tablewrap', { style: { maxHeight: '45vh', overflow: 'auto', marginTop: '8px' } }, table([
      { key: 'take', label: '', sortable: false, cls: 'cb', render: s => { const c = el('input', { type: 'checkbox', checked: s.take }); c.addEventListener('change', () => { s.take = c.checked; }); return c; } },
      { key: 'modality', label: 'Modality', render: s => P.MODALITY.find(x => x[0] === s.modality)?.[1] },
      { key: 'text', label: 'Statement', render: s => noi(s.text) }, { key: 'refs', label: 'Controls', render: s => el('span', 'mono small', s.refs.join(', ')) }], stmts, { class: 'compact' })),
    (j.notes || []).length ? el('details', null, el('summary', null, 'To decide or check'), el('ul', { class: 'small', 'data-noi18n': '' }, ...j.notes.map(n => el('li', null, String(n))))) : null,
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: () => {
      const take = stmts.filter(s => s.take).map(({ take, ...s }) => s);
      let p = policy;
      if (p) { p.purpose = j.purpose || p.purpose; p.scope = j.scope || p.scope; p.statements = []; for (const s of take) P.addStatement(p, s); if (j.body) p.body = j.body;
        p.history.push({ date: today(), version: p.version, status: p.status, by: byName(), what: `Revised with AI (${take.length} statements accepted)` }); touch('isp'); }
      else p = P.newPolicy({ title: template?.title || 'Policy drafted with AI', type: template?.type || 'policy', domain: template?.domain || '', purpose: j.purpose || '', scope: j.scope || '', reviewMonths: template?.review || 12, statements: take, body: j.body || '', origin: 'ai' + (template ? ':' + template.id : ''), _by: byName(), _what: `Drafted with AI (${take.length} statements accepted)` });
      AI.decide(out.entryId, take.length ? 'accepted' : 'rejected', `${take.length} statement(s) taken`);
      m.close(); C.go('policy', p.id);
    } }, policy ? 'Replace the statements with the ticked ones' : 'Create the policy with the ticked statements'),
      el('button', { class: 'btn ghost', onclick: () => { AI.decide(out.entryId, 'rejected', 'cancelled'); m.close(); } }, 'Cancel')));
}

/* ---------------- departures ---------------- */
function issues(body) {
  const ws = S.ws, I = P.isp(ws);
  const polOpts = [['', '—'], ...I.policies.map(p => [p.id, `${p.id} — ${p.title}`])];
  const f = { type: 'noncompliance', policy: nflt.policy || '', statement: '', title: '', description: '', source: 'self', severity: 'medium', owner: '', due: '', expiry: '', approvedBy: '', compensatedBy: '' };
  const s = (k, opts) => { const x = select(opts, f[k]); x.addEventListener('change', () => { f[k] = x.value; }); return x; };
  const t = (k, attrs = {}) => { const x = el(attrs.rows ? 'textarea' : 'input', { 'data-noi18n': '', ...attrs }); x.addEventListener('input', () => { f[k] = x.value; }); return x; };
  const pol = s('policy', polOpts); pol.setAttribute('data-noi18n', '');
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Record a departure from a policy'),
    el('p', 'note', 'Non-compliance and violations are kept here. An exception — an approved, time-limited departure — goes to the shared exception register, and a corrective action to the shared action register, so that every module sees the same record.'),
    el('div', 'grid g4', field('Kind', s('type', P.NC_TYPES)), field('Policy', pol), field('Found by', s('source', P.NC_SOURCES)), field('Severity', s('severity', P.NC_SEVERITY))),
    el('div', 'grid g3', field('<b>What</b>', t('title', { placeholder: 'e.g. Shared administrator account on the PACS server' })), field('Statement (optional)', t('statement', { placeholder: 'e.g. POL-003.2', class: 'mono' })), field('Owner of the correction', t('owner'))),
    field('Details — for an exception, the justification (required)', t('description', { rows: 2 })),
    el('div', 'grid g4', field('Correct by', t('due', { type: 'date' })), field('Exception expires on (exceptions)', t('expiry', { type: 'date' })),
      field('Exception approved by (exceptions)', t('approvedBy')), field('Compensating controls (exceptions)', t('compensatedBy', { placeholder: 'separated by ;' }))),
    el('div', 'btnrow', el('button', { class: 'btn', onclick: () => {
      if (!f.title.trim()) { toast(tr('Describe the departure'), 'bad'); return; }
      try {
        if (f.type === 'exception') {
          const r = P.recordException({ title: f.title, policy: f.policy, statement: f.statement.trim(), description: f.description, severity: f.severity, expiry: f.expiry, approvedBy: f.approvedBy.trim(),
            requestedBy: byName() || f.owner, compensatedBy: f.compensatedBy.split(';').map(x => x.trim()).filter(Boolean), scope: '' }, ws);
          users.audit('policy exception recorded', r.id + ' ' + r.title, ws); toast(tr('{0} recorded in the shared exception register').replace('{0}', r.id));
        } else {
          const x = P.newIssue({ type: f.type, policy: f.policy, statement: f.statement.trim(), title: f.title, description: f.description, source: f.source, severity: f.severity, owner: f.owner, due: f.due, status: 'open', _by: byName() }, ws);
          users.audit('ISP non-compliance recorded', x.id + ' ' + x.title, ws); toast(x.id + ' ' + tr('recorded'));
        }
        C.redraw();
      } catch (e) { toast(tr(String(e.message || e)), 'bad'); }
    } }, 'Record'))));
  // register
  const fs = select([['active', 'Open and in progress'], ['all', 'All'], ...P.NC_STATUS.filter(x => x[0] !== 'accepted')], nflt.status); fs.addEventListener('change', () => { nflt.status = fs.value; C.redraw(); });
  const fp = select([['', 'All policies'], ...I.policies.map(p => [p.id, p.id])], nflt.policy); fp.addEventListener('change', () => { nflt.policy = fp.value; C.redraw(); });
  const all = I.issues.filter(x => x.type !== 'exception');
  const rows = all.filter(x => (nflt.status === 'all' || (nflt.status === 'active' ? ['open', 'progress'].includes(x.status) : x.status === nflt.status)) && (!nflt.policy || x.policy === nflt.policy));
  const sev = { low: 'good', medium: 'warn', high: 'bad', critical: 'bad' };
  const acts = SH.actions(ws);
  body.append(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, `${tr('Non-compliance and violations')} (${rows.length})`), fs, fp),
    rows.length ? el('div', 'tablewrap', table([
      { key: 'id', label: 'ID', cls: 'mono' },
      { key: 'title', label: 'Departure', render: x => el('div', { 'data-noi18n': '' }, el('b', null, x.title), el('div', 'small muted', P.NC_TYPES.find(t => t[0] === x.type)?.[1].split(' (')[0] + ' · ' + (P.NC_SOURCES.find(t => t[0] === x.source)?.[1] || ''))) },
      { key: 'policy', label: 'Policy', cls: 'mono', render: x => [x.policy, x.version ? 'v' + x.version : '', x.statement].filter(Boolean).join(' · ') || '—' },
      { key: 'severity', label: 'Severity', render: x => pill(P.NC_SEVERITY.find(t => t[0] === x.severity)?.[1], sev[x.severity]) },
      { key: 'status', label: 'Status', render: x => { const sl = select(P.NC_STATUS.filter(o => o[0] !== 'accepted'), x.status); sl.addEventListener('change', () => {
        x.history.push({ date: today(), what: `${x.status} → ${sl.value}`, by: byName() }); x.status = sl.value; if (sl.value === 'closed') x.closed = today(); touch('isp'); C.redraw(); });
        return el('div', null, sl, P.issueOverdue(x) ? pill('overdue', 'bad') : null); } },
      { key: 'owner', label: 'Owner', render: x => noi(x.owner || '—') },
      { key: 'due', label: 'Due', cls: 'mono', render: x => x.due || '—' },
      { key: 'act', label: 'Corrective action', render: x => el('div', null,
        ...(x.actions || []).map(id => { const a = acts.find(r => r.id === id); return chip(id + (a ? ' · ' + tr(SH.ACTION_STATES.find(s => s[0] === a.state)?.[1] || a.state) : ''), { href: '#/shared/actions', kind: a && SH.actionOverdue(a) ? 'bad' : '' }); }),
        el('button', { class: 'btn sm ghost', title: 'Open a corrective action in the shared action register', onclick: () => {
          const a = P.correctiveAction(x, { owner: x.owner, due: x.due }, ws); users.audit('corrective action opened', a.id + ' from ' + x.id, ws); toast(tr('{0} opened in the shared action register').replace('{0}', a.id)); C.redraw(); } }, 'Corrective action')) },
      { key: 'r', label: '', sortable: false, render: x => x.risk ? chip(x.risk, { href: '#/riskreg/' + x.risk }) : el('button', { class: 'btn sm ghost', title: 'Create a risk-register entry for this departure', onclick: () => {
        ws.risks ||= []; const r = blankRisk({ title: `${x.title} (${x.id})`, desc: x.description || '', category: 'Compliance', owner: x.owner || '', history: [{ date: today(), what: `Created from ISP ${x.type} ${x.id}` }] });
        ws.risks.push(r); x.risk = r.id; touch('isp'); toast(r.id + ' ' + tr('created in the risk register')); C.redraw(); } }, 'Make it a risk') },
    ], rows, { class: 'compact' })) : el('div', 'empty-state', 'Nothing in this view.'),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn ghost', disabled: !all.length, onclick: () => download(`isp-noncompliance-${today()}.csv`, toCSV([['id', 'type', 'policy', 'version', 'statement', 'title', 'source', 'severity', 'status', 'owner', 'detected', 'due', 'actions', 'risk', 'closed'],
      ...all.map(x => [x.id, x.type, x.policy, x.version || '', x.statement || '', x.title, x.source, x.severity, x.status, x.owner, x.detected, x.due, (x.actions || []).join('; '), x.risk, x.closed])]), 'text/csv') }, 'Non-compliance register (.csv)'))));
  // exceptions (shared register)
  const exc = P.policyExceptions(ws);
  body.append(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, `${tr('Policy exceptions — shared register')} (${exc.length})`),
      el('a', { class: 'btn sm ghost', href: '#/shared/exceptions' }, 'Open the shared exception register')),
    exc.length ? el('div', 'tablewrap', table([{ key: 'id', label: 'ID', cls: 'mono' }, { key: 'title', label: 'Exception', render: x => noi(x.title) },
      { key: 'policy', label: 'Policy', cls: 'mono', render: x => [x.policy, x.version ? 'v' + x.version : '', x.statement].filter(Boolean).join(' · ') || '—' },
      { key: 'approvedBy', label: 'Approved by', render: x => noi(x.approvedBy || '—') }, { key: 'status', label: 'Status', render: x => tr(SH.EXC_STATES.find(s => s[0] === x.status)?.[1] || x.status) },
      { key: 'expiry', label: 'Expires on', render: x => !x.expiry ? '—' : P.exceptionExpired(x) ? pill(tr('expired — {0}').replace('{0}', x.expiry), 'bad') : x.expiry <= P.addMonths(today(), 1) ? pill(x.expiry, 'warn') : x.expiry }], exc, { class: 'compact' }))
      : el('div', 'small muted', 'No exception concerns a policy.')));
  const legacy = I.issues.filter(x => x.type === 'exception');
  if (legacy.length) body.append(card(el('h2', { style: { marginTop: 0 } }, `${tr('Exceptions recorded in this module')} (${legacy.length})`),
    el('p', 'note', 'Exceptions now live in the shared exception register. Move these so that every module sees them.'),
    table([{ key: 'id', label: 'ID', cls: 'mono' }, { key: 'title', label: 'Exception', render: x => noi(x.title) }, { key: 'expiry', label: 'Expires on', cls: 'mono' },
      { key: 'm', label: '', sortable: false, render: x => el('button', { class: 'btn sm ghost', onclick: () => { const r = P.moveLegacyException(x, ws); toast(tr('{0} moved to the shared register as {1}').replace('{0}', x.id).replace('{1}', r.id)); C.redraw(); } }, 'Move to the shared register') }], legacy, { class: 'compact' })));
}
