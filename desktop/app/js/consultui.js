/* consultui.js — the Virtual consultant on screen: the slide-over panel opened from the top bar on every
   screen (the screen stays visible beside it), and the conversation view the full Tools → Virtual
   consultant screen shares with it.

   An answer is drawn in two blocks that never mix: "From your sources" (paragraphs that cite a passage the
   consultant was given, each marker opening the passage) and "General knowledge, not from your sources"
   (everything else, with the estimate marker). Links in an answer open a screen, a scenario or a textbook
   chapter. Proposals go to the existing review flows; the answer itself changes nothing.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, banner, toast, pill, modal } from './util.js';
import { S } from './state.js';
import * as AI from './ai.js';
import * as aiui from './aiui.js';
import * as CONS from './consult.js';
import * as LIB from './kblib.js';
import * as MK from './markers.js';
import { tr } from './i18n.js';

let panel = null;
const MSG_ME = ['msg', 'me'].join(' ');
const views = new Set();          // live conversation views, redrawn after an answer

/* ---------------- text of an answer ---------------- */

/** A textbook chapter in a window of its own (the bundled text). */
export async function openChapter(n) {
  const b = await CONS.book();
  const f = b.meta.files.find(x => x.kind === 'chapter' && x.n === n);
  if (!f) return;
  const md = await (await fetch(new URL('../kb/book/' + f.file, import.meta.url))).text();
  modal(`${tr('Textbook')} ${b.meta.edition} — ${tr('Chapter')} ${n}: ${f.title}`,
    el('p', 'small muted', b.meta.title + ' · ' + b.meta.author + ' · ' + b.meta.licence),
    el('div', { class: 'consult-chapter', 'data-noi18n': '' }, md.replace(/<!--[\s\S]*?-->/g, '').trim()));
}

function linkNode(kind, val) {
  const r = CONS.resolveLink(kind, val);
  if (!r) return el('span', 'mono', val);
  if (r.chapter) return el('a', { href: '#', class: 'consult-link', onclick: e => { e.preventDefault(); openChapter(r.chapter); } }, tr('Chapter') + ' ' + r.chapter);
  return el('a', { href: r.href, class: 'consult-link' }, r.label);
}
/** Answer text with its passage markers and links made live. */
function rich(text, passages, onCite) {
  const out = el('p', { 'data-noi18n': '' });
  const re = /\[P(\d+)\]|\[\[(screen|scenario|chapter):([^\]]+)\]\]/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.append(text.slice(last, m.index));
    if (m[1]) {
      const n = Number(m[1]), p = passages.find(x => x.n === n);
      out.append(el('button', { type: 'button', class: 'consult-cite', title: p ? p.cite : '', 'data-ro-ok': '', onclick: () => onCite(n) }, 'P' + n));
    } else out.append(linkNode(m[2], m[3]));
    last = re.lastIndex;
  }
  if (last < text.length) out.append(text.slice(last));
  return out;
}

function passageNode(p) {
  const r = p.link?.scenario ? CONS.resolveLink('scenario', p.link.scenario) : p.link?.chapter ? { chapter: p.link.chapter } : p.link?.screen ? CONS.resolveLink('screen', p.link.screen) : null;
  const open = !r ? null : r.chapter
    ? el('a', { href: '#', onclick: e => { e.preventDefault(); openChapter(r.chapter); } }, tr('Open'))
    : el('a', { href: r.href }, tr('Open'));
  return el('li', { class: 'consult-passage' + (p.used ? ' used' : ''), 'data-n': p.n },
    el('b', null, 'P' + p.n), ' ', el('span', 'pill', CONS.sourceLabel(p.source)), ' ',
    el('span', { 'data-noi18n': '' }, p.cite), open ? el('span', null, ' · ', open) : null,
    el('div', { class: 'small muted', 'data-noi18n': '' }, '“' + (p.source === 'library' ? LIB.quote(p.quote) : p.quote) + '”'));
}

/** One answer of the consultant. */
export function answerNode(m, { onChange = () => {} } = {}) {
  const passages = m.passages || [];
  const list = el('ol', 'consult-passages');
  for (const p of passages) list.append(passageNode(p));
  const det = el('details', 'consult-sources', el('summary', null, tr('Passages retrieved on this computer') + ` (${passages.length}, ${passages.filter(p => p.used).length} ${tr('cited')})`), list);
  const onCite = n => { det.open = true; const li = [...list.children].find(x => x.dataset.n === String(n)); if (li) { li.classList.add('flash'); li.scrollIntoView({ block: 'nearest' }); setTimeout(() => li.classList.remove('flash'), 1200); } };
  const cited = (m.parts || []).filter(p => p.kind === 'cited'), gen = (m.parts || []).filter(p => p.kind === 'general');
  const box = el('div', 'consult-answer');
  if (cited.length) box.append(el('section', 'consult-cited', el('h4', null, 'From your sources'), ...cited.map(p => rich(p.text, passages, onCite))));
  if (gen.length) box.append(el('section', 'consult-general', el('h4', null, CONS.GENERAL), ...gen.map(p => rich(p.text, passages, onCite)),
    el('p', 'small muted', MK.ESTIMATE)));
  const flags = (m.parts || []).flatMap(p => p.flags || []);
  if (flags.length) box.append(banner('warn', 'Checked by the application', [...new Set(flags)].join(' · ')));
  if (passages.length) box.append(det);
  const props = m.proposals?.scenarios || [];
  if (props.length && !m.sent) box.append(el('div', 'btnrow', el('button', { class: 'btn sm', 'data-ro-ok': '', onclick: () => {
    const n = CONS.toCandidates(props, { model: m.model, entryId: m.logId });
    m.sent = true; toast(tr('{0} candidate(s) added to Scenario screening → Candidates & scores for review').replace('{0}', n)); onChange();
  } }, tr('Send {0} proposed scenario(s) to Scenario screening for review').replace('{0}', props.length))));
  const verdict = m.decision ? pill(m.decision === 'rejected' ? 'not useful' : 'useful', m.decision === 'rejected' ? 'bad' : 'good') : null;
  box.append(el('div', 'small muted consult-meta',
    el('span', { 'data-noi18n': '' }, `${m.model || ''} · ${AI.where(m.provider)}`), ' · ', tr('retrieval') + ' ' + tr(m.mode || 'lexical'), ' ',
    verdict || el('span', null,
      el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => { AI.decide(m.logId, 'accepted'); m.decision = 'accepted'; onChange(); } }, 'Useful'),
      el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => { AI.decide(m.logId, 'rejected'); m.decision = 'rejected'; onChange(); } }, 'Not useful'))));
  return box;
}

/* ---------------- the conversation view ---------------- */

/**
 * Draw the current conversation and the question box into `box`. compact: the slide-over panel.
 * Returns a redraw function.
 */
export function conversationView(box, { compact = false } = {}) {
  let busy = false;
  const draw = () => {
    if (!box.isConnected && views.has(draw)) { views.delete(draw); return; }
    const ws = S.ws; if (!ws) return;
    const conv = CONS.current(ws);
    const ctx = CONS.screenContext();
    const r = AI.route('consultant', ws), a = AI.settings(ws);
    const dest = !a.enabled ? pill('AI off for this workspace', 'bad') : !r.provider ? pill('blocked', 'bad') : pill(AI.where(r.provider), AI.kindOf(r.provider));
    const head = el('div', 'small muted consult-ctx',
      el('span', null, el('span', null, 'Screen:'), ' ', el('b', null, tr(ctx.label))),
      ctx.selected ? el('span', null, ' · ', el('span', null, 'selected:'), ' ', el('b', { 'data-noi18n': '' }, ctx.selected.id + (ctx.selected.name ? ' — ' + ctx.selected.name : ''))) : null,
      el('span', null, ' · ', tr('sends to'), ' ', dest, ' · ', tr('retrieval'), ' ', pill(tr(CONS.retrievalMode(ws)), 'good')));
    const log = el('div', 'consult-log');
    if (!conv || !conv.messages.length) log.append(el('div', 'small muted consult-empty',
      el('p', null, 'Ask about this workspace, the method or the screen you are on. The consultant answers from passages retrieved on this computer — the textbook, the ontology, this workspace’s documents and records, the catalogues and your library — and says which parts come from them.'),
      el('p', null, 'Nothing is sent before you have seen the request. Nothing in the workspace changes: proposals go to the review screens.')));
    else for (const m of conv.messages) {
      if (m.role === 'user') log.append(el('div', MSG_ME, el('span', { 'data-noi18n': '' }, m.text)));
      else log.append(answerNode(m, { onChange: () => { CONS.touchConv(); draw(); } }));
    }
    const q = el('textarea', { rows: compact ? 3 : 3, placeholder: 'Ask the Virtual consultant — e.g. which scenarios drive the residual risk, what does the book say about risk appetite?', 'aria-label': 'Question for the Virtual consultant', 'data-ro-ok': '' });
    q.value = box._draft || '';
    q.addEventListener('input', () => { box._draft = q.value; });
    const msg = el('div');
    const ask = el('button', { class: 'btn', 'data-ro-ok': '', disabled: busy }, busy ? 'Retrieving…' : 'Ask');
    const send = async () => {
      const text = q.value.trim(); if (!text || busy) return;
      const st = await aiui.status(S.ws, 'consultant');
      if (!st.ok) { msg.replaceChildren(banner('warn', 'The Virtual consultant cannot send', tr(st.why)), el('a', { href: '#/settings/ai' }, 'Settings → AI — local & remote')); return; }
      busy = true; draw();
      try {
        const res = await CONS.consult(text, { ctx, ask: (task, opts) => aiui.request(task, opts, { title: tr('Virtual consultant — what will be sent') }) });
        if (res) box._draft = '';
      } catch (e) { toast(String(e.message || e), 'bad'); }
      busy = false; redrawAll();
    };
    ask.addEventListener('click', send);
    q.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); });
    const foot = el('div', 'consult-foot', q, msg, el('div', 'btnrow', ask,
      el('button', { class: 'btn ghost sm', 'data-ro-ok': '', onclick: () => { CONS.newConversation(); box._draft = ''; redrawAll(); } }, 'New conversation'),
      compact ? el('a', { href: '#/ai/consult', class: 'small' }, 'Full view and history') : null));
    box.replaceChildren(head, log, foot);
    log.scrollTop = log.scrollHeight;
    if (box._focus) { q.focus(); box._focus = false; }
  };
  views.add(draw);
  draw();
  return draw;
}
export function redrawAll() { for (const d of [...views]) d(); }

/* ---------------- the slide-over panel ---------------- */

export function mount() {
  LIB.load().catch(() => {});
  const body = el('div', 'consult-body');
  // 1.9.0 — Atlas: a non-modal dialog (the screen beside it stays usable), labelled by its title; Escape closes it and
  // gives the focus back to the Consultant button.
  panel = el('aside', { class: 'consult-panel', id: 'consult-panel', hidden: true, role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'consult-title' },
    el('div', 'consult-head', el('b', { id: 'consult-title', style: { flex: 1 } }, 'Virtual consultant'),
      el('span', 'pill warn', AI.MARK),
      el('button', { class: 'btn sm ghost', 'data-ro-ok': '', 'aria-label': 'Close', onclick: () => { toggle(false); document.getElementById('consult-toggle')?.focus(); } }, '×')),
    body);
  document.body.append(panel);
  panel.addEventListener('keydown', e => { if (e.key === 'Escape' && !e.defaultPrevented) { e.stopPropagation(); toggle(false); document.getElementById('consult-toggle')?.focus(); } });
  panel._view = null;
  panel._body = body;
  window.addEventListener('hashchange', () => { if (panel && !panel.hidden) redrawAll(); });
  window.addEventListener('crg-lang', () => { if (panel && !panel.hidden) redrawAll(); });
}
export function toggle(force) {
  if (!panel) return;
  const open = force ?? panel.hidden;
  panel.hidden = !open;
  document.body.classList.toggle('consult-open', open);
  const b = document.getElementById('consult-toggle'); if (b) b.setAttribute('aria-expanded', String(open));
  if (open) { if (!panel._view) panel._view = conversationView(panel._body, { compact: true }); panel._body._focus = true; panel._view(); }
}
/** Open the panel, optionally with a question typed in (the help chatbot hands questions over this way). */
export function open({ question = '' } = {}) {
  if (!panel) return;
  if (question) panel._body._draft = question;
  toggle(true);
}
export const isOpen = () => !!panel && !panel.hidden;
