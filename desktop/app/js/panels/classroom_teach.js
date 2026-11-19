/* Classroom — the instructor side (Educational edition; docs/spec-classroom-exercises.md §2, §3, §8–§10):
   Settings → Classroom (key, fingerprint, roster), Classroom → Packs, Submissions & grading, Course packs.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, banner, field, select, toast, download, pill, n0 } from '../util.js';
import * as IN from '../instructor.js';
import * as AI from '../ai.js';
import { tr, current as lang } from '../i18n.js';

const L = () => (lang() === 'fr' ? 'fr' : 'en');
const t = o => (o && typeof o === 'object' ? (o[L()] || o.en) : String(o || ''));
const safe = s => String(s || 'pack').replace(/[^\w-]+/g, '_').slice(0, 60);

/* ---------------- Settings → Classroom ---------------- */
export async function settingsTab(body, redraw) {
  let k = null, roster = [], err = '';
  try { k = await IN.key(false); roster = await IN.loadRoster(); } catch (e) { err = String(e.message || e); }
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Instructor key'),
    el('p', 'note', 'Every pack you export is signed with this key. Post its fingerprint on your course page so students can check the first pack they import. The secret part stays on this computer, outside every workspace and pack.'),
    err ? banner('bad', 'The helper is needed', err) : '',
    k ? el('div', null, el('p', null, tr('Fingerprint'), ' ', el('code', { class: 'mono', id: 'cl-fp' }, k.fingerprint)), el('p', 'small muted', tr('Made on') + ' ' + k.created))
      : el('button', { class: 'btn', onclick: async () => { await IN.key(true); redraw(); } }, 'Make my instructor key')));
  const file = el('input', { type: 'file', accept: '.csv,text/csv', hidden: true, 'aria-label': 'Choose the participants file' });
  file.addEventListener('change', async () => {
    const f = file.files[0]; file.value = ''; if (!f) return;
    try { const r = IN.parseRoster(await f.text()); await IN.saveRoster(r); toast(n0(r.length) + ' ' + tr('students imported.')); redraw(); }
    catch (e) { toast(String(e.message || e), 'bad'); }
  });
  const tm = IN.teams(roster);
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Roster'),
    el('p', 'note', 'Import the participants export of your LMS (Moodle: First name, Last name, Email address, Groups). The roster stays in your confidential folder, never in a pack: packs carry team names only.'),
    el('button', { class: 'btn', onclick: () => file.click() }, 'Import participants (.csv)…'), file,
    roster.length ? el('p', null, `${n0(roster.length)} ${tr('students')} · ${n0(tm.length)} ${tr('teams')}: ${tm.join(', ')}`) : el('p', 'muted', 'No roster yet.')));
}

/* ---------------- Classroom → Packs ---------------- */
const F = { kind: 'assignment', courseId: '', courseTitle: '', title: '', due: '', reveal: 'after', ai: [], proposals: false,
  case: 'medibec', steps: '1-11', deliverables: ['Scenario portfolio'], chapters: [4], count: 10, exercise: 'ex1-medibec-ransomware' };
const steps = s => { const out = new Set(); for (const p of String(s).split(',')) { const [a, b] = p.split('-').map(Number); for (let i = a; i <= (b || a); i++) if (i >= 1 && i <= 19) out.add(i); } return [...out]; };

export async function packsTab(body, redraw) {
  const k = await IN.key(false).catch(() => null);
  if (!k) body.append(banner('warn', 'No instructor key yet', 'Make it in Settings → Classroom; it signs every pack.'));
  const inp = (key, attrs = {}) => { const i = el('input', { value: F[key], ...attrs }); i.addEventListener('change', () => { F[key] = i.value.trim(); }); return i; };
  const kind = select([['assignment', 'Assessment steps'], ['quiz', 'Quiz'], ['exercise', 'Exercise']], F.kind, { id: 'cl-kind' });
  kind.addEventListener('change', () => { F.kind = kind.value; redraw(); });
  const reveal = select([['immediate', 'Immediately'], ['after', 'After submission'], ['never', 'Never']], F.reveal);
  reveal.addEventListener('change', () => { F.reveal = reveal.value; });
  const ai = el('div', null, ...AI.FEATURES.map(f => { const c = el('input', { type: 'checkbox', checked: F.ai.includes(f[0]) });
    c.addEventListener('change', () => { F.ai = c.checked ? [...new Set([...F.ai, f[0]])] : F.ai.filter(x => x !== f[0]); });
    return el('label', 'row small', c, f[1]); }));
  const prop = el('input', { type: 'checkbox', checked: F.proposals }); prop.addEventListener('change', () => { F.proposals = prop.checked; });
  let specific;
  if (F.kind === 'assignment') {
    const cs = select(IN.CASES, F.case); cs.addEventListener('change', () => { F.case = cs.value; });
    const dl = el('div', null, ...IN.DELIVERABLES.map(d => { const c = el('input', { type: 'checkbox', checked: F.deliverables.includes(d) });
      c.addEventListener('change', () => { F.deliverables = c.checked ? [...new Set([...F.deliverables, d])] : F.deliverables.filter(x => x !== d); });
      return el('label', 'row small', c, d); }));
    specific = el('div', 'grid g3', field('Starting point', cs), field('Steps', inp('steps'), 'For example 1-11 or 12,13,18.'), field('Deliverables', dl));
  } else if (F.kind === 'quiz') {
    specific = el('div', 'grid g2', field('Chapters', inp('chapters', { value: F.chapters.join(', ') }), 'Chapter numbers, separated by commas.'),
      field('Number of questions', inp('count', { type: 'number', min: 1, max: 100 })));
  } else {
    const src = await IN.samples();
    const ex = select(src.exercises.map(e => [e.id, t(e.title)]), F.exercise); ex.addEventListener('change', () => { F.exercise = ex.value; });
    specific = field('Exercise', ex, 'Fresh unlock codes are made each time you export; they go on the facilitator sheet, never in the pack.');
  }
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Build a pack'),
    el('div', 'grid g3', field('Type', kind), field('Course identifier', inp('courseId', { placeholder: 'GRC-101-A26' }), 'Letters, digits, dot, dash or underscore.'),
      field('Course title', inp('courseTitle'))),
    el('div', 'grid g3', field('Title', inp('title')), field('Due date', inp('due', { type: 'date' }), 'Late work is marked late, never refused.'),
      F.kind === 'quiz' ? field('Show the answers', reveal) : ''),
    specific,
    F.kind !== 'quiz' ? el('div', 'grid g2', field('AI features allowed', ai, 'AI is off unless you tick a feature. Every AI proposal a student accepts travels in the submission.'),
      field('Ontology proposals', el('label', 'row small', prop, tr('Allowed in this assignment')))) : '',
    el('button', { class: 'btn', id: 'cl-export', disabled: !k, onclick: () => exportPack().catch(e => toast(String(e.message || e), 'bad')) }, 'Sign and export the pack')));
}
async function exportPack() {
  const form = { kind: F.kind, courseId: F.courseId, courseTitle: F.courseTitle || F.courseId, title: F.title, due: F.due, reveal: F.reveal,
    ai: F.kind === 'quiz' ? [] : F.ai, proposals: F.kind === 'quiz' ? false : F.proposals };
  let b, sheet = null;
  if (F.kind === 'assignment') b = IN.body({ ...form, content: { case: F.case, steps: steps(F.steps), deliverables: F.deliverables } });
  else if (F.kind === 'quiz') b = IN.body({ ...form, content: { chapters: String(F.chapters).split(/[ ,]+/).map(Number).filter(n => n >= 1 && n <= 21), count: Number(F.count) || 10 } });
  else ({ body: b, sheet } = await IN.exercisePack(form, F.exercise));
  const pack = await IN.sign(b);
  download(`${safe(F.courseId)}-${safe(F.title)}.crgpack`, JSON.stringify(pack), 'application/json');
  if (sheet) download(`${safe(F.courseId)}-${safe(F.title)}-FACILITATOR.md`, IN.sheetMarkdown(F.title, sheet, L()), 'text/markdown');
  toast(tr(sheet ? 'Pack and facilitator sheet saved.' : 'Pack saved. Post it on your course page.'));
}

/* ---------------- Classroom → Submissions & grading ---------------- */
const G = { subs: [] };
export async function gradingTab(body, redraw) {
  const roster = await IN.loadRoster().catch(() => []);
  const grades = await IN.loadGrades().catch(() => ({}));
  const file = el('input', { type: 'file', accept: '.crgsub,.json', multiple: true, hidden: true, 'aria-label': 'Choose submission files' });
  file.addEventListener('change', async () => {
    for (const f of file.files) {
      try { const sub = JSON.parse(await f.text()); const chk = await IN.check(sub); G.subs = [{ file: f.name, sub, chk }, ...G.subs.filter(x => x.sub.sha256 !== sub.sha256)]; }
      catch (e) { toast(f.name + ': ' + (e.message || e), 'bad'); }
    }
    file.value = ''; redraw();
  });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Submissions'),
    el('p', 'note', 'Open the submission files your students handed in. Each is checked against its checksum. The evidence columns help you grade; they are never the grade.'),
    el('button', { class: 'btn', onclick: () => file.click() }, 'Open submission files…'), file));
  if (!G.subs.length) return;
  for (const s of G.subs) {
    const b = s.sub.body || {}, ev = IN.evidence(s.sub);
    const rubric = b.kind === 'exercise' ? IN.RUBRICS.exercise : IN.RUBRICS.assignment;
    const g = grades[s.sub.sha256] ||= { team: b.team || '', picks: [], comment: '' };
    const res = IN.grade(rubric, g.picks);
    const keep = async () => { Object.assign(g, IN.grade(rubric, g.picks), { team: b.team || '', pack: b.pack || '' }); await IN.saveGrades(grades); };
    const rows = rubric.map((c, i) => { const sel = select([['', '—'], ...IN.LEVELS.map(l => [l[0], `${tr(l[1])} (${Math.round(l[2] * 100)} %)`])], g.picks[i] || '', { 'aria-label': c.criterion });
      sel.addEventListener('change', async () => { g.picks[i] = sel.value; await keep(); redraw(); }); return el('tr', null, el('td', null, c.criterion), el('td', 'num', String(c.weight)), el('td', null, sel)); });
    const com = el('textarea', { rows: 2, 'aria-label': tr('Feedback comments') }, g.comment || ''); com.addEventListener('change', async () => { g.comment = com.value.trim(); await keep(); });
    body.append(card(el('div', 'row', el('h3', { style: { margin: 0, flex: 1 } }, `${b.team || tr('(no name)')} — ${b.title || ''}`),
        pill(tr(s.chk.status === 'intact' ? 'intact' : 'altered'), s.chk.status === 'intact' ? 'good' : 'bad'), ev.late ? pill(tr('late'), 'warn') : ''),
      s.chk.status !== 'intact' ? banner('bad', 'Altered after export', tr(s.chk.detail)) : '',
      el('p', 'small', `${tr('19 steps done')}: ${ev.steps} · ${tr('quiz')}: ${ev.quiz} · ${tr('exercise')}: ${ev.exercise} · ${tr('AI proposals accepted')}: ${ev.ai} · ${tr('submitted')} ${ev.submitted.slice(0, 16).replace('T', ' ')}`),
      el('table', 'compact', el('thead', null, el('tr', null, el('th', null, tr('Criterion')), el('th', null, tr('Weight')), el('th', null, tr('Level')))), el('tbody', null, ...rows)),
      field('Feedback comments', com),
      el('p', null, el('b', null, res.complete ? `${tr('Grade')}: ${res.pct} %` : tr('Grade: pick a level for every criterion.')))));
  }
  const done = Object.values(grades).filter(x => x.complete);
  body.append(card(el('h3', { style: { marginTop: 0 } }, 'Export grades'),
    el('p', 'note', 'A CSV for Moodle’s grade import: one row per student, identified by email address. A team grade goes to every member of its group in the roster.'),
    !roster.length ? banner('warn', 'No roster', 'Import the participants in Settings → Classroom to map teams to students.') : '',
    el('button', { class: 'btn', disabled: !done.length || !roster.length, onclick: () => download('grades-moodle.csv', IN.moodleCSV(done, roster), 'text/csv') },
      tr('Export grades (.csv)') + ` (${n0(done.length)})`)));
}

/* ---------------- Classroom → Course packs ---------------- */
export async function courseTab(body) {
  const src = await IN.samples();
  const cid = el('input', { placeholder: 'GRC-101-A26' }), ctitle = el('input');
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'The four sample exercises as a course pack'),
    el('p', 'note', 'A course pack bundles assignments, quizzes and exercises to reuse each term or share with a colleague, who re-signs it under their own key. Each exercise gets fresh unlock codes; the facilitator sheets are saved beside the pack.'),
    el('ul', null, ...src.exercises.map(e => el('li', null, t(e.title)))),
    el('div', 'grid g2', field('Course identifier', cid), field('Course title', ctitle)),
    el('button', { class: 'btn', onclick: async () => {
      try {
        const items = [], sheets = [];
        for (const e of src.exercises) {
          const { body: b, sheet } = await IN.exercisePack({ courseId: cid.value.trim(), courseTitle: ctitle.value.trim() || cid.value.trim(), title: t(e.title) }, e.id);
          items.push(b); sheets.push(IN.sheetMarkdown(t(e.title), sheet, L()));
        }
        const pack = await IN.sign(IN.coursePack(cid.value.trim(), ctitle.value.trim() || cid.value.trim(), tr('Sample tabletop exercises'), items));
        download(`${safe(cid.value)}-sample-exercises.crgpack`, JSON.stringify(pack), 'application/json');
        download(`${safe(cid.value)}-sample-exercises-FACILITATOR.md`, sheets.join('\n\n'), 'text/markdown');
        toast(tr('Course pack and facilitator sheets saved.'));
      } catch (e) { toast(String(e.message || e), 'bad'); }
    } }, 'Build and sign the course pack')));
  const file = el('input', { type: 'file', accept: '.crgpack,.json', hidden: true, 'aria-label': 'Choose a course pack' });
  const out = el('div', { 'aria-live': 'polite' });
  file.addEventListener('change', async () => {
    const f = file.files[0]; file.value = ''; if (!f) return;
    try {
      const pack = JSON.parse(await f.text());
      const r = await (await import('../classroom.js')).verify(pack);
      if (!['verified', 'new-course', 'key-change'].includes(r.status)) { out.replaceChildren(banner('bad', 'Pack refused', tr(r.detail))); return; }
      if (pack.body.kind !== 'course') { out.replaceChildren(banner('warn', 'Not a course pack', tr('This file is a single pack.'))); return; }
      out.replaceChildren(banner('good', 'Signature valid', el('div', null, el('p', null, tr('Signed by'), ' ', el('code', 'mono', r.fingerprint), ` · ${n0(pack.body.content.items.length)} ${tr('item(s)')}`),
        el('button', { class: 'btn', onclick: async () => {
          const re = await IN.sign({ ...pack.body, issued: new Date().toISOString().slice(0, 10) });
          download(`${safe(pack.body.course.id)}-${safe(pack.body.title)}-resigned.crgpack`, JSON.stringify(re), 'application/json');
          toast(tr('Re-signed under your key.'));
        } }, 'Re-sign under my key'))));
    } catch (e) { out.replaceChildren(banner('bad', 'Not a pack file', String(e.message || e))); }
  });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Reuse a course pack'),
    el('p', 'note', 'Open a course pack from a colleague or an earlier term. After checking its signature, re-sign it under your key to hand it out.'),
    el('button', { class: 'btn ghost', onclick: () => file.click() }, 'Open a course pack…'), file, out));
}
