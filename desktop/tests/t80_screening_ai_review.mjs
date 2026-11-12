// 1.9.3 (t56 tester findings on 1.9.2, C5 AI score estimates) — T3 the review panel fits the window (1280 and 1600 px, EN and FR),
// T4 accepting updates the screen without a reload, T5 the "Scored" tile and Process step 6 read the ACCEPTED AI scores,
// T6 "Need attention" says in plain words what it counts and links to each item; an accepted AI rationale is a rationale.
import { open, ok, done, goto, medibec, MOCK, MOCK_SRC } from './lib.mjs';
import fs from 'fs';
const { browser, page, errors } = await open('#/process');
await medibec(page);
const KEEP = fs.readFileSync(MOCK + '/screening_scores.txt', 'utf8');

// every candidate unscored, no family selected; the AI scores all of them, flags on three in four (as a real answer does)
const ids = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const AI = await import('/js/ai.js'); const ws = st.S.ws;
  const a = AI.settings(ws); a.acknowledged = new Date().toISOString(); a.confidential = false;
  const ids = SC.candidates(ws).map(c => c.id);
  for (const id of ids) { const r = SC.rec(id, ws); r.scores = Array(12).fill(null); r.flags = []; r.rat = ''; r.disp = ''; r.exclReview = ''; delete r.ai; delete r.aiProposal; }
  for (const f of SC.state(ws).families) { f.selected = false; f.judgment = ''; }
  SC.state(ws).watch = [];
  st.touch(); return ids;
});
const N = ids.length;
fs.writeFileSync(MOCK + '/screening_scores.txt', JSON.stringify({ scores: ids.map((id, i) => ({ id, scores: Array.from({ length: 12 }, (_, k) => 1 + ((i + k) % 5)), flags: i % 4 ? ['PV'] : [], rationale: 'Mock answer: scored from the chain alone (E4, E6).', confidence: 'Medium' })) }));
ok(N >= 40, 'at least 40 candidates to score (' + N + ')');

const review = async () => {   // candidates → Estimate all unscored → preview → send → review panel
  await goto(page, '#/screening/candidates', 900);
  await page.click('#scr-ai'); await page.waitForSelector('.modal textarea', { timeout: 15000 });
  await page.click('.modal .btnrow .btn:not(.ghost)');
  await page.waitForSelector('#sai-apply', { timeout: 20000 });
};
const dismiss = async () => { await page.click('.modal .btn.ghost:has-text("Dismiss"), .modal .btn.ghost:has-text("Rejeter"), .modal .btn.ghost >> nth=-1'); await page.waitForTimeout(300); };

/* ---------------- T3: nothing of the review panel extends beyond the window ---------------- */
for (const lang of ['en', 'fr']) {
  await page.evaluate(async l => { const i = await import('/js/i18n.js'); await i.setLang(l); }, lang);
  for (const w of [1280, 1600]) {
    await page.setViewportSize({ width: w, height: 900 });
    await review();
    const m = await page.evaluate(() => {
      const vw = innerWidth, out = [];
      for (const e of document.querySelectorAll('.modal-back, .modal-back *')) { const r = e.getBoundingClientRect(); if (r.width && r.right > vw + 1) out.push(e.tagName + '.' + e.className + ' ' + Math.round(r.right)); }
      const back = document.querySelector('.modal-back');
      return { out: out.slice(0, 4), n: out.length, docW: document.documentElement.scrollWidth, backW: back.scrollWidth, backC: back.clientWidth, cards: document.querySelectorAll('.modal .sai-card').length, selects: document.querySelectorAll('.modal .sai-score').length };
    });
    ok(m.n === 0 && m.docW <= w && m.backW <= m.backC + 1, `T3 ${lang} ${w}px: no element of the review panel extends beyond the window ${JSON.stringify(m.out)}`);
    ok(m.cards === N && m.selects === 12 * N, `T3 ${lang} ${w}px: one card per candidate (${m.cards}) with its twelve editable criteria`);
    await dismiss();
  }
}
await page.evaluate(async () => { const i = await import('/js/i18n.js'); await i.setLang('en'); });
await page.setViewportSize({ width: 1280, height: 900 });

/* ---------------- T4 + T5: accept all → the screen updates at once; Scored N / N ---------------- */
await review();
const before = await page.evaluate(() => document.querySelector('#panel-screening').innerText.match(/Scored\s*\n?\s*(\d+ \/ \d+)/)?.[1]);
ok(before === `0 / ${N}`, 'before accepting: Scored 0 / ' + N + ' (' + before + ')');
await page.fill('#sai-by', 'Reviewer T80'); await page.click('#sai-apply'); await page.waitForTimeout(1000);
const t4 = await page.evaluate(() => {
  const sec = document.querySelector('#panel-screening'), row = sec.querySelector('tbody tr');
  return { modal: !!document.querySelector('.modal'), tile: sec.innerText.match(/Scored\s*\n?\s*(\d+ \/ \d+)/)?.[1], rowText: row.innerText, total: [...row.querySelectorAll('td')].map(td => td.innerText.trim()).find(t => /^\d+$/.test(t) && +t > 12) };
});
ok(!t4.modal && !!t4.total, 'T4: after Accept the table shows the accepted scores without a reload (row total ' + t4.total + ')');
ok(t4.tile === `${N} / ${N}`, 'T5: the Scored tile reads ' + N + ' / ' + N + ' once all are accepted (' + t4.tile + ')');
const t5 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const P = await import('/js/process.js');
  const ws = st.S.ws, step = (P.STEPS || P.steps || []).find?.(s => s.id === 'screen' || s.n === 6);
  const parts = step?.parts?.(ws) || [];
  return { sc: SC.scoredCount(ws), dp: SC.dispositionCount(ws), n: SC.candidates(ws).length, parts: parts.map(p => [p.what, p.ok]), found: !!step };
});
ok(t5.sc === N && t5.dp === 0, 'T5: scoredCount reads the accepted AI scores (' + t5.sc + '), the dispositions are counted apart (' + t5.dp + ')');
if (t5.found) ok(t5.parts[0]?.[1] === true && t5.parts[1]?.[1] === false && /disposition/.test(t5.parts[1][0]), 'T5: Process step 6 — “every candidate has its twelve scores” passes, “has a disposition” stays the analyst’s: ' + JSON.stringify(t5.parts));
else ok(false, 'step 6 of the Process found');

/* ---------------- T6: what “Need attention” counts ---------------- */
const t6 = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const ws = st.S.ws, A = SC.analysis(ws), sec = document.querySelector('#panel-screening');
  return { fu: A.flaggedUnreviewed.length, jm: A.judgmentMissing.length, card: sec.innerText.includes('What “Need attention” counts'), btns: sec.querySelectorAll('.sai-attn button').length, tile: sec.innerText.match(/Need attention\s*\n?\s*(\d+)/)?.[1], sub: sec.innerText.match(/\d+ judgment\(s\) without rationale · \d+ flagged exclusion\(s\) not reviewed/)?.[0] };
});
ok(t6.fu > 20 && t6.jm === 0, 'T6: the AI flags (three in four) make flagged exclusions: ' + t6.fu + ', judgments without rationale: ' + t6.jm);
ok(t6.card && t6.btns === t6.fu + t6.jm && +t6.tile === t6.fu + t6.jm && !!t6.sub, 'T6: the tile splits its two counts in words and the card lists every item with a button ' + JSON.stringify(t6));
ok(/escalation flag/.test(await page.innerText('.sai-attn >> nth=0').catch(() => '')) || /escalation flag/.test(await page.innerText('#panel-screening')), 'T6: the card says what a flagged exclusion is and what to write');
await page.click('.sai-attn button >> nth=0'); await page.waitForTimeout(500);
ok(await page.isVisible('#scr-editor') && /Who reviewed the exclusion|exclusion/i.test(await page.innerText('#scr-editor')), 'T6: the button opens the flagged candidate’s score card, where the review is written');
// an accepted AI rationale is a rationale; a family selected by judgment needs its own
const t6b = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const SC = await import('/js/screening.js'); const ws = st.S.ws, S0 = SC.state(ws);
  const inFam = new Set(S0.families.flatMap(f => f.members || []));
  const c = SC.candidates(ws).find(x => !inFam.has(x.id)), r = SC.rec(c.id, ws);
  r.disp = 'Select'; r.scores = Array(12).fill(1); r.flags = [];
  const rat = r.rat, ai = r.ai;
  const has = () => SC.analysis(ws).judgmentMissing.some(u => u.id === c.id);
  const byJ = SC.analysis(ws).units.find(u => u.id === c.id)?.byJudgment;
  const withAi = has(); r.rat = ''; delete r.ai; const without = has(); r.rat = rat; r.ai = ai;
  const f = S0.families[0]; f.selected = true; f.judgment = ''; const famMissing = SC.analysis(ws).judgmentMissing.some(u => u.id === f.id); f.selected = false;
  st.touch(); return { byJ, withAi, without, famMissing, rat: rat.slice(0, 3), mark: /Analytical estimate/.test(rat) };
});
ok(t6b.byJ && t6b.withAi === false && t6b.without === true, 'T6: a candidate selected by judgment is cleared by its accepted AI rationale (' + t6b.rat + '…) and not without one');
ok(t6b.mark && t6b.famMissing, 'T6: the rationale carries the marker “Analytical estimate”; a family selected by judgment still needs its own written judgment');
errors.length && console.log(errors.slice(0, 3));
ok(errors.length === 0, 'no console errors ' + errors.slice(0, 2).join(' | '));
fs.writeFileSync(MOCK + '/screening_scores.txt', fs.readFileSync(MOCK_SRC + '/screening_scores.txt', 'utf8') || KEEP);
await browser.close(); done('t80 screening AI review (T3–T6)');
