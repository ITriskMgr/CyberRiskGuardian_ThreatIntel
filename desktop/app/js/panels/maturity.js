/* Maturity & resilience (1.5.5) — two instruments, kept apart because they answer different questions.
   Maturity is scored against NIST CSF 2.0 (six functions, 22 categories read from the bundled
   publisher content). Resilience is answered as questions about the six capabilities θ(ψ,A) is defined
   as, and cross-checked against the inventory of existing safeguards. Nothing here changes a stored
   value: θ is proposed and the analyst accepts it per scenario. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, select, toast, table, banner, field, kpi, n1, n2, today, go } from '../util.js';
import { S, touch, scen } from '../state.js';
import * as MT from '../maturity.js';
import * as SG from '../safeguards.js';
import { lineChart } from '../charts.js';

let view = 'maturity';
let fnFilter = 'all';
let scope = 'all';

export function render(sec) {
  const ws = S.ws;
  MT.state(ws);
  sec.replaceChildren(el('h1', null, 'Maturity & resilience'),
    el('p', 'lede', 'How well this organization does cybersecurity as a practice, and whether it can actually prevent, detect, contain, respond, recover and keep running. The first is scored against NIST CSF 2.0 for management; the second answers directly to θ(ψ,A) in the model. Both are dated, both keep a history, and both propose rather than decide.'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['maturity', 'Maturity (CSF 2.0)'], ['resilience', 'Resilience (θ)'],
                        ['theta', 'The two readings'], ['history', `History (${MT.history(ws).length})`], ['about', 'Method']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ maturity: maturityView, resilience: resilienceView, theta: thetaView, history: historyView, about }[view])(body, sec);
}

/* ---------------- maturity ---------------- */
function maturityView(body, sec) {
  const ws = S.ws, M = MT.state(ws), m = MT.maturity(ws), g = MT.scenarioGuidance(ws);
  body.append(el('div', 'grid g4',
    kpi('Overall maturity', m.overall === null ? '—' : n2(m.overall) + ' / 5', `${m.done} of ${m.of} categories scored`, m.overall === null ? 'warn' : m.overall >= 3 ? 'good' : 'warn'),
    kpi('Target', m.target === null ? 'not set' : n2(m.target) + ' / 5', 'the level this organization is aiming for'),
    kpi('Categories below target', String(m.gaps.length), m.gaps.length ? 'worst: ' + m.gaps[0].key : 'none', m.gaps.length ? 'warn' : 'good'),
    kpi('Scenarios this suggests', String(g.n), g.measured ? 'from the measured level' : 'maturity not assessed yet', g.measured ? '' : 'warn')));

  if (m.done === 0) body.append(banner('warn', 'Nothing scored yet',
    'Score the categories that matter to this organization — not all 22 at once. An unscored category is left out of the average rather than counted as zero, so a partial assessment is still honest.'));

  const props = MT.proposeFromInventory(ws);
  if (props.length) body.append(banner('', `${props.length} categor${props.length === 1 ? 'y' : 'ies'} can be proposed from the inventory`,
    el('div', null, el('div', null, 'The inventory of existing safeguards records which framework controls each safeguard implements. Where those point at a CSF 2.0 category, a level can be proposed — never above 3, because the inventory cannot tell a defined practice from a managed one.'),
      el('div', { style: { marginTop: '6px' } }, el('button', { class: 'btn sm', onclick: () => {
        let n = 0;
        for (const p of props) if (!Number.isFinite(Number(M.scores[p.key]))) { M.scores[p.key] = p.level; M.evidence[p.key] = p.why; n++; }
        touch(); toast(n ? `${n} categories filled from the inventory — review each one` : 'Every proposed category is already scored'); render(sec);
      } }, 'Fill the unscored ones from the inventory')))));

  const fnSel = select([['all', 'Every function'], ...MT.FUNCTIONS.map(([k, l]) => [k, k + ' · ' + l])], fnFilter);
  fnSel.addEventListener('change', () => { fnFilter = fnSel.value; render(sec); });
  body.append(card(el('div', 'row', { style: { alignItems: 'center' } }, fnSel,
      el('span', 'small muted', { style: { flex: 1 } }, 'Scored 0 to 5. Leave a category blank rather than guessing it.'),
      el('button', { class: 'btn sm ghost', onclick: () => {
        const v = prompt('Set a target level for every category (0 to 5). This is the level the organization is aiming for, not where it is.');
        if (v === null) return;
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0 || n > 5) { toast('A level between 0 and 5', 'bad'); return; }
        for (const c of MT.categories()) M.targets[c.key] = n;
        touch(); toast('Target set on every category'); render(sec);
      } }, 'Set one target everywhere')),
    el('div', 'grid g3', { style: { marginBottom: '10px' } }, ...m.byFn.map(f =>
      kpi(f.key + ' · ' + f.label, f.score === null ? '—' : n1(f.score), `${f.done} of ${f.of} scored` + (f.target === null ? '' : ` · target ${n1(f.target)}`),
        f.score === null ? '' : f.target !== null && f.score < f.target ? 'warn' : 'good'))),
    table([
      { key: 'key', label: 'Category', render: c => el('div', null, el('b', { 'data-noi18n': '' }, c.key), ' ', el('span', { 'data-noi18n': '' }, c.title),
          el('div', 'small muted', `${MT.FUNCTION[c.fn].label} · ${c.n} subcategories`)) },
      { key: 'score', label: 'Level', sortable: false, render: c => {
          const s = select([['', '—'], ...MT.LEVELS.map(([v, l]) => [String(v), `${v} ${l}`])], Number.isFinite(c.score) ? String(c.score) : '');
          s.addEventListener('change', () => { if (s.value === '') delete M.scores[c.key]; else M.scores[c.key] = +s.value; touch(); render(sec); });
          return s; } },
      { key: 'target', label: 'Target', sortable: false, render: c => {
          const s = select([['', '—'], ...MT.LEVELS.map(([v]) => [String(v), String(v)])], Number.isFinite(c.target) ? String(c.target) : '');
          s.addEventListener('change', () => { if (s.value === '') delete M.targets[c.key]; else M.targets[c.key] = +s.value; touch(); render(sec); });
          return s; } },
      { key: 'gap', label: 'Gap', num: true, render: c => Number.isFinite(c.score) && Number.isFinite(c.target)
          ? (c.score < c.target ? pill('−' + n1(c.target - c.score), 'warn') : pill('met', 'good')) : '—' },
      { key: 'evidence', label: 'Evidence', sortable: false, render: c => {
          const i = el('input', { type: 'text', value: c.evidence, placeholder: 'what someone could check' });
          i.addEventListener('input', () => { M.evidence[c.key] = i.value; touch(); });
          return i; } },
    ], fnFilter === 'all' ? m.cats : m.cats.filter(c => c.fn === fnFilter), { class: 'compact' })));

  body.append(recordCard(sec));
}

/* ---------------- resilience ---------------- */
function resilienceView(body, sec) {
  const ws = S.ws, M = MT.state(ws), r = MT.resilience(ws), qt = MT.questionnaireTheta(ws);
  body.append(el('div', 'grid g4',
    kpi('Questions answered', `${r.answered} / ${r.of}`, r.unknown ? `${r.unknown} recorded as unknown` : 'none unknown', r.answered === r.of ? 'good' : 'warn'),
    kpi('Resilience score', r.overall === null ? '—' : Math.round(r.overall * 100) + '%', 'mean of the capabilities answered'),
    kpi('θ this suggests', qt.theta === null ? '—' : String(qt.theta), 'from the questionnaire alone'),
    kpi('Weakest', qt.weak && qt.weak.length ? qt.weak[0] : '—', qt.weak && qt.weak.length > 1 ? `and ${qt.weak.length - 1} more` : 'nothing scored low')));

  body.append(card(el('p', 'note', 'Three questions per capability, about what the organization can demonstrate rather than what it owns — “we have backups” is not an answer to whether it can recover. ',
    el('b', null, 'Unknown'), ' is a real answer: it is recorded as an information gap and left out of the score, instead of being counted as a zero nobody verified.')));

  for (const c of r.caps) {
    const invCov = SG.capabilityCoverage(ws).find(x => x.key === c.key);
    const cc = card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, c.label),
      c.score === null ? pill('not answered', '') : pill(Math.round(c.score * 100) + '%', c.score >= 0.67 ? 'good' : c.score >= 0.34 ? 'warn' : 'bad'),
      invCov && invCov.best ? pill(`inventory: ${invCov.count} safeguard${invCov.count === 1 ? '' : 's'}`, 'good') : pill('inventory: nothing in force', 'warn')));
    cc.append(el('p', 'small muted', SG.CAPABILITY[c.key]?.hint));
    for (const q of c.qs) {
      const s = select([['', '—'], ...MT.ANSWERS.map(([v, l]) => [String(v), l])], q.a === null ? '' : String(q.a));
      s.addEventListener('change', () => { if (s.value === '') delete M.answers[q.id]; else M.answers[q.id] = +s.value; touch(); render(sec); });
      cc.append(el('div', 'row', { style: { alignItems: 'flex-start', margin: '6px 0' } },
        el('div', { style: { flex: 1 } }, q.text,
          q.a !== null && q.a >= 0 ? el('div', 'small muted', MT.ANSWER[q.a]?.hint) : null),
        el('div', { style: { minWidth: '190px' } }, s)));
    }
    if (invCov && !invCov.best && c.score !== null && c.score > 0.5)
      cc.append(banner('warn', 'Answered well, but nothing in the inventory supports it',
        `Nothing recorded under Existing safeguards contributes to ${c.label.toLowerCase()}. Either the inventory is incomplete, or this capability is more belief than fact.`));
    body.append(cc);
  }
  body.append(recordCard(sec));
}

/* ---------------- the two readings ---------------- */
function thetaView(body, sec) {
  const ws = S.ws;
  const scens = (ws.assessment?.SCEN || []);
  const scopeSel = select([['all', 'The whole organization'], ...scens.map(s => [s.id, s.id + ' — ' + (s.name || '').slice(0, 46)])], scope);
  scopeSel.addEventListener('change', () => { scope = scopeSel.value; render(sec); });
  const sc = scope !== 'all' ? scope : null;
  const t = MT.thetaReadings(ws, { scen: sc });
  const kind = t.verdict === 'they agree' ? 'good' : t.verdict === 'one reading only' ? 'warn' : 'warn';

  body.append(card(el('div', 'row', { style: { alignItems: 'center' } }, el('label', { style: { margin: 0 } }, el('b', null, 'θ for')), scopeSel),
    el('div', 'grid g4', { style: { marginTop: '8px' } },
      kpi('From the questionnaire', t.questionnaire.theta === null ? '—' : String(t.questionnaire.theta), 'what people say the organization can do'),
      kpi('From the inventory', String(t.inventory.theta), 'what is recorded as in force'),
      kpi('Difference', t.gap === null ? '—' : (t.gap > 0 ? '+' : '') + n2(t.gap), t.verdict, kind),
      kpi('Recommended', String(t.recommended), 'the lower of the two', ''))));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'What the difference means'),
    el('p', null, t.note),
    el('p', 'note', t.why),
    banner('warn', 'Neither reading changes anything by itself',
      'θ is a property of the organization and belongs to the analyst. Put a value on a scenario here and it is written with this rationale and a revision-log entry — then review it in the Scenario editor.'),
    el('div', 'btnrow',
      el('button', { class: 'btn', disabled: !sc, onclick: () => {
        const s = scen(sc); if (!s) return;
        const before = s.params?.Th?.v;
        s.params ||= {};
        s.params.Th = Object.assign({}, s.params.Th, { v: t.recommended, rat: t.why + ' ' + t.note, conf: t.verdict === 'they agree' ? 'Medium' : 'Low' });
        (s.revisions ||= []).push({ date: today(), what: `θ set to ${t.recommended}` + (before === undefined ? '' : ` (was ${before})`) + ' from the maturity & resilience assessment' });
        touch(); toast(`θ of ${sc} set to ${t.recommended}`); render(sec);
      } }, sc ? `Put θ = ${t.recommended} on ${sc}` : 'Choose a scenario first'),
      el('button', { class: 'btn ghost', onclick: () => go('safeguards') }, 'Open Existing safeguards'),
      el('button', { class: 'btn ghost', onclick: () => go('scenario' + (sc ? '/' + sc : '')) }, 'Open the Scenario editor'))));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Capability by capability'),
    table([
      { key: 'label', label: 'Capability' },
      { key: 'q', label: 'Questionnaire', render: row => row.q === null ? pill('not answered', '') : pill(Math.round(row.q * 100) + '%', row.q >= 0.67 ? 'good' : row.q >= 0.34 ? 'warn' : 'bad') },
      { key: 'inv', label: 'Inventory', render: row => row.inv ? pill(`${row.inv} / ${SG.MAX_STRENGTH}`, row.inv >= 2 ? 'good' : 'warn') : pill('nothing in force', 'bad') },
      { key: 'verdict', label: 'Reading', sortable: false, render: row =>
          row.q === null ? el('span', 'small muted', 'answer the questions for a second reading')
          : row.q > 0.5 && !row.inv ? pill('claimed, not recorded', 'warn')
          : row.q <= 0.34 && row.inv >= 2 ? pill('recorded, not credited', 'warn')
          : pill('consistent', 'good') },
    ], SG.CAPABILITIES.map(([key, label]) => {
      const q = MT.resilience(ws).caps.find(c => c.key === key);
      const inv = SG.capabilityCoverage(ws, { scen: sc }).find(c => c.key === key);
      return { key, label, q: q ? q.score : null, inv: inv ? inv.best : 0 };
    }), { class: 'compact' })));
}

/* ---------------- history ---------------- */
function historyView(body, sec) {
  const ws = S.ws, h = MT.history(ws), prev = MT.previous(ws);
  if (!h.length) {
    body.append(banner('warn', 'Nothing recorded yet',
      'Record an assessment to compare it with the next one. Maturity only means something as a trend: a single number is a snapshot of an opinion.'));
    body.append(recordCard(sec));
    return;
  }
  const last = h[h.length - 1];
  body.append(el('div', 'grid g4',
    kpi('Last recorded', last.date, last.note || 'no note'),
    kpi('Maturity', last.maturity === null ? '—' : n2(last.maturity), prev && prev.maturity !== null && last.maturity !== null
      ? (last.maturity > prev.maturity ? `up ${n2(last.maturity - prev.maturity)} since ${prev.date}` : last.maturity < prev.maturity ? `down ${n2(prev.maturity - last.maturity)} since ${prev.date}` : 'unchanged') : 'no earlier record',
      prev && last.maturity !== null && prev.maturity !== null ? (last.maturity >= prev.maturity ? 'good' : 'bad') : ''),
    kpi('Resilience', last.resilience === null ? '—' : Math.round(last.resilience * 100) + '%', `${last.answered} questions answered`),
    kpi('θ recommended', last.thetaRecommended === null ? '—' : String(last.thetaRecommended), `questionnaire ${last.thetaQuestionnaire ?? '—'} · inventory ${last.thetaInventory ?? '—'}`)));

  if (h.length >= 2) {
    const series = [
      { name: 'Maturity (0–5)', color: 'var(--series-1)', points: h.filter(x => x.maturity !== null).map(x => ({ x: x.date, y: x.maturity })) },
      { name: 'Resilience, on the same axis', color: 'var(--series-2)', points: h.filter(x => x.resilience !== null).map(x => ({ x: x.date, y: x.resilience * 5 })) },
    ].filter(s => s.points.length);
    try {
      body.append(card(el('h2', { style: { marginTop: 0 } }, 'Trend'),
        lineChart({ series, yLabel: 'Maturity level', yFmt: v => n1(v),
                    refs: last.target === null ? [] : [{ y: last.target, label: 'target', color: 'var(--muted)' }] }),
        el('div', 'legend', ...series.map(s => el('span', null, el('i', { style: { background: s.color } }), s.name))),
        el('p', 'note', 'Resilience is drawn on the 0–5 axis so the two can be read together; underneath it is a percentage.')));
    } catch (e) { /* a chart is a convenience; the table below is the record */ }
  }

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Recorded assessments'),
    table([
      { key: 'date', label: 'Date' },
      { key: 'maturity', label: 'Maturity', num: true, render: r => r.maturity === null ? '—' : n2(r.maturity) },
      { key: 'categoriesScored', label: 'Categories', num: true, render: r => `${r.categoriesScored} / ${r.categoriesOf}` },
      { key: 'resilience', label: 'Resilience', num: true, render: r => r.resilience === null ? '—' : Math.round(r.resilience * 100) + '%' },
      { key: 'answered', label: 'Questions', num: true, render: r => `${r.answered}${r.unknown ? ` (${r.unknown} unknown)` : ''}` },
      { key: 'thetaRecommended', label: 'θ', num: true, render: r => r.thetaRecommended === null ? '—' : String(r.thetaRecommended) },
      { key: 'note', label: 'Note', render: r => el('span', { 'data-noi18n': '' }, r.note || '') },
    ], [...h].reverse(), { class: 'compact' })));
  body.append(recordCard(sec));
}

function recordCard(sec) {
  const ws = S.ws;
  const note = el('input', { type: 'text', placeholder: 'what changed since the last one, or why it was assessed now' });
  const by = el('input', { type: 'text', placeholder: 'who assessed it' });
  return card(el('h2', { style: { marginTop: 0 } }, 'Record this assessment'),
    el('p', 'note', 'Keeps a dated entry with both instruments, so the next assessment can be compared with this one. Recording twice on the same day replaces the entry rather than adding a second.'),
    el('div', 'grid g2', field('Note', note), field('Assessed by', by)),
    el('div', 'btnrow', el('button', { class: 'btn', onclick: () => {
      const e = MT.record(ws, { note: note.value.trim(), by: by.value.trim() });
      toast(`Recorded ${e.date} — maturity ${e.maturity ?? '—'}, θ ${e.thetaRecommended ?? '—'}`);
      view = 'history'; render(sec);
    } }, 'Record it')));
}

/* ---------------- method ---------------- */
function about(body) {
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Two instruments, on purpose'),
    el('p', null, el('b', null, 'Maturity'), ' asks how well the organization does cybersecurity as a practice. It is scored against ',
      el('b', null, 'NIST CSF 2.0'), ' — six functions and the 22 categories underneath them, read from the bundled publisher content rather than typed from memory, so importing a newer edition in Frameworks & standards changes this list instead of contradicting it. It is the management view: it compares, it trends, it supports a budget case.'),
    el('p', null, el('b', null, 'Resilience'), ' asks something narrower and more useful to the model: can this organization prevent, detect, contain, respond, recover and keep critical operations running? Those six are exactly the capabilities ',
      el('b', null, 'θ(ψ,A)'), ' is defined as in the methodology, so this instrument speaks straight to a parameter.'),
    el('h2', null, 'Why two readings are not averaged'),
    el('p', null, 'The questionnaire records what people say the organization can do. The inventory of existing safeguards records what is written down as being in force. They are independent readings of the same thing, and when they disagree materially that is a ',
      el('b', null, 'finding'), ' — either the inventory is incomplete, or the confidence is. Averaging them would hide exactly the thing worth knowing, so both are shown with the gap named.'),
    el('p', null, 'The lower reading is offered by default. Resilience claimed without evidence is the more expensive mistake.'),
    el('h2', null, 'What the numbers will and will not do'),
    el('ul', null,
      el('li', null, 'An unscored category is left out of the average, never counted as zero: a partial assessment stays honest.'),
      el('li', null, el('b', null, 'Unknown'), ' is a real answer, recorded as an information gap and excluded from the score.'),
      el('li', null, 'A level proposed from the inventory never exceeds ', el('b', null, '3'),
        ': the inventory can show that something is being done, but not whether it is defined, managed or improving.'),
      el('li', null, 'θ is proposed, never applied. Putting it on a scenario is an act with a revision-log entry.'),
      el('li', null, 'Every figure is an ', el('b', null, 'analytical estimate — validation required'), '.')),
    el('h2', null, 'How many scenarios the assessment should carry'),
    el('p', null, 'The guidance starts everyone at about 20 candidates and the 10 most material. How many to carry after that depends on how many an organization can keep current, which is what maturity measures — so the Process page and Batch scenarios take their suggested number from the measured level rather than repeating a generic 10. These are stated anchors, not a formula:'),
    table([{ key: 'from', label: 'Measured maturity', render: r => '≥ ' + r[0] },
           { key: 'n', label: 'Scenarios', num: true, render: r => String(r[1]) },
           { key: 'why', label: 'Why', render: r => r[2] }],
      MT.SCENARIO_ANCHORS.map(r => ({ 0: r[0], 1: r[1], 2: r[2], from: r[0], n: r[1], why: r[2] })), { class: 'compact' })));
}
