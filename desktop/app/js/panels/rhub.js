/* Risk Registry (1.5.7) — the shared catalogue of risks.

   Browse & search    the cards this installation has read, filtered by the catalogue dimensions
   Contribute         turn scenarios of this workspace into anonymized cards and share them
   My contributions   what this installation has shared, and withdrawals
   Moderation         approve or reject cards; publish a curated package of the approved ones
   Settings           the shared folder, the contributor alias, the region granularity, validity
   (Publish & share — the 1.4.0 full risk-register package — is the last entry of the same menu.)
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, chip, toast, banner, table, kpi, n0, go, field, select, download, today } from '../util.js';
import { S, touch } from '../state.js';
import * as RH from '../rhub.js';
import * as A from '../anon.js';
import { HS, probe, loadConfig, saveConfig, post, apiJson, link } from '../helper.js';
import { SERIES } from '../version.js';
import { vocabulary } from './ontology.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';

let view = 'browse';
const q = { text: '', sector: '', region: '', size: '', theme: '', asset: '', regulation: '', source: '', attack: '', severity: '', evidence: '', moderated: false, hideStale: false };
const contrib = { picked: new Set(), anon: { ...A.DEFAULT_OPTS }, evidence: 'assessed', cat: null, confirmPlain: false };
let V = null;
const TABS = [['browse', 'Browse & search'], ['contribute', 'Contribute risks'], ['mine', 'My contributions'], ['moderate', 'Moderation'], ['settings', 'Registry settings']];

export async function render(sec, arg) {
  if (TABS.some(t => t[0] === arg)) view = arg;
  await RH.load();
  if (!V) { try { V = await vocabulary(); } catch { V = {}; } }
  sec.replaceChildren(el('h1', null, 'Risk Registry'),
    el('p', 'lede', 'A shared catalogue of cybersecurity risks contributed by several organizations: find the risks of organizations like yours by sector, region, size, regulation, threat theme, asset category, ATT&CK technique or control, and contribute your own — anonymized by default.'),
    banner('warn', 'Beta ' + SERIES, 'The registry is shared through a common folder (Drive, OneDrive, SharePoint) or the helper’s outbox, not a server. Contributions describe other organizations: re-estimate every value for yours.'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of TABS) st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; go('registry/' + k); } }, t));
  st.append(el('button', { role: 'tab', 'aria-selected': 'false', onclick: () => go('share') }, 'Publish & share ↗'));
  const body = el('div'); sec.append(st, body);
  await ({ browse, contribute, mine, moderate, settings }[view])(body, sec);
}

const label = (list, k) => (list || []).find(x => (x.key ?? x[0]) === k)?.label ?? (list || []).find(x => x[0] === k)?.[1] ?? k;
const sel = (opts, v, f, blank = 'Any') => { const s = select([['', blank], ...opts], v); s.addEventListener('change', () => f(s.value)); return s; };
const vOpts = kind => (V?.[kind] || []).map(x => [x.key, x.label]);
const modPill = c => { const m = RH.modState(c); return pill(m === 'approved' ? 'moderated' : m === 'rejected' ? 'rejected' : 'not moderated yet', m === 'approved' ? 'good' : m === 'rejected' ? 'bad' : ''); };

/* ---------------- browse ---------------- */
async function browse(body, sec) {
  const ws = S.ws;
  const redraw = () => { body.replaceChildren(); browse(body, sec); };
  const set = k => v => { q[k] = v; redraw(); };
  const text = el('input', { value: q.text, placeholder: 'Words in the title or the statement' });
  text.addEventListener('change', () => { q.text = text.value; redraw(); });
  const att = el('input', { value: q.attack, placeholder: 'T1566' }); att.addEventListener('change', () => { q.attack = att.value.trim().toUpperCase(); redraw(); });
  const cb = (k, l) => { const c = el('input', { type: 'checkbox', checked: q[k], style: { width: 'auto' } }); c.addEventListener('change', () => { q[k] = c.checked; redraw(); }); return el('label', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, c, el('span', null, l)); };
  const mine = RH.catalogDefaults ? await RH.catalogDefaults(ws) : {};
  const all = Object.values(RH.H.entries);
  body.append(el('div', 'grid g4',
    kpi('Cards in this copy', n0(all.length), `${RH.H.sources.length} package(s) read`),
    kpi('Moderated', n0(all.filter(c => RH.modState(c) === 'approved').length), 'approved by a moderator', 'good'),
    kpi('Like you', n0(all.filter(c => c.catalog?.sector === mine.sector && mine.sector).length), mine.sector ? label(RH.SECTORS, mine.sector) : 'sector not set'),
    kpi('Stale', n0(all.filter(RH.stale).length), 'past their validity date', all.some(RH.stale) ? 'warn' : '')));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Find risks'),
    el('div', 'btnrow', el('button', { class: 'btn', onclick: async e => { e.target.disabled = true; await refresh(); redraw(); } }, 'Read the shared folder'),
      el('label', { class: 'btn ghost', style: { cursor: 'pointer' } }, 'Read package files…', el('input', { type: 'file', accept: '.json', multiple: true, style: { display: 'none' }, onchange: async e => {
        let n = 0; for (const f of e.target.files) { try { n += RH.ingest(JSON.parse(await f.text()), f.name); } catch (err) { toast(f.name + ': ' + err.message, 'bad'); } }
        await RH.save(); toast(`${n} ${tr('new card(s)')}`); redraw(); } })),
      el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => { Object.assign(q, { sector: mine.sector || '', region: (mine.region || '').split('-')[0], size: '' }); redraw(); } }, 'Organizations like mine'),
      el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => { for (const k of Object.keys(q)) q[k] = typeof q[k] === 'boolean' ? false : ''; redraw(); } }, 'Clear the filters')),
    el('div', 'grid g4', { style: { marginTop: '10px' } },
      field('Search', text), field('Industry sector', sel(RH.SECTORS, q.sector, set('sector'))), field('Region', sel(RH.REGIONS.filter(r => r[0]), q.region, set('region'))), field('Size', sel(RH.SIZE_BANDS.filter(r => r[0]), q.size, set('size'))),
      field('Theme', sel(vOpts('theme'), q.theme, set('theme'))), field('Asset category', sel(vOpts('asset_category'), q.asset, set('asset'))),
      field('Regulation', sel(RH.REGULATIONS.map(r => [r, r]), q.regulation, set('regulation'))), field('Threat source', sel(vOpts('threat_source_type'), q.source, set('source'))),
      field('ATT&CK technique', att), field('Severity', sel(RH.SEVERITY, q.severity, set('severity'))), field('Evidence', sel(RH.EVIDENCE, q.evidence, set('evidence'))),
      el('div', null, cb('moderated', 'Moderated cards only'), cb('hideStale', 'Hide stale cards')))));
  const rows = RH.search(q).map(c => ({ c, pick: false }));
  const detail = el('div');
  body.append(card(el('h2', { style: { marginTop: 0 } }, `${rows.length} card(s)`),
    rows.length ? el('div', 'tablewrap', { style: { maxHeight: '60vh', overflow: 'auto' } }, table([
      { key: 'pick', label: '', sortable: false, cls: 'cb', render: x => { const b = el('input', { type: 'checkbox' }); b.addEventListener('change', () => { x.pick = b.checked; }); return b; } },
      { key: 'title', label: 'Risk', render: x => el('div', { 'data-noi18n': '' }, el('b', null, x.c.title), el('div', 'small muted', (x.c.statement || '').slice(0, 180))) },
      { key: 'where', label: 'Sector · region · size', render: x => el('div', 'small', [label(RH.SECTORS, x.c.catalog?.sector), x.c.catalog?.region, label(RH.SIZE_BANDS, x.c.catalog?.size)].filter(Boolean).join(' · ')) },
      { key: 'themes', label: 'Themes', sortable: false, render: x => el('div', 'chips', ...(x.c.catalog?.themes || []).slice(0, 3).map(t => chip(label(V?.theme, t)))) },
      { key: 'sev', label: 'Severity', render: x => x.c.catalog?.severity ? pill(label(RH.SEVERITY, x.c.catalog.severity), { low: 'good', medium: 'warn', high: 'bad', vhigh: 'bad' }[x.c.catalog.severity]) : '—' },
      { key: 'ev', label: 'Evidence', render: x => label(RH.EVIDENCE, x.c.catalog?.evidence)?.split(' — ')[0] || '—' },
      { key: 'mod', label: 'Status', render: x => el('div', null, modPill(x.c), RH.stale(x.c) ? pill('stale', 'warn') : null, x.c.anonymized ? null : pill('not anonymized', 'warn')) },
      { key: 'from', label: 'From', render: x => el('div', { class: 'small', 'data-noi18n': '' }, x.c.contributor || '', el('div', 'muted', x.c.published || '')) },
      { key: 'x', label: '', sortable: false, render: x => el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => showCard(detail, x.c) }, 'Details') },
    ], rows, { class: 'compact' })) : el('div', 'empty-state', el('b', null, 'No card matches'), all.length ? 'Loosen a filter.' : 'Read the shared folder or a package file to fill the catalogue.'),
    rows.length ? el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', onclick: () => {
        const p = rows.filter(x => x.pick); if (!p.length) { toast(tr('Tick at least one card'), 'bad'); return; }
        ws.batchDraft ||= []; for (const x of p) ws.batchDraft.push(RH.toBatchRow(x.c));
        users.audit('registry cards to batch', String(p.length), ws); touch('batch');
        toast(`${p.length} ${tr('card(s) added to the Batch scenarios grid — re-estimate them for this organization')}`, 'good');
      } }, 'Use ticked cards in this workspace'),
      el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => go('batch') }, 'Open Batch scenarios'),
      el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => download(`risk-registry-extract-${today()}.json`, JSON.stringify(RH.pack(rows.map(x => x.c), { kind: 'extract' }), null, 1), 'application/json') }, 'Download these cards')) : null),
    detail);
}

function showCard(box, c) {
  const k = c.catalog || {};
  const line = (l, v) => v && (!Array.isArray(v) || v.length) ? el('div', { style: { margin: '3px 0' } }, el('b', null, l + ': '), el('span', { 'data-noi18n': '' }, Array.isArray(v) ? v.join(', ') : v)) : null;
  box.replaceChildren(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 }, 'data-noi18n': '' }, c.title), modPill(c)),
    el('p', { 'data-noi18n': '' }, c.statement),
    el('div', 'grid g2',
      el('div', null, el('h4', null, 'Causal chain'), line('Threat source', c.chain?.threat_source), line('Event', c.chain?.threat_event), line('Weakness', c.chain?.weakness), line('Assets', c.chain?.assets), line('Consequence', c.chain?.consequence),
        el('h4', null, 'Treatment'), line('Decision', c.treatment?.decision), ...(c.treatment?.measures || []).map(m => el('div', { class: 'small', 'data-noi18n': '' }, `• ${m.name}${m.controls?.length ? ' — ' + m.controls.join(', ') : ''} (rp ${m.rp ?? '–'}, ri ${m.ri ?? '–'})`))),
      el('div', null, el('h4', null, 'Catalogue'), line('Sector', label(RH.SECTORS, k.sector)), line('Sub-sector', k.subsector), line('Region', label(RH.REGIONS, k.region) || k.region), line('Size', label(RH.SIZE_BANDS, k.size)),
        line('Regulations', k.regulations), line('Themes', (k.themes || []).map(t => label(V?.theme, t))), line('Asset categories', (k.asset_categories || []).map(t => label(V?.asset_category, t))),
        line('Threat source', (k.threat_source_types || []).map(t => label(V?.threat_source_type, t))), line('Impact', (k.impact_dimensions || []).map(t => label(V?.impact_dimension, t))),
        line('ATT&CK', k.attack), line('Controls', k.controls), line('Maturity of the contributor', k.maturity), line('Evidence', label(RH.EVIDENCE, k.evidence)), line('Valid until', k.valid_until), line('Ontology', c.crgo))),
    el('h4', null, 'Values of the contributing organization'),
    el('div', 'small mono', Object.entries(c.params || {}).map(([p, v]) => `${p}=${v}`).join('  ') + (c.cvss ? '  ' + c.cvss : '')),
    el('p', 'small muted', 'These values describe the contributor’s organization. Use them as a reference point and re-estimate every one for yours. Analytical estimate — validation required.')));
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Read every package in the shared folder and the outbox. */
async function refresh() {
  await probe(true);
  if (!HS.helper) { toast(tr('Start the app with its launcher to read the shared folder, or read package files by hand.'), 'bad'); return; }
  const r = await apiJson('/api/registry').catch(e => ({ error: String(e.message || e) }));
  if (r.error) { toast(r.error, 'bad'); return; }
  let n = 0, read = 0;
  for (const f of r.files || []) {
    try { const x = await apiJson(`/api/registry/${f.where}/${encodeURIComponent(f.name)}`); if (x.error) throw new Error(x.error); n += RH.ingest(x.content, f.name); read++; }
    catch { /* not a registry package: skip */ }
  }
  await RH.save();
  toast(`${read} ${tr('package(s) read')} · ${n} ${tr('new card(s)')}` + (r.shared ? '' : ' · ' + tr('no shared folder set — outbox only')), 'good');
}

/* ---------------- contribute ---------------- */
async function contribute(body, sec) {
  const ws = S.ws;
  if (!RH.privileged()) { body.append(banner('bad', 'Privileged users only', 'Sharing risks with other organizations needs an administrator or the Accountable right (RACI “A”) on the Report step — management report, quality review and sharing. You can still browse the registry.')); return; }
  const redraw = () => { body.replaceChildren(); contribute(body, sec); };
  const base = (contrib.cat && contrib.cat._ws === ws.id) ? contrib.cat : (contrib.cat = { ...(await RH.catalogDefaults(ws)), _ws: ws.id });
  const scen = ws.assessment.SCEN;
  const t = table([
    { key: 'p', label: '', sortable: false, cls: 'cb', render: s => { const b = el('input', { type: 'checkbox', checked: contrib.picked.has(s.id) }); b.addEventListener('change', () => { b.checked ? contrib.picked.add(s.id) : contrib.picked.delete(s.id); }); return b; } },
    { key: 'id', label: 'ID', cls: 'mono' }, { key: 'name', label: 'Scenario', render: s => el('span', { 'data-noi18n': '' }, s.name) },
    { key: 'crgo', label: 'Ontology', render: s => s.crgo?.id ? pill(s.crgo.id, 'good') : el('span', 'small muted', 'not linked — themes will be empty') },
  ], scen, { class: 'compact' });
  const f = (k, input) => { input.addEventListener('change', () => { base[k] = input.value; }); return input; };
  const regs = el('input', { value: (base.regulations || []).join('; ') }); regs.addEventListener('change', () => { base.regulations = regs.value.split(/\s*;\s*/).filter(Boolean); });
  const ev = select(RH.EVIDENCE, contrib.evidence); ev.addEventListener('change', () => { contrib.evidence = ev.value; });
  const anonCb = el('input', { type: 'checkbox', checked: contrib.anon.enabled, style: { width: 'auto' } });
  anonCb.addEventListener('change', () => {
    if (!anonCb.checked && !window.confirm(tr('Share these risks WITHOUT anonymization? Other organizations will see your organization’s name, people and asset names. Confirm only if you are authorized to disclose them.'))) { anonCb.checked = true; return; }
    contrib.anon.enabled = anonCb.checked; redraw();
  });
  body.append(card(el('h2', { style: { marginTop: 0 } }, '1 · The risks to share'),
    el('p', 'note', 'Each ticked scenario becomes one risk card: the causal chain, the treatment, the values and the catalogue below. Link scenarios to the ontology first (Scenario editor → Ontology · CRGO) so their themes and asset categories travel with them.'),
    scen.length ? el('div', 'btnrow', el('button', { class: 'btn ghost sm', 'data-ro-ok': '', onclick: () => { scen.forEach(s => contrib.picked.add(s.id)); redraw(); } }, 'Tick all'),
      el('button', { class: 'btn ghost sm', 'data-ro-ok': '', onclick: () => { contrib.picked.clear(); redraw(); } }, 'Untick all')) : null,
    scen.length ? el('div', 'tablewrap', { style: { maxHeight: '40vh', overflow: 'auto' } }, t) : el('div', 'empty-state', 'No scenario in this workspace yet.')));
  body.append(card(el('h2', { style: { marginTop: 0 } }, '2 · How they are catalogued'),
    el('p', 'note', 'Filled from the organization profile; adjust them. Every dimension is optional, and each makes the card easier to find for organizations like yours.'),
    el('div', 'grid g4', field('Industry sector', f('sector', select(RH.SECTORS, base.sector))), field('Sub-sector', f('subsector', el('input', { value: base.subsector || '' }))),
      field('Region', f('region', select(RH.REGIONS, base.region))), field('Size', f('size', select(RH.SIZE_BANDS, base.size))),
      field('Regulations (separated by ;)', regs), field('Evidence level', ev), field('Maturity band', f('maturity', el('input', { value: base.maturity || '' }))),
      field('Valid for (months)', (() => { const i = el('input', { type: 'number', min: 1, max: 60, value: RH.H.settings.validityMonths }); i.addEventListener('change', async () => { RH.H.settings.validityMonths = Number(i.value) || 12; await RH.save(); }); return i; })())),
    el('details', null, el('summary', null, 'Why these dimensions'), el('ul', 'small', ...RH.DIMENSIONS.map(([, l, h]) => el('li', null, el('b', null, tr(l), ' — '), h))))));
  // build and preview
  const picked = scen.filter(s => contrib.picked.has(s.id));
  const cards = picked.map(s => RH.cardFromScenario(s, ws, { ...base, regulations: base.regulations || [] }, { evidence: contrib.evidence }));
  const { cards: anonCards, ctx } = contrib.anon.enabled ? RH.anonymize(cards, ws, contrib.anon, RH.H.settings.regionLevel) : { cards: cards.map(c => ({ ...c, anonymized: false })), ctx: null };
  const pkg = RH.pack(anonCards, { anonymized: contrib.anon.enabled });
  const text = JSON.stringify(pkg, null, 1);
  const leaks = contrib.anon.enabled ? [ws.org.name, ws.name, ...(ws.assets || []).map(a => a.name)].filter(x => x && x.length >= 4 && text.toLowerCase().includes(x.toLowerCase())) : [];
  const preview = el('textarea', { class: 'mono', readonly: true, style: { minHeight: '220px' } }); preview.value = text.slice(0, 15000);
  body.append(card(el('h2', { style: { marginTop: 0 } }, '3 · Anonymization'),
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'flex-start' } }, anonCb, el('span', null, el('b', null, 'Anonymize before sharing (on by default)'),
      el('div', 'small muted', `Organization, people and asset names, e-mail, IP addresses, internal hosts and amounts are replaced; the region is kept at ${RH.H.settings.regionLevel === 'country' ? 'country' : 'province or state'} level and the size as a band. Change the region level in Registry settings.`))),
    contrib.anon.enabled ? el('div', 'note', 'Replacements: ' + (ctx ? A.summary(ctx) : '—')) : banner('bad', 'Not anonymized', 'These cards identify your organization. Share them only with recipients authorized to see them.'),
    leaks.length ? banner('warn', 'Check these before sharing', 'Still present in the cards: ' + leaks.join(', ') + '. Add them under Publish & share → Additional terms, or edit the scenario text.') : null,
    el('h4', null, `Preview — ${anonCards.length} card(s)`), preview));
  body.append(card(el('h2', { style: { marginTop: 0 } }, '4 · Share'),
    el('div', 'btnrow',
      el('button', { class: 'btn', disabled: !anonCards.length, onclick: async () => {
        await probe(true);
        if (!HS.helper) { toast(tr('The helper is not running — download the package and put it in the shared folder.'), 'bad'); return; }
        try {
          const name = RH.packageName();
          const r = await post('/api/publish', { name, content: text, target: 'registry' });
          if (r.error) throw new Error(r.error);
          RH.ingest(pkg, name);
          RH.H.mine.push({ date: today(), file: name, where: r.outbox ? 'outbox' : 'shared folder', path: r.folder, uids: anonCards.map(c => c.uid), titles: anonCards.map(c => c.title), workspace: ws.name, anonymized: contrib.anon.enabled, by: users.name() || '' });
          await RH.save(); users.audit('registry contribution', `${anonCards.length} card(s) → ${name}`, ws);
          contrib.picked.clear(); toast(r.outbox ? tr('Shared to the outbox — the scheduled task uploads it') : tr('Shared to the registry folder'), 'good'); redraw();
        } catch (e) { toast(String(e.message || e), 'bad'); }
      } }, 'Share to the registry'),
      el('button', { class: 'btn ghost', disabled: !anonCards.length, onclick: async () => {
        const name = RH.packageName(); download(name, text, 'application/json');
        RH.H.mine.push({ date: today(), file: name, where: 'download', uids: anonCards.map(c => c.uid), titles: anonCards.map(c => c.title), workspace: ws.name, anonymized: contrib.anon.enabled, by: users.name() || '' });
        await RH.save(); toast(tr('Downloaded'));
      } }, 'Download the package')),
    el('p', 'note', link('registry_local_dir') ? `Shares to ${link('registry_local_dir')}.` : 'No shared registry folder is set: packages go to the outbox, which the scheduled task uploads to the Drive registry folder. Set a synced folder in Registry settings.')));
}

/* ---------------- my contributions ---------------- */
async function mine(body, sec) {
  const M = RH.H.mine.slice().reverse();
  body.append(card(M.length ? table([
    { key: 'date', label: 'Date', cls: 'mono' }, { key: 'file', label: 'Package', render: m => el('span', 'mono small', m.file) },
    { key: 'n', label: 'Cards', render: m => el('div', { class: 'small', 'data-noi18n': '' }, m.titles.slice(0, 4).join('; ') + (m.titles.length > 4 ? ` (+${m.titles.length - 4})` : '')) },
    { key: 'where', label: 'Where' }, { key: 'anonymized', label: 'Anonymized', render: m => m.anonymized ? pill('yes', 'good') : pill('no', 'warn') },
    { key: 'ws', label: 'Workspace', render: m => el('span', { 'data-noi18n': '' }, m.workspace || '') },
    { key: 'w', label: '', sortable: false, render: m => m.withdrawn ? pill('withdrawn', 'warn') : el('button', { class: 'btn sm ghost danger', onclick: async () => {
      if (!window.confirm(tr('Publish a withdrawal for these cards? Installations that read it will mark them withdrawn; copies already taken cannot be recalled.'))) return;
      const pkg = { schema: RH.SCHEMA, kind: 'withdrawal', generated: new Date().toISOString(), contributor: { alias: RH.H.settings.alias || 'Anonymous contributor' }, withdraw: m.uids, entries: [] };
      try { if (HS.helper) await post('/api/publish', { name: RH.packageName('withdrawal'), content: JSON.stringify(pkg), target: 'registry' }); else download(RH.packageName('withdrawal'), JSON.stringify(pkg), 'application/json'); }
      catch (e) { toast(String(e.message || e), 'bad'); return; }
      for (const u of m.uids) RH.H.moderation[u] = { state: 'rejected', by: 'contributor', date: today(), note: 'withdrawn by the contributor' };
      m.withdrawn = today(); await RH.save(); toast(tr('Withdrawal published')); body.replaceChildren(); mine(body, sec);
    } }, 'Withdraw') },
  ], M, { class: 'compact' }) : el('div', 'empty-state', el('b', null, 'Nothing shared yet'), 'Contributions from this computer are listed here.'),
  el('p', 'note', 'A withdrawal is itself a package: other installations apply it the next time they read the shared folder.')));
}

/* ---------------- moderation ---------------- */
async function moderate(body, sec) {
  if (!RH.privileged()) { body.append(banner('bad', 'Privileged users only', 'Moderation needs an administrator or the Accountable right (RACI “A”) on the Report step.')); return; }
  const redraw = () => { body.replaceChildren(); moderate(body, sec); };
  const all = Object.values(RH.H.entries);
  const pending = all.filter(c => RH.modState(c) === 'pending');
  const decide = async (c, state) => {
    const note = state === 'rejected' ? (window.prompt(tr('Reason (shown to readers of the curated package)'), '') || '') : '';
    RH.H.moderation[c.uid] = { state, by: users.name() || RH.H.settings.alias || 'moderator', date: today(), note };
    await RH.save(); users.audit('registry moderation', `${state}: ${c.title}`); redraw();
  };
  body.append(el('div', 'grid g3', kpi('Waiting', n0(pending.length), 'not moderated yet', pending.length ? 'warn' : 'good'),
    kpi('Approved', n0(all.filter(c => RH.modState(c) === 'approved').length), '', 'good'), kpi('Rejected or withdrawn', n0(all.filter(c => RH.modState(c) === 'rejected').length), '')));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Cards waiting for a decision'),
    el('p', 'note', 'Check that each card is anonymized, is a real causal chain rather than a threat name, and is catalogued sensibly. Approved cards go into the curated package that readers can restrict themselves to.'),
    pending.length ? table([
      { key: 'title', label: 'Risk', render: c => el('div', { 'data-noi18n': '' }, el('b', null, c.title), el('div', 'small muted', (c.statement || '').slice(0, 220))) },
      { key: 'anon', label: 'Anonymized', render: c => c.anonymized ? pill('yes', 'good') : pill('no', 'bad') },
      { key: 'from', label: 'From', render: c => el('span', { class: 'small', 'data-noi18n': '' }, `${c.contributor || ''} · ${c.published || ''}`) },
      { key: 'x', label: '', sortable: false, render: c => el('div', 'btnrow', el('button', { class: 'btn sm', onclick: () => decide(c, 'approved') }, 'Approve'), el('button', { class: 'btn sm ghost danger', onclick: () => decide(c, 'rejected') }, 'Reject')) },
    ], pending, { class: 'compact' }) : el('div', 'empty-state', 'Nothing waiting.')));
  const approved = all.filter(c => RH.modState(c) === 'approved' && !RH.stale(c));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Publish the curated package'),
    el('p', 'note', `${approved.length} approved, current card(s). The curated package is what readers see with “Moderated cards only”.`),
    el('div', 'btnrow', el('button', { class: 'btn', disabled: !approved.length, onclick: async () => {
      const pkg = RH.pack(approved.map(({ _source, _received, _curated, ...c }) => c), { kind: 'curated', alias: RH.H.settings.alias || 'Registry moderator' });
      const name = `crg-registry2-curated-${today()}.json`;
      try { if (HS.helper) { const r = await post('/api/publish', { name, content: JSON.stringify(pkg), target: 'registry' }); if (r.error) throw new Error(r.error); toast(tr('Curated package published'), 'good'); } else { download(name, JSON.stringify(pkg, null, 1), 'application/json'); } }
      catch (e) { toast(String(e.message || e), 'bad'); }
    } }, 'Publish the curated package'))));
}

/* ---------------- settings ---------------- */
async function settings(body, sec) {
  await loadConfig().catch(() => {});
  const s = RH.H.settings;
  const alias = el('input', { value: s.alias, placeholder: 'e.g. Quebec clinic network #3, or leave empty for “Anonymous contributor”' });
  const lvl = select([['province', 'Province or state (recommended)'], ['country', 'Country only']], s.regionLevel);
  const folder = el('input', { value: link('registry_local_dir'), placeholder: '~/Google Drive/My Drive/CyberRiskGuardian Registry' });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Registry settings'),
    el('div', 'grid g2', field('Contributor alias', alias, 'Shown on your cards instead of your organization’s name.'), field('Region granularity when anonymized', lvl),
      field('Shared registry folder on this computer', folder, 'A folder synced with Google Drive, OneDrive or SharePoint and shared with the other organizations. Empty: the helper’s outbox, uploaded by the scheduled task.')),
    el('div', 'btnrow', el('button', { class: 'btn', onclick: async () => {
      s.alias = alias.value.trim(); s.regionLevel = lvl.value; await RH.save();
      if (HS.helper && folder.value.trim() !== link('registry_local_dir')) { HS.config.links = { ...(HS.config.links || {}), registry_local_dir: folder.value.trim() }; try { await saveConfig(); } catch (e) { toast(String(e.message || e), 'bad'); } }
      toast(tr('Saved'));
    } }, 'Save'))));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'How the catalogue is organized'),
    el('p', 'note', 'Recommended dimensions. The ontology’s vocabularies (themes, asset categories, threat sources, impact dimensions) make cards from different organizations line up without anyone agreeing on words.'),
    table([{ key: 1, label: 'Dimension', render: d => el('b', null, d[1]) }, { key: 2, label: 'Why', render: d => d[2] }], RH.DIMENSIONS, { class: 'compact' })));
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Packages read on this computer'),
    RH.H.sources.length ? table([{ key: 'name', label: 'Package', render: x => el('span', 'mono small', x.name) }, { key: 'kind', label: 'Kind' }, { key: 'count', label: 'Cards', cls: 'num' }, { key: 'date', label: 'Read' }], RH.H.sources, { class: 'compact' })
      : el('div', 'small muted', 'None yet.'),
    el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn ghost danger', onclick: async () => {
      if (!window.confirm(tr('Forget every card read on this computer? Your contributions log and moderation decisions are kept.'))) return;
      RH.H.entries = {}; RH.H.sources = []; await RH.save(); toast(tr('Catalogue emptied')); body.replaceChildren(); settings(body, sec);
    } }, 'Forget the cards read'))));
}
