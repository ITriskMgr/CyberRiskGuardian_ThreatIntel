/* Ontology · CRGO (1.5.7; CRGO v0.10.0 read contracts in 1.6.0) — the CyberRiskGuardian Ontology inside the application.

   Suggest scenarios: the workspace described in the ontology's vocabulary (sector, asset categories,
   themes, ATT&CK techniques, keywords), a profile-wide sweep, and the candidates the analyst ticks go to
   the Batch scenarios grid with their ATT&CK techniques, weaknesses, controls (CSF 2.0, SP 800-53,
   ISO/IEC 27002) and Loi 25 obligations — and, if wanted, the ontology's calibration priors as
   starting values, labelled as such.
   Explore: one scenario in full, the controls the library associates with a technique, the scenarios
   a control addresses.
   Connection: where the ontology's MCP server is, whether it runs, and the snapshot used without it.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, chip, toast, banner, table, kpi, n0, go, field, select } from '../util.js';
import { S, touch } from '../state.js';
import * as C from '../crgo.js';
import { HS, loadConfig, saveConfig } from '../helper.js';
import { tr } from '../i18n.js';
import * as users from '../users.js';

let view = 'suggest';
let last = null;                  // { res, via, why, profile }
let values = null;                // { theme, asset_category, sector, threat_source_type, impact_dimension }
const opts = { usePriors: true, min: 'M', per: 3, max: 40, cases: true, holdout: false };

async function loadValues() {
  if (values) return values;
  const kinds = ['theme', 'asset_category', 'threat_source_type', 'impact_dimension', 'sector'];
  const out = {};
  for (const k of kinds) { try { out[k] = (await C.call('crgo_list_values', { kind: k })).result || []; } catch { out[k] = []; } }
  return (values = out);
}
export const vocabulary = loadValues;

export async function render(sec, arg) {
  if (['suggest', 'explore', 'link', 'connection'].includes(arg)) view = arg;
  sec.replaceChildren(el('h1', null, 'Ontology · CRGO'),
    el('p', 'lede', 'The CyberRiskGuardian Ontology: a library of risk scenarios with their ATT&CK techniques, weaknesses, controls (NIST CSF 2.0, SP 800-53, ISO/IEC 27002) and Quebec Law 25 obligations, reached through its own MCP server — the one Claude uses — or, without it, through the snapshot shipped with the application.'),
    banner('warn', 'Calibration priors, not evidence', tr('Ontology values are AI estimates (2023) for a fictitious healthcare organization or instructor values of teaching cases. They are starting points for a discussion with the organization: every value arrives tagged “{0}”.').replace('{0}', tr(C.MARK))));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['suggest', 'Suggest scenarios'], ['explore', 'Explore'], ['link', 'Organisation link'], ['connection', 'Connection']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; go('ontology/' + k); } }, t));
  const body = el('div'); sec.append(st, body);
  const link = async b => (await import('./ontology_link.js')).link(b, () => render(sec, 'link'));
  try { await ({ suggest, explore, link, connection }[view])(body, sec); }
  catch (e) { body.append(banner('bad', 'The ontology could not be read', String(e.message || e))); }
}

const viaPill = r => r.via === 'mcp' ? pill('MCP server', 'good') : pill(`snapshot ${r.version || ''}`, 'warn');
const keyLabel = (list, k) => (list || []).find(x => x.key === k)?.label || k;

/* ---------------- suggest ---------------- */
async function suggest(body, sec) {
  const ws = S.ws; ws.ontology ||= { themes: [] };
  const V = await loadValues();
  const prof = C.profileOf(ws);
  const P = (ws.ontology.profile ||= { sector: prof.sector, asset_categories: prof.asset_categories, techniques: prof.techniques, keywords: prof.keywords, themes: ws.ontology.themes || [] });
  const save = () => { ws.ontology.profile = P; ws.ontology.themes = P.themes; touch('ontology'); };

  const boxes = (list, sel, onChange) => el('div', 'chips', ...list.map(v => {
    const c = el('input', { type: 'checkbox', checked: sel.includes(v.key), style: { width: 'auto' } });
    c.addEventListener('change', () => onChange(v.key, c.checked));
    return el('label', { class: 'chip', style: { display: 'inline-flex', gap: '6px', alignItems: 'center', cursor: 'pointer' } }, c, el('span', null, v.label));
  }));
  const toggle = (arr, k, on) => { const i = arr.indexOf(k); if (on && i < 0) arr.push(k); if (!on && i >= 0) arr.splice(i, 1); save(); };
  const sector = el('input', { value: P.sector || '', placeholder: 'health, bank, retail, hospitality…' });
  sector.addEventListener('input', () => { P.sector = sector.value.trim(); save(); });
  const tech = el('input', { value: (P.techniques || []).join(', '), placeholder: 'T1566, T1486, T1190' });
  tech.addEventListener('input', () => { P.techniques = tech.value.split(/[,;\s]+/).map(x => x.trim().toUpperCase()).filter(x => /^T\d{4}(\.\d{3})?$/.test(x)); save(); });
  const kw = el('input', { value: (P.keywords || []).join(', '), placeholder: 'EHR, telehealth, MFA, HL7…' });
  kw.addEventListener('input', () => { P.keywords = kw.value.split(/\s*,\s*/).filter(Boolean); save(); });
  const minC = select([['H', 'High-confidence links only'], ['M', 'Approved links (high and medium)'], ['L', 'All links, including low-confidence suggestions']], opts.min);
  minC.addEventListener('change', () => { opts.min = minC.value; });
  const per = el('input', { type: 'number', min: 1, max: 10, value: opts.per }); per.addEventListener('input', () => { opts.per = Number(per.value) || 3; });
  const max = el('input', { type: 'number', min: 5, max: 120, value: opts.max }); max.addEventListener('input', () => { opts.max = Number(max.value) || 40; });
  const cases = el('input', { type: 'checkbox', checked: opts.cases, style: { width: 'auto' } }); cases.addEventListener('change', () => { opts.cases = cases.checked; });
  const blind = el('input', { type: 'checkbox', checked: opts.holdout, style: { width: 'auto' } }); blind.addEventListener('change', () => { opts.holdout = blind.checked; });
  const res = el('div');
  const reset = el('button', { class: 'btn ghost sm', 'data-ro-ok': '', onclick: () => { delete ws.ontology.profile; touch('ontology'); body.replaceChildren(); suggest(body, sec); } }, 'Rebuild from the workspace');

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'The organization, in the ontology’s terms'),
    el('p', 'note', 'Built from the profile, the information assets, the crown jewels and the ATT&CK techniques of the scenarios already in the register. Adjust it, then ask for suggestions. A scenario matches when it shares any element; the closest come first.'),
    el('div', 'grid g3', field('Sector', sector, 'A word found in the scenario’s sector'), field('ATT&CK techniques seen', tech, 'Incidents, threat intelligence, the register'), field('Keywords', kw, 'Notable systems or weaknesses; synonyms are expanded by the server')),
    el('h4', null, 'Asset categories present'), boxes(V.asset_category, P.asset_categories || (P.asset_categories = []), (k, on) => toggle(P.asset_categories, k, on)),
    el('h4', null, 'Themes of concern'), boxes(V.theme, P.themes || (P.themes = []), (k, on) => toggle(P.themes, k, on)),
    el('div', 'grid g4', { style: { marginTop: '10px' } }, field('Link confidence', minC), field('Per theme', per), field('At most', max),
      el('div', null, el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '22px' } }, cases, el('span', null, 'Include teaching-case scenarios')),
        el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center' } }, blind, el('span', null, 'Blind test: hold out the MediBec case')))),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', id: 'crgo-sweep', onclick: async e => {
      e.target.disabled = true; e.target.textContent = tr('Asking the ontology…');
      try {
        const args = { sector: P.sector || '', asset_categories: P.asset_categories || [], themes: P.themes || [], techniques: P.techniques || [], keywords: P.keywords || [],
          per_theme: opts.per, min_confidence: opts.min, include_cases: opts.cases, holdout: opts.holdout ? ['MediBec-CRG', 'MediBec'] : [], max_total: opts.max };
        const r = await C.call('crgo_sweep', args);
        last = { ...r, profile: args };
        ws.ontology.lastSweep = { at: new Date().toISOString(), via: r.via, returned: r.result.returned ?? r.result.scenarios?.length, gaps: r.result.theme_gaps || [] };
        touch('ontology');
        drawResults(res, V);
      } catch (err) { res.replaceChildren(banner('bad', 'The ontology could not answer', String(err.message || err))); }
      e.target.disabled = false; e.target.textContent = tr('Suggest scenarios');
    } }, 'Suggest scenarios'), reset)));
  body.append(res);
  if (last) drawResults(res, V);
}

function drawResults(box, V) {
  const ws = S.ws, r = last.result || {};
  const inReg = new Set((ws.assessment.SCEN || []).map(s => s.crgo?.id).filter(Boolean));
  const inGrid = new Set((ws.batchDraft || []).map(d => d.crgo?.id).filter(Boolean));
  const rows = (r.scenarios || []).map(s => ({ s, pick: !inReg.has(s.id) && !inGrid.has(s.id) }));
  const usePri = el('input', { type: 'checkbox', checked: opts.usePriors, style: { width: 'auto' } });
  usePri.addEventListener('change', () => { opts.usePriors = usePri.checked; });
  const detail = el('div');
  const t = table([
    { key: 'pick', label: '', sortable: false, cls: 'cb', render: x => { const c = el('input', { type: 'checkbox', checked: x.pick }); c.addEventListener('change', () => { x.pick = c.checked; }); return c; } },
    { key: 'name', label: 'Scenario', render: x => el('div', { 'data-noi18n': '' }, el('b', null, x.s.name), el('div', 'small muted mono', x.s.id + ' · ' + (x.s.kind || '') + (x.s.sector ? ' · ' + x.s.sector : '')),
      inReg.has(x.s.id) ? pill('already in the register', 'warn') : inGrid.has(x.s.id) ? pill('already in the Batch grid', 'warn') : null) },
    { key: 'themes', label: 'Themes', sortable: false, render: x => el('div', 'chips', ...(x.s.themes || []).map(th => chip(th.label || th.key))) },
    { key: 'tech', label: 'ATT&CK', sortable: false, render: x => el('div', 'small mono', (x.s.attack_techniques || []).map(t => t.id).join(', ') || '—') },
    { key: 'ctl', label: 'Controls', sortable: false, render: x => el('div', 'small', ['csf2', 'sp800-53r5', 'iso27002-2022'].map(fw => (x.s.controls?.[fw] || []).length).join(' / ')) },
    { key: 'risk', label: 'Prior risk', cls: 'num', render: x => x.s.estimated_risk != null ? el('span', { title: (x.s.risk_basis || '') + ' — ' + C.RISK_UNIT }, n0(x.s.estimated_risk)) : '—' },
    { key: 'see', label: 'Merged', cls: 'num', render: x => (x.s.see_also || []).length ? el('span', { title: (x.s.see_also || []).map(a => a.id + ' ' + a.name).join('\n') }, String(x.s.see_also.length)) : '' },
    { key: 'why', label: '', sortable: false, render: x => el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => showScenario(detail, x.s.id) }, 'Details') },
  ], rows, { class: 'compact' });
  box.replaceChildren(card(
    el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, 'Suggested scenarios'), viaPill(last)),
    last.via === 'snapshot' ? banner('warn', 'Answered by the snapshot', (last.why ? last.why + ' ' : '') + 'The shipped snapshot is queried with a simpler ranking than the server. Connection tells you how to reach the server.') : null,
    el('div', 'grid g4', kpi('Candidates', n0(r.candidates ?? rows.length), 'matching any element'), kpi('Distinct', n0(r.distinct ?? rows.length), 'after merging near-duplicates'),
      kpi('Shown', n0(rows.length), ''), kpi('Theme gaps', n0((r.theme_gaps || []).length), (r.theme_gaps || []).map(k => keyLabel(V.theme, k)).join(', ') || 'none', (r.theme_gaps || []).length ? 'warn' : 'good')),
    (r.theme_gaps || []).length ? banner('warn', 'Themes with no scenario in the ontology', 'Write these scenarios yourself (Scenario editor or Batch scenarios): ' + r.theme_gaps.map(k => keyLabel(V.theme, k)).join(', ') + '.') : null,
    rows.length ? el('div', 'tablewrap', { style: { maxHeight: '60vh', overflow: 'auto' } }, t) : el('div', 'empty-state', el('b', null, 'No scenario matched'), 'Tick more asset categories or themes, or widen the link confidence.'),
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', margin: '10px 0' } }, usePri,
      el('span', null, el('b', null, 'Use the ontology’s priors as starting values'), el('div', 'small muted', 'Case-calibrated values first, then the 2023 library; each parameter gets the rationale “Prior from the CyberRiskGuardian Ontology — not organizational evidence”, at Low confidence. Untick to start every parameter at 0.5.'))),
    el('div', 'btnrow', el('button', { class: 'btn', disabled: !rows.length, onclick: () => {
      const sel = rows.filter(x => x.pick);
      if (!sel.length) { toast(tr('Tick at least one scenario'), 'bad'); return; }
      ws.batchDraft ||= [];
      for (const x of sel) ws.batchDraft.push(C.toBatchRow(x.s, { usePriors: opts.usePriors }));
      users.audit('ontology scenarios to batch', `${sel.length} (${last.via})`, ws);
      touch('batch');
      toast(`${sel.length} ${tr('scenario(s) added to the Batch scenarios grid')}`, 'good');
      drawResults(box, V);
    } }, 'Add ticked to Batch scenarios'), el('button', { class: 'btn ghost', 'data-ro-ok': '', onclick: () => go('batch') }, 'Open Batch scenarios')),
    el('p', 'small muted', r.caveat || C.MARK)), detail);
}

async function showScenario(box, id) {
  box.replaceChildren(el('p', 'note', tr('Loading') + ' ' + id + '…'));
  try {
    const r = await C.call('crgo_scenario', { scenario_id: id, min_confidence: opts.min });
    const s = r.result;
    const P = C.priors(s);
    const list = (xs, f) => (xs || []).length ? el('ul', 'small', ...xs.map(x => el('li', { 'data-noi18n': '' }, f(x)))) : el('div', 'small muted', '—');
    box.replaceChildren(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 }, 'data-noi18n': '' }, s.name), viaPill(r)),
      el('p', { 'data-noi18n': '' }, s.statement || ''),
      el('div', 'grid g3',
        el('div', null, el('h4', null, 'ATT&CK techniques'), list(s.attack_techniques, t => `${t.id} ${t.title || ''} (${t.confidence})`)),
        el('div', null, el('h4', null, 'Weaknesses'), list(s.weaknesses, w => `${w.id} ${w.title || ''}`)),
        el('div', null, el('h4', null, 'Quebec Law 25 obligations'), list(s.obligations, o => `${o.id} — ${o.title}`))),
      el('div', 'grid g3', ...C.FRAMEWORKS.map(([fw, label]) => el('div', null, el('h4', null, label), list(s.controls?.[fw], c => `${c.id} ${c.title} (${c.confidence})`)))),
      P ? el('div', null, el('h4', null, 'Calibration priors (' + P.basis + ')'),
        el('div', 'small mono', ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu', 'cvss'].filter(k => P[k] != null).map(k => `${k}=${P[k]}`).join('  ')),
        el('div', 'small muted', C.MARK)) : null));
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) { box.replaceChildren(banner('bad', 'Could not load the scenario', String(e.message || e))); }
}

/* ---------------- explore ---------------- */
async function explore(body) {
  const out = el('div');
  const sid = el('input', { placeholder: 'LIB-F1436 or MediBec/MED-A1' });
  const tq = el('input', { placeholder: 'T1566' });
  const fw = select(C.FRAMEWORKS, 'csf2');
  const cq = el('input', { placeholder: 'PR.AA-05, SI-4 or 8.16' });
  body.append(el('div', 'grid g3',
    card(el('h3', { style: { marginTop: 0 } }, 'One scenario'), field('Identifier', sid), el('button', { class: 'btn sm', onclick: () => sid.value.trim() && showScenario(out, sid.value.trim()) }, 'Show')),
    card(el('h3', { style: { marginTop: 0 } }, 'Controls for a technique'), field('ATT&CK technique', tq), el('button', { class: 'btn sm', onclick: async () => {
      const t = tq.value.trim().toUpperCase(); if (!t) return;
      try {
        const r = await C.call('crgo_controls_for_technique', { technique: t, min_confidence: opts.min, top: 10 });
        const x = r.result;
        out.replaceChildren(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, `${x.technique}${x.name ? ' — ' + x.name : ''}`), viaPill(r)),
          x.replaced_by ? banner('warn', 'Revoked identifier', `Replaced by ${x.replaced_by}.`) : null,
          el('p', 'note', `${n0(x.scenarios)} ${tr('library scenarios use this technique. The controls most often linked to them:')}`),
          el('div', 'grid g3', ...Object.entries(x.controls || {}).map(([k, list]) => el('div', null, el('h4', null, (C.FRAMEWORKS.find(f => f[0] === k) || [k, k])[1]),
            el('ol', 'small', ...list.map(c => el('li', { 'data-noi18n': '' }, `${c.id} ${c.title} · ${c.scenarios}`))))))));
      } catch (e) { out.replaceChildren(banner('bad', 'No answer', String(e.message || e))); }
    } }, 'Show')),
    card(el('h3', { style: { marginTop: 0 } }, 'Scenarios a control addresses'), field('Framework', fw), field('Control', cq), el('button', { class: 'btn sm', onclick: async () => {
      if (!cq.value.trim()) return;
      try {
        const r = await C.call('crgo_scenarios_for_control', { framework: fw.value, control_id: cq.value.trim(), min_confidence: opts.min, limit: 50 });
        const x = r.result;
        out.replaceChildren(card(el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { margin: 0, flex: 1 } }, `${x.control} — ${x.title || ''}`), viaPill(r)),
          el('p', 'note', `${n0(x.matches)} ${tr('library scenarios are addressed by this control.')}`),
          table([{ key: 'id', label: 'ID', cls: 'mono' }, { key: 'name', label: 'Scenario', render: s => el('span', { 'data-noi18n': '' }, s.name) }, { key: 'confidence', label: 'Confidence' },
            { key: 'x', label: '', sortable: false, render: s => el('button', { class: 'btn sm ghost', 'data-ro-ok': '', onclick: () => showScenario(out, s.id) }, 'Details') }], x.scenarios || [], { class: 'compact' })));
      } catch (e) { out.replaceChildren(banner('bad', 'No answer', String(e.message || e))); }
    } }, 'Show'))), out);
}

/* ---------------- connection ---------------- */
async function connection(body, sec) {
  const st = await C.status();
  let snap = null; try { snap = await C.snapshot(); } catch { /* shown below */ }
  await loadConfig().catch(() => {});
  const o = (HS.config.ontology ||= {});
  const srcLabel = { settings: 'set in Settings', 'claude-desktop': 'taken from the Claude desktop configuration', found: 'found next to the application', none: 'not found' };
  body.append(el('div', 'grid g4',
    kpi('MCP server', st.running ? 'running' : st.usable ? 'ready' : 'unavailable', st.source ? srcLabel[st.source] || st.source : '', st.running || st.usable ? 'good' : 'warn'),
    kpi('Last answer from', C.state.via === 'mcp' ? 'the MCP server' : C.state.via === 'snapshot' ? 'the snapshot' : '—', C.state.last ? String(C.state.last).slice(0, 16).replace('T', ' ') : ''),
    kpi('Snapshot', snap ? 'CRGO ' + snap.version : 'missing', snap ? `${n0(snap.scenarios.length)} scenarios · built ${snap.built}` : '', snap ? 'good' : 'bad'),
    kpi('Local helper', st.helper === false ? 'not running' : 'running', st.helper === false ? 'start the app with its launcher' : '', st.helper === false ? 'warn' : 'good')));
  if (st.problem) body.append(banner('warn', 'The MCP server cannot be used', st.problem));
  // 1.5.8 — the release of the ontology found, and whether the dss/v1 contract can be used with it
  // 1.6.0 — and whether the read contracts compliance/v1 and secops/v1 (CRGO v0.10.0) can be used
  if (st.release) body.append(st.release.contractUsable
    ? banner('good', tr('CRGO v{0} (ontology release {1})').replace('{0}', st.release.tag || '?').replace('{1}', st.release.ontology || '?'),
      st.release.viewsUsable ? 'Scenario identification, organisation context and write-back (dss/v1), and the compliance and security-operations contexts (compliance/v1, secops/v1) are available.'
        : 'Scenario identification, organisation context and write-back (dss/v1) are available.')
    : banner('warn', tr('CRGO v{0}: the dss/v1 contract is not available').replace('{0}', st.release.tag || '?'), st.release.contractProblem || ''));
  if (st.release?.contractUsable && !st.release.viewsUsable) body.append(banner('warn', tr('CRGO v{0}: the compliance and security-operations contexts need CRGO v0.10.0').replace('{0}', st.release.tag || '?'), st.release.viewsProblem || ''));
  if (st.command) body.append(card(el('h2', { style: { marginTop: 0 } }, 'How the server is started'),
    el('div', 'mono small', { 'data-noi18n': '' }, [st.command, ...(st.args || [])].join(' ')),
    st.file ? el('p', 'small muted', null, 'From ', el('span', { class: 'mono', 'data-noi18n': '' }, st.file)) : null,
    st.info?.server ? el('p', 'small', `${st.info.server.name} · ${(st.info.tools || []).length} ${tr('tools')} · ${tr('protocol')} ${st.info.protocol || ''}`) : null,
    (st.stderr || []).length ? el('details', null, el('summary', null, 'Server messages'), el('pre', { class: 'small', 'data-noi18n': '' }, st.stderr.join('\n'))) : null,
    el('div', 'btnrow', el('button', { class: 'btn', disabled: !st.usable, onclick: async e => {
      e.target.disabled = true;
      try { const { post } = await import('../helper.js'); const r = await post('/api/crgo/restart', {}); if (r.error) throw new Error(r.error); toast(tr('Ontology server started'), 'good'); }
      catch (err) { toast(String(err.message || err), 'bad'); }
      body.replaceChildren(); connection(body, sec);
    } }, st.running ? 'Restart the server' : 'Start the server'))));
  // settings
  const cmd = el('input', { value: o.command || '', placeholder: '/usr/local/bin/python3' });
  const script = el('input', { value: (o.args || [])[0] || '', placeholder: '~/CyberRiskGuardian_ThreatIntel/CyberRiskGuardian-Ontology/pipeline/mcp/crgo_server.py' });
  const on = el('input', { type: 'checkbox', checked: o.enabled !== false, style: { width: 'auto' } });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Where the ontology is'),
    el('p', 'note', 'Leave both fields empty to reuse the crgo-ontology server registered in Claude on this computer, or to find a CyberRiskGuardian-Ontology folder next to the application. The server needs Python with the mcp and pyoxigraph packages; it reads only its own files and sends nothing anywhere.'),
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center' } }, on, el('span', null, 'Use the ontology’s MCP server (untick to use the snapshot only)')),
    el('div', 'grid g2', field('Python interpreter', cmd), field('Server script (crgo_server.py)', script)),
    el('div', 'btnrow', el('button', { class: 'btn', disabled: !HS.helper, onclick: async () => {
      HS.config.ontology = { enabled: on.checked, ...(cmd.value.trim() && script.value.trim() ? { command: cmd.value.trim(), args: [script.value.trim()] } : {}) };
      try { await saveConfig(); toast(tr('Saved')); } catch (e) { toast(String(e.message || e), 'bad'); }
      body.replaceChildren(); connection(body, sec);
    } }, 'Save'), HS.helper ? null : el('span', 'small muted', 'The helper must be running to save this.'))));
  if (snap) body.append(card(el('h2', { style: { marginTop: 0 } }, 'The snapshot shipped with the application'),
    el('p', 'note', `${snap.title} ${snap.version} — ${n0(snap.scenarios.length)} scenarios. ${snap.licence}`),
    el('p', 'small muted', snap.caveat)));
}
