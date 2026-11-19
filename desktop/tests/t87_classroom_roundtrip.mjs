// t87 — Classroom round trip and the instructor side (BL-25/26, spec §3, §8, §9, §11): the roster is read from Moodle's
// participants export (English or French headers) and kept in the confidential folder; the instructor builds and signs a
// pack, the student imports it, works and submits, the instructor checks the submission, grades it on the rubric and
// exports Moodle's grade CSV (one row per team member); an exercise pack keeps its codes on the facilitator sheet only; the
// four samples become a signed course pack another instructor can re-sign. The instructor screens belong to the
// Educational edition, so this suite renders them directly (the source tree is the Community edition).
import { open, ok, done } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const course = 'T87-' + Date.now().toString(36);
const r = await page.evaluate(async course => {
  const IN = await import('/js/instructor.js');
  const CL = await import('/js/classroom.js');
  const ED = await import('/js/edition.js');
  const panel = await import('/js/panels/classroom.js');
  const st = await import('/js/state.js');
  const out = { instructorFlag: ED.INSTRUCTOR };
  const csvEN = 'First name,Last name,ID number,Email address,Groups\nAna,Roy,1,ana.roy@example.edu,Team A\nBen,Lee,2,Ben.Lee@example.edu,Team A\nCyd,Wu,3,cyd.wu@example.edu,Team B\n';
  const csvFR = 'Prénom;Nom;Adresse de courriel;Groupes\nDia;Tremblay;dia@example.edu;Équipe 1\n';
  const ros = IN.parseRoster(csvEN);
  out.roster = ros.length; out.lower = ros[1].email; out.teams = IN.teams(ros).join('|');
  out.fr = IN.parseRoster(csvFR)[0].group;
  try { IN.parseRoster('foo,bar\n1,2\n'); out.badRoster = 'accepted'; } catch (e) { out.badRoster = 'refused'; }
  const saved = await IN.saveRoster(ros);
  out.rosterPath = saved.path;
  out.rosterBack = (await IN.loadRoster()).length;
  const k = await IN.key(true);
  out.fp = k.fingerprint;
  // instructor builds an assignment pack
  const b = IN.body({ kind: 'assignment', courseId: course, courseTitle: 'Cyber governance', title: 'Lab 2 — scenarios', due: '2099-12-31',
    ai: [], proposals: true, content: { case: 'canaretail', steps: [5, 6, 7, 8], deliverables: ['Scenario portfolio'] } });
  out.rubric = (b.content.rubric || []).length;
  const pack = await IN.sign(b);
  // student imports, works, submits
  out.accepted = (await CL.accept(pack)).accepted;
  const rec = CL.packs().find(p => p.body.course.id === course && p.body.kind === 'assignment');
  const ws = await panel.startWorkspace(rec);
  out.proposals = (await import('/js/ontoprop.js')).blockedReason(st.S.ws);
  const sub = await CL.submit(rec, { team: 'Team A', ws: st.S.ws, progress: [{ n: 1, status: 'done' }, { n: 2, status: 'todo' }], aiLog: [] });
  // instructor checks and grades
  out.check = (await IN.check(sub)).status;
  out.ev = IN.evidence(sub);
  const picks = b.content.rubric.map(() => 'good');
  out.grade = IN.grade(b.content.rubric, picks);
  out.partial = IN.grade(b.content.rubric, ['excellent']).complete;
  out.csv = IN.moodleCSV([{ team: 'Team A', ...out.grade, comment: 'Clear causal chains, "good" work' }], ros);
  // exercise pack: codes on the facilitator sheet only
  const ex = await IN.exercisePack({ courseId: course, courseTitle: 'Cyber governance', title: 'Exercise — supplier' }, 'ex2-canaretail-supplier');
  const exPack = await IN.sign(ex.body);
  const md = IN.sheetMarkdown('Exercise — supplier', ex.sheet, 'en');
  out.sheetCodes = ex.sheet.every(s => md.includes(s.code));
  out.packHasNoCode = ex.sheet.every(s => !JSON.stringify(exPack).includes(s.code));
  // the four samples as a course pack, re-signed
  const src = await IN.samples();
  const items = [];
  for (const e of src.exercises) items.push((await IN.exercisePack({ courseId: course, courseTitle: 'Cyber governance', title: e.title.en }, e.id)).body);
  const cp = await IN.sign(IN.coursePack(course, 'Cyber governance', 'Sample tabletop exercises', items));
  const v = await CL.verify(cp);
  out.course = { status: v.status, items: cp.body.content.items.length, kind: cp.body.kind };
  const re = await IN.sign({ ...cp.body });
  out.resigned = (await CL.verify(re)).status;
  // the instructor screens render
  const TEACH = await import('/js/panels/classroom_teach.js');
  const box = document.createElement('div'); document.body.append(box);
  const texts = {};
  for (const [name, fn] of [['settings', TEACH.settingsTab], ['packs', TEACH.packsTab], ['grading', TEACH.gradingTab], ['course', TEACH.courseTab]]) {
    box.replaceChildren(); await fn(box, () => {}); texts[name] = box.innerText;
  }
  box.remove();
  out.texts = texts;
  return out;
}, course);
ok(r.instructorFlag === false, 'the source tree is the Community edition: the instructor side is off in the menu');
ok(r.roster === 3 && r.lower === 'ben.lee@example.edu' && r.teams === 'Team A|Team B', 'the Moodle participants export is read (emails lower-cased, groups as teams)');
ok(r.fr === 'Équipe 1' && r.badRoster === 'refused', 'French headers and semicolons are read; a file without name and email columns is refused');
ok(/_installation[\\/]classroom[\\/]roster\.json$/.test(r.rosterPath) && r.rosterBack === 3, 'the roster is kept in the confidential folder: ' + r.rosterPath);
ok(/^[0-9A-F]{4}( [0-9A-F]{4}){3}$/.test(r.fp), 'the instructor key exists');
ok(r.rubric === 4 && r.accepted, 'the pack carries the default rubric and the student accepts it');
ok(r.proposals === null, 'the pack allows ontology proposals, so the classroom workspace may propose');
ok(r.check === 'intact' && r.ev.steps === '1 / 2' && r.ev.late === false, 'the instructor sees an intact, on-time submission with its 19-step evidence');
ok(r.grade.complete && r.grade.pct === 80 && r.partial === false, 'the rubric grade is computed only when every criterion has a level (80 %)');
const lines = r.csv.trim().split('\n');
ok(lines[0] === 'Email address,Grade,Feedback comments' && lines.length === 3, 'the Moodle CSV has one row per member of Team A');
ok(/^ana\.roy@example\.edu,80,"Clear causal chains, ""good"" work"$/.test(lines[1]), 'grades and comments are quoted for CSV: ' + lines[1]);
ok(r.sheetCodes && r.packHasNoCode, 'the exercise codes are on the facilitator sheet and nowhere in the pack');
ok(r.course.kind === 'course' && r.course.items === 4 && ['verified', 'new-course'].includes(r.course.status), 'the four samples form a signed course pack');
ok(['verified', 'new-course'].includes(r.resigned), 're-signing a course pack keeps it valid');
ok(/Instructor key/.test(r.texts.settings) && /Roster/.test(r.texts.settings) && /3 students · 2 teams/.test(r.texts.settings), 'Settings → Classroom shows the key and the roster');
ok(/Build a pack/.test(r.texts.packs) && /Sign and export the pack/.test(r.texts.packs), 'Packs shows the builder');
ok(/Open submission files/.test(r.texts.grading), 'Submissions & grading opens files');
ok(/four sample exercises/.test(r.texts.course) && /Reuse a course pack/.test(r.texts.course), 'Course packs builds and reuses course packs');
ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t87 classroom round trip');
