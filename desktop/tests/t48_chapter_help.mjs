// t48 — chapter-linked help (1.9.0): "Read more: Chapter N — section" on every screen and every process step,
// in English and French, from one table (js/data/chapters.js) whose references resolve in the book.
//   Static: every screen of app.js PANELS and every step of process.js STEPS has an entry (a section id or
//   "none"); every section id exists; every English heading is a heading of its chapter in kb/book; every
//   section has a French heading. Run-time: the line under each screen title (EN, then FR after a language
//   switch without reload), the twenty step lines of the Process page, the Step by step window, no
//   textbook text beyond the reference line, and anchor_check passes.
import { open, ok, done, URL, APP } from './lib.mjs';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

/* ---- static: the table against app.js, process.js and the book ---- */
const src = fs.readFileSync(path.join(APP, 'js/data/chapters.js'), 'utf8');
const block = name => { const i = src.indexOf(`export const ${name} = `) + `export const ${name} = `.length; return JSON.parse(src.slice(i, src.indexOf('\n};', i) + 2)); };
const SECTIONS = block('SECTIONS'), SCREENS = block('SCREENS'), STEPS = block('STEPS'), BOOK = block('BOOK');
const panels = fs.readFileSync(path.join(APP, 'js/app.js'), 'utf8').match(/const PANELS = \{([^}]*)\}/)[1].split(',').map(s => s.split(':')[0].trim()).filter(Boolean);
ok(panels.length > 30, `PANELS read from app.js (${panels.length})`);
for (const p of panels) ok(p in SCREENS, `screen ${p} has a chapter entry or an explicit "none"`);
for (const k of Object.keys(SCREENS)) ok(panels.includes(k.split('/')[0]), `entry ${k} names a screen of PANELS`);
const stepIds = [...fs.readFileSync(path.join(APP, 'js/process.js'), 'utf8').matchAll(/\{ id: '([a-z_]+)', n: /g)].map(m => m[1]);
ok(stepIds.length === 20, `twenty steps in process.js (19 + report): ${stepIds.length}`);
for (const s of stepIds) ok(STEPS[s] && SECTIONS[STEPS[s]], `step ${s} → a section of the book`);
for (const [k, v] of Object.entries(SCREENS)) ok(v === 'none' || SECTIONS[v], `${k} → ${v} is a known section`);
const used = new Set([...Object.values(SCREENS), ...Object.values(STEPS)]);
for (const [id, [ch, en, fr]] of Object.entries(SECTIONS)) {
  const f = path.join(APP, 'kb/book', `ch${String(ch).padStart(2, '0')}.md`);
  const heads = fs.existsSync(f) ? [...fs.readFileSync(f, 'utf8').matchAll(/^#{2,4}\s+(.+?)\s*$/gm)].map(m => m[1].replace(/\s+/g, ' ').trim()) : [];
  ok(heads.includes(en), `${id}: “${en}” is a heading of chapter ${ch}`);
  ok(fr && fr !== en && !/appétit|actifs? essentiels?/i.test(fr), `${id}: French heading present, book terminology`);
  ok(used.has(id), `${id} is used by a screen or a step`);
}
let anchor = '';
try { anchor = execFileSync('python3', [path.join(APP, 'tools/anchor_check.py')], { encoding: 'utf8' }); } catch (e) { anchor = String(e.stdout || e); }
ok(/chapter help: \d+ screen entries and 20 steps resolve/.test(anchor) && !/missing|problem/.test(anchor), 'anchor_check passes, chapter help included');

/* ---- run time ---- */
const { browser, ctx, page, errors } = await open('#/process');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); if (ex) await st.select(ex.id);
  const i = await import('/js/i18n.js'); await i.setLang('en'); });
const lineOf = () => page.evaluate(() => { const sec = [...document.querySelectorAll('section[id^="panel-"]')].find(s => !s.hidden);
  const n = sec && sec.querySelectorAll('.readmore-screen'); return n ? { count: n.length, text: n[0]?.textContent || '', ref: n[0]?.dataset.chref || '', noi18n: n[0]?.hasAttribute('data-noi18n') } : null; });
// The line is added with the "?" help when the screen has finished drawing (helpdesc.decorate); screens that wait on the
// helper (ontology, settings) can take more than a second under a full run, so wait for the decoration, not a fixed time.
const visit = async r => { await page.evaluate(h => { location.hash = '#/' + h; }, r); await page.waitForTimeout(300);
  await page.waitForFunction(() => { const s = [...document.querySelectorAll('section[id^="panel-"]')].find(x => !x.hidden); return !!s?.querySelector('h1 .helpq'); }, null, { timeout: 8000, polling: 150 }).catch(() => {}); };
const sectionOf = r => { const [p, a] = r.split('/'); const id = (a && SCREENS[p + '/' + a]) || SCREENS[p]; return id === 'none' ? null : id; };

// Every module on: a module that is off by default (identity, privilege & configuration) shows only its "switched off"
// notice, which carries no chapter line; the screen itself is what is under test.
await page.evaluate(async () => { const M = await import('/js/modules.js'); for (const m of M.MODULES) if (!M.enabled(m.id)) M.set(m.id, true); });
const routes = [...panels.filter(p => p !== 'scenario'), 'org/profile', 'org/crown', 'screening/families', 'recs/shared', 'csm/incidents', 'isms/exceptions', 'settings/users', 'settings/general',
  'ipc/privileged', 'ipc/baselines', 'vulns/ssvc', 'forecast/exploit', 'forecast/optimizer', 'ai/history', 'settings/kb'];
for (const r of routes) {
  await visit(r);
  const L = await lineOf(), want = sectionOf(r);
  if (!want) { ok(L && L.count === 0, `${r}: no chapter line (entry "none")`); continue; }
  const [n, en] = SECTIONS[want];
  ok(L && L.count === 1, `${r}: one chapter line under the title (${L?.count})`);
  ok(L && L.text === `Read more: Chapter ${n} — ${en}`, `${r}: “Read more: Chapter ${n} — ${en}” (got “${L?.text}”)`);
  ok(L && L.noi18n, `${r}: the line is kept out of the catalogue (data-noi18n)`);
}
// the scenario editor needs a scenario
await page.evaluate(async () => { const st = await import('/js/state.js'); location.hash = '#/scenario/' + st.S.ws.assessment.SCEN[0].id; });
await page.waitForTimeout(800);
ok((await lineOf())?.text === `Read more: Chapter 6 — ${SECTIONS['ch06-variables'][1]}`, 'scenario editor: Chapter 6 — the variables and their valid ranges');

// a screen redrawn by a tab change keeps exactly one line, for the tab
await visit('org/profile'); await visit('org/crown');
const crown = await lineOf();
ok(crown.count === 1 && crown.ref === 'ch05-crown', 'Organization → Crown jewels: one line, chapter 5 crown jewels');

// Process page: one line per step, in step order
await visit('process');
const steps = await page.evaluate(() => [...document.querySelectorAll('.pstep')].map(li => ({ id: li.id.replace('step-', ''), t: li.querySelector('.readmore-step')?.textContent || '' })));
ok(steps.length === 20, `Process page shows twenty steps (${steps.length})`);
for (const s of steps) { const [n, en] = SECTIONS[STEPS[s.id]] || []; ok(s.t === `Read more: Chapter ${n} — ${en}`, `step ${s.id}: ${s.t}`); }
ok(/Chapter 4 — Risk appetite and risk tolerance/.test(steps.find(s => s.id === 'appetite')?.t || ''), 'step 4 → Chapter 4, risk appetite and risk tolerance');

// French: switching the language redraws the lines in place (no reload)
await page.evaluate(async () => { const i = await import('/js/i18n.js'); window.__miss = i.collectMissing(); await i.setLang('fr'); });
await page.waitForTimeout(500);
const stepsFR = await page.evaluate(() => [...document.querySelectorAll('.readmore-step')].map(n => n.textContent));
ok(stepsFR.length === 20 && stepsFR.every(t => /^Pour en savoir plus : chapitre \d+ — /.test(t)), 'French: every step line reads “Pour en savoir plus : chapitre N — …”');
ok(stepsFR.includes(`Pour en savoir plus : chapitre 4 — ${SECTIONS['ch04-appetite'][2]}`), 'French step 4 cites the French heading (appétence pour le risque)');
for (const r of ['org/crown', 'evidence', 'calc', 'budget']) {
  await visit(r);
  const L = await lineOf(), [n, , fr] = SECTIONS[sectionOf(r)];
  ok(L && L.text === `Pour en savoir plus : chapitre ${n} — ${fr}`, `fr ${r}: ${L?.text}`);
}
const miss = await page.evaluate(async () => (await import('/js/i18n.js')).missingNow());
ok(!miss.some(s => /Read more|Chapter \d/.test(s)), 'no English chapter line left untranslated in French');
await page.evaluate(async () => { const i = await import('/js/i18n.js'); await i.setLang('en'); });
await page.waitForTimeout(300);
ok(/^Read more: Chapter \d+ — /.test((await lineOf())?.text || ''), 'back to English: the line follows');

// Step by step window
const g = await ctx.newPage();
await g.goto(URL + 'help/step-by-step.html');
await g.waitForFunction(() => document.querySelectorAll('.step').length >= 20, null, { timeout: 15000 });
const sbs = await g.evaluate(() => [...document.querySelectorAll('.step')].map(b => ({ id: b.id.replace('step-', ''), t: b.querySelector('.readmore')?.textContent || '' })));
ok(sbs.length === 20 && sbs.every(s => s.t === `Read more: Chapter ${SECTIONS[STEPS[s.id]][0]} — ${SECTIONS[STEPS[s.id]][1]}`), 'Step by step window: every step has its chapter line');
await g.close();

// only the reference line: the table carries no textbook text (headings only, short)
ok(Object.values(SECTIONS).every(([, en, fr]) => en.length < 120 && fr.length < 140), 'the table holds headings only');
ok(BOOK.edition === 'v2.51b', 'book edition v2.51b');
ok(errors.length === 0, 'no page errors: ' + errors.join(' | ').slice(0, 400));
await browser.close(); done('t48 chapter help');
