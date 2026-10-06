/* Publish & share (1.4.0) — publish the risk register (with its threats and vulnerabilities) and the scenario
   registry, anonymized on request, as JSON (crg-registry/1), Markdown or CSV: download, copy, or publish to the
   shared registry folder (Google Drive, through a synced local folder or the outbox uploaded by the scheduled
   task). Import registries published by others as a library. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, card, pill, chip, select, toast, table, banner, download, copyText, field, today, go } from '../util.js';
import { S, touch, nextScenarioId, normalizeScenario } from '../state.js';
import { HS, probe, loadConfig, post, apiJson, link } from '../helper.js';
import * as G from '../registry.js';
import * as A from '../anon.js';

const opt = { risks: true, scenarios: true, measures: false, scope: 'all', fmt: 'json', anon: { ...A.DEFAULT_OPTS } };
let view = 'publish', lib = null;

/* 1.5.6 — the Drive registry folder is the analyst's own and ships unset. Offer the link when there is
   one, and the way to set one when there is not; never an anchor with an empty address. */
function driveBtn() {
  const url = link('drive_registry');
  return url
    ? el('a', { class: 'btn ghost', href: url, target: '_blank', rel: 'noopener noreferrer' }, 'Open the Drive registry folder')
    : el('button', { class: 'btn ghost', onclick: () => go('settings/links') }, 'Set a shared registry folder…');
}

export async function render(sec) {
  await Promise.all([probe(true), loadConfig()]);
  const ws = S.ws;
  if (ws.kind !== 'organization' && opt._kind !== ws.kind) { opt._kind = ws.kind; }
  sec.replaceChildren(el('h1', null, 'Publish & share'), el('p', 'lede', 'Share the risk register and the scenario registry with management, auditors, partners or a community of practice — anonymized when they leave the organization. Packages are built on this computer; nothing is sent unless you publish to the shared folder.'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['publish', 'Publish a package'], ['history', `Publications (${(ws.published || []).length})`], ['library', 'Import a shared registry']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ publish, history, library }[view])(body, sec);
}

function names(p) {
  const base = `crg-registry-${(p.anonymized ? 'anon' : (S.ws.org.name || S.ws.name)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)}-${today()}`;
  return base;
}
function outputs(p) {
  const base = names(p);
  if (opt.fmt === 'json') return [{ name: base + '.json', content: JSON.stringify(p, null, 1), type: 'application/json' }];
  if (opt.fmt === 'md') return [{ name: base + '.md', content: G.toMarkdown(p), type: 'text/markdown' }];
  const c = G.toCSVs(p);
  return Object.entries(c).map(([k, v]) => ({ name: `${base}-${k}.csv`, content: v, type: 'text/csv' }));
}

function publish(body, sec) {
  const ws = S.ws, o = opt, a = o.anon;
  const cb = (obj, k, label, hint, redraw = true) => { const b = el('input', { type: 'checkbox', checked: !!obj[k], style: { width: 'auto' } }); b.addEventListener('change', () => { obj[k] = b.checked; if (redraw) render(sec); }); return el('label', { style: { display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--ink)', marginBottom: '6px' } }, b, el('span', null, label, hint ? el('div', 'small muted', hint) : null)); };
  const scope = select([['all', 'Everything'], ['included', 'Included scenarios and open risks only']], o.scope); scope.addEventListener('change', () => { o.scope = scope.value; render(sec); });
  const fmt = select([['json', 'JSON — crg-registry/1 (re-importable)'], ['md', 'Markdown report'], ['csv', 'CSV tables']], o.fmt); fmt.addEventListener('change', () => { o.fmt = fmt.value; render(sec); });
  const custom = el('textarea', { placeholder: 'One term per line, optionally "term => replacement" — e.g. names of suppliers, projects, sites' }, a.custom || '');
  custom.addEventListener('change', () => { a.custom = custom.value; render(sec); });
  const { pkg, ctx } = G.buildPackage(ws, { risks: o.risks, scenarios: o.scenarios, measures: o.measures, scope: o.scope, anon: a });
  const outs = outputs(pkg);
  const preview = el('textarea', { class: 'mono', readonly: true, style: { minHeight: '260px' } }, outs[0].content.slice(0, 12000) + (outs[0].content.length > 12000 ? '\n… (preview truncated)' : ''));
  const leaks = a.enabled ? residual(outs.map(x => x.content).join('\n'), ws) : [];
  const nR = (pkg.risks || []).length, nS = (pkg.scenarios || []).length;
  body.append(el('div', 'grid g2',
    card(el('h2', { style: { marginTop: 0 } }, '1 · Content'),
      cb(o, 'risks', `Risk register (${(ws.risks || []).length} risks)`, 'With threats (ATT&CK), vulnerabilities (CVE/CWE, KEV, exposure), assets, measures and treatment.'),
      cb(o, 'scenarios', `Scenario registry (${ws.assessment.SCEN.length} scenarios)`, 'Statements, causal chain, parameters with confidence, CVSS, results.'),
      cb(o, 'measures', `Mitigation measures (${(ws.measures || []).length})`),
      field('Scope', scope), field('Format', fmt),
      !(ws.risks || []).length && o.risks ? banner('warn', 'The risk register is empty', el('span', null, 'Create risks in ', el('a', { href: '#/riskreg' }, 'Risk register'), ' (one click creates them from the scenarios).')) : null),
    card(el('h2', { style: { marginTop: 0 } }, '2 · Anonymization'),
      cb(a, 'enabled', el('b', null, 'Anonymize this package'), ws.kind === 'organization' ? 'Recommended for anything that leaves the organization.' : 'Teaching cases are fictional; anonymize anyway to practise.'),
      a.enabled ? el('div', { style: { paddingLeft: '22px' } }, ...Object.entries(A.OPT_LABEL).map(([k, l]) => cb(a, k, l)), field('Additional terms to replace', custom)) : null,
      a.enabled ? el('div', 'note', 'Replacements: ' + A.summary(ctx)) : banner('warn', 'Not anonymized', 'The package carries the organization\'s name, people, assets and free text as entered.'))));
  body.append(card(el('h2', { style: { marginTop: 0 } }, `3 · Preview — ${outs.map(x => x.name).join(', ')}`),
    leaks.length ? banner('warn', 'Check these before publishing', el('div', null, 'Terms from the workspace that are still present in the package: ', ...leaks.slice(0, 20).map(t => chip(t)), el('div', 'small', 'Add them to “Additional terms to replace”, or confirm they are not identifying.'))) : a.enabled ? banner('good', 'No known identifying term found', 'The organization name, people and asset names of this workspace do not appear in the package. Read the preview anyway: free text can identify an organization indirectly.') : null,
    el('div', 'small muted', `${nR} risks · ${nS} scenarios · ${(pkg.threats || []).length} techniques · ${(pkg.vulnerabilities || []).length} vulnerabilities`), preview));
  const target = link('registry_local_dir') ? `the synced folder ${link('registry_local_dir')}` : 'the outbox (feeds folder → registry-outbox), uploaded to Drive by the scheduled task';
  const record = (where, path) => { (ws.published ||= []).push({ date: new Date().toISOString().slice(0, 16).replace('T', ' '), files: outs.map(x => x.name), where, path: path || '', anonymized: !!a.enabled,
    replacements: a.enabled ? { ...ctx.counts } : null, risks: nR, scenarios: nS, format: o.fmt }); if (a.enabled) ws.published[ws.published.length - 1].mapping = ctx.map; touch(); };
  body.append(card(el('h2', { style: { marginTop: 0 } }, '4 · Publish or share'),
    el('div', 'btnrow',
      el('button', { class: 'btn', onclick: () => { for (const x of outs) download(x.name, x.content, x.type); record('download'); toast('Downloaded'); } }, 'Download'),
      el('button', { class: 'btn', disabled: !HS.helper, title: HS.helper ? 'Write to ' + target : 'Start the helper', onclick: async () => {
        try { let last; for (const x of outs) last = await post('/api/publish', { name: x.name, content: x.content, target: 'registry' }); record(last.outbox ? 'outbox' : 'registry folder', last.folder); toast(last.outbox ? 'Saved in the outbox — the scheduled task uploads it to Drive' : 'Published to the shared registry folder'); render(sec); }
        catch (e) { toast(e.message, 'bad'); }
      } }, 'Publish to the shared registry'),
      el('button', { class: 'btn ghost', onclick: e => { copyText(outs[0].content, e.target); record('clipboard'); } }, 'Copy'),
      driveBtn()),
    el('p', 'note', HS.helper ? `Publish writes to ${target}. Change the shared folders in Settings → Links & shared folders.` : 'Start the app with its launcher to publish to the shared folder; Download works anyway — then put the file wherever you share things.'),
    !a.enabled && ws.kind === 'organization' ? banner('bad', 'Not anonymized', 'You are about to share identifiable organizational risk information. Confirm the recipients are authorized.') : null));
}

/** Workspace terms still present in the output (organization, people, assets, suppliers). */
function residual(text, ws) {
  const t = text.toLowerCase();
  const terms = new Set([ws.org.name, ws.name, ...(ws.assets || []).map(x => x.name), ...(ws.assets || []).map(x => x.hostname),
    ...[...ws.assessment.SCEN.map(s => s.owner), ...(ws.risks || []).map(r => r.owner)].filter(o => o && /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(o))]
    .filter(Boolean).map(x => x.replace(/\(.*?\)/g, '').replace(/\s*[—–-]\s.*$/, '').trim()).filter(x => x.length >= 4));
  return [...terms].filter(x => t.includes(x.toLowerCase()));
}

function history(body, sec) {
  const P = (S.ws.published || []).slice().reverse();
  body.append(card(P.length ? table([
    { key: 'date', label: 'Date', cls: 'mono' }, { key: 'files', label: 'Files', render: p => p.files.join(', ') }, { key: 'where', label: 'Where', render: p => p.where + (p.path ? ' — ' + p.path : '') },
    { key: 'anonymized', label: 'Anonymized', render: p => p.anonymized ? pill('yes', 'good') : pill('no', 'warn') },
    { key: 'n', label: 'Content', render: p => `${p.risks} risks · ${p.scenarios} scenarios` },
    { key: 'map', label: '', sortable: false, render: p => p.mapping ? el('button', { class: 'btn sm ghost', title: 'Re-identification table — keep it private', onclick: () => download(`reidentification-${p.date.slice(0, 10)}.json`, JSON.stringify(p.mapping, null, 1), 'application/json') }, 'Mapping') : '' },
  ], P, { class: 'compact' }) : el('div', 'empty-state', el('b', null, 'Nothing published yet'), 'Publications are logged here with their anonymization settings.'),
  el('p', 'note', 'The re-identification table (original → placeholder) of each anonymized publication stays in this workspace and is never included in a package. Keep exported mappings private.')));
}

function library(body, sec) {
  const ws = S.ws;
  const fileIn = el('input', { type: 'file', accept: '.json', multiple: true });
  const out = el('div');
  const load = async files => {
    lib = { scenarios: [], risks: [], src: [] };
    for (const f of files) {
      try { const j = JSON.parse(typeof f === 'string' ? f : await f.text()); if (j.schema !== 'crg-registry/1') throw new Error('not a crg-registry/1 package');
        const tag = `${j.organization?.name || 'shared'} ${j.generated?.slice(0, 10) || ''}`;
        lib.src.push(tag); for (const s of j.scenarios || []) lib.scenarios.push({ ...s, _from: tag, _pick: true }); for (const r of j.risks || []) lib.risks.push({ ...r, _from: tag, _pick: false });
      } catch (e) { toast((f.name || 'file') + ': ' + e.message, 'bad'); }
    }
    draw();
  };
  const draw = () => {
    if (!lib) return;
    out.replaceChildren(card(el('h4', null, `${lib.scenarios.length} scenario(s) and ${lib.risks.length} risk(s) from ${lib.src.join(', ')}`),
      el('div', 'tablewrap', table([
        { key: 'p', label: '', sortable: false, cls: 'cb', render: s => { const b = el('input', { type: 'checkbox', checked: s._pick }); b.addEventListener('change', () => { s._pick = b.checked; }); return b; } },
        { key: 'id', label: 'ID', cls: 'mono' }, { key: 'name', label: 'Scenario', render: s => el('div', null, el('b', null, s.name), el('div', 'small muted', (s.statement || '').slice(0, 200))) },
        { key: 'attack', label: 'ATT&CK', render: s => (s.attack || []).join(', ') }, { key: 'r', label: 'Ratio', num: true, render: s => s.results?.ratio ?? '—' }, { key: '_from', label: 'From' },
      ], lib.scenarios, { class: 'compact' })),
      el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: () => {
        let n = 0;
        for (const s of lib.scenarios.filter(x => x._pick)) {
          const ns = normalizeScenario({ id: nextScenarioId(), ref: s.id, name: s.name, statement: s.statement, stakeholders: s.stakeholders || '', threat_source: s.threat_source || '', threat_event: s.threat_event || '',
            vulns: s.vulnerabilities || [], assets: s.assets || '', processes: s.processes || '', controls: s.existing_controls || [], sequence: s.sequence || [], consequences: s.consequences || {},
            params: Object.fromEntries(Object.entries(s.params || {}).map(([k, p]) => [k, { v: Number(p.v), conf: 'Low', rat: 'Imported from a shared registry — re-estimate for this organization', ev: s._from }])),
            cvss: s.cvss, red_p: Number(s.red_p) || 0.5, red_i: Number(s.red_i) || 0.5, attack: s.attack || [], cwe: s.cwe || [], cves: (s.cves || []).map(c => c.id || c), origin: 'library: ' + s._from, created: today() });
          ws.assessment.SCEN.push(ns); ws.excluded = [...new Set([...(ws.excluded || []), ns.id])]; n++;
        }
        (ws.library ||= []).push({ date: today(), from: lib.src.join(', '), scenarios: n });
        touch(); toast(n + ' scenario(s) imported — excluded from the calculator until you review them'); lib = null; render(sec);
      } }, 'Import ticked scenarios'), el('span', 'small muted', 'Imported scenarios are excluded from the calculator until reviewed: their parameters describe another organization.'))));
  };
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Import a shared registry'),
    el('p', 'note', 'Load crg-registry/1 packages published by colleagues or a community of practice (for example from the Drive registry folder) and reuse their scenarios as starting points.'),
    el('div', 'row', field('Package file(s)', fileIn), el('button', { class: 'btn', onclick: () => load([...fileIn.files]) }, 'Read'),
      HS.helper ? el('button', { class: 'btn ghost', onclick: async () => { const r = await apiJson('/api/outbox').catch(() => ({ files: [] })); toast(`${r.files.length} file(s) waiting in the outbox`); } }, 'Check the outbox') : null,
      driveBtn()),
    out));
  draw();
}
