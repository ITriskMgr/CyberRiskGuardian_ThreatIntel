/* SIEM — alerts and triage, threat indicators and TLP (Beta 1.6.x).
   An alert is never an incident; an indicator match is never an attribution; source confidence is
   never a probability. TLP 2.0 travels with every record, in screens and in exports.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, n0, today, toast, modal, select, download } from '../util.js';
import { touch } from '../state.js';
import * as G from '../grcui.js';
import * as M from '../siem.js';
import * as LOG from '../logs.js';
import * as users from '../users.js';
import * as store from '../store.js';
import { tr } from '../i18n.js';
import { asOfBar, noIncident, data } from './siem.js';

export const tlpPill = t => { const v = M.normTlp(t) || 'AMBER'; return pill('TLP:' + v, M.TLP_KIND[v]); };

/**
 * A CSV export that respects TLP: when the list holds TLP:RED or TLP:AMBER+STRICT items, ask whether
 * to leave them out or to keep them marked. Every row carries its TLP in the first column.
 */
export function tlpExport(name, header, rows, project, tlpOf = r => r.tlp) {
  const n = rows.filter(r => M.TLP_RESTRICTED.has(M.normTlp(tlpOf(r)) || 'AMBER')).length;
  const go = mode => { const out = M.tlpCsv(header, rows, mode, project, tlpOf);
    const fn = `${name}-${today()}${mode === 'mark' && out.restricted ? '-contains-TLP-RED-or-AMBER-STRICT' : ''}.csv`;
    download(fn, out.csv, 'text/csv'); LOG.data('TLP-aware export', fn, `${out.kept.length} rows · ${out.excluded} restricted left out · ${out.restricted} restricted kept, marked`); return out; };
  if (!n) return go('exclude');
  const m = modal(tr('TLP-restricted items'),
    el('p', null, tr('{0} item(s) are marked TLP:RED or TLP:AMBER+STRICT. TLP:RED is for the named recipients only; TLP:AMBER+STRICT stays inside the organization.').replace('{0}', n)),
    el('p', 'note', 'Leave them out unless every recipient of this file is entitled to them. Kept items are marked in the TLP column and in the file name.'),
    el('div', 'btnrow', el('button', { class: 'btn', id: 'tlp-exclude', onclick: () => { m.close(); go('exclude'); } }, 'Export without them'),
      el('button', { class: 'btn ghost', id: 'tlp-mark', onclick: () => { m.close(); go('mark'); } }, 'Include them, marked'),
      el('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancel')));
  return null;
}

/* ---------------- alerts ---------------- */
let filter = 'open';
const sevLabel = s => tr(M.SEVERITY.find(x => x[0] === s)?.[1] || s || '—');
const triLabel = s => tr(M.TRIAGE.find(x => x[0] === s)?.[1] || s);

function setTriage(a, to, c) {
  if (to === 'escalated') { const r = M.escalate(a, c.ws, users.name() || ''); toast(tr(r.reused ? 'Already escalated: SOAR case {0}' : 'SOAR case {0} opened').replace('{0}', r.case.id)); c.redraw(); return; }
  if (a.triage === 'escalated') { toast(tr('An escalated alert is followed in its SOAR case.'), 'warn'); c.redraw(); return; }
  const from = a.triage || 'new'; a.triage = to; (a.notes ||= []).push({ date: today(), by: users.name() || '', text: `Triage: ${from} → ${to}` });
  LOG.data('alert triage', a.id, `${from} → ${to}`, c.ws.name); touch(); c.redraw();
}

export function alertsTab(body, c) {
  const ws = c.ws, R = M.reg(ws);
  body.append(noIncident());
  const file = el('input', { type: 'file', id: 'siem-alert-file', multiple: true, accept: '.json,.csv,application/json,text/csv' });
  file.addEventListener('change', async () => { for (const f of file.files) { const rec = await M.importText(await f.text(), { fileName: f.name, ws, by: users.name() || '' }); toast(tr('{0} alert(s) added, {1} duplicate(s)').replace('{0}', rec.counts.alerts || 0).replace('{1}', rec.counts.duplicates || 0), rec.errors.length ? 'warn' : 'good'); } c.redraw(); });
  const flt = select([['open', 'To triage (new, in triage)'], ['all', 'All alerts'], ...M.TRIAGE], filter, { id: 'siem-alert-filter' });
  flt.addEventListener('change', () => { filter = flt.value; c.redraw(); });
  const q = M.triageQueue(ws).filter(x => filter === 'all' ? true : filter === 'open' ? M.openAlert(x.a) : (x.a.triage || 'new') === filter);
  const cols = [
    { key: 'crown', label: 'Crown jewel', render: x => x.crown ? pill(tr('Crown jewel'), 'bad') : '', sort: x => x.crown ? 1 : 0 },
    { key: 'score', label: 'Priority', num: true, render: x => el('span', { title: tr('Severity weighted by asset criticality; crown jewels first') }, n0(x.score)) },
    { key: 'id', label: 'Id', render: x => data(x.a.id, 'mono') }, { key: 'title', label: 'Alert', render: x => data(x.a.title) },
    { key: 'sev', label: 'Severity', render: x => sevLabel(x.a.severity), sort: x => ['low', 'medium', 'high', 'critical'].indexOf(x.a.severity) },
    { key: 'asset', label: 'Asset', render: x => el('span', null, data(x.a.asset || '—'), x.crit !== null ? el('span', 'small muted', ` (${n0(x.crit)})`) : null) },
    { key: 'rule', label: 'Rule', render: x => data(x.a.ruleId ? `${x.a.ruleId}${x.a.ruleVersion ? ' v' + x.a.ruleVersion : ''}` : '—', 'mono') },
    { key: 'detected', label: 'Detected', render: x => data((x.a.detected || '').replace('T', ' ').slice(0, 16) || '—', 'mono'), sort: x => x.a.detected || '' },
    { key: 'tlp', label: 'TLP', render: x => tlpPill(x.a.tlp) },
    { key: 'triage', label: 'Triage', sortable: false, render: x => { const s = select(M.TRIAGE.map(([k, t]) => [k, tr(t)]), x.a.triage || 'new', { 'aria-label': tr('Triage state'), class: 'siem-triage' }); s.addEventListener('change', () => setTriage(x.a, s.value, c)); return s; } },
    { key: '_', label: '', sortable: false, render: x => el('div', 'btnrow', x.a.caseId ? pill(x.a.caseId, 'bad') : el('button', { class: 'btn sm', 'data-escalate': x.a.id, onclick: () => setTriage(x.a, 'escalated', c) }, 'Escalate to a SOAR case'),
      el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => openAlert(x.a, c) }, 'Open')) }];
  body.append(card(el('div', 'row', { style: { alignItems: 'center', gap: '8px' } }, el('h2', { style: { margin: 0, flex: 1 } }, `${tr('Alert queue')} (${q.length})`), flt,
      el('button', { class: 'btn sm ghost', 'data-ro-ok': '', disabled: !R.alerts.length, onclick: () => tlpExport('crg-siem-alerts', ['id', 'external_id', 'source_system', 'title', 'rule_id', 'rule_version', 'detected', 'severity', 'asset', 'crown_jewel', 'triage', 'case'],
        M.triageQueue(ws).map(x => x.a), a => [a.id, a.externalId, a.sourceSystem, a.title, a.ruleId, a.ruleVersion, a.detected, a.severity, a.asset, M.isCrownJewel(a.asset, ws) ? 'yes' : '', a.triage, a.caseId || '']) }, '.csv')),
    el('div', 'row', { style: { alignItems: 'center', gap: '8px', margin: '8px 0' } }, el('label', { for: 'siem-alert-file' }, tr('Import alerts (JSON, CSV or STIX 2.1 bundle)')), file),
    q.length ? el('div', 'tablewrap', table(cols, q, { class: 'compact', rowClass: x => x.crown ? 'crown' : '' })) : el('div', 'empty-state', tr('No alert in this view.'))));
}

function openAlert(a, c) {
  const ws = c.ws, R = M.reg(ws), w = M.triageWeight(a, ws);
  const note = el('input', { type: 'text', 'data-noi18n': '', placeholder: tr('Add a triage note') });
  const ind = (a.indicators || []).map(id => R.indicators.find(i => i.id === id) || { id, value: '?' });
  const kv = (k, v) => el('tr', null, el('th', null, tr(k)), el('td', null, v instanceof Node ? v : data(v || '—')));
  const m = modal(`${a.id} · ${a.title}`,
    noIncident(),
    el('table', 'compact', el('tbody', null,
      kv('Source system', a.sourceSystem), kv('External id', a.externalId), kv('Version', String(a.version || 1)), kv('Rule', a.ruleId ? `${a.ruleId} v${a.ruleVersion || '?'}` : '—'),
      kv('Detected', a.detected), kv('First seen', a.firstSeen), kv('Severity', sevLabel(a.severity)),
      kv('Source confidence', a.confidence !== null && a.confidence !== undefined ? el('span', null, data(`${a.confidence} / 100`), el('span', 'small muted', ' — ' + tr('as stated by the source; not a probability'))) : '—'),
      kv('Asset', el('span', null, data(a.asset || '—'), w.crown ? pill(tr('Crown jewel'), 'bad') : null, w.crit !== null ? el('span', 'small muted', ` ${tr('criticality')} ${n0(w.crit)}`) : null)),
      kv('Techniques', (a.techniques || []).join(', ')), kv('OCSF class', M.ocsfLabel(a.ocsfClass)), kv('TLP', tlpPill(a.tlp)), kv('Triage', triLabel(a.triage || 'new')), kv('SOAR case', a.caseId || '—'),
      kv('Raw event in the SIEM', a.rawRef || '—'))),
    ind.length ? el('div', null, el('h3', null, 'Matched indicators'), el('p', 'note', 'An indicator match is not an attribution and not proof of compromise.'),
      table([{ key: 'id', label: 'Id', render: i => data(i.id, 'mono') }, { key: 'value', label: 'Indicator', render: i => data(i.value, 'mono') }, { key: 'tlp', label: 'TLP', render: i => tlpPill(i.tlp) },
        { key: 'st', label: 'Validity', render: i => M.indicatorStale(i, today()) ? pill(tr('Stale — no inference'), 'warn') : pill(tr('Valid'), 'good') }], ind, { class: 'compact' })) : null,
    (a.events || []).length ? el('div', null, el('h3', null, 'Event records (pointers)'), table([{ key: 'ref', label: 'Reference', render: e => data(e.ref, 'mono') }, { key: 'sourceId', label: 'Source', render: e => data(e.sourceId || '—') },
      { key: 'sourceTime', label: 'Event time', render: e => data(e.sourceTime || '—', 'mono') }, { key: 'hash', label: 'Hash', render: e => data((e.hash || '—').slice(0, 24), 'mono') }], a.events, { class: 'compact' })) : null,
    el('h3', null, 'Triage notes'), el('div', null, ...(a.notes || []).map(n => el('div', 'small', data(`${n.date} · ${n.by || '—'} · ${n.text}`)))),
    el('div', 'row', { style: { gap: '8px', marginTop: '6px' } }, note, el('button', { class: 'btn sm', onclick: () => { if (!note.value.trim()) return; (a.notes ||= []).push({ date: today(), by: users.name() || '', text: note.value.trim() }); touch(); m.close(); openAlert(a, c); } }, 'Add note')),
    a.original ? el('details', null, el('summary', null, tr('Original record as imported (never modified)')), el('pre', { 'data-noi18n': '', style: { whiteSpace: 'pre-wrap', maxHeight: '220px', overflow: 'auto' } }, a.original)) : null);
  m.back.onclose = () => c.redraw();
}

/* ---------------- indicators & TLP ---------------- */
let feedCache = null;
async function feedIocs() {
  if (!feedCache) { const b = (await store.get('blob', 'feeds:items').catch(() => null)) || { bySrc: {} }; feedCache = Object.values(b.bySrc || {}).flatMap(x => x.items || []); }
  const m = new Map(); for (const it of feedCache) for (const x of it.iocs || []) { const k = String(x.value).toLowerCase(); m.set(k, (m.get(k) || 0) + 1); } return m;
}
/** One row per indicator value across the SIEM indicators, the IOC watch list and the loaded feeds. */
export function mergeRows(ws, feed = new Map(), asOf = today()) {
  const R = M.reg(ws), rows = new Map();
  const row = v => { const k = String(v).toLowerCase(); if (!rows.has(k)) rows.set(k, { value: v, type: '', siem: null, watch: null, feeds: feed.get(k) || 0, tlp: '', tlpNote: '', alerts: [] }); return rows.get(k); };
  for (const i of R.indicators) if (i.value) { const r = row(i.value); r.siem = i; r.type = i.type; r.tlp = i.tlp; r.tlpNote = 'marked'; }
  for (const w of ws.iocWatch || []) { const r = row(w.value); r.watch = w; r.type ||= w.type;
    if (!r.siem) { r.tlp = M.normTlp(w.tlp) || (w.src === 'analyst' ? 'AMBER' : 'CLEAR'); r.tlpNote = M.normTlp(w.tlp) ? 'marked' : w.src === 'analyst' ? 'assumed — analyst entry, unmarked' : 'assumed — public feed'; } }
  for (const r of rows.values()) r.alerts = R.alerts.filter(a => r.siem && (a.indicators || []).includes(r.siem.id)).map(a => a.id);
  return [...rows.values()].map(r => ({ ...r, stale: r.siem ? M.indicatorStale(r.siem, asOf) : false }));
}

export function intelTab(body, c) {
  const ws = c.ws, R = M.reg(ws);
  body.append(asOfBar(c, 'An indicator is stale after its valid-until date or when revoked.'));
  body.append(banner('warn', 'Confidence is not a probability', 'Source confidence (0–100) is what the producer states, kept with its method. It never feeds Pb(A), Pb(ψ,A) or any other parameter. An indicator match is not an attribution and not proof of compromise; a stale indicator supports no inference.'));
  body.append(G.register({ title: 'Threat indicators', rows: R.indicators, prefix: 'IND', redraw: c.redraw, csv: false,
    fields: [{ key: 'type', label: 'Type', type: 'select', options: [['domain-name', 'Domain name'], ['ipv4-addr', 'IPv4 address'], ['ipv6-addr', 'IPv6 address'], ['url', 'URL'], ['email-addr', 'Email address'], ['file:sha256', 'File SHA-256'], ['file:sha1', 'File SHA-1'], ['file:md5', 'File MD5'], ['other', 'Other']] },
      { key: 'value', label: 'Value', type: 'text', wide: true }, { key: 'name', label: 'Name', type: 'text', wide: true }, { key: 'pattern', label: 'STIX pattern (generated when empty)', type: 'text', wide: true },
      { key: 'validFrom', label: 'Valid from', type: 'date' }, { key: 'validUntil', label: 'Valid until', type: 'date' },
      { key: 'confidence', label: 'Source confidence (0–100, as stated — not a probability)', type: 'number' }, { key: 'confidenceMethod', label: 'Confidence method', type: 'text' },
      { key: 'source', label: 'Intelligence source', type: 'text' }, { key: 'tlp', label: 'TLP 2.0 marking', type: 'select', options: M.TLP },
      { key: 'techniques', label: 'Techniques (e.g. T1078)', type: 'list' }, { key: 'revoked', label: 'Revoked by the producer', type: 'check' }],
    blank: () => ({ type: 'domain-name', tlp: 'AMBER', patternType: 'stix', sightings: [], techniques: [], created: today() }),
    validate: r => { if (!String(r.value || '').trim()) return 'An indicator needs a value.'; if (r.confidence !== null && r.confidence !== undefined && (r.confidence < 0 || r.confidence > 100)) return 'Source confidence is a 0–100 scale as stated by the source.';
      if (!r.pattern) r.pattern = M.patternOf(r.type, r.value.trim()); return null; },
    columns: ['id', { key: 'tlp', label: 'TLP', render: r => tlpPill(r.tlp), sort: r => M.TLP.findIndex(t => t[0] === r.tlp) },
      { key: 'value', label: 'Indicator', render: r => el('span', null, data(r.value, 'mono'), r.name ? el('div', 'small muted', data(r.name)) : null) }, { key: 'type', label: 'Type', render: r => data(r.type) },
      { key: 'confidence', label: 'Source confidence', render: r => r.confidence === null || r.confidence === undefined ? '—' : el('span', { title: tr('as stated by the source; not a probability') }, data(`${r.confidence} / 100`)) },
      { key: 'source', label: 'Source', render: r => data(r.source || '—') }, { key: 'validUntil', label: 'Valid until', render: r => data(r.validUntil ? r.validUntil.slice(0, 10) : '—', 'mono') },
      { key: 'st', label: 'Validity', render: r => M.indicatorStale(r, c.asOf) ? pill(tr('Stale — no inference'), 'warn') : pill(tr('Valid'), 'good') },
      { key: 'sightings', label: 'Sightings', num: true, render: r => n0((r.sightings || []).length) }] }));
  const exp = el('button', { class: 'btn sm ghost', 'data-ro-ok': '', id: 'siem-ind-csv', disabled: !R.indicators.length, onclick: () => tlpExport('crg-siem-indicators', ['id', 'type', 'value', 'name', 'valid_from', 'valid_until', 'source_confidence_0_100', 'confidence_method', 'source', 'revoked'],
    R.indicators, i => [i.id, i.type, i.value, i.name, i.validFrom, i.validUntil, i.confidence ?? '', i.confidenceMethod, i.source, i.revoked ? 'yes' : '']) }, 'Export indicators (.csv)');
  body.append(el('div', 'btnrow', { style: { margin: '-6px 0 14px' } }, exp));
  // merge view with the threat feeds (read-only)
  const box = el('div', null, el('div', 'small muted', tr('Loading the threat feeds…')));
  body.append(card(el('h2', null, 'Indicators across SIEM and threat feeds'),
    el('p', 'note', 'Read-only view joining the SIEM indicators, the IOC watch list of Threat feeds & social and the indicators found in the loaded feeds. Items from public feeds carry no marking: they are shown as TLP:CLEAR (assumed); unmarked analyst entries as TLP:AMBER (assumed).'), box));
  feedIocs().then(feed => {
    const rows = mergeRows(ws, feed, c.asOf);
    box.replaceChildren(rows.length ? el('div', null,
      el('div', 'btnrow', { style: { marginBottom: '6px' } }, el('button', { class: 'btn sm ghost', 'data-ro-ok': '', id: 'siem-merge-csv', onclick: () => tlpExport('crg-indicators-merged', ['value', 'type', 'tlp_basis', 'siem_indicator', 'ioc_watch_status', 'in_loaded_feeds', 'alerts'],
        rows, r => [r.value, r.type, r.tlpNote, r.siem?.id || '', r.watch?.status || '', r.feeds, r.alerts.join(' ')]) }, '.csv')),
      el('div', 'tablewrap', table([{ key: 'tlp', label: 'TLP', render: r => el('span', null, tlpPill(r.tlp), r.tlpNote !== 'marked' ? el('div', 'small muted', tr(r.tlpNote)) : null) },
        { key: 'value', label: 'Indicator', render: r => data(r.value, 'mono') }, { key: 'type', label: 'Type', render: r => data(r.type || '—') },
        { key: 'siem', label: 'SIEM indicator', render: r => r.siem ? el('span', null, data(r.siem.id + ' '), r.stale ? pill(tr('Stale — no inference'), 'warn') : null) : '—' },
        { key: 'watch', label: 'IOC watch list', render: r => r.watch ? data(r.watch.status) : '—' }, { key: 'feeds', label: 'In loaded feeds', num: true, render: r => n0(r.feeds) },
        { key: 'alerts', label: 'Alerts', render: r => data(r.alerts.join(', ') || '—') }], rows, { class: 'compact' }))) : el('div', 'empty-state', tr('No indicator in the SIEM nor on the IOC watch list.')));
  });
}
