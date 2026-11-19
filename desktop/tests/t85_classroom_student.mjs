// t85 — Classroom, student side (BL-25/26, spec §2–§7): a pack signed by the instructor key is checked by the helper,
// pins its course, and a tampered copy is refused; an assessment pack opens a classroom workspace whose AI features and
// ontology proposals follow the pack; the submission file carries a checksum and a late flag; the quiz draws from the
// 420-question bank in English and French and points to the section to reread. A fresh course id per run, because the
// helper's pins persist in the test key folder.
import { open, ok, done, goto } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const course = 'T85-' + Date.now().toString(36);
const r = await page.evaluate(async course => {
  const H = await import('/js/helper.js');
  const CL = await import('/js/classroom.js');
  const AI = await import('/js/ai.js');
  const OP = await import('/js/ontoprop.js');
  const st = await import('/js/state.js');
  const panel = await import('/js/panels/classroom.js');
  const out = {};
  const key = await H.post('/api/classroom/key', { create: true });
  out.fp = key.key.fingerprint;
  const mk = (kind, title, settings, content) => ({ kind, course: { id: course, title: 'Cyber governance' }, title, issued: '2026-11-19',
    settings: Object.assign({ ai: [], proposals: false, reveal: 'after', due: '' }, settings), content });
  const assign = (await H.post('/api/classroom/sign', { body: mk('assignment', 'Lab 1 — context and appetite', { ai: ['critique'], due: '2026-01-01' },
    { case: 'medibec', steps: [1, 2, 3, 4], deliverables: ['scenario portfolio'] }) })).pack;
  const quiz = (await H.post('/api/classroom/sign', { body: mk('quiz', 'Quiz — chapter 4', { reveal: 'immediate' }, { chapters: [4], count: 5 }) })).pack;
  const bad = JSON.parse(JSON.stringify(assign)); bad.body.settings.ai.push('scenarios');
  out.bad = (await CL.verify(bad)).status;
  out.first = (await CL.verify(assign)).status;
  out.firstFp = (await CL.verify(assign)).fingerprint;
  out.acc1 = (await CL.accept(assign)).accepted;
  out.second = (await CL.verify(quiz)).status;
  out.acc2 = (await CL.accept(quiz)).accepted;
  out.badAccept = (await CL.accept(bad)).accepted;
  const rec = CL.packs().find(p => p.body.kind === 'assignment' && p.body.course.id === course);
  const ws = await panel.startWorkspace(rec);
  await CL.update(rec.id, { ws: ws.id, status: 'progress' });
  out.kind = st.S.ws.kind; out.packTitle = st.S.ws.classroom?.pack?.title;
  out.aiScen = AI.route('scenarios', st.S.ws).why;
  out.aiCrit = AI.route('critique', st.S.ws).why;
  out.onto = OP.blockedReason(st.S.ws);
  const sub = await CL.submit(rec, { team: 'Team 3', ws: st.S.ws, progress: [{ n: 1, status: 'done' }], aiLog: [] });
  out.subLate = sub.body.late; out.subWs = !!sub.body.workspace?.assessment;
  out.check = (await H.post('/api/classroom/check', { submission: sub })).status;
  const alt = JSON.parse(JSON.stringify(sub)); alt.body.team = 'Team 4';
  out.checkAlt = (await H.post('/api/classroom/check', { submission: alt })).status;
  const bank = await CL.quizBank();
  out.chapters = bank.chapters.length;
  out.questions = bank.chapters.reduce((a, c) => a + c.questions.length, 0);
  out.frOk = bank.chapters.every(c => c.questions.every(q => q.q.fr && q.options.fr.length === 4 && q.section.fr));
  out.noRationale = bank.chapters.every(c => c.questions.every(q => Object.keys(q).sort().join() === 'answer,n,options,q,section'));
  out.draw = CL.draw(bank, [4], 5, 7).map(q => q.ch + '.' + q.n).join(',') === CL.draw(bank, [4], 5, 7).map(q => q.ch + '.' + q.n).join(',');
  return out;
}, course);
ok(/^[0-9A-F]{4}( [0-9A-F]{4}){3}$/.test(r.fp), 'the instructor key has a fingerprint in four groups: ' + r.fp);
ok(r.bad === 'invalid' && r.badAccept === false, 'a pack altered after signing is refused (AI list widened)');
ok(r.first === 'new-course' && r.firstFp === r.fp, 'the first pack of a course asks the student to compare the fingerprint');
ok(r.acc1 && r.second === 'verified' && r.acc2, 'the course is pinned; the next pack from the same key is verified');
ok(r.kind === 'classroom' && r.packTitle === 'Lab 1 — context and appetite', 'Start opens a classroom workspace tied to the pack');
ok(/has not allowed this AI feature/.test(r.aiScen), 'an AI feature the pack does not list is refused');
ok(!/has not allowed this AI feature/.test(r.aiCrit), 'the AI feature the pack lists is not refused by the classroom');
ok(/not allowed ontology proposals/.test(r.onto || ''), 'ontology proposals follow the pack (not allowed here)');
ok(r.subLate === true && r.subWs, 'the submission carries the workspace and is marked late (due date passed), not refused');
ok(r.check === 'intact' && r.checkAlt === 'altered', 'the submission checksum shows an alteration');
ok(r.chapters === 21 && r.questions === 420 && r.frOk, 'the quiz bank has 21 chapters, 420 questions, French complete');
ok(r.noRationale, 'a question carries only its text, options, public answer and reading pointer (no rationale field)');
ok(r.draw, 'the draw is deterministic for a seed');

await goto(page, '#/classroom/assignments', 900);
let main = await page.locator('main').innerText();
ok(/Lab 1 — context and appetite/.test(main) && /Quiz — chapter 4/.test(main), 'My assignments lists both packs');
ok(/2026-01-01/.test(main) && /Lab 1[\s\S]*Submitted/.test(main), 'the due date is shown; the submitted assignment shows Submitted (late is in the file)');
await page.locator('tr:has-text("Quiz — chapter 4") button:has-text("Take the quiz")').click();
await page.waitForTimeout(800);
await page.locator('ol.quiz li').first().locator('input[type=radio]').first().check();
await page.waitForTimeout(500);
main = await page.locator('main').innerText();
ok(/Read more: Chapter 4: Cybersecurity Risk Management — /.test(main), 'an answer shows the chapter section to reread (immediate reveal)');
await page.locator('button:has-text("Finish")').click();
await page.waitForTimeout(600);
main = await page.locator('main').innerText();
ok(/Score/.test(main) && /\d+ \/ 5/.test(main), 'Finish shows the score out of 5');
await goto(page, '#/classroom/assignments', 700);
main = await page.locator('main').innerText();
ok(/Quiz — chapter 4[\s\S]*Submitted/.test(main), 'the quiz pack is marked submitted');
ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t85 classroom student');
