/* From candidates to scenarios — Process steps 5 to 7 (book ch05), one screen in four stages: ① Candidates · ② Screen · ③ Select ·
   ④ Create scenarios. Candidates scored on twelve criteria, escalation flags, families and unique candidates, four weighting schemes,
   the coverage matrix, the watch list and the one-click creation of the scenarios (1.9.3).
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
import * as DETAIL from '../detail.js';
import * as LOG from '../logs.js';
import * as SAI from '../screenai.js';
import * as GR from '../ontogroup.js';
import * as FAI from '../familyai.js';
import * as FD from '../ontofind.js';
import * as PR from '../ontoprop.js';

export const HELP = {
  '': { d: 'Candidates → Screen → Select → Create scenarios: the one path from the first idea to the scenarios of the register (Process steps 5 to 7).', g: 'screening',
    h: ['Four stages, left to right. Candidates: short causal statements, not yet scenarios — at least 20 (about 25 to 40 for ten). Screen: score every candidate 1 to 5 on twelve criteria and group the variants into families, or confirm a candidate as unique. Select: choose the families and unique candidates to develop, usually ten, and say why each one. Create scenarios: one click makes the scenarios of the register.',
      'The strip at the top of each stage shows where you stand and offers the one next action. The total out of 60 is a screening aid, not a rule. Do not rank on CVSS.',
      'Mandatory escalation flags stop a severe but improbable scenario from dropping out for low probability alone: leaving a flagged candidate out needs an explicit review, and is a Management decision required.',
      'Three ways to add candidates (Process step 5): Batch scenarios → Send the ticked rows to Candidates; Add a candidate (by hand); Add scenarios from the register as candidates. The ontology, the Risk Registry and the documents import also land here. “Estimate with AI” drafts the twelve scores for review: the AI never scores evidence strength above 2 unless it cites an evidence ID from the register (the screen then caps it at 2 otherwise), and only adds escalation flags.'] },
  candidates: { d: 'Stage 1 — the candidates: short causal statements, not yet scenarios. At least 20, about 25 to 40 for ten.', g: 'screening',
    h: ['Add candidates by hand, from Batch scenarios (Send the ticked rows to Candidates), from the register, from the ontology, the Risk Registry or the documents import. Duplicates are counted once.'] },
  screen: { d: 'Stage 2 — score every candidate on twelve criteria and group the variants into families, or mark a candidate unique.', g: 'screening',
    h: ['Each candidate is scored 1 (very low) to 5 (very high) on twelve criteria with a one-line rationale. Two candidates stay separate when their assets, threat actors, consequences, controls, owners or treatment decisions differ materially; variants of the same exposure are merged into a family. A candidate with no variant is marked unique.'] },
  select: { d: 'Stage 3 — choose the families and unique candidates to develop, tested under four weighting schemes and a coverage matrix.', g: 'screening',
    h: ['Each family takes the highest weighted score of its members, so variants do not add up. A selection that is not in the top ten under every scheme is selected by judgment and needs a rationale; a candidate left out that ranks in the top ten under some scheme needs an explicit review. The final ten are chosen for materiality, coverage and decision usefulness — not as the ten highest totals.'] },
  create: { d: 'Stage 4 — review what the scenarios will inherit, then create them in one click; the others go on the watch list.', g: 'screening',
    h: ['Create the scenarios makes one scenario per selected item that has none yet; a second click creates nothing. The scenario inherits the parameters and CVSS of the highest-scoring member, the links of all members, and the chain fields of the rows and the family. Candidates left out stay on the watch list with a promotion trigger.'] },
};

let view = 'candidates', open = null, filt = '';
const TABS = [['candidates', 'Candidates'], ['screen', 'Screen\u200b'], ['select', 'Select'], ['create', 'Create scenarios']];
const NUM = { candidates: '①', screen: '②', select: '③', create: '④' };
/** The tabs of earlier releases, kept as addresses: they open the stage their content moved to. */
const LEGACY = { families: 'screen', weights: 'select', coverage: 'select', watch: 'create', final: 'create' };
const flagLabel = k => (SC.FLAGS.find(f => f[0] === k) || [k, k])[1];
const stratLabel = k => (SC.STRATEGIES.find(f => f[0] === k) || [k, k])[1];
const changed = () => { SC.state().updated = today(); touch(); };
const who = () => users.name() || tr('single-user mode');

/** The progress strip: where the work stands and the one next action (all four stages, and the Process card for steps 5–7). */
export function progressStrip(ws = S.ws, { onNav = null } = {}) {
  const p = SC.progressOf(ws), n = p.next;
  const text = tr('{0} candidates · {1} scored · {2} families + {3} unique · {4} selected · {5} created')
    .replace('{0}', p.candidates).replace('{1}', p.scored).replace('{2}', p.families).replace('{3}', p.unique).replace('{4}', p.selected).replace('{5}', p.created);
  const go1 = () => {
    if (n.id === 'develop') {
      const first = ws.assessment.SCEN.find(s => s.origin && typeof s.origin === 'object') || ws.assessment.SCEN[0];
      import('./scenario.js').then(M => { M.requestTab('chain'); go(first ? 'scenario/' + first.id : 'scenario'); });
    } else go(n.route);
    onNav?.();
  };
  return el('div', { class: 'scr-strip', id: 'scr-strip', role: 'status', style: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', margin: '8px 0 12px', padding: '8px 12px', border: '1px solid var(--line, #ccc)', borderRadius: '8px' } },
    el('span', { class: 'scr-strip-text' }, text),
    el('button', { class: 'btn', id: 'scr-next', 'data-next': n.id, 'data-ro-ok': '', onclick: go1 }, tr(n.label).replace('{0}', n.n ?? '')));
}

export function render(sec, arg) {
  if (arg) { const a = arg.split('/')[0]; view = TABS.some(t => t[0] === a) ? a : LEGACY[a] || view; }
  const ws = S.ws, A = SC.analysis(ws);
  sec.replaceChildren(el('h1', null, 'From candidates to scenarios'));
  if (DETAIL.is('detailed')) sec.append(el('p', { class: 'small muted', id: 'scr-diagram' }, tr('Candidates → Screen → Select → Scenarios')));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of TABS) st.append(el('button', { role: 'tab', id: 'scr-tab-' + k, 'data-stage': k, 'aria-selected': String(view === k), onclick: () => { view = k; history.replaceState(null, '', '#/screening/' + k); render(sec); } }, NUM[k] + ' ', el('span', null, t)));
  sec.append(st, progressStrip(ws, { onNav: () => { /* the route change redraws */ } }));
  const body = el('div'); sec.append(body);
  ({ candidates: candidatesView, screen: screenView, select: selectView, create: createView }[view] || candidatesView)(body, sec, A, ws);
}


/* 1.9.3 (T6) — what “Need attention” counts, in plain words, with a button to each item. Two method rules, neither about AI:
   (1) a family or candidate that is selected but not in the top ten under every weighting scheme is “selected by judgment”: the
       analyst writes why it holds (a family: Weighting schemes → Selected by judgment — say why; a candidate: its rationale);
   (2) an escalation-flagged candidate that is left out of the selection (not selected, not consolidated) needs an explicit,
       recorded review — or a place on the watch list — because excluding a flagged scenario is a management decision.
   An accepted AI rationale counts as the rationale of a candidate; it is not a review of an exclusion, which stays a human act. */
function attention(sec, A) {
  const jump = (v, id) => () => { view = v; open = id || null; history.replaceState(null, '', '#/screening/' + v); render(sec); };
  const list = (items, mk) => el('ul', 'sai-attn', ...items.slice(0, 60).map(mk));
  const parts = [];
  if (A.judgmentMissing.length) parts.push(el('div', null, el('h3', null, tr('Selected by judgment, without a rationale ({0})').replace('{0}', A.judgmentMissing.length)),
    el('p', 'small', tr('These are selected for the portfolio although they are not in the top ten under every weighting scheme. The method asks you to write why the selection holds. A family: write it under Select → “Selected by judgment — say why”. A candidate selected on its own: write its rationale on its score card (an accepted AI rationale counts).')),
    list(A.judgmentMissing, u => el('li', null, el('b', null, u.id), ' ', String(u.name || '').slice(0, 70), ' ', el('button', { class: 'btn xs ghost', onclick: u.kind === 'family' ? jump('select') : jump('screen', u.id) }, tr(u.kind === 'family' ? 'Write the rationale' : 'Open the score card'))))));
  if (A.flaggedUnreviewed.length) parts.push(el('div', null, el('h3', null, tr('Flagged, left out and not reviewed ({0})').replace('{0}', A.flaggedUnreviewed.length)),
    el('p', 'small', tr('These candidates carry an escalation flag (set by you or added by an accepted AI proposal) but are not in a selected family and have no disposition Select or Consolidate. Excluding a flagged scenario is a management decision that must be recorded: on the score card, write who reviewed the exclusion, when and why — or add the candidate to the watch list (Create scenarios → Watch list). Selecting it or consolidating it into a family also clears it.')),
    list(A.flaggedUnreviewed, c => el('li', null, el('b', null, c.id), ' ', String(c.name || '').slice(0, 70), ' ', el('button', { class: 'btn xs ghost', onclick: jump('screen', c.id) }, tr('Open the score card'))))));
  return card(el('h2', null, tr('What “Need attention” counts')), ...parts);
}


/* ---------------- ① Candidates ---------------- */
function candidatesView(body, sec, A, ws) {
  const C = SC.state(ws).cands;
  const q = el('input', { placeholder: 'Filter by ID or name', value: filt }); q.addEventListener('input', () => { filt = q.value; draw(); });
  const holder = el('div', 'tablewrap');
  const originOf = c => { const r = C[c.id] || {}; return r.draft?.origin || (r.scenario ? 'register' : c.ref === 'consultant' ? 'consultant' : 'hand'); };
  const draw = () => {
    const f = filt.trim().toLowerCase();
    const list = A.list.filter(c => !f || (c.id + ' ' + c.name).toLowerCase().includes(f));
    holder.replaceChildren(table([
      { key: 'id', label: 'ID', render: c => el('b', null, c.id) },
      { key: 'name', label: 'Candidate', render: c => el('span', 'small', c.name) },
      { key: 'chain', label: 'Causal chain', sortable: false, render: c => el('span', { class: 'small muted', 'data-noi18n': '' }, [c.source, c.vuln, c.assets, c.consequence].filter(Boolean).join(' → ').slice(0, 140)) },
      { key: 'origin', label: 'Origin', render: c => pill(tr(originOf(c)), '') },
      { key: 'scored', label: 'Scored', render: c => SC.complete(C[c.id]) ? '✓' : '—', sort: c => (SC.complete(C[c.id]) ? 1 : 0) },
      { key: 'fam', label: 'Family', render: c => SC.familyOf(c.id, ws)?.id || (SC.isUnique(c.id, ws) ? tr('unique') : '') },
      { key: 'act', label: '', sortable: false, render: c => el('span', 'btnrow', el('button', { class: 'btn xs ghost', onclick: () => { open = c.id; view = 'screen'; history.replaceState(null, '', '#/screening/screen'); render(sec); } }, 'Score'),
        el('button', { class: 'btn xs ghost danger', 'aria-label': tr('Remove {0}').replace('{0}', c.id), title: tr('Remove this candidate'), onclick: () => removeCandidate(c, ws, sec) }, '×')) },
    ], list, { class: 'compact' }));
  };
  draw();
  const fromReg = SC.registerNotCandidates(ws);
  if (A.guidance.kind) body.append(banner(A.guidance.kind === 'good' ? 'good' : A.guidance.kind, 'Candidate count', A.guidance.text));
  if (A.list.length && A.strategies.length < 3) body.append(el('p', 'note', 'A good candidate population uses at least three of the five generation strategies: top-down, bottom-up, threat-driven, dependency-driven and localized generic.'));
  body.append(card(el('div', 'filterbar', el('div', 'grow', q)), holder,
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', id: 'scr-add', onclick: () => { const id = SC.addCandidate({ name: tr('New candidate'), status: 'Candidate' }, ws); changed(); open = id; view = 'screen'; history.replaceState(null, '', '#/screening/screen'); render(sec); } }, 'Add a candidate'),
      el('button', { class: 'btn ghost', id: 'scr-to-batch', onclick: () => go('batch') }, 'Generate candidates in Batch scenarios'),
      // 1.9.2 (C1) — the register's scenarios as candidates (tick list), so an existing portfolio can be screened
      el('button', { class: 'btn ghost', id: 'scr-from-register', disabled: !fromReg.length, title: fromReg.length ? fromReg.map(s => s.id).join(', ') : tr('Every register scenario is already a candidate'),
        onclick: () => fromRegister(fromReg, ws, sec) }, tr('Add scenarios from the register as candidates ({0})').replace('{0}', fromReg.length)),
      el('button', { class: 'btn ghost', onclick: () => download(`scenario-screening-${today()}.csv`, toCSV(SC.csvRows(ws)), 'text/csv') }, 'Export the screening (.csv)')),
    el('p', 'note', 'A candidate is a short causal statement — threat source, weakness, asset, consequence — not yet a scenario. The ontology, the Risk Registry and the documents import also land here, with their draft and their origin.')));
}

/* ---------------- ② Screen ---------------- */
function screenView(body, sec, A, ws) {
  const C = SC.state(ws).cands;
  if (A.judgmentMissing.length + A.flaggedUnreviewed.length) body.append(attention(sec, A));
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
      { key: 'fam', label: 'Family', render: c => SC.familyOf(c.id, ws)?.id || (SC.isUnique(c.id, ws) ? tr('unique') : '') },
      { key: 'act', label: '', sortable: false, render: c => el('span', 'btnrow', el('button', { class: 'btn xs ghost', onclick: () => { open = c.id; render(sec); } }, 'Score'),
        el('button', { class: 'btn xs ghost danger', 'aria-label': tr('Remove {0}').replace('{0}', c.id), title: tr('Remove this candidate'), onclick: () => removeCandidate(c, ws, sec) }, '×')) },
    ], list, { class: 'compact' }));
  };
  draw();
  const unscored = A.list.filter(c => !SC.complete(C[c.id])).length;
  body.append(el('div', 'grid g4',
    kpi('Scored', `${A.scored} / ${A.list.length}`, tr('twelve criteria (accepted AI scores count) · {0} with a disposition').replace('{0}', SC.dispositionCount(ws)), A.list.length && A.scored === A.list.length ? 'good' : 'warn'),
    kpi('Strategies used', n0(A.strategies.length), A.strategies.map(stratLabel).map(tr).join(', ') || tr('none recorded'), A.strategies.length >= 3 ? 'good' : 'warn'),
    kpi('Families', n0(A.progress.families), tr('{0} unique · {1} still to group').replace('{0}', A.progress.unique).replace('{1}', A.progress.ungrouped), A.progress.ungrouped ? 'warn' : 'good'),
    kpi('Need attention', n0(A.judgmentMissing.length + A.flaggedUnreviewed.length), tr('{0} judgment(s) without rationale · {1} flagged exclusion(s) not reviewed').replace('{0}', A.judgmentMissing.length).replace('{1}', A.flaggedUnreviewed.length), A.judgmentMissing.length + A.flaggedUnreviewed.length ? 'bad' : 'good')));
  body.append(card(el('div', 'filterbar', el('div', 'grow', q)), holder,
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      // 1.9.2 (C5) — AI drafts the twelve scores for review; hidden when the feature is switched off
      SAI.enabled() ? el('button', { class: 'btn ghost', id: 'scr-ai', disabled: !unscored, onclick: () => SAI.propose(ws, { filter: filt, unscoredOnly: true }).then(n => { if (n) { changed(); render(sec); } }) },
        tr('Estimate all unscored with AI ({0})').replace('{0}', unscored)) : null,
      FAI.enabled() ? el('button', { class: 'btn ghost', id: 'scr-fam-b', disabled: !A.list.length, onclick: () => FAI.proposeB(ws, () => { changed(); render(sec); }) }, tr('Propose families for all candidates')) : null,
      el('button', { class: 'btn ghost', onclick: () => download(`scenario-screening-${today()}.csv`, toCSV(SC.csvRows(ws)), 'text/csv') }, 'Export the screening (.csv)')),
    el('p', 'note', 'Scores 1 (very low) to 5 (very high). For evidence strength, 5 means direct organizational evidence and 1 means assumption only; an AI estimate above 2 needs a cited evidence ID, otherwise the screen caps it at 2. Do not rank on CVSS.')));
  if (open && A.list.some(c => c.id === open)) body.append(scorer(sec, A.list.find(c => c.id === open), ws));
  groupingSection(body, sec, A, ws);
}

/* ---------------- ② Screen → families and unique candidates (1.9.3) ---------------- */
const picked = new Set();
function groupingSection(body, sec, A, ws) {
  const st = SC.state(ws), C = st.cands;
  const rows = A.list.filter(c => !SC.familyOf(c.id, ws));
  body.append(card({ class: 'card', id: 'scr-group' }, el('h2', null, 'Families and unique candidates'),
    el('p', 'note', 'Variants of the same exposure belong in one family; a candidate with no variant is marked unique. A candidate can be selected in the next stage only if it is in a family or unique.'),
    el('div', 'tablewrap', rows.length ? table([
      { key: 'pick', label: '', sortable: false, render: c => { const cb = el('input', { type: 'checkbox', class: 'scr-pick', 'data-id': c.id, checked: picked.has(c.id), 'aria-label': c.id }); cb.addEventListener('change', () => { cb.checked ? picked.add(c.id) : picked.delete(c.id); }); return cb; } },
      { key: 'id', label: 'ID', render: c => el('b', null, c.id) }, { key: 'name', label: 'Candidate', render: c => el('span', 'small', c.name) },
      { key: 'state', label: 'Status', render: c => { const u = C[c.id]?.unique; return u ? pill(tr('unique'), 'good') : pill(tr(SC.needsGroup(c.id, ws) ? 'ungrouped' : 'set aside'), SC.needsGroup(c.id, ws) ? 'warn' : ''); } },
      { key: 'u', label: '', sortable: false, render: c => { const u = C[c.id]?.unique; if (u) return el('span', { class: 'small', 'data-mark': u.source || '' }, u.source === 'ontology' ? GR.markText(u) : tr('Marked unique by {0} on {1}').replace('{0}', u.by || '—').replace('{1}', String(u.at || '').slice(0, 10)), ' ', el('button', { class: 'btn xs ghost', onclick: () => { SC.clearUnique(c.id, ws); changed(); render(sec); } }, 'Unmark'));
        const why = SC.uniqueBlock(c.id, ws);
        return why ? el('span', { class: 'small muted scr-unique-why', 'data-id': c.id }, tr(why).slice(0, 160))
          : el('button', { class: 'btn xs ghost scr-unique', 'data-id': c.id, onclick: () => { const r = SC.markUnique(c.id, who(), ws); if (r) { toast(tr(r), 'bad'); return; } LOG.data('candidate marked unique', c.id, `${c.name} — ${tr('by')} ${who()}`, ws.name); changed(); render(sec); } }, 'Mark as unique'); } },
    ], rows, { class: 'compact' }) : el('p', 'small muted', 'Every candidate is in a family.')),
    el('div', 'btnrow', { style: { marginTop: '8px' } },
      el('button', { class: 'btn', id: 'scr-merge', onclick: () => mergeDialog(ws, sec) }, 'Merge into…'),
      el('button', { class: 'btn ghost', id: 'fam-add', onclick: () => { st.families.push({ id: SC.nextFamilyId(ws), name: '', statement: '', members: [], selected: false, rationale: '', judgment: '', coverage: [], scenarios: [] }); changed(); render(sec); } }, 'Add a family')),
    // slot for the ontology grouping and the AI family proposals (W2, W3): empty here
    el('div', { id: 'scr-grouping-slot' }), el('div', { id: 'scr-ai-fam-slot' })));
  GR.groupSection(body.querySelector('#scr-grouping-slot'), ws, () => render(sec));
  FAI.section(body.querySelector('#scr-ai-fam-slot'), ws, () => { changed(); render(sec); });
  ownScenarios(body, sec, A, ws);
  familiesList(body, sec, A, ws);
}
/* Own scenarios (1.9.3, W2b): candidates the ontology does not match, flagged as a theme gap, with Edit, Delete and Add to the ontology. */
function ownScenarios(body, sec, A, ws) {
  const gaps = A.list.filter(c => GR.gapOf(c.id, ws) !== null);
  if (!gaps.length) return;
  body.append(card({ class: 'card', id: 'scr-own' }, el('h2', null, tr('Own scenarios — theme gaps ({0})').replace('{0}', gaps.length)),
    el('p', { class: 'note' }, tr('No scenario of the ontology matches these candidates. They can be kept as unique own scenarios; Add to the ontology proposes them, anonymized, for this installation’s ontology.')),
    ...gaps.map(c => el('div', { class: 'scr-own-row', 'data-id': c.id }, el('b', null, c.id), ' ', el('span', { class: 'small', 'data-noi18n': '' }, c.name),
        PR.gapFlag({ kind: 'candidate', c }, ws, { theme: GR.gapOf(c.id, ws), onChange: () => render(sec),
          onEdit: () => { open = c.id; render(sec); }, onDelete: () => removeCandidate(c, ws, sec) })))));
}
/* Merge into… — the ticked candidates go to a new family or an existing one; the representative statement is editable. */
function mergeDialog(ws, sec) {
  const st = SC.state(ws), ids = [...picked].filter(i => A_has(ws, i));
  if (!ids.length) { toast(tr('Tick at least one candidate'), 'bad'); return; }
  const list = SC.candidates(ws);
  const pickF = select([['', tr('A new family')], ...st.families.map(f => [f.id, f.id + ' — ' + (f.name || '').slice(0, 60)])], '');
  const name = el('input', { value: list.find(c => c.id === ids[0])?.name || '', id: 'merge-name' });
  const stm = el('textarea', { rows: 3, id: 'merge-statement' }); stm.value = list.filter(c => ids.includes(c.id)).map(c => SC.rec(c.id, ws).draft?.statement || c.consequence).filter(Boolean)[0] || '';
  pickF.id = 'merge-target';
  const fx = () => { const f = st.families.find(x => x.id === pickF.value); if (f) { name.value = f.name || ''; stm.value = f.statement || ''; } };
  pickF.addEventListener('change', fx);
  const hadUnique = ids.filter(i => SC.rec(i, ws).unique);
  const m = modal(tr('Merge into…'),
    el('p', 'small', tr('{0} candidate(s): {1}').replace('{0}', ids.length).replace('{1}', ids.join(', '))),
    hadUnique.length ? el('p', 'note', tr('{0} marked unique will lose the mark.').replace('{0}', hadUnique.join(', '))) : null,
    field('Family', pickF), field('Name of the family', name), field('Consolidated statement (the stronger causal statement that represents the family)', stm),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', id: 'merge-ok', onclick: () => {
        const f = SC.mergeInto(ids, pickF.value ? { family: pickF.value, statement: stm.value } : { name: name.value, statement: stm.value }, ws);
        if (f && pickF.value) { f.name = name.value || f.name; }
        LOG.data('candidates merged into a family', f?.id || '', `${ids.join(', ')} — ${tr('by')} ${who()}`, ws.name);
        picked.clear(); changed(); m.close(); render(sec); } }, 'Merge'),
      el('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancel')));
}
const A_has = (ws, id) => SC.candidates(ws).some(c => c.id === id);

/* families: the consolidated statement, the rationale and the members of each (moved here from the former Families tab) */
function familiesList(body, sec, A, ws) {
  const st = SC.state(ws), C = st.cands;
  for (const f of st.families) {
    const name = el('input', { value: f.name || '' }); name.addEventListener('input', () => { f.name = name.value; changed(); });
    const stm = el('textarea', { rows: 2, placeholder: 'The stronger causal statement that represents the family' }); stm.value = f.statement || ''; stm.addEventListener('input', () => { f.statement = stm.value; changed(); });
    const why = el('textarea', { rows: 2 }); why.value = f.rationale || ''; why.addEventListener('input', () => { f.rationale = why.value; changed(); });
    const best = A.units.find(u => u.kind === 'family' && u.id === f.id);
    body.append(el('div', 'card scr-family', { 'data-family': f.id }, el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { flex: 1, margin: 0 } }, f.id),
        best?.score?.equal != null ? pill(tr('best member {0} / 60').replace('{0}', n0(best.score.equal)), '') : null,
        f.selected ? pill(tr('Selected'), 'good') : null,
        el('button', { class: 'btn xs ghost danger', onclick: () => { if (!window.confirm(tr('Delete family {0}? Its members stay as candidates.').replace('{0}', f.id))) return; st.families.splice(st.families.indexOf(f), 1); changed(); render(sec); } }, 'Delete')),
      f.ontoMark ? el('div', { class: 'small onto-mark', 'data-mark': 'ontology' }, pill(GR.markText(f.ontoMark), 'good'), ' ', el('span', { class: 'muted', 'data-noi18n': '' }, [f.ontoMark.cluster, f.ontoMark.via === 'mcp' ? 'MCP' : 'snapshot', f.ontoMark.release && 'CRGO ' + f.ontoMark.release].filter(Boolean).join(' · '))) : null,
      f.aiMark ? el('div', { class: 'small', 'data-mark': 'ai' }, pill(FAI.markText(f.aiMark), 'warn'), ' ', el('span', { class: 'muted', 'data-noi18n': '' }, [f.aiMark.key, f.aiMark.request && 'request ' + f.aiMark.request, f.aiMark.model].filter(Boolean).join(' · '))) : null,
      field('<b>Family</b>', name), field('Consolidated statement', stm), field('Rationale', why),
      el('div', 'small muted', tr('Members'), ': ', ...(f.members || []).map(m => chip(`${m} ${SC.total(C[m]) ?? ''}`, { title: A.list.find(c => c.id === m)?.name || '' })),
        ...(f.members || []).map(m => el('button', { class: 'btn xs ghost', title: tr('Take {0} out of this family').replace('{0}', m), onclick: () => { if (f.selected && (f.members || []).length <= 1) { toast(tr('A selected family keeps at least one member'), 'bad'); return; } SC.leaveFamily(m, ws); changed(); render(sec); } }, '× ' + m))),
      (best?.flags || []).length ? el('div', 'small', tr('Escalation flags'), ': ', best.flags.map(flagLabel).map(tr).join(', ')) : null));
  }
}

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
  famSel.addEventListener('change', () => { for (const f of fams) f.members = (f.members || []).filter(m => m !== c.id); const f = fams.find(x => x.id === famSel.value); if (f) { f.members.push(c.id); r.unique = null; } changed(); render(sec); });
  const basis = el('input', { value: r.basis || '', placeholder: 'e.g. Verified org evidence (E6) + sector' }); basis.addEventListener('input', () => { r.basis = basis.value; changed(); });
  const excl = el('textarea', { rows: 2, placeholder: 'Who reviewed the exclusion of this flagged candidate, when, and why' }); excl.value = r.exclReview || ''; excl.addEventListener('input', () => { r.exclReview = excl.value; changed(); });
  // 1.9.3 (W2b) — the CRGO terms the grouping uses, completed by the analyst and kept in the draft (where toDescriptor reads them)
  const termsHost = el('div', { id: 'scr-terms-host' }, el('span', { class: 'small muted' }, tr('Asking the ontology…')));
  GR.vocabulary().then(V => {
    const cur = r.draft?.crgo || {}, t = Object.fromEntries(GR.TERM_FIELDS.map(([f]) => [f, [...(cur[f] || [])]]));
    termsHost.replaceChildren(GR.termsEditor(t, V, () => { r.draft ||= {}; r.draft.crgo = { ...(r.draft.crgo || {}), ...Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.slice()])) }; changed(); }));
  }).catch(() => termsHost.replaceChildren(el('span', { class: 'small muted' }, tr('The ontology vocabulary could not be read.'))));
  const om = r.ontologyMatch;
  const ontoLine = om ? el('div', { class: 'small', id: 'scr-onto-line' }, om.gap ? pill(tr('Theme gap: {0}').replace('{0}', om.theme || ''), 'warn') : pill(tr('Ontology match'), 'good'), ' ',
    el('span', { class: 'muted', 'data-noi18n': '' }, [om.crgoId, om.cluster, om.source === 'mcp' ? 'MCP' : om.source, om.release && 'CRGO ' + om.release].filter(Boolean).join(' · '))) : null;
  const fam = SC.familyOf(c.id, ws), linked = r.scenario && ws.assessment.SCEN.find(s => s.id === r.scenario);
  const d = r.draft;
  const draftLine = d ? el('div', 'small muted', tr('Draft carried from the candidate: {0}').replace('{0}', [
      d.params && Object.keys(d.params).length ? tr('{0} parameter(s)').replace('{0}', Object.keys(d.params).length) : '', d.cvss || d.cvss_score != null ? tr('a CVSS vector or score') : '',
      (d.attack || []).length + (d.cwe || []).length + (d.cves || []).length ? tr('{0} ATT&CK / CWE / CVE link(s)').replace('{0}', (d.attack || []).length + (d.cwe || []).length + (d.cves || []).length) : '',
      d.origin ? tr('origin {0}').replace('{0}', d.origin) : '', ((d.crgo?.themes || []).length + (d.crgo?.asset_categories || []).length + (d.crgo?.threat_source_types || []).length) ? tr('CRGO terms') : ''].filter(Boolean).join(' · ')), ' — ', tr('they go to the scenario when it is created (Process step 9 then asks for the rationale and evidence).')) : null;
  const aiLine = r.ai ? el('div', 'small', pill(tr('AI-proposed, accepted by {0} on {1}').replace('{0}', r.ai.by || '—').replace('{1}', r.ai.date || ''), 'warn'), ' ', el('span', 'muted', { 'data-noi18n': '' }, r.ai.model || ''), ' ', el('span', 'muted', MK.ESTIMATE)) : null;
  // a proposal kept beside the analyst's scores (never written over them)
  const prop = r.aiProposal ? el('div', 'small', el('b', null, tr('AI proposal beside your scores')), ' ', el('span', { 'data-noi18n': '' }, r.aiProposal.scores.map(v => v ?? '·').join(' ') + (r.aiProposal.flags.length ? ' · ' + r.aiProposal.flags.join(' ') : '')), ' — ', el('span', 'muted', { 'data-noi18n': '' }, r.aiProposal.rationale || ''), ' ', el('span', 'muted', `(${r.aiProposal.model || ''}, ${r.aiProposal.date || ''})`), ' ',
    el('button', { class: 'btn xs ghost', onclick: () => { delete r.aiProposal; changed(); render(sec); } }, 'Dismiss')) : null;
  const create = linked ? el('span', 'small', tr('In the register'), ': ', el('a', { href: '#/scenario/' + linked.id }, linked.id))
    : fam ? el('span', 'small muted', tr('Member of {0}: created from Create scenarios').replace('{0}', fam.id))
    : r.unique ? el('span', 'small muted', tr('Unique: created from Create scenarios once selected')) : null;
  return card({ class: 'card', id: 'scr-editor' }, el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { flex: 1, margin: 0 } }, c.id), el('span', null, tr('Total'), ' ', tot, ' / 60'),
      create,
      // 1.9.2 (C5) — AI drafts this candidate's twelve scores; a proposal beside the analyst's scores, never over them
      SAI.enabled() ? el('button', { class: 'btn sm ghost', id: 'scr-ai-one', onclick: () => SAI.propose(ws, { ids: [c.id] }).then(n => { if (n) { changed(); render(sec); } }) }, 'Estimate with AI') : null,
      // 1.9.2 (C2) — a candidate can be removed, with a confirmation and an audit entry; never a member of a selected family
      FAI.enabled() ? el('button', { class: 'btn sm ghost', id: 'scr-fam-one', onclick: () => FAI.proposeB(ws, () => { changed(); render(sec); }, [c.id]).then(r => { if (r) { toast(tr('Proposal ready in Families and unique candidates')); document.querySelector('#scr-ai-fam-out')?.scrollIntoView?.(); } }) }, tr('Propose a family')) : null,
      el('button', { class: 'btn sm ghost danger', id: 'scr-remove', onclick: () => removeCandidate(c, ws, sec) }, 'Remove'),
      el('button', { class: 'btn sm ghost', onclick: () => { open = null; render(sec); } }, 'Close')),
    draftLine, aiLine, prop,
    field('<b>Candidate</b>', name), field('Causal chain (from the candidate row)', chain), grid, field('Rationale', rat),
    el('label', null, el('b', null, 'Escalation flags')), flags,
    el('label', { style: { marginTop: '8px' } }, el('b', null, 'Generation strategies')), strat,
    el('details', { id: 'scr-terms', style: { marginTop: '8px' } }, el('summary', { class: 'small' }, el('b', null, tr('CRGO terms for grouping with the ontology'))),
      el('p', { class: 'note' }, tr('Asset category, threat source type and themes in the ontology’s vocabulary. Nothing is guessed from the free text: complete what you know, then use Group with the ontology.')), termsHost), ontoLine,
    el('div', 'grid g4', { style: { marginTop: '8px' } }, field('Selection confidence', conf), field('<b>Disposition</b>', disp), field('Family', famSel), field('Dominant evidence basis', basis)),
    r.flags.length ? field('Exclusion review (flagged candidate)', excl, tr('Leaving out a flagged candidate is a Management decision required.')) : null);
}

/* ---------------- ③ Select ---------------- */
function selectView(body, sec, A, ws) {
  const st = SC.state(ws), p = A.progress;
  if (A.judgmentMissing.length + A.flaggedUnreviewed.length) body.append(attention(sec, A));
  const units = A.units.slice().sort((a, b) => (a.rank.equal || 999) - (b.rank.equal || 999));
  const sel = (u) => {
    const ok = SC.isSelectable(u, ws), cb = el('input', { type: 'checkbox', class: 'scr-select', 'data-id': u.id, checked: u.selected && ok, disabled: !ok, 'aria-label': u.id });
    cb.addEventListener('change', () => { const r = SC.setSelected(u, cb.checked, ws); if (r) { toast(tr(r), 'bad'); cb.checked = false; return; } changed(); render(sec); });
    return ok ? cb : el('span', null, cb, ' ', el('span', { class: 'small muted scr-greyed' }, tr('Group or mark unique first')));
  };
  body.append(card(el('h2', null, tr('Choose the scenarios to develop')),
    el('p', 'note', tr('Selected: {0} of {1}. Each family takes the highest weighted score of its members, so variants do not add up. Ranks are among families and the candidates not consolidated into a family. A candidate in no family and not marked unique cannot be selected.').replace('{0}', p.selected).replace('{1}', p.target)),
    el('div', 'tablewrap', table([
      { key: 'sel', label: 'Selected', sortable: false, render: sel },
      { key: 'id', label: 'Family or candidate', render: u => el('span', { class: SC.isSelectable(u, ws) ? '' : 'muted' }, el('b', null, u.id), ' ', el('span', 'small', String(u.name || '').slice(0, 70)), u.kind === 'cand' && SC.isUnique(u.id, ws) ? ' ' : '', u.kind === 'cand' && SC.isUnique(u.id, ws) ? pill(tr('unique'), 'good') : '') },
      ...SC.SCHEMES.map(([k, l]) => ({ key: k, label: l, num: true, render: u => u.score[k] === null ? '—' : `${n1(u.score[k])} (#${u.rank[k]})`, sort: u => -(u.rank[k] || 999) })),
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
  coverage(body, sec, A, ws);
  // the six “why this scenario?” answers of each selected item
  const chosen = SC.selectedUnits(ws, A);
  if (chosen.length) body.append(card({ class: 'card', id: 'scr-why' }, el('h2', null, 'Why each one'), ...chosen.map(u => {
    const w = SC.whyOf(u, ws), f = u.kind === 'family' ? st.families.find(x => x.id === u.id) : null;
    return el('details', { 'data-why': u.id, open: !SC.whyComplete(u, ws) }, el('summary', { class: 'small' }, el('b', null, u.id), ' ', String(u.name || '').slice(0, 60), ' — ', tr('The six “why this scenario?” questions') + (SC.whyComplete(u, ws) ? ' ✓' : '')),
      f?.statement ? el('p', 'small', f.statement) : null,
      FAI.whyDraftNode(u, ws, () => render(sec)),
      ...SC.WHY.map((q, i) => { const t = el('textarea', { rows: 1, class: 'scr-why-q' }); t.value = w[i] || ''; t.addEventListener('input', () => { w[i] = t.value; changed(); }); return field(tr(q), t); }));
  })));
}

/* ---------------- coverage matrix (in Select) ---------------- */
function coverage(body, sec, A, ws) {
  const st = SC.state(ws), sel = st.families.filter(f => f.selected);
  if (!sel.length) { body.append(banner('warn', 'No family selected yet', 'Tick the families or unique candidates to develop above, then test the coverage here.')); return; }
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
  body.append(card(el('h2', null, 'Coverage matrix'), el('div', 'tablewrap', t),
    A.gaps.length ? el('p', 'note', tr('Not covered: {0}. A gap is a question to answer — is the exposure credible and material here? — not a quota to fill.').replace('{0}', A.gaps.map(tr).join(', '))) : el('p', 'note', 'Every category is covered by at least one selected family.')));
  // 1.9.3 (W2b): themes the ontology does not cover (own scenarios), as gaps of the ontology — not of the portfolio
  const og = [...A.list.filter(c => GR.gapOf(c.id, ws) !== null).map(c => [c.id, GR.gapOf(c.id, ws)]),
    ...(ws.assessment.SCEN || []).filter(x => FD.gapTheme(x.ontologyFindings)).map(x => [x.id, FD.gapTheme(x.ontologyFindings)])];
  if (og.length) body.append(card({ class: 'card', id: 'scr-onto-gaps-card' }, el('h2', null, tr('Gaps the ontology does not cover')),
    el('p', { class: 'note' }, tr('Own scenarios: no scenario of the ontology matches them. Add them to the ontology (from the Screen stage, the review or the Scenario editor) to close the gap.')),
    el('div', { class: 'chips' }, ...og.map(([id, th]) => chip(`${id} · ${th || '—'}`)))));
}

/* ---------------- ④ Create scenarios ---------------- */
function createView(body, sec, A, ws) {
  const st = SC.state(ws), p = A.progress;
  const chosen = SC.selectedUnits(ws, A), todo = chosen.filter(u => !SC.createdScenario(u, ws));
  // selected before 1.9.3 but neither in a family nor unique: reported, never created
  const stray = A.units.filter(u => u.selected && !SC.isSelectable(u, ws));
  if (stray.length) body.append(banner('warn', tr('Selected but not grouped: {0}').replace('{0}', stray.map(u => u.id).join(', ')), 'Group or mark unique first (Screen), then they can be created.'));
  const line = u => {
    const made = SC.createdScenario(u, ws);
    let pv = null; try { pv = SC.previewScenario(u, ws); } catch { pv = null; }
    const s = pv?.s, vals = s ? SC.PARAMS_SHOWN.map(k => `${k} ${s.params?.[k]?.v ?? '—'}`).join(' · ') : '';
    return el('li', { class: 'scr-review', 'data-unit': u.id }, el('div', null, el('b', null, u.id), ' ', el('span', null, String(u.name || '').slice(0, 90)), ' ', made ? pill(tr('created') + ' ' + made.id, 'good') : pill(tr('to create'), 'warn')),
      s?.statement ? el('div', { class: 'small', 'data-noi18n': '' }, String(s.statement).slice(0, 240)) : null,
      s ? el('div', { class: 'small muted' }, tr('Inherits'), ': ', el('span', { 'data-noi18n': '' }, vals), ' · ', s.cvss ? 'CVSS ' + s.cvss.slice(0, 40) : s.cvss_score != null ? 'CVSS ' + s.cvss_score : tr('default vector'),
        ' · ', tr('{0} link(s)').replace('{0}', (s.attack || []).length + (s.cwe || []).length + (s.cves || []).length), pv?.best ? ' · ' + tr('values of {0}').replace('{0}', pv.best.id) : '') : null,
      // slot for the ontology findings of this item (W2): Edit / Delete / Dismiss
      el('div', { class: 'scr-finding-slot', 'data-findings-for': u.id }));
  };
  body.append(card({ class: 'card', id: 'scr-review' }, el('h2', null, tr('Review: {0} selected').replace('{0}', chosen.length)),
    chosen.length ? el('ul', { class: 'scr-review-list', style: { listStyle: 'none', padding: 0 } }, ...chosen.map(line)) : el('p', 'small muted', 'Nothing is selected yet: choose the scenarios in the Select stage.'),
    el('div', { id: 'scr-findings-slot' }),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn primary', id: 'scr-create-all', disabled: !todo.length, onclick: () => createAll(sec, ws) }, tr('Create the {0} scenarios').replace('{0}', todo.length)),
      !todo.length && chosen.length ? el('span', 'small', tr('All selected items are created.')) : null),
    el('p', 'note', 'Creating is never blocked by findings. A second click creates nothing: an item that already has its scenario is skipped. The scenario inherits the parameters and CVSS of the highest-scoring member, the links of all members and the chain fields of the rows and the family; every starting value is an Analytical estimate — validation required.')));
  FD.fillReview(body.querySelector('#scr-review'), ws, chosen, () => render(sec));
  watchList(body, sec, A, ws);
  planSection(body, sec, A, ws);
}
async function createAll(sec, ws) {
  // 1.9.3 (W2b): every line is validated before its scenario exists, so the scenario starts with its findings (they never block)
  for (const u of SC.selectedUnits(ws)) if (!SC.createdScenario(u, ws) && !FD.holderOf(u, ws).ontologyFindings.length) { try { await FD.validate({ kind: 'unit', u }, ws); } catch { /* findings stay empty: QC-33 reports it */ } }
  const made = SC.createSelected(ws, { by: who() });
  for (const m of made) { LOG.data('scenario created from screening', m.id, m.unit, ws.name); const r = SC.rec(m.best, ws); if (r.ai?.entryId) import('../ai.js').then(AI2 => AI2.decide(r.ai.entryId, 'accepted', `${m.best} created as ${m.id}`)); }
  touch(); changed();
  if (!made.length) { toast(tr('Nothing to create: every selected item already has its scenario'), 'warn'); render(sec); return; }
  summaryDialog(made, sec);
  render(sec);
}
function summaryDialog(made, sec) {
  const m = modal(tr('{0} scenarios created — next: step 8').replace('{0}', made.length),
    el('p', 'small', made.map(x => `${x.id} ← ${x.unit}`).join(' · ')),
    el('p', 'note', 'Step 8 develops each created scenario: causal chain, assets, controls, consequences.'),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn primary', id: 'scr-open-first', onclick: () => { m.close(); import('./scenario.js').then(M => { M.requestTab('chain'); go('scenario/' + made[0].id); }); } }, 'Open the first in the Scenario editor'),
      el('button', { class: 'btn ghost', id: 'scr-summary-close', onclick: () => m.close() }, 'Close')));
}

/* ---------------- watch list & evidence plan (in Create scenarios) ---------------- */
function watchList(body, sec, A, ws) {
  const st = SC.state(ws), C = st.cands;
  if (A.flaggedUnreviewed.length) body.append(banner('bad', MK.MGMT, tr('Flagged candidates left out without a recorded review: {0}. Put them on the watch list or record the exclusion review.').replace('{0}', A.flaggedUnreviewed.map(c => c.id).join(', '))));
  const left = SC.watchCandidates(ws, A).filter(x => !x.entry);
  const pick = select([['', 'Choose a candidate'], ...left.map(x => [x.c.id, x.c.id + ' — ' + x.c.name.slice(0, 70)])], '');
  body.append(card({ class: 'card', id: 'scr-watch' }, el('h2', null, 'Watch list'),
    el('p', 'note', 'Not selected: the strongest of these stay on the watch list, each with the event that would promote it (its promotion trigger).'),
    st.watch.length ? el('div', 'tablewrap', table([
      { key: 'id', label: 'ID', render: w => el('b', null, w.id) },
      { key: 'n', label: 'Candidate', render: w => el('span', 'small', A.list.find(c => c.id === w.id)?.name || '') },
      { key: 'f', label: 'Flags', render: w => (C[w.id]?.flags || []).join(' ') },
      { key: 't', label: 'Promotion trigger', render: w => { const t = el('textarea', { rows: 2, class: 'watch-trigger' + (String(w.trigger || '').trim() ? '' : ' empty'), 'data-id': w.id, style: String(w.trigger || '').trim() ? {} : { outline: '2px solid var(--warn, #c77700)' } }); t.value = w.trigger || ''; t.addEventListener('input', () => { w.trigger = t.value; changed(); t.style.outline = t.value.trim() ? '' : '2px solid var(--warn, #c77700)'; }); return t; } },
      { key: 'o', label: 'Owner', render: w => { const t = el('input', { value: w.owner || '' }); t.addEventListener('input', () => { w.owner = t.value; changed(); }); return t; } },
      { key: 'x', label: '', sortable: false, render: w => el('button', { class: 'btn xs ghost danger', onclick: () => { st.watch.splice(st.watch.indexOf(w), 1); changed(); render(sec); } }, 'Remove') },
    ], st.watch, { class: 'compact' })) : el('p', 'small muted', 'Nothing on the watch list yet.'),
    el('div', 'row', { style: { marginTop: '8px', alignItems: 'end' } }, el('div', { style: { flex: 1 } }, field('Add to the watch list', pick)),
      el('button', { class: 'btn', id: 'watch-add', onclick: () => { if (!pick.value) return; st.watch.push({ id: pick.value, trigger: '', owner: '' }); changed(); render(sec); } }, 'Add'),
      el('button', { class: 'btn ghost', id: 'watch-add-rest', disabled: !left.length, title: tr('Every candidate that is not selected goes on the list, each with an empty promotion trigger'), onclick: () => { for (const x of left) st.watch.push({ id: x.c.id, trigger: '', owner: '' }); changed(); render(sec); } }, tr('Put all {0} unselected on the list').replace('{0}', left.length)))));
}
function planSection(body, sec, A, ws) {
  const P = SC.state(ws).plan;
  body.append(card(el('h2', null, 'Evidence-collection plan'),
    el('div', 'tablewrap', table([
      ...[['activity', 'Validation activity'], ['scenarios', 'Scenarios'], ['owner', 'By whom'], ['due', 'By when']].map(([k, l]) => ({ key: k, label: l, render: p => { const t = el('input', { value: p[k] || '' }); t.addEventListener('input', () => { p[k] = t.value; changed(); }); return t; } })),
      { key: 'x', label: '', sortable: false, render: p => el('button', { class: 'btn xs ghost danger', onclick: () => { P.splice(P.indexOf(p), 1); changed(); render(sec); } }, 'Remove') },
    ], P, { class: 'compact' })),
    el('div', 'btnrow', el('button', { class: 'btn ghost', onclick: () => { P.push({ activity: '', scenarios: '', owner: '', due: '' }); changed(); render(sec); } }, 'Add an activity'))));
}
