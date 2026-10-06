/* chat.js — the help chatbot (1.5.2). A panel available on every screen.

   Help-only by default: answers come from the built-in help (screen tips, the 12 process steps,
   frequent questions) and the user guide, searched on this computer — no AI, nothing sent.
   With “Let the chatbot use AI” on (Settings) AND AI on for the workspace, an “Ask AI” button sends
   the question, the screen, the matching help passages and a short workspace summary — shown first
   in the usual preview — and the answer is labelled as AI. The chatbot never changes data.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { VERSION } from './version.js';
import { el, go, toast } from './util.js';
import { S, compute } from './state.js';
import * as prefs from './prefs.js';
import * as AI from './ai.js';
import * as aiui from './aiui.js';
import { entries, SCREENS } from './help.js';
import { statuses } from './process.js';
import { tr } from './i18n.js';

const STOP = new Set('the a an of to in on for and or is are how what why do does i my can with this that be it at by from as when which who where should use me you your not est le la les un une des de du et ou en pour que qui quoi comment pourquoi dans sur avec ce cette mon ma mes je il elle on se sa son ses au aux a'.split(' '));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const stem = w => w.length > 4 ? w.replace(/(ations?|ements?|ing|ies|es|s|ed)$/, '') : w;
const toks = s => norm(s).split(/[^a-z0-9()ψ.\-]+/).filter(w => w.length > 1 && !STOP.has(w)).map(stem);

let corpus = null, guideLoaded = false, panel = null, log = [], screen = 'process';

async function loadGuide() {
  if (guideLoaded) return; guideLoaded = true;
  try {
    const md = await (await fetch('USER-GUIDE.md', { cache: 'no-store' })).text();
    const parts = md.split(/\n(?=#{2,3} )/);
    for (const p of parts) {
      const m = /^#{2,3} (.+)\n([\s\S]*)$/.exec(p.trim()); if (!m) continue;
      const text = m[2].replace(/[`*|#>]/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length > 60) corpus.push({ id: 'guide:' + m[1], kind: 'guide', title: 'User guide — ' + m[1].replace(/^[\d.]+\s*/, ''), text: text.slice(0, 1200), route: null, guide: true });
    }
    index();
  } catch { /* offline file:// or missing guide */ }
}
function index() {
  for (const e of corpus) {
    e._t = toks(e.title + ' ' + tr(e.title)); e._x = toks(e.text + ' ' + tr(e.text));
  }
  const df = {}; for (const e of corpus) for (const w of new Set([...e._t, ...e._x])) df[w] = (df[w] || 0) + 1;
  corpus._idf = w => Math.log(1 + corpus.length / (1 + (df[w] || 0)));
}
export function search(q, n = 3) {
  if (!corpus) { corpus = entries(); index(); }
  const qt = [...new Set(toks(q))];
  if (!qt.length) return [];
  const sc = corpus.map(e => {
    let s = 0;
    for (const w of qt) { const idf = corpus._idf(w); if (e._t.includes(w)) s += 3 * idf; const c = e._x.filter(x => x === w).length; if (c) s += idf * (1 + Math.log(c)); }
    if (e.kind === 'guide') s *= 0.7;
    if (e.kind === 'guideline') s *= 0.8;   // 1.5.4 — long texts: a direct FAQ or screen tip answers first
    if (e.route && e.route.split('/')[0] === screen) s *= 1.15;
    return [s, e];
  }).filter(x => x[0] > 0.8).sort((a, b) => b[0] - a[0]);
  return sc.slice(0, n).map(x => x[1]);
}

/* ---------------- AI task ---------------- */
AI.TASKS.chat = {
  label: 'Help chatbot',
  build(ws, { question = '', screen: scr = '', passages = [] } = {}) {
    const R = compute(ws);
    const st = statuses(ws).map(x => `${x.s.n}. ${x.s.title}: ${x.st}`).join('; ');
    const body = [
      `The person is on the screen “${SCREENS[scr]?.[0] || scr}” of CyberRiskGuardian Desktop ${VERSION} (beta, proof of concept).`,
      `Workspace: ${ws.name} (${ws.kind}); ${ws.assessment.SCEN.length} scenarios, ${R.inc.length} included, ${R.counts.above} above tolerance; ${(ws.assets || []).length} information assets; ${(ws.measures || []).length} measures.`,
      `Process status: ${st}.`, '',
      'Built-in help passages that match the question:', ...passages.map(p => `- ${p.title}: ${p.text}`), '',
      'Question: ' + question, '',
      'Answer in at most 180 words, practically: which screen, which button, what to check. Use the help passages; if the',
      'question needs facts about the organization that are not given, say what to look at rather than guessing. Never state a',
      'risk figure you were not given and never claim to have changed anything.',
    ];
    return { system: 'You are the in-app help assistant of CyberRiskGuardian, a scenario-driven cybersecurity risk assessment tool. You explain how to use the application and the method. You do not calculate risk and you never invent organizational facts.', prompt: body.join('\n'), max_tokens: 900 };
  },
};

/* ---------------- the panel ---------------- */
export function setScreen(s) { screen = s || 'process'; if (panel && !panel.hidden) contextual(); }
const aiAllowed = () => prefs.get('chatbotAI') && AI.settings(S.ws).enabled && !!AI.route('chat', S.ws).provider;

function bubble(who, ...kids) { return el('div', { class: 'msg ' + who }, ...kids); }
function draw() {
  const list = panel.querySelector('.chatlog');
  list.replaceChildren(...log.map(m => m.node));
  list.scrollTop = list.scrollHeight;
}
function push(node) { log.push({ node }); if (log.length > 60) log.shift(); draw(); }
function contextual() {
  const t = SCREENS[screen];
  if (!t) return;
  push(bubble('bot', el('b', null, tr('On this screen') + ' — ' + tr(t[0])), el('div', null, t[1])));
}
function answer(q) {
  push(bubble('me', el('span', { 'data-noi18n': '' }, q)));
  const hits = search(q, 3);
  const kids = [];
  if (!hits.length) kids.push(el('div', null, 'I did not find this in the built-in help. Try other words, open the Process page, or the user guide.'));
  else {
    const h = hits[0];
    kids.push(el('b', null, h.title), el('div', { style: { margin: '4px 0' } }, h.text.length > 700 ? h.text.slice(0, 700) + '…' : h.text));
    if (h.route) kids.push(el('button', { class: 'btn sm', 'data-ro-ok': '', onclick: () => go(h.route) }, 'Open this screen'));
    if (hits.length > 1) kids.push(el('div', 'small muted', { style: { marginTop: '6px' } }, tr('Related:') + ' ', ...hits.slice(1).flatMap((r, i) => [i ? ' · ' : '', el('a', { href: '#', onclick: e => { e.preventDefault(); answer(r.title); } }, r.title)])));
  }
  if (aiAllowed()) kids.push(el('div', { style: { marginTop: '8px' } }, el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: async () => {
    const out = await aiui.request('chat', { question: q, screen, passages: hits.map(h => ({ title: h.title, text: h.text.slice(0, 600) })) }, { title: tr('Help chatbot — what will be sent') });
    if (!out) return;
    push(bubble('bot ai', el('div', 'small muted', 'AI answer · ' + out.model + ' · ' + tr('Analytical estimate — validation required.')), el('div', { style: { whiteSpace: 'pre-wrap' }, 'data-noi18n': '' }, out.text)));
  } }, 'Ask AI')));
  else kids.push(el('div', 'small muted', { style: { marginTop: '6px' } }, prefs.get('chatbotAI') ? 'AI is not available for this workspace or this feature (Settings → AI — local & remote).' : 'Help-only mode. AI answers can be turned on in Settings → AI — local & remote.'));
  push(bubble('bot', ...kids));
}

export function mount() {
  corpus = entries(); index();
  const fab = el('button', { class: 'chat-fab', id: 'chat-fab', 'aria-label': 'Help', title: 'Help', 'data-ro-ok': '', onclick: () => toggle() }, '?');
  const q = el('input', { placeholder: 'Ask a question — e.g. what is the baseline cost?', 'aria-label': 'Question', 'data-ro-ok': '' });
  const send = () => { const v = q.value.trim(); if (!v) return; q.value = ''; answer(v); };
  q.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  panel = el('aside', { class: 'chat-panel', id: 'chat-panel', hidden: true, 'aria-label': 'Help chatbot' },
    el('div', 'chat-head', el('b', { style: { flex: 1 } }, 'Help'), el('span', { class: 'pill', id: 'chat-mode' }), el('button', { class: 'btn sm ghost', 'data-ro-ok': '', 'aria-label': 'Close', onclick: () => toggle(false) }, '×')),
    el('div', 'chatlog'),
    el('div', 'chat-foot', q, el('button', { class: 'btn sm', 'data-ro-ok': '', onclick: send }, 'Ask')));
  document.body.append(fab, panel);
  window.addEventListener('crg-lang', () => { if (corpus) index(); });
  if (prefs.get('chatOpen')) toggle(true);
}
export function toggle(force) {
  const open = force ?? panel.hidden;
  panel.hidden = !open; prefs.set('chatOpen', open);
  const mode = panel.querySelector('#chat-mode');
  mode.textContent = aiAllowed() ? 'help + AI' : 'help only'; mode.className = 'pill ' + (aiAllowed() ? 'warn' : 'good');
  if (open) { loadGuide(); if (!log.length) { push(bubble('bot', el('div', null, 'Hello! Ask me how to use CyberRiskGuardian, or about the method. Answers come from the built-in help.'))); contextual(); } panel.querySelector('input').focus(); }
}
