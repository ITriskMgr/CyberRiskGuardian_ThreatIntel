/* Online sources — update CISA KEV, FIRST EPSS and NVD from the internet through the local download helper
   (serve.py, started by the launcher). Files are downloaded IN FULL to ~/Downloads/CyberRiskGuardian-feeds
   in the background; you load them here when they are ready — now or after coming back later.
   Without the helper, the same screen gives the download links and a file picker.
   No organization data ever leaves the computer: the join with the register is done here, locally (C5).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, card, banner, field, select, toast, today, pill, table } from '../util.js';
import { S, touch, setSnapshot } from '../state.js';
import { parseKev, parseEpss, build, KEV_URL, KEV_MIRROR, epssUrl } from '../snapgen.js';

const H = { 'X-CRG': '1' };
let helper = undefined;          // undefined = not probed, null = absent, object = present
let poll = null;
const staged = { kev: null, epss: null, kevName: null, epssName: null };

async function api(path, opts = {}) {
  const r = await fetch(path, Object.assign({ headers: Object.assign({ 'Content-Type': 'application/json' }, H), cache: 'no-store' }, opts));
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r;
}
export async function probe() {
  try { helper = await (await api('/api/helper')).json(); } catch { helper = null; }
  return helper;
}
const keyGet = () => { try { return localStorage.getItem('crg-nvd-key') || ''; } catch { return ''; } };
const keySet = v => { try { v ? localStorage.setItem('crg-nvd-key', v) : localStorage.removeItem('crg-nvd-key'); } catch {} };
const yesterday = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);
const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const mb = b => b >= 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB';

export async function render(body, sec) {
  const ws = S.ws;
  ws.feedLog ||= []; ws.feedState ||= {};
  if (helper === undefined) { body.append(el('div', 'note', 'Looking for the download helper…')); await probe(); body.replaceChildren(); }
  body.append(el('p', 'note', 'Online sources are public catalogues downloaded in full — never queried with your CVEs — and joined with the register on this computer. Downloads run in the background in the launcher window; you can close the browser and load the files later.'));
  if (helper) body.append(banner('good', 'Download helper connected', `Files are saved in ${helper.feeds_dir}. Keep the launcher window open while downloads run.`));
  else body.append(banner('warn', 'Download helper not running', el('span', null, 'The app was not started with its launcher (start.command / start.bat), so it cannot download by itself. Use the links below to download the files with your browser into Downloads, then load them with ', el('b', null, 'Load files from Downloads'), '. Start the app with the launcher to download from here.')));

  const jobsBox = el('div'), filesBox = el('div');
  body.append(requestCard(jobsBox, filesBox, sec));
  if (helper) body.append(el('h2', null, 'Downloads'), jobsBox, el('h2', null, 'Files in Downloads/CyberRiskGuardian-feeds'), filesBox);
  body.append(manualCard(sec), stagedCard(sec), logCard());
  if (helper) { await drawJobs(jobsBox, filesBox, sec); startPolling(jobsBox, filesBox, sec); }
}

/* ---------------- request downloads ---------------- */
function requestCard(jobsBox, filesBox, sec) {
  const ws = S.ws;
  const epssDate = el('input', { type: 'date', value: yesterday(), max: today() });
  const mode = select([['since', 'Records changed since the last update'], ['range', 'Records changed in a date range'], ['full', 'Reload the complete NVD catalogue (long)']], 'since');
  const since = ws.feedState.nvdLast || daysAgo(30);
  const start = el('input', { type: 'date', value: since, max: today() }), end = el('input', { type: 'date', value: today(), max: today() });
  const key = el('input', { type: 'password', value: keyGet(), placeholder: 'optional — speeds NVD up about 10×', autocomplete: 'off' });
  key.addEventListener('change', () => keySet(key.value.trim()));
  const rangeBox = el('div', 'grid g2', field('From (last modified)', start), field('To', end));
  const info = el('div', 'note');
  const upd = () => {
    rangeBox.hidden = mode.value !== 'range';
    info.replaceChildren(mode.value === 'full'
      ? banner('warn', 'Complete reload — this takes time', 'About 300,000 CVE records in 150 requests: roughly 10–20 minutes with an NVD API key, 30–60 minutes or more without, depending on NVD\'s load. Keep the launcher window open; you can close the browser and come back to load the file.')
      : mode.value === 'since' ? `Records modified from ${since}${ws.feedState.nvdLast ? ' (last NVD update)' : ' (no NVD update recorded — 30 days back)'} to today.` : 'Ranges longer than 120 days are split automatically, as NVD requires.');
  };
  mode.addEventListener('change', upd); upd();
  const go = async (source, params) => {
    if (!helper) { toast('Start the app with its launcher to download from here', 'bad'); return; }
    try { await api('/api/download', { method: 'POST', body: JSON.stringify({ source, params }) }); toast('Download started'); await drawJobs(jobsBox, filesBox, sec); startPolling(jobsBox, filesBox, sec); }
    catch (e) { toast('Could not start: ' + e.message, 'bad'); }
  };
  const nvdParams = () => {
    const p = { mode: mode.value === 'full' ? 'full' : 'range', api_key: key.value.trim() || undefined };
    if (mode.value === 'since') { p.start = since; p.end = today(); }
    if (mode.value === 'range') { p.start = start.value; p.end = end.value; }
    return p;
  };
  return card(el('h2', null, 'Update from online sources'),
    el('div', 'grid g3',
      el('div', 'opt', el('h4', null, 'CISA KEV'), el('div', 'small muted', 'Known Exploited Vulnerabilities — the whole catalogue (about 2 MB).'),
        el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', disabled: !helper, onclick: () => go('kev', {}) }, 'Download latest'))),
      el('div', 'opt', el('h4', null, 'FIRST EPSS'), el('div', 'small muted', 'Exploitation probability for every CVE, for one day (about 2 MB compressed). If that day is not published yet, the previous days are tried.'),
        field('Score date', epssDate),
        el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', disabled: !helper, onclick: () => go('epss', { date: epssDate.value }) }, 'Download'))),
      el('div', 'opt', el('h4', null, 'NVD CVE records'), el('div', 'small muted', 'CVSS v4.0 Base vectors, CWE and descriptions, saved in a compact form.'),
        field('What to download', mode), rangeBox, field('NVD API key', key, 'Stored only in this browser on this computer; never written to the downloads folder.'), info,
        el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', disabled: !helper, onclick: () => {
          if (mode.value === 'full' && !window.confirm('Reload the complete NVD catalogue?\n\nIt can take 30–60 minutes or more without an API key. The download continues in the launcher window; you can load the file later from this screen.')) return;
          go('nvd', nvdParams());
        } }, 'Download')))));
}

async function drawJobs(jobsBox, filesBox, sec) {
  let J = [], F = [];
  try { J = (await (await api('/api/jobs')).json()).jobs.filter(j => j.source !== 'feeds'); F = (await (await api('/api/files')).json()).files; }
  catch { jobsBox.replaceChildren(banner('warn', 'Lost contact with the helper', 'Is the launcher window still open?')); return false; }
  const loaded = new Set((S.ws.feedLog || []).map(l => l.file));
  jobsBox.replaceChildren(J.length ? card(table([
    { key: 'source', label: 'Source', render: j => el('b', null, j.source.toUpperCase()) },
    { key: 'params', label: 'Parameters', render: j => Object.entries(j.params || {}).map(([k, v]) => `${k} ${v}`).join(' · ') || 'latest' },
    { key: 'status', label: 'Status', render: j => el('div', null, pill(j.status, j.status === 'done' ? 'good' : j.status === 'running' ? 'warn' : j.status === 'error' ? 'bad' : ''),
      j.status === 'running' ? el('progress', { max: 1, value: j.progress || 0, style: { width: '140px', marginLeft: '8px', verticalAlign: 'middle' } }) : null) },
    { key: 'message', label: 'Progress', render: j => el('span', 'small', j.message || '') },
    { key: 'started', label: 'Started', cls: 'mono small', render: j => (j.started || '').replace('T', ' ').slice(0, 16) },
    { key: 'act', label: '', sortable: false, render: j => el('div', 'btnrow',
      j.status === 'running' ? el('button', { class: 'btn sm ghost danger', onclick: async () => { await api(`/api/jobs/${j.id}/cancel`, { method: 'POST', body: '{}' }); drawJobs(jobsBox, filesBox, sec); } }, 'Cancel') : null,
      j.status === 'done' && j.file ? el('button', { class: 'btn sm', onclick: () => loadFromHelper(j.file, sec) }, loaded.has(j.file) ? 'Load again' : 'Load') : null,
      ['interrupted', 'error', 'cancelled'].includes(j.status) ? el('button', { class: 'btn sm ghost', onclick: async () => { const p = Object.assign({}, j.params); if (j.source === 'nvd') p.api_key = keyGet() || undefined; await api('/api/download', { method: 'POST', body: JSON.stringify({ source: j.source, params: p }) }); drawJobs(jobsBox, filesBox, sec); } }, 'Restart') : null,
      j.status !== 'running' ? el('button', { class: 'btn sm ghost', title: 'Remove from this list (the file stays)', onclick: async () => { await api(`/api/jobs/${j.id}/forget`, { method: 'POST', body: '{}' }); drawJobs(jobsBox, filesBox, sec); } }, '×') : null) },
  ], J, { sortKey: null, class: 'compact' })) : el('p', 'note', 'No download requested yet.'));
  filesBox.replaceChildren(F.length ? card(table([
    { key: 'name', label: 'File', cls: 'mono' }, { key: 'kind', label: 'Source', render: f => f.kind.toUpperCase() },
    { key: 'bytes', label: 'Size', num: true, render: f => mb(f.bytes) }, { key: 'modified', label: 'Downloaded', cls: 'mono small', render: f => f.modified.replace('T', ' ').slice(0, 16) },
    { key: 'st', label: 'In this workspace', render: f => loaded.has(f.name) ? pill('loaded', 'good') : el('span', 'muted small', 'not loaded') },
    { key: 'act', label: '', sortable: false, render: f => f.kind === 'other' ? '' : el('button', { class: 'btn sm', onclick: () => loadFromHelper(f.name, sec) }, loaded.has(f.name) ? 'Load again' : 'Load') },
  ], F, { sortKey: 'modified', sortDir: -1, class: 'compact' })) : el('p', 'note', 'No file downloaded yet.'));
  return J.some(j => j.status === 'running');
}

function startPolling(jobsBox, filesBox, sec) {
  clearInterval(poll);
  poll = setInterval(async () => {
    if (sec.hidden || !document.body.contains(jobsBox)) { clearInterval(poll); return; }
    const running = await drawJobs(jobsBox, filesBox, sec);
    if (!running) clearInterval(poll);
  }, 2500);
}

/* ---------------- manual route ---------------- */
function manualCard(sec) {
  const d = el('details', 'card'); if (!helper) d.open = true;
  const fileIn = el('input', { type: 'file', multiple: true, accept: '.json,.gz,.csv' });
  const out = el('div');
  fileIn.addEventListener('change', async () => { out.replaceChildren(); for (const f of fileIn.files) await loadFile(f, f.name, sec, out); fileIn.value = ''; });
  const day = yesterday();
  d.append(el('summary', null, 'Load files from Downloads (or download them with your browser)'),
    el('p', 'small', 'If a download finished while the app was closed, or you downloaded the files yourself, load them here. They are recognized by content: KEV JSON, EPSS CSV (.csv or .csv.gz), NVD JSON (API responses, JSON 2.0 feed files .json/.json.gz, or the helper\'s compact files).'),
    field('<b>Files</b>', fileIn), out,
    el('hr', 'sep'),
    el('div', 'small', el('b', null, 'Direct links, if you download with the browser:'),
      el('ul', null,
        el('li', null, 'CISA KEV: ', el('a', { href: KEV_URL, target: '_blank', rel: 'noopener' }, 'cisa.gov JSON'), ' · ', el('a', { href: KEV_MIRROR, target: '_blank', rel: 'noopener' }, 'GitHub mirror')),
        el('li', null, 'FIRST EPSS for a date: ', el('a', { href: epssUrl(day), target: '_blank', rel: 'noopener' }, `epss_scores-${day}.csv.gz`), ' (change the date in the address for another day)'),
        el('li', null, 'NVD: the ', el('a', { href: 'https://nvd.nist.gov/vuln/data-feeds', target: '_blank', rel: 'noopener' }, 'NVD data feeds page'), ' publishes JSON 2.0 feed files by year and for recently modified CVEs.'))));
  return d;
}

async function loadFromHelper(name, sec) {
  try {
    toast('Loading ' + name + '…');
    const blob = await (await api('/api/files/' + encodeURIComponent(name))).blob();
    await loadFile(new File([blob], name), name, sec);
  } catch (e) { toast('Could not load ' + name + ': ' + e.message, 'bad'); }
}

async function readText(file) {
  if (/\.gz$/i.test(file.name)) return await new Response(file.stream().pipeThrough(new DecompressionStream('gzip'))).text();
  return await file.text();
}

/** Recognize and load one downloaded file. KEV/EPSS are staged for a snapshot; NVD is joined with the register. */
async function loadFile(file, name, sec, out) {
  const ws = S.ws;
  try {
    if (/epss/i.test(name) || /\.csv(\.gz)?$/i.test(name)) {
      staged.epss = await parseEpss(file); staged.epssName = name;
      log({ source: 'EPSS', file: name, records: staged.epss.count, detail: 'score date ' + (staged.epss.score_date || '?') });
      toast(`EPSS ${staged.epss.score_date || ''}: ${n0(staged.epss.count)} scores staged`);
    } else {
      const text = await readText(file);
      const j = JSON.parse(text);
      if (Array.isArray(j.vulnerabilities) && j.vulnerabilities[0]?.cveID !== undefined || j.catalogVersion) {
        staged.kev = await parseKev(new File([text], name.replace(/\.gz$/, ''))); staged.kevName = name;
        log({ source: 'KEV', file: name, records: staged.kev.count, detail: 'catalogue ' + staged.kev.catalog_version });
        toast(`KEV ${staged.kev.catalog_version}: ${n0(staged.kev.count)} entries staged`);
      } else if (j.schema === 'crg-nvd-compact/1' || Array.isArray(j.vulnerabilities)) {
        const recs = j.records || j.vulnerabilities.map(compactFromApi);
        const r = joinNvd(recs);
        const range = j.range ? `${j.range.start} → ${j.range.end}` : j.mode === 'full' ? 'complete catalogue' : 'file';
        log({ source: 'NVD', file: name, records: recs.length, detail: `${range}; ${r.matched} register CVE(s) updated` });
        if (j.range?.end || j.mode === 'full') ws.feedState.nvdLast = j.range?.end || j.retrieved || today();
        touch('redraw');
        toast(`NVD: ${n0(recs.length)} records read, ${r.matched} register CVE(s) updated`);
      } else throw new Error('not a KEV, EPSS or NVD file');
    }
    touch();
  } catch (e) {
    const msg = banner('bad', 'Could not load ' + name, String(e.message || e));
    if (out) out.append(msg); else toast('Could not load ' + name + ': ' + e.message, 'bad');
  }
  if (!sec.hidden) sec.dispatchEvent(new CustomEvent('online-redraw'));
}

function compactFromApi(it) {
  const c = it.cve || it;
  const m = c.metrics || {};
  const v4 = (m.cvssMetricV40 || [])[0]?.cvssData;
  return { id: c.id, desc: ((c.descriptions || []).find(d => d.lang === 'en')?.value || '').slice(0, 400), lastModified: (c.lastModified || '').slice(0, 10),
    cvss4: v4 ? { vector: v4.vectorString, score: v4.baseScore } : null, cvss31: (m.cvssMetricV31 || [])[0]?.cvssData?.baseScore ?? null,
    cwe: [...new Set((c.weaknesses || []).flatMap(w => w.description || []).map(d => d.value).filter(x => /^CWE-\d+$/.test(x)))] };
}

/** Local join: enrich register CVEs only. Nothing about the register is sent anywhere. */
function joinNvd(recs) {
  const V = S.ws.vulns, idx = new Map(V.map(v => [v.id, v]));
  let matched = 0;
  for (const r of recs) {
    const v = idx.get(r.id); if (!v) continue;
    matched++;
    if (r.desc) v.title = r.desc.slice(0, 300);
    if (r.cvss4?.score != null) { v.cvss = r.cvss4.score; v.cvss_vector = r.cvss4.vector; v.cvss_version = '4.0'; }
    else if (r.cvss31 != null && v.cvss == null) { v.cvss = r.cvss31; v.cvss_version = '3.1 (not v4 — rescore)'; }
    if (r.cwe?.length) v.cwe = [...new Set([...(v.cwe || []), ...r.cwe])];
    v.nvd_updated = r.lastModified || today();
  }
  return { matched };
}

function log(entry) { S.ws.feedLog.push(Object.assign({ date: new Date().toLocaleString('sv').slice(0, 16) }, entry)); }

/* ---------------- staged KEV + EPSS → snapshot ---------------- */
function stagedCard(sec) {
  const cur = S.snap;
  const kevSel = select([...(staged.kev ? [['staged', `Loaded file: ${staged.kevName} (${n0(staged.kev.count)})`]] : []), ...(cur?.kev ? [['current', `Current snapshot: ${cur.kev.catalog_version || cur.retrieved} (${n0(cur.kev.count)})`]] : [])], staged.kev ? 'staged' : 'current');
  const epssSel = select([...(staged.epss ? [['staged', `Loaded file: ${staged.epssName} (${n0(staged.epss.count)})`]] : []), ...(cur?.epss ? [['current', `Current snapshot: ${cur.epss.score_date || cur.retrieved} (${n0(cur.epss.count)}${cur.epss.pruned ? ', pruned' : ''})`]] : [])], staged.epss ? 'staged' : 'current');
  const prune = el('input', { type: 'number', value: 0.001, step: 0.001, min: 0, max: 0.049 });
  const days = el('input', { type: 'number', value: 90, min: 1, max: 365 });
  const ok = (staged.kev || cur?.kev) && (staged.epss || cur?.epss);
  return card(el('h2', null, 'Build the threat-context snapshot from loaded files'),
    !staged.kev && !staged.epss ? el('p', 'note', 'Load a KEV and/or an EPSS file above. Each can be combined with the other half of the current snapshot.') : null,
    el('div', 'grid g2', field('<b>KEV from</b>', kevSel), field('<b>EPSS from</b>', epssSel)),
    el('div', 'grid g3', { style: { marginTop: '10px' } }, field('Prune EPSS below', prune, 'KEV CVEs always kept; must be < 0.05'), field('Validity (days)', days)),
    el('div', 'btnrow', { style: { marginTop: '12px' } }, el('button', { class: 'btn', disabled: !ok, onclick: async () => {
      try {
        const kev = kevSel.value === 'staged' ? staged.kev : cur.kev;
        const epss = epssSel.value === 'staged' ? staged.epss : cur.epss;
        const snap = build({ kev, epss, regions: cur?.regions || ['ca', 'intl'], expiryDays: Number(days.value) || 90, prune: Number(prune.value) || null });
        await setSnapshot(snap, 'threat-context-' + snap.retrieved + '.json');
        log({ source: 'Snapshot', file: 'threat-context-' + snap.retrieved + '.json', records: snap.kev.count + snap.epss.count, detail: `KEV ${kev.catalog_version || ''}, EPSS ${epss.score_date || ''}` });
        touch('redraw'); toast('Threat-context snapshot updated');
      } catch (e) { toast('Could not build: ' + e.message, 'bad'); }
    } }, 'Build and use snapshot'),
    el('span', 'small muted', 'Replaces the workspace snapshot; validity restarts at 90 days. Ladder rungs and KEV/EPSS columns update everywhere.')));
}

function logCard() {
  const L = (S.ws.feedLog || []).slice().reverse();
  if (!L.length) return null;
  return card(el('h2', null, 'Update history (this workspace)'), table([
    { key: 'date', label: 'When', cls: 'mono small' }, { key: 'source', label: 'Source' }, { key: 'file', label: 'File', cls: 'mono small' },
    { key: 'records', label: 'Records', num: true, render: l => n0(l.records) }, { key: 'detail', label: 'Detail' },
  ], L, { sortKey: null, class: 'compact' }));
}
