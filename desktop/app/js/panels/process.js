/* Process — the workflow of a complete risk assessment in the book's nineteen steps (seven groups), then the
   management report and the quality review; the status of each step
   in this workspace, buttons that open the screens where it is done, guidelines to keep the process
   simple, and — in multi-user mode — who is Responsible and Accountable for each step.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as IAM from '../iam.js';
import * as CM from '../cm.js';
import { VERSION, SERIES } from '../version.js';
import { el, card, pill, banner, go } from '../util.js';
import { S, compute, touch, confirmVector, vectorState } from '../state.js';
import * as SCENP from './scenario.js';
import { STEPS, GROUPS, statuses, nextStep, partsOf, CTX } from '../process.js';
import * as aiui from '../aiui.js';
import * as AI from '../ai.js';
import * as LOG from '../logs.js';
import * as CH from '../chapterhelp.js';
import { tr } from '../i18n.js';
import * as users from '../users.js';
import * as MT from '../maturity.js';
import { GUIDELINES } from '../guidelines.js';
import * as AVL from '../avl.js';
import { toast } from '../util.js';
import * as DETAIL from '../detail.js';
import * as SCRP from './screening.js';
import * as WIZ from '../setupwizard.js';
import { detailSwitch } from './settings_more.js';
export { GUIDELINES };

const ST = { done: ['Done', 'good'], partial: ['In progress', 'warn'], todo: ['To do', ''] };


/* 1.9.0 — Atlas. The page opens on where the work stands: a ring of steps done, the next step as a dark band with the
   screens that complete it, the seven groups as tiles with a progress arc each, and the steps of one group (the group
   in progress, or the tile chosen) as rows. The full workflow with every step's detail, the guidelines and the
   printable checklist follow, each behind its own disclosure. Statuses come from process.js; nothing is computed here. */
const GROUP_SHORT = { context: 'Evidence, context and scope', appetite: 'Appetite and materiality', scenarios: 'Scenarios', quant: 'Quantification',
  treatment: 'Treatment', money: 'Robustness, priorities and money', close: 'Monitoring and reporting' };
const GROUP_RANGE = { context: 'Steps 1 to 3', appetite: 'Step 4', scenarios: 'Steps 5 to 8', quant: 'Steps 9 to 11', treatment: 'Steps 12 to 14',
  money: 'Steps 15 to 18', close: 'Step 19 and the report' };
/** The Scenario editor tab a step needs: step 8 the causal chain, step 9 the quantification, step 10 CVSS. */
export const STEP_TAB = { scenarios: 'chain', quantify: 'quant', cvss: 'cvss' };
let openGroup = null;   // the tile chosen on this visit; null = the group of the next step
const NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs) { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; }
/** A progress arc: done of total, drawn with the stroke-dash of a circle (decorative: the text says the same). */
function arc(done, total, r, w, cls) {
  const c = 2 * Math.PI * r, size = 2 * (r + w);
  const s = svgEl('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}`, class: cls, 'aria-hidden': 'true', focusable: 'false' });
  s.append(svgEl('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', 'stroke-width': w, class: 'track' }));
  if (done > 0) s.append(svgEl('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', 'stroke-width': w, class: cls === 'ring' ? 'done' : 'fill', 'stroke-linecap': 'round',
    'stroke-dasharray': c.toFixed(1), 'stroke-dashoffset': (c * (1 - Math.min(1, done / total))).toFixed(1) }));   // CSS turns it to start at twelve o'clock
  return s;
}
/** Open a screen named by a step; the Scenario editor opens on the tab the step needs. */
function openScreen(route, stepId) {
  if (route === 'scenario' && STEP_TAB[stepId]) SCENP.requestTab(STEP_TAB[stepId]);
  go(route);
}

/* 1.9.1 — the next-step card. It lists the checks of the step (from process.js partsOf), each with its state and,
   when unmet, its hint; its primary button opens the screen of the first unmet check (with the route argument the
   check names, e.g. org/crown or screening/families), so the next action is always one click away. A step without
   named checks opens its first screen, as before. At the Detailed level the step's tips and the guidelines that use
   its screens are open beside it. In multi-user mode it shows who is Responsible and Accountable. */
const firstUnmet = ps => (ps ? ps.find(x => !x.ok && !x.optional && x.fix) || ps.find(x => !x.ok && x.fix) || null : null);
function nextBand(nx, total, sec) {
  const ws = S.ws, s = nx.s, ps = partsOf(s, ws), miss = firstUnmet(ps);
  const target = miss ? miss.fix : s.screens[0];
  const others = s.screens.filter(([r]) => r !== target[0]).slice(0, 1);
  const list = ps ? el('ul', { class: 'next-checks', 'aria-label': tr('What this step needs') }, ...ps.map(x =>
    el('li', { class: x.ok ? 'ok' : x === miss ? 'cur' : '' },
      el('span', { class: 'mark', 'aria-hidden': 'true' }, x.ok ? '✓' : x === miss ? '→' : '◻'),
      el('span', null, el('span', { class: 'sr-only' }, x.ok ? tr('Done:') + ' ' : tr('To do:') + ' '),
        x.ok ? el('span', null, x.what) : el('b', null, x.what), x.optional ? el('span', 'muted', ' ' + tr('(optional)')) : null,
        !x.ok && x.hint ? el('div', 'hint keep', x.hint) : null,
        // 1.9.2 (C4) — the three ways of step 5, in order, each with its button
        !x.ok && x.ways ? el('ol', { class: 'small next-ways', style: { margin: '6px 0 0', paddingLeft: '18px' } }, ...x.ways.map(([r, l, how]) =>
          el('li', { style: { margin: '2px 0' } }, el('span', null, how), ' ', el('button', { class: 'btn xs ghost', 'data-ro-ok': '', onclick: () => openScreen(r, s.id) }, l)))) : null,
        // 1.9.2 (NV-002, step 10) — a vector that came with a pattern or a candidate is confirmed here: one click, recorded
        !x.ok && x.confirm?.length ? el('div', { class: 'small next-confirm', style: { marginTop: '6px' } }, ...x.confirm.map(id => {
          const sc = ws.assessment.SCEN.find(z => z.id === id);
          const isScore = vectorState(sc) === 'score';   // 1.9.2 review (H2): a stored score with no vector is confirmed the same way
          return el('button', { class: 'btn xs ghost', 'data-ro-ok': '', title: isScore ? tr('Stored score {0} (no vector)').replace('{0}', String(sc?.cvss_score)) : (sc?.cvss || ''), 'data-confirm': id, onclick: () => { if (confirmVector(sc, users.name())) { touch('revision'); toast(tr(isScore ? 'Score of {0} confirmed' : 'Vector of {0} confirmed').replace('{0}', id)); render(sec); } } }, tr(isScore ? 'Confirm the score of {0}' : 'Confirm the vector of {0}').replace('{0}', id)); })) : null)))) : null;
  let who = null;
  if (users.active()) {
    const R = users.holders(s.id, 'R').map(u => u.name), A = users.holders(s.id, 'A').map(u => u.name);
    const mine = users.letter(s.id) === 'R';
    who = el('p', 'small', el('b', null, 'Responsible: '), R.join(', ') || '—', ' · ', el('b', null, 'Accountable: '), A.join(', ') || '—',
      !mine && R.length ? el('span', { class: 'next-owner', style: { display: 'block', marginTop: '4px' } }, tr('This step is for {0}; you can follow it here.').replace('{0}', R.join(', '))) : null);
  }
  let more = null;
  if (DETAIL.is('detailed')) {
    const tips = [...(s.tips || []), ...[IAM, CM].flatMap(X => X.on() ? X.STEP_TIPS[s.id] || [] : [])];
    const routes = new Set(s.screens.map(([r]) => r.split('/')[0]));
    const gl = GUIDELINES.filter(g => g.routes.some(([r]) => routes.has(r.split('/')[0]))).slice(0, 3);
    more = el('div', { class: 'next-more' },
      tips.length ? el('details', { open: true, class: 'next-tips' }, el('summary', null, 'Tips'), el('ul', 'small', ...tips.map(t => el('li', null, t)))) : null,
      gl.length ? el('details', { open: true, class: 'next-guidelines' }, el('summary', null, 'Guidelines for this step'),
        ...gl.map(g => el('div', { class: 'small', style: { marginTop: '6px' } }, el('b', null, g.h + '. '), g.t,
          el('div', null, el('b', null, 'Where: '), g.where)))) : null);
  }
  const extra = s.id === 'context' ? step2Extraction(ws) : null;   // 1.9.2 (NV-097)
  // 1.9.3 (W1) — steps 5 to 7: the progress strip of From candidates to scenarios, with its one next action
  const strip = ['generate', 'screen', 'select'].includes(s.id) ? SCRP.progressStrip(ws) : null;
  return el('section', { class: 'next-step', 'aria-labelledby': 'next-step-title' },
    el('div', null,
      el('div', 'eyebrow', s.n === 'R' ? tr('Next step · the report') : tr('Next step · {0} of {1}').replace('{0}', s.n).replace('{1}', total)),
      el('h2', { id: 'next-step-title' }, s.title),
      el('p', null, s.purpose),
      list || el('p', 'small', el('b', null, 'Done when: '), s.done),
      strip, extra, who, more),
    el('div', 'btnrow',
      extra ? el('button', { class: 'btn primary', id: 'next-step-extract', 'data-ro-ok': '', onclick: () => import('./org.js').then(O => O.openProfileExtraction()) }, 'Extract from documents…') : null,
      el('button', { class: extra ? 'btn ghost' : 'btn primary', id: 'next-step-go', 'data-ro-ok': '', onclick: () => openScreen(target[0], s.id) },
        miss ? tr('Next: {0}').replace('{0}', tr(miss.what)) : 'Open ' + target[1]),
      miss ? el('span', { class: 'small next-where' }, tr('opens {0}').replace('{0}', tr(target[1]))) : null,
      ...others.map(([r, l]) => el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => openScreen(r, s.id) }, 'Open ' + l))));
}

/* 1.9.2 (NV-097) — step 2 when context fields are missing and documents exist: the extraction is the way to fill them, so the
   card says what it needs (documents, a tested AI provider or Rules only), offers it as the primary action, and links to
   Crown jewels and Import from documents. The guide text itself is item 11 (FIRST-TIME-SETUP §7.2). Returns null when
   the step has no documents to extract from or the context is already filled. */
function step2Extraction(ws) {
  const n = CTX.filter(k => { const v = ws.org[k]; return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && String(v).trim() !== ''; }).length;
  const docs = (ws.docs || []).length;
  if (n >= 8 || !docs) return null;
  const pre = el('div', { class: 'small', id: 'step2-prereq' }, tr('Prerequisites: {0} context document(s) ·').replace('{0}', docs), ' ', tr('checking the AI provider…'));
  aiui.status(ws, 'extract_profile').then(x => {
    const ai = x.ok ? tr('AI provider ready ({0})').replace('{0}', AI.isLocal(x.provider) ? tr('local model') : AI.provider(x.provider).label) : tr('no AI provider tested — Rules only (offline) is available');
    pre.replaceChildren(tr('Prerequisites: {0} context document(s) ·').replace('{0}', docs), ' ', ai, '. ', tr('Each extraction first asks: AI (with a preview of what is sent) or Rules only. Every proposed value is reviewed before it is saved.'));
  }).catch(() => { pre.replaceChildren(tr('Prerequisites: {0} context document(s) ·').replace('{0}', docs), ' ', tr('no AI provider tested — Rules only (offline) is available')); });
  return el('div', { class: 'next-extract', style: { marginTop: '8px' } },
    el('div', 'small', el('b', null, tr('{0} of 12 context fields filled.').replace('{0}', n)), ' ', tr('“Extract from documents…” proposes every field of Profile & appetite from the context documents; the same button sits on Profile & appetite. Then: Crown jewels → Extract from documents, and Import from documents for the other targets.')),
    pre,
    el('div', 'btnrow', { style: { marginTop: '6px' } },
      el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => go('org/crown') }, 'Crown jewels'),
      el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => go('org/import') }, 'Import from documents'),
      el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => go('org/docs') }, 'Context documents')));
}

/* 1.9.2 (NV-001, decision D2) — the one-time review of scenarios still on the untouched default reductions 0.5 / 0.5: listed by
   the data migration, never changed automatically. The analyst reviews them (Risk mitigation applies the measures' reductions,
   or the editor records an explicit value) and closes the item with a name. */
function reductionReviewBanner(ws, sec) {
  const rv = ws.reductionReview;
  if (!rv || rv.reviewed || !(rv.scenarios || []).length) return null;
  const still = rv.scenarios.filter(id => { const s = ws.assessment.SCEN.find(x => x.id === id); return s && Number(s.red_p) === 0.5 && Number(s.red_i) === 0.5 && !s.red_source; });
  const by = el('input', { placeholder: 'Reviewed by (name)', style: { maxWidth: '220px' }, id: 'redrev-by' });
  return el('div', { id: 'reduction-review' }, banner('warn', 'Review item — reductions still at the earlier default (0.5 / 0.5)',
    el('div', null,
      el('div', null, tr('{0} scenario(s) still carry the probability and impact reductions of 0.5 that every new scenario used to receive: {1}. A new scenario now starts at 0 (the book’s pre-treatment value) and every reduction comes from its measures or from you. Nothing was changed: review each one — Risk mitigation → “Apply to all covered scenarios” writes the measures’ reductions; the Scenario editor records an explicit value — then close this item.').replace('{0}', still.length).replace('{1}', still.join(', ') || tr('none left'))),
      el('div', 'row', { style: { marginTop: '8px', alignItems: 'center', gap: '8px' } }, by,
        el('button', { class: 'btn sm', id: 'redrev-done', onclick: () => { if (!by.value.trim()) { toast(tr('Name the reviewer first.'), 'bad'); return; } rv.reviewed = new Date().toISOString().slice(0, 10); rv.by = by.value.trim(); rv.remaining = still.slice();
          LOG.data('default reductions reviewed (D2)', still.join(', ') || 'none left', rv.by, ws.name); (ws.revisionLog ||= []).push({ date: rv.reviewed, scenario: still.join(', ') || '—', parameter: 'red_p / red_i', from: '0.5 / 0.5', to: '0.5 / 0.5', what: `D2 review of the default reductions closed by ${rv.by}: ${still.length} scenario(s) deliberately left at 0.5 / 0.5`, by: rv.by }); touch(); toast(tr('Review item closed')); render(sec); } }, 'Mark as reviewed'),
        el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => go('mitigation') }, 'Open Risk mitigation')))));
}

export function render(sec) {
  const ws = S.ws, list = statuses(ws), nx = nextStep(ws);
  const numbered = list.filter(x => x.s.n !== 'R'), doneN = numbered.filter(x => x.st === 'done').length;
  const ring = arc(doneN, numbered.length, 62, 14, 'ring');
  ring.setAttribute('aria-hidden', 'false'); ring.setAttribute('role', 'img');
  ring.setAttribute('aria-label', tr('{0} of {1} steps done').replace('{0}', doneN).replace('{1}', numbered.length));
  ring.append(svgEl('text', { x: 76, y: 74, 'text-anchor': 'middle', class: 'big' }), svgEl('text', { x: 76, y: 96, 'text-anchor': 'middle', class: 'lab' }));
  ring.querySelector('.big').textContent = String(doneN);
  ring.querySelector('.lab').textContent = tr('of {0} done').replace('{0}', numbered.length);
  sec.replaceChildren(el('div', 'atlas-head',
      el('div', null, el('h1', null, 'Process'),
        el('p', 'lede', 'The workflow of a complete cybersecurity risk assessment: nineteen numbered steps in seven groups, then the management report and the quality review. Each step says what it is for, what it needs and when it is done, shows its status in this workspace, and opens the screens where it is completed.'),
        el('div', { class: 'small', id: 'process-detail', style: { marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
          el('span', 'muted', 'Level of detail:'), detailSwitch())),
      ring),
    banner('warn', `Beta ${SERIES}`, 'Use for teaching, exploration and method validation. Validate every result before it supports a real decision.'));
  // 1.9.1 — first start: an invitation to the set-up questions (modules and level of detail); never a blocking dialog
  { const inv = WIZ.invitation(() => render(sec)); if (inv) sec.append(inv); }
  // 1.8.2 — a teaching case still on the earlier MediBec vectors is offered the current ones, once; the choice is
  // journalled either way (avl.js). Real organizations never see this: a migration never changes their numbers.
  if (AVL.pending(ws)) {
    const found = AVL.detect(ws).map(x => x.id);
    const ids = found.length > 1 ? tr('{0} and {1}').replace('{0}', found.slice(0, -1).join(', ')).replace('{1}', found.at(-1)) : found.join('');
    sec.append(banner('warn', 'This teaching case still scores S2 and S8 with AV:N',
      el('div', null,
        el('div', null, tr('The current MediBec case and the book score the malicious e-mailed document AV:L (it is opened locally): S2 = 9.3, S8 = 9.2, and the reference totals become 84,305 / 41,023. Taking the vectors changes nothing else in your work; the engine recomputes every index. Either choice is written to the workspace journal.')),
        el('div', 'btnrow', { style: { marginTop: '8px' } },
          el('button', { class: 'btn sm', onclick: () => { const done = AVL.accept(ws); toast(tr('Vectors updated: {0}').replace('{0}', done.join(', '))); render(sec); } }, 'Take the AV:L vectors'),
          el('button', { class: 'btn sm ghost', onclick: () => { AVL.decline(ws); toast(tr('Kept the earlier vectors for {0}').replace('{0}', ids), 'warn'); render(sec); } }, 'Keep AV:N')))));
  } else if (AVL.reconsider(ws)) {
    // 1.9.0 — after "Keep AV:N" the choice can be reconsidered here, without Reset data → Start over (journalled again)
    const e = AVL.lastEntry(ws);
    sec.append(el('p', { class: 'small muted', id: 'avl-reconsider' },
      tr('S2 and S8 keep AV:N: the AV:L vectors were declined on {0}.').replace('{0}', e?.date || '—'), ' ',
      el('button', { class: 'btn sm ghost', onclick: () => { const done = AVL.accept(ws); toast(tr('Vectors updated: {0}').replace('{0}', done.join(', '))); render(sec); } }, 'Reconsider: take the AV:L vectors')));
  }

  { const rr = reductionReviewBanner(ws, sec); if (rr) sec.append(rr); }   // 1.9.2 (D2)
  // the next step: a dark band with what is still missing and one button to the first thing to do (1.9.1)
  if (nx) sec.append(nextBand(nx, numbered.length, sec));
  else sec.append(el('section', { class: 'next-step' }, el('div', null, el('div', 'eyebrow', 'All steps done'),
    el('h2', null, 'Every step of this assessment is done'), el('p', null, 'Review the management summary and the quality review before the results support a decision.')),
    el('div', 'btnrow', el('button', { class: 'btn primary', 'data-ro-ok': '', onclick: () => go('summary') }, 'Open Management summary'))));

  // the seven groups: a tile each, with its progress arc; the open group's steps follow as rows
  const cur = openGroup && GROUPS.some(g => g[0] === openGroup) ? openGroup : (nx?.s.g || GROUPS[0][0]);
  const rowsBox = el('div', { id: 'process-group', role: 'region', 'aria-live': 'polite' });
  const tiles = el('div', 'ptiles');
  const drawRows = g => {
    const steps = list.filter(x => x.s.g === g);
    rowsBox.setAttribute('aria-label', tr(GROUP_SHORT[g]));
    rowsBox.replaceChildren(el('h2', null, g === nx?.s.g ? tr('{0} — the group in progress').replace('{0}', tr(GROUP_SHORT[g])) : tr(GROUP_SHORT[g])),
      el('ol', 'prows', ...steps.map(({ s, st }) => el('li', { class: 'prow' + (nx && s.id === nx.s.id ? ' cur' : ''), 'data-step': s.id },
        el('span', 'n', String(s.n)),
        el('span', null, el('b', null, s.title), el('br'), el('span', 'w', s.purpose)),
        pill(ST[st][0], nx && s.id === nx.s.id && st !== 'done' ? 'now' : ST[st][1] || 'todo'),
        el('span', 'btnrow', ...s.screens.slice(0, 1).map(([r, l]) => el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => openScreen(r, s.id) }, 'Open ' + l)))))));
  };
  for (const [g] of GROUPS) {
    const steps = list.filter(x => x.s.g === g), n = steps.length, d = steps.filter(x => x.st === 'done').length;
    const isNext = nx?.s.g === g;
    const status = d === n ? pill(tr('{0} of {1} done').replace('{0}', d).replace('{1}', n), 'good')
      : isNext ? pill(nx.s.n === 'R' ? tr('Report in progress') : tr('Step {0} in progress').replace('{0}', nx.s.n), 'now')
      : steps.some(x => x.st !== 'todo') ? pill(tr('{0} of {1} done').replace('{0}', d).replace('{1}', n), 'warn') : pill('To do', 'todo');
    const t = el('button', { type: 'button', class: 'ptile' + (isNext ? ' next' : ''), 'data-group': g, 'aria-expanded': String(g === cur), 'aria-controls': 'process-group', 'data-ro-ok': '' },
      arc(d, n, 23, 7, 'arc'),
      el('span', null, el('span', 'tt', GROUP_SHORT[g]), el('span', { class: 'd', style: { display: 'block' } }, GROUP_RANGE[g]), status));
    t.addEventListener('click', () => { openGroup = g; for (const x of tiles.querySelectorAll('.ptile[data-group]')) x.setAttribute('aria-expanded', String(x === t)); drawRows(g); });
    tiles.append(t);
  }
  // scenarios above tolerance: the engine's own classification of the included scenarios
  let res = null; try { res = compute(ws); } catch { /* the register shows the error */ }
  const above = res ? res.inc.filter(r => r.cls.startsWith('Above')) : [];
  if (above.length) tiles.append(el('div', 'ptile-alert',
    el('span', { style: { flex: 1 } }, el('h3', null, tr('{0} scenarios above tolerance').replace('{0}', above.length)),
      el('span', { class: 'd', style: { display: 'block' }, 'data-noi18n': '' }, above.map(r => r.id).join(', ')),
      el('span', { class: 'd', style: { display: 'block' } }, 'Treat these first: they decide the portfolio.')),
    el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => go('calc') }, 'Open Risk calculator')));
  drawRows(cur);
  // (the ring above says how many steps are done and the band which one is next: no figures repeated below the groups)
  sec.append(el('h2', null, 'Seven groups'), tiles, rowsBox);

  // the flow
  const flow = el('ol', { class: 'process-flow' });
  let lastG = null;
  for (const { s, st } of list) {
    if (s.g !== lastG) { lastG = s.g; const g = GROUPS.find(x => x[0] === s.g); if (g) flow.append(el('li', { class: 'pgroup' }, g[1])); }
    const R = users.active() ? users.holders(s.id, 'R').map(u => u.name) : [];
    const A = users.active() ? users.holders(s.id, 'A').map(u => u.name) : [];
    flow.append(el('li', { class: 'pstep ' + st, id: 'step-' + s.id },
      el('div', 'pnum', String(s.n)),
      el('div', 'pbody',
        el('div', 'row', { style: { alignItems: 'center', gap: '8px' } }, el('h3', { style: { margin: 0, flex: 1 } }, s.title), pill(ST[st][0], ST[st][1]),
          users.active() ? pill('Your role: ' + (users.letter(s.id) || '—'), users.can('edit', s.id) ? 'good' : '') : null),
        el('p', { style: { margin: '4px 0' } }, s.purpose),
        el('div', 'small muted', el('b', null, 'Needs: '), s.inputs),
        el('div', 'small muted', el('b', null, 'Done when: '), s.done),
        CH.forStep(s.id, { tag: 'div', cls: 'readmore-step' }),   // 1.9.0 — the chapter and section of the book
        // 1.5.5 — where a step has named parts, show each one's state and the screen that fixes it.
        // One opaque "To do" for a step with two requirements tells the analyst nothing about which
        // half is missing, and step 4 was the case that mattered: one of its halves needed network.
        (() => { const ps = partsOf(s, S.ws); if (!ps) return null;
          return el('ul', 'small', { style: { margin: '6px 0 0', paddingLeft: '18px' } }, ...ps.map(x =>
            el('li', { style: { margin: '2px 0' } },
              el('span', null, x.ok ? '✓ ' : '◻ '), x.ok || x.optional ? el('span', null, x.what) : el('b', null, x.what), x.optional ? el('span', 'muted', ' ' + tr('(optional)')) : null,
              x.hint && !x.ok ? el('div', 'muted', x.hint) : null,
              !x.ok && x.fix ? el('button', { class: 'btn xs ghost', 'data-ro-ok': '', style: { marginTop: '2px' },
                onclick: () => go(x.fix[0]) }, 'Open ' + x.fix[1]) : null))); })(),
        // 1.5.5 — step 5 says how many scenarios this organization should carry, from the maturity it
        // measured rather than from a generic ten.
        s.id === 'select' ? (() => { const g = MT.scenarioGuidance(S.ws);
          return el('div', 'small muted', el('b', null, 'How many: '),
            g.measured ? `about ${g.n} for this organization — measured maturity ${g.level} of 5 (${g.assessed}). ${g.why}`
              : `about ${g.n} to begin with. ${g.why} Assess the maturity and this number follows the level you measure.`,
            ' ', el('button', { class: 'btn xs ghost', 'data-ro-ok': '', onclick: () => go('maturity') }, 'Maturity & resilience')); })() : null,
        users.active() ? el('div', 'small muted', el('b', null, 'Responsible: '), R.join(', ') || '—', ' · ', el('b', null, 'Accountable: '), A.join(', ') || '—') : null,
        el('div', 'btnrow', { style: { marginTop: '8px' } }, ...[...s.screens, ...[IAM, CM].flatMap(X => X.on() ? X.STEP_LINKS[s.id] || [] : [])].map(([r, l]) => el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => openScreen(r, s.id) }, 'Open ' + l))),
        (() => { const tips = [...(s.tips || []), ...[IAM, CM].flatMap(X => X.on() ? X.STEP_TIPS[s.id] || [] : [])];   // the optional modules add tips and links only
          return tips.length ? el('details', null, el('summary', { class: 'small' }, 'Tips'), el('ul', 'small', ...tips.map(t => el('li', null, t)))) : null; })())));
  }
  sec.append(el('details', { class: 'card allsteps', id: 'process-all', style: { marginTop: '22px' } }, el('summary', null, 'All nineteen steps'), flow));

  sec.append(el('details', { class: 'card guidecard', id: 'process-guidelines' }, el('summary', null, 'Guidelines — a complete assessment, simply'),
    el('p', 'note', 'Open a guideline to see where it happens, the steps with the labels of the screens, and when it is done.'),
    el('ol', { class: 'guidelines' }, ...GUIDELINES.map((g, i) => el('li', { style: { marginBottom: '6px' }, id: 'guideline-' + (i + 1) },
      el('details', null, el('summary', null, el('b', null, g.h + '. '), g.t),
        el('div', { class: 'small', style: { margin: '6px 0 0 4px' } },
          el('div', null, el('b', null, 'Where: '), g.where),
          el('ol', { style: { margin: '6px 0' } }, ...g.steps.map(x => el('li', null, x))),
          el('div', null, el('b', null, 'Done when: '), g.done),
          el('div', 'btnrow', { style: { marginTop: '6px' } }, ...g.routes.map(([r, l]) => el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => go(r) }, 'Open ' + l)))))))),
    el('div', 'btnrow', el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => { document.getElementById('process-guidelines').open = true; document.querySelectorAll('.guidelines details').forEach(d => { d.open = true; }); } }, 'Expand all'))));
  sec.append(el('div', 'btnrow', { style: { marginTop: '6px' } },
    el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => { const d = document.getElementById('process-all'); d.open = true; d.scrollIntoView({ block: 'start' }); } }, 'All nineteen steps'),
    el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => { const d = document.getElementById('process-guidelines'); d.open = true; d.scrollIntoView({ block: 'start' }); } }, 'Guidelines in detail'),
    el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => printChecklist(list) }, 'Print the checklist')));
}

function printChecklist(list) {
  const w = window.open('', '_blank');
  if (!w) return;
  const ws = S.ws;
  const esc = s => String(tr(s) ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  w.document.write(`<!doctype html><html lang="${document.documentElement.lang}"><meta charset="utf-8"><title>${esc('Checklist')} — ${String(ws.name).replace(/[&<>]/g, '')}</title><style>body{font:13px/1.45 system-ui,sans-serif;margin:28px;max-width:800px}h1{font-size:18px}li{margin:10px 0}.s{font-size:11px;color:#555}.w{font-size:11.5px;color:#1f4e79}.st li{margin:2px 0;font-size:12px}h2{font-size:15px;margin-top:22px}</style>
  <h1>${esc('Risk assessment checklist')} — ${String(ws.name).replace(/[&<>]/g, '')}</h1><p class="s">CyberRiskGuardian Desktop · ${esc(`Beta ${SERIES}`)} · ${new Date().toISOString().slice(0, 10)}</p><ol>` +
    list.map(({ s, st }) => `<li><b>☐ ${esc(s.title)}</b> <span class="s">(${esc(ST[st][0])})</span><br>${esc(s.purpose)}<br><span class="w">${esc('Where:')} ${s.screens.map(([, l]) => esc(l)).join(' · ')}</span><br><span class="s">${esc('Done when:')} ${esc(s.done)}</span>${CH.sectionForStep(s.id) ? `<br><i class="s">${esc(CH.text(CH.sectionForStep(s.id)))}</i>` : ''}</li>`).join('') + '</ol>' +
    `<h2>${esc('Guidelines — a complete assessment, simply')}</h2><ol>` + GUIDELINES.map(g => `<li><b>☐ ${esc(g.h)}.</b> ${esc(g.t)}<br><span class="w">${esc('Where:')} ${esc(g.where)}</span><ol class="st">${g.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol><span class="s">${esc('Done when:')} ${esc(g.done)}</span></li>`).join('') + '</ol>');
  w.document.close(); w.focus(); w.print();
}
