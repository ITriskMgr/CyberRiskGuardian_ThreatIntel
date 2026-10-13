/* Compliance management — the CMS tabs (Beta 1.6.x): dashboard, sources & obligations, programmes &
   frameworks, mappings, campaigns, regulatory calendar, submissions and regulatory change.
   The model is js/cms.js; evidence, corrective actions, exceptions and mappings are the shared registers.
   A mapping, an acknowledgement or an attestation is never compliance; only a dated determination with
   evidence states a compliance state. Decision support, not legal advice. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, kpi, n0, today, toast, download, toCSV } from '../util.js';
import { S, touch } from '../state.js';
import * as G from '../grcui.js';
import * as SH from '../shared.js';
import * as M from '../cms.js';
import * as K from '../catalog.js';
import * as users from '../users.js';
import * as LOG from '../logs.js';
import { tr } from '../i18n.js';

export const HELP = {
  dashboard: { d: 'Where compliance stands: obligations applicable, determinations and evidence, deadlines, submissions and legal exposure — each with its denominator.', g: 'compliance-dashboard',
    h: ['Every figure says what it is counted over. "Not assessed" and "undetermined" are never counted as compliant.', 'An exception that concerns a legal provision is a compliance exposure unless an authority granted an exemption.'] },
  obligations: { d: 'Regulatory sources with their versions, atomic obligations, interpretations, authorities and exemptions.', g: 'compliance-obligations',
    h: ['An obligation cites its source, the version or edition and the provision; its text is a paraphrase — never the licensed text of a standard.', 'An interpretation can be legally privileged: its content is then withheld from reports and AI.', 'Only a regulatory authority grants an exemption. An internal exception never waives a law.'] },
  programmes: { d: 'The compliance programme, its objectives and the frameworks adopted for a stated scope.', g: 'compliance-programmes',
    h: ['A framework adoption is a decision: who decided, when and for which scope. It makes the framework\'s requirements commitments; it says nothing about compliance with them.'] },
  mappings: { d: 'Qualified mappings between policy statements or controls and obligations, kept in the shared mapping register.', g: 'compliance-mappings',
    h: ['A mapping says how two requirements correspond. It is never compliance: only a dated determination with evidence states a compliance state.'] },
  campaigns: { d: 'Assessment campaigns over a set of obligations, for a scope and period; they produce the compliance determinations.', g: 'compliance-campaigns',
    h: ['Each determination needs evidence from the shared evidence register or an explicit evidence gap. An approved campaign is frozen.', 'The assessor cannot be the owner of the obligation, and the reviewer who approves cannot be the assessor.'] },
  calendar: { d: 'Regulatory deadlines: fixed dates and deadlines counted from an incident confirmation, answered or not.', g: 'compliance-calendar',
    h: ['An event-triggered deadline starts only from a confirmed incident (a person, a date) — never from an alert. The calculation is shown with each deadline.'] },
  submissions: { d: 'Notifications and filings to authorities: approval, date sent, receipt reference and acknowledgement.', g: 'compliance-submissions',
    h: ['Nothing is sent to an authority without a recorded human approval; the person who prepared a submission cannot approve it.'] },
  changes: { d: 'Regulatory change: new, amended or repealed provisions, their impact and the work they create.', g: 'compliance-changes',
    h: ['An amendment creates a new version of the obligation; the old version stays attached to the determinations made against it.'] },
};

/* ---------------- helpers ---------------- */
const isFR = () => document.documentElement.lang === 'fr';
const opt = (list, label) => list.map(x => [x.id, label(x)]);
const obOpts = ws => opt(M.cms(ws).obligations, o => `${o.id} ${o.title || ''}${M.supersededBy(o, ws) ? ' (superseded)' : ''}`);
const srcOpts = ws => opt(M.cms(ws).sources, s => `${s.id} ${s.title || ''}`);
const authOpts = ws => opt(M.cms(ws).authorities, a => `${a.id} ${a.name || ''}`);
const stPill = s => pill(tr(M.STATE_TEXT[s] || (s === 'not-applicable' ? 'Not applicable' : s)), s === 'satisfied' ? 'good' : s === 'unsatisfied' ? 'bad' : s === 'not-applicable' ? '' : 'warn');
const evPill = s => pill(tr(M.EVIDENCE_TEXT[s] || s), SH.EVIDENCE_KIND[s]);
const apPill = a => pill(tr((M.APPLICABILITY.find(x => x[0] === (a || 'not-assessed')) || [, a])[1]), a === 'applicable' ? 'warn' : a === 'not-applicable' ? '' : 'bad');
const data = s => el('span', { 'data-noi18n': '' }, s ?? '');
const h2 = t => el('h2', { style: { marginTop: 0 } }, t);
const of = (a, b) => `${n0(a)} / ${n0(b)}`;
const singleUser = () => users.active() ? null : banner('warn', 'Independence cannot be verified in single-user mode', 'The application compares the names typed (assessor and owner, reviewer and assessor, approver and preparer); it cannot verify who is at the keyboard. Turn on multi-user mode in Settings → Users & RACI for identified people.');
const fmtDue = x => x.due ? x.due.replace('T00:00', '').replace('T', ' ') : '—';
const instPill = x => x.pending ? pill(tr('waiting for its trigger'), '') : x.answered ? pill(x.late ? tr('answered late') : tr('answered'), x.late ? 'bad' : 'good') : x.overdue ? pill(tr('overdue'), 'bad') : x.soon ? pill(tr('due within 30 days'), 'warn') : pill(tr('open'), '');

export async function renderTab(sec, tab, tabsEl) {
  sec.replaceChildren(el('h1', null, 'Compliance management'), tabsEl);
  const body = el('div'); sec.append(body);
  const redraw = async () => { await renderTab(sec, tab, sec.querySelector('.subtabs')); try { const H = await import('../helpdesc.js'); H.decorate(sec, 'compliance', tab, await import('./compliance.js')); } catch { /* decoration only */ } };
  M.cms(S.ws);
  return ({ dashboard, obligations, programmes, mappings, campaigns, calendar, submissions, changes }[tab] || dashboard)(body, redraw);
}

/* ---------------- dashboard ---------------- */
function dashboard(body) {
  const ws = S.ws, D = M.dashboard(ws), now = M.nowDate();
  body.append(banner('warn', 'A mapping is never compliance', 'The figures below count dated determinations backed by evidence. Mappings, policy acknowledgements and attestations support compliance; they never state it. Decision support, not legal advice.'));
  const A = D.applicable;
  body.append(el('div', 'grid g4',
    kpi('Obligations applicable', of(A, D.obligations), tr('{0} not assessed · {1} awaiting qualified review · {2} not applicable').replace('{0}', n0(D.applicabilityNotAssessed)).replace('{1}', n0(D.applicabilityPending)).replace('{2}', n0(D.notApplicable)), D.applicabilityNotAssessed || D.applicabilityPending ? 'warn' : ''),
    kpi('With a current determination', of(D.currentDetermination, A), tr('of the applicable obligations (review cycle respected)'), A && D.currentDetermination < A ? 'warn' : A ? 'good' : ''),
    kpi('With current evidence', of(D.currentEvidence, A), tr('{0} satisfied on expired or insufficient evidence').replace('{0}', n0(D.satisfiedOnWeakEvidence)), D.satisfiedOnWeakEvidence ? 'bad' : A && D.currentEvidence < A ? 'warn' : A ? 'good' : ''),
    kpi('Satisfied', of(D.satisfied, D.assessed), tr('of the applicable obligations assessed · {0} partial · {1} unsatisfied · {2} undetermined · {3} not assessed (excluded)').replace('{0}', n0(D.partial)).replace('{1}', n0(D.unsatisfied)).replace('{2}', n0(D.undetermined)).replace('{3}', n0(D.notAssessed)), D.unsatisfied ? 'bad' : D.partial || D.undetermined ? 'warn' : ''),
    kpi('Deadlines due in 30 days', n0(D.due30.length), tr('{0} overdue, not answered').replace('{0}', n0(D.overdueDeadlines.length)), D.overdueDeadlines.length ? 'bad' : D.due30.length ? 'warn' : 'good'),
    kpi('Submissions overdue', of(D.submissionsOverdue.length, M.cms(ws).submissions.length), tr('of the submissions recorded'), D.submissionsOverdue.length ? 'bad' : 'good'),
    kpi('Exceptions without exemption', n0(D.exposure.length), tr('accepted exceptions concerning a legal provision that no authority exempted'), D.exposure.length ? 'bad' : 'good'),
    kpi('Interpretations awaiting legal review', n0(D.interpretationsPending), tr('{0} regulatory change(s) open · {1} campaign(s) open').replace('{0}', n0(D.changesOpen)).replace('{1}', n0(D.campaignsOpen)), D.interpretationsPending ? 'warn' : '')));
  if (D.partialOnly) body.append(el('p', 'note', tr('{0} applicable obligation(s) are covered by partial or weaker mappings only.').replace('{0}', n0(D.partialOnly))));
  const inst = M.deadlineInstances(ws, now).filter(x => !x.answered && (x.overdue || x.soon));
  body.append(card(h2('Deadlines to answer'), inst.length ? table([
    { key: 'due', label: 'Due', render: fmtDue }, { key: 'title', label: 'Deadline', render: x => data(x.title || x.id) },
    { key: 'obligation', label: 'Obligation', render: x => data(x.obligation || '—') }, { key: 's', label: 'State', render: instPill },
    { key: 'e', label: 'How it is computed', render: x => el('span', { class: 'small', 'data-noi18n': '' }, x.explanation) }], inst, { class: 'compact' })
    : el('div', 'empty-state', 'No deadline overdue or due within 30 days.')));
  body.append(card(h2('Compliance exposure: exceptions concerning a legal provision'),
    el('p', 'note', 'An internal exception cannot waive a law. Unless an authority granted an exemption, the departure is a compliance exposure to treat — not an accepted state.'),
    D.exposure.length ? table([{ key: 'id', label: 'Exception', render: e => data(`${e.exception.id} ${e.exception.title || ''}`) },
      { key: 'w', label: 'Provisions without exemption', render: e => data(e.without.join(', ')) },
      { key: 'x', label: 'Expires on', render: e => data(e.exception.expiry || '—') }, { key: 'a', label: 'Approved by', render: e => data(e.exception.approvedBy || '—') }], D.exposure, { class: 'compact' })
      : el('div', 'empty-state', 'No accepted exception concerns a legal provision without an exemption.')));
  const P = M.posture(ws, now).filter(r => r.applicability === 'applicable' && (r.state !== 'satisfied' || r.evidence !== 'current' || r.reviewOverdue));
  body.append(card(h2('Obligations needing attention'), P.length ? postureTable(P) : el('div', 'empty-state', 'Every applicable obligation has a current determination backed by current evidence.')));
}
export function postureTable(rows) {
  return table([{ key: 'o', label: 'Obligation', render: r => data(M.obLabel(r.o)) }, { key: 'a', label: 'Applicability', render: r => apPill(r.applicability) },
    { key: 's', label: 'State', render: r => el('div', null, stPill(r.state), r.det?.date ? el('div', { class: 'small muted', 'data-noi18n': '' }, r.det.date) : null, r.reviewOverdue ? pill(tr('review overdue'), 'warn') : null) },
    { key: 'e', label: 'Evidence status', render: r => el('div', null, evPill(r.evidence), r.gap ? el('div', 'small', { style: { color: 'var(--bad)' } }, tr('evidence gap: not support for "satisfied"')) : null) },
    { key: 'x', label: 'Exceptions without exemption', render: r => r.exceptions ? pill(String(r.exceptions), 'bad') : '0' },
    { key: 'n', label: 'Next deadline', render: r => r.next ? el('span', null, data(fmtDue(r.next)), ' ', instPill(r.next)) : '—' }], rows, { class: 'compact' });
}

/* ---------------- sources & obligations ---------------- */
let apFilter = 'all';
async function obligations(body, redraw) {
  const ws = S.ws, C = M.cms(ws);
  let snap = null; try { snap = await (await import('../crgo.js')).snapshot(); } catch { snap = null; }
  const prov = snap?.legal?.provisions || {};
  const label = x => (x || {})[isFR() ? 'fr' : 'en'] || x?.en || '';
  body.append(banner('warn', 'Paraphrases only — not legal advice', 'Obligations are written in the organisation\'s own words with the citation of the provision. The text of licensed standards is never reproduced; legislation may be cited. Interpretations need qualified review.'));
  // sources
  body.append(G.register({ title: 'Regulatory sources', rows: C.sources, prefix: 'SRC', redraw, csv: true,
    fields: [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'type', label: 'Type', type: 'select', options: M.SOURCE_TYPES },
      { key: 'authority', label: 'Issued by (authority or body)', type: 'select', options: [['', '—'], ...authOpts(ws)] }, { key: 'jurisdiction', label: 'Jurisdiction', type: 'text' },
      { key: 'citation', label: 'Citation or identifier', type: 'text' }, { key: 'url', label: 'Official URL', type: 'text', wide: true },
      { key: 'licence', label: 'Licence of the text', type: 'select', options: [['public', 'Public text — may be cited'], ['licensed', 'Licensed — identifiers and paraphrases only'], ['contract', 'Contractual — confidential']] },
      { key: 'status', label: 'Status', type: 'select', options: M.SOURCE_STATUS },
      { key: 'versions', label: 'Versions or editions (label | published | in force from | in force until — one per line)', type: 'list', rows: 4,
        encode: v => (v || []).map(x => [x.label, x.published, x.from, x.to].map(s => s || '').join(' | ')),
        decode: v => v.map(l => { const [label, published, from, to] = l.split('|').map(s => s.trim()); return { label, published, from, to }; }) }],
    blank: () => ({ type: 'law', status: 'in-force', licence: 'public', versions: [] }),
    validate: r => !String(r.title || '').trim() ? 'Give the source a title.' : null,
    columns: ['id', 'title', 'type', { key: 'versions', label: 'Versions', render: r => data((r.versions || []).map(v => v.label).filter(Boolean).join(', ') || '—') }, 'status',
      { key: 'url', label: 'Official URL', render: r => r.url ? el('a', { href: r.url, target: '_blank', rel: 'noopener', 'data-noi18n': '' }, r.url.replace(/^https?:\/\//, '').slice(0, 40)) : '—' }] }));
  // from the ontology
  const ins = (snap?.legal?.instruments || []).map(i => [i.id, `${i.id} — ${label(i.label)}`]);
  if (ins.length) {
    const sel = el('select', null, ...ins.map(([v, t]) => el('option', { value: v, 'data-noi18n': '' }, t)));
    body.append(card(h2('Add obligations from the ontology'), el('p', 'note', 'CRGO lists the provisions of the legal instruments it knows, with a short paraphrase. Adding them creates a source and one obligation per provision, applicability "not assessed", owner to assign.'),
      el('div', 'row', { style: { alignItems: 'end', gap: '8px' } }, el('div', 'field', el('label', null, 'Legal instrument'), sel),
        el('button', { class: 'btn', onclick: () => { const n = addFromOntology(ws, sel.value, snap, label); touch(); toast(tr('{0} obligation(s) added').replace('{0}', n)); redraw(); } }, 'Add its provisions'))));
  }
  // obligations
  const fsel = el('select', null, ...[['all', 'All applicability states'], ...M.APPLICABILITY].map(([v, t]) => el('option', { value: v, selected: v === apFilter }, t)));
  fsel.addEventListener('change', () => { apFilter = fsel.value; redraw(); });
  const P = new Map(M.posture(ws).map(r => [r.o.id, r]));
  const rows = C.obligations;
  const view = apFilter === 'all' ? rows : rows.filter(o => (o.applicability || 'not-assessed') === apFilter);
  const reg = G.register({ title: 'Obligations', rows, prefix: 'OBL', redraw, csv: true,
    fields: [{ key: 'title', label: 'Short title', type: 'text', wide: true },
      { key: 'source', label: 'Source', type: 'select', options: [['', '—'], ...srcOpts(ws)] }, { key: 'sourceVersion', label: 'Version or edition of the source', type: 'text' },
      { key: 'provision', label: 'Provision cited (e.g. P-39.1 s. 10)', type: 'text' },
      { key: 'paraphrase', label: 'What it requires — paraphrase in your own words (never the licensed text)', type: 'area' },
      { key: 'owner', label: 'Owner', type: 'text' }, { key: 'evidenceExpected', label: 'Evidence expected', type: 'text' },
      { key: 'applicability', label: 'Applicability', type: 'select', options: M.APPLICABILITY }, { key: 'applicabilityReviewer', label: 'Applicability reviewed by', type: 'text' },
      { key: 'applicabilityRationale', label: 'Applicability rationale (facts relied on, missing facts)', type: 'area' },
      { key: 'reviewMonths', label: 'Review cycle (months)', type: 'number' }, { key: 'concept', label: 'Stable concept key', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: [['active', 'Active'], ['retired', 'Retired']] }],
    blank: () => ({ applicability: 'not-assessed', reviewMonths: 12, status: 'active', created: today() }),
    validate: M.obligationError,
    columns: ['id', { key: 'title', label: 'Obligation', render: o => el('div', null, data(o.title), o.paraphrase ? el('div', { class: 'small muted', 'data-noi18n': '' }, String(o.paraphrase).slice(0, 140)) : null,
        M.supersededBy(o, ws) ? pill(tr('superseded by {0}').replace('{0}', M.supersededBy(o, ws).id), '') : null) },
      { key: 'src', label: 'Source provision', render: o => { const s = M.source(o.source, ws); const p = prov[o.provision];
        return el('div', null, data([s?.title, o.sourceVersion].filter(Boolean).join(' · ') || '—'), el('div', 'small', p?.iri ? el('a', { href: p.iri, target: '_blank', rel: 'noopener', 'data-noi18n': '' }, o.provision) : s?.url && o.provision ? el('a', { href: s.url, target: '_blank', rel: 'noopener', 'data-noi18n': '' }, o.provision) : data(o.provision || ''))); } },
      'owner', { key: 'applicability', label: 'Applicability', render: o => apPill(o.applicability) },
      { key: 'st', label: 'State', render: o => P.get(o.id) ? stPill(P.get(o.id).state) : '—' },
      { key: 'ev', label: 'Evidence status', render: o => P.get(o.id) ? evPill(P.get(o.id).evidence) : '—' }] });
  // the register shows every record; the filter narrows the table only
  if (apFilter !== 'all') { const t = reg.querySelector('table'); if (t) t.replaceWith(table([{ key: 'id', label: 'ID' }, { key: 'title', label: 'Obligation', render: o => data(o.title) }, { key: 'owner', label: 'Owner', render: o => data(o.owner || '—') }, { key: 'a', label: 'Applicability', render: o => apPill(o.applicability) }], view, { class: 'compact' })); }
  reg.insertBefore(el('div', 'filterbar', el('div', null, fsel), el('div', 'selcount', tr('{0} of {1} obligations').replace('{0}', n0(view.length)).replace('{1}', n0(rows.length)))), reg.children[1] || null);
  body.append(reg);
  // interpretations
  body.append(G.register({ title: 'Interpretations', rows: C.interpretations, prefix: 'INT', redraw, csv: false,
    note: 'A privileged interpretation is withheld from tables, reports and AI: only its existence and review state are shown.',
    fields: [{ key: 'obligation', label: 'Obligation interpreted', type: 'select', options: [['', '—'], ...obOpts(ws)], wide: true },
      { key: 'reading', label: 'How the organisation reads it', type: 'area' }, { key: 'assumptions', label: 'Assumptions made', type: 'area' },
      { key: 'legalReview', label: 'Legal review', type: 'select', options: M.LEGAL_REVIEW }, { key: 'reviewedBy', label: 'Reviewed by (counsel)', type: 'text' }, { key: 'reviewedOn', label: 'Reviewed on', type: 'date' },
      { key: 'privileged', label: 'Legally privileged', type: 'check' }],
    blank: () => ({ legalReview: 'not-reviewed', privileged: false }),
    validate: M.interpretationError,
    columns: ['id', { key: 'obligation', label: 'Obligation', render: r => data(r.obligation) },
      { key: 'reading', label: 'Reading', render: r => r.privileged ? pill(tr('Privileged — withheld'), 'warn') : el('span', { class: 'small', 'data-noi18n': '' }, String(r.reading || '').slice(0, 160)) },
      { key: 'legalReview', label: 'Legal review', render: r => pill(tr(M.LEGAL_REVIEW.find(x => x[0] === r.legalReview)?.[1] || r.legalReview), r.legalReview === 'reviewed' ? 'good' : 'warn') }, 'reviewedBy'] }));
  // authorities
  body.append(G.register({ title: 'Regulatory authorities', rows: C.authorities, prefix: 'AUTH', redraw, csv: false,
    fields: [{ key: 'name', label: 'Name', type: 'text', wide: true }, { key: 'jurisdiction', label: 'Jurisdiction', type: 'text' }, { key: 'url', label: 'Website', type: 'text' },
      { key: 'contact', label: 'Where notifications are sent', type: 'text', wide: true }],
    blank: () => ({}), validate: r => !String(r.name || '').trim() ? 'Give the authority a name.' : null,
    columns: ['id', 'name', 'jurisdiction', 'contact'] }));
  // exemptions
  body.append(banner('warn', 'Only an authority grants an exemption', 'An exemption relieves the organisation from an obligation for a stated scope and period, on a legal basis, by decision of a regulatory authority. Risk acceptance or an internal exception never does.'));
  body.append(G.register({ title: 'Regulatory exemptions', rows: C.exemptions, prefix: 'EXM', redraw, csv: true,
    fields: [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'obligation', label: 'Obligation relieved', type: 'select', options: [['', '—'], ...obOpts(ws)] },
      { key: 'provision', label: 'Provision relieved (if no obligation is recorded)', type: 'text' },
      { key: 'authority', label: 'Granted by (authority)', type: 'select', options: [['', '—'], ...authOpts(ws)] }, { key: 'reference', label: 'Decision reference', type: 'text' },
      { key: 'legalBasis', label: 'Legal basis', type: 'text', wide: true }, { key: 'scope', label: 'Scope', type: 'area' },
      { key: 'validFrom', label: 'Applies from', type: 'date' }, { key: 'validUntil', label: 'Applies until', type: 'date' },
      { key: 'state', label: 'State', type: 'select', options: M.EXEMPTION_STATES }, { key: 'evidence', label: 'Evidence of the decision (evidence-register ID)', type: 'text' }],
    blank: () => ({ state: 'requested' }),
    validate: r => M.exemptionError(r, ws),
    columns: ['id', 'title', { key: 'obligation', label: 'Relieves', render: r => data(r.obligation || r.provision || '—') }, { key: 'authority', label: 'Authority', render: r => data(M.authority(r.authority, ws)?.name || '—') },
      { key: 'state', label: 'State', render: r => pill(tr(M.EXEMPTION_STATES.find(x => x[0] === r.state)?.[1] || r.state), M.exemptionActive(r) ? 'good' : '') }, 'validUntil'] }));
}
function addFromOntology(ws, id, snap, label) {
  const C = M.cms(ws), i = snap.legal.instruments.find(x => x.id === id);
  let src = C.sources.find(s => s.citation === id);
  if (!src) { src = { id: G.nextId(C.sources, 'SRC'), title: label(i.label), type: 'law', citation: id, status: 'in-force', licence: 'public', versions: [], url: '', origin: 'CRGO' }; C.sources.push(src); }
  let n = 0;
  for (const [key, p] of Object.entries(snap.legal.provisions).filter(([k]) => k === id || k.startsWith(id + ' '))) {
    if (C.obligations.some(o => o.provision === key)) continue;
    C.obligations.push({ id: G.nextId(C.obligations, 'OBL'), title: label(p.label) || key, source: src.id, provision: key, paraphrase: label(p.label), applicability: 'not-assessed', reviewMonths: 12, status: 'active', origin: 'CRGO', iri: p.iri, created: today() });
    n++;
  }
  LOG.data('obligations added from the ontology', id, `${n}`, ws.name);
  return n;
}

/* ---------------- programmes & frameworks ---------------- */
function programmes(body, redraw) {
  const ws = S.ws, C = M.cms(ws);
  const progOpts = opt(C.programmes, p => `${p.id} ${p.name || ''}`);
  body.append(G.register({ title: 'Compliance programmes', rows: C.programmes, prefix: 'PRG', redraw, csv: false,
    fields: [{ key: 'name', label: 'Name', type: 'text', wide: true }, { key: 'scope', label: 'Scope', type: 'area' }, { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: M.PROG_STATES }, { key: 'reviewCycle', label: 'Review cycle (months)', type: 'number' },
      { key: 'covers', label: 'Obligations covered', type: 'multi', options: obOpts(ws) }],
    blank: () => ({ status: 'draft', covers: [], reviewCycle: 12 }), validate: r => !String(r.name || '').trim() ? 'Give the programme a name.' : null,
    columns: ['id', 'name', 'owner', 'status', { key: 'covers', label: 'Obligations covered', render: r => String((r.covers || []).length) },
      { key: 'obj', label: 'Objectives', render: r => String(C.objectives.filter(o => o.programme === r.id).length) }] }));
  body.append(G.register({ title: 'Compliance objectives', rows: C.objectives, prefix: 'OBJ', redraw, csv: false,
    fields: [{ key: 'programme', label: 'Programme', type: 'select', options: [['', '—'], ...progOpts] }, { key: 'objective', label: 'Objective', type: 'text', wide: true },
      { key: 'measure', label: 'How it is measured (target)', type: 'text', wide: true }, { key: 'owner', label: 'Owner', type: 'text' }, { key: 'due', label: 'Due', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: M.OBJ_STATES }],
    blank: () => ({ status: 'planned' }), validate: r => !r.programme ? 'Choose the programme that sets this objective.' : !String(r.objective || '').trim() ? 'State the objective.' : null,
    columns: ['id', 'programme', 'objective', 'measure', 'due', 'status'] }));
  body.append(banner('warn', 'An adoption is a commitment, not compliance', 'Adopting a framework for a scope makes its requirements commitments of the organisation. Whether they are met is stated only by determinations with evidence.'));
  const fws = K.frameworkList().filter(f => !['ATTACK-M', 'CRG'].includes(f.id)).map(f => [f.id, f.short || f.name]);
  const decisions = (ws.csm?.decisions || []).map(d => [d.id, `${d.id} ${d.title || ''}`]);
  body.append(G.register({ title: 'Framework adoptions', rows: C.adoptions, prefix: 'ADP', redraw, csv: false,
    fields: [{ key: 'framework', label: 'Framework', type: 'select', options: [['', '—'], ...fws] }, { key: 'part', label: 'Part adopted (all, or functions, families…)', type: 'text' },
      { key: 'scope', label: 'Adoption scope (entities, systems, services)', type: 'area' }, { key: 'programme', label: 'Programme', type: 'select', options: [['', '—'], ...progOpts] },
      { key: 'decidedBy', label: 'Decided by', type: 'text' }, { key: 'decidedOn', label: 'Decided on', type: 'date' },
      { key: 'decision', label: 'Decision record', type: 'select', options: [['', '—'], ...decisions] }, { key: 'status', label: 'Status', type: 'select', options: [['active', 'Active'], ['planned', 'Planned'], ['withdrawn', 'Withdrawn']] }],
    blank: () => ({ status: 'active', part: 'All' }),
    validate: r => !r.framework ? 'Choose the framework adopted.' : !String(r.scope || '').trim() ? 'State the scope of the adoption.' : r.status === 'active' && (!String(r.decidedBy || '').trim() || !r.decidedOn) ? 'An adoption is a decision: enter who decided it and when.' : null,
    columns: ['id', { key: 'framework', label: 'Framework', render: r => data(fws.find(f => f[0] === r.framework)?.[1] || r.framework) }, 'part', { key: 'scope', label: 'Scope', render: r => el('span', { class: 'small', 'data-noi18n': '' }, String(r.scope || '').slice(0, 120)) }, 'decidedBy', 'decidedOn', 'status'] }));
}

/* ---------------- mappings ---------------- */
function mappings(body, redraw) {
  const ws = S.ws;
  body.append(banner('warn', 'A mapping is never compliance', 'A mapping says how a policy statement or control corresponds to an obligation: exact, full, partial, broader, narrower, related or conflicting, against which edition, why, with what confidence and who reviewed it. Only a dated compliance determination backed by evidence states a compliance state.'));
  const kv = { encode: v => v ? `${v.kind}:${v.id}` : '', decode: s => { const i = s.indexOf(':'); return i > 0 ? { kind: s.slice(0, i).trim(), id: s.slice(i + 1).trim() } : null; } };
  body.append(G.register({ title: 'Mappings', rows: SH.mappings(ws), prefix: 'MAP', redraw, csv: true,
    note: 'Kept in the shared mapping register: the same record is seen from ISP management and Shared registers.',
    fields: [{ key: 'from', label: 'From (kind:id — policy statement or control)', type: 'text', ...kv }, { key: 'to', label: 'To (kind:id — obligation or framework requirement, e.g. obligation:OBL-001)', type: 'text', ...kv },
      { key: 'type', label: 'Type', type: 'select', options: SH.MAP_TYPES }, { key: 'edition', label: 'Against which edition', type: 'text' },
      { key: 'rationale', label: 'Why', type: 'area' }, { key: 'confidence', label: 'Confidence', type: 'select', options: SH.CONFIDENCE },
      { key: 'review', label: 'Review', type: 'select', options: SH.REVIEW_STATES }, { key: 'reviewedBy', label: 'Reviewed by', type: 'text' }, { key: 'reviewed', label: 'Reviewed on', type: 'date' }],
    blank: () => ({ type: 'partial', confidence: 'medium', review: 'proposed' }),
    validate: r => (!r.from || !r.to) ? 'A mapping needs both ends, written kind:id.' : (r.review === 'reviewed' && !r.reviewedBy) ? 'A reviewed mapping needs the name of the reviewer.'
      : (['exact', 'full'].includes(r.type) && r.review === 'reviewed' && (!r.edition || !String(r.rationale || '').trim())) ? 'An exact or full-coverage mapping needs the edition and the rationale.' : null,
    columns: ['id', { key: 'from', label: 'From', render: r => r.from ? `${tr(SH.kindLabel(r.from.kind))} ${r.from.id}` : '—' }, { key: 'to', label: 'To', render: r => r.to ? `${tr(SH.kindLabel(r.to.kind))} ${r.to.id}` : '—' },
      'type', 'edition', 'confidence', 'review'] }));
  const P = M.posture(ws);
  body.append(card(h2('Coverage matrix'), el('p', 'note', 'How many qualified mappings point at each obligation, by type — beside its compliance state, which comes only from determinations.'),
    P.length ? table([{ key: 'o', label: 'Obligation', render: r => data(M.obLabel(r.o)) },
      { key: 'm', label: 'Mappings', render: r => { const m = M.mappingsTo(r.o, ws); return m.length ? el('div', 'chips', ...SH.MAP_TYPES.filter(([t]) => m.some(x => x.type === t)).map(([t, l]) => pill(`${tr(l)} × ${m.filter(x => x.type === t).length}`, ['exact', 'full'].includes(t) ? '' : 'warn'))) : pill(tr('none'), 'bad'); } },
      { key: 'r', label: 'Reviewed', render: r => { const m = M.mappingsTo(r.o, ws); return `${m.filter(x => x.review === 'reviewed').length} / ${m.length}`; } },
      { key: 's', label: 'Compliance state (determination)', render: r => stPill(r.state) }], P, { class: 'compact' }) : el('div', 'empty-state', 'No obligation recorded yet.')));
}

/* ---------------- campaigns ---------------- */
let openCamp = null;
function campaigns(body, redraw) {
  const ws = S.ws, C = M.cms(ws);
  const su = singleUser(); if (su) body.append(su);
  body.append(G.register({ title: 'Assessment campaigns', rows: C.campaigns, prefix: 'CMP', redraw, csv: false,
    fields: [{ key: 'name', label: 'Name', type: 'text', wide: true }, { key: 'programme', label: 'Programme', type: 'select', options: [['', '—'], ...opt(C.programmes, p => `${p.id} ${p.name || ''}`)] },
      { key: 'scope', label: 'Scope', type: 'area' }, { key: 'periodFrom', label: 'Assessed period from', type: 'date' }, { key: 'periodTo', label: 'Assessed period to', type: 'date' },
      { key: 'method', label: 'Method', type: 'select', options: [['manual', 'Manual'], ['assisted', 'Assisted (rules or AI proposals, reviewed)']] },
      { key: 'assessor', label: 'Assessor', type: 'text' }, { key: 'status', label: 'Status', type: 'select', options: M.CAMPAIGN_STATES.filter(s => s[0] !== 'approved') },
      { key: 'obligations', label: 'Obligations assessed', type: 'multi', options: opt(M.liveObligations(ws), o => `${o.id} ${o.title || ''}`) }],
    blank: () => ({ status: 'planned', method: 'manual', obligations: [], periodTo: today() }),
    validate: r => r.frozen ? 'This campaign is approved and frozen.' : M.campaignError(r),
    actions: r => [el('button', { class: 'btn sm', onclick: () => { openCamp = r.id; redraw(); } }, 'Assess')],
    columns: ['id', 'name', { key: 'period', label: 'Period', render: r => data(`${r.periodFrom || '…'} → ${r.periodTo || '…'}`) }, 'assessor',
      { key: 'n', label: 'Determinations', render: r => `${M.determinations(ws).filter(d => d.campaign === r.id).length} / ${(r.obligations || []).length}` },
      { key: 'status', label: 'Status', render: r => pill(tr(M.CAMPAIGN_STATES.find(s => s[0] === r.status)?.[1] || r.status), r.status === 'approved' ? 'good' : '') }] }));
  const c = C.campaigns.find(x => x.id === openCamp);
  if (c) body.append(campaignCard(ws, c, redraw));
}
const evOpts = ws => SH.evidence(ws).map(e => [e.id, `${e.id} ${e.title || ''} (${tr(M.EVIDENCE_TEXT[SH.evidenceStatus(e)])})`]);
export function determinationFields(ws, { forCampaign = false } = {}) {
  const LG_COMP = [['satisfied', 'Satisfied'], ['partially-satisfied', 'Partially satisfied'], ['unsatisfied', 'Unsatisfied'], ['not-assessed', 'Not assessed'], ['undetermined', 'Undetermined — evidence gap']];
  return [{ key: 'state', label: 'State', type: 'select', options: LG_COMP }, { key: 'date', label: 'Date', type: 'date' }, { key: 'assessor', label: 'Assessed by', type: 'text' },
    forCampaign ? { key: 'evidence', label: 'Evidence from the shared register', type: 'multi', options: evOpts(ws) } : { key: 'evidence', label: 'Evidence (references or evidence-register IDs)', type: 'list' },
    { key: 'evidenceGap', label: 'Evidence gap (what is missing)', type: 'area' }, { key: 'rootCause', label: 'Root-cause category (if not satisfied)', type: 'select', options: M.ROOT_CAUSES },
    { key: 'notes', label: 'Notes', type: 'area' }];
}
function campaignCard(ws, c, redraw) {
  const frozen = !!c.frozen;
  const ds = M.determinations(ws);
  const rows = (c.obligations || []).map(id => ({ o: M.obligation(id, ws) || { id, title: '' }, d: ds.filter(d => d.campaign === c.id && d.obligation === id).sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] }));
  const determine = r => {
    const rec = r.d || { id: G.nextId(ds, 'CD'), obligation: r.o.id, provision: r.o.provision || '', provisionVersion: r.o.sourceVersion || '', campaign: c.id, state: 'not-assessed', date: today(), assessor: c.assessor || '', evidence: [], ks: 'audit-conclusion' };
    G.edit(tr('Determination — {0}').replace('{0}', r.o.id), determinationFields(ws, { forCampaign: true }), rec, {
      note: 'Evidence comes from the shared evidence register; expired or insufficient evidence is a gap, not support. If evidence is missing, say what is missing.',
      validate: x => M.determinationError(x, ws),
      onSave: x => { if (!ds.includes(x)) ds.push(x); c.status = c.status === 'planned' ? 'in-progress' : c.status; touch(); redraw(); } });
  };
  const reviewer = el('input', { placeholder: tr('Reviewer (not the assessor)'), 'data-noi18n': '' });
  return card(h2(tr('Campaign {0} — {1}').replace('{0}', c.id).replace('{1}', c.name || '')),
    frozen ? banner('good', 'Approved and frozen', tr('Approved by {0} on {1}. Its determinations can no longer be edited; a new campaign records later results.').replace('{0}', c.frozen.by).replace('{1}', c.frozen.on)) : null,
    el('p', 'note', tr('Scope: {0} · period {1} → {2} · assessor {3}').replace('{0}', c.scope || '—').replace('{1}', c.periodFrom || '…').replace('{2}', c.periodTo || '…').replace('{3}', c.assessor || '—')),
    table([{ key: 'o', label: 'Obligation', render: r => data(M.obLabel(r.o)) }, { key: 'a', label: 'Applicability', render: r => apPill(r.o.applicability) },
      { key: 'own', label: 'Owner', render: r => data(r.o.owner || '—') },
      { key: 's', label: 'Determination', render: r => r.d ? stPill(r.d.state) : pill(tr('not yet determined'), 'warn') },
      { key: 'e', label: 'Evidence', render: r => r.d ? evPill(M.bestStatus(M.registeredEvidence(r.d, ws), r.d.date || today())) : '—' },
      { key: 'g', label: 'Evidence gap', render: r => el('span', { class: 'small', 'data-noi18n': '' }, r.d?.evidenceGap || '') },
      { key: 'b', label: '', sortable: false, render: r => frozen || r.o.applicability === 'not-applicable' ? '' : el('button', { class: 'btn sm ghost', onclick: () => determine(r) }, r.d ? 'Edit' : 'Determine') }], rows, { class: 'compact' }),
    frozen ? null : el('div', 'row', { style: { alignItems: 'end', gap: '8px', marginTop: '10px' } }, el('div', 'field', el('label', null, 'Reviewer'), reviewer),
      el('button', { class: 'btn', onclick: () => {
        try { M.approveCampaign(c, reviewer.value, ws); LOG.data('compliance campaign approved and frozen', c.id, `${c.frozen.ids.length} determination(s), reviewer ${c.frozen.by}`, ws.name); touch(); toast(tr('Campaign approved and frozen')); redraw(); }
        catch (e) { toast(tr(e.message), 'bad'); }
      } }, 'Approve and freeze')));
}

/* ---------------- calendar ---------------- */
function calendar(body, redraw) {
  const ws = S.ws, C = M.cms(ws), now = M.nowDate();
  const inc = (ws.csm?.incidents || []).filter(i => i.confirmed).map(i => [i.id, `${i.id} ${i.title || ''} (${i.confirmed})`]);
  body.append(banner('warn', 'Only a confirmed incident starts a deadline', 'An event-triggered deadline is counted from the date an incident was confirmed (Cybersecurity management → Incidents). An alert, an indicator match or an unconfirmed event never starts one.'));
  body.append(G.register({ title: 'Deadlines', rows: C.deadlines, prefix: 'DL', redraw, csv: true,
    fields: [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'obligation', label: 'Obligation that sets it', type: 'select', options: [['', '—'], ...obOpts(ws)] },
      { key: 'trigger', label: 'Kind', type: 'select', options: M.TRIGGERS }, { key: 'due', label: 'Due (calendar deadline)', type: 'date' },
      { key: 'recurrence', label: 'Recurrence', type: 'select', options: M.RECURRENCE },
      { key: 'incident', label: 'Triggering incident (blank: every confirmed incident)', type: 'select', options: [['', '—'], ...inc] },
      { key: 'personalInfoOnly', label: 'Only incidents involving personal information', type: 'check' },
      { key: 'offset', label: 'Period after the trigger', type: 'number' }, { key: 'unit', label: 'Unit', type: 'select', options: M.UNITS },
      { key: 'timeZone', label: 'Time zone', type: 'text' }, { key: 'citation', label: 'Provision setting the period', type: 'text' },
      { key: 'owner', label: 'Owner', type: 'text' }, { key: 'answeredOn', label: 'Answered on (when answered without a submission)', type: 'date' }],
    blank: () => ({ trigger: 'calendar', unit: 'hours', offset: 72, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '' }),
    validate: r => !String(r.title || '').trim() ? 'Give the deadline a title.' : r.trigger === 'calendar' && !r.due ? 'A calendar deadline needs its date.' : r.trigger === 'event' && !(Number(r.offset) > 0) ? 'An event-triggered deadline needs the period after the trigger.' : null,
    actions: r => r.trigger === 'calendar' && r.recurrence && r.answeredOn ? [el('button', { class: 'btn sm ghost', onclick: () => { r.history = [...(r.history || []), { due: r.due, answeredOn: r.answeredOn }]; r.due = roll(r.due, r.recurrence); r.answeredOn = ''; touch(); redraw(); } }, 'Next occurrence')] : [],
    columns: ['id', 'title', { key: 'trigger', label: 'Kind', render: r => tr(M.TRIGGERS.find(t => t[0] === r.trigger)?.[1] || r.trigger) },
      { key: 'rule', label: 'Rule', render: r => data(r.trigger === 'event' ? `${r.offset} ${tr(M.UNITS.find(u => u[0] === r.unit)?.[1] || r.unit).toLowerCase()}` : r.due || '—') }, 'obligation', 'owner'] }));
  const inst = M.deadlineInstances(ws, now);
  body.append(card(h2('Calendar'), el('p', 'note', 'Every occurrence with its due time and how it was computed. A deadline is answered by a submission sent for it, or by an answer recorded here.'),
    inst.length ? table([{ key: 'due', label: 'Due', render: fmtDue }, { key: 'id', label: 'Occurrence', render: x => data(x.id) }, { key: 't', label: 'Deadline', render: x => data(x.title) },
      { key: 'o', label: 'Obligation', render: x => data(x.obligation || '—') }, { key: 's', label: 'State', render: instPill },
      { key: 'e', label: 'How it is computed', render: x => el('span', { class: 'small', 'data-noi18n': '' }, x.explanation) },
      { key: 'b', label: '', sortable: false, render: x => x.answered || x.pending ? (x.submission ? data(x.submission.id) : '') : el('div', 'btnrow',
        el('button', { class: 'btn sm ghost', onclick: () => { const s = { id: G.nextId(C.submissions, 'SUB'), title: x.title, obligation: x.obligation, answers: x.id, state: 'preparation', due: (x.due || '').slice(0, 10) }; C.submissions.push(s); touch(); toast(tr('Submission {0} prepared — see Submissions').replace('{0}', s.id)); redraw(); } }, 'Prepare a submission'),
        el('button', { class: 'btn sm ghost', onclick: () => { if (x.id === x.deadline.id) x.deadline.answeredOn = today(); else (x.deadline.answeredInstances ||= {})[x.id] = today(); touch(); redraw(); } }, 'Record as answered')) }], inst, { class: 'compact' })
      : el('div', 'empty-state', 'No deadline recorded yet.')));
  const hol = el('input', { value: (C.holidays || []).join(', '), placeholder: 'YYYY-MM-DD, YYYY-MM-DD', 'data-noi18n': '' });
  hol.addEventListener('change', () => { C.holidays = hol.value.split(/[,\s]+/).filter(s => /^\d{4}-\d{2}-\d{2}$/.test(s)); touch(); redraw(); });
  body.append(card(h2('Holidays'), el('p', 'note', 'Public holidays skipped by deadlines counted in business days (the statutory calendar of the jurisdiction).'), hol));
}
function roll(due, rec) {
  const d = new Date(due + 'T00:00:00Z');
  if (rec === 'annual') d.setUTCFullYear(d.getUTCFullYear() + 1); else if (rec === 'quarterly') d.setUTCMonth(d.getUTCMonth() + 3); else d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString().slice(0, 10);
}

/* ---------------- submissions ---------------- */
function submissions(body, redraw) {
  const ws = S.ws, C = M.cms(ws), now = M.nowDate();
  const su = singleUser(); if (su) body.append(su);
  body.append(banner('warn', 'No unsupervised submission', 'The application never sends anything to an authority. A submission is recorded as sent only with the name of the person who approved it, the date sent and, once the authority acknowledges it, the receipt reference and date.'));
  const inst = M.deadlineInstances(ws, now).filter(x => !x.pending).map(x => [x.id, `${x.id} — ${x.title || ''} (${fmtDue(x)})`]);
  body.append(G.register({ title: 'Regulatory submissions', rows: C.submissions, prefix: 'SUB', redraw, csv: true,
    fields: [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'authority', label: 'Authority', type: 'select', options: [['', '—'], ...authOpts(ws)] },
      { key: 'obligation', label: 'Made under (obligation)', type: 'select', options: [['', '—'], ...obOpts(ws)] }, { key: 'answers', label: 'Deadline it answers', type: 'select', options: [['', '—'], ...inst] },
      { key: 'due', label: 'Due (if no deadline is recorded)', type: 'date' }, { key: 'state', label: 'State', type: 'select', options: M.SUB_STATES },
      { key: 'preparedBy', label: 'Prepared by', type: 'text' }, { key: 'approvedBy', label: 'Approved by (not the preparer)', type: 'text' },
      { key: 'submittedOn', label: 'Submitted on', type: 'date' }, { key: 'receiptRef', label: 'Receipt reference', type: 'text' }, { key: 'receiptOn', label: 'Acknowledged on', type: 'date' },
      { key: 'receiptEvidence', label: 'Receipt evidence (evidence-register ID)', type: 'text' }, { key: 'notes', label: 'Notes', type: 'area' }],
    blank: () => ({ state: 'preparation' }),
    validate: r => M.submissionError(r),
    columns: ['id', 'title', { key: 'authority', label: 'Authority', render: r => data(M.authority(r.authority, ws)?.name || '—') },
      { key: 'state', label: 'State', render: r => M.submissionOverdue(r, ws, now) ? pill(tr('overdue'), 'bad') : pill(tr(M.SUB_STATES.find(s => s[0] === r.state)?.[1] || r.state), r.state === 'acknowledged' ? 'good' : r.state === 'rejected' ? 'bad' : '') },
      'submittedOn', 'receiptRef', 'receiptOn', 'approvedBy'] }));
}

/* ---------------- regulatory change ---------------- */
function changes(body, redraw) {
  const ws = S.ws, C = M.cms(ws);
  const pol = (ws.isp?.policies || []).map(p => [p.id, `${p.id} ${p.title || ''}`]);
  const scen = (ws.assessment?.SCEN || []).map(s => [s.id, s.id]);
  body.append(G.register({ title: 'Regulatory changes', rows: C.changes, prefix: 'CHG', redraw, csv: true,
    note: 'Amendments create new obligation versions and work items; the original records are left unchanged.',
    fields: [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'source', label: 'Source', type: 'select', options: [['', '—'], ...srcOpts(ws)] },
      { key: 'provision', label: 'Provision', type: 'text' }, { key: 'kind', label: 'Change', type: 'select', options: M.CHANGE_KINDS },
      { key: 'oldVersion', label: 'Version before', type: 'text' }, { key: 'newVersion', label: 'Version after', type: 'text' },
      { key: 'detected', label: 'Detected on', type: 'date' }, { key: 'effective', label: 'In force from', type: 'date' },
      { key: 'summary', label: 'What changes (paraphrase)', type: 'area' }, { key: 'impact', label: 'Impact assessment', type: 'area' },
      { key: 'obligations', label: 'Obligations affected', type: 'multi', options: obOpts(ws) }, { key: 'policies', label: 'Policies affected', type: 'multi', options: pol },
      { key: 'scenarios', label: 'Risk scenarios affected', type: 'multi', options: scen },
      { key: 'owner', label: 'Owner', type: 'text' }, { key: 'status', label: 'Status', type: 'select', options: M.CHANGE_STATES }],
    blank: () => ({ kind: 'amended', status: 'detected', detected: today(), obligations: [], policies: [], scenarios: [] }),
    validate: r => !String(r.title || '').trim() ? 'Give the change a title.' : ['impact-reviewed', 'tasks-assigned', 'implemented', 'closed'].includes(r.status) && !String(r.impact || '').trim() ? 'Record the impact assessment before moving past "Scoped".' : null,
    actions: r => [el('button', { class: 'btn sm ghost', onclick: () => { const n = workItems(ws, r); touch(); toast(tr('{0} work item(s) created in Corrective actions').replace('{0}', n)); redraw(); } }, 'Create work items'),
      r.kind === 'amended' && (r.obligations || []).length ? el('button', { class: 'btn sm ghost', onclick: () => { const made = (r.obligations || []).map(id => M.obligation(id, ws)).filter(o => o && !M.supersededBy(o, ws)).map(o => M.newObligationVersion(o, r.newVersion, ws)); r.newObligations = made.map(o => o.id); touch(); toast(tr('{0} new obligation version(s)').replace('{0}', made.length)); redraw(); } }, 'New obligation versions') : null].filter(Boolean),
    columns: ['id', 'title', 'kind', 'provision', 'effective', { key: 'n', label: 'Affected', render: r => tr('{0} obligation(s) · {1} policy(ies) · {2} scenario(s)').replace('{0}', (r.obligations || []).length).replace('{1}', (r.policies || []).length).replace('{2}', (r.scenarios || []).length) }, 'status'] }));
}
/** Work items for a change: one corrective action per affected policy and scenario (none twice). Nothing else is altered. */
function workItems(ws, r) {
  const A = SH.actions(ws); let n = 0;
  const add = (kind, id, title) => {
    if (A.some(a => a.source?.kind === 'other' && a.source?.id === r.id && (a.links || []).some(l => l.kind === kind && l.id === id))) return;
    A.push({ id: G.nextId(A, 'ACT'), title, description: tr('Regulatory change {0}: {1}').replace('{0}', r.id).replace('{1}', r.title || ''), source: { kind: 'other', id: r.id }, owner: r.owner || '', due: r.effective || '', state: 'open', links: [{ kind, id }], opened: today() });
    n++;
  };
  for (const p of r.policies || []) add('policy', p, tr('Review policy {0} for regulatory change {1}').replace('{0}', p).replace('{1}', r.id));
  for (const s of r.scenarios || []) add('scenario', s, tr('Reassess scenario {0} for regulatory change {1}').replace('{0}', s).replace('{1}', r.id));
  for (const o of r.obligations || []) add('obligation', o, tr('Reassess obligation {0} for regulatory change {1}').replace('{0}', o).replace('{1}', r.id));
  if (n) { if (r.status === 'detected' || r.status === 'verified' || r.status === 'scoped' || r.status === 'impact-reviewed') r.status = r.impact ? 'tasks-assigned' : r.status; LOG.data('regulatory change work items', r.id, `${n}`, ws.name); }
  return n;
}

/* ---------------- report section ---------------- */
/** The "Compliance posture" section of the compliance report (Markdown). Never states compliance from a mapping. */
export function postureMarkdown(ws = S.ws, now = M.nowDate()) {
  const P = M.posture(ws, now), esc = s => String(s ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');
  const L = ['## Compliance posture', '',
    'State is the latest dated compliance determination; evidence status is that of the evidence it relied on (current, expired, judged insufficient or none). A mapping, a policy acknowledgement or an attestation is never compliance. Not legal advice.', ''];
  if (!P.length) { L.push('No obligation is recorded in the obligation register.', ''); return L.join('\n'); }
  L.push('| Obligation | Applicability | State | Evidence status | Exceptions without exemption | Next deadline |', '|---|---|---|---|---|---|');
  for (const r of P) L.push(`| ${esc(M.obLabel(r.o))}${r.o.provision ? ' (' + esc(r.o.provision) + ')' : ''} | ${r.applicability} | ${r.state}${r.det?.date ? ' (' + r.det.date + ')' : ''}${r.gap ? ' — evidence gap' : ''}${r.reviewOverdue ? ' — review overdue' : ''} | ${r.evidence} | ${r.exceptions} | ${r.next ? fmtDue(r.next) + (r.next.overdue ? ' (overdue)' : '') : '—'} |`);
  const D = M.dashboard(ws, now);
  L.push('', `Applicable obligations: ${D.applicable} of ${D.obligations} (${D.applicabilityNotAssessed} not assessed, ${D.applicabilityPending} awaiting qualified review, ${D.notApplicable} not applicable). ` +
    `With a current determination: ${D.currentDetermination} of ${D.applicable}. With current evidence: ${D.currentEvidence} of ${D.applicable}. ` +
    `Satisfied: ${D.satisfied} of ${D.assessed} assessed (partially ${D.partial}, unsatisfied ${D.unsatisfied}, undetermined ${D.undetermined}; ${D.notAssessed} not assessed and excluded). ` +
    `Deadlines due within 30 days: ${D.due30.length}; overdue: ${D.overdueDeadlines.length}. Submissions overdue: ${D.submissionsOverdue.length}. Exceptions concerning a legal provision without exemption: ${D.exposure.length}.`, '');
  const inst = M.deadlineInstances(ws, now);
  if (inst.length) {
    L.push('### Regulatory deadlines', '', '| Occurrence | Deadline | Obligation | Due | Answered | How it is computed |', '|---|---|---|---|---|---|');
    for (const x of inst) L.push(`| ${esc(x.id)} | ${esc(x.title)} | ${esc(x.obligation)} | ${fmtDue(x)} | ${x.answered ? 'yes, ' + x.answeredOn + (x.late ? ' (late)' : '') : x.overdue ? 'no — overdue' : 'no'} | ${esc(x.explanation)} |`);
    L.push('');
  }
  const C = M.cms(ws);
  const priv = C.interpretations.filter(i => i.privileged).length;
  if (priv) L.push(`${priv} legally privileged interpretation(s) withheld from this report.`, '');
  return L.join('\n');
}
