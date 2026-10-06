/* Settings (1.4.0) — every external link and shared folder in one place, the feed-source list (accept,
   reject, frequency, API keys, new sources proposed by the scheduled task), the Claude scheduled task and
   the network domains to allow. Stored in crg-config.json in the feeds folder when the helper runs — the file
   the scheduled task reads — and mirrored in the browser. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, chip, select, toast, table, banner, download, copyText, field, today, kpi } from '../util.js';
import { general, usersView } from './settings_more.js';
import * as settingsAi from './settings_ai.js';
import * as settingsFiles from './settings_files.js';
import { tr } from '../i18n.js';
import { HS, probe, loadConfig, saveConfig, setKey, apiJson, post, DEFAULT_LINKS, LINK_LABEL, LINK_EXAMPLE, LINK_YOURS, DEFAULT_CONFIG, driveId } from '../helper.js';

let view = 'general';
const FREQ = [['hourly', 'Hourly'], ['6h', 'Every 6 hours'], ['12h', 'Every 12 hours'], ['daily', 'Daily'], ['weekly', 'Weekly'], ['manual', 'Manual only']];
const BASE_DOMAINS = [['raw.githubusercontent.com', 'CISA KEV mirror (GitHub)'], ['www.cisa.gov', 'CISA KEV'], ['epss.empiricalsecurity.com', 'FIRST EPSS'], ['services.nvd.nist.gov', 'NVD CVE API']];

const catalogue = () => (HS.catalogue.length ? HS.catalogue : (self.CRG_SOURCES || []));
function allSources() {
  const c = HS.config;
  return [...catalogue(), ...(c.custom_sources || [])].map(s => Object.assign({}, s, c.sources?.[s.id] || {}, { custom: !!(c.custom_sources || []).find(x => x.id === s.id) }));
}

export async function render(sec, arg) {
  if (arg) view = arg;
  if (arg !== undefined || !HS.config) { await probe(true); await loadConfig(); }   // internal redraws keep unsaved edits
  sec.replaceChildren(el('h1', null, 'Settings'), el('p', 'lede', 'External links, shared folders, threat-feed sources, API keys and the Claude scheduled task — in one place. These settings are shared by every workspace.'));
  sec.append(HS.helper ? banner('good', 'Saved in the feeds folder', `crg-config.json in ${HS.feedsDir || HS.helper.feeds_dir} — the same file the scheduled task reads. A copy is kept in this browser.`)
    : banner('warn', 'Helper not running — settings saved in this browser only', 'Start the app with its launcher so the settings are written to the feeds folder, where the scheduled task reads them. API keys can be stored only through the helper.'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['general', 'Language'], ['ai', 'AI — local & remote'], ['users', 'Users & RACI'], ['files', 'Documents & files'], ['links', 'Links & shared folders'], ['sources', 'Feed sources & keys'], ['schedule', 'Scheduled task'], ['network', 'Network allowlist'], ['backup', 'Export / import']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; history.replaceState(null, '', '#/settings/' + k); render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  const rerender = () => render(sec);
  if (view === 'general') return general(body, sec, rerender);
  if (view === 'users') return usersView(body, sec, rerender);
  if (view === 'ai') return settingsAi.render(body, sec, rerender, aiSection);
  if (view === 'files') return settingsFiles.render(body, sec, rerender);
  ({ links, sources, ai: aiSection, schedule, network, backup }[view] || links)(body, sec);
}
const saveBtn = (sec, label = 'Save settings') => el('button', { class: 'btn', onclick: async () => { try { await saveConfig(); toast('Settings saved'); render(sec); } catch (e) { toast(e.message, 'bad'); } } }, label);

/* ---------------- links ---------------- */
/* 1.5.6 — the shared folders are the person's own. They ship empty, so this screen has to say which
   ones are still unset and what each one is for, rather than silently offering someone else's. */
function links(body, sec) {
  const L = HS.config.links;
  const mine = LINK_YOURS.filter(k => !String(L[k] || '').trim());

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Your own folders'),
    el('p', null, 'These folders are yours. The application ships with none of them set, because a shared folder is '
      + 'where your organization or your class keeps things — nobody else can choose it for you. Nothing here is '
      + 'required: the application works offline with none of them.'),
    el('ul', null,
      el('li', null, el('b', null, 'The feeds folder '), 'is on this computer and is the one that matters. Downloads, '
        + 'the weekly briefing and your API keys live there. It is set below.'),
      el('li', null, el('b', null, 'The Google Drive folders '), 'are optional and only needed if you share published '
        + 'registries with colleagues, or let the scheduled task upload the feed digest. Create a folder in your own '
        + 'Drive, copy its address from the browser, and paste it here.'),
      el('li', null, el('b', null, 'The local synced folders '), 'are optional too: if you use Google Drive for '
        + 'desktop, give the path of the synced folder and the application writes there directly instead of waiting '
        + 'for the scheduled task.')),
    mine.length
      ? banner('warn', 'Not set yet', mine.map(k => (LINK_LABEL[k] || [k])[0]).join(' · ')
          + ' — fill in the ones you need, or leave them empty.')
      : banner('good', 'All set', 'Every shared folder has an address.')));

  const rows = Object.keys({ ...DEFAULT_LINKS, ...L }).map(k => {
    const [lab, hint] = LINK_LABEL[k] || [k, ''];
    const value = L[k] ?? '';
    const yours = LINK_YOURS.includes(k);
    const i = el('input', { value, placeholder: LINK_EXAMPLE[k] || DEFAULT_LINKS[k] || '' });
    i.addEventListener('change', () => { L[k] = i.value.trim(); });
    const isUrl = /^https?:/.test(value || DEFAULT_LINKS[k] || '');
    return el('div', 'opt',
      field(`<b>${lab}</b>`, el('div', 'row', { style: { alignItems: 'center', flexWrap: 'nowrap' } }, i,
        isUrl ? el('a', { class: 'btn sm ghost', href: (value || DEFAULT_LINKS[k]).replace('{date}', today()), target: '_blank', rel: 'noopener noreferrer' }, 'Open') : null,
        DEFAULT_LINKS[k] && value !== DEFAULT_LINKS[k] ? el('button', { class: 'btn sm ghost', onclick: () => { L[k] = DEFAULT_LINKS[k]; render(sec); } }, 'Default') : null), hint),
      yours && !String(value).trim() ? el('div', 'small muted', 'Not set — optional.') : null,
      /drive\.google\.com/.test(value) ? el('div', 'small muted', 'Drive folder ID: ', el('span', 'mono', driveId(value))) : null);
  });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'External links and shared folders'), el('div', 'grid g2', ...rows),
    el('div', 'opt', { style: { marginTop: '14px' } }, el('b', null, 'Local feeds folder'), el('div', 'mono small', HS.feedsDir || HS.helper?.feeds_dir || '~/Downloads/CyberRiskGuardian-feeds'),
      el('div', 'small muted', 'Where the helper and the scheduled task save downloads, the weekly briefing and your API keys. '
        + 'To move it, write the folder path on the first line of feeds-dir.txt beside serve.py (or set CRG_FEEDS_DIR) and restart the launcher.')),
    el('div', 'btnrow', { style: { marginTop: '14px' } }, saveBtn(sec))));
}

/* ---------------- every key on this computer, in one place (1.5.6) ----------------
   The cards above and the AI providers each offer Remove for the key they are about. Neither answers
   "what is stored on this machine, and how do I get rid of all of it" — which is what someone asks
   when handing the computer on, and what Reset data's "delete the stored API keys" does. So: one
   list of every name the helper holds, including keys whose source or provider has since been
   removed from the configuration, which would otherwise have no screen at all. */
function storedKeys(sec) {
  const all = allSources();
  const known = new Map();
  for (const s of all) if (s.key) known.set(s.key, [...(known.get(s.key) || []), s.name.split(' — ')[0]]);
  for (const [id, pv] of Object.entries(HS.ai?.providers || {})) known.set(pv.key_name || id, [...(known.get(pv.key_name || id) || []), pv.label || id]);

  if (!HS.helper) {
    return card(el('h2', { style: { marginTop: 0 } }, 'Every key stored on this computer'),
      el('p', 'note', 'The helper is not running, so the keys it holds cannot be listed or removed. Start the app with its launcher.'));
  }
  const rows = HS.keys.map(k => el('div', 'opt',
    el('div', 'row', { style: { alignItems: 'center' } },
      el('b', { style: { flex: 1 }, 'data-noi18n': '' }, k), pill('stored', 'good')),
    el('div', 'small muted', known.has(k) ? 'Used by: ' + [...new Set(known.get(k))].join(', ') : 'Not used by any source or provider in your current configuration.'),
    el('div', 'row', { style: { marginTop: '6px' } },
      el('button', { class: 'btn sm ghost danger', onclick: async () => {
        if (!confirm(tr('Remove the stored key “{0}”? Anything that uses it stops working until you paste it again.').replace('{0}', k))) return;
        await setKey(k, null); await probe(true); toast('Key removed'); render(sec);
      } }, 'Remove'))));

  return card(el('h2', { style: { marginTop: 0 } }, 'Every key stored on this computer'),
    el('p', 'note', 'Every name in crg-keys.json, whatever put it there — a feed source, an AI provider, or something no longer in your configuration. Removing a key here removes it everywhere; nothing else is touched. Reset data can delete all of them in one step as part of a reset.'),
    HS.keys.length ? el('div', 'grid g3', ...rows) : el('p', null, 'No key is stored on this computer.'),
    HS.keys.length ? el('div', 'btnrow', { style: { marginTop: '12px' } },
      el('button', { class: 'btn ghost danger', onclick: async () => {
        if (!confirm(tr('Remove every stored API key ({0})? The feeds, the scheduled task and every remote AI provider stop working until you paste them again.').replace('{0}', String(HS.keys.length)))) return;
        for (const k of [...HS.keys]) { try { await setKey(k, null); } catch { /* reported by the count below */ } }
        await probe(true);
        toast(HS.keys.length ? `${HS.keys.length} key(s) could not be removed` : 'Every key removed', HS.keys.length ? 'bad' : 'good');
        render(sec);
      } }, 'Remove every key')) : null);
}

/* ---------------- sources ---------------- */
function sources(body, sec) {
  const c = HS.config; c.sources ||= {};
  const ov = id => (c.sources[id] ||= {});
  const all = allSources();
  const keyNames = [...new Set(all.filter(s => s.key).map(s => s.key))];
  const keyRows = keyNames.map(k => {
    const users = all.filter(s => s.key === k).map(s => s.name.split(' — ')[0]);
    const i = el('input', { type: 'password', placeholder: HS.keys.includes(k) ? '•••••••• stored — type to replace' : 'paste the key', autocomplete: 'off' });
    return el('div', 'opt', el('div', 'row', { style: { alignItems: 'center' } }, el('b', { style: { flex: 1 } }, k), HS.keys.includes(k) ? pill('stored', 'good') : pill('not stored', 'warn')),
      el('div', 'small muted', 'Used by: ' + [...new Set(users)].join(', ')),
      el('div', 'row', { style: { marginTop: '6px', flexWrap: 'nowrap' } }, i,
        el('button', { class: 'btn sm', disabled: !HS.helper, onclick: async () => { try { await setKey(k, i.value.trim()); toast('Key stored'); render(sec); } catch (e) { toast(e.message, 'bad'); } } }, 'Store'),
        HS.keys.includes(k) ? el('button', { class: 'btn sm ghost danger', onclick: async () => { await setKey(k, null); toast('Key removed'); render(sec); } }, 'Remove') : null));
  });
  const t = table([
    { key: 'name', label: 'Source', render: s => el('div', null, el('b', null, s.name), s.custom ? ' ' : null, s.custom ? pill('custom', '') : null,
      el('div', 'small muted', `${s.provider || ''} · ${s.category} · ${(s.domains || []).join(', ')}`), s.terms ? el('div', 'small muted', s.terms) : null,
      s.homepage ? el('a', { href: s.homepage, target: '_blank', rel: 'noopener noreferrer', class: 'small' }, s.homepage) : null) },
    { key: 'status', label: 'In your list', render: s => { const x = select([['accepted', 'Accepted'], ['proposed', 'Proposed'], ['rejected', 'Rejected']], s.status); x.addEventListener('change', () => { ov(s.id).status = x.value; ov(s.id).enabled = x.value === 'accepted'; render(sec); }); return x; }, sort: s => s.status },
    { key: 'enabled', label: 'Download', render: s => { const b = el('input', { type: 'checkbox', checked: s.status === 'accepted' && s.enabled !== false, disabled: s.status !== 'accepted', style: { width: 'auto' } }); b.addEventListener('change', () => { ov(s.id).enabled = b.checked; }); return b; } },
    { key: 'freq', label: 'Frequency', render: s => { const x = select(FREQ, s.freq); x.addEventListener('change', () => { ov(s.id).freq = x.value; }); return x; } },
    { key: 'key', label: 'Key', render: s => !s.key_required ? 'none' : HS.keys.includes(s.key) ? pill(s.key + ' ✓', 'good') : pill(s.key + ' missing', 'warn') },
    { key: 'x', label: '', sortable: false, render: s => s.custom ? el('button', { class: 'btn sm ghost danger', onclick: () => { c.custom_sources = c.custom_sources.filter(x => x.id !== s.id); delete c.sources[s.id]; render(sec); } }, '×') : '' },
  ], all, { class: 'compact', sortKey: 'status', sortDir: 1 });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Feed and social-media sources'),
    el('p', 'note', 'Accepted sources are in your list and are downloaded by the helper and the scheduled task at their frequency. Proposed sources are suggestions: accept the ones you want. Rejected sources are never downloaded and not proposed again.'),
    el('div', 'tablewrap', t), el('div', 'btnrow', { style: { marginTop: '12px' } }, saveBtn(sec, 'Save sources'))));
  // social
  const q = el('input', { value: c.social.query }); q.addEventListener('change', () => { c.social.query = q.value; });
  const tags = el('input', { value: (c.social.tags || []).join(', ') }); tags.addEventListener('change', () => { c.social.tags = tags.value.split(',').map(x => x.trim().replace(/^#/, '')).filter(Boolean); });
  const watch = el('input', { value: (c.social.watch_terms || []).join(', '), placeholder: 'e.g. MediBec, our EHR vendor, our VPN product' }); watch.addEventListener('change', () => { c.social.watch_terms = watch.value.split(',').map(x => x.trim()).filter(Boolean); });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Social media and matching'),
    el('div', 'grid g2', field('<b>Search query</b> (X, Bluesky)', q, 'X API v2 recent-search syntax. Keep it about threats, not about your organization: queries leave your network.'),
      field('<b>Tags</b> (Mastodon)', tags, 'The first tag is used for the infosec.exchange timeline.'),
      field('<b>Watch terms</b> (matched locally, never sent)', watch, 'Products, suppliers or names that should raise the relevance of an item. Matching happens in the app only.')),
    el('div', 'btnrow', { style: { marginTop: '12px' } }, saveBtn(sec))));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'API keys'),
    el('p', 'note', 'Keys are stored by the helper in crg-keys.json in the feeds folder (readable by your user only) so that the scheduled task can run unattended. They are never written to the workspace, exports or published packages. Free keys: OTX (otx.alienvault.com → settings), abuse.ch (auth.abuse.ch). X requires a paid API plan.'),
    el('div', 'grid g3', ...keyRows)));
  body.append(storedKeys(sec));
  // suggestions + custom
  body.append(suggestions(sec), customForm(sec));
}

function suggestions(sec) {
  const box = card(el('h2', { style: { marginTop: 0 } }, 'New sources proposed by the scheduled task'), el('div', 'small muted', 'Loading…'));
  (async () => {
    const c = HS.config;
    let list = [];
    if (HS.helper) { try { list = (await apiJson('/api/suggested')).sources || []; } catch { /* none */ } }
    const known = new Set([...allSources().map(s => s.id), ...(c.rejected_suggestions || [])]);
    list = list.filter(s => s && s.id && s.url && !known.has(s.id));
    const kids = [];
    if (!HS.helper) kids.push(el('p', 'note', 'Start the helper to see suggestions.'));
    else if (!list.length) kids.push(el('p', 'note', 'No pending suggestion. When “Suggest new sources” is on (Scheduled task tab), the task looks for reputable public feeds relevant to your sector and writes them to suggested-sources.json in the feeds folder; they appear here for you to accept or reject.'));
    for (const s of list) kids.push(el('div', 'opt', { style: { marginBottom: '8px' } }, el('b', null, s.name), el('div', 'small muted', `${s.provider || ''} · ${s.category || ''} · ${s.url}`),
      s.reason ? el('div', 'small', s.reason) : null, s.terms ? el('div', 'small muted', s.terms) : null,
      el('div', 'btnrow', { style: { marginTop: '6px' } },
        el('button', { class: 'btn sm', onclick: async () => { c.custom_sources ||= []; c.custom_sources.push(Object.assign({ format: 'json', freq: 'daily', key: null, key_required: false, domains: [new URL(s.url).hostname] }, s, { status: 'accepted', enabled: true, suggested: today() })); await saveConfig(); toast(s.name + ' added to your list'); render(sec); } }, 'Accept'),
        el('button', { class: 'btn sm ghost', onclick: async () => { c.custom_sources ||= []; c.custom_sources.push(Object.assign({ format: 'json', freq: 'daily' }, s, { status: 'proposed', enabled: false, suggested: today() })); await saveConfig(); render(sec); } }, 'Keep as proposed'),
        el('button', { class: 'btn sm ghost danger', onclick: async () => { (c.rejected_suggestions ||= []).push(s.id); await saveConfig(); render(sec); } }, 'Reject'))));
    box.replaceChildren(el('h2', { style: { marginTop: 0 } }, `New sources proposed by the scheduled task (${list.length})`), ...kids);
  })();
  return box;
}
function customForm(sec) {
  const f = { id: el('input', { placeholder: 'my-source' }), name: el('input', { placeholder: 'Name shown in the app' }), url: el('input', { placeholder: 'https://… ({key}, {query}, {tag}, {since} are filled in)' }),
    fmt: select([['json', 'JSON'], ['rss', 'RSS / Atom']], 'json'), cat: select([['news', 'News'], ['ioc', 'Indicators'], ['intel', 'Intelligence'], ['vuln', 'Vulnerabilities'], ['social', 'Social'], ['stats', 'Statistics']], 'news'),
    freq: select(FREQ, 'daily'), key: el('input', { placeholder: 'key name, if the source needs one (header value {key})' }), hname: el('input', { placeholder: 'header name for the key, e.g. Authorization' }), hval: el('input', { placeholder: 'header value, e.g. Bearer {key}' }) };
  return el('details', 'card', el('summary', null, 'Add a source of your own'),
    el('div', 'grid g3', { style: { marginTop: '10px' } }, field('Identifier', f.id), field('Name', f.name), field('Category', f.cat), el('div', { style: { gridColumn: '1 / -1' } }, field('URL (https only)', f.url)),
      field('Format', f.fmt), field('Frequency', f.freq), field('Key name', f.key), field('Key header', f.hname), field('Header value', f.hval)),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: async () => {
      const id = f.id.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      if (!id || !/^https:\/\//.test(f.url.value.trim())) { toast('Identifier and an https URL are required', 'bad'); return; }
      if (allSources().some(s => s.id === id)) { toast('That identifier exists', 'bad'); return; }
      const s = { id, name: f.name.value || id, provider: 'custom', category: f.cat.value, url: f.url.value.trim(), format: f.fmt.value, freq: f.freq.value, status: 'accepted', enabled: true,
        key: f.key.value.trim() || null, key_required: !!f.key.value.trim(), domains: [new URL(f.url.value.trim()).hostname], headers: f.hname.value ? { [f.hname.value.trim()]: f.hval.value.trim() || '{key}' } : undefined };
      (HS.config.custom_sources ||= []).push(s); await saveConfig(); toast('Source added'); render(sec);
    } }, 'Add source')));
}

/* ---------------- schedule ---------------- */
export function taskPrompt(cfg = HS.config, feedsDir = HS.feedsDir || '~/Downloads/CyberRiskGuardian-feeds') {
  const L = cfg.links || {};
  /* 1.5.6 — the Drive folders are the analyst's own and may be unset. An unset folder must produce an
     instruction the task can obey ("skip this step"), never a sentence with an empty address in it. */
  const where = k => {
    const url = String(L[k] || DEFAULT_CONFIG.links[k] || '').trim();
    return url ? `${url} (folder id ${driveId(url)})` : 'NOT CONFIGURED — skip this step and say so in the report';
  };
  return `CyberRiskGuardian threat-feed download (scheduled task).

Work only in the CyberRiskGuardian feeds folder on my computer: ${feedsDir} (shell on my computer, files stay there).
1. Read crg-config.json. If schedule.paused is true, stop and report "paused".
2. Run: python3 bin/crg_feeds.py --dir "<feeds folder>" --due --json   (stdlib only; it downloads only the sources I accepted, at their frequency, using crg-keys.json for keys).
3. Read feeds-digest.json. For each source report ok / skipped / error with its message. If errors mention blocked domains or name resolution, list the domains I must add to the organization egress allowlist (Admin settings → Capabilities).
4. If schedule.upload_digest_to_drive is true: upload feeds-digest.json, and a short Markdown summary you write (feeds-summary-YYYY-MM-DD.md: counts per source, the most notable items — new KEV/CVE mentions, ransomware activity against my sector, OTX pulses for my region — with links) to the Google Drive Feeds folder ${where('drive_feeds')}. Never upload crg-keys.json or the raw feed files.
5. If schedule.upload_outbox_to_drive is true and registry-outbox/ contains files: upload each to the Drive registry folder ${where('drive_registry')}, then move it to registry-outbox/sent/. These packages were anonymized in the app; do not modify them.
6. If schedule.suggest_sources is true (at most once a week — check suggested-sources.json "generated"): look for reputable, free or low-cost public threat feeds relevant to my sector and region that are not already in crg-config.json (catalogue, custom_sources, rejected_suggestions). Write up to 3 to suggested-sources.json as {"schema":"crg-suggested-sources/1","generated":ISO date,"sources":[{"id","name","provider","category","url","format","freq","domains","terms","reason"}]}. Do not add them to the configuration: I accept or reject them in the app (Settings → Feed sources).
7. Never change risk scores, workspaces or the app files. Finish with a 5-line status report.`;
}
function schedule(body, sec) {
  const S = HS.config.schedule;
  const cb = (k, label, hint) => { const b = el('input', { type: 'checkbox', checked: !!S[k], style: { width: 'auto' } }); b.addEventListener('change', () => { S[k] = b.checked; }); return el('label', { style: { display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--ink)' } }, b, el('span', null, el('b', null, label), hint ? el('div', 'small muted', hint) : null)); };
  const ret = el('input', { type: 'number', min: 1, max: 365, value: S.retention }); ret.addEventListener('change', () => { S.retention = +ret.value || 14; });
  const name = el('input', { value: S.task_name || '' }); name.addEventListener('change', () => { S.task_name = name.value; });
  const cad = el('input', { value: S.task_cadence || '' }); cad.addEventListener('change', () => { S.task_cadence = cad.value; });
  const tid = el('input', { value: S.trigger_id || '', placeholder: 'trig_… (filled in when Claude creates the task)' }); tid.addEventListener('change', () => { S.trigger_id = tid.value.trim(); });
  const prompt = taskPrompt();
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Claude scheduled task'),
    S.paused ? banner('warn', 'Downloads paused', 'The scheduled task still wakes up but downloads nothing until you resume.') : null,
    el('div', 'grid g2',
      el('div', null, cb('paused', 'Pause scheduled downloads', 'The task checks this flag first. Use it for holidays, or while the network allowlist is being changed.'),
        cb('upload_digest_to_drive', 'Copy the digest and a summary to the Drive Feeds folder', 'Small files only; raw feeds stay on this computer.'),
        cb('upload_outbox_to_drive', 'Upload published registry packages from the outbox to the Drive registry folder'),
        cb('suggest_sources', 'Suggest new sources (at most weekly)', 'Suggestions wait for your decision in Feed sources.')),
      el('div', null, field('Task name', name), field('Cadence (as created in Claude)', cad, 'How often the task wakes up. Each source still follows its own frequency.'), field('Task identifier', tid), field('Dated copies kept per source', ret))),
    el('div', 'btnrow', { style: { marginTop: '12px' } }, saveBtn(sec))),
    card(el('h2', { style: { marginTop: 0 } }, 'Manage the schedule'),
      el('ul', null,
        el('li', null, el('b', null, 'What runs when: '), 'each source\'s frequency (Feed sources) and the Pause switch above — edited here, read by the task at every run.'),
        el('li', null, el('b', null, 'How often the task wakes up, or to stop it: '), 'in Claude, open Scheduled tasks and edit or disable “', S.task_name || 'CyberRiskGuardian threat-feed download', '”, or ask Claude, e.g. “run my CyberRiskGuardian feed task every 12 hours” or “pause it”.'),
        el('li', null, el('b', null, 'Run now: '), 'Threat feeds & social → Sources & downloads → Download ticked now (helper), or ask Claude to run the task now.'),
        el('li', null, el('b', null, 'Where it runs: '), 'on this computer, through the Claude desktop app, in the feeds folder only. The computer must be awake with the Claude desktop app open.')),
      el('details', null, el('summary', null, 'Task instructions (for reference or to re-create it)'), el('textarea', { class: 'mono', readonly: true, style: { minHeight: '260px' } }, prompt),
        el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn sm ghost', onclick: e => copyText(prompt, e.target) }, 'Copy')))));
}

/* ---------------- network ---------------- */
function network(body) {
  const acc = allSources().filter(s => s.status === 'accepted');
  const rows = [...BASE_DOMAINS.map(([d, w]) => ({ d, w })), ...acc.flatMap(s => (s.domains || []).map(d => ({ d, w: s.name })))];
  const uniq = []; for (const r of rows) { const u = uniq.find(x => x.d === r.d); if (u) u.w += ' · ' + r.w; else uniq.push({ ...r }); }
  const list = uniq.map(r => r.d).join('\n');
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Domains to allow'),
    el('p', 'note', 'Downloads run on this computer (helper) or in the Claude desktop app\'s workspace (scheduled task). If your organization restricts Claude\'s network access, the organization owner adds these domains in Claude → Admin settings → Capabilities (network egress allowlist). Until then, the task reports them as blocked and the helper downloads them only if your own network allows it.'),
    table([{ key: 'd', label: 'Domain', cls: 'mono' }, { key: 'w', label: 'Used by' }], uniq, { class: 'compact' }),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: e => copyText(list, e.target) }, 'Copy domain list'))));
}

/* ---------------- export / import ---------------- */
function backup(body, sec) {
  const fileIn = el('input', { type: 'file', accept: '.json', style: { display: 'none' } });
  fileIn.addEventListener('change', async () => {
    try { const j = JSON.parse(await fileIn.files[0].text()); if (j.schema !== 'crg-config/1') throw new Error('Not a crg-config/1 file'); Object.assign(HS.config, j); await saveConfig(); toast('Settings imported'); render(sec); }
    catch (e) { toast(e.message, 'bad'); }
  });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Export or import the settings'),
    el('p', 'note', 'crg-config.json carries links, shared folders, sources, frequencies and the schedule — never API keys. Use it to set up a second computer or to share a source list with your team.'),
    el('div', 'btnrow', el('button', { class: 'btn', onclick: () => download('crg-config.json', JSON.stringify(HS.config, null, 1), 'application/json') }, 'Export crg-config.json'),
      el('button', { class: 'btn ghost', onclick: () => fileIn.click() }, 'Import…'), fileIn,
      el('button', { class: 'btn ghost danger', onclick: async () => { if (!confirm('Reset every setting to its default (keys are kept)?')) return; HS.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); await saveConfig(); render(sec); } }, 'Reset to defaults'))));
}

/* ---------------- AI providers (1.5.5) ----------------
   One card per provider, drawn from the registry the helper reports — nothing about a provider is
   written into this page, so a provider added to the helper (or to crg-config.json as a custom one)
   appears here on its own. Three things are always editable, whatever the provider: the endpoint, the
   model and the key. A published endpoint path or a model name can change after a release, and a
   provider must not become unusable because this build guessed wrong: "List models" is a convenience,
   not the only way in. */
const PROTOCOLS = [['openai', 'OpenAI-compatible (/chat/completions)'], ['anthropic', 'Anthropic messages'], ['azure', 'Azure OpenAI (deployments)']];

async function saveAi(patch) {
  HS.config.ai = Object.assign({}, HS.config.ai, patch);
  await saveConfig(); await probe(true);
}

function providerCard(k, pv, info, sec) {
  const keyName = pv.key_name || (k === 'claude' ? 'anthropic' : 'local_ai');
  const base = info.bases?.[k] || '';
  const model = info.models?.[k] || '';
  const needs = pv.needs || [];
  const c = card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, el('span', { 'data-noi18n': '' }, pv.label)),
    pv.custom ? pill('added here', '') : null,
    pv.local ? pill('stays on this machine', 'good') : pill('leaves this machine', 'warn'),
    info.keys?.[k] ? pill('key stored', 'good') : pill('no key', '')));
  if (pv.note) c.append(el('p', 'note', pv.note));

  /* --- key --- */
  const key = el('input', { type: 'password', autocomplete: 'off',
    placeholder: info.keys?.[k] ? '•••••••• stored — type to replace' : 'paste the key' });
  c.append(el('div', 'row',
    el('div', { style: { flex: 1 } }, field(pv.local ? 'API key (if your endpoint needs one)' : 'API key', key,
      pv.key_url ? el('span', null, 'Keys are stored by the helper in crg-keys.json, mode 600. ',
        el('a', { href: pv.key_url, target: '_blank', rel: 'noopener' }, 'Where to get one')) : 'Stored by the helper in crg-keys.json, mode 600.')),
    el('button', { class: 'btn sm', onclick: async () => {
      try { await setKey(keyName, key.value); key.value = ''; await probe(true); toast('Key stored, mode 600'); render(sec); }
      catch (err) { sec.append(banner('bad', 'The key could not be stored', String(err.message || err))); }
    } }, 'Store'),
    info.keys?.[k] ? el('button', { class: 'btn sm ghost', onclick: async () => {
      if (!confirm('Remove the stored key?')) return;
      await setKey(keyName, ''); await probe(true); toast('Key removed'); render(sec);
    } }, 'Remove') : null));

  /* --- endpoint --- */
  const baseIn = el('input', { type: 'text', value: base, placeholder: pv.base_default || 'https://…' });
  c.append(el('div', 'row', el('div', { style: { flex: 1 } },
    field(pv.protocol === 'azure' ? 'Resource endpoint' : 'Endpoint', baseIn,
      pv.protocol === 'azure' ? 'https://YOUR-RESOURCE.openai.azure.com — without /openai.'
        : pv.local ? 'Anything serving /chat/completions on this machine.'
        : 'Change it only if your organization routes this provider through its own address.')),
    el('button', { class: 'btn sm ghost', onclick: async () => {
      await saveAi({ [k + '_base']: baseIn.value.trim() }); toast('Endpoint saved'); render(sec);
    } }, 'Save')));

  /* --- azure api-version --- */
  if (needs.includes('api_version')) {
    const ver = el('input', { type: 'text', value: info.api_versions?.[k] || '', placeholder: '2024-10-21' });
    c.append(el('div', 'row', el('div', { style: { flex: 1 } },
      field('api-version', ver, 'Copy the value your portal shows for this deployment. Azure refuses a request without it, and the right value is yours, not ours to guess.')),
      el('button', { class: 'btn sm ghost', onclick: async () => {
        await saveAi({ [k + '_api_version']: ver.value.trim() }); toast('api-version saved'); render(sec);
      } }, 'Save')));
  }

  /* --- model: typeable, with the endpoint's own list as a convenience --- */
  const modelIn = el('input', { type: 'text', value: model, placeholder: pv.protocol === 'azure' ? 'your deployment name' : 'model name' });
  const row = el('div', 'row', el('div', { style: { flex: 1 } },
    field(pv.protocol === 'azure' ? 'Deployment (used as the model)' : 'Model', modelIn,
      'Type the name, or ask the endpoint for its list.')),
    el('button', { class: 'btn sm ghost', onclick: async () => {
      await saveAi({ [k + '_model']: modelIn.value.trim() }); toast('Model saved'); render(sec);
    } }, 'Save'));
  row.append(el('button', { class: 'btn sm ghost', onclick: async e => {
    const b = e.target; b.disabled = true; const was = b.textContent; b.textContent = 'Asking the endpoint…';
    try {
      const out = await apiJson('/api/ai/models?provider=' + encodeURIComponent(k));
      if (out.error) throw new Error(out.error);
      const selm = select([['', '— choose —'], ...out.models.map(m => [m.id, m.name])], model);
      selm.addEventListener('change', async () => {
        await saveAi({ [k + '_model']: selm.value }); toast('Model set to ' + selm.value); render(sec);
      });
      row.replaceChildren(el('div', { style: { flex: 1 } },
        field('Model', selm, `${out.models.length} offered by the endpoint itself — nothing is hardcoded.`)));
    } catch (err) {
      b.disabled = false; b.textContent = was;
      c.append(banner('warn', 'The model list could not be read',
        el('div', null, el('div', null, String(err.message || err)),
          el('div', { style: { marginTop: '4px' } }, 'Not every provider offers a list. Type the model name in the field above and save it — that works just as well.'))));
    }
  } }, 'List models'));
  c.append(row);

  /* --- connection test: a few tokens, no workspace data --- */
  const res = el('div', { style: { marginTop: '8px' } });
  c.append(el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn sm', onclick: async e => {
    const b = e.target; b.disabled = true; const was = b.textContent; b.textContent = 'Testing…';
    res.replaceChildren(el('span', 'small muted', 'Sending a test request (no workspace data, a few tokens)…'));
    try {
      const out = await post('/api/ai/test', { provider: k });
      if (out.ok) res.replaceChildren(banner('good', 'Works', `${out.model} answered “${out.reply || '…'}” in ${out.ms} ms through the helper.`));
      else res.replaceChildren(banner('bad', 'The test failed', out.error || 'No answer.'));
    } catch (err) { res.replaceChildren(banner('bad', 'The test failed', String(err.message || err))); }
    b.disabled = false; b.textContent = was;
  } }, 'Test this provider'),
    el('span', 'small muted', pv.local ? 'Checks the endpoint, the chosen model and that it answers.'
      : 'Checks the key, the endpoint and the model, and that this computer can reach the provider.'),
    pv.custom ? el('button', { class: 'btn sm ghost danger', onclick: async () => {
      if (!confirm('Remove this provider? Its stored key is deleted too.')) return;
      const list = (HS.config.ai?.custom || []).filter(x => String(x.id).toLowerCase() !== k);
      await setKey(keyName, '').catch(() => {});
      await saveAi({ custom: list }); toast('Provider removed'); render(sec);
    } }, 'Remove this provider') : null), res);
  return c;
}

async function aiSection(body, sec) {
  if (!HS.helper) {
    body.append(banner('warn', 'The local helper is not running',
      'AI settings live with the helper, because it is the only component that holds a key or makes a ' +
      'model request. Start the app with start.command and this section will connect.'));
    return;
  }
  const info = HS.ai || { providers: {}, keys: {}, models: {}, bases: {} };
  const provs = Object.entries(info.providers);
  const remote = provs.filter(([, v]) => !v.local), local = provs.filter(([, v]) => v.local);
  const ready = provs.filter(([k2, v]) => (info.models?.[k2] || '') && (v.local || info.keys?.[k2])).length;
  body.append(card(el('p', 'note',
    'The browser never calls a model. It posts to the helper on this machine, and the helper makes the ' +
    'request. Keys are written to crg-keys.json beside the feeds, mode 600 — never in crg-config.json, ' +
    'never in a log, and never in a backup.'),
    el('div', 'grid g4', { style: { marginTop: '8px' } },
      kpi('Providers offered', String(provs.length), 'in the registry'),
      kpi('Ready to use', String(ready), 'endpoint, model and key set', ready ? 'good' : 'warn'),
      kpi('On this machine', String(local.length), 'nothing leaves', 'good'),
      kpi('Off this machine', String(remote.length), 'a key is required', remote.length ? 'warn' : 'good'))));

  if (remote.length) body.append(el('h2', { style: { margin: '14px 0 4px' } }, 'Providers off this machine'));
  for (const [k, pv] of remote) body.append(providerCard(k, pv, info, sec));
  if (local.length) body.append(el('h2', { style: { margin: '14px 0 4px' } }, 'Providers on this machine'));
  for (const [k, pv] of local) body.append(providerCard(k, pv, info, sec));

  /* --- add a provider of your own --- */
  const nid = el('input', { type: 'text', placeholder: 'gateway' });
  const nlabel = el('input', { type: 'text', placeholder: 'Our internal AI gateway' });
  const nbase = el('input', { type: 'text', placeholder: 'https://ai.example.internal/v1' });
  const nproto = select(PROTOCOLS, 'openai');
  const nlocal = el('input', { type: 'checkbox', style: { width: 'auto' } });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Add a provider of your own'),
    el('p', 'note', 'For an endpoint inside your organization, or any provider not listed above. Most speak the ' +
      'OpenAI-compatible protocol. Tick “stays on this machine” only when the address really is on this ' +
      'computer: the routing policy trusts that answer when it decides what a feature may send.'),
    el('div', 'grid g2', field('Short id (letters, digits, - and _)', nid), field('Name shown in the lists', nlabel)),
    el('div', 'grid g2', field('Endpoint', nbase, 'Include the version path, for example /v1.'), field('Protocol', nproto)),
    el('label', { style: { display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--ink)', margin: '8px 0' } },
      nlocal, el('span', null, el('b', null, 'Stays on this machine'))),
    el('div', 'btnrow', el('button', { class: 'btn', onclick: async () => {
      const id = nid.value.trim().toLowerCase();
      if (!/^[a-z0-9_-]{1,24}$/.test(id)) { sec.append(banner('bad', 'That id cannot be used', 'Use 1 to 24 letters, digits, hyphens or underscores.')); return; }
      if (info.providers[id]) { sec.append(banner('bad', 'That id is taken', `“${id}” already exists. Choose another.`)); return; }
      if (!nbase.value.trim()) { sec.append(banner('bad', 'An endpoint is needed', 'A provider without an address cannot be called.')); return; }
      const list = [...(HS.config.ai?.custom || []), { id, label: nlabel.value.trim() || id, base: nbase.value.trim(), protocol: nproto.value, local: nlocal.checked }];
      await saveAi({ custom: list }); toast('Provider added'); render(sec);
    } }, 'Add the provider'))));

  body.append(card(el('h2', null, 'What this means for the network statement'),
    el('p', null, 'The application still makes no network request of its own. The helper downloads the public ' +
      'catalogues you accepted and — only when you send an AI request, and only after you have seen ' +
      'the payload — transmits that text to the provider the routes above allow. A local provider keeps ' +
      'even that on this machine.'),
    el('p', 'note', 'Nothing from a workspace is ever sent automatically, by a schedule, or in the background.')));
}
