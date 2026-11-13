/* screenai.js — C5 (1.9.2): AI proposes the twelve screening scores of candidates, for review (decided item C5).

   The AI drafts; the analyst decides. Sent: each candidate's statement and one-line causal chain, the organization
   profile, the crown jewels, the evidence register (IDs and titles) and a summary of the dated threat-context snapshot;
   the usual payload preview applies, and so do "Treat as confidential" and "Anonymize before sending". The answer is a
   set of proposals shown in a review panel: accept a candidate whole or edit criterion by criterion first. Rules that
   hold whatever the answer says:
     • only accepted scores count (for step 6 and the totals); a proposal is nothing until accepted;
     • an analyst's existing scores are never overwritten: re-estimating keeps the new proposal beside the card
       (`rec.aiProposal`), where the analyst can read it and dismiss it;
     • EV (evidence strength) ≥ 3 must cite an evidence ID (E1, E2…) of the register in the rationale — with none cited
       EV is capped at 2; the AI has seen no organizational evidence beyond the register's titles;
     • escalation flags are only added, never removed; the disposition stays the analyst's;
     • an accepted card is marked "AI-proposed, accepted by ‹name› on ‹date›" (model kept), its rationale starts with
       "AI:" and carries the marker; the call is in the AI log (pending until accepted or dismissed); the screening CSV
       export carries the mark.
   The task is `screening_scores` (ai.js FEATURES "Screening score estimates", sensitivity medium, default workspace
   provider; the helper's policy knows the same id). When the feature is switched off, the buttons are hidden.
   No change to formulas, criteria or weighting. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, banner, toast, modal, pill, select, field } from './util.js';
import { S, touch } from './state.js';
import { tr } from './i18n.js';
import * as AI from './ai.js';
import * as aiui from './aiui.js';
import * as SC from './screening.js';
import * as MK from './markers.js';
import * as LOG from './logs.js';
import * as users from './users.js';

export const EV_CAP = 2;                 // without a cited evidence ID
const EV_INDEX = SC.CRITERIA.findIndex(c => c[0] === 'EV');
const EV_RE = /\bE\d{1,3}\b/g;
const SYSTEM = `You are a senior cybersecurity risk analyst working inside CyberRiskGuardian, a scenario-driven risk
assessment tool, helping an analyst screen candidate scenarios (book chapter 5). You propose; the analyst decides through
the application's review screen. You never invent organizational facts: where the context and the evidence register say
nothing, score from the causal chain alone and say so. Every proposal is an "${MK.ESTIMATE}". Answer with JSON only.`;

/** Is the feature switched on for this installation (per-feature routing switch; 'off' hides the buttons)? */
export const enabled = () => (AI.policy().tasks?.screening_scores || 'workspace') !== 'off';

AI.TASKS.screening_scores = {
  label: 'Screening score estimates',
  build(ws, { ids = null } = {}) {
    const list = SC.candidates(ws).filter(c => !ids || ids.includes(c.id));
    if (!list.length) throw new Error('No candidate to score.');
    const ev = (ws.assessment.EVIDENCE || []).slice(0, 60).map(e => `  ${e[0]} — ${e[1] || ''}${e[2] ? ' (' + e[2] + ')' : ''}`);
    const crown = (ws.assessment.CROWN || []).slice(0, 20).map(r => `  ${r[0]} ${r[1] || ''}${r[2] ? ' — ' + r[2] : ''}`);
    const snap = ws.snapshot ? `Threat-context snapshot ${ws.snapshot.name || ''} retrieved ${ws.snapshot.retrieved || '—'}, expires ${ws.snapshot.expires || '—'}: ${ws.snapshot.kev ?? '?'} KEV entries, ${ws.snapshot.epss ?? '?'} EPSS scores. Name this date when it informs a score.` : 'No threat-context snapshot loaded: say so where threat relevance would need one.';
    const body = [
      AI.orgContext(ws), '',
      crown.length ? 'Crown jewels:' : 'No crown jewel recorded.', ...crown, '',
      ev.length ? 'Evidence register (cite these IDs where a score rests on them):' : 'Evidence register: empty — no organizational evidence is available to you.', ...ev, '',
      snap, '',
      'Scenario screening (book ch05, Process step 6): every candidate scenario is scored 1 (very low) to 5 (very high) on twelve',
      'criteria. The total out of 60 is a screening aid, not a rule. Criteria:',
      ...SC.CRITERIA.map(([k, l, q]) => `  ${k} — ${l}: ${q}`),
      '',
      'Escalation flags (set one only when the consequence described is credible for this organization):',
      ...SC.FLAGS.map(([k, l]) => `  ${k} — ${l}`),
      '',
      `Candidates (${list.length}), statement and one-line causal chain:`,
      ...list.map(c => `${c.id} | ${c.name} | source: ${c.source || '—'} | weakness: ${c.vuln || '—'} | assets: ${c.assets || '—'} | consequence: ${c.consequence || '—'}${SC.rec(c.id, ws).draft?.statement ? ' | statement: ' + SC.rec(c.id, ws).draft.statement : ''}`),
      '',
      'Rules:',
      '- Score from the organization context, the evidence register and the chain given; nothing else is organizational evidence.',
      `- EV (evidence strength) 3 or more only when the rationale cites the evidence IDs it rests on (E1, E2…); otherwise at most ${EV_CAP}.`,
      '- Do not rank on CVSS, and do not propose risk parameters: that is not what this task is for.',
      '- One short rationale per candidate (what drove the high and low scores, the evidence IDs used). Mark anything you assume.',
      '- Confidence (High, Medium, Low): High only when the chain, the context and the evidence make the scores obvious.',
      '',
      'Return JSON only:',
      '{"scores":[{"id":"C01","scores":[3,4,2,3,4,2,3,2,2,3,3,4],"flags":["PV"],"rationale":"","confidence":"Medium"}]}',
      'The twelve scores are in the order of the criteria above (BC, AC, TR, EX, IM, RL, OR, DC, EV, RV, CU, DU).',
    ];
    return { system: SYSTEM, prompt: body.join('\n'), max_tokens: Math.min(16000, 400 * list.length + 2000), json: true };
  },
};

/** Parse an answer into clean proposals: integers 1–5, EV capped unless evidence is cited, known flags only. Unknown candidates are dropped. */
export function parse(text, ws = S.ws, ids = null) {
  const parsed = AI.parseJson(text);
  const known = new Set(SC.candidates(ws).map(c => c.id).filter(id => !ids || ids.includes(id))), flags = new Set(SC.FLAGS.map(f => f[0]));
  const evIds = new Set((ws.assessment.EVIDENCE || []).map(e => String(e[0])));
  const out = [];
  for (const x of parsed.scores || parsed.candidates || []) {
    const id = String(x.id || '').trim();
    if (!known.has(id)) continue;
    const scores = Array.isArray(x.scores) ? x.scores.slice(0, 12).map(v => { const n = Math.round(Number(v)); return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null; }) : [];
    while (scores.length < 12) scores.push(null);
    const rationale = String(x.rationale || x.why || '').trim();
    const cited = [...new Set((rationale.match(EV_RE) || []).filter(e => evIds.has(e)))];
    let capped = false;
    if (scores[EV_INDEX] !== null && scores[EV_INDEX] > EV_CAP && !cited.length) { scores[EV_INDEX] = EV_CAP; capped = true; }
    out.push({ id, scores, capped, cited, flags: (Array.isArray(x.flags) ? x.flags : []).map(f => String(f).toUpperCase()).filter(f => flags.has(f)),
      rationale, conf: ['High', 'Medium', 'Low'].includes(x.confidence) ? x.confidence : 'Low' });
  }
  return out;
}

/** Accept proposals: unscored cards take the scores; a card the analyst already scored keeps its scores and gets the proposal
 *  beside it (rec.aiProposal). Flags only added. Returns { applied: ids, beside: ids }. */
export function apply(props, ws = S.ws, { model = '', entryId = '', by = '' } = {}) {
  const applied = [], beside = [], date = new Date().toISOString().slice(0, 10);
  for (const p of props) {
    const r = SC.rec(p.id, ws);
    const why = p.rationale ? 'AI: ' + p.rationale : 'AI-proposed scores';
    if (SC.complete(r) && !r.ai) {   // the analyst's own scores: never overwritten
      r.aiProposal = { scores: p.scores.slice(), flags: p.flags.slice(), rationale: p.rationale, conf: p.conf, model, date, entryId, capped: p.capped };
      r.flags = [...new Set([...(r.flags || []), ...p.flags])];
      beside.push(p.id); continue;
    }
    const before = r.scores.slice();
    r.scores = p.scores.map((v, i) => v ?? before[i] ?? null);
    r.flags = [...new Set([...(r.flags || []), ...p.flags])];
    r.rat = why + ' — ' + MK.ESTIMATE + '.';
    if (!r.conf) r.conf = p.conf;
    r.ai = { model, date, by, entryId, capped: p.capped, cited: p.cited, before };
    delete r.aiProposal;
    applied.push(p.id);
  }
  return { applied, beside };
}

/** The mark the screening CSV export carries for a card (empty when the scores are the analyst's own). */
export const csvMark = r => r?.ai ? `AI-proposed, accepted by ${r.ai.by || '—'} on ${r.ai.date || ''}${r.ai.model ? ' (' + r.ai.model + ')' : ''}` : r?.aiProposal ? 'AI proposal beside the analyst’s scores (not accepted)' : '';

/** The whole flow from the screen: status → preview → answer → review panel → accept. Resolves with the number of cards changed. */
export async function propose(ws = S.ws, { filter = '', ids = null, unscoredOnly = false } = {}) {
  if (!enabled()) { toast(tr('Screening score estimates are switched off (Settings → AI — local & remote).'), 'bad'); return 0; }
  const st = await aiui.status(ws, 'screening_scores');
  if (!st.ok) { toast(st.why, 'bad'); return 0; }
  const f = String(filter || '').trim().toLowerCase(), C = SC.state(ws).cands;
  const list = SC.candidates(ws).filter(c => (!ids || ids.includes(c.id)) && (!f || (c.id + ' ' + c.name).toLowerCase().includes(f)) && (!unscoredOnly || !SC.complete(C[c.id])));
  if (!list.length) { toast(tr('No candidate to score.'), 'bad'); return 0; }
  const out = await aiui.request('screening_scores', { ids: list.map(c => c.id) }, { title: tr('Screening score estimates — what will be sent'), ws });
  if (!out) return 0;
  let props;
  try { props = parse(out.text, ws, list.map(c => c.id)); } catch (e) { toast(tr('The answer was not machine-readable: ') + e.message, 'bad'); AI.decide(out.entryId, 'rejected', 'unreadable answer'); return 0; }
  if (!props.length) { toast(tr('The answer named no known candidate.'), 'bad'); AI.decide(out.entryId, 'rejected', 'no known candidate'); return 0; }
  return new Promise(resolve => {
    let settled = false;
    const picks = new Map(props.map(p => [p.id, true]));
    const names = Object.fromEntries(list.map(c => [c.id, c.name]));
    // 1.9.3 (T3) — one stacked card per candidate (no 2,300 px wide table whose scroll bar sits below forty rows): the twelve criteria
    // wrap in a grid, so nothing of the review panel extends beyond the window at 1280 or 1600 px
    const rows = el('div', { class: 'sai-list' }, ...props.map(p => {
      const cb = el('input', { type: 'checkbox', checked: true, 'aria-label': tr('Accept {0}').replace('{0}', p.id), class: 'sai-pick' });
      cb.addEventListener('change', () => picks.set(p.id, cb.checked));
      const cur = SC.complete(C[p.id]) && !C[p.id].ai ? pill(tr('your scores kept ({0}) — proposal beside them').replace('{0}', SC.total(C[p.id])), 'warn') : C[p.id]?.ai ? pill(tr('AI-proposed, accepted'), '') : el('span', 'muted', tr('unscored'));
      const ev = p.cited.length ? el('span', { 'data-noi18n': '' }, p.cited.join(', ')) : p.capped ? pill(tr('none — EV capped at {0}').replace('{0}', EV_CAP), 'warn') : el('span', 'muted', '—');
      return el('div', { class: 'sai-card', 'data-id': p.id },
        el('div', 'sai-head', cb, el('b', null, p.id), el('span', { class: 'small', 'data-noi18n': '' }, names[p.id] || ''), cur),
        el('div', 'sai-grid', ...SC.CRITERIA.map(([k], i) => { const s = select([['', '·'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']], p.scores[i] == null ? '' : String(p.scores[i]), { 'aria-label': `${p.id} ${k}`, class: 'sai-score', style: { width: '56px' } });
          if (i === EV_INDEX && p.capped) s.title = tr('capped at {0}: no evidence ID cited').replace('{0}', EV_CAP);
          s.addEventListener('change', () => { p.scores[i] = s.value ? Number(s.value) : null; });
          return el('label', { class: 'sai-crit', title: tr(SC.CRITERIA[i][1]) }, el('span', 'small', k), s); })),
        el('div', 'small', el('b', null, tr('Flags'), ': '), p.flags.join(' ') || '—', ' · ', el('b', null, tr('Evidence cited'), ': '), ev),
        el('div', { class: 'small', 'data-noi18n': '' }, p.rationale));
    }));
    const by = el('input', { placeholder: 'Accepted by (name, required)', value: users.name(), id: 'sai-by', style: { maxWidth: '240px' } });
    const msg = el('div');
    const m = modal(tr('Screening scores proposed by AI — review before accepting'),
      banner('warn', MK.ESTIMATE, tr('Proposed by {0}. Only accepted scores count. Edit any criterion first; evidence strength above {1} needs an evidence ID cited in the rationale; escalation flags are only added, never removed; your own scores are never overwritten — a proposal for a candidate you scored is kept beside its card. The disposition stays yours.').replace('{0}', out.model || 'AI').replace('{1}', EV_CAP)),
      rows,
      el('div', 'row', { style: { marginTop: '10px', alignItems: 'end', gap: '8px' } }, field('<b>Accepted by</b>', by),
        el('button', { class: 'btn', id: 'sai-apply', onclick: () => {
          if (!by.value.trim()) { msg.replaceChildren(banner('bad', 'Name required', 'Acceptance is recorded with the name of the person who accepts.')); by.focus(); return; }
          const chosen = props.filter(p => picks.get(p.id));
          const r = apply(chosen, ws, { model: out.model, entryId: out.entryId, by: by.value.trim() });
          AI.decide(out.entryId, r.applied.length || r.beside.length ? 'accepted' : 'rejected', `${r.applied.length} card(s) accepted, ${r.beside.length} proposal(s) kept beside the analyst’s scores, by ${by.value.trim()}`);
          LOG.data('screening scores proposed by AI accepted', [...r.applied, ...r.beside].join(', '), `${out.model || ''} — ${tr('by')} ${by.value.trim()}`, ws.name);
          touch(); settled = true; m.close();   // 1.9.3 (T4): m.close() fires onclose → resolve(0) first; settle before closing so the screen re-renders
          toast(tr('{0} card(s) accepted, {1} proposal(s) kept beside your scores').replace('{0}', r.applied.length).replace('{1}', r.beside.length), r.applied.length + r.beside.length ? 'good' : 'warn');
          resolve(r.applied.length + r.beside.length); } }, 'Accept the ticked proposals'),
        el('button', { class: 'btn ghost', onclick: () => { AI.decide(out.entryId, 'rejected', 'proposals dismissed'); m.close(); resolve(0); } }, 'Dismiss')),
      msg);
    m.back.onclose = () => { if (!settled) resolve(0); };
  });
}
