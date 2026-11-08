/* Scenario screening — Process steps 5 to 7 (book ch05): candidates scored on twelve criteria, escalation
   flags, families, four weighting schemes, the coverage matrix, the watch list and the final portfolio.
   The arithmetic is in js/screening.js; this screen only shows and records it.
   © 2026 Marc-André Léger. All rights reserved. */
'use strict';
import { el, card, banner, kpi, pill, field, select, toast, table, download, toCSV, today, n0, n1, go, chip, modal } from '../util.js';
import { S, touch } from '../state.js';
import * as users from '../users.js';
import * as AI from '../ai.js';
import { tr } from '../i18n.js';
import * as SC from '../screening.js';
import * as MK from '../markers.js';
import * as LOG from '../logs.js';
import * as SAI from '../screenai.js';

export const HELP = {
  '': { d: 'Screen the candidates on twelve criteria, consolidate variants into families and select the portfolio — normally ten scenarios.', g: 'screening',
    h: ['Each candidate is scored 1 (very low) to 5 (very high) on twelve criteria with a one-line rationale. The total out of 60 is a screening aid, not a mechanical rule.',
      'Mandatory escalation flags stop a severe but improbable scenario from dropping out for low probability alone: leaving a flagged candidate out needs an explicit review, and is a Management decision required.',
      'Generate about 25 to 40 candidates for a portfolio of ten, never fewer than 20 (20 is the quick lab version). Do not rank on CVSS.',
      'Three ways to add candidates (Process step 5): Batch scenarios → Add the ticked rows as screening candidates; Add a candidate (by hand); Add the register’s scenarios as candidates. “Propose scores with AI” drafts the twelve scores for review: the AI never scores evidence strength above 3, and only adds escalation flags.'] },
  families: { d: 'Variants of the same exposure consolidated into families, each represented by a stronger causal scenario.', g: 'screening',
    h: ['Two candidates stay separate when their assets, threat actors, consequences, controls, owners or treatment decisions differ materially. Consolidation prevents double-counting and stops one technique from dominating the portfolio.'] },
  weights: { d: 'The selection tested under four weighting schemes: equal, impact-led, evidence-led and decision-led.', g: 'screening',
    h: ['Each family takes the highest score of its members, so variants do not add up. A family selected but not in the top ten under every scheme is selected by judgment and needs a rationale; a candidate left out that ranks in the top ten under some scheme needs an explicit review.'] },
  coverage: { d: 'The selected families against the coverage categories: a test for blind spots, not a quota to fill.', g: 'screening',
    h: ['A category is included only where the exposure is credible and material.'] },
  watch: { d: 'The candidates left out but still material, with their promotion triggers, and the evidence-collection plan.', g: 'screening',
    h: ['A flagged candidate that is not selected is either on the watch list or carries a recorded exclusion review.'] },
  final: { d: 'The final portfolio, normally ten scenarios, with the six “why this scenario?” questions and the link to the register.', g: 'screening',
    h: ['The final ten are chosen for materiality, coverage and decision usefulness — not as the ten highest totals.'] },
};

let view = 'candidates', open = null, filt = '';
const TABS = [['candidates', 'Candidates & scores'], ['families', 'Families'], ['weights', 'Weighting schemes'], ['coverage', 'Coverage matrix'], ['watch', 'Watch list & plan'], ['final', 'Final portfolio']];
const flagLabel = k => (SC.FLAGS.find(f => f[0] === k) || [k, k])[1];
const stratLabel = k => (SC.STRATEGIES.find(f => f[0] === k) || [k, k])[1];
const changed = () => { SC.state().updated = today(); touch(); };

export function render(sec, arg) {
  if (arg) view = TABS.some(t => t[0] === arg.split('/')[0]) ? arg.split('/')[0] : view;
  const ws = S.ws, A = SC.analysis(ws);
  sec.replaceChildren(el('h1', null, 'Scenario screening'));
  sec.append(el('div', 'grid g5',
    kpi('Candidates', `${n0(A.distinct)} / 20`, tr(A.guidance.kind === 'good' ? 'distinct · enough for ten' : A.guidance.kind === 'warn' ? 'distinct · quick lab version' : 'distinct · too few') + (A.list.length > A.distinct ? ' · ' + tr('{0} duplicate(s)').replace('{0}', A.list.length - A.distinct) : ''), A.guidance.kind),
    kpi('Scored', `${A.scored} / ${A.list.length}`, tr('twelve criteria and a disposition'), A.list.length && A.scored === A.list.length ? 'good' : 'warn'),
    kpi('Strategies used', n0(A.strategies.length), A.strategies.map(stratLabel).map(tr).join(', ') || tr('none recorded'), A.strategies.length >= 3 ? 'good' : 'warn'),
    kpi('Families selected', n0(A.selected.length), tr('normally ten'), A.selected.length === 10 ? 'good' : A.selected.length ? 'warn' : ''),
    kpi('Need attention', n0(A.judgmentMissing.length + A.flaggedUnreviewed.length), tr('judgments without rationale, flagged exclusions not reviewed'), A.judgmentMissing.length + A.flaggedUnreviewed.length ? 'bad' : 'good')));
  sec.append(banner(A.guidance.kind === 'good' ? 'good' : A.guidance.kind, 'Candidate count', A.guidance.text));
  if (A.list.length && A.strategies.length < 3) sec.append(el('p', 'note', 'A good candidate population uses at least three of the five generation strategies: top-down, bottom-up, threat-driven, dependency-driven and localized generic.'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of TABS) st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; history.replaceState(null, '', '#/screening/' + k); render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ candidates, families, weights, coverage, watch, final }[view] || candidates)(body, sec, A, ws);
}

/* ---------------- candidates & scores ---------------- */
function candidates(body, sec, A, ws) {
  const C = SC.state(ws).cands;
  const q = el('input', { placeholder: 'Filter by ID or name', value: filt }); q.addEventListener('input', () => { filt = q.value; draw(); });
  const holder = el('div', 'tablewrap');
  const draw = () => {
    const f = filt.trim().toLowerCase();
    const list = A.list.filter(c => !f || (c.id + ' ' + c.name).toLowerCase().includes(f));
    holder.replaceChildren(table([
      { key: 'id', label: 'ID', render: c => el('b', null, c.id) },
      { key: 'name', label: 'Candidate', render: c => el('span', 'small', c.name) },
      ...SC.CRITERIA.map(([k, l], i) => ({ key: k, label: k, num: true, labelNode: el('span', { title: tr(l) }, k), render: c => C[c.id]?.scores?.[i] ?? '·' })),
      { key: 'total', label: '/60', num: true, render: c => SC.total(C[c.id]) ?? '—', sort: c => SC.total(C[c.id]) ?? -1 },
      { key: 'flags', label: 'Flags', render: c => (C[c.id]?.flags || []).length ? el('span', { class: 'pill bad', title: C[c.id].flags.map(flagLabel).map(tr).join(', ') }, C[c.id].flags.join(' ')) : '' },
      { key: 'disp', label: 'Disposition', render: c => C[c.id]?.disp ? pill(tr(C[c.id].disp), C[c.id].disp === 'Select' ? 'good' : C[c.id].disp === 'Defer' ? '' : 'warn') : el('span', 'muted', '—') },
      { key: 'fam', label: 'Family', render: c => SC.familyOf(c.id, ws)?.id || '' },
      { key: 'act', label: '', sortable: false, render: c => el('span', 'btnrow', el('button', { class: 'btn xs ghost', onclick: () => { open = c.id; render(sec); } }, 'Score'),
        el('button', { class: 'btn xs ghost danger', 'aria-label': tr('Remove {0}').replace('{0}', c.id), title: tr('Remove this candidate'), onclick: () => removeCandidate(c, ws, sec) }, '×')) },
    ], list, { class: 'compact' }));
  };
  draw();
  const fromReg = SC.registerNotCandidates(ws);
  const unscored = A.list.filter(c => !SC.complete(C[c.id])).length;
  body.append(card(el('div', 'filterbar', el('div', 'grow', q)), holder,
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', id: 'scr-add', onclick: () => { const id = SC.addCandidate({ name: tr('New candidate'), status: 'Candidate' }, ws); changed(); open = id; render(sec); } }, 'Add a candidate'),
      el('button', { class: 'btn ghost', onclick: () => go('batch') }, 'Generate candidates in Batch scenarios'),
      // 1.9.2 (C1) — the register's scenarios as candidates (tick list), so an existing portfolio can be screened
      el('button', { class: 'btn ghost', id: 'scr-from-register', disabled: !fromReg.length, title: fromReg.length ? fromReg.map(s => s.id).join(', ') : tr('Every register scenario is already a candidate'),
        onclick: () => fromRegister(fromReg, ws, sec) }, tr('Add scenarios from the register as candidates ({0})').replace('{0}', fromReg.length)),
      // 1.9.2 (C5) — AI drafts the twelve scores for review; hidden when the feature is switched off
      SAI.enabled() ? el('button', { class: 'btn ghost', id: 'scr-ai', disabled: !unscored, onclick: () => SAI.propose(ws, { filter: filt, unscoredOnly: true }).then(n => { if (n) { changed(); render(sec); } }) },
        tr('Estimate all unscored with AI ({0})').replace('{0}', unscored)) : null,
      el('button', { class: 'btn ghost', onclick: () => download(`scenario-screening-${today()}.csv`, toCSV(SC.csvRows(ws)), 'text/csv') }, 'Export the screening (.csv)')),
    el('p', 'note', 'Scores 1 (very low) to 5 (very high). For evidence strength, 5 means direct organizational evidence and 1 means assumption only. Do not rank on CVSS.'),
    el('p', 'note', 'A candidate selected on its own (disposition Select, no family) is created in the register from its score card; a family from Final portfolio. Either way the scenario takes the candidate’s parameters, vector, links and chain.')));
  if (open && A.list.some(c => c.id === open)) body.append(scorer(sec, A.list.find(c => c.id === open), ws));
}

/* 1.9.2 (C2) — remove a candidate: confirmation naming it, its scores, flags, watch entry and family membership removed with it,
   an audit entry (who, when, id, name); refused for a member of a family selected for the portfolio. */
function removeCandidate(c, ws, sec) {
  const why = SC.removeBlock(c.id, ws); if (why) { toast(tr(why), 'bad'); return; }
  if (!window.confirm(tr('Remove candidate {0} — {1}? Its scores, flags and draft are removed with it (the register is not touched).').replace('{0}', c.id).replace('{1}', c.name))) return;
  SC.removeCandidate(c.id, ws);
  LOG.data('candidate removed', c.id, `${c.name} — ${tr('by')} ${users.name() || tr('single-user mode')}`, ws.name);
  if (users.active()) users.audit('candidate removed', `${c.id} ${c.name}`, ws);
  changed(); if (open === c.id) open = null; toast(tr('Removed {0}').replace('{0}', c.id)); render(sec);
}
/* 1.9.2 (C1) — the register's scenarios not yet candidates, as a tick list: the ticked ones become candidate rows linked to
   their scenario, origin noted; duplicates (already linked, or the same name, source and assets) are skipped. */
function fromRegister(list, ws, sec) {
  const picks = new Map(list.map(s => [s.id, true]));
  const rows = table([
    { key: 'pick', label: '', sortable: false, render: s => { const cb = el('input', { type: 'checkbox', checked: true, class: 'reg-pick', 'aria-label': s.id }); cb.addEventListener('change', () => picks.set(s.id, cb.checked)); return cb; } },
    { key: 'id', label: 'ID', render: s => el('b', null, s.id) }, { key: 'name', label: 'Scenario', render: s => el('span', { class: 'small', 'data-noi18n': '' }, s.name || '') },
    { key: 'src', label: 'Threat source', render: s => el('span', { class: 'small', 'data-noi18n': '' }, s.threat_source || '') },
    { key: 'dup', label: '', render: s => SC.hasDuplicate({ name: s.name, source: s.threat_source, assets: s.assets }, ws) ? pill(tr('duplicate — skipped'), 'warn') : '' },
  ], list, { class: 'compact' });
  const m = modal(tr('Add scenarios from the register as candidates'),
    el('p', 'note', 'Each ticked scenario becomes a candidate row linked to it (origin: the Scenario register); the register itself is not changed. A scenario already linked to a candidate or a family, or identical to an existing candidate, is skipped.'),
    el('div', 'tablewrap', rows),
    el('div', 'btnrow', { style: { marginTop: '12px' } },
      el('button', { class: 'btn', id: 'reg-add', onclick: () => {
        const ids = SC.addFromRegister(ws, list.filter(s => picks.get(s.id) && !SC.hasDuplicate({ name: s.name, source: s.threat_source, assets: s.assets }, ws)).map(s => s.id));
        LOG.data('candidates added from the register', ids.join(', '), `${ids.length} — ${tr('by')} ${users.name() || tr('single-user mode')}`, ws.name);
        changed(); m.close(); toast(tr('{0} candidate(s) added from the register').replace('{0}', ids.length), ids.length ? 'good' : 'warn'); render(sec); } }, 'Add ticked'),
      el('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancel')));
}

function scorer(sec, c, ws) {
  const r = SC.rec(c.id, ws);
  const name = el('input', { value: c.name, id: 'scr-name' }); name.addEventListener('change', () => { c.row[1] = name.value; changed(); });
  const chain = el('textarea', { rows: 2, placeholder: 'Threat → vulnerability → asset → consequence, in one sentence' }); chain.value = [c.source, c.vuln, c.assets, c.consequence].filter(Boolean).join(' → ');
  const grid = el('div', 'grid g3');
  SC.CRITERIA.forEach(([k, l, q], i) => {
    const s = select([['', '—'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']], r.scores[i] == null ? '' : String(r.scores[i]));
    s.id = 'scr-' + k;
    s.addEventListener('change', () => { r.scores[i] = s.value ? Number(s.value) : null; changed(); tot.textContent = SC.total(r) ?? '—'; });
    grid.append(field(`<b>${k}</b> ${tr(l)}`, s, tr(q)));
  });
  const tot = el('b', null, String(SC.total(r) ?? '—'));
  const rat = el('textarea', { rows: 2, id: 'scr-rat', placeholder: 'One-line rationale for the scores' }); rat.value = r.rat || ''; rat.addEventListener('input', () => { r.rat = rat.value; changed(); });
  const flags = el('div', 'chips', ...SC.FLAGS.map(([k, l]) => el('label', { class: 'chip', style: { cursor: 'pointer' } },
    el('input', { type: 'checkbox', checked: r.flags.includes(k), style: { width: 'auto', margin: 0 }, onchange: e => { r.flags = e.target.checked ? [...new Set([...r.flags, k])] : r.flags.filter(x => x !== k); changed(); } }), ' ', tr(l))));
  const strat = el('div', 'chips', ...SC.STRATEGIES.map(([k, l]) => el('label', { class: 'chip', style: { cursor: 'pointer' } },
    el('input', { type: 'checkbox', checked: r.strategy.includes(k), style: { width: 'auto', margin: 0 }, onchange: e => { r.strategy = e.target.checked ? [...new Set([...r.strategy, k])] : r.strategy.filter(x => x !== k); changed(); } }), ' ', tr(l))));
  const conf = select([['', '—'], ...SC.CONFIDENCE.map(x => [x, x])], r.conf || ''); conf.addEventListener('change', () => { r.conf = conf.value; changed(); });
  const disp = select([['', '—'], ...SC.DISPOSITIONS], r.disp || ''); disp.id = 'scr-disp'; disp.addEventListener('change', () => { r.disp = disp.value; changed(); });
  const fams = SC.state(ws).families;
  const famSel = select([['', '—'], ...fams.map(f => [f.id, f.id + ' — ' + (f.name || '').slice(0, 60)])], SC.familyOf(c.id, ws)?.id || '');
  famSel.addEventListener('change', () => { for (const f of fams) f.members = (f.members || []).filter(m => m !== c.id); const f = fams.find(x => x.id === famSel.value); if (f) f.members.push(c.id); changed(); });
  const basis = el('input', { value: r.basis || '', placeholder: 'e.g. Verified org evidence (E6) + sector' }); basis.addEventListener('input', () => { r.basis = basis.value; changed(); });
  const excl = el('textarea', { rows: 2, placeholder: 'Who reviewed the exclusion of this flagged candidate, when, and why' }); excl.value = r.exclReview || ''; excl.addEventListener('input', () => { r.exclReview = excl.value; changed(); });
  const fam = SC.familyOf(c.id, ws), linked = r.scenario && ws.assessment.SCEN.find(s => s.id === r.scenario);
  const d = r.draft;
  const draftLine = d ? el('div', 'small muted', tr('Draft carried from the candidate: {0}').replace('{0}', [
      d.params && Object.keys(d.params).length ? tr('{0} parameter(s)').replace('{0}', Object.keys(d.params).length) : '', d.cvss || d.cvss_score != null ? tr('a CVSS vector or score') : '',
      (d.attack || []).length + (d.cwe || []).length + (d.cves || []).length ? tr('{0} ATT&CK / CWE / CVE link(s)').replace('{0}', (d.attack || []).length + (d.cwe || []).length + (d.cves || []).length) : '',
      d.origin ? tr('origin {0}').replace('{0}', d.origin) : ''].filter(Boolean).join(' · ')), ' — ', tr('they go to the scenario when it is created (Process step 9 then asks for the rationale and evidence).')) : null;
  const aiLine = r.ai ? el('div', 'small', pill(tr('AI-proposed, accepted by {0} on {1}').replace('{0}', r.ai.by || '—').replace('{1}', r.ai.date || ''), 'warn'), ' ', el('span', 'muted', { 'data-noi18n': '' }, r.ai.model || ''), ' ', el('span', 'muted', MK.ESTIMATE)) : null;
  // a proposal kept beside the analyst's scores (never written over them)
  const prop = r.aiProposal ? el('div', 'small', el('b', null, tr('AI proposal beside your scores')), ' ', el('span', { 'data-noi18n': '' }, r.aiProposal.scores.map(v => v ?? '·').join(' ') + (r.aiProposal.flags.length ? ' · ' + r.aiProposal.flags.join(' ') : '')), ' — ', el('span', 'muted', { 'data-noi18n': '' }, r.aiProposal.rationale || ''), ' ', el('span', 'muted', `(${r.aiProposal.model || ''}, ${r.aiProposal.date || ''})`), ' ',
    el('button', { class: 'btn xs ghost', onclick: () => { delete r.aiProposal; changed(); render(sec); } }, 'Dismiss')) : null;
  const create = linked ? el('span', 'small', tr('In the register'), ': ', el('a', { href: '#/scenario/' + linked.id }, linked.id))
    : !fam && r.disp === 'Select' ? el('button', { class: 'btn sm', id: 'scr-create', onclick: () => promoteCandidate(c, ws) }, 'Create the scenario')
    : fam ? el('span', 'small muted', tr('Member of {0}: created from Final portfolio').replace('{0}', fam.id)) : null;
  return card({ class: 'card', id: 'scr-editor' }, el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { flex: 1, margin: 0 } }, c.id), el('span', null, tr('Total'), ' ', tot, ' / 60'),
      create,
      // 1.9.2 (C5) — AI drafts this candidate's twelve scores; a proposal beside the analyst's scores, never over them
      SAI.enabled() ? el('button', { class: 'btn sm ghost', id: 'scr-ai-one', onclick: () => SAI.propose(ws, { ids: [c.id] }).then(n => { if (n) { changed(); render(sec); } }) }, 'Estimate with AI') : null,
      // 1.9.2 (C2) — a candidate can be removed, with a confirmation and an audit entry; never a member of a selected family
      el('button', { class: 'btn sm ghost danger', id: 'scr-remove', onclick: () => removeCandidate(c, ws, sec) }, 'Remove'),
      el('button', { class: 'btn sm ghost', onclick: () => { open = null; render(sec); } }, 'Close')),
    draftLine, aiLine, prop,
    field('<b>Candidate</b>', name), field('Causal chain (from the candidate row)', chain), grid, field('Rationale', rat),
    el('label', null, el('b', null, 'Escalation flags')), flags,
    el('label', { style: { marginTop: '8px' } }, el('b', null, 'Generation strategies')), strat,
    el('div', 'grid g4', { style: { marginTop: '8px' } }, field('Selection confidence', conf), field('<b>Disposition</b>', disp), field('Family', famSel), field('Dominant evidence basis', basis)),
    r.flags.length ? field('Exclusion review (flagged candidate)', excl, tr('Leaving out a flagged candidate is a Management decision required.')) : null);
}

/* ---------------- families ---------------- */
function families(body, sec, A, ws) {
  const st = SC.state(ws), C = st.cands;
  for (const f of st.families) {
    const name = el('input', { value: f.name || '' }); name.addEventListener('input', () => { f.name = name.value; changed(); });
    const stm = el('textarea', { rows: 2, placeholder: 'The stronger causal statement that represents the family' }); stm.value = f.statement || ''; stm.addEventListener('input', () => { f.statement = stm.value; changed(); });
    const why = el('textarea', { rows: 2 }); why.value = f.rationale || ''; why.addEventListener('input', () => { f.rationale = why.value; changed(); });
    const sel = el('input', { type: 'checkbox', checked: !!f.selected, style: { width: 'auto' } }); sel.addEventListener('change', () => { f.selected = sel.checked; changed(); render(sec); });
    const best = A.units.find(u => u.kind === 'family' && u.id === f.id);
    body.append(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { flex: 1, margin: 0 } }, f.id),
        el('label', { style: { display: 'flex', gap: '6px', alignItems: 'center', margin: 0, color: 'var(--ink)' } }, sel, tr('Selected for the portfolio')),
        best?.score?.equal != null ? pill(tr('best member {0} / 60').replace('{0}', n0(best.score.equal)), '') : null,
        el('button', { class: 'btn xs ghost danger', onclick: () => { if (!window.confirm(tr('Delete family {0}? Its members stay as candidates.').replace('{0}', f.id))) return; st.families.splice(st.families.indexOf(f), 1); changed(); render(sec); } }, 'Delete')),
      field('<b>Family</b>', name), field('Consolidated statement', stm), field('Rationale', why),
      el('div', 'small muted', tr('Members'), ': ', ...(f.members || []).map(m => chip(`${m} ${SC.total(C[m]) ?? ''}`, { title: A.list.find(c => c.id === m)?.name || '' }))),
      (best?.flags || []).length ? el('div', 'small', tr('Escalation flags'), ': ', best.flags.map(flagLabel).map(tr).join(', ')) : null));
  }
  body.append(el('div', 'btnrow', el('button', { class: 'btn', id: 'fam-add', onclick: () => { st.families.push({ id: SC.nextFamilyId(ws), name: '', statement: '', members: [], selected: false, rationale: '', judgment: '', coverage: [], scenarios: [] }); changed(); render(sec); } }, 'Add a family')),
    el('p', 'note', 'Assign candidates to a family from their score card (Candidates & scores → Score → Family).'));
}

/* ---------------- weighting schemes ---------------- */
function weights(body, sec, A, ws) {
  const st = SC.state(ws);
  const units = A.units.filter(u => u.score.equal !== null).sort((a, b) => (a.rank.equal || 999) - (b.rank.equal || 999));
  body.append(card(el('p', 'note', 'Each family takes the highest weighted score of its members. Ranks are among families and the candidates not consolidated into a family.'),
    el('div', 'tablewrap', table([
      { key: 'id', label: 'Family or candidate', render: u => el('span', null, el('b', null, u.id), ' ', el('span', 'small', u.name.slice(0, 70))) },
      ...SC.SCHEMES.map(([k, l]) => ({ key: k, label: l, num: true, render: u => `${n1(u.score[k])} (#${u.rank[k]})`, sort: u => -(u.rank[k] || 999) })),
      { key: 'sel', label: 'Selected', render: u => u.selected ? pill(tr('Selected'), 'good') : '' },
      { key: 'flag', label: 'Flag', render: u => u.byJudgment ? pill(tr('Selected by judgment'), 'warn') : u.review ? pill(tr('Explicit review'), 'bad') : u.topAll ? el('span', 'small muted', tr('top ten in every scheme')) : '' },
    ], units, { class: 'compact' }))));
  const judg = A.units.filter(u => u.byJudgment);
  if (judg.length) body.append(card(el('h2', null, 'Selected by judgment — say why'), ...judg.map(u => {
    const target = u.kind === 'family' ? st.families.find(f => f.id === u.id) : SC.rec(u.id, ws);
    const key = u.kind === 'family' ? 'judgment' : 'rat';
    const t = el('textarea', { rows: 2, placeholder: 'Why this selection holds although it is not in the top ten under every scheme' }); t.value = target[key] || '';
    t.addEventListener('input', () => { target[key] = t.value; changed(); });
    return field(`<b>${u.id}</b> ${u.name.slice(0, 80)}`, t);
  })));
  const rev = A.units.filter(u => u.review);
  if (rev.length) body.append(card(el('h2', null, 'Not selected, but in the top ten under some scheme — explicit review'),
    el('ul', null, ...rev.map(u => el('li', null, el('b', null, u.id), ' ', u.name, ' — ', SC.SCHEMES.filter(([k]) => u.rank[k] <= SC.TOP).map(([, l]) => tr(l)).join(', ')))),
    el('p', 'note', 'Record the review on the candidate’s score card or put it on the watch list.')));
}

/* ---------------- coverage matrix ---------------- */
function coverage(body, sec, A, ws) {
  const st = SC.state(ws), sel = st.families.filter(f => f.selected);
  if (!sel.length) { body.append(banner('warn', 'No family selected yet', 'Select the families of the portfolio first (Families).')); return; }
  const t = el('table', 'compact');
  t.append(el('thead', null, el('tr', null, el('th', null, tr('Category')), ...sel.map(f => el('th', { title: f.name }, f.id)), el('th', 'num', '#'))));
  const tb = el('tbody');
  for (const cat of SC.CATEGORIES) {
    tb.append(el('tr', null, el('td', null, tr(cat)), ...sel.map(f => {
      const cb = el('input', { type: 'checkbox', checked: (f.coverage || []).includes(cat), style: { width: 'auto', margin: 0 } });
      cb.addEventListener('change', () => { f.coverage = cb.checked ? [...new Set([...(f.coverage || []), cat])] : (f.coverage || []).filter(x => x !== cat); changed(); render(sec); });
      return el('td', null, cb);
    }), el('td', 'num', A.coverage[cat].length ? String(A.coverage[cat].length) : pill('0', 'warn'))));
  }
  t.append(tb);
  body.append(card(el('div', 'tablewrap', t),
    A.gaps.length ? el('p', 'note', tr('Not covered: {0}. A gap is a question to answer — is the exposure credible and material here? — not a quota to fill.').replace('{0}', A.gaps.map(tr).join(', '))) : el('p', 'note', 'Every category is covered by at least one selected family.')));
}

/* ---------------- watch list & evidence plan ---------------- */
function watch(body, sec, A, ws) {
  const st = SC.state(ws), C = st.cands;
  if (A.flaggedUnreviewed.length) body.append(banner('bad', MK.MGMT, tr('Flagged candidates left out without a recorded review: {0}. Put them on the watch list or record the exclusion review.').replace('{0}', A.flaggedUnreviewed.map(c => c.id).join(', '))));
  const opts = A.list.filter(c => !st.watch.some(w => w.id === c.id)).map(c => [c.id, c.id + ' — ' + c.name.slice(0, 70)]);
  const pick = select([['', 'Choose a candidate'], ...opts], '');
  body.append(card(el('h2', null, 'Watch list'),
    st.watch.length ? el('div', 'tablewrap', table([
      { key: 'id', label: 'ID', render: w => el('b', null, w.id) },
      { key: 'n', label: 'Candidate', render: w => el('span', 'small', A.list.find(c => c.id === w.id)?.name || '') },
      { key: 'f', label: 'Flags', render: w => (C[w.id]?.flags || []).join(' ') },
      { key: 't', label: 'Promotion trigger', render: w => { const t = el('textarea', { rows: 2 }); t.value = w.trigger || ''; t.addEventListener('input', () => { w.trigger = t.value; changed(); }); return t; } },
      { key: 'o', label: 'Owner', render: w => { const t = el('input', { value: w.owner || '' }); t.addEventListener('input', () => { w.owner = t.value; changed(); }); return t; } },
      { key: 'x', label: '', sortable: false, render: w => el('button', { class: 'btn xs ghost danger', onclick: () => { st.watch.splice(st.watch.indexOf(w), 1); changed(); render(sec); } }, 'Remove') },
    ], st.watch, { class: 'compact' })) : el('p', 'small muted', 'Nothing on the watch list yet.'),
    el('div', 'row', { style: { marginTop: '8px', alignItems: 'end' } }, el('div', { style: { flex: 1 } }, field('Add to the watch list', pick)),
      el('button', { class: 'btn', id: 'watch-add', onclick: () => { if (!pick.value) return; st.watch.push({ id: pick.value, trigger: '', owner: '' }); changed(); render(sec); } }, 'Add'))));
  const P = st.plan;
  body.append(card(el('h2', null, 'Evidence-collection plan'),
    el('div', 'tablewrap', table([
      ...[['activity', 'Validation activity'], ['scenarios', 'Scenarios'], ['owner', 'By whom'], ['due', 'By when']].map(([k, l]) => ({ key: k, label: l, render: p => { const t = el('input', { value: p[k] || '' }); t.addEventListener('input', () => { p[k] = t.value; changed(); }); return t; } })),
      { key: 'x', label: '', sortable: false, render: p => el('button', { class: 'btn xs ghost danger', onclick: () => { P.splice(P.indexOf(p), 1); changed(); render(sec); } }, 'Remove') },
    ], P, { class: 'compact' })),
    el('div', 'btnrow', el('button', { class: 'btn ghost', onclick: () => { P.push({ activity: '', scenarios: '', owner: '', due: '' }); changed(); render(sec); } }, 'Add an activity'))));
}

/* ---------------- final portfolio ---------------- */
function final(body, sec, A, ws) {
  const st = SC.state(ws), sel = st.families.filter(f => f.selected);
  // 1.9.2 (decided item 20) — candidates selected on their own, outside a family, are part of the portfolio too
  const lone = A.units.filter(u => u.kind === 'cand' && u.selected).map(u => A.list.find(c => c.id === u.id)).filter(Boolean);
  if (!sel.length && !lone.length) { body.append(banner('warn', 'No family selected yet', 'Select the families of the portfolio first (Families), or give a candidate the disposition Select on its score card.')); return; }
  if (sel.length + lone.length !== 10) body.append(el('p', 'note', tr('{0} families and {1} stand-alone candidates selected. Ten is the default; another number needs the evidence to justify it.').replace('{0}', sel.length).replace('{1}', lone.length)));
  if (lone.length) body.append(card(el('h2', null, 'Selected candidates not consolidated into a family'),
    el('div', 'tablewrap', table([
      { key: 'id', label: 'ID', render: c => el('b', null, c.id) }, { key: 'name', label: 'Candidate', render: c => el('span', 'small', c.name) },
      { key: 'tot', label: '/60', num: true, render: c => SC.total(SC.rec(c.id, ws)) ?? '—' },
      { key: 'reg', label: 'Register', sortable: false, render: c => { const r = SC.rec(c.id, ws), s = r.scenario && ws.assessment.SCEN.find(x => x.id === r.scenario);
        return s ? el('a', { href: '#/scenario/' + s.id }, s.id) : el('button', { class: 'btn sm scr-create-lone', onclick: () => promoteCandidate(c, ws) }, 'Create the scenario'); } },
    ], lone, { class: 'compact' }))));
  for (const f of sel) {
    f.why ||= [];
    const u = A.units.find(x => x.kind === 'family' && x.id === f.id);
    const links = (f.scenarios || []).filter(id => ws.assessment.SCEN.some(s => s.id === id));
    body.append(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { flex: 1, margin: 0 } }, f.id + ' — ' + (f.name || '')),
        u?.byJudgment ? pill(tr('Selected by judgment'), 'warn') : pill(tr('top ten in every scheme'), 'good'),
        links.length ? el('span', 'small', tr('In the register'), ': ', ...links.map(id => el('a', { href: '#/scenario/' + id, style: { marginLeft: '4px' } }, id)))
          : el('button', { class: 'btn sm', onclick: () => promote(f, ws) }, 'Create the scenario')),
      f.statement ? el('p', 'small', f.statement) : null,
      el('details', null, el('summary', { class: 'small' }, tr('The six “why this scenario?” questions') + (SC.WHY.every((_, i) => String(f.why[i] || '').trim()) ? ' ✓' : '')),
        ...SC.WHY.map((q, i) => { const t = el('textarea', { rows: 1 }); t.value = f.why[i] || ''; t.addEventListener('input', () => { f.why[i] = t.value; changed(); }); return field(tr(q), t); }))));
  }
}
/* 1.9.2 (decided item 20) — the scenario takes everything its candidate carries (screening.js scenarioFromCandidate): the
   chain, the six parameters with their rationales and confidence, the vector, the ATT&CK / CWE / CVE links, owner and
   horizon. A family starts from its best-scored member. */
function promote(f, ws) {
  const best = SC.bestMember(f, ws);
  const s = SC.scenarioFromCandidate(best, ws, { family: f });
  ws.assessment.SCEN.push(s); (f.scenarios ||= []).push(s.id);
  if (best) SC.rec(best.id, ws).scenario = s.id;
  LOG.data('scenario created from screening', s.id, f.id + (best ? ' (draft of ' + best.id + ')' : ''), ws.name);
  touch(); toast(tr('Created {0} from {1}').replace('{0}', s.id).replace('{1}', f.id + (best ? ' · ' + best.id : ''))); go('scenario/' + s.id);
}
function promoteCandidate(c, ws) {
  const s = SC.scenarioFromCandidate(c, ws);
  ws.assessment.SCEN.push(s); SC.rec(c.id, ws).scenario = s.id;
  if (SC.rec(c.id, ws).ai?.entryId) { import('../ai.js').then(AI => AI.decide(SC.rec(c.id, ws).ai.entryId, 'accepted', `${c.id} created as ${s.id}`)); }
  LOG.data('scenario created from screening', s.id, c.id, ws.name);
  touch(); toast(tr('Created {0} from {1}').replace('{0}', s.id).replace('{1}', c.id)); go('scenario/' + s.id);
}
