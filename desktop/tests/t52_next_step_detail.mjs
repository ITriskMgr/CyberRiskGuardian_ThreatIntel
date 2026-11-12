// 1.9.1 — the next step always obvious, and the level of detail.
// Next-step card: the step's checks with the hint of each unmet one, a primary button to the screen of the first
// unmet check (with its route argument); landing on the Process page while a step remains (Minimal keeps the
// register); Minimal / Standard / Detailed (Settings → Language & detail and the Process header; per installation, or
// per signed-in person); Minimal hides introductions and explanatory hints but keeps hints that change what a value
// means; Detailed adds a "why this screen matters" line on every screen (EN/FR) and opens the step's tips and
// guidelines; the Virtual consultant's prompt follows the level; the first-run set-up questions.
import { open, ok, done, URL } from './lib.mjs';
import { readFileSync } from 'fs';

const { browser, page, errors } = await open('#/process');
const ready = async () => { for (let i = 0; i < 80; i++) { try { if (await page.evaluate(async () => !!(await import('/js/state.js')).S.ws && !![...document.querySelectorAll('main > section')].find(s => !s.hidden)?.querySelector('h1'))) return; } catch { /* reloading */ } await page.waitForTimeout(250); } };
const level = v => page.evaluate(async v => { const D = await import('/js/detail.js'); await D.set(v); }, v);

/* ---------- a fresh workspace: step 1 is next ---------- */
await page.evaluate(async () => { const st = await import('/js/state.js'); const w = st.newWorkspace({ name: 'Next step test' }); await st.create(w); });
await page.evaluate(() => { location.hash = '#/process'; }); await page.waitForTimeout(900);
const band = await page.evaluate(() => { const b = document.querySelector('.next-step'); return b && { text: b.innerText, checks: b.querySelectorAll('.next-checks li').length, cur: b.querySelector('.next-checks li.cur')?.innerText || '', go: document.getElementById('next-step-go')?.textContent || '' }; });
ok(band && band.checks >= 3, 'the next-step card lists the checks of step 1 ' + JSON.stringify(band?.checks));
ok(/context document/i.test(band?.cur || ''), 'the first unmet check is marked as the current one: ' + band?.cur);
ok(/^Next: At least one context document/.test(band?.go || ''), 'the primary button names the first thing to do: ' + band?.go);
ok(/A document is what the extractions read/.test(band?.text || ''), 'an unmet check shows its hint');
ok(/✓/.test(band?.text || ''), 'a met check is ticked (the organization name)');
await page.click('#next-step-go'); await page.waitForTimeout(700);
ok(await page.evaluate(() => location.hash) === '#/org/docs', 'the primary button opens the screen of the first unmet check, with its route argument');
await page.evaluate(async () => { const st = await import('/js/state.js'); st.S.ws.docs.push({ id: 'doc-n1', name: 'case.txt', type: 'txt', words: 3, added: '2026-11-04' }); st.touch(); });
await page.evaluate(() => { location.hash = '#/process'; }); await page.waitForTimeout(800);
const go2 = await page.textContent('#next-step-go');
ok(/evidence register/.test(go2), 'once a document is there, the card moves on to the next check: ' + go2);
await page.click('#next-step-go'); await page.waitForTimeout(600);
ok(await page.evaluate(() => location.hash) === '#/evidence', '…and opens the Evidence register');

/* ---------- landing ---------- */
await page.goto(URL); await ready(); await page.waitForTimeout(600);
ok(await page.evaluate(() => !document.getElementById('panel-process').hidden), 'with a step remaining, the application opens on the Process page');
await level('minimal');
await page.goto(URL); await ready(); await page.waitForTimeout(600);
ok(await page.evaluate(() => !document.getElementById('panel-register').hidden), 'at Minimal it opens on the scenario register, as before');

/* ---------- Minimal: introductions and explanatory hints hidden, data-meaning hints kept ---------- */
ok(await page.evaluate(() => document.documentElement.dataset.detail) === 'minimal', 'the level is written on the document');
await page.evaluate(() => { location.hash = '#/settings/ai'; }); await page.waitForTimeout(1500);
const minimal = await page.evaluate(() => {
  const vis = n => !!n && getComputedStyle(n).display !== 'none';
  const sec = document.getElementById('panel-settings');
  const hints = [...sec.querySelectorAll('.field .hint')];
  return { desc: vis(sec.querySelector('.paneldesc, .lede')), plain: hints.filter(h => !h.classList.contains('keep')).some(vis), why: vis(sec.querySelector('.why')) };
});
ok(!minimal.desc && !minimal.plain && !minimal.why, 'Minimal hides the description and explanatory hints ' + JSON.stringify(minimal));
const keep = await page.evaluate(async () => { const U = await import('/js/util.js');
  const a = U.field('Accounts', document.createElement('input'), 'Leave blank when unknown — 0 means none');
  const b = U.field('Name', document.createElement('input'), 'The name people use for it.');
  const c = U.field('X', document.createElement('input'), 'anything', { keep: true });
  document.getElementById('panel-settings').append(a, b, c);
  const vis = n => getComputedStyle(n.querySelector('.hint')).display !== 'none';
  const r = [vis(a), vis(b), vis(c)]; a.remove(); b.remove(); c.remove(); return r; });
ok(keep[0] && !keep[1] && keep[2], 'a hint that changes what a value means stays at Minimal (blank vs 0; explicit keep) ' + JSON.stringify(keep));

/* ---------- Detailed: the why line on every screen, EN and FR; tips and guidelines open on Process ---------- */
await level('detailed');
const { WHY } = await page.evaluate(async () => ({ WHY: (await import('/js/whyscreen.js')).WHY }));
const panels = await page.evaluate(() => [...document.querySelectorAll('main > section')].map(s => s.id.replace('panel-', '')));
ok(panels.every(p => WHY[p]), 'every screen has a "why this screen matters" line: missing ' + panels.filter(p => !WHY[p]).join(','));
let shown = 0; const notShown = [];
for (const p of ['register', 'calc', 'org', 'assets', 'summary', 'budget', 'process', 'settings']) {
  await page.evaluate(h => { location.hash = '#/' + h; }, p); await page.waitForTimeout(800);
  const t = await page.evaluate(p => { const n = document.querySelector(`#panel-${p} .why`); return n && getComputedStyle(n).display !== 'none' ? n.textContent : ''; }, p);
  if (/^Why it matters/.test(t)) shown++; else notShown.push(p);
}
ok(shown === 8, 'at Detailed, the line is shown under the title ' + notShown.join(','));
await page.evaluate(() => { location.hash = '#/process'; }); await page.waitForTimeout(800);
const det = await page.evaluate(() => ({ tips: !!document.querySelector('.next-step .next-tips[open]'), gl: !!document.querySelector('.next-step .next-guidelines[open]') }));
ok(det.tips && det.gl, 'at Detailed, the next step shows its tips and guidelines open ' + JSON.stringify(det));
await page.evaluate(async () => { const i = await import('/js/i18n.js'); await i.setLang('fr'); });
await page.evaluate(() => { location.hash = '#/register'; }); await page.waitForTimeout(1000);
const fr = await page.evaluate(() => document.querySelector('#panel-register .why')?.textContent || '');
ok(/^Pourquoi c’est important/.test(fr), 'the line is in French in French: ' + fr.slice(0, 40));
const frSwitch = await page.evaluate(() => { location.hash = '#/process'; return new Promise(r => setTimeout(() => r([...document.querySelectorAll('#process-detail .detail-switch button')].map(b => b.textContent)), 900)); });
ok(JSON.stringify(frSwitch) === JSON.stringify(['Minimal', 'Standard', 'Détaillé']), 'the switch on the Process page, in French ' + JSON.stringify(frSwitch));
await page.evaluate(async () => { const i = await import('/js/i18n.js'); await i.setLang('en'); });

/* ---------- the switches ---------- */
await page.evaluate(() => { location.hash = '#/process'; }); await page.waitForTimeout(800);
await page.click('#process-detail .detail-switch button[data-level="standard"]'); await page.waitForTimeout(600);
ok(await page.evaluate(() => document.documentElement.dataset.detail) === 'standard', 'the Process header switch sets the level');
await page.evaluate(() => { location.hash = '#/settings/general'; }); await page.waitForTimeout(900);
ok(await page.isVisible('#detail-card'), 'Settings → Language & detail has the level of detail');
ok(await page.isVisible('nav a:has-text("Language & detail")') || await page.evaluate(() => [...document.querySelectorAll('nav a')].some(a => a.textContent.trim() === 'Language & detail')), 'the Settings tab is named Language & detail');
await page.click('#detail-card .detail-switch button[data-level="detailed"]'); await page.waitForTimeout(500);
ok(await page.evaluate(async () => (await import('/js/prefs.js')).get('detail')) === 'detailed', 'single-user: the level is stored for the installation');
// per signed-in person
const per = await page.evaluate(async () => { const u = await import('/js/users.js'); const D = await import('/js/detail.js');
  await u.enable('Admin'); const me = u.me(); await D.set('minimal'); const mine = me.detail; const inst = (await import('/js/prefs.js')).get('detail');
  await u.disable(); return { mine, inst, after: D.level() }; });
ok(per.mine === 'minimal' && per.inst === 'detailed' && per.after === 'detailed', 'multi-user: the level is stored for the signed-in person ' + JSON.stringify(per));

/* ---------- the Virtual consultant follows the level ---------- */
const prompts = await page.evaluate(async () => { const AI = await import('/js/ai.js'); const D = await import('/js/detail.js'); const C = await import('/js/consult.js'); const st = await import('/js/state.js');
  const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id);
  const out = {}; for (const l of ['minimal', 'standard', 'detailed']) { await D.set(l); out[l] = AI.TASKS.consultant.build(st.S.ws, { question: 'q', passages: [{ n: 1, cite: 'Chapter 6', text: 't' }] }).prompt; } return out; });
ok(/LEVEL OF DETAIL: minimal/.test(prompts.minimal) && /120 words/.test(prompts.minimal), 'consultant: brief at Minimal');
ok(/300 words/.test(prompts.standard) && /500 words/.test(prompts.detailed), 'consultant: standard and detailed lengths');
ok(['minimal', 'standard', 'detailed'].every(l => /\[P1\]/.test(prompts[l]) && /GENERAL:/.test(prompts[l]) && /Never state a risk figure/.test(prompts[l])), 'consultant: citations, the general-knowledge marker and the figure rule at every level');
await level('standard');

/* ---------- the set-up questions ---------- */
await page.evaluate(async () => { const p = await import('/js/prefs.js'); p.set('setupWizard', null); });
await page.evaluate(() => { location.hash = '#/register'; }); await page.waitForTimeout(300);
await page.evaluate(() => { location.hash = '#/process'; }); await page.waitForTimeout(900);
ok(await page.isVisible('#setup-invite'), 'first start: the Process page invites to the set-up questions (not a blocking dialog)');
ok(await page.evaluate(() => !document.querySelector('.modal-back')), 'no dialog blocks the screen');
await page.click('#setup-open'); await page.waitForSelector('.modal #wiz-apply');
ok(await page.evaluate(() => document.querySelectorAll('.modal fieldset.wiz-q').length) === 14, 'the questions: experience + thirteen module questions');
await page.check('.modal input[name="wiz-exp"][value="detailed"]');
await page.check('.modal input[name="wiz-iam"][value="yes"]');
await page.check('.modal input[name="wiz-audit"][value="no"]');
await page.click('#wiz-apply'); await page.waitForTimeout(800);
const after = await page.evaluate(async () => { const M = await import('/js/modules.js'); const D = await import('/js/detail.js'); const W = await import('/js/setupwizard.js'); return { iam: M.enabled('iam'), audit: M.enabled('audit'), isp: M.enabled('isp'), level: D.level(), settled: W.settled() }; });
ok(after.iam && !after.audit && after.isp && after.level === 'detailed' && after.settled, 'answers set the modules and the level; "not sure" keeps a module as it is ' + JSON.stringify(after));
ok(!(await page.isVisible('#setup-invite')), 'the invitation is gone once answered');
await page.evaluate(() => { location.hash = '#/settings/modules'; }); await page.waitForTimeout(900);
ok(await page.isVisible('#setup-again button'), 'Settings → Modules re-opens the set-up questions');
await page.evaluate(async () => { const M = await import('/js/modules.js'); M.set('iam', false); M.set('audit', true); const D = await import('/js/detail.js'); await D.set('standard'); });

// multi-user: the module questions are the administrator's
const mu = await page.evaluate(async () => { const u = await import('/js/users.js'); const p = await import('/js/prefs.js'); const W = await import('/js/setupwizard.js'); const M = await import('/js/modules.js');
  p.set('setupWizard', null); await u.enable('Admin'); const asAdmin = !!W.invitation(() => {});
  const s = u.newUser({ name: 'Student' }); u.U.users.push(s); u.U.current = s; const asStudent = !!W.invitation(() => {});
  const before = M.enabled('audit'); await W.applyAnswers({ experience: 'standard', audit: before ? 'no' : 'yes' }); const after = M.enabled('audit');
  u.U.current = u.U.users[0]; await u.disable(); p.set('setupWizard', { skipped: '2026-11-04' }); return { asAdmin, asStudent, unchanged: before === after }; });
ok(mu.asAdmin && !mu.asStudent && mu.unchanged, 'multi-user: only an administrator is invited, and a non-admin cannot change the modules ' + JSON.stringify(mu));

/* ---------- nothing else changes ---------- */
const eng = await page.evaluate(() => document.getElementById('engine-state').textContent);
ok(/84,305 \/ 41,023/.test(eng), 'the engine reference is unchanged: ' + eng);
ok(!/DATA_VERSION = 8/.test(readFileSync(new globalThis.URL('../app/js/migrate.js', import.meta.url), 'utf8')), 'no workspace data version beyond 7 (1.9.3)');

ok(errors.filter(e => !/net::ERR|Failed to load resource/.test(e)).length === 0, 'no console error: ' + errors.join(' | '));
await browser.close(); done('t52 next step and level of detail');
