/* Process — the workflow of a complete risk assessment in the book's nineteen steps (seven groups), then the
   management report and the quality review; the status of each step
   in this workspace, buttons that open the screens where it is done, guidelines to keep the process
   simple, and — in multi-user mode — who is Responsible and Accountable for each step.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as IPC from '../ipc.js';
import { VERSION, SERIES } from '../version.js';
import { el, card, pill, banner, go, kpi, n0 } from '../util.js';
import { S, compute } from '../state.js';
import * as SCENP from './scenario.js';
import { STEPS, GROUPS, statuses, nextStep, partsOf } from '../process.js';
import * as CH from '../chapterhelp.js';
import { tr } from '../i18n.js';
import * as users from '../users.js';
import * as MT from '../maturity.js';
import { GUIDELINES } from '../guidelines.js';
import * as AVL from '../avl.js';
import { toast } from '../util.js';
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
const stepLabel = s => s.n === 'R' ? tr(s.title) : `${s.n}. ${tr(s.title)}`;

export function render(sec) {
  const ws = S.ws, list = statuses(ws), nx = nextStep(ws);
  const done = list.filter(x => x.st === 'done').length, part = list.filter(x => x.st === 'partial').length;
  const numbered = list.filter(x => x.s.n !== 'R'), doneN = numbered.filter(x => x.st === 'done').length;
  const ring = arc(doneN, numbered.length, 62, 14, 'ring');
  ring.setAttribute('aria-hidden', 'false'); ring.setAttribute('role', 'img');
  ring.setAttribute('aria-label', tr('{0} of {1} steps done').replace('{0}', doneN).replace('{1}', numbered.length));
  ring.append(svgEl('text', { x: 76, y: 74, 'text-anchor': 'middle', class: 'big' }), svgEl('text', { x: 76, y: 96, 'text-anchor': 'middle', class: 'lab' }));
  ring.querySelector('.big').textContent = String(doneN);
  ring.querySelector('.lab').textContent = tr('of {0} done').replace('{0}', numbered.length);
  sec.replaceChildren(el('div', 'atlas-head',
      el('div', null, el('h1', null, 'Process'),
        el('p', 'lede', 'The workflow of a complete cybersecurity risk assessment: nineteen numbered steps in seven groups, then the management report and the quality review. Each step says what it is for, what it needs and when it is done, shows its status in this workspace, and opens the screens where it is completed.')),
      ring),
    banner('warn', `Beta ${SERIES}`, 'Use for teaching, exploration and method validation. Validate every result before it supports a real decision.'));
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

  // the next step: a dark band with the screens that complete it
  if (nx) sec.append(el('section', { class: 'next-step', 'aria-labelledby': 'next-step-title' },
    el('div', null,
      el('div', 'eyebrow', nx.s.n === 'R' ? tr('Next step · the report') : tr('Next step · {0} of {1}').replace('{0}', nx.s.n).replace('{1}', numbered.length)),
      el('h2', { id: 'next-step-title' }, nx.s.title),
      el('p', null, nx.s.purpose),
      el('p', 'small', el('b', null, 'Done when: '), nx.s.done)),
    el('div', 'btnrow', ...nx.s.screens.slice(0, 2).map(([r, l], i) => el('button', { class: 'btn' + (i ? ' ghost' : ' primary'), 'data-ro-ok': '', onclick: () => openScreen(r, nx.s.id) }, 'Open ' + l)))));
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
  sec.append(el('h2', null, 'Seven groups'), tiles, rowsBox,
    el('div', 'grid g4', { style: { marginTop: '18px' } },
      kpi('Steps done', `${done} / ${STEPS.length}`, part ? `${part} in progress` : '', done === STEPS.length ? 'good' : ''),
      kpi('Workspace', ws.name, ws.org?.name || ''),
      kpi('Scenarios', n0(ws.assessment.SCEN.length), 'in the register'),
      kpi('Next recommended step', nx ? stepLabel(nx.s) : 'All steps done', nx ? ST[nx.st][0] : '', nx ? 'warn' : 'good')));

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
        el('div', 'btnrow', { style: { marginTop: '8px' } }, ...[...s.screens, ...(IPC.on() ? IPC.STEP_LINKS[s.id] || [] : [])].map(([r, l]) => el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => openScreen(r, s.id) }, 'Open ' + l))),
        (() => { const tips = [...(s.tips || []), ...(IPC.on() ? IPC.STEP_TIPS[s.id] || [] : [])];   // the optional module adds tips and links only
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
