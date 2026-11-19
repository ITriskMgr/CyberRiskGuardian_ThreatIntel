// t88 — WCAG 2.1 AA on the Classroom screens t84 cannot reach (BL-25/26, spec §10): the instructor screens (Educational
// edition, drawn directly into the Classroom section, as the source tree is the Community edition) and the student screens
// in their working states (a quiz in progress with feedback, an exercise with an inject open and a decision, grading with a
// submission loaded). Gated as t84: any axe violation tagged WCAG 2.0/2.1/2.2 A or AA, and heading order; English light,
// French dark.
import fs from 'fs';
import path from 'path';
import { open, ok, done, goto, TESTS } from './lib.mjs';
const AXE = fs.readFileSync(path.join(TESTS, 'vendor', 'axe.min.js'), 'utf8');
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const { browser, page, errors } = await open('#/process');
await page.setViewportSize({ width: 1600, height: 1000 });
const course = 'T88-' + Date.now().toString(36);
// a quiz pack, an exercise pack with one inject opened and a decision, and one submission to grade
const setup = await page.evaluate(async course => {
  const IN = await import('/js/instructor.js'); const CL = await import('/js/classroom.js'); const EX = await import('/js/exercise.js');
  await IN.key(true);
  await IN.saveRoster(IN.parseRoster('First name,Last name,Email address,Groups\nAna,Roy,ana@example.edu,Team A\n'));
  const q = await IN.sign(IN.body({ kind: 'quiz', courseId: course, courseTitle: 'Governance', title: 'Quiz 4', reveal: 'immediate', content: { chapters: [4], count: 3 } }));
  await CL.accept(q);
  const ex = await IN.exercisePack({ courseId: course, courseTitle: 'Governance', title: 'Exercise 1' }, 'ex1-medibec-ransomware');
  await CL.accept(await IN.sign(ex.body));
  const rec = CL.packs().find(p => p.body.kind === 'exercise' && p.body.course.id === course);
  const run = EX.blankRun(); const inj = await EX.open(rec.body.content.injects[0], ex.sheet[0].code);
  run.opened.push({ n: 1, at: new Date().toISOString(), ...inj }); run.decisions.push({ n: 1, role: 'ic', text: 'Isolate the drive.', at: new Date().toISOString() });
  await CL.saveRun(rec.id, run);
  const sub = await CL.submit(rec, { team: 'Team A', exercise: { run, report: EX.afterAction(rec.body.content, run) } });
  return { sub };
}, course);
await page.evaluate(AXE + '\n;window.axe = axe; true');
const views = ['settings', 'packs-assignment', 'packs-quiz', 'packs-exercise', 'grading', 'course', 'quiz-running', 'exercise-open'];
const gated = [];
let checked = 0;
for (const [lang, theme] of [['en', 'light'], ['fr', 'dark']]) {
  await page.evaluate(async l => { const I = await import('/js/i18n.js'); await I.setLang(l); }, lang);
  await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
  for (const v of views) {
    await goto(page, '#/process', 300);             // a hash change, so the Classroom screen is drawn afresh
    if (v === 'quiz-running') {
      await goto(page, '#/classroom/assignments', 700);
      await page.locator('button:has-text("Take the quiz"), button:has-text("Répondre au questionnaire")').first().click();
      await page.waitForTimeout(700);
      await page.locator('ol.quiz li').first().locator('input[type=radio]').first().check();
      await page.waitForTimeout(500);
    } else if (v === 'exercise-open') {
      await goto(page, '#/classroom/exercise', 900);
    } else {
      await goto(page, '#/classroom/assignments', 600);
      await page.evaluate(async ([v, sub]) => {
        const T = await import('/js/panels/classroom_teach.js');
        const sec = document.getElementById('panel-classroom');
        const h = document.createElement('h1'); h.textContent = 'Classroom';
        const body = document.createElement('div');
        sec.replaceChildren(h, body);
        if (v.startsWith('packs')) {
          // choose the pack type through the form, as an instructor would
          await T.packsTab(body, () => {});
          const kind = v.split('-')[1];
          const sel = body.querySelector('#cl-kind'); sel.value = kind; sel.dispatchEvent(new Event('change'));
          body.replaceChildren(); await T.packsTab(body, () => {});
        } else if (v === 'grading') {
          const f = new File([JSON.stringify(sub)], 'sub.crgsub', { type: 'application/json' });
          await T.gradingTab(body, async () => { body.replaceChildren(); await T.gradingTab(body, () => {}); });
          const inp = body.querySelector('input[type=file]');
          const dt = new DataTransfer(); dt.items.add(f); inp.files = dt.files; inp.dispatchEvent(new Event('change'));
          await new Promise(r => setTimeout(r, 1500));
        } else await ({ settings: T.settingsTab, course: T.courseTab }[v])(body, () => {});
      }, [v, setup.sub]);
      await page.waitForTimeout(500);
    }
    const res = await page.evaluate(async wcag => {
      const sec = document.getElementById('panel-classroom');
      const out = await axe.run(sec, { resultTypes: ['violations'], runOnly: { type: 'tag', values: [...wcag, 'best-practice'] } });
      return { text: sec.innerText.slice(0, 4000), v: out.violations.map(x => ({ id: x.id, wcag: x.tags.some(t => wcag.includes(t)), n: x.nodes.length, ex: (x.nodes[0]?.html || '').slice(0, 120) })) };
    }, WCAG);
    checked++;
    if (v === 'grading') ok(/intact/i.test(res.text) || /intacte/i.test(res.text), `${lang}: the loaded submission shows its integrity`);
    if (v === 'exercise-open') ok(/Isolate the drive/.test(res.text), `${lang}: the exercise shows the opened inject and its decision`);
    for (const x of res.v) if (x.wcag || x.id === 'heading-order') gated.push(`${x.id} ${lang}-${theme} ${v} ×${x.n}: ${x.ex}`);
  }
}
for (const g of gated.slice(0, 30)) console.log('  ' + g);
ok(checked === views.length * 2, `axe ran on ${checked} Classroom views`);
ok(gated.length === 0, `no WCAG A/AA violation and no heading-order skip (${gated.length}) ${gated.slice(0, 3).join(' | ')}`);
ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t88 classroom axe');
