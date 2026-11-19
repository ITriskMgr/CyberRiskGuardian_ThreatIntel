// t86 — Classroom exercises (BL-26, spec §6): the four sample exercises are complete in English and French; an exercise
// pack carries its injects sealed (no inject text and no code in the pack); a wrong code opens nothing, the facilitator's
// code opens the inject; decisions are recorded with role and time; the after-action report lists the timeline, the
// decisions and the debrief; the submission carries the run and the report. Plays one sample end to end in the UI.
import { open, ok, done, goto } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
const course = 'T86-' + Date.now().toString(36);
const r = await page.evaluate(async course => {
  const H = await import('/js/helper.js');
  const CL = await import('/js/classroom.js');
  const EX = await import('/js/exercise.js');
  const src = await (await fetch('/examples/classroom/sample-exercises.json')).json();
  const out = { ids: src.exercises.map(e => e.id) };
  out.complete = src.exercises.every(e => e.injects.length >= 6 && e.injects.length <= 10 && e.debrief.length >= 2 && e.chapters.length
    && ['en', 'fr'].every(L => e.title[L] && e.brief[L] && e.injects.every(i => i.title[L] && i.text[L] && i.ask[L]) && e.debrief.every(q => q[L]))
    && e.roles.every(x => src.roles[x]?.en && src.roles[x]?.fr));
  out.noCodeInSource = !/"code"/.test(JSON.stringify(src));
  const built = [];
  for (const id of out.ids) built.push(await EX.buildContent(src, id));
  out.codesUnique = built.every(b => new Set(b.sheet.map(s => s.code)).size === b.sheet.length && b.sheet.every(s => /^[A-HJKMNP-Z2-9]{6}$/.test(s.code)));
  const b0 = built[0];
  const packJson = JSON.stringify(b0.content);
  out.sealed = !packJson.includes(src.exercises[0].injects[0].text.en.slice(0, 30)) && !b0.sheet.some(s => packJson.includes(s.code));
  out.wrong = await EX.open(b0.content.injects[0], 'AAAAAA');
  out.right = (await EX.open(b0.content.injects[0], b0.sheet[0].code))?.title?.en;
  out.lower = (await EX.open(b0.content.injects[0], b0.sheet[0].code.toLowerCase().replace(/(...)/, '$1 ')))?.title?.en;
  const body = { kind: 'exercise', course: { id: course, title: 'Cyber governance' }, title: 'Exercise — ransomware', issued: '2026-11-19',
    settings: { ai: [], proposals: false, reveal: 'after', due: '' }, content: b0.content };
  const pack = (await H.post('/api/classroom/sign', { body })).pack;
  out.accepted = (await CL.accept(pack)).accepted;
  out.sheet = b0.sheet;
  return out;
}, course);
ok(r.ids.length === 4, 'four sample exercises: ' + r.ids.join(', '));
ok(r.complete, 'each has 6–10 injects, roles and debrief questions, in English and French');
ok(r.noCodeInSource, 'the shipped source holds no unlock code');
ok(r.codesUnique, 'building a pack makes fresh six-character codes from the unambiguous alphabet');
ok(r.sealed, 'the pack carries neither the inject text nor the codes');
ok(r.wrong === null, 'a wrong code opens nothing');
ok(r.right === 'First calls' && r.lower === 'First calls', 'the facilitator’s code opens the inject (case and spaces ignored)');
ok(r.accepted, 'the signed exercise pack is accepted');

await goto(page, '#/classroom/exercise', 900);
let main = await page.locator('main').innerText();
ok(/Ransomware across MediBec’s clinics/.test(main) && /Inject 1 — locked/.test(main), 'the exercise opens with its injects locked');
await page.locator('.field:has-text("Incident commander") input').fill('Alex');
await page.locator('.field:has-text("Incident commander") input').dispatchEvent('change');
const code1 = page.locator('input[aria-label="Unlock code for inject 1"]');
await code1.fill('ZZZZZZ'); await page.locator('button:has-text("Unlock")').first().click(); await page.waitForTimeout(700);
main = await page.locator('main').innerText();
ok(/Inject 1 — locked/.test(main), 'a wrong code leaves the inject locked');
await code1.fill(r.sheet[0].code); await page.locator('button:has-text("Unlock")').first().click(); await page.waitForTimeout(900);
main = await page.locator('main').innerText();
ok(/Inject 1 — First calls/.test(main) && /Who leads\?/.test(main), 'the right code shows the inject and its question');
await page.locator('textarea[aria-label="Decision"]').first().fill('Isolate the shared drive; clinics switch to paper scheduling.');
await page.locator('button:has-text("Record the decision")').first().click(); await page.waitForTimeout(600);
main = await page.locator('main').innerText();
ok(/Incident commander — Isolate the shared drive/.test(main), 'the decision is recorded with its role');
const rep = await page.evaluate(async () => {
  const CL = await import('/js/classroom.js'); const EX = await import('/js/exercise.js');
  await CL.load();
  const rec = CL.packs().find(p => p.body.kind === 'exercise');
  const run = CL.run(rec.id);
  const md = EX.afterAction(rec.body.content, run, 'en', 'Team 2');
  const fr = EX.afterAction(rec.body.content, run, 'fr', 'Équipe 2');
  const sub = await CL.submit(rec, { team: 'Team 2', exercise: { run, report: md } });
  return { md, fr, subRun: sub.body.exercise?.run?.decisions?.length, roles: run.roles };
});
ok(/# After-action report — Ransomware across MediBec’s clinics/.test(rep.md) && /Inject 1 — First calls \(opened /.test(rep.md), 'the after-action report has the timeline');
ok(/\*\*Incident commander\*\* — Isolate the shared drive/.test(rep.md) && /Incident commander: Alex/.test(rep.md), 'the report lists the decision with its role, and the roles');
ok(/not confirmed incidents/.test(rep.md) && /# Rapport après action/.test(rep.fr), 'the report says it is exercise material; it exists in French');
ok(rep.subRun === 1, 'the submission carries the run');
ok(errors.length === 0, 'no console error: ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t86 classroom exercise');
