/* aiui.js — the outbound preview as a dialog (1.5.2), so every screen that offers an AI action
   (profile and crown-jewel extraction, batch proposals, chatbot) shows exactly what would be sent,
   where, and asks for consent the same way the AI assistant does. Resolves with the answer, or null
   if the person cancels. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, banner, kpi, n0, toast, copyText, pill, field } from './util.js';
import { S, touch } from './state.js';
import * as anon from './anon.js';
import * as AI from './ai.js';
import * as helper from './helper.js';

/** Can this task run for this workspace, and where would it go? (1.5.3: per-feature routing policy.) */
export async function status(ws = S.ws, task = null) {
  await helper.probe().catch(() => {});
  if (!helper.HS.config) await helper.loadConfig().catch(() => {});
  const a = AI.settings(ws);
  if (!a.enabled) return { ok: false, why: 'AI is switched off for this workspace (Settings → AI — local & remote).' };
  if (!helper.HS.helper) return { ok: false, why: 'The local helper is not running — start the app with its launcher.' };
  const r = task ? AI.route(task, ws) : { provider: a.provider, mode: 'workspace', why: '' };
  if (!r.provider) return { ok: false, why: r.why, mode: r.mode };
  return { ok: true, provider: r.provider, mode: r.mode, web: r.provider === AI.WEB_SEARCH_PROVIDER && AI.policy().web_search };
}

export function request(task, opts = {}, { title = 'AI request', ws = S.ws } = {}) {
  return new Promise(resolve => {
    let p;
    try { p = AI.prepare(task, ws, opts); } catch (e) { toast(String(e.message || e), 'bad'); resolve(null); return; }
    const a = { provider: p.provider };
    const back = el('div', { class: 'modal-back', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
    const close = v => { back.remove(); document.removeEventListener('keydown', esc); resolve(v); };
    const esc = e => { if (e.key === 'Escape') close(null); };
    document.addEventListener('keydown', esc);

    /* 1.5.7 — the payload is editable. What is in the two boxes when Send is pressed is exactly what is
       transmitted: the size, the word count and the AI log are computed from them, and the log records
       that the payload was edited. "Restore" brings back what the application prepared. */
    const sysTa = el('textarea', { rows: 4, class: 'mono', 'aria-label': 'Instructions sent to the model', style: { fontSize: '11.5px' } });
    const ta = el('textarea', { rows: 12, class: 'mono', 'aria-label': 'Request sent to the model', style: { fontSize: '11.5px' } });
    const fill = () => { sysTa.value = p.system; ta.value = p.prompt; };
    fill();
    const sizeK = el('div');
    const editedPill = el('span');
    const isEdited = () => sysTa.value !== p.system || ta.value !== p.prompt;
    const measure = () => {
      const bytes = new Blob([sysTa.value + ta.value]).size, words = ta.value.split(/\s+/).filter(Boolean).length;
      sizeK.replaceChildren(kpi('Size', `${n0(bytes)} bytes`, `${n0(words)} words`));
      editedPill.replaceChildren(isEdited() ? pill('edited by you', 'warn') : pill('as prepared', 'good'));
    };
    sysTa.addEventListener('input', measure); ta.addEventListener('input', measure);

    const msg = el('div');
    const consent = AI.needsConsent(ws);
    const sendBtn = el('button', { class: 'btn', 'data-ro-ok': '' }, consent ? 'Confirm and send' : 'Send');
    sendBtn.addEventListener('click', async () => {
      if (!ta.value.trim()) { msg.replaceChildren(banner('bad', 'Nothing to send', 'The request is empty. Restore the prepared payload or write one.')); return; }
      sendBtn.disabled = true; sendBtn.textContent = 'Sending…';
      const edited = isEdited();
      const q = { ...p, system: sysTa.value, prompt: ta.value, edited,
        bytes: new Blob([sysTa.value + ta.value]).size, words: ta.value.split(/\s+/).filter(Boolean).length };
      try {
        const out = await AI.send(q, ws);
        AI.acknowledge(ws);
        close(Object.assign(out, { edited, creativity: q.creativity }));
      } catch (e) {
        msg.replaceChildren(banner('bad', 'The request failed', String(e.message || e)));
        sendBtn.disabled = false; sendBtn.textContent = consent ? 'Confirm and send' : 'Send';
      }
    });

    // creativity: re-prepares the payload, so the preview always shows the instruction actually sent
    let creaBox = null;
    if (AI.takesCreativity(task)) {
      const sel = el('select', { 'aria-label': 'Creativity of the answer' }, ...AI.CREATIVITY.map(c => el('option', { value: c.id, selected: c.id === (p.creativity || AI.creativity(ws)) }, c.label)));
      const help = el('div', 'small muted', AI.creativityLevel(sel.value).help);
      const remember = el('input', { type: 'checkbox', style: { width: 'auto' } });
      sel.addEventListener('change', () => {
        if (isEdited() && !window.confirm('Changing the creativity prepares the payload again and discards your edits. Continue?')) { sel.value = p.creativity; return; }
        try { p = AI.prepare(task, ws, { ...opts, creativity: sel.value }); } catch (e) { msg.replaceChildren(banner('bad', 'Could not prepare', String(e.message || e))); return; }
        help.textContent = AI.creativityLevel(sel.value).help;
        if (remember.checked) { AI.settings(ws).creativity = sel.value; touch('ai'); }
        fill(); measure();
      });
      remember.addEventListener('change', () => { if (remember.checked) { AI.settings(ws).creativity = sel.value; touch('ai'); } });
      creaBox = el('div', 'card', { style: { margin: '10px 0', padding: '10px 12px' } },
        el('div', 'grid g2', field('Creativity of the answer', sel), el('div', null, help)),
        el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' } }, remember, el('span', 'small', 'Use this level by default for this workspace')),
        el('p', 'small muted', { style: { margin: '6px 0 0' } }, 'More creative answers propose more — every proposal still arrives tagged ASSUMPTION and waits for your decision. ' + AI.MARK));
    }

    const anonBtn = el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => {
      const ctx = anon.context(ws, anon.DEFAULT_OPTS);
      ta.value = anon.text(ta.value, ctx, anon.DEFAULT_OPTS); sysTa.value = anon.text(sysTa.value, ctx, anon.DEFAULT_OPTS);
      measure(); toast('Anonymizer applied to the payload');
    } }, 'Apply the anonymizer');
    const restoreBtn = el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => { fill(); measure(); } }, 'Restore the prepared payload');

    const box = el('div', 'modal',
      el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { flex: 1, margin: 0 } }, title),
        el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => close(null), 'aria-label': 'Close' }, '×')),
      el('div', 'grid g4', { style: { marginTop: '10px' } },
        kpi('Task', p.label, p.anonymized ? 'anonymized' : 'as written'),
        sizeK,
        kpi('Destination', AI.isLocal(a.provider) ? 'this machine' : AI.provider(a.provider).label,
            AI.isLocal(a.provider) ? 'local model' : AI.host(a.provider) || 'remote endpoint', AI.kindOf(a.provider)),
        kpi('Web search', p.web_search ? 'on' : 'off', p.web_search ? 'for missing information' : (a.provider === AI.WEB_SEARCH_PROVIDER ? 'not needed' : 'available on the Claude API only'))),
      creaBox,
      el('p', 'note', 'This is the payload, byte for byte, and you can edit it: remove what should not leave, add context the documents lack, sharpen the question. What is in these two boxes when you press Send is exactly what is transmitted — nothing else. ', editedPill),
      el('label', 'small muted', 'Instructions (system)'), sysTa,
      el('label', 'small muted', { style: { display: 'block', marginTop: '8px' } }, 'Request'), ta,
      consent ? banner(AI.kindOf(p.provider), AI.confidential(ws) ? 'This workspace is marked confidential' : 'First send from this workspace',
        AI.confidential(ws) ? 'Every call is confirmed individually; nothing is remembered.' : 'Confirming once records the date against the workspace.') : null,
      msg,
      el('div', 'btnrow', { style: { marginTop: '10px' } }, sendBtn,
        el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => close(null) }, 'Cancel'),
        restoreBtn, anonBtn,
        el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: e => copyText(sysTa.value + '\n\n' + ta.value, e.target) }, 'Copy')));
    measure();
    back.append(box);
    back.addEventListener('click', e => { if (e.target === back) close(null); });
    document.body.append(back);
    sendBtn.focus();
  });
}
