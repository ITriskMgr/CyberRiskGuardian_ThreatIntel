/* Settings → AI — local & remote (1.5.3). One place for every decision about what may
   leave this computer for an AI model: the master switches, the route of each AI feature, this
   workspace's AI settings, the Virtual consultant's retrieval (lexical, or hybrid with a LOCAL embedding
   model), and the providers themselves (keys, local endpoint, models, connection test). The routing policy is saved in crg-config.json, where the helper enforces it.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, select, toast, banner, table, field, kpi } from '../util.js';
import { S, touch } from '../state.js';
import * as AI from '../ai.js';
import * as CONS from '../consult.js';
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

  // 1.9.2 (NV-047, D5) — which model for which feature: the guidance, and a warning when a small local model serves a
  // feature the tests showed unreliable, with a one-click route of that feature to the default remote provider (opt-in;
  // the payload preview still applies to every request)
  const warns = AI.smallLocalWarnings(ws);
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Which AI model for which feature'),
    el('p', null, el('b', null, 'AI is optional.'), ' ', 'Every feature works without it (Rules only), and nothing the AI proposes is kept until you accept it.'),
    el('p', null, el('b', null, 'Small local models (8B to 14B) are not reliable'), ' ', 'for the Virtual consultant, the exploitation forecast and vulnerability linking. In the release tests they gave wrong answers, empty answers, or made-up CVE identifiers with high confidence, and they followed instructions hidden in a document.'),
    el('p', null, 'For those features, use either ', el('b', null, tr('a local model of about {0}B parameters or more').replace('{0}', AI.LOCAL_MIN_B)), ', which needs a computer with ', el('b', null, tr('{0} GB of memory or more').replace('{0}', AI.LOCAL_MIN_GB)), ', or ', el('b', null, 'a remote provider'), ' (Claude API or OpenAI) that you switch on for that feature only. The local-only defaults are kept: nothing leaves this computer unless you change a route below.'),
    el('p', 'small muted', 'Provisional: models of about 30B and more are still to be tested on a larger computer. Never accept AI proposals from documents you did not write without reading them: a local model can be steered by text planted in a document. Version 1.9.2 wraps such text as untrusted data and checks that every FACT quotes it, but your review remains the safeguard. The full table is in the user guide, section “Which AI model for which feature”.'),
    warns.length ? banner('warn', tr('Quality warning: a local model below about {0}B serves {1} feature(s) the tests found unreliable').replace('{0}', AI.LOCAL_MIN_B).replace('{1}', warns.length),
      el('div', null, ...warns.map(w => el('div', { class: 'row', style: { alignItems: 'center', gap: '8px', margin: '4px 0' } },
        el('span', { style: { flex: 1 } }, el('b', null, tr(w.label)), ' — ', tr('{0} on {1}').replace('{0}', w.model ? `${w.model}${w.size !== null ? ` (${w.size}B)` : ` (${tr('size not stated in the name')})`}` : tr('no model set')).replace('{1}', AI.provider_label(w.provider)), '. ', tr('Seen in tests:'), ' ', tr(w.why), '.'),
        P.remote_allowed ? el('button', { class: 'btn sm', onclick: async () => {
          if (!window.confirm(tr('Route “{0}” to {1}? Its requests will leave this computer; you see each payload before it is sent.').replace('{0}', tr(w.label)).replace('{1}', AI.provider_label(AI.remoteDefault())))) return;
          P.tasks[w.id] = 'remote'; await savePolicy(P); toast(tr('Route saved')); rerender();
        } }, tr('Route to {0}').replace('{0}', AI.provider_label(AI.remoteDefault()))) : el('span', 'small muted', 'Remote AI is off: allow it above to route this feature to a remote provider, or switch the feature off.'),
        el('button', { class: 'btn sm ghost', onclick: async () => { P.tasks[w.id] = 'off'; await savePolicy(P); toast(tr('Route saved')); rerender(); } }, 'Switch off')))))
      : el('p', 'small', pill(tr('no quality warning'), 'good'), ' ', tr('No feature the tests found unreliable is served by a local model below about {0}B.').replace('{0}', AI.LOCAL_MIN_B))));

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

  // 1.9.1 (B3) — which provider a "Local model only" or "Remote provider only" route goes to
  const sideSel = local => {
    const list = AI.providers().filter(p => !!p.local === local);
    const key = local ? 'default_local' : 'default_remote';
    const s = select([['', tr('Automatic — the first provider whose connection test passed')], ...list.map(p => [p.id, p.label])], HS.config?.ai?.[key] || '');
    s.addEventListener('change', async () => {
      HS.config.ai = Object.assign({}, HS.config.ai, { [key]: s.value });
      await saveConfig(); toast(tr('Default provider saved')); rerender();
    });
    const now = local ? AI.localDefault() : AI.remoteDefault();
    return field(local ? 'Default local provider' : 'Default remote provider', s,
      el('span', null, tr('Now:') + ' ', el('b', { 'data-noi18n': '' }, AI.provider_label(now)), ' — ', tr(AI.sideDefaultWhy(local)), '.'));
  };
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Default providers (this installation)'),
    el('p', 'note', 'A feature routed to “Local model only” goes to the default local provider; one routed to a provider off this machine, while the workspace provider is local, goes to the default remote provider. Automatic picks the first provider whose connection test passed (local: Ollama, then LM Studio, then the other local model).'),
    el('div', 'grid g2', sideSel(true), sideSel(false))));

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
    row(an, 'Anonymize before sending', 'Organization, people, assets, hosts and amounts are replaced in the payload; the preview shows the result.'),
    creativityField(a)));

  // the Virtual consultant's retrieval
  await retrievalCard(body, ws, rerender, row);

  // providers (keys, endpoint, models, test)
  body.append(el('h2', { style: { margin: '18px 0 6px' } }, 'Providers'));
  await providersSection(body, sec);
}

/* 1.5.7 — the default creativity of extraction and proposal answers for this workspace. The preview
   window offers the same choice for each request. */
function creativityField(a) {
  const sel = select(AI.CREATIVITY.map(c => [c.id, c.label]), AI.creativityLevel(a.creativity).id);
  const help = el('div', 'hint', AI.creativityLevel(sel.value).help);
  sel.addEventListener('change', () => { a.creativity = sel.value; help.textContent = AI.creativityLevel(sel.value).help; touch('ai'); });
  return el('div', 'grid g2', el('div', 'field', el('label', null, 'Creativity of extraction and proposals'), sel, help),
    el('p', 'small muted', tr('Applies to profile and crown-jewel extraction, import from documents, scenario proposals, causal chains and ontology suggestions. Higher levels propose more, including items the documents do not mention; each proposal is tagged ASSUMPTION and waits for your decision.') + ' ' + tr(AI.MARK)));
}

/* Virtual consultant — retrieval. Lexical (BM25, offline, deterministic) by default; a workspace may switch to
   hybrid, which adds the ranking of a LOCAL embedding model. The model is set for the installation; the
   helper refuses any provider that is not on this machine, and the vector index is dropped when the
   model changes. The hybrid choice stays greyed out until a local embedding model is configured. */
async function retrievalCard(body, ws, rerender, row) {
  const e = Object.assign({ provider: '', model: '' }, HS.config?.ai?.embed || HS.ai?.embed || {});
  const locals = AI.providers().filter(p => p.local);
  const prov = select([['', '— none —'], ...locals.map(p => [p.id, p.label])], locals.some(p => p.id === e.provider) ? e.provider : '');
  const model = el('input', { type: 'text', value: e.model, placeholder: 'nomic-embed-text', 'aria-label': 'Embedding model' });
  const save = el('button', { class: 'btn sm', onclick: async () => {
    const next = { provider: prov.value, model: model.value.trim() };
    const changed = next.provider !== e.provider || next.model !== e.model;
    HS.config.ai = Object.assign({}, HS.config.ai, { embed: next });
    try { await saveConfig(); } catch (err) { toast(String(err.message || err), 'bad'); return; }
    if (changed) { await CONS.invalidateVectors(); toast(tr('Embedding model saved — the vector index was cleared and must be built again')); }
    else toast(tr('Embedding model saved'));
    rerender();
  } }, 'Save the embedding model');
  const ready = CONS.embedReady();
  const c = ws.consultant ||= { conversations: [], retrieval: 'lexical' };
  const mode = el('select', { 'aria-label': 'Retrieval for this workspace' },
    el('option', { value: 'lexical', selected: c.retrieval !== 'hybrid' }, 'Lexical — on this computer, offline (default)'),
    el('option', { value: 'hybrid', selected: c.retrieval === 'hybrid', disabled: !ready }, 'Hybrid — lexical + local embedding model'));
  mode.addEventListener('change', () => { c.retrieval = mode.value; touch('consultant'); rerender(); });
  const st = ready ? await CONS.vectorStatus(ws).catch(() => ({})) : {};
  const prog = el('span', 'small muted');
  const build = el('button', { class: 'btn sm ghost', disabled: !ready, onclick: async () => {
    build.disabled = true;
    try {
      for (const s of CONS.SOURCES) { prog.textContent = tr(s.label) + '…'; await CONS.buildVectors(s.id, ws, (d, t) => { prog.textContent = `${tr(s.label)} ${d}/${t}`; }); }
      toast(tr('Vector index built'));
    } catch (err) { toast(String(err.message || err), 'bad'); }
    rerender();
  } }, 'Build the vector index');
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Virtual consultant — retrieval'),
    el('p', null, 'How the consultant finds the passages it sends with a question. ', el('b', null, 'Lexical'), ' ranks passages by the words they share with the question, on this computer, with no model at all. ',
      el('b', null, 'Hybrid'), ' adds the ranking of an embedding model — a ', el('b', null, 'local'), ' one only: Ollama (/api/embeddings) or a local OpenAI-compatible endpoint (/embeddings). Remote providers never embed; the helper refuses them.'),
    el('div', 'grid g3', field('Embedding provider (this installation)', prov, 'Providers on this machine only.'), field('Embedding model', model, 'Changing it clears the vector index.'), el('div', { style: { alignSelf: 'end' } }, save)),
    el('div', 'grid g2', { style: { marginTop: '8px' } }, field('Retrieval for this workspace', mode, ready ? 'Hybrid uses the vectors built below; sources without vectors stay lexical.' : 'Hybrid is available once a local embedding model is configured above.')),
    ready ? el('div', null, el('div', 'small muted', { style: { margin: '8px 0 4px' } }, tr('Vector index') + ' — ' + e.model + ': ',
      ...CONS.SOURCES.flatMap((s, i) => [i ? ' · ' : '', `${tr(s.label)} ${st[s.id]?.count || 0}`])), el('div', 'btnrow', build, prog)) : null,
    el('p', 'note', 'The consultant’s route — local model by default — is the “Virtual consultant” row of the table above. The help chatbot (“?”) answers from the built-in help only; its “Ask the Virtual consultant” button hands the question over.')));
}
