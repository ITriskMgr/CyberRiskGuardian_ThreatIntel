/* Settings → AI — local & remote (1.5.3, proof of concept). One place for every decision about what may
   leave this computer for an AI model: the master switches, the route of each AI feature, this
   workspace's AI settings, the help chatbot, and the providers themselves (keys, local endpoint, models,
   connection test). The routing policy is saved in crg-config.json, where the helper enforces it.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, select, toast, banner, table, field, kpi } from '../util.js';
import { S, touch } from '../state.js';
import * as AI from '../ai.js';
import * as prefs from '../prefs.js';
import { HS, saveConfig, loadConfig } from '../helper.js';
import { tr } from '../i18n.js';

const SENS = { high: ['high', 'bad'], medium: ['medium', 'warn'], low: ['low', 'good'] };

async function savePolicy(P) {
  HS.config.ai = Object.assign({}, HS.config.ai, { policy: P });
  await saveConfig();
}

export async function render(body, sec, rerender, providersSection) {
  if (!HS.config) await loadConfig().catch(() => {});
  const ws = S.ws, a = AI.settings(ws), P = AI.policy();
  // 1.5.5 — the destination is whatever the registry says, so a new provider needs no change here.
  const destination = f => { const r = AI.route(f, ws); return !a.enabled ? ['workspace AI off', ''] : !r.provider ? ['blocked', ''] : [AI.where(r.provider), AI.kindOf(r.provider)]; };
  const leaves = f => { const r = AI.route(f, ws); return a.enabled && r.provider && !AI.isLocal(r.provider); };
  const stays = f => { const r = AI.route(f, ws); return a.enabled && r.provider && AI.isLocal(r.provider); };

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'AI — what may leave this computer'),
    el('p', null, 'Every AI request goes through the local helper, after you have seen its exact content. This page decides where each feature may send it: a ',
      el('b', null, 'model on this machine'), ' (nothing leaves this computer), a ', el('b', null, 'provider off this machine'),
      ' (the Claude API, OpenAI, Gemini, Azure OpenAI, GitHub Models or one your organization added), or nowhere. ',
      'The helper applies the same rules before it sends anything, so a feature set to a local model cannot reach a remote provider, whatever a page asks for.'),
    !HS.helper ? banner('warn', 'The local helper is not running', 'Changes are kept in this browser and applied when the helper starts. AI needs the helper.') : null,
    el('div', 'grid g4', { style: { marginTop: '8px' } },
      kpi('Remote AI', P.remote_allowed ? 'allowed' : 'off', 'providers off this machine', P.remote_allowed ? 'warn' : 'good'),
      kpi('Web search', P.web_search && P.remote_allowed ? 'allowed' : 'off', 'Claude API only, for missing profile data'),
      kpi('Features on this computer', String(AI.FEATURES.filter(f => stays(f[0])).length) + ' / ' + AI.FEATURES.length, 'for this workspace', 'good'),
      kpi('Features that may leave', String(AI.FEATURES.filter(f => leaves(f[0])).length), 'for this workspace', AI.FEATURES.some(f => leaves(f[0])) ? 'warn' : 'good'))));

  // master switches
  const rem = el('input', { type: 'checkbox', checked: !!P.remote_allowed, style: { width: 'auto' } });
  rem.addEventListener('change', async () => { P.remote_allowed = rem.checked; await savePolicy(P); toast(rem.checked ? tr('Remote AI allowed') : tr('Remote AI switched off — only the local model can be used')); rerender(); });
  const web = el('input', { type: 'checkbox', checked: !!P.web_search, disabled: !P.remote_allowed, style: { width: 'auto' } });
  web.addEventListener('change', async () => { P.web_search = web.checked; await savePolicy(P); rerender(); });
  const row = (c, t, h) => el('label', { style: { display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--ink)', margin: '8px 0' } }, c, el('span', null, el('b', null, t), h ? el('div', 'small muted', h) : null));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Master switches (this installation)'),
    row(rem, 'Allow requests to a provider off this machine', 'Off: nothing is ever sent beyond this computer, whatever a workspace or a route says; every feature must use a local model. Applies to all workspaces and is enforced by the helper, not only by this page.'),
    row(web, 'Allow web search for missing profile information', 'Claude API only. Values found this way are tagged EXTERNAL with the page cited.')));

  // per-feature routing
  const feats = AI.FEATURES.map(([id, label, sends, sens, def]) => ({ id, label, sends, sens, def }));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Route of each AI feature'),
    el('p', 'note', '“Workspace provider” follows the provider chosen for each workspace below. “Local model only” never leaves this computer. Features that carry the most sensitive data — the vulnerability list, the full text of the documents — are marked high.'),
    table([
      { key: 'label', label: 'Feature', render: f => el('div', null, el('b', null, f.label), el('div', 'small muted', f.sends)) },
      { key: 'sens', label: 'Sensitivity', render: f => pill(SENS[f.sens][0], SENS[f.sens][1]) },
      { key: 'mode', label: 'Route', sortable: false, render: f => {
        const s = select(AI.MODES, P.tasks[f.id] || f.def);
        s.addEventListener('change', async () => { P.tasks[f.id] = s.value; await savePolicy(P); toast(tr('Route saved')); rerender(); });
        return el('div', null, s, (P.tasks[f.id] || f.def) !== f.def ? el('div', 'small muted', tr('recommended:') + ' ' + tr(AI.MODES.find(m => m[0] === f.def)[1])) : null);
      } },
      { key: 'now', label: 'For this workspace', sortable: false, render: f => { const [t, k] = destination(f.id); return pill(t, k); } },
    ], feats, { class: 'compact' }),
    el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn ghost sm', onclick: async () => {
      if (!window.confirm('Put every feature back on its recommended route?')) return;
      await savePolicy({ ...P, tasks: { ...AI.DEFAULT_POLICY.tasks } }); toast(tr('Recommended routes restored')); rerender();
    } }, 'Restore the recommended routes'))));

  // this workspace
  const on = el('input', { type: 'checkbox', checked: !!a.enabled, style: { width: 'auto' } });
  on.addEventListener('change', () => { a.enabled = on.checked; touch(); rerender(); });
  // Built from the registry the helper reports: remote providers first, then the ones on this machine.
  const plist = AI.providers();
  const prov = select(plist.map(p => [p.id, p.label + (p.local ? ' — on this machine' : '')]), a.provider);
  prov.addEventListener('change', () => { a.provider = prov.value; touch(); rerender(); });
  const pnow = AI.provider(a.provider);
  const notReady = !pnow.local && !(HS.ai?.keys?.[a.provider]);
  const conf = el('input', { type: 'checkbox', checked: !!a.confidential, style: { width: 'auto' } });
  conf.addEventListener('change', () => { a.confidential = conf.checked; if (conf.checked) a.acknowledged = ''; touch(); rerender(); });
  const an = el('input', { type: 'checkbox', checked: !!a.anon, style: { width: 'auto' } });
  an.addEventListener('change', () => { a.anon = an.checked; touch(); rerender(); });
  body.append(card(el('h2', { style: { marginTop: 0 } }, el('span', null, 'This workspace — '), el('span', { 'data-noi18n': '' }, ws.name)),
    row(on, 'AI for this workspace', 'Off: no AI feature can send anything about this workspace, whatever the routes above say.'),
    el('div', 'grid g2', field('Workspace provider', prov,
      el('span', null, 'Used by every feature whose route is “Workspace provider”. ',
        pnow.local ? 'Requests to it stay on this computer.' : 'Requests to it leave this computer.',
        notReady ? el('span', null, ' ', el('b', null, 'No key is stored for it yet'), ' — add one under Providers below, or choose a provider on this machine.') : null))),
    row(conf, 'Treat as confidential', 'Every call is confirmed individually; consent is never remembered.'),
    row(an, 'Anonymize before sending', 'Organization, people, assets, hosts and amounts are replaced in the payload; the preview shows the result.')));

  // chatbot
  const bot = el('input', { type: 'checkbox', checked: !!prefs.get('chatbotAI'), style: { width: 'auto' }, 'data-ro-ok': '' });
  bot.addEventListener('change', () => { prefs.set('chatbotAI', bot.checked); toast(bot.checked ? tr('The chatbot may use AI') : tr('The chatbot answers from the built-in help only')); rerender(); });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Help chatbot'),
    row(bot, 'Let the chatbot use AI', 'Off by default: answers come from the built-in help and the user guide, on this computer. On: each answer offers “Ask AI”, routed like the “Help chatbot” feature above.')));

  // providers (keys, endpoint, models, test)
  body.append(el('h2', { style: { margin: '18px 0 6px' } }, 'Providers'));
  await providersSection(body, sec);
}
