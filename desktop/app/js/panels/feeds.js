/* Threat feeds & social (1.4.0) — current threat information from AlienVault OTX, abuse.ch (ThreatFox,
   MalwareBazaar, URLhaus, Feodo Tracker), SANS ISC, advisories and news, and social media (X, Mastodon,
   Bluesky, Reddit), downloaded in bulk by the local helper or the Claude scheduled task (crg_feeds.py),
   parsed and matched against the workspace HERE. IOC watch list with CSV and STIX 2.1 export.
   Feed items are evidence for the analyst: they never change a risk score (Threat Evidence Ladder).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, kpi, card, pill, chip, select, toast, table, banner, download, toCSV, today, field, go, debounce } from '../util.js';
import { S, touch, scen } from '../state.js';
import * as store from '../store.js';
import { HS, probe, apiJson, post, loadConfig } from '../helper.js';
import { parse, profileTerms, relevance, stixBundle } from '../feedparse.js';
import * as TR from '../triage.js';
import * as AI from '../ai.js';
import { copyText } from '../util.js';

const CATALOGUE = () => (HS.sources.length ? HS.sources : (self.CRG_SOURCES || []));
let view = 'triage', cache = null, poll = null;
let tri = null, brief = null, briefBusy = false;
const triCfg = { days: 7, note: '' };
const loadedJobs = new Set();
const flt = { q: '', src: 'all', type: 'all', min: 1 };

async function loadCache() { if (!cache) cache = (await store.get('blob', 'feeds:items')) || { bySrc: {} }; return cache; }
const allItems = () => Object.values(cache?.bySrc || {}).flatMap(x => x.items || []);
const srcMeta = id => CATALOGUE().find(s => s.id === id) || { id, name: id, category: '' };

export async function render(sec) {
  sec.replaceChildren(el('h1', null, 'Threat feeds & social'), el('p', 'lede', 'Current threat information from intelligence feeds, advisories, news and social media, matched against this organization\'s assets, technologies, registered CVEs and scenario techniques. Sources are downloaded in full by the local helper or by the Claude scheduled task — never queried with your own identifiers — and matched on this computer.'));
  sec.append(banner('warn', 'Evidence, not scores', 'Feed and social items never change Pb(A), Pb(ψ,A) or any other parameter. Use them to brief, to check exposure and to update the vulnerability register; scores move only through Threat context, with exposure confirmed (Threat Evidence Ladder).'));
  await Promise.all([loadCache(), loadConfig()]);
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  const items = allItems();
  for (const [k, t] of [['triage', 'Triage & briefing'], ['relevant', 'Relevant to this organization'], ['all', `All items (${items.length})`], ['iocs', `IOC watch list (${(S.ws.iocWatch || []).length})`], ['sources', 'Sources & downloads']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  if (view === 'sources') return sources(body, sec);
  if (view === 'iocs') return iocs(body, sec);
  if (view === 'triage') return triageView(body, sec, items);
  return list(body, sec, view === 'relevant');
}

/* ---------------- items ---------------- */
function list(body, sec, relevantOnly) {
  const ws = S.ws;
  const terms = profileTerms(ws, HS.config);
  const items = allItems().map(it => Object.assign({}, it, { rel: relevance(it, terms) }));
  if (!items.length) { body.append(card(el('div', 'empty-state', el('b', null, 'No feed loaded yet'), 'Open Sources & downloads to download and load the feeds of your list.', el('div', { style: { marginTop: '12px' } }, el('button', { class: 'btn', onclick: () => { view = 'sources'; render(sec); } }, 'Sources & downloads'))))); return; }
  const srcs = [...new Set(items.map(i => i.src))];
  const q = el('input', { placeholder: 'Search title, text, malware, actor, CVE, technique…', value: flt.q });
  const srcSel = select([['all', 'All sources'], ...srcs.map(s => [s, srcMeta(s).name])], flt.src);
  const typeSel = select([['all', 'All types'], ['pulse', 'Intelligence pulses'], ['ioc', 'Indicators (IOCs)'], ['advisory', 'Advisories'], ['news', 'News'], ['post', 'Social posts'], ['victim', 'Ransomware victims'], ['stat', 'Statistics']], flt.type);
  const minSel = select([[1, 'Score ≥ 1'], [3, 'Score ≥ 3'], [5, 'Score ≥ 5']], flt.min);
  const wrap = el('div', 'tablewrap'), count = el('div', 'selcount');
  const shown = () => items.filter(i => (!relevantOnly || i.rel.score >= flt.min) && (flt.src === 'all' || i.src === flt.src) && (flt.type === 'all' || i.type === flt.type)
    && (!flt.q || [i.title, i.text, i.malware, i.actor, i.cves.join(' '), i.attack.join(' '), i.tags.join(' ')].join(' ').toLowerCase().includes(flt.q.toLowerCase())));
  const cols = [
    { key: 'rel', label: 'Score', num: true, render: i => el('span', { title: i.rel.why.join('\n') || 'no match' }, i.rel.score ? pill(String(i.rel.score), i.rel.score >= 5 ? 'bad' : i.rel.score >= 3 ? 'warn' : '') : '·'), sort: i => i.rel.score },
    { key: 'date', label: 'Date', cls: 'mono' },
    { key: 'src', label: 'Source', render: i => el('span', 'small', srcMeta(i.src).name.split(' — ')[0]) },
    { key: 'title', label: 'Item', render: i => el('div', null, i.url ? el('a', { href: i.url, target: '_blank', rel: 'noopener noreferrer' }, i.title || '(untitled)') : i.title,
      i.text ? el('div', 'small muted', i.text.length > 220 ? i.text.slice(0, 218) + '…' : i.text) : null,
      el('div', 'chips', { style: { marginTop: '4px' } }, ...i.cves.slice(0, 5).map(c => chip(c, { kind: ws.vulns.some(v => v.id === c) ? 'k' : 'v', href: '#/vulns/' + c })), ...i.attack.slice(0, 5).map(t => chip(t, { kind: 't', href: '#/threats/' + t })),
        i.malware ? chip(i.malware) : null, i.actor ? chip(i.actor) : null),
      i.rel.why.length ? el('div', 'small', { style: { color: 'var(--accent)', marginTop: '3px' } }, '↳ ' + i.rel.why.slice(0, 3).join(' · ')) : null) },
    { key: 'act', label: '', sortable: false, render: i => actions(i, sec) },
  ];
  const t = table(cols, shown(), { class: 'compact', sortKey: relevantOnly ? 'rel' : 'date', sortDir: -1 });
  const upd = () => { const r = shown(); t.redraw(r); count.textContent = `${r.length} of ${items.length} items`; };
  q.addEventListener('input', debounce(() => { flt.q = q.value; upd(); }, 200));
  for (const [c, k] of [[srcSel, 'src'], [typeSel, 'type'], [minSel, 'min']]) c.addEventListener('change', () => { flt[k] = k === 'min' ? +c.value : c.value; upd(); });
  wrap.append(t); upd();
  const rel = items.filter(i => i.rel.score >= 3);
  body.append(el('div', 'grid g5',
    kpi('Items loaded', n0(items.length), `${srcs.length} source(s)`),
    kpi('Relevant (score ≥ 3)', n0(rel.length), 'matched to this workspace', rel.length ? 'warn' : ''),
    kpi('Registered CVEs mentioned', n0(new Set(items.flatMap(i => i.cves).filter(c => ws.vulns.some(v => v.id === c))).size), 'see chips in red', ''),
    kpi('Scenario techniques seen', n0(new Set(items.flatMap(i => i.attack).filter(a => ws.assessment.SCEN.some(s => (s.attack || []).includes(a)))).size), 'ATT&CK IDs in items'),
    kpi('Match terms', n0(terms.length), 'assets, technologies, CVEs, techniques, sector')));
  body.append(card(el('div', 'filterbar', el('div', 'grow', q), el('div', null, srcSel), el('div', null, typeSel), relevantOnly ? el('div', null, minSel) : null, count), wrap,
    el('p', 'note', relevantOnly ? 'Score = sum of the weights of the matched terms (hover a score for the reasons). Terms come from the assets, the organization profile, the CVE register (exposed CVEs weigh most), scenario techniques, sector, region, Settings → watch terms and the IOC watch list.' : 'Every item of the loaded files.')));
  body.append(el('details', 'card', el('summary', null, `Match terms used for this workspace (${terms.length})`),
    el('div', 'chips', ...terms.sort((a, b) => b.w - a.w).map(x => chip(`${x.term} · ${x.w}`, { title: x.why }))),
    el('p', 'note', 'Add assets with vendor and product in Information assets, or watch terms in Settings, to sharpen the matching.')));
}

function actions(i, sec) {
  const ws = S.ws;
  const menu = select([['', 'Act…'], ...(i.iocs.length ? [['ioc', `Watch ${i.iocs.length} IOC(s)`]] : []), ...(i.cves.some(c => !ws.vulns.some(v => v.id === c)) ? [['cve', 'Add CVE(s) to register (unconfirmed)']] : []),
    ...ws.assessment.SCEN.map(s => ['s:' + s.id, `Attach to ${s.id} as intel note`])], '');
  menu.addEventListener('change', () => {
    const v = menu.value; menu.value = '';
    if (v === 'ioc') { let n = 0; for (const x of i.iocs) if (!ws.iocWatch.some(w => w.value === x.value)) { ws.iocWatch.push({ type: x.type, value: x.value, malware: i.malware, src: i.src, ref: i.url, added: today(), note: i.title.slice(0, 120), status: 'watch' }); n++; } touch(); toast(n + ' IOC(s) on the watch list'); }
    else if (v === 'cve') { let n = 0; for (const c of i.cves) if (!ws.vulns.some(x => x.id === c)) { ws.vulns.push({ id: c, kind: 'CVE', title: '', product: '', asset: '', exposed: false, source: 'Feed: ' + srcMeta(i.src).name, added: today(), cwe: [], notes: 'Mentioned in ' + (i.url || i.title) + ' — confirm exposure' }); n++; } touch(); toast(n + ' CVE(s) added — confirm exposure in Vulnerabilities'); }
    else if (v.startsWith('s:')) { const s = scen(v.slice(2)); (s.intel ||= []).push({ date: today(), src: srcMeta(i.src).name, title: i.title, url: i.url, note: 'Informational — does not change parameters' }); touch(); toast('Attached to ' + s.id); }
  });
  return menu;
}

/* ---------------- IOC watch list ---------------- */
function iocs(body, sec) {
  const ws = S.ws, W = ws.iocWatch;
  const all = allItems();
  const seen = v => all.filter(i => i.iocs.some(x => x.value === v));
  const addIn = el('input', { placeholder: 'Add an indicator — IP, domain, URL or SHA-256' });
  const add = () => { const v = addIn.value.trim(); if (!v) return; const type = /^[a-f0-9]{64}$/i.test(v) ? 'sha256' : /^https?:\/\//.test(v) ? 'url' : /^\d+\.\d+\.\d+\.\d+(:\d+)?$/.test(v) ? (v.includes(':') ? 'ip:port' : 'ipv4') : 'domain';
    if (!W.some(w => w.value === v)) W.push({ type, value: v, src: 'analyst', added: today(), status: 'watch', note: '' }); addIn.value = ''; touch(); render(sec); };
  addIn.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  body.append(card(el('div', 'row', el('div', { style: { flex: 1 } }, field('Add indicator', addIn)), el('button', { class: 'btn', onclick: add }, 'Add'),
      el('button', { class: 'btn ghost', disabled: !W.length, onclick: () => download(`crg-ioc-watch-${today()}.csv`, toCSV([['type', 'value', 'malware', 'source', 'reference', 'added', 'status', 'note'], ...W.map(w => [w.type, w.value, w.malware || '', w.src, w.ref || '', w.added, w.status, w.note || ''])]), 'text/csv') }, 'Export CSV'),
      el('button', { class: 'btn ghost', disabled: !W.length, onclick: () => download(`crg-ioc-watch-${today()}.stix.json`, JSON.stringify(stixBundle(W), null, 1), 'application/json') }, 'Export STIX 2.1')),
    W.length ? el('div', 'tablewrap', { style: { marginTop: '12px' } }, table([
      { key: 'type', label: 'Type' }, { key: 'value', label: 'Indicator', cls: 'mono' }, { key: 'malware', label: 'Malware / note', render: w => w.malware || w.note || '' },
      { key: 'src', label: 'Source' }, { key: 'added', label: 'Added', cls: 'mono' },
      { key: 'seen', label: 'In loaded feeds', num: true, render: w => n0(seen(w.value).length), sort: w => seen(w.value).length },
      { key: 'status', label: 'Status', render: w => { const s = select([['watch', 'Watching'], ['blocked', 'Blocked'], ['hunted', 'Hunted — not found'], ['found', 'Found in telemetry'], ['retired', 'Retired']], w.status); s.addEventListener('change', () => { w.status = s.value; touch(); }); return s; } },
      { key: 'x', label: '', sortable: false, render: w => el('button', { class: 'btn sm ghost danger', onclick: () => { W.splice(W.indexOf(w), 1); touch(); render(sec); } }, '×') },
    ], W, { class: 'compact' })) : el('div', 'empty-state', el('b', null, 'Watch list empty'), 'Add indicators from feed items (Act… → Watch IOCs) or by hand.'),
    el('p', 'note', 'Export to your firewall, SIEM or EDR for blocking and hunting. Status “Found in telemetry” is the correlation the Threat Evidence Ladder requires before intelligence about these indicators can inform Pb(ψ,A) — record that as an incident or threat-basis entry, not here.')));
}

/* ---------------- sources & downloads ---------------- */
async function sources(body, sec) {
  await probe(true);
  const cat = CATALOGUE();
  const accepted = cat.filter(s => (HS.config?.sources?.[s.id]?.status || s.status) === 'accepted');
  const state = HS.helper ? await apiJson('/api/feeds/state').catch(() => ({ state: {}, latest: {} })) : { state: {}, latest: {} };
  if (HS.helper) body.append(banner('good', 'Download helper connected', `Feeds folder: ${HS.helper.feeds_dir}. Downloads by the helper and by the Claude scheduled task land in the same place.`));
  else body.append(banner('warn', 'Download helper not running', 'Start the app with its launcher to download feeds from here and to load what the scheduled task downloaded. Without it, load files by hand below.'));
  const jobBox = el('div');
  const ticks = new Set(accepted.filter(s => s.enabled !== false).map(s => s.id));
  const rows = accepted.map(s => Object.assign({}, s, { st: state.state?.[s.id] || {}, latest: state.latest?.[s.id], loaded: cache.bySrc[s.id] }));
  const keyOk = s => !s.key_required || HS.keys.includes(s.key);
  const t = table([
    { key: 'sel', label: '', sortable: false, cls: 'cb', render: s => { const b = el('input', { type: 'checkbox', checked: ticks.has(s.id) }); b.addEventListener('change', () => b.checked ? ticks.add(s.id) : ticks.delete(s.id)); return b; } },
    { key: 'name', label: 'Source', render: s => el('div', null, el('b', null, s.name), el('div', 'small muted', `${s.category} · every ${s.freq} · ${(s.domains || []).join(', ')}`)) },
    { key: 'key', label: 'Key', render: s => !s.key_required ? 'none' : keyOk(s) ? pill('stored', 'good') : pill('missing', 'warn') },
    { key: 'last', label: 'Last download', render: s => s.st.last_ok ? el('div', null, s.st.last_ok.replace('T', ' '), el('div', 'small muted', `${s.st.items ?? '?'} items`)) : '—' },
    { key: 'status', label: 'Status', render: s => s.st.status ? el('span', { title: s.st.message || '' }, pill(s.st.status, s.st.status === 'ok' ? 'good' : s.st.status === 'error' ? 'bad' : 'warn'), s.st.message ? el('div', 'small muted', s.st.message.slice(0, 120)) : null) : '—' },
    { key: 'loaded', label: 'Loaded here', render: s => s.loaded ? `${s.loaded.items.length} · ${s.loaded.loaded}` : '—' },
  ], rows, { class: 'compact' });
  const run = async (ids) => {
    if (!HS.helper) return toast('Start the app with its launcher to download', 'bad');
    try { await post('/api/download', { source: 'feeds', params: { sources: ids } }); toast('Download started'); watch(jobBox, sec, true); } catch (e) { toast(e.message, 'bad'); }
  };
  body.append(card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, `Your sources (${accepted.length})`),
      el('button', { class: 'btn sm ghost', onclick: () => go('settings/sources') }, 'Manage sources, keys and schedule…')),
    el('div', 'tablewrap', { style: { marginTop: '10px' } }, t),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', disabled: !HS.helper, onclick: () => run([...ticks]) }, 'Download ticked now'),
      el('button', { class: 'btn ghost', disabled: !HS.helper, onclick: async () => { const n = await loadLatest(accepted.map(s => s.id)); toast(n + ' source file(s) loaded'); render(sec); } }, 'Load latest files'),
      el('button', { class: 'btn ghost', onclick: async () => { cache = { bySrc: {} }; await store.put('blob', 'feeds:items', cache); render(sec); } }, 'Clear loaded items')),
    jobBox,
    el('p', 'note', 'Only sources in your accepted list are downloaded. Sources needing a key are skipped until the key is stored (Settings → Sources). If a download fails with “blocked by the egress allowlist”, add the domain shown in Settings → Network to your organization\'s allowlist.')));
  // manual load
  const srcSel = select(cat.map(s => [s.id, s.name]), accepted[0]?.id || cat[0]?.id);
  const fileIn = el('input', { type: 'file', multiple: true, accept: '.json,.xml,.rss,.atom,.txt' });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Load a downloaded file by hand'),
    el('p', 'note', 'For files downloaded with a browser, received from a colleague, or copied from the Drive Feeds folder. Choose the source the file comes from.'),
    el('div', 'grid g2', field('Source', srcSel), field('File(s)', fileIn)),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: async () => {
      let n = 0;
      for (const f of fileIn.files) { try { const s = srcMeta(srcSel.value); const its = parse(s.id, await f.text(), { cat: s.category, fmt: s.format }); cache.bySrc[s.id] = { loaded: today(), file: f.name, items: its }; n += its.length; } catch (e) { toast(f.name + ': ' + e.message, 'bad'); } }
      await store.put('blob', 'feeds:items', cache); toast(n + ' items loaded'); render(sec);
    } }, 'Load'))));
  if (HS.helper) watch(jobBox, sec);
}
async function loadLatest(ids) {
  let n = 0;
  const have = (await apiJson('/api/feeds/state').catch(() => ({ latest: {} }))).latest || {};
  for (const id of ids.filter(i => have[i])) {
    try {
      const r = await fetch('/api/feeds/latest/' + id, { headers: { 'X-CRG': '1' }, cache: 'no-store' }); if (!r.ok) continue;
      const s = srcMeta(id); const its = parse(id, await r.text(), { cat: s.category, fmt: s.format });
      cache.bySrc[id] = { loaded: today(), file: 'latest', items: its }; n++;
    } catch (e) { console.warn(id, e); }
  }
  await store.put('blob', 'feeds:items', cache);
  return n;
}
async function watch(box, sec, started = false) {
  clearInterval(poll); box._started = started;
  if (!started) { const { jobs } = await apiJson('/api/jobs').catch(() => ({ jobs: [] })); for (const j of jobs) if (j.source === 'feeds' && j.status !== 'running') loadedJobs.add(j.id); }
  const draw = async () => {
    if (!box.isConnected) { clearInterval(poll); return; }
    const { jobs } = await apiJson('/api/jobs').catch(() => ({ jobs: [] }));
    const fj = jobs.filter(j => j.source === 'feeds').slice(0, 3);
    box.replaceChildren(...fj.map(j => el('div', 'opt', { style: { marginTop: '10px' } }, el('b', null, j.status === 'running' ? `Downloading — ${Math.round(j.progress * 100)}%` : j.status === 'done' ? 'Download finished' : j.status),
      el('div', 'small muted', `${j.started.replace('T', ' ')} · ${j.message || ''}`),
      j.results ? el('div', 'chips', { style: { marginTop: '6px' } }, ...j.results.map(r => el('span', { class: 'pill ' + (r.status === 'ok' ? 'good' : r.status === 'error' ? 'bad' : 'warn'), title: r.message || '' }, `${r.id}: ${r.status}${r.items ? ' (' + r.items + ')' : ''}`))) : null)));
    const running = fj.some(j => j.status === 'running');
    if (!running) clearInterval(poll);
    if (!running && fj[0]?.status === 'done' && !loadedJobs.has(fj[0].id)) {
      loadedJobs.add(fj[0].id);
      const ok = (fj[0].results || []).filter(r => r.status === 'ok').map(r => r.id);
      if (ok.length && box._started) { await loadLatest(ok); toast(ok.length + ' source(s) downloaded and loaded'); render(sec); }
    }
  };
  await draw();
  poll = setInterval(draw, 1500);
}

/* ---------------- triage and the weekly briefing (1.5.1) ---------------- */

function triageView(body, sec, items) {
  const ws = S.ws;
  const days = el('input', { type: 'number', min: 1, max: 365, value: triCfg.days, style: { maxWidth: '110px' } });
  days.addEventListener('change', () => { triCfg.days = Math.max(1, Number(days.value) || 7); tri = brief = null; render(sec); });

  body.append(card(
    el('p', 'note', 'Four sources reporting one campaign is one story. This pass merges them, scores each ' +
      'story against this workspace, names the scenarios, assets and registered CVEs it touches, and sorts ' +
      'what needs a decision from what is only worth watching. It runs on this computer and changes nothing.'),
    el('div', 'grid g3', field('Period (days)', days, 'Items dated within this window are considered.'),
      el('div', null, el('label', null, 'Items loaded'), el('div', { style: { paddingTop: '8px' } },
        `${n0(items.length)} from ${new Set(items.map(i => i.src)).size} source(s)`))),
    el('div', 'row', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', disabled: !items.length, onclick: () => {
        const since = new Date(Date.now() - triCfg.days * 864e5).toISOString().slice(0, 10);
        tri = TR.triage(items, ws, HS.config, { since });
        brief = null; render(sec);
      } }, 'Run the triage'),
      HS.helper ? el('button', { class: 'btn ghost', title: 'So the scheduled task can match the same way without reading your workspace',
        onclick: async e => {
          try {
            const prof = TR.profile(ws, HS.config);
            const out = await post('/api/publish', { name: 'triage-profile.json', content: JSON.stringify(prof, null, 1), target: 'briefing' });
            toast(`Profile written — ${prof.technologies.length} technologies, ${prof.cves.length} CVEs, ${prof.techniques.length} techniques`);
            // Say where it landed. The helper writes to its own feeds folder, which is not necessarily
            // the folder the scheduled task works in: when the two differ the task finds no profile and
            // writes no briefing, and nothing on screen would otherwise reveal why.
            const thin = [];
            if (!prof.technologies.length) thin.push('no technologies');
            if (!prof.cves.length) thin.push('no registered CVEs');
            sec.append(banner(thin.length ? 'warn' : 'ok', 'Profile written for the scheduled task',
              el('div', null,
                el('div', null, el('b', null, 'Written to: '), el('code', null, out.path || 'the briefings folder')),
                el('div', { style: { marginTop: '4px' } },
                  `${prof.technologies.length} technologies, ${prof.cves.length} registered CVEs, ` +
                  `${prof.techniques.length} techniques, ${prof.scenarios.length} scenarios, ${prof.terms.length} terms. ` +
                  'No organization name, scenario text or asset names are included.'),
                thin.length ? el('div', { style: { marginTop: '4px' } },
                  `This profile carries ${thin.join(' and ')}, so the task can match only on techniques, sector and region — ` +
                  'nothing can reach "needs a decision", which requires a registered CVE with confirmed exposure, ' +
                  'or a technique and a technology together. Fill the asset inventory and the CVE register, then export again.') : null,
                el('div', 'muted', { style: { marginTop: '4px', fontSize: '12px' } },
                  'The scheduled task must work in this same folder. If it works somewhere else, put this folder\u2019s ' +
                  'path on the first line of feeds-dir.txt beside serve.py and restart the launcher.'))));
          } catch (err) { sec.append(banner('bad', 'The profile could not be written', String(err.message || err))); }
        } }, 'Export the profile for the scheduled task') : null)));

  if (!items.length) {
    body.append(banner('warn', 'No feed items are loaded',
      'Download sources on the Sources & downloads tab, or let the scheduled task do it, then come back.'));
    return;
  }
  if (!tri) return;

  body.append(el('div', 'grid g4',
    kpi('Stories', n0(tri.counts.groups), `${n0(tri.counts.items)} items, ${n0(tri.counts.duplicates)} duplicate report(s) merged`),
    kpi('Needs a decision', n0(tri.counts.act), 'confirmed exposure, or scenario and asset together', tri.counts.act ? 'bad' : 'good'),
    kpi('Worth watching', n0(tri.counts.watch), 'profile match, exposure unconfirmed', tri.counts.watch ? 'warn' : ''),
    kpi('Not relevant', n0(tri.counts.noise), 'kept so the triage can be audited')));

  for (const [key, title, why] of TR.BUCKETS) {
    const rows = tri[key];
    const c = card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, `${title} (${rows.length})`),
      pill(key, key === 'act' ? 'bad' : key === 'watch' ? 'warn' : '')));
    c.append(el('p', 'note', why));
    if (!rows.length) c.append(el('p', 'empty', 'Nothing in this bucket for the period.'));
    else c.append(table([
      { key: 'title', label: 'Story', render: g => el('div', null, el('b', null, g.title),
          el('div', 'small muted', [g.date?.slice(0, 10), g.sources.join(', '), g.cveList.join(', ')].filter(Boolean).join(' · '))) },
      { key: 'reason', label: 'Why it is here', render: g => el('span', 'small', g.reason) },
      { key: 'links', label: 'In this workspace', sortable: false, render: g => el('div', 'chips',
          ...g.link.scenarios.slice(0, 4).map(x => chip(x.id, { href: '#/scenario/' + x.id, title: x.name })),
          ...g.link.assets.slice(0, 4).map(x => chip(x.id, { href: '#/assets', title: x.name })),
          ...g.link.registered.slice(0, 4).map(v => chip(v.id, { href: '#/vulns', kind: v.exposed ? 'bad' : '' }))) },
      { key: 'n', label: 'Reports', num: true, sort: g => g.items.length, render: g => g.items.length },
      { key: 'act', label: '', sortable: false, render: g => {
          const u = g.items.find(i => i.url)?.url;
          return u ? el('a', { href: u, target: '_blank', rel: 'noopener', class: 'small' }, 'Open') : null; } },
    ], rows, { sortable: false }));
    body.append(c);
  }

  /* ---- the briefing ---- */
  const note = el('textarea', { rows: 2, value: triCfg.note,
    placeholder: 'Optional: anything the briefing should mention — "the committee meets Thursday", "we are mid-migration off ESXi"' });
  note.addEventListener('input', () => { triCfg.note = note.value; });
  const bc = card(el('h2', null, 'Weekly briefing'));
  bc.append(el('p', 'note', 'The briefing is written from the triage above, so it is complete whether or not ' +
    'AI is switched on. With AI on, a management section is added that narrates the same facts — it is given ' +
    'the triage result, never the raw feed dump, and it is told not to state a risk figure.'));
  bc.append(field('Note for the briefing', note));
  bc.append(el('div', 'row',
    el('button', { class: 'btn', onclick: () => {
      brief = { text: TR.markdown(tri, ws, { note: triCfg.note }), ai: null }; render(sec);
    } }, 'Write the briefing'),
    AI.enabled(ws) ? el('button', { class: 'btn ghost', disabled: briefBusy, onclick: async e => {
      briefBusy = true; e.target.disabled = true; e.target.textContent = 'Preparing…';
      try {
        const prepared = AI.prepare('briefing', ws, { input: TR.briefingInput(tri, ws), note: triCfg.note });
        if (!confirm(`Send the triage result to ${AI.isLocal(prepared.provider) ? 'the local model' : AI.provider(prepared.provider).label}?\n\n` +
                     `${prepared.bytes} bytes — the summarised triage, not the raw items.\n\n` +
                     'Cancel to see the payload on the AI assistant screen first.')) { briefBusy = false; render(sec); return; }
        const out = await AI.send(prepared, ws);
        brief = { text: TR.markdown(tri, ws, { note: triCfg.note }), ai: out };
      } catch (err) { sec.append(banner('bad', 'The briefing could not be written', String(err.message || err))); }
      briefBusy = false; render(sec);
    } }, 'Write it with an AI management section') : null));
  body.append(bc);

  if (brief) {
    const c = card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, 'Briefing'),
      brief.ai ? pill(brief.ai.model, 'good') : pill('written locally', 'good')));
    if (brief.ai) {
      c.append(el('h4', null, 'Management section'));
      c.append(el('div', { style: { whiteSpace: 'pre-wrap' } }, brief.ai.text));
      c.append(el('p', 'note', AI.MARK + ' The facts below come from the triage; this section narrates them.'));
      c.append(el('div', 'row', ...[['accepted', 'Useful'], ['edited', 'Useful with changes'], ['rejected', 'Not useful']]
        .map(([d, l]) => el('button', { class: 'btn sm ghost', onclick: () => { AI.decide(brief.ai.entryId, d); toast('Recorded in the AI decision log'); } }, l))));
      c.append(el('hr'));
    }
    const ta = el('textarea', { rows: 16, class: 'mono', style: { fontSize: '11.5px' } });
    ta.value = (brief.ai ? '### Management summary\n\n' + brief.ai.text + '\n\n' : '') + brief.text;
    c.append(ta);
    c.append(el('div', 'row', { style: { marginTop: '8px' } },
      el('button', { class: 'btn', onclick: () => download(`crg-briefing-${today()}.md`, ta.value, 'text/markdown') }, 'Download'),
      el('button', { class: 'btn ghost', onclick: e => copyText(ta.value, e.target) }, 'Copy'),
      HS.helper ? el('button', { class: 'btn ghost', onclick: async e => {
        try { await post('/api/publish', { name: `briefing-${today()}.md`, content: ta.value, target: 'briefing' });
              toast('Written to the feeds folder'); }
        catch (err) { sec.append(banner('bad', 'Could not write to the feeds folder', String(err.message || err))); }
      } }, 'Save to the feeds folder') : null));
    body.append(c);
  }
}
