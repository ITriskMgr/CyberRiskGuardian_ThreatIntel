/* screenai.js — C5 (1.9.2): AI proposes the twelve screening scores of the candidates, for review.

   The AI drafts; the analyst decides. What is sent: the organization context, the twelve criteria with their questions,
   and each candidate's one-line causal chain (id, name, threat source, weakness, assets, consequence). What comes back is
   shown in a review table, nothing is written until the analyst applies the ticked rows, and three rules hold whatever
   the answer says:
     • EV cap — evidence strength is never scored above 3 by the AI: 4 and 5 mean organizational evidence the AI has not
       seen (the analyst raises it, citing E1, E2…);
     • flags are only added — an escalation flag the analyst set is never removed by a proposal;
     • every applied score card is marked "scores proposed by AI" with the model and the date, its rationale starts with
       "AI:" and carries the marker; the AI log entry is pending until applied (accepted) or dismissed (rejected).
   The task is `screening_scores` (ai.js FEATURES; the helper's policy knows the same id). © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, banner, table, toast, modal, pill } from './util.js';
import { S, touch } from './state.js';
import { tr } from './i18n.js';
import * as AI from './ai.js';
import * as aiui from './aiui.js';
import * as SC from './screening.js';
import * as MK from './markers.js';
import * as LOG from './logs.js';

export const EV_CAP = 3;
const EV_INDEX = SC.CRITERIA.findIndex(c => c[0] === 'EV');
const SYSTEM = `You are a senior cybersecurity risk analyst working inside CyberRiskGuardian, a scenario-driven risk
assessment tool, helping an analyst screen candidate scenarios (book chapter 5). You propose; the analyst decides through
the application's review screen. You never invent organizational facts: where the context says nothing, score from the
causal chain alone and say so. Every proposal is an "${MK.ESTIMATE}". Answer with JSON only.`;

AI.TASKS.screening_scores = {
  label: 'Screening scores (Scenario screening)',
  build(ws, { ids = null } = {}) {
    const list = SC.candidates(ws).filter(c => !ids || ids.includes(c.id));
    if (!list.length) throw new Error('No candidate to score.');
    const body = [
      AI.orgContext(ws), '',
      'Scenario screening (book ch05, Process step 6): every candidate scenario is scored 1 (very low) to 5 (very high) on twelve',
      'criteria. The total out of 60 is a screening aid, not a rule. Criteria:',
      ...SC.CRITERIA.map(([k, l, q]) => `  ${k} — ${l}: ${q}`),
      '',
      'Escalation flags (set one only when the consequence described is credible for this organization):',
      ...SC.FLAGS.map(([k, l]) => `  ${k} — ${l}`),
      '',
      `Candidates (${list.length}), one-line causal chains:`,
      ...list.map(c => `${c.id} | ${c.name} | source: ${c.source || '—'} | weakness: ${c.vuln || '—'} | assets: ${c.assets || '—'} | consequence: ${c.consequence || '—'}`),
      '',
      'Rules:',
      '- Score from the organization context and the chain given; you have no organizational evidence beyond that text.',
      `- EV (evidence strength) is at most ${EV_CAP}: 4 and 5 mean direct organizational evidence, which you have not seen.`,
      '- Do not rank on CVSS, and do not propose risk parameters: that is not what this task is for.',
      '- One short rationale per candidate (what drove the high and low scores). Mark anything you assume.',
      '- Confidence: High only when the chain and the context make the scores obvious; otherwise Medium or Low.',
      '',
      'Return JSON only:',
      '{"scores":[{"id":"C01","scores":[3,4,2,3,4,2,3,2,2,3,3,4],"flags":["PV"],"rationale":"","confidence":"Medium"}]}',
      'The twelve scores are in the order of the criteria above (BC, AC, TR, EX, IM, RL, OR, DC, EV, RV, CU, DU).',
    ];
    return { system: SYSTEM, prompt: body.join('\n'), max_tokens: Math.min(16000, 400 * list.length + 1500), json: true };
  },
};

/** Parse an answer into clean proposals: integers 1–5, EV capped, known flags only. Unknown candidates are dropped. */
export function parse(text, ws = S.ws) {
  const parsed = AI.parseJson(text);
  const known = new Set(SC.candidates(ws).map(c => c.id)), flags = new Set(SC.FLAGS.map(f => f[0]));
  const out = [];
  for (const x of parsed.scores || parsed.candidates || []) {
    const id = String(x.id || '').trim();
    if (!known.has(id)) continue;
    const scores = Array.isArray(x.scores) ? x.scores.slice(0, 12).map(v => { const n = Math.round(Number(v)); return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null; }) : [];
    while (scores.length < 12) scores.push(null);
    let capped = false;
    if (scores[EV_INDEX] !== null && scores[EV_INDEX] > EV_CAP) { scores[EV_INDEX] = EV_CAP; capped = true; }
    out.push({ id, scores, capped, flags: (Array.isArray(x.flags) ? x.flags : []).map(f => String(f).toUpperCase()).filter(f => flags.has(f)),
      rationale: String(x.rationale || x.why || '').trim(), conf: ['High', 'Medium', 'Low'].includes(x.confidence) ? x.confidence : 'Low' });
  }
  return out;
}

/** Apply ticked proposals: scores replaced, flags added (never removed), rationale and marks written. Returns the ids applied. */
export function apply(props, ws = S.ws, { model = '', entryId = '' } = {}) {
  const done = [];
  for (const p of props) {
    const r = SC.rec(p.id, ws);
    const before = r.scores.slice();
    r.scores = p.scores.map((v, i) => v ?? before[i] ?? null);
    r.flags = [...new Set([...(r.flags || []), ...p.flags])];   // flags only added
    const why = p.rationale ? 'AI: ' + p.rationale : 'AI-proposed scores';
    r.rat = r.rat && !/^AI: /.test(r.rat) ? r.rat + ' — ' + why + ' — ' + MK.ESTIMATE + '.' : why + ' — ' + MK.ESTIMATE + '.';
    if (!r.conf) r.conf = p.conf;
    r.ai = { model, date: new Date().toISOString().slice(0, 10), entryId, capped: p.capped, before };
    done.push(p.id);
  }
  return done;
}

/** The whole flow from the screen: status → preview → answer → review table → apply. Resolves with the number applied. */
export async function propose(ws = S.ws, { filter = '' } = {}) {
  const st = await aiui.status(ws, 'screening_scores');
  if (!st.ok) { toast(st.why, 'bad'); return 0; }
  const f = String(filter || '').trim().toLowerCase();
  const list = SC.candidates(ws).filter(c => !f || (c.id + ' ' + c.name).toLowerCase().includes(f));
  if (!list.length) { toast(tr('No candidate to score.'), 'bad'); return 0; }
  const out = await aiui.request('screening_scores', { ids: list.map(c => c.id) }, { title: tr('Screening scores — what will be sent'), ws });
  if (!out) return 0;
  let props;
  try { props = parse(out.text, ws); } catch (e) { toast(tr('The answer was not machine-readable: ') + e.message, 'bad'); AI.decide(out.entryId, 'rejected', 'unreadable answer'); return 0; }
  if (!props.length) { toast(tr('The answer named no known candidate.'), 'bad'); AI.decide(out.entryId, 'rejected', 'no known candidate'); return 0; }
  return new Promise(resolve => {
    const C = SC.state(ws).cands;
    const picks = new Map(props.map(p => [p.id, !SC.complete(C[p.id])]));   // already-scored candidates start unticked
    const names = Object.fromEntries(list.map(c => [c.id, c.name]));
    const rows = table([
      { key: 'pick', label: '', sortable: false, render: p => { const cb = el('input', { type: 'checkbox', checked: picks.get(p.id), 'aria-label': tr('Apply to {0}').replace('{0}', p.id), class: 'sai-pick' }); cb.addEventListener('change', () => picks.set(p.id, cb.checked)); return cb; } },
      { key: 'id', label: 'ID', render: p => el('b', null, p.id) },
      { key: 'name', label: 'Candidate', render: p => el('span', { class: 'small', 'data-noi18n': '' }, names[p.id] || '') },
      ...SC.CRITERIA.map(([k], i) => ({ key: k, label: k, num: true, render: p => el('span', i === EV_INDEX && p.capped ? { title: tr('capped at {0}: the AI has seen no organizational evidence').replace('{0}', EV_CAP), class: 'pill warn' } : null, p.scores[i] ?? '·') })),
      { key: 'tot', label: '/60', num: true, render: p => p.scores.every(v => v !== null) ? String(p.scores.reduce((a, b) => a + b, 0)) : '—' },
      { key: 'flags', label: 'Flags', render: p => p.flags.join(' ') },
      { key: 'cur', label: 'Now', render: p => SC.complete(C[p.id]) ? pill(tr('scored {0}').replace('{0}', SC.total(C[p.id])), 'warn') : el('span', 'muted', '—') },
      { key: 'why', label: 'Rationale', render: p => el('span', { class: 'small', 'data-noi18n': '' }, p.rationale) },
    ], props, { class: 'compact' });
    const m = modal(tr('Scores proposed by AI — review before applying'),
      banner('warn', MK.ESTIMATE, tr('Proposed by {0}. Evidence strength is capped at {1} (the AI has seen no organizational evidence); escalation flags are only added, never removed; a candidate you already scored is unticked. Applied scores are marked on each card.').replace('{0}', out.model || 'AI').replace('{1}', EV_CAP)),
      el('div', 'tablewrap', rows),
      el('div', 'btnrow', { style: { marginTop: '12px' } },
        el('button', { class: 'btn', id: 'sai-apply', onclick: () => {
          const chosen = props.filter(p => picks.get(p.id));
          const done = apply(chosen, ws, { model: out.model, entryId: out.entryId });
          AI.decide(out.entryId, done.length ? 'accepted' : 'rejected', `${done.length} of ${props.length} score card(s) applied`);
          LOG.data('screening scores proposed by AI applied', done.join(', '), out.model || '', ws.name);
          touch(); m.close(); toast(tr('{0} score card(s) updated — review each one').replace('{0}', done.length), done.length ? 'good' : 'warn'); resolve(done.length); } }, 'Apply the ticked proposals'),
        el('button', { class: 'btn ghost', onclick: () => { AI.decide(out.entryId, 'rejected', 'proposals dismissed'); m.close(); resolve(0); } }, 'Dismiss')));
    m.back.onclose = () => resolve(0);
  });
}
