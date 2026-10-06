/* aiui.js — the outbound preview as a dialog (1.5.2), so every screen that offers an AI action
   (profile and crown-jewel extraction, batch proposals, chatbot) shows exactly what would be sent,
   where, and asks for consent the same way the AI assistant does. Resolves with the answer, or null
   if the person cancels. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, banner, kpi, n0, toast, copyText } from './util.js';
import { S } from './state.js';
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
    const ta = el('textarea', { rows: 12, readonly: true, class: 'mono', style: { fontSize: '11.5px' } });
    ta.value = p.system + '\n\n---\n\n' + p.prompt;
    const msg = el('div');
    const consent = AI.needsConsent(ws);
    const sendBtn = el('button', { class: 'btn', 'data-ro-ok': '' }, consent ? 'Confirm and send' : 'Send');
    sendBtn.addEventListener('click', async () => {
      sendBtn.disabled = true; sendBtn.textContent = 'Sending…';
      try {
        const out = await AI.send(p, ws);
        AI.acknowledge(ws);
        close(out);
      } catch (e) {
        msg.replaceChildren(banner('bad', 'The request failed', String(e.message || e)));
        sendBtn.disabled = false; sendBtn.textContent = consent ? 'Confirm and send' : 'Send';
      }
    });
    const box = el('div', 'modal',
      el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { flex: 1, margin: 0 } }, title),
        el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => close(null), 'aria-label': 'Close' }, '×')),
      el('div', 'grid g4', { style: { marginTop: '10px' } },
        kpi('Task', p.label, p.anonymized ? 'anonymized' : 'as written'),
        kpi('Size', `${n0(p.bytes)} bytes`, `${n0(p.words)} words`),
        kpi('Destination', AI.isLocal(a.provider) ? 'this machine' : AI.provider(a.provider).label,
            AI.isLocal(a.provider) ? 'local model' : AI.host(a.provider) || 'remote endpoint', AI.kindOf(a.provider)),
        kpi('Web search', p.web_search ? 'on' : 'off', p.web_search ? 'for missing information' : (a.provider === AI.WEB_SEARCH_PROVIDER ? 'not needed' : 'available on the Claude API only'))),
      el('p', 'note', 'This is the payload, byte for byte. Nothing else is transmitted. ' + AI.MARK),
      ta,
      consent ? banner(AI.kindOf(p.provider), AI.confidential(ws) ? 'This workspace is marked confidential' : 'First send from this workspace',
        AI.confidential(ws) ? 'Every call is confirmed individually; nothing is remembered.' : 'Confirming once records the date against the workspace.') : null,
      msg,
      el('div', 'btnrow', { style: { marginTop: '10px' } }, sendBtn,
        el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => close(null) }, 'Cancel'),
        el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: e => copyText(p.system + '\n\n' + p.prompt, e.target) }, 'Copy')));
    back.append(box);
    back.addEventListener('click', e => { if (e.target === back) close(null); });
    document.body.append(back);
    sendBtn.focus();
  });
}
