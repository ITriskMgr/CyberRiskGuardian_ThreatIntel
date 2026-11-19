/* Classroom — the student side (BL-25/26; docs/spec-classroom-exercises.md §2–§7): My assignments, Quiz, Exercise.
   In every edition. A pack is a file signed by the instructor; the helper checks the signature and pins the course key.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, banner, table, field, select, toast, download, uid, pill, kpi, n0, go, modal } from '../util.js';
import { S, newWorkspace, exampleWorkspace, exampleAvailable, create, select as selectWs, migrate } from '../state.js';
import * as MIG from '../migrate.js';
import * as CL from '../classroom.js';
import * as AI from '../ai.js';
import * as PROC from '../process.js';
import * as EX from '../exercise.js';
import { tr, current as lang } from '../i18n.js';

const TABS = [['assignments', 'My assignments'], ['quiz', 'Quiz'], ['exercise', 'Exercise']];
const KIND = { assignment: 'Assessment steps', quiz: 'Quiz', exercise: 'Exercise', course: 'Course pack' };
const STATUS = { new: 'Not started', progress: 'In progress', submitted: 'Submitted' };
const Q = { chapters: [4], count: 10, run: null };

export async function render(sec, arg) {
  await CL.load();
  const view = TABS.some(t => t[0] === arg) ? arg : 'assignments';
  sec.replaceChildren(el('h1', null, 'Classroom'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of TABS) st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => go('classroom/' + k) }, t));
  const body = el('div');
  sec.append(st, body);
  await ({ assignments, quiz, exercise }[view])(body, () => render(sec, view));
}

/* ---------------- My assignments ---------------- */
async function assignments(body, redraw) {
  body.append(banner('good', 'Teaching material', 'Assignments use fictional cases. What you produce here is classroom work, not evidence about a real organization.'));
  const file = el('input', { type: 'file', accept: '.crgpack,.json', hidden: true, 'aria-label': 'Choose a pack file' });
  const out = el('div', { 'aria-live': 'polite' });
  file.addEventListener('change', async () => {
    const f = file.files[0]; file.value = '';
    if (!f) return;
    let pack;
    try { pack = JSON.parse(await f.text()); } catch { out.replaceChildren(banner('bad', 'Not a pack file', 'The file is not readable JSON.')); return; }
    await importPack(pack, out, redraw);
  });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Import a pack from your instructor'),
    el('p', 'note', 'Your instructor posts packs on the course page (Moodle or another LMS). The application checks the instructor’s signature before anything is opened. The first pack of a course pins its key: compare the fingerprint with the one your instructor posted.'),
    el('button', { class: 'btn', onclick: () => file.click() }, 'Import a pack…'), file, out));

  const rows = CL.packs();
  if (!rows.length) { body.append(el('p', 'muted', 'No pack imported yet.')); return; }
  body.append(table([
    { key: 'title', label: 'Assignment', render: r => el('div', null, el('b', null, r.body.title), el('div', 'small muted', r.body.course.title + ' · ' + r.body.course.id)) },
    { key: 'kind', label: 'Type', render: r => tr(KIND[r.body.kind] || r.body.kind) },
    { key: 'due', label: 'Due', render: r => { const d = CL.settingsOf(r).due; return d ? el('span', null, d, ' ', CL.late(d) && r.status !== 'submitted' ? pill(tr('late'), 'warn') : '') : '—'; } },
    { key: 'status', label: 'Status', render: r => pill(tr(STATUS[r.status] || r.status), r.status === 'submitted' ? 'good' : '') },
    { key: 'ai', label: 'AI allowed', render: r => { const a = CL.settingsOf(r).ai; return a.length ? a.map(f => AI.FEATURES.find(x => x[0] === f)?.[1] || f).join(', ') : tr('none'); } },
    { key: 'act', label: '', render: r => el('div', 'row', startButton(r, redraw), r.body.kind === 'assignment' ? el('button', { class: 'btn sm ghost', onclick: () => submitDialog(r, redraw) }, 'Submit…') : '') },
  ], rows, { class: 'compact' }));
}

async function importPack(pack, out, redraw) {
  let r;
  try { r = await CL.verify(pack); } catch (e) { out.replaceChildren(banner('bad', 'The helper could not check the pack', String(e.message || e))); return; }
  if (r.status === 'invalid' || r.status === 'malformed') { out.replaceChildren(banner('bad', 'Pack refused', tr(r.detail))); return; }
  const take = async confirm => {
    const a = await CL.accept(pack, confirm);
    if (!a.accepted) { out.replaceChildren(banner('bad', 'Pack refused', tr(a.detail))); return; }
    toast(tr('Pack accepted.')); redraw();
  };
  if (r.status === 'verified') return take(false);
  const fp = el('code', { class: 'mono' }, r.fingerprint);
  if (r.status === 'new-course') {
    out.replaceChildren(banner('warn', 'First pack for this course', el('div', null,
      el('p', null, tr('Course'), ' ', el('b', null, r.course), ' · ', tr('key fingerprint'), ' ', fp),
      el('p', 'small', 'Accept only if this fingerprint is the one your instructor posted on the course page.'),
      el('button', { class: 'btn', onclick: () => take(false) }, 'The fingerprint matches — accept'))));
  } else if (r.status === 'key-change') {
    out.replaceChildren(banner('bad', 'This pack is signed by a different key', el('div', null,
      el('p', null, tr('Pinned key'), ' ', el('code', 'mono', r.pinned), ' · ', tr('this pack'), ' ', fp),
      el('p', 'small', 'Accept only if your instructor announced a new key. The change is recorded.'),
      el('button', { class: 'btn ghost', onclick: () => take(true) }, 'My instructor announced this key change — accept'))));
  }
}

function startButton(rec, redraw) {
  const k = rec.body.kind;
  if (k === 'quiz') return el('button', { class: 'btn sm', onclick: () => { startQuiz(rec); go('classroom/quiz'); } }, 'Take the quiz');
  if (k === 'exercise') return el('button', { class: 'btn sm', onclick: () => go('classroom/exercise') }, 'Open the exercise');
  if (k === 'course') return el('span', 'small muted', 'Its assignments are listed separately.');
  const open = rec.ws && S.list.some(w => w.id === rec.ws);
  return el('button', { class: 'btn sm', onclick: async () => {
    if (open) { await selectWs(rec.ws); go('process'); return; }
    const ws = await startWorkspace(rec);
    await CL.update(rec.id, { ws: ws.id, status: 'progress' });
    redraw(); go('process');
  } }, open ? 'Continue' : 'Start');
}

/** A classroom workspace for an assessment pack: the pack's case (or a blank organization), tied to the pack. */
export async function startWorkspace(rec) {
  const c = rec.body.content?.case || 'blank';
  let ws = c !== 'blank' && exampleAvailable(c) ? exampleWorkspace(c) : newWorkspace({ name: rec.body.title, kind: 'classroom' });
  ws.id = uid('ws'); ws.kind = 'classroom'; ws.name = `${rec.body.title} — ${rec.body.course.id}`;
  ws.crgo = MIG.blankCrgo(ws.id);
  ws.classroom = Object.assign({ course: '', case_title: '', team: '', members: '', instructor: '', due: '', notes: '' }, ws.classroom || {},
    { course: rec.body.course.title, due: CL.settingsOf(rec).due, pack: CL.wsPack(rec) });
  migrate(ws);
  await create(ws);
  await selectWs(ws.id);
  return ws;
}

function submitDialog(rec, redraw) {
  const team = el('input', { value: '' }), members = el('textarea', { rows: 3 });
  const ws = rec.ws ? S.list.find(w => w.id === rec.ws) : null;
  const due = CL.settingsOf(rec).due;
  const m = modal(tr('Submit') + ' — ' + rec.body.title,
    due && CL.late(due) ? banner('warn', 'After the due date', 'The submission will be marked late. It is not refused.') : '',
    field('Team or student name', team, 'As you want your instructor to see it. Nothing else identifies you.'),
    field('Members', members, 'Optional: one name per line.'),
    el('p', 'small', ws ? tr('The submission contains the full workspace, the named deliverables, the AI-use log and the 19-step progress, with a checksum.') : tr('No workspace is attached to this assignment yet: start it first.')),
    el('button', { class: 'btn', disabled: !ws, onclick: async () => {
      try {
        const w = S.ws?.id === ws.id ? S.ws : ws;
        const progress = PROC.statuses(w).map(x => ({ n: x.s.n, step: x.s.title, status: x.st }));
        const sub = await CL.submit(rec, { team: team.value.trim(), members: members.value.trim(), ws: w, progress, aiLog: AI.log(w).filter(e => e.decision) });
        download(`submission-${rec.body.course.id}-${(team.value.trim() || 'team').replace(/[^\w-]+/g, '_')}.crgsub`, JSON.stringify(sub, null, 1), 'application/json');
        toast(tr('Submission file saved. Hand it in on the course page.')); m.close(); redraw();
      } catch (e) { toast(String(e.message || e), 'bad'); }
    } }, 'Save the submission file'));
}

/* ---------------- Quiz ---------------- */
function startQuiz(rec) {
  const c = rec.body.content || {};
  Q.chapters = (c.chapters || [4]).map(Number);
  Q.count = Number(c.count) || 10;
  Q.run = { rec: rec.id, reveal: CL.settingsOf(rec).reveal, seed: Date.now() % 100000, answers: [], done: false };
}

async function quiz(body, redraw) {
  const bank = await CL.quizBank();
  const L = lang() === 'fr' ? 'fr' : 'en';
  if (!Q.run) {
    const chSel = el('select', { multiple: true, size: 8 });
    for (const c of bank.chapters) chSel.append(new Option(c.title[L], c.n, false, Q.chapters.includes(c.n)));
    const count = select([5, 10, 20, 40].map(n => [n, String(n)]), Q.count);
    body.append(card(el('h2', { style: { marginTop: 0 } }, 'Self-check quiz'),
      el('p', 'note', 'Questions from the book’s review questions, checked against the public answer key. Each answer tells you which section of the chapter to reread.'),
      el('div', 'grid g2', field('Chapters', chSel, 'Select one or more.'), field('Number of questions', count)),
      el('button', { class: 'btn', onclick: () => {
        Q.chapters = [...chSel.selectedOptions].map(o => Number(o.value));
        if (!Q.chapters.length) { toast(tr('Choose at least one chapter.'), 'warn'); return; }
        Q.count = Number(count.value);
        Q.run = { rec: null, reveal: 'immediate', seed: Date.now() % 100000, answers: [], done: false };
        redraw();
      } }, 'Start'),
      el('p', 'small muted', L === 'fr' ? bank.source.fr : bank.source.en)));
    const past = CL.attempts().slice(0, 10);
    if (past.length) body.append(card(el('h3', null, 'Recent attempts'), table([
      { key: 'at', label: 'When', render: a => a.at.slice(0, 16).replace('T', ' ') },
      { key: 'ch', label: 'Chapters', render: a => a.chapters.join(', ') },
      { key: 's', label: 'Score', render: a => `${a.right} / ${a.total}` }], past, { class: 'compact' })));
    return;
  }
  const qs = CL.draw(bank, Q.chapters, Q.count, Q.run.seed);
  const R = Q.run;
  const reveal = R.reveal === 'immediate' || (R.reveal === 'after' && R.done);
  const list = el('ol', 'quiz');
  qs.forEach((q, i) => {
    const name = 'q' + i;
    const opts = el('div', { role: 'radiogroup', 'aria-label': tr('Question') + ' ' + (i + 1) });
    q.options[L].forEach((o, k) => {
      const letter = 'ABCD'[k];
      const id = name + letter;
      const inp = el('input', { type: 'radio', name, id, value: letter, disabled: R.done });
      if (R.answers[i] === letter) inp.checked = true;
      inp.addEventListener('change', () => { R.answers[i] = letter; if (R.reveal === 'immediate') redraw(); });
      opts.append(el('div', 'row', inp, el('label', { for: id }, `${letter}. ${o}`)));
    });
    const answered = !!R.answers[i];
    const fb = reveal && answered ? (R.answers[i] === q.answer
      ? el('div', 'small good', tr('Right.'), ' ', readMore(q, L))
      : el('div', 'small bad', tr('Not quite — the expected answer is') + ' ' + q.answer + '. ', readMore(q, L))) : '';
    list.append(el('li', null, el('p', null, el('b', null, q.q[L])), opts, fb));
  });
  const sc = CL.score(qs, R.answers);
  body.append(card(el('div', 'row', el('h2', { style: { margin: 0, flex: 1 } }, 'Quiz'),
      R.done ? kpi('Score', `${n0(sc.right)} / ${n0(sc.total)}`, '', sc.right / sc.total >= 0.6 ? 'good' : 'warn') : ''),
    list,
    el('div', 'row',
      R.done ? '' : el('button', { class: 'btn', onclick: async () => {
        R.done = true;
        await CL.recordAttempt({ pack: R.rec, chapters: Q.chapters, right: sc.right, total: sc.total, lang: L,
          answers: qs.map((q, i) => ({ ch: q.ch, n: q.n, given: R.answers[i] || '', right: R.answers[i] === q.answer })) });
        if (R.rec) await CL.update(R.rec, { status: 'submitted', submitted: new Date().toISOString() });
        redraw();
      } }, 'Finish'),
      el('button', { class: 'btn ghost', onclick: () => { Q.run = null; redraw(); } }, R.done ? 'New quiz' : 'Leave the quiz')),
    R.done && R.reveal === 'never' ? el('p', 'small muted', 'Your instructor does not reveal the answers for this quiz.') : ''));
}
const readMore = (q, L) => el('span', 'muted', tr('Read more:') + ' ' + q.chTitle[L] + ' — ' + q.section[L]);

/* ---------------- Exercise (spec §6) ---------------- */
const EXS = { sel: null };
async function exercise(body, redraw) {
  const L = lang() === 'fr' ? 'fr' : 'en';
  const t = o => (o && typeof o === 'object' ? (o[L] || o.en) : String(o || ''));
  const ex = CL.packs().filter(p => p.body.kind === 'exercise');
  body.append(banner('good', 'Exercise material', 'A fictional tabletop exercise. Alerts and indicators in it are exercise material, never confirmed incidents.'));
  if (!ex.length) { body.append(card(el('h2', { style: { marginTop: 0 } }, 'Tabletop exercise'), el('p', 'muted', 'No exercise pack imported yet. Import one on My assignments.'))); return; }
  if (!ex.some(p => p.id === EXS.sel)) EXS.sel = ex[0].id;
  const rec = CL.byId(EXS.sel), c = rec.body.content;
  const run = CL.run(rec.id) || EX.blankRun();
  const keep = async () => { await CL.saveRun(rec.id, run); if (rec.status === 'new') await CL.update(rec.id, { status: 'progress' }); };
  const pick = select(ex.map(p => [p.id, p.body.title]), EXS.sel, { 'aria-label': tr('Exercise') });
  pick.addEventListener('change', () => { EXS.sel = pick.value; redraw(); });
  body.append(card(el('div', 'row', el('h2', { style: { margin: 0, flex: 1 } }, t(c.title)), ex.length > 1 ? pick : ''),
    el('p', null, t(c.brief))));

  // roles: the team picks, unless the pack fixes them
  const roleRows = c.roles.map(r => {
    const fixed = c.fixedRoles?.[r.id];
    const inp = el('input', { value: fixed || run.roles[r.id] || '', disabled: !!fixed });
    inp.addEventListener('change', async () => { run.roles[r.id] = inp.value.trim(); await keep(); });
    return field(t(r.name), inp, fixed ? tr('Set by your instructor.') : '');
  });
  body.append(card(el('h3', null, 'Roles'), el('p', 'small muted', 'Who plays which role. Decisions are recorded with the role that took them.'), el('div', 'grid g3', ...roleRows)));

  // injects
  const list = el('div');
  for (const box of c.injects) {
    const o = EX.opened(run, box.n);
    if (!o) {
      const code = el('input', { class: 'mono', size: 8, autocomplete: 'off', 'aria-label': tr('Unlock code for inject') + ' ' + box.n });
      const go2 = async () => {
        const inj = await EX.open(box, code.value);
        if (!inj) { toast(tr('That code does not open this inject.'), 'bad'); return; }
        run.opened.push({ n: box.n, at: new Date().toISOString(), ...inj }); await keep(); redraw();
      };
      code.addEventListener('keydown', e => { if (e.key === 'Enter') go2(); });
      list.append(el('div', 'card', el('div', 'row', el('b', { style: { flex: 1 } }, tr('Inject') + ' ' + box.n + ' — ' + tr('locked')), code,
        el('button', { class: 'btn sm', onclick: go2 }, 'Unlock'))));
      continue;
    }
    const roleSel = select(c.roles.map(r => [r.id, t(r.name)]), c.roles[0].id, { 'aria-label': tr('Role') });
    const txt = el('textarea', { rows: 2, 'aria-label': tr('Decision') });
    const ds = run.decisions.filter(d => d.n === box.n);
    list.append(el('div', 'card',
      el('h3', { style: { marginTop: 0 } }, tr('Inject') + ' ' + box.n + ' — ' + t(o.title)),
      el('p', 'small muted', tr('Opened') + ' ' + o.at.slice(11, 16)),
      el('p', null, t(o.text)), el('p', null, el('b', null, t(o.ask))),
      ds.length ? el('ul', null, ...ds.map(d => el('li', null, `${d.at.slice(11, 16)} · `, el('b', null, t(c.roles.find(r => r.id === d.role)?.name)), ' — ' + d.text))) : '',
      el('div', 'row', roleSel, txt, el('button', { class: 'btn sm', onclick: async () => {
        if (!txt.value.trim()) return;
        run.decisions.push({ n: box.n, role: roleSel.value, text: txt.value.trim(), at: new Date().toISOString() }); await keep(); redraw();
      } }, 'Record the decision'))));
  }
  body.append(el('h3', null, 'Injects'), list);

  // debrief, report, submission
  const answers = c.debrief.map((q, i) => {
    const ta = el('textarea', { rows: 3 }, run.debrief[i] || '');
    ta.addEventListener('change', async () => { run.debrief[i] = ta.value.trim(); await keep(); });
    return field(`${i + 1}. ${t(q)}`, ta);
  });
  const team = el('input', { value: run.team || '' });
  team.addEventListener('change', async () => { run.team = team.value.trim(); await keep(); });
  const report = () => EX.afterAction(c, run, L, team.value.trim());
  body.append(card(el('h3', { style: { marginTop: 0 } }, 'Debrief'), ...answers, field('Team or student name', team),
    el('div', 'row',
      el('button', { class: 'btn ghost', onclick: () => download(`after-action-${c.exercise}.md`, report(), 'text/markdown') }, 'Export the after-action report'),
      el('button', { class: 'btn', onclick: async () => {
        try {
          const sub = await CL.submit(rec, { team: team.value.trim(), exercise: { run, report: report() } });
          download(`submission-${rec.body.course.id}-${(team.value.trim() || 'team').replace(/[^\w-]+/g, '_')}.crgsub`, JSON.stringify(sub, null, 1), 'application/json');
          toast(tr('Submission file saved. Hand it in on the course page.')); redraw();
        } catch (e) { toast(String(e.message || e), 'bad'); }
      } }, 'Save the submission file'))));
}
